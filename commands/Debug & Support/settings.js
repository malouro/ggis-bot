const { getGuildCommandPrefix } = require('../../handlers/GuildSettings');

const commandName = 'settings';

exports.help = {
  name: commandName,
  description: "Change the bot's server settings",
  usage: (bot, message) => {
    const prefix = getGuildCommandPrefix(bot, message);
    return `
${commandName} <scope> <key> <value>

<scope> is *mandatory* and can be any of the following:

- bot :: General bot settings, like the command prefix
- lfg :: LFG settings

Examples ::

${prefix}${commandName} bot prefix $                ║ Changes command prefix to "$" in this server
${prefix}${commandName} lfg createTempChannel false ║ Don't create temp channels for LFG in this server
`.trim();
  },
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: [],
  permLevel: 3,
};

/* eslint-disable-next-line no-unused-vars */
exports.run = (bot, message, args) => {
  message.reply('test');
};
