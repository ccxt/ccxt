/**
 * Margin Methods Schema Types and Utilities
 *
 * This module provides comprehensive schema definitions for margin trading operations,
 * including leverage management, borrowing, repaying, and margin mode configuration.
 * Ensures alignment with CCXT margin trading standards.
 */

import type { ParamDefinition, ParamType, ParamLocation } from '../types/edl.js';

// ============================================================
// Margin Mode Types
// ============================================================

/**
 * Margin mode types supported across exchanges
 */
export type MarginMode = 'cross' | 'isolated';

/**
 * Margin operation types
 */
export type MarginOperationType =
    | 'setLeverage'
    | 'borrow'
    | 'repay'
    | 'fetchBorrowRate'
    | 'fetchBorrowRates'
    | 'setMarginMode'
    | 'fetchLeverage';

/**
 * Borrow/repay transaction status
 */
export type MarginTransactionStatus = 'pending' | 'ok' | 'failed' | 'canceled';

/**
 * Position side for leverage settings (futures/perpetuals)
 */
export type PositionSide = 'long' | 'short' | 'both';

// ============================================================
// Set Leverage Schema
// ============================================================

/**
 * Set leverage request parameters
 */
export interface SetLeverageRequest {
    /** Trading symbol (e.g., 'BTC/USDT') */
    symbol: string;

    /** Leverage value (e.g., 1-125 depending on exchange) */
    leverage: number;

    /** Position side for isolated margin (futures) */
    side?: PositionSide;

    /** Additional exchange-specific parameters */
    params?: Record<string, any>;
}

/**
 * Set leverage response schema
 */
export interface SetLeverageSchema {
    /** Symbol for which leverage was set */
    symbol: string;

    /** Applied leverage value */
    leverage: number;

    /** Margin mode (if applicable) */
    marginMode?: MarginMode;

    /** Position side (if applicable) */
    side?: PositionSide;

    /** Timestamp when leverage was set (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Borrow Schema
// ============================================================

/**
 * Borrow request parameters
 */
export interface BorrowRequest {
    /** Currency code to borrow (e.g., 'USDT') */
    currency: string;

    /** Amount to borrow */
    amount: number;

    /** Symbol for isolated margin (optional) */
    symbol?: string;

    /** Margin mode (cross or isolated) */
    marginMode?: MarginMode;

    /** Additional exchange-specific parameters */
    params?: Record<string, any>;
}

/**
 * Borrow transaction schema aligned with CCXT format
 */
export interface BorrowSchema {
    /** Unique transaction identifier */
    id: string;

    /** Currency borrowed */
    currency: string;

    /** Amount borrowed */
    amount: number;

    /** Symbol (for isolated margin) */
    symbol?: string;

    /** Margin mode used */
    marginMode?: MarginMode;

    /** Transaction status */
    status: MarginTransactionStatus;

    /** Timestamp when borrow was initiated (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Interest rate applied */
    interestRate?: number;

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Repay Schema
// ============================================================

/**
 * Repay request parameters
 */
export interface RepayRequest {
    /** Currency code to repay (e.g., 'USDT') */
    currency: string;

    /** Amount to repay */
    amount: number;

    /** Symbol for isolated margin (optional) */
    symbol?: string;

    /** Margin mode (cross or isolated) */
    marginMode?: MarginMode;

    /** Additional exchange-specific parameters */
    params?: Record<string, any>;
}

/**
 * Repay transaction schema aligned with CCXT format
 */
export interface RepaySchema {
    /** Unique transaction identifier */
    id: string;

    /** Currency repaid */
    currency: string;

    /** Amount repaid */
    amount: number;

    /** Symbol (for isolated margin) */
    symbol?: string;

    /** Margin mode used */
    marginMode?: MarginMode;

    /** Transaction status */
    status: MarginTransactionStatus;

    /** Timestamp when repay was initiated (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Interest paid (if calculated) */
    interestPaid?: number;

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Borrow Rate Schema
// ============================================================

/**
 * Borrow rate for a single currency
 */
export interface BorrowRateSchema {
    /** Currency code */
    currency: string;

