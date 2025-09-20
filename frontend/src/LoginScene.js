import Phaser from 'phaser';
import './LoginScene.css';

class LoginScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginScene' });
    }

    preload() {
        this.load.video('bgVideo', 'assets/backgroundvideo.mp4', 'canplaythrough', false, true);
        this.load.audio('click', 'assets/click.mp3');
        this.load.audio('error', 'assets/error.mp3');
        this.load.audio('ambient', 'assets/ambient.mp3');
    }

    create() {
        // ⬅️ Powiadamiamy App.js, że jesteśmy w scenie logowania
		// wyczyść DOM zawsze po wejściu na login
		window.dispatchEvent(new CustomEvent('sceneChange', { detail: 'LoginScene' }));
		['deduction-board', 'dialog-log'].forEach(id => {
		  const el = document.getElementById(id);
		  if (el) el.remove();
		});

		// (opcjonalnie) upewnij się, że żadna inna scena nie jest aktywna
		if (this.scene && this.scene.manager) {
		  this.scene.manager.scenes.forEach(s => {
			if (s && s.sys && s.sys.settings && s.sys.settings.key !== 'LoginScene') {
			  this.scene.stop(s.sys.settings.key);
			}
		  });
		}

        const { width, height } = this.sys.game.canvas;

        this.ambient = this.sound.add('ambient', { loop: true, volume: 0.3 });
        this.ambient.play();
		
		// === PRZYCISK WYCISZENIA MUZYKI NA LOGIN ===
		this._ambientMuted = false;

		const btnSize = 40;
		const pad = 20;

		this.muteBtn = this.add.text(
		  this.scale.width - btnSize - pad,
		  this.scale.height - btnSize - pad,
		  this._ambientMuted ? '🔇' : '🔊',
		  {
			fontFamily: 'Monaco, monospace',
			fontSize: '28px',
			color: '#FFFFFF',
		  }
		)
		.setInteractive({ cursor: 'pointer' })
		.setScrollFactor(0)
		.setDepth(2000);

		// kliknięcie: pauzuj/wznów ambient
		this.muteBtn.on('pointerdown', (pointer) => {
		  if (pointer?.event?.stopImmediatePropagation) pointer.event.stopImmediatePropagation();
		  if (pointer?.event?.stopPropagation) pointer.event.stopPropagation();

		  this._ambientMuted = !this._ambientMuted;
		  if (this._ambientMuted) {
			this.ambient.pause();
			this.muteBtn.setText('🔇');
		  } else {
			this.ambient.resume();
			this.muteBtn.setText('🔊');
		  }
		});

		// aktualizacja pozycji przy zmianie rozmiaru okna
		this.scale.on('resize', (gameSize) => {
		  this.muteBtn?.setPosition(gameSize.width - btnSize - pad, gameSize.height - btnSize - pad);
		});


        const click = this.sound.add('click');
        const error = this.sound.add('error');

        this.input.on('pointerdown', () => {
            if (click) click.play();
        });

        this.video = this.add.video(0, 0, 'bgVideo');
        this.video.setMute(true);
        this.video.setLoop(true);
        this.video.play(true);
        this.video.setDepth(-1);
        this.video.setDisplaySize(300, 150);
        this.video.setOrigin(0.5, 0.5);
        this.video.setPosition(width / 2, height / 2);

        const loginUI = document.getElementById('login-ui');
        loginUI.innerHTML = '';

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
        togglePass.style.position = 'absolute';
        togglePass.style.top = '50%';
        togglePass.style.right = '12px';
        togglePass.style.transform = 'translateY(-50%)';
        togglePass.style.cursor = 'pointer';
        togglePass.style.color = '#b983ff';
        togglePass.style.textShadow = '0 0 6px #a96fff';
        togglePass.onclick = () => {
            passInput.type = passInput.type === 'password' ? 'text' : 'password';
        };

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
            console.log('Kliknięto rejestrację');
        };

        const isSubmitting = { value: false };

        const self = this;
        const submit = () => {
            if (isSubmitting.value) return;

            const username = loginInput.value.trim();
            const password = passInput.value.trim();
            errorMsg.innerText = '';

            if (!username || !password) {
                if (error) error.play();
                errorMsg.innerText = 'Wszystkie pola są wymagane';
                return;
            }

            if (click) click.play();
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
                .then(() => {
                    localStorage.setItem('lastLogin', username);
                    loginUI.innerHTML = '';

                    self.video.stop();
                    self.video.destroy();
					
					// 🔇 wyłącz ambient z loginu, żeby nie grał dalej
					if (self.ambient) {
					  self.ambient.stop();
					  self.ambient.destroy();
					  self.ambient = null;
					}
					self.sound.removeByKey && self.sound.removeByKey('ambient');

                    self.scene.start('LevelSelect');
                    self.scene.stop('LoginScene');
                })
                .catch(() => {
                    errorMsg.innerText = 'Login lub hasło nieprawidłowe';
                    if (error) error.play();
                })
                .finally(() => {
                    isSubmitting.value = false;
                    spinner.classList.add('hidden');
                });
        };

        loginInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
        });
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') submit();
        });
        loginBtn.onclick = submit;

        const formContainer = document.createElement('div');
        formContainer.className = 'form-container';

        formContainer.appendChild(title);
        formContainer.appendChild(loginInput);
        formContainer.appendChild(passWrapper);
        formContainer.appendChild(errorMsg);
        formContainer.appendChild(loginBtn);
        formContainer.appendChild(spinner);
        formContainer.appendChild(registerToggle);

        loginUI.appendChild(formContainer);
		
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
		  try {
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