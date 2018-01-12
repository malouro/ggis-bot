/**
 * @func !squad
 *
 * @desc Manage 'squads' and @ping a group of people
 */

const fs = require('fs');
const moment = require('moment');
const mkdirp = require('mkdirp');
const settings = require('../../settings.json');

exports.help = {
  name: 'squad',
  description: 'Quickly @mention a group of people with a single command',
  usage: 'squad [<squadName>/create/delete/join/leave/addto/removefrom/list] <squadName>\n\n'
    + '[ Option list & descriptions: ]\n'
    + 'You must always specify the <squadName>! (but, don\'t include the < > in the command usage)\n'
    + `${settings.prefix}squad <squadName> will @mention everyone in the squad!\n\n`
    + 'create     :: Creates a new squad, will be initially empty.\n'
    + `(admins only: append @mentions at the end of "${settings.prefix}squad create squadName" to create the squad initially with members)\n`
    + 'delete     :: Deletes a squad, can\'t be undone! _ADMIN-ONLY_\n'
    + `join       :: Join & add yourself to a squad. The next time someone uses "${settings.prefix}squad squadName", you will be included!\n`
    + 'leave      :: Leave a squad. You will no longer be @mentioned with that squad\n'
    + 'addto      :: Add other members to the squad _ADMIN-ONLY_\n'
    + 'removefrom :: Remove other members from the squad _ADMIN-ONLY_\n'
    + 'list       :: Lists all of the members of the squad',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: true,
  aliases: ['sq'],
  permLevel: 0,
};

/**
 * @func writeFileIfNotExist
 * Writes to fs given that the file did not already exist
 * Callback with a boolean value of whether or not the file originally existed
 *
 * @param {String} fname
 * @param {Object} contents
 * @param {Object} options
 * @param {Function} callback
 */
const writeFileIfNotExist = (fname, contents, options, callback) => {
  /**
   * Borrows a suggestion from this StackOverflow thread:
   * @lends https://stackoverflow.com/questions/36054673/node-js-write-json-if-file-doesnt-exist-not-using-fs-exists
   */

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = options || {};

  // force wx flag so file will be created only if it does not already exist
  options.flag = 'wx';

  fs.writeFile(fname, contents, options, (err) => {
    let existed = false;
    if (err && err.code === 'EEXIST') {
      /** File already exists, don't throw an error */
      err = null;
      existed = true;
    }
    if (typeof callback === 'function') {
      callback(err, existed); /** callback with existed if EEXIST error was thrown */
    }
  });
};

/**
 * @func writeNewSquad
 * Creates a new squad and writes to the disk the JSON file
 *
 * @param {String} path
 * @param {String} squadName
 * @param {Object} squad
 * @param {Discord.Message} message
 */
const writeNewSquad = (path, squadName, squad, message) => {
  mkdirp(path, 0o777, (err) => {
    if (err) throw err;
    else {
      writeFileIfNotExist(`${path}/${squadName}.json`, JSON.stringify(squad), { mode: 0o777 }, (err2, existed) => {
        if (err2) throw err2;
        if (!existed) {
          message.reply(`Created the **${squadName}** squad! To join this squad use **${settings.prefix}squad join ${squadName}**`);
          console.log(`[${moment().format(settings.timeFormat)}] File created for squad ${squadName} on the ${message.guild.name} server! (id: ${message.guild.id})`);
        } else {
          message.reply(`The squad **${squadName}** already exists! If you want to join this squad, and be alerted when other users use **${settings.prefix}squad ${squadName}**, use **${settings.prefix}squad join ${squadName}**`);
        }
      });
    }
  });
};

/**
 * @func deleteSquad
 * Deletes an existing squad
 *
 * @param {String} path
 * @param {String} squadName
 * @param {Discord.Message} message
 */
const deleteSquad = (path, squadName, message) => {
  fs.unlink(`${path}/${squadName}.json`, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        message.reply(`The **${squadName}** squad does not exist.`);
      } else {
        throw err;
      }
    } else {
      message.reply(`The **${squadName}** squad has been deleted.`);
    }
  });
};

/**
 * @func listSquad
 * Lists all members of a given squad given the squadName
 *
 * @param {String} path
 * @param {String} squadName
 * @param {Discord.Message} message
 */
