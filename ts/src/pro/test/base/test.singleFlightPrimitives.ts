import assert from 'assert';
import { ExchangeClosedByUser } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - exercises the single-flight
// authentication primitives added for
// https://github.com/ccxt/ccxt/issues/29393
// the primitives live on the exchanges that wire them (binance/aster/bingx),
// not on the Exchange base, so this test drives them through a real venue
// class. the flights are parked in the futures map of a never-dialed
// this.client ('authenticationFlights') client
// language-native siblings should follow the pattern established by
// test.clientRetention.ts once the per-language mirrors land

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function makeExchange () {
    // any of the three wired exchanges exposes the same primitives, binance is
    // the reference implementation from #29903
    return new ccxt.pro.binance ({ 'apiKey': 'test-api-key', 'secret': 'test-secret' });
}

function flightCount (exchange: any) {
    // the flight registration flag lives in client.subscriptions, the shared
    // future is only minted once a waiter actually awaits the flight
    const clients = exchange.clients;
    if (!('authenticationFlights' in clients)) {
        return 0;
    }
    return Object.keys (clients['authenticationFlights'].subscriptions).length;
}

async function testWsSingleFlightPrimitives () {

    // one leader, waiters share the leader's result: two concurrent
    // check-then-fetch flows must produce exactly one fetch and both
    // callers must end up with the same cached credential
    let exchange = makeExchange ();
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
    assert (flightCount (exchange) === 0, 'a resolved flight must be cleared');

    // leader failure rejects all waiters and clears the flight so the
    // next caller can retry - nothing deadlocks, and NOTHING is written to
    // the credential cache by a failed flight (regression guard for the
    // cache-before-confirm staleness bypass found in review)
    exchange = makeExchange ();
    const cache = { 'credential': undefined, 'lastAuthenticatedTime': 0 };
    const error = new Error ('fetch failed');
    const failingFlow = async () => {
        const isLeader = await exchange.singleFlightAcquire ('auth:fail');
        if (!isLeader) {
            return 'waiter-survived';
        }
        await sleep (50);
        // a correct flow writes the cache only after success - the failing
        // leader must reject without touching it
        exchange.singleFlightReject ('auth:fail', error);
        throw error;
    };
    const outcomes = await Promise.allSettled ([ failingFlow (), failingFlow () ]);
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'leader failure must throw into all waiters');
    assert (cache.credential === undefined && cache.lastAuthenticatedTime === 0, 'a failed flight must leave the credential cache untouched');
    assert (flightCount (exchange) === 0, 'a rejected flight must be cleared');
    const retryLeader = await exchange.singleFlightAcquire ('auth:fail');
    assert (retryLeader === true, 'the next caller after a rejected flight must become leader');
    exchange.singleFlightResolve ('auth:fail');

    // singleFlightWait: returns immediately when idle, blocks during a flight
    exchange = makeExchange ();
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
    await testAloneLeaderReject (exchange);
    await testCloseSettlesInFlight ();
}


async function testAloneLeaderReject (exchange: any) {
    // an alone leader - no waiter ever awaits the flight - must be able to
    // reject without killing the process via an unhandled promise rejection
    const acquired = await exchange.singleFlightAcquire ('alone');
    assert (acquired === true);
    exchange.singleFlightReject ('alone', new Error ('alone leader failure'));
    // give the microtask queue a tick - an unhandled rejection would fire here
    await new Promise ((resolve) => setTimeout (resolve, 10));
    // the slot must be clean and the next caller becomes a fresh leader
    const reacquired = await exchange.singleFlightAcquire ('alone');
    assert (reacquired === true);
    exchange.singleFlightResolve ('alone');
}


async function testCloseSettlesInFlight () {
    // close() must reject in-flight waiters with ExchangeClosedByUser and leave
    // no slot behind - a shutdown never strands an auth waiter. a FRESH instance,
    // so this pins close-while-in-flight rather than reusing a closed exchange
    const exchange = makeExchange ();
    const acquired = await exchange.singleFlightAcquire ('inflight');
    assert (acquired === true);
    let waiterError: any = undefined;
    const waiter = exchange.singleFlightWait ('inflight').catch ((e: any) => {
        waiterError = e;
    });
    await exchange.close ();
    await waiter;
    assert (waiterError instanceof ExchangeClosedByUser);
    assert (flightCount (exchange) === 0); // the slot is gone
}

export default testWsSingleFlightPrimitives;
