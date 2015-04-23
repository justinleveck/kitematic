import containerStore from './ContainerStore';
var expect = require('chai').expect;

describe('ContainerStore', () => {
  it('initializes an empty list of containres', () => {
    expect(containerStore.getState().containers).to.eql([]);
  });

  it('generates a name', () => {
    expect(containerStore.generateName('nginx')).to.eql('nginx');
  });
});
