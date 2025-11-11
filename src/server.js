const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));
app.use((req, _res, next) => { console.log(req.method, req.path); next(); });
