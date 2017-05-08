import fetch from 'isomorphic-fetch';
import isString from 'lodash/isString';
import Promise from 'bluebird';
import bcrypt from 'bcryptjs';

import config from 'config';

// The URL root to request
const FETCH_ROOT = config.fetchRoot;
// The prefix of authenticatoin messag
const AUTH_MESSAGE_PREFIX = 'VERPIX ';
// Parameters of bcrypt
const BCRYPT_SALT_ROUND = 5;
// Promisify the async functions
const genBcryptSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);

const reverseString = (str) => str.split('').reverse().join('');

export default function getMedia(mediaId, quality, apiKey) {
  if (!isString(mediaId) || mediaId.length === 0) {
    return Promise.reject(new Error('Media ID should be an non-empty string'));
  }
  if (!isString(quality) || mediaId.length === 0) {
    return Promise.reject(new Error('Quality should be an non-empty string'));
  }

  // Construct the request resource name
  const resourceName = `/media/${mediaId}/${quality}`;
  // Construct the request URL
  const url = `${FETCH_ROOT}${resourceName}`;
  // Get current date
  const date = new Date();
  // Get current timestamp for authentication message
  const timestamp = parseInt(date.getTime() / 1000, 10);
  // Signature format depends on the value of timestamp:
  // Timestamp is odd:  'bcrypt($timestamp + $apiKey + $resourceName + reverse($timestamp))'
  // Timestamp is even: 'bcrypt($timestamp + reverse($resourceName) + $apiKey + $timestamp)'
  const isOdd = timestamp & 1;
  const plain =
    isOdd ?
    `${timestamp}${apiKey}${resourceName}${reverseString(timestamp.toString())}` :
    `${timestamp}${reverseString(resourceName)}${apiKey}${timestamp}`;

  return genBcryptSalt((BCRYPT_SALT_ROUND))
    // Bcrypt-Hash
    .then((salt) => bcryptHash(plain, salt))
    .then((signature) => {
      // Construct the authentication message.
      // The foramt is: 'VERPIX $apiKey:$signature'
      const authMessage = `${AUTH_MESSAGE_PREFIX}${apiKey}:${signature}`;

      // Send request
      return fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Date': date.toString(),
          Authorization: authMessage,
        },
      });
    })
    // Convert the response to json
    .then((res) => res.json())
    // Return the result
    .then((data) => {
      if (data.error) {
        return Promise.reject(new Error(data.error.message));
      }
      return data.result;
    });
}
