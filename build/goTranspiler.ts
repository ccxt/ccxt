import Transpiler from "ast-transpiler";
import path from 'path';
import errors from "../js/src/base/errors.js";
import { basename, resolve } from 'path';
import { createFolderRecursively, overwriteFile, checkCreateFolder } from './fsLocal.js';
import { writeOverloadStrippedFile, removeOverloadStrippedFile } from './stripOverloads.js';
// import { writeFile } from 'fs/promises';
import { platform } from 'process';
import { spawnSync } from 'child_process';
import fs from 'fs';
import log from 'ololog';
import ansi from 'ansicolor';
import {Transpiler as OldTranspiler, parallelizeTranspiling } from "./transpile.js";
import errorHierarchy from '../js/src/base/errorHierarchy.js';
import Piscina from 'piscina';
import { isMainEntry } from "./transpile.js";

type dict = { [key: string]: string };

ansi.nice;

// const allExchanges: {ids: string[], ws: string[]} = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const allExchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
let exchanges = allExchanges;
const exchangeIds = exchanges.ids;
const exchangeIdsWs = exchanges.ws;
const predictionIds = exchanges.prediction || [];
const predictionWsIds = exchanges.predictionWs || [];
const exchangeIdsPrediction = predictionIds; // alias used by the runMain/base-method paths
let transpiledExchanges = exchangeIds;

let __dirname = new URL('.', import.meta.url).pathname;

let shouldTranspileTests = true;

let gofmtMissingWarned = false;

// gofmt indents with tabs while the transpiler emits 4-space indentation, so
// we run the generated code through gofmt at write time: the emitted .go files
// already have tabs and running gofmt over the tree afterwards does nothing
function formatGoSource (filePath: string, content: string): string {
    if (!filePath.endsWith ('.go')) {
        return content;
    }
    const gofmt = spawnSync ('gofmt', [], {
        'input': content,
        'encoding': 'utf8',
        'maxBuffer': 256 * 1024 * 1024,
        'windowsHide': true,
    });
    if (gofmt.error) {
        // gofmt is not installed; keep the previous behavior (unformatted output)
        if (!gofmtMissingWarned) {
            gofmtMissingWarned = true;
            log.bright.yellow ('gofmt not found (' + gofmt.error.message + '), writing go files with the default 4-space indentation');
        }
        return content;
    }
    if (gofmt.status !== 0) {
        // the generated code is not valid go; write it unformatted so it can be inspected
        log.bright.yellow ('gofmt failed for ' + filePath + '\n' + (gofmt.stderr || ''));
        return content;
    }
    return gofmt.stdout;
}

function overwriteFileAndFolder (path: string, content: string) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder (path);
    }
    content = formatGoSource (path, content);
    overwriteFile (path, content);
    fs.writeFileSync (path, content);
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// this is necessary because for some reason
// pathname keeps the first '/' for windows paths
// making them invalid
// example: /C:Users/user/Desktop/
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1);
    }
}

const TS_BASE_FILE = './ts/src/base/Exchange.ts';
const GLOBAL_WRAPPER_FILE = './go/v4/exchange_wrappers.go';
const EXCHANGE_WRAPPER_FOLDER = './go/v4';
const TYPED_INTERFACE_FILE = './go/v4/exchange_typed_interface.go';
const TYPED_WS_INTERFACE_FILE = './go/v4/pro/exchange_typed_interface.go';
// const EXCHANGE_WS_WRAPPER_FOLDER = './go/v4/exchanges/pro/wrappers/'
const ERRORS_FILE = './go/v4/exchange_errors.go';
const BASE_METHODS_FILE = './go/v4/exchange_generated.go';
const EXCHANGES_FOLDER = './go/v4';
const EXCHANGES_WS_FOLDER = './go/v4/pro';
const EXCHANGES_PREDICTION_FOLDER = './go/v4/prediction';
const EXCHANGES_PREDICTION_WS_FOLDER = './go/v4/prediction/pro';
const PREDICTION_PACKAGE = 'ccxtprediction';
const PREDICTION_WS_PACKAGE = 'ccxtpredictionpro';
const PREDICTION_IMPORT = 'import ccxtprediction "github.com/ccxt/ccxt/go/v4/prediction"';
const BASE_TESTS_FOLDER = './go/tests/base';
const BASE_TESTS_FILE =  './go/tests/base/tests.go';
// const EXCHANGE_BASE_FOLDER = './go/tests/Generated/Exchange/Base';
const GENERATED_TESTS_FOLDER = './go/tests';

// const EXAMPLES_INPUT_FOLDER = './examples/ts';
// const EXAMPLES_OUTPUT_FOLDER = './examples/go/examples';
const goComments: { [key: string]: { [key: string]: string}} = {};

const goTypeOptions: dict = {};
// names of the options structs that live in the base ccxt package; used by the
// prediction pass to decide between aliasing (type X = ccxt.X) and emitting a local struct
const baseGoTypeOptionNames = new Set<string>();
// option struct/func names the prediction package declares LOCALLY because its method
// renamed a base param (e.g. fetchTickers `outcomes` vs base `symbols`). Keyed by method
// capName → [Options, OptionsStruct, WithXxx...]. These must NOT be ccxt.-qualified in the
// wrapper file of an exchange that DEFINES the method (so it binds to the local struct), but
// MUST stay ccxt.-qualified where the method is a base delegation (missing-method wrapper).
const predictionLocalOptionStructs = new Map<string, string[]>();

const WRAPPER_METHODS: {} = {};

let goTests: string[] = [];
const goWsTests: string[] = [];

const imports = [
    'import ccxt "github.com/ccxt/ccxt/go/v4"'
];

const VIRTUAL_BASE_METHODS: { [key: string]: boolean} = {
    "cancelOrder": true, // true if the method returns a channel (async in JS)
    "cancelOrdersWithClientOrderIds": true,
    "cancelOrderWithClient": true,
    "createExpiredOptionMarket": false,
    "createOrder": true,
    "editOrder": true,
    "editOrderWithClientOrderId": true,
    "fetchAccounts": true,
    "fetchEvents": true, // prediction base -> venue override (loadEventsHelper)
    "fetchOutcome": true, // prediction base -> venue override (kalshi on-demand loadOutcome)
    "fetchOutcomes": true, // prediction base loadOutcomes -> venue batch override (kalshi tickers=, polymarket clob_token_ids)
    "signEvmTransaction": false, // sync (returns hex string, not a channel); prediction base sendEvmTransaction -> venue override
    "fetchBalance": true,
    "fetchClosedOrders": true,
    "fetchDepositAddressesByNetwork": true,
    "fetchDeposits": true,
    "fetchDepositsWithdrawals": true,
    "fetchDepositWithdrawFees": true,
    "fetchFundingInterval": true,
    "fetchFundingIntervals": true,
    "fetchFundingRates": true,
    "fetchL2OrderBook": true,
    "fetchL3OrderBook": true,
    "fetchLeverage": true,
    "fetchLeverages": true,
    "fetchLeverageTiers": true,
    "fetchMarginMode": true,
    "fetchMarginModes": true,
    "fetchMyTrades": true,
    "fetchOHLCV": true,
    "fetchOpenOrders": true,
    "fetchTradingFees": true,
    "fetchOption": true,
    "fetchOrder": true,
    "fetchOrderWithClientOrderId": true,
    "fetchOrderBook": true,
    "fetchOrderBooks": true,
    "fetchOrders": true,
    "fetchOrderTrades": true,
    "fetchPositionsHistory": true,
    "fetchStatus": true,
    "fetchTicker": true,
    "fetchTickers": true,
    "fetchTime": true,
    "fetchTrades": true,
    "fetchTransactions": true,
    "fetchWithdrawals": true,
    "parseAccount": false,
    "parseBalance": false,
    "parseOrderBookBidsAsks": false,
    "parseBorrowInterest": false,
    "parseBorrowRate": false,
    "parseCurrency": false,
    "parseDeposit": false,
    "parseDepositAddress": false,
    "parseDepositStatus": false,
    "parseDepositWithdrawFee": false,
    "parseFundingRate": false,
    "parseFundingRateHistory": false,
    "parseIncome": false,
    "parseLedgerEntry": false,
    "parseLiquidation": false,
    "parseMarginMode": false,
    "parseMarginModification": false,
    "parseMarket": false,
    "parseMarketLeverageTiers": false,
    "parseOHLCV": false,
    "parseOpenInterest": false,
    "parseOption": false,
    "parseOrder": false,
    "parseOrderSide": false,
    "parseOrderStatus": false,
    "parseOrderType": false,
    "parsePosition": false,
    "parseTicker": false,
    "parseTrade": false,
    "parseWsTrade": false,
    "parseGreeks": false,
    "parseTransaction": false,
    "parseTransfer": false,
    "parseWithdrawal": false,
    "parseLeverage": false,
    "parseWithdrawalStatus": false,
    "safeMarket": false, // try to remove custom implementations
    "market": false,
    "setSandboxMode": false,
    "safeCurrencyCode": false,
    "parseConversion": false,
    "sign": false,
    "signIn": true,
    // ws methods
    'cancelAllOrdersWs': true,
    'cancelOrdersWs': true,
    'cancelOrderWs': true,
    'createLimitBuyOrderWs': true,
    'createLimitOrderWs': true,
    'createLimitSellOrderWs': true,
    'createMarketBuyOrderWs': true,
    'createMarketOrderWithCostWs': true,
    'createMarketOrderWs': true,
    'createMarketSellOrderWs': true,
    'createOrdersWs': true,
    'createOrderWithTakeProfitAndStopLossWs': true,
    'createOrderWs': true,
    'createPostOnlyOrderWs': true,
    'createReduceOnlyOrderWs': true,
    'createStopLimitOrderWs': true,
    'createStopLossOrderWs': true,
    'createStopMarketOrderWs': true,
    'createStopOrderWs': true,
    'createTakeProfitOrderWs': true,
    'createTrailingAmountOrderWs': true,
    'createTrailingPercentOrderWs': true,
    'createTriggerOrderWs': true,
    'editOrderWs': true,
    'fetchBalanceWs': true,
    'fetchClosedOrdersWs': true,
    'fetchDepositsWs': true,
    'fetchMyTradesWs': true,
    'fetchOHLCVWs': true,
    'fetchOpenOrdersWs': true,
    'fetchOrderBookWs': true,
    'fetchOrdersByStatusWs': true,
    'fetchOrdersWs': true,
    'fetchOrderWs': true,
    'fetchOpenInterests': true,
    'fetchPositionsForSymbolWs': true,
    'fetchPositionsWs': true,
    'fetchPositionWs': true,
    'fetchTickersWs': true,
    'fetchTickerWs': true,
    'fetchTradesWs': true,
    'fetchTradingFeesWs': true,
    'fetchWithdrawalsWs': true,
    'handleDelta': false,
    'unWatchBidsAsks': true,
    'unWatchMyTrades': true,
    'unWatchOHLCV': true,
    'watchBalance': true,
    'watchBidsAsks': true,
    'watchLiquidations': true,
    'watchMarkPrice': true,
    'watchMarkPrices': true,
    'watchMyLiquidations': true,
    'watchMyLiquidationsForSymbols': true,
    'watchMyTrades': true,
    'watchOHLCV': true,
    'watchOHLCVForSymbols': true,
    'watchOrderBook': true,
    'watchOrderBookForSymbols': true,
    'watchOrders': true,
    'watchOrdersForSymbols': true,
    'watchPosition': true,
    'watchPositions': true,
    'watchTicker': true,
    'watchTickers': true,
    'watchTrades': true,
    'watchTradesForSymbols': true,
    'withdrawWs': true,
    "parseLastPrice": false,
    'fetchPositionsADLRank': true,
    'parseADLRank': false
    // 'fetchCurrenciesWs': true,
    // 'fetchMarketsWs': true,
}

