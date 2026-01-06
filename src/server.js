// src/server.js
require('dotenv/config');

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const { registerAiDialogRoutes } = require('./aiDialogRoutes');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

/* =====================================================
   CORS
   ===================================================== */

const FRONTEND_BASE_URL =
  process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

const ALLOWED_ORIGINS = [
  FRONTEND_BASE_URL,
  'https://investigationin10rooms.netlify.app',
  ...String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
].filter(Boolean);

const isLocalhost = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin || '');

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (isLocalhost(origin)) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    console.warn('CORS blocked for origin:', origin);
    cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false,
};

app.use(cors(corsOptions));
app.use((req, res, next) =>
  req.method === 'OPTIONS' ? res.sendStatus(204) : next()
);

/* =====================================================
   Health
   ===================================================== */

app.get('/health', (_req, res) => res.json({ ok: true }));

/* =====================================================
   DB
   ===================================================== */

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sledztwo_w_10_pokojach',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: { rejectUnauthorized: false },
});

/* =====================================================
   Mailer / reset hasła 
   ===================================================== */

const RESET_TOKEN_TTL_MIN = Number(process.env.RESET_TOKEN_TTL_MIN || 30);

// Resend HTTP API
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

const RAW_RESEND_FROM =
  process.env.RESEND_FROM ||
  'Śledztwo w 10 pokojach <no-reply@example.com>';

const RESEND_FROM = RAW_RESEND_FROM.replace(/^['"]+|['"]+$/g, '').trim();

console.log('📨 Mailer: RESEND_FROM =', RESEND_FROM);

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
// FROM dla SMTP:
const SMTP_FROM =
  process.env.SMTP_FROM || RESEND_FROM || SMTP_USER || 'no-reply@example.com';

let transporter = null;
let resendClient = null;

/**
 * Transporter SMTP
 * - używany jako fallback (lokalnie / gdy SMTP jest skonfigurowane)
 * - jeśli NIC nie ma, dev fallback = Ethereal
 */
async function getTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    console.log('📨 Mailer: start konfiguracji SMTP');
    console.log('   host =', SMTP_HOST);
    console.log('   port =', SMTP_PORT);
    console.log('   user =', SMTP_USER);
    console.log('   from =', SMTP_FROM);

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    transporter
      .verify()
      .then(() => {
        console.log('📨 Mailer: transport SMTP zweryfikowany OK.');
      })
      .catch((err) => {
        console.error('❌ Mailer verify error:', err.message || err);
      });

    console.log('📨 Mailer: skonfigurowano transport SMTP (produkcyjny).');
    return transporter;
  }

  // DEV fallback – Ethereal (tylko lokalnie / bez SMTP)
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log(
    '📨 Mailer: tryb DEV (Ethereal) — w konsoli pojawi się link „preview”.'
  );
  return transporter;
}

/**
 * Wysyłka maila resetującego:
 * 1) Najpierw Resend HTTP API (HTTPS – działa na Renderze).
 * 2) Jeśli brak RESEND_API_KEY lub błąd – fallback do SMTP/Ethereal.
 */
async function sendResetEmail({ to, login, resetLink, html }) {
  // 1) Resend HTTP API 
  if (RESEND_API_KEY) {
    try {
      if (!resendClient) {
        resendClient = new Resend(RESEND_API_KEY);
        console.log(
          '📨 Mailer: używam Resend HTTP API (from =',
          RESEND_FROM,
          ').'
        );
      }

      const result = await resendClient.emails.send({
        from: RESEND_FROM,
        to,
        subject: 'Reset hasła — Śledztwo w 10 pokojach',
        html,
      });

      console.log(
        '📬 Resend API response for',
        to,
        ':',
        JSON.stringify(result, null, 2)
      );

      if (result && result.error) {
        throw new Error(result.error.message || 'Resend returned error');
      }

      console.log('✅ Resend: mail zaakceptowany do wysyłki dla:', to);
      return;
    } catch (err) {
      console.error('❌ Resend mail error:', err?.message || err);
      console.log('🔗 [DEV] Link resetu (fallback):', resetLink);
    }
  }

  // 2) Fallback – SMTP / Ethereal
  try {
    const tx = await getTransporter();
    if (!tx) {
      console.error('❌ Brak skonfigurowanego mailera (SMTP/Resend).');
      console.log('🔗 [DEV] Link resetu (fallback):', resetLink);
      return;
    }

    tx.sendMail(
      {
        from: SMTP_FROM,
        to,
        subject: 'Reset hasła — Śledztwo w 10 pokojach',
        html,
      },
      (mailErr, info) => {
        if (mailErr) {
          console.error('❌ Mail error (SMTP/Ethereal):', mailErr);
          console.log('🔗 [DEV] Link resetu (fallback):', resetLink);
        } else {
          console.log('📬 Mail wysłany (SMTP/Ethereal), id:', info.messageId);
          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) {
            console.log('📬 Podgląd maila (Ethereal):', preview);
          }
        }
      }
    );
  } catch (mailErr) {
    console.error('❌ Mailer init error (SMTP/Ethereal):', mailErr);
    console.log('🔗 [DEV] Link resetu (fallback):', resetLink);
  }
}

