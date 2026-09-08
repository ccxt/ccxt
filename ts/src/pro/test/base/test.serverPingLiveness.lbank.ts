import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled - pins the liveness bookkeeping
// in ccxt.pro.lbank.handlePing. lbank's server drives the heartbeat: it sends
// { action: 'ping', ping: '<id>' } and closes the socket if the matching pong
// does not arrive within a minute, but it does not reliably answer the RFC 6455
// ping frames the base Client sends from onPingInterval. if handlePing answers
// the server without recording the inbound ping as liveness, client.lastPong
// never advances past the first onPingInterval tick and the
// keepAlive * maxPingPongMisses check in Client.onPingInterval raises
// RequestTimeout against a socket that is still streaming depth updates.
// nothing here dials a socket: this.client (url) only constructs the WsClient
// and client.send is stubbed to capture the outbound pong

function stubbedClient (exchange: any) {
    const url = exchange.urls['api']['ws'];
    const client = exchange.client (url);
    const sent: any[] = [];
    client.send = async (message: any) => {
        sent.push (message);
    };
    return { client, sent };
}

async function testLbankServerPingRefreshesLastPong () {
    const exchange = new ccxt.pro.lbank ({});
    const { client, sent } = stubbedClient (exchange);
    // simulate the state onPingInterval leaves behind on a socket whose RFC
    // ping frames go unanswered: lastPong pinned in the past, well beyond the
    // keepAlive * maxPingPongMisses window
    const stale = exchange.milliseconds () - (client.keepAlive * client.maxPingPongMisses) - 1000;
    client.lastPong = stale;
    const before = exchange.milliseconds ();
    exchange.handleMessage (client, { 'ping': 'a13a939c-5f25-4e06-9981-93cb3b890707', 'action': 'ping' });
    // handleMessage spawns handlePing on a timer - let it run
    await new Promise ((resolve) => setTimeout (resolve, 20));
    assert (client.lastPong !== stale, 'a server ping must refresh client.lastPong');
    assert (client.lastPong >= before, 'client.lastPong must move to the time the server ping arrived');
    assert (sent.length === 1, 'the server ping must be answered exactly once');
    assert (sent[0]['action'] === 'pong' && sent[0]['pong'] === 'a13a939c-5f25-4e06-9981-93cb3b890707', 'the pong must echo the ping id');
    assert (client.startedConnecting === false, 'the test must never dial a socket');
    // the keepalive check onPingInterval performs must now pass
    const now = exchange.milliseconds ();
    assert ((client.lastPong + client.keepAlive * client.maxPingPongMisses) >= now, 'after a server ping the keepalive window must not be expired');
    await exchange.close ();
}

async function testLbankServerPingLivenessWiring () {
    await testLbankServerPingRefreshesLastPong ();
}

export default testLbankServerPingLivenessWiring;
