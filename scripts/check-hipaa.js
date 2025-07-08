#!/usr/bin/env node
const fs = require('fs');

const filesToCheck = ['src/store/middleware/auditMiddleware.ts'];
let allPassed = true;

filesToCheck.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    allPassed = false;
    return;
  }
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('hipaa: true')) {
    console.error(`HIPAA compliance marker missing in ${file}`);
    allPassed = false;
  } else {
    console.log(`✅ ${file} contains HIPAA compliance marker`);
  }
});

if (!allPassed) {
  console.error('HIPAA compliance check failed.');
  process.exit(1);
}
console.log('HIPAA compliance check passed.');
