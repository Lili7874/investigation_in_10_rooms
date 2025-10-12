// src/scenes/BaseInvestigationScene.js
import Phaser from 'phaser';
import './GameScene.css';
import { safeResume, bindVisibility, unbindVisibility } from './audioSafe';

export default class BaseInvestigationScene extends Phaser.Scene {
  constructor(key, cfg) {
    super({ key });
    this._cfg = cfg;

    this.startTime = 0;
    this.timerText = null;

    this.characters = [];
    this.characterPositions = [];

    this.items = [];
    this.itemPositions = [];

    this.places = [];
    this.placePositions = [];

    this.dialogPanel = null;
    this.dialogText = null;
    this.avatarImage = null;

    this.shownDialogs = new Set();
    this.isPlaying = false;

    this._introUi = [];
    this._onResize = null;
    this._onResizeMute = null;
    this._onSidebarToggle = null;
    this._dbKeyHandler = null;

    this._dedInputs = null;

    // global mute (bez lokalnych visibility listenerów)
    this._onGlobalMuteChanged = null;
  }

  // === helpers: namespacing kluczy tekstur dla każdej sceny ===
  _texKey(key) { return `${this.scene.key}__${key}`; }
  _getAvatarBase64(key) {
    if (!key) return '';
    const ns = this._texKey(key);
    try { return this.textures.getBase64(ns); } catch (_) {}
    try { return this.textures.getBase64(key); } catch (_) {}
    return '';
  }

  // ——— twarde wyłączenie innych scen ———
  _enforceSingleActiveScene() {
    const mgr = this.scene.manager;
    const active = mgr.getScenes(true);
    active.forEach(sc => {
      if (sc !== this && sc.sys?.settings?.key !== this.scene.key) {
        try { mgr.stop(sc.sys.settings.key); } catch (_) {}
      }
    });
  }

  // ------------- ŁADOWANIE -------------
  preload() {
    // Tło (ładujemy pod namespaced kluczem, NIC nie usuwamy w preload)
    const bgNs = this._texKey(this._cfg.bgKey);
    if (!this.textures.exists(bgNs)) this.load.image(bgNs, this._cfg.bgSrc);

    if (!this.cache.audio.exists('click')) this.load.audio('click', 'assets/click.mp3');
    if (!this.cache.audio.exists('bgm'))   this.load.audio('bgm',   'assets/ambient.mp3');

    const loadIfNeeded = (key, src) => {
      if (!key || !src) return;
      const ns = this._texKey(key);
      if (!this.textures.exists(ns)) this.load.image(ns, src);
    };

    // Postacie + avatary
    (this._cfg.characters || []).forEach(c => {
      loadIfNeeded(c.key, c.src);
      const av = c.avatar;
      if (av && typeof av === 'object') loadIfNeeded(av.key, av.src);
    });

    // Przedmioty + avatary
    (this._cfg.items || []).forEach(it => {
      loadIfNeeded(it.key, it.src);
      const av = it.avatar;
      if (av && typeof av === 'object') loadIfNeeded(av.key, av.src);
    });

    // Miejsca + avatary
    (this._cfg.places || []).forEach(pl => {
      loadIfNeeded(pl.key, pl.src);
      const av = pl.avatar;
      if (av && typeof av === 'object') loadIfNeeded(av.key, av.src);
    });
  }

