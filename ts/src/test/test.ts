// ----------------------------------------------------------------------------
/* eslint-disable max-classes-per-file */
import fs, { readFile } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import assert from 'assert';
import ccxt, { Exchange } from '../../ccxt.js';
import errorsHierarchy from '../base/errorHierarchy.js';


// js specific codes //
const DIR_NAME = fileURLToPath (new URL ('.', import.meta.url));
process.on ('uncaughtException', (e) => {
    throw new Error (exceptionMessage (e));
    // process.exit (1);
});
process.on ('unhandledRejection', (e: any) => {
    throw new Error (exceptionMessage (e));
    // process.exit (1);
});
const [ processPath, , exchangeIdFromArgv = null, exchangeSymbol = undefined ] = process.argv.filter ((x) => !x.startsWith ('--'));
const AuthenticationError = ccxt.AuthenticationError;
const NotSupported = ccxt.NotSupported;
const NetworkError = ccxt.NetworkError;
const ExchangeNotAvailable = ccxt.ExchangeNotAvailable;
const OperationFailed = ccxt.OperationFailed;
const OnMaintenance = ccxt.OnMaintenance;

// non-transpiled part, but shared names among langs
const proxyTestFileName = 'proxies';
class baseMainTestClass {
    lang = 'JS';
    idTests = false;
    requestTestsFailed = false;
    responseTestsFailed = false;
    requestTests = false;
    responseTests = false;
    staticTests = false;
    info = false;
    verbose = false;
    debug = false;
    privateTest = false;
    privateTestOnly = false;
    sandbox = false;
    skippedMethods = {};
    checkedPublicTests = {};
    testFiles = {};
    publicTests = {};
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

function getCliArgValue (arg) {
    return process.argv.includes (arg) || false;
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
}

function initExchange (exchangeId, args): Exchange {
    return new (ccxt)[exchangeId] (args);
}

async function importTestFile (filePath) {
    // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
    return (await import (pathToFileURL (filePath + '.js') as any) as any)['default'];
}

async function setTestFiles (holderClass, properties) {
    // exchange tests
    const finalPropList = properties.concat ([ proxyTestFileName ]);
    for (let i = 0; i < finalPropList.length; i++) {
        const name = finalPropList[i];
        const filePathWoExt = DIR_NAME + '/Exchange/test.' + name;
        if (ioFileExists (filePathWoExt + '.' + ext)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            holderClass.testFiles[name] = await importTestFile (filePathWoExt);
        }
    }
    // errors tests
    const errorHierarchyKeys = Object.keys (errorsHierarchy);
    for (let i = 0; i < errorHierarchyKeys.length; i++) {
        const name = errorHierarchyKeys[i];
        const filePathWoExt = DIR_NAME + '/base/errors/test.' + name;
        if (ioFileExists (filePathWoExt + '.' + ext)) {
            // eslint-disable-next-line global-require, import/no-dynamic-require, no-path-concat
            holderClass.testFiles[name] = await importTestFile (filePathWoExt);
        }
    }
}

function setFetchResponse (exchange: Exchange, mockResponse) {
    exchange.fetch = async (url, method = 'GET', headers = undefined, body = undefined) => mockResponse;
    return exchange;
}

function isNullValue (value) {
    return value === null;
}

async function close (exchange) {
    // stub
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
    }

