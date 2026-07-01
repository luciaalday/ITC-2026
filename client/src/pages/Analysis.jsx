import { useState } from "react";
import Chart from "../components/Chart";
import { useSensorData } from "../hooks/useSensorData";

const PERIOD_SLUGS = {
    'Minute': 'minute',
    'Day': 'day',
    'All time': 'all-time',
};

export default function Analysis() {
    const [pe, setPE] = useState('Power');
    const [petime, setPEtime] = useState('Minute');

    const [rrpm, setRRPM] = useState('Rotations');
    const [rrpmtime, setRRPMtime] = useState('Minute');

    const rrpmMetric = rrpm === 'Rotations' ? 'rotations' : 'rpm';
    const peMetric = pe === 'Power' ? 'power' : 'energy';

    const { values: rrpmValues, timevalues: rrpmTimevalues } =
        useSensorData(rrpmMetric, PERIOD_SLUGS[rrpmtime]);

    const { values: peValues, timevalues: peTimevalues } =
        useSensorData(peMetric, PERIOD_SLUGS[petime]);

    return (
        <article>
            <section>
                <div className='chart-header'>
                    <select value={rrpm} onChange={(e)=>setRRPM(e.target.value)}>
                        <option>Rotations</option>
                        <option>RPM</option>
                    </select>
                    <h1>in the last</h1>
                    <select value={rrpmtime} onChange={(e)=>setRRPMtime(e.target.value)}>
                        <option>Minute</option>
                        <option>Day</option>
                        <option>All time</option>
                    </select>
                </div>
                <Chart xname={rrpm} xvalues={rrpmTimevalues} yvalues={rrpmValues} />
            </section>
            <section>
                <div className='chart-header'>
                    <select value={pe} onChange={(e)=>setPE(e.target.value)}>
                        <option>Power</option>
                        <option>Energy</option>
                    </select>
                    <h1>in the last</h1>
                    <select value={petime} onChange={(e)=>setPEtime(e.target.value)}>
                        <option>Minute</option>
                        <option>Day</option>
                        <option>All time</option>
                    </select>
                </div>
                <Chart xname={pe} xvalues={peTimevalues} yvalues={peValues} />
            </section>
        </article>
    )
}