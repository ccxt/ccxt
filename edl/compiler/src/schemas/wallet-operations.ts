/**
 * Wallet Operations Schema Types and Utilities
 *
 * This module provides comprehensive schema definitions for wallet operations,
 * including deposit addresses, withdrawals, transfers, and balances.
 * Ensures alignment with historical transaction formats and CCXT standards.
 */

import type { ParamDefinition, ParamType, ParamLocation } from '../types/edl.js';

// ============================================================
// Account and Status Types
// ============================================================

/**
 * Account types supported across exchanges
 */
export type AccountType = 'spot' | 'margin' | 'futures' | 'funding' | 'earn' | 'options';

/**
 * Withdrawal status values (CCXT standard)
 */
export type WithdrawalStatus = 'pending' | 'processing' | 'ok' | 'failed' | 'canceled';

/**
 * Transfer status values (CCXT standard)
 */
export type TransferStatus = 'pending' | 'ok' | 'failed';

/**
 * Wallet operation types
 */
export type WalletOperationType = 'deposit' | 'withdraw' | 'transfer' | 'balance' | 'depositAddress';

// ============================================================
// Deposit Address Schema
// ============================================================

/**
 * Deposit address schema aligned with CCXT format
 */
export interface DepositAddressSchema {
    /** Currency code (e.g., 'BTC', 'ETH') */
    currency: string;

    /** Network identifier (e.g., 'ERC20', 'TRC20', 'BTC') */
    network?: string;

    /** Deposit address */
    address: string;

    /** Tag/memo for chains that require it (e.g., XRP, XLM) */
    tag?: string;

    /** Tag field name ('memo', 'tag', 'payment_id', 'destination_tag') */
    tagName?: string;

    /** Additional metadata */
    info?: any;
}

// ============================================================
// Withdrawal Schema
// ============================================================

/**
 * Fee structure for withdrawals
 */
export interface WithdrawalFee {
    /** Fee amount */
    cost: number;

    /** Fee currency (usually same as withdrawal currency) */
    currency: string;
}

/**
 * Withdrawal schema aligned with CCXT format
 */
export interface WithdrawalSchema {
    /** Unique withdrawal identifier */
    id: string;

    /** Currency being withdrawn */
    currency: string;

    /** Amount to withdraw (before fees) */
    amount: number;

    /** Destination address */
    address: string;

    /** Destination tag/memo if required */
    tag?: string;

    /** Network used for withdrawal */
    network?: string;

    /** Withdrawal fee details */
    fee?: WithdrawalFee;

    /** Withdrawal status */
    status: WithdrawalStatus;

    /** Blockchain transaction ID (once confirmed) */
    txid?: string;

    /** Timestamp when withdrawal was initiated (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Transfer Schema
// ============================================================

/**
 * Internal transfer schema (between exchange accounts)
 */
export interface TransferSchema {
    /** Unique transfer identifier */
    id: string;

    /** Currency being transferred */
    currency: string;

    /** Transfer amount */
    amount: number;

    /** Source account type */
    fromAccount: AccountType;

    /** Destination account type */
    toAccount: AccountType;

    /** Transfer status */
    status: TransferStatus;

    /** Timestamp when transfer was initiated (milliseconds) */
    timestamp?: number;

    /** ISO8601 datetime string */
    datetime?: string;

    /** Transfer fee (if any) */
    fee?: {
        cost: number;
        currency: string;
    };

    /** Additional metadata from exchange */
    info?: any;
}

// ============================================================
// Balance Schema
// ============================================================

/**
 * Balance schema for a single currency
 */
export interface BalanceSchema {
    /** Currency code */
    currency: string;

    /** Available balance (can be used for trading/withdrawal) */
    free: number;

    /** Balance locked in orders or pending operations */
    used: number;

    /** Total balance (free + used) */
    total: number;

    /** Debt amount (for margin accounts) */
    debt?: number;
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
    /** Path to data in response (e.g., 'data.deposits') */
    path?: string;

    /** Field mappings from exchange format to CCXT format */
    mapping: Record<string, FieldMapping>;

    /** Status code mappings (exchange-specific to CCXT standard) */
    statusMap?: Record<string | number, string>;

    /** Whether response is an array */
    isArray?: boolean;
}

// ============================================================
// Wallet Endpoint Schema
// ============================================================

/**
 * Wallet endpoint schema definition
 */
export interface WalletEndpointSchema {
    /** Operation type */
    operation: WalletOperationType;

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
 * Validation error for wallet operations
 */
export interface WalletValidationError {
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
export interface WalletValidationResult {
    /** Whether validation passed */
    valid: boolean;

