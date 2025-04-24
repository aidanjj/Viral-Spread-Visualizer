'use client';

import React, {useState} from 'react'
import styles from '../styles/chart.module.css';
import {
    Chart as ChartJS,
    BarElement,
    PointElement,
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
  } from 'chart.js';
  
  import { Line } from 'react-chartjs-2';
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);


export default function ViralSpreadChart(){

    const NUM_DAYS = 100;


    const [s0, setS0] = useState(10000);
    const [i0, setI0] = useState(500);
    const [r0, setR0] = useState(1.1);
    const [deathRate, setDeathRate] = useState(.02);

    const [sValues, setSValues] = useState([]);
    const [eValues, setEValues] = useState([]);
    const [iValues, setIValues] = useState([]);
    const [rValues, setRValues] = useState([]);
    const [tValues, setTValues] = useState([]);

    const data = {
        labels: tValues,
        datasets: [
          {
            label: 'Example',
            data: iValues,
            backgroundColor: 'rgba(0, 0, 0, 1)',
            tension: 1,
          },
        ],
      };
    
      const options = {
        responsive: true,
        maintainAspectRatio: false,
      };

    const handleS0Change = (event) => {
        setS0(Number(event.target.value));
        solveEqns();
    }

    const handleI0Change = (event) => {
        setI0(event.target.value);
    }

    const handleR0Change = (event) => {
        setR0(event.target.value);
    }

    const handleDeathRateChange = (event) => {
        setDeathRate(event.target.value);
    }

    const solveEqns = () => {
        let t = 0;
        const dt = .1;
        const transmissionRate = .5;
        const recoveryRate = .1;
        let s = s0;
        console.log(s);
        let i = i0;
        let r = 0;
        let newSValues = [];
        let newIValues = [];
        let newRValues = [];
        let newTValues = [];
        while (t < NUM_DAYS && s >= 0){
            const tempS = s;
            const tempI = i;
            const n = s + i;
            s += (-transmissionRate * s * i)/n * dt;
            i += (transmissionRate * tempS * tempI / n - recoveryRate * tempI) * dt;
            r += (recoveryRate * tempI) * dt;
            console.log(s);

            newSValues.push(s);
            newIValues.push(i);
            newRValues.push(r);
            newTValues.push(t);
            t += dt;
        }
        setSValues(newSValues);
        setIValues(newIValues);
        setRValues(newRValues);
        setTValues(newTValues);
    }

    return (
        <div className={styles.user_entries}>
            <label htmlFor='s0-entry'>
                test
            </label>
            <input 
                type='number'
                id='s0-entry'
                value={s0}
                onChange={handleS0Change}
            />
            <div className={styles.chart}>
                <Line data={data} options={options} />
            </div>
        </div>
    )
}