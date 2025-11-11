/* =========================
   CORS (TEST – luźny)
   ========================= */
const cors = require('cors');

// przyjmij wszystko z przeglądarki (na czas diagnozy)
app.use(cors({ origin: true, credentials: true }));

// szybki logger żądań, pomoże w Render Logs
app.use((req, _res, next) => { console.log(req.method, req.path); next(); });
