import onChange from 'on-change';

export default (state, i18nInstance, elements) => {
  const {
    form,
    submitButton,
    divFeedBack,
    input,
  } = elements;

  const renderFeedback = (value, style) => {
    divFeedBack.classList.remove('text-success', 'text-danger');
    divFeedBack.classList.add(style);
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
      li.append(h3, p);
      return li;
    }).map((li) => ulfeed.append(li));
    feedsContainer.innerHTML = '';
    feedsContainer.innerHTML = `<h2>${i18nInstance.t('mainTexts.channels')}</h2>`;
    feedsContainer.appendChild(ulfeed);
  };

  const renderModal = (content) => {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalLink = document.querySelector('.full-article');
    const modalClose = modalLink.nextElementSibling;

    modalTitle.textContent = content.title;
    modalBody.textContent = content.description;
    modalLink.setAttribute('href', content.link);
    modalLink.textContent = i18nInstance.t('modalTexts.full-artcile');
    modalClose.textContent = i18nInstance.t('modalTexts.close-modal');
  };

  const renderPosts = (posts, viewedPosts) => {
    const postsContainer = document.querySelector('.posts');
    const ulpost = document.createElement('ul');
    ulpost.classList.add('list-group');

    posts.map((post) => {
      const {
        title,
        link,
        id,
      } = post;

      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const a = document.createElement('a');
      const btn = document.createElement('button');

      const className = viewedPosts.has(id) ? 'fw-normal' : 'fw-bold';
      a.classList.add(className);

      a.setAttribute('href', `${link}`);
      a.setAttribute('data-id', `${id}`);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = title;
      btn.classList.add('btn', 'btn-primary', 'btn-sm');
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-id', `${id}`);
      btn.setAttribute('data-bs-toggle', 'modal');
      btn.setAttribute('data-bs-target', '#modal');
      btn.textContent = i18nInstance.t('mainTexts.viewButton');

      btn.addEventListener('click', ({ target }) => {
        viewedPosts.add(target.dataset.id);
        renderModal(post);
      });

      li.append(a, btn);
      return li;
    }).map((li) => ulpost.appendChild(li));
    postsContainer.innerHTML = '';
    postsContainer.innerHTML = `<h2>${i18nInstance.t('mainTexts.posts')}</h2>`;
    postsContainer.appendChild(ulpost);
  };

  const processStateHandle = (processState, watchedState) => {
    const { formState: { proccess: { error, success } } } = watchedState;
    switch (processState) {
      case 'sending':
        input.setAttribute('readonly', '');
        submitButton.disabled = true;
        break;
      case 'finished':
        input.removeAttribute('readonly');
        submitButton.disabled = false;
        renderFeedback(i18nInstance.t([`feedback.${success}`, 'feedback.unknown']), 'text-success');
        form.reset();
        break;
      case 'failed':
        input.removeAttribute('readonly');
        submitButton.disabled = false;
        renderFeedback(i18nInstance.t([`feedback.${error}`, 'feedback.unknown']), 'text-danger');
        break;
      default:
        break;
    }
  };

  const validationHandle = (isValid, watchedState) => {
    const { formState: { validError } } = watchedState;
    if (!isValid) {
      divFeedBack.classList.add('text-danger');
      input.classList.add('is-invalid');
      divFeedBack.textContent = i18nInstance.t([`feedback.${validError}`, 'feedback.unknown']);
    }
    if (isValid) {
      input.classList.remove('is-invalid');
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'formState.proccess.state':
        processStateHandle(value, watchedState);
        break;
      case 'formState.valid':
        validationHandle(value, watchedState);
        break;
      case 'posts':
        renderPosts(watchedState.posts, watchedState.viewedPosts);
        break;
      case 'viewedPosts':
        renderPosts(watchedState.posts, watchedState.viewedPosts);
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
