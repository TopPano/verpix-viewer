import { applyStyle } from 'lib/dom';
import config from 'config';
import { isMobile } from 'lib/devices';

export default function createTip() {
  const tip = new Image();

  // Attributes for tip
  // TODO: Tip for desktop
  if (isMobile()) {
    tip.src = `${config.staticRoot}/assets/tip-tilt.svg`;
    tip.style.width = '60px';
    tip.style.height = '45px';
    tip.style.opacity = '0';
    tip.style.position = 'absolute';
    tip.style.left = '50%';
    tip.style.bottom = '12px';
    applyStyle(tip, 'transform', 'translateX(-50%)');
  }
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
