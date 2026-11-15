// fetch_route / execute_route against ccxt's real OrderRouter (the installed package) with
// the router HTTP service stubbed at globalThis.fetch and venues from the fake ccxt module.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { ccxt } from '../../ts/ccxt-loader.js';
import { createRouter, routerUserAgent } from '../../ts/tools/route.js';
import { FakeExchange, fakeCcxtModule, makeConfig } from '../helpers/fake-ccxt.js';
import type { PoolsDeps } from '../../ts/pools.js';

const require = createRequire (import.meta.url);
const fixture = require ('../../../ts/src/test/base/fixtures/orderRouter.json');

// a venue whose IOC limit orders fill completely at the limit price
class FillingExchange extends FakeExchange {
    async createOrder (symbol: string, type: string, side: string, amount: number, price?: number, params: any = {}): Promise<any> {
        const n = this.createdOrders.length + 1;
        const order = { 'id': 'fill-' + n, symbol, type, side, amount, price, params, 'filled': amount, 'remaining': 0, 'average': price, 'cost': amount * (price ?? 0), 'status': 'closed', 'fee': { 'currency': 'USDT', 'cost': 0 } };
        this.createdOrders.push (order);
        return order;
    }
}

const venues: FillingExchange[] = [];
class TrackedExchange extends FillingExchange {
    constructor (config: Record<string, any> = {}) {
        super (config);
        venues.push (this);
    }
}

const poolsDeps: PoolsDeps = {
    'exchangeClass': () => TrackedExchange,
    'isKnownExchange': (id: string) => id === 'fakex',
    'allExchangeIds': () => [ 'fakex' ],
    'closestMatches': () => [ 'fakex' ],
};

// a one-hop USDT -> BTC buy on fakex, shaped like the service's RouteResult
function fakexRoute (overrides: Record<string, any> = {}, amount = 0.001): any {
    return {
        'requestId': 'req-' + Math.random ().toString (36).slice (2),
        'calculatedAt': Date.now (),
        'from': 'USDT',
        'to': 'BTC',
        'amountIn': amount * 50000,
        'amountOut': amount,
        'requestedAmount': amount * 50000,
        'exactSide': 'in',
        'strategy': 'best_single',
        'hops': [ {
            'pair': 'BTC/USDT', 'side': 'buy', 'base': 'BTC', 'quote': 'USDT', 'amountIn': amount * 50000, 'amountOut': amount,
            'legs': [ { 'exchangeId': 'fakex', amount, 'averagePrice': 50000, 'takerFeeRate': 0.001, 'feeCost': 0, 'effectivePrice': 50000 } ],
            'feeCost': 0, 'feeCurrency': 'USDT', 'fullyFillable': true, 'referencePrice': 50000, 'impactBps': 0,
        } ],
        'effectiveRate': 0.00002,
        'referenceRate': 0.00002,
        'impactBps': 0,
        'fullyFillable': true,
        'fillRatio': 1,
        'unfilledAmount': 0,
        'unroutableReason': null,
        'unroutableHopIndex': null,
        'warnings': [],
        ...overrides,
    };
}

interface Stubbed { url: string, headers: Record<string, string> }
const requests: Stubbed[] = [];
const realFetch = globalThis.fetch;

function stubRouter (status: number, body: any, headers: Record<string, string> = {}): void {
    globalThis.fetch = (async (url: any, options: any = {}) => {
        requests.push ({ 'url': String (url), 'headers': options.headers ?? {} });
        return new Response (JSON.stringify (body), { status, headers });
    }) as any;
}

afterEach (() => {
    globalThis.fetch = realFetch;
    requests.length = 0;
    venues.length = 0;
});

const TRADING = { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true as const, 'maxOrderValue': 100 };

