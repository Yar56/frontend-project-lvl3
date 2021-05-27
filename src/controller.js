import axios from 'axios';
import _ from 'lodash';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';

const getRss = (url) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}&disableCache=true`);

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

export default (observer) => (buttonEvent) => {
  buttonEvent.preventDefault();
  const watchedState = observer;
  watchedState.formState.valid = true;

  const data = new FormData(buttonEvent.target);
  const feedUrl = data.get('url');
  const isValid = validateUrl(watchedState.feeds, feedUrl);

  isValid.then(() => {
    watchedState.formState.processState = 'sending';
    getRss(feedUrl)
      .then((response) => {
        const [{ title, description }, postsContent] = parseXml(response.data.contents);

        watchedState.formState.processSucces = 'feedback.succesLoad';
        watchedState.formState.processState = 'finished';
        watchedState.formState.valid = true;

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
          feedUrl,
          title,
          description,
        });
      })
      .then(() => {
        setTimeout(() => updateFeeds(watchedState, feedUrl), 5000);
      })
      .catch((error) => {
        if (error.message === 'Error parsing XML') {
          watchedState.formState.processError = 'feedback.invalidResource';
          watchedState.formState.processState = 'failed';
          watchedState.formState.valid = true;
        }
        if (error.message === 'Network Error') {
          watchedState.formState.processError = 'feedback.networkError';
          watchedState.formState.processState = 'failed';
          watchedState.formState.valid = true;
        }
      });
  }).catch(({ message }) => {
    watchedState.formState.processSucces = '';
    watchedState.formState.validError = message;
    watchedState.formState.processState = 'pending';
    watchedState.formState.valid = false;
  });
};
