import * as yup from 'yup';

export default (feeds, newFeedUrl) => {
  const schema = yup.string().url()
    .test('dupl', () => {
      const res = feeds.find((el) => el.feedUrl === newFeedUrl);
      return res === undefined;
    });
  return schema.validate(newFeedUrl);
};
