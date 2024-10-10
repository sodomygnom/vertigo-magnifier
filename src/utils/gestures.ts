import { KeyTrack } from "./events";

type GestureCallback = (scrollFactor: number) => void;

export class Gestures {
  private scrollFactor = 1;
  private subscriptions: Array<GestureCallback> = [];
  private controlKey: KeyTrack;
  
	constructor(private controlKeyName = "Shift") {
    this.controlKey = new KeyTrack(this.controlKeyName);
    window.addEventListener("wheel", this.handleScroll, { passive: false });
	}

  combineWithControlKey(key1: string, key2: string, callback: () => void) {
    new KeyTrack(key1).subscribe((state) => state && 
      new KeyTrack(key2, true).subscribe(() => callback()));
  }

	setControlKey(key: string) {
		this.controlKey = new KeyTrack(key);
	}

	subscribe(callback: GestureCallback) {
		this.subscriptions.push(callback);
	}

	notify() {
		this.subscriptions.forEach((callback: GestureCallback) => {
			callback(this.scrollFactor);
		});
	}

	handleScroll = (e: WheelEvent) => {
		if (!this.controlKey.pressed) return;
		e.preventDefault();
		this.scrollFactor = e.deltaY < 0 ? 1 : -1;
		this.notify();
	};
}