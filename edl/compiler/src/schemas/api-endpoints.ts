/**
 * API Endpoint Schema Types and Utilities
 *
 * This module provides comprehensive schema definitions for API endpoints,
 * including parameter validation, URL construction, and endpoint metadata.
 */

import type { ParamType, ParamLocation, ResponseDefinition, RateLimitConfig } from '../types/edl.js';

// ============================================================
// HTTP Method Types
// ============================================================

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ============================================================
// Parameter Schema
// ============================================================

/**
 * Detailed parameter schema with validation and serialization options
 */
export interface ParameterSchema {
    /** Parameter name */
    name: string;

    /** Parameter data type */
    type: ParamType;

    /** Whether parameter is required */
    required?: boolean;

    /** Conditional requirement expression */
    requiredIf?: string;

    /** Parameter location in the request */
    location: ParamLocation;

    /** Default value if not provided */
    default?: string | number | boolean | null;

    /** Human-readable description */
    description?: string;

    /** Allowed values (enum) */
    enum?: Array<string | number>;

    /** Validation rules */
    validation?: ValidationRules;

    /** Serialization options */
    serialization?: SerializationOptions;

    /** Parameter aliases */
    aliases?: string[];

    /** Dependencies on other parameters */
    dependencies?: string[];
}

/**
 * Validation rules for parameters
 */
export interface ValidationRules {
    /** Minimum value (for numbers) */
    min?: number;

    /** Maximum value (for numbers) */
    max?: number;

    /** Minimum length (for strings/arrays) */
    minLength?: number;

    /** Maximum length (for strings/arrays) */
    maxLength?: number;

    /** Regular expression pattern (for strings) */
    pattern?: string;

    /** Custom validation expression */
    expression?: string;

    /** Minimum number of items in array */
    minItems?: number;

    /** Maximum number of items in array */
    maxItems?: number;

    /** Whether array items must be unique */
    uniqueItems?: boolean;

    /** Exclusive minimum (value must be > min, not >= min) */
    exclusiveMinimum?: boolean;

    /** Exclusive maximum (value must be < max, not <= max) */
    exclusiveMaximum?: boolean;

    /** Multiple of constraint (for numbers) */
    multipleOf?: number;
}

/**
 * Serialization options for parameters
 */
export interface SerializationOptions {
    /** Format for serialization (e.g., 'iso8601', 'unix', 'decimal') */
    format?: string;

    /** Encoding (e.g., 'json', 'form', 'multipart') */
    encoding?: 'json' | 'form' | 'multipart' | 'raw';

    /** Whether to encode the value */
    encode?: boolean;

    /** Array serialization style */
    arrayStyle?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi' | 'brackets';

    /** Object serialization style */
    objectStyle?: 'dot' | 'bracket' | 'deepObject';
}

// ============================================================
// Response Schema
// ============================================================

/**
 * Response schema definition
 */
export interface ResponseSchema {
    /** Response content type */
    type: 'json' | 'text' | 'binary' | 'xml';

    /** JSONPath or XPath for extracting data */
    path?: string;

    /** Expected response structure (JSON Schema) */
    schema?: Record<string, any>;

    /** Status codes that indicate success */
    successCodes?: number[];

    /** Headers to extract */
    headers?: string[];
}

// ============================================================
// Authentication Requirements
// ============================================================

/**
 * Authentication requirements for an endpoint
 */
export interface AuthenticationRequirement {
    /** Whether authentication is required */
    required: boolean;

    /** Authentication schemes accepted */
    schemes?: ('apiKey' | 'hmac' | 'jwt' | 'oauth' | 'bearer' | 'signature' | 'basic' | 'custom')[];

    /** Required credentials */
    credentials?: string[];

    /** Required permissions/scopes */
    permissions?: string[];
}

// ============================================================
// Error Mapping
// ============================================================

/**
 * Error mapping for specific error responses
 */
export interface ErrorMapping {
    /** HTTP status code */
    statusCode?: number;

    /** Error code from response body */
    errorCode?: string | number;

    /** Error message pattern (regex or literal) */
    messagePattern?: string;

    /** Mapped error type */
    errorType: string;

    /** Whether the request can be retried */
    retryable?: boolean;

    /** Retry delay in milliseconds */
    retryDelay?: number;
}

// ============================================================
// API Endpoint Schema
// ============================================================

/**
 * Comprehensive schema for an API endpoint
 */
export interface APIEndpointSchema {
    /** Endpoint identifier */
    id: string;

    /** HTTP method */
    method: HTTPMethod;

    /** URL path template with parameter placeholders */
    path: string;

