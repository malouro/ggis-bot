/**
 * @func !aww
 *
 * @desc Random front page image/post from /r/aww
 */

const feed = require('feed-read-parser');

exports.help = {
  name: 'aww',
  description: 'Random, cute & cuddly image from the front page of /r/aww',
  usage: 'aww',
};

exports.conf = {
  enabled: true,
  visible: true,
  guildOnly: false,
  textChannelOnly: false,
  aliases: [],
  permLevel: 0,
};

const getImg = (str, node, attr) => {
  const regex = new RegExp(`<${node} .*?${attr}="(.*?)">`, 'gi');
  let result;
  const res = [];
  /* eslint-disable*/
  while ((result = regex.exec(str))) {
    res.push(result[1]);
  }
  /* eslint-enable */
  return res;
};

exports.run = (bot, message) => {
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
  const URL = 'https://www.reddit.com/r/aww/.rss';
  feed(URL, (err, articles) => {
    if (err) throw err;
    const images = [];
    const titles = [];
    articles.forEach((article, index) => {
      if (index > 0 && article.content.includes('img src')) {
        images.push(getImg(article.content, 'a', 'href')[2]);
        titles.push(article.title);
      }
    });
    const rng = Math.floor(Math.random() * images.length);
    message.channel.send(`**${titles[rng]}**\n ${images[rng]}`);
  });
};
