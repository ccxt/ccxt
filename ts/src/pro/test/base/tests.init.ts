
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testWsClose from "./test.close.js";
import testStream from "./test.Stream.js";

function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    testStream ();
    // todo : testWsClose ();
}

export default testBaseWs;
