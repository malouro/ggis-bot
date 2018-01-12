/**
 * Updates TxtReactions object in 'autoReact' event (in ~/events/message_features/)
 */
const fs = require('fs');

module.exports = (TxtReactions) => {
  try {
    TxtReactions.clear();

    const reactions = JSON.parse(fs.readFileSync('./config/txtreactions.json', 'utf8'));

    reactions.reactions.forEach((r) => {
      TxtReactions.set(r.regex, r);
    });

    return TxtReactions;
  } catch (err) {
    return console.error(err);
  }
};