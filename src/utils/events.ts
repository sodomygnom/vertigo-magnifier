export class KeyTrack {
  public pressed = false;
  private subs: Array<(state: boolean) => void> = [];

  public subscribe(callback: (state: boolean) => void) {
    this.subs.push(callback);
  }

  private notify() {
    // console.log('notify', this.pressed, this.keyName);
    this.subs.forEach((c) => c(this.pressed));
    if (this.once) {
      this.subs = [];
      this.destroyListeners();
    }
  }

  handleKeydown = (e: KeyboardEvent) => {
    // console.log('e.key !== this.keyName', e.key !== this.keyName, this.keyName, e.key);
    if (e.key !== this.keyName) return;
    this.pressed = true;
    this?.notify();
  }

  handleKeyup = (e: KeyboardEvent) => {
    if (e.key !== this.keyName) return;
    this.pressed = false;
    this?.notify();
  }

  handleBlur = () => {
    this.pressed = false;
    this?.notify();
  }

  setListeners(){
    window.addEventListener('keydown', this.handleKeydown, {passive: true});
    window.addEventListener('keyup', this.handleKeyup, {passive: true});
    window.addEventListener('blur', this.handleBlur);
  }

  destroyListeners(){
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('keyup', this.handleKeyup);
    window.removeEventListener('blur', this.handleBlur);
  }

  constructor(private keyName: string, private once = false) {
    this.setListeners();
  }
}

export function getMousePosPercentage(el: Element, e: MouseEvent) {
  const rect = el.getBoundingClientRect();
  const x = Math.round(((e.clientX - rect.left) / (rect.right - rect.left)) * 100);
  const y = Math.round(((e.clientY - rect.top) / (rect.bottom - rect.top)) * 100);
  return { x, y };
}

export class MouseTrack {
  public state: MouseEvent | undefined;

  constructor() {
    const trackState = (event: MouseEvent) => {
      this.state = event;
    };
    window.addEventListener('mousemove', trackState, { passive: true });
    window.addEventListener('contextmenu', trackState, { passive: true });
  }
}
