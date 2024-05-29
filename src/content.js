const Logo = `⠡⠡⠡⠡⠡⣡⣥⡡⠡⠡⠡⠡⢡⣡⡥⠡⡑⡑⢕⢕
⠪⠨⠨⡈⠢⣹⣗⣍⣾⢿⢿⢷⣫⣻⡇⢕⢌⠪⡢⡱
⡑⠅⠕⠌⠬⢞⣔⠇⠅⢸⢸⢸⢸⡺⡯⡢⡑⡕⡜⡜
⡌⡊⡊⡊⣺⣿⢸⠨⡪⡪⡪⡪⡢⡹⣽⡎⡎⡎⡎⡎
⡪⡪⡪⡪⣺⣿⢸⢸⢸⢸⢸⢸⢸⢸⣽⡇⡇⡇⡇⡇
⢎⠪⡪⡪⡪⡺⡯⣮⡪⡪⡊⡊⣤⢷⡇⡇⡇⡇⡇⡇
⢣⢣⢪⢪⢪⢪⢹⠱⠿⠿⡻⣽⠫⣣⢣⢣⢣⢣⢣⢣
⡆⡣⡣⡣⡣⡣⡣⢍⢎⢇⢇⢇⣿⡿⣧⡇⡇⡇⡇⡇
⢱⢱⢱⢱⢱⢱⢱⢱⢱⢱⢱⢱⢱⣟⣗⣿⢸⢸⢸⢸
⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢺⢹⢱⢱⢱⢱⢱`;

const DEFAULT_CONTROL_KEY = 'Shift';

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function keyPressed_(keyName) {
  const state = { pressed: false };

  window.addEventListener('keydown', (e) => {
    if (e.key === keyName) {
      state.pressed = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === keyName) {
      state.pressed = false;
    }
  });

  window.addEventListener("blur", () => { state.pressed = false; });

  return state;
}

function getMousePosPercentage(el, e) {
  const rect = el.getBoundingClientRect();
  const x = Math.round(((e.clientX - rect.left) / (rect.right - rect.left)) * 100);
  const y = Math.round(((e.clientY - rect.top) / (rect.bottom - rect.top)) * 100);
  return { x, y };
}

function trackMouse() {
  const state = { event: {} };
  window.addEventListener('mousemove', (e) => { state.event = e; }, { passive: true });
  window.addEventListener('contextmenu', (e) => { state.event = e; }, { passive: true });
  return state;
}

function parentHideOverflow(el, depth = 2) {
  traversParents(el, (parent) => {
    if (parent.clientHeight > 0 && parent.clientWidth > 0) {
      parent.style.overflow = 'hidden';
      return true;
    }
  }, depth)
}

function traversParents(el, callback, depth = 10) {
  let level = depth;
  let parent = el.parentElement;
  while (level > 0 && parent) {
    const stop = callback(parent);
    if (stop) break;
    parent = parent.parentElement;
    level--;
  }
}

// https://stackoverflow.com/questions/21335136/how-to-re-enable-right-click-so-that-i-can-inspect-html-elements-in-chrome
function fixContextMenu() {
  function enableContextMenu() {
    void ((() => { document.body.oncontextmenu = null })());
    enableRightClickLight(document);
  }

  function enableRightClickLight(el) {
    const e = el || document;
    e.addEventListener("contextmenu", bringBackDefault, true);
  }

  function bringBackDefault(event) {
    event.returnValue = true;
    (typeof event.stopPropagation === 'function') &&
      event.stopPropagation();
    (typeof event.cancelBubble === 'function') &&
      event.cancelBubble();
  }

  enableContextMenu();
}

function downloadURI(uri, name) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.click();
}

class HoveredMediaWatcher {
  opacityThreshold = 0.1;

  constructor() {
    this.hoveredMedia_ = null;
    this.mouse = trackMouse();
    this.watchHoveredMedia();
  }

