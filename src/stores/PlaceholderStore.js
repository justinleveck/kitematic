import alt from '../alt';
import containerActions from '../actions/ContainerActions';
import imageActions from '../actions/ImageActions';

class ContainerStore {
  constructor () {
    this.bindActions(imageActions);
    this.placeholders = [];
  }

  containers () {
    return this.containers;
  }

  onImagePull (repo, tag) {
    // Create a placeholder
  }

  onImagePullFinish (repo, tag) {
    // Remove placeholder
  }

  onImagePullBlock (repo, tag) {
    // Update placeholder status
  }

  onImagePullProgress (repo, tag) {
    // Update placeholder progress
  }
}

export default alt.createStore(ContainerStore);
