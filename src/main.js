import forEach from 'lodash/forEach';

import livephoto from './livephoto';

window.addEventListener('load', () => {
  // Define global variable "verpix"
  window.verpix = {
    createLivephoto: livephoto.create,
  };

  const wrappers = document.getElementsByClassName('verpix-livephoto');
  forEach(wrappers, (wrapper) => {
    livephoto.create(wrapper, () => {
      // TODO: Error handling
    });
  });
});
