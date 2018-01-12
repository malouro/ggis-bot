/**
 * @func !doge
 *
 * @desc much doge, such meme
 */

const moment = require('moment');
const settings = require('../../settings');

exports.help = {
  name: 'doge',
  description: 'such doge wow, much big',
  usage: 'doge',
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
  message.channel.send('', { file: './img/memes/doge.png' });

  console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} summoned a big ol' doge`);
};
