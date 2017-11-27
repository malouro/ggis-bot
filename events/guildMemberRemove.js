// This event triggers whenever a user leaves a guild (aka server) Ggis is in
// Ggis will remove the user from StreamLink and/or !squad config files

var streamlink = require('../util/streamlinkHandler');

module.exports = member => {
    // Firstly, is the member connected with StreamLink?
    if (!member.client.streamLink.users.has(member.user.id)) return;

    // If yes, does the user exist on another server? Or can we remove the user w/ no issue?
    let existsElsewhere = false;
    member.client.streamLink.guilds.forEach(g => {
        if (member.client.guilds.get(g).members.has(member.id)) {
            existsElsewhere = true; // if yes, let's *not* remove the StreamLink info
        }
    });

    // If the user doesn't exist in another guild, remove them from StreamLink
    if (!existsElsewhere) streamlink.removeUser(void 0, member.client, member.user);
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
};