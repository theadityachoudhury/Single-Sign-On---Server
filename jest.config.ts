import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    // Explicitly include TS and JS extensions for module resolution
    // Use ts-jest resolver to properly resolve TS path aliases and .js-suffixed imports in ESM
    resolver: 'ts-jest-resolver',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'node'],
    moduleNameMapper: {
        '^@/Logger/(.*)(?:\\.js)?$': '<rootDir>/src/core/Logger/$1',
        '^@/apps/(.*)(?:\\.js)?$': '<rootDir>/src/apps/$1',
        '^@/Config/(.*)(?:\\.js)?$': '<rootDir>/src/core/Config/$1',
        '^@/types/OAuth/(.*)(?:\\.js)?$': '<rootDir>/src/apps/oauth/types/$1',
        '^@/utils/(.*)(?:\\.js)?$': '<rootDir>/src/Utils/$1',
        '^@/core/(.*)(?:\\.js)?$': '<rootDir>/src/core/$1',
        '^@/Utils/(.*)(?:\\.js)?$': '<rootDir>/src/Utils/$1',
        '^@/(.*)(?:\\.js)?$': '<rootDir>/src/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: '<rootDir>/tsconfig.test.json',
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
        // Exclude infrastructure/glue code that is hard to unit test and exercised indirectly
        '!src/app.ts',
        '!src/core/DB/**',
        '!src/core/Logger/**',
        '!src/core/Config/corsOptions.ts',
        '!src/Utils/Mongoose.ts',
        '!src/apps/oauth/models/**',
        '!src/apps/oauth/repositories/**',
        '!src/apps/oauth/app.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
    coverageThreshold: {
        global: {
            branches: 58,
            functions: 65,
            lines: 70,
            statements: 70,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    globalSetup: '<rootDir>/tests/global-setup.mjs',
    globalTeardown: '<rootDir>/tests/global-teardown.mjs',
    testTimeout: 30000,
    maxWorkers: '50%',
    verbose: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};

export default config;
