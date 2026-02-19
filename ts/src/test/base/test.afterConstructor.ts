
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';


function helperTestInitThrottler () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'rateLimit': 10.8,
    });
    // todo: assert (exchange.MAX_VALUE !== undefined);

    const tokenBucket = testSharedMethods.getExchangeProperty (exchange, 'tokenBucket'); // trick for uncamelcase transpilation
    assert (tokenBucket !== undefined);
    const rateLimit = testSharedMethods.getExchangeProperty (exchange, 'rateLimit');
    assert (rateLimit === 10.8);
    assert (tokenBucket['delay'] === 0.001);
    assert (tokenBucket['refillRate'] === 1 / rateLimit);
    // fix decimal/integer issues across langs
    assert (exchange.inArray (tokenBucket['capacity'], [ 1, 1.0 ]));
    const cost = exchange.parseToNumeric (exchange.safeString2 (tokenBucket, 'cost', 'defaultCost')); // python sync, todo fix
    assert (exchange.inArray (cost, [ 1, 1.0 ]));
    assert (!('maxCapacity' in tokenBucket) || exchange.inArray (tokenBucket['maxCapacity'], [ 1000, 1000.0 ]));
    // todo: assert (exchange.throttler !== undefined);
    // todo: add after change assertion
    // todo: add initial tockenbtucket test
}

function helperTestSandboxState (exchange, isMainnet = true) {
    assert (exchange.urls !== undefined);
    assert ('test' in exchange.urls);
    const isSandboxModeEnabled = testSharedMethods.getExchangeProperty (exchange, 'isSandboxModeEnabled');
    if (isMainnet) {
        assert (!isSandboxModeEnabled);
        assert (exchange.urls['api']['public'] === 'https://example.com');
        assert (exchange.urls['test']['public'] === 'https://testnet.org');
    } else {
        assert (isSandboxModeEnabled);
        assert (exchange.urls['api']['public'] === 'https://testnet.org');
        assert (exchange.urls['apiBackup']['public'] === 'https://example.com');
    }
}

function helperTestInitSandbox () {
    // todo: sandbox for real exchanges
    const opts = {
        'id': 'sampleexchange',
        'options': {
            'sandbox': false,
        },
        'urls': {
            'api': {
                'public': 'https://example.com'
            },
            'test': {
                'public': 'https://testnet.org'
            },
        }
    };
    //
    // CASE A: when sandbox is not enabled
    //
    const exchange3 = new ccxt.Exchange (opts);
    helperTestSandboxState (exchange3, true);
    exchange3.setSandboxMode (true);
    helperTestSandboxState (exchange3, false);
    //
    // CASE B: when sandbox is enabled
    //
    opts['options']['sandbox'] = true;
    const exchange4 = new ccxt.Exchange (opts);
    helperTestSandboxState (exchange4, false);
    exchange4.setSandboxMode (false);
    helperTestSandboxState (exchange4, true);
}

function helperTestInitMarket () {
    // ############# markets ############# //
    const sampleMarket = { 'id': 'BtcUsd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'Btc', 'quoteId': 'Usd', 'type': 'spot', 'spot': true };
    const exchange2 = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'markets': {
            'BTC/USD': sampleMarket,
        },
    });
    assert (exchange2.markets['BTC/USD'] !== undefined);
}

