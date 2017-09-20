// Handles all LFG-related events

const chalk    = require('chalk');
const Discord  = require('discord.js');
const moment   = require('moment-timezone');
const settings = require('../settings.json');

/* * *
Format for all LFG requests, embedded in the Client object -->
"id#" => {
    "id": The ID of the LFG request message that Ggis sends out
    "party_leader_name": User name of party leader (user that issues LFG command)
    "party_leader_id": ID of party leader
    "code": Game LFG code
    "game": Game title
    "mode": Game mode
    "time": Time LFG was request (Date)
    "expire_date": Date object for when LFG request expires
    "ttl": TTL in minutes
    "party": People in party (user IDs)
    "max_party_size": Max party size
    "channel": Text channel used in
    "warning": Has the channel been warned that the LFG is running out of time yet?
}
* * */

module.exports = {
    /* * * 
    Add to LFG stack >>
    * * */
    addLFG: function (bot, object, id) {
        bot.lfgStack.set(id, object);
    },

    /* * *
    Add a user into an LFG party >>
    * * */
    addToParty: function (bot, id, userid) {
        var e = bot.lfgStack.get(id);
        e.party.push(userid);
        var i = bot.games.get(e.code); 
        var j = i.modes.indexOf(e.mode);
        var embed = new Discord.RichEmbed()
            .setTitle(`${e.party_leader_name} is looking for a ${i.name} group!`)
            .setDescription(`**Game mode:** ${i.modes_proper[j]}\n**Party size:** ${e.max_party_size}`)
            .setColor(0x009395)
            .setThumbnail(i.thumbnail)
            .setFooter(`Expires at: `)
            .setTimestamp(e.expire_date)   
            .addField(`Want to join?`, `Click the 👍 below to reserve a spot!\n${e.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`);
        var ch = bot.channels.get(e.channel);
        var g = ch.guild;
        ch.fetchMessage(e.id).then(message => {	
            message.edit({ embed }).then(() => {  
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));

        bot.lfgStack.set(id, e);
        
        // Attempt to move user into party leader's channel
        var memberToMoveTo = g.members.get(bot.lfgStack.get(id).party_leader_id)
        var memberToMove = g.members.get(userid);
        if (typeof memberToMoveTo.voiceChannel !== 'undefined') {
            memberToMove.edit({channel: memberToMoveTo.voiceChannelID}, `Moved by @${settings.botnameproper} for LFG`).then().catch(err => console.log(err));
        }

        if (e.party.length === e.max_party_size) this.complete(bot, id);
    },

    /* * *
    Remove a user from an LFG party >>
    * * */
    removeFromParty: function (bot, id, userid) {
        var i = bot.lfgStack.get(id).party.indexOf(userid);
        if (i > -1) {
            bot.lfgStack.get(id).party.splice(i, 1);
            var e = bot.lfgStack.get(id);
            var i = bot.games.get(e.code); 
            var j = i.modes.indexOf(e.mode);
            var embed = new Discord.RichEmbed()
                .setTitle(`${e.party_leader_name} is looking for a ${i.name} group!`)
                .setDescription(`**Game mode:** ${i.modes_proper[j]}\n**Party size:** ${e.max_party_size}`)
                .setColor(0x009395)
                .setThumbnail(i.thumbnail)
                .setFooter(`Expires at: `)
                .setTimestamp(e.expire_date)                
                .addField(`Want to join?`, `Click the 👍 below to reserve a spot!\n${e.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`);
            var ch = bot.channels.get(e.channel);
            ch.fetchMessage(e.id).then(message => {	
                message.edit({ embed }).then(() => {  
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        } else return;
    },

    /* * *
    LFG request times out, remove from bot.lfgStack >>
    * * */
    timeout: function (bot, id) {
        var e = bot.lfgStack.get(id); var i = bot.games.get(e.code); var j = i.modes.indexOf(e.mode);
        var embed = new Discord.RichEmbed()
            .setTitle(`${e.party_leader_name} is looking for a ${i.name} group!`)
            .setDescription(`**Game mode:** ${i.modes_proper[j]}\n**Party size:** ${e.max_party_size}`)
            .setColor(0x009395)
            .setThumbnail(i.thumbnail)
            .setFooter('Timed out at: ')
            .setTimestamp()
            .addField(`⏰ **This party request has timed out.** ⏰`, `**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`);
        var ch = bot.channels.get(e.channel);
        ch.fetchMessage(e.id).then(message => {
            bot.lfgStack.delete(id);		
            message.edit({ embed }).then(() => {
                console.log(chalk.bgCyan.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG for ${e.game} has timed out.`));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    },

    /* * * 
    Running out of time on LFG, send out a warning message >>
    * * */
    warning: function (bot, id, timeleft) {
        var e = bot.lfgStack.get(id); var i = bot.games.get(e.code); var j = i.modes.indexOf(e.mode);
        var embed = new Discord.RichEmbed()
            .setTitle(`${e.party_leader_name}'s party has ${timeleft} minutes left before it times out!`)
            .setDescription(`**Game:** ${e.game}\n**Game mode:** ${i.modes_proper[j]}\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`)
            .setColor(0x009395);
        e.warning = true;
        var ch = bot.channels.get(e.channel);
        ch.send({ embed });
        console.log(chalk.bgCyan.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG is running out of time.`));        
    },

    /* * * 
    Party is full, LFG is complete ✓ >>
    * * */
    complete: function (bot, id) {
        var e = bot.lfgStack.get(id); var i = bot.games.get(e.code); var j = i.modes.indexOf(e.mode);
        var embed = new Discord.RichEmbed()
            .setTitle(`${e.party_leader_name}'s party is now full & ready to go!`)
            .setDescription(`**Game:** ${e.game}\n**Game mode:** ${i.modes_proper[j]}\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')}`)
            .setColor(0x009395)
            .setThumbnail("https://i.imgur.com/RsRmWcm.png");
        var ch = bot.channels.get(e.channel);
        ch.send({embed});
        bot.lfgStack.delete(id);
        console.log(chalk.bgCyan.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG party for ${e.game} is full.`));        
    },

    /* * *
    Cancel party >> 
    * * */
    cancel: function (bot, id, removed) {
        var e = bot.lfgStack.get(id);
        var i = bot.games.get(e.code);
        var j = i.modes.indexOf(e.mode);
        var embed = new Discord.RichEmbed()
            .setTitle(`${e.party_leader_name}'s party has been cancelled`)
            .setDescription(`**Game:** ${e.game}\n**Game mode:** ${i.modes_proper[j]}\n**Party:** ${e.party.map(m => `<@${m}>`).join(' ')} (${e.party.length}/${e.max_party_size})`)
            .setColor(0x009395)
            .setFooter(`Cancelled at: `)
            .setTimestamp()
            .setThumbnail("https://i.imgur.com/jSYuGrc.png");
        if (removed) {
            bot.lfgStack.delete(id);
            return console.log(chalk.bgCyan.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG party for ${e.game} has been deleted.`));
        }
        let ch = bot.channels.get(e.channel);
        ch.fetchMessage(e.id).then(message => {
            message.edit({ embed }).then(() => {
                bot.lfgStack.delete(id);
                console.log(chalk.bgCyan.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${e.party_leader_name}'s LFG party for ${e.game} has been cancelled.`));
            }).catch(err => console.log(err));
        }).catch(err => {
            console.log(err)
        });
    }
};