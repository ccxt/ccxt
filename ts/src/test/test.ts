// ----------------------------------------------------------------------------
/* eslint-disable max-classes-per-file */
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import assert from 'assert';
import ccxt, { Exchange } from '../../ccxt.js';
import errorsHierarchy from '../base/errorHierarchy.js';
import { unCamelCase } from '../base/functions/string.js';

// js specific codes //
const DIR_NAME = fileURLToPath (new URL ('.', import.meta.url));
process.on ('uncaughtException', (e) => {
    throw new Error (exceptionMessage (e));
    // process.exit (1);
});
process.on ('unhandledRejection', (e: any) => {
    if (e.message.includes ('connection closed by remote server')) {
        // because of unbeknown reason, this error is happening somewhere in the middle of WS tests, and it's not caught by the try/catch block. so temporarily ignore it
        return;
    }
    throw new Error (exceptionMessage (e));
    // process.exit (1);
});

const AuthenticationError = ccxt.AuthenticationError;
const NotSupported = ccxt.NotSupported;
const NetworkError = ccxt.NetworkError;
const ExchangeError = ccxt.ExchangeError;
const ProxyError = ccxt.ProxyError;
const ExchangeNotAvailable = ccxt.ExchangeNotAvailable;
const OperationFailed = ccxt.OperationFailed;
const OnMaintenance = ccxt.OnMaintenance;

const [ processPath, , exchangeIdFromArgv = null, exchangeSymbol = undefined ] = process.argv.filter ((x) => !x.startsWith ('--'));
// const sanitizedSymnol = exchangeSymbol !== undefined && exchangeSymbol.includes ('/') ? exchangeSymbol : undefined;
// non-transpiled part, but shared names among langs
function getCliArgValue (arg) {
    return process.argv.includes (arg) || false;
}

const proxyTestFileName = 'proxies';
class baseMainTestClass {
    lang = 'JS';
    isSynchronous = false;
    idTests = false;
    requestTestsFailed = false;
    responseTestsFailed = false;
    requestTests = false;
    wsTests = false;
    responseTests = false;
    staticTests = false;
    info = false;
    verbose = false;
    debug = false;
    privateTest = false;
    privateTestOnly = false;
    loadKeys = false;
    sandbox = false;
    skippedMethods = {};
    checkedPublicTests = {};
    testFiles = {};
    publicTests = {};
    newLine = '\n';
    rootDir = DIR_NAME + '/../../../';
    rootDirForSkips = DIR_NAME + '/../../../';
    onlySpecificTests = [];
    envVars = process.env;
    proxyTestFileName = proxyTestFileName;
    ext = import.meta.url.split ('.')[1];
}
// const rootDir = DIR_NAME + '/../../../';
// const rootDirForSkips = DIR_NAME + '/../../../';
// const envVars = process.env;
const LOG_CHARS_LENGTH = 10000;
const ext = import.meta.url.split ('.')[1];

function dump (...args) {
    console.log (...args);
}

function jsonParse (elem) {
    return JSON.parse (elem);
}

function jsonStringify (elem) {
    return JSON.stringify (elem,  (k, v) => (v === undefined ? null : v)); // preserve undefined values and convert them to null
}

function convertAscii (input)
{
    return input; // stub for c#
}

function getTestName (str) {
    return str;
}

function ioFileExists (path) {
    return fs.existsSync (path);
}

function ioFileRead (path, decode = true) {
    const content = fs.readFileSync (path, 'utf8');
    return decode ? JSON.parse (content) : content;
}

function ioDirRead (path) {
    const files = fs.readdirSync (path);
    return files;
}

async function callMethod (testFiles, methodName, exchange, skippedProperties, args) {
    // used for calling methods from test files
    return await testFiles[methodName] (exchange, skippedProperties, ...args);
}

async function callExchangeMethodDynamically (exchange: Exchange, methodName: string, args) {
    // used for calling actual exchange methods
    return await exchange[methodName] (...args);
}

async function callOverridenMethod (exchange, methodName, args) {
    // needed in PHP here is just a bridge
    return await callExchangeMethodDynamically (exchange, methodName, args);
}

function exceptionMessage (exc) {
    return '[' + exc.constructor.name + '] ' + exc.stack.slice (0, LOG_CHARS_LENGTH);
}

function exitScript (code = 0) {
    process.exit (code);
}

function getExchangeProp (exchange, prop, defaultValue = undefined) {
    return (prop in exchange) ? exchange[prop] : defaultValue;
}

function setExchangeProp (exchange, prop, value) {
    exchange[prop] = value;
    exchange[unCamelCase (prop)] = value;
}

function initExchange (exchangeId, args, isWs = false): Exchange {
    if (isWs) {
        return new (ccxt.pro)[exchangeId] (args);
    }
    return new (ccxt)[exchangeId] (args);
}

async function importTestFile (filePath) {
    // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
    return (await import (pathToFileURL (filePath + '.js') as any) as any)['default'];
}

async function getTestFiles (properties, ws = false) {
    const path = ws ? DIR_NAME + '../pro/test/' : DIR_NAME;
    // exchange tests
    const tests = {};
    const finalPropList = properties.concat ([ proxyTestFileName ]);
    for (let i = 0; i < finalPropList.length; i++) {
        const name = finalPropList[i];
        const filePathWoExt = path + 'Exchange/test.' + name;
        if (ioFileExists (filePathWoExt + '.' + ext)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            tests[name] = await importTestFile (filePathWoExt);
        }
    }
    // errors tests
    const errorHierarchyKeys = Object.keys (errorsHierarchy);
    for (let i = 0; i < errorHierarchyKeys.length; i++) {
        const name = errorHierarchyKeys[i];
        const filePathWoExt = path + '/base/errors/test.' + name;
        if (ioFileExists (filePathWoExt + '.' + ext)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            tests[name] = await importTestFile (filePathWoExt);
        }
    }
    return tests;
}

function setFetchResponse (exchange: Exchange, mockResponse) {
    exchange.fetch = async (url, method = 'GET', headers = undefined, body = undefined) => mockResponse;
    return exchange;
}

function isNullValue (value) {
    return value === null;
}

async function close (exchange: Exchange) {
    await exchange.close ();
}

// *********************************
// ***** AUTO-TRANSPILER-START *****

export default class testMainClass extends baseMainTestClass {
    parseCliArgs () {
        this.responseTests = getCliArgValue ('--responseTests');
        this.idTests = getCliArgValue ('--idTests');
        this.requestTests = getCliArgValue ('--requestTests');
        this.info = getCliArgValue ('--info');
        this.verbose = getCliArgValue ('--verbose');
        this.debug = getCliArgValue ('--debug');
        this.privateTest = getCliArgValue ('--private');
        this.privateTestOnly = getCliArgValue ('--privateOnly');
        this.sandbox = getCliArgValue ('--sandbox');
        this.loadKeys = getCliArgValue ('--loadKeys');
        this.wsTests = getCliArgValue ('--ws');
    }

    async init (exchangeId, symbolArgv) {
        this.parseCliArgs ();

        if (this.requestTests && this.responseTests) {
            await this.runStaticRequestTests (exchangeId, symbolArgv);
            await this.runStaticResponseTests (exchangeId, symbolArgv);
            return;
        }
        if (this.responseTests) {
            await this.runStaticResponseTests (exchangeId, symbolArgv);
            return;
        }
        if (this.requestTests) {
            await this.runStaticRequestTests (exchangeId, symbolArgv); // symbol here is the testname
            return;
        }
        if (this.idTests) {
            await this.runBrokerIdTests ();
            return;
        }
        const symbolStr = symbolArgv !== undefined ? symbolArgv : 'all';
        const exchangeObject = { 'exchange': exchangeId, 'symbol': symbolStr, 'isWs': this.wsTests };
        dump (this.newLine + '' + this.newLine + '' + '[INFO] TESTING ', this.ext, jsonStringify (exchangeObject), this.newLine);
        const exchangeArgs = {
            'verbose': this.verbose,
            'debug': this.debug,
            'enableRateLimit': true,
            'timeout': 30000,
        };
        const exchange = initExchange (exchangeId, exchangeArgs, this.wsTests);
        if (exchange.alias) {
            exitScript (0);
        }
        await this.importFiles (exchange);
        assert (Object.keys (this.testFiles).length > 0, 'Test files were not loaded'); // ensure test files are found & filled
        this.expandSettings (exchange);
        const symbol = this.checkIfSpecificTestIsChosen (symbolArgv);
        await this.startTest (exchange, symbol);
        exitScript (0); // needed to be explicitly finished for WS tests
    }

