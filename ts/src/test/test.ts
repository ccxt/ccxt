// ----------------------------------------------------------------------------

// @ts-nocheck
/* eslint-disable */
import fs from 'fs';
import assert from 'assert';
import { Agent } from 'https';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ccxt from '../../ccxt.js';
import HttpsProxyAgent from 'https-proxy-agent'

// ----------------------------------------------------------------------------

const [processPath, , exchangeId = null, exchangeSymbol = undefined] = process.argv.filter ((x) => !x.startsWith ('--'));
const verbose = process.argv.includes ('--verbose') || false;
const debug = process.argv.includes ('--debug') || false;
const sandbox = process.argv.includes ('--sandbox') || false;
const privateTest = process.argv.includes ('--private') || false;
const privateOnly = process.argv.includes ('--privateOnly') || false;
// ----------------------------------------------------------------------------

process.on ('uncaughtException', (e) => {
    console.log (e, e.stack); process.exit (1);
});
process.on ('unhandledRejection', (e) => {
    console.log (e, e.stack); process.exit (1);
});

// ----------------------------------------------------------------------------

console.log ('\nTESTING', { 'exchange': exchangeId, 'symbol': exchangeSymbol || 'all' }, '\n');

// ----------------------------------------------------------------------------

const proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
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
const __dirname = dirname (fileURLToPath (import.meta.url));

//-----------------------------------------------------------------------------

const testFiles = {};
const properties = Object.keys (exchange.has);
const filtered = properties
    // eslint-disable-next-line no-path-concat
    .filter ((property) => fs.existsSync (__dirname + '/Exchange/test.' + property + '.js'));
for (const property of filtered) {
    const test = await import (__dirname + '/Exchange/test.' + property + '.js');
    testFiles[property] = test['default'];
}
// ToDO: check this out
let errors = await import ('../base/errorHierarchy.js');
errors = errors['default'];
const filteredErrors = Object.keys (errors)
// eslint-disable-next-line no-path-concat
    .filter ((error) => fs.existsSync (__dirname + '/errors/test.' + error + '.js'));
for (const error of filteredErrors) {
    // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
    const errorTest = await import (__dirname + '/errors/test.' + error + '.js');
    testFiles[error] = errorTest['default'];
}

//-----------------------------------------------------------------------------

const keysGlobal = 'keys.json';
const keysLocal = 'keys.local.json';
const keysFile = fs.existsSync (keysLocal) ? keysLocal : keysGlobal;
const settingsFile = fs.readFileSync (keysFile);
// eslint-disable-next-line import/no-dynamic-require, no-path-concat
let settings = JSON.parse (settingsFile);
settings = settings[exchangeId];
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
    process.exit (0);
}
if (exchange.alias) {
    console.log ('[Skipped alias]', { 'exchange': exchangeId, 'symbol': exchangeSymbol || 'all' });
    process.exit (0);
}

//-----------------------------------------------------------------------------

if (settings && settings.httpProxy) {
    const agent = new HttpsProxyAgent (settings.httpProxy)
    exchange.agent = agent;
}


// ### common language specific methods ###
async function runTesterMethod(exchange, methodName, ... args) {
    return await testFiles[methodName](exchange, ... args);
}

