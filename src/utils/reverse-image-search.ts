import { dataURItoBlob } from "./parsers";

const parseURL = (str: string): string => {
  return decodeURIComponent(
    (str.match(/\/search?.*/g)?.[1] as string)
    .replace(/[\\]+u003d/g, '=')
    .replace(/[\\]+u0026/g, '&')
    .replace(/%3D.*/, () => '')
    .replace(/&quot.*/, () => ''));
}

// https://github.com/molotochok/item-search-extension/blob/68ef3195aa380e6470533c328cbef3e6e87321c5/src/background/index.js#L33
export async function googleImageSearch(uri: string, width: string, height: string) {
  const formData = new FormData();
  console.log({width, height});
  const encoded_image = await dataURItoBlob(uri);
  formData.append('encoded_image', encoded_image, "Image");
  formData.append('processed_image_dimensions', `${width},${height}`);
  const url = `https://lens.google.com/v3/upload?hl=en-UA&re=df&stcs=${Date.now()}&vpw=${width}&vph=${height}&ep=subb`;
  const headers = {
    'Referer': 'https://lens.google.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };
  const str = await fetch(url, { body: formData, method: 'POST', headers }).then(r => r.text());
  console.log({str});
  return `https://lens.google.com${parseURL(str)}`;
}

export function googleImageSearchSrc(src: string) {
  return `https://lens.google.com/uploadbyurl?url=${src}`;
}
