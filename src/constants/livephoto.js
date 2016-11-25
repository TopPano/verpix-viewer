/* eslint-disable max-len */

export const LIVEPHOTO_DEFAULT = {
  // Option default values for common usage
  SWIPE_SENSITIVITY: 80, // The sensitivity for swiping (or mouse moving), range from 1 to 99
  GYRO_SENSITIVITY: 35, // The sensitivity for gyroscope rotating, range from 1 to 99
  PLAY_THRESHOLD: 0.3, // The threshold (proportion of loaded photos to all photos) to start playing
  CONCURRENT_LOADING_PHOTOS: 20, // The limit number of concurrently loading photos
  MOVE_BUFFER_SIZE: 20, // The lenght of buffer to store last movements
  // Option default values for auto play
  AUTO_PLAY_ENABLED: true, // Enable auto play or not if the user "keep still" for a while
  AUTO_PLAY_RATE: 20, // The auto play frame rate (number of frames per second)
  AUTO_PLAY_SUSPEND_PERIOD: 500, // The period (in milliseconds) to suspend when reach the edge photo in auto mode
  MANUAL_TO_AUTO_THRESHOLD: 1000, // The period (in milliseconds) to wait for changing from manual to auto mode
  AUTO_TO_MANUAL_THRESHOLD: 100, // The period (milliseconds) to wait for changing from auto to manual mode
};

export const PLAY_MODE = {
  NONE: 'NONE',
  MANUAL: 'MANUAL',
  AUTO: 'AUTO',
};

export const SWIPE_MODE = {
  NONE: 'NONE', // Unable to swipe
  HOLD: 'HOLD', // Left button is clicked (for mouse) or finger is pressed (for touch)
  RELEASE: 'RELEASE', // Inverse of hold mode
};

export const AUTO_PLAY_DIR = {
  STL: 'SMALL_TO_LARGE',
  LTS: 'LARGE_TO_SMALL',
  NONE: 'NONE',
};

export default {
  LIVEPHOTO_DEFAULT,
  PLAY_MODE,
  AUTO_PLAY_DIR,
};
