export default (xml) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parseError = document.querySelector('parsererror');
  if (parseError) {
    const errorObject = new Error(parseError.textContent);
    errorObject.isParsingError = true;
    throw errorObject;
  }

  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const items = document.querySelectorAll('item');
  const articles = [...items].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;
    const postDescription = post.querySelector('description').textContent;
    return { postTitle, postLink, postDescription };
  });

  return {
    title,
    description,
    articles,
  };
};
