import axios from 'axios';
import view from './view.js';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';
import checkDuplicateUrl from './checkDuplicateUrl.js';

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
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.formState.processState = 'sending';

    const data = new FormData(form);
    const queryString = data.get('url');
    const isValid = validateUrl(queryString);
    const isDuplicate = checkDuplicateUrl(watchedState.feeds, queryString);

    watchedState.formState.valid = true;
    if (isDuplicate) {
      watchedState.formState.processSucces = '';
      watchedState.formState.validError = 'RSS уже существует';
      watchedState.formState.processState = 'pending';
      watchedState.formState.valid = false;
    }
    if (!isValid) {
      watchedState.formState.processSucces = '';
      watchedState.formState.validError = 'Ссылка должна быть валидным URL';
      watchedState.formState.processState = 'pending';
      watchedState.formState.valid = false;
    }

    if (isValid && !isDuplicate) {
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(queryString)}`)
        .then((response) => {
          watchedState.formState.processSucces = 'RSS успешно загружен';
          watchedState.formState.processState = 'finished';
          watchedState.formState.valid = true;
          watchedState.formState.processState = 'pending';

          const feedUrl = response.data.status.url;
          const [{ title, description }, postsContent] = parseXml(response.data.contents);

          watchedState.feeds.unshift({
            id: 1,
            feedUrl,
            title,
            description,
          });
          watchedState.posts.unshift(...postsContent);
        })
        .catch((error) => {
          watchedState.formState.processError = 'Ошибка сети';
          watchedState.formState.processState = 'failed';
          watchedState.formState.valid = true;
          watchedState.formState.processState = 'pending';
          console.log(error);
        });
    }
    console.log(state);
  });
};
