const sql = require('sqlite');
const reactions = './db/reactions.sqlite';

exports.run = (bot, message, args) => {
    try {
        // Weekly SQL reaction database
        sql.open(reactions).then().catch(err => console.log(err));
        sql.each(`SELECT * FROM reactions`, [], (err, row) => {
            if (err) { throw err; return; }
            console.log('selection from reactions');
            console.log(row);
            sql.run(`UPDATE reactionsAllTime SET count = count + ${row.count} WHERE emojiIdentifier = "${row.emojiIdentifier}"`).then(() => {
                sql.run(`INSERT INTO reactionsAllTime(emoji, emojiIdentifier, count) SELECT "${row.emoji}", "${row.emojiIdentifier}", ${row.count} WHERE NOT EXISTS(SELECT 1 FROM reactionsAllTime WHERE emojiIdentifier = "${row.emojiIdentifier}")`)
                    .then(() => {})
                    .catch(err => {console.log(err);});
            }).catch(err => {
                sql.run("CREATE TABLE IF NOT EXISTS reactionsAllTime AS SELECT * FROM reactions").then(() => {
                    console.log('duped table'); return;
                }).catch(err => console.log(err));
            });
        });

        let maxFetch = 10; let ac = 0;
        let str = '__**Emoji Weekly Top 10**__\n';
        sql.each(`SELECT * FROM reactions ORDER BY count DESC`, [], (err, row) => {
            if (err) { throw err; }
            if (ac < maxFetch) {
                if (row.emojiIdentifier.startsWith('%')) { str += `${row.emoji}     ${row.count} uses\n`; }
                else { str += `<:${row.emojiIdentifier}>     ${row.count} uses\n`; }
                ac++;
            }
        }).then(() => {
            message.channel.send(str);
        }).catch(err => console.log(err));
        sql.close().then().catch(console.error);
    } catch (err) {
        console.log(err);
    }
};

exports.conf = {
    enabled: false,
    visible: false,
    guildOnly: false,
    aliases: [],
    permLevel: 4
};

exports.help = {
    name: 'weeklytest',
    description: `For testing purposes.`,
    usage: 'weeklytest'
};