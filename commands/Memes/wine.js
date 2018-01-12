/**
 * @func !wine
 *
 * @desc Darkest Dungeon wine throwing mob, with random quotes
 */

const moment = require('moment');
const settings = require('../../settings');

const catchPhrases = [
  'Mortality clarified in a single strike!',
  'Such a terrible assault cannot be left unanswered!',
  'Ringing ears, blurred vision - the end approaches...',
  'Unnerved, unbalanced...',
  'Death waits for the slightest lapse in concentration.',
  'Dazed, reeling, about to break...',
  'Exposed to a killing blow!',
  'Grievous injury, palpable fear...',
  'The walls close in – the shadows whispers of conspiracy.',
  'Reeling, gasping! Taken over the edge into madness!!',
];

exports.help = {
  name: 'wine',
  description: '*splurt*',
  usage: 'wine\n\nIt\'s everyone\'s favorite wine throwing enemy from Darkest Dungeon. (complete w/ a random narrator quote)',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  catchPhrases,
};

exports.run = (bot, message) => {
  const filepath = './img/memes/wine.png';

  message.channel.send(`*splurt*  **"${catchPhrases[Math.floor(Math.random() * catchPhrases.length)]}"**`, { file: filepath });

  console.log(`[${moment().format(settings.timeFormat)}] User ${message.author.username} splurted wine everywhere. Kinda rude, huh?`);
};
