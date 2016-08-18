import fetch from 'isomorphic-fetch';
import config from 'config';

const API_ROOT = config.apiRoot;

export default function getPost(postId) {
  const url = `${API_ROOT}/posts/${postId}`;

  return fetch(url).then((res) => {
    if (res.status >= 400) {
      throw new Error(res);
    }
    return res.json();
  }).then((data) => {
    if (data && !data.error) {
      return data.result;
    }
    throw new Error(data.error);
  });
}
