// src/scenes/RegisterScene.js
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
    '[RegisterScene] API_BASE =',
    API,
    '| host =',
    host,
    '| isProdHosted =',
    isProdHosted
  );
}

const PW_RULES = { MIN_LEN: 8, MAX_LEN: 72 };
const COMMON = new Set([
  '123456','123456789','12345678','password','qwerty','111111','abc123',
  '123123','12345','password1','qwerty123','zaq12wsx','iloveyou','admin'
]);

function validatePasswordFront(pw, { login, email } = {}) {
  const issues = [];
  if (typeof pw !== 'string' || pw.length === 0) { issues.push('REQUIRED'); return { ok:false, issues }; }
  if (/\s/.test(pw)) issues.push('NO_SPACES');
  if (pw.length < PW_RULES.MIN_LEN) issues.push('MIN_LEN');
  if (pw.length > PW_RULES.MAX_LEN) issues.push('MAX_LEN');
  if (!/[a-z]/.test(pw)) issues.push('LOWERCASE_REQUIRED');
  if (!/[A-Z]/.test(pw)) issues.push('UPPERCASE_REQUIRED');
  if (!/\d/.test(pw)) issues.push('DIGIT_REQUIRED');
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push('SPECIAL_REQUIRED');

  const lower = pw.toLowerCase();
  if (COMMON.has(lower)) issues.push('COMMON_PASSWORD');

  const loginLower = (login || '').toLowerCase();
  if (loginLower && lower.includes(loginLower)) issues.push('CONTAINS_LOGIN');

  const emailLocalLower = ((email || '').split('@')[0] || '').toLowerCase();
  if (emailLocalLower && lower.includes(emailLocalLower)) issues.push('CONTAINS_EMAIL');

  return { ok: issues.length === 0, issues };
}

const ISSUE_LABEL = {
  MIN_LEN: `Min. ${PW_RULES.MIN_LEN} znaków`,
  MAX_LEN: `Maks. ${PW_RULES.MAX_LEN} znaków`,
  LOWERCASE_REQUIRED: 'Mała litera (a-z)',
  UPPERCASE_REQUIRED: 'Wielka litera (A-Z)',
  DIGIT_REQUIRED: 'Cyfra (0-9)',
  SPECIAL_REQUIRED: 'Znak specjalny (!@#…)',
  NO_SPACES: 'Bez spacji',
  COMMON_PASSWORD: 'Nie powszechne hasło',
  CONTAINS_LOGIN: 'Nie zawiera loginu',
  CONTAINS_EMAIL: 'Nie zawiera części e-maila',
};

