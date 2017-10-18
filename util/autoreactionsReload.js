// Changes AutoReactions object in 'message' event
const fs = require('fs');
module.exports = function (AutoReactions) {
    try {
        AutoReactions.clear();
        let autoreactions = JSON.parse(fs.readFileSync('./config/autoreactions.json', 'utf8'));
        autoreactions.autoreactions.forEach(r => {
            AutoReactions.set(r.id, r);
        });
        return AutoReactions;
    } catch (err) {
        console.log(err);
    }
};