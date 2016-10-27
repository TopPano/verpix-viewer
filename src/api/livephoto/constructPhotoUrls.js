import range from 'lodash/range';

export default function constructPhotoUrls(mediaId, content, quality) {
  const {
    cdnUrl,
    count,
    shardingKey,
  } = content;

  return range(0, count).map((idx) => (
    `${cdnUrl}${shardingKey}/media/${mediaId}/live/${quality}/${idx}.jpg`
  ));
}
