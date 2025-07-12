#!/usr/bin/env node
/**
 * MICROSERVICE E2E GUARDIAN
 * 
 * This guardian validates that the Whisper transcription microservice
 * is working correctly before allowing build/dev to proceed.
 * 
 * It will:
 * 1. Start the microservice if not running
 * 2. Run transcription test
 * 3. Verify the word "Americans" is in the transcription
 * 4. Clean up and report results
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class MicroserviceE2EGuardian {
  constructor() {
    this.microserviceDir = path.join(__dirname, '../microservices/susurro-test');
    this.serverUrl = 'http://localhost:3001';
    this.serverProcess = null;
    this.serverStartTimeout = 15000; // 15 seconds to start
    this.testTimeout = 30000; // 30 seconds for test
  }

  async guard() {
    console.log('🔬 MICROSERVICE E2E GUARDIAN ACTIVATED');
    console.log('━'.repeat(50));

    let serverWasStarted = false;
    let testPassed = false;

    try {
      // Check if server is already running
      const isRunning = await this.checkServerHealth();
      
      if (!isRunning) {
        console.log('🚀 Starting Whisper microservice...');
        serverWasStarted = true;
        await this.startMicroservice();
      } else {
        console.log('✅ Whisper microservice already running');
      }

      // Run the transcription test
      console.log('\n🧪 Running transcription E2E test...');
      testPassed = await this.runTranscriptionTest();

      if (!testPassed) {
        throw new Error('Transcription test failed');
      }

      console.log('\n✅ MICROSERVICE E2E GUARDIAN: All checks passed');
      console.log('🎉 Microservice is working correctly');
      
    } catch (error) {
      console.error('\n❌ MICROSERVICE E2E GUARDIAN: TEST FAILED');
      console.error(`Reason: ${error.message}`);
      throw error;
    } finally {
      // Clean up: stop server if we started it
      if (serverWasStarted && this.serverProcess) {
        console.log('\n🛑 Stopping microservice...');
        await this.stopMicroservice();
      }
    }

    return testPassed;
  }

  async checkServerHealth() {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${this.serverUrl}/api/health`, {
        timeout: 2000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async startMicroservice() {
    return new Promise((resolve, reject) => {
      // Change to microservice directory and start server
      this.serverProcess = spawn('npm', ['start'], {
        cwd: this.microserviceDir,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let serverReady = false;
      const startTime = Date.now();

      // Handle server output
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`   [Server] ${output.trim()}`);
        
        // Check if server is ready
        if (output.includes('listening on port 3001') || output.includes('Server is running')) {
          serverReady = true;
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error(`   [Server Error] ${data.toString().trim()}`);
      });

      this.serverProcess.on('error', (error) => {
        reject(new Error(`Failed to start microservice: ${error.message}`));
      });

      // Poll for server readiness
      const checkInterval = setInterval(async () => {
        if (serverReady || await this.checkServerHealth()) {
          clearInterval(checkInterval);
          console.log('   ✅ Microservice started successfully');
          resolve();
        }

        if (Date.now() - startTime > this.serverStartTimeout) {
          clearInterval(checkInterval);
          if (this.serverProcess) {
            this.serverProcess.kill();
          }
          reject(new Error('Microservice failed to start within timeout'));
        }
      }, 500);
    });
  }

  async stopMicroservice() {
    if (this.serverProcess) {
      return new Promise((resolve) => {
        this.serverProcess.on('exit', () => {
          console.log('   ✅ Microservice stopped');
          resolve();
        });

        // Try graceful shutdown first
        this.serverProcess.kill('SIGTERM');

        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.serverProcess && !this.serverProcess.killed) {
            this.serverProcess.kill('SIGKILL');
          }
        }, 5000);
      });
    }
  }

  async runTranscriptionTest() {
    const fetch = (await import('node-fetch')).default;
    
    try {
      // Step 1: Health check
      console.log('   1️⃣  Verifying server health...');
      const healthResponse = await fetch(`${this.serverUrl}/api/health`);
      if (!healthResponse.ok) {
        throw new Error('Server health check failed');
      }
      console.log('   ✅ Server is healthy');

      // Step 2: Check test file exists
      console.log('   2️⃣  Checking test audio file...');
      const testFile = 'jfk.wav';
      const testFilePath = path.join(this.microserviceDir, 'test-audio', testFile);
      
      if (!fs.existsSync(testFilePath)) {
        throw new Error(`Test file not found: ${testFile}`);
      }
      console.log('   ✅ Test file found');

      // Step 3: Run transcription
      console.log('   3️⃣  Running transcription...');
      const startTime = Date.now();
      
      const transcribeResponse = await fetch(`${this.serverUrl}/api/transcribe-server-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: testFile
        }),
        timeout: this.testTimeout
      });

      if (!transcribeResponse.ok) {
        const errorText = await transcribeResponse.text();
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const result = await transcribeResponse.json();
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ Transcription completed in ${duration}ms`);
      console.log(`   📝 Transcript: "${result.transcript}"`);

      // Step 4: Verify "Americans" is in the transcript
      console.log('   4️⃣  Verifying transcript contains "Americans"...');
      
      if (!result.transcript || typeof result.transcript !== 'string') {
        throw new Error('Invalid transcript in response');
      }

      const transcriptLower = result.transcript.toLowerCase();
      const containsAmericans = transcriptLower.includes('americans');

      if (!containsAmericans) {
        console.error('   ❌ Transcript does not contain the word "Americans"');
        console.error(`   Expected: Text containing "Americans"`);
        console.error(`   Received: "${result.transcript}"`);
        throw new Error('Transcript verification failed: "Americans" not found');
      }

      console.log('   ✅ Transcript contains "Americans" - TEST PASSED!');
      
      // Step 5: Display test summary
      console.log('\n   📊 Test Summary:');
      console.log(`   • Processing time: ${result.processing_time_ms}ms`);
      console.log(`   • Model used: ${result.model_used}`);
      console.log(`   • File processed: ${result.filename}`);
      console.log(`   • Transcript length: ${result.transcript.length} characters`);

      return true;

    } catch (error) {
      console.error(`\n   ❌ Test failed: ${error.message}`);
      
      // Provide helpful debugging info
      console.error('\n   🔧 Debugging tips:');
      console.error('   1. Check if nodejs-whisper is installed: cd microservices/susurro-test && npm install');
      console.error('   2. Download whisper model: cd microservices/susurro-test && npm run download-model');
      console.error('   3. Verify test audio exists: ls microservices/susurro-test/test-audio/');
      console.error('   4. Check server logs above for errors');
      
      return false;
    }
  }
}

async function main() {
  const guardian = new MicroserviceE2EGuardian();
  
  try {
    const result = await guardian.guard();
    process.exit(result ? 0 : 1);
  } catch (error) {
    console.error('🚨 MICROSERVICE E2E GUARDIAN CRASHED:', error);
    process.exit(1);
  }
}

// Export for integration with build-guardian
module.exports = { MicroserviceE2EGuardian };

// Run if called directly
if (require.main === module) {
  main();
}