import assert from 'assert';
import binanceusdm from '../../binanceusdm.js';
import WebSocketServer from '../custom/server.js';
import { NetworkError } from '../../../base/errors.js';
import { sleep } from '../../../base/functions.js';

// ----------------------------------------------------------------------------

const symbol = 'BTC/USDT:USDT';

function marketStructure () {
    return {
        'id': 'BTCUSDT',
        'lowercaseId': 'btcusdt',
        'symbol': symbol,
        'base': 'BTC',
        'quote': 'USDT',
        'settle': 'USDT',
        'baseId': 'BTC',
        'quoteId': 'USDT',
        'settleId': 'USDT',
        'type': 'swap',
        'spot': false,
        'swap': true,
        'future': false,
        'option': false,
        'linear': true,
        'inverse': false,
        'contract': true,
    };
}

function tradeFrame (id: string, timestamp: number, price: string) {
    return {
        'e': 'trade',
        'E': timestamp,
        's': 'BTCUSDT',
        't': id,
        'p': price,
        'q': '1',
        'b': 1,
        'a': 2,
        'T': timestamp,
        'm': false,
        'M': true,
    };
}

function restTrade (id: string, timestamp: number, price: string) {
    return {
        'id': id,
        'timestamp': timestamp,
        'datetime': new Date (timestamp).toISOString (),
        'symbol': symbol,
        'side': 'sell',
        'price': price,
        'amount': '1',
        'cost': price,
        'info': { 'a': id, 'p': price, 'q': '1', 'T': timestamp, 'm': false },
    };
}

function tradeIds (trades: any[]) {
    const ids: string[] = [];
    for (let i = 0; i < trades.length; i++) {
        ids.push (trades[i]['id']);
    }
    return ids;
}

function assertTradeIds (trades: any[], expectedIds: string[], label: string) {
    const ids = tradeIds (trades);
    assert (ids.length === expectedIds.length, label + ': expected trades ' + JSON.stringify (expectedIds) + ', got ' + JSON.stringify (ids));
    for (let i = 0; i < expectedIds.length; i++) {
        assert (ids[i] === expectedIds[i], label + ': expected trade at index ' + i + ' to be ' + expectedIds[i] + ', got ' + ids[i]);
    }
}

async function waitForServer (server: any) {
    while (server.server.address () === null) {
        await sleep (10);
    }
}

async function assertRejectsNetworkError (promise: Promise<any>, label: string) {
    try {
        await promise;
        assert.fail (label + ': expected a NetworkError rejection but the watch resolved');
    } catch (e: any) {
        assert (e instanceof NetworkError, label + ': expected a NetworkError, got ' + e.constructor.name + ': ' + e.message);
    }
}

async function createExchange (server: any, options: any = { 'gapFillTrades': true }) {
    const port = server.server.address ().port;
    const exchange: any = new binanceusdm ({
        'options': options,
    });
    exchange.urls['api']['ws']['future'] = 'ws://127.0.0.1:' + port + '/ws';
    exchange.setMarkets ([ marketStructure () ]);
    // the ws:// (non-ssl) local test url requires the node http agent to be loaded
    await exchange.loadHttpProxyAgent ();
    return exchange;
}

// ----------------------------------------------------------------------------

