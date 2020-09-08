/**
 * @func !plug
 *
 * @desc Link to the server's PlugDJ channel
 *
 * @todo
 *  - Needs to be touched up
 *  - Better UX, messaging, and error handling
 *  - Scalable, usable per-server
 */

const fs = require('fs');
const moment = require('moment');
const settings = require('../../settings.json');
const { getGuildCommandPrefix } = require('../../handlers/GuildSettings');

exports.help = {
  name: 'plug',
  description: 'Links the server\'s main Plug.dj community',
  usage: (bot, message) => {
    const prefix = getGuildCommandPrefix(bot, message);
    return `plug (set [url])
  
${prefix}plug :: sends link to the Plug.dj community
${prefix}plug set [url] :: changes the default Plug.dj community to the given [url]`;
  },
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: true,
  textChannelOnly: true,
  aliases: ['plugdj'],
  permLevel: 0,
};

exports.run = (bot, message, args) => {
  const prefix = getGuildCommandPrefix(bot, message);

  if (typeof args[1] === 'undefined') {
    message.channel.send(`${settings.plugdj.main_url}`);
  } else if (args[1] === 'set') {
    if (!message.author.hasPermission('ADMINISTRATOR')) {
      message.reply('Sorry, but this command is **admin exclusive**. Either talk to a server administrator to help you out, or go cry in a corner. <:FeelsBadMan:230445576133541888>');
    } else if (typeof args[2] === 'undefined') {
      message.reply(`In order to use **${prefix}plug set** you need to specify the URL after "${prefix}plug set"!`);
    } else if (args[2].startsWith('https://')) {
      message.reply(`New Plug.dj link set to ${args[2]}`);
      [, , settings.plugdj.main_url] = args;
      fs.writeFile('./settings.json', JSON.stringify(settings), (err) => {
        if (err) console.error(moment().format(settings.timeFormat) + err);
      });
    } else if (args[2].startsWith('plug.dj/')) {
      let str = 'https://';
      str = str.concat(args[2]);
      message.reply(`New Plug.dj link set to ${str}`);
      settings.plugdj.main_url = str;
      fs.writeFile('./settings.json', JSON.stringify(settings), (err) => {
        if (err) console.error(moment().format(settings.timeFormat) + err);
      });
    } else {
      let str = 'https://plug.dj/';
      str = str.concat(args[2]);
      message.reply(`New Plug.dj link set to ${str}`);
      settings.plugdj.main_url = str;
      fs.writeFile('./settings.json', JSON.stringify(settings), (err) => {
        if (err) console.error(moment().format(settings.timeFormat) + err);
      });
    }
  } else {
    message.channel.send('Oops! There was an error with your command usage.');
  }
};
