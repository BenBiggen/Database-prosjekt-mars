# IT prosjekt BLACKJACK

## Utviklingsdokumentasjon

For frontend delen av oppgaven så har jeg brukt vanilla html, css og javascript. I tillegg har jeg brukt en svg for å få tilgang til kortene. For backend er rammeverket express i node.js. I backenden er det også brukt better SQLite 3. 

[lenke til SVGen jeg bruke](https://cardmeister.github.io/)

Jeg har laget en database i SQLite studio hvor jeg har en tabell for users, sessions, games, achievements og user-achievements pga en mange til mange kobling. I databasen lagrer jeg mye viktig info for statistikk og for at spillet skal fungere. Under har jeg et bilde av datamodellen til databasen. 

![Databasemodell](https://i.imgur.com/TmMKZrk.png)

# API Endepunkter / ruter

## /api/update balance, /api/total_won, /api/total_lost

Disse API endepunktene endrer på en verdi i databasen basert på endringer i frontenden. For eksempel for update balance så plusser den på endringen i kontoen på hva kontoen var fra før av i databasen, samme med total_won og total_lost bare med andre verdier. 

Update balance i app.js:

```
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
```

## /api/session/start, /api/game

Disse to api endepunktene setter inn en ny rad i dataen til databasen, session start for sessions tabellen og game for games tabellen. For eksempel i session start så lages det en ny rad med ny session_id som inkluderer start pengeverdi og tidspunkt den startet. 

Session start i app.js:
```
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
```

## /api/session/end

Session end er litt ulikt fra session start i at den endrer verdien på en allerede eksisterende rad, som er den som ble opprettet i session start. Session end setter inn penge verdi for slutten av session og tidspunkt den ble sluttet. 

Session end i app.js:
```
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
```

## /api/balance/:id, /api/username/:id, /api/total_won/:id, /api/total_lost/:id

Disse API endepunktene er litt ulikt fra de andre i at de handler om å hente informasjon fra databasen i stedet for å sette inn informasjon. Alle URLene til disse api endepunktene er sånn at man kan sette inn IDen til en user på slutten av URLen for å få info om den useren. Alle disse endepunktene henter informasjon fra user tabellen i databasen. 

Username id i app.js:
```
app.get("/api/username/:id", (req, res) => {
    const row = db.prepare("SELECT username FROM user WHERE user_id = ?")
                  .get(req.params.id);

    res.json(row);
});
```

# Frontend beskrivelse

Frontenden består av 2 html, 2 css og 2 js filer. Det er to av hver fordi jeg har to sider, en for selve blackjack siden og en annen en for informasjon om bruker. 

For blackjack siden har jeg index.html, style.css og script.js veldig basic navn. Blackjack siden har ansvar for 95% av frontend logikken og får hele blackjack spillet til å fungere. Mesteparten av koden er i script filen som også er hvor jeg kommuniserer mellom frontend og backend. I script.js har jeg en rekke async funksjoner som inneholder fetch og kommuniserer med backend med å sende og hente informasjon via API endepunkter opprettet av backenden fra express i app.js.

For bruker info siden har jeg userInfo.html, userInfoStyle.css og userInfoScript.js. Userinfo siden må hente informasjon fra backenden for å vise for eksempel brukernavn og total vunnet som er lagret i databasen, så jeg kommuniserer med backended på samme måte som i script her, via fetch som henter informasjon fra API endepunkter. Det eneste bruker info siden gjør er å vise noe informasjon om de forskjellige brukerene som har info lagret i databasen. 