const parse = (xmlString) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xmlString, 'application/xml');
  const channel = document.querySelector('channel');

  const [title, description] = [...channel.children].filter((el) => el.tagName === 'title' || el.tagName === 'description');

  const posts = Array.from(channel.children).filter((el) => el.tagName === 'item');

  const postsContent = posts.reduce((acc, item) => {
    const [postTitle, link] = Array.from(item.children)
      .filter((el) => el.tagName === 'title' || el.tagName === 'link')
      .map((el) => el.textContent);
    acc.push({
      postTitle,
      link,
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
