import { useMotion } from "../hooks/useMotion";

export default function Home() {
    const { events, lastEvent } = useMotion();

    return (
        <div>
            <h1>PIR Motion Monitor</h1>

            <div style={{ padding: "1rem", background: lastEvent ? "#ffd700" : "#eee", borderRadius: 8 }}>
                {lastEvent
                    ? `⚡ Motion detected at ${new Date(lastEvent.timestamp).toLocaleTimeString('en-US', { timeZone: 'America/Phoenix' })}`
                    : "No recent motion"}
            </div>

            <h2>Event Log</h2>
            <ul>
                {events.map(e => (
                    <li key={e.id}>
                        [{new Date(e.timestamp).toLocaleString()}] {e.sensor} — motion detected
                    </li>
                ))}
            </ul>
        </div>
    );
}