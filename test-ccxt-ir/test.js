import ccxt from "ccxt-ir";
const exchanges = [
    'kraken', 'kucoin', 'binance', 'okx', 'cryptocom', 'huobi',
    'bitget', 'gateio', 'bigone', 'ascendex', 'upbit', 'lbank', 'gemini',
    'whitebit', 'bitrue', 'mexc', 'bitstamp', 'binanceus', 'phemex',
    'digifinex', 'blockchaincom', 'coinsph', 'indodax', 'bitso',
    'exmo', 'bitbank', 'probit', 'bitmart', 'p2b', 'coinbase',
    'bingx', 'latoken', 'coinex', 'mercado', 'yobit', 'oceanex',
    'luno', 'cex', 'bitvavo', 'bitopro', 'poloniex', 'coinmate',
    'coinmetro', 'bitmex', 'bitfinex'
  ];
//ace and wazirx and currencycom are deprecated
async function testExchanges() {
    for (const id of exchanges) {
        const exchangeClass = ccxt[id];
        if (!exchangeClass) {
            console.log(`❌ Exchange not found in ccxt: ${id}`);
            continue;
        }

        const exchange = new exchangeClass({ enableRateLimit: true });

        try {
            // Fetch markets
            const markets = await exchange.loadMarkets();
            const tickers = Object.keys(await exchange.fetchTickers());

            if (tickers.length > 0) {
                console.log(`✅ ${id} OK - markets: ${Object.keys(markets).length}, tickers: ${tickers.length}`);
            } else {
                console.log(`⚠️ ${id} returned no tickers`);
            }
        } catch (err) {
            console.log(`❌ ${id} failed: ${err.message}`);
        }
    }
}

testExchanges();
