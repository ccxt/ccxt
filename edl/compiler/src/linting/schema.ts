/**
 * DSL Schema and Error Models for Linting
 * Phase 3-11.1: Define data models and schemas for DSL parsers
 */

import { SourceLocation, ParamDefinition } from '../types/edl.js';

// ============================================================
// DSL Element Types
// ============================================================

export type DSLElementType =
    | 'placeholder'
    | 'transform'
    | 'path'
    | 'expression'
    | 'literal'
    | 'reference';

export interface DSLElement {
    type: DSLElementType;
    value: string;
    location: SourceLocation;
    metadata?: Record<string, any>;
}

// ============================================================
// Placeholder and Transform Definitions
// ============================================================

export interface PlaceholderDefinition {
    name: string;
    type: string; // expected type
    required?: boolean;
    description?: string;
    validValues?: string[];
}

export interface TransformDefinition {
    name: string;
    inputType: string;
    outputType: string;
    parameters?: ParamDefinition[];
    description?: string;
}

// ============================================================
// Lint Error Types
// ============================================================

export type LintErrorType =
    | 'undefined_placeholder'
    | 'unsupported_transform'
    | 'invalid_path'
    | 'type_mismatch'
    | 'missing_required'
    | 'invalid_expression'
    | 'syntax_error';

export interface LintError {
    type: LintErrorType;
    message: string;
    location: SourceLocation;
    severity: 'error' | 'warning' | 'info';
    code: string; // error code like 'E001'
    suggestion?: string; // fix suggestion
}

// ============================================================
// Lint Context and Rules
// ============================================================

export interface LintContext {
    placeholders: Record<string, PlaceholderDefinition>;
    transforms: Record<string, TransformDefinition>;
    variables: Record<string, any>;
    file?: string;
}

export interface LintRule {
    id: string;
    name: string;
    description: string;
    severity: 'error' | 'warning' | 'info';
    check(element: DSLElement, context: LintContext): LintError[];
}

export interface LintResult {
    errors: LintError[];
    warnings: LintError[];
    info: LintError[];
    valid: boolean;
}

// ============================================================
// Built-in Lint Rules
// ============================================================

/**
 * Rule: Detect undefined placeholders
 */
export const undefinedPlaceholderRule: LintRule = {
    id: 'undefined-placeholder',
    name: 'Undefined Placeholder',
    description: 'Detects placeholders that are not defined in the context',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        if (element.type !== 'placeholder') {
            return [];
        }

        const placeholderName = element.value;
        if (!context.placeholders[placeholderName]) {
            return [{
                type: 'undefined_placeholder',
                message: `Placeholder '${placeholderName}' is not defined`,
                location: element.location,
                severity: 'error',
                code: 'E001',
                suggestion: `Define '${placeholderName}' in the context or check for typos. Available placeholders: ${Object.keys(context.placeholders).join(', ')}`,
            }];
        }

        return [];
    },
};

/**
 * Rule: Detect unsupported transforms
 */
export const unsupportedTransformRule: LintRule = {
    id: 'unsupported-transform',
    name: 'Unsupported Transform',
    description: 'Detects transforms that are not supported',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        if (element.type !== 'transform') {
            return [];
        }

        const transformName = element.value;
        if (!context.transforms[transformName]) {
            return [{
                type: 'unsupported_transform',
                message: `Transform '${transformName}' is not supported`,
                location: element.location,
                severity: 'error',
                code: 'E002',
                suggestion: `Use a supported transform. Available transforms: ${Object.keys(context.transforms).join(', ')}`,
            }];
        }

        return [];
    },
};

/**
 * Rule: Detect type mismatches
 */
