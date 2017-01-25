import { applyStyle } from 'lib/dom';
import config from 'config';
import { isMobile } from 'lib/devices';

export default function createTip() {
  const tip = new Image();

  // Attributes for tip
  if (isMobile()) {
    tip.src = `${config.staticRoot}/assets/tip-tilt.svg`;
    tip.width = 60;
    tip.height = 45;
  } else {
    tip.src = `${config.staticRoot}/assets/tip-mouse.svg`;
    tip.width = 45;
    tip.height = 45;
  }
  tip.style.opacity = '0';
  tip.style.position = 'absolute';
  tip.style.left = '50%';
  tip.style.bottom = '12px';
  applyStyle(tip, 'transform', 'translateX(-50%)');
  // states and methods for tip
  tip.isShown = false;
  tip.show = () => {
    if (!tip.isShown) {
      applyStyle(tip, 'transition', 'opacity 2.5s 3s linear');
      tip.style.opacity = '1';
      tip.isShown = true;
    }
  };
  tip.hide = () => {
    if (tip.isShown) {
      applyStyle(tip, 'transition', 'opacity .5s linear');
      tip.style.opacity = '0';
      tip.isShown = false;
    }
  };

  return tip;
}
