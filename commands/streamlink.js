// =====================================================================================
//                               ! streamlink command
// =====================================================================================
/*************************************************************************************** 
StreamLink Settings & Configuration
    What it is:
        Links a Twitch.tv account to a Discord user, posts status of when they go live,
        etc.
    How it works:
        -- Uses 'TwitchPS' or (twitch pub subs) module with node.js
        -- Takes input from message and passes to the StreamLink handler w/ args to
          execute the necessary function and edit settings
    Command list:
        -- !streamlink enable (server/self/NULL)
        -- !streamlink disable (server/self/NULL)
        -- !streamlink add (twitchName/channel) (@user)
        -- !streamlink remove (@user)
        -- !streamlink status
        -- !streamlink help
    Other info:
        -- Initial topics {video-playback.channel}  ;Serves as a dummy topic, just for
           TwitchPS initialization.
        -- streamlink.json is for all StreamLink connections and info
        -- user enable/disable status is in streamlink_multiguild.json
        -- There's a dummy StreamLink set up (tied to the init_topic mentioned above) 
           that uses discord ID of "dontdeleteme" and user name "noname". As suggested, 
            it should NOT be deleted or altered.
***************************************************************************************/

const fs = require('fs');
var streamlink = require('../util/streamlinkHandler');
const settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
const BOT_NAME = settings.botname;
const BOT_NAME_PROPER = settings.botnameproper;
const MASTER_ID = settings.masterID;

