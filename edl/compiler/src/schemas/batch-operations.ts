/**
 * Batch Operations Schema
 * Defines batch order operations including bulk create, bulk cancel, and cancelAllAfter
 */

import {
    OrderType,
    OrderSide,
    TimeInForce,
    ParamType,
    ParamLocation,
} from '../types/edl.js';
import { ParameterMapping } from './order-endpoints.js';

// ============================================================
// Batch Operation Types
// ============================================================

/**
 * Supported batch operation types
 */
export type BatchOperationType = 'bulkCreate' | 'bulkCancel' | 'cancelAllAfter';

/**
 * Batch operation result status
 */
export type BatchOperationStatus = 'success' | 'partial' | 'failed';

/**
 * Individual operation result status
 */
export type OperationStatus = 'success' | 'failed' | 'pending';

// ============================================================
// Bulk Create Orders Schema
// ============================================================

/**
 * Single order in bulk create request
 */
export interface BulkCreateOrderItem {
    /** Trading pair symbol */
    symbol: string;
    /** Order side */
    side: OrderSide;
    /** Order type */
    type: OrderType;
    /** Order amount */
    amount: number;
    /** Order price (required for limit orders) */
    price?: number;
    /** Stop/trigger price */
    stopPrice?: number;
    /** Time in force */
    timeInForce?: TimeInForce;
    /** Client-provided order ID */
    clientOrderId?: string;
    /** Post-only flag */
    postOnly?: boolean;
    /** Reduce-only flag */
    reduceOnly?: boolean;
    /** Additional parameters */
    params?: Record<string, any>;
}

/**
 * Bulk create orders request schema
 */
export interface BulkCreateOrdersSchema {
    /** Operation type */
    operation: 'bulkCreate';
    /** Array of orders to create */
    orders: BulkCreateOrderItem[];
    /** Maximum number of orders per batch (exchange-specific) */
    maxBatchSize?: number;
    /** Whether to fail entire batch if any order fails */
    atomicMode?: boolean;
    /** Additional request parameters */
    params?: Record<string, any>;
}

// ============================================================
// Bulk Cancel Orders Schema
// ============================================================

/**
 * Cancellation criteria for filtering orders
 */
export interface CancellationCriteria {
    /** Symbol to cancel orders for */
    symbol?: string;
    /** Order side filter */
    side?: OrderSide;
    /** Order type filter */
    type?: OrderType;
    /** Market type filter */
    marketType?: 'spot' | 'margin' | 'swap' | 'future';
    /** Only cancel orders created before this timestamp */
    createdBefore?: number;
    /** Only cancel orders created after this timestamp */
    createdAfter?: number;
    /** Custom filter expression */
    customFilter?: string;
}

/**
 * Bulk cancel orders request schema
 */
export interface BulkCancelOrdersSchema {
    /** Operation type */
    operation: 'bulkCancel';
    /** Specific order IDs to cancel */
    orderIds?: string[];
    /** Client order IDs to cancel */
    clientOrderIds?: string[];
    /** Cancellation criteria (alternative to specific IDs) */
    criteria?: CancellationCriteria;
    /** Symbol (required by some exchanges) */
    symbol?: string;
    /** Maximum number of orders to cancel per batch */
    maxBatchSize?: number;
    /** Whether to fail entire batch if any cancellation fails */
    atomicMode?: boolean;
    /** Additional request parameters */
    params?: Record<string, any>;
}

// ============================================================
// Cancel All After Schema
// ============================================================

/**
 * Cancel all after (dead man's switch) request schema
 */
export interface CancelAllAfterSchema {
    /** Operation type */
    operation: 'cancelAllAfter';
    /** Timeout in milliseconds after which all orders are canceled */
    timeout: number;
    /** Symbol to apply cancellation to (if exchange supports it) */
    symbol?: string;
    /** Market type filter */
    marketType?: 'spot' | 'margin' | 'swap' | 'future';
    /** Whether to cancel all orders immediately (timeout = 0) */
    cancelNow?: boolean;
    /** Additional request parameters */
    params?: Record<string, any>;
}

// ============================================================
// Batch Operation Interface
// ============================================================

