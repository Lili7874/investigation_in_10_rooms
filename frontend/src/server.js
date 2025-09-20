// server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // pozwala Reactowi się połączyć

const db = mysql.createConnection({
    host: 'localhost',
	user: 'root',
	password: '',
    database: 'sledztwo_w_10_pokojach'
});

db.connect(err => {
    if (err) throw err;
    console.log('✅ Połączono z MySQL!');
});

app.post('/login', (req, res) => {
    const { login, password } = req.body;

    // 🔍 LOGOWANIE DO KONSOLI SERWERA:
    console.log('🔐 Przychodzący login:', login);
    console.log('🔐 Przychodzące hasło:', password);

    db.query('SELECT * FROM users WHERE login = ?', [login], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Nieprawidłowy login' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: 'Nieprawidłowe hasło' });
        }

        res.json({ message: 'Zalogowano' });
    });
});

app.listen(3001, () => console.log('✅ Serwer API działa na http://localhost:3001'));