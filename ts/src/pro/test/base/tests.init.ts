
import testWsOrderBook from "./test.OrderBook.js";
import testWsCache from "./test.Cache.js";
import testWsClose from "./test.close.js";

function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    // todo : testWsClose ();
}

export default testBaseWs;
