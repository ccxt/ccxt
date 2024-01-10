const ccxt = require ('./dist/ccxt.cjs');
const ccxtBundle = require ('./dist/ccxt.bundle.cjs');
const HttpsProxyAgent = require('https-proxy-agent');
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
// Simple test just to make sure that the CJS code works

const symbol = 'BTC/USDT:USDT';
async function main() {
    try {
        // proxy
        // test cjs version
        const exchange = new ccxt.gate({});
        const ticker = await exchange.fetchTicker(symbol);
        assert(ticker !== undefined);
        assert(ticker['symbol'] === symbol);
        log.bright.green('[CJS Code] OK');
        // test cjs bundle version
        const exchangeBundle = new ccxtBundle.gate({});
        const tickeBundle = await exchangeBundle.fetchTicker(symbol);
        assert(tickeBundle !== undefined);
        assert(tickeBundle['symbol'] === symbol);
        log.bright.green('[CJS Bundle Code] OK');
        process.exit(0);
    } catch (e) {
        log.bright.red('[CJS Code] Error: ' + e);
        process.exit (1);
    }
}

main()