    /** Base URL (optional, may be defined at API level) */
    baseUrl?: string;

    /** Path parameters */
    pathParams?: ParameterSchema[];

    /** Query parameters */
    queryParams?: ParameterSchema[];

    /** Body parameters */
    bodyParams?: ParameterSchema[];

    /** Header parameters */
    headers?: ParameterSchema[];

    /** Authentication requirements */
    authentication?: AuthenticationRequirement;

    /** Response schema */
    response?: ResponseSchema;

    /** Rate limit configuration */
    rateLimit?: RateLimitConfig;

    /** Error mappings */
    errors?: ErrorMapping[];

    /** Endpoint description */
    description?: string;

    /** Whether endpoint is deprecated */
    deprecated?: boolean;

    /** Tags for categorization */
    tags?: string[];
}

// ============================================================
// URL Building and Path Parsing
// ============================================================

/**
 * Parsed path parameter from a URL template
 */
export interface PathParameter {
    /** Parameter name */
    name: string;

    /** Position in the path */
    position: number;

    /** Whether parameter is required */
    required: boolean;
}

/**
 * Parse path parameters from a URL template
 *
 * @param path - URL path template (e.g., '/api/v1/orders/{orderId}')
 * @returns Array of parsed path parameters
 *
 * @example
 * ```typescript
 * parseEndpointPath('/api/v1/users/{userId}/orders/{orderId}')
 * // Returns: [
 * //   { name: 'userId', position: 0, required: true },
 * //   { name: 'orderId', position: 1, required: true }
 * // ]
 * ```
 */
export function parseEndpointPath(path: string): PathParameter[] {
    const pathParams: PathParameter[] = [];

    // Match {paramName} and {paramName?} patterns
    const paramRegex = /\{([^}]+?)(\?)?\}/g;
    let match: RegExpExecArray | null;
    let position = 0;

    while ((match = paramRegex.exec(path)) !== null) {
        const name = match[1];
        const optional = match[2] === '?';

        pathParams.push({
            name,
            position,
            required: !optional,
        });

        position++;
    }

    return pathParams;
}

/**
 * Build a complete URL from endpoint schema and parameters
 *
 * @param schema - API endpoint schema
 * @param params - Parameter values
 * @returns Complete URL with path and query parameters
 *
 * @example
 * ```typescript
 * const schema: APIEndpointSchema = {
 *   id: 'getOrder',
 *   method: 'GET',
 *   path: '/api/v1/orders/{orderId}',
 *   baseUrl: 'https://api.example.com',
 *   queryParams: [{ name: 'include', location: 'query', type: 'string', required: false }]
 * };
 *
 * buildEndpointUrl(schema, { orderId: '12345', include: 'trades' })
 * // Returns: 'https://api.example.com/api/v1/orders/12345?include=trades'
 * ```
 */
