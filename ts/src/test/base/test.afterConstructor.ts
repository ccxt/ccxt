
import assert from 'assert';
import ccxt from '../../../ccxt.js';
import testSharedMethods from '../Exchange/base/test.sharedMethods.js';

function helperTestInitThrottler () {
    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'rateLimit': 10.8,
    });
    // todo: assert (exchange.MAX_VALUE !== undefined);

    let tokenBucket = exchange.getProperty (exchange, 'tokenBucket'); // trick for uncamelcase transpilation
    if (tokenBucket === undefined) {
        tokenBucket = exchange.getProperty (exchange, 'TokenBucket');
    }
    assert (tokenBucket !== undefined);
    assert ('GO_SKIP_START');
    const rateLimit = exchange.getProperty (exchange, 'rateLimit');
    assert (rateLimit === 10.8);
    assert (tokenBucket['delay'] === 0.001);
    assert (tokenBucket['refillRate'] === 1 / rateLimit);
    assert ('GO_SKIP_END');
    // fix decimal/integer issues across langs
    assert (exchange.inArray (tokenBucket['capacity'], [ 1, 1.0 ]));
    const cost = exchange.parseToNumeric (exchange.safeString2 (tokenBucket, 'cost', 'defaultCost')); // python sync, todo fix
    assert (exchange.inArray (cost, [ 1, 1.0 ]));
    assert (!('maxCapacity' in tokenBucket) || exchange.inArray (tokenBucket['maxCapacity'], [ 1000, 1000.0 ]));
    // todo: assert (exchange.throttler !== undefined);
    // todo: add after change assertion
    // todo: add initial tockenbtucket test
}

