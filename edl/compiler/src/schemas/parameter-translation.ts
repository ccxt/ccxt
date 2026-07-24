/**
 * Parameter Translation Schema
 *
 * This module provides schema definitions for parameter translation,
 * enabling code generation that maps EDL parameters to different target
 * environments (TypeScript, Python, PHP) with proper naming conventions,
 * type coercion, and aliasing support.
 */

import type { ParamType } from '../types/edl.js';

// ============================================================
// Target Environment Types
// ============================================================

/**
 * Target programming language for code generation
 */
export type TargetEnvironment = 'typescript' | 'python' | 'php' | 'javascript';

/**
 * Naming convention styles used in different languages
 */
export type NamingConvention =
    | 'camelCase'      // JavaScript/TypeScript: myVariable
    | 'snake_case'     // Python: my_variable
    | 'PascalCase'     // Classes: MyClass
    | 'kebab-case'     // URLs: my-variable
    | 'SCREAMING_SNAKE_CASE'; // Constants: MY_CONSTANT

// ============================================================
// Type Mapping
// ============================================================

/**
 * Maps EDL parameter types to target environment types
 */
export interface TypeMapping {
    /** Source EDL type */
    sourceType: ParamType;

    /** Target type in the destination environment */
    targetType: string;

    /** Whether the type is nullable in the target environment */
    nullable?: boolean;

    /** Optional type parameters (e.g., for generics) */
    typeParameters?: string[];
}

/**
 * Predefined type mappings for common target environments
 */
export const TYPE_MAPPINGS: Record<TargetEnvironment, TypeMapping[]> = {
    typescript: [
        { sourceType: 'string', targetType: 'string' },
        { sourceType: 'int', targetType: 'number' },
        { sourceType: 'integer', targetType: 'number' },
        { sourceType: 'float', targetType: 'number' },
        { sourceType: 'number', targetType: 'number' },
        { sourceType: 'bool', targetType: 'boolean' },
        { sourceType: 'boolean', targetType: 'boolean' },
        { sourceType: 'timestamp', targetType: 'number' },
        { sourceType: 'timestamp_ms', targetType: 'number' },
        { sourceType: 'timestamp_ns', targetType: 'number' },
        { sourceType: 'object', targetType: 'Record<string, any>' },
        { sourceType: 'array', targetType: 'any[]' },
    ],
    javascript: [
        { sourceType: 'string', targetType: 'string' },
        { sourceType: 'int', targetType: 'number' },
        { sourceType: 'integer', targetType: 'number' },
        { sourceType: 'float', targetType: 'number' },
        { sourceType: 'number', targetType: 'number' },
        { sourceType: 'bool', targetType: 'boolean' },
        { sourceType: 'boolean', targetType: 'boolean' },
        { sourceType: 'timestamp', targetType: 'number' },
        { sourceType: 'timestamp_ms', targetType: 'number' },
        { sourceType: 'timestamp_ns', targetType: 'number' },
        { sourceType: 'object', targetType: 'object' },
        { sourceType: 'array', targetType: 'Array' },
    ],
    python: [
        { sourceType: 'string', targetType: 'str' },
        { sourceType: 'int', targetType: 'int' },
        { sourceType: 'integer', targetType: 'int' },
        { sourceType: 'float', targetType: 'float' },
        { sourceType: 'number', targetType: 'float' },
        { sourceType: 'bool', targetType: 'bool' },
        { sourceType: 'boolean', targetType: 'bool' },
        { sourceType: 'timestamp', targetType: 'int' },
        { sourceType: 'timestamp_ms', targetType: 'int' },
        { sourceType: 'timestamp_ns', targetType: 'int' },
        { sourceType: 'object', targetType: 'dict' },
        { sourceType: 'array', targetType: 'list' },
    ],
    php: [
        { sourceType: 'string', targetType: 'string' },
        { sourceType: 'int', targetType: 'int' },
        { sourceType: 'integer', targetType: 'int' },
        { sourceType: 'float', targetType: 'float' },
        { sourceType: 'number', targetType: 'float' },
        { sourceType: 'bool', targetType: 'bool' },
        { sourceType: 'boolean', targetType: 'bool' },
        { sourceType: 'timestamp', targetType: 'int' },
        { sourceType: 'timestamp_ms', targetType: 'int' },
        { sourceType: 'timestamp_ns', targetType: 'int' },
        { sourceType: 'object', targetType: 'array' },
        { sourceType: 'array', targetType: 'array' },
    ],
};

