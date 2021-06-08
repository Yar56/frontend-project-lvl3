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

  const items = [...document.querySelectorAll('item')]
    .map((post) => ({
      title: post.querySelector('title').textContent,
      link: post.querySelector('link').textContent,
      description: post.querySelector('description').textContent,
    }));

  return {
    title,
    description,
    items,
  };
};
