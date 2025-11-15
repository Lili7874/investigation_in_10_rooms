// src/scenes/LegalScene.js
import Phaser from 'phaser';
import '../styles/LoginScene.css'; // użyjemy .form-container itd.
import { safeResume, bindVisibility, unbindVisibility } from '../lib/audioSafe';

/* =========================
   API base detection (jak w LoginScene, choć tu raczej nieużywane)
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
    ? 'https://investigation-in-10-rooms.onrender.com'
    : 'http://localhost:3001');

const API = String(RAW_API).replace(/\/+$/, '');

if (isBrowser) {
  console.log('[LegalScene] API_BASE =', API);
}

class LegalScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LegalScene' });
    this._onGlobalMuteChanged = null;
    this._onResizeMute = null;
    this.video = null;
    this.muteBtn = null;
  }

  preload() {
    this.load.video('bgVideo', 'assets/backgroundvideo.mp4', 'canplaythrough', false, true);
    if (!this.cache.audio.exists('click'))   this.load.audio('click',   'assets/click.mp3');
    if (!this.cache.audio.exists('error'))   this.load.audio('error',   'assets/error.mp3');
    if (!this.cache.audio.exists('ambient')) this.load.audio('ambient', 'assets/ambient.mp3');
  }

  create() {
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LegalScene' }));
    ['deduction-board', 'dialog-log', 'deduction-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    // wyłącz inne sceny poza tą
    if (this.scene?.manager) {
      this.scene.manager.scenes.forEach(s => {
        if (s?.sys?.settings?.key !== 'LegalScene') {
          try { this.scene.stop(s.sys.settings.key); } catch (_) {}
        }
      });
    }

    this.input.once('pointerdown', () => safeResume(this));
    bindVisibility(this, 'LegalScene');

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

    this.ambient = this.sound.add('ambient', { loop: true, volume: 0.3 });
    try { this.ambient.play(); } catch {}

    const sfx = (key, cfg) => { try { this.sound.play(key, cfg); } catch {} };
    this.input.on('pointerdown', () => sfx('click', { volume: 0.8, detune: 50 }));

    // === WIDEO TŁA – takie same ustawienia jak w RegisterScene (300x150, center) ===
    const { width, height } = this.sys.game.canvas;

    this.video = this.add.video(0, 0, 'bgVideo');
    try {
      this.video.setMute(true).setLoop(true).play(true);
    } catch {}

    this.video
      .setDepth(-1)
      .setDisplaySize(300, 150)
      .setOrigin(0.5)
      .setPosition(width / 2, height / 2);

    // === przycisk mute ===
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

    // resize: tylko mute – wideo zostaje w 300x150
    this._onResizeMute = (gameSize) => {
      const w = gameSize?.width ?? this.scale.width;
      const h = gameSize?.height ?? this.scale.height;
      this.muteBtn?.setPosition(w - btnSize - pad, h - btnSize - pad);
    };
    this.scale.on('resize', this._onResizeMute);

    // === PANEL REGULAMINU / POLITYKI ===
    const ui = document.getElementById('login-ui');
    if (ui) ui.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'form-container';
    Object.assign(container.style, {
      maxWidth: '720px',
      width: 'min(720px, 96vw)',
      background: 'rgba(20,0,40,0.92)',
      border: '2px solid #8e4dff',
      borderRadius: '18px',
      padding: '18px 20px 16px 20px',
      boxShadow: '0 0 24px rgba(0,0,0,0.6)',
    });

    const title = document.createElement('h1');
    title.innerText = 'Informacje prawne';
    title.style.marginBottom = '8px';

    const subtitle = document.createElement('div');
    subtitle.innerText = 'Regulamin gry i polityka prywatności';
    Object.assign(subtitle.style, {
      fontSize: '14px',
      marginBottom: '12px',
      opacity: '0.9',
      textAlign: 'center',
    });

    // zakładki
    const tabsRow = document.createElement('div');
    Object.assign(tabsRow.style, {
      display: 'flex',
      gap: '8px',
      marginBottom: '10px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    });

    const tabTerms = document.createElement('button');
    const tabPrivacy = document.createElement('button');
    [tabTerms, tabPrivacy].forEach(btn => {
      Object.assign(btn.style, {
        padding: '6px 14px',
        borderRadius: '999px',
        border: '1px solid transparent',
        background: 'rgba(255,255,255,0.06)',
        color: '#e9d1ff',
        cursor: 'pointer',
        fontFamily: 'Monaco, monospace',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        boxShadow: '0 0 8px rgba(185,131,255,0.35)',
      });
    });
    tabTerms.textContent = 'Regulamin';
    tabPrivacy.textContent = 'Polityka prywatności';

    // treść
    const content = document.createElement('div');
    Object.assign(content.style, {
      width: '100%',
      maxHeight: '280px',
      overflowY: 'auto',
      padding: '10px 4px 6px 4px',
      fontSize: '13px',
      lineHeight: '1.4',
      textAlign: 'left',
    });

    const termsHtml = `
      <h3>1. Postanowienia ogólne</h3>
      <p>Ta gra edukacyjno-detektywistyczna jest przeznaczona wyłącznie do celów rozrywkowych
      i szkoleniowych. Korzystając z gry, akceptujesz niniejszy regulamin.</p>

      <h3>2. Zasady korzystania</h3>
      <ul>
        <li>Nie udostępniaj swojego konta osobom trzecim.</li>
        <li>Nie próbuj ingerować w kod gry, omijać zabezpieczeń ani modyfikować jej działania.</li>
        <li>Twórca gry zastrzega sobie prawo do wprowadzania zmian w treści i zasadach rozgrywki.</li>
      </ul>

      <h3>3. Prawa autorskie</h3>
      <p>Wszystkie grafiki, teksty, dialogi, zagadki oraz elementy interfejsu stanowią własność
      autora gry i są chronione przepisami prawa autorskiego.</p>

      <h3>4. Odpowiedzialność</h3>
      <p>Twórca gry nie ponosi odpowiedzialności za szkody wynikłe z niewłaściwego korzystania z gry
      lub problemów technicznych niezależnych od niego.</p>
    `;

    const privacyHtml = `
      <h3>1. Administrator danych</h3>
      <p>Administratorem danych jest autor gry. Dane użytkowników są przetwarzane wyłącznie
      w celu obsługi konta, zapisów postępów oraz statystyk rozgrywki.</p>

      <h3>2. Jakie dane gromadzimy</h3>
      <ul>
        <li>Login / identyfikator gracza.</li>
        <li>Hasło (przechowywane w postaci zaszyfrowanej).</li>
        <li>Podstawowe dane o postępach w grze (zaliczone poziomy, czas przejścia).</li>
      </ul>

      <h3>3. Cel przetwarzania</h3>
      <p>Dane są wykorzystywane do:
      zapisu progresu, wyświetlania rankingów oraz umożliwienia logowania do gry.</p>

      <h3>4. Prawa użytkownika</h3>
      <ul>
        <li>Prawo do wglądu do swoich danych.</li>
        <li>Prawo do żądania usunięcia konta i powiązanych z nim danych.</li>
        <li>Prawo do zgłoszenia sprzeciwu wobec przetwarzania danych.</li>
      </ul>
    `;

    const setActiveTab = (which) => {
      if (which === 'terms') {
        tabTerms.style.background = 'linear-gradient(145deg, #9b5df7, #3e0f6f)';
        tabTerms.style.borderColor = '#b983ff';
        tabPrivacy.style.background = 'rgba(255,255,255,0.06)';
        tabPrivacy.style.borderColor = 'transparent';
        content.innerHTML = termsHtml;
      } else {
        tabPrivacy.style.background = 'linear-gradient(145deg, #9b5df7, #3e0f6f)';
        tabPrivacy.style.borderColor = '#b983ff';
        tabTerms.style.background = 'rgba(255,255,255,0.06)';
        tabTerms.style.borderColor = 'transparent';
        content.innerHTML = privacyHtml;
      }
    };

    tabTerms.onclick = () => {
      sfx('click', { volume: 0.8, detune: 50 });
      setActiveTab('terms');
    };
    tabPrivacy.onclick = () => {
      sfx('click', { volume: 0.8, detune: 50 });
      setActiveTab('privacy');
    };

    tabsRow.appendChild(tabTerms);
    tabsRow.appendChild(tabPrivacy);

    // domyślnie pokazujemy regulamin
    setActiveTab('terms');

    // przycisk powrotu
    const backBtn = document.createElement('button');
    backBtn.className = 'login-button';
    backBtn.innerText = 'Wróć';
    backBtn.style.marginTop = '16px';
    backBtn.onclick = () => {
      sfx('click', { volume: 0.8, detune: 50 });
      if (ui) ui.innerHTML = '';
      this.scene.start('LoginScene'); // albo 'RegisterScene', jeśli wolisz
      this.scene.stop('LegalScene');
    };

    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(tabsRow);
    container.appendChild(content);
    container.appendChild(backBtn);

    if (ui) ui.appendChild(container);

    // sprzątanie
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        if (this._onResizeMute) {
          this.scale.off('resize', this._onResizeMute);
          this._onResizeMute = null;
        }
        if (this._onGlobalMuteChanged) {
          this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
          this._onGlobalMuteChanged = null;
        }
        unbindVisibility('LegalScene');
        this.muteBtn?.destroy(); this.muteBtn = null;
        this.video?.stop(); this.video?.destroy(); this.video = null;
        if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
        this.sound.removeByKey && this.sound.removeByKey('ambient');

        const uiInner = document.getElementById('login-ui');
        if (uiInner) uiInner.innerHTML = '';
      } catch {}
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      try {
        if (this.ambient) {
          this.ambient.stop();
          this.ambient.destroy();
          this.ambient = null;
        }
      } catch {}
    });
  }
}

export default LegalScene;
