import Transpiler from "ast-transpiler";
import path from 'path'
import errors from "../js/src/base/errors.js"
import { basename, join, resolve } from 'path'
import { createFolderRecursively, replaceInFile, overwriteFile, checkCreateFolder } from './fsLocal.js'
import { setupCsharpPrinter } from './csharp-worker.js'
import { writeOverloadStrippedFile, removeOverloadStrippedFile, restoreParamsBagInitializers } from './stripOverloads.js'
import { platform } from 'process'
import os from 'os'
import fs from 'fs'
import log from 'ololog'
import ansi from 'ansicolor'
import {Transpiler as OldTranspiler } from "./transpile.js";
import { writeFile } from 'fs/promises';
import errorHierarchy from '../js/src/base/errorHierarchy.js'
import Piscina from 'piscina';
import { isMainEntry } from "./transpile.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { unCamelCase } from "../js/src/base/functions.js";

ansi.nice

type dict = { [key: string]: string }

let exchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
const exchangeIds: string[] = exchanges.ids
const predictionIds: string[] = exchanges.prediction || []
const predictionWsIds: string[] = exchanges.predictionWs || []

// @ts-expect-error
const metaUrl = import.meta.url
let __dirname = new URL('.', metaUrl).pathname;

let shouldTranspileTests = true

function overwriteFileAndFolder (path: string, content: string) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder (path);
    }
    // overwriteFile() already opens+truncates+writes the file; the extra
    // fs.writeFileSync below wrote every generated file a second time
    // (~50 MB of redundant I/O per full build)
    overwriteFile (path, content);
}

// this is necessary because for some reason
// pathname keeps the first '/' for windows paths
// making them invalid
// example: /C:Users/user/Desktop/
if (platform === 'win32') {
    if (__dirname[0] === '/') {
        __dirname = __dirname.substring(1)
    }
}

// core methods whose `Task<object>` return is rewritten to a typed `Task<T>` / `Task<List<T>>`,
// moving the `new T(item)` conversion out of the PascalCase wrapper and onto the core return path.
// only methods whose every intra-core call site is a plain `return await this.X(...);` from a core
// of the same typed shape are listed — anything feeding an untyped helper or reflective pagination
// (fetchPaginatedCall*, callDynamically) stays object, since there is no reverse From helper.
const TYPED_CORES: Record<string, string> = {
    'cancelAllContractOrders': 'List<Order>',
    'cancelAllOrders': 'List<Order>',
    'cancelAllOrdersAfter': 'Dictionary<string, object>',
    'cancelAllOrdersWs': 'List<Order>',
    'cancelAllSpotOrders': 'List<Order>',
    'cancelAllUtaOrders': 'List<Order>',
    'cancelContractOrder': 'Order',
    'cancelOrder': 'Order',
    'cancelOrderWithClientOrderId': 'Order',
    'cancelOrderWs': 'Order',
    // okx#cancelOrders omits request-only keys (clientOrderId[], trigger, …) before parseOrders
    'cancelOrders': 'List<Order>',
    'cancelOrdersForSymbols': 'List<Order>',
    'cancelOrdersWithClientOrderIds': 'List<Order>',
    'cancelOrdersWs': 'List<Order>',
    'cancelSpotOrder': 'Order',
    'cancelTwapOrder': 'Order',
    'cancelUnifiedOrder': 'Order',
    'cancelUtaOrder': 'Order',
    'cancelUtaOrders': 'List<Order>',
    'createAmmOrder': 'PredictionOrder',
    'createContractOrder': 'Order',
    'createContractOrders': 'List<Order>',
    'createConvertTrade': 'Conversion',
    'createDepositAddress': 'DepositAddress',
    'createLimitBuyOrder': 'Order',
    'createLimitBuyOrderWs': 'Order',
    'createLimitOrder': 'Order',
    'createLimitOrderWs': 'Order',
    'createLimitSellOrder': 'Order',
    'createLimitSellOrderWs': 'Order',
    'createMarketBuyOrder': 'Order',
    'createMarketBuyOrderWithCost': 'Order',
    'createMarketBuyOrderWs': 'Order',
    'createMarketOrder': 'Order',
    'createMarketOrderWithCost': 'Order',
    'createMarketOrderWithCostWs': 'Order',
    'createMarketOrderWs': 'Order',
    'createMarketSellOrder': 'Order',
    'createMarketSellOrderWithCost': 'Order',
    'createMarketSellOrderWs': 'Order',
    'createOrder': 'Order',
    'createOrderWithTakeProfitAndStopLoss': 'Order',
    'createOrderWithTakeProfitAndStopLossWs': 'Order',
    'createOrderWs': 'Order',
    'createOrderbookOrder': 'PredictionOrder',
    'createOrders': 'List<Order>',
    'createOrdersWs': 'List<Order>',
    'createPostOnlyOrder': 'Order',
    'createPostOnlyOrderWs': 'Order',
    'createReduceOnlyOrder': 'Order',
    'createReduceOnlyOrderWs': 'Order',
    'createSubAccount': 'Dictionary<string, object>',
    'createSpotOrder': 'Order',
    'createSpotOrders': 'List<Order>',
    'createStopLimitOrder': 'Order',
    'createStopLimitOrderWs': 'Order',
    'createStopLossOrder': 'Order',
    'createStopLossOrderWs': 'Order',
    'createStopMarketOrder': 'Order',
    'createStopMarketOrderWs': 'Order',
    'createStopOrder': 'Order',
    'createStopOrderWs': 'Order',
    'createSwapOrder': 'Order',
    'createTakeProfitOrder': 'Order',
    'createTakeProfitOrderWs': 'Order',
    'createTrailingAmountOrder': 'Order',
    'createTrailingAmountOrderWs': 'Order',
    'createTrailingPercentOrder': 'Order',
    'createTrailingPercentOrderWs': 'Order',
    'createTriggerOrder': 'Order',
    'createTriggerOrderWs': 'Order',
    'createTwapOrder': 'Order',
    'createUtaOrder': 'Order',
    'createUtaOrders': 'List<Order>',
    'editContractOrder': 'Order',
    'editLimitBuyOrder': 'Order',
    'editLimitOrder': 'Order',
    'editLimitSellOrder': 'Order',
    'editOrder': 'Order',
    'editOrderWithClientOrderId': 'Order',
    'editOrderWs': 'Order',
    'editOrders': 'List<Order>',
    'editSpotOrder': 'Order',
    'fetchADLRank': 'ADL',
    'fetchAccount': 'Account',
    'fetchAccountPositions': 'List<Position>',
    'fetchAccounts': 'List<Account>',
    'fetchAccountsV2': 'List<Account>',
    'fetchAccountsV3': 'List<Account>',
    // fetchAllGreeks is deliberately NOT typed: parseAllGreeks() ends in
    // filterByArray(results, 'symbol', symbols), whose `indexed` parameter defaults to
    // TRUE, so it returns a dict keyed by symbol - not the Greeks[] the TS return
    // annotation claims. ToGreeksList then throws on a Dictionary.
    'fetchAmmOrders': 'List<PredictionOrder>',
    // The dictionary-like container families (Balances, Tickers, MarginModes, ...) splat the
    // payload into a Dictionary<string, T>; their From* helpers write every entry back under
    // its own key, so a consuming site (`object x = await this.fetchTickers(...)` then
    // indexed / safeDict()ed) is funnelled through the reverse helper by typeCores. Every
    // consumer must sit inside a method body typeCores visits: Task<object> AND void Task
    // (loadBalanceSnapshot / loadPositionsSnapshot are void).
    // setLeverage is NOT typed: on master its wrapper is cast-only
    // (Task<Dictionary<string, object>>), so typing it to Leverage would silently drop
    // every venue-specific key from the public C# return - an API regression, not a win.
    'fetchBalance': 'Balances',
    'fetchBalanceWs': 'Balances',
    'fetchBidsAsks': 'Tickers',
    'fetchBorrowRateHistories': 'Dictionary<string, object>',
    'fetchBorrowRateHistory': 'List<Dictionary<string, object>>',
    'fetchContractBalance': 'Balances',
    'fetchContractTickers': 'Tickers',
    'fetchCrossBorrowRates': 'CrossBorrowRates',
    'fetchDepositWithdrawFees': 'DepositWithdrawFees',
    'fetchFundingIntervals': 'FundingRates',
    'fetchFundingRates': 'FundingRates',
    'fetchIsolatedBorrowRates': 'IsolatedBorrowRates',
    'fetchLeverages': 'Leverages',
    'fetchMarginModes': 'MarginModes',
    'fetchMarkPrices': 'Tickers',
    'fetchOpenInterests': 'OpenInterests',
    'fetchOrderBooks': 'OrderBooks',
    'fetchSpotTickers': 'Tickers',
    'fetchTickers': 'Tickers',
    'fetchTickersV2': 'Tickers',
    'fetchTickersV3': 'Tickers',
    'fetchTickersWs': 'Tickers',
    'fetchBorrowInterest': 'List<BorrowInterest>',
    'fetchCanceledAndClosedOrders': 'List<Order>',
    'fetchCanceledOrders': 'List<Order>',
    'fetchClosedContractOrders': 'List<Order>',
    'fetchClosedOrder': 'Order',
    'fetchClosedOrders': 'List<Order>',
    'fetchClosedOrdersWs': 'List<Order>',
    'fetchClosedSpotOrders': 'List<Order>',
    'fetchContractDepositAddress': 'DepositAddress',
    'fetchContractDeposits': 'List<Transaction>',
    'fetchContractMarkets': 'List<MarketInterface>',
    'fetchContractOHLCV': 'List<OHLCV>',
    'fetchContractOrder': 'Order',
    'fetchContractOrders': 'List<Order>',
    'fetchContractOrdersByStatus': 'List<Order>',
    'fetchContractWithdrawals': 'List<Transaction>',
    'fetchConvertCurrencies': 'Currencies',
    'fetchConvertQuote': 'Conversion',
    'fetchConvertTrade': 'Conversion',
    'fetchConvertTradeHistory': 'List<Conversion>',
    'fetchCrossBorrowRate': 'CrossBorrowRate',
    'fetchDefaultMarkets': 'List<MarketInterface>',
    'fetchDeposit': 'Transaction',
    'fetchDepositAddress': 'DepositAddress',
    'fetchDepositAddressDefault': 'DepositAddress',
    'fetchDepositAddressSupplement': 'DepositAddress',
    'fetchDepositAddresses': 'List<DepositAddress>',
    // fetchDepositAddressesByNetwork is deliberately NOT typed: parseDepositAddresses()
    // is called with indexed=true by every venue that has this method, and then returns
    // a dict keyed by currency - not the DepositAddress[] the TS return annotation
    // claims. ToDepositAddressList then throws on a Dictionary.
    'fetchDepositWithdrawFee': 'DepositWithdrawFee',
    'fetchDeposits': 'List<Transaction>',
    'fetchDepositsOrWithdrawalsHelper': 'List<Transaction>',
    'fetchDepositsWithdrawals': 'List<Transaction>',
    'fetchDepositsWs': 'List<Transaction>',
    'fetchDerivativesMarketLeverageTiers': 'List<LeverageTier>',
    'fetchDerivativesOpenInterestHistory': 'List<OpenInterest>',
    // 'fetchEvent' is deliberately absent: PredictionEvent.markets is List<PredictionMarket>,
    // which carries none of the unified market-interface keys (base/quote/spot/swap/precision
    // /limits/...) the fixtures store on each nested market. See fetchEvents below.
    'fetchFinancialBalance': 'Balances',
    'fetchFreeBalance': 'Balance',
    'fetchFundingHistory': 'List<FundingHistory>',
    'fetchFundingInterval': 'FundingRate',
    'fetchFundingRate': 'FundingRate',
    'fetchFundingRateHistory': 'List<FundingRateHistory>',
    'fetchFutureMarkets': 'List<MarketInterface>',
    'fetchGreeks': 'Greeks',
    'fetchHip3Markets': 'List<MarketInterface>',
    'fetchIndexOHLCV': 'List<OHLCV>',
    'fetchInverseSwapMarkets': 'List<MarketInterface>',
    'fetchIsolatedBorrowRate': 'IsolatedBorrowRate',
    'fetchLastPrices': 'LastPrices',
    'fetchLedger': 'List<LedgerEntry>',
    'fetchLedgerByEntries': 'List<LedgerEntry>',
    'fetchLedgerEntriesByIds': 'List<LedgerEntry>',
    'fetchLedgerEntry': 'LedgerEntry',
    'fetchLeverage': 'Leverage',
    'fetchLiquidations': 'List<Liquidation>',
    'fetchLongShortRatio': 'LongShortRatio',
    'fetchLongShortRatioHistory': 'List<LongShortRatio>',
    'fetchMarginBalance': 'Balances',
    'fetchMarginAdjustmentHistory': 'List<MarginModification>',
    'fetchMarginMode': 'MarginMode',
    'fetchMarket': 'MarketInterface',
    'fetchMarketById': 'MarketInterface',
    'fetchMarkOHLCV': 'List<OHLCV>',
    'fetchMarkPrice': 'Ticker',
    'fetchMarketLeverageTiers': 'List<LeverageTier>',
    'fetchMarkets': 'List<MarketInterface>',
    'fetchMarketsByType': 'List<MarketInterface>',
    'fetchMarketsV2': 'List<MarketInterface>',
    'fetchMarketsV3': 'List<MarketInterface>',
    'fetchMarketsWs': 'List<MarketInterface>',
    'fetchMyBuys': 'List<Trade>',
    'fetchMyContractTrades': 'List<Trade>',
    'fetchMyLiquidations': 'List<Liquidation>',
    'fetchMySells': 'List<Trade>',
    'fetchMySpotTrades': 'List<Trade>',
    'fetchMyTrades': 'List<Trade>',
    'fetchMyTradesWs': 'List<Trade>',
    'fetchMyUtaTrades': 'List<Trade>',
    'fetchMySettlementHistory': 'List<Dictionary<string, object>>',
    'fetchOHLCV': 'List<OHLCV>',
    'fetchOHLCVWs': 'List<OHLCV>',
    'fetchL3OrderBook': 'OrderBook',
    'fetchOpenInterest': 'OpenInterest',
    'fetchOpenInterestHistory': 'List<OpenInterest>',
    'fetchOpenOrder': 'Order',
    'fetchOpenOrders': 'List<Order>',
    'fetchOpenOrdersV1': 'List<Order>',
    'fetchOpenOrdersV2': 'List<Order>',
    'fetchOpenOrdersWs': 'List<Order>',
    'fetchOpenSpotOrders': 'List<Order>',
    'fetchOpenSwapOrders': 'List<Order>',
    'fetchOption': 'Option',
    'fetchOptionChain': 'OptionChain',
    'fetchOptionMarkets': 'List<MarketInterface>',
    'fetchOptionOHLCV': 'List<OHLCV>',
    'fetchOptionPositions': 'List<Position>',
    'fetchOrder': 'Order',
    'fetchOrderBook': 'OrderBook',
    'fetchOrderBookWs': 'OrderBook',
    'fetchOrderStatus': 'string',
    'fetchOrderClassic': 'Order',
    'fetchOrderDefault': 'Order',
    'fetchOrderSupplement': 'Order',
    'fetchOrderTrades': 'List<Trade>',
    'fetchOrderWithClientOrderId': 'Order',
    'fetchOrderWs': 'Order',
    'fetchOrders': 'List<Order>',
    'fetchOrdersByIds': 'List<Order>',
    'fetchOrdersByState': 'List<Order>',
    'fetchOrdersByStates': 'List<Order>',
    'fetchOrdersByStatus': 'List<Order>',
    'fetchOrdersByStatusWs': 'List<Order>',
    'fetchOrdersByType': 'List<Order>',
    'fetchOrdersClassic': 'List<Order>',
    'fetchOrdersWithMethod': 'List<Order>',
    'fetchOrdersWs': 'List<Order>',
    'fetchPartialBalance': 'Balance',
    'fetchPortfolios': 'List<Account>',
    'fetchPosition': 'Position',
    'fetchPositionADLRank': 'ADL',
    'fetchPositionHistory': 'List<Position>',
    'fetchPositionMode': 'PositionModeInfo',
    'fetchPositionWs': 'List<Position>',
    'fetchPositions': 'List<Position>',
    'fetchPositionsADLRank': 'List<ADL>',
    'fetchPositionsForSymbol': 'List<Position>',
    'fetchPositionsForSymbolWs': 'List<Position>',
    'fetchPositionsHistory': 'List<Position>',
    'fetchPositionsRisk': 'List<Position>',
    'fetchPositionsWs': 'List<Position>',
    'fetchPremiumIndexOHLCV': 'List<OHLCV>',
    'fetchRestOrderBookSafe': 'OrderBook',
    'fetchSettlementHistory': 'List<Dictionary<string, object>>',
    'fetchSettlements': 'List<PredictionSettlement>',
    'fetchSpotBalance': 'Balances',
    'fetchSpotMarkets': 'List<MarketInterface>',
    'fetchSpotOHLCV': 'List<OHLCV>',
    'fetchSpotOrder': 'Order',
    'fetchSpotOrderTrades': 'List<Trade>',
    'fetchSpotOrders': 'List<Order>',
    'fetchSpotOrdersByStates': 'List<Order>',
    'fetchSpotOrdersByStatus': 'List<Order>',
    'fetchStatus': 'Status',
    'fetchSwapBalance': 'Balances',
    'fetchSwapMarkets': 'List<MarketInterface>',
    'fetchTicker': 'Ticker',
    'fetchTicker2': 'Ticker',
    'fetchTickerV1': 'Ticker',
    'fetchTickerV1AndV2': 'Ticker',
    'fetchTickerV2': 'Ticker',
    'fetchTickerV3': 'Ticker',
    'fetchTickerWs': 'Ticker',
    'fetchTime': 'Int64',
    'fetchTotalBalance': 'Balance',
    'fetchTrades': 'List<Trade>',
    'fetchTradesWs': 'List<Trade>',
    'fetchTradingFee': 'TradingFeeInterface',
    // TradingFeeInterface.tiers (ts/src/base/types.ts) carries the cryptomus/onetrading
    // volume-tier schedule, so the TradingFees struct is now lossless for every venue.
    'fetchTradingFees': 'TradingFees',
    'fetchPrivateTradingFees': 'TradingFees',
    'fetchPublicTradingFees': 'TradingFees',
    'fetchTradingFeesWs': 'TradingFees',
    'fetchTradingLimits': 'Dictionary<string, object>',
    'fetchTransactionFees': 'Dictionary<string, object>',
    'fetchTransactions': 'List<Transaction>',
    'fetchTransactionsByType': 'List<Transaction>',
    // fetchTransactionsHelper is deliberately NOT typed: dydx holds its result in an
    // object local and runs filterBy() / arrayConcat() / parseTransfers() over it
    // (ts/src/dydx.ts:1854,2071,2219), so the struct list escapes into untyped code
    // and filterBy throws InvalidCastException on List<Transaction>.
    'fetchTransactionsWithMethod': 'List<Transaction>',
    'fetchTransfer': 'TransferEntry',
    'fetchTransfers': 'List<TransferEntry>',
    'fetchUTAMarkets': 'List<MarketInterface>',
    'fetchUtaMarkets': 'List<MarketInterface>',
    'fetchUTAOHLCV': 'List<OHLCV>',
    'fetchUnifiedOrder': 'Order',
    'fetchUsedBalance': 'Balance',
    'fetchUtaBalance': 'Balances',
    'fetchUtaCanceledAndClosedOrders': 'List<Order>',
    'fetchUtaOrder': 'Order',
    'fetchUtaOrdersByStatus': 'List<Order>',
    'fetchWithdrawal': 'Transaction',
    'fetchWithdrawals': 'List<Transaction>',
    'fetchWithdrawalsWs': 'List<Transaction>',
    'setLeverage': 'Dictionary<string, object>',
    'setMargin': 'MarginModification',
    'setMarginMode': 'Dictionary<string, object>',
    'setPositionMode': 'Dictionary<string, object>',
    'transfer': 'TransferEntry',
    'transferBetweenMainAndSubAccount': 'TransferEntry',
    'transferBetweenSubAccounts': 'TransferEntry',
    'transferClassic': 'TransferEntry',
    'transferIn': 'TransferEntry',
    'transferOut': 'TransferEntry',
    'transferUta': 'TransferEntry',
    // --- watch* -------------------------------------------------------------------
    // A watch core hands back the LIVE ws structure (ArrayCache*, the shared balance /
    // ticker dictionaries). Every To* helper materialises a NEW List/struct from the rows,
    // which is exactly the snapshot the deleted PascalCase wrapper produced with
    // `.Select(item => new T(item))` / `new T(res)`. Typing the core therefore keeps the
    // public C# semantics byte for byte while removing the second declaration.
    // The names below have zero consuming call sites outside the wrapper layer
    // (build/tmp_watch_analysis.py in the PR description); the ones that do have them
    // stay untyped and keep their wrapper:
    //   watchTickers        16 sites (binance, okx, kraken, gate, ... ) + Tickers is not invertible
    //   watchOHLCVForSymbols 11 sites; its wrapper conversion is Helper.ConvertToDictionaryOHLCVList
    //   watchMarkPrices      3 sites (okx, binance, aster) + Tickers is not invertible
    //   watchFundingRates    1 site  (okx) + FundingRates is not invertible
    // and the venue-internal plumbing (watchPublic/watchPrivate/watchTopics/...) whose
    // wrapper is cast-only, so typing it would drop venue keys.
    'watchBalance': 'Balances',
    'watchBidsAsks': 'Tickers',
    'watchFundingRate': 'FundingRate',
    'watchFundingRatesForSymbols': 'FundingRates',
    'watchLiquidations': 'List<Liquidation>',
    'watchLiquidationsForSymbols': 'List<Liquidation>',
    'watchMarkPrice': 'Ticker',
    'watchMyLiquidations': 'List<Liquidation>',
    'watchMyLiquidationsForSymbols': 'List<Liquidation>',
    'watchMyTrades': 'List<Trade>',
    'watchMyTradesForSymbols': 'List<Trade>',
    'watchOHLCV': 'List<OHLCV>',
    'watchOrders': 'List<Order>',
    'watchOrdersForSymbols': 'List<Order>',
    'watchPosition': 'Position',
    'watchPositionForSymbols': 'List<Position>',
    'watchPositions': 'List<Position>',
    'watchTicker': 'Ticker',
    'watchTrades': 'List<Trade>',
    'watchTradesForSymbols': 'List<Trade>',
    'watchUtaTickers': 'Tickers',
    'withdraw': 'Transaction',
    'withdrawWs': 'Transaction',
    // the ws container families below snapshot the live cache exactly as the wrapper's
    // `new Tickers(res)` / `new FundingRates(res)` did: the ctor re-materialises every row
    // into a fresh struct, so the caller never holds the live dictionary
    'watchTickers': 'Tickers',
    'watchMarkPrices': 'Tickers',
    'watchFundingRates': 'FundingRates',
};

