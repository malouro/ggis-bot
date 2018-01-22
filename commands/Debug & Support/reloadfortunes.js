/**
 * @func !reloadfortunes
 *
 * @desc Reloads fortune images from the fortunes Imgur album
 */

const chalk = require('chalk');
const fs = require('fs');
const i2rss = require('imgur2rss');
const moment = require('moment');
const conf = require('../../settings.json');

exports.help = {
  name: 'reloadfortunes',
  description: `Reload fortune images from Imgur album (currently, there are ${conf.fortune.amount} fortunes)`,
  usage: 'reloadfortunes',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['rf'],
  permLevel: 4,
};

/* eslint-disable */

const getImgs = (str, node, attr) => {
  const regex = new RegExp(`<${node} ${attr}="(.*?)" alt="`, 'gi');
  const res = [];
  let result;
  while ((result = regex.exec(str)) !== null) {
    res.push(result[1]);
  }
  return res;
};

exports.run = (bot, message) => {
  let images;
  const obj = { fortunes: [] };
  const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
  const clientID = settings.fortune.token;

  message.channel.send('Reloading fortunes...').then((m) => {
    i2rss.album2rss(clientID, conf.fortune.album, (err, data) => {
      /**
       *  @todo Research what errors can be thrown by i2rss?
       */
      if (err) return m.edit(`Fortunes reload failed:\n\`\`\`${err}\`\`\``).then().catch(console.error());
      images = getImgs(data, 'img', 'src');
      images.forEach((img) => {
        obj.fortunes.push(img);
      });

      // Update fortune amount in config file, and for the commands help menu
      if (images.length !== settings.fortune.amount) {
        settings.fortune.amount = images.length;
        fs.writeFile('./settings.json', JSON.stringify(settings), (fsErr) => {
          if (fsErr) throw fsErr;
          bot.reloadCommands(bot, 'fortune')
            .then(console.log(chalk.bgHex('#ffcc52').black(`[${moment().format(settings.timeFormat)}] Fortunes reloaded & settings.json updated with new fortune amount!`)))
            .catch(console.error());
        });
      }

      // URLs are thrown into fortunes.json file & saved
      fs.writeFile('./config/fortunes.json', JSON.stringify(obj), 'utf8', (fsErr) => {
        if (fsErr) throw fsErr;
        m.edit('Successfully reloaded the fortunes gallery!')
          .then(m.delete(1500)
            .then(() => {
              message.delete(1500);
              console.log(chalk.bgHex('#ffcc52').black(`[${moment().format(settings.timeFormat)}] Fortunes reloaded!`));
            }).catch(console.error()))
          .catch(console.error());
      });
    });
  }).catch(err => console.log(chalk.bgRed(`[${moment().format(settings.timeFormat)}] ${err}\n${err.stack}`)));
};
