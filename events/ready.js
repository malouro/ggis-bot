// The bot's locked & loaded & ready to go!
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment-timezone');
const settings = JSON.parse(fs.readFileSync('./settings.json','utf8'));

module.exports = bot => {
    bot.user.setPresence({ game: { name: `@ping me | ${settings.prefix}${settings.botname}`, type: 0 } });
    console.log('---------------------------------------------------------');
    console.log(chalk.bgGreen.black(`Connected as ${bot.user.username} bot!`));
    console.log(chalk.bgGreen.gray(`Current date/time is ${moment().format('h:mm:ssA MM/DD/YY')}`)); 
    console.log('---------------------------------------------------------');
}