// watch* cores whose public shape is a SNAPSHOT of a live ws structure rather than a
// re-materialised unified struct. `.Copy()` is load-bearing: without it the caller holds
// the live book and sees updates it must not see, so the copy moves onto the core return.
const SNAPSHOT_CORES: Record<string, { type: string; helper: string; predictionType?: string; predictionHelper?: string }> = {
    'watchOrderBook': {
        'type': 'ccxt.pro.IOrderBook',
        'helper': 'ccxt.BaseExchange.ToOrderBookSnapshot',
        'predictionType': 'ccxt.PredictionOrderBook',
        'predictionHelper': 'ccxt.BaseExchange.ToPredictionOrderBookSnapshot',
    },
    'watchOrderBookForSymbols': {
        'type': 'ccxt.pro.IOrderBook',
        'helper': 'ccxt.BaseExchange.ToOrderBookSnapshot',
    },
};












// the prediction tier (PredictionExchange : BaseExchange) is a sibling hierarchy with its own
// structures, so the same method name is typed differently there — no invariance conflict
// struct families that have a reverse `FromX` / `FromXList` helper in
// cs/ccxt/base/Exchange.TypedCores.cs, i.e. that can be handed back to the untyped
// object pipeline. Produced by `python3 build/generateTypedCoreHelpers.py --capabilities`.
// The dictionary-like containers (Tickers, Balances, OrderBook, ...) are included since the
// generator learned to invert their splat constructors: the loop copies every non-"info"
// key verbatim, so writing each entry back under its own key restores the source dict.
// OHLCV's ctor is positional so the generator cannot invert it; FromOHLCVList is hand-written
// in Exchange.TranspileHelpers.cs, which is why the family is still listed here.
const REVERSIBLE_FAMILIES: string[] = [
    'ADL', 'Account', 'Balance', 'BalanceAccount', 'Balances', 'BorrowInterest',
    'CancellationRequest', 'Conversion', 'CrossBorrowRate', 'CrossBorrowRates', 'Currencies',
    'Currency', 'CurrencyLimits', 'DepositAddress', 'DepositWithdrawFee',
    'DepositWithdrawFeeNetwork', 'DepositWithdrawFees', 'Fee', 'FundingHistory', 'FundingRate',
    'FundingRateHistory', 'FundingRates', 'Greeks', 'IsolatedBorrowRate', 'IsolatedBorrowRates',
    'LastPrice', 'LastPrices', 'LedgerEntry', 'Leverage', 'LeverageTier', 'LeverageTiers',
    'Leverages', 'Limits', 'Liquidation', 'LongShortRatio', 'MarginLoan', 'MarginMode',
    'MarginModes', 'MarginModification', 'Market', 'MarketInterface', 'MarketMarginModes',
    'MinMax', 'Network', 'NetworkLimits', 'OHLCV', 'OpenInterest', 'OpenInterests', 'Option',
    'OptionChain', 'Order', 'OrderBook', 'OrderBooks', 'OrderRequest', 'Position',
    'PositionModeInfo', 'Precision', 'PredictionEvent', 'PredictionFees', 'PredictionMarket',
    'PredictionOpenInterest', 'PredictionOrder', 'PredictionOrderBook',
    'PredictionOrderRequest', 'PredictionOutcome', 'PredictionPosition', 'PredictionSettlement',
    'PredictionTicker', 'PredictionTickers', 'PredictionTrade', 'PredictionTradingFee',
    'Status', 'Ticker', 'Tickers', 'Trade', 'TradingFeeInterface', 'TradingFees', 'Transaction',
    'TransferEntry', 'WithdrawalResponse',
];

// the prediction tier (PredictionExchange : BaseExchange) is a sibling hierarchy with its own
// structures, so the same method name is typed differently there — no invariance conflict
const PREDICTION_TYPED_CORES: Record<string, string> = {
    // 'cancelAllOrders': '' below is an explicit opt-out, not an omission: omitting it would
    // fall through to TYPED_CORES and pick up 'List<Order>'.
    'cancelAllOrders': '',
    'cancelOrder': 'PredictionOrder',
    'cancelOrders': 'List<PredictionOrder>',
    'createMarketBuyOrderWithCost': 'PredictionOrder',
    'createMarketOrderWithCost': 'PredictionOrder',
    'createMarketSellOrderWithCost': 'PredictionOrder',
    'createOrder': 'PredictionOrder',
    'createOrders': 'List<PredictionOrder>',
    'editOrder': 'PredictionOrder',
    'fetchAccounts': 'List<Account>',
    'fetchCanceledOrders': 'List<PredictionOrder>',
    'fetchClosedOrders': 'List<PredictionOrder>',
    // 'fetchEvents' is deliberately absent for the same reason as 'fetchEvent': the nested
    // PredictionMarket has no unified market-interface fields, so a typed core rewrites
    // every nested market into a much narrower key set than the fixture stores.
    // the fetchMarkets family is deliberately absent so it falls through to TYPED_CORES
    // 'List<MarketInterface>': FetchMarkets is declared on BaseExchange and C# overrides are
    // invariant, so the prediction tier cannot diverge (CS0508).
    'fetchMyTrades': 'List<PredictionTrade>',
    'fetchOpenInterest': 'PredictionOpenInterest',
    'fetchOpenOrders': 'List<PredictionOrder>',
    'fetchOrder': 'PredictionOrder',
    'fetchOrderTrades': 'List<PredictionTrade>',
    'fetchOrders': 'List<PredictionOrder>',
    'fetchOrdersByIds': 'List<PredictionOrder>',
    'fetchOrderBook': 'PredictionOrderBook',
    'fetchPosition': 'PredictionPosition',
    'fetchPositions': 'List<PredictionPosition>',
    'fetchTicker': 'PredictionTicker',
    'fetchTickers': 'PredictionTickers',
    // the prediction tier caches PredictionTicker rows, so its watchTickers snapshot is a
    // PredictionTickers — it is a sibling hierarchy declaration, no invariance conflict
    'watchTickers': 'PredictionTickers',
    'fetchTrades': 'List<PredictionTrade>',
    'fetchTradingFee': 'PredictionTradingFee',
};

// Generated C# core parameters that can be narrowed from `object` to `string`.
// Keyed by POSITION, never by name: the prediction tier renames `symbol` to
// `outcome`, and C# overrides are invariant on parameter types, not names.
// Produced by build/analyzeCoreArgs.py, which admits a position only when every
// declaration of that method agrees on arity + defaults and no body assigns to it.
// Generated C# core parameters that can be narrowed from `object` to a numeric type.
// Same positional keying and same all-declarations-must-agree gate as CORE_STRING_ARGS,
// plus the narrowed type must equal what the hand-written PascalCase wrapper already
// declares for that position (the wrapper is derived from the TS signature).
// Produced by build/analyzeNumericCoreArgs.py. Reflective dispatch is safe because
// BaseExchange.coerceArgs converts every boxed arg to the parameter type before Invoke.
const CORE_NUMERIC_ARGS: Record<string, Record<number, string>> = {
    'createAmmOrder': { 3: 'double', 4: 'double?' },
    'createContractOrder': { 4: 'double?' },
    'createConvertTrade': { 3: 'double?' },
    'createExtendedOrderRequest': { 3: 'double', 4: 'double?' },
    'createMarketBuyOrderWithCost': { 1: 'double' },
    'createMarketOrderWithCost': { 2: 'double' },
    'createMarketSellOrderWithCost': { 1: 'double' },
    'createOrder': { 3: 'double', 4: 'double?' },
    'createOrderbookOrder': { 3: 'double', 4: 'double?' },
    'createTrailingAmountOrder': { 3: 'double', 4: 'double?' },
    'createTrailingPercentOrder': { 3: 'double', 4: 'double?' },
    'createTwapOrder': { 2: 'double' },
    'createUtaOrder': { 3: 'double', 4: 'double?' },
    'editContractOrder': { 4: 'double', 5: 'double?' },
    'editOrder': { 4: 'double?', 5: 'double?' },
    'editSpotOrder': { 4: 'double', 5: 'double?' },
    'fetchAmmOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchBorrowInterest': { 2: 'Int64?', 3: 'Int64?' },
    'fetchBorrowRateHistories': { 1: 'Int64?', 2: 'Int64?' },
    'fetchBorrowRateHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchCanceledAndClosedOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchCanceledOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchClosedContractOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchClosedOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchClosedSpotOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchContractDeposits': { 1: 'Int64?', 2: 'Int64?' },
    'fetchContractOHLCV': { 2: 'Int64?', 3: 'Int64?' },
    'fetchContractOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchContractOrdersByStatus': { 2: 'Int64?', 3: 'Int64?' },
    'fetchContractWithdrawals': { 1: 'Int64?', 2: 'Int64?' },
    'fetchConvertQuote': { 2: 'double?' },
    'fetchConvertTradeHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchDeposits': { 1: 'Int64?', 2: 'Int64?' },
    'fetchDepositsWithdrawals': { 1: 'Int64?', 2: 'Int64?' },
    'fetchDerivativesOpenInterestHistory': { 2: 'Int64?', 3: 'Int64?' },
    'fetchEventsByQuery': { 1: 'Int64' },
    'fetchFundingHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchFundingRateHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchL2OrderBook': { 1: 'Int64?' },
    'fetchL3OrderBook': { 1: 'Int64?' },
    'fetchLedger': { 1: 'Int64?', 2: 'Int64?' },
    'fetchLedgerByEntries': { 2: 'Int64?' },
    'fetchLiquidations': { 1: 'Int64?', 2: 'Int64?' },
    'fetchLongShortRatioHistory': { 2: 'Int64?', 3: 'Int64?' },
    'fetchMarkOHLCV': { 2: 'Int64?', 3: 'Int64?' },
    'fetchMyBuys': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMyContractTrades': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMyDustTrades': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMyLiquidations': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMySells': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMySettlementHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMySpotTrades': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMyTrades': { 1: 'Int64?', 2: 'Int64?' },
    'fetchMyUtaTrades': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOHLCV': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOpenInterestHistory': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOpenOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOpenOrdersV1': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOpenOrdersV2': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOpenSpotOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOpenSwapOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOptionOHLCV': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOrderBook': { 1: 'Int64?' },
    'fetchOrderBooks': { 1: 'Int64?' },
    'fetchOrderTrades': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOrdersByState': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOrdersByStates': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOrdersByStatus': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOrdersByType': { 2: 'Int64?', 3: 'Int64?' },
    'fetchOrdersClassic': { 1: 'Int64?', 2: 'Int64?' },
    'fetchOrdersWithMethod': { 2: 'Int64?', 3: 'Int64?' },
    'fetchPositionHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchPositionsHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchSeriesEvents': { 2: 'Int64' },
    'fetchSettlementHistory': { 1: 'Int64?', 2: 'Int64?' },
    'fetchSettlements': { 1: 'Int64?', 2: 'Int64?' },
    'fetchSpotOHLCV': { 2: 'Int64?', 3: 'Int64?' },
    'fetchSpotOrderTrades': { 2: 'Int64?', 3: 'Int64?' },
    'fetchSpotOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchSpotOrdersByStates': { 2: 'Int64?', 3: 'Int64?' },
    'fetchSpotOrdersByStatus': { 2: 'Int64?', 3: 'Int64?' },
    'fetchTradeQuote': { 2: 'double' },
    'fetchTrades': { 1: 'Int64?', 2: 'Int64?' },
    'fetchTransactions': { 1: 'Int64?', 2: 'Int64?' },
    'fetchTransactionsByType': { 2: 'Int64?', 3: 'Int64?' },
    'fetchTransactionsWithMethod': { 2: 'Int64?', 3: 'Int64?' },
    'fetchTransfers': { 1: 'Int64?', 2: 'Int64?' },
    'fetchUTAOHLCV': { 2: 'Int64?', 3: 'Int64?' },
    'fetchUtaCanceledAndClosedOrders': { 1: 'Int64?', 2: 'Int64?' },
    'fetchUtaOrdersByStatus': { 2: 'Int64?', 3: 'Int64?' },
    'fetchWithdrawals': { 1: 'Int64?', 2: 'Int64?' },
    'transfer': { 1: 'double' },
    'watchMyTrades': { 1: 'Int64?', 2: 'Int64?' },
    // additional watch* numeric args, same evidence gate as above (build/tmp_watch_args.py)
    'watchLiquidations': { 1: 'Int64?', 2: 'Int64?' },
    'watchLiquidationsForSymbols': { 1: 'Int64?', 2: 'Int64?' },
    'watchMyLiquidations': { 1: 'Int64?', 2: 'Int64?' },
    'watchMyLiquidationsForSymbols': { 1: 'Int64?', 2: 'Int64?' },
    'watchMyTradesForSymbols': { 1: 'Int64?', 2: 'Int64?' },
    'watchOrderBookForSymbols': { 1: 'Int64?' },
    'watchOrdersForSymbols': { 1: 'Int64?', 2: 'Int64?' },
    'watchPositionForSymbols': { 1: 'Int64?', 2: 'Int64?' },
    'watchTradesForSymbols': { 1: 'Int64?', 2: 'Int64?' },
    'watchOHLCV': { 2: 'Int64?', 3: 'Int64?' },
    'watchOrderBook': { 1: 'Int64?' },
    'watchOrders': { 1: 'Int64?', 2: 'Int64?' },
    'watchPositions': { 1: 'Int64?', 2: 'Int64?' },
    'watchTrades': { 1: 'Int64?', 2: 'Int64?' },
    'withdraw': { 1: 'double' },
};

