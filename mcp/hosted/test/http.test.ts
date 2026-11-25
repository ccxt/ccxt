import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startHarness, rpc, callTool, type Harness } from './helpers/harness.js';

// Raw HTTP behaviour of the hosted endpoint: methods, Host validation, body and shape
// limits, the reserved well-known paths, headers, and argument hardening as a client that
// is not an SDK would meet it.

let harness: Harness;

before (async () => {
    harness = await startHarness ({ 'OPENAI_APPS_CHALLENGE': 'challenge-token-123' });
});

after (async () => {
    await harness.close ();
});

// fetch cannot set Host; node:http can
function rawRequest (options: { method: string, path: string, headers?: Record<string, string>, body?: string }): Promise<{ status: number, headers: http.IncomingHttpHeaders, text: string }> {
    const url = new URL (harness.origin);
    return new Promise ((resolve, reject) => {
        const request = http.request ({ 'host': url.hostname, 'port': url.port, 'method': options.method, 'path': options.path, 'headers': options.headers }, (response) => {
            const chunks: Buffer[] = [];
            response.on ('data', (chunk) => chunks.push (chunk));
            response.on ('end', () => resolve ({ 'status': response.statusCode ?? 0, 'headers': response.headers, 'text': Buffer.concat (chunks).toString () }));
        });
        request.on ('error', reject);
        if (options.body !== undefined) {
            request.write (options.body);
        }
        request.end ();
    });
}

test ('http: GET and DELETE on the MCP path answer 405 with Allow: POST', async () => {
    for (const method of [ 'GET', 'DELETE' ]) {
        const response = await fetch (harness.url, { method });
        assert.equal (response.status, 405, method);
        assert.equal (response.headers.get ('allow'), 'POST');
    }
});

test ('http: a Host outside the allowlist gets 403; the public name and localhost pass', async () => {
    const body = JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list' });
    const headers = { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream' };
    const evil = await rawRequest ({ 'method': 'POST', 'path': '/mcp', 'headers': { ...headers, 'host': 'evil.example' }, body });
    assert.equal (evil.status, 403);
    for (const host of [ 'docs.ccxt.com', 'localhost:8080', '127.0.0.1' ]) {
        const ok = await rawRequest ({ 'method': 'POST', 'path': '/mcp', 'headers': { ...headers, host }, body });
        assert.equal (ok.status, 200, host);
    }
});

test ('http: a JSON-RPC batch is rejected before any tool runs', async () => {
    const before = harness.venue.control.calls.length;
    const call = (id: number) => ({ 'jsonrpc': '2.0', id, 'method': 'tools/call', 'params': { 'name': 'get_tickers', 'arguments': { 'exchange': 'alpha', 'symbols': [ 'ETH/USDT' ] } } });
    const response = await fetch (harness.url, { 'method': 'POST', 'headers': { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream' }, 'body': JSON.stringify ([ call (1), call (2) ]) });
    assert.equal (response.status, 400);
    const body: any = await response.json ();
    assert.equal (body.error.code, -32600);
    assert.match (body.error.message, /batch/);
    assert.equal (harness.venue.control.calls.length, before);
});

test ('http: a 300 KB body gets 413; a body just under the cap is parsed', async () => {
    const big = JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list', 'params': { 'pad': 'x'.repeat (300 * 1024) } });
    const response = await fetch (harness.url, { 'method': 'POST', 'headers': { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream' }, 'body': big });
    assert.equal (response.status, 413);
    const fits = JSON.stringify ({ 'jsonrpc': '2.0', 'id': 1, 'method': 'tools/list', 'params': { '_meta': { 'pad': 'x'.repeat (200 * 1024) } } });
    const ok = await fetch (harness.url, { 'method': 'POST', 'headers': { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream' }, 'body': fits });
    assert.equal (ok.status, 200);
});

test ('http: deeply nested JSON is rejected', async () => {
    let nested: any = 1;
    for (let i = 0; i < 40; i++) {
        nested = { 'a': nested };
    }
    const response = await rpc (harness.url, 'tools/call', { 'name': 'get_tickers', 'arguments': { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ], 'x': nested } });
    assert.equal (response.status, 400);
    assert.match (response.body.error.message, /nested deeper than 32/);
    // 100k levels of brackets (well under 256 KB) do not crash the parser or the check
    const brackets = '['.repeat (100000) + ']'.repeat (100000);
    const deep = await fetch (harness.url, { 'method': 'POST', 'headers': { 'content-type': 'application/json', 'accept': 'application/json, text/event-stream' }, 'body': '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"x":' + brackets + '}}' });
    assert.equal (deep.status, 400);
});

test ('http: a non-JSON body is refused with 415', async () => {
    const response = await fetch (harness.url, { 'method': 'POST', 'headers': { 'content-type': 'text/plain', 'accept': 'application/json, text/event-stream' }, 'body': 'hello' });
    assert.equal (response.status, 415);
});

test ('http: marketType path traversal is rejected by the schema and never reaches an exchange', async () => {
    const before = harness.venue.control.calls.length;
    const { result } = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ], 'marketType': '../../../../tmp/x' });
    assert.equal (result.isError, true);
    assert.match (result.content[0].text, /marketType|Invalid/i);
    assert.equal (harness.venue.control.calls.length, before);
});

test ('http: "params" is not accepted at all, and a credential inside it is refused without echoing the value', async () => {
    const before = harness.venue.control.calls.length;
    const plain = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ], 'params': { 'until': 1 } });
    assert.equal (plain.result.isError, true);
    assert.match (plain.result.content[0].text, /params/);
    const secret = await callTool (harness.url, 'get_ohlcv', { 'exchange': 'alpha', 'symbol': 'BTC/USDT', 'params': { 'apiKey': 'SUPERSECRETVALUE' } });
    assert.equal (secret.result.isError, true);
    assert.ok (!secret.result.content[0].text.includes ('SUPERSECRETVALUE'));
    // a credential-like key at the top level hits the credential guard first
    const top = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ], 'apiKey': 'SUPERSECRETVALUE' });
    assert.equal (top.result.isError, true);
    assert.ok (!JSON.stringify (top.result).includes ('SUPERSECRETVALUE'));
    assert.equal (harness.venue.control.calls.length, before);
});

