import { simulate } from './simulation.js';
import { randomInt, randomFloat, cloneDeep } from './utils.js';

function repairHeadways(ind, config) {
    const sum = ind.headways.reduce((a, b) => a + b, 0);
    const scale = config.planningHorizon / sum;
    ind.headways = ind.headways.map(h => h * scale);
}  

function generateRandomIndividual(config) {
    const headways = Array(config.numBuses).fill(0).map(() =>
        randomInt(1, 5)
    );

    let speeds = undefined;
    if (config.optimizeSpeed) {
        speeds = Array(config.numBuses).fill(0).map(() =>
            Array(config.scenario.length - 1).fill(0).map(() =>
                randomFloat(config.Vmin, config.Vmax)
            )
        );
    }

    return { headways, speeds };
}

function crossover(p1, p2, config) {
    const child = cloneDeep(p1);
    const point = randomInt(0, config.numBuses - 1);
    for (let i = point; i < config.numBuses; i++) {
        child.headways[i] = p2.headways[i];
        if (config.optimizeSpeed && p2.speeds) {
        child.speeds[i] = [...p2.speeds[i]];
        }
    }
    return child;
}

function mutate(ind, config) {
    const i = randomInt(0, config.numBuses - 1);
    ind.headways[i] = randomInt(1, 5);
    if (config.optimizeSpeed && ind.speeds) {
        const j = randomInt(0, config.scenario.length - 2);
        ind.speeds[i][j] = randomFloat(config.Vmin, config.Vmax);
    }
}

export async function optimizeSchedule(config) {
    let population = [];

    if (config.seedIndividual) {
        population.push(cloneDeep(config.seedIndividual));
    }
    
    while (population.length < config.populationSize) {
        population.push(generateRandomIndividual(config));
    }

    let best = null;

    for (let gen = 0; gen < config.generations; gen++) {
        const scored = population.map(ind => ({
            ...ind,
            waitingTime: simulate(ind, config),
        })).sort((a, b) => a.waitingTime - b.waitingTime);

        best = scored[0];
        console.log(`Gen ${gen + 1}: Best waiting time = ${best.waitingTime.toFixed(2)} min`);

        const nextGen = [cloneDeep(best)];
        while (nextGen.length < config.populationSize) {
        const [p1, p2] = [
            scored[randomInt(0, config.populationSize / 2)],
            scored[randomInt(0, config.populationSize / 2)],
        ];
        let child = crossover(p1, p2, config);
        if (Math.random() < config.mutationRate) mutate(child, config);
            repairHeadways(child, config);
            nextGen.push(child);
        }

        population = nextGen;
    }

    return { best };
}
