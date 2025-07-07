#!/usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');

class FigmaIntegration {
  constructor() {
    this.figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    this.fileKey = process.env.FIGMA_FILE_KEY;
  }

  async fetchDesignTokens() {
    const response = await fetch(`https://api.figma.com/v1/files/${this.fileKey}`, {
      headers: { 'X-Figma-Token': this.figmaToken }
    });
    const data = await response.json();

    const tokens = {
      colors: this.extractColors(data),
      typography: this.extractTypography(data),
      spacing: this.extractSpacing(data),
      medical: this.extractMedicalTokens(data)
    };

    fs.writeFileSync(
      './legacy-design/design-tokens/figma-tokens.json',
      JSON.stringify(tokens, null, 2)
    );
  }

  extractColors(figmaData) {
    return figmaData.styles?.colors || {};
  }

  extractTypography(figmaData) {
    return figmaData.styles?.typography || {};
  }

  extractSpacing(figmaData) {
    return figmaData.styles?.spacing || {};
  }

  extractMedicalTokens() {
    return {
      medicalColors: {
        primary: '#2563eb',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4'
      },
      clinicalSpacing: {
        consultationPadding: '24px',
        transcriptionMargin: '16px',
        soapNoteSpacing: '20px'
      },
      medicalTypography: {
        patientName: 'font-semibold text-lg',
        clinicalText: 'font-normal text-sm leading-relaxed',
        alertText: 'font-medium text-sm'
      }
    };
  }
}

module.exports = { FigmaIntegration };