const CORE_STRING_ARGS: Record<string, number[]> = {
    'addMargin': [ 0 ],
    'cancelAllOrders': [ 0 ],
    'cancelAllOrdersWs': [ 0 ],
    'cancelContractOrder': [ 0, 1 ],
    'cancelOrder': [ 0, 1 ],
    'cancelOrderWithClientOrderId': [ 0, 1 ],
    'cancelOrderWs': [ 0, 1 ],
    'cancelOrders': [ 1 ],
    'cancelOrdersWithClientOrderIds': [ 1 ],
    'cancelOrdersWs': [ 1 ],
    'cancelSpotOrder': [ 0, 1 ],
    'cancelTwapOrder': [ 0, 1 ],
    'cancelUtaOrder': [ 0, 1 ],
    'cancelUtaOrders': [ 1 ],
    'closePosition': [ 0, 1 ],
    'createAmmOrder': [ 0, 1, 2 ],
    'createConvertTrade': [ 0 ],
    'createDepositAddress': [ 0 ],
    'createLimitBuyOrder': [ 0 ],
    'createLimitBuyOrderWs': [ 0 ],
    'createLimitOrder': [ 0, 1 ],
    'createLimitOrderWs': [ 0, 1 ],
    'createLimitSellOrder': [ 0 ],
    'createLimitSellOrderWs': [ 0 ],
    'createMarketBuyOrder': [ 0 ],
    'createMarketBuyOrderWithCost': [ 0 ],
    'createMarketBuyOrderWs': [ 0 ],
    'createMarketOrder': [ 0, 1 ],
    'createMarketOrderWithCost': [ 0, 1 ],
    'createMarketOrderWithCostWs': [ 0, 1 ],
    'createMarketOrderWs': [ 0, 1 ],
    'createMarketSellOrder': [ 0 ],
    'createMarketSellOrderWithCost': [ 0 ],
    'createMarketSellOrderWs': [ 0 ],
    'createOrder': [ 0, 1, 2 ],
    'createOrderWithTakeProfitAndStopLoss': [ 0, 1, 2 ],
    'createOrderWithTakeProfitAndStopLossWs': [ 0, 1, 2 ],
    'createOrderWs': [ 0, 1, 2 ],
    'createOrderbookOrder': [ 0, 1, 2 ],
    'createPostOnlyOrder': [ 0, 1, 2 ],
    'createPostOnlyOrderWs': [ 0, 1, 2 ],
    'createReduceOnlyOrder': [ 0, 1, 2 ],
    'createReduceOnlyOrderWs': [ 0, 1, 2 ],
    'createStopLimitOrder': [ 0, 1 ],
    'createStopLimitOrderWs': [ 0, 1 ],
    'createStopLossOrder': [ 0, 1, 2 ],
    'createStopLossOrderWs': [ 0, 1, 2 ],
    'createStopMarketOrder': [ 0, 1 ],
    'createStopMarketOrderWs': [ 0, 1 ],
    'createStopOrder': [ 0, 1, 2 ],
    'createStopOrderWs': [ 0, 1, 2 ],
    'createTakeProfitOrder': [ 0, 1, 2 ],
    'createTakeProfitOrderWs': [ 0, 1, 2 ],
    'createTrailingAmountOrder': [ 0, 1, 2 ],
    'createTrailingAmountOrderWs': [ 0, 1, 2 ],
    'createTrailingPercentOrder': [ 0, 1, 2 ],
    'createTrailingPercentOrderWs': [ 0, 1, 2 ],
    'createTriggerOrder': [ 0, 1, 2 ],
    'createTriggerOrderWs': [ 0, 1, 2 ],
    'createTwapOrder': [ 0, 1 ],
    'editContractOrder': [ 0, 1, 2, 3 ],
    'editLimitBuyOrder': [ 0, 1 ],
    'editLimitOrder': [ 0, 1, 2 ],
    'editLimitSellOrder': [ 0, 1 ],
    'editOrder': [ 0, 1, 2, 3 ],
    'editOrderWithClientOrderId': [ 0, 1, 2, 3 ],
    'editOrderWs': [ 0, 1, 2, 3 ],
    'editSpotOrder': [ 0, 1, 2, 3 ],
    'fetchADLRank': [ 0 ],
    'fetchAmmOrders': [ 0 ],
    'fetchCanceledOrders': [ 0 ],
    'fetchClosedOrder': [ 0, 1 ],
    'fetchClosedOrders': [ 0 ],
    'fetchClosedOrdersWs': [ 0 ],
    'fetchContractDepositAddress': [ 0 ],
    'fetchContractOHLCV': [ 0, 1 ],
    'fetchConvertTrade': [ 0, 1 ],
    'fetchConvertTradeHistory': [ 0 ],
    'fetchCrossBorrowRate': [ 0 ],
    'fetchDeposit': [ 0, 1 ],
    'fetchDepositAddress': [ 0 ],
    'fetchDepositAddressDefault': [ 0 ],
    'fetchDepositAddressSupplement': [ 0 ],
    'fetchDepositAddressesByNetwork': [ 0 ],
    'fetchDepositWithdrawFee': [ 0 ],
    'fetchDeposits': [ 0 ],
    'fetchDepositsWs': [ 0 ],
    'fetchDerivativesMarketLeverageTiers': [ 0 ],
    'fetchEvent': [ 0 ],
    'fetchFundingInterval': [ 0 ],
    'fetchFundingRate': [ 0 ],
    'fetchFundingRateHistory': [ 0 ],
    'fetchGreeks': [ 0 ],
    'fetchIndexOHLCV': [ 0, 1 ],
    'fetchIsolatedBorrowRate': [ 0 ],
    'fetchLedger': [ 0 ],
    'fetchLedgerByEntries': [ 0 ],
    'fetchLedgerEntriesByIds': [ 1 ],
    'fetchLedgerEntry': [ 0, 1 ],
    'fetchLeverage': [ 0 ],
    'fetchLiquidations': [ 0 ],
    'fetchLongShortRatio': [ 0, 1 ],
    'fetchLongShortRatioHistory': [ 0, 1 ],
    'fetchMarginAdjustmentHistory': [ 0, 1 ],
    'fetchMarginMode': [ 0 ],
    'fetchMarkOHLCV': [ 0, 1 ],
    'fetchMarkPrice': [ 0 ],
    'fetchMarket': [ 0 ],
    'fetchMarketById': [ 0 ],
    'fetchMarketLeverageTiers': [ 0 ],
    'fetchMyBuys': [ 0 ],
    'fetchMySells': [ 0 ],
    'fetchMyTrades': [ 0 ],
    'fetchMyTradesWs': [ 0 ],
    'fetchOHLCV': [ 0, 1 ],
    'fetchOHLCVWs': [ 0, 1 ],
    'fetchOpenInterest': [ 0 ],
    'fetchOpenOrder': [ 0, 1 ],
    'fetchOpenOrders': [ 0 ],
    'fetchOpenOrdersWs': [ 0 ],
    'fetchOption': [ 0 ],
    'fetchOptionChain': [ 0 ],
    'fetchOptionOHLCV': [ 0, 1 ],
    'fetchOrder': [ 0, 1 ],
    'fetchOrderBook': [ 0 ],
    'fetchOrderBookWs': [ 0 ],
    'fetchOrderTrades': [ 0, 1 ],
    'fetchOrderWithClientOrderId': [ 0, 1 ],
    'fetchOrderWs': [ 0, 1 ],
    'fetchOrders': [ 0 ],
    'fetchOrdersByIds': [ 1 ],
    'fetchOrdersByStatusWs': [ 0, 1 ],
    'fetchOrdersWs': [ 0 ],
    'fetchPosition': [ 0 ],
    'fetchPositionADLRank': [ 0 ],
    'fetchPositionHistory': [ 0 ],
    'fetchPositionMode': [ 0 ],
    'fetchPositionWs': [ 0 ],
    'fetchPositionsForSymbolWs': [ 0 ],
    'fetchPremiumIndexOHLCV': [ 0, 1 ],
    'fetchSettlements': [ 0 ],
    'fetchSpotOHLCV': [ 0, 1 ],
    'fetchSpotOrderTrades': [ 0, 1 ],
    'fetchTicker': [ 0 ],
    'fetchTicker2': [ 0 ],
    'fetchTickerV1': [ 0 ],
    'fetchTickerV1AndV2': [ 0 ],
    'fetchTickerV2': [ 0 ],
    'fetchTickerV3': [ 0 ],
    'fetchTickerWs': [ 0 ],
    'fetchTrades': [ 0 ],
    'fetchTradesWs': [ 0 ],
    'fetchTradingFee': [ 0 ],
    'fetchTransfer': [ 0, 1 ],
    'fetchTransfers': [ 0 ],
    'fetchUTAOHLCV': [ 0, 1 ],
    'fetchWithdrawal': [ 0, 1 ],
    'fetchWithdrawals': [ 0 ],
    'fetchWithdrawalsWs': [ 0 ],
    'reduceMargin': [ 0 ],
    'setLeverage': [ 1 ],
    'setMarginMode': [ 0, 1 ],
    'setPositionMode': [ 1 ],
    'transfer': [ 0, 2, 3 ],
    'transferBetweenMainAndSubAccount': [ 0, 2, 3 ],
    'transferBetweenSubAccounts': [ 0, 2, 3 ],
    'transferClassic': [ 0, 2, 3 ],
    'transferIn': [ 0 ],
    'transferOut': [ 0 ],
    'transferUta': [ 0, 2, 3 ],
    // watch* string args, gated by build/tmp_watch_args.py: admitted only when every
    // generated wrapper declaration agrees on `string` at that position and every core
    // declaration agrees on arity. The venue-internal helpers (watchPublic, watchTopics,
    // watchMultiHelper, ...) disagree across venues and are absent.
    'watchFundingRate': [ 0 ],
    'watchLiquidations': [ 0 ],
    'watchMarkPrice': [ 0 ],
    'watchMyLiquidations': [ 0 ],
    'watchMyTrades': [ 0 ],
    'watchOHLCV': [ 0, 1 ],
    'watchOrderBook': [ 0 ],
    'watchOrders': [ 0 ],
    'watchPosition': [ 0 ],
    'watchTicker': [ 0 ],
    'watchTrades': [ 0 ],
    'withdraw': [ 0, 2, 3 ],
    'withdrawWs': [ 0, 2, 3 ],
    // fetchRestOrderBookSafe omitted: TS declares `symbol: any`, so the wrapper and the
    // hand-written WsBridge caller both pass `object` and cannot be narrowed here
};









const GLOBAL_WRAPPER_FILE = './cs/ccxt/base/Exchange.Wrappers.cs';
// the fine-split moves the 62 symbol-based trading methods onto the concrete `Exchange` tier
// (not BaseExchange), so the sibling PredictionExchange tier does not inherit them
const GLOBAL_TRADING_WRAPPER_FILE = './cs/ccxt/base/Exchange.TradingWrappers.cs';
const BASE_TRADING_METHODS_FILE = './cs/ccxt/base/Exchange.TradingMethods.cs';
const EXCHANGE_WRAPPER_FOLDER = './cs/ccxt/wrappers/'
const EXCHANGE_WS_WRAPPER_FOLDER = './cs/ccxt/exchanges/pro/wrappers/'
const ERRORS_FILE = './cs/ccxt/base/Exchange.Errors.cs';
const BASE_METHODS_FILE = './cs/ccxt/base/Exchange.BaseMethods.cs';
const EXCHANGES_FOLDER = './cs/ccxt/exchanges/';
const EXCHANGES_WS_FOLDER = './cs/ccxt/exchanges/pro/';
const EXCHANGES_PREDICTION_FOLDER = './cs/ccxt/exchanges/prediction/';
const EXCHANGE_PREDICTION_WRAPPER_FOLDER = './cs/ccxt/wrappers/prediction/';
const EXCHANGES_PREDICTION_WS_FOLDER = './cs/ccxt/exchanges/prediction/pro/';
const EXCHANGE_PREDICTION_WS_WRAPPER_FOLDER = './cs/ccxt/exchanges/prediction/pro/wrappers/';
const GENERATED_TESTS_FOLDER = './cs/tests/Generated/Exchange/';
const BASE_TESTS_FOLDER = './cs/tests/Generated/Base';
const BASE_TESTS_FILE =  './cs/tests/Generated/TestMethods.cs';
const EXCHANGE_BASE_FOLDER = './cs/tests/Generated/Exchange/Base/';
const EXCHANGE_GENERATED_FOLDER = './cs/tests/Generated/Exchange/';
const EXAMPLES_INPUT_FOLDER = './examples/ts/';
const EXAMPLES_OUTPUT_FOLDER = './examples/cs/examples/';
const csharpComments: any = {};

// default min(2, AP): 2w + shared-Program chunks is within ~10–15% of 4w and uses fewer cores.
// Override with CCXT_TRANSPILE_PROCESSES.
function csharpWorkerThreads () {
    const requested = Number (process.env.CCXT_TRANSPILE_PROCESSES);
    if (requested > 0) {
        return requested;
    }
    return Math.max (1, Math.min (2, os.availableParallelism ()));
}

class NewTranspiler {

    transpiler!: Transpiler;
    pythonStandardLibraries;
    piscina: Piscina | undefined;
    oldTranspiler = new OldTranspiler();
    // true while transpiling the prediction-market exchanges (ts/src/prediction/),
    // which live in the ccxt.prediction / ccxt.prediction.pro namespaces
    isPrediction = false;
    // set once PredictionExchange.cs has been emitted in this process. A full run reaches
    // transpilePredictionBaseMethods twice (recursive prediction pass, then the main pass)
    // with identical inputs, so the second call would only rewrite the same bytes.
    private _predictionBaseWritten = false;

    constructor() {

        this.setupTranspiler()
        // this.transpiler.csharpTranspiler.VAR_TOKEN = 'var'; // tmp fix


        this.pythonStandardLibraries = {
            'hashlib': 'hashlib',
            'math': 'math',
            'json.loads': 'json',
            'json.dumps': 'json',
            'sys': 'sys',
        }
    }

