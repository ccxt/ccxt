import assert from 'assert';
import { AuthenticationError, ExchangeClosedByUser } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the single-flight
// authentication logic from https://github.com/ccxt/ccxt/issues/29393 on the
// real venue classes that carry it (aster, binance, bingx). the logic is
// inlined directly into each authenticate (), so there is no helper method to
// unit-test: this file is the only guard, and no build/lint gate sees it -
// dropping the in-progress early-return or the flight settlement still
// compiles and only surfaces as duplicate listenKey fetches against a live
// venue. as further #29393 exchanges land, they should register a sibling
// block here following the same stub shape

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function flightCount (exchange: any) {
    // the flights live on a never-dialed client keyed 'authenticationFlights',
    // registered in its subscriptions map - see the inlined single-flight
    // block in authenticate () on binance/aster/bingx
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

function makeStubbedAster (state: { spotFetches: number, swapFetches: number }) {
    const exchange = new ccxt.pro.aster ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    // stub the two listenKey endpoints: count fetches, hold each response
    // open long enough for concurrent callers to pile onto the flight
    (exchange as any).sapiPrivatePostV3ListenKey = async () => {
        state.spotFetches = state.spotFetches + 1;
        await sleep (50); // the race window
        return { 'listenKey': 'SPOT-KEY-' + state.spotFetches.toString () };
    };
    (exchange as any).fapiPrivatePostV3ListenKey = async () => {
        state.swapFetches = state.swapFetches + 1;
        await sleep (50);
        return { 'listenKey': 'SWAP-KEY-' + state.swapFetches.toString () };
    };
    // neutralize the keepalive scheduler - the test must not leave timers behind
    (exchange as any).delay = () => {};
    return exchange;
}

async function testAsterAuthenticateSingleFlight () {
    // N concurrent authenticate () calls per type on a cold instance must
    // produce exactly ONE fetch per type, and both types must run their own
    // independent flights (per-type isolation of the shared flight map)
    const state = { 'spotFetches': 0, 'swapFetches': 0 };
    const exchange = makeStubbedAster (state);
    await Promise.all ([
        exchange.authenticate ('spot'),
        exchange.authenticate ('spot'),
        exchange.authenticate ('spot'),
        exchange.authenticate ('swap'),
        exchange.authenticate ('swap'),
        exchange.authenticate ('swap'),
    ]);
    assert (state.spotFetches === 1, 'concurrent spot authenticates must elect exactly one leader (got ' + state.spotFetches.toString () + ' fetches)');
    assert (state.swapFetches === 1, 'concurrent swap authenticates must elect exactly one leader (got ' + state.swapFetches.toString () + ' fetches)');
    assert (exchange.options['listenKey']['spot'] === 'SPOT-KEY-1', 'the leader listenKey must be cached for spot');
    assert (exchange.options['listenKey']['swap'] === 'SWAP-KEY-1', 'the leader listenKey must be cached for swap');
    assert (flightCount (exchange) === 0, 'settled flights must be cleared');
    assert (futureCount (exchange) === 0, 'settled flights must leave no future behind');
    // a fresh call within the staleness window is a no-op: no new fetch
    await exchange.authenticate ('spot');
    assert (state.spotFetches === 1, 'a warm authenticate within the refresh window must not fetch');
}

async function testAsterAuthenticateSoloLeaderRejection () {
    // an alone leader - the fetch fails before any waiter arrives, so no
    // shared future was ever minted - must throw to its own caller, clear the
    // slot, and NOT produce an unhandled promise rejection (which would kill
    // the process on the tick below). regression guard for minting the future
    // eagerly in the leader
    const state = { 'spotFetches': 0, 'swapFetches': 0 };
    const exchange = makeStubbedAster (state);
    (exchange as any).sapiPrivatePostV3ListenKey = async () => {
        state.spotFetches = state.spotFetches + 1;
        throw new AuthenticationError ('aster solo leader failure');
    };
    let soloError: any = undefined;
    try {
        await exchange.authenticate ('spot');
    } catch (e) {
        soloError = e;
    }
    assert (soloError instanceof AuthenticationError, 'a solo leader must throw its own error');
    // give the microtask queue a tick - an unhandled rejection fires here
    await sleep (20);
    assert (flightCount (exchange) === 0, 'a solo rejected flight must be cleared');
    assert (futureCount (exchange) === 0, 'a solo leader must never mint a future');
    // the next caller becomes a fresh leader
    (exchange as any).sapiPrivatePostV3ListenKey = async () => {
        state.spotFetches = state.spotFetches + 1;
        return { 'listenKey': 'SPOT-KEY-SOLO-RETRY' };
    };
    await exchange.authenticate ('spot');
    assert (exchange.options['listenKey']['spot'] === 'SPOT-KEY-SOLO-RETRY', 'the caller after a solo rejection must re-lead');
}

async function testAsterAuthenticateCloseSettlesWaiter () {
    // close () while a flight is in progress must settle the waiter instead of
    // stranding it: the flight is parked on a never-dialed client, which has no
    // socket teardown to fire the onClose -> reset -> reject chain, so
    // WsClient.close () settles it explicitly. without that the waiter below
    // hangs forever and a shutdown never completes
    const state = { 'spotFetches': 0, 'swapFetches': 0 };
    const exchange = makeStubbedAster (state);
    (exchange as any).sapiPrivatePostV3ListenKey = async () => {
        state.spotFetches = state.spotFetches + 1;
        await sleep (300); // held open across the close () below
        return { 'listenKey': 'SPOT-KEY-HELD' };
    };
    const leader = exchange.authenticate ('spot');
    await sleep (20); // the leader registers the flight
    let waiterError: any = undefined;
    const waiter = exchange.authenticate ('spot').catch ((e: any) => {
        waiterError = e;
    });
    await sleep (20); // the waiter mints the shared future and awaits it
    assert (flightCount (exchange) === 1, 'the in-progress flight must be registered');
    assert (futureCount (exchange) === 1, 'the waiter must have minted the shared future');
    await exchange.close ();
    await waiter;
    assert (waiterError instanceof ExchangeClosedByUser, 'close () must settle an in-flight waiter with ExchangeClosedByUser');
    await leader; // the leader still finishes cleanly, no double-settle throw
    assert (flightCount (exchange) === 0, 'close () must leave no flight behind');
}

async function testAsterAuthenticateEmptyKeyRejection () {
    // a hollow 200 must reject the flight BEFORE any cache write: the key
    // stays unset, lastAuthenticatedTime stays 0, and a retry re-leads -
    // regression guard for the cache-before-confirm class where
    // getPrivateUrl () yields .../ws/undefined with no retry for an hour
    const state = { 'spotFetches': 0, 'swapFetches': 0 };
    const exchange = makeStubbedAster (state);
    (exchange as any).sapiPrivatePostV3ListenKey = async () => {
        state.spotFetches = state.spotFetches + 1;
        await sleep (10);
        return {}; // hollow response, no listenKey
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate ('spot'),
        exchange.authenticate ('spot'),
    ]);
    // allSettled keeps input order but leader election does not: assert BOTH
    // entries reject with the typed error, so a waiter that swallows the
    // flight rejection and returns cannot pass silently
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw on an empty listenKey');
    assert ((outcomes[0] as any).reason instanceof AuthenticationError, 'the leader must reject with AuthenticationError');
    assert ((outcomes[1] as any).reason instanceof AuthenticationError, 'the waiter must observe the same AuthenticationError');
    const cachedKey = exchange.safeString (exchange.options['listenKey'], 'spot');
    assert (cachedKey === undefined, 'an empty listenKey must never be cached');
    const lastTime = exchange.safeInteger (exchange.options['lastAuthenticatedTime'], 'spot', 0);
    assert (lastTime === 0, 'a failed flight must not stamp lastAuthenticatedTime');
    assert (flightCount (exchange) === 0, 'a rejected flight must be cleared');
    // recovery: a subsequent good response fetches again and caches
    (exchange as any).sapiPrivatePostV3ListenKey = async () => {
        state.spotFetches = state.spotFetches + 1;
        return { 'listenKey': 'SPOT-KEY-RETRY' };
    };
    await exchange.authenticate ('spot');
    assert (exchange.options['listenKey']['spot'] === 'SPOT-KEY-RETRY', 'a retry after a rejected flight must re-lead and cache');
}

