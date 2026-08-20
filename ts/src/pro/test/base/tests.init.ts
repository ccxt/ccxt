
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testWsCacheNative from "./test.cacheNative.js";
import testWsClientRetention from "./test.clientRetention.js";
import testWsSingleFlight from "./test.singleFlight.js";
import testWsSingleFlightPrimitives from "./test.singleFlightPrimitives.js";
import testWsSingleFlightWiring from "./test.singleFlightWiring.js";

async function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    testWsCacheNative (); // js-only: removeAt () has no port equivalent
    // todo : testWsClose ();
    await testWsClientRetention ();
    await testWsSingleFlight ();
    await testWsSingleFlightPrimitives ();
    await testWsSingleFlightWiring ();
}

export default testBaseWs;
