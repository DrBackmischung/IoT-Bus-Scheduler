import {
    arrivalTime,
    alightingPassengers,
    boardingPassengers,
} from './model.js';
  
function integrateArrivalRate(fm, td, resolution) {
    if (typeof fm !== 'function') {
        console.error('❌ fm is not a function:', fm);
        return 0;
    }
    if (!Number.isFinite(td) || td < 0) {
        console.error('❌ td is invalid:', td);
        return 0;
    }
    if (!Number.isFinite(resolution) || resolution <= 0) {
        console.error('❌ resolution invalid:', resolution);
        return 0;
    }
  
    let sum = 0;
    const dt = td / resolution;
  
    for (let i = 0; i < resolution; i++) {
        const t = i * dt;
        const weight = td - t;
        const rate = fm(t);
    
        if (!Number.isFinite(rate)) {
            console.error(`❌ fm(t=${t}) returned NaN`);
            continue;
        }
    
        sum += weight * rate * dt;
    }
  
    return Number.isFinite(sum) ? sum : 0;
}  
  
export function simulate(individual, config) {
    const { headways, speeds } = individual;
    const stops = config.scenario;
    const numStops = stops.length;
  
    let totalWaitingTime = 0;
    let totalTfirst = 0;
    let totalUnboardedWait = 0;
    let unboardedCount = 0;
  
    const queues = stops.map(() => []); // dynamic passenger queues
    let time = 0;
    const busStates = [];
  
    for (let b = 0; b < config.numBuses; b++) {
        time += headways[b];
        let onboard = 0;
        let currentTime = time;
    
        for (let s = 0; s < numStops; s++) {
            const stop = stops[s];
    
            const boardingTime = stop.boardingTime ?? config.defaultBoardingTime;
            const exit = stop.exit ?? config.defaultExit;
    
            const distanceToNext = stop.distanceToNext ?? config.defaultDistance;
            const speedToNext = config.optimizeSpeed && speeds
            ? speeds[b][s] ?? config.defaultSpeed
            : stop.speedToNext ?? config.defaultSpeed;
    
            const arrivalPrev = busStates[b]?.arrivalTimes?.[s] ?? 0;

            const fm = (stop && typeof stop.arrivalRateFn === 'function')
            ? stop.arrivalRateFn
            : config.defaultArrivalRateFn;

            if (typeof fm !== 'function') {
                console.error(`❌ fm is not a function at stop ${stop?.name ?? s}`);
                throw new Error("Invalid arrival rate function (fm) — not a function");
            }

            const dt = currentTime - arrivalPrev;
            if (dt <= 0) {
                console.warn(`⚠️ Bus ${b}, stop ${s}: no new time passed (dt = ${dt})`);
            } else if (dt > 0) {
                const slices = config.arrivalRateResolution;
                if (!slices || slices <= 0) throw new Error("Invalid arrivalRateResolution");

                const deltaT = dt / slices;

                for (let i = 0; i < slices; i++) {
                const t = arrivalPrev + i * deltaT;
                const arriving = fm(t) * deltaT;
                    for (let j = 0; j < Math.floor(arriving); j++) {
                        queues[s].push({ tArrival: t });
                    }
                }
            }
                    
    
            const alight = alightingPassengers(onboard, exit);
            onboard -= alight;
    
            const boardable = Math.min(queues[s].length, config.busCapacity - onboard);
            for (let i = 0; i < boardable; i++) {
                queues[s].shift(); // remove from queue
            }
            onboard += boardable;
            totalWaitingTime += boardable * boardingTime;
    
            // Unboarded passenger wait
            queues[s].forEach(p => {
                totalUnboardedWait += currentTime - p.tArrival;
                unboardedCount++;
            });
    
            if (config.useArrivalRateFunctions) {
                if (!Number.isFinite(currentTime)) {
                    console.warn(`⚠️ Skipping Tfirst for invalid currentTime at stop ${s}: ${currentTime}`);
                } else {
                    const t1 = integrateArrivalRate(fm, currentTime, config.arrivalRateResolution);
                    if (!Number.isFinite(t1)) {
                        console.error(`❌ integrateArrivalRate returned NaN at stop ${stop.name}, time=${currentTime}`);
                    } else {
                        totalTfirst += t1;
                    }
                }
            }
              
            if (s < numStops - 1) {
                if (!distanceToNext || !speedToNext) {
                    console.warn(`⚠️ Invalid speed/distance at bus ${b}, stop ${s}`, {
                        distanceToNext,
                        speedToNext
                    });
                }
                  
                currentTime = arrivalTime(currentTime, distanceToNext, speedToNext);
            }
    
            if (!busStates[b]) busStates[b] = { arrivalTimes: [] };
            busStates[b].arrivalTimes[s] = currentTime;
        }
    }
  
    const TleftAvg = unboardedCount > 0 ? totalUnboardedWait / unboardedCount : 0;

    const total = totalWaitingTime + totalTfirst + TleftAvg;

    if (Number.isNaN(total)) {
        console.error('❌ simulate() returned NaN. Details:');
        console.error({ totalWaitingTime, totalTfirst, TleftAvg });
    }

    return total;
}
  