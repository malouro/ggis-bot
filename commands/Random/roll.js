/**
 * @func !roll
 *
 * @desc Roll a x amount of y-sided dice
 */

const settings = require('../../settings');

const defaultDie = 100;

exports.help = {
  name: 'roll',
  description: 'Roll a set of dice',
  usage: `roll xdy\n\nx - Number of dice to roll\nd - (static, do not change)\ny - Number of sides for the dice\n\nIf options aren't specified, or there is a mistake in the parsing of the arguments, the default roll value is a single ${defaultDie}-sided die` +
  `\n\nExample 1 :: ${settings.prefix}roll 1d20\nRolls a single 20-sided die.\n\nExample 2 :: ${settings.prefix}roll 3d10\nRolls three 10-sided dice`,
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
  defaultDie,
  maxRolls: 100,
};

const getAverage = (rolls) => {
  let ac = 0;

  rolls.forEach((r) => {
    ac += r;
  });

  return ac / rolls.length;
};

const roll = (noOfDice, noOfSides) => {
  const rolls = [];

  for (let i = 0; i < noOfDice; i++) {
    rolls.push(Math.ceil(Math.random() * noOfSides));
  }

  return `You rolled ${(rolls.length > 1) ? `**${rolls.join(', ')}** for an average of **${getAverage(rolls)}**!` : `a **${rolls[0]}**!`}`;
};

exports.run = (bot, message, args) => {
  let rollArgs;

  if (args.length > 0) {
    args.splice(0, 1);
    rollArgs = args.join('');

    if (rollArgs.includes('d')) {
      rollArgs = rollArgs.split('d', 2);
      rollArgs.forEach((arg, index) => {
        rollArgs[index] = Number(arg);
      });
      if (typeof rollArgs[0] !== 'number' && typeof rollArgs[1] !== 'number') {
        message.reply(roll(1, this.conf.defaultDie));
      } else if (typeof rollArgs[0] !== 'number') {
        message.reply(roll(1, rollArgs[1]));
      } else if (typeof rollArgs[1] !== 'number') {
        message.reply(roll(rollArgs[0], this.conf.defaultDie));
      } else {
        message.reply(roll(rollArgs[0], rollArgs[1]));
      }
    } else if (rollArgs.length === 1 && typeof rollArgs === 'number') {
      message.reply(roll(1, rollArgs));
    } else {
      message.reply(roll(1, this.conf.defaultDie));
    }
  } else {
    message.reply(roll(1, this.conf.defaultDie));
  }
};
