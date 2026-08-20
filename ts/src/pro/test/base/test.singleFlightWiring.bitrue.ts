import assert from 'assert';
import { AuthenticationError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the single-flight
// authentication logic from https://github.com/ccxt/ccxt/issues/29393 on
// bitrue. the logic is inlined directly into authenticate (), so there is no
// helper method to unit-test: this file is the only guard, and no build/lint
// gate sees it - dropping the in-progress early-return or the flight
// settlement still compiles and only surfaces as duplicate listenKey fetches
// against the live venue, where the losing callers dial
// 'wss://wsapi.bitrue.com/stream?listenKey=' + an orphaned key

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function flightCount (exchange: any) {
    // the flights live on a never-dialed client keyed 'authenticationFlights',
    // registered in its subscriptions map - see the inlined single-flight
    // block in authenticate () on bitrue
    const clients = exchange.clients;
    if (!('authenticationFlights' in clients)) {
        return 0;
    }
    return Object.keys (clients['authenticationFlights'].subscriptions).length;
}

function futureCount (exchange: any) {
    // the shared future is minted lazily by the first waiter - a settled
    // flight must leave none behind
    const clients = exchange.clients;
    if (!('authenticationFlights' in clients)) {
        return 0;
    }
    return Object.keys (clients['authenticationFlights'].futures).length;
}

function makeStubbedBitrue (state: { fetches: number }) {
    const exchange = new ccxt.pro.bitrue ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    // stub the listenKey endpoint: count fetches, hold the response open long
    // enough for concurrent callers to pile onto the flight
    (exchange as any).openV1PrivatePostPoseidonApiV1ListenKey = async () => {
        state.fetches = state.fetches + 1;
        await sleep (50); // the race window
        return { 'msg': 'succ', 'code': 200, 'data': { 'listenKey': 'BITRUE-KEY-' + state.fetches.toString () } };
    };
    // neutralize the keepalive scheduler - the test must not leave timers behind
    (exchange as any).delay = () => {};
    return exchange;
}

async function testBitrueAuthenticateSingleFlight () {
    // N concurrent authenticate () calls on a cold instance must produce
    // exactly ONE fetch, and every caller must receive the SAME stream url -
    // the #29393 symptom on bitrue is that losers get a url keyed to an
    // orphaned listenKey and their subscriptions silently never deliver
    const state = { 'fetches': 0 };
    const exchange = makeStubbedBitrue (state);
    const urls = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.fetches === 1, 'concurrent bitrue authenticates must elect exactly one leader (got ' + state.fetches.toString () + ' fetches)');
    assert (exchange.options['listenKey'] === 'BITRUE-KEY-1', 'the leader listenKey must be cached');
    assert (exchange.options['listenKeyUrl'] === 'wss://wsapi.bitrue.com/stream?listenKey=BITRUE-KEY-1', 'the leader listenKeyUrl must be cached');
    for (let i = 0; i < urls.length; i++) {
        assert (urls[i] === 'wss://wsapi.bitrue.com/stream?listenKey=BITRUE-KEY-1', 'every caller must return the single leader stream url, not an orphaned one (caller ' + i.toString () + ' got ' + urls[i] + ')');
    }
    assert (flightCount (exchange) === 0, 'settled flights must be cleared');
    assert (futureCount (exchange) === 0, 'settled flights must leave no future behind');
    // a warm call reuses the cached listenKey: no new fetch
    const warmUrl = await exchange.authenticate ();
    assert (state.fetches === 1, 'a warm authenticate must not fetch');
    assert (warmUrl === 'wss://wsapi.bitrue.com/stream?listenKey=BITRUE-KEY-1', 'a warm authenticate must return the cached url');
}

