/**
 * Linting Rules for EDL Compiler
 * Phase 3-11.2: Specific lint rules for detecting parser errors
 */

import {
    DSLElement,
    LintContext,
    LintError,
    LintRule,
} from './schema.js';

// ============================================================
// Rule: Detect Undefined Placeholders
// ============================================================

/**
 * UndefinedPlaceholderRule: Detect undefined placeholders like {symbol}, {timestamp}
 *
 * Checks if placeholders used in templates are defined in the context.
 * This prevents runtime errors from missing placeholder values.
 */
export const UndefinedPlaceholderRule: LintRule = {
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
            const availablePlaceholders = Object.keys(context.placeholders);
            const suggestion = availablePlaceholders.length > 0
                ? `Define '${placeholderName}' in the context or check for typos. Available placeholders: ${availablePlaceholders.join(', ')}`
                : `Define '${placeholderName}' in the context. No placeholders are currently defined.`;

            return [{
                type: 'undefined_placeholder',
                message: `Placeholder '${placeholderName}' is not defined`,
                location: element.location,
                severity: 'error',
                code: 'E001',
                suggestion,
            }];
        }

        return [];
    },
};

// ============================================================
// Rule: Detect Unsupported Transforms
// ============================================================

/**
 * UnsupportedTransformRule: Detect unsupported transform operations
 *
 * Validates that transform functions used in mappings are supported.
 * Examples: parseNumber, parseTimestamp, safeString, etc.
 */
export const UnsupportedTransformRule: LintRule = {
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
            const availableTransforms = Object.keys(context.transforms);
            const suggestion = availableTransforms.length > 0
                ? `Use a supported transform. Available transforms: ${availableTransforms.join(', ')}`
                : `Transform '${transformName}' is not defined. Define it in the context.`;

            return [{
                type: 'unsupported_transform',
                message: `Transform '${transformName}' is not supported`,
                location: element.location,
                severity: 'error',
                code: 'E002',
                suggestion,
            }];
        }

        return [];
    },
};

// ============================================================
// Rule: Detect Invalid References
// ============================================================

/**
 * InvalidReferenceRule: Detect invalid fragment/schema references
 *
 * Ensures that references to fragments, schemas, or other definitions exist.
 * This includes parser references, fragment includes, and schema imports.
 */
export const InvalidReferenceRule: LintRule = {
    id: 'invalid-reference',
    name: 'Invalid Reference',
    description: 'Detects invalid fragment, schema, or parser references',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        if (element.type !== 'reference') {
            return [];
        }

        const referenceName = element.value;
        const errors: LintError[] = [];

        // Check if reference is in variables (could be fragment, parser, etc.)
        const referenceExists = context.variables[referenceName] !== undefined;

        if (!referenceExists) {
            const availableRefs = Object.keys(context.variables);
            const suggestion = availableRefs.length > 0
                ? `Reference '${referenceName}' not found. Available references: ${availableRefs.join(', ')}`
                : `Reference '${referenceName}' not found. No references are defined in the current context.`;

            errors.push({
                type: 'invalid_path',
                message: `Invalid reference: '${referenceName}' does not exist`,
                location: element.location,
                severity: 'error',
                code: 'E008',
                suggestion,
            });
        }

        // Check for circular references if metadata provided
        if (element.metadata?.circularReference) {
            errors.push({
                type: 'syntax_error',
                message: `Circular reference detected: '${referenceName}'`,
                location: element.location,
                severity: 'error',
                code: 'E009',
                suggestion: 'Remove circular dependency between definitions',
            });
        }

        return errors;
    },
};

// ============================================================
// Rule: Detect Missing Required Fields
// ============================================================

/**
 * MissingRequiredFieldRule: Detect missing required fields in definitions
 *
 * Validates that all required fields are present in EDL definitions.
 * This includes required endpoint parameters, parser fields, etc.
 */
