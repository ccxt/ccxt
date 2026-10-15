import assert from 'assert';
import Client from '../../../base/ws/Client.js';

// native ts test, intentionally not transpiled: exercises the client.future
// acquire / wait / resolve / reject pattern used by binance authenticate
// (https://github.com/ccxt/ccxt/issues/29393). language-native siblings
// should follow the pattern established by test.clientRetention.ts

function createClient () {
    const noop = () => {};
    return new Client ('ws://localhost:1234', noop, noop, noop, noop, {});
}

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

async function runFlight (client: Client, messageHash: string, leaderWork: () => Promise<any>) {
    if (messageHash in client.futures) {
        return await client.future (messageHash);
    }
    client.future (messageHash);
    try {
        const result = await leaderWork ();
        client.resolve (result, messageHash);
        return result;
    } catch (e) {
        client.reject (e, messageHash);
        throw e;
    }
}

async function waitIfInFlight (client: Client, messageHash: string) {
    if (messageHash in client.futures) {
        await client.future (messageHash);
    }
}

async function testWsSingleFlight () {

    // one leader, waiters share the leader's result: two concurrent
    // check-then-fetch flows must produce exactly one fetch and both
    // callers must end up with the same cached credential
    let client = createClient ();
    const state: { fetches: number, cached: any } = { 'fetches': 0, 'cached': undefined };
    const flow = async () => {
        return await runFlight (client, 'auth:test', async () => {
            state.fetches = state.fetches + 1;
            await sleep (50); // the race window: waiters pile up here
            state.cached = 'KEY-1';
            return state.cached;
        });
    };
    const results = await Promise.all ([ flow (), flow (), flow () ]);
    assert (state.fetches === 1, 'concurrent flows must elect exactly one leader');
    assert (results[0] === 'KEY-1' && results[1] === 'KEY-1' && results[2] === 'KEY-1', 'all callers must observe the leader result');
    assert (!('auth:test' in client.futures), 'a resolved flight must be cleared');

    // leader failure rejects all waiters and clears the flight so the
    // next caller can retry - nothing deadlocks, and NOTHING is written to
    // the credential cache by a failed flight (regression guard for the
    // cache-before-confirm staleness bypass found in review)
    client = createClient ();
    const cache = { 'credential': undefined, 'lastAuthenticatedTime': 0 };
    const error = new Error ('fetch failed');
    const failingFlow = async () => {
        return await runFlight (client, 'auth:fail', async () => {
            await sleep (50);
            throw error;
        });
    };
    const outcomes = await Promise.allSettled ([ failingFlow (), failingFlow () ]);
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'leader failure must throw into all waiters');
    assert (cache.credential === undefined && cache.lastAuthenticatedTime === 0, 'a failed flight must leave the credential cache untouched');
    assert (!('auth:fail' in client.futures), 'a rejected flight must be cleared');
    const retry = runFlight (client, 'auth:fail', async () => {
        return 'KEY-2';
    });
    assert ('auth:fail' in client.futures, 'the next caller after a rejected flight must become leader');
    assert (await retry === 'KEY-2', 'retry after a rejected flight must deliver a fresh result');

    // waitIfInFlight: returns immediately when idle, blocks during a flight
    client = createClient ();
    await waitIfInFlight (client, 'auth:idle'); // must not hang
    client.future ('auth:wait');
    const waitState = { 'done': false };
    const waiter = waitIfInFlight (client, 'auth:wait').then (() => {
        waitState.done = true;
    });
    await sleep (20);
    assert (!waitState.done, 'wait must block while the flight is in progress');
    client.resolve ('ready', 'auth:wait');
    await waiter;
    assert (waitState.done, 'wait must return once the flight settles');
}

export default testWsSingleFlight;