async function connect (accounts: any = {}): Promise<{ client: Client, journalDir: string }> {
    const journalDir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-route-'));
    const { server } = createServer ({
        'config': makeConfig (accounts),
        'ccxtModule': fakeCcxtModule,
        poolsDeps,
        'version': 'test',
        journalDir,
        'router': new ccxt.OrderRouter ({ 'userAgent': 'ccxt-mcp/test' }),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'route-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, journalDir };
}

async function call (client: Client, name: string, args: any): Promise<any> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    try {
        return JSON.parse (result.content[0].text);
    } catch (e) {
        return { 'ok': false, 'raw': result.content[0].text, 'isError': result.isError };
    }
}

// ----- fetch_route -------------------------------------------------------------

test ('fetch_route: exactly one of amountIn / amountOut', async () => {
    const { client } = await connect ();
    stubRouter (200, fixture.routes.directBuy);
    for (const args of [ {}, { 'amountIn': 1, 'amountOut': 1 } ]) {
        const result = await call (client, 'fetch_route', { 'from': 'USDT', 'to': 'BTC', ...args });
        assert.equal (result.ok, false);
        assert.equal (result.error.code, 'BAD_REQUEST');
    }
    assert.equal (requests.length, 0, 'nothing reaches the router on bad input');
});

test ('fetch_route: strategy is an enum', async () => {
    const { client } = await connect ();
    stubRouter (200, fixture.routes.directBuy);
    const result = await call (client, 'fetch_route', { 'from': 'USDT', 'to': 'BTC', 'amountIn': 1000, 'strategy': 'cheapest' });
    assert.equal (result.ok, false);
    assert.equal (requests.length, 0);
});

test ('fetch_route: projects the route and keeps totals + per-leg fills', async () => {
    const { client } = await connect ();
    stubRouter (200, fixture.routes.multiHop);
    const result = await call (client, 'fetch_route', { 'from': 'DOGE', 'to': 'SOL', 'amountIn': 500, 'exchanges': [ 'mexc', 'binance' ] });
    assert.equal (result.ok, true);
    const data = result.data;
    // the routeId is minted by the server, not taken from the router's requestId
    assert.match (data.routeId, /^[0-9a-f-]{36}$/);
    assert.notEqual (data.routeId, fixture.routes.multiHop.requestId);
    assert.equal (data.requestId, fixture.routes.multiHop.requestId);
    for (const key of [ 'amountIn', 'amountOut', 'effectiveRate', 'referenceRate', 'fillRatio', 'impactBps' ]) {
        assert.ok (data[key] !== undefined, key + ' is kept');
    }
    assert.equal (data.hops.length, 2);
    assert.deepEqual (Object.keys (data.hops[0].legs[0]).sort (), [ 'amount', 'averagePrice', 'effectivePrice', 'exchangeId', 'feeCost' ]);
    assert.equal (data.hops[0].pair, 'DOGE/USDT');
    assert.equal (data.hops[0].venueCount, undefined, 'diagnostics are dropped');
    assert.equal (data.unroutableReason, undefined, 'nulls are dropped');
    assert.ok (Array.isArray (data.warnings));
    // forwarded as query params, and never a balances parameter
    assert.equal (requests.length, 1);
    assert.match (requests[0].url, /\/route\?/);
    assert.match (requests[0].url, /amountIn=500/);
    assert.match (requests[0].url, /exchanges=mexc%2Cbinance|exchanges=mexc,binance/);
    assert.doesNotMatch (requests[0].url, /balances/);
});

test ('fetch_route: includeQuotes returns the per-venue diagnostic, otherwise dropped', async () => {
    const { client } = await connect ();
    const route = fixture.routes.directBuy;
    const withQuotes = { ...route, 'hops': route.hops.map ((hop: any) => ({ ...hop, 'quotes': [ { 'exchangeId': 'okx', 'filledAmount': 1, 'averagePrice': 2, 'bookAgeMs': 5, 'noise': 'x' } ] })) };
    stubRouter (200, withQuotes);
    const without = await call (client, 'fetch_route', { 'from': 'USDT', 'to': 'BTC', 'amountIn': 1000 });
    assert.equal (without.data.hops[0].quotes, undefined);
    const withResult = await call (client, 'fetch_route', { 'from': 'USDT', 'to': 'BTC', 'amountIn': 1000, 'includeQuotes': true });
    assert.deepEqual (withResult.data.hops[0].quotes[0], { 'exchangeId': 'okx', 'filledAmount': 1, 'averagePrice': 2, 'bookAgeMs': 5 });
});

test ('fetch_route: an unroutable pair is a normal result, not an error', async () => {
    const { client } = await connect ();
    stubRouter (404, fixture.routes.unroutable);
    const result = await call (client, 'fetch_route', { 'from': 'LTC', 'to': 'LINK', 'amountIn': 100 });
    assert.equal (result.ok, true);
    assert.equal (result.data.unroutableReason, 'no_market');
    assert.deepEqual (result.data.hops, []);
    assert.match (result.meta.notice, /no route/);
});

test ('fetch_route: 429 maps to RATE_LIMITED with retryAfterSeconds', async () => {
    const { client } = await connect ();
    stubRouter (429, { 'error': 'rate limit exceeded' }, { 'retry-after': '2' });
    const result = await call (client, 'fetch_route', { 'from': 'USDT', 'to': 'BTC', 'amountIn': 1000 });
    assert.equal (result.ok, false);
    assert.equal (result.error.code, 'RATE_LIMITED');
    assert.equal (result.error.retryable, true);
    assert.equal (result.error.retryAfterSeconds, 2);
    assert.match (result.error.hint, /5 requests\/s per IP/);
});

test ('fetch_route: 503 cache_cold is a retryable unavailability', async () => {
    const { client } = await connect ();
    stubRouter (503, { 'error': 'cache_cold' }, { 'retry-after': '3' });
    const result = await call (client, 'fetch_route', { 'from': 'USDT', 'to': 'BTC', 'amountIn': 1000 });
    assert.equal (result.error.code, 'EXCHANGE_UNAVAILABLE');
    assert.equal (result.error.retryable, true);
    assert.equal (result.error.retryAfterSeconds, 3);
});

test ('createRouter sets a ccxt-mcp User-Agent, and degrades when ccxt has no OrderRouter', () => {
    let captured: any;
    class CapturingRouter {
        constructor (config: any) {
            captured = config;
        }
    }
    createRouter ({ 'version': '9.9.9', 'OrderRouter': CapturingRouter }, '1.2.3');
    assert.equal (captured.userAgent, 'ccxt-mcp/1.2.3 (ccxt 9.9.9)');
    assert.equal (routerUserAgent ({ 'version': '4.5.91' }, '0.1.3'), 'ccxt-mcp/0.1.3 (ccxt 4.5.91)');
    assert.equal (createRouter ({ 'version': '1' }, '1'), undefined);
});

// ----- execute_route -----------------------------------------------------------

async function quote (client: Client, route: any): Promise<string> {
    stubRouter (200, route);
    const result = await call (client, 'fetch_route', { 'from': route.from, 'to': route.to, 'amountIn': route.amountIn });
    assert.equal (result.ok, true);
    return result.data.routeId;
}

test ('execute_route: unknown routeId', async () => {
    const { client } = await connect ({ 'acc': TRADING });
    const result = await call (client, 'execute_route', { 'routeId': 'nope' });
    assert.equal (result.error.code, 'ROUTE_NOT_FOUND');
});

test ('execute_route: dry run builds and reports the plan without placing anything', async () => {
    const { client } = await connect ({ 'acc': TRADING });
    const routeId = await quote (client, fakexRoute ());
    const result = await call (client, 'execute_route', { routeId, 'dryRun': true });
    assert.equal (result.ok, true, JSON.stringify (result));
    assert.equal (result.data.dryRun, true);
    assert.equal (result.data.wouldPlaceOrders, 1);
    assert.match (result.meta.notice, /dry run/);
    assert.equal (venues.reduce ((n, venue) => n + venue.createdOrders.length, 0), 0);
});

test ('execute_route: previews, then the confirmed call places guarded IOC orders and journals them', async () => {
    const { client, journalDir } = await connect ({ 'acc': { ...TRADING, 'confirm': 'always' } });
    const routeId = await quote (client, fakexRoute ());
    const preview = await call (client, 'execute_route', { routeId });
    assert.equal (preview.ok, true);
    assert.equal (preview.meta.confirmationRequired, true);
    assert.equal (preview.data.preview.steps.length, 1);
    assert.equal (preview.data.preview.steps[0].account, 'acc');
    assert.ok (preview.data.preview.steps[0].estimatedValueUsd > 0);
    assert.equal (venues.reduce ((n, venue) => n + venue.createdOrders.length, 0), 0, 'the preview places nothing');
    const executed = await call (client, 'execute_route', { routeId, 'confirm': preview.meta.confirmToken });
    assert.equal (executed.ok, true, JSON.stringify (executed));
    assert.equal (executed.data.halted, false);
    assert.equal (executed.data.steps[0].status, 'filled');
    assert.equal (executed.data.steps[0].account, 'acc');
    const orders = venues.flatMap ((venue) => venue.createdOrders);
    assert.equal (orders.length, 1);
    assert.equal (orders[0].type, 'limit');
    assert.equal (orders[0].params.timeInForce, 'IOC');
    // journaled by the server, not only by OrderRouter
    const journal = fs.readdirSync (journalDir).map ((file) => fs.readFileSync (path.join (journalDir, file)).toString ()).join ('');
    assert.match (journal, /"tool":"execute_route".*"event":"intent"|"event":"intent".*"tool":"execute_route"/);
    // a route executes once: a fresh confirmation still cannot re-run it
    const second = await call (client, 'execute_route', { routeId });
    const again = await call (client, 'execute_route', { routeId, 'confirm': second.meta.confirmToken });
    assert.equal (again.ok, false);
    assert.match (again.error.message, /re-execute/);
    // and the agent cannot switch the re-execution guard off — trading again needs a fresh fetch_route
    const override = await call (client, 'execute_route', { routeId, 'options': { 'allowReexecution': true } });
    assert.equal (override.ok, false);
    assert.equal (override.error.code, 'BAD_REQUEST');
    assert.equal (venues.flatMap ((venue) => venue.createdOrders).length, 1);
});

test ('execute_route: the account cap refuses an oversized step before anything is confirmed', async () => {
    const { client } = await connect ({ 'acc': TRADING });
    const routeId = await quote (client, fakexRoute ({}, 0.01)); // ≈ 500 USD > maxOrderValue 100
    const result = await call (client, 'execute_route', { routeId });
    assert.equal (result.ok, false);
    assert.equal (result.error.code, 'ORDER_VALUE_CAP');
    assert.match (result.error.message, /step 0/);
    assert.equal (venues.reduce ((n, venue) => n + venue.createdOrders.length, 0), 0);
});

test ('execute_route: a venue without a trading account is named, with a re-quote hint', async () => {
    const { client } = await connect ({ 'acc': TRADING });
    const route = fakexRoute ();
    route.hops[0].legs.push ({ 'exchangeId': 'mexc', 'amount': 0.001, 'averagePrice': 50000, 'feeCost': 0, 'effectivePrice': 50000 });
    const routeId = await quote (client, route);
    const result = await call (client, 'execute_route', { routeId });
    assert.equal (result.error.code, 'NO_ACCOUNT_FOR_VENUE');
    assert.match (result.error.message, /mexc/);
    assert.match (result.error.hint, /"exchanges": \["fakex"\]/);
});

test ('execute_route: an account without trading is refused by the tier check', async () => {
    const { client } = await connect ({ 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true } });
    const routeId = await quote (client, fakexRoute ());
    const result = await call (client, 'execute_route', { routeId, 'accounts': [ 'acc' ] });
    assert.equal (result.ok, false);
    assert.equal (result.error.code, 'TIER_DISABLED', JSON.stringify (result.error));
});

