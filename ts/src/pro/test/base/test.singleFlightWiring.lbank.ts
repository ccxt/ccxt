import assert from 'assert';
import { ExchangeError, AuthenticationError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the single-flight
// authentication logic from https://github.com/ccxt/ccxt/issues/29393 on
// ccxt.pro.lbank. the logic is inlined directly into authenticate (), so there
// is no helper method to unit-test: this file is the only guard, and no
// build/lint gate sees it - dropping the in-progress early-return or the
// flight settlement still compiles and only surfaces as duplicate
// subscribe/get_key (or subscribe/refresh_key) POSTs against the live venue.
// lbank differs from the aster/binance/bingx block in test.singleFlightWiring.ts
// in two ways: the credential bucket already lives on the exchange's own ws
// client (client.subscriptions['authenticated']), so the flight is parked on
// that same client under the namespaced key 'authenticateFlight' instead of on
// a dummy 'authenticationFlights' client, and BOTH the cold-acquire and the
// expired-refresh branch are covered by the one flight
//
// the flight is registered in client.futures and settled through
// client.resolve / client.reject, so every mutation of the futures map happens
// inside Client itself - the tests below therefore count client.futures and
// also assert that a settled flight parks nothing in client.pendingResults or
// client.rejections
//
// none of the cases below dial a socket: this.client (url) only constructs the
// WsClient, and the tests assert startedConnecting stays false

const FLIGHT_HASH = 'authenticateFlight';

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function wsClient (exchange: any) {
    // the flight is parked on lbank's own ws client, the same one that carries
    // subscriptions['authenticated'] - see the inlined single-flight block in
    // authenticate ()
    const url = exchange.urls['api']['ws'];
    const clients = exchange.clients;
    if (clients === undefined || !(url in clients)) {
        return undefined;
    }
    return clients[url];
}

function flightCount (exchange: any) {
    // the flight is registered in client.futures under FLIGHT_HASH - a settled
    // flight must leave none behind, because client.resolve / client.reject
    // delete the entry themselves. counted by key so a leftover real future is
    // never mistaken for a flight
    const client = wsClient (exchange);
    if (client === undefined) {
        return 0;
    }
    return (FLIGHT_HASH in client.futures) ? 1 : 0;
}

function futureCount (exchange: any) {
    // same registry - kept as a distinct name so the assertions below read as
    // "no flight registered" and "no future left behind" separately
    return flightCount (exchange);
}

function residueCount (exchange: any) {
    // client.resolve parks its value in pendingResults and client.reject parks
    // its error in rejections whenever no future exists at settle time. with
    // the leader always holding a live future neither may ever happen, and a
    // parked rejection would poison the FIRST waiter of the NEXT flight
    const client = wsClient (exchange);
    if (client === undefined) {
        return 0;
    }
    let count = 0;
    if (FLIGHT_HASH in client.pendingResults) {
        count = count + 1;
    }
    if (FLIGHT_HASH in client.rejections) {
        count = count + 1;
    }
    return count;
}

function assertSettled (exchange: any, context: string) {
    assert (flightCount (exchange) === 0, context + ': a settled flight must leave no future behind');
    assert (residueCount (exchange) === 0, context + ': a settled flight must park nothing in pendingResults or rejections');
}

function assertNotDialed (exchange: any, context: string) {
    // the flight rides a client that authenticate () would build anyway - but
    // nothing in this file may open a real connection to lbank
    const client = wsClient (exchange);
    if (client === undefined) {
        return;
    }
    assert (client.startedConnecting === false, context + ': the test must never dial a socket');
    assert (client.connection === undefined, context + ': the test must never dial a socket');
}

function makeStubbedLbank (state: { getKeyFetches: number, refreshFetches: number }) {
    const exchange = new ccxt.pro.lbank ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    // stub the two subscribeKey endpoints: count fetches, hold each response
    // open long enough for concurrent callers to pile onto the flight
    (exchange as any).spotPrivatePostSubscribeGetKey = async () => {
        state.getKeyFetches = state.getKeyFetches + 1;
        await sleep (50); // the race window
        return { 'result': true, 'data': 'LBANK-KEY-' + state.getKeyFetches.toString () };
    };
    (exchange as any).spotPrivatePostSubscribeRefreshKey = async () => {
        state.refreshFetches = state.refreshFetches + 1;
        await sleep (50); // the race window
        return { 'result': 'true' };
    };
    return exchange;
}

function expireSubscription (exchange: any) {
    // push the cached subscribeKey past its expiry so the next authenticate ()
    // takes the refresh branch
    const client = wsClient (exchange);
    client.subscriptions['authenticated']['expires'] = 0;
}

async function testLbankAuthenticateColdSingleFlight () {
    // N concurrent authenticate () calls on a cold instance must produce
    // exactly ONE subscribe/get_key POST, and every caller must receive the
    // leader's key - before the flight each caller passed the
    // subscriptions['authenticated'] === undefined check, POSTed its own key
    // and the last write won, orphaning the rest
    const state = { 'getKeyFetches': 0, 'refreshFetches': 0 };
    const exchange = makeStubbedLbank (state);
    const keys = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.getKeyFetches === 1, 'concurrent lbank authenticates must elect exactly one leader (got ' + state.getKeyFetches.toString () + ' fetches)');
    assert (state.refreshFetches === 0, 'a cold authenticate must not refresh');
    for (let i = 0; i < keys.length; i++) {
        assert (keys[i] === 'LBANK-KEY-1', 'every caller must receive the leader subscribeKey (caller ' + i.toString () + ' got ' + keys[i] + ')');
    }
    const client = wsClient (exchange);
    assert (client.subscriptions['authenticated']['key'] === 'LBANK-KEY-1', 'the leader subscribeKey must be cached');
    assertSettled (exchange, 'cold single-flight');
    assertNotDialed (exchange, 'cold single-flight');
    // a fresh call inside the expiry window is a no-op: no new fetch of any kind
    const warmKey = await exchange.authenticate ();
    assert (warmKey === 'LBANK-KEY-1', 'a warm authenticate must return the cached subscribeKey');
    assert (state.getKeyFetches === 1, 'a warm authenticate inside the expiry window must not fetch');
    assert (state.refreshFetches === 0, 'a warm authenticate inside the expiry window must not refresh');
    assertSettled (exchange, 'warm authenticate');
}

