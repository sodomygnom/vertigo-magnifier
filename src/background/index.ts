import { googleImageSearchSrc } from "../utils/reverse-image-search";
import { createContextMenu } from "./context-menu";

createContextMenu();

browser.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (msg.searchImageGoogle) {
    browser.tabs.create({ url: googleImageSearchSrc(msg.src) });
  }
  if (msg.captureRect && tabId) {
    browser.tabs.captureTab(tabId, { rect: msg.rect }).then((uri) => {
      browser.tabs.sendMessage(tabId, { from: "background", uri, screenshot_ok: true });
    });
  }
});

