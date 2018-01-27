// Handles all LFG-related events

const chalk = require('chalk');
const Discord = require('discord.js');
const moment = require('moment');
const settings = require('../settings');

const INTERVAL = settings.lfg.update_interval;

/**
 * Format for all LFG requests, embedded in the Client (bot) object -->
 *
 * 'LFG ID' => {
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
 *  @param {Boolean} warning, Has a warning been sent out yet?
 * }
 */

module.exports = {
  /**
   * @func addLFG
   * Adds new LFG party to the LFG stack
   *
   * @param {Discord.Client} bot
   * @param {object} obj -- lfg object which contains all information as shown above
   */
  addLFG(bot, object) {
    try {
      let firstEntry;
      if (bot.lfgStack.size === 0) firstEntry = true;
      const g = bot.games.get(object.code);
      const index = g.modes.indexOf(object.mode);

      const embed = new Discord.RichEmbed()
        .setTitle(`${object.party_leader_name} is looking for a ${object.game} group!`)
        .setDescription(`**Game mode:** ${g.modes_proper[index]}\n**Party size:** ${object.max_party_size}`)
        .setColor(0x009395)
        .setThumbnail(g.thumbnail)
        .setFooter('Expires at: ')
        .setTimestamp(object.expire_date)
        .addField('Want to join?', `Click the 👍 below to reserve a spot!\n${object.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** <@${object.party_leader_id}> (1/${object.max_party_size})`);
      bot.channels.get(object.channel).send({ embed }).then((message) => {
        object.id = message.id;
        bot.lfgStack.set(object.id, object);
        if (firstEntry) bot.lfgUpdate(true, INTERVAL);
        message.react('👍').then(() => {
          message.react('🚫').then(() => {
            console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${object.party_leader_name} made an LFG for ${object.game} | ${object.mode} | party of ${object.max_party_size} | ${object.ttl} minutes`));
          }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
        }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
      }).catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * @func addToParty
   * Add a user into an LFG party
   *
   * @param {Discord.Client} bot
   * @param {Snowflake} id - LFG id
   * @param {Snowflake} userid - User id to add into LFG party
   */
  addToParty(bot, id, userid) {
    try {
      // Push user into party array
      const stack = bot.lfgStack.get(id);
      stack.party.push(userid);
      const game = bot.games.get(stack.code);
      const mode = game.modes.indexOf(stack.mode);
      const embed = new Discord.RichEmbed()
        .setTitle(`${stack.party_leader_name} is looking for a ${game.name} group!`)
        .setDescription(`**Game mode:** ${game.modes_proper[mode]}\n**Party size:** ${stack.max_party_size}`)
        .setColor(0x009395)
        .setThumbnail(game.thumbnail)
        .setFooter('Expires at ')
        .setTimestamp(stack.expire_date)
        .addField('Want to join?', `Click the 👍 below to reserve a spot!\n${stack.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')} (${stack.party.length}/${stack.max_party_size})`);
      const ch = bot.channels.get(stack.channel);
      const g = ch.guild;
      ch.fetchMessage(stack.id).then((message) => {
        message.edit({ embed }).then(() => {
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));
      bot.lfgStack.set(id, stack);

      // Attempt to move user into party leader's channel
      const memberToMoveTo = g.members.get(bot.lfgStack.get(id).party_leader_id);
      const memberToMove = g.members.get(userid);
      if (typeof memberToMoveTo.voiceChannel !== 'undefined') {
        memberToMove.edit({ channel: memberToMoveTo.voiceChannelID }, `Moved by @${settings.botNameProper} for LFG`).then().catch(err => console.log(err));
      }

      // Check if the party is full
      if (stack.party.length === stack.max_party_size) this.complete(bot, id);
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * @func removeFromParty
   * Remove a user from an LFG party
   *
   * @param {Discord.Client} bot
   * @param {Snowflake} id - LFG id
   * @param {Snowflake} userid - User id to remove from LFG party
   */
  removeFromParty(bot, id, userid) {
    try {
      // Remove user from party array
      const index = bot.lfgStack.get(id).party.indexOf(userid);
      if (index > -1) {
        bot.lfgStack.get(id).party.splice(index, 1);
        const stack = bot.lfgStack.get(id);
        const game = bot.games.get(stack.code);
        const mode = game.modes.indexOf(stack.mode);
        const embed = new Discord.RichEmbed()
          .setTitle(`${stack.party_leader_name} is looking for a ${game.name} group!`)
          .setDescription(`**Game mode:** ${game.modes_proper[mode]}\n**Party size:** ${stack.max_party_size}`)
          .setColor(0x009395)
          .setThumbnail(game.thumbnail)
          .setFooter('Expires at ')
          .setTimestamp(stack.expire_date)
          .addField('Want to join?', `Click the 👍 below to reserve a spot!\n${stack.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')} (${stack.party.length}/${stack.max_party_size})`);
        const ch = bot.channels.get(stack.channel);
        ch.fetchMessage(stack.id).then((message) => {
          message.edit({ embed }).then(() => {
          }).catch(err => console.log(err));
        }).catch(err => console.log(err));
      } else return;
    } catch (err) { console.log(err); }
  },

  /**
   * @func timeout
   * LFG party is timed out, remove from the LFG stack
   *
   * @param {Discord.Client} bot
   * @param {Snowflake} id - LFG id
   */
  timeout(bot, id) {
    try {
      // Edit LFG message
      const stack = bot.lfgStack.get(id);
      const game = bot.games.get(stack.code);
      const mode = game.modes.indexOf(stack.mode);
      const embed = new Discord.RichEmbed()
        .setTitle(`${stack.party_leader_name} is looking for a ${game.name} group!`)
        .setDescription(`**Game mode:** ${game.modes_proper[mode]}\n**Party size:** ${stack.max_party_size}`)
        .setColor(0x009395)
        .setThumbnail(game.thumbnail)
        .setFooter('Timed out at ')
        .setTimestamp()
        .addField('⏰ **This LFG request has timed out.** ⏰', `**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')} (${stack.party.length}/${stack.max_party_size})`);
      const ch = bot.channels.get(stack.channel);
      ch.fetchMessage(stack.id).then((message) => {
        bot.lfgStack.delete(id);
        if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
        message.edit({ embed }).then(() => {
          console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG for ${stack.game} has timed out.`));
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * @func warning
   * Running out of time on LFG party; Issue warning message
   *
   * @param {Discord.Client} bot
   * @param {Snowflake} id - LFG id
   * @param {Number} timeLeft - Minutes remaining on LFG party
   */
  warning(bot, id, timeLeft) {
    try {
      const stack = bot.lfgStack.get(id);
      const game = bot.games.get(stack.code);
      const mode = game.modes.indexOf(stack.mode);
      const embed = new Discord.RichEmbed()
        .setTitle(`${stack.party_leader_name}'s party has ${timeLeft} minutes left before it times out!`)
        .setDescription(`**Game:** ${stack.game}\n**Game mode:** ${game.modes_proper[mode]}\n**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')} (${stack.party.length}/${stack.max_party_size})`)
        .setColor(0x009395);
      stack.warning = true;
      const ch = bot.channels.get(stack.channel);
      ch.send({ embed });
      console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG is running out of time.`));
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * @func complete
   * Party is full; Complete the LFG party ✓
   *
   * @param {Discord.Client} bot
   * @param {Snowflake} id - LFG id
   */
  complete(bot, id) {
    try {
      const stack = bot.lfgStack.get(id);
      const game = bot.games.get(stack.code);
      const mode = game.modes.indexOf(stack.mode);
      const embed = new Discord.RichEmbed()
        .setTitle(`${stack.party_leader_name}'s party is now full & ready to go!`)
        .setDescription(`**Game:** ${stack.game}\n**Game mode:** ${game.modes_proper[mode]}\n**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')}`)
        .setColor(0x009395)
        .setThumbnail('https://i.imgur.com/RsRmWcm.png');
      const ch = bot.channels.get(stack.channel);
      ch.send({ embed });
      bot.lfgStack.delete(id);
      if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
      console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} is full.`));
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * @func cancel
   * Cancel the LFG party
   *
   * @param bot
   * @param id - LFG id
   * @param removed - Whether the LFG party message was removed or not
   */
  /* eslint-disable */
  cancel(bot, id, removed) {
    try {
      const stack = bot.lfgStack.get(id);
      const game = bot.games.get(stack.code);
      const mode = game.modes.indexOf(stack.mode);
      const embed = new Discord.RichEmbed()
        .setTitle(`${stack.party_leader_name}'s party has been cancelled`)
        .setDescription(`**Game:** ${stack.game}\n**Game mode:** ${game.modes_proper[mode]}\n**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')} (${stack.party.length}/${stack.max_party_size})`)
        .setColor(0x009395)
        .setFooter('Cancelled at ')
        .setTimestamp()
        .setThumbnail('https://i.imgur.com/jSYuGrc.png');
      if (removed) {
        bot.lfgStack.delete(id);
        if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
        return console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} has been deleted.`));
      }
      const ch = bot.channels.get(stack.channel);
      ch.fetchMessage(stack.id).then((message) => {
        message.edit({ embed }).then(() => {
          bot.lfgStack.delete(id);
          if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
          console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} has been cancelled.`));
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * @func update
   * LFG update interval function
   *
   * @param bot
   */
  update(bot) {
    try {
      const d = new Date();
      bot.lfgStack.forEach((l) => {
        const timedOut = (d.getTime() >= l.time + (l.ttl * 60000));
        let sendWarning = ((l.ttl >= settings.lfg.ttl_threshold) && !l.warning && settings.lfg.ttl_warning && (l.time + ((l.ttl * 60000) - d.getTime()) <= Math.round((l.ttl * 60000) / 4)));
        if (timedOut) {
          this.timeout(bot, l.id);
        } else if (sendWarning) {
          const timeLeft = Math.round(Math.round((60000 * l.ttl) / 4) / 60000);
          this.warning(bot, l.id, timeLeft);
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
};
