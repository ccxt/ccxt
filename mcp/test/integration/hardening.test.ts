import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { createSharedState, buildServer } from '../../ts/factory.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { SharedState } from '../../ts/factory.js';

// Input hardening in the shared tool code: it protects the local server and is the base
// the hosted server builds on (prototype review C1, H4, H5).

const ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } };

async function connect (options: { hosted?: boolean } = {}): Promise<{ client: Client, shared: SharedState }> {
    const shared = createSharedState ({
        'config': makeConfig (ACCOUNT),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-hardening-')),
    });
    const { server } = buildServer (shared, { 'hosted': options.hosted === true });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'hardening-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, shared };
}

async function raw (client: Client, name: string, args: any): Promise<any> {
    return client.callTool ({ name, 'arguments': args });
}

async function call (client: Client, name: string, args: any): Promise<any> {
    return JSON.parse ((await raw (client, name, args)).content[0].text);
}

test ('marketType: a traversal string is rejected by schema validation on every tool that takes it', async () => {
    const { client, shared } = await connect ();
    const traversal = '../../x';
    const calls: Array<[ string, any ]> = [
        [ 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ], 'marketType': traversal } ],
        [ 'get_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'marketType': traversal } ],
        [ 'get_ohlcv', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'marketType': traversal } ],
        [ 'get_trades', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'marketType': traversal } ],
        [ 'call_read_method', { 'exchange': 'fakex', 'method': 'fetchFundingRate', 'marketType': traversal } ],
        [ 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'symbol': 'BTC/USDT', 'marketType': traversal } ],
        [ 'get_positions', { 'account': 'acc', 'marketType': traversal } ],
        [ 'get_balance', { 'account': 'acc', 'marketType': traversal } ],
    ];
    for (const [ name, args ] of calls) {
        const result = await raw (client, name, args);
        assert.equal (result.isError, true, name);
        assert.match (result.content[0].text, /Input validation error/, name);
    }
    // nothing reached the pools: no instance was keyed by the bogus type
    const pool = (shared.pools as any).publicPool as Map<string, any>;
    assert.ok ([ ...pool.keys () ].every ((key) => !key.includes ('..')), [ ...pool.keys () ].join (','));
    // a real market type still routes
    const ok = await call (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ], 'marketType': 'spot' });
    assert.equal (ok.ok, true);
    // get_balance keeps exchange-specific wallet types (they never reach a path)
    const funding = await call (client, 'get_balance', { 'account': 'acc', 'marketType': 'funding' });
    assert.equal (funding.ok, true);
    await client.close ();
});

test ('params: credential-like keys are refused with BAD_REQUEST before the exchange is called, value never echoed', async () => {
    const { client, shared } = await connect ();
    const exchange: any = await shared.pools.getPublic ('fakex');
    let tickerCalls = 0;
    const original = exchange.fetchTicker.bind (exchange);
    exchange.fetchTicker = async (...args: any[]) => {
        tickerCalls += 1;
        return original (...args);
    };
    const secret = 'sk-LIVE-DO-NOT-ECHO-9f8e7d';
    const cases: Array<[ string, any ]> = [
        [ 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ], 'params': { 'apiKey': secret } } ],
        [ 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ], 'params': { 'nested': { 'secret': secret } } } ],
        [ 'get_ohlcv', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'params': { 'password': secret } } ],
        [ 'call_implicit_get', { 'exchange': 'fakex', 'method': 'publicGetTime', 'params': { 'privateKey': secret } } ],
        [ 'call_read_method', { 'exchange': 'fakex', 'method': 'fetchFundingRate', 'args': [ 'BTC/USDT' ], 'params': { 'passphrase': secret } } ],
        [ 'create_order', { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 50000, 'params': { 'twofa': secret } } ],
        [ 'call_write_method', { 'account': 'acc', 'method': 'closePosition', 'args': [ 'BTC/USDT', { 'token': secret } ] } ],
    ];
    for (const [ name, args ] of cases) {
        const result = await raw (client, name, args);
        assert.equal (result.isError, true, name);
        const text = result.content[0].text;
        assert.ok (!text.includes (secret), name + ' echoed the secret');
        const envelope = JSON.parse (text);
        assert.equal (envelope.error.code, 'BAD_REQUEST', name);
        assert.match (envelope.error.message, /credential-like/);
    }
    assert.equal (tickerCalls, 0, 'the exchange was never called with a secret');
    const { exchange: authed } = await shared.pools.getAuthenticated ('acc');
    assert.equal (authed.createdOrders.length, 0);
    assert.equal (exchange.implicitCalls.length, 0);
    // addresses are public identifiers and pass
    const address = await call (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ], 'params': { 'walletAddress': '0x' + '1'.repeat (40), 'user': '0x' + '2'.repeat (40) } });
    assert.equal (address.ok, true);
    assert.equal (tickerCalls, 1);
    await client.close ();
});

