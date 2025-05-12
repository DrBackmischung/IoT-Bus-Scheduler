import { config } from './config.js';
import { simulateRollingHorizons } from './rolling.js';

async function main() {
  await simulateRollingHorizons(config, 120); // total 2 hours
}

main();
