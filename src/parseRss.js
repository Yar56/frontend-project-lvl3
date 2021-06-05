export default (xml) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parseError = document.querySelector('parsererror');

  if (parseError) {
    throw new Error('Error parsing XML');
  }
  const title = document.querySelector('title').textContent;
  const description = document.querySelector('description').textContent;
  const posts = document.querySelectorAll('item');
  const postsContent = [...posts].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;
    const postDescription = post.querySelector('description').textContent;
    return { postTitle, postLink, postDescription };
  });

  return {
    title,
    description,
    postsContent,
  };
};
