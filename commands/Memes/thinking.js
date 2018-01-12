/**
 * @func !thinking
 *
 * @desc Random :thinking: gif
 */

const fs = require('fs');
const moment = require('moment');
const settings = require('../../settings');

exports.help = {
  name: 'thinking',
  description: 'Sends a random 🤔 gif',
  usage: 'thinking',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['🤔'],
  permLevel: 0,
};

exports.run = (bot, message) => {
  const memes = JSON.parse(fs.readFileSync('./config/memes.json', 'utf8'));

  message.channel.send(`${memes.thinking.files[Math.floor(Math.random() * memes.thinking.files.length)]}`);

  console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} is really 🤔`);
};
