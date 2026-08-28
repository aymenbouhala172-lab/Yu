const fs = require('fs');
const path = require('path');

const dilemmasDir = path.join(__dirname, '../src/data/dilemmas');

// Import or define generator functions for all 6 volumes
// Each volume will produce an array of 100 deep, high-level Dilemma objects
console.log("Ready to build 600 issues across 6 files in:", dilemmasDir);
