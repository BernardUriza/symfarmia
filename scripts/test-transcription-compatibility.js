#!/usr/bin/env node

/**
 * Script to test backward compatibility of transcription API responses
 * Ensures that the migration from nodejs-whisper to Xenova/transformers.js
 * maintains the same API interface
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  localUrl: 'http://localhost:8888/.netlify/functions',
  productionUrl: 'https://your-site.netlify.app/.netlify/functions',
  testAudioFile: path.join(__dirname, '..', 'public', 'test-audio', 'sample.wav')
};

// Expected response structure
const EXPECTED_RESPONSE_FIELDS = {
  uploadEndpoint: [
    'success',
    'filename',
    'original_name',
    'transcript',
    'processing_time_ms',
    'file_size',
    'model_used',
    'timestamp',
    'confidence',
    'language'
  ],
  serverFileEndpoint: [
    'success',
    'filename',
    'transcript',
    'raw_result',
    'processing_time_ms',
    'audio_path',
    'model_used',
    'timestamp',
    'file_size_mb',
    'language'
  ]
};

// Test functions
async function testUploadEndpoint(baseUrl) {
  console.log('\n📤 Testing transcribe-upload endpoint...');
  
  try {
    const form = new FormData();
    const audioBuffer = fs.readFileSync(TEST_CONFIG.testAudioFile);
    form.append('audio', audioBuffer, 'test-audio.wav');
    form.append('language', 'es');
    
    const response = await fetch(`${baseUrl}/transcribe-upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    const missingFields = EXPECTED_RESPONSE_FIELDS.uploadEndpoint.filter(
      field => !(field in data)
    );
    
    if (missingFields.length > 0) {
      console.error('❌ Missing fields:', missingFields);
      return false;
    }
    
    // Validate data types
    if (typeof data.success !== 'boolean') {
      console.error('❌ Invalid type for success field');
      return false;
    }
    
    if (typeof data.transcript !== 'string') {
      console.error('❌ Invalid type for transcript field');
      return false;
    }
    
    if (typeof data.processing_time_ms !== 'number') {
      console.error('❌ Invalid type for processing_time_ms field');
      return false;
    }
    
    console.log('✅ Upload endpoint validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Upload endpoint test failed:', error.message);
    return false;
  }
}

async function testServerFileEndpoint(baseUrl) {
  console.log('\n📁 Testing transcribe-server-file endpoint...');
  
  try {
    const response = await fetch(`${baseUrl}/transcribe-server-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: 'sample.wav',
        language: 'es'
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    // Validate response structure
    const missingFields = EXPECTED_RESPONSE_FIELDS.serverFileEndpoint.filter(
      field => !(field in data)
    );
    
    if (missingFields.length > 0) {
      console.error('❌ Missing fields:', missingFields);
      return false;
    }
    
    // Validate data types
    if (typeof data.success !== 'boolean') {
      console.error('❌ Invalid type for success field');
      return false;
    }
    
    if (typeof data.transcript !== 'string') {
      console.error('❌ Invalid type for transcript field');
      return false;
    }
    
    if (typeof data.raw_result !== 'object') {
      console.error('❌ Invalid type for raw_result field');
      return false;
    }
    
    console.log('✅ Server file endpoint validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Server file endpoint test failed:', error.message);
    return false;
  }
}

async function testErrorResponses(baseUrl) {
  console.log('\n⚠️  Testing error responses...');
  
  try {
    // Test missing file error
    const response1 = await fetch(`${baseUrl}/transcribe-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    const data1 = await response1.json();
    
    if (!data1.error) {
      console.error('❌ Missing error field in error response');
      return false;
    }
    
    // Test invalid method error
    const response2 = await fetch(`${baseUrl}/transcribe-upload`, {
      method: 'GET'
    });
    
    const data2 = await response2.json();
    
    if (!data2.error || response2.status !== 405) {
      console.error('❌ Invalid method error not handled correctly');
      return false;
    }
    
    console.log('✅ Error response validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Error response test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Starting backward compatibility tests...');
  console.log('================================');
  
  const baseUrl = process.argv[2] === '--production' 
    ? TEST_CONFIG.productionUrl 
    : TEST_CONFIG.localUrl;
    
  console.log(`Testing against: ${baseUrl}`);
  
  // Check if test audio file exists
  if (!fs.existsSync(TEST_CONFIG.testAudioFile)) {
    console.error(`❌ Test audio file not found: ${TEST_CONFIG.testAudioFile}`);
    process.exit(1);
  }
  
  const results = {
    upload: await testUploadEndpoint(baseUrl),
    serverFile: await testServerFileEndpoint(baseUrl),
    errors: await testErrorResponses(baseUrl)
  };
  
  console.log('\n================================');
  console.log('📊 Test Results:');
  console.log(`Upload Endpoint: ${results.upload ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Server File Endpoint: ${results.serverFile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Error Handling: ${results.errors ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n✅ All backward compatibility tests passed!');
    console.log('The API maintains the same interface as the nodejs-whisper implementation.');
  } else {
    console.log('\n❌ Some tests failed. Please review the implementation.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});