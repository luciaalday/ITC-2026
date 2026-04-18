// src/hooks/useMotion.js
import { useEffect, useState, useRef } from "react";

const SERVER = "http://localhost:3001";
const WS_SERVER = "ws://localhost:3001";

export function useMotion() {
    const [events, setEvents] = useState([]);
    const [lastEvent, setLastEvent] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const connectRef = useRef(null);

    useEffect(() => {
        fetch(`${SERVER}/api/events`)
            .then(r => r.json())
            .then(setEvents);
    }, []);

    useEffect(() => {
        connectRef.current = () => {
            const ws = new WebSocket(WS_SERVER);
            wsRef.current = ws;

            ws.onmessage = (msg) => {
                const data = JSON.parse(msg.data);
                if (data.type === "motion") {
                    setLastEvent(data.event);
                    setEvents(prev => [data.event, ...prev.slice(0, 49)]);
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
    }, []);

    return { events, lastEvent };
}