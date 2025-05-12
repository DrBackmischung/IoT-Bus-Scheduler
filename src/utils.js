import structuredClone from 'structured-clone'; // if needed via polyfill

export const cloneDeep = structuredClone;

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}