/* eslint-disable max-len */

import MobileDetect from 'mobile-detect';
import forEach from 'lodash/forEach';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import raf from 'raf';

import config from 'config';

// List of vendor prefix
export const VENDOR_PREFIX = [
  'webkit',
  'Moz',
  'ms',
  'O',
];
// The targets of mocked-up mobile device
export const IOS = 'ios';
export const ANDROID = 'android';
// Events
export const WHEEL = [
  'mousewheel',
  'DOMMouseScroll',
];
export const CLICK_DESKTOP = {
  START: 'mousedown',
  MOVE: 'mousemove',
  END: 'mouseup',
  CANCEL: 'mouseout',
};
export const CLICK_MOBILE = {
  START: 'touchstart',
  MOVE: 'touchmove',
  END: 'touchend',
  CANCEL: 'touchcancel',
};
// Constants from configuration
export const FETCH_ROOT = config.fetchRoot;
export const STATIC_ROOT = config.staticRoot;

const USER_AGENTS = {
  [IOS]: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_2_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13D15 Safari/601.1',
  [ANDROID]: 'Mozilla/5.0 (Linux; Android 6.0.1; ASUS_Z00UD Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36',
};

export function getOS() {
  return new MobileDetect(window.navigator.userAgent).os();
}

export function inIOS() {
  return getOS() === 'iOS';
}

export function inAndroid() {
  return getOS() === 'AndroidOS';
}

export function inMobile() {
  return inIOS() || inAndroid();
}

export function inIframe() {
  return window.self !== window.top;
}

function setUserAgent(userAgent) {
  window.navigator.__defineGetter__('userAgent', () => userAgent); // eslint-disable-line no-underscore-dangle
}

export function mockMobile(os = IOS) {
  const originalUserAgent = window.navigator.userAgent;
  const mockedOS = USER_AGENTS[os] ? USER_AGENTS[os] : originalUserAgent;

  setUserAgent(mockedOS);

  return {
    restore: () => {
      setUserAgent(originalUserAgent);
    },
  };
}

// Execute a callback it it is a function
export function execute(callback, ...args) {
  if (isFunction(callback)) {
    callback(...args);
  }
}

// Set response of a Sinon FakeServer
export function setResponse(server, url, method, res) {
  server.respondWith(method, url, (xhr) => {
    const result = isFunction(res) ? res(xhr) : res;

    xhr.respond(
      result.status || 200,
      result.header || { 'Content-Type': 'application/json' },
      result.body || JSON.stringify({})
    );
  });
}

// Create a DOM event
export function createEvent(category, type, data) {
  switch (category) {
    case 'mouse':
      return new MouseEvent(type, data);
    default:
      return new CustomEvent(type, data);
  }
}

// Simulate swipe on a DOM element
export function swipeOnElement(el, {
  fromX = 0,
  fromY = 0,
  toX = 0,
  toY = 0,
  steps = 10,
}, callback) {
  const CLICK = inMobile() ? CLICK_MOBILE : CLICK_DESKTOP;
  const eventCategory = inMobile() ? 'touch' : 'mouse';
  const eventData = {
    button: 0,
  };
  const deltaX = (toX - fromX) / steps;
  const deltaY = (toY - fromY) / steps;

  // Create swipe events
  const startEvent = createEvent(eventCategory, CLICK.START, eventData);
  const moveEvent = createEvent(eventCategory, CLICK.MOVE, eventData);
  const endEvent = createEvent(eventCategory, CLICK.END);

  // Dispatch the starting event
  el.dispatchEvent(startEvent);

  // Loop to dispatch the moving event many times
  let counter = 0;
  raf(function move() {
    // Set positions of moving events
    const newX = fromX + (deltaX * counter);
    const newY = fromY + (deltaY * counter);
    if (inMobile()) {
      moveEvent.touches = [];
      moveEvent.touches.push({
        pageX: newX,
        pageY: newY,
      });
    } else {
      moveEvent.offsetX = newX;
      moveEvent.offsetY = newY;
    }

    // Dispatch the moving event
    el.dispatchEvent(moveEvent);

    // Increase the counter
    counter++;

    // Check the counter and decide keep going or ending the swipe
    if (counter < steps) {
      raf(move);
    } else {
      // Dispatch the ending event
      el.dispatchEvent(endEvent);

      // Invoke the callback function
      if (isFunction(callback)) {
        callback();
      }
    }
  });
}

export function testError(err, expectedMsg) {
  expect(err).to.be.an('error');
  expect(err.message).to.equal(expectedMsg);
}

export function testElementStyles(el, expectedStyles) {
  forEach(expectedStyles, (expected, prop) => {
    if (isString(expected)) {
      expect(el.style[prop]).to.equal(expected);
    } else {
      expect(el.style[prop]).to.equal(expected.value);
      if (expected.withPrefix) {
        // Also test property with prefixes
        VENDOR_PREFIX.forEach((prefix) => {
          // Concatenate the propperty with prefix
          // Example:
          // prefix = Moz, prop = pointerEvents => prefixProp = MozPointerEvents
          const prefixProp = `${prefix}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
          expect(el.style[prefixProp]).to.equal(expected.value);
        });
      }
    }
  });
}
