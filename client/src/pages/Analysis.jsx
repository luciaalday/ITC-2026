import { useState } from "react";

import Chart from "../components/Chart";

export default function Analysis() {
    const [pe, setPE] = useState('Power');
    const [petime, setPEtime] = useState('Minute');
    const [pevalues, setPEvalues] = useState([]);
    const [petimevalues, setPEtimevalues] = useState([]);
    
    const [rrpm, setRRPM] = useState('Rotations');
    const [rrpmtime, setRRPMtime] = useState('Minute');
    const [rrpmvalues, setRRPMvalues] = useState([]);
    const [rrpmtimevalues, setRRPMtimevalues] = useState([]);
    
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
                <Chart xname={rrpm} />

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
                <Chart xname={pe} />
            </section>
        </article>
    )
}