async function testBinanceAuthenticateEmptyKeyRejection () {
    // same hollow-200 class on binance's consolidated authenticate ():
    // the leader must reject the flight before writing the per-type
    // options bucket, both concurrent callers observe the typed error,
    // and a good retry re-leads. uses the 'future' type: spot routes to
    // the signature-subscribe path and margin to listenToken, so the
    // listenKey branch under test is the futures one
    const state = { 'fetches': 0 };
    const exchange = new ccxt.pro.binance ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    (exchange as any).fapiPrivatePostListenKey = async () => {
        state.fetches = state.fetches + 1;
        await sleep (10);
        return {}; // hollow response, no listenKey
    };
    (exchange as any).delay = () => {};
    const params = { 'type': 'future' };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (params),
        exchange.authenticate (params),
    ]);
    assert (state.fetches === 1, 'concurrent binance authenticates must elect exactly one leader');
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw on an empty listenKey');
    assert ((outcomes[0] as any).reason instanceof AuthenticationError, 'the binance leader must reject with AuthenticationError');
    assert ((outcomes[1] as any).reason instanceof AuthenticationError, 'the binance waiter must observe the same AuthenticationError');
    const bucket = exchange.safeValue (exchange.options, 'future', {});
    assert (exchange.safeString (bucket, 'listenKey') === undefined, 'an empty listenKey must never be cached');
    assert (exchange.safeInteger (bucket, 'lastAuthenticatedTime', 0) === 0, 'a failed flight must not stamp lastAuthenticatedTime');
    assert (flightCount (exchange) === 0, 'a rejected flight must be cleared');
    // recovery: a good response re-leads and caches
    (exchange as any).fapiPrivatePostListenKey = async () => {
        state.fetches = state.fetches + 1;
        return { 'listenKey': 'FUTURE-KEY-RETRY' };
    };
    await exchange.authenticate (params);
    assert (exchange.options['future']['listenKey'] === 'FUTURE-KEY-RETRY', 'a retry after a rejected flight must re-lead and cache');
}

