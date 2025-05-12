import { optimizeSchedule } from './optimizer.js';
import { cloneDeep } from './utils.js';

export async function simulateRollingHorizons(config, totalTime = 120) {
  const windowSize = config.planningHorizon;
  const steps = Math.ceil(totalTime / windowSize);

  let globalTime = 0;
  let totalObjective = 0;
  let prevBest = null;

  for (let i = 0; i < steps; i++) {
    console.log(`📆 Planning Horizon ${i + 1}/${steps} (Time ${globalTime}–${globalTime + windowSize} min)`);

    // ⛔ structuredClone destroys functions → use shallow copy for scenario
    const configCopy = {
      ...cloneDeep(config),
      scenario: config.scenario, // preserve functions like arrivalRateFn
    };

    if (prevBest) {
      configCopy.seedIndividual = prevBest;
    }

    const result = await optimizeSchedule(configCopy);
    prevBest = result.best;

    totalObjective += result.best.waitingTime;
    globalTime += windowSize;
  }

  console.log(`✅ Total Objective Across All Horizons: ${totalObjective.toFixed(2)} min`);
}
