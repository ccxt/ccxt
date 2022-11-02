'use strict'

// ----------------------------------------------------------------------------

const [processPath, , exchangeId = null, exchangeSymbol = null] = process.argv.filter ((x) => !x.startsWith ('--'));
const verbose = process.argv.includes ('--verbose') || false;
const debug = process.argv.includes ('--debug') || false;

// ----------------------------------------------------------------------------

const fs = require ('fs')
    , assert = require ('assert')
    , { Agent } = require ('https')
    , ccxt = require ('../../ccxt.js'); // eslint-disable-line import/order

// ----------------------------------------------------------------------------

process.on ('uncaughtException',  (e) => { console.log (e, e.stack); process.exit (1) });
process.on ('unhandledRejection', (e) => { console.log (e, e.stack); process.exit (1) });

// ----------------------------------------------------------------------------

console.log ('\nTESTING', { 'exchange': exchangeId, 'symbol': exchangeSymbol || 'all' }, '\n');

// ----------------------------------------------------------------------------

const proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/'
];

//-----------------------------------------------------------------------------

const enableRateLimit = true;

const httpsAgent = new Agent ({
    'ecdhCurve': 'auto',
});

const timeout = 20000;

const exchange = new (ccxt)[exchangeId] ({
    httpsAgent,
    verbose,
    enableRateLimit,
    debug,
    timeout,
});

//-----------------------------------------------------------------------------

const tests = {};
const properties = Object.keys (exchange.has);
properties
    // eslint-disable-next-line no-path-concat
    .filter ((property) => fs.existsSync (__dirname + '/Exchange/test.' + property + '.js'))
    .forEach ((property) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
        tests[property] = require (__dirname + '/Exchange/test.' + property + '.js');
    });

const errors = require ('../base/errors.js');

Object.keys (errors)
    // eslint-disable-next-line no-path-concat
    .filter ((error) => fs.existsSync (__dirname + '/errors/test.' + error + '.js'))
    .forEach ((error) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
        tests[error] = require (__dirname + '/errors/test.' + error + '.js');
    });

//-----------------------------------------------------------------------------

const keysGlobal = 'keys.json';
const keysLocal = 'keys.local.json';

const keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal;
// eslint-disable-next-line import/no-dynamic-require, no-path-concat
const settings = require (__dirname + '/../../' + keysFile)[exchangeId];

if (settings) {
    const keys = Object.keys (settings);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (settings[key]) {
            settings[key] = ccxt.deepExtend (exchange[key] || {}, settings[key]);
        }
    }
}

Object.assign (exchange, settings);

// check auth keys in env var
const requiredCredentials = exchange.requiredCredentials;
for (const [credential, isRequired] of Object.entries (requiredCredentials)) {
    if (isRequired && exchange[credential] === undefined) {
        const credentialEnvName = (exchangeId + '_' + credential).toUpperCase (); // example: KRAKEN_APIKEY
        const credentialValue = process.env[credentialEnvName];
        if (credentialValue) {
            exchange[credential] = credentialValue;
        }
    }
}

if (settings && settings.skip) {
    console.log ('[Skipped]', { 'exchange': exchangeId, 'symbol': exchangeSymbol || 'all' });
    process.exit ();
}


// ### common language specific methods ###
async function runTesterMethod(exchange, methodName, ... args) {
    return await tests[methodName](exchange, ... args);
}

function testMethodAvailableForCurrentLang(methodName) {
    return methodName in tests && tests[methodName] !== undefined;
}

function findValueIndexInArray (arr, value) {
    return arr.indexOf (value);
}

function exceptionMessage (exc) {
    return '[' + exc.constructor.name + '] ' + exc.message.slice (0, 200);
}
// ### end of language specific common methods ###

// ----------------------------------------------------------------------------
// ### AUTO-TRANSPILER-START ###
// ----------------------------------------------------------------------------

