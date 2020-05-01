const { expect } = require('chai');
const sinon = require('sinon');

const EventLoader = require('../../handlers/EventLoader');

const testBot = {
  on: sinon.spy(),
};
const settings = {};

describe('Handlers', () => {
  describe('Event Loader', () => {
    it('loads necessary event handlers', () => {
      EventLoader(testBot, settings);

      expect(testBot.on.callCount).to.equal(11);
      expect(testBot.on.calledOnceWith('ready')).to.equal(true);
    });
  });
});
