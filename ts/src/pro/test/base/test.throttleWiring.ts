// NO_AUTO_TRANSPILE
import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the WS throttle wiring
// built by Exchange.client (). two distinct regressions live on this one line
// and neither is visible to tsc, lint or any other gate:
//
//   1. no 'throttle' key at all (master before ccxt/ccxt#30086). watch () and
//      watchMultiple () guard the throttled branch with
//      `this.enableRateLimit && (client.throttle !== undefined)`, so an absent
//      key silently routes every outbound subscribe through the unthrottled
//      client.send () path. enableRateLimit defaults to true, so this affected
//      every ccxt.pro js/ts user while the allocated per-client Throttler on
//      the next line was read by nothing.
//   2. binding the exchange-wide Exchange.throttle instead. that restores a
//      callable client.throttle but points it at this.throttler - the same
//      bucket fetch () drains - so a burst of subscribes stalls unrelated REST
//      calls by N x rateLimit ms. python, php and go all pass a DEDICATED
//      Throttler under this key (python/ccxt/async_support/base/exchange.py,
//      php/pro/ClientTrait.php, go/v4/exchange.go), so the shared-bucket
//      variant would also make js the odd port out.
//
// an identity check alone cannot separate those two, since variant 2 can still
// leave a fresh instance under 'throttler'. the assertion below is behavioural:
// driving client.throttle () must move the per-client bucket and leave the REST
// bucket untouched. nothing here dials a socket - client () only constructs the
// WsClient from the options object under test.

function throttlerTokens (throttler: any) {
    // the leaky bucket's token count is the observable that says WHICH bucket a
    // throttle () call was accounted against
    return throttler.config['tokens'];
}

// WsClient declares 'throttle' but not the adjacent 'throttler' instance (both
// arrive through Object.assign in its constructor), so read the client as any
async function testWsClientGetsACallableThrottle () {
    const exchange = new ccxt.pro.binance ({});
    const client = exchange.client ('wss://ws-throttle-wiring.test/one') as any;
    // the exact shape of the guard in watch () / watchMultiple ()
    assert (client.throttle !== undefined, 'client.throttle must be defined, otherwise watch () skips the throttled branch and sends subscribes unpaced');
    assert (typeof client.throttle === 'function', 'client.throttle must be callable - watch () invokes it as client.throttle (cost).then (...)');
    assert (client.throttler !== undefined, 'the per-client Throttler must be reachable on the client');
    assert (client.startedConnecting === false, 'the test must never dial a socket');
    await exchange.close ();
}

async function testWsThrottleDrainsTheClientBucketNotTheRestBucket () {
    const exchange = new ccxt.pro.binance ({});
    const client = exchange.client ('wss://ws-throttle-wiring.test/two') as any;
    assert (client.throttler !== exchange.throttler, 'the WS client must own a Throttler separate from the exchange-wide REST throttler');
    const wsTokensBefore = throttlerTokens (client.throttler);
    const restTokensBefore = throttlerTokens (exchange.throttler);
    await client.throttle (1);
    const wsTokensAfter = throttlerTokens (client.throttler);
    const restTokensAfter = throttlerTokens (exchange.throttler);
    assert (wsTokensAfter < wsTokensBefore, 'client.throttle () must draw from the per-client bucket, tokens went from ' + String (wsTokensBefore) + ' to ' + String (wsTokensAfter));
    assert (restTokensAfter === restTokensBefore, 'client.throttle () must not draw from the REST bucket that fetch () uses, tokens went from ' + String (restTokensBefore) + ' to ' + String (restTokensAfter) + ' - binding Exchange.throttle here makes subscribe bursts stall unrelated REST calls');
    await exchange.close ();
}

async function testEachWsClientOwnsItsThrottler () {
    const exchange = new ccxt.pro.binance ({});
    const first = exchange.client ('wss://ws-throttle-wiring.test/three') as any;
    const second = exchange.client ('wss://ws-throttle-wiring.test/four') as any;
    assert (first.throttler !== second.throttler, 'each WS client must own its Throttler so one stream cannot pace another');
    assert (first.throttle !== second.throttle, 'each WS client must carry its own bound throttle function');
    // the bound function and the exposed instance must be the same object, so a
    // reader of client.throttler is looking at the bucket client.throttle uses
    const tokensBefore = throttlerTokens (first.throttler);
    await first.throttle (1);
    assert (throttlerTokens (first.throttler) < tokensBefore, 'client.throttle must be bound to the very Throttler exposed as client.throttler');
    assert (throttlerTokens (second.throttler) === tokensBefore, 'throttling one client must not move another client bucket');
    await exchange.close ();
}

async function testWsThrottleWiring () {
    await testWsClientGetsACallableThrottle ();
    await testWsThrottleDrainsTheClientBucketNotTheRestBucket ();
    await testEachWsClientOwnsItsThrottler ();
}

export default testWsThrottleWiring;
