// This event triggers when there's a need for the Bot to reconnect

const chalk = require('chalk');
const moment = require('moment');
const settings = require('../settings.json');

module.exports = bot => {
    console.log(chalk.bgGreen.black(`[${moment().format(settings.timeFormat)}] Reconnecting...`));
}
