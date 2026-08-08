/**
 * Tests for Multiplexing Syntax
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    parseMultiplexingRule,
    parseSymbolGroupingRule,
    parseConnectionAffinityRule,
    parseStreamRoutingRule,
    validateMultiplexingConfig,
    validateMultiplexingRule,
    validateConnectionAssignment,
    isMultiplexingRule,
    isStreamRoutingRule,
    isConnectionAffinityRule,
    isSymbolGroupingRule,
    type MultiplexingRule,
    type SymbolGroupingRule,
    type ConnectionAffinityRule,
    type StreamRoutingRule,
    type ConnectionAssignment,
    type LoadBalancingConfig,
    type OverflowConfig,
} from '../syntax/multiplexing.js';
import type { MultiplexingConfig } from '../types/websocket.js';

// ============================================================
// Parse Multiplexing Config Tests
// ============================================================

test('should parse simple multiplexing config', () => {
    const config: MultiplexingConfig = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
    };

    const rule = parseMultiplexingRule(config);

    assert.equal(rule.enabled, true);
    assert.equal(rule.maxSymbolsPerConnection, 50);
    assert.equal(rule.connectionPoolSize, 3);
    assert.equal(rule.loadBalancing.strategy, 'round-robin');
    assert.equal(rule.overflow.behavior, 'create-connection');
});

test('should apply defaults when parsing minimal config', () => {
    const config: MultiplexingConfig = {
        enabled: false,
    };

    const rule = parseMultiplexingRule(config);

    assert.equal(rule.enabled, false);
    assert.equal(rule.maxSymbolsPerConnection, 100);
    assert.equal(rule.connectionPoolSize, 1);
});

test('should parse config with maxChannelsPerConnection', () => {
    const config: MultiplexingConfig = {
        enabled: true,
        maxSymbolsPerConnection: 25,
        maxChannelsPerConnection: 5,
        connectionPoolSize: 2,
    };

    const rule = parseMultiplexingRule(config);

    assert.equal(rule.maxChannelsPerConnection, 5);
});

// ============================================================
// Validate Multiplexing Config Tests
// ============================================================

test('should validate valid multiplexing config', () => {
    const config: MultiplexingConfig = {
        enabled: true,
        maxSymbolsPerConnection: 100,
        maxChannelsPerConnection: 10,
        connectionPoolSize: 5,
    };

    const errors = validateMultiplexingConfig(config);
    assert.deepEqual(errors, []);
});

test('should reject negative maxSymbolsPerConnection', () => {
    const config: MultiplexingConfig = {
        enabled: true,
        maxSymbolsPerConnection: -1,
    };

    const errors = validateMultiplexingConfig(config);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('maxSymbolsPerConnection')));
});

test('should reject zero connectionPoolSize', () => {
    const config: MultiplexingConfig = {
        enabled: true,
        connectionPoolSize: 0,
    };

    const errors = validateMultiplexingConfig(config);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('connectionPoolSize')));
});

test('should reject invalid maxChannelsPerConnection', () => {
    const config: MultiplexingConfig = {
        enabled: true,
        maxChannelsPerConnection: -5,
    };

    const errors = validateMultiplexingConfig(config);
    assert.ok(errors.length > 0);
    assert.ok(errors.some(e => e.includes('maxChannelsPerConnection')));
});

test('should allow disabled config without strict validation', () => {
    const config: MultiplexingConfig = {
        enabled: false,
    };

    const errors = validateMultiplexingConfig(config);
    assert.deepEqual(errors, []);
});

// ============================================================
// Symbol Grouping Rule Tests
// ============================================================

test('should parse symbol grouping rule with base-currency', () => {
    const rule: SymbolGroupingRule = {
        type: 'base-currency',
        maxSymbolsPerGroup: 20,
    };

    const parsed = parseSymbolGroupingRule(rule);
    assert.equal(parsed.type, 'base-currency');
    assert.equal(parsed.maxSymbolsPerGroup, 20);
    assert.equal(parsed.strict, false);
});

test('should parse symbol grouping rule with quote-currency', () => {
    const rule: SymbolGroupingRule = {
        type: 'quote-currency',
        strict: true,
    };

    const parsed = parseSymbolGroupingRule(rule);
    assert.equal(parsed.type, 'quote-currency');
    assert.equal(parsed.strict, true);
});

test('should parse custom symbol grouping rule', () => {
    const rule: SymbolGroupingRule = {
        type: 'custom',
        customFunction: 'groupByMarketCap',
    };

    const parsed = parseSymbolGroupingRule(rule);
    assert.equal(parsed.type, 'custom');
    assert.equal(parsed.customFunction, 'groupByMarketCap');
});

test('should reject custom grouping without customFunction', () => {
    const rule: SymbolGroupingRule = {
        type: 'custom',
    };

    assert.throws(
        () => parseSymbolGroupingRule(rule),
        /customFunction/
    );
});

// ============================================================
// Connection Affinity Rule Tests
// ============================================================

test('should parse basic connection affinity rule', () => {
    const rule: ConnectionAffinityRule = {
        symbols: ['BTC/USDT', 'ETH/USDT'],
        strength: 'required',
    };

    const parsed = parseConnectionAffinityRule(rule);
    assert.deepEqual(parsed.symbols, ['BTC/USDT', 'ETH/USDT']);
    assert.equal(parsed.strength, 'required');
    assert.equal(parsed.priority, 0);
});

test('should parse affinity rule with priority', () => {
    const rule: ConnectionAffinityRule = {
        symbols: ['BTC/*'],
        strength: 'preferred',
        priority: 10,
    };

    const parsed = parseConnectionAffinityRule(rule);
    assert.equal(parsed.priority, 10);
    assert.equal(parsed.strength, 'preferred');
});

test('should parse affinity rule with channel restrictions', () => {
    const rule: ConnectionAffinityRule = {
        symbols: ['*/USDT'],
        strength: 'required',
        channels: ['ticker', 'trades'],
    };

    const parsed = parseConnectionAffinityRule(rule);
    assert.deepEqual(parsed.channels, ['ticker', 'trades']);
});

