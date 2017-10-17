/* eslint-disable no-param-reassign */

import queryString from 'query-string';

const mediaList = [];

function handleClickGenBtn(e) {
  e.preventDefault();

  const querys = queryString.stringify({
    viewOnly: 'on',
    mediaList: mediaList.map((media) =>
      `${media.id},${media.type},${media.width},${media.height}`).join(';'),
  });
  const url = `${window.location.href}?${querys}`;

  window.open(url);
}

function enableGenBtn() {
  const genBtn = document.getElementById('gen-btn');
  genBtn.disabled = false;
  genBtn.style.backgroundColor = 'red';
  genBtn.addEventListener('click', handleClickGenBtn);
}

function addMedia(id, type, width, height) {
  const label = document.createElement('H3');
  const params = {
    width,
    height,
  };
  const method = (type === 'panophoto') ? 'createPanophoto' : 'createLivephoto';

  window.verpix[method](id, params, (err, instance) => {
    const msgBox = document.getElementById('add-msg');
    if (err) {
      msgBox.value = err;
    } else {
      if (mediaList.length === 0) {
        enableGenBtn();
      }
      mediaList.push({
        id,
        type,
        width,
        height,
      });
      label.innerHTML = `${mediaList.length}. ${id} (${type} ${width}x${height})`;
      instance.root.style.border = 'dashed 1px grey';
      document.body.appendChild(label);
      document.body.appendChild(instance.root);
      msgBox.value = `Media "${id}" is added`;
      instance.start();
    }
  });
}

function handleClickAddBtn(e) {
  e.preventDefault();

  const idInput = document.getElementById('add-id');
  const typeSelect = document.getElementById('add-type');
  const id = idInput.value;
  const type = typeSelect.options[typeSelect.selectedIndex].value;
  const width = parseInt(document.getElementById('add-width').value, 10);
  const height = parseInt(document.getElementById('add-height').value, 10);

  addMedia(id, type, width, height);
  idInput.value = '';
}

window.addEventListener('load', () => {
  const querys = queryString.parse(location.search);
  if (querys.viewOnly === 'on') {
    // Non-editable mode
    if (querys.mediaList) {
      const mediaInfoList = querys.mediaList.split(';');
      mediaInfoList.forEach((mediaInfo) => {
        const info = mediaInfo.split(',');
        addMedia(info[0], info[1], info[2], info[3]);
      });
    }
  } else {
    // Editable mode
    document.getElementById('add-form').style.display = 'block';
    const button = document.getElementById('add-btn');
    button.addEventListener('click', handleClickAddBtn);
  }
});
