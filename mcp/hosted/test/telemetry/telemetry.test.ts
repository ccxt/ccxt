import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { deriveSessionIdFromMCPSession } from '@posthog/mcp';
import { createTelemetry, type Telemetry, type TelemetryConfig } from '../../src/telemetry/index.js';
import { startSink, startTestMcp, connectClient, wait, TEST_ROOT_ERROR_PATH, type Sink } from './helpers.js';

// Built at run time so no literal project token ever sits in the repository.
const FAKE_TOKEN = [ 'ph', 'c_', 'offlineTelemetryTestToken0123456789' ].join ('');
const CLIENT_IP = '203.0.113.77';
const TEST_USER_AGENT = 'TelemetryTestAgent/7.1';
const HERE = path.dirname (fileURLToPath (import.meta.url));

interface Harness {
    sink: Sink;
    telemetry: Telemetry;
    lines: string[];
    stop: () => Promise<void>;
}

async function harness (overrides: Partial<TelemetryConfig> = {}): Promise<Harness> {
    const sink = await startSink ();
    const lines: string[] = [];
    const telemetry = await createTelemetry ({
        'token': FAKE_TOKEN,
        'host': sink.url,
        'clientHashSecret': 'offline-test-secret',
        'appRoot': '/home/someone/deploy/ccxt/mcp/hosted',
        'deployment': 'test',
        'serviceVersion': '9.9.9',
        'stdout': (line) => lines.push (line),
        ...overrides,
    });
    return { sink, telemetry, lines, 'stop': async () => {
        await telemetry.shutdown (2000);
        await sink.close ();
    } };
}

// drives one tool call per request id over the given protocol era and returns the events
// grouped by request_id
async function drive (h: Harness, mode: 'legacy' | 'auto', calls: { id: string, name: string, args: any }[]): Promise<Map<string, any[]>> {
    const mcp = await startTestMcp (h.telemetry);
    let current = 'connect-' + mode;
    const client = await connectClient (mcp.url, mode, () => ({ 'x-test-request-id': current, 'x-forwarded-for': CLIENT_IP, 'user-agent': TEST_USER_AGENT }));
    for (const call of calls) {
        current = call.id;
        await client.callTool ({ 'name': call.name, 'arguments': call.args });
    }
    await client.close ();
    await mcp.close ();
    await h.telemetry.shutdown (3000);
    const byRequest = new Map<string, any[]> ();
    for (const event of h.sink.events ()) {
        const id = event.properties?.request_id;
        byRequest.set (id, [ ...(byRequest.get (id) ?? []), event ]);
    }
    return byRequest;
}

const SECRETS = {
    'apiKey': 'LEAKED-APIKEY-4f1e9a',
    'secret': 'LEAKED-SECRET-b7c2d0',
    'privateKey': 'LEAKED-PRIVATEKEY-91aa3e',
    'passphrase': 'LEAKED-PASSPHRASE-5d6e7f',
    'nestedPassword': 'LEAKED-NESTED-PASSWORD-0c0c0c',
    'arrayToken': 'LEAKED-ARRAY-TOKEN-a1a1a1',
    'valueOnly': 'sk-LEAKEDVALUEONLY1234567890',
};

const SECRET_ARGS = {
    'exchange': 'kraken',
    'symbols': [ 'BTC/USD' ],
    'apiKey': SECRETS.apiKey,
    'params': { 'secret': SECRETS.secret, 'deep': { 'privateKey': SECRETS.privateKey, 'more': { 'password': SECRETS.nestedPassword } } },
    'accounts': [ { 'passphrase': SECRETS.passphrase }, [ { 'access_token': SECRETS.arrayToken } ] ],
    'note': SECRETS.valueOnly,
    'context': 'the user wants the BTC price',
};

const CALLS = [
    { 'id': 'call-success', 'name': 'get_tickers', 'args': SECRET_ARGS },
    { 'id': 'call-bad-symbol', 'name': 'get_orderbook', 'args': { 'exchange': 'kraken', 'symbol': 'NOPE/USD' } },
    { 'id': 'call-thrown', 'name': 'get_ohlcv', 'args': { 'exchange': 'kraken', 'symbol': 'BTC/USD' } },
    { 'id': 'call-internal', 'name': 'get_trades', 'args': { 'exchange': 'kraken' } },
    { 'id': 'call-validation', 'name': 'get_orderbook', 'args': { 'exchange': 42, 'symbol': 'BTC/USD' } },
    { 'id': 'call-account', 'name': 'get_balance', 'args': {} },
];

