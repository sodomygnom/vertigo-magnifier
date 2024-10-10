import { Logo } from './meta';
import {
  downloadURI,
  Gestures,
  getBoundingClientRectInView,
  getElementTitle,
  type HoveredElement,
  HoveredMediaWatcher,
} from '../utils';
import { fixContextMenu } from './context-menu';
import { MediaTransform } from './media-transform';
import { createOverflow } from './ontop';

const DEFAULT_CONTROL_KEY = 'Shift';

function sync(gestures: Gestures) {
  function setKey() {
    browser.storage.local.get(['controlKey']).then((result) => {
      gestures.setControlKey(result?.controlKey || DEFAULT_CONTROL_KEY);
    });
  }
  setKey();

  browser.storage.onChanged.addListener(() => setKey());
}

function init() {
  fixContextMenu();
  const mediaTransform = new MediaTransform();
  const hoveredMediaWatcher = new HoveredMediaWatcher();
  const gestures = new Gestures();

  let captureCallback: (() => void) | undefined;
  let mediaElement_: HTMLElement | undefined;

  browser.runtime.onMessage.addListener((msg) => {
    if (msg.transform || msg.screenshot || msg.search) {
      const { mediaElement } = hoveredMediaWatcher.findHoveredMedia() as HoveredElement;
      mediaElement_ = mediaElement;
    }

    if (msg.search && mediaElement_) {
      const src = mediaElement_?.getAttribute('src');
      if (!src) return;
      browser.runtime.sendMessage({ searchImageGoogle: true, src });
    }

    if (msg.screenshot_ok) {
      downloadURI(msg.uri, `${getElementTitle(mediaElement_ as HTMLElement)}.png`);
      captureCallback?.();
    }

    if (msg.screenshot && mediaElement_) {
      const { removeOverflow } = createOverflow(mediaElement_);
      captureCallback = removeOverflow;
      const { x, y, height, width } = getBoundingClientRectInView(mediaElement_);
      browser.runtime.sendMessage({captureRect: true, rect: { x, y, height, width }});
    }

    if (msg.reset) {
      mediaTransform.resetAllMedia();
    }

    if (msg.transform) {
      mediaTransform.handleCommand(msg.transform, mediaElement_ as HTMLElement);
    }
  });

  sync(gestures);

  gestures.subscribe((zoomFactor: number) => {
    const { x, y, mediaElement } = hoveredMediaWatcher.findHoveredMedia() as HoveredElement;
    if (mediaElement) {
      mediaTransform.zoom(x, y, zoomFactor, mediaElement);
    }
  });
}

init();
console.log(Logo);
