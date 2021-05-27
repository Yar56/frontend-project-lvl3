import i18n from 'i18next';
import { setLocale } from 'yup';
import resources from './locales';
import view from './view.js';
import controller from './controller.js';

export default () => {
  const state = {
    formState: {
      processState: 'pending',
      processError: null,
      processSucces: null,
      valid: true,
      validError: '',
    },
    feeds: [],
    posts: [],
  };

  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();

  const elements = {
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('button[type="submit"]'),
    divFeedBack: document.querySelector('.feedback'),
    input: document.querySelector('.rss-form input'),
  };

  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  setLocale({
    string: {
      url: i18nInstance.t('feedback.invalidUrl'),
    },
    mixed: {
      default: i18nInstance.t('feedback.duplicate'),
    },
  });

  const watchedState = view(state, i18nInstance, elements);
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', controller(watchedState));
};
