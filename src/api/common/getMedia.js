import fetch from 'isomorphic-fetch';
import isString from 'lodash/isString';
import Promise from 'bluebird';
import bcrypt from 'bcryptjs';
import pbkdf2 from 'pbkdf2';

import config from 'config';

// The URL root to request
const FETCH_ROOT = config.fetchRoot;
// The prefix of authenticatoin messag
const AUTH_MESSAGE_PREFIX = 'VERPIX ';
// Parameters of bcrypt
const BCRYPT_SALT_ROUND = 5;
// Parameters of pbkdf2
const PBKDF2_ITERS = 20;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_DIGEST = 'sha512';
// Promisify the async functions
const genBcryptSalt = Promise.promisify(bcrypt.genSalt);
const bcryptHash = Promise.promisify(bcrypt.hash);
const pbkdf2Hash = Promise.promisify(pbkdf2.pbkdf2);

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
  // Determine the plain text to bcrypt-hash and pbkdf2-hash,
  // and the format depends on the value of timestamp:
  // Timestamp is odd:  'bcrypt($timestamp + $apiKey) + pbkdf2($resourceName + $timestamp)'
  // Timestamp is even: 'bcrypt($timestamp + reverse($resourceName)) + pbkdf2($apiKey + $timestamp)'
  const isOdd = timestamp & 1;
  const bcryptPlain =
    isOdd ?
    `${timestamp}${apiKey}` :
    `${timestamp}${reverseString(resourceName)}`;
  const pbkdf2Plain =
    isOdd ?
    `${resourceName}${timestamp}` :
    `${apiKey}${timestamp}`;
  // The bcrypt-hashed part
  let bcryptHashed = '';
  // The pbkdf2-hashed part
  let pbkdf2Hashed = '';

  return genBcryptSalt((BCRYPT_SALT_ROUND))
    // Bcrypt-Hash
    .then((salt) => bcryptHash(bcryptPlain, salt))
    .then((hashed) => {
      bcryptHashed = hashed;

      // PBKDF2-Hash
      return pbkdf2Hash(
        pbkdf2Plain,
        `${timestamp}`,
        PBKDF2_ITERS,
        PBKDF2_KEY_LENGTH,
        PBKDF2_DIGEST
      );
    })
    .then((hashed) => {
      // The return pbkdf2-hashed value is Uint8Array, we convert it to hexadecimal string
      pbkdf2Hashed = hashed.toString('hex');

      // Construct the signature by combining bcrypt-hashed part and pbkdf2-hashed part
      const signature = `${bcryptHashed}${pbkdf2Hashed}`;
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
