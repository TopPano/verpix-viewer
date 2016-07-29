export default function createCanvas(wrapper, width, height) {
  const canvas = document.createElement('CANVAS');

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  wrapper.appendChild(canvas);

  return canvas;
}
