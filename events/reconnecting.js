// This event triggers when there's a need for the Bot to reconnect

const chalk = require('chalk');
const moment = require('moment-timezone');

module.exports = bot => {
    console.log(chalk.bgGreen.black('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + '] Reconnecting...'));
}