export const MissingRequiredFieldRule: LintRule = {
    id: 'missing-required-field',
    name: 'Missing Required Field',
    description: 'Detects missing required fields in definitions',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        const errors: LintError[] = [];

        // Check placeholder required fields
        if (element.type === 'placeholder') {
            const placeholderName = element.value;
            const placeholder = context.placeholders[placeholderName];

            if (placeholder?.required && element.metadata?.isEmpty) {
                errors.push({
                    type: 'missing_required',
                    message: `Required placeholder '${placeholderName}' is empty`,
                    location: element.location,
                    severity: 'error',
                    code: 'E005',
                    suggestion: `Provide a value for required placeholder '${placeholderName}'`,
                });
            }

            // Check for required fields in placeholder definition
            if (placeholder?.required && !element.metadata?.hasValue) {
                errors.push({
                    type: 'missing_required',
                    message: `Required placeholder '${placeholderName}' must have a value`,
                    location: element.location,
                    severity: 'error',
                    code: 'E005',
                    suggestion: `Ensure '${placeholderName}' is provided before using this definition`,
                });
            }
        }

        // Check for missing required fields in general elements
        if (element.metadata?.requiredFields) {
            const requiredFields = element.metadata.requiredFields as string[];
            const providedFields = element.metadata.providedFields as string[] || [];

            const missingFields = requiredFields.filter(field => !providedFields.includes(field));

            if (missingFields.length > 0) {
                errors.push({
                    type: 'missing_required',
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    location: element.location,
                    severity: 'error',
                    code: 'E010',
                    suggestion: `Add the following required fields: ${missingFields.join(', ')}`,
                });
            }
        }

        return errors;
    },
};

// ============================================================
// Rule: Detect Type Mismatches
// ============================================================

/**
 * TypeMismatchRule: Detect type mismatches in expressions
 *
 * Ensures type compatibility between:
 * - Transform input/output types
 * - Placeholder expected vs actual types
 * - Expression operand types
 */
export const TypeMismatchRule: LintRule = {
    id: 'type-mismatch',
    name: 'Type Mismatch',
    description: 'Detects type mismatches between expected and actual types',
    severity: 'error',
    check(element: DSLElement, context: LintContext): LintError[] {
        const errors: LintError[] = [];

        // Check transform type compatibility
        if (element.type === 'transform' && element.metadata?.inputType && element.metadata?.expectedType) {
            const { inputType, expectedType } = element.metadata;

            if (inputType !== expectedType && !isTypeCompatible(inputType, expectedType)) {
                errors.push({
                    type: 'type_mismatch',
                    message: `Type mismatch: expected '${expectedType}' but got '${inputType}'`,
                    location: element.location,
                    severity: 'error',
                    code: 'E003',
                    suggestion: `Convert '${inputType}' to '${expectedType}' or use a compatible type`,
                });
            }
        }

        // Check placeholder type
        if (element.type === 'placeholder' && element.metadata?.actualType) {
            const placeholderName = element.value;
            const placeholder = context.placeholders[placeholderName];

            if (placeholder && element.metadata.actualType !== placeholder.type) {
                if (!isTypeCompatible(element.metadata.actualType, placeholder.type)) {
                    errors.push({
                        type: 'type_mismatch',
                        message: `Placeholder '${placeholderName}' expects type '${placeholder.type}' but got '${element.metadata.actualType}'`,
                        location: element.location,
                        severity: 'error',
                        code: 'E003',
                        suggestion: `Ensure '${placeholderName}' receives a value of type '${placeholder.type}'`,
                    });
                }
            }
        }

        // Check expression operand types
        if (element.type === 'expression' && element.metadata?.operandTypes) {
            const operandTypes = element.metadata.operandTypes as string[];
            const hasIncompatibleTypes = operandTypes.some((type1, i) =>
                operandTypes.slice(i + 1).some(type2 => !isTypeCompatible(type1, type2))
            );

            if (hasIncompatibleTypes) {
                errors.push({
                    type: 'type_mismatch',
                    message: `Expression contains incompatible types: ${operandTypes.join(', ')}`,
                    location: element.location,
                    severity: 'warning',
                    code: 'W002',
                    suggestion: 'Ensure all operands in the expression have compatible types',
                });
            }
        }

        return errors;
    },
};

// ============================================================
// Rule: Detect Invalid Paths
// ============================================================

/**
 * InvalidPathRule: Detect invalid path expressions
 *
 * Validates path syntax used in field mappings and data access.
 * Examples: data.field.subfield, data[0].value, etc.
 */
