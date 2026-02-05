// @ts-nocheck
import ccxt from '../../ts/ccxt.js';
import path from 'path';
import fs from 'fs';
import { Agent } from 'https'

// AUTO-TRANSPILE //

console.log ('CCXT Version:', ccxt.version);

// ------------------------------------------------------------------------------

const httpsAgent = new Agent ({
    ecdhCurve: 'auto',
    keepAlive: true,
})

async function example () {
    const keysLocal = path.resolve ('keys.local.json')
    const keysFile = fs.existsSync (keysLocal) ? keysLocal : null
    const settingsFile  = fs.readFileSync(keysFile, 'utf-8');
    let allSettings = JSON.parse(settingsFile.toString())
    const swyftxSettings = allSettings.swyftx || {};

    const exchange = new ccxt.swyftx ()
    exchange.verbose = true;

    const symbol = 'BTC/AUD';

    await exchange.loadMarkets ();

    const market = exchange.market (symbol);

    try {
        // Fetch Ticker
        console.log ('Fetching ticker for', symbol);
        const tickerData = await exchange.fetchTicker (symbol);
        console.log ('Ticker for', symbol, ':', tickerData);

        // Fetch Tickers
        console.log ('Fetching tickers for all markets');
        const tickersData = await exchange.fetchTickers ();
        console.log ('Tickers for all markets:', Object.keys(tickersData).length, 'markets found.'); // Log count to avoid overly long output

        // Fetch OHLCV
        console.log ('Fetching OHLCV for', symbol);
        const ohlcvData = await exchange.fetchOHLCV (symbol, '1m');
        console.log ('OHLCV for', symbol, ':', ohlcvData);

        // Fetch trading limits for a specific symbol
        console.log ('Fetching trading limits for', symbol);
        const tradingLimitsSymbol = await exchange.fetchTradingLimits (symbol);
        console.log ('Trading Limits for', symbol, ':', tradingLimitsSymbol);

        // Fetch trading limits for all symbols
        console.log ('Fetching trading limits for all markets');
        const tradingLimitsAll = await exchange.fetchTradingLimits ();
        console.log ('Trading Limits for all markets:', Object.keys(tradingLimitsAll).length, 'markets found.'); // Log count to avoid overly long output

    } catch (e) {
        console.log (e.toString ());
    }
}


await example ();
