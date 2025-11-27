/**
 * Channel Schema Model Tests
 * Tests for WebSocket channel type definitions
 */

import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import type {
    ChannelDefinition,
    ChannelType,
    ChannelDataType,
    PayloadTemplate,
    VariableDefinition,
    MessageFilter,
    ThrottlingConfig,
    BackoffConfig,
    MultiplexingConfig,
    ChannelAuthConfig,
} from '../types/websocket.js';

describe('Channel Schema Models', () => {
    describe('ChannelDefinition', () => {
        test('should create a valid public channel definition', () => {
            const channel: ChannelDefinition = {
                name: 'ticker',
                type: 'public',
                dataType: 'ticker',
                subscribePayload: {
                    template: { method: 'subscribe', params: ['ticker', '${symbol}'] },
                    variables: {
                        symbol: {
                            source: 'parameter',
                            path: 'symbol',
                        },
                    },
                },
            };

            assert.equal(channel.name, 'ticker');
            assert.equal(channel.type, 'public');
            assert.equal(channel.dataType, 'ticker');
        });

        test('should create a valid private channel with auth', () => {
            const channel: ChannelDefinition = {
                name: 'orders',
                type: 'private',
                dataType: 'orders',
                subscribePayload: {
                    template: { method: 'subscribe', channel: 'orders' },
                },
                auth: {
                    type: 'listenKey',
                    listenKeyEndpoint: '/api/v3/userDataStream',
                    listenKeyRefreshInterval: 1800000,
                },
            };

            assert.equal(channel.type, 'private');
            assert.equal(channel.auth?.type, 'listenKey');
            assert.equal(channel.auth?.listenKeyEndpoint, '/api/v3/userDataStream');
        });
    });

    describe('PayloadTemplate', () => {
        test('should create string template with variables', () => {
            const payload: PayloadTemplate = {
                template: 'subscribe:${channel}:${symbol}',
                variables: {
                    channel: { source: 'parameter', path: 'channel' },
                    symbol: { source: 'parameter', path: 'symbol' },
                },
            };

            assert.equal(typeof payload.template, 'string');
            assert.equal(payload.variables?.channel.source, 'parameter');
        });

        test('should create object template with computed variables', () => {
            const payload: PayloadTemplate = {
                template: {
                    method: 'subscribe',
                    params: ['${channel}', '${uppercaseSymbol}'],
                },
                variables: {
                    channel: { source: 'parameter', path: 'channel' },
                    uppercaseSymbol: {
                        source: 'computed',
                        compute: 'symbol.toUpperCase()',
                    },
                },
            };

            assert.equal(typeof payload.template, 'object');
            assert.equal(payload.variables?.uppercaseSymbol.source, 'computed');
        });
    });

    describe('MessageFilter', () => {
        test('should create filter with exact value', () => {
            const filter: MessageFilter = {
                field: 'channel',
                value: 'ticker',
            };

            assert.equal(filter.field, 'channel');
            assert.equal(filter.value, 'ticker');
        });

        test('should create filter with pattern', () => {
            const filter: MessageFilter = {
                field: 'event',
                pattern: '^(subscribe|unsubscribe)$',
            };

            assert.equal(filter.field, 'event');
            assert.ok(filter.pattern);
        });
    });

    describe('ThrottlingConfig', () => {
        test('should create throttling with linear backoff', () => {
            const throttling: ThrottlingConfig = {
                maxSubscriptionsPerSecond: 10,
                minSubscriptionInterval: 100,
                backoff: {
                    type: 'linear',
                    initial: 1000,
                    max: 5000,
                },
            };

            assert.equal(throttling.maxSubscriptionsPerSecond, 10);
            assert.equal(throttling.backoff?.type, 'linear');
        });

        test('should create throttling with exponential backoff', () => {
            const throttling: ThrottlingConfig = {
                maxSubscriptionsPerSecond: 5,
                backoff: {
                    type: 'exponential',
                    initial: 1000,
                    max: 30000,
                    multiplier: 2,
                },
            };

            assert.equal(throttling.backoff?.type, 'exponential');
            assert.equal(throttling.backoff?.multiplier, 2);
        });
    });

    describe('MultiplexingConfig', () => {
        test('should create multiplexing config when enabled', () => {
            const config: MultiplexingConfig = {
                enabled: true,
                maxSymbolsPerConnection: 100,
                maxChannelsPerConnection: 10,
                connectionPoolSize: 5,
            };

            assert.equal(config.enabled, true);
            assert.equal(config.maxSymbolsPerConnection, 100);
        });

        test('should create minimal config when disabled', () => {
            const config: MultiplexingConfig = {
                enabled: false,
            };

            assert.equal(config.enabled, false);
        });
    });

    describe('ChannelAuthConfig', () => {
        test('should create listenKey auth config', () => {
            const auth: ChannelAuthConfig = {
                type: 'listenKey',
                listenKeyEndpoint: '/api/v3/userDataStream',
                listenKeyRefreshInterval: 1800000,
            };

            assert.equal(auth.type, 'listenKey');
            assert.equal(auth.listenKeyRefreshInterval, 1800000);
        });

        test('should create signature auth config', () => {
            const auth: ChannelAuthConfig = {
                type: 'signature',
                signatureFields: ['timestamp', 'nonce', 'apiKey'],
            };

            assert.equal(auth.type, 'signature');
            assert.equal(auth.signatureFields?.length, 3);
        });

        test('should create token auth config', () => {
            const auth: ChannelAuthConfig = {
                type: 'token',
            };

            assert.equal(auth.type, 'token');
        });

        test('should create challenge auth config', () => {
            const auth: ChannelAuthConfig = {
                type: 'challenge',
                challengeHandler: 'handleKrakenChallenge',
            };

            assert.equal(auth.type, 'challenge');
            assert.equal(auth.challengeHandler, 'handleKrakenChallenge');
        });
    });

    describe('VariableDefinition', () => {
        test('should create parameter-sourced variable', () => {
            const variable: VariableDefinition = {
                source: 'parameter',
                path: 'symbol',
            };

            assert.equal(variable.source, 'parameter');
            assert.equal(variable.path, 'symbol');
        });

        test('should create context-sourced variable', () => {
            const variable: VariableDefinition = {
                source: 'context',
                path: 'apiKey',
            };

            assert.equal(variable.source, 'context');
        });

        test('should create computed variable', () => {
            const variable: VariableDefinition = {
                source: 'computed',
                compute: 'symbol.toLowerCase().replace("/", "")',
            };

            assert.equal(variable.source, 'computed');
            assert.ok(variable.compute);
        });

        test('should include default value', () => {
            const variable: VariableDefinition = {
                source: 'parameter',
                path: 'depth',
                default: 20,
            };

            assert.equal(variable.default, 20);
        });
    });

    describe('Channel Types', () => {
        test('should validate channel types', () => {
            const publicType: ChannelType = 'public';
            const privateType: ChannelType = 'private';

            assert.equal(publicType, 'public');
            assert.equal(privateType, 'private');
        });

        test('should validate data types', () => {
            const dataTypes: ChannelDataType[] = [
                'ticker',
                'trades',
                'orderbook',
                'ohlcv',
                'orders',
                'balance',
                'positions',
            ];

            assert.equal(dataTypes.length, 7);
        });
    });

    describe('Complete Channel Example', () => {
        test('should create a complete Binance-style ticker channel', () => {
            const channel: ChannelDefinition = {
                name: 'ticker',
                type: 'public',
                dataType: 'ticker',
                subscribePayload: {
                    template: {
                        method: 'SUBSCRIBE',
                        params: ['${symbolLower}@ticker'],
                        id: 1,
                    },
                    variables: {
                        symbolLower: {
                            source: 'computed',
                            compute: 'symbol.toLowerCase().replace("/", "")',
                        },
                    },
                },
                unsubscribePayload: {
                    template: {
                        method: 'UNSUBSCRIBE',
                        params: ['${symbolLower}@ticker'],
                        id: 2,
                    },
                    variables: {
                        symbolLower: {
                            source: 'computed',
                            compute: 'symbol.toLowerCase().replace("/", "")',
                        },
                    },
                },
                messageFilter: {
                    field: 'e',
                    value: '24hrTicker',
                },
                throttling: {
                    maxSubscriptionsPerSecond: 10,
                    minSubscriptionInterval: 100,
                },
                multiplexing: {
                    enabled: true,
                    maxSymbolsPerConnection: 200,
                },
            };

            assert.equal(channel.name, 'ticker');
            assert.equal(channel.subscribePayload.variables?.symbolLower.source, 'computed');
            assert.equal(channel.multiplexing?.enabled, true);
        });

        test('should create a complete Kraken-style private orders channel', () => {
            const channel: ChannelDefinition = {
                name: 'openOrders',
                type: 'private',
                dataType: 'orders',
                subscribePayload: {
                    template: {
                        event: 'subscribe',
                        subscription: { name: 'openOrders' },
                    },
                },
                unsubscribePayload: {
                    template: {
                        event: 'unsubscribe',
                        subscription: { name: 'openOrders' },
                    },
                },
                messageFilter: {
                    field: 'channelName',
                    value: 'openOrders',
                },
                auth: {
                    type: 'signature',
                    signatureFields: ['event', 'subscription'],
                },
                throttling: {
                    maxSubscriptionsPerSecond: 5,
                    backoff: {
                        type: 'exponential',
                        initial: 1000,
                        max: 60000,
                        multiplier: 2,
                    },
                },
            };

            assert.equal(channel.type, 'private');
            assert.equal(channel.auth?.type, 'signature');
            assert.equal(channel.throttling?.backoff?.type, 'exponential');
        });
    });
});
