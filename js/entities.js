const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export class Ship {
  static SIZE = 75;
  static SPEED = 300;
  static MARGIN = 20;

  constructor(image, worldWidth, worldHeight) {
    this.image = image;
    this.maxX = worldWidth - Ship.SIZE - Ship.MARGIN;
    this.x = (worldWidth - Ship.SIZE) / 2;
    this.y = worldHeight - Ship.SIZE - Ship.MARGIN;
  }

  update(dt, direction) {
    this.x = clamp(this.x + direction * Ship.SPEED * dt, Ship.MARGIN, this.maxX);
  }

  fire(image) {
    return new Rocket(image, this.x + Ship.SIZE / 2, this.y + 10);
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, Ship.SIZE, Ship.SIZE);
  }
}

export class Rocket {
  static SPEED = 480;
  static WIDTH = 5;
  static HEIGHT = 14;

  hit = false;

  constructor(image, x, y) {
    this.image = image;
    this.x = x;
    this.y = y;
  }

  get gone() {
    return this.hit || this.y + Rocket.HEIGHT < 0;
  }

  update(dt) {
    this.y -= Rocket.SPEED * dt;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - Rocket.WIDTH / 2, this.y, Rocket.WIDTH, Rocket.HEIGHT);
  }
}

export class Enemy {
  constructor(image, x, y, { size, health, points }) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.size = size;
    this.health = health;
    this.points = points;
  }

  get dead() {
    return this.health <= 0;
  }

  contains(px, py, offset) {
    const x = this.x + offset.x;
    const y = this.y + offset.y;
    return px >= x && px < x + this.size && py >= y && py < y + this.size;
  }

  hit() {
    this.health--;
  }

  draw(ctx, offset) {
    ctx.drawImage(this.image, this.x + offset.x, this.y + offset.y, this.size, this.size);
  }
}
