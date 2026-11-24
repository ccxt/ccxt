import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ORDER_FIELDS } from '../../ts/format.js';
import { FakeExchange } from '../helpers/fake-ccxt.js';
import { assertNoInfo, callRaw, callsTo, connectAccount as connect } from '../helpers/ui-client.js';

// The account views, over a real client <-> server pair (see test/helpers/ui-client.ts). Same
// contract as the market views (ui.*.test.ts): a compact envelope for the model, the dataset
// for the view — and only for a host that renders it. This file: show_orders.

test ('show_orders: open orders newest first for the view; counts and compact rows for the model', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_orders', { 'account': 'main' });
    assert.equal (envelope.ok, true);
    assert.deepEqual (Object.keys (view), [ 'view', 'account', 'exchange', 'exchangeName', 'environment', 'status', 'orders', 'hasMore' ]);
    assert.equal (view.view, 'orders');
    assert.equal (view.account, 'main');
    assert.equal (view.exchange, 'fakex');
    assert.equal (view.exchangeName, 'Fakex');
    assert.equal (view.environment, 'live');
    assert.equal (view.status, 'open');
    assert.equal (view.hasMore, false);
    // newest first; the order without a timestamp goes last
    assert.deepEqual (view.orders.map ((order: any) => order.id), [ 'o-3', 'o-2', 'o-market', 'o-eth', 'o-undated' ]);
    for (const order of view.orders) {
        for (const key of Object.keys (order)) {
            assert.ok (ORDER_FIELDS.includes (key), 'unexpected order field ' + key);
        }
    }
    // a market order has no price — the field is absent, not null or 0
    assert.ok (!('price' in view.orders[2]));
    assert.deepEqual (envelope.data, {
        'count': 5,
        'bySide': { 'buy': 3, 'sell': 2 },
        'byStatus': { 'open': 5 },
        'orders': [
            { 'id': 'o-3', 'symbol': 'BTC/USDT', 'side': 'buy', 'type': 'limit', 'price': 48000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-2', 'symbol': 'BTC/USDT', 'side': 'sell', 'type': 'limit', 'price': 52000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-market', 'symbol': 'BTC/USDT', 'side': 'sell', 'type': 'market', 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-eth', 'symbol': 'ETH/USDT', 'side': 'buy', 'type': 'limit', 'price': 1900, 'amount': 0.01, 'filled': 0, 'status': 'open' },
            { 'id': 'o-undated', 'symbol': 'BTC/USDT', 'side': 'buy', 'type': 'limit', 'price': 47000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        ],
    });
    assert.equal (envelope.meta.account, 'main');
    assert.equal (envelope.meta.environment, 'live');
    assert.equal (envelope.meta.status, 'open');
    assert.equal (envelope.meta.hasMore, false);
    assert.equal (envelope.meta.ui, 'displayed');
    assertNoInfo (result, 'show_orders');
    await client.close ();
});

test ('show_orders: symbol, since and limit reach the exchange; a full page reports hasMore and stays compact', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_orders', { 'account': 'paper', 'status': 'all', 'symbol': 'BTC/USDT', 'since': '2023-11-14T00:00:00Z', 'limit': 500 });
    assert.deepEqual (callsTo ('fetchOrders'), [ [ 'fetchOrders', [ 'BTC/USDT', Date.parse ('2023-11-14T00:00:00Z'), 200, {} ] ] ]);
    assert.equal (view.orders.length, 200);
    assert.equal (view.status, 'all');
    assert.equal (view.symbol, 'BTC/USDT');
    assert.equal (view.environment, 'sandbox');
    assert.equal (view.hasMore, true);
    assert.equal (view.orders[0].id, 'all-199');
    assert.equal (envelope.data.count, 200);
    assert.deepEqual (envelope.data.byStatus, { 'open': 100, 'closed': 100 });
    assert.deepEqual (envelope.data.bySide, { 'sell': 67, 'buy': 133 });
    assert.equal (envelope.data.orders.length, 10);
    assert.equal (envelope.meta.omitted, 190);
    assert.equal (envelope.meta.hasMore, true);
    assert.equal (envelope.meta.symbol, 'BTC/USDT');
    assert.ok (result.content[0].text.length < 2500, 'summary text should be compact, got ' + result.content[0].text.length);
    assert.ok (!result.content[0].text.includes ('all-50'));
    await client.close ();
});

test ('show_orders: status resolves to the same methods, fallbacks and errors as get_orders', async () => {
    const client = await connect ();
    const closed = await callRaw (client, 'show_orders', { 'account': 'main', 'status': 'closed' });
    assert.deepEqual (closed.view.orders.map ((order: any) => order.id), [ 'c-1' ]);
    assert.equal (callsTo ('fetchClosedOrders').length, 1);
    // no fetchCanceledOrders on this exchange: the combined method is used and filtered
    const canceled = await callRaw (client, 'show_orders', { 'account': 'main', 'status': 'canceled' });
    assert.deepEqual (canceled.view.orders.map ((order: any) => order.id), [ 'x-1' ]);
    assert.equal (callsTo ('fetchCanceledAndClosedOrders').length, 1);
    for (const args of [ { 'account': 'main', 'status': 'pending' }, { 'account': 'main', 'status': '' } ]) {
        const shown = await callRaw (client, 'show_orders', args);
        const data = await callRaw (client, 'get_orders', args);
        assert.equal (shown.envelope.error.code, 'BAD_REQUEST');
        assert.deepEqual (shown.envelope, data.envelope);
        assert.ok (!('structuredContent' in shown.result));
    }
    await client.close ();
    // the plain fake has fetchOpenOrders only
    const plain = await connect ({ 'exchangeClass': FakeExchange });
    const shown = await callRaw (plain, 'show_orders', { 'account': 'main', 'status': 'all' });
    const data = await callRaw (plain, 'get_orders', { 'account': 'main', 'status': 'all' });
    assert.equal (shown.envelope.error.code, 'NOT_SUPPORTED');
    assert.match (shown.envelope.error.hint, /supports: open$/);
    assert.deepEqual (shown.envelope, data.envelope);
    assert.ok (!('structuredContent' in shown.result));
    await plain.close ();
});

test ('get_orders and show_orders return the same rows for the same inputs', async () => {
    const client = await connect ();
    const byId = (rows: any[]) => [ ...rows ].sort ((a, b) => ((a.id < b.id) ? -1 : 1));
    const inputs = [
        { 'account': 'main' },
        { 'account': 'main', 'symbol': 'ETH/USDT' },
        { 'account': 'main', 'status': 'closed' },
        { 'account': 'main', 'status': 'canceled' },
        { 'account': 'main', 'status': 'all', 'limit': 7 },
    ];
    for (const args of inputs) {
        const data = await callRaw (client, 'get_orders', args);
        const shown = await callRaw (client, 'show_orders', args);
        assert.deepEqual (byId (shown.view.orders), byId (data.envelope.data), JSON.stringify (args));
        assert.equal (shown.view.orders.length, data.envelope.meta.count);
        assert.equal (shown.view.status, data.envelope.meta.status);
        assert.equal (shown.view.hasMore, data.envelope.meta.hasMore);
    }
    await client.close ();
});

test ('show_orders: no orders is an ok, empty view', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_orders', { 'account': 'main', 'symbol': 'SOL/USDT' });
    assert.deepEqual (view.orders, []);
    assert.equal (view.symbol, 'SOL/USDT');
    assert.deepEqual (envelope.data, { 'count': 0, 'bySide': {}, 'byStatus': {}, 'orders': [] });
    await client.close ();
});
