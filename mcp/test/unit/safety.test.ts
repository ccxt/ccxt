import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Safety, SafetyError, requireTier } from '../../ts/safety.js';
import { Journal } from '../../ts/journal.js';
import { FakeExchange, makeConfig } from '../helpers/fake-ccxt.js';

function makeSafety (): Safety {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-test-'));
    return new Safety (new Journal (dir));
}

function account (overrides: any = {}) {
    return makeConfig ({ 'acc': { 'sandbox': true, 'trading': true, ...overrides } }).accounts['acc'];
}

test ('requireTier: disabled and sandbox-only-vs-live combinations', () => {
    assert.throws (() => requireTier (account ({ 'trading': false }), 'trading'), SafetyError);
    assert.throws (() => requireTier (account ({ 'trading': true, 'sandbox': false }), 'trading'), SafetyError);
    assert.doesNotThrow (() => requireTier (account (), 'trading'));
    assert.doesNotThrow (() => requireTier (account ({ 'trading': 'live', 'sandbox': false }), 'trading'));
});

test ('symbol allow/deny with globs', () => {
    const safety = makeSafety ();
    const allow = account ({ 'allowedSymbols': [ 'BTC/*', 'ETH/USDT' ] });
    assert.doesNotThrow (() => safety.checkSymbolAllowed (allow, 'BTC/USDC'));
    assert.doesNotThrow (() => safety.checkSymbolAllowed (allow, 'ETH/USDT'));
    assert.throws (() => safety.checkSymbolAllowed (allow, 'DOGE/USDT'), (e: any) => e.code === 'SYMBOL_NOT_ALLOWED');
    const deny = account ({ 'deniedSymbols': [ 'DOGE/*' ] });
    assert.throws (() => safety.checkSymbolAllowed (deny, 'DOGE/USDT'), (e: any) => e.code === 'SYMBOL_DENIED');
});

test ('guardOrder enforces market limits and notional cap', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    // below market min amount
    await assert.rejects (safety.guardOrder (exchange, account (), { 'tool': 't', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.00001, 'price': 50000, 'params': {} }), (e: any) => e.code === 'BELOW_MARKET_MINIMUM');
    // over the per-order cap
    const capped = account ({ 'maxOrderValue': 100 });
    await assert.rejects (safety.guardOrder (exchange, capped, { 'tool': 't', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.01, 'price': 50000, 'params': {} }), (e: any) => e.code === 'ORDER_VALUE_CAP');
    // within the cap, market order valued from the live ticker
    const result = await safety.guardOrder (exchange, capped, { 'tool': 't', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'amount': 0.001, 'params': {} });
    assert.equal (result.orderValue, 50);
    assert.equal (result.priceEstimated, true);
});

test ('guardOrder fails closed when a cap is set and the order cannot be valued', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    exchange.fetchTicker = async () => {
        throw new Error ('no ticker');
    };
    const capped = account ({ 'maxOrderValue': 100 });
    await assert.rejects (safety.guardOrder (exchange, capped, { 'tool': 't', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'amount': 0.001, 'params': {} }), (e: any) => e.code === 'UNVALUABLE_ORDER');
    // without a cap the same order passes with an unvalued notional
    const uncapped = account ();
    const result = await safety.guardOrder (exchange, uncapped, { 'tool': 't', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'amount': 0.001, 'params': {} });
    assert.equal (result.orderValue, undefined);
});

test ('guardOrder rejects quote-size overrides smuggled via params', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    for (const key of [ 'cost', 'quoteOrderQty' ]) {
        await assert.rejects (
            safety.guardOrder (exchange, account ({ 'maxOrderValue': 100 }), { 'tool': 't', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'amount': 0.0001, 'params': { [key]: 999999 } }),
            (e: any) => e.code === 'PARAMS_NOTIONAL_OVERRIDE'
        );
    }
});

test ('prediction outcome handles are valued as USD (0..1 price x amount)', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    exchange.has['fetchEvents'] = true; // prediction venue marker
    exchange.fetchTicker = async (symbol: string) => ({ symbol, 'last': 0.12 });
    const capped = account ({ 'maxOrderValue': 100 });
    // outcome handles have no BASE/QUOTE shape and no markets entry
    const result = await safety.guardOrder (exchange, capped, { 'tool': 't', 'symbol': 'EVENT_MARKET:YES', 'type': 'limit', 'side': 'buy', 'amount': 100, 'price': 0.12, 'params': {} });
    assert.equal (result.orderValue, 12);
    const byCost = await safety.guardCost (exchange, capped, 'EVENT_MARKET:YES', 50);
    assert.equal (byCost.orderValue, 50);
    await assert.rejects (safety.guardCost (exchange, capped, 'EVENT_MARKET:YES', 500), (e: any) => e.code === 'ORDER_VALUE_CAP');
});

