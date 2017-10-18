// Handles all LFG-related events

const chalk    = require('chalk');
const Discord  = require('discord.js');
const moment   = require('moment-timezone');
const settings = require('../settings.json');
const INTERVAL = settings.lfg.update_interval * 1000;

/*****************************************************************************************************************
 * Format for all LFG requests, embedded in the Client (bot) object -->
 * 
 * 'LFG ID' => {
 * 
 *  @param {Snowflake} id, message ID that bot sends
 *  @param {String} party_leader_name, user name of command issuer & leader of party
 *  @param {Snowflake} party_leader_id, user ID of party leader
 *  @param {String} code, LFG code for the game
 *  @param {String} game, Game title (proper formatting)
 *  @param {String} mode, Game mode
 *  @param {Date} time, When the LFG request was made
 *  @param {Date} expire_date, When the LFG request will expire
 *  @param {Integer} ttl, Number of minutes until LFG request expires
 *  @param {Array[Snowflake]} party, List of user IDs of users in the party
 *  @param {Integer} max_party_size, Maximum # of users in the party before it fills up
 *  @param {Snowflake} channel, Channel ID where the LFG request was made
 *  @param {Boolean} warning, Has a warning been sent out about the LFG being close to expiration yet? (init. FALSE)
 * 
 * }
 ******************************************************************************************************************/