function testMethodAvailableForCurrentLang(methodName) {
    return methodName in testFiles && testFiles[methodName] !== undefined;
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

async function testMethod (methodName, exchange, ... args) {
    let skipMessage = undefined;
    if (!(methodName in exchange.has) || !exchange.has[methodName]) {
        skipMessage = 'not supported';
    } else if (!(methodName in testFiles)) {
        skipMessage = 'test not available';
    }
    if (skipMessage) {
        // console.log ('[Skipping]', exchange.id, methodName, ' - ' + skipMessage);
        return;
    }
    console.log ('Testing', exchange.id, methodName, '(', ... args, ')');
    try {
        return await (testFiles[methodName] (exchange, ... args));
    } catch (e) {
        if (e instanceof ccxt.NotSupported) {
            console.log ('Not supported', exchange.id, methodName, '(', ... args, ')');
        } else {
            console.log (e.constructor.name, e.message);
            throw e;
        }
    }
}

async function testSafe(methodName, exchange, ...args) {
    try {
        await testMethod(methodName, exchange, ...args);
        return true;
    } catch (e) {
        return false;
    }
}

async function runPublicTests (exchange, symbol) {
    const tests = {
        'loadMarkets': [exchange],
        'fetchCurrencies': [exchange],
        'fetchTicker': [exchange, symbol],
        'fetchTickers': [exchange, symbol],
        'fetchOHLCV': [exchange, symbol],
        'fetchTrades': [exchange, symbol],
        'fetchOrderBook': [exchange, symbol],
        'fetchL2OrderBook': [exchange, symbol],
        'fetchOrderBooks': [exchange],
        'fetchBidsAsks': [exchange],
        'fetchFundingRates': [exchange, symbol],
        'fetchFundingRate': [exchange, symbol],
        'fetchFundingRateHistory': [exchange, symbol],
        'fetchIndexOHLCV': [exchange, symbol],
        'fetchMarkOHLCV': [exchange, symbol],
        'fetchPremiumIndexOHLCV': [exchange, symbol],
        'fetchStatus': [exchange],
        'fetchTime': [exchange],
    };

    const testNames = Object.keys (tests);
    const promises = [];
    for (let i = 0; i < testNames.length; i++) {
        const testName = testNames[i];
        const testArgs = tests[testName];
        promises.push (testSafe (testName, ...testArgs));
    }
    await Promise.all (promises);
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

//-----------------------------------------------------------------------------

function getExchangeCode (exchange, codes = undefined) {
    if (codes === undefined) {
        codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'BNB', 'BSV', 'USDT']
    }
    const code = codes[0];
    for (let i = 0; i < codes.length; i++) {
        if (codes[i] in exchange.currencies) {
            return codes[i];
        }
    }
    return code;
}

//-----------------------------------------------------------------------------

function getSymbolsFromExchange(exchange, spot = true) {
    let res = [];
    let markets = exchange.markets;
    const keys = Object.keys(markets);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const market = markets[key];
        if (spot && market['spot']) {
            res.push(key);
        } else if (!spot && !market['spot']) {
            res.push(key);
        }
    }
    return res;
}

//-----------------------------------------------------------------------------

function getValidSymbol (exchange, spot = true) {
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

    const spotSymbols = [
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
    ]

    const swapSymbols = [
        'BTC/USDT:USDT',
        'BTC/USD:USD',
        'ETH/USDT:USDT',
        'ETH/USD:USD',
        'LTC/USDT:USDT',
        'DOGE/USDT:USDT',
        'ADA/USDT:USDT',
        'BTC/USD:BTC',
        'ETH/USD:ETH',
    ]

    const targetSymbols = spot ? spotSymbols : swapSymbols;

    let symbol = getTestSymbol (exchange, targetSymbols);

    const exchangeMarkets = getSymbolsFromExchange(exchange, spot);

    // if symbols wasn't found from above hardcoded list, then try to locate any symbol which has our target hardcoded 'base' code
    if (symbol === undefined) {
        for (let i = 0; i < codes.length; i++) {
            const currentCode = codes[i];
            const marketsForCurrentCode = exchange.filterBy (exchangeMarkets, 'base', currentCode);
            const symbolsForCurrentCode = Object.keys (marketsForCurrentCode);
            if (symbolsForCurrentCode.length) {
                symbol = getTestSymbol (exchange, symbolsForCurrentCode);
                break;
            }
        }
    }

    // if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
    if (symbol === undefined) {
        const activeMarkets = exchange.filterBy (exchangeMarkets, 'active', true);
        const activeSymbols = Object.keys (activeMarkets);
        symbol = getTestSymbol (exchange, activeSymbols);
    }
    if (symbol === undefined) {
        const first = exchangeMarkets[0];
        if (first !== undefined) {
            symbol = first['symbol'];
        }
    }

    return symbol;
}

//-----------------------------------------------------------------------------

async function testExchange (exchange, providedSymbol = undefined) {
    let spotSymbol = undefined;
    let swapSymbol = undefined;
    if (providedSymbol !== undefined) {
        const market = exchange.market(providedSymbol);
        if (market['spot']) {
            spotSymbol = providedSymbol;
        } else {
            swapSymbol = providedSymbol;
        }
    } else {
        spotSymbol = getValidSymbol (exchange, true);
        swapSymbol = getValidSymbol (exchange, false);
    }
    if (spotSymbol !== undefined) {
        console.log ('SPOT SYMBOL:', spotSymbol);
    }
    if (swapSymbol !== undefined) {
        console.log ('SWAP SYMBOL:', swapSymbol);
    }

    if (!privateOnly) {
        if (exchange.has['spot'] && spotSymbol !== undefined) {
            exchange.options['type'] = 'spot';
            await runPublicTests (exchange, spotSymbol);
        }
        if (exchange.has['swap'] && swapSymbol !== undefined) {
            exchange.options['type'] = 'swap';
            await runPublicTests (exchange, swapSymbol);
        }
    }

    if (privateTest || privateOnly) {
        if (exchange.has['spot'] && spotSymbol !== undefined) {
            exchange.options['defaultType'] = 'spot';
            await runPrivateTests (exchange, spotSymbol);
        }
        if (exchange.has['swap'] && swapSymbol !== undefined) {
            exchange.options['defaultType'] = 'swap';
            await runPrivateTests (exchange, swapSymbol);
        }
    }
}

