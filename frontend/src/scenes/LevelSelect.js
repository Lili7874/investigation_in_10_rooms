import Phaser from 'phaser';
import { LEVEL_KEYS } from '../levels';

export default class LevelSelect extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelect' });
  }
  
  preload() {
	  // muzyka tła
	  if (!this.cache.audio.exists('bgm')) {
		this.load.audio('bgm', 'assets/ambient.mp3');   // dostosuj ścieżkę
	  }

	  // kliknięcia
	  if (!this.cache.audio.exists('click')) {
		this.load.audio('click', 'assets/click.mp3');
	  }
	}


  create() {
    // pokaż Sidebar (App.js nasłuchuje)
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LevelSelect' }));

    const { width, height } = this.scale;

    // tło lekko przygaszone
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.35);

    // tytuł
    this.add.text(width/2, 80, 'Wybierz poziom', {
      fontFamily: 'Monaco, monospace',
      fontSize: '32px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // panel-lista (jak w Sidebarze, 1:1 układ)
    const containerW = 420;
    const containerH = Math.min(520, height - 180);
    const cx = width/2, cy = height/2 + 20;

    const gfx = this.add.graphics();
    gfx.fillStyle(0x140028, 0.9);
    gfx.lineStyle(2, 0x8e4dff, 1);
    gfx.fillRoundedRect(cx - containerW/2, cy - containerH/2, containerW, containerH, 14);
    gfx.strokeRoundedRect(cx - containerW/2, cy - containerH/2, containerW, containerH, 14);

    const scrollArea = this.add.container(cx - containerW/2 + 16, cy - containerH/2 + 16);
    const rowH = 44;
    const gap = 10;

    // zbuduj wiersze „Poziom X”
    const entries = Object.keys(LEVEL_KEYS).map(n => Number(n));
    entries.sort((a,b)=>a-b);

    entries.forEach((n, i) => {
      const y = i * (rowH + gap);

      const bg = this.add.rectangle(0, y, containerW - 32, rowH, 0xffffff, 0.06)
        .setOrigin(0,0).setStrokeStyle(1, 0xb983ff, 0.6);
      const label = this.add.text(12, y + 10, `Poziom ${n}`, {
        fontFamily: 'Monaco, monospace',
        fontSize: '18px',
        color: '#FFFFFF'
      }).setOrigin(0,0);

      // interakcja
      const hit = this.add.rectangle((containerW-32)/2, y + rowH/2, containerW - 32, rowH, 0x000000, 0)
        .setInteractive({ cursor: 'pointer' });
      hit.on('pointerover', () => { bg.setFillStyle(0xffffff, 0.10); });
      hit.on('pointerout',  () => { bg.setFillStyle(0xffffff, 0.06); });
      hit.on('pointerdown', () => {
        const key = LEVEL_KEYS[n];
        if (key) {
          this.sound.play('click', { volume: 0.8, detune: 50 },);
          this.scene.start(key);
        }
      });

      scrollArea.add([bg, label, hit]);
    });
	
	const logoutBtn = this.add.text(cx, cy + containerH/2 + 30, '🚪 Wyloguj', {
	  fontFamily: 'Monaco, monospace',
	  fontSize: '18px',
	  color: '#ff4444',
	  backgroundColor: '#220000',
	  padding: { x: 12, y: 6 }
	})
	.setOrigin(0.5)
	.setInteractive({ cursor: 'pointer' });

	logoutBtn.on('pointerover', () => logoutBtn.setStyle({ backgroundColor: '#440000' }));
	logoutBtn.on('pointerout',  () => logoutBtn.setStyle({ backgroundColor: '#220000' }));
	logoutBtn.on('pointerdown', () => {
	  this.scene.start('LoginScene');
	});
	
	// === MUZYKA + PRZYCISK WYCISZENIA ===

	// odblokuj AudioContext po pierwszym kliknięciu (wymóg przeglądarek)
	this.input.once('pointerdown', () => {
	  if (this.sound?.context?.state === 'suspended') {
		this.sound.context.resume();
	  }
	});

	// singleton – jeśli muzyka jeszcze nie gra, odpal ją raz
	if (!this.game.__bgm) {
	  this.game.__bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
	  this.game.__bgm.play();
	}
	this.bgm = this.game.__bgm;

	// stan ikony
	this._musicMuted = !!this.bgm.isPaused;

	// przycisk 🔊/🔇
	const btnSize = 40, pad = 20;
	this.muteBtn = this.add.text(
	  this.scale.width - btnSize - pad,
	  this.scale.height - btnSize - pad,
	  this._musicMuted ? '🔇' : '🔊',
	  { fontFamily: 'Monaco, monospace', fontSize: '28px', color: '#FFFFFF' }
	)
	.setInteractive({ cursor: 'pointer' })
	.setScrollFactor(0)
	.setDepth(2000);

	this.muteBtn.on('pointerdown', (pointer) => {
	  if (pointer?.event?.stopImmediatePropagation) pointer.event.stopImmediatePropagation();
	  if (pointer?.event?.stopPropagation) pointer.event.stopPropagation();

	  if (!this.bgm) return;
	  this._musicMuted = !this._musicMuted;
	  if (this._musicMuted) {
		this.bgm.pause();
		this.muteBtn.setText('🔇');
	  } else {
		this.bgm.resume();
		this.muteBtn.setText('🔊');
	  }
	});

	// aktualizacja pozycji przy zmianie rozmiaru
	this.scale.on('resize', (gameSize) => {
	  this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
	});

	// sprzątanie przy wyjściu ze sceny
	this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
	  this.muteBtn?.destroy();
	  this.muteBtn = null;
	});


	// aktualizacja pozycji przy zmianie rozmiaru
	this.scale.on('resize', (gameSize) => {
	  this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
	});


    // proste „przewijanie” kółkiem myszy, gdy dużo poziomów
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
  }
}
