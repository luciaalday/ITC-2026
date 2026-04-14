// src/hooks/useMotion.js
import { useEffect, useState, useRef } from "react";

const SERVER = "http://localhost:3001";
const WS_SERVER = "ws://localhost:3001";

export function useMotion() {
    const [events, setEvents] = useState([]);
    const [lastEvent, setLastEvent] = useState(null);
    const wsRef = useRef(null);

    // Load history on mount
    useEffect(() => {
        fetch(`${SERVER}/api/events`)
            .then(r => r.json())
            .then(setEvents);
    }, []);

    // WebSocket for live updates
    useEffect(() => {
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
            // Simple reconnect after 3s if connection drops
            setTimeout(() => wsRef.current?.reconnect?.(), 3000);
        };

        return () => ws.close();
    }, []);

    return { events, lastEvent };
}