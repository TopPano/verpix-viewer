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

export default {
  getOS,
  isIOS,
  isAndroid,
  isMobile,
};