// ============================================================
// Translation Context
// ============================================================

/**
 * Context for parameter translation operations
 * Provides environment-specific settings for code generation
 */
export interface TranslationContext {
    /** Target programming environment */
    environment: TargetEnvironment;

    /** Naming convention to use for parameter names */
    namingConvention: NamingConvention;

    /** Whether to generate type annotations */
    includeTypeAnnotations?: boolean;

    /** Whether to include validation code */
    includeValidation?: boolean;

    /** Custom type mappings (override defaults) */
    customTypeMappings?: TypeMapping[];

    /** Additional context data for custom transformations */
    metadata?: Record<string, any>;
}

// ============================================================
// Parameter Translation Rules
// ============================================================

/**
 * Defines how a parameter should be translated
 */
export interface ParameterTranslationRule {
    /** Source parameter name (in EDL) */
    sourceName: string;

    /** Target parameter name (in destination language) */
    targetName: string;

    /** Source parameter type */
    sourceType: ParamType;

    /** Target parameter type */
    targetType: string;

    /** Parameter aliases (alternate names) */
    aliases?: string[];

    /** Type coercion expression (optional code for conversion) */
    coercion?: TypeCoercion;

    /** Default value in target environment */
    defaultValue?: string;

    /** Whether parameter is required */
    required?: boolean;

    /** Custom transformation function name */
    customTransform?: string;

    /** Documentation/comment for the parameter */
    documentation?: string;
}

/**
 * Type coercion configuration
 */
export interface TypeCoercion {
    /** Expression to convert from source to target type */
    expression: string;

    /** Whether coercion can fail (requires error handling) */
    canFail?: boolean;

    /** Error message template if coercion fails */
    errorMessage?: string;

    /** Validation expression to check before coercion */
    validateBefore?: string;
}

// ============================================================
// Code Generation Hooks
// ============================================================

/**
 * Code generation hook for custom parameter handling
 */
export interface CodeGenerationHook {
    /** Hook name/identifier */
    name: string;

    /** When to execute the hook */
    phase: 'before-validation' | 'after-validation' | 'before-coercion' | 'after-coercion';

    /** Code template to inject */
    template: string;

    /** Parameters available to the template */
    templateParams?: string[];

    /** Conditions under which to apply the hook */
    condition?: string;
}

/**
 * Collection of code generation hooks for a translation
 */
export interface CodeGenerationHooks {
    /** Hooks for parameter validation */
    validation?: CodeGenerationHook[];

    /** Hooks for type coercion */
    coercion?: CodeGenerationHook[];

    /** Hooks for custom transformations */
    transforms?: CodeGenerationHook[];

    /** Hooks for error handling */
    errorHandling?: CodeGenerationHook[];
}

// ============================================================
// Translation Strategy
// ============================================================

/**
 * Complete translation strategy for a set of parameters
 */
export interface TranslationStrategy {
    /** Translation context */
    context: TranslationContext;

    /** Parameter translation rules */
    rules: ParameterTranslationRule[];

    /** Code generation hooks */
    hooks?: CodeGenerationHooks;