  isVisible(element) {
    const computedStyle = window.getComputedStyle(element);
    const opacity = Number.parseFloat(computedStyle.getPropertyValue("opacity"));
    const display = computedStyle.getPropertyValue("display");
    const visibility = computedStyle.getPropertyValue("visibility");
    return opacity > this.opacityThreshold && display !== "none" && visibility !== "hidden";
  }

  findTopmost(els) {
    let highest = 0;
    let highestZIndex = 0;

    const getZIndex = (el) => {
      const computedStyle = window.getComputedStyle(el);
      const isAbsolute = computedStyle.getPropertyValue('position') === 'absolute' ? 0.5 : 0;
      return Number.parseInt(computedStyle.getPropertyValue('z-index')) || isAbsolute;
    }

    els.forEach((el, i) => {
      let zIndex = getZIndex(el.mediaElement);
      traversParents(el.mediaElement, (parent) => {
        if (zIndex > 0) return true;
        zIndex = getZIndex(parent);
      }, 15);
      if (zIndex > highestZIndex) {
        highestZIndex = zIndex;
        highest = i;
      }
    });

    return els[highest];
  }

  watchHoveredMedia() {
    document.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'IMG' ||
        e.target.tagName === 'VIDEO' ||
        this.hasBackgroundImage(e.target)) {
        this.hoveredMedia_ = e.target;
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target === this.hoveredMedia_) {
        this.hoveredMedia_ = null;
      }
    });
  }

  hasBackgroundImage(e) {
    return e.style.backgroundImage.includes('url');
  }

  findHoveredMedia = () => {
    if (this.hoveredMedia_ && this.isVisible(this.hoveredMedia_)) {
      const { x, y } = getMousePosPercentage(this.hoveredMedia_, this.mouse.event);
      if (x > 0 && x < 100 && y > 0 && y < 100) {
        return { x, y, mediaElement: this.hoveredMedia_ };
      }
    }

    const findHoveredMediaElement = () => {
      const res = [];
      const mediaElements = Array.from(document.querySelectorAll('video,img,div')).reverse();
      for (const mediaElement of mediaElements) {
        if (mediaElement.tagName === 'DIV' && !this.hasBackgroundImage(mediaElement)) continue;
        if (!this.isVisible(mediaElement)) continue;
        const { x, y } = getMousePosPercentage(mediaElement, this.mouse.event);
        if (x > 0 && x < 100 && y > 0 && y < 100) {
          res.push({ x, y, mediaElement });
        }
      }
      if (res.length === 1) return res[0];
      if (res.length > 1) return this.findTopmost(res);
      return {};
    }

    const res = findHoveredMediaElement();
    this.hoveredMedia_ = res?.mediaElement || null;
    return res || {};
  }
}

class Gestures {
  constructor(controlKey = 'Shift') {
    this.controlKey = keyPressed_(controlKey);
    window.addEventListener('wheel', this.handleScroll, { passive: false });
    this.scrollFactor = 1;
    this.subscriptions = [];
  }

  setControlKey(key) {
    this.controlKey = keyPressed_(key);
  }

  subscribe(callback) {
    this.subscriptions.push(callback);
  }

  notify() {
    this.subscriptions.forEach(callback => {
      callback(this.scrollFactor)
    });
  }

  handleScroll = (e) => {
    if (!this.controlKey.pressed) return;
    e.preventDefault();
    this.scrollFactor = e.deltaY < 0 ? 1 : -1;
    this.notify();
  }
}

class MediaTransform {
  constructor() {
    this.ZOOM_STEP = 0.2;
    this.attrname = 'zoom-ext';
  }

  resetAllMedia() {
    document.querySelectorAll(`[${this.attrname}]`).forEach(el => {
      el.style.transform = "";
    })
  }

