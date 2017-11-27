// =====================================================================================
//                               ! blazertov command
// =====================================================================================

exports.run = (bot, message, args) => {
    message.channel.send(`Witness the beginning! <:blazertov:306263138980855808>\nhttps://www.twitch.tv/videos/137947484 `);
    console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} is witnessing Blazertov history`);
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    textChannelOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'blazertov',
    description: 'Witness the rich history of "Blazertov"',
    usage: '!blazertov'
};