    /** Symbol (for isolated margin rates) */
    symbol?: string;

    /** Hourly interest rate (decimal, e.g., 0.0001 = 0.01%) */
    rate: number;

    /** Daily interest rate (convenience field) */
    dailyRate?: number;

    /** Annual percentage rate (APR) */
    annualRate?: number;

    /** Timestamp of rate (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Margin mode this rate applies to */
    marginMode?: MarginMode;

    /** Additional metadata from exchange */
    info?: any;
}

/**
 * Collection of borrow rates (multi-currency)
 */
export interface BorrowRatesSchema {
    /** Map of currency code to borrow rate */
    rates: Record<string, BorrowRateSchema>;

    /** Timestamp when rates were fetched (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Margin Mode Schema
// ============================================================

/**
 * Set margin mode request parameters
 */
export interface SetMarginModeRequest {
    /** Margin mode to set */
    marginMode: MarginMode;

    /** Symbol (required for some exchanges) */
    symbol?: string;

    /** Additional exchange-specific parameters */
    params?: Record<string, any>;
}

/**
 * Margin mode configuration schema
 */
export interface MarginModeSchema {
    /** Symbol (if applicable) */
    symbol?: string;

    /** Current margin mode */
    marginMode: MarginMode;

    /** Timestamp when mode was set (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Fetch Leverage Schema
// ============================================================

/**
 * Leverage information schema
 */
export interface LeverageSchema {
    /** Symbol */
    symbol: string;

    /** Current leverage setting */
    leverage: number;

    /** Maximum allowed leverage for this symbol */
    maxLeverage?: number;

    /** Minimum allowed leverage */
    minLeverage?: number;

    /** Margin mode */
    marginMode?: MarginMode;

    /** Long position leverage (if different) */
    longLeverage?: number;

    /** Short position leverage (if different) */
    shortLeverage?: number;

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Field Mapping Types
// ============================================================

/**
 * Field mapping for response normalization
 */
export interface FieldMapping {
    /** JSON path to extract value from response */
    path?: string;

    /** Transform function to apply */
    transform?: string;

    /** Default value if path doesn't exist */
    default?: any;

    /** Literal value (instead of extracting from response) */
    literal?: any;

    /** Computed value expression */
    compute?: string;

    /** Dependencies for computed values */
    dependencies?: string[];
}

/**
 * Response mapping configuration
 */
export interface ResponseMapping {
    /** Path to data in response (e.g., 'data.leverage') */
    path?: string;

    /** Field mappings from exchange format to CCXT format */
    mapping: Record<string, FieldMapping>;

    /** Status code mappings (exchange-specific to CCXT standard) */
    statusMap?: Record<string | number, string>;

    /** Whether response is an array */
    isArray?: boolean;
}

// ============================================================
// Margin Endpoint Schema
// ============================================================

/**
 * Margin endpoint schema definition
 */
export interface MarginEndpointSchema {
    /** Operation type */
    operation: MarginOperationType;

    /** API endpoint path (may contain {parameters}) */
    endpoint: string;

    /** HTTP method */
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';

    /** Parameter definitions */
    params: Record<string, ParamDefinition>;

    /** Response mapping configuration */
    response: ResponseMapping;

    /** Rate limit cost */
    cost?: number;

    /** Whether authentication is required */
    requiresAuth?: boolean;
}

// ============================================================
// Validation Types
// ============================================================

/**
 * Validation error for margin operations
 */
export interface MarginValidationError {
    /** Field that failed validation */
    field: string;

    /** Error message */
    message: string;

    /** Provided value */
    value?: any;
}

/**
 * Validation result
 */
export interface MarginValidationResult {
    /** Whether validation passed */
    valid: boolean;

