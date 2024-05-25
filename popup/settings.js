const keyname = document.querySelector('#key-name');
const changeb = document.querySelector('#change-key');
const help = document.querySelector('#help');
const resetb = document.querySelector('#reset-zoom');

changeb.addEventListener('click', () => {
  help.style.opacity = '1';
  window.addEventListener('keydown', (e) => {
    browser.storage.local.set({ controlKey: e.key });
    help.style.opacity = '0';
  });
});

resetb.addEventListener('click', async () => {
  await sendMessage({ reset: true })
});

(function sync() {
  function setKey() {
    browser.storage.local.get(["controlKey"]).then((result) => {
      keyname.innerText = result.controlKey || keyname.innerText;
    });
  }

  setKey();

  browser.storage.onChanged.addListener(() => {
    setKey();
  });
})();

async function sendMessage(message) {
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  await browser.tabs.sendMessage(tab.id, message);
}