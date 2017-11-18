// Changes AtReactions object in 'autoReact' event
const fs = require('fs');
module.exports = function (AtReactions) {
    try {
        AtReactions.clear();
        let reactions = JSON.parse(fs.readFileSync('./config/atreactions.json', 'utf8'));
        reactions.reactions.forEach(r => {
            AtReactions.set(r.id, r);
        });
        return AtReactions;
    } catch (err) {
        console.log(err);
    }
};