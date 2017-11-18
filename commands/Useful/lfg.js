// =====================================================================================
//                              ! lfg command
// =====================================================================================
// LFG = "Looking For Group", taken from the popular WoW / MMO abbreviation...
// Finds other players that want to play the requested game with the command issuer

const chalk     = require('chalk');
const Discord   = require('discord.js');
const fs        = require('fs');
const moment    = require('moment-timezone');

// Events for LFG handling:
var lfgHandler  = require('../../util/lfgHandler');
var lfgFuncMRA  = require('../../events/messageReactionAdd');
var lfgFuncMRR  = require('../../events/messageReactionRemove');
var lfgFuncMD   = require('../../events/messageDelete');
var settings    = JSON.parse(fs.readFileSync("./settings.json", "utf8")); // Bot config JSON

exports.run = (bot, message, args, perms) => {

    let game; 
    let index;
    let partysize;
    let ttl;
    let message_user_id = message.author.id;
    let message_user_name = message.author.username;

    args.forEach((a,index) => { args[index] = a.toLowerCase(); }); // Convert everything to lower case before doing anything; idiot-proof this ish :P

    /**
     *  !lfg add <???>
     */

    // CHANGE THIS?; as of now there is no way to add LFG games in directly through commands
    if (args[1] === 'add') {
        message.channel.send(this.addLfgMessage);
        return;
    }

    /**
     * !lfg list (NO GAME GIVEN)
     */
    if ((args[1] === 'list' || args[1] === 'library') && typeof args[2] === 'undefined') {

        /**
         * Lists all of the games in the current LFG library
         *  Partitions the list into pages using the lfg.split_value in the settings config JSON
         *  DMs the page to the command issuer
         */

        let str; 
        let longestCode = 0; 
        let longestName = 0;
        let page = 0; 
        let pageMax = Math.round(bot.games.size / settings.lfg.split_value);

        // Get longest string sizes (longest game name & longest code for a game)
        // Needed for spaced formatting!
        bot.games.forEach(g => {
            if (g.code.length > longestCode) longestCode = g.code.length;
            if (g.name.length > longestName) longestName = g.name.length;
        });

        // Minimum values for spacing:
        if (longestCode < 6) longestCode = 6;
        if (longestName < 8) longestName = 8;

        // Send pages of LFG
        let g = bot.games.array();
        let width = Math.round(longestCode / 2) + longestCode + Math.round(longestName / 2) + Math.round(longestName / 2) - 6;

        while (page <= pageMax) {
            // What value to read up to next for this page?
            let nextMax = (page + 1) * settings.lfg.split_value;
            if (bot.games.size < nextMax) nextMax = bot.games.size;

            // Create page header
            str = `= LFG Game List (page ${page + 1}/${pageMax + 1}) =\n[ Showing games ${page*settings.lfg.split_value+1} ~ ${nextMax} ]\n`;
            str += `╔` + `═`.repeat(Math.round(longestCode / 2) - 2) + `Code` + `═`.repeat(longestCode - 6 + Math.round(longestName / 2)) + `Game` + `═`.repeat(Math.round(longestName / 2) - 2) + `╗\n`;           

            // Build the page...
            for (i = page*settings.lfg.split_value; i < nextMax; i++) {
                str += (i !== (((page + 1) * settings.lfg.split_value) - 1) && i !== bot.games.size - 1) ?
                    `║${g[i].code}` + ` `.repeat(longestCode - g[i].code.length) + ` :: ${g[i].name}` + ' '.repeat(width - longestCode - g[i].name.length) + '║\n' :
                    `║${g[i].code}` + ` `.repeat(longestCode - g[i].code.length) + ` :: ${g[i].name}` + ' '.repeat(width - longestCode - g[i].name.length) + `║\n╚` + '═'.repeat(Math.round(longestCode / 2) * 2 + Math.round(longestName / 2) * 2 + 3) + '╝';
            }
            message.author.send(str, {code: 'asciidoc'}); // ... and send it!
            page++;
        }
        message.reply(`The entire list of LFG games was just sent via DM. It's getting rather long (at **${bot.games.size} games** and counting), so it's seperated in parts and sent privately.`);
    }

    /**
     * !lfg list [game]
     */
    else if ((args[1] === 'list' || args[1] === 'library') && typeof args[2] !== 'undefined') {
        
        /**
         * Lists all game modes & information on a specific game from the LFG library
         */

        let str;
        let longestMode = 0;
        let longestModeProper = 0;

        // Check if the game given even exists
        if (bot.games.has(args[2])) { // check games
            game = bot.games.get(args[2]);
        } else if (bot.gameAliases.has(args[2])) { // check aliases
            game = bot.games.get(bot.gameAliases.get(args[2]));
        } else { // warn that nothing was found
            return message.reply(`Game **${args[2]}** was not found. For a list of available games, use \`${settings.prefix}lfg list\` (with no extra arguments)`);
        }

        // Get longest string size
        game.modes.forEach((m, index) => {
            if (m.length > longestMode) longestMode = m.length;
            if (game.modes_proper[index].length > longestModeProper) longestModeProper = game.modes_proper[index].length;
        });

        // Minimum values for spacing:
        if (longestMode < 6) longestMode = 6;
        if (longestModeProper < 8) longestModeProper = 8;

        // Create game info header
        str = `= ${game.name} LFG Info =\n\nNames & Aliases ::\n${game.code}`;
        if (game.aliases.length > 0) str += `, ${game.aliases.join(', ')}`;

        // Build game info
        let width = (Math.round(longestMode / 2) * 2) + (Math.round(longestModeProper / 2) * 2);
        str += `\n\nThumbnail :: ${game.thumbnail}\n\n= Game Mode List =\n`;
        str += `╔` + '═'.repeat(Math.round(longestMode / 2) - 2) + `Code` + `═`.repeat(Math.round(longestMode / 2) + Math.round(longestModeProper / 2) - 4) + `GameMode` + `═`.repeat(Math.round(longestModeProper / 2) - 2) + `Size══╗\n`;
        game.modes.forEach((m, index) => {
            str += (index !== game.modes.length-1) ?
                `║${m}` + ` `.repeat(longestMode - m.length) + ` :: ${game.modes_proper[index]}` + ' '.repeat(width - longestMode - game.modes_proper[index].length + 2) + `${(game.default_party_size[index] / 10 >= 1) ? `${game.default_party_size[index]}` : ` ${game.default_party_size[index]}`}  ║\n` :
                `║${m}` + ` `.repeat(longestMode - m.length) + ` :: ${game.modes_proper[index]}` + ' '.repeat(width - longestMode - game.modes_proper[index].length + 2) + `${(game.default_party_size[index] / 10 >= 1) ? `${game.default_party_size[index]}` : ` ${game.default_party_size[index]}`}  ║\n` +
                `╚` + '═'.repeat(Math.round(longestMode / 2) * 2 + Math.round(longestModeProper / 2) * 2 + 10) + '╝';
        });
        message.channel.send(str, { code: 'asciidoc' });
    }
    
    /**
     * !lfg help|?
     */
    else if (args[1] === 'help' || args[1] === '?') {
        bot.commands.get(`${settings.botname}`).run(bot, message, ['ggis','lfg'], perms); // runs `!ggis lfg` command
    }

    /**
     * !lfg [game] [gameMode] [partySize] [time]
     */
    else {
        /*****************************************************************************************************************
         * This is the /actual/ LFG request going through
         *  @param {String}  game       // name of the game
         *  @param {String}  gameMode   // the game mode user is looking to play
         *  @param {Integer} partySize  // size of the party (command issuer counts as a member of the party automaticaly)
         *                              // { 1 < p <= 32 }
         *  @param {Integer} time       // time for the request to remain active
         *                              // { 1 < t <= 180 }
         *****************************************************************************************************************/

        // No [game] was given
        if (typeof args[1] === 'undefined') {
            return message.reply(`You must specify a game in order to use LFG! For a list of available games, use \`${settings.prefix}lfg list\``);
        }

        // Check if game given exists
        if (bot.games.has(args[1])) { // check games
            game = bot.games.get(args[1]);
        } else if (bot.gameAliases.has(args[1])) { // check aliases
            game = bot.games.get(bot.gameAliases.get(args[1]));
        } else { // warn that nothing was found
            return message.reply(`Game **${args[1]}** was not found. For a list of available games, use \`${settings.prefix}lfg list\``);
        }

        // Check if the game mode given exists for the game given
        if (args[2]) {
            if (args[2] === 'default') { // if "default" is given, set to that game's default game mode
                index = game.modes.indexOf(game.default_game_mode);
            } else if (game.modes.indexOf(args[2]) > -1) { // if the game mode exists, set it!
                index = game.modes.indexOf(args[2]);
            } else { // otherwise, warn the user that the game was not found
                return message.reply(`Game mode **${args[2]}** for **${game.name}** was not found. For more information about this game (like available game modes, aliases, etc.), use \`${settings.prefix}lfg list ${args[1]}\``);
            }
        } else { // set to default game mode for that game, if a game mode isn't given
            index = game.modes.indexOf(game.default_game_mode);
        }

        // Get the party size
        if (args[3] && !isNaN(args[3])) {
            party_size = (args[3] === 'default') ? game.default_party_size[index] : parseInt(args[3], 10);
            if (party_size < 2) { // if the party size is too small, send an error message to user
                return message.reply(`Party size must be more than 1!`);
            } else if (party_size > settings.lfg.max_party_size) { // if the party size is too big, send an error message to user
                return message.reply(`That party size is a little too big for LFG... Tone it down a bit alright? (the max is ${settings.lfg.max_party_size})`);
            }
        } else { // if nothing is given, or what is given is NOT a number, set to default value
            party_size = game.default_party_size[index];
        }

        // Get the TTL
        if (args[4] && !isNaN(args[4])) {
            ttl = (args[4] === 'default') ? ttl = settings.lfg.ttl_default : parseInt(args[4], 10);
            if (ttl < 1) { // if ttl given is too small, send an error message to user
                return message.reply(`The LFG timer must be at least 1 minute!`);
            } else if (ttl > settings.lfg.ttl_max) { // if ttl given is too big, send an error message to user
                return message.reply(`That LFG timer is a little too long... Bring it down a notch. (the max is ${settings.lfg.ttl_max} minutes)`);
            }
        } else { // if nothings is given, or what is given is NOT a number, set to default value
            ttl = settings.lfg.ttl_default;
        }

        /*****************************************************************************************************************
         * Now that all the info has been acquired from the command arguments sent...
         * we can create our LFG object and add it into the LFG stack -->
         * 
         * @param {Object} lfg_object
         * 
         * Properties of the lfg_object:
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
         *  @param {Boolean} warning, Has a warning been sent out about the LFG being close to expiration yet?
         * 
         *****************************************************************************************************************/

        let d = new Date();
        let time = d.getTime();
        let expireDate = new Date(d.getTime() + ttl * 60000);

        let lfg_object = {
            "id": "",
            "party_leader_name": message.author.username,
            "party_leader_id": message.author.id,
            "code": game.code,
            "game": game.name,
            "mode": game.modes[index],
            "time": time,
            "expire_date": expireDate,
            "ttl": ttl,
            "party": [message.author.id],
            "max_party_size": party_size,
            "channel": message.channel.id,
            "warning": false
        }
        
        lfgHandler.addLFG(bot, lfg_object);
    }
};