// The full property set of a successful $mcp_tool_call on the legacy (2025-11-25) leg with
// the default options. Pinned so an SDK upgrade that adds or renames a property is
// reviewed (and README.md updated) instead of shipped silently.
const SUCCESS_TOOL_CALL_PROPERTIES = [
    '$geoip_disable', '$is_server', '$lib', '$lib_version',
    '$mcp_client_user_agent', '$mcp_duration_ms', '$mcp_input_keys', '$mcp_intent', '$mcp_intent_source',
    '$mcp_interface', '$mcp_is_error', '$mcp_parameters', '$mcp_protocol_version', '$mcp_resource_name',
    '$mcp_server_name', '$mcp_server_version', '$mcp_session_source', '$mcp_source', '$mcp_tool_description',
    '$mcp_tool_name',
    'auth_state', 'cache', 'client_hash', 'deployment', 'effective_sample_rate', 'exchange', 'request_id', 'response_bytes', 'sample_rate',
].sort ();

test ('events: exact events and properties for success, expected and unexpected errors', async () => {
    const h = await harness ();
    try {
        const byRequest = await drive (h, 'legacy', CALLS);
        const names = (id: string) => (byRequest.get (id) ?? []).map ((event) => event.event);
        // success
        assert.deepEqual (names ('call-success'), [ '$mcp_tool_call' ]);
        const success = byRequest.get ('call-success')![0];
        assert.deepEqual (Object.keys (success.properties).sort (), SUCCESS_TOOL_CALL_PROPERTIES);
        const p = success.properties;
        assert.equal (p['$mcp_tool_name'], 'get_tickers');
        assert.equal (p['$mcp_is_error'], false);
        assert.equal (p['$mcp_intent'], 'the user wants the BTC price');
        assert.equal (p['request_id'], 'call-success');
        assert.match (p['client_hash'], /^[0-9a-f]{16}$/);
        assert.equal (p['auth_state'], 'anonymous');
        assert.equal (p['deployment'], 'test');
        assert.equal (p['sample_rate'], 1);
        assert.equal (p['exchange'], 'kraken');
        assert.equal (p['cache'], 'hit'); // annotated inside the tool, after the request started
        assert.ok (p['response_bytes'] > 5000, 'the size of the dropped response is kept');
        assert.equal (p['$mcp_response'], undefined, 'a successful result is never sent');
        assert.equal (p['$lib'], 'posthog-node-mcp');
        assert.equal (p['$lib_version'], '1.7.0');
        // posthog-node lifts $session_id to the event's session_id on the wire
        assert.equal (success.distinct_id, success.session_id, 'anonymous: the distinct id is the session id');
        assert.equal (success.session_id, deriveSessionIdFromMCPSession ('call-success'), 'one session per request, named after the request id');
        assert.equal (p['$mcp_session_source'], 'transport');
        assert.equal (success.options?.process_person_profile, false, 'no person profiles in phase 1');
        // the injected context argument never reaches the handler
        assert.ok (!JSON.stringify (p['$mcp_parameters']).includes ('the user wants'), 'context is recorded as intent, not as a parameter');
        // an expected tool error: on the call, not in Error Tracking
        assert.deepEqual (names ('call-bad-symbol'), [ '$mcp_tool_call' ]);
        const bad = byRequest.get ('call-bad-symbol')![0].properties;
        assert.equal (bad['$mcp_is_error'], true);
        assert.equal (bad['error_code'], 'BAD_SYMBOL');
        assert.ok (JSON.stringify (bad['$mcp_response']).length <= 1100, 'error preview capped near 1 KB');
        assert.ok (bad['response_bytes'] > 0);
        // validation and ACCOUNT_REQUIRED: expected as well
        assert.deepEqual (names ('call-validation'), [ '$mcp_tool_call' ]);
        assert.equal (byRequest.get ('call-validation')![0].properties['error_code'], 'VALIDATION');
        assert.equal (byRequest.get ('call-validation')![0].properties['$mcp_error_type'], 'validation');
        assert.deepEqual (names ('call-account'), [ '$mcp_tool_call' ]);
        assert.equal (byRequest.get ('call-account')![0].properties['error_code'], 'ACCOUNT_REQUIRED');
        // unexpected failures also produce $exception
        assert.deepEqual (names ('call-internal'), [ '$mcp_tool_call', '$exception' ]);
        assert.equal (byRequest.get ('call-internal')![1].properties['error_code'], 'INTERNAL_ERROR');
        assert.deepEqual (names ('call-thrown'), [ '$mcp_tool_call', '$exception' ]);
        const thrown = byRequest.get ('call-thrown')![1].properties;
        assert.equal (thrown['error_code'], undefined);
        const frames = thrown['$exception_list'][0].stacktrace.frames;
        assert.ok (frames.length > 0);
        for (const frame of frames) {
            assert.ok (!frame.filename.startsWith ('/'), 'no absolute path in a stack frame: ' + frame.filename);
        }
        assert.ok (!JSON.stringify (thrown).includes ('/home/someone'), 'no absolute path anywhere in the exception');
        assert.ok (thrown['$exception_list'][0].value.includes ('boom.ts:12'));
        assert.ok (!JSON.stringify (byRequest.get ('call-thrown')![0]).includes (TEST_ROOT_ERROR_PATH));
        // the connect requests: initialize and tools/list are captured too
        const all = h.sink.events ().map ((event) => event.event);
        assert.ok (all.includes ('$mcp_initialize'));
    } finally {
        await h.stop ();
    }
});

