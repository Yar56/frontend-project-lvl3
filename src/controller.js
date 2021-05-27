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

const updateState = ([{ title, description }, postsContent], posts, feeds, feedUrl) => {
  const feedId = _.uniqueId();
  const postsWithId = postsContent.map((post) => {
    _.set(post, 'state', 'active');
    _.set(post, 'id', _.uniqueId());
    _.set(post, 'feedId', feedId);
    return post;
  });
  posts.unshift(...postsWithId);
  feeds.unshift({
    feedId,
    feedUrl,
    title,
    description,
  });
};

const handleGetRequest = (feedUrl, state) => {
  const {
    formState,
    posts,
    feeds,
  } = state;

  getRss(feedUrl)
    .then((response) => {
      const dataContent = parseXml(response.data.contents);
      formState.processSucces = 'feedback.succesLoad';
      formState.processState = 'finished';
      formState.valid = true;

      updateState(dataContent, posts, feeds, feedUrl);
    })
    .then(() => {
      setTimeout(() => updateFeeds(state, feedUrl), 5000);
    })
    .catch((error) => {
      if (error.message === 'Error parsing XML') {
        formState.processError = 'feedback.invalidResource';
        formState.processState = 'failed';
        formState.valid = true;
      }
      if (error.message === 'Network Error') {
        formState.processError = 'feedback.networkError';
        formState.processState = 'failed';
        formState.valid = true;
      }
    });
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
    handleGetRequest(feedUrl, watchedState);
  }).catch(({ message }) => {
    watchedState.formState.processSucces = '';
    watchedState.formState.validError = message;
    watchedState.formState.processState = 'pending';
    watchedState.formState.valid = false;
  });
};
