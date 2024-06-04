const keyName = document.querySelector('#key-name');
const keyChangeButton = document.querySelector('#key-change');
const keyHelp = document.querySelector('#key-help');

const resetTransformsButton = document.querySelector('#reset-all-transforms');

const rightClickCancellationButton = document.querySelector('#right-click');
const rightClickCancellationState = document.querySelector('#right-click-state');
const rightClickCancellationHelp = document.querySelector('#right-click-help');


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
    rightClickCancellationState.innerText = hasOrigin ? '❌' : '✔️';
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

rightClickCancellationButton.addEventListener('click', async () => {
  await switchRightClickState()
  await checkRightClickState();
  rightClickCancellationHelp.style.opacity = '1';
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