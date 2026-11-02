import { Game } from './game.js';
import { Input } from './input.js';
import { Sound } from './sound.js';
import { getStats, recordScore } from './storage.js';

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
const hud = { score: $('#hud-score'), left: $('#hud-left'), best: $('#hud-best') };

const images = Object.fromEntries(
  Object.entries(IMAGES).map(([name, file]) => [name, Object.assign(new Image(), { src: `assets/img/${file}` })]),
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
}

function start() {
  hud.best.textContent = getStats().best;
  show('game');
  fit();
  game.start();
}

function showEnd({ won, score, seconds, bonus }) {
  const id = won ? 'win' : 'lose';
  const { best, isBest } = recordScore(score);
  const details = [isBest ? 'New personal best!' : `Best ${best}`];
  if (won) details.unshift(`Cleared in ${seconds}s` + (bonus ? ` · time bonus +${bonus}` : ''));
  document.querySelector(`#${id} [data-final-score]`).textContent = score;
  document.querySelector(`#${id} [data-detail]`).textContent = details.join(' · ');
  show(id);
}

function menu() {
  game.stop();
  const { best, last } = getStats();
  $('#menu-best').textContent = best;
  $('#menu-last').textContent = last === null ? 'No games yet' : `Last game ${last}`;
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
document.addEventListener('keydown', (event) => {
  if (event.code === 'Enter' && !input.enabled && !event.target.closest('button')) start();
});
new ResizeObserver(fit).observe(viewport);

menu();