test('should reject affinity rule without symbols', () => {
    const rule: ConnectionAffinityRule = {
        symbols: [],
        strength: 'required',
    };

    assert.throws(
        () => parseConnectionAffinityRule(rule),
        /at least one symbol/
    );
});

// ============================================================
// Stream Routing Rule Tests
// ============================================================

test('should parse basic stream routing rule', () => {
    const rule: StreamRoutingRule = {
        id: 'route-ticker',
        conditions: [
            {
                field: 'type',
                operator: 'equals',
                value: 'ticker',
            },
        ],
        targetChannel: 'ticker',
    };

    const parsed = parseStreamRoutingRule(rule);
    assert.equal(parsed.id, 'route-ticker');
    assert.equal(parsed.targetChannel, 'ticker');
    assert.equal(parsed.priority, 0);
    assert.equal(parsed.stopOnMatch, false);
});

test('should parse routing rule with multiple conditions', () => {
    const rule: StreamRoutingRule = {
        id: 'route-btc-ticker',
        conditions: [
            {
                field: 'type',
                operator: 'equals',
                value: 'ticker',
            },
            {
                field: 'symbol',
                operator: 'startsWith',
                value: 'BTC/',
            },
        ],
        targetChannel: 'ticker',
        priority: 5,
        stopOnMatch: true,
    };

    const parsed = parseStreamRoutingRule(rule);
    assert.equal(parsed.conditions.length, 2);
    assert.equal(parsed.priority, 5);
    assert.equal(parsed.stopOnMatch, true);
});

test('should parse routing rule with pattern matching', () => {
    const rule: StreamRoutingRule = {
        id: 'route-pattern',
        conditions: [
            {
                field: 'channel',
                operator: 'matches',
                value: '',
                pattern: '^ticker@',
            },
        ],
        targetChannel: 'ticker',
        symbolField: 'data.s',
    };

    const parsed = parseStreamRoutingRule(rule);
    assert.equal(parsed.symbolField, 'data.s');
    assert.equal(parsed.conditions[0].pattern, '^ticker@');
});

test('should reject routing rule without conditions', () => {
    const rule: StreamRoutingRule = {
        id: 'invalid',
        conditions: [],
        targetChannel: 'ticker',
    };

    assert.throws(
        () => parseStreamRoutingRule(rule),
        /at least one condition/
    );
});

test('should reject routing rule without targetChannel', () => {
    const rule: any = {
        id: 'invalid',
        conditions: [{ field: 'type', operator: 'equals', value: 'ticker' }],
    };

    assert.throws(
        () => parseStreamRoutingRule(rule),
        /targetChannel/
    );
});

// ============================================================
// Validate Multiplexing Rule Tests
// ============================================================

test('should validate complete multiplexing rule', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 100,
        maxChannelsPerConnection: 10,
        connectionPoolSize: 5,
        loadBalancing: {
            strategy: 'round-robin',
        },
        overflow: {
            behavior: 'create-connection',
            maxConnections: 10,
        },
    };

    const errors = validateMultiplexingRule(rule);
    assert.deepEqual(errors, []);
});

test('should validate hash-based load balancing', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'hash-based',
            hashFunction: 'base-currency',
        },
        overflow: {
            behavior: 'queue',
            maxQueueSize: 100,
        },
    };

    const errors = validateMultiplexingRule(rule);
    assert.deepEqual(errors, []);
});

