// =====================================================================================
//                                  ! reload command
// =====================================================================================
// Reloads the command(s)
// Useful for debugging/updating commands without restarting the bot

exports.run = (bot, message, args) => {
    let command;
    if (!args[1]) {
        message.channel.send(`Reloading commands...`).then(m => {
            bot.reloadCommands(bot).then(() => {
                m.edit(`Successfully reloaded all commands!`)
                    .then(m.delete(1500)
                        .then(message.delete(1500))
                        .catch(err => console.log(err)))
                    .catch(err => console.log(err));
            });
        });
    } else {
        if (bot.commands.has(args[1])) {
            command = args[1];
        } else if (bot.aliases.has(args[1])) {
            command = bot.commands.get(bot.aliases.get(args[1])).help.name;
        }
        if (!command) {
            message.channel.send(`Cannot find the command: ${args[1]}`).then(m => {
                m.delete(1500)
                    .then(message.delete(1500)
                        .then()
                        .catch(err => console.log(err)))
                    .catch(errOnDel => console.log(errOnDel));
            });
        } else {
            message.channel.send(`Reloading: ${command}`).then(m => {
                bot.reloadCommands(bot, command).then(() => {
                    m.edit(`Successfully reloaded command: ${command}`)
                        .then(m.delete(1500))
                            .then(message.delete(1500))
                            .catch(errOnDel => console.log(errOnDel))
                        .catch(err => console.log(err))
                }).catch(e => {
                    m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``)
                        .then(message.delete(1500))
                        .catch(err => console.log(err));
                });
            });
        }
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: true,
    aliases: ['rc', 'rl', 'reloadcommand'],
    permLevel: 4
};

exports.help = {
    name: 'reload',
    description: 'Reloads the command file, if it\'s been updated or modified.',
    usage: 'reload [command]'
};