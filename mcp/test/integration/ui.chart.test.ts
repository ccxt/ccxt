import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeExchange } from '../helpers/fake-ccxt.js';
import { callRaw, connect, connectUi, hasDataset, HOUR, T0, UI_CAPABILITIES, UI_EXTENSION, UI_META_KEYS, UI_MIME, UI_TOOLS, uiUri, withUiMode } from '../helpers/ui-client.js';

// MCP Apps UI (io.modelcontextprotocol/ui), over a real client <-> server pair (see
// test/helpers/ui-client.ts). show_chart, and the rule every show_* tool follows:
// a compact summary for the model, the dataset for the view — and the dataset only goes to a
// host that renders it (CCXT_MCP_UI, default auto). structuredContent is always present (the
// tools declare an outputSchema) and carries the summary plus, when displayed, the dataset.

test ('show_chart: the model gets a summary, the view gets the candles', async () => {
    const client = await connectUi ();
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    // 200 fake candles of [ts, 1, 2, 0.5, 1.5, 100], one per hour
    assert.deepEqual (envelope.data, {
        'count': 200,
        'from': new Date (T0).toISOString (),
        'to': new Date (T0 + 199 * HOUR).toISOString (),
        'open': 1,
        'close': 1.5,
        'changePercent': 50,
        'high': 2,
        'low': 0.5,
        'volume': 20000,
    });
    // never the rows: the text stays small and carries no candle array
    assert.ok (!Array.isArray (envelope.data));
    assert.ok (!result.content[0].text.includes (String (T0 + HOUR)), 'candle rows leaked into the text content');
    assert.ok (result.content[0].text.length < 1500, 'summary text should be compact, got ' + result.content[0].text.length);
    assert.equal (envelope.meta.exchange, 'fakex');
    assert.equal (envelope.meta.symbol, 'BTC/USDT');
    assert.equal (envelope.meta.timeframe, '1h');
    assert.equal (envelope.meta.ui, 'displayed');
    const view = result.structuredContent;
    assert.equal (view.view, 'chart');
    assert.equal (view.ui, 'displayed');
    assert.deepEqual (view.summary, envelope.data, 'structuredContent carries the same summary as the text');
    assert.equal (view.notice, envelope.meta.notice);
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.equal (view.symbol, 'BTC/USDT');
    assert.equal (view.timeframe, '1h');
    assert.deepEqual (view.timeframes, [ '1m', '1h', '1d' ]);
    assert.equal (view.limit, 200);
    assert.equal (view.candles.length, 200);
    assert.deepEqual (view.candles[0], [ T0, 1, 2, 0.5, 1.5, 100 ]);
    assert.deepEqual (view.candles[199], [ T0 + 199 * HOUR, 1, 2, 0.5, 1.5, 100 ]);
    await client.close ();
});

const SHOW_CALLS: [ string, any, string ][] = [
    [ 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 }, 'get_ohlcv' ],
    [ 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' }, 'get_orderbook' ],
    [ 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] }, 'get_tickers' ],
];

// Regression: the view payload used to be attached for every host. A host without MCP Apps
// may feed structuredContent to the model INSTEAD of the text content (Claude Code does), so
// the model received the full dataset and lost the summary envelope. structuredContent is now
// the summary itself (plus what the view is of) for such a host — never the dataset.
test ('show_*: a host without the MCP Apps extension gets the summary only — no dataset in structuredContent', async () => {
    const client = await connect ();
    for (const [ name, args, fallback ] of SHOW_CALLS) {
        const { result, envelope, structured } = await callRaw (client, name, args);
        assert.equal (envelope.ok, true, name);
        assert.equal (envelope.meta.ui, 'unsupported', name);
        assert.match (envelope.meta.notice, /did not advertise MCP Apps/, name);
        assert.match (envelope.meta.notice, /no interactive view was sent/, name);
        assert.match (envelope.meta.notice, /CCXT_MCP_UI=always/, name + ' names the stdio escape hatch');
        assert.ok (envelope.meta.notice.includes (fallback), name + ' names its fallback tool');
        assert.deepEqual (Object.keys (result).sort (), [ 'content', 'structuredContent' ], name);
        assert.equal (structured.ui, 'unsupported', name);
        assert.deepEqual (structured.summary, envelope.data, name + ' structuredContent carries the summary');
        assert.equal (structured.notice, envelope.meta.notice, name);
        assert.ok (!hasDataset (name, structured), name + ' must not carry the dataset');
    }
    // the summary is still the whole answer: 500 candles stay out of the model's context
    const big = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 500 });
    assert.equal (big.envelope.data.count, 500);
    assert.ok (JSON.stringify (big.result).length < 3000, 'result should be compact, got ' + JSON.stringify (big.result).length);
    await client.close ();
});

