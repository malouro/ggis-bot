// =====================================================================================
//                                ! reloadlfg command
// =====================================================================================
// "Reloads" the LFG games

exports.run = (bot, message, args) => {
    let game;
    if (typeof args[1] != 'undefined') {
        if (bot.games.has(args[1])) {
            game = args[1];
        } else if (bot.gameAliases.has(args[1])) {
            game = bot.gameAliases.get(args[1]);
        }
    } else {
        game = 0;
    }

    if (!game & game !== 0) {
        return message.channel.send(`Cannot find the game: ${args[1]}`);
    } else {
        if (game !== 0) {
            message.channel.send(`Reloading: ${game}`)
                .then(m => {
                    bot.reloadLFG(game)
                        .then(() => {
                            m.edit(`Successfully reloaded game: ${game}`);
                        })
                        .catch(e => {
                            m.edit(`LFG reload failed: ${game}\n\`\`\`${e.stack}\`\`\``);
                        });
                });
        } else {
            message.channel.send(`Reloading LFG games!`)
                .then(m => {
                    bot.reloadLFG(game)
                        .then(() => {
                            m.edit(`Successfully reloaded LFG games library.`);
                        })
                        .catch(e => {
                            m.edit(`LFG reload failed!\n\`\`\`${e.stack}\`\`\``);
                        });
                });
        }
    }
};

exports.conf = {
    enabled: true,
    visible: false,
    guildOnly: false,
    aliases: ['rlfg', 'rllfg', 'reloadgames'],
    permLevel: 4
};

exports.help = {
    name: 'reloadlfg',
    description: 'Reloads game(s) in LFG.',
    usage: 'reload [game]'
};