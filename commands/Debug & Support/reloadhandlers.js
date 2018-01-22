/**
 * @func !reloadhandlers
 *
 * @desc Reloads handlers (in the ~/handlers/ directory)
 */

exports.help = {
  name: 'reloadhandlers',
  description: 'Reloads most command handler files (in /util/)',
  usage: 'reloadhandlers',
};

exports.conf = {
  enabled: true,
  visible: false,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['rlh'],
  permLevel: 4,
};

exports.run = (bot, message) => {
  message.channel.send('Reloading handlers ...').then((m) => {
    bot.reloadHandlers().then(() => {
      m.edit('Successfully reloaded handlers!');
      m.delete(1500)
        .then(message.delete()
          .then().catch(err => console.log(err)))
        .catch(errOnDel => console.log(errOnDel));
    }).catch((e) => {
      m.edit(`Handler reload failed:\n\`\`\`${e.stack}\`\`\``);
    });
  }).catch(console.error());
};
