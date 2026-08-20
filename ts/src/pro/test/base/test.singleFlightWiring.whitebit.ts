import assert from 'assert';
import { AuthenticationError } from '../../../base/errors.js';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the single-flight
// authentication logic from https://github.com/ccxt/ccxt/issues/29393 on
// ccxt.pro.whitebit. whitebit gates its handshake on
// subscriptions['authenticated'], which watch () only registers once the
// awaited v4PrivatePostProfileWebsocketToken () has resolved, so every
// concurrent cold caller used to pass that gate, mint its own websocket_token
// and push its own authorize frame down the shared socket. the logic is
// inlined directly into authenticate (), so there is no helper method to
// unit-test: this file is the only guard, and no build/lint gate sees it -
// dropping the in-progress early-return or the flight settlement still
// compiles and only surfaces as duplicate token fetches (plus duplicate
// authorize frames) against a live venue

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

function assertCount (actual: number, expected: number, message: string) {
    // node's assert () is a TS assertion function, so asserting
    // state.fetches === 1 inline would narrow the property to the literal 1
    // and make a later === 2 check a compile error - narrowing a parameter
    // inside this helper keeps the call sites plain numbers
    assert (actual === expected, message + ' (expected ' + expected.toString () + ', got ' + actual.toString () + ')');
}

function flightClient (exchange: any) {
    // whitebit parks the flight on the client that already carries the
    // handshake (the live ws url), not on a dummy never-dialed client - it
    // already has a `client` local bound to that url and a second Client local
    // under a different name does not transpile to Java
    const url = exchange.urls['api']['ws'];
    const clients = exchange.clients;
    if (!(url in clients)) {
        return undefined;
    }
    return clients[url];
}

function flightCount (exchange: any) {
    // the flight IS the future: registered by the leader in client.futures
    // under 'authenticateFlight' before the first await and dropped by
    // client.resolve () / client.reject () when it settles
    const client = flightClient (exchange);
    if (client === undefined) {
        return 0;
    }
    if ('authenticateFlight' in client.futures) {
        return 1;
    }
    return 0;
}

function parkedResultCount (exchange: any) {
    // client.resolve () parks the value in pendingResults when no future is
    // registered - the leader always holds one, so this must stay empty or a
    // later caller would silently skip the flight
    const client = flightClient (exchange);
    if (client === undefined) {
        return 0;
    }
    return Object.keys (client.pendingResults).length;
}

function parkedRejectionCount (exchange: any) {
    // client.reject () parks the error in rejections when no future is
    // registered - a parked rejection would poison the FIRST waiter of the
    // next retry flight, so this must stay empty too
    const client = flightClient (exchange);
    if (client === undefined) {
        return 0;
    }
    return Object.keys (client.rejections).length;
}

function assertNoFlightResidue (exchange: any, label: string) {
    assertCount (flightCount (exchange), 0, label + ': a settled flight must leave no future behind');
    assertCount (parkedResultCount (exchange), 0, label + ': a settled flight must park no pendingResult');
    assertCount (parkedRejectionCount (exchange), 0, label + ': a settled flight must park no rejection');
}

function makeStubbedWhitebit (state: any) {
    const exchange = new ccxt.pro.whitebit ({
        'apiKey': 'test-api-key',
        'secret': 'test-secret',
    });
    // count token fetches and hold each response open long enough for the
    // concurrent callers to pile onto the flight
    (exchange as any).v4PrivatePostProfileWebsocketToken = async () => {
        state.fetches = state.fetches + 1;
        await sleep (50); // the race window
        return { 'websocket_token': 'WB-TOKEN-' + state.fetches.toString () };
    };
    // stub watch () so no socket is dialed: mirror the parts of
    // Exchange.watch () that authenticate () depends on (mint the future,
    // register the subscribeHash) and then land the venue's authorize ack the
    // way whitebit.handleAuthenticate () does
    (exchange as any).watch = async (url: string, messageHash: string, message: any = undefined, subscribeHash: any = undefined, subscription: any = undefined) => {
        state.authorizeFrames = state.authorizeFrames + 1;
        state.tokensSent.push (message['params'][0]);
        const client = exchange.client (url);
        const future = client.future (messageHash);
        if (!client.subscriptions[subscribeHash]) {
            client.subscriptions[subscribeHash] = subscription || true;
        }
        setTimeout (() => {
            // whitebit.handleAuthenticate (): future.resolve (1)
            if (messageHash in client.futures) {
                client.futures[messageHash].resolve (1);
            }
        }, 10);
        return await future;
    };
    return exchange;
}

function freshState () {
    // the tokens array is explicitly typed: an inferred never[] makes every
    // push () of the stubbed token a compile error under the repo tsconfig
    const tokensSent: string[] = [];
    return { 'fetches': 0, 'authorizeFrames': 0, 'tokensSent': tokensSent };
}

