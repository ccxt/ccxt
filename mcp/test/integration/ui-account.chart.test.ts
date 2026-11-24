import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { AccountExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import { callRaw, callsTo, connectAccount as connect, UI_CAPABILITIES } from '../helpers/ui-client.js';

// The account views, over a real client <-> server pair (see test/helpers/ui-client.ts). Same
// contract as the market views (ui.*.test.ts): a compact envelope for the model, the dataset
// for the view — and only for a host that renders it. This file: the open-orders overlay
// of show_chart.

test ('show_chart: without an account the payload has no overlay keys and no private call is made', async () => {
    const client = await connect ();
    const { envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    assert.deepEqual (Object.keys (view), [ 'view', 'exchange', 'exchangeName', 'symbol', 'timeframe', 'timeframes', 'limit', 'candles' ]);
    assert.deepEqual (Object.keys (envelope.meta).sort (), [ 'exchange', 'notice', 'symbol', 'timeframe', 'ui' ]);
    assert.deepEqual (callsTo ('fetchOpenOrders'), []);
    await client.close ();
});

test ('show_chart: an account overlays its priced open orders for that symbol', async () => {
    const client = await connect ();
    const { result, envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'paper', 'params': { 'price': 'mark' } });
    assert.equal (envelope.ok, true);
    assert.deepEqual (Object.keys (view), [ 'view', 'exchange', 'exchangeName', 'symbol', 'timeframe', 'timeframes', 'limit', 'candles', 'account', 'environment', 'candlesEnvironment', 'orders' ]);
    assert.equal (view.candles.length, 200);
    assert.equal (view.account, 'paper');
    assert.equal (view.environment, 'sandbox');
    // the market order has no price to draw a line at; the ETH order is another symbol
    assert.deepEqual (view.orders, [
        { 'id': 'o-2', 'side': 'sell', 'type': 'limit', 'price': 52000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        { 'id': 'o-3', 'side': 'buy', 'type': 'limit', 'price': 48000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
        { 'id': 'o-undated', 'side': 'buy', 'type': 'limit', 'price': 47000, 'amount': 0.01, 'filled': 0, 'status': 'open' },
    ]);
    // four orders are open on the symbol, three of them have a price to draw a line at
    assert.equal (envelope.meta.openOrders, 4);
    assert.equal (envelope.meta.drawnOrders, 3);
    assert.equal (envelope.meta.account, 'paper');
    assert.equal (envelope.meta.environment, 'sandbox');
    assert.match (envelope.meta.notice, /1 open order\(s\) are not drawn/);
    // the candle summary is what it is without the overlay
    assert.equal (envelope.data.count, 200);
    // the candle params are not forwarded to the private call
    assert.deepEqual (callsTo ('fetchOpenOrders'), [ [ 'fetchOpenOrders', [ 'BTC/USDT', undefined, undefined, {} ] ] ]);
    // the orders stay out of the model's text
    assert.ok (!result.content[0].text.includes ('o-2'));
    await client.close ();
});

test ('show_chart: an account on another exchange is BAD_REQUEST before anything is fetched', async () => {
    let candleFetches = 0;
    class Counting extends AccountExchange {
        async fetchOHLCV (symbol: string, timeframe = '1h', since?: number, limit = 100): Promise<any> {
            candleFetches += 1;
            return super.fetchOHLCV (symbol, timeframe, since, limit);
        }
    }
    // "otherx" is a known exchange id for this server, so the mismatch — not the id — is the error
    const { server } = createServer ({
        'config': makeConfig ({ 'main': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' }, 'elsewhere': { 'exchange': 'otherx', 'apiKey': 'FAKEKEY998877', 'secret': 'FAKESECRET998877' } }),
        'ccxtModule': { ...fakeCcxtModule, 'exchanges': [ 'fakex', 'otherx' ], 'otherx': Counting },
        'poolsDeps': { ...fakePoolsDeps, 'exchangeClass': () => Counting, 'isKnownExchange': (id: string) => id === 'fakex' || id === 'otherx', 'allExchangeIds': () => [ 'fakex', 'otherx' ] },
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-ui-account-')),
    });
    AccountExchange.calls = [];
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'ui-account-test', 'version': '0.0.1' }, { 'capabilities': UI_CAPABILITIES });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'elsewhere' });
    assert.equal (result.isError, true);
    assert.equal (envelope.error.code, 'BAD_REQUEST');
    assert.match (envelope.error.message, /account "elsewhere" is on otherx, not fakex/);
    assert.match (envelope.error.hint, /exchange: "otherx"/);
    assert.ok (!('structuredContent' in result));
    assert.equal (candleFetches, 0);
    assert.deepEqual (callsTo ('fetchOpenOrders'), []);
    // the matching pair works
    const fine = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (fine.envelope.ok, true);
    assert.equal (fine.view.account, 'main');
    await client.close ();
});

test ('show_chart: a failing or unsupported open-orders fetch still returns the chart, with a notice', async () => {
    class Throwing extends AccountExchange {
        async fetchOpenOrders (): Promise<any> {
            throw new Error ('fakex requires a symbol-level permission');
        }
    }
    const failing = await connect ({ 'exchangeClass': Throwing });
    const failed = await callRaw (failing, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (failed.result.isError, undefined);
    assert.equal (failed.envelope.ok, true);
    assert.equal (failed.view.candles.length, 200);
    assert.equal (failed.view.account, 'main');
    assert.equal (failed.view.environment, 'live');
    assert.deepEqual (failed.view.orders, []);
    assert.ok (!('openOrders' in failed.envelope.meta) && !('drawnOrders' in failed.envelope.meta));
    assert.match (failed.envelope.meta.notice, /open orders are not drawn: fetching them failed \(fakex requires a symbol-level permission\)/);
    await failing.close ();
    class Unsupported extends AccountExchange {
        constructor (config: Record<string, any> = {}) {
            super (config);
            this.has = { ...this.has, 'fetchOpenOrders': false };
        }
    }
    const unsupported = await connect ({ 'exchangeClass': Unsupported });
    const without = await callRaw (unsupported, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (without.envelope.ok, true);
    assert.equal (without.view.candles.length, 200);
    assert.deepEqual (without.view.orders, []);
    assert.match (without.envelope.meta.notice, /open orders are not drawn: fakex has no fetchOpenOrders/);
    assert.deepEqual (callsTo ('fetchOpenOrders'), []);
    await unsupported.close ();
});

test ('show_chart: the overlay is capped at 50 orders and reports the rest', async () => {
    class Busy extends AccountExchange {
        async fetchOpenOrders (): Promise<any> {
            return Array.from ({ 'length': 80 }, (_, i) => AccountExchange.order ('b-' + i, 1700000000000 + i, 'buy', 'limit', 40000 + i, 'open'));
        }
    }
    const client = await connect ({ 'exchangeClass': Busy });
    const { envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (view.orders.length, 50);
    assert.equal (envelope.meta.openOrders, 80);
    assert.equal (envelope.meta.drawnOrders, 50);
    assert.match (envelope.meta.notice, /30 open order\(s\) are not drawn/);
    await client.close ();
});

test ('show_chart: with CCXT_MCP_UI unsupported the overlay is still counted for the model, without a payload', async () => {
    const client = await connect ({ 'ui': false });
    const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main' });
    assert.equal (envelope.meta.ui, 'unsupported');
    assert.equal (envelope.meta.openOrders, 4);
    assert.equal (envelope.meta.drawnOrders, 3);
    assert.deepEqual (Object.keys (result), [ 'content' ]);
    await client.close ();
});

// A venue whose environments are told apart by price: 60000 live, 20000 on the testnet and in
// demo trading. Every candle and order fetch records the instance it ran on.
class TwoEnvironments extends AccountExchange {
    static log: string[] = [];
    demoMode = false;

    enableDemoTrading (enabled: boolean) {
        this.demoMode = enabled;
    }

    where (): string {
        return (this.sandboxMode ? 'sandbox' : (this.demoMode ? 'demo' : 'live')) + ((this.config['apiKey'] !== undefined) ? '+key' : '');
    }

    async fetchOHLCV (_symbol: string, _timeframe = '1h', _since?: number, limit = 100): Promise<any> {
        TwoEnvironments.log.push ('fetchOHLCV ' + this.where ());
        const price = (this.sandboxMode || this.demoMode) ? 20000 : 60000;
        return Array.from ({ 'length': limit }, (_, i) => [ 1700000000000 + i * 3600000, price, price + 10, price - 10, price, 1 ]);
    }

    async fetchOpenOrders (symbol?: string, since?: number, limit?: number, params: any = {}): Promise<any> {
        TwoEnvironments.log.push ('fetchOpenOrders ' + this.where ());
        const price = (this.sandboxMode || this.demoMode) ? 19990 : 59990;
        return [ AccountExchange.order ('e-1', 1700000000000, 'buy', 'limit', price, 'open', symbol) ];
    }
}

test ('show_chart: a sandbox or demo account gets candles from ITS environment — the order lines and the candles are one market', async () => {
    for (const [ account, environment ] of [ [ 'paper', 'sandbox' ], [ 'demo', 'demo' ] ]) {
        TwoEnvironments.log = [];
        const client = await connect ({ 'exchangeClass': TwoEnvironments });
        const { envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', account, 'limit': 5 });
        // both fetches ran on the account's own instance; the live public one was not asked
        assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV ' + environment + '+key', 'fetchOpenOrders ' + environment + '+key' ], account);
        assert.equal (envelope.data.close, 20000, account);
        assert.equal (view.candles[0][4], 20000, account);
        assert.equal (view.orders[0].price, 19990, account);
        assert.equal (view.environment, environment);
        assert.equal (view.candlesEnvironment, environment);
        assert.equal (envelope.meta.environment, environment);
        assert.equal (envelope.meta.candlesEnvironment, environment);
        assert.ok (envelope.meta.notice.includes ('candles and order lines are both from the ' + environment + ' environment of fakex (account "' + account + '"), not the live market'), envelope.meta.notice);
        await client.close ();
    }
    // a live account, and a chart without an account, stay on the public live instance
    TwoEnvironments.log = [];
    const client = await connect ({ 'exchangeClass': TwoEnvironments });
    const live = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'main', 'limit': 5 });
    assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV live', 'fetchOpenOrders live+key' ]);
    assert.equal (live.envelope.data.close, 60000);
    assert.equal (live.view.candlesEnvironment, 'live');
    assert.equal (live.envelope.meta.candlesEnvironment, 'live');
    assert.ok (!/environment of fakex|LIVE market data/.test (live.envelope.meta.notice));
    TwoEnvironments.log = [];
    const plain = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 5 });
    assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV live' ]);
    assert.ok (!('candlesEnvironment' in plain.view) && !('candlesEnvironment' in plain.envelope.meta));
    await client.close ();
});

test ('show_chart: when the practice environment serves no candles the live ones are shown — and named as a different market', async () => {
    class NoTestnetCandles extends TwoEnvironments {
        async fetchOHLCV (symbol: string, timeframe = '1h', since?: number, limit = 100): Promise<any> {
            if (this.sandboxMode) {
                TwoEnvironments.log.push ('fetchOHLCV ' + this.where () + ' (throws)');
                throw new Error ('fakex testnet does not serve klines');
            }
            return super.fetchOHLCV (symbol, timeframe, since, limit);
        }
    }
    TwoEnvironments.log = [];
    const client = await connect ({ 'exchangeClass': NoTestnetCandles });
    const { result, envelope, view } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'account': 'paper', 'limit': 5 });
    assert.equal (result.isError, undefined);
    assert.deepEqual (TwoEnvironments.log, [ 'fetchOHLCV sandbox+key (throws)', 'fetchOHLCV live', 'fetchOpenOrders sandbox+key' ]);
    assert.equal (envelope.data.close, 60000);
    assert.equal (view.orders[0].price, 19990);
    assert.equal (view.environment, 'sandbox');
    assert.equal (view.candlesEnvironment, 'live');
    assert.equal (envelope.meta.environment, 'sandbox');
    assert.equal (envelope.meta.candlesEnvironment, 'live');
    assert.ok (envelope.meta.notice.includes ('the candles are LIVE market data (the sandbox environment of fakex could not serve them: fakex testnet does not serve klines) while the order lines are from the sandbox account "paper"'), envelope.meta.notice);
    assert.ok (!envelope.meta.notice.includes ('are both from'));
    await client.close ();
    // a live chart that fails is still an error, not a fallback
    class NoCandles extends TwoEnvironments {
        async fetchOHLCV (): Promise<any> {
            throw new Error ('fakex does not have market symbol NOPE/USDT');
        }
    }
    for (const account of [ 'main', 'paper' ]) {
        const failing = await connect ({ 'exchangeClass': NoCandles });
        const failed = await callRaw (failing, 'show_chart', { 'exchange': 'fakex', 'symbol': 'NOPE/USDT', account });
        assert.equal (failed.result.isError, true, account);
        assert.match (failed.envelope.error.message, /does not have market symbol/, account);
        assert.ok (!('structuredContent' in failed.result), account);
        await failing.close ();
    }
});

