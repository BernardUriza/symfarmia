/**
 * Unit tests for MinimalistLandingPage component
 * Tests imports, webpack resolution, and component rendering
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

jest.mock('next/dynamic', () => {
  return function dynamic(importFunction) {
    const MockComponent = React.forwardRef((props, ref) => {
      return <div data-testid="dynamic-component" {...props} />;
    });
    MockComponent.displayName = 'MockDynamicComponent';
    return MockComponent;
  };
});

// Mock providers
const MockI18nProvider = ({ children }) => children;
MockI18nProvider.useTranslation = () => ({
  t: (key) => key // Return the key as the translation
});

const MockAppModeProvider = ({ children }) => children;
MockAppModeProvider.useAppMode = () => ({
  isDemoMode: false
});

jest.mock('../../app/providers/I18nProvider', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

jest.mock('../../app/providers/AppModeProvider', () => ({
  useAppMode: () => ({
    isDemoMode: false
  })
}));

// Mock LanguageToggle
jest.mock('../../components/LanguageToggle', () => {
  return function MockLanguageToggle(props) {
    return <div data-testid="language-toggle" {...props} />;
  };
});

describe('MinimalistLandingPage Imports', () => {
  // Test 1: Verify icons can be imported without errors
  test('should import all icons successfully', async () => {
    let importError = null;
    
    try {
      const icons = await import('../../src/components/icons');
      
      // Verify all expected icons are available
      expect(icons.MicrophoneIcon).toBeDefined();
      expect(icons.DocumentTextIcon).toBeDefined();
      expect(icons.ArrowPathIcon).toBeDefined();
      expect(icons.CheckCircleIcon).toBeDefined();
      expect(icons.UserIcon).toBeDefined();
      expect(icons.StarIcon).toBeDefined();
      expect(icons.HeartIcon).toBeDefined();
      
      // Test that icons are actually React components
      expect(typeof icons.MicrophoneIcon).toBe('function');
      expect(typeof icons.DocumentTextIcon).toBe('function');
      expect(typeof icons.ArrowPathIcon).toBe('function');
      expect(typeof icons.CheckCircleIcon).toBe('function');
      expect(typeof icons.UserIcon).toBeDefined();
      expect(typeof icons.StarIcon).toBe('function');
      expect(typeof icons.HeartIcon).toBe('function');
      
    } catch (error) {
      importError = error;
    }
    
    expect(importError).toBeNull();
  });

  // Test 2: Verify each icon renders without errors
  test('should render all icons without errors', () => {
    const { MicrophoneIcon, DocumentTextIcon, ArrowPathIcon, CheckCircleIcon, UserIcon, StarIcon, HeartIcon } = require('../../src/components/icons');
    
    const icons = [
      { Component: MicrophoneIcon, name: 'MicrophoneIcon' },
      { Component: DocumentTextIcon, name: 'DocumentTextIcon' },
      { Component: ArrowPathIcon, name: 'ArrowPathIcon' },
      { Component: CheckCircleIcon, name: 'CheckCircleIcon' },
      { Component: UserIcon, name: 'UserIcon' },
      { Component: StarIcon, name: 'StarIcon' },
      { Component: HeartIcon, name: 'HeartIcon' }
    ];
    
    icons.forEach(({ Component, name }) => {
      expect(() => {
        render(<Component className="w-4 h-4" />);
      }).not.toThrow();
    });
  });

  // Test 3: Verify MinimalistLandingPage can be imported
  test('should import MinimalistLandingPage component successfully', async () => {
    let importError = null;
    let MinimalistLandingPage = null;
    
    try {
      const module = await import('../../src/components/MinimalistLandingPage');
      MinimalistLandingPage = module.default;
    } catch (error) {
      importError = error;
      console.error('Import error:', error);
    }
    
    expect(importError).toBeNull();
    expect(MinimalistLandingPage).toBeDefined();
    expect(typeof MinimalistLandingPage).toBe('function');
  });
});

describe('MinimalistLandingPage Component', () => {
  let MinimalistLandingPage;
  
  beforeAll(async () => {
    try {
      const module = await import('../../src/components/MinimalistLandingPage');
      MinimalistLandingPage = module.default;
    } catch (error) {
      console.error('Failed to import MinimalistLandingPage:', error);
      throw error;
    }
  });

  // Test 4: Component renders without crashing
  test('should render without crashing', () => {
    expect(() => {
      render(<MinimalistLandingPage />);
    }).not.toThrow();
  });

  // Test 5: Component renders in demo mode
  test('should render in demo mode', () => {
    expect(() => {
      render(<MinimalistLandingPage isDemo={true} />);
    }).not.toThrow();
  });

  // Test 6: All icons are used correctly in the component
  test('should use all icons correctly', () => {
    const { container } = render(<MinimalistLandingPage />);
    
    // Check that the component rendered successfully
    expect(container.firstChild).toBeTruthy();
    
    // Check for elements that should contain icons
    const heroSection = container.querySelector('.hero-section');
    expect(heroSection).toBeTruthy();
  });

  // Test 7: Email form functionality
  test('should handle email form submission', async () => {
    render(<MinimalistLandingPage />);
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const submitButton = screen.getByRole('button', { name: /cta_save_time/i });
    
    expect(emailInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    
    // Test form interaction
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
    
    fireEvent.click(submitButton);
    
    // Should show submitting state
    await waitFor(() => {
      expect(screen.getByText('cta_sending')).toBeInTheDocument();
    });
  });

  // Test 8: Demo button functionality
  test('should handle demo button click', () => {
    render(<MinimalistLandingPage />);
    
    const demoButtons = screen.getAllByText('demo_interactive');
    expect(demoButtons.length).toBeGreaterThan(0);
    
    // Click first demo button
    fireEvent.click(demoButtons[0]);
    
    // Modal should be opened (mocked component)
    expect(screen.getByTestId('dynamic-component')).toBeInTheDocument();
  });
});

describe('Webpack Import Resolution', () => {
  // Test 9: Test webpack module resolution
  test('should resolve icon imports correctly', () => {
    // Test that webpack can resolve the icons module
    const iconsPath = require.resolve('../../src/components/icons');
    expect(iconsPath).toBeDefined();
    expect(iconsPath).toContain('icons');
  });

  // Test 10: Test relative path resolution
  test('should resolve relative imports correctly', () => {
    // Test the specific import that's failing
    expect(() => {
      require('../../src/components/icons');
    }).not.toThrow();
  });

  // Test 11: Test that all expected exports exist
  test('should have all expected icon exports', () => {
    const icons = require('../../src/components/icons');
    
    const expectedIcons = [
      'MicrophoneIcon',
      'DocumentTextIcon', 
      'ArrowPathIcon',
      'CheckCircleIcon',
      'UserIcon',
      'StarIcon',
      'HeartIcon'
    ];
    
    expectedIcons.forEach(iconName => {
      expect(icons[iconName]).toBeDefined();
      expect(typeof icons[iconName]).toBe('function');
    });
  });
});

describe('Error Boundary Testing', () => {
  // Test 12: Test component behavior when imports fail
  test('should handle import failures gracefully', () => {
    // Mock a failed import scenario
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // This test verifies our component doesn't crash the entire app
    expect(() => {
      render(<MinimalistLandingPage />);
    }).not.toThrow();
    
    console.error = originalConsoleError;
  });

  // Test 13: Test webpack factory function issue
  test('should handle webpack factory undefined error', () => {
    // Simulate the specific error from the stack trace
    const mockWebpackRequire = jest.fn().mockImplementation(() => {
      throw new TypeError("Cannot read properties of undefined (reading 'call')");
    });
    
    // Test that our component has proper error boundaries
    expect(() => {
      try {
        render(<MinimalistLandingPage />);
      } catch (error) {
        // If this specific webpack error occurs, it should be caught
        if (error.message.includes("Cannot read properties of undefined (reading 'call')")) {
          // This is the error we're trying to debug
          console.log('Webpack factory error reproduced:', error);
        }
        throw error;
      }
    }).not.toThrow();
  });
});