/**
 * StreamLink Handler
 *
 * Handles all StreamLink functions, from all the !streamlink command functionality,
 * to all the TwitchPubSub event handling.
 */

/* eslint-disable */

const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const settings = require('../settings');
const { getGuildCommandPrefix } = require('./GuildSettings');

const RegExChannelName = /^[^_\W\s][a-zA-Z0-9_]{3,24}$/;

/**
 * @func sortUserList
 * Sorts a given collection of users alphabetically, case insensitive
 * 
 * @param {Discord.Collection} userList the collection of users to sort
 */
const sortUserList = (userList) => {
  try {
    const names = [];
    const sorted = new Discord.Collection();
    userList.forEach((value) => {
      names.push(value.name.toLowerCase());
    });
    names.sort().map((value) => {
      const entry = userList.find(val => val.name.toLowerCase() === value);
      sorted.set(entry.id, entry);
    });
    return sorted;
  } catch (err) {
    return console.error(err);
  }
};

/**
 * @func init
 * Initialize StreamLink elements
 */
exports.init = bot => new Promise((resolve, reject) => {
  try {
    const users = new Discord.Collection();
    const guilds = new Discord.Collection();
    const path = './config/streamlink';
    const topics = [];
    bot.streamLink.conf = JSON.parse(fs.readFileSync(`${path}/conf.json`, 'utf8'));

    console.log(chalk.bgMagenta.bold('StreamLink:'));
    fs.readdir(`${path}/users`, 'utf8', (err, files) => {
      files.forEach((f) => {
        if (f === 'dummy') return;
        let conf = JSON.parse(fs.readFileSync(`${path}/users/${f}`, 'utf8'));
        users.set(conf.id, conf);
        topics.push({ topic: `video-playback.${conf.stream.toLowerCase()}` });
        console.log(chalk.bgMagenta(`User: ${conf.name} => Stream: https://www.twitch.tv/${conf.stream}`));
      });
      bot.streamLink.users = users;
      fs.readdir(`${path}/guilds`, 'utf8', (err, files) => {
        files.forEach((f) => {
          if (f === 'dummy') return;
          let conf = JSON.parse(fs.readFileSync(`${path}/guilds/${f}`, 'utf8'));
          guilds.set(conf.id, conf);
          console.log(chalk.bgMagenta.black(`Guild: ${conf.id} => StreamLink Enabled?: ${conf.enabled}, Users: ${conf.usersEnabled}`));
        });
        bot.streamLink.guilds = guilds;
        resolve({ topics: topics, client: bot });
      });
    });
  } catch (err) {
    reject(err);
  }
});

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
  let user = bot.streamLink.users.find('stream', data.channel_name.toLowerCase()) || '';
  if (user === '') return console.log(`[${moment().format(settings.timeFormat)}] User is undefined in streamlinkHandler.streamUp for channel ${data.channel_name}`);

  bot.fetchUser(user.id).then((u) => {
    try {
      const difference = Number(data.time) - Number(user.lastBroadcast);

      user.status = true;
      user.lastBroadcast = data.time;
      user.game = (u.presence.game !== null) ? u.presence.game.name : '';
      bot.streamLink.users.set(user.id, user);

      this.saveUser(user).then(this.logEvent('stream-up', u, user), ).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));

      if (!user.enabled) return;

      bot.streamLink.guilds.forEach((guild) => {
        if (!bot.guilds.has(guild.id)) return;
        if (guild.usersEnabled.includes(user.id) && bot.guilds.get(guild.id).members.has(user.id) && guild.enabled) {
          if (difference >= guild.timer * 60) {
            const embed = new Discord.RichEmbed()
              .setTitle('StreamLink Update')
              .setDescription(`${u} has gone live on Twitch!`)
              .setColor(0x5a4194);
            if (guild.style !== 'minimal') embed.setThumbnail(u.avatarURL);
            embed.addField('Info:', `${u.username} is now live${(u.presence.game !== null) ? ` & streaming **${u.presence.game.name}**!` : '!'} Check it out here:${(guild.style !== 'standard') ? `\n\nhttps://www.twitch.tv/${user.stream}` : ''}`);
            guild.channels.forEach((channel) => {
              const c = bot.channels.get(channel);
              c.send({ embed })
                .then(() => { if (guild.style === 'standard') c.send(`https://www.twitch.tv/${user.stream}`); })
                .catch(console.error);
            });
          }
        }
      });
    } catch (err) { console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)); }
  }).catch((err) => {
    console.log(chalk.bgMagenta(`[${moment().format()}] Error fetching user (channel: ${data.channel_name}) in streamlinkHandler.streamUp!\n${err}`));
  });
};

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
  const user = bot.streamLink.users.find('stream', data.channel_name.toLowerCase()) || '';
  if (user === '') return console.log(`[${moment().format(settings.timeFormat)}] User is undefined in streamlinkHandler.streamDown for channel ${data.channel_name}`);

  bot.fetchUser(user.id).then((u) => {
    try {
      user.status = false;
      user.viewers = 0;
      user.lastOffline = data.time;
      bot.streamLink.users.set(user.id, user);

      this.saveUser(user).then(this.logEvent('stream-down', u, user), ).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
    } catch (err) { console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)); }
  }).catch((err) => {
    console.log(chalk.bgMagenta(`[${moment().format()}] Error fetching user (channel: ${data.channel_name}) in streamlinkHandler.streamDown!\n${err}`));
  });
};

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
  const user = bot.streamLink.users.find('stream', data.channel_name.toLowerCase()) || '';
  if (user === '') return console.log(`[${moment().format(settings.timeFormat)}] User is undefined in streamlinkHandler.viewCount for channel ${data.channel_name}`);

  bot.fetchUser(user.id).then((u) => {
    try {
      if (!user.status) return;
      if (u.presence.game !== null) {
        if (user.game !== u.presence.game.name) {
          user.game = u.presence.game.name;
        }
      }
      user.viewers = data.viewers;
      this.saveUser(user).then().catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
    } catch (err) { console.log(err); }
  }).catch((err) => {
    console.log(chalk.bgMagenta(`[${moment().format()}] Error fetching user (channel: ${data.channel_name}) in streamlinkHandler.viewCount!\n${err}`));
  });
};

