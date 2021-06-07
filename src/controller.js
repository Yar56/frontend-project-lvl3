import axios from 'axios';
import _ from 'lodash';
import validateUrl from './validateUrl.js';
import parseXml from './parseRss.js';

const createUrl = (uri) => {
  const feedUrl = uri;
  const isDisableCache = true;
  const proxy = 'https://hexlet-allorigins.herokuapp.com/';
  const pathName = 'get';

  const url = new URL(proxy);
  url.pathname = pathName;
  url.searchParams.set('url', feedUrl);
  url.searchParams.set('disableCache', isDisableCache);
  return url;
};

const updateFeeds = (state, updatedUrl) => {
  axios.get(createUrl(updatedUrl))
    .then((res) => parseXml(res.data.contents))
    .then(({ title, postsContent }) => {
      const feed = state.feeds.find((el) => el.title === title);
      const oldPosts = state.posts.filter(({ feedId }) => feedId === feed.feedId);
      const newPosts = _.differenceBy(postsContent, oldPosts, 'postLink');
      const newPostsWithId = newPosts.map((post) => ({
        ...post,
        feedId: feed.feedId,
      }));
      state.posts.unshift(...newPostsWithId);
    })
    .catch((err) => console.log(err))
    .finally(() => setTimeout(() => updateFeeds(state, updatedUrl), 5000));
};

const updateState = ({ title, description, items }, posts, feeds, feedUrl) => {
  const feedId = _.uniqueId();
  const postsWithId = items.map((post) => ({ ...{ postState: 'active', postId: _.uniqueId(), feedId }, ...post }));
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

  axios.get(createUrl(feedUrl))
    .then((response) => {
      const dataContent = parseXml(response.data.contents);

      formState.processSucces = 'feedback.succesLoad';
      formState.processState = 'finished';
      formState.valid = true;

      return updateState(dataContent, posts, feeds, feedUrl);
    })
    .then(() => {
      setTimeout(() => updateFeeds(state, feedUrl), 5000);
    })
    .catch((error) => {
      console.log(error);
      if (error.isAxiosError) {
        formState.processError = 'feedback.networkError';
        formState.processState = 'failed';
        formState.valid = true;
      }
      if (error.isParsingError) {
        formState.processError = 'feedback.invalidResource';
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

  validateUrl(watchedState.feeds, feedUrl)
    .then(() => {
      watchedState.formState.processState = 'sending';
      handleGetRequest(feedUrl, watchedState);
    }).catch(({ message }) => {
      watchedState.formState.processSucces = '';
      watchedState.formState.validError = message;
      watchedState.formState.processState = 'pending';
      watchedState.formState.valid = false;
    });
};
