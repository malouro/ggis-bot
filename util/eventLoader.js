/**
 * Adds functions to the Client's event listeners
 * 
 * @param {String} event 
 *  Does Node require for each events .js file
 */

var reqEvent = (event) => require(`../events/${event}`)

exports.init = bot => {
    
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