import { Game } from './game.js';
import { Input } from './input.js';
import { Sound } from './sound.js';

const IMAGES = {
  back: 'back.jpg',
  ship: 'ship.png',
  rocket: 'rocket.png',
  ufo: 'ufo.png',
  warship: 'warship.png',
  shuttle: 'shuttle.png',
};

const $ = (selector) => document.querySelector(selector);
const screens = [...document.querySelectorAll('.screen')];
const viewport = $('.viewport');
const hud = { score: $('#hud-score'), left: $('#hud-left') };

const loadImage = async (file) => {
  const image = new Image();
  image.src = `assets/img/${file}`;
  await image.decode();
  return image;
};

const images = Object.fromEntries(
  await Promise.all(Object.entries(IMAGES).map(async ([name, file]) => [name, await loadImage(file)])),
);

const sound = new Sound();
const input = new Input();
const game = new Game($('canvas'), images, input, {
  shot: () => sound.effect('shot'),
  kill: () => sound.effect('explosion'),
  change: ({ score, enemiesLeft }) => {
    hud.score.textContent = score;
    hud.left.textContent = enemiesLeft;
  },
  end: showEnd,
});

function show(id) {
  for (const screen of screens) screen.hidden = screen.id !== id;
  input.enabled = id === 'game';
  input.reset();
  document.querySelector(`#${id} button`)?.focus();
}

function start() {
  show('game');
  fit();
  game.start();
}

function showEnd({ won, score }) {
  const id = won ? 'win' : 'lose';
  document.querySelector(`#${id} [data-final-score]`).textContent = score;
  show(id);
}

function menu() {
  game.stop();
  show('menu');
}

function fit() {
  const { width, height } = viewport.getBoundingClientRect();
  if (width && height) game.fit(width, height);
}

const actions = { start, menu };

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  actions[action]?.();
});
new ResizeObserver(fit).observe(viewport);

menu();
