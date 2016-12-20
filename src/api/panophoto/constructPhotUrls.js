import range from 'lodash/range';

import { isMobile } from 'lib/devices';

export default function constructPhotoUrls(mediaId, mediaObj, isCDNDisabled) {
  const {
    cdnUrl,
    storeUrl,
    quality,
    shardingKey,
  } = mediaObj.content;
  const storeRoot = isCDNDisabled ? storeUrl : cdnUrl;
  // TODO: Dynamically choose the best quality
  const selectedIdx = isMobile() ? quality.length - 1 : 0;
  const selectedQuality = quality[selectedIdx];

  return range(0, selectedQuality.tiles).map((idx) => (
    `${storeRoot}${shardingKey}/media/${mediaId}/pano/${selectedQuality.size}/${idx}.jpg`
  ));
}
