import axios from 'axios';
import _ from 'lodash';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';
import checkDuplicateUrl from './checkDuplicateUrl.js';

const getRss = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`);

const updateFeeds = (state, url) => {
  getRss(url)
    .then((res) => parseXml(res.data.contents))
    .then(([{ title }, postsContent]) => {
      const feed = state.feeds.find((el) => el.title === title);
      const oldPosts = state.posts.filter(({ feedId }) => feedId === feed.feedId);
      const newPosts = _.differenceBy(postsContent, oldPosts, 'link');
      const newPostsWithId = newPosts.map((post) => ({
        ...post,
        feedId: feed.feedId,
      }));
      state.posts.unshift(...newPostsWithId);
    })
    .catch((err) => console.log(err))
    .finally(() => setTimeout(() => updateFeeds(state, url), 5000));
};

export default (observer) => (e) => {
  e.preventDefault();
  const watchedState = observer;
  watchedState.formState.valid = true;

  const data = new FormData(e.currentTarget);
  const queryString = data.get('url');
  const isValid = validateUrl(queryString);

  isValid.then(() => {
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
            _.set(post, 'state', 'active');
            _.set(post, 'id', _.uniqueId());
            _.set(post, 'feedId', feedId);
            return post;
          });
          watchedState.posts.unshift(...postsWithId);
          watchedState.feeds.unshift({
            feedId,
            feedUrl: queryString,
            title,
            description,
          });
        })
        .then(() => {
          setTimeout(() => updateFeeds(watchedState, queryString), 5000);
        })
        .catch(() => {
          watchedState.formState.processError = 'feedback.networkError';
          watchedState.formState.processState = 'failed';
          watchedState.formState.valid = true;
          // console.log(error);
        });
    }
  }).catch(({ errors }) => {
    watchedState.formState.processSucces = '';
    watchedState.formState.validError = errors.toString();
    watchedState.formState.processState = 'pending';
    watchedState.formState.valid = false;
  });
  // console.log(watchedState);
};