/**
 * @func enableUser
 * !streamlink enable (@user)
 *
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.User} user
 */
exports.enableUser = (message, bot, user) => {
  const prefix = getGuildCommandPrefix(bot, message);

  if (!bot.streamLink.guilds.has(message.guild.id)) {
    console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
    return message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
  }

  if (!bot.streamLink.users.has(user.id)) return message.reply(`Oops! Something went wrong.\n\nIt appears that there is no StreamLink connection set up for ${message.author}. Use \`${prefix}streamlink add twitchName\` to set one up!`);

  let guild = bot.streamLink.guilds.get(message.guild.id);

  if (guild.usersEnabled.indexOf(user.id) > -1) {
    return message.reply(`This user is already enabled on this server! Check \`${prefix}streamlink status\` to see what connections are active on this server.`);
  }
  guild.usersEnabled.push(user.id);
  this.saveGuild(guild).then(() => {
    bot.streamLink.guilds.set(message.guild.id, guild);
    message.reply(`The StreamLink connection for ${user} has been **enabled** on this server! :vibration_mode:`);
  }).catch(err => console.log(err));

};

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
  const prefix = getGuildCommandPrefix(bot, message);

  if (!bot.streamLink.guilds.has(message.guild.id)) {
    console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
    return message.reply(`Oops! Something went wrong.\n\nServer config file was not found.`);
  }

  if (!bot.streamLink.users.has(user.id)) return message.reply(`Oops! Something went wrong.\n\nIt appears that there is no StreamLink connection set up for ${message.author}. Use \`${prefix}streamlink add twitchName\` to set one up!`);

  let guild = bot.streamLink.guilds.get(message.guild.id);

  if (guild.usersEnabled.indexOf(user.id) === -1) {
    return message.reply(`This user is already disabled on this server! Check \`${prefix}streamlink status\` to see what connections are active on this server.`);
  }
  guild.usersEnabled.splice(guild.usersEnabled.indexOf(user.id), 1);
  this.saveGuild(guild).then(() => {
    bot.streamLink.guilds.set(guild.id, guild);
    message.reply(`The StreamLink connection for ${user} has been **disabled** on this server! :mobile_phone_off:`);
  }).catch(err => console.log(err));

};

/**
 * @func enableGuild
 * !streamlink disable (@user)
 *
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 */
exports.enableGuild = (message, bot) => {
  if (!bot.streamLink.guilds.has(message.guild.id)) {
    console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
    return message.reply('Oops! Something went wrong.\n\nServer config file was not found.');
  }

  const guild = bot.streamLink.guilds.get(message.guild.id);
  guild.enabled = true;

  this.saveGuild(guild).then(() => {
    bot.streamLink.guilds.set(message.guild.id, guild);
    message.reply(`StreamLink is now **enabled** on ${message.guild}! :ok:`);
  }).catch(err => console.log(err));
};

