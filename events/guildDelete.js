// This event triggers whenever the Bot leaves guild (aka: server) or a guild gets deleted
// Ggis will remove the guild from the list of connected guilds, and edit StreamLink settings

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const rmdir = require('rimraf');
const conf = require('../settings');

let streamlink = require('../handlers/StreamLinkHandler');

module.exports = (guild) => {
  try {
    const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    const index = settings.guilds.indexOf(guild.id);

    /**
     * Update guilds in settings.json
     *
     * @deprecated
     *  Ideally, we should be getting rid of this data storage...
     *  It is essentially useless.
     */
    if (index > -1) {
      settings.guilds.splice(index, 1); // Remove guild from settings.json
      fs.writeFile('./settings.json', JSON.stringify(settings), (err) => {
        if (err) console.error(`[${moment().format(settings.timeFormat)}] ${err}`);
        console.log(chalk.bgCyan.black(`[${moment().format(settings.timeFormat)}] Wrote to settings.json OK! Left Guild "${guild.name}" (ID ${guild.id})`));
        streamlink.removeGuild(guild.client, guild); // Remove from streamLink.guilds
      });
    } else {
      console.log(chalk.bgRed.bold(`[${moment().format(settings.timeFormat)}] ERROR LEAVING GUILD: Somehow, guild not found`));
    }

    /**
     * Update squads folders to get rid of removed guild's squad folder
     *
     * @deprecated
     *  Ideally, it would be nice to have permanent storage of guilds that
     *  the bot leaves, so that if and when the bot rejoins the server in the future,
     *  it will still have all the guild data stored
     */
    rmdir(`./configs/squads/${guild.id}`, (err) => {
      if (err) {
        if (err.code !== 'ENOENT') throw err;
      } else {
        console.log(chalk.bgBlue.bold(`[${moment().format(settings.timeFormat)}] Successfully deleted the ${guild.name} guild's (#${guild.id}) Squad folder.`));
        fs.rmdir(`./config/squads/${guild.id}`, (fsErr) => {
          if (fsErr) {
            if (fsErr.code === 'ENOENT') {
              console.log(chalk.bgRed.bold(`[${moment().format(settings.timeFormat)}] Squad folder for guild #${guild.id} was not found`));
            } else throw fsErr;
          } else {
            console.log(chalk.bgCyan.black(`[${moment().format(settings.timeFormat)}] Removed squad folder for guild "${guild.name}" (ID ${guild.id}) OK!`));
          }
        });
      }
    });
  } catch (err) {
    console.log(chalk.bgRed.bold(`[${moment().format(conf.timeFormat)}] ${err}`));
  }
};

// Reload StreamLink handler
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
