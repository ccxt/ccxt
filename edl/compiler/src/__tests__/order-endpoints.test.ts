/**
 * Order Endpoints Schema Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    OrderMethod,
    HTTPMethod,
    ParameterMapping,
    OrderMethodEndpoint,
    CreateOrderEndpoint,
    EditOrderEndpoint,
    CancelOrderEndpoint,
    CancelAllOrdersEndpoint,
    StandardOrderParameters,
    validateOrderEndpoint,
    validateOrderParameters,
    mapOrderParameters,
    extractRequiredParams,
    extractOptionalParams,
    getTypeSpecificRequiredParams,
    exampleCreateOrderEndpoint,
    exampleEditOrderEndpoint,
    exampleCancelOrderEndpoint,
    exampleCancelAllOrdersEndpoint,
} from '../schemas/order-endpoints.js';

// ============================================================
// Schema Validation Tests
// ============================================================

test('validateOrderEndpoint - should validate valid createOrder endpoint', () => {
    const endpoint: CreateOrderEndpoint = {
        method: 'createOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'POST',
        requiredParams: ['symbol', 'side', 'type', 'amount'],
        optionalParams: ['price'],
        parameterMappings: {
            symbol: {
                ccxtParam: 'symbol',
                exchangeParam: 'symbol',
                location: 'body',
            },
            side: {
                ccxtParam: 'side',
                exchangeParam: 'side',
                location: 'body',
            },
            type: {
                ccxtParam: 'type',
                exchangeParam: 'type',
                location: 'body',
            },
            amount: {
                ccxtParam: 'amount',
                exchangeParam: 'quantity',
                location: 'body',
            },
        },
    };

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateOrderEndpoint - should reject missing required fields', () => {
    const endpoint = {
        endpoint: '/api/v3/order',
        httpMethod: 'POST',
        requiredParams: [],
        optionalParams: [],
        parameterMappings: {},
    } as unknown as OrderMethodEndpoint;

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('method')), 'Should error on missing method');
});

test('validateOrderEndpoint - should validate parameter mappings', () => {
    const endpoint: OrderMethodEndpoint = {
        method: 'createOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'POST',
        requiredParams: ['symbol'],
        optionalParams: [],
        parameterMappings: {
            symbol: {
                ccxtParam: 'symbol',
                exchangeParam: 'symbol',
                location: 'body',
            },
            invalidParam: {
                ccxtParam: '',
                exchangeParam: 'test',
                location: 'body',
            } as ParameterMapping,
        },
    };

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('ccxtParam')), 'Should error on missing ccxtParam');
});

test('validateOrderEndpoint - should validate HTTP method', () => {
    const endpoint = {
        method: 'createOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'INVALID',
        requiredParams: ['symbol', 'side', 'type', 'amount'],
        optionalParams: [],
        parameterMappings: {},
    } as unknown as OrderMethodEndpoint;

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('httpMethod')), 'Should error on invalid HTTP method');
});

test('validateOrderEndpoint - should validate parameter location', () => {
    const endpoint: OrderMethodEndpoint = {
        method: 'createOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'POST',
        requiredParams: ['symbol'],
        optionalParams: [],
        parameterMappings: {
            symbol: {
                ccxtParam: 'symbol',
                exchangeParam: 'symbol',
                location: 'invalid' as any,
            },
        },
    };

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('location')), 'Should error on invalid location');
});

test('validateOrderEndpoint - should validate essential createOrder parameters', () => {
    const endpoint: CreateOrderEndpoint = {
        method: 'createOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'POST',
        requiredParams: ['symbol'],
        optionalParams: [],
        parameterMappings: {},
    };

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('side')), 'Should error on missing side');
    assert.ok(result.errors.some(e => e.includes('type')), 'Should error on missing type');
    assert.ok(result.errors.some(e => e.includes('amount')), 'Should error on missing amount');
});

test('validateOrderEndpoint - should validate editOrder requires id', () => {
    const endpoint: EditOrderEndpoint = {
        method: 'editOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'PUT',
        requiredParams: ['symbol'],
        optionalParams: [],
        parameterMappings: {},
    };

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('id')), 'Should error on missing id');
});

test('validateOrderEndpoint - should validate cancelOrder requires id', () => {
    const endpoint: CancelOrderEndpoint = {
        method: 'cancelOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'DELETE',
        requiredParams: ['symbol'],
        optionalParams: [],
        parameterMappings: {},
    };

    const result = validateOrderEndpoint(endpoint);
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('id')), 'Should error on missing id');
});

// ============================================================
// Parameter Validation Tests
// ============================================================

test('validateOrderParameters - should validate valid limit order parameters', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: 1.5,
        price: 50000,
    };

    const result = validateOrderParameters(params, 'limit');
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateOrderParameters - should require price for limit orders', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: 1.5,
    };

    const result = validateOrderParameters(params, 'limit');
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('Price')), 'Should error on missing price');
});

test('validateOrderParameters - should validate market order without price', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'sell',
        type: 'market',
        amount: 0.5,
    };

    const result = validateOrderParameters(params, 'market');
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateOrderParameters - should require stopPrice for stop orders', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'stop',
        amount: 1.0,
    };

    const result = validateOrderParameters(params, 'stop');
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.toLowerCase().includes('stop')), 'Should error on missing stop price');
});

test('validateOrderParameters - should validate stopLimit order parameters', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'ETH/USDT',
        side: 'sell',
        type: 'stopLimit',
        amount: 10,
        price: 3000,
        stopPrice: 2900,
    };

    const result = validateOrderParameters(params, 'stopLimit');
    assert.equal(result.valid, true, 'Should be valid');
    assert.equal(result.errors.length, 0, 'Should have no errors');
});

test('validateOrderParameters - should reject missing required parameters', () => {
    const params: Partial<StandardOrderParameters> = {
        amount: 1.0,
    };

    const result = validateOrderParameters(params, 'market');
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('symbol')), 'Should error on missing symbol');
    assert.ok(result.errors.some(e => e.includes('side')), 'Should error on missing side');
    assert.ok(result.errors.some(e => e.includes('type')), 'Should error on missing type');
});

test('validateOrderParameters - should reject negative amount', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'market',
        amount: -1.0,
    };

    const result = validateOrderParameters(params, 'market');
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('Amount')), 'Should error on negative amount');
});

test('validateOrderParameters - should reject zero amount', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'market',
        amount: 0,
    };

    const result = validateOrderParameters(params, 'market');
    assert.equal(result.valid, false, 'Should be invalid');
    assert.ok(result.errors.some(e => e.includes('Amount')), 'Should error on zero amount');
});

test('validateOrderParameters - should validate trailingStop requires trailingDelta or stopPrice', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'sell',
        type: 'trailingStop',
        amount: 1.0,
    };

    const result = validateOrderParameters(params, 'trailingStop');
    assert.equal(result.valid, false, 'Should be invalid');
    // Trailing stop needs either trailingDelta or stopPrice/triggerPrice
    assert.ok(result.errors.length > 0, 'Should have validation errors');
});

test('validateOrderParameters - should validate trailingStop with trailingDelta', () => {
    const params: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'sell',
        type: 'trailingStop',
        amount: 1.0,
        trailingDelta: 100,
        stopPrice: 50000,
    };

    const result = validateOrderParameters(params, 'trailingStop');
    assert.equal(result.valid, true, 'Should be valid with trailingDelta and stopPrice');
});

// ============================================================
// Parameter Mapping Tests
// ============================================================

test('mapOrderParameters - should map CCXT parameters to exchange format', () => {
    const params = {
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: 1.5,
    };

    const mappings = {
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'body' as const,
        },
        side: {
            ccxtParam: 'side',
            exchangeParam: 'side',
            transform: 'toUpperCase',
            location: 'body' as const,
        },
        amount: {
            ccxtParam: 'amount',
            exchangeParam: 'quantity',
            location: 'body' as const,
        },
    };

    const result = mapOrderParameters(params, mappings);

    assert.equal(result.body.symbol, 'BTC/USDT', 'Symbol should be mapped');
    assert.equal(result.body.side, 'BUY', 'Side should be uppercase');
    assert.equal(result.body.quantity, 1.5, 'Amount should be mapped to quantity');
});

test('mapOrderParameters - should apply transformations', () => {
    const params = {
        side: 'buy',
        type: 'limit',
    };

    const mappings = {
        side: {
            ccxtParam: 'side',
            exchangeParam: 'side',
            transform: 'toUpperCase',
            location: 'body' as const,
        },
        type: {
            ccxtParam: 'type',
            exchangeParam: 'orderType',
            transform: 'toLowerCase',
            location: 'body' as const,
        },
    };

    const result = mapOrderParameters(params, mappings);

    assert.equal(result.body.side, 'BUY', 'Should transform to uppercase');
    assert.equal(result.body.orderType, 'limit', 'Should transform to lowercase');
});

test('mapOrderParameters - should apply formatting', () => {
    const params = {
        price: 50000.123456789,
        amount: 1.5,
    };

    const mappings = {
        price: {
            ccxtParam: 'price',
            exchangeParam: 'price',
            format: '%.2f',
            location: 'body' as const,
        },
        amount: {
            ccxtParam: 'amount',
            exchangeParam: 'quantity',
            format: '%.8f',
            location: 'body' as const,
        },
    };

    const result = mapOrderParameters(params, mappings);

    assert.equal(result.body.price, '50000.12', 'Should format to 2 decimals');
    assert.equal(result.body.quantity, '1.50000000', 'Should format to 8 decimals');
});

test('mapOrderParameters - should organize parameters by location', () => {
    const params = {
        symbol: 'BTC/USDT',
        apiKey: 'test-key',
        id: '12345',
    };

    const mappings = {
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'body' as const,
        },
        apiKey: {
            ccxtParam: 'apiKey',
            exchangeParam: 'X-API-KEY',
            location: 'header' as const,
        },
        id: {
            ccxtParam: 'id',
            exchangeParam: 'orderId',
            location: 'path' as const,
        },
    };

    const result = mapOrderParameters(params, mappings);

    assert.equal(result.body.symbol, 'BTC/USDT', 'Should map to body');
    assert.equal(result.header['X-API-KEY'], 'test-key', 'Should map to header');
    assert.equal(result.path.orderId, '12345', 'Should map to path');
});

test('mapOrderParameters - should skip unmapped parameters', () => {
    const params = {
        symbol: 'BTC/USDT',
        unknownParam: 'value',
    };

    const mappings = {
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'body' as const,
        },
    };

    const result = mapOrderParameters(params, mappings);

    assert.equal(result.body.symbol, 'BTC/USDT', 'Should map known param');
    assert.equal(result.body.unknownParam, undefined, 'Should skip unknown param');
});

test('mapOrderParameters - should apply numeric transformations', () => {
    const params = {
        price: '50000.5',
        amount: '1.5',
    };

    const mappings = {
        price: {
            ccxtParam: 'price',
            exchangeParam: 'price',
            transform: 'parseFloat',
            location: 'body' as const,
        },
        amount: {
            ccxtParam: 'amount',
            exchangeParam: 'quantity',
            transform: 'parseInt',
            location: 'body' as const,
        },
    };

    const result = mapOrderParameters(params, mappings);

    assert.equal(result.body.price, 50000.5, 'Should parse float');
    assert.equal(result.body.quantity, 1, 'Should parse int');
});

// ============================================================
// Helper Function Tests
// ============================================================

test('extractRequiredParams - should extract required parameters', () => {
    const mappings = {
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'body' as const,
            required: true,
        },
        side: {
            ccxtParam: 'side',
            exchangeParam: 'side',
            location: 'body' as const,
            required: true,
        },
        price: {
            ccxtParam: 'price',
            exchangeParam: 'price',
            location: 'body' as const,
            required: false,
        },
    };

    const required = extractRequiredParams(mappings);

    assert.equal(required.length, 2, 'Should have 2 required params');
    assert.ok(required.includes('symbol'), 'Should include symbol');
    assert.ok(required.includes('side'), 'Should include side');
    assert.ok(!required.includes('price'), 'Should not include price');
});

test('extractOptionalParams - should extract optional parameters', () => {
    const mappings = {
        symbol: {
            ccxtParam: 'symbol',
            exchangeParam: 'symbol',
            location: 'body' as const,
            required: true,
        },
        price: {
            ccxtParam: 'price',
            exchangeParam: 'price',
            location: 'body' as const,
            required: false,
        },
        stopPrice: {
            ccxtParam: 'stopPrice',
            exchangeParam: 'stopPrice',
            location: 'body' as const,
        },
    };

    const optional = extractOptionalParams(mappings);

    assert.equal(optional.length, 2, 'Should have 2 optional params');
    assert.ok(optional.includes('price'), 'Should include price');
    assert.ok(optional.includes('stopPrice'), 'Should include stopPrice');
    assert.ok(!optional.includes('symbol'), 'Should not include symbol');
});

test('getTypeSpecificRequiredParams - should get type-specific params', () => {
    const endpoint: CreateOrderEndpoint = {
        method: 'createOrder',
        endpoint: '/api/v3/order',
        httpMethod: 'POST',
        requiredParams: ['symbol', 'side', 'type', 'amount'],
        optionalParams: ['price', 'stopPrice'],
        typeSpecificParams: {
            limit: ['price'],
            stopLimit: ['price', 'stopPrice'],
        },
        parameterMappings: {},
    };

    const limitParams = getTypeSpecificRequiredParams(endpoint, 'limit');
    const stopLimitParams = getTypeSpecificRequiredParams(endpoint, 'stopLimit');
    const marketParams = getTypeSpecificRequiredParams(endpoint, 'market');

    assert.deepEqual(limitParams, ['price'], 'Should return limit params');
    assert.deepEqual(stopLimitParams, ['price', 'stopPrice'], 'Should return stopLimit params');
    assert.deepEqual(marketParams, [], 'Should return empty array for undefined type');
});

// ============================================================
// Example Endpoint Tests
// ============================================================

test('exampleCreateOrderEndpoint - should be valid', () => {
    const result = validateOrderEndpoint(exampleCreateOrderEndpoint);
    assert.equal(result.valid, true, 'Example createOrder endpoint should be valid');
});

test('exampleEditOrderEndpoint - should be valid', () => {
    const result = validateOrderEndpoint(exampleEditOrderEndpoint);
    assert.equal(result.valid, true, 'Example editOrder endpoint should be valid');
});

test('exampleCancelOrderEndpoint - should be valid', () => {
    const result = validateOrderEndpoint(exampleCancelOrderEndpoint);
    assert.equal(result.valid, true, 'Example cancelOrder endpoint should be valid');
});

test('exampleCancelAllOrdersEndpoint - should be valid', () => {
    const result = validateOrderEndpoint(exampleCancelAllOrdersEndpoint);
    assert.equal(result.valid, true, 'Example cancelAllOrders endpoint should be valid');
});

test('exampleCreateOrderEndpoint - should have correct structure', () => {
    assert.equal(exampleCreateOrderEndpoint.method, 'createOrder');
    assert.equal(exampleCreateOrderEndpoint.httpMethod, 'POST');
    assert.ok(exampleCreateOrderEndpoint.requiredParams.includes('symbol'));
    assert.ok(exampleCreateOrderEndpoint.requiredParams.includes('side'));
    assert.ok(exampleCreateOrderEndpoint.requiredParams.includes('type'));
    assert.ok(exampleCreateOrderEndpoint.requiredParams.includes('amount'));
});

test('exampleCreateOrderEndpoint - should have type-specific params', () => {
    assert.ok(exampleCreateOrderEndpoint.typeSpecificParams);
    assert.deepEqual(exampleCreateOrderEndpoint.typeSpecificParams.limit, ['price']);
    assert.deepEqual(exampleCreateOrderEndpoint.typeSpecificParams.stopLimit, ['price', 'stopPrice']);
});

test('exampleEditOrderEndpoint - should have editable fields', () => {
    assert.ok(exampleEditOrderEndpoint.editableFields);
    assert.ok(exampleEditOrderEndpoint.editableFields.includes('amount'));
    assert.ok(exampleEditOrderEndpoint.editableFields.includes('price'));
});

test('exampleCancelOrderEndpoint - should support client order ID', () => {
    assert.equal(exampleCancelOrderEndpoint.supportsClientOrderId, true);
});

test('exampleCancelAllOrdersEndpoint - should require symbol', () => {
    assert.equal(exampleCancelAllOrdersEndpoint.requiresSymbol, true);
    assert.equal(exampleCancelAllOrdersEndpoint.scope, 'symbol');
});

// ============================================================
// Integration Tests
// ============================================================

test('Integration - map createOrder parameters for limit order', () => {
    const params = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: 1.5,
        price: 50000.12345678,
    };

    const result = mapOrderParameters(params, exampleCreateOrderEndpoint.parameterMappings);

    assert.equal(result.body.symbol, 'BTC/USDT');
    assert.equal(result.body.side, 'BUY');
    assert.equal(result.body.type, 'LIMIT');
    assert.equal(result.body.quantity, '1.50000000');
    assert.equal(result.body.price, '50000.12345678');
});

test('Integration - map editOrder parameters', () => {
    const params = {
        id: 'order123',
        symbol: 'ETH/USDT',
        amount: 10.5,
        price: 3000.5,
    };

    const result = mapOrderParameters(params, exampleEditOrderEndpoint.parameterMappings);

    assert.equal(result.body.orderId, 'order123');
    assert.equal(result.body.symbol, 'ETH/USDT');
    assert.equal(result.body.quantity, '10.50000000');
    assert.equal(result.body.price, '3000.50000000');
});

test('Integration - map cancelOrder parameters', () => {
    const params = {
        id: 'order456',
        symbol: 'BTC/USDT',
    };

    const result = mapOrderParameters(params, exampleCancelOrderEndpoint.parameterMappings);

    assert.equal(result.query.orderId, 'order456');
    assert.equal(result.query.symbol, 'BTC/USDT');
});

test('Integration - validate and map complete order flow', () => {
    // Create order
    const createParams: Partial<StandardOrderParameters> = {
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: 1.0,
        price: 50000,
    };

    const createValidation = validateOrderParameters(createParams, 'limit');
    assert.equal(createValidation.valid, true, 'Create params should be valid');

    const createMapped = mapOrderParameters(createParams, exampleCreateOrderEndpoint.parameterMappings);
    assert.equal(createMapped.body.symbol, 'BTC/USDT');
    assert.equal(createMapped.body.side, 'BUY');

    // Edit order
    const editParams = {
        id: 'order123',
        symbol: 'BTC/USDT',
        price: 51000,
    };

    const editMapped = mapOrderParameters(editParams, exampleEditOrderEndpoint.parameterMappings);
    assert.equal(editMapped.body.orderId, 'order123');
    assert.equal(editMapped.body.price, '51000.00000000');

    // Cancel order
    const cancelParams = {
        id: 'order123',
        symbol: 'BTC/USDT',
    };

    const cancelMapped = mapOrderParameters(cancelParams, exampleCancelOrderEndpoint.parameterMappings);
    assert.equal(cancelMapped.query.orderId, 'order123');
    assert.equal(cancelMapped.query.symbol, 'BTC/USDT');
});
