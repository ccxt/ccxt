import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Client, InMemoryTransport as ClientInMemoryTransport } from '@modelcontextprotocol/client';
import { InMemoryTransport as ServerInMemoryTransport } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer, createSharedState, buildServer } from '../../ts/factory.js';
import { fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { SharedState } from '../../ts/factory.js';

// The human confirmation for writes must keep its v1 semantics on SDK v2, in both protocol
// eras: accept executes once, decline and cancel do nothing, a client without elicitation
// gets the preview + token flow, and a failed or forged prompt fails closed.

const ACCOUNT = { 'acc': { 'apiKey': 'FAKEKEY123456', 'secret': 'FAKESECRET123456', 'sandbox': true, 'trading': true, 'confirm': 'always' as const, 'maxOrderValue': 100 } };
const ORDER = { 'account': 'acc', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 50000 };

type Answer = { action: 'accept' | 'decline' | 'cancel', content?: Record<string, any> } | 'throw' | undefined;

function sharedState (): SharedState {
    return createSharedState ({
        'config': makeConfig (ACCOUNT),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-confirm-')),
    });
}

function makeClient (answer: Answer, mode: 'legacy' | 'auto', prompts: any[]): Client {
    const capabilities = (answer === undefined) ? {} : { 'elicitation': { 'form': {} } };
    const client = new Client ({ 'name': 'confirm-test', 'version': '0.0.1' }, { capabilities, 'versionNegotiation': { mode } });
    if (answer !== undefined) {
        client.setRequestHandler ('elicitation/create', async (request: any) => {
            prompts.push (request.params);
            if (answer === 'throw') {
                throw new Error ('host could not show the prompt');
            }
            return answer;
        });
    }
    return client;
}

// 2025-era: a bare server.connect () over the initialize handshake (how every v1 host talks)
async function legacyClient (answer: Answer) {
    const shared = sharedState ();
    const { server } = buildServer (shared);
    const prompts: any[] = [];
    const client = makeClient (answer, 'legacy', prompts);
    const [ clientTransport, serverTransport ] = ClientInMemoryTransport.createLinkedPair ();
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    return { client, shared, prompts };
}

// 2026-07-28: the SDK's stdio entry over an in-memory pipe, exactly as server.ts serves it
async function modernClient (answer: Answer, mode: 'legacy' | 'auto' = 'auto') {
    const shared = sharedState ();
    const eras: string[] = [];
    const [ clientTransport, serverTransport ] = ServerInMemoryTransport.createLinkedPair ();
    const handle = serveStdio ((request) => {
        eras.push (request.era);
        return buildServer (shared, { 'era': request.era }).server;
    }, { 'transport': serverTransport });
    const prompts: any[] = [];
    const client = makeClient (answer, mode, prompts);
    await client.connect (clientTransport);
    return { client, shared, prompts, eras, handle };
}

async function placeOrder (client: Client): Promise<any> {
    const result: any = await client.callTool ({ 'name': 'create_order', 'arguments': ORDER });
    return JSON.parse (result.content[0].text);
}

async function createdOrders (shared: SharedState): Promise<number> {
    const { exchange } = await shared.pools.getAuthenticated ('acc');
    return exchange.createdOrders.length;
}

for (const era of [ 'legacy', 'modern' ] as const) {
    const connect = (answer: Answer) => ((era === 'legacy') ? legacyClient (answer) : modernClient (answer));

    test ('confirmation (' + era + '): accept executes the order exactly once', async () => {
        const { client, shared, prompts, ...rest } = await connect ({ 'action': 'accept', 'content': { 'confirm': true } }) as any;
        if (era === 'modern') {
            assert.ok (rest.eras.includes ('modern'), 'the stdio entry must have chosen the 2026-07-28 era: ' + rest.eras.join (','));
            assert.equal (client.getNegotiatedProtocolVersion (), '2026-07-28');
        }
        const result = await placeOrder (client);
        assert.equal (result.ok, true, JSON.stringify (result));
        assert.equal (result.data.status, 'open');
        assert.equal (prompts.length, 1, 'the human is asked exactly once');
        assert.match (prompts[0].message, /^Confirm: order on fakex/);
        assert.deepEqual (prompts[0].requestedSchema.required, [ 'confirm' ]);
        assert.equal (await createdOrders (shared), 1);
        await client.close ();
    });

    test ('confirmation (' + era + '): decline and accept-with-false do nothing and say "declined"', async () => {
        for (const answer of [ { 'action': 'decline' as const }, { 'action': 'accept' as const, 'content': { 'confirm': false } } ]) {
            const { client, shared } = await connect (answer);
            const result = await placeOrder (client);
            assert.equal (result.ok, false);
            assert.equal (result.error.code, 'CONFIRM_DECLINED', JSON.stringify (answer));
            assert.equal (await createdOrders (shared), 0);
            await client.close ();
        }
    });

    test ('confirmation (' + era + '): cancel does nothing and says "canceled"', async () => {
        const { client, shared } = await connect ({ 'action': 'cancel' });
        const result = await placeOrder (client);
        assert.equal (result.ok, false);
        assert.equal (result.error.code, 'CONFIRM_CANCELED');
        assert.equal (await createdOrders (shared), 0);
        await client.close ();
    });

    test ('confirmation (' + era + '): a client without elicitation gets the preview + token flow', async () => {
        const { client, shared } = await connect (undefined);
        const preview = await placeOrder (client);
        assert.equal (preview.ok, true);
        assert.equal (preview.meta.confirmationRequired, true);
        assert.equal (typeof preview.meta.confirmToken, 'string');
        assert.equal (await createdOrders (shared), 0, 'a preview never executes');
        const executed: any = await client.callTool ({ 'name': 'create_order', 'arguments': { ...ORDER, 'confirm': preview.meta.confirmToken } });
        assert.equal (JSON.parse (executed.content[0].text).ok, true);
        assert.equal (await createdOrders (shared), 1);
        await client.close ();
    });
}

test ('confirmation (legacy over the stdio entry): a 2025 client is pinned to the legacy era and confirms in-host', async () => {
    const { client, shared, prompts, eras } = await modernClient ({ 'action': 'accept', 'content': { 'confirm': true } }, 'legacy');
    assert.deepEqual (eras, [ 'legacy' ]);
    assert.notEqual (client.getNegotiatedProtocolVersion (), '2026-07-28');
    const result = await placeOrder (client);
    assert.equal (result.ok, true, JSON.stringify (result));
    assert.equal (prompts.length, 1);
    assert.equal (await createdOrders (shared), 1);
    await client.close ();
});

test ('confirmation (legacy): a prompt the host cannot complete fails closed', async () => {
    const { client, shared } = await legacyClient ('throw');
    const result = await placeOrder (client);
    assert.equal (result.ok, false);
    assert.equal (result.error.code, 'CONFIRM_UNAVAILABLE');
    assert.match (result.error.message, /NOT performed/);
    assert.equal (await createdOrders (shared), 0, 'never downgraded to a model-redeemable token');
    await client.close ();
});

test ('confirmation (legacy): the prompt waits 5 minutes, not the SDK default 60 s', async () => {
    const { CONFIRM_PROMPT_TIMEOUT_MS } = await import ('../../ts/tools/common.js');
    assert.equal (CONFIRM_PROMPT_TIMEOUT_MS, 300000);
});

test ('confirmation (modern): a forged, replayed or mismatched answer fails closed', async () => {
    const { client, shared } = await modernClient ({ 'action': 'accept', 'content': { 'confirm': true } });
    const accepted = { 'confirm': { 'action': 'accept', 'content': { 'confirm': true } } };
    const callRaw = async (args: any, extra: Record<string, any>) => {
        const result: any = await client.request ({ 'method': 'tools/call', 'params': { 'name': 'create_order', 'arguments': args, ...extra } } as any, { 'allowInputRequired': true } as any);
        return result;
    };
    // no requestState at all: the "answer" did not come from a prompt this server issued
    const forged = JSON.parse ((await callRaw (ORDER, { 'inputResponses': accepted })).content[0].text);
    assert.equal (forged.error.code, 'CONFIRM_INVALID');
    const invented = JSON.parse ((await callRaw (ORDER, { 'inputResponses': accepted, 'requestState': 'cs-made-up' })).content[0].text);
    assert.equal (invented.error.code, 'CONFIRM_INVALID');
    // a real prompt, answered for DIFFERENT order parameters
    const first = await callRaw (ORDER, {});
    assert.equal (first.resultType, 'input_required');
    assert.ok (first.inputRequests.confirm, 'the prompt is an embedded elicitation');
    const state = first.requestState;
    const mismatch = JSON.parse ((await callRaw ({ ...ORDER, 'amount': 0.002 }, { 'inputResponses': accepted, 'requestState': state })).content[0].text);
    assert.equal (mismatch.error.code, 'CONFIRM_MISMATCH');
    // the state is single-use: even the matching retry is refused after one redemption
    const replay = JSON.parse ((await callRaw (ORDER, { 'inputResponses': accepted, 'requestState': state })).content[0].text);
    assert.equal (replay.error.code, 'CONFIRM_INVALID');
    assert.equal (await createdOrders (shared), 0);
    await client.close ();
});

test ('confirmation: createServer () (stdio and in-memory tests) serves the 2025 era', async () => {
    const { ctx } = createServer ({
        'config': makeConfig (ACCOUNT),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': fakePoolsDeps,
        'version': 'test',
        'journalDir': fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-confirm-')),
    });
    assert.equal (ctx.era, 'legacy');
    assert.equal (ctx.hosted, false);
    assert.equal (ctx.authInfo, undefined);
});
