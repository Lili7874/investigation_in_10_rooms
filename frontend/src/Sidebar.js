import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import { LEVEL_KEYS } from './levels';  // <— TU!

const Sidebar = ({ completedLevels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(prev => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: next } }));
      return next;
    });
  };

  return (
    <>
      <button className="menu-icon" onClick={toggleMenu}>
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
	{/* 🚪 przycisk wylogowania */}
	<button
	  className="logout-btn"
	  onClick={() => {
		// zamknij panel i przekaż do App.js, żeby odpalił LoginScene
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