test ('CCXT_MCP_UI=always: the dataset is attached even when the host did not advertise MCP Apps', async () => {
    await withUiMode ('always', async () => {
        const client = await connect ();
        for (const [ name, args, fallback ] of SHOW_CALLS) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.meta.ui, 'displayed', name);
            assert.match (envelope.meta.notice, /displayed to the user/, name);
            assert.ok (!envelope.meta.notice.includes (fallback), name);
            assert.equal (result.structuredContent.view, name.replace ('show_', ''), name);
            assert.ok (hasDataset (name, result.structuredContent), name);
        }
        const { tools } = await client.listTools ();
        for (const name of Object.keys (UI_TOOLS)) {
            assert.equal ((tools.find ((tool: any) => tool.name === name) as any)?._meta?.ui?.resourceUri, uiUri (name), name);
        }
        await client.close ();
    });
});

test ('CCXT_MCP_UI=off: no dataset and no ui:// link even for an MCP Apps host; the tools stay listed', async () => {
    await withUiMode ('off', async () => {
        const client = await connectUi ();
        for (const [ name, args, fallback ] of SHOW_CALLS) {
            const { result, envelope } = await callRaw (client, name, args);
            assert.equal (envelope.ok, true, name);
            assert.equal (envelope.meta.ui, 'off', name);
            assert.match (envelope.meta.notice, /views are disabled/, name);
            assert.ok (envelope.meta.notice.includes (fallback), name + ' names its fallback tool');
            assert.equal (result.structuredContent.ui, 'off', name);
            assert.ok (!hasDataset (name, result.structuredContent), name + ' must not carry the dataset');
        }
        const { tools } = await client.listTools ();
        for (const name of Object.keys (UI_TOOLS)) {
            const tool: any = tools.find ((entry: any) => entry.name === name);
            assert.ok (tool !== undefined, name + ' must stay listed');
            // an MCP Apps host would open the view for a result that has no payload for it
            for (const key of UI_META_KEYS) {
                assert.ok (tool._meta === undefined || !(key in tool._meta), name + ' must not advertise _meta["' + key + '"]');
            }
        }
        await client.close ();
    });
});

test ('CCXT_MCP_UI: case and whitespace are tolerated; anything unknown means auto', async () => {
    const cases: [ string, any, string ][] = [
        [ ' ALWAYS ', undefined, 'displayed' ],
        [ 'Off', UI_CAPABILITIES, 'off' ],
        [ 'auto', undefined, 'unsupported' ],
        [ 'auto', UI_CAPABILITIES, 'displayed' ],
        [ '', UI_CAPABILITIES, 'displayed' ],
        [ 'yes', undefined, 'unsupported' ],
        [ 'yes', UI_CAPABILITIES, 'displayed' ],
        [ '${user_config.ui}', undefined, 'unsupported' ], // an unsubstituted plugin template
    ];
    for (const [ mode, capabilities, expected ] of cases) {
        await withUiMode (mode, async () => {
            const client = await connect ({ capabilities });
            const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
            assert.equal (envelope.meta.ui, expected, JSON.stringify (mode));
            assert.equal (hasDataset ('show_chart', result.structuredContent), expected === 'displayed', JSON.stringify (mode));
            await client.close ();
        });
    }
});

test ('show_chart: meta.ui is "displayed" when the client advertises the MCP Apps extension', async () => {
    const client = await connect ({ 'capabilities': UI_CAPABILITIES });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
    assert.equal (envelope.meta.ui, 'displayed');
    assert.match (envelope.meta.notice, /displayed to the user/);
    assert.equal (result.structuredContent.view, 'chart');
    for (const [ name, args ] of [ [ 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' } ], [ 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] } ] ] as [ string, any ][]) {
        assert.equal ((await callRaw (client, name, args)).envelope.meta.ui, 'displayed', name);
    }
    await client.close ();
});

test ('show_chart: the extension only counts when it lists our mime type', async () => {
    for (const extension of [ {}, { 'mimeTypes': [] }, { 'mimeTypes': [ 'text/html' ] }, { 'mimeTypes': 'text/html;profile=mcp-app' } ]) {
        const client = await connect ({ 'capabilities': { 'extensions': { [UI_EXTENSION]: extension } } });
        const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 });
        assert.equal (envelope.meta.ui, 'unsupported', JSON.stringify (extension));
        assert.ok (!hasDataset ('show_chart', result.structuredContent), JSON.stringify (extension));
        await client.close ();
    }
    const other = await connect ({ 'capabilities': { 'extensions': { 'com.example/other': { 'mimeTypes': [ UI_MIME ] } } } });
    assert.equal ((await callRaw (other, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 3 })).envelope.meta.ui, 'unsupported');
    await other.close ();
});

