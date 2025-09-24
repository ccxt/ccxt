
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testWsClose from "./test.close.js";

function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    // todo : testWsClose ();
}

export default testBaseWs;
