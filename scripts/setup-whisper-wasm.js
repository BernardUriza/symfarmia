#!/usr/bin/env node

/**
 * Setup script for Whisper.cpp WASM
 * Downloads and configures Whisper WASM files and models
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

// Configuration
const WHISPER_VERSION = 'v1.5.4';
const MODELS_DIR = path.join(process.cwd(), 'public', 'models');
const WASM_DIR = path.join(process.cwd(), 'public');

// Model URLs (replace with actual URLs)
const MODEL_URLS = {
  'whisper-base': `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin`,
  'whisper-base-en': `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin`,
  'whisper-small': `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin`,
  'whisper-small-en': `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin`,
  'whisper-medium': `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin`,
  'whisper-medium-en': `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.en.bin`
};

// WASM file URL (replace with actual URL)
const WASM_URL = `https://github.com/ggerganov/whisper.cpp/releases/download/${WHISPER_VERSION}/whisper.wasm`;

/**
 * Download file from URL
 */
async function downloadFile(url, filePath) {
  console.log(`Downloading ${url} to ${filePath}...`);
  
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        return downloadFile(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${path.basename(filePath)}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Clean up on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Setup directories
 */
async function setupDirectories() {
  console.log('Setting up directories...');
  
  try {
    await mkdir(MODELS_DIR, { recursive: true });
    console.log(`✓ Created models directory: ${MODELS_DIR}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  try {
    await mkdir(WASM_DIR, { recursive: true });
    console.log(`✓ WASM directory ready: ${WASM_DIR}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Download WASM file
 */
async function downloadWASM() {
  const wasmPath = path.join(WASM_DIR, 'whisper.wasm');
  
  if (await fileExists(wasmPath)) {
    console.log('✓ WASM file already exists');
    return;
  }
  
  console.log('Downloading Whisper.cpp WASM...');
  
  try {
    await downloadFile(WASM_URL, wasmPath);
    console.log('✓ WASM file downloaded successfully');
  } catch (error) {
    console.error('✗ Failed to download WASM file:', error.message);
    console.log('Please download manually from:', WASM_URL);
    console.log('Place it at:', wasmPath);
  }
}

/**
 * Download models
 */
async function downloadModels() {
  console.log('Downloading Whisper models...');
  
  // Default models to download
  const defaultModels = ['whisper-base', 'whisper-base-en'];
  
  for (const modelName of defaultModels) {
    const modelPath = path.join(MODELS_DIR, `${modelName}.bin`);
    
    if (await fileExists(modelPath)) {
      console.log(`✓ Model ${modelName} already exists`);
      continue;
    }
    
    const modelUrl = MODEL_URLS[modelName];
    if (!modelUrl) {
      console.warn(`⚠ No URL configured for model: ${modelName}`);
      continue;
    }
    
    try {
      await downloadFile(modelUrl, modelPath);
      console.log(`✓ Model ${modelName} downloaded successfully`);
    } catch (error) {
      console.error(`✗ Failed to download model ${modelName}:`, error.message);
      console.log(`Please download manually from: ${modelUrl}`);
      console.log(`Place it at: ${modelPath}`);
    }
  }
}

/**
 * Create configuration file
 */
async function createConfigFile() {
  const configPath = path.join(process.cwd(), 'whisper-config.json');
  
  const config = {
    version: WHISPER_VERSION,
    models: {
      available: Object.keys(MODEL_URLS),
      default: 'whisper-base',
      paths: {
        modelsDir: '/models',
        wasmFile: '/whisper.wasm'
      }
    },
    audio: {
      sampleRate: 16000,
      channels: 1,
      maxDuration: 30
    },
    performance: {
      threads: Math.min(navigator?.hardwareConcurrency || 4, 8),
      enableSharedArrayBuffer: true
    },
    compatibility: {
      minimumBrowsers: {
        chrome: 91,
        firefox: 90,
        safari: 14,
        edge: 91
      },
      requiredFeatures: [
        'WebAssembly',
        'AudioContext',
        'MediaDevices',
        'Worker'
      ]
    }
  };
  
  await writeFile(configPath, JSON.stringify(config, null, 2));
  console.log(`✓ Configuration file created: ${configPath}`);
}

/**
 * Update Next.js configuration
 */
async function updateNextConfig() {
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  if (!(await fileExists(nextConfigPath))) {
    console.warn('⚠ next.config.js not found, skipping configuration update');
    return;
  }
  
  console.log('✓ Next.js configuration should be updated to serve WASM files properly');
  console.log('Ensure your next.config.js includes:');
  console.log(`
  headers: [
    {
      source: '/:path*.wasm',
      headers: [
        { key: 'Content-Type', value: 'application/wasm' },
        { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }
      ]
    }
  ]
  `);
}

/**
 * Main setup function
 */
async function main() {
  console.log('🚀 Setting up Whisper.cpp WASM...\n');
  
  try {
    await setupDirectories();
    await downloadWASM();
    await downloadModels();
    await createConfigFile();
    await updateNextConfig();
    
    console.log('\n✅ Whisper.cpp WASM setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Ensure your Next.js app serves WASM files with correct MIME types');
    console.log('2. Enable Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy headers');
    console.log('3. Test the WhisperWASMEngine in your application');
    console.log('4. Check browser compatibility (Chrome 91+, Firefox 90+, Safari 14+, Edge 91+)');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, downloadFile, setupDirectories };