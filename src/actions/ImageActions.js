import alt from '../alt';
import docker from '../utils/DockerUtil';

class ImageActions {
  constructor () {
    this.generateActions(
      'images',
      'imagePull',
      'imagePullBlock',
      'imagePullProgress',
      'imagePullFinish'
    );
  }

  run (repo, tag, name) {
    docker.run(repo, tag, name, (err) => {
      if (err) {
        // TODO (jeffdm): handle errors
        return;
      }
      this.actions.imagePullFinish({repo, tag});
    }, (progress) => {
      // progress
      this.actions.imagePullProgress({repo, tag, progress});
    }, () => {
      // blocked
      this.actions.imagePullBlock({repo, tag});
    });
  }
}

export default alt.createActions(ImageActions);
