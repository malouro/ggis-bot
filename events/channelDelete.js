// This event triggers whenever a channel in a guild is deleted
// Ggis will remove the channel from the StreamLink notification list

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment-timezone');

module.exports = channel => {
    var settingsSL = JSON.parse(fs.readFileSync('./config/streamlink.json'), 'utf8');
    var bot = channel.client;
    settingsSL.channels.forEach((c, index) => {
        // Remove channel from settings.json!
        if (c === channel.id) {
            settingsSL.channels.splice(index, 1);
            settingsSL.guilds.splice(index, 1);
            bot.streamLink("settings").channels.splice(index, 1);
            bot.streamLink("settings").guilds.splice(index, 1);
            // Write & notify
            fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
                if (err) console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
                else console.log(chalk.bgBlue(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] Wrote to streamlink.json OK! Deleted channel #${channel.name} from ${channel.guild.name} (id# ${channel.id})`));
            });
        }
    });
};