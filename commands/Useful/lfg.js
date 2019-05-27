/**
 * @func !lfg
 *
 * @desc Announces that you are looking to play a game. Create parties, join or leave current ones, etc.
 */

let lfgHandler = require('../../handlers/LFGHandler');

const lfgFuncMRA = require('../../events/messageReactionAdd');
const lfgFuncMRR = require('../../events/messageReactionRemove');
const lfgFuncMD = require('../../events/messageDelete');
const settings = require('../../settings');

const countRegexMatches = (str, regex) => (str.match(new RegExp(regex, 'g')) || []).length;

const parseRestArgs = (args, bot, game) => {
  let hours = 0;
  let mins = -1;
  let partySize = 0;
  let platform = null;
  let rank = null;

  const timeRegexHoursMins = /$[0-9]+h[0-9]+m/;
  const timeRegexMinsHours = /$[0-9]+m[0-9]+h/;
  const timeRegexHours = /$[0-9]+h/;
  const timeRegexMins = /$[0-9]+m/;
  const regexJustNumber = /$[0-9]+(?!\D)/;
  const isAWord = /[a-z0-9]+/;

  args.forEach((arg) => {
    if (arg.match(timeRegexHoursMins)) {
      const argArray = arg.split('h');
      hours = parseInt(argArray[0], 10);
      mins = parseInt(argArray[1], 10);
    } else if (arg.match(timeRegexMinsHours)) {
      const argArray = arg.split('m');
      mins = parseInt(argArray[0], 10);
      hours = parseInt(argArray[1], 10);
    } else if (arg.match(timeRegexHours)) {
      hours = parseInt(arg.split('h')[0], 10);
    } else if (arg.match(timeRegexMins)) {
      mins = parseInt(arg.split('m')[0], 10);
    } else if (arg.match(regexJustNumber)) {
      const countMatches = countRegexMatches(arg, /\d/);

      if (countMatches === arg.length) {
        partySize = parseInt(arg, 10);
      }
    } else if (arg.match(isAWord)) {
      // Argument is a word... is it a platform?
      if (bot.platforms.has(arg) || bot.platformAliases.has(arg)) {
        const platformToCheck = bot.platforms.get(arg) || bot.platforms.get(bot.platformAliases.get(arg));

        // Only add platform if it's a platform listed under the game
        if (game.platforms.includes(platformToCheck.code)) {
          platform = platformToCheck;
        }
      } else if (game.ranks.has(arg)) {
        rank = game.ranks_proper[game.ranks.indexOf(arg)];
      }
    }
  });

  return [hours, mins, partySize, platform, rank];
};

/**
 * @todo FIX HELP MENU FOR NEW TTL AND PARTY SIZE METHODS
 */
exports.help = {
  name: 'lfg',
  description: 'Look for players to join you in a game',
  usage: 'lfg <game> [mode] [platform] [ranking] [partySize] [expirationTime(*h*m format))]' +
         '\n\n<game> is *mandatory*, and doesn\'t include spaces\n[mode], [partySize], [expirationTime] are all optional' +
         '\n\n- These three options, if used, must be given *consecutively and in order*.' +
         '\n- That is, in order to give the party size, you must have a mode chosen, and in order to specify the time left to expire, you must have a party size set.' +
         '\n\n- Default gamemode & party size depend on the game and gamemode respectively\n- \'Any\' & \'default\' are valid gamemodes for every game!' +
         `\n- Default time is set to ${settings.lfg.ttl_default} minutes.\n- Party size & time must be given as positive integers.` +
         `\n\nMore LFG Commands ::\nUse "${settings.prefix}lfg list" to see what games you can use!` +
         `\nUse "${settings.prefix}lfg list <game>" to see more info on a specific game` +
         `\nUse "${settings.prefix}lfg help" as an alternative way to access this help menu` +
         `\n\nExamples ::\n${settings.prefix}lfg lol aram 4 20  ║ League of Legends - ARAM - Party of 4 - 20 minute timer\n` +
         `${settings.prefix}lfg pubg default 2 ║ PUBG - Default gamemode - Party of 2 - Default timer\n` +
         `${settings.prefix}lfg ow any         ║ Overwatch - Any gamemode - Default party size - Default timer\n` +
         '\nWarnings :: (these won\'t work the way you probably intended them to)\n' +
         `${settings.prefix}lfg dota2 4 20     ║ Doesn't give gamemode before party size or timer\n` +
         `${settings.prefix}lfg rl hoops any   ║ 'Any' is not a valid party size, should be a number! (or 'default')`,
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['lookingforgroup', 'lookforgroup'],
  permLevel: 0,
};