    async init (exchangeId, symbolArgv) {
        this.parseCliArgs ();

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
        dump ('\nTESTING ', this.ext, { 'exchange': exchangeId, 'symbol': symbolStr }, '\n');
        const exchangeArgs = {
            'verbose': this.verbose,
            'debug': this.debug,
            'enableRateLimit': true,
            'timeout': 30000,
        };
        const exchange = initExchange (exchangeId, exchangeArgs);
        await this.importFiles (exchange);
        this.expandSettings (exchange);
        const symbolOrUndefined = this.checkIfSpecificTestIsChosen (symbolArgv);
        await this.startTest (exchange, symbolOrUndefined);
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

    async importFiles (exchange) {
        // exchange tests
        this.testFiles = {};
        const properties = Object.keys (exchange.has);
        properties.push ('loadMarkets');
        await setTestFiles (this, properties);
    }

    expandSettings (exchange) {
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
        // skipped tests
        const skippedFile = this.rootDirForSkips + 'skip-tests.json';
        const skippedSettings = ioFileRead (skippedFile);
        const skippedSettingsForExchange = exchange.safeValue (skippedSettings, exchangeId, {});
        // others
        const timeout = exchange.safeValue (skippedSettingsForExchange, 'timeout');
        if (timeout !== undefined) {
            exchange.timeout = timeout;
        }
        exchange.httpProxy = exchange.safeString (skippedSettingsForExchange, 'httpProxy');
        exchange.httpsProxy = exchange.safeString (skippedSettingsForExchange, 'httpsProxy');
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

    async testMethod (methodName, exchange, args, isPublic) {
        const isLoadMarkets = (methodName === 'loadMarkets');
        const methodNameInTest = getTestName (methodName);
        // if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
        if (!isPublic && (methodNameInTest in this.checkedPublicTests) && (methodName !== 'fetchCurrencies')) {
            return;
        }
        let skipMessage = undefined;
        const isProxyTest = methodName === this.proxyTestFileName;
        const supportedByExchange = (methodName in exchange.has) && exchange.has[methodName];
        if (!isLoadMarkets && (this.onlySpecificTests.length > 0 && !exchange.inArray (methodNameInTest, this.onlySpecificTests))) {
            skipMessage = '[INFO:IGNORED_TEST]';
        } else if (!isLoadMarkets && !supportedByExchange && !isProxyTest) {
            skipMessage = '[INFO:UNSUPPORTED_TEST]'; // keep it aligned with the longest message
        } else if ((methodName in this.skippedMethods) && (typeof this.skippedMethods[methodName] === 'string')) {
            skipMessage = '[INFO:SKIPPED_TEST]';
        } else if (!(methodNameInTest in this.testFiles)) {
            skipMessage = '[INFO:UNIMPLEMENTED_TEST]';
        }
        // exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
        if (isLoadMarkets) {
            await exchange.loadMarkets (true);
        }
        if (skipMessage) {
            if (this.info) {
                dump (this.addPadding (skipMessage, 25), exchange.id, methodNameInTest);
            }
            return;
        }
        if (this.info) {
            const argsStringified = '(' + args.join (',') + ')';
            dump (this.addPadding ('[INFO:TESTING]', 25), exchange.id, methodNameInTest, argsStringified);
        }
        const skippedProperties = exchange.safeValue (this.skippedMethods, methodName, {});
        await callMethod (this.testFiles, methodNameInTest, exchange, skippedProperties, args);
        // if it was passed successfully, add to the list of successfull tests
        if (isPublic) {
            this.checkedPublicTests[methodNameInTest] = true;
        }
    }

    async testSafe (methodName, exchange, args = [], isPublic = false) {
        // `testSafe` method does not throw an exception, instead mutes it.
        // The reason we mute the thrown exceptions here is because if this test is part
        // of "runPublicTests", then we don't want to stop the whole test if any single
        // test-method fails. For example, if "fetchOrderBook" public test fails, we still
        // want to run "fetchTickers" and other methods. However, independently this fact,
        // from those test-methods we still echo-out (console.log/print...) the exception
        // messages with specific formatted message "[TEST_FAILURE] ..." and that output is
        // then regex-parsed by run-tests.js, so the exceptions are still printed out to
        // console from there. So, even if some public tests fail, the script will continue
        // doing other things (testing other spot/swap or private tests ...)
        const maxRetries = 3;
        const argsStringified = exchange.json (args); // args.join() breaks when we provide a list of symbols | "args.toString()" breaks bcz of "array to string conversion"
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.testMethod (methodName, exchange, args, isPublic);
                return true;
            } catch (e) {
                const isAuthError = (e instanceof AuthenticationError);
                const isNotSupported = (e instanceof NotSupported);
                const isNetworkError = (e instanceof NetworkError); // includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "isOperationFailed", "InvalidNonce", ...
                const isExchangeNotAvailable = (e instanceof ExchangeNotAvailable);
                const isOnMaintenance = (e instanceof OnMaintenance);
                const tempFailure = isNetworkError && (!isExchangeNotAvailable || isOnMaintenance); // we do not mute specifically "ExchangeNotAvailable" excetpion (but its subtype "OnMaintenance" can be muted)
                if (tempFailure) {
                    // if last retry was gone with same `tempFailure` error, then let's eventually return false
                    if (i === maxRetries - 1) {
                        dump ('[TEST_WARNING]', 'Method could not be tested due to a repeated Network/Availability issues', ' | ', exchange.id, methodName, argsStringified);
                    } else {
                        // wait and retry again
                        await exchange.sleep (i * 1000); // increase wait seconds on every retry
                        continue;
                    }
                } else if (e instanceof OnMaintenance) {
                    // in case of maintenance, skip exchange (don't fail the test)
                    dump ('[TEST_WARNING] Exchange is on maintenance', exchange.id);
                }
                // If public test faces authentication error, we don't break (see comments under `testSafe` method)
                else if (isPublic && isAuthError) {
                    // in case of loadMarkets, it means that "tester" (developer or travis) does not have correct authentication, so it does not have a point to proceed at all
                    if (methodName === 'loadMarkets') {
                        dump ('[TEST_WARNING]', 'Exchange can not be tested, because of authentication problems during loadMarkets', exceptionMessage (e), exchange.id, methodName, argsStringified);
                    }
                    if (this.info) {
                        dump ('[TEST_WARNING]', 'Authentication problem for public method', exceptionMessage (e), exchange.id, methodName, argsStringified);
                    }
                } else {
                    // if not a temporary connectivity issue, then mark test as failed (no need to re-try)
                    if (isNotSupported) {
                        dump ('[NOT_SUPPORTED]', exchange.id, methodName, argsStringified);
                        return true; // why consider not supported as a failed test?
                    } else {
                        dump ('[TEST_FAILURE]', exceptionMessage (e), exchange.id, methodName, argsStringified);
                    }
                }
                return false;
            }
        }
    }

