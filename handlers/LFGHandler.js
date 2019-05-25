// Handles all LFG-related events

const chalk = require('chalk');
const Discord = require('discord.js');
const moment = require('moment');
const settings = require('../settings');

const INTERVAL = settings.lfg.update_interval;

const DEFAULT_EMBED_COLOR = 0x009395;

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

/**
 * @function buildMessage
 * Builds a RichEmbed Discord message to send for the LFG
 *
 * @returns {Discord.RichEmbed}
 */
const buildMessage = (bot, lfgObj, { type = 'default' } = {}) => {
  const embed = new Discord.RichEmbed();
  const game = bot.games.get(lfgObj.code);
  const mode = game.modes.indexOf(lfgObj.mode);
  const indexOfGame = game.modes.indexOf(lfgObj.mode);

  /* Configure options for Rich Embed */
  const color = DEFAULT_EMBED_COLOR;
  let title = `${lfgObj.party_leader_name} is looking for a ${lfgObj.game} group!`;
  let { thumbnail } = game;
  let description = `**Game mode:** ${game.modes_proper[indexOfGame]}\n**Party size:** ${lfgObj.max_party_size}`;
  let fields = [[
    'Want to join?',
    `Click the 👍 below to reserve a spot!\n${lfgObj.party_leader_name}: click the 🚫 below to cancel the party.\n\n**Party:** <@${lfgObj.party_leader_id}> (1/${lfgObj.max_party_size})`,
  ]];
  let footer = 'Expires';
  let timestamp = lfgObj.expire_date;

  switch (type) {
    case 'timeout':
      fields = [
        [
          '⏰ **This LFG request has timed out.** ⏰',
          `**Party:** ${lfgObj.party.map(m => `<@${m}>`).join(' ')} (${lfgObj.party.length}/${lfgObj.max_party_size})`,
        ],
      ];
      footer = 'Timed out';
      timestamp = null;
      break;

    case 'cancelled':
      title = `${lfgObj.party_leader_name}'s party has been cancelled`;
      thumbnail = 'https://i.imgur.com/jSYuGrc.png';
      description = `**Game:** ${lfgObj.game}\n**Game mode:** ${game.modes_proper[mode]}\n**Party:** ${lfgObj.party.map(m => `<@${m}>`).join(' ')} (${lfgObj.party.length}/${lfgObj.max_party_size})`;
      fields = [];
      timestamp = null;
      footer = 'Cancelled';
      break;

    case 'default':
    default:
      break;
  }

  /* Set up the Discord Rich Embed message */
  embed.setColor(color);
  /* Header */
  embed.setTitle(title);
  embed.setThumbnail(thumbnail);
  /* Body */
  embed.setDescription(description);
  fields.forEach(([fieldName, value]) => embed.addField(fieldName, value));
  /* Footer */
  embed.setFooter(footer);
  embed.setTimestamp(timestamp);

  return embed;
};

/**
 * @function addLFG
 * Adds new LFG party to the LFG stack
 *
 * @param {Discord.Client} bot
 * @param {object} obj -- lfg object which contains all information as shown above
 */
