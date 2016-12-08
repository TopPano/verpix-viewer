/* eslint-disable no-param-reassign */

export default function createContainer(root, width, height) {
  // TODO: How to pass the no-param-reassign rule from eslint ?
  const wrapper = document.createElement('DIV');
  const container = document.createElement('DIV');
  const wrapperRatio = Math.round((height / width) * 100);

  // Styles for root
  root.style.width = `${width}px`;
  root.style.maxWidth = '100%';
  root.style.cursor = 'pointer';

  // Styles for wrapper
  wrapper.style.paddingBottom = `${wrapperRatio}%`;
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';

  // Styles for container
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';

  root.appendChild(wrapper);
  wrapper.appendChild(container);

  return container;
}

