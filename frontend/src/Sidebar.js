import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import { LEVEL_KEYS } from './levels';

const HIDE_ON_SCENES = new Set(['LoginScene', 'RegisterScene']);

const Sidebar = ({ completedLevels = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // ← NOWE

  // kiedy scena się zmienia, decydujemy czy sidebar ma być widoczny
  const handleSceneChange = useCallback((e) => {
    const scene = e?.detail;
    const shouldHide = HIDE_ON_SCENES.has(scene);
    setIsVisible(!shouldHide);
    if (shouldHide) {
      setIsOpen(false);
      // na wszelki wypadek zamknij innym zainteresowanym
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));
    }
  }, []);

  useEffect(() => {
    // początkowo spróbuj odczytać znacznik z <body data-scene="..."> jeśli używasz
    const initialScene = document.body?.dataset?.scene;
    if (initialScene) {
      setIsVisible(!HIDE_ON_SCENES.has(initialScene));
    }
    window.addEventListener('sceneChange', handleSceneChange);
    return () => window.removeEventListener('sceneChange', handleSceneChange);
  }, [handleSceneChange]);

  const toggleMenu = () => {
    setIsOpen(prev => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: next } }));
      return next;
    });
  };

  // ⛔ NIC nie renderujemy, jeśli Sidebar ma być ukryty na danej scenie
  if (!isVisible) return null;

  return (
    <>
      <button className="menu-icon" onClick={toggleMenu} aria-label="Sidebar">
        <FontAwesomeIcon icon={faBars} size="2x" />
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2>Poziomy</h2>
        <ul>
          {Object.keys(LEVEL_KEYS).map(nStr => {
            const n = Number(nStr);
            return (
              <li
                key={n}
                onClick={() => {
                  const key = LEVEL_KEYS[n];
                  if (key) {
                    window.dispatchEvent(new CustomEvent('levelSelect', { detail: { key } }));
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));
                  }
                }}
              >
                <span>Poziom {n}</span>
                {completedLevels.includes(n) && (
                  <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                )}
              </li>
            );
          })}
        </ul>

        {/* 🚪 wylogowanie */}
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
