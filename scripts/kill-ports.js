#!/usr/bin/env node

/**
 * Kill processes running on specific ports
 * Used to clean up ports 3000 and 3001 before starting dev servers
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const PORTS = [3000, 3001];

async function killPort(port) {
  try {
    // For Linux/Mac
    if (process.platform !== 'win32') {
      try {
        // First try lsof
        const { stdout } = await execAsync(`lsof -ti :${port}`);
        if (stdout.trim()) {
          await execAsync(`kill -9 ${stdout.trim()}`);
          console.log(`✅ Killed process on port ${port}`);
          return true;
        }
      } catch (error) {
        // lsof might not exist, try fuser
        try {
          await execAsync(`fuser -k ${port}/tcp`);
          console.log(`✅ Killed process on port ${port}`);
          return true;
        } catch (fuserError) {
          // Neither command worked
        }
      }
    } else {
      // For Windows
      try {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            await execAsync(`taskkill /PID ${pid} /F`);
            console.log(`✅ Killed process on port ${port} (PID: ${pid})`);
            return true;
          }
        }
      } catch (error) {
        // No process found
      }
    }
    
    console.log(`ℹ️  No process found on port ${port}`);
    return false;
  } catch (error) {
    console.log(`⚠️  Could not kill process on port ${port}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧹 Cleaning up ports 3000 and 3001...');
  
  const results = await Promise.all(PORTS.map(port => killPort(port)));
  
  const killedCount = results.filter(Boolean).length;
  
  if (killedCount > 0) {
    console.log(`\n✨ Cleaned ${killedCount} port(s)`);
  } else {
    console.log('\n✨ All ports were already free');
  }
  
  // Give processes a moment to fully terminate
  await new Promise(resolve => setTimeout(resolve, 1000));
}

main().catch(error => {
  console.error('Error cleaning ports:', error);
  process.exit(1);
});