test ('show_chart: limit defaults to 200, is clamped to 500 (reported in meta.limitClamped) and must be positive', async () => {
    const client = await connectUi ();
    const cases: [ any, number ][] = [ [ undefined, 200 ], [ 5, 5 ], [ 500, 500 ], [ 501, 500 ], [ 100000, 500 ] ];
    for (const [ limit, expected ] of cases) {
        const args: any = { 'exchange': 'fakex', 'symbol': 'BTC/USDT' };
        if (limit !== undefined) {
            args['limit'] = limit;
        }
        const { result, envelope } = await callRaw (client, 'show_chart', args);
        assert.equal (envelope.ok, true, 'limit ' + limit);
        assert.equal (result.structuredContent.limit, expected, 'limit ' + limit);
        assert.equal (result.structuredContent.candles.length, expected, 'limit ' + limit);
        assert.equal (envelope.data.count, expected, 'limit ' + limit);
        if (limit !== undefined && limit > expected) {
            assert.deepEqual (envelope.meta.limitClamped, { 'requested': limit, 'applied': expected });
            assert.match (envelope.meta.notice, new RegExp ('limit ' + limit + ' was clamped to ' + expected));
        } else {
            assert.equal (envelope.meta.limitClamped, undefined, 'limit ' + limit);
        }
    }
    for (const limit of [ 0, -7 ]) {
        const result: any = await client.callTool ({ 'name': 'show_chart', 'arguments': { 'exchange': 'fakex', 'symbol': 'BTC/USDT', limit } });
        assert.equal (result.isError, true, 'limit ' + limit);
        assert.match (result.content[0].text, /Input validation error/, 'limit ' + limit);
    }
    await client.close ();
});

// a venue that ignores the limit, answers newest-first and emits junk rows; with a `since`
// its 600 rows start there
class MessyCandlesExchange extends FakeExchange {
    async fetchOHLCV (_symbol?: string, _timeframe?: string, since?: number): Promise<any> {
        const start = since ?? T0;
        const rows: any[] = [];
        for (let i = 599; i >= 0; i--) {
            rows.push ([ start + i * HOUR, 10 + i, 20 + i, 5 + i, 15 + i, (i % 2 === 0) ? 1 : undefined ]);
        }
        rows.splice (10, 0, null, [ T0 - HOUR, null, null, null, null, null ], [ 'x', 1, 2, 3, 4, 5 ]);
        return rows;
    }
}

test ('show_chart: candles are cleaned, sorted ascending and cut to the most recent limit', async () => {
    const client = await connectUi ({ 'exchangeClass': MessyCandlesExchange });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 50 });
    const candles: number[][] = result.structuredContent.candles;
    assert.equal (candles.length, 50);
    for (const [ index, candle ] of candles.entries ()) {
        assert.equal (candle.length, 6);
        assert.ok (candle.every ((value) => typeof value === 'number' && Number.isFinite (value)), 'row ' + index + ' must be six finite numbers');
        if (index > 0) {
            assert.ok (candle[0] > candles[index - 1][0], 'timestamps must ascend at row ' + index);
        }
    }
    // the 50 most recent of the 600 valid rows: i = 550 … 599, missing volume -> 0
    assert.deepEqual (candles[0], [ T0 + 550 * HOUR, 560, 570, 555, 565, 1 ]);
    assert.deepEqual (candles[49], [ T0 + 599 * HOUR, 609, 619, 604, 614, 0 ]);
    assert.equal (envelope.data.count, 50);
    assert.equal (envelope.data.open, 560);
    assert.equal (envelope.data.close, 614);
    assert.equal (envelope.data.high, 619);
    assert.equal (envelope.data.low, 555);
    assert.equal (envelope.data.volume, 25);
    assert.equal (envelope.data.from, new Date (T0 + 550 * HOUR).toISOString ());
    assert.equal (envelope.data.to, new Date (T0 + 599 * HOUR).toISOString ());
    await client.close ();
});

