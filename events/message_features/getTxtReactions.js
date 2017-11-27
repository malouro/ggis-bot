// Changes TxtReactions object in 'autoReact' event
const fs = require('fs');

module.exports = function (TxtReactions) {
    try {
        TxtReactions.clear();
        let reactions = JSON.parse(fs.readFileSync('./config/txtreactions.json', 'utf8'));
        reactions.reactions.forEach(r => {
            TxtReactions.set(r.regex, r);
        });
        return TxtReactions;
    } catch (err) {
        console.log(err);
    }
};