/**
 * Parameter Translation Schema Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    TargetEnvironment,
    NamingConvention,
    TypeMapping,
    TranslationContext,
    ParameterTranslationRule,
    TypeCoercion,
    CodeGenerationHook,
    TranslationStrategy,
    TYPE_MAPPINGS,
    getTypeMapping,
    convertNamingConvention,
    createTranslationRule,
    generateTypeCoercion,
    validateTranslationRule,
    createDefaultContext,
    applyTranslationStrategy,
} from '../schemas/parameter-translation.js';

// ============================================================
// Type Mapping Tests
// ============================================================

test('TYPE_MAPPINGS should contain mappings for all target environments', () => {
    const environments: TargetEnvironment[] = ['typescript', 'javascript', 'python', 'php'];

    for (const env of environments) {
        assert.ok(TYPE_MAPPINGS[env], `Missing type mappings for ${env}`);
        assert.ok(Array.isArray(TYPE_MAPPINGS[env]), `Type mappings for ${env} should be an array`);
        assert.ok(TYPE_MAPPINGS[env].length > 0, `Type mappings for ${env} should not be empty`);
    }
});

test('getTypeMapping should find correct TypeScript mapping for string type', () => {
    const mapping = getTypeMapping('string', 'typescript');

    assert.ok(mapping);
    assert.equal(mapping.sourceType, 'string');
    assert.equal(mapping.targetType, 'string');
});

test('getTypeMapping should find correct Python mapping for integer type', () => {
    const mapping = getTypeMapping('int', 'python');

    assert.ok(mapping);
    assert.equal(mapping.sourceType, 'int');
    assert.equal(mapping.targetType, 'int');
});

test('getTypeMapping should find correct PHP mapping for object type', () => {
    const mapping = getTypeMapping('object', 'php');

    assert.ok(mapping);
    assert.equal(mapping.sourceType, 'object');
    assert.equal(mapping.targetType, 'array');
});

test('getTypeMapping should prioritize custom mappings over defaults', () => {
    const customMappings: TypeMapping[] = [
        { sourceType: 'string', targetType: 'CustomString' },
    ];

    const mapping = getTypeMapping('string', 'typescript', customMappings);

    assert.ok(mapping);
    assert.equal(mapping.targetType, 'CustomString');
});

test('getTypeMapping should return undefined for unknown type', () => {
    const mapping = getTypeMapping('unknown' as any, 'typescript');

    assert.equal(mapping, undefined);
});

// ============================================================
// Naming Convention Tests
// ============================================================

test('convertNamingConvention should convert snake_case to camelCase', () => {
    const result = convertNamingConvention('my_variable_name', 'camelCase');
    assert.equal(result, 'myVariableName');
});

test('convertNamingConvention should convert camelCase to snake_case', () => {
    const result = convertNamingConvention('myVariableName', 'snake_case');
    assert.equal(result, 'my_variable_name');
});

test('convertNamingConvention should convert camelCase to PascalCase', () => {
    const result = convertNamingConvention('myVariableName', 'PascalCase');
    assert.equal(result, 'MyVariableName');
});

test('convertNamingConvention should convert PascalCase to kebab-case', () => {
    const result = convertNamingConvention('MyClassName', 'kebab-case');
    assert.equal(result, 'my-class-name');
});

test('convertNamingConvention should convert snake_case to SCREAMING_SNAKE_CASE', () => {
    const result = convertNamingConvention('my_constant', 'SCREAMING_SNAKE_CASE');
    assert.equal(result, 'MY_CONSTANT');
});

test('convertNamingConvention should handle kebab-case to camelCase', () => {
    const result = convertNamingConvention('my-variable-name', 'camelCase');
    assert.equal(result, 'myVariableName');
});

test('convertNamingConvention should handle single word', () => {
    const result = convertNamingConvention('variable', 'camelCase');
    assert.equal(result, 'variable');
});

test('convertNamingConvention should handle already correct convention', () => {
    const result = convertNamingConvention('myVariable', 'camelCase');
    assert.equal(result, 'myVariable');
});

// ============================================================
// Translation Context Tests
// ============================================================

test('createDefaultContext should create TypeScript context with correct defaults', () => {
    const context = createDefaultContext('typescript');

    assert.equal(context.environment, 'typescript');
    assert.equal(context.namingConvention, 'camelCase');
    assert.equal(context.includeTypeAnnotations, true);
    assert.equal(context.includeValidation, true);
});

test('createDefaultContext should create Python context with snake_case', () => {
    const context = createDefaultContext('python');

    assert.equal(context.environment, 'python');
    assert.equal(context.namingConvention, 'snake_case');
    assert.equal(context.includeTypeAnnotations, true);
    assert.equal(context.includeValidation, true);
});

test('createDefaultContext should create PHP context with camelCase', () => {
    const context = createDefaultContext('php');

    assert.equal(context.environment, 'php');
    assert.equal(context.namingConvention, 'camelCase');
    assert.equal(context.includeTypeAnnotations, false);
    assert.equal(context.includeValidation, true);
});

// ============================================================
// Translation Rule Tests
// ============================================================

test('createTranslationRule should create basic TypeScript rule', () => {
    const context = createDefaultContext('typescript');
    const rule = createTranslationRule('order_id', 'string', context);

    assert.equal(rule.sourceName, 'order_id');
    assert.equal(rule.targetName, 'orderId');
    assert.equal(rule.sourceType, 'string');
    assert.equal(rule.targetType, 'string');
});

test('createTranslationRule should create Python rule with snake_case', () => {
    const context = createDefaultContext('python');
    const rule = createTranslationRule('orderId', 'int', context);

    assert.equal(rule.sourceName, 'orderId');
    assert.equal(rule.targetName, 'order_id');
    assert.equal(rule.sourceType, 'int');
    assert.equal(rule.targetType, 'int');
});

test('createTranslationRule should include options in the rule', () => {
    const context = createDefaultContext('typescript');
    const rule = createTranslationRule('user_id', 'string', context, {
        aliases: ['userId', 'uid'],
        required: true,
        defaultValue: 'null',
        documentation: 'The user identifier',
    });

    assert.deepEqual(rule.aliases, ['userId', 'uid']);
    assert.equal(rule.required, true);
    assert.equal(rule.defaultValue, 'null');
    assert.equal(rule.documentation, 'The user identifier');
});

test('createTranslationRule should throw error for unmapped type', () => {
    const context = createDefaultContext('typescript');

    assert.throws(() => {
        createTranslationRule('param', 'unknown' as any, context);
    }, /No type mapping found/);
});

test('validateTranslationRule should accept valid rule', () => {
    const rule: ParameterTranslationRule = {
        sourceName: 'order_id',
        targetName: 'orderId',
        sourceType: 'string',
        targetType: 'string',
    };

    const errors = validateTranslationRule(rule);
    assert.equal(errors.length, 0);
});

test('validateTranslationRule should reject rule with empty source name', () => {
    const rule: ParameterTranslationRule = {
        sourceName: '',
        targetName: 'orderId',
        sourceType: 'string',
        targetType: 'string',
    };

    const errors = validateTranslationRule(rule);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.field === 'sourceName'));
});

test('validateTranslationRule should reject rule with empty target name', () => {
    const rule: ParameterTranslationRule = {
        sourceName: 'order_id',
        targetName: '',
        sourceType: 'string',
        targetType: 'string',
    };

    const errors = validateTranslationRule(rule);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.field === 'targetName'));
});

test('validateTranslationRule should reject rule without source type', () => {
    const rule: any = {
        sourceName: 'order_id',
        targetName: 'orderId',
        targetType: 'string',
    };

    const errors = validateTranslationRule(rule);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.field === 'sourceType'));
});

// ============================================================
// Type Coercion Tests
// ============================================================

test('generateTypeCoercion should create timestamp_ms coercion for TypeScript', () => {
    const context = createDefaultContext('typescript');
    const rule = createTranslationRule('created_at', 'timestamp_ms', context);

    const coercion = generateTypeCoercion(rule, context);

    assert.ok(coercion);
    assert.ok(coercion.expression.includes('1000'));
    assert.equal(coercion.canFail, false);
});

test('generateTypeCoercion should create timestamp_ns coercion for Python', () => {
    const context = createDefaultContext('python');
    const rule = createTranslationRule('timestamp', 'timestamp_ns', context);

    const coercion = generateTypeCoercion(rule, context);

    assert.ok(coercion);
    assert.ok(coercion.expression.includes('1000000'));
    assert.equal(coercion.canFail, false);
});

test('generateTypeCoercion should create integer coercion for TypeScript', () => {
    const context = createDefaultContext('typescript');
    const rule = createTranslationRule('count', 'int', context);

    const coercion = generateTypeCoercion(rule, context);

    assert.ok(coercion);
    assert.ok(coercion.expression.includes('parseInt'));
    assert.equal(coercion.canFail, true);
});

test('generateTypeCoercion should create float coercion for Python', () => {
    const context = createDefaultContext('python');
    const rule = createTranslationRule('price', 'float', context);

    const coercion = generateTypeCoercion(rule, context);

    assert.ok(coercion);
    assert.ok(coercion.expression.includes('float'));
    assert.equal(coercion.canFail, true);
});

test('generateTypeCoercion should return undefined for string types', () => {
    const context = createDefaultContext('typescript');
    const rule = createTranslationRule('name', 'string', context);

    const coercion = generateTypeCoercion(rule, context);

    assert.equal(coercion, undefined);
});

// ============================================================
// Translation Strategy Tests
// ============================================================

test('applyTranslationStrategy should create rules for all parameters', () => {
    const params = [
        { name: 'order_id', type: 'string' as const, required: true },
        { name: 'price', type: 'float' as const, required: true },
        { name: 'quantity', type: 'int' as const, required: false },
    ];

    const strategy: TranslationStrategy = {
        context: createDefaultContext('typescript'),
        rules: [],
    };

    const rules = applyTranslationStrategy(params, strategy);

    assert.equal(rules.length, 3);
    assert.equal(rules[0].sourceName, 'order_id');
    assert.equal(rules[0].targetName, 'orderId');
    assert.equal(rules[1].sourceName, 'price');
    assert.equal(rules[2].sourceName, 'quantity');
});

test('applyTranslationStrategy should use custom rules when provided', () => {
    const params = [
        { name: 'order_id', type: 'string' as const },
        { name: 'price', type: 'float' as const },
    ];

    const customRule: ParameterTranslationRule = {
        sourceName: 'order_id',
        targetName: 'customOrderId',
        sourceType: 'string',
        targetType: 'string',
        aliases: ['orderId', 'id'],
    };

    const strategy: TranslationStrategy = {
        context: createDefaultContext('typescript'),
        rules: [customRule],
    };

    const rules = applyTranslationStrategy(params, strategy);

    assert.equal(rules.length, 2);
    assert.equal(rules[0].targetName, 'customOrderId');
    assert.deepEqual(rules[0].aliases, ['orderId', 'id']);
    assert.equal(rules[1].targetName, 'price'); // Uses default rule
});

test('applyTranslationStrategy should preserve required flag', () => {
    const params = [
        { name: 'required_param', type: 'string' as const, required: true },
        { name: 'optional_param', type: 'string' as const, required: false },
    ];

    const strategy: TranslationStrategy = {
        context: createDefaultContext('typescript'),
        rules: [],
    };

    const rules = applyTranslationStrategy(params, strategy);

    assert.equal(rules[0].required, true);
    assert.equal(rules[1].required, false);
});

// ============================================================
// Cross-Environment Tests
// ============================================================

test('translation rules should work consistently across all environments', () => {
    const environments: TargetEnvironment[] = ['typescript', 'javascript', 'python', 'php'];
    const paramName = 'user_id';
    const paramType = 'string' as const;

    for (const env of environments) {
        const context = createDefaultContext(env);
        const rule = createTranslationRule(paramName, paramType, context);

        assert.ok(rule.sourceName);
        assert.ok(rule.targetName);
        assert.ok(rule.sourceType);
        assert.ok(rule.targetType);
        assert.equal(validateTranslationRule(rule).length, 0);
    }
});

test('timestamp types should have coercion in all environments', () => {
    const environments: TargetEnvironment[] = ['typescript', 'javascript', 'python', 'php'];
    const timestampTypes = ['timestamp_ms', 'timestamp_ns'] as const;

    for (const env of environments) {
        const context = createDefaultContext(env);

        for (const tsType of timestampTypes) {
            const rule = createTranslationRule('ts', tsType, context);
            const coercion = generateTypeCoercion(rule, context);

            assert.ok(coercion, `Missing coercion for ${tsType} in ${env}`);
            assert.ok(coercion.expression, `Missing expression for ${tsType} in ${env}`);
        }
    }
});

// ============================================================
// Code Generation Hook Tests
// ============================================================

test('CodeGenerationHook should have correct structure', () => {
    const hook: CodeGenerationHook = {
        name: 'validateOrderId',
        phase: 'before-validation',
        template: 'if (!value) throw new Error("Invalid order ID");',
        templateParams: ['value'],
        condition: 'value !== undefined',
    };

    assert.equal(hook.name, 'validateOrderId');
    assert.equal(hook.phase, 'before-validation');
    assert.ok(hook.template);
    assert.deepEqual(hook.templateParams, ['value']);
    assert.ok(hook.condition);
});

test('TranslationStrategy should support hooks', () => {
    const strategy: TranslationStrategy = {
        context: createDefaultContext('typescript'),
        rules: [],
        hooks: {
            validation: [
                {
                    name: 'checkPositive',
                    phase: 'after-validation',
                    template: 'if (value <= 0) throw new Error("Must be positive");',
                },
            ],
        },
    };

    assert.ok(strategy.hooks);
    assert.ok(strategy.hooks.validation);
    assert.equal(strategy.hooks.validation.length, 1);
    assert.equal(strategy.hooks.validation[0].name, 'checkPositive');
});
