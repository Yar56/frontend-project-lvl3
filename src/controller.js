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

const updateState = ({ title, description, items }, posts, viewedPosts, feeds, feedUrl) => {
  const feedId = _.uniqueId();
  const postsWithId = items.map((post) => ({ ...{ id: _.uniqueId(), feedId }, ...post }));

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
    viewedPosts,
  } = state;

  axios.get(createUrl(feedUrl))
    .then((response) => {
      const dataContent = parseXml(response.data.contents);

      formState.proccess.success = 'succesLoad';
      formState.proccess.state = 'finished';
      formState.valid = true;

      return updateState(dataContent, posts, viewedPosts, feeds, feedUrl);
    })
    .then(() => {
      setTimeout(() => updateFeeds(state, feedUrl), 5000);
    })
    .catch((error) => {
      console.log(error);
      if (error.isAxiosError) {
        formState.proccess.error = 'networkError';
        formState.proccess.state = 'failed';
        formState.valid = true;
      }
      if (error.isParsingError) {
        formState.proccess.error = 'invalidResource';
        formState.proccess.state = 'failed';
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
      watchedState.formState.proccess.state = 'sending';
      handleGetRequest(feedUrl, watchedState);
    }).catch(({ message }) => {
      watchedState.formState.proccess.success = '';
      watchedState.formState.validError = message.key;
      watchedState.formState.proccess.state = 'pending';
      watchedState.formState.valid = false;
    });
};
