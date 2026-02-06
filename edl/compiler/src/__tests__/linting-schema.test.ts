/**
 * Tests for DSL Schema and Error Models for Linting
 * Phase 3-11.1: Test linting schema functionality
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
    DSLElement,
    LintContext,
    PlaceholderDefinition,
    TransformDefinition,
    undefinedPlaceholderRule,
    unsupportedTransformRule,
    typeMismatchRule,
    invalidPathRule,
    missingRequiredRule,
    invalidExpressionRule,
    syntaxErrorRule,
    lintElement,
    lintElements,
    createLintResult,
    getBuiltInRules,
} from '../linting/schema.js';

describe('DSL Linting Schema', () => {
    describe('Undefined Placeholder Detection', () => {
        it('should detect undefined placeholder', () => {
            const element: DSLElement = {
                type: 'placeholder',
                value: 'unknownPlaceholder',
                location: { path: 'test.edl', line: 1, column: 1 },
            };

            const context: LintContext = {
                placeholders: {
                    knownPlaceholder: {
                        name: 'knownPlaceholder',
                        type: 'string',
                    },
                },
                transforms: {},
                variables: {},
            };

            const errors = undefinedPlaceholderRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'undefined_placeholder');
            assert.equal(errors[0].code, 'E001');
            assert.equal(errors[0].severity, 'error');
            assert.ok(errors[0].message.includes('unknownPlaceholder'));
            assert.ok(errors[0].suggestion);
        });

        it('should not error on defined placeholder', () => {
            const element: DSLElement = {
                type: 'placeholder',
                value: 'knownPlaceholder',
                location: { path: 'test.edl', line: 1, column: 1 },
            };

            const context: LintContext = {
                placeholders: {
                    knownPlaceholder: {
                        name: 'knownPlaceholder',
                        type: 'string',
                    },
                },
                transforms: {},
                variables: {},
            };

            const errors = undefinedPlaceholderRule.check(element, context);

            assert.equal(errors.length, 0);
        });

        it('should ignore non-placeholder elements', () => {
            const element: DSLElement = {
                type: 'literal',
                value: 'some value',
                location: { path: 'test.edl', line: 1, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = undefinedPlaceholderRule.check(element, context);

            assert.equal(errors.length, 0);
        });
    });

    describe('Unsupported Transform Detection', () => {
        it('should detect unsupported transform', () => {
            const element: DSLElement = {
                type: 'transform',
                value: 'unknownTransform',
                location: { path: 'test.edl', line: 2, column: 5 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {
                    parseNumber: {
                        name: 'parseNumber',
                        inputType: 'string',
                        outputType: 'number',
                    },
                },
                variables: {},
            };

            const errors = unsupportedTransformRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'unsupported_transform');
            assert.equal(errors[0].code, 'E002');
            assert.equal(errors[0].severity, 'error');
            assert.ok(errors[0].message.includes('unknownTransform'));
        });

        it('should not error on supported transform', () => {
            const element: DSLElement = {
                type: 'transform',
                value: 'parseNumber',
                location: { path: 'test.edl', line: 2, column: 5 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {
                    parseNumber: {
                        name: 'parseNumber',
                        inputType: 'string',
                        outputType: 'number',
                    },
                },
                variables: {},
            };

            const errors = unsupportedTransformRule.check(element, context);

            assert.equal(errors.length, 0);
        });
    });

    describe('Type Mismatch Detection', () => {
        it('should detect type mismatch in transform', () => {
            const element: DSLElement = {
                type: 'transform',
                value: 'someTransform',
                location: { path: 'test.edl', line: 3, column: 10 },
                metadata: {
                    inputType: 'string',
                    expectedType: 'number',
                },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = typeMismatchRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'type_mismatch');
            assert.equal(errors[0].code, 'E003');
            assert.equal(errors[0].severity, 'error');
        });

        it('should detect type mismatch in placeholder', () => {
            const element: DSLElement = {
                type: 'placeholder',
                value: 'myPlaceholder',
                location: { path: 'test.edl', line: 3, column: 10 },
                metadata: {
                    actualType: 'string',
                },
            };

            const context: LintContext = {
                placeholders: {
                    myPlaceholder: {
                        name: 'myPlaceholder',
                        type: 'number',
                    },
                },
                transforms: {},
                variables: {},
            };

            const errors = typeMismatchRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'type_mismatch');
        });

        it('should allow compatible types', () => {
            const element: DSLElement = {
                type: 'transform',
                value: 'someTransform',
                location: { path: 'test.edl', line: 3, column: 10 },
                metadata: {
                    inputType: 'int',
                    expectedType: 'number',
                },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = typeMismatchRule.check(element, context);

            assert.equal(errors.length, 0);
        });
    });

    describe('Invalid Path Detection', () => {
        it('should detect empty path', () => {
            const element: DSLElement = {
                type: 'path',
                value: '',
                location: { path: 'test.edl', line: 4, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = invalidPathRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'invalid_path');
            assert.equal(errors[0].code, 'E004');
        });

        it('should detect invalid path syntax (consecutive dots)', () => {
            const element: DSLElement = {
                type: 'path',
                value: 'field..subfield',
                location: { path: 'test.edl', line: 4, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = invalidPathRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'invalid_path');
        });

        it('should detect unmatched brackets', () => {
            const element: DSLElement = {
                type: 'path',
                value: 'field[0.subfield',
                location: { path: 'test.edl', line: 4, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = invalidPathRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'invalid_path');
            assert.ok(errors[0].message.includes('bracket'));
        });

        it('should allow valid path', () => {
            const element: DSLElement = {
                type: 'path',
                value: 'field.subfield[0].value',
                location: { path: 'test.edl', line: 4, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = invalidPathRule.check(element, context);

            assert.equal(errors.length, 0);
        });
    });

    describe('Missing Required Detection', () => {
        it('should detect missing required placeholder', () => {
            const element: DSLElement = {
                type: 'placeholder',
                value: 'requiredField',
                location: { path: 'test.edl', line: 5, column: 1 },
                metadata: {
                    isEmpty: true,
                },
            };

            const context: LintContext = {
                placeholders: {
                    requiredField: {
                        name: 'requiredField',
                        type: 'string',
                        required: true,
                    },
                },
                transforms: {},
                variables: {},
            };

            const errors = missingRequiredRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'missing_required');
            assert.equal(errors[0].code, 'E005');
        });

        it('should not error on optional placeholder', () => {
            const element: DSLElement = {
                type: 'placeholder',
                value: 'optionalField',
                location: { path: 'test.edl', line: 5, column: 1 },
                metadata: {
                    isEmpty: true,
                },
            };

            const context: LintContext = {
                placeholders: {
                    optionalField: {
                        name: 'optionalField',
                        type: 'string',
                        required: false,
                    },
                },
                transforms: {},
                variables: {},
            };

            const errors = missingRequiredRule.check(element, context);

            assert.equal(errors.length, 0);
        });
    });

    describe('Invalid Expression Detection', () => {
        it('should detect empty expression', () => {
            const element: DSLElement = {
                type: 'expression',
                value: '',
                location: { path: 'test.edl', line: 6, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = invalidExpressionRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'invalid_expression');
            assert.equal(errors[0].code, 'E006');
        });

        it('should detect unmatched parentheses', () => {
            const element: DSLElement = {
                type: 'expression',
                value: '(a + b',
                location: { path: 'test.edl', line: 6, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = invalidExpressionRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'invalid_expression');
            assert.ok(errors[0].message.includes('parenthes'));
        });

        it('should allow valid expression', () => {
            const element: DSLElement = {
                type: 'expression',
                value: '(a + b) * c',
                location: { path: 'test.edl', line: 6, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = invalidExpressionRule.check(element, context);

            // Should not have any errors (warnings possible but not checked here)
            const criticalErrors = errors.filter(e => e.severity === 'error');
            assert.equal(criticalErrors.length, 0);
        });
    });

    describe('Syntax Error Detection', () => {
        it('should detect null value', () => {
            const element: DSLElement = {
                type: 'literal',
                value: null as any,
                location: { path: 'test.edl', line: 7, column: 1 },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = syntaxErrorRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'syntax_error');
            assert.equal(errors[0].code, 'E007');
        });

        it('should detect syntax error from metadata', () => {
            const element: DSLElement = {
                type: 'expression',
                value: 'invalid syntax',
                location: { path: 'test.edl', line: 7, column: 1 },
                metadata: {
                    syntaxError: 'Unexpected token',
                    suggestion: 'Check your syntax',
                },
            };

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const errors = syntaxErrorRule.check(element, context);

            assert.equal(errors.length, 1);
            assert.equal(errors[0].type, 'syntax_error');
            assert.ok(errors[0].message.includes('Unexpected token'));
        });
    });

    describe('Multiple Errors in One File', () => {
        it('should detect multiple errors across different elements', () => {
            const elements: DSLElement[] = [
                {
                    type: 'placeholder',
                    value: 'undefinedPlaceholder',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
                {
                    type: 'transform',
                    value: 'unknownTransform',
                    location: { path: 'test.edl', line: 2, column: 1 },
                },
                {
                    type: 'path',
                    value: 'invalid..path',
                    location: { path: 'test.edl', line: 3, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = lintElements(elements, context);

            assert.equal(result.valid, false);
            assert.equal(result.errors.length, 3);
            assert.ok(result.errors.some(e => e.type === 'undefined_placeholder'));
            assert.ok(result.errors.some(e => e.type === 'unsupported_transform'));
            assert.ok(result.errors.some(e => e.type === 'invalid_path'));
        });
    });

    describe('Severity Levels', () => {
        it('should categorize errors by severity', () => {
            const elements: DSLElement[] = [
                {
                    type: 'placeholder',
                    value: 'undefinedPlaceholder',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
                {
                    type: 'expression',
                    value: 'a + b',
                    location: { path: 'test.edl', line: 2, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = lintElements(elements, context);

            // Should have at least one error
            assert.ok(result.errors.length > 0);

            // All errors should have severity
            result.errors.forEach(error => {
                assert.ok(['error', 'warning', 'info'].includes(error.severity));
            });

            // Result should not be valid if there are errors
            if (result.errors.length > 0) {
                assert.equal(result.valid, false);
            }
        });

        it('should create valid result when no errors', () => {
            const elements: DSLElement[] = [
                {
                    type: 'literal',
                    value: 'some value',
                    location: { path: 'test.edl', line: 1, column: 1 },
                },
            ];

            const context: LintContext = {
                placeholders: {},
                transforms: {},
                variables: {},
            };

            const result = lintElements(elements, context);

            assert.equal(result.valid, true);
            assert.equal(result.errors.length, 0);
        });
    });

    describe('Built-in Rules', () => {
        it('should have all built-in rules', () => {
            const rules = getBuiltInRules();

            assert.ok(rules.length > 0);

            const ruleIds = rules.map(r => r.id);
            assert.ok(ruleIds.includes('undefined-placeholder'));
            assert.ok(ruleIds.includes('unsupported-transform'));
            assert.ok(ruleIds.includes('type-mismatch'));
            assert.ok(ruleIds.includes('invalid-path'));
            assert.ok(ruleIds.includes('missing-required'));
            assert.ok(ruleIds.includes('invalid-expression'));
            assert.ok(ruleIds.includes('syntax-error'));
        });

        it('should have properly structured rules', () => {
            const rules = getBuiltInRules();

            rules.forEach(rule => {
                assert.ok(rule.id);
                assert.ok(rule.name);
                assert.ok(rule.description);
                assert.ok(['error', 'warning', 'info'].includes(rule.severity));
                assert.equal(typeof rule.check, 'function');
            });
        });
    });

    describe('Lint Context', () => {
        it('should use context for validation', () => {
            const element: DSLElement = {
                type: 'placeholder',
                value: 'symbol',
                location: { path: 'test.edl', line: 1, column: 1 },
            };

            const context: LintContext = {
                placeholders: {
                    symbol: {
                        name: 'symbol',
                        type: 'string',
                        required: true,
                        validValues: ['BTC/USD', 'ETH/USD'],
                    },
                },
                transforms: {
                    parseSymbol: {
                        name: 'parseSymbol',
                        inputType: 'string',
                        outputType: 'string',
                    },
                },
                variables: {
                    currentSymbol: 'BTC/USD',
                },
                file: 'test.edl',
            };

            const result = lintElement(element, context);

            // Should not error as placeholder is defined
            assert.equal(result.errors.length, 0);
        });
    });

    describe('Lint Result Creation', () => {
        it('should create result from mixed errors', () => {
            const allErrors = [
                {
                    type: 'undefined_placeholder' as const,
                    message: 'Error 1',
                    location: { path: 'test.edl', line: 1, column: 1 },
                    severity: 'error' as const,
                    code: 'E001',
                },
                {
                    type: 'invalid_path' as const,
                    message: 'Warning 1',
                    location: { path: 'test.edl', line: 2, column: 1 },
                    severity: 'warning' as const,
                    code: 'W001',
                },
                {
                    type: 'syntax_error' as const,
                    message: 'Info 1',
                    location: { path: 'test.edl', line: 3, column: 1 },
                    severity: 'info' as const,
                    code: 'I001',
                },
            ];

            const result = createLintResult(allErrors);

            assert.equal(result.errors.length, 1);
            assert.equal(result.warnings.length, 1);
            assert.equal(result.info.length, 1);
            assert.equal(result.valid, false);
        });

        it('should mark result valid when only warnings', () => {
            const allErrors = [
                {
                    type: 'invalid_path' as const,
                    message: 'Warning 1',
                    location: { path: 'test.edl', line: 1, column: 1 },
                    severity: 'warning' as const,
                    code: 'W001',
                },
            ];

            const result = createLintResult(allErrors);

            assert.equal(result.errors.length, 0);
            assert.equal(result.warnings.length, 1);
            assert.equal(result.valid, true);
        });
    });
});