    /** Global transformations to apply */
    globalTransforms?: string[];
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get type mapping for a parameter type in a target environment
 *
 * @param sourceType - EDL parameter type
 * @param environment - Target environment
 * @param customMappings - Optional custom type mappings
 * @returns Type mapping or undefined if not found
 */
export function getTypeMapping(
    sourceType: ParamType,
    environment: TargetEnvironment,
    customMappings?: TypeMapping[]
): TypeMapping | undefined {
    // Check custom mappings first
    if (customMappings) {
        const customMapping = customMappings.find(m => m.sourceType === sourceType);
        if (customMapping) {
            return customMapping;
        }
    }

    // Fall back to default mappings
    const defaultMappings = TYPE_MAPPINGS[environment];
    return defaultMappings.find(m => m.sourceType === sourceType);
}

/**
 * Convert a name to a specific naming convention
 *
 * @param name - Source name
 * @param convention - Target naming convention
 * @returns Converted name
 *
 * @example
 * ```typescript
 * convertNamingConvention('myVariableName', 'snake_case') // 'my_variable_name'
 * convertNamingConvention('my_variable_name', 'camelCase') // 'myVariableName'
 * convertNamingConvention('MyClass', 'kebab-case') // 'my-class'
 * ```
 */
export function convertNamingConvention(name: string, convention: NamingConvention): string {
    // First, split the name into words
    const words = splitIntoWords(name);

    switch (convention) {
        case 'camelCase':
            return words
                .map((word, index) =>
                    index === 0
                        ? word.toLowerCase()
                        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join('');

        case 'PascalCase':
            return words
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');

        case 'snake_case':
            return words.map(word => word.toLowerCase()).join('_');

        case 'kebab-case':
            return words.map(word => word.toLowerCase()).join('-');

        case 'SCREAMING_SNAKE_CASE':
            return words.map(word => word.toUpperCase()).join('_');

        default:
            return name;
    }
}

/**
 * Split a name into individual words (helper for naming convention conversion)
 */
function splitIntoWords(name: string): string[] {
    // Handle snake_case, kebab-case, SCREAMING_SNAKE_CASE
    if (name.includes('_') || name.includes('-')) {
        return name.split(/[-_]+/);
    }

    // Handle camelCase and PascalCase
    const words: string[] = [];
    let currentWord = '';

    for (let i = 0; i < name.length; i++) {
        const char = name[i];
        const isUpperCase = char === char.toUpperCase() && char !== char.toLowerCase();

        if (isUpperCase && currentWord.length > 0) {
            words.push(currentWord);
            currentWord = char;
        } else {
            currentWord += char;
        }
    }

    if (currentWord.length > 0) {
        words.push(currentWord);
    }

    return words;
}

/**
 * Create a translation rule for a parameter
 *
 * @param sourceName - Source parameter name
 * @param sourceType - Source parameter type
 * @param context - Translation context
 * @param options - Additional options for the rule
 * @returns Parameter translation rule
 */
export function createTranslationRule(
    sourceName: string,
    sourceType: ParamType,
    context: TranslationContext,
    options?: {
        aliases?: string[];
        required?: boolean;
        defaultValue?: string;
        customTransform?: string;
        documentation?: string;
    }
): ParameterTranslationRule {
    const targetName = convertNamingConvention(sourceName, context.namingConvention);
    const typeMapping = getTypeMapping(sourceType, context.environment, context.customTypeMappings);

    if (!typeMapping) {
        throw new Error(`No type mapping found for ${sourceType} in ${context.environment}`);
    }

    return {
        sourceName,
        targetName,
        sourceType,
        targetType: typeMapping.targetType,
        aliases: options?.aliases,
        required: options?.required,
        defaultValue: options?.defaultValue,
        customTransform: options?.customTransform,
        documentation: options?.documentation,
    };
}

/**
 * Generate type coercion code for a parameter
 *
 * @param rule - Parameter translation rule
 * @param context - Translation context
 * @returns Type coercion configuration or undefined if no coercion needed
 */
export function generateTypeCoercion(
    rule: ParameterTranslationRule,
    context: TranslationContext
): TypeCoercion | undefined {
    const { sourceType, targetType } = rule;

    // Timestamp conversions
    if (sourceType === 'timestamp' || sourceType === 'timestamp_ms' || sourceType === 'timestamp_ns') {
        switch (context.environment) {
            case 'typescript':
            case 'javascript':
                if (sourceType === 'timestamp_ms') {
                    return {
                        expression: `Math.floor(${rule.targetName} * 1000)`,
                        canFail: false,
                    };
                } else if (sourceType === 'timestamp_ns') {
                    return {
                        expression: `Math.floor(${rule.targetName} * 1000000)`,
                        canFail: false,
                    };
                }
                break;

            case 'python':
                if (sourceType === 'timestamp_ms') {
                    return {
                        expression: `int(${rule.targetName} * 1000)`,
                        canFail: false,
                    };
                } else if (sourceType === 'timestamp_ns') {
                    return {
                        expression: `int(${rule.targetName} * 1000000)`,
                        canFail: false,
                    };
                }
                break;

            case 'php':
                if (sourceType === 'timestamp_ms') {
                    return {
                        expression: `(int)floor($${rule.targetName} * 1000)`,
                        canFail: false,
                    };
                } else if (sourceType === 'timestamp_ns') {
                    return {
                        expression: `(int)floor($${rule.targetName} * 1000000)`,
                        canFail: false,
                    };
                }
                break;
        }
    }

    // String to number conversions
    if ((sourceType === 'int' || sourceType === 'integer' || sourceType === 'float' || sourceType === 'number')
        && targetType.includes('int') || targetType.includes('float') || targetType.includes('number')) {
        switch (context.environment) {
            case 'typescript':
            case 'javascript':
                return {
                    expression: sourceType === 'int' || sourceType === 'integer'
                        ? `parseInt(${rule.targetName}, 10)`
                        : `parseFloat(${rule.targetName})`,
                    canFail: true,
                    errorMessage: `Invalid ${sourceType} value for ${rule.sourceName}`,
                    validateBefore: `typeof ${rule.targetName} === 'string'`,
                };

            case 'python':
                return {
                    expression: sourceType === 'int' || sourceType === 'integer'
                        ? `int(${rule.targetName})`
                        : `float(${rule.targetName})`,
                    canFail: true,
                    errorMessage: `Invalid ${sourceType} value for ${rule.sourceName}`,
                };

            case 'php':
                return {
                    expression: sourceType === 'int' || sourceType === 'integer'
                        ? `(int)$${rule.targetName}`
                        : `(float)$${rule.targetName}`,
                    canFail: false,
                };
        }
    }

    return undefined;
}

/**
 * Validate a translation rule
 *
 * @param rule - Translation rule to validate
 * @returns Validation errors, or empty array if valid
 */
export function validateTranslationRule(rule: ParameterTranslationRule): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!rule.sourceName || rule.sourceName.trim().length === 0) {
        errors.push({
            field: 'sourceName',
            message: 'Source name is required and cannot be empty',
        });
    }

