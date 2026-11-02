import { Game } from './game.js';
import { Input } from './input.js';
import { Sound } from './sound.js';
import { getPreference, getStats, recordScore, setPreference } from './storage.js';

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
const pauseMenu = $('#pause');
const hud = { score: $('#hud-score'), left: $('#hud-left'), best: $('#hud-best') };

const images = Object.fromEntries(
  Object.entries(IMAGES).map(([name, file]) => [name, Object.assign(new Image(), { src: `assets/img/${file}` })]),
);

const sound = new Sound();
const input = new Input();
for (const button of document.querySelectorAll('[data-hold]')) input.bindButton(button, button.dataset.hold);
const game = new Game($('canvas'), images, input, {
  shot: () => sound.effect('shot'),
  kill: () => sound.effect('explosion'),
  change: ({ score, enemiesLeft }) => {
    hud.score.textContent = score;
    hud.left.textContent = enemiesLeft;
  },
  end: showEnd,
});

let current = 'menu';

function show(id) {
  current = id;
  for (const screen of screens) screen.hidden = screen.id !== id;
  pauseMenu.hidden = true;
  input.enabled = id === 'game';
  input.reset();
}

function start() {
  hud.best.textContent = getStats().best;
  show('game');
  fit();
  game.start();
}

function pause() {
  if (current !== 'game' || !game.running) return;
  game.stop();
  input.enabled = false;
  input.reset();
  pauseMenu.hidden = false;
  pauseMenu.querySelector('button').focus();
}

function resume() {
  if (current !== 'game' || game.running) return;
  pauseMenu.hidden = true;
  input.enabled = true;
  game.resume();
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

function setSound(enabled) {
  sound.enabled = enabled;
  setPreference('sound', enabled);
  for (const button of document.querySelectorAll('.sound-toggle')) {
    button.setAttribute('aria-pressed', enabled);
  }
}

function fit() {
  const { width, height } = viewport.getBoundingClientRect();
  if (width && height) game.fit(width, height);
}

const actions = {
  start,
  menu,
  resume,
  pause,
  sound: () => setSound(!sound.enabled),
};

const KEYS = {
  Enter: () => current !== 'game' && start(),
  Escape: () => (game.running ? pause() : resume()),
  KeyP: () => (game.running ? pause() : resume()),
  KeyM: () => setSound(!sound.enabled),
};

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  actions[button.dataset.action]();
  // Drop focus so Space keeps shooting instead of pressing the button again.
  button.blur();
});
document.addEventListener('keydown', (event) => {
  if (event.repeat || (event.code === 'Enter' && event.target.closest('button'))) return;
  KEYS[event.code]?.();
});
document.addEventListener('visibilitychange', () => document.hidden && pause());
window.addEventListener('blur', pause);
new ResizeObserver(fit).observe(viewport);

setSound(getPreference('sound', true));
menu();
