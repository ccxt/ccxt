// ----------------------------------------------------------------------------

import assert from 'assert';
import { Exchange } from '../../ccxt.js';
import { Str } from '../base/types.js';

import {
    // errors
    AuthenticationError,
    NotSupported,
    InvalidProxySettings,
    ExchangeNotAvailable,
    OperationFailed,
    OnMaintenance,
    // shared
    getCliArgValue,
    //
    getRootDir,
    isSync,
    dump,
    jsonParse,
    jsonStringify,
    convertAscii,
    ioFileExists,
    ioFileRead,
    ioDirRead,
    callMethod,
    callMethodSync,
    callExchangeMethodDynamically,
    callExchangeMethodDynamicallySync,
    getRootException,
    exceptionMessage,
    exitScript,
    getExchangeProp,
    setExchangeProp,
    initExchange,
    getTestFilesSync,
    getTestFiles,
    setFetchResponse,
    isNullValue,
    close,
    getEnvVars,
    getLang,
    getExt,
} from './tests.helpers.js';


class testMainClass {
    idTests: boolean = false;
    requestTestsFailed: boolean = false;
    responseTestsFailed: boolean = false;
    requestTests: boolean = false;
    wsTests: boolean = false;
    responseTests: boolean = false;
    info: boolean = false;
    verbose: boolean = false;
    debug: boolean = false;
    privateTest: boolean = false;
    privateTestOnly: boolean = false;
    loadKeys: boolean = false;
    sandbox: boolean = false;
    onlySpecificTests: string[] = [];
    skippedSettingsForExchange = {};
    skippedMethods = {};
    checkedPublicTests = {};
    testFiles: any = {};
    publicTests = {};
    ext: string = "";
    lang: string = "";
    proxyTestFileName = "proxies";

    parseCliArgsAndProps () {
        this.responseTests = getCliArgValue ('--responseTests') || getCliArgValue ('--response');
        this.idTests = getCliArgValue ('--idTests');
        this.requestTests = getCliArgValue ('--requestTests') || getCliArgValue ('--request');
        this.info = getCliArgValue ('--info');
        this.verbose = getCliArgValue ('--verbose');
        this.debug = getCliArgValue ('--debug');
        this.privateTest = getCliArgValue ('--private');
        this.privateTestOnly = getCliArgValue ('--privateOnly');
        this.sandbox = getCliArgValue ('--sandbox');
        this.loadKeys = getCliArgValue ('--loadKeys');
        this.wsTests = getCliArgValue ('--ws');

        this.lang = getLang ();
        this.ext = getExt ();
    }

    async init (exchangeId, symbolArgv, methodArgv) {
        this.parseCliArgsAndProps ();

        if (this.requestTests && this.responseTests) {
            await this.runStaticRequestTests (exchangeId, symbolArgv);
            await this.runStaticResponseTests (exchangeId, symbolArgv);
            return true;
        }
        if (this.responseTests) {
            await this.runStaticResponseTests (exchangeId, symbolArgv);
            return true;
        }
        if (this.requestTests) {
            await this.runStaticRequestTests (exchangeId, symbolArgv); // symbol here is the testname
            return true;
        }
        if (this.idTests) {
            await this.runBrokerIdTests ();
            return true;
        }
        const newLine = "\n";
        dump (newLine + '' + newLine + '' + '[INFO] TESTING ', this.ext, { 'exchange': exchangeId, 'symbol': symbolArgv, 'method': methodArgv, 'isWs': this.wsTests, 'useProxy': getCliArgValue ('--useProxy') }, newLine);
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
        this.checkIfSpecificTestIsChosen (methodArgv);
        await this.startTest (exchange, symbolArgv);
        exitScript (0); // needed to be explicitly finished for WS tests
        return true; // required for c#
    }

    checkIfSpecificTestIsChosen (methodArgv) {
        if (methodArgv !== undefined) {
            const testFileNames = Object.keys (this.testFiles);
            const possibleMethodNames = methodArgv.split (','); // i.e. `test.ts binance fetchBalance,fetchDeposits`
            if (possibleMethodNames.length >= 1) {
                for (let i = 0; i < testFileNames.length; i++) {
                    const testFileName = testFileNames[i];
                    for (let j = 0; j < possibleMethodNames.length; j++) {
                        let methodName = possibleMethodNames[j];
                        methodName = methodName.replace ('()', '');
                        if (testFileName === methodName) {
                            this.onlySpecificTests.push (testFileName);
                        }
                    }
                }
            }
        }
    }