  handleElement(mediaElement) {
    if (mediaElement.hasAttribute(this.attrname)) return;
    parentHideOverflow(mediaElement, 2);
    mediaElement.setAttribute(this.attrname, '');
    mediaElement.style.transition = ".25s ease";
  }

  setOrReplaceStyleProp(el, prop, regexName, callback) {
    this.handleElement(el);
    const style = el.style;
    const regex = new RegExp(`${regexName}\\(([-|\\d+|\\.|deg|\\%]+)\\)`);
    const parsed = style[prop].match(regex);
    const curState = parsed?.[1];
    const newValue = callback(curState);
    if (curState !== undefined) {
      style[prop] = style[prop].replace(regex, () => newValue);
    } else {
      style[prop] = `${style[prop]} ${newValue}`;
    }
  }

  brightness(mediaElement, value) {
    this.setOrReplaceStyleProp(mediaElement, 'filter', 'brightness', (oldValue) => {
      const curValue = Number.parseFloat(oldValue || 100);
      return `brightness(${curValue + value}%)`;
    });
  }

  invert(mediaElement) {
    this.setOrReplaceStyleProp(mediaElement, 'filter', 'invert', (oldValue) => {
      const curValue = Number.parseFloat(oldValue || 0);
      return `invert(${curValue > 0 ? 0 : 100}%)`;
    });
  }

  rotate(mediaElement, value) {
    this.setOrReplaceStyleProp(mediaElement, 'transform', 'rotate', (oldValue) => {
      const curValue = Number.parseFloat(oldValue || 0);
      return `rotate(${curValue + value}deg)`;
    });
  }

  mirror(mediaElement) {
    this.setOrReplaceStyleProp(mediaElement, 'transform', 'rotateY', (oldValue) => {
      const curMirror = Number.parseFloat(oldValue || 0);
      const newMirror = curMirror > 0 ? 0 : 1;
      return `rotateY(${180 * newMirror}deg)`;
    });
  }

  setTransformOrigin(x, y, mediaElement) {
    let x_ = x;
    let y_ = y;
    const mirror = /rotateY.180/.test(mediaElement.style.transform);
    let deg = Number.parseInt(mediaElement.style.transform.match(/rotate.(\d+)/)?.[1]) || 0;
    deg = deg < 0 ? 360 - (deg % 360) : deg % 360;
    if (mirror || deg) {
      if (deg === 90) { x_ = y; y_ = 100 - x; }
      if (deg === 270) { x_ = 100 - y; y_ = x; }
      if (deg === 180) { x_ = 100 - x; y_ = 100 - y; }
      if (mirror) { x_ = 100 - x; };
      x_ = clamp(x_, 15, 85);
      y_ = clamp(y_, 15, 85);
      this.ZOOM_STEP = 0.033;
    } else {
      this.ZOOM_STEP = 0.2;
    }
    mediaElement.style.transformOrigin = `${x_}% ${y_}%`;
  }

  zoom(x, y, zoomFactor, mediaElement) {
    this.setTransformOrigin(x, y, mediaElement);
    this.setOrReplaceStyleProp(mediaElement, 'transform', 'scale', (oldValue) => {
      const curZoom = Number.parseFloat(oldValue || 1);
      const newZoom = Math.max(1, curZoom + this.ZOOM_STEP * zoomFactor);
      return `scale(${newZoom})`;
    });
  }
}

