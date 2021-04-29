import onChange from 'on-change';
import axios from 'axios';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';
// import * as yup from 'yup';

export default () => {
  const state = {
    formState: {
      processState: 'pending', // sending
      processError: null,
      processSucces: null,
      valid: true,
      validError: '',

    },
    feeds: [],
    posts: [],
  };
  const form = document.querySelector('.rss-form');
  const submitButton = document.querySelector('button[type="submit"]');

  const renderFeedback = (value) => {
    const divFeedBack = document.querySelector('.feedback');
    console.log(value);
    divFeedBack.classList.remove('text-success', 'text-danger');
    if (value === 'RSS успешно загружен') {
      divFeedBack.classList.add('text-success');
    } else {
      divFeedBack.classList.add('text-danger');
    }
    form.url.classList.toggle('is-invalid');
    divFeedBack.textContent = value;
  };
  const renderFeeds = (feeds) => {
    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');
    const res = feeds.map((feed) => `
      <li class="list-group-item">
        <h3>${feed.title}</h3>
        <p>${feed.description}</p>
      </li>`);
    feedsContainer.innerHTML = `<h2>Фиды</h2>${res.join('')}`;
  };
  // const renderPosts = (posts) => {
  //   const postsContainer = document.querySelector('.feeds');

  // };

  const processStateHandle = (processState, watchedState) => {
    if (processState === 'pending') {
      submitButton.disabled = false;
    } else if (processState === 'sending') {
      submitButton.disabled = true;
    } else if (processState === 'finished') {
      submitButton.disabled = false;
      renderFeedback(watchedState.formState.processSucces);
      form.reset();
      // рендер фидов и постов
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
      if (!value) {
        renderFeedback(watchedState.formState.validError);
      }
    }
    if (path === 'posts') {
      renderFeeds(watchedState.feeds);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.formState.processState = 'sending';

    const data = new FormData(form);
    const queryString = data.get('url');
    const isValid = validateUrl(queryString);

    if (!isValid) {
      watchedState.formState.validError = 'Ссылка должна быть валидным URL';
      watchedState.formState.processState = 'pending';
      watchedState.formState.valid = isValid;
    }
    if (isValid) {
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(queryString)}`)
        .then((response) => {
          watchedState.formState.processSucces = 'RSS успешно загружен';
          watchedState.formState.processState = 'finished';
          watchedState.formState.valid = true;
          watchedState.formState.processState = 'pending';

          const feedUrl = response.data.status.url;

          const [{ title, description }, postsContent] = parseXml(response.data.contents);

          watchedState.feeds.push({
            id: 1,
            feedUrl,
            title,
            description,
          });
          watchedState.posts = [...postsContent];
        })
        .catch((error) => {
          watchedState.formState.processError = 'Ошибка сети';
          watchedState.formState.processState = 'failed';
          watchedState.formState.valid = true;
          watchedState.formState.processState = 'pending';
          console.log(error);
        });
    }
    // console.log(state);
  });
};
