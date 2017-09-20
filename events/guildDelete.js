// This event triggers whenever the Bot leaves guild (aka server) or a guild gets deleted
// Ggis will remove the guild from the list of connected guilds, and edit StreamLink settings

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment-timezone');
const rmdir = require('rmdir');
const streamlink = require('../util/streamlinkHandler');

module.exports = guild => {
    try {
        // Update settings JSON configs
        var settings     = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
        var settingsSL   = JSON.parse(fs.readFileSync('./config/streamlink.json', 'utf8'));
        var settingsSLMG = JSON.parse(fs.readFileSync('./config/streamlink_multiguild.json', 'utf8'));
        let index        = settings.guilds.indexOf(guild.id);
        let flag, flagMG = false;
        if (index > -1) {
            // Remove guild from settings.json!
            settings.guilds.splice(index, 1);
            // Remove guild from streamlink.json!
            for (i = 0; i < settingsSL.channels.length; i++) {
                if (settingsSL.guilds[i] === guild.id) {
                    flag = true;
                    settingsSL.guilds.splice(i, 1);
                    settingsSL.channels.splice(i, 1);
                    guild.client.streamLink.get("settings").guilds.splice(i, 1);
                    guild.client.streamLink.get("settings").channels.splice(i, 1);
                }
            }
            settingsSLMG.guilds.forEach((g,index) => {
                if (g.id === guild.id) {
                    flagMG = true;
                    settingsSLMG.guilds.splice(index, 1);                    
                }
            });
            
            // Write & notify
            fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                if (err) console.error(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`);
                else console.log(chalk.bgCyan.black('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + `] Wrote to settings.json OK! Left Guild "${guild.name}" (ID ${guild.id})`));
            });
            if (flag) {
                fs.writeFile("./config/streamlink.json", JSON.stringify(settingsStreamLink), (err) => {
                    if (err) console.error(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`);
                    else console.log(chalk.bgCyan.black('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + `] Wrote to streamlink.json OK! Left Guild "${guild.name}" (ID ${guild.id})`));
                });
            }
            if (flagMG) {
                fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsStreamLinkMG), (err) => {
                    if (err) console.error(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`);
                    else console.log(chalk.bgCyan.black('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + `] Wrote to streamlink_multiguild.json OK! Left Guild "${guild.name}" (ID ${guild.id})`));
                });
            }
        } else {
            console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ERROR LEAVING GUILD: Somehow, guild not found`));
        }

        // Update squads folders
        rmdir(`./configs/squads/${guild.id}`, function (err){
            if (err) {
                if (err.code !== 'ENOENT') throw err;
            } else {
                console.log(chalk.bgBlue.bold(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] Successfully deleted the ${guild.name} guild's (#${guild.id}) Squad folder.`));
                fs.rmdir(`./config/squads/${guild.id}`, function (err) {
                    if (err) {
                        if (err.code === 'ENOENT') {
                            console.log(chalk.bgRed.bold('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + `] Squad folder for guild #${guild.id} was not found`));
                        } else throw err;
                    } else {
                        console.log(chalk.bgCyan.black('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + `] Removed squad folder for guild "${guild.name}" (ID ${guild.id}) OK!`));
                    }
                });
            }
        }); 

    } catch (err) {
        console.log(chalk.bgRed.bold('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + '] ' + err));
    }
};