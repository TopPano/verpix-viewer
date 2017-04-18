import MobileDetect from 'mobile-detect';

export default function isMobile() {
  return Boolean(new MobileDetect(window.navigator.userAgent).mobile());
}
