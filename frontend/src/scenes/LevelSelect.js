// src/scenes/LevelSelect.js
import Phaser from 'phaser';
import { LEVEL_KEYS } from '../levels';
import { safeResume, bindVisibility, unbindVisibility } from '../audioSafe';

export default class LevelSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
    this._onResizeMute = null;
    this._onGlobalMuteChanged = null;
  }
  
  preload() {
    // wspólny BGM
    if (!this.cache.audio.exists('bgm')) {
      this.load.audio('bgm', 'assets/ambient.mp3');
    }
    if (!this.cache.audio.exists('click')) {
      this.load.audio('click', 'assets/click.mp3');
    }
  }

  create() {
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LevelSelect' }));

    // kolejność poziomów
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

    // panel-lista
    const containerW = 420;
    const containerH = Math.min(520, height - 180);
    const cx = width/2, cy = height/2 + 20;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x140028, 0.9);
    gfx.lineStyle(2, 0x8e4dff, 1);
    gfx.fillRoundedRect(cx - containerW/2, cy - containerH/2, containerW, containerH, 14);
    gfx.strokeRoundedRect(cx - containerW/2, cy - containerH/2, containerW, containerH, 14);

    const scrollArea = this.add.container(cx - containerW/2 + 16, cy - containerH/2 + 16);
    const rowH = 44, gap = 10;

    // wiersze „Poziom X”
    const entries = Object.keys(LEVEL_KEYS).map(n => Number(n)).sort((a,b)=>a-b);

    entries.forEach((n, i) => {
      const y = i * (rowH + gap);

      const bg = this.add.rectangle(0, y, containerW - 32, rowH, 0xffffff, 0.06)
        .setOrigin(0,0).setStrokeStyle(1, 0xb983ff, 0.6);
      const label = this.add.text(12, y + 10, `Poziom ${n}`, {
        fontFamily: 'Monaco, monospace', fontSize: '18px', color: '#FFFFFF'
      }).setOrigin(0,0);

      const hit = this.add.rectangle((containerW-32)/2, y + rowH/2, containerW - 32, rowH, 0x000000, 0)
        .setInteractive({ cursor: 'pointer' });

      hit.on('pointerover', () => { bg.setFillStyle(0xffffff, 0.10); });
      hit.on('pointerout',  () => { bg.setFillStyle(0xffffff, 0.06); });
      hit.on('pointerdown', () => {
        try { this.sound.play('click', { volume: 0.8, detune: 50 }); } catch (_) {}
        const key = LEVEL_KEYS[n];
        if (key) {
          this.game.registry.set('currentLevelKey', key);
          this.scene.start(key);
          // zatrzymaj LevelSelect, żeby SHUTDOWN posprzątał (np. listenery)
          this.scene.stop('LevelSelect');
        }
      });

      scrollArea.add([bg, label, hit]);
    });

    // wyloguj
    const logoutBtn = this.add.text(cx, cy + containerH/2 + 30, '🚪 Wyloguj', {
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

    // === AUDIO ===
    // odblokuj AudioContext po 1. interakcji (bezpiecznie)
    this.input.once('pointerdown', () => safeResume(this));
    // zdeduplikowana obsługa visibility (bez własnych listenerów)
    bindVisibility(this, 'LevelSelect');

    // globalny BGM (singleton)
    if (!this.game.__bgm) {
      this.game.__bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
      this.game.__bgm.play();
    }
    this.bgm = this.game.__bgm; // nie pauzujemy/nie wznawiamy lokalnie

    // globalny mute z registry / localStorage
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

    // nasłuch zmian globalMuted z innych scen
    this._onGlobalMuteChanged = (_parent, value) => {
      this.sound.mute = !!value;
      this.muteBtn?.setText(this.sound.mute ? '🔇' : '🔊');
    };
    reg.events.on('changedata-globalMuted', this._onGlobalMuteChanged);

    // reposition mute button on resize
    this._onResizeMute = (gameSize) => {
      this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
    };
    this.scale.on('resize', this._onResizeMute);

    // scroll listy
    const totalH = entries.length * (rowH + gap) - gap;
    const maxScroll = Math.max(0, totalH - (containerH - 32));
    let scrollY = 0;
    const applyScroll = () => {
      scrollY = Phaser.Math.Clamp(scrollY, 0, maxScroll);
      scrollArea.y = cy - containerH/2 + 16 - scrollY;
    };
    this.input.on('wheel', (_p, _o, dx, dy) => {
      scrollY += (Math.abs(dy) > Math.abs(dx) ? dy : 0);
      applyScroll();
    });

    // sprzątanie
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this._onResizeMute) {
        this.scale.off('resize', this._onResizeMute);
        this._onResizeMute = null;
      }
      if (this._onGlobalMuteChanged) {
        this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
        this._onGlobalMuteChanged = null;
      }

      // zdejmij wspólny handler visibility dla tej sceny
      unbindVisibility('LevelSelect');

      this.muteBtn?.destroy();
      this.muteBtn = null;
    });
  }
}
