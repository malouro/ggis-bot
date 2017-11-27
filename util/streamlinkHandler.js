/**
 * StreamLink Handler
 * 
 * Handles all StreamLink functions, from all the !streamlink commands to all TwitchPS events emitted
 * 
 */

const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const settings = require('../settings.json');

const RegExChannelName = /^[^_\W\s][a-zA-Z0-9_]{3,24}$/

/**
 * @func init
 * Initialize StreamLink elements -->
 *  *  @param {Discord.Client} bot
 *      @property {} bot.streamLink => {
 *          bot.streamLink contains all updated information (in realtime) about StreamLink connections and channel status
 *          bot.streamLink.conf contains general config and info
 *          @property {Object} conf => {
 *              @property {Boolean} reconnect Is reconnect enabled for the initial topics set in TwitchPS call?
 *              @property {Boolean} debug Is debug enabled for the initial topics set in TwitchPS call?
 *              @property {Object} defaults { Default values for certain things when elements are created
 *                  @property {Boolean} userEnable
 *                  @property {Boolean} guildEnable
 *                  @property {Integer} timer
 *                  @property {Integer} splitValue
 *              }
 *          },
 *          @property {Collection} users (Snowflake, Object) => {
 *              Here, every user that is StreamLinked will be listed in a Map that uses
 *              their Discord ID Snowflake as the keys.
 *              @var {Object} DiscordUserID => {
 *                  @property {Snowflake} id: Discord User ID
 *                  @property {String} name: Discord User Name
 *                  @property {Boolean} isUser: (always true for users) [Deprecated]
 *                  @property {Boolean} enabled: Is the user enabled?
 *                  @property {String} stream: Twitch.tv channel name
 *                  @property {Boolean} status: Is the stream online or offline?
 *                  @property {String} game: The game currently being streamed, if available (otherwise, blank string)
 *                  @property {Integer} viewers: Number of current viewers
 *                  @property {Date} lastBroadcast: Last time stream went up
 *                  @property {Date} lastOffline: Last time stream went down
 *              }
 *          }
 *          @property {Collection} guilds (Snowflake, Object) => {
 *              Every guild that the bot is connected to will show up here
 *              @var {Object} DiscordGuildID => {
 *                  @property {Snowflake} id: Discord Guild ID
 *                  @property {Boolean} isGuild: (always true for guilds) [Deprecated]
 *                  @property {Boolean} enabled: Is StreamLink enabled on this server?
 *                  @property {Array [Snowflake]} channels: Text-channels to push notifications to
 *                  @property {Array [Snowflake]} usersEnabled: List of user IDs that have enabled StreamLink here
 *                  @property {Array [Snowflake]} banList: List of user IDs of users that are StreamLink banned
 *                  @property {Integer} timer: Timer threshold for notifications to be pushed
 *                  @property {String} style: The style for the StreamLink notifications on this server
 *                      { can be "standard", "compact", "minimal", or "noembed" }
 *              }
 *          }
 *      }
 */
exports.init = bot => {
    return new Promise((resolve, reject) => {
        try {
            let users = new Discord.Collection();
            let guilds = new Discord.Collection();
            const path = './config/streamlink';
            bot.streamLink.conf = JSON.parse(fs.readFileSync(`${path}/conf.json`, 'utf8'));
            var topics = [];

            console.log(chalk.bgMagenta.bold(`StreamLink connections:`));
            fs.readdir(`${path}/users`, 'utf8', (err, files) => {

                files.forEach(f => {
                    let conf = JSON.parse(fs.readFileSync(`${path}/users/${f}`, 'utf8'));
                    users.set(conf.id, conf);
                    topics.push({ topic: `video-playback.${conf.stream.toLowerCase()}` });
                    console.log(chalk.bgMagenta(`User: ${conf.name} => Stream: https://www.twitch.tv/${conf.stream}`));
                });
                bot.streamLink.users = users;
                fs.readdir(`${path}/guilds`, 'utf8', (err, files) => {
                    files.forEach(f => {
                        let conf = JSON.parse(fs.readFileSync(`${path}/guilds/${f}`, 'utf8'));
                        guilds.set(conf.id, conf);
                        console.log(chalk.bgMagenta.black(`Guild: ${conf.id} => Enabled?: ${conf.enabled}, Users: ${conf.usersEnabled}`));
                    });
                    bot.streamLink.guilds = guilds;
                    resolve({ topics: topics, client: bot });
                });
            });
        } catch (err) {
            reject(err);
        }
    })
};

