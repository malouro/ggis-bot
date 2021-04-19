const { getGuildSpecificSetting } = require('../../handlers/GuildSettings');

/**
 * Determines whether the command usage / message is allowed or disallowed in the current channel
 *
 * @param {import('discord.js').Client} bot The bot
 * @param {import('discord.js').Message} message Message to examine
 * @param {boolean} isCommand Did the message contain a command usage?
 * @param {JSON} settings Bot settings config
 * @returns {boolean[]} Returns [ commandProhibited, deleteMessage? ] boolean values
 */
module.exports = (bot, message, isCommand, settings) => {
  const getCommandChannelsSetting = setting => getGuildSpecificSetting(
    bot,
    message,
    'commandChannels',
    setting,
    settings.commandChannels[setting],
  );

  const enabled = getCommandChannelsSetting('enabled');
  const locklist = getCommandChannelsSetting('locklist');
  const whitelist = getCommandChannelsSetting('whitelist');
  const blacklist = getCommandChannelsSetting('blacklist');
  const strictModeEnabled = getCommandChannelsSetting('strictMode');

  if (enabled) {
    if (locklist.includes(message.channel.id)) {
      return [!isCommand, strictModeEnabled];
    }

    // If channel is in blacklist, disallow if it's a command
    if (blacklist.includes(message.channel.id)) {
      return [isCommand, strictModeEnabled];
    }
    // If channel isn't in the whitelist, disallow if it's a command
    // If none of the whitelist channels exist anymore, always allow
    if (whitelist.length > 0 && !whitelist.includes(message.channel.id)) {
      return [
        isCommand || !whitelist.some(channel => message.guild.channels.cache.has(channel)),
        strictModeEnabled,
      ];
    }
  }

  return [false, false];
};
