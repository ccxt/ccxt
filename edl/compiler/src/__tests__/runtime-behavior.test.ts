/**
 * Runtime Behavior Schemas Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    ReconnectionStrategy,
    AutoResubscribeConfig,
    PingPongConfig,
    ConnectionLimitsConfig,
    HeartbeatConfig,
    CCXTIntegrationConfig,
    WatchMethodConfig,
    RuntimeBehaviorSchema,
    validateAutoResubscribeConfig,
    validatePingPongConfig,
    validateConnectionLimitsConfig,
    validateHeartbeatConfig,
    validateCCXTIntegrationConfig,
    validateRuntimeBehavior,
    getDefaultRuntimeBehavior,
    mergeWithDefaults,
} from '../schemas/runtime-behavior.js';

// ============================================================
// Auto-Resubscribe Configuration Tests
// ============================================================

test('validateAutoResubscribeConfig should accept valid exponential backoff config', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'exponential-backoff',
        maxRetries: 5,
        initialDelayMs: 1000,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
        preserveSubscriptionState: true,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateAutoResubscribeConfig should accept valid linear backoff config', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'linear-backoff',
        maxRetries: 10,
        initialDelayMs: 500,
        maxDelayMs: 10000,
        backoffMultiplier: 1.5,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateAutoResubscribeConfig should accept immediate strategy', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'immediate',
        maxRetries: 3,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateAutoResubscribeConfig should accept none strategy', () => {
    const config: AutoResubscribeConfig = {
        enabled: false,
        strategy: 'none',
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateAutoResubscribeConfig should accept channel-specific config', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'exponential-backoff',
        channels: ['ticker', 'trades', 'orderbook'],
        preserveSubscriptionState: true,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateAutoResubscribeConfig should reject invalid strategy', () => {
    const config: any = {
        enabled: true,
        strategy: 'invalid-strategy',
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'strategy'));
});

test('validateAutoResubscribeConfig should reject negative maxRetries', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'exponential-backoff',
        maxRetries: -1,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'maxRetries'));
});

test('validateAutoResubscribeConfig should reject negative delays', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'exponential-backoff',
        initialDelayMs: -1000,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'initialDelayMs'));
});

test('validateAutoResubscribeConfig should reject maxDelayMs < initialDelayMs', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'exponential-backoff',
        initialDelayMs: 5000,
        maxDelayMs: 1000,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'maxDelayMs'));
});

test('validateAutoResubscribeConfig should reject non-positive backoff multiplier', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'exponential-backoff',
        backoffMultiplier: 0,
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'backoffMultiplier'));
});

// ============================================================
// Ping/Pong Configuration Tests
// ============================================================

test('validatePingPongConfig should accept valid config', () => {
    const config: PingPongConfig = {
        enabled: true,
        intervalMs: 30000,
        timeoutMs: 10000,
        onTimeout: 'reconnect',
    };

    const result = validatePingPongConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validatePingPongConfig should accept custom ping message', () => {
    const config: PingPongConfig = {
        enabled: true,
        intervalMs: 20000,
        timeoutMs: 5000,
        pingMessage: { type: 'ping', timestamp: 12345 },
        pongField: 'type',
    };

    const result = validatePingPongConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validatePingPongConfig should accept string ping message', () => {
    const config: PingPongConfig = {
        enabled: true,
        intervalMs: 15000,
        timeoutMs: 5000,
        pingMessage: 'ping',
    };

    const result = validatePingPongConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validatePingPongConfig should reject timeoutMs >= intervalMs', () => {
    const config: PingPongConfig = {
        enabled: true,
        intervalMs: 10000,
        timeoutMs: 15000,
    };

    const result = validatePingPongConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'timeoutMs'));
});

test('validatePingPongConfig should reject non-positive intervalMs', () => {
    const config: PingPongConfig = {
        enabled: true,
        intervalMs: 0,
        timeoutMs: 5000,
    };

    const result = validatePingPongConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'intervalMs'));
});

test('validatePingPongConfig should reject invalid onTimeout action', () => {
    const config: any = {
        enabled: true,
        intervalMs: 30000,
        timeoutMs: 10000,
        onTimeout: 'invalid-action',
    };

    const result = validatePingPongConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'onTimeout'));
});

test('validatePingPongConfig should accept all timeout actions', () => {
    const actions = ['reconnect', 'error', 'ignore'];

    for (const action of actions) {
        const config: PingPongConfig = {
            enabled: true,
            intervalMs: 30000,
            timeoutMs: 10000,
            onTimeout: action as any,
        };

        const result = validatePingPongConfig(config);
        assert.equal(result.valid, true, `Should accept ${action}`);
    }
});

// ============================================================
// Connection Limits Configuration Tests
// ============================================================

test('validateConnectionLimitsConfig should accept valid config', () => {
    const config: ConnectionLimitsConfig = {
        maxConnections: 5,
        maxSubscriptionsPerConnection: 200,
        maxMessagesPerSecond: 10,
        connectionTimeoutMs: 30000,
        idleTimeoutMs: 300000,
    };

    const result = validateConnectionLimitsConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateConnectionLimitsConfig should accept minimal config', () => {
    const config: ConnectionLimitsConfig = {
        maxConnections: 1,
    };

    const result = validateConnectionLimitsConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateConnectionLimitsConfig should reject non-positive maxConnections', () => {
    const config: ConnectionLimitsConfig = {
        maxConnections: 0,
    };

    const result = validateConnectionLimitsConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'maxConnections'));
});

test('validateConnectionLimitsConfig should reject non-positive optional fields', () => {
    const config: ConnectionLimitsConfig = {
        maxConnections: 5,
        maxSubscriptionsPerConnection: -1,
        maxMessagesPerSecond: 0,
    };

    const result = validateConnectionLimitsConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'maxSubscriptionsPerConnection'));
    assert.ok(result.errors.some((e) => e.field === 'maxMessagesPerSecond'));
});

// ============================================================
// Heartbeat Configuration Tests
// ============================================================

test('validateHeartbeatConfig should accept valid config', () => {
    const config: HeartbeatConfig = {
        enabled: true,
        intervalMs: 30000,
        message: { type: 'heartbeat' },
        expectedResponse: 'pong',
    };

    const result = validateHeartbeatConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateHeartbeatConfig should accept minimal config', () => {
    const config: HeartbeatConfig = {
        enabled: false,
        intervalMs: 30000,
    };

    const result = validateHeartbeatConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateHeartbeatConfig should reject non-positive intervalMs', () => {
    const config: HeartbeatConfig = {
        enabled: true,
        intervalMs: -5000,
    };

    const result = validateHeartbeatConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'intervalMs'));
});

// ============================================================
// CCXT Integration Configuration Tests
// ============================================================

test('validateCCXTIntegrationConfig should accept valid config', () => {
    const config: CCXTIntegrationConfig = {
        watchMethods: [
            {
                method: 'watchTicker',
                channel: 'ticker',
                parser: 'parseTicker',
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
                channel: 'orders',
                parser: 'parseOrder',
                requiresAuth: true,
            },
        ],
        orderBookDepth: 20,
        tradesLimit: 50,
        snapshotOnConnect: true,
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateCCXTIntegrationConfig should accept minimal watch method', () => {
    const config: CCXTIntegrationConfig = {
        watchMethods: [
            {
                method: 'watchTrades',
                channel: 'trades',
                parser: 'parseTrade',
            },
        ],
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateCCXTIntegrationConfig should reject missing method field', () => {
    const config: any = {
        watchMethods: [
            {
                channel: 'ticker',
                parser: 'parseTicker',
            },
        ],
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field.includes('method')));
});

test('validateCCXTIntegrationConfig should reject missing channel field', () => {
    const config: any = {
        watchMethods: [
            {
                method: 'watchTicker',
                parser: 'parseTicker',
            },
        ],
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field.includes('channel')));
});

test('validateCCXTIntegrationConfig should reject missing parser field', () => {
    const config: any = {
        watchMethods: [
            {
                method: 'watchTicker',
                channel: 'ticker',
            },
        ],
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field.includes('parser')));
});

test('validateCCXTIntegrationConfig should reject non-positive orderBookDepth', () => {
    const config: CCXTIntegrationConfig = {
        watchMethods: [],
        orderBookDepth: -10,
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'orderBookDepth'));
});

test('validateCCXTIntegrationConfig should reject non-positive tradesLimit', () => {
    const config: CCXTIntegrationConfig = {
        watchMethods: [],
        tradesLimit: 0,
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === 'tradesLimit'));
});

// ============================================================
// Complete Runtime Behavior Validation Tests
// ============================================================

test('validateRuntimeBehavior should accept valid complete config', () => {
    const config: RuntimeBehaviorSchema = {
        reconnection: {
            enabled: true,
            strategy: 'exponential-backoff',
            maxRetries: 5,
            initialDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
        },
        pingPong: {
            enabled: true,
            intervalMs: 30000,
            timeoutMs: 10000,
        },
        connectionLimits: {
            maxConnections: 5,
            maxSubscriptionsPerConnection: 200,
        },
        heartbeat: {
            enabled: false,
            intervalMs: 30000,
        },
        ccxtIntegration: {
            watchMethods: [
                {
                    method: 'watchTicker',
                    channel: 'ticker',
                    parser: 'parseTicker',
                },
            ],
        },
    };

    const result = validateRuntimeBehavior(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateRuntimeBehavior should collect errors from multiple sections', () => {
    const config: any = {
        reconnection: {
            enabled: true,
            strategy: 'invalid',
            maxRetries: -1,
        },
        pingPong: {
            enabled: true,
            intervalMs: 10000,
            timeoutMs: 20000, // Invalid: timeout > interval
        },
        connectionLimits: {
            maxConnections: -5, // Invalid: negative
        },
    };

    const result = validateRuntimeBehavior(config);
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
    // Should have errors from reconnection, pingPong, and connectionLimits
    assert.ok(result.errors.some((e) => e.field === 'strategy'));
    assert.ok(result.errors.some((e) => e.field === 'maxRetries'));
    assert.ok(result.errors.some((e) => e.field === 'timeoutMs'));
    assert.ok(result.errors.some((e) => e.field === 'maxConnections'));
});

test('validateRuntimeBehavior should accept partial config', () => {
    const config: RuntimeBehaviorSchema = {
        reconnection: {
            enabled: true,
            strategy: 'immediate',
        },
    };

    const result = validateRuntimeBehavior(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

// ============================================================
// Default Configuration Tests
// ============================================================

test('getDefaultRuntimeBehavior should return valid config', () => {
    const defaults = getDefaultRuntimeBehavior();

    const result = validateRuntimeBehavior(defaults);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('getDefaultRuntimeBehavior should have reasonable defaults', () => {
    const defaults = getDefaultRuntimeBehavior();

    assert.equal(defaults.reconnection?.enabled, true);
    assert.equal(defaults.reconnection?.strategy, 'exponential-backoff');
    assert.ok(defaults.reconnection?.maxRetries && defaults.reconnection.maxRetries > 0);

    assert.equal(defaults.pingPong?.enabled, true);
    assert.ok(defaults.pingPong?.intervalMs && defaults.pingPong.intervalMs > 0);

    assert.ok(
        defaults.connectionLimits?.maxConnections &&
            defaults.connectionLimits.maxConnections > 0
    );

    assert.ok(Array.isArray(defaults.ccxtIntegration?.watchMethods));
});

test('getDefaultRuntimeBehavior should have heartbeat disabled by default', () => {
    const defaults = getDefaultRuntimeBehavior();
    assert.equal(defaults.heartbeat?.enabled, false);
});

// ============================================================
// Merge With Defaults Tests
// ============================================================

test('mergeWithDefaults should merge partial config with defaults', () => {
    const userConfig: Partial<RuntimeBehaviorSchema> = {
        reconnection: {
            enabled: false,
            strategy: 'none',
        },
    };

    const merged = mergeWithDefaults(userConfig);

    // User values should be applied
    assert.equal(merged.reconnection?.enabled, false);
    assert.equal(merged.reconnection?.strategy, 'none');

    // Defaults should fill in the rest
    assert.ok(merged.pingPong);
    assert.ok(merged.connectionLimits);
    assert.ok(merged.heartbeat);
    assert.ok(merged.ccxtIntegration);

    // Validate the merged config is valid
    const result = validateRuntimeBehavior(merged);
    assert.equal(result.valid, true);
});

test('mergeWithDefaults should override defaults with user values', () => {
    const userConfig: Partial<RuntimeBehaviorSchema> = {
        reconnection: {
            enabled: true,
            strategy: 'linear-backoff',
            maxRetries: 3,
            initialDelayMs: 500,
        },
        pingPong: {
            enabled: false,
            intervalMs: 60000,
            timeoutMs: 20000,
        },
    };

    const merged = mergeWithDefaults(userConfig);

    assert.equal(merged.reconnection?.maxRetries, 3);
    assert.equal(merged.reconnection?.initialDelayMs, 500);
    assert.equal(merged.pingPong?.enabled, false);
    assert.equal(merged.pingPong?.intervalMs, 60000);

    // Should still have defaults for other fields
    assert.ok(merged.reconnection?.maxDelayMs);
    assert.ok(merged.reconnection?.backoffMultiplier);
});

test('mergeWithDefaults should handle CCXT integration merge', () => {
    const userConfig: Partial<RuntimeBehaviorSchema> = {
        ccxtIntegration: {
            watchMethods: [
                {
                    method: 'watchTicker',
                    channel: 'ticker',
                    parser: 'parseTicker',
                },
                {
                    method: 'watchOrderBook',
                    channel: 'depth',
                    parser: 'parseOrderBook',
                },
            ],
            orderBookDepth: 50,
        },
    };

    const merged = mergeWithDefaults(userConfig);

    assert.equal(merged.ccxtIntegration?.watchMethods.length, 2);
    assert.equal(merged.ccxtIntegration?.orderBookDepth, 50);
    // Should still have default tradesLimit
    assert.ok(merged.ccxtIntegration?.tradesLimit);
});

test('mergeWithDefaults should handle empty user config', () => {
    const merged = mergeWithDefaults({});
    const defaults = getDefaultRuntimeBehavior();

    // Should be identical to defaults
    assert.deepEqual(merged, defaults);
});

// ============================================================
// Type Tests (Compile-time checks)
// ============================================================

test('ReconnectionStrategy should only accept valid values', () => {
    const strategies: ReconnectionStrategy[] = [
        'immediate',
        'linear-backoff',
        'exponential-backoff',
        'none',
    ];

    assert.equal(strategies.length, 4);
});

test('WatchMethodConfig should have correct structure', () => {
    const watchMethod: WatchMethodConfig = {
        method: 'watchTicker',
        channel: 'ticker',
        parser: 'parseTicker',
        requiresAuth: false,
    };

    assert.equal(watchMethod.method, 'watchTicker');
    assert.equal(watchMethod.channel, 'ticker');
    assert.equal(watchMethod.parser, 'parseTicker');
    assert.equal(watchMethod.requiresAuth, false);
});

// ============================================================
// Edge Cases
// ============================================================

test('validateRuntimeBehavior should handle empty config', () => {
    const config: RuntimeBehaviorSchema = {};

    const result = validateRuntimeBehavior(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateAutoResubscribeConfig should handle minimal valid config', () => {
    const config: AutoResubscribeConfig = {
        enabled: true,
        strategy: 'immediate',
    };

    const result = validateAutoResubscribeConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});

test('validateCCXTIntegrationConfig should handle empty watchMethods', () => {
    const config: CCXTIntegrationConfig = {
        watchMethods: [],
    };

    const result = validateCCXTIntegrationConfig(config);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
});