async function testWhitebitAuthenticateSingleFlight () {
    // N concurrent authenticate () calls on a cold instance must produce
    // exactly ONE websocket_token fetch and ONE authorize frame, and every
    // caller must still receive the authorized sentinel
    const state = freshState ();
    const exchange = makeStubbedWhitebit (state);
    const results = await Promise.all ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assertCount (state.fetches, 1, 'concurrent whitebit authenticates must elect exactly one leader websocket_token fetch');
    assertCount (state.authorizeFrames, 1, 'only the leader may send an authorize frame');
    assertCount (results.length, 5, 'every caller must return');
    for (let i = 0; i < results.length; i++) {
        assert (results[i] === 1, 'every caller must receive the authorized sentinel (caller ' + i.toString () + ' got ' + String (results[i]) + ')');
    }
    const client = flightClient (exchange);
    assert ('authenticated' in client.subscriptions, 'a successful handshake must leave the authenticated subscription registered');
    assertNoFlightResidue (exchange, 'resolved flight');
    // a warm call must not re-fetch: the authenticated subscription
    // short-circuits it
    const warm = await exchange.authenticate ();
    assert (warm === 1, 'a warm authenticate must still return the authorized sentinel');
    assertCount (state.fetches, 1, 'a warm authenticate must not fetch a second token');
    assertCount (state.authorizeFrames, 1, 'a warm authenticate must not send a second authorize frame');
    assertNoFlightResidue (exchange, 'warm call');
    await exchange.close ();
}

