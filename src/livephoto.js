import forEach from 'lodash/forEach';

import livephoto from './api/livephoto';

import './polyfills';

// Add api to global variable
if (!window.verpix) {
  window.verpix = {};
}
window.verpix.createLivephoto = livephoto.create;

window.addEventListener('load', () => {
  // Create livephoto(s) from DOM elements
  const roots = document.getElementsByClassName('verpix-livephoto');
  forEach(roots, (root) => {
    const params = {
    };

    livephoto.create(root, params, (err, instance) => {
      if (err) {
        // TODO: Error handling
      } else {
        instance.start();
      }
    });
  });
});
