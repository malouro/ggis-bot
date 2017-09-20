// =====================================================================================
//                                  ! ping command
// =====================================================================================
// Returns "Pong!" message with a millisecond response time
// Useful for testing response of bot

const moment = require('moment-timezone');
const chalk = require('chalk');

exports.run = (bot, message, args) => {
    try {
    message.reply(`Pong! \`${Math.round(bot.ping)} ms\``);
    console.log(chalk.bgBlue('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + '] Responded to ping from ' + message.author.username + '.'));
    } catch (err) {
        console.log(chalk.bgRed.bold('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + '] '+err));
    }
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: 'ping',
  description: 'Pong! Returns the bot\'s response time',
  usage: 'ping'
};