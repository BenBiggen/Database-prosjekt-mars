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

app.use(express.json()); //Gjør at koden automatisk kan lese JSON data fra forespørseler

//Oppdaterer kontoen sånn at den blir lik den som vises i frontend
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

//oppdaterer total mengde penger vunnet for en konto i databasen
app.post("/api/total_won", (req, res) => {
    
    const { user_id, change } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE user
            SET total_won = total_won + ?
            WHERE user_id = ?
        `);

        stmt.run(change, user_id);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//oppdaterer total mengde penger tapt for en konto i databasen
app.post("/api/total_lost", (req, res) => {

    const { user_id, change } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE user
            SET total_lost = total_lost + ?
            WHERE user_id = ?
        `);

        stmt.run(change, user_id);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//oppretter en ny session i databasen med start verdi og user_id i tilegg til start tidspunkt, selv om det ikke blir brukt noe mer enn å bli lagret i databasen
app.post("/api/session/start", (req, res) => {
    const { user_id, start_balance } = req.body;

    try {
        const stmt = db.prepare(`
            INSERT INTO sessions (user_id, start_balance, started_at)
            VALUES (?, ?, datetime('now'))
        `);
        const info = stmt.run(user_id, start_balance);
        res.json({ success: true, session_id: info.lastInsertRowid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//Logger runden som ble spillt inn i databasen med resultat av hvordan runden gikk
app.post("/api/game", (req, res) => {
    const { session_id, bet, result, amount_change } = req.body;

    try {
        const stmt = db.prepare(`
            INSERT INTO games (session_id, bet, result, amount_changed, played_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `);
        stmt.run(session_id, bet, result, amount_change);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Ender session og logger endringer fra når den ble startet
app.post("/api/session/end", (req, res) => {
    const { session_id, end_balance } = req.body;

    try {
        const stmt = db.prepare(`
            UPDATE sessions
            SET end_balance = ?, ended_at = datetime('now')
            WHERE session_id = ?
        `);
        stmt.run(end_balance, session_id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Lager en link så man kan fetche kontoverdien til en spesefikk user
app.get("/api/balance/:id", (req, res) => {
    const row = db.prepare("SELECT balance FROM user WHERE user_id = ?")
                  .get(req.params.id);

    res.json(row);
});

//Lager en link så man kan fetche brukernavnet til en spesefikk user
app.get("/api/username/:id", (req, res) => {
    const row = db.prepare("SELECT username FROM user WHERE user_id = ?")
                  .get(req.params.id);

    res.json(row);
});

//Lager en link så man kan fetche total vunnet sum til en spesefikk user
app.get("/api/total_won/:id", (req, res) => {
    const row = db.prepare("SELECT total_won FROM user WHERE user_id = ?")
                  .get(req.params.id);

    res.json(row);
});

//Lager en link så man kan fetche total tapt sum til en spesefikk user
app.get("/api/total_lost/:id", (req, res) => {
    const row = db.prepare("SELECT total_lost FROM user WHERE user_id = ?")
                  .get(req.params.id);

    res.json(row);
});

// Åpner en viss port på serveren, og starter serveren
app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});