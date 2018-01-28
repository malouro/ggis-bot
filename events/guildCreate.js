// This event triggers whenever the Bot is added into a new guild (aka server)
// Ggis will add the guild to a list of connected guilds, and create necessary StreamLink settings

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const conf = require('../settings');
let streamlink = require('../handlers/StreamLinkHandler');

module.exports = (guild) => {
  try {
    streamlink.addGuild(guild.client, guild);
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
