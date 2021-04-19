/**
 * @func !reload
 *
 * @desc Reloads the command(s) specified
 *       Useful for debugging/updating commands without restarting the bot
 */

exports.help = {
  name: 'reload',
  description: 'Reloads a command file or files, if it\'s been updated or modified.',
  usage: 'reload [command]',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['rc', 'rl', 'reloadcommand'],
  permLevel: 4,
};

exports.run = (bot, message, args) => {
  let command;
  if (!args[1]) {
    message.channel.send('Reloading commands...').then((m) => {
      bot.reloadCommands(bot).then(() => {
        m.edit('Successfully reloaded all commands!')
          .then(m.delete(1500)
            .then(message.delete(1500))
            .catch(console.error))
          .catch(console.error);
      }).catch((e) => {
        m.edit(`Command reload failed:\n\`\`\`${e.stack}\`\`\``)
          .then(message.delete(1500))
          .catch(console.error);
      });
    });
  } else {
    if (bot.commands.has(args[1])) {
      [, command] = args;
    } else if (bot.aliases.has(args[1])) {
      command = bot.commands.get(bot.aliases.get(args[1])).help.name;
    }
    if (!command) {
      message.channel.send(`Cannot find the command: ${args[1]}`).then((m) => {
        m.delete(1500)
          .then(message.delete(1500)
            .catch(console.error))
          .catch(console.error);
      });
    } else {
      message.channel.send(`Reloading: ${command}`).then((m) => {
        bot.reloadCommands(bot, command).then(() => {
          m.edit(`Successfully reloaded command: ${command}`)
            .then(m.delete(1500))
            .then(message.delete(1500))
            .catch(console.error)
            .catch(console.error);
        }).catch((error) => {
          m.edit(`Command reload failed: ${command}\n\`\`\`${error.stack}\`\`\``)
            .then(message.delete(1500))
            .catch(console.error);
        });
      });
    }
  }
};