/* =====================================================
   Schema 
   ===================================================== */

db.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  }
  console.log('✅ MySQL connected');

  db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      login VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  db.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token (token_hash),
      INDEX idx_user (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  db.query(
    'CREATE INDEX idx_level_time ON level_progress (level_key, best_time_ms)',
    (e) => {
      if (e && e.errno !== 1061) {
        console.warn('ℹ️ idx_level_time not created:', e.message);
      }
    }
  );
});

/* =====================================================
   Helpers
   ===================================================== */

const sanitize = (s) => (typeof s === 'string' ? s.trim() : '');
const basicEmailOk = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const PASSWORD_RULES = { MIN_LEN: 8, MAX_LEN: 72 };
const COMMON_PASSWORDS = new Set([
  '123456',
  '123456789',
  '12345678',
  'password',
  'qwerty',
  '111111',
  'abc123',
  '123123',
  '12345',
  'password1',
  'qwerty123',
  'zaq12wsx',
  'iloveyou',
  'admin',
]);

function validatePassword(password, { login, email } = {}) {
  const issues = [];
  if (typeof password !== 'string' || password.length === 0) {
    return { ok: false, issues: ['REQUIRED'] };
  }
  if (/\s/.test(password)) issues.push('NO_SPACES');
  if (password.length < PASSWORD_RULES.MIN_LEN) issues.push('MIN_LEN');
  if (password.length > PASSWORD_RULES.MAX_LEN) issues.push('MAX_LEN');
  if (!/[a-z]/.test(password)) issues.push('LOWERCASE_REQUIRED');
  if (!/[A-Z]/.test(password)) issues.push('UPPERCASE_REQUIRED');
  if (!/\d/.test(password)) issues.push('DIGIT_REQUIRED');
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('SPECIAL_REQUIRED');

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) issues.push('COMMON_PASSWORD');

  const loginLower = (login || '').toLowerCase();
  if (loginLower && lower.includes(loginLower)) issues.push('CONTAINS_LOGIN');

  const emailLocalLower = ((email || '').split('@')[0] || '').toLowerCase();
  if (emailLocalLower && lower.includes(emailLocalLower)) {
    issues.push('CONTAINS_EMAIL');
  }

  return { ok: issues.length === 0, issues };
}

const sha256hex = (s) =>
  crypto.createHash('sha256').update(s, 'utf8').digest('hex');

const toMySQLDateTime = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/* =====================================================
   Auth: login
   ===================================================== */

app.post('/login', (req, res) => {
  let { login, password } = req.body || {};
  login = sanitize(login);
  password = sanitize(password);
  if (!login || !password) {
    return res.status(400).json({ message: 'Brak loginu lub hasła' });
  }

  db.query(
    'SELECT id, login, email, password_hash FROM users WHERE login = ? LIMIT 1',
    [login],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: 'Błąd serwera' });
      if (!rows?.length) {
        return res.status(401).json({ message: 'Nieprawidłowy login' });
      }

      const user = rows[0];
      try {
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          return res.status(401).json({ message: 'Nieprawidłowe hasło' });
        }
        res.json({
          message: 'Zalogowano',
          user: { id: user.id, login: user.login, email: user.email },
        });
      } catch {
        res.status(500).json({ message: 'Błąd serwera' });
      }
    }
  );
});

/* =====================================================
   Auth: register
   ===================================================== */

