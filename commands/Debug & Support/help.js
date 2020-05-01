/**
 * @func !help
 *
 * @desc Help menus for commands & command categories
 */

const settings = require('../../settings.json');

const splitVal = settings.helpMenu.split_value;

exports.help = {
  name: 'help',
  description: 'Displays all commands available, separated by category',
  usage: `help [command/category]\n\nFor more information on a specific command use "${settings.prefix}help [command]" or "${settings.prefix}help [category]", `
  + 'where [command] is any command you want to learn more about (ie: streamlink, lfg, fortune, etc.), and [category] is the category of commands you want to see a list of (ie: debug, useful, random, memes)',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [settings.botname, 'commands', 'commandlist'],
  permLevel: 0,
};

const checkIfCommandAvailable = (command, guildId, perms, conf) => {
  const notGuild = (guildId !== conf.mainGuild && guildId !== conf.testGuild);
  if (command.conf.guildOnly && notGuild) return false;
  if (perms < command.conf.permLevel) return false;
  return true;
};

const checkIfCommandVisible = (command, guildId, perms, conf) => {
  if (!checkIfCommandAvailable(command, guildId, perms, conf)) return false;
  if (!command.conf.visible) return false;
  return true;
};

exports.run = (bot, message, args, perms) => {
  // Set all args to lowerCase
  args.forEach((arg, index) => {
    args[index] = arg.toLowerCase();
  });

  const arg = args[1];
  const dm = (message.channel.type === 'dm');
  const gid = (message.channel.type === 'dm') ? 0 : message.guild.id;

  if (!args[1]) {
    /**
     * !help (no args)
     * Sends main help menu
     */
    let str;
    const commandGroups = Array.from(bot.commandGroups.keys());
    const longest = commandGroups.reduce((long, name) => Math.max(long, name.length), 0);
    str = `=== Command List Categories ===\nUse "${settings.prefix}help [category]" for the list of commands in that category\nUse "${settings.prefix}help all" to get a list of every command.\n\n`;
    bot.commandGroups.forEach((category) => {
      const codeStr = category.code.join('|');
      str += `${category.name}${' '.repeat(longest - category.name.length)} :: ${settings.prefix}help ${codeStr}${' '.repeat(longest - codeStr.length)} - ${category.description}\n`;
    });
    return message.channel.send(str, { code: 'asciidoc' });
  } if (arg === 'all') {
    /**
     * !help all
     * Sends all available commands to the user via DM
     */
    let str = '=== Showing Every Command ==='
      + `\nFor help & info, use: ${settings.prefix}${this.help.usage.substr(0, this.help.usage.indexOf('\n'))}\n\n`
      + `=== Category List ===\n${settings.commandGroups.map(cat => `${cat.code.join(', ')}`).join(', ')}\n\n`
      + '=== Command List ===\n';
    let ac = 0;
    let substr;
    const substringIndexes = [];
    const cmdNames = [];

    bot.commands.forEach((c) => {
      if (checkIfCommandVisible(c, gid, perms, settings)) {
        cmdNames.push(c.help.name);
      }
    });

    const longest = cmdNames.reduce((long, name) => Math.max(long, name.length), 0);
    bot.commands.forEach((c) => {
      if (checkIfCommandVisible(c, gid, perms, settings)) {
        ac += 1;
        if (c.conf.permLevel === 2) substr = ' (Admin only!)';
        else if (c.conf.permLevel === 3) substr = ' (Server owner only!)';
        else if (c.conf.permLevel === 4) substr = ' (Bot owner only!)';
        else substr = '';
        if (dm && c.conf.textChannelOnly) substr += ' (Doesn\'t work in DMs!)';
        if (!c.conf.enabled) substr = ' (DISABLED)';
        str += `${settings.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}${substr}\n`;
        if (ac % splitVal === 0) {
          substringIndexes.push(str.length);
        } else if (ac === cmdNames.length) {
          substringIndexes.push(str.length);
        }
      }
    });

    if (substringIndexes.length === 0) {
      message.author.send(str, { code: 'asciidoc' });
    } else {
      substringIndexes.forEach((i, index) => {
        if (index === 0) {
          message.author.send(str.substring(0, i), { code: 'asciidoc' });
        } else {
          message.author.send(`=== Command List (contd.) ===\n${str.substring(substringIndexes[index - 1], i)}`, { code: 'asciidoc' });
        }
      });
    }
    return message.reply('The entire list of commands has been sent via DM.');
  } if (bot.commandGroupCategories.has(arg)) {
    /**
     * !help [category]
     * Help menu for a category
     */
    const category = bot.commandGroups.get(bot.commandGroupCategories.get(arg));
    let str = `=== ${category.name} Commands ===\nCategory :: ${category.name}\nDescription :: ${category.description}\nCategory aliases :: ${category.code.join(', ')}`
      + `\n\nFor help & info, use: ${settings.prefix}${this.help.usage.substr(0, this.help.usage.indexOf('\n'))}\n\n=== Command List ===\n`;
    let substr;
    const cmdsInCat = []; const cmdNames = [];
    bot.commands.forEach((c) => {
      if (c.conf.category === category.name) {
        if (checkIfCommandVisible(c, gid, perms, settings)) {
          cmdsInCat.push(c);
          cmdNames.push(c.help.name);
        }
      }
    });
    const longest = cmdNames.reduce((long, name) => Math.max(long, name.length), 0);
    cmdsInCat.forEach((c) => {
      if (c.conf.permLevel === 2) substr = ' (ADMIN ONLY)';
      else if (c.conf.permLevel === 3) substr = ' (SERVER OWNER ONLY)';
      else if (c.conf.permLevel === 4) substr = ' (BOT OWNER ONLY)';
      else substr = '';
      if (dm && c.conf.textChannelOnly) substr += ' (Doesn\'t work in DMs!)';
      if (!c.conf.enabled) substr = ' (DISABLED)';
      str += `${settings.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}${substr}\n`;
    });
    return message.channel.send(str, { code: 'asciidoc' });
  } if (bot.commands.has(arg) || bot.aliases.has(arg)) {
    /**
     * !help [command]
     * Help menu for a command
     */
    let command = bot.commands.get(arg);
    if (!command) command = bot.commands.get(bot.aliases.get(arg));
    if (checkIfCommandAvailable(command, gid, perms, settings)) {
      return message.channel.send(`=== ${settings.prefix}${command.help.name} ===\nAliases :: ${command.conf.aliases.map(a => settings.prefix + a).join(', ')}`
        + `\n\nDescription :: ${command.help.description}\n${(command.conf.guildOnly) ? '\n[ This command is exclusive to this server ]' : ''}`
        + `${(command.conf.textChannelOnly) ? '\n[ This command will NOT work in DMs ]' : ''}\n${(command.conf.textChannelOnly || command.conf.guildOnly) ? '\n' : ''}`
        + `How to Use :: ${settings.prefix}${command.help.usage}`, { code: 'asciidoc' });
    }
    return message.reply('Sorry, you do not have permission to view that command\'s help menu.');
  }

  /** Nothing was found, send alert message */
  return message.reply(`No command or command category **${arg}** was found. Use \`${settings.prefix}${this.help.name}\` or ${bot.user} for a proper list of commands & categories!`);
};
