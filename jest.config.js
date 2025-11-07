/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/$1",
    "^next/navigation$": "<rootDir>/__mocks__/next/navigation.js",
  },
  transform: {
    "^.+\\.jsx?$": "babel-jest", // use babel-jest only for JS files
    "^.+\\.tsx?$": "ts-jest", // use ts-jest for TS/TSX
  },
  transformIgnorePatterns: ["/node_modules/(?!(bson|mongodb|mongoose)/)"],
};
