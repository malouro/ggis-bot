// =====================================================================================
//                              ! help command
// =====================================================================================
// Help menu, shows all commands and some info on them

const settings = require('../../settings.json');
const SPLIT_VAL = 20; // for when showing all commands, seperate into pages

exports.run = (bot, message, args, perms) => {
    let arg = args[1];

    /**
     * Generate main help menu
     */

    if (!args[1]) {
        let str;
        let commandGroups = Array.from(bot.commandGroups.keys());
        let longest = commandGroups.reduce((long, str) => Math.max(long, str.length), 0);
        str = `=== Command List Categories ===\nUse "${settings.prefix}${settings.botname} [category]" for the list of commands in that category\nUse "${settings.prefix}${settings.botname} all" to get a list of *every* command.\n\n`;
        bot.commandGroups.forEach((category) => {
            let codeStr = category.code.join('|');
            str += `${category.name}${' '.repeat(longest - category.name.length)} :: ${settings.prefix}${settings.botname} ${codeStr}${' '.repeat(longest + 6 - codeStr.length)} -- ${category.description}\n`;
        });
        message.channel.send(str, { code: 'asciidoc' });
    }

    /**
     * If another argument is given
     */

    else {

        /**
         * Generate help menu for ALL commands
         */

        if (arg === "all") {
            let str = `=== Showing Every Command ===` +
                `\nFor help & info, use: ${settings.prefix}${this.help.usage.substr(0, this.help.usage.indexOf('\n'))}\n\n=== Category List ===\n${settings.commandGroups.map(cat => `${cat.code.join(', ')}`).join(', ')}\n\n=== Command List ===\n`;
            let ac = 0;
            let substr;
            let substringIndexes = [];
            let cmdNames = [];
            let cmdList = [];
            bot.commands.forEach(c => {
                if (perms >= c.conf.permLevel && c.conf.visible && (!c.conf.guildOnly || message.guild.id === settings.mainguild || message.guild.id === settings.testguild)) {
                    cmdNames.push(c.help.name);                    
                }
            });
            let longest = cmdNames.reduce((long, str) => Math.max(long, str.length), 0);
            bot.commands.forEach((c) => {
                if (perms >= c.conf.permLevel && c.conf.visible && (!c.conf.guildOnly || message.guild.id === settings.mainguild || message.guild.id === settings.testguild)) {
                    ac++;
                    if (c.conf.permLevel === 2) substr = ' (ADMIN ONLY)';
                    else if (c.conf.permLevel === 3) substr = ' (SERVER OWNER ONLY)';
                    else if (c.conf.permLevel === 4) substr = ' (BOT OWNER ONLY)';
                    else substr = '';
                    if (!c.conf.enabled) substr = ' (DISABLED)';
                    str += `${settings.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}${substr}\n`;
                    if (ac % SPLIT_VAL === 0) {
                        substringIndexes.push(str.length);
                    } else if (ac === cmdNames.length){
                        substringIndexes.push(str.length);
                    }
                }
            });
            if (substringIndexes.length === 0) message.author.send(str, { code: 'asciidoc' });
            else {
                substringIndexes.forEach((i,index) => {
                    if (index === 0) {
                        message.author.send(str.substring(0,i), {code: 'asciidoc'});
                    } else {
                        message.author.send('=== Command List (contd.) ===\n' + str.substring(substringIndexes[index-1],i), {code: 'asciidoc'});
                    }
                });
            }
            message.reply('The entire list of commands has been sent via DM.');
        }

        /**
         * Generate help menu for a command category 
         */

        else if (bot.commandGC.has(arg)) {
            category = bot.commandGroups.get(bot.commandGC.get(arg));
            let str = `=== ${category.name} Commands ===\nCategory :: ${category.name}\nDescription :: ${category.description}\nCategory aliases :: ${category.code.join(', ')}` +
                `\n\nFor help & info, use: ${settings.prefix}${this.help.usage.substr(0, this.help.usage.indexOf('\n'))}\n\n=== Command List ===\n`;
            let substr;
            let cmdsInCat = []; let cmdNames = [];
            bot.commands.forEach(c => {
                if (c.conf.category === category.name) {
                    if (perms >= c.conf.permLevel && c.conf.visible && (!c.conf.guildOnly || message.guild.id === settings.mainguild || message.guild.id === settings.testguild)) {
                        cmdsInCat.push(c);
                        cmdNames.push(c.help.name);
                    }
                }
            });
            let longest = cmdNames.reduce((long, str) => Math.max(long, str.length), 0);
            cmdsInCat.forEach((c, index) => {
                if (c.conf.permLevel === 2) substr = ' (ADMIN ONLY)';
                else if (c.conf.permLevel === 3) substr = ' (SERVER OWNER ONLY)';
                else if (c.conf.permLevel === 4) substr = ' (BOT OWNER ONLY)';
                else substr = '';
                if (!c.conf.enabled) substr = ' (DISABLED)';
                str += `${settings.prefix}${c.help.name}${' '.repeat(longest - c.help.name.length)} :: ${c.help.description}${substr}\n`;
            });
            message.channel.send(str, { code: 'asciidoc' });
        }

        /**
         * Generate help menu for a command
         */

        else if (bot.commands.has(arg) || bot.aliases.has(arg)) {
            let command = bot.commands.get(arg);
            if (!command) command = bot.commands.get(bot.aliases.get(arg));
            if (command.conf.guildOnly && (message.guild.id !== settings.mainguild && message.guild.id !== settings.testguild)) return;
            if (!command.conf.visible) return;
            if (perms >= command.conf.permLevel)
                message.channel.send(`=== ${settings.prefix}${command.help.name} ===\nAliases :: ${command.conf.aliases.map(a => settings.prefix + a).join(', ')}\n\nDescription :: ${command.help.description}\n\nHow to Use :: ${settings.prefix}${command.help.usage}`, {
                    code: 'asciidoc'
                });
            else message.reply(`Sorry, you do not have permission to view that command's help menu.`);
        } 
        
        /**
         * Nothing was found, throw the user an error message
         */
        
        else {
            message.reply(`No command or command category **${arg}** was found. Use \`${settings.prefix}${this.help.name}\` for a proper list of commands & categories!`);
        }
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: ["h", "commands", "commandlist"],
    permLevel: 0
};

exports.help = {
    name: `${settings.botname}`,
    description: 'Displays all commands available, seperated by category',
    usage: `${settings.botname} [command/category]\n\nFor more information on a specific command use "${settings.prefix}${settings.botname} [command]" or "${settings.prefix}${settings.botname} [category]",\
 where [command] is any command you want to learn more about (ie: streamlink, lfg, fortune, etc.), and [category] is the category of commands you want to see a list of (ie: debug, useful, random, memes)`
};