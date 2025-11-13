// src/scenes/ResetPasswordScene.js
import Phaser from 'phaser';
import '../styles/LoginScene.css';
import { safeResume, bindVisibility, unbindVisibility } from '../lib/audioSafe';

/* =========================
   API base detection (jak w Login/Register/LevelSelect)
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
    ? 'https://investigation-in-10-rooms.onrender.com' // Render w produkcji
    : 'http://localhost:3001');                         // lokalnie

const API = String(RAW_API).replace(/\/+$/, '');
if (isBrowser) {
  console.log('[ResetPasswordScene] API_BASE =', API);
}

export default class ResetPasswordScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResetPasswordScene' });
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
    window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'ResetPasswordScene' }));
    ['deduction-board', 'dialog-log', 'deduction-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    if (this.scene?.manager) {
      this.scene.manager.scenes.forEach(s => {
        if (s?.sys?.settings?.key && s.sys.settings.key !== 'ResetPasswordScene') {
          try { this.scene.stop(s.sys.settings.key); } catch (_) {}
        }
      });
    }

    const { width, height } = this.sys.game.canvas;

    this.input.once('pointerdown', () => safeResume(this));
    bindVisibility(this, 'ResetPasswordScene');

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
    try { this.ambient.play(); } catch (_) {}

    const playSfx = (key, cfg) => { try { this.sound.play(key, cfg); } catch (_) {} };
    this.input.on('pointerdown', () => playSfx('click', { volume: 0.8, detune: 50 }));

    this.video = this.add.video(0, 0, 'bgVideo');
    try { this.video.setMute(true).setLoop(true).play(true); } catch (_) {}
    this.video.setDepth(-1).setDisplaySize(300, 150).setOrigin(0.5).setPosition(width/2, height/2);

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

    const ui = document.getElementById('login-ui');
    if (ui) ui.innerHTML = '';

    const title = document.createElement('h1');
    title.innerText = 'Ustaw nowe hasło';

    // Token z query (?token= / ?resetToken=) albo z hash (#token= ...)
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token') || params.get('resetToken') || '';
    if (!token && window.location.hash) {
      const h = new URLSearchParams(window.location.hash.slice(1));
      token = h.get('token') || h.get('resetToken') || '';
    }

    const tokenInfo = document.createElement('div');
    tokenInfo.className = 'info-message';
    tokenInfo.style.marginBottom = '8px';
    tokenInfo.innerText = token
      ? 'Token został odczytany z linku. Możesz ustawić nowe hasło.'
      : 'Brak tokenu resetu w adresie. Użyj linku z e-maila.';

    const passWrapper = document.createElement('div');
    passWrapper.className = 'pass-wrapper';
    passWrapper.style.position = 'relative';

    const passInput = document.createElement('input');
    passInput.className = 'login-input';
    passInput.type = 'password';
    passInput.placeholder = 'Nowe hasło';
    passInput.maxLength = 72;

    const togglePass = document.createElement('span');
    togglePass.innerText = '🧿';
    togglePass.className = 'toggle-password';
    togglePass.setAttribute('role', 'button');
    togglePass.setAttribute('aria-label', 'Pokaż/ukryj hasło');
    Object.assign(togglePass.style, {
      position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
      cursor: 'pointer', color: '#b983ff', textShadow: '0 0 6px #a96fff', zIndex: 6
    });
    togglePass.onclick = () => { passInput.type = passInput.type === 'password' ? 'text' : 'password'; };

    const hint = document.createElement('div');
    hint.className = 'password-hint-bubble';
    Object.assign(hint.style, {
      position: 'absolute',
      left: '0',
      top: 'calc(100% + 6px)',
      width: '300px',
      background: 'rgba(20,0,36,.92)',
      border: '1px solid #8e4dff',
      borderRadius: '10px',
      padding: '10px 12px',
      color: '#fff',
      fontFamily: 'Monaco, monospace',
      fontSize: '12px',
      boxShadow: '0 6px 18px rgba(0,0,0,.35)',
      display: 'none',
      zIndex: 5
    });
    hint.innerHTML = `
      <div style="font-weight:bold;margin-bottom:6px">Wymagania hasła</div>
      <ul id="pw-reqs" style="padding-left:18px;margin:0">
        <li data-req="len">min. 8 znaków</li>
        <li data-req="low">mała litera (a–z)</li>
        <li data-req="up">wielka litera (A–Z)</li>
        <li data-req="num">cyfra (0–9)</li>
        <li data-req="spec">znak specjalny (!@#$%^&*...)</li>
        <li data-req="space">bez spacji</li>
        <li data-req="max">maks. 72 znaki</li>
      </ul>
    `;

    // ℹ️ Mobilny toggle dymka
    const infoTap = document.createElement('span');
    infoTap.textContent = 'ℹ️';
    infoTap.setAttribute('role', 'button');
    infoTap.setAttribute('aria-label', 'Pokaż wymagania hasła');
    Object.assign(infoTap.style, {
      position: 'absolute', right: '38px', top: '50%', transform: 'translateY(-50%)',
      fontSize: '14px', color: '#b983ff', cursor: 'pointer', userSelect: 'none',
      textShadow: '0 0 6px #a96fff', zIndex: 6
    });
    let hintOpen = false;
    infoTap.onclick = () => {
      hintOpen = !hintOpen;
      hint.style.display = hintOpen ? 'block' : 'none';
      if (hintOpen) updateUiForPassword();
    };

    const strength = document.createElement('div');
    strength.className = 'password-strength';
    Object.assign(strength.style, {
      marginTop: '6px',
      height: '6px',
      background: 'rgba(255,255,255,.1)',
      borderRadius: '6px',
      overflow: 'hidden'
    });
    const strengthBar = document.createElement('div');
    Object.assign(strengthBar.style, {
      height: '100%',
      width: '0%',
      transition: 'width .25s',
      background: '#8e4dff'
    });
    strength.appendChild(strengthBar);

    passWrapper.append(passInput, togglePass, infoTap, hint, strength);

    const pass2Wrapper = document.createElement('div');
    pass2Wrapper.className = 'pass-wrapper';
    pass2Wrapper.style.position = 'relative';

    const pass2Input = document.createElement('input');
    pass2Input.className = 'login-input';
    pass2Input.type = 'password';
    pass2Input.placeholder = 'Powtórz hasło';
    pass2Input.maxLength = 72;

    const togglePass2 = document.createElement('span');
    togglePass2.innerText = '🧿';
    togglePass2.className = 'toggle-password';
    togglePass2.setAttribute('role', 'button');
    togglePass2.setAttribute('aria-label', 'Pokaż/ukryj hasło');
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
    submitBtn.innerText = 'Zmień hasło';
    // zablokuj przycisk, gdy nie ma tokenu
    submitBtn.disabled = !token;
    submitBtn.style.opacity = token ? '1' : '.6';
    submitBtn.style.cursor  = token ? 'pointer' : 'not-allowed';

    const spinner = document.createElement('div');
    spinner.className = 'spinner hidden';

    const backToLogin = document.createElement('div');
    backToLogin.className = 'register-toggle-text';
    backToLogin.innerText = 'Wróć do logowania';
    backToLogin.onclick = () => {
      this.scene.start('LoginScene');
      this.scene.stop('ResetPasswordScene');
    };

    const reqList = () => {
      const ul = hint.querySelector('#pw-reqs');
      return {
        len:  ul.querySelector('[data-req="len"]'),
        low:  ul.querySelector('[data-req="low"]'),
        up:   ul.querySelector('[data-req="up"]'),
        num:  ul.querySelector('[data-req="num"]'),
        spec: ul.querySelector('[data-req="spec"]'),
        space:ul.querySelector('[data-req="space"]'),
        max:  ul.querySelector('[data-req="max"]'),
      };
    };
    const setReqOk = (el, ok) => {
      el.style.color = ok ? '#7cff8e' : '#fff';
      el.style.opacity = ok ? '1' : '.85';
      const text = el.innerText.replace(/^✅\s+|^•\s+/, '');
      el.innerHTML = (ok ? '✅ ' : '• ') + text;
    };

    const evalPassword = (p) => {
      const checks = {
        len:  p.length >= 8,
        low:  /[a-z]/.test(p),
        up:   /[A-Z]/.test(p),
        num:  /[0-9]/.test(p),
        spec: /[^A-Za-z0-9]/.test(p),
        space: !/\s/.test(p),
        max:  p.length <= 72,
      };
      const strengthKeys = ['len','low','up','num','spec'];
      const score = strengthKeys.reduce((acc, k) => acc + (checks[k] ? 1 : 0), 0);
      return { checks, score };
    };

    const updateUiForPassword = () => {
      const { checks, score } = evalPassword(passInput.value);
      const reqs = reqList();
      setReqOk(reqs.len,  checks.len);
      setReqOk(reqs.low,  checks.low);
      setReqOk(reqs.up,   checks.up);
      setReqOk(reqs.num,  checks.num);
      setReqOk(reqs.spec, checks.spec);
      setReqOk(reqs.space,checks.space);
      setReqOk(reqs.max,  checks.max);
      strengthBar.style.width = (score * 20) + '%';
      strengthBar.style.background = score >= 4 ? '#7cff8e' : (score >= 2 ? '#f0c24b' : '#e57373');
    };

    passInput.addEventListener('focus', () => { hint.style.display = 'block'; updateUiForPassword(); });
    passInput.addEventListener('blur',  () => { if (!hintOpen) hint.style.display = 'none'; });
    passInput.addEventListener('input', updateUiForPassword);

    const isSubmitting = { value: false };

    const submit = async () => {
      if (isSubmitting.value) return;

      errorMsg.innerText = '';
      successMsg.innerText = '';

      if (!token) {
        errorMsg.innerText = 'Brak tokenu resetu. Skorzystaj z linku z e-maila.';
        try { this.sound.play('error', { volume: 0.9 }); } catch(_) {}
        return;
      }

      const p1 = passInput.value;
      const p2 = pass2Input.value;

      const { checks } = evalPassword(p1);
      const strong = checks.len && checks.low && checks.up && checks.num && checks.spec && checks.space && checks.max;

      if (!p1 || !p2) {
        errorMsg.innerText = 'Uzupełnij oba pola hasła.';
        passInput.focus();
        try { this.sound.play('error', { volume: 0.9 }); } catch(_) {}
        return;
      }
      if (!strong) {
        errorMsg.innerText = 'Hasło nie spełnia wymagań.';
        passInput.focus();
        try { this.sound.play('error', { volume: 0.9 }); } catch(_) {}
        return;
      }
      if (p1 !== p2) {
        errorMsg.innerText = 'Hasła muszą być identyczne.';
        pass2Input.focus();
        try { this.sound.play('error', { volume: 0.9 }); } catch(_) {}
        return;
      }

      isSubmitting.value = true;
      spinner.classList.remove('hidden');

      try {
        const res = await fetch(`${API}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: p1 })
        });

        let payload = {};
        try { payload = await res.json(); } catch (_) {}

        if (!res.ok || !payload?.ok) {
          const msg = payload?.error || `Błąd (${res.status})`;
          errorMsg.innerText =
            msg === 'INVALID_TOKEN' ? 'Nieprawidłowy lub wygasły link.' :
            msg === 'WEAK_PASSWORD' ? 'Hasło nie spełnia wymagań.' :
            'Nie udało się zmienić hasła.';
          try { this.sound.play('error', { volume: 0.9 }); } catch(_) {}
          return;
        }

        successMsg.innerText = 'Hasło zmienione! Możesz się zalogować.';
        playSfx('click', { volume: 0.8, detune: 50 });

        setTimeout(() => {
          if (ui) ui.innerHTML = '';
          this.video?.stop(); this.video?.destroy();
          if (this.ambient) { this.ambient.stop(); this.ambient.destroy(); this.ambient = null; }
          this.sound.removeByKey && this.sound.removeByKey('ambient');
          this.scene.start('LoginScene');
          this.scene.stop('ResetPasswordScene');
        }, 800);

      } catch {
        errorMsg.innerText = 'Brak połączenia z serwerem.';
        try { this.sound.play('error', { volume: 0.9 }); } catch(_) {}
      } finally {
        spinner.classList.add('hidden');
        isSubmitting.value = false;
      }
    };

    passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    pass2Input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    submitBtn.onclick = submit;

    const form = document.createElement('div');
    form.className = 'form-container';
    form.append(
      title,
      tokenInfo,
      passWrapper,
      pass2Wrapper,
      errorMsg,
      successMsg,
      submitBtn,
      spinner,
      backToLogin
    );
    if (ui) ui.appendChild(form);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        if (this._onResizeMute) { this.scale.off('resize', this._onResizeMute); this._onResizeMute = null; }
        if (this._onGlobalMuteChanged) {
          this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged);
          this._onGlobalMuteChanged = null;
        }
        unbindVisibility('ResetPasswordScene');
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
