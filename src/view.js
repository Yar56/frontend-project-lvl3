import onChange from 'on-change';

export default (state, i18nInstance, elements) => {
  const {
    form,
    submitButton,
    divFeedBack,
    input,
  } = elements;

  const renderFeedback = (value, style) => {
    elements.divFeedBack.classList.remove('text-success', 'text-danger');
    elements.divFeedBack.classList.add(style);
    divFeedBack.textContent = value;
  };

  const renderFeeds = (feeds) => {
    const feedsContainer = document.querySelector('.feeds');
    const ulfeed = document.createElement('ul');
    ulfeed.classList.add('list-group', 'mb-5');

    feeds.map(({ title, description }) => {
      const li = document.createElement('li');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');

      li.classList.add('list-group-item');
      h3.textContent = title;
      p.textContent = description;
      li.append(...[h3, p]);
      return li;
    }).map((li) => ulfeed.append(li));
    feedsContainer.innerHTML = '';
    feedsContainer.innerHTML = '<h2>Фиды</h2>';
    feedsContainer.appendChild(ulfeed);
  };

  const renderModal = (content, link, postState) => {
    link.classList.remove('fw-bold', 'fw-normal');

    if (postState === 'active') {
      link.classList.add('fw-bold');
    }
    if (postState === 'inactive') {
      link.classList.add('fw-normal');
    }
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalLink = document.querySelector('.full-article');
    modalTitle.textContent = content.title;
    modalBody.textContent = content.description;
    modalLink.setAttribute('href', content.link);
  };

  const renderPosts = (posts) => {
    const postsContainer = document.querySelector('.posts');
    const ulpost = document.createElement('ul');
    ulpost.classList.add('list-group');

    posts.map((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const a = document.createElement('a');
      const btn = document.createElement('button');

      if (post.state === 'active') {
        a.classList.add('fw-bold');
      }
      if (post.state === 'inactive') {
        a.classList.add('fw-normal');
      }

      a.setAttribute('href', `${post.link}`);
      a.setAttribute('data-id', `${post.id}`);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = post.title;
      btn.classList.add('btn', 'btn-primary', 'btn-sm');
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-id', `${post.id}`);
      btn.setAttribute('data-bs-toggle', 'modal');
      btn.setAttribute('data-bs-target', '#modal');
      btn.textContent = 'Просмотр';
      btn.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        const currentPost = posts.find((el) => el.id === id);
        currentPost.state = 'inactive';
        renderModal(post, a, currentPost.state);
      });
      li.append(...[a, btn]);
      return li;
    }).map((li) => ulpost.appendChild(li));
    postsContainer.innerHTML = '';
    postsContainer.innerHTML = '<h2>Посты</h2>';
    postsContainer.appendChild(ulpost);
  };

  const processStateHandle = (processState, watchedState) => {
    if (elements.input.hasAttribute('readonly')) {
      input.removeAttribute('readonly', '');
    }
    if (elements.submitButton.hasAttribute('disabled')) {
      submitButton.disabled = false;
    }
    switch (processState) {
      case 'sending':
        elements.input.setAttribute('readonly', '');
        submitButton.disabled = true;
        break;
      case 'finished':
        renderFeedback(i18nInstance.t(watchedState.formState.processSucces), 'text-success');
        form.reset();
        break;
      case 'failed':
        renderFeedback(i18nInstance.t(watchedState.formState.processError), 'text-danger');
        break;
      default:
        break;
    }
  };

  const validationHandle = (isValid, watchedState) => {
    if (!isValid) {
      elements.divFeedBack.classList.add('text-danger');
      elements.input.classList.add('is-invalid');
      divFeedBack.textContent = i18nInstance.t(watchedState.formState.validError);
    }
    if (isValid) {
      elements.input.classList.remove('is-invalid');
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'formState.processState':
        processStateHandle(value, watchedState);
        break;
      case 'formState.valid':
        validationHandle(value, watchedState);
        break;
      case 'posts':
        renderPosts(watchedState.posts);
        break;
      case 'feeds':
        renderFeeds(watchedState.feeds);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
