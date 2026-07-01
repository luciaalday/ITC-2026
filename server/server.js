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
    CREATE TABLE IF NOT EXISTS rotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        count INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);
db.exec(`
    CREATE TABLE IF NOT EXISTS power_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voltage REAL,
        current REAL,
        power REAL,
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

// Serial port reading from Arduino running main.cpp
const serialPortPath = process.env.SERIAL_PORT || 'COM6';
const port = new SerialPort({ path: serialPortPath, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
    console.log(`Serial port open on ${serialPortPath}`);
});
port.on('error', (err) => console.error('Serial port error:', err.message));

parser.on('data', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    console.log(`[serial] ${trimmed}`);
    const parts = trimmed.split(',');

    // Format is: <timestamp>,<type>,<value1>,<value2>,...
    if (parts.length < 2) return;
    
    const timestamp = parseInt(parts[0]);
    const type = parts[1];

    if (type === 'ROT' && parts.length >= 3) {
        const count = parseInt(parts[2]);
        if (!isNaN(count)) {
            const stmt = db.prepare("INSERT INTO rotations (count) VALUES (?)");
            const result = stmt.run(count);
            const event = db.prepare("SELECT * FROM rotations WHERE id = ?").get(result.lastInsertRowid);
            // The IR sensor doubles as the motion sensor: every rotation IS a motion event
            broadcast({ type: "rotation", event });
            console.log(`[${new Date().toISOString()}] Rotation/motion detected, count: ${count} (Arduino ts: ${timestamp}ms)`);
        }
    } else if (type === 'PWR' && parts.length >= 5) {
        const voltage = parseFloat(parts[2]);
        const current = parseFloat(parts[3]);
        const power = parseFloat(parts[4]);
        if (!isNaN(voltage) && !isNaN(current) && !isNaN(power)) {
            const stmt = db.prepare("INSERT INTO power_readings (voltage, current, power) VALUES (?, ?, ?)");
            const result = stmt.run(voltage, current, power);
            const event = db.prepare("SELECT * FROM power_readings WHERE id = ?").get(result.lastInsertRowid);
            broadcast({ type: "power", event });
            console.log(`[${new Date().toISOString()}] Power: ${voltage}V ${current}mA ${power}mW (Arduino ts: ${timestamp}ms)`);
        }
    }
});

app.get("/api/rotations", (req, res) => {
    const rows = db.prepare("SELECT * FROM rotations ORDER BY timestamp DESC LIMIT 50").all();
    res.json(rows);
});

app.get("/api/power", (req, res) => {
    const rows = db.prepare("SELECT * FROM power_readings ORDER BY timestamp DESC LIMIT 50").all();
    res.json(rows);
});

// Rotations / RPM / Power / Energy for Analysis.jsx charts
const METRICS = ['rotations', 'rpm', 'power', 'energy'];
const PERIOD_OFFSETS = {
    minute: "-1 minutes",
    day: "-1 day",
    'all-time': null,
};

app.get("/api/data/:metric/:period", (req, res) => {
    const { metric, period } = req.params;
    if (!METRICS.includes(metric) || !(period in PERIOD_OFFSETS)) {
        return res.status(400).json({ error: "invalid metric or period" });
    }

    const offset = PERIOD_OFFSETS[period];
    const windowClause = offset ? `WHERE timestamp >= datetime('now', '${offset}')` : '';

    let rows = [];

    if (metric === 'rotations') {
        rows = db.prepare(
            `SELECT timestamp, count as value FROM rotations ${windowClause} ORDER BY timestamp ASC`
        ).all();
    } else if (metric === 'rpm') {
        const raw = db.prepare(
            `SELECT timestamp, count FROM rotations ${windowClause} ORDER BY timestamp ASC`
        ).all();
        for (let i = 1; i < raw.length; i++) {
            const deltaMs = new Date(raw[i].timestamp + 'Z') - new Date(raw[i - 1].timestamp + 'Z');
            if (deltaMs > 0) {
                rows.push({ timestamp: raw[i].timestamp, value: 60000 / deltaMs });
            }
        }
    } else if (metric === 'power') {
        rows = db.prepare(
            `SELECT timestamp, power / 1000.0 as value FROM power_readings ${windowClause} ORDER BY timestamp ASC`
        ).all();
    } else if (metric === 'energy') {
        const raw = db.prepare(
            `SELECT timestamp, power / 1000.0 as powerW FROM power_readings ${windowClause} ORDER BY timestamp ASC`
        ).all();
        let total = 0;
        raw.forEach((r, i) => {
            if (i > 0) {
                const deltaHrs = (new Date(r.timestamp + 'Z') - new Date(raw[i - 1].timestamp + 'Z')) / 3600000;
                total += ((raw[i - 1].powerW + r.powerW) / 2) * deltaHrs;
            }
            rows.push({ timestamp: r.timestamp, value: total });
        });
    }

    res.json(rows);
});

wss.on("connection", (ws) => {
    console.log("React client connected");
    ws.on("close", () => {
        console.log("React client disconnected");
    });
});

server.listen(3001, () => console.log("Server running on port 3001"));