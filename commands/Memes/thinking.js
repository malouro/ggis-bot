// =====================================================================================
//                              ! thinking command
// =====================================================================================
// Sends a random thinking gif

const fs = require('fs');

exports.run = (bot, message, args) => {
    let memes = JSON.parse(fs.readFileSync('./config/memes.json', 'utf8'));
    message.channel.send({ file: `../images/memes/thinking${Math.floor(Math.random() * memes.thinking.files) + 1}.gif` });
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    aliases: ['🤔'],
    permLevel: 0
};

exports.help = {
    name: 'thinking',
    description: `Sends a random :thinking: gif`,
    usage: 'thinking'
};