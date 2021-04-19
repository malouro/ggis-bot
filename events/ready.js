// The bot's locked & loaded and ready to go!

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');

let streamlink = require('../handlers/StreamLinkHandler');

const checkForCurrentGuilds = (bot) => {
  bot.guilds.cache.forEach((guild) => {
    fs.readFile(`./config/streamlink/guilds/${guild}.json`, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          streamlink.addGuild(bot, guild);
        } else {
          throw err;
        }
      }
    });
  });
};

module.exports = (bot, settings) => {
  const header = '---------------------------------------------------------';

  bot.user.setPresence({ game: { name: `@ping me | ${settings.prefix}help`, type: 0 } });
  checkForCurrentGuilds(bot);

  console.log(header);
  console.log(chalk.bgGreen.black(`Connected as ${bot.user.username} bot!`));
  console.log(chalk.bgGreen.gray(`Current date/time is ${moment().format(settings.timeFormat)}`));
  console.log(header);
};

module.exports.reloadHandler = () => new Promise((resolve, reject) => {
  try {
    delete require.cache[require.resolve('../handlers/StreamLinkHandler')];
    streamlink = require('../handlers/StreamLinkHandler');
    resolve();
  } catch (err) {
    reject(err);
  }
});
