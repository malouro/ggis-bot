/**
 * @func !coin
 *
 * @desc Flip coin(s)
 */

exports.help = {
  name: 'coin',
  description: 'Flip a coin or coins',
  usage: 'coin <numberOfFlips>',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['flip', 'coinflip', 'flipcoin'],
  permLevel: 0,
  maxFlips: 100,
};

const toFixedDown = (number, digits) => {
  const re = new RegExp(`(\\d+\\.\\d{${digits}})(\\d)`);
  const m = number.toString().match(re);
  return m ? parseFloat(m[1]) : number.valueOf();
};

const getStats = (flips) => {
  let heads = 0;
  let tails = 0;

  flips.forEach((f) => {
    if (f) heads++;
    else tails++;
  });

  // Returns [ # of heads, # of tails, % heads, % tails ]
  return [
    heads,
    tails,
    toFixedDown((heads / (heads + tails)) * 100, 4),
    toFixedDown((tails / (heads + tails)) * 100, 4),
  ];
};

const flip = (noOfCoins) => {
  const flips = [];
  let stats;

  for (let i = 0; i < noOfCoins; i++) {
    flips.push(Math.round(Math.random()) === 0);
  }

  if (noOfCoins > 1) {
    stats = getStats(flips);
  }

  return (
    `You flipped ${noOfCoins === 1 ? 'a coin!' : `**${noOfCoins}** coins! Your results:`}\n\n` +
    `${(noOfCoins > 1) ? `${flips.map(f => (f ? 'heads' : 'tails')).join(', ')}\n\n**${stats[0]}** heads (${stats[2]}%), **${stats[1]}** tails (${stats[3]}%)` : `${(flips[0]) ? '**Heads**' : '**Tails**'}`}`
  );
};

exports.run = (bot, message, args) => {
  if (args[1] && Number.isInteger(Number(args[1]))) {
    if (args[1] > this.conf.maxFlips) {
      message.reply(`The given number of flips, ${args[1]}, is too high. The maximum is ${this.conf.maxFlips}.`);
    } else if (args[1] < 1) {
      message.reply(`The given number of flips, ${args[1]}, is too low. Must be 1 or above.`);
    } else {
      message.reply(flip(Number(args[1])));
    }
  } else if (args[1]) {
    message.reply(`There was a mistake with your command use. Argument given must be of type \`number\`. Defaulting to a single coin flip...\n\n${flip(1)}`);
  } else {
    message.reply(flip(1));
  }
};
