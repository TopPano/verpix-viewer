import createCanvas from './createCanvas';
import getPost from './getPost';
import LivePhotoPlayer from './LivePhotoPlayer';
import optimizeMobile from './optimizeMobile';

const POST_URL = 'https://www.verpix.me/api/posts/ab13a2d1cc38c000';

window.onload = () => {
  optimizeMobile();

  getPost(POST_URL).then((post) => {
    const width = post.dimension.width;
    const height = post.dimension.height;
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
