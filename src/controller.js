import axios from 'axios';
import _ from 'lodash';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';
import checkDuplicateUrl from './checkDuplicateUrl.js';

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
      const getRss = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`);

      getRss(queryString)
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
          return response;
        })
        .then(() => {
          const delay = 5000;

          setTimeout(function request() {
            getRss(queryString).then((res) => {
              console.log(res.data);
              // const con = parseXml(res.data.contents);
              // console.log(con)
              setTimeout(request, delay);
            }).catch((err) => {
              setTimeout(request, delay);
              console.log(err);
            });
          }, delay);
        })
        .catch((error) => {
          watchedState.formState.processError = 'feedback.networkError';
          watchedState.formState.processState = 'failed';
          watchedState.formState.valid = true;
          // watchedState.formState.processState = 'pending';
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
