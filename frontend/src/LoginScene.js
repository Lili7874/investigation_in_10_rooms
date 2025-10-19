// src/scenes/LoginScene.js
import Phaser from 'phaser';
import './LoginScene.css';
import { safeResume, bindVisibility, unbindVisibility } from './audioSafe';

class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoginScene' });
    this._onGlobalMuteChanged = null;
    this._onResizeMute = null;
  }

  preload() {
    this.load.video('bgVideo', 'assets/backgroundvideo.mp4', 'canplaythrough', false, true);
    if (!this.cache.audio.exists('click'))   this.load.audio('click',   'assets/click.mp3');
    if (!this.cache.audio.exists('error'))   this.load.audio('error',   'assets/error.mp3');
    if (!this.cache.audio.exists('ambient')) this.load.audio('ambient', 'assets/ambient.mp3');
  }

  create() {
    // poinformuj App + posprzątaj DOM
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LoginScene' }));
    ['deduction-board', 'dialog-log'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });

    // zatrzymaj inne sceny
    if (this.scene?.manager) {
      this.scene.manager.scenes.forEach(s => {
        if (s?.sys?.settings?.key !== 'LoginScene') this.scene.stop(s.sys.settings.key);
      });
    }

    const { width, height } = this.sys.game.canvas;

    // jednorazowy "unlock" po 1. kliknięciu (bezpieczny)
    this.input.once('pointerdown', () => safeResume(this));
    // obsługa visibility bez duplikacji i bez dotykania closed context
    bindVisibility(this, 'LoginScene');

    // globalny mute z registry/localStorage + nasłuch zmian
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

    // ambient dla loginu (osobny od __bgm)
    this.ambient = this.sound.add('ambient', { loop: true, volume: 0.3 });
    try { this.ambient.play(); } catch (_) {}

    // przycisk MUTE globalny
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

    // krótki helper do SFX (bez stałych referencji – brak błędu "seek")
    const playSfx = (key, cfg) => { try { this.sound.play(key, cfg); } catch (_) {} };

    // kliknięcia w scenie
    this.input.on('pointerdown', () => playSfx('click', { volume: 0.8, detune: 50 }));

    // tło wideo
    this.video = this.add.video(0, 0, 'bgVideo');
    this.video.setMute(true).setLoop(true).play(true);
    this.video.setDepth(-1).setDisplaySize(300, 150).setOrigin(0.5).setPosition(width/2, height/2);

    // UI
    const loginUI = document.getElementById('login-ui');
    if (loginUI) loginUI.innerHTML = '';

    const title = document.createElement('h1');
    title.innerText = 'Panel Logowania';

    const loginInput = document.createElement('input');
    loginInput.className = 'login-input';
    loginInput.placeholder = 'Wprowadź identyfikator';
    loginInput.value = localStorage.getItem('lastLogin') || '';

    const passWrapper = document.createElement('div');
    passWrapper.className = 'pass-wrapper';
    passWrapper.style.position = 'relative';

    const passInput = document.createElement('input');
    passInput.className = 'login-input';
    passInput.type = 'password';
    passInput.placeholder = 'Wprowadź hasło';

    const togglePass = document.createElement('span');
    togglePass.innerText = '🧿';
    togglePass.className = 'toggle-password';
    Object.assign(togglePass.style, {
      position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
      cursor: 'pointer', color: '#b983ff', textShadow: '0 0 6px #a96fff'
    });
    togglePass.onclick = () => { passInput.type = passInput.type === 'password' ? 'text' : 'password'; };

    passWrapper.appendChild(passInput);
    passWrapper.appendChild(togglePass);

    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';

    const loginBtn = document.createElement('button');
    loginBtn.className = 'login-button';
    loginBtn.innerText = 'ZALOGUJ';

    const spinner = document.createElement('div');
    spinner.className = 'spinner hidden';

    const registerToggle = document.createElement('div');
    registerToggle.className = 'register-toggle-text';
    registerToggle.innerText = 'Nie masz konta? Zarejestruj się';
    registerToggle.onclick = () => {
      try { if (loginUI) loginUI.innerHTML = ''; } catch (_) {}
      this.scene.start('RegisterScene');
      this.scene.stop('LoginScene');
    };

    const isSubmitting = { value: false };

    const submit = () => {
      if (isSubmitting.value) return;

      const username = loginInput.value.trim();
      const password = passInput.value.trim();
      errorMsg.innerText = '';

      if (!username || !password) {
        playSfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Wszystkie pola są wymagane';
        return;
      }

      playSfx('click', { volume: 0.8, detune: 50 });
      isSubmitting.value = true;
      spinner.classList.remove('hidden');

      fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, password })
      })
      .then(res => {
        if (!res.ok) throw new Error('Błędne dane logowania');
        return res.json();
      })
      .then((payload) => {
        // >>> ZMIANA: zapisz zalogowanego usera <<<
        if (payload && payload.user) {
          localStorage.setItem('user', JSON.stringify(payload.user)); // { id, login, email }
          localStorage.setItem('lastLogin', payload.user.login || username);
        } else {
          localStorage.setItem('lastLogin', username);
        }

        if (loginUI) loginUI.innerHTML = '';

        this.video?.stop(); this.video?.destroy();

        // wyłącz ambient z loginu (nie ruszamy globalnego __bgm)
        if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
        this.sound.removeByKey && this.sound.removeByKey('ambient');

        this.scene.start('LevelSelect');
        this.scene.stop('LoginScene');
      })
      .catch(() => {
        errorMsg.innerText = 'Login lub hasło nieprawidłowe';
        playSfx('error', { volume: 0.9 });
      })
      .finally(() => {
        isSubmitting.value = false;
        spinner.classList.add('hidden');
      });
    };

    loginInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    passInput.addEventListener('keydown',  (e) => { if (e.key === 'Enter') submit(); });
    loginBtn.onclick = submit;

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    formContainer.append(title, loginInput, passWrapper, errorMsg, loginBtn, spinner, registerToggle);
    if (loginUI) loginUI.appendChild(formContainer);

    // sprzątanie
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        if (this._onResizeMute) { this.scale.off('resize', this._onResizeMute); this._onResizeMute = null; }
        if (this._onGlobalMuteChanged) {
          this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
          this._onGlobalMuteChanged = null;
        }

        // odpinamy zdeduplikowany handler visibility
        unbindVisibility('LoginScene');

        this.muteBtn?.destroy(); this.muteBtn = null;

        this.video?.stop(); this.video?.destroy();
        if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
        this.sound.removeByKey && this.sound.removeByKey('ambient');
      } catch (_) {}
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      try {
        if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
      } catch (_) {}
    });
  }
}

export default LoginScene;
