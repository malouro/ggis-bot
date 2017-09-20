// =====================================================================================
//                                  ! reloadevent command
// =====================================================================================
// Reloads the events files
// Useful for debugging changes to events without restarting the bot

const main = require('../bot');

exports.run = function (bot, message, args) {
    message.channel.send(`Reloading events...`).then(m => {
        main.reloadEvents().then(() => {
            m.edit(`Successfully reloaded events!`);
            m.delete(1500)
                .then(message.delete()
                    .then().catch(err=>console.log(err)))
                .catch(errOnDel => console.log(errOnDel));
        }).catch(e => {
            m.edit(`Event reload failed:\n\`\`\`${e.stack}\`\`\``);
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.conf = {
    enabled: true,
    visible: false,
    guildOnly: false,
    aliases: ['rle', 'reloadevents'],
    permLevel: 4
};

exports.help = {
    name: 'reloadevent',
    description: 'Reloads the eventHandler & event files',
    usage: 'reloadevent'
};