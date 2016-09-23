import isDom from 'is-dom';
import isString from 'lodash/isString';

import { CREATE_METHOD, DIRECTION } from 'constants/common';
import { getDataAttribute, setDataAttribute } from 'lib/dom';
import execute from 'lib/utils/execute';
import optimizeMobile from '../common/optimizeMobile';
import getMedia from '../common/getMedia';
import isArrayOfString from './isArrayOfString';
import isArrayOfImageData from './isArrayOfImageData';
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

function createInstance(root, container, photosSrcUrl, action, callback) {
  const player = new LivephotoPlayer({
    container,
    photosSrcUrl,
    direction: action,
  });
  optimizeMobile(root);
  execute(callback, null, {
    root,
    start: player.start,
    stop: player.stop,
    setPhotos: player.setPhotos,
  });
}

export default function create(source, {
  width,
  height,
  action,
}, callback) {
  let createMethod = CREATE_METHOD.OTHERS;
  let root;
  let mediaId;
  let photosSrcUrl;
  let photosData;

  if (isDom(source)) {
    // Source is a dom element, just use it.
    createMethod = CREATE_METHOD.DOM;
    root = source;
    mediaId = getDataAttribute(root, 'id');
  } else if (isString(source)) {
    // Source is a string, use it as media ID.
    createMethod = CREATE_METHOD.ID;
    root = source;
    root = document.createElement('DIV');
    mediaId = source;
    // TODO: value types check
    setDataAttribute(root, 'id', source);
    setDataAttribute(root, 'width', width);
    setDataAttribute(root, 'height', height);
  } else if (isArrayOfString(source) && source.length > 0) {
    // Source is an array of string, use a as photos source urls.
    createMethod = CREATE_METHOD.PHOTOS_URLS;
    photosSrcUrl = source;
    root = document.createElement('DIV');
    // TODO: value types check
    setDataAttribute(root, 'width', width);
    setDataAttribute(root, 'height', height);
  } else if (isArrayOfImageData(source) && source.length > 0) {
    // Source is an array of ImageData, use a as photosData in LivephotoPlayer.
    createMethod = CREATE_METHOD.PHOTOS_DATA;
    photosData = source;
    root = document.createElement('DIV');
    // TODO: value types check
    setDataAttribute(root, 'width', width);
    setDataAttribute(root, 'height', height);
  }

  if (createMethod === CREATE_METHOD.DOM || createMethod === CREATE_METHOD.ID) {
    // Fetch media data from remote API
    getMedia(mediaId).then((media) => {
      const { content } = media;
      // TODO: Dynamically choose quality
      const selectedQuality = content.quality[0];
      const origDimension = getOriginalDimension(selectedQuality);
      const wrapperDimension = getWrapperDimension(root, origDimension);
      const container = createCanvas(root, origDimension, wrapperDimension);

      photosSrcUrl = constructPhotoUrls(mediaId, content, selectedQuality);
      createInstance(root, container, photosSrcUrl, media.dimension.action, callback);
    }).catch((err) => {
      execute(callback, err);
    });
  } else if (createMethod === CREATE_METHOD.PHOTOS_URLS) {
    // Get photo dimension from URL.
    // We assume that all photos have the same dimension.
    const img = new Image();

    img.onload = () => {
      const origDimension = {
        width: img.width,
        height: img.height,
      };
      const wrapperDimension = getWrapperDimension(root, origDimension);
      const container = createCanvas(root, origDimension, wrapperDimension);

      createInstance(
        root,
        container,
        photosSrcUrl,
        action === DIRECTION.VERTICAL ? DIRECTION.VERTICAL : DIRECTION.HORIZONTAL,
        callback
      );
    };
    img.onerror = (e) => {
      // TODO: e is an event not error, please handle such error more accurately
      callback(execute, e);
    };
    img.src = photosSrcUrl[0];
  } else if (createMethod === CREATE_METHOD.PHOTOS_DATA) {
    // Get photo dimension from ImageData.
    // We assume that all photos have the same dimension.
    const origDimension = {
      width: photosData[0].width,
      height: photosData[0].height,
    };
    const wrapperDimension = getWrapperDimension(root, origDimension);
    const container = createCanvas(root, origDimension, wrapperDimension);

    const player = new LivephotoPlayer({
      container,
      photos: photosData,
      direction: DIRECTION.VERTICAL ? DIRECTION.VERTICAL : DIRECTION.HORIZONTAL,
    });
    optimizeMobile(root);
    execute(callback, null, {
      root,
      start: player.start,
      stop: player.stop,
      setPhotos: player.setPhotos,
    });
  } else {
    execute(
      callback,
      new Error('Required argument `source` must be DOM element, string or array of string'
    ));
  }
}
