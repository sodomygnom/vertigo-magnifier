export function createContextMenu() {
  const contextsAll = [
    { id: 'search', title: 'search via google.lens 🔍' },
    { id: 'screenshot', title: 'screenshot 📷' },
    { id: 'zoom-inc', title: 'zoom 🔆 +15%' },
    { id: 'zoom-dec', title: 'zoom 🔅 -15%' },
    { id: 'brightness-inc', title: 'brightness 🔆 +25%' },
    { id: 'brightness-dec', title: 'brightness 🔅 -25%' },
    { id: 'mirror', title: 'mirror 🪞' },
    { id: 'rotate-left', title: 'rotate left ↶' },
    { id: 'rotate-right', title: 'rotate right ↷' },
    { id: 'invert', title: 'invert 🙿' },
  ];
  
  contextsAll.forEach((c) => browser.contextMenus.create({ ...c, contexts: ['all'] }));
  
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) {
      console.error('Tab ID is undefined. Cannot send message.');
      return;
    }
    switch (info.menuItemId) {
      case 'search':
        browser.tabs.sendMessage(tab.id, { search: true });
        break;
      case 'screenshot':
        browser.tabs.sendMessage(tab.id, { screenshot: true });
        break;
      default:
        browser.tabs.sendMessage(tab.id, { transform: info.menuItemId });
        break;
    }
  });
}