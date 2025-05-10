'use client';

import React, { useState, useEffect } from 'react'
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


export default function ViralSpreadChart() {

    const NUM_DAYS = 100;

    const [isCustom, setIsCustom] = useState(false);

    /**
     * Initial conditions and other user settings
     */
    const [s0, setS0] = useState(10000);
    const [i0, setI0] = useState(500);

    const [r0, setR0] = useState(2.5);
    const [birthRate, setBirthRate] = useState(.00003);
    const [deathRate, setDeathRate] = useState(.00002);
    const [mortalityRate, setMortalityRate] = useState(.02);
    const [infectiousDeathRate, setInfectiousDeathRate] = useState(.5);
    const [EtoIRate, setEtoIRate] = useState(1 / 4);
    const [latentPeriod, setLatentPeriod] = useState(6.9);
    const [infectiousPeriod, setInfectiousPeriod] = useState(8.5);
    const [virulence, setVirulence] = useState(1);
    const [transmissionRateE, setTransmissionRateE] = useState(0);
    const [transmissionRateI, setTransmissionRateI] = useState(.0003);
    const [recoveryRate, setRecoveryRate] = useState(.2);
    const [hygieneFactor, setHygieneFactor] = useState(0);
    const [timeStep, setTimeStep] = useState(0.1);
    const [immunityLossRate] = useState(0.2);



    /**
     * S, E, I, and R values at various times.
     * 
     * This is used to store the data that gets plotted.
     */
    const [sValues, setSValues] = useState([]);
    const [eValues, setEValues] = useState([]);
    const [iValues, setIValues] = useState([]);
    const [rValues, setRValues] = useState([]);
    const [dValues, setDValues] = useState([]);
    const [tValues, setTValues] = useState([]);


    /**
     * ChartJS data.
     */
    const data = {
        labels: tValues,
        datasets: [
            {
                label: 'Susceptible',
                data: sValues,
                borderColor: 'rgba(0, 255, 255, 1)',
                backgroundColor: 'rgba(0, 255, 255, 1)',
                tension: 0,
            },
            {
                label: 'Latent',
                data: eValues,
                borderColor: 'rgba(255, 255, 0, 1)',
                backgroundColor: 'rgba(255, 255, 0, 1)',
                tension: 0,
            },
            {
                label: 'Infected',
                data: iValues,
                borderColor: 'rgba(255, 0, 0, 1)',
                backgroundColor: 'rgba(255, 0, 0, 1)',
                tension: 0,
            },
            {
                label: 'Recovered',
                data: rValues,
                borderColor: 'rgba(0, 255, 100, 1)',
                backgroundColor: 'rgba(0, 255, 100, 1)',
                tension: 0,
            },
            {
                label: 'Dead',
                data: dValues,
                borderColor: 'rgba(255, 255, 255, 1)',
                backgroundColor: 'rgba(255, 255, 255, 1)',
                tension: 0,
            },
        ],
    };


    /**
     * ChartJS options.
     */
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: '#e0e0e0'
                },
                title: {
                    color: '#e0e0e0'
                },
                grid: {
                    color: '#333333',
                    borderColor: '#333333'
                }
            },
            y: {
                ticks: {
                    color: '#e0e0e0'
                },
                title: {
                    color: '#e0e0e0'
                },
                grid: {
                    color: '#333333',
                    borderColor: '#333333'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                }
            },
            title: {
                display: true,
                text: 'SIR Model',
                color: 'white',
            }
        }
    };


    /**
     * These functions handle user input.
     */
    const handleS0Change = (event) => {
        setS0(Number(event.target.value));
    }
    const handleI0Change = (event) => {
        setI0(Number(event.target.value));
    }
    const handleR0Change = (event) => {
        setR0(event.target.value);
    }
    const handleLatentPeriodChange = (event) => {
        setLatentPeriod(event.target.value);
        setEtoIRate(1/event.target.value);
    }
    const handleInfectiousPeriodChange = (event) => {
        setInfectiousPeriod(event.target.value);
        setRecoveryRate(1/event.target.value);
    }
    const handleHygieneFactorChange = (event) => {
        setHygieneFactor(event.target.value);
    }
    const handleInfectiousDeathRateChange = (event) => {
        setInfectiousDeathRate(Number(event.target.value));
    }
    const handleMortalityRateChange = (event) => {
        setMortalityRate(event.target.value);
        const newMortalityRate = 1 - event.target.value;
        const newDeathRate = (recoveryRate - newMortalityRate*(recoveryRate + deathRate))/newMortalityRate;
        setInfectiousDeathRate(newDeathRate);
    }

    const handleVirusChange = (event) => {
        if (event.target.value === 'Custom'){
            setIsCustom(true);
        }
        else {
            setIsCustom(false);
        }
        if (event.target.value === 'COVID-19'){
            setR0(2.5);
            setLatentPeriod(6.9);
            setInfectiousPeriod(8.5);
            setMortalityRate(0.02);
        }
    }


    useEffect(() => {
        const newTransmissionRateI = r0 * (EtoIRate + deathRate) * (infectiousDeathRate + deathRate + recoveryRate) / s0 / EtoIRate;
        setTransmissionRateI(newTransmissionRateI);
        solveEqns();
    }, [s0, i0, r0, transmissionRateI, infectiousPeriod, latentPeriod, hygieneFactor, infectiousDeathRate]);

    const dSdt = (S, E, I, R) => {
        const h = hygeine(S, E, I, R);
        return birthRate - h * transmissionRateE * E * S - h * transmissionRateI * I * S + immunityLossRate * R - deathRate * S;
    }

    const dEdt = (S, E, I, R) => {
        const h = hygeine(S, E, I, R);
        return h * transmissionRateE * E * S + h * transmissionRateI * I * S - (EtoIRate + deathRate) * E;
    }

    const dIdt = (S, E, I, R) => {
        return EtoIRate * E - (recoveryRate + infectiousDeathRate + deathRate) * I;
    }

    const dRdt = (S, E, I, R) => {
        return recoveryRate * I - (immunityLossRate + deathRate) * R;
    }

    const dDdt = (S, E, I, R) => {
        return deathRate * (S + E + I + R) + infectiousDeathRate * I;
    }

    const hygeine = (S, E, I, R) => {
        return Math.pow(2.718, -hygieneFactor * virulence / (S + E + I + R));
    }



    /**
     * Solves the differential equations using RK4.
     * Updates sValues, iValues, etc. with values at each time step.
     */
    const solveEqns = () => {
        let t = 0;
        const dt = 1;
        let s = s0;
        let i = i0;
        let r = 0;

        let newSValues = [];
        let newEValues = [];
        let newIValues = [];
        let newRValues = [];
        let newDValues = [];
        let newTValues = [];

        let S = s0;
        let E = 0;
        let I = i0;
        let R = 0;
        let D = 0;

        newSValues.push(S);
        newEValues.push(E);
        newIValues.push(I);
        newRValues.push(R);
        newDValues.push(D);
        newTValues.push(t);

        while (t < NUM_DAYS && s >= 0) {


            console.log(S);

            const kS1 = dt * dSdt(S, E, I, R);
            const kE1 = dt * dEdt(S, E, I, R);
            const kI1 = dt * dIdt(S, E, I, R);
            const kR1 = dt * dRdt(S, E, I, R);
            const kD1 = dt * dDdt(S, E, I, R);

            console.log(kS1);

            const kS2 = dt * dSdt(S + kS1 / 2, E + kE1 / 2, I + kI1 / 2, R + kR1 / 2);
            const kE2 = dt * dEdt(S + kS1 / 2, E + kE1 / 2, I + kI1 / 2, R + kR1 / 2);
            const kI2 = dt * dIdt(S + kS1 / 2, E + kE1 / 2, I + kI1 / 2, R + kR1 / 2);
            const kR2 = dt * dRdt(S + kS1 / 2, E + kE1 / 2, I + kI1 / 2, R + kR1 / 2);
            const kD2 = dt * dDdt(S + kS1 / 2, E + kE1 / 2, I + kI1 / 2, R + kR1 / 2);


            const kS3 = dt * dSdt(S + kS2 / 2, E + kE2 / 2, I + kI2 / 2, R + kR2 / 2);
            const kE3 = dt * dEdt(S + kS2 / 2, E + kE2 / 2, I + kI2 / 2, R + kR2 / 2);
            const kI3 = dt * dIdt(S + kS2 / 2, E + kE2 / 2, I + kI2 / 2, R + kR2 / 2);
            const kR3 = dt * dRdt(S + kS2 / 2, E + kE2 / 2, I + kI2 / 2, R + kR2 / 2);
            const kD3 = dt * dDdt(S + kS2 / 2, E + kE2 / 2, I + kI2 / 2, R + kR2 / 2);

            const kS4 = dt * dSdt(S + kS3 / 2, E + kE3 / 2, I + kI3 / 2, R + kR3 / 2);
            const kE4 = dt * dEdt(S + kS3 / 2, E + kE3 / 2, I + kI3 / 2, R + kR3 / 2);
            const kI4 = dt * dIdt(S + kS3 / 2, E + kE3 / 2, I + kI3 / 2, R + kR3 / 2);
            const kR4 = dt * dRdt(S + kS3 / 2, E + kE3 / 2, I + kI3 / 2, R + kR3 / 2);
            const kD4 = dt * dDdt(S + kS3 / 2, E + kE3 / 2, I + kI3 / 2, R + kR3 / 2);

            S = S + (kS1 + 2 * kS2 + 2 * kS3 + kS4) / 6;
            E = E + (kE1 + 2 * kE2 + 2 * kE3 + kE4) / 6;
            I = I + (kI1 + 2 * kI2 + 2 * kI3 + kI4) / 6;
            R = R + (kR1 + 2 * kR2 + 2 * kR3 + kR4) / 6;
            D = D + (kD1 + 2 * kD2 + 2 * kD3 + kD4) / 6;

            newSValues.push(S);
            newEValues.push(E);
            newIValues.push(I);
            newRValues.push(R);
            newDValues.push(D);
            newTValues.push(t);
            t += dt;
        }
        //console.log(sValues);
        setSValues(newSValues);
        setEValues(newEValues);
        setIValues(newIValues);
        setRValues(newRValues);
        setDValues(newDValues);
        setTValues(newTValues);
    }

    return (
        <div className={styles.container}>
            <div className={styles.user_entries_container}>
                <div className={styles.user_entries}>

                    <div className={styles.user_entry}>
                        <label htmlFor='virus-entry'>
                            Virus
                        </label>
                        <select defaultValue="COVID-19" onChange={handleVirusChange} readOnly={!isCustom}>
                            <option value="COVID-19">COVID-19</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>

                    <div className={styles.user_entry}>
                        <label htmlFor='s0-entry'>
                            Susceptible Population
                        </label>
                        <input
                            type='number'
                            id='s0-entry'
                            value={s0}
                            onChange={handleS0Change}
                        />
                    </div>

                    <div className={styles.user_entry}>
                        <label htmlFor='i0-entry'>
                            Infectious Population
                        </label>
                        <input
                            type='number'
                            id='i0-entry'
                            value={i0}
                            onChange={handleI0Change}
                        />
                    </div>

                    <div className={styles.user_entry}>
                        <label htmlFor='r0-entry'>
                            R<sub>0</sub>
                        </label>
                        <input
                            type='number'
                            id='r0-entry'
                            value={r0}
                            onChange={handleR0Change}
                            readOnly={!isCustom}
                        />
                    </div> 

                    <div className={styles.user_entry}>
                        <label htmlFor='latent-entry'>
                            Latent Period
                        </label>
                        <input
                            type='number'
                            id='latent-entry'
                            value={latentPeriod}
                            onChange={handleLatentPeriodChange}
                            readOnly={!isCustom}
                        />
                    </div> 

                    <div className={styles.user_entry}>
                        <label htmlFor='infectious-entry'>
                            Infectious Period
                        </label>
                        <input
                            type='number'
                            id='infectious-entry'
                            value={infectiousPeriod}
                            onChange={handleInfectiousPeriodChange}
                            readOnly={!isCustom}
                        />
                    </div> 

                    <div className={styles.user_entry}>
                        <label htmlFor='mortality-entry'>
                            Mortality Rate
                        </label>
                        <input
                            type='number'
                            id='mortality-entry'
                            value={mortalityRate}
                            onChange={handleMortalityRateChange}
                            readOnly={!isCustom}
                        />
                    </div> 

                    <div className={styles.user_entry}>
                        <label htmlFor='hygiene-entry'>
                            Hygiene Factor
                        </label>
                        <input
                            type='number'
                            id='hygiene-entry'
                            value={hygieneFactor}
                            onChange={handleHygieneFactorChange}
                        />
                    </div> 
                </div>
            </div>
            <div className={styles.chart}>
                <Line data={data} options={options} />
            </div>
        </div>
    )
}