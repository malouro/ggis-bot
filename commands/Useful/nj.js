// =====================================================================================
//                               ! nj
// =====================================================================================

exports.run = (bot, message, args) => {
    // Grab the squad
    var settings = require('../../config/nj_squad.json');
    var str = '';
    var squad = settings.squad;
    // Build string with squad members, except the member who issued it
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
    str = str + `\`${message.author.username}:\``;
    // Add on the arguments
    args.forEach((arg, index) => {
        if (index > 0) {
            str = str + ` ${arg} `;
        }
    });
    // Send message
    message.channel.send(str);
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'nj',
    description: '@mention the New Jersey squad',
    usage: 'nj [message]'
};