async function testBingxAuthenticateSingleFlight () {
    // bingx: single untyped bucket, one endpoint, the key rides the private
    // url - racing fetches mint different keys and losers connect watchers
    // to an orphaned stream. concurrent authenticates must elect one leader;
    // a hollow 200 rejects both callers typed, writes nothing, and re-leads
    const state = { 'fetches': 0 };
    const exchange = new ccxt.pro.bingx ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    (exchange as any).userAuthPrivatePostUserDataStream = async () => {
        state.fetches = state.fetches + 1;
        await sleep (50); // the race window
        return { 'listenKey': 'BINGX-KEY-' + state.fetches.toString () };
    };
    (exchange as any).delay = () => {};
    await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assert (state.fetches === 1, 'concurrent bingx authenticates must elect exactly one leader (got ' + state.fetches.toString () + ' fetches)');
    assert (exchange.options['listenKey'] === 'BINGX-KEY-1', 'the leader listenKey must be cached');
    assert (flightCount (exchange) === 0, 'settled flights must be cleared');
    // warm call within the refresh window is a no-op
    await exchange.authenticate ();
    assert (state.fetches === 1, 'a warm authenticate within the refresh window must not fetch');
    // hollow 200: fresh instance, both callers reject typed, cache untouched
    const failState = { 'fetches': 0 };
    const failing = new ccxt.pro.bingx ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    (failing as any).userAuthPrivatePostUserDataStream = async () => {
        failState.fetches = failState.fetches + 1;
        await sleep (10);
        return {}; // hollow response, no listenKey
    };
    (failing as any).delay = () => {};
    const outcomes = await Promise.allSettled ([
        failing.authenticate (),
        failing.authenticate (),
    ]);
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw on an empty listenKey');
    assert ((outcomes[0] as any).reason instanceof AuthenticationError, 'the bingx leader must reject with AuthenticationError');
    assert ((outcomes[1] as any).reason instanceof AuthenticationError, 'the bingx waiter must observe the same AuthenticationError');
    assert (failing.safeString (failing.options, 'listenKey') === undefined, 'an empty listenKey must never be cached');
    assert (failing.safeInteger (failing.options, 'lastAuthenticatedTime', 0) === 0, 'a failed flight must not stamp lastAuthenticatedTime');
    assert (flightCount (failing) === 0, 'a rejected flight must be cleared');
    // recovery: a good response re-leads and caches
    (failing as any).userAuthPrivatePostUserDataStream = async () => {
        failState.fetches = failState.fetches + 1;
        return { 'listenKey': 'BINGX-KEY-RETRY' };
    };
    await failing.authenticate ();
    assert (failing.options['listenKey'] === 'BINGX-KEY-RETRY', 'a retry after a rejected flight must re-lead and cache');
}

async function testWsSingleFlightWiring () {
    await testAsterAuthenticateSingleFlight ();
    await testAsterAuthenticateSoloLeaderRejection ();
    await testAsterAuthenticateCloseSettlesWaiter ();
    await testAsterAuthenticateEmptyKeyRejection ();
    await testBinanceAuthenticateEmptyKeyRejection ();
    await testBingxAuthenticateSingleFlight ();
}

export default testWsSingleFlightWiring;
