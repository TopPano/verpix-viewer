/* eslint-disable max-len */

import MobileDetect from 'mobile-detect';
import forEach from 'lodash/forEach';
import isString from 'lodash/isString';

export const VENDOR_PREFIX = [
  'webkit',
  'Moz',
  'ms',
  'O',
];

export const IOS = 'ios';
export const ANDROID = 'android';

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
  const originalNavigator = window.navigator;

  window.navigator = {};
  window.navigator.__proto__ = originalNavigator; // eslint-disable-line no-proto
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
