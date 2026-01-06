// src/levels.js
export const LEVEL_KEYS = Object.freeze({
  1: 'LevelOffice',
  2: 'LevelRestaurant',
  3: 'LevelVillageHouse',
  4: 'LevelTrainstation',
  5: 'LevelTheater',
  6: 'LevelMuseum',
  7: 'LevelLibrary',
  8: 'LevelHospital',
  9: 'LevelCasino',
  10: 'LevelYacht',
});

export const LEVEL_LIST = Object.freeze(
  Object.entries(LEVEL_KEYS).map(([n, key]) => ({ number: Number(n), key }))
);
export const TOTAL_LEVELS = LEVEL_LIST.length;
export const levelKeyFromNumber = (n) => LEVEL_KEYS[n] || null;
export const levelNumberFromKey = (key) => {
  const found = LEVEL_LIST.find((l) => l.key === key);
  return found ? found.number : null;
};
export const isValidLevelNumber = (n) => !!LEVEL_KEYS[n];
export const isValidLevelKey = (key) => levelNumberFromKey(key) != null;