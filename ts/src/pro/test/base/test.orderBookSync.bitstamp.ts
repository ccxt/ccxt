// NO_AUTO_TRANSPILE
import assert from 'assert';
import bitstamp from '../../bitstamp.js';

// Native integration tests: stub only HTTP and transport, exercise the real
// subscription handler, alignment, shared snapshot loader and book side stores.
// Prices are synthetic; the long timestamps are from the reported capture.
function setup () {
    const exchange = new bitstamp ({});
    exchange.setMarkets ([ exchange.safeMarketStructure ({
        'id': 'etheur', 'symbol': 'ETH/EUR', 'base': 'ETH', 'quote': 'EUR', 'type': 'spot', 'spot': true,
    }) ]);
    const state: any = { resolved: [], rejected: [], closed: 0 };
    const client: any = {
        url: 'wss://ws.bitstamp.net',
        resolve: (book: any, hash: string) => { state.resolved.push ({ book, hash }); },
        reject: (error: any) => { state.rejected.push (error); },
        close: () => { state.closed++; },
    };
    exchange.clients[client.url] = client;
    exchange.handleOrderBookSubscription (client, { channel: 'diff_order_book_etheur' });
    return { exchange, client, state };
}

function delta (nonce: any, bids: any[] = [], asks: any[] = []) {
    return { microtimestamp: nonce, timestamp: '1793892103', bids, asks };
}

function deliver (exchange: any, client: any, update: any) {
    exchange.handleOrderBook (client, { channel: 'diff_order_book_etheur', data: update });
}

function snapshot (nonce: any = 1793892102687378) {
    return { symbol: 'ETH/EUR', nonce, timestamp: 1793892102000, bids: [ [ 100, 1 ], [ 98, 2 ] ], asks: [ [ 101, 1 ] ] };
}

async function testReplay () {
    const { exchange, client, state } = setup ();
    deliver (exchange, client, delta ('1793892101601610'));
    let release: any;
    exchange.fetchOrderBook = async () => await new Promise ((resolve) => { release = resolve; }) as any;
    const loading = exchange.loadOrderBook (client, 'orderbook:ETH/EUR', 'ETH/EUR');
    // These messages arrive while HTTP is in flight. The snapshot is between
    // the first cached update and the deletion: an exact match never occurs.
    deliver (exchange, client, delta ('1793892102831075', [ [ '100', '0' ] ]));
    deliver (exchange, client, delta ('1793892103139095', [], [ [ '99', '1' ] ]));
    release (snapshot ());
    await loading;
    const book = exchange.orderbooks['ETH/EUR'];
    deliver (exchange, client, delta ('1793892103446268', [], [ [ '99', '1' ] ]));
    assert.deepEqual (Array.from (book.bids), [ [ 98, 2 ] ]);
    assert.deepEqual (Array.from (book.asks), [ [ 99, 1 ], [ 101, 1 ] ]);
    assert (book.bids[0][0] < book.asks[0][0]);
    assert.equal (book.nonce, 1793892103446268);
    assert.equal (book.cache.length, 0);
    assert.equal (state.resolved.length, 2);
    assert.equal (state.resolved[0].book, book);
    assert.equal (state.resolved[0].hash, 'orderbook:ETH/EUR');
    // Stale and duplicate messages must not resurrect a deleted bid.
    for (const nonce of [ '1793892102831075', '1793892103446268', undefined, 'invalid', 0, -1 ]) {
        deliver (exchange, client, delta (nonce, [ [ '100', '9' ] ]));
    }
    assert.deepEqual (Array.from (book.bids), [ [ 98, 2 ] ]);
    assert.equal (state.resolved.length, 2);
    // A fresh subscription clears nonce/cache before fetching a new snapshot.
    exchange.handleOrderBookSubscription (client, { channel: 'diff_order_book_etheur' });
    assert.equal (book.nonce, undefined);
    assert.equal (book.cache.length, 0);
    deliver (exchange, client, delta ('1793892103446268'));
    exchange.fetchOrderBook = async () => snapshot (1793892103446268) as any;
    await exchange.loadOrderBook (client, 'orderbook:ETH/EUR', 'ETH/EUR');
    assert.deepEqual (Array.from (book.bids), [ [ 100, 1 ], [ 98, 2 ] ]);
    assert.deepEqual (Array.from (book.asks), [ [ 101, 1 ] ]);
}

async function testAddDelete () {
    const { exchange, client } = setup ();
    const book = exchange.orderbooks['ETH/EUR'];
    book.cache.push (delta ('1793892101601610'));
    book.cache.push (delta ('1793892102831075', [ [ '2043.35', '4.360149' ] ]));
    book.cache.push (delta ('1793892103139095', [ [ '2043.35', '0.000000' ] ]));
    exchange.fetchOrderBook = async () => ({ ...snapshot (), bids: [ [ 2043.35, 1 ], [ 2042, 2 ] ], asks: [ [ 2044, 1 ] ] }) as any;
    await exchange.loadOrderBook (client, 'orderbook:ETH/EUR', 'ETH/EUR');
    deliver (exchange, client, delta ('1793892103446268', [], [ [ '2043', '1' ] ]));
    assert.deepEqual (Array.from (book.bids), [ [ 2042, 2 ] ]);
    assert (book.bids[0][0] < book.asks[0][0]);
}

