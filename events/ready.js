// The bot's locked & loaded & ready to go!
const chalk = require('chalk');
const moment = require('moment-timezone');

module.exports = bot => {
    console.log('---------------------------------------------------------');
    console.log(chalk.bgGreen.black('Connected as ' + bot.user.username + ' bot!'));
    console.log(chalk.bgGreen.gray('Current date/time is ' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY'))); 
    console.log('---------------------------------------------------------');
}
