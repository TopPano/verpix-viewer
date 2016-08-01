function handleClickBtn(e) {
  e.preventDefault();
  const postIdInput = document.getElementById('post-id');
  const postId = postIdInput.value;
  const wrapper = document.createElement('DIV');
  wrapper.setAttribute('data-id', postId);
  document.body.appendChild(wrapper);
  window.verpix.createLivephoto(wrapper, postId);
}

window.addEventListener('load', () => {
  const button = document.getElementById('gen-post');
  button.addEventListener('click', handleClickBtn);
});
