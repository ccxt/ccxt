const ccxt = require ('./dist/ccxt.bundle.cjs');
const log = require ('ololog');
const ansi = require ('ansicolor').nice;
const assert = require ('assert');
// ----------------------------------------------------------------------------
process.on ('uncaughtException', (e) => {
    console.log (e, e.stack); process.exit (1);
});
process.on ('unhandledRejection', (e) => {
    console.log (e, e.stack); process.exit (1);
});

// ----------------------------------------------------------------------------
// Simple test just to make sure that the CJS bundle works

const symbol = 'BTC/USDT:USDT';
async function main() {
    try {
        const exchange = new ccxt.bybit({});
        const ticker = await exchange.fetchTicker(symbol);
        assert(ticker !== undefined);
        assert(ticker['symbol'] === symbol);
        log.bright.green('[CJS Bundle] OK');
        process.exit(0);
    } catch (e) {
        log.bright.red('[CJS Bundle] Error: ' + e);
        process.exit (1);
    }
}

main()