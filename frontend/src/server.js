// server.js
require('dotenv/config');

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();

// ── Middlewares ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// 🔧 Luźniejsze CORS: localhost/127.0.0.1 na dowolnym porcie
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
};
app.use(cors(corsOptions));

// ✅ ogólny handler preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// 🔎 endpoint zdrowia do szybkiego testu
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── DB (pool) ─────────────────────────────────────────────────────────────────
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sledztwo_w_10_pokojach',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // czytelniejsze daty w JSON
});

// dodatkowy health DB
app.get('/health/db', (_req, res) => {
  db.query('SELECT 1 AS ok', (err) => {
    if (err) return res.status(500).json({ ok: false, error: 'DB_DOWN' });
    res.json({ ok: true });
  });
});

// ── Mailer / Reset link config ────────────────────────────────────────────────
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
const RESET_TOKEN_TTL_MIN = Number(process.env.RESET_TOKEN_TTL_MIN || 30);
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@example.com';

let transporter = null;

// Lazy-init transportera:
// - jeśli podasz SMTP_* w .env → użyje ich
// - jeśli NIE podasz → utworzy konto testowe Ethereal i zwróci link podglądu maila w konsoli
async function getTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true dla 465, false dla 587/25
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    console.log('📨 Mailer: używam skonfigurowanego SMTP.');
    return transporter;
  }

  // DEV fallback: Ethereal
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('📨 Mailer: tryb DEV z Ethereal włączony (zobaczysz link „preview” w konsoli).');
  return transporter;
}

// ── Init schema ───────────────────────────────────────────────────────────────
db.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z MySQL!');

  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      login VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci;
  `;
  db.query(createUsers, (e) => {
    if (e) console.error('Błąd tworzenia tabeli users:', e);
    else console.log('ℹ️  Tabela users gotowa (OK / już istniała)');
  });

  const createProgress = `
    CREATE TABLE IF NOT EXISTS level_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      level_key VARCHAR(128) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      best_time_ms INT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_user_level (user_id, level_key),
      INDEX idx_user (user_id),
      INDEX idx_level_time (level_key, best_time_ms),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci;
  `;
  db.query(createProgress, (e) => {
    if (e) console.error('Błąd tworzenia tabeli level_progress:', e);
    else console.log('ℹ️  Tabela level_progress gotowa (OK / już istniała)');
  });

  // Tabela do resetów haseł – przechowujemy SHA-256 tokenu
  const createPasswordResets = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token (token_hash),
      INDEX idx_user (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci;
  `;
  db.query(createPasswordResets, (e) => {
    if (e) console.error('Błąd tworzenia tabeli password_resets:', e);
    else console.log('ℹ️  Tabela password_resets gotowa (OK / już istniała)');
  });

  // (Opcjonalne) utworzenie indeksu jeśli DB nie wsparła go powyżej
  db.query('CREATE INDEX idx_level_time ON level_progress (level_key, best_time_ms)', (e) => {
    if (e && e.errno !== 1061) {
      console.warn('ℹ️  Indeks idx_level_time nie został utworzony:', e.message);
    } else if (!e) {
      console.log('ℹ️  Indeks idx_level_time utworzony');
    }
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const sanitize = s => (typeof s === 'string' ? s.trim() : '');
const basicEmailOk = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Reguły siły hasła + walidator
const PASSWORD_RULES = { MIN_LEN: 8, MAX_LEN: 72 }; // 72 = bezpieczny limit dla bcrypt
const COMMON_PASSWORDS = new Set([
  '123456','123456789','12345678','password','qwerty','111111','abc123',
  '123123','12345','password1','qwerty123','zaq12wsx','iloveyou','admin'
]);

function validatePassword(password, { login, email } = {}) {
  const issues = [];
  if (typeof password !== 'string' || password.length === 0) {
    issues.push('REQUIRED');
    return { ok: false, issues };
  }
  if (/\s/.test(password)) issues.push('NO_SPACES'); // brak spacji
  if (password.length < PASSWORD_RULES.MIN_LEN) issues.push('MIN_LEN');
  if (password.length > PASSWORD_RULES.MAX_LEN) issues.push('MAX_LEN');
  if (!/[a-z]/.test(password)) issues.push('LOWERCASE_REQUIRED');
  if (!/[A-Z]/.test(password)) issues.push('UPPERCASE_REQUIRED');
  if (!/\d/.test(password))    issues.push('DIGIT_REQUIRED');
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('SPECIAL_REQUIRED');

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) issues.push('COMMON_PASSWORD');

  const loginLower = (login || '').toLowerCase();
  if (loginLower && lower.includes(loginLower)) issues.push('CONTAINS_LOGIN');

  const emailLocal = (email || '').split('@')[0] || '';
  const emailLocalLower = emailLocal.toLowerCase();
  if (emailLocalLower && lower.includes(emailLocalLower)) issues.push('CONTAINS_EMAIL');

  return { ok: issues.length === 0, issues };
}

const sha256hex = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const toMySQLDateTime = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
app.post('/login', (req, res) => {
  let { login, password } = req.body || {};
  login = sanitize(login);
  password = sanitize(password);

  console.log('🔐 Próba logowania:', login);

  if (!login || !password) {
    return res.status(400).json({ message: 'Brak loginu lub hasła' });
  }

  db.query(
    'SELECT id, login, email, password_hash FROM users WHERE login = ? LIMIT 1',
    [login],
    async (err, rows) => {
      if (err) {
        console.error('DB error /login:', err);
        return res.status(500).json({ message: 'Błąd serwera' });
      }
      if (!rows || !rows.length) {
        return res.status(401).json({ message: 'Nieprawidłowy login' });
      }

      const user = rows[0];
      try {
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ message: 'Nieprawidłowe hasło' });

        return res.json({
          message: 'Zalogowano',
          user: { id: user.id, login: user.login, email: user.email },
        });
      } catch (e) {
        console.error('BCrypt error /login:', e);
        return res.status(500).json({ message: 'Błąd serwera' });
      }
    }
  );
});

