/**
 * @func !ping
 *
 * @desc Get the response time from the bot (Ping! Pong!)
 */

const moment = require('moment');
const settings = require('../../settings');

exports.help = {
  name: 'ping',
  description: 'Pong! Returns the bot\'s response time',
  usage: 'ping',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
};

exports.run = (bot, message) => {
  const ping = Math.round(bot.ping);
  message.reply(`Pong! \`${ping} ms\``);
  console.log(`[${moment().format(settings.timeFormat)}] Ping! Pong! ${ping} ms`);
};
