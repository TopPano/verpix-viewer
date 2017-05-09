/* eslint-disable max-len */

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
const bcryptCompare = Promise.promisify(bcrypt.compare);

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

  // Variable to store the result from response
  let result;
  // Variable to store the date from response
  let resTimestamp;

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
    .then((res) => {
      // Get timestamp from response header
      resTimestamp = parseInt(new Date(res.headers.get('X-Date')).getTime() / 1000, 10);
      // Jsonify the response body
      return res.json();
    })
    // Return the result
    .then((data) => {
      if (data.error) {
        return Promise.reject(new Error(data.error.message));
      }

      // Store the result
      result = data.result;

      // Get verification messagefrom response body
      const verificationMessage = data.result.verification;
      // Verification message format depends on the value of timestamp:
      // Timestamp is odd:  'bcrypt($resourceName + reverse($timestamp) + reverse($apiKey) + $timestamp)'
      // Timestamp is even: 'bcrypt(reverse($resourceName) + $timestamp + $apiKey + reverse($timestamp))'
      const resPlain =
        resTimestamp & 1 ?
        `${resourceName}${reverseString(resTimestamp.toString())}${reverseString(apiKey)}${resTimestamp}` :
        `${reverseString(resourceName)}${resTimestamp}${apiKey}${reverseString(resTimestamp.toString())}`;

      // Verify the verification message
      return bcryptCompare(resPlain, verificationMessage);
    })
    .then((verified) => {
      if (!verified) {
        return Promise.reject(new Error('License not passed'));
      }

      return result;
    });
}
