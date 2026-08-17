
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testWsClientRetention from "./test.clientRetention.js";
import testWsSingleFlight from "./test.singleFlight.js";
import testWsSingleFlightPrimitives from "./test.singleFlightPrimitives.js";

async function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    // todo : testWsClose ();
    await testWsClientRetention ();
    await testWsSingleFlight ();
    await testWsSingleFlightPrimitives ();
}

export default testBaseWs;