async function testWhitebitAuthenticateRestFailureRetries () {
    // the REST fetch failing must settle the flight for EVERY caller - the
    // waiters are parked on the shared flight future, so a leader that only
    // threw to its own caller would strand them - and must leave no residue so
    // the next caller re-leads instead of inheriting a dead flight
    const state = freshState ();
    const exchange = makeStubbedWhitebit (state);
    (exchange as any).v4PrivatePostProfileWebsocketToken = async () => {
        state.fetches = state.fetches + 1;
        await sleep (20);
        throw new AuthenticationError ('whitebit token fetch failed');
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assertCount (state.fetches, 1, 'a failing fetch must still be single-flighted');
    for (let i = 0; i < outcomes.length; i++) {
        assert (outcomes[i].status === 'rejected', 'the leader and every waiter must throw when the token fetch fails');
        assert ((outcomes[i] as any).reason instanceof AuthenticationError, 'every caller must observe the typed AuthenticationError');
    }
    await sleep (20); // an unhandled rejection would surface on this tick
    assertNoFlightResidue (exchange, 'rejected flight');
    // recovery: the next caller re-leads and completes the handshake. a
    // rejection parked under the flight hash would be re-thrown here by
    // client.future ()
    (exchange as any).v4PrivatePostProfileWebsocketToken = async () => {
        state.fetches = state.fetches + 1;
        return { 'websocket_token': 'WB-TOKEN-RETRY' };
    };
    const retried = await exchange.authenticate ();
    assert (retried === 1, 'a retry after a rejected flight must return the authorized sentinel');
    assertCount (state.fetches, 2, 'a retry after a rejected flight must re-lead and fetch again');
    assert (state.tokensSent[state.tokensSent.length - 1] === 'WB-TOKEN-RETRY', 'the retry must authorize with the freshly minted token');
    assertNoFlightResidue (exchange, 'retried flight');
    await exchange.close ();
}

async function testWhitebitAuthenticateEmptyTokenRejection () {
    // a hollow 200 must reject the flight before any authorize frame is sent:
    // sending `authorize` with an undefined token gets the socket dropped by
    // the venue with an opaque error instead of a typed local failure
    const state = freshState ();
    const exchange = makeStubbedWhitebit (state);
    (exchange as any).v4PrivatePostProfileWebsocketToken = async () => {
        state.fetches = state.fetches + 1;
        await sleep (10);
        return {}; // hollow response, no websocket_token
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assertCount (state.fetches, 1, 'a hollow response must still be single-flighted');
    assertCount (state.authorizeFrames, 0, 'an empty websocket_token must never be sent as an authorize frame');
    for (let i = 0; i < outcomes.length; i++) {
        assert (outcomes[i].status === 'rejected', 'both the leader and the waiter must throw on an empty websocket_token');
        assert ((outcomes[i] as any).reason instanceof AuthenticationError, 'an empty websocket_token must reject with AuthenticationError');
    }
    await sleep (20);
    assertNoFlightResidue (exchange, 'empty token flight');
    // recovery: a good response re-leads and completes
    (exchange as any).v4PrivatePostProfileWebsocketToken = async () => {
        state.fetches = state.fetches + 1;
        return { 'websocket_token': 'WB-TOKEN-AFTER-EMPTY' };
    };
    const retried = await exchange.authenticate ();
    assert (retried === 1, 'a retry after an empty token must return the authorized sentinel');
    assertCount (state.authorizeFrames, 1, 'the retry must send exactly one authorize frame');
    assertNoFlightResidue (exchange, 'empty token retried flight');
    await exchange.close ();
}

async function testWhitebitAuthenticateSoloLeaderRejection () {
    // an alone leader - the fetch fails before any waiter arrives - must throw
    // to its own caller, clear the slot, and NOT produce an unhandled promise
    // rejection (which would kill the process on the tick below). the trailing
    // `await future` is what attaches that handler
    const state = freshState ();
    const exchange = makeStubbedWhitebit (state);
    (exchange as any).v4PrivatePostProfileWebsocketToken = async () => {
        state.fetches = state.fetches + 1;
        throw new AuthenticationError ('whitebit solo leader failure');
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
    assertNoFlightResidue (exchange, 'solo rejected flight');
    // the next caller becomes a fresh leader
    (exchange as any).v4PrivatePostProfileWebsocketToken = async () => {
        state.fetches = state.fetches + 1;
        return { 'websocket_token': 'WB-TOKEN-SOLO-RETRY' };
    };
    const retried = await exchange.authenticate ();
    assert (retried === 1, 'the caller after a solo rejection must re-lead');
    assertCount (state.authorizeFrames, 1, 'exactly one authorize frame must be sent after the recovery');
    assert (state.tokensSent[state.tokensSent.length - 1] === 'WB-TOKEN-SOLO-RETRY', 'the recovery must authorize with the freshly minted token');
    assertNoFlightResidue (exchange, 'solo retried flight');
    await exchange.close ();
}

async function testWhitebitAuthenticateHandshakeFailureRetries () {
    // the authorize round-trip failing (a dropped dial / a rejected frame)
    // must also settle the flight AND drop the handshake state watch ()
    // registered, otherwise every later authenticate () would replay the
    // failure off subscriptions['authenticated']
    const state = freshState ();
    const exchange = makeStubbedWhitebit (state);
    (exchange as any).watch = async (url: string, messageHash: string, message: any = undefined, subscribeHash: any = undefined, subscription: any = undefined) => {
        state.authorizeFrames = state.authorizeFrames + 1;
        state.tokensSent.push (message['params'][0]);
        const failClient = exchange.client (url);
        const future = failClient.future (messageHash);
        if (!failClient.subscriptions[subscribeHash]) {
            failClient.subscriptions[subscribeHash] = subscription || true;
        }
        setTimeout (() => {
            // Exchange.watch () rejects the handshake future when the dial or
            // the send fails
            failClient.reject (new AuthenticationError ('whitebit authorize frame rejected'), messageHash);
        }, 10);
        return await future;
    };
    const outcomes = await Promise.allSettled ([
        exchange.authenticate (),
        exchange.authenticate (),
    ]);
    assertCount (state.fetches, 1, 'a failing handshake must still be single-flighted');
    assertCount (state.authorizeFrames, 1, 'a failing handshake must not be retried inside the flight');
    for (let i = 0; i < outcomes.length; i++) {
        assert (outcomes[i].status === 'rejected', 'the leader and every waiter must throw when the authorize round-trip fails');
        assert ((outcomes[i] as any).reason instanceof AuthenticationError, 'every caller must observe the typed AuthenticationError');
    }
    await sleep (20);
    assertNoFlightResidue (exchange, 'failed handshake flight');
    const client = flightClient (exchange);
    assert (!('authenticated' in client.subscriptions), 'a failed handshake must not leave the authenticated subscription behind');
    assert (!('authenticated' in client.futures), 'a failed handshake must not leave a rejected handshake future behind');
    // recovery: the next caller re-leads through a healthy handshake
    (exchange as any).watch = async (url: string, messageHash: string, message: any = undefined, subscribeHash: any = undefined, subscription: any = undefined) => {
        state.authorizeFrames = state.authorizeFrames + 1;
        state.tokensSent.push (message['params'][0]);
        const okClient = exchange.client (url);
        const future = okClient.future (messageHash);
        if (!okClient.subscriptions[subscribeHash]) {
            okClient.subscriptions[subscribeHash] = subscription || true;
        }
        setTimeout (() => {
            if (messageHash in okClient.futures) {
                okClient.futures[messageHash].resolve (1);
            }
        }, 10);
        return await future;
    };
    const retried = await exchange.authenticate ();
    assert (retried === 1, 'a retry after a failed handshake must return the authorized sentinel');
    assertCount (state.fetches, 2, 'a retry after a failed handshake must re-lead and fetch again');
    assertCount (state.authorizeFrames, 2, 'a retry after a failed handshake must send exactly one more authorize frame');
    assertNoFlightResidue (exchange, 'handshake retried flight');
    await exchange.close ();
}

async function testWsSingleFlightWiringWhitebit () {
    await testWhitebitAuthenticateSingleFlight ();
    await testWhitebitAuthenticateRestFailureRetries ();
    await testWhitebitAuthenticateEmptyTokenRejection ();
    await testWhitebitAuthenticateSoloLeaderRejection ();
    await testWhitebitAuthenticateHandshakeFailureRetries ();
}

export default testWsSingleFlightWiringWhitebit;
