module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: 'src',
    testMatch: ['**/__tests__/**/*.(test|spec).ts'],
    collectCoverage: true,
    coverageDirectory: '../coverage',
    coveragePathIgnorePatterns: [
        '<rootDir>/websockets/client.map.ts' // Exclude client.map.ts from coverage
    ]
};
