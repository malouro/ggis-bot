/**
 * @func !reloadevent
 *
 * @desc Reloads events (in the ~/events/ directory)
 *
 * @todo Currently, this is not an implemented or working feature. Hence, it is disabled
 */

exports.help = {
  name: 'reloadevent',
  description: 'Reloads the event listener & event files',
  usage: 'reloadevent',
};

exports.conf = {
  enabled: false,
  visible: false,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['rle', 'reloadevents'],
  permLevel: 4,
};

exports.run = (bot, message, args) => {
  message.channel.send('Reloading event(s) ...').then((m) => {
    let event;
    if (args[1]) [, event] = args;
    bot.reloadEvents(event).then(() => {
      m.edit((event) ? `Successfully reloaded event '${event}'!` : 'Successfully reloaded events!');
      m.delete(1500)
        .then(message.delete()
          .then().catch(console.error()))
        .catch(errOnDel => console.log(errOnDel));
    }).catch((err) => {
      m.edit(`Event reload failed:\n\`\`\`${err.stack}\`\`\``);
    });
  }).catch(console.error());
};
