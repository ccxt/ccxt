
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testWsClientRetention from "./test.clientRetention.js";

async function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    // todo : testWsClose ();
    await testWsClientRetention ();
}

export default testBaseWs;