/**
 * @func streamUp
 * 
 *  @param {Discord.Client} bot
 *  @param {Object} data
 *      TwitchPS 'stream-up' content:
 *      @prop {Number} time - server time in RFC 3339 format (seconds)
 *      @prop {String} channel_name - name of Twitch Channel
 *      @prop {String} play_delay - delay of stream
 * 
 * Sets user's status to True (online)
 * Sets user's lastBroadcast to data.time
 * Try to get game user is playing (thru Discord)
 * Send notification to eligible text channels
 *      --> Get guilds that have StreamLink enabled
 *      --> Get guilds that have that user enabled
 *      --> Send to all SL channels in those SL guilds
 */
exports.streamUp = (bot, data) => {
    var user = bot.streamLink.users.find('stream', data.channel_name.toLowerCase()) || '';
    if (user === '') return console.log(`[${moment().format(settings.timeformat)}] User is undefined in streamlinkHandler.streamUp for channel ${data.channel_name}`);

    bot.fetchUser(user.id).then(u => {
        try {
            let difference = Number(data.time) - Number(user.lastBroadcast);

            user.status = true;
            user.lastBroadcast = data.time;
            user.game = (u.presence.game !== null) ? u.presence.game.name : '';
            bot.streamLink.users.set(user.id, user);

            this.saveUser(user).then(
                this.logEvent('stream-up', u, user)
            ).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${err}`)));

            if (!user.enabled) return;

            let embed = new Discord.RichEmbed()
                .setTitle("StreamLink Update <:streamLink:376115635702202370>")
                .setDescription(`${u} has gone live on Twitch!`)
                .setColor(0x5a4194)

            bot.streamLink.guilds.forEach(guild => {
                if (!bot.guilds.has(guild.id)) return;
                if (guild.usersEnabled.includes(user.id) && bot.guilds.get(guild.id).members.has(user.id) && guild.enabled) {
                    if (difference >= guild.timer * 60) {
                        let customEmbed = embed;
                        if (guild.style !== 'minimal') customEmbed.setThumbnail(u.avatarURL);
                        customEmbed.addField("Info:", `${u.username} is now live${(u.presence.game !== null) ? ` & streaming **${u.presence.game.name}**!` : `!`} Check it out here:${(guild.style !== 'standard') ? `\n\nhttps://www.twitch.tv/${user.stream}` : ''}`);
                        guild.channels.forEach(channel => {
                            let c = bot.channels.get(channel);
                            c.send({ embed: customEmbed })
                                .then(() => { if (guild.style === 'standard') c.send(`https://www.twitch.tv/${user.stream}`); })
                                .catch(console.error);
                        });
                    }
                }
            });
        } catch (err) { console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${err}`)); }
    }).catch(err => {
        console.log(chalk.bgMagenta(`[${moment().format()}] Error fetching user (channel: ${data.channel_name}) in streamlinkHandler.streamUp!\n${err}`))
    });
}

/**
 * @func streamDown
 * 
 *  @param {Discord.Client} bot
 *  @param {Object} data: {
 *      TwitchPS 'stream-down' content:
 *      @prop {Number} time - server time in RFC 3339 format (seconds)
 *      @prop {String} channel_name - name of Twitch Channel
 * }
 * 
 * Sets user's status to False (offline)
 * Sets user's lastOffline to data.time
 * Reset user's viewer count to 0
 */
exports.streamDown = (bot, data) => {
    let user = bot.streamLink.users.find('stream', data.channel_name.toLowerCase()) || '';
    if (user === '') return console.log(`[${moment().format(settings.timeformat)}] User is undefined in streamlinkHandler.streamDown for channel ${data.channel_name}`);

    bot.fetchUser(user.id).then(u => {
        try {
            user.status = false;
            user.viewers = 0;
            user.lastOffline = data.time;
            bot.streamLink.users.set(user.id, user);

            this.saveUser(user).then(
                this.logEvent('stream-down', u, user)
            ).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${err}`)));
        } catch (err) { console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${err}`)); }
    }).catch(err => {
        console.log(chalk.bgMagenta(`[${moment().format()}] Error fetching user (channel: ${data.channel_name}) in streamlinkHandler.streamDown!\n${err}`))
    });
}

/**
 * @func viewCount
 * 
 *  @param {Discord.Client} bot
 *  @param {Object} data {
 *      TwitchPS 'viewcount' content:
 *      @prop {Number} time - server time in RFC 3339 format (seconds)
 *      @prop {String} channel_name - name of Twitch Channel
 *  }
 * 
 * Checks if the user's game (Playing: ...) has changed
 * Update viewer count
 */
exports.viewCount = (bot, data) => {
    let user = bot.streamLink.users.find('stream', data.channel_name.toLowerCase()) || '';
    if (user === '') return console.log(`[${moment().format(settings.timeformat)}] User is undefined in streamlinkHandler.viewCount for channel ${data.channel_name}`);

    bot.fetchUser(user.id).then(u => {
        try {
            if (!user.status) return;
            if (u.presence.game !== null) {
                if (user.game !== u.presence.game.name) {
                    user.game = u.presence.game.name;
                }
            }
            user.viewers = data.viewers;
            this.saveUser(user).then().catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${err}`)));
        } catch (err) { console.log(err); }
    }).catch(err => {
        console.log(chalk.bgMagenta(`[${moment().format()}] Error fetching user (channel: ${data.channel_name}) in streamlinkHandler.viewCount!\n${err}`))
    });
}

