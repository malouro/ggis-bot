/**
 * @func !fortune
 *
 * @desc Open a fortune cookie
 */

const fs = require('fs');
const settings = require('../../settings');

exports.help = {
  name: 'fortune',
  description: `Opens up a fortune cookie! (${settings.fortune.amount} total fortunes)`,
  usage: 'fortune',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['fortunecookie'],
  permLevel: 0,
};

exports.run = (bot, message) => {
  const fortuneList = JSON.parse(fs.readFileSync('./config/fortunes.json', 'utf8'));
  message.reply(`Here's your fortune! ${fortuneList.fortunes[Math.floor(Math.random() * fortuneList.fortunes.length)]}`);
};
