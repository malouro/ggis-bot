// The bot's locked & loaded and ready to go!

const chalk = require('chalk');
const moment = require('moment');

module.exports = (bot, settings) => {
  const header = '---------------------------------------------------------';

  bot.user.setPresence({ game: { name: `@ping me | ${settings.prefix}help`, type: 0 } });

  console.log(header);
  console.log(chalk.bgGreen.black(`Connected as ${bot.user.username} bot!`));
  console.log(chalk.bgGreen.gray(`Current date/time is ${moment().format(settings.timeFormat)}`));
  console.log(header);
};
