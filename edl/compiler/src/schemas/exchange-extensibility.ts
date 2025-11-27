/**
 * Exchange Extensibility for Order Schemas
 * Enables exchange-specific customization of order schemas while maintaining compatibility
 */

import { OrderType, TimeInForce, ParamDefinition } from '../types/edl.js';
import { BaseOrderParams } from './algorithmic-orders.js';

// ============================================================
// Exchange Order Extension Types
// ============================================================

/**
 * Exchange-specific order extension
 * Allows exchanges to define custom order types, parameters, and aliases
 */
export interface ExchangeOrderExtension {
    /** Exchange identifier (e.g., 'binance', 'kraken', 'coinbase') */
    exchangeId: string;

    /** Custom order types specific to this exchange */
    customOrderTypes?: string[];

    /** Custom parameters specific to this exchange */
    customParams?: Record<string, ParamDefinition>;

    /** Parameter name aliases (CCXT standard -> exchange-specific) */
    paramAliases?: Record<string, string>;

    /** Parameters that must be provided for this exchange */
    requiredOverrides?: string[];

    /** Default values for parameters specific to this exchange */
    defaultOverrides?: Record<string, any>;

    /** Description of this extension */
    description?: string;
}

// ============================================================
// Exchange Capabilities
// ============================================================

/**
 * Exchange trading capabilities
 * Defines what trading features an exchange supports
 */
export interface ExchangeCapabilities {
    /** Supported order types (can include custom exchange-specific types) */
    supportedOrderTypes: (OrderType | string)[];

    /** Supported time-in-force values */
    supportedTimeInForce: TimeInForce[];

    /** Exchange supports stop-loss orders */
    supportsStopLoss: boolean;

    /** Exchange supports take-profit orders */
    supportsTakeProfit: boolean;

    /** Exchange supports trailing stop orders */
    supportsTrailingStop: boolean;

    /** Exchange supports reduce-only orders */
    supportsReduceOnly: boolean;

    /** Exchange supports post-only orders */
    supportsPostOnly: boolean;

    /** Custom capabilities (e.g., 'supportsIcebergOrders': true) */
    customCapabilities?: Record<string, boolean>;

    /** Exchange identifier */
    exchangeId?: string;
}

// ============================================================
// Order Schema Base Types
// ============================================================

/**
 * Base order schema (without exchange-specific extensions)
 */
export interface OrderSchema {
    /** Supported order types (can include custom exchange-specific types) */
    orderTypes: (OrderType | string)[];

    /** Base order parameters */
    baseParams: Record<string, ParamDefinition>;

    /** Optional order parameters */
    optionalParams: Record<string, ParamDefinition>;

    /** Validation rules */
    validationRules?: ValidationRule[];
}

/**
 * Validation rule for order parameters
 */
export interface ValidationRule {
    /** Field to validate */
    field: string;

    /** Validation type */
    type: 'required' | 'range' | 'dependency' | 'pattern' | 'enum';

    /** Minimum value (for range validation) */
    min?: number;

    /** Maximum value (for range validation) */
    max?: number;

    /** Dependent field (for dependency validation) */
    dependsOn?: string;

    /** Regex pattern (for pattern validation) */
    pattern?: string;

    /** Allowed values (for enum validation) */
    allowedValues?: any[];

    /** Error message */
    message?: string;
}

// ============================================================
// Extensible Order Schema
// ============================================================

/**
 * Order schema with exchange-specific extensions
 * Combines base schema with exchange customizations
 */
export interface ExtensibleOrderSchema {
    /** Base order schema (common across all exchanges) */
    baseSchema: OrderSchema;

    /** Exchange-specific extensions */
    extensions: ExchangeOrderExtension[];

    /**
     * Get merged schema for a specific exchange
     * @param exchangeId - Exchange identifier
     * @returns Merged schema with exchange-specific customizations
     */
    getSchemaForExchange(exchangeId: string): OrderSchema;
}

// ============================================================
// Schema Merging Functions
// ============================================================

/**
 * Merge base schema with exchange-specific extension
 * @param base - Base order schema
 * @param extension - Exchange-specific extension
 * @returns Merged order schema
 */