function createOverflow(el) {
  const createAbsoluteBox = () => {
    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.zIndex = '9999999';
    box.style.left = '0';
    box.style.top = '0';
    box.style.width = '100%';
    box.style.height = '100vh';
    box.style.overflow = 'hidden';
    box.style.margin = '0px';
    box.style.backdropFilter = 'blur(50px)';
    return box;
  }

  const createRelativeBox = () => {
    const box = document.createElement('div');
    box.style.position = 'realtive';
    box.style.width = '100%';
    box.style.height = '100%';
    box.style.display = 'flex';
    box.style.overflow = 'hidden';
    box.style.margin = '0px';
    return box;
  }

  const transformElToAbsolute = (el) => {
    // const { x, y, width, height } = el.getBoundingClientRect();
    // const captureStyle = {
    //   width: `${width}px`,
    //   height: `${height}px`,
    //   position: 'absolute',
    //   left: `${x}px`,
    //   top: `${y}px`
    // }
    const captureStyle = {
      width: 'auto',
      height: 'auto',
      'max-height': '100vh',
      'max-width': '100vw',
      margin: 'auto'
    }
    const tempStyle = {};

    Object.keys(captureStyle).forEach(k => {
      tempStyle[k] = el.style.getPropertyValue(k);
      el.style.setProperty(k, captureStyle[k]);
    })

    const restoreElement = () => {
      Object.keys(captureStyle).forEach(k => {
        if (tempStyle[k]) {
          el.style.setProperty(k, tempStyle[k]);
        } else {
          el.style.removeProperty(k);
        }
      });
    }

    return {
      restoreElement
    }
  }

  const absoluteBox = createAbsoluteBox();
  const realtiveBox = createRelativeBox();
  document.body.append(absoluteBox);
  absoluteBox.append(realtiveBox);
  const originalParent = el.parentElement;
  realtiveBox.append(el);
  const { restoreElement } = transformElToAbsolute(el);

  return {
    removeOverflow: () => {
      restoreElement();
      originalParent.append(el);
      absoluteBox.remove();
    }
  }
}

function init() {
  fixContextMenu();
  const mediaTransform = new MediaTransform();
  const hoveredMediaWatcher = new HoveredMediaWatcher();
  const gestures = new Gestures();

  let captureCallback;
  let mediaElementName;
  browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg.reset) {
      mediaTransform.resetAllMedia();
    }

    if (msg.screenshot_ok) {
      // downloadURI(msg.uri, `${mediaElementName || document.title}.png`);
      captureCallback();
      mediaElementName = undefined;
    }
    if (msg.screenshot) {
      const { mediaElement } = hoveredMediaWatcher.findHoveredMedia();
      if (mediaElement) {
        mediaElementName = mediaElement.title || mediaElement.alt;
        const { removeOverflow } = createOverflow(mediaElement);
        captureCallback = removeOverflow;
        let { x, y, width, height } = mediaElement.getBoundingClientRect();
        x = Math.max(x, 0);
        y = Math.max(y, 0);
        width = Math.min(width, window.innerWidth);
        height = Math.min(height, window.innerHeight);
        browser.runtime.sendMessage({ captureRect: true, rect: { x, y, width, height } });
      }
    }

    if (msg.transform) {
      const { mediaElement } = hoveredMediaWatcher.findHoveredMedia();
      if (msg.mirror) {
        mediaTransform.mirror(mediaElement);
      }
      if (msg.invert) {
        mediaTransform.invert(mediaElement);
      }
      if (msg['rotate-right']) {
        mediaTransform.rotate(mediaElement, 90);
      }
      if (msg['rotate-left']) {
        mediaTransform.rotate(mediaElement, -90);
      }
      if (msg["brightness-inc"]) {
        mediaTransform.brightness(mediaElement, 25);
      }
      if (msg["brightness-dec"]) {
        mediaTransform.brightness(mediaElement, -25);
      }
    }

  });

  (function sync() {
    function setKey() {
      browser.storage.local.get(["controlKey"]).then((result) => {
        gestures.setControlKey(result?.controlKey || DEFAULT_CONTROL_KEY);
      });
    }
    setKey();

    browser.storage.onChanged.addListener(() => {
      setKey();
    });
  })();

  gestures.subscribe((zoomFactor) => {
    const { x, y, mediaElement } = hoveredMediaWatcher.findHoveredMedia();
    if (mediaElement) {
      mediaTransform.zoom(x, y, zoomFactor, mediaElement);
    }
  });
}

init();
console.log(Logo);
