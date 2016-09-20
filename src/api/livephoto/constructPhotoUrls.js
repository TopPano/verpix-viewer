import range from 'lodash/range';

export default function constructPhotoUrls(mediaId, content, quality) {
  const { count, shardingKey } = content;
  // TODO: Get cdnUrl from content
  const cdnUrl = 'http://52.198.24.135:6559';

  return range(0, count).map((idx) => (
    `${cdnUrl}/${shardingKey}/media/${mediaId}/live/${quality}/${idx}.jpg`
  ));
}