export function mergeOrderSchemas(
    base: OrderSchema,
    extension: ExchangeOrderExtension
): OrderSchema {
    const merged: OrderSchema = {
        orderTypes: [...base.orderTypes],
        baseParams: { ...base.baseParams },
        optionalParams: { ...base.optionalParams },
        validationRules: base.validationRules ? [...base.validationRules] : [],
    };

    // Add custom order types
    if (extension.customOrderTypes) {
        for (const orderType of extension.customOrderTypes) {
            if (!merged.orderTypes.includes(orderType)) {
                merged.orderTypes.push(orderType);
            }
        }
    }

    // Add custom parameters
    if (extension.customParams) {
        for (const [paramName, paramDef] of Object.entries(extension.customParams)) {
            merged.optionalParams[paramName] = paramDef;
        }
    }

    // Apply parameter aliases
    if (extension.paramAliases) {
        for (const [ccxtParam, exchangeParam] of Object.entries(extension.paramAliases)) {
            // Store alias information in the param definition
            if (merged.baseParams[ccxtParam]) {
                merged.baseParams[ccxtParam] = {
                    ...merged.baseParams[ccxtParam],
                    alias: exchangeParam,
                };
            } else if (merged.optionalParams[ccxtParam]) {
                merged.optionalParams[ccxtParam] = {
                    ...merged.optionalParams[ccxtParam],
                    alias: exchangeParam,
                };
            }
        }
    }

    // Apply required overrides
    if (extension.requiredOverrides) {
        for (const paramName of extension.requiredOverrides) {
            // Move from optional to base if needed
            if (merged.optionalParams[paramName]) {
                merged.baseParams[paramName] = {
                    ...merged.optionalParams[paramName],
                    required: true,
                };
                delete merged.optionalParams[paramName];
            } else if (merged.baseParams[paramName]) {
                merged.baseParams[paramName] = {
                    ...merged.baseParams[paramName],
                    required: true,
                };
            }
        }
    }

    // Apply default overrides
    if (extension.defaultOverrides) {
        for (const [paramName, defaultValue] of Object.entries(extension.defaultOverrides)) {
            if (merged.baseParams[paramName]) {
                merged.baseParams[paramName] = {
                    ...merged.baseParams[paramName],
                    default: defaultValue,
                };
            } else if (merged.optionalParams[paramName]) {
                merged.optionalParams[paramName] = {
                    ...merged.optionalParams[paramName],
                    default: defaultValue,
                };
            }
        }
    }

    return merged;
}

/**
 * Create an extensible order schema
 * @param baseSchema - Base order schema
 * @param extensions - Exchange-specific extensions
 * @returns Extensible order schema
 */
export function createExtensibleOrderSchema(
    baseSchema: OrderSchema,
    extensions: ExchangeOrderExtension[]
): ExtensibleOrderSchema {
    return {
        baseSchema,
        extensions,
        getSchemaForExchange(exchangeId: string): OrderSchema {
            const extension = this.extensions.find(ext => ext.exchangeId === exchangeId);
            if (!extension) {
                // Return base schema if no extension found
                return this.baseSchema;
            }
            return mergeOrderSchemas(this.baseSchema, extension);
        },
    };
}

// ============================================================
// Parameter Resolution
// ============================================================

/**
 * Resolve parameter name for a specific exchange
 * Handles parameter aliasing
 * @param param - CCXT standard parameter name
 * @param exchangeId - Exchange identifier
 * @param extensions - Exchange extensions
 * @returns Resolved parameter name
 */
export function resolveParamNameForExchange(
    param: string,
    exchangeId: string,
    extensions: ExchangeOrderExtension[]
): string {
    const extension = extensions.find(ext => ext.exchangeId === exchangeId);
    if (!extension || !extension.paramAliases) {
        return param;
    }

    return extension.paramAliases[param] || param;
}

/**
 * Resolve parameter value for a specific exchange
 * Applies defaults and transformations
 * @param param - Parameter name
 * @param value - Parameter value (may be undefined)
 * @param exchangeId - Exchange identifier
 * @param extensions - Exchange extensions
 * @returns Resolved parameter value
 */
export function resolveParamValueForExchange(
    param: string,
    value: any,
    exchangeId: string,
    extensions: ExchangeOrderExtension[]
): any {
    const extension = extensions.find(ext => ext.exchangeId === exchangeId);

    // If value provided, return it
    if (value !== undefined && value !== null) {
        return value;
    }

    // Check for default override
    if (extension?.defaultOverrides?.[param] !== undefined) {
        return extension.defaultOverrides[param];
    }

    return value;
}

/**
 * Resolve full parameter mapping for an exchange
 * @param param - CCXT parameter name
 * @param value - Parameter value
 * @param exchangeId - Exchange identifier
 * @param extensions - Exchange extensions
 * @returns Object with resolved name and value
 */