    async runPublicTests (exchange, symbol) {
        const tests = {
            'fetchCurrencies': [],
            'fetchTicker': [ symbol ],
            'fetchTickers': [ symbol ],
            'fetchOHLCV': [ symbol ],
            'fetchTrades': [ symbol ],
            'fetchOrderBook': [ symbol ],
            'fetchL2OrderBook': [ symbol ],
            'fetchOrderBooks': [],
            'fetchBidsAsks': [],
            'fetchStatus': [],
            'fetchTime': [],
        };
        const market = exchange.market (symbol);
        const isSpot = market['spot'];
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
        this.publicTests = tests;
        const testNames = Object.keys (tests);
        const promises = [];
        for (let i = 0; i < testNames.length; i++) {
            const testName = testNames[i];
            const testArgs = tests[testName];
            promises.push (this.testSafe (testName, exchange, testArgs, true));
        }
        // todo - not yet ready in other langs too
        // promises.push (testThrottle ());
        const results = await Promise.all (promises);
        // now count which test-methods retuned `false` from "testSafe" and dump that info below
        if (this.info) {
            const errors = [];
            for (let i = 0; i < testNames.length; i++) {
                if (!results[i]) {
                    errors.push (testNames[i]);
                }
            }
            // we don't throw exception for public-tests, see comments under 'testSafe' method
            let errorsInMessage = '';
            if (errors.length) {
                const failedMsg = errors.join (', ');
                errorsInMessage = ' | Failed methods : ' + failedMsg;
            }
            const messageContent = '[INFO:PUBLIC_TESTS_END] ' + market['type'] + errorsInMessage;
            const messageWithPadding = this.addPadding (messageContent, 25);
            dump (messageWithPadding, exchange.id);
        }
    }

