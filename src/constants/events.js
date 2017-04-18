import { isMobile } from 'lib/devices';

const EVENTS = {
  WINDOW_RESIZE: ['resize', 'resize'],
  CLICK_START: ['mousedown', 'touchstart'],
  CLICK_MOVE: ['mousemove', 'touchmove'],
  CLICK_END: ['mouseup', 'touchend'],
  CLICK_CANCEL: ['mouseout', 'touchcancel'],
  WHEEL: [[
    'mousewheel', // IE9, Chrome, Safari, Opera
    'DOMMouseScroll', // Firefox
  ], []],
};

const events = (eventName) => (
  !isMobile() ? EVENTS[eventName][0] : EVENTS[eventName][1]
);

export default events;
