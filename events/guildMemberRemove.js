// This event triggers whenever a user leaves a guild (aka server) Ggis is in
// Ggis will remove the user from StreamLink and/or !squad config files

var   streamlink = require('../util/streamlinkHandler');
const fs         = require('fs');
const chalk      = require('chalk');

module.exports = member => {
    var settings   = JSON.parse(fs.readFileSync('./settings.json','utf8'));
    var settingsSL = JSON.parse(fs.readFileSync('./config/streamlink.json','utf8'));

    // Firstly, is the member connected with StreamLink?
    var index = settingsSL.userIDs.indexOf(member.id);
    if (index > -1) {
        // Also, does the user exist on a different Ggis server?
        var existsElsewhere = false;
        settings.guilds.forEach(g => {
            if (member.client.guilds.get(g).members.has(member.id)) {
                // if yes, let's *not* remove the StreamLink info
                existsElsewhere = true;
            }
        });
        if (!existsElsewhere) streamlink.removeStream(void 0, member.client, member.user);
    }
};

module.exports.reloadHandler = function () {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`../util/streamlinkHandler`)];
            streamlink = require(`../util/streamlinkHandler`);
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}