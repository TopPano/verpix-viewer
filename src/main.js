import forEach from 'lodash/forEach';

import createCanvas from './createCanvas';
import getPost from './getPost';
import LivePhotoPlayer from './LivePhotoPlayer';
import optimizeMobile from './optimizeMobile';
import getDataAttribute from './getDataAttribute';

const API_URL = 'https://www.verpix.me/api';

function createLivephoto(wrapper, postId) {
  const url = `${API_URL}/posts/${postId}`;
  getPost(url).then((post) => {
    const width = post.dimension.width;
    const height = post.dimension.height;
    const container = createCanvas(wrapper, width, height);

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
  const wrappers = document.getElementsByClassName('verpix-livephoto');
  forEach(wrappers, (wrapper) => {
    const postId = getDataAttribute(wrapper, 'id');
    createLivephoto(wrapper, postId);
  });
});
