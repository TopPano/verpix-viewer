import forEach from 'lodash/forEach';

import config from 'config';
import createCanvas from './createCanvas';
import getPost from './getPost';
import LivePhotoPlayer from './LivePhotoPlayer';
import optimizeMobile from './optimizeMobile';
import getDataAttribute from './getDataAttribute';

const API_ROOT = config.apiRoot;

function getCustomizedDimension(wrapper, origDimension) {
  let width = origDimension.width;
  let height = origDimension.height;
  const custWidth = getDataAttribute(wrapper, 'width');
  const custHeight = getDataAttribute(wrapper, 'height');

  if (custWidth !== null && custHeight !== null) {
    width = custWidth;
    height = custHeight;
  } else if (custWidth !== null) {
    width = custWidth;
    height = Math.round(origDimension.height * (custWidth / origDimension.width));
  } else if (custHeight !== null) {
    width = Math.round(origDimension.width * (custHeight / origDimension.height));
    height = custHeight;
  }

  return {
    width,
    height,
  };
}

function createLivephoto(wrapper, postId) {
  const url = `${API_ROOT}/posts/${postId}`;
  getPost(url).then((post) => {
    const dimension = getCustomizedDimension(wrapper, post.dimension);
    const container = createCanvas(wrapper, dimension.width, dimension.height);

    new LivePhotoPlayer({
      container,
      photosSrcUrl: post.media.srcHighImages,
      dimension: post.dimension,
    }).start();
    optimizeMobile(wrapper);
  }).catch(() => {
    // TODO: Error handling
  });
}

window.addEventListener('load', () => {
  // Define global variable "verpix"
  window.verpix = {
    createLivephoto,
  };

  const wrappers = document.getElementsByClassName('verpix-livephoto');
  forEach(wrappers, (wrapper) => {
    const postId = getDataAttribute(wrapper, 'id');
    createLivephoto(wrapper, postId);
  });
});
