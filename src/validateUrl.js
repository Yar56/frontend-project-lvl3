import * as yup from 'yup';

export default (feeds, string) => {
  const schema = yup.string().url()
    .test('dupl', () => {
      const res = feeds.find((el) => el.feedUrl === string);
      return res === undefined;
    });
  return schema.validate(string);
};