/**
 * @func enableUser
 * !streamlink enable (@user)
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.User} user
 * 
 */
exports.enableUser = (message, bot, user) => {
    if (!bot.streamLink.guilds.has(message.guild.id)) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
        return message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
    }

    if (!bot.streamLink.users.has(user.id)) return message.reply(`Oops! Something went wrong.\n\nIt appears that there is no StreamLink connection set up for ${message.author}. Use \`${settings.prefix}streamlink add twitchName\` to set one up!`);

    let guild = bot.streamLink.guilds.get(message.guild.id);

    if (guild.usersEnabled.indexOf(user.id) > -1) {
        return message.reply(`This user is already enabled on this server! Check \`${settings.prefix}streamlink status\` to see what connections are active on this server.`);
    } else {
        guild.usersEnabled.push(user.id);
        this.saveGuild(guild).then(() => {
            bot.streamLink.guilds.set(message.guild.id, guild);
            message.reply(`The StreamLink connection for ${user} has been **enabled** on this server! :vibration_mode:`);
        }).catch(err => console.log(err));
    }
}

/**
 * @func disableUser
 * !streamlink disable (@user)
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.User} user
 * 
 */
exports.disableUser = (message, bot, user) => {
    if (!bot.streamLink.guilds.has(message.guild.id)) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
        return message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
    }

    if (!bot.streamLink.users.has(user.id)) return message.reply(`Oops! Something went wrong.\n\nIt appears that there is no StreamLink connection set up for ${message.author}. Use \`${settings.prefix}streamlink add twitchName\` to set one up!`);

    let guild = bot.streamLink.guilds.get(message.guild.id);

    if (guild.usersEnabled.indexOf(user.id) === -1) {
        return message.reply(`This user is already disabled on this server! Check \`${settings.prefix}streamlink status\` to see what connections are active on this server.`);
    } else {
        guild.usersEnabled.splice(guild.usersEnabled.indexOf(user.id), 1);
        this.saveGuild(guild).then(() => {
            bot.streamLink.guilds.set(guild.id, guild);
            message.reply(`The StreamLink connection for ${user} has been **disabled** on this server! :mobile_phone_off:`);
        }).catch(err => console.log(err));
    }
}

/**
 * @func enableGuild
 * !streamlink disable (@user)
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.User} user
 * 
 */
exports.enableGuild = (message, bot) => {
    if (!bot.streamLink.guilds.has(message.guild.id)) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
        return message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
    }

    let guild = bot.streamLink.guilds.get(message.guild.id);
    guild.enabled = true;

    this.saveGuild(guild).then(() => {
        bot.streamLink.guilds.set(message.guild.id, guild);
        message.reply(`StreamLink is now **enabled** on ${message.guild}! :ok:`);
    }).catch(err => console.log(err));
}

