import onChange from 'on-change';
import axios from 'axios';
import validateUrl from './validateUrl.js';
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
    feed: [],
    post: [],
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
    divFeedBack.textContent = value;
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
      // рендер фидов и постов
    } else if (processState === 'failed') {
      renderFeedback(watchedState.formState.processError);
    }
  };
  const watchedState = onChange(state, (path, value) => {
    if (path === 'formState.processState') {
      processStateHandle(value, watchedState);
    }
    if (path === 'formState.valid') {
      // const divFeedBack = document.querySelector('.feedback');
      if (!value) {
        renderFeedback(watchedState.formState.validError);
      }
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
      // watchedState.formState.valid = isValid;
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(queryString)}`)
        .then((response) => {
          watchedState.formState.processSucces = 'RSS успешно загружен';
          watchedState.formState.processState = 'finished';
          // watchedState.formState.processState = 'pending';
          console.log(response);
        })
        .catch((error) => {
          watchedState.formState.processState = 'pending';
          watchedState.formState.processError = 'Ошибка сети';
          watchedState.formState.processState = 'failed';
          console.log(error);
        });
    }
  });
  console.log(state);
};
