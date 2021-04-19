// Handles all LFG-related events

const chalk = require('chalk');
const Discord = require('discord.js');
const moment = require('moment');
const settings = require('../settings');

const INTERVAL = settings.lfg.update_interval;
const DEFAULT_EMBED_COLOR = 0x009395;
const ACCEPT_LFG_EMOJI = '👍';
const CANCEL_LFG_EMOJI = '🚫';

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
 * Builds a Discord embed message to send for the LFG
 *
 * @returns {import('discord.js').EmbedField}
 */
const buildMessage = (bot, lfgObj, { type = 'default' } = {}) => {
  const embed = new Discord.MessageEmbed();
  const game = bot.games.get(lfgObj.code);
  const mode = game.modes.indexOf(lfgObj.mode);
  const indexOfGame = game.modes.indexOf(lfgObj.mode);

  /* Configure options for Rich Embed */
  const color = DEFAULT_EMBED_COLOR;
  const title = ''; // not currently being used, but you can enable this for your own use case
  let titleText = `${lfgObj.party_leader_name} is looking for a ${lfgObj.game} group!`;
  const titleThumbnail = lfgObj.platform ? lfgObj.platform.thumbnail : null;
  let gameThumbnail = game.thumbnail;
  let lfgDescription = `${lfgObj.platform ? `**Platform:** ${lfgObj.platform.properName}\n` : ''}`
    + `**Game mode:** ${game.modes_proper[indexOfGame]}\n`
    + `${lfgObj.rank ? `**Rank:** ${game.ranks_proper[game.ranks.indexOf(lfgObj.rank)]}\n` : ''}`
    + `**Party size:** ${lfgObj.max_party_size}\n`;
  let fields = [[
    'Want to join?',
    `Click the ${ACCEPT_LFG_EMOJI} below to reserve a spot!\n<@${lfgObj.party_leader_id}>, click the ${CANCEL_LFG_EMOJI} below to cancel the party.\n\n**Party:** ${lfgObj.party.map(id => `<@${id}>`).join(' ')} (${lfgObj.party.length}/${lfgObj.max_party_size})`,
  ]];
  let expirationLabel = 'Expires';
  const footerThumbnail = null; // not currently being used, but you can enable this for your own use case
  let timestamp = lfgObj.expire_date;
  let rankImage = lfgObj.rank ? game.rank_thumbnails[game.ranks.indexOf(lfgObj.rank)] : null;

  switch (type) {
    case 'timeout':
      fields = [
        [
          '⏰ **This LFG request has timed out.** ⏰',
          `**Party:** ${lfgObj.party.map(id => `<@${id}>`).join(' ')} (${lfgObj.party.length}/${lfgObj.max_party_size})`,
        ],
      ];
      expirationLabel = 'Timed out';
      timestamp = null;
      rankImage = null;
      break;

    case 'cancelled':
      titleText = `${lfgObj.party_leader_name}'s party has been cancelled`;
      gameThumbnail = 'https://i.imgur.com/jSYuGrc.png';
      lfgDescription = `**Game:** ${lfgObj.game}\n`
        + `${lfgObj.platform !== null ? `**Platform:** ${lfgObj.platform.properName}\n` : ''}`
        + `**Game mode:** ${game.modes_proper[mode]}\n`
        + `**Party:** ${lfgObj.party.map(id => `<@${id}>`).join(' ')} (${lfgObj.party.length}/${lfgObj.max_party_size})`;
      fields = [];
      timestamp = null;
      expirationLabel = 'Cancelled';
      break;

    case 'default':
    default:
      break;
  }

  /**
   * @description
   * This is to override for your own implementation of the LFG message
   */
  const lfgMessageOverrides = {
    /* *********************************** */
    /* LFG Message Overrides go here       */
    /* ***********************************

    // Uncomment or add below to start customizing
    -----------------------------------------
    // Color of left message accent
    color: '#fff', // White

    // This text will go under the top most title
    // (which is usually reserved for the 'author' of the message)',
    topTitleText: 'custom title!',

    // Image in top left, left of the title text labeled above
    topLeftImage: 'url to some image',

    // This text goes right underneath the top title and above the body
    subtitle: 'subtitle text'

    // Top-right image thumbnail
    topRightImage: thumbnail,

    // Description that labels the body content
    bodyTitle: description,

    // Array of arrays. "Fields" for the content of the body
    // [
    //   [ fieldName0, fieldValue0 ],
    //   [ fieldName1, fieldValue1 ]
    //   ... etc.
    // ]
    bodyContent: [ ['some field name', 'content of the field'] ],

    // Image at the bottom of the body
    bodyImage: image,

    // Footer label
    footerText: footer,

    // Footer image thumbnail (bottom-left most image)
    footerImage: footerThumbnail,

    // "Timestamp" that displays to the right of the footerText
    footerTimeStamp: timestamp,
    ----------------------------------------- */
  };

  const embedVars = Object.assign({}, {
    /* Default values */
    color,
    topTitleText: titleText,
    topLeftImage: titleThumbnail,
    subtitle: title,
    topRightImage: gameThumbnail,
    bodyTitle: lfgDescription,
    bodyContent: fields,
    bodyImage: rankImage,
    footerText: expirationLabel,
    footerImage: footerThumbnail,
    footerTimeStamp: timestamp,
  }, lfgMessageOverrides);

  /* Set up the Discord Rich Embed message */
  embed.setColor(embedVars.color);
  embed.setAuthor(embedVars.topTitleText, embedVars.topLeftImage);
  embed.setTitle(embedVars.subtitle);
  embed.setThumbnail(embedVars.topRightImage);
  embed.setDescription(embedVars.bodyTitle);
  embedVars.bodyContent.forEach(([fieldName, value]) => embed.addField(fieldName, value));
  embed.setImage(embedVars.bodyImage);
  embed.setFooter(embedVars.footerText, embedVars.footerImage);
  embed.setTimestamp(embedVars.footerTimeStamp);

  return embed;
};

