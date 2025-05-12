const { randomInt, randomFloat } = require('./utils');

function generateIndividual(config) {
  const headways = Array(config.numBuses).fill(0).map(() =>
    randomInt(config.minHeadway, config.maxHeadway)
  );
  const speeds = Array(config.numBuses).fill(0).map(() =>
    Array(config.numStops - 1).fill(0).map(() =>
      randomFloat(config.minSpeed, config.maxSpeed)
    )
  );
  return { headways, speeds };
}

function simulateIndividual(ind, config) {
  const arrivals = Array(config.numStops).fill(0).map((_, s) =>
    config.arrivalRatePerStop * config.planningHorizon
  );
  let waitingTime = 0;
  let arrivalTimes = [];
  let time = 0;

  for (let i = 0; i < config.numBuses; i++) {
    time += ind.headways[i];
    arrivalTimes[i] = Array(config.numStops).fill(0);
    let tripTime = 0;

    for (let s = 0; s < config.numStops - 1; s++) {
      const segmentTime = 1 / ind.speeds[i][s] * 60; // segment time in minutes
      tripTime += segmentTime;
      arrivalTimes[i][s + 1] = time + tripTime;
    }
  }

  for (let s = 0; s < config.numStops; s++) {
    const stopArrivalRate = config.arrivalRatePerStop;
    const totalArrivals = stopArrivalRate * config.planningHorizon;
    let lastArrival = 0;

    for (let i = 0; i < config.numBuses; i++) {
      const at = arrivalTimes[i][s] || (i === 0 ? ind.headways[0] : arrivalTimes[i - 1][s]);
      const wait = (at - lastArrival) * stopArrivalRate * 0.5;
      waitingTime += Math.max(0, wait);
      lastArrival = at;
    }
  }

  return waitingTime;
}

function crossover(p1, p2, config) {
  const child = generateIndividual(config);
  for (let i = 0; i < config.numBuses; i++) {
    child.headways[i] = Math.random() < 0.5 ? p1.headways[i] : p2.headways[i];
    for (let j = 0; j < config.numStops - 1; j++) {
      child.speeds[i][j] = Math.random() < 0.5 ? p1.speeds[i][j] : p2.speeds[i][j];
    }
  }
  return child;
}

function mutate(ind, config) {
  const i = randomInt(0, config.numBuses);
  ind.headways[i] = randomInt(config.minHeadway, config.maxHeadway);
  const j = randomInt(0, config.numStops - 1);
  ind.speeds[i][j] = randomFloat(config.minSpeed, config.maxSpeed);
}

function runSimulation(config) {
  let population = Array(config.populationSize).fill(0).map(() => generateIndividual(config));
  let best = null;

  for (let gen = 0; gen < config.generations; gen++) {
    const scored = population.map(ind => ({
      ind,
      fitness: simulateIndividual(ind, config)
    })).sort((a, b) => a.fitness - b.fitness);

    best = scored[0];
    console.log(`Gen ${gen + 1}: Best waiting time: ${best.fitness.toFixed(2)}`);

    const newPop = [best.ind];
    while (newPop.length < config.populationSize) {
      const [p1, p2] = [scored[randomInt(0, config.populationSize / 2)].ind, scored[randomInt(0, config.populationSize / 2)].ind];
      let child = crossover(p1, p2, config);
      if (Math.random() < config.mutationRate) mutate(child, config);
      newPop.push(child);
    }

    population = newPop;
  }

  console.log("\nBest Schedule Found:", JSON.stringify(best.ind, null, 2));
  console.log("Total Waiting Time:", best.fitness.toFixed(2), "minutes");
}

module.exports = { runSimulation };
