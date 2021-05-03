import i18next from 'i18next';
import resources from './locales';
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
  const defaultLanguage = 'ru';
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then((t) => {
    const watchedState = view(state, t);
    form.addEventListener('submit', controller(watchedState));
  });
};
