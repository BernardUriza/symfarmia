#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Build phases with descriptions
const BUILD_PHASES = {
  INIT: { name: 'Initializing', emoji: '🔧' },
  CLEAN: { name: 'Cleaning', emoji: '🧹' },
  PRISMA: { name: 'Generating Prisma Client', emoji: '🗄️' },
  LINT: { name: 'Linting', emoji: '🔍' },
  TYPECHECK: { name: 'Type Checking', emoji: '✅' },
  COMPILE: { name: 'Compiling', emoji: '⚙️' },
  OPTIMIZE: { name: 'Optimizing', emoji: '🚀' },
  BUNDLE: { name: 'Creating Bundles', emoji: '📦' },
  STATIC: { name: 'Generating Static Pages', emoji: '📄' },
  FINALIZE: { name: 'Finalizing Build', emoji: '✨' }
};

// Track build metrics
let buildMetrics = {
  startTime: Date.now(),
  phases: {},
  warnings: [],
  errors: [],
  memoryUsage: [],
  bundleSizes: {}
};

// Progress bar components
const progressBar = (percent, width = 40) => {
  const filled = Math.floor(width * percent / 100);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${' '.repeat(empty)}] ${percent}%`;
};

// Log with timestamp and phase
function log(phase, message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const phaseInfo = BUILD_PHASES[phase] || { name: phase, emoji: '📌' };
  
  let color = colors.cyan;
  if (type === 'error') color = colors.red;
  if (type === 'warning') color = colors.yellow;
  if (type === 'success') color = colors.green;
  
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${phaseInfo.emoji} ${color}${phaseInfo.name}${colors.reset}: ${message}`);
}

// Monitor memory usage
function monitorMemory() {
  setInterval(() => {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);
    
    buildMetrics.memoryUsage.push({
      timestamp: Date.now(),
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      rss: rssMB
    });
    
    // Log if memory usage is high
    if (heapUsedMB > 1000) {
      log('MEMORY', `High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (RSS: ${rssMB}MB)`, 'warning');
    }
  }, 5000);
}

