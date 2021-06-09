import i18n from 'i18next';
import { setLocale } from 'yup';
import resources from './locales';
import view from './view.js';
import controller from './controller.js';
import 'bootstrap/js/dist/modal.js';

export default () => {
  const state = {
    formState: {
      proccess: {
        state: 'pending',
        error: null,
        success: null,
      },
      valid: true,
      validError: null,
    },
    feeds: [],
    viewedPosts: new Set(),
    posts: [],
  };

  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();

  return i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then(() => {
    const elements = {
      form: document.querySelector('.rss-form'),
      submitButton: document.querySelector('button[type="submit"]'),
      divFeedBack: document.querySelector('.feedback'),
      input: document.querySelector('.rss-form input'),
    };

    setLocale({
      string: {
        url: () => ({ key: 'invalidUrl' }),
      },
      mixed: {
        notOneOf: () => ({ key: 'duplicate' }),
      },
    });

    const watchedState = view(state, i18nInstance, elements);
    elements.form.addEventListener('submit', controller(watchedState));
  });
};
