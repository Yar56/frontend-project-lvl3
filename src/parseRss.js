export default (xml) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parseError = document.querySelector('parsererror');

  if (parseError) {
    throw new Error('Error parsing XML');
  }
  console.log(document);
  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const posts = document.querySelectorAll('item');
  const postsContent = [...posts].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;
    const postDescription = post.querySelector('description').textContent;
    return { postTitle, postLink, postDescription };
  });
  console.log(postsContent);

  // const getContent = (item) => {
  //   const tagNames = ['title', 'link', 'description'];
  //   const mapping = {
  //     title: (el) => el.textContent,
  //     link: (el) => el.textContent,
  //     description: (el) => el.textContent,
  //   };

  //   return Array.from(item.children)
  //     .filter((el) => tagNames.includes(el.tagName))
  //     .reduce((acc, el) => {
  //       acc[`${el.tagName}`] = mapping[el.tagName](el);
  //       return acc;
  //     }, {});
  // };

  // const postsContent2 = Array.from(posts).map((item) => getContent(item));
  // console.log(postsContent2)
  return {
    title,
    description,
    postsContent,
  };
};
