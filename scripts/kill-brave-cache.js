#!/usr/bin/env node
/**
 * 🦁 BRAVE CACHE NUCLEAR DESTRUCTION SYSTEM
 * 
 * Brave Browser tiene cache más agresivo que Chrome
 * Este script elimina TODA la cache de Brave para desarrollo
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class BraveCacheDestroyer {
  constructor() {
    this.platform = os.platform();
    this.homeDir = os.homedir();
    this.destroyed = [];
    this.errors = [];
  }

  async destroyBraveCache() {
    console.log('🦁 BRAVE CACHE NUCLEAR DESTRUCTION INITIATED...\n');

    // Next.js cache destruction
    await this.destroyNextJSCache();
    
    // Brave browser cache destruction by platform
    switch (this.platform) {
      case 'darwin': // macOS
        await this.destroyMacOSBraveCache();
        break;
      case 'linux':
        await this.destroyLinuxBraveCache();
        break;
      case 'win32':
        await this.destroyWindowsBraveCache();
        break;
      default:
        console.log('⚠️  Platform not specifically supported, using generic cleanup');
        await this.destroyGenericCache();
    }

    // Report destruction results
    this.reportDestruction();
  }

  async destroyNextJSCache() {
    console.log('🔥 Destroying Next.js cache...');
    
    const nextDirs = ['.next', 'node_modules/.cache'];
    
    for (const dir of nextDirs) {
      try {
        if (fs.existsSync(dir)) {
          await this.removeDirectory(dir);
          this.destroyed.push(`Next.js ${dir}`);
        }
      } catch (error) {
        this.errors.push(`Failed to remove ${dir}: ${error.message}`);
      }
    }
  }

  async destroyMacOSBraveCache() {
    console.log('🍎 Destroying macOS Brave cache...');
    
    const bravePaths = [
      `${this.homeDir}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Cache`,
      `${this.homeDir}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Code Cache`,
      `${this.homeDir}/Library/Application Support/BraveSoftware/Brave-Browser/Default/GPUCache`,
      `${this.homeDir}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Service Worker`,
      `${this.homeDir}/Library/Caches/BraveSoftware/Brave-Browser`,
      `${this.homeDir}/Library/Caches/com.brave.Browser`,
      `${this.homeDir}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Local Storage`,
      `${this.homeDir}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Session Storage`
    ];

    for (const cachePath of bravePaths) {
      await this.destroyPath(cachePath);
    }
  }

  async destroyLinuxBraveCache() {
    console.log('🐧 Destroying Linux Brave cache...');
    
    const bravePaths = [
      `${this.homeDir}/.config/BraveSoftware/Brave-Browser/Default/Cache`,
      `${this.homeDir}/.config/BraveSoftware/Brave-Browser/Default/Code Cache`,
      `${this.homeDir}/.config/BraveSoftware/Brave-Browser/Default/GPUCache`,
      `${this.homeDir}/.config/BraveSoftware/Brave-Browser/Default/Service Worker`,
      `${this.homeDir}/.cache/BraveSoftware/Brave-Browser`,
      `${this.homeDir}/.config/BraveSoftware/Brave-Browser/Default/Local Storage`,
      `${this.homeDir}/.config/BraveSoftware/Brave-Browser/Default/Session Storage`
    ];

    for (const cachePath of bravePaths) {
      await this.destroyPath(cachePath);
    }
  }

  async destroyWindowsBraveCache() {
    console.log('🪟 Destroying Windows Brave cache...');
    
    const localAppData = process.env.LOCALAPPDATA;
    const appData = process.env.APPDATA;
    
    const bravePaths = [
      `${localAppData}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Cache`,
      `${localAppData}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Code Cache`,
      `${localAppData}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\GPUCache`,
      `${localAppData}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Service Worker`,
      `${appData}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Local Storage`,
      `${appData}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Session Storage`
    ];

    for (const cachePath of bravePaths) {
      await this.destroyPath(cachePath);
    }
  }

  async destroyGenericCache() {
    console.log('🌐 Generic cache destruction...');
    
    // Try common cache locations
    const possiblePaths = [
      '.next',
      'node_modules/.cache',
      '.cache',
      'dist',
      'build'
    ];

    for (const dir of possiblePaths) {
      await this.destroyPath(dir);
    }
  }

  async destroyPath(cachePath) {
    try {
      if (fs.existsSync(cachePath)) {
        const stats = fs.statSync(cachePath);
        
        if (stats.isDirectory()) {
          await this.removeDirectory(cachePath);
          this.destroyed.push(cachePath);
          console.log(`  ✅ Destroyed: ${cachePath}`);
        } else {
          fs.unlinkSync(cachePath);
          this.destroyed.push(cachePath);
          console.log(`  ✅ Removed: ${cachePath}`);
        }
      }
    } catch (error) {
      this.errors.push(`Failed to destroy ${cachePath}: ${error.message}`);
      console.log(`  ❌ Failed: ${cachePath} - ${error.message}`);
    }
  }

  async removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      try {
        // Use platform-specific removal
        if (this.platform === 'win32') {
          execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
        } else {
          execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
        }
      } catch (error) {
        // Fallback to Node.js fs removal
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    }
  }

  reportDestruction() {
    console.log('\n' + '='.repeat(60));
    console.log('🦁 BRAVE CACHE NUCLEAR DESTRUCTION REPORT');
    console.log('='.repeat(60));
    
    console.log(`✅ Successfully destroyed: ${this.destroyed.length} cache locations`);
    this.destroyed.forEach(path => console.log(`   🔥 ${path}`));
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`   ⚠️  ${error}`));
    }
    
    console.log('\n🚀 BRAVE CACHE DESTRUCTION COMPLETE!');
    console.log('💡 Recommendations for Brave development:');
    console.log('   1. Open Developer Tools (F12)');
    console.log('   2. Go to Network tab');
    console.log('   3. Check "Disable cache" checkbox');
    console.log('   4. Or use Incognito mode for development');
    console.log('   5. Disable Brave Shields for localhost');
    console.log('='.repeat(60));
  }
}

// Execute if run directly
if (require.main === module) {
  const destroyer = new BraveCacheDestroyer();
  destroyer.destroyBraveCache().catch(error => {
    console.error('💥 BRAVE CACHE DESTRUCTION FAILED:', error);
    process.exit(1);
  });
}

module.exports = { BraveCacheDestroyer };