// Event triggers upon a disconnect

const chalk = require('chalk');
const moment = require('moment');
const settings = require('../settings.json');

module.exports = bot => {
    console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Bot disconnected :(`));
};