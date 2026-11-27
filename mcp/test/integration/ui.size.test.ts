import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeExchange } from '../helpers/fake-ccxt.js';
import { callRaw, connect, connectUi, T0 } from '../helpers/ui-client.js';

// A host that does not render MCP Apps views may hand structuredContent to the model instead
// of the text summary, and the hosted server attaches the dataset when it cannot tell
// (UiWhenUnknown "attach"). So every show_* payload must stay small at the tool's caps, with
// data as long-winded as exchanges produce: six-digit prices with eight decimals, volumes
// with float noise, 50 contract symbols with every ticker field set.
const LIMIT_BYTES = 40000;

class LongDigitsExchange extends FakeExchange {
    async fetchOHLCV (_symbol: string, _timeframe: string, _since: any, limit: number): Promise<any> {
        const rows: any[] = [];
        for (let i = 0; i < limit; i++) {
            rows.push ([ T0 + i * 3600000, 123456.12345678 + i, 123457.12345678 + i, 123455.12345678 + i, 123456.87654321 + i, 98765.4321098765 + i / 3 ]);
        }
        return rows;
    }

    async fetchOrderBook (symbol: string, limit: number): Promise<any> {
        const side = (direction: number) => Array.from ({ 'length': limit }, (_, i) => [ 123456.12345678 + direction * i * 0.01, 1234.56789012 + i / 3 ]);
        return { symbol, 'timestamp': T0, 'datetime': new Date (T0).toISOString (), 'bids': side (-1), 'asks': side (1) };
    }

    async fetchTicker (symbol: string): Promise<any> {
        const value = 123456.123456789;
        return { symbol, 'timestamp': T0, 'datetime': new Date (T0).toISOString (), 'last': value, 'bid': value, 'ask': value, 'high': value, 'low': value, 'open': value, 'close': value, 'previousClose': value, 'change': value, 'percentage': -12.3456789, 'average': value, 'baseVolume': 1234567890.12345, 'quoteVolume': 123456789012.345, 'vwap': value, 'info': { 'raw': 'x'.repeat (1000) } };
    }
}

const AT_CAPS: [ string, any ][] = [
    [ 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 500 } ],
    [ 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 100 } ],
    [ 'show_tickers', { 'exchange': 'fakex', 'symbols': Array.from ({ 'length': 50 }, (_, i) => 'SYMBOL' + i + '/USDT:USDT') } ],
];

test ('view payloads stay under ' + LIMIT_BYTES + ' characters at every tool\'s caps', async (t) => {
    const client = await connectUi ({ 'exchangeClass': LongDigitsExchange });
    for (const [ name, args ] of AT_CAPS) {
        const { result, structured } = await callRaw (client, name, args);
        assert.equal (structured.ui, 'displayed', name);
        const size = JSON.stringify (result.structuredContent).length;
        const text = result.content[0].text.length;
        t.diagnostic (name + ': structuredContent ' + size + ' chars, text ' + text + ' chars');
        assert.ok (size < LIMIT_BYTES, name + ' structuredContent is ' + size + ' chars');
        assert.ok (text < 8000, name + ' text is ' + text + ' chars');
    }
    // the chart really carried its 500 candles (rounded for drawing, see viewCandles)
    const chart = await callRaw (client, 'show_chart', AT_CAPS[0][1]);
    assert.equal (chart.structured.candles.length, 500);
    assert.deepEqual (chart.structured.candles[0], [ T0, 123456.1235, 123457.1235, 123455.1235, 123456.8765, 98765.432 ]);
    // while the summary is computed from the exact values
    assert.equal (chart.envelope.data.open, 123456.12345678);
    await client.close ();
});

test ('without a view the payload is the summary only, a few KB at most', async () => {
    const client = await connect ({ 'exchangeClass': LongDigitsExchange });
    for (const [ name, args ] of AT_CAPS) {
        const { structured } = await callRaw (client, name, args);
        assert.equal (structured.ui, 'unsupported', name);
        const size = JSON.stringify (structured).length;
        assert.ok (size < 8000, name + ' summary-only structuredContent is ' + size + ' chars');
    }
    await client.close ();
});
