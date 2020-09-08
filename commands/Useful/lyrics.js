/**
 * @func !lyrics
 *
 * @desc Get the lyrics from a song
 */

const lf = require('lyrics-fetcher');
const moment = require('moment');

const separator = '|';
const settings = require('../../settings.json');
const { getGuildCommandPrefix } = require('../../handlers/GuildSettings');

exports.help = {
  name: 'lyrics',
  description: 'Get the lyrics from a song',
  usage: 'lyrics artist | songTitle',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
};

exports.run = (bot, message, args) => {
  const prefix = getGuildCommandPrefix(bot, message);

  let artist;
  let song;
  args.splice(0, 1);
  let req = args.join(' ');
  req = req.split(separator);

  if (req[0]) {
    artist = req[0].trim();
  } else {
    return message.reply(`No lyrics for me to search. Please specify the artist and song title! (separate the two with a '${separator}') \`${prefix}lyrics artist ${separator} song\``);
  }

  if (req[1]) {
    song = req[1].trim();
  } else {
    return message.reply(`No song given! Please specify the song title. \`${prefix}lyrics artist | song\``);
  }

  const str = `**${artist} - ${song} Lyrics**\n\`\`\`\n`;

  lf.fetch(artist, song, (err, lyrics) => {
    if (err) {
      message.reply('*Woops!* Something went wrong...\n\nCouldn\'t find the artist/song 😦 (possibly due to the request having unsearchable symbols or characters)');
      console.log(err);
    } else {
      message.channel.send((lyrics.length + str.length > 1996) ? `${str + lyrics.substr(0, 1996 - str.length)}\n\`\`\`` : `${str + lyrics}\n\`\`\``);
      console.log(`[${moment().format(settings.timeFormat)}] ${message.author.username} requested lyrics for ${artist} - ${song}`);
    }
  });

  return 0;
};
