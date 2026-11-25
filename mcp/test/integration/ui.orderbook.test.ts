import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FakeExchange } from '../helpers/fake-ccxt.js';
import { callRaw, connectUi, ContractExchange, T0 } from '../helpers/ui-client.js';

// MCP Apps UI (io.modelcontextprotocol/ui), over a real client <-> server pair (see
// test/helpers/ui-client.ts). show_orderbook: the summary for the model, the
// ladder for the view, and the unit the amounts are in.

// 200 levels a side with a 2.0 spread; asks carry a third per-level element (kraken-style)
class BookExchange extends FakeExchange {
    async fetchOrderBook (symbol: string): Promise<any> {
        return {
            symbol,
            'timestamp': T0,
            'datetime': '2023-11-14T22:13:20.000Z',
            'nonce': 1,
            'bids': Array.from ({ 'length': 200 }, (_, i) => [ 49999 - i, 2 ]),
            'asks': Array.from ({ 'length': 200 }, (_, i) => [ 50001 + i, 1, T0 + i ]),
        };
    }
}

test ('show_orderbook: summary for the model, [price, amount] ladder for the view', async () => {
    const client = await connectUi ({ 'exchangeClass': BookExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (result.isError, undefined);
    assert.equal (envelope.ok, true);
    assert.deepEqual (envelope.data, {
        'bestBid': 49999,
        'bestAsk': 50001,
        'bidLevels': 50,
        'askLevels': 50,
        'bidDepth': 100,
        'askDepth': 50,
        'depthUnit': 'BTC',
        'mid': 50000,
        'spread': 2,
        'spreadPercent': 0.004,
    });
    assert.equal (envelope.data.bids, undefined);
    assert.equal (envelope.data.asks, undefined);
    assert.ok (result.content[0].text.length < 1500, 'summary text should be compact');
    assert.equal (envelope.meta.exchange, 'fakex');
    assert.equal (envelope.meta.symbol, 'BTC/USDT');
    assert.equal (envelope.meta.timestamp, T0);
    assert.equal (envelope.meta.datetime, '2023-11-14T22:13:20.000Z');
    assert.equal (envelope.meta.ui, 'displayed');
    // a spot market: amounts are base currency, nothing contract-related is reported
    assert.equal (envelope.meta.amountUnit, 'BTC');
    assert.ok (!('contractSize' in envelope.meta));
    assert.ok (!('inverse' in envelope.meta));
    const view = result.structuredContent;
    assert.equal (view.view, 'orderbook');
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.equal (view.symbol, 'BTC/USDT');
    assert.equal (view.base, 'BTC');
    assert.equal (view.quote, 'USDT');
    assert.equal (view.contractSize, 1);
    assert.equal (view.inverse, false);
    assert.equal (view.amountUnit, 'BTC');
    assert.equal (view.limit, 50);
    assert.equal (view.timestamp, T0);
    assert.equal (view.bids.length, 50);
    assert.equal (view.asks.length, 50);
    assert.deepEqual (view.bids[0], [ 49999, 2 ]);
    assert.deepEqual (view.bids[49], [ 49950, 2 ]);
    assert.deepEqual (view.asks[0], [ 50001, 1 ]);
    assert.deepEqual (view.asks[49], [ 50050, 1 ]);
    for (const level of [ ...view.bids, ...view.asks ]) {
        assert.equal (level.length, 2, 'every level is exactly [price, amount]');
    }
    await client.close ();
});

test ('show_orderbook: limit defaults to 50 and is clamped to 1..100', async () => {
    const client = await connectUi ({ 'exchangeClass': BookExchange });
    const cases: [ any, number ][] = [ [ undefined, 50 ], [ 5, 5 ], [ 100, 100 ], [ 101, 100 ], [ 5000, 100 ], [ 0, 1 ] ];
    for (const [ limit, expected ] of cases) {
        const args: any = { 'exchange': 'fakex', 'symbol': 'BTC/USDT' };
        if (limit !== undefined) {
            args['limit'] = limit;
        }
        const { result, envelope } = await callRaw (client, 'show_orderbook', args);
        assert.equal (envelope.ok, true, 'limit ' + limit);
        assert.equal (result.structuredContent.limit, expected, 'limit ' + limit);
        assert.equal (result.structuredContent.bids.length, expected, 'limit ' + limit);
        assert.equal (result.structuredContent.asks.length, expected, 'limit ' + limit);
        assert.equal (envelope.data.bidLevels, expected, 'limit ' + limit);
        assert.equal (envelope.data.askLevels, expected, 'limit ' + limit);
        assert.equal (envelope.data.bidDepth, expected * 2, 'limit ' + limit);
        assert.equal (envelope.data.askDepth, expected, 'limit ' + limit);
    }
    await client.close ();
});

class OneSidedBookExchange extends FakeExchange {
    async fetchOrderBook (symbol: string): Promise<any> {
        return { symbol, 'timestamp': undefined, 'datetime': undefined, 'bids': [ [ 49999, 3 ] ], 'asks': [] };
    }
}

test ('show_orderbook: a one-sided book has no mid/spread and still renders', async () => {
    const client = await connectUi ({ 'exchangeClass': OneSidedBookExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.equal (envelope.ok, true);
    assert.equal (envelope.data.bestBid, 49999);
    assert.equal (envelope.data.bidDepth, 3);
    assert.equal (envelope.data.askLevels, 0);
    assert.equal (envelope.data.askDepth, 0);
    for (const key of [ 'bestAsk', 'mid', 'spread', 'spreadPercent' ]) {
        assert.ok (envelope.data[key] === undefined || envelope.data[key] === null, key + ' must be absent or null');
    }
    assert.deepEqual (result.structuredContent.bids, [ [ 49999, 3 ] ]);
    assert.deepEqual (result.structuredContent.asks, []);
    await client.close ();
});

// Regression: contract counts were presented as base currency. On a 0.01-BTC contract the
// 700 "BTC" of bids were really 7 BTC, and the view's notional was off by the same factor.
test ('show_orderbook: a linear contract market reports contracts plus base/quote equivalents', async () => {
    const client = await connectUi ({ 'exchangeClass': ContractExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT:USDT' });
    assert.equal (envelope.ok, true);
    assert.equal (envelope.data.bidDepth, 700);
    assert.equal (envelope.data.askDepth, 800);
    assert.equal (envelope.data.depthUnit, 'contracts');
    // amount * contractSize, and that times the level price
    assert.equal (envelope.data.bidDepthBase, 7);
    assert.equal (envelope.data.askDepthBase, 8);
    assert.equal (envelope.data.bidDepthQuote, 600 * 0.01 * 50000 + 100 * 0.01 * 40000);
    assert.equal (envelope.data.askDepthQuote, 300 * 0.01 * 50010 + 500 * 0.01 * 62500);
    assert.equal (envelope.meta.amountUnit, 'contracts');
    assert.equal (envelope.meta.contractSize, 0.01);
    assert.ok (!('inverse' in envelope.meta));
    assert.match (envelope.meta.notice, /amounts are in contracts \(1 contract = 0\.01 BTC\)/);
    const view = result.structuredContent;
    assert.equal (view.contractSize, 0.01);
    assert.equal (view.inverse, false);
    assert.equal (view.amountUnit, 'contracts');
    assert.equal (view.base, 'BTC');
    assert.equal (view.quote, 'USDT');
    // the levels themselves are passed through unconverted
    assert.deepEqual (view.bids, [ [ 50000, 600 ], [ 40000, 100 ] ]);
    await client.close ();
});

test ('show_orderbook: an inverse contract market — contractSize is quote currency per contract', async () => {
    const client = await connectUi ({ 'exchangeClass': ContractExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USD:BTC' });
    assert.equal (envelope.data.depthUnit, 'contracts');
    assert.equal (envelope.data.bidDepth, 700);
    // amount * contractSize is the quote value; divided by the level price, the base amount
    assert.equal (envelope.data.bidDepthQuote, 70000);
    assert.equal (envelope.data.askDepthQuote, 80000);
    assert.equal (envelope.data.bidDepthBase, (600 * 100) / 50000 + (100 * 100) / 40000);
    assert.equal (envelope.data.askDepthBase, Number (((300 * 100) / 50010 + (500 * 100) / 62500).toPrecision (12)));
    assert.equal (envelope.meta.amountUnit, 'contracts');
    assert.equal (envelope.meta.contractSize, 100);
    assert.equal (envelope.meta.inverse, true);
    assert.match (envelope.meta.notice, /1 contract = 100 USD/);
    assert.equal (result.structuredContent.contractSize, 100);
    assert.equal (result.structuredContent.inverse, true);
    assert.equal (result.structuredContent.amountUnit, 'contracts');
    await client.close ();
});

test ('show_orderbook: a contract market with contractSize 1 is plain base currency', async () => {
    const client = await connectUi ({ 'exchangeClass': ContractExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'ETH/USDC:USDC' });
    assert.equal (envelope.data.depthUnit, 'ETH');
    for (const key of [ 'bidDepthBase', 'askDepthBase', 'bidDepthQuote', 'askDepthQuote' ]) {
        assert.ok (!(key in envelope.data), key + ' is only reported for contract-denominated amounts');
    }
    assert.equal (envelope.meta.amountUnit, 'ETH');
    assert.ok (!('contractSize' in envelope.meta));
    assert.ok (!/contracts/.test (envelope.meta.notice));
    assert.equal (result.structuredContent.contractSize, 1);
    assert.equal (result.structuredContent.amountUnit, 'ETH');
    await client.close ();
});

test ('show_orderbook: an unknown market (e.g. a prediction outcome) has no unit to report', async () => {
    const client = await connectUi ({ 'exchangeClass': ContractExchange });
    const { result, envelope } = await callRaw (client, 'show_orderbook', { 'exchange': 'fakex', 'symbol': 'NOT/LISTED' });
    assert.equal (envelope.ok, true);
    assert.ok (!('depthUnit' in envelope.data));
    assert.ok (!('amountUnit' in envelope.meta));
    assert.equal (result.structuredContent.contractSize, 1);
    assert.equal (result.structuredContent.inverse, false);
    assert.ok (!('amountUnit' in result.structuredContent));
    await client.close ();
});
