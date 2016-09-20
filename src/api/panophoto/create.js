/* eslint-disable no-param-reassign */

import { getDataAttribute, setDataAttribute } from 'lib/dom';
import execute from 'lib/utils/execute';
import PanophotoPlayer from './PanophotoPlayer';
import optimizeMobile from '../common/optimizeMobile';
import getMedia from '../common/getMedia';

function setRootStyle(root, style) {
  // TODO: How to pass the no-param-reassign rule from eslint ?
  root.style.width = `${style.width}px`;
  root.style.height = `${style.height}px`;
  root.style.cursor = 'pointer';
}

export default function create(params, callback) {
  let root;
  let mediaId;
  let width;
  let height;

  // TODO: Check params.root is DOM element instead of just check it is defined
  if (params.root) {
    root = params.root;
    // TODO: types & values check for attributes
    mediaId = getDataAttribute(root, 'id');
    width = getDataAttribute(root, 'width');
    height = getDataAttribute(root, 'height');
  } else {
    root = document.createElement('DIV');
    // TODO: types & values check for parameters
    mediaId = params.id;
    width = params.width;
    height = params.height;
    setDataAttribute(root, 'id', params.id);
    setDataAttribute(root, 'width', params.width);
    setDataAttribute(root, 'height', params.height);
  }

  getMedia(mediaId).then((media) => {
    setRootStyle(root, { width, height });

    const player = new PanophotoPlayer({
      container: root,
      // TODO: fit new api format to construct photosSrcUrl
      photosSrcUrl: media.media.srcTiledImages,
      direction: media.dimension.direction,
    });
    optimizeMobile(root);
    execute(callback, null, {
      root,
      start: player.start,
      stop: player.stop,
    });
  }).catch((err) => {
    execute(callback, err);
  });
}
