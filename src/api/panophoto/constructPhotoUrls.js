import range from 'lodash/range';

export default function constructPhotoUrls(
  mediaId,
  mediaObj,
  quality,
  isCDNDisabled = false
) {
  const {
    cdnUrl,
    storeUrl,
    tiles,
    shardingKey,
  } = mediaObj.content;
  const storeRoot = isCDNDisabled ? storeUrl : cdnUrl;

  return range(0, tiles).map((idx) => (
    `${storeRoot}${shardingKey}/media/${mediaId}/pano/${quality}/${idx}.jpg`
  ));
}