export function resolveParamForExchange(
    param: string,
    value: any,
    exchangeId: string,
    extensions: ExchangeOrderExtension[]
): { name: string; value: any } {
    const resolvedName = resolveParamNameForExchange(param, exchangeId, extensions);
    const resolvedValue = resolveParamValueForExchange(param, value, exchangeId, extensions);

    return {
        name: resolvedName,
        value: resolvedValue,
    };
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validation result for exchange extensions
 */
export interface ExtensionValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate an exchange extension
 * @param extension - Exchange extension to validate
 * @returns Validation result
 */
export function validateExchangeExtension(
    extension: ExchangeOrderExtension
): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate exchangeId
    if (!extension.exchangeId || extension.exchangeId.trim() === '') {
        errors.push('exchangeId is required and cannot be empty');
    }

    // Validate customParams
    if (extension.customParams) {
        for (const [paramName, paramDef] of Object.entries(extension.customParams)) {
            if (!paramDef.type) {
                errors.push(`Custom parameter "${paramName}" missing type`);
            }
        }
    }

    // Validate paramAliases
    if (extension.paramAliases) {
        for (const [ccxtParam, exchangeParam] of Object.entries(extension.paramAliases)) {
            if (!exchangeParam || exchangeParam.trim() === '') {
                errors.push(`Parameter alias for "${ccxtParam}" is empty`);
            }
            if (ccxtParam === exchangeParam) {
                warnings.push(`Parameter alias for "${ccxtParam}" maps to itself`);
            }
        }
    }

    // Validate requiredOverrides
    if (extension.requiredOverrides) {
        if (!Array.isArray(extension.requiredOverrides)) {
            errors.push('requiredOverrides must be an array');
        }
    }

    // Validate defaultOverrides
    if (extension.defaultOverrides) {
        if (typeof extension.defaultOverrides !== 'object' || extension.defaultOverrides === null) {
            errors.push('defaultOverrides must be an object');
        }
    }

    // Check for conflicts between requiredOverrides and defaultOverrides
    if (extension.requiredOverrides && extension.defaultOverrides) {
        for (const requiredParam of extension.requiredOverrides) {
            if (extension.defaultOverrides[requiredParam] !== undefined) {
                warnings.push(
                    `Parameter "${requiredParam}" is marked as required but has a default value`
                );
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate exchange capabilities
 * @param capabilities - Exchange capabilities to validate
 * @returns Validation result
 */
export function validateExchangeCapabilities(
    capabilities: ExchangeCapabilities
): ExtensionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate supportedOrderTypes
    if (!capabilities.supportedOrderTypes || capabilities.supportedOrderTypes.length === 0) {
        errors.push('supportedOrderTypes is required and cannot be empty');
    }

    // Validate supportedTimeInForce
    if (!capabilities.supportedTimeInForce || capabilities.supportedTimeInForce.length === 0) {
        warnings.push('supportedTimeInForce is empty - exchange may not support time-in-force');
    }

    // Validate boolean flags
    const booleanFlags = [
        'supportsStopLoss',
        'supportsTakeProfit',
        'supportsTrailingStop',
        'supportsReduceOnly',
        'supportsPostOnly',
    ];

    for (const flag of booleanFlags) {
        if (typeof capabilities[flag as keyof ExchangeCapabilities] !== 'boolean') {
            errors.push(`${flag} must be a boolean value`);
        }
    }

    // Validate customCapabilities
    if (capabilities.customCapabilities) {
        for (const [capName, capValue] of Object.entries(capabilities.customCapabilities)) {
            if (typeof capValue !== 'boolean') {
                errors.push(`Custom capability "${capName}" must be a boolean value`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get all supported order types for an exchange
 * @param baseSchema - Base order schema
 * @param exchangeId - Exchange identifier
 * @param extensions - Exchange extensions
 * @returns Array of supported order types
 */
export function getSupportedOrderTypes(
    baseSchema: OrderSchema,
    exchangeId: string,
    extensions: ExchangeOrderExtension[]
): string[] {
    const mergedSchema = mergeOrderSchemas(
        baseSchema,
        extensions.find(ext => ext.exchangeId === exchangeId) || { exchangeId }
    );
    return mergedSchema.orderTypes;
}

/**
 * Check if an exchange supports a specific order type
 * @param orderType - Order type to check
 * @param exchangeId - Exchange identifier
 * @param extensions - Exchange extensions
 * @param baseSchema - Base order schema
 * @returns True if supported
 */
export function supportsOrderType(
    orderType: string,
    exchangeId: string,
    extensions: ExchangeOrderExtension[],
    baseSchema: OrderSchema
): boolean {
    const supportedTypes = getSupportedOrderTypes(baseSchema, exchangeId, extensions);
    return supportedTypes.includes(orderType);
}

/**
 * Get all parameters for an exchange (including custom ones)
 * @param baseSchema - Base order schema
 * @param exchangeId - Exchange identifier
 * @param extensions - Exchange extensions
 * @returns Combined parameter definitions
 */
export function getAllParamsForExchange(
    baseSchema: OrderSchema,
    exchangeId: string,
    extensions: ExchangeOrderExtension[]
): Record<string, ParamDefinition> {
    const extension = extensions.find(ext => ext.exchangeId === exchangeId);
    const mergedSchema = extension ? mergeOrderSchemas(baseSchema, extension) : baseSchema;

    return {
        ...mergedSchema.baseParams,
        ...mergedSchema.optionalParams,
    };
}
