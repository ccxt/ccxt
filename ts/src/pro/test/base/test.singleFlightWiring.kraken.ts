import assert from 'assert';
import { AuthenticationError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the single-flight
// authentication logic from https://github.com/ccxt/ccxt/issues/29393 on
// kraken. the flight is registered in client.futures and settled through
// client.resolve () / client.reject (), so the registry entry is created and
// removed by the client itself and never by a hand-rolled delete. kraken's
// authenticate () already owns a client local bound to urls['api']['ws']
// ['private'] and already caches the websockets token in that client's
// subscriptions under 'authenticated', so the flight is parked on that same
// client under a namespaced 'authenticateFlight' hash. the logic is inlined
// directly into authenticate (), so there is no helper method to unit-test:
// this file is the only guard, and no build/lint gate sees it - dropping the
// in-progress early-return or the flight settlement still compiles and only
// surfaces as duplicate GetWebSocketsToken calls against the live
// rate-limited endpoint

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function privateClient (exchange: any) {
    // the flight is parked on the SAME client authenticate () already uses to
    // cache the token - not on a separate 'authenticationFlights' client
    const url = exchange.urls['api']['ws']['private'];
    const clients = exchange.clients;
    if (!(url in clients)) {
        return undefined;
    }
    return clients[url];
}

function flightCount (exchange: any) {
    // the flight registry IS client.futures - count ONLY the namespaced
    // flight hash, so the real 'authenticated' subscription entry cannot mask
    // a leaked flight registration
    const client = privateClient (exchange);
    if (client === undefined) {
        return 0;
    }
    return ('authenticateFlight' in client.futures) ? 1 : 0;
}

function futureCount (exchange: any) {
    // client.resolve () / client.reject () delete the entry as part of
    // settling it, so a settled flight must leave the whole map empty
    const client = privateClient (exchange);
    if (client === undefined) {
        return 0;
    }
    return Object.keys (client.futures).length;
}

function residueCount (exchange: any) {
    // client.resolve () parks its value in pendingResults and client.reject ()
    // parks its error in rejections whenever no future is registered at settle
    // time - both would silently poison the NEXT flight, so a settled flight
    // must leave neither behind
    const client = privateClient (exchange);
    if (client === undefined) {
        return 0;
    }
    return Object.keys (client.pendingResults).length + Object.keys (client.rejections).length;
}

function cachedToken (exchange: any) {
    const client = privateClient (exchange);
    if (client === undefined) {
        return undefined;
    }
    return exchange.safeString (client.subscriptions['authenticated'], 'token');
}

function makeStubbedKraken (state: { fetches: number }) {
    const exchange = new ccxt.pro.kraken ({
        'apiKey': 'test-api-key',
        'secret': 'dGVzdC1zZWNyZXQ=',
    });
    // stub the token endpoint: count fetches, hold each response open long
    // enough for concurrent callers to pile onto the flight
    (exchange as any).privatePostGetWebSocketsToken = async () => {
        state.fetches = state.fetches + 1;
        await sleep (50); // the race window
        return { 'error': [], 'result': { 'token': 'KRAKEN-TOKEN-' + state.fetches.toString (), 'expires': 900 } };
    };
    return exchange;
}

async function testKrakenAuthenticateSingleFlight () {
    // N concurrent authenticate () calls on a cold instance must produce
    // exactly ONE GetWebSocketsToken fetch, and every caller must observe the
    // SAME token the leader cached - on master each caller passes the
    // staleness gate, fires its own fetch and returns its own token
    const state = { 'fetches': 0 };
    const exchange = makeStubbedKraken (state);
    const tokens = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.fetches === 1, 'concurrent kraken authenticates must elect exactly one leader (got ' + state.fetches.toString () + ' fetches)');
    for (let i = 0; i < tokens.length; i++) {
        assert (tokens[i] === 'KRAKEN-TOKEN-1', 'every caller must observe the leader token, caller ' + i.toString () + ' got ' + String (tokens[i]));
    }
    assert (cachedToken (exchange) === 'KRAKEN-TOKEN-1', 'the leader token must be cached in client.subscriptions[authenticated]');
    const client = privateClient (exchange);
    assert (exchange.safeInteger (client.subscriptions['authenticated'], 'expires') === 900, 'the cached subscription must keep the venue expires field');
    assert (exchange.safeInteger (client.subscriptions['authenticated'], 'start') !== undefined, 'the cached subscription must keep the start stamp');
    assert (flightCount (exchange) === 0, 'settled flights must be cleared from client.futures');
    assert (futureCount (exchange) === 0, 'settled flights must leave no future behind');
    assert (residueCount (exchange) === 0, 'a settled flight must leave no pendingResults / rejections residue');
    // a fresh call inside the expiry window is a no-op: no new fetch
    const warm = await exchange.authenticate ();
    assert (state.fetches === 1, 'a warm authenticate inside the expiry window must not fetch');
    assert (warm === 'KRAKEN-TOKEN-1', 'a warm authenticate must return the cached token');
    assert (flightCount (exchange) === 0, 'a warm authenticate must not register a flight');
    assert (residueCount (exchange) === 0, 'a warm authenticate must not leave residue');
}