// ── REGISTER ──────────────────────────────────────────────────────────────────
app.post('/register', async (req, res) => {
  console.log('📝 /register hit, body =', req.body);

  try {
    let { login, email, password } = req.body || {};
    login = sanitize(login);
    email = sanitize(email);
    // ⬇️ nie przycinamy hasła – ważne dla walidacji i intencjonalnych znaków
    password = (typeof password === 'string') ? password : '';

    if (!login || !email || !password) {
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
    }
    if (!basicEmailOk(email)) {
      return res.status(400).json({ ok: false, error: 'BAD_EMAIL' });
    }

    // ✅ Walidacja siły hasła
    const pw = validatePassword(password, { login, email });
    if (!pw.ok) {
      return res.status(400).json({
        ok: false,
        error: 'WEAK_PASSWORD',
        issues: pw.issues, // np. ["MIN_LEN","UPPERCASE_REQUIRED","SPECIAL_REQUIRED"]
        rules: { minLen: PASSWORD_RULES.MIN_LEN, maxLen: PASSWORD_RULES.MAX_LEN }
      });
    }

    db.query(
      'SELECT id, login, email FROM users WHERE login = ? OR email = ? LIMIT 1',
      [login, email],
      async (err, rows) => {
        if (err) {
          console.error('DB error precheck /register:', err);
          return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
        }

        if (rows && rows.length) {
          const row = rows[0];
          if (row.login === login)
            return res.status(409).json({ ok: false, error: 'LOGIN_TAKEN' });
          if (row.email === email)
            return res.status(409).json({ ok: false, error: 'EMAIL_TAKEN' });
        }

        try {
          const hash = await bcrypt.hash(password, 10);
          db.query(
            'INSERT INTO users (login, email, password_hash) VALUES (?, ?, ?)',
            [login, email, hash],
            (e, result) => {
              if (e) {
                if (e.code === 'ER_DUP_ENTRY') {
                  const msg = e.sqlMessage || '';
                  if (msg.includes('login'))
                    return res.status(409).json({ ok: false, error: 'LOGIN_TAKEN' });
                  if (msg.includes('email'))
                    return res.status(409).json({ ok: false, error: 'EMAIL_TAKEN' });
                  return res.status(409).json({ ok: false, error: 'DUPLICATE' });
                }
                console.error('DB error insert /register:', e);
                return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
              }
              return res.status(201).json({ ok: true, id: result.insertId });
            }
          );
        } catch (hashErr) {
          console.error('BCrypt error /register:', hashErr);
          return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
        }
      }
    );
  } catch (e) {
    console.error('Fatal /register:', e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// ── PASSWORD RESET: request link ──────────────────────────────────────────────
// body: { loginOrEmail: string }
// Zwraca 200 zawsze (poza walidacją pustego pola) z komunikatem neutralnym.
async function requestResetHandler(req, res) {
  const loginOrEmail = sanitize(req.body?.loginOrEmail || req.body?.identifier || '');
  if (!loginOrEmail) {
    return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
  }

  db.query(
    'SELECT id, email, login FROM users WHERE login = ? OR email = ? LIMIT 1',
    [loginOrEmail, loginOrEmail],
    async (err, rows) => {
      if (err) {
        console.error('DB error /auth/request-reset:', err);
        // neutralny komunikat
        return res.json({ ok: true, message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.' });
      }

      // Jeśli brak użytkownika – udajemy sukces (neutralność)
      if (!rows || !rows.length) {
        return res.json({ ok: true, message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.' });
      }

      const user = rows[0];
      // generujemy token + zapisujemy hash w DB
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = sha256hex(token);
      const expires = new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60 * 1000);
      const expiresAt = toMySQLDateTime(expires);

      db.query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, tokenHash, expiresAt],
        async (e2) => {
          if (e2) {
            console.error('DB error insert password_resets:', e2);
            return res.json({ ok: true, message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.' });
          }

          const resetLink = `${FRONTEND_BASE_URL}/?scene=ResetPasswordScene&token=${token}`;
          const html = `
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222">
              <p>Witaj ${user.login},</p>
              <p>Otrzymaliśmy prośbę o reset hasła. Aby ustawić nowe hasło, kliknij w link poniżej:</p>
              <p><a href="${resetLink}">${resetLink}</a></p>
              <p>Link wygaśnie za ${RESET_TOKEN_TTL_MIN} minut.</p>
              <p>Jeśli to nie Ty prosiłeś o reset, po prostu zignoruj tę wiadomość.</p>
              <hr/>
              <p style="font-size:12px;color:#666">Ta wiadomość została wygenerowana automatycznie.</p>
            </div>
          `;

          try {
            const tx = await getTransporter();
            const info = await tx.sendMail({
              from: SMTP_FROM,
              to: user.email,
              subject: 'Reset hasła — Sledztwo w 10 pokojach',
              html,
            });

            // Podgląd w DEV (Ethereal)
            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) {
              console.log('📬 Podgląd maila (Ethereal):', preview);
            }
          } catch (mailErr) {
            console.error('❌ Błąd wysyłki e-maila resetu:', mailErr);
            // nawet jeśli mail padł, nie ujawniamy – neutralny komunikat
            console.log('🔗 [DEV] Link resetu hasła (fallback log):', resetLink);
          }

          return res.json({ ok: true, message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.' });
        }
      );
    }
  );
}

// Główna ścieżka
app.post('/auth/request-reset', requestResetHandler);
// Alias zgodny z Twoją sceną ForgotPasswordScene (POST /password/forgot)
app.post('/password/forgot', requestResetHandler);

// ── PASSWORD RESET: ustaw nowe hasło ──────────────────────────────────────────
// body: { token: string, password: string }
app.post('/auth/reset-password', async (req, res) => {
  const token = req.body?.token || '';
  // nie przycinamy hasła
  const password = (typeof req.body?.password === 'string') ? req.body.password : '';

  if (!token || !password) {
    return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
  }

  // najpierw zweryfikuj siłę hasła (login/email nieznane, więc tylko reguły ogólne)
  const pw = validatePassword(password);
  if (!pw.ok) {
    return res.status(400).json({
      ok: false,
      error: 'WEAK_PASSWORD',
      issues: pw.issues,
      rules: { minLen: PASSWORD_RULES.MIN_LEN, maxLen: PASSWORD_RULES.MAX_LEN }
    });
  }

  const tokenHash = sha256hex(token);

  // Sprawdzamy token: istnieje i nie wygasł
  db.query(
    `
      SELECT pr.user_id AS userId
      FROM password_resets pr
      WHERE pr.token_hash = ?
        AND pr.expires_at > NOW()
      ORDER BY pr.id DESC
      LIMIT 1
    `,
    [tokenHash],
    async (err, rows) => {
      if (err) {
        console.error('DB error /auth/reset-password select:', err);
        return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      }
      if (!rows || !rows.length) {
        return res.status(400).json({ ok: false, error: 'INVALID_TOKEN' });
      }

      const userId = rows[0].userId;

      try {
        const hash = await bcrypt.hash(password, 10);

        // Aktualizacja hasła
        db.query(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [hash, userId],
          (e2) => {
            if (e2) {
              console.error('DB error reset-password update:', e2);
              return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
            }

            // Usuwamy WSZYSTKIE tokeny resetu dla danego usera (unieważnienie starych)
            db.query(
              'DELETE FROM password_resets WHERE user_id = ?',
              [userId],
              (e3) => {
                if (e3) console.warn('⚠️  Nie udało się posprzątać tokenów resetu:', e3);
                return res.json({ ok: true, message: 'Hasło zostało zmienione.' });
              }
            );
          }
        );
      } catch (hashErr) {
        console.error('BCrypt error /auth/reset-password:', hashErr);
        return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      }
    }
  );
});

// ── PROGRESS: zapis najlepszego czasu i statusu poziomu ───────────────────────
app.post('/progress', (req, res) => {
  let { userId, levelKey, timeMs, completed } = req.body || {};
  userId = Number(userId) || 0;
  levelKey = sanitize(levelKey);
  timeMs = Number(timeMs);
  completed = Number(completed ? 1 : 0);

  if (!userId || !levelKey) {
    return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
  }
  if (!Number.isFinite(timeMs) || timeMs < 0) {
    timeMs = null; // pozwól zapisać sam completed bez czasu
  }

  const sql = `
    INSERT INTO level_progress (user_id, level_key, completed, best_time_ms)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      completed = GREATEST(level_progress.completed, VALUES(completed)),
      best_time_ms = 
        CASE 
          WHEN VALUES(best_time_ms) IS NULL THEN level_progress.best_time_ms
          WHEN level_progress.best_time_ms IS NULL THEN VALUES(best_time_ms)
          WHEN VALUES(completed) = 1 AND VALUES(best_time_ms) < level_progress.best_time_ms
            THEN VALUES(best_time_ms)
          ELSE level_progress.best_time_ms
        END,
      updated_at = CURRENT_TIMESTAMP
  `;

  db.query(sql, [userId, levelKey, completed, timeMs], (err) => {
    if (err) {
      console.error('DB error /progress UPSERT:', err);
      return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
    }

    db.query(
      'SELECT completed, best_time_ms, updated_at FROM level_progress WHERE user_id = ? AND level_key = ? LIMIT 1',
      [userId, levelKey],
      (e2, rows) => {
        if (e2) {
          console.error('DB error /progress SELECT:', e2);
          return res.status(200).json({ ok: true });
        }
        const row = rows && rows[0] ? rows[0] : null;
        return res.status(200).json({
          ok: true,
          levelKey,
          completed: row ? !!row.completed : !!completed,
          bestTimeMs: row ? row.best_time_ms : (timeMs ?? null),
          updatedAt: row ? row.updated_at : null,
        });
      }
    );
  });
});

// ── PROGRESS: pobranie progresu użytkownika ───────────────────────────────────
app.get('/progress/:userId', (req, res) => {
  const userId = Number(req.params.userId) || 0;
  if (!userId) return res.status(400).json({ ok: false, error: 'BAD_USER_ID' });

  db.query(
    'SELECT level_key AS levelKey, completed, best_time_ms AS bestTimeMs, updated_at AS updatedAt FROM level_progress WHERE user_id = ? ORDER BY level_key',
    [userId],
    (err, rows) => {
      if (err) {
        console.error('DB error /progress/:userId:', err);
        return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      }
      return res.json({ ok: true, progress: rows || [] });
    }
  );
});

// ── BEST TIME: pojedynczy rekord dla HUD ──────────────────────────────────────
app.get('/best-time', (req, res) => {
  const userId = Number(req.query.userId) || 0;
  const levelKey = sanitize(req.query.levelKey || '');
  if (!userId || !levelKey) return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });

  db.query(
    'SELECT best_time_ms AS bestTimeMs FROM level_progress WHERE user_id = ? AND level_key = ? LIMIT 1',
    [userId, levelKey],
    (err, rows) => {
      if (err) {
        console.error('DB error /best-time:', err);
        return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      }
      const bestTimeMs = (rows && rows[0]) ? rows[0].bestTimeMs : null;
      return res.json({ ok: true, levelKey, bestTimeMs });
    }
  );
});

// ── LEADERBOARD: Top 5 czasów dla poziomu ─────────────────────────────────────
app.get('/leaderboard/:levelKey', (req, res) => {
  const levelKey = sanitize(req.params.levelKey || '');
  console.log('GET /leaderboard/:levelKey ->', levelKey);
  if (!levelKey) return res.status(400).json({ ok: false, error: 'BAD_LEVEL_KEY' });

  const sql = `
    SELECT u.login, lp.best_time_ms, lp.updated_at
    FROM level_progress lp
    JOIN users u ON u.id = lp.user_id
    WHERE lp.level_key = ?
      AND lp.completed = 1
      AND lp.best_time_ms IS NOT NULL
    ORDER BY lp.best_time_ms ASC, lp.updated_at ASC
    LIMIT 5
  `;
  db.query(sql, [levelKey], (err, rows) => {
    if (err) {
      console.error('DB error /leaderboard:', err);
      return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
    }
    const leaderboard = (rows || []).map((r, i) => ({
      rank: i + 1,
      login: r.login,
      bestTimeMs: r.best_time_ms,
      updatedAt: r.updated_at
    }));
    return res.json({ ok: true, leaderboard });
  });
});

// ✅ Fallback: /leaderboard?levelKey=LevelOffice
app.get('/leaderboard', (req, res) => {
  const levelKey = sanitize(req.query.levelKey || '');
  console.log('GET /leaderboard?levelKey= ->', levelKey);
  if (!levelKey) return res.status(400).json({ ok: false, error: 'BAD_LEVEL_KEY' });

  const sql = `
    SELECT u.login, lp.best_time_ms, lp.updated_at
    FROM level_progress lp
    JOIN users u ON u.id = lp.user_id
    WHERE lp.level_key = ?
      AND lp.completed = 1
      AND lp.best_time_ms IS NOT NULL
    ORDER BY lp.best_time_ms ASC, lp.updated_at ASC
    LIMIT 5
  `;
  db.query(sql, [levelKey], (err, rows) => {
    if (err) {
      console.error('DB error /leaderboard (fallback):', err);
      return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
    }
    const leaderboard = (rows || []).map((r, i) => ({
      rank: i + 1,
      login: r.login,
      bestTimeMs: r.best_time_ms,
      updatedAt: r.updated_at
    }));
    return res.json({ ok: true, leaderboard });
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () =>
  console.log(`✅ Serwer API działa na http://localhost:${PORT}`)
);