test('should reject hash-based strategy without hashFunction', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'hash-based',
        },
        overflow: {
            behavior: 'reject',
        },
    };

    const errors = validateMultiplexingRule(rule);
    assert.ok(errors.some(e => e.includes('hashFunction')));
});

test('should reject custom hash without customHashFunction', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'hash-based',
            hashFunction: 'custom',
        },
        overflow: {
            behavior: 'reject',
        },
    };

    const errors = validateMultiplexingRule(rule);
    assert.ok(errors.some(e => e.includes('customHashFunction')));
});

test('should reject invalid load balancing strategy', () => {
    const rule: any = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'invalid-strategy',
        },
        overflow: {
            behavior: 'reject',
        },
    };

    const errors = validateMultiplexingRule(rule);
    assert.ok(errors.some(e => e.includes('Invalid load balancing strategy')));
});

test('should reject invalid overflow behavior', () => {
    const rule: any = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'round-robin',
        },
        overflow: {
            behavior: 'invalid-behavior',
        },
    };

    const errors = validateMultiplexingRule(rule);
    assert.ok(errors.some(e => e.includes('Invalid overflow behavior')));
});

test('should validate symbol grouping rules in complete rule', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'round-robin',
        },
        overflow: {
            behavior: 'reject',
        },
        symbolGrouping: [
            {
                type: 'base-currency',
                maxSymbolsPerGroup: 25,
            },
        ],
    };

    const errors = validateMultiplexingRule(rule);
    assert.deepEqual(errors, []);
});

test('should validate connection affinity in complete rule', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'least-connections',
        },
        overflow: {
            behavior: 'replace-oldest',
        },
        connectionAffinity: [
            {
                symbols: ['BTC/USDT', 'ETH/USDT'],
                strength: 'required',
            },
        ],
    };

    const errors = validateMultiplexingRule(rule);
    assert.deepEqual(errors, []);
});

test('should validate routing rules in complete rule', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'random',
        },
        overflow: {
            behavior: 'queue',
            maxQueueSize: 50,
            queueTimeout: 5000,
        },
        routing: [
            {
                id: 'route-1',
                conditions: [
                    {
                        field: 'type',
                        operator: 'equals',
                        value: 'ticker',
                    },
                ],
                targetChannel: 'ticker',
            },
        ],
    };

    const errors = validateMultiplexingRule(rule);
    assert.deepEqual(errors, []);
});

test('should reject routing rule with invalid operator', () => {
    const rule: any = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'round-robin',
        },
        overflow: {
            behavior: 'reject',
        },
        routing: [
            {
                id: 'route-1',
                conditions: [
                    {
                        field: 'type',
                        operator: 'invalid-op',
                        value: 'ticker',
                    },
                ],
                targetChannel: 'ticker',
            },
        ],
    };

    const errors = validateMultiplexingRule(rule);
    assert.ok(errors.some(e => e.includes('Invalid routing condition operator')));
});

test('should reject matches operator without pattern', () => {
    const rule: any = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'round-robin',
        },
        overflow: {
            behavior: 'reject',
        },
        routing: [
            {
                id: 'route-1',
                conditions: [
                    {
                        field: 'type',
                        operator: 'matches',
                        value: '',
                    },
                ],
                targetChannel: 'ticker',
            },
        ],
    };

    const errors = validateMultiplexingRule(rule);
    assert.ok(errors.some(e => e.includes('must specify pattern')));
});

test('should reject "in" operator without array value', () => {
    const rule: any = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: {
            strategy: 'round-robin',
        },
        overflow: {
            behavior: 'reject',
        },
        routing: [
            {
                id: 'route-1',
                conditions: [
                    {
                        field: 'type',
                        operator: 'in',
                        value: 'ticker',
                    },
                ],
                targetChannel: 'ticker',
            },
        ],
    };

    const errors = validateMultiplexingRule(rule);
    assert.ok(errors.some(e => e.includes('must have array value')));
});

// ============================================================
// Connection Assignment Validation Tests
// ============================================================

test('should validate auto assignment strategy', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'auto',
    };

    const errors = validateConnectionAssignment(assignment);
    assert.deepEqual(errors, []);
});

test('should validate manual assignment strategy', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'manual',
        manualAssignments: {
            'BTC/USDT': 0,
            'ETH/USDT': 1,
        },
    };

    const errors = validateConnectionAssignment(assignment);
    assert.deepEqual(errors, []);
});

test('should reject manual strategy without assignments', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'manual',
    };

    const errors = validateConnectionAssignment(assignment);
    assert.ok(errors.some(e => e.includes('manualAssignments')));
});

test('should validate sticky session configuration', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'sticky',
        stickySession: {
            enabled: true,
            duration: 60000,
            storage: 'memory',
        },
    };

    const errors = validateConnectionAssignment(assignment);
    assert.deepEqual(errors, []);
});