/**
 * @func disableGuild
 * !streamlink disable (@user)
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.User} user
 * 
 */
exports.disableGuild = (message, bot) => {
    if (!bot.streamLink.guilds.has(message.guild.id)) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
        return message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
    }

    let guild = bot.streamLink.guilds.get(message.guild.id);
    guild.enabled = false;

    this.saveGuild(guild).then(() => {
        bot.streamLink.guilds.set(message.guild.id, guild);
        message.reply(`StreamLink is now **disabled** on ${message.guild} :no_entry_sign:`);
    }).catch(err => console.log(err));
}

/**
 * @func addUser 
 * !streamlink add [stream] (@user)
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {String} stream Twitch.tv channel name
 *  @param {Discord.User} user Discord user object
 * 
 *  Adds a StreamLink connection for a given user, given the user id, name, and Twitch stream
 */
exports.addUser = (message, bot, stream, user) => {
    let object; let userToAdd; let existed; let oldStream;
    if (!stream) return message.reply(`Oops! Something went wrong.\n\nIt appears that no stream name was given with the command usage! Proper format is \`${settings.prefix}streamlink add twitchName\` where \`twitchName\` is your Twitch.tv user name (ie: the end of the URL for your stream <https://www.twitch.tv/THIS_PART_HERE>)`);
    if (!stream.match(RegExChannelName)) return message.reply(`The given Twitch.tv channel name doesn't comply with the Twitch.tv username requirements! (must be between 4-25 characters, alphanumeric or underscores ONLY [a-zA-Z0-9_])`);

    stream = stream.toLowerCase();

    if (user) {
        if (message.guild.members.has(user.id)) userToAdd = user;
        else {
            message.reply(`Oops! Something went wrong.\n\nThe specified Discord user doesn't seem to exist (or at least not on this server)`);
            return console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${message.author.username} failed to add a StreamLink connection. User ID#${user.id} was not found.`));
        }
    } else {
        userToAdd = message.author;
    }

    if (bot.streamLink.users.has(userToAdd.id)) {
        existed = true;
        object = bot.streamLink.users.get(userToAdd.id);
        oldStream = object.stream;
    } else {
        existed = false;
        object = JSON.parse(fs.readFileSync('./config/streamlink/conf.json', 'utf8')).defaults.userObject;
    }

    object.id = userToAdd.id;
    object.name = userToAdd.username;
    object.stream = stream;

    if (!bot.streamLink.guilds.has(message.guild.id)) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.addUser`));
        return message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
    } else if (!existed) {
        bot.streamLink.guilds.get(message.guild.id).usersEnabled.push(userToAdd.id);
    }

    this.saveUser(object).then(() => {
        if (existed) bot.removeTwitchTopic(oldStream);
        bot.addTwitchTopic(stream);
        bot.streamLink.users.set(object.id, object);
        if (existed) message.reply(`StreamLink connection for ${userToAdd} has been editted and is now connected to <https://www.twitch.tv/${object.stream}> and is currently ${(object.enabled) ? '**enabled**. :vibration_mode:' : '**disabled**. :mobile_phone_off:'} ✅`);
        else message.reply(`StreamLink connection established for ${userToAdd} at <https://www.twitch.tv/${object.stream}> and has been **enabled** on this server. ✅`);
        console.log(chalk.bgMagenta(`[${moment().format(settings.timeformat)}] ${message.author.username} ${existed ? 'editted' : 'added'} a StreamLink connection!\nUser: ${userToAdd.username}\nID: ${userToAdd.id}\nTwitch: https://www.twitch.tv/${stream.toLowerCase()}`));
    }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${err}`)));
}

/**
 * @func removeUser 
 * !streamlink remove (@user)
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.User} user Discord user object
 * 
 *  Remove a previously established StreamLink connection for a given user
 */
exports.removeUser = (message, bot, user) => {
    if (!user && message) user = message.author;
    if (!bot.streamLink.users.has(user.id)) return message.reply(`Oops! Something went wrong.\n\nIt appears that there is no StreamLink connection set up for ${message.author}. Use \`${settings.prefix}streamlink add twitchName\` to set one up!`);
    if (!message.guild.members.has(user.id)) {
        message.reply(`Oops! Something went wrong.\n\nThe specified Discord user doesn't seem to exist (or at least not on this server)`);
        return console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${message.author.username} failed to add a StreamLink connection. User ID#${user.id} was not found.`));
    }

    let guilds = bot.streamLink.guilds.filter(guild => guild.usersEnabled.includes(user.id));
    guilds.forEach(g => g.usersEnabled.splice(g.usersEnabled.indexOf(user.id), 1));

    fs.unlink(`./config/streamlink/users/${user.id}.json`, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                message.reply(`Oops! Something went wrong.\n\nLooks like the user's config has already been removed from the local directory.`);
                return console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${message.author.username} failed to remove a StreamLink connection. File ${user.id}.json was not found.`));
            } else throw err;
        }
        message.reply(`StreamLink connection & info has been deleted for ${user}, who was connected to the stream at <https://www.twitch.tv/${bot.streamLink.users.get(user.id).stream}> ❌`);
        console.log(chalk.bgMagenta(`[${moment().format(settings.timeformat)}] ${message.author.username} removed a StreamLink connection!\nUser: ${user.username}\nID: ${user.id}\nTwitch: https://www.twitch.tv/${bot.streamLink.users.get(user.id).stream}`));
        bot.removeTwitchTopic(bot.streamLink.users.get(user.id).stream);
        bot.streamLink.users.delete(user.id);
    });
}