/**
 * @func disableGuild
 * !streamlink disable (@user)
 *
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 */
exports.disableGuild = (message, bot) => {
  if (!bot.streamLink.guilds.has(message.guild.id)) {
    console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.enableUser`));
    return message.reply('Oops! Something went wrong.\n\nServer config file was not found.');
  }

  const guild = bot.streamLink.guilds.get(message.guild.id);
  guild.enabled = false;

  this.saveGuild(guild).then(() => {
    bot.streamLink.guilds.set(message.guild.id, guild);
    message.reply(`StreamLink is now **disabled** on ${message.guild} :no_entry_sign:`);
  }).catch(err => console.log(err));
};

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
  let object, userToAdd, existed, oldStream;
  const prefix = getGuildCommandPrefix(bot, message);

  if (!stream) return message.reply(`Oops! Something went wrong.\n\nIt appears that no stream name was given with the command usage! Proper format is \`${prefix}streamlink add twitchName\` where \`twitchName\` is your Twitch.tv user name (ie: the end of the URL for your stream <https://www.twitch.tv/THIS_PART_HERE>)`);
  if (!stream.match(RegExChannelName)) return message.reply('The given Twitch.tv channel name doesn\'t comply with the Twitch.tv username requirements! (must be between 4-25 characters, alphanumeric or underscores ONLY [a-zA-Z0-9_])');
  
  let noOfConfigs = fs.readdirSync('./config/streamlink/users');
  let settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
  if (noOfConfigs.length > settings.streamlink.max_connections) return message.reply(`The max number of StreamLink connections (${settings.streamlink.max_connections}) has been reached! Due to API constraints, no more users can be added for StreamLink. 😦 Sorry!`);

  stream = stream.toLowerCase();

  if (user) {
    if (message.guild.members.has(user.id)) userToAdd = user;
    else {
      message.reply('Oops! Something went wrong.\n\nThe specified Discord user doesn\'t seem to exist (or at least not on this server)');
      return console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${message.author.username} failed to add a StreamLink connection. User ID#${user.id} was not found.`));
    }
  } else {
    userToAdd = message.author;
  }

  if (bot.streamLink.users.has(userToAdd.id)) {
    existed = true;
    object = bot.streamLink.users.get(userToAdd.id);
    object.enabled = true;
    oldStream = object.stream;
  } else {
    existed = false;
    object = JSON.parse(fs.readFileSync('./config/streamlink/conf.json', 'utf8')).defaults.userObject;
  }

  object.id = userToAdd.id;
  object.name = userToAdd.username;
  object.stream = stream;

  if (!bot.streamLink.guilds.has(message.guild.id)) {
    console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Guild ${message.guild.name} #${message.guild.id} can't be located in bot.streamLink.guilds for streamlinkHandler.addUser`));
    return message.reply('Oops! Something went wrong.\n\nServer config file was not found.');
  } else if (!existed) {
    bot.streamLink.guilds.get(message.guild.id).usersEnabled.push(userToAdd.id);
  }

  this.saveUser(object).then(() => {
    if (existed) bot.removeTwitchTopic(oldStream);
    bot.addTwitchTopic(stream);
    bot.streamLink.users.set(object.id, object);
    if (existed) message.reply(`StreamLink connection for ${userToAdd} has been edited and is now connected to <https://www.twitch.tv/${object.stream}> and is currently ${(object.enabled) ? '**enabled**. :vibration_mode:' : '**disabled**. :mobile_phone_off:'} ✅`);
    else message.reply(`StreamLink connection established for ${userToAdd} at <https://www.twitch.tv/${object.stream}> and has been **enabled** on this server. ✅`);
    console.log(chalk.bgMagenta(`[${moment().format(settings.timeFormat)}] ${message.author.username} ${existed ? 'edited' : 'added'} a StreamLink connection!\nUser: ${userToAdd.username}\nID: ${userToAdd.id}\nTwitch: https://www.twitch.tv/${stream.toLowerCase()}`));
  }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
};

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
  const prefix = getGuildCommandPrefix(bot, message);

  if (!user && message) user = message.author;

  if (!bot.streamLink.users.has(user.id)) {
    return message.reply(`Oops! Something went wrong.\n\nIt appears that there is no StreamLink connection set up for ${message.author}. Use \`${prefix}streamlink add twitchName\` to set one up!`);
  }
  
  if (!message.guild.members.has(user.id)) {
    message.reply('Oops! Something went wrong.\n\nThe specified Discord user doesn\'t seem to exist (or at least not on this server)');
    return console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${message.author.username} failed to add a StreamLink connection. User ID#${user.id} was not found.`));
  }

  const guilds = bot.streamLink.guilds.filter(guild => guild.usersEnabled.includes(user.id));
  guilds.forEach(g => g.usersEnabled.splice(g.usersEnabled.indexOf(user.id), 1));

  fs.unlink(`./config/streamlink/users/${user.id}.json`, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        message.reply(`Oops! Something went wrong.\n\nLooks like the user's config has already been removed from the local directory.`);

        return console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${message.author.username} failed to remove a StreamLink connection. File ${user.id}.json was not found.`));
      } throw err;
    }
    message.reply(`StreamLink connection & info has been deleted for ${user}, who was connected to the stream at <https://www.twitch.tv/${bot.streamLink.users.get(user.id).stream}> ❌`);
    console.log(chalk.bgMagenta(`[${moment().format(settings.timeFormat)}] ${message.author.username} removed a StreamLink connection!\nUser: ${user.username}\nID: ${user.id}\nTwitch: https://www.twitch.tv/${bot.streamLink.users.get(user.id).stream}`));

    bot.removeTwitchTopic(bot.streamLink.users.get(user.id).stream);
    bot.streamLink.users.delete(user.id);
  });
};

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
    const object = JSON.parse(fs.readFileSync('./config/streamlink/conf.json', 'utf8')).defaults.guildObject;
    object.id = guild.id;
    fs.writeFile(`./config/streamlink/guilds/${guild.id}.json`, JSON.stringify(object), (err) => {
      if (err) throw err;
      bot.streamLink.guilds.set(guild.id, object);
      console.log(chalk.bgMagenta(`[${moment().format(settings.timeFormat)}] Wrote to /config/streamlink/guilds/${guild.id}.json OK! (in streamlinkHandler.addGuild)\nJoined Guild "${guild.name}"! (ID ${guild.id})`));
    });
  }
};

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
      console.log(chalk.bgMagenta(`[${moment().format(settings.timeFormat)}] Wrote to /config/streamlink/guilds/${guild.id}.json OK! (in streamlinkHandler.removeGuild)\nRemoved Guild "${guild.name}"! (ID ${guild.id})`));
    });
  }
};

