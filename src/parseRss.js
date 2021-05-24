const parse = (xmlString) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xmlString, 'application/xml');
  const parsererrorNS = parser.parseFromString('INVALID', 'application/xml').getElementsByTagName('parsererror')[0].namespaceURI;
  if (document.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
    throw new Error('Error parsing XML');
  }
  const channel = document.querySelector('channel');

  const [title, description] = [...channel.children].filter((el) => el.tagName === 'title' || el.tagName === 'description');

  const posts = Array.from(channel.children).filter((el) => el.tagName === 'item');

  const postsContent = posts.reduce((acc, item) => {
    const [postTitle, link, postDescription] = Array.from(item.children)
      .filter((el) => el.tagName === 'title' || el.tagName === 'link' || el.tagName === 'description')
      .map((el) => el.textContent);
    acc.push({
      postTitle,
      link,
      postDescription,
    });
    return acc;
  }, []);

  return [
    {
      title: title.textContent,
      description: description.textContent,
    },
    postsContent,
  ];
};
export default parse;
