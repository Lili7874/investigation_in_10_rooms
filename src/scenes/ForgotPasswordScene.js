// src/scenes/ForgotPasswordScene.js
import Phaser from 'phaser';
import '../styles/LoginScene.css';
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
  console.log(
    '[ForgotPasswordScene] API_BASE =',
    API,
    'host =',
    host,
    'isProdHosted =',
    isProdHosted
  );
}

export default class ForgotPasswordScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ForgotPasswordScene' });
    this._onGlobalMuteChanged = null;
    this._onResizeMute = null;
    this._hideCssEl = null;

    this.video = null;
    this.muteBtn = null;
    this.ambient = null;
  }

  preload() {
    // tło wideo – spójnie z innymi scenami
    if (!this.cache.video.exists('bgVideo')) {
      this.load.video('bgVideo', 'assets/backgroundvideo.mp4', 'canplaythrough', false, true);
    }
    if (!this.cache.audio.exists('click'))   this.load.audio('click',   'assets/click.mp3');
    if (!this.cache.audio.exists('error'))   this.load.audio('error',   'assets/error.mp3');
    if (!this.cache.audio.exists('ambient')) this.load.audio('ambient', 'assets/ambient.mp3');
  }

  /** Wideo na cały canvas (rozciągnięte do rozdzielczości gry) */
  _resizeBgVideo() {
    if (!this.video) return;

    const canvasW = this.scale.width;
    const canvasH = this.scale.height;

    this.video
      .setDisplaySize(canvasW, canvasH)
      .setPosition(canvasW / 2, canvasH / 2);
  }

  create() {
    // Sprawdzenie tokenu w URL – jeżeli jest, od razu przejście do ResetPasswordScene
    try {
      const params = new URLSearchParams(window.location.search);
      let resetToken = params.get('token') || params.get('resetToken') || '';

      if (!resetToken && window.location.hash) {
        const h = new URLSearchParams(window.location.hash.slice(1));
        resetToken = h.get('token') || h.get('resetToken') || '';
      }

      if (resetToken) {
        this.scene.start('ResetPasswordScene');
        this.scene.stop('ForgotPasswordScene');
        return;
      }
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'ForgotPasswordScene' }));
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));

    this._hideCssEl = document.createElement('style');
    this._hideCssEl.id = '__hide_sidebar_in_forgot';
    this._hideCssEl.textContent = `
      .menu-icon { display: none !important; visibility: hidden !important; }
      .sidebar   { display: none !important; visibility: hidden !important; }
    `;
    document.head.appendChild(this._hideCssEl);

    ['deduction-board', 'dialog-log', 'deduction-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    // audio / widoczność
    this.input.once('pointerdown', () => safeResume(this));
    bindVisibility(this, 'ForgotPasswordScene');

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
    try { this.ambient.play(); } catch (_) {}

    const playSfx = (key, cfg) => { try { this.sound.play(key, cfg); } catch (_) {} };
    this.input.on('pointerdown', () => playSfx('click', { volume: 0.8, detune: 50 }));

    // WIDEO TŁA – pełny ekran, responsywne
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

    // lekki overlay, żeby UI było czytelniejsze
    this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.35
    ).setDepth(0);

    // przycisk mute
    const btnSize = 40;
    const pad = 20;

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

    // resize: mute + tło-wideo
    this._onResizeMute = (gameSize) => {
      const w = gameSize?.width ?? this.scale.width;
      const h = gameSize?.height ?? this.scale.height;
      this.muteBtn?.setPosition(w - btnSize - pad, h - btnSize - pad);
      this._resizeBgVideo();
    };
    this.scale.on('resize', this._onResizeMute);

    // UI resetu hasła
    const ui = document.getElementById('login-ui');
    if (ui) ui.innerHTML = '';

    const title = document.createElement('h1');
    title.innerText = 'Reset hasła';

    const help = document.createElement('div');
    help.className = 'helper-text';
    help.innerText =
      'Podaj login lub adres e-mail. Jeśli konto istnieje, wyślemy link do resetu.';

    const identInput = document.createElement('input');
    identInput.className = 'login-input';
    identInput.placeholder = 'Login lub e-mail';
    identInput.autofocus = true;
    identInput.value = localStorage.getItem('lastLogin') || '';

    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';

    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'login-button';
    submitBtn.innerText = 'WYŚLIJ LINK RESETU';

    const spinner = document.createElement('div');
    spinner.className = 'spinner hidden';

    const goToLogin = () => {
      playSfx('click', { volume: 0.8, detune: 50 });
      try {
        if (ui) ui.innerHTML = '';
        this.scene.start('LoginScene');
        this.scene.stop('ForgotPasswordScene');
      } catch (err) {
        console.error('[ForgotPasswordScene] goToLogin scene error, fallback do location.href:', err);
        const base = window.location.origin || '';
        window.location.href = `${base}/?scene=LoginScene`;
      }
    };

    const backToLogin = document.createElement('div');
    backToLogin.className = 'register-toggle-text';
    backToLogin.innerText = 'Wróć do logowania';
    backToLogin.onclick = goToLogin;

    const form = document.createElement('div');
    form.className = 'form-container';
    form.append(
      title,
      help,
      identInput,
      errorMsg,
      successMsg,
      submitBtn,
      spinner,
      backToLogin
    );
    if (ui) ui.appendChild(form);

    // logika wysyłki żądania resetu
    let isSubmitting = false;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const submit = async () => {
      if (isSubmitting) return;

      errorMsg.innerText = '';
      successMsg.innerText = '';
      successMsg.innerHTML = '';

      const loginOrEmail = identInput.value.trim();

      if (!loginOrEmail) {
        playSfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Wpisz login lub e-mail.';
        return;
      }

      const looksLikeEmail = emailRe.test(loginOrEmail);
      if (!looksLikeEmail && loginOrEmail.length < 3) {
        playSfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Login min. 3 znaki lub podaj poprawny e-mail.';
        return;
      }

      isSubmitting = true;
      submitBtn.disabled = true;
      spinner.classList.remove('hidden');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        console.log('[ForgotPasswordScene] wysyłam POST /auth/request-reset do', API);
        const res = await fetch(`${API}/auth/request-reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginOrEmail }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let payload = {};
        try {
          payload = await res.json();
        } catch (_) {
          console.warn('[ForgotPasswordScene] Nie udało się sparsować JSON z /auth/request-reset');
        }

        console.log('[ForgotPasswordScene] /auth/request-reset status =', res.status);
        console.log('[ForgotPasswordScene] /auth/request-reset payload =', payload);

        if (!res.ok || (payload && payload.ok === false)) {
          const code = payload?.error || 'SERVER_ERROR';
          let msg = 'Nie udało się wysłać linku resetu.';

          if (code === 'USER_NOT_FOUND') {
            msg = 'Jeśli konto istnieje, wyślemy link resetu. Sprawdź pocztę.';
          } else if (code === 'MAIL_ERROR') {
            msg = 'Błąd podczas wysyłki maila resetującego (MAIL_ERROR).';
          } else if (code === 'MAILER_OFF') {
            msg = 'System wysyłki maili jest chwilowo wyłączony.';
          }

          console.warn(
            '[ForgotPasswordScene] Błąd z backendu przy resetowaniu hasła:',
            code,
            'HTTP',
            res.status
          );
          errorMsg.innerText = msg;
          playSfx('error', { volume: 0.9 });
          return;
        }

        // SUKCES – z działającym linkiem do logowania
        successMsg.innerHTML =
          'Jeśli konto istnieje, wysłaliśmy link resetu. Sprawdź pocztę, a następnie ' +
          '<a href="#" class="inline-login-link">wróć do logowania</a>.';
        console.log('[ForgotPasswordScene] Reset link powinien być wysłany (jeśli konto istnieje).');

        // bezpośrednie podpięcie kliknięcia w link w treści
        const inlineLink = successMsg.querySelector('.inline-login-link');
        if (inlineLink) {
          inlineLink.addEventListener('click', (e) => {
            e.preventDefault();
            goToLogin();
          });
        }

      } catch (e) {
        clearTimeout(timeoutId);
        console.error(
          '[ForgotPasswordScene] Exception przy /auth/request-reset:',
          e?.name,
          e?.message || e
        );
        if (e.name === 'AbortError') {
          errorMsg.innerText = 'Serwer nie odpowiada (przekroczono czas oczekiwania).';
        } else {
          errorMsg.innerText = 'Brak połączenia z serwerem.';
        }
        playSfx('error', { volume: 0.9 });
      } finally {
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
        isSubmitting = false;
      }
    };

    identInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    submitBtn.onclick = () => {
      playSfx('click', { volume: 0.8, detune: 50 });
      submit();
    };

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

        unbindVisibility('ForgotPasswordScene');

        if (this._hideCssEl && this._hideCssEl.parentNode) {
          this._hideCssEl.parentNode.removeChild(this._hideCssEl);
          this._hideCssEl = null;
        }

        this.muteBtn?.destroy();
        this.muteBtn = null;

        if (this.video) {
          try { this.video.stop(); } catch {}
          this.video.destroy();
          this.video = null;
        }

        if (this.ambient) {
          this.ambient.stop();
          this.ambient.destroy();
          this.ambient = null;
        }
        this.sound.removeByKey && this.sound.removeByKey('ambient');

        const uiInner = document.getElementById('login-ui');
        if (uiInner) uiInner.innerHTML = '';
      } catch (_) {}
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      try {
        if (this.ambient) {
          this.ambient.stop();
          this.ambient.destroy();
          this.ambient = null;
        }
      } catch (_) {}
    });
  }
}