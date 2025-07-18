#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need fixing based on Netlify error log
const filesToFix = [
  '/workspaces/symfarmia/src/components/AIChat.jsx',
  '/workspaces/symfarmia/src/components/MinimalistLandingPage.jsx',
  '/workspaces/symfarmia/src/components/dashboard/DashboardMetrics.jsx',
  '/workspaces/symfarmia/src/components/MedicalAssistant.jsx',
  '/workspaces/symfarmia/src/components/MedicalCharts.jsx',
  '/workspaces/symfarmia/src/components/AnalyticsDashboard.jsx'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;
  
  // Fix compressed import/export lines
  // Pattern: } from 'module'; const Component = 
  content = content.replace(/\} from (['"]).+?\1;\s*const\s+/g, (match) => {
    return match.replace(/;\s*const/, ';\n\nconst');
  });
  
  // Fix compressed export statements
  // Pattern: }; export default
  content = content.replace(/\};\s*export\s+(default|{)/g, (match) => {
    return match.replace(/;\s*export/, ';\n\nexport');
  });
  
  // Fix lines that are too long (likely compressed)
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (const line of lines) {
    if (line.length > 500 && line.includes('const') && line.includes('=>')) {
      // This line is likely compressed JavaScript
      let fixedLine = line;
      
      // Add newlines after semicolons
      fixedLine = fixedLine.replace(/;\s*/g, ';\n');
      
      // Add newlines before const declarations
      fixedLine = fixedLine.replace(/\s+const\s+/g, '\n\nconst ');
      
      // Add newlines before function declarations
      fixedLine = fixedLine.replace(/\s*\=>\s*\{/g, ' => {\n  ');
      
      // Add newlines after closing braces followed by semicolon
      fixedLine = fixedLine.replace(/\};\s*/g, '};\n');
      
      // Split and add to fixed lines
      fixedLines.push(...fixedLine.split('\n'));
    } else {
      fixedLines.push(line);
    }
  }
  
  content = fixedLines.join('\n');
  
  // Clean up multiple empty lines
  content = content.replace(/\n{3,}/g, '\n\n');
  
  // Ensure proper spacing around component declaration
  content = content.replace(/\n(const\s+\w+\s*=\s*\(\s*\)\s*=>\s*\{)/g, '\n\n$1');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${path.basename(filePath)}`);
  } else {
    console.log(`- No changes needed for ${path.basename(filePath)}`);
  }
}

console.log('🔧 Fixing Netlify syntax errors...\n');

filesToFix.forEach(fixFile);

// Also check for any other JSX files that might have similar issues
const srcDir = '/workspaces/symfarmia/src/components';
const findCompressedFiles = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findCompressedFiles(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      // Check if any line is suspiciously long
      const hasCompressedCode = lines.some(line => 
        line.length > 500 && 
        line.includes('const') && 
        (line.includes('=>') || line.includes('export'))
      );
      
      if (hasCompressedCode && !filesToFix.includes(fullPath)) {
        console.log(`\n⚠️  Found potentially compressed file: ${fullPath}`);
        fixFile(fullPath);
      }
    }
  });
};

console.log('\n🔍 Scanning for other compressed files...\n');
findCompressedFiles(srcDir);

console.log('\n✅ Syntax fix complete!');