test ('redaction: credential-like arguments never leave the process, nested or in arrays', async () => {
    const h = await harness ();
    try {
        await drive (h, 'legacy', [ CALLS[0] ]);
        await drive ({ ...h, 'telemetry': await createTelemetry ({ 'token': FAKE_TOKEN, 'host': h.sink.url, 'stdout': (line) => h.lines.push (line) }) }, 'auto', [ { ...CALLS[0], 'id': 'modern-success' } ]);
        assert.ok (h.sink.requests.length > 0);
        const everything = h.sink.requests.map ((r) => r.url + '\n' + JSON.stringify (r.headers) + '\n' + r.body + '\n' + r.raw.toString ('latin1')).join ('\n') + '\n' + h.lines.join ('\n');
        for (const [ name, value ] of Object.entries (SECRETS)) {
            assert.ok (!everything.includes (value), name + ' leaked: ' + value);
        }
        const success = h.sink.events ().find ((event) => event.properties?.request_id === 'call-success');
        const args = success.properties['$mcp_parameters'].request.params.arguments;
        assert.equal (args.apiKey, '[redacted]');
        assert.equal (args.params.secret, '[redacted]');
        assert.equal (args.params.deep.privateKey, '[redacted]');
        assert.equal (args.accounts[0].passphrase, '[redacted]');
        assert.equal (args.exchange, 'kraken', 'ordinary arguments stay');
        assert.deepEqual (args.symbols, [ 'BTC/USD' ]);
        assert.ok (h.sink.events ().some ((event) => event.properties?.request_id === 'modern-success'), 'the 2026-07-28 leg is instrumented too');
    } finally {
        await h.stop ();
    }
});

test ('privacy: no raw IP address and no token in any URL, body or log line', async () => {
    const h = await harness ();
    try {
        await drive (h, 'legacy', CALLS);
        const sent = h.sink.requests.map ((r) => r.url + JSON.stringify (r.headers) + r.body).join ('\n');
        assert.ok (!sent.includes (CLIENT_IP), 'the client IP reached PostHog');
        assert.ok (!h.lines.join ('\n').includes (CLIENT_IP), 'the client IP reached stdout');
        for (const request of h.sink.requests) {
            assert.ok (!request.url.includes ('token='), 'token in a URL: ' + request.url);
            if (request.url.startsWith ('/i/v1/')) {
                assert.equal (request.headers['authorization'], 'Bearer ' + FAKE_TOKEN);
            }
        }
        assert.ok (!h.lines.join ('\n').includes (FAKE_TOKEN), 'the token reached stdout');
        // header values stay out of logs (analytics keep the SDK's $mcp_client_user_agent)
        const logged = h.lines.join ('\n') + JSON.stringify (h.sink.logRecords ());
        assert.ok (!logged.includes (TEST_USER_AGENT), 'a header value reached the logs');
        assert.ok (h.sink.events ().some ((event) => event.properties['$mcp_client_user_agent'] === TEST_USER_AGENT));
    } finally {
        await h.stop ();
    }
});

