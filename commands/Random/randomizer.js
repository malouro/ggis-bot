/**
 * @func !randomizer
 *
 * @desc Picks a random item from a user-given list
 */

const settings = require('../../settings.json');

exports.help = {
  name: 'randomizer',
  description: 'Randomly chooses something out of a list of items given',
  usage: 'randomizer item#1 item#2 ... item#n\nYou can also seperate the items with "or"',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
};

exports.run = (bot, message, args) => {
  const tmpList = [];
  if (typeof args[1] !== 'undefined') {
    for (let i = 1; i < args.length; i++) {
      if (args[i] !== 'or') tmpList.push(args[i]);
    }
    message.reply(`Your randomized result is... **${tmpList[Math.floor(Math.random() * tmpList.length)]}**!`);
  } else {
    message.reply(`There's nothing for me to randomize! You need to list some items, separated by spaces, after **${settings.prefix}randomizer**`);
  }
};
