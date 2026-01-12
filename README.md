# Pixelowy Detektyw: Śledztwo w 10 Pokojach

**Interaktywna gra detektywistyczna w formie aplikacji webowej**

**Demo:** https://investigationin10rooms.online  
**API:** https://investigation-in-10-rooms.onrender.com  
**Repozytorium:** https://github.com/Lili7874/investigation_in_10_rooms  

---

## 📖 Opis projektu

**Pixelowy Detektyw: Śledztwo w 10 Pokojach** to interaktywna gra detektywistyczna stworzona jako projekt inżynierski.  
Gracz prowadzi 10 niezależnych śledztw, zbiera dowody, analizuje sprzeczności i wykorzystuje logikę, aby wskazać sprawcę.

Gra działa w pełni w przeglądarce, posiada system użytkowników, zapisywanie progresu oraz resetowanie hasła poprzez e-mail.

---

## 🎮 Funkcjonalności

### 🔍 Dziesięć zagadek (pokoi)
- Każda zagadka jest niezależnym śledztwem  
- Unikalni bohaterowie, dowody i motywy  
- Rosnący poziom trudności  

### 🧠 System dedukcji
- Wykrywanie sprzecznych informacji  
- Powiązania między dowodami  
- Wymóg logicznego myślenia  

### 🗣 Dynamiczne dialogi
- Zmienny przebieg rozmów  
- Imersyjna narracja  

### 🎨 Styl pixel-art noir
- Animowane tła wideo  
- Mroczna oprawa audiowizualna  
- Detektywistyczny klimat  

### 🔐 Pełny system użytkowników
- Rejestracja  
- Logowanie  
- Reset hasła z tokenem (Resend API)  
- Zapisywanie progresu gracza  
- Tablice wyników  

### 🌐 Architektura produkcyjna
- **Frontend**: Netlify + własna domena  
- **Backend**: Render  
- **Baza danych**: Railway (MySQL)  
- **Mailing**: Resend API  

---

## 🛠 Technologie

### Frontend
- Phaser 3  
- JavaScript (ESM)  
- CSS  
- Netlify  

### Backend
- Node.js + Express  
- MySQL (Railway)  
- bcrypt  
- Resend API + nodemailer  
- Render  

---

## 📦 Struktura projektu

investigation_in_10_rooms/
│
├── src/
│ ├── scenes/
│ ├── styles/
│ ├── assets/
│ ├── lib/
│ └── server.js
│
├── public/
├── netlify.toml
└── README.md

---

## 🚀 Uruchamianie lokalnie

### Frontend
npm install
npm run dev
Aplikacja będzie dostępna pod adresem:
http://localhost:5173

### Backend
node src/server.js
API będzie dostępne pod adresem:
http://localhost:3001

🌐 Deployment produkcyjny
Netlify (frontend)
Build command: npm run build

Output directory: dist

Domena: https://investigationin10rooms.online

Render (backend)
Wymagane zmienne środowiskowe:

FRONTEND_BASE_URL=https://investigationin10rooms.online
PORT=10000

DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASS=...
DB_NAME=...
DB_SSL=require

RESEND_API_KEY=re_xxxxxxx
RESEND_FROM=Śledztwo w 10 pokojach <no-reply@investigationin10rooms.online>

ALLOWED_ORIGINS=http://localhost:5173,https://investigationin10rooms.online
Railway (baza)
Publiczny connection string

Automatyczne tworzenie tabel:

users

level_progress

password_resets

Resend (wysyłka e-maili)
Weryfikacja domeny (SPF, DKIM, Return-Path)

Wysyłanie resetu hasła przez HTTPS API

🔐 Mechanizm resetu hasła
Użytkownik podaje login lub e-mail

Backend generuje losowy token i zapisuje go w bazie

Tworzy link:
https://investigationin10rooms.online/?scene=ResetPasswordScene&token=XYZ
Link wysyła Resend API

Frontend na podstawie parametru token otwiera scenę resetowania hasła

Użytkownik tworzy nowe hasło

📚 Zakres zrealizowanej pracy inżynierskiej
Analiza i projekt gry

Implementacja logiki dedukcyjnej

Stworzenie spójnej warstwy graficznej (pixel-art)

Zaprojektowanie i implementacja backendu

System kont, logowania i resetu hasła

Baza danych i ranking wyników

Integracja z usługami zewnętrznymi (Render, Railway, Resend)


🛡 Aspekty formalne
Czy praca zawiera informacje niejawne?
Nie.

Czy praca zawiera informacje prawnie chronione / tajemnice przedsiębiorstwa?
Nie.

📄 Licencja
Projekt autorski, stworzony jako praca inżynierska.

🎉 Informacja
Wersja demonstracyjna gry dostępna jest pod adresem:
Zagraj tutaj:

👉 https://investigationin10rooms.online