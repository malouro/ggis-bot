/**
 * Checks for commands and then runs commands if one was issued in the message
 *
 * @func commands {void}
 *  @param {Discord.Client} bot
 *  @param {Discord.Message} message
 *  @param {JSON} settings
 *
 *  Commands are messages that start with a prefix (located in the config file 'settings.json')
 *      (by default, this prefix is set to '!')
 *  Additionally, @pinging the bot will trigger the help menu (aka: the !help command)
 */

const chalk = require('chalk');
const moment = require('moment');
const validateCommandOnly = require('./messageFeatures/commandOnlyChannels');
const { getGuildSpecificSetting } = require('../handlers/GuildSettings');
const { conf: { permLevel: settingsCommandPermLevel } } = require('../commands/Useful/settings');

const checkIfAbleToUse = (cmd, perms, message, settings) => {
  /**
   * Disallow the command use IF
   *  (a) Command isn't enabled
   *  (b) User doesn't have necessary permission level to use the command (permLevel)
   *  (c) If command is textChannelOnly and the channel is a DM channel
   *  (d) Command is for the main guild only, and message isn't from the main guild or a test guild
   */
  if (!cmd.conf.enabled) return false;
  if (perms < cmd.conf.permLevel) return false;
  if (cmd.conf.textChannelOnly && message.channel.type === 'dm') {
    message.reply('Sorry, but this command doesn\'t work via DM!');
    return false;
  }
  if (cmd.conf.guildOnly) {
    if (message.guild.id !== settings.mainGuild && message.guild.id !== settings.testGuild) return false;
  }
  return true;
};

/**
 * @param {import('discord.js').Client} bot
 * @param {import('discord.js').Message} message
 * @param {JSON} settings Bot settings
 * @param {string} prefix Command prefix
 */
module.exports = (bot, message, settings, prefix) => {
  if (message.content.startsWith(`<@!${bot.user.id}>`)) {
    bot.commands
      .get('help')
      .run(
        bot,
        message,
        message.content.split(/ +/),
        bot.getPerms(message),
      );
  }

  if (!message.content.startsWith(prefix)) {
    const locklist = getGuildSpecificSetting(bot, message, 'commandChannels', 'locklist', []);

    if (!locklist || locklist.length === 0) return;
  }

  const args = message.content.substring(prefix.length).split(/ +/);
  const command = args[0].toLowerCase();
  const perms = bot.getPerms(message);
  let cmd;

  /**
   * Check the bot's command & aliases Collections for the first argument.
   * (aka, what directly follows the command prefix)
   *  ie: For the message "!streamlink" -->
   *  args[0] would be 'streamlink' and we would check for the 'streamlink' command in bot.commands
   */
  if (bot.commands.has(command)) {
    cmd = bot.commands.get(command);
  } else if (bot.aliases.has(command)) {
    cmd = bot.commands.get(bot.aliases.get(command));
  }

  // if able to use !settings; allow command to go thru anyway
  // this is in case settings are corrupt, or are configured in a way that prohibits commands *everywhere*
  // to allow admins to properly reconfigure
  if (perms < settingsCommandPermLevel) {
    const [disallowed, deleteMessage] = validateCommandOnly(bot, message, Boolean(cmd), settings);

    if (disallowed) {
      if (deleteMessage) {
        console.log(`[${moment().format(settings.timeFormat)}] Message deleted in ${message.guild.name} > #${message.channel.name}\n${message.author}: "${message.content}"`);
        message.delete();
      }
      return;
    }
  }

  // if something was found, check to see if we can appropriately run the command
  if (cmd) {
    if (checkIfAbleToUse(cmd, perms, message, settings)) {
      // & then try to run it
      try {
        cmd.run(bot, message, args, perms);
      } catch (err) {
        console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] Error trying to run a command (${cmd.help.name})\n${err.stack}`));
      }
    }
  }
};
