// src/scenes/LevelSelect.js
import Phaser from 'phaser';
import { LEVEL_KEYS } from '../levels';
import { safeResume, bindVisibility, unbindVisibility } from '../lib/audioSafe';

/* =========================
   API base detection
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

if (isBrowser) {
  console.log('[LevelSelect] API_BASE =', API, 'host =', host);
}

export default class LevelSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
    this._onResizeMute = null;
    this._onGlobalMuteChanged = null;

    this._rowsByNum = new Map();
    this._completedNums = new Set();
    this._unlockedNums  = new Set();
    this._progressListener = null;

    this._scrollCfg = null;

    this.video = null;
    this.muteBtn = null;
  }

  preload() {
    if (!this.cache.video.exists('bgVideo')) {
      this.load.video('bgVideo', 'assets/backgroundvideo.mp4', 'canplaythrough', false, true);
    }

    if (!this.cache.audio.exists('bgm'))   this.load.audio('bgm', 'assets/ambient.mp3');
    if (!this.cache.audio.exists('click')) this.load.audio('click', 'assets/click.mp3');
    if (!this.cache.audio.exists('error')) this.load.audio('error', 'assets/error.mp3');
  }

  /* Helpers */
  _getUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async _fetchProgress(userId) {
    try {
      const res = await fetch(`${API}/progress/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data?.progress || [];
    } catch (e) {
      console.warn('Nie mogę pobrać progresu:', e.message || e);
      return [];
    }
  }

  _numFromKey(levelKey) {
    const entries = Object.entries(LEVEL_KEYS);
    const found = entries.find(([n, k]) => k === levelKey);
    return found ? Number(found[0]) : null;
  }

  _computeUnlocked() {
    const nums = [...this._rowsByNum.keys()].sort((a, b) => a - b);
    const unlocked = new Set();
    nums.forEach(n => {
      if (n === 1) unlocked.add(1);
      else if (this._completedNums.has(n - 1)) unlocked.add(n);
    });
    this._unlockedNums = unlocked;
  }

  _applyVisualState() {
    this._rowsByNum.forEach((row, n) => {
      const isCompleted = this._completedNums.has(n);
      const isUnlocked  = this._unlockedNums.has(n);

      const baseAlpha = isUnlocked ? 1 : 0.45;
      row.bg.setFillStyle(0xffffff, isUnlocked ? 0.10 : 0.06);
      row.bg.setAlpha(baseAlpha);
      row.label.setAlpha(baseAlpha);

      row.lock.setVisible(!isUnlocked);
      row.check.setVisible(isCompleted);

      row.hit.removeAllListeners();
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
          this.tweens.add({
            targets: [row.lock],
            x: { from: lockBaseX - 3, to: lockBaseX + 3 },
            duration: 40,
            yoyo: true,
            repeat: 3,
            onComplete: () => { row.lock.setX(lockBaseX); }
          });
        });
      }
    });
  }

  _startLevel(n) {
    try { this.sound.play('click', { volume: 0.8, detune: 50 }); } catch (_) {}
    const key = LEVEL_KEYS[n];
    if (!key) return;

    try {
      this.game.registry.set('lastSceneKey', key);
      localStorage.setItem('lastSceneKey', key);
    } catch (_) {}

    this.game.registry.set('currentLevelKey', key);
    this.scene.start(key);
    this.scene.stop('LevelSelect');
  }

  /** Wideo jako tło: rozciągnięte na cały canvas */
  _resizeBgVideo() {
    if (!this.video) return;

    const canvasW = this.scale.width;
    const canvasH = this.scale.height;

    this.video
      .setDisplaySize(canvasW, canvasH)
      .setPosition(canvasW / 2, canvasH / 2);
  }

  async create() {
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LevelSelect' }));

    try {
      this.game.registry.set('lastSceneKey', 'LevelSelect');
      localStorage.setItem('lastSceneKey', 'LevelSelect');
    } catch (_) {}

    const levelOrder = [
      'LevelOffice','LevelRestaurant','LevelLibrary','LevelTrainstation',
      'LevelTheater','LevelMuseum','LevelVillageHouse','LevelHospital','LevelCasino'
    ];
    this.game.registry.set('levelOrder', levelOrder);

    const { width, height } = this.scale;

    /* Tło wideo */
    this.video = this.add.video(0, 0, 'bgVideo')
      .setMute(true)
      .setLoop(true)
      .setDepth(-1)
      .setOrigin(0.5);

    try {
      this.video.play(true);
    } catch {}

    this.video.on('play', () => {
      this._resizeBgVideo();
    });
    this._resizeBgVideo();

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35);

    /* Nagłówek */
    this.add.text(width / 2, 80, 'Wybierz poziom', {
      fontFamily: 'Monaco, monospace', fontSize: '32px', color: '#FFFFFF'
    }).setOrigin(0.5);

    /* Panel listy poziomów */
    const containerW = Math.min(460, width - 80);
    const containerH = Math.min(520, height - 220);
    const cx = width / 2, cy = height / 2 + 10;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x140028, 0.9);
    gfx.lineStyle(2, 0x8e4dff, 1);
    gfx.fillRoundedRect(cx - containerW / 2, cy - containerH / 2, containerW, containerH, 14);
    gfx.strokeRoundedRect(cx - containerW / 2, cy - containerH / 2, containerW, containerH, 14);

    const innerPadding = 16;
    const scrollArea = this.add.container(
      cx - containerW / 2 + innerPadding,
      cy - containerH / 2 + innerPadding
    );
    const rowH = 44, gap = 10;

    const entries = Object.keys(LEVEL_KEYS).map(n => Number(n)).sort((a, b) => a - b);

    entries.forEach((n, i) => {
      const y = i * (rowH + gap);

      const bg = this.add.rectangle(0, y, containerW - innerPadding * 2, rowH, 0xffffff, 0.06)
        .setOrigin(0, 0).setStrokeStyle(1, 0xb983ff, 0.6);

      const label = this.add.text(14, y + 10, `Poziom ${n}`, {
        fontFamily: 'Monaco, monospace', fontSize: '18px', color: '#FFFFFF'
      }).setOrigin(0, 0);

      const lock = this.add.text(containerW - innerPadding * 2 - 26, y + 9, '🔒', {
        fontFamily: 'Monaco, monospace', fontSize: '18px', color: '#FFFFFF'
      }).setOrigin(0, 0).setAlpha(0.9);

      const check = this.add.text(containerW - innerPadding * 2 - 26, y + 9, '✅', {
        fontFamily: 'Monaco, monospace', fontSize: '18px', color: '#32cd32'
      }).setOrigin(0, 0).setVisible(false);

      const hit = this.add.rectangle(
        (containerW - innerPadding * 2) / 2,
        y + rowH / 2,
        containerW - innerPadding * 2,
        rowH,
        0x000000,
        0
      ).setOrigin(0.5);

      scrollArea.add([bg, label, lock, check, hit]);
      this._rowsByNum.set(n, { bg, label, hit, lock, check });
    });

    /* Maska listy */
    const maskGfx = this.make.graphics({ x: 0, y: 0, add: true });
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRoundedRect(
      cx - containerW / 2 + innerPadding,
      cy - containerH / 2 + innerPadding,
      containerW - innerPadding * 2,
      containerH - innerPadding * 2,
      10
    );
    const mask = maskGfx.createGeometryMask();
    maskGfx.visible = false;
    scrollArea.setMask(mask);

    /* Scroll listy */
    const totalH = entries.length * (rowH + gap) - gap;
    const visibleH = containerH - innerPadding * 2;
    const maxScroll = Math.max(0, totalH - visibleH);
    let scrollY = 0;

    const arrowStyle = {
      fontFamily: 'Monaco, monospace',
      fontSize: '22px',
      color: '#FFFFFF'
    };

    const upArrow = this.add.text(
      cx + containerW / 2 - 18,
      cy - containerH / 2 + 18,
      '▲',
      arrowStyle
    ).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    const downArrow = this.add.text(
      cx + containerW / 2 - 18,
      cy + containerH / 2 - 18,
      '▼',
      arrowStyle
    ).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    const updateArrows = () => {
      upArrow.setAlpha(scrollY <= 0 ? 0.25 : 1);
      downArrow.setAlpha(scrollY >= maxScroll ? 0.25 : 1);
    };

    const applyScroll = () => {
      const baseY = cy - containerH / 2 + innerPadding;
      const clamped = Phaser.Math.Clamp(scrollY, 0, maxScroll);
      scrollY = clamped;
      scrollArea.y = baseY - clamped;
      updateArrows();
    };

    const scrollStep = rowH + gap;

    const scrollBy = (deltaSteps) => {
      scrollY += deltaSteps * scrollStep;
      applyScroll();
    };

    applyScroll();

    this.input.on('wheel', (_p, _o, dx, dy) => {
      if (Math.abs(dy) > Math.abs(dx)) {
        const dir = Math.sign(dy);
        if (dir !== 0) scrollBy(dir);
      }
    });

    this.input.keyboard?.on('keydown-UP', () => scrollBy(-1));
    this.input.keyboard?.on('keydown-DOWN', () => scrollBy(1));

    upArrow.on('pointerdown', () => scrollBy(-1));
    downArrow.on('pointerdown', () => scrollBy(1));

    this._scrollCfg = {
      scrollArea,
      upArrow,
      downArrow,
      scrollY,
      maxScroll,
      applyScroll
    };

    /* Wylogowanie z poziomu LevelSelect */
    const logoutBtn = this.add.text(
      cx,
      cy + containerH / 2 + 40,
      '🚪 Wyloguj',
      {
        fontFamily: 'Monaco, monospace',
        fontSize: '18px',
        color: '#ff4444',
        backgroundColor: '#220000',
        padding: { x: 12, y: 6 }
      }
    )
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    logoutBtn.on('pointerover', () =>
      logoutBtn.setStyle({ backgroundColor: '#440000' })
    );
    logoutBtn.on('pointerout', () =>
      logoutBtn.setStyle({ backgroundColor: '#220000' })
    );
    logoutBtn.on('pointerdown', () => {
      try { this.sound.play('click', { volume: 0.8, detune: 50 }); } catch {}

      try {
        localStorage.removeItem('user');     
        this.game.registry.set('currentLevelKey', null);
      } catch (_) {}

      this.scene.start('LoginScene');
      this.scene.stop('LevelSelect');
    });

    /* Audio / Visibility */
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
      const w = gameSize?.width ?? this.scale.width;
      const h = gameSize?.height ?? this.scale.height;
      this.muteBtn?.setPosition(w - btnSize - pad, h - btnSize - pad);
      this._resizeBgVideo();
    };
    this.scale.on('resize', this._onResizeMute);

    /* Progres gracza */
    const user = this._getUser();
    if (user?.id) {
      const progress = await this._fetchProgress(user.id);
      this._completedNums.clear();
      for (const row of progress) {
        if (row.completed && row.levelKey) {
          const num = this._numFromKey(row.levelKey);
          if (num != null) this._completedNums.add(num);
        }
      }
    } else {
      this._completedNums.clear();
    }

    this._computeUnlocked();
    this._applyVisualState();

    this._progressListener = (e) => {
      const levelKey = e?.detail?.levelKey;
      if (!levelKey) return;
      const num = this._numFromKey(levelKey);
      if (num != null) this._completedNums.add(num);
      this._computeUnlocked();
      this._applyVisualState();
    };
    window.addEventListener('progressSaved', this._progressListener);

    /* Cleanup (SHUTDOWN) */
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

      if (this.video) {
        try { this.video.stop(); } catch {}
        this.video.destroy();
        this.video = null;
      }

      this._rowsByNum.clear();
      this._completedNums.clear();
      this._unlockedNums.clear();
    });
  }
}