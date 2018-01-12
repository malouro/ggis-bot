/**
 * @func !keynpeele
 *
 * @desc Links to a random Key & Peele YouTube video
 */

const fs = require('fs');

const conf = JSON.parse(fs.readFileSync('./config/vids/keynpeele.json', 'utf8'));

exports.help = {
  name: 'keynpeele',
  description: `Play a random Key & Peele video. (Currently, there are ${conf.videos.length} videos stored)`,
  usage: 'keynpeele',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['knp'],
  permLevel: 0,
};

exports.run = (bot, message) => {
  const update = JSON.parse(fs.readFileSync('./config/vids/keynpeele.json', 'utf8'));
  const rng = Math.floor(Math.random() * update.videos.length);
  message.reply(`https://www.youtube.com/watch?v=${update.videos[rng]}`);

  // Update w/ new videos
  if (update.videos.length !== conf.videos.length) {
    bot.commandsReload('keynpeele');
  }
};
