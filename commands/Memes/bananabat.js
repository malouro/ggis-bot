/**
 * @func !bananabat
 *
 * @desc 🍌🦇
 */

const moment = require('moment');
const chalk = require('chalk');
const settings = require('../../settings');

exports.help = {
  name: 'bananabat',
  description: 'Bananananananananana bat',
  usage: 'bananabat',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: true,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
  url: 'http://i.imgur.com/ym5ek1y.gifv',
};

exports.run = (bot, message) => {
  try {
    message.channel.send(`🍌🦇 ${this.conf.url} 🍌🦇`);
    console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} summoned the 🍌🦇`);
  } catch (err) {
    console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}`));
  }
};