async function test (methodName, exchange, ... args) {
    if (exchange.has[methodName]) {
        if (testMethodAvailableForCurrentLang(methodName)) {
            console.log ('Testing', exchange.id, methodName, '(', ... args, ')');
            return await runTesterMethod(exchange, methodName, ... args);
        } else {
            console.log (' # Skipping Test : ',  exchange.id, '->', methodName, ' (test method not available in current language)');
        }
    } else {
        console.log (' # Skipping Test : ',  exchange.id, '->', methodName, ' (method not supported)');
    }
}

async function testSymbol (exchange, symbol) {
    await test ('loadMarkets', exchange);
    await test ('fetchCurrencies', exchange);

    const market = exchange.market (symbol);

    await test ('fetchTicker', exchange, symbol);
    await test ('fetchTickers', exchange, symbol);
    await test ('fetchOHLCV', exchange, symbol);
    await test ('fetchTrades', exchange, symbol);
    await test ('fetchOrderBook', exchange, symbol);
    await test ('fetchL2OrderBook', exchange, symbol);
    await test ('fetchOrderBooks', exchange);
    await test ('fetchBidsAsks', exchange);
    await test ('fetchTransactionFees', exchange);
    await test ('fetchTransactionFee', exchange, symbol);
    await test ('fetchLeverageTiers', exchange);
    await test ('fetchMarketLeverageTiers', exchange, symbol);
    await test ('fetchTime', exchange);
    await test ('fetchStatus', exchange);
    await test ('fetchTradingLimits', exchange);
    await test ('fetchFundingRates', exchange);
    await test ('fetchFundingRate', exchange, symbol);
    await test ('fetchFundingRateHistory', exchange, symbol);
    await test ('fetchIndexOHLCV', exchange, symbol);
    await test ('fetchMarkOHLCV', exchange, symbol);
    await test ('fetchPremiumIndexOHLCV', exchange, symbol);
}

//-----------------------------------------------------------------------------

async function loadExchange (exchange) {

    const markets = await exchange.loadMarkets ();

    assert (typeof exchange.markets === 'object', '.markets is not an object');
    assert (Array.isArray (exchange.symbols), '.symbols is not an array');
    const symbolsLength = exchange.symbols.length;
    const marketKeysLength = Object.keys (exchange.markets).length;
    assert (symbolsLength > 0, '.symbols count <= 0 (less than or equal to zero)');
    assert (marketKeysLength > 0, '.markets objects keys length <= 0 (less than or equal to zero)');
    assert (symbolsLength === marketKeysLength, 'number of .symbols is not equal to the number of .markets');

    const symbols = [
        'BTC/CNY',
        'BTC/USD',
        'BTC/USDT',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'ETH/EUR',
        'ETH/JPY',
        'ETH/CNY',
        'ETH/USD',
        'LTC/CNY',
        'DASH/BTC',
        'DOGE/BTC',
        'BTC/AUD',
        'BTC/PLN',
        'USD/SLL',
        'BTC/RUB',
        'BTC/UAH',
        'LTC/BTC',
        'EUR/USD',
    ];

    const resultSymbols = [];
    const exchangeSpecificSymbols = exchange.symbols;
    for (let i = 0; i < exchangeSpecificSymbols.length; i++) {
        const symbol = exchangeSpecificSymbols[i];
        if (exchange.inArray(symbol, symbols)) {
            resultSymbols.push (symbol);
        }
    }

    let resultMsg = '';
    const resultLength = resultSymbols.length;
    const exchangeSymbolsLength = exchange.symbols.length;
    if (resultLength > 0) {
        if (exchangeSymbolsLength > resultLength) {
            resultMsg = resultSymbols.join (', ') + ' + more...';
        } else {
            resultMsg = resultSymbols.join (', ');
        }
    }

    console.log (exchangeSymbolsLength, 'symbols', resultMsg);
}

//-----------------------------------------------------------------------------