async function testBitrueAuthenticateSoloLeaderRejection () {
    // an alone leader - the fetch fails before any waiter arrives, so no
    // shared future was ever minted - must throw to its own caller, clear the
    // slot, and NOT produce an unhandled promise rejection (which would kill
    // the process on the tick below). regression guard for minting the future
    // eagerly in the leader
    const state = { 'fetches': 0 };
    const exchange = makeStubbedBitrue (state);
    (exchange as any).openV1PrivatePostPoseidonApiV1ListenKey = async () => {
        state.fetches = state.fetches + 1;
        throw new AuthenticationError ('bitrue solo leader failure');
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
    assert (flightCount (exchange) === 0, 'a solo rejected flight must be cleared');
    assert (futureCount (exchange) === 0, 'a solo leader must never mint a future');
    // the next caller becomes a fresh leader
    (exchange as any).openV1PrivatePostPoseidonApiV1ListenKey = async () => {
        state.fetches = state.fetches + 1;
        return { 'msg': 'succ', 'code': 200, 'data': { 'listenKey': 'BITRUE-KEY-SOLO-RETRY' } };
    };
    const url = await exchange.authenticate ();
    assert (exchange.options['listenKey'] === 'BITRUE-KEY-SOLO-RETRY', 'the caller after a solo rejection must re-lead');
    assert (url === 'wss://wsapi.bitrue.com/stream?listenKey=BITRUE-KEY-SOLO-RETRY', 'the re-leading caller must return the fresh url');
}

async function testBitrueAuthenticateEmptyKeyRejection () {
    // a hollow 200 must reject the flight BEFORE any cache write: neither
    // listenKey nor listenKeyUrl is set, both concurrent callers observe the
    // typed error, and a retry re-leads. regression guard for the
    // cache-before-confirm class where the watchers dial
    // '/stream?listenKey=undefined' forever
    const state = { 'fetches': 0 };
    const exchange = makeStubbedBitrue (state);
    (exchange as any).openV1PrivatePostPoseidonApiV1ListenKey = async () => {
        state.fetches = state.fetches + 1;
        await sleep (10);
        return { 'msg': 'succ', 'code': 200, 'data': {} }; // hollow response, no listenKey
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.fetches === 1, 'concurrent bitrue authenticates must elect exactly one leader even when it fails');
    // allSettled keeps input order but leader election does not: assert BOTH
    // entries reject with the typed error, so a waiter that swallows the
    // flight rejection and returns an undefined url cannot pass silently
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw on an empty listenKey');
    assert ((outcomes[0] as any).reason instanceof AuthenticationError, 'the bitrue leader must reject with AuthenticationError');
    assert ((outcomes[1] as any).reason instanceof AuthenticationError, 'the bitrue waiter must observe the same AuthenticationError');
    assert (exchange.safeString (exchange.options, 'listenKey') === undefined, 'an empty listenKey must never be cached');
    assert (exchange.safeString (exchange.options, 'listenKeyUrl') === undefined, 'a rejected flight must never cache a listenKeyUrl');
    assert (flightCount (exchange) === 0, 'a rejected flight must be cleared');
    assert (futureCount (exchange) === 0, 'a rejected flight must leave no future behind');
    // recovery: a good response re-leads and caches
    (exchange as any).openV1PrivatePostPoseidonApiV1ListenKey = async () => {
        state.fetches = state.fetches + 1;
        return { 'msg': 'succ', 'code': 200, 'data': { 'listenKey': 'BITRUE-KEY-RETRY' } };
    };
    const url = await exchange.authenticate ();
    assert (exchange.options['listenKey'] === 'BITRUE-KEY-RETRY', 'a retry after a rejected flight must re-lead and cache');
    assert (url === 'wss://wsapi.bitrue.com/stream?listenKey=BITRUE-KEY-RETRY', 'a retry after a rejected flight must return the fresh url');
}

async function testBitrueSingleFlightWiring () {
    await testBitrueAuthenticateSingleFlight ();
    await testBitrueAuthenticateSoloLeaderRejection ();
    await testBitrueAuthenticateEmptyKeyRejection ();
}

export default testBitrueSingleFlightWiring;
