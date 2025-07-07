#!/usr/bin/env node
const { execSync } = require('child_process');

try {
  console.log('🔬 Running medical linting...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Medical linting passed');
} catch (err) {
  console.error('❌ Medical linting failed');
  process.exit(1);
}
