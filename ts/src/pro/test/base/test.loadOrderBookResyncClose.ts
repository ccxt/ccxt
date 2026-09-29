// NO_AUTO_TRANSPILE
import assert from 'assert';
import { WebSocketServer } from 'ws';
import Exchange from '../../../base/Exchange.js';
import { RateLimitExceeded } from '../../../base/errors.js';

// NO_AUTO_TRANSPILE
// native ts test, intentionally not transpiled - pins the failure branch of
// Exchange.loadOrderBook: when the REST snapshot cannot be fetched, the
// connection must be torn down, not just dropped from exchange.clients, or the
// abandoned socket keeps dispatching frames into the shared caches next to the
// replacement that the next watch call dials, see
// https://github.com/ccxt/ccxt/issues/30669. the cleanup must also not evict
// a healthy replacement registered under the same url. a local ws server keeps
// the test offline and the snapshot request is stubbed.

const symbol = 'BTC/USDT';
const orderbookHash = 'orderbook:' + symbol;
const otherHash = 'trades:' + symbol;

function sleep (ms: number) {
    return new Promise ((resolve) => setTimeout (resolve, ms));
}

async function withServer (fn: (url: string, server: WebSocketServer) => Promise<void>) {
    const server = new WebSocketServer ({ 'port': 0, 'host': '127.0.0.1' });
    await new Promise ((resolve) => server.once ('listening', resolve));
    const address = server.address () as any;
    const url = 'ws://127.0.0.1:' + address.port;
    try {
        await fn (url, server);
    } finally {
        for (const socket of server.clients) {
            socket.terminate ();
        }
        await new Promise ((resolve) => server.close (resolve));
    }
}

async function createExchange () {
    const exchange: any = new Exchange ({ 'id': 'resynctest' });
    // the local server is plain ws://, which exchange.client () only dials
    // through a preloaded http agent
    await exchange.loadHttpProxyAgent ();
    // every snapshot attempt fails, as a 429 from the REST endpoint would
    exchange.fetchRestOrderBookSafe = async () => {
        throw new RateLimitExceeded ('resynctest 429 Too Many Requests');
    };
    return exchange;
}

async function connectClient (exchange: any, url: string) {
    const client = exchange.client (url);
    await client.connect ();
    assert (client.isOpen (), 'precondition: the socket must be open');
    return client;
}

function track (future: any) {
    const state: any = { 'rejectedWith': undefined };
    future.catch ((e: any) => { state['rejectedWith'] = e; });
    return state;
}

function spyClose (client: any) {
    const calls: any = { 'count': 0 };
    const original = client.close.bind (client);
    client.close = () => {
        calls['count'] += 1;
        return original ();
    };
    return calls;
}

async function testFailedResyncClosesTheConnection () {
    await withServer (async (url, server) => {
        const exchange = await createExchange ();
        const client = await connectClient (exchange, url);
        const closeCalls = spyClose (client);
        exchange.orderbooks[symbol] = exchange.orderBook ();
        const orderbookWatcher = track (client.future (orderbookHash));
        const otherWatcher = track (client.future (otherHash));
        await exchange.loadOrderBook (client, orderbookHash, symbol);
        // let the close handshake and the rejections settle
        await sleep (200);
        assert (orderbookWatcher['rejectedWith'] instanceof RateLimitExceeded, 'the orderbook watcher must be rejected with the snapshot error, got ' + String (orderbookWatcher['rejectedWith']));
        assert (otherWatcher['rejectedWith'] !== undefined, 'an unrelated watcher on the same connection must be rejected too, not left hanging on a dropped client');
        assert (closeCalls['count'] === 1, 'client.close () must run exactly once, ran ' + String (closeCalls['count']));
        assert (client.connection.readyState === 3, 'the socket must reach CLOSED, got readyState ' + String (client.connection.readyState));
        for (const serverSide of server.clients) {
            assert (serverSide.readyState !== 1, 'the server must not keep an OPEN socket for the failed client');
        }
        assert (!(url in exchange.clients), 'the failed client must be unregistered from exchange.clients');
        assert (!exchange.orderbooks[symbol].cache.length, 'the cached orderbook must be reset');
        await exchange.close ();
    });
}

async function testFailedResyncKeepsAReplacement () {
    // the guard: a healthy client registered under the same url in the meantime
    // (a concurrent watch call dialed a replacement) must survive the cleanup
    // of the failed one
    await withServer (async (url) => {
        const exchange = await createExchange ();
        const stale = await connectClient (exchange, url);
        delete exchange.clients[url];
        const replacement = await connectClient (exchange, url);
        assert (replacement !== stale, 'precondition: the replacement must be a new client');
        exchange.orderbooks[symbol] = exchange.orderBook ();
        const staleWatcher = track (stale.future (orderbookHash));
        const replacementWatcher = track (replacement.future (otherHash));
        await exchange.loadOrderBook (stale, orderbookHash, symbol);
        await sleep (200);
        assert (staleWatcher['rejectedWith'] instanceof RateLimitExceeded, 'the failed client watcher must be rejected');
        assert (exchange.clients[url] === replacement, 'the replacement registered under the same url must not be evicted');
        assert (stale.connection.readyState === 3, 'the failed client socket must reach CLOSED');
        assert (replacement.isOpen (), 'the replacement socket must stay open');
        assert (replacement.error === undefined, 'no error must be recorded on the replacement');
        assert (replacementWatcher['rejectedWith'] === undefined, 'a watcher on the replacement must not be rejected');
        await exchange.close ();
    });
}

async function testWsLoadOrderBookResyncClose () {
    await testFailedResyncClosesTheConnection ();
    await testFailedResyncKeepsAReplacement ();
}

export default testWsLoadOrderBookResyncClose;
