/**
 * Order Endpoint Schemas
 * TypeScript interfaces for CCXT order method endpoints and parameter mappings
 */

import {
    OrderType,
    OrderSide,
    TimeInForce,
    ParamType,
    ParamLocation,
} from '../types/edl.js';

// ============================================================
// Order Method Types
// ============================================================

/**
 * Supported order method types in CCXT
 */
export type OrderMethod = 'createOrder' | 'editOrder' | 'cancelOrder' | 'cancelAllOrders';

/**
 * HTTP methods for REST API endpoints
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// ============================================================
// Parameter Mapping Types
// ============================================================

/**
 * Parameter mapping from CCXT to exchange API format
 * Describes how to transform and locate parameters in API requests
 */
export interface ParameterMapping {
    /** CCXT parameter name (standard name used across exchanges) */
    ccxtParam: string;
    /** Exchange-specific parameter name */
    exchangeParam: string;
    /** Optional transformation function name (e.g., 'toUpperCase', 'parseFloat') */
    transform?: string;
    /** Optional value formatting (e.g., '%.8f', 'string', 'int') */
    format?: string;
    /** Location of parameter in the request */
    location: ParamLocation;
    /** Whether this parameter is required */
    required?: boolean;
    /** Conditional requirement (e.g., 'type === "limit"') */
    requiredIf?: string;
    /** Default value if not provided */
    default?: string | number | boolean | null;
    /** Parameter type for validation */
    type?: ParamType;
}

/**
 * Collection of parameter mappings for an endpoint
 */
export type ParameterMappings = Record<string, ParameterMapping>;

// ============================================================
// Base Order Endpoint Interface
// ============================================================

/**
 * Base interface for order method endpoints
 * Defines the structure for all order-related API endpoints
 */
export interface OrderMethodEndpoint {
    /** Order method type */
    method: OrderMethod;
    /** API endpoint path (may include path parameters like {id} or {symbol}) */
    endpoint: string;
    /** HTTP method for the request */
    httpMethod: HTTPMethod;
    /** Required parameters for this endpoint */
    requiredParams: string[];
    /** Optional parameters for this endpoint */
    optionalParams: string[];
    /** Parameter mappings from CCXT to exchange format */
    parameterMappings: ParameterMappings;
    /** API request cost/weight for rate limiting */
    cost?: number;
    /** Additional notes or documentation */
    description?: string;
}

// ============================================================
// Create Order Endpoint
// ============================================================

/**
 * Create Order endpoint schema
 * Handles order creation with type-specific requirements
 */
export interface CreateOrderEndpoint extends OrderMethodEndpoint {
    method: 'createOrder';
    /** Supported order types for this endpoint */
    supportedOrderTypes?: OrderType[];
    /** Default order type if not specified */
    defaultOrderType?: OrderType;
    /** Type-specific parameter requirements */
    typeSpecificParams?: {
        /** Parameters required for limit orders (typically includes 'price') */
        limit?: string[];
        /** Parameters required for market orders */
        market?: string[];
        /** Parameters required for stop orders */
        stop?: string[];
        /** Parameters required for stop-limit orders */
        stopLimit?: string[];
        /** Parameters required for stop-market orders */
        stopMarket?: string[];
        /** Parameters required for trailing stop orders */
        trailingStop?: string[];
        /** Parameters for other order types */
        [key: string]: string[] | undefined;
    };
}

// ============================================================
// Edit Order Endpoint
// ============================================================

/**
 * Edit Order endpoint schema
 * Handles order modification
 */
export interface EditOrderEndpoint extends OrderMethodEndpoint {
    method: 'editOrder';
    /** Whether the exchange requires canceling and recreating the order */
    requiresCancelReplace?: boolean;
    /** Editable fields (some exchanges only allow certain fields to be edited) */
    editableFields?: string[];
}

// ============================================================
// Cancel Order Endpoint
// ============================================================

/**
 * Cancel Order endpoint schema
 * Handles single order cancellation
 */
