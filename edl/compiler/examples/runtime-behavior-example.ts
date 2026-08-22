/**
 * Runtime Behavior Schema Usage Examples
 * Demonstrates how to use the runtime behavior schemas in practice
 */

import {
    RuntimeBehaviorSchema,
    AutoResubscribeConfig,
    PingPongConfig,
    ConnectionLimitsConfig,
    CCXTIntegrationConfig,
    validateRuntimeBehavior,
    getDefaultRuntimeBehavior,
    mergeWithDefaults,
} from '../src/schemas/runtime-behavior.js';

// ============================================================
// Example 1: Basic Configuration with Defaults
// ============================================================

console.log('Example 1: Using Default Configuration');
console.log('=====================================\n');

const defaultConfig = getDefaultRuntimeBehavior();
console.log('Default configuration:', JSON.stringify(defaultConfig, null, 2));

const validation1 = validateRuntimeBehavior(defaultConfig);
console.log('Is valid?', validation1.valid);
console.log('\n');

// ============================================================
// Example 2: Custom Reconnection Configuration
// ============================================================

console.log('Example 2: Custom Reconnection Strategy');
console.log('======================================\n');

const customReconnection: RuntimeBehaviorSchema = {
    reconnection: {
        enabled: true,
        strategy: 'linear-backoff',
        maxRetries: 3,
        initialDelayMs: 500,
        maxDelayMs: 5000,
        backoffMultiplier: 1.5,
        channels: ['ticker', 'trades'], // Only auto-resubscribe specific channels
        preserveSubscriptionState: true,
    },
    pingPong: {
        enabled: true,
        intervalMs: 20000,
        timeoutMs: 5000,
        onTimeout: 'reconnect',
    },
};

const validation2 = validateRuntimeBehavior(customReconnection);
console.log('Custom reconnection config:', JSON.stringify(customReconnection, null, 2));
console.log('Is valid?', validation2.valid);
console.log('\n');

// ============================================================
// Example 3: Exchange-Specific Ping/Pong
// ============================================================

console.log('Example 3: Custom Ping/Pong Messages');
console.log('===================================\n');

const customPingPong: RuntimeBehaviorSchema = {
    pingPong: {
        enabled: true,
        intervalMs: 30000,
        timeoutMs: 10000,
        // Some exchanges use custom ping message format
        pingMessage: {
            method: 'ping',
            params: [],
            id: 1,
        },
        pongField: 'result', // Field to check in response
        onTimeout: 'error',
    },
};

const validation3 = validateRuntimeBehavior(customPingPong);
console.log('Custom ping/pong config:', JSON.stringify(customPingPong, null, 2));
console.log('Is valid?', validation3.valid);
console.log('\n');

// ============================================================
// Example 4: Connection Limits for High-Volume Trading
// ============================================================

console.log('Example 4: Connection Limits Configuration');
console.log('========================================\n');

const highVolumeConfig: RuntimeBehaviorSchema = {
    connectionLimits: {
        maxConnections: 10, // Allow more connections
        maxSubscriptionsPerConnection: 100, // Limit per connection
        maxMessagesPerSecond: 50, // Rate limit
        connectionTimeoutMs: 10000, // Faster timeout
        idleTimeoutMs: 60000, // Close idle connections after 1 minute
    },
};

const validation4 = validateRuntimeBehavior(highVolumeConfig);
console.log('High volume config:', JSON.stringify(highVolumeConfig, null, 2));
console.log('Is valid?', validation4.valid);
console.log('\n');

// ============================================================
// Example 5: CCXT Integration Mapping
// ============================================================

console.log('Example 5: CCXT Integration Configuration');
console.log('=======================================\n');

const ccxtConfig: RuntimeBehaviorSchema = {
    ccxtIntegration: {
        watchMethods: [
            {
                method: 'watchTicker',
                channel: 'ticker',
                parser: 'parseTicker',
                requiresAuth: false,
            },
            {
                method: 'watchTrades',
                channel: 'trade',
                parser: 'parseTrade',
                requiresAuth: false,
            },
            {
                method: 'watchOrderBook',
                channel: 'depth',
                parser: 'parseOrderBook',
                requiresAuth: false,
            },
            {
                method: 'watchOrders',
                channel: 'executionReport',
                parser: 'parseOrder',
                requiresAuth: true, // Private channel
            },
            {
                method: 'watchBalance',
                channel: 'outboundAccountPosition',
                parser: 'parseBalance',
                requiresAuth: true, // Private channel
            },
        ],
        orderBookDepth: 50, // Deeper order book
        tradesLimit: 100, // More historical trades
        snapshotOnConnect: true,
    },
};

