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

browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.captureRect) {
    captureTab(sender.tab.id, { rect: msg.rect }).then((uri) => {
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