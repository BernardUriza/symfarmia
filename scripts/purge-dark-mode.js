#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
  '/workspaces/symfarmia/src/components/medical/AudioProcessingTest.tsx',
  '/workspaces/symfarmia/src/components/medical/ConversationCapture.tsx',
  '/workspaces/symfarmia/docs/api/soap-enhancement-proposal.md',
  '/workspaces/symfarmia/src/components/medical/conversation-capture/components/FloatingTranscriptPopup.tsx',
  '/workspaces/symfarmia/app/medical-ai-demo/page.js',
  '/workspaces/symfarmia/src/components/MinimalistLandingPage.jsx',
  '/workspaces/symfarmia/src/components/dashboard/QuickActions.jsx',
  '/workspaces/symfarmia/src/components/medical/ModelManager.tsx',
  '/workspaces/symfarmia/src/components/dashboard/DashboardMetrics.jsx',
  '/workspaces/symfarmia/src/components/dashboard/DashboardTimeTracker.jsx',
  '/workspaces/symfarmia/src/components/dashboard/EfficiencyChart.jsx',
  '/workspaces/symfarmia/src/components/dashboard/MedicalProductivityMetrics.jsx',
  '/workspaces/symfarmia/src/components/medical/conversation-capture/components/ProcessingStatus.tsx',
  '/workspaces/symfarmia/src/components/medical/conversation-capture/components/ErrorDisplay.tsx',
  '/workspaces/symfarmia/src/components/medical/conversation-capture/components/PermissionDialog.tsx',
  '/workspaces/symfarmia/src/components/medical/conversation-capture/components/RecordingCard.tsx',
  '/workspaces/symfarmia/src/components/medical/conversation-capture/components/TranscriptionResult.tsx',
  '/workspaces/symfarmia/app/layout.js',
  '/workspaces/symfarmia/app/globals.css',
  '/workspaces/symfarmia/types/index.ts',
  '/workspaces/symfarmia/src/docs/DARK_MODE_CRITICAL_FIX.md',
  '/workspaces/symfarmia/src/components/ui/ActionButton.examples.jsx',
  '/workspaces/symfarmia/src/components/simple-landing/atoms/Card.jsx',
  '/workspaces/symfarmia/src/components/simple-landing/atoms/Logo.jsx',
  '/workspaces/symfarmia/src/components/patient/NewPatientModal.jsx',
  '/workspaces/symfarmia/src/components/patient/PatientWorkflow.jsx',
  '/workspaces/symfarmia/src/components/medical/OrderEntry.js',
  '/workspaces/symfarmia/src/components/medical/SOAPNotesManager.tsx',
  '/workspaces/symfarmia/src/components/medical-reports/MedicalReportCard.jsx',
  '/workspaces/symfarmia/src/components/forms/MedicalFormExample.jsx',
  '/workspaces/symfarmia/src/components/consultation/ConsultationSettings.jsx',
  '/workspaces/symfarmia/src/components/consultation/settings/AISettings.jsx',
  '/workspaces/symfarmia/src/components/consultation/settings/AudioSettings.jsx',
  '/workspaces/symfarmia/src/components/consultation/settings/QuickPresets.jsx',
  '/workspaces/symfarmia/src/components/consultation/settings/TranscriptionSettings.jsx',
  '/workspaces/symfarmia/src/components/MedicalReportsPreview.jsx',
  '/workspaces/symfarmia/src/components/PatientManagementPreview.tsx',
  '/workspaces/symfarmia/src/components/ErrorBoundary.jsx',
  '/workspaces/symfarmia/src/components/HydrationSafeDateDisplay.jsx',
  '/workspaces/symfarmia/src/components/MedicalAssistant.jsx',
  '/workspaces/symfarmia/src/components/MedicalBottomNav.tsx',
  '/workspaces/symfarmia/src/components/MedicalBrainIcon.jsx',
  '/workspaces/symfarmia/src/components/MedicalCharts.jsx',
  '/workspaces/symfarmia/src/components/MedicalKPICards.jsx',
  '/workspaces/symfarmia/src/components/AIChat.jsx',
  '/workspaces/symfarmia/src/components/AnalyticsDashboard.jsx',
  '/workspaces/symfarmia/legacy_core/app/controls/CustomModal/CustomModal.js',
  '/workspaces/symfarmia/docs/whisper-speaker-diarization/whisper-speaker-diarization/src/App.jsx',
  '/workspaces/symfarmia/docs/whisper-speaker-diarization/whisper-speaker-diarization/src/components/Progress.jsx',
  '/workspaces/symfarmia/docs/whisper-speaker-diarization/whisper-speaker-diarization/src/index.css',
  '/workspaces/symfarmia/docs/whisper-speaker-diarization/assets/index-DpEBHXOa.js',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/tabs.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/textarea.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/toggle.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/radio-group.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/select.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/switch.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/dropdown-menu.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/input-otp.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/input.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/menubar.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/badge.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/button.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/chart.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/checkbox.tsx',
  '/workspaces/symfarmia/docs/legacy/legacy-design/figma-exports/2025-01-15-medical-v1/components/ui/context-menu.tsx',
  '/workspaces/symfarmia/app/test-tailwind-v4/page.tsx',
  '/workspaces/symfarmia/app/test-tailwind/page.tsx',
  '/workspaces/symfarmia/app/auth/logout/page.tsx'
];

let totalRemoved = 0;
let filesModified = 0;

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping non-existent file: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Remove all dark: classes
  const darkClassRegex = /\bdark:[^\s'"]+/g;
  const matches = content.match(darkClassRegex) || [];
  
  if (matches.length > 0) {
    content = content.replace(darkClassRegex, '');
    
    // Clean up multiple spaces
    content = content.replace(/\s{2,}/g, ' ');
    
    // Remove empty className attributes
    content = content.replace(/\sclassName="\s*"/g, '');
    content = content.replace(/\sclass="\s*"/g, '');
    
    // Clean up className with only spaces
    content = content.replace(/className="\s+"/g, 'className=""');
    content = content.replace(/class="\s+"/g, 'class=""');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ ${path.basename(filePath)} - Removed ${matches.length} dark: classes`);
      totalRemoved += matches.length;
      filesModified++;
    }
  }
});

console.log(`\nPurge complete: Removed ${totalRemoved} dark: classes from ${filesModified} files`);