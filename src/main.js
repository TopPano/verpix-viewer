import forEach from 'lodash/forEach';

import livephoto from './livephoto';

window.addEventListener('load', () => {
  // Define global variable "verpix"
  window.verpix = {
    createLivephoto: livephoto.create,
  };

  const roots = document.getElementsByClassName('verpix-livephoto');
  forEach(roots, (root) => {
    const params = {
      root,
    };

    livephoto.create(params, (err, instance) => {
      if (err) {
        // TODO: Error handling
      } else {
        instance.start();
      }
    });
  });
});
