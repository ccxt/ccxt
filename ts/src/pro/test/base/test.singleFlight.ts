import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - exercises the base
// single-flight authentication primitives added for
// https://github.com/ccxt/ccxt/issues/29393
// language-native siblings should follow the pattern established by
// test.clientRetention.ts once the per-language base mirrors land

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

async function testWsSingleFlight () {

    // one leader, waiters share the leader's result: two concurrent
    // check-then-fetch flows must produce exactly one fetch and both
    // callers must end up with the same cached credential
    let exchange = new ccxt.Exchange ({ 'id': 'test' });
    const state: { fetches: number, cached: any } = { 'fetches': 0, 'cached': undefined };
    const flow = async () => {
        const isLeader = await exchange.singleFlightAcquire ('auth:test');
        if (!isLeader) {
            return state.cached; // flight settled, re-read the cache
        }
        state.fetches = state.fetches + 1;
        await sleep (50); // the race window: waiters pile up here
        state.cached = 'KEY-1';
        exchange.singleFlightResolve ('auth:test');
        return state.cached;
    };
    const results = await Promise.all ([ flow (), flow (), flow () ]);
    assert (state.fetches === 1, 'concurrent flows must elect exactly one leader');
    assert (results[0] === 'KEY-1' && results[1] === 'KEY-1' && results[2] === 'KEY-1', 'all callers must observe the leader result');
    assert (!('auth:test' in exchange.authenticationFlights), 'a resolved flight must be cleared');

    // leader failure rejects all waiters and clears the flight so the
    // next caller can retry - nothing deadlocks
    exchange = new ccxt.Exchange ({ 'id': 'test' });
    const error = new Error ('fetch failed');
    const failingFlow = async () => {
        const isLeader = await exchange.singleFlightAcquire ('auth:fail');
        if (!isLeader) {
            return 'waiter-survived';
        }
        await sleep (50);
        exchange.singleFlightReject ('auth:fail', error);
        throw error;
    };
    const outcomes = await Promise.allSettled ([ failingFlow (), failingFlow () ]);
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'leader failure must throw into all waiters');
    assert (!('auth:fail' in exchange.authenticationFlights), 'a rejected flight must be cleared');
    const retryLeader = await exchange.singleFlightAcquire ('auth:fail');
    assert (retryLeader === true, 'the next caller after a rejected flight must become leader');
    exchange.singleFlightResolve ('auth:fail');

    // singleFlightWait: returns immediately when idle, blocks during a flight
    exchange = new ccxt.Exchange ({ 'id': 'test' });
    await exchange.singleFlightWait ('auth:idle'); // must not hang
    const gotLead = await exchange.singleFlightAcquire ('auth:wait');
    assert (gotLead === true, 'first acquire must lead');
    const waitState = { 'done': false };
    const waiter = exchange.singleFlightWait ('auth:wait').then (() => {
        waitState.done = true;
    });
    await sleep (20);
    assert (!waitState.done, 'wait must block while the flight is in progress');
    exchange.singleFlightResolve ('auth:wait');
    await waiter;
    assert (waitState.done, 'wait must return once the flight settles');

    await exchange.close ();
}

export default testWsSingleFlight;
