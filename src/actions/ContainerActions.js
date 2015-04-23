import alt from '../alt';
import docker from '../utils/DockerUtil';

class ContainerActions {
  constructor () {
    this.generateActions(
      'containerUpdate',
      'containerRename',
      'containerDestroy'
    );
  }

  create (repo, tag, name) {
    tag = tag || 'latest';
    let image = repo + ':' + tag;

    this.dispatch({
      Name: name,
      Image: image,
      Config: {
        Image: image,
      },
      State: {
        Creating: true
      }
    });

    docker.client().createContainer({name: name, Image: image}, (err) => {
      if (err) {
        // TODO (jeffdm): handle an error
        return;
      }
    });
  }

  update (name, data) {
    // short circuit

    // TODO (jeffdm): mute
  }

  rename (name) {
    // short circuit
  }

  restart (name) {
    // short circuit
  }

  destroy (name) {
    // short circuit
  }
}

export default alt.createActions(ContainerActions);
