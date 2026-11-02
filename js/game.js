import { Enemy, Ship } from './entities.js';

export const WORLD = { width: 1360, height: 850 };

const INVASION_LINE = WORLD.height * 0.65;
const SWAY = 200;
const DROP = 55;
const BASE_SPEED = 60;
const SPEED_PER_KILL = 6;
const FIRE_DELAY = 0.2;
const PAR_TIME = 60;

const WAVE = [
  { image: 'shuttle', count: 5, gap: 242, y: 20, size: 120, health: 3, points: 30 },
  { image: 'warship', count: 10, gap: 111, y: 140, size: 80, health: 2, points: 20 },
  { image: 'ufo', count: 20, gap: 55, y: 250, size: 40, health: 1, points: 10 },
];

const rowWidth = ({ count, gap, size }) => (count - 1) * gap + size;
const FORMATION_WIDTH = Math.max(...WAVE.map(rowWidth));
const FORMATION_LEFT = (WORLD.width - FORMATION_WIDTH - SWAY) / 2;

export class Game {
  running = false;
  #frame = 0;
  #last = 0;

  constructor(canvas, images, input, events = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.images = images;
    this.input = input;
    this.events = events;
    this.background = this.ctx.createPattern(images.back, 'repeat');
    this.scale = 1;
  }

  get enemiesLeft() {
    return this.enemies.length;
  }

  start() {
    this.ship = new Ship(this.images.ship, WORLD.width, WORLD.height);
    this.rockets = [];
    this.enemies = WAVE.flatMap((row) => {
      const left = FORMATION_LEFT + (FORMATION_WIDTH - rowWidth(row)) / 2;
      return Array.from({ length: row.count }, (_, i) =>
        new Enemy(this.images[row.image], left + i * row.gap, row.y, row));
    });
    this.total = this.enemies.length;
    this.offset = { x: 0, y: 0 };
    this.direction = 1;
    this.score = 0;
    this.time = 0;
    this.cooldown = 0;
    this.events.change?.(this);
    this.resume();
  }

  resume() {
    cancelAnimationFrame(this.#frame);
    this.running = true;
    this.#last = performance.now();
    this.#frame = requestAnimationFrame(this.#tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.#frame);
  }

  fit(width, height) {
    const scale = Math.min(width / WORLD.width, height / WORLD.height);
    const cssWidth = Math.floor(WORLD.width * scale);
    const cssHeight = Math.floor(WORLD.height * scale);
    const dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    this.scale = this.canvas.width / WORLD.width;
    if (this.ship) this.draw();
  }

  #tick = (now) => {
    // Clamp the step so a long frame (tab switch, slow device) can't teleport enemies.
    const dt = Math.min((now - this.#last) / 1000, 0.05);
    this.#last = now;
    this.update(dt);
    if (!this.running) return;
    this.draw();
    this.#frame = requestAnimationFrame(this.#tick);
  };

  update(dt) {
    this.time += dt;
    this.ship.update(dt, this.input.direction);

    this.cooldown -= dt;
    if (this.cooldown <= 0 && this.input.takeShot()) {
      this.rockets.push(this.ship.fire(this.images.rocket));
      this.cooldown = FIRE_DELAY;
      this.events.shot?.();
    }

    this.moveFormation(dt);

    for (const rocket of this.rockets) {
      rocket.update(dt);
      const target = this.enemies.find((enemy) => enemy.contains(rocket.x, rocket.y, this.offset));
      if (!target) continue;
      rocket.hit = true;
      target.hit();
      if (target.dead) this.kill(target);
    }
    this.rockets = this.rockets.filter((rocket) => !rocket.gone);
    this.enemies = this.enemies.filter((enemy) => !enemy.dead);

    if (this.enemies.length === 0) {
      this.end(true);
    } else if (this.enemies.some((enemy) => enemy.y + this.offset.y >= INVASION_LINE)) {
      this.end(false);
    }
  }

  moveFormation(dt) {
    const kills = this.total - this.enemies.length;
    this.offset.x += this.direction * (BASE_SPEED + SPEED_PER_KILL * kills) * dt;
    if (this.offset.x >= SWAY || this.offset.x <= 0) {
      this.offset.x = Math.min(Math.max(this.offset.x, 0), SWAY);
      this.direction *= -1;
      this.offset.y += DROP;
    }
  }

  kill(enemy) {
    this.score += enemy.points;
    this.events.kill?.();
    this.events.change?.(this);
  }

  end(won) {
    this.stop();
    const seconds = Math.round(this.time);
    const bonus = won ? Math.max(0, PAR_TIME - seconds) * 5 : 0;
    this.events.end?.({ won, seconds, bonus, score: this.score + bonus });
  }

  draw() {
    const { ctx } = this;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.save();
    ctx.strokeStyle = 'rgb(245 198 106 / 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([14, 12]);
    ctx.beginPath();
    ctx.moveTo(0, INVASION_LINE);
    ctx.lineTo(WORLD.width, INVASION_LINE);
    ctx.stroke();
    ctx.restore();

    for (const enemy of this.enemies) enemy.draw(ctx, this.offset);
    for (const rocket of this.rockets) rocket.draw(ctx);
    this.ship.draw(ctx);
  }
}
