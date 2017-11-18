// This event triggers whenever the Bot leaves guild (aka: server) or a guild gets deleted
// Ggis will remove the guild from the list of connected guilds, and edit StreamLink settings

const chalk      = require('chalk');
const fs         = require('fs');
const moment     = require('moment');
const rmdir      = require('rmdir');
var   streamlink = require('../util/streamlinkHandler');

module.exports = guild => {
    try {
        var settings     = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        let index        = settings.guilds.indexOf(guild.id);
        let flag, flagMG = false;

        // Update guilds in settings & StreamLink settings
        if (index > -1) {
            settings.guilds.splice(index, 1); // Remove guild from settings.json!
            fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                if (err) console.error(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${err}`);
                console.log(chalk.bgCyan.black(`[${moment().format('hh:mm:ssA MM/DD/YY')}] Wrote to settings.json OK! Left Guild "${guild.name}" (ID ${guild.id})`));
                streamlink.removeGuild(guild);
            });
            
        } else {
            console.log(chalk.bgRed.bold(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ERROR LEAVING GUILD: Somehow, guild not found`));
        }

        // Update squads folders
        rmdir(`./configs/squads/${guild.id}`, function (err){
            if (err) {
                if (err.code !== 'ENOENT') throw err;
            } else {
                console.log(chalk.bgBlue.bold(`[${moment().format('hh:mm:ssA MM/DD/YY')}] Successfully deleted the ${guild.name} guild's (#${guild.id}) Squad folder.`));
                fs.rmdir(`./config/squads/${guild.id}`, function (err) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            console.log(chalk.bgRed.bold(`[${moment().format('hh:mm:ssA MM/DD/YY')}] Squad folder for guild #${guild.id} was not found`));
                        } else throw err;
                    } else {
                        console.log(chalk.bgCyan.black(`[${moment().format('hh:mm:ssA MM/DD/YY')}] Removed squad folder for guild "${guild.name}" (ID ${guild.id}) OK!`));
                    }
                });
            }
        }); 
    } catch (err) {
        console.log(chalk.bgRed.bold(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${err}`));
    }
};

module.exports.reloadHandler = function () {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`../util/streamlinkHandler`)];
            streamlink = require(`../util/streamlinkHandler`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};