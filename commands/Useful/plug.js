// =====================================================================================
//                              ! plug command
// =====================================================================================
// Gives link to main Plug.dj channel.

const fs = require('fs');
const moment = require('moment-timezone')
const settings = require("../../settings.json");

exports.run = (bot, message, args) => {
    // !plug NO_ARGS
    if (typeof args[1] == "undefined") {
        message.channel.send(`${settings.plugdj.main_url}`);
    }
    // !plug set
    else if (args[1] === "set") {
        if (!message.author.hasPermission("ADMINISTRATOR")) {
            message.reply("Sorry, but this command is **admin exclusive**. Either talk to a server administrator to help you out, or go cry in a corner. <:FeelsBadMan:230445576133541888>");
        } else if (typeof args[2] == "undefined") {
            message.reply(`In order to use **!plug set** you need to specify the URL after \"!plug set\"!`);
        } else {
            if (args[2].startsWith("https://")) {
                message.reply(`New Plug.dj link set to ${args[2]}`);
                settings.plugdj.main_url = args[2];
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                });
            } else if (args[2].startsWith("plug.dj/")) {
                let str = "https://";
                str = str.concat(args[2]);
                message.reply(`New Plug.dj link set to ${str}`);
                settings.plugdj.main_url = str;
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                });
            } else {
                let str = "https://plug.dj/";
                str = str.concat(args[2]);
                message.reply(`New Plug.dj link set to ${str}`);
                settings.plugdj.main_url = str;
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                });
            }
        }
    } else {
        message.channel.send({
            embed: {
                hexColor: "#ff2222",
                title: "Error: Command not recognized.",
                description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **!plug**__",
                fields: [{
                        name: "!plug",
                        value: "Posts a link to the server's main Plug.dj community."
                    },
                    {
                        name: "!plug set [url]",
                        value: "Changes the server's main Plug.dj community. __Admin-only.__"
                    },
                ]
            }
        });
    }
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    aliases: ["plugdj"],
    permLevel: 0
};

exports.help = {
    name: 'plug',
    description: `Links the server's main Plug.dj community`,
    usage: `plug (set) [url]\n\n${settings.prefix}plug :: Will link to the Plug.dj community\n${settings.prefix}plug set [url] :: Will change the default Plug.dj community to the given [url]`
};