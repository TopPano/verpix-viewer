import MobileDetect from 'mobile-detect';

export function getOS() {
  return new MobileDetect(window.navigator.userAgent).os();
};

export function isIOS() {
  return getOS() === 'iOS';
}

export function isAndroid() {
  return getOS() === 'AndroidOS';
}

export function isMobile() {
  return isIOS() || isAndroid();
}

export function isIframe() {
  return window.self !== window.top;
}

export default {
  getOS,
  isIOS,
  isAndroid,
  isMobile,
  isIframe,
};