/**
 * @func addGuild 
 * Discord event -- guildCreate (passes Guild)
 * 
 *  @param {Discord.Client} bot
 *  @param {Discord.Guild} guild
 * 
 *  Adds config for a new guild
 */
exports.addGuild = (bot, guild) => {
    if (!bot.streamLink.guilds.has(guild.id)) {
        let object = JSON.parse(fs.readFileSync('./config/streamlink/conf.json', 'utf8')).defaults.guildObject;
        object.id = guild.id;
        fs.writeFile(`./config/streamlink/guilds/${guild.id}.json`, JSON.stringify(object), (err) => {
            if (err) throw err;
            bot.streamLink.guilds.set(guild.id, object);
            console.log(chalk.bgMagenta(`[${moment().format(settings.timeformat)}] Wrote to /config/streamlink/guilds/${guild.id}.json OK! (in streamlinkHandler.addGuild)\nJoined Guild "${guild.name}"! (ID ${guild.id})`));
        });
    }
}

/**
 * @func removeGuild 
 * Discord event -- guildDelete (passes Guild)
 * 
 *  @param {Discord.Client} bot
 *  @param {Discord.Guild} guild
 * 
 *  Removes saved info for guild
 */
exports.removeGuild = (bot, guild) => {
    if (bot.streamLink.guilds.has(guild.id)) {
        fs.unlink(`./config/streamlink/guilds/${guild.id}.json`, (err) => {
            if (err && err.code !== 'ENOENT') return console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Failed to remove guild "${guild.name}" (ID ${guild.id})\n${err}`));
            bot.streamLink.guilds.delete(guild.id);
            console.log(chalk.bgMagenta(`[${moment().format(settings.timeformat)}] Wrote to /config/streamlink/guilds/${guild.id}.json OK! (in streamlinkHandler.removeGuild)\nRemoved Guild "${guild.name}"! (ID ${guild.id})`));
        });
    }
}

/**
 * @func addChannel
 * !streamlink add channel
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.Chananel} channel
 * 
 * Adds text channel for StreamLink notifications
 */
exports.addChannel = (message, bot, channel) => {
    if (!bot.streamLink.guilds.has(message.guild.id)) {
        message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
        return console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${message.author.username} failed to add a channel to ${message.guild}. Guild not in bot.streamLink.guilds!`));
    }

    if (bot.streamLink.guilds.get(message.guild.id).channels.includes(channel.id)) {
        return message.reply(`The ${channel} channel is already set up for StreamLink notifications. ✅`);
    } else {
        let guild = bot.streamLink.guilds.get(message.guild.id);
        guild.channels.push(channel.id);
        fs.writeFile(`./config/streamlink/guilds/${message.guild.id}.json`, JSON.stringify(guild), (err) => {
            if (err) throw err;
            bot.streamLink.guilds.set(message.guild.id, guild);
            message.reply(`This channel has been **added** to this server's StreamLink notification list. ${channel} will now receive & push StreamLink notifications. :bell: ✅`);
            console.log(chalk.bgMagenta(`[${moment().format(settings.timeformat)}] Wrote to /config/streamlink/guilds/${guild.id}.json OK! (in streamlinkHandler.addChannel)\nAdded Channel "${channel.name}"! (ID ${channel.id})`));
        });
    }
}

