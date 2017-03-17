import MobileDetect from 'mobile-detect';

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

export default {
  getOS,
  inIOS,
  inAndroid,
  inMobile,
  inIframe,
};
