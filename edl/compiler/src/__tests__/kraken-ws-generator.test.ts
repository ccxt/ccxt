/**
 * Kraken WebSocket Generator Tests
 * Test the Kraken WebSocket client code generator
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
    generateKrakenWsClient,
    generateSubscribePayload,
    generateUnsubscribePayload,
    generateMessageHandler,
    DEFAULT_KRAKEN_CONFIG,
    type KrakenWebSocketConfig,
} from '../generator/kraken-ws.js';

describe('Kraken WebSocket Generator', () => {
    describe('generateSubscribePayload', () => {
        test('should generate valid ticker subscription payload', () => {
            const payload = generateSubscribePayload('ticker', 'XBT/USD', { reqId: 42 });

            assert.strictEqual(payload.event, 'subscribe');
            assert.strictEqual(payload.reqid, 42);
            assert.deepStrictEqual(payload.pair, ['XBT/USD']);
            assert.strictEqual(payload.subscription.name, 'ticker');
        });

        test('should generate valid orderbook subscription with depth', () => {
            const payload = generateSubscribePayload('book', 'XBT/USD', { reqId: 100, depth: 10 });

            assert.strictEqual(payload.event, 'subscribe');
            assert.strictEqual(payload.reqid, 100);
            assert.deepStrictEqual(payload.pair, ['XBT/USD']);
            assert.strictEqual(payload.subscription.name, 'book');
            assert.strictEqual(payload.subscription.depth, 10);
        });

        test('should generate valid OHLC subscription with interval', () => {
            const payload = generateSubscribePayload('ohlc', 'XBT/USD', { reqId: 200, interval: 60 });

            assert.strictEqual(payload.event, 'subscribe');
            assert.strictEqual(payload.reqid, 200);
            assert.deepStrictEqual(payload.pair, ['XBT/USD']);
            assert.strictEqual(payload.subscription.name, 'ohlc');
            assert.strictEqual(payload.subscription.interval, 60);
        });

        test('should generate valid trade subscription', () => {
            const payload = generateSubscribePayload('trade', 'ETH/USD', { reqId: 1 });

            assert.strictEqual(payload.event, 'subscribe');
            assert.strictEqual(payload.reqid, 1);
            assert.deepStrictEqual(payload.pair, ['ETH/USD']);
            assert.strictEqual(payload.subscription.name, 'trade');
        });

        test('should generate private channel subscription without pair', () => {
            const payload = generateSubscribePayload('openOrders', undefined, { reqId: 5 });

            assert.strictEqual(payload.event, 'subscribe');
            assert.strictEqual(payload.reqid, 5);
            assert.strictEqual(payload.pair, undefined);
            assert.strictEqual(payload.subscription.name, 'openOrders');
        });
    });

    describe('generateUnsubscribePayload', () => {
        test('should generate valid unsubscribe payload', () => {
            const payload = generateUnsubscribePayload('ticker', 'XBT/USD', { reqId: 99 });

            assert.strictEqual(payload.event, 'unsubscribe');
            assert.strictEqual(payload.reqid, 99);
            assert.deepStrictEqual(payload.pair, ['XBT/USD']);
            assert.strictEqual(payload.subscription.name, 'ticker');
        });

        test('should generate unsubscribe for private channel', () => {
            const payload = generateUnsubscribePayload('openOrders', undefined, { reqId: 88 });

            assert.strictEqual(payload.event, 'unsubscribe');
            assert.strictEqual(payload.reqid, 88);
            assert.strictEqual(payload.subscription.name, 'openOrders');
        });
    });

    describe('generateMessageHandler', () => {
        test('should generate ticker message handler', () => {
            const code = generateMessageHandler('ticker');

            assert.ok(code.includes('handleTickerMessage'));
            assert.ok(code.includes('Ticker'));
            assert.ok(code.includes('safeNumber'));
            assert.ok(code.includes('high'));
            assert.ok(code.includes('low'));
            assert.ok(code.includes('bid'));
            assert.ok(code.includes('ask'));
        });

        test('should generate trade message handler', () => {
            const code = generateMessageHandler('trade');

            assert.ok(code.includes('handleTradeMessage'));
            assert.ok(code.includes('Trade[]'));
            assert.ok(code.includes('trades.map'));
            assert.ok(code.includes('price'));
            assert.ok(code.includes('amount'));
        });

        test('should generate orderbook message handler', () => {
            const code = generateMessageHandler('book');

            assert.ok(code.includes('handleOrderBookMessage'));
            assert.ok(code.includes('OrderBook'));
            assert.ok(code.includes('bids'));
            assert.ok(code.includes('asks'));
            assert.ok(code.includes('data.as'));
            assert.ok(code.includes('data.bs'));
        });

        test('should generate openOrders message handler', () => {
            const code = generateMessageHandler('openOrders');

            assert.ok(code.includes('handleOpenOrdersMessage'));
            assert.ok(code.includes('Order[]'));
            assert.ok(code.includes('orderId'));
            assert.ok(code.includes('status'));
        });

        test('should generate generic message handler for unknown channel', () => {
            const code = generateMessageHandler('unknown');

            assert.ok(code.includes('handleMessage'));
            assert.ok(code.includes('return message'));
        });
    });

    describe('generateKrakenWsClient', () => {
        test('should generate complete WebSocket client class', () => {
            const code = generateKrakenWsClient();

            // Check class structure
            assert.ok(code.includes('class KrakenWs extends Exchange'));
            assert.ok(code.includes('constructor'));

            // Check endpoints
            assert.ok(code.includes('wss://ws.kraken.com'));
            assert.ok(code.includes('wss://ws-auth.kraken.com'));

            // Check imports
            assert.ok(code.includes('import { Exchange }'));
            assert.ok(code.includes('import type { Ticker, Trade, OrderBook, Order, Dict }'));
        });

        test('should generate watchTicker method', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('async watchTicker(symbol: string, params: any = {}): Promise<Ticker>'));
            assert.ok(code.includes('await this.loadMarkets()'));
            assert.ok(code.includes('this.market(symbol)'));
            assert.ok(code.includes('watchPublic'));
        });

        test('should generate watchTrades method', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('async watchTrades(symbol: string, params: any = {}): Promise<Trade[]>'));
            assert.ok(code.includes('watchPublic'));
        });

        test('should generate watchOrderBook method', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('async watchOrderBook(symbol: string, limit?: number, params: any = {}): Promise<OrderBook>'));
            assert.ok(code.includes('requestParams.depth = limit'));
            assert.ok(code.includes('watchPublic'));
        });

        test('should generate watchOrders method', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('async watchOrders(symbol?: string, since?: number, limit?: number, params: any = {}): Promise<Order[]>'));
            assert.ok(code.includes('watchPrivate'));
        });

        test('should generate subscription payload methods', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('protected generateSubscribePayload'));
            assert.ok(code.includes('protected generateUnsubscribePayload'));
            assert.ok(code.includes('reqid: reqId'));
        });

        test('should generate message handling methods', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('protected handleMessage(client: any, message: any)'));
            assert.ok(code.includes('protected handleEventMessage'));
            assert.ok(code.includes('protected handleError'));
        });

        test('should generate authentication methods', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('protected async authenticate()'));
            assert.ok(code.includes('this.checkRequiredCredentials()'));
            assert.ok(code.includes('getWebSocketToken'));
        });

        test('should generate request ID tracking', () => {
            const code = generateKrakenWsClient();

            assert.ok(code.includes('protected reqIdCounter: number'));
            assert.ok(code.includes('this.reqIdCounter = 1'));
            assert.ok(code.includes('protected getReqId(): number'));
            assert.ok(code.includes('return this.reqIdCounter++'));
        });

        test('should support custom configuration', () => {
            const customConfig: KrakenWebSocketConfig = {
                exchangeId: 'customKraken',
                publicEndpoint: 'wss://custom-public.kraken.com',
                privateEndpoint: 'wss://custom-private.kraken.com',
                channels: {
                    ticker: 'custom_ticker',
                    trade: 'custom_trade',
                    book: 'custom_book',
                    ohlc: 'custom_ohlc',
                    spread: 'custom_spread',
                    openOrders: 'custom_openOrders',
                },
            };

            const code = generateKrakenWsClient(customConfig);

            assert.ok(code.includes('class CustomkrakenWs extends Exchange'));
            assert.ok(code.includes('wss://custom-public.kraken.com'));
            assert.ok(code.includes('wss://custom-private.kraken.com'));
        });
    });

    describe('DEFAULT_KRAKEN_CONFIG', () => {
        test('should have correct public endpoint', () => {
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.publicEndpoint, 'wss://ws.kraken.com');
        });

        test('should have correct private endpoint', () => {
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.privateEndpoint, 'wss://ws-auth.kraken.com');
        });

        test('should have correct channel mappings', () => {
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.channels.ticker, 'ticker');
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.channels.trade, 'trade');
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.channels.book, 'book');
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.channels.ohlc, 'ohlc');
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.channels.spread, 'spread');
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.channels.openOrders, 'openOrders');
        });

        test('should have exchange ID set to kraken', () => {
            assert.strictEqual(DEFAULT_KRAKEN_CONFIG.exchangeId, 'kraken');
        });
    });

    describe('Integration Tests', () => {
        test('should generate valid TypeScript code that can be parsed', () => {
            const code = generateKrakenWsClient();

            // Basic syntax checks
            assert.ok(code.includes('class'));
            assert.ok(code.includes('extends'));
            assert.ok(code.includes('async'));
            assert.ok(code.includes('await'));
            assert.ok(code.includes('protected'));
            assert.ok(code.includes('public'));

            // No obvious syntax errors
            assert.strictEqual(code.match(/class /g)?.length, 1);
            assert.ok(code.match(/async \w+\(/g));
        });

        test('should generate code with proper method signatures', () => {
            const code = generateKrakenWsClient();

            // Check that all main methods are present
            const methods = [
                'watchTicker',
                'watchTrades',
                'watchOrderBook',
                'watchOrders',
                'generateSubscribePayload',
                'generateUnsubscribePayload',
                'handleMessage',
                'authenticate',
                'getWebSocketToken',
            ];

            for (const method of methods) {
                assert.ok(code.includes(method), `Method ${method} should be present`);
            }
        });

        test('should generate orderbook subscription with valid depth values', () => {
            // Test various depth values that Kraken supports
            const depths = [10, 25, 100, 500, 1000];

            for (const depth of depths) {
                const payload = generateSubscribePayload('book', 'XBT/USD', { reqId: 1, depth });
                assert.strictEqual(payload.subscription.depth, depth);
            }
        });

        test('should generate complete subscription flow', () => {
            // Subscribe
            const subPayload = generateSubscribePayload('ticker', 'XBT/USD', { reqId: 1 });
            assert.strictEqual(subPayload.event, 'subscribe');

            // Unsubscribe
            const unsubPayload = generateUnsubscribePayload('ticker', 'XBT/USD', { reqId: 2 });
            assert.strictEqual(unsubPayload.event, 'unsubscribe');

            // Both should have same channel and pair
            assert.strictEqual(subPayload.subscription.name, unsubPayload.subscription.name);
            assert.deepStrictEqual(subPayload.pair, unsubPayload.pair);
        });
    });
});