export default class RegisterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RegisterScene' });
    this._onGlobalMuteChanged = null;
    this._onResizeMute = null;
    this._hideCssEl = null;
    this.video = null;
    this.muteBtn = null;
    this.ambient = null;
  }

  preload() {
    if (!this.cache.video.exists('bgVideo')) {
      this.load.video('bgVideo', 'assets/backgroundvideo.mp4', 'canplaythrough', false, true);
    }
    if (!this.cache.audio.exists('click'))   this.load.audio('click',   'assets/click.mp3');
    if (!this.cache.audio.exists('error'))   this.load.audio('error',   'assets/error.mp3');
    if (!this.cache.audio.exists('ambient')) this.load.audio('ambient', 'assets/ambient.mp3');
  }

  /** Wideo na cały ekran – dopasowane do aktualnego rozmiaru canvasa */
  _resizeBgVideo() {
    if (!this.video) return;
    const canvasW = this.scale.width;
    const canvasH = this.scale.height;

    this.video
      .setDisplaySize(canvasW, canvasH)
      .setPosition(canvasW / 2, canvasH / 2);
  }

  create() {
    window.dispatchEvent(new CustomEvent('sceneChange',   { detail: 'RegisterScene' }));
    window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { open: false } }));

    this._hideCssEl = document.createElement('style');
    this._hideCssEl.id = '__hide_sidebar_in_register';
    this._hideCssEl.textContent = `
      .menu-icon { display: none !important; visibility: hidden !important; }
      .sidebar   { display: none !important; visibility: hidden !important; }
    `;
    document.head.appendChild(this._hideCssEl);

    ['deduction-board', 'dialog-log', 'deduction-result'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    if (this.scene?.manager) {
      this.scene.manager.scenes.forEach(s => {
        if (s?.sys?.settings?.key && s.sys.settings.key !== 'RegisterScene') {
          try { this.scene.stop(s.sys.settings.key); } catch {}
        }
      });
    }

    this.input.once('pointerdown', () => safeResume(this));
    bindVisibility(this, 'RegisterScene');

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

    /* =========================
       Tło wideo
       ========================= */
    this.video = this.add.video(0, 0, 'bgVideo')
      .setMute(true)
      .setLoop(true)
      .setDepth(-1)
      .setOrigin(0.5);

    try { this.video.play(true); } catch {}

    this.video.on('play', () => {
      this._resizeBgVideo();
    });
    this._resizeBgVideo();

    /* =========================
       Przycisk mute
       ========================= */
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

    /* =========================
       Obsługa resize
       ========================= */
    this._onResizeMute = (gameSize) => {
      const w = gameSize?.width ?? this.scale.width;
      const h = gameSize?.height ?? this.scale.height;
      this.muteBtn?.setPosition(w - btnSize - pad, h - btnSize - pad);
      this._resizeBgVideo();
    };
    this.scale.on('resize', this._onResizeMute);

    /* =========================
       UI formularza rejestracji
       ========================= */
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
    Object.assign(passWrapper.style, { position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' });

    const passInput = document.createElement('input');
    passInput.className = 'login-input';
    passInput.type = 'password';
    passInput.placeholder = 'Hasło';
    passInput.style.flex = '1 1 auto';

    const togglePass = document.createElement('span');
    togglePass.innerText = '🧿';
    togglePass.className = 'toggle-password';
    Object.assign(togglePass.style, {
      position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
      cursor: 'pointer', color: '#b983ff', textShadow: '0 0 6px #a96fff'
    });
    togglePass.onclick = () => { passInput.type = passInput.type === 'password' ? 'text' : 'password'; };

    const pwTip = document.createElement('div');
    pwTip.className = 'pw-tooltip';
    Object.assign(pwTip.style, {
      position: 'absolute', top: '50%', left: 'calc(100% + 10px)', transform: 'translateY(-50%)',
      background: '#1b0a2c', border: '1px solid #8e4dff', boxShadow: '0 10px 25px rgba(0,0,0,.35)',
      borderRadius: '10px', padding: '10px 12px', color: '#fff', fontFamily: 'Monaco, monospace',
      fontSize: '12px', width: '230px', zIndex: '9999', display: 'none',
    });

    const arrow = document.createElement('div');
    Object.assign(arrow.style, {
      position: 'absolute', left: '-6px', top: '50%', transform: 'translateY(-50%)',
      width: '0', height: '0',
      borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
      borderRight: '6px solid #8e4dff', filter: 'drop-shadow(0 0 4px rgba(142,77,255,.6))'
    });
    pwTip.appendChild(arrow);

    const tipTitle = document.createElement('div');
    tipTitle.textContent = 'Wymagania hasła';
    Object.assign(tipTitle.style, { fontSize: '12px', marginBottom: '6px', textShadow: '0 0 6px #b983ff' });
    pwTip.appendChild(tipTitle);

    const checklist = document.createElement('ul');
    Object.assign(checklist.style, { listStyle: 'none', padding: 0, margin: 0 });
    const RULE_KEYS = [
      'MIN_LEN','LOWERCASE_REQUIRED','UPPERCASE_REQUIRED','DIGIT_REQUIRED',
      'SPECIAL_REQUIRED','NO_SPACES','CONTAINS_LOGIN','CONTAINS_EMAIL','COMMON_PASSWORD'
    ];
    const items = {};
    RULE_KEYS.forEach(k => {
      const li = document.createElement('li');
      li.dataset.issue = k;
      li.innerHTML = `❌ ${ISSUE_LABEL[k] || k}`;
      li.style.margin = '3px 0';
      items[k] = li;
      checklist.appendChild(li);
    });
    pwTip.appendChild(checklist);

    const infoBadge = document.createElement('span');
    infoBadge.textContent = 'ℹ️';
    Object.assign(infoBadge.style, {
      position: 'absolute', right: '38px', top: '50%', transform: 'translateY(-50%)',
      fontSize: '14px', color: '#b983ff', cursor: 'pointer', userSelect: 'none', textShadow: '0 0 6px #a96fff'
    });

    passWrapper.append(passInput, togglePass, infoBadge, pwTip);

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

    /* =========================
       Akceptacja regulaminu
       ========================= */
    const termsRow = document.createElement('label');
    Object.assign(termsRow.style, {
      display: 'flex', alignItems: 'center', gap: '10px',
      fontFamily: 'Monaco, monospace', fontSize: '12px', color: '#fff', marginTop: '6px', userSelect: 'none'
    });
    const termsCheckbox = document.createElement('input');
    termsCheckbox.type = 'checkbox';
    termsCheckbox.id = 'termsCheck';
    termsCheckbox.style.transform = 'scale(1.2)';
    termsCheckbox.style.cursor = 'pointer';

    const termsText = document.createElement('span');
    termsText.textContent = 'Akceptuję regulamin i politykę prywatności.';

    termsRow.append(termsCheckbox, termsText);

    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';

    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'login-button';
    submitBtn.innerText = 'UTWÓRZ KONTO';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '.6';
    submitBtn.style.cursor = 'not-allowed';

    const syncSubmitEnabled = () => {
      const on = termsCheckbox.checked;
      submitBtn.disabled = !on;
      submitBtn.style.opacity = on ? '1' : '.6';
      submitBtn.style.cursor = on ? 'pointer' : 'not-allowed';
    };
    termsCheckbox.addEventListener('change', syncSubmitEnabled);

    const spinner = document.createElement('div');
    spinner.className = 'spinner hidden';

    const backToLogin = document.createElement('div');
    backToLogin.className = 'register-toggle-text';
    backToLogin.innerText = 'Masz konto? Zaloguj się';
    backToLogin.onclick = () => {
      sfx('click', { volume: 0.8, detune: 50 });
      this.scene.start('LoginScene');
      this.scene.stop('RegisterScene');
    };

    const legalLink = document.createElement('div');
    legalLink.className = 'register-toggle-text';
    legalLink.innerText = 'Zobacz regulamin i politykę prywatności';
    legalLink.onclick = () => {
      sfx('click', { volume: 0.8, detune: 50 });
      try { if (ui) ui.innerHTML = ''; } catch {}
      this.scene.start('LegalScene');
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
      termsRow,
      errorMsg,
      successMsg,
      submitBtn,
      spinner,
      legalLink,
      backToLogin
    );
    if (ui) ui.appendChild(form);

    /* =========================
       Walidacja hasła i submit
       ========================= */
    const errorMap = {
      MISSING_FIELDS: 'Uzupełnij wszystkie pola.',
      BAD_EMAIL: 'Podaj prawidłowy adres e-mail.',
      WEAK_PASSWORD: 'Hasło nie spełnia wymagań.',
      LOGIN_TAKEN: 'Ten login jest już zajęty.',
      EMAIL_TAKEN: 'Ten e-mail jest już w użyciu.',
      DUPLICATE: 'Login lub e-mail jest już używany.',
      SERVER_ERROR: 'Błąd serwera. Spróbuj ponownie.',
    };

    const renderPwIssues = (pw, ctx) => {
      const res = validatePasswordFront(pw, ctx);
      const unmet = new Set(res.issues);
      RULE_KEYS.forEach(k => {
        const li = items[k];
        if (!li) return;
        const ok = !unmet.has(k);
        li.innerHTML = `${ok ? '✅' : '❌'} ${ISSUE_LABEL[k] || k}`;
        li.style.opacity = ok ? '0.8' : '1';
      });
      return res;
    };

    const liveCtx = () => ({ login: loginInput.value.trim(), email: emailInput.value.trim() });

    const positionTip = () => {
      if (window.innerWidth <= 720) {
        Object.assign(pwTip.style, {
          position: 'absolute',
          left: '0',
          top: 'calc(100% + 8px)',
          transform: 'none',
          width: 'min(92vw, 320px)'
        });
        Object.assign(arrow.style, {
          left: '12px',
          top: '-6px',
          transform: 'none',
          borderRight: '6px solid transparent',
          borderLeft: '6px solid transparent',
          borderTop: 'none',
          borderBottom: '6px solid #8e4dff'
        });
      } else {
        Object.assign(pwTip.style, {
          left: 'calc(100% + 10px)',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '230px'
        });
        Object.assign(arrow.style, {
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderBottom: '6px solid transparent',
          borderTop: '6px solid transparent',
          borderRight: '6px solid #8e4dff',
          borderLeft: 'none'
        });
      }
    };

    const showTip = () => { pwTip.style.display = 'block'; positionTip(); };
    const hideTip = () => { pwTip.style.display = 'none'; };

    passInput.addEventListener('focus', showTip);
    passInput.addEventListener('blur', hideTip);
    infoBadge.addEventListener('mouseenter', showTip);
    infoBadge.addEventListener('mouseleave', () => {
      if (document.activeElement !== passInput) hideTip();
    });
    window.addEventListener('resize', positionTip);

    passInput.addEventListener('input', () => renderPwIssues(passInput.value, liveCtx()));
    loginInput.addEventListener('input', () => renderPwIssues(passInput.value, liveCtx()));
    emailInput.addEventListener('input', () => renderPwIssues(passInput.value, liveCtx()));
    renderPwIssues('', liveCtx());
    syncSubmitEnabled();

    let submitting = false;
    const submit = async () => {
      if (submitting) return;

      const login = loginInput.value.trim();
      const email = emailInput.value.trim();
      const pass1 = passInput.value;
      const pass2 = pass2Input.value;

      errorMsg.innerText = '';
      successMsg.innerText = '';

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!login || !email || !pass1 || !pass2) {
        sfx('error', { volume: 0.9 });
        errorMsg.innerText = errorMap.MISSING_FIELDS;
        return;
      }
      if (!emailRe.test(email)) {
        sfx('error', { volume: 0.9 });
        errorMsg.innerText = errorMap.BAD_EMAIL;
        return;
      }
      if (!termsCheckbox.checked) {
        sfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Aby utworzyć konto, musisz zaakceptować regulamin.';
        termsCheckbox.focus();
        return;
      }

      const localPw = validatePasswordFront(pass1, { login, email });
      if (!localPw.ok) {
        sfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Hasło nie spełnia wymagań (zobacz dymek obok pola hasła).';
        showTip();
        renderPwIssues(pass1, { login, email });
        return;
      }
      if (pass1 !== pass2) {
        sfx('error', { volume: 0.9 });
        errorMsg.innerText = 'Hasła muszą być takie same';
        return;
      }

      sfx('click', { volume: 0.8, detune: 50 });
      submitting = true;
      spinner.classList.remove('hidden');

      try {
        const res = await fetch(`${API}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, email, password: pass1 })
        });

        let payload = {};
        try { payload = await res.json(); } catch {}

        if (!res.ok) {
          const code = payload?.error;
          if (code === 'WEAK_PASSWORD') {
            errorMsg.innerText = 'Hasło nie spełnia wymagań.';
            const unmet = new Set(Array.isArray(payload?.issues) ? payload.issues : []);
            RULE_KEYS.forEach(k => {
              const li = items[k]; if (!li) return;
              const ok = !unmet.has(k);
              li.innerHTML = `${ok ? '✅' : '❌'} ${ISSUE_LABEL[k] || k}`;
              li.style.opacity = ok ? '0.8' : '1';
            });
            showTip(); sfx('error', { volume: 0.9 }); return;
          }

          const msg =
            (code && errorMap[code]) ||
            (res.status === 409 ? errorMap.DUPLICATE : `Błąd (${res.status})`);
          errorMsg.innerText = msg;
          sfx('error', { volume: 0.9 });
          return;
        }

        successMsg.innerText = 'Konto utworzone! Przekierowuję do logowania…';
        localStorage.setItem('lastLogin', login);
        sfx('click', { volume: 0.8, detune: 50 });

        setTimeout(() => {
          if (ui) ui.innerHTML = '';
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
          this.scene.start('LoginScene');
          this.scene.stop('RegisterScene');
        }, 800);
      } catch {
        errorMsg.innerText = 'Brak połączenia z serwerem.';
        sfx('error', { volume: 0.9 });
      } finally {
        spinner.classList.add('hidden');
        submitting = false;
      }
    };

    [loginInput, emailInput, passInput, pass2Input].forEach(el => {
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    });
    submitBtn.onclick = submit;

    /* =========================
       Cleanup
       ========================= */
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try {
        window.removeEventListener('resize', positionTip);
        if (this._onResizeMute) { this.scale.off('resize', this._onResizeMute); this._onResizeMute = null; }
        if (this._onGlobalMuteChanged) { this.game.registry.events.off('changedata-globalMuted', this._onGlobalMuteChanged); this._onGlobalMuteChanged = null; }
        unbindVisibility('RegisterScene');
        if (this._hideCssEl?.parentNode) this._hideCssEl.parentNode.removeChild(this._hideCssEl);
        this._hideCssEl = null;
        this.muteBtn?.destroy(); this.muteBtn = null;
        if (this.video) {
          try { this.video.stop(); } catch {}
          this.video.destroy(); this.video = null;
        }
        if (this.ambient) {
          this.ambient.stop();
          this.ambient.destroy();
          this.ambient = null;
        }
        this.sound.removeByKey && this.sound.removeByKey('ambient');
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