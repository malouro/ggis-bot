// This event triggers whenever the Bot is added into a new guild (aka server)
// Ggis will add the guild to a list of connected guilds, and create necessary StreamLink settings

const chalk      = require('chalk');
const fs         = require('fs');
const moment     = require('moment');
var   streamlink = require('../util/streamlinkHandler');

module.exports = guild => {

    streamlink.addGuild(guild);
    
    try {
        var settings = JSON.parse(fs.readFileSync('./settings.json'), 'utf8');
        let index    = settings.guilds.indexOf(guild.id);

        if (index === -1) {
            settings.guilds.push(guild.id);
            fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                if (err) console.error(`[${moment().format('hh:mm:ssA MM/DD/YY')}] ${err}`);
                else console.log(chalk.bgCyan.black(`[${moment().format('hh:mm:ssA MM/DD/YY')}] Wrote to settings.json OK! Joined Guild "${guild.name}" (ID ${guild.id})`));
            });
        }

        // Welcome message! -- Disabled for now, no true way to get a default channel means that even this workaround isn't perfect, either
        // ... also, a welcome message is not even necessary now that Ggis shows some info in the status message

        /*
        var ch = guild.channels.entries().next().value;
        guild.channels.get(ch[0]).send(`Sup **${guild.name}**, I'm ${guild.client.user}. The new neighborhood Discord bot. Check out \`${settings.prefix}${settings.botname}\` or @ping me to see what commands & features I've got.`);
        */

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