module.exports = {

    /* * * 
    Add to LFG stack >>
    * * */
    addLFG: function (bot, obj) {
        try {
            let firstEntry;
            if (bot.lfgStack.size === 0) firstEntry = true;
            let g = bot.games.get(obj.code);
            let index = g.modes.indexOf(obj.mode);
            let d = new Date();
            let expireDate = new Date(d.getTime() + obj.ttl * 60000);

            let embed = new Discord.RichEmbed()
                .setTitle(`${obj.party_leader_name} is looking for a ${obj.game} group!`)
                .setDescription(`**Game mode:** ${g.modes_proper[index]}\n**Party size:** ${obj.max_party_size}`)
                .setColor(0x009395)
                .setThumbnail(g.thumbnail)
                .setFooter(`Expires at: `)
                .setTimestamp(expireDate)
                .addField(`Want to join?`, `Click the 👍 below to reserve a spot!\n${obj.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** <@${obj.party_leader_id}> (1/${obj.max_party_size})`);
            bot.channels.get(obj.channel).send({ embed }).then(function (message) {
                obj.id = message.id;
                bot.lfgStack.set(obj.id, obj);
                if (firstEntry) bot.lfgUpdate(true, INTERVAL);
                message.react('👍').then(() => {
                    message.react('🚫').then(() => {
                        console.log(chalk.bgYellow.black(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${obj.party_leader_name} made an LFG for ${obj.game} | ${obj.mode} | party of ${obj.max_party_size} | ${obj.ttl} minutes`));
                    }).catch(err => console.log(chalk.bgRed(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${err}`)));
                }).catch(err => console.log(chalk.bgRed(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${err}`)));
            }).catch(err => console.log(err));         
        } catch (err) {
            console.log(err);
        }
    },

    /* * *
    Add a user into an LFG party >>
    * * */
    addToParty: function (bot, id, userid) {
        try {
            let e = bot.lfgStack.get(id);
            e.party.push(userid);
            let i = bot.games.get(e.code);
            let j = i.modes.indexOf(e.mode);
            let embed = new Discord.RichEmbed()
                .setTitle(`${e.party_leader_name} is looking for a ${i.name} group!`)
                .setDescription(`**Game mode:** ${i.modes_proper[j]}\n**Party size:** ${e.max_party_size}`)
                .setColor(0x009395)
                .setThumbnail(i.thumbnail)
                .setFooter(`Expires at `)
                .setTimestamp(e.expire_date)
                .addField(`Want to join?`, `Click the 👍 below to reserve a spot!\n${e.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`);
            let ch = bot.channels.get(e.channel);
            let g = ch.guild;
            ch.fetchMessage(e.id).then(message => {
                message.edit({ embed }).then(() => {
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));

            bot.lfgStack.set(id, e);

            // Attempt to move user into party leader's channel
            let memberToMoveTo = g.members.get(bot.lfgStack.get(id).party_leader_id)
            let memberToMove = g.members.get(userid);
            if (typeof memberToMoveTo.voiceChannel !== 'undefined') {
                memberToMove.edit({ channel: memberToMoveTo.voiceChannelID }, `Moved by @${settings.botnameproper} for LFG`).then().catch(err => console.log(err));
            }

            if (e.party.length === e.max_party_size) this.complete(bot, id);
        } catch (err) {
            console.log(err);
        }
    },

    /* * *
    Remove a user from an LFG party >>
    * * */
    removeFromParty: function (bot, id, userid) {
        try {
            let index = bot.lfgStack.get(id).party.indexOf(userid);
            if (index > -1) {
                bot.lfgStack.get(id).party.splice(index, 1);
                let e = bot.lfgStack.get(id);
                let i = bot.games.get(e.code);
                let j = i.modes.indexOf(e.mode);
                let embed = new Discord.RichEmbed()
                    .setTitle(`${e.party_leader_name} is looking for a ${i.name} group!`)
                    .setDescription(`**Game mode:** ${i.modes_proper[j]}\n**Party size:** ${e.max_party_size}`)
                    .setColor(0x009395)
                    .setThumbnail(i.thumbnail)
                    .setFooter(`Expires at `)
                    .setTimestamp(e.expire_date)
                    .addField(`Want to join?`, `Click the 👍 below to reserve a spot!\n${e.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`);
                let ch = bot.channels.get(e.channel);
                ch.fetchMessage(e.id).then(message => {
                    message.edit({ embed }).then(() => {
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            } else return;
        } catch (err) { console.log(err); }
    },

    /* * *
    LFG request times out, remove from bot.lfgStack >>
    * * */
    timeout: function (bot, id) {
        try {
            let e = bot.lfgStack.get(id); let i = bot.games.get(e.code); let j = i.modes.indexOf(e.mode);
            let embed = new Discord.RichEmbed()
                .setTitle(`${e.party_leader_name} is looking for a ${i.name} group!`)
                .setDescription(`**Game mode:** ${i.modes_proper[j]}\n**Party size:** ${e.max_party_size}`)
                .setColor(0x009395)
                .setThumbnail(i.thumbnail)
                .setFooter('Timed out at ')
                .setTimestamp()
                .addField(`⏰ **This LFG request has timed out.** ⏰`, `**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`);
            let ch = bot.channels.get(e.channel);
            ch.fetchMessage(e.id).then(message => {
                bot.lfgStack.delete(id);
                if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
                message.edit({ embed }).then(() => {
                    console.log(chalk.bgYellow.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG for ${e.game} has timed out.`));
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        } catch (err) {
            console.log(err);
        }
    },

    /* * * 
    Running out of time on LFG, send out a warning message >>
    * * */
    warning: function (bot, id, timeleft) {
        try {
            let e = bot.lfgStack.get(id); let i = bot.games.get(e.code); let j = i.modes.indexOf(e.mode);
            let embed = new Discord.RichEmbed()
                .setTitle(`${e.party_leader_name}'s party has ${timeleft} minutes left before it times out!`)
                .setDescription(`**Game:** ${e.game}\n**Game mode:** ${i.modes_proper[j]}\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`)
                .setColor(0x009395);
            e.warning = true;
            let ch = bot.channels.get(e.channel);
            ch.send({ embed });
            console.log(chalk.bgYellow.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG is running out of time.`));
        } catch (err) {
            console.log(err);
        }
    },

    /* * * 
    Party is full, LFG is complete ✓ >>
    * * */
    complete: function (bot, id) {
        try {
            let e = bot.lfgStack.get(id);
            let i = bot.games.get(e.code);
            let j = i.modes.indexOf(e.mode);
            let embed = new Discord.RichEmbed()
                .setTitle(`${e.party_leader_name}'s party is now full & ready to go!`)
                .setDescription(`**Game:** ${e.game}\n**Game mode:** ${i.modes_proper[j]}\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')}`)
                .setColor(0x009395)
                .setThumbnail("https://i.imgur.com/RsRmWcm.png");
            let ch = bot.channels.get(e.channel);
            ch.send({ embed });
            bot.lfgStack.delete(id);
            if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
            console.log(chalk.bgYellow.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG party for ${e.game} is full.`));
        } catch (err) {
            console.log(err);
        }
    },

    /* * *
    Cancel party >> 
    * * */
    cancel: function (bot, id, removed) {
        try {
            let e = bot.lfgStack.get(id);
            let i = bot.games.get(e.code);
            let j = i.modes.indexOf(e.mode);
            let embed = new Discord.RichEmbed()
                .setTitle(`${e.party_leader_name}'s party has been cancelled`)
                .setDescription(`**Game:** ${e.game}\n**Game mode:** ${i.modes_proper[j]}\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`)
                .setColor(0x009395)
                .setFooter(`Cancelled at `)
                .setTimestamp()
                .setThumbnail("https://i.imgur.com/jSYuGrc.png");
            if (removed) {
                bot.lfgStack.delete(id);
                if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
                return console.log(chalk.bgYellow.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG party for ${e.game} has been deleted.`));
            }
            let ch = bot.channels.get(e.channel);
            ch.fetchMessage(e.id).then(message => {
                message.edit({ embed }).then(() => {
                    bot.lfgStack.delete(id);
                    if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
                    console.log(chalk.bgYellow.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG party for ${e.game} has been cancelled.`));
                }).catch(err => console.log(err));
            }).catch(err => {
                console.log(err)
            });
        } catch (err) {
            console.log(err);
        }
    },

    /* * *
    Update interval >>
    * * */
    update: function (bot) {
        try {
            let d = new Date();
            bot.lfgStack.forEach(l => {
                if (d.getTime() >= l.time + (l.ttl * 60000)) {
                    this.timeout(bot, l.id);
                }
                else if (l.ttl >= settings.lfg.ttl_threshold && l.time + (l.ttl * 60000) - d.getTime() <= Math.round(l.ttl * 60000 / 4) && !l.warning && settings.lfg.ttl_warning) {
                    let timeleft = Math.round(Math.round(l.ttl * 60000 / 4) / 60000);
                    this.warning(bot, l.id, timeleft);
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
};