import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
    resolvePluginsRelativeTo: import.meta.dirname,
});

export default [
    {
        ignores: [
            'build/**',
            'playground/**',
        ],
    },
    js.configs.recommended,
    ...compat.config({
        extends: ['airbnb-base'],
    }),
    jsdocPlugin.configs['flat/recommended-typescript-error'],
    {
        files: ['ts/src/**/*.ts'],
        ignores: [
            'ts/src/base/functions/**',
            'ts/src/static_dependencies/**',
            'ts/src/pro/bridge/**',
            'ts/src/abstract/**',
        ],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2021,
                WebAssembly: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'unused-imports': unusedImportsPlugin,
        },
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.ts'],
                },
            },
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.js'],
            },
            'jsdoc': {
                tagNamePreference: {
                    'function': 'method',
                },
            },
        },
        rules: {
            'unused-imports/no-unused-imports': 'error',
            'no-spaced-func': 'off',
            'import/no-unresolved': 'off',
            'import/named': 'off',
            'strict': 'off',
            'semi': 'error',
            'indent': ['error', 4],
            'init-declarations': 'off',
            'no-undef-init': 'off',
            'comma-dangle': ['error', {
                'arrays': 'always-multiline',
                'objects': 'always-multiline',
                'imports': 'always-multiline',
                'exports': 'always-multiline',
                'functions': 'never',
            }],
            'import/extensions': 'off',
            'brace-style': ['error', '1tbs'],
            'multiline-comment-style': ['error', 'separate-lines'],
            'dot-notation': 'off',
            'quote-props': ['error', 'always'],
            'no-multi-spaces': ['error', { 'ignoreEOLComments': true }],
            'no-whitespace-before-property': 'error',
            'space-before-blocks': ['error', 'always'],
            'space-before-function-paren': ['error', 'always'],
            'func-call-spacing': ['error', 'always'],
            'block-spacing': ['error', 'always'],
            'keyword-spacing': ['error', { 'before': true, 'after': true }],
            'object-curly-spacing': ['error', 'always', { 'objectsInObjects': false }],
            'object-curly-newline': ['error', { 'consistent': true }],
            'space-infix-ops': 'error',
            'space-unary-ops': 'error',
            'space-in-parens': 'error',
            'no-nested-ternary': 'error',
            'eqeqeq': 'error',
            'quotes': ['error', 'single', { 'avoidEscape': true }],
            'no-unused-vars': ['error', { 'argsIgnorePattern': '^(exchange|headers|body|account|info|symbol|price|tag|side|since|name|limit|params|market|timeframe|api|path|code|currency|statusCode|statusText|url|method|response|requestHeaders|requestBody|bidsKey|asksKey|context|config|type|priceKey|amountKey|networkCode|marginMode|subscription|message|client|nonce|orderbook|bookside|deltas|delta|countOrIdKey|amount|fromCurrency|toCurrency|rawCurrency|error|reject)', 'caughtErrors': 'none' }],
            'new-parens': 'error',
            'new-cap': ['error'],
            'no-var': 'error',
            'prefer-const': ['error', {
                'destructuring': 'any',
                'ignoreReadBeforeAssign': false,
            }],
            'no-warning-comments': ['warn', { 'terms': ['fixme'] }],
            'padded-blocks': ['error', 'never'],
            'lines-between-class-members': ['error', 'always', { 'exceptAfterSingleLine': true }],
            'no-multiple-empty-lines': ['error', { 'max': 1 }],
            'padding-line-between-statements': ['error',
                { 'blankLine': 'never', 'prev': '*', 'next': '*' },
                { 'blankLine': 'always', 'prev': 'import', 'next': '*' },
                { 'blankLine': 'never', 'prev': 'import', 'next': 'import' },
                { 'blankLine': 'always', 'prev': 'directive', 'next': '*' },
                { 'blankLine': 'always', 'prev': '*', 'next': 'cjs-export' },
                { 'blankLine': 'always', 'prev': '*', 'next': 'export' },
                { 'blankLine': 'any', 'prev': 'export', 'next': 'export' },
                { 'blankLine': 'always', 'prev': '*', 'next': 'function' },
            ],
            'prefer-template': 'off',
            'curly': 'error',
            'no-plusplus': 'off',
            'no-restricted-properties': 'off',
            'prefer-destructuring': 'off',
            'class-methods-use-this': 'off',
            'no-param-reassign': 'off',
            'max-len': 'off',
            'no-return-await': 'off',
            'array-bracket-spacing': ['error', 'always'],
            'radix': 'off',
            'camelcase': 'off',
            'no-lonely-if': 'off',
            'no-mixed-operators': 'off',
            'jsdoc/no-types': 'off',
            'no-shadow': ['error', {
                'builtinGlobals': true,
                'hoist': 'all',
                'allow': [],
                'ignoreOnInitialization': false,
            }],
            'no-useless-concat': 'off',
            'no-continue': 'off',
            'no-else-return': 'off',
            'no-unneeded-ternary': 'off',
            'operator-assignment': 'off',
            'no-underscore-dangle': 'off',
            'consistent-return': 'off',
            'no-await-in-loop': 'off',
            'prefer-exponentiation-operator': 'off',
            'jsdoc/check-tag-names': ['error', {
                'definedTags': ['method', 'remarks'],
            }],
            'jsdoc/require-param-description': 'off',
            'jsdoc/reject-any-type': 'off',
            'jsdoc/require-throws-type': 'off',
        },
    },
];