/**
 * Generic batch order operation
 */
export interface BatchOrderOperation {
    /** Batch operation type */
    type: BatchOperationType;
    /** Operation payload */
    payload: BulkCreateOrdersSchema | BulkCancelOrdersSchema | CancelAllAfterSchema;
    /** API endpoint for this operation */
    endpoint?: string;
    /** HTTP method */
    httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    /** Rate limit cost */
    cost?: number;
}

// ============================================================
// Batch Operation Result Types
// ============================================================

/**
 * Result for a single operation within a batch
 */
export interface SingleOperationResult {
    /** Operation status */
    status: OperationStatus;
    /** Order ID (for successful creates) */
    orderId?: string;
    /** Client order ID */
    clientOrderId?: string;
    /** Symbol */
    symbol?: string;
    /** Error message (if failed) */
    error?: string;
    /** Error code (if failed) */
    errorCode?: string;
    /** Original request data */
    request?: any;
    /** Response data */
    response?: any;
}

/**
 * Batch operation result with partial success/failure handling
 */
export interface BatchOperationResult {
    /** Overall batch status */
    status: BatchOperationStatus;
    /** Total number of operations requested */
    totalRequested: number;
    /** Number of successful operations */
    successCount: number;
    /** Number of failed operations */
    failureCount: number;
    /** Number of pending operations */
    pendingCount: number;
    /** Individual operation results */
    results: SingleOperationResult[];
    /** Overall error message (if batch completely failed) */
    error?: string;
    /** Timestamp of batch execution */
    timestamp?: number;
    /** Rate limit information */
    rateLimit?: {
        remaining: number;
        limit: number;
        reset: number;
    };
}

// ============================================================
// Batch Endpoint Configuration
// ============================================================

/**
 * Batch endpoint configuration
 */
export interface BatchEndpointConfig {
    /** Batch operation type */
    type: BatchOperationType;
    /** API endpoint path */
    endpoint: string;
    /** HTTP method */
    httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    /** Maximum batch size supported by exchange */
    maxBatchSize: number;
    /** Minimum batch size (some exchanges require minimum) */
    minBatchSize?: number;
    /** Whether exchange supports atomic batch operations */
    supportsAtomic?: boolean;
    /** Whether exchange supports partial success */
    supportsPartialSuccess?: boolean;
    /** Parameter mappings for batch request */
    parameterMappings?: Record<string, ParameterMapping>;
    /** Required parameters */
    requiredParams?: string[];
    /** Optional parameters */
    optionalParams?: string[];
    /** Rate limit cost per batch */
    batchCost?: number;
    /** Rate limit cost per item in batch */
    itemCost?: number;
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validation result for batch operations
 */
export interface BatchValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
}

/**
 * Validate bulk create orders request
 */
