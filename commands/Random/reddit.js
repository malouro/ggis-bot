/**
 * @func !reddit
 *
 * @desc Random post from a given subreddit
 */

const feed = require('feed-read-parser');

exports.help = {
  name: 'reddit',
  description: 'Random post from the front-page of a specified subreddit',
  usage: 'reddit <subreddit>',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: ['r'],
  permLevel: 0,
};

const getImg = (str, node, attr) => {
  const regex = new RegExp(`<${node} .*?${attr}="(.*?)">`, 'gi');
  let result;
  const res = [];
  /* eslint-disable */
  while ((result = regex.exec(str))) {
    res.push(result[1]);
  }
  /* eslint-enable */
  return res;
};

exports.run = (bot, message, args) => {
  /**
   * Each article has the following properties:
   *
   * "title"     - The article title (String).
   * "author"    - The author's name (String).
   * "link"      - The original article link (String).
   * "content"   - The HTML content of the article (String).
   * "published" - The date that the article was published (Date).
   * "feed"      - {name, source, link}
   */
  if (!args[1]) return message.reply('You must specify a subreddit to search!');

  const url = `https://www.reddit.com/r/${args[1].toLowerCase()}/.rss`;
  feed(url, (err, articles) => {
    if (err) throw err;

    const links = [];
    const titles = [];
    const authors = [];
    const images = [];

    articles.forEach((article) => {
      titles.push(article.title);
      authors.push(article.author);
      links.push(article.link);
      if (article.content.includes('img src')) {
        images.push(getImg(article.content, 'a', 'href')[2]);
      } else {
        images.push('');
      }
    });

    if (articles.length === 0) {
      return message.reply(`Oops! The subreddit **/r/${args[1]}** is either empty or non-existent. :(`);
    }

    const rng = Math.floor(Math.random() * links.length);

    if (images[rng] === '') return message.channel.send(`**${titles[rng]}** posted by ${authors[rng]}\n${links[rng]}`);
    return message.channel.send(`**${titles[rng]}** posted by ${authors[rng]}\n${images[rng]}\n<${links[rng]}>`);
  });

  return 0;
};
