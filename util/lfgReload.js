const chalk   = require('chalk');
const Discord = require('discord.js');
const fs      = require('fs');

module.exports = (bot, game) => {
    return new Promise((resolve, reject) => {
        try {
            if (game === 0) { // If no game specified, reset all LFG games
                fs.readdir('./lfg', (err, files) => {
                    if (err) throw err;
                    bot.games.forEach(g => {
                        if (files.includes(g.code)) {
                            if (typeof require.cache[require.resolve(`../lfg/${g.code}`)] !== 'undefined')
                            delete require.cache[require.resolve(`../lfg/${g.code}`)]
                        }
                    })
                    bot.games.clear();
                    console.log(chalk.bgYellow.bold(`RELOADING LFG GAMES:`));
                    console.log(chalk.bgYellow.black(`Loading a total of ${files.length} games into Games Collection.`));
                    files.forEach(f => {
                        let contents = require(`../lfg/${f}`);
                        console.log(chalk.bgYellow.gray(`Loading game ... ${contents.name}`));
                        bot.games.set(contents.code, contents);
                        contents.aliases.forEach(alias => {
                            bot.gameAliases.set(alias, contents.code);
                        });
                    });
                });
            } else { // otherwise, reload the given game
                delete require.cache[require.resolve(`../lfg/${game}`)];
                let g = require(`../lfg/${game}`);
                bot.games.delete(game);
                bot.gameAliases.forEach((g, alias) => {
                    if (g === game) bot.gameAliases.delete(alias);
                });
                bot.games.set(game, g);
                g.aliases.forEach(alias => {
                    bot.gameAliases.set(alias, g.code);
                });
                // Reorder games alphabetically 
                // (otherwise, the updated game will just get pushed to bottom of list and be out of order)
                let keys = [];
                let sorted = new Discord.Collection();
                bot.games.forEach((value, key, map) => {
                    keys.push(key);
                });
                keys.sort().map((key) => {
                    sorted.set(key, bot.games.get(key));
                });
                bot.games = sorted;
            }
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}