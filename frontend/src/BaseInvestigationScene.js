// src/scenes/BaseInvestigationScene.js
import Phaser from 'phaser';
import './GameScene.css';

export default class BaseInvestigationScene extends Phaser.Scene {
  /**
   * @param {string} key  - nazwa sceny
   * @param {object} cfg  - konfiguracja sceny:
   *  {
   *    bgKey: string, bgSrc: string(import),
   *    title: string, intro: string,
   *    characters: Array<{ key:string, name?:string, text:string, avatar:{key:string, src?:string}|string, src?:string, x?:number, y?:number, scale?:number }>,
   *    items?: Array<{ key:string, name?:string, text?:string, avatar?:{key:string, src?:string}|string, src?:string, x?:number, y?:number, scale?:number }>,
   *    places?: Array<{ key:string, name?:string, text?:string, avatar?:{key:string, src?:string}|string, src?:string, x?:number, y?:number, scale?:number }>,
   *    positions?: Array<{x:number,y:number}>,
   *    itemPositions?: Array<{x:number,y:number}>,
   *    placePositions?: Array<{x:number,y:number}>,
   *    deduction?: { suspects?:string[], items?:string[], places?:string[] },
   *    onDeductionSubmit?: ({suspect,item,place}) => void
   *  }
   */
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
  }

  // ------------- ŁADOWANIE -------------
  preload() {
    // Tło
    this.load.image(this._cfg.bgKey, this._cfg.bgSrc);

    // Dźwięki
    if (!this.cache.audio.exists('click')) this.load.audio('click', 'assets/click.mp3');
    if (!this.cache.audio.exists('bgm')) this.load.audio('bgm', 'assets/ambient.mp3');

    // Postacie
    (this._cfg.characters || []).forEach(c => {
      if (c.src && !this.textures.exists(c.key)) this.load.image(c.key, c.src);
      const av = c.avatar;
      if (av && typeof av === 'object' && av.src && !this.textures.exists(av.key)) {
        this.load.image(av.key, av.src);
      }
    });

    // Przedmioty
    (this._cfg.items || []).forEach(it => {
      if (it.src && !this.textures.exists(it.key)) this.load.image(it.key, it.src);
      const av = it.avatar;
      if (av && typeof av === 'object' && av.src && !this.textures.exists(av.key)) {
        this.load.image(av.key, av.src);
      }
    });

    // Miejsca
    (this._cfg.places || []).forEach(pl => {
      if (pl.src && !this.textures.exists(pl.key)) this.load.image(pl.key, pl.src);
      const av = pl.avatar;
      if (av && typeof av === 'object' && av.src && !this.textures.exists(av.key)) {
        this.load.image(av.key, av.src);
      }
    });
  }

  // ------------- START SCENY -------------
  create() {
    // Poinformuj App/Sidebar
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: this.scene.key }));

    const { width, height } = this.sys.game.canvas;

    // Tło
    const bg = this.add.image(width / 2, height / 2, this._cfg.bgKey);
    const scale = Math.min(width / bg.width, height / bg.height) * 1.1;
    bg.setScale(scale).setOrigin(0.5, 0.5);

    // Klik
    const click = this.sound.add('click');
    this.input.on('pointerdown', () => click && click.play());

    // Postacie / Przedmioty / Miejsca + pozycje
    this.characters = this._cfg.characters || [];
    this.items = this._cfg.items || [];
    this.places = this._cfg.places || [];

    this.characterPositions = Array.isArray(this._cfg.positions)
      ? this._cfg.positions
      : this._autoPositions(this.characters.length);

    this.itemPositions = Array.isArray(this._cfg.itemPositions)
      ? this._cfg.itemPositions
      : this._autoPositionsSecondary(this.items.length);

    this.placePositions = Array.isArray(this._cfg.placePositions)
      ? this._cfg.placePositions
      : this._autoPositionsSecondary(this.places.length);

    // Listy dla tablicy dedukcji (z cfg lub automatycznie)
    this._dedLists = this._buildDeductionLists();

    // UI
    this.createDialogPanel();
    this.createDialogLog();
    this.createDeductionBoard(this._dedLists);
    this.createIntroOverlay(this._cfg.title || 'Scena', this._cfg.intro || '');

    // Timer HUD
    this.buildTimerHud();
    this.tweens.add({ targets: this.timerBg, alpha: { from: 0.9, to: 0.6 }, duration: 1600, yoyo: true, repeat: -1 });
    this.scale.on('resize', () => this.layoutTimer());
    this.layoutTimer();

    // Ukrywanie tablicy, gdy Sidebar otwarty
    this._onSidebarToggle = (e) => {
      const board = document.getElementById('deduction-board');
      if (!board) return;
      if (e.detail?.open) board.classList.add('hidden-by-sidebar');
      else board.classList.remove('hidden-by-sidebar');
    };
    window.addEventListener('sidebarToggle', this._onSidebarToggle);

    // --------- MUZYKA + MUTE ----------
    // Odblokuj AudioContext po 1. interakcji
    this.input.once('pointerdown', () => {
      if (this.sound?.context?.state === 'suspended') this.sound.context.resume();
    });

    // Singleton BGM (nie restartujemy między scenami)
    if (!this.game.__bgm) {
      this.game.__bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
      this.game.__bgm.play();
    }
    this.bgm = this.game.__bgm;

    // Ikona mute
    const btnSize = 40, pad = 20;
    this._musicMuted = !!this.bgm.isPaused;
    this.muteBtn = this.add.text(
      this.scale.width - btnSize - pad,
      this.scale.height - btnSize - pad,
      this._musicMuted ? '🔇' : '🔊',
      { fontFamily: 'Monaco, monospace', fontSize: '28px', color: '#FFFFFF' }
    )
      .setInteractive({ cursor: 'pointer' })
      .setScrollFactor(0)
      .setDepth(2000);

    // Klik mute – pause/resume
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

    this.scale.on('resize', (gameSize) => {
      this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
    });
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

    const btn = this.add.container(btnX, btnY).setDepth(2003).setScrollFactor(0);
    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x3e0f6f, 1);
    btnGfx.lineStyle(2, 0xb983ff, 1);
    btnGfx.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);
    btnGfx.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12);

    const btnTxt = this.add.text(0, 0, 'START', {
      fontFamily: 'Monaco, monospace', fontSize: '15px', color: '#FFFFFF'
    }).setOrigin(0.5);

    btn.add([btnGfx, btnTxt]);
    btn.setSize(btnW, btnH);
    btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerover', () => btnGfx.setAlpha(0.9));
    btn.on('pointerout', () => btnGfx.setAlpha(1));
    btn.on('pointerdown', () => {
      if (board) board.style.display = '';
      if (notes) notes.style.display = '';
      shade.destroy(); panelGfx.destroy(); title.destroy(); body.destroy(); btn.destroy();
      document.body.classList.remove('intro-active');

      this.isPlaying = true;
      this.startTime = this.time.now;

      this.spawnCharacters();
      this.spawnItems();
      this.spawnPlaces();

      this.layoutTimer();
    });
  }

  // ------------- DIALOG PANEL -------------
  createDialogPanel() {
    const { width, height } = this.sys.game.canvas;
    this.dialogPanel = this.add.rectangle(width / 1.85, height - 30, width * 0.8, 100, 0x000000, 0.8)
      .setStrokeStyle(2, 0xffffff).setOrigin(0.5, 1);
    this.dialogText = this.add.text(width * 0.2, height - 120, '', {
      fontSize: '20px', fill: '#ffffff', fontFamily: 'Monaco, monospace', wordWrap: { width: width * 0.6 },
    }).setOrigin(0, 0);
    this.avatarImage = this.add.circle(width * 0.09, height - 80, 120, 0xffffff);
    this.dialogPanel.visible = this.dialogText.visible = this.avatarImage.visible = false;
  }

  showDialog(text, avatarKey) {
    this.dialogPanel.visible = this.dialogText.visible = this.avatarImage.visible = true;
    this.dialogText.setText(text);
    if (this.avatarImage.avatarSprite) this.avatarImage.avatarSprite.destroy();
    if (avatarKey) {
      this.avatarImage.avatarSprite = this.add.sprite(this.avatarImage.x, this.avatarImage.y, avatarKey);
      this.avatarImage.avatarSprite.setScale(0.25).setOrigin(0.5, 0.5);
    }
  }

  // ------------- POSTACIE / PRZEDMIOTY / MIEJSCA -------------
  spawnCharacters() {
    this.characters.forEach((c, index) => {
      const spot = {
        x: (typeof c.x === 'number' ? c.x : (this.characterPositions[index]?.x ?? 0)),
        y: (typeof c.y === 'number' ? c.y : (this.characterPositions[index]?.y ?? 0)),
      };

      const s = this.add.sprite(spot.x, spot.y, c.key);
      s.setScale(typeof c.scale === 'number' ? c.scale : 1.1);
      s.setDepth(10).setInteractive();

      s.on('pointerdown', () => {
        this.showDialog(c.text, c.avatar?.key || c.avatar);
        if (!this.shownDialogs.has(c.key)) {
          this.shownDialogs.add(c.key);
          this.addDialogEntry(c.name || 'Postać', c.text, c.avatar?.key || c.avatar);
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
      if (it.src || this.textures.exists(it.key)) {
        go = this.add.sprite(spot.x, spot.y, it.key).setOrigin(0.5);
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

      go.on('pointerdown', () => {
        const avatarKey = it.avatar?.key || it.avatar;
        this.showDialog(it.text || it.name || '...', avatarKey);
        if (!this.shownDialogs.has(it.key)) {
          this.shownDialogs.add(it.key);
          this.addDialogEntry(it.name || 'Przedmiot', it.text || 'Oznaczono punkt zainteresowania.', avatarKey);
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
      if (pl.src || this.textures.exists(pl.key)) {
        go = this.add.sprite(spot.x, spot.y, pl.key).setOrigin(0.5);
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

      go.on('pointerdown', () => {
        const avatarKey = pl.avatar?.key || pl.avatar;
        this.showDialog(pl.text || pl.name || '...', avatarKey);
        if (!this.shownDialogs.has(pl.key)) {
          this.shownDialogs.add(pl.key);
          this.addDialogEntry(pl.name || 'Miejsce', pl.text || 'Oznaczono punkt zainteresowania.', avatarKey);
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
    let avatarDataUrl = '';
    try { avatarDataUrl = this.textures.getBase64(avatarKey); } catch (_) { avatarDataUrl = ''; }
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

    const suspects = d.suspects && d.suspects.length
      ? d.suspects.slice()
      : (this.characters || []).map(c => c.name || c.displayName || c.key).filter(Boolean);

    const places = d.places && d.places.length
      ? d.places.slice()
      : (this.places || []).map(p => p.name || p.label || p.key).filter(Boolean);

    const items = d.items && d.items.length
      ? d.items.slice()
      : (this.items || []).map(i => i.name || i.label || i.key).filter(Boolean);

    const fallback = (arr, fb) => (arr && arr.length ? arr : fb);
    return {
      suspects: fallback(suspects, ['Podejrzany A', 'Podejrzany B', 'Podejrzany C', 'Podejrzany D']),
      places:   fallback(places,   ['Miejsce 1', 'Miejsce 2', 'Miejsce 3', 'Miejsce 4']),
      items:    fallback(items,    ['Przedmiot 1', 'Przedmiot 2', 'Przedmiot 3', 'Przedmiot 4']),
    };
  }

  // ------------- TABLICA DEDUKCJI -------------
  createDeductionBoard(dedLists = { suspects: [], places: [], items: [] }) {
    if (document.getElementById('deduction-board')) return;

    const { suspects, places, items } = dedLists;

    this._dbState = { page: 0 };
    const wrap = document.createElement('div'); wrap.id = 'deduction-board';

    // Header
    const header = document.createElement('div'); header.id = 'deduction-header';
    const title = document.createElement('div'); title.textContent = 'Tablica dedukcji';
    const nav = document.createElement('div'); nav.className = 'db-nav';
    const prevBtn = document.createElement('button'); prevBtn.className = 'db-arrow'; prevBtn.textContent = '◀';
    const pageLabel = document.createElement('span'); pageLabel.id = 'deduction-page-label'; pageLabel.textContent = '1 / 3';
    const nextBtn = document.createElement('button'); nextBtn.className = 'db-arrow'; nextBtn.textContent = '▶';
    nav.appendChild(prevBtn); nav.appendChild(pageLabel); nav.appendChild(nextBtn);
    header.appendChild(title); header.appendChild(nav); wrap.appendChild(header);

    // Strony
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

    // Strona 1: Podejrzani × Miejsca
    const page0 = document.createElement('div'); page0.className = 'db-page active';
    const cont0 = document.createElement('div'); cont0.className = 'db2';
    cont0.appendChild(buildMatrix('Podejrzani × Miejsca', suspects, places));
    page0.appendChild(cont0);

    // Strona 2: Przedmioty × Miejsca
    const page1 = document.createElement('div'); page1.className = 'db-page';
    const cont1 = document.createElement('div'); cont1.className = 'db2';
    cont1.appendChild(buildMatrix('Przedmioty × Miejsca', items, places));
    page1.appendChild(cont1);

    // Strona 3: Odpowiedzi z datalist
    const page2 = document.createElement('div'); page2.className = 'db-page';
    const cont2 = document.createElement('div'); cont2.className = 'db2';
    const answerPanel = document.createElement('div'); answerPanel.id = 'deduction-answer';

    // datalists
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

    const finishBtn = document.createElement('button');
    finishBtn.id = 'deduction-finish-btn';
    finishBtn.textContent = 'Zakończ poziom';
    finishBtn.onclick = () => {
      const ans = {
        suspect: sRow.input.value.trim(),
        item:    iRow.input.value.trim(),
        place:   pRow.input.value.trim(),
      };
      if (typeof this._cfg.onDeductionSubmit === 'function') {
        try { this._cfg.onDeductionSubmit(ans); } catch (e) { console.warn(e); }
      } else {
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
    const cy = height * 0.70; // niżej niż postacie
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
  shutdown() {
    if (this._onSidebarToggle) {
      window.removeEventListener('sidebarToggle', this._onSidebarToggle);
      this._onSidebarToggle = null;
    }
    if (this._dbKeyHandler) {
      document.removeEventListener('keydown', this._dbKeyHandler);
      this._dbKeyHandler = null;
    }

    if (this.input) this.input.removeAllListeners();
    if (this.tweens) this.tweens.killAll();

    if (this.timerHud) { this.timerHud.destroy(true); this.timerHud = null; }
    this.timerBg = null; this.timerIcon = null; this.timerText = null;

    ['deduction-board', 'dialog-log'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    if (this.muteBtn) { this.muteBtn.destroy(); this.muteBtn = null; }
    this.bgm = null; // nie zatrzymujemy globalnego __bgm
  }

  destroy() { this.shutdown(); }
}
