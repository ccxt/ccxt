import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startHarness, callTool } from './helpers/harness.js';

// Market tools as the hosted profile serves them (tester feedback on the connector): limits,
// the paging hint of a server without params, and a "since" the venue did not honour.

const GENEROUS = { 'RATE_LIMIT_BURST': '100000', 'RATE_LIMIT_PER_MINUTE': '100000', 'MAX_CONCURRENT_REQUESTS': '1000' };
const BTC = { 'exchange': 'alpha', 'symbol': 'BTC/USDT' };
// the test venue's trade and first candle are at this time, whatever since it is given
const T0 = 1700000000000;

test ('market: a zero or negative limit is a validation error, not one level per side', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        const before = harness.venue.upstreamCalls ();
        for (const [ tool, args ] of [
            [ 'get_orderbook', { ...BTC, 'limit': -5 } ],
            [ 'get_orderbook', { ...BTC, 'depth': 0 } ],
            [ 'get_ohlcv', { ...BTC, 'limit': -1 } ],
            [ 'get_trades', { ...BTC, 'limit': 0 } ],
            [ 'show_chart', { ...BTC, 'limit': -1 } ],
            [ 'show_orderbook', { ...BTC, 'limit': -5 } ],
            [ 'search_markets', { 'exchange': 'alpha', 'limit': -1 } ],
        ] as Array<[ string, any ]>) {
            const { result } = await callTool (harness.url, tool, args);
            assert.equal (result.isError, true, tool + ' ' + JSON.stringify (args));
            assert.match (result.content[0].text, /Input validation error/, tool + ' ' + JSON.stringify (args));
        }
        assert.equal (harness.venue.upstreamCalls (), before, 'nothing reached the exchange');
    } finally {
        await harness.close ();
    }
});

test ('market: a limit over the max is reported in meta.limitClamped on every clamping tool', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        for (const [ tool, args, requested, applied ] of [
            [ 'get_ohlcv', { ...BTC, 'limit': 1000 }, 1000, 500 ],
            [ 'get_orderbook', { ...BTC, 'limit': 500 }, 500, 100 ],
            [ 'get_trades', { ...BTC, 'limit': 1000 }, 1000, 200 ],
            [ 'show_chart', { ...BTC, 'limit': 1000 }, 1000, 500 ],
            [ 'show_orderbook', { ...BTC, 'limit': 500 }, 500, 100 ],
            [ 'search_markets', { 'exchange': 'alpha', 'limit': 500 }, 500, 100 ],
        ] as Array<[ string, any, number, number ]>) {
            const { envelope } = await callTool (harness.url, tool, args);
            assert.equal (envelope.ok, true, tool);
            assert.deepEqual (envelope.meta.limitClamped, { requested, applied }, tool);
            assert.match (envelope.meta.notice, new RegExp ('limit ' + requested + ' was clamped to ' + applied), tool);
        }
    } finally {
        await harness.close ();
    }
});

test ('market: the get_ohlcv paging hint names only inputs the hosted tool has (no params.until)', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        const { envelope } = await callTool (harness.url, 'get_ohlcv', { ...BTC, 'limit': 5 });
        assert.equal (envelope.meta.hasMore, true);
        assert.match (envelope.meta.notice, /count hit the limit/);
        assert.doesNotMatch (envelope.meta.notice, /params/);
    } finally {
        await harness.close ();
    }
});

test ('market: get_trades says so when the venue returned trades from well after since', async () => {
    const harness = await startHarness (GENEROUS);
    try {
        const { envelope } = await callTool (harness.url, 'get_trades', { ...BTC, 'since': '2023-11-13T00:00:00Z' });
        assert.equal (envelope.ok, true);
        assert.match (envelope.meta.notice, /earliest trade returned is at 2023-11-14T22:13:20\.000Z, .* after the requested since \(2023-11-13T00:00:00\.000Z\): alpha did not return data from since/);
        const honoured = await callTool (harness.url, 'get_trades', { ...BTC, 'since': T0 - 1000 });
        assert.ok (honoured.envelope.meta.notice === null || !/since/.test (honoured.envelope.meta.notice));
    } finally {
        await harness.close ();
    }
});
