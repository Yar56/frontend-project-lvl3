import axios from 'axios';
import _ from 'lodash';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';
import checkDuplicateUrl from './checkDuplicateUrl.js';

export default (observer) => (e) => {
  e.preventDefault();
  const watchedState = observer;
  watchedState.formState.processState = 'sending';

  const data = new FormData(e.currentTarget);
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
        watchedState.formState.processError = 'Ошибка сети';
        watchedState.formState.processState = 'failed';
        watchedState.formState.valid = true;
        watchedState.formState.processState = 'pending';
        console.log(error);
      });
  }
  console.log(watchedState);
};
