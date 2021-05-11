import onChange from 'on-change';
import { setLocale } from 'yup';

export default (state, i18nInstance) => {
  setLocale({
    string: {
      url: i18nInstance.t('feedback.invalidUrl'),
    },
  });

  const form = document.querySelector('.rss-form');
  const submitButton = document.querySelector('button[type="submit"]');
  const divFeedBack = document.querySelector('.feedback');

  const renderFeedback = (value) => {
    divFeedBack.classList.remove('text-success', 'text-danger');
    if (value === 'RSS успешно загружен') {
      divFeedBack.classList.add('text-success');
    } else {
      form.url.classList.add('is-invalid');
      divFeedBack.classList.add('text-danger');
    }

    divFeedBack.textContent = value;
  };

  const renderFeeds = (feeds) => {
    const feedsContainer = document.querySelector('.feeds');
    const ulfeed = document.createElement('ul');
    ulfeed.classList.add('list-group', 'mb-5');
    const feedsContent = feeds.map((feed) => `
      <li class="list-group-item">
        <h3>${feed.title}</h3>
        <p>${feed.description}</p>
      </li>`);
    ulfeed.innerHTML = feedsContent.join('');
    feedsContainer.innerHTML = `<h2>Фиды</h2>${ulfeed.outerHTML}`;
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
    modalTitle.textContent = content.postTitle;
    modalBody.textContent = content.postDescription;
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
      a.textContent = post.postTitle;
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
      li.appendChild(a);
      li.appendChild(btn);

      return li;
    }).map((li) => ulpost.appendChild(li));
    postsContainer.innerHTML = '';
    postsContainer.innerHTML = '<h2>Посты</h2>';
    postsContainer.appendChild(ulpost);
  };

  const processStateHandle = (processState, watchedState) => {
    if (processState === 'pending') {
      submitButton.disabled = false;
    } else if (processState === 'sending') {
      submitButton.disabled = true;
    } else if (processState === 'finished') {
      submitButton.disabled = false;
      renderFeedback(i18nInstance.t(watchedState.formState.processSucces));
      form.reset();
    } else if (processState === 'failed') {
      submitButton.disabled = false;
      renderFeedback(i18nInstance.t(watchedState.formState.processError));
    }
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'formState.processState') {
      processStateHandle(value, watchedState);
    }
    if (path === 'formState.valid') {
      if (!value) {
        divFeedBack.classList.add('text-danger');
        form.url.classList.add('is-invalid');
        divFeedBack.textContent = i18nInstance.t(watchedState.formState.validError);
      }
    }
    if (path === 'posts') {
      renderPosts(watchedState.posts);
    }
    if (path === 'feeds') {
      renderFeeds(watchedState.feeds);
    }
  });
  return watchedState;
};
