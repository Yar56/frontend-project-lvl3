import onChange from 'on-change';
import validateUrl from './validateUrl.js';
// import * as yup from 'yup';

export default () => {
  const state = {
    formState: {
      state: 'pending', // sending
      validUrl: true,
      validRss: true,
      messages: {
        errors: {},
        success: [],
      },

    },
    feed: [],
    post: [],
  };
  const renderFeedback = (watchedState) => {
    const divFeedBack = document.querySelector('.feedback');
    if (!watchedState.formState.validUrl) {
      divFeedBack.classList.add('text-danger');
      divFeedBack.textContent = watchedState.formState.messages.errors.url;
    }
  };

  const watchedState = onChange(state, (path) => {
    if (path === 'formState.validUrl') {
      renderFeedback(watchedState);
    }
  });

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const url = data.get('url');
    const isValid = validateUrl(url);
    if (!isValid) {
      watchedState.formState.messages.errors.url = 'Ссылка должна быть валидным URL';
      watchedState.formState.validUrl = isValid;
    }
  });
};