test ('http: every response carries the request id and the security headers; an incoming id is ignored without a trusted proxy', async () => {
    const generated = await rpc (harness.url, 'tools/list');
    assert.match (generated.headers.get ('x-request-id') ?? '', /^[0-9a-f-]{36}$/);
    assert.equal (generated.headers.get ('x-content-type-options'), 'nosniff');
    assert.match (generated.headers.get ('cache-control') ?? '', /no-store/);
    // TRUSTED_PROXY=none: the client's id would become the analytics session, so it is replaced
    const ignored = await rpc (harness.url, 'tools/list', {}, { 'x-request-id': 'client-1234567890abcdef' });
    assert.match (ignored.headers.get ('x-request-id') ?? '', /^[0-9a-f-]{36}$/);
    const health = await fetch (harness.origin + '/healthz');
    assert.equal (health.headers.get ('x-content-type-options'), 'nosniff');
});

test ('http: behind a trusted proxy on a private peer, the proxy\'s sane request id is echoed', async () => {
    const proxied = await startHarness ({ 'TRUSTED_PROXY': 'nginx-x-real-ip' });
    try {
        const echoed = await rpc (proxied.url, 'tools/list', {}, { 'x-request-id': 'nginx-1234567890abcdef' });
        assert.equal (echoed.headers.get ('x-request-id'), 'nginx-1234567890abcdef');
        const junk = await rpc (proxied.url, 'tools/list', {}, { 'x-request-id': 'bad id with spaces' });
        assert.notEqual (junk.headers.get ('x-request-id'), 'bad id with spaces');
    } finally {
        await proxied.close ();
    }
});

test ('http: no CORS by default — no Access-Control headers, preflight refused', async () => {
    const response = await rpc (harness.url, 'tools/list', {}, { 'origin': 'https://claude.ai' });
    // an Origin is accepted (hosts' backends send one) but not granted browser read access
    assert.equal (response.status, 200);
    assert.equal (response.headers.get ('access-control-allow-origin'), null);
    const preflight = await fetch (harness.url, { 'method': 'OPTIONS', 'headers': { 'origin': 'https://inspector.example', 'access-control-request-method': 'POST' } });
    assert.equal (preflight.status, 405);
    assert.equal (preflight.headers.get ('access-control-allow-origin'), null);
});