// scenario 1: the REST backfill is delayed, so the post-reconnect live trades arrive
// while the backfill is in flight and must be buffered and merged with the gap trades.
// a fetched gap trade at or past the merge boundary (the first buffered live trade) is dropped.
async function testScenarioBuffered () {
    const server: any = new WebSocketServer ({ 'port': 0 });
    server.onEcho = (ws: any, message: any) => {
        if (server.connectionCount === 1) {
            // connection 1: pre-disconnect live trades, then terminate the socket (close code 1006)
            setTimeout (() => server.send (tradeFrame ('p1', 1000, '100')), 20);
            setTimeout (() => server.send (tradeFrame ('p2', 2000, '101')), 40);
            setTimeout (() => server.terminateAll (), 100);
        } else if (server.connectionCount === 2) {
            // connection 2: post-reconnect live trades arrive while the backfill is pending
            setTimeout (() => server.send (tradeFrame ('l1', 4000, '104')), 10);
            setTimeout (() => server.send (tradeFrame ('l2', 5000, '105')), 20);
        }
    };
    await waitForServer (server);
    const exchange = await createExchange (server);
    // the last pre-disconnect trade has timestamp 2000, so the gap window starts at 2001
    // boundary = l1 (timestamp 4000), the first buffered live trade; g2 (timestamp 5000) is at or
    // past the boundary and is dropped, so the buffered live trade l2 is never duplicated
    exchange.fetchTrades = async (fetchSymbol: any, since: any, limit: any, params: any) => {
        await sleep (150);
        const result: any[] = [];
        const gapTrades = [ restTrade ('g1', 3000, '102'), restTrade ('g2', 5000, '103') ];
        for (let i = 0; i < gapTrades.length; i++) {
            const trade = gapTrades[i];
            if ((since === undefined) || (trade['timestamp'] >= since)) {
                result.push (trade);
            }
        }
        return result;
    };
    try {
        // the first watch resolves with the pre-disconnect trades
        const watch1 = await exchange.watchTrades (symbol);
        assertTradeIds (watch1, [ 'p1' ], 'buffered watch1');
        const watch2 = await exchange.watchTrades (symbol);
        assertTradeIds (watch2, [ 'p2' ], 'buffered watch2');
        // the pending watch rejects when the server terminates the connection with code 1006
        await assertRejectsNetworkError (exchange.watchTrades (symbol), 'buffered watch3');
        // the re-watch triggers the backfill: the first post-reconnect resolution contains
        // the gap trades plus the buffered live trades, in chronological order, without duplicates
        const watch4 = await exchange.watchTrades (symbol);
        assertTradeIds (watch4, [ 'g1', 'l1', 'l2' ], 'buffered watch4 (gap + live)');
        assert (tradeIds (watch4).length === 3, 'buffered watch4: expected no duplicates, got ' + JSON.stringify (tradeIds (watch4)));
        for (let i = 1; i < watch4.length; i++) {
            assert (watch4[i]['timestamp'] > watch4[i - 1]['timestamp'], 'buffered watch4: timestamps not in chronological order');
        }
        // the follow-up watch returns only fresh trades, no re-delivery of the gap trades
        server.send (tradeFrame ('l3', 6000, '106'));
        const watch5 = await exchange.watchTrades (symbol);
        assertTradeIds (watch5, [ 'l3' ], 'buffered watch5 (fresh only)');
        // the cache is contiguous: pre-disconnect + gap + live trades
        assertTradeIds (exchange.trades[symbol], [ 'p1', 'p2', 'g1', 'l1', 'l2', 'l3' ], 'buffered cache');
    } finally {
        await exchange.close ();
    }
}

// ----------------------------------------------------------------------------

// scenario 2: the REST backfill is fast, so no live trade arrives during the fetch and the
// first post-reconnect resolution contains only the gap trades; a live trade that arrives
// after the merge is delivered by the next watch call without re-delivering the gap trades
async function testScenarioFast () {
    const server: any = new WebSocketServer ({ 'port': 0 });
    server.onEcho = (ws: any, message: any) => {
        if (server.connectionCount === 1) {
            setTimeout (() => server.send (tradeFrame ('p1', 1000, '100')), 20);
            setTimeout (() => server.send (tradeFrame ('p2', 2000, '101')), 40);
            setTimeout (() => server.terminateAll (), 100);
        } else if (server.connectionCount === 2) {
            // the live trade arrives only after the fast backfill has already resolved
            setTimeout (() => server.send (tradeFrame ('l1', 4000, '104')), 200);
        }
    };
    await waitForServer (server);
    const exchange = await createExchange (server);
    exchange.fetchTrades = async (fetchSymbol: any, since: any, limit: any, params: any) => {
        await sleep (20);
        const result: any[] = [];
        const gapTrades = [ restTrade ('g1', 3000, '102'), restTrade ('g2', 4000, '103') ];
        for (let i = 0; i < gapTrades.length; i++) {
            const trade = gapTrades[i];
            if ((since === undefined) || (trade['timestamp'] >= since)) {
                result.push (trade);
            }
        }
        return result;
    };
    try {
        const watch1 = await exchange.watchTrades (symbol);
        assertTradeIds (watch1, [ 'p1' ], 'fast watch1');
        const watch2 = await exchange.watchTrades (symbol);
        assertTradeIds (watch2, [ 'p2' ], 'fast watch2');
        await assertRejectsNetworkError (exchange.watchTrades (symbol), 'fast watch3');
        // the re-watch resolves with the gap trades only
        const watch4 = await exchange.watchTrades (symbol);
        assertTradeIds (watch4, [ 'g1', 'g2' ], 'fast watch4 (gap only)');
    } finally {
        await exchange.close ();
    }
}

// ----------------------------------------------------------------------------

