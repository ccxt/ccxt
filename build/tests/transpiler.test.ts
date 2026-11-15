// Run: npx tsx --test build/tests/transpiler.test.ts
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import Transpiler from 'ast-transpiler';
import { setupCsharpPrinter } from './../csharp-worker.js';
import { CSHARP_LOCAL_AWAIT_RETURN_TYPES, CSHARP_LOCAL_THIS_RETURN_TYPES } from './../csharp-local-types.js';

const cfg = { verbose: false, csharp: { parser: { ELEMENT_ACCESS_WRAPPER_OPEN: 'getValue(', ELEMENT_ACCESS_WRAPPER_CLOSE: ')' } } };
describe ('cs-bigone-selectnetworkkeyfromnetworks-string-local', () => {
    test('bigone fetchDepositAddress: selectNetworkKeyFromNetworks local prints string?', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/bigone.ts').content as string;
        assert.match (out, /string\? selectedNetworkId = this\.selectNetworkKeyFromNetworks\(/);
        assert.doesNotMatch (out, /object selectedNetworkId = /);
    });
});

describe ('cs-bithumb-parse8601-int64-locals', () => {
    test('bithumb: parse8601 / safeInteger-copy timestamp locals with Int64? writes print Int64?', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/bithumb.ts').content as string;
        assert.match (out, /Int64\? timestamp = this\.parse8601\(datetime\);/);
        assert.match (out, /Int64\? timestamp = generationTwoTimestamp;/);
        assert.doesNotMatch (out, /object timestamp = this\.parse8601\(datetime\);/);
        assert.doesNotMatch (out, /object timestamp = generationTwoTimestamp;/);
    });
});

