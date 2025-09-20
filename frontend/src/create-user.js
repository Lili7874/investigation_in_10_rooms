// create-user.js
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sledztwo_w_10_pokojach'
});

const login = 'admin3'; // zamiast 'admin'
const plainPassword = 'admin123';

bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) throw err;

    db.query(
        'INSERT INTO users (login, password_hash) VALUES (?, ?)',
        [login, hash],
        (err, result) => {
            if (err) throw err;
            console.log('✅ Użytkownik dodany!');
            db.end();
        }
    );
});