// Regression: with a `since` the over-returned rows were still cut to the MOST RECENT limit,
// so the chart (and the summary's from/to) covered a window long after the requested start
// while get_ohlcv, given the same arguments, started at `since`.
test ('show_chart: with a since, an over-returning exchange is cut to the FIRST limit candles from it', async () => {
    const client = await connectUi ({ 'exchangeClass': MessyCandlesExchange });
    const since = T0 + 1000 * HOUR;
    for (const sinceArg of [ since, new Date (since).toISOString () ]) {
        const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'since': sinceArg, 'limit': 50 });
        const candles: number[][] = result.structuredContent.candles;
        assert.equal (candles.length, 50);
        // i = 0 … 49 of the 600 rows that start at since
        assert.deepEqual (candles[0], [ since, 10, 20, 5, 15, 1 ]);
        assert.deepEqual (candles[49], [ since + 49 * HOUR, 59, 69, 54, 64, 0 ]);
        assert.equal (envelope.data.count, 50);
        assert.equal (envelope.data.from, new Date (since).toISOString ());
        assert.equal (envelope.data.to, new Date (since + 49 * HOUR).toISOString ());
        assert.equal (envelope.data.open, 10);
        assert.equal (envelope.data.close, 64);
    }
    // get_ohlcv agrees on where the window starts
    const raw = await callRaw (client, 'get_ohlcv', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'since': since, 'limit': 50 });
    assert.ok (raw.envelope.data.some ((row: any) => Array.isArray (row) && row[0] === since));
    await client.close ();
});

class EmptyCandlesExchange extends FakeExchange {
    async fetchOHLCV (): Promise<any> {
        return [];
    }
}

test ('show_chart: no candles is an ok result with a zero count and a notice', async () => {
    const client = await connectUi ({ 'exchangeClass': EmptyCandlesExchange });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, { 'count': 0 });
    assert.match (envelope.meta.notice, /returned no candles/);
    // two notices stay two notices instead of running into one sentence
    assert.match (envelope.meta.notice, /^the exchange returned no candles for this symbol\/timeframe\/since \| an interactive view /);
    assert.deepEqual (result.structuredContent.candles, []);
    assert.equal (result.structuredContent.view, 'chart');
    await client.close ();
});

test ('show_chart: an explicit timeframe and since are honored', async () => {
    const client = await connectUi ();
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': '1d', 'since': '2024-01-01T00:00:00Z', 'limit': 2 });
    assert.equal (envelope.ok, true);
    assert.equal (envelope.meta.timeframe, '1d');
    assert.equal (result.structuredContent.timeframe, '1d');
    const bad = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'since': 'not-a-date' });
    assert.equal (bad.envelope.ok, false);
    assert.equal (bad.envelope.error.code, 'BAD_REQUEST');
    assert.equal (bad.result.structuredContent, undefined);
    await client.close ();
});

test ('show_chart: a bad timeframe is a plain-text error with no view payload', async () => {
    const client = await connect ({ 'capabilities': UI_CAPABILITIES });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'timeframe': '7m' });
    assert.equal (result.isError, true);
    assert.equal (envelope.ok, false);
    assert.equal (envelope.error.code, 'BAD_TIMEFRAME');
    assert.match (envelope.error.hint, /1m, 1h, 1d/);
    assert.equal (result.structuredContent, undefined);
    assert.ok (!('structuredContent' in result));
    await client.close ();
});

test ('show_*: an unknown exchange is UNKNOWN_EXCHANGE with no view payload', async () => {
    const client = await connect ();
    const calls: [ string, any ][] = [
        [ 'show_chart', { 'exchange': 'nope', 'symbol': 'BTC/USDT' } ],
        [ 'show_orderbook', { 'exchange': 'nope', 'symbol': 'BTC/USDT' } ],
        [ 'show_tickers', { 'exchange': 'nope', 'symbols': [ 'BTC/USDT' ] } ],
    ];
    for (const [ name, args ] of calls) {
        const { result, envelope } = await callRaw (client, name, args);
        assert.equal (result.isError, true, name);
        assert.equal (envelope.ok, false, name);
        assert.equal (envelope.error.code, 'UNKNOWN_EXCHANGE', name);
        assert.match (envelope.error.hint, /fakex/, name);
        assert.equal (result.structuredContent, undefined, name);
    }
    await client.close ();
});

class FailingExchange extends FakeExchange {
    async fetchOHLCV (): Promise<any> {
        throw new Error ('fakex upstream exploded');
    }
}

test ('show_chart: an exchange failure takes the normal error path (text only)', async () => {
    const client = await connect ({ 'exchangeClass': FailingExchange });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.isError, true);
    assert.equal (envelope.ok, false);
    assert.ok (typeof envelope.error.code === 'string' && envelope.error.code.length > 0);
    assert.match (envelope.error.message, /upstream exploded/);
    assert.equal (result.structuredContent, undefined);
    await client.close ();
});
