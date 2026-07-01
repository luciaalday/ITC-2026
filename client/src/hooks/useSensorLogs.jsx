import { useEffect, useState, useRef } from "react";

const SERVER = "http://localhost:3001";
const WS_SERVER = "ws://localhost:3001";

export function useSensorLogs() {
    const [powerReadings, setPowerReadings] = useState([]);
    const wsRef = useRef(null);
    const reconnectTimer = useRef(null);
    const connectRef = useRef(null);

    useEffect(() => {
        fetch(`${SERVER}/api/power`)
            .then(r => r.json())
            .then(setPowerReadings);
    }, []);

    useEffect(() => {
        connectRef.current = () => {
            const ws = new WebSocket(WS_SERVER);
            wsRef.current = ws;
            ws.onmessage = (msg) => {
                const data = JSON.parse(msg.data);
                if (data.type === "power") {
                    setPowerReadings(prev => [data.event, ...prev.slice(0, 49)]);
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

    return { powerReadings };
}