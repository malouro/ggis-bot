const path = require('path');
const { config } = require('dotenv');

const baseJestConfig = require('../../package.json').jest;

config({ path: path.resolve(__dirname, '../../.env.test') });

require('dotenv').config({
  path: '.env.test',
});

module.exports = Object.assign(baseJestConfig, {
  setupFilesAfterEnv: ['<rootDir>/../setupTests.js', '<rootDir>/setupE2E.js'],
  testMatch: ['<rootDir>/suite/**/*.test.{t,j}s?(x)'],
  transform: { '\\.coffee$': '<rootDir>/../coffee-processor.js' },
});
