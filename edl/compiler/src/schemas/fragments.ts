/**
 * Shared Fragment Schema
 * Defines data structures for reusable fragments across spot/futures market definitions
 */

import type {
    APICategory,
    ParserDefinition,
    AuthMethod,
    ErrorDefinition,
    MarketsDefinition,
} from '../types/edl.js';

// ============================================================
// Fragment Type Definitions
// ============================================================

/**
 * Types of fragments that can be shared
 */
export type FragmentType = 'api' | 'parser' | 'auth' | 'errors' | 'markets';

/**
 * Parameter types for parameterized fragments
 */
export type FragmentParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Parameter definition for parameterized fragments
 */
export interface FragmentParameter {
    /** Parameter name */
    name: string;
    /** Parameter type */
    type: FragmentParameterType;
    /** Whether the parameter is required */
    required?: boolean;
    /** Default value if not provided */
    default?: any;
    /** Human-readable description */
    description?: string;
}

/**
 * Metadata for fragment versioning and tracking
 */
export interface FragmentMetadata {
    /** Semantic version of the fragment */
    version?: string;
    /** Author or creator of the fragment */
    author?: string;
    /** Creation timestamp (ISO 8601) */
    createdAt?: string;
    /** Tags for categorization and search */
    tags?: string[];
    /** Whether this fragment is deprecated */
    deprecated?: boolean;
    /** ID of the fragment that replaces this one */
    replacedBy?: string;
}

/**
 * Content type for different fragment types
 */
export type FragmentContent =
    | APICategory
    | ParserDefinition
    | AuthMethod
    | ErrorDefinition
    | MarketsDefinition;

/**
 * Definition of a reusable fragment
 */
export interface FragmentDefinition {
    /** Unique identifier for the fragment */
    id: string;
    /** Type of fragment */
    type: FragmentType;
    /** Human-readable name */
    name: string;
    /** Optional description */
    description?: string;
    /** The actual fragment content */
    content: FragmentContent;
    /** Parameters for parameterized fragments */
    parameters?: FragmentParameter[];
    /** Metadata for versioning and tracking */
    metadata?: FragmentMetadata;
}

/**
 * Reference to a fragment with arguments and overrides
 */
export interface FragmentReference {
    /** ID of the fragment to reference */
    fragmentId: string;
    /** Arguments to pass to parameterized fragments */
    arguments?: Record<string, any>;
    /** Overrides to apply to the fragment content */
    overrides?: Record<string, any>;
}

/**
 * Registry for managing fragments
 */
export interface FragmentRegistry {
    /** Map of fragment ID to fragment definition */
    fragments: Record<string, FragmentDefinition>;

    /**
     * Register a new fragment
     * @param fragment Fragment to register
     * @throws Error if fragment with same ID already exists
     */
    register(fragment: FragmentDefinition): void;

    /**
     * Get a fragment by ID
     * @param id Fragment ID
     * @returns Fragment definition or undefined if not found
     */
    get(id: string): FragmentDefinition | undefined;

    /**
     * Resolve a fragment reference with arguments and overrides
     * @param ref Fragment reference
     * @returns Resolved fragment content
     * @throws Error if fragment not found or parameters invalid
     */
    resolve(ref: FragmentReference): FragmentContent;
}

// ============================================================
// Validation Errors
// ============================================================

export interface FragmentValidationError {
    field: string;
    message: string;
}

