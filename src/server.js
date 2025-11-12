// server.js
require('dotenv/config');

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');          // <-- tylko raz
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

/* =========================
   CORS (na czas diagnozy – luźny)
   ========================= */
// Przyjmij wszystko z przeglądarki. Gdy zadziała, zawęzimy do Netlify.
app.use(cors({ origin: true, credentials: true }));
// preflight
app.use((req, res, next) => (req.method === 'OPTIONS' ? res.sendStatus(204) : next()));

/* =========================
   Health
   ========================= */
app.get('/healthz', (_req, res) => res.json({ ok: true }));

/* =========================
   DB (Railway MySQL)
   ========================= */
const DB_SSL = String(process.env.DB_SSL || 'require').toLowerCase();
const basePoolConfig = {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
};

if (process.env.DATABASE_URL) {
  basePoolConfig.uri = process.env.DATABASE_URL;
} else {
  basePoolConfig.host = process.env.DB_HOST || 'localhost';
  basePoolConfig.port = Number(process.env.DB_PORT || 3306);
  basePoolConfig.user = process.env.DB_USER || 'root';
  basePoolConfig.password = process.env.DB_PASS || '';
  basePoolConfig.database = process.env.DB_NAME || 'sledztwo_w_10_pokojach';
}
if (DB_SSL !== 'off') {
  basePoolConfig.ssl = { rejectUnauthorized: false, minVersion: 'TLSv1.2' };
}
const db = mysql.createPool(basePoolConfig);

app.get('/healthz/db', (_req, res) => {
  db.query('SELECT 1 AS ok', (err, rows) =>
    err ? res.status(500).json({ ok: false, error: 'DB_DOWN', detail: err.code })
        : res.json({ ok: true, db: rows?.[0]?.ok === 1 })
  );
});

/* =========================
   Mailer
   ========================= */
const RESET_TOKEN_TTL_MIN = Number(process.env.RESET_TOKEN_TTL_MIN || 30);
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'no-reply@example.com';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

let transporter = null;
async function getTransporter() {
  if (transporter) return transporter;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    console.log('📨 Mailer: używam skonfigurowanego SMTP.');
    return transporter;
  }

  // DEV: Ethereal
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('📨 Mailer: tryb DEV (Ethereal) — w konsoli pojawi się link „preview”.');
  return transporter;
}

/* ====== dalej zostaw Twój kod bez zmian (schema, routes, etc.) ====== */

// (Twoje route’y: schema, helpers, /login, /register, /progress, itd.)

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, '0.0.0.0', () => console.log(`✅ API listening on :${PORT}`));
