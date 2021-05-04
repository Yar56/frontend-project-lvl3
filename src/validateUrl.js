import * as yup from 'yup';

export default (url) => {
  const schema = yup.string().url();
  return schema.validate(url);
};
