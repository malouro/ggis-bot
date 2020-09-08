// Handles all polls

const chalk = require('chalk');
const moment = require('moment');
const settings = require('../settings');

const optionEmojiLetters = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];

const reactInOrder = (message, n, options) => {
  if (n < options.length) {
    message.react(optionEmojiLetters[n]).then(() => {
      reactInOrder(message, n + 1, options);
    }).catch(err => console.log(err));
  }
};

module.exports = {
  /**
   * Creates a poll (w/ multiple options)
   */
  makePoll: (bot, message, q, options) => {
    let question = q;
    let tooBig = false;
    if (!question.endsWith('?')) question += '?';
    if (options.length > optionEmojiLetters.length) {
      options.splice(optionEmojiLetters.length, options.length - optionEmojiLetters.length);
      tooBig = true;
    }
    const str = `\`poll\`\n${tooBig ? `\n*__NOTE:__ Not all of your options were added; there were too many! (max is ${optionEmojiLetters.length})*\n` : ''}${(question) ? `\n**${question}**\n` : ''}\n${options.map((o, index) => `${optionEmojiLetters[index]} ${o}`).join('\n')}`;
    message.channel.send(str).then((msg) => {
      reactInOrder(msg, 0, options);
      console.log(chalk.bgHex('#7800ff').black(`[${moment().format(settings.timeFormat)}] ${message.author.username} has created a poll: "${question}"`));
    }).catch(err => console.log(err));
  },

  /**
   * Creates a petition/poll (w/ two options {yay or nay}) >>
   */
  makePetition: (bot, message, question) => {
    const str = `\`poll/petition\`\n${(question) ? `\n**${question}**\n` : ''}\nAll in favor: hit 👍  All against: hit 👎`;
    message.channel.send(str).then((msg) => {
      msg.react('👍').then(() => {
        msg.react('👎')
          .then(console.log(chalk.bgHex('#7800ff').black(`[${moment().format(settings.timeFormat)}] ${message.author.username} has created a petition; topic: "${question}"`)))
          .catch(err => console.log(err));
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  },
};
