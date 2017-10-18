// =====================================================================================
//                              ! restart command
// =====================================================================================
// Restarts the app through Node.js's 'process.ext()'
// Should ONLY be used by master user for debug purposes or when things go awry.
// It's a HUGE responsibility to handle & use this command, or when using
// process.exit() in *general*.

exports.run = (bot, message, args) => {
    process.exit(0);
}

exports.conf = {
    enabled: true,
    visible: false,
    guildOnly: false,
    aliases: ['reboot'],
    permLevel: 4
};

exports.help = {
    name: 'restart',
    description: `restarts process`,
    usage: 'restart'
};