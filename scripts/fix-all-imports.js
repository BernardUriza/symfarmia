#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Import patterns to fix
const importPatterns = [
  {
    pattern: /from\s+['"]@\/app\/providers\//g,
    fix: (match) => match.replace('@/app/providers/', '@/src/providers/'),
    description: '@/app/providers → @/src/providers'
  },
  {
    pattern: /from\s+['"]@\/app\//g,
    fix: (match) => {
      // Only fix if it's importing from src directories
      if (match.includes('providers/') || match.includes('domains/') || match.includes('components/')) {
        return match.replace('@/app/', '@/src/');
      }
      return match;
    },
    description: '@/app/* → @/src/* (selective)'
  }
];

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    // Skip directories we don't want to process
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

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const changes = [];
  
  for (const { pattern, fix, description } of importPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      const originalContent = content;
      content = content.replace(pattern, fix);
      
      if (content !== originalContent) {
        modified = true;
        changes.push({ description, count: matches.length });
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return changes;
  }
  
  return null;
}

function main() {
  console.log(`${colors.blue}🔍 Scanning for import issues...${colors.reset}\n`);
  
  const srcFiles = getAllFiles(path.join(process.cwd(), 'src'));
  const appFiles = getAllFiles(path.join(process.cwd(), 'app'));
  const utilsFiles = fs.existsSync(path.join(process.cwd(), 'utils')) 
    ? getAllFiles(path.join(process.cwd(), 'utils'))
    : [];
  
  const allFiles = [...srcFiles, ...appFiles, ...utilsFiles];
  
  console.log(`Found ${allFiles.length} files to check\n`);
  
  let totalFixed = 0;
  const results = [];
  
  for (const file of allFiles) {
    const changes = fixFile(file);
    if (changes) {
      totalFixed++;
      const relativePath = path.relative(process.cwd(), file);
      results.push({ file: relativePath, changes });
      
      console.log(`${colors.green}✓${colors.reset} Fixed: ${relativePath}`);
      for (const change of changes) {
        console.log(`  ${colors.yellow}→${colors.reset} ${change.description} (${change.count} occurrences)`);
      }
    }
  }
  
  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`Files checked: ${allFiles.length}`);
  console.log(`Files fixed: ${colors.green}${totalFixed}${colors.reset}`);
  
  if (totalFixed === 0) {
    console.log(`\n${colors.green}✅ No import issues found!${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✅ Fixed imports in ${totalFixed} files!${colors.reset}`);
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      filesFixed: totalFixed,
      details: results
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'import-fix-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`${colors.blue}📄 Report saved to scripts/import-fix-report.json${colors.reset}`);
  }
}

// Check Next.js server after fixing
function checkServer() {
  console.log(`\n${colors.blue}🔍 Checking if server compiles...${colors.reset}`);
  
  // Create a test script to check compilation
  const testScript = `
const { exec } = require('child_process');

exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', (error, stdout) => {
  if (error || stdout !== '200') {
    console.log('${colors.red}❌ Server still has errors${colors.reset}');
    process.exit(1);
  } else {
    console.log('${colors.green}✅ Server is running without errors!${colors.reset}');
  }
});
`;

  setTimeout(() => {
    eval(testScript);
  }, 3000);
}

// Run the script
try {
  main();
  console.log(`\n${colors.yellow}⏳ Waiting for server to reload...${colors.reset}`);
  setTimeout(checkServer, 5000);
} catch (error) {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}