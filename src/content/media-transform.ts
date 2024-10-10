import { clamp, parentHideOverflow } from '../utils';

export class MediaTransform {
  constructor(
    private ZOOM_STEP = 0.2,
    private attrname = 'zoom-ext',
  ) {}

  handleCommand(msg: string, mediaElement: HTMLElement) {
    switch (msg) {
      case 'mirror':
        this.mirror(mediaElement);
        break;
      case 'invert':
        this.invert(mediaElement);
        break;
      case 'rotate-right':
        this.rotate(mediaElement, 90);
        break;
      case 'rotate-left':
        this.rotate(mediaElement, -90);
        break;
      case 'brightness-inc':
        this.brightness(mediaElement, 25);
        break;
      case 'brightness-dec':
        this.brightness(mediaElement, -25);
        break;
      case 'zoom-inc':
        this.zoom(50, 50, 3, mediaElement);
        break;
      case 'zoom-dec':
        this.zoom(50, 50, -3, mediaElement);
        break;
      default:
        break;
    }
  }

  resetAllMedia() {
    document.querySelectorAll<HTMLElement>(`[${this.attrname}]`).forEach((el) => {
      el.style.transform = '';
    });
  }

  handleElement(mediaElement: HTMLElement) {
    if (mediaElement.hasAttribute(this.attrname)) return;
    parentHideOverflow(mediaElement, 2);
    mediaElement.setAttribute(this.attrname, '');
    mediaElement.style.transition = '.25s ease';
  }

  setOrReplaceStyleProp(
    el: HTMLElement,
    prop: string,
    regexName: string,
    callback: (oldValue: string | undefined) => string,
  ) {
    this.handleElement(el);
    const style = el.style;
    const regex = new RegExp(`${regexName}\\(([-|\\d+|\\.|deg|\\%]+)\\)`);
    const curState = style.getPropertyValue(prop).match(regex)?.[1];
    const newValue = callback(curState);
    let newPropValue = '';
    if (curState !== undefined) {
      newPropValue = style.getPropertyValue(prop).replace(regex, () => newValue);
    } else {
      newPropValue = `${style.getPropertyValue(prop)} ${newValue}`;
    }
    style.setProperty(prop, newPropValue);
  }

  brightness(mediaElement: HTMLElement, value: number) {
    this.setOrReplaceStyleProp(mediaElement, 'filter', 'brightness', (oldValue) => {
      const curValue = Number.parseFloat(oldValue || '100');
      return `brightness(${curValue + value}%)`;
    });
  }

  invert(mediaElement: HTMLElement) {
    this.setOrReplaceStyleProp(mediaElement, 'filter', 'invert', (oldValue) => {
      const curValue = Number.parseFloat(oldValue || '0');
      return `invert(${curValue > 0 ? 0 : 100}%)`;
    });
  }

  rotate(mediaElement: HTMLElement, value: number) {
    this.setOrReplaceStyleProp(mediaElement, 'transform', 'rotate', (oldValue) => {
      const curValue = Number.parseFloat(oldValue || '0');
      return `rotate(${curValue + value}deg)`;
    });
  }

  mirror(mediaElement: HTMLElement) {
    this.setOrReplaceStyleProp(mediaElement, 'transform', 'rotateY', (oldValue) => {
      const curMirror = Number.parseFloat(oldValue || '0');
      const newMirror = curMirror > 0 ? 0 : 1;
      return `rotateY(${180 * newMirror}deg)`;
    });
  }

  setTransformOrigin(x: number, y: number, mediaElement: HTMLElement) {
    let x_ = x;
    let y_ = y;
    const mirror = /rotateY.180/.test(mediaElement.style.transform);
    let deg =
      Number.parseInt(mediaElement.style.transform.match(/rotate.(\d+)/)?.[1] as string) || 0;
    deg = deg < 0 ? 360 - (deg % 360) : deg % 360;
    if (mirror || deg) {
      if (deg === 90) {
        x_ = y;
        y_ = 100 - x;
      }
      if (deg === 270) {
        x_ = 100 - y;
        y_ = x;
      }
      if (deg === 180) {
        x_ = 100 - x;
        y_ = 100 - y;
      }
      if (mirror) {
        x_ = 100 - x;
      }
      x_ = clamp(x_, 15, 85);
      y_ = clamp(y_, 15, 85);
      this.ZOOM_STEP = 0.033;
    } else {
      this.ZOOM_STEP = 0.2;
    }
    mediaElement.style.transformOrigin = `${x_}% ${y_}%`;
  }

  zoom(x: number, y: number, zoomFactor: number, mediaElement: HTMLElement) {
    this.setTransformOrigin(x, y, mediaElement);
    this.setOrReplaceStyleProp(mediaElement, 'transform', 'scale', (oldValue) => {
      const curZoom = Number.parseFloat(oldValue || '1');
      const newZoom = Math.max(1, curZoom + this.ZOOM_STEP * zoomFactor);
      return `scale(${newZoom})`;
    });
  }
}
