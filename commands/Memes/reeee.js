/**
 * @func !reeee
 *
 * @desc REEEEEEEEEEEEEEEEE
 */

const fs = require('fs');
const moment = require('moment');
const settings = require('../../settings');

exports.help = {
  name: 'reeee',
  description: 'REEEEEEEEEEE',
  usage: 'reeee',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['reee', 'reeeee'],
  permLevel: 0,
};

exports.run = (bot, message) => {
  const memes = JSON.parse(fs.readFileSync('./config/memes.json', 'utf8'));

  message.channel.send(`${memes.reeee.files[Math.floor(Math.random() * memes.reeee.files.length)]}`);

  console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} is REEEEEEEE-ing right now`);
};
