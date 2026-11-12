import ccxt from '../../js/ccxt.js';

// Compare crypto prices across the InteractiveBrokers crypto providers (PAXOS, ZEROHASH, ...) through the Client Portal Gateway.
// (you can alternatively use oauth 1.0 if your account allows it)
//
// IBKR lists the same coin once per provider, so each one is a separate market with the provider in the symbol:
// BTC.PAXOS/USD, BTC.ZEROHASH/USD, ...
//
// Prerequisites:
// 1. download and run the client portal gateway locally
//    https://www.interactivebrokers.com/en/trading/ib-api.php#client-portal
// 2. log in at https://localhost:5000 (or any other port) in a browser (the session is reused by ccxt)

async function example () {
    const exchange = new ccxt.interactivebrokers ({
        'options': {
            'useGateway': true,
            // 'accountId': 'XXXX', // optional, defaults to the first account of the session
            'gatewayUrl': 'https://localhost:5001',
            'fetchMarkets': {
                'types': [ 'crypto' ], // only load crypto (skip stocks/forex/futures) for a faster loadMarkets
                'cryptoSpotSymbols': [ 'BTC', 'ETH', 'SOL', 'LTC' ], // the coins to look up, on every provider
            },
        },
    });
    const markets = await exchange.loadMarkets ();
    // group the markets by coin: { 'BTC/USD': { 'PAXOS': 'BTC.PAXOS/USD', 'ZEROHASH': 'BTC.ZEROHASH/USD' } }
    const symbolsByPair: Record<string, Record<string, string>> = {};
    const symbols: string[] = [];
    for (const market of Object.values (markets)) {
        if (!market['spot'] || market['info']['assetClass'] !== 'CRYPTO') {
            continue;
        }
        const provider = market['info']['listingExchange'];
        const pair = market['base'] + '/' + market['quote'];
        if (!(pair in symbolsByPair)) {
            symbolsByPair[pair] = {};
        }
        symbolsByPair[pair][provider] = market['symbol'];
        symbols.push (market['symbol']);
    }
    console.log ('Loaded', symbols.length, 'crypto markets:', symbols.join (', '));
    const tickers = await exchange.fetchTickers (symbols);
    for (const pair of Object.keys (symbolsByPair)) {
        const rows = [];
        for (const [ provider, symbol ] of Object.entries (symbolsByPair[pair])) {
            const ticker = tickers[symbol];
            if (ticker === undefined) {
                continue;
            }
            const bid = ticker['bid'];
            const ask = ticker['ask'];
            const hasBidAsk = (bid !== undefined) && (ask !== undefined);
            // without a market data subscription for the provider, IBKR only returns the mark price (no bid/ask/last)
            const price = hasBidAsk ? (bid + ask) / 2 : (ticker['markPrice'] ?? ticker['last']);
            rows.push ({
                'provider': provider,
                'symbol': symbol,
                'bid': bid,
                'ask': ask,
                'last': ticker['last'],
                'mark': ticker['markPrice'],
                'spread %': hasBidAsk ? Number (((ask - bid) / ask * 100).toFixed (4)) : undefined,
                'price': price, // mid price when quoted, the mark price otherwise
            });
        }
        console.log ('\n' + pair);
        console.table (rows);
        const priced = rows.filter ((row) => row['price'] !== undefined);
        if (priced.length < 2) {
            console.log ('not enough providers pricing', pair, 'to compare');
            continue;
        }
        const lowest = priced.reduce ((a, b) => ((b['price'] < a['price']) ? b : a));
        const highest = priced.reduce ((a, b) => ((b['price'] > a['price']) ? b : a));
        const difference = (highest['price'] - lowest['price']) / lowest['price'] * 100;
        console.log ('lowest price: ', lowest['provider'], '@', lowest['price']);
        console.log ('highest price:', highest['provider'], '@', highest['price']);
        console.log ('difference between providers:', difference.toFixed (4) + '%');
        // with bid/ask available, the best place to buy has the lowest ask and the best place to sell has the highest bid
        const quoted = rows.filter ((row) => (row['bid'] !== undefined) && (row['ask'] !== undefined));
        if (quoted.length >= 2) {
            const bestAsk = quoted.reduce ((a, b) => ((b['ask'] < a['ask']) ? b : a));
            const bestBid = quoted.reduce ((a, b) => ((b['bid'] > a['bid']) ? b : a));
            console.log ('best ask (buy): ', bestAsk['provider'], '@', bestAsk['ask']);
            console.log ('best bid (sell):', bestBid['provider'], '@', bestBid['bid']);
        }
    }
}

await example ();
