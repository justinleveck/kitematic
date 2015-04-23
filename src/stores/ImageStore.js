import alt from '../alt';
import imageActions from '../actions/ImageActions';

class ImageStore {
  constructor () {
    this.bindActions(imageActions);
    this.images = {};
  }

  onImages (images) {
    this.images = images;
  }

  image (repo, tag) {
    tag = tag || 'latest';
    if (!repo) {
      return null;
    }
    return this.images[repo + ':' + tag] || null;
  }
}

export default alt.createStore(ImageStore);
