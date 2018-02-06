/**
 * @func !streamlink
 *
 * @desc Sets up StreamLink connection to post whenever a user's Twitch stream goes live
 */

const settings = require('../../settings.json');

let streamlink = require('../../handlers/StreamLinkHandler');

const slFuncGC = require('../../events/guildCreate');
const slFuncGD = require('../../events/guildDelete');
const slFuncGMR = require('../../events/guildMemberRemove');
const slFuncCD = require('../../events/channelDelete');
const slFuncRdy = require('../../events/ready');

exports.help = {
  name: 'streamlink',
  description: `Set up automatic Twitch notifications for the server (use "${settings.prefix}streamlink help" for more info)`,
  usage: `streamlink <option>\n\n<option> needs to be given and can be (enable|disable|add|remove|status|help)\n\nRefer to "${settings.prefix}streamlink help" for more information.`,
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['sl'],
  permLevel: 0,
};

exports.run = (bot, message, args, perms) => {
  switch (args[1]) {
    /**
     * !sl enable
     */
    case 'enable':
      if (args[2] === 'server' || args[2] === 'guild') {
        if (perms >= 2) streamlink.enableGuild(message, bot);
        else message.reply('Sorry, but enabling StreamLink for the whole server is **admin exclusive**.');
      } else if (typeof args[2] === 'undefined' || args[2] === 'self') {
        streamlink.enableUser(message, bot, message.author);
      } else if (args[2] === 'help') {
        message.channel.send(`\`${settings.prefix}streamlink enable\`\n` +
          `This command will enable a StreamLink connection. This means that the next time the StreamLink'd stream goes live on Twitch, ${settings.botNameProper} will push out notifications to the StreamLink-enabled Discord text-channels. Can also be used to enable StreamLink on the current server.\n\n` +
          `\`${settings.prefix}streamlink enable [self/@user/server/help]\` is the command format (choose one of the three [options]!)\n\n**In-Depth Command Descriptions**\n` +
          `\`${settings.prefix}streamlink enable self\`\nEnables your own StreamLink connection, allowing ${settings.botNameProper} to notify the server when you go live. (This can be written as either "${settings.prefix}streamlink enable self" or "${settings.prefix}streamlink enable", with no extra argument)\n\n` +
          `\`${settings.prefix}streamlink enable @user\`\nEnables another user's StreamLink connection. __Admin-only.__\n(Though nothing will stop an admin from enabling/disabling someone's StreamLink, it should not be abused! Don't be a jerk.)\n\n` +
          `\`${settings.prefix}streamlink enable server\`\nEnables StreamLink notifications for your Discord server. StreamLink notifications will now be pushed onto the server. __Admin-only.__\n\n` +
          `\`${settings.prefix}streamlink enable help\`\nShows the menu you're looking at right now. ;)`;
      } else if (message.mentions.users.size > 0) {
        if (perms < 2) {
          message.reply(`Sorry, but enabling another user's StreamLink is **admin exclusive**.\n\nIf you are attempting to enable your own StreamLink, you can simply use \`${settings.prefix}streamlink enable self\` or just \`${settings.prefix}streamlink enable\``);
        } else {
          streamlink.enableUser(message, bot, message.mentions.users.first());
        }
      } else {
        message.reply(`If you are trying to enable another user's StreamLink connection, you must @mention them at the end of the command. (however, this is **admin exclusive)\n\nIf you are trying to enable your own StreamLink, you can simply use \`${settings.prefix}streamlink enable self\` or \`${settings.prefix}streamlink enable\``);
      }
      break;

    /**
     * !sl disable
     */
    case 'disable':
      if (args[2] === 'server' || args[2] === 'guild') {
        if (perms >= 2) streamlink.disableGuild(message, bot);
        else message.reply('Sorry, but enabling StreamLink for the whole server is **admin exclusive**.');
      } else if (typeof args[2] === 'undefined' || args[2] === 'self') {
        streamlink.disableUser(message, bot, message.author);
      } else if (args[2] === 'help') {
        message.channel.send(`\`${settings.prefix}streamlink disable\`\n` +
          `This command will disable a StreamLink connection. This means that ${settings.botNameProper} will *NOT* push out notifications to the server when you go live. This will only affect the server you use this command in. Can also be used to disable StreamLink entirely on the current server.\n\n\`` +
          `${settings.prefix}streamlink disable [self/@user/server/help]\` is the command format (choose one of the three [options]!)\n\n**In-Depth Command Descriptions**\n\`` +
          `${settings.prefix}streamlink disable self\`\nDisables your own StreamLink connection. ${settings.botNameProper} will no longer notify the server when you go live. (This can be written as either "${settings.prefix}streamlink disable self" or "${settings.prefix}streamlink disable", with no extra arguments)\n\n\`` +
          `${settings.prefix}streamlink disable @user\`\nDisables another user's StreamLink connection. __Admin-only.__\n(Though nothing will stop an admin from enabling/disabling someone's StreamLink, it should not be abused! Don't be a jerk.)\n\n\`` +
          `${settings.prefix}streamlink disable server\`\nDisables StreamLink notifications for your Discord server. StreamLink notifications will no longer be pushed onto the server. __Admin-only.__\n\n\`` +
          `${settings.prefix}streamlink disable help\`\nShows the menu you're looking at right now. ;)`;
      } else if (message.mentions.users.size > 0) {
        if (perms < 2) {
          message.reply(`Sorry, but enabling another user's StreamLink is **admin exclusive**.\n\nIf you are attempting to enable your own StreamLink, you can simply use \`${settings.prefix}streamlink enable self\` or \`${settings.prefix}streamlink enable\``);
        } else {
          streamlink.disableUser(message, bot, message.mentions.users.first());
        }
      } else {
        message.reply(`If you are trying to enable another user's StreamLink connection, you must @mention them at the end of the command. (however, this is **admin exclusive)\n\nIf you are trying to enable your own StreamLink, you can simply use \`${settings.prefix}streamlink enable self\` or \`${settings.prefix}streamlink enable\``);
      }
      break;

    /**
     * !sl add
     */
    case 'add':
    case 'set':
    case 'create':
    case 'connect':
    case 'setup':
      if (typeof args[2] !== 'undefined') {
        if (args[2] === 'channel') {
          streamlink.addChannel(message, bot, message.channel);
        } else if (args[2] === 'help') {
          message.channel.send(`\`${settings.prefix}streamlink add\`\n` +
            `This command will add a StreamLink connection. This will let ${settings.botNameProper} know what Twitch channel corresponds to your Discord account.\n\n\`` +
            `${settings.prefix}streamlink add twitchName (@user)\` is the command format.\n\n` +
            '**twitchName**\n*Required.* The Twitch.tv channel name to establish a connection to. This is the text used in the URL after <https://www.twitch.tv/THIS_PART_HERE>\n' +
            '**(@user)**\nOptional, __admin-only__ option. Specifies Discord user to make StreamLink connection to. If this option isn\'t present, StreamLink will assume the User ID of the user that used the command. ' +
            'Basically, non-admins cannot alter StreamLink settings for users other than themselves.\n\n`' +
            `${settings.prefix}streamlink add channel\`\nThis command will add the current text-channel into the list of channels to notify for StreamLink updates. __Admin-only.__\n\n\`` +
            `${settings.prefix}streamlink add help\`\nShows the menu you're looking at right now. ;)`;
        } else if (typeof args[3] === 'undefined') {
          streamlink.addUser(message, bot, args[2]);
        } else if (perms >= 2) {
          if (message.mentions.users.size > 0) {
            streamlink.addUser(message, bot, args[2], message.mentions.users.first());
          } else {
            message.reply(`If you are trying to create a StreamLink connection for another user, you must @mention them at the end of the command. (or if you are trying to make your own StreamLink, you can simply use \`${settings.prefix}streamlink add twitchName\` with no extra arguments or @mentions)`);
          }
        } else {
          message.reply(`Sorry, but this command is **admin exclusive**. For \`${settings.prefix}streamlink add\`, non-admins are only allowed to add their own StreamLink connection (by using \`${settings.prefix}streamlink add twitchName\`, with no user @mentions given).`);
        }
      } else {
        message.reply(`You must specify your Twitch.tv user name to use this command!\n\n\`${settings.prefix}streamlink add twitchName\` where \`twitchName\` is your Twitch.tv user name (ie: the end of the URL for your stream <https://www.twitch.tv/THIS_PART_HERE>)`);
      }
      break;

    /**
     * !sl remove
     */
    case 'remove':
    case 'delete':
    case 'disconnect':
      if (args[2] && args[2] !== 'self') {
        if (args[2] === 'channel') {
          streamlink.removeChannel(message, bot, message.channel);
        } else if (args[2] === 'help') {
          message.channel.send(`\`${settings.prefix}streamlink remove\`\n` +
            'This command will remove any prior StreamLink connection you may have made. It will delete all information pertaining to your StreamLink setup.\n\n`' +
            `${settings.prefix}streamlink remove (@user)\` is the command format.\n\n` +
            '**(@user)**\nOptional, __admin-only__ option. Discord user to remove the StreamLink connection from. If this option isn\'t present, StreamLink will assume the User ID of the user that issued the command. ' +
            'Basically, non-admins cannot alter StreamLink settings for users other than themselves.\n\n`' +
            `${settings.prefix}streamlink remove channel\`\nThis command will remove the current text-channel from the list of channels to notify for StreamLink updates. __Admin-only.__\n\n\`` +
            `${settings.prefix}streamlink remove help\`\nShows the menu you're looking at right now. ;)`;
        } else if (perms >= 2) {
          if (message.mentions.users.size > 0) {
            streamlink.removeUser(message, bot, message.mentions.users.first());
          } else {
            message.reply(`If you are trying to remove a StreamLink connection for another user, you must @mention them at the end of the command. (or if you are trying to remove your own StreamLink, you can simply use \`${settings.prefix}streamlink remove\` with no extra arguments or @mentions)`);
          }
        } else {
          message.reply(`Sorry, but this command is **admin exclusive**. For \`${settings.prefix}streamlink remove\`, non-admins are only allowed to remove their own StreamLink connection (by using \`${settings.prefix}streamlink remove\`, with no user @mentions given).`);
        }
      } else {
        streamlink.removeUser(message, bot);
      }
      break;

    /**
     * !sl status
     */
    case 'status':
    case 'list':
    case 'get':
      streamlink.statusMenu(message, bot);
      break;

    /**
     * !sl help
     */
    case 'help':
    case '?':
      message.channel.send(`\`${settings.prefix}streamlink help\`\n` +
        `StreamLink connects your Discord account to a Twitch.tv account and allows ${settings.botNameProper} to post a notification and link to your Twitch stream whenever you go live. It is *not* to be confused with Discord's integration with Twitch through User Settings > Connections; the two are mutually exclusive features.\n\n` +
        '**How to use**\n\n' +
        `:one: Add your StreamLink connection with \`${settings.prefix}streamlink add twitchChannel\`\n*ex:* If your stream is located at <http://www.twitch.tv/example>, then you would use \`${settings.prefix}streamlink add example\`\n\n` +
        `:two: Though it should be enabled by default, you can enable your StreamLink with \`${settings.prefix}streamlink enable\` and disable with \`${settings.prefix}streamlink disable\`\n\n` +
        `:three: Add a channel on the server to send notifications to by using \`${settings.prefix}streamlink add channel\` in the chosen channel\n\n` +
        `:four: Check \`${settings.prefix}streamlink status\` to see if your information saved properly, and to see the current server settings\n\n` +
        '**Command List**\n\n' +
        `\`${settings.prefix}streamlink add\`\n` +
        `\`${settings.prefix}streamlink remove\`\n` +
        `\`${settings.prefix}streamlink enable\`\n` +
        `\`${settings.prefix}streamlink disable\`\n` +
        `\`${settings.prefix}streamlink status\`\n` +
        `\`${settings.prefix}streamlink help\`;
      break;
    default:
      message.reply(`\`${message.content}\` is an incorrect command usage! Check \`${settings.prefix}streamlink help\` for more information.`);
      break;
  }
};

exports.reloadHandler = () =>
  new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve('../../handlers/StreamLinkHandler')];
      streamlink = require('../../handlers/StreamLinkHandler');
      slFuncGC.reloadHandler()
        .then(slFuncGD.reloadHandler()
          .then(slFuncGMR.reloadHandler()
            .then(slFuncCD.reloadHandler()
              .then(slFuncRdy.reloadHandler()
                .then(resolve())
                .catch(console.error))
              .catch(console.error))
            .catch(console.error))
          .catch(console.error))
        .catch(console.error);
    } catch (err) {
      reject(err);
    }
  });
