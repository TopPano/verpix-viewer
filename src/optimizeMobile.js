import { isMobile } from 'lib/devices';
import EVENTS from 'constants/events';

export default function optimizeMobile() {
  if (isMobile()) {
    document.addEventListener(EVENTS.CLICK_MOVE, (e) => {
      e.preventDefault();
    });
  }
}
