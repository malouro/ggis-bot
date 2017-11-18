// =====================================================================================
//                              ! reddit command
// =====================================================================================
// Gives a random front-page post from given subreddit

const feed   = require('feed-read-parser');
const moment = require('moment-timezone');

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
            titles.push(article.title);
            authors.push(article.author);
            links.push(article.link);
        });

        if (links.length === 0) {
            message.reply(`Oops! The subreddit "**/r/${args[1]}**" is either empty or non-existent. <:FeelsBadMan:230445576133541888>`);
        } else {
            let rng = Math.floor(Math.random() * links.length);
            message.channel.send(`**${titles[rng]}** posted by ${authors[rng]}\n${links[rng]}`);
        }     
    });
}

exports.conf = {
    enabled: true,
    visible: true,
    guildOnly: false,
    textChannelOnly: false,
    aliases: ['r'],
    permLevel: 0
};

exports.help = {
    name: 'reddit',
    description: `Random post from the front-page of a specified subreddit`,
    usage: 'reddit <subreddit>'
};