/* eslint-disable no-param-reassign */

export default function createCanvas(root, canvasDimension, wrapperDimension) {
  const outWrapper = document.createElement('DIV');
  const inWrapper = document.createElement('DIV');
  const canvas = document.createElement('CANVAS');
  const wrapperRatio = Math.round((wrapperDimension.height / wrapperDimension.width) * 100);
  const canvasRatio = Math.round((canvasDimension.height / canvasDimension.width) * 100);

  // TODO: How to pass the no-param-reassign rule from eslint ?
  root.style.width = `${wrapperDimension.width}px`;
  root.style.maxWidth = '100%';

  // Styles for outter wrapper
  outWrapper.style.width = '100%';
  outWrapper.style.paddingBottom = `${wrapperRatio}%`;
  outWrapper.style.position = 'relative';
  outWrapper.style.overflow = 'hidden';

  // Styles for inner wrapper
  inWrapper.style.width = '100%';
  inWrapper.style.paddingBottom = `${canvasRatio}%`;
  inWrapper.style.position = 'absolute';
  inWrapper.style.top = '50%';
  inWrapper.style.left = '0';
  const transformStyle = 'translateY(-50%)';
  inWrapper.style.webkitTransform = transformStyle;
  inWrapper.style.MozTransform = transformStyle;
  inWrapper.style.msTransform = transformStyle;
  inWrapper.style.OTransform = transformStyle;
  inWrapper.style.transform = transformStyle;

  // Attributes for canvas
  canvas.width = canvasDimension.width;
  canvas.height = canvasDimension.height;
  // styles for canvas
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.cursor = 'pointer';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';

  root.appendChild(outWrapper);
  outWrapper.appendChild(inWrapper);
  inWrapper.appendChild(canvas);

  return canvas;
}
