import alt from '../alt';
import docker from '../utils/DockerUtil';

class DockerActions {
  constructor () {
    this.generateActions(
      'containers',
      'containerRun'
    );
  }

  destroy () {

  }
}

export default alt.createActions(ContainerActions);