export function buildEndpointUrl(
    schema: APIEndpointSchema,
    params: Record<string, any>
): string {
    let url = schema.path;

    // Replace path parameters
    const pathParams = parseEndpointPath(schema.path);
    for (const pathParam of pathParams) {
        const value = params[pathParam.name];

        if (value === undefined || value === null) {
            if (pathParam.required) {
                throw new Error(`Missing required path parameter: ${pathParam.name}`);
            }
            // Remove optional parameter and its surrounding slashes
            url = url.replace(new RegExp(`/\\{${pathParam.name}\\?\\}`), '');
        } else {
            url = url.replace(
                new RegExp(`\\{${pathParam.name}\\??\\}`),
                encodeURIComponent(String(value))
            );
        }
    }

    // Add base URL if provided
    if (schema.baseUrl) {
        url = schema.baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
    }

    // Add query parameters
    const queryParams = schema.queryParams || [];
    const queryParts: string[] = [];

    for (const queryParam of queryParams) {
        const value = params[queryParam.name];

        if (value !== undefined && value !== null) {
            const encodedValue = encodeURIComponent(String(value));
            queryParts.push(`${queryParam.name}=${encodedValue}`);
        } else if (queryParam.required) {
            throw new Error(`Missing required query parameter: ${queryParam.name}`);
        }
    }

    if (queryParts.length > 0) {
        url += '?' + queryParts.join('&');
    }

    return url;
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validation error
 */
export interface ValidationError {
    /** Parameter name */
    parameter: string;

    /** Error message */
    message: string;

    /** Error code */
    code: string;

    /** Actual value */
    value?: any;
}

/**
 * Validate a parameter value against its schema
 *
 * @param param - Parameter schema
 * @param value - Parameter value
 * @returns Validation errors, or empty array if valid
 */
export function validateParameter(
    param: ParameterSchema,
    value: any
): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required
    if (param.required && (value === undefined || value === null)) {
        errors.push({
            parameter: param.name,
            message: `Parameter '${param.name}' is required`,
            code: 'REQUIRED',
            value,
        });
        return errors;
    }

    // Skip further validation if value is not provided
    if (value === undefined || value === null) {
        return errors;
    }

    // Type validation
    const actualType = typeof value;
    const expectedTypes: string[] = [];

    switch (param.type) {
        case 'string':
            expectedTypes.push('string');
            break;
        case 'int':
        case 'integer':
        case 'float':
        case 'number':
        case 'timestamp':
        case 'timestamp_ms':
        case 'timestamp_ns':
            expectedTypes.push('number');
            break;
        case 'bool':
        case 'boolean':
            expectedTypes.push('boolean');
            break;
        case 'array':
            if (!Array.isArray(value)) {
                errors.push({
                    parameter: param.name,
                    message: `Parameter '${param.name}' must be an array`,
                    code: 'INVALID_TYPE',
                    value,
                });
            }
            break;
        case 'object':
            expectedTypes.push('object');
            break;
    }

    if (expectedTypes.length > 0 && !expectedTypes.includes(actualType)) {
        errors.push({
            parameter: param.name,
            message: `Parameter '${param.name}' must be of type ${expectedTypes.join(' or ')}, got ${actualType}`,
            code: 'INVALID_TYPE',
            value,
        });
    }

    // Enum validation
    if (param.enum && !param.enum.includes(value)) {
        errors.push({
            parameter: param.name,
            message: `Parameter '${param.name}' must be one of: ${param.enum.join(', ')}`,
            code: 'INVALID_ENUM',
            value,
        });
    }

    // Validation rules
    if (param.validation) {
        const rules = param.validation;

        // Numeric validations
        if (typeof value === 'number') {
            // Min/max with exclusive options
            if (rules.min !== undefined) {
                const exclusive = rules.exclusiveMinimum ?? false;
                const valid = exclusive ? value > rules.min : value >= rules.min;
                if (!valid) {
                    const operator = exclusive ? '>' : '>=';
                    errors.push({
                        parameter: param.name,
                        message: `Parameter '${param.name}' must be ${operator} ${rules.min}`,
                        code: 'MIN_VALUE',
                        value,
                    });
                }
            }

            if (rules.max !== undefined) {
                const exclusive = rules.exclusiveMaximum ?? false;
                const valid = exclusive ? value < rules.max : value <= rules.max;
                if (!valid) {
                    const operator = exclusive ? '<' : '<=';
                    errors.push({
                        parameter: param.name,
                        message: `Parameter '${param.name}' must be ${operator} ${rules.max}`,
                        code: 'MAX_VALUE',
                        value,
                    });
                }
            }

            // Multiple of constraint
            if (rules.multipleOf !== undefined && rules.multipleOf > 0) {
                const remainder = value % rules.multipleOf;
                // Use epsilon comparison for floating point
                if (Math.abs(remainder) > Number.EPSILON && Math.abs(remainder - rules.multipleOf) > Number.EPSILON) {
                    errors.push({
                        parameter: param.name,
                        message: `Parameter '${param.name}' must be a multiple of ${rules.multipleOf}`,
                        code: 'MULTIPLE_OF',
                        value,
                    });
                }
            }
        }

        // String/Array length validations
        if (typeof value === 'string' || Array.isArray(value)) {
            const length = value.length;

            if (rules.minLength !== undefined && length < rules.minLength) {
                errors.push({
                    parameter: param.name,
                    message: `Parameter '${param.name}' length must be >= ${rules.minLength}`,
                    code: 'MIN_LENGTH',
                    value,
                });
            }

            if (rules.maxLength !== undefined && length > rules.maxLength) {
                errors.push({
                    parameter: param.name,
                    message: `Parameter '${param.name}' length must be <= ${rules.maxLength}`,
                    code: 'MAX_LENGTH',
                    value,
                });
            }
        }

        // Array-specific validations
        if (Array.isArray(value)) {
            if (rules.minItems !== undefined && value.length < rules.minItems) {
                errors.push({
                    parameter: param.name,
                    message: `Parameter '${param.name}' must have at least ${rules.minItems} items`,
                    code: 'MIN_ITEMS',
                    value,
                });
            }

            if (rules.maxItems !== undefined && value.length > rules.maxItems) {
                errors.push({
                    parameter: param.name,
                    message: `Parameter '${param.name}' must have at most ${rules.maxItems} items`,
                    code: 'MAX_ITEMS',
                    value,
                });
            }

            if (rules.uniqueItems) {
                const uniqueValues = new Set(value.map(v => JSON.stringify(v)));
                if (uniqueValues.size !== value.length) {
                    errors.push({
                        parameter: param.name,
                        message: `Parameter '${param.name}' must contain unique items`,
                        code: 'UNIQUE_ITEMS',
                        value,
                    });
                }
            }
        }

        // Pattern validation (strings only)
        if (typeof value === 'string' && rules.pattern) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(value)) {
                errors.push({
                    parameter: param.name,
                    message: `Parameter '${param.name}' does not match pattern: ${rules.pattern}`,
                    code: 'PATTERN_MISMATCH',
                    value,
                });
            }
        }
    }

    return errors;
}

