
import testOrderBook from "./test.OrderBook.js";
import testCache from "./test.Cache.js";
import testClose from "./test.close.js";

async function testBaseWs () {
    testOrderBook ();
    testCache ();
    await testClose ();
}

export default testBaseWs;
