// server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

// ── Middlewares ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // dopasuj, jeśli front jest pod innym adresem
    methods: ['GET', 'POST', 'OPTIONS'],
  })
);

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

  // Tabela users (jeśli nie istnieje)
  const createSql = `
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
  db.query(createSql, e => {
    if (e) console.error('Błąd tworzenia tabeli users:', e);
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const sanitize = s => (typeof s === 'string' ? s.trim() : '');

const basicEmailOk = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // prosta walidacja formatu

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
                // Dodatkowo łapiemy wyścig i unikatowe ograniczenia
                if (e.code === 'ER_DUP_ENTRY') {
                  const msg = e.sqlMessage || '';
                  if (msg.includes('login'))
                    return res
                      .status(409)
                      .json({ ok: false, error: 'LOGIN_TAKEN' });
                  if (msg.includes('email'))
                    return res
                      .status(409)
                      .json({ ok: false, error: 'EMAIL_TAKEN' });
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

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () =>
  console.log(`✅ Serwer API działa na http://localhost:${PORT}`)
);
