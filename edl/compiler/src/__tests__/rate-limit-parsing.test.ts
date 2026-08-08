/**
 * Tests for rate limit configuration parsing
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
    RateLimitParser,
    parseRateLimitConfig,
    validateParsedSchema,
    isValidRateLimitConfig,
    attachRateLimits,
    buildSchemaFromEndpoints,
    type RateLimitParserOptions,
    type EndpointWithRateLimit,
} from '../parsing/rate-limits.js';
import type {
    RateLimitSchema,
    GlobalRateLimitSchema,
    EndpointRateLimitSchema,
} from '../schemas/rate-limits.js';

// ============================================================
// Basic Parsing Tests
// ============================================================

describe('Rate Limit Parser - Basic Parsing', () => {
    test('parses minimal valid JSON configuration', () => {
        const json = JSON.stringify({
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding',
            },
        });

        const parser = new RateLimitParser();
        const result = parser.parse(json);

        assert.ok(result.schema);
        assert.equal(result.schema.global.defaultLimit, 100);
        assert.equal(result.schema.global.windowMs, 60000);
        assert.equal(result.schema.global.strategy, 'sliding');
        assert.equal(result.sourceFormat, 'json');
    });

    test('parses object configuration directly', () => {
        const config = {
            global: {
                defaultLimit: 200,
                windowMs: 120000,
                strategy: 'fixed' as const,
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.equal(result.schema.global.defaultLimit, 200);
        assert.equal(result.schema.global.strategy, 'fixed');
        assert.equal(result.sourceFormat, 'object');
    });

    test('parses global config with all fields', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                burstLimit: 150,
                costUnit: 'weight',
                strategy: 'token-bucket',
                description: 'Global rate limit',
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);
        const global = result.schema.global;

        assert.equal(global.defaultLimit, 100);
        assert.equal(global.windowMs, 60000);
        assert.equal(global.burstLimit, 150);
        assert.equal(global.costUnit, 'weight');
        assert.equal(global.strategy, 'token-bucket');
        assert.equal(global.description, 'Global rate limit');
    });

    test('parses schema with version', () => {
        const config = {
            version: '1.0.0',
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.equal(result.schema.version, '1.0.0');
    });
});

// ============================================================
// Endpoint Parsing Tests
// ============================================================

describe('Rate Limit Parser - Endpoints', () => {
    test('parses endpoint configurations', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            endpoints: {
                '/api/v1/order': {
                    cost: 5,
                },
                '/api/v1/ticker': {
                    cost: 1,
                    limit: 200,
                },
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.schema.endpoints);
        assert.equal(result.schema.endpoints['/api/v1/order'].cost, 5);
        assert.equal(result.schema.endpoints['/api/v1/ticker'].cost, 1);
        assert.equal(result.schema.endpoints['/api/v1/ticker'].limit, 200);
    });

    test('parses endpoint with all fields', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            endpoints: {
                '/api/v1/order': {
                    cost: 5,
                    limit: 50,
                    windowMs: 30000,
                    group: 'trading',
                    description: 'Order creation endpoint',
                    strategy: 'fixed' as const,
                },
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);
        const endpoint = result.schema.endpoints!['/api/v1/order'];

        assert.equal(endpoint.cost, 5);
        assert.equal(endpoint.limit, 50);
        assert.equal(endpoint.windowMs, 30000);
        assert.equal(endpoint.group, 'trading');
        assert.equal(endpoint.description, 'Order creation endpoint');
        assert.equal(endpoint.strategy, 'fixed');
    });

    test('parses multiple endpoints', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            endpoints: {
                '/api/v1/order': { cost: 5 },
                '/api/v1/orders': { cost: 3 },
                '/api/v1/ticker': { cost: 1 },
                '/api/v1/orderbook': { cost: 2 },
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.schema.endpoints);
        assert.equal(Object.keys(result.schema.endpoints).length, 4);
    });

    test('parses endpoint cost metadata', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            endpoints: {
                '/api/v1/depth': {
                    cost: 10,
                    costMetadata: {
                        defaultCost: 10,
                        byParam: {
                            symbol: 1,
                        },
                        byLimit: [
                            [100, 5],
                            [1000, 10],
                        ],
                        limitOperator: 'lte',
                    },
                },
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);
        const metadata = result.schema.endpoints!['/api/v1/depth'].costMetadata;

        assert.ok(metadata);
        assert.equal(metadata?.paramCosts?.[0].param, 'symbol');
        assert.equal(metadata?.limitCosts?.tiers.length, 2);
    });
});

// ============================================================
// Group Parsing Tests
// ============================================================

describe('Rate Limit Parser - Groups', () => {
    test('parses rate limit groups', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            groups: [
                {
                    name: 'trading',
                    limit: 200,
                    windowMs: 60000,
                    endpoints: ['/api/v1/order', '/api/v1/orders'],
                },
            ],
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.schema.groups);
        assert.equal(result.schema.groups.length, 1);
        assert.equal(result.schema.groups[0].name, 'trading');
        assert.equal(result.schema.groups[0].limit, 200);
        assert.equal(result.schema.groups[0].endpoints.length, 2);
    });

    test('parses groups with all fields', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            groups: [
                {
                    name: 'public',
                    limit: 1000,
                    windowMs: 60000,
                    endpoints: ['/api/v1/public/*'],
                    description: 'Public endpoints',
                    strategy: 'fixed' as const,
                },
            ],
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);
        const group = result.schema.groups![0];

        assert.equal(group.name, 'public');
        assert.equal(group.limit, 1000);
        assert.equal(group.description, 'Public endpoints');
        assert.equal(group.strategy, 'fixed');
    });

    test('parses multiple groups', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
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
                {
                    name: 'account',
                    limit: 100,
                    windowMs: 60000,
                    endpoints: ['/api/v1/account/*'],
                },
            ],
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.schema.groups);
        assert.equal(result.schema.groups.length, 3);
    });
});

// ============================================================
// Throttle Parsing Tests
// ============================================================

describe('Rate Limit Parser - Throttle', () => {
    test('parses throttle configuration', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            throttle: {
                minDelay: 100,
                maxDelay: 5000,
                backoffMultiplier: 2.0,
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.schema.throttle);
        assert.equal(result.schema.throttle.minDelay, 100);
        assert.equal(result.schema.throttle.maxDelay, 5000);
        assert.equal(result.schema.throttle.backoffMultiplier, 2.0);
    });

    test('parses throttle with all fields', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            throttle: {
                minDelay: 100,
                maxDelay: 10000,
                backoffMultiplier: 2.0,
                initialDelay: 200,
                maxRetries: 3,
                jitter: 0.1,
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);
        const throttle = result.schema.throttle!;

        assert.equal(throttle.minDelay, 100);
        assert.equal(throttle.maxDelay, 10000);
        assert.equal(throttle.backoffMultiplier, 2.0);
        assert.equal(throttle.initialDelay, 200);
        assert.equal(throttle.maxRetries, 3);
        assert.equal(throttle.jitter, 0.1);
    });
});

// ============================================================
// Validation Tests
// ============================================================

describe('Rate Limit Parser - Validation', () => {
    test('validates schema after parsing by default', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.validation);
        assert.ok(result.validation.valid);
        assert.equal(result.validation.errors.length, 0);
    });

    test('can disable validation', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const parser = new RateLimitParser({ validate: false });
        const result = parser.parse(config);

        assert.equal(result.validation, undefined);
    });

    test('detects validation errors', () => {
        const config = {
            global: {
                defaultLimit: -100, // Invalid
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.validation);
        assert.ok(!result.validation.valid);
        assert.ok(result.validation.errors.length > 0);
    });

    test('collects warnings during parsing', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
            endpoints: {
                '/api/v1/order': {
                    cost: 5,
                    group: 'trading',
                    limit: 50, // Warning: both group and custom limit
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

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.warnings.length > 0);
    });
});

// ============================================================
// Error Handling Tests
// ============================================================

describe('Rate Limit Parser - Error Handling', () => {
    test('throws on missing global configuration', () => {
        const config = {};

        const parser = new RateLimitParser({ validate: false });
        assert.throws(() => parser.parse(config), {
            message: /Global rate limit configuration is required/,
        });
    });

    test('throws on invalid JSON', () => {
        const invalidJson = '{ invalid json }';

        const parser = new RateLimitParser();
        assert.throws(() => parser.parse(invalidJson), {
            message: /Invalid JSON/,
        });
    });

    test('throws on non-object configuration', () => {
        const parser = new RateLimitParser();
        assert.throws(() => parser.parse('not an object'), {
            message: /YAML parsing requires|Invalid JSON/,
        });
    });

    test('throws on invalid strategy', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'invalid-strategy',
            },
        };

        const parser = new RateLimitParser({ validate: false });
        assert.throws(() => parser.parse(config), {
            message: /must be one of/,
        });
    });

    test('throws on invalid cost unit', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
                costUnit: 'invalid-unit',
            },
        };

        const parser = new RateLimitParser({ validate: false });
        assert.throws(() => parser.parse(config), {
            message: /must be one of/,
        });
    });

    test('throws on invalid number fields', () => {
        const config = {
            global: {
                defaultLimit: 'not-a-number',
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const parser = new RateLimitParser({ validate: false });
        assert.throws(() => parser.parse(config), {
            message: /must be a number/,
        });
    });
});

// ============================================================
// Default Application Tests
// ============================================================

describe('Rate Limit Parser - Defaults', () => {
    test('applies default cost unit when missing', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const parser = new RateLimitParser({ applyDefaults: true });
        const result = parser.parse(config);

        assert.equal(result.schema.global.costUnit, 'requests');
        assert.equal(result.defaultsApplied, true);
    });

    test('preserves explicit cost unit', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
                costUnit: 'weight' as const,
            },
        };

        const parser = new RateLimitParser({ applyDefaults: true });
        const result = parser.parse(config);

        assert.equal(result.schema.global.costUnit, 'weight');
    });

    test('can disable default application', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const parser = new RateLimitParser({ applyDefaults: false });
        const result = parser.parse(config);

        assert.equal(result.schema.global.costUnit, undefined);
        assert.equal(result.defaultsApplied, false);
    });
});

// ============================================================
// Integration Function Tests
// ============================================================

describe('Rate Limit Parser - Integration Functions', () => {
    test('parseRateLimitConfig utility function', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding' as const,
            },
        };

        const result = parseRateLimitConfig(config);
        assert.ok(result.schema);
        assert.equal(result.schema.global.defaultLimit, 100);
    });

    test('validateParsedSchema utility function', () => {
        const schema: RateLimitSchema = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding',
            },
        };

        const result = validateParsedSchema(schema);
        assert.ok(result.valid);
    });

    test('isValidRateLimitConfig utility function - valid', () => {
        const config = {
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                strategy: 'sliding',
            },
        };

        assert.ok(isValidRateLimitConfig(config));
    });

    test('isValidRateLimitConfig utility function - invalid', () => {
        const config = {
            global: {
                defaultLimit: -100,
                windowMs: 60000,
                strategy: 'sliding',
            },
        };

        assert.ok(!isValidRateLimitConfig(config));
    });
});

// ============================================================
// Endpoint Integration Tests
// ============================================================

describe('Rate Limit Parser - Endpoint Integration', () => {
    test('attachRateLimits adds rate limit info to endpoints', () => {
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

        const endpoints: EndpointWithRateLimit[] = [
            { path: '/api/v1/order', method: 'POST' },
            { path: '/api/v1/ticker', method: 'GET' },
        ];

        const result = attachRateLimits(schema, endpoints);

        assert.equal(result.length, 2);
        assert.equal(result[0].cost, 5);
        assert.equal(result[0].group, 'trading');
        assert.equal(result[1].cost, 1); // Default cost
    });

    test('buildSchemaFromEndpoints creates schema from endpoint metadata', () => {
        const endpoints: EndpointWithRateLimit[] = [
            { path: '/api/v1/order', method: 'POST', cost: 5, group: 'trading' },
            { path: '/api/v1/ticker', method: 'GET', cost: 1 },
            { path: '/api/v1/orderbook', method: 'GET', cost: 2 },
        ];

        const schema = buildSchemaFromEndpoints(endpoints, {
            defaultLimit: 200,
            windowMs: 120000,
        });

        assert.equal(schema.global.defaultLimit, 200);
        assert.equal(schema.global.windowMs, 120000);
        assert.ok(schema.endpoints);
        assert.equal(schema.endpoints['/api/v1/order'].cost, 5);
        assert.equal(schema.endpoints['/api/v1/order'].group, 'trading');
        assert.equal(schema.endpoints['/api/v1/ticker'].cost, 1);
    });

    test('buildSchemaFromEndpoints uses defaults when not provided', () => {
        const endpoints: EndpointWithRateLimit[] = [
            { path: '/api/v1/order', method: 'POST', cost: 5 },
        ];

        const schema = buildSchemaFromEndpoints(endpoints);

        assert.equal(schema.global.defaultLimit, 100);
        assert.equal(schema.global.windowMs, 60000);
        assert.equal(schema.global.strategy, 'sliding');
    });

    test('buildSchemaFromEndpoints normalizes structured cost metadata', () => {
        const endpoints: EndpointWithRateLimit[] = [
            {
                path: '/api/v1/ticker',
                method: 'GET',
                cost: {
                    default: 40,
                    byParam: {
                        symbol: 1,
                    },
                },
            },
        ];

        const schema = buildSchemaFromEndpoints(endpoints);
        const endpointConfig = schema.endpoints!['/api/v1/ticker'];

        assert.equal(endpointConfig.cost, 40);
        assert.ok(endpointConfig.costMetadata);
        assert.equal(endpointConfig.costMetadata?.paramCosts?.[0].param, 'symbol');
        assert.equal(endpointConfig.costMetadata?.paramCosts?.[0].cost, 1);
    });
});

// ============================================================
// Complex Configuration Tests
// ============================================================

describe('Rate Limit Parser - Complex Configurations', () => {
    test('parses complete configuration with all features', () => {
        const config = {
            version: '1.0.0',
            global: {
                defaultLimit: 100,
                windowMs: 60000,
                burstLimit: 150,
                costUnit: 'weight',
                strategy: 'token-bucket',
                description: 'Binance-style rate limiting',
            },
            endpoints: {
                '/api/v1/order': {
                    cost: 5,
                    group: 'trading',
                },
                '/api/v1/orders': {
                    cost: 10,
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
                    strategy: 'sliding',
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

        const parser = new RateLimitParser();
        const result = parser.parse(config);

        assert.ok(result.validation?.valid);
        assert.equal(result.schema.version, '1.0.0');
        assert.equal(result.schema.global.defaultLimit, 100);
        assert.equal(Object.keys(result.schema.endpoints!).length, 3);
        assert.equal(result.schema.groups!.length, 2);
        assert.ok(result.schema.throttle);
    });
});
