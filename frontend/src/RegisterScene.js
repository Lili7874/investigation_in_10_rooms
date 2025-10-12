// src/scenes/RegisterScene.js
import Phaser from 'phaser';
import './LoginScene.css';
import { safeResume, bindVisibility, unbindVisibility } from './audioSafe';

export default class RegisterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RegisterScene' });
    this._onGlobalMuteChanged = null;
    this._onResizeMute = null;
    this._hideCssEl = null;
  }

  preload() {
    this.load.video('bgVideo', 'assets/backgroundvideo.mp4', 'canplaythrough', false, true);
    if (!this.cache.audio.exists('click'))   this.load.audio('click',   'assets/click.mp3');
    if (!this.cache.audio.exists('error'))   this.load.audio('error',   'assets/error.mp3');
    if (!this.cache.audio.exists('ambient')) this.load.audio('ambient', 'assets/ambient.mp3');
  }

  create() {
    // Powiadom aplikację o zmianie sceny i zamknij sidebar (React Sidebar nasłuchuje)
    window.dispatchEvent(new CustomEvent('sceneChange',   { detail: 'RegisterScene' }));
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));

    // Dodatkowy bezpiecznik: ukryj ikonkę menu i sam panel (usuniemy przy SHUTDOWN)
    this._hideCssEl = document.createElement('style');
    this._hideCssEl.id = '__hide_sidebar_in_register';
    this._hideCssEl.textContent = `
      .menu-icon { display: none !important; visibility: hidden !important; }
      .sidebar   { display: none !important; visibility: hidden !important; }
    `;
    document.head.appendChild(this._hideCssEl);

    // Posprzątaj ewentualne UI z innych scen
    ['deduction-board', 'dialog-log', 'deduction-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    // Zatrzymaj inne sceny (w razie gdyby coś żyło)
    if (this.scene?.manager) {
      this.scene.manager.scenes.forEach(s => {
        if (s?.sys?.settings?.key && s.sys.settings.key !== 'RegisterScene') {
          try { this.scene.stop(s.sys.settings.key); } catch (_) {}
        }
      });
    }

    const { width, height } = this.sys.game.canvas;

    // Bezpieczny „unlock” audio po 1. interakcji
    this.input.once('pointerdown', () => safeResume(this));
    // Jednolita obsługa visibility (jak w LoginScene)
    bindVisibility(this, 'RegisterScene');

    // Globalny mute (registry/localStorage)
    const reg = this.game.registry;
    let gm = reg.get('globalMuted');
    if (gm == null) { gm = localStorage.getItem('globalMuted') === '1'; reg.set('globalMuted', gm); }
    this.sound.mute = !!gm;

    this._onGlobalMuteChanged = (_parent, value) => {
      this.sound.mute = !!value;
      this.muteBtn?.setText(this.sound.mute ? '🔇' : '🔊');
    };
    reg.events.on('changedata-globalMuted', this._onGlobalMuteChanged);

    // Ambient tła (oddzielny od globalnego __bgm)
    this.ambient = this.sound.add('ambient', { loop: true, volume: 0.3 });
    try { this.ambient.play(); } catch (_) {}

    // Helper SFX
    const playSfx = (key, cfg) => { try { this.sound.play(key, cfg); } catch (_) {} };

    // Kliknięcia w scenie
    this.input.on('pointerdown', () => playSfx('click', { volume: 0.8, detune: 50 }));

    // Tło wideo
    this.video = this.add.video(0, 0, 'bgVideo');
    this.video.setMute(true).setLoop(true).play(true);
    this.video.setDepth(-1).setDisplaySize(300, 150).setOrigin(0.5).setPosition(width/2, height/2);

    // Globalny przycisk MUTE
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

    this._onResizeMute = (gameSize) => {
      this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
    };
    this.scale.on('resize', this._onResizeMute);

    // ===== UI rejestracji =====
    const ui = document.getElementById('login-ui');
    if (ui) ui.innerHTML = '';

    const title = document.createElement('h1');
    title.innerText = 'Rejestracja';

    const loginInput = document.createElement('input');
    loginInput.className = 'login-input';
    loginInput.placeholder = 'Wybierz identyfikator';

    const emailInput = document.createElement('input');
    emailInput.className = 'login-input';
    emailInput.type = 'email';
    emailInput.placeholder = 'Adres e-mail';

    const passWrapper = document.createElement('div');
    passWrapper.className = 'pass-wrapper';
    passWrapper.style.position = 'relative';

    const passInput = document.createElement('input');
    passInput.className = 'login-input';
    passInput.type = 'password';
    passInput.placeholder = 'Hasło';

    const togglePass = document.createElement('span');
    togglePass.innerText = '🧿';
    togglePass.className = 'toggle-password';
    Object.assign(togglePass.style, {
      position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
      cursor: 'pointer', color: '#b983ff', textShadow: '0 0 6px #a96fff'
    });
    togglePass.onclick = () => { passInput.type = passInput.type === 'password' ? 'text' : 'password'; };
    passWrapper.append(passInput, togglePass);

    const pass2Wrapper = document.createElement('div');
    pass2Wrapper.className = 'pass-wrapper';
    pass2Wrapper.style.position = 'relative';

    const pass2Input = document.createElement('input');
    pass2Input.className = 'login-input';
    pass2Input.type = 'password';
    pass2Input.placeholder = 'Powtórz hasło';

    const togglePass2 = document.createElement('span');
    togglePass2.innerText = '🧿';
    togglePass2.className = 'toggle-password';
    Object.assign(togglePass2.style, {
      position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
      cursor: 'pointer', color: '#b983ff', textShadow: '0 0 6px #a96fff'
    });
    togglePass2.onclick = () => { pass2Input.type = pass2Input.type === 'password' ? 'text' : 'password'; };
    pass2Wrapper.append(pass2Input, togglePass2);

    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';

    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'login-button';
    submitBtn.innerText = 'UTWÓRZ KONTO';

    const spinner = document.createElement('div');
    spinner.className = 'spinner hidden';

    const backToLogin = document.createElement('div');
    backToLogin.className = 'register-toggle-text';
    backToLogin.innerText = 'Masz konto? Zaloguj się';
    backToLogin.onclick = () => {
      playSfx('click', { volume: 0.8, detune: 50 });
      this.scene.start('LoginScene');
      this.scene.stop('RegisterScene');
    };

    const form = document.createElement('div');
    form.className = 'form-container';
    form.append(
      title,
      loginInput,
      emailInput,
      passWrapper,
      pass2Wrapper,
      errorMsg,
      successMsg,
      submitBtn,
      spinner,
      backToLogin
    );
    if (ui) ui.appendChild(form);

    // Walidacja i submit
    const isSubmitting = { value: false };
    const errorMap = {
      MISSING_FIELDS: 'Uzupełnij wszystkie pola.',
      BAD_EMAIL: 'Podaj prawidłowy adres e-mail.',
      WEAK_PASSWORD: 'Hasło musi mieć min. 6 znaków.',
      LOGIN_TAKEN: 'Ten login jest już zajęty.',
      EMAIL_TAKEN: 'Ten e-mail jest już w użyciu.',
      DUPLICATE: 'Login lub e-mail jest już używany.',
      SERVER_ERROR: 'Błąd serwera. Spróbuj ponownie.',
    };

    const submit = async () => {
      if (isSubmitting.value) return;

      const login = loginInput.value.trim();
      const email = emailInput.value.trim();
      const pass1 = passInput.value.trim();
      const pass2 = pass2Input.value.trim();
      errorMsg.innerText = '';
      successMsg.innerText = '';

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!login || !email || !pass1 || !pass2) {
        playSfx('error', { volume: 0.9 });
        errorMsg.innerText = errorMap.MISSING_FIELDS;
        return;
      }
      if (!emailRe.test(email)) {
        playSfx('error', { volume: 0.9 });
        errorMsg.innerText = errorMap.BAD_EMAIL;
        return;
      }
      if (pass1.length < 6) {
        playSfx('error', { volume: 0.9 });
        errorMsg.innerText = errorMap.WEAK_PASSWORD;
        return;
      }
      if (pass1 !== pass2) {
        playSfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Hasła muszą być takie same';
        return;
      }

      playSfx('click', { volume: 0.8, detune: 50 });
      isSubmitting.value = true;
      spinner.classList.remove('hidden');

      try {
        const res = await fetch('http://localhost:3001/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, email, password: pass1 })
        });

        let payload = {};
        try { payload = await res.json(); } catch (_) {}

        if (!res.ok) {
          const code = payload?.error;
          const msg =
            (code && errorMap[code]) ||
            (res.status === 409 ? errorMap.DUPLICATE : `Błąd (${res.status})`);
          errorMsg.innerText = msg;
          playSfx('error', { volume: 0.9 });
          return;
        }

        // Sukces -> wróć do logowania
        successMsg.innerText = 'Konto utworzone! Przekierowuję do logowania…';
        localStorage.setItem('lastLogin', login);
        playSfx('click', { volume: 0.8, detune: 50 });

        setTimeout(() => {
          if (ui) ui.innerHTML = '';
          this.video?.stop(); this.video?.destroy();
          if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
          this.sound.removeByKey && this.sound.removeByKey('ambient');

          this.scene.start('LoginScene');
          this.scene.stop('RegisterScene');
        }, 800);

      } catch (_) {
        errorMsg.innerText = 'Brak połączenia z serwerem.';
        playSfx('error', { volume: 0.9 });
      } finally {
        spinner.classList.add('hidden');
        isSubmitting.value = false;
      }
    };

    [loginInput, emailInput, passInput, pass2Input].forEach(el => {
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    });
    submitBtn.onclick = submit;

    // Sprzątanie
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        if (this._onResizeMute) { this.scale.off('resize', this._onResizeMute); this._onResizeMute = null; }
        if (this._onGlobalMuteChanged) {
          this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
          this._onGlobalMuteChanged = null;
        }

        // Zdejmij wspólny handler visibility dla tej sceny
        unbindVisibility('RegisterScene');

        // Usuń wstrzyknięty CSS chowający sidebar/ikonę
        if (this._hideCssEl && this._hideCssEl.parentNode) {
          this._hideCssEl.parentNode.removeChild(this._hideCssEl);
          this._hideCssEl = null;
        }

        this.muteBtn?.destroy(); this.muteBtn = null;

        this.video?.stop(); this.video?.destroy();
        if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
        this.sound.removeByKey && this.sound.removeByKey('ambient');
      } catch (_) {}
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      try { if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; } } catch (_) {}
    });
  }
}