test ('sampling: rate 0 keeps only errors, rate 1 keeps everything, decisions are deterministic', async () => {
    const none = await harness ({ 'sampleRate': 0 });
    try {
        const byRequest = await drive (none, 'legacy', CALLS);
        const kept = none.sink.events ();
        assert.ok (kept.length > 0);
        for (const event of kept) {
            assert.ok (event.event === '$exception' || event.properties['$mcp_is_error'] === true, 'a success event survived rate 0: ' + event.event);
            assert.equal (event.properties['sample_rate'], 0);
            // the rate this event was kept at: errors are never sampled
            assert.equal (event.properties['effective_sample_rate'], 1);
        }
        assert.equal (byRequest.get ('call-success'), undefined);
        assert.deepEqual ((byRequest.get ('call-thrown') ?? []).map ((event) => event.event), [ '$mcp_tool_call', '$exception' ]);
        assert.equal (byRequest.get ('call-bad-symbol')!.length, 1);
    } finally {
        await none.stop ();
    }
    const all = await harness ({ 'sampleRate': 1 });
    try {
        const byRequest = await drive (all, 'legacy', CALLS);
        assert.equal (byRequest.get ('call-success')!.length, 1);
        assert.ok (all.sink.events ().some ((event) => event.event === '$mcp_initialize'));
    } finally {
        await all.stop ();
    }
    // the same request ids at rate 0.5 give the same kept set on every run
    const keptAtHalf = async () => {
        const half = await harness ({ 'sampleRate': 0.5 });
        try {
            const ids = Array.from ({ 'length': 12 }, (_, i) => ({ 'id': 'sample-' + i, 'name': 'get_tickers', 'args': { 'exchange': 'kraken' } }));
            const byRequest = await drive (half, 'legacy', ids);
            return ids.map ((call) => call.id).filter ((id) => byRequest.has (id));
        } finally {
            await half.stop ();
        }
    };
    const first = await keptAtHalf ();
    const second = await keptAtHalf ();
    assert.deepEqual (first, second);
    assert.ok (first.length > 0 && first.length < 12, 'rate 0.5 kept ' + first.length + ' of 12');
});

test ('logs: OTLP shape, correlation with the events, and the same line on stdout', async () => {
    const h = await harness ();
    try {
        await drive (h, 'legacy', CALLS.slice (0, 2));
        const logs = h.sink.requests.filter ((r) => r.url.startsWith ('/i/v1/logs'));
        assert.ok (logs.length > 0, 'logs were flushed on shutdown');
        for (const request of logs) {
            assert.equal (request.url, '/i/v1/logs');
            assert.equal (request.headers['authorization'], 'Bearer ' + FAKE_TOKEN);
            assert.match (String (request.headers['content-type']), /application\/json/);
        }
        const records = h.sink.logRecords ();
        const resource = records[0].resource;
        assert.equal (resource['service.name'], 'ccxt-mcp-hosted');
        assert.equal (resource['service.version'], '9.9.9');
        assert.equal (resource['deployment.environment.name'], 'test');
        const done = records.find ((r) => r.record.body?.stringValue === 'request' && r.attributes['request_id'] === 'call-success');
        assert.ok (done, 'one wide line per request');
        const event = h.sink.events ().find ((e) => e.properties?.request_id === 'call-success');
        assert.equal (done!.attributes['posthogDistinctId'], event.distinct_id, 'logs join the events by distinct id');
        assert.equal (done!.attributes['sessionId'], event.session_id);
        assert.equal (done!.attributes['client_hash'], event.properties['client_hash']);
        assert.equal (done!.attributes['http_status'], 200);
        assert.equal (done!.record.severityText, 'INFO');
        // the tool's own log line: correlated by request id, payload keys dropped
        const toolLine = records.find ((r) => r.record.body?.stringValue === 'tool ran');
        assert.ok (toolLine);
        assert.equal (toolLine!.attributes['request_id'], 'call-success');
        assert.equal (toolLine!.attributes['arguments'], undefined);
        assert.equal (toolLine!.attributes['headers'], undefined);
        assert.equal (toolLine!.attributes['tool'], 'get_tickers');
        // stdout carries the same records as JSON lines
        const stdout = h.lines.map ((line) => JSON.parse (line));
        const stdoutDone = stdout.find ((line) => line.msg === 'request' && line.request_id === 'call-success');
        assert.equal (stdoutDone.level, 'info');
        assert.equal (stdoutDone.posthogDistinctId, event.distinct_id);
        assert.equal (stdoutDone.service, 'ccxt-mcp-hosted');
        assert.ok (!h.lines.some ((line) => line.includes ('LEAKED-')), 'no argument value on stdout');
    } finally {
        await h.stop ();
    }
});

