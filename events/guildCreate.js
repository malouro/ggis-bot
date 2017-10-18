// This event triggers whenever the Bot is added into a new guild (aka server)
// Ggis will add the guild to a list of connected guilds, and create necessary StreamLink settings

const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment-timezone');

module.exports = guild => {
    // Create & update settings
    try {
        var settings        = JSON.parse(fs.readFileSync('./settings.json'), 'utf8');
        var settingsSL      = JSON.parse(fs.readFileSync('./config/streamlink.json'),'utf8');
        var settingsSLMG    = JSON.parse(fs.readFileSync('./config/streamlink_multiguild.json'), 'utf8');
        let index           = settings.guilds.indexOf(guild.id);
        if (index === -1) {
            // Array of false values for new guild's users_enable[]
            let tmpArray = [];
            for (i=0; i < settingsSL.topics.length; i++) {
                tmpArray.push(false);
            }

            // Add guild to lists!
            settings.guilds.push(guild.id);            
            settingsSLMG.guilds.push({id:guild.id, guild_enable:true, users_enable:tmpArray, ban_list: []});
            guild.client.streamLink.get("settings").guilds.push(guild.id);
            guild.client.streamLink.set(guild.id, {
                id: guild.id,
                isGuild: true,
                guildEnable: true,
                usersEnable: tmpArray
            });
            fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                if (err) console.error(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`);
                else console.log(chalk.bgCyan.black('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + `] Wrote to settings.json OK! Joined Guild "${guild.name}" (ID ${guild.id})`));
            });
            fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsSLMG), (err) => {
                if (err) console.error(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`);
                else console.log(chalk.bgCyan.black('[' + moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + `] Wrote to streamlink_multiguild.json OK! Joined Guild "${guild.name}" (ID ${guild.id})`));
            });
        } else {
            console.log(chalk.bgRed.black('ERROR JOINING GUILD: SOMEHOW, GUILD WAS ALREADY ON THE LIST!'));
        }
    } catch (err) {
        console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
    
    // Send welcome message to main text channel!
    try {
        var ch = guild.channels.entries().next().value;
        guild.channels.get(ch[0]).send(`Sup ${guild.name}, I'm ${guild.client.user}. The new neighborhood Discord bot. Check out **${settings.prefix}help** or **${settings.prefix}ggis** to see what commands I've got.`);
    } catch (err) {
        console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
};