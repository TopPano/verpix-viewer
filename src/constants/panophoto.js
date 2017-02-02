/* eslint-disable max-len */

export const PARAMS_DEFAULT = {
  /* Option default values for common usage */
  SWIPE_SENSITIVITY: 80, // The sensitivity for swiping (mouse or touch moving), range from 1 to 99
  ROTATION_SENSITIVITY: 80, // The sensitivity for gyroscope rotation, range from 1 to 99
  FOV_MIN: 50, // The maximun fov
  FOV_MAX: 85, // The minimum fov
  /* Option default values for autoplay */
  MANUAL_TO_AUTO_TIME: 1000, // The period (in milliseconds) to wait for changing from manual to auto mode
  AUTO_TO_MANUAL_TIME: 100, // The period (milliseconds) to wait for changing from auto to manual mode
};

export default {
  PARAMS_DEFAULT,
};