test ('unknown market on a non-prediction exchange fails as BAD_SYMBOL, not UNVALUABLE', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    await assert.rejects (
        safety.guardOrder (exchange, account ({ 'maxOrderValue': 100 }), { 'tool': 't', 'symbol': 'SOME_HANDLE:YES', 'type': 'limit', 'side': 'buy', 'amount': 1, 'price': 0.5, 'params': {} }),
        (e: any) => e.code === 'BAD_SYMBOL'
    );
});

test ('inverse contract notional is price-independent (amount x contractSize)', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    exchange.markets['BTC/USD:BTC'] = { ...exchange.markets['BTC/USDT'], 'symbol': 'BTC/USD:BTC', 'quote': 'USD', 'settle': 'BTC', 'contract': true, 'inverse': true, 'contractSize': 100, 'limits': {} };
    const capped = account ({ 'maxOrderValue': 1000 });
    // 5 contracts x 100 USD = 500 USD notional, NOT 5 * 50000 * 100
    const result = await safety.guardOrder (exchange, capped, { 'tool': 't', 'symbol': 'BTC/USD:BTC', 'type': 'limit', 'side': 'buy', 'amount': 5, 'price': 50000, 'params': {} });
    assert.equal (result.orderValue, 500);
});

test ('guardTransfer enforces the rolling daily cap too', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    const acc = account ({ 'funds': true, 'maxTransferValue': null, 'maxDailyValue': 100 });
    // journal is empty, 60 passes; a second 60 would exceed the 100 daily cap if journaled —
    // simulate the accumulator by monkeypatching
    await safety.guardTransfer (exchange, acc, 'USDT', 60);
    (safety as any).journal.dispatchedValueLast24h = () => 60;
    await assert.rejects (safety.guardTransfer (exchange, acc, 'USDT', 60), (e: any) => e.code === 'DAILY_VALUE_CAP');
});

test ('guardCost caps quote-value orders directly', async () => {
    const safety = makeSafety ();
    const exchange = new FakeExchange ();
    const capped = account ({ 'maxOrderValue': 100 });
    await assert.rejects (safety.guardCost (exchange, capped, 'BTC/USDT', 500), (e: any) => e.code === 'ORDER_VALUE_CAP');
    const result = await safety.guardCost (exchange, capped, 'BTC/USDT', 50);
    assert.equal (result.orderValue, 50);
});

test ('confirm tokens: single-use, payload-bound, expiring', () => {
    const safety = makeSafety ();
    const payload = { 'a': 1, 'b': { 'c': 2 } };
    const token = safety.issueConfirmToken (payload);
    // different key order must digest identically
    assert.doesNotThrow (() => safety.redeemConfirmToken (token, { 'b': { 'c': 2 }, 'a': 1 }));
    // single use
    assert.throws (() => safety.redeemConfirmToken (token, payload), (e: any) => e.code === 'CONFIRM_INVALID');
    // changed payload
    const token2 = safety.issueConfirmToken (payload);
    assert.throws (() => safety.redeemConfirmToken (token2, { 'a': 2 }), (e: any) => e.code === 'CONFIRM_MISMATCH');
});

test ('confirmationRequired follows the confirm policy and environment', () => {
    const safety = makeSafety ();
    assert.equal (safety.confirmationRequired (account ({ 'confirm': 'always' })), true);
    assert.equal (safety.confirmationRequired (account ({ 'confirm': 'never' })), false);
    assert.equal (safety.confirmationRequired (account ({ 'confirm': 'live', 'sandbox': true })), false);
    assert.equal (safety.confirmationRequired (account ({ 'confirm': 'live', 'sandbox': false, 'trading': 'live' })), true);
});

test ('withAccountLock serializes per-account critical sections', async () => {
    const safety = makeSafety ();
    const order: number[] = [];
    await Promise.all ([
        safety.withAccountLock ('a', async () => {
            await new Promise ((resolve) => setTimeout (resolve, 30));
            order.push (1);
        }),
        safety.withAccountLock ('a', async () => {
            order.push (2);
        }),
    ]);
    assert.deepEqual (order, [ 1, 2 ]);
});
