/* eslint-disable no-loop-func */

import fill from 'lodash/fill';
import isFunction from 'lodash/isFunction';
import inRange from 'lodash/inRange';
import raf from 'raf';

import { DIRECTION } from 'constants/common';
import { LIVEPHOTO_DEFAULT, PLAY_MODE, AUTO_PLAY_DIR } from 'constants/livephoto';
import EVENTS from 'constants/events';
import { isMobile } from 'lib/devices';
import isHover from 'lib/dom/isHover';
import { getPosition } from 'lib/events/click';
import Gyro from './Gyro';

const AUTO_PLAY_MAGIC_NUMBER = 100;

export default class LivephotoPlayer {
  constructor(params) {
    // Read only member variables
    this.container = params.container;
    this.photosSrcUrl = params.photosSrcUrl;
    this.numPhotos = this.photosSrcUrl.length;
    this.direction = params.dimension.direction;
    this.playThreshold = this.numPhotos * LIVEPHOTO_DEFAULT.PLAY_THRESHOLD;
    this.pixelStepDistance =
      this.direction === DIRECTION.HORIZONTAL ?
      (params.dimension.width * LIVEPHOTO_DEFAULT.SWIPE_RANGE) / this.numPhotos :
      (params.dimension.height * LIVEPHOTO_DEFAULT.SWIPE_RANGE) / this.numPhotos;
    this.thresholdToAutoPlay =
      Math.round(LIVEPHOTO_DEFAULT.MANUAL_TO_AUTO_THRESHOLD / AUTO_PLAY_MAGIC_NUMBER);
    this.thresholdToManualPlay =
      Math.round(LIVEPHOTO_DEFAULT.AUTO_TO_MANUAL_THRESHOLD / AUTO_PLAY_MAGIC_NUMBER);
  }

  // Initialize or reset member variables
  resetMemberVars() {
    this.photos = fill(Array(this.numPhotos), null);
    this.numLoadedPhotos = 0;
    this.isPlayerEnabled = false;
    this.curPhoto = -1;
    this.playMode = PLAY_MODE.NONE;
    this.autoPlayDir = AUTO_PLAY_DIR.STL;
    this.isWaitManualToAuto = false;
    this.manualToAutoTimeout = null;
    this.isWaitAutoToManual = false;
    this.autoToManualIntervl = null;
    this.countToAutoPlay = this.thresholdToAutoPlay;
    this.countToManualPlay = this.thresholdToManualPlay;
    this.lastPixel = null;
    this.curPixel = null;
    this.lastRotation = null;
    this.curRotation = null;
    this.gyro = null;
  }

  start = () => {
    // Writable member variables
    this.resetMemberVars();

    // Start loading and rending photos
    const startIndex = Math.round(this.numPhotos / 2);
    const loadStep = Math.round(LIVEPHOTO_DEFAULT.CONCURRENT_LOADING_PHOTOS / 2);
    this.loadPhoto(startIndex, this.renderPhoto.bind(this, startIndex));
    this.loadPhotos(startIndex - 1, -1, -loadStep);
    this.loadPhotos(startIndex + 1, this.numPhotos, loadStep);
  }

  stop = () => {
    this.stopPlay();
  }

  loadPhoto(index, callback) {
    const img = new Image();
    img.src = this.getPhotoSrc(index);
    img.onload = () => {
      this.photos[index] = img;
      this.numLoadedPhotos++;
      if (!this.isPlayerEnabled && this.numLoadedPhotos >= this.playThreshold) {
        this.isPlayerEnabled = true;
        this.startPlay();
      }
      if (callback && isFunction(callback)) {
        callback();
      }
    };
  }