test('should reject negative sticky session duration', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'sticky',
        stickySession: {
            enabled: true,
            duration: -1000,
        },
    };

    const errors = validateConnectionAssignment(assignment);
    assert.ok(errors.some(e => e.includes('duration')));
});

test('should validate dedicated connections', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'dedicated',
        dedicatedConnections: [
            {
                symbols: ['BTC/USDT', 'ETH/USDT'],
                count: 2,
            },
        ],
    };

    const errors = validateConnectionAssignment(assignment);
    assert.deepEqual(errors, []);
});

test('should reject dedicated connection without symbols', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'dedicated',
        dedicatedConnections: [
            {
                symbols: [],
                count: 2,
            },
        ],
    };

    const errors = validateConnectionAssignment(assignment);
    assert.ok(errors.some(e => e.includes('at least one symbol')));
});

test('should validate rebalancing configuration', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'auto',
        rebalancing: {
            enabled: true,
            interval: 30000,
            threshold: 25,
        },
    };

    const errors = validateConnectionAssignment(assignment);
    assert.deepEqual(errors, []);
});

test('should reject invalid rebalancing threshold', () => {
    const assignment: ConnectionAssignment = {
        strategy: 'auto',
        rebalancing: {
            enabled: true,
            threshold: 150,
        },
    };

    const errors = validateConnectionAssignment(assignment);
    assert.ok(errors.some(e => e.includes('threshold')));
});

// ============================================================
// Type Guard Tests
// ============================================================

test('should correctly identify multiplexing rules', () => {
    const validRule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 50,
        connectionPoolSize: 3,
        loadBalancing: { strategy: 'round-robin' },
        overflow: { behavior: 'reject' },
    };

    assert.equal(isMultiplexingRule(validRule), true);
    assert.equal(isMultiplexingRule({}), false);
    assert.equal(isMultiplexingRule(null), false);
    assert.equal(isMultiplexingRule({ enabled: true }), false);
});

test('should correctly identify stream routing rules', () => {
    const validRule: StreamRoutingRule = {
        id: 'route-1',
        conditions: [{ field: 'type', operator: 'equals', value: 'ticker' }],
        targetChannel: 'ticker',
    };

    assert.equal(isStreamRoutingRule(validRule), true);
    assert.equal(isStreamRoutingRule({}), false);
    assert.equal(isStreamRoutingRule(null), false);
    assert.equal(isStreamRoutingRule({ id: 'route-1' }), false);
});

test('should correctly identify connection affinity rules', () => {
    const validRule: ConnectionAffinityRule = {
        symbols: ['BTC/USDT'],
        strength: 'required',
    };

    assert.equal(isConnectionAffinityRule(validRule), true);
    assert.equal(isConnectionAffinityRule({ symbols: ['BTC/USDT'], strength: 'invalid' }), false);
    assert.equal(isConnectionAffinityRule({}), false);
    assert.equal(isConnectionAffinityRule(null), false);
});

test('should correctly identify symbol grouping rules', () => {
    const validRule: SymbolGroupingRule = {
        type: 'base-currency',
    };

    assert.equal(isSymbolGroupingRule(validRule), true);
    assert.equal(isSymbolGroupingRule({ type: 'quote-currency' }), true);
    assert.equal(isSymbolGroupingRule({ type: 'invalid-type' }), false);
    assert.equal(isSymbolGroupingRule({}), false);
    assert.equal(isSymbolGroupingRule(null), false);
});

// ============================================================
// Complex Scenario Tests
// ============================================================

test('should validate complex multiplexing rule with all features', () => {
    const rule: MultiplexingRule = {
        enabled: true,
        maxSymbolsPerConnection: 100,
        maxChannelsPerConnection: 5,
        connectionPoolSize: 10,
        loadBalancing: {
            strategy: 'hash-based',
            hashFunction: 'base-currency',
        },
        symbolGrouping: [
            {
                type: 'base-currency',
                maxSymbolsPerGroup: 50,
                strict: true,
            },
        ],
        connectionAffinity: [
            {
                symbols: ['BTC/*', 'ETH/*'],
                strength: 'preferred',
                priority: 10,
            },
        ],
        overflow: {
            behavior: 'queue',
            maxQueueSize: 200,
            queueTimeout: 10000,
        },
        routing: [
            {
                id: 'route-ticker',
                conditions: [
                    {
                        field: 'channel',
                        operator: 'equals',
                        value: 'ticker',
                    },
                ],
                targetChannel: 'ticker',
                priority: 1,
            },
        ],
        connectionAssignment: {
            strategy: 'auto',
            rebalancing: {
                enabled: true,
                interval: 60000,
                threshold: 20,
            },
        },
    };

    const errors = validateMultiplexingRule(rule);
    assert.deepEqual(errors, []);
});