    getWsRegexes() {
        // hoplefully we won't need this in the future by having everything typed properly in the typescript side
        return [
            [/new (\w+)Rest\(\)/, 'new ccxt.$1()'],
            [/return await (\w+);/gm, 'return await ($1 as Exchange.Future);'],
            // [/typeof\(client\)/gm, 'client'],
            // [/typeof\(orderbook\)/gm, 'orderbook'], // fix this in the transpiler later
            [/new\sgetValue\((\w+),\s(\w+)\)\((\w+)\)/gm, 'this.newException(getValue($1, $2), $3)'],
            [/\(object\)client\).subscriptions/gm, '(WebSocketClient)client).subscriptions'],
            [/client\.subscriptions/gm, '((WebSocketClient)client).subscriptions'],
            [/Dictionary<string,object>\)client.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures'],
            [/this\.safeValue\(client\.futures,/gm, 'this.safeValue((client as WebSocketClient).futures,'],
            [/Dictionary<string,object>\)this\.clients/gm, 'Dictionary<string, ccxt.Exchange.WebSocketClient>)this.clients'],
            [/(object \w+) = client\.futures/, '$1 = (client as WebSocketClient).futures'],
            [/(orderbook)(\.reset.+)/gm, '($1 as IOrderBook)$2'],
            [/(\w+)(\.cache)/gm, '($1 as ccxt.pro.OrderBook)$2'],
            //  [/(\w+)(\.reset)/gm, '($1 as ccxt.OrderBook)$2'],
            // Match ArrayCache variables and cast to appropriate type based on variable name
            // Order matters: check most specific types first
            [/((?:this\.)?\w*ArrayCacheBySymbolBySide\w*)(\.hashmap)/gm, '($1 as ArrayCacheBySymbolBySide)$2'],
            [/((?:this\.)?\w*ArrayCacheByTimestamp\w*)(\.hashmap)/gm, '($1 as ArrayCacheByTimestamp)$2'],
            [/((?:this\.)?\w*ArrayCacheBySymbolById\w*)(\.hashmap)/gm, '($1 as ArrayCacheBySymbolById)$2'],
            // General ArrayCache pattern (must not match the specific types above)
            [/((?:this\.)?\w+ArrayCache(?!BySymbolBySide|ByTimestamp|BySymbolById)\w*)(\.hashmap)/gm, '($1 as ArrayCache)$2'],
            // Fallback for other variables (keep original behavior for backwards compatibility)
            [/((?:this\.)?\w+)(\.hashmap)/gm, '($1 as ArrayCache)$2'],
            [/(countedBookSide)\.store\(((.+),(.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)\.store\(((.+),(.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)\.store\(((.+),(.+))\)/gm, '($1 as IOrderBookSide).store($2)'],
            [/(\w+)(\.storeArray\(.+\))/gm, '($1 as IOrderBookSide)$2'],
            // [/(.+)\.store\((.+),(.+)\)/gm, '($1 as OrderBookSide).store($2,$3)'],
            [/(\w+)\.call\(this,(.+)\)/gm, 'DynamicInvoker.InvokeMethod($1, new object[] {$2})'],
            [/(\w+)(\.limit\(\))/gm, '($1 as IOrderBook)$2'],
            [/(future)\.resolve\((.*)\)/gm, '($1 as Future).resolve($2)'],
            [/this\.spawn\((this\.\w+),(.+)\)/gm, 'this.spawn($1, new object[] {$2})'],
            [/this\.delay\(([^,]+),([^,]+),(.+)\)/gm, 'this.delay($1, $2, new object[] {$3})'],
            // [/(this\.\w+)\.(append|resolve|getLimit)\((.+)\)/gm, 'callDynamically($1, "$2", new object[] {$3})'], // check this.orders
            [/(((?:this\.)?\w+))\.(append|resolve|getLimit)\((.+)\)/gm, 'callDynamically($1, "$3", new object[] {$4})'],
            [/future(\.reject.+)/gm, '((Future)future)$1'],
            [/(\w+)(\.reject.+)/gm, '((WebSocketClient)$1)$2'],
            [/(client)(\.reset.+)/gm, '((WebSocketClient)$1)$2'],
            [/\(client,/g, '(client as WebSocketClient,'],
            [/\(object client,/gm, '(WebSocketClient client,'],
            [/\(object client\)/gm, '(WebSocketClient client)'],
            [/object client =/gm, 'var client ='],
            [/object future =/gm, 'var future ='],
        ]
    }


    // c# custom method
    customCSharpPropAssignment(node: any, identation: any) {
        const stringValue = node.getFullText().trim();
        if (Object.keys(errors).includes(stringValue)) {
            return `typeof(${stringValue})`;
        }
        return undefined;
    }

    // a helper to apply an array of regexes and substitutions to text
    // accepts an array like [ [ regex, substitution ], ... ]

    regexAll (text: string, array: any[]) {
        for (const i in array) {
            let regex = array[i][0]
            const flags = (typeof regex === 'string') ? 'g' : undefined
            regex = new RegExp (regex, flags)
            text = text.replace (regex, array[i][1])
        }
        return text
    }

    // ============================================================================

    iden(level = 1) {
        return '    '.repeat(level)
    }
    // ============================================================================

    getTranspilerConfig() {
        return {
            "verbose": false,
            "csharp": {
                "parser": {
                    "ELEMENT_ACCESS_WRAPPER_OPEN": "getValue(",
                    "ELEMENT_ACCESS_WRAPPER_CLOSE": ")",
                    // "VAR_TOKEN": "var",
                }
            },
        }
    }

    createSee(link: string) {
        return `/// See <see href="${link}"/>  <br/>`
    }

    createParam(param: any) {
        return`/// <item>
    /// <term>${param.name}</term>
    /// <description>
    /// ${param.type} : ${param.description}
    /// </description>
    /// </item>`
    }

    createCsharpCommentTemplate(name: string, desc: string, see: string[], params : string[], returnType:string, returnDesc: string) {
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
    /// <returns> <term>${returnType}</term> ${returnDesc}.</returns>`
    const commentWithoutEmptyLines = comment.replace(/^\s*[\r\n]/gm, "");
    return commentWithoutEmptyLines;
    }

    transformTSCommentIntoCSharp(name: string, desc: string, sees: string[], params : string[], returnType:string, returnDesc: string) {
        return this.createCsharpCommentTemplate(name, desc, sees, params, returnType, returnDesc);
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
        const commentDescriptionRegex = /@description\s(.+)/;
        const descriptionMatches = comment.match(commentDescriptionRegex);
        const description = descriptionMatches ? descriptionMatches[1] : undefined;
        const seeRegex = /@see\s(.+)/g;
        const seeMatches = comment.match(seeRegex);
        const sees: string[] = [];
        if (seeMatches) {
            seeMatches.forEach((match: any) => {
                const [, link] = match.split(' ');
                sees.push(link);
            });
        }
        // const paramRegex = /@param\s{(\w+)}\s\[(\w+)\]\s(.+)/g; // @param\s{(\w+)}\s\[((\w+(.\w+)?))\]\s(.+)
        const paramRegex = /@param\s{(\w+[?]?)}\s\[(\w+\.?\w+?)]\s(.+)/g;
        const params = [] as any;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(comment)) !== null) {
            const [, type, name, description] = paramMatch;
            params.push({type, name, description});
        }
        const returnRegex = /@returns\s{(\w+\[?\]?\[?\]?)}\s(.+)/;
        const returnMatch = comment.match(returnRegex);
        const returnType = returnMatch ? returnMatch[1] : undefined;
        const returnDescription =  returnMatch && returnMatch.length > 1 ? returnMatch[2]: undefined;
        let exchangeData = csharpComments[exchangeName];
        if (!exchangeData) {
            exchangeData = csharpComments[exchangeName] = {}
        }
        let exchangeMethods = csharpComments[exchangeName];
        if (!exchangeMethods) {
            exchangeMethods = {}
        }
        const transformedComment = this.transformTSCommentIntoCSharp(methodName, description, sees,params, returnType, returnDescription);
        exchangeMethods[methodName] = transformedComment;
        csharpComments[exchangeName] = exchangeMethods
        return comment;
    }

    setupTranspiler() {
        this.transpiler = new Transpiler (this.getTranspilerConfig())
        setupCsharpPrinter (this.transpiler);
        this.transpiler.csharpTranspiler.transformLeadingComment = this.transformLeadingComment.bind(this);
        this.patchCsharpPropertyTypes ();
    }

    // Same ast-transpiler field-type hole as Java: getType() returns raw TS aliases
    // (Dict/Str/Num/...) for class fields without VariableTypeReplacements. Without this,
    // `skippedMethods: Dict = {}` emits `public Dict ...` and CS0246. Route field types
    // through the existing map (exact key only).
    patchCsharpPropertyTypes () {
        const csharpTranspiler = (this.transpiler as any)?.csharpTranspiler;
        if (!csharpTranspiler || typeof csharpTranspiler.getType !== 'function' || csharpTranspiler._propertyTypesPatched) {
            return;
        }
        const originalGetType = csharpTranspiler.getType.bind (csharpTranspiler);
        csharpTranspiler.getType = (node: any) => {
            const type = originalGetType (node);
            const replacements = csharpTranspiler.VariableTypeReplacements ?? {};
            if ((typeof type === 'string') && Object.prototype.hasOwnProperty.call (replacements, type)) {
                return replacements[type];
            }
            return type;
        };
        csharpTranspiler._propertyTypesPatched = true;
    }

    createGeneratedHeader() {
        return [
            "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
            "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
            ""
        ]
    }

    getNamespace(ws = false) {
        if (this.isPrediction) {
            return ws ? 'namespace ccxt.prediction.pro;' : 'namespace ccxt.prediction;';
        }
        return ws ? 'namespace ccxt.pro;' : 'namespace ccxt;';
    }

    getCsharpImports(file: any, ws = false) {
        const namespace = this.getNamespace (ws);
        const values = [
            // "using ccxt;",
            namespace,
        ]
        if (this.isPrediction) {
            // prediction exchanges merge REST + WS in one class and need the ws
            // infrastructure types (IOrderBook, ArrayCache, ...) from ccxt.pro
            values.push ("using ccxt.pro;");
        }
        // if (ws) {
        //     values.push("using System.Reflection;");
        // }
        return values;
    }

    isObject(type: string) {
        return (type === 'any') || (type === 'unknown');
    }

    isDictionary(type: string): boolean {
        return (type === 'Object') || (type === 'Dictionary<any>') || (type === 'unknown') || (type === 'Dict') || (type === 'NullableDict') || ((type.startsWith('{')) && (type.endsWith('}')))
    }

    isStringType(type: string) {
        return (type === 'Str') || (type === 'string') || (type === 'StringLiteral') || (type === 'StringLiteralType') || (type.startsWith('"') && type.endsWith('"')) || (type.startsWith("'") && type.endsWith("'"))
    }

    isNumberType(type: string) {
        return (type === 'Num') || (type === 'number') || (type === 'NumericLiteral') || (type === 'NumericLiteralType')
    }

    isIntegerType(type: string) {
        return type !== undefined && (type.toLowerCase() === 'int') ;
    }

    isBooleanType(type: string) {
        return (type === 'boolean') || (type === 'BooleanLiteral') || (type === 'BooleanLiteralType') || (type === 'Bool')
    }

    convertJavascriptTypeToCsharpType(name: string, type: string, isReturn = false): string | undefined {

        // handle watchOrderBook exception here (watchOrderBook and watchOrderBookForSymbols)
        if (name.startsWith('watchOrderBook')) {
            return this.isPrediction ? `Task<ccxt.PredictionOrderBook>` : `Task<ccxt.pro.IOrderBook>`;
        }

        if (name === 'watchOHLCVForSymbols') {
            return `Task<Dictionary<string, Dictionary<string, List<OHLCV>>>>`;
        }

        if (name === 'fetchTime'){
            return `Task<Int64>`; // custom handling for now
        }

        const isPromise = type.startsWith('Promise<') && type.endsWith('>');
        let wrappedType = isPromise ? type.substring(8, type.length - 1) : type;
        let isList = false;

        // TS >= 5/6 (ast-transpiler 0.0.91) infers inline object literal types for
        // methods without an explicit annotation (e.g. `{ info: any; hedged: boolean; }`).
        // Map them to a plain dictionary (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.trim().startsWith('{')) {
            if (wrappedType.trim().endsWith('[]')) {
                isList = true; // e.g. `{ id: Str; ... }[]` → List<Dictionary<string, object>>
            }
            return addTaskIfNeeded('Dictionary<string, object>');
        }

        // TS >= 5/6 (ast-transpiler 0.0.91) infers union return types for methods
        // without an explicit annotation (e.g. `OpenInterest | undefined`, `Dict | Leverage`).
        // Normalize them here: drop undefined/null members and collapse remaining
        // multi-member unions to the first member (matches the previous TS 4.9 output).
        if (wrappedType !== undefined && wrappedType.includes(' | ') && !wrappedType.includes('<')) {
            const members = wrappedType.split(' | ').map (m => m.trim()).filter (m => m !== 'undefined' && m !== 'null' && m !== 'Undefined');
            wrappedType = members.length > 0 ? members[0] : 'object';
        }

        // TS >= 5/6 keeps type alias names (e.g. `Market[]`) instead of expanding them;
        // map the nullable alias back to its concrete interface (matches the previous
        // TS 4.9 output, e.g. `List<MarketInterface>` in the committed wrappers).
        if (wrappedType === 'Market' || wrappedType === 'Market[]') {
            wrappedType = wrappedType.replace ('Market', 'MarketInterface');
        }

        function addTaskIfNeeded(type: string) {
            if (type == 'void') {
                return isPromise ? `Task` : 'void';
            } else if (isList) {
                return isPromise ? `Task<List<${type}>>` : `List<${type}>`;
            }
            return isPromise ? `Task<${type}>` : type;
        }

        const csharpReplacements: dict = {
            'OrderType': 'string',
            'OrderSide': 'string', // tmp
            'fetchEventsParams': 'Dictionary<string, object>', // params bag; surface as a dict
            // TS interface names whose C# structs are Currency / Fee (cs/ccxt/base/Exchange.Types.cs)
            'CurrencyInterface': 'Currency',
            'FeeInterface': 'Fee',
        }

        if (wrappedType === undefined || wrappedType === 'Undefined') {
            return addTaskIfNeeded('object'); // default if type is unknown;
        }

        // `List` is an alias for `Array<any>` (see ts/src/base/types.ts) — normalize it
        // to `any[]` so it flows through the array branch below instead of leaking the
        // bare `List` identifier, which is not a valid C# type without a generic arg.
        if (wrappedType === 'List') {
            wrappedType = 'any[]';
        }

        // Tuple return types like `[Dict, Str]` belong to internal multi-return helpers
        // (e.g. createOrderRequest) that aren't part of the unified API. C# has no inline
        // tuple syntax matching `[A, B]`, so treat them as an untyped array — exactly how
        // they transpiled before being annotated (they were `any[]`). The generated
        // wrapper only needs to compile; these helpers are never called through it.
        if (wrappedType.startsWith('[') && wrappedType.endsWith(']')) {
            wrappedType = 'any[]';
        }

        if (wrappedType === 'string[][]') {
            return addTaskIfNeeded('List<List<string>>');
        }

        // check if returns a list
        if (wrappedType.endsWith('[]')) {
            isList = true;
            wrappedType = wrappedType.substring(0, wrappedType.length - 2);
        }

        if (this.isObject(wrappedType)) {
            if (isReturn) {
                return addTaskIfNeeded('Dictionary<string, object>');
            }
            return addTaskIfNeeded('object');
        }
        if (this.isDictionary(wrappedType)) {
            return addTaskIfNeeded('Dictionary<string, object>');
        }
        if (this.isStringType(wrappedType)) {
            return addTaskIfNeeded('string');
        }
        if (this.isIntegerType(wrappedType)) {
            return addTaskIfNeeded('Int64');
        }
        if (this.isNumberType(wrappedType)) {
            // return addTaskIfNeeded('float');
            return addTaskIfNeeded('double');
        }
        if (this.isBooleanType(wrappedType)) {
            return addTaskIfNeeded('bool');
        }
        if (wrappedType === 'Strings') {
            return addTaskIfNeeded('List<String>')
        }
        if (csharpReplacements[wrappedType] !== undefined) {
            return addTaskIfNeeded(csharpReplacements[wrappedType]);
        }

        if (wrappedType.startsWith('Dictionary<')) {
            let type = wrappedType.substring(11, wrappedType.length - 1);
            if (type.startsWith('Dictionary<')) {
                type = this.convertJavascriptTypeToCsharpType(name, type) as any;
            }
            return addTaskIfNeeded(`Dictionary<string, ${type}>`);
        }

        return addTaskIfNeeded(wrappedType);
    }

    /**
     * @description Single source of truth for the C# type of an optional scalar parameter.
     * The wrapper signature declares it as `<type>? name = null` and passes it straight into
     * the core call, so the nullable scalar type is computed here and nowhere else.
     * Returns undefined for parameters that are not optional numeric scalars.
     */
    optionalScalarCsharpType(param: any): string | undefined {
        const isOptional = param.optional || param.initializer === 'undefined';
        if (!isOptional) {
            return undefined;
        }
        if (this.isIntegerType(param.type)) {
            return 'Int64';
        }
        if (this.isNumberType(param.type)) {
            return 'double';
        }
        return undefined;
    }

    safeCsharpName(name: string): string {
        const csharpReservedWordsReplacement: dict = {
            'params': 'parameters',
            'base': 'baseArg',
        }
        return csharpReservedWordsReplacement[name] || name;
    }

    convertJavascriptParamToCsharpParam(param: any): string | undefined {
        const name = param.name;
        const safeName = this.safeCsharpName(name);
        const isOptional =  param.optional || param.initializer !== undefined;
        const op = isOptional ? '?' : '';
        let paramType: any = undefined;
        
        // Special case for setMarketsFromExchange method — base tier accepts any exchange
        if (name === 'sourceExchange' && param.type === undefined) {
            paramType = 'BaseExchange';
        } else if (param.type == undefined) {
            paramType = 'object';
        } else {
            paramType = this.convertJavascriptTypeToCsharpType(name, param.type);
        }
        const isNonNullableType = this.isNumberType(param.type) || this.isBooleanType(param.type) || this.isIntegerType(param.type);
        if (isNonNullableType) {
            if (isOptional) {
                if (param.initializer !== undefined && param.initializer !== 'undefined') {
                    return `${paramType} ${safeName} = ${param.initializer}`
                } else {
                    if (paramType  === 'bool') {
                        return `${paramType}? ${safeName} = false`
                    }
                    const scalarType = this.optionalScalarCsharpType(param);
                    if (scalarType !== undefined) {
                        return `${scalarType}? ${safeName} = null`
                    }
                    return `${paramType}? ${safeName}`
                }
            }
        } else {
            // generated ccxt types (Currencies, MarketInterface, ...) are C# structs (value
            // types) — an optional param can only default to null if declared nullable (CS1750)
            const isStructType = paramType !== 'object' && paramType !== 'string'
                && !paramType.startsWith('List<') && !paramType.startsWith('Dictionary<')
                && paramType !== 'BaseExchange' && paramType !== 'Exchange';
            if (isOptional) {
                if (param.initializer !== undefined) {
                        if (param.initializer === 'undefined' || param.initializer === '{}' || paramType === 'object') {
                            return isStructType ? `${paramType}? ${safeName} = null` : `${paramType} ${safeName} = null`
                        }
                        return `${paramType} ${safeName} = ${param.initializer.replaceAll("'", '"')}`
                }
            } else {
                return `${paramType} ${safeName}`
            }
        }
        return `${paramType}${op} ${safeName}`
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
            // 'load',
        ];
        // const allowedPrefixesWs = [
        //     ''
        // ]
        const blacklistMethods = [
            'fetch',
            'setSandBoxMode',
            'loadOrderBook',
            'fetchCurrencies',
            'loadMarketsHelper',
            'createNetworksByIdObject',
            'setMarketsFromExchange',
            'setLastRequest',
            'setLastRestRequestTimestamp',
            'setProperty',
            'setProxyAgents',
            'watch',
            'watchMultipleSubscription',
            'watchMultiple',
            'watchPrivate',
            'watchPublic',
            'setPositionsCache',
            'setPositionCache'
        ] // improve this later
        if (isWs) {
            if (methodName.indexOf('Snapshot') !== -1 || methodName.indexOf('Subscription') !== -1 || methodName.indexOf('Cache') !== -1) {
                return false;
            }
        }
        const isBlackListed = blacklistMethods.includes(methodName);
        const startsWithAllowedPrefix = allowedPrefixes.some(prefix => methodName.startsWith(prefix));
        return !isBlackListed && startsWithAllowedPrefix;
    }

    // the typed C# return of a core method, or '' when the method keeps `Task<object>`
    typedCoreType (methodName: string, isPredictionTier = false): string {
        const snapshot = SNAPSHOT_CORES[methodName];
        if (snapshot !== undefined) {
            return (isPredictionTier && snapshot.predictionType !== undefined) ? snapshot.predictionType : snapshot.type;
        }
        if (isPredictionTier && (methodName in PREDICTION_TYPED_CORES)) {
            return PREDICTION_TYPED_CORES[methodName];
        }
        return TYPED_CORES[methodName] ?? '';
    }

    // the To* helper that materialises a typed core's return, or the snapshot helper for
    // the live ws structures whose public shape is a `.Copy()` rather than a `new T(...)`
    typedCoreToHelper (methodName: string, isPredictionTier: boolean, csharpType: string): string {
        const snapshot = SNAPSHOT_CORES[methodName];
        if (snapshot !== undefined) {
            return (isPredictionTier && snapshot.predictionHelper !== undefined) ? snapshot.predictionHelper : snapshot.helper;
        }
        if (csharpType === 'Dictionary<string, object>') {
            return 'ccxt.BaseExchange.ToDict';
        }
        if (csharpType === 'List<Dictionary<string, object>>') {
            return 'ccxt.BaseExchange.ToDictList';
        }
        if (csharpType === 'Int64') {
            return 'ccxt.BaseExchange.ToInt64Value';
        }
        if (csharpType === 'string') {
            return 'ccxt.BaseExchange.ToStringValue';
        }
        return 'ccxt.BaseExchange.To' + this.typedCoreHelperSuffix (csharpType);
    }

    // the prediction tier is detected from the emitted content, not from `this.isPrediction`:
    // the recursive prediction pass and the main pass both reach these files, and only the text
    // reliably says which class hierarchy the method is being emitted into


    // `List<OrderBook>` -> `List<ccxt.OrderBook>`. Required because ccxt.pro declares its own
    // OrderBook / Trade classes, which would otherwise win name resolution inside pro files
    qualifyTypedCoreType (csharpType: string): string {
        if (csharpType.startsWith ('ccxt.')) {
            return csharpType; // SNAPSHOT_CORES already spell the fully qualified name
        }
        // raw / primitive core types are not ccxt. structs
        if (csharpType === 'Int64' || csharpType === 'string' || csharpType === 'Dictionary<string, object>' || csharpType === 'List<Dictionary<string, object>>') {
            return csharpType;
        }
        if (csharpType.startsWith ('List<') && csharpType.endsWith ('>')) {
            return 'List<ccxt.' + csharpType.substring (5, csharpType.length - 1) + '>';
        }
        return 'ccxt.' + csharpType;
    }

    // helper suffix used by ToXxx: `List<Order>` -> `OrderList`, `Ticker` -> `Ticker`
    typedCoreHelperSuffix (csharpType: string): string {
        if (csharpType.startsWith ('List<') && csharpType.endsWith ('>')) {
            return csharpType.substring (5, csharpType.length - 1) + 'List';
        }
        return csharpType;
    }

    // locates the terminating `;` of a `return <expr>;` statement starting at line `start`,
    // tolerating multi-line expressions by only stopping on a `;` outside brackets/strings
    collectReturnStatement (lines: string[], start: number): number[] {
        let depth = 0;
        let inString = false;
        for (let i = start; i < lines.length; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const ch = line[j];
                if (inString) {
                    if (ch === '\\') { j++; continue; }
                    if (ch === '"') { inString = false; }
                    continue;
                }
                if (ch === '"') { inString = true; continue; }
                if (ch === '/' && line[j + 1] === '/') { break; }
                if (ch === '(' || ch === '[' || ch === '{') { depth++; continue; }
                if (ch === ')' || ch === ']' || ch === '}') { depth--; continue; }
                if (ch === ';' && depth <= 0) { return [ i, j ]; }
            }
        }
        return [ start, lines[start].length ];
    }

    // the reverse helper for a typed core's shape: `List<Order>` -> `FromOrderList`, or ''
    // when the family is not invertible. Reflective pagination and any
    // `object x = await this.fetchOrders(...)` consumer reads dictionary keys off the
    // result, so a boxed struct has to be de-typed first.
    typedCoreFromHelper (csharpType: string): string {
        if (csharpType === 'Dictionary<string, object>') {
            return 'ccxt.BaseExchange.FromDict';
        }
        if (csharpType === 'List<Dictionary<string, object>>') {
            return 'ccxt.BaseExchange.FromDictList';
        }
        if (csharpType === 'Int64') {
            return 'ccxt.BaseExchange.FromInt64';
        }
        if (csharpType === 'string') {
            return 'ccxt.BaseExchange.FromStringValue';
        }
        const family = csharpType.startsWith ('List<') ? csharpType.slice (5, -1) : csharpType;
        if (!REVERSIBLE_FAMILIES.includes (family)) {
            return '';
        }
        return 'ccxt.BaseExchange.From' + this.typedCoreHelperSuffix (csharpType);
    }

    // finds the `)` closing the call that starts at `open` (the `(` index), skipping
    // string literals — generated argument lists carry `(`/`)` inside url templates
    matchingParen (line: string, open: number): number {
        let depth = 0;
        let inString = false;
        for (let i = open; i < line.length; i++) {
            const ch = line[i];
            if (inString) {
                if (ch === '\\') { i++; continue; }
                if (ch === '"') { inString = false; }
                continue;
            }
            if (ch === '"') { inString = true; continue; }
            if (ch === '(') { depth++; continue; }
            if (ch === ')') { depth--; if (depth === 0) { return i; } }
        }
        return -1;
    }

