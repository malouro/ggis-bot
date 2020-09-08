const { config } = require('dotenv');
const path = require('path');

if (process.env.CI !== 'true') {
  config({ path: path.resolve(__dirname, '../../.env.test') });
}

global.ALL_CLEAR = false;