function getTestSymbol (exchange, symbols) {
    let symbol = undefined;
    for (let i = 0; i < symbols.length; i++) {
        const s = symbols[i];
        const market = exchange.safeValue (exchange.markets, s);
        if (market !== undefined) {
            const active = exchange.safeValue (market, 'active');
            if (active || (active === undefined)) {
                symbol = s;
                break;
            }
        }
    }
    return symbol;
}

async function testExchange (exchange) {

    await loadExchange (exchange);

    const codes = [
        'BTC',
        'ETH',
        'XRP',
        'LTC',
        'BCH',
        'EOS',
        'BNB',
        'BSV',
        'USDT',
        'ATOM',
        'BAT',
        'BTG',
        'DASH',
        'DOGE',
        'ETC',
        'IOTA',
        'LSK',
        'MKR',
        'NEO',
        'PAX',
        'QTUM',
        'TRX',
        'TUSD',
        'USD',
        'USDC',
        'WAVES',
        'XEM',
        'XMR',
        'ZEC',
        'ZRX',
    ];

    let code = undefined;
    for (let i = 0; i < codes.length; i++) {
        if (codes[i] in exchange.currencies) {
            code = codes[i];
        }
    }

    let symbol = getTestSymbol (exchange, [
        'BTC/USD',
        'BTC/USDT',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'ETH/USD',
        'ETH/USDT',
        'BTC/JPY',
        'LTC/BTC',
        'ZRX/WETH',
        'EUR/USD',
    ]);

    // if symbols wasn't found from above hardcoded list, then try to locate any symbol which has our target hardcoded 'base' code
    if (symbol === undefined) {
        for (let i = 0; i < codes.length; i++) {
            const currentCode = codes[i];
            const marketsForCurrentCode = exchange.filterBy (exchange.markets, 'base', currentCode);
            const symbolsForCurrentCode = Object.keys (marketsForCurrentCode);
            if (symbolsForCurrentCode.length) {
                symbol = getTestSymbol (exchange, symbolsForCurrentCode);
                break;
            }
        }
    }

    // if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
    if (symbol === undefined) {
        const activeMarkets = exchange.filterBy (exchange.markets, 'active', true);
        const activeSymbols = Object.keys (activeMarkets);
        symbol = getTestSymbol (exchange, activeSymbols);
    }

    // if neither above was found any symbol, then just get any random symbol
    if (symbol === undefined) {
        symbol = getTestSymbol (exchange, exchange.symbols);
    }

    // if still nothing was found, then just directly set the first symbol
    if (symbol === undefined) {
        symbol = exchange.symbols[0];
    }

    console.log ('SYMBOL:', symbol);
    await testSymbol (exchange, symbol);

    // if API key is not set, then skip the private tests
    if (!exchange.privateKey && (!exchange.apiKey || (exchange.apiKey.length < 1))) {
        return true;
    }

    exchange.checkRequiredCredentials ();

    await test ('signIn', exchange);

    // move to testnet/sandbox if possible before accessing the balance
    // if (exchange.urls['test'])
    //    exchange.urls['api'] = exchange.urls['test']

    await test ('fetchBalance', exchange);

    await test ('fetchAccounts', exchange);
    await test ('fetchTransactionFees', exchange);
    await test ('fetchTradingFee', exchange, symbol); // fethcTradingFee(s) might be public for some exchanges
    await test ('fetchTradingFees', exchange);
    await test ('fetchStatus', exchange);

    await test ('fetchOrders', exchange, symbol);
    await test ('fetchOpenOrders', exchange, symbol);
    await test ('fetchClosedOrders', exchange, symbol);
    await test ('fetchMyTrades', exchange, symbol);
    await test ('fetchLeverageTiers', exchange, symbol);
    await test ('fetchOpenInterestHistory', exchange, symbol);
    await test ('fetchPositions', exchange, symbol);
    await test ('fetchLedger', exchange, code);
    await test ('fetchTransactions', exchange, code);
    await test ('fetchTransfers', exchange, code);
    await test ('fetchDeposits', exchange, code);
    await test ('fetchWithdrawals', exchange, code);
    await test ('fetchBorrowRate', exchange, code);
    await test ('fetchBorrowRates', exchange);
    await test ('fetchBorrowInterest', exchange, code);
    await test ('fetchBorrowInterest', exchange, code, symbol);

    if (exchange.extendedTest) {

        await test ('InvalidNonce', exchange, symbol);
        await test ('OrderNotFound', exchange, symbol);
        await test ('InvalidOrder', exchange, symbol);
        await test ('InsufficientFunds', exchange, symbol, balance); // danger zone - won't execute with non-empty balance
    }

    await test ('addMargin', exchange, symbol);
    await test ('reduceMargin', exchange, symbol);
    await test ('setMargin', exchange, symbol);
    await test ('setMarginMode', exchange, symbol);
    await test ('setPositionMode', exchange, symbol);
    await test ('setLeverage', exchange, symbol);
    await test ('cancelAllOrders', exchange, symbol);
    await test ('cancelOrder', exchange, symbol);
    await test ('cancelOrders', exchange, symbol);
    await test ('fetchCanceledOrders', exchange, symbol);
    await test ('fetchClosedOrder', exchange, symbol);
    await test ('fetchOpenOrder', exchange, symbol);
    await test ('fetchOrder', exchange, symbol);
    await test ('fetchOrderTrades', exchange, symbol);
    await test ('fetchPosition', exchange, symbol);
    await test ('fetchFundingHistory', exchange, symbol);
    await test ('fetchDeposit', exchange, code);
    await test ('createDepositAddress', exchange, code);
    await test ('fetchDepositAddress', exchange, code);
    await test ('fetchDepositAddresses', exchange, code);
    await test ('fetchDepositAddressesByNetwork', exchange, code);
    await test ('editOrder', exchange, symbol);
    await test ('fetchBorrowRateHistory', exchange, symbol);
    await test ('fetchBorrowRatesPerSymbol', exchange, symbol);
    await test ('fetchLedgerEntry', exchange, code);
    await test ('fetchPositionsRisk', exchange, symbol);
    await test ('fetchWithdrawal', exchange, code);
    await test ('transfer', exchange, code);
    await test ('withdraw', exchange, code);
}

