// =====================================================================================
//                              ! insult command
// =====================================================================================
// Toss out a random insult at someone

const fs        = require('fs');

exports.run = (bot, message, args) => {
    
};

exports.conf = {
    enabled: true,
    visible: false,
    guildOnly: false,
    aliases: [],
    permLevel: 4
};

exports.help = {
    name: 'insult',
    description: `Shout a random insult directed at a user`,
    usage: 'insult (@user)'
};