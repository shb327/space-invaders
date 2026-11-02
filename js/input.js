const LEFT = ['ArrowLeft', 'KeyA'];
const RIGHT = ['ArrowRight', 'KeyD'];
const FIRE = ['Space', 'ArrowUp', 'KeyW'];

export class Input {
  enabled = false;
  left = false;
  right = false;
  firing = false;
  #queued = false;

  constructor() {
    addEventListener('keydown', (event) => this.#onKey(event, true));
    addEventListener('keyup', (event) => this.#onKey(event, false));
    addEventListener('blur', () => this.reset());
  }

  get direction() {
    return Number(this.right) - Number(this.left);
  }

  // A quick tap still counts even if the key is released before the cooldown ends.
  takeShot() {
    const shot = this.firing || this.#queued;
    this.#queued = false;
    return shot;
  }

  press(down) {
    if (down) this.#queued = true;
    this.firing = down;
  }

  // Hold-to-press on-screen buttons; pointer capture keeps multi-touch working.
  bindButton(element, name) {
    const set = (down) => (event) => {
      if (down && !this.enabled) return;
      event.preventDefault();
      if (name === 'fire') this.press(down);
      else this[name] = down;
      element.classList.toggle('active', down);
    };
    element.addEventListener('pointerdown', (event) => {
      set(true)(event);
      try {
        element.setPointerCapture(event.pointerId);
      } catch {}
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      element.addEventListener(type, set(false));
    }
    element.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  reset() {
    this.left = this.right = this.firing = this.#queued = false;
  }

  #onKey(event, down) {
    if (!this.enabled) return;
    if (LEFT.includes(event.code)) this.left = down;
    else if (RIGHT.includes(event.code)) this.right = down;
    else if (FIRE.includes(event.code)) {
      if (!event.repeat) this.press(down);
    } else return;
    event.preventDefault();
  }
}