const listSquad = (path, squadName, message) => {
  fs.readFile(`${path}/${squadName}.json`, { encoding: 'utf8', flag: 'r' }, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        message.reply(`The **${squadName}** squad does not exist.`);
      } else {
        throw err;
      }
    } else {
      const tmpSquad = JSON.parse(data);
      let str = `__List of the **${squadName.toUpperCase()}** squad's current members:__\n\`\`\`asciidoc\n`;
      let count = 0;

      // alphabetical order:
      const tmpArrayUsers = [];
      tmpSquad.squad.forEach((uid) => {
        if (typeof message.guild.members.get(uid) !== 'undefined') {
          tmpArrayUsers.push(message.guild.members.get(uid).user.username);
        }
      });
      tmpArrayUsers.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      tmpArrayUsers.forEach((username, index) => {
        str += `${index + 1}. ${username}\n`;
        count++;
      });
      if (count === 0) {
        str += 'SQUAD IS EMPTY\n';
      }
      str += '```';
      message.channel.send(str);
    }
  });
};

/**
 * @func joinSquad
 * User joins squad themselves
 *
 * @param {String} path
 * @param {String} squadName
 * @param {Discord.Message} message
 */
const joinSquad = (path, squadName, message) => {
  fs.readFile(`${path}/${squadName}.json`, { encoding: 'utf8', flag: 'r+' }, (readErr, data) => {
    if (readErr) {
      if (readErr.code === 'ENOENT') {
        message.reply(`The **${squadName}** squad does not exist.`);
      } else {
        throw readErr;
      }
    } else {
      const tmpSquad = JSON.parse(data);
      if (tmpSquad.squad.length > 0) {
        if (Array.from(tmpSquad.squad).indexOf(message.author.id) > -1) {
          message.reply(`You are already in the **${squadName}** squad.`);
          return;
        }
      }
      tmpSquad.squad.push(message.author.id);
      fs.writeFile(`${path}/${squadName}.json`, JSON.stringify(tmpSquad), { mode: 0o777 }, (writeErr) => {
        if (writeErr) console.log(writeErr);
        else {
          message.reply(`You are now in the **${squadName}** squad!`);
        }
      });
    }
  });
};

/**
 * @func leaveSquad
 * User leaves squad themselves
 *
 * @param {String} path
 * @param {String} squadName
 * @param {Discord.Message} message
 */
const leaveSquad = (path, squadName, message) => {
  fs.readFile(`${path}/${squadName}.json`, { encoding: 'utf8', flag: 'r+' }, (readErr, data) => {
    if (readErr) {
      if (readErr.code === 'ENOENT') {
        message.reply(`The **${squadName}** squad does not exist.`);
      } else {
        throw readErr;
      }
    } else {
      const tmpSquad = JSON.parse(data);
      if (tmpSquad.squad.length > 0) {
        const index = Array.from(tmpSquad.squad).indexOf(message.author.id);
        if (index > -1) {
          tmpSquad.squad.splice(index, 1);
        } else {
          message.reply(`You are not currently in the **${squadName}** squad.`);
          return;
        }
      } else {
        message.reply(`The **${squadName}** squad is currently empty.`);
        return;
      }
      fs.writeFile(`${path}/${squadName}.json`, JSON.stringify(tmpSquad), { mode: 0o777 }, (writeErr) => {
        if (writeErr) console.log(writeErr);
        else {
          message.reply(`You have left the **${squadName}** squad.`);
        }
      });
    }
  });
};

/**
 * @func addToSquad
 * Adds another member(s) to an existing squad
 *
 * @param {String} path
 * @param {String} squadName
 * @param {Discord.Message} message
 */
const addToSquad = (path, squadName, message) => {
  fs.readFile(`${path}/${squadName}.json`, { encoding: 'utf8', flag: 'r+' }, (readErr, data) => {
    if (readErr) {
      if (readErr.code === 'ENOENT') {
        message.reply(`The **${squadName}** squad does not exist.`);
      } else throw readErr;
    } else {
      const tmpSquad = JSON.parse(data);
      if (message.mentions.users.size > 0) {
        message.mentions.users.map((user) => {
          if (user.id !== message.author.id && !tmpSquad.squad.includes(user.id)) {
            tmpSquad.squad.push(user.id);
          }
        });
      } else {
        message.reply(`In order to add users to this squad, you need to @ mention them at the end of the command **${settings.prefix}squad addto ${squadName}**`);
        return;
      }
      fs.writeFile(`${path}/${squadName}.json`, JSON.stringify(tmpSquad), { mode: 0o777 }, (writeErr) => {
        if (writeErr) throw writeErr;
        else {
          message.reply(`The **${squadName}** squad has been updated!`);
          listSquad(path, squadName, message);
        }
      });
    }
  });
};

