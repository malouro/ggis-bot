/**
 * Updates AtReactions object in 'autoReact' event (in ~/events/message_features/)
 */
const fs = require('fs');

module.exports = (AtReactions) => {
  try {
    if (AtReactions.size > 0) AtReactions.clear();

    const { reactions } = JSON.parse(fs.readFileSync('./config/atReactions.json', 'utf8'));

    reactions.forEach((r) => {
      AtReactions.set(r.id, r);
    });

    return AtReactions;
  } catch (err) {
    return console.log(err);
  }
};
