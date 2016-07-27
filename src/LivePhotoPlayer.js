import fill from 'lodash/fill';
import isFunction from 'lodash/isFunction';
import inRange from 'lodash/inRange';

import { DIRECTION } from 'constants/common';
import LIVEPHOTO_DEFAULT from 'constants/livephoto';
import EVENTS from 'constants/events';
import { isMobile } from 'lib/devices';
import { getPosition, getX, getY } from 'lib/events/click';
import Gyro from './Gyro';

export default class LivePhotoPlayer {
  constructor(params) {
    // Read only member variables
    this.container = params.container;
    this.photosSrcUrl = params.photosSrcUrl;
    this.numPhotos = this.photosSrcUrl.length;
    this.direction = params.dimension.direction;
    this.pixelStepDistance =
      this.direction === DIRECTION.HORIZONTAL ?
      (params.dimension.width * LIVEPHOTO_DEFAULT.SWIPE_RANGE) / this.numPhotos :
      (params.dimension.height * LIVEPHOTO_DEFAULT.SWIPE_RANGE) / this.numPhotos;

    // Writable member variables
    this.photos = fill(Array(this.numPhotos), null);
    this.curPhoto = -1;
    this.lastPixel = null;
    this.lastRotation = null;
  }

  start() {
    const startIndex = Math.round(this.numPhotos / 2);
    this.loadPhoto(startIndex, this.startAnimation.bind(this, startIndex));
    this.loadPhotos(startIndex - 1, -1, -500);
    this.loadPhotos(startIndex + 1, this.numPhotos, 500);
  }

  loadPhoto(index, callback) {
    const img = new Image();
    img.src = this.getPhotoSrc(index);
    img.onload = () => {
      this.photos[index] = img;
      if (callback && isFunction(callback)) {
        callback();
      }
    };
  }

  loadPhotos(start, end, step) {
    if (step > 0 && start < end) {
      let curIndex = start;
      for (;(curIndex < start + step) && (curIndex < end); curIndex++) {
        /*
        const callback = () => {
          if (curIndex < end) {
            this.loadPhoto(curIndex, callback);
          }
          curIndex++;
        };
        this.loadPhoto(curIndex, callback);
        */
        this.loadPhoto(curIndex);
      }
    } else if (step < 0 && start > end) {
      let curIndex = start;
      for (;(curIndex > start + step) && (curIndex > end); curIndex--) {
        /*
        const callback = () => {
          if (curIndex > end) {
            this.loadPhoto(curIndex, callback);
          }
          curIndex--;
        };
        this.loadPhoto(curIndex, callback);
        */
        this.loadPhoto(curIndex);
      }
    }
  }

  getPhotoSrc(index) {
    return (
      inRange(index, this.numPhotos) ?
      this.photosSrcUrl[index].downloadUrl :
      ''
    );
  }

  startAnimation(startIndex) {
    this.renderPhoto(startIndex);
    this.container.addEventListener(EVENTS.CLICK_START, this.handleTransitionStart);
    this.container.addEventListener(EVENTS.CLICK_MOVE, this.handleTransitionMove);
    if (isMobile()) {
      new Gyro(this.onRotation).start();
    }
  }

  renderPhoto(index) {
    if (this.photos[index] && this.curPhoto !== index) {
      this.curPhoto = index;
      const container = this.container;
      const ctx = container.getContext('2d');
      const img = this.photos[index];
      ctx.drawImage(img, 0, 0, container.width, container.height);
    }
  }

  renderPhotoByDelta(delta) {
    let newPhoto = this.curPhoto + delta;

    if (delta < 0 && newPhoto < 0) {
      newPhoto = 0;
    } else if (delta > 0 && newPhoto >= this.numPhotos) {
      newPhoto = this.numPhotos - 1;
    }
    this.renderPhoto(newPhoto);
  }

  onRotation = (rotation) => {
    if (rotation && this.lastRotation) {
      const rotationDelta =
        this.direction === DIRECTION.HORIZONTAL ?
        rotation.x - this.lastRotation.x :
        rotation.y - this.lastRotation.y;
      const indexDelta =
        Math.round(this.numPhotos * (rotationDelta / LIVEPHOTO_DEFAULT.ROTATION_RANGE));
      if (indexDelta !== 0) {
        this.renderPhotoByDelta(indexDelta);
      }
    }
    this.lastRotation = rotation;
  }

  handleTransitionStart = (e) => {
    if (this.isLeftBtnPressed(e)) {
      this.lastPixel = getPosition(e);
    }
  }

  handleTransitionMove = (e) => {
    // Left button is clicked.
    if (this.isLeftBtnPressed(e)) {
      const lastPixel = this.lastPixel;
      const curX = getX(e);
      const curY = getY(e);
      if (lastPixel) {
        const pixelDelta =
            this.direction === DIRECTION.HORIZONTAL ?
          curX - lastPixel.x :
          curY - lastPixel.y;
        const indexDelta = Math.round(pixelDelta / this.pixelStepDistance);
        this.renderPhotoByDelta(indexDelta);
      }
      this.lastPixel = { x: curX, y: curY };
    }
  }

  isLeftBtnPressed(e) {
    return (
      isMobile() ?
      true :
      (e.which && e.button === 0) || (e.button && e.button === 0)
    );
  }
}
