export function parentHideOverflow(el: Element, depth = 2) {
  const hideParent = (parent: HTMLElement) => {
    if (parent.clientHeight > 0 && parent.clientWidth > 0) {
      parent.style.overflow = 'hidden';
      return true;
    }
    return false;
  }
  traversParents(el, hideParent, depth);
}

export function traversParents(el: Element, callback: (e: HTMLElement) => boolean, depth = 10) {
  let level = depth;
  let parent = el.parentElement;
  while (level > 0 && parent) {
    const stop = callback(parent);
    if (stop) break;
    parent = parent.parentElement;
    level--;
  }
}

export function downloadURI(uri: string, name: string) {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  link.click();
}

export function isVisible(element: Element, opacityThreshold = 0.1): boolean {
  const computedStyle = window.getComputedStyle(element);
  const opacity = Number.parseFloat(computedStyle.getPropertyValue('opacity'));
  const display = computedStyle.getPropertyValue('display');
  const visibility = computedStyle.getPropertyValue('visibility');
  return opacity > opacityThreshold && display !== 'none' && visibility !== 'hidden';
}

export function getBoundingClientRectInView(mediaElement: HTMLElement): DOMRect {
  let { x, y, width, height } = mediaElement.getBoundingClientRect();
  x = Math.max(x, 0) | 0;
  y = Math.max(y, 0) | 0;
  width = Math.min(width, window.innerWidth) | 0;
  height = Math.min(height, window.innerHeight) | 0;
  return new DOMRect(x, y, width, height);
}

export function getElementTitle(el: HTMLElement): string {
  return (el as HTMLImageElement)?.title 
    || (el as HTMLImageElement)?.alt 
    || document.title || "";
}