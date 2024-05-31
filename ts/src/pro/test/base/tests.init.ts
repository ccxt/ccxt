
import testOrderBook from "./test.OrderBook.js";
import testCache from "./test.Cache.js";
import testClose from "./test.close.js";

function testBaseWs () {
    testOrderBook ();
    testCache ();
    testClose ();
}

export default testBaseWs;
