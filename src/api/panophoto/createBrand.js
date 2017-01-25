import { applyStyle } from 'lib/dom';
import config from 'config';

export default function createBrand() {
  const brand = new Image();

  // Attributes for brand
  brand.src = `${config.staticRoot}/assets/brand-pano.svg`;
  brand.width = 61;
  brand.height = 62;
  brand.style.position = 'absolute';
  brand.style.left = '50%';
  brand.style.bottom = '50%';
  brand.style.opacity = '0';
  applyStyle(brand, 'transform', 'translate(-50%, 50%)');
  // States and method for brand
  brand.isShown = false;
  brand.show = () => {
    if (!brand.isShown) {
      applyStyle(brand, 'transition', 'opacity 1.5s linear');
      brand.style.opacity = '1';
      brand.isShown = true;
    }
  };
  brand.hide = () => {
    if (brand.isShown) {
      applyStyle(brand, 'transition', 'opacity .5s linear');
      brand.style.opacity = '0';
      brand.isShown = false;
    }
  };

  return brand;
}
