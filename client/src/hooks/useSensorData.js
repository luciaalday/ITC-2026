// client/src/useSensorData.jsx
import { useEffect, useState, useRef } from "react";

const SERVER = "http://localhost:3001";
const WS_SERVER = "ws://localhost:3001";
const MAX_POINTS = 50;

// metric: 'rotations' | 'rpm' | 'power' | 'energy'
// period: 'minute' | 'day' | 'all-time'
export function useSensorData(metric, period) {
    const [values, setValues] = useState([]);
    const [timevalues, setTimevalues] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const connectRef = useRef(null);
    const lastRotationRef = useRef(null); // last rotation timestamp, for live RPM deltas
    const energyRef = useRef({ total: 0, lastPower: null, lastTimestamp: null });

    const formatTime = (ts) =>
        new Date(ts + (ts.endsWith('Z') ? '' : 'Z')).toLocaleTimeString('en-US', { timeZone: 'America/Phoenix' });

    const appendPoint = (value, timestamp) => {
        setValues(prev => [...prev.slice(-(MAX_POINTS - 1)), value]);
        setTimevalues(prev => [...prev.slice(-(MAX_POINTS - 1)), formatTime(timestamp)]);
    };

    // initial load, same shape as useMotion's fetch
    useEffect(() => {
        fetch(`${SERVER}/api/data/${metric}/${period}`)
            .then(r => r.json())
            .then(data => {
                setValues(data.map(d => d.value));
                setTimevalues(data.map(d => formatTime(d.timestamp)));

                const last = data[data.length - 1];
                lastRotationRef.current = last ? { timestamp: last.timestamp } : null;
                energyRef.current = {
                    total: metric === 'energy' && last ? last.value : 0,
                    lastPower: null,
                    lastTimestamp: last ? last.timestamp : null,
                };
            });
    }, [metric, period]);

    // live updates, same reconnect pattern as useMotion
    useEffect(() => {
        connectRef.current = () => {
            const ws = new WebSocket(WS_SERVER);
            wsRef.current = ws;

            ws.onmessage = (msg) => {
                const data = JSON.parse(msg.data);

                if (metric === 'rotations' && data.type === 'rotation') {
                    appendPoint(data.event.count, data.event.timestamp);
                }

                if (metric === 'rpm' && data.type === 'rotation') {
                    const prev = lastRotationRef.current;
                    lastRotationRef.current = { timestamp: data.event.timestamp };
                    if (prev) {
                        const deltaMs = new Date(data.event.timestamp) - new Date(prev.timestamp);
                        if (deltaMs > 0) appendPoint(60000 / deltaMs, data.event.timestamp);
                    }
                }

                if (metric === 'power' && data.type === 'power') {
                    appendPoint(data.event.power / 1000, data.event.timestamp); // mW -> W
                }

                if (metric === 'energy' && data.type === 'power') {
                    const powerW = data.event.power / 1000;
                    const { lastPower, lastTimestamp, total } = energyRef.current;
                    let newTotal = total;
                    if (lastPower !== null && lastTimestamp) {
                        const deltaHrs = (new Date(data.event.timestamp) - new Date(lastTimestamp)) / 3600000;
                        newTotal += ((lastPower + powerW) / 2) * deltaHrs; // trapezoidal, Wh
                    }
                    energyRef.current = { total: newTotal, lastPower: powerW, lastTimestamp: data.event.timestamp };
                    appendPoint(newTotal, data.event.timestamp);
                }
            };

            ws.onclose = () => {
                reconnectTimer.current = setTimeout(() => connectRef.current(), 3000);
            };
            ws.onerror = () => {
                ws.close();
            };
        };
        connectRef.current();
        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, [metric]);

    return { values, timevalues };
}