describe ('cs-bullish-handlepaginationparams-dict-return', () => {
    test('bullish handlePaginationParams returns Dictionary and types its callers', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/bullish.ts').content as string;
        assert.match (out, /public virtual Dictionary<string, object> handlePaginationParams\(/);
        assert.match (out, /Dictionary<string, object> paramsPagination = this\.handlePaginationParams\(/);
        assert.doesNotMatch (out, /object paramsPagination = this\.handlePaginationParams\(/);
    });
});

describe ('cs-coinbase-fetchcurrenciesfromcache-dict-awaited-local', () => {
    test('coinbase fetchMarketsV2: awaited FetchCurrenciesFromCache local prints Dictionary<string, object>', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/coinbase.ts').content as string;
        assert.match (out, /Dictionary<string, object> response = await this\.fetchCurrenciesFromCache\(parameters\);/);
        assert.doesNotMatch (out, /object response = await this\.fetchCurrenciesFromCache/);
    });
});

describe ('cs-coinbaseinternational-handlerouteandparams-dict-return', () => {
    test('coinbaseinternational handleRouteAndParams returns Dictionary and types its callers', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/coinbaseinternational.ts').content as string;
        assert.match (out, /public virtual Dictionary<string, object> handleRouteAndParams\(/);
        assert.match (out, /Dictionary<string, object> paramsResolved = this\.handleRouteAndParams\(/);
        assert.doesNotMatch (out, /object paramsResolved = this\.handleRouteAndParams\(/);
    });
});

describe ('cs-dydx-fetchdydxaccount-dict-awaited-local', () => {
    test('dydx: awaited fetchDydxAccount locals print Dictionary<string, object>', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/dydx.ts').content as string;
        assert.match (out, /Dictionary<string, object> account = await this\.fetchDydxAccount\(\);/);
        assert.doesNotMatch (out, /object account = await this\.fetchDydxAccount\(\);/);
    });
});

describe ('cs-dydx-fetchlatestblockheight-int64-awaited-local', () => {
    test('dydx: awaited fetchLatestBlockHeight locals print Int64', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/dydx.ts').content as string;
        assert.match (out, /\n\s+Int64 lastBlockHeight = await this\.FetchLatestBlockHeight\(\)/);
        assert.match (out, /\n\s+Int64 latestBlockHeight = await this\.FetchLatestBlockHeight\(\)/);
        assert.doesNotMatch (out, /object (last|latest)BlockHeight = await this\.FetchLatestBlockHeight\(\)/);
    });
});

describe ('cs-getwsurl-string-box-local', () => {
    for (const id of [ 'paradex', 'coinbaseinternational' ]) {
        test(`${id}: object url = this.getWsUrl() prints string?`, () => {
            const transpiler = new Transpiler (cfg);
            setupCsharpPrinter (transpiler);
            const out = (transpiler as any).transpileCSharpByPath (`./ts/src/pro/${id}.ts`).content as string;
            assert.match (out, /\n\s+string\? url = this\.getWsUrl\(/);
            assert.doesNotMatch (out, /object url = this\.getWsUrl\(/);
        });
    }
});

describe ('cs-htx-fetchaccountidbytype-string-awaited-local', () => {
    test('htx fetchAccountIdByType (Task<string>) is a typed awaited this-call', () => {
        assert.equal (CSHARP_LOCAL_AWAIT_RETURN_TYPES['fetchAccountIdByType'], 'string?');
    });
});

describe ('cs-lighter-fetchnonce-awaited-int64-local', () => {
    test('lighter: `const nonce = await this.fetchNonce (...)` prints Int64', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/lighter.ts').content as string;
        assert.match (out, /\n\s+Int64 nonce = await this\.[fF]etchNonce\(/);
        assert.doesNotMatch (out, /object nonce = await this\.[fF]etchNonce\(/);
    });
});

describe ('cs-nado-orderrequest-dict-awaited-local', () => {
    const gen = (path: string) => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        return (transpiler as any).transpileCSharpByPath (path).content as string;
    };

    for (const path of [ './ts/src/nado.ts', './ts/src/pro/nado.ts' ]) {
        test(`${path}: awaited order request builders print Dictionary locals`, () => {
            const out = gen (path);
            assert.match (out, /Dictionary<string, object> request = (?:ccxt\.BaseExchange\.FromDict\()?await this\.[cC]reateOrderRequest\(/);
            assert.doesNotMatch (out, /object request = await this\.(?:[cC]reate|[eE]dit)OrderRequest\(/);
            assert.doesNotMatch (out, /object request = await this\.[cC]ancel(?:All)?OrdersRequest\(/);
        });
    }
});

describe ('cs-poloniex-fetchtransactionshelper-dict-awaited-local', () => {
    test('poloniex: `const response = await this.fetchTransactionsHelper (...)` prints Dictionary', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/poloniex.ts').content as string;
        assert.match (out, /\n\s+Dictionary<string, object> response = (?:ccxt\.BaseExchange\.FromDict\()?await this\.[fF]etchTransactionsHelper\(/);
        assert.doesNotMatch (out, /object response = await this\.[fF]etchTransactionsHelper\(/);
    });

    test('dydx: same-named helper keeps its own typing', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/dydx.ts').content as string;
        assert.doesNotMatch (out, /Dictionary<string, object> response = await this\.[fF]etchTransactionsHelper\(/);
    });
});

describe ('cs-polymarket-loadproxycredentials-dict-awaited-core', () => {
    test('polymarket loadProxyCredentials: awaited core and its callers print IDictionary', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const rest = (transpiler as any).transpileCSharpByPath ('./ts/src/polymarket.ts').content as string;
        assert.match (rest, /Task<IDictionary<string, object>> loadProxyCredentials/);
        assert.match (rest, /return await this\.createProxyCredentials/);
        assert.match (rest, /IDictionary<string, object> credentials = await this\.loadProxyCredentials/);
        const pro = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/polymarket.ts').content as string;
        assert.match (pro, /IDictionary<string, object> credentials = await this\.loadProxyCredentials/);
    });
});

describe ('cs-pro-deepcoin-parseticker-volume-double-swap-locals', () => {
    test('pro deepcoin parseTicker: the baseVolume/quoteVolume swap locals print double?', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/deepcoin.ts').content as string;
        assert.match (out, /\n\s+double\? baseVolume = this\.safeNumber/);
        assert.match (out, /\n\s+double\? quoteVolume = this\.safeNumber/);
        assert.match (out, /\n\s+double\? temp = baseVolume;/);
    });
});

describe ('cs-pro-geturlbymarkettype-string-local', () => {
    test('getUrlByMarketType (gate/htx, both print string?) is a typed this-call', () => {
        assert.equal (CSHARP_LOCAL_THIS_RETURN_TYPES['getUrlByMarketType'], 'string?');
    });
});

describe ('cs-string-annotated-param-copy', () => {
    test('upbit watchPrivate: `: string` copies of required string params print string', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/upbit.ts').content as string;
        assert.match (out, /\n\s+string messageHashResolved = messageHash;/);
        assert.match (out, /\n\s+string channelKey = channel;/);
        assert.doesNotMatch (out, /object channelKey = channel;/);
    });
});
