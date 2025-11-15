// src/scenes/LevelSelect.js
import Phaser from 'phaser';
import { LEVEL_KEYS } from '../levels';
import { safeResume, bindVisibility, unbindVisibility } from '../lib/audioSafe';

/* =========================
   API base detection (spójne z Login/Register)
   ========================= */
const isBrowser = typeof window !== 'undefined';
const host = isBrowser ? window.location.hostname : '';

const isProdHosted =
  /netlify\.app$/.test(host) ||      // Netlify prod
  /netlify\.live$/.test(host) ||     // Netlify preview
  /netlify\.dev$/.test(host);        // Netlify dev

const RAW_API =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  (isProdHosted
    ? 'https://investigation-in-10-rooms.onrender.com' // fallback na Render w produkcji
    : 'http://localhost:3001');                         // lokalnie

const API = String(RAW_API).replace(/\/+$/, '');

if (isBrowser) {
  console.log('[LevelSelect] API_BASE =', API);
}

export default class LevelSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
    this._onResizeMute = null;
    this._onGlobalMuteChanged = null;

    this._rowsByNum = new Map();     // num -> { bg, label, hit, lock, check }
    this._completedNums = new Set(); // zbiór zaliczonych numerów
    this._unlockedNums  = new Set(); // zbiór odblokowanych numerów
    this._progressListener = null;

    this._scrollCfg = null;          // dane do scrolla (żeby ewentualnie łatwo reagować na resize)
  }

  preload() {
    if (!this.cache.audio.exists('bgm'))   this.load.audio('bgm', 'assets/ambient.mp3');
    if (!this.cache.audio.exists('click')) this.load.audio('click', 'assets/click.mp3');
    if (!this.cache.audio.exists('error')) this.load.audio('error', 'assets/error.mp3');
  }

  // ——— helpers ———
  _getUser() {
    try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  async _fetchProgress(userId) {
    try {
      const res = await fetch(`${API}/progress/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); // { ok, progress: [{ levelKey, completed, ...}, ...] }
      return data?.progress || [];
    } catch (e) {
      console.warn('Nie mogę pobrać progresu:', e.message || e);
      return [];
    }
  }

  _numFromKey(levelKey) {
    // LEVEL_KEYS: { 1:'LevelOffice', 2:'LevelRestaurant', ... }
    const entries = Object.entries(LEVEL_KEYS);
    const found = entries.find(([n, k]) => k === levelKey);
    return found ? Number(found[0]) : null;
  }

  _computeUnlocked() {
    // zasada: 1 zawsze odblokowany; n>1 odblokowany, jeśli (n-1) jest completed
    const nums = [...this._rowsByNum.keys()].sort((a,b)=>a-b);
    const unlocked = new Set();
    nums.forEach(n => {
      if (n === 1) unlocked.add(1);
      else if (this._completedNums.has(n - 1)) unlocked.add(n);
    });
    this._unlockedNums = unlocked;
  }

  _applyVisualState() {
    // odśwież wygląd i interaktywność wierszy
    this._rowsByNum.forEach((row, n) => {
      const isCompleted = this._completedNums.has(n);
      const isUnlocked  = this._unlockedNums.has(n);

      // wygląd
      const baseAlpha = isUnlocked ? 1 : 0.45;
      row.bg.setFillStyle(0xffffff, isUnlocked ? 0.10 : 0.06);
      row.bg.setAlpha(baseAlpha);
      row.label.setAlpha(baseAlpha);

      // ikonki
      row.lock.setVisible(!isUnlocked);
      row.check.setVisible(isCompleted);

      // interaktywność
      row.hit.removeAllListeners();
      // zapamiętaj bazowe X kłódki, żeby po "shake" wrócić do pozycji
      const lockBaseX = row.lock.x;

      if (isUnlocked) {
        row.hit.setInteractive({ cursor: 'pointer' });
        row.hit.on('pointerover', () => row.bg.setFillStyle(0xffffff, 0.12));
        row.hit.on('pointerout',  () => row.bg.setFillStyle(0xffffff, 0.10));
        row.hit.on('pointerdown', () => this._startLevel(n));
      } else {
        row.hit.setInteractive({ cursor: 'not-allowed' });
        row.hit.on('pointerdown', () => {
          try { this.sound.play('error', { volume: 0.8 }); } catch (_) {}
          // drobny „shake” blokady
          this.tweens.add({
            targets: [row.lock],
            x: { from: lockBaseX - 3, to: lockBaseX + 3 },
            duration: 40,
            yoyo: true,
            repeat: 3,
            onComplete: () => { row.lock.setX(lockBaseX); } // ← bez samoprzydziału
          });
        });
      }
    });
  }

  _startLevel(n) {
    try { this.sound.play('click', { volume: 0.8, detune: 50 }); } catch (_) {}
    const key = LEVEL_KEYS[n];
    if (!key) return;
    this.game.registry.set('currentLevelKey', key);
    this.scene.start(key);
    this.scene.stop('LevelSelect');
  }

  async create() {
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LevelSelect' }));

    // kolejność poziomów (taka sama w App/Sidebar)
    const levelOrder = [
      'LevelOffice','LevelRestaurant','LevelLibrary','LevelTrainstation',
      'LevelTheater','LevelMuseum','LevelVillageHouse','LevelHospital','LevelCasino'
    ];
    this.game.registry.set('levelOrder', levelOrder);

    const { width, height } = this.scale;

    // tło
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.35);

    // tytuł
    this.add.text(width/2, 80, 'Wybierz poziom', {
      fontFamily: 'Monaco, monospace', fontSize: '32px', color: '#FFFFFF'
    }).setOrigin(0.5);

    // panel-lista – responsywny
    const containerW = Math.min(460, width - 80);
    const containerH = Math.min(520, height - 220); // zostawiamy miejsce na tytuł i przycisk Wyloguj
    const cx = width/2, cy = height/2 + 10;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x140028, 0.9);
    gfx.lineStyle(2, 0x8e4dff, 1);
    gfx.fillRoundedRect(cx - containerW/2, cy - containerH/2, containerW, containerH, 14);
    gfx.strokeRoundedRect(cx - containerW/2, cy - containerH/2, containerW, containerH, 14);

    // obszar przewijany
    const scrollArea = this.add.container(cx - containerW/2 + 16, cy - containerH/2 + 16);
    const rowH = 44, gap = 10;

    // zbuduj wiersze
    const entries = Object.keys(LEVEL_KEYS).map(n => Number(n)).sort((a,b)=>a-b);

    entries.forEach((n, i) => {
      const y = i * (rowH + gap);

      const bg = this.add.rectangle(0, y, containerW - 32, rowH, 0xffffff, 0.06)
        .setOrigin(0,0).setStrokeStyle(1, 0xb983ff, 0.6);

      const label = this.add.text(14, y + 10, `Poziom ${n}`, {
        fontFamily: 'Monaco, monospace', fontSize: '18px', color: '#FFFFFF'
      }).setOrigin(0,0);

      // ikonki po prawej: lock i check
      const lock = this.add.text(containerW - 32 - 26, y + 9, '🔒', {
        fontFamily: 'Monaco, monospace', fontSize: '18px', color: '#FFFFFF'
      }).setOrigin(0,0).setAlpha(0.9);

      const check = this.add.text(containerW - 32 - 26, y + 9, '✅', {
        fontFamily: 'Monaco, monospace', fontSize: '18px', color: '#32cd32'
      }).setOrigin(0,0).setVisible(false);

      const hit = this.add.rectangle((containerW-32)/2, y + rowH/2, containerW - 32, rowH, 0x000000, 0);
      hit.setOrigin(0.5, 0.5);

      scrollArea.add([bg, label, lock, check, hit]);

      this._rowsByNum.set(n, { bg, label, hit, lock, check });
    });

    // SCROLL – koło / klawiatura / przyciski
    const totalH = entries.length * (rowH + gap) - gap;
    const visibleH = containerH - 32; // wysokość „okienka” wewnątrz ramki
    const maxScroll = Math.max(0, totalH - visibleH);
    let scrollY = 0;

    const applyScroll = () => {
      const baseY = cy - containerH/2 + 16;
      const clamped = Phaser.Math.Clamp(scrollY, 0, maxScroll);
      scrollArea.y = baseY - clamped;
    };

    applyScroll();

    const scrollStep = rowH + gap;

    const scrollBy = (delta) => {
      scrollY += delta;
      applyScroll();
    };

    // kółko myszy
    this.input.on('wheel', (_p, _o, dx, dy) => {
      if (Math.abs(dy) > Math.abs(dx)) {
        scrollBy(dy);
      }
    });

    // klawiatura ↑ / ↓
    this.input.keyboard?.on('keydown-UP', () => scrollBy(-scrollStep));
    this.input.keyboard?.on('keydown-DOWN', () => scrollBy(scrollStep));

    // przyciski ▲ i ▼ obok panelu, żeby było bardziej „czytelnie”, że da się przewijać
    const arrowStyle = {
      fontFamily: 'Monaco, monospace',
      fontSize: '22px',
      color: '#FFFFFF'
    };

    const upArrow = this.add.text(
      cx + containerW/2 + 20,
      cy - containerH/2 + 20,
      '▲',
      arrowStyle
    )
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    const downArrow = this.add.text(
      cx + containerW/2 + 20,
      cy + containerH/2 - 20,
      '▼',
      arrowStyle
    )
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    upArrow.on('pointerdown', () => scrollBy(-scrollStep));
    downArrow.on('pointerdown', () => scrollBy(scrollStep));

    // zapamiętujemy konfigurację scrolla (jakbyś chciała kiedyś reagować na resize)
    this._scrollCfg = {
      entriesCount: entries.length,
      rowH,
      gap,
      containerW,
      containerH,
      cx,
      cy,
      scrollArea,
      upArrow,
      downArrow,
      scrollY,
      maxScroll,
      applyScroll,
    };

    // wyloguj
    const logoutBtn = this.add.text(cx, cy + containerH/2 + 40, '🚪 Wyloguj', {
      fontFamily: 'Monaco, monospace', fontSize: '18px',
      color: '#ff4444', backgroundColor: '#220000', padding: { x: 12, y: 6 }
    })
    .setOrigin(0.5)
    .setInteractive({ cursor: 'pointer' });

    logoutBtn.on('pointerover', () => logoutBtn.setStyle({ backgroundColor: '#440000' }));
    logoutBtn.on('pointerout',  () => logoutBtn.setStyle({ backgroundColor: '#220000' }));
    logoutBtn.on('pointerdown', () => {
      this.scene.start('LoginScene');
      this.scene.stop('LevelSelect');
    });

    // === AUDIO / Visibility ===
    this.input.once('pointerdown', () => safeResume(this));
    bindVisibility(this, 'LevelSelect');

    if (!this.game.__bgm) {
      this.game.__bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
      this.game.__bgm.play();
    }
    this.bgm = this.game.__bgm;

    const reg = this.game.registry;
    let gm = reg.get('globalMuted');
    if (gm == null) {
      gm = localStorage.getItem('globalMuted') === '1';
      reg.set('globalMuted', gm);
    }
    this.sound.mute = !!gm;

    // przycisk 🔊/🔇
    const btnSize = 40, pad = 20;
    this.muteBtn = this.add.text(
      this.scale.width - btnSize - pad,
      this.scale.height - btnSize - pad,
      this.sound.mute ? '🔇' : '🔊',
      { fontFamily: 'Monaco, monospace', fontSize: '28px', color: '#FFFFFF' }
    )
    .setInteractive({ cursor: 'pointer' })
    .setScrollFactor(0)
    .setDepth(2000);

    this.muteBtn.on('pointerdown', (pointer) => {
      pointer?.event?.stopImmediatePropagation?.();
      pointer?.event?.stopPropagation?.();
      const newMuted = !this.sound.mute;
      this.sound.mute = newMuted;
      this.game.registry.set('globalMuted', newMuted);
      localStorage.setItem('globalMuted', newMuted ? '1' : '0');
      this.muteBtn.setText(newMuted ? '🔇' : '🔊');
    });

    this._onGlobalMuteChanged = (_parent, value) => {
      this.sound.mute = !!value;
      this.muteBtn?.setText(this.sound.mute ? '🔇' : '🔊');
    };
    reg.events.on('changedata-globalMuted', this._onGlobalMuteChanged);

    this._onResizeMute = (gameSize) => {
      this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
    };
    this.scale.on('resize', this._onResizeMute);

    // === pobierz progres i ustaw stan odblokowania ===
    const user = this._getUser();
    if (user?.id) {
      const progress = await this._fetchProgress(user.id);
      // uzupełnij _completedNums
      this._completedNums.clear();
      for (const row of progress) {
        if (row.completed && row.levelKey) {
          const num = this._numFromKey(row.levelKey);
          if (num != null) this._completedNums.add(num);
        }
      }
    } else {
      this._completedNums.clear(); // brak usera = brak progresu
    }

    // policz odblokowane i odśwież wygląd
    this._computeUnlocked();
    this._applyVisualState();

    // aktualizuj po zapisie progresu z poziomu
    this._progressListener = (e) => {
      const levelKey = e?.detail?.levelKey;
      if (!levelKey) return;
      const num = this._numFromKey(levelKey);
      if (num != null) this._completedNums.add(num);
      this._computeUnlocked();
      this._applyVisualState();
    };
    window.addEventListener('progressSaved', this._progressListener);

    // sprzątanie
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this._progressListener) {
        window.removeEventListener('progressSaved', this._progressListener);
        this._progressListener = null;
      }
      if (this._onResizeMute) {
        this.scale.off('resize', this._onResizeMute);
        this._onResizeMute = null;
      }
      if (this._onGlobalMuteChanged) {
        this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
        this._onGlobalMuteChanged = null;
      }
      unbindVisibility('LevelSelect');
      this.muteBtn?.destroy();
      this.muteBtn = null;
      this._rowsByNum.clear();
      this._completedNums.clear();
      this._unlockedNums.clear();
    });
  }
}
