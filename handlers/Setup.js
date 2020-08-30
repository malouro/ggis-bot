/** Initialization & start up script */
/** @todo Migrate out these comment blocks into documentation */
const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');
const TwitchPS = require('twitchps');
const events = require('./events.json');
const { platforms } = require('../config/lfg/platforms.json');
const { init: initGuildSettings } = require('../handlers/GuildSettings');

const functionsToReload = [];
const handlers = [];
let lfgUpdateContainer = null;

module.exports = (bot, settings) => {
  // Store default prefix in the bot Client
  bot.prefix = settings.prefix;

  /* * * Collections * * */

  /* Commands */
  bot.commandGroups = new Discord.Collection(); // command categories/groups names
  bot.commandGroupCategories = new Discord.Collection(); // command category codes
  bot.commands = new Discord.Collection(); // command functions are stored within here
  bot.aliases = new Discord.Collection(); // aliases for commands

  /* StreamLink */
  bot.streamLink = {};

  bot.streamLink.conf = new Discord.Collection(); // general StreamLink settings
  bot.streamLink.users = new Discord.Collection(); // StreamLink user settings
  bot.streamLink.guilds = new Discord.Collection(); // StreamLink guild settings

  /* LFG */
  bot.games = new Discord.Collection(); // collection of LFG games
  bot.gameAliases = new Discord.Collection(); // aliases for LFG games
  bot.platforms = new Discord.Collection(); // platforms/consoles for LFG games
  bot.platformAliases = new Discord.Collection(); // aliases for LFG platforms
  bot.lfgStack = new Discord.Collection(); // ongoing LFG parties are kept in here

  /* Start message */
  console.log(chalk.bgBlue.bold(`STARTING UP ${settings.botNameProper}-bot...`));

  /**
   * Load events into bot using eventLoader.js
   *
   * Includes events for:
   * - ready, reconnecting, disconnect, message, guildCreate, messageReactionAdd, etc...
   */
  require('./EventLoader')(bot, settings);

  /**
   * Permission Levels
   *
   * @func getPerms
   *  @param {Discord.Message} message
   * @returns {number} permLvl
   *
   * Gets permission levels based on user's rank/permissions
   * Useful for determining who can use what commands or features and when
   */
  bot.getPerms = (message) => {
    /*
    Assign a permission level based on user role
    Determines the eligible commands for the user,
    and other permission level access within
    commands & command options.

    Quick chart thingy:
       ╔permLevel═╦═Role══════════╗
       ║0         ║ @everyone     ║
       ║1         ║ ---           ║
       ║2         ║ Admins        ║
       ║3         ║ Server Owners ║
       ║4         ║ Master        ║
       ╚══════════╩═══════════════╝
    */
    let permlvl = 0; // @everyone
    if (message.channel.type === 'dm') {
      if (message.author.id === settings.masterID) permlvl = 4;
    } else {
      if (message.member.hasPermission('ADMINISTRATOR')) permlvl = 2;
      if (message.member === message.guild.owner) permlvl = 3;
      if (message.author.id === settings.masterID) permlvl = 4;
    }
    return permlvl;
  };

  /**
   * Command Categories
   *
   *  Each category (aka: command group) is as follows -->
   *
   *  @property {Array[String]} code List of aliases to get the category
   *  @property {String} name Proper formatted name for the category
   *  @property {String} description This shows up in the help menu as a short description
   */
  settings.commandGroups.forEach((category) => {
    category.code.forEach((code) => { bot.commandGroupCategories.set(code, category.name); });
    bot.commandGroups.set(category.name, category);
  });

  /**
   * Get commands
   *
   *  Each command is as follows -->
   *
   *  @property {Function} run - Function that is the section of code that will run for that command
   *  @property {Object} conf - Lists when & where & by whom the command can be used
   *      {
   *          @property {Boolean} enabled -- whether the command is enabled or not
   *          @property {Boolean} visible -- whether or not the command shows up in help menus
   *          @property {Boolean} guildOnly -- whether the command is for the main guild only or not
   *          @property {Boolean} textChannelOnly -- whether the command is ONLY for text channels
   *                                                 (as opposed to DM channels)
   *          @property {Array[String]} aliases -- aliases for the command
   *          @property {Integer} permLevel -- the permission level needed to use the command
   *            (always at least 0, where 0 means anyone can use the command)
   *          @property {String} category -- folder the command is located in
   *      }
   *  @property {Object} help - Help menu information, as well as the command's main name
   *      {
   *          @property {String} name -- the command's main name
   *          @property {String} description -- short description
   *          @property {String} usage -- in depth description on how to use the command
   *                                      (and w/e else needs to be stated about the command)
   *      }
   */
  fs.readdir('./commands/', (err, folders) => {
    folders.forEach((folder) => {
      fs.readdir(`./commands/${folder}`, (errInCatDir, files) => {
        if (errInCatDir) throw errInCatDir;
        console.log(chalk.bgBlue(`Loading a total of ${files.length} commands from /${folder}/`));
        files.forEach((f) => {
          const contents = require(`../commands/${folder}/${f}`);
          console.log(chalk.bgCyan.black(`Loading command ${contents.help.name} ... ✓`));
          bot.commands.set(contents.help.name, contents);
          bot.commands.get(contents.help.name).conf.category = `${folder}`;
          contents.conf.aliases.forEach((alias) => {
            bot.aliases.set(alias, contents.help.name);
          });
        });
      });
    });
  });

  /**
   * Handlers
   *
   * Handlers are utility functions that work hand in hand with certain command files so that
   * things can be operated & handled even when commands aren't being directly ran.
   *
   * This includes things for:
   *  - Reloading commands
   *  - StreamLink event handling
   *  - LFG requests & events
   *  - ... and more
   */
  events.handlers.forEach((handler) => {
    handlers.push(require(`./${handler}`));
  });

  /**
   * FunctionsToReload
   *
   * Defines the command files that are tied to handlers from above, that when a handler is reloaded
   * these functions need to be subsequently reloaded as well.
   *
   * (ie:) "~/commands/Useful/lfg.js" gets reloaded when handlers are reloaded ...
   * ... because, it depends on the handler 'LFGHandler'
   */
  events.functionsToReload.forEach((func) => {
    if (bot.commands.has(func)) {
      const cat = bot.commands.get(func).conf.category;
      functionsToReload.push(require(`../commands/${cat}/${func}`));
    }
  });

  /**
   * Initialize per-guild settings
   */
  bot.guildOverrides = initGuildSettings();

  /**
   * Initialize StreamLink
   *
   * - Run StreamLinkHandler.init(bot)
   * - Construct TwitchPS class w/ the topics taken from streamlinkHandler.init(bot)
   * - Tie the stream-up, stream-down and viewcount events to streamlinkHandler functions
   * - Two funcs for adding and removing topics from TwitchPS and embed into bot Client
   */
  const streamlink = require('./StreamLinkHandler');
  streamlink.init(bot).then((value) => {
    bot = value.client;
    bot.twitch = new TwitchPS({ init_topics: value.topics, reconnect: true, debug: false });
    bot.twitch.on('stream-up', data => streamlink.streamUp(bot, data));
    bot.twitch.on('stream-down', data => streamlink.streamDown(bot, data));
    bot.twitch.on('viewcount', data => streamlink.viewCount(bot, data));
    bot.addTwitchTopic = (stream) => { bot.twitch.addTopic({ topic: `video-playback.${stream.toLowerCase()}` }); };
    bot.removeTwitchTopic = (stream) => { bot.twitch.removeTopic({ topic: `video-playback.${stream.toLowerCase()}` }); };
  }).catch(err => console.log(err));

  /**
   * Create lfg library
   *
   * Each game is as follows -->
   *
   * @var {Discord.Collection} bot.games."code" =>
   *  {
   *      @property {String} code: command argument to access this game
   *      @property {String} name: proper formatted title
   *      @property {Array[String]} aliases: aliases for game's code
   *      @property {String} thumbnail: url to a thumbnail image for game
   *      @property {Array[Integer]} default_party_size: [] array of party sizes
   *      @property {Array[String]} modes: codes for game modes
   *                        (direct correspondence to default_party_sizes above)
   *      @property {Array[String]} modes_proper: proper formatted names for game modes
   *      @property {String} default_game_mode: which mode is the default?
   *                        (corresponds with an element from modes, not modes_proper)
   *  }
   */

  /**
   * @todo Per-server LFG game lists
   * Need to consider how this will be implemented!
   */

  // Games
  fs.readdir('./config/lfg/default', (err, files) => {
    if (err) console.error(err);
    console.log(chalk.bgYellow.black(`Loading a total of ${files.length} games into Games Collection.`));
    files.forEach((f) => {
      const contents = JSON.parse(fs.readFileSync(`./config/lfg/default/${f}`, 'utf8'));
      console.log(chalk.bgYellow.gray(`Loading game ... ${contents.name}`));
      bot.games.set(contents.code, contents);
      contents.aliases.forEach((alias) => {
        bot.gameAliases.set(alias, contents.code);
      });
    });
  });

  // Platforms
  console.log(chalk.bgYellow.black(`Loading ${platforms.length} platforms into Platforms Collection.`));
  platforms.forEach((platform) => {
    console.log(chalk.bgYellow.gray(`Loading platform ... ${platform.properName}`));
    bot.platforms.set(platform.code, platform);
    platform.aliases.forEach((alias) => {
      bot.platformAliases.set(alias, platform.code);
    });
  });

  /**
   * *** This is necessary for more efficient lfg handling ***
   *
   * Prior versions had the bot constantly fetching and checking the lfgStack
   * (even when there's nothing to check)
   *
   * Now, after any party is removed or added --
   * we check to see if there's a need to either clear or
   * start up an update interval, and then act accordingly.
   *
   * @param {Boolean} flag Whether to update or not
   * @param {Number} interval Interval time in ms
   */
  bot.lfgUpdate = (flag, interval) => {
    if (flag) lfgUpdateContainer = setInterval(() => { handlers[1].update(bot); }, interval);
    else clearInterval(lfgUpdateContainer);
  };

  /**
   * reloadCommands and reloadLFG are separate files
   * They are mentioned within the ReloadCommand(s) and ReloadLFG commands
   */
  bot.reloadCommands = require('./ReloadCommands');
  bot.reloadLFG = require('./ReloadLFG');

  /**
   * Reloading handler functions
   *
   * (The handlers must be specified in events.json)
   */
  bot.reloadHandlers = () => new Promise((resolve, reject) => {
    try {
      events.handlers.forEach((file, index) => {
        delete require.cache[require.resolve(`./${file}`)];
        handlers[index] = require(`./${file}`);
        if (bot.commands.has(events.functionsToReload[index])) {
          const cat = bot.commands.get(events.functionsToReload[index]).conf.category;
          functionsToReload[index] = require(`../commands/${cat}/${events.functionsToReload[index]}`);
          functionsToReload[index].reloadHandler().then().catch(console.error);
        }
      });
      events.reloaders.forEach((file) => {
        delete require.cache[require.resolve(`./${file}`)];
        bot[`${file}`] = require(`./${file}`);
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });

  /**
   * @todo Find a way to get this to work properly
   *
   *    Work in progress !!
   *
   * Ideally, this would reload any event (located in /events/) in case of changes
   * For now, this remains here, even though the actual ReloadEvent command is
   * disabled and not functioning properly yet.
   *
   * @param {String} event
   */

  /*
  bot.reloadEvents = (event) => {
    Promise((resolve, reject) => {
      try {
        if (event) eventLoader.reloadHandler(bot, event).then().catch(console.error);
        else eventLoader.reloadHandler(bot).then().catch(console.error);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
  */

  /** FINISHED */
};
