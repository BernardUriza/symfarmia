#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateVersionInfo() {
  try {
    // Get package.json version
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const version = packageJson.version;

    // Get git information
    let gitHash = '';
    let gitBranch = '';
    let gitDate = '';
    
    try {
      gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      gitBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      gitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    } catch (gitError) {
      console.warn('Git information not available:', gitError.message);
      gitHash = 'unknown';
      gitBranch = 'unknown';
      gitDate = new Date().toISOString();
    }

    // Generate build timestamp
    const buildDate = new Date().toISOString();

    // Create version info object
    const versionInfo = {
      version,
      gitHash,
      gitBranch,
      gitDate,
      buildDate,
      buildTimestamp: Date.now()
    };

    // Write to public directory so it's accessible by the frontend
    const outputPath = path.join(__dirname, '..', 'public', 'version.json');
    fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

    // Also create a JavaScript module for build-time inclusion
    const jsOutputPath = path.join(__dirname, '..', 'version-info.js');
    const jsContent = `// Auto-generated version information
// Generated at: ${buildDate}
export const VERSION_INFO = ${JSON.stringify(versionInfo, null, 2)};
`;
    fs.writeFileSync(jsOutputPath, jsContent);

    console.log('✅ Version information generated:');
    console.log(`   Version: ${version}`);
    console.log(`   Git Hash: ${gitHash}`);
    console.log(`   Git Branch: ${gitBranch}`);
    console.log(`   Build Date: ${buildDate}`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   JS Module: ${jsOutputPath}`);

    return versionInfo;
  } catch (error) {
    console.error('❌ Error generating version information:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateVersionInfo();
}

module.exports = { generateVersionInfo };