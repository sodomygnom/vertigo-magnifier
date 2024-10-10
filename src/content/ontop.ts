export function createOverflow(el: HTMLElement) {
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
  };

  const createRelativeBox = () => {
    const box = document.createElement('div');
    box.style.position = 'realtive';
    box.style.width = '100%';
    box.style.height = '100%';
    box.style.display = 'flex';
    box.style.overflow = 'hidden';
    box.style.margin = '0px';
    return box;
  };

  const transformElToAbsolute = (el: HTMLElement) => {
    // const { x, y, width, height } = el.getBoundingClientRect();
    // const captureStyle = {
    //   width: `${width}px`,
    //   height: `${height}px`,
    //   position: 'absolute',
    //   left: `${x}px`,
    //   top: `${y}px`
    // }
    const captureStyle: Record<string, string> = {
      width: 'auto',
      height: 'auto',
      'max-height': '100vh',
      'max-width': '100vw',
      margin: 'auto',
    };

    const tempStyle: Record<string, string> = {};

    Object.keys(captureStyle).forEach((k) => {
      tempStyle[k] = el.style.getPropertyValue(k);
      el.style.setProperty(k, captureStyle[k]);
    });

    const restoreElement = () => {
      Object.keys(captureStyle).forEach((k) => {
        if (tempStyle[k]) {
          el.style.setProperty(k, tempStyle[k]);
        } else {
          el.style.removeProperty(k);
        }
      });
    };

    return {
      restoreElement,
    };
  };

  const absoluteBox = createAbsoluteBox();
  const realtiveBox = createRelativeBox();
  document.body.append(absoluteBox);
  absoluteBox.append(realtiveBox);

  let putElementBack = () => {};
  if (el.nextElementSibling) {
    const next = el.nextElementSibling;
    putElementBack = () => next.before(el);
  } else if (el.previousElementSibling) {
    const prev = el.previousElementSibling;
    putElementBack = () => prev.after(el);
  } else {
    const parent = el.parentElement;
    putElementBack = () => parent?.append(el);
  }

  realtiveBox.append(el);
  const { restoreElement } = transformElToAbsolute(el);

  const removeOverflow = () => {
    restoreElement();
    putElementBack();
    absoluteBox.remove();
  }

  return { removeOverflow };
}
