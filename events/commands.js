/**
 * Checks for commands and then runs commands if one was issued in the message
 * 
 * @func commands (void()) 
 *  @param {Discord.Client} bot
 *  @param {Discord.Message} message
 *  @param {JSON} settings
 * 
 *  Commands are messages that start with a prefix (located in the config file 'settings.json')
 *      (by default, this prefix is set to '!')
 *  Additionally, @pinging the bot will trigger the help menu (aka: the !help command)
 */

module.exports = (bot, message, settings) => {

    if (message.content.startsWith(`<@${bot.user.id}>`)) bot.commands.get('help').run(bot, message, message.content.split(/ +/), bot.getPerms(message));
    if (!message.content.startsWith(settings.prefix)) return;

    let args = message.content.substring(settings.prefix.length).split(/ +/);
    let command = args[0].toLowerCase();
    let perms = bot.getPerms(message);
    let cmd;

    /**
     * Check the bot's command & aliases Collections for the first argument (aka, what directly followed the command prefix)
     * 
     * ie: For the message "!streamlink" --> 
     *  args[0] would be 'streamlink' and we would check for the 'streamlink' command in bot.commands
     */
    if (bot.commands.has(command)) {
        cmd = bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
        cmd = bot.commands.get(bot.aliases.get(command));
    }

    // if something was found, check to see if we can appropriately run the command
    if (cmd) {
        /**
         * Disallow the command use IF
         *  (a) Command isn't enabled
         *  (b) User doesn't have necessary permission level to use the command (permLevel)
         *  (c) If command is textChannelOnly and the channel is a DM channel
         *  (d) Command is for the main guild only, and message isn't from the main guild or a test guild
         */
        if (!cmd.conf.enabled) return;
        if (perms < cmd.conf.permLevel) return;
        if (cmd.conf.textChannelOnly && message.channel.type === 'dm') return message.reply(`Sorry, but this command doesn't work via DM!`);
        if (cmd.conf.guildOnly && (message.guild.id !== settings.mainguild && message.guild.id !== settings.testguild)) return;
        cmd.run(bot, message, args, perms);
    }

};