import range from 'lodash/range';

export default function constructPhotoUrls(mediaId, mediaObj) {
  const {
    cdnUrl,
    quality,
    shardingKey,
  } = mediaObj.content;
  // TODO: Dynamically choose the best quality
  const selectedQuality = quality[quality.length - 1];

  return range(0, selectedQuality.tiles).map((idx) => (
    `${cdnUrl}${shardingKey}/media/${mediaId}/pano/${selectedQuality.size}/${idx}.jpg`
  ));
}
