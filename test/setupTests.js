const mockConsole = require('jest-mock-console').default;

const restoreConsole = process.env.DEBUG ? () => {} : mockConsole();

global.afterAll(() => restoreConsole());
