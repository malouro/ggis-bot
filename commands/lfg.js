// =====================================================================================
//                              ! lfg command
// =====================================================================================
// LFG = "Looking For Group", taken from the popular WoW / MMO abbreviation...
// Finds other players that want to play the requested game with the command issuer

const Discord = require('discord.js');
const chalk = require('chalk');
const moment = require('moment-timezone');
const fs = require('fs');

// Events for LFG handling:
var lfgFuncMRA = require('../events/messageReactionAdd');
var lfgFuncMRR = require('../events/messageReactionRemove');
var lfgFuncMD = require('../events/messageDelete');
var settings = JSON.parse(fs.readFileSync("./settings.json", "utf8")); // Bot config JSON

exports.run = (bot, message, args) => {

    let game; let index; let partysize; let ttl;
    let embed = new Discord.RichEmbed();
    let message_user_id = message.author.id;
    let message_user_name = message.author.username;

    // --------------------------------------------

    // Convert everything to lower case, idiot-proof this ish
    args.forEach((a, i) => {
        args[i] = a.toLowerCase();
    })
    // --------------------------------------------

    // !lfg add
    // CHANGE THIS?; as of now there is no way to add LFG games in directly through commands
    if (args[1] === 'add') {
        message.channel.send(`If you want to add a game into the LFG game list (for the !lfg command), please DM <@${settings.masterID}> the information for the game by following this template:\n\`\`\`json\n{\n    "code": "template",\n    "name": "Example Game Title",\n    "aliases": ["other", "names", "to", "choose", "the", "game", "with"],\n    "thumbnail": "<url to image here>",\n    "default_party_size": [4, 6, 5, 8],\n    "modes": ["any", "gamemode1", "gamemode2", "gamemode3"],\n    "modes_proper": ["Any", "Game Mode 1", "Game Mode 2", "Game Mode 3"],\n    "default_game_mode": "any"\n}\`\`\`` +
            `\n**•** The values in \`default_party_size\`, \`modes\`, & \`modes_proper\` must correspond and match up with each other\n**•** \`default_party_size\` values must be 2 or more\n**•** Include the "any" game mode in \`modes\` as the first value\n**•** \`code\`, \`aliases\`, and \`modes\` values must not contain spaces\n**•** Don't worry about the thumbnail! We can always add one later.\n\nBy providing a template with information, you'll make <@${settings.masterID}>'s job a lot easier. <:FeelsGoodMan:230477418551312394> Thank you!`);
        return;
    }
    // --------------------------------------------

    // !lfg list NO_GAME
    if ((args[1] === 'list' || args[1] === 'library') && typeof args[2] === 'undefined') {
        // List all games the bot has currently
        // Set string to empty string and longest values to 0, so comparisons work later
        var str; var longestCode = 0; var longestName = 0;
        var page = 0; var done = false;
        var pageMax = Math.round(bot.games.size / settings.lfg.split_value);
        // Get longest string size
        bot.games.forEach(g => {
            if (g.code.length > longestCode) {
                longestCode = g.code.length;
            }
            if (g.name.length > longestName) {
                longestName = g.name.length;
            }
        });
        // Minimum values for spacing:
        if (longestCode < 6) {
            longestCode = 6;
        }
        if (longestName < 8) {
            longestName = 8;
        }
        // Send pages of LFG
        var g = bot.games.array();
        var width = Math.round(longestCode / 2) + longestCode + Math.round(longestName / 2) + Math.round(longestName / 2) - 6;
        while (!done) {
            str = `= LFG Game List (page ${page + 1}/${pageMax + 1}) =\n`;
            str = str + `╔` + `═`.repeat(Math.round(longestCode / 2) - 2) + `Code` + `═`.repeat(longestCode - 6 + Math.round(longestName / 2)) + `Game` + `═`.repeat(Math.round(longestName / 2) - 2) + `╗\n`;
            var nextMax = (page + 1) * settings.lfg.split_value;
            if (bot.games.size < nextMax) nextMax = bot.games.size;
            for (i = page * settings.lfg.split_value; i < nextMax; i++) {
                if (i !== (((page + 1) * settings.lfg.split_value) - 1) && i !== bot.games.size - 1)
                    str = str + `║${g[i].code}` + ` `.repeat(longestCode - g[i].code.length) + ` :: ${g[i].name}` + ' '.repeat(width - longestCode - g[i].name.length) + '║\n';
                else
                    str = str + `║${g[i].code}` + ` `.repeat(longestCode - g[i].code.length) + ` :: ${g[i].name}` + ' '.repeat(width - longestCode - g[i].name.length) + `║\n╚` + '═'.repeat(Math.round(longestCode / 2) * 2 + Math.round(longestName / 2) * 2 + 3) + '╝';
            }
            message.author.send(str, {
                code: 'asciidoc'
            });
            if (page < pageMax) page++;
            else done = true;
        }
        message.reply(`The entire list of LFG games was just sent via DM. It's getting rather long (at **${bot.games.size} games** and counting), so it's seperated in parts and sent privately.`);
        return;
    }
    // --------------------------------------------

    // !lfg list <game>
    else if ((args[1] === 'list' || args[1] === 'library') && typeof args[2] !== 'undefined') {
        // List all modes for given game
        // Set string to empty string and longest values to 0
        var str;
        var longestMode = 0;
        var longestModeProper = 0;

        if (bot.games.has(args[2])) {
            game = bot.games.get(args[2]);
        } else if (bot.gameAliases.has(args[2])) {
            game = bot.games.get(bot.gameAliases.get(args[2]));
        } else {
            message.reply(`Game "${args[2]}" was not found.`);
            return;
        }

        // Get longest string size
        game.modes.forEach((m, index) => {
            if (m.length > longestMode) {
                longestMode = m.length;
            }
            if (game.modes_proper[index].length > longestModeProper) {
                longestModeProper = game.modes_proper[index].length;
            }
        });

        // Minimum values for spacing:
        if (longestMode < 6) {
            longestMode = 6;
        }
        if (longestModeProper < 8) {
            longestModeProper = 8;
        }

        str = `= ${game.name} Names & Aliases =\n`;
        str = str + `${game.code}`;
        if (game.aliases.length > 0) str = str + `, ${game.aliases.map(a => `${a}`).join(', ')}`;

        // Build str:
        var width2 = (Math.round(longestMode / 2) * 2) + (Math.round(longestModeProper / 2) * 2);
        str = str + `\n\n= ${game.name} Game Mode List =\n`;
        str = str + `╔` + '═'.repeat(Math.round(longestMode / 2) - 2) + `Code` + `═`.repeat(Math.round(longestMode / 2) + Math.round(longestModeProper / 2) - 4) + `GameMode` + `═`.repeat(Math.round(longestModeProper / 2) - 2) + `╗\n`;
        game.modes.forEach((m, index) => {
            if (index !== game.modes.length - 1)
                str = str + `║${m}` + ` `.repeat(longestMode - m.length) + ` :: ${game.modes_proper[index]}` + ' '.repeat(width2 - longestMode - game.modes_proper[index].length) + `║\n`;
            else
                str = str + `║${m}` + ` `.repeat(longestMode - m.length) + ` :: ${game.modes_proper[index]}` + ' '.repeat(width2 - longestMode - game.modes_proper[index].length) + `║\n╚` + '═'.repeat(Math.round(longestMode / 2) * 2 + Math.round(longestModeProper / 2) * 2 + 4) + '╝';
        });
        message.channel.send(str, { code: 'asciidoc' });
        return;
    }
    // --------------------------------------------

    // Otherwise, use LFG as normal:
    // Break if user doesn't give a game 
    else {
        if (typeof args[1] == 'undefined') {
            message.reply(`You must specify a game in order to use LFG!`);
            return;
        }
        // Get game
        if (bot.games.has(args[1])) {
            game = bot.games.get(args[1]);
        } else if (bot.gameAliases.has(args[1])) {
            game = bot.games.get(bot.gameAliases.get(args[1]));
        } else {
            message.reply(`Game "${args[1]}" was not found.`);
            return;
        }
        // Get gamemode
        if (typeof args[2] != 'undefined') {
            if (args[2] === 'default') {
                index = game.modes.indexOf(game.default_game_mode);
            } else if (game.modes.indexOf(args[2]) > -1) {
                index = game.modes.indexOf(args[2]);
            } else {
                message.reply(`Game mode "${args[2]}" was not found.`);
                return;
            }
        } else {
            index = game.modes.indexOf(game.default_game_mode);
        }
        // Get party size
        if (typeof args[3] != 'undefined' && !isNaN(args[3])) {
            if (args[3] === 'default') {
                party_size = game.default_party_size[index];
            } else {
                party_size = parseInt(args[3], 10);
            }
            if (party_size < 2) {
                message.reply(`Party size must be more than 1!`);
                return;
            } else if (party_size > settings.lfg.max_party_size) {
                message.reply(`That party size is a little too big for LFG... Tone it down a bit alright? (the max is ${settings.lfg.max_party_size})`);
                return;
            }
        } else {
            party_size = game.default_party_size[index];
        }
        // Get ttl
        if (typeof args[4] != 'undefined' && !isNaN(args[4])) {
            if (args[4] === 'default') {
                ttl = settings.lfg.ttl_default;
            } else {
                ttl = parseInt(args[4], 10);
            }
            if (ttl < 1) {
                message.reply(`The LFG timer must be at least 1 minute!`);
                return;
            } else if (ttl > settings.lfg.ttl_max) {
                message.reply(`That LFG timer is a little too long... Bring it down a notch. (the max is ${settings.lfg.ttl_max} minutes)`);
                return;
            }
        } else {
            ttl = settings.lfg.ttl_default;
        }
        // Send out LFG request!
        var d = new Date();
        var expireDate = new Date(d.getTime() + ttl * 60000)
        embed = new Discord.RichEmbed()
            .setTitle(`${message.author.username} is looking for a ${game.name} group!`)
            .setDescription(`**Game mode:** ${game.modes_proper[index]}\n**Party size:** ${party_size}`)
            .setColor(0x009395)
            .setThumbnail(game.thumbnail)
            .setFooter(`Expires at: `)
            .setTimestamp(expireDate)
            .addField(`Want to join?`, `Click the 👍 below to reserve a spot!\n${message.author.username}: click the 🚫 below to cancel the party.\n\n**Party:** ${message.author} (1/${party_size})`);
        message.channel.send({
            embed
        }).then(function (message) {
            var time = d.getTime();
            let message_id = message.id;
            let message_channel = message.channel.id;
            let lfg_object = {
                "id": message_id,
                "party_leader_name": message_user_name,
                "party_leader_id": message_user_id,
                "code": game.code,
                "game": game.name,
                "mode": game.modes[index],
                "time": time,
                "expire_date": expireDate,
                "ttl": ttl,
                "party": [message_user_id],
                "max_party_size": party_size,
                "channel": message_channel,
                "warning": false
            };
            bot.lfgStack.set(message_id, lfg_object);
            message.react('👍').then(() => {
                message.react('🚫').then(() => {
                    console.log(chalk.bgCyan.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message_user_name} made an LFG for ${game.name} - ${game.modes_proper[index]}`));
                }).catch(err => console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] + ${err}`)))
            }).catch(err => console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] + ${err}`)));
        }).catch(err => console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] + ${err}`)));
    }
};

