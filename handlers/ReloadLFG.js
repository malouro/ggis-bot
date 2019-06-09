const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');

/* eslint-disable */
const sortLibrary = (bot) => {
  return new Promise((resolve, reject) => {
    try {
      // Reorder games alphabetically
      // (otherwise, the updated game will just get pushed to bottom of list and be out of order)
      const keys = [];
      const sorted = new Discord.Collection();
      bot.games.forEach((value, key) => {
        keys.push(key);
      });
      keys.sort().map((key) => {
        sorted.set(key, bot.games.get(key));
      });
      bot.games = sorted;
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = (bot, game) => {
  return new Promise((resolve, reject) => {
    try {
      if (game === 0) { // If no game specified, reset all LFG games
        fs.readdir('./config/lfg/default', (err, files) => {
          if (err) reject(err);
          bot.games.clear();
          console.log(chalk.bgHex('#ffcc00').white('RELOADING LFG GAMES:'));
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
      } else { // otherwise, reload the given game
        fs.readFile(`./config/lfg/default/${game}.json`, (err, file) => {
          if (err && err.code === 'ENOENT') {
            console.log(`Couldn't find file for ${game} in /lfg/`);
            reject(new Error(`Couldn't find file for ${game} in /lfg/`));
          } else if (err) {
            throw err;
          } else {
            let g = JSON.parse(file);
            bot.games.delete(game);
            bot.gameAliases.forEach((g, alias) => {
              if (g === game) bot.gameAliases.delete(alias);
            });
            bot.games.set(game, g);
            g.aliases.forEach((alias) => {
              bot.gameAliases.set(alias, g.code);
            });
            sortLibrary(bot)
              .then(() => {
                console.log(chalk.bgYellow.gray(`Loading game ... ${g.name}`));
                resolve();
              }).catch(err => console.log(err));
          }
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};
