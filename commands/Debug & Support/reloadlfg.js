/**
 * @func !reloadlfg
 *
 * @desc Reloads the LFG library or a specific game in the library
 */

exports.help = {
  name: 'reloadlfg',
  description: 'Reloads game(s) in LFG.',
  usage: 'reload [game] (don\'t include [game] to reload the whole library)',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['rlfg', 'rllfg', 'reloadgames'],
  permLevel: 4,
};

exports.run = (bot, message, args) => {
  let game;

  if (args[1]) {
    if (bot.games.has(args[1])) {
      [, game] = args;
    } else if (bot.gameAliases.has(args[1])) {
      game = bot.gameAliases.get(args[1]);
    }
  } else {
    game = 0;
  }

  if (!game && game !== 0) return message.channel.send(`Cannot find the game: ${args[1]}`);

  return message.channel.send((game === 0) ? 'Reloading LFG library!' : `Reloading: ${game}`)
    .then((m) => {
      bot.reloadLFG(bot, game)
        .then(m.edit((game === 0) ? 'Successfully reloaded the LFG games library.' : `Successfully reloaded game: ${game}`))
        .catch((e) => { m.edit(`LFG reload failed: ${game}\n\`\`\`${e.stack}\`\`\``); });
    }).catch(err => console.log(err));
};