export interface CancelOrderEndpoint extends OrderMethodEndpoint {
    method: 'cancelOrder';
    /** Whether client order ID can be used instead of exchange order ID */
    supportsClientOrderId?: boolean;
}

// ============================================================
// Cancel All Orders Endpoint
// ============================================================

/**
 * Cancel All Orders endpoint schema
 * Handles bulk order cancellation
 */
export interface CancelAllOrdersEndpoint extends OrderMethodEndpoint {
    method: 'cancelAllOrders';
    /** Scope of cancellation (symbol, market type, all) */
    scope?: 'symbol' | 'marketType' | 'all';
    /** Whether symbol parameter is required */
    requiresSymbol?: boolean;
}

// ============================================================
// Standard Order Parameters
// ============================================================

/**
 * Standard CCXT order parameters
 * These are the common parameters used across all exchanges
 */
export interface StandardOrderParameters {
    /** Trading pair symbol (e.g., 'BTC/USDT') */
    symbol: string;
    /** Order side (buy or sell) */
    side: OrderSide;
    /** Order type */
    type: OrderType;
    /** Order amount in base currency */
    amount: number;
    /** Order price (required for limit orders) */
    price?: number;
    /** Stop/trigger price (for stop orders) */
    stopPrice?: number;
    /** Trigger price (alternative name for stopPrice) */
    triggerPrice?: number;
    /** Trailing delta/offset (for trailing stop orders) */
    trailingDelta?: number;
    /** Time in force */
    timeInForce?: TimeInForce;
    /** Post-only flag (order will only execute as maker) */
    postOnly?: boolean;
    /** Reduce-only flag (position reduction only) */
    reduceOnly?: boolean;
    /** Close position flag (close entire position) */
    closePosition?: boolean;
    /** Client-provided order ID */
    clientOrderId?: string;
    /** Leverage for margin/futures trading */
    leverage?: number;
    /** Additional exchange-specific parameters */
    params?: Record<string, any>;
}

/**
 * Edit order parameters
 */
export interface EditOrderParameters extends Partial<StandardOrderParameters> {
    /** Order ID to edit (exchange ID) */
    id: string;
    /** Symbol is typically required for edit operations */
    symbol: string;
}

/**
 * Cancel order parameters
 */