/**
 * Validate all parameters for an endpoint
 *
 * @param schema - API endpoint schema
 * @param params - Parameter values
 * @returns All validation errors
 */
export function validateEndpointSchema(
    schema: APIEndpointSchema,
    params: Record<string, any>
): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate path parameters
    if (schema.pathParams) {
        for (const param of schema.pathParams) {
            errors.push(...validateParameter(param, params[param.name]));
        }
    }

    // Validate query parameters
    if (schema.queryParams) {
        for (const param of schema.queryParams) {
            errors.push(...validateParameter(param, params[param.name]));
        }
    }

    // Validate body parameters
    if (schema.bodyParams) {
        for (const param of schema.bodyParams) {
            errors.push(...validateParameter(param, params[param.name]));
        }
    }

    // Validate header parameters
    if (schema.headers) {
        for (const param of schema.headers) {
            errors.push(...validateParameter(param, params[param.name]));
        }
    }

    return errors;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Extract all parameters from an endpoint schema
 *
 * @param schema - API endpoint schema
 * @returns All parameters grouped by location
 */
export function extractParameters(schema: APIEndpointSchema): {
    path: ParameterSchema[];
    query: ParameterSchema[];
    body: ParameterSchema[];
    header: ParameterSchema[];
} {
    return {
        path: schema.pathParams || [],
        query: schema.queryParams || [],
        body: schema.bodyParams || [],
        header: schema.headers || [],
    };
}

/**
 * Get all required parameters for an endpoint
 *
 * @param schema - API endpoint schema
 * @returns Array of required parameter names
 */
export function getRequiredParameters(schema: APIEndpointSchema): string[] {
    const allParams = [
        ...(schema.pathParams || []),
        ...(schema.queryParams || []),
        ...(schema.bodyParams || []),
        ...(schema.headers || []),
    ];

    return allParams
        .filter(param => param.required)
        .map(param => param.name);
}

/**
 * Check if a value matches a parameter type
 *
 * @param value - Value to check
 * @param type - Expected parameter type
 * @returns True if value matches type
 */
export function matchesParameterType(value: any, type: ParamType): boolean {
    if (value === null || value === undefined) {
        return true; // Let required check handle this
    }

    switch (type) {
        case 'string':
            return typeof value === 'string';
        case 'int':
        case 'integer':
            return typeof value === 'number' && Number.isInteger(value);
        case 'float':
        case 'number':
        case 'timestamp':
        case 'timestamp_ms':
        case 'timestamp_ns':
            return typeof value === 'number';
        case 'bool':
        case 'boolean':
            return typeof value === 'boolean';
        case 'array':
            return Array.isArray(value);
        case 'object':
            return typeof value === 'object' && !Array.isArray(value);
        default:
            return false;
    }
}

// ============================================================
// HTTP Method and Path Template Validation
// ============================================================

/**
 * Validate HTTP method
 *
 * @param method - HTTP method to validate
 * @returns True if valid HTTP method
 */
export function isValidHTTPMethod(method: string): method is HTTPMethod {
    const validMethods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    return validMethods.includes(method as HTTPMethod);
}

/**
 * Validate path template format
 *
 * @param path - Path template to validate
 * @returns Validation errors, or empty array if valid
 */