const INTERFACE_METHODS = [
    'cancelOrders',
    'cancelOrdersWithClientOrderIds',
    'cancelAllOrders',
    'cancelAllOrdersAfter',
    'cancelOrder',
    'cancelOrderWithClientOrderId',
    'cancelOrdersForSymbols',
    'createConvertTrade',
    'createDepositAddress',
    'createLimitBuyOrder',
    'createLimitOrder',
    'createLimitSellOrder',
    'createMarketBuyOrder',
    'createMarketBuyOrderWithCost',
    'createMarketOrder',
    'createMarketOrderWithCost',
    'createMarketSellOrder',
    'createMarketSellOrderWithCost',
    'createOrder',
    'createOrders',
    'createOrderWithTakeProfitAndStopLoss',
    'createPostOnlyOrder',
    'createReduceOnlyOrder',
    'createStopLimitOrder',
    'createStopLossOrder',
    'createStopMarketOrder',
    'createStopOrder',
    'createTakeProfitOrder',
    'createTrailingAmountOrder',
    'createTrailingPercentOrder',
    'createTriggerOrder',
    'editLimitBuyOrder',
    'editLimitOrder',
    'editLimitSellOrder',
    'editOrder',
    'editOrderWithClientOrderId',
    'editOrders',
    'fetchAccounts',
    'fetchAllGreeks',
    'fetchBalance',
    'fetchBidsAsks',
    'fetchBorrowInterest',
    'fetchBorrowRate',
    'fetchCanceledAndClosedOrders',
    'fetchClosedOrders',
    'fetchConvertCurrencies',
    'fetchConvertQuote',
    'fetchConvertTrade',
    'fetchConvertTradeHistory',
    'fetchCrossBorrowRate',
    'fetchCrossBorrowRates',
    'fetchCurrencies',
    'fetchDepositAddress',
    'fetchDepositAddresses',
    'fetchDepositAddressesByNetwork',
    'fetchDeposits',
    'fetchDepositsWithdrawals',
    'fetchDepositWithdrawFee',
    'fetchDepositWithdrawFees',
    'fetchFreeBalance',
    'fetchFundingHistory',
    'fetchFundingInterval',
    'fetchFundingIntervals',
    'fetchFundingRate',
    'fetchFundingRateHistory',
    'fetchFundingRates',
    'fetchGreeks',
    'fetchIndexOHLCV',
    'fetchIsolatedBorrowRate',
    'fetchIsolatedBorrowRates',
    'fetchLastPrices',
    'fetchLedger',
    'fetchLedgerEntry',
    'fetchLeverage',
    'fetchLeverages',
    'fetchLeverageTiers',
    'fetchLiquidations',
    'fetchLongShortRatio',
    'fetchLongShortRatioHistory',
    'fetchMarginAdjustmentHistory',
    'fetchMarginMode',
    'fetchMarginModes',
    'fetchMarketLeverageTiers',
    'fetchMarkets',
    'fetchMarkOHLCV',
    'fetchMarkPrice',
    'fetchMarkPrices',
    'fetchMyLiquidations',
    'fetchMyTrades',
    'fetchOHLCV',
    'fetchOpenInterest',
    'fetchOpenInterestHistory',
    'fetchOpenInterests',
    'fetchOpenOrders',
    'fetchOption',
    'fetchOptionChain',
    'fetchOrder',
    'fetchOrderWithClientOrderId',
    'fetchOrderBook',
    'fetchOrderBooks',
    'fetchOrders',
    'fetchOrderStatus',
    'fetchOrderTrades',
    'fetchPaymentMethods',
    'fetchPosition',
    'fetchPositionHistory',
    'fetchPositionMode',
    'fetchPositions',
    'fetchPositionsForSymbol',
    'fetchPositionsHistory',
    'fetchPositionsRisk',
    'fetchPremiumIndexOHLCV',
    'fetchStatus',
    'fetchTicker',
    'fetchTickers',
    'fetchTime',
    'fetchTrades',
    'fetchTradingFee',
    'fetchTradingFees',
    'fetchTradingLimits',
    'fetchTransactionFee',
    'fetchTransactionFees',
    'fetchTransactions',
    'fetchTransfer',
    'fetchTransfers',
    'fetchWithdrawals',
    // 'setLeverage', // tmp remove we have to unify types
    'setMargin',
    'setMarginMode',
    'setPositionMode',
    'transfer',
    'withdraw',
    // ws methods
    'cancelAllOrdersWs',
    'cancelOrdersWs',
    'cancelOrderWs',
    'createLimitBuyOrderWs',
    'createLimitOrderWs',
    'createLimitSellOrderWs',
    'createMarketBuyOrderWs',
    'createMarketOrderWithCostWs',
    'createMarketOrderWs',
    'createMarketSellOrderWs',
    'createOrdersWs',
    'createOrderWithTakeProfitAndStopLossWs',
    'createOrderWs',
    'createPostOnlyOrderWs',
    'createReduceOnlyOrderWs',
    'createStopLimitOrderWs',
    'createStopLossOrderWs',
    'createStopMarketOrderWs',
    'createStopOrderWs',
    'createTakeProfitOrderWs',
    'createTrailingAmountOrderWs',
    'createTrailingPercentOrderWs',
    'createTriggerOrderWs',
    'editOrderWs',
    'fetchBalanceWs',
    'fetchClosedOrdersWs',
    // 'fetchCurrenciesWs',
    'fetchDepositsWs',
    // 'fetchMarketsWs',
    'fetchMyTradesWs',
    'fetchOHLCVWs',
    'fetchOpenOrdersWs',
    'fetchOrderBookWs',
    'fetchOrdersByStatusWs',
    'fetchOrdersWs',
    'fetchOrderWs',
    'fetchPositionsForSymbolWs',
    'fetchPositionsWs',
    'fetchPositionWs',
    'fetchTickersWs',
    'fetchTickerWs',
    'fetchTradesWs',
    'fetchTradingFeesWs',
    'fetchWithdrawalsWs',
    'unWatchBidsAsks',
    'unWatchMyTrades',
    // 'unWatchOHLCV',
    'unWatchOHLCV',
    'unWatchOHLCVForSymbols',
    'unWatchOrderBook',
    'unWatchOrderBookForSymbols',
    'unWatchOrders',
    'unWatchTicker',
    'unWatchTickers',
    'unWatchTrades',
    'unWatchTradesForSymbols',
    'watchBalance',
    'watchBidsAsks',
    'watchLiquidations',
    'watchMarkPrice',
    'watchMarkPrices',
    'watchMyLiquidations',
    'watchMyLiquidationsForSymbols',
    'watchMyTrades',
    'watchOHLCV',
    'watchOHLCVForSymbols',
    'watchOrderBook',
    'watchOrderBookForSymbols',
    'watchOrders',
    'watchOrdersForSymbols',
    'watchPosition',
    'watchPositions',
    'watchTicker',
    'watchTickers',
    'watchTrades',
    'watchTradesForSymbols',
    'withdrawWs',
    
];

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    oldTranspiler = new OldTranspiler();
    // true while transpiling the prediction-market exchanges (ts/src/prediction/),
    // which live in their own go packages (ccxtprediction / ccxtpredictionpro)
    isPrediction = false;
    // parsed PredictionExchange method signatures; lets a prediction venue that doesn't
    // override a unified method still emit the prediction-typed wrapper (resolving to the
    // inherited base method) instead of the crypto-typed exchangeTyped fallback
    predictionBaseMethodsTypes: any[] = [];
    // names of the 62 symbol-based trading methods that live in `export default class Exchange
    // extends BaseExchange` in the TS source. They hang off *Exchange (not *BaseExchange), so
    // prediction venues (which embed BaseExchange via PredictionExchange) never inherit them —
    // matching TS/C#/Java. Populated in transpileBaseMethods.
    exchangeTierMethods: Set<string> = new Set();
    private _extendedExchanges: { [key: string]: string } | null = null;
    private _typeAndFuncNamesCache: { [key: string]: Set<string> } = {};
    futuresExchanges = new Set<string>([  // futures exchanges that extend a spot exchange class
        // 'kucoinfutures'
    ]);

    constructor(isWs: boolean = false) {

        this.setupTranspiler();
        // this.transpiler.goTranspiler.VAR_TOKEN = 'var'; // tmp fix


        this.pythonStandardLibraries = {
            'hashlib': 'hashlib',
            'math': 'math',
            'json.loads': 'json',
            'json.dumps': 'json',
            'sys': 'sys',
        };
    }

    getWsRegexes() {
        // hoplefully we won't need this in the future by having everything typed properly in the typescript side
        return [
            [/([^a-zA-Z0-9])base\.([A-Za-z0-9]+)\(/g, `$1this.base.$2(`],  // changes 'base' to 'this.base'
            // --- Generic fixes for WS transpilation (Go) ---
            // Instantiate REST class pointer correctly (e.g., new hitbtcRest() -> &ccxt.hitbtcRest{})
            [/New(\w+)Rest\(\)/g, '&ccxt.$1{}'],
            // await-style return (C#) → channel read in Go (return await foo; -> return <-$1)
            [/return await (\w+);/g, 'return <-$1'],
            [/new\s*getValue\((\w+),\s*(\w+)\)\((\w+)\)/g, 'this.NewException(GetValue($1, $2), $3)'],
            // Casted access to subscriptions/futures/clients → exported Go field/prop
            [/client\.subscriptions/g, 'client.(*WSClient).Subscriptions'],
            [/Dictionary<string,object>\)client\.futures/g, 'client.(*WSClient).Futures'],
            [/this\.safeValue\(client\.futures,/g, 'this.SafeValue(client.(*WSClient).Futures,'],
            [/Dictionary<string,object>\)this\.clients/g, 'this.Clients'],
            // OrderBook & OrderBookSide casts → plain method/field access with proper capitalisation
            [/(orderbook)(\.reset)/g, '$1.(OrderBookInterface).Reset'],
            [/(\w+)(\.cache)/g, '$1.Cache'],
            [/((\w+)(\.hashmap))/g, '$1.Hashmap'],
            [/(countedBookSide)\.store\(/g, '$1.Store('],
            [/(\w+)\.(store|storeArray)\(/g, '$1.$2('],
            
            // DynamicInvoker from C# → callDynamically helper in Go
            [/(\w+)\.call\(this,(.+)\)/g, 'this.CallDynamically($1, $2)'],
            
            // .limit() on order book variable should be capitalised
            [/(\w+)\.limit\(\)/g, '$1.Limit()'],
            
            // Future/Client Resolve/Reject casts
            [/future\.resolve/g, 'future.(*Future).Resolve'],
            [/(\w+)\.(resolve|reject)/g, '$1.$2'],
            
            // spawn/delay helpers – convert additional params array creation to variadic list
            [/this\.spawn\((this\.\w+),(.+)\)/g, 'this.Spawn($1, $2)'],
            [/this\.delay\(([^,]+),([^,]+),(.+)\)/g, 'this.Delay($1, $2, $3)'],
            
            // callDynamically array wrapper removal
            [/(((?:this\.)?\w+))\.(append|resolve|getLimit)\(/g, 'ccxt.CallDynamically($1, "$3", '],
            [/NewGetValue\(([A-Za-z0-9]+), ([A-Za-z0-9]+)\)\(([A-Za-z0-9]+)\)/g, 'ccxt.CallDynamically(GetValue($1, $2), $3)'],
            [/([a-zA-Z0-9]+)\.Call\(this, /g, 'ccxt.CallDynamically($1, '],
            
            [/Future\)/g, ''],  // Remove C# generics / casts that are invalid in Go
            [/;\s*\n/g, '\n'],  // Remove stray semicolons that leak from TS/CS syntax
            
            [/\.Append\(/g, '.(Appender).Append('],
            [/stored\.\(Appender\)\.Append\(this\.ParseOHLCV/g, "stored.Append(this.ParseOHLCV"],
            [/(stored|cached)?([Oo]rders)?\.Hashmap/g, '$1$2.(*ArrayCache).Hashmap'],
            [/stored := NewArrayCache\(limit\)/g, 'var stored any = NewArrayCache(limit)'],  // needed for cex HandleTradesSnapshot
            // Futures
            [/future\.(Resolve|Reject)/g, 'future.(*Future).$1'],
            [/\(<\-future\)/g, '<-future.(<-chan any)'],
            [/<-spawaned/g, '<-spawaned.(<-chan any)'],
            [/promise\.Resolve\(([^)]+)\)/g, 'promise.(*Future).Resolve(ToGetsLimit($1))'],
            // GetsLimit
            [/([a-z]+)\.GetLimit/g, 'ToGetsLimit($1).GetLimit'],
            [/order.Limit([^"])/g, 'ToGetsLimit(orderbooks).Limit$1'],
            // OrderBook
            [/\.Cache\s*=\s*(.+)/g, '.(OrderBookInterface).SetCache($1)'],
            [/(?:&)?(storedOrderBook|orderbook)\.Cache/g, '$1.(OrderBookInterface).GetCache()'],
            [/orderbook(s)?\.(Reset|Limit)/g, 'orderbook$1.(OrderBookInterface).$2'],
            [/([a-zA-Z0-9]+).StoreArray/g, '$1.(IOrderBookSide).StoreArray'],
            [/(bookside|asks|bids|Side).Store/g, '$1.(IOrderBookSide).Store'],
            [/this.ParseWsBidAsk\(GetValue\(this.Orderbooks, symbol\)/g, 'this.ParseWsBidAsk(UnWrapType(ccxt.GetValue(this.Orderbooks, symbol))'],
            // Clients
            [/FindMessageHashes\(client/g, 'FindMessageHashes\(client.(*Client)'],
            [/CleanUnsubscription\(([a-zA-Z0-9]+),/g, 'CleanUnsubscription($1.(*Client),'],
            [/client\.Subscriptions/g, 'client.(ClientInterface).GetSubscriptions()'],
            [/client\.(Url)/g, 'client.(ClientInterface).Get$1()'],
            [/client\.LastPong\s*=\s*(.*)/g, 'client.(ClientInterface).SetLastPong($1)'],
            [/client\.LastPong/g, 'client.(ClientInterface).GetLastPong()'],
            [/client\.KeepAlive\s*=\s*(.*)/g, 'client.(ClientInterface).SetKeepAlive($1)'],
            [/client\.KeepAlive/g, 'client.(ClientInterface).GetKeepAlive()'],
            [/client\.ReusableFuture\(([^\)]*)\)/g, 'client.(ClientInterface).ReusableFuture($1)'],
            [/(retRes\d+)\s+:=\s+<-future.\(<-chan any\)/g, '$1 := <- future.(*ccxt.Future).Await()'],
            [/<-client\.Future\(([^\)]*)\)/g, '<-client.(ClientInterface).Future($1)'],
            [/client\.Futures/g, 'client.(ClientInterface).GetFutures()'],
            [/client\.(Send|Reset|OnPong|Reject|Future|Resolve)/g, 'client.(ClientInterface).$1'],
            // Error constructors
            [/NewInvalidNonce/g, 'InvalidNonce'],
            [/NewOrderBook/g, 'NewWsOrderBook'],
            [/NewNotSupported/g, 'NotSupported'],
            [/restInstance := NewBinance/g, 'restInstance := &NewBinance'],
            [/GetDescribeForExtendedWsExchange\(&ccxt.(\w+){}, &ccxt.(\w+){}/g, 'GetDescribeForExtendedWsExchange(ccxt.New$1(nil), ccxt.New$2(nil)'],
            [/restInstance := &ccxt.(\w+){}/g, 'restInstance := ccxt.New$1(nil)'],
            // Nonce
        ];
    }

    // Dynamic alias detection based on TypeScript inheritance analysis
    get extendedExchanges(): { [key: string]: string } {
        if (!this._extendedExchanges) {

            const extendedExchanges: { [key: string]: string } = {};
            const tsFolder = './ts/src';

            exchangeIds.forEach((exchangeName: string) => {
                const filePath = `${tsFolder}/${exchangeName}.ts`;
                const content = fs.readFileSync(filePath, 'utf8');

                const inheritancePattern = /class (\w+) extends ([a-z0-9]+)/;
                const match = content.match(inheritancePattern);

                if (match) {
                    const baseExchange = match[2];
                    
                    if (baseExchange.toLowerCase() !== exchangeName.toLowerCase()) {
                        extendedExchanges[exchangeName] = baseExchange;
                    }
                }
            })
            this._extendedExchanges = extendedExchanges;
        }
        return this._extendedExchanges;
    }

    isExtendedExchange(exchangeName: string) {
        return this.extendedExchanges[exchangeName] !== undefined;
    }

    isAlias (exchangeName: string) {
        return this.isExtendedExchange(exchangeName) && !this.futuresExchanges.has(exchangeName);
    }

    getParentExchange(exchangeName: string) {
        return this.extendedExchanges[exchangeName];
    }

    // go custom method
    customGoPropAssignment(node: any, identation: any) {
        const stringValue = node.getFullText().trim();
        if (Object.keys(errors).includes(stringValue)) {
            return `typeof(${stringValue})`;
        }
        return undefined;
    }

    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll (text: string, rules: any[]) {
        for (const [pattern, replacement] of rules) {
            const rx = typeof pattern === 'string' ? new RegExp(pattern, 'g') : pattern;
            text = text.replace(rx, replacement);
        }
        return text;
    }

    // ============================================================================

    iden(level = 1) {
        return '    '.repeat(level);
    }
    // ============================================================================

    getTranspilerConfig(isWrapper: boolean = false) {
        const classNameMap = {};
        if (!isWrapper) {
            // include the prediction-market exchange ids so their core classes also get
            // the `Core` suffix (most live only in ts/src/prediction/, not in exchangeIds)
            const allIds = exchangeIds.concat (predictionIds).concat (predictionWsIds);
            allIds.forEach((exchangeName: string) => {
                classNameMap[exchangeName] = capitalize(exchangeName) + 'Core';
                classNameMap[`${exchangeName}Rest`] = capitalize(exchangeName) + 'Core';
            });
            predictionIds.forEach((exchangeName: string) => {
                classNameMap[exchangeName] = capitalize(exchangeName) + 'Core';
                classNameMap[`${exchangeName}Rest`] = capitalize(exchangeName) + 'Core';
            });
        }
        return {
            "verbose": false,
            "go": {
                "classNameMap": classNameMap,
            //     "parser": {
            //         "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
            //         "ELEMENT_ACCESS_WRAPPER_CLOSE": ")",
            //         // "VAR_TOKEN": "var",
            //     }
            },
        };
    }

    createSee(link: string) {
        return `/// See <see href="${link}"/>  <br/>`;
    }

    createParam(param: any) {
        return`/// <item>
    /// <term>${param.name}</term>
    /// <description>
    /// ${param.type} : ${param.description}
    /// </description>
    /// </item>`;
    }

    createGOCommentTemplate(name: string, desc: string, see: string[], params : string[], returnType:string, returnDesc: string) {
        //
        // Summary:
        //     Converts the value of the specified 16-bit signed integer to an equivalent 64-bit
        //     signed integer.
        //
        // Parameters:
        //   value:
        //     The 16-bit signed integer to convert.
        //
        // Returns:
        //     A 64-bit signed integer that is equivalent to value
        const comment = `
    /// <summary>
    /// ${desc}
    /// </summary>
    /// <remarks>
    ${see.map( l => this.createSee(l)).join("\n    ")}
    /// <list type="table">
    ${params.map( p => this.createParam(p)).join("\n    ")}
    /// </list>
    /// </remarks>
    /// <returns> <term>${returnType}</term> ${returnDesc}.</returns>`;
    const commentWithoutEmptyLines = comment.replace(/^\s*[\r\n]/gm, "");
    return commentWithoutEmptyLines;
    }

    transformTSCommentIntoGO(name: string, desc: string, sees: string[], params : string[], returnType:string, returnDesc: string) {
        return this.createGOCommentTemplate(name, desc, sees, params, returnType, returnDesc);
    }

    transformLeadingComment(comment: any) {
        // parse comment
        // /**
        //  * @method
        //  * @name binance#fetchTime
        //  * @description fetches the current integer timestamp in milliseconds from the exchange server
        //  * @see https://binance-docs.github.io/apidocs/spot/en/#check-server-time       // spot
        //  * @see https://binance-docs.github.io/apidocs/futures/en/#check-server-time    // swap
        //  * @see https://binance-docs.github.io/apidocs/delivery/en/#check-server-time   // future
        //  * @param {object} [params] extra parameters specific to the exchange API endpoint
        //  * @returns {int} the current integer timestamp in milliseconds from the exchange server
        //  */
        // return comment;
        const commentNameRegex = /@name\s(\w+)#(\w+)/;
        const nameMatches = comment.match(commentNameRegex);
        const exchangeName = nameMatches ? nameMatches[1] : undefined;
        if (!exchangeName) {
            return comment;
        }
        const methodName = nameMatches[2];
        // const commentDescriptionRegex = /@description\s(.+)/;
        // const descriptionMatches = comment.match(commentDescriptionRegex);
        // const description = descriptionMatches ? descriptionMatches[1] : undefined;
        // const seeRegex = /@see\s(.+)/g;
        // const seeMatches = comment.match(seeRegex);
        // const sees: string[] = [];
        // if (seeMatches) {
        //     seeMatches.forEach(match => {
        //         const [, link] = match.split(' ');
        //         sees.push(link);
        //     });
        // }
        // // const paramRegex = /@param\s{(\w+)}\s\[(\w+)\]\s(.+)/g; // @param\s{(\w+)}\s\[((\w+(.\w+)?))\]\s(.+)
        // const paramRegex = /@param\s{(\w+[?]?)}\s\[(\w+\.?\w+?)]\s(.+)/g;
        // const params = [] as any;
        // let paramMatch;
        // while ((paramMatch = paramRegex.exec(comment)) !== null) {
        //     const [, type, name, description] = paramMatch;
        //     params.push({type, name, description});
        // }
        // // const returnRegex = /@returns\s{(\w+\[?\]?\[?\]?)}\s(.+)/;
        // // const returnMatch = comment.match(returnRegex);
        // const returnType = returnMatch ? returnMatch[1] : undefined;
        // const returnDescription =  returnMatch && returnMatch.length > 1 ? returnMatch[2]: undefined;
        let exchangeData = goComments[exchangeName];
        if (!exchangeData) {
            exchangeData = goComments[exchangeName] = {};
        }
        let exchangeMethods = goComments[exchangeName];
        if (!exchangeMethods) {
            exchangeMethods = {};
        }
        // const transformedComment = this.transformTSCommentIntoGo(methodName, description, sees,params, returnType, returnDescription);
        exchangeMethods[methodName] = comment;
        goComments[exchangeName] = exchangeMethods;
        return comment;
    }

    setupTranspiler(isWs: boolean = false) {
        this.transpiler = new Transpiler (this.getTranspilerConfig());
        this.transpiler.setVerboseMode(false);
        this.transpiler.goTranspiler.transformLeadingComment = this.transformLeadingComment.bind(this);
    }

    createGeneratedHeader() {
        return [
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            ""
        ];
    }

    getGoImports(file: any, ws = false) {
        if (this.isPrediction) {
            const namespace = ws ? `package ${PREDICTION_WS_PACKAGE}` : `package ${PREDICTION_PACKAGE}`;
            return [
                namespace,
                'import ccxt "github.com/ccxt/ccxt/go/v4"',
                ws ? PREDICTION_IMPORT : '',
            ];
        }
        const namespace = ws ? 'package ccxtpro' : 'package ccxt';
        const values = [
            // "using ccxt;",
            namespace,
            (ws || this.isPrediction) ? 'import ccxt "github.com/ccxt/ccxt/go/v4"' : '',
            // 'import "helpers"'
        ]
        return values;
    }

    isObject(type: string) {
        return (type === 'any') || (type === 'unknown');
    }

    isDictionary(type: string): boolean {
        return (type === 'Object') || (type === 'Dictionary<any>') || (type === 'unknown') || (type === 'Dict') || ((type.startsWith('{')) && (type.endsWith('}')));
    }

    isStringType(type: string) {
        return (type === 'Str') || (type === 'string') || (type === 'StringLiteral') || (type === 'StringLiteralType') || (type.startsWith('"') && type.endsWith('"')) || (type.startsWith("'") && type.endsWith("'"));
    }

    isNumberType(type: string) {
        return (type === 'Num') || (type === 'number') || (type === 'NumericLiteral') || (type === 'NumericLiteralType');
    }

    isIntegerType(type: string) {
        return type !== undefined && (type.toLowerCase() === 'int');
    }

    isBooleanType(type: string) {
        return (type === 'boolean') || (type === 'BooleanLiteral') || (type === 'BooleanLiteralType') || (type === 'Bool');
    }

    /**
     * @description Converts a JavaScript type to a Go type
     * @param name 
     * @param type 
     * @param isReturn 
     * @returns 
     */
    jsTypeToGo(name: string, type: string, isReturn = false): string | undefined {

        // handle watchOrderBook exception here (watchOrderBook and watchOrderBookForSymbols)
        if (
            name.startsWith('createOrdersWs') ||
            name.startsWith('fetchOrdersByStatusWs')
        ) {
            return '[]Order'
        }
        if (name.startsWith('withdrawWs')) {
            return 'Transaction'
        }
        
        if (name.startsWith('watchOrderBook')) {
            // if (isReturn) {
            //     return `NewOrderBookFromWs`
            // }
             return this.isPrediction ? `PredictionOrderBook` : `OrderBook`;

        }

        if (name.startsWith('unWatch')) { // type not unified yet
            return `any`;
        }

        if (name === 'fetchTime'){
            return ` <- chan int64`; // custom handling for now
        }

        if (name.startsWith('fetchDepositWithdrawFee')) { // tmp fix later with proper types
            return `map[string]any`;
        }

        const isPromise = type.startsWith('Promise<') && type.endsWith('>');
        let wrappedType = isPromise ? type.substring(8, type.length - 1) : type;
        let isList = false;

        // TS >= 5/6 (ast-transpiler 0.0.91) infers inline object literal types for
        // methods without an explicit annotation (e.g. `{ info: any; hedged: boolean; }`).
        // Map them to a plain dictionary (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.trim().startsWith('{')) {
            if (wrappedType.trim().endsWith('[]')) {
                isList = true; // e.g. `{ id: Str; ... }[]` → []map[string]any
            }
            return addTaskIfNeeded('map[string]any');
        }

        // TS >= 5/6 (ast-transpiler 0.0.91) infers union return types for methods
        // without an explicit annotation (e.g. `Position | undefined`, `Dict | Leverage`).
        // Normalize them here: drop undefined/null members and collapse remaining
        // multi-member unions to the first member (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.includes(' | ') && !wrappedType.includes('<')) {
            const members = wrappedType.split(' | ').map (m => m.trim()).filter (m => m !== 'undefined' && m !== 'null' && m !== 'Undefined');
            wrappedType = members.length > 0 ? members[0] : 'any';
        }

        function addTaskIfNeeded(type: string) {
            if (type == 'void') {
                return isPromise ? `<- chan` : '<- chan';
            } else if (isList) {
                return isPromise ? `<- chan []${type}` : `[]${type}`;
            }
            return isPromise ? `<- chan ${type}` : type;
        }

        const goReplacements: dict = {
            'OrderType': 'string',
            'OrderSide': 'string', // tmp
            'fetchEventsParams': 'map[string]interface{}', // params bag; surface as a map
            // TS >= 5/6 (ast-transpiler 0.0.91) prints this alias by name instead of
            // expanding it to `Dict | undefined` like TS 4.9 did
            'NullableDict': 'map[string]any',
            'Market': 'MarketInterface',
        };

        if (wrappedType === undefined || wrappedType === 'Undefined') {
            return addTaskIfNeeded('any'); // default if type is unknown;
        }

        // `List` is an alias for `Array<any>` (see ts/src/base/types.ts) — normalize it
        // to `any[]` so it flows through the array branch below instead of leaking the
        // bare `List` / `NewList` identifiers that don't exist in the Go runtime.
        if (wrappedType === 'List') {
            wrappedType = 'any[]';
        }

        if (wrappedType === 'string[][]') {
            return addTaskIfNeeded('[][]string');
        }

        // check if returns a list
        if (wrappedType.endsWith('[]')) {
            isList = true;
            wrappedType = wrappedType.substring(0, wrappedType.length - 2);
        }

        if (this.isObject(wrappedType)) {
            if (isReturn) {
                return addTaskIfNeeded('map[string]any');
            }
            return addTaskIfNeeded('any');
        }
        if (this.isDictionary(wrappedType)) {
            return addTaskIfNeeded('map[string]any');
        }
        if (this.isStringType(wrappedType)) {
            return addTaskIfNeeded('string');
        }
        if (this.isIntegerType(wrappedType)) {
            return addTaskIfNeeded('int64');
        }
        if (this.isNumberType(wrappedType)) {
            // return addTaskIfNeeded('float');
            return addTaskIfNeeded('float64');
        }
        if (this.isBooleanType(wrappedType)) {
            return addTaskIfNeeded('bool');
        }
        if (wrappedType === 'Strings') {
            return addTaskIfNeeded('[]string');
        }
        if (goReplacements[wrappedType] !== undefined) {
            return addTaskIfNeeded(goReplacements[wrappedType]);
        }

        if (wrappedType.startsWith('Dictionary<')) {
            // Always convert the value type to ensure array/slice notation is correct.
            let valueType = wrappedType.substring(11, wrappedType.length - 1).trim();

            // Recursively convert the inner type (handles nested Dictionary and [] types).
            valueType = this.jsTypeToGo(name, valueType) as any;

            return addTaskIfNeeded(`map[string]${valueType}`);
        }

        return addTaskIfNeeded(wrappedType);
    }

    safeGoName(name: string): string {
        const goReservedWordsReplacement: dict = {
            'type': 'typeVar',
        };
        return goReservedWordsReplacement[name] || name;
    }

    convertParamsToGo(methodName: string, params: any[]): string {
        const needsVariadicOptions = params.some(param => param.optional || param?.initializer !== undefined);
        if (needsVariadicOptions && params.length === 1 && params[0].name === 'params') {
            // handle params = {}
            return 'params ...any';
        }
        const paramsParsed = params.map(param => this.convertJavascriptParamToGoParam(param)).join(', ');
        if (!needsVariadicOptions) {
            return paramsParsed;
        }
        // return paramsParsed;
        const regularParams = params.filter(params => !params.optional && params?.initializer === undefined);
        const regularParamsParsed = regularParams.map(param => this.convertJavascriptParamToGoParam(param));
        // const optionalParams = params.filter(params => params.optional || params?.initializer !== undefined);
        const allParams =  regularParamsParsed.concat(['options ...' + capitalize(methodName) + 'Options']);
        return allParams.join(', ');
    }

    convertJavascriptParamToGoParam(param: any): string | undefined {
        const name = param.name;
        const safeName = this.safeGoName(name);
        const isOptional =  param.optional || param.initializer !== undefined;
        const op = isOptional ? '?' : '';
        let paramType: any = undefined;
        if (param.type == undefined) {
            paramType = 'any';
        } else {
            paramType = this.jsTypeToGo(name, param.type);
        }
        const isNonNullableType = this.isNumberType(param.type) || this.isBooleanType(param.type) || this.isIntegerType(param.type);
        if (isNonNullableType) {
            if (isOptional) {
                // if (param.initializer !== undefined && param.initializer !== 'undefined') {
                return `${safeName} *${paramType}`;
                // } else {
                //     if (paramType  === 'bool') {
                //         return `${paramType}? ${safeName} = false`
                //     }
                //     if (paramType === 'double' || paramType  === 'float') {
                //         return `${paramType}? ${safeName}2 = 0`
                //     }
                //     if (paramType  === 'Int64') {
                //         return `${paramType}? ${safeName}2 = 0`
                //     }
                //     return `${safeName} ${paramType}`
                // }
            }
        } else {
            if (isOptional) {
                // if (param.initializer !== undefined) {
                //         if (param.initializer === 'undefined' || param.initializer === '{}' || paramType === 'object') {
                //             return `${paramType} ${safeName} = null`
                //         }
                //         return `${paramType} ${safeName} = ${param.initializer.replaceAll("'", '"')}`
                // }
                return `${safeName} *${paramType}`;
            } else {
                return `${safeName} ${paramType}`;
            }
        }
        return `${safeName} ${paramType}`;
    }

    shouldCreateWrapper(methodName: string, isWs = false): boolean {
        const allowedPrefixes = [
            'fetch',
            'create',
            'edit',
            'cancel',
            'setP',
            'setM',
            'setL',
            'transfer',
            'withdraw',
            'watch',
            'unWatch'
            // 'load',
        ];
        // const allowedPrefixesWs = [
        //     ''
        // ]
        const blacklistMethods = new Set ([
            'createContractOrder',
            'createNetworksByIdObject',
            'createSpotOrder',
            'createSwapOrder',
            'createVault',
            'fetch',
            'fetchCurrenciesWs',
            'fetchMarketsWs',
            'fetchPortfolioDetails',
            'loadMarketsHelper',
            'loadOrderBook',
            'setPositionCache',
            'setPositionsCache',
            'setLastRequest',
            'setLastRestRequestTimestamp',
            'setProperty',
            'setProxyAgents',
            'setSandBoxMode',
            'unWatch',
            'unWatchChannel',
            'unWatchChannel',
            'unWatchMultiple',
            'unWatchPrivate',
            'unWatchPublic',
            'unWatchPublicMultiple',
            'unWatchTopics',
            'watch',
            'watchMany',
            'watchMultiHelper',
            'watchMultiple',
            'watchMultipleSubscription',
            'watchMultipleWrapper',
            'watchMultiRequest',
            'watchMultiTicker',
            'watchMultiTickerHelper',
            'watchPrivate',
            'watchPrivateMultiple',
            'watchPrivateRequest',
            'watchPrivateSubscribe',
            'watchPublic',
            'watchPublicMultiple',
            'watchSpotPrivate',
            'watchSwapPrivate',
            'watchSpotPublic',
            'watchSwapPublic',
            'watchTopics',
            // 'fetchCurrencies',
        ]); // improve this later
        if (methodName.toLowerCase().includes('uta')) {
            return false; // skip UTA methods
        }
        if (isWs) {
            if (methodName.indexOf('Snapshot') !== -1 || methodName.indexOf('Subscription') !== -1 || methodName.indexOf('Cache') !== -1) {
                return false;
            }
        }
        const isBlackListed = blacklistMethods.has (methodName);
        const startsWithAllowedPrefix = allowedPrefixes.some(prefix => methodName.startsWith(prefix));
        return !isBlackListed && startsWithAllowedPrefix;
    }

    unwrapTaskIfNeeded(type: string): string {
        return type.replace('<- chan ', '');
    }

    unwrapListIfNeeded(type: string): string {
        return type.replace('[]', '');
    }

    unwrapDictionaryIfNeeded(type: string): string {
        return type.startsWith('Dictionary<string,') && type.endsWith('>') ? type.substring(19, type.length - 1) : type;
    }

    createReturnStatement(methodName: string,  unwrappedType:string ) {

        // custom handling for now
        if (methodName === 'fetchTime'){
            return `(res).(int64)`;
        }

        if (unwrappedType === 'float64') {
            return `(res).(float64)`;
        }
        if (unwrappedType === 'int64') {
            return `(res).(int64)`;
        }
        if (methodName.startsWith('watchOrderBook')) {
            return this.isPrediction ? `NewPredictionOrderBookFromWs(res)` : `NewOrderBookFromWs(res)`;
        }

        if (methodName === 'fetchDepositWithdrawFees' || methodName === 'fetchDepositWithdrawFee') {
            return `(res).(map[string]any)`;
        }

        if (methodName.startsWith('unWatch')) {
            // type not unified yet
            return 'res'
        }

        // handle the typescript type Dict
        if (unwrappedType === 'Dict' || unwrappedType === 'map[string]any') {
            return `res.(map[string]any)`;
        }

        if (unwrappedType === '[]map[string]any') {
            return `NewMapArray(res)`; // safe conversion, the runtime value is usually a []any
        }

        const needsToInstantiate = !unwrappedType.startsWith('List<') &&
            !unwrappedType.startsWith('Dictionary<') &&
            !unwrappedType.startsWith('map[') &&
            unwrappedType !== 'object' &&
            unwrappedType !== 'string' &&
            unwrappedType !== 'float' &&
            unwrappedType !== 'bool' &&
            unwrappedType !== 'Int64';
        let returnStatement = "";
        if (unwrappedType.startsWith('[]')) {
            const typeWithoutList = this.unwrapListIfNeeded(unwrappedType);
            returnStatement = `New${capitalize(typeWithoutList)}Array(res)`;
        } else {
            returnStatement =  needsToInstantiate ? `New${capitalize(unwrappedType)}(res)` :  `res.(${unwrappedType})`;
        }
        return returnStatement;
    }

    getDefaultParamsWrappers(name: string, rawParameters: any[]) {
        let res: string[] = [];

        const hasOptionalParams = rawParameters.some(param => param.optional || param.initializer !== undefined || param.initializer === 'undefined');
        const isOnlyParams = rawParameters.length === 1 && rawParameters[0].name === 'params';
        const i2 = this.inden(2);
        const i1 = this.inden(1);
        if (hasOptionalParams && !isOnlyParams) {
            const structName = capitalize(name) + 'Options';
            const initOptions = [
                '',
                'opts := ' + structName + 'Struct{}',
                '',
                'for _, opt := range options {',
                '    opt(&opts)',
                '}'
            ].map(e => e!='' ? i1 + e : e);
            res = res.concat(initOptions);
        }
        if (!isOnlyParams) {
            rawParameters.forEach(param => {

                const isOptional =  param.optional || param.initializer === 'undefined' || param.initializer !== undefined || param.initializer === '{}';
                // const isOptional =  param.optional || param.initializer !== undefined;
                if (isOptional) {
                    const capName = capitalize(param.name);
                    // const decl =  `${this.inden(2)}var ${param.name} = ${param.name}2 == 0 ? null : (object)${param.name}2;`;
                    let decl = `
    var ${this.safeGoName(param.name)} any = nil
    if opts.${capName} != nil {
        ${this.safeGoName(param.name)} = *opts.${capName}
    }`;
                res.push(decl);
                }
            });

        }
        return res.join("\n");
    }

    inden(level: number) {
        return '    '.repeat(level);
    }

    // qualifies base ccxt type names (e.g. Ticker -> ccxt.Ticker) for code generated
    // into a sibling package (pro / prediction); primitives are left untouched
    qualifyBaseGoType(type: string | undefined): string | undefined {
        if (!type) {
            return type;
        }
        const baseNames = this.extractTypeAndFuncNames(EXCHANGES_FOLDER);
        return type.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (m) => baseNames.has(m) ? `ccxt.${capitalize(m)}` : m);
    }

    createOptionsStruct(methodName: string, params: any[], isWs: boolean | 'prediction' = false) {
        const capName = capitalize(methodName);
        const optionalParams = params.filter(param => (
            param.optional ||
            param.initializer !== undefined ||
            param.initializer === 'undefined' ||
            param.initializer === '{}'
        ));
        // prediction is tracked via the instance flag; the isWs param is a plain boolean here
        const isPrediction = this.isPrediction || (isWs === 'prediction');
        if (
            (optionalParams.length === 0) ||
            (params.length === 1 && params[0].name === 'params')
        ) {
            return;
        }
        // reuse an already-generated struct, EXCEPT when a prediction method's optional params
        // differ from the existing (base) struct — e.g. fetchTickers takes `outcomes` not
        // `symbols`, so it needs a prediction-LOCAL struct with the renamed field instead of
        // the ccxt.-qualified base one (which would have no `Outcomes` field).
        let predictionLocalOverride = false;
        if (capName in goTypeOptions) {
            if (isPrediction) {
                const existingFields = (goTypeOptions[capName].match (/^\s+(\w+) \*/gm) || []).map (s => s.trim ().split (' ')[0]);
                const predFields = optionalParams.map (param => capitalize (param.name));
                predictionLocalOverride = predFields.some (f => existingFields.indexOf (f) === -1);
            }
            if (!predictionLocalOverride) {
                return;
            }
        }
        const i1 = this.inden(1);
        const one = this.inden(0);
        const two = this.inden(1);
        const three = this.inden(2);

        const options = `${capName}Options`;
        const optionsStruct = `${capName}OptionsStruct`;

        // the prediction package aliases the structs that already exist in the base
        // package and declares local ones for prediction-only / param-renamed methods
        const useAlias = (isWs === true) || (isPrediction && baseGoTypeOptionNames.has(capName) && !predictionLocalOverride);
        if (isPrediction && !useAlias) {
            // a locally-declared option struct (param-renamed base method, or a prediction-only
            // method like fetchOrdersByIds): record its names so the defining exchange's wrapper
            // binds to the local struct rather than a ccxt.-qualified base struct of the same name
            const localNames = [ options, optionsStruct ];
            optionalParams
                .filter ((param) => param.optional || param.initializer !== undefined)
                .forEach ((param) => localNames.push (`With${capName}${capitalize (param.name)}`));
            predictionLocalOptionStructs.set (capName, localNames);
        }
        const qualify = (type: string | undefined) => (isPrediction ? this.qualifyBaseGoType(type) : type);

        if (useAlias) {
            goTypeOptions[capName] = [
                `type ${optionsStruct} = ccxt.${optionsStruct}`,
                `type ${options} = ccxt.${options}`,
                ...optionalParams.map(param => {
                    const methodName = `With${capName}${capitalize(param.name)}`;
                    return`var ${methodName} = ccxt.${methodName}`
                }),
            ].join('\n');
        } else {
            goTypeOptions[capName] = [
                `type ${optionsStruct} struct {`,
                ...optionalParams.map((param) => (
                    `${i1}${capitalize(param.name)} *${qualify(this.jsTypeToGo(param.name, param.type))}`
                )),
                '}',
                '',
                `type ${options} func(opts *${optionsStruct})`,
                ...optionalParams
                    .filter((param) => param.optional || param.initializer !== undefined)
                    .map((param) => {
                        const name = capitalize(param.name);
                        const type = qualify(this.jsTypeToGo(param.name, param.type));
                        return [
                            '',
                            `${one}func With${capName}${name}(${this.safeGoName(param.name)} ${type}) ${options} {`,
                            `${two}return func(opts *${optionsStruct}) {`,
                            `${three}opts.${name} = &${this.safeGoName(param.name)}`,
                            `${two}}`,
                            `${one}}`,
                            ''
                        ].join('\n');
                    }),
                // here WithX methods with optional parameters, like withPrice, withSince, withParams, etc
                // example
                // func WithPrice(price float64) CreateOrderOptions {
                //     return func(opts *CreateOrderOptionsStruct) {
                //         opts.Price = &price
                //     }
                // }
            ].join('\n');
        }
    }

    createMissingMethodWrapper(exchangeName: string, name: string, methodInfo: any) {
        if (!methodInfo) {
            return '';
        }
        const itf = methodInfo.interface;
        // const params = methodInfo.params;
        const exCap = capitalize(exchangeName);
        const nameCap = capitalize(name);
        const wrapper = methodInfo.wrapper;

        let args: string[] = [];
        for (const param of wrapper.parameters) {
            if (param.name === 'params' && wrapper.parameters.length === 1) {
                args.push('params...');
                break;
            }
            if (param.isOptional || param.name === 'params' || param.initializer !== undefined || param.initializer === 'undefined' || param.initializer === '{}') {
                // if (wrapper.parameters.length === 1) {
                //     args.push(`params...`)
                // } else {
                //     args.push(`options...`)
                // }
                args.push(`options...`);
                break;
            } else {
                args.push(this.safeGoName(param.name));
            }
        }

        return `func (this *${exCap}) ${itf} {return this.exchangeTyped.${nameCap}(${args.join(', ')})}`;
    }

    createWrapper (exchangeName: string, methodWrapper: any, isWs: boolean | 'prediction' = false) {
        // non-async methods with a declared Promise<T> return type (pure delegators) must be wrapped like async ones
        const isAsync = methodWrapper.async || (methodWrapper.returnType ?? '').startsWith ('Promise');
        const isExchange = exchangeName === 'Exchange';
        const methodName = methodWrapper.name;
        if (!this.shouldCreateWrapper(methodName, isWs === true) || !isAsync) {
            return ''; // skip aux methods like encodeUrl, parseOrder, etc
        }

        const methodNameCapitalized = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        const returnType = this.jsTypeToGo(methodName, methodWrapper.returnType, true);
        let unwrappedType = this.unwrapTaskIfNeeded(returnType as string);
        const stringArgs = this.convertParamsToGo(methodName, methodWrapper.parameters);
        this.createOptionsStruct(methodName, methodWrapper.parameters, isWs);
        // const stringArgs = args.filter(arg => arg !== undefined).join(', ');
        let params = methodWrapper.parameters.map((param: any) => {
            let parsedParam = this.safeGoName(param.name);

            if (methodName === 'createOrders' && param.name === 'orders') {
                // prediction venues batch PredictionOrderRequest (outcome) not OrderRequest (symbol)
                parsedParam = this.isPrediction ? 'ConvertPredictionOrderRequestListToArray(orders)' : 'ConvertOrderRequestListToArray(orders)'; // quick fix, check this later
            }

            return parsedParam;
        }).join(', ');

        const one = this.inden(0);
        const two = this.inden(1);
        const three = this.inden(2);
        const methodDoc = [] as any[];
        if (goComments[exchangeName] && goComments[exchangeName][methodName]) {
            methodDoc.push(goComments[exchangeName][methodName]);
        }

        let emptyObject = `${unwrappedType}{}`;
        if (unwrappedType.startsWith('[]')) {
            emptyObject = 'nil'
        } else if (unwrappedType.includes('int64')) {
            emptyObject = '-1'
        } else if (unwrappedType.includes('float64')) {
            emptyObject = 'float64(-1)'
        } else if (unwrappedType === 'string') {
            emptyObject = '""'
        } else if (unwrappedType === 'any') {
            emptyObject = 'nil';
        }

        const defaultParams =  this.getDefaultParamsWrappers(methodName, methodWrapper.parameters);

        if (stringArgs =='params ...any') {
            params = 'params...';
        }

        const accessor = isExchange ? 'this.Exchange.' : 'this.Core.';
        const body = [
            // `${two}ch:= make(chan ${unwrappedType})`,
            // `${two}go func() {`,
            // `${three}defer close(ch)`,
            // `${three}defer ReturnPanicError(ch)`,
           `${defaultParams}`,
            `${two}res := <- ${accessor}${methodNameCapitalized}(${params})`,
            `${two}if IsError(res) {`,
            `${three}return ${emptyObject}, CreateReturnError(res)`,
            `${two}}`,
            `${two}return ${this.createReturnStatement(methodName, unwrappedType)}, nil`,
            // `${two}}()`,
            // `${two}return ch`,
        ];
        const interfaceMethod = `${methodNameCapitalized}(${stringArgs}) (${unwrappedType}, error)`
        if (!WRAPPER_METHODS[exchangeName]) {
            WRAPPER_METHODS[exchangeName] = [];
        }
        if (!WRAPPER_METHODS[exchangeName][methodName]) {
            WRAPPER_METHODS[exchangeName][methodName] = {};
        }
        WRAPPER_METHODS[exchangeName][methodName] = {
            wrapper: methodWrapper,
            interface: interfaceMethod,
            params: stringArgs,
        };
        // wrapperMethods[exchangeName].push([interfaceMethod, stringArgs, methodWrapper]);
        const funcContext = isExchange ? 'ExchangeTyped' : capitalize(exchangeName);
        const method = [
            `${one}func (this *${funcContext}) ${methodNameCapitalized}(${stringArgs}) (${unwrappedType}, error) {`,
            ...body,
            // this.getDefaultParamsWrappers(methodNameCapitalized, methodWrapper.parameters),
            // `${two}res := ${isAsync ? '<-' : ''}this.${exchangeName}.${methodNameCapitalized}(${params});`,
            // `${two}${this.createReturnStatement(methodName, unwrappedType)}`,
            `${one}}`
        ];
        // return methodDoc.concat(method).concat(withMethod).filter(e => !!e).join('\n')
        return methodDoc.concat(method).filter(e => !!e).join('\n');
    }

    createExchangesWrappers(): string[] {
        // in go classes should be Capitalized, so I'm creating a wrapper class for each exchange
        const res: string[] = ['// class wrappers'];
        exchangeIds.forEach((exchange: string) => {
            const capitalizedExchange = exchange.charAt(0).toUpperCase() + exchange.slice(1);
            const capitalName = capitalizedExchange.replace('.ts','');
            const constructor = `public ${capitalName}(object args = null) : base(args) { }`;
            res.push(`public class  ${capitalName}: ${exchange.replace('.ts','')} { ${constructor} }`);
        });
        return res;
    }

    createGoWrappers(exchange: string, path: string, wrappers: any[], ws: boolean | 'prediction' = false) {
        const isPrediction = (ws === 'prediction');
        const isWs = (ws === true);
        const methodsList = new Set(wrappers.map(wrapper => wrapper.name));
        const missingMethods = INTERFACE_METHODS.filter(method => !methodsList.has(method));
        const isAlias = this.isAlias(exchange);
        let wrappersIndented = wrappers.map(wrapper => this.createWrapper(exchange, wrapper, ws)).filter(wrapper => wrapper !== '').join('\n');
        if (isWs && path === GLOBAL_WRAPPER_FILE) {
            return;
        }
        // BaseExchangeTyped mirrors ExchangeTyped but embeds only *BaseExchange and carries only the
        // base unified methods (never the 62 symbol-based ones). Prediction venues delegate their
        // inherited base methods to it, so the 62 stay off the prediction API. Reuse the ExchangeTyped
        // wrapper bodies with the base subset, rewriting the receiver and accessor.
        if (exchange === 'Exchange' && !isWs) {
            const baseTypedWrappers = wrappers
                .filter ((wrapper: any) => !this.exchangeTierMethods.has (wrapper.name))
                .map ((wrapper: any) => this.createWrapper (exchange, wrapper, ws))
                .filter ((wrapper: string) => wrapper !== '')
                .join('\n')
                .replace (/func \(this \*ExchangeTyped\)/g, 'func (this *BaseExchangeTyped)')
                .replace (/this\.Exchange\./g, 'this.BaseExchange.');
            wrappersIndented = wrappersIndented + '\n' + baseTypedWrappers;
        }

        let missingMethodsWrappers = '';
        if (exchange !== 'Exchange') {
            if (!WRAPPER_METHODS['Exchange']) {
                throw new Error('Exchange wrapper methods are not defined, please transpile base methods first');
            }
            missingMethodsWrappers = `func (this *${capitalize(exchange)}) LoadMarkets(params ...any) (map[string]MarketInterface, error) { return this.exchangeTyped.LoadMarkets(params...) }\n`;
            missingMethodsWrappers += missingMethods.map (m => {
                // for prediction venues, a unified method the venue doesn't override but
                // PredictionExchange declares must emit the prediction-typed wrapper (resolving to
                // the inherited base method via this.Core), not the crypto-typed exchangeTyped fallback
                if (this.isPrediction) {
                    const predMethod = this.predictionBaseMethodsTypes.find ((w: any) => w.name === m);
                    if (predMethod) {
                        return this.createWrapper (exchange, predMethod, ws);
                    }
                    // the 62 symbol-based trading methods live only on the Exchange tier (not
                    // PredictionExchange), so prediction venues must not expose them — this keeps the Go
                    // prediction API in line with TS/C#/Java and with the Python/PHP tier-split.
                    if (this.exchangeTierMethods.has (m)) {
                        return '';
                    }
                }
                return this.createMissingMethodWrapper(exchange, m,  WRAPPER_METHODS['Exchange'][m]);
            }).filter(wrapper => wrapper !== '').join('\n');
        }

        const shouldCreateClassWrappers = exchange === 'Exchange';
        const classes = shouldCreateClassWrappers ? this.createExchangesWrappers().filter(e=> !!e).join('\n') : '';
        let packageName = ws ? 'ccxtpro' : 'ccxt';
        if (this.isPrediction) {
            packageName = ws ? PREDICTION_WS_PACKAGE : PREDICTION_PACKAGE;
        }
        const namespace = `package ${packageName}`;
        const capitizedName = exchange.charAt(0).toUpperCase() + exchange.slice(1);
        const coreName = capitalize(exchange) + 'Core';
        // const capitalizeStatement = ws ? `public class  ${capitizedName}: ${exchange} { public ${capitizedName}(object args = null) : base(args) { } }` : '';
        let fromCoreMethod: string = '';

        let exchangeStruct = '';
        if (exchange === 'Exchange') {

            exchangeStruct = [
                // ExchangeTyped embeds the concrete *Exchange (which itself embeds BaseExchange), so it
                // exposes both the base methods and the 62 symbol-based trading methods — regular venues
                // delegate their inherited unified methods here. Prediction venues use BaseExchangeTyped
                // (base methods only) instead, so the 62 stay off the prediction API.
                `type ExchangeTyped struct {`,
                `   *Exchange`,
                `}`,
                ``,
                `type BaseExchangeTyped struct {`,
                `   *BaseExchange`,
                `}`
            ].join('\n');

        } else {
            let exchangeTyped = ''
            if (!isWs) {
                // prediction exchanges extend the base Exchange directly, so the typed
                // fallback is the base ExchangeTyped (cross-package prefixing adds ccxt.)
                if (!isAlias) {
                    exchangeTyped =  this.isPrediction ? '*ccxt.BaseExchangeTyped' : '*ExchangeTyped';
                } else {
                    exchangeTyped = '*'+capitalize(this.getParentExchange(exchange));
                }
            } else {
                const restPackagePrefix = this.isPrediction ? `*${PREDICTION_PACKAGE}.` : '*ccxt.';
                exchangeTyped = !this.isAlias(exchange) ? `${restPackagePrefix}${capitizedName}` : restPackagePrefix + capitalize(this.getParentExchange(exchange))
            }
            exchangeStruct = [
                `type ${capitizedName} struct {`,
                `   *${coreName}`,
                `   Core *${coreName}`,
                `   exchangeTyped ${exchangeTyped}`,
                `}`
            ].join('\n');

        }

        let newMethod = '';
        if (exchange === 'Exchange') {
            newMethod = [
                'func NewExchangeTyped(exchangePointer *Exchange) *ExchangeTyped {',
                `   return &ExchangeTyped{`,
                `       Exchange: exchangePointer,`,
                `   }`,
                '}',
                '',
                '// NewBaseExchangeTyped wraps a bare *BaseExchange (used by prediction venues, which',
                '// embed BaseExchange via PredictionExchange rather than the concrete Exchange). It exposes',
                '// the base unified methods only — never the 62 symbol-based trading methods.',
                'func NewBaseExchangeTyped(base *BaseExchange) *BaseExchangeTyped {',
                `   return &BaseExchangeTyped{`,
                `       BaseExchange: base,`,
                `   }`,
                '}',
                '',
                'func (this *ExchangeTyped) LoadMarkets(params ...any) (map[string]MarketInterface, error) {',
                '	res := <-this.Exchange.LoadMarkets(params...)',
                '	if IsError(res) {',
                '		return nil, CreateReturnError(res)',
                '	}',
                '	return NewMarketsMap(res), nil',
                '}',
                '',
                'func (this *BaseExchangeTyped) LoadMarkets(params ...any) (map[string]MarketInterface, error) {',
                '	res := <-this.BaseExchange.LoadMarkets(params...)',
                '	if IsError(res) {',
                '		return nil, CreateReturnError(res)',
                '	}',
                '	return NewMarketsMap(res), nil',
                '}',
            ].join('\n');

        } else {
            const baseEx = !this.isAlias(exchange) ? 'p.base' : 'p.base.base'
            // const exTyped = !ws ? 'NewExchangeTyped(&p.Exchange)' : `ccxt.New${capitizedName}FromCore(${baseEx})`
            let exTyped = '';
            if (!isWs) {
                if (!isAlias) {
                    // prediction cores embed BaseExchange (via PredictionExchange), not the concrete
                    // Exchange, so wrap the bare base pointer through NewExchangeTypedFromBase
                    exTyped = this.isPrediction ? 'ccxt.NewBaseExchangeTyped(&p.BaseExchange)' : 'NewExchangeTyped(&p.Exchange)';
                } else {
                    const parent = this.isAlias(exchange) ? this.getParentExchange(exchange) : '';
                    exTyped = `New${capitalize(this.getParentExchange(exchange))}FromCore(&(p.${capitalize(parent)}Core))`;
                }
            } else {
                const restPackagePrefix = this.isPrediction ? `${PREDICTION_PACKAGE}.` : 'ccxt.';
                exTyped = `${restPackagePrefix}New${capitizedName}FromCore(${baseEx})`
            }

            newMethod = [
                'func New' + capitizedName + '(userConfig map[string]any) *' + capitizedName + ' {',
                `   p := New${coreName}()`,
                '   p.Init(userConfig)',
                `   return &${capitizedName}{`,
                `       ${coreName}: p,`,
                `       Core:  p,`,
                `       exchangeTyped: ${exTyped},`,
                `   }`,
                '}'
            ].join('\n');


            if (!isWs) {

                const exchangeTypedFactory = this.isPrediction ? 'ccxt.NewBaseExchangeTyped' : 'NewExchangeTyped';
                const exchangeTypedArg = this.isPrediction ? '&core.BaseExchange' : '&core.Exchange';
                const coreExchange = !isAlias ? `${capitizedName}` : `${capitalize(this.getParentExchange(exchange))}`;
                fromCoreMethod = [
                    `func New${capitizedName}FromCore(core *${coreExchange}Core) *${coreExchange} {`,
                    `   return &${coreExchange}{`,
                    `       ${coreExchange}Core: core,`,
                    `       Core:  core,`,
                    `       exchangeTyped: ${exchangeTypedFactory}(${exchangeTypedArg}),`,
                    `   }`,
                    '}',
                ].join('\n');

            }
        }

        let importLines = ws ? imports.join('\n') : '';
        if (this.isPrediction) {
            importLines = ws ? [ ...imports, PREDICTION_IMPORT ].join('\n') : imports.join('\n');
        }
        let file = [
            namespace,
            importLines,
            exchangeStruct,
            '',
            newMethod,
            fromCoreMethod,
            '',
            this.createGeneratedHeader().join('\n'),
            '',
            wrappersIndented,
            '// missing typed methods from base',
            '//nolint',
            missingMethodsWrappers,
        ].join('\n');
        if (ws || this.isPrediction) {
            // copy — extractTypeAndFuncNames returns a CACHED Set; mutating it below would
            // corrupt the cache for every later exchange/call
            const baseNames = new Set (this.extractTypeAndFuncNames(EXCHANGES_FOLDER));
            if (this.isPrediction) {
                // keep renamed-param option structs unqualified so the wrapper binds to the local
                // struct (with `Outcome`) rather than the ccxt base struct. covers both methods THIS
                // exchange defines AND unified methods it inherits from PredictionExchange (emitted as
                // typed wrappers above) — both need the prediction-local option struct.
                const localMethodNames = wrappers.map ((w: any) => w.name)
                    .concat (missingMethods.filter ((m: string) => this.predictionBaseMethodsTypes.some ((w: any) => w.name === m)));
                for (const methodName of localMethodNames) {
                    const localNames = predictionLocalOptionStructs.get(capitalize(methodName));
                    if (localNames !== undefined) {
                        for (const name of localNames) {
                            baseNames.delete(name);
                        }
                    }
                }
            }
            file = this.addPackagePrefix(file, baseNames, 'ccxt');
        }
        log.magenta ('→', (path as any).yellow);

        overwriteFileAndFolder (path, file);
    }

    transpileErrorHierarchy () {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js';
        const errorHierarchyPath = `${__dirname}/.${errorHierarchyFilename}`;

        let js = fs.readFileSync (errorHierarchyPath, 'utf8');

        js = this.regexAll (js, [
            // [ /export { [^\;]+\s*\}\n/s, '' ], // new esm
            [ /\s*export default[^\n]+;\n/g, '' ],
            // [ /module\.exports = [^\;]+\;\n/s, '' ], // old commonjs
        ]).trim ();

        const message = 'Transpiling error hierachy →';
        const root = errorHierarchy['BaseError'];

        // a helper to generate a list of exception class declarations
        // properly derived from corresponding parent classes according
        // to the error hierarchy

        function intellisense (map: any, parent: any, generate: any, classes: any) {
            function* generator(map: any, parent: any, generate: any, classes: any): any {
                for (const key in map) {
                    yield generate (key, parent, classes);
                    yield* generator (map[key], key, generate, classes);
                }
            }
            return Array.from (generator (map, parent, generate, classes));
        }

        const errorNames: string[] = [];
        function GoMakeErrorFile (name: string, parent: any) {
            errorNames.push(name);
            const exception =
`func ${name}(v ...any) error {
    return NewError("${name}", v...)
}`;
            return exception;
        }

        const goErrors = intellisense (root as any, 'BaseError', GoMakeErrorFile, undefined);


        // createError function
        const caseStatements = errorNames.map(error => {
            return`    case "${error}":
        return ${error}(v...)`;
        });

        const functionDecl = `func CreateError(err string, v ...any) error {
    switch err {
${caseStatements.join('\n')}
        default:
            return NewError(err, v...)
    }
}`;

    const constStatements = errorNames.map(error => {
        return`   ${error}ErrType ErrorType = "${error}"`;
    });

    const constDecl =` const (
${constStatements.join('\n')}
)`;

        const goBodyIntellisense = '\npackage ccxt\n' + this.createGeneratedHeader().join('\n') + '\n' + goErrors.join ('\n') + '\n' + functionDecl + '\n' + constDecl + '\n';
        if (fs.existsSync (ERRORS_FILE)) {
            log.bright.cyan (message, (ERRORS_FILE as any).yellow);
            overwriteFileAndFolder (ERRORS_FILE, goBodyIntellisense);
        }

        log.bright.cyan (message, (ERRORS_FILE as any).yellow);

    }

    transpileBaseMethods(baseExchangeFile: string, isWs = false) {
        log.bright.cyan ('Transpiling base methods →', baseExchangeFile.yellow, BASE_METHODS_FILE.yellow);
        const goExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        // to go
        // const tsContent = fs.readFileSync (baseExchangeFile, 'utf8');
        // const delimited = tsContent.split (delimiter)
        const baseMethods = VIRTUAL_BASE_METHODS;
        const allVirtual = Object.keys(baseMethods);
        this.transpiler.goTranspiler.wrapCallMethods = allVirtual;
        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile = this.transpiler.transpileGoByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        this.transpiler.goTranspiler.wrapCallMethods = [];
        let baseClass = baseFile.content as any; // remove this later

        // capture the 62 symbol-based method names from the TS `Exchange extends BaseExchange` tier,
        // so the wrappers keep them on ExchangeTyped (regular venues) and off prediction venues.
        const tsRaw = fs.readFileSync (baseExchangeFile, 'utf8');
        const exTierMatch = tsRaw.match (/export default class Exchange extends BaseExchange \{([\s\S]*?)\n\}/);
        this.exchangeTierMethods = new Set ();
        if (exTierMatch) {
            const methodNameRe = /^ {4}(?:async )?([a-zA-Z][a-zA-Z0-9]*) \(/gm;
            let mm;
            while ((mm = methodNameRe.exec (exTierMatch[1])) !== null) {
                this.exchangeTierMethods.add (mm[1]);
            }
        }

        const syncMethods = allVirtual.filter(elem => !baseMethods[elem]);
        const asyncMethods = allVirtual.filter(elem => baseMethods[elem]);

        const syncRegex = new RegExp(`<-this\\.callInternal\\("(${syncMethods.join('|')})", (.+)\\)`, 'gm');
        // console.log(syncRegex)
        // baseClass = baseClass.replace(syncRegex, 'this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(syncRegex, (_match: any, p1: string, p2: string) => {
            const capitalizedMethod = capitalize(p1);
            return `this.DerivedExchange.${capitalizedMethod}(${p2})`;
        });

        const asyncRegex = new RegExp(`<-this\\.callInternal\\("(${asyncMethods.join('|')})", (.+)\\)`, 'gm');
        // console.log(asyncRegex)
        // baseClass = baseClass.replace(asyncRegex, '<-this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(asyncRegex, (_match: any, p1: string, p2: string) => {
            const capitalizedMethod = capitalize(p1);
            return `<-this.DerivedExchange.${capitalizedMethod}(${p2})`;
        });
        // create wrappers with specific types
        this.createGoWrappers('Exchange', GLOBAL_WRAPPER_FILE, baseFile.methodsTypes || [], isWs);

        // const exchangeMethods = wrapperMethods['Exchange'];
        // const sortedList = exchangeMethods.sort((a, b) => a.localeCompare(b));
        // sortedList.forEach( i => {
        //     console.log(i)
        // });


        // custom transformations needed for go
        baseClass = this.regexAll (baseClass, [
            [/\=\snew\s/gm, "= "],
            // baseClass = baseClass.replaceAll(/(?<!<-)this\.callInternal/gm, "<-this.callInternal");
            [/callDynamically\(/gm, 'this.CallDynamically('], //fix this on the transpiler
            [/throwDynamicException\(/gm, 'ThrowDynamicException('], //fix this on the transpiler
            [/currentRestInstance any,/g, "currentRestInstance Exchange,"],
            [/parentRestInstance any,/g, "parentRestInstance Exchange,"],
            [/client any,/g, "client *Client,"],
            [/this.Number = String/g, 'this.Number = "string"'],
            [/(\w+)(\.StoreArray\(.+\))/gm, '($1.(*OrderBookSide))$2'], // tmp fix for c#
            [/ch <- nil\s+\/\/.+/g, ''],

            [/currentRestInstance Exchange, parentRestInstance Exchange/g, 'currentRestInstance *Exchange, parentRestInstance *Exchange'],
            // --- WebSocket related fixes specific to **Go** ----------------------
            // 1) Access the strongly-typed field instead of dynamic lookup.
            ["client.futures", "client.Futures"],
            // 2) Remove unresolved C# artefacts concerning `number` typing – the
            //    Go layer already normalises this earlier to a literal string.
            ["((object)this).number = String;", "this.Number = \"string\""],
            ["((object)this).number = float;", "this.Number = 0"],
            // 3) Promise-style resolver calls don't exist in Go – comment them.
            ["client.resolve", "// client.resolve"],
            ["this.number = Number;", "this.number = typeof(float);"], // tmp fix for c#
            // 4) Translate the C# `throw new …` syntax into the helper used by Go.
            ["throw NewGetValue(broad, broadKey)(((string)message));", "ThrowDynamicException(getValue(broad, broadKey), message);"],
            ["throw NewGetValue(exact, str)(((string)message));", "ThrowDynamicException(getValue(exact, str), message);"],
            ["throw NewGetValue(exact, str)(message);", "ThrowDynamicException(getValue(exact, str), message);"],
            // 5) Fix error constructors - remove "New" prefix
            [/NewNotSupported/g, 'NotSupported'],
            [/NewInvalidNonce/g, 'InvalidNonce'],
            // WS fixes
            [/\(object client,/gm, '(WebSocketClient client,'],
            [/Dictionary<string,object>\)client\.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures'],
            [/(\b\w*)RestInstance.describe/g, "(\(Exchange\)$1RestInstance).describe"],
            [/GetDescribeForExtendedWsExchange\(currentRestInstance \*Exchange, parentRestInstance \*Exchange/g, 'GetDescribeForExtendedWsExchange(currentRestInstance Describer, parentRestInstance Describer'],
            [/(var \w+ any) = client.Futures/g, '$1 = (client.(Client)).Futures'], // tmp fix for go not needed after ws-merge
            // symbols is a typed []string field on BaseExchange; TS `this.symbols = []` transpiles
            // to an untyped []any{} literal which cannot be assigned to the typed field.
            [/this\.Symbols = \[\]any\{\}/g, 'this.Symbols = []string{}'],
            // Fix setMarketsFromExchange parameter type (base methods now hang off *BaseExchange)
            [/func\s+\(this \*BaseExchange\)\s+SetMarketsFromExchange\(sourceExchange any\)/g, 'func (this *BaseExchange) SetMarketsFromExchange(sourceExchange *BaseExchange)'],
            // the empty `class Exchange extends BaseExchange {}` transpiles to a thin struct +
            // a NewExchange constructor; both are hand-written in exchange.go (where NewExchange
            // returns ICoreExchange so the base tests can type-assert `.(*ccxt.Exchange)`), so drop
            // the auto-generated duplicates to avoid redeclaration.
            [/type Exchange struct \{\s*BaseExchange\s*\}/g, ''],
            [/func NewExchange\(\) \*Exchange \{[\s\S]*?\n\}/g, ''],
            // fine split: the 62 symbol-based trading methods (createOrder/fetchTicker/fetchOrders/
            // cancelOrder/watch*/… + convenience wrappers) live in `export default class Exchange
            // extends BaseExchange` in the TS source and transpile with a *Exchange receiver, which we
            // keep (matching TS/C#/Java). They hang off *Exchange (embedded by regular venues) and NOT
            // *BaseExchange, so prediction venues — which embed BaseExchange via PredictionExchange —
            // never inherit them. The concrete `Exchange` struct is hand-written in exchange.go.
            // loadOrderBook is the exception: it is hand-written on *Exchange in exchange.go (it uses
            // WS cache primitives the transpiler cannot emit), so drop the transpiled *Exchange copy to
            // avoid a redeclaration (and its untranspilable body). loadOrderBook is the first method of
            // the Exchange class, always followed by another `func (this *Exchange)`.
            [/func\s+\(this \*Exchange\)\s+LoadOrderBook\([\s\S]*?(?=\nfunc\s+\(this \*Exchange\))/g, ''],
            // the 62 dispatch a few other 62-methods through this.DerivedExchange for virtual override
            // (e.g. editLimitOrder→editOrder, fetchTicker→fetchTickers, fetchOrderStatus→fetchOrder).
            // Those callees are NOT on PredictionExchange, so they are trimmed from IDerivedExchange
            // (see go/v4/exchange_interface.go) to let prediction cores satisfy it. These dispatch
            // sites live only inside the 62 (regular-only code that prediction never compiles), so we
            // type-assert to the per-method interface (I<Method>), which the regular venue satisfies.
            [/this\.DerivedExchange\.(EditOrder|FetchOrder|FetchTickers|CancelOrderWs|CreateOrderWs|FetchOrdersWs|FetchTickersWs|FetchPositionsHistory)\(/g, 'this.DerivedExchange.(I$1).$1('],
        ]);

        const jsDelimiter = '// ' + delimiter;
        const parts = baseClass.split (jsDelimiter);
        if (parts.length > 1) {
            const baseMethods = parts[1];
            const fileHeader = this.getGoImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
            ]).join("\n");

            const file = fileHeader + baseMethods + "\n";
            fs.writeFileSync (goExchangeBase, formatGoSource (goExchangeBase, file));
        }
    }

    transpilePredictionBaseMethods (predictionBaseFile = './ts/src/base/PredictionExchange.ts', registerOnly = false) {
        // PredictionExchange is the base for prediction-market exchanges; it lives in
        // package ccxt and embeds Exchange. Its methods are transpiled the same way as
        // the base methods (with virtual dispatch through DerivedExchange).
        // named exchange_prediction.go so extractTypeAndFuncNames() (which scans go/v4/exchange*.go)
        // picks up PredictionExchange and the prediction package qualifies it as ccxt.PredictionExchange
        const goPredictionBase = './go/v4/exchange_prediction.go';
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'
        const allVirtual = Object.keys(VIRTUAL_BASE_METHODS);
        this.transpiler.goTranspiler.wrapCallMethods = allVirtual;
        const baseFile: any = this.transpiler.transpileGoByPath(predictionBaseFile);
        this.transpiler.goTranspiler.wrapCallMethods = [];
        // capture the signatures so createGoWrappers can emit prediction-typed wrappers for
        // unified methods that a venue inherits rather than overrides (runs in every process
        // that touches prediction, including --prediction where the file write is skipped)
        this.predictionBaseMethodsTypes = baseFile.methodsTypes || [];
        if (registerOnly) {
            return;
        }
        let baseClass = baseFile.content as any;
        const syncMethods = allVirtual.filter (elem => !VIRTUAL_BASE_METHODS[elem]);
        const asyncMethods = allVirtual.filter (elem => VIRTUAL_BASE_METHODS[elem]);
        const syncRegex = new RegExp(`<-this\\.callInternal\\("(${syncMethods.join('|')})", (.+)\\)`, 'gm');
        baseClass = baseClass.replace(syncRegex, (_match: any, p1: string, p2: string) => `this.DerivedExchange.${capitalize(p1)}(${p2})`);
        const asyncRegex = new RegExp(`<-this\\.callInternal\\("(${asyncMethods.join('|')})", (.+)\\)`, 'gm');
        baseClass = baseClass.replace(asyncRegex, (_match: any, p1: string, p2: string) => `<-this.DerivedExchange.${capitalize(p1)}(${p2})`);
        baseClass = this.regexAll (baseClass, [
            [/\=\snew\s/gm, "= "],
            [/callDynamically\(/gm, 'this.CallDynamically('],
            [/throwDynamicException\(/gm, 'ThrowDynamicException('],
            [/NewNotSupported/g, 'NotSupported'],
            // super.method() in the outcome-stub overrides → the embedded BaseExchange
            [/\bbase\./gm, 'this.BaseExchange.'],
            // the base parse loops (parsePredictionTrades→parsePredictionTrade, etc.) must reach the
            // venue override, not the base NotSupported stub. Go has no virtual dispatch on `this`, so
            // route through this.DerivedExchange type-asserted to IPredictionDispatch (these loops only
            // ever run on prediction instances, whose DerivedExchange satisfies it).
            [/this\.(ParsePredictionOrder|ParsePredictionTrade|ParsePredictionPosition)\(/g, 'this.DerivedExchange.(IPredictionDispatch).$1('],
        ]);
        const jsDelimiter = '// ' + delimiter;
        const parts = baseClass.split (jsDelimiter);
        if (parts.length > 1) {
            const methods = parts[1];
            const structDef = [
                'type PredictionExchange struct {',
                '   BaseExchange',
                '   Outcomes any',
                '   Outcomes_by_id any',
                '   Events any',
                '   Events_by_slug any',
                '   ReloadingEvents bool',
                '   EventsLoading any',
                '}',
                '',
            ].join('\n');
            const fileHeader = this.getGoImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
            ]).join("\n");
            // prediction exchanges live in package ccxtprediction and can only reach exported
            // members of the embedded base — expose the implicit-api dispatcher (called by the
            // generated _api.go files) and the describe-deep-extend helper as exported shims
            const shims = [
                '',
                'func (this *PredictionExchange) CallEndpointAsync(endpointName string, args ...any) <-chan any {',
                '   return this.callEndpointAsync(endpointName, args...)',
                '}',
                '',
            ].join('\n');
            const file = fileHeader + '\n' + structDef + methods + shims + "\n";
            fs.writeFileSync (goPredictionBase, file);
            log.green ('Transpiled prediction base methods to', (goPredictionBase as any).yellow)
        }
    }


    createDynamicInstanceFile(ws = false, prediction = false){
        const subFolder = ws ? '/pro' : (prediction ? '/prediction' : '');
        const dynamicInstanceFile = `./go/v4${subFolder}/exchange_dynamic.go`;
        const exchanges = ws ? exchangeIdsWs : (prediction ? predictionIds : ['Exchange'].concat(exchangeIds));
        const externalPackage = ws || prediction; // packages outside go/v4 import the base ccxt package
        const caseStatements = exchanges.map(exchange => {
            const coreName = (exchange === 'Exchange') ? exchange : capitalize(exchange) + 'Core';
            return`    case "${exchange}":
        ${exchange}Itf := New${coreName}()
        ${exchange}Itf.Init(exchangeArgs)
        return ${exchange}Itf, true`;
        });

        const functionDecl = `
func DynamicallyCreateInstance(exchangeId string, exchangeArgs map[string]any) (${externalPackage ? 'ccxt.' : ''}ICoreExchange, bool) {
    switch exchangeId {
${caseStatements.join('\n')}
    default:
        return nil, false
    }
}
`;
        const file = [
            `package ccxt${ws ? 'pro' : (prediction ? 'prediction' : '')}`,
            externalPackage ? 'import ccxt "github.com/ccxt/ccxt/go/v4"' : '',
            this.createGeneratedHeader().join('\n'),
            '',
            functionDecl,
        ].join('\n');

        fs.writeFileSync (dynamicInstanceFile, formatGoSource (dynamicInstanceFile, file));
    }


    createTypedInterfaceFile(){
        if (!WRAPPER_METHODS['Exchange']) {
            throw new Error('Exchange wrapper methods are not defined, please transpile base methods first');
        }
        const exchanges = ['exchange'].concat(exchangeIds);

        const caseStatements = exchanges.map(exchange => {
            const struct = exchange === 'exchange' ? 'ExchangeTyped' : capitalize(exchange);
            const args = exchange === 'exchange' ? 'nil' : 'options';
            return`    case "${exchange}":
        itf := New${struct}(${args})
        return itf`;
        });

        const functionDecl = `
func CreateExchange(exchangeId string, options map[string]any) IExchange {
    exchangeId = strings.ToLower(exchangeId)
    switch exchangeId {
${caseStatements.join('\n')}
        default:
            return nil
    }
}
`;
        const interfaceMethods = Object.keys(WRAPPER_METHODS['Exchange']).map(method => {
            const methodInfo = WRAPPER_METHODS['Exchange'][method];
            if (!INTERFACE_METHODS.includes(method)) {
                return '';
            }
            return methodInfo.interface;
        }).filter(e => !!e);

        const interfaceDecl = `
type IExchange interface {
    IBaseExchange
    ${interfaceMethods.join('\n    ')}
}`;

        const file = [
            'package ccxt',
            'import "strings"',
            this.createGeneratedHeader().join('\n'),
            '',
            interfaceDecl,
            functionDecl,
        ].join('\n');

        fs.writeFileSync (TYPED_INTERFACE_FILE, formatGoSource (TYPED_INTERFACE_FILE, file));
    }

    // ----- WS specific ----- //
    createWsTypedInterfaceFile(){

        const interfaceWs = [
            'type IExchange interface {',
            '    ccxt.IExchange',
            '}'
        ].join('\n');

        const caseStatements = exchangeIdsWs.map(exchange => {
            const struct = capitalize(exchange);
            const args = 'options';
            return`    case "${exchange}":
        itf := New${struct}(${args})
        return itf`;
        });

        const functionDecl = `
func CreateExchange(exchangeId string, options map[string]any) ccxt.IExchange {
    exchangeId = strings.ToLower(exchangeId)
    switch exchangeId {
${caseStatements.join('\n')}
        default:
            return nil
    }
}
`;

        const file = [
            'package ccxtpro',
            'import (',
            '   "strings"',
            '   ccxt "github.com/ccxt/ccxt/go/v4"',
            ')',
            '',
            this.createGeneratedHeader().join('\n'),
            '',
            interfaceWs,
            '',
            functionDecl,
        ].join('\n');

        fs.writeFileSync (TYPED_WS_INTERFACE_FILE, formatGoSource (TYPED_WS_INTERFACE_FILE, file));
    }


    camelize(str: string) {
        var res =  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
          if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
          return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
        return res.replaceAll('-', '');
      }


    getGoExamplesWarning() {
        return [
            '',
            '    // !!Warning!! This example was automatically transpiled',
            '    // from the TS version, meaning that the code is overly',
            '    // complex and illegible compared to the code you would need to write',
            '    // normally. Use it only to get an idea of how things are done.',
            '    // Additionally always choose the typed version of the method instead of the generic one',
            '    // (e.g. CreateOrder (typed) instead of createOrder (generic)',
            ''
        ].join('\n');
    }

    transpileExamples () {
        return;
        // currently disabled!, the generated code is too complex and illegible
        const transpileFlagPhrase = '// AUTO-TRANSPILE //';

        // @ts-expect-error
        const allTsExamplesFiles = fs.readdirSync (EXAMPLES_INPUT_FOLDER).filter((f) => f.endsWith('.ts'));
        for (const filenameWithExtenstion of allTsExamplesFiles) {
            // @ts-expect-error
            const tsFile = path.join (EXAMPLES_INPUT_FOLDER, filenameWithExtenstion);
            let tsContent = fs.readFileSync (tsFile).toString ();
            if (tsContent.indexOf (transpileFlagPhrase) > -1) {
                const fileName = filenameWithExtenstion.replace ('.ts', '');
                log.magenta ('[GO] Transpiling example from', (tsFile as any).yellow);
                const go = this.transpiler.transpileGo(tsContent);

                const transpiledFixed = this.regexAll(
                    go.content,
                    [
                        [/object exchange/, 'Exchange exchange'],
                        [/async public Task example/gm, 'async public Task ' + this.camelize(fileName)],
                        [/(^\s+)object\s(\w+)\s=/gm, '$1var $2 ='],
                        [/^await.+$/gm, ''],
                    ]
                );

                const finalFile = [
                    'using ccxt;',
                    'using ccxt.pro;',
                    'namespace examples;',
                    // this.getGoExamplesWarning(),
                    'partial class Examples',
                    '{',
                    transpiledFixed,
                    '}',
                ].join('\n');
                // @ts-expect-error
                overwriteFileAndFolder (`${EXAMPLES_OUTPUT_FOLDER}/${fileName}.go`, finalFile);
            }
        }
    }

    async transpileWS(force = false, prediction = false) {
        // prediction WS methods now live in the REST prediction classes (no ts/src/prediction/pro)
        if (prediction && !fs.existsSync ('./ts/src/prediction/pro')) {
            return;
        }
        const tsFolder = prediction ? './ts/src/prediction/pro' : './ts/src/pro';

        let inputExchanges =  process.argv.slice (2).filter (x => !x.startsWith ('--'));
        if (inputExchanges === undefined) {
            inputExchanges = exchanges.ws;
        }
        if (prediction && (!inputExchanges || !inputExchanges.length)) {
            inputExchanges = predictionWsIds;
        }
        const wsFolder = prediction ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_WS_FOLDER;
        const options = { goFolder: wsFolder, exchanges:inputExchanges };
        // const options = { goFolder: EXCHANGES_WS_FOLDER, exchanges:['bitget'] }
        // base methods are always needed to populate the wrapper metadata (WRAPPER_METHODS)
        this.transpileBaseMethods(TS_BASE_FILE, true);
        this.isPrediction = prediction;
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(inputExchanges), true );
        this.isPrediction = false;
        if (prediction) {
            // the prediction ws package only emits the derived exchange classes,
            // it reuses the dynamic-instance / typed-interface plumbing of package ccxtpro
            log.bright.green ('Transpiled prediction ws exchanges successfully.');
            return;
        }
        this.createDynamicInstanceFile(true);
        this.transpileProTypes();
        this.createWsTypedInterfaceFile();

    }

    async transpileEverything (force = false, child = false, baseOnly = false, examplesOnly = false, prediction = false) {

        let exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
        const goFolder = prediction ? EXCHANGES_PREDICTION_FOLDER : EXCHANGES_FOLDER
            , tsFolder = prediction ? './ts/src/prediction' : './ts/src';

        if (!child) {
            createFolderRecursively (goFolder);
        }
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        if (prediction) {
            if (exchanges.length) {
                const predictionOnly = exchanges.filter ((x: string) => predictionIds.includes (x));
                if (!predictionOnly.length) {
                    // a scoped regular-exchange run (e.g. a --multi worker chunk) has no
                    // prediction work — ts/src/prediction/ has no files for those ids
                    return;
                }
            }
            // a single-exchange prediction transpile would truncate the shared
            // exchange_wrapper_structs.go to that one exchange — the namespace is
            // small, so always emit the full set
            exchanges = predictionIds;
        }
        const options = { goFolder, exchanges };

        this.transpileBaseMethods (TS_BASE_FILE); // now we always need the baseMethods info
        // the dynamic-instance / typed-interface files belong to package ccxt; the
        // prediction package reuses them and must not regenerate them
        if (!transpilingSingleExchange && !child && !prediction) {
            this.transpilePredictionBaseMethods ();
            this.createDynamicInstanceFile();
            this.createTypedInterfaceFile();
        } else if (prediction) {
            // capture-only: populate predictionBaseMethodsTypes (no ccxt-package file write)
            // so inherited unified methods emit prediction-typed wrappers in this process
            this.transpilePredictionBaseMethods (undefined, true);
        }

        if (!baseOnly && !examplesOnly) {
            this.isPrediction = prediction;
            await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(child || exchanges.length));
            this.isPrediction = false;
        }

        if (prediction) {
            // the prediction package needs its OWN DynamicallyCreateInstance (over
            // prediction ids); the base one in package ccxt only knows regular ids
            this.createDynamicInstanceFile (false, true);
            log.bright.green ('Transpiled prediction exchanges successfully.');
            return;
        }

        if (child) {
            return;
        }

        if (baseOnly) {
            return;
        }

        if (transpilingSingleExchange) {
            return;
        }

        // full builds also transpile the prediction-market exchanges (ts/src/prediction/)
        await this.transpileEverything (force, child, false, false, true);

        this.transpileTests();

        this.transpileErrorHierarchy ();

        log.bright.green ('Transpiled successfully.');
    }

    async webworkerTranspile (allFiles: any[], parserConfig: any) {

        // create worker
        const piscina = new Piscina({
            filename: resolve(__dirname, 'go-worker.js')
        });

        const chunkSize = 20;
        const promises: any = [];
        const now = Date.now();
        for (let i = 0; i < allFiles.length; i += chunkSize) {
            const chunk = allFiles.slice(i, i + chunkSize);
            promises.push(piscina.run({transpilerConfig:parserConfig, files:chunk}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms');
        const flatResult = workerResult.flat();
        return flatResult;
    }

    safeOptionsStructFile(ws: boolean = false) {
        if (this.isPrediction) {
            // the prediction packages reuse the option structs of package ccxt (the
            // wrapper files reference them with the ccxt. qualifier through
            // addPackagePrefix) — only the option structs of methods that do not
            // exist in package ccxt (e.g. FetchEvents) are emitted locally
            const ccxtNames = this.extractTypeAndFuncNames(EXCHANGES_FOLDER);
            const file = [
                ws ? `package ${PREDICTION_WS_PACKAGE}` : `package ${PREDICTION_PACKAGE}`,
                this.createGeneratedHeader().join('\n'),
                ''
            ];
            for (const key in goTypeOptions) {
                // emit param-renamed prediction overrides locally even though a same-named
                // struct exists in base (e.g. FetchTickersOptionsStruct with Outcomes)
                const isLocalOverride = predictionLocalOptionStructs.has(key);
                if (!isLocalOverride && (ccxtNames.has(key + 'Options') || ccxtNames.has(key + 'OptionsStruct'))) {
                    continue;
                }
                file.push(goTypeOptions[key]);
                file.push('');
            }
            const folder = ws ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_PREDICTION_FOLDER;
            fs.writeFileSync (`${folder}/exchange_wrapper_structs.go`, file.join('\n'));
            return;
        }
        const EXCHANGE_OPTIONS_FILE = ws
            ? './go/v4/pro/exchange_wrapper_structs.go'
            : './go/v4/exchange_wrapper_structs.go';

        const file = [
            ws ? 'package ccxtpro' : 'package ccxt',
            ws ? 'import ccxt "github.com/ccxt/ccxt/go/v4"' : '',
            this.createGeneratedHeader().join('\n'),
            ''
        ];
        // add simple Options
        if (!ws) {
            file.push('type Options struct {');
            file.push('    Params *map[string]any');
            file.push('}');
            file.push('');
        }

        for (const key in goTypeOptions) {
            const struct = goTypeOptions[key];
            file.push(struct);
            file.push('');
        }

        fs.writeFileSync (EXCHANGE_OPTIONS_FILE, formatGoSource (EXCHANGE_OPTIONS_FILE, file.join('\n')));
    }

    async transpileDerivedExchangeFiles (jsFolder: string, options: any, pattern = '.ts', force = false, child = false, ws: boolean | 'prediction' = false) {

        // todo normalize jsFolder and other arguments

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = [];
        try {
            ids = this.isPrediction ? (ws ? predictionWsIds : predictionIds) : (exchanges as any).ids;
        } catch (e) {
        }

        const regex = new RegExp (pattern.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'));

        // let exchanges
        if (options.exchanges && options.exchanges.length) {
            exchanges = options.exchanges.map ((x:string) => x + pattern);
        } else {
            exchanges = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.ts'))));
        }

        // Only process exchanges that are in transpiledExchanges
        // (the prediction exchanges have their own id list and skip this gate)
        if (!this.isPrediction) {
            exchanges = exchanges.filter (file => {
                const exchangeName = basename (file, pattern);
                return transpiledExchanges.includes (exchangeName);
            });
        }

        // exchanges = ['bitmart.ts']
        // transpile using webworker
        const allFilesPath = exchanges.map ((file: string) => `${jsFolder}/${file}` );
        // const transpiledFiles =  await this.webworkerTranspile(allFilesPath, this.getTranspilerConfig());
        log.blue('[go] Transpiling [', exchanges.join(', '), ']');
        const transpiledFiles =  allFilesPath.map((file: string) => this.transpiler.transpileGoByPath(file));

        let wrapperFolder = ws ? EXCHANGES_WS_FOLDER : EXCHANGE_WRAPPER_FOLDER;
        if (this.isPrediction) {
            wrapperFolder = ws ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_PREDICTION_FOLDER;
        }
        for (let i = 0; i < transpiledFiles.length; i++) {
            const transpiled = transpiledFiles[i];
            const exchangeName = exchanges[i].replace('.ts','');
            const path = `${wrapperFolder}/${exchangeName}_wrapper.go`;

            this.createGoWrappers(exchangeName, path, transpiled.methodsTypes, ws);
        }
        exchanges.map ((file: string, idx: number) => this.transpileDerivedExchangeFile (jsFolder, file, options, transpiledFiles[idx], force, ws));
        // prediction packages always need their own option-structs file even with a single exchange
        if (exchanges.length > 1 || this.isPrediction) {
            this.safeOptionsStructFile(ws);
        }
        const classes = {};

        return classes;
    }

    /**
     * Extracts type names and global function names from all files in a directory
     * @param dirPath - The path to the directory to extract type and function names from.
     * @returns A set of type and function names with braces.
     */
    extractTypeAndFuncNames(dirPath: string): Set<string> {
        if (this._typeAndFuncNamesCache[dirPath]) {
            return this._typeAndFuncNamesCache[dirPath];
        }
        const results = new Set<string>([
            'Precise',
            'DECIMAL_PLACES',
            'SIGNIFICANT_DIGITS',
            'TICK_SIZE',
            'NO_PADDING',
            'PAD_WITH_ZERO',
            'TRUNCATE',
            'ROUND',
            'ROUND_UP',
            'ROUND_DOWN',
            'toFixed',
            'throwDynamicException',
            'NewArrayCache',
            'NewArrayCacheByTimestamp',
            'NewArrayCacheBySymbolById',
            'NewArrayCacheBySymbolBySide'
        ]);

        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            if (file.startsWith('exchange')) {
                const fullPath = path.join(dirPath, file);

                // Skip directories or non-files
                const stat = fs.statSync(fullPath);
                if (!stat.isFile()) continue;

                const content = fs.readFileSync(fullPath, "utf-8");
                const lines = content.split("\n");

                for (const line of lines) {
                    // Only match lines that start with type or func
                    if (!(
                        /^\s*func\s+/.test(line) ||
                        /^\s*type\s+\w+\s+(?:struct\s*\{|interface\s*\{|func\s*\()/.test(line)
                    )) continue;

                    const trimmed = line.trim();

                    // Exclude lines that are just "type" or "func"
                    if (/^(type|func)$/.test(trimmed)) continue;

                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 2) continue;

                    let name = parts[1].split("(")[0]; // keep only before `(`
                    if (name.trim() !== "") results.add(name);
                }
            }
        }
        results.delete("Exception");
        this._typeAndFuncNamesCache[dirPath] = results;
        return results;
    }

    /**
     * Adds the package to prefix all methods and types, e.g. MarketInterface -> ccxt.MarketInterface
     * @param content The exchange file as a string
     * @param packageName The package name to add.
     * @returns The content with the package prefix added.
     */
    addPackagePrefix(content: string, methodsAndTypes: Set<string>, packageName: string = 'ccxt') {
        const pattern = Array.from(methodsAndTypes).join("|");
        // any of the method or type names that are not preceded by a `.`, but `...` is allowed e.g. MarketInterface, or ...MarketInterface but not .MarketInterface
        const regex = new RegExp(`(?<![A-Za-z0-9_\\)\\}]\\.)\\b(${pattern})\\b`, "g");
        const variadicRegex = new RegExp(`(?<=\\.\\.\\.)(${pattern})\\b`, "g");
        // qualify type/func names only OUTSIDE string literals — a ccxt type name that appears
        // inside a "..." or `...` literal is data (e.g. an EIP-712 type string or map key) and
        // must not be rewritten to ccxt.Type
        const qualifyOutsideStrings = (text: string): string => {
            const segments = text.split(/("(?:[^"\\]|\\.)*"|`[^`]*`)/g);
            let result = '';
            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                if ((seg.length > 0) && ((seg[0] === '"') || (seg[0] === '`'))) {
                    result += seg;
                } else {
                    result += seg.replace(regex, (match) => `${packageName}.${capitalize(match)}`).replace(variadicRegex, (match) => `${packageName}.${capitalize(match)}`);
                }
            }
            return result;
        };
        return content
            .split("\n")
            .map(line => {
                if (/^\s*(func|type)\b/.test(line)) {
                    // For func/type lines, only process the part after the declaration
                    const declarationMatch = line.match(/^(func(?: \(\w+ \*?\w+\))? \w+)\s*(\(.*)/);
                    if (declarationMatch) {
                        const declaration = declarationMatch[1];
                        const decMatch = declaration + qualifyOutsideStrings(declarationMatch[2]);
                        return decMatch
                    }
                    return line;
                }
                return qualifyOutsideStrings(line);
            })
            .join("\n");
    }

    createGoExchange(className: string, goVersion: any, ws: boolean | 'prediction' = false) {
        const isPrediction = (ws === 'prediction');
        const isWs = (ws === true);
        const goImports = this.getGoImports(goVersion, isWs, isPrediction).join("\n") + "\n\n";
        let content = goVersion.content;
        const exchangeName = className;

        className = capitalize(className + 'Core');

        const classExtends = /type\s\w+\sstruct\s{\s*(\w+)/;
        const matches = content.match(classExtends);
        const baseClass = matches ? matches[1].replace('Rest', '') : '';
        let isExtended = this.isExtendedExchange(exchangeName);
        const isAlias = this.isAlias (exchangeName);

        // A non-async method declared to return a Promise (e.g. `watchTrades (symbol): Promise<Trade[]> {
        // return this.watchTradesForSymbols([symbol], ...) }`) is transpiled with a Go return type of
        // `any` — the ast-transpiler only channel-wraps `async` methods. But its body returns a channel
        // and the typed wrapper reads it with `<-`, so coerce the declared return type to `<-chan any`.
        // Target methods by name from the parsed metadata (the same async||Promise signal the wrapper
        // side uses) so only Promise-returning methods are touched, never the many sync helpers.
        const promiseMethods = (goVersion.methodsTypes || []).filter ((m: any) => !m.async && (typeof m.returnType === 'string') && m.returnType.startsWith ('Promise'));
        for (let mi = 0; mi < promiseMethods.length; mi++) {
            const capName = capitalize (promiseMethods[mi].name);
            const coerceRegex = new RegExp ('(func\\s+\\(this\\s+\\*\\w+\\)\\s+' + capName + '\\([^)]*\\))\\s+any(\\s+\\{)', 'g');
            content = content.replace (coerceRegex, '$1 <-chan any$2');
        }

        if (!isWs) {
            content = this.regexAll(content, [
                [/base\.(\w+)\(/gm, "this.Exchange.$1("],
                [/base\.Describe/gm, "this.Exchange.Describe"],
                [/"\0"/gm, '"\/\/\" + "0"'], // check this later in bl3p
                [/var (precise|preciseAmount) any = /gm, "$1 := "],
                [/binaryMessage.ByteLength/gm, 'GetValue(binaryMessage, "byteLength")'], // idex tmp fix
                [/ToString\((precise\w*)\)/gm, "$1.ToString()"],
                [/<\-callDynamically/gm, '<-this.CallDynamically'],
                [/toFixed/gm, 'ToFixed'],
                [/throwDynamicException/gm, 'ThrowDynamicException'],
                // for-loops initialized from a transpiled (any-typed) variable need a
                // numeric loop counter, e.g. `for i := startIndex;` -> `for i := int(ParseInt(startIndex));`
                [/for (\w+) := ([a-zA-Z_]\w*); /g, 'for $1 := int(ParseInt($2)); '],
            ]);
            if (this.isPrediction) {
                // prediction cores embed PredictionExchange (which embeds BaseExchange) instead
                // of Exchange directly, so they inherit the prediction methods + state
                content = content.replace(/(type \w+ struct \{\s*\n\s*)Exchange\b/, '$1PredictionExchange');
                // the shared `base.` fixup rewrote base-method calls to `this.Exchange.`, but a
                // prediction core reaches the embedded base as `this.BaseExchange.`
                content = content.replace(/\bthis\.Exchange\./g, 'this.BaseExchange.');
                // prediction exchanges merge REST + WS in one class, so apply the WS transforms
                // (orderbook/side casts, client/future resolve, append, limit, ...) here too
                content = this.regexAll (content, this.getWsRegexes());
                // the prediction exchanges live outside of package ccxt, so all the
                // package-level types/functions of go/v4 need the ccxt. qualifier
                // (this also rewrites the embedded struct member into ccxt.PredictionExchange)
                content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
                // inherited prediction helpers (outcome, shortenSlug, checkEventsAndMarkets, ...)
                // reach the derived exchange via callDynamically. The shared `<-callDynamically`
                // fixup only covers awaited calls; non-awaited/sync ones stay bare and would be
                // undefined in package ccxtprediction. Route them through the exported
                // channel-based dispatcher — CallInternalMethod forwards both plain and channel
                // returns, so the `<-` receive is always valid.
                content = this.regexAll (content, [
                    [/callDynamically\(/gm, '<-this.CallDynamically('],
                ]);
            }
        } else {
            const restPackagePrefix = this.isPrediction ? `${PREDICTION_PACKAGE}.` : 'ccxt.';
            const inheritedClass = isAlias ? `${baseClass}` : `${restPackagePrefix}${className}`;
            const inheritedInstatiation = isAlias ? `New${baseClass}()` : `&${inheritedClass}{}`;
            const wsRegexes = this.getWsRegexes();
            content = this.regexAll (content, [
                [ /type (\w+) struct \{\s+(\w+)\s*\n\s*/g, `type $1 struct {\n\t*${inheritedClass}\n\tbase *${inheritedClass}\n` ],      // adds 'base exchangeName'
                [ /(p \:\= &.*$)/gm, `$1\n\tbase := ${inheritedInstatiation}\n\tp.base = base\n\tp.${baseClass} = base` ],  // could go in ast-transpiler if there is always a parameter named base
                ...wsRegexes,
            ]);
            content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
        }


        if (isExtended) {
            content = content.replace(/this.Exchange.Describe/gm, `this.${baseClass}.Describe`);
        }

        // prediction cores embed BaseExchange directly (independent of the concrete Exchange)
        const baseField = this.isPrediction ? 'BaseExchange' : 'Exchange';
        const exchangeStructName = this.isPrediction ? 'ccxt.BaseExchange' : (ws ? 'ccxt.Exchange' : 'Exchange');
        let initMethod = '';
        if (!isAlias && !isWs) {
            initMethod = `
func (this *${className}) Init(userConfig map[string]any) {
    this.${baseField} = ${exchangeStructName}{}
    this.${baseField}.DerivedExchange = this
    this.${baseField}.InitParent(userConfig, this.Describe().(map[string]any), this)
}\n`;
        } else {
            initMethod = `
func (this *${className}) Init(userConfig map[string]any) {
    this.${isWs ? 'base' : `${capitalize(baseClass)}`}.Init(this.DeepExtend(this.Describe(), userConfig))
    this.Itf = this
    this.Exchange.DerivedExchange = this
}\n`;
        }

        content = this.createGeneratedHeader().join('\n') + '\n' + content + '\n' +  initMethod;
        if (isPrediction) {
            // qualify everything that lives in the base ccxt package (types, helpers,
            // error constructors, the embedded Exchange struct itself, ...)
            content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
        }
        return goImports + content;
    }

    transpileDerivedExchangeFile (tsFolder: string, filename: string, options: any, goResult: any, force = false, ws: boolean | 'prediction' = false) {

        const tsPath = `${tsFolder}/${filename}`;

        let { goFolder } = options;

        const extensionlessName = filename.replace ('.ts', '');
        const goFilename = filename.replace ('.ts', '.go');

        const tsMtime = fs.statSync (tsPath).mtime.getTime ();

        const go  = this.createGoExchange (extensionlessName, goResult, ws);

        if (goFolder) {
            overwriteFileAndFolder (`${goFolder}/${goFilename}`, go);
            // fs.utimesSync (`${goFolder}/${goFilename}`, new Date (), new Date (tsMtime))
        }
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsOrderbookTestsToGo (outDir: string) {

        const jsFile = './ts/src/pro/test/base/test.orderBook.ts';
        const goFile = `${outDir}/cache/orderbook.go`;

        log.magenta ('Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        const splitParts = content.split('// --------------------------------------------------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// --------------------------------------------------------------------------------------------------------------------\n');
        content = this.regexAll (content, [
            [/var (\w+) any = GetValue\((\w+), "bids"\)/gm, '$1 := $2.Bids'],
            [/var (\w+) any = GetValue\((\w+), "asks"\)/gm, '$1 := $2.Asks'],
            [/assert/g, 'Assert'],
        ]).trim ();

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => line).join ('\n');

        const file = [
            'package cache',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIdented,
        ].join('\n');

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsCacheTestsToGo (outDir: string) {

        const jsFile = './ts/src/pro/test/base/test.cache.ts';
        const goFile = `${outDir}/cache/cache.go`;

        log.magenta ('Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        const splitParts = content.split('// ----------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// ----------------------------------------------------------------------------\n');
        content = this.regexAll (content, [
            [/assert/g, 'Assert'],
            [/GetValue\(cacheSymbolSide4/g, 'GetValue(cacheSymbolSide4.ToArray()' ],
            [/GetArrayLength\(cacheSymbolSide4\)/g  , 'GetArrayLength(cacheSymbolSide4.ToArray())'],
        ]).trim ();

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line =>  line).join ('\n');

        const file = [
            'package cache',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIdented,
        ].join('\n');

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    // ---------------------------------------------------------------------------------------------

    transpileCryptoTestsToGo (outDir: string) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const goFile = `${outDir}/test.cryptography.go`;

        log.magenta ('[go] Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        content = this.regexAll (content, [
            [ /Newccxt.Exchange.+\n.+\n.+/gm, 'ccxt.Exchange{}' ],
            [ /func Equals\(.+\n.*\n.*\n.*}/gm, '' ], // remove equals
        ]).trim ();

        const file = [
            'package base',
            this.createGeneratedHeader().join('\n'),
            content,
        ].join('\n');

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    transpileExchangeTest(name: string, path: string): [string, string] {
        const go = this.transpiler.transpileGoByPath(path);
        let content = go.content;

        const parsedName = name.replace('.ts', '');
        const parsedParts = parsedName.split('.');
        const finalName = parsedParts[0] + capitalize(parsedParts[1]);

        content = this.regexAll (content, [
            [/assert/g, 'Assert'],
            [/object exchange/g, 'Exchange exchange'],
            [/function test/g, finalName],
        ]).trim ();

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '    ' + line).join ('\n');

        const file = [
            'using ccxt;',
            'namespace Tests;',
            'using System;',
            'using System.Collections.Generic;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n');
        return [finalName, file];
    }

    // async transpileExchangeTestsToGo() {
    //     const inputDir = './ts/src/test/exchange';
    //     const outDir = GENERATED_TESTS_FOLDER;
    //     const ignore = [
    //         // 'exportTests.ts',
    //         // 'test.fetchLedger.ts',
    //         'test.throttler.ts',
    //         // 'test.fetchOrderBooks.ts', // uses spread operator
    //     ];

    //     const inputFiles = fs.readdirSync('./ts/src/test/exchange');
    //     const files = inputFiles.filter(file => file.match(/\.ts$/)).filter(file => !ignore.includes(file) );
    //     const transpiledFiles = files.map(file => this.transpileExchangeTest(file, `${inputDir}/${file}`));
    //     await Promise.all (transpiledFiles.map ((file, idx) => writeFile (`${outDir}/${file[0]}.go`, file[1])));
    // }

    transpileBaseTestsToGo () {
        const outDir = BASE_TESTS_FOLDER;
        this.transpileBaseTests(outDir);
        this.transpileCryptoTestsToGo(outDir);
        this.transpileWsOrderbookTestsToGo(outDir);
        this.transpileWsCacheTestsToGo(outDir);
    }

    transpileBaseTests (outDir: string) {

        const baseFolders = {
            ts: './ts/src/test/base',
        };

        let baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        for (const testName of baseFunctionTests) {
            const tsFile = `${baseFolders.ts}/${testName}.ts`;
            const tsContent = fs.readFileSync(tsFile).toString();
            if (tsContent.includes ('// NO_AUTO_TRANSPILE')) {
                continue;
            }

            // const goFileName = capitalize(testName.replace ('test.', ''));
            const goFile = `${outDir}/${testName}.go`;

            log.magenta ('Transpiling from', (tsFile as any).yellow);

            const go = this.transpiler.transpileGoByPath(tsFile);
            let content = go.content;
            content = this.regexAll (content, [
                [/(\w+) := NewCcxt\.Exchange\(([\S\s]+?)\)/gm, '$1 := ccxt.NewExchange().(*ccxt.Exchange); $1.DerivedExchange = $1; $1.InitParent($2, map[string]any{}, $1)' ],
                // instantiate the core type (channel-based methods, implements ICoreExchange) and let
                // Init wire up DerivedExchange/InitParent (Exchange above is the only special case)
                [/(\w+) := NewCcxt\.(\w+)\(([\S\s]+?)\)/gm, '$1 := ccxt.New$2Core(); $1.Init($3)' ],
                [/exchange any, /g,'exchange *ccxt.Exchange, '], // in arguments
                [/ any(?= \= map\[string\]any )/g, ' map[string]any'], // fix incorrect variable type
                [ /any\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
                [/Precise\.String/gm, 'ccxt.Precise.String'],
                [ /testSharedMethods\./gm, '' ], // no need of class reference
                [ /func Equals\(.+\n.*\n.*\n.*\}/gm, '' ], // remove equals
                [ /\@SKIP_START_GO[\s\S]*?\@SKIP_END_GO/gm, '' ],
                // Match ArrayCache variables and cast to appropriate type based on variable name
                // Order matters: check most specific types first
                [/(\w*ArrayCacheBySymbolBySide\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCacheBySymbolBySide).Hashmap'],
                [/(\w*ArrayCacheByTimestamp\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCacheByTimestamp).Hashmap'],
                [/(\w*ArrayCacheBySymbolById\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCacheBySymbolById).Hashmap'],
                // General ArrayCache pattern (must not match the specific types above)
                [/(\w+ArrayCache(?!BySymbolBySide|ByTimestamp|BySymbolById)\w*)\.Hashmap/g, '$1.(*ccxt.ArrayCache).Hashmap'],
                // Match stored/cached/orders patterns - explicit patterns for common variable names
                [/\bstored\.Hashmap/g, 'stored.(*ccxt.ArrayCache).Hashmap'],
                [/\bcached\.Hashmap/g, 'cached.(*ccxt.ArrayCache).Hashmap'],
                [/\b([Oo]rders)\.Hashmap/g, '$1.(*ccxt.ArrayCache).Hashmap'],

            ]).trim ();

            if (testName !== 'tests.init') {
                // Add package prefix to functions and types from the ccxt package
                content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
            }

            const file = [
                'package base',
                testName.indexOf('tests.init') === -1 ? 'import ccxt "github.com/ccxt/ccxt/go/v4"' : '',
                '',
                this.createGeneratedHeader().join('\n'),
                content,
            ].join('\n');

            log.magenta ('→', (goFile as any).yellow);

            goTests.push(capitalize(testName));
            overwriteFileAndFolder (goFile, file);
        }
    }

    transpileMainTest(files: any) {
        log.magenta ('[go] Transpiling from', files.tsFile.yellow);
        let ts = fs.readFileSync (files.tsFile).toString ();

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
        ]);

        const mainContent = ts;
        const go = this.transpiler.transpileGo(mainContent);
        let contentIndentend = go.content;

        // ad-hoc fixes
        contentIndentend = this.regexAll (contentIndentend, [
            [/var (mockedExchange|exchange) any =/g, 'var $1 ccxt.ICoreExchange ='],
            [/exchange any([,)])/g, 'exchange ccxt.ICoreExchange$1'],
            // these 62 symbol-based methods are trimmed from ICoreExchange (so prediction cores satisfy
            // it), so call sites in the harness type-assert to the per-method interface (ccxt.I<Method>)
            // for exactly the method called. A prediction venue that overrides only some of these runs
            // the has-gated test for the ones it has, and each single-method assertion succeeds.
            [/exchange\.(FetchL2OrderBook|FetchPositions|FetchTickers|FetchOpenOrders|EditOrder|FetchOrder|CancelOrderWithClientOrderId|CancelOrdersWithClientOrderIds|EditOrderWithClientOrderId|FetchOrderWithClientOrderId|FetchBidsAsks|WatchBidsAsks|WatchOrderBookForSymbols|WatchPosition|WatchTradesForSymbols)\(/g, 'exchange.(ccxt.I$1).$1('],
            [/exchange.(\w+)\s*=\s*(.+)/g, 'exchange.Set$1($2)'],
            [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
            [/InitOfflineExchange\(exchangeName any\) any  {/g, 'InitOfflineExchange(exchangeName any) ccxt.ICoreExchange {'],
            [/assert\(/g, 'Assert('],
            [/OnlySpecificTests \[\]any/g, 'OnlySpecificTests any '],
            [ /any\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
        ]);

        const file = [
            'package base',
            'import ccxt "github.com/ccxt/ccxt/go/v4"',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n');

        overwriteFileAndFolder (files.goFile, file);
    }

    transpileExchangeTests(){
        // remove above later debug only
        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'goFile': BASE_TESTS_FILE,
        });
        const baseFolders = {
            ts: './ts/src/test/Exchange',
            tsBase: './ts/src/test/Exchange/base',
            goBase: './go/tests/base',
            go: './go/tests/base',
        };

        let baseTests = fs.readdirSync (baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        let exchangeTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter (filename => filename !== 'test.throttle');
        exchangeTests = exchangeTests.filter (filename => filename !== 'test.proxies' &&  filename !== 'test.fetchLastPrices' && filename !== 'test.createOrder');

        const tests: any[] = [] as any;
        baseTests.forEach (baseTest => {
            tests.push({
                base: true,
                name:baseTest,
                tsFile: `${baseFolders.tsBase}/${baseTest}.ts`,
                goFile: `${baseFolders.goBase}/${baseTest}.go`,
            });
        });
        exchangeTests.forEach (test => {
            tests.push({
                base: false,
                name: test,
                tsFile: `${baseFolders.ts}/${test}.ts`,
                goFile: `${baseFolders.go}/${test}.go`,
            });
        });

        const testNames = tests.map (test => test.name);
        testNames.forEach (test => goTests.push(test));
        this.transpileAndSaveGoExchangeTests (tests);
    }

    transpileWsExchangeTests(){

        const baseFolders = {
            ts: `./ts/src/pro/test/Exchange`,
            go: `${GENERATED_TESTS_FOLDER}/base`,
        };

        const wsTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        const tests = [] as any;

        wsTests.forEach (test => {
            tests.push({
                name: test,
                tsFile: `${baseFolders.ts}/${test}.ts`,
                goFile: `${baseFolders.go}/${test}.go`,
            });
            goWsTests.push(test)
        });

        this.transpileAndSaveGoExchangeTests (tests, true);
    }

    async transpileAndSaveGoExchangeTests(tests: any[], isWs = false) {
        let paths = tests.map(test => test.tsFile);
        // paths = [paths[30]];
        const flatResult = await this.webworkerTranspile (paths,  this.getTranspilerConfig());
        flatResult.forEach((file, idx) => {
            let contentIndentend = file.content.split('\n').map((line: string) => line ? '    ' + line : line).join('\n');

            let regexes = [
                [/exchange := (?:&)?ccxt\.Exchange\{\}/g, 'exchange := ccxt.NewExchange()'],
                [/exchange := (?:&)?ccxt\.Coinbase\{\}/g, 'exchange := ccxt.NewCoinbase()'],
                [/exchange any([,)])/g, 'exchange ccxt.ICoreExchange$1'],
                // 62 symbol-based methods trimmed from ICoreExchange → assert to the per-method interface
                // (ccxt.I<Method>) for exactly the method called, so a prediction venue that overrides
                // only some of them satisfies each has-gated per-method assertion it actually runs.
                [/exchange\.(FetchL2OrderBook|FetchPositions|FetchTickers|FetchOpenOrders|EditOrder|FetchOrder|CancelOrderWithClientOrderId|CancelOrdersWithClientOrderIds|EditOrderWithClientOrderId|FetchOrderWithClientOrderId|FetchBidsAsks|WatchBidsAsks|WatchOrderBookForSymbols|WatchPosition|WatchTradesForSymbols)\(/g, 'exchange.(ccxt.I$1).$1('],
                [/testSharedMethods\./g, ''], // no need of class reference
                [/assert/gm, 'Assert'],
                [/exchange.(\w+)\s*=\s*(.+)/g, 'exchange.Set$1($2)'],
                [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
                [/Precise\./gm, 'ccxt.Precise.'],
                [/Spawn\(createOrderAfterDelay/g, 'Spawn(CreateOrderAfterDelay'],
                [/(<-exchange.Watch\w+\(.+\))/g, 'UnWrapType($1)'],
                // [/<-exchange.WatchOrderBook\(symbol\)/g, '(ToOrderBook(<-exchange.WatchOrderBook(symbol)))'], // orderbook watch
                // [/<-exchange.WatchOrderBookForSymbols\((.*?)\)/g, '(ToOrderBook(<-exchange.WatchOrderBookForSymbols($1)))'],
                [/(any\sfunc\sEquals.+\n.*\n.+\n.+|func Equals\(.+\n.*\n.*\n.*\})/gm, ''], // remove equals
                // Fix infinite loop bug in WebSocket tests - move now = exchange.Milliseconds() outside success check
                [/(\s+)(if IsTrue\(IsEqual\(success, true\)\) \{\s*\n[\s\S]*?)(\s+now = exchange\.Milliseconds\(\)\s*\n\s*\})/gm, '$1$2$1now = exchange.Milliseconds()$3'],
                // apply 'getPreTranspilationRegexes' here, bcz in GO we don't have pre-transpilation regexes
                [/exchange.JsonStringifyWithNull/g, 'JsonStringify'],
                


                // [ /object exchange(?=[,)])/g, 'Exchange exchange' ],
                // [ /throw new Error/g, 'throw new Exception' ],
                // [/testSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                // [ /void function/g, 'void'],
            ];

            // if (isWs) {
            //     // add ws-tests specific regeces
            //     regexes = regexes.concat([
            //         [/await exchange.watchOrderBook\(symbol\)/g, '((IOrderBook)(await exchange.watchOrderBook(symbol))).Copy()'],
            //         [/await exchange.watchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.watchOrderBookForSymbols($1))).Copy()'],
            //     ]);
            // }

            contentIndentend = this.regexAll (contentIndentend, regexes);
            const namespace = 'package base';
            let imports = 'import "github.com/ccxt/ccxt/go/v4"';
            const fmtImport = contentIndentend.indexOf('fmt.Println') > -1 ? 'import "fmt"' : '';
            imports = [imports, fmtImport].filter(x => x).join('\n');
            const fileHeaders = [
                namespace,
                imports,
                '',
                this.createGeneratedHeader().join('\n'),
                '',
            ];
            let go: string;
            const filename = tests[idx].name;
            if (filename === 'test.sharedMethods') {
                // const doubleIndented = contentIndentend.split('\n').map(line => line ? '    ' + line : line).join('\n');
                go = [
                    ...fileHeaders,
                    contentIndentend,
                ].join('\n');
            } else {
                contentIndentend = this.regexAll (contentIndentend, [
                    // [ /public void/g, 'public static void' ], // make tests static
                    // [ /async public Task/g, 'async static public Task' ], // make tests static
                ])
                go = [
                    ...fileHeaders,
                    contentIndentend,
                ].join('\n');
            }
            overwriteFileAndFolder (tests[idx].goFile, go);
        });
    }

    transpileTests(){
        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }
        this.transpileBaseTestsToGo();
        this.transpileExchangeTests();
        this.transpileWsExchangeTests();
        this.createFunctionsMapFile();
    }

    createFunctionsMapFile() {
        // const normalizedTestNames = goTests.map(test => 'Test' + capitalize(test.replace('Test.', '').replace('test.', '')) );
        const normalizedTestNames: string[] = [];
        const normalizedFunctionNames: string[] = [];

        //ws
        const normalizedWsTestNames: string[] = [];
        const normalizedWsFunctionNames: string[] = [];
        for (let test of goTests) {
            const skipTests = [
                "test.sharedMethods",
                "Tests.init",
            ];
            if (skipTests.includes(test)) {
                continue;
            }
            if (test === 'test.ohlcv') {
                test = 'test.OHLCV';
            }
            const methodName = test.replace('Test.', '').replace('test.', '');
            normalizedFunctionNames.push(methodName);
            test = 'Test' + capitalize(methodName);
            normalizedTestNames.push(test);
        }

        for (let test of goWsTests) {
            const skipTests: any = [];
            if (skipTests.includes(test)) {
                continue;
            }
            if (test === 'test.ohlcv') {
                test = 'test.OHLCV';
            }
            const methodName = test.replace('Test.', '').replace('test.', '');
            normalizedWsFunctionNames.push(methodName);
            test = 'Test' + capitalize(methodName);
            normalizedWsTestNames.push(test);
        }

        const file = [
            'package base',
            '',
            this.createGeneratedHeader().join('\n'),
            '',
            'var FunctionsMap = map[string]any{',
            ...normalizedTestNames.map((test,i) => `    "${normalizedFunctionNames[i]}": ${test},`),
            '}',
            '',
            'var WsFunctionsMap = map[string]any{',
            ...normalizedWsTestNames.map((test,i) => `    "${normalizedWsFunctionNames[i]}": ${test},`),
            '}',
        ].join('\n');
        overwriteFileAndFolder (`${BASE_TESTS_FOLDER}/test.functions.go`, file);
    }

    transpileProTypes() {
        const GO_TYPES_FILE = "./go/v4/exchange_types.go";
        const GO_TYPES_FILE_PRO = "./go/v4/pro/exchange_types.go";

        const output: string[] = [
            'package ccxtpro',
            'import ccxt "github.com/ccxt/ccxt/go/v4"',
            '',
            ...this.createGeneratedHeader(),
            '',
        ];
        const file = fs.readFileSync(GO_TYPES_FILE, "utf8");
        const lines = file.split(/\r?\n/);

        const structRegex = /^type\s+(\w+)\s+struct\s*{/;
    
        for (const line of lines) {
            const structMatch = line.match(structRegex);

            if (structMatch) {
                output.push(`type ${structMatch[1]} = ccxt.${structMatch[1]}`);
                continue;
            }
        }

        fs.writeFileSync(GO_TYPES_FILE_PRO, formatGoSource(GO_TYPES_FILE_PRO, output.join("\n") + "\n"), "utf8");
    }
    
}

if (isMainEntry(import.meta.url)) {
    const ws = process.argv.includes ('--ws');
    // bare prediction-only ids (e.g. `goTranspiler.ts kalshi`) auto-route to the
    // prediction namespace so scoped CI steps don't need to know it
    const cliExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
    const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every (x => predictionIds.includes (x) && !exchangeIds.includes (x));
    const prediction = process.argv.includes ('--prediction') || allArePredictionOnly;
    const baseOnly = process.argv.includes ('--baseTests');
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests');
    const examples = process.argv.includes ('--examples');
    const force = process.argv.includes ('--force');
    const child = process.argv.includes ('--child');
    const baseClassOnly = process.argv.includes ('--baseClass')
    const exchange = process.argv.includes ('--exchange');
    if (exchange) {
        transpiledExchanges = [ exchange ];
    }
    if (prediction) {
        transpiledExchanges = predictionIds;
    }
    const multiprocess = process.argv.includes ('--multiprocess') || process.argv.includes ('--multi');
    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true;
    if (!child && !multiprocess) {
        log.bright.green ({ force });
    }
    const inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
    const transpiler = new NewTranspiler (ws);
    if (baseClassOnly) {
        transpiler.transpileBaseMethods (TS_BASE_FILE)
        transpiler.transpilePredictionBaseMethods ()
    } else if (ws) {
        if (prediction) {
            await transpiler.transpileWS (force, true);
        } else {
            await transpiler.transpileWS (force);
            if (!inputExchanges.length) {
                // full ws builds also transpile the prediction ws exchanges
                await transpiler.transpileWS (force, true);
            }
        }
    } else if (test) {
        transpiler.transpileTests ();
    } else if (multiprocess) {
        await parallelizeTranspiling (exchangeIds);
        // the prediction exchanges are few — transpile them serially after the workers finish
        await transpiler.transpileEverything (force, false, false, false, true);
    } else {
        await transpiler.transpileEverything (force, child, baseOnly, examples, prediction);
    }
}
