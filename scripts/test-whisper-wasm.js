#!/usr/bin/env node

/**
 * Test script for Whisper.cpp WASM setup
 * Verifies that all components are properly configured
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const access = promisify(fs.access);
const stat = promisify(fs.stat);

// Test configuration
const TESTS = [
  {
    name: 'WASM File Check',
    description: 'Verify whisper.wasm exists in public directory',
    test: async () => {
      const wasmPath = path.join(process.cwd(), 'public', 'whisper.wasm');
      await access(wasmPath);
      const stats = await stat(wasmPath);
      return {
        success: true,
        message: `WASM file found (${Math.round(stats.size / 1024 / 1024)}MB)`,
        details: { path: wasmPath, size: stats.size }
      };
    }
  },
  {
    name: 'Model Files Check',
    description: 'Verify model files exist',
    test: async () => {
      const modelsDir = path.join(process.cwd(), 'public', 'models');
      const modelFiles = ['ggml-base.bin', 'ggml-base.en.bin'];
      const results = {};
      
      for (const modelFile of modelFiles) {
        const modelPath = path.join(modelsDir, modelFile);
        try {
          await access(modelPath);
          const stats = await stat(modelPath);
          results[modelFile] = {
            exists: true,
            size: stats.size,
            sizeMB: Math.round(stats.size / 1024 / 1024)
          };
        } catch (error) {
          results[modelFile] = {
            exists: false,
            error: error.message
          };
        }
      }
      
      const existingModels = Object.values(results).filter(r => r.exists).length;
      
      return {
        success: existingModels > 0,
        message: `${existingModels}/${modelFiles.length} models found`,
        details: results
      };
    }
  },
  {
    name: 'Configuration Files Check',
    description: 'Verify configuration files exist',
    test: async () => {
      const configFiles = [
        'next.config.js',
        'package.json'
      ];
      
      const results = {};
      
      for (const configFile of configFiles) {
        const configPath = path.join(process.cwd(), configFile);
        try {
          await access(configPath);
          results[configFile] = { exists: true };
        } catch (error) {
          results[configFile] = { exists: false, error: error.message };
        }
      }
      
      const existingConfigs = Object.values(results).filter(r => r.exists).length;
      
      return {
        success: existingConfigs === configFiles.length,
        message: `${existingConfigs}/${configFiles.length} config files found`,
        details: results
      };
    }
  },
  {
    name: 'Next.js Headers Check',
    description: 'Verify Next.js is configured to serve WASM files',
    test: async () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      
      const hasWasmHeaders = nextConfig.includes('application/wasm');
      const hasCOEP = nextConfig.includes('Cross-Origin-Embedder-Policy');
      const hasCOOP = nextConfig.includes('Cross-Origin-Opener-Policy');
      
      return {
        success: hasWasmHeaders && hasCOEP && hasCOOP,
        message: hasWasmHeaders && hasCOEP && hasCOOP ? 
          'Next.js WASM headers configured correctly' : 
          'Next.js WASM headers missing or incomplete',
        details: {
          wasmHeaders: hasWasmHeaders,
          coepHeaders: hasCOEP,
          coopHeaders: hasCOOP
        }
      };
    }
  },
  {
    name: 'Package.json Scripts Check',
    description: 'Verify npm scripts are configured',
    test: async () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredScripts = [
        'whisper:test'
      ];
      
      const results = {};
      
      for (const script of requiredScripts) {
        results[script] = {
          exists: !!(packageJson.scripts && packageJson.scripts[script])
        };
      }
      
      const existingScripts = Object.values(results).filter(r => r.exists).length;
      
      return {
        success: existingScripts === requiredScripts.length,
        message: `${existingScripts}/${requiredScripts.length} scripts configured`,
        details: results
      };
    }
  },
  {
    name: 'Dependencies Check',
    description: 'Verify required dependencies are installed',
    test: async () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredDeps = [
        'whisper.cpp',
        'onnxruntime-web',
        'web-audio-api'
      ];
      
      const results = {};
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      for (const dep of requiredDeps) {
        results[dep] = {
          exists: !!allDeps[dep],
          version: allDeps[dep] || 'not installed'
        };
      }
      
      const existingDeps = Object.values(results).filter(r => r.exists).length;
      
      return {
        success: existingDeps === requiredDeps.length,
        message: `${existingDeps}/${requiredDeps.length} dependencies installed`,
        details: results
      };
    }
  },
  {
    name: 'Engine Files Check',
    description: 'Verify engine implementation files exist',
    test: async () => {
      const engineFiles = [
        'src/domains/medical-ai/services/WhisperWASMEngine.js',
        'src/domains/medical-ai/services/AudioProcessor.js',
        'src/domains/medical-ai/services/ModelManager.js'
      ];
      
      const results = {};
      
      for (const engineFile of engineFiles) {
        const filePath = path.join(process.cwd(), engineFile);
        try {
          await access(filePath);
          const stats = await stat(filePath);
          results[engineFile] = {
            exists: true,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024)
          };
        } catch (error) {
          results[engineFile] = {
            exists: false,
            error: error.message
          };
        }
      }
      
      const existingFiles = Object.values(results).filter(r => r.exists).length;
      
      return {
        success: existingFiles === engineFiles.length,
        message: `${existingFiles}/${engineFiles.length} engine files found`,
        details: results
      };
    }
  },
  {
    name: 'Directory Structure Check',
    description: 'Verify required directory structure exists',
    test: async () => {
      const requiredDirs = [
        'public',
        'public/models',
        'src/domains/medical-ai/services',
        'scripts'
      ];
      
      const results = {};
      
      for (const dir of requiredDirs) {
        const dirPath = path.join(process.cwd(), dir);
        try {
          await access(dirPath);
          const stats = await stat(dirPath);
          results[dir] = {
            exists: true,
            isDirectory: stats.isDirectory()
          };
        } catch (error) {
          results[dir] = {
            exists: false,
            error: error.message
          };
        }
      }
      
      const existingDirs = Object.values(results).filter(r => r.exists && r.isDirectory).length;
      
      return {
        success: existingDirs === requiredDirs.length,
        message: `${existingDirs}/${requiredDirs.length} directories found`,
        details: results
      };
    }
  }
];

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Running Whisper.cpp WASM Setup Tests...\n');
  
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  
  for (const test of TESTS) {
    totalTests++;
    console.log(`⏳ Running: ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const result = await test.test();
      results.push({
        name: test.name,
        ...result
      });
      
      if (result.success) {
        passedTests++;
        console.log(`   ✅ ${result.message}`);
      } else {
        console.log(`   ❌ ${result.message}`);
      }
      
      if (result.details) {
        console.log(`   📝 Details:`, JSON.stringify(result.details, null, 6));
      }
      
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        message: error.message,
        error: error.stack
      });
      
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('=' .repeat(60));
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} tests passed`);
  console.log('=' .repeat(60));
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Whisper.cpp WASM is properly configured.');
    console.log('\nNext steps:');
    console.log('1. Start your Next.js development server: npm run dev');
    console.log('2. Test the WhisperWASMEngine in your application');
    console.log('3. Check browser console for any runtime errors');
    console.log('4. Verify microphone permissions are granted');
    
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please fix the issues above.');
    console.log('\nCommon solutions:');
    console.log('Download missing model files manually');
    console.log('Check file permissions and paths');
    console.log('Verify Next.js configuration');
    
    process.exit(1);
  }
}

/**
 * Generate setup report
 */
async function generateReport() {
  console.log('📋 Generating Whisper.cpp WASM Setup Report...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0
    }
  };
  
  for (const test of TESTS) {
    report.summary.totalTests++;
    
    try {
      const result = await test.test();
      report.tests.push({
        name: test.name,
        description: test.description,
        ...result
      });
      
      if (result.success) {
        report.summary.passedTests++;
      } else {
        report.summary.failedTests++;
      }
      
    } catch (error) {
      report.tests.push({
        name: test.name,
        description: test.description,
        success: false,
        message: error.message,
        error: error.stack
      });
      
      report.summary.failedTests++;
    }
  }
  
  // Save report
  const reportPath = path.join(process.cwd(), 'whisper-setup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`📊 Summary: ${report.summary.passedTests}/${report.summary.totalTests} tests passed`);
  
  return report;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--report')) {
    await generateReport();
  } else {
    await runTests();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, generateReport, TESTS };