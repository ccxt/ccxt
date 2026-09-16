import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import Bingx from '../../js/src/bingx.js';
import testFetchTrades from '../../js/src/test/Exchange/test.fetchTrades.js';

const settings = JSON.parse(fs.readFileSync(new URL('../../skip-tests.json', import.meta.url)));
const markets = JSON.parse(fs.readFileSync(new URL('../../ts/src/test/static/markets/bingx.json', import.meta.url)));
// Captured from the public swap endpoint. Both fills are buys at the same ms,
// but their prices decrease in the original exchange response order.
const raw = [
    { time: 1789587177591, isBuyerMaker: false, price: '75598.6', qty: '0.0001', quoteQty: '7.56', fillId: '727492266', ts: 1789587177591 },
    { time: 1789587177591, isBuyerMaker: false, price: '75590.0', qty: '0.1316', quoteQty: '9947.64', fillId: '727492255', ts: 1789587177591 },
];

function scenario(symbol, id = 'bingx') {
    const exchange = new Bingx();
    exchange.setMarkets(markets);
    exchange.id = id;
    exchange.milliseconds = () => raw[0].time + 1000;
    const trades = raw.map(row => exchange.parseTrade(row, exchange.market(symbol)));
    exchange.fetchTrades = async () => trades;
    const skips = settings[id]?.skipMethods?.fetchTrades ?? {};
    return { exchange, trades, skips, run: () => testFetchTrades(exchange, skips, symbol) };
}

test('BingX swap accepts the captured pair without changing its prices or sides', async () => {
    const { run, trades } = scenario('BTC/USDT:USDT');
    await run();
    assert.deepEqual(trades.map(t => [t.side, t.price]), [['buy', 75598.6], ['buy', 75590]]);
});

test('BingX spot still rejects the same side sequence', async () => {
    await assert.rejects(scenario('BTC/USDT').run, /Price is decreasing/);
});

test('another exchange does not inherit the BingX swap exception', async () => {
    await assert.rejects(scenario('BTC/USDT:USDT', 'kraken').run, /Price is decreasing/);
});

test('without the opt-in flag the test does not resolve the market', async () => {
    const { exchange, trades, run } = scenario('BTC/USDT:USDT', 'kraken');
    trades.reverse(); // Valid increasing-price buy sequence.
    let marketCalls = 0;
    exchange.market = () => {
        marketCalls++;
        throw new Error('Unexpected market resolution without sideSequenceSwap');
    };
    await run();
    assert.equal(marketCalls, 0);
});

test('removing the scoped flag restores the failing assertion', async () => {
    const { exchange } = scenario('BTC/USDT:USDT');
    await assert.rejects(() => testFetchTrades(exchange, {}, 'BTC/USDT:USDT'), /Price is decreasing/);
});

test('swap exception does not disable side validation', async () => {
    const { run, trades } = scenario('BTC/USDT:USDT');
    trades[0].side = 'invalid';
    await assert.rejects(run);
});

test('swap exception does not disable timestamp order validation', async () => {
    const { run, trades, exchange } = scenario('BTC/USDT:USDT');
    trades[0].timestamp += 1;
    trades[0].datetime = exchange.iso8601(trades[0].timestamp);
    await assert.rejects(run);
});

test('swap exception does not disable the both-sides requirement', async () => {
    const { run, trades } = scenario('BTC/USDT:USDT');
    while (trades.length < 100) trades.push({ ...trades[0] });
    await assert.rejects(run, /Both sides of trades are not being returned/);
});