    // wraps every `await this.<typedCore>(...)` on one line in its From* helper, so a typed
    // struct never lands in an `object` local. Occurrences already funnelled through a
    // To*/From* helper, and the tail-call returns typeCores deliberately left bare, are skipped.
    wrapTypedCoreConsumers (line: string, names: string[], predictionTier: boolean, skipReturn: boolean): string {
        let out = line;
        for (const name of names) {
            const typedType = this.typedCoreType (name, predictionTier);
            if (typedType === '') {
                continue;
            }
            const needle = 'await this.' + name + '(';
            let from = 0;
            while (true) {
                const at = out.indexOf (needle, from);
                if (at === -1) {
                    break;
                }
                const before = out.substring (0, at);
                const close = this.matchingParen (out, at + needle.length - 1);
                if (close === -1) {
                    // a call spanning several lines is left alone rather than mangled;
                    // the runtime FromTyped dispatcher still de-types it if it is awaited reflectively
                    break;
                }
                if (/ccxt\.BaseExchange\.(To|From)\w+\($/.test (before) || (skipReturn && /^\s*return $/.test (before))) {
                    from = close;
                    continue;
                }
                const helper = this.typedCoreFromHelper (typedType);
                if (helper === '') {
                    // a non-invertible family (Tickers / Balances / OrderBook): leave the call
                    // exactly as it was before this pass. Those names are typed only where the
                    // wrapper conversion was the sole consumer, so nothing regresses; the
                    // analyzer refuses to ADD any such name that has consuming call sites.
                    from = close;
                    continue;
                }
                out = before + helper + '(' + out.substring (at, close + 1) + ')' + out.substring (close + 1);
                from = close + helper.length + 2;
            }
        }
        return out;
    }

    // rewrites every typed core so the generated core returns its typed shape:
    //   - the signature `Task<object> fetchOrder(` becomes `Task<Order>`
    //   - every return site inside it is funnelled through `BaseExchange.ToOrder(...)`,
    //     except a tail call to another already-typed core of the same shape
    //   - an untyped core returning a typed core needs the reverse conversion; only OHLCV has a
    //     lossless one, so any other family reaching that branch is a table bug and throws
    // every method name that may carry a typed return: the two TYPED_CORES tables plus the
    // ws snapshot cores, whose type differs per tier but is never ''
    typedCoreNames (): string[] {
        return Object.keys (TYPED_CORES)
            .concat (Object.keys (PREDICTION_TYPED_CORES).filter ((n) => !(n in TYPED_CORES)))
            .concat (Object.keys (SNAPSHOT_CORES).filter ((n) => !(n in TYPED_CORES)));
    }

    typeCores (content: string, predictionTier = this.isPrediction): string {
        const names = this.typedCoreNames ();
        if (!names.some (name => content.includes (' ' + name + '('))) {
            return content;
        }
        const lines = content.split ('\n');
        // void `Task` bodies (loadBalanceSnapshot, loadPositionsSnapshot) are visited too: they
        // consume typed cores into `object` locals and need the From* funnel like anyone else
        const sigRe = /^(\s*)public async (virtual|override) Task(?:<object>)? (\w+)\(/;
        const typedCallRe = new RegExp ('^await this\\.(' + names.join ('|') + ')\\(');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (!sig) {
                continue;
            }
            const [ , indent, modifier, methodName ] = sig;
            const isObjectTask = lines[i].indexOf (' Task<object> ') !== -1;
            const typedType = isObjectTask ? this.typedCoreType (methodName, predictionTier) : '';
            const isTyped = typedType !== '';
            // the method body ends at its closing brace, which is the first line indented exactly
            // like the signature — brace counting is unusable here because generated bodies carry
            // `{`/`}` inside string literals (url templates, json payloads)
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            if (isTyped) {
                lines[i] = `${indent}public async ${modifier} Task<${this.qualifyTypedCoreType (typedType)}> ${methodName}(` + lines[i].split (methodName + '(').slice (1).join (methodName + '(');
            }
            const tailOk: Record<number, boolean> = {};
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                if (!lines[j].trim ().startsWith ('return ')) {
                    continue;
                }
                const [ lastLine, semi ] = this.collectReturnStatement (lines, j);
                const head = lines[j].substring (lines[j].indexOf ('return ') + 7);
                const middle = lines.slice (j + 1, lastLine);
                const tail = lastLine === j ? '' : lines[lastLine].substring (0, semi);
                const expr = (lastLine === j ? head.substring (0, semi - lines[j].indexOf ('return ') - 7) : [ head ].concat (middle).concat ([ tail ]).join (' ')).trim ();
                const calledCore = typedCallRe.exec (expr);
                const calledType = calledCore ? this.typedCoreType (calledCore[1], predictionTier) : '';
                let wrapper = '';
                if (isTyped && calledType !== typedType) {
                    wrapper = this.typedCoreToHelper (methodName, predictionTier, typedType);
                } else if (!isTyped && calledType !== '') {
                    // an untyped core forwarding a typed one has to hand back the untyped shape
                    wrapper = this.typedCoreFromHelper (calledType);
                    if (wrapper === '') {
                        throw new Error (`typeCores: untyped ${methodName} returns typed core ${calledCore[1]} (${calledType}) — drop it from TYPED_CORES or add a From helper`);
                    }
                }
                if (wrapper === '') {
                    tailOk[j] = true;
                    j = lastLine;
                    continue;
                }
                const pad = lines[j].substring (0, lines[j].length - lines[j].trimStart ().length);
                const trailing = lines[lastLine].substring (semi + 1);
                lines[j] = `${pad}return ${wrapper}(${expr});${trailing}`;
                for (let k = j + 1; k <= lastLine; k++) {
                    lines[k] = null as any;
                }
                tailOk[j] = true;
                j = lastLine;
            }
            // every remaining `await this.<typedCore>(...)` in the body is a consuming site —
            // its result lands in an `object` local or a bigger expression, where a boxed
            // struct would read as null. Funnel those through the reverse From* helper.
            for (let j = bodyStart + 1; j < bodyEnd; j++) {
                if (lines[j] === null || lines[j].indexOf ('await this.') === -1) {
                    continue;
                }
                // a consuming call whose argument list spans several lines has to be joined
                // first, or matchingParen gives up and the boxed struct escapes untouched
                // (binance watchTicker -> `object tickers = await this.WatchTickers(` + 3 lines)
                let end = j;
                if (this.matchingParen (lines[j], lines[j].indexOf ('await this.')) === -1) {
                    const [ last ] = this.collectReturnStatement (lines, j);
                    if (last > j && last < bodyEnd) {
                        end = last;
                    }
                }
                if (end > j) {
                    const pad = lines[j].substring (0, lines[j].length - lines[j].trimStart ().length);
                    const joined = lines.slice (j, end + 1).map ((l, k) => (k === 0 ? l : l.trim ())).join (' ');
                    const wrapped = this.wrapTypedCoreConsumers (joined, names, predictionTier, tailOk[j] === true);
                    if (wrapped !== joined) {
                        lines[j] = pad + wrapped.trim ();
                        for (let k = j + 1; k <= end; k++) {
                            lines[k] = null as any;
                        }
                        j = end;
                        continue;
                    }
                }
                lines[j] = this.wrapTypedCoreConsumers (lines[j], names, predictionTier, tailOk[j] === true);
            }
            i = bodyEnd;
        }
        return lines.filter (line => line !== null).join ('\n');
    }

    // A typed core needs no PascalCase forwarding wrapper: the core itself carries the public
    // name. The key set matches typedCoreType(), which falls back to TYPED_CORES on the
    // prediction tier, so a single union map covers both hierarchies.
    pascalTypedCoreNames (predictionTier: boolean): Record<string, string> {
        const names = this.typedCoreNames ();
        const map: Record<string, string> = {};
        for (const name of names) {
            if (this.typedCoreType (name, predictionTier) !== '') {
                map[name] = name.charAt (0).toUpperCase () + name.slice (1);
            }
        }
        return map;
    }

