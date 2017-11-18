// =====================================================================================
//                              ! food command
// =====================================================================================
// Gives a random front-page image/post from reddit.com/r/food or /r/FoodPorn

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

    const URL = 'https://www.reddit.com/r/food/.rss';
    const URL2= 'https://www.reddit.com/r/foodporn/.rss';
    var images = [], titles = [], links = [];

    feed(URL, (err, articles) => {
        if (err) throw err;
        articles.forEach((article, index) => {
            if (index > 0 && article.content.includes('img src')) {
                let tmp = getImg(article.content, 'a', 'href');
                images.push(tmp[2]);
                titles.push(article.title);
                links.push(article.link);
            }
        });
        feed(URL2, (err2, articles) => {
            if (err2) throw err2;
            articles.forEach((article, index) => {
                if (index > 0 && article.content.includes('img src')) {
                    let tmp = getImg(article.content, 'a', 'href');
                    images.push(tmp[2]);
                    titles.push(article.title);
                    links.push(article.link);
                }
            });
            let rng = Math.floor(Math.random() * images.length);
            message.channel.send(`**${titles[rng]}**\n${images[rng]}\n<${links[rng]}>`);
        });    
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
    name: 'food',
    description: `Delicious images from the front pages of /r/food & /r/FoodPorn`,
    usage: 'food'
};