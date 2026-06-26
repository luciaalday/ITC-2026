import { useMotion } from "../hooks/useMotion";

export default function Logs() {
    const { events, lastEvent } = useMotion();

    return (
        <article>
            <section>
                <div style={{ padding: "1rem", background: lastEvent ? "#50855a" : "#495849", borderRadius: 8 }}>
                    {lastEvent
                        ? `Motion detected at ${new Date(lastEvent.timestamp).toLocaleTimeString('en-US', { timeZone: 'America/Phoenix' })}`
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
            </section>
        </article>
    );
}