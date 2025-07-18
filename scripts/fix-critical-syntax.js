#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Critical files that need immediate fixing based on build errors
const criticalFiles = [
  {
    path: '/workspaces/symfarmia/app/auth/logout/page.tsx',
    error: "Parsing error: ')' expected at line 4"
  },
  {
    path: '/workspaces/symfarmia/src/components/PatientManagementPreview.tsx',
    error: "Parsing error: ';' expected at line 1"
  },
  {
    path: '/workspaces/symfarmia/src/components/consultation/ConsultationSettings.jsx',
    error: "Parsing error: ':' expected at line 22"
  },
  {
    path: '/workspaces/symfarmia/src/components/consultation/settings/QuickPresets.jsx',
    error: "Parsing error: '}' expected at line 35"
  },
  {
    path: '/workspaces/symfarmia/src/components/medical/SOAPNotesManager.tsx',
    error: "Expected ';', '}' or <eof>"
  }
];

function fixCriticalSyntax(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Fix compressed lines with multiple statements
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is too long and has multiple statements
    if (line.length > 200) {
      let fixedLine = line;
      
      // Add newlines after import statements
      fixedLine = fixedLine.replace(/;(\s*import\s+)/g, ';\n$1');
      
      // Add newlines after const/let/var declarations
      fixedLine = fixedLine.replace(/;(\s*(?:const|let|var)\s+)/g, ';\n$1');
      
      // Add newlines before export statements
      fixedLine = fixedLine.replace(/;(\s*export\s+)/g, ';\n\n$1');
      
      // Add newlines after closing braces followed by const/let/var
      fixedLine = fixedLine.replace(/\}(\s*(?:const|let|var)\s+)/g, '}\n\n$1');
      
      // Fix interface/type declarations on same line
      fixedLine = fixedLine.replace(/;(\s*(?:interface|type)\s+)/g, ';\n\n$1');
      
      // Fix compressed arrow functions
      fixedLine = fixedLine.replace(/\}\s*\)\s*=>\s*\{/g, '}) => {\n  ');
      
      // Fix compressed object destructuring
      fixedLine = fixedLine.replace(/\{([^}]{100,})\}/g, (match, content) => {
        if (content.includes(',') && !content.includes('\n')) {
          const formatted = content.split(',').map(item => item.trim()).join(',\n  ');
          return `{\n  ${formatted}\n}`;
        }
        return match;
      });
      
      fixedLines.push(...fixedLine.split('\n'));
    } else {
      fixedLines.push(line);
    }
  }
  
  content = fixedLines.join('\n');
  
  // Specific fixes for known issues
  if (filePath.includes('logout/page.tsx')) {
    // Fix missing closing parenthesis
    content = content.replace(/export default function.*?\{/s, (match) => {
      const parenCount = (match.match(/\(/g) || []).length;
      const closeParenCount = (match.match(/\)/g) || []).length;
      if (parenCount > closeParenCount) {
        return match.replace('{', ') {');
      }
      return match;
    });
  }
  
  if (filePath.includes('QuickPresets.jsx')) {
    // Fix missing closing braces in JSX
    let braceBalance = 0;
    const chars = content.split('');
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === '{') braceBalance++;
      if (chars[i] === '}') braceBalance--;
    }
    if (braceBalance > 0) {
      content += '\n' + '}'.repeat(braceBalance);
    }
  }
  
  // Clean up multiple empty lines
  content = content.replace(/\n{4,}/g, '\n\n\n');
  
  // Ensure file ends with newline
  if (!content.endsWith('\n')) {
    content += '\n';
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${path.basename(filePath)}`);
  } else {
    console.log(`⚠️  No changes needed for ${path.basename(filePath)}`);
  }
}

console.log('🔧 Fixing critical syntax errors...\n');

criticalFiles.forEach(file => {
  console.log(`Fixing: ${path.basename(file.path)} - ${file.error}`);
  fixCriticalSyntax(file.path);
});

console.log('\n✅ Critical syntax fixes complete!');