// @NO_AUTO_TRANSPILE
// OrderRouter — watch a route, and ask the service about itself.
//
// Two things this covers that the other order-router examples do not:
//
//   1. watchRoute: the same request as fetchRoute, held open over a WebSocket.
//      The service pushes a fresh RouteResult whenever any market the route
//      depends on moves — every leg of every candidate path, so a bridged route
//      does not miss half the price changes that alter its answer.
//
//   2. The read-only endpoints: whether the router is up, whether it can
//      actually price anything yet, which commit is deployed, and the exact
//      cached book a route was ranked on.
//
// This example PLACES NOTHING. watchRoute is read-only — it asks for a
// recommendation repeatedly, it does not trade.
//
// Usage:
//   ORDER_ROUTER_API_KEY=or_live_... npm run tsBuild && node js/examples/ts/order-router-stream.js
//
// Get a key from https://docs.ccxt.com/router
import ccxt from '../../js/ccxt.js';
async function main() {
    const apiKey = process.env.ORDER_ROUTER_API_KEY;
    if (apiKey === undefined || apiKey === '') {
        console.log('set ORDER_ROUTER_API_KEY (get one at https://docs.ccxt.com/router)');
        return;
    }
    const router = new ccxt.OrderRouter({ 'apiKey': apiKey });
    // ---------------------------------------------------------------------
    // Is it up, and can it price anything?
    // ---------------------------------------------------------------------
    // These are different questions and the difference matters. /health answers
    // 200 from the first millisecond of boot, before a single websocket has
    // connected — gate a deploy on it and traffic arrives at a router whose only
    // possible answer is "all books stale". fetchReadiness is the one to gate on.
    //
    // Both are unauthenticated, so they work before a key is injectable.
    const health = await router.fetchHealth();
    console.log('health   ', health['status'], 'up for', Math.round(health['uptimeSec']), 'seconds');
    // NOT an exception when the answer is no: the service replies 503 carrying
    // the same body it returns on 200, and a caller asking "are you ready" needs
    // the counts that say why not.
    const readiness = await router.fetchReadiness();
    console.log('readiness', readiness['status'], readiness['freshCount'], 'of', readiness['bookCount'], 'books fresh');
    if (readiness['status'] !== 'ready') {
        console.log('the router cannot rank a route yet — try again shortly');
        return;
    }
    // Build provenance. /health answers 200 from the OLD process just as happily
    // when a deploy silently no-ops; commit is the only field that tells them apart.
    const version = await router.fetchVersion();
    console.log('version  ', version['version'], version['commitShort']);
    // ---------------------------------------------------------------------
    // Watch a route
    // ---------------------------------------------------------------------
    // watchRoute BLOCKS for the life of the stream, and the hook is how you read
    // it. Return 'stop' to close the socket cleanly; the call then returns the
    // last route it saw.
    //
    // Two endpoint rules differ from fetchRoute, and neither is this client's
    // choice:
    //
    //   - balances and balanceMode are REFUSED. A socket is held open for minutes
    //     and carries no channel to update the holdings it was opened with, so
    //     every frame after the first would price a portfolio you may already have
    //     traded away. Use fetchRoute when you need a funded-aware route.
    //   - includeQuotes defaults to FALSE here and true on REST. One socket
    //     measured 658 frames/sec at 9.3KB, almost all of it that diagnostic.
    let frames = 0;
    const last = await router.watchRoute('USDT', 'BTC', {
        'amountIn': 20,
        'strategy': 'split_optimal',
    }, (route) => {
        frames = frames + 1;
        console.log('frame', frames, 'rate', route['effectiveRate'], 'impactBps', route['impactBps'], 'hops', route['hops'].length);
        // Stop after a handful so the example terminates. A real consumer would
        // decide on the numbers — say, stop once the price impact is acceptable.
        return (frames >= 5) ? 'stop' : 'continue';
    });
    // Every frame is stamped exactly as fetchRoute stamps its answer, so the last
    // one can go straight into the plan builder and still be checked against the
    // question this client actually asked.
    console.log('stopped after', frames, 'frames; last rate', last['effectiveRate']);
    // A route the stream pushed plans like any other. Nothing is placed: execute
    // defaults to dry_run, and this example never calls it.
    const plan = router.buildExecutionPlan(last, {});
    console.log('a plan from the last frame has', plan['stepCount'], 'steps over', plan['hopCount'], 'hops');
    // ---------------------------------------------------------------------
    // The exact book a route was ranked on
    // ---------------------------------------------------------------------
    // This is what makes a surprising route auditable: not "the router says
    // mexc", but the depth it actually walked.
    const firstStep = plan['steps'][0];
    if (firstStep !== undefined) {
        const book = await router.fetchCachedOrderBook(firstStep['exchangeId'], firstStep['symbol']);
        console.log('cached book on', firstStep['exchangeId'], firstStep['symbol'], '— best bid', book['bids'][0], 'best ask', book['asks'][0]);
    }
    // Which venues the router is actually connected to. A venue can hold an open
    // socket while its subscription is silently dead, so read the per-venue update
    // age rather than the connected flag alone.
    const venues = await router.fetchExchangesStatus();
    console.log('the router is tracking', venues.length, 'venues');
}
main();
