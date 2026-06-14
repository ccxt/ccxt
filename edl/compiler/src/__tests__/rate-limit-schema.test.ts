/**
 * Tests for rate limit schema definitions
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
    type RateLimitSchema,
    type GlobalRateLimitSchema,
    type EndpointRateLimitSchema,
    type RateLimitGroupSchema,
    type ThrottleConfig,
    validateRateLimitSchema,
    calculateRequestCost,
    createDefaultRateLimitSchema,
    mergeRateLimitSchemas,
} from '../schemas/rate-limits.js';

describe('Rate Limit Schema', () => {
    describe('Global Rate Limit Configuration', () => {
        test('valid global rate limit config', () => {
            const global: GlobalRateLimitSchema = {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding',
            };

            assert.equal(global.defaultLimit, 100);
            assert.equal(global.windowMs, 60000);
            assert.equal(global.strategy, 'sliding');
        });

        test('global config with burst limit', () => {
            const global: GlobalRateLimitSchema = {
                defaultLimit: 100,
                windowMs: 60000,
                burstLimit: 150,
                strategy: 'token-bucket',
            };

            assert.equal(global.burstLimit, 150);
            assert.ok(global.burstLimit > global.defaultLimit);
        });

        test('global config with cost unit', () => {
            const global: GlobalRateLimitSchema = {
                defaultLimit: 1000,
                windowMs: 60000,
                costUnit: 'weight',
                strategy: 'sliding',
            };

            assert.equal(global.costUnit, 'weight');
        });

        test('all rate limit strategies are valid', () => {
            const strategies = ['sliding', 'fixed', 'token-bucket'] as const;

            strategies.forEach(strategy => {
                const global: GlobalRateLimitSchema = {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy,
                };
                assert.equal(global.strategy, strategy);
            });
        });
    });

    describe('Endpoint Rate Limit Configuration', () => {
        test('basic endpoint config with cost', () => {
            const endpoint: EndpointRateLimitSchema = {
                cost: 2,
            };

            assert.equal(endpoint.cost, 2);
        });

        test('endpoint with limit override', () => {
            const endpoint: EndpointRateLimitSchema = {
                cost: 5,
                limit: 50,
                windowMs: 30000,
            };

            assert.equal(endpoint.cost, 5);
            assert.equal(endpoint.limit, 50);
            assert.equal(endpoint.windowMs, 30000);
        });

        test('endpoint with group assignment', () => {
            const endpoint: EndpointRateLimitSchema = {
                cost: 1,
                group: 'public-endpoints',
            };

            assert.equal(endpoint.group, 'public-endpoints');
        });

        test('endpoint with custom strategy', () => {
            const endpoint: EndpointRateLimitSchema = {
                cost: 3,
                strategy: 'fixed',
            };

            assert.equal(endpoint.strategy, 'fixed');
        });
    });

    describe('Rate Limit Groups', () => {
        test('basic rate limit group', () => {
            const group: RateLimitGroupSchema = {
                name: 'trading',
                limit: 200,
                windowMs: 60000,
                endpoints: ['/api/v1/order', '/api/v1/orders'],
            };

            assert.equal(group.name, 'trading');
            assert.equal(group.limit, 200);
            assert.equal(group.windowMs, 60000);
            assert.equal(group.endpoints.length, 2);
        });

        test('group with wildcard endpoints', () => {
            const group: RateLimitGroupSchema = {
                name: 'public',
                limit: 1000,
                windowMs: 60000,
                endpoints: ['/api/v1/public/*'],
            };

            assert.ok(group.endpoints[0].includes('*'));
        });

        test('group with custom strategy', () => {
            const group: RateLimitGroupSchema = {
                name: 'heavy',
                limit: 10,
                windowMs: 60000,
                endpoints: ['/api/v1/heavy/*'],
                strategy: 'token-bucket',
            };

            assert.equal(group.strategy, 'token-bucket');
        });
    });

    describe('Throttle Configuration', () => {
        test('basic throttle config', () => {
            const throttle: ThrottleConfig = {
                minDelay: 100,
                maxDelay: 5000,
                backoffMultiplier: 2.0,
            };

            assert.equal(throttle.minDelay, 100);
            assert.equal(throttle.maxDelay, 5000);
            assert.equal(throttle.backoffMultiplier, 2.0);
        });

        test('throttle with retry configuration', () => {
            const throttle: ThrottleConfig = {
                minDelay: 100,
                maxDelay: 10000,
                backoffMultiplier: 2.0,
                initialDelay: 200,
                maxRetries: 3,
            };

            assert.equal(throttle.initialDelay, 200);
            assert.equal(throttle.maxRetries, 3);
        });

        test('throttle with jitter', () => {
            const throttle: ThrottleConfig = {
                minDelay: 100,
                maxDelay: 5000,
                backoffMultiplier: 2.0,
                jitter: 0.1,
            };

            assert.equal(throttle.jitter, 0.1);
            assert.ok(throttle.jitter >= 0 && throttle.jitter <= 1);
        });
    });

    describe('Complete Rate Limit Schema', () => {
        test('minimal valid schema', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(result.valid, `Schema should be valid: ${JSON.stringify(result.errors)}`);
            assert.equal(result.errors.length, 0);
        });

        test('schema with endpoint overrides', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                        limit: 50,
                    },
                    '/api/v1/ticker': {
                        cost: 1,
                    },
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(result.valid);
        });

        test('schema with groups', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 200,
                        windowMs: 60000,
                        endpoints: ['/api/v1/order', '/api/v1/orders'],
                    },
                    {
                        name: 'public',
                        limit: 1000,
                        windowMs: 60000,
                        endpoints: ['/api/v1/public/*'],
                    },
                ],
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(result.valid);
        });

        test('schema with throttle', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                throttle: {
                    minDelay: 100,
                    maxDelay: 5000,
                    backoffMultiplier: 2.0,
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(result.valid);
        });

        test('complete schema with all features', () => {
            const schema: RateLimitSchema = {
                version: '1.0.0',
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    burstLimit: 150,
                    costUnit: 'weight',
                    strategy: 'token-bucket',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                        group: 'trading',
                    },
                    '/api/v1/ticker': {
                        cost: 1,
                        group: 'public',
                    },
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 200,
                        windowMs: 60000,
                        endpoints: ['/api/v1/order*'],
                    },
                    {
                        name: 'public',
                        limit: 1000,
                        windowMs: 60000,
                        endpoints: ['/api/v1/public/*'],
                    },
                ],
                throttle: {
                    minDelay: 100,
                    maxDelay: 5000,
                    backoffMultiplier: 2.0,
                    initialDelay: 200,
                    maxRetries: 3,
                    jitter: 0.1,
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(result.valid, `Schema should be valid: ${JSON.stringify(result.errors)}`);
        });
    });

    describe('Schema Validation', () => {
        test('rejects missing global config', () => {
            const schema = {} as RateLimitSchema;
            const result = validateRateLimitSchema(schema);

            assert.ok(!result.valid);
            assert.ok(result.errors.length > 0);
            assert.ok(result.errors.some(e => e.path === 'global'));
        });

        test('rejects zero or negative default limit', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 0,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path === 'global.defaultLimit'));
        });

        test('rejects zero or negative window', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: -1000,
                    strategy: 'sliding',
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path === 'global.windowMs'));
        });

        test('rejects burst limit less than default limit', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    burstLimit: 50,
                    strategy: 'sliding',
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path === 'global.burstLimit'));
        });

        test('rejects invalid strategy', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'invalid' as any,
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path === 'global.strategy'));
        });

        test('rejects zero or negative endpoint cost', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 0,
                    },
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path.includes('cost')));
        });

        test('rejects duplicate group names', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 200,
                        windowMs: 60000,
                        endpoints: ['/api/v1/order'],
                    },
                    {
                        name: 'trading', // Duplicate
                        limit: 300,
                        windowMs: 60000,
                        endpoints: ['/api/v1/orders'],
                    },
                ],
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.message.includes('Duplicate')));
        });

        test('rejects non-existent group reference', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                        group: 'nonexistent',
                    },
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.message.includes('does not exist')));
        });

        test('warns about endpoint with both group and custom limit', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                        group: 'trading',
                        limit: 50, // Custom limit
                    },
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 200,
                        windowMs: 60000,
                        endpoints: ['/api/v1/order'],
                    },
                ],
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(result.warnings.length > 0);
            assert.ok(result.warnings.some(w => w.message.includes('both group and custom limit')));
        });

        test('rejects invalid throttle config', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                throttle: {
                    minDelay: 5000,
                    maxDelay: 1000, // Less than minDelay
                    backoffMultiplier: 2.0,
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path === 'throttle.maxDelay'));
        });

        test('rejects negative throttle delays', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                throttle: {
                    minDelay: -100,
                    maxDelay: 5000,
                    backoffMultiplier: 2.0,
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path === 'throttle.minDelay'));
        });

        test('rejects invalid jitter value', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                throttle: {
                    minDelay: 100,
                    maxDelay: 5000,
                    backoffMultiplier: 2.0,
                    jitter: 1.5, // Must be 0-1
                },
            };

            const result = validateRateLimitSchema(schema);
            assert.ok(!result.valid);
            assert.ok(result.errors.some(e => e.path === 'throttle.jitter'));
        });
    });

    describe('Request Cost Calculation', () => {
        test('calculates default cost for unknown endpoint', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
            };

            const cost = calculateRequestCost('/api/v1/unknown', schema);
            assert.equal(cost.cost, 1);
            assert.equal(cost.limit, 100);
            assert.equal(cost.windowMs, 60000);
            assert.equal(cost.strategy, 'sliding');
        });

        test('calculates cost for configured endpoint', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                    },
                },
            };

            const cost = calculateRequestCost('/api/v1/order', schema);
            assert.equal(cost.cost, 5);
            assert.equal(cost.limit, 100);
        });

        test('applies endpoint limit override', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                        limit: 50,
                        windowMs: 30000,
                    },
                },
            };

            const cost = calculateRequestCost('/api/v1/order', schema);
            assert.equal(cost.cost, 5);
            assert.equal(cost.limit, 50);
            assert.equal(cost.windowMs, 30000);
        });

        test('applies group rate limit', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                        group: 'trading',
                    },
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 200,
                        windowMs: 60000,
                        endpoints: ['/api/v1/order'],
                    },
                ],
            };

            const cost = calculateRequestCost('/api/v1/order', schema);
            assert.equal(cost.cost, 5);
            assert.equal(cost.limit, 200);
            assert.equal(cost.group, 'trading');
        });

        test('endpoint override takes precedence over group', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                        group: 'trading',
                        limit: 75, // Override
                    },
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 200,
                        windowMs: 60000,
                        endpoints: ['/api/v1/order'],
                    },
                ],
            };

            const cost = calculateRequestCost('/api/v1/order', schema);
            assert.equal(cost.limit, 75); // Endpoint override, not group limit
        });

        test('matches wildcard endpoint patterns', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                groups: [
                    {
                        name: 'public',
                        limit: 1000,
                        windowMs: 60000,
                        endpoints: ['/api/v1/public/*'],
                    },
                ],
            };

            const cost = calculateRequestCost('/api/v1/public/ticker', schema);
            assert.equal(cost.limit, 1000);
            assert.equal(cost.group, 'public');
        });

        test('applies param-based cost overrides when context provided', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/ticker': {
                        cost: 40,
                        costMetadata: {
                            paramCosts: [
                                { param: 'symbol', cost: 1 },
                            ],
                        },
                    },
                },
            };

            const defaultCost = calculateRequestCost('/api/v1/ticker', schema);
            assert.equal(defaultCost.cost, 40);

            const symbolCost = calculateRequestCost('/api/v1/ticker', schema, {
                params: { symbol: 'BTC/USDT' },
            });
            assert.equal(symbolCost.cost, 1);
        });

        test('applies limit tier overrides using metadata', () => {
            const schema: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/depth': {
                        cost: 5,
                        costMetadata: {
                            limitCosts: {
                                param: 'limit',
                                operator: 'lte',
                                tiers: [
                                    { threshold: 100, cost: 5 },
                                    { threshold: 1000, cost: 10 },
                                ],
                            },
                        },
                    },
                },
            };

            const lowLimit = calculateRequestCost('/api/v1/depth', schema, {
                params: { limit: 50 },
            });
            assert.equal(lowLimit.cost, 5);

            const highLimit = calculateRequestCost('/api/v1/depth', schema, {
                params: { limit: 500 },
            });
            assert.equal(highLimit.cost, 10);
        });
    });

    describe('Helper Functions', () => {
        test('creates default schema', () => {
            const schema = createDefaultRateLimitSchema();
            assert.equal(schema.global.defaultLimit, 100);
            assert.equal(schema.global.windowMs, 60000);
            assert.equal(schema.global.strategy, 'sliding');
        });

        test('creates default schema with custom values', () => {
            const schema = createDefaultRateLimitSchema(200, 120000);
            assert.equal(schema.global.defaultLimit, 200);
            assert.equal(schema.global.windowMs, 120000);
        });

        test('merges schemas', () => {
            const schema1: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
            };

            const schema2: RateLimitSchema = {
                global: {
                    defaultLimit: 200,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                endpoints: {
                    '/api/v1/order': {
                        cost: 5,
                    },
                },
            };

            const merged = mergeRateLimitSchemas(schema1, schema2);
            assert.equal(merged.global.defaultLimit, 200); // Override from schema2
            assert.ok(merged.endpoints);
            assert.equal(merged.endpoints['/api/v1/order'].cost, 5);
        });

        test('merges groups correctly', () => {
            const schema1: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 200,
                        windowMs: 60000,
                        endpoints: ['/api/v1/order'],
                    },
                ],
            };

            const schema2: RateLimitSchema = {
                global: {
                    defaultLimit: 100,
                    windowMs: 60000,
                    strategy: 'sliding',
                },
                groups: [
                    {
                        name: 'trading',
                        limit: 300, // Override
                        windowMs: 60000,
                        endpoints: ['/api/v1/orders'],
                    },
                    {
                        name: 'public',
                        limit: 1000,
                        windowMs: 60000,
                        endpoints: ['/api/v1/public/*'],
                    },
                ],
            };

            const merged = mergeRateLimitSchemas(schema1, schema2);
            assert.ok(merged.groups);
            assert.equal(merged.groups.length, 2);
            const tradingGroup = merged.groups.find(g => g.name === 'trading');
            assert.equal(tradingGroup?.limit, 300); // Overridden
        });
    });
});
