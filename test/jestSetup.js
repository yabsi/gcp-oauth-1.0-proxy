const Chance = require('chance');

const seed = Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER);

/* eslint-disable no-console */
console.log(`Seed is:${seed}`);
global.chance = Chance(seed);