test ('execute_route: unknown passthrough options are rejected', async () => {
    const { client } = await connect ({ 'acc': TRADING });
    const routeId = await quote (client, fakexRoute ());
    const result = await call (client, 'execute_route', { routeId, 'options': { 'maxNotionalUsd': 1e9 } });
    assert.equal (result.error.code, 'BAD_REQUEST');
});

test ('execute_route: the steps of one route are added up against maxDailyValue before anything runs', async () => {
    // two 50 USD steps: each fits a remaining budget of 80, together they do not
    const { client, journalDir } = await connect ({ 'acc': { ...TRADING, 'maxDailyValue': 80 } });
    const route = fakexRoute ();
    route.to = 'USDT';
    route.hops.push ({
        'pair': 'BTC/USDT', 'side': 'sell', 'base': 'BTC', 'quote': 'USDT', 'amountIn': 0.001, 'amountOut': 50,
        'legs': [ { 'exchangeId': 'fakex', 'amount': 0.001, 'averagePrice': 50000, 'takerFeeRate': 0.001, 'feeCost': 0, 'effectivePrice': 50000 } ],
        'feeCost': 0, 'feeCurrency': 'USDT', 'fullyFillable': true, 'referencePrice': 50000, 'impactBps': 0,
    });
    const routeId = await quote (client, route);
    const result = await call (client, 'execute_route', { routeId });
    assert.equal (result.ok, false, JSON.stringify (result));
    assert.equal (result.error.code, 'DAILY_VALUE_CAP', JSON.stringify (result.error));
    assert.match (result.error.message, /step 1/);
    assert.equal (venues.reduce ((n, venue) => n + venue.createdOrders.length, 0), 0, 'refused before the first order');
    const journal = fs.readdirSync (journalDir).map ((file) => fs.readFileSync (path.join (journalDir, file)).toString ()).join ('');
    assert.match (journal, /"event":"rejected"/);
});

test ('execute_route: prediction-market accounts are never matched to a route venue', async () => {
    const { client } = await connect ({ 'pred': { ...TRADING, 'prediction': true } });
    const routeId = await quote (client, fakexRoute ());
    const auto = await call (client, 'execute_route', { routeId });
    assert.equal (auto.error.code, 'NO_ACCOUNT_FOR_VENUE', JSON.stringify (auto));
    const named = await call (client, 'execute_route', { routeId, 'accounts': [ 'pred' ] });
    assert.equal (named.error.code, 'BAD_REQUEST');
    assert.match (named.error.message, /prediction/);
});
