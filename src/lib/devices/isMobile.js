import MobileDetect from 'mobile-detect';

export default function isMobile() {
  return new MobileDetect(window.navigator.userAgent).mobile();
}
