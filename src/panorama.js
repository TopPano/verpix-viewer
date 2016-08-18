import merge from 'lodash/merge';

import panophoto from './api/panophoto';

window.addEventListener('load', () => {
  // Add api to global variable
  window.verpix = merge({}, window.verpix, {
    createPanophoto: panophoto.create,
  });

  // Create panorama(s) from DOM elements
  /*
  const roots = document.getElementsByClassName('verpix-panorama');
  forEach(roots, (root) => {
    const params = {
      root,
    };

    panorama.create(params, (err, instance) => {
      if (err) {
        // TODO: Error handling
      } else {
        instance.start();
      }
    });
  });
  */
});
