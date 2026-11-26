// Opt-in live tests for the result budget, pagination and shaping against real public
// endpoints — no API keys needed. Not part of `npm test`: run with
// `CCXT_MCP_LIVE=1 npm run test:live`. Read-only: market data only, never an order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { ccxt, exchangeClass, isKnownExchange, allExchangeIds, closestMatches } from '../../ts/ccxt-loader.js';
import { estimateTokens, MAX_RESULT_TOKENS } from '../../ts/format.js';
import { makeConfig } from '../helpers/fake-ccxt.js';

const live = process.env['CCXT_MCP_LIVE'] === '1';
const skip = !live && 'set CCXT_MCP_LIVE=1 to run';
// venues with large public market lists; override with CCXT_MCP_LIVE_EXCHANGES=okx,gate
const EXCHANGES = (process.env['CCXT_MCP_LIVE_EXCHANGES'] ?? 'okx,gate,bybit,binance').split (',');

async function connect (): Promise<Client> {
    const { server } = createServer ({
        'config': makeConfig ({}),
        'ccxtModule': ccxt,
        // the real exchange classes, as in ts/server.ts
        'poolsDeps': { exchangeClass, isKnownExchange, allExchangeIds, closestMatches },
        'version': 'live-test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-live-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'market-live-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return client;
}

// call a tool and assert the raw text fits the token budget before parsing it
async function call (client: Client, name: string, args: any): Promise<any> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    const text = result.content[0].text;
    assert.ok (estimateTokens (text) <= MAX_RESULT_TOKENS, name + ' result is ' + estimateTokens (text) + ' est. tokens, over the ' + MAX_RESULT_TOKENS + ' budget');
    return JSON.parse (text);
}

// a venue that is geo-blocked or down from the test machine is reported, not failed
function unreachable (envelope: any): boolean {
    return envelope.ok === false && [ 'EXCHANGE_UNAVAILABLE', 'RATE_LIMITED', 'TIMEOUT' ].includes (envelope.error?.code);
}

for (const exchange of EXCHANGES) {
    test ('live: ' + exchange + ' search_markets fits one response at the cap and offset walks every match', { skip }, async (t) => {
        const client = await connect ();
        try {
            const first = await call (client, 'search_markets', { exchange, 'quote': 'USDT', 'limit': 200 });
            if (unreachable (first)) {
                t.skip (exchange + ' unreachable: ' + first.error.code);
                return;
            }
            assert.equal (first.ok, true, JSON.stringify (first.error));
            assert.equal (first.meta.paginated, undefined, 'a capped search_markets page never needs next_page');
            assert.ok (first.data.length <= 100, 'limit 200 is clamped to 100');
            assert.equal (first.meta.returned, first.data.length);
            assert.ok (first.meta.available >= first.data.length);
            const seen = new Set (first.data.map ((market: any) => market.symbol));
            let offset = first.data.length;
            while (offset < first.meta.available) {
                const page = await call (client, 'search_markets', { exchange, 'quote': 'USDT', 'limit': 100, offset });
                assert.equal (page.ok, true);
                assert.equal (page.meta.paginated, undefined);
                assert.ok (page.data.length > 0);
                for (const market of page.data) {
                    seen.add (market.symbol);
                }
                offset += page.data.length;
            }
            assert.equal (seen.size, first.meta.available, 'offset paging returns every match exactly once');
        } finally {
            await client.close ();
        }
    });
}

test ('live: okx fetchFundingRates over every swap is paged through next_page with nothing lost', { skip }, async (t) => {
    const client = await connect ();
    try {
        const first = await call (client, 'call_read_method', { 'exchange': 'okx', 'method': 'fetchFundingRates', 'marketType': 'swap' });
        if (unreachable (first)) {
            t.skip ('okx unreachable: ' + first.error.code);
            return;
        }
        assert.equal (first.ok, true, JSON.stringify (first.error));
        assert.equal (first.meta.paginated, true, 'hundreds of swaps exceed one response');
        assert.ok (first.meta.page.total > 100);
        const merged: Record<string, any> = { ...first.data };
        let page = first;
        while (page.meta.page.hasMore) {
            page = await call (client, 'next_page', { 'cursor': page.meta.page.nextCursor });
            assert.equal (page.ok, true);
            assert.equal (page.meta.method, 'fetchFundingRates', 'the tool meta rides along on every page');
            Object.assign (merged, page.data);
        }
        assert.equal (Object.keys (merged).length, first.meta.page.total);
        const again = await call (client, 'next_page', { 'cursor': first.meta.page.nextCursor });
        assert.equal (again.error.code, 'CURSOR_EXPIRED', 'a fully read snapshot is freed');
    } finally {
        await client.close ();
    }
});

test ('live: okx fetchFundingRates shaped server-side comes back as one small sorted slice', { skip }, async (t) => {
    const client = await connect ();
    try {
        const top = await call (client, 'call_read_method', { 'exchange': 'okx', 'method': 'fetchFundingRates', 'marketType': 'swap', 'sortBy': '-fundingRate', 'limit': 20, 'fields': [ 'fundingRate', 'fundingDatetime', 'interval' ] });
        if (unreachable (top)) {
            t.skip ('okx unreachable: ' + top.error.code);
            return;
        }
        assert.equal (top.ok, true, JSON.stringify (top.error));
        assert.equal (top.meta.paginated, undefined);
        assert.equal (Object.keys (top.data).length, 20);
        assert.ok (top.meta.matched > 20);
        const rates = Object.values (top.data).map ((entry: any) => Number (entry.fundingRate));
        assert.deepEqual (rates, [ ...rates ].sort ((a, b) => b - a), 'sorted descending');
        assert.ok (top.meta.notice.includes ('"offset": 20'));
    } finally {
        await client.close ();
    }
});

test ('live: bybit raw tickers nest their list two levels down and are paged, not skipped', { skip }, async (t) => {
    const client = await connect ();
    try {
        // {"retCode": 0, "result": {"category": "linear", "list": [...]}}
        const first = await call (client, 'call_implicit_get', { 'exchange': 'bybit', 'method': 'publicGetV5MarketTickers', 'params': { 'category': 'linear' } });
        if (unreachable (first)) {
            t.skip ('bybit unreachable: ' + first.error.code);
            return;
        }
        assert.equal (first.ok, true, JSON.stringify (first.error));
        assert.equal (first.meta.paginated, true);
        assert.equal (first.meta.page.pagedField, 'data.result.list');
        let count = first.data.result.list.length;
        let page = first;
        while (page.meta.page.hasMore) {
            page = await call (client, 'next_page', { 'cursor': page.meta.page.nextCursor });
            assert.equal (page.ok, true);
            assert.equal (page.meta.page.skipped, undefined, 'no entry is skipped');
            assert.equal (page.data.result.category, 'linear', 'the surrounding fields are kept');
            count += page.data.result.list.length;
        }
        assert.equal (count, first.meta.page.total);
    } finally {
        await client.close ();
    }
});
