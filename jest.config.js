module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/$1",
    "^next/navigation$": "<rootDir>/__mocks__/next/navigation.js",
  },
  testPathIgnorePatterns: ["<rootDir>/__tests__/mocks/"],
  transform: {
    "^.+\\.(js|jsx|mjs)$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@babel|bson|mongodb|mongoose|msw|until-async)/)",
  ],
};
