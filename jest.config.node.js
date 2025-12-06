/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    displayName: 'node',
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["./jest.setup.node.ts"],
    testMatch: [
        "**/__tests__/api/**/*.test.ts",

    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^next/navigation$": "<rootDir>/__mocks__/next/navigation.js",
        "^next/headers$": "<rootDir>/__mocks__/next/headers.ts",
        "^next/server$": "<rootDir>/__mocks__/next/server.ts",
    },
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    transformIgnorePatterns: [
        "/node_modules/(?!(bson|mongodb|mongoose|@mongodb-js)/)"
    ],
};