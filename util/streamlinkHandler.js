// Handles all StreamLink and TwitchPS events & functions

const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');
const main = require('../bot');
const moment = require('moment-timezone');

module.exports = {
  // --------------------------------------------------------
  //                  TwitchPS Events
  // --------------------------------------------------------
  /* * *
  TwitchPS 'stream-up' Event (when a stream goes live) >>
  * * */
  streamUp: function (bot, data) {
    // JSON configs to read from:
    var settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
    var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));
    var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));

    // Initial vars:
    var name = data.channel_name;
    var time = data.time;
    var index = settingsSL.topics.indexOf(name);
    var uid = settingsSL.userIDs[index];
    var sl = bot.streamLink.get(uid);
    var difference = Number(time) - Number(sl.lastBroadcast);
    var embed;

    // Get game:
    bot.fetchUser(uid).then(u => {
      if (u.presence.game !== null) {
        sl.game, settingsSL.stream_game[index] = u.presence.game.name;
      } else {
        sl.game, settingsSL.stream_game[index] = '';
      }
    }).catch(err => console.log(err));

    // Update Client object and json config files
    sl.status = true;
    sl.lastBroadcast = time;
    settingsSL.stream_status[index] = true;
    settingsSL.last_broadcast[index] = time;
    fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
      if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
    });
    bot.streamLink.set(uid, sl);

    console.log('----------------------------------');
    console.log(chalk.bgMagenta.bold('StreamLink >> STREAM-UP EVENT'));
    console.log('Channel: ' + name + ' has gone live!');
    console.log('Time: ' + time + '(' + moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + ')');
    console.log('----------------------------------');

    var botSL = bot.streamLink.get("settings");
    // Push a notification? -->
    if (difference > botSL.defaultTimer * 60) {
      let tmp; let tmpindex;
      for (var i = 0; i < botSL.channels.length; i++) {
        settingsSLMG.guilds.forEach((g, index) => {
          if (g.id === botSL.guilds[i]) tmpindex = index;
        })
        if (bot.streamLink.has(settingsSLMG.guilds[tmpindex].id)) {
          tmp = bot.streamLink.get(settingsSLMG.guilds[tmpindex].id);
          if (tmp.guildEnable && tmp.usersEnable[index] && bot.guilds.get(botSL.guilds[tmpindex]).members.has(uid)) {
            try {
              let g = bot.guilds.get(botSL.guilds[i]);
              let ch = g.channels.get(botSL.channels[i]);
              let u = g.members.get(uid).user;
              embed = new Discord.RichEmbed()
                .setTitle("StreamLink update:")
                .setDescription("<@" + uid + "> has gone live on Twitch!")
                .setColor(0x5a4194)
                .setThumbnail(u.avatarURL);
              if (u.presence.game !== null) embed.addField("Link:", `${u.username} is now live & streaming **${u.presence.game.name}**! Check it out here:`);
              else embed.addField("Link:", `${u.username}'s stream is now live! Check it out here:`);
              ch.send({
                embed
              });
              ch.send("https://www.twitch.tv/" + name);
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    }
  },

  /* * *
  TwitchPS 'stream-down' Event (when a stream goes down) >>
  * * */
  streamDown: function (bot, data) {
    // JSON configs to read from
    var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));

    // Vars
    var name = data.channel_name;
    var time = data.time;
    var index = settingsSL.topics.indexOf(name);

    // Update  & json config files
    var sl = bot.streamLink.get(settingsSL.userIDs[index]);
    sl.status = false;
    sl.viewerCount = 0;
    sl.game = '';
    settingsSL.stream_status[index] = false;
    fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
      if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
    });
    bot.streamLink.set(settingsSL.userIDs[index], sl);

    // Log to console -->
    console.log('----------------------------------');
    console.log(chalk.bgMagenta.black('StreamLink >> STREAM-DOWN EVENT'));
    console.log('Channel: ' + name + ' has gone down.');
    console.log('Time: ' + time + ' (' + moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + ')');
    console.log('----------------------------------');
  },

  /* * *
  TwitchPS 'viewcount' Event  (viewer count updates) >>
  * * */
  viewCount: function (bot, data) {
    // JSON configs
    var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));

    // Vars
    var name = data.channel_name;
    var index = settingsSL.topics.indexOf(name);
    var game = "";
    var sl = bot.streamLink.get(settingsSL.userIDs[index]);

    // Update
    sl.viewerCount = data.viewers;
    bot.fetchUser(sl.id).then(u => {
      if (u.presence.game !== null) {
        game = u.presence.game.name;
      }
      if (game !== settingsSL.stream_game[index]) {
        sl.game = game;
        settingsSL.stream_game[index] = game;
        fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
          if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
        });
      }
    }).catch(err => console.log(err));
    bot.streamLink.set(settingsSL.userIDs[index], sl);
  },

  // --------------------------------------------------------
  //                  StreamLink Functions
  // --------------------------------------------------------
  /* * *
  !streamlink add [stream] (@user)
  * * */
  addStream: function (message, bot, stream, user) {
    try {
      // JSON configs
      var settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
      var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));
      var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));

      // Build user and get correct user ID
      var u;
      var exists;
      if (user && message.guild.members.has(user.id)) {
        u = user;
      } else if (user) {
        message.reply("Error: User not recognized!\n\nThe specified Discord user doesn't seem to exist (or at least not on this server) [This error will be reported to @Sigg]");
        console.log(chalk.bgRed.black('[' + moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + '] ' + message.author.username + ' failed to add a StreamLink connection. UserID#' + id + ' was not found.'));
        return;
      } else {
        u = message.author;
      }

      // Check for possible inconsistency?
      if (typeof u !== 'undefined') {
        var exists = bot.streamLink.has(u.id);
      } else {
        console.log(chalk.bgRed.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ERROR: User object is undefined in streamlink.addStream : ${u}`));
        return;
      }

      // Check if user already has a StreamLink
      if (exists) {
        message.reply(`The specified Discord user <@${u.id}> is already connected to StreamLink under the Twitch channel <https://www.twitch.tv/${bot.streamLink.get(u.id).twitchChannel}` +
          `>. If you're just trying to change the Twitch channel linked to your StreamLink, then simply use **!streamlink remove**, followed by **!streamlink add *twitchChannel*** to correct your info.` +
          `\n\nContact an admin if you need help setting up your StreamLink. (or contact <@${settings.masterID}> directly)`);
        console.log(chalk.bgRed.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} tried, and failed, to add a StreamLink connection for user w/ UserID# ${u.id} - User already existed in StreamLink!`));
        return;
      } else {
        /* * *
        First handle embedded vars in Client object -->
        * * */
        var sl = bot.streamLink.get('settings');
        sl.users.push(u.id);
        sl.userNames.push(u.username);
        sl.twitchChannels.push(stream.toLowerCase());
        bot.streamLink.set(u.id, {
          isUser: true,
          userName: u.username,
          twitchChannel: stream.toLowerCase(),
          status: false,
          lastBroadcast: 0,
          game: '',
          viewerCount: NaN
        });
        settingsSLMG.guilds.forEach((guild, index) => {
          var g = bot.streamLink.get(guild.id);
          if (message.guild.id === guild.id) g.usersEnable.push(true);
          else g.usersEnable.push(false);
          bot.streamLink.set(guild.id, g);
        });

        /* * *
        Then handle JSON configs -->
        * * */
        settingsSL.topics.push(stream.toLowerCase());
        settingsSL.userNames.push(u.username);
        settingsSL.userIDs.push(u.id);
        settingsSL.last_broadcast.push(0);
        settingsSL.stream_status.push(false);
        settingsSL.stream_game.push("");
        settingsSLMG.guilds.forEach(g => {
          if (g.id === message.guild.id) g.users_enable.push(true);
          else g.users_enable.push(false);
        });

        // Add Twitch topic back in bot.js
        main.addTwitchTopic(stream);

        // Write JSON configs:
        fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
          if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
        });
        fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsSLMG), (err) => {
          if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
        });

        // Notify & log
        message.reply(`StreamLink connection added for <@${u.id}> at <https://www.twitch.tv/${stream.toLowerCase()}>`);
        console.log(chalk.bgMagenta(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} added a StreamLink connection!\nUser: ${u.username}\nID: ${u.id}\nTwitch: https://www.twitch.tv/${stream.toLowerCase()}`));
      }
    } catch (err) {
      console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] Error adding stream to StreamLink!\n${err}`));
    }
  },

  /* * *
  !streamlink add channel
  * * */
  addChannel: function (message, bot, channel) {
    try {
      // JSON configs
      var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));

      // Get channel object
      var ch;
      if (channel) {
        ch = channel; // if a channel is specified then we will use it
      } else {
        ch = message.channel; // otherwise get the channel that the message came from
      }

      // Add the channel
      // Check if channel already exists in settings
      if (bot.streamLink.get("settings").channels.indexOf(ch.id) > -1) {
        message.reply(`Channel #${ch.name} is already included in this server's list of StreamLink notification channels.`);
      } else {
        // If not, let's add it in!
        var sl = bot.streamLink.get("settings");
        sl.guilds.push(message.guild.id);
        sl.channels.push(ch.id);
        settingsSL.guilds.push(message.guild.id);
        settingsSL.channels.push(ch.id);
        bot.streamLink.set("settings", sl);
        fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
          if (err) console.error(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${err}`);
          else {
            message.reply(`Channel #${ch.name} has been added to this server's list of StreamLink notification channels.`);
            console.log(chalk.bgBlue(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] User ${message.author.username} added channel ${ch.name} (id#${message.channel.id}) to the StreamLink notification list.`));
          }
        });
      }
    } catch (err) {
      console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] Error adding guild channel to StreamLink!\n${err}`));
    }
  },

  /* * *
  !streamlink remove (@user)
  * * */
  removeStream: function (message, bot, user) {
    try {
      // JSON configs
      var settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
      var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));
      var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));

      // Build user and get correct user ID
      var u, index, sl, slUser;
      var noMessage = false;
      if (typeof user !== 'undefined' && typeof message === 'undefined') {
        noMessage = true;
        u = user;
      } else if (typeof user !== 'undefined' && message.guild.members.has(user.id)) {
        u = user;
      } else if (typeof user !== 'undefined') {
        message.reply("The specified Discord user doesn't seem to exist (or at least not on this server).");
        console.log(chalk.bgRed.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} failed to add a StreamLink connection. UserID#${user.id} was not found.`));
        return;
      } else if (typeof message !== 'undefined') {
        u = message.author;
      } else {
        console.log(chalk.bgRed.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] `));
        return;
      }

      // Check for possible inconsistency?
      if (typeof u !== 'undefined') {
        index = settingsSL.userIDs.indexOf(u.id);
        slUser = bot.streamLink.get(u.id);
      } else {
        console.log(chalk.bgRed.black('[' + moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + '] ERROR: user object is undefined.'));
        return;
      }

      //!streamlink remove @user --> if user ID exists in list
      if (index > -1) {
        /* * *
        First handle embedded vars in Client object -->
        * * */
        let stream = slUser.twitchChannel;
        sl = bot.streamLink.get("settings");

        /* * *
        Then handle JSON configs -->
        * * */
        sl.users.splice(index, 1);
        sl.userNames.splice(index, 1);
        sl.twitchChannels.splice(index, 1);
        settingsSL.topics.splice(index, 1);
        settingsSL.userNames.splice(index, 1);
        settingsSL.userIDs.splice(index, 1);
        settingsSL.stream_status.splice(index, 1);
        settingsSL.stream_game.splice(index, 1);
        settingsSL.last_broadcast.splice(index, 1);
        settingsSLMG.guilds.forEach(g => {
          g.users_enable.splice(index, 1);
        });
        bot.streamLink.delete(u.id);
        bot.streamLink.set("settings", sl)

        // Remove Twitch topic back in bot.js
        main.removeTwitchTopic(stream);

        // Write JSON configs:
        fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
          if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
        });
        fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsSLMG), (err) => {
          if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
        });

        // Notify & log
        if (!noMessage) {
          message.reply("StreamLink connection removed for <@" + u.id + ">, who was linked to <https://www.twitch.tv/" + stream + ">");
          console.log(chalk.bgMagenta(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} removed a StreamLink connection!\nUser: ${u.username}\nID: ${u.id}\nTwitch: https://www.twitch.tv/${stream.toLowerCase()}`));
        } else {
          console.log(chalk.bgMagenta(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] User ${user.username} has left a server. StreamLink removed:\nID: ${user.id}\nTwitch: https://www.twitch.tv/${stream.toLowerCase()}`));
        }
      } else {
        if (!noMessage) {
          message.reply("Doesn't seem like you have a StreamLink connection set up... Try using **!streamlink add** or check **!streamlink help** for more info.");
          console.log(chalk.bgRed.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} failed to remove StreamLink connection. UserID#${u.id} not found.`));
        } else {
          console.log(chalk.bgRed.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${user.username} has left a server, and failed to remove StreamLink connection. UserID#${u.id} not found.`));
        }
      }
    } catch (err) {
      console.log(chalk.bgRed.bold('[' + moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + '] ' + err));
    }
  },

  /* * *
  !streamlink remove channel
  * * */
  removeChannel: function (message, bot, channel) {
    try {
      // JSON configs
      var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));

      // Get channel object
      var ch;
      if (channel) { // if a channel is specified then we will use it
        ch = channel;
      } else {
        ch = message.channel; // otherwise get the channel that the message came from
      }

      // Remove the channel
      // Check if channel already exists in settings
      var index = bot.streamLink.get("settings").channels.indexOf(ch.id);
      if (index === -1) {
        message.reply(`Channel #${ch.name} is *not* in the list of StreamLink notification channels for this server.`);
        console.log(chalk.bgBlue.black(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] User ${message.author.username} attempted to remove channel ${message.channel.name} (id#${ch.id}) from the StreamLink notification list. (but it wasn't on the list!)`));
      } else {
        // If yes, let's remove it!
        var sl = bot.streamLink.get("settings");
        sl.guilds.splice(index, 1);
        sl.channels.splice(index, 1);
        settingsSL.guilds.splice(index, 1);
        settingsSL.channels.splice(index, 1);
        bot.streamLink.set("settings", sl);
        fs.writeFile("./config/streamlink.json", JSON.stringify(settingsSL), (err) => {
          if (err) console.log(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${err}`);
          else {
            message.reply(`Channel #${ch.name} has been removed from this server's list of StreamLink notification channels.`);
            console.log(chalk.bgBlue(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] User ${message.author.username} removed channel ${ch.name} (id#${message.channel.id}) from the StreamLink notification list.`));
          }
        });
      }
    } catch (err) {
      console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] Error removing guild channel to StreamLink!\n${err}`));
    }
  },

  /* * *
  !streamlink enable
  * * */
  enable: function (message, bot, user) {
    try {
      // JSON configs
      var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));
      var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));

      // Get user object
      var uid;
      if (typeof user !== 'undefined') uid = user.id;
      else uid = message.author.id;

      // Find user in StreamLink settings
      var index = settingsSL.userIDs.indexOf(uid);
      if (index > -1) {
        // Somehow, user doesn't exist? Throw an error
        if (typeof message.guild.members.get(uid) == 'undefined') {
          message.reply(`ERROR: This user seems to be from another server.`);
          console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} tried to enable user #${uid}'s StreamLink`));
          return;
        } else {
          // Enable user's StreamLink in Client object and JSON config
          bot.streamLink.get(message.guild.id).usersEnable[index] = true;
          settingsSLMG.guilds.forEach(g => {
            if (g.id === message.guild.id) g.users_enable[index] = true;
          });
          fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsSLMG), (err) => {
            if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
            else {
              message.reply(`The StreamLink connection for user **${message.guild.members.get(uid).user.username}** has been enabled on this server.`);
              console.log(chalk.bgMagenta(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has enabled ${message.guild.members.get(uid).user.username}'s StreamLink for server ${message.guild.name} (id: ${message.guild.id})`));
            }
          });
        }
      } else {
        message.reply("This user doesn't have a StreamLink connection set up. Have you set one up with **!streamlink add** yet? Read the **help** menu by using command **!streamlink help** to learn more.");
      }
    } catch (err) {
      console.log(chalk.bgRed.bold('[' + moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + ']' + 'Error enabling StreamLink! ' + err));
    }
  },

  /* * *
  !streamlink globalEnable
  * * */
  globalEnable: function (message, bot) {
    try {
      var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));
      bot.streamLink.get(message.guild.id).guildEnable = true;
      settingsSLMG.guilds.forEach(g => {
        if (g.id === message.guild.id) g.guild_enable = true;
      });
      fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsSLMG), (err) => {
        if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
        else {
          message.reply(`StreamLink has been enabled for the **${message.guild.name}** server.`);
          console.log(chalk.bgMagenta(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has enabled StreamLink for server ${message.guild.name} (id: ${message.guild.id})`));
        }
      });
    } catch (error) {
      console.log(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${error}`);
    }
  },

  /* * *
  !streamilnk disable
  * * */
  disable: function (message, bot, user) {
    try {
      // JSON configs
      var settingsSL = JSON.parse(fs.readFileSync("./config/streamlink.json", "utf8"));
      var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));

      // Get user object
      var uid;
      if (typeof user !== 'undefined') uid = user.id;
      else uid = message.author.id;

      // Find user in StreamLink settings
      var index = settingsSL.userIDs.indexOf(uid);
      if (index > -1) {
        // Somehow, user doesn't exist? Throw an error
        if (typeof message.guild.members.get(uid) === 'undefined') {
          message.reply(`ERROR: This user seems to be from another server.`);
          console.log(chalk.bgRed(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} tried to enable user #${uid}'s StreamLink`));
        } else {
          // Disable user's StreamLink in Client object and JSON config
          bot.streamLink.get(message.guild.id).usersEnable[index] = false;
          settingsSLMG.guilds.forEach(g => {
            if (g.id === message.guild.id) g.users_enable[index] = false;
          });
          fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsSLMG), (err) => {
            if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
            else {
              message.reply(`The StreamLink connection for user ${message.guild.members.get(uid).user.username} has been disabled on this server.`);
              console.log(chalk.bgMagenta(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has disabled ${message.guild.members.get(uid).user.username}'s StreamLink for server ${message.guild.name} (id: ${message.guild.id})`));
            }
          });
        }
      } else {
        message.reply("This user doesn't have a StreamLink connection set up. Have you set one up with **!streamlink add** yet? Read the **help** menu by using command **!streamlink help** to learn more.");
      }
    } catch (err) {
      console.log(chalk.bgRed.bold(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] Error disabling StreamLink! ${err}`));
    }
  },

  /* * *
  !streamlink globalDisable
  * * */
  globalDisable: function (message, bot) {
    try {
      var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));
      bot.streamLink.get(message.guild.id).guildEnable = false;
      settingsSLMG.guilds.forEach(g => {
        if (g.id === message.guild.id) g.guild_enable = false;
      });
      fs.writeFile("./config/streamlink_multiguild.json", JSON.stringify(settingsSLMG), (err) => {
        if (err) console.error(moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY') + err);
        else {
          message.reply(`StreamLink is now disabled for the **${message.guild.name}** server.`);
          console.log(chalk.bgMagenta(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${message.author.username} has disabled StreamLink for server ${message.guild.name} (id: ${message.guild.id})`));
        }
      });
    } catch (err) {
      console.log(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${err}`);
    }
  },

  /* * *
  !streamlink status
  * * */
  status: function (message, bot) {
    try {
      // JSON configs
      var settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
      var settingsSLMG = JSON.parse(fs.readFileSync("./config/streamlink_multiguild.json", "utf8"));

      // Get guild ID
      var gid = message.guild.id;
      var g = bot.guilds.get(gid);
      var gindex;
      var channelsInServer = [];

      // Get # streamers & streams live
      let amountLive = 0;
      let amountOfStreamers = 0;
      bot.streamLink.get("settings").users.forEach((u, index) => {
        if (g.members.has(u)) {
          amountOfStreamers++;
          if (bot.streamLink.get(u).status) amountLive++;
        }
      });

      // Find guild & get StreamLink channels in it
      if (settings.guilds.indexOf(gid) === -1) {
        console.log(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ERROR: Guild wasn't found for !streamlink status`);
        return;
      }
      gindex = settings.guilds.indexOf(gid);
      bot.streamLink.get("settings").channels.forEach((c, index) => {
        if (bot.streamLink.get("settings").guilds[index] === gid) {
          channelsInServer.push(message.guild.channels.get(c).name);
        }
      });

      // Is StreamLink globally enabled?
      var sl_status;
      var str;
      var str2;
      if (bot.streamLink.get(settingsSLMG.guilds[gindex].id).guildEnable) sl_status = `\`StreamLink is ON\` Currently enabled on this server.`;
      else sl_status = `\`StreamLink is OFF\` Enable StreamLink on this server with *${settings.prefix}streamlink enable server*`;

      // Shows how many users are StreamLink connected and currently live
      if (amountOfStreamers === 0) str = `There are **no users** connected with StreamLink on this server.`;
      else if (amountLive === 0) str = `There are **${amountOfStreamers} user(s)** connected with StreamLink on this server; but no streams are currently live.`;
      else if (amountLive === 1) str = `There are **${amountOfStreamers} user(s)** connected with StreamLink on this server; **one stream is live**!`;
      else str = `There are **${amountOfStreamers} users** connected with StreamLink on this server and **${amountLive} streams are live**!`;

      // Shows how many channels on the server are set up for StreamLink notifications
      if (channelsInServer.length === 0) str2 = `**Notification channels**: \`NO CHANNELS SET UP!\`\n(please use *${settings.prefix}streamlink add channel* to add a channel for StreamLink notifications to be sent)`;
      else str2 = `**Notification channels**:\n${channelsInServer.map(c => `\`#${c}\``).join(', ')}`;

      // Build embeds >>
      let embed = new Discord.RichEmbed()
        .setTitle("__StreamLink Live Status:__")
        .setDescription(sl_status + '\n\n' + str + '\n\n' + str2)
        .setThumbnail('http://i.imgur.com/DZqF1Ro.png')
        .setColor(0x5a4194);
      message.channel.send({ embed })

      // Initialize vars
      let i, j; let appendMsg = ['']; let count = 0; let page = 0;
      let tempArray = [];
      bot.streamLink.get("settings").userNames.forEach(e => {
        tempArray.push(e);
      });

      // Sort users alphabetically
      tempArray.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      if (tempArray.length === 0) { // No users to show status of
        appendMsg[page] = `\`No users connected!\`\nUse **${settings.prefix}streamlink add *twitchName*** to connect your Twitch account w/ StreamLink`;
      } else { // There are users to show! -->
        appendMsg[page] = `\`Users connected:\`\n\n`;
        // Get info for each user
        for (j = 0; j < tempArray.length; j++) {
          let username = tempArray[j];
          i = bot.streamLink.get("settings").userNames.indexOf(username);
          // If user is on the server in question, fetch their info and push into string to send -->
          if (g.members.has(bot.streamLink.get("settings").users[i])) {
            // Declare vars
            let live; let viewers; let game;
            let user = g.members.get(bot.streamLink.get("settings").users[i]);
            let slUser = bot.streamLink.get(user.id);

            // Live string
            if (slUser.status && settingsSLMG.guilds[gindex].users_enable[i]) live = 'LIVE';
            else if (settingsSLMG.guilds[gindex].users_enable[i]) live = 'OFFLINE';
            else live = 'DISABLED';

            // Viewer count string
            if (typeof slUser.viewerCount === NaN) viewers = '???';
            else viewers = slUser.viewerCount;
            if (slUser.game !== "") game = `Streaming: ${slUser.game}`;
            else game = `Streaming: ???`;

            // Add to embed-->
            if (slUser.status && settingsSLMG.guilds[gindex].users_enable[i]) {
              appendMsg[page] = appendMsg[page] + `**${username}**\n<https://www.twitch.tv/${slUser.twitchChannel}> \`Status: ${live} with ${viewers} viewer(s)\` \`${game}\`\n`;
            } else if (settingsSLMG.guilds[gindex].users_enable[i]) {
              appendMsg[page] = appendMsg[page] + `**${username}**\n<https://www.twitch.tv/${slUser.twitchChannel}> \`Status: ${live}\`\n`;
            } else {
              appendMsg[page] = appendMsg[page] + `**${username}**\n~~<https://www.twitch.tv/${slUser.twitchChannel}>~~ \`Status: ${live}\`\n`;
            }
            count++;
            if (count >= settings.streamlink.split_value) {
              page++;
              count = 0;
              appendMsg.push('');
            }
          } else { // Otherwise, continue w/ for loop
            continue;
          }
        }
        appendMsg.forEach(m => {
          if (m.length > 0) message.channel.send(m);
        });
      }
    } catch (err) {
      console.log(`[${moment().tz("America/New_York").format('hh:mm:ssA MM/DD/YY')}] ${err}`);
    }
  }
};