  // ------------- START SCENY -------------
  create() {
    this._enforceSingleActiveScene();
    this._purgeOrphanedUi();
    this._wireShutdownHooks();

    window.dispatchEvent(new CustomEvent('sceneChange', { detail: this.scene.key }));

    const { width, height } = this.sys.game.canvas;

    // Tło: używamy namespaced klucza
    const bg = this.add.image(width / 2, height / 2, this._texKey(this._cfg.bgKey));
    const scale = Math.min(width / bg.width, height / bg.height) * 1.1;
    bg.setScale(scale).setOrigin(0.5, 0.5);

    const click = this.sound.add('click');
    this.input.on('pointerdown', () => click && click.play());

    this.characters = this._cfg.characters || [];
    this.items = this._cfg.items || [];
    this.places = this._cfg.places || [];

    this.characterPositions = Array.isArray(this._cfg.positions)
      ? this._cfg.positions : this._autoPositions(this.characters.length);
    this.itemPositions = Array.isArray(this._cfg.itemPositions)
      ? this._cfg.itemPositions : this._autoPositionsSecondary(this.items.length);
    this.placePositions = Array.isArray(this._cfg.placePositions)
      ? this._cfg.placePositions : this._autoPositionsSecondary(this.places.length);

    this._dedLists = this._buildDeductionLists();
    this._notesLists = this._buildNotesLists();

    this.createDialogPanel();
    this.createDialogLog();
    this.createDeductionBoard(this._dedLists);
    this.createIntroOverlay(this._cfg.title || 'Scena', this._cfg.intro || '');

    this.buildTimerHud();
    this.tweens.add({ targets: this.timerBg, alpha: { from: 0.9, to: 0.6 }, duration: 1600, yoyo: true, repeat: -1 });

    this._onResize = () => this.layoutTimer();
    this.scale.on('resize', this._onResize);
    this.layoutTimer();

    this._onSidebarToggle = (e) => {
      const board = document.getElementById('deduction-board');
      if (!board) return;
      if (e.detail?.open) board.classList.add('hidden-by-sidebar');
      else board.classList.remove('hidden-by-sidebar');
    };
    window.addEventListener('sidebarToggle', this._onSidebarToggle);

    // odblokowanie AudioContext po 1. kliknięciu – bezpiecznie
    this.input.once('pointerdown', () => safeResume(this));

    // --- MUZYKA TŁA (singleton) ---
    if (!this.game.__bgm) {
      this.game.__bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
      this.game.__bgm.play();
    }
    this.bgm = this.game.__bgm;

    // --- GLOBAL MUTE: inicjalizacja i nasłuch ---
    const reg = this.game.registry;
    let gm = reg.get('globalMuted');
    if (gm == null) {
      gm = localStorage.getItem('globalMuted') === '1';
      reg.set('globalMuted', gm);
    }
    this.sound.mute = !!gm;

    this._onGlobalMuteChanged = (_parent, value) => {
      this.sound.mute = !!value;
      this.muteBtn?.setText(this.sound.mute ? '🔇' : '🔊');
    };
    reg.events.on('changedata-globalMuted', this._onGlobalMuteChanged);

    // wspólny handler widoczności (brak lokalnego listenera)
    bindVisibility(this, this.scene.key);

    // --- PRZYCISK MUTE oparty o globalny stan ---
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
      if (pointer?.event?.stopImmediatePropagation) pointer.event.stopImmediatePropagation();
      if (pointer?.event?.stopPropagation) pointer.event.stopPropagation();

      const newMuted = !this.sound.mute;
      this.sound.mute = newMuted;
      this.game.registry.set('globalMuted', newMuted);
      localStorage.setItem('globalMuted', newMuted ? '1' : '0');
      this.muteBtn.setText(newMuted ? '🔇' : '🔊');
    });

    this._onResizeMute = (gameSize) => {
      this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
    };
    this.scale.on('resize', this._onResizeMute);
  }

  // ------------- TIMER -------------
  buildTimerHud() {
    this.startTime = this.time.now;
    this.timerHud = this.add.container(0, 0).setDepth(1000).setScrollFactor(0);
    this.timerBg = this.add.graphics();
    this.timerIcon = this.add.text(0, 0, '⏱', { fontFamily: 'Monaco, monospace', fontSize: '22px', color: '#FFFFFF' });
    this.timerText = this.add.text(0, 0, 'Czas: 00:00', { fontFamily: 'Monaco, monospace', fontSize: '22px', color: '#FFFFFF' })
      .setShadow(0, 0, '#b983ff', 12, true, true);
    this.timerHud.add(this.timerBg);
    this.timerHud.add(this.timerIcon);
    this.timerHud.add(this.timerText);
  }

  layoutTimer() {
    const { width: sw } = this.scale;
    const margin = 20, padX = 14, padY = 8, gap = 8, radius = 14;
    this.timerIcon.setPosition(0, 0);
    this.timerText.setPosition(this.timerIcon.width + gap, 0);

    const innerW = this.timerIcon.width + gap + this.timerText.width;
    const innerH = Math.max(this.timerIcon.height, this.timerText.height);
    const bgW = innerW + padX * 2, bgH = innerH + padY * 2;

    this.timerBg.clear();
    this.timerBg.fillStyle(0x000000, 0.55);
    this.timerBg.lineStyle(2, 0x8e4dff, 0.9);
    this.timerBg.fillRoundedRect(0, 0, bgW, bgH, radius);
    this.timerBg.strokeRoundedRect(0, 0, bgW, bgH, radius);

    this.timerIcon.x = padX;
    this.timerIcon.y = padY + (bgH - 2 * padY - this.timerIcon.height) / 2;
    this.timerText.x = this.timerIcon.x + this.timerIcon.width + gap;
    this.timerText.y = padY + (bgH - 2 * padY - this.timerText.height) / 2;

    this.timerHud.x = sw - margin - bgW;
    this.timerHud.y = margin;
  }

  update() {
    if (!this.isPlaying) return;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    this.timerText.setText(`Czas: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    this.layoutTimer();
  }

  // ------------- INTRO -------------
  createIntroOverlay(titleText, introText) {
    const board = document.getElementById('deduction-board');
    if (board) board.style.display = 'none';
    const notes = document.getElementById('dialog-log');
    if (notes) notes.style.display = 'none';

    const { width, height } = this.scale;
    document.body.classList.add('intro-active');

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(2000);

    const panelW = Math.min(1200, width * 0.9);
    const panelH = Math.min(560, height * 0.85);

    const panelGfx = this.add.graphics().setDepth(2001).setScrollFactor(0);
    panelGfx.fillStyle(0x120022, 0.95);
    panelGfx.lineStyle(2, 0x8e4dff, 1);
    panelGfx.fillRoundedRect((width - panelW) / 2, (height - panelH) / 2, panelW, panelH, 18);
    panelGfx.strokeRoundedRect((width - panelW) / 2, (height - panelH) / 2, panelW, panelH, 18);

    const title = this.add.text(width / 2, (height - panelH) / 2 + 22, titleText, {
      fontFamily: 'Monaco, monospace', fontSize: '20px', color: '#FFFFFF'
    }).setOrigin(0.5, 0).setDepth(2002).setScrollFactor(0);

    const body = this.add.text((width - panelW) / 2 + 24, title.y + 35, introText, {
      fontFamily: 'Monaco, monospace', fontSize: '14px', color: '#FFFFFF',
      wordWrap: { width: panelW - 35 }, lineSpacing: 3
    }).setDepth(2002).setScrollFactor(0);

    const btnW = 200, btnH = 48;
    const btnX = width / 2, btnY = (height + panelH) / 2 - 40;

    // === PRZYCISK START z pełną strefą kliknięcia ===
    const btn = this.add.container(btnX, btnY).setDepth(2003).setScrollFactor(0);
    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x3e0f6f, 1);
    btnGfx.lineStyle(2, 0xb983ff, 1);
    btnGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);
    btnGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);

    const btnTxt = this.add.text(0, 0, 'START', {
      fontFamily: 'Monaco, monospace', fontSize: '15px', color: '#FFFFFF'
    }).setOrigin(0.5);

    // pełne hit-area
    const hit = this.add.zone(0, 0, btnW, btnH).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    btn.add([btnGfx, btnTxt, hit]);
    btn.setSize(btnW, btnH);

    hit.on('pointerover', () => btnGfx.setAlpha(0.9));
    hit.on('pointerout',  () => btnGfx.setAlpha(1));
    hit.on('pointerdown', (pointer) => {
      pointer?.event?.stopImmediatePropagation?.();
      pointer?.event?.stopPropagation?.();

      const board = document.getElementById('deduction-board');
      const notes = document.getElementById('dialog-log');
      if (board) board.style.display = '';
      if (notes) notes.style.display = '';
      this._clearIntroUi();
      document.body.classList.remove('intro-active');

      this.isPlaying = true;
      this.startTime = this.time.now;

      this.spawnCharacters();
      this.spawnItems();
      this.spawnPlaces();

      this.layoutTimer();
    });

    this._introUi.push(shade, panelGfx, title, body, btn, btnGfx, btnTxt, hit);
  }

  // ------------- DIALOG PANEL -------------
  createDialogPanel() {
    const { width, height } = this.sys.game.canvas;
    this.dialogPanel = this.add.rectangle(width / 1.85, height - 30, width * 0.8, 100, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff).setOrigin(0.5, 1);
    this.dialogText = this.add.text(width * 0.2, height - 120, '', {
      fontSize: '20px', fill: '#ffffff', fontFamily: 'Monaco, monospace', wordWrap: { width: width * 0.7 },
    }).setOrigin(0, 0);
    this.avatarImage = this.add.circle(width * 0.09, height - 80, 120, 0xffffff);
    this.dialogPanel.visible = this.dialogText.visible = this.avatarImage.visible = false;
  }

  showDialog(text, avatarKey) {
    this.dialogPanel.visible = this.dialogText.visible = this.avatarImage.visible = true;
    this.dialogText.setText(text);
    if (this.avatarImage.avatarSprite) this.avatarImage.avatarSprite.destroy();
    if (avatarKey) {
      const ns = this._texKey(avatarKey);
      this.avatarImage.avatarSprite = this.add.sprite(this.avatarImage.x, this.avatarImage.y, ns);
      this.avatarImage.avatarSprite.setScale(0.25).setOrigin(0.5, 0.5);
    }
  }

  // ------------- POSTACIE / PRZEDMIOTY / MIEJSCA -------------
  _nameForCharacter(index, c) {
    return this._notesLists?.characters?.[index]
        || c.name || c.displayName
        || this._dedLists?.suspects?.[index]
        || c.key || 'Postać';
  }
  _nameForItem(index, it) {
    return this._notesLists?.items?.[index]
        || it.name || it.displayName
        || this._dedLists?.items?.[index]
        || it.key || 'Przedmiot';
  }
  _nameForPlace(index, pl) {
    return this._notesLists?.places?.[index]
        || pl.name || pl.displayName
        || this._dedLists?.places?.[index]
        || pl.key || 'Miejsce';
  }

  spawnCharacters() {
    this.characters.forEach((c, index) => {
      const spot = {
        x: (typeof c.x === 'number' ? c.x : (this.characterPositions[index]?.x ?? 0)),
        y: (typeof c.y === 'number' ? c.y : (this.characterPositions[index]?.y ?? 0)),
      };

      const s = this.add.sprite(spot.x, spot.y, this._texKey(c.key));
      s.setScale(typeof c.scale === 'number' ? c.scale : 1.1);
      s.setDepth(10).setInteractive();

      const displayName = this._nameForCharacter(index, c);

      s.on('pointerdown', () => {
        this.showDialog(c.text, c.avatar?.key || c.avatar);
        if (!this.shownDialogs.has(c.key)) {
          this.shownDialogs.add(c.key);
          this.addDialogEntry(displayName, c.text, c.avatar?.key || c.avatar);
        }
      });
    });
  }

  spawnItems() {
    this.items.forEach((it, index) => {
      const spot = {
        x: (typeof it.x === 'number' ? it.x : (this.itemPositions[index]?.x ?? 0)),
        y: (typeof it.y === 'number' ? it.y : (this.itemPositions[index]?.y ?? 0)),
      };

      let go;
      if (it.src || this.textures.exists(this._texKey(it.key))) {
        go = this.add.sprite(spot.x, spot.y, this._texKey(it.key)).setOrigin(0.5);
        go.setScale(typeof it.scale === 'number' ? it.scale : 1.0);
      } else {
        const r = it.radius || 14;
        const circle = this.add.circle(spot.x, spot.y, r, 0xffcc00, 0.9).setStrokeStyle(2, 0x000000, 0.9);
        const lbl = this.add.text(spot.x, spot.y - (r + 18), it.label || (it.name || 'Znacznik'), {
          fontFamily: 'Monaco, monospace', fontSize: '12px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5, 1);
        this.tweens.add({ targets: circle, alpha: { from: 1, to: 0.4 }, yoyo: true, repeat: -1, duration: 900 });
        go = this.add.container(0, 0, [circle, lbl]);
        go.setSize(Math.max(40, r * 2 + 8), Math.max(40, r * 2 + 8)).setPosition(spot.x, spot.y);
      }

      go.setDepth(5).setInteractive({ cursor: 'pointer' });

      const displayName = this._nameForItem(index, it);

      go.on('pointerdown', () => {
        const avatarKey = it.avatar?.key || it.avatar;
        this.showDialog(it.text || it.name || '...', avatarKey);
        if (!this.shownDialogs.has(it.key)) {
          this.shownDialogs.add(it.key);
          this.addDialogEntry(displayName, it.text || 'Oznaczono punkt zainteresowania.', avatarKey);
        }
      });
    });
  }

  spawnPlaces() {
    this.places.forEach((pl, index) => {
      const spot = {
        x: (typeof pl.x === 'number' ? pl.x : (this.placePositions[index]?.x ?? 0)),
        y: (typeof pl.y === 'number' ? pl.y : (this.placePositions[index]?.y ?? 0)),
      };

      let go;
      if (pl.src || this.textures.exists(this._texKey(pl.key))) {
        go = this.add.sprite(spot.x, spot.y, this._texKey(pl.key)).setOrigin(0.5);
        go.setScale(typeof pl.scale === 'number' ? pl.scale : 1.0);
      } else {
        const r = pl.radius || 14;
        const circle = this.add.circle(spot.x, spot.y, r, 0x00d1ff, 0.9).setStrokeStyle(2, 0x000000, 0.9);
        const lbl = this.add.text(spot.x, spot.y - (r + 18), pl.label || (pl.name || 'Miejsce'), {
          fontFamily: 'Monaco, monospace', fontSize: '12px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5, 1);
        this.tweens.add({ targets: circle, alpha: { from: 1, to: 0.4 }, yoyo: true, repeat: -1, duration: 900 });
        go = this.add.container(0, 0, [circle, lbl]);
        go.setSize(Math.max(40, r * 2 + 8), Math.max(40, r * 2 + 8)).setPosition(spot.x, spot.y);
      }

      go.setDepth(5).setInteractive({ cursor: 'pointer' });

      const displayName = this._nameForPlace(index, pl);

      go.on('pointerdown', () => {
        const avatarKey = pl.avatar?.key || pl.avatar;
        this.showDialog(pl.text || pl.name || '...', avatarKey);
        if (!this.shownDialogs.has(pl.key)) {
          this.shownDialogs.add(pl.key);
          this.addDialogEntry(displayName, pl.text || 'Oznaczono punkt zainteresowania.', avatarKey);
        }
      });
    });
  }

  // ------------- NOTATKI -------------
  createDialogLog() {
    if (document.getElementById('dialog-log')) return;
    const container = document.createElement('div'); container.id = 'dialog-log';
    const header = document.createElement('div'); header.id = 'dialog-log-header'; header.innerHTML = `<span>Notatki</span>`;
    const list = document.createElement('div'); list.id = 'dialog-log-list';
    container.appendChild(header); container.appendChild(list); document.body.appendChild(container);
  }

  addDialogEntry(name, text, avatarKey) {
    let avatarDataUrl = this._getAvatarBase64(avatarKey);
    const list = document.getElementById('dialog-log-list'); if (!list) return;

    const entry = document.createElement('div'); entry.className = 'dialog-entry';
    const img = document.createElement('img'); if (avatarDataUrl) img.src = avatarDataUrl;
    const right = document.createElement('div');
    const meta = document.createElement('div'); meta.className = 'meta';
    const nameEl = document.createElement('span'); nameEl.className = 'name'; nameEl.textContent = name || 'Postać';
    const timeEl = document.createElement('span'); timeEl.className = 'time'; timeEl.textContent = new Date().toLocaleTimeString();
    meta.appendChild(nameEl); meta.appendChild(timeEl);
    const textEl = document.createElement('div'); textEl.className = 'text';
    textEl.style.whiteSpace = 'normal'; textEl.style.wordBreak = 'break-word'; textEl.textContent = text;
    right.appendChild(meta); right.appendChild(textEl);
    entry.appendChild(img); entry.appendChild(right);
    list.prepend(entry);
  }

  // ------------- LISTY DEDUKCJI -------------
  _buildDeductionLists() {
    const d = this._cfg.deduction || {};

    const suspects = d.suspects?.length
      ? d.suspects.slice()
      : (this.characters || []).map(c => c.name || c.displayName || c.key).filter(Boolean);

    const places = d.places?.length
      ? d.places.slice()
      : (this.places || []).map(p => p.name || p.label || p.key).filter(Boolean);

    const items = d.items?.length
      ? d.items.slice()
      : (this.items || []).map(i => i.name || i.label || i.key).filter(Boolean);

    const fb = (arr, def) => (arr && arr.length ? arr : def);
    return {
      suspects: fb(suspects, ['Podejrzany A', 'Podejrzany B', 'Podejrzany C', 'Podejrzany D']),
      places:   fb(places,   ['Miejsce 1', 'Miejsce 2', 'Miejsce 3', 'Miejsce 4']),
      items:    fb(items,    ['Przedmiot 1', 'Przedmiot 2', 'Przedmiot 3', 'Przedmiot 4']),
    };
  }

  // ------------- NOTATNIK -------------
  _buildNotesLists() {
    const n = this._cfg.notes || {};
    const pick = (arr, fb) => (Array.isArray(arr) && arr.length ? arr.slice() : fb || []);
    return {
      characters: pick(n.characters, this._dedLists?.suspects),
      items:      pick(n.items,      this._dedLists?.items),
      places:     pick(n.places,     this._dedLists?.places),
    };
  }

  // ------------- TABLICA DEDUKCJI -------------
  createDeductionBoard(dedLists = { suspects: [], places: [], items: [] }) {
    if (document.getElementById('deduction-board')) return;

    const { suspects, places, items } = dedLists;

    this._dbState = { page: 0 };
    const wrap = document.createElement('div'); wrap.id = 'deduction-board';

    const header = document.createElement('div'); header.id = 'deduction-header';
    const title = document.createElement('div'); title.textContent = 'Tablica dedukcji';
    const nav = document.createElement('div'); nav.className = 'db-nav';
    const prevBtn = document.createElement('button'); prevBtn.className = 'db-arrow'; prevBtn.textContent = '◀';
    const pageLabel = document.createElement('span'); pageLabel.id = 'deduction-page-label'; pageLabel.textContent = '1 / 3';
    const nextBtn = document.createElement('button'); nextBtn.className = 'db-arrow'; nextBtn.textContent = '▶';
    nav.appendChild(prevBtn); nav.appendChild(pageLabel); nav.appendChild(nextBtn);
    header.appendChild(title); header.appendChild(nav); wrap.appendChild(header);

    const pages = document.createElement('div'); pages.className = 'db-pages'; wrap.appendChild(pages);

    const buildMatrix = (mTitle, rows, cols) => {
      const CELL = 45;
      const section = document.createElement('div'); section.className = 'db2-section';
      const ttl = document.createElement('div'); ttl.className = 'db2-title'; ttl.textContent = mTitle; section.appendChild(ttl);
      const grid = document.createElement('div'); grid.className = 'db2-grid';
      grid.style.gridTemplateColumns = `140px repeat(${cols.length}, ${CELL}px)`; section.appendChild(grid);

      const corner = document.createElement('div'); corner.className = 'corner'; grid.appendChild(corner);
      cols.forEach(name => {
        const head = document.createElement('div'); head.className = 'col-header'; head.textContent = name; head.title = name;
        grid.appendChild(head);
      });

      rows.forEach(rName => {
        const lab = document.createElement('div'); lab.className = 'label'; lab.textContent = rName;
        grid.appendChild(lab);
        cols.forEach(() => {
          const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.state = '0';
          cell.addEventListener('click', () => this._cycleCell(cell));
          grid.appendChild(cell);
        });
      });

      return section;
    };

    const page0 = document.createElement('div'); page0.className = 'db-page active';
    const cont0 = document.createElement('div'); cont0.className = 'db2';
    cont0.appendChild(buildMatrix('Podejrzani × Miejsca', suspects, places));
    page0.appendChild(cont0);

    const page1 = document.createElement('div'); page1.className = 'db-page';
    const cont1 = document.createElement('div'); cont1.className = 'db2';
    cont1.appendChild(buildMatrix('Przedmioty × Miejsca', items, places));
    page1.appendChild(cont1);

    const page2 = document.createElement('div'); page2.className = 'db-page';
    const cont2 = document.createElement('div'); cont2.className = 'db2';
    const answerPanel = document.createElement('div'); answerPanel.id = 'deduction-answer';

    const dlSus = document.createElement('datalist'); dlSus.id = 'dl-suspects';
    suspects.forEach(s => { const o = document.createElement('option'); o.value = s; dlSus.appendChild(o); });
    const dlItm = document.createElement('datalist'); dlItm.id = 'dl-items';
    items.forEach(s => { const o = document.createElement('option'); o.value = s; dlItm.appendChild(o); });
    const dlPlc = document.createElement('datalist'); dlPlc.id = 'dl-places';
    places.forEach(s => { const o = document.createElement('option'); o.value = s; dlPlc.appendChild(o); });

    const mk = (labelText, placeholder, listId) => {
      const w = document.createElement('div'); w.className = 'answer-row';
      const l = document.createElement('label'); l.textContent = labelText;
      const i = document.createElement('input'); i.type = 'text'; i.placeholder = placeholder; i.setAttribute('list', listId);
      w.appendChild(l); w.appendChild(i); return { wrap: w, input: i };
    };

    const sRow = mk('Kto?',   'Wpisz podejrzanego...', 'dl-suspects');
    const iRow = mk('Czym?',  'Wpisz przedmiot...',    'dl-items');
    const pRow = mk('Gdzie?', 'Wpisz miejsce...',      'dl-places');

    this._dedInputs = { s: sRow.input, i: iRow.input, p: pRow.input };

    const finishBtn = document.createElement('button');
    finishBtn.id = 'deduction-finish-btn';
    finishBtn.textContent = 'Zakończ poziom';
    finishBtn.onclick = () => {
      const ans = {
        suspect: sRow.input.value.trim(),
        item:    iRow.input.value.trim(),
        place:   pRow.input.value.trim(),
      };
      const check = this._checkDeduction(ans);
      if (check.hasSolution) {
        this._showDeductionResult(check, ans);
      }
      if (typeof this._cfg.onDeductionSubmit === 'function') {
        try { this._cfg.onDeductionSubmit({ ...ans, result: check }); } catch (e) { console.warn(e); }
      } else if (!check.hasSolution) {
        console.log('Odpowiedź gracza:', ans);
      }
    };

    [sRow.wrap, iRow.wrap, pRow.wrap, finishBtn, dlSus, dlItm, dlPlc].forEach(n => answerPanel.appendChild(n));
    cont2.appendChild(answerPanel); page2.appendChild(cont2);

    pages.appendChild(page0); pages.appendChild(page1); pages.appendChild(page2);
    document.body.appendChild(wrap);

    const showPage = (idx) => {
      const total = 3;
      this._dbState.page = (idx + total) % total;
      page0.classList.toggle('active', this._dbState.page === 0);
      page1.classList.toggle('active', this._dbState.page === 1);
      page2.classList.toggle('active', this._dbState.page === 2);
      pageLabel.textContent = `${this._dbState.page + 1} / ${total}`;
    };
    prevBtn.addEventListener('click', () => showPage(this._dbState.page - 1));
    nextBtn.addEventListener('click', () => showPage(this._dbState.page + 1));

    this._dbKeyHandler = (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowLeft') showPage(this._dbState.page - 1);
      if (e.key === 'ArrowRight') showPage(this._dbState.page + 1);
    };
    document.addEventListener('keydown', this._dbKeyHandler);
  }

  _cycleCell(cell) {
    const states = ['', '✓', '✗', '?'];
    let s = parseInt(cell.dataset.state || '0', 10);
    s = (s + 1) % 4;
    cell.dataset.state = String(s);
    cell.textContent = states[s];
  }

  // ====== UNIWERALNY CHECKER ======
  _normalize(str) {
    if (!str) return '';
    const s = String(str).trim().toLowerCase();
    return this._stripDiacritics(s).replace(/\s+/g, ' ');
  }
  _stripDiacritics(s) {
    const map = { ą:'a', ć:'c', ę:'e', ł:'l', ń:'n', ó:'o', ś:'s', ż:'z', ź:'z' };
    return s.replace(/[ąćęłńóśżź]/g, ch => map[ch] || ch)
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  _findByKey(list, key) {
    if (!Array.isArray(list) || !key) return null;
    return list.find(x => x && x.key === key) || null;
  }
  _solutionSet(kind) {
    const sol = this._cfg.solution || {};
    const out = new Set();
    const push = (txt) => { if (txt) out.add(this._normalize(txt)); };

    const kindKey   = sol[`${kind}Key`];
    const kindName  = sol[`${kind}Name`];
    const kindAny   = sol[kind];
    const aliases   = (sol.aliases && sol.aliases[kind]) || [];

    let obj = null;
    if (kind === 'suspect') obj = this._findByKey(this._cfg.characters, kindKey);
    if (kind === 'item')    obj = this._findByKey(this._cfg.items,     kindKey);
    if (kind === 'place')   obj = this._findByKey(this._cfg.places,    kindKey);

    if (obj) {
      push(obj.name || obj.label || obj.key);
      push(obj.key);
      const nm = this._normalize(obj.name || obj.label || '');
      const short = nm.split(/\s+/)[0];
      if (short && short.length >= 4) out.add(short);
    }
    push(kindName);
    push(kindAny);
    aliases.forEach(a => push(a));

    return out;
  }
  _matches(choice, set) {
    const c = this._normalize(choice);
    if (!c) return false;
    if (set.has(c)) return true;

    if (c.length >= 4) {
      for (const t of set) {
        if (t.includes(c) || c.includes(t)) return true;
      }
    }
    return false;
  }
  _checkDeduction(ans) {
    if (!this._cfg.solution) {
      return { hasSolution: false, okAll: false, details: { suspect:false, item:false, place:false } };
    }
    const sSet = this._solutionSet('suspect');
    const iSet = this._solutionSet('item');
    const pSet = this._solutionSet('place');

    const res = {
      hasSolution: true,
      details: {
        suspect: this._matches(ans.suspect, sSet),
        item:    this._matches(ans.item,    iSet),
        place:   this._matches(ans.place,   pSet),
      }
    };
    res.okAll = res.details.suspect && res.details.item && res.details.place;
    return res;
  }

  // ====== PRZYCISK „NASTĘPNY POZIOM” W MODALU ======
  _resolveLevelOrder() {
    const reg = this.game?.registry?.get('levelOrder');
    if (Array.isArray(reg) && reg.length) return reg.slice();
    const cfg = this.game?.config;
    if (cfg && Array.isArray(cfg.levelOrder) && cfg.levelOrder.length) return cfg.levelOrder.slice();
    if (Array.isArray(window.__LEVEL_ORDER__) && window.__LEVEL_ORDER__.length) return window.__LEVEL_ORDER__.slice();
    const mgr = this.scene.manager;
    const keys = Object.keys(mgr.keys || {});
    return keys.filter(k => /^Level/i.test(k));
  }
  _getNextLevelKey() {
    const order = this._resolveLevelOrder();
    const idx = order.indexOf(this.scene.key);
    if (idx === -1) return null;
    return order[idx + 1] || null;
  }
  _switchToScene(key) {
    if (!key) return;
    const mgr = this.scene.manager;
    try { mgr.stop(this.scene.key); } catch (_) {}
    try { mgr.start(key); } catch (e) { console.warn('Nie mogę uruchomić sceny:', key, e); }
  }

  _showDeductionResult(result, ans) {
    const old = document.getElementById('deduction-result');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'deduction-result';
    Object.assign(wrap.style, {
      position:'fixed', inset:'0', background:'rgba(0,0,0,.55)', zIndex: 99999,
      display:'flex', alignItems:'center', justifyContent:'center'
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width:'min(560px, 92vw)', background:'#140024', color:'#fff',
      border:'1px solid #8e4dff', borderRadius:'14px', padding:'18px 20px',
      fontFamily:'Monaco, monospace', boxShadow:'0 10px 30px rgba(0,0,0,.35)'
    });

    const h = document.createElement('div');
    h.textContent = result.okAll ? '✅ Dobrze dedukujesz!' : '❌ Coś się nie zgadza';
    Object.assign(h.style, { fontSize:'18px', marginBottom:'10px' });

    const mkRow = (label, ok, val) => {
      const r = document.createElement('div');
      r.innerHTML = `${ok ? '✅' : '❌'} <b>${label}:</b> ${val || '—'}`;
      r.style.margin = '4px 0';
      return r;
    };

    const rows = document.createElement('div');
    rows.appendChild(mkRow('Podejrzany', result.details.suspect, ans.suspect));
    rows.appendChild(mkRow('Przedmiot',  result.details.item,    ans.item));
    rows.appendChild(mkRow('Miejsce',    result.details.place,   ans.place));

    const btns = document.createElement('div');
    btns.style.marginTop = '16px';
    btns.style.display = 'flex';
    btns.style.gap = '10px';

    const close = document.createElement('button');
    close.textContent = result.okAll ? 'OK' : 'Spróbuj ponownie';
    Object.assign(close.style, {
      padding:'10px 16px', borderRadius:'10px', border:'1px solid #b983ff',
      background:'#3e0f6f', color:'#fff', cursor:'pointer'
    });
    close.onclick = () => {
      wrap.remove();
      if (result.okAll) this.events.emit('level:solved', { scene: this.scene.key });
    };
    btns.appendChild(close);

    if (result.okAll) {
      const nextKey = this._getNextLevelKey();
      if (nextKey) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Następny poziom ▶';
        Object.assign(nextBtn.style, {
          padding:'10px 16px', borderRadius:'10px', border:'1px solid #7cff8e',
          background:'#0f6f3e', color:'#fff', cursor:'pointer'
        });
        nextBtn.onclick = () => {
          wrap.remove();
          this._switchToScene(nextKey);
        };
        btns.appendChild(nextBtn);
      } else {
        const mgr = this.scene.manager;
        if (mgr.keys && mgr.keys['LevelSelect']) {
          const backBtn = document.createElement('button');
          backBtn.textContent = 'Wróć do wyboru';
          Object.assign(backBtn.style, {
            padding:'10px 16px', borderRadius:'10px', border:'1px solid #b983ff',
            background:'#242424', color:'#fff', cursor:'pointer'
          });
          backBtn.onclick = () => {
            wrap.remove();
            this._switchToScene('LevelSelect');
          };
          btns.appendChild(backBtn);
        }
      }
    }

    panel.appendChild(h);
    panel.appendChild(rows);
    panel.appendChild(btns);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);
  }

  // ------------- AUTO-POZYCJE -------------
  _autoPositions(count) {
    const { width, height } = this.scale;
    const cx = width * 0.5;
    const cy = height * 0.58;
    const rx = Math.min(width, 1200) * 0.18;
    const ry = Math.min(height, 900) * 0.12;

    const positions = [];
    const start = -Math.PI * 0.12;
    const end = Math.PI * 0.12;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const angle = start + (end - start) * t;
      positions.push({
        x: cx + Math.cos(angle) * (rx + (i % 2 ? 0 : 14)),
        y: cy + Math.sin(angle) * (ry + (i % 2 ? 0 : 10)),
      });
    }
    return positions;
  }

  _autoPositionsSecondary(count) {
    const { width, height } = this.scale;
    const cx = width * 0.5;
    const cy = height * 0.70;
    const rx = Math.min(width, 1200) * 0.22;
    const ry = Math.min(height, 900) * 0.10;

    const positions = [];
    const start = -Math.PI * 0.08;
    const end = Math.PI * 0.08;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      const angle = start + (end - start) * t;
      positions.push({
        x: cx + Math.cos(angle) * (rx + (i % 2 ? 0 : 10)),
        y: cy + Math.sin(angle) * (ry + (i % 2 ? 0 : 8)),
      });
    }
    return positions;
  }

  // ------------- SPRZĄTANIE -------------
  _purgeOrphanedUi() {
    ['deduction-board', 'dialog-log', 'deduction-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    document.body.classList.remove('intro-active');
  }

  _clearIntroUi() {
    if (this._introUi && this._introUi.length) {
      this._introUi.forEach(go => { try { go?.destroy?.(); } catch (_) {} });
      this._introUi.length = 0;
    }
  }

  _wireShutdownHooks() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY,  this.shutdown, this);
  }

  _removeSceneTextures() {
    const tm = this.textures;
    const prefix = `${this.scene.key}__`;
    Object.keys(tm.list).forEach(k => {
      if (k.startsWith(prefix)) {
        try { tm.remove(k); } catch (_) {}
      }
    });
  }

  shutdown() {
    if (this._onSidebarToggle) { window.removeEventListener('sidebarToggle', this._onSidebarToggle); this._onSidebarToggle = null; }
    if (this._dbKeyHandler)    { document.removeEventListener('keydown', this._dbKeyHandler); this._dbKeyHandler = null; }
    if (this._onResize)        { this.scale.off('resize', this._onResize); this._onResize = null; }
    if (this._onResizeMute)    { this.scale.off('resize', this._onResizeMute); this._onResizeMute = null; }

    // zdejmij nasłuch globalMute
    if (this._onGlobalMuteChanged) {
      this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
      this._onGlobalMuteChanged = null;
    }

    // zdejmij wspólny handler visibility dla tej sceny
    unbindVisibility(this.scene.key);

    this._clearIntroUi();
    document.body.classList.remove('intro-active');

    if (this.input) this.input.removeAllListeners();
    if (this.tweens) this.tweens.killAll();
    if (this.time)   this.time.removeAllEvents();

    if (this.timerHud) { this.timerHud.destroy(true); this.timerHud = null; }
    this.timerBg = null; this.timerIcon = null; this.timerText = null;

    ['deduction-board', 'dialog-log', 'deduction-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    if (this.sound && Array.isArray(this.sound.sounds)) {
      this.sound.sounds.forEach(s => {
        if (s && s !== this.game.__bgm) {
          try { s.stop(); s.destroy(); } catch (_) {}
        }
      });
    }

    if (this.muteBtn) { this.muteBtn.destroy(); this.muteBtn = null; }
    this.bgm = null;

    this.isPlaying = false;
    if (this.shownDialogs) this.shownDialogs.clear();
    this._dedInputs = null;

    // usuń tylko tekstury tej sceny (po zniszczeniu obiektów)
    this._removeSceneTextures();
  }

  destroy() { this.shutdown(); }
}
