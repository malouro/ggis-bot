const mockConsole = require('jest-mock-console').default;

const restoreConsole = process.env.DEBUG ? () => {} : mockConsole();

global.afterAll(() => restoreConsole());
global.BOT_SETUP_DONE = false;
