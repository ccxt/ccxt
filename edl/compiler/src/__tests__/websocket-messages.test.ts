/**
 * WebSocket Message Schemas Tests
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    BinanceTickerMessage,
    BinanceTradeMessage,
    BinanceDepthMessage,
    BinanceOrderUpdateMessage,
    detectMessageType,
    isBinanceTickerMessage,
    isBinanceTradeMessage,
    isBinanceDepthMessage,
    isBinanceOrderUpdateMessage,
} from '../schemas/websocket-messages.js';

test('BinanceTickerMessage should have correct structure', () => {
    const tickerMessage: BinanceTickerMessage = {
        e: '24hrTicker',
        E: 1638747600000,
        s: 'BTCUSDT',
        p: '1000.00',
        P: '2.05',
        w: '49000.00',
        c: '50000.00',
        Q: '0.5',
        o: '49000.00',
        h: '51000.00',
        l: '48000.00',
        v: '1000.00',
        q: '50000000.00',
        O: 1638661200000,
        C: 1638747600000,
        F: 1000000,
        L: 1100000,
        n: 100000,
    };

    assert.equal(tickerMessage.e, '24hrTicker');
    assert.equal(tickerMessage.s, 'BTCUSDT');
});

test('BinanceTradeMessage should have correct structure', () => {
    const tradeMessage: BinanceTradeMessage = {
        e: 'trade',
        E: 1638747600000,
        s: 'BTCUSDT',
        t: 12345,
        p: '50000.00',
        q: '1.5',
        b: 88,
        a: 50,
        T: 1638747600000,
        m: true,
        M: true,
    };

    assert.equal(tradeMessage.e, 'trade');
    assert.equal(tradeMessage.p, '50000.00');
});

test('BinanceDepthMessage should have correct structure', () => {
    const depthMessage: BinanceDepthMessage = {
        e: 'depthUpdate',
        E: 1638747600000,
        s: 'BTCUSDT',
        U: 157,
        u: 160,
        b: [
            ['49900.00', '1.5'],
            ['49800.00', '2.0'],
        ],
        a: [
            ['50100.00', '1.2'],
            ['50200.00', '0.8'],
        ],
    };

    assert.equal(depthMessage.e, 'depthUpdate');
    assert.ok(depthMessage.b.length > 0);
    assert.ok(depthMessage.a.length > 0);
});

test('BinanceOrderUpdateMessage should have correct structure', () => {
    const orderMessage: BinanceOrderUpdateMessage = {
        e: 'executionReport',
        E: 1638747600000,
        s: 'BTCUSDT',
        c: 'web_abc123',
        S: 'BUY',
        o: 'LIMIT',
        f: 'GTC',
        q: '1.0',
        p: '50000.00',
        P: '0.00',
        F: '0.00',
        g: -1,
        C: '',
        x: 'NEW',
        X: 'NEW',
        r: '',
        i: 4293153,
        l: '0.0',
        z: '0.0',
        L: '0.00',
        n: '0',
        N: null,
        T: 1638747600000,
        t: -1,
        I: 8641984,
        w: true,
        m: false,
        M: false,
        O: 1638747600000,
        Z: '0.00',
        Y: '0.00',
        Q: '0.00',
    };

    assert.equal(orderMessage.e, 'executionReport');
    assert.equal(orderMessage.S, 'BUY');
    assert.equal(orderMessage.X, 'NEW');
});

test('detectMessageType should detect ticker message', () => {
    const message = { e: '24hrTicker', s: 'BTCUSDT' };
    assert.equal(detectMessageType(message), 'ticker');
});

test('detectMessageType should detect trade message', () => {
    const message = { e: 'trade', s: 'BTCUSDT' };
    assert.equal(detectMessageType(message), 'trade');
});

test('detectMessageType should detect depth message', () => {
    const message = { e: 'depthUpdate', s: 'BTCUSDT' };
    assert.equal(detectMessageType(message), 'depth');
});

test('detectMessageType should detect order update message', () => {
    const message = { e: 'executionReport', s: 'BTCUSDT' };
    assert.equal(detectMessageType(message), 'orderUpdate');
});

test('detectMessageType should return unknown for unrecognized message', () => {
    const message = { e: 'unknown', s: 'BTCUSDT' };
    assert.equal(detectMessageType(message), 'unknown');
});

test('detectMessageType should handle null or invalid input', () => {
    assert.equal(detectMessageType(null), 'unknown');
    assert.equal(detectMessageType(undefined), 'unknown');
    assert.equal(detectMessageType('not an object'), 'unknown');
});

test('isBinanceTickerMessage should work correctly', () => {
    const tickerMsg = { e: '24hrTicker', s: 'BTCUSDT' };
    const tradeMsg = { e: 'trade', s: 'BTCUSDT' };

    assert.equal(isBinanceTickerMessage(tickerMsg), true);
    assert.equal(isBinanceTickerMessage(tradeMsg), false);
});

test('isBinanceTradeMessage should work correctly', () => {
    const tradeMsg = { e: 'trade', s: 'BTCUSDT' };
    const tickerMsg = { e: '24hrTicker', s: 'BTCUSDT' };

    assert.equal(isBinanceTradeMessage(tradeMsg), true);
    assert.equal(isBinanceTradeMessage(tickerMsg), false);
});

test('isBinanceDepthMessage should work correctly', () => {
    const depthMsg = { e: 'depthUpdate', s: 'BTCUSDT' };
    const tradeMsg = { e: 'trade', s: 'BTCUSDT' };

    assert.equal(isBinanceDepthMessage(depthMsg), true);
    assert.equal(isBinanceDepthMessage(tradeMsg), false);
});

test('isBinanceOrderUpdateMessage should work correctly', () => {
    const orderMsg = { e: 'executionReport', s: 'BTCUSDT' };
    const tradeMsg = { e: 'trade', s: 'BTCUSDT' };

    assert.equal(isBinanceOrderUpdateMessage(orderMsg), true);
    assert.equal(isBinanceOrderUpdateMessage(tradeMsg), false);
});
