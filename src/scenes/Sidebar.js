import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCheckCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import '../styles/Sidebar.css';
import { LEVEL_KEYS, levelNumberFromKey } from '../levels';

/* =========================
   API 
   ========================= */
const isBrowser = typeof window !== 'undefined';
const host = isBrowser ? window.location.hostname : '';

const isLocalHost =
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host === '::1';

const isProdHosted = isBrowser && !!host && !isLocalHost;

const RAW_API =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  (isProdHosted
    ? 'https://investigation-in-10-rooms.onrender.com'
    : 'http://localhost:3001');

const API = String(RAW_API).replace(/\/+$/, '');

/* =========================
   Sidebar
   ========================= */
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [maxCompleted, setMaxCompleted] = useState(0);

  /* =========================
     LOAD PROGRESS (ŹRÓDŁO PRAWDY)
     ========================= */
  const loadProgress = useCallback(async () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;

      const user = JSON.parse(raw);
      if (!user?.id) return;

      console.log('[Sidebar] fetching:', `${API}/progress/${user.id}`);

      const res = await fetch(`${API}/progress/${user.id}`);
      if (!res.ok) {
        console.warn('[Sidebar] HTTP error', res.status);
        return;
      }

      const data = await res.json();
      const rows = Array.isArray(data?.progress) ? data.progress : [];

      let max = 0;
      for (const row of rows) {
        if (row.completed && row.levelKey) {
          const n = levelNumberFromKey(row.levelKey);
          if (n != null && n > max) max = n;
        }
      }

      setMaxCompleted(max);
    } catch (e) {
      console.warn('[Sidebar] loadProgress error', e);
    }
  }, []);

  /* =========================
     INIT + REFRESH SAFE
     ========================= */
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const levels = useMemo(
    () => Object.keys(LEVEL_KEYS).map(Number).sort((a, b) => a - b),
    []
  );

  const isUnlocked = (n) => n <= maxCompleted + 1;
  const isCompleted = (n) => n <= maxCompleted;

  return (
    <>
      <button className="menu-icon" onClick={() => setIsOpen(o => !o)}>
        <FontAwesomeIcon icon={faBars} size="2x" />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2>Poziomy</h2>

        <ul>
          {levels.map(n => {
            const key = LEVEL_KEYS[n];

            return (
              <li
                key={n}
                className={!isUnlocked(n) ? 'locked' : ''}
                onClick={() => {
                  if (!isUnlocked(n)) return;
                  window.dispatchEvent(
                    new CustomEvent('levelSelect', { detail: { key } })
                  );
                  setIsOpen(false);
                }}
              >
                <span>Poziom {n}</span>
                {isCompleted(n) ? (
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                ) : !isUnlocked(n) ? (
                  <FontAwesomeIcon icon={faLock} className="lock-icon" />
                ) : null}
              </li>
            );
          })}
        </ul>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('user');
            setMaxCompleted(0);
            window.dispatchEvent(
              new CustomEvent('levelSelect', { detail: { key: 'LoginScene' } })
            );
          }}
        >
          Wyloguj
        </button>

        <div className="author">Autor: Liliana Kołczyk</div>
      </div>
    </>
  );
}