async function testLbankAuthenticateRefreshSingleFlight () {
    // the expired branch races too: each caller read the same stale expires,
    // then each POSTed subscribe/refresh_key. the flight wraps BOTH branches,
    // so an expired credential is refreshed exactly once
    const state = { 'getKeyFetches': 0, 'refreshFetches': 0 };
    const exchange = makeStubbedLbank (state);
    const coldKey = await exchange.authenticate ();
    assert (coldKey === 'LBANK-KEY-1', 'the cold acquire must seed the cache');
    expireSubscription (exchange);
    const keys = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.refreshFetches === 1, 'concurrent expired lbank authenticates must refresh exactly once (got ' + state.refreshFetches.toString () + ' refreshes)');
    assert (state.getKeyFetches === 1, 'an expired subscribeKey must be refreshed, not re-minted');
    for (let i = 0; i < keys.length; i++) {
        assert (keys[i] === 'LBANK-KEY-1', 'a refresh must keep the same subscribeKey (caller ' + i.toString () + ' got ' + keys[i] + ')');
    }
    const client = wsClient (exchange);
    assert (client.subscriptions['authenticated']['expires'] > exchange.milliseconds (), 'a successful refresh must extend the expiry');
    assertSettled (exchange, 'refresh single-flight');
    assertNotDialed (exchange, 'refresh single-flight');
}

async function testLbankAuthenticateFailedGetKeyRejection () {
    // lbank signals failure with result !== true on a 200, and its existing
    // ExchangeError guard now lands inside the try: the flight must reject
    // rather than cache nothing and deadlock every later caller on a dead
    // flight. both the leader and the waiter must see the typed error
    const state = { 'getKeyFetches': 0, 'refreshFetches': 0 };
    const exchange = makeStubbedLbank (state);
    (exchange as any).spotPrivatePostSubscribeGetKey = async () => {
        state.getKeyFetches = state.getKeyFetches + 1;
        await sleep (50);
        return { 'result': false, 'error_code': 10007 };
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.getKeyFetches === 1, 'a failing cold authenticate must still elect exactly one leader');
    // allSettled keeps input order but leader election does not: assert BOTH
    // entries reject with the typed error, so a waiter that swallows the
    // flight rejection and returns cannot pass silently
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw when get_key fails');
    assert ((outcomes[0] as any).reason instanceof ExchangeError, 'the lbank leader must reject with ExchangeError');
    assert ((outcomes[1] as any).reason instanceof ExchangeError, 'the lbank waiter must observe the same ExchangeError');
    const client = wsClient (exchange);
    assert (!('authenticated' in client.subscriptions), 'a failed get_key must never cache a subscribeKey');
    assertSettled (exchange, 'failed get_key rejection');
    // recovery: the next caller re-leads instead of hanging on the dead flight
    const fetchesBeforeRetry: number = state.getKeyFetches;
    (exchange as any).spotPrivatePostSubscribeGetKey = async () => {
        state.getKeyFetches = state.getKeyFetches + 1;
        return { 'result': true, 'data': 'LBANK-KEY-RETRY' };
    };
    const retryKey = await exchange.authenticate ();
    assert (retryKey === 'LBANK-KEY-RETRY', 'the caller after a rejected flight must re-lead and cache');
    assert (state.getKeyFetches === fetchesBeforeRetry + 1, 'the retry must actually fetch');
    assertNotDialed (exchange, 'failed get_key rejection');
}

