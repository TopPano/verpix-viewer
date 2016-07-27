import raf from 'raf';
import isFunction from 'lodash/isFunction';

const RESET_DELAY = 300;

export default class Gyro {
  constructor(callback) {
    this.callback = callback;
    this.rotation = null;
    this.isPortrait = null;
    this.needResetRotation = false;
  }

  start() {
    const orientationSupport = !!window.DeviceOrientationEvent;

    if (orientationSupport) {
      window.addEventListener('deviceorientation', this.onDeviceOrientation);
      raf(this.onAnimationFrame);
    }
  }

  onAnimationFrame = () => {
    if (isFunction(this.callback)) {
      this.callback(this.rotation);
      raf(this.onAnimationFrame);
    }
  }

  onDeviceOrientation = (e) => {
    this.updateDimension();

    if (this.needResetRotation) {
      this.rotation = null;
    } else if (e.beta !== null && e.gamma !== null) {
      if (this.isPortrait) {
        this.rotation = {
          x: e.gamma,
          y: e.beta,
        };
      } else {
        this.rotation = {
          x: e.beta,
          y: e.gamma,
        };
      }
    }
  }

  updateDimension = () => {
    let isPortrait = this.isPortrait;

    if (window.orientation) {
      isPortrait = (window.orientation === 0 || window.orientation === 180);
    } else if (window.innerHeight !== null && window.innerWidth !== null) {
      isPortrait = window.innerHeight > window.innerWidth;
    }

    if (isPortrait !== this.isPortrait) {
      console.log('yoyyoyyo');
      this.isPortrait = isPortrait;
      this.needResetRotation = true;
      setTimeout(() => {
        this.needResetRotation = false;
      }, RESET_DELAY);
    }
  }
}
