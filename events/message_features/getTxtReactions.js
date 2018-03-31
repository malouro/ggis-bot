/**
 * Updates TxtReactions object in 'autoReact' event (in ~/events/message_features/)
 */
const fs = require('fs');

module.exports = (TxtReactions) => {
  try {
    if (TxtReactions.size > 0) TxtReactions.clear();

    const { reactions } = JSON.parse(fs.readFileSync('./config/txtReactions.json', 'utf8'));

    reactions.forEach((r) => {
      const regexp = new RegExp(r.regex, (r.flags) ? r.flags : '');
      TxtReactions.set(regexp, r);
    });

    return TxtReactions;
  } catch (err) {
    return console.error(err);
  }
};