    checkIfSpecificTestIsChosen (symbolArgv) {
        if (symbolArgv !== undefined) {
            const testFileNames = Object.keys (this.testFiles);
            const possibleMethodNames = symbolArgv.split (','); // i.e. `test.ts binance fetchBalance,fetchDeposits`
            if (possibleMethodNames.length >= 1) {
                for (let i = 0; i < testFileNames.length; i++) {
                    const testFileName = testFileNames[i];
                    for (let j = 0; j < possibleMethodNames.length; j++) {
                        const methodName = possibleMethodNames[j];
                        if (testFileName === methodName) {
                            this.onlySpecificTests.push (testFileName);
                        }
                    }
                }
            }
            // if method names were found, then remove them from symbolArgv
            if (this.onlySpecificTests.length > 0) {
                return undefined;
            }
        }
        return symbolArgv;
    }

    async importFiles (exchange: Exchange) {
        const properties = Object.keys (exchange.has);
        properties.push ('loadMarkets');
        this.testFiles = await getTestFiles (properties, this.wsTests);
    }

    loadCredentialsFromEnv (exchange: Exchange) {
        const exchangeId = exchange.id;
        const reqCreds = getExchangeProp (exchange, 're' + 'quiredCredentials'); // dont glue the r-e-q-u-i-r-e phrase, because leads to messed up transpilation
        const objkeys = Object.keys (reqCreds);
        for (let i = 0; i < objkeys.length; i++) {
            const credential = objkeys[i];
            const isRequired = reqCreds[credential];
            if (isRequired && getExchangeProp (exchange, credential) === undefined) {
                const fullKey = exchangeId + '_' + credential;
                const credentialEnvName = fullKey.toUpperCase (); // example: KRAKEN_APIKEY
                const credentialValue = (credentialEnvName in this.envVars) ? this.envVars[credentialEnvName] : undefined;
                if (credentialValue) {
                    setExchangeProp (exchange, credential, credentialValue);
                }
            }
        }
    }

    expandSettings (exchange: Exchange) {
        const exchangeId = exchange.id;
        const keysGlobal = this.rootDir + 'keys.json';
        const keysLocal = this.rootDir + 'keys.local.json';
        const keysGlobalExists = ioFileExists (keysGlobal);
        const keysLocalExists = ioFileExists (keysLocal);
        const globalSettings = keysGlobalExists ? ioFileRead (keysGlobal) : {};
        const localSettings = keysLocalExists ? ioFileRead (keysLocal) : {};
        const allSettings = exchange.deepExtend (globalSettings, localSettings);
        const exchangeSettings = exchange.safeValue (allSettings, exchangeId, {});
        if (exchangeSettings) {
            const settingKeys = Object.keys (exchangeSettings);
            for (let i = 0; i < settingKeys.length; i++) {
                const key = settingKeys[i];
                if (exchangeSettings[key]) {
                    let finalValue = undefined;
                    if (typeof exchangeSettings[key] === 'object') {
                        const existing = getExchangeProp (exchange, key, {});
                        finalValue = exchange.deepExtend (existing, exchangeSettings[key]);
                    } else {
                        finalValue = exchangeSettings[key];
                    }
                    setExchangeProp (exchange, key, finalValue);
                }
            }
        }
        // credentials
        if (this.loadKeys) {
            this.loadCredentialsFromEnv (exchange);
        }
        // skipped tests
        const skippedFile = this.rootDirForSkips + 'skip-tests.json';
        const skippedSettings = ioFileRead (skippedFile);
        const skippedSettingsForExchange = exchange.safeValue (skippedSettings, exchangeId, {});
        // others
        const timeout = exchange.safeValue (skippedSettingsForExchange, 'timeout');
        if (timeout !== undefined) {
            exchange.timeout = exchange.parseToInt (timeout);
        }
        if (getCliArgValue ('--useProxy')) {
            exchange.httpProxy = exchange.safeString (skippedSettingsForExchange, 'httpProxy');
            exchange.httpsProxy = exchange.safeString (skippedSettingsForExchange, 'httpsProxy');
            exchange.wsProxy = exchange.safeString (skippedSettingsForExchange, 'wsProxy');
            exchange.wssProxy = exchange.safeString (skippedSettingsForExchange, 'wssProxy');
        }
        this.skippedMethods = exchange.safeValue (skippedSettingsForExchange, 'skipMethods', {});
        this.checkedPublicTests = {};
    }

    addPadding (message: string, size) {
        // has to be transpilable
        let res = '';
        const messageLength = message.length; // avoid php transpilation issue
        const missingSpace = size - messageLength - 0; // - 0 is added just to trick transpile to treat the .length as a string for php
        if (missingSpace > 0) {
            for (let i = 0; i < missingSpace; i++) {
                res += ' ';
            }
        }
        return message + res;
    }

    exchangeHint (exchange, market = undefined) {
        let marketType = exchange.safeString2 (exchange.options, 'defaultType', 'type', '');
        let marketSubType = exchange.safeString2 (exchange.options, 'defaultSubType', 'subType');
        if (market !== undefined) {
            marketType = market['type'];
            if (market['linear']) {
                marketSubType = 'linear';
            } else if (market['inverse']) {
                marketSubType = 'inverse';
            } else if (exchange.safeValue (market, 'quanto') === true) {
                marketSubType = 'quanto';
            }
        }
        const isWs = ('ws' in exchange.has);
        const wsFlag = isWs ? '(WS)' : '';
        let result = exchange.id + ' ' + wsFlag + ' ' + marketType;
        if (marketSubType !== undefined) {
            result = result + ' [subType: ' + marketSubType + '] ';
        }
        return result;
    }

    async testMethod (methodName: string, exchange: any, args: any[], isPublic: boolean) {
        // todo: temporary skip for php
        if (methodName.indexOf ('OrderBook') >= 0 && this.ext === 'php') {
            return;
        }
        const isLoadMarkets = (methodName === 'loadMarkets');
        const isFetchCurrencies = (methodName === 'fetchCurrencies');
        const isProxyTest = (methodName === this.proxyTestFileName);
        // if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
        if (!isPublic && (methodName in this.checkedPublicTests) && !isFetchCurrencies) {
            return;
        }
        let skipMessage = undefined;
        const supportedByExchange = (methodName in exchange.has) && exchange.has[methodName];
        if (!isLoadMarkets && (this.onlySpecificTests.length > 0 && !exchange.inArray (methodName, this.onlySpecificTests))) {
            skipMessage = '[INFO] IGNORED_TEST';
        } else if (!isLoadMarkets && !supportedByExchange && !isProxyTest) {
            skipMessage = '[INFO] UNSUPPORTED_TEST'; // keep it aligned with the longest message
        } else if ((methodName in this.skippedMethods) && (typeof this.skippedMethods[methodName] === 'string')) {
            skipMessage = '[INFO] SKIPPED_TEST';
        } else if (!(methodName in this.testFiles)) {
            skipMessage = '[INFO] UNIMPLEMENTED_TEST';
        }
        // exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
        if (isLoadMarkets) {
            await exchange.loadMarkets (true);
        }
        if (skipMessage) {
            if (this.info) {
                dump (this.addPadding (skipMessage, 25), this.exchangeHint (exchange), methodName);
            }
            return;
        }
        if (this.info) {
            const argsStringified = '(' + args.join (',') + ')';
            dump (this.addPadding ('[INFO] TESTING', 25), this.exchangeHint (exchange), methodName, argsStringified);
        }
        await callMethod (this.testFiles, methodName, exchange, this.getSkips (exchange, methodName), args);
        // if it was passed successfully, add to the list of successfull tests
        if (isPublic) {
            this.checkedPublicTests[methodName] = true;
        }
        return;
    }

