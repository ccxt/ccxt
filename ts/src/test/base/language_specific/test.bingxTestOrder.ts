// NO_AUTO_TRANSPILE
// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';

async function testBingxTestOrder () {
    const exchange = new ccxt.bingx ();
    exchange.markets = {
        'BTC/USDT': { 'swap': false, 'inverse': false },
        'BTC/USD:BTC': { 'swap': true, 'inverse': true },
        'BTC/USDT:USDT': { 'swap': true, 'inverse': false },
    };
    const calls = [];
    exchange.createOrderRequest = (symbol, type, side, amount, price, params) => {
        calls.push ('build');
        assert (!('test' in params));
        return { 'symbol': symbol };
    };
    exchange.fetch = async () => { throw new Error ('unexpected network request'); };
    exchange.cswapV1PrivatePostTradeOrder = async () => {
        calls.push ('inverse');
        return {};
    };
    exchange.swapV2PrivatePostTradeOrder = async () => {
        calls.push ('linear');
        return {};
    };
    exchange.swapV2PrivatePostTradeOrderTest = async () => {
        calls.push ('linear-test');
        return {};
    };
    exchange.spotV1PrivatePostTradeOrder = async () => {
        calls.push ('spot');
        return {};
    };
    exchange.parseOrder = () => ({});
    await assert.rejects (
        exchange.createOrder ('BTC/USD:BTC', 'limit', 'buy', 1, 100, { 'test': true }),
        (error) => (error instanceof ccxt.NotSupported) && error.message.includes ('only supports test orders for linear swap markets'),
    );
    assert.deepStrictEqual (calls, []);
    await assert.rejects (
        exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 100, { 'test': true }),
        (error) => (error instanceof ccxt.NotSupported) && error.message.includes ('only supports test orders for linear swap markets'),
    );
    assert.deepStrictEqual (calls, []);
    await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 100, { 'test': true });
    assert.deepStrictEqual (calls.splice (0), [ 'build', 'linear-test' ]);
    await exchange.createOrder ('BTC/USD:BTC', 'limit', 'buy', 1, 100, { 'test': false });
    assert.deepStrictEqual (calls.splice (0), [ 'build', 'inverse' ]);
    await exchange.createOrder ('BTC/USD:BTC', 'limit', 'buy', 1, 100);
    assert.deepStrictEqual (calls.splice (0), [ 'build', 'inverse' ]);
    await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 100);
    assert.deepStrictEqual (calls.splice (0), [ 'build', 'linear' ]);
    await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 100, { 'test': false });
    assert.deepStrictEqual (calls.splice (0), [ 'build', 'spot' ]);
    await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 100);
    assert.deepStrictEqual (calls, [ 'build', 'spot' ]);
}

export default testBingxTestOrder;
