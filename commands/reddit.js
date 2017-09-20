// =====================================================================================
//                              ! reddit command
// =====================================================================================
// Gives a random front-page post from given subreddit

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

    if (!args[1]) {
        return message.reply('You must specify a subreddit to search!')
    }

    let url = `https://www.reddit.com/r/${args[1].toLowerCase()}/.rss`;
    feed(url, function (err, articles) {
        if (err) throw err;
        let links = [], titles = [], authors = [];
        articles.forEach(article => {
            links.push(article.link);
            authors.push(article.author);
            titles.push(article.title);
        });
        let rng = Math.floor(Math.random() * links.length);
        message.channel.send(`**${titles[rng]}** posted by ${authors[rng]}\n${links[rng]}`);
    });
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    aliases: ['r'],
    permLevel: 0
};

exports.help = {
    name: 'reddit',
    description: `Random post from the front-page of a specified subreddit`,
    usage: 'reddit subreddit'
};