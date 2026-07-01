import { useMotion } from "../hooks/useMotion";
import { useSensorLogs } from "../hooks/useSensorLogs";

export default function Logs() {
    const { events /* , lastEvent */ } = useMotion();
    const { powerReadings } = useSensorLogs();

    return (
        <article>
            <section>
                {/**
                <div style={{ padding: "1rem", background: lastEvent ? "#50855a" : "#495849", borderRadius: 8 }}>
                    {lastEvent
                        ? `Motion detected at ${new Date(lastEvent.timestamp).toLocaleTimeString('en-US', { timeZone: 'America/Phoenix' })}`
                        : "No recent motion"}
                </div>
                */}

                <h2>Motion / Rotation Log</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Rotation Count</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(e => (
                            <tr key={e.id}>
                                <td>{e.id}</td>
                                <td>{e.count}</td>
                                <td>{new Date(e.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Power Log</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Voltage (V)</th>
                            <th>Current (mA)</th>
                            <th>Power (mW)</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {powerReadings.map(p => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.voltage.toFixed(2)}</td>
                                <td>{p.current.toFixed(2)}</td>
                                <td>{p.power.toFixed(2)}</td>
                                <td>{new Date(p.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </article>
    );
}