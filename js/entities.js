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

export class Spark {
  static COLORS = ['#fd4b16', '#f08a2c', '#f5c66a'];
  static LIFE = 0.5;

  constructor(x, y, index) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 220;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = Spark.LIFE;
    this.color = Spark.COLORS[index % Spark.COLORS.length];
  }

  get gone() {
    return this.life <= 0;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx) {
    ctx.globalAlpha = Math.max(0, this.life / Spark.LIFE);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 3, this.y - 3, 6, 6);
    ctx.globalAlpha = 1;
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
  static FLASH = 0.12;

  flash = 0;

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
    this.flash = Enemy.FLASH;
  }

  update(dt) {
    this.flash = Math.max(0, this.flash - dt);
  }

  draw(ctx, offset) {
    ctx.globalAlpha = this.flash > 0 ? 0.4 : 1;
    ctx.drawImage(this.image, this.x + offset.x, this.y + offset.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}
