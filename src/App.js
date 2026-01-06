// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// Sceny
import LoginScene from './scenes/LoginScene';
import LegalScene from './scenes/LegalScene';
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
import LevelYacht from './scenes/LevelYacht';

import Sidebar from './scenes/Sidebar';

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
  'LevelYacht'
]);

const App = () => {
  const gameRef = useRef(null);
  const [completedLevels] = useState([]); 
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        transparent: true,
        backgroundColor: 'rgba(0,0,0,0)',

        scale: {
          mode: Phaser.Scale.RESIZE,          
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: window.innerWidth,        
          height: window.innerHeight,
          min: {
            width: 800,
            height: 600,
          },
          max: {
            width: 1920,
            height: 1080,
          },
        },

        scene: [
          LoginScene,
          RegisterScene,
          ForgotPasswordScene,
          ResetPasswordScene,
          LevelSelect,
          LegalScene,
          LevelOffice,
          LevelRestaurant,
          LevelLibrary,
          LevelTrainstation,
          LevelTheater,
          LevelMuseum,
          LevelVillageHouse,
          LevelHospital,
          LevelCasino,
          LevelYacht
        ],
      };

      gameRef.current = new Phaser.Game(config);

      const params = new URLSearchParams(window.location.search);
      const sceneFromUrl = params.get('scene');
      const startKey =
        sceneFromUrl && KNOWN_SCENES.has(sceneFromUrl)
          ? sceneFromUrl
          : 'LoginScene';

      setShowSidebar(!HIDE_SCENES.has(startKey));

      gameRef.current.scene.start(startKey);
    }

    // Zmiana sceny 
    const onSceneChange = (e) => {
      const sceneKey = e?.detail;
      setShowSidebar(sceneKey ? !HIDE_SCENES.has(sceneKey) : false);
    };

    // Wybór sceny
    const onLevelSelect = (e) => {
      const key = e.detail?.key;
      if (!key || !gameRef.current) return;

      if (key === 'LoginScene') setShowSidebar(false);
      gameRef.current.scene.start(key);
    };

    const onResize = () => {
      const game = gameRef.current;
      if (!game || !game.scale) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      game.scale.resize(w, h);
    };

    window.addEventListener('sceneChange', onSceneChange);
    window.addEventListener('levelSelect', onLevelSelect);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('sceneChange', onSceneChange);
      window.removeEventListener('levelSelect', onLevelSelect);
      window.removeEventListener('resize', onResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
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