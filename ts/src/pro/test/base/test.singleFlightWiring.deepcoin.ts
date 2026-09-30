import assert from 'assert';
import { AuthenticationError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the single-flight
// authentication logic from https://github.com/ccxt/ccxt/issues/29393 on
// ccxt.pro.deepcoin. the logic is inlined directly into authenticate (), so
// there is no helper method to unit-test: this file is the only guard, and no
// build/lint gate sees it - dropping the in-progress early-return or the flight
// settlement still compiles and only surfaces as duplicate listenKey acquires
// against the live venue. follows the stub shape of test.singleFlightWiring.ts

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function flightCount (exchange: any) {
    // the flight IS the entry in client.futures on a never-dialed client keyed
    // 'authenticationFlights' - see the inlined single-flight block in
    // deepcoin's authenticate (). client.resolve / client.reject drop it, so a
    // settled flight must leave none behind
    const clients = exchange.clients;
    if (!('authenticationFlights' in clients)) {
        return 0;
    }
    return Object.keys (clients['authenticationFlights'].futures).length;
}

function residueCount (exchange: any) {
    // client.reject parks its error in client.rejections whenever no future is
    // live at settle time. the leader mints the future before its first fetch
    // and always holds it, so a parked rejection would poison the next retry
    const clients = exchange.clients;
    if (!('authenticationFlights' in clients)) {
        return 0;
    }
    const client = clients['authenticationFlights'];
    return Object.keys (client.rejections).length;
}

function makeStubbedDeepcoin (state: { acquires: number, extends: number }, expireTime: number) {
    // deepcoin requires apiKey + secret + password, checkRequiredCredentials ()
    // runs before the flight is registered
    const exchange = new ccxt.pro.deepcoin ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
        'password': 'test-password',
    });
    // stub both listenKey endpoints: count fetches, hold each response open
    // long enough for concurrent callers to pile onto the flight.
    // 'expire_time' is seconds - authenticate () runs it through safeTimestamp
    (exchange as any).privateGetDeepcoinListenkeyAcquire = async () => {
        state.acquires = state.acquires + 1;
        await sleep (50); // the race window
        return { 'data': { 'listenkey': 'DEEPCOIN-KEY-' + state.acquires.toString (), 'expire_time': expireTime } };
    };
    (exchange as any).privateGetDeepcoinListenkeyExtend = async () => {
        state.extends = state.extends + 1;
        await sleep (50);
        return { 'data': { 'listenkey': 'DEEPCOIN-EXTENDED-' + state.extends.toString (), 'expire_time': expireTime } };
    };
    return exchange;
}

async function testDeepcoinAuthenticateSingleFlight () {
    // N concurrent authenticate () calls on a cold instance must produce
    // exactly ONE acquire. the key rides the private ws url as
    // '?listenKey=' + listenKey, so racing acquires strand every loser on a
    // stream keyed to an orphaned credential
    const state = { 'acquires': 0, 'extends': 0 };
    const future = Math.floor (Date.now () / 1000) + 3600; // one hour out, seconds
    const exchange = makeStubbedDeepcoin (state, future);
    const keys = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.acquires === 1, 'concurrent deepcoin authenticates must elect exactly one leader (got ' + state.acquires.toString () + ' acquires)');
    assert (state.extends === 0, 'a cold instance has no listenKey to extend');
    // every caller - leader and waiters - must return the leader's key, not
    // undefined: watchPrivate () builds the url straight from this return value
    assert (keys[0] === 'DEEPCOIN-KEY-1' && keys[1] === 'DEEPCOIN-KEY-1' && keys[2] === 'DEEPCOIN-KEY-1' && keys[3] === 'DEEPCOIN-KEY-1', 'every caller must receive the leader listenKey (got ' + JSON.stringify (keys) + ')');
    assert (exchange.options['listenKey'] === 'DEEPCOIN-KEY-1', 'the leader listenKey must be cached');
    assert (exchange.options['listenKeyExpiryTimestamp'] === future * 1000, 'the leader expiry must be cached in milliseconds');
    assert (flightCount (exchange) === 0, 'a settled flight must leave no future behind');
    assert (residueCount (exchange) === 0, 'a settled flight must park nothing in client.rejections');
    // a fresh call inside the validity window is a no-op: no new fetch
    const warm = await exchange.authenticate ();
    assert (state.acquires === 1 && state.extends === 0, 'a warm authenticate inside the validity window must not fetch');
    assert (warm === 'DEEPCOIN-KEY-1', 'a warm authenticate must return the cached listenKey');
}

