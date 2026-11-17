import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse as parseYaml, stringify as toYaml } from 'yaml';
import type { SourceConfig } from '../src/types.ts';
import { balancedJson, changeEntries, diffOperations, loadSpec, parseSnapshot, specOperations, type SpecChange } from '../src/adapters/spec.ts';
import { fixture, parse } from './helpers.ts';

const source: SourceConfig = { id: 'binance-openapi', type: 'spec', url: 'https://raw.githubusercontent.com/binance/binance-api-swagger/master/spot_api.yaml' };

function ops (body: string, cfg: SourceConfig = source): string[] {
    const { doc, format } = loadSpec (body, cfg.specFormat);
    return specOperations (doc, format).map ((o) => o.key + (o.params.length ? ` (${o.params.join (', ')})` : '') + (o.deprecated ? ' [deprecated]' : ''));
}

test ('openapi 3 yaml (binance spot, trimmed): operations with query/path params and $ref parameters', () => {
    const lines = ops (fixture ('binance-spot-openapi.yaml'));
    assert.equal (lines.length, 8);
    assert.ok (lines.includes ('GET /api/v3/time'));
    assert.ok (lines.includes ('GET /api/v3/depth (limit, symbol)'));
    assert.ok (lines.includes ('GET /api/v3/ticker/price (symbol, symbols)'));
    assert.match (lines.find ((l) => l.startsWith ('POST /api/v3/order'))!, /\(icebergQty, newClientOrderId, .*timeInForce, timestamp, trailingDelta, type\)$/);
    assert.deepEqual (lines, [ ...lines ].sort (), 'sorted');
});

test ('swagger 2: formData and body schema props (allOf, $ref), header params left out, path-level parameters', () => {
    assert.deepEqual (ops (fixture ('swagger2.json')), [
        'GET /public/symbol/{symbol} (symbol)',
        'POST /order (side, symbol)',
        'PUT /order (clientOrderId, price, quantity)',
    ]);
});

test ('postman v2 collection (hibachi, trimmed): nested folders, query keys, raw JSON body keys', () => {
    assert.deepEqual (ops (fixture ('hibachi-postman.json')), [
        'GET /capital/balance (accountId)',
        'GET /capital/deposit-info (accountId, publicKey)',
        'GET /capital/history (accountId)',
        'GET /trade/account/info (accountId)',
        'POST /capital/transfer (accountId, coin, dstPublicKey, fees, nonce, quantity, signature)',
        'POST /capital/withdraw (accountId, coin, maxFees, network, quantity, signature, withdrawAddress)',
    ]);
});