    getSkips (exchange, methodName) {
        // get "method-specific" skips
        const skipsForMethod = exchange.safeValue (this.skippedMethods, methodName, {});
        // get "object-specific" skips
        if (exchange.inArray (methodName, [ 'fetchOrderBook', 'fetchOrderBooks', 'fetchL2OrderBook', 'watchOrderBook', 'watchOrderBookForSymbols' ])) {
            const skips = exchange.safeValue (this.skippedMethods, 'orderBook', {});
            return exchange.deepExtend (skipsForMethod, skips);
        } else if (exchange.inArray (methodName, [ 'fetchTicker', 'fetchTickers', 'watchTicker', 'watchTickers' ])) {
            const skips = exchange.safeValue (this.skippedMethods, 'ticker', {});
            return exchange.deepExtend (skipsForMethod, skips);
        } else if (exchange.inArray (methodName, [ 'fetchTrades', 'watchTrades', 'watchTradesForSymbols' ])) {
            const skips = exchange.safeValue (this.skippedMethods, 'trade', {});
            return exchange.deepExtend (skipsForMethod, skips);
        } else if (exchange.inArray (methodName, [ 'fetchOHLCV', 'watchOHLCV', 'watchOHLCVForSymbols' ])) {
            const skips = exchange.safeValue (this.skippedMethods, 'ohlcv', {});
            return exchange.deepExtend (skipsForMethod, skips);
        }
        return skipsForMethod;
    }