exports.reloadHandler = () => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve('../../util/lfgHandler')];
            lfgHandler = require('../../util/lfgHandler');
            lfgFuncMRA.reloadHandler().then(
                lfgFuncMRR.reloadHandler().then(
                    lfgFuncMD.reloadHandler().then(
                        resolve()
                    ).catch(err => console.log(err))
                ).catch(err => console.log(err))
            ).catch(err => console.log(err))
        }
        catch (err) {
            reject(err);
        }
    });
};

exports.addLfgMessage = 
    `If you want to add a game into the LFG game list (for the !lfg command), please DM <@${settings.masterID}> the information for the game by following this template:\n`+
    `\`\`\`json\n{\n    "code": "template",\n    "name": "Example Game Title",\n    "aliases": ["other", "names", "to", "choose", "the", "game", "with"],\n    "thumbnail": "<url to image here>",\n`+
    `    "default_party_size": [4, 6, 5, 8],\n    "modes": ["any", "gamemode1", "gamemode2", "gamemode3"],\n    "modes_proper": ["Any", "Game Mode 1", "Game Mode 2", "Game Mode 3"],\n`+
    `    "default_game_mode": "any"\n}\`\`\``+
    `\n**•** The values in \`default_party_size\`, \`modes\`, & \`modes_proper\` must correspond and match up with each other\n**•** \`default_party_size\` values must be 2 or more\n`+
    `**•** Include the "any" game mode in \`modes\` as the first value\n**•** \`code\`, \`aliases\`, and \`modes\` values must not contain spaces\n**•** Don't worry about the thumbnail! We can always add one later.\n\n`+
    `By providing a template with information, you'll make <@${settings.masterID}>'s job a lot easier. <:FeelsGoodMan:230477418551312394> Thank you!`;

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: true,
    aliases: ["lookingforgroup", "lookforgroup"],
    permLevel: 0
};

