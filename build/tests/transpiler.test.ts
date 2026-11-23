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

describe ('cs-77c6-callee-declared-result-locals', () => {
    test('un-awaited endpoint task, sync same-file return, single-declaration awaited box', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const grvt = (transpiler as any).transpileCSharpByPath ('./ts/src/grvt.ts').content as string;
        assert.match (grvt, /Task<Dictionary<string, object>> marketsPromise = this\.publicMarketPostFullV1AllInstruments\(/);
        const kraken = (transpiler as any).transpileCSharpByPath ('./ts/src/krakenfutures.ts').content as string;
        assert.match (kraken, /string\? accountName = this\.parseKrakenAccountName\(type\);/);
        const poly = (transpiler as any).transpileCSharpByPath ('./ts/src/polymarket.ts').content as string;
        assert.match (poly, /Dictionary<string, object> signed = \(\(Dictionary<string, object>\)await this\.signPerpsOp\(/);
        assert.doesNotMatch (poly, /object signed = await this\.signPerpsOp\(/);
    });
});

describe ('ral-77c8-literal-right-add-chain', () => {
    test('pro kucoin / xt: `x + "<non-numeric literal>" [+ y]` over an object left prints string? behind the cast', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const kucoin = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/kucoin.ts').content as string;
        // ral-84c8 R3 types `type` (safeString with a non-null default) as `string`, so this concat is now native
        assert.match (kucoin, /string messageHash = \(type \+ ":fetchBalanceSnapshot"\);/);
        assert.doesNotMatch (kucoin, /object messageHash = add\(type, ":fetchBalanceSnapshot"\);/);
        const xt = (transpiler as any).transpileCSharpByPath ('./ts/src/pro/xt.ts').content as string;
        assert.match (xt, /string\? param = \(\(string\)\(add\(add\(name, "@"\), listenKey\)\)\);/);
    });
});

describe ('cs-84c6-callee-returns-for-awaited-and-parse-locals', () => {
    test('super.loadMarkets local, loadAccounts / parseFundingRateHistories / signPredictfunOrder returns', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const delta = (transpiler as any).transpileCSharpByPath ('./ts/src/delta.ts').content as string;
        assert.match (delta, /IDictionary<string, object> markets = await base\.loadMarkets\(reload, parameters\);/);
        assert.doesNotMatch (delta, /\(\(IDictionary<string, object>\)\(\(object\)\(markets\)\)\)/);
        const btse = (transpiler as any).transpileCSharpByPath ('./ts/src/btse.ts').content as string;
        assert.match (btse, /IList<object> rates = this\.parseFundingRateHistories\(/);
        const htx = (transpiler as any).transpileCSharpByPath ('./ts/src/htx.ts').content as string;
        assert.match (htx, /List<object> accounts = await this\.loadAccounts\(\);/);
        const pf = (transpiler as any).transpileCSharpByPath ('./ts/src/prediction/predictfun.ts').content as string;
        assert.match (pf, /Dictionary<string, object> signed = this\.signPredictfunOrder\(/);
        const kucoin = (transpiler as any).transpileCSharpByPath ('./ts/src/kucoin.ts').content as string;
        assert.match (kucoin, /public override List<object> parseMarketLeverageTiers\(/);
        assert.match (kucoin, /List<object> tiers = this\.parseMarketLeverageTiers\(data\);/);
        const deepcoin = (transpiler as any).transpileCSharpByPath ('./ts/src/deepcoin.ts').content as string;
        assert.match (deepcoin, /IDictionary<string, object> result = base\.setMarkets\(markets, currencies\);/);
    });
});

describe ('ral-84c8-guarded-concat-string-locals', () => {
    test('gate / kraken: a safeString local read as the left of a guarded concat prints string? with native uses', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const gate = (transpiler as any).transpileCSharpByPath ('./ts/src/gate.ts').content as string;
        assert.match (gate, /string\? price = this\.safeString\(paramsPaginate, "price"\);/);
        assert.match (gate, /bool isMark = \(price == "mark"\);/);
        assert.match (gate, /request\["contract"\] = \(price == null \? null : price \+ "_" \+ /);
        const kraken = (transpiler as any).transpileCSharpByPath ('./ts/src/kraken.ts').content as string;
        assert.match (kraken, /string\? part4 = this\.safeString\(parts, 4\);/);
        assert.doesNotMatch (kraken, /object part4 = /);
    });
    test('okx: `x += r` on a safeString local prints the guarded write into string?', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const okx = (transpiler as any).transpileCSharpByPath ('./ts/src/okx.ts').content as string;
        assert.match (okx, /string\? bar = this\.safeString\(this\.timeframes, timeframe, timeframe\);/);
        assert.match (okx, /bar = \(bar == null \? null : bar \+ timezone\.ToLower\(\)\);/);
    });
});

describe ('ral-84c8-nonnull-default-rewrite', () => {
    test('bybit: a safeString-with-literal-default local rewritten from another such call prints string with native compares', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const bybit = (transpiler as any).transpileCSharpByPath ('./ts/src/bybit.ts').content as string;
        assert.match (bybit, /string baseName = (\(\(string\))?this\.safeString\(optionParts, 0, ""\)\)?;/);
        assert.match (bybit, /if \(baseName == "BTC"\)/);
    });
});

describe ('ral-87c8-array-guarded-list-locals', () => {
    test('hyperliquid: `let x = []` written from an Array.isArray-guarded response prints List<object> with native Count', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharpByPath ('./ts/src/hyperliquid.ts').content as string;
        assert.match (out, /List<object> fundings = new List<object>\(\) \{\};/);
        assert.match (out, /fundings = \(\(List<object>\)response\);/);
        assert.match (out, /i < \(fundings\?\.Count \?\? 0\)/);
        assert.doesNotMatch (out, /object fundings = /);
    });
});

describe ('ral-87c8-bool-literal-row-write', () => {
    test('kucoin: a bool literal local written from a market-row bool read prints bool? with a native compare', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharpByPath ('./ts/src/kucoin.ts').content as string;
        assert.match (out, /bool\? isContractMarket = true;/);
        assert.match (out, /isContractMarket = \(\(bool\?\)\(market\.ContainsKey\("contract"\) \? market\["contract"\] : null\)\);/);
        assert.match (out, /if \(\(isContractMarket != true\)\)/);
    });
});

