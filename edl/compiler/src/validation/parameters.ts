/**
 * Parameter validation and dependency resolution
 */

import { ParamDefinition, ValidationError } from '../types/edl.js';

/**
 * Validates parameter dependencies and returns validation errors
 * @param params - The actual parameter values provided
 * @param definitions - Parameter definitions from the schema
 * @returns Array of validation errors
 */
export function validateParameterDependencies(
    params: Record<string, any>,
    definitions: Record<string, ParamDefinition>
): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [paramName, definition] of Object.entries(definitions)) {
        const value = params[paramName];

        // Check if parameter is provided
        const isProvided = value !== undefined && value !== null;

        // Check unconditional required parameters
        if (definition.required && !isProvided) {
            errors.push({
                path: paramName,
                message: `Parameter '${paramName}' is required`,
                severity: 'error'
            });
            continue;
        }

        // Check conditional required parameters
        if (definition.required_if && !isProvided) {
            const shouldBeRequired = checkConditionalRequired(
                paramName,
                value,
                definition,
                params
            );
            if (shouldBeRequired) {
                errors.push({
                    path: paramName,
                    message: `Parameter '${paramName}' is required when: ${definition.required_if}`,
                    severity: 'error'
                });
                continue;
            }
        }

        // Check dependencies
        if (definition.dependencies && isProvided) {
            for (const depName of definition.dependencies) {
                const depValue = params[depName];
                const isDepProvided = depValue !== undefined && depValue !== null;

                if (!isDepProvided) {
                    errors.push({
                        path: paramName,
                        message: `Parameter '${paramName}' depends on '${depName}' which is not provided`,
                        severity: 'error'
                    });
                }
            }
        }

        // Validate the parameter value if provided
        if (isProvided) {
            const validationError = validateParameterValue(value, definition);
            if (validationError) {
                errors.push({
                    ...validationError,
                    path: paramName
                });
            }
        }
    }

    return errors;
}

/**
 * Resolves parameter dependency order using topological sort
 * @param definitions - Parameter definitions
 * @returns Array of parameter names in dependency order
 */
export function resolveParameterDependencyOrder(
    definitions: Record<string, ParamDefinition>
): string[] {
    const paramNames = Object.keys(definitions);
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    // Topological sort using DFS
    function visit(paramName: string): void {
        if (visited.has(paramName)) {
            return;
        }

        if (visiting.has(paramName)) {
            // Circular dependency detected - just skip it for now
            // In a real implementation, you might want to throw an error
            return;
        }

        visiting.add(paramName);

        const definition = definitions[paramName];
        if (definition.dependencies) {
            for (const depName of definition.dependencies) {
                if (definitions[depName]) {
                    visit(depName);
                }
            }
        }

        visiting.delete(paramName);
        visited.add(paramName);
        result.push(paramName);
    }

    for (const paramName of paramNames) {
        visit(paramName);
    }

    return result;
}

/**
 * Checks if a parameter is conditionally required
 * @param paramName - The parameter name
 * @param value - The parameter value
 * @param definition - The parameter definition
 * @param allParams - All parameters provided
 * @returns true if the parameter should be required
 */
export function checkConditionalRequired(
    paramName: string,
    value: any,
    definition: ParamDefinition,
    allParams: Record<string, any>
): boolean {
    if (!definition.required_if) {
        return false;
    }

    try {
        return evaluateExpression(definition.required_if, allParams);
    } catch (error) {
        // If expression evaluation fails, assume not required
        return false;
    }
}

/**
 * Validates a parameter value against its definition
 * @param value - The parameter value
 * @param definition - The parameter definition
 * @returns Validation error or null if valid
 */
