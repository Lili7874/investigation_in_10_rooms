import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import LoginScene from './LoginScene';
import RegisterScene from './RegisterScene';
import LevelOffice from './scenes/LevelOffice';
import LevelCasino from './scenes/LevelCasino';
import LevelHospital from './scenes/LevelHospital';
import LevelVillageHouse from './scenes/LevelVillageHouse';
import LevelMuseum from './scenes/LevelMuseum';
import LevelTheater from './scenes/LevelTheater';
import LevelLibrary from './scenes/LevelLibrary';
import LevelTrainstation from './scenes/LevelTrainstation';
import LevelRestaurant from './scenes/LevelRestaurant';
import LevelSelect from './scenes/LevelSelect';
import Sidebar from './Sidebar';

const App = () => {
  const gameRef = useRef(null);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'game-container',
        transparent: true,
        scene: [LoginScene, RegisterScene, LevelSelect, LevelOffice, LevelRestaurant, LevelLibrary, LevelTrainstation, LevelTheater, LevelMuseum, LevelVillageHouse, LevelHospital, LevelCasino /*, kolejne level-e */],
      });
	const onLevelSelect = (e) => {
		const key = e.detail?.key;
		if (!key) return;

		// jeśli wylogowanie -> od razu schowaj Sidebar
		if (key === 'LoginScene') setShowSidebar(false);

		gameRef.current.scene.start(key);
	};
  window.addEventListener('levelSelect', onLevelSelect);
    }

    // nasłuch scen
    const onSceneChange = (e) => {
      setShowSidebar(e.detail !== 'LoginScene');
    };
    window.addEventListener('sceneChange', onSceneChange);

    // klik w sidebar (wybór poziomu)
    const onLevelSelect = (e) => {
      const key = e.detail?.key;
      if (key) gameRef.current.scene.start(key);
    };
    window.addEventListener('levelSelect', onLevelSelect);

    return () => {
      window.removeEventListener('sceneChange', onSceneChange);
      window.removeEventListener('levelSelect', onLevelSelect);
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