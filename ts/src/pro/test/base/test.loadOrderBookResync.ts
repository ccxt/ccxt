import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// native ts test, intentionally not transpiled: exercises the promise
// rejection semantics of a failed loadOrderBook resync. the python sibling
// must assert the same outcome against CancelledError instead of a bare
// rejection (https://github.com/ccxt/ccxt/issues/30876)

async function testLoadOrderBookResyncRejects () {
    // when loadOrderBook cannot resync the orderbook, every pending future on
    // the shared client must be rejected with the error - cancelling them
    // raises a bare CancelledError in python, which a watch loop cannot tell
    // apart from its own task being stopped, silently killing every other
    // symbol subscribed on that connection
    const exchange: any = new ccxt.pro.kucoinfutures ();
    const url = 'wss://localhost:1234';
    const client = exchange.client (url);
    const symbol = 'BTC/USDT';
    exchange.orderbooks[symbol] = exchange.orderBook ();
    // every snapshot attempt fails, e.g. a 429 from the REST endpoint
    const failure = new Error ('429 Too Many Requests');
    exchange.fetchRestOrderBookSafe = async () => { throw failure; };
    const outcomes: any = {};
    const watch = async (name: string, messageHash: string) => {
        try {
            await client.future (messageHash);
            outcomes[name] = 'resolved';
        } catch (e) {
            outcomes[name] = e;
        }
    };
    const waitingA = watch ('A', 'orderbook:A');
    const waitingB = watch ('B', 'orderbook:B');
    await exchange.loadOrderBook (client, 'orderbook:A', symbol);
    await Promise.all ([ waitingA, waitingB ]);
    assert (outcomes['A'] === failure, 'the failed watcher must be rejected with the resync error');
    assert (outcomes['B'] === failure, 'the other watcher must be rejected with the error, not cancelled');
    assert (!(url in exchange.clients), 'the broken client must be dropped from the exchange');
    await exchange.close ();
}

export default testLoadOrderBookResyncRejects;
