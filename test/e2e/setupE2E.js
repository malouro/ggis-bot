const { config } = require('dotenv');
const path = require('path');
// const mockConsole = require('jest-mock-console').default;

if (process.env.CI !== 'true') {
  config({ path: path.resolve(__dirname, '../../.env.test') });
}

// const restoreConsole = mockConsole();

// global.afterAll(() => restoreConsole());

global.ALL_CLEAR = false;