    /** List of validation errors */
    errors: MarginValidationError[];
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate set leverage operation parameters
 */
export function validateSetLeverageOperation(
    operation: Partial<SetLeverageRequest>,
    schema: MarginEndpointSchema
): MarginValidationResult {
    const errors: MarginValidationError[] = [];

    // Validate required fields
    if (!operation.symbol) {
        errors.push({
            field: 'symbol',
            message: 'Symbol is required',
            value: operation.symbol,
        });
    }

    if (operation.leverage === undefined || operation.leverage === null) {
        errors.push({
            field: 'leverage',
            message: 'Leverage is required',
            value: operation.leverage,
        });
    }

    // Validate leverage value
    if (typeof operation.leverage === 'number') {
        if (operation.leverage < 1) {
            errors.push({
                field: 'leverage',
                message: 'Leverage must be at least 1',
                value: operation.leverage,
            });
        }

        // Check against schema constraints
        const leverageParam = schema.params.leverage;
        if (leverageParam) {
            if (leverageParam.min !== undefined && operation.leverage < leverageParam.min) {
                errors.push({
                    field: 'leverage',
                    message: `Leverage must be at least ${leverageParam.min}`,
                    value: operation.leverage,
                });
            }
            if (leverageParam.max !== undefined && operation.leverage > leverageParam.max) {
                errors.push({
                    field: 'leverage',
                    message: `Leverage must be at most ${leverageParam.max}`,
                    value: operation.leverage,
                });
            }
        }
    }

    // Validate position side if provided
    if (operation.side) {
        const validSides: PositionSide[] = ['long', 'short', 'both'];
        if (!validSides.includes(operation.side)) {
            errors.push({
                field: 'side',
                message: `Invalid position side. Must be one of: ${validSides.join(', ')}`,
                value: operation.side,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate borrow operation parameters
 */
export function validateBorrowOperation(
    operation: Partial<BorrowRequest>,
    schema: MarginEndpointSchema
): MarginValidationResult {
    const errors: MarginValidationError[] = [];

    // Validate required fields
    if (!operation.currency) {
        errors.push({
            field: 'currency',
            message: 'Currency is required',
            value: operation.currency,
        });
    }

    if (operation.amount === undefined || operation.amount === null) {
        errors.push({
            field: 'amount',
            message: 'Amount is required',
            value: operation.amount,
        });
    }

    // Validate amount value
    if (typeof operation.amount === 'number' && operation.amount <= 0) {
        errors.push({
            field: 'amount',
            message: 'Amount must be greater than 0',
            value: operation.amount,
        });
    }

    // Validate margin mode if provided
    if (operation.marginMode) {
        const validModes: MarginMode[] = ['cross', 'isolated'];
        if (!validModes.includes(operation.marginMode)) {
            errors.push({
                field: 'marginMode',
                message: `Invalid margin mode. Must be one of: ${validModes.join(', ')}`,
                value: operation.marginMode,
            });
        }

        // Isolated margin requires symbol
        if (operation.marginMode === 'isolated' && !operation.symbol) {
            errors.push({
                field: 'symbol',
                message: 'Symbol is required for isolated margin',
                value: operation.symbol,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate repay operation parameters
 */
export function validateRepayOperation(
    operation: Partial<RepayRequest>,
    schema: MarginEndpointSchema
): MarginValidationResult {
    const errors: MarginValidationError[] = [];

    // Validate required fields
    if (!operation.currency) {
        errors.push({
            field: 'currency',
            message: 'Currency is required',
            value: operation.currency,
        });
    }

    if (operation.amount === undefined || operation.amount === null) {
        errors.push({
            field: 'amount',
            message: 'Amount is required',
            value: operation.amount,
        });
    }

    // Validate amount value
    if (typeof operation.amount === 'number' && operation.amount <= 0) {
        errors.push({
            field: 'amount',
            message: 'Amount must be greater than 0',
            value: operation.amount,
        });
    }

    // Validate margin mode if provided
    if (operation.marginMode) {
        const validModes: MarginMode[] = ['cross', 'isolated'];
        if (!validModes.includes(operation.marginMode)) {
            errors.push({
                field: 'marginMode',
                message: `Invalid margin mode. Must be one of: ${validModes.join(', ')}`,
                value: operation.marginMode,
            });
        }

        // Isolated margin requires symbol
        if (operation.marginMode === 'isolated' && !operation.symbol) {
            errors.push({
                field: 'symbol',
                message: 'Symbol is required for isolated margin',
                value: operation.symbol,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate set margin mode operation parameters
 */
export function validateSetMarginModeOperation(
    operation: Partial<SetMarginModeRequest>,
    schema: MarginEndpointSchema
): MarginValidationResult {
    const errors: MarginValidationError[] = [];

    // Validate required fields
    if (!operation.marginMode) {
        errors.push({
            field: 'marginMode',
            message: 'Margin mode is required',
            value: operation.marginMode,
        });
    }

    // Validate margin mode value
    if (operation.marginMode) {
        const validModes: MarginMode[] = ['cross', 'isolated'];
        if (!validModes.includes(operation.marginMode)) {
            errors.push({
                field: 'marginMode',
                message: `Invalid margin mode. Must be one of: ${validModes.join(', ')}`,
                value: operation.marginMode,
            });
        }
    }

    // Some exchanges require symbol for margin mode changes
    if (schema.params.symbol?.required && !operation.symbol) {
        errors.push({
            field: 'symbol',
            message: 'Symbol is required for this exchange',
            value: operation.symbol,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate margin operation against schema
 */
export function validateMarginOperation(
    operation: any,
    schema: MarginEndpointSchema
): MarginValidationResult {
    switch (schema.operation) {
        case 'setLeverage':
            return validateSetLeverageOperation(operation, schema);
        case 'borrow':
            return validateBorrowOperation(operation, schema);
        case 'repay':
            return validateRepayOperation(operation, schema);
        case 'setMarginMode':
            return validateSetMarginModeOperation(operation, schema);
        case 'fetchBorrowRate':
        case 'fetchBorrowRates':
        case 'fetchLeverage':
            // Generic validation for fetch operations
            const errors: MarginValidationError[] = [];
            for (const [paramName, paramDef] of Object.entries(schema.params)) {
                if (paramDef.required && !(paramName in operation)) {
                    errors.push({
                        field: paramName,
                        message: `Required parameter '${paramName}' is missing`,
                    });
                }
            }
            return {
                valid: errors.length === 0,
                errors,
            };
        default:
            // Generic validation
            const genericErrors: MarginValidationError[] = [];
            for (const [paramName, paramDef] of Object.entries(schema.params)) {
                if (paramDef.required && !(paramName in operation)) {
                    genericErrors.push({
                        field: paramName,
                        message: `Required parameter '${paramName}' is missing`,
                    });
                }
            }
            return {
                valid: genericErrors.length === 0,
                errors: genericErrors,
            };
    }
}

// ============================================================
// Response Normalization Functions
// ============================================================

/**
 * Extract value from response using path notation
 */
function extractValue(response: any, path: string): any {
    if (!path) return response;

    const parts = path.split('.');
    let value = response;

    for (const part of parts) {
        if (value === undefined || value === null) {
            return undefined;
        }
        value = value[part];
    }

    return value;
}

/**
 * Apply transform function to value
 */
function applyTransform(value: any, transform?: string): any {
    if (!transform || value === undefined || value === null) {
        return value;
    }

    switch (transform) {
        case 'safeString':
            return value?.toString() ?? undefined;
        case 'safeNumber':
            return typeof value === 'number' ? value : parseFloat(value);
        case 'safeInteger':
            return typeof value === 'number' ? Math.floor(value) : parseInt(value, 10);
        case 'safeTimestamp':
            // Convert to milliseconds if needed
            const num = typeof value === 'number' ? value : parseInt(value, 10);
            return num > 10000000000 ? num : num * 1000;
        case 'uppercase':
            return value?.toString().toUpperCase();
        case 'lowercase':
            return value?.toString().toLowerCase();
        case 'parseRate':
            // Convert rate to decimal (e.g., 0.01% = 0.0001)
            return typeof value === 'number' ? value : parseFloat(value);
        default:
            return value;
    }
}

/**
 * Normalize margin response to CCXT format
 */
export function normalizeMarginResponse(
    response: any,
    schema: MarginEndpointSchema
): any {
    const { path, mapping, statusMap, isArray } = schema.response;

    // Extract data from response path
    let data = path ? extractValue(response, path) : response;

    // Handle array responses
    if (isArray && Array.isArray(data)) {
        return data.map(item => normalizeItem(item, mapping, statusMap));
    }

    return normalizeItem(data, mapping, statusMap);
}

/**
 * Normalize a single item from response
 */
function normalizeItem(
    item: any,
    mapping: Record<string, FieldMapping>,
    statusMap?: Record<string | number, string>
): any {
    const normalized: any = {};

    for (const [key, fieldMapping] of Object.entries(mapping)) {
        let value: any;

        if ('literal' in fieldMapping && fieldMapping.literal !== undefined) {
            // Use literal value
            value = fieldMapping.literal;
        } else if ('compute' in fieldMapping && fieldMapping.compute) {
            // Computed values are handled at runtime with access to full context
            // For now, just set undefined
            value = undefined;
        } else if ('path' in fieldMapping && fieldMapping.path) {
            // Extract from path
            value = extractValue(item, fieldMapping.path);

            // Apply transform
            if (fieldMapping.transform) {
                value = applyTransform(value, fieldMapping.transform);
            }

            // Apply default if value is undefined
            if (value === undefined && 'default' in fieldMapping) {
                value = fieldMapping.default;
            }
        }

        // Apply status mapping if this is a status field
        if (key === 'status' && statusMap && value !== undefined) {
            value = statusMap[value] ?? value;
        }

        normalized[key] = value;
    }

    // Store original response in info
    normalized.info = item;

    return normalized;
}

/**
 * Create set leverage response from normalized data
 */
export function createSetLeverageResponse(normalized: any): SetLeverageSchema {
    return {
        symbol: normalized.symbol,
        leverage: normalized.leverage,
        marginMode: normalized.marginMode,
        side: normalized.side,
        timestamp: normalized.timestamp,
        datetime: normalized.datetime,
        info: normalized.info,
    };
}

/**
 * Create borrow transaction from normalized response
 */
export function createBorrowTransaction(normalized: any): BorrowSchema {
    return {
        id: normalized.id,
        currency: normalized.currency,
        amount: normalized.amount,
        symbol: normalized.symbol,
        marginMode: normalized.marginMode,
        status: normalized.status,
        timestamp: normalized.timestamp,
        datetime: normalized.datetime,
        interestRate: normalized.interestRate,
        info: normalized.info,
    };
}

/**
 * Create repay transaction from normalized response
 */
export function createRepayTransaction(normalized: any): RepaySchema {
    return {
        id: normalized.id,
        currency: normalized.currency,
        amount: normalized.amount,
        symbol: normalized.symbol,
        marginMode: normalized.marginMode,
        status: normalized.status,
        timestamp: normalized.timestamp,
        datetime: normalized.datetime,
        interestPaid: normalized.interestPaid,
        info: normalized.info,
    };
}

/**
 * Create borrow rate from normalized response
 */
export function createBorrowRate(normalized: any): BorrowRateSchema {
    return {
        currency: normalized.currency,
        symbol: normalized.symbol,
        rate: normalized.rate,
        dailyRate: normalized.dailyRate ?? (normalized.rate ? normalized.rate * 24 : undefined),
        annualRate: normalized.annualRate ?? (normalized.rate ? normalized.rate * 24 * 365 : undefined),
        timestamp: normalized.timestamp,
        datetime: normalized.datetime,
        marginMode: normalized.marginMode,
        info: normalized.info,
    };
}

/**
 * Create margin mode response from normalized data
 */
export function createMarginModeResponse(normalized: any): MarginModeSchema {
    return {
        symbol: normalized.symbol,
        marginMode: normalized.marginMode,
        timestamp: normalized.timestamp,
        datetime: normalized.datetime,
        info: normalized.info,
    };
}

/**
 * Create leverage info from normalized response
 */
export function createLeverageInfo(normalized: any): LeverageSchema {
    return {
        symbol: normalized.symbol,
        leverage: normalized.leverage,
        maxLeverage: normalized.maxLeverage,
        minLeverage: normalized.minLeverage,
        marginMode: normalized.marginMode,
        longLeverage: normalized.longLeverage,
        shortLeverage: normalized.shortLeverage,
        info: normalized.info,
    };
}