/**
 * @func removeChannel
 * !streamlink remove channel
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.Chananel} channel
 * 
 * Removes text channel from StreamLink notifications
 */
exports.removeChannel = (message, bot, channel) => {
    if (!bot.streamLink.guilds.has(channel.guild.id)) {
        if (message) message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
        return console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Failed to remove a channel from ${channel.guild}. Guild not in bot.streamLink.guilds!`));
    }
    if (message) {
        if (!bot.streamLink.guilds.get(message.guild.id).channels.includes(channel.id)) {
            return message.reply(`The ${channel} channel is *not* currently set up for StreamLink notifications.`);
        }
    }

    let guild = bot.streamLink.guilds.get(channel.guild.id);
    guild.channels.splice(guild.channels.indexOf(channel.id), 1);
    fs.writeFile(`./config/streamlink/guilds/${message.guild.id}.json`, JSON.stringify(guild), (err) => {
        if (err) throw err;
        bot.streamLink.guilds.set(channel.guild.id, guild);
        if (message) message.reply(`The ${channel} channel has been **removed** from this server's StreamLink notification list. :no_bell:`);
        console.log(chalk.bgMagenta(`[${moment().format(settings.timeformat)}] Wrote to /config/streamlink/guilds/${guild.id}.json OK! (in streamlinkHandler.removeChannel)\nRemoved Channel #${channel.name} from "${message.guild.name}"! (ID ${channel.id})`));
    });
}

/**
 * @func statusMenu
 * !streamlink status
 * 
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 * 
 * Shows what users are connected via StreamLink in the guild
 * Shows what streams are online
 * Shows stats of live streams (like viewer count & game)
 */
exports.statusMenu = (message, bot) => {
    if (!bot.streamLink.guilds.has(message.guild.id))
        return console.log(`[${moment().format(settings.timeformat)}] Guild doesn't exist in bot.streamLink.guilds in streamlinkHandler.statusMenu (${message.guild.id})`);
    let guild = bot.streamLink.guilds.get(message.guild.id);
    let userList = bot.streamLink.users.filter(user => message.guild.members.has(user.id));
    userList = sortUserList(userList);
    let liveUsers = userList.filter(user => user.status);

    let embed = new Discord.RichEmbed()
        .setTitle(`**StreamLink Settings & Live Status**`)
        .setDescription(`Currently ${(guild.enabled) ? `\`enabled\` on this server` : `\`disabled\` on this server\n\nUse \`${settings.prefix}streamlink enable server\` to enable`}\n\n` +
        `There ${(userList.size === 1) ? `is **one user**` : `are **${userList.size} users**`} connected with StreamLink on this server, ` +
        `${(liveUsers.size === 0) ? 'but no streams are' : `and ${(liveUsers.size > 1) ? `${liveUsers.size} streams are` : `one stream is`}`} currently live\n\n` +
        `**Notification Channels:**\n${(guild.channels.length > 0) ? guild.channels.map(c => `<#${c}>`).join(' ') : `*There are no channels set up for StreamLink notifications on this server*\n\n` +
            `Use \`${settings.prefix}streamlink add channel\` in the channel(s) you wish to enable notifications on`}`)
        .setThumbnail('http://i.imgur.com/DZqF1Ro.png')
        .setColor(0x5a4194);

    message.channel.send({ embed }).then(() => {
        if (userList.size > 0) this.perUserStatus(message, guild, userList)
    }).catch(err => err => console.log(chalk.bgRed(`[${moment().format(settings.timeformat)}] ${err}`)));
}

/**
 * @func perUserStatus
 * Applies after the use of !streamlink status, if the guild contains StreamLink'd users
 * 
 *  @param {Discord.Message} message
 *  @param {bot.streamLink.guilds["message.guild.id"]} guild The guild's StreamLink object
 *  @param {bot.streamLink.users.filter(Users in guild)} users Collection of StreamLink user objects for users in the guild
 * 
 * Displays status of all StreamLink connected members on the server
 * Shows whether users are currently live, enabled, and if live: viewer count, game, etc.
 */
exports.perUserStatus = (message, guild, users) => {
    let str = '`connected users:`\n\n';
    let count = 0;
    let splitValue = JSON.parse(fs.readFileSync(`./config/streamlink/conf.json`, 'utf8')).defaults.splitValue;

    users.forEach(user => {
        let viewers = user.viewers;
        let enabled = (user.enabled && guild.usersEnabled.includes(user.id)) ? true : false;
        let game = (user.game !== '') ? `Streaming: ${user.game}` : `Streaming: ???`;

        /** Build str **/
        str += `**${user.name}** `;
        if (!enabled) str += '~~';
        str += `<https://www.twitch.tv/${user.stream}>`;
        if (!enabled) str += '~~';
        if (enabled) {
            if (user.status) str += ` \`LIVE\` \`${viewers} viewer(s)\` \`${game}\``;
            else str += ' `OFFLINE`';
        } else {
            str += ' `DISABLED`';
        }
        str += '\n';

        /** Increment **/
        count++;
        if (count >= splitValue) {
            message.channel.send(str);
            str = '';
            count = 0;
        }
    });

    /** Send remnants **/
    if (str !== '') message.channel.send(str);
}

