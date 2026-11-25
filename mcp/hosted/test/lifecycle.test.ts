import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { startHarness, callTool, rpc, waitFor } from './helpers/harness.js';
import { createVenue } from './helpers/venue.js';
import { installSignalHandlers } from '../src/server.js';

// Start-up readiness and SIGTERM drain.

test ('lifecycle: /readyz is 503 until every allowlisted exchange is warm, then 200', async () => {
    const venue = createVenue ([ 'alpha', 'beta' ]);
    venue.control.loadLatencyMs = { 'alpha': 50, 'beta': 400 };
    const harness = await startHarness ({}, { venue, 'warm': false });
    try {
        const early = await fetch (harness.origin + '/readyz');
        assert.equal (early.status, 503);
        const body: any = await early.json ();
        assert.equal (body.ready, false);
        // liveness is independent of readiness
        assert.equal ((await fetch (harness.origin + '/healthz')).status, 200);
        // a tool on a cold exchange says so instead of loading markets for the caller
        await waitFor (() => harness.server.runtime.exchanges.status ().alpha.state === 'warm', 2000);
        const cold = await callTool (harness.url, 'get_tickers', { 'exchange': 'beta', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (cold.envelope.error.code, 'EXCHANGE_WARMING');
        assert.equal (cold.envelope.error.retryable, true);
        await waitFor (() => harness.server.hosted.ready (), 3000);
        const late = await fetch (harness.origin + '/readyz');
        assert.equal (late.status, 200);
        assert.equal ((await callTool (harness.url, 'get_tickers', { 'exchange': 'beta', 'symbols': [ 'BTC/USDT' ] })).envelope.ok, true);
        // each exchange's markets were loaded exactly once, by the server
        assert.deepEqual (venue.control.loads.map ((load) => load.exchange).sort (), [ 'alpha', 'beta' ]);
    } finally {
        await harness.close ();
    }
});

test ('lifecycle: an exchange that cannot load keeps the service unready only until the grace period', async () => {
    const venue = createVenue ([ 'alpha', 'beta' ]);
    venue.control.failLoad.add ('beta');
    const harness = await startHarness ({ 'READY_GRACE_MS': '300' }, { venue, 'warm': false });
    try {
        await waitFor (() => harness.server.runtime.exchanges.status ().beta.state === 'failed', 2000);
        assert.equal ((await fetch (harness.origin + '/readyz')).status, 503);
        await waitFor (() => harness.server.hosted.ready (), 2000);
        const body: any = await (await fetch (harness.origin + '/readyz')).json ();
        assert.equal (body.exchanges.beta.state, 'failed');
        // the load error is reported without URLs or bodies leaking into it beyond a cap
        assert.ok (body.exchanges.beta.error.length <= 240);
        const { envelope } = await callTool (harness.url, 'get_tickers', { 'exchange': 'beta', 'symbols': [ 'BTC/USDT' ] });
        assert.equal (envelope.error.code, 'EXCHANGE_WARMING');
    } finally {
        await harness.close ();
    }
});

test ('lifecycle: SIGTERM drains — in-flight calls complete, new requests are refused, telemetry is flushed, then exit', async () => {
    const harness = await startHarness ({ 'DRAIN_TIMEOUT_MS': '5000' }, { 'shutdownDelayMs': 50 });
    const signals = new EventEmitter ();
    let exitCode: number | undefined;
    installSignalHandlers (signals, harness.server, (code) => {
        exitCode = code;
    }, harness.telemetry);
    harness.venue.control.hold = true;
    const inflight = [ 'BTC/USDT', 'ETH/USDT' ].map ((symbol) => callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ symbol ] }));
    await waitFor (() => harness.server.hosted.inflight () === 2, 2000);
    signals.emit ('SIGTERM');
    await waitFor (() => !harness.server.hosted.ready (), 1000);
    // new MCP requests are refused while draining; readiness reports it
    const refused = await rpc (harness.url, 'tools/list');
    assert.equal (refused.status, 503);
    assert.equal (refused.headers.get ('retry-after'), '5');
    const ready: any = await (await fetch (harness.origin + '/readyz')).json ();
    assert.equal (ready.draining, true);
    assert.equal (exitCode, undefined);
    assert.equal (harness.telemetry.shutdownCalls, 0);
    // the exchange answers: the in-flight calls complete normally
    harness.venue.release ();
    for (const result of await Promise.all (inflight)) {
        assert.equal (result.envelope.ok, true);
    }
    await waitFor (() => exitCode !== undefined, 5000);
    assert.equal (exitCode, 0);
    assert.equal (harness.telemetry.shutdownCalls, 1);
    assert.equal (harness.telemetry.shutdownDone, true, 'exit came only after telemetry.shutdown resolved');
    const drained = harness.telemetry.logs.find ((line) => line.message === 'drained');
    assert.deepEqual (drained?.attributes, { 'drained': true, 'inflight': 0 });
});

