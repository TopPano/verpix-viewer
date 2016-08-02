import isFunction from 'lodash/isFunction';

import config from 'config';
import createCanvas from './createCanvas';
import getPost from './getPost';
import LivephotoPlayer from './LivephotoPlayer';
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

export default function create(wrapper, callback) {
  const postId = getDataAttribute(wrapper, 'id');
  const url = `${API_ROOT}/posts/${postId}`;
  getPost(url).then((post) => {
    const dimension = getCustomizedDimension(wrapper, post.dimension);
    const container = createCanvas(wrapper, dimension.width, dimension.height);

    new LivephotoPlayer({
      container,
      photosSrcUrl: post.media.srcHighImages,
      dimension: post.dimension,
    }).start();
    optimizeMobile(wrapper);
    if (isFunction(callback)) {
      callback();
    }
  }).catch((err) => {
    if (isFunction(callback)) {
      callback(err);
    }
  });
}