    async testSafe (methodName, exchange, args = [], isPublic = false) {
        // `testSafe` method does not throw an exception, instead mutes it. The reason we
        // mute the thrown exceptions here is because we don't want to stop the whole
        // tests queue if any single test-method fails. Instead, they are echoed with
        // formatted message "[TEST_FAILURE] ..." and that output is then regex-matched by
        // run-tests.js, so the exceptions are still printed out to console from there.
        const maxRetries = 3;
        const argsStringified = exchange.json (args); // args.join() breaks when we provide a list of symbols | "args.toString()" breaks bcz of "array to string conversion"
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.testMethod (methodName, exchange, args, isPublic);
                return true;
            }
            catch (e) {
                const isLoadMarkets = (methodName === 'loadMarkets');
                const isAuthError = (e instanceof AuthenticationError);
                const isNotSupported = (e instanceof NotSupported);
                const isOperationFailed = (e instanceof OperationFailed); // includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "OperationFailed", "InvalidNonce", ...
                if (isOperationFailed) {
                    // if last retry was gone with same `tempFailure` error, then let's eventually return false
                    if (i === maxRetries - 1) {
                        let shouldFail = false;
                        // we do not mute specifically "ExchangeNotAvailable" exception, because it might be a hint about a change in API engine (but its subtype "OnMaintenance" can be muted)
                        if ((e instanceof ExchangeNotAvailable) && !(e instanceof OnMaintenance)) {
                            shouldFail = true;
                        }
                        // if it's `loadMarkets` call (which is main request), then don't return the test as passed, because it's mandatory and we should fail the test
                        else if (isLoadMarkets) {
                            shouldFail = true;
                        }
                        else {
                            shouldFail = false;
                        }
                        // final step
                        if (shouldFail) {
                            dump ('[TEST_FAILURE]', 'Method could not be tested due to a repeated Network/Availability issues', ' | ', this.exchangeHint (exchange), methodName, argsStringified, exceptionMessage (e));
                            return false;
                        } else {
                            dump ('[TEST_WARNING]', 'Method could not be tested due to a repeated Network/Availability issues', ' | ', this.exchangeHint (exchange), methodName, argsStringified, exceptionMessage (e));
                            return true;
                        }
                    }
                    else {
                        // wait and retry again
                        // (increase wait time on every retry)
                        await exchange.sleep (i * 1000);
                        continue;
                    }
                }
                // if it's not temporary failure, then ...
                else {
                    // if it's loadMarkets, then fail test, because it's mandatory for tests
                    if (isLoadMarkets) {
                        dump ('[TEST_FAILURE]', 'Exchange can not load markets', exceptionMessage (e), this.exchangeHint (exchange), methodName, argsStringified);
                        return false;
                    }
                    // if the specific arguments to the test method throws "NotSupported" exception
                    // then let's don't fail the test
                    if (isNotSupported) {
                        if (this.info) {
                            dump ('[INFO] NOT_SUPPORTED', exceptionMessage (e), this.exchangeHint (exchange), methodName, argsStringified);
                        }
                        return true;
                    }
                    // If public test faces authentication error, we don't break (see comments under `testSafe` method)
                    if (isPublic && isAuthError) {
                        if (this.info) {
                            dump ('[INFO]', 'Authentication problem for public method', exceptionMessage (e), this.exchangeHint (exchange), methodName, argsStringified);
                        }
                        return true;
                    }
                    // in rest of the cases, fail the test
                    else {
                        dump ('[TEST_FAILURE]', exceptionMessage (e), this.exchangeHint (exchange), methodName, argsStringified);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    async runPublicTests (exchange, symbol) {
        let tests = {
            'fetchCurrencies': [],
            'fetchTicker': [ symbol ],
            'fetchTickers': [ symbol ],
            'fetchLastPrices': [ symbol ],
            'fetchOHLCV': [ symbol ],
            'fetchTrades': [ symbol ],
            'fetchOrderBook': [ symbol ],
            'fetchL2OrderBook': [ symbol ],
            'fetchOrderBooks': [],
            'fetchBidsAsks': [],
            'fetchStatus': [],
            'fetchTime': [],
        };
        if (this.wsTests) {
            tests = {
                // @ts-ignore
                'watchOHLCV': [ symbol ],
                'watchTicker': [ symbol ],
                'watchTickers': [ symbol ],
                'watchOrderBook': [ symbol ],
                'watchTrades': [ symbol ],
            };
        }
        const market = exchange.market (symbol);
        const isSpot = market['spot'];
        if (!this.wsTests) {
            if (isSpot) {
                tests['fetchCurrencies'] = [];
            } else {
                tests['fetchFundingRates'] = [ symbol ];
                tests['fetchFundingRate'] = [ symbol ];
                tests['fetchFundingRateHistory'] = [ symbol ];
                tests['fetchIndexOHLCV'] = [ symbol ];
                tests['fetchMarkOHLCV'] = [ symbol ];
                tests['fetchPremiumIndexOHLCV'] = [ symbol ];
            }
        }
        this.publicTests = tests;
        await this.runTests (exchange, tests, true);
    }

    async runTests (exchange: any, tests: any, isPublicTest:boolean) {
        const testNames = Object.keys (tests);
        const promises = [];
        for (let i = 0; i < testNames.length; i++) {
            const testName = testNames[i];
            const testArgs = tests[testName];
            promises.push (this.testSafe (testName, exchange, testArgs, isPublicTest));
        }
        // todo - not yet ready in other langs too
        // promises.push (testThrottle ());
        const results = await Promise.all (promises);
        // now count which test-methods retuned `false` from "testSafe" and dump that info below
        const failedMethods = [];
        for (let i = 0; i < testNames.length; i++) {
            const testName = testNames[i];
            const testReturnedValue = results[i];
            if (!testReturnedValue) {
                failedMethods.push (testName);
            }
        }
        const testPrefixString = isPublicTest ? 'PUBLIC_TESTS' : 'PRIVATE_TESTS';
        if (failedMethods.length) {
            const errorsString = failedMethods.join (', ');
            dump ('[TEST_FAILURE]', this.exchangeHint (exchange), testPrefixString, 'Failed methods : ' + errorsString);
        }
        if (this.info) {
            dump (this.addPadding ('[INFO] END ' + testPrefixString + ' ' + this.exchangeHint (exchange), 25));
        }
    }

    async loadExchange (exchange) {
        const result = await this.testSafe ('loadMarkets', exchange, [], true);
        if (!result) {
            return false;
        }
        const symbols = [
            'BTC/USDT',
            'BTC/USDC',
            'BTC/CNY',
            'BTC/USD',
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
            if (exchange.inArray (symbol, symbols)) {
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
        dump ('[INFO:MAIN] Exchange loaded', exchangeSymbolsLength, 'symbols', resultMsg);
        return true;
    }

    getTestSymbol (exchange, isSpot, symbols) {
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

    getExchangeCode (exchange, codes = undefined) {
        if (codes === undefined) {
            codes = [ 'BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'BNB', 'BSV', 'USDT' ];
        }
        const code = codes[0];
        for (let i = 0; i < codes.length; i++) {
            if (codes[i] in exchange.currencies) {
                return codes[i];
            }
        }
        return code;
    }

    getMarketsFromExchange (exchange, spot = true) {
        const res = {};
        const markets = exchange.markets;
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const market = markets[key];
            if (spot && market['spot']) {
                res[market['symbol']] = market;
            } else if (!spot && !market['spot']) {
                res[market['symbol']] = market;
            }
        }
        return res;
    }

    getValidSymbol (exchange, spot = true) {
        const currentTypeMarkets = this.getMarketsFromExchange (exchange, spot);
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
            'BTC/USDT',
            'BTC/USDC',
            'BTC/USD',
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
        ];
        const swapSymbols = [
            'BTC/USDT:USDT',
            'BTC/USDC:USDC',
            'BTC/USD:USD',
            'ETH/USDT:USDT',
            'ETH/USD:USD',
            'LTC/USDT:USDT',
            'DOGE/USDT:USDT',
            'ADA/USDT:USDT',
            'BTC/USD:BTC',
            'ETH/USD:ETH',
        ];
        const targetSymbols = spot ? spotSymbols : swapSymbols;
        let symbol = this.getTestSymbol (exchange, spot, targetSymbols);
        // if symbols wasn't found from above hardcoded list, then try to locate any symbol which has our target hardcoded 'base' code
        if (symbol === undefined) {
            for (let i = 0; i < codes.length; i++) {
                const currentCode = codes[i];
                const marketsArrayForCurrentCode = exchange.filterBy (currentTypeMarkets, 'base', currentCode);
                const indexedMkts = exchange.indexBy (marketsArrayForCurrentCode, 'symbol');
                const symbolsArrayForCurrentCode = Object.keys (indexedMkts);
                const symbolsLength = symbolsArrayForCurrentCode.length;
                if (symbolsLength) {
                    symbol = this.getTestSymbol (exchange, spot, symbolsArrayForCurrentCode);
                    break;
                }
            }
        }
        // if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
        if (symbol === undefined) {
            const activeMarkets = exchange.filterBy (currentTypeMarkets, 'active', true);
            const activeSymbols = [];
            for (let i = 0; i < activeMarkets.length; i++) {
                activeSymbols.push (activeMarkets[i]['symbol']);
            }
            symbol = this.getTestSymbol (exchange, spot, activeSymbols);
        }
        if (symbol === undefined) {
            const values = Object.values (currentTypeMarkets);
            const valuesLength = values.length;
            if (valuesLength > 0) {
                const first = values[0];
                if (first !== undefined) {
                    symbol = first['symbol'];
                }
            }
        }
        return symbol;
    }

    async testExchange (exchange, providedSymbol = undefined) {
        let spotSymbol = undefined;
        let swapSymbol = undefined;
        if (providedSymbol !== undefined) {
            const market = exchange.market (providedSymbol);
            if (market['spot']) {
                spotSymbol = providedSymbol;
            } else {
                swapSymbol = providedSymbol;
            }
        } else {
            if (exchange.has['spot']) {
                spotSymbol = this.getValidSymbol (exchange, true);
            }
            if (exchange.has['swap']) {
                swapSymbol = this.getValidSymbol (exchange, false);
            }
        }
        if (spotSymbol !== undefined) {
            dump ('[INFO:MAIN] Selected SPOT SYMBOL:', spotSymbol);
        }
        if (swapSymbol !== undefined) {
            dump ('[INFO:MAIN] Selected SWAP SYMBOL:', swapSymbol);
        }
        if (!this.privateTestOnly) {
            // note, spot & swap tests should run sequentially, because of conflicting `exchange.options['defaultType']` setting
            if (exchange.has['spot'] && spotSymbol !== undefined) {
                if (this.info) {
                    dump ('[INFO] ### SPOT TESTS ###');
                }
                exchange.options['defaultType'] = 'spot';
                await this.runPublicTests (exchange, spotSymbol);
            }
            if (exchange.has['swap'] && swapSymbol !== undefined) {
                if (this.info) {
                    dump ('[INFO] ### SWAP TESTS ###');
                }
                exchange.options['defaultType'] = 'swap';
                await this.runPublicTests (exchange, swapSymbol);
            }
        }
        if (this.privateTest || this.privateTestOnly) {
            if (exchange.has['spot'] && spotSymbol !== undefined) {
                exchange.options['defaultType'] = 'spot';
                await this.runPrivateTests (exchange, spotSymbol);
            }
            if (exchange.has['swap'] && swapSymbol !== undefined) {
                exchange.options['defaultType'] = 'swap';
                await this.runPrivateTests (exchange, swapSymbol);
            }
        }
    }

    async runPrivateTests (exchange, symbol) {
        if (!exchange.checkRequiredCredentials (false)) {
            dump ('[INFO] Skipping private tests', 'Keys not found');
            return;
        }
        const code = this.getExchangeCode (exchange);
        // if (exchange.deepExtendedTest) {
        //     await test ('InvalidNonce', exchange, symbol);
        //     await test ('OrderNotFound', exchange, symbol);
        //     await test ('InvalidOrder', exchange, symbol);
        //     await test ('InsufficientFunds', exchange, symbol, balance); // danger zone - won't execute with non-empty balance
        // }
        let tests = {
            'signIn': [ ],
            'fetchBalance': [ ],
            'fetchAccounts': [ ],
            'fetchTransactionFees': [ ],
            'fetchTradingFees': [ ],
            'fetchStatus': [ ],
            'fetchOrders': [ symbol ],
            'fetchOpenOrders': [ symbol ],
            'fetchClosedOrders': [ symbol ],
            'fetchMyTrades': [ symbol ],
            'fetchLeverageTiers': [ [ symbol ] ],
            'fetchLedger': [ code ],
            'fetchTransactions': [ code ],
            'fetchDeposits': [ code ],
            'fetchWithdrawals': [ code ],
            'fetchBorrowInterest': [ code, symbol ],
            // 'addMargin': [ ],
            // 'reduceMargin': [ ],
            // 'setMargin': [ ],
            // 'setMarginMode': [ ],
            // 'setLeverage': [ ],
            'cancelAllOrders': [ symbol ],
            // 'cancelOrder': [ ],
            // 'cancelOrders': [ ],
            'fetchCanceledOrders': [ symbol ],
            'fetchMarginModes': [ symbol ],
            // 'fetchClosedOrder': [ ],
            // 'fetchOpenOrder': [ ],
            // 'fetchOrder': [ ],
            // 'fetchOrderTrades': [ ],
            'fetchPosition': [ symbol ],
            'fetchDeposit': [ code ],
            'createDepositAddress': [ code ],
            'fetchDepositAddress': [ code ],
            'fetchDepositAddresses': [ code ],
            'fetchDepositAddressesByNetwork': [ code ],
            // 'editOrder': [ ],
            'fetchBorrowRateHistory': [ code ],
            'fetchLedgerEntry': [ code ],
            // 'fetchWithdrawal': [ ],
            // 'transfer': [ ],
            // 'withdraw': [ ],
        };
        if (this.wsTests) {
            tests = {
                // @ts-ignore
                'watchBalance': [ code ],
                'watchMyTrades': [ symbol ],
                'watchOrders': [ symbol ],
                'watchPosition': [ symbol ],
                'watchPositions': [ symbol ],
            };
        }
        const market = exchange.market (symbol);
        const isSpot = market['spot'];
        if (!this.wsTests) {
            if (isSpot) {
                tests['fetchCurrencies'] = [ ];
            } else {
                // derivatives only
                tests['fetchPositions'] = [ symbol ]; // this test fetches all positions for 1 symbol
                tests['fetchPosition'] = [ symbol ];
                tests['fetchPositionRisk'] = [ symbol ];
                tests['setPositionMode'] = [ symbol ];
                tests['setMarginMode'] = [ symbol ];
                tests['fetchOpenInterestHistory'] = [ symbol ];
                tests['fetchFundingRateHistory'] = [ symbol ];
                tests['fetchFundingHistory'] = [ symbol ];
            }
        }
        // const combinedTests = exchange.deepExtend (this.publicTests, privateTests);
        await this.runTests (exchange, tests, false);
    }

    async testProxies (exchange) {
        // these tests should be synchronously executed, because of conflicting nature of proxy settings
        const proxyTestName = this.proxyTestFileName;
        // todo: temporary skip for sync py
        if (this.ext === 'py' && this.isSynchronous) {
            return;
        }
        // try proxy several times
        const maxRetries = 3;
        let exception = undefined;
        for (let j = 0; j < maxRetries; j++) {
            try {
                await this.testMethod (proxyTestName, exchange, [], true);
                break; // if successfull, then break
            } catch (e) {
                exception = e;
            }
        }
        // if exception was set, then throw it
        if (exception) {
            const errorMessage = '[TEST_FAILURE] Failed ' + proxyTestName + ' : ' + exceptionMessage (exception);
            throw new ExchangeError (errorMessage.toString ()); // toString is a c# requirement for now
        }
    }

    async startTest (exchange, symbol) {
        // we do not need to test aliases
        if (exchange.alias) {
            return;
        }
        if (this.sandbox || getExchangeProp (exchange, 'sandbox')) {
            exchange.setSandboxMode (true);
        }
        // because of python-async, we need proper `.close()` handling
        try {
            const result = await this.loadExchange (exchange);
            if (!result) {
                await close (exchange);
                return;
            }
            // if (exchange.id === 'binance') {
            //     // we test proxies functionality just for one random exchange on each build, because proxy functionality is not exchange-specific, instead it's all done from base methods, so just one working sample would mean it works for all ccxt exchanges
            //     // await this.testProxies (exchange);
            // }
            await this.testExchange (exchange, symbol);
            await close (exchange);
        } catch (e) {
            await close (exchange);
            throw e;
        }
    }

    assertStaticError (cond:boolean, message: string, calculatedOutput, storedOutput, key = undefined) {
        //  -----------------------------------------------------------------------------
        //  --- Init of static tests functions------------------------------------------
        //  -----------------------------------------------------------------------------
        const calculatedString = jsonStringify (calculatedOutput);
        const storedString = jsonStringify (storedOutput);
        let errorMessage = message + ' computed ' + storedString + ' stored: ' + calculatedString;
        if (key !== undefined) {
            errorMessage = ' | ' + key + ' | ' + 'computed value: ' + storedString + ' stored value: ' + calculatedString;
        }
        assert (cond, errorMessage);
    }

    loadMarketsFromFile (id: string) {
        // load markets from file
        // to make this test as fast as possible
        // and basically independent from the exchange
        // so we can run it offline
        const filename = this.rootDir + './ts/src/test/static/markets/' + id + '.json';
        const content = ioFileRead (filename);
        return content;
    }

    loadCurrenciesFromFile (id: string) {
        const filename = this.rootDir + './ts/src/test/static/currencies/' + id + '.json';
        const content = ioFileRead (filename);
        return content;
    }

    loadStaticData (folder: string, targetExchange: string = undefined) {
        const result = {};
        if (targetExchange) {
            // read a single exchange
            const path = folder + targetExchange + '.json';
            if (!ioFileExists (path)) {
                dump ('[WARN] tests not found: ' + path);
                return undefined;
            }
            result[targetExchange] = ioFileRead (path);
            return result;
        }
        const files = ioDirRead (folder);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const exchangeName = file.replace ('.json', '');
            const content = ioFileRead (folder + file);
            result[exchangeName] = content;
        }
        return result;
    }

    removeHostnamefromUrl (url: string) {
        if (url === undefined) {
            return undefined;
        }
        const urlParts = url.split ('/');
        let res = '';
        for (let i = 0; i < urlParts.length; i++) {
            if (i > 2) {
                const current = urlParts[i];
                if (current.indexOf ('?') > -1) {
                    // handle urls like this: /v1/account/accounts?AccessK
                    const currentParts = current.split ('?');
                    res += '/';
                    res += currentParts[0];
                    break;
                }
                res += '/';
                res += current;
            }
        }
        return res;
    }

    urlencodedToDict (url: string) {
        const result = {};
        const parts = url.split ('&');
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const keyValue = part.split ('=');
            const keysLength = keyValue.length;
            if (keysLength !== 2) {
                continue;
            }
            const key = keyValue[0];
            let value = keyValue[1];
            if ((value !== undefined) && ((value.startsWith ('[')) || (value.startsWith ('{')))) {
                // some exchanges might return something like this: timestamp=1699382693405&batchOrders=[{\"symbol\":\"LTCUSDT\",\"side\":\"BUY\",\"newClientOrderI
                value = jsonParse (value);
            }
            result[key] = value;
        }
        return result;
    }

    assertNewAndStoredOutput (exchange: Exchange, skipKeys: string[], newOutput, storedOutput, strictTypeCheck = true, assertingKey = undefined) {
        if (isNullValue (newOutput) && isNullValue (storedOutput)) {
            return true;
            // c# requirement
        }
        if (!newOutput && !storedOutput) {
            return true;
            // c# requirement
        }
        if ((typeof storedOutput === 'object') && (typeof newOutput === 'object')) {
            const storedOutputKeys = Object.keys (storedOutput);
            const newOutputKeys = Object.keys (newOutput);
            const storedKeysLength = storedOutputKeys.length;
            const newKeysLength = newOutputKeys.length;
            this.assertStaticError (storedKeysLength === newKeysLength, 'output length mismatch', storedOutput, newOutput);
            // iterate over the keys
            for (let i = 0; i < storedOutputKeys.length; i++) {
                const key = storedOutputKeys[i];
                if (exchange.inArray (key, skipKeys)) {
                    continue;
                }
                if (!(exchange.inArray (key, newOutputKeys))) {
                    this.assertStaticError (false, 'output key missing: ' + key, storedOutput, newOutput);
                }
                const storedValue = storedOutput[key];
                const newValue = newOutput[key];
                this.assertNewAndStoredOutput (exchange, skipKeys, newValue, storedValue, strictTypeCheck, key);
            }
        } else if (Array.isArray (storedOutput) && (Array.isArray (newOutput))) {
            const storedArrayLength = storedOutput.length;
            const newArrayLength = newOutput.length;
            this.assertStaticError (storedArrayLength === newArrayLength, 'output length mismatch', storedOutput, newOutput);
            for (let i = 0; i < storedOutput.length; i++) {
                const storedItem = storedOutput[i];
                const newItem = newOutput[i];
                this.assertNewAndStoredOutput (exchange, skipKeys, newItem, storedItem, strictTypeCheck);
            }
        } else {
            // built-in types like strings, numbers, booleans
            const sanitizedNewOutput = (!newOutput) ? undefined : newOutput; // we store undefined as nulls in the json file so we need to convert it back
            const sanitizedStoredOutput = (!storedOutput) ? undefined : storedOutput;
            const newOutputString = sanitizedNewOutput ? sanitizedNewOutput.toString () : "undefined";
            const storedOutputString = sanitizedStoredOutput ? sanitizedStoredOutput.toString () : "undefined";
            const messageError = 'output value mismatch:' + newOutputString + ' != ' + storedOutputString;
            if (strictTypeCheck && (this.lang !== 'C#')) { // in c# types are different, so we can't do strict type check
                // upon building the request we want strict type check to make sure all the types are correct
                // when comparing the response we want to allow some flexibility, because a 50.0 can be equal to 50 after saving it to the json file
                this.assertStaticError (sanitizedNewOutput === sanitizedStoredOutput, messageError, storedOutput, newOutput, assertingKey);
            } else {
                const isBoolean = (typeof sanitizedNewOutput === 'boolean') || (typeof sanitizedStoredOutput === 'boolean');
                const isString = (typeof sanitizedNewOutput === 'string') || (typeof sanitizedStoredOutput === 'string');
                const isUndefined = (sanitizedNewOutput === undefined) || (sanitizedStoredOutput === undefined); // undefined is a perfetly valid value
                if (isBoolean || isString || isUndefined)  {
                    if (this.lang === 'C#') {
                        // tmp c# number comparsion
                        let isNumber = false;
                        try {
                            exchange.parseToNumeric (sanitizedNewOutput);
                            isNumber = true;
                        } catch (e) {
                            // if we can't parse it to number, then it's not a number
                            isNumber = false;
                        }
                        if (isNumber) {
                            this.assertStaticError (exchange.parseToNumeric (sanitizedNewOutput) === exchange.parseToNumeric (sanitizedStoredOutput), messageError, storedOutput, newOutput, assertingKey);
                            return true;
                        } else {
                            this.assertStaticError (convertAscii (newOutputString) === convertAscii (storedOutputString), messageError, storedOutput, newOutput, assertingKey);
                            return true;
                        }
                    } else {
                        this.assertStaticError (convertAscii (newOutputString) === convertAscii (storedOutputString), messageError, storedOutput, newOutput, assertingKey);
                        return true;
                    }
                } else {
                    if (this.lang === "C#") { // tmp fix, stil failing with the "1.0" != "1" error
                        const stringifiedNewOutput = exchange.numberToString (sanitizedNewOutput);
                        const stringifiedStoredOutput = exchange.numberToString (sanitizedStoredOutput);
                        this.assertStaticError (stringifiedNewOutput.toString () === stringifiedStoredOutput.toString (), messageError, storedOutput, newOutput, assertingKey);
                    } else {
                        const numericNewOutput =  exchange.parseToNumeric (newOutputString);
                        const numericStoredOutput = exchange.parseToNumeric (storedOutputString);
                        this.assertStaticError (numericNewOutput === numericStoredOutput, messageError, storedOutput, newOutput, assertingKey);
                    }
                }
            }
        }
        return true; // c# requ
    }

    assertStaticRequestOutput (exchange, type: string, skipKeys: string[], storedUrl: string, requestUrl: string, storedOutput, newOutput) {
        if (storedUrl !== requestUrl) {
            // remove the host part from the url
            const firstPath = this.removeHostnamefromUrl (storedUrl);
            const secondPath = this.removeHostnamefromUrl (requestUrl);
            this.assertStaticError (firstPath === secondPath, 'url mismatch', firstPath, secondPath);
        }
        // body (aka storedOutput and newOutput) is not defined and information is in the url
        // example: "https://open-api.bingx.com/openApi/spot/v1/trade/order?quoteOrderQty=5&side=BUY&symbol=LTC-USDT&timestamp=1698777135343&type=MARKET&signature=d55a7e4f7f9dbe56c4004c9f3ab340869d3cb004e2f0b5b861e5fbd1762fd9a0
        if ((storedOutput === undefined) && (newOutput === undefined)) {
            if ((storedUrl !== undefined) && (requestUrl !== undefined)) {
                const storedUrlParts = storedUrl.split ('?');
                const newUrlParts = requestUrl.split ('?');
                const storedUrlQuery = exchange.safeValue (storedUrlParts, 1);
                const newUrlQuery = exchange.safeValue (newUrlParts, 1);
                if ((storedUrlQuery === undefined) && (newUrlQuery === undefined)) {
                    // might be a get request without any query parameters
                    // example: https://api.gateio.ws/api/v4/delivery/usdt/positions
                    return;
                }
                const storedUrlParams = this.urlencodedToDict (storedUrlQuery);
                const newUrlParams = this.urlencodedToDict (newUrlQuery);
                this.assertNewAndStoredOutput (exchange, skipKeys, newUrlParams, storedUrlParams);
                return;
            }
        // body is defined
        }
        if (type === 'json' && (storedOutput !== undefined) && (newOutput !== undefined)) {
            if (typeof storedOutput === 'string') {
                storedOutput = jsonParse (storedOutput);
            }
            if (typeof newOutput === 'string') {
                newOutput = jsonParse (newOutput);
            }
        } else if (type === 'urlencoded' && (storedOutput !== undefined) && (newOutput !== undefined)) {
            storedOutput = this.urlencodedToDict (storedOutput);
            newOutput = this.urlencodedToDict (newOutput);
        } else if (type === 'both') {
            if (storedOutput.startsWith ('{') || storedOutput.startsWith ('[')) {
                storedOutput = jsonParse (storedOutput);
                newOutput = jsonParse (newOutput);
            } else {
                storedOutput = this.urlencodedToDict (storedOutput);
                newOutput = this.urlencodedToDict (newOutput);

            }
        }
        this.assertNewAndStoredOutput (exchange, skipKeys, newOutput, storedOutput);
    }

    assertStaticResponseOutput (exchange: Exchange, skipKeys: string[], computedResult, storedResult) {
        this.assertNewAndStoredOutput (exchange, skipKeys, computedResult, storedResult, false);
    }

    sanitizeDataInput (input) {
        // remove nulls and replace with unefined instead
        if (input === undefined) {
            return undefined;
        }
        const newInput = [];
        for (let i = 0; i < input.length; i++) {
            const current = input[i];
            if (isNullValue (current)) {
                newInput.push (undefined);
            } else {
                newInput.push (current);
            }
        }
        return newInput;
    }

    async testMethodStatically (exchange, method: string, data: object, type: string, skipKeys: string[]) {
        let output = undefined;
        let requestUrl = undefined;
        try {
            await callExchangeMethodDynamically (exchange, method, this.sanitizeDataInput (data['input']));
        } catch (e) {
            if (!(e instanceof ProxyError)) {
                // if it's not a BadRequest, it means our request was not created succesfully
                // so we might have an error in the request creation
                throw e;
            }
            output = exchange.last_request_body;
            requestUrl = exchange.last_request_url;
        }
        try {
            const callOutput = exchange.safeValue (data, 'output');
            this.assertStaticRequestOutput (exchange, type, skipKeys, data['url'], requestUrl, callOutput, output);
        }
        catch (e) {
            this.requestTestsFailed = true;
            const errorMessage = '[' + this.lang + '][STATIC_REQUEST_TEST_FAILURE]' + '[' + this.exchangeHint (exchange) + ']' + '[' + method + ']' + '[' + data['description'] + ']' + e.toString ();
            dump ('[TEST_FAILURE]' + errorMessage);
        }
    }

    async testResponseStatically (exchange, method: string, skipKeys: string[], data: object) {
        const expectedResult = exchange.safeValue (data, 'parsedResponse');
        const mockedExchange = setFetchResponse (exchange, data['httpResponse']);
        try {
            const unifiedResult = await callExchangeMethodDynamically (exchange, method, this.sanitizeDataInput (data['input']));
            this.assertStaticResponseOutput (mockedExchange, skipKeys, unifiedResult, expectedResult);
        }
        catch (e) {
            this.requestTestsFailed = true;
            const errorMessage = '[' + this.lang + '][STATIC_RESPONSE_TEST_FAILURE]' + '[' + this.exchangeHint (exchange) + ']' + '[' + method + ']' + '[' + data['description'] + ']' + e.toString ();
            dump ('[TEST_FAILURE]' + errorMessage);
        }
        setFetchResponse (exchange, undefined); // reset state
    }

    initOfflineExchange (exchangeName: string) {
        const markets = this.loadMarketsFromFile (exchangeName);
        const currencies = this.loadCurrenciesFromFile (exchangeName);
        const exchange = initExchange (exchangeName, { 'markets': markets, 'currencies': currencies, 'enableRateLimit': false, 'rateLimit': 1, 'httpProxy': 'http://fake:8080', 'httpsProxy': 'http://fake:8080', 'apiKey': 'key', 'secret': 'secretsecret', 'password': 'password', 'walletAddress': 'wallet', 'privateKey': '0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771', 'uid': 'uid', 'token': 'token', 'accounts': [ { 'id': 'myAccount', 'code': 'USDT' }, { 'id': 'myAccount', 'code': 'USDC' } ], 'options': { 'enableUnifiedAccount': true, 'enableUnifiedMargin': false, 'accessToken': 'token', 'expires': 999999999999999, 'leverageBrackets': {}}});
        exchange.currencies = currencies; // not working in python if assigned  in the config dict
        return exchange;
    }

    async testExchangeRequestStatically (exchangeName: string, exchangeData: object, testName: string = undefined) {
        // instantiate the exchange and make sure that we sink the requests to avoid an actual request
        const exchange = this.initOfflineExchange (exchangeName);
        const methods = exchange.safeValue (exchangeData, 'methods', {});
        const methodsNames = Object.keys (methods);
        for (let i = 0; i < methodsNames.length; i++) {
            const method = methodsNames[i];
            const results = methods[method];
            for (let j = 0; j < results.length; j++) {
                const result = results[j];
                const oldExchangeOptions = exchange.options; // snapshot options;
                const testExchangeOptions = exchange.safeValue (result, 'options', {});
                exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); // custom options to be used in the tests
                const description = exchange.safeValue (result, 'description');
                if ((testName !== undefined) && (testName !== description)) {
                    continue;
                }
                const isDisabled = exchange.safeBool (result, 'disabled', false);
                if (isDisabled) {
                    continue;
                }
                const type = exchange.safeString (exchangeData, 'outputType');
                const skipKeys = exchange.safeValue (exchangeData, 'skipKeys', []);
                await this.testMethodStatically (exchange, method, result, type, skipKeys);
                // reset options
                exchange.options = exchange.deepExtend (oldExchangeOptions, {});
            }
        }
        await close (exchange);
        return true; // in c# methods that will be used with promiseAll need to return something
    }

    async testExchangeResponseStatically (exchangeName: string, exchangeData: object, testName: string = undefined) {
        const exchange = this.initOfflineExchange (exchangeName);
        const methods = exchange.safeValue (exchangeData, 'methods', {});
        const options = exchange.safeValue (exchangeData, 'options', {});
        exchange.options = exchange.deepExtend (exchange.options, options); // custom options to be used in the tests
        const methodsNames = Object.keys (methods);
        for (let i = 0; i < methodsNames.length; i++) {
            const method = methodsNames[i];
            const results = methods[method];
            for (let j = 0; j < results.length; j++) {
                const result = results[j];
                const description = exchange.safeValue (result, 'description');
                const oldExchangeOptions = exchange.options; // snapshot options;
                const testExchangeOptions = exchange.safeValue (result, 'options', {});
                exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); // custom options to be used in the tests
                const isDisabled = exchange.safeBool (result, 'disabled', false);
                if (isDisabled) {
                    continue;
                }
                const isDisabledCSharp = exchange.safeBool (result, 'disabledCS', false);
                if (isDisabledCSharp && (this.lang === 'C#')) {
                    continue;
                }
                const isDisabledPHP = exchange.safeBool (result, 'disabledPHP', false);
                if (isDisabledPHP && (this.lang === 'PHP')) {
                    continue;
                }
                if ((testName !== undefined) && (testName !== description)) {
                    continue;
                }
                const skipKeys = exchange.safeValue (exchangeData, 'skipKeys', []);
                await this.testResponseStatically (exchange, method, skipKeys, result);
                // reset options
                exchange.options = exchange.deepExtend (oldExchangeOptions, {});
            }
        }
        await close (exchange);
        return true; // in c# methods that will be used with promiseAll need to return something
    }

    getNumberOfTestsFromExchange (exchange, exchangeData: object, testName: string = undefined) {
        if (testName !== undefined) {
            return 1;
        }
        let sum = 0;
        const methods = exchangeData['methods'];
        const methodsNames = Object.keys (methods);
        for (let i = 0; i < methodsNames.length; i++) {
            const method = methodsNames[i];
            const results = methods[method];
            const resultsLength = results.length;
            sum = exchange.sum (sum, resultsLength);
        }
        return sum;
    }

    async runStaticRequestTests (targetExchange: string = undefined, testName: string = undefined) {
        await this.runStaticTests ('request', targetExchange, testName);
    }

    async runStaticTests (type: string, targetExchange: string = undefined, testName: string = undefined) {
        const folder = this.rootDir + './ts/src/test/static/' + type + '/';
        const staticData = this.loadStaticData (folder, targetExchange);
        if (staticData === undefined) {
            return;
        }
        const exchanges = Object.keys (staticData);
        const exchange = initExchange ('Exchange', {}); // tmp to do the calculations until we have the ast-transpiler transpiling this code
        const promises = [];
        let sum = 0;
        if (targetExchange) {
            dump ("[INFO:MAIN] Exchange to test: " + targetExchange);
        }
        if (testName) {
            dump ("[INFO:MAIN] Testing only: " + testName);
        }
        for (let i = 0; i < exchanges.length; i++) {
            const exchangeName = exchanges[i];
            const exchangeData = staticData[exchangeName];
            const numberOfTests = this.getNumberOfTestsFromExchange (exchange, exchangeData, testName);
            sum = exchange.sum (sum, numberOfTests);
            if (type === 'request') {
                promises.push (this.testExchangeRequestStatically (exchangeName, exchangeData, testName));
            } else {
                promises.push (this.testExchangeResponseStatically (exchangeName, exchangeData, testName));
            }
        }
        await Promise.all (promises);
        if (this.requestTestsFailed || this.responseTestsFailed) {
            exitScript (1);
        } else {
            const successMessage = '[' + this.lang + '][TEST_SUCCESS] ' + sum.toString () + ' static ' + type + ' tests passed.';
            dump ('[INFO]' + successMessage);
        }
    }

    async runStaticResponseTests (exchangeName = undefined, test = undefined) {
        //  -----------------------------------------------------------------------------
        //  --- Init of mockResponses tests functions------------------------------------
        //  -----------------------------------------------------------------------------
        await this.runStaticTests ('response', exchangeName, test);
    }

    async runBrokerIdTests () {
        //  -----------------------------------------------------------------------------
        //  --- Init of brokerId tests functions-----------------------------------------
        //  -----------------------------------------------------------------------------
        const promises = [
            this.testBinance (),
            this.testOkx (),
            this.testCryptocom (),
            this.testBybit (),
            this.testKucoin (),
            this.testKucoinfutures (),
            this.testBitget (),
            this.testMexc (),
            this.testHtx (),
            this.testWoo (),
            this.testBitmart (),
            this.testCoinex (),
            this.testBingx (),
            this.testPhemex (),
            this.testBlofin (),
            this.testHyperliquid (),
        ];
        await Promise.all (promises);
        const successMessage = '[' + this.lang + '][TEST_SUCCESS] brokerId tests passed.';
        dump ('[INFO]' + successMessage);
        exitScript (0);
    }

    async testBinance () {
        const exchange = this.initOfflineExchange ('binance');
        const spotId = 'x-R4BD3S82';
        let spotOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = this.urlencodedToDict (exchange.last_request_body);
        }
        const clientOrderId = spotOrderRequest['newClientOrderId'];
        const spotIdString = spotId.toString ();
        assert (clientOrderId.startsWith (spotIdString), 'binance - spot clientOrderId: ' + clientOrderId + ' does not start with spotId' + spotIdString);
        const swapId = 'x-xcKtGhcu';
        let swapOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapOrderRequest = this.urlencodedToDict (exchange.last_request_body);
        }
        let swapInverseOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USD:BTC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapInverseOrderRequest = this.urlencodedToDict (exchange.last_request_body);
        }
        const clientOrderIdSwap = swapOrderRequest['newClientOrderId'];
        const swapIdString = swapId.toString ();
        assert (clientOrderIdSwap.startsWith (swapIdString), 'binance - swap clientOrderId: ' + clientOrderIdSwap + ' does not start with swapId' + swapIdString);
        const clientOrderIdInverse = swapInverseOrderRequest['newClientOrderId'];
        assert (clientOrderIdInverse.startsWith (swapIdString), 'binance - swap clientOrderIdInverse: ' + clientOrderIdInverse + ' does not start with swapId' + swapIdString);
        await close (exchange);
        return true;
    }

    async testOkx () {
        const exchange = this.initOfflineExchange ('okx');
        const id = 'e847386590ce4dBC';
        let spotOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = jsonParse (exchange.last_request_body);
        }
        const clientOrderId = spotOrderRequest[0]['clOrdId']; // returns order inside array
        const idString = id.toString ();
        assert (clientOrderId.startsWith (idString), 'okx - spot clientOrderId: ' + clientOrderId + ' does not start with id: ' + idString);
        const spotTag = spotOrderRequest[0]['tag'];
        assert (spotTag === id, 'okx - id: ' + id + ' different from spot tag: ' + spotTag);
        let swapOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapOrderRequest = jsonParse (exchange.last_request_body);
        }
        const clientOrderIdSwap = swapOrderRequest[0]['clOrdId'];
        assert (clientOrderIdSwap.startsWith (idString), 'okx - swap clientOrderId: ' + clientOrderIdSwap + ' does not start with id: ' + idString);
        const swapTag = swapOrderRequest[0]['tag'];
        assert (swapTag === id, 'okx - id: ' + id + ' different from swap tag: ' + swapTag);
        await close (exchange);
        return true;
    }

    async testCryptocom () {
        const exchange = this.initOfflineExchange ('cryptocom');
        const id = 'CCXT';
        await exchange.loadMarkets ();
        let request = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const brokerId = request['params']['broker_id'];
        assert (brokerId === id, 'cryptocom - id: ' + id + ' different from  broker_id: ' + brokerId);
        await close (exchange);
        return true;
    }

    async testBybit () {
        const exchange = this.initOfflineExchange ('bybit');
        let reqHeaders = undefined;
        const id = 'CCXT';
        assert (exchange.options['brokerId'] === id, 'id not in options');
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['Referer'] === id, 'bybit - id: ' + id + ' not in headers.');
        await close (exchange);
        return true;
    }

    async testKucoin () {
        const exchange = this.initOfflineExchange ('kucoin');
        let reqHeaders = undefined;
        const optionsString = exchange.options.toString ();
        const spotId =  exchange.options['partner']['spot']['id'];
        const spotKey =  exchange.options['partner']['spot']['key'];
        assert (spotId === 'ccxt', 'kucoin - id: ' + spotId + ' not in options: ' + optionsString);
        assert (spotKey === '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'kucoin - key: ' + spotKey + ' not in options: ' + optionsString);
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        const id = 'ccxt';
        assert (reqHeaders['KC-API-PARTNER'] === id, 'kucoin - id: ' + id + ' not in headers.');
        await close (exchange);
        return true;
    }

    async testKucoinfutures () {
        const exchange = this.initOfflineExchange ('kucoinfutures');
        let reqHeaders = undefined;
        const id = 'ccxtfutures';
        const optionsString = exchange.options['partner']['future'].toString ();
        const futureId = exchange.options['partner']['future']['id'];
        const futureKey = exchange.options['partner']['future']['key'];
        assert (futureId === id, 'kucoinfutures - id: ' + futureId + ' not in options: ' + optionsString);
        assert (futureKey === '1b327198-f30c-4f14-a0ac-918871282f15', 'kucoinfutures - key: ' + futureKey + ' not in options: ' + optionsString);
        try {
            await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['KC-API-PARTNER'] === id, 'kucoinfutures - id: ' + id + ' not in headers.');
        await close (exchange);
        return true;
    }

    async testBitget () {
        const exchange = this.initOfflineExchange ('bitget');
        let reqHeaders = undefined;
        const id = 'p4sve';
        const optionsString = exchange.options.toString ();
        assert (exchange.options['broker'] === id, 'bitget - id: ' + id + ' not in options: ' + optionsString);
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['X-CHANNEL-API-CODE'] === id, 'bitget - id: ' + id + ' not in headers.');
        await close (exchange);
        return true;
    }

    async testMexc () {
        const exchange = this.initOfflineExchange ('mexc');
        let reqHeaders = undefined;
        const id = 'CCXT';
        const optionsString = exchange.options.toString ();
        assert (exchange.options['broker'] === id, 'mexc - id: ' + id + ' not in options: ' + optionsString);
        await exchange.loadMarkets ();
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        const reqHeadersString = reqHeaders !== undefined ? reqHeaders.toString () : 'undefined';
        assert (reqHeaders['source'] === id, 'mexc - id: ' + id + ' not in headers: ' + reqHeadersString);
        await close (exchange);
        return true;
    }

    async testHtx () {
        const exchange = this.initOfflineExchange ('htx');
        // spot test
        const id = 'AA03022abc';
        let spotOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = jsonParse (exchange.last_request_body);
        }
        const clientOrderId = spotOrderRequest['client-order-id'];
        const idString = id.toString ();
        assert (clientOrderId.startsWith (idString), 'htx - spot clientOrderId ' + clientOrderId + ' does not start with id: ' + idString);
        // swap test
        let swapOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapOrderRequest = jsonParse (exchange.last_request_body);
        }
        let swapInverseOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USD:BTC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapInverseOrderRequest = jsonParse (exchange.last_request_body);
        }
        const clientOrderIdSwap = swapOrderRequest['channel_code'];
        assert (clientOrderIdSwap.startsWith (idString), 'htx - swap channel_code ' + clientOrderIdSwap + ' does not start with id: ' + idString);
        const clientOrderIdInverse = swapInverseOrderRequest['channel_code'];
        assert (clientOrderIdInverse.startsWith (idString), 'htx - swap inverse channel_code ' + clientOrderIdInverse + ' does not start with id: ' + idString);
        await close (exchange);
        return true;
    }

    async testWoo () {
        const exchange = this.initOfflineExchange ('woo');
        // spot test
        const id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
        let spotOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = this.urlencodedToDict (exchange.last_request_body);
        }
        const brokerId = spotOrderRequest['broker_id'];
        const idString = id.toString ();
        assert (brokerId.startsWith (idString), 'woo - broker_id: ' + brokerId + ' does not start with id: ' + idString);
        // swap test
        let stopOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, { 'stopPrice': 30000 });
        } catch (e) {
            stopOrderRequest = jsonParse (exchange.last_request_body);
        }
        const clientOrderIdStop = stopOrderRequest['brokerId'];
        assert (clientOrderIdStop.startsWith (idString), 'woo - brokerId: ' + clientOrderIdStop + ' does not start with id: ' + idString);
        await close (exchange);
        return true;
    }

    async testBitmart () {
        const exchange = this.initOfflineExchange ('bitmart');
        let reqHeaders = undefined;
        const id = 'CCXTxBitmart000';
        assert (exchange.options['brokerId'] === id, 'bitmart - id: ' + id + ' not in options');
        await exchange.loadMarkets ();
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['X-BM-BROKER-ID'] === id, 'bitmart - id: ' + id + ' not in headers');
        await close (exchange);
        return true;
    }

    async testCoinex () {
        const exchange = this.initOfflineExchange ('coinex');
        const id = 'x-167673045';
        assert (exchange.options['brokerId'] === id, 'coinex - id: ' + id + ' not in options');
        let spotOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = jsonParse (exchange.last_request_body);
        }
        const clientOrderId = spotOrderRequest['client_id'];
        const idString = id.toString ();
        assert (clientOrderId.startsWith (idString), 'coinex - clientOrderId: ' + clientOrderId + ' does not start with id: ' + idString);
        await close (exchange);
        return true;
    }

    async testBingx () {
        const exchange = this.initOfflineExchange ('bingx');
        let reqHeaders = undefined;
        const id = 'CCXT';
        const optionsString = exchange.options.toString ();
        assert (exchange.options['broker'] === id, 'bingx - id: ' + id + ' not in options: ' + optionsString);
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        const reqHeadersString = reqHeaders !== undefined ? reqHeaders.toString () : 'undefined';
        assert (reqHeaders['X-SOURCE-KEY'] === id, 'bingx - id: ' + id + ' not in headers: ' + reqHeadersString);
        await close (exchange);
    }

    async testPhemex () {
        const exchange = this.initOfflineExchange ('phemex');
        const id = 'CCXT123456';
        let request = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const clientOrderId = request['clOrdID'];
        const idString = id.toString ();
        assert (clientOrderId.startsWith (idString), 'phemex - clOrdID: ' + clientOrderId + ' does not start with id: ' + idString);
        await close (exchange);
    }

    async testBlofin () {
        const exchange = this.initOfflineExchange ('blofin');
        const id = 'ec6dd3a7dd982d0b';
        let request = undefined;
        try {
            await exchange.createOrder ('LTC/USDT:USDT', 'market', 'buy', 1);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const brokerId = request['brokerId'];
        const idString = id.toString ();
        assert (brokerId.startsWith (idString), 'blofin - brokerId: ' + brokerId + ' does not start with id: ' + idString);
        await close (exchange);
    }

    async testHyperliquid () {
        const exchange = this.initOfflineExchange ('hyperliquid');
        const id = '1';
        let request = undefined;
        try {
            await exchange.createOrder ('SOL/USDC:USDC', 'limit', 'buy', 1, 100);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const brokerId = (request['action']['brokerCode']).toString ();
        assert (brokerId === id, 'hyperliquid - brokerId: ' + brokerId + ' does not start with id: ' + id);
        await close (exchange);
    }
}
// ***** AUTO-TRANSPILER-END *****
// *******************************
(new testMainClass ()).init (exchangeIdFromArgv, exchangeSymbol);