export const typeMismatchRule: LintRule = {
    id: 'type-mismatch',
    name: 'Type Mismatch',
    description: 'Detects type mismatches between expected and actual types',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        // Check transform type compatibility
        if (element.type === 'transform' && element.metadata?.inputType && element.metadata?.expectedType) {
            const { inputType, expectedType } = element.metadata;

            if (inputType !== expectedType && !isTypeCompatible(inputType, expectedType)) {
                return [{
                    type: 'type_mismatch',
                    message: `Type mismatch: expected '${expectedType}' but got '${inputType}'`,
                    location: element.location,
                    severity: 'error',
                    code: 'E003',
                    suggestion: `Convert '${inputType}' to '${expectedType}' or use a compatible type`,
                }];
            }
        }

        // Check placeholder type
        if (element.type === 'placeholder' && element.metadata?.actualType) {
            const placeholderName = element.value;
            const placeholder = context.placeholders[placeholderName];

            if (placeholder && element.metadata.actualType !== placeholder.type) {
                return [{
                    type: 'type_mismatch',
                    message: `Placeholder '${placeholderName}' expects type '${placeholder.type}' but got '${element.metadata.actualType}'`,
                    location: element.location,
                    severity: 'error',
                    code: 'E003',
                    suggestion: `Ensure '${placeholderName}' receives a value of type '${placeholder.type}'`,
                }];
            }
        }

        return [];
    },
};

/**
 * Rule: Detect invalid paths
 */
export const invalidPathRule: LintRule = {
    id: 'invalid-path',
    name: 'Invalid Path',
    description: 'Detects invalid path expressions',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        if (element.type !== 'path') {
            return [];
        }

        const path = element.value;
        const errors: LintError[] = [];

        // Check for empty path
        if (!path || path.trim() === '') {
            errors.push({
                type: 'invalid_path',
                message: 'Path cannot be empty',
                location: element.location,
                severity: 'error',
                code: 'E004',
                suggestion: 'Provide a valid path expression',
            });
        }

        // Check for invalid path syntax (e.g., consecutive dots, starting/ending with dot)
        if (path.includes('..') || path.startsWith('.') || path.endsWith('.')) {
            errors.push({
                type: 'invalid_path',
                message: `Invalid path syntax: '${path}'`,
                location: element.location,
                severity: 'error',
                code: 'E004',
                suggestion: 'Use valid path syntax (e.g., "field.subfield" or "field[0].subfield")',
            });
        }

        // Check for unmatched brackets
        const openBrackets = (path.match(/\[/g) || []).length;
        const closeBrackets = (path.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
            errors.push({
                type: 'invalid_path',
                message: `Unmatched brackets in path: '${path}'`,
                location: element.location,
                severity: 'error',
                code: 'E004',
                suggestion: 'Ensure all brackets are properly matched',
            });
        }

        return errors;
    },
};

/**
 * Rule: Detect missing required placeholders
 */
export const missingRequiredRule: LintRule = {
    id: 'missing-required',
    name: 'Missing Required',
    description: 'Detects missing required placeholders or fields',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        // This rule is typically checked at a higher level (template/document level)
        // For individual elements, we can check if a placeholder is marked as required
        if (element.type === 'placeholder') {
            const placeholderName = element.value;
            const placeholder = context.placeholders[placeholderName];

            if (placeholder?.required && element.metadata?.isEmpty) {
                return [{
                    type: 'missing_required',
                    message: `Required placeholder '${placeholderName}' is empty`,
                    location: element.location,
                    severity: 'error',
                    code: 'E005',
                    suggestion: `Provide a value for required placeholder '${placeholderName}'`,
                }];
            }
        }

        return [];
    },
};

/**
 * Rule: Detect invalid expressions
 */
