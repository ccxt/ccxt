const ccxt = require ('./dist/ccxt.cjs');
const log = require ('ololog');
const ansi = require ('ansicolor').nice;
const assert = require ('assert');
const fs = require ('fs');
// ----------------------------------------------------------------------------
process.on ('uncaughtException', (e) => {
    console.log (e, e.stack); process.exit (1);
});
process.on ('unhandledRejection', (e) => {
    console.log (e, e.stack); process.exit (1);
});

// ----------------------------------------------------------------------------
// Simple test just to make sure that the CJS code works and it's updated

const CJS_ENTRY_FILE = './dist/cjs/ccxt.js';
const EXCHANGE_FILE = './dist/cjs/src/binance.js'
const CJS_BUNDLE_FILE = './dist/ccxt.bundle.cjs';
const BROWSER_BUNDLE_FILE = './dist/ccxt.browser.js';

const symbol = 'BTC/USDT:USDT';

function assertGeneratedFilesAreRecent() {
    const now = new Date().getTime();
    const filesToCheck = [CJS_ENTRY_FILE, CJS_BUNDLE_FILE, BROWSER_BUNDLE_FILE, EXCHANGE_FILE];
    for (const file of filesToCheck) {
        var stats = fs.statSync(file);
        var mtime = stats.mtimeMs;
        const diffInSeconds = (now - mtime) / 1000;
        const diffInHours = diffInSeconds / 3600;
        if (diffInHours > 12) {
            log.bright.red('[CJS][Browser][OUT-OF-SYNC] File is outdaded: ' + file);
            process.exit (1);
        }
    }
    log.bright.green('[CJS][Browser] Files are updated');
}

async function main() {
    try {
        assertGeneratedFilesAreRecent();
        // proxy
        // test cjs version
        const exchange = new ccxt.gate({});
        const ticker = await exchange.fetchTicker(symbol);
        assert(ticker !== undefined);
        assert(ticker['symbol'] === symbol);
        log.bright.green('[CJS Code] OK');
        // test cjs bundle version
        // const exchangeBundle = new ccxtBundle.gate({});
        // const tickeBundle = await exchangeBundle.fetchTicker(symbol);
        // assert(tickeBundle !== undefined);
        // assert(tickeBundle['symbol'] === symbol);
        log.bright.green('[CJS Bundle Code] OK');
        process.exit(0);
    } catch (e) {
        log.bright.red('[CJS Code] Error: ' + e);
        process.exit (1);
    }
}

main()