app.post('/register', async (req, res) => {
  try {
    let { login, email, password } = req.body || {};
    login = sanitize(login);
    email = sanitize(email);
    password = typeof password === 'string' ? password : '';

    if (!login || !email || !password) {
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
    }
    if (!basicEmailOk(email)) {
      return res.status(400).json({ ok: false, error: 'BAD_EMAIL' });
    }

    const pw = validatePassword(password, { login, email });
    if (!pw.ok) {
      return res.status(400).json({
        ok: false,
        error: 'WEAK_PASSWORD',
        issues: pw.issues,
        rules: {
          minLen: PASSWORD_RULES.MIN_LEN,
          maxLen: PASSWORD_RULES.MAX_LEN,
        },
      });
    }

    db.query(
      'SELECT id, login, email FROM users WHERE login = ? OR email = ? LIMIT 1',
      [login, email],
      async (err, rows) => {
        if (err) {
          return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
        }

        if (rows?.length) {
          const row = rows[0];
          if (row.login === login) {
            return res.status(409).json({ ok: false, error: 'LOGIN_TAKEN' });
          }
          if (row.email === email) {
            return res.status(409).json({ ok: false, error: 'EMAIL_TAKEN' });
          }
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
                  if (msg.includes('login')) {
                    return res
                      .status(409)
                      .json({ ok: false, error: 'LOGIN_TAKEN' });
                  }
                  if (msg.includes('email')) {
                    return res
                      .status(409)
                      .json({ ok: false, error: 'EMAIL_TAKEN' });
                  }
                  return res
                    .status(409)
                    .json({ ok: false, error: 'DUPLICATE' });
                }
                return res
                  .status(500)
                  .json({ ok: false, error: 'SERVER_ERROR' });
              }
              res.status(201).json({ ok: true, id: result.insertId });
            }
          );
        } catch {
          res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
        }
      }
    );
  } catch {
    res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

/* =====================================================
   Password reset: request
   ===================================================== */

async function requestResetHandler(req, res) {
  const loginOrEmail = sanitize(
    req.body?.loginOrEmail || req.body?.identifier || ''
  );
  if (!loginOrEmail) {
    return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
  }

  db.query(
    'SELECT id, email, login FROM users WHERE login = ? OR email = ? LIMIT 1',
    [loginOrEmail, loginOrEmail],
    async (err, rows) => {
      if (err) {
        console.error('DB error in request-reset:', err);
        return res.json({
          ok: true,
          message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.',
        });
      }
      if (!rows?.length) {
        return res.json({
          ok: true,
          message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.',
        });
      }

      const user = rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = sha256hex(token);
      const expiresAt = toMySQLDateTime(
        new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60 * 1000)
      );

      db.query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, tokenHash, expiresAt],
        async (e2) => {
          if (e2) {
            console.error('DB error inserting password_resets:', e2);
            return res.json({
              ok: true,
              message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.',
            });
          }

          const resetLink = `${FRONTEND_BASE_URL}/?scene=ResetPasswordScene&token=${token}`;
          const html = `
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222">
              <p>Witaj ${user.login},</p>
              <p>Aby ustawić nowe hasło, kliknij:</p>
              <p><a href="${resetLink}">${resetLink}</a></p>
              <p>Link wygaśnie za ${RESET_TOKEN_TTL_MIN} minut.</p>
            </div>
          `;

          sendResetEmail({
            to: user.email,
            login: user.login,
            resetLink,
            html,
          }).catch((errSend) => {
            console.error(
              '❌ sendResetEmail error:',
              errSend?.message || errSend
            );
          });

          res.json({
            ok: true,
            message: 'Jeśli konto istnieje, wyślemy link do resetu hasła.',
          });
        }
      );
    }
  );
}

app.post('/auth/request-reset', requestResetHandler);
app.post('/password/forgot', requestResetHandler);

/* =====================================================
   Password reset: confirm
   ===================================================== */

app.post('/auth/reset-password', async (req, res) => {
  const token = req.body?.token || '';
  const password =
    typeof req.body?.password === 'string' ? req.body.password : '';
  if (!token || !password) {
    return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
  }

  const pw = validatePassword(password);
  if (!pw.ok) {
    return res.status(400).json({
      ok: false,
      error: 'WEAK_PASSWORD',
      issues: pw.issues,
      rules: {
        minLen: PASSWORD_RULES.MIN_LEN,
        maxLen: PASSWORD_RULES.MAX_LEN,
      },
    });
  }

  const tokenHash = sha256hex(token);

  db.query(
    `SELECT pr.user_id AS userId
     FROM password_resets pr
     WHERE pr.token_hash = ? AND pr.expires_at > NOW()
     ORDER BY pr.id DESC LIMIT 1`,
    [tokenHash],
    async (err, rows) => {
      if (err)
        return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      if (!rows?.length) {
        return res.status(400).json({ ok: false, error: 'INVALID_TOKEN' });
      }

      const userId = rows[0].userId;
      try {
        const hash = await bcrypt.hash(password, 10);
        db.query(
          'UPDATE users SET password_hash = ? WHERE id = ?',
          [hash, userId],
          (e2) => {
            if (e2) {
              return res
                .status(500)
                .json({ ok: false, error: 'SERVER_ERROR' });
            }
            db.query(
              'DELETE FROM password_resets WHERE user_id = ?',
              [userId],
              () => {
                res.json({ ok: true, message: 'Hasło zostało zmienione.' });
              }
            );
          }
        );
      } catch {
        res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      }
    }
  );
});

