// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// Sceny
import LoginScene from './scenes/LoginScene';
import RegisterScene from './scenes/RegisterScene';
import ForgotPasswordScene from './scenes/ForgotPasswordScene';
import ResetPasswordScene from './scenes/ResetPasswordScene';
import LevelSelect from './scenes/LevelSelect';
import LevelOffice from './scenes/LevelOffice';
import LevelCasino from './scenes/LevelCasino';
import LevelHospital from './scenes/LevelHospital';
import LevelVillageHouse from './scenes/LevelVillageHouse';
import LevelMuseum from './scenes/LevelMuseum';
import LevelTheater from './scenes/LevelTheater';
import LevelLibrary from './scenes/LevelLibrary';
import LevelTrainstation from './scenes/LevelTrainstation';
import LevelRestaurant from './scenes/LevelRestaurant';

import Sidebar from './Sidebar';

const HIDE_SCENES = new Set([
  'LoginScene',
  'RegisterScene',
  'ForgotPasswordScene',
  'ResetPasswordScene',
]);

const KNOWN_SCENES = new Set([
  'LoginScene',
  'RegisterScene',
  'ForgotPasswordScene',
  'ResetPasswordScene',
  'LevelSelect',
  'LevelOffice',
  'LevelCasino',
  'LevelHospital',
  'LevelVillageHouse',
  'LevelMuseum',
  'LevelTheater',
  'LevelLibrary',
  'LevelTrainstation',
  'LevelRestaurant',
]);

const App = () => {
  const gameRef = useRef(null);
  const [completedLevels] = useState([]); // usunięty nieużywany setter
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'game-container',
        transparent: true,
        scene: [
          LoginScene,
          RegisterScene,
          ForgotPasswordScene,
          ResetPasswordScene,
          LevelSelect,
          LevelOffice,
          LevelRestaurant,
          LevelLibrary,
          LevelTrainstation,
          LevelTheater,
          LevelMuseum,
          LevelVillageHouse,
          LevelHospital,
          LevelCasino,
        ],
      });

      // Start: scena z URL ?scene=..., inaczej LoginScene
      const params = new URLSearchParams(window.location.search);
      const sceneFromUrl = params.get('scene');
      const startKey =
        sceneFromUrl && KNOWN_SCENES.has(sceneFromUrl)
          ? sceneFromUrl
          : 'LoginScene';

      // Ustaw od razu widoczność sidebara pod scenę startową
      setShowSidebar(!HIDE_SCENES.has(startKey));

      gameRef.current.scene.start(startKey);
    }

    // Zmiana sceny -> pokaż/ukryj Sidebar
    const onSceneChange = (e) => {
      const sceneKey = e?.detail;
      setShowSidebar(sceneKey ? !HIDE_SCENES.has(sceneKey) : false);
    };

    // Wybór sceny z Sidebara / innych UI
    const onLevelSelect = (e) => {
      const key = e.detail?.key;
      if (!key || !gameRef.current) return;

      if (key === 'LoginScene') setShowSidebar(false);
      gameRef.current.scene.start(key);
    };

    // Reaguj na rozmiar okna (dopasuj płótno Phasera)
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const game = gameRef.current;
      if (game && game.scale) game.scale.resize(w, h);
    };

    window.addEventListener('sceneChange', onSceneChange);
    window.addEventListener('levelSelect', onLevelSelect);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('sceneChange', onSceneChange);
      window.removeEventListener('levelSelect', onLevelSelect);
      window.removeEventListener('resize', onResize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <>
      {showSidebar && <Sidebar completedLevels={completedLevels} />}
      <div id="game-container" />
    </>
  );
};

export default App;
