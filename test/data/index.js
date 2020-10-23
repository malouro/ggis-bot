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
  },
};
