// scripts/create-user.js

require('dotenv/config');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

/**
 * Pobiera argument z linii komend w formacie:
 *  --nazwa wartość
 */
function getArg(name, fallback = '') {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

/**
 * Prosta walidacja adresu e-mail
 */
function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

async function main() {
  const login = getArg('login');
  const email = getArg('email');
  const password = getArg('password');

  // Walidacja parametrów wejściowych
  if (!login || !email || !password) {
    console.error(
      '❌ Użycie: node scripts/create-user.js --login <login> --email <email> --password <hasło>'
    );
    process.exit(1);
  }

  if (!isEmail(email)) {
    console.error('❌ Podaj prawidłowy adres e-mail.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Hasło musi mieć min. 8 znaków.');
    process.exit(1);
  }

  // Konfiguracja połączenia z bazą
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'sledztwo_w_10_pokojach',
    dateStrings: true,
  };

  let db;

  try {
    db = await mysql.createConnection(dbConfig);

    // Sprawdzenie, czy login / e-mail już istnieją
    const [rows] = await db.execute(
      'SELECT id, login, email FROM users WHERE login = ? OR email = ? LIMIT 1',
      [login, email]
    );

    if (rows.length) {
      const existing = rows[0];

      if (existing.login === login) {
        console.error('❌ Ten login jest już zajęty.');
        process.exit(1);
      }

      if (existing.email === email) {
        console.error('❌ Ten e-mail jest już w użyciu.');
        process.exit(1);
      }
    }

    // Hashowanie hasła
    const hash = await bcrypt.hash(password, 10);

    // Wstawienie użytkownika
    const [result] = await db.execute(
      'INSERT INTO users (login, email, password_hash) VALUES (?, ?, ?)',
      [login, email, hash]
    );

    console.log('✅ Użytkownik dodany!');
    console.log('   ID:   ', result.insertId);
    console.log('   Login:', login);
    console.log('   E-mail:', email);
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      console.error('❌ Duplikat loginu lub e-maila (ER_DUP_ENTRY).');
    } else {
      console.error('❌ Błąd:', e.message || e);
    }
    process.exit(1);
  } finally {
    if (db) {
      try {
        await db.end();
      } catch (_) {}
    }
  }
}

main();