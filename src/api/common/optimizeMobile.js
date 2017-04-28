import { isMobile } from 'lib/devices';
import events from 'constants/events';

export default function optimizeMobile(el) {
  if (isMobile()) {
    el.addEventListener(events('CLICK_MOVE'), (e) => {
      e.preventDefault();
    });
  }
}
