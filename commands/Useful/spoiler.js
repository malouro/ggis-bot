/**
 * @func !spoiler
 *
 * @desc Creates a spoiler message
 *  - Deletes the user's original message
 */

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const settings = require('../../settings.json');

const { separator } = settings.spoiler;

let SpoilerHandler = require('../../handlers/SpoilerHandler');

exports.help = {
  name: 'spoiler',
  description: 'Tag your message with a spoiler',
  usage: `spoiler spoilerTopic ${separator} (spoiler message goes here, shhh)\n\nThe spoiler topic is completely optional, but if included it must be at the beginning of the message and followed up by '${separator}' (and don't include the '[ ]'s either!)` +
    '\n\nWarning ::\nAs of now, the spoiler gifs don\'t work too great on mobile, due to the sheer nature of how gifs on Discord\'s mobile app work in general. Unfortunately, there\'s not much of a work around for this, so just take caution when using Discord on mobile.' +
    `\n\nCredit ::\n${settings.botNameProper}'s ${settings.prefix}spoiler command uses the GifGenerator method from Tim K's (https://github.com/TimboKZ) discord-spoiler-bot repository. Thanks Tim! :)`,
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['spoil'],
  permLevel: 0,
  maxLines: 8,
};

const sendSpoiler = (bot, channelId, filePath, fileName, content, done) => {
  const channel = bot.channels.get(channelId);
  const options = {
    files: [{
      attachment: filePath,
      name: fileName,
    }],
  };
  channel.send(content, options)
    .then(() => done())
    .catch(error => console.log(`Error sending file: ${error}`));
};

exports.run = (bot, message, args) => {
  /**
   * Since !spoiler commands are particularly sensitive,
   * this is enclosed with a try-catch block to ensure that no
   * spoilers get accidentally leaked if something goes awry.
   */
  try {
    message.delete().then((msg) => {
      let topic;
      let content;

      args.splice(0, 1);
      msg.content = args.join(' ');

      if (msg.content.toString().includes(separator)) {
        args = msg.content.toString().split(separator, 2);
        topic = args[0].trim();
        content = args[1].trim();
      } else {
        topic = '';
        content = msg.content.toString().trim();
      }

      const spoiler = { message: msg, topic, content };

      const GifGen = new SpoilerHandler();
      const messageContent = `<@${spoiler.message.author.id}>: **${topic === '' ? '' : `${topic} `}spoiler**:`;
      GifGen.createSpoilerGif(spoiler, this.conf.maxLines, (filePath) => {
        sendSpoiler(bot, spoiler.message.channel.id, filePath, 'spoiler.gif', messageContent, () => {
          fs.unlink(filePath, err => (err ? console.error(`Could not remove GIF: ${err}`) : null));
          console.log(`[${moment().format(settings.timeFormat)}] ${msg.author.username} issued a spoiler w/ topic: "${topic === '' ? '<general spoiler>' : topic}"`);
        });
      });
    }).catch((err) => {
      message.reply('Oops, something went wrong. Be careful to delete your `spoiler` command attempt if it didn\'t get deleted already.');
      console.log(err);
    });
  } catch (err) {
    message.delete()
      .then(message.reply('Oops, something went wrong. I\'ve deleted your `spoiler` command attempt to prevent accidentally spoiling anything.'))
      .catch((errOnDel) => {
        message.reply('Oops, something went wrong. Be careful to delete your `spoiler` command attempt!');
        console.log(errOnDel);
      });
    console.log(chalk.bgRed.bold(`[${moment().format(settings.timeFormat)}] Error in spoiler command\n${err}`));
  }
};

exports.reloadHandler = () => new Promise((resolve, reject) => {
  try {
    delete require.cache[require.resolve('../../handlers/SpoilerHandler')];
    SpoilerHandler = require('../../handlers/SpoilerHandler');
    resolve();
  } catch (err) {
    reject(err);
  }
});
