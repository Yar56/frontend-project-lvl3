import view from './view.js';
import controller from './controller.js';

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

  const watchedState = view(state);

  form.addEventListener('submit', controller(watchedState));
};
