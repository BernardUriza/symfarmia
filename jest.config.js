const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/legacy_core/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/legacy_core/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@auth0/nextjs-auth0/client$': '<rootDir>/node_modules/@auth0/nextjs-auth0/dist/client/index.js'
  },
  projects: [
    {
      displayName: 'Medical Core',
      testMatch: ['<rootDir>/tests/medical-*/**/*.test.js', '<rootDir>/tests/medical-modules.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
    },
    {
      displayName: 'AI Integration',
      testMatch: ['<rootDir>/tests/ai-integration/**/*.test.js'],
    },
    {
      displayName: 'HIPAA Compliance',
      testMatch: ['<rootDir>/tests/compliance/**/*.test.js']
    }
  ]
}

module.exports = createJestConfig(customJestConfig)
