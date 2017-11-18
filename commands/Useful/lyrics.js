// =====================================================================================
//                              ! lyrics command
// =====================================================================================

const lf        = require('lyrics-fetcher');
const moment    = require('moment');
const seperator = '|';
const settings  = require('../../settings.json');

exports.run = (bot, message, args, perms) => {
    let artist;
    let song;
    args.splice(0,1);
    let req = args.join(' ');
    req = req.split(seperator);

    if (req[0]) {
        artist = req[0].trim();
    } else {
        return message.reply(`No lyrics for me to search. Please specify the artist and song title! (seperate the two with a '${seperator}') \`${settings.prefix}lyrics artist | song\``);
    }
    
    if (req[1]) {
        song = req[1].trim();
    } else {
        return message.reply(`No song given! Please specify the song title. \`${settings.prefix}lyrics artist | song\``)
    }

    let str = `**${artist} - ${song} Lyrics**\n\`\`\`\n`;

    lf.fetch(artist, song, (err, lyrics) => {
        if (err) {
            message.reply('*Woops!* Something went wrong...\n\nCouldn\'t find the artist/song 😦 (possibly due to the request having unsearchable symbols or characters)');
            console.log(err);
        } else {
            message.channel.send((lyrics.length + str.length > 1996) ? str + lyrics.substr(0, 1996-str.length) + '\n```' : str + lyrics + '\n```');
            console.log(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} requested lyrics for ${artist} - ${song}`);
        }
    });
};

doRestOfMessage = function(message, lyrics) {

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
    name: 'lyrics',
    description: `Get the lyrics from a song`,
    usage: 'lyrics artist | songTitle'
};