//-----------------------------------------------------------------------------

async function tryAllProxies (exchange, proxies) {

    const index = findValueIndexInArray (proxies, exchange.proxy);
    let currentProxy = (index >= 0) ? index : 0;
    const maxRetries = proxies.length;

    if (settings && ('proxy' in settings)) {
        currentProxy = findValueIndexInArray (proxies, settings.proxy);
    }

    for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

        try {

            exchange.proxy = proxies[currentProxy];

            // add random origin for proxies
            const proxiesLength = exchange.proxy.length;
            if (proxiesLength > 0) {
                exchange.origin = exchange.uuid ();
            }

            await testExchange (exchange);

            break;

        } catch (e) {

            currentProxy = (currentProxy + 1) % maxRetries;
            console.log (exceptionMessage (e));
            if (e instanceof ccxt.DDoSProtection) {
                continue;
            } else if (e instanceof ccxt.RequestTimeout) {
                continue;
            } else if (e instanceof ccxt.ExchangeNotAvailable) {
                continue;
            } else if (e instanceof ccxt.AuthenticationError) {
                return;
            } else if (e instanceof ccxt.InvalidNonce) {
                return;
            } else {
                throw e;
            }
        }
    }
}

//-----------------------------------------------------------------------------

async function main () {

    if (exchangeSymbol) {

        await loadExchange (exchange);
        await testSymbol (exchange, exchangeSymbol);

    } else {

        await tryAllProxies (exchange, proxies);
    }

}

// ----------------------------------------------------------------------------
// ### AUTO-TRANSPILER-END ###
// ----------------------------------------------------------------------------

main ();
