import createCanvas from './createCanvas';
import getPost from './getPost';
import LivePhotoPlayer from './LivePhotoPlayer';

const POST_URL = 'https://www.verpix.me/api/posts/aac3119529d54400';
const width = 480;
const height = 640;

window.onload = () => {
  getPost(POST_URL).then((post) => {
    const container = createCanvas(width, height);
    new LivePhotoPlayer({
      container,
      photosSrcUrl: post.media.srcHighImages,
      dimension: post.dimension,
    }).start();
  }).catch(() => {
    // TODO: Error handling
  });
};
