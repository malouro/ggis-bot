/**
 * AutoReactions
 *  This feature only works within the MainGuild or the TestGuild!
 *
 *  @func autoReact
 *      @param {Discord.Message} message
 *      @param {JSON} settings
 *
 *  Returns a new message back to 'message' event
 *  Executes proper reaction based on the criteria met, if any
 *      @desc {TxtReactions}
 *          - Reads message, tests every RegEx needed to check for
 *          - If one, or more, matches: react appropriately
 *      @desc {AtReactions}
 *          - If a user is mentioned, check if the user has any registered AtReaction emoji
 *          - If so, react appropriately
 *
 */

const getAtReactions = require('./getAtReactions');
const getTxtReactions = require('./getTxtReactions');

let AtReactions = getAtReactions(new Map());
let TxtReactions = getTxtReactions(new Map());

/**
 * Reacts to the message with a specific order of emojis
 *
 * @func reactInOrder
 *  @param {Discord.Message} message Discord message object
 *  @param {Array[String]} emojis unicode emoji or Discord custom emoji ID array
 *  @param {Number} i current index of emojis array
 */
const reactInOrder = (message, emojis, i) => {
  if (emojis.length !== 0 && i < emojis.length) {
    message.react(emojis[i]).then(() => {
      i++;
      reactInOrder(message, emojis, i);
    }).catch(err => console.log(err));
  }
};

/**
 * Replies to the message correctly, with the given file and/or string
 *
 * @param {Discord.Message} message Discord message object
 * @param {Object} reply the reply object, contains data needed for the AutoReaction reply
 */
const replyReaction = (message, reply) => {
  if (reply.file !== '') message.reply(reply.message, { file: reply.file });
  else message.reply(reply.message);
};

module.exports = (message, settings) => new Promise((resolve, reject) => {
  try {
    if (settings.rules.autoReact.txtMentions) {
      TxtReactions = getTxtReactions(TxtReactions);
      TxtReactions.forEach((t, regex) => {
        if (message.content.match(regex)) {
          switch (t.type) {
            case 'react':
              if (t.reaction.length > 0) {
                reactInOrder(message, t.reaction, 0);
              } else {
                console.log(`No reactions in reaction array for "${t.description}" AutoReaction for a 'react' type AutoReact`);
              }
              break;
            case 'reply':
              if (t.reply.message !== '') {
                replyReaction(message, t.reply);
              } else {
                console.log(`No reply message for "${t.description}" AutoReaction for a 'reply' type AutoReact`);
              }
              break;
            case 'react-reply':
            case 'reply-react':
              if (t.reaction.length > 0 && t.reply.message !== '') {
                replyReaction(message, t.reply);
                reactInOrder(message, t.reaction, 0);
              } else {
                if (t.reply.message === '') console.log(`No reply message for "${t.description}" AutoReaction for a 'reply' type AutoReact`);
                if (t.reaction.length <= 0) console.log(`No reactions in reaction array for "${t.description}" for a 'react' type AutoReact`);
              }
              break;
            default:
              console.log('Unexpected TxtReaction type in autoReact.js');
              break;
          }
        }
      });
    }
    if (settings.rules.autoReact.atMentions && message.mentions.users.array().length > 0) {
      AtReactions = getAtReactions(AtReactions);
      message.mentions.users.forEach((u) => {
        if (AtReactions.has(u.id)) {
          const reaction = AtReactions.get(u.id);
          message.react(reaction.emoji[Math.floor(Math.random() * reaction.emoji.length)])
            .then()
            .catch(e => console.error(e));
        }
      });
    }
    resolve();
  } catch (err) {
    reject(err);
  }
});