function helperTestProperties () {
    const exchange = new ccxt.Exchange ({});

    //
    // userAgents
    //
    const keys = [ 'chrome', 'chrome39', 'chrome100' ];
    assert (testSharedMethods.getExchangeProperty (exchange, 'userAgents') !== undefined);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const userAgent = testSharedMethods.getExchangeProperty (exchange, 'userAgents')[key];
        assert (userAgent !== undefined);
    }

    //
    // options
    //
    assert (exchange.options !== undefined);
    const defaultNetworkCodeReplacements = {
        'ETH': { 'ERC20': 'ETH' },
        'TRX': { 'TRC20': 'TRX' },
        'CRO': { 'CRC20': 'CRONOS' },
        'BRC20': { 'BRC20': 'BTC' },
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'options', exchange.options['defaultNetworkCodeReplacements'], defaultNetworkCodeReplacements);

    //
    // credentials
    //
    assert (testSharedMethods.getExchangeProperty (exchange, 'apiKey') === '', 'apiKey should be empty string');
    assert (exchange.secret === '', 'secret should be empty string');
    assert (exchange.uid === '', 'uid should be empty string');
    assert (exchange.login === '', 'login should be empty string');
    assert (exchange.password === '', 'password should be empty string');
    assert (exchange.twofa === undefined, 'twofa should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'privateKey') === '', 'privateKey should be empty string');
    assert (testSharedMethods.getExchangeProperty (exchange, 'walletAddress') === '', 'walletAddress should be empty string');
    assert (exchange.token === '', 'token should be empty string');
    const requiredCredentials = {
        'apiKey': true,
        'secret': true,
        'uid': false,
        'accountId': false,
        'login': false,
        'password': false,
        'twofa': false,
        'privateKey': false,
        'walletAddress': false,
        'token': false,
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'requiredCredentials', testSharedMethods.getExchangeProperty (exchange, 'requiredCredentials'), requiredCredentials);

    //
    // proxies
    //
    assert (exchange.proxy === undefined, 'proxy should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'proxyUrl') === undefined, 'proxyUrl should be undefined');
    assert (exchange.proxy_url === undefined, 'proxy_url should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'proxyUrlCallback') === undefined, 'proxyUrlCallback should be undefined');
    assert (exchange.proxy_url_callback === undefined, 'proxy_url_callback should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'httpProxy') === undefined, 'httpProxy should be undefined');
    assert (exchange.http_proxy === undefined, 'http_proxy should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'httpProxyCallback') === undefined, 'httpProxyCallback should be undefined');
    assert (exchange.http_proxy_callback === undefined, 'http_proxy_callback should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'httpsProxy') === undefined, 'httpsProxy should be undefined');
    assert (exchange.https_proxy === undefined, 'https_proxy should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'httpsProxyCallback') === undefined, 'httpsProxyCallback should be undefined');
    assert (exchange.https_proxy_callback === undefined, 'https_proxy_callback should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'socksProxy') === undefined, 'socksProxy should be undefined');
    assert (exchange.socks_proxy === undefined, 'socks_proxy should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'socksProxyCallback') === undefined, 'socksProxyCallback should be undefined');
    assert (exchange.socks_proxy_callback === undefined, 'socks_proxy_callback should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'wsProxy') === undefined, 'wsProxy should be undefined');
    assert (exchange.ws_proxy === undefined, 'ws_proxy should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'wssProxy') === undefined, 'wssProxy should be undefined');
    assert (exchange.wss_proxy === undefined, 'wss_proxy should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'wsSocksProxy') === undefined, 'wsSocksProxy should be undefined');
    assert (exchange.ws_socks_proxy === undefined, 'ws_socks_proxy should be undefined');

    //
    // request-response
    //
    assert (testSharedMethods.getExchangeProperty (exchange, 'lastRestRequestTimestamp') === 0, 'lastRestRequestTimestamp should be 0');
    // assert (exchange.enableLastJsonResponse === false);
    // assert (exchange.enableLastHttpResponse === true);
    // assert (exchange.enableLastResponseHeaders === true);
    assert (exchange.last_http_response === undefined, 'last_http_response should be undefined');
    // assert (exchange.last_json_response === undefined);
    assert (exchange.last_response_headers === undefined, 'last_response_headers should be undefined');
    assert (exchange.last_request_headers === undefined, 'last_request_headers should be undefined');
    assert (exchange.last_request_body === undefined, 'last_request_body should be undefined');
    assert (exchange.last_request_url === undefined, 'last_request_url should be undefined');
    // assert (exchange.last_request_path === undefined);
    assert (testSharedMethods.getExchangeProperty (exchange, 'returnResponseHeaders') === false, 'returnResponseHeaders should be false');

    //
    // common props
    //
    assert ("GO_SKIP_START");
    assert (exchange.id === 'Exch' + 'ange', 'id should be "Exchange"');
    assert (exchange.has !== undefined, 'has should not be undefined');
    assert (exchange.api === undefined, 'api should be undefined');
    assert (exchange.features === undefined, 'features should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'minFundingAddressLength') >= 1, 'minFundingAddressLength should be >= 1');
    assert (testSharedMethods.getExchangeProperty (exchange, 'isSandboxModeEnabled') === false, 'isSandboxModeEnabled should be false');
    assert (testSharedMethods.getExchangeProperty (exchange, 'enableRateLimit') === true, 'enableRateLimit should be true');
    assert (testSharedMethods.getExchangeProperty (exchange, 'rateLimiterAlgorithm') === 'leakyBucket', 'rateLimiterAlgorithm should be "leakyBucket"');
    assert (testSharedMethods.getExchangeProperty (exchange, 'rateLimit') === 2000, 'rateLimit should be 2000');
    assert (exchange.certified === false, 'certified should be false');
    assert (exchange.pro === false, 'pro should be false');
    assert (exchange.alias === false, 'alias should be false');
    const httpExceptionKeys = [ '400', '401', '403', '404', '405', '407', '408', '409', '410', '418', '422', '429', '451', '500', '501', '502', '503', '504', '511', '520', '521', '522', '525', '526', '530' ];
    // php errors with below, bcz integer key cast
    // testSharedMethods.assertDeepEqual (exchange, {}, 'httpExceptionKeys', Object.keys (testSharedMethods.getExchangeProperty (exchange, 'httpExceptions')), httpExceptionKeys); // todo: add better deepAssert with error classes
    assert ((Object.keys (testSharedMethods.getExchangeProperty (exchange, 'httpExceptions'))).length === httpExceptionKeys.length, 'httpExceptions should have ' + (httpExceptionKeys.length).toString () + ' keys');
    const limits = {
        'leverage': { 'min': undefined, 'max': undefined },
        'amount': { 'min': undefined, 'max': undefined },
        'price': { 'min': undefined, 'max': undefined },
        'cost': { 'min': undefined, 'max': undefined },
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'limits', exchange.limits, limits);
    assert (testSharedMethods.getExchangeProperty (exchange, 'rollingWindowSize') === 60000, 'rollingWindowSize should be 60000');
    assert (exchange.countries === undefined, 'countries should be undefined');
    const urls = {
        'logo': undefined,
        'api': undefined,
        'test': undefined,
        'www': undefined,
        'doc': undefined,
        'api_management': undefined,
        'fees': undefined,
        'referral': undefined,
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'urls', exchange.urls, urls);
    assert (exchange.precision === undefined, 'precision should be undefined');
    assert (exchange.hostname === undefined, 'hostname should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'precisionMode') === undefined || testSharedMethods.getExchangeProperty (exchange, 'precisionMode') === 4, 'precisionMode should be undefined or 4');
    assert (testSharedMethods.getExchangeProperty (exchange, 'paddingMode') === undefined || testSharedMethods.getExchangeProperty (exchange, 'paddingMode') === 5, 'paddingMode should be undefined or 5');
    testSharedMethods.assertDeepEqual (exchange, {}, 'headers', exchange.headers, {});
    // assert (exchange.origin === '*');
    assert (testSharedMethods.getExchangeProperty (exchange, 'substituteCommonCurrencyCodes') === true, 'substituteCommonCurrencyCodes should be true');
    // assert (testSharedMethods.getExchangeProperty (exchange, 'quoteJsonNumbers') === true);
    // assert (testSharedMethods.getExchangeProperty (exchange, 'handleContentTypeApplicationZip') === false);
    assert (testSharedMethods.getExchangeProperty (exchange, 'reduceFees') === true, 'reduceFees should be true');
    const fees = {
        'trading': {
            'tierBased': undefined,
            'percentage': undefined,
            'taker': undefined,
            'maker': undefined,
        },
        'funding': {
            'tierBased': undefined,
            'percentage': undefined,
            'withdraw': {},
            'deposit': {},
        },
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'fees', exchange.fees, fees);
    const status = {
        'status': 'ok',
        'updated': undefined,
        'eta': undefined,
        'url': undefined,
        'info': undefined,
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'status', exchange.status, status);
    assert (exchange.timeout === 10000, 'timeout should be 10000');
    assert (exchange.verbose === false, 'verbose should be false');
    // assert (testSharedMethods.getExchangeProperty (exchange, 'newUpdates') === true, 'newUpdates should be true'); // todo WS
    // assert (exchange.requiresEddsa === false);
    assert (!testSharedMethods.getExchangeProperty (exchange, 'reloadingMarkets'), 'reloadingMarkets should be false');
    assert (testSharedMethods.getExchangeProperty (exchange, 'marketsLoading') === undefined, 'marketsLoading should be undefined');
    // undefined or false
    assert (exchange.version === undefined, 'version should be undefined');
    assert (exchange.name === undefined, 'name should be undefined');
    assert (exchange.exceptions === undefined, 'exceptions should be undefined');
    assert (exchange.timeframes === undefined, 'timeframes should be undefined');
    // testSharedMethods.assertDeepEqual (exchange, {}, 'clients', testSharedMethods.getExchangeProperty (exchange, 'clients'), {}); // todo WS
    // testSharedMethods.assertDeepEqual (exchange, {}, 'streaming', testSharedMethods.getExchangeProperty (exchange, 'streaming'), {}); // todo WS

    //
    // instance dynamic cache
    //
    // todo: remove initialization from GO
    testSharedMethods.assertDeepEqual (exchange, {}, 'balance', exchange.balance, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'bidsasks', exchange.bidsasks, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'orderbooks', exchange.orderbooks, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'tickers', exchange.tickers, {});
    assert (exchange.liquidations === undefined, 'liquidations should be undefined');
    assert (exchange.orders === undefined, 'orders should be undefined');
    testSharedMethods.assertDeepEqual (exchange, {}, 'trades', exchange.trades, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'transactions', exchange.transactions, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'ohlcvs', exchange.ohlcvs, {});
    assert (testSharedMethods.getExchangeProperty (exchange, 'myLiquidations') === undefined);
    assert (testSharedMethods.getExchangeProperty (exchange, 'myTrades') === undefined);
    assert (exchange.positions === undefined, 'positions should be undefined');

    //
    // common props
    //
    assert (exchange.markets === undefined, 'markets should be undefined');
    assert (exchange.symbols === undefined, 'symbols should be undefined');
    assert (exchange.markets_by_id === undefined, 'markets_by_id should be undefined');
    assert (exchange.ids === undefined, 'ids should be undefined');
    testSharedMethods.assertDeepEqual (exchange, {}, 'currencies', exchange.currencies, {});
    assert (testSharedMethods.getExchangeProperty (exchange, 'baseCurrencies') === undefined, 'baseCurrencies should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'quoteCurrencies') === undefined, 'quoteCurrencies should be undefined');
    assert (exchange.currencies_by_id === undefined, 'currencies_by_id should be undefined');
    assert (exchange.codes === undefined, 'codes should be undefined');
    assert (exchange.accounts === undefined, 'accounts should be undefined');
    assert (testSharedMethods.getExchangeProperty (exchange, 'accountsById') === undefined, 'accountsById should be undefined');
    testSharedMethods.assertDeepEqual (exchange, {}, 'commonCurrencies', testSharedMethods.getExchangeProperty (exchange, 'commonCurrencies'), { 'XBT': 'BTC', 'BCHSV': 'BSV' });
    assert ("GO_SKIP_END");
    //
}

function testAfterConstructor () {
    // here should be added all needed tests
    helperTestInitThrottler ();
    helperTestInitSandbox ();
    helperTestInitMarket ();
    helperTestProperties ();
}

export default testAfterConstructor;