    // renames every typed core (declaration + call site) to PascalCase, so the generated core
    // *is* the public API and createWrapper stops emitting a thin duplicate. Method-name string
    // literals are deliberately NOT touched: they double as `has`/`describe()` capability keys
    // (`"createOrder": true`) — reflective lookup resolves the case instead (ResolveMethod).
    pascalizeTypedCores (content: string, predictionTier = this.isPrediction, receivers = [ 'this.', 'base.' ], declarations = true): string {
        const map = this.pascalTypedCoreNames (predictionTier);
        if (declarations) {
            const declRe = /(public\s+(?:async\s+)?(?:virtual\s+|override\s+)?Task<[^\n]*?>\s+)(\w+)\(/g;
            content = content.replace (declRe, (whole, head, name) => (map[name] !== undefined ? head + map[name] + '(' : whole));
        }
        const escaped = receivers.map ((r) => r.replace (/[.*+?^${}()|[\]\\]/g, '\\$&')).join ('|');
        const callRe = new RegExp ('(' + escaped + ')(\\w+)\\(', 'g');
        content = content.replace (callRe, (whole, receiver, name) => (map[name] !== undefined ? receiver + map[name] + '(' : whole));
        return content;
    }

    // WS tests bind the unified methods STATICALLY, so unlike the REST tests they never pass
    // through invokeExchangeDynamically -> detypeForComparison and receive the raw struct.
    // `assert (exchange.isDictionary (response))` then sees a boxed Tickers/Ticker, not the
    // symbol-keyed dictionary the unified test asserts. Project on the TEST path only.
    detypeWsTypedCoreCalls (content: string): string {
        const map = this.pascalTypedCoreNames (false);
        const pascals = new Set<string> ();
        for (const name of Object.keys (map)) {
            // the snapshot cores hand back the live ws structure on purpose; the ws tests
            // already `.Copy()` them and assert on the book's own accessors
            if (!(name in SNAPSHOT_CORES)) {
                pascals.add (map[name]);
            }
        }
        const callRe = /await exchange\.(\w+)\(/g;
        let out = '';
        let last = 0;
        let match = callRe.exec (content);
        while (match !== null) {
            if (pascals.has (match[1])) {
                const open = match.index + match[0].length - 1;
                const close = this.matchingParen (content, open);
                if (close !== -1) {
                    out += content.slice (last, match.index);
                    out += 'detypeForComparison(' + content.slice (match.index, close + 1) + ')';
                    last = close + 1;
                    callRe.lastIndex = last;
                }
            }
            match = callRe.exec (content);
        }
        return out + content.slice (last);
    }

    // index of the `)` closing the `(` at `open`, skipping string and char literals
    matchingParen (content: string, open: number): number {
        let depth = 0;
        let i = open;
        while (i < content.length) {
            const ch = content[i];
            if (ch === '"' || ch === '\'') {
                const quote = ch;
                i += 1;
                while (i < content.length && content[i] !== quote) {
                    i += (content[i] === '\\') ? 2 : 1;
                }
            } else if (ch === '(') {
                depth += 1;
            } else if (ch === ')') {
                depth -= 1;
                if (depth === 0) {
                    return i;
                }
            }
            i += 1;
        }
        return -1;
    }

    // narrows the `object` parameters listed in CORE_STRING_ARGS to `string` on every
    // generated declaration. Positional, because the prediction tier renames the first
    // parameter (`symbol` -> `outcome`) while C# invariance is on types only.
    // merged view of both tables: position -> narrowed C# type, per method name
    coreArgTypes (methodName: string): Record<number, string> | undefined {
        const strings = CORE_STRING_ARGS[methodName];
        const numerics = CORE_NUMERIC_ARGS[methodName];
        if (strings === undefined && numerics === undefined) {
            return undefined;
        }
        const merged: Record<number, string> = {};
        for (const pos of strings || []) {
            merged[pos] = 'string';
        }
        for (const pos of Object.keys (numerics || {})) {
            merged[Number (pos)] = (numerics as any)[pos];
        }
        return merged;
    }

    // renames every free occurrence of `name` to `alias` inside a generated method body,
    // skipping string literals and member access (`.name`) so dictionary keys such as
    // "timeframe" and properties such as `this.timeframe` are left untouched.
    renameLocalInBody (body: string, name: string, alias: string): string {
        let out = '';
        let i = 0;
        while (i < body.length) {
            const ch = body[i];
            if (ch === '"' || ch === '\'') {
                const quote = ch;
                let j = i + 1;
                while (j < body.length) {
                    if (body[j] === '\\') { j += 2; continue; }
                    if (body[j] === quote) { j++; break; }
                    j++;
                }
                out += body.substring (i, j);
                i = j;
                continue;
            }
            if (/[A-Za-z_]/.test (ch)) {
                let j = i;
                while (j < body.length && /[\w]/.test (body[j])) {
                    j++;
                }
                const word = body.substring (i, j);
                const prev = out[out.length - 1];
                out += (word === name && prev !== '.') ? alias : word;
                i = j;
                continue;
            }
            out += ch;
            i++;
        }
        return out;
    }

    typeCoreArgs (content: string): string {
        const names = Object.keys (CORE_STRING_ARGS).concat (Object.keys (CORE_NUMERIC_ARGS));
        if (!names.some (name => content.includes (' ' + name + '('))) {
            return content;
        }
        const sigRe = /^(\s*)public (async )?(virtual|override) ([\w<>., ?]+) (\w+)\((.*)\)\s*$/;
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const sig = sigRe.exec (lines[i]);
            if (!sig) {
                continue;
            }
            const [ , indent, asyncKw, modifier, returnType, methodName, plist ] = sig;
            const positions = this.coreArgTypes (methodName);
            if (positions === undefined) {
                continue;
            }
            let bodyStart = i + 1;
            while (bodyStart < lines.length && lines[bodyStart].trim () !== '{') {
                bodyStart++;
            }
            if (bodyStart >= lines.length) {
                continue;
            }
            let bodyEnd = lines.length - 1;
            for (let j = bodyStart + 1; j < lines.length; j++) {
                if (lines[j] === indent + '}') { bodyEnd = j; break; }
            }
            const body = lines.slice (bodyStart + 1, bodyEnd).join ('\n');
            const params = this.splitCsharpParams (plist);
            const shadows: string[] = [];
            const renames: string[][] = [];
            let changed = false;
            for (const posKey of Object.keys (positions)) {
                const pos = Number (posKey);
                const targetType = positions[pos];
                const param = params[pos];
                if (param === undefined || !param.trimStart ().startsWith ('object ')) {
                    continue;
                }
                const paramName = param.split ('=')[0].trim ().split (/\s+/).pop () as string;
                // a body that assigns to the parameter cannot hold the narrowed type (the RHS
                // is `object`), so the body's uses are renamed to an `object` local seeded from
                // the parameter. The PUBLIC parameter keeps its original name and gains the
                // narrowed type — no `<name>Typed` appears in any signature. `ref name` counts
                // as an assignment: the helper mutates in place and needs an `object` slot.
                const reassigned = new RegExp ('(?<![\\w.])' + paramName + '\\s*(?:\\?\\?)?=(?!=)').test (body)
                    || new RegExp ('(?<![\\w.])(?:ref|out)\\s+' + paramName + '(?![\\w])').test (body);
                params[pos] = param.replace ('object ' + paramName, targetType + ' ' + paramName);
                if (reassigned) {
                    const alias = paramName + 'Var';
                    shadows.push (`${indent}    object ${alias} = ${paramName};`);
                    renames.push ([ paramName, alias ]);
                }
                changed = true;
            }
            if (!changed) {
                continue;
            }
            if (renames.length) {
                for (let k = bodyStart + 1; k < bodyEnd; k++) {
                    for (const [ name, alias ] of renames) {
                        lines[k] = this.renameLocalInBody (lines[k], name, alias);
                    }
                }
            }
            lines[i] = `${indent}public ${asyncKw || ''}${modifier} ${returnType} ${methodName}(${params.join (',')})`;
            if (shadows.length) {
                lines[bodyStart] = lines[bodyStart] + '\n' + shadows.join ('\n');
            }
            i = bodyEnd;
        }
        return lines.join ('\n');
    }

    // narrowing a core parameter to `string` breaks every intra-core call site that still
    // holds the value in an `object` local, so each such argument gets an explicit
    // `((string)expr)`. The value is a string by contract (the TS signature says so); the
    // cast only makes the existing assumption explicit to the C# compiler.
    castCoreArgCallSites (content: string, receivers = [ 'this.', 'base.' ]): string {
        const allNames = Object.keys (CORE_STRING_ARGS).concat (Object.keys (CORE_NUMERIC_ARGS).filter ((n) => !(n in CORE_STRING_ARGS)));
        for (const methodName of allNames) {
            const positions = this.coreArgTypes (methodName) as Record<number, string>;
            for (const receiver of receivers) {
                const needle = receiver + methodName + '(';
                let from = 0;
            for (;;) {
                const at = content.indexOf (needle, from);
                if (at === -1) {
                    break;
                }
                const before = content[at - 1];
                if (before !== undefined && /[\w.]/.test (before)) {
                    from = at + needle.length;
                    continue;
                }
                const open = at + needle.length - 1;
                const close = this.matchingParen (content, open);
                if (close === -1) {
                    from = at + needle.length;
                    continue;
                }
                const args = this.splitCsharpParams (content.substring (open + 1, close));
                let changed = false;
                for (const posKey of Object.keys (positions)) {
                    const pos = Number (posKey);
                    const targetType = positions[pos];
                    const arg = args[pos];
                    if (arg === undefined) {
                        continue;
                    }
                    const trimmed = arg.trim ();
                    if (trimmed === '') {
                        continue;
                    }
                    if (targetType === 'string') {
                        if (trimmed.startsWith ('(string)') || trimmed.startsWith ('((string)') || trimmed.startsWith ('"')) {
                            continue;
                        }
                        args[pos] = '((string)' + trimmed + ')';
                        changed = true;
                        continue;
                    }
                    // numeric: a direct unbox-cast of a boxed Int32 throws, so convert
                    const helper = (targetType === 'Int64?') ? 'ToInt64Arg'
                        : (targetType === 'Int64') ? 'ToInt64ArgRequired'
                            : (targetType === 'double?') ? 'ToDoubleArg' : 'ToDoubleArgRequired';
                    if (trimmed.startsWith (helper + '(') || trimmed.startsWith ('ccxt.BaseExchange.' + helper + '(')) {
                        continue;
                    }
                    args[pos] = 'ccxt.BaseExchange.' + helper + '(' + trimmed + ')';
                    changed = true;
                }
                const replacement = changed ? needle + args.join (',') + ')' : content.substring (at, close + 1);
                content = content.substring (0, at) + replacement + content.substring (close + 1);
                from = at + replacement.length;
                }
            }
        }
        return content;
    }

    // index of the `)` closing the `(` at `open`, skipping string literals and comments
    matchingParen (text: string, open: number): number {
        let depth = 0;
        for (let i = open; i < text.length; i++) {
            const ch = text[i];
            if (ch === '"') {
                i++;
                while (i < text.length && text[i] !== '"') {
                    if (text[i] === '\\') {
                        i++;
                    }
                    i++;
                }
                continue;
            }
            if (ch === '/' && text[i + 1] === '/') {
                while (i < text.length && text[i] !== '\n') {
                    i++;
                }
                continue;
            }
            if (ch === '(') {
                depth++;
            } else if (ch === ')') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    // top-level comma split of a C# parameter/argument list. Skips string and char
    // literals, whose embedded commas would otherwise shift every later position.
    splitCsharpParams (plist: string): string[] {
        const out: string[] = [];
        let depth = 0;
        let cur = '';
        for (let i = 0; i < plist.length; i++) {
            const ch = plist[i];
            if (ch === '"' || ch === '\'') {
                const quote = ch;
                let j = i + 1;
                while (j < plist.length) {
                    if (plist[j] === '\\') { j += 2; continue; }
                    if (plist[j] === quote) { j++; break; }
                    j++;
                }
                cur += plist.substring (i, j);
                i = j - 1;
                continue;
            }
            if (ch === '<' || ch === '(' || ch === '[' || ch === '{') {
                depth++;
            } else if (ch === '>' || ch === ')' || ch === ']' || ch === '}') {
                depth--;
            }
            if (ch === ',' && depth === 0) {
                out.push (cur);
                cur = '';
            } else {
                cur += ch;
            }
        }
        if (cur !== '') {
            out.push (cur);
        }
        return out;
    }

    unwrapTaskIfNeeded(type: string): string {
        return type.startsWith('Task<') && type.endsWith('>') ? type.substring(5, type.length - 1) : type;
    }

    unwrapListIfNeeded(type: string): string {
        return type.startsWith('List<') && type.endsWith('>') ? type.substring(5, type.length - 1) : type;
    }

    unwrapDictionaryIfNeeded(type: string): string {
        return type.startsWith('Dictionary<string,') && type.endsWith('>') ? type.substring(19, type.length - 1) : type;
    }

    createReturnStatement(methodName: string,  unwrappedType:string ) {
        // typed cores already return the struct/list (see typeCores), so the wrapper no longer
        // re-materialises it — it just forwards the typed core result
        if (this.typedCoreType (methodName, this.isPrediction) !== '') {
            return `return res;`;
        }
        // handle watchOrderBook exception here
        if (methodName.startsWith('watchOrderBook')) {
            // copy first to snapshot the live book, then reshape to the prediction structure for prediction venues
            return this.isPrediction ? `return new ccxt.PredictionOrderBook(((ccxt.pro.IOrderBook) res).Copy());` : `return ((ccxt.pro.IOrderBook) res).Copy();`; // return copy to avoid concurrency issues
        }
        if (methodName === 'watchOHLCVForSymbols') {
            return `return Helper.ConvertToDictionaryOHLCVList(res);`
        }

        // custom handling for now
        if (methodName === 'fetchTime'){
            return `return (Int64)res;`;
        }

        if (unwrappedType === 'double') {
            return `return (double)res;`;
        }

        // handle the typescript type Dict (and its nullable alias from TS >= 5/6 inference)
        if (unwrappedType === 'Dict' || unwrappedType === 'NullableDict') {
            return `return (Dictionary<string, object>)res;`;
        }

        const needsToInstantiate = !unwrappedType.startsWith('List<') && !unwrappedType.startsWith('Dictionary<') && unwrappedType !== 'object' && unwrappedType !== 'string' && unwrappedType !== 'float' && unwrappedType !== 'bool' && unwrappedType !== 'Int64';
        let returnStatement = "";
        if (unwrappedType.startsWith('List<')) {
            if (unwrappedType === 'List<Dictionary<string, object>>') {
                returnStatement = `return ((IList<object>)res).Select(item => (item as Dictionary<string, object>)).ToList();`
            } else if (unwrappedType === 'List<string>' || unwrappedType === 'List<String>') {
                // string is a primitive with no `new string(object)` constructor — cast each element instead
                returnStatement = `return ((IList<object>)res).Select(item => (item as string)).ToList();`
            } else {
                returnStatement = `return ((IList<object>)res).Select(item => new ${this.unwrapListIfNeeded(unwrappedType)}(item)).ToList<${this.unwrapListIfNeeded(unwrappedType)}>();`
            }
        } else if (unwrappedType.startsWith('Dictionary<string,') && unwrappedType !== 'Dictionary<string, object>' && !unwrappedType.startsWith('Dictionary')) {
            const type = this.unwrapDictionaryIfNeeded(unwrappedType);
            const returnParts = [
                `var keys = ((IDictionary<string, object>)res).Keys.ToList();`,
                `        var result = new Dictionary<string, ${type}>();`,
                `        foreach (var key in keys)`,
                `        {`,
                `            result[key] = new ${type}(((IDictionary<string,object>)res)[key]);`,
                `        }`,
                `        return result;`,
            ].join("\n");
            return returnParts;
        } else {
            returnStatement =  needsToInstantiate ? `return new ${unwrappedType}(res);` :  `return ((${unwrappedType})res);`;            ;
        }
        return returnStatement;
    }

    inden(level: number) {
        return '    '.repeat(level);
    }

    createWrapper (exchangeName: string, methodWrapper: any, isWs = false) {
        // non-async methods with a declared Promise<T> return type (pure delegators) must be wrapped like async ones
        const isAsync = methodWrapper.async || (methodWrapper.returnType ?? '').startsWith ('Promise');
        const methodName = methodWrapper.name;
        if (!this.shouldCreateWrapper(methodName, isWs)) {
            return ''; // skip aux methods like encodeUrl, parseOrder, etc
        }
        const methodNameCapitalized = methodName.charAt(0).toUpperCase() + methodName.slice(1);
        // a typed core is emitted PascalCase (pascalizeTypedCores), so it already *is* the public
        // API — a wrapper here would be a duplicate declaration of the same name
        if (isAsync && this.typedCoreType (methodName, this.isPrediction) !== '') {
            return '';
        }
        const returnType = this.convertJavascriptTypeToCsharpType(methodName, methodWrapper.returnType, true);
        const unwrappedType = this.unwrapTaskIfNeeded(returnType as string);
        // a typed core's wrapper is `return res;`, so the wrapper's own return type must be the
        // exact type the core emits — unqualified `OrderBook` binds to ccxt.pro.OrderBook here
        const typedCore = this.typedCoreType (methodName, this.isPrediction);
        const wrapperReturnType = (typedCore !== '' && isAsync) ? `Task<${this.qualifyTypedCoreType (typedCore)}>` : returnType;
        const args: any[] = methodWrapper.parameters.map((param: any) => this.convertJavascriptParamToCsharpParam(param));
        const stringArgs = args.filter(arg => arg !== undefined).join(', ');
        const params = methodWrapper.parameters.map((param: any) => this.safeCsharpName(param.name)).join(', ');

        const one = this.inden(1);
        const two = this.inden(2);
        const methodDoc = [] as any[];
        if (csharpComments[exchangeName] && csharpComments[exchangeName][methodName]) {
            methodDoc.push(csharpComments[exchangeName][methodName]);
        }
        const method = [
            `${one}public ${isAsync ? 'async ' : ''}${wrapperReturnType} ${methodNameCapitalized}(${stringArgs})`,
            `${one}{`,
            `${two}var res = ${isAsync ? 'await ' : ''}this.${methodName}(${params});`,
            `${two}${this.createReturnStatement(methodName, unwrappedType)}`,
            `${one}}`
        ];
        return methodDoc.concat(method).filter(e => !!e).join('\n')
    }

    createExchangesWrappers(): string[] {
        // in csharp classes should be Capitalized, so I'm creating a wrapper class for each exchange
        const res: string[] = ['// class wrappers'];
        exchangeIds.forEach(exchange => {
            const capitalizedExchange = exchange.charAt(0).toUpperCase() + exchange.slice(1);
            const capitalName = capitalizedExchange.replace('.ts','');
            const constructor = `public ${capitalName}(object args = null) : base(args) { }`
            res.push(`public class  ${capitalName}: ${exchange.replace('.ts','')} { ${constructor} }`)
        });
        return res;
    }

    createCSharpWrappers(exchange:string, path: string, wrappers: any[], ws = false, prediction = false) {
        // ast-transpiler drops the `= {}` default of a type-annotated params bag, which would
        // emit it as a required parameter sitting after optionals (CS1737)
        restoreParamsBagInitializers(wrappers);
        const wrappersIndented = wrappers.map(wrapper => this.createWrapper(exchange, wrapper, ws)).filter(wrapper => wrapper !== '').join('\n');
        const shouldCreateClassWrappers = exchange === 'BaseExchange';
        const classes = shouldCreateClassWrappers ? this.createExchangesWrappers().filter(e=> !!e).join('\n') : '';
        // const exchangeName = ws ? exchange + 'Ws' : exchange;
        const namespace = this.getNamespace (ws);
        const capitizedName = exchange.charAt(0).toUpperCase() + exchange.slice(1);
        // prediction REST exchanges are not part of createExchangesWrappers (Exchange.Wrappers.cs),
        // so their Capitalized wrapper class is emitted into their own wrapper file
        const needsCapitalizedClass = ws || this.isPrediction;
        const capitalizeStatement = needsCapitalizedClass ? `public class  ${capitizedName}: ${exchange} { public ${capitizedName}(object args = null) : base(args) { } }` : '';
        const file = [
            namespace,
            '',
            this.createGeneratedHeader().join('\n'),
            capitalizeStatement,
            `public partial class ${exchange}`,
            '{',
            wrappersIndented,
            '}',
            classes
        ].join('\n')
        log.magenta ('→', (path as any).yellow)

        overwriteFileAndFolder (path, file);
    }

    transpileErrorHierarchy (force = true) {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js'
        const errorHierarchyPath = __dirname + '/.' + errorHierarchyFilename

        if (skipUpToDateStage ('csharp', 'error hierarchy', force, [ errorHierarchyFilename ], [ ERRORS_FILE ])) {
            return;
        }

        let js = fs.readFileSync (errorHierarchyPath, 'utf8')

        js = this.regexAll (js, [
            // [ /export { [^\;]+\s*\}\n/s, '' ], // new esm
            [ /\s*export default[^\n]+;\n/g, '' ],
            // [ /module\.exports = [^\;]+\;\n/s, '' ], // old commonjs
        ]).trim ()

        const message = 'Transpiling error hierachy →'
        const root = errorHierarchy['BaseError']

        // a helper to generate a list of exception class declarations
        // properly derived from corresponding parent classes according
        // to the error hierarchy

        function intellisense (map: any, parent: any, generate: any, classes: any) {
            function* generator(map: any, parent: any, generate: any, classes: any): any {
                for (const key in map) {
                    yield generate (key, parent, classes)
                    yield* generator (map[key], key, generate, classes)
                }
            }
            return Array.from (generator (map, parent, generate, classes))
        }


        // CSHARP ----------------------------------------------------------------

        // ---------------------------------------------------------------------

        function csharpMakeErrorClassFile (name: string, parent: string) {
            const exception =
`   public class ${name} : ${parent}
    {
        public ${name}() : base() { }
        public ${name}(string message) : base(message) { }
        public ${name}(string message, ${parent} inner) : base(message, inner) { }
    }`;
            return exception
        }

            const csharpBaseError =
`   public class BaseError : Exception
    {
        public BaseError() : base() { }
        public BaseError(string message) : base(message) { }
        public BaseError(string message, Exception inner) : base(message, inner) { }
    }`;

        // const pythonExports = [ 'error_hierarchy', 'BaseError' ]
        const csharpBody = undefined;
        const csharpErrors = intellisense (root as any, 'BaseError', csharpMakeErrorClassFile, undefined)
        const csharpBodyIntellisense = '\nnamespace ccxt;\n' + this.createGeneratedHeader().join('\n') + '\n' + csharpBaseError + '\n' + csharpErrors.join ('\n') + '\n'
        const csharpFile = ""
        if (fs.existsSync (ERRORS_FILE)) {
            log.bright.cyan (message, (ERRORS_FILE as any).yellow)
            // const csharpRegex = /(?<=public partial class Exchange\n{)((.|\n)+)(?=})/g
            // replaceInFile (ERRORS_FILE, csharpRegex, csharpBodyIntellisense)
            overwriteFileAndFolder (ERRORS_FILE, csharpBodyIntellisense)
        }

        log.bright.cyan (message, (ERRORS_FILE as any).yellow)

    }

    // the method names declared directly in the second (`export default class Exchange extends
    // BaseExchange`) class of ts/src/base/Exchange.ts — the 62 symbol-based trading methods that the
    // fine split moved off BaseExchange onto the concrete Exchange tier
    getExchangeTierMethodNames (baseExchangeFile: string): Set<string> {
        const src = fs.readFileSync (baseExchangeFile, 'utf8');
        const markerIdx = src.indexOf ('export default class Exchange extends BaseExchange');
        const names = new Set<string> ();
        if (markerIdx === -1) {
            return names;
        }
        const body = src.substring (markerIdx);
        // top-level (4-space indented) method declarations only; deeper indentation = method bodies
        const re = /^ {4}(?:async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
        let m;
        while ((m = re.exec (body)) !== null) {
            names.add (m[1]);
        }
        return names;
    }

    // cut a whole transpiled C# method (plus a preceding /** */ doc-comment block, if any) out of
    // `body`, returning the remaining body and the removed method text (for relocation)
    stripCSharpMethod (body: string, name: string): { body: string, method: string } {
        const sigRe = new RegExp ('\\n([ \\t]*)public [^\\n]*\\b' + name + '\\s*\\(');
        const m = sigRe.exec (body);
        if (!m) {
            return { 'body': body, 'method': '' };
        }
        let start = m.index; // the '\n' just before the signature line
        const before = body.substring (0, start);
        const docMatch = before.match (/\n[ \t]*\/\*\*[\s\S]*?\*\/[ \t]*$/);
        if (docMatch) {
            start = docMatch.index as number;
        }
        // brace-match the method body
        let depth = 0;
        let end = body.indexOf ('{', m.index + m[0].length - 1);
        for (; end < body.length; end++) {
            const c = body[end];
            if (c === '{') {
                depth++;
            } else if (c === '}') {
                depth--;
                if (depth === 0) {
                    end++;
                    break;
                }
            }
        }
        const method = body.substring (start, end);
        const newBody = body.substring (0, start) + body.substring (end);
        return { 'body': newBody, 'method': method };
    }

    transpileBaseMethods(baseExchangeFile: string, force = true) {
        // the four generated base files all come out of this one pass; `exchanges.json`
        // is a real input too — createExchangesWrappers() emits one `public class <Id>`
        // per listed exchange into Exchange.Wrappers.cs, so adding an exchange must
        // invalidate this stage even when ts/src/base/Exchange.ts did not change
        if (skipUpToDateStage ('csharp', 'base methods', force, [
            baseExchangeFile,
            './ts/src/base/types.ts',
            './exchanges.json',
        ], [
            BASE_METHODS_FILE,
            BASE_TRADING_METHODS_FILE,
            GLOBAL_WRAPPER_FILE,
            GLOBAL_TRADING_WRAPPER_FILE,
        ])) {
            return;
        }
        const csharpExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        // to c#
        // const tsContent = fs.readFileSync (baseExchangeFile, 'utf8');
        // const delimited = tsContent.split (delimiter)
        const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
        const baseFile: any = this.transpiler.transpileCSharpByPath(strippedBaseFile);
        removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
        let baseClass = baseFile.content as any;// remove this later

        // the 62 symbol-based trading methods declared in TS `class Exchange extends BaseExchange`
        const exchangeTierNames = this.getExchangeTierMethodNames (baseExchangeFile);
        // loadOrderBook is hand-written on partial class Exchange (WsBridge.cs); drop the
        // transpiled copy. fetchOrderBook / fetchRestOrderBookSafe stay on the Exchange tier
        // so the prediction sibling can type fetchOrderBook as PredictionOrderBook (CS0508
        // if either name is declared on shared BaseExchange).
        const droppedOnBase = [ 'loadOrderBook' ];
        const retainedOnBase: string[] = [];
        const isExchangeTier = (methodName: string) => exchangeTierNames.has (methodName) && !retainedOnBase.includes (methodName) && !droppedOnBase.includes (methodName);

        // create wrappers with specific types — base-tier wrappers stay on BaseExchange (inherited by
        // both Exchange and the sibling PredictionExchange); the trading-tier wrappers land on the
        // concrete Exchange tier so PredictionExchange does NOT inherit the crypto-typed wrappers
        const allWrapperTypes = baseFile.methodsTypes || [];
        const baseTierWrapperTypes = allWrapperTypes.filter ((w: any) => !isExchangeTier (w.name));
        const exchangeTierWrapperTypes = allWrapperTypes.filter ((w: any) => isExchangeTier (w.name));
        this.createCSharpWrappers('BaseExchange', GLOBAL_WRAPPER_FILE, baseTierWrapperTypes)
        this.createCSharpWrappers('Exchange', GLOBAL_TRADING_WRAPPER_FILE, exchangeTierWrapperTypes)


        // custom transformations needed for c#
        // baseClass = baseClass.replaceAll("client.futures", "getValue(client, \"futures\")"); // tmp fix for c# not needed after ws-merge
        baseClass = baseClass.replace("((object)this).number = String;", "this.number = typeof(String);"); // tmp fix for c#
        baseClass = baseClass.replaceAll("client.resolve", "// client.resolve"); // tmp fix for c#
        baseClass = baseClass.replaceAll("((object)this).number = float;", "this.number = typeof(float);"); // tmp fix for c#
        baseClass = baseClass.replaceAll(/(\w+)(\.storeArray\(.+\))/gm, '($1 as ccxt.pro.IOrderBookSide)$2'); // tmp fix for c#
        
        // Fix setMarketsFromExchange parameter type — typed as BaseExchange so it lives on the base
        // tier (returning `this`) and accepts both Exchange and PredictionExchange source instances
        baseClass = baseClass.replaceAll(/public virtual object setMarketsFromExchange\(object sourceExchange\)/g, 'public virtual BaseExchange setMarketsFromExchange(BaseExchange sourceExchange)');
        // baseClass = baseClass.replace("= new List<Task<List<object>>> {", "= new List<Task<object>> {");
        // baseClass = baseClass.replace("this.number = Number;", "this.number = typeof(float);"); // tmp fix for c#
        baseClass = baseClass.replace("throw new getValue(broad, broadKey)(((string)message));", "this.throwDynamicException(broad, broadKey, message);"); // tmp fix for c#
        baseClass = baseClass.replace("throw new getValue(exact, str)(((string)message));", "this.throwDynamicException(exact, str, message);"); // tmp fix for c#
        // baseClass = baseClass.replace("throw new getValue(exact, str)(message);", "throw new Exception ((string) message);"); // tmp fix for c#


        // WS fixes
        baseClass = baseClass.replace(/\(object client,/gm, '(WebSocketClient client,');
        baseClass = baseClass.replace(/(object \w+) = client\.futures/gm, '$1 = (client as WebSocketClient).futures');

        baseClass = baseClass.replace(/Dictionary<string,object>\)client\.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures');
        baseClass = baseClass.replaceAll (/(\b\w*)RestInstance.describe/g, "(\(Exchange\)$1RestInstance).describe");

        const jsDelimiter = '// ' + delimiter
        const parts = baseClass.split (jsDelimiter)
        if (parts.length > 1) {
            const rest = parts[1];
            // parts[1] holds the BaseExchange methods below the delimiter, its closing brace, then the
            // whole transpiled `class Exchange : BaseExchange { ...62 trading methods... }`. Split the
            // two tiers apart: base methods go to Exchange.BaseMethods.cs (partial class BaseExchange),
            // the trading methods to Exchange.TradingMethods.cs (partial class Exchange).
            const exchangeClassMatch = /class Exchange\s*:\s*BaseExchange\s*\{/.exec (rest);
            let baseMethods = rest;
            let exchangeBody = '';
            if (exchangeClassMatch) {
                baseMethods = rest.substring (0, exchangeClassMatch.index); // BaseExchange methods + its closing }
                exchangeBody = rest.substring (exchangeClassMatch.index + exchangeClassMatch[0].length).replace (/\}\s*$/, ''); // Exchange class body
                // drop the hand-written-elsewhere method(s)
                for (const name of droppedOnBase) {
                    exchangeBody = this.stripCSharpMethod (exchangeBody, name).body;
                }
                // relocate the WS-bridge dependency methods back onto BaseExchange
                for (const name of retainedOnBase) {
                    const cut = this.stripCSharpMethod (exchangeBody, name);
                    exchangeBody = cut.body;
                    if (cut.method) {
                        baseMethods = baseMethods.replace (/\}\s*$/, cut.method + '\n}\n');
                    }
                }
            } else {
                // no second class (older single-class layout): keep prior behaviour
                baseMethods = rest.replace (/\s*class Exchange\s*:\s*BaseExchange\s*\{\s*\}\s*$/, '\n');
            }
            const fileHeader = this.getCsharpImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
                "public partial class BaseExchange\n{\n\n"
            ]).join("\n");
            const file = fileHeader + this.pascalizeTypedCores (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCores (baseMethods, false))), false) + "\n";
            fs.writeFileSync (csharpExchangeBase, file);
            log.green ('Transpiled base methods to', (csharpExchangeBase as any).yellow)
            if (exchangeClassMatch) {
                const tradingHeader = this.getCsharpImports(undefined).concat([
                    this.createGeneratedHeader().join('\n'),
                    "public partial class Exchange\n{\n\n"
                ]).join("\n");
                const tradingFile = tradingHeader + this.pascalizeTypedCores (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCores (exchangeBody, false))), false) + "\n}\n";
                fs.writeFileSync (BASE_TRADING_METHODS_FILE, tradingFile);
                log.green ('Transpiled trading methods to', (BASE_TRADING_METHODS_FILE as any).yellow)
            }
        }
    }

    transpilePredictionBaseMethods (predictionBaseFile = './ts/src/base/PredictionExchange.ts', force = true) {
        // PredictionExchange is the base class for prediction-market exchanges; it lives
        // in the ccxt namespace (like Exchange) and is transpiled the same way as the base
        const predictionBase = './cs/ccxt/base/PredictionExchange.cs';
        // PredictionExchange extends BaseExchange and returns prediction-typed wrappers,
        // so Exchange.ts and types.ts are inputs as well. Note a full run reaches this
        // twice (once from the recursive prediction pass, once from the main pass) —
        // the gate also makes the second call free.
        if (skipUpToDateStage ('csharp', 'prediction base methods', force, [
            predictionBaseFile,
            './ts/src/base/Exchange.ts',
            './ts/src/base/types.ts',
        ], [ predictionBase ])) {
            return;
        }
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'
        const baseFile: any = this.transpiler.transpileCSharpByPath(predictionBaseFile);
        let baseClass = baseFile.content as any;
        baseClass = baseClass.replaceAll(/(\w+)(\.storeArray\(.+\))/gm, '($1 as ccxt.pro.IOrderBookSide)$2');
        const jsDelimiter = '// ' + delimiter
        const parts = baseClass.split (jsDelimiter)
        if (parts.length > 1) {
            // fetchOrderBook lives on the Exchange / PredictionExchange siblings, not on
            // BaseExchange, so the prediction declaration is virtual (not override).
            const baseMethods = parts[1];
            const fields = [
                '    public PredictionExchange(object args = null) : base(args) {}',
                '',
                '    public object outcomes { get; set; } = null;',
                '    public object outcomes_by_id { get; set; } = null;',
                '    public object events { get; set; } = null;',
                '    public object events_by_slug { get; set; } = null;',
                '    public bool reloadingEvents { get; set; } = false;',
                '    public Task<object> eventsLoading { get; set; } = null;',
                '',
            ].join('\n')
            const fileHeader = this.getCsharpImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
                "public partial class PredictionExchange : BaseExchange\n{\n\n"
            ]).join("\n");
            // typed wrappers (Task<PredictionTrade> etc.) emitted as a second partial so a prediction
            // venue that does NOT override a unified method still exposes the prediction-typed signature
            // instead of inheriting the crypto-typed wrapper from Exchange.Wrappers.cs
            const prevIsPrediction = this.isPrediction;
            this.isPrediction = true;
            const typedWrappers = (baseFile.methodsTypes || []).map((w: any) => this.createWrapper('PredictionExchange', w)).filter((w: string) => w !== '').join('\n');
            this.isPrediction = prevIsPrediction;
            const wrapperPartial = '\n\npublic partial class PredictionExchange\n{\n' + typedWrappers + '\n}\n';
            const file = fileHeader + fields + this.pascalizeTypedCores (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCores (baseMethods, true))), true) + "\n" + wrapperPartial;
            fs.writeFileSync (predictionBase, file);
            this._predictionBaseWritten = true;
            log.green ('Transpiled prediction base methods to', (predictionBase as any).yellow)
        }
    }

    camelize(str: string) {
        var res =  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
          if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
          return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
        return res.replaceAll('-', '');
      }


    getCsharpExamplesWarning() {
        return [
            '',
            '    // !!Warning!! This example was automatically transpiled',
            '    // from the TS version, meaning that the code is overly',
            '    // complex and illegible compared to the code you would need to write',
            '    // normally. Use it only to get an idea of how things are done.',
            '    // Additionally always choose the typed version of the method instead of the generic one',
            '    // (e.g. CreateOrder (typed) instead of createOrder (generic)',
            ''
        ].join('\n')
    }

    transpileExamples () {
        return;
        // currently disabled!, the generated code is too complex and illegible
        const transpileFlagPhrase = '// AUTO-TRANSPILE //'

        const allTsExamplesFiles = fs.readdirSync (EXAMPLES_INPUT_FOLDER).filter((f) => f.endsWith('.ts'));
        for (const filenameWithExtenstion of allTsExamplesFiles) {
            const tsFile = path.join (EXAMPLES_INPUT_FOLDER, filenameWithExtenstion)
            let tsContent = fs.readFileSync (tsFile).toString ()
            if (tsContent.indexOf (transpileFlagPhrase) > -1) {
                const fileName = filenameWithExtenstion.replace ('.ts', '')
                log.magenta ('[C#] Transpiling example from', (tsFile as any).yellow)
                const csharp = this.transpiler.transpileCSharp(tsContent);

                const transpiledFixed = this.regexAll(
                    csharp.content,
                    [
                        [/object exchange/, 'Exchange exchange'],
                        [/async public Task example/gm, 'async public Task ' + this.camelize(fileName)],
                        [/(^\s+)object\s(\w+)\s=/gm, '$1var $2 ='],
                        [/^await.+$/gm, '']
                    ]
                )

                const finalFile = [
                    'using ccxt;',
                    'using ccxt.pro;',
                    'namespace examples;',
                    // this.getCsharpExamplesWarning(),
                    'partial class Examples',
                    '{',
                    transpiledFixed,
                    '}'
                ].join('\n');

                overwriteFileAndFolder (EXAMPLES_OUTPUT_FOLDER + fileName + '.cs', finalFile);
            }
        }
    }

    async transpileWS(force = false, prediction = false) {
        // prediction WS methods now live in the REST prediction classes (no ts/src/prediction/pro)
        if (prediction && !fs.existsSync ('./ts/src/prediction/pro')) {
            return;
        }
        const tsFolder = prediction ? './ts/src/prediction/pro/' : './ts/src/pro/';

        let inputExchanges =  process.argv.slice (2).filter (x => !x.startsWith ('--'));
        const scopedRun = inputExchanges.length > 0;
        if (inputExchanges === undefined) {
            inputExchanges = exchanges.ws;
        }
        if (prediction && (!inputExchanges || !inputExchanges.length)) {
            inputExchanges = predictionWsIds;
        }
        const csharpFolder = prediction ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_WS_FOLDER;
        const options = { csharpFolder, exchanges:inputExchanges }
        // const options = { csharpFolder: EXCHANGES_WS_FOLDER, exchanges:['bitget'] }
        if (scopedRun) {
            force = true; // a scoped run (CI `transpileCsSingle -- --ws <exchange>`) always writes, same as the REST path
        }
        this.isPrediction = prediction
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, true )
        this.isPrediction = false
    }

    async transpileEverything (force = false, baseOnly = false, examplesOnly = false, prediction = false) {

        let exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
        const csharpFolder = prediction ? EXCHANGES_PREDICTION_FOLDER : EXCHANGES_FOLDER
            , tsFolder = prediction ? './ts/src/prediction/' : './ts/src/'
            , exchangeBase = './ts/src/base/Exchange.ts'

        createFolderRecursively (csharpFolder)
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        if (prediction) {
            // a scoped run (e.g. `csharpTranspiler.ts binance`) carries regular ids in argv —
            // the prediction pass must not try to transpile those from ts/src/prediction/
            // (the files don't exist there)
            const predictionOnly = exchanges.filter ((x: string) => predictionIds.includes (x))
            if (exchanges.length && !predictionOnly.length) {
                return;
            }
            exchanges = predictionOnly.length ? predictionOnly : predictionIds;
        }
        const options = { csharpFolder, exchanges }

        if (!baseOnly && !examplesOnly) {
            this.isPrediction = prediction
            await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force)
            this.isPrediction = false
        }

        if (prediction) {
            // the venues override methods declared in the prediction base — regenerate it
            // in the same pass so a scoped prediction run can't leave the base stale
            this.transpilePredictionBaseMethods (undefined, force)
            log.bright.green ('Transpiled prediction exchanges successfully.')
            return;
        }

        this.transpileExamples(); // disabled for now

        if (examplesOnly) {
            return;
        }

        if (transpilingSingleExchange) {
            return;
        }

        // full builds also transpile the prediction-market exchanges (ts/src/prediction/)
        await this.transpileEverything (force, false, false, true)

        this.transpileBaseMethods (exchangeBase, force)

        // the recursive prediction pass above already regenerated PredictionExchange.cs from
        // the same inputs, so this second call would re-transpile and rewrite identical bytes
        if (!this._predictionBaseWritten) {
            this.transpilePredictionBaseMethods (undefined, force)
        }

        if (baseOnly) {
            return;
        }


        await this.transpileTests(force)

        this.transpileErrorHierarchy (force)

        log.bright.green ('Transpiled successfully.')
    }

    async webworkerTranspile (allFiles: any[], parserConfig: any) {

        // one shared pool — concurrent callers (base/exchange/ws tests) queue into the
        // same threads instead of each spawning their own full-size pool
        const maxThreads = csharpWorkerThreads ();
        if (!this.piscina) {
            this.piscina = new Piscina({
                filename: resolve(__dirname, 'csharp-worker.js'),
                maxThreads,
            });
        }
        const piscina = this.piscina;
        const configKey = JSON.stringify (parserConfig);

        // One file per task. `roots` is the FULL stage list on every task so each worker
        // builds ONE sticky ts.Program (build/worker-program-batch.js) and prints off it.
        const promises: any = [];
        const now = Date.now();
        for (const file of allFiles) {
            promises.push(piscina.run({transpilerConfig:parserConfig, configKey, roots: allFiles, files: [file]}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms');
        const flatResult: any[] = [];
        for (const chunk of workerResult) {
            flatResult.push (...chunk.result);
            // csharpComments lives on the main thread (the wrapper writer reads it), so
            // replay the raw comments the worker saw through the same transform
            for (const comment of chunk.comments) {
                this.transformLeadingComment (comment);
            }
        }
        return flatResult;
    }

    async transpilePrediction (force = false) {
        const ws = process.argv.includes ('--ws');
        const tsFolder = ws ? './ts/src/prediction/pro/' : './ts/src/prediction/';
        let inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
        if (inputExchanges === undefined || inputExchanges.length === 0) {
            inputExchanges = ws ? exchanges.predictionWs : exchanges.prediction;
        }
        const csharpFolder = ws ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_PREDICTION_FOLDER;
        const options = { csharpFolder, exchanges: inputExchanges }
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, ws, true)
    }

    async transpileDerivedExchangeFiles (jsFolder: string, options: any, pattern = '.ts', force = false, ws = false, prediction = false) {

        // todo normalize jsFolder and other arguments

        // exchanges.json accounts for ids included in exchanges.cfg
        let ids: string[] = []
        try {
            ids = (exchanges as any).ids
        } catch (e) {
        }

        const regex = new RegExp (pattern.replace (/[.*+?^${}()|[\]\\]/g, '\\$&'))

        // local file list — must NOT clobber the module-level `exchanges` (the parsed
        // exchanges.json), which this function reads `.ids` off of on the next call.
        // Assigning to it worked only because each stage ran in its own process;
        // --rest-and-ws reuses one.
        let exchangeFiles: string[]
        if (options.exchanges && options.exchanges.length) {
            exchangeFiles = options.exchanges.map ((x: string) => x + pattern)
        } else {
            exchangeFiles = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.ts'))))
        }

        // the wrapper folder is needed up front: a skipped exchange must have BOTH its
        // transpiled class and its wrapper already up to date
        const wrapperFolder = ws
            ? (this.isPrediction ? EXCHANGE_PREDICTION_WS_WRAPPER_FOLDER : EXCHANGE_WS_WRAPPER_FOLDER)
            : (this.isPrediction ? EXCHANGE_PREDICTION_WRAPPER_FOLDER : EXCHANGE_WRAPPER_FOLDER);

        // incremental gate (same rule as the Python/PHP pass in build/transpile.ts):
        // drop the exchanges whose output is newer than their ts source. This has to
        // happen BEFORE the pool is fed, because `allFilesPath` doubles as the sticky
        // ts.Program root list — leaving a clean exchange in it would transpile and
        // rewrite it anyway. `--force` (and any single-exchange run) keeps everything.
        exchangeFiles = filterDirtyExchangeFiles ('csharp', exchangeFiles, force, (file: string) => {
            const csName = file.replace ('.ts', '.cs');
            const outputs: string[] = [];
            if (options.csharpFolder) {
                outputs.push (options.csharpFolder + csName);
            }
            if (wrapperFolder) {
                outputs.push (wrapperFolder + csName);
            }
            return { 'tsPath': jsFolder + file, 'outputs': outputs };
        })

        if (!exchangeFiles.length) {
            return {}
        }

        // transpile using webworker
        const allFilesPath = exchangeFiles.map ((file: string) => jsFolder + file );
        log.blue('[csharp] Transpiling [', exchangeFiles.join(', '), ']');
        // a single exchange (scoped/debug run) is not worth a cold pool
        const transpiledFiles = (allFilesPath.length > 1)
            ? await this.webworkerTranspile (allFilesPath, this.getTranspilerConfig())
            : allFilesPath.map((file: string) => this.transpiler.transpileCSharpByPath(file));

        if (!ws) {
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchangeFiles[i].replace('.ts','');
                const path = wrapperFolder + exchangeName + '.cs';
                this.createCSharpWrappers(exchangeName, path, transpiled.methodsTypes)
            }
        } else {
            //
            for (let i = 0; i < transpiledFiles.length; i++) {
                const transpiled = transpiledFiles[i];
                const exchangeName = exchangeFiles[i].replace('.ts','');
                const path = wrapperFolder + exchangeName + '.cs';
                this.createCSharpWrappers(exchangeName, path, transpiled.methodsTypes, true)
            }
        }
        exchangeFiles.map ((file: string, idx: number) => this.transpileDerivedExchangeFile (jsFolder, file, options, transpiledFiles[idx], force, ws, prediction))

        const classes = {}

        return classes
    }

    createCSharpClass(csharpVersion: any, ws = false, prediction = false) {
        const csharpImports = this.getCsharpImports(csharpVersion, ws, prediction).join("\n") + "\n\n";
        let content = csharpVersion.content;

        const baseWsClassRegex = /class\s(\w+)\s+:\s(\w+)/;
        const baseWsClassExec = baseWsClassRegex.exec(content);
        const baseWsClass = baseWsClassExec ? baseWsClassExec[2] : '';
        const restNamespacePrefix = this.isPrediction ? 'ccxt.prediction.' : 'ccxt.';
        if (!ws) {
            // prediction exchanges extend PredictionExchange; both partial declarations
            // (api/ abstract and exchanges/ file) must agree on the base class
            content = content.replace(/class\s(\w+)\s:\s(\w+)/gm, (m, p1, p2) => `public partial class ${p1} : ${(this.isPrediction && p2 === 'Exchange') ? 'PredictionExchange' : p2}`);
        } else {
            const wsParent =  baseWsClass.endsWith('Rest') ? restNamespacePrefix + baseWsClass.replace('Rest', '') : baseWsClass;
            content = content.replace(/class\s(\w+)\s:\s(\w+)/gm, `public partial class $1 : ${wsParent}`);
        }
        content = content.replace(/binaryMessage.byteLength/gm, 'getValue(binaryMessage, "byteLength")'); // idex tmp fix
        // WS fixes
        if (ws) {
            const wsRegexes = this.getWsRegexes();
            content = this.regexAll (content, wsRegexes);
            content = this.replaceImportedRestClasses (content, csharpVersion.imports);
            const classNameRegex = /public\spartial\sclass\s(\w+)\s:\s(\w+)/gm;
            const classNameExec = classNameRegex.exec(content);
            const className = classNameExec ? classNameExec[1] : '';
            const constructorLine = `\npublic partial class ${className} { public ${className}(object args = null) : base(args) { } }\n`
            content = constructorLine  + content;
        } else if (this.isPrediction) {
            // prediction exchanges merge REST + WS in one class, so the WS transforms
            // (client → WebSocketClient, orderbook casts, append/resolve, ...) apply here too
            content = this.regexAll (content, this.getWsRegexes());
        }
        content = this.pascalizeTypedCores (this.castCoreArgCallSites (this.typeCoreArgs (this.typeCores (content))));
        content = this.createGeneratedHeader().join('\n') + '\n' + content;
        return csharpImports + content;
    }

    replaceImportedRestClasses (content: string, imports: any[]) {
        const restNamespacePrefix = this.isPrediction ? 'ccxt.prediction.' : 'ccxt.';
        for (const imp of imports) {
            // { name: "hitbtc", path: "./hitbtc.js", isDefault: true, }
            // { name: "bequantRest", path: "../bequant.js", isDefault: true, }
            const name = imp.name;
            if (name.endsWith('Rest')) {
                content = content.replaceAll(name, restNamespacePrefix + name.replace('Rest', ''));
            }
        }
        return content;
    }

    transpileDerivedExchangeFile (tsFolder: string, filename: string, options: any, csharpResult: any, force = false, ws = false, prediction = false) {

        const tsPath = tsFolder + filename

        const { csharpFolder } = options

        const csharpFilename = filename.replace ('.ts', '.cs')

        const tsMtime = fs.statSync (tsPath).mtime.getTime ()

        const csharp  = this.createCSharpClass (csharpResult, ws, prediction)

        if (csharpFolder) {
            overwriteFileAndFolder (csharpFolder + csharpFilename, csharp)
            // fs.utimesSync (csharpFolder + csharpFilename, new Date (), new Date (tsMtime))
        }
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsOrderbookTestsToCSharp (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.orderBook.ts';
        const csharpFile = `${outDir}/Ws/test.orderBook.cs`;

        if (skipUpToDateStage ('csharp', 'ws orderbook test', force, testStageInputs (), [ csharpFile ])) {
            return;
        }

        log.magenta ('Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        const splitParts = content.split('// --------------------------------------------------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// --------------------------------------------------------------------------------------------------------------------\n');
        content = this.regexAll (content, [
            [/typeof\((\w+)\)/g,'$1'], // tmp fix
            [/object\s*(\w+)\s=\sgetValue\((\w+),\s*"(bids|asks)".+/g,'var $1 = $2.$3;'], // tmp fix
            [ /object  = functions;/g, '' ], // tmp fix
            [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
            [/assert/g, 'Assert'],
        ]).trim ()

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '        ' + line).join ('\n');

        const file = [
            'using ccxt.pro;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n')

        log.magenta ('→', (csharpFile as any).yellow)

        overwriteFileAndFolder (csharpFile, file);
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsCacheTestsToCSharp (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.cache.ts';
        const csharpFile = `${outDir}/Ws/test.cache.cs`;

        if (skipUpToDateStage ('csharp', 'ws cache test', force, testStageInputs (), [ csharpFile ])) {
            return;
        }

        log.magenta ('Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        const splitParts = content.split('// ----------------------------------------------------------------------------');
        splitParts.shift();
        content = splitParts.join('\n// ----------------------------------------------------------------------------\n');
        content = this.regexAll (content, [
            [/typeof\((\w+)\)/g,'$1'], // tmp fix
            [/typeof\(timestampCache\)/g,'timestampCache'], // tmp fix
            [ /object  = functions;/g, '' ], // tmp fix
            [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
            [/assert/g, 'Assert'],
        ]).trim ()

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '        ' + line).join ('\n');

        const file = [
            'using ccxt.pro;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n')

        log.magenta ('→', (csharpFile as any).yellow)

        overwriteFileAndFolder (csharpFile, file);
    }

    // ---------------------------------------------------------------------------------------------

    transpileCryptoTestsToCSharp (outDir: string, force = true) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const csharpFile = `${outDir}/test.cryptography.cs`;

        if (skipUpToDateStage ('csharp', 'crypto test', force, testStageInputs (), [ csharpFile ])) {
            return;
        }

        log.magenta ('[csharp] Transpiling from', (jsFile as any).yellow)

        const csharp = this.transpiler.transpileCSharpByPath(jsFile);
        let content = csharp.content;
        content = this.regexAll (content, [
            [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
            [/assert/g, 'Assert'],
            // [/(^\s*Assert\(equals\(ecdsa\([^;]+;)/gm, '/*\n $1\nTODO: add ecdsa\n*/'] // temporarily disable ecdsa tests
        ]).trim ()

        const contentLines = content.split ('\n');
        const contentIdented = contentLines.map (line => '        ' + line).join ('\n');


        const file = [
            'using ccxt;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            'public partial class BaseTest',
            '{',
            contentIdented,
            '}',
        ].join('\n')

        log.magenta ('→', (csharpFile as any).yellow)

        overwriteFileAndFolder (csharpFile, file);
    }

    transpileExchangeTest(name: string, path: string): [string, string] {
        const csharp = this.transpiler.transpileCSharpByPath(path);
        let content = csharp.content;

        const parsedName = name.replace('.ts', '');
        const parsedParts = parsedName.split('.');
        const finalName = parsedParts[0] + this.capitalize(parsedParts[1]);

        content = this.regexAll (content, [
            [/assert/g, 'Assert'],
            [/object exchange/g, 'Exchange exchange'],
            [/function test/g, finalName],
        ]).trim ()

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
        ].join('\n')
        return [finalName, file];
    }

    async transpileExchangeTestsToCsharp() {
        const inputDir = './ts/src/test/exchange/';
        const outDir = GENERATED_TESTS_FOLDER;
        const ignore = [
            // 'exportTests.ts',
            // 'test.fetchLedger.ts',
            'test.throttler.ts',
            // 'test.fetchOrderBooks.ts', // uses spread operator
        ]

        const inputFiles = fs.readdirSync('./ts/src/test/exchange');
        const files = inputFiles.filter(file => file.match(/\.ts$/)).filter(file => !ignore.includes(file) );
        const transpiledFiles = files.map(file => this.transpileExchangeTest(file, inputDir + file));
        await Promise.all (transpiledFiles.map ((file, idx) => writeFile (outDir + file[0] + '.cs', file[1])));
    }

    async transpileBaseTestsToCSharp (force = true) {
        const outDir = BASE_TESTS_FOLDER;
        await this.transpileBaseTests(outDir, force);
        this.transpileCryptoTestsToCSharp(outDir, force);
        this.transpileWsCacheTestsToCSharp(outDir, force);
        this.transpileWsOrderbookTestsToCSharp(outDir, force);
    }

    async transpileBaseTests (outDir: string, force = true) {

        const baseFolders = {
            ts: './ts/src/test/base/',
        };

        let baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // filter out NO_AUTO_TRANSPILE files first, then transpile the rest through the
        // worker pool — the previous serial loop was ~1s per file and dominated the build
        const eligible = baseFunctionTests.filter ((testName) => {
            const tsContent = fs.readFileSync (baseFolders.ts + testName + '.ts').toString ();
            return !tsContent.includes ('// NO_AUTO_TRANSPILE');
        });

        // whole-stage gate: `paths` below doubles as the sticky ts.Program root list, so
        // this stage is skipped all-or-nothing rather than per file
        if (skipUpToDateStage ('csharp', 'base tests', force, testStageInputs (), eligible.map ((testName) => `${outDir}/${testName}.cs`))) {
            return;
        }

        const paths = eligible.map ((testName) => baseFolders.ts + testName + '.ts');
        const transpiled = await this.webworkerTranspile (paths, this.getTranspilerConfig ());

        for (let i = 0; i < eligible.length; i++) {
            const testName = eligible[i];
            const tsFile = baseFolders.ts + testName + '.ts';

            const csharpFile = `${outDir}/${testName}.cs`;

            log.magenta ('Transpiling from', (tsFile as any).yellow)

            const csharp = transpiled[i];
            let content = csharp.content;
            content = this.regexAll (content, [
                [/object  = functions;/g, '' ], // tmp fix
                [/assert/g, 'Assert'],
                [ /object exchange(?=[,)])/g, 'Exchange exchange' ],
                [ /\s*public\sobject\sequals(([^}]|\n)+)+}/gm, '' ], // remove equals
                [ /testSharedMethods\./gm, '' ], // deepEqual added
                // Match ArrayCache variables and cast to appropriate type based on variable name
                // Order matters: check most specific types first
                [/(\w*ArrayCacheBySymbolBySide\w*)\.hashmap/g, '(($1 as ArrayCacheBySymbolBySide).hashmap)'],
                [/(\w*ArrayCacheByTimestamp\w*)\.hashmap/g, '(($1 as ArrayCacheByTimestamp).hashmap)'],
                [/(\w*ArrayCacheBySymbolById\w*)\.hashmap/g, '(($1 as ArrayCacheBySymbolById).hashmap)'],
                // General ArrayCache pattern (must not match the specific types above)
                [/(\w+ArrayCache(?!BySymbolBySide|ByTimestamp|BySymbolById)\w*)\.hashmap/g, '(($1 as ArrayCache).hashmap)'],
                // Match stored/cached variables
                [/\bstored\.hashmap/g, '((stored as ArrayCache).hashmap)'],
                [/\bcached\.hashmap/g, '((cached as ArrayCache).hashmap)'],
            ]).trim ()

            const contentLines = content.split ('\n');
            const contentIdented = contentLines.map ((line: string) => '        ' + line).join ('\n');

            const file = [
                'using ccxt;',
                'using ccxt.pro;',
                'namespace Tests;',
                '',
                this.createGeneratedHeader().join('\n'),
                'public partial class BaseTest',
                '{',
                contentIdented,
                '}',
            ].join('\n')

            log.magenta ('→', (csharpFile as any).yellow)

            overwriteFileAndFolder (csharpFile, file);
        } 
    }

    capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    transpileMainTest(files: any) {
        log.magenta ('[csharp] Transpiling from', files.tsFile.yellow)
        let ts = fs.readFileSync (files.tsFile).toString ();

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
        ])

        const mainContent = ts;
        const csharp = this.transpiler.transpileCSharp(mainContent);
        // let contentIndentend = csharp.content.split('\n').map(line => line ? '    ' + line : line).join('\n');
        let contentIndentend = csharp.content;


        // ad-hoc fixes
        contentIndentend = this.regexAll (contentIndentend, [
            [ /object mockedExchange =/g, 'var mockedExchange =' ],
            // The shared static-test harness holds either a regular Exchange or a prediction
            // PredictionExchange (both extend BaseExchange, as siblings), so type the shared `exchange`
            // variable as the common base and drive the tested method by reflection. The legacy
            // request-builders that call a symbol-trading method (createOrder/fetchTicker) directly are
            // cast back to Exchange below — they run only against regular venues.
            [ /public virtual object initOfflineExchange/g, 'public virtual BaseExchange initOfflineExchange' ],
            [ /object exchange(?=[,)])/g, 'BaseExchange exchange' ],
            [ /object exchange =/g, 'BaseExchange exchange =' ],
            // the main live runner (initExchange (exchangeId, ...)) also serves prediction venues,
            // so it must STAY BaseExchange-typed — only the base-tests literal init is a real Exchange
            [ /BaseExchange exchange = (initExchange\("Exchange"[^;]*\))/g, 'Exchange exchange = ((Exchange)$1)' ],
            [ /BaseExchange exchange = this\.initOfflineExchange\(("[a-z]+")\)/g, 'Exchange exchange = ((Exchange)this.initOfflineExchange($1))' ],
            [ /testReturnResponseHeaders\(BaseExchange exchange\)/g, 'testReturnResponseHeaders(Exchange exchange)' ],
            [ /throw new Error/g, 'throw new Exception' ],
            [/class testMainClass/g, 'public partial class testMainClass'],
            // noImplicitAny bags: keep object so safeValue assignments typecheck
            [ /public (?:Dict|Dictionary<string, object>) skippedMethods\b/g, 'public object skippedMethods' ],
            [ /public (?:Dict|Dictionary<string, object>) checkedPublicTests\b/g, 'public object checkedPublicTests' ],
        ])

        // the legacy request-builders bind Exchange statically, so the typed cores'
        // PascalCase rename applies to their call sites too (declarations left alone)
        contentIndentend = this.pascalizeTypedCores (contentIndentend, false, [ 'exchange.' ], false);

        const file = [
            'using ccxt;',
            'namespace Tests;',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n')

        overwriteFileAndFolder (files.csharpFile, file);
    }

    transpileExchangeTests(force = true){
        const baseFolders = {
            ts: './ts/src/test/Exchange/',
            tsBase: './ts/src/test/Exchange/base/',
            csharpBase: EXCHANGE_BASE_FOLDER,
            csharp: EXCHANGE_GENERATED_FOLDER,
        };

        let baseTests = fs.readdirSync (baseFolders.tsBase).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        const exchangeTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        // ignore throttle test for now
        baseTests = baseTests.filter (filename => filename !== 'test.throttle');

        const tests = [] as any;
        baseTests.forEach (baseTest => {
            tests.push({
                base: true,
                name:baseTest,
                tsFile: baseFolders.tsBase + baseTest + '.ts',
                csharpFile: baseFolders.csharpBase + baseTest + '.cs',
            });
        });
        exchangeTests.forEach (test => {
            tests.push({
                base: false,
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                csharpFile: baseFolders.csharp + test + '.cs',
            });
        });

        // whole-stage gate — TestMethods.cs is included because transpileMainTest below
        // writes it from ./ts/src/test/tests.ts, which is part of testStageInputs()
        if (skipUpToDateStage ('csharp', 'exchange tests', force, testStageInputs (), [ BASE_TESTS_FILE ].concat (tests.map ((t: any) => t.csharpFile)))) {
            return;
        }

        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'csharpFile': BASE_TESTS_FILE,
        });

        return this.transpileAndSaveCsharpExchangeTests (tests);
    }

    transpileWsExchangeTests(force = true){

        const baseFolders = {
            ts: './ts/src/pro/test/Exchange/',
            csharp: EXCHANGE_GENERATED_FOLDER + 'Ws/',
        };

        const wsTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));

        const tests = [] as any;

        wsTests.forEach (test => {
            tests.push({
                name: test,
                tsFile: baseFolders.ts + test + '.ts',
                csharpFile: baseFolders.csharp + test + '.cs',
            });
        });

        if (skipUpToDateStage ('csharp', 'ws exchange tests', force, testStageInputs (), tests.map ((t: any) => t.csharpFile))) {
            return;
        }

        return this.transpileAndSaveCsharpExchangeTests (tests, true);
    }

    async transpileAndSaveCsharpExchangeTests(tests: any[], isWs = false) {
        const paths = tests.map(test => test.tsFile);
        const flatResult = await this.webworkerTranspile (paths, this.getTranspilerConfig());
        flatResult.forEach((file, idx) => {
            let contentIndentend = file.content.split('\n').map((line: string) => line ? '    ' + line : line).join('\n');

            let regexes = [
                // REST test functions serve BOTH tiers (regular Exchange and prediction
                // PredictionExchange are siblings under BaseExchange), so type the exchange
                // param as the common base and late-bind the unified-method calls through
                // `dynamic` — the DLR resolves them on the concrete tier at runtime.
                // WS tests only run against regular venues, keep them statically typed.
                [ /object exchange(?=[,)])/g, isWs ? 'Exchange exchange' : 'BaseExchange exchange' ],
                [ /throw new Error/g, 'throw new Exception' ],
                [/testSharedMethods\.assertTimestampAndDatetime\(exchange, skippedProperties, method, orderbook\)/, '// testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, orderbook)'], // tmp disabling timestamp check on the orderbook
                [ /void function/g, 'void'],
                [/(\w+)\.spawn\(([^,]+),(.+)\)/gm, '$1.spawn($2, new object[] {$3})'],
                // apply 'getPreTranspilationRegexes' here, bcz in CS we don't have pre-transpilation regexes
                [/exchange.jsonStringifyWithNull/g, 'json'],
            ];

            if (!isWs) {
                // REST tests hold the exchange as `BaseExchange`, so a unified call can bind
                // neither statically (prediction is a sibling tier) nor through `dynamic`:
                // the DLR picks the overload from the arguments' STATIC type, which is
                // `object`, so every narrowed core parameter (`string symbol`, `Int64? limit`)
                // is rejected with RuntimeBinderException. Route through the reflective helper
                // instead -- it resolves the PascalCase rename and coerces the boxed scalars.
                regexes = regexes.concat([
                    [ /await exchange\.(\w+)\(\s*\)/g, 'await invokeExchangeDynamically(exchange, "$1")' ],
                    [ /await exchange\.(\w+)\(/g, 'await invokeExchangeDynamically(exchange, "$1", ' ],
                ]);
            }

            if (isWs) {
                // add ws-tests specific regexes
                regexes = regexes.concat([
                    [/await exchange.watchOrderBook\(symbol\)/g, '((IOrderBook)(await exchange.watchOrderBook(symbol))).Copy()'],
                    [/await exchange.watchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.watchOrderBookForSymbols($1))).Copy()'],
                ]);
            }

            contentIndentend = this.regexAll (contentIndentend, regexes)
            if (isWs) {
                // WS tests bind the unified methods statically (no `dynamic` hop), so a core
                // parameter narrowed to `string` needs the same explicit cast the cores get
                contentIndentend = this.castCoreArgCallSites (contentIndentend, [ 'exchange.' ]);
                contentIndentend = this.pascalizeTypedCores (contentIndentend, false, [ 'exchange.' ], false);
                // must run last: it matches the PascalCase names the previous pass produced
                contentIndentend = this.detypeWsTypedCoreCalls (contentIndentend);
            }
            const namespace = isWs ? 'using ccxt;\nusing ccxt.pro;' : 'using ccxt;';
            const fileHeaders = [
                namespace,
                'namespace Tests;',
                '',
                this.createGeneratedHeader().join('\n'),
                '',
                'public partial class testMainClass : BaseTest',
                '{',
            ]
            let csharp: string;
            const filename = tests[idx].name;
            if (filename === 'test.sharedMethods') {
                const doubleIndented = contentIndentend.split('\n').map((line: string) => line ? '    ' + line : line).join('\n');
                csharp = [
                    ...fileHeaders,
                    `${this.iden(1)}public partial class SharedMethods`,
                    `${this.iden(1)}{`,
                    doubleIndented,
                    `${this.iden(1)}}`,
                    '}',
                ].join('\n');
            } else {
                contentIndentend = this.regexAll (contentIndentend, [
                    [ /public void/g, 'public static void' ], // make tests static
                    [ /async public Task/g, 'async static public Task' ], // make tests static
                    [ /public object /g, 'public static object ' ],
                ])
                csharp = [
                    ...fileHeaders,
                    contentIndentend,
                    '}',
                ].join('\n');
            }
            overwriteFileAndFolder (tests[idx].csharpFile, csharp);
        });
    }

    async transpileTests(force = true){
        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }
        const baseTestsOnly = process.argv.includes ('--baseTests')
        if (baseTestsOnly) {
            await this.transpileBaseTestsToCSharp(force);
            return;
        }

        // the three groups are independent — run them concurrently
        await Promise.all ([
            this.transpileBaseTestsToCSharp(force),
            this.transpileExchangeTests(force),
            this.transpileWsExchangeTests(force),
        ]);
    }
}

