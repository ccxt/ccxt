/**
 * Tests for Conditional Mapping Syntax
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    isConditionalExpression,
    isConditionalMapping,
    isFallbackExpression,
    isCoalesceExpression,
    isSwitchExpression,
    isPatternMatchExpression,
    validateConditionalExpression,
    validateConditionalMapping,
    validateFallbackExpression,
    validateCoalesceExpression,
    validateSwitchExpression,
    validatePatternMatchExpression,
    validateConditionalConstruct,
    type ConditionalExpression,
    type ConditionalMapping,
    type FallbackExpression,
    type CoalesceExpression,
    type SwitchExpression,
    type PatternMatchExpression,
    type ConditionalASTNode,
    type FallbackASTNode,
    type SwitchASTNode,
} from '../syntax/conditional-mapping.js';

// ============================================================
// Conditional Expression Tests
// ============================================================

test('should validate simple conditional expression', () => {
    const expr: ConditionalExpression = {
        if: "status == 'active'",
        then: true,
        else: false,
    };

    assert.equal(isConditionalExpression(expr), true);
    assert.deepEqual(validateConditionalExpression(expr), []);
});

test('should validate conditional with field mapping in then', () => {
    const expr: ConditionalExpression = {
        if: "response.success",
        then: { path: "data.value" },
        else: { literal: null },
    };

    assert.equal(isConditionalExpression(expr), true);
    assert.deepEqual(validateConditionalExpression(expr), []);
});

test('should validate nested conditional expressions', () => {
    const expr: ConditionalExpression = {
        if: "price > 100",
        then: {
            if: "quantity > 10",
            then: "bulk",
            else: "normal",
        },
        else: "small",
    };

    assert.equal(isConditionalExpression(expr), true);
    assert.deepEqual(validateConditionalExpression(expr), []);
});

test('should validate conditional without else clause', () => {
    const expr: ConditionalExpression = {
        if: "status == 'active'",
        then: true,
    };

    assert.equal(isConditionalExpression(expr), true);
    assert.deepEqual(validateConditionalExpression(expr), []);
});

test('should reject conditional without if clause', () => {
    const expr: any = {
        then: true,
        else: false,
    };

    const errors = validateConditionalExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('if')));
});

test('should reject conditional without then clause', () => {
    const expr: any = {
        if: "status == 'active'",
        else: false,
    };

    const errors = validateConditionalExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('then')));
});

// ============================================================
// Conditional Mapping Tests
// ============================================================

test('should validate conditional mapping', () => {
    const mapping: ConditionalMapping = {
        condition: "status == 'active'",
        whenTrue: { literal: "enabled" },
        whenFalse: { literal: "disabled" },
    };

    assert.equal(isConditionalMapping(mapping), true);
    assert.deepEqual(validateConditionalMapping(mapping), []);
});

test('should validate conditional mapping with binary expression condition', () => {
    const mapping: ConditionalMapping = {
        condition: {
            op: 'gt',
            left: 'price',
            right: 100,
        },
        whenTrue: "expensive",
        whenFalse: "cheap",
    };

    assert.equal(isConditionalMapping(mapping), true);
    assert.deepEqual(validateConditionalMapping(mapping), []);
});

test('should reject conditional mapping without condition', () => {
    const mapping: any = {
        whenTrue: { literal: "enabled" },
    };

    const errors = validateConditionalMapping(mapping);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('condition')));
});

// ============================================================
// Fallback Expression Tests
// ============================================================

test('should validate simple fallback expression', () => {
    const expr: FallbackExpression = {
        value: "response.data",
        fallback: 0,
    };

    assert.equal(isFallbackExpression(expr), true);
    assert.deepEqual(validateFallbackExpression(expr), []);
});

test('should validate fallback with options', () => {
    const expr: FallbackExpression = {
        value: "response.data",
        fallback: "N/A",
        nullIsValid: false,
        emptyStringIsInvalid: true,
        zeroIsInvalid: false,
    };

    assert.equal(isFallbackExpression(expr), true);
    assert.deepEqual(validateFallbackExpression(expr), []);
});

test('should validate nested fallback expressions', () => {
    const expr: FallbackExpression = {
        value: "response.data",
        fallback: {
            value: "response.default",
            fallback: 0,
        },
    };

    assert.equal(isFallbackExpression(expr), true);
    assert.deepEqual(validateFallbackExpression(expr), []);
});

test('should reject fallback without value', () => {
    const expr: any = {
        fallback: 0,
    };

    const errors = validateFallbackExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('value')));
});

test('should reject fallback without fallback value', () => {
    const expr: any = {
        value: "response.data",
    };

    const errors = validateFallbackExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('fallback')));
});

test('should reject fallback with invalid nullIsValid type', () => {
    const expr: any = {
        value: "response.data",
        fallback: 0,
        nullIsValid: "yes",
    };

    const errors = validateFallbackExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('nullIsValid')));
});

// ============================================================
// Coalesce Expression Tests
// ============================================================

test('should validate coalesce expression', () => {
    const expr: CoalesceExpression = {
        coalesce: ["response.preferred", "response.alternate", "response.default", 0],
    };

    assert.equal(isCoalesceExpression(expr), true);
    assert.deepEqual(validateCoalesceExpression(expr), []);
});

test('should validate coalesce with nullIsValid option', () => {
    const expr: CoalesceExpression = {
        coalesce: ["response.data", "response.backup"],
        nullIsValid: true,
    };

    assert.equal(isCoalesceExpression(expr), true);
    assert.deepEqual(validateCoalesceExpression(expr), []);
});

test('should reject coalesce without array', () => {
    const expr: any = {
        coalesce: "not-an-array",
    };

    const errors = validateCoalesceExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('array')));
});

test('should reject coalesce with empty array', () => {
    const expr: CoalesceExpression = {
        coalesce: [],
    };

    const errors = validateCoalesceExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('at least one')));
});

// ============================================================
// Switch Expression Tests
// ============================================================

test('should validate simple switch expression', () => {
    const expr: SwitchExpression = {
        switch: "orderType",
        cases: {
            "market": 1,
            "limit": 2,
            "stop": 3,
        },
        default: 0,
    };

    assert.equal(isSwitchExpression(expr), true);
    assert.deepEqual(validateSwitchExpression(expr), []);
});

test('should validate switch with complex expressions', () => {
    const expr: SwitchExpression = {
        switch: "status",
        cases: {
            "FILLED": { literal: "closed" },
            "OPEN": { literal: "open" },
            "CANCELLED": { literal: "cancelled" },
        },
    };

    assert.equal(isSwitchExpression(expr), true);
    assert.deepEqual(validateSwitchExpression(expr), []);
});

test('should validate switch with match mode', () => {
    const expr: SwitchExpression = {
        switch: "price",
        cases: {
            "< 100": "cheap",
            ">= 100 && < 1000": "normal",
        },
        default: "expensive",
        matchMode: "expression",
    };

    assert.equal(isSwitchExpression(expr), true);
    assert.deepEqual(validateSwitchExpression(expr), []);
});

test('should validate switch without default', () => {
    const expr: SwitchExpression = {
        switch: "orderType",
        cases: {
            "market": 1,
            "limit": 2,
        },
    };

    assert.equal(isSwitchExpression(expr), true);
    assert.deepEqual(validateSwitchExpression(expr), []);
});

test('should reject switch without switch value', () => {
    const expr: any = {
        cases: {
            "market": 1,
        },
    };

    const errors = validateSwitchExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('switch')));
});

test('should reject switch without cases', () => {
    const expr: any = {
        switch: "orderType",
    };

    const errors = validateSwitchExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('cases')));
});

test('should reject switch with empty cases', () => {
    const expr: SwitchExpression = {
        switch: "orderType",
        cases: {},
    };

    const errors = validateSwitchExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('at least one case')));
});

test('should reject switch with invalid match mode', () => {
    const expr: any = {
        switch: "orderType",
        cases: { "market": 1 },
        matchMode: "invalid",
    };

    const errors = validateSwitchExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('matchMode')));
});

// ============================================================
// Pattern Match Expression Tests
// ============================================================

test('should validate pattern match expression', () => {
    const expr: PatternMatchExpression = {
        match: "orderStatus",
        patterns: [
            { pattern: /^PARTIAL/, result: "partially_filled" },
            { pattern: "FILLED", result: "filled" },
            { pattern: "CANCELLED", result: "cancelled" },
        ],
        default: "unknown",
    };

    assert.equal(isPatternMatchExpression(expr), true);
    assert.deepEqual(validatePatternMatchExpression(expr), []);
});

test('should validate pattern match with guards', () => {
    const expr: PatternMatchExpression = {
        match: "orderStatus",
        patterns: [
            {
                pattern: "FILLED",
                guard: "quantity > 0",
                result: "filled"
            },
            {
                pattern: "CANCELLED",
                result: "cancelled"
            },
        ],
    };

    assert.equal(isPatternMatchExpression(expr), true);
    assert.deepEqual(validatePatternMatchExpression(expr), []);
});

test('should reject pattern match without match value', () => {
    const expr: any = {
        patterns: [
            { pattern: "test", result: "value" },
        ],
    };

    const errors = validatePatternMatchExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('match')));
});

test('should reject pattern match without patterns array', () => {
    const expr: any = {
        match: "value",
    };

    const errors = validatePatternMatchExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('patterns')));
});

test('should reject pattern match with empty patterns', () => {
    const expr: PatternMatchExpression = {
        match: "value",
        patterns: [],
    };

    const errors = validatePatternMatchExpression(expr);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('at least one pattern')));
});

// ============================================================
// General Validation Tests
// ============================================================

test('should validate conditional construct using general validator', () => {
    const conditionalExpr: ConditionalExpression = {
        if: "test",
        then: true,
    };

    assert.deepEqual(validateConditionalConstruct(conditionalExpr), []);

    const fallbackExpr: FallbackExpression = {
        value: "data",
        fallback: 0,
    };

    assert.deepEqual(validateConditionalConstruct(fallbackExpr), []);

    const switchExpr: SwitchExpression = {
        switch: "type",
        cases: { "a": 1 },
    };

    assert.deepEqual(validateConditionalConstruct(switchExpr), []);
});

test('should reject unknown construct type', () => {
    const unknown = { unknown: "type" };

    const errors = validateConditionalConstruct(unknown);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('Unknown')));
});

// ============================================================
// AST Node Tests
// ============================================================

test('should create conditional AST node', () => {
    const astNode: ConditionalASTNode = {
        type: 'ConditionalExpression',
        condition: {
            type: 'BinaryExpression',
            operator: '==',
            left: { type: 'Identifier', name: 'status' },
            right: { type: 'Literal', value: 'active' },
        },
        consequent: { type: 'Literal', value: true },
        alternate: { type: 'Literal', value: false },
        location: {
            line: 1,
            column: 0,
            path: 'test.edl',
        },
    };

    assert.equal(astNode.type, 'ConditionalExpression');
    assert.ok(astNode.condition);
    assert.ok(astNode.consequent);
    assert.ok(astNode.alternate);
});

test('should create fallback AST node', () => {
    const astNode: FallbackASTNode = {
        type: 'FallbackExpression',
        primary: { type: 'Identifier', name: 'data' },
        fallback: { type: 'Literal', value: 0 },
        options: {
            nullIsValid: false,
            emptyStringIsInvalid: true,
        },
    };

    assert.equal(astNode.type, 'FallbackExpression');
    assert.ok(astNode.primary);
    assert.ok(astNode.fallback);
    assert.ok(astNode.options);
});

test('should create switch AST node', () => {
    const astNode: SwitchASTNode = {
        type: 'SwitchExpression',
        discriminant: { type: 'Identifier', name: 'orderType' },
        cases: [
            {
                test: 'market',
                consequent: { type: 'Literal', value: 1 },
            },
            {
                test: 'limit',
                consequent: { type: 'Literal', value: 2 },
            },
        ],
        default: { type: 'Literal', value: 0 },
        matchMode: 'exact',
    };

    assert.equal(astNode.type, 'SwitchExpression');
    assert.ok(astNode.discriminant);
    assert.equal(astNode.cases.length, 2);
    assert.ok(astNode.default);
});

// ============================================================
// Integration Tests
// ============================================================

test('should handle complex nested conditional structures', () => {
    const expr: ConditionalExpression = {
        if: {
            op: 'and',
            left: {
                op: 'gt',
                left: 'price',
                right: 100,
            },
            right: {
                op: 'eq',
                left: 'status',
                right: 'active',
            },
        },
        then: {
            switch: 'orderType',
            cases: {
                'market': { value: 'response.market', fallback: 0 },
                'limit': { value: 'response.limit', fallback: 0 },
            },
            default: 0,
        },
        else: {
            coalesce: ['response.fallback1', 'response.fallback2', null],
        },
    };

    assert.equal(isConditionalExpression(expr), true);
    assert.deepEqual(validateConditionalExpression(expr), []);
});

test('should handle switch with fallback in cases', () => {
    const expr: SwitchExpression = {
        switch: "orderStatus",
        cases: {
            "OPEN": {
                value: "response.openPrice",
                fallback: 0,
            },
            "FILLED": {
                value: "response.fillPrice",
                fallback: {
                    value: "response.lastPrice",
                    fallback: 0,
                },
            },
        },
        default: null,
    };

    assert.equal(isSwitchExpression(expr), true);
    assert.deepEqual(validateSwitchExpression(expr), []);
});
