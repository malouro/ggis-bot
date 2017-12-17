// =====================================================================================
//                                  ! reload command
// =====================================================================================
// Reloads the command(s)
// Useful for debugging/updating commands without restarting the bot

exports.run = (bot, message, args) => {
  let command;
  if (!args[1]) {
    message.channel.send('Reloading commands...').then((m) => {
      bot.reloadCommands(bot).then(() => {
        m.edit('Successfully reloaded all commands!')
          .then(m.delete(1500)
            .then(message.delete(1500))
            .catch(console.error()))
          .catch(console.error());
      }).catch((e) => {
        m.edit(`Command reload failed:\n\`\`\`${e.stack}\`\`\``)
          .then(message.delete(1500))
          .catch(console.error());
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
            .then()
            .catch(console.error()))
          .catch(console.error());
      });
    } else {
      message.channel.send(`Reloading: ${command}`).then((m) => {
        bot.reloadCommands(bot, command).then(() => {
          m.edit(`Successfully reloaded command: ${command}`)
            .then(m.delete(1500))
            .then(message.delete(1500))
            .catch(errOnDel => console.log(errOnDel))
            .catch(console.error());
        }).catch((e) => {
          m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``)
            .then(message.delete(1500))
            .catch(console.error());
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
  permLevel: 4,
};

exports.help = {
  name: 'reload',
  description: 'Reloads the command file, if it\'s been updated or modified.',
  usage: 'reload [command]',
};
