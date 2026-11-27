import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { z } from 'zod';
import { Client, InMemoryTransport } from '@modelcontextprotocol/client';
import { McpServer } from '@modelcontextprotocol/server';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { createSharedState, buildServer } from '../../ts/factory.js';
import { installRegistrationGuard, FULL_PROFILE, TOOL_ACCESS } from '../../ts/tools/access.js';
import { requestAuthInfo } from '../../ts/tools/common.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

const FULL_ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'funds': true, 'implicitWrites': true } };

function shared () {
    return createSharedState ({
        'config': makeConfig (FULL_ACCOUNT),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-shared-')),
    });
}

const AUTH: AuthInfo = { 'token': 'opaque', 'clientId': 'client-1', 'scopes': [ 'read' ], 'expiresAt': Math.floor (Date.now () / 1000) + 60 };

test ('buildServer: many servers over one shared state share every stateful piece', async () => {
    const state = shared ();
    const a = buildServer (state);
    const b = buildServer (state, { 'hosted': true, 'era': 'modern', 'authInfo': AUTH });
    for (const key of [ 'pools', 'safety', 'journal', 'subscriptions', 'router', 'routes', 'config', 'ccxt' ] as const) {
        assert.equal ((a.ctx as any)[key], (b.ctx as any)[key], key + ' must be shared');
    }
    assert.notEqual (a.server, b.server);
    assert.equal (a.ctx.hosted, false);
    assert.equal (a.ctx.era, 'legacy');
    assert.equal (a.ctx.authInfo, undefined);
    assert.equal (b.ctx.hosted, true);
    assert.equal (b.ctx.era, 'modern');
    assert.equal (b.ctx.authInfo, AUTH);
    // an exchange instance warmed through one server is the one the other server sees
    const first = await a.ctx.pools.getPublic ('fakex');
    const second = await b.ctx.pools.getPublic ('fakex');
    assert.equal (first, second);
    // a confirm token issued under one server redeems under another (one Safety)
    const token = a.ctx.safety.issueConfirmToken ({ 'x': 1 });
    b.ctx.safety.redeemConfirmToken (token, { 'x': 1 });
});

test ('authInfo: tool handlers read the per-request token first, then the server\'s, else undefined', async () => {
    const state = shared ();
    const { ctx } = buildServer (state, { 'authInfo': AUTH });
    // a bare server with the same guard, exposing what requestAuthInfo sees inside a handler
    const probe = new McpServer ({ 'name': 'probe', 'version': '0' });
    installRegistrationGuard (probe, ctx, FULL_PROFILE);
    probe.registerTool ('list_exchanges', { 'description': 'auth probe', 'inputSchema': z.object ({}) }, async () => ({
        'content': [ { 'type': 'text' as const, 'text': JSON.stringify (requestAuthInfo (ctx) ?? null) } ],
    }));
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const perRequest: AuthInfo = { ...AUTH, 'clientId': 'per-request' };
    let inject: AuthInfo | undefined;
    // the InMemoryTransport seam surfaces send ({ authInfo }) as ctx.http.authInfo on the server
    const send = clientTransport.send.bind (clientTransport);
    clientTransport.send = (message: any, options: any = {}) => send (message, (inject === undefined) ? options : { ...options, 'authInfo': inject });
    const client = new Client ({ 'name': 'auth-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), probe.connect (serverTransport) ]);
    const read = async () => JSON.parse (((await client.callTool ({ 'name': 'list_exchanges', 'arguments': {} })) as any).content[0].text);
    assert.equal ((await read ()).clientId, 'client-1', 'falls back to the server-level authInfo');
    inject = perRequest;
    assert.equal ((await read ()).clientId, 'per-request', 'a request-level token wins');
    await client.close ();
    // stdio: no token anywhere
    const local = buildServer (state);
    assert.equal (requestAuthInfo (local.ctx), undefined);
});

test ('buildServer: cheap enough to run per request (full tool set, median of 200 builds)', (t) => {
    const state = shared ();
    buildServer (state); // warm module-level caches
    const samples: number[] = [];
    for (let i = 0; i < 200; i++) {
        const start = process.hrtime.bigint ();
        buildServer (state);
        samples.push (Number (process.hrtime.bigint () - start) / 1e6);
    }
    samples.sort ((x, y) => x - y);
    const median = samples[100];
    const p95 = samples[190];
    t.diagnostic ('buildServer with ' + Object.keys (TOOL_ACCESS).length + ' tools: median ' + median.toFixed (3) + ' ms, p95 ' + p95.toFixed (3) + ' ms');
    // generous bound: this is a regression tripwire, not a benchmark
    assert.ok (median < 50, 'median buildServer took ' + median.toFixed (2) + ' ms');
});
