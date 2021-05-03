import axios from 'axios';
import _ from 'lodash';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';
import checkDuplicateUrl from './checkDuplicateUrl.js';

export default (observer) => (e) => {
  e.preventDefault();
  const watchedState = observer;

  const data = new FormData(e.currentTarget);
  const queryString = data.get('url');
  const isValid = validateUrl(queryString);
  // нужно сделать асинхронную валидацию и
  // при успехе делать что то а при ошибке записывать в стейт путь до текста
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
    watchedState.formState.processState = 'sending';
    axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(queryString)}`)
      .then((response) => {
        watchedState.formState.processSucces = 'feedback.succesLoad';
        watchedState.formState.processState = 'finished';
        watchedState.formState.valid = true;
        // watchedState.formState.processState = 'pending';

        const [{ title, description }, postsContent] = parseXml(response.data.contents);
        const feedId = _.uniqueId();
        const postsWithId = postsContent.map((post) => {
          _.set(post, 'feedId', feedId);
          return post;
        });
        watchedState.feeds.unshift({
          feedId,
          feedUrl: queryString,
          title,
          description,
        });
        watchedState.posts.unshift(...postsWithId);
      })
      .catch((error) => {
        watchedState.formState.processError = 'feedback.networkError';
        watchedState.formState.processState = 'failed';
        watchedState.formState.valid = true;
        // watchedState.formState.processState = 'pending';
        console.log(error);
      });
  }
  console.log(watchedState);
};
