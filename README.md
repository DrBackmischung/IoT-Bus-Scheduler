# IoT Bus Scheduler

A Node.js simulation of the dynamic bus scheduling model described by Luo et al. in their 2019 paper. The project minimizes passenger waiting time using a genetic algorithm.

## Features

- Configurable number of buses, stops, planning horizon, etc.
- Simulates passenger arrival and boarding
- Uses genetic algorithm to optimize departure times and bus speeds
- Console output of optimized results

## Setup

```bash
npm install
npm start
```

## Configuration

Edit `src/config.json` to adjust simulation parameters.
