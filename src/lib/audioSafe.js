// src/audioSafe.js

// Rejestr handlerów visibility (utrzymywany między hot-reloadami)
const VIS_REG = (window.__AUDIO_VIS__ = window.__AUDIO_VIS__ || new Map());

function getCtx(scene) {
  const ctx = scene?.sound?.context || null;
  if (!ctx || typeof ctx.state !== 'string') return null;
  return ctx;
}

export async function safeResume(scene) {
  const ctx = getCtx(scene);
  if (!ctx) return false;
  if (ctx.state === 'closed') return false;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (_) {}
  }
  return true;
}

export async function safeSuspend(scene) {
  const ctx = getCtx(scene);
  if (!ctx) return false;
  if (ctx.state === 'closed') return false;
  if (ctx.state === 'running') {
    try {
      await ctx.suspend();
    } catch (_) {}
  }
  return true;
}

/**
 * Podpina handler visibilitychange z deduplikacją po kluczu
 */
export function bindVisibility(scene, key) {
  if (VIS_REG.has(key)) return;

  const handler = () => {
    const ctx = getCtx(scene);
    if (!ctx || ctx.state === 'closed') return;
    if (document.hidden) safeSuspend(scene);
    else safeResume(scene);
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