const EFFECTS = { shot: 'shot', explosion: 'explosion' };

export class Sound {
  enabled = true;
  #effects = {};

  constructor() {
    for (const [name, file] of Object.entries(EFFECTS)) {
      this.#effects[name] = new Audio(`assets/audio/${file}.mp3`);
    }
  }

  effect(name) {
    if (!this.enabled) return;
    const audio = this.#effects[name].cloneNode();
    audio.volume = 0.6;
    audio.play().catch(() => {});
  }
}
