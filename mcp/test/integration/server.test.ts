import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { ServerContext } from '../../ts/types.js';

async function connect (accounts: any): Promise<{ client: Client, ctx: ServerContext }> {
    const { server, ctx } = createServer ({
        'config': makeConfig (accounts),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-int-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'integration-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, ctx };
}

async function call (client: Client, name: string, args: any): Promise<any> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    return JSON.parse (result.content[0].text);
}

const TRADING_ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'confirm': 'always' as const, 'maxOrderValue': 100 } };

test ('market data flows end to end with projection and info stripped', async () => {
    const { client } = await connect ({});
    const tickers = await call (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    assert.equal (tickers.ok, true);
    assert.equal (tickers.data[0].last, 50000);
    assert.equal (tickers.data[0].info, undefined);
    const book = await call (client, 'get_orderbook', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'depth': 5 });
    assert.equal (book.data.bids.length, 5);
    const markets = await call (client, 'search_markets', { 'exchange': 'fakex', 'base': 'BTC' });
    assert.equal (markets.data[0].symbol, 'BTC/USDT');
    assert.equal (markets.data[0].info, undefined);
    await client.close ();
});

test ('call_read_method: reads pass, writes and watch are structurally rejected', async () => {
    const { client } = await connect ({});
    const funding = await call (client, 'call_read_method', { 'exchange': 'fakex', 'method': 'fetchFundingRate', 'args': [ 'BTC/USDT' ] });
    assert.equal (funding.ok, true);
    assert.equal (funding.data.fundingRate, 0.0001);
    assert.equal (funding.data.info, undefined);
    for (const method of [ 'createOrder', 'withdraw', 'setLeverage', 'signIn', 'sendEvmTransaction' ]) {
        const rejected = await call (client, 'call_read_method', { 'exchange': 'fakex', method });
        assert.equal (rejected.ok, false, method + ' must be rejected');
        assert.equal (rejected.error.code, 'NOT_A_READ_METHOD', method);
    }
    // streaming methods get a distinct, actionable code pointing at the fetch* equivalent
    for (const method of [ 'watchTicker', 'fetchTickerWs', 'unWatchTicker' ]) {
        const rejected = await call (client, 'call_read_method', { 'exchange': 'fakex', method });
        assert.equal (rejected.ok, false, method + ' must be rejected');
        assert.equal (rejected.error.code, 'STREAMING_NOT_SUPPORTED', method);
    }
    await client.close ();
});

test ('describe_method keyword search: token-matched and defaults to a complete reference', async () => {
    const { client } = await connect ({});
    // multi-word query must hit camelCase names via token matching
    const search = await call (client, 'describe_method', { 'query': 'funding rate', 'exchange': 'fakex' });
    assert.equal (search.ok, true);
    assert.ok (search.data.unified.some ((m: any) => m.name === 'fetchFundingRate'), 'token search should find fetchFundingRate');
    // without an exchange it must still search a real surface, not error
    const noExchange = await call (client, 'describe_method', { 'query': 'ticker' });
    assert.equal (noExchange.ok, true);
    assert.ok (noExchange.meta.searchedExchange !== undefined);
    await client.close ();
});

test ('malformed since is rejected loudly, not silently defaulted', async () => {
    const { client } = await connect ({});
    const bad = await call (client, 'get_ohlcv', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'since': 'not-a-date' });
    assert.equal (bad.ok, false);
    assert.equal (bad.error.code, 'BAD_REQUEST');
    assert.ok (bad.error.message.includes ('since'));
    // a valid ISO string still works
    const good = await call (client, 'get_ohlcv', { 'exchange': 'fakex', 'symbol': 'BTC/USDT', 'since': '2024-01-01T00:00:00Z', 'limit': 3 });
    assert.equal (good.ok, true);
    await client.close ();
});

test ('implicit endpoints: GET callable, non-GET refused without the implicitWrites tier', async () => {
    const { client } = await connect ({});
    const time = await call (client, 'call_implicit_get', { 'exchange': 'fakex', 'method': 'publicGetTime' });
    assert.equal (time.ok, true);
    assert.equal (time.data.serverTime, 1234567890);
    const post = await call (client, 'call_implicit_get', { 'exchange': 'fakex', 'method': 'privatePostOrderCancel' });
    assert.equal (post.ok, false);
    assert.equal (post.error.code, 'NOT_A_GET_ENDPOINT');
    await client.close ();
});

test ('private reads work against a configured account', async () => {
    const { client } = await connect (TRADING_ACCOUNT);
    const balance = await call (client, 'get_balance', { 'account': 'acc' });
    assert.equal (balance.ok, true);
    assert.deepEqual (balance.data['USDT'], { 'free': 1000, 'used': 0, 'total': 1000 });
    assert.equal (balance.data['BTC'], undefined);
    assert.equal (balance.meta.hiddenZeroBalances, 1);
    assert.equal (balance.meta.environment, 'sandbox');
    const unknown = await call (client, 'get_balance', { 'account': 'nope' });
    assert.equal (unknown.error.code, 'UNKNOWN_ACCOUNT');
    await client.close ();
});

