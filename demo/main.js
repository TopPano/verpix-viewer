import queryString from 'query-string';

const addedPostIds = [];

function handleClickGenBtn(e) {
  e.preventDefault();
  const querys = queryString.stringify({
    viewOnly: 'on',
    postIds: addedPostIds.join(','),
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

function addPost(postId) {
  const label = document.createElement('H3');
  const wrapper = document.createElement('DIV');

  wrapper.setAttribute('data-id', postId);
  window.verpix.createLivephoto(wrapper, (err) => {
    const msgBox = document.getElementById('add-msg');
    if (err) {
      msgBox.value = err;
    } else {
      if (addedPostIds.length === 0) {
        enableGenBtn();
      }
      addedPostIds.push(postId);
      label.innerHTML = `${addedPostIds.length}. ${postId}`;
      document.body.appendChild(label);
      document.body.appendChild(wrapper);
      msgBox.value = `Post "${postId}" is added`;
    }
  });
}

function handleClickAddBtn(e) {
  e.preventDefault();
  const postIdInput = document.getElementById('add-id');
  const postId = postIdInput.value;
  addPost(postId);
  postIdInput.value = '';
}

window.addEventListener('load', () => {
  const querys = queryString.parse(location.search);
  if (querys.viewOnly === 'on') {
    // Non-editable mode
    if (querys.postIds) {
      const postIds = querys.postIds.split(',');
      postIds.forEach((postId) => {
        addPost(postId);
      });
    }
  } else {
    // Editable mode
    document.getElementById('add-form').style.display = 'block';
    const button = document.getElementById('add-btn');
    button.addEventListener('click', handleClickAddBtn);
  }
});
