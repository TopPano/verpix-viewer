/* eslint-disable max-len, no-loop-func */
import range from 'lodash/range';
import merge from 'lodash/merge';

const FILTERS_DEFAULT = {
  sepia: 30,
  brightness: 0,
  contrast: 100,
  saturate: 160,
  grayscale: 0,
  invert: 0,
  'hue-rotate': 350,
  blur: 0,
};

function createLivephoto(imgsData) {
  const params = {
    filters: FILTERS_DEFAULT,
  };
  let brightness = 0;

  window.verpix.createLivephoto(imgsData, params, (err, instance) => {
    if (err) {
      console.log(err);
    } else {
      instance.start();
      document.body.appendChild(instance.root);
      setInterval(() => {
        instance.applyFilters(merge({}, FILTERS_DEFAULT, {
          brightness,
        }));
        brightness = brightness === 150 ? 0 : brightness + 1;
      }, 1000);
    }
  });
}

const imgUrls =
  range(0, 100).map((idx) => `http://52.198.24.135:6559/73d8/media/abaada2ce4508400/live/406X720/${idx}.jpg`);
const imgsData = [];
const width = 406;
const height = 720;

for (let idx = 0; idx < imgUrls.length; idx++) {
  const imgUrl = imgUrls[idx];
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('CANVAS');
    const canvasCtx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    canvasCtx.drawImage(img, 0, 0);
    imgsData.push(canvasCtx.getImageData(0, 0, width, height));

    if (imgsData.length === imgUrls.length) {
      createLivephoto(imgsData);
    }
  };
  img.onerror = (e) => {
    console.log(e);
  };
  // TODO: set cross origin header in the future
  img.crossOrigin = 'Anonymous';
  img.src = imgUrl;
}