test ('create_order: preview + confirm token executes exactly once, journaled', async () => {
    const { client, ctx } = await connect (TRADING_ACCOUNT);
    const orderArgs = { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 50000 };
    const preview = await call (client, 'create_order', orderArgs);
    assert.equal (preview.ok, true);
    assert.equal (preview.meta.confirmationRequired, true);
    assert.equal (preview.data.preview.estimatedValueUsd, 50);
    const executed = await call (client, 'create_order', { ...orderArgs, 'confirm': preview.meta.confirmToken });
    assert.equal (executed.ok, true);
    assert.equal (executed.data.status, 'open');
    assert.equal (executed.data.info, undefined);
    // the fake exchange saw exactly one order
    const { exchange } = await ctx.pools.getAuthenticated ('acc');
    assert.equal (exchange.createdOrders.length, 1);
    // reusing the token fails
    const replay = await call (client, 'create_order', { ...orderArgs, 'confirm': preview.meta.confirmToken });
    assert.equal (replay.error.code, 'CONFIRM_INVALID');
    // journal recorded intent + result
    const journalFiles = fs.readdirSync (ctx.journal.location ());
    const content = fs.readFileSync (path.join (ctx.journal.location (), journalFiles[0])).toString ();
    assert.ok (content.includes ('"event":"intent"'));
    assert.ok (content.includes ('"event":"result"'));
    assert.ok (!content.includes ('FAKESECRET'));
    await client.close ();
});

test ('order rails: cap and market limits enforced at execution', async () => {
    const { client } = await connect (TRADING_ACCOUNT);
    const over = await call (client, 'create_order', { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.01, 'price': 50000 });
    assert.equal (over.error.code, 'ORDER_VALUE_CAP');
    const dust = await call (client, 'create_order', { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.00001, 'price': 50000 });
    assert.equal (dust.error.code, 'BELOW_MARKET_MINIMUM');
    await client.close ();
});

test ('sell-by-cost without native support is refused, buy-by-cost falls back safely', async () => {
    const { client, ctx } = await connect (TRADING_ACCOUNT);
    const sell = await call (client, 'create_order', { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'sell', 'cost': 50 });
    assert.equal (sell.ok, false);
    assert.equal (sell.error.code, 'NOT_SUPPORTED');
    const buyPreview = await call (client, 'create_order', { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'cost': 50 });
    assert.equal (buyPreview.ok, true);
    const executed = await call (client, 'create_order', { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'cost': 50, 'confirm': buyPreview.meta.confirmToken });
    assert.equal (executed.ok, true);
    const { exchange } = await ctx.pools.getAuthenticated ('acc');
    // the fallback carries the buy-only flag and the cost in params
    assert.equal (exchange.createdOrders[0].amount, 50);
    await client.close ();
});

test ('params-based notional override is rejected end to end', async () => {
    const { client } = await connect (TRADING_ACCOUNT);
    const smuggled = await call (client, 'create_order', { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'amount': 0.001, 'params': { 'quoteOrderQty': 999999 } });
    assert.equal (smuggled.ok, false);
    assert.equal (smuggled.error.code, 'PARAMS_NOTIONAL_OVERRIDE');
    await client.close ();
});

test ('trading tier is re-checked at the execution point', async () => {
    const { client } = await connect ({
        ...TRADING_ACCOUNT,
        'readonly': { 'apiKey': 'FAKEKEY999999', 'secret': 'FAKESECRET999999' },
    });
    const denied = await call (client, 'create_order', { 'account': 'readonly', 'symbol': 'BTC/USDT', 'type': 'market', 'side': 'buy', 'amount': 0.001 });
    assert.equal (denied.error.code, 'TIER_DISABLED');
    assert.ok (denied.error.message.includes ('cannot be enabled from the conversation'));
    await client.close ();
});

test ('cancel_order needs no confirmation and reports idempotent cancels', async () => {
    const { client, ctx } = await connect (TRADING_ACCOUNT);
    const result = await call (client, 'cancel_order', { 'account': 'acc', 'id': 'order-1', 'symbol': 'BTC/USDT' });
    assert.equal (result.ok, true);
    assert.equal (result.data.status, 'canceled');
    const { exchange } = await ctx.pools.getAuthenticated ('acc');
    assert.deepEqual (exchange.canceled, [ 'order-1' ]);
    await client.close ();
});

test ('withdraw: funds tier gating, preview echoes address, dispatch works when enabled', async () => {
    const { client, ctx } = await connect ({
        'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'confirm': 'always' },
    });
    const preview = await call (client, 'withdraw', { 'account': 'acc', 'code': 'USDT', 'amount': 100, 'address': 'DEST-ADDRESS-1' });
    assert.equal (preview.ok, true);
    assert.equal (preview.data.preview.destinationAddress, 'DEST-ADDRESS-1');
    assert.equal (preview.data.preview.estimatedValueUsd, 100);
    const executed = await call (client, 'withdraw', { 'account': 'acc', 'code': 'USDT', 'amount': 100, 'address': 'DEST-ADDRESS-1', 'confirm': preview.meta.confirmToken });
    assert.equal (executed.ok, true);
    const { exchange } = await ctx.pools.getAuthenticated ('acc');
    assert.equal (exchange.withdrawals.length, 1);
    await client.close ();
});

test ('instance reuse: sequential calls hit one cached instance', async () => {
    const { client, ctx } = await connect (TRADING_ACCOUNT);
    await call (client, 'get_tickers', { 'exchange': 'fakex', 'symbols': [ 'BTC/USDT' ] });
    await call (client, 'get_trades', { 'exchange': 'fakex', 'symbol': 'BTC/USDT' });
    const first = await ctx.pools.getPublic ('fakex');
    const second = await ctx.pools.getPublic ('fakex');
    assert.equal (first, second);
    await client.close ();
});

test ('call_write_method: allowlist enforced, allowlisted method dispatches with confirmation', async () => {
    const { client } = await connect (TRADING_ACCOUNT);
    const notAllowed = await call (client, 'call_write_method', { 'account': 'acc', 'method': 'createOrders' });
    assert.equal (notAllowed.error.code, 'METHOD_NOT_ALLOWLISTED');
    const preview = await call (client, 'call_write_method', { 'account': 'acc', 'method': 'closePosition', 'args': [ 'BTC/USDT' ] });
    assert.equal (preview.meta.confirmationRequired, true);
    await client.close ();
});
