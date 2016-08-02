import forEach from 'lodash/forEach';

import livephoto from './livephoto';

window.addEventListener('load', () => {
  // Define global variable "verpix"
  window.verpix = {
    createLivephoto: livephoto.create,
  };

  const roots = document.getElementsByClassName('verpix-livephoto');
  forEach(roots, (root) => {
    livephoto.create(root, () => {
      // TODO: Error handling
    });
  });
});