exports.reloadHandler = () => {
    return new Promise((resolve, reject) => {
        try {
            lfgFuncMRA.reloadHandler().then(
                lfgFuncMRR.reloadHandler().then(
                    lfgFuncMD.reloadHandler().then(
                        resolve()
                    ).catch(err => console.log(err))
                ).catch(err => console.log(err))
            ).catch(err => console.log(err));
        }
        catch (err) {
            reject(err);
        }
    });
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: ["lookingforgroup", "lookforgroup"],
    permLevel: 0
};

exports.help = {
    name: 'lfg',
    description: `Look for players to join you in a game. Creates a 'party' for the specified game`,
    usage: `lfg <game> [mode] [#_of_players] [time_in_minutes]\n\n<game> is **mandatory**\n\n[mode], [#_of_players], [time_in_minutes] are all optional` +
    `\nThese three options, if used, must be given *consecutivtely and in order*.` +
    `\nThat is, in order to give the # of players, you must have a mode chosen and in order to give the LFG timer, you must have a party size set.` +
    `\n\nDefault gamemode & party size vary dependening on the game/gamemode respectively, and 'any' & 'default' is a valid gamemode for every game!` +
    `\nDefault time is set to ${settings.lfg.ttl_default} minutes.\nParty size & time must be given as positive, whole numbers.` +
    `\n\nUse "${settings.prefix}lfg list" to see what games you can use!` +
    `\nUse "${settings.prefix}lfg list <game>" to see more info on the specific game` +
    `\n\nValid examples:\n${settings.prefix}lfg lol aram 4 20  ;League of Legends - ARAM - Party of 4 - 20 minute timer\n` +
    `${settings.prefix}lfg pubg default 2 ;PUBG - Any gamemode - Party of 2 - Default timer\n` +
    `${settings.prefix}lfg ow any         ;Overwatch - Default gamemode - Default party size - Default timer\n` +
    `\nInvalid examples:\n` +
    `${settings.prefix}lfg dota2 5 20     ;Doesn't give gamemode before party size or timer\n` +
    `${settings.prefix}lfg rl hoops any   ;"Any" is not a valid party size, must be a number! (or "default")`
};