export const invalidExpressionRule: LintRule = {
    id: 'invalid-expression',
    name: 'Invalid Expression',
    description: 'Detects invalid expression syntax',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        if (element.type !== 'expression') {
            return [];
        }

        const expression = element.value;
        const errors: LintError[] = [];

        // Check for empty expression
        if (!expression || expression.trim() === '') {
            errors.push({
                type: 'invalid_expression',
                message: 'Expression cannot be empty',
                location: element.location,
                severity: 'error',
                code: 'E006',
                suggestion: 'Provide a valid expression',
            });
            return errors;
        }

        // Check for unmatched parentheses
        const openParens = (expression.match(/\(/g) || []).length;
        const closeParens = (expression.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            errors.push({
                type: 'invalid_expression',
                message: `Unmatched parentheses in expression: '${expression}'`,
                location: element.location,
                severity: 'error',
                code: 'E006',
                suggestion: 'Ensure all parentheses are properly matched',
            });
        }

        // Check for invalid operators (basic check)
        if (/[^\w\s\+\-\*\/\(\)\[\]\.\,\'\"\=\<\>\!\&\|\?]/.test(expression)) {
            errors.push({
                type: 'invalid_expression',
                message: `Expression contains invalid characters: '${expression}'`,
                location: element.location,
                severity: 'warning',
                code: 'W001',
                suggestion: 'Ensure expression uses valid operators and syntax',
            });
        }

        return errors;
    },
};

/**
 * Rule: Detect syntax errors
 */
export const syntaxErrorRule: LintRule = {
    id: 'syntax-error',
    name: 'Syntax Error',
    description: 'Detects general syntax errors',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        const errors: LintError[] = [];

        // Check for null or undefined value
        if (element.value === null || element.value === undefined) {
            errors.push({
                type: 'syntax_error',
                message: `Element has null or undefined value`,
                location: element.location,
                severity: 'error',
                code: 'E007',
                suggestion: 'Provide a valid value for this element',
            });
        }

        // Check metadata for syntax issues
        if (element.metadata?.syntaxError) {
            errors.push({
                type: 'syntax_error',
                message: element.metadata.syntaxError,
                location: element.location,
                severity: 'error',
                code: 'E007',
                suggestion: element.metadata.suggestion || 'Fix the syntax error',
            });
        }

        return errors;
    },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if two types are compatible
 */
function isTypeCompatible(sourceType: string, targetType: string): boolean {
    // Define type compatibility rules
    const compatibilityMap: Record<string, string[]> = {
        'string': ['string'],
        'number': ['number', 'int', 'integer', 'float'],
        'int': ['number', 'int', 'integer'],
        'integer': ['number', 'int', 'integer'],
        'float': ['number', 'float'],
        'boolean': ['boolean', 'bool'],
        'bool': ['boolean', 'bool'],
        'timestamp': ['timestamp', 'timestamp_ms', 'timestamp_ns', 'number'],
        'timestamp_ms': ['timestamp', 'timestamp_ms', 'number'],
        'timestamp_ns': ['timestamp', 'timestamp_ns', 'number'],
        'object': ['object'],
        'array': ['array'],
        'any': ['string', 'number', 'boolean', 'object', 'array', 'null', 'undefined'],
    };

    const compatibleTypes = compatibilityMap[sourceType] || [sourceType];
    return compatibleTypes.includes(targetType);
}

/**
 * Get all built-in lint rules
 */
export function getBuiltInRules(): LintRule[] {
    return [
        undefinedPlaceholderRule,
        unsupportedTransformRule,
        typeMismatchRule,
        invalidPathRule,
        missingRequiredRule,
        invalidExpressionRule,
        syntaxErrorRule,
    ];
}

/**
 * Create a lint result from errors
 */
export function createLintResult(allErrors: LintError[]): LintResult {
    const errors = allErrors.filter(e => e.severity === 'error');
    const warnings = allErrors.filter(e => e.severity === 'warning');
    const info = allErrors.filter(e => e.severity === 'info');

    return {
        errors,
        warnings,
        info,
        valid: errors.length === 0,
    };
}

/**
 * Run lint rules on a DSL element
 */
export function lintElement(
    element: DSLElement,
    context: LintContext,
    rules: LintRule[] = getBuiltInRules()
): LintResult {
    const allErrors: LintError[] = [];

    for (const rule of rules) {
        const ruleErrors = rule.check(element, context);
        allErrors.push(...ruleErrors);
    }

    return createLintResult(allErrors);
}

/**
 * Run lint rules on multiple DSL elements
 */
export function lintElements(
    elements: DSLElement[],
    context: LintContext,
    rules: LintRule[] = getBuiltInRules()
): LintResult {
    const allErrors: LintError[] = [];

    for (const element of elements) {
        const result = lintElement(element, context, rules);
        allErrors.push(...result.errors, ...result.warnings, ...result.info);
    }

    return createLintResult(allErrors);
}
