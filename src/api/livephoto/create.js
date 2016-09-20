import isFunction from 'lodash/isFunction';

import { getDataAttribute, setDataAttribute } from 'lib/dom';
import optimizeMobile from '../common/optimizeMobile';
import getMedia from '../common/getMedia';
import createCanvas from './createCanvas';
import constructPhotoUrls from './constructPhotoUrls';
import LivephotoPlayer from './LivephotoPlayer';

function getOriginalDimension(quality) {
  return {
    width: parseInt(quality.split('X')[0], 10),
    height: parseInt(quality.split('X')[1], 10),
  };
}

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
  let mediaId;

  // TODO: Check params.root is DOM element instead of just check it is defined
  if (params.root) {
    root = params.root;
    mediaId = getDataAttribute(root, 'id');
  } else {
    root = document.createElement('DIV');
    // TODO: types & values check for parameters
    mediaId = params.id;
    setDataAttribute(root, 'id', params.id);
    setDataAttribute(root, 'width', params.width);
    setDataAttribute(root, 'height', params.height);
  }

  getMedia(mediaId).then((media) => {
    const { content, dimension } = media;
    // TODO: Dynamically choose quality
    const selectedQuality = content.quality[0];
    const origDimension = getOriginalDimension(selectedQuality);
    const wrapperDimension = getWrapperDimension(root, origDimension);
    const photosSrcUrl = constructPhotoUrls(mediaId, content, selectedQuality);
    const container = createCanvas(root, media.dimension, wrapperDimension);

    const player = new LivephotoPlayer({
      container,
      photosSrcUrl,
      direction: dimension.direction,
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
