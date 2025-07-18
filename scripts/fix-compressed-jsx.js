#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need fixing based on Netlify error
const criticalFiles = [
  '/workspaces/symfarmia/src/components/AIChat.jsx',
  '/workspaces/symfarmia/src/components/MinimalistLandingPage.jsx',
  '/workspaces/symfarmia/src/components/dashboard/DashboardMetrics.jsx',
  '/workspaces/symfarmia/src/components/MedicalAssistant.jsx',
  '/workspaces/symfarmia/src/components/MedicalCharts.jsx',
  '/workspaces/symfarmia/src/components/AnalyticsDashboard.jsx'
];

function formatJSXFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix compressed return statements
  content = content.replace(/return\s*\(\s*<[^>]+/g, (match) => {
    if (match.length > 100) {
      return match.replace(/return\s*\(/, 'return (\n  ');
    }
    return match;
  });
  
  // Add proper spacing for JSX elements
  content = content.replace(/>\s*{/g, '>\n    {');
  content = content.replace(/}\s*</g, '}\n    <');
  content = content.replace(/>\s*</g, '>\n    <');
  
  // Fix closing tags
  content = content.replace(/}\s*\)/g, '}\n  )');
  
  // Ensure proper spacing around export statements
  content = content.replace(/};\s*export\s+/g, '};\n\nexport ');
  content = content.replace(/}\s*export\s+/g, '}\n\nexport ');
  
  // Clean up excessive newlines
  content = content.replace(/\n{4,}/g, '\n\n\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${path.basename(filePath)}`);
}

// Create a proper formatter for the critical files
function properlyFormatFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const formattedLines = [];
  let inJSX = false;
  let jsxDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering JSX
    if (line.includes('return (') || line.includes('return(')) {
      inJSX = true;
      jsxDepth = 0;
      
      // If the return statement has JSX on the same line, split it
      if (line.includes('return (') && line.includes('<')) {
        const returnPart = line.substring(0, line.indexOf('(') + 1);
        const jsxPart = line.substring(line.indexOf('(') + 1);
        formattedLines.push(returnPart);
        
        // Process the JSX part
        const jsxElements = jsxPart.split(/(<[^>]+>)/g).filter(Boolean);
        for (const element of jsxElements) {
          if (element.trim()) {
            formattedLines.push('  '.repeat(Math.max(1, jsxDepth + 1)) + element.trim());
          }
        }
        continue;
      }
    }
    
    // If we're in JSX and the line is very long, try to break it up
    if (inJSX && line.length > 120) {
      // Split by JSX tags
      const parts = line.split(/(<[^>]+>|<\/[^>]+>)/g).filter(Boolean);
      let currentLine = '';
      
      for (const part of parts) {
        if (part.startsWith('<')) {
          if (currentLine) {
            formattedLines.push(currentLine);
            currentLine = '';
          }
          formattedLines.push('  '.repeat(Math.max(1, jsxDepth)) + part);
        } else {
          currentLine += part;
        }
      }
      
      if (currentLine) {
        formattedLines.push('  '.repeat(Math.max(1, jsxDepth)) + currentLine);
      }
    } else {
      formattedLines.push(line);
    }
    
    // Track JSX depth
    if (line.includes('<') && !line.includes('</')) {
      jsxDepth++;
    }
    if (line.includes('</')) {
      jsxDepth--;
    }
    
    // Check if we're exiting JSX
    if (inJSX && line.includes(');')) {
      inJSX = false;
      jsxDepth = 0;
    }
  }
  
  fs.writeFileSync(filePath, formattedLines.join('\n'), 'utf8');
  console.log(`✓ Properly formatted ${path.basename(filePath)}`);
}

console.log('🔧 Fixing compressed JSX files for Netlify...\n');

// Fix critical files first
criticalFiles.forEach(file => {
  formatJSXFile(file);
  properlyFormatFile(file);
});

console.log('\n✅ JSX formatting complete!');