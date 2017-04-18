import fetch from 'isomorphic-fetch';
import isString from 'lodash/isString';
import Promise from 'bluebird';

import config from 'config';

const FETCH_ROOT = config.fetchRoot;

export default function getMedia(mediaId) {
  if (!isString(mediaId) || mediaId.length === 0) {
    return Promise.reject(new Error('Media ID should be an non-empty string'));
  }

  const url = `${FETCH_ROOT}/media/${mediaId}`;
  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        return Promise.reject(new Error(data.error.message));
      }
      return data.result;
    });
}