async function runMain () {
    const ws = process.argv.includes ('--ws')
    // bare prediction-only ids (e.g. `csharpTranspiler.ts kalshi`) auto-route to the
    // prediction namespace so scoped CI steps don't need to know it
    const cliExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
    const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every (x => predictionIds.includes (x) && !exchangeIds.includes (x))
    const prediction = process.argv.includes ('--prediction') || allArePredictionOnly
    const baseTestsOnly = process.argv.includes ('--baseTests')
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests')
    const examples = process.argv.includes ('--examples');
    const force = process.argv.includes ('--force')
    const baseClassOnly = process.argv.includes ('--baseClass')
    // single-process REST+WS (default via npm run transpileCS / CI): keeps the one
    // piscina pool (and its warm per-thread Transpilers) alive across both stages
    // instead of paying a second process boot + cold pool. Omit the flag for REST-only.
    const restAndWs = process.argv.includes ('--rest-and-ws')
    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true
    log.bright.green ({ force })
    const transpiler = new NewTranspiler ();
    const inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'))
    if (baseClassOnly) {
        transpiler.transpileBaseMethods ('./ts/src/base/Exchange.ts')
        transpiler.transpilePredictionBaseMethods ()
    } else if (restAndWs) {
        // same work as `transpileCS --force` followed by `transpileCSWs --force`, but on
        // one transpiler instance, so the single piscina pool (and its warm per-thread
        // Transpilers) survives into the ws stage instead of paying a second process
        // boot + cold pool. `npm run transpileCS` is the default full path; --ws stays ws-only.
        await transpiler.transpileEverything (force, false, examples, prediction)
        await transpiler.transpileWS (force)
        if (!inputExchanges.length) {
            // full ws builds also transpile the prediction ws exchanges
            await transpiler.transpileWS (force, true)
        }
    } else if (ws) {
        if (prediction) {
            await transpiler.transpileWS (force, true)
        } else {
            await transpiler.transpileWS (force)
            if (!inputExchanges.length) {
                // full ws builds also transpile the prediction ws exchanges
                await transpiler.transpileWS (force, true)
            }
        }
    } else if (test || baseTestsOnly) {
        await transpiler.transpileTests () 
    } else {
        await transpiler.transpileEverything (force, false, examples, prediction)
    }
}

if (isMainEntry(metaUrl)) {
    await runMain();
}
