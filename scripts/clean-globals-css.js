#!/usr/bin/env node

const fs = require('fs');

const filePath = '/workspaces/symfarmia/app/globals.css';
let content = fs.readFileSync(filePath, 'utf8');

// Remove dark mode base styles section (lines 211-282)
content = content.replace(/\/\* Dark mode base styles \*\/[\s\S]*?^\}/gm, '');

// Remove .dark body styles
content = content.replace(/\.dark body\s*\{[\s\S]*?\}/g, '');

// Remove .dark section with CSS variables
content = content.replace(/\.dark\s*\{[\s\S]*?^}\s*$/gm, '');

// Remove all .dark class selectors
content = content.replace(/\.dark\s+[^{]+\{[^}]*\}/g, '');

// Remove glass-dark component
content = content.replace(/\.glass-dark\s*\{[\s\S]*?\n\s*}/g, '');

// Clean up extra newlines
content = content.replace(/\n{3,}/g, '\n\n');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✓ Cleaned globals.css - Removed all dark mode styles');