async function testAlignmentAndRetry () {
    const { exchange, client, state } = setup ();
    const cases: any[] = [
        [ 20, [], -1 ], [ 9, [ 10, 20 ], -1 ],
        [ 10, [ 10, 20 ], 1 ], [ 15, [ 10, 20, 30 ], 1 ],
        [ 20, [ 10, 20, 20, 30 ], 3 ], [ 40, [ 10, 20, 30 ], 3 ],
        [ undefined, [ 10 ], -1 ], [ 'invalid', [ 10 ], -1 ], [ 0, [ 10 ], -1 ],
        [ 20, [ undefined, 30 ], -1 ], [ 20, [ 10, 'invalid' ], -1 ],
        [ 20, [ 10, 30, undefined ], -1 ], [ 20, [ 0, 30 ], -1 ],
    ];
    for (const [ nonce, nonces, expected ] of cases) {
        assert.equal (exchange.getCacheIndex ({ nonce }, nonces.map ((value: any) => delta (value))), expected, JSON.stringify ([ nonce, nonces ]));
    }
    const book = exchange.orderbooks['ETH/EUR'];
    book.cache.push (delta (10));
    book.cache.push (delta (30, [ [ '100', '0' ] ]));
    // Retry a snapshot behind the first cached delta, then replay a newer one.
    let fetches = 0;
    exchange.fetchOrderBook = async () => snapshot ((++fetches === 1) ? 9 : 20) as any;
    await exchange.loadOrderBook (client, 'orderbook:ETH/EUR', 'ETH/EUR');
    assert.equal (fetches, 2);
    assert.equal (book.nonce, 30);
    assert.deepEqual (Array.from (book.bids), [ [ 98, 2 ] ]);
    // Exhaustion closes/drops the transport and clears the broken cache.
    exchange.handleOrderBookSubscription (client, { channel: 'diff_order_book_etheur' });
    book.cache.push (delta (30));
    exchange.fetchOrderBook = async () => snapshot (20) as any;
    await exchange.loadOrderBook (client, 'orderbook:ETH/EUR', 'ETH/EUR');
    assert.equal (state.rejected.length, 1);
    assert.equal (state.closed, 1);
    assert.equal (exchange.clients[client.url], undefined);
    assert.equal (exchange.orderbooks['ETH/EUR'].nonce, undefined);
    assert.equal (exchange.orderbooks['ETH/EUR'].cache.length, 0);
}

async function testTriggeringDelta () {
    const { exchange, client } = setup ();
    exchange.options['watchOrderBook']['snapshotDelay'] = 1;
    const book = exchange.orderbooks['ETH/EUR'];
    let loading: any;
    // spawn must observe the triggering update already in the cache. PHP can
    // finish the loader inline when the mocked HTTP promise is already settled.
    exchange.spawn = (method: any, ...args: any[]) => {
        assert.equal (book.cache.length, 2);
        assert.equal (book.cache[1]['microtimestamp'], 30);
        loading = method.call (exchange, ...args);
        return loading;
    };
    exchange.fetchOrderBook = async () => snapshot (20) as any;
    deliver (exchange, client, delta (10));
    deliver (exchange, client, delta (30, [ [ '100', '0' ] ]));
    await loading;
    assert.deepEqual (Array.from (book.bids), [ [ 98, 2 ] ]);
    assert.equal (book.nonce, 30);
    assert.equal (book.cache.length, 0);
}

async function testBufferedDuplicates () {
    const { exchange, client } = setup ();
    const book = exchange.orderbooks['ETH/EUR'];
    book.cache.push (delta (10));
    book.cache.push (delta (30, [ [ '100', '0' ] ]));
    book.cache.push (delta (30, [ [ '100', '9' ] ]));
    book.cache.push (delta (25, [ [ '100', '9' ] ]));
    book.cache.push (delta (40, [], [ [ '99', '1' ] ]));
    exchange.fetchOrderBook = async () => snapshot (20) as any;
    await exchange.loadOrderBook (client, 'orderbook:ETH/EUR', 'ETH/EUR');
    assert.deepEqual (Array.from (book.bids), [ [ 98, 2 ] ]);
    assert.equal (book.nonce, 40);
}

async function testBitstampOrderBookSync () {
    await testReplay ();
    await testAddDelete ();
    await testAlignmentAndRetry ();
    await testTriggeringDelta ();
    await testBufferedDuplicates ();
}

export default testBitstampOrderBookSync;