/**
 * @func removeFromSquad
 * Removes another member(s) from an existing squad
 *
 * @param {String} path
 * @param {String} squadName
 * @param {Discord.Message} message
 */
const removeFromSquad = (path, squadName, message) => {
  const removedUsers = [];
  fs.readFile(`${path}/${squadName}.json`, { encoding: 'utf8', flag: 'r+' }, (readErr, data) => {
    if (readErr) {
      if (readErr.code === 'ENOENT') {
        message.reply(`The **${squadName}** squad does not exist.`);
      } else throw readErr;
    } else {
      const tmpSquad = JSON.parse(data);
      if (message.mentions.users.size > 0) {
        message.mentions.users.map((user, index) => {
          if (tmpSquad.squad.includes(user.id)) {
            tmpSquad.squad.splice(index, 1);
            removedUsers.push(user.id);
          }
        });
      } else {
        message.reply(`In order to remove users from this squad, you need to @ mention them at the end of the command (ie: **${settings.prefix}squad removefrom *@user1 @user2 ...***`);
        return;
      }
      if (removedUsers.length === 0) {
        message.reply(`None of the users mentioned were in the **${squadName}** squad.`);
        return;
      }
      fs.writeFile(`${path}/${squadName}.json`, JSON.stringify(tmpSquad), { mode: 0o777 }, (writeErr) => {
        if (writeErr) throw writeErr;
        else {
          message.reply(`The **${squadName}** squad has been updated!`);
          listSquad(path, squadName, message);
        }
      });
    }
  });
};

