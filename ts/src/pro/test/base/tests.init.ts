
import testWsOrderBook from "./test.orderBook.js";
import testWsCache from "./test.cache.js";
import testWsCacheNative from "./test.cacheNative.js";
import testWsSingleFlight from "./test.singleFlight.js";
import testWsSingleFlightWiring from "./test.singleFlightWiring.js";
import testLbankServerPingLivenessWiring from "./test.serverPingLiveness.lbank.js";
import testWsKeepAliveTimeout from "./test.keepAliveTimeout.js";
import testDeepcoinHeartbeatWiring from "./test.heartbeat.deepcoin.js";
import testWsSnapshotReadiness from "./test.wsSnapshotReadiness.js";
import testWsClientThrottleWiring from "./test.clientThrottleWiring.js";

async function testBaseWs () {
    testWsOrderBook ();
    testWsCache ();
    testWsCacheNative (); // js-only: removeAt () has no port equivalent
    testWsSnapshotReadiness (); // native JS test of the static WS transport helper
    // todo : testWsClose ();
    await testWsSingleFlight ();
    await testWsSingleFlightWiring ();
    await testLbankServerPingLivenessWiring ();
    await testWsKeepAliveTimeout ();
    await testDeepcoinHeartbeatWiring ();
    await testWsClientThrottleWiring ();
}

export default testBaseWs;
