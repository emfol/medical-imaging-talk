
define(function () {
  const query = document.location.search + '';
  const map = Object.create(null);
  if (query.length > 1) {
    const regex = /(?:[?&])?([^=]+)=([^&]+)/g;
    let match;
    while ((match = regex.exec(query)) !== null) {
      map[match[1]] = match[2];
    }
  }
  return Object.freeze({
    get(name) {
      return map[name];
    }
  });
});