test ('postman: url objects, :vars, {{host}} prefixes, urlencoded bodies, placeholders in raw JSON', () => {
    const doc = {
        info: { _postman_id: 'x', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
        item: [
            { name: 'a', request: { method: 'get', url: { raw: '{{url}}/api/v1/orders/:id?limit=1', path: [ 'api', 'v1', 'orders', ':id' ], query: [ { key: 'limit' } ], variable: [ { key: 'id' } ] } } },
            { name: 'b', request: { method: 'POST', url: '{{url}}/api/v1/orders', body: { mode: 'raw', raw: '{"symbol": "{{symbol}}", "qty": {{qty}}}' } } },
            { name: 'c', request: { method: 'PUT', url: 'https://api.example.com/api/v1/orders', body: { mode: 'urlencoded', urlencoded: [ { key: 'orderId' } ] } } },
        ],
    };
    assert.deepEqual (ops (JSON.stringify (doc)), [ 'GET /api/v1/orders/{id} (id, limit)', 'POST /api/v1/orders (qty, symbol)', 'PUT /api/v1/orders (orderId)' ]);
});

test ('asyncapi 2 (yaml) and 3 (json): channel names with parameters and message names', () => {
    assert.deepEqual (ops (fixture ('asyncapi-v2.yaml')), [
        'CHANNEL private.orders (orderUpdate, placeOrder)',
        'CHANNEL spot.book (snapshot, update)',
        'CHANNEL spot.trades (symbol, trade)',
    ]);
    assert.deepEqual (ops (fixture ('asyncapi-v3.json')), [
        'CHANNEL heartbeat (ping, pong)',
        'CHANNEL public/tickers/{instrument} (instrument, ticker)',
        'CHANNEL public/trades (trade) [deprecated]',
    ]);
});

test ('redoc page: __redoc_state is extracted (braces inside strings), auto-detected or via specFormat', () => {
    const expected = [ 'DELETE /v1/orders/{id} (id) [deprecated]', 'GET /v1/markets (type)', 'GET /v1/orders/{id} (id)', 'POST /v1/orders (market, side, size)' ];
    assert.deepEqual (ops (fixture ('redoc-page.html')), expected);
    assert.deepEqual (ops (fixture ('redoc-page.html'), { ...source, specFormat: 'redoc' }), expected);
    assert.equal (balancedJson ('x = {"a": "}{", "b": {"c": "\\"}"}}; y', 4), '{"a": "}{", "b": {"c": "\\"}"}}');
});

test ('format errors: plain HTML, unknown documents, no operations', async () => {
    assert.throws (() => loadSpec ('<!DOCTYPE html><html><body>docs</body></html>'), /HTML page, not a spec document/);
    assert.throws (() => loadSpec ('just some text'), /unknown document format/);
    assert.throws (() => loadSpec ('<html><body></body></html>', 'redoc'), /__redoc_state not found/);
    await assert.rejects (async () => parse (source, JSON.stringify ({ openapi: '3.0.0', paths: {} })), /no operations found/);
});

test ('first run: snapshot only; unchanged spec: nothing', async () => {
    const body = fixture ('binance-spot-openapi.yaml');
    const first = await parse (source, body);
    assert.equal (first.entries.length, 0);
    assert.equal (first.snapshot.split ('\n').length, 8);
    assert.match (first.snapshot, /^DELETE \/api\/v3\/openOrders \(recvWindow, signature, symbol, timestamp\)$/m);
    const again = await parse (source, body, first.snapshot + '\n');
    assert.equal (again.entries.length, 0);
    assert.equal (again.snapshot, first.snapshot);
});

test ('changes: added, removed, parameters changed, deprecated (one entry each, tagged)', async () => {
    const body = fixture ('binance-spot-openapi.yaml');
    const first = await parse (source, body);
    const doc = parseYaml (body) as { paths: Record<string, Record<string, { parameters?: unknown[]; deprecated?: boolean }>> };
    doc.paths['/api/v3/avgPrice'] = { get: { parameters: [ { name: 'symbol', in: 'query' } ] } };
    delete doc.paths['/api/v3/openOrders'].delete;
    doc.paths['/api/v3/depth'].get.parameters!.push ({ name: 'type', in: 'query' });
    doc.paths['/api/v3/ticker/price'].get.parameters = [ { name: 'symbol', in: 'query' } ];
    doc.paths['/api/v3/time'].get.deprecated = true;
    const second = await parse (source, toYaml (doc), first.snapshot);
    assert.deepEqual (second.entries.map ((e) => e.title), [
        'Endpoint removed: DELETE /api/v3/openOrders',
        'Endpoint deprecated: GET /api/v3/time',
        'Parameters changed: GET /api/v3/depth (+type)',
        'Parameters changed: GET /api/v3/ticker/price (-symbols)',
        'Endpoint added: GET /api/v3/avgPrice',
    ]);
    assert.deepEqual (second.entries.map ((e) => e.tags), [ [ 'breaking' ], [ 'deprecation' ], [ 'param-change' ], [ 'param-change' ], [ 'new-endpoint' ] ]);
    assert.equal (second.entries[4].body, 'Parameters: symbol');
    assert.equal (second.entries[3].body, 'Removed: symbols');
    assert.ok (second.entries.every ((e) => /^spec:[0-9a-f]{16}:[0-9a-f]{16}$/.test (e.guid!)), 'guids are per run and change');
    assert.equal (new Set (second.entries.map ((e) => e.guid)).size, 5);
});

test ('more than 10 changes in a run: one grouped "N endpoint changes" entry', () => {
    const previous = parseSnapshot ([ 'GET /keep (a)', 'DELETE /gone' ].join ('\n'));
    const current = [ { key: 'GET /keep', params: [ 'a', 'b' ], deprecated: false }, ...Array.from ({ length: 11 }, (_, i) => ({ key: `GET /new/${String (i).padStart (2, '0')}`, params: [], deprecated: false })) ];
    const changes = diffOperations (previous, current);
    assert.equal (changes.length, 13);
    const entries = changeEntries (changes, 'snapshot text');
    assert.equal (entries.length, 1);
    assert.equal (entries[0].title, '13 endpoint changes: 11 added, 1 removed, 1 with parameter changes');
    assert.deepEqual (entries[0].tags, [ 'breaking', 'new-endpoint', 'param-change' ]);
    assert.match (entries[0].body, /^- Endpoint removed: DELETE \/gone\n- Parameters changed: GET \/keep \(\+b\)\n- Endpoint added: GET \/new\/00\n/);
    assert.match (entries[0].guid!, /^spec:[0-9a-f]{16}:all$/);
});

test ('asyncapi changes are channel changes tagged websocket', () => {
    const previous = parseSnapshot ('CHANNEL spot.book (snapshot, update)\nCHANNEL spot.trades (symbol, trade)');
    const changes: SpecChange[] = diffOperations (previous, [ { key: 'CHANNEL spot.book', params: [ 'snapshot' ], deprecated: false }, { key: 'CHANNEL spot.ticker', params: [], deprecated: false } ]);
    assert.deepEqual (changes.map ((c) => [ c.title, c.tags.join (',') ]), [
        [ 'Channel removed: spot.trades', 'breaking,websocket' ],
        [ 'Channel changed: spot.book (-update)', 'param-change,websocket' ],
        [ 'Channel added: spot.ticker', 'new-endpoint,websocket' ],
    ]);
});

test ('spec drift: a document with less than half of the previous operations is a failure', async () => {
    const previous = Array.from ({ length: 20 }, (_, i) => `GET /v1/x${i}`).join ('\n');
    const doc = { openapi: '3.0.0', paths: { '/v1/x0': { get: {} } } };
    await assert.rejects (async () => parse (source, JSON.stringify (doc), previous), /spec drift: 1 operations, the previous snapshot had 20/);
});
