export default function createCanvas(root, canvasDimension, wrapperDimension) {
  const wrapper = document.createElement('DIV');
  const canvas = document.createElement('CANVAS');
  const canvasStyleWidth = wrapperDimension.width;
  const canvasStyleHeight =
    Math.round(canvasDimension.height * (wrapperDimension.width / canvasDimension.width));

  // Styles for wrapper
  wrapper.style.width = `${wrapperDimension.width}px`;
  wrapper.style.height = `${wrapperDimension.height}px`;
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';

  // Attributes for canvas
  canvas.width = canvasDimension.width;
  canvas.height = canvasDimension.height;
  // styles for canvas
  canvas.style.width = `${canvasStyleWidth}px`;
  canvas.style.height = `${canvasStyleHeight}px`;
  canvas.style.cursor = 'pointer';
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.marginTop = `-${Math.round(canvasStyleHeight / 2)}px`;

  wrapper.appendChild(canvas);
  root.appendChild(wrapper);

  return canvas;
}