test ('logs: LOG_LEVEL filters stdout and PostHog alike', async () => {
    const h = await harness ({ 'logLevel': 'warn' });
    try {
        h.telemetry.log ('info', 'quiet');
        h.telemetry.log ('debug', 'quieter');
        h.telemetry.log ('warn', 'loud', { 'n': 1 });
        await h.telemetry.shutdown (2000);
        assert.deepEqual (h.lines.map ((line) => JSON.parse (line).msg).filter ((msg) => !msg.startsWith ('posthog')), [ 'loud' ]);
        assert.deepEqual (h.sink.logRecords ().map ((r) => r.record.body.stringValue), [ 'loud' ]);
    } finally {
        await h.stop ();
    }
});

test ('status: the token check sets ok, error or unverified and never blocks start-up', async () => {
    const ok = await harness ();
    try {
        await ok.telemetry.verified ();
        assert.deepEqual (ok.telemetry.status (), { 'analytics': 'ok', 'logs': 'ok' });
        const flags = ok.sink.requests.find ((r) => r.url.startsWith ('/flags'));
        assert.equal (flags!.url, '/flags?v=2');
        assert.equal (flags!.json.api_key, FAKE_TOKEN);
    } finally {
        await ok.stop ();
    }
    const sink = await startSink ();
    sink.flagsStatus = 401;
    const rejected = await createTelemetry ({ 'token': FAKE_TOKEN, 'host': sink.url, 'stdout': () => undefined });
    await rejected.verified ();
    assert.deepEqual (rejected.status (), { 'analytics': 'error', 'logs': 'error' });
    await rejected.shutdown (1000);
    sink.hang = true;
    const started = Date.now ();
    const pending = await createTelemetry ({ 'token': FAKE_TOKEN, 'host': sink.url, 'stdout': () => undefined, 'requestTimeoutMs': 300 });
    assert.ok (Date.now () - started < 200, 'createTelemetry must not wait for PostHog');
    assert.equal (pending.status ().analytics, 'unverified');
    await pending.verified ();
    assert.equal (pending.status ().analytics, 'unverified', 'a timeout proves nothing either way');
    await pending.shutdown (500);
    await sink.close ();
});

test ('status: a personal API key is never sent and turns telemetry off', async () => {
    const calls: string[] = [];
    const lines: string[] = [];
    const telemetry = await createTelemetry ({ 'token': 'phx_' + 'personalKeyNotForCapture', 'stdout': (line) => lines.push (line), 'fetch': (async (url: any) => {
        calls.push (String (url));
        return new Response ('{}');
    }) as any });
    telemetry.log ('info', 'hello');
    await telemetry.verified ();
    await telemetry.shutdown (500);
    assert.deepEqual (calls, []);
    assert.deepEqual (telemetry.status (), { 'analytics': 'error', 'logs': 'error' });
    assert.ok (lines.some ((line) => line.includes ('personal API key')));
});

test ('shutdown: flushes queued events and logs, and a hung PostHog cannot hold it past the deadline', async () => {
    const h = await harness ();
    try {
        h.telemetry.log ('info', 'before shutdown');
        await drive (h, 'legacy', [ CALLS[0] ]); // drive () ends with shutdown (3000)
        assert.ok (h.sink.events ().length > 0, 'events flushed by shutdown (the flush interval is 5 s)');
        assert.ok (h.sink.logRecords ().some ((r) => r.record.body.stringValue === 'before shutdown'));
    } finally {
        await h.stop ();
    }
    const sink = await startSink ();
    sink.hang = true;
    const telemetry = await createTelemetry ({ 'token': FAKE_TOKEN, 'host': sink.url, 'stdout': () => undefined });
    for (let i = 0; i < 20; i++) {
        telemetry.log ('info', 'line ' + i);
    }
    const started = Date.now ();
    await telemetry.shutdown (400);
    const took = Date.now () - started;
    assert.ok (took < 900, 'shutdown took ' + took + ' ms against a 400 ms deadline');
    await sink.close ();
});