export const InvalidPathRule: LintRule = {
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
            return errors;
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

        // Check for invalid bracket content (must be number or string)
        const bracketContent = path.match(/\[([^\]]+)\]/g);
        if (bracketContent) {
            for (const bracket of bracketContent) {
                const content = bracket.slice(1, -1);
                // Should be a number or a quoted string
                if (!/^\d+$/.test(content) && !/^['"][^'"]*['"]$/.test(content)) {
                    errors.push({
                        type: 'invalid_path',
                        message: `Invalid bracket content in path: '${bracket}'`,
                        location: element.location,
                        severity: 'warning',
                        code: 'W003',
                        suggestion: 'Bracket content should be a number or quoted string',
                    });
                }
            }
        }

        return errors;
    },
};

// ============================================================
// Rule: Detect Invalid Expressions
// ============================================================

/**
 * InvalidExpressionRule: Detect invalid expression syntax
 *
 * Validates expression syntax including:
 * - Balanced parentheses/brackets
 * - Valid operators
 * - Proper structure
 */
export const InvalidExpressionRule: LintRule = {
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

        // Check for unmatched brackets
        const openBrackets = (expression.match(/\[/g) || []).length;
        const closeBrackets = (expression.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
            errors.push({
                type: 'invalid_expression',
                message: `Unmatched brackets in expression: '${expression}'`,
                location: element.location,
                severity: 'error',
                code: 'E006',
                suggestion: 'Ensure all brackets are properly matched',
            });
        }

        // Check for invalid operators (basic check)
        if (/[^\w\s\+\-\*\/\(\)\[\]\.\,\'\"\=\<\>\!\&\|\?\:\%]/.test(expression)) {
            errors.push({
                type: 'invalid_expression',
                message: `Expression contains invalid characters: '${expression}'`,
                location: element.location,
                severity: 'warning',
                code: 'W001',
                suggestion: 'Ensure expression uses valid operators and syntax',
            });
        }

        // Check for double operators (e.g., ++, --, **)
        if (/[\+\-\*\/\%]{2,}/.test(expression.replace(/\+\+|--/g, ''))) {
            errors.push({
                type: 'invalid_expression',
                message: `Expression contains consecutive operators: '${expression}'`,
                location: element.location,
                severity: 'warning',
                code: 'W004',
                suggestion: 'Remove consecutive operators',
            });
        }

        return errors;
    },
};

// ============================================================
// Rule: Detect Syntax Errors
// ============================================================

/**
 * SyntaxErrorRule: Detect general syntax errors
 *
 * Catches general syntax issues including:
 * - Null/undefined values
 * - Parser-reported syntax errors
 * - Invalid token sequences
 */
export const SyntaxErrorRule: LintRule = {
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

        // Check for invalid escape sequences in string literals
        if (element.type === 'literal' && typeof element.value === 'string') {
            // Check for unescaped quotes
            const hasUnescapedQuotes = /(?<!\\)(?:\\\\)*"/.test(element.value.replace(/^"|"$/g, ''));
            if (hasUnescapedQuotes) {
                errors.push({
                    type: 'syntax_error',
                    message: 'String literal contains unescaped quotes',
                    location: element.location,
                    severity: 'warning',
                    code: 'W005',
                    suggestion: 'Escape quotes with backslash (\\") in string literals',
                });
            }
        }

        return errors;
    },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if two types are compatible
 *
 * Type compatibility rules:
 * - Exact matches are always compatible
 * - Number types (int, float, integer, number) are compatible with each other
 * - Boolean and bool are compatible
 * - Timestamp variants are compatible with each other and numbers
 * - 'any' type is compatible with all types
 */
function isTypeCompatible(sourceType: string, targetType: string): boolean {
    // Exact match
    if (sourceType === targetType) {
        return true;
    }

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

// ============================================================
// Rule Collections
// ============================================================

/**
 * Get all built-in lint rules
 */
export function getAllRules(): LintRule[] {
    return [
        UndefinedPlaceholderRule,
        UnsupportedTransformRule,
        InvalidReferenceRule,
        MissingRequiredFieldRule,
        TypeMismatchRule,
        InvalidPathRule,
        InvalidExpressionRule,
        SyntaxErrorRule,
    ];
}

/**
 * Get critical rules (errors only)
 */
export function getCriticalRules(): LintRule[] {
    return getAllRules().filter(rule => rule.severity === 'error');
}

/**
 * Get rules by ID
 */
export function getRuleById(id: string): LintRule | undefined {
    return getAllRules().find(rule => rule.id === id);
}

/**
 * Get rules by type
 */
export function getRulesByType(types: string[]): LintRule[] {
    const typeSet = new Set(types);
    return getAllRules().filter(rule => typeSet.has(rule.id));
}
