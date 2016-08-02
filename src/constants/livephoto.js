/* eslint-disable max-len */

export const LIVEPHOTO_DEFAULT = {
  SWIPE_RANGE: 0.8, // The maximum swipe (or mouse moving) range to play all photos
  ROTATION_RANGE: 50, // The maximum rotation angle (in degree) to play all photos
  PLAY_THRESHOLD: 0.5, // The threshold (proportion of loaded photos to all photos) to start playing
  CONCURRENT_LOADING_PHOTOS: 10, // The limit number of concurrently loading photos
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
