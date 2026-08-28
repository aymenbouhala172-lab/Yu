const fs = require('fs');
const path = require('path');

// Helper to escape backticks and quotes safely
function sanitize(str) {
  return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

console.log("Starting generation of 600 comprehensive dilemmas...");