async function testLbankAuthenticateSoloLeaderRejection () {
    // an alone leader - the fetch fails before any waiter arrives, so no
    // other caller ever awaits the flight - must throw to its own caller,
    // clear the slot, and NOT produce an unhandled promise rejection (which
    // would kill the process on the tick below). the leader always registers
    // the future itself and ends the method with await future, which both
    // rethrows and attaches the handler that keeps node alive
    const state = { 'getKeyFetches': 0, 'refreshFetches': 0 };
    const exchange = makeStubbedLbank (state);
    (exchange as any).spotPrivatePostSubscribeGetKey = async () => {
        state.getKeyFetches = state.getKeyFetches + 1;
        return { 'result': false };
    };
    let soloError: any = undefined;
    try {
        await exchange.authenticate ();
    } catch (e) {
        soloError = e;
    }
    assert (soloError instanceof ExchangeError, 'a solo leader must throw its own error');
    // give the microtask queue a tick - an unhandled rejection fires here
    await sleep (20);
    assertSettled (exchange, 'solo leader rejection');
    assertNotDialed (exchange, 'solo leader rejection');
}

async function testLbankAuthenticateFailedRefreshRejection () {
    // the refresh branch has the same contract: a result !== 'true' rejects
    // the flight, leaves the stale expiry alone so the next caller retries the
    // refresh, and never strands a waiter
    const state = { 'getKeyFetches': 0, 'refreshFetches': 0 };
    const exchange = makeStubbedLbank (state);
    await exchange.authenticate ();
    expireSubscription (exchange);
    (exchange as any).spotPrivatePostSubscribeRefreshKey = async () => {
        state.refreshFetches = state.refreshFetches + 1;
        await sleep (50);
        return { 'result': 'false' };
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.refreshFetches === 1, 'a failing refresh must still elect exactly one leader');
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw when refresh_key fails');
    assert ((outcomes[0] as any).reason instanceof ExchangeError, 'the lbank refresh leader must reject with ExchangeError');
    assert ((outcomes[1] as any).reason instanceof ExchangeError, 'the lbank refresh waiter must observe the same ExchangeError');
    const client = wsClient (exchange);
    assert (client.subscriptions['authenticated']['expires'] === 0, 'a failed refresh must not extend the expiry');
    assertSettled (exchange, 'failed refresh rejection');
    // recovery: the next caller re-leads the refresh
    const refreshesBeforeRetry: number = state.refreshFetches;
    (exchange as any).spotPrivatePostSubscribeRefreshKey = async () => {
        state.refreshFetches = state.refreshFetches + 1;
        return { 'result': 'true' };
    };
    const retryKey = await exchange.authenticate ();
    assert (retryKey === 'LBANK-KEY-1', 'the caller after a rejected refresh must re-lead');
    assert (state.refreshFetches === refreshesBeforeRetry + 1, 'the refresh retry must actually fetch');
    assertNotDialed (exchange, 'failed refresh rejection');
}

async function testLbankAuthenticateMissingCredentials () {
    // checkRequiredCredentials () runs BEFORE the flight is registered, so a
    // caller with no keys throws immediately instead of parking a flight that
    // nobody would ever settle
    const state = { 'getKeyFetches': 0, 'refreshFetches': 0 };
    const exchange = new ccxt.pro.lbank ({});
    (exchange as any).spotPrivatePostSubscribeGetKey = async () => {
        state.getKeyFetches = state.getKeyFetches + 1;
        return { 'result': true, 'data': 'LBANK-KEY-NEVER' };
    };
    let credentialsError: any = undefined;
    try {
        await exchange.authenticate ();
    } catch (e) {
        credentialsError = e;
    }
    assert (credentialsError instanceof AuthenticationError, 'a credential-less authenticate must throw AuthenticationError');
    assert (state.getKeyFetches === 0, 'a credential-less authenticate must not fetch');
    assert (flightCount (exchange) === 0, 'a credential-less authenticate must not register a flight');
    assert (futureCount (exchange) === 0, 'a credential-less authenticate must not register a future');
    assert (residueCount (exchange) === 0, 'a credential-less authenticate must park nothing');
}

async function testLbankSingleFlightWiring () {
    await testLbankAuthenticateColdSingleFlight ();
    await testLbankAuthenticateRefreshSingleFlight ();
    await testLbankAuthenticateFailedGetKeyRejection ();
    await testLbankAuthenticateSoloLeaderRejection ();
    await testLbankAuthenticateFailedRefreshRejection ();
    await testLbankAuthenticateMissingCredentials ();
}

export default testLbankSingleFlightWiring;
