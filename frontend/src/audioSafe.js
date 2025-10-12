// src/audioSafe.js

// Prosty magazyn do deduplikacji handlerów visibility między hot-reloadami
const VIS_REG = (window.__AUDIO_VIS__ = window.__AUDIO_VIS__ || new Map());

function getCtx(scene) {
  const ctx = scene?.sound?.context || null;
  // ctx może być null przy niszczeniu sceny
  if (!ctx || typeof ctx.state !== 'string') return null;
  return ctx;
}

export async function safeResume(scene) {
  const ctx = getCtx(scene);
  if (!ctx) return false;                 // brak contextu -> nic nie rób
  if (ctx.state === 'closed') return false; // zamknięty -> nie dotykamy
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch (_) { /* zignoruj */ }
  }
  return true;
}

export async function safeSuspend(scene) {
  const ctx = getCtx(scene);
  if (!ctx) return false;
  if (ctx.state === 'closed') return false;
  if (ctx.state === 'running') {
    try { await ctx.suspend(); } catch (_) { /* zignoruj */ }
  }
  return true;
}

/**
 * Podpina visibilitychange z deduplikacją (po kluczu).
 * - Nigdy nie dotykamy zamkniętego contextu.
 * - Nie dublujemy handlerów przy HMR.
 */
export function bindVisibility(scene, key) {
  if (VIS_REG.has(key)) return; // już podpięte

  const handler = () => {
    const ctx = getCtx(scene);
    if (!ctx || ctx.state === 'closed') return; // nic nie rób na zamkniętym
    if (document.hidden) safeSuspend(scene);
    else                 safeResume(scene);
  };

  document.addEventListener('visibilitychange', handler);
  VIS_REG.set(key, handler);
}

export function unbindVisibility(key) {
  const h = window.__AUDIO_VIS__?.get(key);
  if (h) {
    document.removeEventListener('visibilitychange', h);
    window.__AUDIO_VIS__.delete(key);
  }
}
