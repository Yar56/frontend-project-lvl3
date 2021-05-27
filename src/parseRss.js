export default (xml) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parsererrorNS = parser.parseFromString('INVALID', 'application/xml').getElementsByTagName('parsererror')[0].namespaceURI;
  if (document.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
    throw new Error('Error parsing XML');
  }

  const title = document.querySelector('title');
  const description = document.querySelector('description');
  const posts = Array.from(document.querySelectorAll('item'));

  const getContent = (item) => {
    const tagNames = ['title', 'link', 'description'];
    const mapping = {
      title: (el) => el.textContent,
      link: (el) => el.textContent,
      description: (el) => el.textContent,
    };

    return Array.from(item.children)
      .filter((el) => tagNames.includes(el.tagName))
      .reduce((acc, el) => {
        acc[`${el.tagName}`] = mapping[el.tagName](el);
        return acc;
      }, {});
  };

  const postsContent = Array.from(posts).map((item) => getContent(item));
  return [
    {
      title: title.textContent,
      description: description.textContent,
    },
    postsContent,
  ];
};
