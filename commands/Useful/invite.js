// =====================================================================================
//                                ! invite command
// =====================================================================================
// Give invite link

/*
NEED TO FIX !!! 
*/

const moment = require('moment-timezone');
const chalk = require('chalk');
const settings = require('../../settings.json');
const url = "<https://discordapp.com/oauth2/authorize?client_id=321818035193118722&scope=bot&permissions=523762774>";

exports.run = (bot, message, args) => {
    try {
        message.channel.send(`If you wish to invite <@${bot.user.id}> to your Discord server, use the link below and choose a server from the dropdown list. You must have the **Manage Server** permission on the server in order for it to show up on the list, and for the invite to work.\n\nYou may add or remove permissions as you please, but keep in mind that it might break current or future features.\n\n${url}`);
        console.log(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] User ${message.author.username} asked for an invite link`);
    } catch (err) {
        console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY')}] ${err}`));
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'invite',
    description: `Posts invite link to invite ${settings.botnameproper} to your server`,
    usage: 'invite'
};