/**
 * @func saveUser
 * Saves the user's StreamLink config file
 *  @param {Snowflake} user StreamLink user object
 */
exports.saveUser = (user) => {
    return new Promise((resolve, reject) =>
        fs.writeFile(`./config/streamlink/users/${user.id}.json`, JSON.stringify(user), (err) => {
            if (err) reject(err); else resolve();
        })
    );
}

/**
 * @func saveGuild
 * Saves the user's StreamLink config file
 *  @param {Snowflake} guild StreamLink guild object
 */
exports.saveGuild = (guild) => {
    return new Promise((resolve, reject) =>
        fs.writeFile(`./config/streamlink/guilds/${guild.id}.json`, JSON.stringify(guild), (err) => {
            if (err) reject(err); else resolve();
        })
    );
}

/**
 * @func logEvent
 * Logs TwitchPS events emitted
 */
exports.logEvent = (event, user, slUser) => {
    const header = '---------------------------------------------------------';
    const footer = header;
    switch (event) {
        case 'stream-up':
            console.log(header);
            console.log(chalk.bgMagenta.bold('StreamLink >> STREAM-UP EVENT'));
            console.log(`Channel: ${slUser.stream}\nUser: ${user.username}\nStreaming: ${(slUser.game === '') ? '???' : slUser.game}\n` +
                `Time: ${slUser.lastBroadcast} (${moment().format(settings.timeformat)})\nJSON: /config/streamlink/users/${slUser.id}.json`);
            console.log(footer);
            break;
        case 'stream-down':
            console.log(header);
            console.log(chalk.bgMagenta.black('StreamLink >> STREAM-DOWN EVENT'));
            console.log(`Channel: ${slUser.stream}\nUser: ${user.username}\n` +
                `Time: ${slUser.lastOffline} (${moment().format(settings.timeformat)})\nJSON: /config/streamlink/users/${slUser.id}.json\n`);
            console.log(footer);
            break;
        default:
            console.log(header);
            console.log(chalk.bgMagenta.bold('StreamLink >> OOPS, EVENT NOT FOUND!'));
            console.log(footer);
            break;
    }
}

sortUserList = (userList) => {
    try {
        let names = [];
        let sorted = new Discord.Collection();
        userList.forEach((value, key, map) => {
            names.push(value.name.toLowerCase());
        });
        names.sort().map((value) => {
            let entry = userList.find(val => val.name.toLowerCase() === value);
            sorted.set(entry.id, entry);
        });
        return sorted;
    } catch (err) {
        console.log(err);
    }
}