test ('lifecycle: a drain that outlasts its deadline still exits (and says so)', async () => {
    const harness = await startHarness ({ 'DRAIN_TIMEOUT_MS': '200', 'REQUEST_DEADLINE_MS': '10000' });
    harness.venue.control.hold = true;
    const stuck = callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] }).catch ((error) => error);
    await waitFor (() => harness.server.hosted.inflight () === 1, 2000);
    const result = await harness.server.stop ('test');
    assert.deepEqual (result, { 'drained': false, 'inflight': 1 });
    assert.equal (harness.telemetry.logs.find ((line) => line.message === 'drained')?.level, 'warn');
    harness.venue.release ();
    await stuck;
});

test ('lifecycle: the background refresh reloads markets on schedule and keeps serving on failure', async () => {
    const venue = createVenue ([ 'alpha' ]);
    const harness = await startHarness ({ 'MARKETS_REFRESH_MINUTES': '0' }, { venue, 'ids': [ 'alpha' ] });
    try {
        // drive one refresh directly (the timer path is the same call)
        const exchanges: any = harness.server.runtime.exchanges;
        venue.control.failLoad.add ('alpha');
        await exchanges.load (exchanges.venues.get ('alpha'), true);
        assert.equal (exchanges.status ().alpha.state, 'warm');
        assert.match (exchanges.status ().alpha.error, /ExchangeNotAvailable/);
        assert.equal ((await callTool (harness.url, 'get_tickers', { 'exchange': 'alpha', 'symbols': [ 'BTC/USDT' ] })).envelope.ok, true);
        venue.control.failLoad.delete ('alpha');
        await exchanges.load (exchanges.venues.get ('alpha'), true);
        assert.equal (exchanges.status ().alpha.error, undefined);
        assert.deepEqual (venue.control.loads.map ((load) => load.reload), [ false, true, true ]);
    } finally {
        await harness.close ();
    }
});

test ('lifecycle: an exchange whose first markets load failed is really refetched by the retry, and becomes warm', async () => {
    const venue = createVenue ([ 'alpha', 'beta' ]);
    venue.control.failLoad.add ('beta');
    const harness = await startHarness ({ 'READY_GRACE_MS': '0' }, { venue, 'warm': false });
    try {
        const exchanges: any = harness.server.runtime.exchanges;
        await waitFor (() => exchanges.status ().beta.state === 'failed', 2000);
        const loadsBefore = venue.control.loads.filter ((load) => load.exchange === 'beta').length;
        venue.control.failLoad.delete ('beta');
        // what the 60 s retry timer runs (a cold load, reload=false)
        await exchanges.load (exchanges.venues.get ('beta'), false);
        assert.equal (venue.control.loads.filter ((load) => load.exchange === 'beta').length, loadsBefore + 1, 'the exchange was asked again');
        assert.equal (exchanges.status ().beta.state, 'warm');
        const ready: any = await (await fetch (harness.origin + '/readyz')).json ();
        assert.equal (ready.exchanges.beta.state, 'warm');
        assert.equal ((await callTool (harness.url, 'get_tickers', { 'exchange': 'beta', 'symbols': [ 'BTC/USDT' ] })).envelope.ok, true);
    } finally {
        await harness.close ();
    }
});
