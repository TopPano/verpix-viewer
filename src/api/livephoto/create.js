import isDom from 'is-dom';
import isString from 'lodash/isString';

import { getDataAttribute, setDataAttribute } from 'lib/dom';
import execute from 'lib/utils/execute';
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

export default function create(source, {
  width,
  height,
}, callback) {
  let root;
  let mediaId;

  if (isDom(source)) {
    // Source is a dom element, just use it.
    root = source;
    mediaId = getDataAttribute(root, 'id');
  } else if (isString(source)) {
    // Source is a string, use it as media ID.
    root = document.createElement('DIV');
    mediaId = source;
    setDataAttribute(root, 'id', source);
    setDataAttribute(root, 'width', width);
    setDataAttribute(root, 'height', height);
  } else {
    execute(
      callback,
      new Error('Required argument `source` must be DOM element, string or array of string'
    ));
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
    execute(callback, null, {
      root,
      start: player.start,
      stop: player.stop,
    });
  }).catch((err) => {
    execute(callback, err);
  });
}
