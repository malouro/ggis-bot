const chalk = require('chalk');
const moment = require('moment-timezone');

module.exports = bot => {
    console.log(chalk.bgRed('['+moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')+'] Disconnected :('));
}
