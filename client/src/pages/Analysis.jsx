export default function Analysis() {
    return (
        <article>
            <section>
                <h1>RPM</h1>
                <div className="graph">
                    <h2>RPM Over Time</h2>
                    <div className="data-container">
                        <p className="x-label">Time</p>
                        <div className="data">
                        
                        </div>
                    </div>
                    <select>
                        <option>Rotations</option>
                        <option>Rotations per minute</option>
                    </select>
                </div>
            </section>
            <section>
                <h1>Voltage</h1>
                <div className="graph">
                    <h2>Voltage over time</h2>
                    <div className="data-container">
                        <p className="x-label">Time</p>
                        <div className="data">

                        </div>
                    </div>
                    <select>
                        <option>Voltage</option>
                        <option>Total</option>
                        <option>Power</option>
                        <option>Total Power</option>
                    </select>
                </div>

            </section>
        </article>
    )
}