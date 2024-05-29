function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  }
}

const contextsAll = [
  { id: "search", title: "search via google.lens 🔍" },
  { id: "screenshot", title: "screenshot 📷" },
  { id: "brightness-inc", title: "brightness 🔆 +25%" },
  { id: "brightness-dec", title: "brightness 🔅 -25%" },
  { id: "mirror", title: "mirror 🪞" },
  { id: "rotate-left", title: "rotate left ↶" },
  { id: "rotate-right", title: "rotate right ↷" },
  { id: "invert", title: "invert 🙿" }
];

contextsAll.forEach(c => {
  browser.contextMenus.create({ ...c, contexts: ["all"] }, onCreated);
});

// moz-extension://e377bf84-734f-4297-beb8-306ce5471fa0/imagesearchoptions.js
function dataURItoBlob(dataURI) {
  //from https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
  //convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeString });
}

// https://github.com/molotochok/item-search-extension/blob/68ef3195aa380e6470533c328cbef3e6e87321c5/src/background/index.js#L33
function googleImageSearch(uri, width, height) {
  const formData = new FormData();
  formData.append('encoded_image', dataURItoBlob(uri), "Image");
  formData.append('processed_image_dimensions', `${width},${height}`);
  const url = "https://lens.google.com/v3/upload?vpw=1280&vph=540";
  const parseURL = (str) => {
    return str.match(/\/search?.*/g)[1]
      .replace(/[\\]+u003d/g, '=')
      .replace(/[\\]+u0026/g, '&')
      .replace(/%3D.*/, () => '');
  }
  return fetch(url, { body: formData, method: 'post' }).then(async res => {
    const str = await res.text();
    return `https://lens.google.com${parseURL(str)}`;
  });
}

function captureTab(tabId, options = {}) {
  return browser.tabs.captureTab(tabId, options);
}

browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.captureRect) {
    captureTab(sender.tab.id, { rect: msg.rect }).then((uri) => {
      browser.tabs.sendMessage(sender.tab.id, { from: "background", uri, screenshot_ok: true });
      googleImageSearch(uri, msg.rect.width, msg.rect.height).then(redirectURL => {
        console.log(redirectURL);
        browser.tabs.create({ url: redirectURL })
      });
    });
  }
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "screenshot":
      browser.tabs.sendMessage(tab.id, { from: "background", screenshot: true });
      break;
    default:
      browser.tabs.sendMessage(tab.id, { from: "background", transform: true, [info.menuItemId]: true });
      break;
  }
});