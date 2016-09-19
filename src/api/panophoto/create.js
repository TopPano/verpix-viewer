/* eslint-disable no-param-reassign */

import isFunction from 'lodash/isFunction';

import { getDataAttribute, setDataAttribute } from 'lib/dom';
import PanophotoPlayer from './PanophotoPlayer';
import optimizeMobile from '../common/optimizeMobile';
import getPost from '../common/getPost';

function setRootStyle(root, style) {
  // TODO: How to pass the no-param-reassign rule from eslint ?
  root.style.width = `${style.width}px`;
  root.style.height = `${style.height}px`;
  root.style.cursor = 'pointer';
}

export default function create(params, callback) {
  let root;
  let postId;
  let width;
  let height;

  // TODO: Check params.root is DOM element instead of just check it is defined
  if (params.root) {
    root = params.root;
    // TODO: types & values check for attributes
    postId = getDataAttribute(root, 'id');
    width = getDataAttribute(root, 'width');
    height = getDataAttribute(root, 'height');
  } else {
    root = document.createElement('DIV');
    // TODO: types & values check for parameters
    postId = params.id;
    width = params.width;
    height = params.height;
    setDataAttribute(root, 'id', params.id);
    setDataAttribute(root, 'width', params.width);
    setDataAttribute(root, 'height', params.height);
  }

  getPost(postId).then((post) => {
    setRootStyle(root, { width, height });

    const player = new PanophotoPlayer({
      container: root,
      photosSrcUrl: post.media.srcTiledImages,
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
