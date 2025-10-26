// src/sidebar.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCheckCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import { LEVEL_KEYS } from './levels';

const API = 'http://localhost:3001'; // backend
const HIDE_ON_SCENES = new Set(['LoginScene', 'RegisterScene']);

function buildUnlockSet(completedNums, levelKeysObj) {
  const levels = Object.keys(levelKeysObj).map(n => Number(n)).sort((a, b) => a - b);
  const completed = new Set(completedNums || []);
  const unlocked = new Set();

  if (levels.length) unlocked.add(levels[0]); // pierwszy zawsze odblokowany
  // łańcuszkowo — każdy po zaliczonym poprzednim
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1];
    const cur = levels[i];
    if (completed.has(prev)) unlocked.add(cur);
  }
  // wszystkie zaliczone też są odblokowane
  completed.forEach(n => unlocked.add(n));
  return unlocked;
}

const Sidebar = ({ completedLevels = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [completed, setCompleted] = useState(completedLevels || []);

  // synchronizacja z propsem
  useEffect(() => {
    if (Array.isArray(completedLevels)) setCompleted(completedLevels);
  }, [completedLevels]);

  // zmiana sceny -> chowamy/pokazujemy
  const handleSceneChange = useCallback((e) => {
    const scene = e?.detail;
    const shouldHide = HIDE_ON_SCENES.has(scene);
    setIsVisible(!shouldHide);
    if (shouldHide) {
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));
    }
  }, []);

  useEffect(() => {
    const initialScene = document.body?.dataset?.scene;
    if (initialScene) setIsVisible(!HIDE_ON_SCENES.has(initialScene));
    window.addEventListener('sceneChange', handleSceneChange);
    return () => window.removeEventListener('sceneChange', handleSceneChange);
  }, [handleSceneChange]);

  // po zapisie progresu (np. koniec poziomu) odśwież lokalny stan
  useEffect(() => {
    const onProgressChanged = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.id) return;
        fetch(`${API}/progress/${user.id}`)
          .then(r => (r.ok ? r.json() : Promise.reject()))
          .then((data) => {
            if (!data?.ok || !Array.isArray(data.progress)) return;
            const doneNums = data.progress
              .filter(p => !!p.completed)
              .map(p => {
                const entry = Object.entries(LEVEL_KEYS).find(([num, key]) => key === p.levelKey);
                return entry ? Number(entry[0]) : null;
              })
              .filter(Boolean);
            setCompleted(doneNums);
          })
          .catch(() => {});
      } catch (_) {}
    };
    window.addEventListener('progressChanged', onProgressChanged);
    return () => window.removeEventListener('progressChanged', onProgressChanged);
  }, []);

  const levels = useMemo(
    () => Object.keys(LEVEL_KEYS).map(n => Number(n)).sort((a, b) => a - b),
    []
  );
  const unlocked = useMemo(() => buildUnlockSet(completed, LEVEL_KEYS), [completed]);

  const toggleMenu = () => {
    setIsOpen(prev => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: next } }));
      return next;
    });
  };

  // ukryj cały sidebar na login/rejestracji
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
                  if (!isUnlocked) return; // blokada
                  if (key) {
                    window.dispatchEvent(new CustomEvent('levelSelect', { detail: { key } }));
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));
                  }
                }}
                title={!isUnlocked ? 'Zablokowany — ukończ poprzedni poziom' : `Poziom ${n}`}
              >
                <span>Poziom {n}</span>
                {isCompleted ? (
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
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
            setIsOpen(false);
            window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));
            window.dispatchEvent(new CustomEvent('levelSelect', { detail: { key: 'LoginScene' } }));
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