export interface FragmentValidationResult {
    valid: boolean;
    errors: FragmentValidationError[];
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate a fragment definition
 * @param fragment Fragment to validate
 * @returns Validation result
 */
export function validateFragmentDefinition(fragment: any): FragmentValidationResult {
    const errors: FragmentValidationError[] = [];

    // Check required fields
    if (!fragment) {
        errors.push({ field: 'fragment', message: 'Fragment is required' });
        return { valid: false, errors };
    }

    if (!fragment.id || typeof fragment.id !== 'string') {
        errors.push({ field: 'id', message: 'Fragment ID must be a non-empty string' });
    }

    if (!fragment.type) {
        errors.push({ field: 'type', message: 'Fragment type is required' });
    } else {
        const validTypes: FragmentType[] = ['api', 'parser', 'auth', 'errors', 'markets'];
        if (!validTypes.includes(fragment.type)) {
            errors.push({
                field: 'type',
                message: `Fragment type must be one of: ${validTypes.join(', ')}`,
            });
        }
    }

    if (!fragment.name || typeof fragment.name !== 'string') {
        errors.push({ field: 'name', message: 'Fragment name must be a non-empty string' });
    }

    if (fragment.content === undefined || fragment.content === null) {
        errors.push({ field: 'content', message: 'Fragment content is required' });
    }

    // Validate parameters if present
    if (fragment.parameters) {
        if (!Array.isArray(fragment.parameters)) {
            errors.push({ field: 'parameters', message: 'Parameters must be an array' });
        } else {
            fragment.parameters.forEach((param: any, index: number) => {
                if (!param.name || typeof param.name !== 'string') {
                    errors.push({
                        field: `parameters[${index}].name`,
                        message: 'Parameter name must be a non-empty string',
                    });
                }
                const validParamTypes: FragmentParameterType[] = [
                    'string',
                    'number',
                    'boolean',
                    'object',
                    'array',
                ];
                if (!param.type || !validParamTypes.includes(param.type)) {
                    errors.push({
                        field: `parameters[${index}].type`,
                        message: `Parameter type must be one of: ${validParamTypes.join(', ')}`,
                    });
                }
            });
        }
    }

    // Validate metadata if present
    if (fragment.metadata) {
        if (fragment.metadata.version && typeof fragment.metadata.version !== 'string') {
            errors.push({ field: 'metadata.version', message: 'Version must be a string' });
        }
        if (fragment.metadata.tags && !Array.isArray(fragment.metadata.tags)) {
            errors.push({ field: 'metadata.tags', message: 'Tags must be an array' });
        }
        if (fragment.metadata.deprecated !== undefined && typeof fragment.metadata.deprecated !== 'boolean') {
            errors.push({ field: 'metadata.deprecated', message: 'Deprecated must be a boolean' });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate required parameters are provided
 * @param fragment Fragment definition
 * @param args Provided arguments
 * @returns Validation result
 */
function validateParameters(
    fragment: FragmentDefinition,
    args: Record<string, any> = {}
): FragmentValidationResult {
    const errors: FragmentValidationError[] = [];

    if (!fragment.parameters || fragment.parameters.length === 0) {
        return { valid: true, errors: [] };
    }

    // Check required parameters
    for (const param of fragment.parameters) {
        if (param.required && !(param.name in args) && param.default === undefined) {
            errors.push({
                field: param.name,
                message: `Required parameter '${param.name}' is missing`,
            });
        }
    }

    // Validate parameter types
    for (const [key, value] of Object.entries(args)) {
        const param = fragment.parameters.find(p => p.name === key);
        if (!param) {
            continue; // Unknown parameters are allowed (might be for overrides)
        }

        const actualType = Array.isArray(value) ? 'array' : typeof value;
        const expectedType = param.type === 'object' ? 'object' : param.type;

        if (actualType !== expectedType && !(value === null && !param.required)) {
            errors.push({
                field: key,
                message: `Parameter '${key}' expected type '${param.type}' but got '${actualType}'`,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================================
// Resolution Functions
// ============================================================

/**
 * Resolve a fragment reference with arguments
 * @param ref Fragment reference
 * @param registry Fragment registry
 * @returns Resolved fragment content
 * @throws Error if fragment not found or parameters invalid
 */
export function resolveFragmentReference(
    ref: FragmentReference,
    registry: FragmentRegistry
): FragmentContent {
    const fragment = registry.get(ref.fragmentId);
    if (!fragment) {
        throw new Error(`Fragment '${ref.fragmentId}' not found`);
    }

    // Validate parameters
    const validation = validateParameters(fragment, ref.arguments);
    if (!validation.valid) {
        const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
        throw new Error(`Invalid fragment parameters: ${errorMessages}`);
    }

    // Apply parameters to content
    let resolvedContent = applyParameters(fragment, ref.arguments || {});

    // Apply overrides
    if (ref.overrides) {
        resolvedContent = mergeFragmentContent(resolvedContent, ref.overrides);
    }

    return resolvedContent;
}

/**
 * Apply parameter values to fragment content
 * @param fragment Fragment definition
 * @param args Argument values
 * @returns Content with parameters applied
 */
function applyParameters(
    fragment: FragmentDefinition,
    args: Record<string, any>
): FragmentContent {
    if (!fragment.parameters || fragment.parameters.length === 0) {
        return fragment.content;
    }

    // Build parameter map with defaults
    const params: Record<string, any> = {};
    for (const param of fragment.parameters) {
        if (param.name in args) {
            params[param.name] = args[param.name];
        } else if (param.default !== undefined) {
            params[param.name] = param.default;
        }
    }

    // Deep clone and replace parameter placeholders
    return replaceParameterPlaceholders(fragment.content, params);
}

/**
 * Replace parameter placeholders in content
 * @param content Content with placeholders
 * @param params Parameter values
 * @returns Content with placeholders replaced
 */
function replaceParameterPlaceholders(content: any, params: Record<string, any>): any {
    if (content === null || content === undefined) {
        return content;
    }

    // Handle strings with {{param}} placeholders
    if (typeof content === 'string') {
        return content.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
            return params[paramName] !== undefined ? String(params[paramName]) : match;
        });
    }

    // Handle arrays
    if (Array.isArray(content)) {
        return content.map(item => replaceParameterPlaceholders(item, params));
    }

    // Handle objects
    if (typeof content === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(content)) {
            result[key] = replaceParameterPlaceholders(value, params);
        }
        return result;
    }

    return content;
}

/**
 * Merge fragment content with overrides
 * @param base Base fragment content
 * @param overrides Override values
 * @returns Merged content
 */
export function mergeFragmentContent(base: any, overrides: Record<string, any>): any {
    if (!base || typeof base !== 'object') {
        return base;
    }

    // Deep clone base
    const result = Array.isArray(base) ? [...base] : { ...base };

    // Apply overrides
    for (const [key, value] of Object.entries(overrides)) {
        if (value === null) {
            // null means delete the field
            delete result[key];
        } else if (typeof value === 'object' && !Array.isArray(value) && result[key] && typeof result[key] === 'object') {
            // Recursively merge objects
            result[key] = mergeFragmentContent(result[key], value);
        } else {
            // Replace value
            result[key] = value;
        }
    }

    return result;
}

// ============================================================
// Fragment Registry Implementation
// ============================================================

/**
 * Create a new fragment registry
 * @returns Fragment registry instance
 */
export function createFragmentRegistry(): FragmentRegistry {
    const fragments: Record<string, FragmentDefinition> = {};

    return {
        fragments,

        register(fragment: FragmentDefinition): void {
            // Validate fragment
            const validation = validateFragmentDefinition(fragment);
            if (!validation.valid) {
                const errorMessages = validation.errors.map(e => `${e.field}: ${e.message}`).join('; ');
                throw new Error(`Invalid fragment definition: ${errorMessages}`);
            }

            // Check for duplicates
            if (fragments[fragment.id]) {
                throw new Error(`Fragment '${fragment.id}' is already registered`);
            }

            fragments[fragment.id] = fragment;
        },

        get(id: string): FragmentDefinition | undefined {
            return fragments[id];
        },

        resolve(ref: FragmentReference): FragmentContent {
            return resolveFragmentReference(ref, this);
        },
    };
}