// Execute command with real-time output
function executeCommand(command, args, phase) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    buildMetrics.phases[phase] = { startTime };
    
    log(phase, `Starting ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      env: { ...process.env, FORCE_COLOR: '1' },
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Parse Next.js specific output
      if (text.includes('Creating an optimized production build')) {
        log(phase, 'Starting production build optimization...');
      } else if (text.includes('Compiled successfully')) {
        log(phase, 'Compilation successful!', 'success');
      } else if (text.includes('Collecting page data')) {
        log(phase, 'Analyzing page dependencies...');
      } else if (text.includes('Generating static pages')) {
        const match = text.match(/\((\d+)\/(\d+)\)/);
        if (match) {
          const [_, current, total] = match;
          const percent = Math.round((parseInt(current) / parseInt(total)) * 100);
          log(phase, `Generating pages: ${progressBar(percent)} (${current}/${total})`);
        }
      } else if (text.includes('Route (')) {
        // Extract route info
        const routeMatch = text.match(/Route \((.*?)\)\s+Size:\s+(\d+\.?\d*\s+\w+)/);
        if (routeMatch) {
          const [_, route, size] = routeMatch;
          buildMetrics.bundleSizes[route] = size;
        }
      }
      
      // Don't print every line, just important ones
      if (!text.trim().startsWith('○') && 
          !text.trim().startsWith('λ') && 
          !text.trim().startsWith('✓')) {
        process.stdout.write(text);
      }
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      
      // Check for warnings
      if (text.includes('warn') || text.includes('Warning')) {
        buildMetrics.warnings.push(text);
        log(phase, text.trim(), 'warning');
      } else {
        process.stderr.write(text);
      }
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      buildMetrics.phases[phase].duration = duration;
      buildMetrics.phases[phase].exitCode = code;
      
      if (code !== 0) {
        buildMetrics.errors.push({ phase, error: errorOutput });
        log(phase, `Failed with exit code ${code} (${(duration / 1000).toFixed(2)}s)`, 'error');
        reject(new Error(`${command} failed with exit code ${code}`));
      } else {
        log(phase, `Completed successfully (${(duration / 1000).toFixed(2)}s)`, 'success');
        resolve({ output, errorOutput, duration });
      }
    });
  });
}

// Generate build report
function generateBuildReport() {
  const totalDuration = Date.now() - buildMetrics.startTime;
  const report = {
    timestamp: new Date().toISOString(),
    totalDuration: `${(totalDuration / 1000).toFixed(2)}s`,
    phases: Object.entries(buildMetrics.phases).map(([name, data]) => ({
      name,
      duration: `${(data.duration / 1000).toFixed(2)}s`,
      exitCode: data.exitCode
    })),
    memoryPeak: Math.max(...buildMetrics.memoryUsage.map(m => m.heapUsed)),
    bundleSizes: buildMetrics.bundleSizes,
    warnings: buildMetrics.warnings.length,
    errors: buildMetrics.errors.length
  };
  
  fs.writeFileSync('build-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n' + colors.bright + '📊 BUILD SUMMARY' + colors.reset);
  console.log('=====================================');
  console.log(`Total Duration: ${colors.green}${report.totalDuration}${colors.reset}`);
  console.log(`Memory Peak: ${colors.yellow}${report.memoryPeak}MB${colors.reset}`);
  console.log(`Warnings: ${colors.yellow}${report.warnings}${colors.reset}`);
  console.log(`Errors: ${colors.red}${report.errors}${colors.reset}`);
  console.log('\nPhase Breakdown:');
  report.phases.forEach(phase => {
    const color = phase.exitCode === 0 ? colors.green : colors.red;
    console.log(`  ${phase.name}: ${color}${phase.duration}${colors.reset}`);
  });
  
  if (Object.keys(buildMetrics.bundleSizes).length > 0) {
    console.log('\nBundle Sizes:');
    Object.entries(buildMetrics.bundleSizes).slice(0, 10).forEach(([route, size]) => {
      console.log(`  ${route}: ${colors.cyan}${size}${colors.reset}`);
    });
  }
}

// Main build process
async function build() {
  console.clear();
  console.log(colors.bright + colors.blue + '🏥 SYMFARMIA BUILD SYSTEM' + colors.reset);
  console.log('==================================\n');
  
  // Start memory monitoring
  monitorMemory();
  
  try {
    // Phase 1: Clean
    log('CLEAN', 'Removing previous build artifacts...');
    if (fs.existsSync('.next')) {
      fs.rmSync('.next', { recursive: true, force: true });
    }
    
    // Phase 2: Generate Prisma Client
    await executeCommand('npx', ['prisma', 'generate'], 'PRISMA');
    
    // Phase 3: Run linting (optional, can be skipped for faster builds)
    if (process.argv.includes('--lint')) {
      await executeCommand('npm', ['run', 'lint'], 'LINT');
    }
    
    // Phase 4: Build Next.js with enhanced logging and webpack progress
    const buildEnv = {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NODE_OPTIONS: '--max-old-space-size=4096',
      ANALYZE: process.argv.includes('--analyze') ? 'true' : 'false'
    };
    
    log('COMPILE', 'Starting Next.js build with enhanced monitoring...');
    
    const buildProcess = spawn('npx', ['next', 'build'], {
      env: buildEnv,
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe', 'ipc'] // Enable IPC for webpack progress
    });
    
    let lastUpdate = Date.now();
    let webpackProgress = 0;
    let currentPhase = 'COMPILE';
    
    // Handle webpack progress messages
    buildProcess.on('message', (message) => {
      if (message.type === 'webpack-progress') {
        webpackProgress = message.percentage;
        const progressMsg = `Webpack: ${progressBar(webpackProgress)} ${message.message || ''}`;
        log('BUNDLE', progressMsg);
      }
    });
    
    buildProcess.stdout.on('data', (data) => {
      const text = data.toString();
      const now = Date.now();
      
      // Parse Next.js build output for phases
      if (text.includes('Creating an optimized production build')) {
        currentPhase = 'OPTIMIZE';
        log(currentPhase, 'Starting production optimization...');
      } else if (text.includes('Compiled successfully')) {
        log(currentPhase, 'Compilation successful!', 'success');
        currentPhase = 'BUNDLE';
      } else if (text.includes('Collecting page data')) {
        currentPhase = 'STATIC';
        log(currentPhase, 'Analyzing page dependencies...');
      } else if (text.includes('Generating static pages')) {
        const match = text.match(/\((\d+)\/(\d+)\)/);
        if (match) {
          const [_, current, total] = match;
          const percent = Math.round((parseInt(current) / parseInt(total)) * 100);
          log('STATIC', `Generating pages: ${progressBar(percent)} (${current}/${total})`);
        }
      } else if (text.includes('Finalizing page optimization')) {
        currentPhase = 'FINALIZE';
        log(currentPhase, 'Finalizing optimizations...');
      }
      
      // Extract route bundle sizes
      const routeMatch = text.match(/Route \((.*?)\)\s+Size:\s+(\d+\.?\d*\s+\w+)/);
      if (routeMatch) {
        const [_, route, size] = routeMatch;
        buildMetrics.bundleSizes[route] = size;
      }
      
      // Update every 2 seconds to show we're not hanging
      if (now - lastUpdate > 2000) {
        const memUsage = process.memoryUsage();
        const heapMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        log(currentPhase, `Build in progress... (Memory: ${heapMB}MB)`);
        lastUpdate = now;
      }
      
      // Only show important lines
      if (!text.trim().startsWith('○') && 
          !text.trim().startsWith('λ') && 
          !text.trim().startsWith('✓') &&
          !text.includes('info  -')) {
        process.stdout.write(text);
      }
    });
    
    buildProcess.stderr.on('data', (data) => {
      const text = data.toString();
      
      // Check for warnings
      if (text.includes('warn') || text.includes('Warning')) {
        buildMetrics.warnings.push(text);
        log(currentPhase, text.trim(), 'warning');
      } else if (text.includes('error') || text.includes('Error')) {
        buildMetrics.errors.push({ phase: currentPhase, error: text });
        log(currentPhase, text.trim(), 'error');
      } else {
        process.stderr.write(text);
      }
    });
    
    await new Promise((resolve, reject) => {
      buildProcess.on('close', (code) => {
        buildMetrics.phases[currentPhase] = {
          duration: Date.now() - buildMetrics.startTime,
          exitCode: code
        };
        
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build failed with exit code ${code}`));
        }
      });
    });
    
    // Generate report
    generateBuildReport();
    
    console.log('\n' + colors.green + colors.bright + '✅ BUILD COMPLETED SUCCESSFULLY!' + colors.reset);
    
  } catch (error) {
    console.error('\n' + colors.red + colors.bright + '❌ BUILD FAILED!' + colors.reset);
    console.error(error.message);
    generateBuildReport();
    process.exit(1);
  }
}

// Run build
build();