#!/usr/bin/env node

/**
 * Pre-build Transcription Testing Script
 * 
 * Validates transcription system components before allowing builds
 * NOW CATCHES TRANSLATION KEY ISSUES AND MOCK TRANSCRIPTION
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SYMFARMIA TRANSCRIPTION SYSTEM VALIDATION');
console.log('=' .repeat(50));

let testsPassed = 0;
let testsFailed = 0;

// Test 1: Validate high contrast colors
function testHighContrastColors() {
  console.log('\n1. Testing high contrast colors...');
  
  const conversationCaptureFile = path.join(__dirname, '../app/components/medical/ConversationCapture.js');
  
  if (!fs.existsSync(conversationCaptureFile)) {
    console.error('❌ ConversationCapture.js not found');
    testsFailed++;
    return;
  }
  
  const content = fs.readFileSync(conversationCaptureFile, 'utf-8');
  
  // Check for high contrast text colors
  const hasHighContrast = content.includes('text-gray-900') && 
                         content.includes('font-medium') &&
                         content.includes('bg-white');
  
  if (hasHighContrast) {
    console.log('✅ High contrast colors implemented');
    testsPassed++;
  } else {
    console.error('❌ High contrast colors NOT implemented');
    testsFailed++;
  }
}

// Test 1.5: Check for translation keys instead of actual text
function testTranslationKeys() {
  console.log('\n1.5. Testing translation keys integration...');
  
  const conversationCaptureFile = path.join(__dirname, '../app/components/medical/ConversationCapture.js');
  const content = fs.readFileSync(conversationCaptureFile, 'utf-8');
  
  // Check that translation keys are properly used with t() function
  const hasProperTranslations = content.includes("t('conversation.capture.title')") &&
                               content.includes("t('conversation.capture.subtitle')") &&
                               content.includes("t('conversation.capture.live_transcription')");
  
  // Check that we're NOT hardcoding text
  const hasHardcodedText = content.includes('"Conversation Capture"') ||
                          content.includes('"Captura de Conversación"') ||
                          content.includes('"Live Transcription"');
  
  if (hasProperTranslations && !hasHardcodedText) {
    console.log('✅ Translation keys properly integrated');
    testsPassed++;
  } else {
    console.error('❌ Translation keys NOT properly integrated');
    console.error('   - Proper translations:', hasProperTranslations);
    console.error('   - Has hardcoded text:', hasHardcodedText);
    testsFailed++;
  }
}

// Test 2: Validate real-time transcription display
function testRealTimeDisplay() {
  console.log('\n2. Testing real-time transcription display...');
  
  const conversationCaptureFile = path.join(__dirname, '../app/components/medical/ConversationCapture.js');
  const content = fs.readFileSync(conversationCaptureFile, 'utf-8');
  
  // Check for live transcription indicators
  const hasLiveIndicator = content.includes('LIVE') && 
                          content.includes('animate-pulse') &&
                          content.includes('text-blue-600');
  
  if (hasLiveIndicator) {
    console.log('✅ Real-time display indicators implemented');
    testsPassed++;
  } else {
    console.error('❌ Real-time display indicators NOT implemented');
    testsFailed++;
  }
}

// Test 3: Validate Web Speech API integration (NO MOCK ALLOWED)
function testWebSpeechAPI() {
  console.log('\n3. Testing Web Speech API integration...');
  
  const transcriptionServiceFile = path.join(__dirname, '../src/domains/medical-ai/services/transcriptionService.ts');
  
  if (!fs.existsSync(transcriptionServiceFile)) {
    console.error('❌ transcriptionService.ts not found');
    testsFailed++;
    return;
  }
  
  const content = fs.readFileSync(transcriptionServiceFile, 'utf-8');
  
  // Check for Web Speech API usage
  const hasWebSpeechAPI = content.includes('SpeechRecognition') && 
                         content.includes('interimResults') &&
                         content.includes('continuous') &&
                         content.includes('setupSpeechRecognition');
  
  // Check that it's NOT using mock transcription
  const hasMockTranscription = content.includes('generateMockTranscription') ||
                              content.includes('mockText') ||
                              content.includes('Simulate transcription') ||
                              content.includes('mockPhrases');
  
  if (hasWebSpeechAPI && !hasMockTranscription) {
    console.log('✅ Web Speech API integration implemented (no mock)');
    testsPassed++;
  } else {
    console.error('❌ Web Speech API integration NOT implemented or using mock');
    console.error('   - Has Web Speech API:', hasWebSpeechAPI);
    console.error('   - Has mock transcription:', hasMockTranscription);
    testsFailed++;
  }
}

// Test 4: Validate medical-grade visual design
function testMedicalGradeDesign() {
  console.log('\n4. Testing medical-grade visual design...');
  
  const conversationCaptureFile = path.join(__dirname, '../app/components/medical/ConversationCapture.js');
  const content = fs.readFileSync(conversationCaptureFile, 'utf-8');
  
  // Check for medical-grade design elements
  const hasMedicalDesign = content.includes('shadow-sm') && 
                          content.includes('border-2') &&
                          content.includes('leading-relaxed') &&
                          content.includes('font-semibold');
  
  if (hasMedicalDesign) {
    console.log('✅ Medical-grade visual design implemented');
    testsPassed++;
  } else {
    console.error('❌ Medical-grade visual design NOT implemented');
    testsFailed++;
  }
}

// Test 5: Validate microphone live feedback
function testMicrophoneFeedback() {
  console.log('\n5. Testing microphone live feedback...');
  
  const conversationCaptureFile = path.join(__dirname, '../app/components/medical/ConversationCapture.js');
  const content = fs.readFileSync(conversationCaptureFile, 'utf-8');
  
  // Check for microphone feedback components
  const hasMicrophoneFeedback = content.includes('audioLevel') && 
                               content.includes('animate-pulse') &&
                               content.includes('Activity');
  
  if (hasMicrophoneFeedback) {
    console.log('✅ Microphone live feedback implemented');
    testsPassed++;
  } else {
    console.error('❌ Microphone live feedback NOT implemented');
    testsFailed++;
  }
}

// Test 6: Validate translation files exist
function testTranslationFiles() {
  console.log('\n6. Testing translation files...');
  
  const esConversationFile = path.join(__dirname, '../locales/es/conversation.json');
  const enConversationFile = path.join(__dirname, '../locales/en/conversation.json');
  
  if (!fs.existsSync(esConversationFile) || !fs.existsSync(enConversationFile)) {
    console.error('❌ Translation files not found');
    testsFailed++;
    return;
  }
  
  const esContent = JSON.parse(fs.readFileSync(esConversationFile, 'utf-8'));
  const enContent = JSON.parse(fs.readFileSync(enConversationFile, 'utf-8'));
  
  // Check for required keys
  const hasRequiredKeys = esContent.capture?.title && 
                         esContent.capture?.subtitle &&
                         enContent.capture?.title &&
                         enContent.capture?.subtitle;
  
  if (hasRequiredKeys) {
    console.log('✅ Translation files properly configured');
    testsPassed++;
  } else {
    console.error('❌ Translation files missing required keys');
    testsFailed++;
  }
}

// Run all tests
function runTests() {
  testHighContrastColors();
  testTranslationKeys();
  testRealTimeDisplay();
  testWebSpeechAPI();
  testMedicalGradeDesign();
  testMicrophoneFeedback();
  testTranslationFiles();
  
  console.log('\n' + '=' .repeat(50));
  console.log(`RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  
  if (testsFailed === 0) {
    console.log('✅ ALL TESTS PASSED - Build can proceed');
    console.log('🏥 Medical-grade transcription system validated');
    process.exit(0);
  } else {
    console.log('❌ TESTS FAILED - Build BLOCKED');
    console.log('🚨 Fix all issues before building');
    console.log('');
    console.log('CRITICAL ISSUES TO FIX:');
    console.log('1. Translation keys showing instead of actual text');
    console.log('2. Mock transcription still being used');
    console.log('3. Missing Web Speech API integration');
    console.log('4. Poor visual contrast for medical use');
    process.exit(1);
  }
}

// Run the tests
runTests();