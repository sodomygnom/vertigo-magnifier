const keyName = document.querySelector('#key-name');
const keyChangeButton = document.querySelector('#key-change');
const keyHelp = document.querySelector('#key-help');

const resetTransformsButton = document.querySelector('#reset-all-transforms');

const rightClickCancelationButton = document.querySelector('#right-click');
const rightClickCancelationState = document.querySelector('#right-click-state');
const rightClickCancelationHelp = document.querySelector('#right-click-help');


async function getTab() {
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

async function getOrigin() {
  const tab = await getTab();
  const { origin } = new URL(tab.url);
  return origin;
}

async function checkRightClickState() {
  const origin = await getOrigin();
  await browser.storage.sync.get([origin]).then((res) => {
    const hasOrigin = Object.hasOwn(res, origin);
    rightClickCancelationState.innerText = hasOrigin ? '❌' : '✔️';
  });
};

async function switchRightClickState() {
  const origin = await getOrigin();
  await browser.storage.sync.get([origin]).then(async (res) => {
    if (Object.hasOwn(res, origin)) {
      await browser.storage.sync.remove([origin]);
    } else {
      await browser.storage.sync.set({ [origin]: true });
    }
  });
};

window.addEventListener('focus', checkRightClickState);

rightClickCancelationButton.addEventListener('click', async () => {
  await switchRightClickState()
  await checkRightClickState();
  rightClickCancelationHelp.style.opacity = '1';
});

keyChangeButton.addEventListener('click', () => {
  keyHelp.style.opacity = '1';
  window.addEventListener('keydown', (e) => {
    browser.storage.local.set({ controlKey: e.key });
    keyHelp.style.opacity = '0';
  }, { once: true });
});

resetTransformsButton.addEventListener('click', async () => {
  await sendMessage({ reset: true })
});

(function sync() {
  function setKey() {
    browser.storage.local.get(["controlKey"]).then((result) => {
      keyName.innerText = result.controlKey || keyName.innerText;
    });
  }

  setKey();

  browser.storage.onChanged.addListener(() => {
    setKey();
  });
})();

async function sendMessage(message) {
  const tab = await getTab();
  await browser.tabs.sendMessage(tab.id, message);
}