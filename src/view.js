import onChange from 'on-change';

export default (state) => {
  const form = document.querySelector('.rss-form');
  const submitButton = document.querySelector('button[type="submit"]');
  const renderFeedback = (value) => {
    const divFeedBack = document.querySelector('.feedback');
    console.log(value);
    divFeedBack.classList.remove('text-success', 'text-danger'); // нужно разобраться с классом формы
    if (value === 'RSS успешно загружен') {
      divFeedBack.classList.add('text-success');
    } else {
      form.url.classList.add('is-invalid');
      divFeedBack.classList.add('text-danger');
    }

    divFeedBack.textContent = value;
  };
  const renderFeeds = (watchedState) => {
    const feedsContainer = document.querySelector('.feeds');
    const ulfeed = document.createElement('ul');
    ulfeed.classList.add('list-group', 'mb-5');
    const feeds = watchedState.feeds.map((feed) => `
      <li class="list-group-item">
        <h3>${feed.title}</h3>
        <p>${feed.description}</p>
      </li>`);
    ulfeed.innerHTML = feeds.join('');
    feedsContainer.innerHTML = `<h2>Фиды</h2>${ulfeed.outerHTML}`;

    const postsContainer = document.querySelector('.posts');
    const ulpost = document.createElement('ul');
    ulpost.classList.add('list-group');
    const posts = watchedState.posts.map((post) => `
      <li class="list-group-item d-flex justify-content-between align-items-start">
        <a href="${post.link}" class="font-weight-bold" data-id="2" target="_blank" rel="noopener noreferrer">${post.postTitle}</a>
        <button type="button" class="btn btn-primary btn-sm">Просмотр</button>
      </li>`);
    ulpost.innerHTML = posts.join('');
    postsContainer.innerHTML = `<h2>Посты</h2>${ulpost.outerHTML}`;
  };

  const processStateHandle = (processState, watchedState) => {
    if (processState === 'pending') {
      submitButton.disabled = false;
    } else if (processState === 'sending') {
      submitButton.disabled = true;
    } else if (processState === 'finished') {
      submitButton.disabled = false;
      renderFeedback(watchedState.formState.processSucces);
      form.reset();
    } else if (processState === 'failed') {
      submitButton.disabled = false;
      renderFeedback(watchedState.formState.processError);
    }
  };
  const watchedState = onChange(state, (path, value) => {
    if (path === 'formState.processState') {
      processStateHandle(value, watchedState);
    }
    if (path === 'formState.valid') {
      renderFeedback(watchedState.formState.validError);
    }
    if (path === 'feeds' || path === 'posts') {
      renderFeeds(watchedState);
    }
  });
  return watchedState;
};