async function testKrakenAuthenticateExpiredRefetches () {
    // the single-flight wrap must NOT weaken the existing staleness gate: an
    // expired subscription still re-mints, and the concurrent refresh is
    // itself single-flighted
    const state = { 'fetches': 0 };
    const exchange = makeStubbedKraken (state);
    await exchange.authenticate ();
    // read through a local: assert () narrows state.fetches to the literal it
    // matched, which would make the later === 2 comparison a type error
    const coldFetches = state.fetches;
    assert (coldFetches === 1, 'the cold call must fetch once');
    // age the cached subscription past start + expires
    const client = privateClient (exchange);
    client.subscriptions['authenticated']['start'] = exchange.seconds () - 1000;
    const tokens = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    const refreshFetches = state.fetches;
    assert (refreshFetches === 2, 'an expired subscription must re-fetch exactly once across concurrent callers (got ' + refreshFetches.toString () + ')');
    assert (tokens[0] === 'KRAKEN-TOKEN-2' && tokens[1] === 'KRAKEN-TOKEN-2' && tokens[2] === 'KRAKEN-TOKEN-2', 'all refresh callers must observe the new token');
    assert (cachedToken (exchange) === 'KRAKEN-TOKEN-2', 'the refreshed token must replace the cached one');
    assert (flightCount (exchange) === 0, 'the refresh flight must be cleared from client.futures');
    assert (futureCount (exchange) === 0, 'the refresh flight must leave no future behind');
    assert (residueCount (exchange) === 0, 'the refresh flight must leave no pendingResults / rejections residue');
}

async function testKrakenAuthenticateEmptyTokenRejection () {
    // a hollow 200 must reject the flight BEFORE any cache write: on master
    // this.safeDict (response, 'result') yields undefined and the very next
    // line writes subscription['start'], which throws a raw TypeError. both
    // concurrent callers must instead observe a typed AuthenticationError and
    // the subscriptions bucket must stay clean so a retry re-leads
    const state = { 'fetches': 0 };
    const exchange = makeStubbedKraken (state);
    (exchange as any).privatePostGetWebSocketsToken = async () => {
        state.fetches = state.fetches + 1;
        await sleep (10);
        return { 'error': [], 'result': {} }; // hollow response, no token
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.fetches === 1, 'a failing flight must still elect exactly one leader');
    // allSettled keeps input order but leader election does not: assert BOTH
    // entries reject with the typed error, so a waiter that swallows the
    // flight rejection and returns undefined cannot pass silently
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw on an empty token');
    assert ((outcomes[0] as any).reason instanceof AuthenticationError, 'the kraken leader must reject with AuthenticationError');
    assert ((outcomes[1] as any).reason instanceof AuthenticationError, 'the kraken waiter must observe the same AuthenticationError');
    const client = privateClient (exchange);
    assert (!('authenticated' in client.subscriptions), 'an empty token must never be cached');
    assert (flightCount (exchange) === 0, 'a rejected flight must be cleared from client.futures');
    assert (futureCount (exchange) === 0, 'a rejected flight must leave no future behind');
    // a rejection parked under the flight hash would be replayed onto the
    // FIRST waiter of the next flight by Client.future (), turning a healthy
    // retry into a spurious AuthenticationError
    assert (residueCount (exchange) === 0, 'a rejected flight must leave no pendingResults / rejections residue');
    // recovery: a good response re-leads and caches
    (exchange as any).privatePostGetWebSocketsToken = async () => {
        state.fetches = state.fetches + 1;
        return { 'error': [], 'result': { 'token': 'KRAKEN-TOKEN-RETRY', 'expires': 900 } };
    };
    const retried = await exchange.authenticate ();
    assert (retried === 'KRAKEN-TOKEN-RETRY', 'a retry after a rejected flight must re-lead and return the new token');
    assert (cachedToken (exchange) === 'KRAKEN-TOKEN-RETRY', 'a retry after a rejected flight must cache the new token');
    assert (residueCount (exchange) === 0, 'the recovery flight must leave no residue either');
}

