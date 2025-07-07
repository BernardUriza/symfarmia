import '@testing-library/jest-dom'

// Mock Auth0
jest.mock('@auth0/nextjs-auth0', () => ({
  useUser: () => ({
    user: null,
    isLoading: false,
    error: null,
  }),
  Auth0Provider: ({ children }) => children,
  withPageAuthRequired: (component) => component,
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Simplified NextResponse for API route tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init = {}) => ({
      status: init.status || 200,
      json: async () => data
    })
  }
}));

// Mock EdgeStore
jest.mock('@edgestore/react', () => ({
  EdgeStoreProvider: ({ children }) => children,
  useEdgeStore: () => ({
    publicImages: {
      upload: jest.fn(),
      delete: jest.fn(),
    },
  }),
}))

// Global test utilities
global.alert = jest.fn()
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
}

// Polyfill IntersectionObserver for framer-motion
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill AbortSignal.timeout for jsdom environment
if (typeof AbortSignal.timeout !== 'function') {
  AbortSignal.timeout = function timeout(ms) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

// Polyfill Request for environments that lack it
if (typeof Request === 'undefined') {
  global.Request = function DummyRequest() {};
}

if (typeof Response === 'undefined' || typeof Response.json !== 'function') {
  global.Response = class {
    constructor(body = '', init = {}) {
      this.body = typeof body === 'string' ? body : JSON.stringify(body);
      this.status = init.status || 200;
    }
    static json(data, init = {}) {
      return new Response(JSON.stringify(data), init);
    }
    async json() {
      return JSON.parse(this.body);
    }
  };
}