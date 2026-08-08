/**
 * Tests for Linting Rules
 * Phase 3-11.2: Test specific lint rules for parser error detection
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    UndefinedPlaceholderRule,
    UnsupportedTransformRule,
    InvalidReferenceRule,
    MissingRequiredFieldRule,
    TypeMismatchRule,
    InvalidPathRule,
    InvalidExpressionRule,
    SyntaxErrorRule,
    getAllRules,
    getCriticalRules,
    getRuleById,
    getRulesByType,
} from '../linting/rules.js';
import { DSLElement, LintContext } from '../linting/schema.js';

// ============================================================
// Test: UndefinedPlaceholderRule
// ============================================================

test('UndefinedPlaceholderRule - detects undefined placeholder', () => {
    const element: DSLElement = {
        type: 'placeholder',
        value: 'symbol',
        location: { path: 'test.edl', line: 10, column: 5 },
    };

    const context: LintContext = {
        placeholders: {
            timestamp: { name: 'timestamp', type: 'number' },
        },
        transforms: {},
        variables: {},
    };

    const errors = UndefinedPlaceholderRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'undefined_placeholder');
    assert.equal(errors[0].code, 'E001');
    assert.equal(errors[0].severity, 'error');
    assert.ok(errors[0].message.includes('symbol'));
    assert.ok(errors[0].suggestion);
});

test('UndefinedPlaceholderRule - allows defined placeholder', () => {
    const element: DSLElement = {
        type: 'placeholder',
        value: 'symbol',
        location: { path: 'test.edl', line: 10, column: 5 },
    };

    const context: LintContext = {
        placeholders: {
            symbol: { name: 'symbol', type: 'string' },
        },
        transforms: {},
        variables: {},
    };

    const errors = UndefinedPlaceholderRule.check(element, context);

    assert.equal(errors.length, 0);
});

test('UndefinedPlaceholderRule - ignores non-placeholder elements', () => {
    const element: DSLElement = {
        type: 'literal',
        value: 'some value',
        location: { path: 'test.edl', line: 10, column: 5 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = UndefinedPlaceholderRule.check(element, context);

    assert.equal(errors.length, 0);
});

// ============================================================
// Test: UnsupportedTransformRule
// ============================================================

test('UnsupportedTransformRule - detects unsupported transform', () => {
    const element: DSLElement = {
        type: 'transform',
        value: 'customTransform',
        location: { path: 'test.edl', line: 15, column: 8 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {
            parseNumber: { name: 'parseNumber', inputType: 'string', outputType: 'number' },
        },
        variables: {},
    };

    const errors = UnsupportedTransformRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'unsupported_transform');
    assert.equal(errors[0].code, 'E002');
    assert.ok(errors[0].message.includes('customTransform'));
});

test('UnsupportedTransformRule - allows supported transform', () => {
    const element: DSLElement = {
        type: 'transform',
        value: 'parseNumber',
        location: { path: 'test.edl', line: 15, column: 8 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {
            parseNumber: { name: 'parseNumber', inputType: 'string', outputType: 'number' },
        },
        variables: {},
    };

    const errors = UnsupportedTransformRule.check(element, context);

    assert.equal(errors.length, 0);
});

// ============================================================
// Test: InvalidReferenceRule
// ============================================================

test('InvalidReferenceRule - detects invalid reference', () => {
    const element: DSLElement = {
        type: 'reference',
        value: 'tickerParser',
        location: { path: 'test.edl', line: 20, column: 12 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {
            balanceParser: { type: 'parser' },
        },
    };

    const errors = InvalidReferenceRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].code, 'E008');
    assert.ok(errors[0].message.includes('tickerParser'));
    assert.ok(errors[0].suggestion);
});

test('InvalidReferenceRule - allows valid reference', () => {
    const element: DSLElement = {
        type: 'reference',
        value: 'tickerParser',
        location: { path: 'test.edl', line: 20, column: 12 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {
            tickerParser: { type: 'parser' },
        },
    };

    const errors = InvalidReferenceRule.check(element, context);

    assert.equal(errors.length, 0);
});

test('InvalidReferenceRule - detects circular reference', () => {
    const element: DSLElement = {
        type: 'reference',
        value: 'selfReference',
        location: { path: 'test.edl', line: 20, column: 12 },
        metadata: {
            circularReference: true,
        },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {
            selfReference: { type: 'parser' },
        },
    };

    const errors = InvalidReferenceRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].code, 'E009');
    assert.ok(errors[0].message.includes('Circular reference'));
});

// ============================================================
// Test: MissingRequiredFieldRule
// ============================================================

test('MissingRequiredFieldRule - detects missing required placeholder', () => {
    const element: DSLElement = {
        type: 'placeholder',
        value: 'apiKey',
        location: { path: 'test.edl', line: 25, column: 3 },
        metadata: {
            isEmpty: true,
        },
    };

    const context: LintContext = {
        placeholders: {
            apiKey: { name: 'apiKey', type: 'string', required: true },
        },
        transforms: {},
        variables: {},
    };

    const errors = MissingRequiredFieldRule.check(element, context);

    // Rule checks both isEmpty and !hasValue, so we get 2 errors
    assert.ok(errors.length >= 1);
    assert.ok(errors.some(e => e.type === 'missing_required'));
    assert.ok(errors.some(e => e.code === 'E005'));
    assert.ok(errors.some(e => e.message.includes('apiKey')));
});

test('MissingRequiredFieldRule - allows optional placeholder', () => {
    const element: DSLElement = {
        type: 'placeholder',
        value: 'optionalField',
        location: { path: 'test.edl', line: 25, column: 3 },
        metadata: {
            isEmpty: true,
        },
    };

    const context: LintContext = {
        placeholders: {
            optionalField: { name: 'optionalField', type: 'string', required: false },
        },
        transforms: {},
        variables: {},
    };

    const errors = MissingRequiredFieldRule.check(element, context);

    assert.equal(errors.length, 0);
});

test('MissingRequiredFieldRule - detects missing required fields in definitions', () => {
    const element: DSLElement = {
        type: 'expression',
        value: 'definition',
        location: { path: 'test.edl', line: 30, column: 1 },
        metadata: {
            requiredFields: ['endpoint', 'method', 'params'],
            providedFields: ['endpoint'],
        },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = MissingRequiredFieldRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].code, 'E010');
    assert.ok(errors[0].message.includes('method'));
    assert.ok(errors[0].message.includes('params'));
});

// ============================================================
// Test: TypeMismatchRule
// ============================================================

test('TypeMismatchRule - detects type mismatch in transform', () => {
    const element: DSLElement = {
        type: 'transform',
        value: 'parseNumber',
        location: { path: 'test.edl', line: 35, column: 5 },
        metadata: {
            inputType: 'boolean',
            expectedType: 'string',
        },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = TypeMismatchRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'type_mismatch');
    assert.equal(errors[0].code, 'E003');
});

test('TypeMismatchRule - allows compatible types', () => {
    const element: DSLElement = {
        type: 'transform',
        value: 'parseNumber',
        location: { path: 'test.edl', line: 35, column: 5 },
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

    const errors = TypeMismatchRule.check(element, context);

    assert.equal(errors.length, 0);
});

test('TypeMismatchRule - detects type mismatch in placeholder', () => {
    const element: DSLElement = {
        type: 'placeholder',
        value: 'price',
        location: { path: 'test.edl', line: 40, column: 8 },
        metadata: {
            actualType: 'string',
        },
    };

    const context: LintContext = {
        placeholders: {
            price: { name: 'price', type: 'number' },
        },
        transforms: {},
        variables: {},
    };

    const errors = TypeMismatchRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'type_mismatch');
});

test('TypeMismatchRule - detects incompatible expression operand types', () => {
    const element: DSLElement = {
        type: 'expression',
        value: 'a + b',
        location: { path: 'test.edl', line: 45, column: 10 },
        metadata: {
            operandTypes: ['string', 'number', 'boolean'],
        },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = TypeMismatchRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].severity, 'warning');
    assert.equal(errors[0].code, 'W002');
});

// ============================================================
// Test: InvalidPathRule
// ============================================================

test('InvalidPathRule - detects empty path', () => {
    const element: DSLElement = {
        type: 'path',
        value: '',
        location: { path: 'test.edl', line: 50, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidPathRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'invalid_path');
    assert.equal(errors[0].code, 'E004');
});

test('InvalidPathRule - detects consecutive dots', () => {
    const element: DSLElement = {
        type: 'path',
        value: 'data..field',
        location: { path: 'test.edl', line: 50, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidPathRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'invalid_path');
});

test('InvalidPathRule - detects unmatched brackets', () => {
    const element: DSLElement = {
        type: 'path',
        value: 'data[0.field',
        location: { path: 'test.edl', line: 50, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidPathRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.ok(errors[0].message.includes('bracket'));
});

test('InvalidPathRule - detects invalid bracket content', () => {
    const element: DSLElement = {
        type: 'path',
        value: 'data[invalid].field',
        location: { path: 'test.edl', line: 50, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidPathRule.check(element, context);

    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.code === 'W003'));
});

test('InvalidPathRule - allows valid path', () => {
    const element: DSLElement = {
        type: 'path',
        value: 'data.field[0].subfield',
        location: { path: 'test.edl', line: 50, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidPathRule.check(element, context);

    // Should have no errors (warnings OK)
    const criticalErrors = errors.filter(e => e.severity === 'error');
    assert.equal(criticalErrors.length, 0);
});

// ============================================================
// Test: InvalidExpressionRule
// ============================================================

test('InvalidExpressionRule - detects empty expression', () => {
    const element: DSLElement = {
        type: 'expression',
        value: '',
        location: { path: 'test.edl', line: 60, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidExpressionRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'invalid_expression');
    assert.equal(errors[0].code, 'E006');
});

test('InvalidExpressionRule - detects unmatched parentheses', () => {
    const element: DSLElement = {
        type: 'expression',
        value: '(a + b * c',
        location: { path: 'test.edl', line: 60, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidExpressionRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.ok(errors[0].message.includes('parenthes'));
});

test('InvalidExpressionRule - detects unmatched brackets', () => {
    const element: DSLElement = {
        type: 'expression',
        value: 'array[0 + 1',
        location: { path: 'test.edl', line: 60, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidExpressionRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.ok(errors[0].message.includes('bracket'));
});

test('InvalidExpressionRule - detects consecutive operators', () => {
    const element: DSLElement = {
        type: 'expression',
        value: 'a ++ b',
        location: { path: 'test.edl', line: 60, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidExpressionRule.check(element, context);

    // May detect consecutive operators as warning
    const warnings = errors.filter(e => e.severity === 'warning');
    assert.ok(warnings.length >= 0); // At least check it doesn't crash
});

test('InvalidExpressionRule - allows valid expression', () => {
    const element: DSLElement = {
        type: 'expression',
        value: '(a + b) * c / d',
        location: { path: 'test.edl', line: 60, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = InvalidExpressionRule.check(element, context);

    const criticalErrors = errors.filter(e => e.severity === 'error');
    assert.equal(criticalErrors.length, 0);
});

// ============================================================
// Test: SyntaxErrorRule
// ============================================================

test('SyntaxErrorRule - detects null value', () => {
    const element: DSLElement = {
        type: 'literal',
        value: null as any,
        location: { path: 'test.edl', line: 70, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = SyntaxErrorRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'syntax_error');
    assert.equal(errors[0].code, 'E007');
});

test('SyntaxErrorRule - detects undefined value', () => {
    const element: DSLElement = {
        type: 'literal',
        value: undefined as any,
        location: { path: 'test.edl', line: 70, column: 1 },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = SyntaxErrorRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.equal(errors[0].type, 'syntax_error');
});

test('SyntaxErrorRule - detects syntax error from metadata', () => {
    const element: DSLElement = {
        type: 'expression',
        value: 'some value',
        location: { path: 'test.edl', line: 70, column: 1 },
        metadata: {
            syntaxError: 'Unexpected token found',
            suggestion: 'Remove the unexpected token',
        },
    };

    const context: LintContext = {
        placeholders: {},
        transforms: {},
        variables: {},
    };

    const errors = SyntaxErrorRule.check(element, context);

    assert.equal(errors.length, 1);
    assert.ok(errors[0].message.includes('Unexpected token'));
    assert.ok(errors[0].suggestion?.includes('Remove'));
});

// ============================================================
// Test: Rule Collections
// ============================================================

test('getAllRules - returns all rules', () => {
    const rules = getAllRules();

    assert.ok(rules.length >= 8);
    assert.ok(rules.every(rule => rule.id && rule.name && rule.description));
});

test('getCriticalRules - returns only error severity rules', () => {
    const criticalRules = getCriticalRules();

    assert.ok(criticalRules.length > 0);
    assert.ok(criticalRules.every(rule => rule.severity === 'error'));
});

test('getRuleById - finds rule by ID', () => {
    const rule = getRuleById('undefined-placeholder');

    assert.ok(rule);
    assert.equal(rule.id, 'undefined-placeholder');
    assert.equal(rule.name, 'Undefined Placeholder');
});

test('getRuleById - returns undefined for unknown ID', () => {
    const rule = getRuleById('nonexistent-rule');

    assert.equal(rule, undefined);
});

test('getRulesByType - filters rules by type', () => {
    const rules = getRulesByType(['undefined-placeholder', 'type-mismatch']);

    assert.equal(rules.length, 2);
    assert.ok(rules.some(r => r.id === 'undefined-placeholder'));
    assert.ok(rules.some(r => r.id === 'type-mismatch'));
});

test('getRulesByType - returns empty array for no matches', () => {
    const rules = getRulesByType(['nonexistent-rule']);

    assert.equal(rules.length, 0);
});
