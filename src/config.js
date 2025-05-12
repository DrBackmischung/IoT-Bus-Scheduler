import { routeScenario } from './scenario.js';

export const config = {
    numBuses: 5,
    busCapacity: 40,

    // Evolutionary algorithm parameters
    generations: 50,
    populationSize: 30,
    crossoverRate: 0.8,
    mutationRate: 0.3,

    // Whether to optimize additional things in future
    optimizeSpeed: true,
    optimizeStops: false,

    // Used if scenario is missing anything or for random generation fallback
    defaultSpeed: 30, // km/h
    defaultBoardingTime: 5 / 60, // minutes
    defaultEnter: 1,
    defaultExit: 0,
    defaultDistance: 0.5, // km

    scenario: routeScenario,

    Vmin: 10,
    Vmax: 40,

    useArrivalRateFunctions: true, // toggle fm(t)
    arrivalRateResolution: 60, // number of integration slices

    // 🔧 FIXED: now handles bad t values robustly
    defaultArrivalRateFn: (t) => {
        const time = typeof t === 'number' && Number.isFinite(t) ? t : 0;
        return 1 + 0.005 * time;
    },

    planningHorizon: 60, // total minutes for all headways to sum up to
};
