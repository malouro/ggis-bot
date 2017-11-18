const fs = require('fs');

exports.run = (bot, message, args, perms) => {
    //var settings = JSON.parse(fs.readFileSync('./settings.json','utf8'));
    var settingsSL = JSON.parse(fs.readFileSync('./config/streamlink.json','utf8'));
    var settingsSLMG = JSON.parse(fs.readFileSync('./config/streamlink_multiguild.json','utf8'));
    var conf = JSON.parse(fs.readFileSync('./config/streamlink/conf.json','utf8'));

    settingsSLMG.guilds.forEach(guild => {
        let obj = conf.defaults.guildObject;
        obj.usersEnabled = [];
        obj.channels = [];
        obj.id = guild.id;
        obj.enabled = guild.guild_enable;
        guild.users_enable.forEach((enabled, i) => {
            console.log(enabled);
            if (enabled === true) obj.usersEnabled.push(settingsSL.userIDs[i]);
        });
        settingsSL.guilds.forEach((g, i) => {
            if (g === guild.id) obj.channels.push(settingsSL.channels[i]);
        });
        obj.banList = guild.ban_list;
        console.log(obj);
        fs.writeFile(`./config/streamlink/guilds/${guild.id}.json`, JSON.stringify(obj), (err) => {if (err) throw err });
    });

    settingsSL.userIDs.forEach((id, index) => {
        let obj = conf.defaults.userObject;
        obj.id = id;
        obj.name = settingsSL.userNames[index];
        obj.stream = settingsSL.topics[index];
        obj.status = settingsSL.stream_status[index];
        obj.game = settingsSL.stream_game[index];
        obj.lastBroadcast = settingsSL.last_broadcast[index];
        console.log(obj);
        fs.writeFile(`./config/streamlink/users/${id}.json`, JSON.stringify(obj), (err) => {if (err) throw err });
    });

    message.reply('Done!');

}

exports.conf = {
    enabled: false,
    visible: false,
    guildOnly: false,
    textChannelOnly: true,    
    aliases: [],
    permLevel: 4
};

exports.help = {
    name: 'slbuild',
    description: `For testing purposes.`,
    usage: 'slbuild'
};