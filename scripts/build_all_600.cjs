const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/data/dilemmas');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Color palettes for categories
const ACCENTS = ['amber', 'emerald', 'sapphire', 'rose', 'violet', 'cyan'];

// Let's write the complete generator for all 6 files
console.log("Generating data for 600 dilemmas...");