exports.help = {
    name: 'lfg',
    description: `Look for players to join you in a game`,
    usage: `lfg <game> [mode] [partySize] [expirationTime(in minutes)]\n\n<game> is *mandatory*, and doesn't include spaces\n[mode], [partSize], [expirationTime] are all optional` +
    `\n\n- These three options, if used, must be given *consecutivtely and in order*.` +
    `\n- That is, in order to give the party size, you must have a mode chosen, and in order to specify the time left to expire, you must have a party size set.` +
    `\n\n- Default gamemode & party size lety dependening on the game/gamemode respectively\n- 'Any' & 'default' are valid gamemodes for every game!` +
    `\n- Default time is set to ${settings.lfg.ttl_default} minutes.\n- Party size & time must be given as positive integers.` +
    `\n\nMore LFG Commands ::\nUse "${settings.prefix}lfg list" to see what games you can use!` +
    `\nUse "${settings.prefix}lfg list <game>" to see more info on a specific game` +
    `\nUse "${settings.prefix}lfg help" as an alternative way to access this help menu` +
    `\n\nExamples ::\n${settings.prefix}lfg lol aram 4 20  ║ League of Legends - ARAM - Party of 4 - 20 minute timer\n` +
    `${settings.prefix}lfg pubg default 2 ║ PUBG - Any gamemode - Party of 2 - Default timer\n` +
    `${settings.prefix}lfg ow any         ║ Overwatch - Default gamemode - Default party size - Default timer\n` +
    `\nWarnings :: (these won't work the way you probably intended them to)\n` +
    `${settings.prefix}lfg dota2 4 20     ║ Doesn't give gamemode before party size or timer\n` +
    `${settings.prefix}lfg rl hoops any   ║ 'Any' is not a valid party size, should be a number! (or 'default')`
};