const addLFG = (bot, object) => {
  try {
    let isFirstEntry;

    if (bot.lfgStack.size === 0) isFirstEntry = true;

    const embed = buildMessage(bot, object);

    bot.channels.get(object.channel).send({ embed }).then((message) => {
      object.id = message.id;
      bot.lfgStack.set(object.id, object);
      if (isFirstEntry) bot.lfgUpdate(true, INTERVAL);
      message.react('👍').then(() => {
        message.react('🚫').then(() => {
          console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${object.party_leader_name} made an LFG for ${object.game} | ${object.mode} | party of ${object.max_party_size} | ${object.ttl} minutes`));
        }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
      }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
    }).catch(err => console.error(err));
  } catch (err) {
    console.error(err);
  }
};


/**
 * @func complete
 * Party is full; Complete the LFG party ✓
 *
 * @param {Discord.Client} bot
 * @param {Snowflake} id - LFG id
 */
const complete = (bot, id) => {
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

    // Remove from LFG stack
    bot.lfgStack.delete(id);
    if (bot.lfgStack.size === 0) bot.lfgUpdate(false);

    console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} is full.`));
  } catch (err) {
    console.error(err);
  }
};

/**
 * @function addToParty
 * Add a user into an LFG party
 *
 * @param {Discord.Client} bot
 * @param {Snowflake} id - LFG id
 * @param {Snowflake} userid - User id to add into LFG party
 */
const addToParty = (bot, id, userid) => {
  try {
    // Push user into party array
    const stack = bot.lfgStack.get(id);
    stack.party.push(userid);

    const embed = buildMessage(bot, stack);
    const ch = bot.channels.get(stack.channel);
    const { guild } = ch;

    ch.fetchMessage(stack.id).then((message) => {
      message.edit({ embed }).then(() => {
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));

    bot.lfgStack.set(id, stack);

    // Attempt to move user into party leader's channel
    const memberToMoveTo = guild.members.get(bot.lfgStack.get(id).party_leader_id);
    const memberToMove = guild.members.get(userid);
    if (typeof memberToMoveTo.voiceChannel !== 'undefined') {
      memberToMove.edit({ channel: memberToMoveTo.voiceChannelID }, `Moved by @${settings.botNameProper} for LFG`).then().catch(err => console.error(err));
    }

    // Check if the party is full
    if (stack.party.length === stack.max_party_size) {
      complete(bot, id);
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * @func removeFromParty
 * Remove a user from an LFG party
 *
 * @param {Discord.Client} bot
 * @param {Snowflake} id - LFG id
 * @param {Snowflake} userid - User id to remove from LFG party
 */
const removeFromParty = (bot, id, userid) => {
  try {
    // Remove user from party array
    const index = bot.lfgStack.get(id).party.indexOf(userid);
    if (index > -1) {
      bot.lfgStack.get(id).party.splice(index, 1);
      const stack = bot.lfgStack.get(id);
      const embed = buildMessage(bot, stack);
      const ch = bot.channels.get(stack.channel);
      ch.fetchMessage(stack.id).then((message) => {
        message.edit({ embed }).then(() => {
        }).catch(err => console.error(err));
      }).catch(err => console.error(err));
    } else return;
  } catch (err) { console.error(err); }
};

/**
 * @func timeout
 * LFG party is timed out, remove from the LFG stack
 *
 * @param {Discord.Client} bot
 * @param {Snowflake} id - LFG id
 */
const timeout = (bot, id) => {
  try {
    // Edit LFG message
    const stack = bot.lfgStack.get(id);
    const embed = buildMessage(bot, stack, { type: 'timeout' });

    const ch = bot.channels.get(stack.channel);
    ch.fetchMessage(stack.id).then((message) => {
      bot.lfgStack.delete(id);
      if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
      message.edit({ embed }).then(() => {
        console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG for ${stack.game} has timed out.`));
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));
  } catch (err) {
    console.error(err);
  }
};


/**
 * @func warning
 * Running out of time on LFG party; Issue warning message
 *
 * @param {Discord.Client} bot
 * @param {Snowflake} id - LFG id
 * @param {Number} timeLeft - Minutes remaining on LFG party
 */
const warning = (bot, id, timeLeft) => {
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
    console.error(err);
  }
};


/**
 * @func cancel
 * Cancel the LFG party
 *
 * @param bot
 * @param id - LFG id
 * @param removed - Whether the LFG party message was removed or not
 */
const cancel = (bot, id, removed) => {
  try {
    const stack = bot.lfgStack.get(id);
    const embed = buildMessage(bot, stack, { type: 'cancelled' });

    // If the message was deleted, do this stuff:
    if (removed) {
      bot.lfgStack.delete(id);
      if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
      return console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} has been deleted.`));
    }

    // Attempt to fetch message
    bot.channels.get(stack.channel).fetchMessage(stack.id).then((message) => {
      message.edit({ embed }).then(() => {
        // Remove from LFG stack and edit message
        bot.lfgStack.delete(id);
        if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
        return console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} has been cancelled.`));
      }).catch(err => console.error(err));
    }).catch(err => console.error(err));

    return 0;
  } catch (err) {
    return console.error(err);
  }
};

/**
 * @func update
 * LFG update interval function
 *
 * @param bot
 */
const update = (bot) => {
  try {
    const d = new Date();

    bot.lfgStack.forEach((l) => {
      /** Booleans to check */
      const timedOut = (d.getTime() >= l.time + (l.ttl * 60000));
      const ttlExceedsThreshold = l.ttl >= settings.lfg.ttl_threshold;
      const alreadySentWarning = l.warning;
      const shouldSendWarning = settings.lfg.ttl_warning;
      const warningTimeMet = (l.time + ((l.ttl * 60000) - d.getTime())) <= (Math.round((l.ttl * 60000) / 4));
      const sendWarning = (ttlExceedsThreshold && !alreadySentWarning && shouldSendWarning && warningTimeMet);

      if (timedOut) {
        timeout(bot, l.id);
      } else if (sendWarning) {
        const timeLeft = Math.round(Math.round((60000 * l.ttl) / 4) / 60000);
        warning(bot, l.id, timeLeft);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  buildMessage,
  addLFG,
  addToParty,
  removeFromParty,
  timeout,
  warning,
  complete,
  cancel,
  update,
};
