export default (xml) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parsererrorNS = parser.parseFromString('INVALID', 'application/xml').getElementsByTagName('parsererror')[0].namespaceURI;
  if (document.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
    throw new Error('Error parsing XML');
  }
  // const channel = document.querySelector('channel');
  // console.log([...channel.children])

  const title = document.querySelector('title');
  const description = document.querySelector('description');
  const posts = Array.from(document.querySelectorAll('item'));

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