/* =====================================================
   AI dialog – rejestracja tras
   ===================================================== */

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  AI dialog (/ai/dialog) wyłączony – brak OPENAI_API_KEY w .env');
} else {
  console.log('🤖 AI dialog (/ai/dialog) włączony – OPENAI_API_KEY wykryty.');
}

registerAiDialogRoutes(app);

/* =====================================================
   Progress / Leaderboard
   ===================================================== */

app.post('/progress', (req, res) => {
  let { userId, levelKey, timeMs, completed } = req.body || {};
  userId = Number(userId) || 0;
  levelKey = sanitize(levelKey);
  timeMs = Number(timeMs);
  completed = Number(completed ? 1 : 0);

  if (!userId || !levelKey) {
    return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
  }
  if (!Number.isFinite(timeMs) || timeMs < 0) timeMs = null;

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
      return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
    }

    db.query(
      'SELECT completed, best_time_ms, updated_at FROM level_progress WHERE user_id = ? AND level_key = ? LIMIT 1',
      [userId, levelKey],
      (e2, rows) => {
        if (e2) return res.status(200).json({ ok: true });
        const row = rows?.[0] || null;
        res.status(200).json({
          ok: true,
          levelKey,
          completed: row ? !!row.completed : !!completed,
          bestTimeMs: row ? row.best_time_ms : timeMs ?? null,
          updatedAt: row ? row.updated_at : null,
        });
      }
    );
  });
});

app.get('/progress/:userId', (req, res) => {
  const userId = Number(req.params.userId) || 0;
  if (!userId) {
    return res.status(400).json({ ok: false, error: 'BAD_USER_ID' });
  }

  db.query(
    'SELECT level_key AS levelKey, completed, best_time_ms AS bestTimeMs, updated_at AS updatedAt FROM level_progress WHERE user_id = ? ORDER BY level_key',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      }
      res.json({ ok: true, progress: rows || [] });
    }
  );
});

app.get('/best-time', (req, res) => {
  const userId = Number(req.query.userId) || 0;
  const levelKey = sanitize(req.query.levelKey || '');
  if (!userId || !levelKey) {
    return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
  }

  db.query(
    'SELECT best_time_ms AS bestTimeMs FROM level_progress WHERE user_id = ? AND level_key = ? LIMIT 1',
    [userId, levelKey],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
      }
      res.json({
        ok: true,
        levelKey,
        bestTimeMs: rows?.[0]?.bestTimeMs ?? null,
      });
    }
  );
});

app.get('/leaderboard/:levelKey', (req, res) => {
  const levelKey = sanitize(req.params.levelKey || '');
  if (!levelKey) {
    return res.status(400).json({ ok: false, error: 'BAD_LEVEL_KEY' });
  }

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
      return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
    }
    const leaderboard = (rows || []).map((r, i) => ({
      rank: i + 1,
      login: r.login,
      bestTimeMs: r.best_time_ms,
      updatedAt: r.updated_at,
    }));
    res.json({ ok: true, leaderboard });
  });
});

app.get('/leaderboard', (req, res) => {
  const levelKey = sanitize(req.query.levelKey || '');
  if (!levelKey) {
    return res.status(400).json({ ok: false, error: 'BAD_LEVEL_KEY' });
  }

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
      return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
    }
    const leaderboard = (rows || []).map((r, i) => ({
      rank: i + 1,
      login: r.login,
      bestTimeMs: r.best_time_ms,
      updatedAt: r.updated_at,
    }));
    res.json({ ok: true, leaderboard });
  });
});

/* =====================================================
   Start
   ===================================================== */

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`✅ API listening on :${PORT}`);
});
