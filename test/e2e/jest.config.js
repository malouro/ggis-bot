const path = require('path');
const { config } = require('dotenv');

const baseJestConfig = require('../../package.json').jest;

config({ path: path.resolve(__dirname, '../../.env.test') });

require('dotenv').config({
  path: '.env.test',
});

module.exports = Object.assign(baseJestConfig, {
  setupFilesAfterEnv: [...baseJestConfig.setupFilesAfterEnv, '<rootDir>/setupE2E.js'],
  testMatch: ['<rootDir>/suite/**/*.test.{t,j}s?(x)'],
});
