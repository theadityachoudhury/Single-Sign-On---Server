const { configs } = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js'],
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                // Node.js globals
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                process: 'readonly',
                global: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                Buffer: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setImmediate: 'readonly',
                clearImmediate: 'readonly',
            },
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 0,
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    {
        files: ['eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'script',
            globals: {
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
            },
        },
    },
    prettierConfig,
    {
        ignores: [
            'node_modules',
            'dist',
            'build',
            'coverage',
            'out',
            'lib',
            'temp',
            'tmp',
            'logs',
            'public',
            'assets',
            'vendor',
            'scripts',
            'config',
            'eslint.config.js',
        ],
    },
];
