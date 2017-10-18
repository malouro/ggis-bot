// =====================================================================================
//                             ! keynpeele command
// =====================================================================================
// Returns a random Key & Peele YouTube video

const fs = require('fs');
const settings = JSON.parse(fs.readFileSync("./vids/keynpeele.json", "utf8"));

exports.run = (bot, message, args) => {
    let update = JSON.parse(fs.readFileSync("./vids/keynpeele.json", "utf8"));
    let rng = Math.floor(Math.random() * update.videos.length);
    message.reply(`https://www.youtube.com/watch?v=${update.videos[rng]}`);

    // Update w/ new videos
    if (update.videos.length !== settings.videos.length) {
        bot.commandsReload('keynpeele');
    }
}

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  aliases: ['knp'],
  permLevel: 0
};

exports.help = {
  name: 'keynpeele',
  description: `Play a random Key & Peele video. (Currently, there are ${settings.videos.length} videos stored)`,
  usage: 'keynpeele'
};