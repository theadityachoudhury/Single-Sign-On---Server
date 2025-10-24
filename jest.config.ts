import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^@/Logger/(.*)$': '<rootDir>/src/core/Logger/$1',
        '^@/apps/(.*)$': '<rootDir>/src/apps/$1',
        '^@/Config/(.*)$': '<rootDir>/src/core/Config/$1',
        '^@/types/OAuth/(.*)$': '<rootDir>/src/apps/oauth/types/$1',
        '^@/utils/(.*)$': '<rootDir>/src/Utils/$1',
        '^@/core/(.*)$': '<rootDir>/src/core/$1',
        '^@/Utils/(.*)$': '<rootDir>/src/Utils/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    module: 'ESNext',
                    moduleResolution: 'node',
                },
            },
        ],
    },
    testMatch: [
        '**/tests/**/*.test.ts',
        '**/tests/**/*.spec.ts',
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.spec.ts',
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.type.ts',
        '!src/**/*.types.ts',
        '!src/server.ts',
        '!src/**/index.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    testTimeout: 30000,
    maxWorkers: '50%',
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};

export default config;
