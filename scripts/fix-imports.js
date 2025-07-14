#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Import patterns to fix
const importPatterns = [
  // Fix @/app/providers to @/src/providers
  {
    pattern: /from\s+['"]@\/app\/providers\/(.*?)['"]/g,
    replacement: 'from \'@/src/providers/$1\'',
    description: '@/app/providers → @/src/providers'
  },
  // Fix relative app/providers imports
  {
    pattern: /from\s+['"]\.\.\/\.\.\/app\/providers\/(.*?)['"]/g,
    replacement: (match, capture, offset, string, groups) => {
      const filePath = groups.filePath;
      const depth = (filePath.match(/\//g) || []).length - 2; // src/components/... depth
      const dots = '../'.repeat(depth);
      return `from '${dots}providers/${capture}'`;
    },
    description: '../app/providers → ../providers'
  },
  {
    pattern: /from\s+['"]\.\.\/app\/providers\/(.*?)['"]/g,
    replacement: (match, capture) => {
      return `from '../../providers/${capture}'`;
    },
    description: '../app/providers → ../../providers'
  },
  // Fix @/app/ paths to @/src/ for components in src directory
  {
    pattern: /from\s+['"]@\/app\/(.*?)['"]/g,
    replacement: (match, capture) => {
      // Check if it's a provider import
      if (capture.startsWith('providers/')) {
        return `from '@/src/${capture}'`;
      }
      // For other app imports, keep them as is (they might be valid API routes)
      return match;
    },
    description: '@/app/* → @/src/* (for src imports)'
  }
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/scripts/fix-imports.js' // Don't modify this file itself
];

function findFiles(pattern) {
  return glob.sync(pattern, {
    ignore: excludePatterns,
    nodir: true
  });
}

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const changes = [];

  importPatterns.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const newContent = content.replace(pattern, (m, ...args) => {
          // Pass file context for dynamic replacements
          if (typeof replacement === 'function') {
            args[args.length - 1] = { filePath };
            return replacement(m, ...args);
          }
          return replacement;
        });
        
        if (newContent !== content) {
          changes.push({
            old: match,
            new: match.replace(pattern, replacement),
            description
          });
          content = newContent;
          modified = true;
        }
      });
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return changes;
  }

  return null;
}

function main() {
  console.log(`${colors.blue}🔍 Searching for files with import issues...${colors.reset}\n`);

  // Find all TypeScript and JavaScript files
  const files = [
    ...findFiles('**/*.ts'),
    ...findFiles('**/*.tsx'),
    ...findFiles('**/*.js'),
    ...findFiles('**/*.jsx')
  ];

  console.log(`Found ${files.length} files to check\n`);

  let totalFixed = 0;
  const fixedFiles = [];

  files.forEach(file => {
    const changes = fixImportsInFile(file);
    if (changes) {
      totalFixed++;
      fixedFiles.push({ file, changes });
      
      console.log(`${colors.green}✓${colors.reset} Fixed ${file}`);
      changes.forEach(change => {
        console.log(`  ${colors.yellow}→${colors.reset} ${change.description}`);
        console.log(`    ${colors.red}- ${change.old}${colors.reset}`);
        console.log(`    ${colors.green}+ ${change.new}${colors.reset}`);
      });
      console.log();
    }
  });

  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`Total files checked: ${files.length}`);
  console.log(`Files fixed: ${colors.green}${totalFixed}${colors.reset}`);
  
  if (totalFixed > 0) {
    console.log(`\n${colors.green}✅ Successfully fixed import paths in ${totalFixed} files!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}No import issues found.${colors.reset}`);
  }

  // Save report
  if (fixedFiles.length > 0) {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      fixedFiles: fixedFiles.length,
      changes: fixedFiles
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'import-fixes-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n${colors.blue}📄 Detailed report saved to scripts/import-fixes-report.json${colors.reset}`);
  }
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}