//-----------------------------------------------------------------------------

async function runPrivateTests(exchange, symbol) {
    if (!exchange.checkRequiredCredentials (false)) {
        console.log ('[Skipped]', 'Keys not found, skipping private tests');
        return;
    }
    const code = getExchangeCode (exchange);
    // if (exchange.extendedTest) {
    //     await test ('InvalidNonce', exchange, symbol);
    //     await test ('OrderNotFound', exchange, symbol);
    //     await test ('InvalidOrder', exchange, symbol);
    //     await test ('InsufficientFunds', exchange, symbol, balance); // danger zone - won't execute with non-empty balance
    // }
    const tests = {
        'signIn': [exchange],
        'fetchBalance': [exchange],
        'fetchAccounts': [exchange],
        'fetchTransactionFees': [exchange],
        'fetchTradingFees': [exchange],
        'fetchStatus': [exchange],
        'fetchOrders': [exchange, symbol],
        'fetchOpenOrders': [exchange, symbol],
        'fetchClosedOrders': [exchange, symbol],
        'fetchMyTrades': [exchange, symbol],
        'fetchLeverageTiers': [exchange, symbol],
        'fetchLedger': [exchange, code],
        'fetchTransactions': [exchange, code],
        'fetchDeposits': [exchange, code],
        'fetchWithdrawals': [exchange, code],
        'fetchBorrowRates': [exchange, code],
        'fetchBorrowRate': [exchange, code],
        'fetchBorrowInterest': [exchange, code, symbol],
        'addMargin': [exchange, symbol],
        'reduceMargin': [exchange, symbol],
        'setMargin': [exchange, symbol],
        'setMarginMode': [exchange, symbol],
        'setLeverage': [exchange, symbol],
        'cancelAllOrders': [exchange, symbol],
        'cancelOrder': [exchange, symbol],
        'cancelOrders': [exchange, symbol],
        'fetchCanceledOrders': [exchange, symbol],
        'fetchClosedOrder': [exchange, symbol],
        'fetchOpenOrder': [exchange, symbol],
        'fetchOrder': [exchange, symbol],
        'fetchOrderTrades': [exchange, symbol],
        'fetchPosition': [exchange, symbol],
        'fetchDeposit': [exchange, code],
        'createDepositAddress': [exchange, code],
        'fetchDepositAddress': [exchange, code],
        'fetchDepositAddresses': [exchange, code],
        'fetchDepositAddressesByNetwork': [exchange, code],
        'editOrder': [exchange, symbol],
        'fetchBorrowRateHistory': [exchange, symbol],
        'fetchBorrowRatesPerSymbol': [exchange, symbol],
        'fetchLedgerEntry': [exchange, code],
        'fetchWithdrawal': [exchange, code],
        'transfer': [exchange, code],
        'withdraw': [exchange, code],
    };
    const market = exchange.market (symbol);
    const isSpot = market['spot'];
    if (isSpot) {
        tests['fetchCurrencies'] = [exchange, symbol];
    } else {
        // derivatives only
        tests['fetchPositions'] = [exchange, [symbol]];
        tests['fetchPosition'] = [exchange, symbol];
        tests['fetchPositionRisk'] = [exchange, symbol];
        tests['setPositionMode'] = [exchange, symbol];
        tests['setMarginMode'] = [exchange, symbol];
        tests['fetchOpenInterestHistory'] = [exchange, symbol];
        tests['fetchFundingRateHistory'] = [exchange, symbol];
        tests['fetchFundingHistory'] = [exchange, symbol];
    }
    const testNames = Object.keys (tests);
    const promises = [];
    for (let i = 0; i < testNames.length; i++) {
        const testName = testNames[i];
        const testArgs = tests[testName];
        promises.push (testSafe (testName, ...testArgs));
    }
    const results = await Promise.all (promises);
    const errors = [];
    for (let i = 0; i < testNames.length; i++) {
        const testName = testNames[i];
        const success = results[i];
        if (!success) {
            errors.push (testName);
        }
    }
    if (errors.length > 0) {
        throw new Error ('Failed private tests [' + market['type'] + ']: ' + errors.join (', '));
    }
}

//-----------------------------------------------------------------------------

async function main () {
    // we don't need to test aliases
    if (exchange.alias) {
        return;
    }
    if (sandbox || exchange.sandbox) {
        exchange.setSandboxMode (true);
    }
    await loadExchange (exchange);
    await testExchange (exchange, exchangeSymbol);
}

// ----------------------------------------------------------------------------
// ### AUTO-TRANSPILER-END ###
// ----------------------------------------------------------------------------

main ();