  loadPhotos(start, end, step) {
    if (step > 0 && start < end) {
      let curIndex = start;
      for (;(curIndex < start + step) && (curIndex < end); curIndex++) {
        const callback = () => {
          if (curIndex < end) {
            this.loadPhoto(curIndex, callback);
          }
          curIndex++;
        };
        this.loadPhoto(curIndex, callback);
      }
    } else if (step < 0 && start > end) {
      let curIndex = start;
      for (;(curIndex > start + step) && (curIndex > end); curIndex--) {
        const callback = () => {
          if (curIndex > end) {
            this.loadPhoto(curIndex, callback);
          }
          curIndex--;
        };
        this.loadPhoto(curIndex, callback);
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

  startPlay() {
    if (this.isPlayerEnabled) {
      this.container.addEventListener(EVENTS.CLICK_START, this.handleTransitionStart);
      this.container.addEventListener(EVENTS.CLICK_MOVE, this.handleTransitionMove);
      this.container.addEventListener(EVENTS.CLICK_END, this.handleTransitionEnd);
      this.container.addEventListener(EVENTS.CLICK_CANCEL, this.handleTransitionEnd);
      if (isMobile()) {
        this.gyro = new Gyro(this.handleRotation);
        this.gyro.start();
      }
      this.playMode = PLAY_MODE.MANUAL;
      raf(this.onAnimationFrame);
    }
  }

  stopPlay() {
    this.container.removeEventListener(EVENTS.CLICK_START, this.handleTransitionStart);
    this.container.removeEventListener(EVENTS.CLICK_MOVE, this.handleTransitionMove);
    this.container.removeEventListener(EVENTS.CLICK_END, this.handleTransitionEnd);
    this.container.removeEventListener(EVENTS.CLICK_CANCEL, this.handleTransitionEnd);
    if (isMobile()) {
      this.gyro.stop();
    }
    this.clearContainer();
    this.resetMemberVars();
  }

  startWaitManualToAuto() {
    if (this.playMode === PLAY_MODE.MANUAL && !this.isWaitManualToAuto) {
      this.isWaitManualToAuto = true;
      this.countToAutoPlay = this.thresholdToAutoPlay;
      this.manualToAutoTimeout = setTimeout(() => {
        if (this.countToAutoPlay > 0) {
          this.playMode = PLAY_MODE.AUTO;
        }
        this.isWaitManualToAuto = false;
        this.manualToAutoTimeout = null;
      }, LIVEPHOTO_DEFAULT.MANUAL_TO_AUTO_THRESHOLD);
    }
  }

  stopWaitManualToAuto() {
    if (this.isWaitManualToAuto && this.manualToAutoTimeout !== null) {
      this.isWaitManualToAuto = true;
      clearTimeout(this.manualToAutoTimeout);
      this.isWaitManualToAuto = false;
      this.manualToAutoTimeout = null;
    }
  }

  startWaitAutoToManual() {
    if (this.playMode === PLAY_MODE.AUTO && !this.isWaitAutoToManual) {
      this.isWaitAutoToManual = true;
      this.countToManualPlay = this.thresholdToManualPlay;
      this.autoToManualTimeout = setTimeout(() => {
        if (this.countToManualPlay <= 0) {
          this.playMode = PLAY_MODE.MANUAL;
        }
        this.isWaitAutoToManual = false;
        this.autoToManualTimeout = null;
      }, LIVEPHOTO_DEFAULT.AUTO_TO_MANUAL_THRESHOLD);
    }
  }

  stopWaitAutoToManual() {
    if (this.isWaitAutoToManual && this.autoToManualTimeout !== null) {
      clearTimeout(this.autoToManualTimeout);
      this.isWaitAutolToManual = false;
      this.autoToManualTimeout = null;
    }
  }

  onAnimationFrame = () => {
    const isHovering = isHover(this.container);
    const pixelIndexDelta = this.getPixelIndexDelta();
    const rotationIndexDelta = this.getRotationIndexDelta();
    const absIndexDelta = Math.abs(pixelIndexDelta) + Math.abs(rotationIndexDelta);
    let indexDelta = 0;

    // Force to switch manual mode when mouse hovering
    if (isHovering) {
      this.playMode = PLAY_MODE.MANUAL;
      if (this.isWaitAutoToManual) {
        this.stopWaitAutoToManual();
      }
      if (this.isWaitManualToAuto) {
        this.stopWaitManualToAuto();
      }
    }

    if (this.playMode === PLAY_MODE.AUTO && LIVEPHOTO_DEFAULT.AUTO_PLAY_ENABLED) {
      if (this.autoPlayDir === AUTO_PLAY_DIR.STL) {
        if ((this.curPhoto === this.numPhotos - 1) || !this.photos[this.curPhoto]) {
          // Reach to the edge, suspend for a while
          this.autoPlayDir = AUTO_PLAY_DIR.NONE;
          setTimeout(() => {
            this.autoPlayDir = AUTO_PLAY_DIR.LTS;
          }, LIVEPHOTO_DEFAULT.AUTO_PLAY_SUSPEND_PERIOD);
        } else {
          // No the edge, just move to next photo
          indexDelta = 1;
        }
      } else if (this.autoPlayDir === AUTO_PLAY_DIR.LTS) {
        if ((this.curPhoto === 0) || !this.photos[this.curPhoto]) {
          // Reach to the edge, suspend for a while
          this.autoPlayDir = AUTO_PLAY_DIR.NONE;
          setTimeout(() => {
            this.autoPlayDir = AUTO_PLAY_DIR.STL;
          }, LIVEPHOTO_DEFAULT.AUTO_PLAY_SUSPEND_PERIOD);
        } else {
          // No the edge, just move to previous photo
          indexDelta = -1;
        }
      }
      this.countToManualPlay -= absIndexDelta;
      if (LIVEPHOTO_DEFAULT.AUTO_PLAY_ENABLED && !this.isWaitAutoToManual) {
        this.startWaitAutoToManual();
      }
    } else if (this.playMode === PLAY_MODE.MANUAL) {
      indexDelta = pixelIndexDelta + rotationIndexDelta;
      this.countToAutoPlay -= absIndexDelta;
      if (LIVEPHOTO_DEFAULT.AUTO_PLAY_ENABLED && !this.isWaitManualToAuto && !isHovering) {
        this.startWaitManualToAuto();
      }
    }
    this.lastPixel = this.curPixel;
    this.lastRotation = this.curRotation;
    if (indexDelta !== 0) {
      this.renderPhotoByDelta(indexDelta);
    }

    if (this.playMode === PLAY_MODE.AUTO) {
      setTimeout(this.onAnimationFrame, 1000 / LIVEPHOTO_DEFAULT.AUTO_PLAY_RATE);
    } else if (this.playMode === PLAY_MODE.MANUAL) {
      raf(this.onAnimationFrame);
    }
  }

  getPixelIndexDelta() {
    let indexDelta = 0;

    if (this.lastPixel && this.curPixel) {
      const pixelDelta =
        this.direction === DIRECTION.HORIZONTAL ?
        this.curPixel.x - this.lastPixel.x :
        this.curPixel.y - this.lastPixel.y;
      indexDelta = Math.round(pixelDelta / this.pixelStepDistance);
    }

    return indexDelta;
  }

  getRotationIndexDelta() {
    let indexDelta = 0;

    if (this.lastRotation && this.curRotation) {
      const rotationDelta =
        this.direction === DIRECTION.HORIZONTAL ?
        this.curRotation.x - this.lastRotation.x :
        this.curRotation.y - this.lastRotation.y;
      indexDelta = Math.round(this.numPhotos * (rotationDelta / LIVEPHOTO_DEFAULT.ROTATION_RANGE));
    }

    return indexDelta;
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

  clearContainer() {
    const container = this.container;
    const ctx = container.getContext('2d');
    ctx.clearRect(0, 0, container.width, container.height);
  }

  handleRotation = (rotation) => {
    this.curRotation = rotation;
  }

  handleTransitionStart = (e) => {
    if (this.isLeftBtnPressed(e)) {
      this.curPixel = getPosition(e);
    }
  }

  handleTransitionMove = (e) => {
    // Left button is clicked.
    if (this.isLeftBtnPressed(e)) {
      this.curPixel = getPosition(e);
    }
  }

  handleTransitionEnd = () => {
    this.curPixel = null;
  }

  isLeftBtnPressed(e) {
    return (
      isMobile() ?
      true :
      (e.which && e.button === 0) || (e.button && e.button === 0)
    );
  }
}
