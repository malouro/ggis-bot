// Event triggers upon a disconnect

const chalk = require('chalk');
const moment = require('moment');

module.exports = (settings) => {
  if (process.env.NODE_NEV === 'test') {
    global.ALL_CLEAR = true;
  }
  console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${settings.botNameProper}-bot has disconnected :(`));
};