    async loadExchange (exchange) {
        const result = await this.testSafe ('loadMarkets', exchange, [], true);
        if (!result) {
            return false;
        }
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
        dump ('Exchange loaded', exchangeSymbolsLength, 'symbols', resultMsg);
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
        ];
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
            dump ('Selected SPOT SYMBOL:', spotSymbol);
        }
        if (swapSymbol !== undefined) {
            dump ('Selected SWAP SYMBOL:', swapSymbol);
        }
        if (!this.privateTestOnly) {
            if (exchange.has['spot'] && spotSymbol !== undefined) {
                if (this.info) {
                    dump ('[INFO: ### SPOT TESTS ###]');
                }
                exchange.options['type'] = 'spot';
                await this.runPublicTests (exchange, spotSymbol);
            }
            if (exchange.has['swap'] && swapSymbol !== undefined) {
                if (this.info) {
                    dump ('[INFO: ### SWAP TESTS ###]');
                }
                exchange.options['type'] = 'swap';
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
            dump ('[Skipping private tests]', 'Keys not found');
            return;
        }
        const code = this.getExchangeCode (exchange);
        // if (exchange.extendedTest) {
        //     await test ('InvalidNonce', exchange, symbol);
        //     await test ('OrderNotFound', exchange, symbol);
        //     await test ('InvalidOrder', exchange, symbol);
        //     await test ('InsufficientFunds', exchange, symbol, balance); // danger zone - won't execute with non-empty balance
        // }
        const tests = {
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
        const market = exchange.market (symbol);
        const isSpot = market['spot'];
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
        const combinedPublicPrivateTests = exchange.deepExtend (this.publicTests, tests);
        const testNames = Object.keys (combinedPublicPrivateTests);
        const promises = [];
        for (let i = 0; i < testNames.length; i++) {
            const testName = testNames[i];
            const testArgs = combinedPublicPrivateTests[testName];
            promises.push (this.testSafe (testName, exchange, testArgs, false));
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
        const errorsCnt = errors.length; // PHP transpile count($errors)
        if (errorsCnt > 0) {
            // throw new Error ('Failed private tests [' + market['type'] + ']: ' + errors.join (', '));
            dump ('[TEST_FAILURE]', 'Failed private tests [' + market['type'] + ']: ' + errors.join (', '));
        } else {
            if (this.info) {
                dump (this.addPadding ('[INFO:PRIVATE_TESTS_DONE]', 25), exchange.id);
            }
        }
    }

    async testProxies (exchange) {
        // these tests should be synchronously executed, because of conflicting nature of proxy settings
        const proxyTestName = this.proxyTestFileName;
        if (this.info) {
            dump (this.addPadding ('[INFO:TESTING]', 25), exchange.id, proxyTestName);
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
            throw new Error ('[TEST_FAILURE] Failed ' + proxyTestName + ' : ' + exceptionMessage (exception));
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
            if (exchange.id === 'binance') {
                // we test proxies functionality just for one random exchange on each build, because proxy functionality is not exchange-specific, instead it's all done from base methods, so just one working sample would mean it works for all ccxt exchanges
                await this.testProxies (exchange);
            }
            await this.testExchange (exchange, symbol);
            await close (exchange);
        } catch (e) {
            await close (exchange);
            throw e;
        }
    }

    assertStaticError (cond:boolean, message: string, calculatedOutput, storedOutput) {
        //  -----------------------------------------------------------------------------
        //  --- Init of static tests functions------------------------------------------
        //  -----------------------------------------------------------------------------
        const calculatedString = jsonStringify (calculatedOutput);
        const outputString = jsonStringify (storedOutput);
        const errorMessage = message + ' expected ' + outputString + ' received: ' + calculatedString;
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
            result[targetExchange] = ioFileRead (folder + targetExchange + '.json');
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

    assertNewAndStoredOutput (exchange: Exchange, skipKeys: string[], newOutput, storedOutput, strictTypeCheck = true) {
        if (isNullValue (newOutput) && isNullValue (storedOutput)) {
            return;
        }
        if (!newOutput && !storedOutput) {
            return;
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
                this.assertNewAndStoredOutput (exchange, skipKeys, newValue, storedValue, strictTypeCheck);
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
            if (strictTypeCheck) {
                // upon building the request we want strict type check to make sure all the types are correct
                // when comparing the response we want to allow some flexibility, because a 50.0 can be equal to 50 after saving it to the json file
                this.assertStaticError (sanitizedNewOutput === sanitizedStoredOutput, messageError, storedOutput, newOutput);
            } else {
                const isBoolean = (typeof sanitizedNewOutput === 'boolean') || (typeof sanitizedStoredOutput === 'boolean');
                const isString = (typeof sanitizedNewOutput === 'string') || (typeof sanitizedStoredOutput === 'string');
                const isUndefined = (sanitizedNewOutput === undefined) || (sanitizedStoredOutput === undefined); // undefined is a perfetly valid value
                if (isBoolean || isString || isUndefined)  {
                    this.assertStaticError (newOutputString === storedOutputString, messageError, storedOutput, newOutput);
                } else {
                    const numericNewOutput =  exchange.parseToNumeric (newOutputString);
                    const numericStoredOutput = exchange.parseToNumeric (storedOutputString);
                    this.assertStaticError (numericNewOutput === numericStoredOutput, messageError, storedOutput, newOutput);
                }
            }
        }
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
        if (type === 'json') {
            if (typeof storedOutput === 'string') {
                storedOutput = jsonParse (storedOutput);
            }
            if (typeof newOutput === 'string') {
                newOutput = jsonParse (newOutput);
            }
        } else if (type === 'urlencoded') {
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
            if (!(e instanceof NetworkError)) {
                // if it's not a network error, it means our request was not created succesfully
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
            const errorMessage = '[' + this.lang + '][STATIC_REQUEST_TEST_FAILURE]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + e.toString ();
            dump (errorMessage);
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
            const errorMessage = '[' + this.lang + '][STATIC_RESPONSE_TEST_FAILURE]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + e.toString ();
            dump (errorMessage);
        }
        setFetchResponse (exchange, undefined); // reset state
    }

    initOfflineExchange (exchangeName: string) {
        const markets = this.loadMarketsFromFile (exchangeName);
        const currencies = this.loadCurrenciesFromFile (exchangeName);
        const exchange = initExchange (exchangeName, { 'markets': markets, 'enableRateLimit': false, 'rateLimit': 1, 'httpsProxy': 'http://fake:8080', 'apiKey': 'key', 'secret': 'secretsecret', 'password': 'password', 'walletAddress': 'wallet', 'uid': 'uid', 'accounts': [ { 'id': 'myAccount' } ], 'options': { 'enableUnifiedAccount': true, 'enableUnifiedMargin': false, 'accessToken': 'token', 'expires': 999999999999999, 'leverageBrackets': {}}});
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
                const description = exchange.safeValue (result, 'description');
                if ((testName !== undefined) && (testName !== description)) {
                    continue;
                }
                const type = exchange.safeString (exchangeData, 'outputType');
                const skipKeys = exchange.safeValue (exchangeData, 'skipKeys', []);
                await this.testMethodStatically (exchange, method, result, type, skipKeys);
            }
        }
        await close (exchange);
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
                if ((testName !== undefined) && (testName !== description)) {
                    continue;
                }
                const skipKeys = exchange.safeValue (exchangeData, 'skipKeys', []);
                await this.testResponseStatically (exchange, method, skipKeys, result);
            }
        }
        await close (exchange);
    }

    getNumberOfTestsFromExchange (exchange, exchangeData: object) {
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
        const exchanges = Object.keys (staticData);
        const exchange = initExchange ('Exchange', {}); // tmp to do the calculations until we have the ast-transpiler transpiling this code
        const promises = [];
        let sum = 0;
        if (targetExchange) {
            dump ("Exchange to test: " + targetExchange);
        }
        if (testName) {
            dump ("Testing only: " + testName);
        }
        for (let i = 0; i < exchanges.length; i++) {
            const exchangeName = exchanges[i];
            const exchangeData = staticData[exchangeName];
            const numberOfTests = this.getNumberOfTestsFromExchange (exchange, exchangeData);
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
            dump (successMessage);
            exitScript (0);
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
            this.testHuobi (),
            this.testWoo (),
            this.testBitmart (),
            this.testCoinex ()
        ];
        await Promise.all (promises);
        const successMessage = '[' + this.lang + '][TEST_SUCCESS] brokerId tests passed.';
        dump (successMessage);
        exitScript (0);
    }

    async testBinance () {
        const binance = this.initOfflineExchange ('binance');
        const spotId = 'x-R4BD3S82';
        let spotOrderRequest = undefined;
        try {
            await binance.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = this.urlencodedToDict (binance.last_request_body);
        }
        const clientOrderId = spotOrderRequest['newClientOrderId'];
        assert (clientOrderId.startsWith (spotId), 'spot clientOrderId does not start with spotId');
        const swapId = 'x-xcKtGhcu';
        let swapOrderRequest = undefined;
        try {
            await binance.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapOrderRequest = this.urlencodedToDict (binance.last_request_body);
        }
        let swapInverseOrderRequest = undefined;
        try {
            await binance.createOrder ('BTC/USD:BTC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapInverseOrderRequest = this.urlencodedToDict (binance.last_request_body);
        }
        const clientOrderIdSpot = swapOrderRequest['newClientOrderId'];
        assert (clientOrderIdSpot.startsWith (swapId), 'swap clientOrderId does not start with swapId');
        const clientOrderIdInverse = swapInverseOrderRequest['newClientOrderId'];
        assert (clientOrderIdInverse.startsWith (swapId), 'swap clientOrderIdInverse does not start with swapId');
        await close (binance);
    }

    async testOkx () {
        const okx = this.initOfflineExchange ('okx');
        const id = 'e847386590ce4dBC';
        let spotOrderRequest = undefined;
        try {
            await okx.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = jsonParse (okx.last_request_body);
        }
        const clientOrderId = spotOrderRequest[0]['clOrdId']; // returns order inside array
        assert (clientOrderId.startsWith (id), 'spot clientOrderId does not start with id');
        assert (spotOrderRequest[0]['tag'] === id, 'id different from spot tag');
        let swapOrderRequest = undefined;
        try {
            await okx.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapOrderRequest = jsonParse (okx.last_request_body);
        }
        const clientOrderIdSpot = swapOrderRequest[0]['clOrdId'];
        assert (clientOrderIdSpot.startsWith (id), 'swap clientOrderId does not start with id');
        assert (swapOrderRequest[0]['tag'] === id, 'id different from swap tag');
        await close (okx);
    }

    async testCryptocom () {
        const cryptocom = this.initOfflineExchange ('cryptocom');
        const id = 'CCXT';
        await cryptocom.loadMarkets ();
        let request = undefined;
        try {
            await cryptocom.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (cryptocom.last_request_body);
        }
        assert (request['params']['broker_id'] === id, 'id different from  broker_id');
        await close (cryptocom);
    }

    async testBybit () {
        const bybit = this.initOfflineExchange ('bybit');
        let reqHeaders = undefined;
        const id = 'CCXT';
        assert (bybit.options['brokerId'] === id, 'id not in options');
        try {
            await bybit.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = bybit.last_request_headers;
        }
        assert (reqHeaders['Referer'] === id, 'id not in headers');
        await close (bybit);
    }

    async testKucoin () {
        const kucoin = this.initOfflineExchange ('kucoin');
        let reqHeaders = undefined;
        assert (kucoin.options['partner']['spot']['id'] === 'ccxt', 'id not in options');
        assert (kucoin.options['partner']['spot']['key'] === '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'key not in options');
        try {
            await kucoin.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = kucoin.last_request_headers;
        }
        const id = 'ccxt';
        assert (reqHeaders['KC-API-PARTNER'] === id, 'id not in headers');
        await close (kucoin);
    }

    async testKucoinfutures () {
        const kucoin = this.initOfflineExchange ('kucoinfutures');
        let reqHeaders = undefined;
        const id = 'ccxtfutures';
        assert (kucoin.options['partner']['future']['id'] === id, 'id not in options');
        assert (kucoin.options['partner']['future']['key'] === '1b327198-f30c-4f14-a0ac-918871282f15', 'key not in options');
        try {
            await kucoin.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = kucoin.last_request_headers;
        }
        assert (reqHeaders['KC-API-PARTNER'] === id, 'id not in headers');
        await close (kucoin);
    }

    async testBitget () {
        const bitget = this.initOfflineExchange ('bitget');
        let reqHeaders = undefined;
        const id = 'p4sve';
        assert (bitget.options['broker'] === id, 'id not in options');
        try {
            await bitget.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = bitget.last_request_headers;
        }
        assert (reqHeaders['X-CHANNEL-API-CODE'] === id, 'id not in headers');
        await close (bitget);
    }

    async testMexc () {
        const mexc = this.initOfflineExchange ('mexc');
        let reqHeaders = undefined;
        const id = 'CCXT';
        assert (mexc.options['broker'] === id, 'id not in options');
        await mexc.loadMarkets ();
        try {
            await mexc.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = mexc.last_request_headers;
        }
        assert (reqHeaders['source'] === id, 'id not in headers');
        await close (mexc);
    }

    async testHuobi () {
        const huobi = this.initOfflineExchange ('huobi');
        // spot test
        const id = 'AA03022abc';
        let spotOrderRequest = undefined;
        try {
            await huobi.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = jsonParse (huobi.last_request_body);
        }
        const clientOrderId = spotOrderRequest['client-order-id'];
        assert (clientOrderId.startsWith (id), 'spot clientOrderId does not start with id');
        // swap test
        let swapOrderRequest = undefined;
        try {
            await huobi.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapOrderRequest = jsonParse (huobi.last_request_body);
        }
        let swapInverseOrderRequest = undefined;
        try {
            await huobi.createOrder ('BTC/USD:BTC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapInverseOrderRequest = jsonParse (huobi.last_request_body);
        }
        const clientOrderIdSpot = swapOrderRequest['channel_code'];
        assert (clientOrderIdSpot.startsWith (id), 'swap channel_code does not start with id');
        const clientOrderIdInverse = swapInverseOrderRequest['channel_code'];
        assert (clientOrderIdInverse.startsWith (id), 'swap inverse channel_code does not start with id');
        await close (huobi);
    }

    async testWoo () {
        const woo = this.initOfflineExchange ('woo');
        // spot test
        const id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
        let spotOrderRequest = undefined;
        try {
            await woo.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = this.urlencodedToDict (woo.last_request_body);
        }
        const brokerId = spotOrderRequest['broker_id'];
        assert (brokerId.startsWith (id), 'broker_id does not start with id');
        // swap test
        let stopOrderRequest = undefined;
        try {
            await woo.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, { 'stopPrice': 30000 });
        } catch (e) {
            stopOrderRequest = jsonParse (woo.last_request_body);
        }
        const clientOrderIdSpot = stopOrderRequest['brokerId'];
        assert (clientOrderIdSpot.startsWith (id), 'brokerId does not start with id');
        await close (woo);
    }

    async testBitmart () {
        const bitmart = this.initOfflineExchange ('bitmart');
        let reqHeaders = undefined;
        const id = 'CCXTxBitmart000';
        assert (bitmart.options['brokerId'] === id, 'id not in options');
        await bitmart.loadMarkets ();
        try {
            await bitmart.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = bitmart.last_request_headers;
        }
        assert (reqHeaders['X-BM-BROKER-ID'] === id, 'id not in headers');
        await close (bitmart);
    }

    async testCoinex () {
        const exchange = this.initOfflineExchange ('coinex');
        const id = 'x-167673045';
        assert (exchange.options['brokerId'] === id, 'id not in options');
        let spotOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = jsonParse (exchange.last_request_body);
        }
        const clientOrderId = spotOrderRequest['client_id'];
        assert (clientOrderId.startsWith (id), 'clientOrderId does not start with id');
        await close (exchange);
    }
}
// ***** AUTO-TRANSPILER-END *****
// *******************************
(new testMainClass ()).init (exchangeIdFromArgv, exchangeSymbol);
