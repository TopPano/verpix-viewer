export default function createCanvas(width, height) {
  const canvas = document.createElement('CANVAS');

  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  document.getElementById('app').appendChild(canvas);

  return canvas;
}