test ('shutdown: a process with a hung PostHog exits right after the deadline', async () => {
    const sink = await startSink ();
    sink.hang = true;
    const script = path.join (HERE, 'fixtures', 'exit-after-shutdown.ts');
    const started = Date.now ();
    const code = await new Promise<number | null> ((resolve) => {
        const child = spawn (process.execPath, [ '--import', 'tsx', script ], {
            'env': { ...process.env, 'SINK_URL': sink.url, 'TEST_TOKEN': FAKE_TOKEN },
            'stdio': [ 'ignore', 'ignore', 'inherit' ],
        });
        child.on ('exit', (exitCode) => resolve (exitCode));
    });
    const took = Date.now () - started;
    await sink.close ();
    assert.equal (code, 0);
    // tsx start-up is included; without the abort the open requests hold the process for
    // the 5 s request timeout
    assert.ok (took < 4000, 'the process needed ' + took + ' ms to exit');
});

test ('no token: zero network requests, untouched schemas, stdout-only logs', async () => {
    const calls: string[] = [];
    const originalFetch = globalThis.fetch;
    const lines: string[] = [];
    const telemetry = await createTelemetry ({ 'token': undefined, 'stdout': (line) => lines.push (line), 'fetch': (async (url: any) => {
        calls.push ('injected ' + String (url));
        return new Response ('{}');
    }) as any });
    const mcp = await startTestMcp (telemetry);
    // count every outbound fetch except the test's own calls to the local MCP server
    globalThis.fetch = (async (input: any, init?: any) => {
        const url = String (input?.url ?? input);
        if (!url.startsWith (mcp.url.origin)) {
            calls.push ('global ' + url);
        }
        return originalFetch (input, init);
    }) as any;
    try {
        const client = await connectClient (mcp.url, 'legacy', () => ({}));
        const tools = await client.listTools ();
        for (const tool of tools.tools) {
            assert.equal ((tool.inputSchema as any).properties?.context, undefined, 'no analytics argument without analytics');
        }
        await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'kraken' } });
        await client.close ();
        telemetry.log ('error', 'still logged locally');
        await telemetry.verified ();
        await telemetry.shutdown (500);
        assert.deepEqual (calls, []);
        assert.deepEqual (telemetry.status (), { 'analytics': 'off', 'logs': 'off' });
        assert.ok (lines.some ((line) => JSON.parse (line).msg === 'still logged locally'));
        assert.ok (lines.some ((line) => JSON.parse (line).msg === 'request'));
    } finally {
        globalThis.fetch = originalFetch;
        await mcp.close ();
    }
});

test ('options: defaults inject only `context`, and results keep exactly their own content blocks', async () => {
    const h = await harness ();
    try {
        const mcp = await startTestMcp (h.telemetry);
        const client = await connectClient (mcp.url, 'auto', () => ({}));
        const tools = await client.listTools ();
        for (const tool of tools.tools) {
            const properties = Object.keys ((tool.inputSchema as any).properties ?? {});
            assert.ok (properties.includes ('context'), tool.name + ' lacks context');
            assert.ok (!properties.includes ('llm_model'), 'captureModel is off by default');
            assert.ok (!properties.includes ('conversation_id'), 'conversation ids are off by default');
        }
        const result: any = await client.callTool ({ 'name': 'get_tickers', 'arguments': { 'exchange': 'kraken', 'context': 'x' } });
        assert.equal (result.content.length, 1, 'no appended conversation_id block');
        assert.deepEqual (JSON.parse (result.content[0].text).argKeys, [ 'exchange' ], 'the handler never sees context');
        await client.close ();
        await mcp.close ();
    } finally {
        await h.stop ();
    }
});

test ('client hash: stable within a day, different across days and keys, never the raw key', async () => {
    let clock = Date.parse ('2026-11-25T10:00:00Z');
    const telemetry = await createTelemetry ({ 'clientHashSecret': 's', 'now': () => clock, 'stdout': () => undefined });
    const a = telemetry.hashClient (CLIENT_IP);
    assert.match (a, /^[0-9a-f]{16}$/);
    assert.equal (telemetry.hashClient (CLIENT_IP), a);
    assert.notEqual (telemetry.hashClient ('198.51.100.1'), a);
    clock = Date.parse ('2026-11-26T00:00:01Z');
    assert.notEqual (telemetry.hashClient (CLIENT_IP), a, 'the input rotates daily');
    // runWithRequest fills an empty clientHash
    const seen = await telemetry.runWithRequest ({ 'requestId': 'r', 'clientKey': CLIENT_IP, 'clientHash': '', 'authState': 'anonymous' }, async () => telemetry.currentRequest ());
    assert.equal (seen!.clientHash, telemetry.hashClient (CLIENT_IP));
    assert.equal (telemetry.currentRequest (), undefined);
    await telemetry.shutdown (100);
});
