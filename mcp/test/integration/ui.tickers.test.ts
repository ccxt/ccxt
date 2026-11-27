import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeExchange } from '../helpers/fake-ccxt.js';
import { callRaw, connect, connectUi, ContractExchange, T0 } from '../helpers/ui-client.js';

// MCP Apps UI (io.modelcontextprotocol/ui), over a real client <-> server pair (see
// test/helpers/ui-client.ts). show_tickers: the price board.

class TickerExchange extends FakeExchange {
    markets: Record<string, any> = {
        'BTC/USDT': { 'symbol': 'BTC/USDT', 'id': 'BTCUSDT', 'type': 'spot', 'base': 'BTC', 'quote': 'USDT' },
        'ETH/USDT': { 'symbol': 'ETH/USDT', 'id': 'ETHUSDT', 'type': 'spot', 'base': 'ETH', 'quote': 'USDT' },
    };

    async fetchTicker (symbol: string): Promise<any> {
        const eth = symbol === 'ETH/USDT';
        return {
            symbol,
            'timestamp': T0,
            'datetime': '2023-11-14T22:13:20.000Z',
            'last': eth ? 2000 : 50000,
            'bid': eth ? 1999 : 49999,
            'ask': eth ? 2001 : 50001,
            'high': eth ? 2100 : 51000,
            'low': eth ? 1900 : 49000,
            'open': eth ? 2050 : 48000,
            'close': eth ? 2000 : 50000,
            'change': eth ? -50 : 2000,
            'percentage': eth ? -2.439 : 4.1667,
            'baseVolume': eth ? 1000 : 10,
            'quoteVolume': eth ? 2000000 : 500000,
            'vwap': undefined,
            'markPrice': 1, // not a TICKER_FIELDS member — must be projected away
            'info': { 'raw': 'exchange-payload', 'internal': [ 1, 2, 3 ] },
        };
    }
}

test ('show_tickers: summary rows carry only symbol/last/percentage/quoteVolume', async () => {
    const client = await connectUi ({ 'exchangeClass': TickerExchange });
    const symbols = [ 'ETH/USDT', 'BTC/USDT' ];
    const { result, envelope } = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', symbols });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, [
        { 'symbol': 'ETH/USDT', 'last': 2000, 'percentage': -2.439, 'quoteVolume': 2000000 },
        { 'symbol': 'BTC/USDT', 'last': 50000, 'percentage': 4.1667, 'quoteVolume': 500000 },
    ]);
    assert.equal (envelope.meta.exchange, 'fakex');
    assert.equal (envelope.meta.count, 2);
    assert.equal (envelope.meta.ui, 'displayed');
    // every requested spot symbol came back: nothing missing, nothing contract-related
    assert.ok (!('missing' in envelope.meta));
    assert.ok (!('contracts' in envelope.meta));
    assert.ok (!('contracts' in result.structuredContent));
    assert.ok (!result.content[0].text.includes ('exchange-payload'));
    const view = result.structuredContent;
    assert.equal (view.view, 'tickers');
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.deepEqual (view.symbols, symbols);
    // request order, the full unified ticker minus info and non-unified extras
    assert.deepEqual (view.tickers.map ((ticker: any) => ticker.symbol), symbols);
    for (const ticker of view.tickers) {
        assert.ok (!('info' in ticker), 'info must be stripped from the view payload');
        assert.ok (!('markPrice' in ticker));
        for (const field of [ 'last', 'bid', 'ask', 'high', 'low', 'open', 'close', 'change', 'percentage', 'baseVolume', 'quoteVolume', 'timestamp', 'datetime' ]) {
            assert.ok (ticker[field] !== undefined, field + ' must reach the view');
        }
    }
    assert.ok (!JSON.stringify (view).includes ('exchange-payload'));
    assert.equal (view.tickers[0].high, 2100);
    assert.equal (view.tickers[1].low, 49000);
    await client.close ();
});

test ('show_tickers: a single symbol works and absent fields are simply omitted', async () => {
    // the stock fake ticker has no percentage/quoteVolume
    const client = await connectUi ();
    const { result, envelope } = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, [ { 'symbol': 'BTC/USDT', 'last': 50000 } ]);
    assert.equal (envelope.meta.count, 1);
    assert.equal (result.structuredContent.tickers.length, 1);
    assert.equal (result.structuredContent.tickers[0].info, undefined);
    assert.equal (result.structuredContent.tickers[0].bid, 49999);
    await client.close ();
});

