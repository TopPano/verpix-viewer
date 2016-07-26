import raf from 'raf';
import isFunction from 'lodash/isFunction';

export default class Gyro {
  constructor(callback) {
    this.callback = callback;
    this.rotation = null;
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
    if (e.beta !== null && e.gamma !== null) {
      this.rotation = {
        x: e.gamma,
        y: e.beta,
      };
    }
  }
}
