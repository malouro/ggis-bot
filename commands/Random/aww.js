// =====================================================================================
//                              ! aww command
// =====================================================================================
// Gives a random front-page image/post from reddit.com/r/aww

const moment = require('moment-timezone');
const feed = require('feed-read-parser');

exports.run = (bot, message, args) => {
    // -------------------------------------------------------------------
    // Each article has the following properties:
    //   * "title"     - The article title (String).
    //   * "author"    - The author's name (String).
    //   * "link"      - The original article link (String).
    //   * "content"   - The HTML content of the article (String).
    //   * "published" - The date that the article was published (Date).
    //   * "feed"      - {name, source, link}
    // -------------------------------------------------------------------

    const URL = 'https://www.reddit.com/r/aww/.rss';
    feed(URL, function (err, articles) {
        if (err) throw err;
        let images = [], titles = [];
        articles.forEach((article, index) => {
            if (index > 0 && article.content.includes('img src')) {
                images.push(getImg(article.content, 'a', 'href')[2]);
                titles.push(article.title);
            }
        });
        let rng = Math.floor(Math.random() * images.length);
        message.channel.send(`**${titles[rng]}**\n ${images[rng]}`);
    });
}

function getImg(str, node, attr) {
    var regex = new RegExp('<'+node+' .*?'+attr+'="(.*?)">', "gi")
    var result, res = [];
    while ((result = regex.exec(str))) {
        res.push(result[1]);
    }
    return res;
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: [],
    permLevel: 0
};

exports.help = {
    name: 'aww',
    description: `Random, cute & cuddly image from the front page of /r/aww`,
    usage: 'aww'
};