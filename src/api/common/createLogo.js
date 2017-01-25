import MutationObserver from 'mutation-observer';

import config from 'config';
import { execute } from 'lib/utils';

export default function createLogo(onMutation) {
  const link = document.createElement('a');
  const img = new Image();

  // Attributes for link
  link.href = config.redirectURL;
  link.target = '_href';
  link.style.position = 'absolute';
  link.style.right = '10px';
  link.style.bottom = '12px';

  // Attributes for image
  img.src = `${config.staticRoot}/assets/logo.svg`;
  img.width = 90;
  img.height = 13;

  // Append child
  link.appendChild(img);

  // Detect mutations on link
  const observer = new MutationObserver(() => {
    observer.disconnect();
    execute(onMutation);
  });
  const observerConfig = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  };
  observer.observe(link, observerConfig);
  link.addEventListener('DOMNodeRemoved', () => {
    execute(onMutation);
    observer.disconnect();
    link.removeEventListener('DOMNodeRemoved', this);
  });

  return link;
}
