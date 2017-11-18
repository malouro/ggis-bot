// The bot's locked & loaded and ready to go!

const chalk = require('chalk');
const moment = require('moment');
const settings = require('../settings.json');

module.exports = bot => {

    bot.user.setPresence({ game: { name: `@ping me | ${settings.prefix}help`, type: 0 } });

    console.log('---------------------------------------------------------');
    console.log(chalk.bgGreen.black(`Connected as ${bot.user.username} bot!`));
    console.log(chalk.bgGreen.gray(`Current date/time is ${moment().format(settings.timeFormat)}`)); 
    console.log('---------------------------------------------------------');

}