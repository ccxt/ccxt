
import testWsOrderBook from "./test.OrderBook.js";
import testWsCache from "./test.Cache.js";
import testWsClose from "./test.close.js";
import testStream from "./test.Stream.js";

function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    testStream ();
    // todo : testWsClose ();
}

export default testBaseWs;