function helperTestSandboxState (exchange, shouldBeEnabled = true) {
    assert (exchange.urls !== undefined);
    assert ('test' in exchange.urls);
    assert ('GO_SKIP_START');
    const isSandboxModeEnabled = exchange.getProperty (exchange, 'isSandboxModeEnabled');
    if (shouldBeEnabled) {
        assert (isSandboxModeEnabled);
        assert (exchange.urls['api']['public'] === 'https://example.org');
        assert (exchange.urls['apiBackup']['public'] === 'https://example.com');
    } else {
        assert (!isSandboxModeEnabled);
        assert (exchange.urls['api']['public'] === 'https://example.com');
        assert (exchange.urls['test']['public'] === 'https://example.org');
    }
    assert ('GO_SKIP_END');
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
                'public': 'https://example.org'
            },
        }
    };
    //
    // CASE A: when sandbox is not enabled
    //
    const exchange3 = new ccxt.Exchange (opts);
    helperTestSandboxState (exchange3, false);
    exchange3.setSandboxMode (true);
    helperTestSandboxState (exchange3, true);
    //
    // CASE B: when sandbox is enabled
    //
    opts['options']['sandbox'] = true;
    const exchange4 = new ccxt.Exchange (opts);
    helperTestSandboxState (exchange4, true);
    exchange4.setSandboxMode (false);
    helperTestSandboxState (exchange4, false);
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
    assert (exchange.userAgents !== undefined);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const userAgent = exchange.userAgents[key];
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
    assert (exchange.apiKey === undefined);
    assert (exchange.secret === undefined);
    assert (exchange.uid === undefined);
    assert (exchange.login === undefined);
    assert (exchange.password === undefined);
    assert (exchange.privateKey === undefined);
    assert (exchange.walletAddress === undefined);
    assert (exchange.token === undefined);
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
    testSharedMethods.assertDeepEqual (exchange, {}, 'requiredCredentials', exchange.requiredCredentials, requiredCredentials);

    //
    // cache
    //
    testSharedMethods.assertDeepEqual (exchange, {}, 'balance', exchange.balance, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'bidsasks', exchange.bidsasks, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'orderbooks', exchange.orderbooks, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'tickers', exchange.tickers, {});
    assert (exchange.liquidations === undefined);
    assert (exchange.orders === undefined);
    testSharedMethods.assertDeepEqual (exchange, {}, 'trades', exchange.trades, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'transactions', exchange.transactions, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'ohlcvs', exchange.ohlcvs, {});
    assert (exchange.myLiquidations === undefined);
    assert (exchange.myTrades === undefined);
    assert (exchange.positions === undefined);
    assert (exchange.markets === undefined);
    assert (exchange.symbols === undefined);
    assert (exchange.markets_by_id === undefined);
    assert (exchange.ids === undefined);
    testSharedMethods.assertDeepEqual (exchange, {}, 'currencies', exchange.currencies, {});
    assert (exchange.baseCurrencies === undefined);
    assert (exchange.quoteCurrencies === undefined);
    assert (exchange.currencies_by_id === undefined);
    assert (exchange.codes === undefined);
    assert (exchange.accounts === undefined);
    assert (exchange.accountsById === undefined);
    testSharedMethods.assertDeepEqual (exchange, {}, 'commonCurrencies', exchange.commonCurrencies, { 'XBT': 'BTC', 'BCHSV': 'BSV' });

    //
    // proxies
    //
    assert (exchange.proxy === undefined);
    assert (exchange.proxyUrl === undefined);
    assert (exchange.proxy_url === undefined);
    assert (exchange.proxyUrlCallback === undefined);
    assert (exchange.proxy_url_callback === undefined);
    assert (exchange.httpProxy === undefined);
    assert (exchange.http_proxy === undefined);
    assert (exchange.httpProxyCallback === undefined);
    assert (exchange.http_proxy_callback === undefined);
    assert (exchange.httpsProxy === undefined);
    assert (exchange.https_proxy === undefined);
    assert (exchange.httpsProxyCallback === undefined);
    assert (exchange.https_proxy_callback === undefined);
    assert (exchange.socksProxy === undefined);
    assert (exchange.socks_proxy === undefined);
    assert (exchange.socksProxyCallback === undefined);
    assert (exchange.socks_proxy_callback === undefined);
    assert (exchange.userAgent === undefined);
    assert (exchange.user_agent === undefined);
    assert (exchange.wsProxy === undefined);
    assert (exchange.ws_proxy === undefined);
    assert (exchange.wssProxy === undefined);
    assert (exchange.wss_proxy === undefined);
    assert (exchange.wsSocksProxy === undefined);
    assert (exchange.ws_socks_proxy === undefined);

    //
    // request-response
    //
    assert (exchange.lastRestRequestTimestamp === 0);
    assert (exchange.enableLastJsonResponse === false);
    assert (exchange.enableLastHttpResponse === true);
    assert (exchange.enableLastResponseHeaders === true);
    assert (exchange.last_http_response === undefined);
    assert (exchange.last_json_response === undefined);
    assert (exchange.last_response_headers === undefined);
    assert (exchange.last_request_headers === undefined);
    assert (exchange.last_request_body === undefined);
    assert (exchange.last_request_url === undefined);
    assert (exchange.last_request_path === undefined);
    assert (exchange.returnResponseHeaders === false);

    //
    // common props
    //
    assert (exchange.id === undefined);
    assert (exchange.has !== undefined);
    assert (exchange.api === undefined);
    assert (exchange.features === undefined);
    assert (exchange.minFundingAddressLength > 0.9999 && exchange.minFundingAddressLength < 1.0001);
    assert (exchange.isSandboxModeEnabled === false);
    assert (exchange.enableRateLimit === undefined);
    assert (exchange.rateLimiterAlgorithm === 'leakyBucket');
    assert (exchange.rateLimit === 2000);
    assert (exchange.certified === false);
    assert (exchange.pro === false);
    assert (exchange.alias === false);
    assert (exchange.httpExceptions === undefined);
    assert (exchange.limits === undefined);
    assert (exchange.rollingWindowSize === 0.0);
    assert (exchange.httpExceptions === undefined);
    assert (exchange.countries === undefined);
    const urls = {
        'logo': undefined,
        'api': undefined,
        'www': undefined,
        'doc': undefined,
        'fees': undefined,
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'urls', exchange.urls, urls);
    assert (exchange.precision === undefined);
    assert (exchange.hostname === undefined);
    assert (exchange.precisionMode === undefined || exchange.precisionMode === 0);
    assert (exchange.paddingMode === undefined || exchange.paddingMode === 0);
    testSharedMethods.assertDeepEqual (exchange, {}, 'headers', exchange.headers, {});
    assert (exchange.origin === '*');
    assert (exchange.substituteCommonCurrencyCodes === true);
    assert (exchange.quoteJsonNumbers === true);
    assert (exchange.handleContentTypeApplicationZip === true);
    assert (exchange.reduceFees === true);
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
    };
    testSharedMethods.assertDeepEqual (exchange, {}, 'status', exchange.status, status);
    assert (exchange.timeout === 10000);
    assert (exchange.verbose === false);
    assert (exchange.newUpdates === true);
    assert (exchange.requiresWeb3 === false);
    assert (exchange.requiresEddsa === false);
    assert (!exchange.reloadingMarkets); // undefined or false
    assert (exchange.marketsLoading === undefined);
    assert (exchange.version === undefined);
    assert (exchange.name === undefined);
    testSharedMethods.assertDeepEqual (exchange, {}, 'exceptions', exchange.exceptions, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'timeframes', exchange.timeframes, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'clients', exchange.clients, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'streaming', exchange.streaming, {});
    testSharedMethods.assertDeepEqual (exchange, {}, 'proxyDictionaries', exchange.proxyDictionaries, {});
}

function testAfterConstructor () {
    // here should be added all needed tests
    helperTestInitThrottler ();
    helperTestInitSandbox ();
    helperTestInitMarket ();
    helperTestProperties ();
}

export default testAfterConstructor;