exports.run = (bot, message, args) => {

    // Read JSON configs
    var settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

    //!streamlink enable
    if (args[1] === 'enable') {
        //!streamlink enable all
        if (args[2] === 'all' || args[2] === 'server' || args[2] === 'guild') {
            if (message.member.hasPermission("ADMINISTRATOR")) streamlink.globalEnable(message, message.client);
            else message.reply(`Sorry, but enabling StreamLink for the whole server is **admin exclusive**. Either talk to a server admin to help you out, or go cry in a corner. <:FeelsBadMan:230445576133541888>`);
        }
        //!streamlink enable (self)
        else if (typeof args[2] === 'undefined' || args[2] === 'self') {
            streamlink.enable(message, message.client);
        }
        //!streamlink enable help
        else if (args[2] === 'help') {
            message.channel.send(
                "`" + settings.prefix + "streamlink enable`\n" +
                `This command will enable a StreamLink connection. This means that the next time the StreamLink'd stream goes live on Twitch, ${BOT_NAME_PROPER} will push out notifications to the StreamLink-enabled Discord text-channels. Can also be used to enable StreamLink on the current server.\n\n\`` +
                settings.prefix + "streamlink enable [server/self/@user/help]` is the command format (choose one of the three [options]!)\n\n**Command Descriptions**\n`" +
                `${settings.prefix}streamlink enable server\`\nEnables StreamLink notifications for your Discord server. StreamLink notifications will now be pushed onto the server. __Admin-only.__\n\n\`` +
                `${settings.prefix}streamlink enable self\`\nEnables your own StreamLink connection, allowing ${BOT_NAME_PROPER} to notify the server when you go live. (This can be written as either "${settings.prefix}streamlink enable self" or "${settings.prefix}streamlink enable", with no extra argument)\n\n\`` +
                `${settings.prefix}streamlink enable @user\`\nEnables another user's StreamLink connection. __Admin-only.__\n(Though nothing will stop an admin from enabling/disabling someone's StreamLink, it should not be abused! Don't be a jerk.)\n\n\`` +
                settings.prefix + "streamlink enable help`\nShows the menu you're looking at right now. ;)\n\n" +
                "__**Issues?**__\nFeel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face with StreamLink or anything " + BOT_NAME_PROPER + "-bot related."
            );
        }
        //!streamlink enable [userID]
        else {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                message.reply(`Sorry, but enabling another user's StreamLink is **admin exclusive**. Either talk to a server admin to help you out, or go cry in a corner. <:FeelsBadMan:230445576133541888> (or, if you are trying to enable your own StreamLink, just use **${settings.prefix}streamlink enable**)`);
            }
            else if (message.mentions.users.size > 0) {
                streamlink.enable(message, message.client, message.mentions.users.first());
            } else {
                message.reply(`If you are trying to enable another user's StreamLink connection, you must @mention them at the end of the command. (or if you are trying to enable your own StreamLink, simply use **${settomgs.prefix}streamlink enable** with no extra arguments)`);
            }
        }
    }

    //!streamlink disable
    else if (args[1] === 'disable') {
        //!streamlink disable (all)
        if (args[2] === 'all' || args[2] === 'server' || args[2] === 'guild') {
            if (message.member.hasPermission("ADMINISTRATOR")) streamlink.globalDisable(message, message.client);
            else message.reply("Sorry, but disabling StreamLink for the whole server is **admin exclusive**. Either talk to a server admin to help you out, or go cry in a corner. <:FeelsBadMan:230445576133541888>");
        }
        //!streamlink disable (self)
        else if (typeof args[2] === 'undefined' || args[2] === 'self') {
            streamlink.disable(message, message.client);
        }
        //!streamlink disable help
        else if (args[2] === 'help') {
            message.channel.send(
                "`" + settings.prefix + "streamlink disable`\n" +
                `This command will disable a StreamLink connection. This means that ${BOT_NAME_PROPER} will *NOT* push out notifications to the server when you go live. This will only affect the server you use this command in. Can also be used to disable StreamLink entirely on the current server.\n\n\`` +
                settings.prefix + "streamlink disable [server/self/@user/help]` is the command format (choose one of the three [options]!)\n\n**Command Descriptions**\n`" +
                `${settings.prefix}streamlink disable server\`\nDisables StreamLink notifications for your Discord server. StreamLink notifications will no longer be pushed onto the server. __Admin-only.__\n\n\`` +
                `${settings.prefix}streamlink disable self\`\nDisables your own StreamLink connection. ${BOT_NAME_PROPER} will no longer notify the server when you go live. (This can be written as either "${settings.prefix}streamlink disable self" or "${settings.prefix}streamlink disable", with no extra arguments)\n\n\`` +
                `${settings.prefix}streamlink disable @user\`\nDisables another user's StreamLink connection. __Admin-only.__\n(Though nothing will stop an admin from enabling/disabling someone's StreamLink, it should not be abused! Don't be a jerk.)\n\n\`` +
                settings.prefix + "streamlink disable help`\nShows the menu you're looking at right now. ;)\n\n" +
                "__**Issues?**__\nFeel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face with StreamLink or anything " + BOT_NAME_PROPER + "-bot related."
            );
        }
        //!streamlink disable [userID]
        else {
            if (!message.member.hasPermission("ADMINISTRATOR")) {
                message.reply(`Sorry, but disabling another user's StreamLink is **admin exclusive**. Either talk to a server admin to help you out, or go cry in a corner. <:FeelsBadMan:230445576133541888> (or, if you are trying to disable your own StreamLink, just use **${settings.prefix}streamlink disable**)`);
            }
            else if (message.mentions.users.size > 0) {
                streamlink.disable(message, message.client, message.mentions.users.first());
            } else {
                message.reply(`If you are trying to disable another user's StreamLink connection, you must @mention them at the end of the command. (or if you are trying to disable your own StreamLink, simply use **${settomgs.prefix}streamlink disable** with no extra arguments)`);
            }
        }
    }

    //!streamlink add
    else if (args[1] == 'add') {
        // if at least one other argument is presented:
        if (typeof args[2] !== 'undefined') {
            //!streamlink add channel
            if (args[2] === 'channel') { // if using keyword "channel" for arg2 --> add current channel to channel list to notify
                streamlink.addChannel(message, message.client);
            }
            //!streamlink add help
            else if (args[2] === 'help') {
                message.channel.send(
                    "`" + settings.prefix + "streamlink add`\n" +
                    `This command will add a StreamLink connection. This will let ${BOT_NAME_PROPER} know what Twitch channel corresponds to your Discord account.\n\n\`` +
                    settings.prefix + "streamlink add twitchName (@user)` is the command format.\n\n" +
                    "**twitchName**\n*Required.* The Twitch.tv channel name to establish a connection to. This is the text used in the URL after <https://www.twitch.tv/>\n" +
                    "**(@user)**\nOptional, __admin-only__ option. Specifies Discord user to make StreamLink connection to. If this option isn't present, StreamLink will assume the User ID of the user that used the command. " +
                    "Basically, non-admins cannot alter StreamLink settings for users other than themselves.\n\n`" +
                    settings.prefix + "streamlink add channel`\nThis command will add the current text-channel into the list of channels to notify for StreamLink updates. __Admin-only.__\n\n`" +
                    settings.prefix + "streamlink add help`\nShows the menu you're looking at right now. ;)\n\n" +
                    "__**Issues?**__\nFeel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face with StreamLink or anything " + BOT_NAME_PROPER + "-bot related."
                );
            }
            else {
                if (typeof args[3] === 'undefined') streamlink.addStream(message, message.client, args[2]); // No user id given, pass only 2 args
                else { // Or pass all 3 args
                    if (message.member.hasPermission("ADMINISTRATOR")) { // But ONLY if an administrator
                        if (message.mentions.users.size > 0) streamlink.addStream(message, message.client, args[2], message.mentions.users.first());
                        else message.reply(`If you are trying to create a StreamLink connection for another user, you must @mention them at the end of the command. (or if you are trying to make your own StreamLink, simply use **${settomgs.prefix}streamlink add *twitchChannel*** with no extra arguments)`);
                    }
                    else message.reply(`Sorry, but this command is **admin exclusive**. For **${settings.prefix}streamlink add**, non-admins are only allowed to add their own StreamLink connection (by using **${settings.prefix}streamlink add [twitch_channel]**, with no user ID specified).`);
                }
            }
        }
        else {
            // no args2 (ie: no Twitch channel specified)
            message.channel.send("*If there are any issues or confusions, feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face with StreamLink or anything " + BOT_NAME_PROPER + "-bot related.*", {
                embed: {
                    hexColor: "#ff2222",
                    title: "Error: Command not recognized.",
                    description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **" + settings.prefix + "streamlink add** are listed below:__",
                    fields: [
                        {
                            name: settings.prefix + "streamlink add twitchName (@user)", value: "This command will add a StreamLink connection to the bot. The [twitch_channel] field is *not* optional, whereas the (@user) option *is*. " +
                                "If no Discord user is specified, the Twitch channel will be linked to **your** Discord ID (that is, the person issuing the **" + settings.prefix + "streamlink add** command.)"
                        },
                        { name: "twitchName", value: "Name of the twitch channel to link. This is the text used in the URL after https://www.twitch.tv/" },
                        { name: "(@user)", value: "The @mention of the user whose StreamLink you wish to create. Only for when adding a StreamLink for another user other than yourself. __Admin-only.__" },
                        { name: settings.prefix + "streamlink add channel", value: "Adds the current text-channel into the list of channels to notify when a StreamLink member's stream goes live. __Admin-only.__" },
                        { name: settings.prefix + "streamlink add help", value: "Access **help** menu for the \"" + settings.prefix + "streamlink add\" command." }
                    ]
                }
            });
        }
    }

    //!streamlink remove
    else if (args[1] == 'remove') {
        //!streamlink remove [discord_user_id]
        if (typeof args[2] !== 'undefined') {
            //!streamlink remove help
            if (args[2] == 'help') {
                message.channel.send(
                    `\`${settings.prefix}streamlink remove\`\n` +
                    "This command will remove any prior StreamLink connection you may have made. It will delete all information pertaining to your StreamLink setup.\n\n" +
                    "`" + settings.prefix + "streamlink remove (@user)` is the command format.\n\n" +
                    "**(@user)**\n" + "Optional, __admin-only__ option that specifies the Discord user to remove the StreamLink connection from. If this option isn't present, StreamLink will assume the User ID of the user that issued the command. " +
                    "Basically, non-admins cannot alter StreamLink settings for users other than themselves.\n\n" +
                    "`" + settings.prefix + "streamlink remove channel`\n" + "This command will remove the current text-channel from the list of channels to notify for StreamLink updates. __Admin-only.__\n\n" +
                    "`" + settings.prefix + "streamlink remove help`\n" + "Shows the menu you're looking at right now. ;)\n\n" +
                    "__**Issues?**__\n" + "Feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face with StreamLink or anything " + BOT_NAME_PROPER + "-bot related."
                );
            }
            // Check for admin, the rest of these commands are admin-only
            else if (!message.member.hasPermission("ADMINISTRATOR")) {
                message.reply("Sorry, but this command is **admin exclusive**. For **" + settings.prefix + "streamlink remove**, non-admins are only allowed to remove their own StreamLink connection (by using **" + settings.prefix + "streamlink remove** with no extra arguments).");
            }
            //!streamlink remove channel
            else if (args[2] == 'channel') {
                streamlink.removeChannel(message, message.client); // Remove channel
            }
            //!streamlink remove [discord_user_id]
            else {
                if (message.mentions.users.size > 0)
                    streamlink.removeStream(message, message.client, message.mentions.users.first()); // pass 2 args: message and userID
                else
                    message.reply(`If you are trying to remove another user's StreamLink connection, you must @mention them at the end of the command. (or if you are trying to remove your own StreamLink, simply use **${settomgs.prefix}streamlink remove** with no extra arguments)`);
            }
        }
        //!streamlink remove (no args)
        else {
            streamlink.removeStream(message, message.client); // pass only 1 arg: message
        }
    }

    //!streamlink help
    else if (args[1] == 'help') {
        message.channel.send(`\`${settings.prefix}streamlink help\`\n` +
            `StreamLink connects your Discord account to a Twitch.tv account and allows ${BOT_NAME_PROPER} to post a notification and link to your Twitch stream whenever you go live. It is not to be confused with Discord's integration with Twitch through User Settings > Connections; the two are mutually exclusive features.\n\n` +
            `**How to use**\n1. Add your StreamLink connection with "${settings.prefix}streamlink add *twitchChannel*"\n2. Though it should be enabled by default, you can enable your StreamLink with "${settings.prefix}streamlink enable" and disable with "${settings.prefix}streamlink disable"\n3. Add a channel on the server to send notifications to by using "${settings.prefix}streamlink add channel" in the chosen channel\n4. Check "${settings.prefix}streamlink status" to see if your information saved properly!\n\n` +
            `**Available commands**\n` +
            `\`${settings.prefix}streamlink add\`\nAdds a StreamLink connection, linking a Discord user to a Twitch.tv channel. You also need to add a Use command "${settings.prefix}streamlink add help" for more info.\n\n` +
            `\`${settings.prefix}streamlink remove\`\nRemoves a StreamLink connection that has already been established. Use command "${settings.prefix}streamlink remove help" for more info.\n\n` +
            `\`${settings.prefix}streamlink enable\`\nEnables a specific user's StreamLink, meaning that ${BOT_NAME_PROPER} will announce when your stream goes live. Can also be used to enable StreamLink on the whole server w/ "${settings.prefix}streamlink enable server". Use command "${settings.prefix}streamlink enable help" for more info.\n\n` +
            `\`${settings.prefix}streamlink disable\`\nDisables a specific user's StreamLink. ${BOT_NAME_PROPER} will no longer announce when your stream goes live. Doesn't remove the users info from StreamLink, merely disables it. Can also be used to disable StreamLink on the whole server w/ "${settings.prefix}streamlink disable server". Use command "${settings.prefix}streamlink disable help" for more info.\n\n` +
            `\`${settings.prefix}streamlink status\`\nShows current StreamLink connections & which stream(s) are live currently.\n\n` +
            `\`${settings.prefix}streamlink help\`\nThe menu you are looking at right now. ;)\n\n**Issues?**\nFeel free to contact <@${MASTER_ID}> for any questions, problems or concerns that you may face with StreamLink or anything ${BOT_NAME_PROPER}-bot related.`);
    }

    //!streamlink status
    else if (args[1] == 'status') {
        streamlink.status(message, message.client);
    }

    //!streamlink COMMAND_NOT_KNOWN
    else {
        message.channel.send("*If there are any issues or confusions, feel free to contact <@" + MASTER_ID + "> for any questions, problems or concerns that you may face with StreamLink or anything " + BOT_NAME_PROPER + "-bot related.*", {
            embed: {
                hexColor: "#ff2222",
                title: "Error: Command not recognized.",
                description: "Command ***" + message.toString() + "*** was not a proper command.\n\n__Proper example commands for **" + settings.prefix + "streamlink** are listed below:__",
                fields: [
                    { name: settings.prefix + "streamlink add", value: "Use command *" + settings.prefix + "streamlink add help* for more info." },
                    { name: settings.prefix + "streamlink remove", value: "Use command *" + settings.prefix + "streamlink remove help* for more info." },
                    { name: settings.prefix + "streamlink enable", value: "Use command *" + settings.prefix + "streamlink enable help* for more info." },
                    { name: settings.prefix + "streamlink disable", value: "Use command *" + settings.prefix + "streamlink disable help* for more info." },
                    { name: settings.prefix + "streamlink status", value: "Shows StreamLink connections & streams status." },
                    { name: settings.prefix + "streamlink help", value: "Shows the help menu for *" + settings.prefix + "streamlink*" }
                ]
            }
        });
    }
};

exports.reloadHandler = () => {
    return new Promise((resolve, reject) => {
		try {
			delete require.cache[require.resolve(`../util/streamlinkHandler`)];
			streamlink = require(`../util/streamlinkHandler`);
			resolve();
		} catch (err) {
			reject(err);
		}
	});
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: ['sl'],
    permLevel: 0
};

exports.help = {
    name: 'streamlink',
    description: `Set up and configure StreamLink connections (Twitch.tv notifications). *Use "${settings.prefix}streamlink help" for more info!*`,
    usage: `streamlink <option> [argument1] [argument2]\n<option> can be (enable/disable/add/remove/status/help)\n[argument1] & [argument2] depend on which <option> is being used. Refer to "${settings.prefix}streamlink help" for more information.`
};