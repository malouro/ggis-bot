/**
 * Test for !help command
 *
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 */

const chalk = require('chalk');
const settings = require('../../../settings');

const { testGuild, mainGuild, masterID } = settings; // eslint-disable-line

const t = 'help';
const defaultProps = {
  needsPerms: false,
  doesNotNeedPerms: false,
  needsGuild: false,
  doesNotNeedGuild: false,
};
let testProps = defaultProps;
let testMessage;

const log = (msg) => {
  console.log(chalk.bgHex('#7b94ff')(`   Test: ${msg}`));
};

const resetTestProps = () => {
  testProps = defaultProps;
};

const setTestMessage = (originalMessage) => {
  testMessage = originalMessage;
};

exports.test = (bot, message, type) => {
  console.log('Running "help.test.js"\n');

  /** Define the command that will be tested */
  const cmd = bot.commands.get(t);

  /** Reset test props & message if needed */
  const resetTest = () => {
    resetTestProps();
    setTestMessage(message);
  };

  /** Focused test suite */
  const focusTestSuite = () => {
    console.log('Starting focused test suite...\n');

    /** Case; No args */
    cmd.run(bot, testMessage, [t], 0);
    log(`${settings.prefix}${t} with no args`);

    /** Case; !help all */
    cmd.run(bot, testMessage, [t, 'all'], 0);
    log(`${settings.prefix}${t} all`);

    /** Case; Has sufficient perms or not */
    /**
     * @todo Utilize a different method for finding appropriate commands to test
     */
    bot.commands.forEach((c) => {
      if (c.conf.permLevel > 0 && !testProps.needsPerms) {
        testProps.needsPerms = true;
        cmd.run(bot, testMessage, [t, c.help.name], 0);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 0, needsPerms`);
        cmd.run(bot, testMessage, [t, c.help.name], 4);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 4, needsPerms`);
      } else if (!testProps.doesNotNeedPerms) {
        testProps.doesNotNeedPerms = true;
        cmd.run(bot, testMessage, [t, c.help.name], 0);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 4, doesNotNeedPerms`);
      }
      if (c.conf.guildOnly && !testProps.needsGuild) {
        testProps.needsGuild = true;
        testMessage.guild.id = testGuild;
        cmd.run(bot, testMessage, [t, c.help.name], 4);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 4, guildOnly`);
        setTestMessage(message);
      } else if (!c.conf.guildOnly && !testProps.doesNotNeedGuild) {
        testProps.doesNotNeedGuild = true;
        cmd.run(bot, testMessage, [t, c.help.name], 4);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 4, not guildOnly`);
      }
    });

    /** Case; !help debug, w/ 0 permLevel (Using 'debug' since it contains several restricted commands */
    cmd.run(bot, testMessage, [t, bot.commandGroups.first().code[0]], 0);
    log(`${settings.prefix}${t} ${bot.commandGroups.first().code[0]} -- permLevel = 0`);

    /** Case; !help debug, w/ 4 permLevel */
    cmd.run(bot, testMessage, [t, bot.commandGroups.first().code[0]], 4);
    log(`${settings.prefix}${t} ${bot.commandGroups.first().code[0]} -- permLevel = 4`);
  };

  /** Full/exhaustive test suite */
  const fullTestSuite = () => {
    console.log('Starting full test suite...\n');

    /** Case; No args */
    cmd.run(bot, testMessage, [t], 0);
    log(`${settings.prefix}${t} with no args`);

    /** Case; !help all */
    cmd.run(bot, testMessage, [t, 'all'], 0);
    log(`${settings.prefix}${t} all -- permLevel = 0`);

    cmd.run(bot, testMessage, [t, 'all'], 4);
    log(`${settings.prefix}${t} all -- permLevel = 0`);

    /** Case; all commands, w/ perms set to 0 & 4 */
    bot.commands.forEach((c) => {
      if (c.conf.permLevel > 0) {
        cmd.run(bot, testMessage, [t, c.help.name], 0);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 0`);
        cmd.run(bot, testMessage, [t, c.help.name], 4);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 4`);
      } else {
        cmd.run(bot, testMessage, [t, c.help.name], 0);
        log(`${settings.prefix}${t} ${c.help.name} -- permLevel = 0`);
      }
    });

    /** Case; all command categories */
    bot.commandGroups.forEach((g) => {
      cmd.run(bot, testMessage, [t, g.code[0]], 0);
      log(`${settings.prefix}${t} ${g.code[0]} -- permLevel = 0`);
      cmd.run(bot, testMessage, [t, g.code[0]], 4);
      log(`${settings.prefix}${t} ${g.code[0]} -- permLevel = 4`);
    });
  };

  resetTest(); // setup for actual test call below

  /** Decide what needs to be ran */
  switch (type) {
    default:
    case 'focused':
      focusTestSuite();
      resetTest();
      break;

    case 'full':
    case 'exhaustive':
      fullTestSuite();
      resetTest();
      break;
  }
};
