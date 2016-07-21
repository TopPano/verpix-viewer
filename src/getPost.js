import fetch from 'isomorphic-fetch';

export default function getPost(url) {
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
