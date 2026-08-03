import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
function testBaseWs() {
    testWsOrderBook();
    testWsCache();
    // todo : testWsClose ();
}
export default testBaseWs;
