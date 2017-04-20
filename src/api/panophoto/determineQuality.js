export default function (visibleWidth, visibleHeight) {
  // TODO: More rules to choose the best quality
  const quality =
    (Math.max(visibleWidth, visibleHeight) <= 300) ? '2000x1000' : '8000x4000';

  return quality;
}