    if (!rule.targetName || rule.targetName.trim().length === 0) {
        errors.push({
            field: 'targetName',
            message: 'Target name is required and cannot be empty',
        });
    }

    if (!rule.sourceType) {
        errors.push({
            field: 'sourceType',
            message: 'Source type is required',
        });
    }

    if (!rule.targetType || rule.targetType.trim().length === 0) {
        errors.push({
            field: 'targetType',
            message: 'Target type is required and cannot be empty',
        });
    }

    return errors;
}

/**
 * Validation error type
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Create a default translation context
 *
 * @param environment - Target environment
 * @returns Default translation context
 */
export function createDefaultContext(environment: TargetEnvironment): TranslationContext {
    const namingConventions: Record<TargetEnvironment, NamingConvention> = {
        typescript: 'camelCase',
        javascript: 'camelCase',
        python: 'snake_case',
        php: 'camelCase',
    };

    return {
        environment,
        namingConvention: namingConventions[environment],
        includeTypeAnnotations: environment === 'typescript' || environment === 'python',
        includeValidation: true,
    };
}

/**
 * Apply a translation strategy to a set of parameters
 *
 * @param params - Source parameter names and types
 * @param strategy - Translation strategy
 * @returns Array of translation rules
 */
export function applyTranslationStrategy(
    params: Array<{ name: string; type: ParamType; required?: boolean }>,
    strategy: TranslationStrategy
): ParameterTranslationRule[] {
    const rules: ParameterTranslationRule[] = [];

    for (const param of params) {
        // Check if there's a custom rule for this parameter
        const customRule = strategy.rules.find(r => r.sourceName === param.name);

        if (customRule) {
            rules.push(customRule);
        } else {
            // Generate a default rule
            const rule = createTranslationRule(
                param.name,
                param.type,
                strategy.context,
                { required: param.required }
            );
            rules.push(rule);
        }
    }

    return rules;
}
