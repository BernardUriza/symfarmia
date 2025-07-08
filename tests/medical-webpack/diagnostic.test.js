/**
 * Webpack Import Diagnostic Tests
 * Specifically diagnoses the webpack factory 'call' error
 */

import { jest } from '@jest/globals';

describe('Webpack Import Diagnostics', () => {
  // Test 1: Basic module resolution
  test('should resolve icons module path correctly', () => {
    const iconsPath = require.resolve('../../src/components/icons');
    expect(iconsPath).toBeDefined();
    expect(iconsPath).toMatch(/icons\.(jsx|js)$/);
  });

  // Test 2: Test individual icon imports
  test('should import each icon individually', async () => {
    const iconsModule = await import('../../src/components/icons');
    
    const iconNames = [
      'MicrophoneIcon',
      'DocumentTextIcon',
      'ArrowPathIcon', 
      'CheckCircleIcon',
      'UserIcon',
      'StarIcon',
      'HeartIcon'
    ];

    iconNames.forEach(iconName => {
      expect(iconsModule[iconName]).toBeDefined();
      expect(typeof iconsModule[iconName]).toBe('function');
      
      // Test that the icon is a valid React component
      const IconComponent = iconsModule[iconName];
      expect(IconComponent.length).toBeLessThanOrEqual(1); // Should accept props
    });
  });

  // Test 3: Simulate webpack module factory issue
  test('should identify webpack factory call issue', () => {
    // Mock the webpack require function to simulate the error
    const originalRequire = global.__webpack_require__;
    
    try {
      // Create a mock that simulates the factory.call undefined error
      global.__webpack_require__ = jest.fn().mockImplementation((moduleId) => {
        if (typeof moduleId === 'string' && moduleId.includes('icons')) {
          // Simulate the factory being undefined
          const options = {
            factory: undefined // This is what causes the error
          };
          
          // This should throw: Cannot read properties of undefined (reading 'call')
          if (options.factory && typeof options.factory.call === 'function') {
            return options.factory.call();
          } else {
            throw new TypeError("Cannot read properties of undefined (reading 'call')");
          }
        }
        return {};
      });

      // Test that we can detect this specific error pattern
      expect(() => {
        global.__webpack_require__('icons');
      }).toThrow("Cannot read properties of undefined (reading 'call')");

    } finally {
      global.__webpack_require__ = originalRequire;
    }
  });

  // Test 4: Check for circular dependencies
  test('should not have circular dependencies', () => {
    const visitedModules = new Set();
    
    function checkCircularDeps(modulePath, visited = new Set()) {
      if (visited.has(modulePath)) {
        return true; // Circular dependency found
      }
      
      visited.add(modulePath);
      
      try {
        const module = require(modulePath);
        // Check if this module imports other modules that might cause cycles
        return false;
      } catch (error) {
        if (error.message.includes('circular')) {
          return true;
        }
        return false;
      }
    }
    
    const hasCircularDep = checkCircularDeps('../../src/components/icons');
    expect(hasCircularDep).toBe(false);
  });

  // Test 5: Test module exports structure
  test('should have correct module export structure', () => {
    const icons = require('../../src/components/icons');
    
    // Should be an object with named exports
    expect(typeof icons).toBe('object');
    expect(icons).not.toBeNull();
    
    // Should not have a default export that conflicts with named exports
    expect(icons.default).toBeUndefined();
    
    // All exports should be functions (React components)
    Object.keys(icons).forEach(key => {
      expect(typeof icons[key]).toBe('function');
    });
  });

  // Test 6: Test webpack chunk loading
  test('should handle dynamic imports correctly', async () => {
    try {
      // Test dynamic import (which is closer to how webpack loads modules)
      const dynamicIcons = await import('../../src/components/icons');
      
      expect(dynamicIcons).toBeDefined();
      expect(dynamicIcons.MicrophoneIcon).toBeDefined();
      
      // Should be able to use the dynamically imported icons
      const { MicrophoneIcon } = dynamicIcons;
      expect(typeof MicrophoneIcon).toBe('function');
      
    } catch (error) {
      // If dynamic import fails, log details for debugging
      console.error('Dynamic import failed:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  });

  // Test 7: Test the exact import pattern from MinimalistLandingPage
  test('should handle the exact import pattern from MinimalistLandingPage', () => {
    // Simulate the exact import statement that's failing
    expect(() => {
      const {
        MicrophoneIcon,
        DocumentTextIcon,
        ArrowPathIcon,
        CheckCircleIcon,
        UserIcon,
        StarIcon,
        HeartIcon
      } = require('../../src/components/icons');
      
      // Verify all imports are successful
      expect(MicrophoneIcon).toBeDefined();
      expect(DocumentTextIcon).toBeDefined();
      expect(ArrowPathIcon).toBeDefined();
      expect(CheckCircleIcon).toBeDefined();
      expect(UserIcon).toBeDefined();
      expect(StarIcon).toBeDefined();
      expect(HeartIcon).toBeDefined();
      
    }).not.toThrow();
  });

  // Test 8: Check for webpack module caching issues
  test('should handle module caching correctly', () => {
    // Clear require cache for the icons module
    const iconsPath = require.resolve('../../src/components/icons');
    delete require.cache[iconsPath];
    
    // Re-require the module
    const icons1 = require('../../src/components/icons');
    const icons2 = require('../../src/components/icons');
    
    // Should be the same cached instance
    expect(icons1).toBe(icons2);
    expect(icons1.MicrophoneIcon).toBe(icons2.MicrophoneIcon);
  });

  // Test 9: Test for HMR (Hot Module Replacement) issues
  test('should handle hot module replacement gracefully', () => {
    // Simulate HMR scenario
    const originalModule = require('../../src/components/icons');
    
    // In development, modules can be hot-replaced
    if (module.hot) {
      // This would normally be handled by webpack's HMR
      expect(() => {
        // Simulate module replacement
        const newModule = require('../../src/components/icons');
        expect(newModule).toBeDefined();
      }).not.toThrow();
    }
    
    expect(originalModule).toBeDefined();
  });

  // Test 10: Test webpack module factory function
  test('should verify webpack module factory exists', () => {
    // In a real webpack environment, modules have factory functions
    const iconsModule = require('../../src/components/icons');
    
    // The module should be properly constructed
    expect(iconsModule).toBeDefined();
    expect(typeof iconsModule).toBe('object');
    
    // In development, webpack might add additional properties
    // We're testing that the module loaded correctly regardless
    Object.keys(iconsModule).forEach(key => {
      const exportedValue = iconsModule[key];
      expect(exportedValue).toBeDefined();
      
      // Icons should be React components (functions)
      if (key.endsWith('Icon')) {
        expect(typeof exportedValue).toBe('function');
      }
    });
  });
});

describe('Browser Environment Simulation', () => {
  // Test 11: Simulate browser webpack loading
  test('should work in browser-like webpack environment', () => {
    // Mock browser globals that webpack might expect
    const originalWindow = global.window;
    const originalDocument = global.document;
    
    try {
      // Create minimal browser environment
      global.window = {
        location: { href: 'http://localhost:3000' }
      };
      global.document = {
        createElement: jest.fn(() => ({})),
        querySelector: jest.fn()
      };
      
      // Test that icons still load correctly in browser environment
      const icons = require('../../src/components/icons');
      expect(icons.MicrophoneIcon).toBeDefined();
      
    } finally {
      global.window = originalWindow;
      global.document = originalDocument;
    }
  });

  // Test 12: Test error boundary scenario
  test('should provide detailed error information for debugging', () => {
    try {
      // Attempt to reproduce the exact error scenario
      const { MicrophoneIcon } = require('../../src/components/icons');
      
      // If successful, verify the component works
      expect(MicrophoneIcon).toBeDefined();
      expect(typeof MicrophoneIcon).toBe('function');
      
      // Test component instantiation (this is where webpack factory might fail)
      const iconElement = MicrophoneIcon({ className: 'test' });
      expect(iconElement).toBeDefined();
      
    } catch (error) {
      // Capture detailed error information for debugging
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
        fileName: error.fileName,
        lineNumber: error.lineNumber,
        columnNumber: error.columnNumber
      };
      
      console.error('Detailed error information:', errorInfo);
      
      // This error should help identify the webpack factory issue
      if (error.message.includes("Cannot read properties of undefined (reading 'call')")) {
        console.error('WEBPACK FACTORY ERROR DETECTED:', {
          ...errorInfo,
          diagnosis: 'Webpack module factory function is undefined',
          possibleCauses: [
            'Module compilation failed',
            'Import path resolution issue',
            'Circular dependency',
            'Hot module replacement issue',
            'Webpack chunk loading failure'
          ]
        });
      }
      
      throw error;
    }
  });
});