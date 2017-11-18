// =====================================================================================
//                               ! randomizer command
// =====================================================================================
// Picks out a random item from a given list

const settings = require('../../settings.json');

exports.run = (bot, message, args) => {
    let tmp_list = [];
    if (typeof args[1] !== 'undefined') {
        for (i=1; i<args.length; i++) {
            if (args[i] !== 'or') tmp_list.push(args[i]);
        }
        message.reply(`Your randomized result is... **${tmp_list[Math.floor(Math.random()*tmp_list.length)]}**!`); 
    } else {
        message.reply(`There's nothing for me to randomize! You need to list some items, seperated by spaces, after **${settings.prefix}randomizer**`);
    }
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'randomizer',
    description: 'Randomly chooses something out of a list of items given',
    usage: 'randomizer (item#1) (item#2) ... (item#N)'
};