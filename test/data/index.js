/** @type {import('../../commands/Useful/settings').ServerSettings} */
exports.serverSettings = {
  test: {
    range: {
      type: 'range',
      min: 0,
      max: 10,
      default: 0,
      description: 'Some number within this range',
    },
    number: {
      type: 'number',
    },
    integer: {
      type: 'integer',
    },
    boolean: {
      type: 'boolean',
    },
    string: {
      type: 'string',
    },
    textChannel: {
      type: 'textChannel',
    },
    user: {
      type: 'user',
    },
    arrayOfStrings: {
      type: 'array',
      innerType: 'string',
      description: 'An array of strings',
    },
    arrayOfNumbers: {
      type: 'array',
      innerType: 'number',
      description: 'An array of numbers',
    },
    arrayOfRanges: {
      type: 'array',
      innerType: 'range',
      min: 1,
      max: 10,
      description: 'An array of ranges',
    },
    arrayOfBooleans: {
      type: 'array',
      innerType: 'boolean',
      description: 'An array of booleans',
    },
    arrayOfTextChannels: {
      type: 'array',
      innerType: 'textChannel',
      description: 'An array of text channels',
    },
    arrayOfUsers: {
      type: 'array',
      innerType: 'user',
      description: 'An array of users',
    },
  },
};
