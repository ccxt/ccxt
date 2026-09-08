import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the heartbeat cadence of
// ccxt.pro.deepcoin's public stream. the venue drops the connection after
// 20 s without a text 'ping' from the client
// (https://www.deepcoin.com/docs/publicWS/public); the base Client default
// keepAlive of 30 s sends the first ping at 30 s, so every public socket died
// at ~20.7 s with close 1000 'heartbeat timeout' (10,370 such events in 132 h
// on one deployment, a median of 50 s between them per process). nothing here
// dials a socket: this.client (url) only constructs the WsClient and the
// assertion is on the scheduler configuration it was built with

async function testDeepcoinPublicKeepAliveFitsTheHeartbeatWindow () {
    const exchange = new ccxt.pro.deepcoin ({});
    const heartbeatWindow = 20000;
    const urls = exchange.urls['api']['ws']['public'];
    for (const marketType of Object.keys (urls)) {
        const client = exchange.client (urls[marketType]);
        assert (client.keepAlive < heartbeatWindow, marketType + ': keepAlive ' + String (client.keepAlive) + ' ms must be shorter than the venue heartbeat window of ' + String (heartbeatWindow) + ' ms, otherwise the first ping is sent after the server has already closed the socket');
        assert (client.ping !== undefined, marketType + ': the client must carry the text ping the venue expects');
        assert (exchange.ping (client) === 'ping', marketType + ': the heartbeat must be the text frame \'ping\'');
        assert (client.startedConnecting === false, 'the test must never dial a socket');
    }
    await exchange.close ();
}

async function testDeepcoinHeartbeatWiring () {
    await testDeepcoinPublicKeepAliveFitsTheHeartbeatWindow ();
}

export default testDeepcoinHeartbeatWiring;