async function testDeepcoinAuthenticateExpiredSingleFlight () {
    // the expired branch reads the very listenKey the leader rewrites, so the
    // whole check-then-fetch is the critical section: concurrent refreshes must
    // issue exactly ONE extend and must not fall back to the acquire branch
    const state = { 'acquires': 0, 'extends': 0 };
    const future = Math.floor (Date.now () / 1000) + 3600;
    const exchange = makeStubbedDeepcoin (state, future);
    exchange.options['listenKey'] = 'DEEPCOIN-STALE';
    exchange.options['listenKeyExpiryTimestamp'] = Date.now () - 120000; // two minutes past the 60000 gate
    const keys = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.extends === 1, 'concurrent expired deepcoin authenticates must elect exactly one leader (got ' + state.extends.toString () + ' extends)');
    assert (state.acquires === 0, 'the default options method must keep using the extend endpoint');
    assert (keys[0] === 'DEEPCOIN-EXTENDED-1' && keys[1] === 'DEEPCOIN-EXTENDED-1' && keys[2] === 'DEEPCOIN-EXTENDED-1', 'every caller must receive the refreshed listenKey (got ' + JSON.stringify (keys) + ')');
    assert (exchange.options['listenKey'] === 'DEEPCOIN-EXTENDED-1', 'the refreshed listenKey must be cached');
    assert (exchange.options['listenKeyExpiryTimestamp'] === future * 1000, 'the refreshed expiry must be cached in milliseconds');
    assert (flightCount (exchange) === 0, 'a settled flight must leave no future behind');
    assert (residueCount (exchange) === 0, 'a settled flight must park nothing in client.rejections');
}

async function testDeepcoinAuthenticateAcquireOverride () {
    // the options method override must survive the wrap: asking for a brand new
    // key on expiry still routes to the acquire endpoint, under one flight
    const state = { 'acquires': 0, 'extends': 0 };
    const future = Math.floor (Date.now () / 1000) + 3600;
    const exchange = makeStubbedDeepcoin (state, future);
    exchange.options['listenKey'] = 'DEEPCOIN-STALE';
    exchange.options['listenKeyExpiryTimestamp'] = Date.now () - 120000;
    exchange.options['method'] = 'privateGetDeepcoinListenkeyAcquire';
    await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.acquires === 1, 'the acquire override must run exactly once (got ' + state.acquires.toString () + ' acquires)');
    assert (state.extends === 0, 'the acquire override must not hit the extend endpoint');
    assert (exchange.options['listenKey'] === 'DEEPCOIN-KEY-1', 'the acquired listenKey must be cached');
    assert (flightCount (exchange) === 0, 'a settled flight must leave no future behind');
    assert (residueCount (exchange) === 0, 'a settled flight must park nothing in client.rejections');
}

async function testDeepcoinAuthenticateEmptyKeyRejection () {
    // a hollow 200 must reject the flight BEFORE any cache write: the key stays
    // unset, the expiry stays unset, and a retry re-leads - regression guard for
    // the cache-before-confirm class where watchPrivate () dials
    // '?listenKey=undefined' with no retry until the bogus expiry lapses
    const state = { 'acquires': 0, 'extends': 0 };
    const exchange = makeStubbedDeepcoin (state, Math.floor (Date.now () / 1000) + 3600);
    (exchange as any).privateGetDeepcoinListenkeyAcquire = async () => {
        state.acquires = state.acquires + 1;
        await sleep (10);
        return { 'data': {} }; // hollow response, no listenkey
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.acquires === 1, 'concurrent deepcoin authenticates must elect exactly one leader');
    // allSettled keeps input order but leader election does not: assert BOTH
    // entries reject with the typed error, so a waiter that swallows the flight
    // rejection and returns cannot pass silently
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw on an empty listenKey');
    assert ((outcomes[0] as any).reason instanceof AuthenticationError, 'the deepcoin leader must reject with AuthenticationError');
    assert ((outcomes[1] as any).reason instanceof AuthenticationError, 'the deepcoin waiter must observe the same AuthenticationError');
    assert (exchange.safeString (exchange.options, 'listenKey') === undefined, 'an empty listenKey must never be cached');
    assert (exchange.safeInteger (exchange.options, 'listenKeyExpiryTimestamp') === undefined, 'a failed flight must not stamp the expiry');
    assert (flightCount (exchange) === 0, 'a rejected flight must leave no future behind');
    assert (residueCount (exchange) === 0, 'a rejected flight must park nothing in client.rejections');
    // recovery: a good response re-leads and caches
    (exchange as any).privateGetDeepcoinListenkeyAcquire = async () => {
        state.acquires = state.acquires + 1;
        return { 'data': { 'listenkey': 'DEEPCOIN-KEY-RETRY', 'expire_time': Math.floor (Date.now () / 1000) + 3600 } };
    };
    const retried = await exchange.authenticate ();
    assert (retried === 'DEEPCOIN-KEY-RETRY', 'a retry after a rejected flight must return the fresh listenKey');
    assert (exchange.options['listenKey'] === 'DEEPCOIN-KEY-RETRY', 'a retry after a rejected flight must re-lead and cache');
}

