const express= require('express');
const Database = require('better-sqlite3');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const http = require ('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const db = new Database('motion.db');

//create table
db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor TEXT,
        detected INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
app.use(cors);
app.use(express.json());

// broadcast to all connected clients
function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(msg);
    })
}

// arduino posts here
app.post("/api/motion", (req, res) => {
    const { detected, sensor } = req.body;
    console.log(`[${new Date().toISOString}] Motion from ${sensor}`);

    // save to db
    const stmt = db.prepare("INSERT INTO events (sensor, detected) VALUES (?, ?)");
    const result = stmt.run(sensor, detected ? 1 : 0);

    // retrieve inserted row with timestamp
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(result.lastInsertRowid);

    // push to all react clients instantly
    broadcast({ type: "motion", event });

    res.json({ ok: true });
});

// react GET recent history on load
app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY timestamp DESC LIMIT 50").all();
    res.json(events);    
});

wss.on("connection", (ws) => {
    console.log("React client connected");
    ws.on("close",() => console.log("React client disconnected"));
})

server.listen(3001, () => console.log("Server running on port 3001"));