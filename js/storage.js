const KEY = 'space-invaders:stats';

function read() {
  try {
    const stats = JSON.parse(localStorage.getItem(KEY)) ?? {};
    return {
      best: Number.isFinite(stats.best) ? stats.best : 0,
      last: Number.isFinite(stats.last) ? stats.last : null,
    };
  } catch {
    return { best: 0, last: null };
  }
}

// Kept in memory too, so scores still work for the session if storage is blocked.
let stats = read();

export const getStats = () => ({ ...stats });

export function recordScore(score) {
  const isBest = score > stats.best;
  stats = { best: Math.max(stats.best, score), last: score };
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {}
  return { ...stats, isBest };
}