const addLfgMessage =
  `If you want to add a game into the LFG game list (for the !lfg command), please DM <@${settings.masterID}> the information for the game by following this template:\n` +
  '```json\n{\n    "code": "template",\n    "name": "Example Game Title",\n    "aliases": ["other", "names", "to", "choose", "the", "game", "with"],\n    "thumbnail": "<url to image here>",\n' +
  '    "default_party_size": [4, 6, 5, 8],\n    "modes": ["any", "gamemode1", "gamemode2", "gamemode3"],\n    "modes_proper": ["Any", "Game Mode 1", "Game Mode 2", "Game Mode 3"],\n' +
  '    "default_game_mode": "any"\n}```' +
  '\n**•** The values in `default_party_size`, `modes`, & `modes_proper` must correspond and match up with each other\n**•** `default_party_size` values must be 2 or more\n' +
  '**•** Include the "any" game mode in `modes` as the first value\n**•** `code`, `aliases`, and `modes` values must not contain spaces\n**•** Don\'t worry about the thumbnail! We can always add one later.\n\n' +
  `By providing a template with information, you'll make <@${settings.masterID}>'s job a lot easier. <:FeelsGoodMan:230477418551312394> Thank you!`;

exports.run = (bot, message, args, perms) => {
  let game;
  let j;
  let ttl;
  let partySize;
  let platform = null;
  let rank = null;

  // Convert everything to lower case before doing anything
  args.forEach((a, i) => {
    args[i] = a.toLocaleLowerCase();
  });

  if (args[1] === 'add') {
    /**
     * !lfg add <???>
     *  @todo Make this a more dynamic and usable feature, per guild
     */
    return message.channel.send(addLfgMessage);
  }

  if ((args[1] === 'list' || args[1] === 'library') && typeof args[2] === 'undefined') {
    /**
     * !lfg list (NO_GAME_GIVEN)
     *
     * Lists all of the games in the current LFG library
     *  - Partitions the list into page(s) using the lfg.split_value in the settings config JSON
     *  - DMs the page(s) to the command issuer
     */
    let str;
    let longestCode = 0;
    let longestName = 0;
    let page = 0;
    const pageMax = Math.round(bot.games.size / settings.lfg.split_value);

    // Get longest string sizes (longest game name & longest code for a game)
    // Needed for spaced formatting!
    bot.games.forEach((g) => {
      if (g.code.length > longestCode) longestCode = g.code.length;
      if (g.name.length > longestName) longestName = g.name.length;
    });

    // Minimum values for spacing:
    if (longestCode < 6) longestCode = 6;
    if (longestName < 8) longestName = 8;

    // Send pages of LFG
    const g = bot.games.array();
    /* eslint-disable */
    const width = Math.round(longestCode / 2) + longestCode + Math.round(longestName / 2) + (Math.round(longestName / 2) - 6);
    /* eslint-enable */

    while (page <= pageMax) {
      // What value to read up to next for this page?
      let nextMax = (page + 1) * settings.lfg.split_value;
      if (bot.games.size < nextMax) nextMax = bot.games.size;

      // Create page header
      str = `= LFG Game List (page ${page + 1}/${pageMax + 1}) =\n[ Showing games ${(page * settings.lfg.split_value) + 1} ~ ${nextMax} ]\n`;
      str += `╔${'═'.repeat(Math.round(longestCode / 2) - 2)}Code${'═'.repeat(longestCode + (Math.round(longestName / 2) - 6))}Game${'═'.repeat(Math.round(longestName / 2) - 2)}╗\n`;

      // Build the page...
      for (let i = page * settings.lfg.split_value; i < nextMax; i++) {
        str += (i !== (((page + 1) * settings.lfg.split_value) - 1) && i !== bot.games.size - 1) ?
          `║${g[i].code}${' '.repeat(longestCode - g[i].code.length)} :: ${g[i].name}${' '.repeat(width - longestCode - g[i].name.length)}║\n` :
          `║${g[i].code}${' '.repeat(longestCode - g[i].code.length)} :: ${g[i].name}${' '.repeat(width - longestCode - g[i].name.length)}║\n╚${'═'.repeat((2 * Math.round(longestCode / 2)) + (2 * Math.round(longestName / 2)) + 3)}╝`;
      }
      message.author.send(str, {
        code: 'asciidoc',
      }); // ... and send it!
      page++;
    }
    message.reply(`The entire list of LFG games was just sent via DM. It's getting rather long (at **${bot.games.size} games** and counting), so it's seperated in parts and sent privately.`);
  } else if ((args[1] === 'list' || args[1] === 'library') && typeof args[2] !== 'undefined') {
    /**
     * !lfg list [game]
     *    - Lists all game modes & information on a specific game from the LFG library
     */
    let str;
    let longestMode = 0;
    let longestModeProper = 0;

    // Check if the game given even exists
    if (bot.games.has(args[2])) {
      // check games
      game = bot.games.get(args[2]);
    } else if (bot.gameAliases.has(args[2])) {
      // check aliases
      game = bot.games.get(bot.gameAliases.get(args[2]));
    } else {
      // warn that nothing was found
      return message.reply(`Game **${args[2]}** was not found. For a list of available games, use \`${settings.prefix}lfg list\` (with no extra arguments)`);
    }

    // Get longest string size
    game.modes.forEach((m, i) => {
      if (m.length > longestMode) {
        longestMode = m.length;
      }
      if (game.modes_proper[i].length > longestModeProper) {
        longestModeProper = game.modes_proper[i].length;
      }
    });

    // Minimum values for spacing:
    if (longestMode < 6) longestMode = 6;
    if (longestModeProper < 8) longestModeProper = 8;

    // Create game info header
    str = `= ${game.name} LFG Info =\n\nNames & Aliases ::\n${game.code}`;
    if (game.aliases.length > 0) str += `, ${game.aliases.join(', ')}`;

    // Build game info
    const width = (Math.round(longestMode / 2) * 2) + (Math.round(longestModeProper / 2) * 2);
    str += `\n\nThumbnail :: ${game.thumbnail}\n\n= Game Mode List =\n`;
    str += `╔${'═'.repeat(Math.round(longestMode / 2) - 2)}Code${'═'.repeat(Math.round(longestMode / 2) + (Math.round(longestModeProper / 2) - 4))}GameMode${'═'.repeat(Math.round(longestModeProper / 2) - 2)}Size══╗\n`;
    game.modes.forEach((m, index) => {
      str += (index !== game.modes.length - 1) ?
        `║${m}${' '.repeat(longestMode - m.length)} :: ${game.modes_proper[index]}${' '.repeat(width - longestMode - (game.modes_proper[index].length - 2))}${(game.default_party_size[index] / 10 >= 1) ? `${game.default_party_size[index]}` : ` ${game.default_party_size[index]}`}  ║\n` :
        `║${m}${' '.repeat(longestMode - m.length)} :: ${game.modes_proper[index]}${' '.repeat(width - longestMode - (game.modes_proper[index].length - 2))}${(game.default_party_size[index] / 10 >= 1) ? `${game.default_party_size[index]}` : ` ${game.default_party_size[index]}`}  ║\n` +
        `╚${'═'.repeat((2 * Math.round(longestMode / 2)) + (2 * Math.round(longestModeProper / 2)) + 10)}╝`;
    });
    message.channel.send(str, {
      code: 'asciidoc',
    });
  } else if (args[1] === 'help' || args[1] === '?') {
    /**
     * !lfg help|?
     *
     *  The lfg help menu --> really just the standard help menu, but with 'lfg' passed as the arg
     */
    bot.commands.get(`${settings.botname}`).run(bot, message, ['help', 'lfg'], perms); // runs `!help lfg` command
  } else {
    /**
     * !lfg [game] [gameMode] [partySize] [time]
     */

    /** No [game] was given */
    if (typeof args[1] === 'undefined') {
      return message.reply(`You must specify a game in order to use LFG! For a list of available games, use \`${settings.prefix}lfg list\``);
    }

    /** Check if game given exists */
    if (bot.games.has(args[1])) { // check games
      game = bot.games.get(args[1]);
    } else if (bot.gameAliases.has(args[1])) { // check aliases
      game = bot.games.get(bot.gameAliases.get(args[1]));
    } else { // warn that nothing was found
      return message.reply(`Game **${args[1]}** was not found. For a list of available games, use \`${settings.prefix}lfg list\``);
    }

    /** Check if the game mode given exists for the game given */
    if (args[2]) {
      if (args[2] === 'default') {
        // if "default" is given, set to that game's default game mode
        j = game.modes.indexOf(game.default_game_mode);
      } else if (game.modes.indexOf(args[2]) > -1) {
        // if the game mode exists, set it
        j = game.modes.indexOf(args[2]);
      } else {
        // otherwise, warn the user that the game was not found
        return message.reply(`Game mode **${args[2]}** for **${game.name}** was not found. For more information about this game (like available game modes, aliases, etc.), use \`${settings.prefix}lfg list ${args[1]}\``);
      }
    } else {
      // set to default game mode for that game, if a game mode isn't given
      j = game.modes.indexOf(game.default_game_mode);
    }

    if (args[3]) {
      // parse arguments for Party Size, TTL, Platform and Rank
      const parsedArgs = parseRestArgs(args.slice(3), bot, game);

      ttl = parsedArgs[1] === -1 && parsedArgs[0] !== 0 ?
        (parsedArgs[0] * 60) :
        (parsedArgs[0] * 60) + parsedArgs[1];

      [partySize, platform, rank] = parsedArgs.slice(2);

      if (partySize === 0) {
        // set to default party size if parsing returned nothing
        partySize = game.default_party_size[j];
      } else if (partySize < settings.lfg.min_party_size) {
        // if the party size is too small, send an error message to user
        return message.reply('Party size must be more than 1!');
      } else if (partySize > settings.lfg.max_party_size) {
        // if the party size is too big, send an error message to user
        return message.reply(`That party size is a little too big for LFG... Tone it down a bit alright? (the max is ${settings.lfg.max_party_size})`);
      }

      if (ttl === -1) {
        // set to default ttl if parsing returned nothing
        ttl = settings.lfg.ttl_default;
      } else if (ttl < 1) {
        // if ttl given is too small, send an error message to user
        return message.reply('The LFG timer must be at least 1 minute!');
      } else if (ttl > settings.lfg.ttl_max) {
        // if ttl given is too big, send an error message to user
        return message.reply(`That LFG timer is a little too long... Bring it down a notch. (the max is ${settings.lfg.ttl_max / 60} hours)`);
      }
    } else {
      partySize = game.default_party_size[j];
      ttl = settings.lfg.ttl_default;
    }

    /**
     * Now that all the info has been acquired from the command arguments sent...
     * we can create our LFG object and add it into the LFG stack -->
     *
     * @param {Object} lfgObject
     *
     * Properties of the lfgObject:
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
     *  @param {Boolean} warning, Has an expiration warning been sent out yet?
     *
     */
    const d = new Date();
    const time = d.getTime();
    const expireDate = new Date(d.getTime() + (60000 * ttl));

    const lfgObject = {
      id: '',
      party_leader_name: message.author.username,
      party_leader_id: message.author.id,
      code: game.code,
      game: game.name,
      mode: game.modes[j],
      platform,
      rank,
      time,
      expire_date: expireDate,
      ttl,
      party: [message.author.id],
      max_party_size: partySize,
      channel: message.channel.id,
      warning: false,
    };

    lfgHandler.addLFG(bot, lfgObject);
  }

  return 0;
};

exports.reloadHandler = () => new Promise((resolve, reject) => {
  try {
    delete require.cache[require.resolve('../../handlers/LFGHandler')];
    lfgHandler = require('../../handlers/LFGHandler');
    lfgFuncMRA.reloadHandler()
      .then(lfgFuncMRR.reloadHandler()
        .then(lfgFuncMD.reloadHandler()
          .then(resolve())
          .catch(err => console.log(err)))
        .catch(err => console.log(err)))
      .catch(err => console.log(err));
  } catch (err) {
    reject(err);
  }
});
