// =====================================================================================
//                              ! sltest command
// =====================================================================================


exports.run = (bot, message, args, perms) => {
    /**
     * Write test command in here
     */

    require('../../util/streamlinkHandler').streamUp(bot, {time: 9000, channel_name: "signeto"});
}

exports.conf = {
    enabled: true,
    visible: false,
    guildOnly: false,
    textChannelOnly: true,    
    aliases: [],
    permLevel: 4
};

exports.help = {
    name: 'sltest',
    description: `For testing purposes.`,
    usage: 'sltest'
};