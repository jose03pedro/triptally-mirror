module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/$1",
    "^next/navigation$": "<rootDir>/__mocks__/next/navigation.js",
    "^next/headers$": "<rootDir>/__mocks__/next/headers.ts",
    "^next/server$": "<rootDir>/__mocks__/next/server.ts",
  },
  testPathIgnorePatterns: ["<rootDir>/__tests__/mocks/"],
  transform: {
    "^.+\\.(js|jsx|mjs)$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(bson|mongodb|mongoose|@mongodb-js)/)"],
};