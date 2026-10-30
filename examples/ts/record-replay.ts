import path from 'path';
import { fileURLToPath } from 'url';
import ccxt from '../../js/ccxt.js';

// run:  npx tsx examples/ts/record-replay.ts
//
// 1. records a few public binance calls into a jsonl session file (real network)
// 2. replays the same calls from that file with networking blocked and no keys
// 3. shows what happens when the replayed program diverges from the recording

const file = path.join (path.dirname (fileURLToPath (import.meta.url)), 'record-replay-session.jsonl');
const symbol = 'BTC/USDT';

function newExchange () {
    // eslint-disable-next-line import/no-named-as-default-member
    return new ccxt.binance ({ 'enableRateLimit': false, 'options': { 'fetchMarkets': [ 'spot' ], 'fetchCurrencies': false }});
}

async function record () {
    const recorder = await ccxt.Recorder.open ({ file });
    const exchange = newExchange ();
    recorder.attach (exchange, { 'instanceId': 'binance-spot' }); // attach before loadMarkets
    try {
        await exchange.loadMarkets ();
        const ticker = await exchange.fetchTicker (symbol);
        const orderbook = await exchange.fetchOrderBook (symbol, 5);
        console.log ('recorded ', symbol, 'last', ticker['last'], 'best bid', orderbook['bids'][0][0], 'best ask', orderbook['asks'][0][0]);
    } finally {
        await recorder.close ();
        await exchange.close ();
    }
    console.log ('recorder status', recorder.status);
}

async function replay () {
    const replayer = await ccxt.Replay.open ({ file });
    const exchange = newExchange (); // no credentials, no network
    replayer.attach (exchange, { 'instanceId': 'binance-spot' });
    try {
        await exchange.loadMarkets ();
        const ticker = await exchange.fetchTicker (symbol);
        const orderbook = await exchange.fetchOrderBook (symbol, 5);
        console.log ('replayed ', symbol, 'last', ticker['last'], 'best bid', orderbook['bids'][0][0], 'best ask', orderbook['asks'][0][0]);
        await replayer.assertConsumed ();
        // the recording has no third call, so this fails instead of hitting the network
        try {
            await exchange.fetchOrderBook (symbol, 5);
        } catch (e) {
            console.log ('diverging call rejected:', (e as Error).constructor.name);
        }
    } finally {
        console.log ('replay report', replayer.report ());
        await replayer.close ();
        await exchange.close ();
    }
}

async function example () {
    await record ();
    console.log ('session written to', file);
    await replay ();
    console.log ('inspect', await ccxt.Replay.inspect (file));
}

await example ();