describe ('ral-87c8-string-literal-split-element-write', () => {
    test('prediction hyperliquid: a string literal local written from a split element prints string? with a native compare', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as unknown as { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } }).transpileCSharpByPath ('./ts/src/prediction/hyperliquid.ts').content as string;
        assert.match (out, /string\? expiryDate = "";/);
        assert.match (out, /expiryDate = \(\(string\)\(expiryParts != null && 0 < expiryParts\.Count \? expiryParts\[0\] : null\)\);/);
        assert.match (out, /if \(expiryDate != ""\)/);
    });
});

describe ('ral-90c8-guarded-self-concat-write-native-use', () => {
    type CsPrinter = { transpileCSharp (src: string): { content: string }, transpileCSharpByPath (file: string): { content: string } };
    test('removeRepeatedTradesFromArray shape: `id = id + r` on a safeString local used as a dict key prints string? and a native ContainsKey', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const src = [
            'class Test {',
            '    safeString (o, k, d = undefined) { return d; }',
            '    dedupe (input: any[]) {',
            '        const uniqueResult = {};',
            '        for (let i = 0; i < input.length; i++) {',
            '            const entry = input[i];',
            '            let id = this.safeString (entry, \'id\');',
            '            if (id === undefined) {',
            '                const price = this.safeString (entry, \'price\', \'\');',
            '                id = \'t_\' + price + \'_\';',
            '                id = id + (price + \'_\');',
            '            }',
            '            if (id !== undefined && !(id in uniqueResult)) {',
            '                uniqueResult[id] = entry;',
            '            }',
            '        }',
            '        return uniqueResult;',
            '    }',
            '}',
        ].join ('\n');
        const out = (transpiler as unknown as CsPrinter).transpileCSharp (src).content;
        assert.match (out, /string\? id = this\.safeString\(entry, "id"\);/);
        assert.match (out, /id = \(id == null \? null : id \+ /);
    });
    test('pro xt: a self-concat url only handed to client (url) stays object', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as unknown as CsPrinter).transpileCSharpByPath ('./ts/src/pro/xt.ts').content;
        assert.match (out, /object url = this\.safeString\(apiUrls, tradeType\);/);
    });
});

describe ('cs-declared-int-venue-returns', () => {
    test('interactivebrokers: venue methods declared int print Int64? and their comparisons print operators', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/interactivebrokers.ts').content as string;
        assert.match (out, /public virtual Int64\? ibkrGatewayRegainDelay\(\)/);
        assert.match (out, /Int64\? regainDelay = this\.ibkrGatewayRegainDelay\(\);/);
        assert.match (out, /\(regainDelay == null \|\| regainDelay <= 0\)/);
        assert.doesNotMatch (out, /isLessThanOrEqual\(regainDelay, 0\)/);
        // undefined returns convert to the nullable signature with no box cast
        assert.doesNotMatch (out, /\(\(Int64\?\)\(\(object\)\(null\)\)\)/);
    });
    test('a method declared number (not int) keeps object', () => {
        const transpiler = new Transpiler (cfg);
        setupCsharpPrinter (transpiler);
        const out = (transpiler as any).transpileCSharpByPath ('./ts/src/bullish.ts').content as string;
        assert.match (out, /public virtual object getTimestamp\(\)|public virtual Int64\? getTimestamp\(\)/);
        assert.match (out, /public virtual Int64\? getClosestLimit\(Int64\? limit\)/);
    });
});
