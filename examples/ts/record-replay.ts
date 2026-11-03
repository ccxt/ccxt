import path from 'path';
import { fileURLToPath } from 'url';
import ccxt from '../../js/ccxt.js';

// run:  npx tsx examples/ts/record-replay.ts
//
// 1. records a few public binance calls into a jsonl session file (real network)
// 2. replays the same calls from that file with networking blocked and no keys
// 3. replays again with injected faults to exercise the error handling of the user code
// 4. shows what happens when the replayed program diverges from the recording

const file = path.join (path.dirname (fileURLToPath (import.meta.url)), 'record-replay-session.jsonl');
const symbol = 'BTC/USDT';

function newExchange () {
    return new ccxt.binance ({ 'enableRateLimit': false, 'options': { 'fetchMarkets': [ 'spot' ], 'fetchCurrencies': false }});
}

// the "user code": the same program runs live, on a clean replay and on a faulted replay
async function userCode (exchange: any) {
    await exchange.loadMarkets ();
    try {
        const ticker = await exchange.fetchTicker (symbol);
        console.log ('  ', symbol, 'last', ticker['last']);
    } catch (e) {
        if (e instanceof ccxt.RequestTimeout) {
            console.log ('   ticker timed out, user code would reconcile or retry here:', (e as Error).message);
        } else {
            throw e;
        }
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const orderbook = await exchange.fetchOrderBook (symbol, 5);
            console.log ('  ', symbol, 'best bid', orderbook['bids'][0][0], 'best ask', orderbook['asks'][0][0], (attempt > 1) ? '(attempt ' + attempt + ')' : '');
            break;
        } catch (e) {
            const retryable = (e instanceof ccxt.DDoSProtection) || (e instanceof ccxt.RequestTimeout);
            if (retryable && attempt < 3) {
                console.log ('   order book attempt', attempt, 'failed, user code backs off and retries:', (e as Error).constructor.name, (e as Error).message);
            } else {
                throw e;
            }
        }
    }
}

async function record () {
    const recorder = await ccxt.Recorder.open ({ file });
    const exchange = newExchange ();
    recorder.attach (exchange, { 'instanceId': 'binance-spot' }); // attach before loadMarkets
    try {
        console.log ('recording');
        await userCode (exchange);
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
        console.log ('replaying');
        await userCode (exchange);
        await replayer.assertConsumed ();
        // the recording has no third call, so this fails instead of hitting the network
        try {
            await exchange.fetchOrderBook (symbol, 5);
        } catch (e) {
            console.log ('   diverging call rejected:', (e as Error).constructor.name);
        }
    } finally {
        console.log ('replay report', replayer.report ());
        await replayer.close ();
        await exchange.close ();
    }
}

async function replayWithFaults () {
    // the recording is untouched, the rules only change what the selected unified calls return
    const replayer = await ccxt.Replay.open ({
        file,
        'faults': [
            {
                'id': 'ticker-timeout',
                'select': { 'unifiedMethod': 'fetchTicker' },
                'action': { 'kind': 'transportError', 'errorKind': 'timeout' },
            },
            {
                'id': 'orderbook-fails-twice',
                'select': { 'unifiedMethod': 'fetchOrderBook' },
                'actions': [ // one outcome per successive call: 429 first, then a timeout, then the recording
                    { 'kind': 'replaceHttpResponse', 'status': 429, 'statusText': 'Too Many Requests', 'headers': { 'content-type': 'application/json', 'retry-after': '1' }, 'bodyText': '{"code":-1003,"msg":"Too many requests."}' },
                    { 'kind': 'transportError', 'errorKind': 'timeout' },
                ],
                'consume': false, // the recorded order book stays available, so the third attempt succeeds
            },
        ],
    });
    const exchange = newExchange ();
    replayer.attach (exchange, { 'instanceId': 'binance-spot' });
    try {
        console.log ('replaying with injected faults');
        await userCode (exchange);
        await replayer.assertConsumed ();
    } finally {
        console.log ('applied faults', replayer.report ()['faults']);
        await replayer.close ();
        await exchange.close ();
    }
}

async function example () {
    await record ();
    console.log ('session written to', file);
    await replay ();
    await replayWithFaults ();
    console.log ('inspect', await ccxt.Replay.inspect (file));
}

await example ();
