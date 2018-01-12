/**
 * @func !heavybreathing
 *
 * @desc The heavy breathing cat
 */

const moment = require('moment');
const settings = require('../../settings');

exports.help = {
  name: 'heavybreathing',
  description: '*heavy breathing*',
  usage: 'heavybreathing',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['heavybreathingcat'],
  permLevel: 0,
};

exports.run = (bot, message) => {
  message.channel.send({ file: './img/memes/heavybreathing.png' });

  console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} summoned a heavy breathing cat. *heavy breathing*`);
};
