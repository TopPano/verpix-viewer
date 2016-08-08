import isFunction from 'lodash/isFunction';

import config from 'config';
import { getDataAttribute, setDataAttribute } from 'lib/dom';
import createCanvas from './createCanvas';
import getPost from './getPost';
import LivephotoPlayer from './LivephotoPlayer';
import optimizeMobile from './optimizeMobile';

const API_ROOT = config.apiRoot;

function getWrapperDimension(root, origDimension) {
  let width = origDimension.width;
  let height = origDimension.height;
  const custWidth = getDataAttribute(root, 'width');
  const custHeight = getDataAttribute(root, 'height');

  if (custWidth && custHeight) {
    width = custWidth;
    height = custHeight;
  } else if (custWidth) {
    width = custWidth;
    height = Math.round(origDimension.height * (custWidth / origDimension.width));
  } else if (custHeight) {
    width = Math.round(origDimension.width * (custHeight / origDimension.height));
    height = custHeight;
  }

  return {
    width,
    height,
  };
}

export default function create(params, callback) {
  let root;
  let postId;

  // TODO: Check params.root is DOM element instead of just check it is defined
  if (params.root) {
    root = params.root;
    postId = getDataAttribute(root, 'id');
  } else {
    root = document.createElement('DIV');
    // TODO: types & values check for parameters
    postId = params.id;
    setDataAttribute(root, 'id', params.id);
    setDataAttribute(root, 'width', params.width);
    setDataAttribute(root, 'height', params.height);
  }

  const url = `${API_ROOT}/posts/${postId}`;
  getPost(url).then((post) => {
    const wrapperDimension = getWrapperDimension(root, post.dimension);
    const container = createCanvas(root, post.dimension, wrapperDimension);

    const player = new LivephotoPlayer({
      container,
      photosSrcUrl: post.media.srcHighImages,
      direction: post.dimension.direction,
    });
    optimizeMobile(root);
    if (isFunction(callback)) {
      callback(null, {
        root,
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
