/**
 * @func !git
 *
 * @desc Posts link to Github page
 */

exports.help = {
  name: 'git',
  description: 'Links to the bot\'s Github repo',
  usage: 'git',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
  url: 'https://github.com/malouro/ggis-bot',
};

exports.run = (bot, message) => {
  message.reply(this.conf.url);
};
