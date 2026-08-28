const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/data/dilemmas');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log("Creating detailed high-quality content generator for 600 dilemmas...");
