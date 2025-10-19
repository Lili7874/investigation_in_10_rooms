// server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

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

// ✅ ZAMIANA za app.options('*', ...): ogólny handler preflight bez wzorca ścieżki
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // cors() i tak doda nagłówki, ale dokładamy minimum aby natychmiast zwrócić 204
    res.sendStatus(204);
    return;
  }
  next();
});

// 🔎 endpoint zdrowia do szybkiego testu
app.get('/health', (req, res) => res.json({ ok: true }));

// ── DB ─────────────────────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sledztwo_w_10_pokojach',
});

db.connect(err => {
  if (err) {
    console.error('❌ Błąd połączenia z MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Połączono z MySQL!');

  // Tabela users
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
  db.query(createUsers, e => {
    if (e) console.error('Błąd tworzenia tabeli users:', e);
    else console.log('ℹ️  Tabela users gotowa (OK / już istniała)');
  });

  // Tabela level_progress (bez nazwanego CONSTRAINT — unikamy kolizji nazw)
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
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci;
  `;
  db.query(createProgress, e => {
    if (e) console.error('Błąd tworzenia tabeli level_progress:', e);
    else console.log('ℹ️  Tabela level_progress gotowa (OK / już istniała)');
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const sanitize = s => (typeof s === 'string' ? s.trim() : '');
const basicEmailOk = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    password = sanitize(password);

    if (!login || !email || !password) {
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
    }
    if (!basicEmailOk(email)) {
      return res.status(400).json({ ok: false, error: 'BAD_EMAIL' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'WEAK_PASSWORD' });
    }

    // Czy login lub e-mail już istnieje?
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

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () =>
  console.log(`✅ Serwer API działa na http://localhost:${PORT}`)
);
