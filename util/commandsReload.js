const chalk   = require('chalk');
const Discord = require('discord.js');
const fs      = require('fs');

module.exports = (bot, command) => {
    return new Promise((resolve, reject) => {
        try {
            if (command) {
                if (!bot.commands.has(command) && !bot.aliases.has(command)) reject(new Error('COMMAND_NOT_FOUND'));
                let cat = bot.commands.get(command).conf.category;                
                delete require.cache[require.resolve(`../commands/${cat}/${command}`)];
                let cmd = require(`../commands/${cat}/${command}`);
                bot.commands.delete(command);
                bot.aliases.forEach((cmd, alias) => {
                    if (cmd === command) bot.aliases.delete(alias);
                });
                bot.commands.set(command, cmd);
                bot.commands.get(command).conf.category = cat;
                cmd.conf.aliases.forEach(alias => {
                    bot.aliases.set(alias, cmd.help.name);
                });
                // Re-sort command list:
                var keys = [];
                var sorted = new Discord.Collection();
                bot.commands.forEach((value, key, map) => {
                    keys.push(key);
                });
                keys.sort().map((key) => {
                    sorted.set(key, bot.commands.get(key));
                });
                bot.commands = sorted;
                resolve();
            } else {
                bot.commands.forEach(command => {
                    delete require.cache[require.resolve(`../commands/${command.conf.category}/${command.help.name}`)]
                });
                bot.aliases.clear();
                bot.commands.clear();
                fs.readdir('./commands/', (err, folders) => {
                    folders.forEach(folder => {
                        fs.readdir(`./commands/${folder}`, (err, files) => {
                            if (err) throw err;
                            console.log(chalk.bgBlue(`Loading a total of ${files.length} commands from /${folder}/`));
                            files.forEach(f => {
                                let contents = require(`../commands/${folder}/${f}`);
                                console.log(chalk.bgCyan.black(`Loading command ${contents.help.name} ... ✓`));
                                bot.commands.set(contents.help.name, contents);
                                bot.commands.get(contents.help.name).conf.category = `${folder}`;
                                contents.conf.aliases.forEach(alias => {
                                    bot.aliases.set(alias, contents.help.name);
                                });
                            });
                        });
                    })	
                });
                resolve();
            }
        } catch (err) {
            reject(err);
        }
    });
}
