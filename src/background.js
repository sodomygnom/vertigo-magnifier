function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  }
}

const contextsAll = [
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

function captureTab(tabId, options = {}) {
  return browser.tabs.captureTab(tabId, options);
}

// moz-extension://e377bf84-734f-4297-beb8-306ce5471fa0/imagesearchoptions.js
// function dataURItoBlob(dataURI) {
//   //from https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
//   //convert base64/URLEncoded data component to raw binary data held in a string
//   let byteString;
//   if (dataURI.split(',')[0].indexOf('base64') >= 0)
//     byteString = atob(dataURI.split(',')[1]);
//   else
//     byteString = unescape(dataURI.split(',')[1]);

//   // separate out the mime component
//   const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

//   // write the bytes of the string to a typed array
//   const ia = new Uint8Array(byteString.length);
//   for (let i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }
//   return new Blob([ia], { type: mimeString });
// }

// function googleImageSearch(uri) {
//   const formData = new FormData();
//   formData.append('encoded_image', dataURItoBlob(uri), "Image");
//   const url = "http://www.google.com/searchbyimage/upload";
//   return fetch(url, { body: formData, method: 'post' }).then(res => res.url);
// }
// googleImageSearch(uri).then(redirectURL => browser.tabs.create({ url: redirectURL }));

browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.captureRect) {
    captureTab(sender.tab.id, sender.tab.title, { rect: msg.rect }).then((uri) => {
      browser.tabs.sendMessage(sender.tab.id, { from: "background", uri, screenshot_ok: true });
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