import _ from 'underscore';
import alt from '../alt';
import containerActions from '../actions/ContainerActions';

class ContainerStore {
  constructor () {
    this.bindActions(containerActions);
    this.containers = [];
  }

  onContainers (containers) {
    this.containers = containers;
  }

  static generateName (repo) {
    var base = _.last(repo.split('/'));
    var count = 1;
    var name = base;
    while (true) {
      if (!_.findWhere(this.containers, (container) => container.Name === name)) {
        return name;
      } else {
        count++;
        name = base + '-' + count;
      }
    }
  }
}

export default alt.createStore(ContainerStore);
