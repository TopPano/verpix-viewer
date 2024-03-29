import {
  applyFixedSizeStyle,
  applyStyle,
} from 'lib/dom';
import config from 'config';
import { isMobile } from 'lib/devices';

export default function createTip({ onTop = false }) {
  const tip = new Image();

  // Attributes for tip
  if (isMobile()) {
    tip.src = `${config.staticRoot}/assets/tip-tilt.svg`;
    applyFixedSizeStyle(tip, 80, 60);
  } else {
    tip.src = `${config.staticRoot}/assets/tip-mouse.svg`;
    applyFixedSizeStyle(tip, 45, 45);
  }
  tip.style.opacity = '0';
  tip.style.position = 'absolute';
  tip.style.left = '50%';
  tip.style.bottom = '12px';
  applyStyle(tip, 'pointerEvents', 'none');
  applyStyle(tip, 'transform', 'translateX(-50%)');
  if (onTop) {
    tip.style.zIndex = '99999999';
  }
  // states and methods for tip
  tip.isShown = false;
  tip.show = () => {
    if (!tip.isShown) {
      applyStyle(tip, 'transition', 'opacity 2.5s linear 3s');
      tip.style.opacity = '1';
      tip.isShown = true;
    }
  };
  tip.hide = () => {
    if (tip.isShown) {
      applyStyle(tip, 'transition', 'opacity 0.5s linear 0s');
      tip.style.opacity = '0';
      tip.isShown = false;
    }
  };

  return tip;
}
