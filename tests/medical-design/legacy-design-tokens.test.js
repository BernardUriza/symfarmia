const path = require('path');

describe('Legacy design tokens', () => {
  const tokens = require(path.resolve(
    __dirname,
    '../../legacy-design/design-tokens/medical-theme.json'
  ));

  it('should match the medical design tokens defined in legacy docs', () => {
    const expected = {
      medical: {
        colors: {
          primary: {
            'medical-blue': '#2563eb',
            'health-green': '#10b981',
            'alert-amber': '#f59e0b',
            'critical-red': '#ef4444',
            'info-cyan': '#06b6d4'
          },
          semantic: {
            'patient-data': '#1f2937',
            'diagnosis-text': '#374151',
            'treatment-highlight': '#3b82f6',
            'emergency-alert': '#dc2626'
          },
          accessibility: {
            'high-contrast-bg': '#ffffff',
            'high-contrast-text': '#000000',
            'focus-indicator': '#3b82f6',
            'error-state': '#ef4444'
          }
        },
        typography: {
          'patient-name': {
            fontSize: '1.125rem',
            fontWeight: '600',
            lineHeight: '1.75rem'
          },
          'clinical-data': {
            fontSize: '0.875rem',
            fontWeight: '400',
            lineHeight: '1.5rem',
            letterSpacing: '0.025em'
          },
          'medical-alert': {
            fontSize: '0.875rem',
            fontWeight: '500',
            lineHeight: '1.25rem'
          }
        },
        spacing: {
          'consultation-padding': '1.5rem',
          'transcription-margin': '1rem',
          'soap-note-spacing': '1.25rem',
          'critical-alert-padding': '1rem'
        }
      }
    };

    expect(tokens).toEqual(expected);
  });
});