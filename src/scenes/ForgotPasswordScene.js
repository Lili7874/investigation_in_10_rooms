// src/scenes/ForgotPasswordScene.js
import Phaser from 'phaser';
import '../styles/LoginScene.css';
import { safeResume, bindVisibility, unbindVisibility } from '../lib/audioSafe';

const API =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  'http://localhost:3001';


export default class ForgotPasswordScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ForgotPasswordScene' });
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
      const el = document.getElementById(id); if (el) el.remove();
    });

    const { width, height } = this.sys.game.canvas;

    this.input.once('pointerdown', () => safeResume(this));
    bindVisibility(this, 'ForgotPasswordScene');

    const reg = this.game.registry;
    let gm = reg.get('globalMuted');
    if (gm == null) { gm = localStorage.getItem('globalMuted') === '1'; reg.set('globalMuted', gm); }
    this.sound.mute = !!gm;
    this._onGlobalMuteChanged = (_p, v) => {
      this.sound.mute = !!v;
      this.muteBtn?.setText(this.sound.mute ? '🔇' : '🔊');
    };
    reg.events.on('changedata-globalMuted', this._onGlobalMuteChanged);

    this.ambient = this.sound.add('ambient', { loop: true, volume: 0.3 });
    try { this.ambient.play(); } catch (_) {}
    const playSfx = (k, cfg) => { try { this.sound.play(k, cfg); } catch (_) {} };
    this.input.on('pointerdown', () => playSfx('click', { volume: 0.8, detune: 50 }));

    this.video = this.add.video(0, 0, 'bgVideo');
    this.video.setMute(true).setLoop(true).play(true);
    this.video.setDepth(-1).setDisplaySize(300, 150).setOrigin(0.5).setPosition(width/2, height/2);

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

    const ui = document.getElementById('login-ui');
    if (ui) ui.innerHTML = '';

    const title = document.createElement('h1');
    title.innerText = 'Reset hasła';

    const help = document.createElement('div');
    help.className = 'helper-text';
    help.innerText = 'Podaj login lub adres e-mail. Jeśli konto istnieje, wyślemy link do resetu.';

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

    const backToLogin = document.createElement('div');
    backToLogin.className = 'register-toggle-text';
    backToLogin.innerText = 'Wróć do logowania';
    backToLogin.onclick = () => {
      playSfx('click', { volume: 0.8, detune: 50 });
      this.scene.start('LoginScene');
      this.scene.stop('ForgotPasswordScene');
    };

    const form = document.createElement('div');
    form.className = 'form-container';
    form.append(title, help, identInput, errorMsg, successMsg, submitBtn, spinner, backToLogin);
    if (ui) ui.appendChild(form);

    let isSubmitting = false;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const submit = async () => {
      if (isSubmitting) return;
      errorMsg.innerText = ''; successMsg.innerText = '';

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

      try {
        await fetch(`${API}/auth/request-reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginOrEmail })
        });
        successMsg.innerText = 'Jeśli konto istnieje, wysłaliśmy link resetu. Sprawdź pocztę.';
      } catch {
        errorMsg.innerText = 'Brak połączenia z serwerem.';
        playSfx('error', { volume: 0.9 });
      } finally {
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
        isSubmitting = false;
      }
    };

    identInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    submitBtn.onclick = () => { playSfx('click', { volume: 0.8, detune: 50 }); submit(); };

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        if (this._onResizeMute) { this.scale.off('resize', this._onResizeMute); this._onResizeMute = null; }
        if (this._onGlobalMuteChanged) {
          this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
          this._onGlobalMuteChanged = null;
        }
        unbindVisibility('ForgotPasswordScene');
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
