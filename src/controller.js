import axios from 'axios';
import _ from 'lodash';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';
import checkDuplicateUrl from './checkDuplicateUrl.js';

const getRss = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`);

export default (observer) => (e) => {
  e.preventDefault();
  const watchedState = observer;
  watchedState.formState.valid = true;

  const data = new FormData(e.currentTarget);
  const queryString = data.get('url');
  const isValid = validateUrl(queryString);

  isValid.then(() => {
    // console.log(url)
    const isDuplicate = checkDuplicateUrl(watchedState.feeds, queryString);
    if (isDuplicate) {
      watchedState.formState.processSucces = '';
      watchedState.formState.validError = 'feedback.duplicate';
      watchedState.formState.processState = 'pending';
      watchedState.formState.valid = false;
    } else {
      watchedState.formState.processState = 'sending';
      getRss(queryString)
        .then((response) => {
          watchedState.formState.processSucces = 'feedback.succesLoad';
          watchedState.formState.processState = 'finished';
          watchedState.formState.valid = true;
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
        .then(() => {
          const updateFeeds = (url) => {
            getRss(url)
              .then((res) => parseXml(res.data.contents))
              .then((xml) => {
                
              })
              .catch((err) => console.log(err))
              .finally(() => setTimeout(() => updateFeeds(url), 5000));
          };
          updateFeeds(queryString)
        })
        .catch((error) => {
          watchedState.formState.processError = 'feedback.networkError';
          watchedState.formState.processState = 'failed';
          watchedState.formState.valid = true;
          console.log(error);
        });
    }
  }).catch(({ errors }) => {
    watchedState.formState.processSucces = '';
    watchedState.formState.validError = errors.toString();
    watchedState.formState.processState = 'pending';
    watchedState.formState.valid = false;
  });
  console.log(watchedState);
};
