/* eslint-disable no-param-reassign */

import isDom from 'is-dom';
import isString from 'lodash/isString';
import sortBy from 'lodash/sortBy';

import {
  getDataAttribute,
  setDataAttribute,
} from 'lib/dom';
import { CREATE_METHOD } from 'constants/common';
import {
  isArrayOfString,
  execute,
} from 'lib/utils';
import createContainer from './createContainer';
import PanophotoPlayer from './PanophotoPlayer';
import optimizeMobile from '../common/optimizeMobile';
import getMedia from '../common/getMedia';

function setWrapperDimension(root, width, height) {
  const wrapperRatio = Math.round((height / width) * 100);

  // TODO: How to pass the no-param-reassign rule from eslint ?
  root.style.width = `${width}px`;
  root.firstChild.style.paddingBottom = `${wrapperRatio}%`;
}

function createInstance({
  root,
  photosSrcUrl,
  width,
  height,
  initialLat,
  initialLng,
  callback,
}) {
  const container = createContainer(root, width, height);

  const player = new PanophotoPlayer({
    container,
    photosSrcUrl,
    width,
    height,
    initialLat,
    initialLng,
  });
  optimizeMobile(root);
  execute(callback, null, {
    root,
    start: player.start,
    stop: player.stop,
    getCurrentCoordinates: player.getCurrentCoordinates,
    getCurrentSnapshot: player.getCurrentSnapshot,
    setPhotos: player.setPhotos,
    setVisibleSize: (w, h) => {
      setWrapperDimension(root, w, h);
      player.setDimension(w, h);
    },
  });
}

export default function create(source, params, callback) {
  let createMethod = CREATE_METHOD.OTHERS;
  let root;
  let mediaId;
  let width;
  let height;
  let photosSrcUrl;
  let initialLat;
  let initialLng;

  if (isDom(source)) {
    // Source is a dom element, just use it.
    createMethod = CREATE_METHOD.DOM;
    root = source;
    // TODO: types & values check for attributes
    mediaId = getDataAttribute(root, 'id');
    width = getDataAttribute(root, 'width');
    height = getDataAttribute(root, 'height');
    initialLat = getDataAttribute(root, 'initial-lat');
    initialLng = getDataAttribute(root, 'initial-lng');
  } else if (isString(source)) {
    // Source is a string, use it as media ID.
    createMethod = CREATE_METHOD.ID;
    root = document.createElement('DIV');
    mediaId = source;
    // TODO: types & values check for parameters
    width = params.width;
    height = params.height;
    initialLat = params.initialLat;
    initialLng = params.initialLng;
    setDataAttribute(root, 'id', params.id);
    setDataAttribute(root, 'width', params.width);
    setDataAttribute(root, 'height', params.height);
  } else if (isArrayOfString(source) && source.length > 0) {
    // Source is an array of string, use a as photos source urls.
    createMethod = CREATE_METHOD.PHOTOS_URLS;
    photosSrcUrl = source;
    root = document.createElement('DIV');
    // TODO: types & values check for parameters
    width = params.width;
    height = params.height;
    initialLat = params.initialLat;
    initialLng = params.initialLng;
    setDataAttribute(root, 'width', params.width);
    setDataAttribute(root, 'height', params.height);
  }

  if (createMethod === CREATE_METHOD.DOM || createMethod === CREATE_METHOD.ID) {
    getMedia(mediaId).then((media) => {
      photosSrcUrl = sortBy(media.media.srcTiledImages, (img) => {
        const subIndex = img.srcUrl.indexOf('equirectangular');
        return img.srcUrl.slice(subIndex);
      });
      createInstance({
        root,
        // TODO: fit new api format to construct photosSrcUrl
        photosSrcUrl: media.media.srcTiledImages,
        width,
        height,
        initialLat,
        initialLng,
        callback,
      });
    }).catch((err) => {
      execute(callback, err);
    });
  } else if (createMethod === CREATE_METHOD.PHOTOS_URLS) {
    createInstance({
      root,
      photosSrcUrl,
      width,
      height,
      initialLat,
      initialLng,
      callback,
    });
  } else {
    execute(
      callback,
      new Error('Required argument `source` must be DOM element, string or array of string')
    );
  }
}
