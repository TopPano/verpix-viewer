function handleClickBtn(e) {
  e.preventDefault();
  const postIdInput = document.getElementById('post-id');
  const postId = postIdInput.value;
  const wrapper = document.createElement('DIV');
  wrapper.setAttribute('data-id', postId);
  window.verpix.createLivephoto(wrapper, postId, (err) => {
    const msgBox = document.getElementById('msg');
    if (err) {
      msgBox.value = err;
    } else {
      document.body.appendChild(wrapper);
      msgBox.value = `Post "${postId}" is added`;
    }
    postIdInput.value = '';
  });
}

window.addEventListener('load', () => {
  const button = document.getElementById('gen-post');
  button.addEventListener('click', handleClickBtn);
});
