/**
 * Transaction Parsing Logic
 *
 * This module provides comprehensive transaction parsing functionality for wallet operations.
 * It supports parsing historical transaction data from various exchange formats into the
 * unified CCXT TransactionDefinition format.
 */

import type {
    TransactionDefinition,
    TransactionType,
    TransactionStatus,
} from '../types/edl.js';

// ============================================================
// Transaction Field Validation
// ============================================================

/**
 * Validation error for transaction fields
 */
export interface TransactionValidationError {
    /** Field name that failed validation */
    field: string;
    /** Error message */
    message: string;
    /** Value that was provided */
    value?: any;
}

/**
 * Validation result
 */
export interface TransactionValidationResult {
    /** Whether validation passed */
    valid: boolean;
    /** List of validation errors */
    errors: TransactionValidationError[];
}

/**
 * Validate transaction ID field
 * @param id Transaction ID
 * @returns Validation result
 */
export function validateTransactionId(id: any): TransactionValidationResult {
    const errors: TransactionValidationError[] = [];

    if (!id || (typeof id !== 'string' && typeof id !== 'number')) {
        errors.push({
            field: 'id',
            message: 'Transaction ID is required and must be a string or number',
            value: id,
        });
    }

    if (typeof id === 'string' && id.trim().length === 0) {
        errors.push({
            field: 'id',
            message: 'Transaction ID cannot be empty',
            value: id,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate blockchain transaction ID (txid)
 * @param txid Blockchain transaction ID
 * @param required Whether txid is required
 * @returns Validation result
 */
export function validateTxid(txid: any, required: boolean = false): TransactionValidationResult {
    const errors: TransactionValidationError[] = [];

    if (required && !txid) {
        errors.push({
            field: 'txid',
            message: 'Blockchain transaction ID is required',
            value: txid,
        });
    }

    if (txid !== undefined && txid !== null && typeof txid !== 'string') {
        errors.push({
            field: 'txid',
            message: 'Blockchain transaction ID must be a string',
            value: txid,
        });
    }

    if (typeof txid === 'string' && txid.trim().length === 0) {
        errors.push({
            field: 'txid',
            message: 'Blockchain transaction ID cannot be empty string',
            value: txid,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate currency code
 * @param currency Currency code
 * @returns Validation result
 */
export function validateCurrency(currency: any): TransactionValidationResult {
    const errors: TransactionValidationError[] = [];

    if (!currency || typeof currency !== 'string') {
        errors.push({
            field: 'currency',
            message: 'Currency is required and must be a string',
            value: currency,
        });
        return { valid: false, errors };
    }

    if (currency.trim().length === 0) {
        errors.push({
            field: 'currency',
            message: 'Currency cannot be empty',
            value: currency,
        });
    }

    // Currency codes are typically uppercase alphanumeric
    if (!/^[A-Z0-9]+$/i.test(currency)) {
        errors.push({
            field: 'currency',
            message: 'Currency must be alphanumeric',
            value: currency,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate transaction amount
 * @param amount Transaction amount
 * @returns Validation result
 */
export function validateAmount(amount: any): TransactionValidationResult {
    const errors: TransactionValidationError[] = [];

    if (amount === undefined || amount === null) {
        errors.push({
            field: 'amount',
            message: 'Amount is required',
            value: amount,
        });
        return { valid: false, errors };
    }

    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);

    if (isNaN(numAmount)) {
        errors.push({
            field: 'amount',
            message: 'Amount must be a valid number',
            value: amount,
        });
        return { valid: false, errors };
    }

    if (numAmount < 0) {
        errors.push({
            field: 'amount',
            message: 'Amount cannot be negative',
            value: amount,
        });
    }

    if (!isFinite(numAmount)) {
        errors.push({
            field: 'amount',
            message: 'Amount must be finite',
            value: amount,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate transaction status
 * @param status Transaction status
 * @returns Validation result
 */
export function validateStatus(status: any): TransactionValidationResult {
    const errors: TransactionValidationError[] = [];
    const validStatuses: TransactionStatus[] = ['pending', 'ok', 'failed', 'canceled'];

    if (!status) {
        errors.push({
            field: 'status',
            message: 'Status is required',
            value: status,
        });
        return { valid: false, errors };
    }

    if (!validStatuses.includes(status)) {
        errors.push({
            field: 'status',
            message: `Status must be one of: ${validStatuses.join(', ')}`,
            value: status,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate transaction timestamp
 * @param timestamp Timestamp in milliseconds
 * @param required Whether timestamp is required
 * @returns Validation result
 */
export function validateTimestamp(timestamp: any, required: boolean = false): TransactionValidationResult {
    const errors: TransactionValidationError[] = [];

    if (required && (timestamp === undefined || timestamp === null)) {
        errors.push({
            field: 'timestamp',
            message: 'Timestamp is required',
            value: timestamp,
        });
        return { valid: false, errors };
    }

    if (timestamp === undefined || timestamp === null) {
        return { valid: true, errors: [] };
    }

    const numTimestamp = typeof timestamp === 'number' ? timestamp : parseInt(timestamp, 10);

    if (isNaN(numTimestamp)) {
        errors.push({
            field: 'timestamp',
            message: 'Timestamp must be a valid number',
            value: timestamp,
        });
        return { valid: false, errors };
    }

    if (numTimestamp < 0) {
        errors.push({
            field: 'timestamp',
            message: 'Timestamp cannot be negative',
            value: timestamp,
        });
    }

    // Check if timestamp is reasonable (between 2010 and 2100)
    const minTimestamp = 1262304000000; // 2010-01-01
    const maxTimestamp = 4102444800000; // 2100-01-01

    if (numTimestamp < minTimestamp || numTimestamp > maxTimestamp) {
        // Could be in seconds, check that
        if (numTimestamp < 10000000000) {
            // Likely in seconds, not an error but we note it
        } else {
            errors.push({
                field: 'timestamp',
                message: 'Timestamp is outside reasonable range',
                value: timestamp,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate transaction fee
 * @param fee Transaction fee object
 * @param required Whether fee is required
 * @returns Validation result
 */
export function validateFee(fee: any, required: boolean = false): TransactionValidationResult {
    const errors: TransactionValidationError[] = [];

    if (required && !fee) {
        errors.push({
            field: 'fee',
            message: 'Fee is required',
            value: fee,
        });
        return { valid: false, errors };
    }

    if (!fee) {
        return { valid: true, errors: [] };
    }

    if (typeof fee !== 'object') {
        errors.push({
            field: 'fee',
            message: 'Fee must be an object with cost and currency',
            value: fee,
        });
        return { valid: false, errors };
    }

    // Validate fee.cost
    if (fee.cost === undefined || fee.cost === null) {
        errors.push({
            field: 'fee.cost',
            message: 'Fee cost is required',
            value: fee.cost,
        });
    } else {
        const numCost = typeof fee.cost === 'number' ? fee.cost : parseFloat(fee.cost);
        if (isNaN(numCost) || numCost < 0) {
            errors.push({
                field: 'fee.cost',
                message: 'Fee cost must be a non-negative number',
                value: fee.cost,
            });
        }
    }

    // Validate fee.currency
    if (!fee.currency || typeof fee.currency !== 'string') {
        errors.push({
            field: 'fee.currency',
            message: 'Fee currency is required and must be a string',
            value: fee.currency,
        });
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================================
// Transaction Parser Class
// ============================================================

/**
 * Configuration for transaction parsing
 */
export interface TransactionParserConfig {
    /** Exchange-specific field mappings */
    fieldMappings?: Record<string, string>;
    /** Status code mappings (exchange-specific to CCXT standard) */
    statusMappings?: Record<string | number, TransactionStatus>;
    /** Type mappings (exchange-specific to CCXT standard) */
    typeMappings?: Record<string | number, TransactionType>;
    /** Transform functions for specific fields */
    transforms?: Record<string, (value: any) => any>;
}

/**
 * Transaction Parser class for parsing exchange-specific transaction data
 */
export class TransactionParser {
    private config: TransactionParserConfig;

    /**
     * Create a new transaction parser
     * @param config Parser configuration
     */
    constructor(config: TransactionParserConfig = {}) {
        this.config = config;
    }

    /**
     * Parse a single transaction from exchange-specific format
     * @param data Raw transaction data from exchange
     * @param type Transaction type (deposit, withdrawal, transfer)
     * @returns Parsed transaction definition
     */
    parse(data: any, type: TransactionType): TransactionDefinition {
        if (!data || typeof data !== 'object') {
            throw new Error('Transaction data must be an object');
        }

        const transaction: TransactionDefinition = {
            id: this.extractField(data, 'id'),
            txid: this.extractField(data, 'txid') || null,
            type,
            currency: this.extractField(data, 'currency'),
            amount: this.parseNumber(this.extractField(data, 'amount')),
            status: this.parseStatus(this.extractField(data, 'status')),
            address: this.extractField(data, 'address') || null,
            addressFrom: this.extractField(data, 'addressFrom') || null,
            addressTo: this.extractField(data, 'addressTo') || null,
            tag: this.extractField(data, 'tag') || null,
            tagFrom: this.extractField(data, 'tagFrom') || null,
            tagTo: this.extractField(data, 'tagTo') || null,
            network: this.extractField(data, 'network') || null,
            fee: this.parseFee(data),
            timestamp: this.parseTimestamp(this.extractField(data, 'timestamp')),
            datetime: this.extractField(data, 'datetime') || null,
            updated: this.parseTimestamp(this.extractField(data, 'updated')),
            comment: this.extractField(data, 'comment') || null,
            internal: this.parseBoolean(this.extractField(data, 'internal')),
            info: data, // Store original data
        };

        return transaction;
    }

    /**
     * Parse multiple transactions
     * @param dataArray Array of raw transaction data
     * @param type Transaction type
     * @returns Array of parsed transactions
     */
    parseMultiple(dataArray: any[], type: TransactionType): TransactionDefinition[] {
        if (!Array.isArray(dataArray)) {
            throw new Error('Transaction data must be an array');
        }

        return dataArray.map(data => this.parse(data, type));
    }

    /**
     * Validate a parsed transaction
     * @param transaction Parsed transaction
     * @returns Validation result
     */
    validate(transaction: Partial<TransactionDefinition>): TransactionValidationResult {
        const errors: TransactionValidationError[] = [];

        // Validate required fields
        const idValidation = validateTransactionId(transaction.id);
        errors.push(...idValidation.errors);

        const currencyValidation = validateCurrency(transaction.currency);
        errors.push(...currencyValidation.errors);

        const amountValidation = validateAmount(transaction.amount);
        errors.push(...amountValidation.errors);

        const statusValidation = validateStatus(transaction.status);
        errors.push(...statusValidation.errors);

        // Validate type
        const validTypes: TransactionType[] = ['deposit', 'withdrawal', 'transfer'];
        if (!transaction.type || !validTypes.includes(transaction.type)) {
            errors.push({
                field: 'type',
                message: `Type must be one of: ${validTypes.join(', ')}`,
                value: transaction.type,
            });
        }

        // Validate optional fields if present
        if (transaction.txid !== undefined && transaction.txid !== null) {
            const txidValidation = validateTxid(transaction.txid, false);
            errors.push(...txidValidation.errors);
        }

        if (transaction.timestamp !== undefined && transaction.timestamp !== null) {
            const timestampValidation = validateTimestamp(transaction.timestamp, false);
            errors.push(...timestampValidation.errors);
        }

        if (transaction.fee !== undefined && transaction.fee !== null) {
            const feeValidation = validateFee(transaction.fee, false);
            errors.push(...feeValidation.errors);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Extract field from data using field mappings
     * @param data Source data
     * @param field Field name
     * @returns Extracted value
     */
    private extractField(data: any, field: string): any {
        // Check if there's a custom mapping for this field
        const mappedField = this.config.fieldMappings?.[field] || field;

        // Support dot notation for nested fields
        const value = this.getNestedValue(data, mappedField);

        // Apply transform if configured
        if (this.config.transforms?.[field]) {
            return this.config.transforms[field](value);
        }

        return value;
    }

    /**
     * Get nested value from object using dot notation
     * @param obj Source object
     * @param path Dot-notation path
     * @returns Value at path or undefined
     */
    private getNestedValue(obj: any, path: string): any {
        if (!path) return obj;

        const parts = path.split('.');
        let value = obj;

        for (const part of parts) {
            if (value === undefined || value === null) {
                return undefined;
            }
            value = value[part];
        }

        return value;
    }

    /**
     * Parse numeric value
     * @param value Raw value
     * @returns Parsed number
     */
    private parseNumber(value: any): number {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    /**
     * Parse status value
     * @param value Raw status value
     * @returns Normalized status
     */
    private parseStatus(value: any): TransactionStatus {
        if (!value) {
            return 'pending';
        }

        // Check custom status mappings
        if (this.config.statusMappings) {
            const mapped = this.config.statusMappings[value];
            if (mapped) {
                return mapped;
            }
        }

        // Try to normalize common status values
        const strValue = String(value).toLowerCase();
        if (strValue.includes('success') || strValue.includes('complete') || strValue === 'ok') {
            return 'ok';
        }
        if (strValue.includes('fail')) {
            return 'failed';
        }
        if (strValue.includes('cancel')) {
            return 'canceled';
        }
        if (strValue.includes('pending') || strValue.includes('processing')) {
            return 'pending';
        }

        // Default to pending if unknown
        return 'pending';
    }

    /**
     * Parse timestamp value (converts to milliseconds)
     * @param value Raw timestamp value
     * @returns Timestamp in milliseconds or null
     */
    private parseTimestamp(value: any): number | null {
        if (value === undefined || value === null) {
            return null;
        }

        let numValue: number;

        if (typeof value === 'number') {
            numValue = value;
        } else if (typeof value === 'string') {
            numValue = parseInt(value, 10);
            if (isNaN(numValue)) {
                // Try parsing as ISO8601
                numValue = Date.parse(value);
            }
        } else {
            return null;
        }

        if (isNaN(numValue)) {
            return null;
        }

        // Convert seconds to milliseconds if needed
        if (numValue < 10000000000) {
            numValue = numValue * 1000;
        }

        return numValue;
    }

    /**
     * Parse fee from transaction data
     * @param data Transaction data
     * @returns Fee object or undefined
     */
    private parseFee(data: any): { cost: number; currency: string } | undefined {
        const feeValue = this.extractField(data, 'fee');

        if (!feeValue) {
            return undefined;
        }

        // If fee is already an object with cost and currency
        if (typeof feeValue === 'object' && feeValue.cost !== undefined) {
            return {
                cost: this.parseNumber(feeValue.cost),
                currency: feeValue.currency || data.currency || 'UNKNOWN',
            };
        }

        // If fee is just a number
        if (typeof feeValue === 'number' || typeof feeValue === 'string') {
            return {
                cost: this.parseNumber(feeValue),
                currency: data.currency || 'UNKNOWN',
            };
        }

        return undefined;
    }

    /**
     * Parse boolean value
     * @param value Raw value
     * @returns Boolean value
     */
    private parseBoolean(value: any): boolean {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        return false;
    }
}

// ============================================================
// Exchange-Specific Parsers
// ============================================================

/**
 * Create a parser for Binance transactions
 * @returns Configured parser for Binance
 */
export function createBinanceParser(): TransactionParser {
    return new TransactionParser({
        fieldMappings: {
            id: 'id',
            txid: 'txId',
            currency: 'coin',
            amount: 'amount',
            status: 'status',
            address: 'address',
            tag: 'addressTag',
            network: 'network',
            fee: 'transactionFee',
            timestamp: 'insertTime',
        },
        statusMappings: {
            0: 'pending',
            1: 'ok',
            2: 'canceled',
            3: 'failed',
            4: 'pending',
            5: 'pending',
            6: 'ok',
        },
    });
}

/**
 * Create a parser for Kraken transactions
 * @returns Configured parser for Kraken
 */
export function createKrakenParser(): TransactionParser {
    return new TransactionParser({
        fieldMappings: {
            id: 'refid',
            txid: 'txid',
            currency: 'asset',
            amount: 'amount',
            status: 'status',
            address: 'info',
            network: 'method',
            fee: 'fee',
            timestamp: 'time',
        },
        statusMappings: {
            'Success': 'ok',
            'Pending': 'pending',
            'Failed': 'failed',
            'Failure': 'failed',
        },
        transforms: {
            timestamp: (value: any) => {
                // Kraken uses seconds
                const num = typeof value === 'number' ? value : parseFloat(value);
                return isNaN(num) ? null : num * 1000;
            },
        },
    });
}

/**
 * Create a parser for generic exchange transactions
 * @returns Generic transaction parser
 */
export function createGenericParser(): TransactionParser {
    return new TransactionParser();
}
