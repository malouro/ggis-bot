// =====================================================================================
//                               ! nj
// =====================================================================================

exports.run = (bot, message, args) => {
    
    var settings = require('../../config/squads/nj_squad.json');
    var str = '';
    var squad = settings.squad;

    squad.forEach((s, index) => {
        if (message.author.id !== s) {
            if (index === squad.length - 1) {
                str = str + `<@${s}> `;
            } else {
                str = str + `<@${s}>, `;
            }
        }
    });
    if (typeof args[1] != 'undefined')
    str = str + `\n\`${message.author.username} says:\` `;

    args.forEach((arg, index) => {
        if (index > 0) {
            str = str + ` ${arg} `;
        }
    });

    message.channel.send(str);
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    textChannelOnly: true,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'nj',
    description: '@mention the New Jersey squad',
    usage: 'nj [message]'
};