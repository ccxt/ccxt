import ccxt from '../../js/ccxt.js';

// @NO_AUTO_TRANSPILE (the python version in examples/py is hand-written)

// Compare US treasury prices and yields on InteractiveBrokers through the Client Portal Gateway.
// (you can alternatively use oauth 1.0 if your account allows it)
//
// Every bond of an issuer has the same IBKR ticker (US-T), so each one is a separate market with the coupon and the maturity in the symbol:
// US-T-4.125-270131.SMART/USD (a 4.125% note maturing on 2027-01-31), US-T-270114.SMART/USD (a bill, no coupon), ...
//
// Prerequisites:
// 1. download and run the client portal gateway locally
//    https://www.interactivebrokers.com/en/trading/ib-api.php#client-portal
// 2. log in at https://localhost:5000 (or any other port) in a browser (the session is reused by ccxt)

async function example () {
    const exchange = new ccxt.interactivebrokers ({
        'options': {
            'useGateway': true,
            'gatewayUrl': 'https://localhost:5001',
            'gatewayKeepAlive': false, // a one-off script, without the background keep-alive loop the process exits when done
            // 'accountId': 'XXXX', // optional, defaults to the first account of the session
            'fetchMarkets': {
                'types': [ 'bond' ], // only load bonds (skip stocks/crypto/forex/futures), bonds are not loaded by default
                'bondSymbols': [ 'US-T' ], // the issuers to look up, US-T = US treasuries
                // narrow the (1000+) treasuries down, the keys are the column ids of iserver/secdef/bond-filters:
                // 29 = type (Bills, Notes, Bonds, ...), 27 = maturity month (YYYYMM), 28 = issue date (YYYYMMDD), 25 = coupon
                'bondFilters': {
                    '29': 'Notes',
                },
            },
        },
    });
    const markets = await exchange.loadMarkets ();
    // keep the notes maturing within the next two years, sorted by maturity
    const now = exchange.milliseconds ();
    const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
    const bonds = [];
    for (const market of Object.values (markets)) {
        if (market['info']['assetClass'] !== 'BOND') {
            continue;
        }
        const maturityDate = market['info']['maturityDate']; // 20270131
        const maturity = exchange.parse8601 (maturityDate.slice (0, 4) + '-' + maturityDate.slice (4, 6) + '-' + maturityDate.slice (6, 8) + 'T00:00:00Z');
        if ((maturity > now) && (maturity < now + twoYears)) {
            bonds.push ({ 'symbol': market['symbol'], 'maturity': maturity, 'info': market['info'] });
        }
    }
    bonds.sort ((a, b) => a['maturity'] - b['maturity']);
    console.log ('Loaded', Object.keys (markets).length, 'bond markets,', bonds.length, 'maturing within two years');
    // a market data snapshot is limited in the number of conids, keep the 30 nearest maturities
    bonds.splice (30);
    const symbols = bonds.map ((bond) => bond['symbol']);
    // on top of the default fields: 7698 last yield, 7699 bid yield, 7720 ask yield
    const fields = (exchange.options['fetchTickers']['fields'] as string[]).concat ([ '7698', '7699', '7720' ]);
    const tickers = await exchange.fetchTickers (symbols, { 'fields': fields });
    const rows = [];
    for (const bond of bonds) {
        const ticker = tickers[bond['symbol']];
        if (ticker === undefined) {
            continue;
        }
        const bid = ticker['bid'];
        const ask = ticker['ask'];
        const hasBidAsk = (bid !== undefined) && (ask !== undefined);
        // bond prices are quoted as a percentage of the principal (99.5 = 995 USD for a 1000 USD principal)
        // without a market data subscription, IBKR only returns the mark price (no bid/ask/last)
        const price = hasBidAsk ? (bid + ask) / 2 : (ticker['markPrice'] ?? ticker['last']);
        const askYield = parseFloat (ticker['info']['7720']); // the yield to maturity when buying at the ask, e.g. "3.652%"
        rows.push ({
            'symbol': bond['symbol'],
            'name': bond['info']['fullName'],
            'coupon %': Number (bond['info']['coupon']),
            'maturity': exchange.iso8601 (bond['maturity']).slice (0, 10),
            'bid': bid,
            'ask': ask,
            'price': price, // mid price when quoted, the mark price otherwise
            'ask yield %': Number.isNaN (askYield) ? undefined : askYield,
        });
    }
    console.table (rows);
    const yielding = rows.filter ((row) => row['ask yield %'] !== undefined);
    if (yielding.length < 2) {
        console.log ('not enough notes with a yield to compare (market data subscription required?)');
        return;
    }
    const lowest = yielding.reduce ((a, b) => ((b['ask yield %'] < a['ask yield %']) ? b : a));
    const highest = yielding.reduce ((a, b) => ((b['ask yield %'] > a['ask yield %']) ? b : a));
    console.log ('lowest yield: ', lowest['symbol'], '@', lowest['ask yield %'] + '%', '- matures', lowest['maturity']);
    console.log ('highest yield:', highest['symbol'], '@', highest['ask yield %'] + '%', '- matures', highest['maturity']);
    // the cheapest note relative to its principal has the lowest ask
    const quoted = rows.filter ((row) => row['ask'] !== undefined);
    if (quoted.length >= 2) {
        const cheapest = quoted.reduce ((a, b) => ((b['ask'] < a['ask']) ? b : a));
        console.log ('lowest ask:   ', cheapest['symbol'], '@', cheapest['ask']);
    }
}

await example ();