export function validateBulkCreateOrders(
    schema: BulkCreateOrdersSchema,
    config?: BatchEndpointConfig
): BatchValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate orders array
    if (!schema.orders || !Array.isArray(schema.orders)) {
        errors.push('Orders must be an array');
        return { valid: false, errors, warnings };
    }

    if (schema.orders.length === 0) {
        errors.push('Orders array cannot be empty');
    }

    // Validate batch size
    if (config) {
        if (config.maxBatchSize && schema.orders.length > config.maxBatchSize) {
            errors.push(`Batch size ${schema.orders.length} exceeds maximum ${config.maxBatchSize}`);
        }
        if (config.minBatchSize && schema.orders.length < config.minBatchSize) {
            errors.push(`Batch size ${schema.orders.length} is below minimum ${config.minBatchSize}`);
        }
    }

    if (schema.maxBatchSize && schema.orders.length > schema.maxBatchSize) {
        errors.push(`Batch size ${schema.orders.length} exceeds specified maximum ${schema.maxBatchSize}`);
    }

    // Validate each order
    schema.orders.forEach((order, index) => {
        const orderErrors = validateBulkCreateOrderItem(order, index);
        errors.push(...orderErrors);
    });

    // Warn about atomic mode without exchange support
    if (schema.atomicMode && config && !config.supportsAtomic) {
        warnings.push('Exchange does not support atomic batch operations; atomicMode may be ignored');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate a single order in bulk create request
 */
function validateBulkCreateOrderItem(order: BulkCreateOrderItem, index: number): string[] {
    const errors: string[] = [];
    const prefix = `Order ${index}:`;

    // Required fields
    if (!order.symbol) {
        errors.push(`${prefix} symbol is required`);
    }
    if (!order.side) {
        errors.push(`${prefix} side is required`);
    }
    if (!order.type) {
        errors.push(`${prefix} type is required`);
    }
    if (order.amount === undefined || order.amount === null) {
        errors.push(`${prefix} amount is required`);
    }
    if (order.amount !== undefined && order.amount <= 0) {
        errors.push(`${prefix} amount must be greater than 0`);
    }

    // Type-specific validation
    if (order.type === 'limit' || order.type === 'stopLimit') {
        if (order.price === undefined || order.price === null) {
            errors.push(`${prefix} price is required for ${order.type} orders`);
        }
        if (order.price !== undefined && order.price <= 0) {
            errors.push(`${prefix} price must be greater than 0`);
        }
    }

    if (order.type === 'stop' || order.type === 'stopLimit' || order.type === 'stopMarket') {
        if (!order.stopPrice) {
            errors.push(`${prefix} stopPrice is required for ${order.type} orders`);
        }
        if (order.stopPrice !== undefined && order.stopPrice <= 0) {
            errors.push(`${prefix} stopPrice must be greater than 0`);
        }
    }

    return errors;
}

/**
 * Validate bulk cancel orders request
 */
export function validateBulkCancelOrders(
    schema: BulkCancelOrdersSchema,
    config?: BatchEndpointConfig
): BatchValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Must have either orderIds, clientOrderIds, or criteria
    const hasOrderIds = schema.orderIds && schema.orderIds.length > 0;
    const hasClientOrderIds = schema.clientOrderIds && schema.clientOrderIds.length > 0;
    const hasCriteria = schema.criteria && Object.keys(schema.criteria).length > 0;

    if (!hasOrderIds && !hasClientOrderIds && !hasCriteria) {
        errors.push('Must provide orderIds, clientOrderIds, or cancellation criteria');
    }

    // Validate orderIds
    if (schema.orderIds) {
        if (!Array.isArray(schema.orderIds)) {
            errors.push('orderIds must be an array');
        } else if (schema.orderIds.length === 0) {
            warnings.push('orderIds array is empty');
        }

        // Check batch size
        if (config && config.maxBatchSize && schema.orderIds.length > config.maxBatchSize) {
            errors.push(`Number of orderIds ${schema.orderIds.length} exceeds maximum ${config.maxBatchSize}`);
        }
    }

    // Validate clientOrderIds
    if (schema.clientOrderIds) {
        if (!Array.isArray(schema.clientOrderIds)) {
            errors.push('clientOrderIds must be an array');
        } else if (schema.clientOrderIds.length === 0) {
            warnings.push('clientOrderIds array is empty');
        }
    }

    // Validate criteria
    if (schema.criteria) {
        const criteriaErrors = validateCancellationCriteria(schema.criteria);
        errors.push(...criteriaErrors);
    }

    // Warn about atomic mode without exchange support
    if (schema.atomicMode && config && !config.supportsAtomic) {
        warnings.push('Exchange does not support atomic batch operations; atomicMode may be ignored');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate cancellation criteria
 */
function validateCancellationCriteria(criteria: CancellationCriteria): string[] {
    const errors: string[] = [];

    // Validate timestamps
    if (criteria.createdBefore !== undefined && criteria.createdBefore <= 0) {
        errors.push('createdBefore must be a positive timestamp');
    }
    if (criteria.createdAfter !== undefined && criteria.createdAfter <= 0) {
        errors.push('createdAfter must be a positive timestamp');
    }
    // createdBefore should be greater than createdAfter to form a valid time range
    // e.g., createdAfter: 1000, createdBefore: 2000 means "between 1000 and 2000"
    if (
        criteria.createdBefore !== undefined &&
        criteria.createdAfter !== undefined &&
        criteria.createdAfter >= criteria.createdBefore
    ) {
        errors.push('createdAfter must be before createdBefore');
    }

    return errors;
}

/**
 * Validate cancel all after request
 */
export function validateCancelAllAfter(
    schema: CancelAllAfterSchema,
    config?: BatchEndpointConfig
): BatchValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate timeout
    if (schema.timeout === undefined || schema.timeout === null) {
        errors.push('timeout is required');
    } else if (schema.timeout < 0) {
        errors.push('timeout must be non-negative');
    }

    // Warn about zero timeout
    if (schema.timeout === 0 && !schema.cancelNow) {
        warnings.push('timeout of 0 will cancel all orders immediately');
    }

    // Validate cancelNow consistency
    if (schema.cancelNow && schema.timeout > 0) {
        warnings.push('cancelNow is set but timeout is non-zero; timeout will be ignored');
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate batch operation
 */
export function validateBatchOperation(
    operation: BatchOrderOperation,
    config?: BatchEndpointConfig
): BatchValidationResult {
    const errors: string[] = [];

    if (!operation.type) {
        errors.push('Operation type is required');
        return { valid: false, errors };
    }

    if (!operation.payload) {
        errors.push('Operation payload is required');
        return { valid: false, errors };
    }

    // Type-specific validation
    switch (operation.type) {
        case 'bulkCreate':
            return validateBulkCreateOrders(operation.payload as BulkCreateOrdersSchema, config);
        case 'bulkCancel':
            return validateBulkCancelOrders(operation.payload as BulkCancelOrdersSchema, config);
        case 'cancelAllAfter':
            return validateCancelAllAfter(operation.payload as CancelAllAfterSchema, config);
        default:
            errors.push(`Unknown operation type: ${operation.type}`);
            return { valid: false, errors };
    }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Calculate total cost for a batch operation
 */
export function calculateBatchCost(
    operation: BatchOrderOperation,
    config?: BatchEndpointConfig
): number {
    if (!config) {
        return 1; // Default cost
    }

    let itemCount = 0;

    // Determine item count based on operation type
    if (operation.type === 'bulkCreate') {
        const payload = operation.payload as BulkCreateOrdersSchema;
        itemCount = payload.orders?.length || 0;
    } else if (operation.type === 'bulkCancel') {
        const payload = operation.payload as BulkCancelOrdersSchema;
        itemCount = (payload.orderIds?.length || 0) + (payload.clientOrderIds?.length || 0);
    } else if (operation.type === 'cancelAllAfter') {
        itemCount = 1;
    }

    // Calculate cost
    const batchCost = config.batchCost || 0;
    const itemCost = config.itemCost || 0;

    return batchCost + itemCost * itemCount;
}

/**
 * Split large batch into smaller batches based on max size
 */
export function splitBatch<T>(items: T[], maxBatchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += maxBatchSize) {
        batches.push(items.slice(i, i + maxBatchSize));
    }

    return batches;
}

/**
 * Check if batch operation supports partial success
 */
export function supportsPartialSuccess(
    operationType: BatchOperationType,
    config?: BatchEndpointConfig
): boolean {
    if (!config) {
        return false; // Conservative default
    }

    return config.supportsPartialSuccess || false;
}

/**
 * Merge multiple batch operation results
 */
export function mergeBatchResults(results: BatchOperationResult[]): BatchOperationResult {
    const merged: BatchOperationResult = {
        status: 'success',
        totalRequested: 0,
        successCount: 0,
        failureCount: 0,
        pendingCount: 0,
        results: [],
    };

    for (const result of results) {
        merged.totalRequested += result.totalRequested;
        merged.successCount += result.successCount;
        merged.failureCount += result.failureCount;
        merged.pendingCount += result.pendingCount;
        merged.results.push(...result.results);
    }

    // Determine overall status
    if (merged.failureCount === merged.totalRequested) {
        merged.status = 'failed';
    } else if (merged.failureCount > 0 || merged.pendingCount > 0) {
        merged.status = 'partial';
    } else {
        merged.status = 'success';
    }

    return merged;
}
