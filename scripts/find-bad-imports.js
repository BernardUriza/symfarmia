#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Patterns that indicate problematic imports
const badPatterns = [
  // Old app/providers paths
  { regex: /from\s+['"].*?\/app\/providers\//g, name: 'app/providers imports' },
  // Wrong utils paths from components
  { regex: /from\s+['"]\.\.\/utils\//g, name: 'wrong relative utils imports' },
  // Missing src in @/ imports for providers
  { regex: /from\s+['"]@\/providers\//g, name: '@/providers without src' },
  // Wrong relative paths
  { regex: /from\s+['"]\.\.\/\.\.\/\.\.\/app\//g, name: 'triple-dot app imports' },
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  badPatterns.forEach(({ regex, name }) => {
    const matches = content.match(regex);
    if (matches) {
      const lines = content.split('\n');
      matches.forEach(match => {
        const lineNumber = lines.findIndex(line => line.includes(match)) + 1;
        issues.push({
          type: name,
          match: match.trim(),
          line: lineNumber
        });
      });
    }
  });
  
  return issues.length > 0 ? issues : null;
}

function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    if (item === 'node_modules' || item === '.next' || item === 'dist' || item === 'build' || item === '.git') {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log(`${colors.blue}🔍 Scanning for problematic imports...${colors.reset}\n`);

const files = getAllFiles(path.join(process.cwd(), 'src'));
let totalIssues = 0;
const filesWithIssues = [];

files.forEach(file => {
  const issues = scanFile(file);
  if (issues) {
    const relativePath = path.relative(process.cwd(), file);
    filesWithIssues.push({ file: relativePath, issues });
    
    console.log(`${colors.red}❌ ${relativePath}${colors.reset}`);
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${colors.yellow}${issue.type}${colors.reset}`);
      console.log(`   ${colors.red}${issue.match}${colors.reset}`);
      totalIssues++;
    });
    console.log();
  }
});

console.log(`\n${colors.blue}Summary:${colors.reset}`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files with issues: ${colors.red}${filesWithIssues.length}${colors.reset}`);
console.log(`Total issues found: ${colors.red}${totalIssues}${colors.reset}`);

if (filesWithIssues.length > 0) {
  // Save detailed report
  fs.writeFileSync(
    path.join(__dirname, 'bad-imports-report.json'),
    JSON.stringify({ 
      timestamp: new Date().toISOString(),
      filesWithIssues 
    }, null, 2)
  );
  
  console.log(`\n${colors.blue}📄 Detailed report saved to scripts/bad-imports-report.json${colors.reset}`);
  
  // Generate fix suggestions
  console.log(`\n${colors.yellow}💡 Suggested fixes:${colors.reset}`);
  console.log(`1. Replace '/app/providers/' with '/src/providers/'`);
  console.log(`2. Check relative paths - components should use '../providers' or '../../providers'`);
  console.log(`3. Use '@/src/providers' for absolute imports, not '@/providers'`);
} else {
  console.log(`\n${colors.green}✅ No import issues found!${colors.reset}`);
}