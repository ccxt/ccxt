/**
 * Tests for API Endpoint Schema
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type {
    APIEndpointSchema,
    ParameterSchema,
    ValidationError,
    PathParameter,
} from '../schemas/api-endpoints.js';
import {
    parseEndpointPath,
    buildEndpointUrl,
    validateParameter,
    validateEndpointSchema,
    extractParameters,
    getRequiredParameters,
    matchesParameterType,
    isValidHTTPMethod,
    validatePathTemplate,
    validatePathPlaceholders,
    hasValidAPIVersion,
    extractAPIVersion,
    validateEndpointDefinition,
} from '../schemas/api-endpoints.js';

describe('API Endpoint Schema', () => {
    describe('parseEndpointPath', () => {
        test('parse simple path with single parameter', () => {
            const result = parseEndpointPath('/api/v1/orders/{orderId}');

            assert.equal(result.length, 1);
            assert.equal(result[0].name, 'orderId');
            assert.equal(result[0].position, 0);
            assert.equal(result[0].required, true);
        });

        test('parse path with multiple parameters', () => {
            const result = parseEndpointPath('/api/v1/users/{userId}/orders/{orderId}');

            assert.equal(result.length, 2);
            assert.equal(result[0].name, 'userId');
            assert.equal(result[0].position, 0);
            assert.equal(result[0].required, true);
            assert.equal(result[1].name, 'orderId');
            assert.equal(result[1].position, 1);
            assert.equal(result[1].required, true);
        });

        test('parse path with optional parameter', () => {
            const result = parseEndpointPath('/api/v1/orders/{orderId?}');

            assert.equal(result.length, 1);
            assert.equal(result[0].name, 'orderId');
            assert.equal(result[0].required, false);
        });

        test('parse path with mixed required and optional parameters', () => {
            const result = parseEndpointPath('/api/{version}/users/{userId}/orders/{orderId?}');

            assert.equal(result.length, 3);
            assert.equal(result[0].name, 'version');
            assert.equal(result[0].required, true);
            assert.equal(result[1].name, 'userId');
            assert.equal(result[1].required, true);
            assert.equal(result[2].name, 'orderId');
            assert.equal(result[2].required, false);
        });

        test('parse path with no parameters', () => {
            const result = parseEndpointPath('/api/v1/orders');

            assert.equal(result.length, 0);
        });

        test('parse path with complex parameter names', () => {
            const result = parseEndpointPath('/api/v1/{market_id}/trades/{trade_id}');

            assert.equal(result.length, 2);
            assert.equal(result[0].name, 'market_id');
            assert.equal(result[1].name, 'trade_id');
        });
    });

    describe('buildEndpointUrl', () => {
        test('build URL with path parameters', () => {
            const schema: APIEndpointSchema = {
                id: 'getOrder',
                method: 'GET',
                path: '/api/v1/orders/{orderId}',
            };

            const url = buildEndpointUrl(schema, { orderId: '12345' });
            assert.equal(url, '/api/v1/orders/12345');
        });

        test('build URL with base URL', () => {
            const schema: APIEndpointSchema = {
                id: 'getOrder',
                method: 'GET',
                path: '/api/v1/orders/{orderId}',
                baseUrl: 'https://api.example.com',
            };

            const url = buildEndpointUrl(schema, { orderId: '12345' });
            assert.equal(url, 'https://api.example.com/api/v1/orders/12345');
        });

        test('build URL with query parameters', () => {
            const schema: APIEndpointSchema = {
                id: 'listOrders',
                method: 'GET',
                path: '/api/v1/orders',
                queryParams: [
                    { name: 'limit', type: 'int', location: 'query', required: false },
                    { name: 'status', type: 'string', location: 'query', required: false },
                ],
            };

            const url = buildEndpointUrl(schema, { limit: 10, status: 'open' });
            assert.equal(url, '/api/v1/orders?limit=10&status=open');
        });

        test('build URL with path and query parameters', () => {
            const schema: APIEndpointSchema = {
                id: 'getUserOrders',
                method: 'GET',
                path: '/api/v1/users/{userId}/orders',
                queryParams: [
                    { name: 'symbol', type: 'string', location: 'query', required: false },
                ],
            };

            const url = buildEndpointUrl(schema, { userId: 'user123', symbol: 'BTC/USD' });
            assert.equal(url, '/api/v1/users/user123/orders?symbol=BTC%2FUSD');
        });

        test('build URL with special characters in parameters', () => {
            const schema: APIEndpointSchema = {
                id: 'getMarket',
                method: 'GET',
                path: '/api/v1/markets/{symbol}',
            };

            const url = buildEndpointUrl(schema, { symbol: 'BTC/USDT' });
            assert.equal(url, '/api/v1/markets/BTC%2FUSDT');
        });

        test('throw error for missing required path parameter', () => {
            const schema: APIEndpointSchema = {
                id: 'getOrder',
                method: 'GET',
                path: '/api/v1/orders/{orderId}',
            };

            assert.throws(
                () => buildEndpointUrl(schema, {}),
                /Missing required path parameter: orderId/
            );
        });

        test('throw error for missing required query parameter', () => {
            const schema: APIEndpointSchema = {
                id: 'listOrders',
                method: 'GET',
                path: '/api/v1/orders',
                queryParams: [
                    { name: 'symbol', type: 'string', location: 'query', required: true },
                ],
            };

            assert.throws(
                () => buildEndpointUrl(schema, {}),
                /Missing required query parameter: symbol/
            );
        });

        test('build URL with optional query parameters omitted', () => {
            const schema: APIEndpointSchema = {
                id: 'listOrders',
                method: 'GET',
                path: '/api/v1/orders',
                queryParams: [
                    { name: 'limit', type: 'int', location: 'query', required: false },
                ],
            };

            const url = buildEndpointUrl(schema, {});
            assert.equal(url, '/api/v1/orders');
        });

        test('build URL with base URL ending in slash', () => {
            const schema: APIEndpointSchema = {
                id: 'getOrder',
                method: 'GET',
                path: '/api/v1/orders/{orderId}',
                baseUrl: 'https://api.example.com/',
            };

            const url = buildEndpointUrl(schema, { orderId: '12345' });
            assert.equal(url, 'https://api.example.com/api/v1/orders/12345');
        });
    });

    describe('validateParameter', () => {
        test('validate required parameter present', () => {
            const param: ParameterSchema = {
                name: 'symbol',
                type: 'string',
                location: 'query',
                required: true,
            };

            const errors = validateParameter(param, 'BTC/USD');
            assert.equal(errors.length, 0);
        });

        test('validate required parameter missing', () => {
            const param: ParameterSchema = {
                name: 'symbol',
                type: 'string',
                location: 'query',
                required: true,
            };

            const errors = validateParameter(param, undefined);
            assert.equal(errors.length, 1);
            assert.equal(errors[0].code, 'REQUIRED');
            assert.equal(errors[0].parameter, 'symbol');
        });

        test('validate string type', () => {
            const param: ParameterSchema = {
                name: 'status',
                type: 'string',
                location: 'query',
            };

            assert.equal(validateParameter(param, 'active').length, 0);
            assert.equal(validateParameter(param, 123).length, 1);
            assert.equal(validateParameter(param, true).length, 1);
        });

        test('validate number type', () => {
            const param: ParameterSchema = {
                name: 'amount',
                type: 'number',
                location: 'body',
            };

            assert.equal(validateParameter(param, 100).length, 0);
            assert.equal(validateParameter(param, 100.5).length, 0);
            assert.equal(validateParameter(param, '100').length, 1);
        });

        test('validate integer type', () => {
            const param: ParameterSchema = {
                name: 'limit',
                type: 'int',
                location: 'query',
            };

            assert.equal(validateParameter(param, 10).length, 0);
            assert.equal(validateParameter(param, 10.5).length, 0); // Type check allows numbers
        });

        test('validate boolean type', () => {
            const param: ParameterSchema = {
                name: 'active',
                type: 'boolean',
                location: 'query',
            };

            assert.equal(validateParameter(param, true).length, 0);
            assert.equal(validateParameter(param, false).length, 0);
            assert.equal(validateParameter(param, 'true').length, 1);
        });

        test('validate array type', () => {
            const param: ParameterSchema = {
                name: 'symbols',
                type: 'array',
                location: 'query',
            };

            assert.equal(validateParameter(param, []).length, 0);
            assert.equal(validateParameter(param, ['BTC/USD', 'ETH/USD']).length, 0);
            assert.equal(validateParameter(param, 'BTC/USD').length, 1);
        });

        test('validate enum values', () => {
            const param: ParameterSchema = {
                name: 'side',
                type: 'string',
                location: 'body',
                enum: ['buy', 'sell'],
            };

            assert.equal(validateParameter(param, 'buy').length, 0);
            assert.equal(validateParameter(param, 'sell').length, 0);

            const errors = validateParameter(param, 'invalid');
            assert.equal(errors.length, 1);
            assert.equal(errors[0].code, 'INVALID_ENUM');
        });

        test('validate min/max constraints', () => {
            const param: ParameterSchema = {
                name: 'amount',
                type: 'number',
                location: 'body',
                validation: {
                    min: 0.01,
                    max: 1000,
                },
            };

            assert.equal(validateParameter(param, 0.01).length, 0);
            assert.equal(validateParameter(param, 500).length, 0);
            assert.equal(validateParameter(param, 1000).length, 0);

            const minErrors = validateParameter(param, 0.001);
            assert.equal(minErrors.length, 1);
            assert.equal(minErrors[0].code, 'MIN_VALUE');

            const maxErrors = validateParameter(param, 1001);
            assert.equal(maxErrors.length, 1);
            assert.equal(maxErrors[0].code, 'MAX_VALUE');
        });

        test('validate minLength/maxLength constraints', () => {
            const param: ParameterSchema = {
                name: 'symbol',
                type: 'string',
                location: 'query',
                validation: {
                    minLength: 3,
                    maxLength: 10,
                },
            };

            assert.equal(validateParameter(param, 'BTC').length, 0);
            assert.equal(validateParameter(param, 'BTC/USDT').length, 0);

            const minErrors = validateParameter(param, 'BT');
            assert.equal(minErrors.length, 1);
            assert.equal(minErrors[0].code, 'MIN_LENGTH');

            const maxErrors = validateParameter(param, 'VERYLONGSYMBOL');
            assert.equal(maxErrors.length, 1);
            assert.equal(maxErrors[0].code, 'MAX_LENGTH');
        });

        test('validate pattern constraint', () => {
            const param: ParameterSchema = {
                name: 'email',
                type: 'string',
                location: 'body',
                validation: {
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                },
            };

            assert.equal(validateParameter(param, 'user@example.com').length, 0);

            const errors = validateParameter(param, 'invalid-email');
            assert.equal(errors.length, 1);
            assert.equal(errors[0].code, 'PATTERN_MISMATCH');
        });

        test('skip validation for optional parameter with no value', () => {
            const param: ParameterSchema = {
                name: 'limit',
                type: 'int',
                location: 'query',
                required: false,
                validation: {
                    min: 1,
                    max: 100,
                },
            };

            const errors = validateParameter(param, undefined);
            assert.equal(errors.length, 0);
        });
    });

    describe('validateEndpointSchema', () => {
        test('validate complete endpoint with all parameter types', () => {
            const schema: APIEndpointSchema = {
                id: 'createOrder',
                method: 'POST',
                path: '/api/v1/users/{userId}/orders',
                pathParams: [
                    { name: 'userId', type: 'string', location: 'path', required: true },
                ],
                queryParams: [
                    { name: 'dryRun', type: 'boolean', location: 'query', required: false },
                ],
                bodyParams: [
                    { name: 'symbol', type: 'string', location: 'body', required: true },
                    { name: 'side', type: 'string', location: 'body', required: true, enum: ['buy', 'sell'] },
                    { name: 'amount', type: 'number', location: 'body', required: true, validation: { min: 0.01 } },
                ],
            };

            const validParams = {
                userId: 'user123',
                dryRun: false,
                symbol: 'BTC/USD',
                side: 'buy',
                amount: 1.5,
            };

            const errors = validateEndpointSchema(schema, validParams);
            assert.equal(errors.length, 0);
        });

        test('collect all validation errors from multiple parameters', () => {
            const schema: APIEndpointSchema = {
                id: 'createOrder',
                method: 'POST',
                path: '/api/v1/orders',
                bodyParams: [
                    { name: 'symbol', type: 'string', location: 'body', required: true },
                    { name: 'side', type: 'string', location: 'body', required: true },
                    { name: 'amount', type: 'number', location: 'body', required: true },
                ],
            };

            const invalidParams = {};

            const errors = validateEndpointSchema(schema, invalidParams);
            assert.equal(errors.length, 3); // All three required params are missing
            assert.ok(errors.every(e => e.code === 'REQUIRED'));
        });

        test('validate endpoint with mixed valid and invalid parameters', () => {
            const schema: APIEndpointSchema = {
                id: 'updateOrder',
                method: 'PUT',
                path: '/api/v1/orders/{orderId}',
                pathParams: [
                    { name: 'orderId', type: 'string', location: 'path', required: true },
                ],
                bodyParams: [
                    { name: 'amount', type: 'number', location: 'body', required: false, validation: { min: 0.01 } },
                    { name: 'price', type: 'number', location: 'body', required: false, validation: { min: 0.01 } },
                ],
            };

            const params = {
                orderId: 'order123',
                amount: 0.001, // Invalid: below min
                price: 100, // Valid
            };

            const errors = validateEndpointSchema(schema, params);
            assert.equal(errors.length, 1);
            assert.equal(errors[0].parameter, 'amount');
            assert.equal(errors[0].code, 'MIN_VALUE');
        });
    });

    describe('extractParameters', () => {
        test('extract all parameter types from endpoint schema', () => {
            const schema: APIEndpointSchema = {
                id: 'createOrder',
                method: 'POST',
                path: '/api/v1/users/{userId}/orders',
                pathParams: [
                    { name: 'userId', type: 'string', location: 'path', required: true },
                ],
                queryParams: [
                    { name: 'dryRun', type: 'boolean', location: 'query', required: false },
                ],
                bodyParams: [
                    { name: 'symbol', type: 'string', location: 'body', required: true },
                    { name: 'amount', type: 'number', location: 'body', required: true },
                ],
                headers: [
                    { name: 'X-API-Key', type: 'string', location: 'header', required: true },
                ],
            };

            const params = extractParameters(schema);

            assert.equal(params.path.length, 1);
            assert.equal(params.query.length, 1);
            assert.equal(params.body.length, 2);
            assert.equal(params.header.length, 1);
        });

        test('extract parameters from endpoint with no parameters', () => {
            const schema: APIEndpointSchema = {
                id: 'getStatus',
                method: 'GET',
                path: '/api/v1/status',
            };

            const params = extractParameters(schema);

            assert.equal(params.path.length, 0);
            assert.equal(params.query.length, 0);
            assert.equal(params.body.length, 0);
            assert.equal(params.header.length, 0);
        });
    });

    describe('getRequiredParameters', () => {
        test('get all required parameter names', () => {
            const schema: APIEndpointSchema = {
                id: 'createOrder',
                method: 'POST',
                path: '/api/v1/orders',
                bodyParams: [
                    { name: 'symbol', type: 'string', location: 'body', required: true },
                    { name: 'side', type: 'string', location: 'body', required: true },
                    { name: 'amount', type: 'number', location: 'body', required: true },
                    { name: 'price', type: 'number', location: 'body', required: false },
                ],
            };

            const required = getRequiredParameters(schema);

            assert.equal(required.length, 3);
            assert.ok(required.includes('symbol'));
            assert.ok(required.includes('side'));
            assert.ok(required.includes('amount'));
            assert.ok(!required.includes('price'));
        });

        test('get required parameters from multiple locations', () => {
            const schema: APIEndpointSchema = {
                id: 'createOrder',
                method: 'POST',
                path: '/api/v1/users/{userId}/orders',
                pathParams: [
                    { name: 'userId', type: 'string', location: 'path', required: true },
                ],
                queryParams: [
                    { name: 'dryRun', type: 'boolean', location: 'query', required: false },
                ],
                bodyParams: [
                    { name: 'symbol', type: 'string', location: 'body', required: true },
                ],
            };

            const required = getRequiredParameters(schema);

            assert.equal(required.length, 2);
            assert.ok(required.includes('userId'));
            assert.ok(required.includes('symbol'));
        });

        test('return empty array when no parameters are required', () => {
            const schema: APIEndpointSchema = {
                id: 'listOrders',
                method: 'GET',
                path: '/api/v1/orders',
                queryParams: [
                    { name: 'limit', type: 'int', location: 'query', required: false },
                    { name: 'offset', type: 'int', location: 'query', required: false },
                ],
            };

            const required = getRequiredParameters(schema);
            assert.equal(required.length, 0);
        });
    });

    describe('matchesParameterType', () => {
        test('match string type', () => {
            assert.ok(matchesParameterType('test', 'string'));
            assert.ok(!matchesParameterType(123, 'string'));
            assert.ok(!matchesParameterType(true, 'string'));
        });

        test('match number types', () => {
            assert.ok(matchesParameterType(123, 'number'));
            assert.ok(matchesParameterType(123.45, 'float'));
            assert.ok(matchesParameterType(100, 'int'));
            assert.ok(!matchesParameterType('123', 'number'));
        });

        test('match integer type', () => {
            assert.ok(matchesParameterType(100, 'integer'));
            assert.ok(!matchesParameterType(100.5, 'integer'));
            assert.ok(matchesParameterType(100.5, 'number')); // Number allows non-integers
        });

        test('match boolean type', () => {
            assert.ok(matchesParameterType(true, 'boolean'));
            assert.ok(matchesParameterType(false, 'bool'));
            assert.ok(!matchesParameterType('true', 'boolean'));
        });

        test('match array type', () => {
            assert.ok(matchesParameterType([], 'array'));
            assert.ok(matchesParameterType([1, 2, 3], 'array'));
            assert.ok(!matchesParameterType({}, 'array'));
        });

        test('match object type', () => {
            assert.ok(matchesParameterType({}, 'object'));
            assert.ok(matchesParameterType({ key: 'value' }, 'object'));
            assert.ok(!matchesParameterType([], 'object'));
        });

        test('match timestamp types', () => {
            assert.ok(matchesParameterType(1609459200000, 'timestamp'));
            assert.ok(matchesParameterType(1609459200000, 'timestamp_ms'));
            assert.ok(matchesParameterType(1609459200000000000, 'timestamp_ns'));
        });

        test('allow null and undefined', () => {
            assert.ok(matchesParameterType(null, 'string'));
            assert.ok(matchesParameterType(undefined, 'number'));
            assert.ok(matchesParameterType(null, 'boolean'));
        });
    });
});
