/**
 * @func !food
 *
 * @desc Random post or image from the front pages of /r/food & /r/FoodPorn
 */

const feed = require('feed-read-parser');

exports.help = {
  name: 'food',
  description: 'Delicious images from the front pages of /r/food & /r/FoodPorn',
  usage: 'food',
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
  /* eslint-disable */
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
  const URL = 'https://www.reddit.com/r/food/.rss';
  const URL2 = 'https://www.reddit.com/r/foodporn/.rss';
  const images = [];
  const titles = [];
  const links = [];

  feed(URL, (err, articles1) => {
    if (err) throw err;
    articles1.forEach((article, index) => {
      if (index > 0 && article.content.includes('img src')) {
        images.push(getImg(article.content, 'a', 'href')[2]);
        titles.push(article.title);
        links.push(article.link);
      }
    });
    feed(URL2, (err2, articles2) => {
      if (err2) throw err2;
      articles2.forEach((article, index) => {
        if (index > 0 && article.content.includes('img src')) {
          images.push(getImg(article.content, 'a', 'href')[2]);
          titles.push(article.title);
          links.push(article.link);
        }
      });
      const rng = Math.floor(Math.random() * images.length);
      message.channel.send(`**${titles[rng]}**\n${images[rng]}\n<${links[rng]}>`);
    });
  });
};
