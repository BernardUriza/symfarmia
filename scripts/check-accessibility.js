#!/usr/bin/env node

/**
 * Accessibility Audit Script for SYMFARMIA
 * Checks color contrast ratios and validates WCAG AA compliance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color combinations to test (from our modal)
const colorTests = [
  // Light mode
  { bg: '#ffffff', text: '#111827', name: 'Light mode - Main text' },
  { bg: '#ffffff', text: '#374151', name: 'Light mode - Secondary text' },
  { bg: '#ffffff', text: '#6b7280', name: 'Light mode - Muted text' },
  { bg: '#f9fafb', text: '#111827', name: 'Light mode - Footer background' },
  { bg: '#2563eb', text: '#ffffff', name: 'Light mode - Primary button' },
  { bg: '#ffffff', text: '#6b7280', name: 'Light mode - Border contrast' },
  
  // Dark mode
  { bg: '#1f2937', text: '#ffffff', name: 'Dark mode - Main text' },
  { bg: '#1f2937', text: '#d1d5db', name: 'Dark mode - Secondary text' },
  { bg: '#1f2937', text: '#9ca3af', name: 'Dark mode - Muted text' },
  { bg: '#111827', text: '#ffffff', name: 'Dark mode - Modal background' },
  { bg: '#2563eb', text: '#ffffff', name: 'Dark mode - Primary button' },
  { bg: '#1f2937', text: '#9ca3af', name: 'Dark mode - Input border' },
];

// WCAG AA standards
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;
const WCAG_AAA_NORMAL = 7.0;

/**
 * Calculate luminance of a color
 */
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
function checkWCAGCompliance(ratio, isLargeText = false) {
  const normalThreshold = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
  
  return {
    aa: ratio >= normalThreshold,
    aaa: ratio >= WCAG_AAA_NORMAL,
    ratio: ratio.toFixed(2)
  };
}

/**
 * Generate accessibility report
 */
function generateAccessibilityReport() {
  console.log('🔍 SYMFARMIA Accessibility Audit Report');
  console.log('=' .repeat(50));
  console.log();

  let allPassed = true;
  const results = [];

  colorTests.forEach(test => {
    const ratio = getContrastRatio(test.bg, test.text);
    const compliance = checkWCAGCompliance(ratio);
    
    const status = compliance.aa ? '✅ PASS' : '❌ FAIL';
    const aaaStatus = compliance.aaa ? '(AAA ✅)' : '(AAA ❌)';
    
    console.log(`${status} ${test.name}`);
    console.log(`   Contrast: ${compliance.ratio}:1 ${aaaStatus}`);
    console.log(`   Colors: ${test.text} on ${test.bg}`);
    console.log();

    if (!compliance.aa) {
      allPassed = false;
    }

    results.push({
      ...test,
      ratio: compliance.ratio,
      aa: compliance.aa,
      aaa: compliance.aaa
    });
  });

  // Summary
  console.log('📊 Summary');
  console.log('-'.repeat(20));
  const passed = results.filter(r => r.aa).length;
  const total = results.length;
  console.log(`WCAG AA: ${passed}/${total} tests passed`);
  
  const aaaPassed = results.filter(r => r.aaa).length;
  console.log(`WCAG AAA: ${aaaPassed}/${total} tests passed`);
  console.log();

  if (allPassed) {
    console.log('🎉 All color combinations meet WCAG AA standards!');
  } else {
    console.log('⚠️  Some color combinations need improvement.');
    console.log('💡 Consider using darker text or lighter backgrounds.');
  }

  return { allPassed, results };
}

/**
 * Check if @tailwindcss/forms is installed
 */
function checkTailwindForms() {
  try {
    const packageJson = require('../package.json');
    const hasForms = packageJson.dependencies?.['@tailwindcss/forms'] || 
                    packageJson.devDependencies?.['@tailwindcss/forms'];
    
    if (hasForms) {
      console.log('✅ @tailwindcss/forms is installed');
    } else {
      console.log('❌ @tailwindcss/forms is not installed');
      console.log('💡 Install it with: npm install @tailwindcss/forms');
    }
    
    return !!hasForms;
  } catch (error) {
    console.log('⚠️  Could not check @tailwindcss/forms installation');
    return false;
  }
}

/**
 * Generate accessibility recommendations
 */
function generateRecommendations() {
  console.log();
  console.log('🚀 Accessibility Recommendations');
  console.log('=' .repeat(40));
  console.log();
  
  console.log('📋 Manual Testing Checklist:');
  console.log('  □ Test keyboard navigation (Tab, Enter, Space, Esc)');
  console.log('  □ Test with screen reader (NVDA, JAWS, VoiceOver)');
  console.log('  □ Verify focus indicators are visible');
  console.log('  □ Check color blindness accessibility');
  console.log('  □ Test at 200% zoom level');
  console.log('  □ Validate HTML semantics');
  console.log();
  
  console.log('🔧 Automated Tools:');
  console.log('  • axe DevTools (browser extension)');
  console.log('  • Lighthouse accessibility audit');
  console.log('  • WAVE Web Accessibility Evaluator');
  console.log('  • Pa11y command line tool');
  console.log();
  
  console.log('📦 Installation Commands:');
  console.log('  npm install --save-dev @axe-core/playwright');
  console.log('  npm install --save-dev pa11y');
  console.log('  npm install --save-dev @tailwindcss/forms');
  console.log();
}

/**
 * Main execution
 */
function main() {
  const { allPassed } = generateAccessibilityReport();
  checkTailwindForms();
  generateRecommendations();
  
  // Exit with error code if tests failed
  process.exit(allPassed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  getContrastRatio,
  checkWCAGCompliance,
  generateAccessibilityReport
};