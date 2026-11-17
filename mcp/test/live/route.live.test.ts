// Opt-in live test against the public CCXT order router (https://docs.ccxt.com/router/api).
// Not part of `npm test`: run with `CCXT_MCP_LIVE=1 npm run test:live`. Read-only — it quotes
// a route and never places an order.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { ccxt } from '../../ts/ccxt-loader.js';
import { fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';

const live = process.env['CCXT_MCP_LIVE'] === '1';

test ('live: fetch_route USDT -> BTC for 1000 USDT returns a non-empty route', { 'skip': !live && 'set CCXT_MCP_LIVE=1 to run' }, async () => {
    const { server } = createServer ({
        'config': makeConfig ({}),
        'ccxtModule': ccxt,
        'poolsDeps': fakePoolsDeps,
        'version': 'live-test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-live-')),
    });
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'route-live-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    const result: any = await client.callTool ({ 'name': 'fetch_route', 'arguments': { 'from': 'USDT', 'to': 'BTC', 'amountIn': 1000 } });
    const envelope = JSON.parse (result.content[0].text);
    await client.close ();
    assert.equal (envelope.ok, true, JSON.stringify (envelope.error));
    assert.ok (envelope.data.routeId);
    assert.ok (envelope.data.hops.length > 0, 'at least one hop');
    assert.ok (envelope.data.hops[0].legs.length > 0, 'at least one leg');
    assert.ok (envelope.data.amountOut > 0);
    assert.ok (envelope.data.fillRatio > 0);
});
