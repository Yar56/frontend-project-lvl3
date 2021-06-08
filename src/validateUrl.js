import * as yup from 'yup';

export default (feeds, newFeedUrl) => {
  const blackListUrls = feeds.map((feed) => feed.feedUrl);
  const schema = yup.string().url().notOneOf(blackListUrls);
  return schema.validate(newFeedUrl);
};