test ('show_chart: an account of the other namespace (prediction vs not) is BAD_REQUEST before anything is fetched', async () => {
    class Prediction extends TwoEnvironments {}
    TwoEnvironments.log = [];
    AccountExchange.calls = [];
    const { server } = createServer ({
        'config': makeConfig ({ 'main': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456' }, 'bets': { 'apiKey': 'FAKEKEY445566', 'secret': 'FAKESECRET445566', 'prediction': true } }),
        'ccxtModule': fakeCcxtModule,
        // an id that exists in both namespaces, like the real loader's exchangeClass
        'poolsDeps': { ...fakePoolsDeps, 'exchangeClass': (_id: string, prediction?: boolean) => (prediction ? Prediction : TwoEnvironments) },
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-ui-account-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'ui-account-test', 'version': '0.0.1' }, { 'capabilities': UI_CAPABILITIES });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    for (const [ account, prediction, side ] of [ [ 'bets', undefined, 'prediction' ], [ 'bets', false, 'prediction' ], [ 'main', true, 'non-prediction' ] ] as [ string, boolean | undefined, string ][]) {
        const { result, envelope } = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', account, prediction });
        assert.equal (result.isError, true, account);
        assert.equal (envelope.error.code, 'BAD_REQUEST', account);
        assert.ok (envelope.error.message.includes ('account "' + account + '" is a ' + side + ' account on fakex, but the chart was requested with prediction: ' + (prediction ?? false)), envelope.error.message);
        assert.ok (envelope.error.hint.includes ('pass prediction: ' + (side === 'prediction')), envelope.error.hint);
        assert.ok (!('structuredContent' in result));
    }
    assert.deepEqual (TwoEnvironments.log, []);
    // the matching pairs work
    for (const [ account, prediction ] of [ [ 'bets', true ], [ 'main', undefined ], [ 'main', false ] ] as [ string, boolean | undefined ][]) {
        const fine = await callRaw (client, 'show_chart', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', account, prediction });
        assert.equal (fine.envelope.ok, true, account);
        assert.equal (fine.view.account, account);
    }
    await client.close ();
});