test ('params: the hosted refusal never mentions a local config file', async () => {
    const { client } = await connect ({ 'hosted': true });
    const envelope = await call (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ], 'params': { 'apiKey': 'x' } });
    assert.equal (envelope.error.code, 'BAD_REQUEST');
    assert.doesNotMatch (envelope.error.hint, /config/);
    await client.close ();
});

test ('limits: ohlcv 500, trades 200, order book 100, 50 symbols per ticker call', async () => {
    const { client, shared } = await connect ();
    const exchange: any = await shared.pools.getPublic ('fakex');
    const seen: Record<string, any> = {};
    for (const method of [ 'fetchOHLCV', 'fetchTrades', 'fetchOrderBook' ]) {
        const original = exchange[method].bind (exchange);
        exchange[method] = async (...args: any[]) => {
            seen[method] = args;
            return original (...args);
        };
    }
    await call (client, 'get_ohlcv', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 100000 });
    assert.equal (seen['fetchOHLCV'][3], 500);
    await call (client, 'get_trades', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 100000 });
    assert.equal (seen['fetchTrades'][2], 200);
    const book = await call (client, 'get_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'limit': 100000 });
    assert.equal (seen['fetchOrderBook'][1], 100);
    assert.equal (book.data.bids.length, 100);
    const tooMany = await raw (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': Array.from ({ 'length': 51 }, () => 'BTC/USDT') });
    assert.equal (tooMany.isError, true);
    assert.match (tooMany.content[0].text, /Input validation error/);
    await client.close ();
});

test ('limits: exchange ids, symbols and method names have length caps', async () => {
    const { client } = await connect ();
    const cases: Array<[ string, any ]> = [
        [ 'get_tickers', { 'exchange': 'x'.repeat (65), 'symbols': [ 'BTC/USDT' ] } ],
        [ 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'B'.repeat (257) ] } ],
        [ 'get_orderbook', { 'exchange': 'fakex', 'symbol': 'B'.repeat (257) } ],
        [ 'get_ohlcv', { 'exchange': '', 'symbol': 'BTC/USDT' } ],
        [ 'call_read_method', { 'exchange': 'fakex', 'method': 'fetch' + 'X'.repeat (200) } ],
        [ 'describe_exchange', { 'exchange': 'x'.repeat (1000) } ],
    ];
    for (const [ name, args ] of cases) {
        const result = await raw (client, name, args);
        assert.equal (result.isError, true, name + ' ' + JSON.stringify (args).slice (0, 60));
        assert.match (result.content[0].text, /Input validation error/);
    }
    await client.close ();
});

test ('errors: the hosted server strips URLs and bodies from upstream errors, stdio keeps them', async () => {
    const upstream = 'fakex GET https://api.fakex.example/v1/ticker?symbol=BTCUSDT 503 <html><body>' + 'z'.repeat (3000) + '</body></html>';
    for (const hosted of [ false, true ]) {
        const { client, shared } = await connect ({ hosted });
        const exchange: any = await shared.pools.getPublic ('fakex');
        exchange.fetchTicker = async () => {
            throw new Error (upstream);
        };
        const envelope = await call (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (envelope.ok, false);
        if (hosted) {
            assert.equal (envelope.error.message, 'fakex GET [url] 503 [response body removed]');
        } else {
            assert.equal (envelope.error.message, upstream);
        }
        await client.close ();
    }
});
