// =====================================================================================
//                              ! help command
// =====================================================================================
// Help menu, shows all commands and some info

const settings = require('../settings.json');

exports.run = (bot, message, args, perms) => {
    if (!args[1]) {
        const commandNames = Array.from(bot.commands.keys());
        const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);
        let str; let substr;
        str = `=== Command List ===\nUse "${settings.prefix}help [command]" or "${settings.prefix}${settings.botname} [command]" for more information on a specific command\n\n`;
        bot.commands.forEach((c, index) => {
            if (perms >= c.conf.permLevel && c.conf.visible && (!c.conf.guildOnly || (message.guild.id === settings.mainguild || message.guild.id === settings.testguild))) {
                if (c.conf.permLevel === 2) substr = ' (ADMIN ONLY)';
                else if (c.conf.permLevel === 3) substr = ' (SERVER OWNER ONLY)';
                else if (c.conf.permLevel === 4) substr = ' (BOT OWNER ONLY)';
                else substr = '';
                if (!c.conf.enabled) substr = ' (DISABLED)';
                str = str + `• ${settings.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}${substr}\n`;
            }
        });
        message.channel.send(str, {code: 'asciidoc'});
    } else {
        let command = args[1];
        // !help [command]
        if (bot.commands.has(command)) {
            command = bot.commands.get(command);
            if (command.conf.guildOnly && (message.guild.id !== settings.mainguild && message.guild.id !== settings.testguild)) return;
            if (!command.conf.visible) return;
            if (perms >= command.conf.permLevel)
                message.channel.send(`=== ${settings.prefix}${command.help.name} ===\nAliases :: ${command.conf.aliases.map(a=> settings.prefix+a).join(', ')}\n\nDescription :: ${command.help.description}\n\nHow to Use :: ${settings.prefix}${command.help.usage}`, {
                    code: 'asciidoc'
                });
            else message.reply(`Sorry, you do not have permission to view that command's help menu.`);
        } 
        // !help [aliasForACommand]
        else if (bot.aliases.has(command)) {
            command = bot.commands.get(bot.aliases.get(command));
            if (command.conf.guildOnly && (message.guild.id !== settings.mainguild && message.guild.id !== settings.testguild)) return;
            if (!command.conf.visible) return;
            if (perms >= command.conf.permLevel)
                message.channel.send(`=== ${settings.prefix}${command.help.name} ===\nAliases :: ${command.conf.aliases.map(a=> settings.prefix+a).join(', ')}\n\nDescription :: ${command.help.description}\n\nHow to Use :: ${settings.prefix}${command.help.usage}`, {
                    code: 'asciidoc'
                });
            else message.reply(`Sorry, but you do not have permission to view that command's help menu.`);
        } else {
            message.reply(`Command **${command}** was not found.`);
        }
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: ["ggis","ggis?","h","commands","commandlist"],
    permLevel: 0
};

exports.help = {
    name: 'help',
    description: 'Displays all commands available to you',
    usage: `help [command]\n\nFor more information on a specific command use "${settings.prefix}help [command]" or "${settings.prefix}${settings.botname} [command]", where [command] is any command you want to learn more about (ie: streamlink, lfg, fortune, etc.)`
};