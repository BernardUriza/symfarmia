import { getContrastRatio, checkWCAGCompliance } from '../../scripts/check-accessibility.js';

describe('Accessibility Contrast Tests', () => {
  describe('Light Mode Colors', () => {
    it('should meet WCAG AA for main text on white background', () => {
      const ratio = getContrastRatio('#ffffff', '#111827');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for secondary text on white background', () => {
      const ratio = getContrastRatio('#ffffff', '#374151');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for muted text on white background', () => {
      const ratio = getContrastRatio('#ffffff', '#6b7280');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for primary button text', () => {
      const ratio = getContrastRatio('#2563eb', '#ffffff');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Dark Mode Colors', () => {
    it('should meet WCAG AA for main text on dark background', () => {
      const ratio = getContrastRatio('#1f2937', '#ffffff');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for secondary text on dark background', () => {
      const ratio = getContrastRatio('#1f2937', '#d1d5db');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for modal background text', () => {
      const ratio = getContrastRatio('#111827', '#ffffff');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for dark mode primary button', () => {
      const ratio = getContrastRatio('#2563eb', '#ffffff');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Border and Input Contrast', () => {
    it('should have sufficient border contrast in light mode', () => {
      const ratio = getContrastRatio('#ffffff', '#6b7280');
      const compliance = checkWCAGCompliance(ratio, false);
      
      // Borders need at least 3:1 contrast ratio
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(3.0);
    });

    it('should have sufficient border contrast in dark mode', () => {
      const ratio = getContrastRatio('#1f2937', '#6b7280');
      const compliance = checkWCAGCompliance(ratio, false);
      
      // Borders need at least 3:1 contrast ratio
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('Focus States', () => {
    it('should have high contrast focus indicators in light mode', () => {
      const ratio = getContrastRatio('#ffffff', '#2563eb');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should have high contrast focus indicators in dark mode', () => {
      const ratio = getContrastRatio('#1f2937', '#60a5fa');
      const compliance = checkWCAGCompliance(ratio);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Large Text Compliance', () => {
    it('should meet WCAG AA for large text with lower contrast', () => {
      // Large text only needs 3:1 ratio
      const ratio = getContrastRatio('#ffffff', '#757575');
      const compliance = checkWCAGCompliance(ratio, true);
      
      expect(compliance.aa).toBe(true);
      expect(parseFloat(compliance.ratio)).toBeGreaterThanOrEqual(3.0);
    });
  });
});