import isFunction from 'lodash/isFunction';

import config from 'config';
import createCanvas from './createCanvas';
import getPost from './getPost';
import LivephotoPlayer from './LivephotoPlayer';
import optimizeMobile from './optimizeMobile';
import getDataAttribute from './getDataAttribute';

const API_ROOT = config.apiRoot;

function getWrapperDimension(root, origDimension) {
  let width = origDimension.width;
  let height = origDimension.height;
  const custWidth = getDataAttribute(root, 'width');
  const custHeight = getDataAttribute(root, 'height');

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

export default function create(root, callback) {
  const postId = getDataAttribute(root, 'id');
  const url = `${API_ROOT}/posts/${postId}`;
  getPost(url).then((post) => {
    const wrapperDimension = getWrapperDimension(root, post.dimension);
    const container = createCanvas(root, post.dimension, wrapperDimension);

    const player = new LivephotoPlayer({
      container,
      photosSrcUrl: post.media.srcHighImages,
      dimension: post.dimension,
    });
    optimizeMobile(root);
    if (isFunction(callback)) {
      callback(null, {
        start: player.start,
        stop: player.stop,
      });
    }
  }).catch((err) => {
    if (isFunction(callback)) {
      callback(err);
    }
  });
}
