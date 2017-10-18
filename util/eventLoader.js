// =====================================================================================
//                                   Event Loader
// =====================================================================================
// All bot Client events are passed through this.
// this includes 'ready', 'message', 'reconnecting', disconnect', etc...

var reqEvent = (event) => require(`../events/${event}`)

module.exports = bot => {
    bot.on('ready', () => reqEvent('ready')(bot));
    bot.on('reconnecting', () => reqEvent('reconnecting')(bot));
    bot.on('disconnect', () => reqEvent('disconnect')(bot));
    bot.on('message', reqEvent('message'));
    bot.on('messageDelete', reqEvent('messageDelete'));
    bot.on('messageReactionAdd', reqEvent('messageReactionAdd'));
    bot.on('messageReactionRemove', reqEvent('messageReactionRemove'));
    bot.on('guildCreate', reqEvent('guildCreate'));
    bot.on('guildDelete', reqEvent('guildDelete'));
    bot.on('guildMemberRemove', reqEvent('guildMemberRemove'));
    bot.on('channelDelete', reqEvent('channelDelete'));
};