/**
 * Finish and end collectors in given LFG
 * @param {*} lfg Particular lfg object to clear collectors from
 */
const clearCollectors = (lfg, reason = null) => {
  lfg.collectors.forEach((collector) => {
    collector.stop(reason);
  });
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
    const embed = new Discord.MessageEmbed()
      .setTitle(`${stack.party_leader_name}'s party is now full & ready to go!`)
      .setDescription(`**Game:** ${stack.game}\n**Game mode:** ${game.modes_proper[mode]}\n**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')}`)
      .setColor(0x009395)
      .setThumbnail('https://i.imgur.com/RsRmWcm.png');

    const ch = bot.channels.cache.get(stack.channel);
    ch.send({ embed });

    if (settings.lfg.delete_on_complete) {
      bot.channels.cache.get(stack.channel).messages.cache.get(id).then(messageToDelete => messageToDelete.delete());
    }

    // Remove from LFG stack
    clearCollectors(bot.lfgStack.get(id), 'complete');
    bot.lfgStack.delete(id);
    if (bot.lfgStack.size === 0) bot.lfgUpdate(false);

    console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} is full.`));
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

    // If the message was deleted, do this stuff:
    if (removed) {
      bot.lfgStack.delete(id);
      if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
      return console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} has been deleted.`));
    }

    // Attempt to fetch message
    bot.channels.cache.get(stack.channel).messages.fetch(stack.id).then((message) => {
      const afterCancel = () => {
        bot.lfgStack.delete(id);
        if (bot.lfgStack.size === 0) bot.lfgUpdate(false);
        console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG party for ${stack.game} has been cancelled.`));
      };

      if (settings.lfg.delete_on_cancel) {
        message.delete().then(afterCancel).catch(err => console.error(err));
      } else {
        const embed = buildMessage(bot, stack, { type: 'cancelled' });
        message.edit({ embed }).then(afterCancel).catch(err => console.error(err));
      }
    });

    return 0;
  } catch (err) {
    return console.error(err);
  }
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
    // Edit or delete LFG message when it times out
    const stack = bot.lfgStack.get(id);
    const ch = bot.channels.cache.get(stack.channel);

    ch.messages.fetch(stack.id).then((message) => {
      const logTimeout = () => {
        console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG for ${stack.game} has timed out.`));
      };

      clearCollectors(bot.lfgStack.get(id), 'Timeout');
      bot.lfgStack.delete(id);
      if (bot.lfgStack.size === 0) bot.lfgUpdate(false);

      if (settings.lfg.delete_on_timeout) {
        message.delete().then(logTimeout).catch(err => console.error(err));
      } else {
        const embed = buildMessage(bot, stack, { type: 'timeout' });

        message.edit({ embed }).then(logTimeout).catch(err => console.error(err));
      }
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
    const embed = new Discord.MessageEmbed()
      .setTitle(`${stack.party_leader_name}'s party has ${timeLeft} minutes left before it times out!`)
      .setDescription(`**Game:** ${stack.game}\n**Game mode:** ${game.modes_proper[mode]}\n**Party:** ${stack.party.map(m => `<@${m}>`).join(' ')} (${stack.party.length}/${stack.max_party_size})`)
      .setColor(0x009395);
    stack.warning = true;
    const ch = bot.channels.cache.get(stack.channel);
    ch.send({ embed });
    console.log(chalk.bgYellow.black(`[${moment().format(settings.timeFormat)}] ${stack.party_leader_name}'s LFG is running out of time.`));
  } catch (err) {
    console.error(err);
  }
};


