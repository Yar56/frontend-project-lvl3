export default (feeds, query) => {
  const res = feeds.find((el) => el.feedUrl === query);
  return res !== undefined;
};
