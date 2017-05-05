import range from 'lodash/range';

export default function constructPhotoUrls(mediaObj, isCDNDisabled = false) {
  const {
    sid,
    content,
  } = mediaObj;
  const {
    cdnUrl,
    storeUrl,
    quality,
    shardingKey,
  } = content;
  const storeRoot = isCDNDisabled ? storeUrl : cdnUrl;
  const {
    size,
    tiles,
  } = quality[0];

  return range(0, tiles).map((idx) => (
    `${storeRoot}${shardingKey}/media/${sid}/pano/${size}/${idx}.jpg`
  ));
}
