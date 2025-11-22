import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCheckCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import './styles/Sidebar.css';
import { LEVEL_KEYS } from './levels';

/* =========================
   API base detection
   ========================= */
const isBrowser = typeof window !== 'undefined';
const host = isBrowser ? window.location.hostname : '';

const isProdHosted =
  /netlify\.app$/.test(host) ||     
  /netlify\.live$/.test(host) ||    
  /netlify\.dev$/.test(host);     

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

const HIDE_ON_SCENES = new Set([
  'LoginScene',
  'RegisterScene',
  'ForgotPasswordScene',
  'ResetPasswordScene',
]);

function buildUnlockSet(completedNums, levelKeysObj) {
  const levels = Object.keys(levelKeysObj).map(Number).sort((a, b) => a - b);
  const completed = new Set(completedNums || []);
  const unlocked = new Set();

  if (levels.length) unlocked.add(levels[0]); 

  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1];
    const cur  = levels[i];
    if (completed.has(prev)) unlocked.add(cur);
  }

  completed.forEach((n) => unlocked.add(n));
  return unlocked;
}

const Sidebar = ({ completedLevels = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [completed, setCompleted] = useState(completedLevels || []);

  useEffect(() => {
    if (Array.isArray(completedLevels)) setCompleted(completedLevels);
  }, [completedLevels]);

  const handleSceneChange = useCallback((e) => {
    const scene = e?.detail;
    const hidden = HIDE_ON_SCENES.has(scene);
    setIsVisible(!hidden);
    if (hidden) {
      setIsOpen(false);
      window.dispatchEvent(
        new CustomEvent('sidebarToggle', { detail: { open: false } })
      );
    }
  }, []);

  useEffect(() => {
    const initialScene = document.body?.dataset?.scene;
    if (initialScene) setIsVisible(!HIDE_ON_SCENES.has(initialScene));

    window.addEventListener('sceneChange', handleSceneChange);
    return () => window.removeEventListener('sceneChange', handleSceneChange);
  }, [handleSceneChange]);

  useEffect(() => {
    const refreshFromServer = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.id) return;

        fetch(`${API}/progress/${user.id}`)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => {
            const progressArray = Array.isArray(data?.progress)
              ? data.progress
              : Array.isArray(data)
              ? data
              : [];

            if (!progressArray.length) return;

            const doneNums = progressArray
              .filter((p) => !!p.completed && p.levelKey)
              .map((p) => {
                const entry = Object.entries(LEVEL_KEYS).find(
                  ([, key]) => key === p.levelKey
                );
                return entry ? Number(entry[0]) : null;
              })
              .filter((n) => typeof n === 'number' && !Number.isNaN(n));

            setCompleted(doneNums);
          })
          .catch(() => {
          });
      } catch {
      }
    };

    const onProgressSaved = () => refreshFromServer();
    const onProgressChanged = () => refreshFromServer();

    window.addEventListener('progressSaved', onProgressSaved);
    window.addEventListener('progressChanged', onProgressChanged);

    refreshFromServer();

    return () => {
      window.removeEventListener('progressSaved', onProgressSaved);
      window.removeEventListener('progressChanged', onProgressChanged);
    };
  }, []);

  const levels = useMemo(
    () => Object.keys(LEVEL_KEYS).map(Number).sort((a, b) => a - b),
    []
  );

  const unlocked = useMemo(
    () => buildUnlockSet(completed, LEVEL_KEYS),
    [completed]
  );

  const toggleMenu = () => {
    setIsOpen((prev) => {
      const next = !prev;
      window.dispatchEvent(
        new CustomEvent('sidebarToggle', { detail: { open: next } })
      );
      return next;
    });
  };

  if (!isVisible) return null;

  return (
    <>
      <button className="menu-icon" onClick={toggleMenu} aria-label="Sidebar">
        <FontAwesomeIcon icon={faBars} size="2x" />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2>Poziomy</h2>
        <ul>
          {levels.map((n) => {
            const key = LEVEL_KEYS[n];
            const isCompleted = completed.includes(n);
            const isUnlocked = unlocked.has(n);

            return (
              <li
                key={n}
                className={!isUnlocked ? 'locked' : ''}
                onClick={() => {
                  if (!isUnlocked) return;
                  if (key) {
                    window.dispatchEvent(
                      new CustomEvent('levelSelect', { detail: { key } })
                    );
                    setIsOpen(false);
                    window.dispatchEvent(
                      new CustomEvent('sidebarToggle', {
                        detail: { open: false },
                      })
                    );
                  }
                }}
                title={
                  !isUnlocked
                    ? 'Zablokowany — ukończ poprzedni poziom'
                    : `Poziom ${n}`
                }
              >
                <span>Poziom {n}</span>
                {isCompleted ? (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="check-icon"
                  />
                ) : !isUnlocked ? (
                  <FontAwesomeIcon icon={faLock} className="lock-icon" />
                ) : null}
              </li>
            );
          })}
        </ul>

        <button
          className="logout-btn"
          onClick={() => {
            try {
              localStorage.removeItem('user');
            } catch (_) {}

            setCompleted([]); 

            setIsOpen(false);
            window.dispatchEvent(
              new CustomEvent('sidebarToggle', { detail: { open: false } })
            );
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
};
export default Sidebar;