exports.run = (bot, message, args) => {
  /**
   * Command list & uses:
   *
   * !squad [squadName]
   * !squad create [squadName]
   * !squad delete [squadName]
   * !squad join [squadName]
   * !squad leave [squadName]
   * !squad addto [squadName] [@users]
   * !squad removefrom [squadName] [@users]
   * !squad list ([squadName])
   */
  const tmpSquad = { squad: [] };
  const disallowed = ['create', 'delete', 'join', 'leave', 'addto', 'removefrom', 'list'];

  if (typeof args[1] !== 'undefined') {
    if (args[1] === 'create') {
      if (typeof args[2] === 'undefined') {
        message.reply(`You need to specify the name of the squad you want to make! (ie: **${settings.prefix}squad create *squadName***)`);
      } else if (args[2].includes('/')) {
        message.reply('Invalid squad name, can\'t contain \'/\' or any spaces.');
      } else if (disallowed.includes(args[2])) {
        message.reply(`Invalid squad name; the name "${args[2]}" is disallowed! Please try another name. (invalid names include: \`${disallowed.join(', ')}\``);
      } else {
        /* eslint-disable */
        fs.readdir(`./config/squads/${message.guild.id}/`, (err, files) => {
          /* eslint-enable */
          if (err) {
            if (err.code === 'ENOENT') {
              fs.mkdir(`./config/squads/${message.guild.id}`, 0o777, (err2) => {
                if (err2) throw err2;
              });
            } else throw err;
          } else if (files.length >= settings.squad.server_max && message.guild.id !== settings.mainguild) {
            return message.reply(`This server has already reached the maximum # of saved squads! (${settings.squad.server_max} squads) You can make room by deleting another squad with **${settings.prefix}squad delete *squadName***`);
          }
          if (typeof args[3] !== 'undefined' && message.mentions.users.size > 0) {
            if (!message.member.hasPermission('ADMINISTRATOR')) {
              return message.reply('Sorry, but only admins are allowed to add other users to a squad. Please remove the @ user mentions at the end of your command!');
            }
            message.mentions.users.map((user) => {
              tmpSquad.squad.push(user.id);
            });
          }
          writeNewSquad(`./config/squads/${message.guild.id}`, args[2].toLowerCase(), tmpSquad, message);
        });
      }
    } else if (args[1] === 'delete') {
      if (typeof args[2] === 'undefined') {
        message.reply(`You need to specify the name of the squad you want to delete! (ie: **${settings.prefix}squad delete *squadName***)`);
      } else if (!message.member.hasPermission('ADMINISTRATOR')) {
        message.reply('Sorry, but only admins are allowed to delete squads. Please contact a server admin to help you out! Non-admin users can only use, create, join or leave a squad.');
      } else {
        deleteSquad(`./config/squads/${message.guild.id}`, args[2].toLowerCase(), message);
      }
    } else if (args[1] === 'join') {
      if (typeof args[2] === 'undefined') {
        message.reply(`You need to specify the name of the squad you want to join! (ie: **${settings.prefix}squad join *squadName***)`);
      } else {
        joinSquad(`./config/squads/${message.guild.id}`, args[2].toLowerCase(), message);
      }
    } else if (args[1] === 'leave') {
      if (typeof args[2] === 'undefined') {
        message.reply(`You need to specify the name of the squad you want to leave. (ie: **${settings.prefix}squad leave *squadName***)`);
      } else {
        leaveSquad(`./config/squads/${message.guild.id}`, args[2].toLowerCase(), message);
      }
    } else if (args[1] === 'addto') {
      if (!message.member.hasPermission('ADMINISTRATOR')) {
        message.reply(`Sorry, but only admins are allowed to add other users to a squad. Non-admin users can only use, create, join or leave a squad. You may not use the **${settings.prefix}squad addto** command.`);
      } else if (typeof args[2] === 'undefined') {
        message.reply(`You need to specify the name of the squad you want to add to! (ie: **${settings.prefix}squad addto *squadName @user1 @user2 ...***)`);
      } else {
        addToSquad(`./config/squads/${message.guild.id}`, args[2].toLowerCase(), message);
      }
    } else if (args[1] === 'removefrom') {
      if (!message.member.hasPermission('ADMINISTRATOR')) {
        message.reply('Sorry, but only admins are allowed to remove users from a squad. Non-admin users can only use, create, join or leave a squad.');
      } else if (typeof args[2] === 'undefined') {
        message.reply(`You need to specify the name of the squad you want to remove from (ie: **${settings.prefix}squad removefrom *squadName @user1 @user2 ...***)`);
      } else {
        removeFromSquad(`./config/squads/${message.guild.id}`, args[2].toLowerCase(), message);
      }
    } else if (args[1] === 'list') {
      if (typeof args[2] === 'undefined') {
        message.reply(`You need to specify the name of the squad you want to list & view! (ie: **${settings.prefix}squad list *squadName***)`);
      } else {
        listSquad(`./config/squads/${message.guild.id}`, args[2].toLowerCase(), message);
      }
    } else {
      const fetch = args[1].toLowerCase();
      let str = `\`${fetch}\` `;
      fs.readFile(`./config/squads/${message.guild.id}/${fetch}.json`, { encoding: 'utf8', flag: 'r' }, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            message.reply(`The **${args[1]}** squad does not exist. To make a new squad use **${settings.prefix}squad create *squadname***`);
          } else {
            throw err;
          }
        } else {
          const fetchedJSON = JSON.parse(data);
          const onlyMember = fetchedJSON.squad.length === 1 && message.author.id === fetchedJSON.squad[0];
          if (fetchedJSON.squad.length === 0 || onlyMember) {
            message.reply(`The **${fetch}** squad is currently empty (or you are the only member). Have other members join with **${settings.prefix}squad join ${fetch}**`);
            return;
          }
          fetchedJSON.squad.forEach((s, index) => {
            if (message.author.id !== s) {
              if (index === fetchedJSON.squad.length - 1) str += `<@${s}> `;
              else str += `<@${s}>, `;
            }
          });
          if (typeof args[2] !== 'undefined') {
            str += `\`${message.author.username} says:\``;
            // Add on the arguments (aka; the text to send)
            args.forEach((arg, index) => {
              if (index > 1) {
                str += ` ${arg} `;
              }
            });
          }
          message.channel.send(str);
        }
      });
    }
  }
};
