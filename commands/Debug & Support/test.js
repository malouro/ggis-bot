/**
 * @func !test
 *
 * @desc Test command
 */

const fs = require('fs');

exports.help = {
  name: 'test',
  description: 'For testing purposes.',
  usage: 'test',
};

exports.conf = {
  enabled: true,
  visible: false,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 4,
};

exports.run = (bot, message, args, perms) => {
  if (perms < 4) return; // Double-check permissions
  let type; // Type of test

  if (args.length > 1) { // get test type
    [, type] = args;
  }

  /** Run test suites */
  fs.readdir('./test/commands/Debug & Help', (err, files) => {
    if (err) throw err;
    files.forEach((f) => {
      const cmd = require(`../../test/commands/Debug & Help/${f}`);
      cmd.test(bot, message, type);
    });
  });
};
