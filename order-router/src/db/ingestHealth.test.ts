import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import pino from 'pino';
import {
    createHealthState, evaluateHealth, renderMetrics, stalenessBudget, startHealthServer,
} from './ingestHealth.js';

const silent = pino({ level: 'silent' });

test('a loop that has never succeeded goes stale one budget after boot', () => {
    const state = createHealthState(0, true);
    assert.equal(evaluateHealth(state, 1_000, 5_000, 5_000).ok, true);
    const verdict = evaluateHealth(state, stalenessBudget(5_000) + 1, 5_000, 5_000);
    assert.equal(verdict.ok, false);
    assert.deepEqual(verdict.stale, ['ingest', 'key_projection']);
});

test('a stopped projector is reported even while ingest keeps succeeding', () => {
    // The failure this endpoint exists for: the router keeps authenticating from the last snapshot,
    // so a dead projector looks exactly like a quiet one from every other angle.
    const state = createHealthState(0, true);
    const now = 10 * 60_000;
    state.ingestLastSuccessAt = now - 1_000;
    state.projectionLastSuccessAt = now - 5 * 60_000;
    const verdict = evaluateHealth(state, now, 5_000, 5_000);
    assert.equal(verdict.ok, false);
    assert.deepEqual(verdict.stale, ['key_projection']);
});

test('ingest staleness is not evaluated when ingest is disabled', () => {
    // Long past the budget with no ingest pass ever recorded: an ingester that was never started
    // must not page anyone, or the deployment that has no audit log path is permanently red.
    const state = createHealthState(0, false);
    const now = stalenessBudget(5_000) * 10;
    state.projectionLastSuccessAt = now - 1_000;
    assert.deepEqual(evaluateHealth(state, now, 5_000, 5_000).stale, []);
});

test('the metrics text carries the four series an alert needs', () => {
    const state = createHealthState(0, true);
    state.ingestLastSuccessAt = 2_000;
    state.ingestLagBytes = 4_096;
    state.ingestErrors = 3;
    state.projectionRefusals = 1;
    const text = renderMetrics(state);
    assert.match(text, /order_router_ingest_last_success_timestamp_seconds 2\n/);
    assert.match(text, /order_router_ingest_cursor_lag_bytes 4096\n/);
    assert.match(text, /order_router_ingest_errors_total 3\n/);
    assert.match(text, /order_router_key_projection_refusals_total 1\n/);
});

test('/health answers 503 with the stale loop named, and /metrics answers 200', async () => {
    const state = createHealthState(0, true);
    const server = startHealthServer({
        port: 0, state, ingestIntervalMs: 5_000, projectionIntervalMs: 5_000,
        now: () => stalenessBudget(5_000) + 1,
    }, silent);
    await new Promise((r) => server.once('listening', r));
    const port = (server.address() as AddressInfo).port;
    try {
        const health = await fetch(`http://127.0.0.1:${port}/health`);
        assert.equal(health.status, 503);
        const body = await health.json() as { ok: boolean; stale: string[] };
        assert.equal(body.ok, false);
        assert.ok(body.stale.indexOf('key_projection') !== -1);

        const metrics = await fetch(`http://127.0.0.1:${port}/metrics`);
        assert.equal(metrics.status, 200);
        assert.match(await metrics.text(), /order_router_ingest_enabled 1/);
    } finally {
        server.close();
    }
});
