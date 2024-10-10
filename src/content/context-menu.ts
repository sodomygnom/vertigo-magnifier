function enableRightClickCancellation() {
	const { origin } = window.location;
	return browser.storage.sync
		.get([origin])
		.then((res) => Object.hasOwn(res, origin));
}

// https://stackoverflow.com/questions/21335136/how-to-re-enable-right-click-so-that-i-can-inspect-html-elements-in-chrome
export async function fixContextMenu() {
	const shouldCancelRightClick = await enableRightClickCancellation();
	if (shouldCancelRightClick) enableContextMenu();

	function enableContextMenu() {
		void (() => {
			document.body.oncontextmenu = null;
		})();
		enableRightClickLight(document);
	}

	function enableRightClickLight(el: Document) {
		const e = el || document;
		e.addEventListener("contextmenu", bringBackDefault, true);
	}

  function bringBackDefault(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
}