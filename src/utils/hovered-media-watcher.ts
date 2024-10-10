import { isVisible, traversParents } from './dom';
import { getMousePosPercentage, MouseTrack } from './events';

export interface HoveredElement {
  x: number;
  y: number;
  mediaElement: HTMLElement;
}

export class HoveredMediaWatcher {
  private opacityThreshold = 0.1;
  private hoveredMedia_: HTMLElement | undefined;
  private mouse = new MouseTrack();

  constructor() {
    this.watchHoveredMedia();
  }

  findTopmost(els: Array<HoveredElement>) {
    let highest = 0;
    let highestZIndex = 0;

    const getZIndex = (el: Element) => {
      const computedStyle = window.getComputedStyle(el);
      const isAbsolute = computedStyle.getPropertyValue('position') === 'absolute' ? 0.5 : 0;
      return Number.parseInt(computedStyle.getPropertyValue('z-index')) || isAbsolute;
    };

    els.forEach((el, i) => {
      let zIndex = getZIndex(el.mediaElement);
      traversParents(
        el.mediaElement,
        (parent) => {
          if (zIndex > 0) return true;
          zIndex = getZIndex(parent);
          return false;
        },
        15,
      );
      if (zIndex > highestZIndex) {
        highestZIndex = zIndex;
        highest = i;
      }
    });

    return els[highest];
  }

  watchHoveredMedia() {
    document.addEventListener('mouseover', (e) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target?.tagName === 'IMG' ||
          e.target?.tagName === 'VIDEO' ||
          this.hasBackgroundImage(e.target))
      ) {
        this.hoveredMedia_ = e.target;
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target === this.hoveredMedia_) {
        this.hoveredMedia_ = undefined;
      }
    });
  }

  hasBackgroundImage(e: HTMLElement) {
    return e.style.backgroundImage.includes('url');
  }

  findHoveredMedia = (): HoveredElement | undefined => {
    if (this.hoveredMedia_ && isVisible(this.hoveredMedia_, this.opacityThreshold)) {
      const { x, y } = getMousePosPercentage(this.hoveredMedia_, this.mouse.state as MouseEvent);
      if (x > 0 && x < 100 && y > 0 && y < 100) {
        return { x, y, mediaElement: this.hoveredMedia_ };
      }
    }

    const findHoveredMediaElement = (): HoveredElement | undefined => {
      const res = [];
      const mediaElements = Array.from<HTMLElement>(
        document.querySelectorAll('video,img,div'),
      ).reverse();
      for (const mediaElement of mediaElements) {
        if (mediaElement.tagName === 'DIV' && !this.hasBackgroundImage(mediaElement)) continue;
        if (!isVisible(mediaElement, this.opacityThreshold)) continue;
        const { x, y } = getMousePosPercentage(mediaElement, this.mouse.state as MouseEvent);
        if (x > 0 && x < 100 && y > 0 && y < 100) {
          res.push({ x, y, mediaElement });
        }
      }
      if (res.length === 1) return res[0];
      if (res.length > 1) return this.findTopmost(res);
      return undefined;
    };

    const res = findHoveredMediaElement();
    this.hoveredMedia_ = res?.mediaElement;
    return res;
  };
}
