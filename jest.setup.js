import "@testing-library/jest-dom";

// Mock Auth0
jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: () => ({
    user: null,
    isLoading: false,
    error: null,
  }),
  UserProvider: ({ children }) => children,
  withPageAuthRequired: (component) => component,
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock EdgeStore
jest.mock("@edgestore/react", () => ({
  EdgeStoreProvider: ({ children }) => children,
  useEdgeStore: () => ({
    publicImages: {
      upload: jest.fn(),
      delete: jest.fn(),
    },
  }),
}));

// Global test utilities
global.alert = jest.fn();
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Polyfill missing browser APIs
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;
