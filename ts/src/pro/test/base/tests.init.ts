
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testReconnectTrades from "./test.reconnectTrades.js";

async function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    await testReconnectTrades ();
    // todo : testWsClose ();
}

export default testBaseWs;
