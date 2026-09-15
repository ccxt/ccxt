
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testWsCacheNative from "./test.cacheNative.js";
import testWsSingleFlight from "./test.singleFlight.js";
import testWsSingleFlightWiring from "./test.singleFlightWiring.js";
import testWsKeepAliveTimeout from "./test.keepAliveTimeout.js";
import testWsClientThrottleWiring from "./test.clientThrottleWiring.js";
import testBingxPositionTransitions from "./test.bingxPositionTransitions.js";

async function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    testWsCacheNative (); // js-only: removeAt () has no port equivalent
    testBingxPositionTransitions (); // js-only: native handler/cache regression test
    // todo : testWsClose ();
    await testWsSingleFlight ();
    await testWsSingleFlightWiring ();
    await testWsKeepAliveTimeout ();
    await testWsClientThrottleWiring ();
}

export default testBaseWs;