async function testDeepcoinAuthenticateSoloLeaderRejection () {
    // an alone leader - the fetch fails before any waiter arrives - must throw
    // to its own caller, clear the slot, and NOT produce an unhandled promise
    // rejection (which would kill the process on the tick below). the leader
    // holds the future it minted and ends on 'await future', which both
    // rethrows and attaches the handler that keeps the rejection handled
    const state = { 'acquires': 0, 'extends': 0 };
    const exchange = makeStubbedDeepcoin (state, Math.floor (Date.now () / 1000) + 3600);
    (exchange as any).privateGetDeepcoinListenkeyAcquire = async () => {
        state.acquires = state.acquires + 1;
        throw new AuthenticationError ('deepcoin solo leader failure');
    };
    let soloError: any = undefined;
    try {
        await exchange.authenticate ();
    } catch (e) {
        soloError = e;
    }
    assert (soloError instanceof AuthenticationError, 'a solo leader must throw its own error');
    // give the microtask queue a tick - an unhandled rejection fires here
    await sleep (20);
    assert (flightCount (exchange) === 0, 'a solo rejected flight must leave no future behind');
    assert (residueCount (exchange) === 0, 'a solo rejected flight must park nothing in client.rejections');
    // the next caller becomes a fresh leader
    (exchange as any).privateGetDeepcoinListenkeyAcquire = async () => {
        state.acquires = state.acquires + 1;
        return { 'data': { 'listenkey': 'DEEPCOIN-KEY-SOLO-RETRY', 'expire_time': Math.floor (Date.now () / 1000) + 3600 } };
    };
    const retried = await exchange.authenticate ();
    assert (retried === 'DEEPCOIN-KEY-SOLO-RETRY', 'the caller after a solo rejection must re-lead');
    assert (exchange.options['listenKey'] === 'DEEPCOIN-KEY-SOLO-RETRY', 'the caller after a solo rejection must cache its own key');
}

async function testDeepcoinAuthenticateMissingCredentials () {
    // checkRequiredCredentials () stays outside the flight: a caller with no
    // credentials throws immediately and must never register a flight that a
    // later, properly configured caller would then wait on forever
    const exchange = new ccxt.pro.deepcoin ({});
    let credentialError: any = undefined;
    try {
        await exchange.authenticate ();
    } catch (e) {
        credentialError = e;
    }
    assert (credentialError instanceof AuthenticationError, 'a missing credential must throw AuthenticationError');
    assert (flightCount (exchange) === 0, 'a missing credential must not register a flight');
    assert (residueCount (exchange) === 0, 'a missing credential must park nothing in client.rejections');
}

async function testWsSingleFlightWiringDeepcoin () {
    await testDeepcoinAuthenticateSingleFlight ();
    await testDeepcoinAuthenticateExpiredSingleFlight ();
    await testDeepcoinAuthenticateAcquireOverride ();
    await testDeepcoinAuthenticateEmptyKeyRejection ();
    await testDeepcoinAuthenticateSoloLeaderRejection ();
    await testDeepcoinAuthenticateMissingCredentials ();
}

export default testWsSingleFlightWiringDeepcoin;