// scenario 3: the REST backfill is slow and returns a fetched gap trade (g2) at or past the merge
// boundary (the first buffered live trade l1), which is not in the buffer because the ws stream has
// not delivered it yet. the boundary rule drops g2, leaving it to the live stream, so the first
// post-reconnect resolution stays ordered and the next watch delivers g2 on its own.
async function testScenarioBoundary () {
    const server: any = new WebSocketServer ({ 'port': 0 });
    server.onEcho = (ws: any, message: any) => {
        if (server.connectionCount === 1) {
            // connection 1: pre-disconnect live trades, then terminate the socket (close code 1006)
            setTimeout (() => server.send (tradeFrame ('p1', 1000, '100')), 20);
            setTimeout (() => server.send (tradeFrame ('p2', 2000, '101')), 40);
            setTimeout (() => server.terminateAll (), 100);
        } else if (server.connectionCount === 2) {
            // connection 2: the first post-reconnect live trade arrives while the slow backfill is pending
            setTimeout (() => server.send (tradeFrame ('l1', 4000, '104')), 10);
        }
    };
    await waitForServer (server);
    const exchange = await createExchange (server);
    // the last pre-disconnect trade has timestamp 2000, so the gap window starts at 2001
    // the slow stub returns g2 (timestamp 5000) which is past the boundary (l1, timestamp 4000)
    exchange.fetchTrades = async (fetchSymbol: any, since: any, limit: any, params: any) => {
        await sleep (100);
        const result: any[] = [];
        const gapTrades = [ restTrade ('g1', 3000, '102'), restTrade ('g2', 5000, '103') ];
        for (let i = 0; i < gapTrades.length; i++) {
            const trade = gapTrades[i];
            if ((since === undefined) || (trade['timestamp'] >= since)) {
                result.push (trade);
            }
        }
        return result;
    };
    try {
        const watch1 = await exchange.watchTrades (symbol);
        assertTradeIds (watch1, [ 'p1' ], 'boundary watch1');
        const watch2 = await exchange.watchTrades (symbol);
        assertTradeIds (watch2, [ 'p2' ], 'boundary watch2');
        await assertRejectsNetworkError (exchange.watchTrades (symbol), 'boundary watch3');
        // the backfill resolves with only the gap trades inside [since, boundary): g2 is at or past
        // the boundary and is left to the live stream, so it must not appear here
        const watch4 = await exchange.watchTrades (symbol);
        assertTradeIds (watch4, [ 'g1', 'l1' ], 'boundary watch4 (gap inside window + live)');
        // the ws stream delivers g2 on its own and the next watch returns it alone
        server.send (tradeFrame ('g2', 5000, '103'));
        const watch5 = await exchange.watchTrades (symbol);
        assertTradeIds (watch5, [ 'g2' ], 'boundary watch5 (g2 delivered by the live stream)');
        // the cache is contiguous and in chronological order
        assertTradeIds (exchange.trades[symbol], [ 'p1', 'p2', 'g1', 'l1', 'g2' ], 'boundary cache');
    } finally {
        await exchange.close ();
    }
}

// ----------------------------------------------------------------------------

// scenario 4: the option is off (default), so a reconnect must NOT trigger any REST backfill and
// the behavior is exactly the pre-existing one: the post-reconnect watch returns only the live
// trades and fetchTrades is never called
async function testScenarioDefaultOff () {
    const server: any = new WebSocketServer ({ 'port': 0 });
    server.onEcho = (ws: any, message: any) => {
        if (server.connectionCount === 1) {
            // connection 1: pre-disconnect live trades, then terminate the socket (close code 1006)
            setTimeout (() => server.send (tradeFrame ('p1', 1000, '100')), 20);
            setTimeout (() => server.send (tradeFrame ('p2', 2000, '101')), 40);
            setTimeout (() => server.terminateAll (), 100);
        } else if (server.connectionCount === 2) {
            // connection 2: the post-reconnect live trade, delivered with no backfill in flight
            setTimeout (() => server.send (tradeFrame ('l1', 4000, '104')), 10);
        }
    };
    await waitForServer (server);
    // no gapFillTrades option set: the describe() default (false) applies
    const exchange = await createExchange (server, {});
    let fetchTradesCalled = false;
    exchange.fetchTrades = async (fetchSymbol: any, since: any, limit: any, params: any) => {
        fetchTradesCalled = true;
        throw new Error ('fetchTrades must never be called when gapFillTrades is off');
    };
    try {
        const watch1 = await exchange.watchTrades (symbol);
        assertTradeIds (watch1, [ 'p1' ], 'default-off watch1');
        const watch2 = await exchange.watchTrades (symbol);
        assertTradeIds (watch2, [ 'p2' ], 'default-off watch2');
        await assertRejectsNetworkError (exchange.watchTrades (symbol), 'default-off watch3');
        // with the option off the reconnect delivers only the live trade, no REST backfill
        const watch4 = await exchange.watchTrades (symbol);
        assertTradeIds (watch4, [ 'l1' ], 'default-off watch4 (live only, no gap backfill)');
        assert (fetchTradesCalled === false, 'default-off: fetchTrades must never be called when gapFillTrades is off');
        // the cache holds only live trades, the gap left by the reconnect is not filled
        assertTradeIds (exchange.trades[symbol], [ 'p1', 'p2', 'l1' ], 'default-off cache (live only)');
    } finally {
        await exchange.close ();
    }
}

// ----------------------------------------------------------------------------

async function testReconnectTrades () {
    await testScenarioBuffered ();
    await testScenarioFast ();
    await testScenarioBoundary ();
    await testScenarioDefaultOff ();
    console.log ('reconnect trades tests passed!');
}

export default testReconnectTrades;