export interface CancelOrderParameters {
    /** Order ID to cancel */
    id: string;
    /** Symbol (required by some exchanges) */
    symbol?: string;
    /** Client order ID (if supported) */
    clientOrderId?: string;
    /** Additional parameters */
    params?: Record<string, any>;
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * Validation result for endpoint schemas
 */
export interface EndpointValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate order endpoint schema
 * Ensures all required fields are present and properly structured
 */
export function validateOrderEndpoint(
    endpoint: OrderMethodEndpoint
): EndpointValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!endpoint.method) {
        errors.push('Missing required field: method');
    }
    if (!endpoint.endpoint) {
        errors.push('Missing required field: endpoint');
    }
    if (!endpoint.httpMethod) {
        errors.push('Missing required field: httpMethod');
    }
    if (!Array.isArray(endpoint.requiredParams)) {
        errors.push('requiredParams must be an array');
    }
    if (!Array.isArray(endpoint.optionalParams)) {
        errors.push('optionalParams must be an array');
    }
    if (!endpoint.parameterMappings || typeof endpoint.parameterMappings !== 'object') {
        errors.push('parameterMappings must be an object');
    }

    // Validate method type
    const validMethods: OrderMethod[] = ['createOrder', 'editOrder', 'cancelOrder', 'cancelAllOrders'];
    if (!validMethods.includes(endpoint.method)) {
        errors.push(`Invalid method: ${endpoint.method}. Must be one of: ${validMethods.join(', ')}`);
    }

    // Validate HTTP method
    const validHttpMethods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validHttpMethods.includes(endpoint.httpMethod)) {
        errors.push(`Invalid httpMethod: ${endpoint.httpMethod}. Must be one of: ${validHttpMethods.join(', ')}`);
    }

    // Validate parameter mappings
    if (endpoint.parameterMappings) {
        for (const [paramName, mapping] of Object.entries(endpoint.parameterMappings)) {
            if (!mapping.ccxtParam) {
                errors.push(`Parameter mapping "${paramName}" missing ccxtParam`);
            }
            if (!mapping.exchangeParam) {
                errors.push(`Parameter mapping "${paramName}" missing exchangeParam`);
            }
            if (!mapping.location) {
                errors.push(`Parameter mapping "${paramName}" missing location`);
            }

            // Validate location
            const validLocations: ParamLocation[] = ['query', 'body', 'path', 'header'];
            if (mapping.location && !validLocations.includes(mapping.location)) {
                errors.push(`Invalid location for "${paramName}": ${mapping.location}`);
            }
        }
    }

    // Method-specific validations
    if (endpoint.method === 'createOrder') {
        const createEndpoint = endpoint as CreateOrderEndpoint;
        // Ensure essential order parameters are mapped
        const essentialParams = ['symbol', 'side', 'type', 'amount'];
        for (const param of essentialParams) {
            if (!endpoint.requiredParams.includes(param) && !endpoint.optionalParams.includes(param)) {
                errors.push(`CreateOrder endpoint missing essential parameter: ${param}`);
            }
        }

        // Validate type-specific params if present
        if (createEndpoint.typeSpecificParams) {
            for (const [orderType, params] of Object.entries(createEndpoint.typeSpecificParams)) {
                if (!Array.isArray(params)) {
                    errors.push(`Type-specific params for "${orderType}" must be an array`);
                }
            }
        }
    }

    if (endpoint.method === 'editOrder' || endpoint.method === 'cancelOrder') {
        // These typically require an order ID
        if (!endpoint.requiredParams.includes('id') && !endpoint.optionalParams.includes('id')) {
            errors.push(`${endpoint.method} endpoint should include 'id' parameter`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate order parameters for a specific order type
 */
export function validateOrderParameters(
    params: Partial<StandardOrderParameters>,
    orderType: OrderType
): EndpointValidationResult {
    const errors: string[] = [];

    // Validate required base parameters
    if (!params.symbol) {
        errors.push('Missing required parameter: symbol');
    }
    if (!params.side) {
        errors.push('Missing required parameter: side');
    }
    if (!params.type) {
        errors.push('Missing required parameter: type');
    }
    if (params.amount === undefined || params.amount === null) {
        errors.push('Missing required parameter: amount');
    }

    // Type-specific validations
    switch (orderType) {
        case 'limit':
        case 'stopLimit':
            if (params.price === undefined || params.price === null) {
                errors.push(`Price is required for ${orderType} orders`);
            }
            break;

        case 'stop':
        case 'stopMarket':
        case 'trailingStop':
        case 'trailingStopMarket':
            if (!params.stopPrice && !params.triggerPrice) {
                errors.push(`Stop/trigger price is required for ${orderType} orders`);
            }
            break;

        case 'trailingStop':
        case 'trailingStopMarket':
            if (params.trailingDelta === undefined) {
                errors.push(`Trailing delta is required for ${orderType} orders`);
            }
            break;
    }

    // Validate numeric parameters
    if (params.amount !== undefined && params.amount <= 0) {
        errors.push('Amount must be greater than 0');
    }
    if (params.price !== undefined && params.price <= 0) {
        errors.push('Price must be greater than 0');
    }
    if (params.stopPrice !== undefined && params.stopPrice <= 0) {
        errors.push('Stop price must be greater than 0');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================================
// Parameter Mapping Functions
// ============================================================

/**
 * Result of parameter mapping transformation
 */
export interface MappedParameters {
    /** Parameters organized by location */
    path: Record<string, any>;
    query: Record<string, any>;
    body: Record<string, any>;
    header: Record<string, any>;
}

/**
 * Map CCXT parameters to exchange-specific format
 * Transforms parameter names, formats, and organizes by location
 */
export function mapOrderParameters(
    params: Record<string, any>,
    mappings: ParameterMappings
): MappedParameters {
    const result: MappedParameters = {
        path: {},
        query: {},
        body: {},
        header: {},
    };

    for (const [ccxtName, value] of Object.entries(params)) {
        const mapping = mappings[ccxtName];

        if (!mapping) {
            // If no mapping exists, skip this parameter or use as-is
            continue;
        }

        let transformedValue = value;

        // Apply transformation if specified
        if (mapping.transform) {
            transformedValue = applyTransform(value, mapping.transform);
        }

        // Apply formatting if specified
        if (mapping.format) {
            transformedValue = applyFormat(transformedValue, mapping.format);
        }

        // Add to appropriate location
        const location = mapping.location;
        result[location][mapping.exchangeParam] = transformedValue;
    }

    return result;
}

/**
 * Apply a transformation function to a value
 */
function applyTransform(value: any, transform: string): any {
    switch (transform) {
        case 'toUpperCase':
            return typeof value === 'string' ? value.toUpperCase() : value;
        case 'toLowerCase':
            return typeof value === 'string' ? value.toLowerCase() : value;
        case 'parseFloat':
            return parseFloat(value);
        case 'parseInt':
            return parseInt(value, 10);
        case 'toString':
            return String(value);
        case 'toFixed2':
            return typeof value === 'number' ? value.toFixed(2) : value;
        case 'toFixed8':
            return typeof value === 'number' ? value.toFixed(8) : value;
        case 'milliseconds':
            return typeof value === 'number' ? value : Date.parse(value);
        case 'seconds':
            return typeof value === 'number' ? Math.floor(value / 1000) : Math.floor(Date.parse(value) / 1000);
        default:
            // Custom transform - would need to be handled by caller
            return value;
    }
}

/**
 * Apply formatting to a value
 */
function applyFormat(value: any, format: string): any {
    switch (format) {
        case 'string':
            return String(value);
        case 'int':
        case 'integer':
            return parseInt(value, 10);
        case 'float':
        case 'number':
            return parseFloat(value);
        case 'boolean':
        case 'bool':
            return Boolean(value);
        default:
            // Format string like '%.8f' would need more complex handling
            if (format.startsWith('%')) {
                // Handle printf-style format strings
                const match = format.match(/%.(\d+)f/);
                if (match && typeof value === 'number') {
                    const decimals = parseInt(match[1], 10);
                    return value.toFixed(decimals);
                }
            }
            return value;
    }
}

/**
 * Extract required parameters from mappings
 */
export function extractRequiredParams(mappings: ParameterMappings): string[] {
    return Object.entries(mappings)
        .filter(([_, mapping]) => mapping.required === true)
        .map(([ccxtName, _]) => ccxtName);
}

/**
 * Extract optional parameters from mappings
 */
export function extractOptionalParams(mappings: ParameterMappings): string[] {
    return Object.entries(mappings)
        .filter(([_, mapping]) => mapping.required !== true)
        .map(([ccxtName, _]) => ccxtName);
}

/**
 * Get type-specific required parameters
 */
export function getTypeSpecificRequiredParams(
    endpoint: CreateOrderEndpoint,
    orderType: OrderType
): string[] {
    if (!endpoint.typeSpecificParams) {
        return [];
    }

    return endpoint.typeSpecificParams[orderType] || [];
}

// ============================================================
// Example Endpoint Definitions
// ============================================================

/**
 * Example: Generic REST exchange createOrder endpoint
 */
export const exampleCreateOrderEndpoint: CreateOrderEndpoint = {
    method: 'createOrder',
    endpoint: '/api/v3/order',
    httpMethod: 'POST',
    requiredParams: ['symbol', 'side', 'type', 'amount'],
    optionalParams: ['price', 'stopPrice', 'timeInForce', 'clientOrderId'],
    supportedOrderTypes: ['market', 'limit', 'stop', 'stopLimit'],
    defaultOrderType: 'limit',
    typeSpecificParams: {
        limit: ['price'],
        stopLimit: ['price', 'stopPrice'],
        stop: ['stopPrice'],
    },
    parameterMappings: {
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'body',
            required: true,
            type: 'string',
        },
        side: {
            ccxtParam: 'side',
            exchangeParam: 'side',
            transform: 'toUpperCase',
            location: 'body',
            required: true,
            type: 'string',
        },
        type: {
            ccxtParam: 'type',
            exchangeParam: 'type',
            transform: 'toUpperCase',
            location: 'body',
            required: true,
            type: 'string',
        },
        amount: {
            ccxtParam: 'amount',
            exchangeParam: 'quantity',
            format: '%.8f',
            location: 'body',
            required: true,
            type: 'float',
        },
        price: {
            ccxtParam: 'price',
            exchangeParam: 'price',
            format: '%.8f',
            location: 'body',
            requiredIf: 'type === "limit" || type === "stopLimit"',
            type: 'float',
        },
        stopPrice: {
            ccxtParam: 'stopPrice',
            exchangeParam: 'stopPrice',
            format: '%.8f',
            location: 'body',
            requiredIf: 'type === "stop" || type === "stopLimit"',
            type: 'float',
        },
        timeInForce: {
            ccxtParam: 'timeInForce',
            exchangeParam: 'timeInForce',
            transform: 'toUpperCase',
            location: 'body',
            type: 'string',
        },
        clientOrderId: {
            ccxtParam: 'clientOrderId',
            exchangeParam: 'newClientOrderId',
            location: 'body',
            type: 'string',
        },
    },
    cost: 1,
    description: 'Create a new order',
};

/**
 * Example: Generic REST exchange editOrder endpoint
 */
export const exampleEditOrderEndpoint: EditOrderEndpoint = {
    method: 'editOrder',
    endpoint: '/api/v3/order',
    httpMethod: 'PUT',
    requiredParams: ['id', 'symbol'],
    optionalParams: ['amount', 'price'],
    editableFields: ['amount', 'price'],
    parameterMappings: {
        id: {
            ccxtParam: 'id',
            exchangeParam: 'orderId',
            location: 'body',
            required: true,
            type: 'string',
        },
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'body',
            required: true,
            type: 'string',
        },
        amount: {
            ccxtParam: 'amount',
            exchangeParam: 'quantity',
            format: '%.8f',
            location: 'body',
            type: 'float',
        },
        price: {
            ccxtParam: 'price',
            exchangeParam: 'price',
            format: '%.8f',
            location: 'body',
            type: 'float',
        },
    },
    cost: 1,
    description: 'Modify an existing order',
};

/**
 * Example: Generic REST exchange cancelOrder endpoint
 */
export const exampleCancelOrderEndpoint: CancelOrderEndpoint = {
    method: 'cancelOrder',
    endpoint: '/api/v3/order',
    httpMethod: 'DELETE',
    requiredParams: ['id', 'symbol'],
    optionalParams: ['clientOrderId'],
    supportsClientOrderId: true,
    parameterMappings: {
        id: {
            ccxtParam: 'id',
            exchangeParam: 'orderId',
            location: 'query',
            required: true,
            type: 'string',
        },
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'query',
            required: true,
            type: 'string',
        },
        clientOrderId: {
            ccxtParam: 'clientOrderId',
            exchangeParam: 'origClientOrderId',
            location: 'query',
            type: 'string',
        },
    },
    cost: 1,
    description: 'Cancel an existing order',
};

/**
 * Example: Generic REST exchange cancelAllOrders endpoint
 */
export const exampleCancelAllOrdersEndpoint: CancelAllOrdersEndpoint = {
    method: 'cancelAllOrders',
    endpoint: '/api/v3/openOrders',
    httpMethod: 'DELETE',
    requiredParams: ['symbol'],
    optionalParams: [],
    scope: 'symbol',
    requiresSymbol: true,
    parameterMappings: {
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'query',
            required: true,
            type: 'string',
        },
    },
    cost: 1,
    description: 'Cancel all open orders for a symbol',
};
