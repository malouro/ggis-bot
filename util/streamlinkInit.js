/**
 * Initialize StreamLink elements -->
 * 
 *  @param {Discord.Client} bot
 *      @property {} bot.streamLink => {
 *          bot.streamLink contains all updated information (in realtime) about StreamLink connections and channel status
 *          bot.streamLink.conf contains general config and info
 *          @property {Object} conf => {
 *              @property {Boolean} reconnect Is reconnect enabled for the initial topics set in TwitchPS call?
 *              @property {Boolean} debug Is debug enabled for the initial topics set in TwitchPS call?
 *              @property {Object} defaults { Default values for certain things when elements are created
 *                  @property {Boolean} userEnable
 *                  @property {Boolean} guildEnable
 *                  @property {Integer} timer
 *                  @property {Integer} splitValue
 *              }
 *          },
 * 
 *          @property {Collection} users (Snowflake, Object) => {
 *              Here, every user that is StreamLinked will be listed in a Map that uses
 *              their Discord ID Snowflake as the keys.
 *              @var {Object} DiscordUserID => {
 *                  @property {Snowflake} id: Discord User ID
 *                  @property {String} name: Discord User Name
 *                  @property {Boolean} isUser: (always true for users) [Deprecated]
 *                  @property {Boolean} enabled: Is the user enabled?
 *                  @property {String} stream: Twitch.tv channel name
 *                  @property {Boolean} status: Is the stream online or offline?
 *                  @property {String} game: The game currently being streamed, if available (otherwise, blank string)
 *                  @property {Integer} viewers: Number of current viewers
 *                  @property {Date} lastBroadcast: Last time stream went up
 *                  @property {Date} lastOffline: Last time stream went down
 *              }
 *          }
 * 
 *          @property {Collection} guilds (Snowflake, Object) => {
 *              Every guild that the bot is connected to will show up here
 *              @var {Object} DiscordGuildID => {
 *                  @property {Snowflake} id: Discord Guild ID
 *                  @property {Boolean} isGuild: (always true for guilds) [Deprecated]
 *                  @property {Boolean} enabled: Is StreamLink enabled on this server?
 *                  @property {Array [Snowflake]} channels: Text-channels to push notifications to
 *                  @property {Array [Snowflake]} usersEnabled: List of user IDs that have enabled StreamLink here
 *                  @property {Array [Snowflake]} banList: List of user IDs of users that are StreamLink banned
 *                  @property {Integer} timer: Timer threshold for notifications to be pushed
 *                  @property {String} style: The style for the StreamLink notifications on this server
 *                      { can be "standard", "compact", "minimal", or "noembed" }
 *              }
 *          }
 *      }
 *
 */

/***************************************************
 * @todo List of things to add!
 * 
 *  - Update Documentation?
 * 
 ***************************************************/

const chalk = require('chalk');
const Discord = require('discord.js');
const fs = require('fs');

const main = require('../bot');

module.exports = bot => {
    let users = new Discord.Collection();
    let guilds = new Discord.Collection();
    const path = './config/streamlink';
    let slConf = JSON.parse(fs.readFileSync(`${path}/conf.json`,'utf8'));

    console.log(chalk.bgMagenta.bold(`StreamLink connections:`));
    fs.readdir(`${path}/users`, 'utf8', (err, files) => {
        files.forEach(f => {
            let conf = JSON.parse(fs.readFileSync(`${path}/users/${f}`,'utf8'));
            users.set(conf.id, conf);
            main.addTwitchTopic(conf.stream);
            console.log(chalk.bgMagenta(`User: ${conf.name} => Stream: https://www.twitch.tv/${conf.stream}`));            
        });
    });
    fs.readdir(`${path}/guilds`, 'utf8', (err, files) => {
        files.forEach(f => {
            let conf = JSON.parse(fs.readFileSync(`${path}/guilds/${f}`,'utf8'));
            guilds.set(conf.id, conf);
            console.log(chalk.bgMagenta.black(`Guild: ${conf.id} => Enabled?: ${conf.enabled}, Users: ${conf.usersEnabled}`));
        });
    });

    bot.streamLink.conf = slConf;
    bot.streamLink.users = users;
    bot.streamLink.guilds = guilds;
};