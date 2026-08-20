import assert from 'assert';
import { AuthenticationError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the EXCHANGE wiring of
// the single-flight primitives from https://github.com/ccxt/ccxt/issues/29393
// onto a real venue class (aster, the first campaign exchange). the base
// primitives are covered by test.singleFlightPrimitives.ts; this test guards
// the wiring itself, which no build/lint gate sees: dropping the
// `if (!isLeader) return;` early-return or the flight settlement still
// compiles and only surfaces as duplicate listenKey fetches against a live
// venue. as further #29393 exchanges land, they should register a sibling
// block here following the same stub shape

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
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
    const flightCount = Object.keys (exchange.authenticationFlights).length;
    assert (flightCount === 0, 'settled flights must be cleared');
    // a fresh call within the staleness window is a no-op: no new fetch
    await exchange.authenticate ('spot');
    assert (state.spotFetches === 1, 'a warm authenticate within the refresh window must not fetch');
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
    const flightCount = Object.keys (exchange.authenticationFlights).length;
    assert (flightCount === 0, 'a rejected flight must be cleared');
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
    const flightCount = Object.keys (exchange.authenticationFlights).length;
    assert (flightCount === 0, 'a rejected flight must be cleared');
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
    let flightCount = Object.keys (exchange.authenticationFlights).length;
    assert (flightCount === 0, 'settled flights must be cleared');
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
    flightCount = Object.keys (failing.authenticationFlights).length;
    assert (flightCount === 0, 'a rejected flight must be cleared');
    // recovery: a good response re-leads and caches
    (failing as any).userAuthPrivatePostUserDataStream = async () => {
        failState.fetches = failState.fetches + 1;
        return { 'listenKey': 'BINGX-KEY-RETRY' };
    };
    await failing.authenticate ();
    assert (failing.options['listenKey'] === 'BINGX-KEY-RETRY', 'a retry after a rejected flight must re-lead and cache');
}

async function testXtGetListenKeySingleFlight () {
    // xt: the token lives on client.subscriptions['token'] (per-connection
    // state) with independent spot/contract buckets, and getListenKey ()
    // RETURNS the credential callers embed in subscribe params - racing
    // callers used to mint multiple tokens per type and each embedded its
    // own. pin: one fetch per type, identical token to every caller of a
    // type, per-type flight isolation; a hollow success rejects both
    // callers typed with the bucket unset (subscribers would otherwise
    // fire 'name@undefined' params), then re-leads
    const state = { 'contractFetches': 0, 'spotFetches': 0 };
    const exchange = new ccxt.pro.xt ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    (exchange as any).privateLinearGetFutureUserV1UserListenKey = async () => {
        state.contractFetches = state.contractFetches + 1;
        await sleep (50); // the race window
        return { 'returnCode': '0', 'msgInfo': 'success', 'error': null, 'result': 'XT-CONTRACT-KEY-' + state.contractFetches.toString () };
    };
    (exchange as any).privateSpotPostWsToken = async () => {
        state.spotFetches = state.spotFetches + 1;
        await sleep (50);
        return { 'rc': 0, 'mc': 'SUCCESS', 'ma': [], 'result': { 'accessToken': 'XT-SPOT-TOKEN-' + state.spotFetches.toString (), 'refreshToken': 'unused' } };
    };
    const tokens = await Promise.all ([
        exchange.getListenKey (true),
        exchange.getListenKey (true),
        exchange.getListenKey (true),
        exchange.getListenKey (false),
        exchange.getListenKey (false),
        exchange.getListenKey (false),
    ]);
    assert (state.contractFetches === 1, 'concurrent contract getListenKey calls must elect exactly one leader (got ' + state.contractFetches.toString () + ' fetches)');
    assert (state.spotFetches === 1, 'concurrent spot getListenKey calls must elect exactly one leader (got ' + state.spotFetches.toString () + ' fetches)');
    assert ((tokens[0] === 'XT-CONTRACT-KEY-1') && (tokens[0] === tokens[1]) && (tokens[1] === tokens[2]), 'every contract caller must receive the SAME token');
    assert ((tokens[3] === 'XT-SPOT-TOKEN-1') && (tokens[3] === tokens[4]) && (tokens[4] === tokens[5]), 'every spot caller must receive the SAME token');
    let flightCount = Object.keys (exchange.authenticationFlights).length;
    assert (flightCount === 0, 'settled flights must be cleared');
    // warm calls: no refetch on either type
    await exchange.getListenKey (true);
    await exchange.getListenKey (false);
    assert (state.contractFetches === 1 && state.spotFetches === 1, 'warm getListenKey calls must not fetch');
    // hollow success: fresh instance, both callers reject typed, bucket unset
    const failing = new ccxt.pro.xt ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    const failState = { 'fetches': 0 };
    (failing as any).privateLinearGetFutureUserV1UserListenKey = async () => {
        failState.fetches = failState.fetches + 1;
        await sleep (10);
        return { 'returnCode': '0', 'msgInfo': 'success', 'error': null }; // hollow: no result
    };
    const outcomes = await Promise.allSettled ([
        failing.getListenKey (true),
        failing.getListenKey (true),
    ]);
    assert (outcomes[0].status === 'rejected' && outcomes[1].status === 'rejected', 'both the leader and the waiter must throw on an empty token');
    assert ((outcomes[0] as any).reason instanceof AuthenticationError, 'the xt leader must reject with AuthenticationError');
    assert ((outcomes[1] as any).reason instanceof AuthenticationError, 'the xt waiter must observe the same AuthenticationError');
    const contractUrl = failing.urls['api']['ws']['contract'];
    const failClient = failing.client (contractUrl);
    assert (failing.safeString (failClient.subscriptions, 'token') === undefined, 'an empty token must never be cached on the client bucket');
    flightCount = Object.keys (failing.authenticationFlights).length;
    assert (flightCount === 0, 'a rejected flight must be cleared');
    // recovery: a good response re-leads and caches
    (failing as any).privateLinearGetFutureUserV1UserListenKey = async () => {
        failState.fetches = failState.fetches + 1;
        return { 'returnCode': '0', 'msgInfo': 'success', 'error': null, 'result': 'XT-CONTRACT-RETRY' };
    };
    const retryToken = await failing.getListenKey (true);
    assert (retryToken === 'XT-CONTRACT-RETRY', 'a retry after a rejected flight must re-lead and cache');
}

async function testWsSingleFlightWiring () {
    await testAsterAuthenticateSingleFlight ();
    await testAsterAuthenticateEmptyKeyRejection ();
    await testBinanceAuthenticateEmptyKeyRejection ();
    await testBingxAuthenticateSingleFlight ();
    await testXtGetListenKeySingleFlight ();
}

export default testWsSingleFlightWiring;
