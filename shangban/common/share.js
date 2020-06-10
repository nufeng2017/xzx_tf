/**
 * 分享
 * **/ 
export function sharePage(options, url, title, imageUrl) {
  let str = '?';
  let arr = Object.entries(options).map((item, index) => {
    return item.join('=');
  });
  str = str + arr.join('&');
  return {
    title: title,
    path: url + str,
    imageUrl: imageUrl
  };
}