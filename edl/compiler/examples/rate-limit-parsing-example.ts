/**
 * Rate Limit Configuration Parsing Example
 * Demonstrates how to use the RateLimitParser to parse and validate rate limit configurations
 */

import {
    RateLimitParser,
    parseRateLimitConfig,
    isValidRateLimitConfig,
    attachRateLimits,
    buildSchemaFromEndpoints,
    type EndpointWithRateLimit,
} from '../src/parsing/rate-limits.js';
import type { RateLimitSchema } from '../src/schemas/rate-limits.js';

// ============================================================
// Example 1: Parse a JSON configuration
// ============================================================

console.log('Example 1: Parse JSON configuration\n');

const jsonConfig = JSON.stringify({
    version: '1.0.0',
    global: {
        defaultLimit: 100,
        windowMs: 60000,
        strategy: 'sliding',
        costUnit: 'weight',
        description: 'Exchange-wide rate limits',
    },
    endpoints: {
        '/api/v1/order': {
            cost: 5,
            group: 'trading',
            description: 'Create order endpoint',
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
            description: 'Trading endpoints',
        },
        {
            name: 'public',
            limit: 1000,
            windowMs: 60000,
            endpoints: ['/api/v1/public/*'],
            description: 'Public market data',
        },
    ],
    throttle: {
        minDelay: 100,
        maxDelay: 5000,
        backoffMultiplier: 2.0,
        maxRetries: 3,
    },
});

const parser = new RateLimitParser({ validate: true });
const result = parser.parse(jsonConfig);

console.log('Parsed schema:', JSON.stringify(result.schema, null, 2));
console.log('\nValidation result:', result.validation?.valid ? 'VALID' : 'INVALID');
if (result.validation && !result.validation.valid) {
    console.log('Errors:', result.validation.errors);
}
console.log('Warnings:', result.warnings);

// ============================================================
// Example 2: Parse from object with validation
// ============================================================

console.log('\n\nExample 2: Parse from object\n');

const configObject = {
    global: {
        defaultLimit: 200,
        windowMs: 120000,
        strategy: 'token-bucket' as const,
        burstLimit: 300,
    },
    endpoints: {
        '/api/v3/order': { cost: 1 },
        '/api/v3/openOrders': { cost: 40 },
    },
};

const result2 = parseRateLimitConfig(configObject);
console.log('Global config:', result2.schema.global);
console.log('Endpoints:', result2.schema.endpoints);

// ============================================================
// Example 3: Validate an existing configuration
// ============================================================

console.log('\n\nExample 3: Validate configuration\n');

const validConfig = {
    global: {
        defaultLimit: 100,
        windowMs: 60000,
        strategy: 'sliding' as const,
    },
};

const invalidConfig = {
    global: {
        defaultLimit: -100, // Invalid: negative
        windowMs: 60000,
        strategy: 'sliding' as const,
    },
};

console.log('Valid config:', isValidRateLimitConfig(validConfig));
console.log('Invalid config:', isValidRateLimitConfig(invalidConfig));

// ============================================================
// Example 4: Build schema from endpoint metadata
// ============================================================

console.log('\n\nExample 4: Build schema from endpoints\n');

const endpoints: EndpointWithRateLimit[] = [
    {
        path: '/api/v1/order',
        method: 'POST',
        cost: 5,
        group: 'trading',
    },
    {
        path: '/api/v1/orders',
        method: 'GET',
        cost: 10,
        group: 'trading',
    },
    {
        path: '/api/v1/ticker',
        method: 'GET',
        cost: 1,
    },
];

const builtSchema = buildSchemaFromEndpoints(endpoints, {
    defaultLimit: 200,
    windowMs: 120000,
    strategy: 'sliding',
});

console.log('Built schema:', JSON.stringify(builtSchema, null, 2));

// ============================================================
// Example 5: Attach rate limits to endpoints
// ============================================================

console.log('\n\nExample 5: Attach rate limits to endpoints\n');

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

const endpointsToEnhance: EndpointWithRateLimit[] = [
    { path: '/api/v1/order', method: 'POST' },
    { path: '/api/v1/ticker', method: 'GET' },
];

const enhancedEndpoints = attachRateLimits(schema, endpointsToEnhance);

console.log('Enhanced endpoints:');
enhancedEndpoints.forEach((ep) => {
    console.log(`  ${ep.method} ${ep.path}:`);
    console.log(`    Cost: ${ep.cost}`);
    console.log(`    Group: ${ep.group || 'none'}`);
});

// ============================================================
// Example 6: Error handling
// ============================================================

console.log('\n\nExample 6: Error handling\n');

try {
    const badConfig = {
        // Missing required 'global' field
        endpoints: {
            '/api/v1/order': { cost: 5 },
        },
    };

    const badParser = new RateLimitParser({ validate: false });
    badParser.parse(badConfig);
} catch (error) {
    console.log('Caught expected error:', (error as Error).message);
}

// ============================================================
// Example 7: Custom parser options
// ============================================================

console.log('\n\nExample 7: Custom parser options\n');

const customParser = new RateLimitParser({
    validate: true,
    applyDefaults: true,
    strict: true, // Warn on unknown properties
});

const configWithUnknown = {
    global: {
        defaultLimit: 100,
        windowMs: 60000,
        strategy: 'sliding' as const,
    },
    unknownField: 'this should trigger a warning',
};

const customResult = customParser.parse(configWithUnknown);
console.log('Warnings from strict mode:', customResult.warnings);
console.log('Defaults applied:', customResult.defaultsApplied);
console.log('Cost unit (default):', customResult.schema.global.costUnit);
