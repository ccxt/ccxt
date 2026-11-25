#!/usr/bin/env node
// Exchange reachability check, to run ON THE PRODUCTION MACHINE before launch and after a
// move: some exchanges block some datacenter regions (binance and bybit from the US, for
// instance), and an exchange that cannot be reached must come off the EXCHANGES allowlist
// rather than fail for every user.
//
// For each exchange: load markets, fetch one BTC ticker, print one table row. Public
// endpoints only — no keys, no orders. Exit code 1 if any exchange failed.
//
//   node scripts/check-exchanges.mjs                     # EXCHANGES from the environment, or the default list
//   node scripts/check-exchanges.mjs kraken okx          # these only
//   docker compose run --rm hosted node /app/check-exchanges.mjs   # from the production image
import * as ccxtNamespace from 'ccxt';

// keep in step with DEFAULT_EXCHANGES in src/config.ts (test/unit.test.ts checks it)
const DEFAULT_EXCHANGES = [ 'binance', 'bitfinex', 'bitget', 'bitstamp', 'bybit', 'coinbase', 'gate', 'kraken', 'kucoin', 'okx' ];
const PREFERRED_SYMBOLS = [ 'BTC/USDT', 'BTC/USD', 'BTC/USDC', 'BTC/EUR' ];
const TIMEOUT_MS = 15000;

// the default export is the canonical shape (classes by id, version), as in ts/ccxt-loader.ts
const ccxt = ccxtNamespace.default ?? ccxtNamespace;
const fromArgs = process.argv.slice (2).filter ((arg) => !arg.startsWith ('-'));
const fromEnv = (process.env.EXCHANGES ?? '').split (',').map ((id) => id.trim ()).filter ((id) => id.length > 0);
const ids = (fromArgs.length > 0) ? fromArgs : ((fromEnv.length > 0) ? fromEnv : DEFAULT_EXCHANGES);

function short (error) {
    // the exchange's own message can be a whole HTML page: keep the class and the first line
    const text = String (error?.message ?? error).replace (/https?:\/\/\S+/g, '[url]').replace (/\s+/g, ' ');
    return String (error?.constructor?.name ?? 'Error') + ': ' + text.slice (0, 140);
}

async function check (id) {
    const row = { 'exchange': id, 'markets': '-', 'loadMs': '-', 'symbol': '-', 'last': '-', 'tickerMs': '-', 'result': 'FAIL', 'error': '' };
    if (typeof ccxt[id] !== 'function') {
        row.error = 'not a ccxt exchange id';
        return row;
    }
    const exchange = new ccxt[id] ({ 'timeout': TIMEOUT_MS, 'enableRateLimit': true });
    try {
        let started = Date.now ();
        await exchange.loadMarkets ();
        row.loadMs = String (Date.now () - started);
        row.markets = String (Object.keys (exchange.markets ?? {}).length);
        const symbol = PREFERRED_SYMBOLS.find ((candidate) => exchange.markets?.[candidate] !== undefined) ?? exchange.symbols?.[0];
        row.symbol = String (symbol);
        started = Date.now ();
        const ticker = await exchange.fetchTicker (symbol);
        row.tickerMs = String (Date.now () - started);
        row.last = String (ticker?.last ?? ticker?.close ?? '?');
        row.result = 'ok';
    } catch (error) {
        row.error = short (error);
    } finally {
        await exchange.close?.().catch?.(() => {});
    }
    return row;
}

console.log ('ccxt ' + ccxt.version + ', node ' + process.version + ', ' + new Date ().toISOString ());
// a few at a time: this is a check, not a load test
const rows = [];
const queue = [ ...ids ];
await Promise.all (Array.from ({ 'length': Math.min (3, queue.length) }, async () => {
    while (queue.length > 0) {
        rows.push (await check (queue.shift ()));
    }
}));
rows.sort ((a, b) => a.exchange.localeCompare (b.exchange));
const columns = [ 'exchange', 'result', 'markets', 'loadMs', 'symbol', 'last', 'tickerMs', 'error' ];
const widths = columns.map ((column) => Math.max (column.length, ...rows.map ((row) => row[column].length)));
const line = (values) => values.map ((value, index) => value.padEnd (widths[index])).join ('  ').trimEnd ();
console.log (line (columns));
console.log (line (widths.map ((width) => '-'.repeat (width))));
for (const row of rows) {
    console.log (line (columns.map ((column) => row[column])));
}
const failed = rows.filter ((row) => row.result !== 'ok').map ((row) => row.exchange);
if (failed.length > 0) {
    console.log ('\nunreachable from this machine: ' + failed.join (', ') + ' — remove from EXCHANGES before launch');
    process.exitCode = 1;
} else {
    console.log ('\nall ' + rows.length + ' exchanges reachable');
}