export function validateParameterValue(
    value: any,
    definition: ParamDefinition
): ValidationError | null {
    // Type validation
    if (!isValidType(value, definition.type)) {
        return {
            path: '',
            message: `Expected type '${definition.type}' but got '${typeof value}'`,
            severity: 'error'
        };
    }

    // Enum validation
    if (definition.enum && definition.enum.length > 0) {
        if (!definition.enum.includes(value)) {
            return {
                path: '',
                message: `Value must be one of: ${definition.enum.join(', ')}`,
                severity: 'error'
            };
        }
    }

    // Numeric range validation
    if (isNumericType(definition.type)) {
        const numValue = typeof value === 'number' ? value : parseFloat(value);

        if (definition.min !== undefined && numValue < definition.min) {
            return {
                path: '',
                message: `Value ${numValue} is less than minimum ${definition.min}`,
                severity: 'error'
            };
        }

        if (definition.max !== undefined && numValue > definition.max) {
            return {
                path: '',
                message: `Value ${numValue} is greater than maximum ${definition.max}`,
                severity: 'error'
            };
        }
    }

    // String validation
    if (definition.type === 'string' && typeof value === 'string') {
        if (definition.minLength !== undefined && value.length < definition.minLength) {
            return {
                path: '',
                message: `String length ${value.length} is less than minimum ${definition.minLength}`,
                severity: 'error'
            };
        }

        if (definition.maxLength !== undefined && value.length > definition.maxLength) {
            return {
                path: '',
                message: `String length ${value.length} is greater than maximum ${definition.maxLength}`,
                severity: 'error'
            };
        }

        if (definition.pattern) {
            try {
                const regex = new RegExp(definition.pattern);
                if (!regex.test(value)) {
                    return {
                        path: '',
                        message: `Value does not match pattern: ${definition.pattern}`,
                        severity: 'error'
                    };
                }
            } catch (error) {
                return {
                    path: '',
                    message: `Invalid regex pattern: ${definition.pattern}`,
                    severity: 'error'
                };
            }
        }
    }

    // Custom validation expression
    if (definition.validate) {
        try {
            const isValid = evaluateValidationExpression(definition.validate, value);
            if (!isValid) {
                return {
                    path: '',
                    message: `Validation failed: ${definition.validate}`,
                    severity: 'error'
                };
            }
        } catch (error) {
            return {
                path: '',
                message: `Validation expression error: ${error instanceof Error ? error.message : String(error)}`,
                severity: 'error'
            };
        }
    }

    return null;
}

/**
 * Checks if a value matches the expected type
 */
function isValidType(value: any, type: string): boolean {
    switch (type) {
        case 'string':
            return typeof value === 'string';

        case 'int':
        case 'integer':
            return Number.isInteger(value);

        case 'float':
        case 'number':
            return typeof value === 'number';

        case 'bool':
        case 'boolean':
            return typeof value === 'boolean';

        case 'timestamp':
        case 'timestamp_ms':
        case 'timestamp_ns':
            return typeof value === 'number' || typeof value === 'string';

        case 'object':
            return typeof value === 'object' && value !== null && !Array.isArray(value);

        case 'array':
            return Array.isArray(value);

        default:
            return true;
    }
}

/**
 * Checks if a type is numeric
 */
function isNumericType(type: string): boolean {
    return ['int', 'integer', 'float', 'number', 'timestamp', 'timestamp_ms', 'timestamp_ns'].includes(type);
}

/**
 * Evaluates a conditional expression (required_if)
 * Supports simple expressions like:
 * - "type == 'market'"
 * - "side && amount"
 * - "type == 'limit' || type == 'stopLimit'"
 */
function evaluateExpression(expression: string, params: Record<string, any>): boolean {
    // Simple expression evaluator - supports basic comparisons and logical operators
    // This is a safe subset of JavaScript expressions

    // Replace parameter names with their values
    let safeExpression = expression;

    // Extract all parameter names from the expression
    const paramPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    const matches = expression.matchAll(paramPattern);

    for (const match of matches) {
        const paramName = match[1];
        if (params.hasOwnProperty(paramName)) {
            const value = params[paramName];
            let valueStr: string;

            if (value === null || value === undefined) {
                valueStr = 'null';
            } else if (typeof value === 'string') {
                valueStr = `"${value.replace(/"/g, '\\"')}"`;
            } else if (typeof value === 'boolean' || typeof value === 'number') {
                valueStr = String(value);
            } else {
                valueStr = 'null';
            }

            // Use word boundary to avoid replacing parts of other words
            const regex = new RegExp(`\\b${paramName}\\b`, 'g');
            safeExpression = safeExpression.replace(regex, valueStr);
        }
    }

    // Evaluate the expression safely
    try {
        // Only allow safe operators
        const safeOperators = /^[\s\d"'a-zA-Z_.()&|!=<>+\-*/%]+$/;
        if (!safeOperators.test(safeExpression)) {
            throw new Error('Unsafe expression');
        }

        // Convert && and || to JavaScript equivalents
        safeExpression = safeExpression.replace(/&&/g, ' && ').replace(/\|\|/g, ' || ');

        // Use Function constructor for safe evaluation (no access to outer scope)
        const result = new Function(`return (${safeExpression});`)();
        return Boolean(result);
    } catch (error) {
        // If evaluation fails, return false
        return false;
    }
}

/**
 * Evaluates a validation expression
 * The value is available as 'value' in the expression
 * Examples:
 * - "value > 0"
 * - "value.length <= 100"
 * - "value >= 1 && value <= 100"
 */
function evaluateValidationExpression(expression: string, value: any): boolean {
    try {
        // Only allow safe operators and the 'value' variable
        const safePattern = /^[\s\d"'a-zA-Z_.()&|!=<>+\-*/%]+$/;
        if (!safePattern.test(expression)) {
            throw new Error('Unsafe validation expression');
        }

        // Create a safe evaluation context
        const result = new Function('value', `return (${expression});`)(value);
        return Boolean(result);
    } catch (error) {
        throw new Error(`Invalid validation expression: ${expression}`);
    }
}