/**
 * @function addToParty
 * Add a user into an LFG party
 *
 * @param {import('discord.js').Client} bot
 * @param {import('discord.js').Snowflake} id - LFG id
 * @param {import('discord.js').Snowflake} userid - User id to add into LFG party
 */
const addToParty = async (bot, id, userid) => {
  try {
    // Push user into party array
    const stack = bot.lfgStack.get(id);
    stack.party.push(userid);

    const embed = buildMessage(bot, stack);

    /** @type {import('discord.js').TextChannel} */
    const ch = bot.channels.cache.get(stack.channel);
    const { guild } = ch;

    if (ch.type !== 'text') throw new Error('Not a text channel, can\'t add to party.');

    // Update previous LFG embed
    ch.messages.fetch(stack.id).then((message) => {
      message.edit(embed).catch(err => console.error(err));
    }).catch(err => console.error(err));

    bot.lfgStack.set(id, stack);

    // Attempt to move user into party leader's channel
    if (settings.lfg.move_to_vc) {
      const memberToMoveTo = guild.members.cache.get(bot.lfgStack.get(id).party_leader_id);
      const memberToMove = guild.members.cache.get(userid);
      if (typeof memberToMoveTo.voiceChannel !== 'undefined') {
        memberToMove.edit({ channel: memberToMoveTo.voiceChannelID }, `Moved by @${settings.botNameProper} for LFG`).then().catch(err => console.error(err));
      }
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
      const ch = bot.channels.cache.get(stack.channel);
      ch.messages.fetch(stack.id).then((message) => {
        message.edit({ embed }).then(() => {
        }).catch(err => console.error(err));
      }).catch(err => console.error(err));
    } else return;
  } catch (err) { console.error(err); }
};


/**
 * Event that happens when the ADD_LFG_EMOJI reaction is collected
 * @param {import('discord.js').MessageReaction} messageReaction
 * @param {import('discord.js').User} user
 * @param {import('discord.js').Client} bot
 */
const addLfgReaction = (messageReaction, user, bot) => {
  if (user.bot) return;
  if (bot.lfgStack.has(messageReaction.message.id)) {
    if (user.id !== bot.lfgStack.get(messageReaction.message.id).party_leader_id) {
      addToParty(bot, messageReaction.message.id, user.id);
    }
  }
};


/**
 * Event that happens when the CANCEL_LFG_EMOJI reaction is collected
 * @param {import('discord.js').MessageReaction} messageReaction
 * @param {import('discord.js').User} user
 * @param {import('discord.js').Client} bot
 */
const cancelLfgReaction = (messageReaction, user, bot) => {
  if (bot.lfgStack.has(messageReaction.message.id)) {
    if (user.id === bot.lfgStack.get(messageReaction.message.id).party_leader_id) {
      cancel(bot, messageReaction.message.id, false);
    }
  }
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
    const isFirstEntry = bot.lfgStack.size === 0;

    const embed = buildMessage(bot, object);

    /** @param {typeof import('discord.js').Message} message */
    bot.channels.cache.get(object.channel).send({ embed }).then((message) => {
      object.id = message.id;
      object.collectors = [];

      message.react(ACCEPT_LFG_EMOJI).then(() => {
        const addCollector = new Discord.ReactionCollector(
          message,
          ({ _emoji }) => _emoji.name === ACCEPT_LFG_EMOJI,
        );

        addCollector.on('collect', (reaction, user) => addLfgReaction(reaction, user, bot));
        object.collectors.push(addCollector);

        message.react(CANCEL_LFG_EMOJI).then(() => {
          const cancelCollector = new Discord.ReactionCollector(
            message,
            ({ _emoji }) => _emoji.toString() === CANCEL_LFG_EMOJI,
          );

          cancelCollector.on('collect', (reaction, user) => cancelLfgReaction(reaction, user, bot));
          object.collectors.push(cancelCollector);
          bot.lfgStack.set(object.id, object);

          if (isFirstEntry) bot.lfgUpdate(true, INTERVAL);

          console.log(chalk.bgYellow.black([
            `[${moment().format(settings.timeFormat)}] ${object.party_leader_name} made an LFG for ${object.game}`,
            object.mode,
            object.platform ? `platform: ${object.platform.properName}} |` : null,
            `party of ${object.max_party_size}`,
            `${object.ttl} minutes`,
          ].join(' | ')));
        }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
      }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`)));
    }).catch(err => console.error(err));
  } catch (err) {
    console.error(err);
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
  addLfgReaction,
  cancelLfgReaction,
  clearCollectors,
  addLFG,
  addToParty,
  removeFromParty,
  timeout,
  warning,
  complete,
  cancel,
  update,
};