export function validatePathTemplate(path: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for empty path
    if (!path || path.trim() === '') {
        errors.push({
            parameter: 'path',
            message: 'Path template cannot be empty',
            code: 'EMPTY_PATH',
            value: path,
        });
        return errors;
    }

    // Check for valid path format (should start with /)
    if (!path.startsWith('/')) {
        errors.push({
            parameter: 'path',
            message: 'Path template must start with /',
            code: 'INVALID_PATH_FORMAT',
            value: path,
        });
    }

    // Check for balanced brackets
    const openBrackets = (path.match(/\{/g) || []).length;
    const closeBrackets = (path.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
        errors.push({
            parameter: 'path',
            message: 'Path template has unbalanced brackets',
            code: 'UNBALANCED_BRACKETS',
            value: path,
        });
    }

    // Check for invalid placeholder syntax
    const invalidPlaceholders = path.match(/\{[^}]*\{|\}[^{]*\}/g);
    if (invalidPlaceholders) {
        errors.push({
            parameter: 'path',
            message: 'Path template has nested or invalid placeholder syntax',
            code: 'INVALID_PLACEHOLDER',
            value: path,
        });
    }

    // Check for empty placeholders
    if (path.includes('{}')) {
        errors.push({
            parameter: 'path',
            message: 'Path template contains empty placeholder',
            code: 'EMPTY_PLACEHOLDER',
            value: path,
        });
    }

    // Check for duplicate slashes
    if (path.includes('//')) {
        errors.push({
            parameter: 'path',
            message: 'Path template contains duplicate slashes',
            code: 'DUPLICATE_SLASHES',
            value: path,
        });
    }

    return errors;
}

/**
 * Validate that path placeholders match defined parameters
 *
 * @param schema - API endpoint schema
 * @returns Validation errors, or empty array if valid
 */
export function validatePathPlaceholders(schema: APIEndpointSchema): ValidationError[] {
    const errors: ValidationError[] = [];

    // Parse placeholders from path
    const pathParams = parseEndpointPath(schema.path);
    const pathParamNames = new Set(pathParams.map(p => p.name));

    // Get defined path parameters
    const definedParams = schema.pathParams || [];
    const definedParamNames = new Set(definedParams.map(p => p.name));

    // Check for placeholders without definitions
    for (const placeholder of pathParamNames) {
        if (!definedParamNames.has(placeholder)) {
            errors.push({
                parameter: placeholder,
                message: `Path placeholder '{${placeholder}}' has no corresponding parameter definition`,
                code: 'UNDEFINED_PLACEHOLDER',
                value: schema.path,
            });
        }
    }

    // Check for defined parameters not in path
    for (const param of definedParams) {
        if (!pathParamNames.has(param.name)) {
            errors.push({
                parameter: param.name,
                message: `Path parameter '${param.name}' is defined but not used in path template`,
                code: 'UNUSED_PATH_PARAMETER',
                value: schema.path,
            });
        }
    }

    // Validate that required status matches
    for (const pathParam of pathParams) {
        const definition = definedParams.find(p => p.name === pathParam.name);
        if (definition) {
            // Path parameter in template should match required status
            if (pathParam.required && definition.required === false) {
                errors.push({
                    parameter: pathParam.name,
                    message: `Path parameter '${pathParam.name}' is required in path but marked as optional in definition`,
                    code: 'MISMATCHED_REQUIRED_STATUS',
                    value: schema.path,
                });
            }
        }
    }

    return errors;
}

/**
 * Validate API version in path
 *
 * @param path - Path template to validate
 * @returns True if path contains a valid version segment
 */
export function hasValidAPIVersion(path: string): boolean {
    // Match common version patterns: v1, v2, v3, v1.0, v2.1, etc.
    const versionPattern = /\/v\d+(?:\.\d+)?(?:\/|$)/i;
    return versionPattern.test(path);
}

/**
 * Extract API version from path
 *
 * @param path - Path template
 * @returns API version string or null if not found
 */
export function extractAPIVersion(path: string): string | null {
    const versionMatch = path.match(/\/v(\d+(?:\.\d+)?)\//i);
    return versionMatch ? versionMatch[1] : null;
}

/**
 * Validate that endpoint schema is well-formed
 *
 * @param schema - API endpoint schema
 * @returns All validation errors
 */
export function validateEndpointDefinition(schema: APIEndpointSchema): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate HTTP method
    if (!isValidHTTPMethod(schema.method)) {
        errors.push({
            parameter: 'method',
            message: `Invalid HTTP method: ${schema.method}`,
            code: 'INVALID_HTTP_METHOD',
            value: schema.method,
        });
    }

    // Validate path template
    errors.push(...validatePathTemplate(schema.path));

    // Validate path placeholders match parameters
    errors.push(...validatePathPlaceholders(schema));

    // Validate body parameters only for appropriate methods
    const methodsWithoutBody: HTTPMethod[] = ['GET', 'HEAD', 'DELETE'];
    if (methodsWithoutBody.includes(schema.method) && schema.bodyParams && schema.bodyParams.length > 0) {
        errors.push({
            parameter: 'bodyParams',
            message: `HTTP ${schema.method} should not have body parameters`,
            code: 'INVALID_BODY_FOR_METHOD',
            value: schema.method,
        });
    }

    return errors;
}