const validation5 = validateRuntimeBehavior(ccxtConfig);
console.log('CCXT integration config:', JSON.stringify(ccxtConfig, null, 2));
console.log('Is valid?', validation5.valid);
console.log('\n');

// ============================================================
// Example 6: Merging User Config with Defaults
// ============================================================

console.log('Example 6: Merging User Config with Defaults');
console.log('==========================================\n');

const userConfig: Partial<RuntimeBehaviorSchema> = {
    reconnection: {
        enabled: true,
        strategy: 'exponential-backoff',
        maxRetries: 5, // Override default
    },
    // Don't specify pingPong - will use defaults
    connectionLimits: {
        maxConnections: 3, // Override default
    },
    // Don't specify heartbeat - will use defaults
};

const mergedConfig = mergeWithDefaults(userConfig);
console.log('User config:', JSON.stringify(userConfig, null, 2));
console.log('\nMerged with defaults:', JSON.stringify(mergedConfig, null, 2));

const validation6 = validateRuntimeBehavior(mergedConfig);
console.log('\nIs merged config valid?', validation6.valid);
console.log('\n');

// ============================================================
// Example 7: Invalid Configuration (Error Handling)
// ============================================================

console.log('Example 7: Handling Invalid Configuration');
console.log('=======================================\n');

const invalidConfig: any = {
    reconnection: {
        enabled: true,
        strategy: 'invalid-strategy', // Invalid!
        maxRetries: -5, // Invalid!
        initialDelayMs: 10000,
        maxDelayMs: 1000, // Invalid: maxDelay < initialDelay
    },
    pingPong: {
        enabled: true,
        intervalMs: 10000,
        timeoutMs: 20000, // Invalid: timeout > interval
    },
    connectionLimits: {
        maxConnections: 0, // Invalid: must be positive
    },
};

const validation7 = validateRuntimeBehavior(invalidConfig);
console.log('Invalid config:', JSON.stringify(invalidConfig, null, 2));
console.log('\nIs valid?', validation7.valid);
console.log('Validation errors:');
validation7.errors.forEach((error) => {
    console.log(`  - ${error.field}: ${error.message}`);
});
console.log('\n');

// ============================================================
// Example 8: Complete Exchange Configuration
// ============================================================

console.log('Example 8: Complete Exchange Configuration');
console.log('========================================\n');

const completeExchangeConfig: RuntimeBehaviorSchema = {
    reconnection: {
        enabled: true,
        strategy: 'exponential-backoff',
        maxRetries: 10,
        initialDelayMs: 1000,
        maxDelayMs: 60000,
        backoffMultiplier: 2,
        preserveSubscriptionState: true,
    },
    pingPong: {
        enabled: true,
        intervalMs: 30000,
        timeoutMs: 10000,
        pingMessage: 'ping',
        onTimeout: 'reconnect',
    },
    connectionLimits: {
        maxConnections: 5,
        maxSubscriptionsPerConnection: 200,
        maxMessagesPerSecond: 10,
        connectionTimeoutMs: 30000,
        idleTimeoutMs: 300000,
    },
    heartbeat: {
        enabled: false, // Using ping/pong instead
        intervalMs: 30000,
    },
    ccxtIntegration: {
        watchMethods: [
            {
                method: 'watchTicker',
                channel: '24hrTicker',
                parser: 'parseTicker',
            },
            {
                method: 'watchTrades',
                channel: 'trade',
                parser: 'parseTrade',
            },
            {
                method: 'watchOrderBook',
                channel: 'depthUpdate',
                parser: 'parseOrderBook',
            },
            {
                method: 'watchOHLCV',
                channel: 'kline',
                parser: 'parseOHLCV',
            },
        ],
        orderBookDepth: 20,
        tradesLimit: 50,
        snapshotOnConnect: true,
    },
};

const validation8 = validateRuntimeBehavior(completeExchangeConfig);
console.log('Complete exchange config:', JSON.stringify(completeExchangeConfig, null, 2));
console.log('\nIs valid?', validation8.valid);
console.log('Errors:', validation8.errors);