/**
 * @func addChannel
 * !streamlink add channel
 *
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.Channel} channel
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
  }
  let guild = bot.streamLink.guilds.get(message.guild.id);
  guild.channels.push(channel.id);
  fs.writeFile(`./config/streamlink/guilds/${message.guild.id}.json`, JSON.stringify(guild), (err) => {
    if (err) throw err;
    bot.streamLink.guilds.set(message.guild.id, guild);
    message.reply(`This channel has been **added** to this server's StreamLink notification list. ${channel} will now receive & push StreamLink notifications. :bell: ✅`);
    console.log(chalk.bgMagenta(`[${moment().format(settings.timeFormat)}] Wrote to /config/streamlink/guilds/${guild.id}.json OK! (in streamlinkHandler.addChannel)\nAdded Channel "${channel.name}"! (ID ${channel.id})`));
  });

};

/**
 * @func removeChannel
 * !streamlink remove channel
 *
 *  @param {Discord.Message} message
 *  @param {Discord.Client} bot
 *  @param {Discord.Channel} channel
 *
 * Removes text channel from StreamLink notifications
 */
exports.removeChannel = (message, bot, channel) => {
  if (!bot.streamLink.guilds.has(channel.guild.id)) {
    if (message) message.reply('Oops! Something went wrong.\n\nServer config file was not found.');
    return console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Failed to remove a channel from ${channel.guild}. Guild not in bot.streamLink.guilds!`));
  }
  if (message) {
    if (!bot.streamLink.guilds.get(message.guild.id).channels.includes(channel.id)) {
      return message.reply(`The ${channel} channel is *not* currently set up for StreamLink notifications.`);
    }
  }

  const guild = bot.streamLink.guilds.get(channel.guild.id);
  guild.channels.splice(guild.channels.indexOf(channel.id), 1);
  fs.writeFile(`./config/streamlink/guilds/${channel.guild.id}.json`, JSON.stringify(guild), (err) => {
    if (err) throw err;
    bot.streamLink.guilds.set(channel.guild.id, guild);
    if (message) message.reply(`The ${channel} channel has been **removed** from this server's StreamLink notification list. :no_bell:`);
    console.log(chalk.bgMagenta(`[${moment().format(settings.timeFormat)}] Wrote to /config/streamlink/guilds/${channel.guild.id}.json OK! (in streamlinkHandler.removeChannel)\nRemoved Channel #${channel.name} from "${channel.guild.name}"! (ID ${channel.id})`));
  });
};

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
  if (!bot.streamLink.guilds.has(message.guild.id)) { return console.log(`[${moment().format(settings.timeFormat)}] Guild doesn't exist in bot.streamLink.guilds in streamlinkHandler.statusMenu (${message.guild.id})`); }
  const guild = bot.streamLink.guilds.get(message.guild.id);
  let userList = bot.streamLink.users.filter(user => message.guild.members.has(user.id));
  userList = sortUserList(userList);
  const liveUsers = userList.filter(user => user.status);
  const prefix = getGuildCommandPrefix(bot, message);

  const embed = new Discord.RichEmbed()
    .setTitle('**StreamLink Settings & Live Status**')
    .setDescription(`Currently ${(guild.enabled) ? '`enabled` on this server' : `\`disabled\` on this server\n\nUse \`${prefix}streamlink enable server\` to enable`}\n\n` +
    `There ${(userList.size === 1) ? 'is **one user**' : `are **${userList.size} users**`} connected with StreamLink on this server, ` +
    `${(liveUsers.size === 0) ? `${(userList.size === 0) ? 'and' : 'but'} no streams are` : `and ${(liveUsers.size > 1) ? `${liveUsers.size} streams are` : 'one stream is'}`} currently live\n\n` +
    `**Notification Channels:**\n${(guild.channels.length > 0) ? guild.channels.map(c => `<#${c}>`).join(' ') : '*There are no channels set up for StreamLink notifications on this server*\n\n' +
      `Use \`${prefix}streamlink add channel\` in the channel(s) you wish to enable notifications on`}`)
    .setThumbnail('http://i.imgur.com/DZqF1Ro.png')
    .setColor(0x5a4194);

  message.channel.send({ embed }).then(() => {
    if (userList.size > 0) this.perUserStatus(message, guild, userList);
  }).catch(err => err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
};

/**
 * @func perUserStatus
 * Applies after the use of !streamlink status, if the guild contains StreamLink'd users
 *
 *  @param {Discord.Message} message
 *  @param {Discord.Guild} guild The guild's StreamLink object
 *  @param {Discord.Collection<Discord.Snowflake, Discord.User>} users Collection of StreamLink user objects for users in the guild
 *
 * Displays status of all StreamLink connected members on the server
 * Shows whether users are currently live, enabled, and if live: viewer count, game, etc.
 */
exports.perUserStatus = (message, guild, users) => {
  let str = '***Connected Users:***\n';
  let count = 0;
  const splitValue = JSON.parse(fs.readFileSync('./config/streamlink/conf.json', 'utf8')).defaults.splitValue;

  users.forEach((user) => {
    const viewers = user.viewers;
    const enabled = !!((user.enabled && guild.usersEnabled.includes(user.id)));
    const game = (user.game !== '') ? `Streaming: ${user.game}` : 'Streaming: ???';

    /* Build str */
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

    /* Increment */
    count++;
    if (count >= splitValue) {
      message.channel.send(str);
      str = '';
      count = 0;
    }
  });

  /* Send remnants */
  if (str !== '') message.channel.send(str);
};

/**
 * @func saveUser
 * Saves the user's StreamLink config file
 *  @param {Snowflake} user StreamLink user object
 */
exports.saveUser = (user) => new Promise((resolve, reject) =>
  fs.writeFile(`./config/streamlink/users/${user.id}.json`, JSON.stringify(user), (err) => {
    if (err) reject(err); else resolve();
  })
);

/**
 * @func saveGuild
 * Saves the user's StreamLink config file
 *  @param {Snowflake} guild StreamLink guild object
 */
exports.saveGuild = (guild) => new Promise((resolve, reject) => {
  fs.writeFile(`./config/streamlink/guilds/${guild.id}.json`, JSON.stringify(guild), (err) => {
    if (err) reject(err); resolve();
  });
});

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
      `Time: ${slUser.lastBroadcast} (${moment().format(settings.timeFormat)})\nJSON: /config/streamlink/users/${slUser.id}.json`);
      console.log(footer);
      break;
    case 'stream-down':
      console.log(header);
      console.log(chalk.bgMagenta.black('StreamLink >> STREAM-DOWN EVENT'));
      console.log(`Channel: ${slUser.stream}\nUser: ${user.username}\n` +
      `Time: ${slUser.lastOffline} (${moment().format(settings.timeFormat)})\nJSON: /config/streamlink/users/${slUser.id}.json`);
      console.log(footer);
      break;
    default:
      console.log(header);
      console.log(chalk.bgMagenta.bold('StreamLink >> OOPS, EVENT NOT FOUND!'));
      console.log(footer);
      break;
  }
};
