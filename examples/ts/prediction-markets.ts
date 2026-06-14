// Prediction markets example
//
// Demonstrates the PredictionExchange base class: prediction-market exchanges
// (Polymarket, Kalshi, Limitless, Myriad, Hyperliquid) live under `ccxt.prediction`
// and extend PredictionExchange, which adds events/outcomes helpers on top of Exchange.

import ccxt from '../../js/ccxt.js';

async function main () {
    const exchange = new ccxt.prediction.polymarket ();
    console.log ('id:', exchange.id);
    console.log ('isPrediction:', exchange.isPrediction ());
    try {
        const markets = await exchange.fetchMarkets ();
        console.log ('fetched markets:', markets.length);
    } catch (e) {
        console.log ('fetchMarkets skipped (offline/geo):', (e as Error).constructor.name);
    }
}

main ();