// an exchange whose fetchTickers serves one market type per call (OKX does): the swap symbols
// of a mixed request simply do not come back
class SpotOnlyTickersExchange extends ContractExchange {
    async fetchTickers (symbols: string[]): Promise<any> {
        const result: Record<string, any> = {};
        for (const symbol of symbols.filter ((entry) => !entry.includes (':'))) {
            result[symbol] = await this.fetchTicker (symbol);
        }
        return result;
    }
}

// Regression: a requested symbol the exchange did not answer for vanished without a trace —
// only the view said so, the model was told nothing.
test ('show_tickers / get_tickers: requested symbols without a ticker are reported as missing', async () => {
    const client = await connectUi ({ 'exchangeClass': SpotOnlyTickersExchange });
    const symbols = [ 'BTC/USDT', 'BTC/USDT:USDT', 'BTC/USD:BTC' ];
    for (const name of [ 'show_tickers', 'get_tickers' ]) {
        const { envelope } = await callRaw (client, name, { 'exchange': 'fakex', symbols });
        assert.equal (envelope.ok, true, name);
        assert.deepEqual (envelope.data.map ((ticker: any) => ticker.symbol), [ 'BTC/USDT' ], name);
        assert.equal (envelope.meta.count, 1, name);
        assert.deepEqual (envelope.meta.missing, [ 'BTC/USDT:USDT', 'BTC/USD:BTC' ], name);
        assert.match (envelope.meta.notice, /no ticker was returned for: BTC\/USDT:USDT, BTC\/USD:BTC/, name);
        assert.match (envelope.meta.notice, /separate calls/, name);
    }
    const shown = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', symbols });
    // the missing-symbol notice and the view notice stay apart
    assert.match (shown.envelope.meta.notice, /separate calls \| an interactive view/);
    assert.deepEqual (shown.result.structuredContent.symbols, symbols);
    // nothing is reported when everything came back
    const complete = await callRaw (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.ok (!('missing' in complete.envelope.meta));
    assert.ok (complete.envelope.meta.notice === undefined || complete.envelope.meta.notice === null);
    await client.close ();
});

test ('show_tickers: contract markets are flagged so their volume is not read as base currency', async () => {
    const client = await connectUi ({ 'exchangeClass': ContractExchange });
    const symbols = [ 'BTC/USDT', 'BTC/USDT:USDT', 'BTC/USD:BTC', 'ETH/USDC:USDC' ];
    const { result, envelope } = await callRaw (client, 'show_tickers', { 'exchange': 'fakex', symbols });
    assert.equal (envelope.ok, true);
    // only the markets whose amounts are in contracts (contractSize other than 1)
    const expected = {
        'BTC/USDT:USDT': { 'contractSize': 0.01, 'inverse': false },
        'BTC/USD:BTC': { 'contractSize': 100, 'inverse': true },
    };
    assert.deepEqual (result.structuredContent.contracts, expected);
    assert.deepEqual (envelope.meta.contracts, expected);
    assert.match (envelope.meta.notice, /BTC\/USDT:USDT, BTC\/USD:BTC trade in contracts/);
    assert.ok (!('missing' in envelope.meta));
    // the ticker rows themselves are untouched
    assert.deepEqual (result.structuredContent.tickers.map ((ticker: any) => ticker.symbol), symbols);
    assert.equal (result.structuredContent.tickers[1].baseVolume, 16943765.38);
    for (const ticker of result.structuredContent.tickers) {
        assert.ok (!('contractSize' in ticker));
    }
    await client.close ();
});

test ('show_tickers: the symbols argument is bounded to 1..50 by the schema', async () => {
    const client = await connect ();
    for (const symbols of [ [], Array.from ({ 'length': 51 }, () => 'BTC/USDT') ]) {
        // the SDK reports an input-schema violation either as a protocol error or as an
        // isError result depending on its version — both are a rejection
        let rejected = false;
        try {
            const result: any = await client.callTool ({ 'name': 'show_tickers', 'arguments': { 'exchange': 'fakex', symbols } });
            rejected = result.isError === true;
            assert.equal (result.structuredContent, undefined);
        } catch (error) {
            rejected = true;
        }
        assert.ok (rejected, symbols.length + ' symbols must be rejected');
    }
    await client.close ();
});