test ('http: CORS_ALLOWED_ORIGINS grants exactly the named origins', async () => {
    const cors = await startHarness ({ 'CORS_ALLOWED_ORIGINS': 'https://inspector.example' });
    try {
        const preflight = await fetch (cors.url, { 'method': 'OPTIONS', 'headers': { 'origin': 'https://inspector.example', 'access-control-request-method': 'POST' } });
        assert.equal (preflight.status, 204);
        assert.equal (preflight.headers.get ('access-control-allow-origin'), 'https://inspector.example');
        assert.match (preflight.headers.get ('access-control-allow-headers') ?? '', /mcp-protocol-version/);
        const other = await rpc (cors.url, 'tools/list', {}, { 'origin': 'https://other.example' });
        assert.equal (other.headers.get ('access-control-allow-origin'), null);
    } finally {
        await cors.close ();
    }
});

test ('http: /healthz is live, /readyz reports every exchange', async () => {
    const health: any = await (await fetch (harness.origin + '/healthz')).json ();
    assert.equal (health.ok, true);
    const ready = await fetch (harness.origin + '/readyz');
    assert.equal (ready.status, 200);
    const body: any = await ready.json ();
    assert.equal (body.ready, true);
    assert.deepEqual (Object.keys (body.exchanges).sort (), [ 'alpha', 'beta' ]);
    assert.equal (body.exchanges.alpha.state, 'warm');
});

test ('http: the OpenAI challenge is served as plain text; the OAuth metadata paths are reserved (404)', async () => {
    const challenge = await fetch (harness.origin + '/.well-known/openai-apps-challenge');
    assert.equal (challenge.status, 200);
    assert.match (challenge.headers.get ('content-type') ?? '', /^text\/plain/);
    assert.equal (await challenge.text (), 'challenge-token-123');
    for (const path of [ '/.well-known/oauth-protected-resource/mcp', '/.well-known/oauth-protected-resource', '/.well-known/oauth-authorization-server' ]) {
        const response = await fetch (harness.origin + path);
        assert.equal (response.status, 404, path);
    }
    const without = await startHarness ();
    try {
        assert.equal ((await fetch (without.origin + '/.well-known/openai-apps-challenge')).status, 404);
    } finally {
        await without.close ();
    }
});

test ('http: an Authorization header is ignored in phase 1 (anonymous, never a 401)', async () => {
    const { status, envelope } = await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }, { 'authorization': 'Bearer whatever' });
    assert.equal (status, 200);
    assert.equal (envelope.ok, true);
    assert.equal (harness.telemetry.infos.at (-1)?.authState, 'anonymous');
});

test ('http: upstream error messages are sanitised (no URLs, no bodies)', async () => {
    harness.venue.control.failWith = (exchange, method) => ((exchange === 'beta' && method === 'fetchTrades') ? new Error ('beta GET https://api.beta.example/trades?x=1 500 Internal <html><body>stack</body></html>') : undefined);
    try {
        const { envelope } = await callTool (harness.url, 'get_trades', { 'exchange': 'beta', 'symbol': 'BTC/USDT' });
        assert.equal (envelope.ok, false);
        assert.ok (!envelope.error.message.includes ('https://'), envelope.error.message);
        assert.ok (!envelope.error.message.includes ('<html>'), envelope.error.message);
    } finally {
        harness.venue.control.failWith = undefined;
    }
});

test ('http: the request summary carries method, tool, exchange, outcome, cache and era', async () => {
    await callTool (harness.url, 'get_orderbook', { 'exchange': 'beta', 'symbol': 'ETH/USDT' });
    const summary = harness.telemetry.summaries.at (-1)!;
    assert.equal (summary.mcpMethod, 'tools/call');
    assert.equal (summary.toolName, 'get_orderbook');
    assert.equal (summary.exchange, 'beta');
    assert.equal (summary.ok, true);
    assert.equal (summary.status, 200);
    assert.equal (summary.protocolEra, 'legacy');
    assert.ok ([ 'miss', 'hit' ].includes (String (summary.cache)));
    const stub = await callTool (harness.url, 'get_balance', { 'account': 'x' });
    assert.equal (stub.envelope.error.code, 'ACCOUNT_REQUIRED');
    assert.equal (harness.telemetry.summaries.at (-1)!.errorCode, 'ACCOUNT_REQUIRED');
    assert.equal (harness.telemetry.summaries.at (-1)!.ok, false);
});
