// This event triggers whenever the Bot is added into a new guild (aka server)
// Ggis will add the guild to a list of connected guilds, and create necessary StreamLink settings

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const conf = require('../settings');
let streamlink = require('../handlers/StreamLinkHandler');

module.exports = (guild) => {
  try {
    const settings = JSON.parse(fs.readFileSync('./settings.json'), 'utf8');
    const index = settings.guilds.indexOf(guild.id);

    streamlink.addGuild(guild.client, guild);

    if (index === -1) {
      settings.guilds.push(guild.id);
      fs.writeFile('./settings.json', JSON.stringify(settings), (err) => {
        if (err) console.error(`[${moment().format(conf.timeFormat)}] ${err}`);
        else console.log(chalk.bgCyan.black(`[${moment().format(conf.timeFormat)}] Wrote to settings.json OK! Joined Guild "${guild.name}" (ID ${guild.id})`));
      });
    }
  } catch (err) {
    console.log(chalk.bgRed.bold(`[${moment().format(conf.timeFormat)}] ${err}`));
  }
};

module.exports.reloadHandler = () =>
  new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve('../handlers/StreamLinkHandler')];
      streamlink = require('../handlers/StreamLinkHandler');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
