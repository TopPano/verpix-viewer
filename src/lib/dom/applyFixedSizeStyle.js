// Apply style that has fixed size (width and height) to a dom object.
export default function applyFixedSizeStyle(domObj, width, height) {
  const sizeStyle = `width: ${width}px !important; height: ${height}px !important`;

  domObj.setAttribute('style', sizeStyle);
}
