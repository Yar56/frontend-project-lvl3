import * as yup from 'yup';
// import i18n from 'i18next';

// yup.setLocale({
//   string: {
//     url: i18n.t('feedback.invalidUrl'),
//   },
// });
export default (url) => {
  const schema = yup.string().url();
  return schema.validate(url);
};
