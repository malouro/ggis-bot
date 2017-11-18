/**
 * Initializes all the juicy bits for the bot
 * 
 * @param {Discord.Client} bot - Discord.Client object
 * @param {JSON} settings - settings JSON file
 * 
 * Initializes the following:
 * 
 * (locally):
 * @var {Array[]} handlers
 * @var {Array[]} functionsToReload
 * 
 * (in bot Client):
 * @var {Discord.Collection} bot.commandGroups
 * @var {Discord.Collection} bot.commandGC
 * @var {Discord.Collection} bot.commands 
 * @var {Discord.Collection} bot.aliases
 * @var {Discord.Collection} bot.streamLink.(conf,users,guilds)
 * @var {Discord.Collection} bot.games 
 * @var {Discord.Collection} bot.gameAliases
 * 
 */

const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');
const TwitchPS = require('twitchps');
const events = require('../events.json');

var functionsToReload = [],
    handlers = [],
    lfgUpdateContainer = null;

exports.init = (bot, settings) => {

    /*** Bot's important Collections ***/

    /* Commands */
    bot.commandGroups = new Discord.Collection(); // command categories/groups names
    bot.commandGC = new Discord.Collection(); // command category codes
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
    bot.lfgStack = new Discord.Collection(); // ongoing LFG parties are kept in here

    /********************************************************************************/

    console.log(chalk.bgBlue.bold(`STARTING 'bot.js' ...`));
    console.log(chalk.bgBlue(`${settings.botnameproper} is connected to ${settings.guilds.length} guilds currently.`));
    console.log(chalk.bgBlue(`Guilds connected to: { ${settings.guilds} }`));

    /********************************************************************************/

    /**
     * Gets permission levels based on user's rank/permissions
     * Useful for determing who can use what commands or features and when
     * 
     * @func getPerms
     *  @param {Discord.Message} message
     * 
     */

    bot.getPerms = message => {
        /*********************************************
        Assign a permission level based on user role
        Determines the elligble commands for the user,
        and other permission level access within
        commands & command options.

        Quick chart thingy:
           ╔permLevel═╦═Role════════════╗
           ║0		  ║	@everyone		║
           ║1		  ║	---				║
           ║2		  ║	Admins			║
           ║3		  ║	Server Owners	║
           ║4		  ║	Master			║
           ╚══════════╩═════════════════╝

        *********************************************/
        let permlvl = 0; // @everyone
        if (message.channel.type !== 'text') {
            if (message.author.id === settings.masterID) permlvl = 4;
        } else {
            if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 2;
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
     *  @prop {Array[String]} code [ list of aliases to get the category ]
     *  @prop {String} name "Proper formatted name for the category"
     *  @prop {String} description "This shows up in the help menu as a short description (emphasis on *short*)"
     */
    settings.commandGroups.forEach(category => {
        category.code.forEach(code => { bot.commandGC.set(code, category.name); });
        bot.commandGroups.set(category.name, category);
    });

    /** 
     * Get commands 
     * 
     *  Each command is as follows --> 
     * 
     *  @prop {Function} run
     *      Function that is the section of code that will run for that command
     *  @prop {Object} 
     *  
     */
    fs.readdir('./commands/', (err, folders) => {
        folders.forEach(folder => {
            fs.readdir(`./commands/${folder}`, (err, files) => {
                if (err) throw err;
                console.log(chalk.bgBlue(`Loading a total of ${files.length} commands from /${folder}/`));
                files.forEach(f => {
                    let contents = require(`../commands/${folder}/${f}`);
                    console.log(chalk.bgCyan.black(`Loading command ${contents.help.name} ... ✓`));
                    bot.commands.set(contents.help.name, contents);
                    bot.commands.get(contents.help.name).conf.category = `${folder}`;
                    contents.conf.aliases.forEach(alias => {
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
    events.handlers.forEach(event => {
        handlers.push(require(`./${event}`));
    });

    /**
     * FunctionsToReload
     * 
     * Defines the command files that are tied to handlers from above, that when a handler is reloaded
     * these functions need to be subsequently reloaded as well.
     * 
     * (ie: /commands/Useful/lfg.js gets reloaded when handlers are reloaded because it depends on lfgHandler)
     */
    events.functionsToReload.forEach(func => {
        if (bot.commands.has(func)) {
            let cat = bot.commands.get(func).conf.category;
            functionsToReload.push(require(`../commands/${cat}/${func}`));
        }
    });

    /**
     * Initialize StreamLink
     */
    var streamlink =  require('./streamlinkHandler');
    streamlink.init(bot).then(topics => {
        bot.twitch = new TwitchPS({ init_topics: topics, reconnect: true, debug: true });
        bot.twitch.on('stream-up', data => streamlink.streamUp(bot, data));
        bot.twitch.on('stream-down', data => streamlink.streamDown(bot, data));
        bot.twitch.on('viewcount', data => streamlink.viewCount(bot, data));
        bot.addTwitchTopic = function(stream) { bot.twitch.addTopic({ topic: `video-playback.${stream.toLowerCase()}` }); }
        bot.removeTwitchTopic = function(stream) { bot.twitch.removeTopic({ topic: `video-playback.${stream.toLowerCase()}` }); }
    }).catch(err => console.log(err));

    /**
     * Get lfg library
     * 
     * Each game is as follows -->
     *  {
     *      code: command argument to access this game
     *      name: proper formatted title
     *      aliases: aliases for game's code
     *      thumbnail: url to a thumbnail image for game
     *      default_party_size: [] array of party sizes
     *      modes: codes for game modes, direct correspondence to default_party_sizes above
     *      modes_proper: proper formatted names for game modes
     *      default_game_mode: which mode is the default? (corresponds with an element from modes, not modes_proper)
     *  }
     */    
    fs.readdir('./config/lfg', (err, files) => {
        if (err) console.error(err);
        console.log(chalk.bgYellow.black(`Loading a total of ${files.length} games into Games Collection.`));
        files.forEach(f => {
            let contents = require(`../config/lfg/${f}`);
            console.log(chalk.bgYellow.gray(`Loading game ... ${contents.name}`));
            bot.games.set(contents.code, contents);
            contents.aliases.forEach(alias => {
                bot.gameAliases.set(alias, contents.code);
            });
        });
    });

    /**
     * This is necessary for more effecient lfg handling
     * 
     * Prior versions had the bot constantly fetching and checking the lfgStack, even when there's nothing to check.
     * Now, after any party is removed or added--we check to see if there's a need to either clear or start an update interval
     * and act accordingly.
     * 
     * @param {Boolean} flag 
     *  Whether to update or not
     * @param {Number} interval 
     *  Interval in ms
     */
    bot.lfgUpdate = function (flag, interval) {
        if (flag) lfgUpdateContainer = setInterval(function () { handlers[1].update(bot) }, interval);
        else clearInterval(lfgUpdateContainer);
    }

    /**
     * reloadCommands and reloadLFG are seperate files
     * They are mentioned within the reloadcommand(s) and reloadlfg commands
     */
    bot.reloadCommands = require('./reloadCommands');
    bot.reloadLFG = require('./reloadLFG');

    /**
     * Now, the actual function for reloading the handlers
     * 
     * The handlers must be specified in events.json
     */
    bot.reloadHandlers = () => {
        return new Promise((resolve, reject) => {
            try {
                events.handlers.forEach((file, index) => {
                    delete require.cache[require.resolve(`./${file}`)];
                    handlers[index] = require(`./${file}`);
                    if (bot.commands.has(events.functionsToReload[index])) {
                        let cat = bot.commands.get(events.functionsToReload[index]).conf.category;
                        functionsToReload[index] = require(`../commands/${cat}/${events.functionsToReload[index]}`);
                        functionsToReload[index].reloadHandler().then().catch(console.error);
                    }
                });
                events.reloaders.forEach(file => {
                    delete require.cache[require.resolve(`./${file}`)];
                    bot[`${file}`] = require(`./${file}`);
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    };

    /**
     * @todo
     * 
     *    Work in progress !!
     * 
     * Ideally, this would reload any event (located in /events/) in case of changes
     * For now, this remains here even though the actual reloadevent command is disabled and not functioning.
     * 
     * @param {String} event 
     */
    bot.reloadEvents = (event) => {
        return new Promise((resolve, reject) => {
            try {
                if (event) eventLoader.reloadHandler(bot, event).then().catch(console.error);
                else eventLoader.reloadHandler(bot).then().catch(console.error);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    /** FINISHED WITH INITIALIZATION **/
};