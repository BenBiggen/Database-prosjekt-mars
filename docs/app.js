// Server-bit, setter opp en Express-app
const express = require('express');
const app = express();

const PORT = 3000;

// Databasen
const Database = require('better-sqlite3');
const db = new Database('blackjack.db');


// Middleware for å servere statiske filer fra "public" mappen
app.use(express.static('public'));

// CORS-middleware for å tillate forespørsler fra andre domener
const cors = require('cors');
app.use(cors());

// Eksempel på en rute som henter alle fjell og hoydene deres
app.get('/api/user_info', (req, res) => {
    const rows = db.prepare(`
        SELECT games.*
        FROM user
        JOIN sessions ON user.user_id = sessions.user_id
        JOIN games ON sessions.session_id = games.session_id`).all();
    res.json(rows);
});

// Eksempel på en rute som henter alle brukernavnene til alle personene i databasen
app.get('/api/personer_alle', (req, res) => {
    const rows = db.prepare('SELECT username FROM user').all();
    res.json(rows);
});

app.use(express.json()); // VIKTIG

app.post("/api/update_balance", (req, res) => {
    const { user_id, change } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE user
            SET balance = balance + ?
            WHERE user_id = ?
        `);

        stmt.run(change, user_id);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/balance/:id", (req, res) => {
    const row = db.prepare("SELECT balance FROM user WHERE user_id = ?")
                  .get(req.params.id);

    res.json(row);
});

// Åpner en viss port på serveren, og starter serveren
app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});