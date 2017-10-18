// =====================================================================================
//                                  ! rules command
// =====================================================================================
// General bot configuration.
// Changes most settings, especially the message 'moderating' settings, and
// the more fun AutoReaction settings

/**
 * !rules smoon 
 * --> "No Sailor Moon" rule that filters & deletes message containing "Sailor Moon" expression.
 * !rules autoreact (at)
 * --> AutoReaction emojis: Ggis will react with emojis when people or phrases are mentioned
 * --
 */

const fs = require('fs');
const moment = require('moment-timezone');
const settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

const BOT_NAME_PROPER = settings.botnameproper;
const MASTER_ID = settings.masterID;

exports.run = (bot, message, args) => {
    switch (args[1]) {
        //NO SAILOR MOON RULE
        //!rules smoon
        case "smoon":
            //!rules smoon enable
            if (args[2] == 'enable') {
                message.reply('"NoSailorMoon" rule enabled.');
                settings.rules.sailormoon = true;
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                });
            }
            //!rules smoon disable
            else if (args[2] == 'disable') {
                message.reply('"NoSailorMoon" rule disabled.');
                settings.rules.sailormoon = false;
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                });
            }
            //!rules smoon help
            else if (args[2] == 'help') {
                message.channel.send({
                    embed: {
                        hexColor: "#4cff22",
                        title: `${settings.prefix}` + "rules smoon help:",
                        description: "How to use:\n\n**!" + "rules smoon** *[options]*\n\nThe NoSailorMoon rule purges any incoming text that mentions " +
                        "\"sailor moon\" or any variation of the name, " +
                        "but only in a specific \"NoSailorMoon\" text-channel (that is, a text channel with that name).\n\n__Available *[options]* :__",
                        fields: [
                        {name: "enable", value: "Enables the NoSailorMoon rule."},
                        {name: "disable",value: "Disables the NoSailorMoon rule."},
                        {name: "help",value: "Shows the menu you're looking at right now. ;)"}
                        ]
                    }
                });
            }
            //!rules smoon COMMAND_NOT_FOUND
            else {
                message.channel.send({
                    embed: {
                        hexColor: "#ff2222",
                        title: "Error: Command not recognized.",
                        description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **!" + "rules smoon** are listed below:__",
                        fields: [{
                            name: `${settings.prefix}` + "rules smoon enable",
                            value: "Enables protection against weeb-ass magical girls in the NoSailorMoon text channel."
                        },
                        {
                            name: `${settings.prefix}` + "rules smoon disable",
                            value: "Disable protection against Sailor Moon shenanigans."
                        },
                        {
                            name: `${settings.prefix}` + "rules smoon help",
                            value: "Access **help** menu for the \"" + settings.prefix + "rules smoon\" command."
                        }
                        ]
                    }
                });
            }
            break;
        // AUTO REACTIONS
        //!rules autoreact
        case "autoreact":
            //!rules autoreact enable
            if (args[2] == 'enable') {
                message.reply("AutoReactions enabled.");
                settings.rules.autoreact.enable = true;
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                });
            }
            //!rules autoreact disable
            else if (args[2] == 'disable') {
                message.reply("AutoReactions disabled.");
                settings.rules.autoreact.enable = false;
                fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                    if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                });
            }
            //!rules autoreact at
            else if (args[2] == 'at' || args[2] == 'atmention' || args[2] == 'atmentions') {
                //!rules autoreact at enable
                if (args[3] == 'enable') {
                    message.reply("AutoReactions for @mentions enabled.");
                    settings.rules.autoreact.atmentions = true;
                    fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                        if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                    });
                }
                //!rules autoreact at disable
                else if (args[3] == 'disable') {
                    message.reply("AutoReactions for @mentions disabled.");
                    settings.rules.autoreact.atmentions = false;
                    fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                        if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                    });
                }
                //!rules autoreact at help
                else if (args[3] == 'help') {
                    message.channel.send({
                        embed: {
                            hexColor: "#4cff22",
                            title: `${settings.prefix}` + "rules autoreact at help:",
                            description: "How to use:\n\n**!" + "rules autoreact at** *[options]*\n\nAutoReact is the automated attachment of an emoji reaction to certain messages." +
                            "The **at** portion refers to 'at mentions', or '@mentions'. (Basically, when you mention/tag someone with the @ symbol." +
                            "\n\n__Available *[options]* :__",
                            fields: [{
                                name: "enable]",
                                value: "Enables auto reactions to @mentions."
                            },
                            {
                                name: "disable",
                                value: "Disables auto reactions to @mentions."
                            },
                            {
                                name: "help",
                                value: "Shows the menu you're looking at right now. ;)"
                            },
                            {
                                name: "__**Issues?**__",
                                value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face in using AutoReact (or anything " + BOT_NAME_PROPER + "-bot related)."
                            }
                            ]
                        }
                    });
                }
                //!rules autoreact at COMMAND_NOT_FOUND
                else {
                    message.channel.send({
                        embed: {
                            hexColor: "#ff2222",
                            title: "Error: Command not recognized.",
                            description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **" + settings.prefix + "rules" +
                            " autoreact at** are listed below:__",
                            fields: [{
                                name: `${settings.prefix}` + "rules autoreact at enable",
                                value: "Enables auto reactions to @mentions."
                            },
                            {
                                name: `${settings.prefix}` + "rules autoreact at disable",
                                value: "Disables auto reactions to @mentions."
                            },
                            {
                                name: `${settings.prefix}` + "rules autoreact at help",
                                value: "Access **help** menu for the \"" + settings.prefix + "rules autoreact at\" command."
                            },
                            {
                                name: "__**Issues?**__",
                                value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face in using AutoReact (or anything " + BOT_NAME_PROPER + "-bot related).",
                            }
                            ]
                        }
                    });
                }
            }
            //!rules autoreact text
            else if (args[2] == 'text' || args[2] == 'txt' || args[2] == 'txtmention' || args[2] == 'txtmentions' || args[2] == 'textmention' || args[2] == 'textmentions') {
                //!rules autoreact text enable
                if (args[3] == 'enable') {
                    message.reply("AutoReactions for text enabled.");
                    settings.rules.autoreact.txtmentions = true;
                    fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                        if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                    });
                }
                //!rules autoreact text disable
                else if (args[3] == 'disable') {
                    message.reply("AutoReactions for text disabled.");
                    settings.rules.autoreact.txtmentions = false;
                    fs.writeFile("./settings.json", JSON.stringify(settings), (err) => {
                        if (err) console.error(moment().tz("America/New_York").format('h:mm:ssA MM/DD/YY') + err);
                    });
                }
                //!rules autoreact text help
                else if (args[3] == 'help') {
                    message.channel.send({
                        embed: {
                            hexColor: "#4cff22",
                            title: `${settings.prefix}` + "rules autoreact text help:",
                            description: "How to use:\n\n**!" + "rules autoreact text** *[options]*\n\nAutoReact is the automated attachment of an emoji reaction to certain messages. " +
                            "The **text** feature of AutoReact will make " + "rules react to certain messages, depending on the text in the message. " +
                            "This feature is designed to react minimally, and not where every other message will trigger the AutoReact.\n\n" +
                            "Some examples include reactions for: all-caps messages, message with nothing but question marks, and some other stuff." +
                            "\n\n__Available *[options]* :__",
                            fields: [{
                                name: "enable",
                                value: "Enables emoji reactions to certain text."
                            },
                            {
                                name: "disable",
                                value: "Disables emoji reactions to certain text."
                            },
                            {
                                name: "help",
                                value: "Shows the menu you're looking at right now. ;)"
                            },
                            {
                                name: "__**Issues?**__",
                                value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face in using AutoReact (or anything " + BOT_NAME_PROPER + "-bot related).",
                            }
                            ]
                        }
                    });
                }
                //!rules autoreact text COMMAND_NOT_FOUND
                else {
                    message.channel.send({
                        embed: {
                            hexColor: "#ff2222",
                            title: "Error: Command not recognized.",
                            description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **" + settings.prefix + "rules" +
                            " autoreact text** are listed below:__",
                            fields: [{
                                name: `${settings.prefix}` + "rules autoreact text enable",
                                value: "Enables emoji reactions to certain text."
                            },
                            {
                                name: `${settings.prefix}` + "rules autoreact text disable",
                                value: "Disables emoji reactions to certain text."
                            },
                            {
                                name: `${settings.prefix}` + "rules autoreact text help",
                                value: "Access **help** menu for the \"" + settings.prefix + "rules autoreact text\" command."
                            },
                            {
                                name: "__**Issues?**__",
                                value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face in using AutoReact (or anything " + BOT_NAME_PROPER + "-bot related).",
                            }
                            ]
                        }
                    });
                }
            }
            //!rules autoreact help
            else if (args[2] == 'help') {
                message.channel.send({
                    embed: {
                        hexColor: "#4cff22",
                        title: `${settings.prefix}` + "rules autoreact help:",
                        description: "How to use:\n\n**!" + "rules autoreact** *[options]*\n\nAutoReact is the automated attachment of an emoji reaction to certain messages. " +
                        "" + "rules will react to messages depending on whether certain users are mentioned, or certains phrases are detected within the message. " +
                        "Any of the AutoReact features can be disabled or controlled via command." +
                        "\n\n__Available *[options]* :__",
                        fields: [{
                            name: "at *[enable/disable/help]*",
                            value: "Refers to settings involving @mentions and if AutoReact will react to them."
                        },
                        {
                            name: "text *[enable/disable/help]*",
                            value: "Refers to settings involving certain detected phrases in messages and if AutoReact will react to them."
                        },
                        {
                            name: "help",
                            value: "Shows the menu you're looking at right now. ;)"
                        },
                        {
                            name: "__**Issues?**__",
                            value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face in using AutoReact (or anything " + BOT_NAME_PROPER + "-bot related).",
                        }
                        ]
                    }
                });
            }
            //!rules autoreact COMMAND_NOT_FOUND
            else {
                message.channel.send({
                    embed: {
                        hexColor: "#ff2222",
                        title: "Error: Command not recognized.",
                        description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **!" + "rules autoreact** are listed below:__",
                        fields: [{
                            name: `${settings.prefix}` + "rules autoreact enable",
                            value: "Enables all of the curerntly active automated emoji reactions."
                        },
                        {
                            name: `${settings.prefix}` + "rules autoreact disable",
                            value: "Disables all automated emoji reactions."
                        },
                        {
                            name: `${settings.prefix}` + "rules autoreact help",
                            value: "Access **help** menu for the \"" + settings.prefix + "rules autoreact\" command."
                        },
                        {
                            name: "__**Issues?**__",
                            value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face in using AutoReact (or anything " + BOT_NAME_PROPER + "-bot related).",
                        }
                        ]
                    }
                });
            }
            break;
        //!rules help
        case "help":
            message.channel.send({
                embed: {
                    hexColor: "#4cff22",
                    title: `${settings.prefix}` + "rules help:",
                    description: `${BOT_NAME_PROPER} has special rules within the Christian Mingle server, that trigger upon @mentions of certain users, or with certain text. They can be enabled/disabled at any time` +
                    ` by the owner of the server, or by <@${settings.masterID}>.`+
                    "\n\n__Available commands & rules:__",
                    fields: [{
                        name: `${settings.prefix}` + "rules autoreact *[enable/disable/help]*",
                        value: "Refers to settings involving @mentions and if AutoReact will react to them."
                    },
                    {
                        name: `${settings.prefix}` + "rules smoon *[enable/disable/help]*",
                        value: "The NoSailorMoon chat filter."
                    },
                    {
                        name: `${settings.prefix}` + "rules help",
                        value: "Shows the menu you're looking at right now. ;)"
                    },
                    {
                        name: "__**Issues?**__",
                        value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face with anything " + BOT_NAME_PROPER + "-bot related.",
                    }
                    ]
                }
            });
            break;

        //!rules COMMAND_NOT_FOUND
        default:
            message.channel.send({
                embed: {
                    hexColor: "#ff2222",
                    title: "Error: Command not recognized.",
                    description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **!" + "rules** are listed below:__",
                    fields: [{
                        name: `${settings.prefix}` + "rules autoreact *[at/text]* *[enable/disable/help]*",
                        value: "AutoReact feature options. Check \"" + settings.prefix + "rules autoreact help\" for more info."
                    },
                    {
                        name: `${settings.prefix}` + "rules smoon *[enable/disable/help]*",
                        value: "NoSailorMoon filter feature & options. Check \"" + settings.prefix + "rules smoon help\" for more info."
                    },
                    {
                        name: `${settings.prefix}` + "rules help",
                        value: "Access **help** menu for \"" + settings.prefix + "rules\" commands."
                    },
                    {
                        name: "__**Issues?**__",
                        value: "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face in using StreamLink (or anything " + BOT_NAME_PROPER + "-bot related).",
                    }
                    ]
                }
            });
            break;
    }
};

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: true,
    aliases: [`${settings.botname}rules`],
    permLevel: 3
};

exports.help = {
    name: 'rules',
    description: `Set up and configure ${BOT_NAME_PROPER}-bot settings and rules (in the main server only)`,
    usage: `rules <category> [option]\n<category> can be (smoon/autoreact/help)\n[option] depends on the category in question (use the option "help" for more info on the category) (ie: ${settings.prefix}rules autoreact help)`
};