    async importFiles (exchange: Exchange) {
        const properties = Object.keys (exchange.has);
        properties.push ('loadMarkets');
        if (isSync ()) {
            this.testFiles = getTestFilesSync (properties, this.wsTests);
        } else {
            this.testFiles = await getTestFiles (properties, this.wsTests);
        }
        return true;
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
                const envVars = getEnvVars ();
                const credentialValue = (credentialEnvName in envVars) ? envVars[credentialEnvName] : undefined;
                if (credentialValue) {
                    setExchangeProp (exchange, credential, credentialValue);
                }
            }
        }
    }

    expandSettings (exchange: Exchange) {
        const exchangeId = exchange.id;
        const keysGlobal = getRootDir () + 'keys.json';
        const keysLocal = getRootDir () + 'keys.local.json';
        const keysGlobalExists = ioFileExists (keysGlobal);
        const keysLocalExists = ioFileExists (keysLocal);
        let globalSettings = {};
        if (keysGlobalExists) {
            globalSettings = ioFileRead (keysGlobal);
        }
        let localSettings = {};
        if (keysLocalExists) {
            localSettings = ioFileRead (keysLocal);
        }
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
        const skippedFile = getRootDir () + 'skip-tests.json';
        const skippedSettings = ioFileRead (skippedFile);
        this.skippedSettingsForExchange = exchange.safeValue (skippedSettings, exchangeId, {});
        const skippedSettingsForExchange = this.skippedSettingsForExchange;
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

    async testMethod (methodName: string, exchange: any, args: any[], isPublic: boolean) {
        // todo: temporary skip for c#
        if (methodName.indexOf ('OrderBook') >= 0 && this.ext === 'cs') {
            exchange.options['checksum'] = false;
        }
        // todo: temporary skip for php
        if (methodName.indexOf ('OrderBook') >= 0 && this.ext === 'php') {
            return true;
        }
        const skippedPropertiesForMethod = this.getSkips (exchange, methodName);
        const isLoadMarkets = (methodName === 'loadMarkets');
        const isFetchCurrencies = (methodName === 'fetchCurrencies');
        const isProxyTest = (methodName === this.proxyTestFileName);
        const isFeatureTest = (methodName === 'features');
        // if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
        if (!isPublic && (methodName in this.checkedPublicTests) && !isFetchCurrencies) {
            return true;
        }
        let skipMessage = undefined;
        const supportedByExchange = (methodName in exchange.has) && exchange.has[methodName];
        if (!isLoadMarkets && (this.onlySpecificTests.length > 0 && !exchange.inArray (methodName, this.onlySpecificTests))) {
            skipMessage = '[INFO] IGNORED_TEST';
        } else if (!isLoadMarkets && !supportedByExchange && !isProxyTest && !isFeatureTest) {
            skipMessage = '[INFO] UNSUPPORTED_TEST'; // keep it aligned with the longest message
        } else if (typeof skippedPropertiesForMethod === 'string') {
            skipMessage = '[INFO] SKIPPED_TEST';
        } else if (!(methodName in this.testFiles)) {
            skipMessage = '[INFO] UNIMPLEMENTED_TEST';
        }
        // exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
        if (isLoadMarkets) {
            await exchange.loadMarkets (true);
        }
        const name = exchange.id;
        if (skipMessage) {
            if (this.info) {
                dump (this.addPadding (skipMessage, 25), name, methodName);
            }
            return true;
        }
        if (this.info) {
            const argsStringified = '(' + exchange.json (args) + ')'; // args.join() breaks when we provide a list of symbols or multidimensional array; "args.toString()" breaks bcz of "array to string conversion"
            dump (this.addPadding ('[INFO] TESTING', 25), name, methodName, argsStringified);
        }
        if (isSync ()) {
            callMethodSync (this.testFiles, methodName, exchange, skippedPropertiesForMethod, args);
        } else {
            await callMethod (this.testFiles, methodName, exchange, skippedPropertiesForMethod, args);
        }
        if (this.info) {
            dump (this.addPadding ('[INFO] TESTING DONE', 25), name, methodName);
        }
        // add to the list of successed tests
        if (isPublic) {
            this.checkedPublicTests[methodName] = true;
        }
        return true;
    }

    getSkips (exchange: Exchange, methodName: string) {
        let finalSkips = {};
        // check the exact method (i.e. `fetchTrades`) and language-specific (i.e. `fetchTrades.php`)
        const methodNames = [ methodName, methodName + '.' + this.ext ];
        for (let i = 0; i < methodNames.length; i++) {
            const mName = methodNames[i];
            if (mName in this.skippedMethods) {
                // if whole method is skipped, by assigning a string to it, i.e. "fetchOrders":"blabla"
                if (typeof this.skippedMethods[mName] === 'string') {
                    return this.skippedMethods[mName];
                } else {
                    finalSkips = exchange.deepExtend (finalSkips, this.skippedMethods[mName]);
                }
            }
        }
        // get "object-specific" skips
        const objectSkips = {
            'orderBook': [ 'fetchOrderBook', 'fetchOrderBooks', 'fetchL2OrderBook', 'watchOrderBook', 'watchOrderBookForSymbols' ],
            'ticker': [ 'fetchTicker', 'fetchTickers', 'watchTicker', 'watchTickers' ],
            'trade': [ 'fetchTrades', 'watchTrades', 'watchTradesForSymbols' ],
            'ohlcv': [ 'fetchOHLCV', 'watchOHLCV', 'watchOHLCVForSymbols' ],
            'ledger': [ 'fetchLedger', 'fetchLedgerEntry' ],
            'depositWithdraw': [ 'fetchDepositsWithdrawals', 'fetchDeposits', 'fetchWithdrawals' ],
            'depositWithdrawFee': [ 'fetchDepositWithdrawFee', 'fetchDepositWithdrawFees' ],
        };
        const objectNames = Object.keys (objectSkips);
        for (let i = 0; i < objectNames.length; i++) {
            const objectName = objectNames[i];
            const objectMethods = objectSkips[objectName];
            if (exchange.inArray (methodName, objectMethods)) {
                // if whole object is skipped, by assigning a string to it, i.e. "orderBook":"blabla"
                if ((objectName in this.skippedMethods) && (typeof this.skippedMethods[objectName] === 'string')) {
                    return this.skippedMethods[objectName];
                }
                const extraSkips = exchange.safeDict (this.skippedMethods, objectName, {});
                finalSkips = exchange.deepExtend (finalSkips, extraSkips);
            }
        }
        // extend related skips
        // - if 'timestamp' is skipped, we should do so for 'datetime' too
        // - if 'bid' is skipped, skip 'ask' too
        if (('timestamp' in finalSkips) && !('datetime' in finalSkips)) {
            finalSkips['datetime'] = finalSkips['timestamp'];
        }
        if (('bid' in finalSkips) && !('ask' in finalSkips)) {
            finalSkips['ask'] = finalSkips['bid'];
        }
        if (('baseVolume' in finalSkips) && !('quoteVolume' in finalSkips)) {
            finalSkips['quoteVolume'] = finalSkips['baseVolume'];
        }
        return finalSkips;
    }

    async testSafe (methodName, exchange, args = [], isPublic = false) {
        // `testSafe` method does not throw an exception, instead mutes it. The reason we
        // mute the thrown exceptions here is because we don't want to stop the whole
        // tests queue if any single test-method fails. Instead, they are echoed with
        // formatted message "[TEST_FAILURE] ..." and that output is then regex-matched by
        // run-tests.js, so the exceptions are still printed out to console from there.
        const maxRetries = 3;
        const argsStringified = exchange.json (args); // args.join() breaks when we provide a list of symbols or multidimensional array; "args.toString()" breaks bcz of "array to string conversion"
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.testMethod (methodName, exchange, args, isPublic);
                return true;
            }
            catch (ex) {
                const e = getRootException (ex);
                const isLoadMarkets = (methodName === 'loadMarkets');
                const isAuthError = (e instanceof AuthenticationError);
                const isNotSupported = (e instanceof NotSupported);
                const isOperationFailed = (e instanceof OperationFailed); // includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "OperationFailed", "InvalidNonce", ...
                if (isOperationFailed) {
                    // if last retry was gone with same `tempFailure` error, then let's eventually return false
                    if (i === maxRetries - 1) {
                        const isOnMaintenance = (e instanceof OnMaintenance);
                        const isExchangeNotAvailable = (e instanceof ExchangeNotAvailable);
                        let shouldFail = undefined;
                        let retSuccess = undefined;
                        if (isLoadMarkets) {
                            // if "loadMarkets" does not succeed, we must return "false" to caller method, to stop tests continual
                            retSuccess = false;
                            // we might not break exchange tests, if exchange is on maintenance at this moment
                            if (isOnMaintenance) {
                                shouldFail = false;
                            } else {
                                shouldFail = true;
                            }
                        }
                        else {
                            // for any other method tests:
                            if (isExchangeNotAvailable && !isOnMaintenance) {
                                // break exchange tests if "ExchangeNotAvailable" exception is thrown, but it's not maintenance
                                shouldFail = true;
                                retSuccess = false;
                            } else {
                                // in all other cases of OperationFailed, show Warning, but don't mark test as failed
                                shouldFail = false;
                                retSuccess = true;
                            }
                        }
                        // output the message
                        const failType = shouldFail ? '[TEST_FAILURE]' : '[TEST_WARNING]';
                        dump (failType, 'Method could not be tested due to a repeated Network/Availability issues', ' | ', exchange.id, methodName, argsStringified, exceptionMessage (e));
                        return retSuccess;
                    }
                    else {
                        // wait and retry again
                        // (increase wait time on every retry)
                        await exchange.sleep ((i + 1) * 1000);
                        // continue; should not be used because in go for-loops and try-catches are not compatible
                        // is this continue even needed?
                    }
                }
                // if it's not temporary failure, then ...
                else {
                    // if it's loadMarkets, then fail test, because it's mandatory for tests
                    if (isLoadMarkets) {
                        dump ('[TEST_FAILURE]', 'Exchange can not load markets', exceptionMessage (e), exchange.id, methodName, argsStringified);
                        return false;
                    }
                    // if the specific arguments to the test method throws "NotSupported" exception
                    // then let's don't fail the test
                    if (isNotSupported) {
                        if (this.info) {
                            dump ('[INFO] NOT_SUPPORTED', exceptionMessage (e), exchange.id, methodName, argsStringified);
                        }
                        return true;
                    }
                    // If public test faces authentication error, we don't break (see comments under `testSafe` method)
                    if (isPublic && isAuthError) {
                        if (this.info) {
                            dump ('[INFO]', 'Authentication problem for public method', exceptionMessage (e), exchange.id, methodName, argsStringified);
                        }
                        return true;
                    }
                    // in rest of the cases, fail the test
                    else {
                        dump ('[TEST_FAILURE]', exceptionMessage (e), exchange.id, methodName, argsStringified);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    async runPublicTests (exchange, symbol) {
        let tests = {
            'features': [],
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
                'watchOHLCVForSymbols': [ symbol ], // argument type will be handled inside test
                'watchTicker': [ symbol ],
                'watchTickers': [ symbol ],
                'watchBidsAsks': [ symbol ],
                'watchOrderBook': [ symbol ],
                'watchOrderBookForSymbols': [ [ symbol ] ],
                'watchTrades': [ symbol ],
                'watchTradesForSymbols': [ [ symbol ] ],
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
        return true;
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
            dump ('[TEST_FAILURE]', exchange.id, testPrefixString, 'Failed methods : ' + errorsString);
        }
        if (this.info) {
            dump (this.addPadding ('[INFO] END ' + testPrefixString + ' ' + exchange.id, 25));
        }
        return true;
    }

    async loadExchange (exchange) {
        const result = await this.testSafe ('loadMarkets', exchange, [], true);
        if (!result) {
            return false;
        }
        const exchangeSymbolsLength = exchange.symbols.length;
        dump ('[INFO:MAIN] Exchange loaded', exchangeSymbolsLength, 'symbols');
        return true;
    }

    getTestSymbol (exchange, isSpot, symbols) {
        let symbol = undefined;
        const preferredSpotSymbol = exchange.safeString (this.skippedSettingsForExchange, 'preferredSpotSymbol');
        const preferredSwapSymbol = exchange.safeString (this.skippedSettingsForExchange, 'preferredSwapSymbol');
        if (isSpot && preferredSpotSymbol) {
            return preferredSpotSymbol;
        } else if (!isSpot && preferredSwapSymbol) {
            return preferredSwapSymbol;
        }
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
            'BNB',
            'DASH',
            'DOGE',
            'ETC',
            'TRX',
            // fiats
            'USDT',
            'USDC',
            'USD',
            'EUR',
            'TUSD',
            'CNY',
            'JPY',
            'BRL',
        ];
        const spotSymbols = [
            'BTC/USDT',
            'BTC/USDC',
            'BTC/USD',
            'BTC/CNY',
            'BTC/EUR',
            'BTC/AUD',
            'BTC/BRL',
            'BTC/JPY',
            'ETH/USDT',
            'ETH/USDC',
            'ETH/USD',
            'ETH/CNY',
            'ETH/EUR',
            'ETH/AUD',
            'ETH/BRL',
            'ETH/JPY',
            // fiats
            'EUR/USDT',
            'EUR/USD',
            'EUR/USDC',
            'USDT/EUR',
            'USD/EUR',
            'USDC/EUR',
            // non-fiats
            'BTC/ETH',
            'ETH/BTC',
        ];
        const swapSymbols = [
            // linear
            'BTC/USDT:USDT',
            'BTC/USDC:USDC',
            'BTC/USD:USD',
            'ETH/USDT:USDT',
            'ETH/USDC:USDC',
            'ETH/USD:USD',
            // inverse
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
        return true;
    }

    async runPrivateTests (exchange, symbol) {
        if (!exchange.checkRequiredCredentials (false)) {
            dump ('[INFO] Skipping private tests', 'Keys not found');
            return true;
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
        if (getCliArgValue ('--fundedTests')) {
            tests['createOrder'] = [ symbol ];
        }
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
        return true; // required in c#
    }

    async testProxies (exchange) {
        // these tests should be synchronously executed, because of conflicting nature of proxy settings
        const proxyTestName = this.proxyTestFileName;
        // todo: temporary skip for sync py
        if (this.ext === 'py' && isSync ()) {
            return true;
        }
        // try proxy several times
        const maxRetries = 3;
        let exception = undefined;
        for (let j = 0; j < maxRetries; j++) {
            try {
                await this.testMethod (proxyTestName, exchange, [], true);
                return true; // if successfull, then end the test
            } catch (e) {
                exception = e;
                await exchange.sleep (j * 1000);
            }
        }
        // if exception was set, then throw it
        if (exception !== undefined) {
            const errorMessage = '[TEST_FAILURE] Failed ' + proxyTestName + ' : ' + exceptionMessage (exception);
            // temporary comment the below, because c# transpilation failure
            // throw new Exchange Error (errorMessage.toString ());
            dump ('[TEST_WARNING]' + errorMessage);
        }
        return true;
    }

    checkConstructor (exchange) {
        // todo: this might be moved in base tests later
        if (exchange.id === 'binance') {
            assert (exchange.hostname === undefined, 'binance.com hostname should be empty');
            assert (exchange.urls['api']['public'] === 'https://api.binance.com/api/v3', 'https://api.binance.com/api/v3 does not match: ' + exchange.urls['api']['public']);
            assert (('lending/union/account' in exchange.api['sapi']['get']), 'SAPI should contain the endpoint lending/union/account, ' + jsonStringify (exchange.api['sapi']['get']));
        } else if (exchange.id === 'binanceus') {
            assert (exchange.hostname === 'binance.us', 'binance.us hostname does not match ' + exchange.hostname);
            assert (exchange.urls['api']['public'] === 'https://api.binance.us/api/v3', 'https://api.binance.us/api/v3 does not match: ' + exchange.urls['api']['public']);
            // todo: assert (!('lending/union/account' in exchange.api['sapi']['get']), 'SAPI should NOT contain the endpoint lending/union/account, ' + jsonStringify (exchange.api['sapi']['get']));
        }
    }

    async startTest (exchange, symbol) {
        // we do not need to test aliases
        if (exchange.alias) {
            return true;
        }
        this.checkConstructor (exchange);
        if (this.sandbox || getExchangeProp (exchange, 'sandbox')) {
            exchange.setSandboxMode (true);
        }
        // because of python-async, we need proper `.close()` handling
        try {
            const result = await this.loadExchange (exchange);
            if (!result) {
                if (!isSync ()) {
                    await close (exchange);
                }
                return true;
            }
            // if (exchange.id === 'binance') {
            //     // we test proxies functionality just for one random exchange on each build, because proxy functionality is not exchange-specific, instead it's all done from base methods, so just one working sample would mean it works for all ccxt exchanges
            //     // await this.testProxies (exchange);
            // }
            await this.testExchange (exchange, symbol);
            if (!isSync ()) {
                await close (exchange);
            }
        } catch (e) {
            if (!isSync ()) {
                await close (exchange);
            }
            throw e;
        }
        return true; // required in c#
    }

    assertStaticError (cond:boolean, message: string, calculatedOutput, storedOutput, key = undefined) {
        //  -----------------------------------------------------------------------------
        //  --- Init of static tests functions------------------------------------------
        //  -----------------------------------------------------------------------------
        const calculatedString = jsonStringify (calculatedOutput);
        const storedString = jsonStringify (storedOutput);
        let errorMessage = message;
        if (key !== undefined) {
            errorMessage = '[' + key + ']';
        }
        errorMessage += ' computed: ' + storedString + ' stored: ' + calculatedString;
        assert (cond, errorMessage);
    }

    loadMarketsFromFile (id: string) {
        // load markets from file
        // to make this test as fast as possible
        // and basically independent from the exchange
        // so we can run it offline
        const filename = getRootDir () + './ts/src/test/static/markets/' + id + '.json';
        const content = ioFileRead (filename);
        return content;
    }

    loadCurrenciesFromFile (id: string) {
        const filename = getRootDir () + './ts/src/test/static/currencies/' + id + '.json';
        const content = ioFileRead (filename);
        return content;
    }

    loadStaticData (folder: string, targetExchange: Str = undefined) {
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

    assertNewAndStoredOutputInner (exchange: Exchange, skipKeys: string[], newOutput, storedOutput, strictTypeCheck = true, assertingKey = undefined) {
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
                const isComputedBool = (typeof sanitizedNewOutput === 'boolean');
                const isStoredBool = (typeof sanitizedStoredOutput === 'boolean');
                const isComputedString = (typeof sanitizedNewOutput === 'string');
                const isStoredString = (typeof sanitizedStoredOutput === 'string');
                const isComputedUndefined = (sanitizedNewOutput === undefined);
                const isStoredUndefined = (sanitizedStoredOutput === undefined);
                const shouldBeSame = (isComputedBool === isStoredBool) && (isComputedString === isStoredString) && (isComputedUndefined === isStoredUndefined);
                this.assertStaticError (shouldBeSame, 'output type mismatch', storedOutput, newOutput, assertingKey);
                const isBoolean = isComputedBool || isStoredBool;
                const isString = isComputedString || isStoredString;
                const isUndefined = isComputedUndefined || isStoredUndefined; // undefined is a perfetly valid value
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

    assertNewAndStoredOutput (exchange: Exchange, skipKeys: string[], newOutput, storedOutput, strictTypeCheck = true, assertingKey = undefined) {
        let res = true;
        try {
            res = this.assertNewAndStoredOutputInner (exchange, skipKeys, newOutput, storedOutput, strictTypeCheck, assertingKey);
        } catch (e) {
            if (this.info) {
                const errorMessage = this.varToString (newOutput) + '(calculated)' + ' != ' + this.varToString (storedOutput) + '(stored)';
                dump ('[TEST_FAILURE_DETAIL]' + errorMessage);
            }
            throw e;
        }
        return res;
    }

    varToString (obj:any = undefined) {
        let newString = undefined;
        if (obj === undefined) {
            newString = 'undefined';
        } else if (isNullValue (obj)) {
            newString = 'null';
        } else {
            newString = jsonStringify (obj);
        }
        return newString;
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
                    return true;
                }
                const storedUrlParams = this.urlencodedToDict (storedUrlQuery);
                const newUrlParams = this.urlencodedToDict (newUrlQuery);
                this.assertNewAndStoredOutput (exchange, skipKeys, newUrlParams, storedUrlParams);
                return true;
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
        return true;
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

    async testRequestStatically (exchange, method: string, data: object, type: string, skipKeys: string[]) {
        let output = undefined;
        let requestUrl = undefined;
        try {
            if (!isSync ()) {
                await callExchangeMethodDynamically (exchange, method, this.sanitizeDataInput (data['input']));
            } else {
                callExchangeMethodDynamicallySync (exchange, method, this.sanitizeDataInput (data['input']));
            }
        } catch (e) {
            if (!(e instanceof InvalidProxySettings)) {
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
            const errorMessage = '[' + this.lang + '][STATIC_REQUEST]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + exceptionMessage (e);
            dump ('[TEST_FAILURE]' + errorMessage);
        }
        return true;
    }

    async testResponseStatically (exchange, method: string, skipKeys: string[], data: object) {
        const expectedResult = exchange.safeValue (data, 'parsedResponse');
        const mockedExchange = setFetchResponse (exchange, data['httpResponse']);
        try {
            if (!isSync ()) {
                const unifiedResult = await callExchangeMethodDynamically (exchange, method, this.sanitizeDataInput (data['input']));
                this.assertStaticResponseOutput (mockedExchange, skipKeys, unifiedResult, expectedResult);
            } else {
                const unifiedResultSync = callExchangeMethodDynamicallySync (exchange, method, this.sanitizeDataInput (data['input']));
                this.assertStaticResponseOutput (mockedExchange, skipKeys, unifiedResultSync, expectedResult);
            }
        }
        catch (e) {
            this.responseTestsFailed = true;
            const errorMessage = '[' + this.lang + '][STATIC_RESPONSE]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + exceptionMessage (e);
            dump ('[TEST_FAILURE]' + errorMessage);
        }
        setFetchResponse (exchange, undefined); // reset state
        return true;
    }

    initOfflineExchange (exchangeName: string) {
        const markets = this.loadMarketsFromFile (exchangeName);
        const currencies = this.loadCurrenciesFromFile (exchangeName);
        const exchange = initExchange (exchangeName, { 'markets': markets, 'currencies': currencies, 'enableRateLimit': false, 'rateLimit': 1, 'httpProxy': 'http://fake:8080', 'httpsProxy': 'http://fake:8080', 'apiKey': 'key', 'secret': 'secretsecret', 'password': 'password', 'walletAddress': 'wallet', 'privateKey': '0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771', 'uid': 'uid', 'token': 'token', 'login': 'login', 'accountId':'accountId', 'accounts': [ { 'id': 'myAccount', 'code': 'USDT' }, { 'id': 'myAccount', 'code': 'USDC' } ], 'options': { 'enableUnifiedAccount': true, 'enableUnifiedMargin': false, 'accessToken': 'token', 'expires': 999999999999999, 'leverageBrackets': {}}});
        exchange.currencies = currencies;
        // not working in python if assigned  in the config dict
        return exchange;
    }

    async testExchangeRequestStatically (exchangeName: string, exchangeData: object, testName: Str = undefined) {
        // instantiate the exchange and make sure that we sink the requests to avoid an actual request
        const exchange = this.initOfflineExchange (exchangeName);
        const globalOptions = exchange.safeDict (exchangeData, 'options', {});

        // read apiKey/secret from the test file
        const apiKey = exchange.safeString (exchangeData, 'apiKey');
        if (apiKey) {
            // c# to string requirement
            exchange.apiKey = apiKey.toString ();
        }
        const secret = exchange.safeString (exchangeData, 'secret');
        if (secret) {
            // c# to string requirement
            exchange.secret = secret.toString ();
        }
        const privateKey = exchange.safeString (exchangeData, 'privateKey');
        if (privateKey) {
            // c# to string requirement
            exchange.privateKey = privateKey.toString ();
        }
        const walletAddress = exchange.safeString (exchangeData, 'walletAddress');
        if (walletAddress) {
            // c# to string requirement
            exchange.walletAddress = walletAddress.toString ();
        }
        const accounts = exchange.safeList (exchangeData, 'accounts');
        if (accounts) {
            exchange.accounts = accounts;
        }
        // exchange.options = exchange.deepExtend (exchange.options, globalOptions); // custom options to be used in the tests
        exchange.extendExchangeOptions (globalOptions);
        const methods = exchange.safeValue (exchangeData, 'methods', {});
        const methodsNames = Object.keys (methods);
        for (let i = 0; i < methodsNames.length; i++) {
            const method = methodsNames[i];
            const results = methods[method];
            for (let j = 0; j < results.length; j++) {
                const result = results[j];
                const oldExchangeOptions = exchange.options; // snapshot options;
                const testExchangeOptions = exchange.safeValue (result, 'options', {});
                // exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); // custom options to be used in the tests
                exchange.extendExchangeOptions (exchange.deepExtend (oldExchangeOptions, testExchangeOptions));
                const description = exchange.safeValue (result, 'description');
                if ((testName !== undefined) && (testName !== description)) {
                    continue;
                }
                const isDisabled = exchange.safeBool (result, 'disabled', false);
                if (isDisabled) {
                    continue;
                }
                const disabledString = exchange.safeString (result, 'disabled', '');
                if (disabledString !== '') {
                    continue;
                }
                const isDisabledCSharp = exchange.safeBool (result, 'disabledCS', false);
                if (isDisabledCSharp && (this.lang === 'C#')) {
                    continue;
                }
                const isDisabledGo = exchange.safeBool (result, 'disabledGO', false);
                if (isDisabledGo && (this.lang === 'GO')) {
                    continue;
                }
                const type = exchange.safeString (exchangeData, 'outputType');
                const skipKeys = exchange.safeValue (exchangeData, 'skipKeys', []);
                await this.testRequestStatically (exchange, method, result, type, skipKeys);
                // reset options
                // exchange.options = exchange.deepExtend (oldExchangeOptions, {});
                exchange.extendExchangeOptions (exchange.deepExtend (oldExchangeOptions, {}));
            }
        }
        if (!isSync ()) {
            await close (exchange);
        }
        return true; // in c# methods that will be used with promiseAll need to return something
    }

    async testExchangeResponseStatically (exchangeName: string, exchangeData: object, testName: Str = undefined) {
        const exchange = this.initOfflineExchange (exchangeName);
        // read apiKey/secret from the test file
        const apiKey = exchange.safeString (exchangeData, 'apiKey');
        if (apiKey) {
            // c# to string requirement
            exchange.apiKey = apiKey.toString ();
        }
        const secret = exchange.safeString (exchangeData, 'secret');
        if (secret) {
            // c# to string requirement
            exchange.secret = secret.toString ();
        }
        const privateKey = exchange.safeString (exchangeData, 'privateKey');
        if (privateKey) {
            // c# to string requirement
            exchange.privateKey = privateKey.toString ();
        }
        const walletAddress = exchange.safeString (exchangeData, 'walletAddress');
        if (walletAddress) {
            // c# to string requirement
            exchange.walletAddress = walletAddress.toString ();
        }
        const methods = exchange.safeValue (exchangeData, 'methods', {});
        const options = exchange.safeValue (exchangeData, 'options', {});
        // exchange.options = exchange.deepExtend (exchange.options, options); // custom options to be used in the tests
        exchange.extendExchangeOptions (options);
        const methodsNames = Object.keys (methods);
        for (let i = 0; i < methodsNames.length; i++) {
            const method = methodsNames[i];
            const results = methods[method];
            for (let j = 0; j < results.length; j++) {
                const result = results[j];
                const description = exchange.safeValue (result, 'description');
                const oldExchangeOptions = exchange.options; // snapshot options;
                const testExchangeOptions = exchange.safeValue (result, 'options', {});
                // exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); // custom options to be used in the tests
                exchange.extendExchangeOptions (exchange.deepExtend (oldExchangeOptions, testExchangeOptions));
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

                const isDisabledGO = exchange.safeBool (result, 'disabledGO', false);
                if (isDisabledGO && (this.lang === 'GO')) {
                    continue;
                }
                const skipKeys = exchange.safeValue (exchangeData, 'skipKeys', []);
                await this.testResponseStatically (exchange, method, skipKeys, result);
                // reset options
                // exchange.options = exchange.deepExtend (oldExchangeOptions, {});
                exchange.extendExchangeOptions (exchange.deepExtend (oldExchangeOptions, {}));
            }
        }
        if (!isSync ()) {
            await close (exchange);
        }
        return true; // in c# methods that will be used with promiseAll need to return something
    }

    getNumberOfTestsFromExchange (exchange, exchangeData: object, testName: Str = undefined) {
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

    async runStaticRequestTests (targetExchange: Str = undefined, testName: Str = undefined) {
        await this.runStaticTests ('request', targetExchange, testName);
        return true;
    }

    async runStaticTests (type: string, targetExchange: Str = undefined, testName: Str = undefined) {
        const folder = getRootDir () + './ts/src/test/static/' + type + '/';
        const staticData = this.loadStaticData (folder, targetExchange);
        if (staticData === undefined) {
            return true;
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
        try {
            await Promise.all (promises);
        } catch (e) {
            if (type === 'request') {
                this.requestTestsFailed = true;
            } else {
                this.responseTestsFailed = true;
            }
            const errorMessage = '[' + this.lang + '][STATIC_REQUEST]' + exceptionMessage (e);
            dump ('[TEST_FAILURE]' + errorMessage);
        }
        if (this.requestTestsFailed || this.responseTestsFailed) {
            exitScript (1);
        } else {
            const prefix = (isSync ()) ? '[SYNC]' : '';
            const successMessage = '[' + this.lang + ']' + prefix + '[TEST_SUCCESS] ' + sum.toString () + ' static ' + type + ' tests passed.';
            dump ('[INFO]' + successMessage);
        }
        return true; // required in c#
    }

    async runStaticResponseTests (exchangeName = undefined, test = undefined) {
        //  -----------------------------------------------------------------------------
        //  --- Init of mockResponses tests functions------------------------------------
        //  -----------------------------------------------------------------------------
        await this.runStaticTests ('response', exchangeName, test);
        return true;
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
            this.testCoinbaseinternational (),
            this.testCoinbaseAdvanced (),
            this.testWoofiPro (),
            this.testOxfun (),
            this.testXT (),
            this.testVertex (),
            this.testParadex (),
            this.testHashkey (),
            this.testCoincatch (),
            this.testDefx ()
        ];
        await Promise.all (promises);
        const successMessage = '[' + this.lang + '][TEST_SUCCESS] brokerId tests passed.';
        dump ('[INFO]' + successMessage);
        exitScript (0);
        return true;
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
        if (!isSync ()) {
            await close (exchange);
        }
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
        if (!isSync ()) {
            await close (exchange);
        }
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
        if (!isSync ()) {
            await close (exchange);
        }
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
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testKucoin () {
        const exchange = this.initOfflineExchange ('kucoin');
        let reqHeaders = undefined;
        const spotId =  exchange.options['partner']['spot']['id'];
        const spotKey =  exchange.options['partner']['spot']['key'];
        assert (spotId === 'ccxt', 'kucoin - id: ' + spotId + ' not in options');
        assert (spotKey === '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'kucoin - key: ' + spotKey + ' not in options.');
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        const id = 'ccxt';
        assert (reqHeaders['KC-API-PARTNER'] === id, 'kucoin - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testKucoinfutures () {
        const exchange = this.initOfflineExchange ('kucoinfutures');
        let reqHeaders = undefined;
        const id = 'ccxtfutures';
        const futureId = exchange.options['partner']['future']['id'];
        const futureKey = exchange.options['partner']['future']['key'];
        assert (futureId === id, 'kucoinfutures - id: ' + futureId + ' not in options.');
        assert (futureKey === '1b327198-f30c-4f14-a0ac-918871282f15', 'kucoinfutures - key: ' + futureKey + ' not in options.');
        try {
            await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['KC-API-PARTNER'] === id, 'kucoinfutures - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testBitget () {
        const exchange = this.initOfflineExchange ('bitget');
        let reqHeaders = undefined;
        const id = 'p4sve';
        assert (exchange.options['broker'] === id, 'bitget - id: ' + id + ' not in options');
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['X-CHANNEL-API-CODE'] === id, 'bitget - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testMexc () {
        const exchange = this.initOfflineExchange ('mexc');
        let reqHeaders = undefined;
        const id = 'CCXT';
        assert (exchange.options['broker'] === id, 'mexc - id: ' + id + ' not in options');
        await exchange.loadMarkets ();
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['source'] === id, 'mexc - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
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
        if (!isSync ()) {
            await close (exchange);
        }
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
        if (!isSync ()) {
            await close (exchange);
        }
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
        if (!isSync ()) {
            await close (exchange);
        }
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
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testBingx () {
        const exchange = this.initOfflineExchange ('bingx');
        let reqHeaders = undefined;
        const id = 'CCXT';
        assert (exchange.options['broker'] === id, 'bingx - id: ' + id + ' not in options');
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['X-SOURCE-KEY'] === id, 'bingx - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
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
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
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
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
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
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testCoinbaseinternational () {
        const exchange = this.initOfflineExchange ('coinbaseinternational');
        exchange.options['portfolio'] = 'random';
        const id = 'nfqkvdjp';
        assert (exchange.options['brokerId'] === id, 'id not in options');
        let request = undefined;
        try {
            await exchange.createOrder ('BTC/USDC:USDC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const clientOrderId = request['client_order_id'];
        assert (clientOrderId.startsWith (id.toString ()), 'clientOrderId does not start with id');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testCoinbaseAdvanced () {
        const exchange = this.initOfflineExchange ('coinbase');
        const id = 'ccxt';
        assert (exchange.options['brokerId'] === id, 'id not in options');
        let request = undefined;
        try {
            await exchange.createOrder ('BTC/USDC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const clientOrderId = request['client_order_id'];
        assert (clientOrderId.startsWith (id.toString ()), 'clientOrderId does not start with id');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testWoofiPro () {
        const exchange = this.initOfflineExchange ('woofipro');
        exchange.secret = 'secretsecretsecretsecretsecretsecretsecrets';
        const id = 'CCXT';
        await exchange.loadMarkets ();
        let request = undefined;
        try {
            await exchange.createOrder ('BTC/USDC:USDC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const brokerId = request['order_tag'];
        assert (brokerId === id, 'woofipro - id: ' + id + ' different from  broker_id: ' + brokerId);
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testOxfun () {
        const exchange = this.initOfflineExchange ('oxfun');
        exchange.secret = 'secretsecretsecretsecretsecretsecretsecrets';
        const id = 1000;
        await exchange.loadMarkets ();
        let request = undefined;
        try {
            await exchange.createOrder ('BTC/USD:OX', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const orders = request['orders'];
        const first = orders[0];
        const brokerId = first['source'];
        assert (brokerId === id, 'oxfun - id: ' + id.toString () + ' different from  broker_id: ' + brokerId.toString ());
        return true;
    }

    async testXT () {
        const exchange = this.initOfflineExchange ('xt');
        const id = 'CCXT';
        let spotOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            spotOrderRequest = jsonParse (exchange.last_request_body);
        }
        const spotMedia = spotOrderRequest['media'];
        assert (spotMedia === id, 'xt - id: ' + id + ' different from swap tag: ' + spotMedia);
        let swapOrderRequest = undefined;
        try {
            await exchange.createOrder ('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            swapOrderRequest = jsonParse (exchange.last_request_body);
        }
        const swapMedia = swapOrderRequest['clientMedia'];
        assert (swapMedia === id, 'xt - id: ' + id + ' different from swap tag: ' + swapMedia);
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testVertex () {
        const exchange = this.initOfflineExchange ('vertex');
        exchange.walletAddress = '0xc751489d24a33172541ea451bc253d7a9e98c781';
        exchange.privateKey = 'c33b1eb4b53108bf52e10f636d8c1236c04c33a712357ba3543ab45f48a5cb0b';
        exchange.options['v1contracts'] = { "chain_id":"42161", "endpoint_addr":"0xbbee07b3e8121227afcfe1e2b82772246226128e", "book_addrs":[ "0x0000000000000000000000000000000000000000", "0x70e5911371472e406f1291c621d1c8f207764d73", "0xf03f457a30e598d5020164a339727ef40f2b8fbc", "0x1c6281a78aa0ed88949c319cba5f0f0de2ce8353", "0xfe653438a1a4a7f56e727509c341d60a7b54fa91", "0xb6304e9a6ca241376a5fc9294daa8fca65ddcdcd", "0x01ec802ae0ab1b2cc4f028b9fe6eb954aef06ed1", "0x0000000000000000000000000000000000000000", "0x9c52d5c4df5a68955ad088a781b4ab364a861e9e", "0x0000000000000000000000000000000000000000", "0x2a3bcda1bb3ef649f3571c96c597c3d2b25edc79", "0x0000000000000000000000000000000000000000", "0x0492ff9807f82856781488015ef7aa5526c0edd6", "0x0000000000000000000000000000000000000000", "0xea884c82418ebc21cd080b8f40ecc4d06a6a6883", "0x0000000000000000000000000000000000000000", "0x5ecf68f983253a818ca8c17a56a4f2fb48d6ec6b", "0x0000000000000000000000000000000000000000", "0xba3f57a977f099905531f7c2f294aad7b56ed254", "0x0000000000000000000000000000000000000000", "0x0ac8c26d207d0c6aabb3644fea18f530c4d6fc8e", "0x0000000000000000000000000000000000000000", "0x8bd80ad7630b3864bed66cf28f548143ea43dc3b", "0x0000000000000000000000000000000000000000", "0x045391227fc4b2cdd27b95f066864225afc9314e", "0x0000000000000000000000000000000000000000", "0x7d512bef2e6cfd7e7f5f6b2f8027e3728eb7b6c3", "0x0000000000000000000000000000000000000000", "0x678a6c5003b56b5e9a81559e9a0df880407c796f", "0x0000000000000000000000000000000000000000", "0x14b5a17208fa98843cc602b3f74e31c95ded3567", "0xe442a89a07b3888ab10579fbb2824aeceff3a282", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0xac28ac205275d7c2d6877bea8657cebe04fd9ae9", "0x0000000000000000000000000000000000000000", "0xed811409bfea901e75cb19ba347c08a154e860c9", "0x0000000000000000000000000000000000000000", "0x0f7afcb1612b305626cff84f84e4169ba2d0f12c", "0x0000000000000000000000000000000000000000", "0xe4b8d903db2ce2d3891ef04cfc3ac56330c1b0c3", "0x5f44362bad629846b7455ad9d36bbc3759a3ef62", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0xa64e04ed4b223a71e524dc7ebb7f28e422ccfdde", "0x0000000000000000000000000000000000000000", "0x2ee573caab73c1d8cf0ca6bd3589b67de79628a4", "0x0000000000000000000000000000000000000000", "0x01bb96883a8a478d4410387d4aaf11067edc2c74", "0x0000000000000000000000000000000000000000", "0xe7ed0c559d905436a867cddf07e06921d572363c", "0x0000000000000000000000000000000000000000", "0xa94f9e3433c92a5cd1925494811a67b1943557d9", "0x0000000000000000000000000000000000000000", "0xa63de7f89ba1270b85f3dcc193ff1a1390a7c7c7", "0x0000000000000000000000000000000000000000", "0xc8b0b37dffe3a711a076dc86dd617cc203f36121", "0x0000000000000000000000000000000000000000", "0x646df48947ff785fe609969ff634e7be9d1c34cd", "0x0000000000000000000000000000000000000000", "0x42582b404b0bec4a266631a0e178840b107a0c69", "0x0000000000000000000000000000000000000000", "0x36a94bc3edb1b629d1413091e22dc65fa050f17f", "0x0000000000000000000000000000000000000000", "0xb398d00b5a336f0ad33cfb352fd7646171cec442", "0x0000000000000000000000000000000000000000", "0xb4bc3b00de98e1c0498699379f6607b1f00bd5a1", "0x0000000000000000000000000000000000000000", "0xfe8b7baf68952bac2c04f386223d2013c1b4c601", "0x0000000000000000000000000000000000000000", "0x9c8764ec71f175c97c6c2fd558eb6546fcdbea32", "0x0000000000000000000000000000000000000000", "0x94d31188982c8eccf243e555b22dc57de1dba4e1", "0x0000000000000000000000000000000000000000", "0x407c5e2fadd7555be927c028bc358daa907c797a", "0x0000000000000000000000000000000000000000", "0x7e97da2dbbbdd7fb313cf9dc0581ac7cec999c70", "0x0000000000000000000000000000000000000000", "0x7f8d2662f64dd468c423805f98a6579ad59b28fa", "0x0000000000000000000000000000000000000000", "0x3398adf63fed17cbadd6080a1fb771e6a2a55958", "0x0000000000000000000000000000000000000000", "0xba8910a1d7ab62129729047d453091a1e6356170", "0x0000000000000000000000000000000000000000", "0xdc054bce222fe725da0f17abcef38253bd8bb745", "0x0000000000000000000000000000000000000000", "0xca21693467d0a5ea9e10a5a7c5044b9b3837e694", "0x0000000000000000000000000000000000000000", "0xe0b02de2139256dbae55cf350094b882fbe629ea", "0x0000000000000000000000000000000000000000", "0x02c38368a6f53858aab5a3a8d91d73eb59edf9b9", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0xfe8c4778843c3cb047ffe7c0c0154a724c05cab9", "0x0000000000000000000000000000000000000000", "0xe2e88862d9b7379e21c82fc4aec8d71bddbcdb4b", "0x0000000000000000000000000000000000000000", "0xbbaff9e73b30f9cea5c01481f12de75050947fd6", "0x0000000000000000000000000000000000000000", "0xa20f6f381fe0fec5a1035d37ebf8890726377ab9", "0x0000000000000000000000000000000000000000", "0xbad68032d012bf35d3a2a177b242e86684027ed0", "0x0000000000000000000000000000000000000000", "0x0e61ca37f0c67e8a8794e45e264970a2a23a513c", "0x0000000000000000000000000000000000000000", "0xa77b7048e378c5270b15918449ededf87c3a3db3", "0x0000000000000000000000000000000000000000", "0x15afca1e6f02b556fa6551021b3493a1e4a7f44f" ] };
        const id = 5930043274845996;
        await exchange.loadMarkets ();
        let request = undefined;
        try {
            await exchange.createOrder ('BTC/USDC:USDC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            request = jsonParse (exchange.last_request_body);
        }
        const order = request['place_order'];
        const brokerId = order['id'];
        assert (brokerId === id, 'vertex - id: ' + id.toString () + ' different from  broker_id: ' + brokerId.toString ());
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testParadex () {
        const exchange = this.initOfflineExchange ('paradex');
        exchange.walletAddress = '0xc751489d24a33172541ea451bc253d7a9e98c781';
        exchange.privateKey = 'c33b1eb4b53108bf52e10f636d8c1236c04c33a712357ba3543ab45f48a5cb0b';
        exchange.options['authToken'] = 'token';
        exchange.options['systemConfig'] =
        { "starknet_gateway_url":"https://potc-testnet-sepolia.starknet.io", "starknet_fullnode_rpc_url":"https://pathfinder.api.testnet.paradex.trade/rpc/v0_7", "starknet_chain_id":"PRIVATE_SN_POTC_SEPOLIA", "block_explorer_url":"https://voyager.testnet.paradex.trade/", "paraclear_address":"0x286003f7c7bfc3f94e8f0af48b48302e7aee2fb13c23b141479ba00832ef2c6", "paraclear_decimals":8, "paraclear_account_proxy_hash":"0x3530cc4759d78042f1b543bf797f5f3d647cde0388c33734cf91b7f7b9314a9", "paraclear_account_hash":"0x41cb0280ebadaa75f996d8d92c6f265f6d040bb3ba442e5f86a554f1765244e", "oracle_address":"0x2c6a867917ef858d6b193a0ff9e62b46d0dc760366920d631715d58baeaca1f", "bridged_tokens":[ { "name":"TEST USDC", "symbol":"USDC", "decimals":6, "l1_token_address":"0x29A873159D5e14AcBd63913D4A7E2df04570c666", "l1_bridge_address":"0x8586e05adc0C35aa11609023d4Ae6075Cb813b4C", "l2_token_address":"0x6f373b346561036d98ea10fb3e60d2f459c872b1933b50b21fe6ef4fda3b75e", "l2_bridge_address":"0x46e9237f5408b5f899e72125dd69bd55485a287aaf24663d3ebe00d237fc7ef" } ], "l1_core_contract_address":"0x582CC5d9b509391232cd544cDF9da036e55833Af", "l1_operator_address":"0x11bACdFbBcd3Febe5e8CEAa75E0Ef6444d9B45FB", "l1_chain_id":"11155111", "liquidation_fee":"0.2" };
        let reqHeaders = undefined;
        const id = 'CCXT';
        assert (exchange.options['broker'] === id, 'paradex - id: ' + id + ' not in options');
        await exchange.loadMarkets ();
        try {
            await exchange.createOrder ('BTC/USD:USDC', 'limit', 'buy', 1, 20000);
        } catch (e) {
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['PARADEX-PARTNER'] === id, 'paradex - id: ' + id + ' not in headers');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testHashkey () {
        const exchange = this.initOfflineExchange ('hashkey');
        let reqHeaders = undefined;
        const id = "10000700011";
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['INPUT-SOURCE'] === id, 'hashkey - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }

    async testCoincatch () {
        const exchange = this.initOfflineExchange ('coincatch');
        let reqHeaders = undefined;
        const id = "47cfy";
        try {
            await exchange.createOrder ('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        assert (reqHeaders['X-CHANNEL-API-CODE'] === id, 'coincatch - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }


    async testDefx () {
        const exchange = this.initOfflineExchange ('defx');
        let reqHeaders = undefined;
        try {
            await exchange.createOrder ('DOGE/USDC:USDC', 'limit', 'buy', 100, 1);
        } catch (e) {
            // we expect an error here, we're only interested in the headers
            reqHeaders = exchange.last_request_headers;
        }
        const id = 'ccxt';
        assert (reqHeaders['X-DEFX-SOURCE'] === id, 'defx - id: ' + id + ' not in headers.');
        if (!isSync ()) {
            await close (exchange);
        }
        return true;
    }
}

export default testMainClass;
