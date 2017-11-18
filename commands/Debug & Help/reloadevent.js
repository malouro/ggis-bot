// =====================================================================================
//                                  ! reloadevent command
// =====================================================================================
// Reloads the events files
// Useful for debugging changes to events without restarting the bot

exports.run = function (bot, message, args) {
    message.channel.send(`Reloading event(s) ...`).then(m => {
        let event;
        if (args[1]) event = args[1];
        bot.reloadEvents(event).then(() => {
            m.edit((event)?`Successfully reloaded event '${event}'!`:`Successfully reloaded events!`);
            m.delete(1500)
                .then(message.delete()
                    .then().catch(err => console.log(err)))
                .catch(errOnDel => console.log(errOnDel));
        }).catch(e => {
            m.edit(`Event reload failed:\n\`\`\`${e.stack}\`\`\``);
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.conf = {
    enabled: false,
    visible: false,
    guildOnly: false,
    textChannelOnly: true,
    aliases: ['rle', 'reloadevents'],
    permLevel: 4
};

exports.help = {
    name: 'reloadevent',
    description: 'Reloads the event listener & event files',
    usage: 'reloadevent'
};