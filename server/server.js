const express = require('express');
const Database = require('better-sqlite3');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const db = new Database('motion.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sensor TEXT,
        detected INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

app.use(cors());
app.use(express.json());

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(msg);
    });
}

// Serial port reading from Arduino
const port = new SerialPort({ path: 'COM3', baudRate: 9600 }); // change COM3 to your port
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (line) => {
    const count = parseInt(line.trim());
    if (!isNaN(count)) {
        const stmt = db.prepare("INSERT INTO events (sensor, detected) VALUES (?, ?)");
        const result = stmt.run('IR1', 1);
        const event = db.prepare("SELECT * FROM events WHERE id = ?").get(result.lastInsertRowid);
        broadcast({ type: "motion", event });
        console.log(`[${new Date().toISOString()}] Motion detected, count: ${count}`);
    }
});

port.on('error', (err) => console.error('Serial port error:', err.message));

app.post("/api/motion", (req, res) => {
    const { detected, sensor } = req.body;
    console.log(`[${new Date().toISOString()}] Motion from ${sensor}`);
    const stmt = db.prepare("INSERT INTO events (sensor, detected) VALUES (?, ?)");
    const result = stmt.run(sensor, detected ? 1 : 0);
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(result.lastInsertRowid);
    broadcast({ type: "motion", event });
    res.json({ ok: true });
});

app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY timestamp DESC LIMIT 50").all();
    res.json(events);
});

wss.on("connection", (ws) => {
    console.log("React client connected");
    ws.on("close", () => console.log("React client disconnected"));
});

server.listen(3001, () => console.log("Server running on port 3001"));