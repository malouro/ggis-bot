/**
 * @func !restart
 *
 * @desc Restarts the app through Node.js 'process.exit()'.
 *       pm2 (if set up) will auto-restart node apps when they crash or shut down, 
 *       so process.exit() will 'restart' the bot
 *
 *  - Should ONLY be used by the bot owner(s) for debug purposes or when things go awry.
 *  - It's a HUGE responsibility to handle & use this command
 *    (or when using process.exit() in *general*)
 *  - It should be used very limitedly, if not NEVER
 */

exports.help = {
  name: 'restart',
  description: 'Restarts the bot app',
  usage: 'restart',
};

exports.conf = {
  enabled: true,
  visible: false,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['reboot'],
  permLevel: 4,
};

exports.run = () => {
  process.exit(0);
};