async function testKrakenAuthenticateSoloLeaderRejection () {
    // an alone leader - the fetch fails before any waiter arrives - must throw
    // to its own caller, clear the registry slot, and NOT produce an unhandled
    // promise rejection (which would kill the process on the tick below). the
    // trailing `await future` is what attaches that handler, so this is the
    // regression guard for dropping it or for re-adding a `throw e` in the
    // catch that would pre-empt it
    const state = { 'fetches': 0 };
    const exchange = makeStubbedKraken (state);
    (exchange as any).privatePostGetWebSocketsToken = async () => {
        state.fetches = state.fetches + 1;
        throw new AuthenticationError ('kraken solo leader failure');
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
    assert (flightCount (exchange) === 0, 'a solo rejected flight must be cleared from client.futures');
    assert (futureCount (exchange) === 0, 'a solo rejected flight must leave no future behind');
    assert (residueCount (exchange) === 0, 'a solo rejected flight must leave no pendingResults / rejections residue');
    // the next caller becomes a fresh leader
    (exchange as any).privatePostGetWebSocketsToken = async () => {
        state.fetches = state.fetches + 1;
        return { 'error': [], 'result': { 'token': 'KRAKEN-TOKEN-SOLO-RETRY', 'expires': 900 } };
    };
    const retried = await exchange.authenticate ();
    assert (retried === 'KRAKEN-TOKEN-SOLO-RETRY', 'the caller after a solo rejection must re-lead');
}

async function testKrakenAuthenticateWaiterAlwaysSettles () {
    // the flight is parked on the private-url client, which kraken never
    // dials (every watch* subscribes to ws.privateV2 / ws.publicV2), so no
    // socket teardown can reset that client and strand or poison the flight.
    // the leader is therefore the only settler and MUST settle on both paths -
    // this pins that a waiter never outlives the leader's REST call even when
    // the exchange is closed mid-flight
    const state = { 'fetches': 0 };
    const exchange = makeStubbedKraken (state);
    (exchange as any).privatePostGetWebSocketsToken = async () => {
        state.fetches = state.fetches + 1;
        await sleep (200); // held open across the close () below
        return { 'error': [], 'result': { 'token': 'KRAKEN-TOKEN-HELD', 'expires': 900 } };
    };
    const leader = exchange.authenticate ();
    await sleep (20); // the leader registers the flight in client.futures
    const waiter = exchange.authenticate ();
    await sleep (20); // the waiter joins the leader's future and awaits it
    assert (flightCount (exchange) === 1, 'the in-progress flight must be registered in client.futures');
    assert (futureCount (exchange) === 1, 'the leader and the waiter must share exactly one future');
    await exchange.close ();
    // the leader still owns its client reference, so both settle on the
    // leader's completion - bounded by the REST call, never an infinite hang
    const leaderToken = await leader;
    const waiterToken = await waiter;
    assert (leaderToken === 'KRAKEN-TOKEN-HELD', 'the leader must still complete across a close ()');
    assert (waiterToken === 'KRAKEN-TOKEN-HELD', 'the waiter must be settled by the leader, not stranded');
    assert (state.fetches === 1, 'the close () must not have triggered a second fetch');
}

async function testKrakenSingleFlightWiring () {
    await testKrakenAuthenticateSingleFlight ();
    await testKrakenAuthenticateExpiredRefetches ();
    await testKrakenAuthenticateEmptyTokenRejection ();
    await testKrakenAuthenticateSoloLeaderRejection ();
    await testKrakenAuthenticateWaiterAlwaysSettles ();
}

export default testKrakenSingleFlightWiring;
