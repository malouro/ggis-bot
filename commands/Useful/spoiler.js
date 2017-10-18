// =====================================================================================
//                              ! spoiler command
// =====================================================================================
// Hide/tag a message with a spoiler

const fs              = require('fs');
const moment          = require('moment-timezone')
const settings        = require('../../settings.json');
var   SpoilerHandler  = require('../../util/spoilerHandler');
const SPOIL_SEPERATOR = /::/;
const MAX_LINES       = 8;

exports.run = (bot, message, args) => {
    try {
        message.delete().then(message => {
            let topic;
            let content;

            args.splice(0, 1);
            message.content = args.join(' ');

            if (message.content.match(SPOIL_SEPERATOR)) {
                args = message.content.split(SPOIL_SEPERATOR);
                topic = args[0].trim();
                content = args[1].trim();
            } else {
                topic = '';
                content = message.content.trim();
            }

            let spoiler = { message: message, topic: topic, content: content };
            let originalMessage = message;

            let GifGen = new SpoilerHandler;
            let messageContent = `<@${spoiler.message.author.id}>: **${spoiler.topic}** spoiler`;
            GifGen.createSpoilerGif(spoiler, MAX_LINES, filePath => {
                this.sendSpoiler(bot, spoiler.message.channel.id, filePath, 'spoiler.gif', messageContent, () => {
                    fs.unlink(filePath, (err) => err ? console.error(`Could not remove GIF: ${err}`) : null);
                    console.log(`[${moment().format('h:mm:ssA MM/DD/YY')}] ${message.author.username} issued a spoiler w/ topic: "${topic = '' ? 'General spoiler' : `${topic}`}"`);
                });
            });
        }).catch(err => {
            message.reply('Woops, something went wrong. Be careful to delete your spoiler command!');            
            console.log(err);
        });
    } catch (err) {
        message.delete()
            .then(message.reply('Something went wrong! I\'ve deleted your `spoiler` command attempt to prevent any further accidents.'))
            .catch(err => console.log(err));
        console.log(chalk.bgRed.bold(`[${moment().format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
}

exports.sendSpoiler = (bot, channelId, filePath, fileName, content, done) => {
    let channel = bot.channels.get(channelId);
    let options = {
        files: [{
            attachment: filePath,
            name: fileName,
        }],
    };
    channel.send(content, options)
        .then(() => done())
        .catch(error => console.log(`Error sending file: ${error}`));
};

exports.reloadHandler = () => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`../../util/spoilerHandler`)];
            spoilerHandler = require(`../../util/spoilerHandler`);
            resolve();
        }
        catch (err) {
            reject(err);
        }
    });
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: ["spoil"],
    permLevel: 0
};

exports.help = {
    name: 'spoiler',
    description: `Tag your message with a spoiler`,
    usage: `spoiler [spoilerTopic ::] (spoiler message goes here, shh)\n\nThe spoiler topic is completely optional, but if included it must be at the beginning of the message and followed up by '${SPOIL_SEPERATOR.source.toString()}' (and don't include the '[ ]'s either!)` +
    `\n\nWarning ::\nAs of now, the spoiler gifs don't work too great on mobile, due to the sheer nature of how gifs on Discord's mobile app work in general. Unfortuantely, there's not much of a work around for this, so just take caution when using Discord on mobile.`+
    `\n\nCredit ::\n${settings.botnameproper}'s ${settings.prefix}spoiler command uses the GifGenerator method from Tim K's (https://github.com/TimboKZ) discord-spoiler-bot repository. Thanks Tim! :)`
};