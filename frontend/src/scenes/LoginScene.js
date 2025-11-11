// src/scenes/LoginScene.js
import Phaser from 'phaser';
import '../styles/LoginScene.css';
import { safeResume, bindVisibility, unbindVisibility } from '../lib/audioSafe';

const API =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  'http://localhost:3001';


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
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LoginScene' }));
    ['deduction-board', 'dialog-log'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });

    if (this.scene?.manager) {
      this.scene.manager.scenes.forEach(s => {
        if (s?.sys?.settings?.key !== 'LoginScene') this.scene.stop(s.sys.settings.key);
      });
    }

    const { width, height } = this.sys.game.canvas;

    this.input.once('pointerdown', () => safeResume(this));
    bindVisibility(this, 'LoginScene');

    const reg = this.game.registry;
    let gm = reg.get('globalMuted');
    if (gm == null) { gm = localStorage.getItem('globalMuted') === '1'; reg.set('globalMuted', gm); }
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

    this.video = this.add.video(0, 0, 'bgVideo')
      .setMute(true).setLoop(true).play(true)
      .setDepth(-1).setDisplaySize(300, 150).setOrigin(0.5).setPosition(width/2, height/2);

    const btnSize = 40, pad = 20;
    this.muteBtn = this.add.text(
      this.scale.width - btnSize - pad,
      this.scale.height - btnSize - pad,
      this.sound.mute ? '🔇' : '🔊',
      { fontFamily: 'Monaco, monospace', fontSize: '28px', color: '#FFFFFF' }
    ).setInteractive({ cursor: 'pointer' }).setScrollFactor(0).setDepth(2000);

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

    passWrapper.append(passInput, togglePass);

    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';

    const loginBtn = document.createElement('button');
    loginBtn.className = 'login-button';
    loginBtn.innerText = 'ZALOGUJ';

    const spinner = document.createElement('div');
    spinner.className = 'spinner hidden';

    const forgotToggle = document.createElement('div');
    forgotToggle.className = 'register-toggle-text';
    forgotToggle.innerText = 'Zapomniałeś hasła?';
    forgotToggle.style.marginTop = '8px';
    forgotToggle.onclick = () => {
      try { if (loginUI) loginUI.innerHTML = ''; } catch {}
      this.scene.start('ForgotPasswordScene');
      this.scene.stop('LoginScene');
    };

    const registerToggle = document.createElement('div');
    registerToggle.className = 'register-toggle-text';
    registerToggle.innerText = 'Nie masz konta? Zarejestruj się';
    registerToggle.onclick = () => {
      try { if (loginUI) loginUI.innerHTML = ''; } catch {}
      this.scene.start('RegisterScene');
      this.scene.stop('LoginScene');
    };

    let submitting = false;
    const submit = () => {
      if (submitting) return;

      const username = loginInput.value.trim();
      const password = passInput.value.trim();
      errorMsg.innerText = '';

      if (!username || !password) {
        sfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Wszystkie pola są wymagane';
        return;
      }

      sfx('click', { volume: 0.8, detune: 50 });
      submitting = true;
      spinner.classList.remove('hidden');

      fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, password })
      })
      .then(res => {
        if (!res.ok) throw new Error('BAD_LOGIN');
        return res.json();
      })
      .then(payload => {
        if (payload?.user) {
          localStorage.setItem('user', JSON.stringify(payload.user));
          localStorage.setItem('lastLogin', payload.user.login || username);
        } else {
          localStorage.setItem('lastLogin', username);
        }

        if (loginUI) loginUI.innerHTML = '';
        this.video?.stop(); this.video?.destroy();
        if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
        this.sound.removeByKey && this.sound.removeByKey('ambient');

        this.scene.start('LevelSelect');
        this.scene.stop('LoginScene');
      })
      .catch(() => {
        errorMsg.innerText = 'Login lub hasło nieprawidłowe';
        sfx('error', { volume: 0.9 });
      })
      .finally(() => {
        submitting = false;
        spinner.classList.add('hidden');
      });
    };

    loginInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    passInput.addEventListener('keydown',  (e) => { if (e.key === 'Enter') submit(); });
    loginBtn.onclick = submit;

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    formContainer.append(title, loginInput, passWrapper, errorMsg, loginBtn, spinner, forgotToggle, registerToggle);
    if (loginUI) loginUI.appendChild(formContainer);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        if (this._onResizeMute) { this.scale.off('resize', this._onResizeMute); this._onResizeMute = null; }
        if (this._onGlobalMuteChanged) { this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged); this._onGlobalMuteChanged = null; }
        unbindVisibility('LoginScene');
        this.muteBtn?.destroy(); this.muteBtn = null;
        this.video?.stop(); this.video?.destroy();
        if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
        this.sound.removeByKey && this.sound.removeByKey('ambient');
      } catch {}
    });

    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      try { if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; } } catch {}
    });
  }
}

export default LoginScene;