    /** List of validation errors */
    errors: WalletValidationError[];
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validate withdrawal operation parameters
 */
export function validateWithdrawalOperation(
    operation: Partial<WithdrawalSchema>,
    schema: WalletEndpointSchema
): WalletValidationResult {
    const errors: WalletValidationError[] = [];

    // Validate required fields
    if (!operation.currency) {
        errors.push({
            field: 'currency',
            message: 'Currency is required',
            value: operation.currency,
        });
    }

    if (!operation.address) {
        errors.push({
            field: 'address',
            message: 'Address is required',
            value: operation.address,
        });
    }

    if (operation.amount === undefined || operation.amount <= 0) {
        errors.push({
            field: 'amount',
            message: 'Amount must be greater than 0',
            value: operation.amount,
        });
    }

    // Validate against schema params
    for (const [paramName, paramDef] of Object.entries(schema.params)) {
        if (paramDef.required && !(paramName in operation)) {
            errors.push({
                field: paramName,
                message: `Required parameter '${paramName}' is missing`,
            });
        }

        // Validate enum values
        if (paramDef.enum && paramName in operation) {
            const value = (operation as any)[paramName];
            if (!paramDef.enum.includes(value)) {
                errors.push({
                    field: paramName,
                    message: `Invalid value for '${paramName}'. Must be one of: ${paramDef.enum.join(', ')}`,
                    value,
                });
            }
        }

        // Validate min/max for numbers
        if ((paramDef.type === 'number' || paramDef.type === 'float' || paramDef.type === 'integer') && paramName in operation) {
            const value = (operation as any)[paramName];
            if (typeof value === 'number') {
                if (paramDef.min !== undefined && value < paramDef.min) {
                    errors.push({
                        field: paramName,
                        message: `Value for '${paramName}' must be at least ${paramDef.min}`,
                        value,
                    });
                }
                if (paramDef.max !== undefined && value > paramDef.max) {
                    errors.push({
                        field: paramName,
                        message: `Value for '${paramName}' must be at most ${paramDef.max}`,
                        value,
                    });
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate transfer operation parameters
 */
export function validateTransferOperation(
    operation: Partial<TransferSchema>,
    schema: WalletEndpointSchema
): WalletValidationResult {
    const errors: WalletValidationError[] = [];

    // Validate required fields
    if (!operation.currency) {
        errors.push({
            field: 'currency',
            message: 'Currency is required',
            value: operation.currency,
        });
    }

    if (!operation.fromAccount) {
        errors.push({
            field: 'fromAccount',
            message: 'Source account is required',
            value: operation.fromAccount,
        });
    }

    if (!operation.toAccount) {
        errors.push({
            field: 'toAccount',
            message: 'Destination account is required',
            value: operation.toAccount,
        });
    }

    if (operation.amount === undefined || operation.amount <= 0) {
        errors.push({
            field: 'amount',
            message: 'Amount must be greater than 0',
            value: operation.amount,
        });
    }

    // Validate account types
    const validAccountTypes: AccountType[] = ['spot', 'margin', 'futures', 'funding', 'earn', 'options'];

    if (operation.fromAccount && !validAccountTypes.includes(operation.fromAccount)) {
        errors.push({
            field: 'fromAccount',
            message: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}`,
            value: operation.fromAccount,
        });
    }

    if (operation.toAccount && !validAccountTypes.includes(operation.toAccount)) {
        errors.push({
            field: 'toAccount',
            message: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}`,
            value: operation.toAccount,
        });
    }

    // Prevent same-account transfers
    if (operation.fromAccount && operation.toAccount && operation.fromAccount === operation.toAccount) {
        errors.push({
            field: 'toAccount',
            message: 'Cannot transfer to the same account',
            value: operation.toAccount,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate deposit address request
 */
export function validateDepositAddressRequest(
    currency: string,
    network?: string
): WalletValidationResult {
    const errors: WalletValidationError[] = [];

    if (!currency || currency.trim().length === 0) {
        errors.push({
            field: 'currency',
            message: 'Currency is required and cannot be empty',
            value: currency,
        });
    }

    // Validate currency format (uppercase alphanumeric)
    if (currency && !/^[A-Z0-9]+$/.test(currency)) {
        errors.push({
            field: 'currency',
            message: 'Currency must be uppercase alphanumeric',
            value: currency,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate wallet operation against schema
 */
export function validateWalletOperation(
    operation: any,
    schema: WalletEndpointSchema
): WalletValidationResult {
    switch (schema.operation) {
        case 'withdraw':
            return validateWithdrawalOperation(operation, schema);
        case 'transfer':
            return validateTransferOperation(operation, schema);
        case 'depositAddress':
            return validateDepositAddressRequest(operation.currency, operation.network);
        default:
            // Generic validation for other operations
            const errors: WalletValidationError[] = [];
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
        default:
            return value;
    }
}

/**
 * Normalize wallet response to CCXT format
 */
export function normalizeWalletResponse(
    response: any,
    schema: WalletEndpointSchema
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
 * Create deposit address from normalized response
 */
export function createDepositAddress(normalized: any): DepositAddressSchema {
    return {
        currency: normalized.currency,
        network: normalized.network,
        address: normalized.address,
        tag: normalized.tag,
        tagName: normalized.tagName,
        info: normalized.info,
    };
}

/**
 * Create withdrawal from normalized response
 */
export function createWithdrawal(normalized: any): WithdrawalSchema {
    return {
        id: normalized.id,
        currency: normalized.currency,
        amount: normalized.amount,
        address: normalized.address,
        tag: normalized.tag,
        network: normalized.network,
        fee: normalized.fee ? {
            cost: normalized.fee,
            currency: normalized.currency,
        } : undefined,
        status: normalized.status,
        txid: normalized.txid,
        timestamp: normalized.timestamp,
        datetime: normalized.datetime,
        info: normalized.info,
    };
}

/**
 * Create transfer from normalized response
 */
export function createTransfer(normalized: any): TransferSchema {
    return {
        id: normalized.id,
        currency: normalized.currency,
        amount: normalized.amount,
        fromAccount: normalized.fromAccount,
        toAccount: normalized.toAccount,
        status: normalized.status,
        timestamp: normalized.timestamp,
        datetime: normalized.datetime,
        fee: normalized.fee,
        info: normalized.info,
    };
}

/**
 * Create balance from normalized response
 */
export function createBalance(normalized: any): BalanceSchema {
    return {
        currency: normalized.currency,
        free: normalized.free ?? 0,
        used: normalized.used ?? 0,
        total: normalized.total ?? (normalized.free ?? 0) + (normalized.used ?? 0),
        debt: normalized.debt,
    };
}
