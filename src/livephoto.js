import forEach from 'lodash/forEach';
import merge from 'lodash/merge';

import livephoto from './api/livephoto';

window.addEventListener('load', () => {
  // Add api to global variable
  window.verpix = merge({}, window.verpix, {
    createLivephoto: livephoto.create,
  });

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
