const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/legacy_core/",
    "<rootDir>/__tests__/utils/",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "app/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/legacy_core/**",
  ],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
