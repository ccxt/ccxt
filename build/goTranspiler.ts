import Transpiler, { alignGoTrailingComments, installCcxtGoLocalTypes, installCcxtGoIndexableTypes, installCcxtGoParamTypes, installCcxtGoDictParams, installCcxtGoGb05ParamTypes, installCcxtGoGb11HandleErrorsCode, installCcxtGoSignTyping, CCXT_GO_HELPER_RETURN_TYPES, CCXT_GO_BOOL_METHOD_NAMES, CCXT_GO_STRING_PTR_METHOD_NAMES, hx10G06Check, g08w3Check, hx10w8GB01Check, hx10w8GB05Check, hx10w9GB11Check } from "ast-transpiler"; // go printer hooks live in ast-transpiler src/go (hx11 ast-move)
import path from 'path';
import errors from "../js/src/base/errors.js";
import { basename, resolve } from 'path';
import { createFolderRecursively, overwriteFile, checkCreateFolder } from './fsLocal.js';
import { writeOverloadStrippedFile, removeOverloadStrippedFile, restoreParamsBagInitializers } from './stripOverloads.js';
// import { writeFile } from 'fs/promises';
import { platform } from 'process';
import { spawnSync } from 'child_process';
import fs from 'fs';
import log from 'ololog';
import ansi from 'ansicolor';
import { goChanCarrierPass, goChanSelfTest } from './go-chan.js';
import { hx10G03Pass, hx10G03Check } from './hx10w2-G03.js';
import { hx10w6G11Pass, hx10w6G11Check } from './hx10w6-G11.js';
import { hx10w7G14Pass, hx10w7G14SelfTest } from './hx10w7-G14.js';
import { goErrValuePass, goErrSelfTest } from './go-err.js';
import { goChan3Pass, goChan3SelfTest } from './go-chan3.js';
import { goTickerCachePass, goTickerCacheSelfTest } from './go-ticker-cache.js';
import { g06MapReads, g06MapReadsSelfTest } from './hx10w2-G06.js';
import { g09Pass, g09Check } from './hx10w2-G09.js';
import { g09w3Pass, g09w3Check } from './hx10w3-G09.js';
import { hx10G10Pass, hx10G10SelfTest } from './hx10w2-G10.js';
import { hx10G02Pass, hx10w3G02SelfCheck } from './hx10w3-G02.js';
import { hx10w5G05Pass, g05check } from './hx10w5-G05.js';
import { b02TupleSliceSlotReads, b02TupleSliceSlotSelfTest } from './hx10w7-B02.js';
import { gp18Pass, gp18SetTableForTest, hx10w9Gp18SelfTest } from './hx10w9-GP18.js';  // hx10 wave-9 GP18: endpoint receive reads its typed view
import { hx10w8Gp08TuplePairBinds, hx10w8Gp08SelfTest } from './hx10w8-GP08.js';
import { gp14ParamGoType, gp14SelfTest } from './hx10w9-GP14.js';
import { gp28Stores, hx10w10Gp28Check, hx10w10Gp28Wired } from './hx10w10-GP28.js';  // hx10 wave-10 GP28: trades/orderbooks map-field stores
import { hx10w9Gp17TupleTwins, hx10w9Gp17ParamsSlotBinds, hx10w9Gp17SelfTest } from './hx10w9-GP17.js';
import { og02IdBookPass, og02IdBookCheck } from './hx10w6-OG02.js';
import { installHx11w8AsyncBool } from './hx11w8-async-bool.js';
import { hx11w8NonceInt64, hx11w8NonceInt64Check, hx11w8NonceLocals, hx11w8NonceLocalsCheck } from './hx11w8-nonce-int64.js';  // hx11 w8 m172: Nonce() is int64 end to end  // hx10 wave-6 OG02: id/nonce counters + last-response fields owned by the request book
import { hx10w4OG01Pass, hx10w4OG01Check } from './hx10w4-OG01.js';
import { hx10w4OG03Pass, og03selfcheck } from './hx10w4-OG03.js';
import { installHx11w8CorParams } from './hx11w8-cor-params.js';  // hx11 w8 printer-go-createorderrequest-params-typed
import { hx11w8JsonString, hx11w8JsonStringCheck } from './hx11w8-json-string.js';  // hx11 w8 m172: Json() is a string, no SafeStringPtr box
import { hx11w8EthEncodeBytes, hx11w8EthEncodeBytesCheck } from './hx11w8-eth-encode-bytes.js';  // hx11 w8: EthEncodeStructuredData locals are []uint8
import { hx11w8AnySliceToList, hx11w8AnySliceToListCheck } from './hx11w8-anyslice-tolist.js';  // hx11 w8: ToList-fed locals are []any
import { hx11w8JsonOrigin, hx11w8JsonOriginCheck } from './hx11w8-json-origin.js';  // hx11 w8: DerefScalar on JSON-origin list elements
import { hx11w8TickerReadPass, hx11w8TickerReadCheck } from './hx11w8-tickercache-typed-read.js';  // hx11 w8: typed ws ticker cache read
import { goStructReturnsPass, goStructReturnsSelfTest } from './go-struct-returns.js';
import { hx10w2G01MapReads, hx10w2G01Check } from './hx10w2-G01.js';
import { hx11w8BaseMapLocals, hx11w8BaseMapLocalsCheck } from './hx11w8-base-map-locals.js';  // hx11 w8: locals fed by base map-returning methods
import { hx11M43SafeDictLocals, hx11M43Check } from './hx11-m43-safedict-local.js';  // hx11 w8 M43: SafeDict-seeded locals are typed maps
import { hx10w10Gp26TypedReads, hx10w10Gp26Check } from './hx10w10-GP26.js';  // hx10 wave-10 GP26: GetValue on a declared map local
import {Transpiler as OldTranspiler } from "./transpile.js";
import errorHierarchy from '../js/src/base/errorHierarchy.js';
import Piscina from 'piscina';
import os from 'os';
import { isMainEntry } from "./transpile.js";
import { goGofmtBinarySpacing } from "./goGofmtLayout.js";
import { filterDirtyExchangeFiles, skipUpToDateStage, testStageInputs } from "./transpile.js";
import { goNativeArithmetic, g10kArithSelfTest, hx4G17SelfTest, hx4G18NativeCompare, hx4G18SelfTest, hx4G23Comparisons, hx4G23SelfTest, hx4G26SelfTest, hx4G27Comparisons, hx4G27SelfTest, hx4G30Arith, hx4G30SelfTest, hx4G31Divide, hx4G31Check, hx4G32Comparisons, hx4G32SelfTest, hx4G35InlineMulSub, hx4G35Check, hx4G36Inline, hx4G36Check, hx4G36AddImport, hx4G37InlineComparisons, hx4G37Check, hx4G40InlineIsEqual, hx4G40Check, hx11IsEqualBoolMethod, hx11IsEqualBoolMethodCheck, hx4G42InlineTypeChecks, hx4G42Check, hx5X26CaseAffix, hx5X26Check, hx4G45InlineStr, hx4G45Check, hx5X29ParseNative, hx5X29Check } from './go-native-arith.js';
import { hx10w2G04, g04Check } from './hx10w2-G04.js';
import { hx10OG02Pass, hx10OG02Check } from './hx10w4-OG02.js';  // hx10 wave-4 OG02: market tables published immutably
import { hx10OG05Pass, og05Check } from './hx10w7-OG05.js';  // hx10 w7 OG05: base/quote currencies + transactions published
import { hx10w2G05, hx10w2G05Check } from './hx10w2-G05.js';  // hx10w2 G05
import { G05_PROVEN_LIST_METHODS, g05Check, g05Locals } from './hx10w3-G05.js';  // hx10w3 G05: generated base return types
import { g02pass, g02check } from './hx10w2-G02.js';  // hx10 G02
import { emitHx10w2G07Native, hx10w2G07SelfCheck } from './hx10w2-G07.js';
import { hx10w3G07Pass, hx10w3G07Check } from './hx10w3-G07.js';
import { hx10G08TupleReads, hx10G08Check } from './hx10w2-G08.js';
import { g01SubsHandOff, g01SubsCheck } from './hx10w3-G01.js';  // hx10w3 G01
import { hx10w10GP24BaseImports, hx10w10GP24PruneImports, installHx10w10GP24BaseImportSeam, hx10w10GP24Check, hx10w10GP24Wired } from './hx10w10-GP24.js';  // hx10 w10 GP24: base-file stdlib import seam
import { hx10w3G10, g10SelfCheck } from './hx10w3-G10.js';  // hx10w3 G10
import { hx10w6G01BalanceOwner, hx10w6G01BalanceCheck, g01BalanceWired } from './hx10w6-G01.js';  // hx10 wave6 G01: typed balance account
import { hx10w9GB10BalanceWrites, hx10w9GB10Check, hx10w9GB10Wired } from './hx10w9-GB10.js';  // hx10 wave9 GB10: Balance stores
import { g01UrlsViews, g01Check } from './hx10w5-G01.js';  // hx10w5 G01: urls views
import { g04BookSides, g04BookSidesCheck, g04NativeBookReads, g04NativeBookReadsCheck } from './hx10w6-G04.js';  // hx10w6 G04: typed order-book side reads
import { hx10G15Pass, hx10G15Check } from './hx10w5-G15.js';  // hx10 wave5 G15
import { g21Pass, g21Check } from './hx10w5-G21.js';  // hx10 w5 G21: prediction-tier boxed locals
import { og03w6pass, og03w6SelfCheck, og03w6Wired } from './hx10w6-OG03.js';  // hx10 w6 OG03: registry reads ask the owner
import { og06SyncMapArmsPass, og06SelfCheck } from './hx10w7-OG06.js';  // hx10 w7 OG06: dead *sync.Map arms in the resolved map coercion
import { gb08Pass, gb08Check } from './hx10w8-GB08.js';  // hx10 w8 GB08: prediction-tier dead bounds guards
import { gp19Pass, gp19Check } from './hx10w9-GP19.js';  // hx10 w9 GP19: the same dead bounds guards in every go/v4 venue and pro file
import { hx10w8GO04Pass, hx10w8GO04Check } from './hx10w8-GO04.js';
import { hx11w8TM01Pass, hx11w8TM01Check } from './hx11w8-TM01.js';  // hx11 w8 TM01: a typed channel value is not boxed and rebuilt
  // hx10 w8 GO04: the typed FromMap builders take the boxed value
import { hx10w9GO05Pass, hx10w9GO05Check } from './hx10w9-GO05.js';  // hx10 w9 GO05: the last *sync.Map arms of the resolved map coercion
import { hx10w10GP27Pass, hx10w10GP27Check } from './hx10w10-GP27.js';  // hx10 w10 GP27: a ws core's resolved map/list coercion moves onto the shared watch channel

type dict = { [key: string]: string };

// required non-symbol string params (order ids, currency codes, addresses): merged into the table below
const GO_UNIFIED_REQUIRED_ID_PARAMS: { [method: string]: number[] } = {
    'fetchDepositAddress': [ 0 ], 'createDepositAddress': [ 0 ], 'fetchDepositAddressesByNetwork': [ 0 ],
    'fetchContractDepositAddress': [ 0 ], 'cancelOrderWs': [ 0 ], 'editOrderWs': [ 0 ], 'fetchOrderWs': [ 0 ],
    'cancelSpotOrder': [ 0 ], 'cancelContractOrder': [ 0 ], 'fetchOrderStatus': [ 0 ], 'editLimitOrder': [ 0 ],
    'editLimitBuyOrder': [ 0 ], 'editLimitSellOrder': [ 0 ], 'editOrderWithClientOrderId': [ 0 ],
    'fetchOrderWithClientOrderId': [ 0 ], 'cancelOrderWithClientOrderId': [ 0 ], 'createConvertTrade': [ 0, 1, 2 ],
    'fetchConvertQuote': [ 0, 1 ], 'fetchConvertTrade': [ 0 ], 'repayCrossMargin': [ 0 ], 'borrowCrossMargin': [ 0 ],
    'repayIsolatedMargin': [ 1 ], 'borrowIsolatedMargin': [ 1 ], 'repayMargin': [ 0 ], 'borrowMargin': [ 0 ],
    'fetchCrossBorrowRate': [ 0 ], 'fetchBorrowRate': [ 0 ], 'fetchDepositWithdrawFee': [ 0 ],
    'fetchTransactionFee': [ 0 ], 'fetchOptionChain': [ 0 ], 'createSubAccount': [ 0 ], 'fetchTransfer': [ 0 ],
    'fetchLedgerEntry': [ 0 ], 'withdrawWs': [ 0, 2 ], 'fetchOrdersByStatusWs': [ 0 ],
    'editOrder': [ 0 ], 'fetchOrder': [ 0 ], 'fetchOrderRequest': [ 0 ], 'fetchOrderTrades': [ 0 ], 'withdraw': [ 0 ],
    'transfer': [ 0, 2, 3 ], 'setMarginMode': [ 0 ],
    // required `code: string` currency-code params (every declaration in ts/src is a required string)
    'fetchBorrowRateHistory': [ 0 ], 'fetchVolatilityHistory': [ 0 ], 'futuresTransfer': [ 0 ], 'createGiftCode': [ 0 ],
    'transferIn': [ 0 ], 'transferOut': [ 0 ], 'fetchDepositMethods': [ 0 ], 'fetchNetworkDepositAddress': [ 0 ],
    'convertCurrencyNetwork': [ 0 ], 'transferBetweenMainAndSubAccount': [ 0 ], 'transferBetweenSubAccounts': [ 0 ],
    'deposit': [ 0, 2 ], 'fetchWithdrawAddresses': [ 0 ],
};

// hx10w9 GP13: the slice mirror of the string table below. These six ws methods take their
// symbols list as `string[]`/`string[][]` in ts/src, and the hand-written Go wrappers in
// go/v4/exchange_wrappers.go already declare `symbols []string` / `symbolsAndTimeframes [][]string`.
// The ast printer types the base and every override from this table and opens a call-site array
// literal as that slice (`[ sym ]` -> `[]string{sym}`), so `.length` becomes len().
// Only the unWatch half is proven: every call site of these two passes a literal the printer
// opens as the slice, and every venue override (or inherited base method) prints the same type.
// The watch* twins stay boxed: their wrapper symbols are `Str`/`this.symbol(..)` (an `any` box in
// Go) or a `*string` from a `safe*` reader, so a slice parameter would need a conversion call.
const GO_UNIFIED_SLICE_PARAMS: { [method: string]: { [index: number]: string } } = {
    'unWatchTradesForSymbols': { 0: '[]string' },
    'unWatchOrderBookForSymbols': { 0: '[]string' },
};

const GO_UNIFIED_STRING_PARAMS: { [method: string]: number[] } = {
    'createOrder': [ 0, 1, 2 ], 'createOrderWs': [ 0, 1, 2 ], 'createLimitOrder': [ 0, 1 ], 'createLimitOrderWs': [ 0, 1 ],
    'createMarketOrder': [ 0, 1 ], 'createMarketOrderWs': [ 0, 1 ], 'createMarketOrderWithCost': [ 0, 1 ],
    'createMarketOrderWithCostWs': [ 0, 1 ], 'createOrderWithTakeProfitAndStopLoss': [ 0, 1, 2 ],
    'createOrderWithTakeProfitAndStopLossWs': [ 0, 1, 2 ], 'createPostOnlyOrder': [ 0, 1, 2 ],
    'createPostOnlyOrderWs': [ 0, 1, 2 ], 'createReduceOnlyOrder': [ 0, 1, 2 ], 'createReduceOnlyOrderWs': [ 0, 1, 2 ],
    'createStopLimitOrder': [ 0, 1 ], 'createStopLimitOrderWs': [ 0, 1 ], 'createStopLossOrder': [ 0, 1, 2 ],
    'createStopLossOrderWs': [ 0, 1, 2 ], 'createStopMarketOrder': [ 0, 1 ], 'createStopMarketOrderWs': [ 0, 1 ],
    'createStopOrder': [ 0, 1, 2 ], 'createStopOrderWs': [ 0, 1, 2 ], 'createTakeProfitOrder': [ 0, 1, 2 ],
    'createTakeProfitOrderWs': [ 0, 1, 2 ], 'createTrailingAmountOrder': [ 0, 1, 2 ],
    'createTrailingAmountOrderWs': [ 0, 1, 2 ], 'createTrailingPercentOrder': [ 0, 1, 2 ],
    'createTrailingPercentOrderWs': [ 0, 1, 2 ], 'createTriggerOrder': [ 0, 1, 2 ], 'createTriggerOrderWs': [ 0, 1, 2 ],
    'createTwapOrder': [ 0, 1 ], 'sign': [ 0 ], 'handleErrors': [ 1, 2, 3, 5 ], 'calculateRateLimiterCost': [ 1, 2 ], 'editLimitOrder': [ 1, 2 ], 'editOrderWithClientOrderId': [ 1, 2, 3 ],
    'editOrderWs': [ 1, 2, 3 ], 'setTakeProfitAndStopLossParams': [ 1, 2 ], 'editLimitBuyOrder': [ 1 ],
    'editLimitSellOrder': [ 1 ], 'watchOHLCV': [ 0 ], 'unWatchOrderBook': [ 0 ], 'unWatchTrades': [ 0 ],
    'unWatchOHLCV': [ 0 ], 'unWatchTicker': [ 0 ], 'unWatchMarkPrice': [ 0 ], 'unWatchFundingRate': [ 0 ],
    'fetchOpenInterest': [ 0 ], 'fetchOpenInterestHistory': [ 0 ], 'createMarketBuyOrderWithCost': [ 0 ],
    'createMarketSellOrderWithCost': [ 0 ], 'addMargin': [ 0 ], 'reduceMargin': [ 0 ], 'closePosition': [ 0 ],
    'watchFundingRate': [ 0 ], 'fetchFundingInterval': [ 0 ], 'fetchMarketLeverageTiers': [ 0 ], 'fetchGreeks': [ 0 ],
    'fetchMarkPrice': [ 0 ], 'repayIsolatedMargin': [ 0 ], 'borrowIsolatedMargin': [ 0 ], 'fetchOption': [ 0 ],
    'fetchPositionsForSymbol': [ 0 ], 'fetchPositionsForSymbolWs': [ 0 ], 'watchMarkPrice': [ 0 ],
    'fetchPositionHistory': [ 0 ], 'fetchLiquidations': [ 0 ], 'watchLiquidations': [ 0 ], 'watchMyLiquidations': [ 0 ],
    'fetchOHLCVWs': [ 0 ], 'fetchIsolatedBorrowRate': [ 0 ], 'fetchTickerWs': [ 0 ], 'fetchOrderBookWs': [ 0 ],
    'fetchTradesWs': [ 0 ], 'fetchPositionWs': [ 0 ], 'fetchSpotOHLCV': [ 0 ], 'fetchContractOHLCV': [ 0 ],
    'fetchADLRank': [ 0 ], 'fetchPositionADLRank': [ 0 ], 'fetchMarkOHLCV': [ 0 ], 'fetchIndexOHLCV': [ 0 ],
    'fetchPremiumIndexOHLCV': [ 0 ], 'fetchL2OrderBook': [ 0 ], 'fetchL3OrderBook': [ 0 ], 'fetchLongShortRatio': [ 0 ],
    'createLimitBuyOrder': [ 0 ], 'createLimitSellOrder': [ 0 ], 'createMarketBuyOrder': [ 0 ],
    'createMarketSellOrder': [ 0 ], 'createLimitBuyOrderWs': [ 0 ], 'createLimitSellOrderWs': [ 0 ],
    'createMarketBuyOrderWs': [ 0 ], 'createMarketSellOrderWs': [ 0 ], 'fetchOrderBook': [ 0 ], 'fetchTicker': [ 0 ],
    'fetchOHLCV': [ 0 ], 'watchOrderBook': [ 0 ], 'watchTicker': [ 0 ], 'fetchTradingFee': [ 0 ], 'fetchFundingRate': [ 0 ],
    'checkRequiredArgument': [ 0, 2 ],
};
// required int params whose public typed wrapper already takes int64: body and Async print `int64`
// required boolean params that print `bool` on the base, every override and go/v4/exchange_interface.go
const GO_UNIFIED_BOOL_PARAMS: { [method: string]: number[] } = {
    'setSandboxMode': [ 0 ], 'enableDemoTrading': [ 0 ], 'setPositionMode': [ 0 ],
};
const GO_UNIFIED_INT64_PARAMS: { [method: string]: number[] } = {
    'setLeverage': [ 0 ], 'cancelAllOrdersAfter': [ 0 ],
};

for (const [method, indexes] of Object.entries (GO_UNIFIED_REQUIRED_ID_PARAMS)) {
    GO_UNIFIED_STRING_PARAMS[method] = [ ...new Set ([ ...(GO_UNIFIED_STRING_PARAMS[method] ?? []), ...indexes ]) ].sort ((x, y) => x - y);
}

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

// ast-transpiler emits every async method core as a trampoline over a capacity-1
// channel (ccxt/ast-transpiler#67): the function makes the channel, launches the body
// in a goroutine and returns the channel immediately, with an *unnamed* result:
//
//     func (this *Bit2cCore) FetchBalance(...) <-chan any {
//         ch := make(chan any, 1)
//         go this.fetchBalanceBody(ch)
//         return ch
//     }
//
//     func (this *Bit2cCore) fetchBalanceBody(ch chan any, ...) any {
//         defer close(ch)
//         defer ReturnPanicError(ch)
//         ...
//         ch <- value
//         return nil
//     }
//
// Buffering the channel and shaping the body are therefore the emitter's job now and
// CCXT no longer post-processes either. One thing the emitter does not do is stop a
// core after its first send.
//
// `try { ... return x } catch (e) { ... }` is emulated with a synthetic, immediately
// invoked closure, so the `return` inside it only leaves that *closure* — in TypeScript
// the same `return` leaves the whole async function. Execution therefore carries on
// round the enclosing retry loop and reaches a second `ch <-`; the channel holds one
// value, so that send blocks forever. Under the trampoline it parks the body goroutine
// rather than the caller, but it is still a leaked goroutine — and, worse, the loop has
// already re-issued the network request to get there.
//
// Four base methods have that shape today — Fetch2, FetchWebEndpoint,
// SafeDeterministicCall and FetchRestOrderBookSafe — each sending from inside a retry
// loop's try block. The guard threads a `chSent` flag through exactly those cores and
// leaves the body goroutine as soon as the closure produced a value, which is what the
// TypeScript said in the first place:
//
//     for … {                                     for … {
//         {                                           {
//             func(this *X) (ret_ any) {                  func(this *X) (ret_ any) {
//                 // try block:                               // try block:
//                 ch <- response                              ch <- response
//                 return nil                                  chSent = true
//             }(this)                                         return nil
//         }                                               }(this)
//     }                                               }
//                                                     if chSent {
//                                                         return nil
//                                                     }
//                                                 }
//
// `return nil` (not `return ch`) is the right early exit: it leaves the body closure,
// whose result type is `any`, and `defer close(ch)` still runs — the trampoline handed
// the channel to the caller long before.
//
// That also repairs a real bug the port has today, independent of the emitter: with
// `maxRetries` at its default 3, `SafeDeterministicCall` and `FetchRestOrderBookSafe`
// keep looping after a successful call and re-issue the request up to three times
// (measured: one call, three round trips). The caller only ever saw the first value, so
// the extra traffic was invisible. The guard makes the loop stop on success.
//
// Cores that send only at their own level — the vast majority — are left byte-identical,
// and any core whose shape is not fully understood is skipped, so a parse we do not
// fully trust degrades to exactly what ast-transpiler emitted.
//
// Everything here matches the *raw* emitted text: this runs before gofmt, which is what
// later normalises the 4-space indentation to tabs (`<-chan any` and the single-space
// signatures now come straight out of the printer, F04).
// The BODY half of a trampoline pair: `func (this *X) fetchTickerBody(ch chan any, …) any {`
// (or the package-level `func helperABody(ch chan any, …) any {`). The public trampoline
// itself is three statements and can never multi-send, so only the body is scanned.
const GO_CORE_SIGNATURE = /^func\s+(?:\([^()]*\)\s*)?[a-z_]\w*\s*\(ch chan\s+[^(),\n]+(?:,[^\n]*)?\)\s*any\s*\{$/;
const GO_CORE_CLOSE = /^([ \t]*)defer close\(ch\)$/;
// the panic helper is package-qualified in the prediction namespace (ccxt.ReturnPanicError)
const GO_CORE_PANIC = /^([ \t]*)defer (?:[A-Za-z_][A-Za-z0-9_.]*\.)?ReturnPanicError\(ch\)$/;
// generated cores are always top-level funcs, so the core ends at a brace in column 0
const GO_CORE_END = /^\}\s*$/;
const GO_CORE_SEND = /^ch\s*<-/;
const GO_FUNC_LITERAL = /\bfunc\s*(?:\([^()]*\))?\s*\(/g;
// the try/catch shim closes as an immediately-invoked literal, `}()` or `}(this)`
const GO_LITERAL_INVOKED = /^\}\s*\([^()]*\)\s*$/;
// the flag threaded through cores that send from inside such a shim
const GO_SENT_FLAG = 'chSent';
// the transpiler emits one tab per nesting level, exactly what gofmt writes back
const GO_INDENT_UNIT = '\t';

// drop string/rune literals and comments so brace counting and identifier lookups
// cannot be fooled by Go source quoted inside a literal or a comment. Block comments
// span lines (the transpiler copies JSDoc across verbatim), so the caller carries the
// open-comment state from one line to the next.
function stripGoLiterals (line: string, state?: { 'inBlockComment': boolean }): string {
    let stripped = '';
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (state !== undefined && state.inBlockComment) {
            if (char === '*' && line[i + 1] === '/') {
                state.inBlockComment = false;
                i++;
            }
            continue;
        }
        if (char === '/' && line[i + 1] === '*' && state !== undefined) {
            state.inBlockComment = true;
            i++;
            continue;
        }
        if (char === '/' && line[i + 1] === '/') {
            break;
        }
        if (char === '"' || char === '`' || char === '\'') {
            const quote = char;
            i++;
            while (i < line.length) {
                if (quote !== '`' && line[i] === '\\') {
                    i += 2;
                    continue;
                }
                if (line[i] === quote) {
                    break;
                }
                i++;
            }
            stripped += '""';
            continue;
        }
        stripped += char;
    }
    return stripped;
}

// Free helpers that normalize every argument with derefScalar at entry, so a *T boxed in
// an `any` reads there exactly like the plain value it points at. A DerefScalar() wrap at
// the assignment adds nothing when every read of that local goes through one of these.
const GO_POINTER_TRANSPARENT_SHIMS = new Set ([
    'IsEqual', 'EvalTruthy', 'Add', 'Subtract', 'Multiply', 'Divide', 'Mod', 'Negate', 'OpNeg', 'UnaryPlus',
    'IsGreaterThan', 'IsLessThan', 'IsGreaterThanOrEqual', 'IsLessThanOrEqual',
    'GetValue', 'GetArrayLength', 'GetLength', 'GetIndexOf', 'InOp', 'Contains', 'IsNil',
    'GetValue', 'ToString', 'ToLower', 'ToUpper', 'Trim', 'StartsWith', 'EndsWith', 'Replace', 'Split', 'Join', 'Slice',
    'JsonParse', 'JsonStringify', 'ParseInt', 'ParseFloat', 'ToFloat64',
    'MathFloor', 'MathCeil', 'MathRound', 'MathAbs', 'mathMin', 'mathMax', 'mathFloor', 'mathCeil', 'mathRound', 'mathAbs',
    'IsArray', 'IsString', 'IsInt', 'IsBool', 'IsNumber', 'IsObject', 'IsDictionary',
    'ObjectKeys', 'ObjectValues', 'derefScalar', 'DerefScalar',
]);

// the whole-argument names of a line that are passed to a pointer-transparent shim: the
// argument must BE the name (a `[]any{x}` or `Add(x, 1)` chunk carries/consumes it deeper
// and is not itself a shim boundary), and a `this.`/`x.` method of the same name is not
// the free function.
function goShimDirectArgumentNames (line: string): string[] {
    const names: string[] = [];
    const callPattern = /(?<![\w.])(?:ccxt\.)?([A-Za-z_]\w*)\s*\(/g;
    let match;
    while ((match = callPattern.exec (line)) !== null) {
        if (!GO_POINTER_TRANSPARENT_SHIMS.has (match[1])) {
            continue;
        }
        let depth = 1;
        let i = match.index + match[0].length;
        while (i < line.length && depth > 0) {
            if (line[i] === '(') {
                depth++;
            } else if (line[i] === ')') {
                depth--;
            }
            i++;
        }
        const args = line.substring (match.index + match[0].length, i - 1);
        let level = 0;
        let chunk = '';
        const chunks: string[] = [];
        for (const char of args) {
            if (char === '(') {
                level++;
            } else if (char === ')') {
                level--;
            }
            if (char === ',' && level === 0) {
                chunks.push (chunk);
                chunk = '';
                continue;
            }
            chunk += char;
        }
        chunks.push (chunk);
        for (const candidate of chunks) {
            const trimmed = candidate.trim ();
            if (/^[A-Za-z_]\w*$/.test (trimmed)) {
                names.push (trimmed);
            }
        }
    }
    return names;
}

// the line with the DerefScalar() wrapper (the name and its closing paren only) and the
// declaration/assignment target removed: the wrapped call's own arguments still read the
// local (`x = DerefScalar(this.SafeString(m, "k", x))`), so they must be scanned, not
// hidden behind the wrap.
function goDerefWrapReadText (line: string): string {
    let text = line;
    let index = text.indexOf ('DerefScalar(');
    while (index >= 0) {
        const open = index + 'DerefScalar'.length;
        let depth = 0;
        let close = -1;
        for (let i = open; i < text.length; i++) {
            if (text[i] === '(') {
                depth++;
            } else if (text[i] === ')') {
                depth--;
                if (depth === 0) {
                    close = i;
                    break;
                }
            }
        }
        if (close < 0) {
            break;
        }
        text = text.slice (0, index) + text.slice (open + 1, close) + text.slice (close + 1);
        index = text.indexOf ('DerefScalar(');
    }
    return text.replace (/^\s*(?:var\s+\w+\s+(?:any|[\w.\[\]\*]+)\s*=|[\w.\[\]]+\s*(?::=|=)(?!=))/, '');
}

// the line's right-hand side once the write target (`var x … =`, `x =`, `x :=`, `_ = x`)
// is removed; null when the line does not write the local. A write with a right side that
// reads the local again (`x = this.SafeString2(p, "k", x)`) keeps that read.
function goDerefWrapWriteRhs (line: string, name: string): string | null {
    const text = line.trim ();
    const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp ('^var ' + escaped + ' [\\w.\\[\\]\\*]+\\s*=(?!=)').test (text)) {
        return text.replace (new RegExp ('^var ' + escaped + ' [\\w.\\[\\]\\*]+\\s*='), '');
    }
    if (new RegExp ('^' + escaped + '\\s*:?=(?!=)').test (text)) {
        return text.replace (new RegExp ('^' + escaped + '\\s*:?=(?!=)'), '');
    }
    if (new RegExp ('^_\\s*=\\s*' + escaped + '$').test (text)) {
        return '';
    }
    return null;
}

// DerefScalar() exists so the `any` box carries the plain value: raw `x == nil`, `x != true`
// and `switch x` on the pointer box would never match. When every READ of the local in this
// body is a pointer-transparent shim call, nothing can observe the pointer and the wrap is
// provably redundant (the shims deref it themselves, #30054). Any other mention — a raw
// comparison, a dict/slice store, a return, an argument to a non-shim call, or a mention the
// scan cannot classify — keeps the wrap.
function goDerefWrapRedundantLocals (fn: string, wrapLines: Set<number>, names: Iterable<string>): Set<string> {
    const commentState = { 'inBlockComment': false };
    const lines = fn.split ('\n').map ((line) => stripGoLiterals (line, commentState));
    const redundant = new Set<string> ();
    for (const name of names) {
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        const mention = new RegExp ('(?<![\\w.])' + escaped + '(?![\\w])', 'g');
        let safe = true;
        for (let index = 0; index < lines.length; index++) {
            const wrapped = wrapLines.has (index);
            let text = wrapped ? goDerefWrapReadText (lines[index]) : lines[index];
            if (!wrapped) {
                const rhs = goDerefWrapWriteRhs (text, name);
                if (rhs !== null) {
                    text = rhs;
                }
            }
            const occurrences = (text.match (mention) || []).length;
            if (!occurrences) {
                continue;
            }
            const shimArgs = goShimDirectArgumentNames (text).filter ((candidate) => candidate === name).length;
            if (shimArgs === occurrences) {
                continue;
            }
            safe = false;
            break;
        }
        if (safe) {
            redundant.add (name);
        }
    }
    return redundant;
}

// the declaration form of the wrap the createGoExchange pass above adds is removed again for
// the locals the proof above accepts; the reassignment form is never added in the first place.
function goUnwrapDerefWraps (fn: string, names: Iterable<string>, safeCall: string): string {
    for (const name of names) {
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        fn = fn.replace (new RegExp ('(var ' + escaped + ' any = )(?:ccxt\\.)?DerefScalar\\(' + '(' + safeCall + ')' + '\\)', 'g'), '$1$2');
    }
    return fn;
}

// The printer prints `x === undefined` as a native `x == nil` when the operand's TypeScript
// type proves the box holds a scalar (goIsAnyBoxExpression). That proof is local to the
// function: a bare `any` PARAMETER (`func (this *X) F(code any, …)`) keeps whatever the
// caller boxed, and a caller holding a typed local (`var code *string = this.SafeString(…)`)
// boxes the pointer itself — `(*string)(nil) == nil` is false in Go, while IsEqual(x, nil)
// derefs both sides and answers true. The callee then takes the wrong branch: SafeCurrency()
// dropped the caller's currency for a response without a `currency` id and Currency() panicked
// on the empty code (binance fetchDepositAddress, STATIC_RESPONSE). GetArg-bound optionals are
// safe (GetArg runs derefScalar and folds a typed nil pointer into the default) and locals are
// proven by the printer's own write analysis, so only the bare parameters keep the helper.
function goParamNilCompareText (fn: string, isEqualFn: string): string {
    const sigEnd = fn.indexOf ('{');
    if (sigEnd < 0) {
        return fn;
    }
    const body = fn.slice (sigEnd);
    const paramMatches = fn.slice (0, sigEnd).match (/(\w+) any\b/g) || [];
    for (let i = 0; i < paramMatches.length; i++) {
        const name = paramMatches[i].split (/\s+/)[0];
        if ((name === 'this') || (name === 'optionalArgs') || (name === 'chan')) {
            continue;
        }
        // a defaulted parameter bound by GetArg (or its typed twin) is nil-comparable natively
        if (new RegExp ('(^|[\\s(])(?:var\\s+)?' + name + '\\s*(?::=|=)\\s*(?:ccxt\\.)?GetArg\\w*\\(').test (body)) {
            continue;
        }
        fn = fn.replace (new RegExp ('(?<![.\\w*"])' + name + ' (==|!=) nil\\b', 'g'), ((_m: string, op: string) => (op === '==') ? isEqualFn + name + ', nil)' : '!' + isEqualFn + name + ', nil)') as any);
    }
    return fn;
}

// whole-file form of goParamNilCompareText (same function blocks the DerefScalar pass walks)
export function goParamNativeNilCompares (content: string, isEqualFn: string): string {
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goParamNilCompareText (fn, isEqualFn)) as any);
}

// One level out from the caller-fed parameter above: a local `any` boxed from a method THIS FILE
// declares with a pointer result. The printer types a `Str` return as `*string`, so
// `var timeInForce any = this.ParseOrderTimeInForce(…)` (mexc.go) boxes the pointer itself, and
// the printer's own local proof (goAnyLocalHoldsPointer) only knows its helper-return table —
// it prints a native `timeInForce == nil`, false for `(*string)(nil)`, so the guard never runs
// and the parsed order loses its timeInForce (mexc createOrder, STATIC_RESPONSE: `[timeInForce]
// computed: <empty> stored: IOC/FOK`). The method's Go result type is read off the text being
// written (the only place that spells it) and IsEqual() derefs the box, which is the comparison
// master emitted. Resolved per function body: the same name can be a proven local elsewhere.
function goPointerReturnMethods (content: string): Set<string> {
    const methods = new Set<string> ();
    const signature = /\nfunc \(this \*[\w.]+\) (\w+)\([^)\n]*\) \*[\w.[\]]+ \{/g;
    let match: RegExpExecArray | null;
    while ((match = signature.exec (content)) !== null) {
        methods.add (match[1]);
    }
    return methods;
}

function goPointerLocalNilCompareText (fn: string, methods: Set<string>, isEqualFn: string): string {
    if (!methods.size) {
        return fn;
    }
    const sigEnd = fn.indexOf ('{');
    if (sigEnd < 0) {
        return fn;
    }
    const body = fn.slice (sigEnd);
    const callee = 'this\\.(?:Exchange\\.|BaseExchange\\.)?(?:' + Array.from (methods).join ('|') + ')\\(';
    const anyLocals = new Set ((fn.match (/var (\w+) any\b/g) || []).map ((decl: string) => decl.split (' ')[1]));
    const names = new Set<string> ();
    // the declaration and the reassignment form, the two shapes the printer's local proof reads
    const decl = new RegExp ('var (\\w+) any = ' + callee, 'g');
    const assign = new RegExp ('(?<![.\\w*"])(\\w+) = ' + callee, 'g');
    let match: RegExpExecArray | null;
    while ((match = decl.exec (body)) !== null) {
        if (anyLocals.has (match[1])) {
            names.add (match[1]);
        }
    }
    while ((match = assign.exec (body)) !== null) {
        if (anyLocals.has (match[1])) {
            names.add (match[1]);
        }
    }
    for (const name of names) {
        fn = fn.replace (new RegExp ('(?<![.\\w*"])' + name + ' (==|!=) nil\\b', 'g'), ((_m: string, op: string) => (op === '==') ? isEqualFn + name + ', nil)' : '!' + isEqualFn + name + ', nil)') as any);
    }
    return fn;
}

// whole-file form of goPointerLocalNilCompareText; the method table comes from the same text the
// pass rewrites, so every caller (base methods, prediction base, each exchange) is complete on
// its own file.
export function goPointerLocalNativeNilCompares (content: string, isEqualFn: string): string {
    const methods = goPointerReturnMethods (content);
    if (!methods.size) {
        return content;
    }
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goPointerLocalNilCompareText (fn, methods, isEqualFn)) as any);
}

// Self-test for the caller-fed `any` parameter rule: the bare parameter keeps the deref-aware
// helper, the GetArg-bound optional and the typed local keep the printer's native comparison,
// and a second application is a no-op.
function goParamNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goParamNativeNilCompares (text, 'IsEqual(');
    const param = pass ('\nfunc (this *X) f(currencyId any, optionalArgs ...any) any {\n\tif (currencyId == nil) {\n\t\treturn nil\n\t}\n\t_ = currencyId\n}\n');
    ok (param.indexOf ('if (IsEqual(currencyId, nil)) {') >= 0, 'a bare any parameter must keep the helper');
    ok (param.indexOf ('currencyId == nil') < 0, 'the native comparison must be gone');
    const negated = pass ('\nfunc (this *X) f(response any) any {\n\tif (response != nil) && (currency != nil) {\n\t\treturn response\n\t}\n}\n');
    ok (negated.indexOf ('!IsEqual(response, nil)') >= 0, 'the negated form must keep its operator');
    ok (negated.indexOf ('(currency != nil)') >= 0, 'a GetArg-bound optional keeps the native comparison');
    const typed = pass ('\nfunc (this *X) f(response any) any {\n\tvar code *string = this.SafeString(response, "code")\n\tif code != nil {\n\t\treturn code\n\t}\n\treturn nil\n}\n');
    ok (typed.indexOf ('if code != nil {') >= 0, 'a typed local keeps the native comparison');
    const twice = pass (pass ('\nfunc (this *X) f(response any) any {\n\tif (response == nil) || (response == nil) {\n\t\treturn nil\n\t}\n}\n'));
    ok (twice.indexOf ('IsEqual(IsEqual(') < 0, 'a second application must be a no-op');
    ok (twice.indexOf ('(IsEqual(response, nil)) || (IsEqual(response, nil))') >= 0, 'both operands of a duplicated check must be wrapped once');
    return problems;
}

// The same hazard reaches an `any` LOCAL, not only a bare parameter: the printer's proof
// (goAnyLocalHoldsPointer) recognises only a call to a `*T`-returning helper, so a local fed
// by a pointer-typed name is misread as a plain scalar and printed as the native
// `x == nil` -- false for the boxed (*string)(nil), so the guard never fires and the local
// keeps the pointer. `var currency any = requested` (requested: `var requested *string =
// this.SafeStringN(...)`) stored a nil info.currency instead of the 'USDT' default (mudrex
// fetchBalance, STATIC_RESPONSE; master's older pin printed IsEqual here and passed). IsEqual
// derefs both operands, so every local a pointer can reach keeps the helper.
const GO_POINTER_NAME_PATTERN = '\\*[\\w\\[\\].]+';

// the top-level `\nfunc ` blocks, each with the brace that closes it. The brace count skips
// string literals and line comments so a body carrying a func literal -- the
// `func (this *X) (ret any) {` shims -- cannot end its block early.
function goFuncBlockRanges (content: string): { start: number; end: number }[] {
    const ranges: { start: number; end: number }[] = [];
    let cursor = 0;
    while (true) {
        const start = content.indexOf ('\nfunc ', cursor);
        if (start < 0) {
            return ranges;
        }
        let depth = 0;
        let index = start;
        let end = content.length;
        while (index < content.length) {
            const char = content[index];
            if (char === '"') {
                index++;
                while (index < content.length) {
                    if (content[index] === '\\') { index++; } else if (content[index] === '"') { break; }
                    index++;
                }
            } else if (char === '`') {
                index++;
                while ((index < content.length) && (content[index] !== '`')) { index++; }
            } else if ((char === '/') && (content[index + 1] === '/')) {
                while ((index < content.length) && (content[index] !== '\n')) { index++; }
            } else if (char === '{') {
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0) { end = index + 1; break; }
            }
            index++;
        }
        ranges.push ({ start, end });
        cursor = end;
    }
}

// the names a pointer can reach inside one function block: the pointer-typed locals the
// local-typing families emit (`var x *string = ...`), the native `*T` parameters of the
// signature, and every `any` local declared or assigned from one of those, transitively.
function goBoxedPointerNames (fn: string): Set<string> {
    const pointerNames = new Set<string> ();
    let match: RegExpExecArray | null;
    const localRe = new RegExp ('var (\\w+) ' + GO_POINTER_NAME_PATTERN + ' = ', 'g');
    while ((match = localRe.exec (fn)) !== null) {
        pointerNames.add (match[1]);
    }
    const braceAt = fn.indexOf ('{');
    const signature = (braceAt < 0) ? fn : fn.slice (0, braceAt);
    const paramRe = new RegExp ('(\\w+) ' + GO_POINTER_NAME_PATTERN + '(?=[,)])', 'g');
    while ((match = paramRe.exec (signature)) !== null) {
        if (match[1] !== 'this') {
            pointerNames.add (match[1]);
        }
    }
    // every `any` box fed by one of those names: `var currency any = requested`, `x = code`.
    // Only the names declared `any` in this block (own declarations, `x := GetArg(...)` and the
    // bare `any` parameters of the signature) can hold the box: a name declared with a pointer
    // a typed GetArg twin's local is compared natively too, so it needs no rewrite
    const anyNames = new Set<string> ();
    const anyDeclRe = /var (\w+) any\b/g;
    while ((match = anyDeclRe.exec (fn)) !== null) {
        anyNames.add (match[1]);
    }
    const getArgRe = /(\w+) := GetArg\(/g;
    while ((match = getArgRe.exec (fn)) !== null) {
        anyNames.add (match[1]);
    }
    const bareParamRe = /(\w+) any\b/g;
    while ((match = bareParamRe.exec (signature)) !== null) {
        anyNames.add (match[1]);
    }
    const feeds: string[][] = [];
    const declRe = /var (\w+) any = (\w+)\b/g;
    while ((match = declRe.exec (fn)) !== null) {
        feeds.push ([ match[1], match[2] ]);
    }
    const assignRe = /(?:^|[\s;])(\w+) = (\w+)\b/g;
    while ((match = assignRe.exec (fn)) !== null) {
        feeds.push ([ match[1], match[2] ]);
    }
    const boxed = new Set<string> ();
    let grew = true;
    while (grew) {
        grew = false;
        for (let i = 0; i < feeds.length; i++) {
            const target = feeds[i][0];
            const source = feeds[i][1];
            if (boxed.has (target) || !anyNames.has (target)) {
                continue;
            }
            if (pointerNames.has (source) || boxed.has (source)) {
                boxed.add (target);
                grew = true;
            }
        }
    }
    return boxed;
}

// the boxed-pointer locals of one block keep the deref-aware comparison
function goBoxedPointerNilCompareText (fn: string, isEqualFn: string): string {
    const boxed = goBoxedPointerNames (fn);
    for (const name of boxed) {
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        fn = fn.replace (new RegExp ('(?<![.\\w*"])' + escaped + ' (==|!=) nil\\b', 'g'), ((_m: string, op: string) => (op === '==') ? isEqualFn + name + ', nil)' : '!' + isEqualFn + name + ', nil)') as any);
    }
    return fn;
}

// whole-file form: each block's rewrite is spliced back at its own offset, so a block whose
// text occurs twice cannot be rewritten in the wrong place.
export function goBoxedPointerNilCompares (content: string, isEqualFn: string): string {
    const ranges = goFuncBlockRanges (content);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const start = ranges[i].start;
        const end = ranges[i].end;
        const block = content.slice (start, end);
        const rewritten = goBoxedPointerNilCompareText (block, isEqualFn);
        if (rewritten !== block) {
            content = content.slice (0, start) + rewritten + content.slice (end);
        }
    }
    return content;
}

// Self-test: a local fed by a pointer-typed local or a native `*T` parameter keeps the
// helper, a box fed by a container keeps the native comparison, another block's rewrite
// cannot leak in, and a second application is a no-op.
function goBoxedPointerSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goBoxedPointerNilCompares (text, 'IsEqual(');
    const fed = pass ('\nfunc (this *X) f(optionalArgs ...any) any {\n\tvar requested *string = this.SafeStringN(optionalArgs, "currency")\n\tvar currency any = requested\n\tif currency == nil {\n\t\tcurrency = "USDT"\n\t}\n\treturn currency\n}\n');
    ok (fed.indexOf ('if IsEqual(currency, nil) {') >= 0, 'a local fed by a pointer-typed local must keep the helper');
    ok (fed.indexOf ('var requested *string = this.SafeStringN') >= 0, 'the pointer-typed local itself must stay native');
    const param = pass ('\nfunc (this *X) f(code *string) any {\n\tvar local any = code\n\tif local != nil {\n\t\treturn local\n\t}\n\treturn nil\n}\n');
    ok (param.indexOf ('if !IsEqual(local, nil) {') >= 0, 'a local fed by a native `*T` parameter must keep the helper');
    const plain = pass ('\nfunc (this *X) f(response any) any {\n\tvar data any = nil\n\tdata = this.SafeDict(response, "data", map[string]any{})\n\tif data == nil {\n\t\treturn nil\n\t}\n\treturn data\n}\n');
    ok (plain.indexOf ('if data == nil {') >= 0, 'a box fed by a container keeps the native comparison');
    const twice = pass (pass ('\nfunc (this *X) f() any {\n\tvar requested *string = this.SafeString("x", "y")\n\tvar currency any = requested\n\tif currency == nil {\n\t\treturn nil\n\t}\n\treturn currency\n}\n'));
    ok (twice.indexOf ('IsEqual(IsEqual(') < 0, 'a second application must be a no-op');
    ok (twice.indexOf ('if IsEqual(currency, nil) {') >= 0, 'the wrapped form must survive the second pass');
    const scoped = pass ('\nfunc (this *X) f() any {\n\tvar requested *string = this.SafeString("x", "y")\n\treturn nil\n}\n\nfunc (this *X) g() any {\n\tvar currency any = this.SafeString("x", "y")\n\tif currency == nil {\n\t\treturn nil\n\t}\n\treturn currency\n}\n');
    ok (scoped.indexOf ('if currency == nil {') >= 0, 'a block with no pointer feed must stay untouched');
    const literal = pass ('\nfunc (this *X) f() any {\n\tvar requested *string = this.SafeString("x", "y")\n\tvar identity any = requested\n\tvar myidentity any = identity\n\tif myidentity == nil {\n\t\treturn nil\n\t}\n\treturn myidentity\n}\n');
    ok (literal.indexOf ('if IsEqual(myidentity, nil) {') >= 0, 'a name must not be rewritten inside a longer identifier');
    return problems;
}

// IsEqual(x, nil) on a name declared once in the block as a map, []any, []string or scalar pointer is
// `x == nil`: derefScalar folds exactly those typed nils to nil. A `var x string` against a
// string literal is plain `==`. Any other or repeated declaration keeps the helper.
const GO_NIL_COMPARABLE_TYPES = new Set (['map[string]any', '[]any', '[]string', '*string', '*float64', '*int64', '*bool', '*int']);

function goTypedNilCompareText (fn: string, isEqualFn: string): string {
    const helper = isEqualFn.replace (/[.(]/g, '\\$&');
    const sigEnd = fn.indexOf ('{');
    if ((sigEnd < 0) || (fn.indexOf (isEqualFn) < 0)) {
        return fn;
    }
    const signature = fn.slice (0, sigEnd);
    const typeOf = (name: string): string | undefined => {
        const decls = fn.match (new RegExp ('\\bvar ' + name + ' ([^=\\n]+?) =', 'g')) || [];
        const bare = fn.match (new RegExp ('\\bvar ' + name + ' [^=\\n]+\\n', 'g')) || [];
        const rebinds = fn.match (new RegExp ('(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ', 'g')) || [];
        const inSignature = new RegExp ('[(,]\\s*' + name + ' ').test (signature);
        if ((decls.length !== 1) || bare.length || rebinds.length || inSignature) {
            return undefined;
        }
        return decls[0].slice (('var ' + name + ' ').length, -2).trim ();
    };
    return fn.replace (new RegExp ('(!?)(?<![.\\w])' + helper + '(\\w+), (nil|"[^"\\\\]*")\\)', 'g'), ((m: string, not: string, name: string, rhs: string) => {
        const type = typeOf (name);
        const exact = (rhs === 'nil') ? GO_NIL_COMPARABLE_TYPES.has (type) : (type === 'string');
        if (!exact) {
            return m;
        }
        return '(' + name + ((not === '!') ? ' != ' : ' == ') + rhs + ')';
    }) as any);
}

export function goTypedNativeNilCompares (content: string, isEqualFn: string): string {
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goTypedNilCompareText (fn, isEqualFn)) as any);
}

function goTypedNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goTypedNativeNilCompares (text, 'IsEqual(');
    const typed = pass ('\nfunc (this *X) f(p any) any {\n\tvar m map[string]any = SafeMapTyped(p, "a")\n\tvar s *string = this.SafeString(p, "b")\n\tvar t string = "spot"\n\tif !IsEqual(m, nil) && IsEqual(s, nil) && IsEqual(t, "swap") {\n\t\treturn m\n\t}\n\treturn nil\n}\n');
    ok (typed.indexOf ('if (m != nil) && (s == nil) && (t == "swap") {') >= 0, 'typed locals must compare natively: ' + typed);
    const other = pass ('\nfunc (this *X) f(p any, q map[string]any, r []string) any {\n\tvar a any = p\n\tvar l []map[string]any = nil\n\tvar n int = 1\n\tif IsEqual(a, nil) || IsEqual(l, nil) || IsEqual(n, nil) || IsEqual(q, nil) || IsEqual(r, nil) || IsEqual(p, "x") {\n\t\treturn nil\n\t}\n\treturn a\n}\n');
    ok (other.indexOf ('IsEqual(a, nil) || IsEqual(l, nil) || IsEqual(n, nil) || IsEqual(q, nil) || IsEqual(r, nil) || IsEqual(p, "x")') >= 0, 'any/[]map/int/params keep the helper');
    const strs = pass ('\nfunc (this *X) f(p any) any {\n\tvar s []string = this.MarketSymbols(p)\n\tif !IsEqual(s, nil) {\n\t\treturn s\n\t}\n\tif IsEqual(s, nil) {\n\t\treturn nil\n\t}\n\treturn nil\n}\n');
    ok ((strs.indexOf ('if (s != nil) {') >= 0) && (strs.indexOf ('if (s == nil) {') >= 0), '[]string locals compare natively: ' + strs);
    const strsRe = pass ('\nfunc (this *X) f(p any) any {\n\tvar s []string = nil\n\ts, ok := p.([]string)\n\tif IsEqual(s, nil) {\n\t\treturn ok\n\t}\n\treturn nil\n}\n');
    ok (strsRe.indexOf ('IsEqual(s, nil)') >= 0, 'a rebound []string keeps the helper');
    const shadow = pass ('\nfunc (this *X) f(p any) any {\n\tvar m map[string]any = nil\n\tif true {\n\t\tvar m any = p\n\t\t_ = m\n\t}\n\tm, ok := p.(map[string]any)\n\tif IsEqual(m, nil) {\n\t\treturn ok\n\t}\n\treturn nil\n}\n');
    ok (shadow.indexOf ('IsEqual(m, nil)') >= 0, 'a redeclared name keeps the helper');
    const ws = goTypedNativeNilCompares ('\nfunc (this *X) f(p any) any {\n\tvar l []any = nil\n\tif !ccxt.IsEqual(l, nil) {\n\t\treturn l\n\t}\n\treturn nil\n}\n', 'ccxt.IsEqual(');
    ok (ws.indexOf ('if (l != nil) {') >= 0, 'the package-qualified helper must be rewritten too');
    ok (pass (typed) === typed, 'a second application must be a no-op');
    return problems;
}

// IsEqual(x, nil) on an `any` local is `x == nil` unless the box can hold a nil scalar pointer,
// a typed-nil map/slice or a nil *sync.Map (derefScalar/IsEqual fold those to nil). Every write
// must come from a producer below that never yields one; any other write keeps the helper.
const GO_ANY_NIL_SAFE_CALLS = new Set ([
    'this.Extend', 'this.DeepExtend', 'this.Account', 'this.IndexBy', 'this.GroupBy', 'this.SortBy',
    'this.Milliseconds', 'this.Seconds', 'this.Uuid', 'this.Json', 'this.ParseToInt', 'this.Sum', 'this.ParseJson',
    'Add', 'Subtract', 'Multiply', 'Divide', 'mathMin', 'mathMax', 'ParseInt', 'GetArrayLength',
    'NewArrayCache', 'NewArrayCacheByTimestamp', 'NewArrayCacheBySymbolById', 'NewArrayCacheBySymbolBySide',
    // Go signature returns string/bool/int/int64/float64 (no exchange overrides the this.* ones)
    'Slice', 'Join', 'Replace', 'ToLower', 'ToUpper', 'ToString', 'NumberToString', 'PadStart', 'PadEnd', 'JsonStringify',
    'MathAbs', 'MathFloor', 'MathCeil', 'MathRound', 'MathPow', 'GetLength', 'IndexOf', 'GetIndexOf', 'InOp', 'IsArray',
    'Base64urlencode', 'this.Json', 'this.Strip', 'this.Capitalize', 'this.Ymd', 'this.Ymdhms', 'this.Yyyymmdd', 'this.Yymmdd',
    'this.ImplodeParams', 'this.ImplodeHostname', 'this.DecimalToPrecision', 'this.ParseTimeframe', 'this.Microseconds',
    // return untyped nil or a float64/int64/string value
    'MathMin', 'MathMax', 'ParseFloat', 'OpNeg', 'Iso8601',
]);
// SafeDict/SafeList* return a non-nil container or their default: safe with a nil/literal default
const GO_ANY_NIL_SAFE_DEFAULTED = new Set ([
    'this.SafeDict', 'this.SafeDict2', 'this.SafeDictN', 'this.SafeList', 'this.SafeList2', 'this.SafeListN',
]);
// DerefScalar folds these scalar-pointer results into a plain value or untyped nil
const GO_ANY_NIL_DEREF_INNER = /^this\.(?:Safe(?:String|Integer|Number|Float|Bool|Timestamp)\w*|SafeCurrencyCode|NumberToString|PriceToPrecision|AmountToPrecision|Iso8601|Parse8601)\(/;
const GO_ANY_NIL_SCALAR_TYPES = new Set (['string', 'int64', 'float64', 'bool', 'int']);

// the top-level comma-separated arguments of a call text starting at `open` ('('), or undefined
// when the call does not close exactly at the end of `text`
function goCallArgsSpanningText (text: string, open: number): string[] | undefined {
    const args: string[] = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            i++;
            while ((i < text.length) && (text[i] !== '"')) { if (text[i] === '\\') { i++; } i++; }
        } else if ((char === '(') || (char === '{') || (char === '[')) {
            depth++;
        } else if ((char === ')') || (char === '}') || (char === ']')) {
            depth--;
            if (depth === 0) {
                if (i !== text.length - 1) {
                    return undefined;
                }
                const last = text.slice (start, i).trim ();
                if (last.length) { args.push (last); }
                return args;
            }
        } else if ((char === ',') && (depth === 1)) {
            args.push (text.slice (start, i).trim ());
            start = i + 1;
        }
    }
    return undefined;
}

function goAnyNilSafeWrite (rhs: string, scalarLocals: Set<string>, safeLocal: (name: string) => boolean = () => false, stringSlices: Set<string> = new Set ()): boolean {
    const text = rhs.replace (/\bccxt\./g, '').replace (/\s+\/\/[^"]*$/, '').trim ();
    if (/^(?:nil|true|false|-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?|"(?:[^"\\]|\\.)*")$/.test (text)) {
        return true;
    }
    if (/^(?:map\[string\]any|\[\]any)\{/.test (text)) {
        const args = goCallArgsSpanningText (text, text.indexOf ('{'));
        return (args !== undefined) || !/\}\s*$/.test (text) && text.endsWith ('{');
    }
    if (/^\w+$/.test (text)) {
        return scalarLocals.has (text) || safeLocal (text);
    }
    // an endpoint receive's Raw is decoded JSON or untyped nil: no scalar pointer, no typed nil
    if (/^(?:r\d+|\(<-this\.\w+\(.*\)\))\.Raw$/.test (text) && (text.indexOf ('(<-') !== 0 || goCallArgsSpanningText (text.slice (3, -5), text.slice (3, -5).indexOf ('(')) !== undefined)) {
        return true;
    }
    // the ws subscriptions table (exchange_client.go) hands back a dereferenced scalar, a dictionary or nil
    if (/^[\w.()*\[\]]+\.(?:SubscriptionGet|SubscriptionDict|SubscriptionSafe|SubscriptionsSnapshot|FutureGet)\(.*\)$/.test (text)) {
        return true;
    }
    // Exchange.MyTrades only ever holds an ArrayCache* constructor result or an untyped nil (exchange.go, close()),
    // never a typed-nil pointer, so a local seeded from it compares natively
    if (text === 'this.MyTrades') {
        return true;
    }
    const call = /^((?:this\.)?\w+)\(/.exec (text);
    if (!call) {
        return false;
    }
    const args = goCallArgsSpanningText (text, call[0].length - 1);
    if (args === undefined) {
        return false;
    }
    if (call[1] === 'DerefScalar') {
        return (args.length === 1) && GO_ANY_NIL_DEREF_INNER.test (args[0]) && (goCallArgsSpanningText (args[0], args[0].indexOf ('(')) !== undefined);
    }
    if (GO_ANY_NIL_SAFE_CALLS.has (call[1])) {
        return true;
    }
    // an element of a []string is a string; out of range reads untyped nil
    if ((call[1] === 'GetValue') && (args.length === 2) && (stringSlices.has (args[0]) || /^Split\(/.test (args[0]) && (goCallArgsSpanningText (args[0], 5) !== undefined))) {
        return true;
    }
    if (hx4G16AnyNilSafeCall (call[1], args, (arg: string) => goAnyNilSafeWrite (arg, scalarLocals, safeLocal, stringSlices))) {
        return true;
    }
    if (GO_ANY_NIL_SAFE_DEFAULTED.has (call[1])) {
        const keys = (call[1].endsWith ('2')) ? 3 : 2;
        if (args.length <= keys) {
            return true;
        }
        return (args.length === keys + 1) && /^(?:nil|map\[string\]any\{\}|\[\]any\{\})$/.test (args[keys]);
    }
    return false;
}

function goAnyLocalNilCompareText (fn: string, isEqualFn: string): string {
    if (fn.indexOf (isEqualFn) < 0) {
        return fn;
    }
    // ws/prediction files get their `ccxt.` qualifier after this pass, so accept both spellings
    const helper = '(?:ccxt\\.)?' + isEqualFn.replace (/^ccxt\./, '').replace (/[.(]/g, '\\$&');
    const sigEnd = fn.indexOf ('{');
    const signature = fn.slice (0, sigEnd);
    const commentState = { 'inBlockComment': false };
    const lines = fn.split ('\n');
    const code = lines.map ((line) => stripGoLiterals (line, commentState));
    const scalarLocals = new Set<string> ();
    const stringSlices = new Set<string> ();
    for (const line of code) {
        const decl = /^\s*var (\w+) (\w+|\[\]string) = /.exec (line);
        if (decl && GO_ANY_NIL_SCALAR_TYPES.has (decl[2])) {
            scalarLocals.add (decl[1]);
        } else if (decl && (decl[2] === '[]string')) {
            stringSlices.add (decl[1]);
        }
    }
    for (const locals of [ scalarLocals, stringSlices ]) {
        for (const name of Array.from (locals)) {
            const count = code.filter ((line) => new RegExp ('(?<![.\\w])' + name + '\\b[^=\\n]*:=|\\bvar ' + name + ' ').test (line)).length;
            if ((count !== 1) || new RegExp ('[(,]\\s*' + name + ' ').test (signature)) {
                locals.delete (name);
            }
        }
    }
    const verdict = new Map<string, boolean> ();
    // `func() T {` .. `}()` written at line i: every return (no nested func) must be a safe write
    const invokedLiteralSafe = (rhs: string, i: number): boolean => {
        const head = /^func\(\) (\w+(?:\[\w+\]\w+)?|\[\]\w+) \{$/.exec (rhs.trim ());
        if (!head) {
            return false;
        }
        const indent = /^\s*/.exec (lines[i])[0];
        let returns = 0;
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j] === indent + '}()') {
                return (returns > 0) && (GO_ANY_NIL_SCALAR_TYPES.has (head[1]) || (head[1] === 'any'));
            }
            if (/\bfunc\b/.test (code[j])) {
                return false;
            }
            const ret = /^\s*return (.*)$/.exec (lines[j]);
            if (ret) {
                returns++;
                if (!GO_ANY_NIL_SCALAR_TYPES.has (head[1]) && !goAnyNilSafeWrite (ret[1], scalarLocals, provable, stringSlices)) {
                    return false;
                }
            } else if (/\breturn\b/.test (code[j])) {
                return false;
            }
        }
        return false;
    };
    const safeWrite = (rhs: string, i: number): boolean => goAnyNilSafeWrite (rhs, scalarLocals, provable, stringSlices) || invokedLiteralSafe (rhs, i) || hx4G16OmitOfTypedMap (rhs, fn);
    const provable = (name: string): boolean => {
        if (verdict.has (name)) {
            return verdict.get (name);
        }
        // a cycle through another local stays unproven
        verdict.set (name, false);
        let ok = !new RegExp ('[(,]\\s*' + name + ' ').test (signature);
        let decls = 0;
        const mention = new RegExp ('(?<![.\\w])' + name + '(?!\\w)');
        for (let i = 0; ok && (i < lines.length); i++) {
            const line = code[i];
            if (!mention.test (line)) {
                continue;
            }
            const decl = new RegExp ('^\\s*var ' + name + ' any(?: = (.*))?$').exec (line);
            if (decl) {
                decls++;
                const raw = new RegExp ('^\\s*var ' + name + ' any = (.*)$').exec (lines[i]);
                ok = (decl[1] === undefined) || ((raw !== null) && safeWrite (raw[1], i));
                continue;
            }
            if (new RegExp ('&' + name + '\\b|(?<![.\\w])' + name + '\\s*(?:\\+\\+|--|[-+*/%|&^]=|:=)|\\bvar ' + name + '\\b|,\\s*' + name + '\\s*(?:,[^=\\n]*)?:?=[^=]|(?<![.\\w])' + name + '\\s*,[\\w\\s,]*:?=[^=]|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ').test (line)) {
                ok = false;
                continue;
            }
            const write = new RegExp ('^\\s*' + name + ' = (.*)$').exec (lines[i]);
            if (write) {
                ok = safeWrite (write[1], i);
                continue;
            }
            if (new RegExp ('(?<![.\\w=!<>])' + name + '\\s*=[^=]').test (line)) {
                ok = false;
            }
        }
        ok = ok && (decls === 1);
        verdict.set (name, ok);
        return ok;
    };
    return fn.replace (new RegExp ('(!?)(?<![.\\w])' + helper + '(\\w+), nil\\)', 'g'), ((m: string, not: string, name: string) => {
        if (!provable (name)) {
            return m;
        }
        return '(' + name + ((not === '!') ? ' != nil)' : ' == nil)');
    }) as any);
}

// `P && P` / `P || P` over one ident (TS `x !== undefined && x !== null`) is one Go nil test; vet
// rejects the duplicate. A helper/native pair folds only where the helper side absorbs the other.
export function goCollapseDuplicateNilCompares (text: string, isEqualFn: string): string {
    const helper = '(?:ccxt\\.)?' + isEqualFn.replace (/^ccxt\./, '').replace (/[.(]/g, '\\$&');
    const side = '(\\(*)(?:(!?)' + helper + '(\\w+), nil\\)|(\\w+) ([!=])= nil)(\\)*)';
    const pattern = new RegExp (side + ' (&&|\\|\\|) ' + side, 'g');
    // true when the side tests "is nil"
    const isNil = (not: string, eq: string): boolean => (eq === undefined) ? (not === '') : (eq === '=');
    for (let changed = true; changed;) {
        changed = false;
        text = text.replace (pattern, ((m: string, o1: string, n1: string, h1: string, v1: string, e1: string, c1: string, op: string, o2: string, n2: string, h2: string, v2: string, e2: string, c2: string, at: number, all: string) => {
            const or = (op === '||');
            // parens opened before side 1 / closed after side 2 belong to the enclosing group
            const lead = o1.length - c1.length;
            const trail = c2.length - o2.length;
            const mixed = ((h1 === undefined) !== (h2 === undefined));
            if ((lead < 0) || (trail < 0) || ((h1 || v1) !== (h2 || v2)) || (isNil (n1, e1) !== isNil (n2, e2)) || (mixed && (isNil (n1, e1) !== or))) {
                return m;
            }
            const prefix = o1.slice (0, lead);
            const suffix = c2.slice (o2.length);
            const core = m.slice (lead, m.length - trail);
            const before = all.slice (0, at) + prefix;
            const after = suffix + all.slice (at + m.length);
            // only whole operands of a boolean chain; `A && P || P` is not `A && P`
            if (!/(?:^|[({,]|&&|\|\||[^=!<>]=|\breturn|\bif)\s*$/.test (before) || !/^\s*(?:$|[)}{,;\n]|&&|\|\|)/.test (after)) {
                return m;
            }
            if (or && (/&&\s*$/.test (before) || /^\s*&&/.test (after))) {
                return m;
            }
            changed = true;
            const joint = core.indexOf (c1 + ' ' + op + ' ' + o2) + c1.length;
            // the helper side implies the native one (IsEqual also folds typed nil pointers)
            const kept = ((h2 !== undefined) && (h1 === undefined)) ? core.slice (joint + op.length + 2) : core.slice (0, joint);
            return prefix + kept + suffix;
        }) as any);
    }
    return text;
}

export function goAnyLocalNativeNilCompares (content: string, isEqualFn: string): string {
    const ranges = goFuncBlockRanges (content);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const block = content.slice (ranges[i].start, ranges[i].end);
        const rewritten = goCollapseDuplicateNilCompares (goAnyLocalNilCompareText (block, isEqualFn.replace (/^ccxt\./, '')), isEqualFn);
        if (rewritten !== block) {
            content = content.slice (0, ranges[i].start) + rewritten + content.slice (ranges[i].end);
        }
    }
    return content;
}

function goAnyLocalNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goAnyLocalNativeNilCompares (text, 'IsEqual(');
    const f = (body: string): string => pass ('\nfunc (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
    ok (f ('\tvar a any = nil\n\tif true {\n\t\ta = this.SafeDict(p, "x")\n\t} else {\n\t\ta = []any{1}\n\t}\n\tif !IsEqual(a, nil) {\n\t\treturn a\n\t}\n').indexOf ('if (a != nil) {') >= 0, 'SafeDict/literal writes compare natively');
    ok (f ('\tvar s any = DerefScalar(this.SafeString(p, "s"))\n\tvar n int64 = this.Milliseconds()\n\ts = n\n\tif IsEqual(s, nil) {\n\t}\n').indexOf ('if (s == nil) {') >= 0, 'DerefScalar of a scalar accessor and a scalar local are safe');
    ok (f ('\tvar m any = map[string]any{\n\t\t"a": 1,\n\t}\n\tif IsEqual(m, nil) {\n\t}\n').indexOf ('if (m == nil) {') >= 0, 'a multi-line literal is safe');
    ok (f ('\tvar s any = client.(ccxt.ClientInterface).SubscriptionGet("a")\n\tif IsEqual(s, nil) {\n\t}\n').indexOf ('if (s == nil) {') >= 0, 'a ws subscription read is dereferenced, so it compares natively');
    ok (f ('\tvar d any = client.(ccxt.ClientInterface).SubscriptionDict("a")\n\tif IsEqual(d, nil) {\n\t}\n').indexOf ('if (d == nil) {') >= 0, 'a ws subscription dictionary read compares natively');
    const keep = [
        '\tvar v any = this.SafeString(p, "v")\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.SafeValue(p, "v")\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = MapTyped(p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.FilterBy(p, "a", "b")\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.SafeDict(p, "v", p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tv, _ = this.Two(p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tAppendToArray(&v, 1)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tfunc() {\n\t\tv = this.SafeInteger(p, "a")\n\t}()\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tif true {\n\t\tvar v any = p\n\t\t_ = v\n\t}\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.Extend(p).X\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar q *string = nil\n\tvar v any = q\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = DerefScalar(this.SafeValue(p, "a"))\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = Precise.StringAbs(p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.ParseNumber(p, q)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = GetValue(p, 0)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = this.Iso8601(p)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar s []string = nil\n\ts, ok := p.([]string)\n\tvar v any = GetValue(s, 0)\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = func() any {\n\t\tif true {\n\t\t\treturn this.SafeString(p, "a")\n\t\t}\n\t\treturn nil\n\t}()\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = func() any {\n\t\tf := func() any { return p }\n\t\treturn f()\n\t}()\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar w any = this.SafeValue(p, "w")\n\tvar v any = w\n\tif IsEqual(v, nil) {\n\t}\n',
        '\tvar v any = nil\n\tvar w any = v\n\tv = w\n\tif IsEqual(v, nil) {\n\t}\n',
    ];
    keep.forEach ((body, index) => ok (f (body).indexOf ('IsEqual(v, nil)') >= 0, 'unproven write must keep the helper #' + index));
    ok (pass ('\nfunc (this *X) f(v any) any {\n\tif IsEqual(v, nil) {\n\t}\n}\n').indexOf ('IsEqual(v, nil)') >= 0, 'a parameter keeps the helper');
        ok (inop ('\tvar s string = "a"\n\tif (this.Markets() != nil) && (InOp(this.Markets(), s)) {\n\t}\n').includes ('if _, ok := this.Markets()[s]; (this.Markets() != nil) && ok {'), 'this.Markets() reads natively');
        ok (inop ('\tvar s any = nil\n\tif (this.Markets() != nil) && (InOp(this.Markets(), s)) {\n\t}\n').includes ('InOp(this.Markets(), s)'), 'this.Markets() with an any key keeps the helper');
        ok (inop ('\tvar s string = "a"\n\tif (this.Markets_by_id() != nil) && (InOp(this.Markets_by_id(), s)) {\n\t}\n').includes ('InOp(this.Markets_by_id(), s)'), 'other getters keep the helper');
    const safe = [
        '\tvar v any = nil\n\tv = Slice(p, 0, 3)\n\tv = ToUpper(Replace(p, "a", "b"))\n\tv = MathMin(p, 2)\n\tv = Iso8601(p)\n',
        '\tvar v any = this.ParseNumber(this.SafeString(p, "a"))\n\tv = this.ParseNumber(p, 0)\n\tv = ParseFloat(p) // note\n',
        '\tvar s []string = Split(p, "-")\n\tvar v any = GetValue(s, 1)\n\tv = GetValue(Split(p, "/"), 0)\n',
        '\tvar v any = func() any {\n\t\tif true {\n\t\t\treturn DerefScalar(this.SafeString(p, "a"))\n\t\t}\n\t\treturn map[string]any{}\n\t}()\n',
        '\tvar v any = func() int {\n\t\treturn 1\n\t}()\n',
        '\tvar w any = this.SafeDict(p, "w")\n\tvar v any = w\n',
        '\tvar v any = this.MyTrades\n',
    ];
    safe.forEach ((body, index) => ok (f (body + '\tif IsEqual(v, nil) {\n\t}\n').indexOf ('if (v == nil) {') >= 0, 'proven write compares natively #' + index));
    ok (f ('\tvar v any = Slice(p, 0, 1)\n\tif ccxt.IsEqual(v, nil) {\n\t}\n').indexOf ('if (v == nil) {') >= 0, 'a qualified helper in an unqualified pass is rewritten');
    const ws = goAnyLocalNativeNilCompares ('\nfunc (this *X) f() any {\n\tvar c any = ccxt.NewArrayCache(1)\n\tif !ccxt.IsEqual(c, nil) {\n\t}\n}\n', 'ccxt.IsEqual(');
    ok (ws.indexOf ('if (c != nil) {') >= 0, 'the package-qualified helper is rewritten');
    ok (pass (ws) === ws, 'a second application is a no-op');
    const dup = (body: string): string => f ('\tvar a any = this.SafeDict(p, "a")\n\tvar q *string = nil\n' + body);
    ok (dup ('\tvar h bool = ((a != nil)) && ((a != nil)) && (q != nil)\n').indexOf ('var h bool = ((a != nil)) && (q != nil)') >= 0, 'duplicate native && collapses');
    ok (dup ('\tvar h bool = (!IsEqual(a, nil)) && (!IsEqual(a, nil))\n').indexOf ('var h bool = ((a != nil))\n') >= 0, 'duplicate helper && collapses after the native rewrite');
    ok (dup ('\tif (IsEqual(a, nil)) || (IsEqual(a, nil)) || (q == nil) {\n\t}\n').indexOf ('if ((a == nil)) || (q == nil) {') >= 0, 'duplicate native || collapses');
    ok (dup ('\tif (q == nil) || IsEqual(q, nil) {\n\t}\n').indexOf ('if IsEqual(q, nil) {') >= 0, 'mixed native/helper || keeps the helper');
    ok (dup ('\tif (q != nil) && ((!IsEqual(q, nil))) {\n\t}\n').indexOf ('if ((!IsEqual(q, nil))) {') >= 0, 'mixed native/helper && keeps the helper');
    ok (dup ('\tif (q == nil) && (q == nil) {\n\t}\n\tif (q != nil) || (q != nil) {\n\t}\n').indexOf ('if (q == nil) {\n\t}\n\tif (q != nil) {') >= 0, 'any same-polarity duplicate collapses');
    ok (dup ('\tif (q != nil) && (q == nil) {\n\t}\n\tif (a != nil) && (q != nil) {\n\t}\n\tif (q == nil) && IsEqual(q, nil) {\n\t}\n').indexOf ('if (q != nil) && (q == nil) {\n\t}\n\tif (a != nil) && (q != nil) {\n\t}\n\tif (q == nil) && IsEqual(q, nil) {') >= 0, 'contradictions, other idents and non-absorbing mixed pairs are kept');
    ok (dup ('\tif (q != nil) && (q == nil) || (q == nil) {\n\t}\n\tif (q == nil) || (q == nil) && (a != nil) {\n\t}\n').indexOf ('if (q != nil) && (q == nil) || (q == nil) {\n\t}\n\tif (q == nil) || (q == nil) && (a != nil) {') >= 0, 'an || pair bound into && is kept');
    return problems;
}

// IsEqual(x, "lit") is `x == "lit"` on a box that never holds a *string/*any (the helper derefs
// those) or a *sync.Map; on a `*string` local it is the helper's nil-guarded compare. Every
// write must be proven below; parameters and unknown producers keep the helper.
const GO_STRING_CMP_SAFE_CALLS = new Set ([
    'GetValue', 'Add', 'Subtract', 'Multiply', 'Divide', 'ParseInt', 'GetArrayLength', 'mathMin', 'mathMax',
    'ToUpper', 'ToLower', 'ToString', 'Replace', 'JsonStringify', 'StringArg', 'Json',
    'this.Json', 'this.Uuid', 'this.Milliseconds', 'this.Seconds', 'this.Extend', 'this.DeepExtend',
]);
// producers whose Go result is `any` or `string`, so `x := <call>` compares with a string constant
const GO_STRING_CMP_BOX_CALLS = new Set ([
    'GetValue', 'Add', 'ToUpper', 'ToLower', 'ToString', 'Replace', 'JsonStringify', 'StringArg', 'Json',
    'this.Json', 'this.Uuid', 'GetArg', 'DerefScalar',
]);
const GO_STRING_PTR_TUPLE_CALL = /^(?:this|base|this\.Exchange|this\.BaseExchange)\.Handle(?:MarketType|SubType|MarginMode|OptionString)AndParams2?\(/;
const GO_STRING_CMP_PLAIN_ARG = /^(?:nil|true|false|""|-?\d+(?:\.\d+)?|map\[string\]any\{\}|\[\]any\{\})$/;

// true when the masked right-hand side cannot yield a pointer box; `ident` judges bare names
function goStringCmpSafeWrite (rhs: string, ident: (name: string) => boolean, boxOnly: boolean): boolean {
    const text = rhs.replace (/\bccxt\./g, '').replace (/\s+\/\/[^"]*$/, '').trim ();
    if (text === '""') {
        return true;
    }
    if (/^(?:nil|true|false|-?\d+(?:\.\d+)?)$/.test (text) || /^(?:map\[string\]any|\[\]any)\{/.test (text)) {
        return !boxOnly;
    }
    if (/^\w+$/.test (text)) {
        return !boxOnly && ident (text);
    }
    const call = /^((?:this\.)?\w+)\(/.exec (text);
    const args = call ? goCallArgsSpanningText (text, call[0].length - 1) : undefined;
    if ((call === null) || (args === undefined)) {
        return false;
    }
    if (boxOnly && !GO_STRING_CMP_BOX_CALLS.has (call[1])) {
        return false;
    }
    if (call[1] === 'DerefScalar') {
        return (args.length === 1) && GO_ANY_NIL_DEREF_INNER.test (args[0]) && (goCallArgsSpanningText (args[0], args[0].indexOf ('(')) !== undefined);
    }
    if (call[1] === 'GetArg') {
        return (args.length === 3) && GO_STRING_CMP_PLAIN_ARG.test (args[2]);
    }
    return GO_STRING_CMP_SAFE_CALLS.has (call[1]);
}

function goStringLiteralCompareText (fn: string, isEqualFn: string): string {
    if (fn.indexOf (isEqualFn) < 0) {
        return fn;
    }
    const helper = isEqualFn.replace (/[.(]/g, '\\$&');
    const signature = fn.slice (0, fn.indexOf ('{'));
    const signatureLine = signature.split ('\n').length - 1;
    const commentState = { 'inBlockComment': false };
    const code = fn.split ('\n').map ((line) => stripGoLiterals (line, commentState));
    const kinds = new Map<string, string> ();
    const kindOf = (name: string): string => {
        const known = kinds.get (name);
        if (known !== undefined) {
            return known;
        }
        kinds.set (name, 'no');
        const param = new RegExp ('[(,]\\s*' + name + ' (\\S+?)[,)]').exec (signature);
        const declRe = new RegExp ('\\bvar ' + name + '\\b|(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfunc\\b[^{]*[(,]\\s*' + name + ' ');
        const declLines = code.map ((line, index) => index).filter ((index) => (index > signatureLine) && declRe.test (code[index]));
        let kind = 'no';
        if (param) {
            kind = (!declLines.length && /^(?:string|int64|float64|bool|int)$/.test (param[1])) ? 'scalar' : 'no';
            kinds.set (name, kind);
            return kind;
        }
        if (declLines.length !== 1) {
            return kind;
        }
        const declIndex = declLines[0];
        const decl = code[declIndex];
        const safeIdent = (other: string): boolean => (other !== name) && (kindOf (other) !== 'no') && (kindOf (other) !== 'ptr');
        let match: RegExpExecArray | null;
        if (new RegExp ('^\\s*var ' + name + ' (?:string|int64|float64|bool|int) = ').test (decl)) {
            kind = 'scalar';
        } else if (new RegExp ('^\\s*var ' + name + ' \\*string(?: = |$)').test (decl)) {
            kind = 'ptr';
        } else if ((match = new RegExp ('^\\s*' + name + ', \\w+ := (.*)$').exec (decl)) && GO_STRING_PTR_TUPLE_CALL.test (match[1]) && (goCallArgsSpanningText (match[1], match[1].indexOf ('(')) !== undefined)) {
            kind = 'ptr';
        } else if ((match = new RegExp ('^\\s*var ' + name + ' any(?: = (.*))?$').exec (decl))) {
            kind = ((match[1] === undefined) || goStringCmpSafeWrite (match[1], safeIdent, false)) ? 'box' : 'no';
        } else if ((match = new RegExp ('^\\s*' + name + ' := (.*)$').exec (decl))) {
            kind = goStringCmpSafeWrite (match[1], safeIdent, true) ? 'box' : 'no';
        }
        if (kind === 'box') {
            const mention = new RegExp ('(?<![.\\w])' + name + '(?!\\w)');
            const unsafe = new RegExp ('&' + name + '\\b|(?<![.\\w])' + name + '\\s*(?:\\+\\+|--|[-+*/%|&^]=)|,\\s*' + name + '\\s*(?:,[^=\\n]*)?=[^=]|(?<![.\\w])' + name + '\\s*,[\\w\\s,]*=[^=]');
            for (let i = 0; (kind === 'box') && (i < code.length); i++) {
                if ((i === declIndex) || !mention.test (code[i])) {
                    continue;
                }
                const write = new RegExp ('^\\s*' + name + ' = (.*)$').exec (code[i]);
                if (unsafe.test (code[i])) {
                    kind = 'no';
                } else if (write) {
                    kind = goStringCmpSafeWrite (write[1], safeIdent, false) ? 'box' : 'no';
                } else if (new RegExp ('(?<![.\\w=!<>])' + name + '\\s*=[^=]').test (code[i])) {
                    kind = 'no';
                }
            }
        }
        kinds.set (name, kind);
        return kind;
    };
    return fn.replace (new RegExp ('(!?)(?<![.\\w])' + helper + '(\\w+), (\"(?:[^\"\\\\]|\\\\.)*\")\\)', 'g'), ((m: string, not: string, name: string, literal: string) => {
        const kind = kindOf (name);
        if (kind === 'box') {
            return '(' + name + ((not === '!') ? ' != ' : ' == ') + literal + ')';
        }
        if (kind === 'ptr') {
            return (not === '!') ? '(' + name + ' == nil || *' + name + ' != ' + literal + ')' : '(' + name + ' != nil && *' + name + ' == ' + literal + ')';
        }
        return m;
    }) as any);
}

export function goStringLiteralNativeCompares (content: string, isEqualFn: string): string {
    const ranges = goFuncBlockRanges (content);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const block = content.slice (ranges[i].start, ranges[i].end);
        const rewritten = goStringLiteralCompareText (block, isEqualFn);
        if (rewritten !== block) {
            content = content.slice (0, ranges[i].start) + rewritten + content.slice (ranges[i].end);
        }
    }
    return content;
}

// SafeBool* with a literal bool default never returns nil (exchange_safe.go falls back to it),
// so its nil-guarded truthiness `C != nil && *C` reads the flag once as `*C`.
const GO_SAFEBOOL_LITERAL_CALL = 'this\\.SafeBool(?:2|N)?\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*, (?:true|false)\\)';
export function goSafeBoolLiteralDefaultDeref (content: string): string {
    const guarded = new RegExp ('(' + GO_SAFEBOOL_LITERAL_CALL + ') != nil && \\*(' + GO_SAFEBOOL_LITERAL_CALL + ')', 'g');
    return content.replace (guarded, (m: string, a: string, b: string) => ((a === b) ? '*' + a : m));
}

function goSafeBoolLiteralSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    ok (goSafeBoolLiteralDefaultDeref ('if this.SafeBool(this.Options, "a", false) != nil && *this.SafeBool(this.Options, "a", false) {') === 'if *this.SafeBool(this.Options, "a", false) {', 'literal default derefs once');
    ok (goSafeBoolLiteralDefaultDeref ('(!(this.SafeBool2(GetValue(m, "i"), "a", "b", true) != nil && *this.SafeBool2(GetValue(m, "i"), "a", "b", true)))') === '(!(*this.SafeBool2(GetValue(m, "i"), "a", "b", true)))', 'nested args and SafeBool2');
    const keep = [
        'this.SafeBool(p, "a") != nil && *this.SafeBool(p, "a")',
        'this.SafeBool(p, "a", d) != nil && *this.SafeBool(p, "a", d)',
        'this.SafeBool(p, "a", false) != nil && *this.SafeBool(q, "a", false)',
        'this.SafeBool(p, GetValue(k, false)) != nil && *this.SafeBool(p, GetValue(k, false))',
    ];
    keep.forEach ((text, index) => ok (goSafeBoolLiteralDefaultDeref (text) === text, 'non-literal default must keep the guard #' + index));
    return problems;
}

function goSliceIndexSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (decl: string, body: string, bound = 'len(s)'): string => nativeLoopBoundedSliceReads ('func (this *X) f(p any) any {\n' + decl + '\tfor i := 0; i < ' + bound + '; i++ {\n' + body + '\t}\n\treturn nil\n}\n');
    const sd = '\tvar s []string = ObjectKeys(p)\n';
    ok (f (sd, '\t\tvar a string = GetValue(s, i).(string)\n').indexOf ('var a string = s[i]\n') >= 0, 'asserted read goes native');
    ok (f (sd, '\t\tr = Add(r, GetValue(s, i))\n').indexOf ('Add(r, s[i])') >= 0, 'bare read goes native');
    const pl = '\tvar s []any = ListTyped(r1.Value)\n';
    const pe = '\tvar s []any = ListTyped(PanicOnError((<-promiseAll(ps))))\n';
    ok (f (pe, '\t\tr = this.ArrayConcat(r, GetValue(s, i))\n').indexOf ('this.ArrayConcat(r, s[i])') >= 0, 'unsplit promiseAll receive goes native');
    ok (f (pl, '\t\tr = this.ArrayConcat(r, GetValue(s, i))\n').indexOf ('this.ArrayConcat(r, s[i])') >= 0, 'promiseAll list as ArrayConcat operand goes native');
    ok (f (pl, '\t\tr = Add(r, GetValue(s, i))\n').indexOf ('GetValue(s, i)') >= 0, 'promiseAll list elsewhere keeps GetValue');
    ok (f (pl, '\t\tvar a any = GetValue(s, i)\n').indexOf ('GetValue(s, i)') >= 0, 'promiseAll list plain local keeps GetValue');
    ok (f ('\tvar s []string = ObjectKeys(p)\n\tvar n int = len(s)\n', '\t\tr = Add(r, GetValue(s, i))\n', 'n').indexOf ('s[i]') >= 0, 'unwritten len local bound');
    const keep: string[][] = [
        [ sd, '\t\ts = append(s, \"x\")\n\t\tr = GetValue(s, i)\n' ],
        [ sd, '\t\ti = i + 1\n\t\tr = GetValue(s, i)\n' ],
        [ sd, '\t\tgo func() {\n\t\t\tr = GetValue(s, i)\n\t\t}()\n' ],
        [ '\tvar s []any = GetValue(p, \"a\")\n', '\t\tr = GetValue(s, i)\n' ],
        [ sd + '\tvar s []string = nil\n', '\t\tr = GetValue(s, i)\n' ],
        [ sd, '\t\tif GetValue(s, i) == nil {\n\t\t}\n' ],
        [ sd, '\t\tr = GetValue(s, j)\n' ],
    ];
    keep.forEach ((c, index) => ok (f (c[0], c[1]).indexOf ('GetValue(s, ') >= 0, 'unproven read must keep GetValue #' + index));
    ok (f (sd, '\t\tr = GetValue(s, i)\n', 'len(t)').indexOf ('GetValue(s, i)') >= 0, 'other bound keeps GetValue');
    const twice = sd + '\tif true {\n\t}\n\tvar s []string = ObjectKeys(p)\n';
    ok (f (twice, '\t\tvar a string = GetValue(s, i).(string)\n').indexOf ('var a string = s[i]\n') >= 0, 'repeated []string declarations go native');
    ok (f (sd + '\tvar s []any = nil\n', '\t\tr = GetValue(s, i)\n').indexOf ('GetValue(s, i)') >= 0, 'mixed declaration types keep GetValue');
    ok (f (twice + '\ts = nil\n', '\t\tr = GetValue(s, i)\n').indexOf ('GetValue(s, i)') >= 0, 'written repeated slice keeps GetValue');
    const sib = nativeLoopBoundedSliceReads ('func (this *X) f(p any) any {\n\tif p != nil {\n\t\tvar s []string = ObjectKeys(p)\n\t\tfor i := 0; i < len(s); i++ {\n\t\t\tvar a string = GetValue(s, i).(string)\n\t\t}\n\t} else {\n\t\tvar s []string = ObjectKeys(p)\n\t\tfor i := 0; i < len(s); i++ {\n\t\t\tvar b string = GetValue(s, i).(string)\n\t\t}\n\t}\n\treturn nil\n}\n');
    ok ((sib.indexOf ('var a string = s[i]') >= 0) && (sib.indexOf ('var b string = s[i]') >= 0), 'sibling-scope []string declarations: ' + sib);
    const sibBad = nativeLoopBoundedSliceReads ('func (this *X) f(p any) any {\n\tif p != nil {\n\t\tvar s []string = ObjectKeys(p)\n\t\tfor i := 0; i < len(s); i++ {\n\t\t\tvar a string = GetValue(s, i).(string)\n\t\t}\n\t} else {\n\t\tvar s any = p\n\t\tfor i := 0; i < len(s); i++ {\n\t\t\tvar b string = GetValue(s, i).(string)\n\t\t}\n\t}\n\treturn nil\n}\n');
    ok (sibBad.indexOf ('s[i]') < 0, 'a non-[]string sibling declaration keeps GetValue: ' + sibBad);
    return problems;
}

function goStringLiteralSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (body: string, sig = 'p any'): string => goStringLiteralNativeCompares ('\nfunc (this *X) f(' + sig + ', optionalArgs ...any) any {\n' + body + '\treturn nil\n}\n', 'IsEqual(');
    ok (f ('\tapi := GetArg(optionalArgs, 0, "public")\n\tif IsEqual(api, "private") || !IsEqual(api, "v2") {\n\t}\n').indexOf ('if (api == "private") || (api != "v2") {') >= 0, 'GetArg with a literal default compares natively');
    ok (f ('\tvar t any = "spot"\n\tvar u string = "x"\n\tif true {\n\t\tt = DerefScalar(this.SafeString(p, "type"))\n\t} else {\n\t\tt = u\n\t}\n\tt = GetValue(p, 0)\n\tif IsEqual(t, "swap") {\n\t}\n').indexOf ('if (t == "swap") {') >= 0, 'literal/DerefScalar/string-local/GetValue writes compare natively');
    ok (f ('\tm, q := this.HandleMarketTypeAndParams("f", nil, p)\n\t_ = q\n\tif IsEqual(m, "spot") && !IsEqual(m, "swap") {\n\t}\n').indexOf ('if (m != nil && *m == "spot") && (m == nil || *m != "swap") {') >= 0, 'a *string tuple result gets the nil-guarded compare');
    ok (f ('\tvar s *string = this.SafeString(p, "a")\n\tif IsEqual(s, "a") {\n\t}\n').indexOf ('(s != nil && *s == "a")') >= 0, 'a *string local gets the nil-guarded compare');
    const keep = [
        '\tvar v any = this.SafeString(p, "v")\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tv = this.GetMarketType("f", p)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tvar s *string = nil\n\tv = s\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tv, _ = this.Two(p)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = nil\n\tif true {\n\t\tvar v any = p\n\t\t_ = v\n\t}\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tv := GetArg(optionalArgs, 0, this.SafeString(p, "a"))\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tv := this.Milliseconds()\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = func() any {\n\t\treturn p\n\t}()\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = DerefScalar(p)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tAppendToArray(&v, 1)\n\tif IsEqual(v, "a") {\n\t}\n',
        '\tvar v any = "a"\n\tvar w any = v\n\tw = p\n\tv = w\n\tif IsEqual(v, "a") {\n\t}\n',
    ];
    keep.forEach ((body, index) => ok (f (body).indexOf ('IsEqual(v, "a")') >= 0, 'unproven write must keep the helper #' + index));
    ok (f ('\tif IsEqual(p, "a") {\n\t}\n').indexOf ('IsEqual(p, "a")') >= 0, 'an any parameter keeps the helper');
    const ws = goStringLiteralNativeCompares ('\nfunc (this *X) f(optionalArgs ...any) any {\n\tapi := ccxt.GetArg(optionalArgs, 0, "public")\n\tif ccxt.IsEqual(api, "x") {\n\t}\n}\n', 'ccxt.IsEqual(');
    ok (ws.indexOf ('if (api == "x") {') >= 0, 'the package-qualified helper is rewritten');
    ok (goStringLiteralNativeCompares (ws, 'ccxt.IsEqual(') === ws, 'a second application is a no-op');
    return problems;
}

// Self-test for the same-file pointer-returning method rule: the boxed local keeps the
// deref-aware helper, a scalar-returning or unknown method and a typed local keep the native
// comparison, the reassignment form is caught too and a second application is a no-op.
function goPointerLocalNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const pass = (text: string): string => goPointerLocalNativeNilCompares (text, 'IsEqual(');
    const pointer = '\nfunc (this *X) ParseOrderTimeInForce(status *string) *string {\n\treturn status\n}\n\nfunc (this *X) ParseOrder(order any) any {\n\tvar timeInForce any = this.ParseOrderTimeInForce(this.SafeString(order, "timeInForce"))\n\tvar typeRaw *string = this.SafeString(order, "type")\n\tif timeInForce == nil {\n\t\ttimeInForce = this.GetTifFromRawOrderType(typeRaw)\n\t}\n\tif typeRaw != nil {\n\t\treturn timeInForce\n\t}\n\treturn nil\n}\n';
    const rewritten = pass (pointer);
    ok (rewritten.indexOf ('if IsEqual(timeInForce, nil) {') >= 0, 'a local boxed from a same-file pointer method must keep the helper');
    ok (rewritten.indexOf ('if typeRaw != nil {') >= 0, 'a typed local must keep the native comparison');
    ok (rewritten.indexOf ('timeInForce == nil') < 0, 'the native comparison on the boxed local must be gone');
    const reassigned = pass ('\nfunc (this *X) M(a any) *string {\n\treturn nil\n}\n\nfunc (this *X) N(order any) any {\n\tvar code any = nil\n\tcode = this.M(order)\n\tif code != nil {\n\t\treturn code\n\t}\n\treturn nil\n}\n');
    ok (reassigned.indexOf ('if !IsEqual(code, nil) {') >= 0, 'a local reassigned from a pointer method must keep the helper');
    const scalar = pass ('\nfunc (this *X) M(a any) string {\n\treturn ""\n}\n\nfunc (this *X) N(order any) any {\n\tvar code any = this.M(order)\n\tif code == nil {\n\t\treturn nil\n\t}\n\treturn code\n}\n');
    ok (scalar.indexOf ('if code == nil {') >= 0, 'a scalar-returning method keeps the native comparison');
    const unknown = pass ('\nfunc (this *X) N(order any) any {\n\tvar code any = this.SomeOtherFileMethod(order)\n\tif code == nil {\n\t\treturn nil\n\t}\n\treturn code\n}\n');
    ok (unknown.indexOf ('if code == nil {') >= 0, 'a method this file does not declare keeps the native comparison');
    const twice = pass (pass (pointer));
    ok (twice.indexOf ('IsEqual(IsEqual(') < 0, 'a second application must be a no-op');
    ok (twice.indexOf ('if IsEqual(timeInForce, nil) {') >= 0, 'the rewritten comparison must survive a second application');
    return problems;
}

// Self-test for the DerefScalar() redundancy proof: a shim-only local loses the wrap, and
// every other read shape keeps it.
function goDerefWrapSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const safeCall = 'this\\.(?:DerivedExchange\\.)?(?:Safe(?:(?:String|Integer|Number|Float|Bool)[N2-9]*|CurrencyCode|Symbol)|NumberToString|Parse8601|Iso8601)\\((?:[^()]|\\([^()]*\\))*\\)';
    const redundant = (body: string, name: string): boolean => {
        const text = '\nfunc (this *X) f() any {\n' + body + '}\n';
        const wrapLines = new Set<number> ();
        text.split ('\n').forEach ((line, index) => { if (line.indexOf ('DerefScalar(') >= 0) { wrapLines.add (index); } });
        return goDerefWrapRedundantLocals (text, wrapLines, [ name ]).has (name);
    };
    ok (redundant ('\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\tif IsEqual(flag, true) {\n\t\treturn nil\n\t}\n', 'flag'), 'shim-only declaration must drop the wrap');
    ok (redundant ('\tvar amount any = nil\n\tamount = DerefScalar(this.SafeNumber(order, "amount"))\n\tif EvalTruthy(amount) {\n\t\treturn nil\n\t}\n\t_ = amount\n', 'amount'), 'shim-only reassignment must drop the wrap');
    ok (redundant ('\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\t// flag is read through the shim below\n\tif !EvalTruthy(flag) {\n\t\treturn nil\n\t}\n', 'flag'), 'a comment mention must not veto');
    ok (redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\tquantity = Add(id, "x")\n', 'id'), 'a shim call inside a write must keep the local redundant');
    ok (!redundant ('\tvar code any = DerefScalar(this.SafeString(entry, "code"))\n\tif code == nil {\n\t\treturn nil\n\t}\n', 'code'), 'a raw nil comparison must keep the wrap');
    ok (!redundant ('\tvar side any = DerefScalar(this.SafeString(trade, "side"))\n\tswitch side {\n\tcase "buy":\n\t\treturn nil\n\t}\n', 'side'), 'a switch must keep the wrap');
    ok (!redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\treturn id\n', 'id'), 'a return must keep the wrap');
    ok (!redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\tresult["id"] = id\n', 'id'), 'a dict store must keep the wrap');
    ok (!redundant ('\tvar id any = DerefScalar(this.SafeString(o, "id"))\n\tthis.ParseOrderId(id, market)\n', 'id'), 'an argument to a non-shim call must keep the wrap');
    ok (!redundant ('\tvar qty any = DerefScalar(this.SafeNumber(o, "qty"))\n\tresult := map[string]any{"qty": qty}\n', 'qty'), 'a dict literal value must keep the wrap');
    ok (!redundant ('\tvar x any = nil\n\tx = this.SafeString2(params, "x", "y", x)\n\tif IsEqual(x, nil) {\n\t\treturn nil\n\t}\n', 'x'), 'a read inside the wrapped call arguments must keep the wrap');
    ok (!redundant ('\tvar x any = nil\n\tx = this.SafeString2(params, "x", "y", x)\n\tif IsEqual(x, nil) {\n\t\treturn nil\n\t}\n', 'x'), 'the same read keeps the wrap inside the wrapped form too');
    const both = '\nfunc (this *X) f() any {\n\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\t_ = flag\n}\n\nfunc (this *X) g() any {\n\tvar flag any = ccxt.DerefScalar(this.SafeBool(market, "flag", false))\n\tif flag != nil && *flag {\n\t\treturn nil\n\t}\n}\n';
    const lines = new Set<number> ();
    both.split ('\n').forEach ((line, index) => { if (line.indexOf ('DerefScalar(') >= 0) { lines.add (index); } });
    ok (goDerefWrapRedundantLocals (both, lines, [ 'flag' ]).size === 0, 'a second function with a raw comparison must veto the name');
    const unwrapped = goUnwrapDerefWraps ('func f() {\n\tvar flag any = DerefScalar(this.SafeBool(market, "flag", false))\n\tvar row any = ccxt.DerefScalar(this.SafeString(data, "row"))\n}\n', [ 'flag', 'row' ], safeCall);
    ok (unwrapped.indexOf ('DerefScalar(') < 0, 'both wrap forms must be removed');
    ok (unwrapped.indexOf ('var flag any = this.SafeBool(market, "flag", false)') >= 0 && unwrapped.indexOf ('var row any = this.SafeString(data, "row")') >= 0, 'the drop must keep the wrapped call');
    return problems;
}

// One entry per line of a core body: how deeply it sits inside func literals, and
// whether that line opens or closes one. Everything the rewriter needs to decide
// what is "core level" comes from here, so the brace scan happens exactly once.
type CoreBodyScan = {
    'literalDepth': number[];   // func-literal nesting depth *before* the line
    'closesTo': number[];       // for a line that closes a literal: the depth it drops to, else -1
    'sendsInLiteral': boolean;  // some line sends on ch from inside a func literal
};

// Walk a core body once and record func-literal nesting per line. Returns null when
// the braces do not balance, i.e. when the scan cannot be trusted.
function scanCoreBody (body: string[]): CoreBodyScan | null {
    const literalDepth: number[] = [];
    const closesTo: number[] = [];
    const funcLiteral: boolean[] = [];
    const comment = { 'inBlockComment': false };
    let sendsInLiteral = false;
    for (const line of body) {
        const code = stripGoLiterals (line, comment);
        const depthBefore = funcLiteral.filter ((isFunc) => isFunc).length;
        literalDepth.push (depthBefore);
        if (depthBefore > 0 && GO_CORE_SEND.test (line.trim ())) {
            sendsInLiteral = true;
        }
        const starts: number[] = [];
        GO_FUNC_LITERAL.lastIndex = 0;
        let literal = GO_FUNC_LITERAL.exec (code);
        while (literal !== null) {
            starts.push (literal.index);
            literal = GO_FUNC_LITERAL.exec (code);
        }
        let closed = -1;
        for (let i = 0; i < code.length; i++) {
            if (code[i] === '{') {
                // a brace opened by the nearest `func(` on this line, with no other
                // brace in between, opens a function literal body
                const opensLiteral = starts.some ((at) => (at < i) && (code.slice (at, i).indexOf ('{') < 0));
                funcLiteral.push (opensLiteral);
            } else if (code[i] === '}') {
                if (funcLiteral.pop () === true) {
                    closed = funcLiteral.filter ((isFunc) => isFunc).length;
                }
            } else {
                continue;
            }
            if (funcLiteral.length < 0) {
                return null;
            }
        }
        closesTo.push (closed);
    }
    if (funcLiteral.length || comment.inBlockComment) {
        return null;
    }
    return { literalDepth, closesTo, sendsInLiteral };
}

// true when every bracket the line opens it also closes — i.e. the line is a
// complete statement rather than the head of a multi-line composite literal
function isBalancedGoLine (line: string): boolean {
    const code = stripGoLiterals (line);
    let depth = 0;
    for (const char of code) {
        if (char === '{' || char === '(' || char === '[') {
            depth++;
        } else if (char === '}' || char === ')' || char === ']') {
            depth--;
        }
        if (depth < 0) {
            return false;
        }
    }
    return depth === 0;
}

// Thread the sent-flag through one core BODY. `lines[start]` is the `defer close(ch)`
// line and `lines[start + 1]` the `defer ReturnPanicError(ch)` right after it; the body
// statements follow, flat, until the column-0 closing brace. Returns the replacement body
// (flag declaration + rewritten lines) and the index of that brace, or null when any
// safety gate fails.
function guardMultiSendCore (lines: string[], start: number): { 'body': string[]; 'end': number } | null {
    const indent = (GO_CORE_CLOSE.exec (lines[start]) as RegExpExecArray)[1];
    // the two defers open the body at the same level; anything else is a shape we did
    // not emit and do not understand
    if ((GO_CORE_PANIC.exec (lines[start + 1]) as RegExpExecArray)[1] !== indent) {
        return null;
    }
    const bodyStart = start + 2;
    let end = bodyStart;
    while (end < lines.length && !GO_CORE_END.test (lines[end])) {
        end++;
    }
    if (end >= lines.length) {
        return null;
    }
    const body = lines.slice (bodyStart, end);
    const scan = scanCoreBody (body);
    if (scan === null || !scan.sendsInLiteral) {
        // nothing to guard: the core only ever sends at its own level
        return null;
    }
    const rewritten: string[] = [];
    for (let index = 0; index < body.length; index++) {
        const line = body[index];
        const trimmed = line.trim ();
        const nested = scan.literalDepth[index] > 0;
        const lineIndent = line.slice (0, line.length - line.trimStart ().length);
        if (new RegExp ('\\b' + GO_SENT_FLAG + '\\b').test (stripGoLiterals (line))) {
            // the flag would collide with an identifier the body already uses
            return null;
        }
        rewritten.push (line);
        if (nested && GO_CORE_SEND.test (trimmed)) {
            // record the send so the core level below can stop; a multi-line send
            // (`ch <- map[string]any{` …) would put this in the wrong place, so the
            // send has to be a complete statement on its own line
            if (!isBalancedGoLine (line)) {
                return null;
            }
            rewritten.push (lineIndent + GO_SENT_FLAG + ' = true');
        }
        if (scan.closesTo[index] === 0 && GO_LITERAL_INVOKED.test (trimmed)) {
            // the outermost try/catch shim just returned: if it produced a value the
            // core is done, exactly as the `return` inside the TypeScript `try` meant.
            // `return nil` leaves the body method (whose result is `any`); the
            // trampoline already handed the channel to the caller and `defer close`
            // still runs
            rewritten.push (lineIndent + 'if ' + GO_SENT_FLAG + ' {');
            rewritten.push (lineIndent + GO_INDENT_UNIT + 'return nil');
            rewritten.push (lineIndent + '}');
        }
    }
    const declaration = [ indent + GO_SENT_FLAG + ' := false', indent + '_ = ' + GO_SENT_FLAG ];
    return { 'body': declaration.concat (rewritten), 'end': end };
}

function guardMultiSendCores (content: string): string {
    if (content.indexOf ('ReturnPanicError(ch)') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const result: string[] = [];
    let index = 0;
    while (index < lines.length) {
        const isCore = (index + 2 < lines.length)
            && GO_CORE_CLOSE.test (lines[index])
            && GO_CORE_PANIC.test (lines[index + 1])
            && result.length > 0
            && GO_CORE_SIGNATURE.test (result[result.length - 1]);
        const guarded = isCore ? guardMultiSendCore (lines, index) : null;
        if (guarded === null) {
            result.push (lines[index]);
            index++;
            continue;
        }
        // the core keeps the prologue ast-transpiler emitted; only the body is rewritten
        result.push (lines[index], lines[index + 1]);
        for (const line of guarded.body) {
            result.push (line);
        }
        // the core's closing brace is emitted by the next turn of the loop
        index = guarded.end;
    }
    return result.join ('\n');
}

// Go cannot assign an interface value to a concrete-typed variable, so a local the
// classifier named `string` needs the explicit assertion its new type forces:
//
//     var key any = GetValue(keys, i)              // before
//     var key string = GetValue(keys, i).(string)  // after
//
// This is the element-access family of build/go-local-types.js: `keys` is a []string
// local and the read is bounded by its own loop condition, so GetValue always returns
// the boxed string of its []string branch — never the untyped nil the assertion would
// panic on (that path is what keeps every unbounded/computed/map-receiver site `any`).
// The C# port of the same family emits the identical `(string)` cast.
//
// Only those declarations can match: a `var x string = GetValue(...)` line the
// classifier did not produce would not compile at all, so this rewrite and the
// classifier's decision are the same set by construction. Anchored to one whole
// declaration line so a comment or string that merely quotes the shape is untouched.
function assertTypedElementAccess (content: string): string {
    return content.replace (
        /^(\s*var[ \t]+\w+[ \t]+string[ \t]*=[ \t]*)((?:[A-Za-z_]\w*\.)?GetValue\()((?:[^()\n]|\([^()\n]*\))*)(\))[ \t]*$/gm,
        (_match, declaration: string, call: string, args: string, close: string) => `${declaration}${call}${args}${close}.(string)`,
    );
}

// JS `x[key].push (v)` mutates the array the slot holds; Go cannot take the address of a
// map slot or a slice element, so the printer copies the receiver into `retResN` and the
// append reaches only that copy. Store the grown slice back into the container.
const GO_APPEND_COPY_DECL = /^(\s*)(retRes\d+) := (.+)$/;
const GO_APPEND_COPY_CALL = /^(\s*)(?:[A-Za-z_]\w*\.)?AppendToArray\(&(retRes\d+), /;
const GO_APPEND_SIMPLE_ARG = /^(?:[A-Za-z_]\w*(?:\.\w+)*(?:\[\*?\w+\])?|\*\w+|"[^"\\\n]*"|-?\d+)$/;

// `container, key` for a receiver the printer copied, or undefined when the receiver is not
// a mutable slot this pass can address (a temporary call result is never written back).
function goAppendCopySlot (receiver: string): [string, string] | undefined {
    const text = receiver.trim ();
    const call = /^((?:[A-Za-z_]\w*\.)?)GetValue\(([\s\S]*)\)$/.exec (text);
    if (call !== null) {
        const args: string[] = [];
        let depth = 0;
        let start = 0;
        const inner = call[2];
        for (let i = 0; i < inner.length; i++) {
            const c = inner[i];
            if ((c === '(') || (c === '[') || (c === '{')) {
                depth++;
            } else if ((c === ')') || (c === ']') || (c === '}')) {
                depth--;
            } else if ((c === ',') && (depth === 0)) {
                args.push (inner.substring (start, i));
                start = i + 1;
            }
        }
        args.push (inner.substring (start));
        if (args.length !== 2) {
            return undefined;
        }
        const [ container, key ] = args.map ((a: string) => a.trim ());
        if (!/^[A-Za-z_]\w*(?:\.\w+)*$/.test (container) || !GO_APPEND_SIMPLE_ARG.test (key)) {
            return undefined;
        }
        return [ container, key ];
    }
    const index = /^([A-Za-z_]\w*(?:\.\w+)*)\[([^\[\]]+)\]$/.exec (text);
    if ((index !== null) && GO_APPEND_SIMPLE_ARG.test (index[2].trim ())) {
        return [ index[1], index[2].trim () ];
    }
    return undefined;
}

function nativeAppendWriteBack (content: string): string {
    if (content.indexOf ('AppendToArray(&retRes') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const out: string[] = [];
    for (let k = 0; k < lines.length; k++) {
        out.push (lines[k]);
        const decl = GO_APPEND_COPY_DECL.exec (lines[k]);
        if (decl === null) {
            continue;
        }
        const call = GO_APPEND_COPY_CALL.exec (lines[k + 1] ?? '');
        if ((call === null) || (call[2] !== decl[2]) || (call[1] !== decl[1])) {
            continue;
        }
        const slot = goAppendCopySlot (decl[3]);
        if (slot === undefined) {
            continue;
        }
        // a ccxtpro file reaches both helpers through the imported ccxt package
        const pkg = /(?:^|[^\w.])ccxt\./.test (decl[3] + lines[k + 1]) ? 'ccxt.' : '';
        out.push (lines[k + 1]);
        out.push (decl[1] + pkg + 'AddElementToObject(' + slot[0] + ', ' + slot[1] + ', ' + decl[2] + ')');
        k++;
    }
    return out.join ('\n');
}

// gofmt's declaration-list rule (go/printer nodes.go `declList`): a top-level declaration
// that carries a doc comment is separated from the declaration above it by exactly one
// blank line (`min = 2` linebreaks), while a declaration without one is emitted adjacent
// to it. The wrapper joins below used a bare '\n' everywhere, so a wrapper whose
// `/** ... */` doc template followed the previous wrapper's closing brace came out as
// `}\n/**` and gofmt re-inserted the blank line.
function joinGoDeclarations (decls: string[]): string {
    return decls.filter (decl => decl !== '').map ((decl, index) =>
        (index === 0 ? '' : (goDeclStartsWithComment (decl) ? '\n\n' : '\n')) + decl).join ('');
}

function goDeclStartsWithComment (decl: string): boolean {
    const firstLine = decl.split ('\n')[0].trim ();
    return firstLine.startsWith ('//') || firstLine.startsWith ('/*');
}

// The Go printer emits gofmt-clean text (tabs, go/printer spacing, tabwriter alignment),
// so no gofmt runs at write time. `--check-gofmt [paths…]` is the gate: it runs `gofmt -l`
// over go/v4 (pro/, prediction/) and go/tests and exits 1 on any listing or parse error,
// 2 when gofmt or the tree is missing; `--check-gofmt --self-test` exercises the gate itself.
// gofmt is resolved from $CCXT_GOFMT, PATH, $GOROOT/bin and /usr/local/go/bin, in that order.
const GOFMT_BINARY_ENV = 'CCXT_GOFMT';
// the emitted tree: go/v4 recurses into pro/ and prediction/, go/tests holds the test tier
const GOFMT_GATE_TREE = [ 'go/v4', 'go/tests' ];

function gofmtUsable (binary: string): boolean {
    const probe = spawnSync (binary, [], { 'input': 'package x\n', 'encoding': 'utf8', 'windowsHide': true });
    return !probe.error && probe.status === 0;
}

let resolvedGofmt: string | null | undefined = undefined;  // undefined = not probed yet

function resolveGofmt (): string | null {
    if (resolvedGofmt !== undefined) {
        return resolvedGofmt;
    }
    const candidates = [ process.env[GOFMT_BINARY_ENV], 'gofmt' ];
    if (process.env['GOROOT']) {
        candidates.push (path.join (process.env['GOROOT'], 'bin', 'gofmt'));
    }
    // the campaign's own layout: this host keeps the toolchain here and off PATH
    candidates.push ('/usr/local/go/bin/gofmt');
    resolvedGofmt = null;
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.length > 0 && gofmtUsable (candidate)) {
            resolvedGofmt = candidate;
            break;
        }
    }
    return resolvedGofmt;
}

// `s[i]` on a local the printer typed `[]string` prints as `GetValue(s, i)`, whose Go
// return type is `any`, so the declaration keeps the box; inside a loop that bounds the
// counter to `len(s)` every read is the element itself, and the retag happens here.
function goTextMaskLiteralsAndComments (content: string): string {
    const out = content.split ('');
    let state = 'code';
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if ((c === '/') && (content[i + 1] === '/')) { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if ((c === '/') && (content[i + 1] === '*')) { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if (c === '"') { state = 'dq'; out[i] = ' '; continue; }
            if (c === '`') { state = 'raw'; out[i] = ' '; continue; }
            if (c === '\'') { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        out[i] = (c === '\n') ? '\n' : ' ';
        if (state === 'line') { if (c === '\n') { state = 'code'; } continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { out[i + 1] = ' '; i++; state = 'code'; } continue; }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

// every brace-delimited block of the file as { open, close, depth } line indices, plus the
// brace depth at the start of each line (and after the last one)
function goTextBlocks (maskedLines: string[]): any {
    const depth: number[] = [];
    let current = 0;
    for (const line of maskedLines) {
        depth.push (current);
        current += (line.split ('{').length - 1) - (line.split ('}').length - 1);
    }
    depth.push (current);
    const blocks: any[] = [];
    const stack: any[] = [];
    for (let k = 0; k < maskedLines.length; k++) {
        const before = depth[k];
        const after = depth[k + 1];
        if (after > before) {
            for (let x = before; x < after; x++) {
                const block: any = { 'open': k, 'close': maskedLines.length - 1, 'depth': x + 1 };
                blocks.push (block);
                stack.push (block);
            }
        } else if (after < before) {
            for (let x = before; x > after; x--) {
                const closed: any = stack.pop ();
                if (closed !== undefined) {
                    closed.close = k;
                }
            }
        }
    }
    return { 'blocks': blocks, 'depth': depth };
}

// the innermost block holding this line, undefined at the top level
function goTextEnclosingBlock (blocks: any[], index: number): any {
    let found: any = undefined;
    for (const block of blocks) {
        if ((block.open < index) && (index <= block.close) && ((found === undefined) || (block.depth > found.depth))) {
            found = block;
        }
    }
    return found;
}

// a line that writes, rebinds or takes the address of `name`
function goTextWritesName (maskedLine: string, name: string): boolean {
    const patterns = [
        new RegExp ('\\b' + name + '\\s*:='),
        new RegExp ('\\bvar\\s+' + name + '\\b'),
        new RegExp ('\\b' + name + '\\s*\\[[^\\]]*\\]\\s*[-+*/%&|^]?=(?!=)'),
        new RegExp ('\\b' + name + '\\s*[-+*/%&|^]?=(?!=)'),
        new RegExp ('\\b' + name + '\\s*(?:\\+\\+|--)'),
        new RegExp ('&\\s*' + name + '\\b'),
    ];
    return patterns.some ((rx: RegExp) => rx.test (maskedLine));
}

// a read of the local a `string` declaration cannot carry, or one that would observe the
// box instead of the element: a nil comparison, `IsEqual(x, nil)`, a type assertion, len
function goTextReadIsHazard (maskedLine: string, name: string): boolean {
    const patterns = [
        new RegExp ('\\b' + name + '\\s*[!=]=\\s*nil\\b'),
        new RegExp ('\\bnil\\s*[!=]=\\s*' + name + '\\b'),
        new RegExp ('\\bIsEqual\\s*\\(\\s*' + name + '\\s*,\\s*nil\\s*\\)'),
        new RegExp ('\\b' + name + '\\s*\\.\\s*\\('),
        new RegExp ('\\b(?:len|cap)\\s*\\(\\s*' + name + '\\s*\\)'),
    ];
    return patterns.some ((rx: RegExp) => rx.test (maskedLine));
}

// `var x any = [ccxt.]GetValue(s, i)` -> `var x string = s[i]` when `s` is a `[]string`
// local and the declaration heads a counting loop bounded by `len(s)` (directly or via an
// unwritten int local); any write to the counter or slice, or a hazard read, keeps `any`.
// Container helpers on a local/parameter printed `[]any`/`[]string`/`map[string]any` (the only
// declaration of that name in its top-level func) become native Go where the helper adds nothing:
// len(x); x["k"] as the first argument of a helper that derefs it at entry; x["k"] = v on a proven non-nil map.
const GO_ACCESS_DEREF_CONSUMERS = [ 'SafeStringPtr', 'IsEqual', 'EvalTruthy', 'IsString', 'ToString', 'ParseInt', 'Add', 'GetValue' ];
const GO_ACCESS_NON_NIL_MAP_INIT = /^(?:map\[string\]any\{|(?:ccxt\.)?GetArgMap\(optionalArgs, \d+, map\[string\]any\{\}\)$|this\.(?:Extend|DeepExtend)\()/;
const GO_ACCESS_SCALAR_TYPES = [ 'string', 'int64', 'float64', 'bool', 'int' ];
// value types derefScalar passes through unchanged (it only unwraps pointers)
const GO_ACCESS_PLAIN_VALUE_TYPES = [ ...GO_ACCESS_SCALAR_TYPES, 'map[string]any', '[]any', '[]string' ];
const GO_ACCESS_DEREF_POINTER_TYPES = [ '*string', '*int64', '*float64', '*bool' ];

function goAccessEscape (name: string): string {
    return name.replace (/[^\w]/g, '');
}

// the Go type of `name` when the func text declares it exactly once (a `var` or a parameter
// of the top-level signature), with its initializer text for a `var`; undefined otherwise
function goAccessSingleDeclaration (maskedFunc: string, signature: string, name: string): any {
    const n = goAccessEscape (name);
    const vars = [ ...maskedFunc.matchAll (new RegExp ('\\bvar\\s+' + n + '\\s+([^=\\n]+?)\\s*(?:=|\\n)', 'g')) ];
    const shortDecls = maskedFunc.match (new RegExp ('(?:^|[^\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=', 'gm')) ?? [];
    const literalParams = [ ...maskedFunc.matchAll (/\bfunc\s*\(([^()]*)\)/g) ].filter ((m) => new RegExp ('\\b' + n + '\\b').test (m[1]));
    const rangeDecls = maskedFunc.match (new RegExp ('\\bfor\\b[^\\n{]*\\b' + n + '\\b[^\\n{]*:=\\s*range\\b')) ?? [];
    const sigParam = new RegExp ('[(,]\\s*' + n + '\\s+([^,()]+?)\\s*[,)]').exec (signature.substring (signature.indexOf ('(', signature.startsWith ('func (') ? signature.indexOf (')') + 1 : 0)));
    const count = vars.length + shortDecls.length + literalParams.length + rangeDecls.length + (sigParam ? 1 : 0);
    if (count !== 1) {
        return undefined;
    }
    if (sigParam) {
        return { 'type': sigParam[1].trim (), 'init': undefined };
    }
    if (vars.length === 1) {
        const line = maskedFunc.substring (vars[0].index).split ('\n')[0];
        return { 'type': vars[0][1].trim (), 'index': vars[0].index, 'line': line };
    }
    return undefined;
}

// hx11 w8: the same `var name []string = ...` repeated in sibling branches of one func (each branch
// re-lists `symbols := ObjectKeys(markets)`) is still one element type: every declaration is a
// plain `var` of exactly `[]string`, and no param, `:=`, range or func literal rebinds the name.
function goAccessRepeatedStringSliceDeclaration (maskedFunc: string, signature: string, name: string): any {
    const n = goAccessEscape (name);
    const vars = [ ...maskedFunc.matchAll (new RegExp ('\\bvar\\s+' + n + '\\s+([^=\\n]+?)\\s*(?:=|\\n)', 'g')) ];
    if ((vars.length < 2) || vars.some ((m) => m[1].trim () !== '[]string')) {
        return undefined;
    }
    const shortDecls = maskedFunc.match (new RegExp ('(?:^|[^\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=', 'gm')) ?? [];
    const literalParams = [ ...maskedFunc.matchAll (/\bfunc\s*\(([^()]*)\)/g) ].filter ((m) => new RegExp ('\\b' + n + '\\b').test (m[1]));
    const rangeDecls = maskedFunc.match (new RegExp ('\\bfor\\b[^\\n{]*\\b' + n + '\\b[^\\n{]*:=\\s*range\\b')) ?? [];
    const sigParam = new RegExp ('[(,]\\s*' + n + '\\s+([^,()]+?)\\s*[,)]').exec (signature.substring (signature.indexOf ('(', signature.startsWith ('func (') ? signature.indexOf (')') + 1 : 0)));
    if ((shortDecls.length > 0) || (literalParams.length > 0) || (rangeDecls.length > 0) || sigParam) {
        return undefined;
    }
    const line = maskedFunc.substring (vars[0].index).split ('\n')[0];
    return { 'type': '[]string', 'index': vars[0].index, 'line': line };
}

// line k sits directly in the body of an `if name != nil {` block (no else-if chain above it)
function goAccessInsideNilGuard (masked: string[], k: number, name: string): boolean {
    let depth = 0;
    for (let j = k - 1; j >= 0; j--) {
        const line = masked[j];
        for (let c = line.length - 1; c >= 0; c--) {
            depth += (line[c] === '}') ? 1 : ((line[c] === '{') ? -1 : 0);
            if (depth < 0) {
                const head = /^\s*if (.*) \{\s*$/.exec (goMapWriteIfHeader (masked, j));
                return (head !== null) && goMapWriteTopLevelParts (head[1], '&&').some ((c) => new RegExp ('^(?:\\(\\s*)?' + goAccessEscape (name) + ' != nil(?:\\s*\\))?$').test (c.trim ()));
            }
        }
    }
    return false;
}

function nativeTypedContainerAccess (content: string): string {
    if (!/\b(?:GetArrayLength|GetValue|AddElementToObject|InOp|ObjectKeys)\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            continue;
        }
        if ((start >= 0) && (lines[k] === '}')) {
            rewriteTypedContainerFunc (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

// Go types whose len() answers what GetArrayLength answers (nil slice -> 0, string -> bytes)
const GO_ARRLEN_NATIVE_TYPES = /^(?:string|\[\](?:any|string|int64|float64|bool|int|map\[string\]any|\[\]any))$/;
// hand-written callees whose Go signature returns []any (no generated override exists)
const GO_ARRLEN_SLICE_PRODUCER = /^(?:ccxt\.)?(?:this\.(?:ToArray|ArrayConcat|Sort|SortBy|SortBy2|FilterBy|ExtractParams)\(.*\)|(?:ListTyped|ArrayTyped|ObjectValues|SafeListTyped|SafeList2Typed|SafeListTypedDefault)\(.*\)|\[\]any\{.*\})$/;

// `var x any = P` -> `var x []any = P` when x is declared once, every write is a []any producer
// and no read observes the box itself (nil comparison, type assertion, address, multi-assign):
// each read then sees the same []any value it saw through the box.
function retypeSliceProducerLocals (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const names = new Set ([ ...maskedFunc.matchAll (/\bGetArrayLength\((\w+)\)/g) ].map ((m) => m[1]));
    for (const name of names) {
        const n = goAccessEscape (name);
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl === undefined) || (decl.type !== 'any') || (decl.index === undefined)) {
            continue;
        }
        const declRx = new RegExp ('^(\\s*var ' + n + ' )any( = )(.*)$');
        const writeRx = new RegExp ('^\\s*' + n + ' = (.*)$');
        let declLine = -1;
        let safe = true;
        for (let k = start + 1; (k < end) && safe; k++) {
            const d = declRx.exec (masked[k]);
            const w = writeRx.exec (masked[k]);
            const rhs = d ? lines[k].substring (d[1].length + 3 + d[2].length) : (w ? lines[k].substring (lines[k].length - w[1].length) : undefined);
            if (d) {
                declLine = k;
            }
            if ((rhs !== undefined) && !GO_ARRLEN_SLICE_PRODUCER.test (rhs.trim ())) {
                safe = false;
            }
            if ((rhs === undefined) && goTextWritesName (masked[k], n)) {
                safe = false;
            }
            if (new RegExp ('\\b' + n + '\\s*[!=]=|[!=]=\\s*' + n + '\\b|\\b' + n + '\\s*\\.\\s*\\(|&\\s*' + n + '\\b|\\b' + n + '\\s*,[^=\\n]*=|,\\s*' + n + '\\s*(?:,[^=\\n]*)?=').test (masked[k])) {
                safe = false;
            }
        }
        if (safe && (declLine >= 0)) {
            lines[declLine] = lines[declLine].replace (declRx, '$1[]any$2$3');
            masked[declLine] = masked[declLine].replace (declRx, '$1[]any$2$3');
        }
    }
}

// len(ObjectKeys(m)) -> len(m) on a map[string]any local/param: the helper derefs nothing
// for a plain map and counts every key, a nil map answers 0 either way
function goNativeObjectKeysLength (line: string, masked: string, typeAt: (name: string, k: number) => string | undefined, k: number): string {
    return line.replace (/(?<![\w.])len\((?:ccxt\.)?ObjectKeys\((\w+)\)\)/g, (all: string, name: string, at: number) =>
        (((masked.substr (at, all.length) === all) && (typeAt (name, k) === 'map[string]any')) ? 'len(' + name + ')' : all));
}

// len(ObjectKeys(x)) on an `any` local -> the comma-ok map assertion's len: ObjectKeys answers the keys of a map and
// nil for anything else, and a failed comma-ok assertion yields a nil map, so len() agrees in every case.
// `if` / `else if` conditions bind the map in the if-init; a plain statement gets one `xMap, _ :=` line above it.
function goAnyObjectKeysLength (lines: string[], masked: string[], start: number, end: number, k: number,
    typeAt: (name: string, k: number) => string | undefined): string {
    const line = lines[k];
    const m = masked[k];
    const call = /(?<![\w.])len\((?:ccxt\.)?ObjectKeys\((\w+)\)\)/g;
    const names = new Set<string> ();
    for (let hit = call.exec (m); hit !== null; hit = call.exec (m)) {
        names.add (hit[1]);
    }
    if (names.size !== 1) {
        return line;
    }
    const name = [ ...names ][0];
    const nameRx = goAccessEscape (name);
    const before = masked.slice (start, k).join ('\n');
    const isAny = (typeAt (name, k) === 'any')
        || new RegExp ('^\\s*' + nameRx + ' := (?:GetArg\\(optionalArgs, \\d+, [^\\n]*\\)|this\\.Omit\\([^\\n]*\\))\\s*$', 'm').test (before);
    const alone = masked.slice (start, end + 1).join ('\n').match (new RegExp ('(?:^|[^\\w.])' + nameRx + '\\s*(?:,\\s*\\w+\\s*)*:=', 'gm')) ?? [];
    const decls = masked.slice (start, end + 1).join ('\n').match (new RegExp ('\\bvar\\s+' + nameRx + '\\s', 'g')) ?? [];
    if (!isAny || ((alone.length + decls.length) !== 1)) {
        return line;
    }
    const mapName = name + 'Map';
    const bound = mapName + ', _ := ' + name + '.(map[string]any)';
    const replaced = line.replace (call, 'len(' + mapName + ')');
    const head = /^(\s*(?:\} else )?if )(.*) \{$/.exec (replaced);
    // an if-init binding is scoped to its own chain, so earlier ones of the same name never collide
    const taken = lines.slice (start, end + 1).filter ((l) => !l.includes ('if ' + bound + ';')).join ('\n');
    if (new RegExp ('\\b' + mapName + '\\b').test (taken)) {
        return line;
    }
    if ((head !== null) && ((m.match (/\{/g) ?? []).length === 1)) {
        return head[1] + bound + '; ' + head[2] + ' {';
    }
    if (!/^\s*(?:var \w+ \w+ = |\w+ := )/.test (line) || /[{}]/.test (m)) {
        return line;
    }
    return /^\s*/.exec (line)[0] + bound + '\n' + replaced;
}

function goAnyObjectKeysLengthSelfTest (): string[] {
    const problems: string[] = [];
    const run = (body: string) => nativeTypedContainerAccess ('func (this *X) f(optionalArgs ...any) any {\n' + body + '\treturn nil\n}');
    const ifForm = run ('\tquery := this.Omit(optionalArgs, "a")\n\tif len(ObjectKeys(query)) > 0 {\n\t\tthis.Urlencode(query)\n\t}\n');
    if (!ifForm.includes ('if queryMap, _ := query.(map[string]any); len(queryMap) > 0 {') || ifForm.includes ('ObjectKeys')) {
        problems.push ('goAnyObjectKeysLength: if form: ' + ifForm);
    }
    const stmt = run ('\tvar query any = this.Omit(optionalArgs, "a")\n\tvar n int = len(ObjectKeys(query))\n');
    if (!stmt.includes ('\tqueryMap, _ := query.(map[string]any)\n\tvar n int = len(queryMap)\n')) {
        problems.push ('goAnyObjectKeysLength: statement form: ' + stmt);
    }
    const reused = run ('\tvar query any = nil\n\tquery = 1\n\tvar n int = len(ObjectKeys(query))\n');
    if (!reused.includes ('queryMap, _ := query.(map[string]any)\n\tvar n int = len(queryMap)')) {
        problems.push ('goAnyObjectKeysLength: a re-assigned any local binds at the use site: ' + reused);
    }
    const twice = run ('\tquery := this.Omit(optionalArgs, \"a\")\n\tif len(ObjectKeys(query)) > 0 {\n\t\tx()\n\t} else if len(ObjectKeys(query)) > 1 {\n\t\ty()\n\t}\n');
    if (twice.includes ('ObjectKeys') || (twice.match (/queryMap, _ :=/g) ?? []).length !== 2) {
        problems.push ('goAnyObjectKeysLength: if / else-if chain: ' + twice);
    }
    const typed = run ('\tvar query map[string]any = map[string]any{}\n\tvar n int = len(ObjectKeys(query))\n');
    if (!typed.includes ('len(query)')) {
        problems.push ('goAnyObjectKeysLength: typed map regressed: ' + typed);
    }
    return problems;
}

function rewriteTypedContainerFunc (lines: string[], masked: string[], start: number, end: number) {
    retypeSliceProducerLocals (lines, masked, start, end);
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const lineOffsets: number[] = [];
    let offset = 0;
    for (let k = start; k <= end; k++) {
        lineOffsets.push (offset);
        offset += masked[k].length + 1;
    }
    const cache = new Map<string, any> ();
    const declOf = (name: string) => {
        if (!cache.has (name)) {
            cache.set (name, goAccessSingleDeclaration (maskedFunc, lines[start], name));
        }
        return cache.get (name);
    };
    // declared before this line (a parameter always is)
    const typeAt = (name: string, k: number): string | undefined => {
        const decl = declOf (name);
        if ((decl === undefined) || ((decl.index !== undefined) && (decl.index >= lineOffsets[k - start]))) {
            return undefined;
        }
        return decl.type;
    };
    const notRebound = (name: string): boolean => !new RegExp ('(?:^|[^\\w.&*])' + goAccessEscape (name) + '\\s*=(?!=)|&\\s*' + goAccessEscape (name) + '\\b', 'm').test (maskedFunc);
    const consumers = GO_ACCESS_DEREF_CONSUMERS.join ('|');
    for (let k = start + 1; k < end; k++) {
        let line = lines[k];
        const original = line;
        const m = masked[k];
        if (goNativeInOp (lines, masked, k, maskedFunc, declOf, typeAt)) {
            continue;
        }
        if (!/\b(?:GetArrayLength|GetValue|AddElementToObject|ObjectKeys)\(/.test (m)) {
            continue;
        }
        const isCode = (text: string, at: number) => m.substr (at, text.length) === text;
        line = line.replace (/(?<![\w.])(?:ccxt\.)?GetArrayLength\((\w+)\)/g, (all: string, name: string, at: number) => {
            const t = typeAt (name, k);
            return (isCode (all, at) && (t !== undefined) && GO_ARRLEN_NATIVE_TYPES.test (t)) ? 'len(' + name + ')' : all;
        });
        if (line.length === lines[k].length) {
            line = line.replace (new RegExp ('((?<![\\w.])(?:ccxt\\.)?(?:' + consumers + ')\\()(?:ccxt\\.)?GetValue\\((\\w+), ("[^"\\\\\\n]*")\\)', 'g'), (all: string, head: string, name: string, key: string, at: number) =>
                ((isCode (head, at) && (typeAt (name, k) === 'map[string]any')) ? head + name + '[' + key + ']' : all));
        }
        if (line === lines[k]) {
            goNativeMapWrite (lines, masked, start, end, k, maskedFunc, declOf, typeAt, notRebound);
        } else {
            lines[k] = line;
        }
        if ((lines[k] === original) && /\bObjectKeys\(/.test (m)) {
            lines[k] = goNativeObjectKeysLength (lines[k], m, typeAt, k);
            if (lines[k] === original) {
                lines[k] = goAnyObjectKeysLength (lines, masked, start, end, k, typeAt);
            }
        }
    }
}

// every write of a map local is a map producer owned by this call or its caller (never a this.* map)
const GO_INOP_READ_INIT = /^(?:(?:ccxt\.)?map\[string\]any\{|(?:ccxt\.)?GetArgMap\(optionalArgs, \d+, (?:map\[string\]any\{\}|nil)\)$|this\.(?:Extend|DeepExtend|IndexBy)\(|(?:ccxt\.)?MapTyped\(this\.Omit\(\w+, |nil$)/;

// InOp only reads, and a Go read of a nil map answers ok=false like the helper, so the receiver
// needs a static map[string]any that no other goroutine can write: no go/Spawn/unawaited Async here
function goInOpReadReceiver (maskedFunc: string, decl: any, name: string, declOf: (name: string) => any): boolean {
    if ((decl === undefined) || (decl.index === undefined) || (decl.type !== 'map[string]any')) {
        return false;
    }
    const n = goAccessEscape (name);
    if (/\bgo\s+\w|\bSpawn\(|\bDelay\(/.test (maskedFunc)
        || /^(?![^\n]*<-)[^\n]*\w+Async\(/m.test (maskedFunc)
        || new RegExp ('&\\s*' + n + '\\b|(?:^|[^\\w.])' + n + '\\s*(?:,[^=\\n]*)?:=|,\\s*' + n + '\\s*(?:,[^=\\n]*)?=(?!=)|(?:^|[^\\w.])' + n + '\\s*,[^=\\n]*=(?!=)', 'm').test (maskedFunc)) {
        return false;
    }
    const writes = [ decl.line.replace (/^\s*var\s+\w+\s+\S+\s*=\s*/, '').trim () ];
    for (const w of maskedFunc.matchAll (new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*=(?!=)\\s*([^\\n]*)', 'gm'))) {
        writes.push (w[1].trim ());
    }
    return writes.every ((init: string) => {
        // element 1 of a base handle*(..., params) tuple is that params map or a fresh copy
        const tuple = /^(?:ccxt\.)?MapTyped\((?:(?:ccxt\.)?GetValue\((\w+), 1\)|(\w+)\[1\])\)$/.exec (init);
        const holderName = (tuple === null) ? undefined : (tuple[1] ?? tuple[2]);
        const holder = (holderName === undefined) ? undefined : declOf (holderName);
        return GO_INOP_READ_INIT.test (init) || hx4G16InOpOwnedMapWrite (init) || ((holder !== undefined) && (holder.index !== undefined)
            && /^\s*var\s+\w+\s+\[\]any\s*=\s*this\.(?:HandleWithdrawTagAndParams|HandleParamString2?|HandleParamBool)\(/.test (holder.line));
    });
}

// `InOp(m, k)` in an `if` condition or a `var x bool =` initialiser -> native lookup on a proven read
// receiver with a string key: `if _, ok := m[k]; ok {` for a lone call, else a comma-ok closure.
function goNativeInOp (lines: string[], masked: string[], k: number, maskedFunc: string,
    declOf: (name: string) => any, typeAt: (name: string, k: number) => string | undefined): boolean {
    const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (masked[k]);
    const boolInit = /^\s*var \w+ bool = [^;{}]*$/.test (masked[k]);
    const calls = [ ...masked[k].matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
    if (((cond === null) && !boolInit) || (calls.length === 0)) {
        return false;
    }
    const found: any[] = [];
    for (const c of calls) {
        const at = c.index;
        const call = /^(?:ccxt\.)?InOp\((\w+|this\.Markets\(\)), (\w+|"[^"\\\n]*")\)/.exec (lines[k].substring (at));
        if ((call === null) || (goMapWriteGroupEnd (masked[k], at + call[0].indexOf ('(')) !== at + call[0].length)) {
            continue;
        }
        const [ , name, key ] = call;
        // this.Markets() answers the published immutable snapshot (map[string]any, nil before load): a
        // read of it is safe in any function, and a nil map reads ok=false like the helper
        if (name !== 'this.Markets()' && ((typeAt (name, k) !== 'map[string]any') || !goInOpReadReceiver (maskedFunc, declOf (name), name, declOf))) {
            continue;
        }
        if (!key.startsWith ('"') && (typeAt (key, k) !== 'string')) {
            continue;
        }
        found.push ({ at, 'length': call[0].length, name, key });
    }
    if (found.length === 0) {
        return false;
    }
    if ((cond !== null) && (calls.length === 1) && !/\bok\b/.test (maskedFunc)) {
        const { at, length, name, key } = found[0];
        let rest = lines[k].substring (cond[1].length, at) + 'ok' + lines[k].substring (at + length);
        rest = rest.replace (/(^|[^\w)\]])\(ok\)/g, '$1ok');
        lines[k] = cond[1] + '_, ok := ' + name + '[' + key + ']; ' + rest;
        return true;
    }
    let line = lines[k];
    for (const { at, length, name, key } of found.reverse ()) {
        line = line.substring (0, at) + 'func() bool { _, ok := ' + name + '[' + key + ']; return ok }()' + line.substring (at + length);
    }
    lines[k] = line;
    return true;
}

// ------------------------------------------------------------------------------------
// AddElementToObject(m, k, v) -> m[k] = v
// ------------------------------------------------------------------------------------
// The helper derefs a pointer key/value (a nil pointer or a typed-nil container becomes
// untyped nil) and is a no-op on a typed-nil map; its mutex guards shared maps only. So the
// native write needs a never-nil map local, a string key and a value the deref leaves alone.
const GO_MAPWRITE_NON_NIL_INIT = /^(?:(?:ccxt\.)?map\[string\]any\{|(?:ccxt\.)?GetArgMap\(optionalArgs, \d+, map\[string\]any\{\}\)$|this\.(?:Extend|DeepExtend)\(|this\.Account\(\)$|this\.SafeDict(?:2)?Map\([^\n]*, map\[string\]any\{\}\)$)/;  // hx11 M43: a literal-default SafeDictMap read of decoded data is never nil
// hand-written callees (no generated override) whose result derefScalar leaves unchanged
const GO_MAPWRITE_PLAIN_CALLS = [
    'this.Milliseconds', 'this.Seconds', 'this.Microseconds', 'this.Uuid', 'this.Uuid2', 'this.Uuid16', 'this.Uuid22',
    'this.Extend', 'this.DeepExtend', 'this.Json', 'this.Capitalize', 'this.ParseTimeframe', 'this.Account',
    'this.ParseToInt',  // hx4 G34: base-only, returns int64
    'GetValue', 'ToString', 'ToLower', 'ToUpper', 'MathFloor', 'MathCeil', 'MathRound', 'MathAbs', 'ParseInt', 'Json', 'JsonStringify',
];

// end index (exclusive) of the balanced group opening at text[open], or -1
function goMapWriteGroupEnd (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if (depth === 0) {
            return i + 1;
        }
    }
    return -1;
}

// every declaration and write of a local map is a never-nil map producer
function goMapWriteLocalNeverNil (maskedFunc: string, decl: any, name: string, declOf?: (name: string) => any, depth: number = 0): boolean {
    const producer = GO_MAPWRITE_NON_NIL_INIT;
    if ((decl === undefined) || (decl.index === undefined)) {
        return false;
    }
    const init = decl.line.replace (/^\s*var\s+\w+\s+\S+\s*=\s*/, '').trim ();
    // element 0 of the base handleUntilOption tuple is the request map it was handed
    const until = /^(?:ccxt\.)?MapTyped\((?:ccxt\.)?GetValue\((\w+), 0\)\)$/.exec (init);
    let admitted = producer.test (init);
    // Omit on a never-nil map answers a fresh map (exchange_functions.go OmitN/OmitMap)
    const omit = /^(?:ccxt\.)?MapTyped\(this\.Omit\((\w+), /.exec (init);
    if (!admitted && (omit !== null) && (omit[1] !== name) && (declOf !== undefined) && (depth < 4)) {
        admitted = goMapWriteLocalNeverNil (maskedFunc, declOf (omit[1]), omit[1], declOf, depth + 1);
    }
    if (!admitted && (until !== null) && (declOf !== undefined) && (depth < 4)) {
        const tuple = declOf (until[1]);
        const call = (tuple === undefined || tuple.index === undefined) ? null
            : /^\s*var\s+\w+\s+\[\]any\s*=\s*this\.HandleUntilOption\((?:\w+|\s*), (\w+), /.exec (tuple.line);
        admitted = (call !== null) && !new RegExp ('(?:^|[^\\w.&*])' + goAccessEscape (until[1]) + '\\s*=(?!=)|&\\s*' + goAccessEscape (until[1]) + '\\b', 'm').test (maskedFunc)
            && goMapWriteLocalNeverNil (maskedFunc, declOf (call[1]), call[1], declOf, depth + 1);
    }
    if (!admitted && (declOf !== undefined) && (depth < 4)) {
        admitted = hx4G34TupleSlotNeverNil (maskedFunc, init, declOf, depth);  // hx4 G34
    }
    if (!admitted) {
        return false;
    }
    const n = goAccessEscape (name);
    if (goG14MapLocalRebound (maskedFunc, n)) {
        return false; // address taken or multi-value rebinding
    }
    for (const w of maskedFunc.matchAll (new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*=(?!=)\\s*([^\\n]*)', 'gm'))) {
        if (!producer.test (w[1].trim ()) && !w[1].trim ().startsWith ('this.OmitDict(' + name + ', ') && !hx4G10SelfMapRebind (w[1].trim (), name)) { // G10K-addelem: self-omit
            return false;
        }
    }
    return true;
}

// the masked value text is one call of a plain-return callee, or one map/slice literal
function goMapWritePlainValueExpr (maskedValue: string): boolean {
    const literal = /^(?:ccxt\.)?(?:map\[string\]any|\[\]any|\[\]string)\{/.exec (maskedValue);
    const call = /^(?:ccxt\.)?((?:this\.)?\w+)\(/.exec (maskedValue);
    let open = -1;
    if (literal !== null) {
        open = literal[0].length - 1;
    } else if ((call !== null) && (GO_MAPWRITE_PLAIN_CALLS.indexOf (call[1]) >= 0)) {
        open = call[0].length - 1;
    }
    return (open >= 0) && (goMapWriteGroupEnd (maskedValue, open) === maskedValue.length);
}

// OrderBookInterface field writes: AddElementToObject(orderbook, "timestamp", ts) -> orderbook.SetTimestamp(ts).
// The setters (exchange_orderbook.go) take the *int64/*string a Safe*/Parse8601/Iso8601 call answers and are
// a no-op on a nil pointer, like the helper's deref-then-skip. A nil interface receiver would panic where the
// helper is a no-op, so the receiver must be a type assertion `x.(ccxt.OrderBookInterface)` (panics, never nil).
const GO_ORDERBOOK_SETTERS: { [key: string]: [ string, RegExp ] } = {
    'timestamp': [ 'SetTimestamp', /^(?:this\.(?:Parse8601|SafeInteger|SafeInteger2|SafeIntegerN)\()/ ],
    'nonce': [ 'SetNonce', /^(?:this\.(?:SafeInteger|SafeInteger2|SafeIntegerN)\()/ ],
    'datetime': [ 'SetDatetime', /^(?:this\.Iso8601\()/ ],
    'symbol': [ 'SetSymbol', /^(?:this\.SafeSymbol\()/ ],
};
const GO_ORDERBOOK_SETTER_TYPES: { [key: string]: string } = { 'timestamp': '*int64', 'nonce': '*int64', 'datetime': '*string', 'symbol': '*string' };

// A nil interface answers the helper with a no-op but panics on a method call. An earlier method call on the same
// receiver (GetAsks/GetBids/Reset/GetCache/Limit) in a block that still encloses line k, with no write to the local in
// between, has already panicked on a nil receiver, so the setter call can not newly panic.
function goOrderBookReceiverDereferenced (lines: string[], masked: string[], k: number, name: string, indent: number): boolean {
    const n = goAccessEscape (name);
    const call = new RegExp ('(?<![\\w.])' + n + '(?:\\.\\(ccxt\\.OrderBookInterface\\))?\\.(?:GetAsks|GetBids|Reset|GetCache|Limit)\\(');
    const write = new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*(?:=(?!=)|:=)|&\\s*' + n + '\\b');
    // a single-value interface assertion panics on nil: the book is already non-nil after it
    const asserted = new RegExp ('^\\s*(?:var ' + n + ' (?:ccxt\\.)?OrderBookInterface = |' + n + ' = )[^\\n]*\\.\\((?:ccxt\\.)?OrderBookInterface\\)$');
    let level = indent;
    for (let j = k - 1; j >= 0; j--) {
        if (/^func /.test (masked[j])) {
            return false;
        }
        if (masked[j].trim () === '') {
            continue;
        }
        const ind = /^\t*/.exec (masked[j])[0].length;
        if (ind < level) {
            // an enclosing block opener (`if x {`, `for ... {`, `func() {`) keeps the statements above it in force;
            // an `} else {` or a case label means the earlier lines were another branch
            if (!/\{$/.test (masked[j]) || /^\s*(?:\}|case\b|default\b)/.test (masked[j])) {
                return false;
            }
            if (/^\s*for\b|\bfunc\(/.test (masked[j])) {
                // a loop or closure body may run again after a later write: the local must never be rebound after k
                for (let m = k + 1; m < masked.length && !/^\}/.test (masked[m]); m++) {
                    if (write.test (masked[m])) {
                        return false;
                    }
                }
            }
            level = ind;
            continue;
        }
        if ((ind === indent) && asserted.test (masked[j])) {
            return true;  // a single-value interface assertion panics on nil: the book is already non-nil here
        }
        if (/^\s*(?:\w+:|goto\b)/.test (masked[j]) || write.test (masked[j])) {
            if (!(ind === level && asserted.test (masked[j]))) {
                return false;
            }
        }
        if ((ind === level) && (call.test (masked[j]) || asserted.test (masked[j]))) {
            return true;
        }
    }
    return false;
}

function goNativeOrderBookSetter (lines: string[], masked: string[], k: number, declOf: (name: string) => any,
    typeAt: (name: string, k: number) => string | undefined, notRebound: (name: string) => boolean): boolean {
    // string literals are blanked in masked: it proves the call is code, lines[k] carries the key
    const head = /^(\s*)(?:ccxt\.)?AddElementToObject\((\w+), /.exec (masked[k]);
    if ((head === null) || (lines[k].substring (0, head[0].length) !== head[0])) {
        return false;
    }
    const text = /^(\s*)(?:ccxt\.)?AddElementToObject\((\w+), \"(timestamp|nonce|datetime|symbol)\", ([^\n]+)\)$/.exec (lines[k]);
    if (text === null) {
        return false;
    }
    const [ , indent, name, field, value ] = text;
    if (!/^(?:ccxt\.)?OrderBookInterface$/.test (typeAt (name, k) ?? '') || !goOrderBookReceiverDereferenced (lines, masked, k, name, indent.length)) {
        return false;
    }
    const [ setter, producer ] = GO_ORDERBOOK_SETTERS[field];
    const valueMasked = masked[k].substring (masked[k].length - value.length - 1, masked[k].length - 1);
    const typedLocal = /^\w+$/.test (value) && (typeAt (value, k) === GO_ORDERBOOK_SETTER_TYPES[field]);
    const call = producer.test (value) && (goMapWriteGroupEnd (valueMasked, value.indexOf ('(')) === value.length);
    if (!typedLocal && !call) {
        return false;
    }
    lines[k] = indent + name + '.' + setter + '(' + value + ')';
    masked[k] = masked[k].replace (/\S[\s\S]*/, (t: string) => ' '.repeat (t.length));
    return true;
}

// Runs after nativeOrderBookSideReads: only then is the book local typed OrderBookInterface and the earlier
// GetAsks()/GetBids() call that proves it non-nil printed (hx4G25Pass runs before both, where the local is still `any`).
function goOrderBookSetterPass (content: string): string {
    if (!/\bAddElementToObject\(\w+, \"(?:timestamp|nonce|datetime|symbol)\"/.test (content) || !/\bOrderBookInterface\b/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            const resolve = hx4G25Scope (masked, start, k);
            const maskedFunc = masked.slice (start, k + 1).join ('\n');
            const notRebound = (name: string): boolean => !new RegExp ('(?:^|[^\\w.&*])' + goAccessEscape (name) + '\\s*=(?!=)|&\\s*' + goAccessEscape (name) + '\\b', 'm').test (maskedFunc);
            const declOf = (name: string) => resolve (name, k);
            const typeAt = (name: string, at: number) => { const d = resolve (name, at); return (d === undefined) ? undefined : d.type; };
            for (let j = start + 1; j < k; j++) {
                if (masked[j].indexOf ('AddElementToObject(') >= 0) {
                    goNativeOrderBookSetter (lines, masked, j, declOf, typeAt, notRebound);
                }
            }
            start = -1;
        }
    }
    return lines.join ('\n');
}

function goOrderBookSetterCheck (): string[] {
    const problems: string[] = [];
    const body = (decl: string, pre: string, tail: string) => 'func (this *X) f(p any) any {\n\tvar ts *int64 = this.SafeInteger(p, \"ts\")\n\t' + decl + '\n\tif true {\n' + pre + tail + '\t}\n\treturn nil\n}\n';
    const decl = 'var orderbook any = ccxt.GetValue(this.Orderbooks, symbol)';
    const typed = 'var orderbook ccxt.OrderBookInterface = ccxt.OrderBookTyped(this.Orderbooks[*symbol])';
    const side = '\t\tthis.HandleDeltas(orderbook.GetAsks(), asks)\n';
    const write = '\t\tccxt.AddElementToObject(orderbook, \"timestamp\", ts)\n\t\tccxt.AddElementToObject(orderbook, \"datetime\", this.Iso8601(ts))\n';
    let r = goOrderBookSetterPass (body (typed, side, write));
    if (!r.includes ('orderbook.SetTimestamp(ts)') || !r.includes ('orderbook.SetDatetime(this.Iso8601(ts))')) {
        problems.push ('orderbook setter: typed book after a GetAsks call must go native: ' + r);
    }
    r = goOrderBookSetterPass (body (typed, '', write));
    if (r.includes ('.SetTimestamp(')) {
        problems.push ('orderbook setter: no earlier method call must keep the helper: ' + r);
    }
    r = goOrderBookSetterPass (body (decl, side, write));
    if (r.includes ('.SetTimestamp(')) {
        problems.push ('orderbook setter: an any-typed book must keep the helper: ' + r);
    }
    r = goOrderBookSetterPass (body ('var orderbook ccxt.OrderBookInterface = this.Orderbooks[*symbol].(ccxt.OrderBookInterface)', '', write));
    if (!r.includes ('orderbook.SetTimestamp(ts)')) {
        problems.push ('orderbook setter: a book from a single-value assertion is non-nil: ' + r);
    }
    r = goOrderBookSetterPass ('func (this *X) f(p any) any {\n\tvar ts *int64 = this.SafeInteger(p, \"ts\")\n\t' + typed.replace ('OrderBookTyped(this.Orderbooks[*symbol])', 'this.Orderbooks[*symbol].(ccxt.OrderBookInterface)') + '\n\tfor i := 0; i < 2; i++ {\n\t\tif ts != nil {\n\t\t\tccxt.AddElementToObject(orderbook, \"timestamp\", ts)\n\t\t}\n\t}\n\treturn nil\n}\n');
    if (!r.includes ('orderbook.SetTimestamp(ts)')) {
        problems.push ('orderbook setter: an assertion above the enclosing blocks still proves non-nil: ' + r);
    }
    r = goOrderBookSetterPass ('func (this *X) f(p any) any {\n\tvar ts *int64 = this.SafeInteger(p, \"ts\")\n\tvar orderbook ccxt.OrderBookInterface\n\tif ts != nil {\n\t\torderbook = this.Orderbooks[*symbol].(ccxt.OrderBookInterface)\n\t}\n\tccxt.AddElementToObject(orderbook, \"timestamp\", ts)\n\treturn nil\n}\n');
    if (r.includes ('.SetTimestamp(')) {
        problems.push ('orderbook setter: an assertion in a sibling branch proves nothing: ' + r);
    }
    return problems;
}

function goNativeMapWrite (lines: string[], masked: string[], start: number, end: number, k: number, maskedFunc: string,
    declOf: (name: string) => any, typeAt: (name: string, k: number) => string | undefined, notRebound: (name: string) => boolean) {
    const m = masked[k];
    const head = /^(\s*)(?:ccxt\.)?AddElementToObject\((\w+), /.exec (m);
    if ((head === null) || (lines[k].substring (0, head[0].length) !== head[0])) {
        return;
    }
    const name = head[2];
    if (((typeAt (name, k) !== 'map[string]any') || !goMapWriteLocalNeverNil (maskedFunc, declOf (name), name, declOf))
        && !h2kG10UntilReceiverNeverNil (masked, start, k, maskedFunc, lines[start], name, declOf, typeAt)) {
        return;
    }
    // the call may span lines (a multi-line literal value): it must be the whole statement
    const tail = masked.slice (k, end).join ('\n');
    const open = m.indexOf ('(', head[1].length);
    const close = goMapWriteGroupEnd (tail, open);
    if ((close < 0) || (tail.substring (close).split ('\n')[0].trim () !== '')) {
        return;
    }
    const lastLine = k + tail.substring (0, close).split ('\n').length - 1;
    const argsMasked = tail.substring (head[0].length, close - 1);
    const argsText = lines.slice (k, lastLine + 1).join ('\n').substring (head[0].length, close - 1);
    let depth = 0;
    let comma = -1;
    for (let i = 0; i < argsMasked.length; i++) {
        const c = argsMasked[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if ((depth === 0) && (c === ',')) {
            comma = i;
            break;
        }
    }
    if ((comma < 0) || (argsMasked[comma + 1] !== ' ') || (argsMasked.substring (0, comma).indexOf ('\n') >= 0)) {
        return;
    }
    const key = argsText.substring (0, comma);
    const value = argsText.substring (comma + 2);
    const valueMasked = argsMasked.substring (comma + 2);
    // a pointer the enclosing `if p != nil {` proves non-nil: the helper stores *p
    const guardedPointer = (text: string) => /^\w+$/.test (text) && (GO_ACCESS_DEREF_POINTER_TYPES.indexOf (typeAt (text, k) ?? '') >= 0)
        && notRebound (text) && (goAccessInsideNilGuard (masked, k, text) || goG14EnclosingNilGuard (masked, start, k, text) || goMapWriteDominatingNilGuard (masked, start, k, text, maskedFunc, declOf));
    let keyOut: string | undefined = undefined;
    if (/^"[^"\\\n]*"$/.test (key) || (/^\w+$/.test (key) && (typeAt (key, k) === 'string'))) {
        keyOut = key;
    } else if (guardedPointer (key) && (typeAt (key, k) === '*string')) {
        keyOut = '*' + key;
    }
    // a nil *string key makes the helper a no-op: `if k != nil { m[*k] = v }` is its map
    // branch, so the write can be guarded instead of demanding a non-nil proof.
    const nilKeyGuardable = (keyOut === undefined) && /^\w+$/.test (key) && (typeAt (key, k) === '*string')
        && notRebound (key) && (lastLine === k);
    let nilKeyGuard = false;
    const valueType = /^\w+$/.test (value) ? typeAt (value, k) : undefined;
    // SafeString with a string default never answers nil (exchange_safe.go)
    const defaulted = /^this\.SafeString\((\w+(?:\[\"[^\"\\\n]*\"\])?|this\.\w+), (\w+|"[^"\\\n]*"), (\w+|"[^"\\\n]*")\)$/.exec (value);
    const defaultedOk = (defaulted !== null) && (defaulted[3].startsWith ('"') || (typeAt (defaulted[3], k) === 'string'));
    let valueOut: string | undefined = undefined;
    if ((keyOut === undefined) && !nilKeyGuardable) {
        return;
    }
    if (/^(?:"[^"\\\n]*"|-?\d+(?:\.\d+)?|true|false|nil)$/.test (value) || goMapWritePlainValueExpr (valueMasked)) {
        valueOut = value;
    } else if ((valueType !== undefined) && (GO_ACCESS_SCALAR_TYPES.indexOf (valueType) >= 0)) {
        valueOut = value;
    } else if ((valueType !== undefined) && (keyOut !== undefined) && keyOut.startsWith ('"') && (GO_ACCESS_PLAIN_VALUE_TYPES.indexOf (valueType) >= 0)) {
        valueOut = value; // container locals under a literal key, as the typed-container pass always printed them
    } else if ((valueType === 'map[string]any') && goMapWriteLocalNeverNil (maskedFunc, declOf (value), value, declOf)) {
        valueOut = value; // the helper would store a typed-nil map as untyped nil
    } else if ((valueType === 'map[string]any') && hx4G29NeverNilMapValue (lines, maskedFunc, declOf (value), value)) {
        valueOut = value; // hx11 M320: a TickerToMap/OrderToMap/producer-call local is a fresh non-nil map, the helper stores it unchanged
    } else if (guardedPointer (value)) {
        valueOut = '*' + value;
    } else if ((valueType === '*float64') && goMapWritePointerSinkOnly (maskedFunc, name)) {
        valueOut = value; // hx11 r2: a typed *float64 (ParseNumber/SafeNumber) is stored as the pointer map literals already hold
    } else if (defaultedOk) {
        valueOut = '*' + value;
    } else if ((valueType === 'any') && notRebound (value) && goMapWriteMapResultLocal (lines, declOf (value))) {
        valueOut = value; // every return of the producer is a fresh non-nil map
    } else if (!nilKeyGuardable && goMapWriteMapResultCall (lines, valueMasked) && (goMapWriteGroupEnd (valueMasked, valueMasked.indexOf ('(')) === valueMasked.length)) {
        valueOut = value;
    } else if ((valueType === 'any') && goMapWriteDerefedAnyLocal (maskedFunc, declOf (value), value)) {
        valueOut = value; // every write is already deref'd (derefScalar is idempotent), so the helper's deref is a no-op
    }
    if ((valueOut === undefined) && !nilKeyGuardable && (lastLine === k)) {
        valueOut = hx4G39PointerValue (lines, value, valueMasked, typeAt (value, k))?.replace (/\n/g, '\n' + head[1]);  // hx4 G39
    }
    if ((valueOut !== undefined) && (keyOut === undefined) && nilKeyGuardable && (valueOut.indexOf ('\n') < 0)) {
        keyOut = '*' + key;  // hx10w7 G06: guarded *string key, exact copy of the helper's map branch
        nilKeyGuard = true;
    }
    if ((keyOut === undefined) || (valueOut === undefined)) {
        return;
    }
    const suffix = lines[lastLine].substring (lines[lastLine].length - (tail.substring (close).split ('\n')[0].length));
    if (nilKeyGuard) {
        lines[k] = head[1] + 'if ' + key + ' != nil {\n' + head[1] + '\t' + name + '[' + keyOut + '] = ' + valueOut + suffix + '\n' + head[1] + '}';
        masked[k] = masked[k].replace (/\S[\s\S]*/, (s: string) => ' '.repeat (s.length));
        return;
    }
    if (valueOut.startsWith ('func() any {\n') && (lastLine === k)) {  // hx4 G39: one entry, the line count stays
        lines[k] = head[1] + name + '[' + keyOut + '] = ' + valueOut + suffix;
        masked[k] = masked[k].replace (/\S[\s\S]*/, (s: string) => ' '.repeat (s.length));
        return;
    }
    const rewritten = (head[1] + name + '[' + keyOut + '] = ' + valueOut + suffix).split ('\n');
    lines.splice (k, rewritten.length, ...rewritten);
    masked[k] = masked[k].replace (/\S[\s\S]*/, (s: string) => ' '.repeat (s.length));
}

// an earlier `if name == nil [|| ...] { ...; continue|return|panic }` in a block that still
// encloses line k, after the single declaration of name: every path reaching k has name != nil
function goMapWriteDominatingNilGuard (masked: string[], start: number, k: number, name: string, maskedFunc: string, declOf: (name: string) => any): boolean {
    const decl = declOf (name);
    if ((decl === undefined) || (decl.index === undefined) || /\bgoto\b/.test (maskedFunc)) {
        return false;
    }
    const declLine = start + maskedFunc.substring (0, decl.index).split ('\n').length - 1;
    const n = goAccessEscape (name);
    const nilTest = new RegExp ('^(?:\\(\\s*)?(?:' + n + ' == nil|IsEqual\\(' + n + ', nil\\))(?:\\s*\\))?$');
    for (let g = k - 1; g > declLine; g--) {
        const head = /^\s*if (.*) \{$/.exec (masked[g]);
        if ((head === null) || !goMapWriteTopLevelParts (head[1], '||').some ((d) => nilTest.test (d.trim ()))) {
            continue;
        }
        // the guard body: balanced, ends with a terminator, closed by a bare `}`
        let depth = 1;
        let close = -1;
        let last = '';
        for (let j = g + 1; (j < k) && (close < 0); j++) {
            for (const c of masked[j]) {
                depth += (c === '{') ? 1 : ((c === '}') ? -1 : 0);
            }
            if (depth === 0) {
                close = j;
            } else if ((depth === 1) && (masked[j].trim () !== '')) {
                last = masked[j].trim ();
            }
        }
        if ((close < 0) || (masked[close].trim () !== '}') || !/^(?:continue|return\b.*|panic\(.*\))$/.test (last)) {
            continue;
        }
        // the guard's own block must still enclose line k
        let level = 0;
        let encloses = true;
        for (let j = close + 1; (j < k) && encloses; j++) {
            for (const c of masked[j]) {
                level += (c === '{') ? 1 : ((c === '}') ? -1 : 0);
                if (level < 0) {
                    encloses = false;
                    break;
                }
            }
        }
        if (encloses) {
            return true;
        }
    }
    return false;
}

// the `if ... {` header ending on line j, joined when its condition spans lines
// (a func literal inside it); the line itself when no balanced header starts above
function goMapWriteIfHeader (masked: string[], j: number): string {
    let text = masked[j];
    for (let i = j; (i >= 0) && (i > j - 20); i--) {
        text = (i === j) ? masked[j] : (masked[i] + '\n' + text);
        if (/^\s*if /.test (masked[i])) {
            let depth = 0;
            const body = text.substring (0, text.lastIndexOf ('{'));
            for (const c of body) {
                depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
                if (depth < 0) {
                    break;
                }
            }
            if (depth === 0) {
                return text.replace (/\n\s*/g, ' ');
            }
        }
    }
    return masked[j];
}

// the `||` or `&&` operands of a condition at paren depth 0
function goMapWriteTopLevelParts (condition: string, op: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let from = 0;
    for (let i = 0; i < condition.length; i++) {
        const c = condition[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if ((depth === 0) && condition.startsWith (op, i)) {
            parts.push (condition.substring (from, i));
            from = i + 2;
        }
    }
    parts.push (condition.substring (from));
    return parts;
}

// `// AddElementToObject(m, k, v) -> m[k] = v` producers: base methods whose every return is a fresh map
const GO_MAPWRITE_MAP_RESULT_BASE = [ 'SafeCurrencyStructure', 'SafeTicker', 'SafeOrder', 'SafeOpenInterest', 'SafeLedgerEntry', 'DepositWithdrawFee', 'Account', 'Extend' ];

// hx11 M320: `return account` in a callee whose only `account` is `var account <map|any> = this.Account()`,
// written solely as `account[k] = v` (never rebound, address-taken or passed on): a fresh non-nil map
function goMapWriteCalleeAccountLocal (lines: string[], def: number, name: string): boolean {
    if (!/^\w+$/.test (name)) {
        return false;
    }
    let decls = 0;
    const n = goAccessEscape (name);
    const word = new RegExp ('(?<![\\w.])' + n + '(?![\\w])');
    const declRx = new RegExp ('^\\s*var ' + n + ' (?:map\\[string\\]any|any) = this\\.Account\\(\\)$');
    const writeRx = new RegExp ('^\\s*' + n + '\\[[^\\n\\]]+\\] = ');
    const takenRx = new RegExp ('&\\s*' + n + '\\b');
    for (let j = def + 1; (j < lines.length) && (lines[j] !== '}'); j++) {
        const line = goTextMaskLiteralsAndComments (lines[j]);
        if (!word.test (line)) {
            continue;
        }
        if (declRx.test (line)) {
            decls++;
        } else if (!(writeRx.test (line) && !takenRx.test (line)) && (line.trim () !== 'return ' + name)) {
            return false;
        }
    }
    return decls === 1;
}

// `this.M(...)` where M is a base map producer or the single method M of this file whose every
// return (outside func literals) is a map literal or such a producer call
function goMapWriteMapResultCall (lines: string[], text: string, depth: number = 0): boolean {
    const call = /^this\.(\w+)\(/.exec (text);
    if ((call === null) || (depth > 3)) {
        return false;
    }
    const defs = lines.map ((l, i) => (new RegExp ('^func \\(this \\*\\w+\\) ' + call[1] + '\\(').test (l) ? i : -1)).filter ((i) => i >= 0);
    if (defs.length === 0) {
        return GO_MAPWRITE_MAP_RESULT_BASE.indexOf (call[1]) >= 0;
    }
    if (defs.length !== 1) {
        return false;
    }
    let returns = 0;
    let depthFunc = 0;
    for (let j = defs[0] + 1; (j < lines.length) && (lines[j] !== '}'); j++) {
        const line = goTextMaskLiteralsAndComments (lines[j]);
        if (/\bfunc\s*\(/.test (line) || (depthFunc > 0)) {
            for (const c of line) {
                depthFunc += (c === '{') ? 1 : ((c === '}') ? -1 : 0);
            }
            continue;
        }
        const ret = /^\s*return\b\s*(.*)$/.exec (line);
        if (ret !== null) {
            returns++;
            const r = ret[1].trim ();
            if (!/^(?:ccxt\.)?map\[string\]any\{/.test (r) && !goMapWriteMapResultCall (lines, r, depth + 1) && !goMapWriteCalleeAccountLocal (lines, defs[0], r)) {
                return false;
            }
        }
    }
    return returns > 0;
}

// producers whose `any` result already went through derefScalar (GetValue, DerefScalar, SafeValue and its
// SafeDict/SafeList wrappers, GetArg defaults), or a never-pointer map: AddElementToObject's own deref of the
// stored value is then the identity
const GO_MAPWRITE_DEREFED_ANY_PRODUCER = /^(?:(?:ccxt\.)?(?:DerefScalar|GetValue)\(|this\.(?:SafeDict|SafeList|SafeValue|Extend|Account)\(|nil$)/;

// every use of the map local reads it through a deref-aware accessor (Safe*, GetValue, InOp, ObjectKeys, len,
// nil tests, a key-only range) or rebinds/extends it, so a stored *float64 reads the same as the helper's deref'd value
function goMapWritePointerSinkOnly (maskedFunc: string, name: string): boolean {
    const n = goAccessEscape (name);
    const uses = [ ...maskedFunc.matchAll (new RegExp ('(?<![\\w.])' + n + '(?![\\w])', 'g')) ];
    if (uses.length === 0) {
        return false;
    }
    const okRx = new RegExp ('^(?:'
        + 'var ' + n + ' map\\[string\\]any = [^\\n]*'
        + '|' + n + ' = [^\\n]*'
        + '|' + n + '\\[[^\\n\\]]+\\] = [^\\n]*'
        + '|(?:ccxt\\.)?AddElementToObject\\(' + n + ', [^\\n]*'
        + ')$');
    const readRx = new RegExp ('(?:(?:this\\.|ccxt\\.)?(?:Safe\\w+|GetValue|InOp|ObjectKeys|SafeMapTyped|MapTyped)\\(' + n + '[,)]'
        + '|\\blen\\(' + n + '\\)|\\b' + n + ' [!=]= nil|for \\w+ := range ' + n + ' \\{)');
    for (const line of maskedFunc.split ('\n')) {
        if (!new RegExp ('(?<![\\w.])' + n + '(?![\\w])').test (line)) {
            continue;
        }
        const t = line.trim ();
        if (okRx.test (t)) {
            continue;
        }
        const stripped = t.replace (new RegExp ('(?:(?:this\\.|ccxt\\.)?(?:Safe\\w+|GetValue|InOp|ObjectKeys|SafeMapTyped|MapTyped)\\(' + n + '[,)]|\\blen\\(' + n + '\\)|\\b' + n + ' [!=]= nil|for \\w+ := range ' + n + ' \\{)', 'g'), '');
        if (!readRx.test (t) || new RegExp ('(?<![\\w.])' + n + '(?![\\w])').test (stripped)) {
            return false;
        }
    }
    return true;
}

// a single-declaration `any` local whose declaration and every later write is a deref'd producer,
// and whose address is never taken (AppendToArray(&x, ..) rewrites it)
function goMapWriteDerefedAnyLocal (maskedFunc: string, decl: any, name: string): boolean {
    if ((decl === undefined) || (decl.index === undefined) || (decl.type !== 'any')) {
        return false;
    }
    const n = goAccessEscape (name);
    if (goG14MapLocalRebound (maskedFunc, n)) {
        return false;
    }
    const writes = [ decl.line.replace (/^\s*var\s+\w+\s+\S+\s*=\s*/, '').trim () ];
    for (const w of maskedFunc.matchAll (new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*=(?!=)\\s*([^\\n]*)', 'gm'))) {
        writes.push (w[1].trim ());
    }
    return writes.every ((init: string) => GO_MAPWRITE_DEREFED_ANY_PRODUCER.test (init) );
}

// a single-declaration `any` local initialised by a map producer call
function goMapWriteMapResultLocal (lines: string[], decl: any): boolean {
    if ((decl === undefined) || (decl.index === undefined)) {
        return false;
    }
    const init = /^\s*var\s+\w+\s+any\s*=\s*(.*)$/.exec (decl.line);
    return (init !== null) && /\)$/.test (init[1].trim ()) && goMapWriteMapResultCall (lines, init[1].trim ());
}

// `GetValue(m, "lit")` -> `m["lit"]` for a map local whose every write is a Market/SafeMarket/Currency/
// SafeCurrency result or nil: those rows are pointer-free (MarketTyped/CurrencyTyped), so the index reads what GetValue does.
const GO_MARKET_ROW_WRITE = /^(?:(?:ccxt\.)?this\.(?:DerivedExchange\.|Exchange\.)?(?:Market|SafeMarket|Currency|SafeCurrency)\(.*\)|nil)$/;

function nativeMarketRowReads (content: string): string {
    if (!/\bGetValue\(\w+, "/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            rewriteMarketRowReads (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

function rewriteMarketRowReads (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const verdicts = new Map<string, number | undefined> ();
    // line index of the single declaration when every write is a market row or nil
    const marketRowLocal = (name: string): number | undefined => {
        if (verdicts.has (name)) {
            return verdicts.get (name);
        }
        let verdict: number | undefined = undefined;
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl !== undefined) && (decl.type === 'map[string]any') && (decl.index !== undefined) && !new RegExp ('&\\s*' + name + '\\b').test (maskedFunc)) {
            const writes = new RegExp ('(?<![\\w.])' + name + '\\b[^\\n=(]*(?<![=!<>:])=(?!=)');
            let ok = true;
            let declLine = -1;
            for (let k = start + 1; ok && (k < end); k++) {
                if (!writes.test (masked[k])) {
                    continue;
                }
                const m = new RegExp ('^\\s*(var ' + name + ' map\\[string\\]any|' + name + ') = (.*)$').exec (lines[k]);
                ok = (m !== null) && (masked[k].trimEnd ().length === lines[k].trimEnd ().length) && GO_MARKET_ROW_WRITE.test (m[2].trim ());
                if (ok && m[1].startsWith ('var ')) {
                    declLine = k;
                }
            }
            verdict = (ok && (declLine >= 0)) ? declLine : undefined;
        }
        verdicts.set (name, verdict);
        return verdict;
    };
    for (let k = start + 1; k < end; k++) {
        if (masked[k].indexOf ('GetValue(') < 0) {
            continue;
        }
        const m = masked[k];
        lines[k] = lines[k].replace (/(?<![\w.])(?:ccxt\.)?GetValue\((\w+), ("[^"\\\n]*")\)/g, (all: string, name: string, key: string, at: number) => {
            const head = all.substring (0, all.indexOf ('(') + 1 + name.length);
            const declLine = (m.substr (at, head.length) === head) ? marketRowLocal (name) : undefined;
            return ((declLine !== undefined) && (declLine < k)) ? name + '[' + key + ']' : all;
        });
    }
}

// `GetValue(ob, "asks"|"bids")` -> `ob.GetAsks()`/`ob.GetBids()` on a never-written, proven non-nil
// OrderBookInterface local; a cached book read right after its create-if-absent guard is typed first.
const GO_OB_CTOR = /^this\.(?:Indexed|Counted)?OrderBook\(.*\)$/;

function nativeOrderBookSideReads (content: string): string {
    if (!/GetValue\(\w+, "(?:asks|bids)"\)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            rewriteOrderBookSideReads (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

// a stored book is present at line k: an `if !(InOp(this.Orderbooks, key))` block right above that ends by
// storing a new book (key proven non-nil) or by leaving, or an enclosing `if InOp(this.Orderbooks, key)`
const GO_OB_STORE_WRITE = /\b(?:AddElementToObject|Remove)\(this\.Orderbooks\b|this\.Orderbooks\.(?:Store|Delete)\(/;

function orderBookKeyPresent (lines: string[], start: number, k: number, ind: string, key: string, keyNonNil: (at: number) => boolean): boolean {
    const pkg = '(?:ccxt\\.)?';
    const negGuard = new RegExp ('^' + ind + 'if !\\(' + pkg + 'InOp\\(this\\.Orderbooks, ' + key + '\\)\\) \\{$');
    if (lines[k - 1] === ind + '}') {
        let open = k - 2;
        while ((open > start) && !(lines[open].startsWith (ind) && !lines[open].startsWith (ind + '\t'))) {
            open--;
        }
        if ((open <= start) || !negGuard.test (lines[open])) {
            return false;
        }
        let last = k - 2;
        while ((last > open) && /^\s*(?:\/\/.*)?$/.test (lines[last])) {
            last--;
        }
        const tail = lines[last];
        if (!tail.startsWith (ind + '\t') || tail.startsWith (ind + '\t\t')) {
            return false;
        }
        const body = tail.trim ();
        if ((body === 'return') || (body === 'continue')) {
            return true;
        }
        const stored = new RegExp ('^(?:' + pkg + 'AddElementToObject\\(this\\.Orderbooks, ' + key + ', |this\\.Orderbooks\\.Store\\(' + key + ', )(.*)\\)$').exec (body);
        if ((stored === null) || !keyNonNil (k)) {
            return false;
        }
        if (GO_OB_CTOR.test (stored[1])) {
            return true;
        }
        // a local declared from a book constructor in the same block
        const local = stored[1];
        const declRx = new RegExp ('^' + ind + '\\tvar ' + local + ' ' + pkg + 'OrderBookInterface = (.*)$');
        for (let j = open + 1; j < last; j++) {
            const d = declRx.exec (lines[j]);
            if (d !== null) {
                return GO_OB_CTOR.test (d[1]);
            }
        }
        return false;
    }
    if (ind.length < 2) {
        return false;
    }
    const outer = ind.substring (1);
    const posGuard = new RegExp ('^' + outer + 'if ' + pkg + 'InOp\\(this\\.Orderbooks, ' + key + '\\) \\{$');
    for (let j = k - 1; j > start; j--) {
        if (lines[j].startsWith (ind) || /^\s*$/.test (lines[j])) {
            if (GO_OB_STORE_WRITE.test (lines[j])) {
                return false;
            }
            continue;
        }
        return posGuard.test (lines[j]);
    }
    return false;
}

function rewriteOrderBookSideReads (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const written = (name: string, declLine: number): boolean => {
        const w = new RegExp ('(?<![\\w.])' + name + '\\b[^\\n=(]*(?<![=!<>:])=(?!=)|&\\s*' + name + '\\b|(?<![\\w.])' + name + '\\s*(?:\\+\\+|--)');
        for (let k = start + 1; k < end; k++) {
            if ((k !== declLine) && w.test (masked[k])) {
                return true;
            }
        }
        return false;
    };
    const declLineOf = (name: string): number => {
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl === undefined) || (decl.index === undefined)) {
            return -1;
        }
        return start + maskedFunc.substring (0, decl.index).split ('\n').length - 1;
    };
    // the key is a string, or a *string dereferenced earlier on a line whose block encloses the read
    const { 'blocks': blocks } = goTextBlocks (masked);
    const keyNonNil = (key: string, at: number): boolean => {
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], key);
        if ((decl === undefined) || written (key, (decl.index === undefined) ? -1 : declLineOf (key))) {
            return false;
        }
        if (decl.type === 'string') {
            return true;
        }
        if (decl.type !== '*string') {
            return false;
        }
        const deref = new RegExp ('(?<![\\w.)\\]])\\*' + key + '\\b');
        for (let k = start + 1; k < at; k++) {
            if (!deref.test (masked[k]) || /^\s*(?:if|else|for|switch|case|\})/.test (masked[k]) || /&&|\|\|/.test (masked[k])) {
                continue;
            }
            const block = goTextEnclosingBlock (blocks, k);
            if ((block !== undefined) && (block.open <= at) && (at <= block.close)) {
                return true;
            }
        }
        return false;
    };
    const books = new Set<string> ();
    for (let k = start + 3; k < end; k++) {
        const m = /^(\s*)var (\w+) any = ((?:ccxt\.)?)GetValue\(this\.Orderbooks, (\w+)\)$/.exec (lines[k]);
        if ((m === null) || (masked[k] !== lines[k])) {
            continue;
        }
        const [ , ind, name, pkg, key ] = m;
        if (!orderBookKeyPresent (lines, start, k, ind, key, (at: number) => keyNonNil (key, at)) || (declLineOf (name) !== k) || written (name, k)
            || written (key, declLineOf (key))) {
            continue;
        }
        lines[k] = ind + 'var ' + name + ' ' + pkg + 'OrderBookInterface = ' + pkg + 'OrderBookTyped(' + pkg + 'GetValue(this.Orderbooks, ' + key + '))';
        books.add (name);
    }
    const isBook = (name: string, at: number): boolean => {
        const k = declLineOf (name);
        if ((k < 0) || (k >= at) || written (name, k)) {
            return false;
        }
        if (books.has (name)) {
            return true;
        }
        const m = /^\s*var \w+ (?:ccxt\.)?OrderBookInterface = (.*)$/.exec (lines[k]);
        return (m !== null) && (GO_OB_CTOR.test (m[1]) || /\.\((?:ccxt\.)?OrderBookInterface\)$/.test (m[1]));
    };
    for (let k = start + 1; k < end; k++) {
        if (masked[k].indexOf ('GetValue(') < 0) {
            continue;
        }
        const m = masked[k];
        lines[k] = lines[k].replace (/(?<![\w.])(?:ccxt\.)?GetValue\((\w+), "(asks|bids)"\)/g, (all: string, name: string, side: string, at: number) => {
            const head = all.substring (0, all.indexOf ('(') + 1 + name.length);
            if ((m.substr (at, head.length) !== head) || !isBook (name, k)) {
                return all;
            }
            return name + '.Get' + side[0].toUpperCase () + side.slice (1) + '()';
        });
        const side = /^(\s*)var (\w+) any = (\w+\.Get(?:Asks|Bids)\(\))$/.exec (lines[k]);
        if ((side !== null) && (declLineOf (side[2]) === k) && !written (side[2], k)) {
            const pkg = /(?:^|\n)import ccxt "/.test (lines.slice (0, start).join ('\n')) ? 'ccxt.' : '';
            lines[k] = side[1] + 'var ' + side[2] + ' ' + pkg + 'IOrderBookSide = ' + side[3];
        }
    }
}

function retagLoopBoundedElementReads (content: string): string {
    if (content.indexOf ('GetValue(') < 0) {
        return content; // no candidate line anywhere in this file
    }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const { 'blocks': blocks, 'depth': depth } = goTextBlocks (maskedLines);
    let changed = false;
    for (let index = 0; index < lines.length; index++) {
        const candidate = /^([ \t]*)var ([A-Za-z_]\w*) any = (?:ccxt\.)?GetValue\(([A-Za-z_]\w*), ([A-Za-z_]\w*)\)[ \t]*$/.exec (lines[index]);
        if ((candidate === null) || (lines[index] !== maskedLines[index])) {
            continue; // not the exact declaration line, or (partly) inside a literal/comment
        }
        const indent = candidate[1];
        const name = candidate[2];
        const slice = candidate[3];
        const counter = candidate[4];
        if ((name === slice) || (name === counter) || (slice === counter)) {
            continue;
        }
        const body = goTextEnclosingBlock (blocks, index);
        if (body === undefined) {
            continue;
        }
        const header = /^[ \t]*for ([A-Za-z_]\w*) := (\d+); ([A-Za-z_]\w*) < (.+); ([A-Za-z_]\w*)\+\+ \{$/.exec (maskedLines[body.open]);
        if ((header === null) || (header[1] !== counter) || (header[3] !== counter) || (header[5] !== counter)) {
            continue; // the declaration is not the first statement of a counting for-loop
        }
        const fn = blocks.find ((block: any) => (block.depth === 1) && (block.open < index) && (index <= block.close));
        if ((fn === undefined) || (maskedLines[fn.open].indexOf ('func ') !== 0)) {
            continue; // no enclosing function: a different code path prints this line
        }
        // the slice: a `[]string` local of this function, declared in a scope that still
        // holds at the loop header, and never written
        const declarationRx = new RegExp ('^[ \\t]*var ' + slice + ' \\[\\]string = ');
        let sliceLine = -1;
        for (let k = fn.open + 1; k < body.open; k++) {
            if (declarationRx.test (maskedLines[k])) {
                if ((sliceLine >= 0) || (depth[k] > depth[body.open])) {
                    sliceLine = -2; // ambiguous or declared inside the loop
                    break;
                }
                sliceLine = k;
            }
        }
        if (sliceLine < 0) {
            continue;
        }
        const sliceBlock = goTextEnclosingBlock (blocks, sliceLine);
        if ((sliceBlock !== undefined) && (sliceBlock.close < body.open)) {
            continue; // the declaration sits in a block that closed before the loop
        }
        let sliceWritten = false;
        for (let k = fn.open + 1; k < fn.close; k++) {
            if ((k !== sliceLine) && goTextWritesName (maskedLines[k], slice)) {
                sliceWritten = true;
                break;
            }
        }
        if (sliceWritten) {
            continue;
        }
        if (!goTextLoopBoundIsLen (maskedLines, blocks, depth, fn, body, header[4].trim (), slice, [ name, counter ])) {
            continue;
        }
        // the body: no write to the counter or the slice, and every read of the local a
        // value position
        let unsafe = false;
        for (let k = body.open + 1; k < body.close; k++) {
            const maskedLine = maskedLines[k];
            if (goTextWritesName (maskedLine, counter) || goTextWritesName (maskedLine, slice)) {
                unsafe = true;
                break;
            }
            if ((k !== index) && new RegExp ('\\b' + name + '\\b').test (maskedLine) && goTextReadIsHazard (maskedLine, name)) {
                unsafe = true;
                break;
            }
        }
        if (unsafe) {
            continue;
        }
        lines[index] = indent + 'var ' + name + ' string = ' + slice + '[' + counter + ']';
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// the loop bound is len(slice), GetArrayLength(slice), or an int local `= len(slice)` that
// is declared once before the loop, in a scope still open at it, and never written
function goTextLoopBoundIsLen (maskedLines: string[], blocks: any[], depth: number[], fn: any, body: any, bound: string, slice: string, reserved: string[]): boolean {
    if ((bound === 'len(' + slice + ')') || (bound === 'GetArrayLength(' + slice + ')')) {
        return true;
    }
    if (!/^[A-Za-z_]\w*$/.test (bound) || (bound === slice) || reserved.includes (bound)) {
        return false;
    }
    const boundRx = new RegExp ('^[ \\t]*(?:var ' + bound + ' int = |' + bound + ' := )len\\(' + slice + '\\)[ \\t]*$');
    let boundLine = -1;
    for (let k = fn.open + 1; k < body.open; k++) {
        if (boundRx.test (maskedLines[k])) {
            if ((boundLine >= 0) || (depth[k] > depth[body.open])) {
                return false; // ambiguous or declared inside the loop
            }
            boundLine = k;
        }
    }
    if (boundLine < 0) {
        return false;
    }
    const boundBlock = goTextEnclosingBlock (blocks, boundLine);
    if ((boundBlock !== undefined) && (boundBlock.close < body.open)) {
        return false;
    }
    for (let k = fn.open + 1; k < fn.close; k++) {
        if ((k !== boundLine) && goTextWritesName (maskedLines[k], bound)) {
            return false;
        }
    }
    return true;
}

// hx11 w8: a promiseAll result list; its elements may be scalar boxes, so only an ArrayConcat operand (which derefs) reads natively
const GO_PROMISE_LIST = /^[ \t]*(?:var )?[A-Za-z_]\w* \[\]any = (?:ccxt\.)?ListTyped\((?:r\d*\.Value|(?:ccxt\.)?PanicOnError\(\(<-(?:ccxt\.)?[pP]romiseAll\(.*\)\)\))\)$/;

// `[ccxt.]GetValue(s, i)[.(string)]` -> `s[i]` anywhere in the body of `for i := 0; i < len(s); i++ {`
// when `s` is declared once in the func as `[]string` and never written, `i` is not written in
// the body and no func literal opens between the loop and the read (derefScalar of a string is itself).
function nativeLoopBoundedSliceReads (content: string): string {
    if (content.indexOf ('GetValue(') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const { 'blocks': blocks, 'depth': depth } = goTextBlocks (maskedLines);
    const readRx = /\b(?:ccxt\.)?GetValue\(([A-Za-z_]\w*), ([A-Za-z_]\w*)\)(\.\(string\))?/g;
    let changed = false;
    for (let index = 0; index < lines.length; index++) {
        if (maskedLines[index].indexOf ('GetValue(') < 0) {
            continue;
        }
        const replaced = lines[index].replace (readRx, (match: string, slice: string, counter: string, assertion: string | undefined, offset: number) => {
            if ((maskedLines[index].substr (offset, match.length) !== match) || (slice === counter)) {
                return match; // inside a literal/comment
            }
            const after = maskedLines[index].substring (offset + match.length);
            const before = maskedLines[index].substring (0, offset);
            if (/^\s*(?:[!=]=\s*nil\b|\.\()/.test (after) || /\bnil\s*[!=]=\s*$/.test (before) || /(?:^|[^\w.])[A-Za-z_]\w*\s*:=\s*$/.test (before)) {
                return match; // nil comparison, further assertion, or a := that would take the element type
            }
            // innermost enclosing counting loop over `counter`, with no func literal in between
            const enclosing = blocks.filter ((b: any) => (b.open < index) && (index <= b.close)).sort ((a: any, b: any) => b.depth - a.depth);
            let body: any = undefined;
            let header: RegExpExecArray | null = null;
            for (const b of enclosing) {
                if (/\bfunc\b/.test (maskedLines[b.open])) {
                    break;
                }
                const h = /^[ \t]*for ([A-Za-z_]\w*) := 0; ([A-Za-z_]\w*) < (.+); ([A-Za-z_]\w*)\+\+ \{$/.exec (maskedLines[b.open]);
                if ((h !== null) && (h[1] === counter)) {
                    body = b;
                    header = h;
                    break;
                }
            }
            if ((body === undefined) || (header === null) || (header[2] !== counter) || (header[4] !== counter) || (index === body.open)) {
                return match;
            }
            const fn = blocks.find ((b: any) => (b.depth === 1) && (b.open < index) && (index <= b.close));
            if ((fn === undefined) || (maskedLines[fn.open].indexOf ('func ') !== 0)) {
                return match;
            }
            const maskedFunc = maskedLines.slice (fn.open + 1, fn.close + 1).join ('\n');
            const decl = goAccessSingleDeclaration (maskedFunc, maskedLines[fn.open], slice) ?? goAccessRepeatedStringSliceDeclaration (maskedFunc, maskedLines[fn.open], slice) ?? goLoopScopedStringSliceDeclaration (maskedLines, blocks, depth, fn, body, slice);
            // hx11 w7: a `[]any` unboxed from a SafeList accessor holds plain JSON values (no *T box
            // for GetValue to deref), so its in-range element is the slice element itself
            const jsonList = (decl !== undefined) && (decl.type === '[]any') && (decl.line !== undefined) && GO_GUARDED_READ_SAFE_LIST.test (decl.line);
            const taskList = (decl !== undefined) && (decl.type === '[]any') && (decl.line !== undefined) && GO_PROMISE_LIST.test (decl.line)
                && (assertion === undefined) && /\bthis\.ArrayConcat\([A-Za-z_]\w*, $/.test (before) && after.startsWith (')');
            if ((decl === undefined) || ((decl.type !== '[]string') && !jsonList && !taskList)) {
                return match;
            }
            const declRx = new RegExp ('^[ \\t]*var ' + slice + ((jsonList || taskList) ? ' \\[\\]any\\b' : ' \\[\\]string\\b'));
            for (let k = fn.open + 1; k < fn.close; k++) {
                const line = (decl.line !== undefined) ? maskedLines[k].replace (declRx, '') : maskedLines[k];
                if (goTextWritesName (line, slice)) {
                    return match;
                }
            }
            if ((decl.line !== undefined) && !(maskedLines.slice (fn.open + 1, body.open).some ((l: string) => declRx.test (l)))) {
                return match; // declared after the loop header
            }
            for (let k = body.open + 1; k < body.close; k++) {
                if (goTextWritesName (maskedLines[k], counter)) {
                    return match;
                }
            }
            if (!goTextLoopBoundIsLen (maskedLines, blocks, depth, fn, body, header[3].trim (), slice, [ counter ])) {
                return match;
            }
            changed = true;
            return slice + '[' + counter + ']';
        });
        lines[index] = replaced;
    }
    return changed ? lines.join ('\n') : content;
}

// hx11 w8: `var s []string = ...` declared in several sibling scopes of one func (one per if/else
// branch), each loop reading the declaration its own scope holds. Every declaration of the name
// in the func must be a plain `var s []string` line (no param, `:=`, range or func literal
// binding); the one in scope at the loop is the nearest earlier line whose block still holds it.
function goLoopScopedStringSliceDeclaration (maskedLines: string[], blocks: any[], depth: number[], fn: any, body: any, slice: string): any {
    const n = goAccessEscape (slice);
    const declRx = new RegExp ('^[ \\t]*var ' + n + ' \\[\\]string\\b');
    const bindRx = new RegExp ('(?:^|[^\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bvar\\s+' + n + '\\b|\\bfunc\\b[^\\n]*[(,]\\s*' + n + '\\s+[^,()]+[,)]');
    if (new RegExp ('[(,]\\s*' + n + '\\s+[^,()]+[,)]').test (maskedLines[fn.open])) {
        return undefined;
    }
    // a declaration lives from its line to the first later line that closes its block: a line
    // starting with `}` at the declaration's depth (`} else {` closes the if body too)
    const scopes: number[][] = [];
    for (let k = fn.open + 1; k < fn.close; k++) {
        if (declRx.test (maskedLines[k])) {
            let end = fn.close;
            for (let j = k + 1; j <= fn.close; j++) {
                if ((depth[j] < depth[k]) || ((depth[j] === depth[k]) && /^\s*\}/.test (maskedLines[j]))) {
                    end = j;
                    break;
                }
            }
            scopes.push ([ k, end ]);
        } else if (bindRx.test (maskedLines[k])) {
            return undefined;
        }
    }
    const holding = scopes.filter ((c) => (c[0] < body.open) && (body.close < c[1]));
    if ((holding.length !== 1) || scopes.some ((c) => (c !== holding[0]) && (c[0] > holding[0][0]) && (c[0] < holding[0][1]))) {
        return undefined;
    }
    return { 'type': '[]string', 'index': 0, 'line': maskedLines[holding[0][0]] };
}

// hx10w3 G04: the pass has to run inside formatGoSource, not only in its own self-test
function hx10G04Wired (): string[] {
    const src = 'package ccxt\n\nfunc (this *X) f() any {\n\tthis.Markets_by_id.Store("k", 1)\n\treturn nil\n}\n';
    const out = formatGoSource ('selftest.go', src);
    return out.includes ('\tthis.Markets_by_id["k"] = 1\n') ? [] : [ 'hx10 G04: not wired into formatGoSource: ' + out ];
}

// hx10w9 GP18: the pass has to run inside formatGoSource, not only in its own self-test
function hx10w9Gp18Wired (): string[] {
    const src = 'package ccxt\n\nfunc (this *X) f(id any) any {\n\tr1 := <-this.PrivateGetOrdersId(id)\n\tif r1.Err != nil {\n\t\tpanic(r1.Err)\n\t}\n\tvar response map[string]any = MapTyped(r1.Raw)\n\treturn response\n}\n';
    gp18SetTableForTest (new Map ([ [ 'X.PrivateGetOrdersId', 'map[string]any' ] ]));
    let out = '';
    try {
        out = formatGoSource ('selftest.go', src);
    } finally {
        gp18SetTableForTest (undefined);
    }
    return out.includes ('var response map[string]any = r1.Value') ? [] : [ 'hx10w9 GP18: not wired into formatGoSource: ' + out ];
}

// ------------------------------------------------------------------------------------
// hx11 w4 P2 -- the bounds-guard func literal around a typed element read
// ------------------------------------------------------------------------------------
// `printElementAccessExpression` prints a read of a local it declared `[]any` (the SafeList
// unbox, or the declared-type arm) as a five-line closure, and this file's own g05 pass
// prints the same shape for a `[]string`/`[]any` deref consumer:
//
//     var a any = f(func() any {
//         if 0 >= 0 && 0 < len(list) {
//             return DerefScalar(list[0])
//         }
//         return nil
//     }())
//
// The guard stands in for JS `list[0] === undefined`, and `derefScalar` unwraps a pointer
// element. Both are dead weight here: the guard is unnecessary when the index is provably
// in range (an enclosing `for k := 0; k < len(list); k++`, or an `if` whose condition bounds
// it), and `derefScalar` is the identity on a slice unboxed from a `SafeList*` accessor
// because those elements are JSON values, never scalar pointers. The two halves are
// independent: the closure goes when the read is in range, the wrap goes when the producer
// is a SafeList.
const GO_GUARDED_READ_GUARD = /^([ \t]*)if (.+?) >= 0 && \2 < len\(([A-Za-z_]\w*)\) \{$/;
const GO_GUARDED_READ_ROOF = /func\(\) any \{$/;
// a `[]any` unboxed from a SafeList accessor: `listValueToTypedSlice` hands back the JSON
// array as-is, so no element is a *string/*int64/... box
const GO_GUARDED_READ_SAFE_LIST = /^[ \t]*(?:var )?[A-Za-z_]\w* \[\]any = (?:ccxt\.)?SafeList\d*(?:Typed|TypedDefault)?\(/;

// the braces of a single parenthesised clause around its own expression
function goGuardedReadStripParens (text: string): string {
    let out = text.trim ();
    while (out.startsWith ('(') && out.endsWith (')')) {
        let depth = 0;
        let wraps = true;
        for (let i = 0; i < out.length; i++) {
            depth += (out[i] === '(') ? 1 : ((out[i] === ')') ? -1 : 0);
            if ((depth === 0) && (i < out.length - 1)) {
                wraps = false;
                break;
            }
        }
        if (!wraps) {
            break;
        }
        out = out.substring (1, out.length - 1).trim ();
    }
    return out;
}

// the container of a guarded read: a `[]any`/`[]string` local or parameter this func
// declares exactly once and never writes (a write could change len() or replace the slice)
function goGuardedReadContainer (maskedLines: string[], fn: any, name: string, lines?: string[]): any {
    const maskedFunc = maskedLines.slice (fn.open + 1, fn.close + 1).join ('\n');
    const decl = goAccessSingleDeclaration (maskedFunc, maskedLines[fn.open], name);
    if ((decl === undefined) || ((decl.type !== '[]any') && (decl.type !== '[]string'))) {
        return undefined;
    }
    const declareLine = (decl.index === undefined) ? -1 : (fn.open + 1 + (maskedFunc.substring (0, decl.index).split ('\n').length - 1));
    for (let k = fn.open + 1; k < fn.close; k++) {
        if ((k !== declareLine) && goTextWritesName (maskedLines[k], name)) {
            return undefined;
        }
    }
    const init = ((lines !== undefined) && (declareLine >= 0)) ? lines[declareLine] : undefined;
    return { 'type': decl.type, 'json': (decl.line !== undefined) && GO_GUARDED_READ_SAFE_LIST.test (decl.line), 'init': init };
}

// hx11 w7: top-level comma split of a call's argument text (string/rune aware)
function goGuardedReadSplitArgs (text: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let from = 0;
    let quote = '';
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quote !== '') {
            if (c === '\\') { i++; } else if (c === quote) { quote = ''; }
            continue;
        }
        if ((c === '"') || (c === '`') || (c === '\'')) { quote = c; continue; }
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if ((depth === 0) && (c === ',')) {
            parts.push (text.substring (from, i).trim ());
            from = i + 1;
        }
    }
    parts.push (text.substring (from).trim ());
    return parts;
}

// hx11 w7: the declaration's own initializer proves the literal index `key` is in range:
//  - strings.Split(x, "<non-empty literal>") always returns at least one element (index 0)
//  - this.MarketSymbols(s, t, false, ...) panics on an empty list, so index 0 exists
//  - a `[]any{a, b, c}` literal the func never writes has exactly its listed elements
function goGuardedReadInitProvesIndex (init: string | undefined, key: string): boolean {
    if ((init === undefined) || !/^\d+$/.test (key)) {
        return false;
    }
    const index = Number (key);
    const split = /^[ \t]*var [A-Za-z_]\w* \[\]string = (?:ccxt\.)?strings\.Split\(.*, \"[^\"\\\\]+\"\)[ \t]*(?:\/\/.*)?$/.exec (init);
    if (split !== null) {
        return index === 0;
    }
    const symbols = /^[ \t]*var [A-Za-z_]\w* \[\]string = this\.MarketSymbols\((.*)\)[ \t]*(?:\/\/.*)?$/.exec (init);
    if (symbols !== null) {
        const args = goGuardedReadSplitArgs (symbols[1]);
        return (index === 0) && (args.length >= 3) && (args[2] === 'false');
    }
    const literal = /^[ \t]*var [A-Za-z_]\w* \[\]any = \[\]any\{(.*)\}[ \t]*$/.exec (init);
    if (literal !== null) {
        const items = goGuardedReadSplitArgs (literal[1]);
        return (items.length > 0) && (items[0] !== '') && (index < items.length);
    }
    return false;
}

// names bound to `len(container)` that still hold at the block, declared once and unwritten
function goGuardedReadLenBounds (maskedLines: string[], blocks: any[], depth: number[], fn: any, block: any, container: string): string[] {
    const c = goAccessEscape (container);
    const rx = new RegExp ('^[ \\t]*(?:var )?([A-Za-z_]\\w*) (?:int|int64) = len\\(' + c + '\\)[ \\t]*$|^[ \\t]*([A-Za-z_]\\w*) := len\\(' + c + '\\)[ \\t]*$');
    const names: string[] = [];
    for (let k = fn.open + 1; k < block.open; k++) {
        const m = rx.exec (maskedLines[k]);
        const name = (m === null) ? undefined : (m[1] ?? m[2]);
        if ((name !== undefined) && !names.includes (name) && goTextLoopBoundIsLen (maskedLines, blocks, depth, fn, block, name, container, [])) {
            names.push (name);
        }
    }
    return names;
}

// `key` is a valid index into `container` when this conjunct holds; `bounds` are locals
// equal to len(container)
function goGuardedReadInRangeClause (clause: string, container: string, key: string, bounds: string[]): boolean {
    const text = goGuardedReadStripParens (clause).replace (/[ \t]/g, '');
    const terms = [ 'len\\(' + goAccessEscape (container) + '\\)', ...bounds.map ((b: string) => goAccessEscape (b)) ];
    const k = /^\d+$/.test (key) ? key : goAccessEscape (key);
    for (const t of terms) {
        if (new RegExp ('^' + t + '>' + k + '$').test (text)) {
            return true;                                      // len > key
        }
        if (new RegExp ('^' + t + '>=' + k + '\\+1$').test (text)) {
            return true;                                      // len >= key + 1
        }
        if (new RegExp ('^' + k + '<' + t + '$').test (text)) {
            return true;                                      // key < len
        }
        if (new RegExp ('^' + k + '<=' + t + '\\-1$').test (text)) {
            return true;                                      // key <= len - 1
        }
        if (/^\d+$/.test (key)) {
            // a literal bound: len > L / len >= L / len == L, and the mirror forms
            const above = new RegExp ('^' + t + '(>|>=|==)(\\d+)$').exec (text);
            const below = new RegExp ('^(\\d+)(<|<=)' + t + '$').exec (text);
            const op = (above !== null) ? above[1] : ((below !== null) ? below[2] : undefined);
            const limit = (above !== null) ? Number (above[2]) : ((below !== null) ? Number (below[1]) : -1);
            if ((op !== undefined) && (limit >= 0)) {
                const highest = (op === '>') ? limit : (limit - 1);
                if (Number (key) <= highest) {
                    return true;
                }
            }
        }
    }
    return false;
}

// the guarded read at `index` is in range: an enclosing counting loop over `len(container)`
// or an `if` whose condition bounds the index. Walks only the blocks that enclose the func
// literal (a nested `func` opener ends the walk, so an outer guard cannot dominate a read
// inside a closure).
function goGuardedReadIsInRange (maskedLines: string[], blocks: any[], depth: number[], fn: any, index: number, container: string, key: string): boolean {
    const enclosing = blocks.filter ((b: any) => (b.open < index - 1) && (index <= b.close)).sort ((a: any, b: any) => b.depth - a.depth);
    for (const block of enclosing) {
        if (/\bfunc\b/.test (maskedLines[block.open])) {
            // hx11 w7: `f(func() any {..}()) + g(func() any {..}())` counts the first literal's block as
            // still open at the second guard (the `}()) + g(func() any {` roof is brace-neutral). That
            // block is only the sibling guard closure, ending on this closure's own last line.
            if (GO_GUARDED_READ_ROOF.test (maskedLines[block.open]) && (block.close === index + 4) && (block.open < index - 1)) {
                continue;
            }
            break;
        }
        const header = maskedLines[block.open];
        const loop = /^[ \t]*for ([A-Za-z_]\w*) := 0; \1 < (.+); \1\+\+ \{$/.exec (header);
        if ((loop !== null) && (loop[1] === key)) {
            if (!goTextLoopBoundIsLen (maskedLines, blocks, depth, fn, block, loop[2].trim (), container, [ key ])) {
                return false;
            }
            // `goTextWritesName` reads the `&&` of a `&& i < len(x)` condition as an
            // address-of, so the one-letter counter gets its own write test
            const counterWrite = new RegExp ('(?<![\\w.])' + goAccessEscape (key) + '\\s*(?::=|\\+\\+|--|[-+*/%&|^]?=(?!=))|(?<!&)&\\s*' + goAccessEscape (key) + '\\b');
            for (let k = block.open + 1; k < block.close; k++) {
                if (counterWrite.test (maskedLines[k])) {
                    return false;                              // the counter is rebased in the body
                }
            }
            return true;
        }
        const condition = /^[ \t]*if (.*) \{$/.exec (header);
        if (condition !== null) {
            const bounds = goGuardedReadLenBounds (maskedLines, blocks, depth, fn, block, container);
            const clauses = goMapWriteTopLevelParts (condition[1], '&&');
            if (clauses.some ((clause: string) => (clause.indexOf ('||') < 0) && goGuardedReadInRangeClause (clause, container, key, bounds))) {
                return true;
            }
        }
    }
    return false;
}

// `f(func() any { if k >= 0 && k < len(x) { return [DerefScalar(]x[k][)] } return nil }())`
// -> `f(x[k])` when the read is in range, `f(DerefScalar(x[k]))` when the element can box a
// pointer; the DerefScalar wrap is dropped in place when the slice came from a SafeList
function nativeGuardedListElementReads (content: string): string {
    if ((content.indexOf ('>= 0 && ') < 0) || (content.indexOf ('func() any {') < 0)) {
        return content;
    }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const { 'blocks': blocks, 'depth': depth } = goTextBlocks (maskedLines);
    const out: string[] = [];
    let changed = false;
    for (let index = 0; index < lines.length; index++) {
        const guard = GO_GUARDED_READ_GUARD.exec (maskedLines[index]);
        if ((guard === null) || (index === 0) || (out.length === 0) || (index + 4 >= lines.length)
            || !GO_GUARDED_READ_ROOF.test (maskedLines[index - 1])) {
            out.push (lines[index]);
            continue;
        }
        const body = guard[1];                                 // the guard sits one level below the literal
        const outer = (body.length > 0) ? body.substring (0, body.length - 1) : body;
        const key = guard[2];
        const container = guard[3];
        const wrappedPlain = body + '\treturn DerefScalar(' + container + '[' + key + '])';
        const wrappedPrefixed = body + '\treturn ccxt.DerefScalar(' + container + '[' + key + '])';
        const wrapped = (maskedLines[index + 1] === wrappedPrefixed) ? wrappedPrefixed : wrappedPlain;
        const deref = (wrapped === wrappedPrefixed) ? 'ccxt.DerefScalar' : 'DerefScalar';
        const bare = body + '\treturn ' + container + '[' + key + ']';
        const closes = outer + '}()';
        if (((maskedLines[index + 1] !== wrapped) && (maskedLines[index + 1] !== bare))
            || (maskedLines[index + 2] !== body + '}')
            || (maskedLines[index + 3] !== body + 'return nil')
            || !maskedLines[index + 4].startsWith (closes)) {
            out.push (lines[index]);
            continue;
        }
        const fn = blocks.find ((b: any) => (b.depth === 1) && (b.open < index) && (index <= b.close));
        if ((fn === undefined) || (maskedLines[fn.open].indexOf ('func ') !== 0)) {
            out.push (lines[index]);
            continue;
        }
        const read = goGuardedReadContainer (maskedLines, fn, container, lines);
        if (read === undefined) {
            out.push (lines[index]);
            continue;
        }
        const isWrapped = (maskedLines[index + 1] === wrapped);
        const readText = (isWrapped && !read.json) ? (deref + '(' + container + '[' + key + '])') : (container + '[' + key + ']');
        if (goGuardedReadIsInRange (maskedLines, blocks, depth, fn, index, container, key) || goGuardedReadInitProvesIndex (read.init, key)) {
            // hx11 w7: an earlier closure of the same expression may already have been merged into
            // the roof line, so splice into what was emitted, not the original text
            const roofText = out[out.length - 1];
            const roofClose = roofText.lastIndexOf ('func() any {');
            let suffix = lines[index + 4].substring (closes.length);
            // the element of a `[]string` is already a string: the `. (string)` the printer
            // adds to an `any` read goes with the closure
            if ((read.type === '[]string') && suffix.startsWith ('.(string)')) {
                suffix = suffix.substring ('.(string)'.length);
            }
            const merged = roofText.substring (0, roofClose) + readText + suffix;
            if ((roofClose >= 0) && !suffix.trimStart ().startsWith ('.') && (merged.length <= 400)) {
                out[out.length - 1] = merged;
                index += 4;
                changed = true;
                continue;
            }
        }
        if (isWrapped && read.json) {
            lines[index + 1] = bare;                           // SafeList elements are plain JSON values
            changed = true;
        }
        out.push (lines[index]);
    }
    return changed ? out.join ('\n') : content;
}

// hx11 w4 P2: the guard literal goes when the index is provably in range, the derefScalar
// wrap goes when the slice is a SafeList unbox; every other read keeps both
function nativeGuardedListElementReadsSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11 w4 P2: ' + message); } };
    const lists = '\tvar markets []any = SafeListTyped(response, "markets")\n';
    const read = (key: string, container: string, wrap: string) => '\t\tvar m any = func() any {\n\t\t\tif ' + key + ' >= 0 && ' + key + ' < len(' + container + ') {\n\t\t\t\treturn ' + wrap + container + '[' + key + ']' + ((wrap === '') ? '' : ')') + '\n\t\t\t}\n\t\t\treturn nil\n\t\t}()\n';
    const g = (body: string) => nativeGuardedListElementReads ('func (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
    try {
        ok (g (lists + '\tif len(markets) > 0 {\n' + read ('0', 'markets', 'DerefScalar(') + '\t}\n').indexOf ('var m any = markets[0]') >= 0, 'an enclosing len() guard makes the read native');
        ok (g (lists + '\tvar n int = len(markets)\n\tif n > 0 {\n' + read ('0', 'markets', 'DerefScalar(') + '\t}\n').indexOf ('var m any = markets[0]') >= 0, 'a bound local equal to len() counts');
        ok (g (lists + '\tfor i := 0; i < len(markets); i++ {\n' + read ('i', 'markets', 'DerefScalar(') + '\t}\n').indexOf ('var m any = markets[i]') >= 0, 'a counting loop over len() counts');
        ok (g ('\tvar values []any = []any{}\n\tif len(values) > 0 {\n' + read ('0', 'values', 'DerefScalar(') + '\t}\n').indexOf ('var m any = DerefScalar(values[0])') >= 0, 'a non-SafeList slice keeps derefScalar');
        ok (g ('\tvar values []any = []any{}\n\tif len(values) > 0 {\n' + read ('0', 'values', 'ccxt.DerefScalar(') + '\t}\n').indexOf ('var m any = ccxt.DerefScalar(values[0])') >= 0, 'the ccxt. prefix survives');
        const unguarded = g (lists + read ('0', 'markets', 'DerefScalar('));
        ok ((unguarded.indexOf ('\t\t\t\treturn markets[0]') >= 0) && (unguarded.indexOf ('DerefScalar(') < 0), 'without a proof a SafeList read drops only the wrap');
        ok (g ('\tvar parts []string = strings.Split(x, "/")\n' + read ('1', 'parts', '')).indexOf ('func() any {') >= 0, 'an unproven []string read keeps the literal');
        ok (g (lists + '\tif n > 0 {\n' + read ('0', 'markets', 'DerefScalar(') + '\t}\n').indexOf ('func() any {') >= 0, 'an unknown bound name keeps the literal');
        ok (g (lists + '\tif len(markets) > 0 {\n\t\tmarkets = []any{}\n' + read ('0', 'markets', 'DerefScalar(') + '\t}\n').indexOf ('func() any {') >= 0, 'a written slice keeps the literal');
        ok (g (lists + '\tif len(markets) > 1 {\n' + read ('1', 'markets', 'DerefScalar(') + '\t}\n').indexOf ('var m any = markets[1]') >= 0, 'len() > key');
        ok (g (lists + '\tif len(markets) > 0 {\n' + read ('1', 'markets', 'DerefScalar(') + '\t}\n').indexOf ('func() any {') >= 0, 'len() > 0 does not cover index 1');
        // hx11 w7: the declaration's own initializer proves the literal index
        const split = (index: string, sep: string) => g ('\tvar parts []string = strings.Split(x, ' + sep + ')\n' + read (index, 'parts', ''));
        ok (split ('0', '\"/\"').indexOf ('var m any = parts[0]') >= 0, 'strings.Split with a literal separator has element 0');
        ok (split ('1', '\"/\"').indexOf ('func() any {') >= 0, 'strings.Split does not prove element 1');
        ok (split ('0', 'sep').indexOf ('func() any {') >= 0, 'strings.Split with a variable separator keeps the literal');
        ok (split ('0', '\"\"').indexOf ('func() any {') >= 0, 'strings.Split with an empty separator keeps the literal');
        const symbols = (allowEmpty: string, index: string) => g ('\tvar syms []string = this.MarketSymbols(symbols, nil, ' + allowEmpty + ', true)\n' + read (index, 'syms', ''));
        ok (symbols ('false', '0').indexOf ('var m any = syms[0]') >= 0, 'MarketSymbols(allowEmpty=false) has element 0');
        ok (symbols ('true', '0').indexOf ('func() any {') >= 0, 'MarketSymbols(allowEmpty=true) may answer an empty list');
        ok (symbols ('false', '1').indexOf ('func() any {') >= 0, 'MarketSymbols does not prove element 1');
        const listed = (index: string) => g ('\tvar pair []any = []any{a, b}\n' + read (index, 'pair', 'DerefScalar('));
        ok (listed ('1').indexOf ('var m any = DerefScalar(pair[1])') >= 0, 'a slice literal proves its listed indexes');
        ok (listed ('2').indexOf ('func() any {') >= 0, 'a slice literal does not prove an index past its end');
        ok (g ('\tvar pair []any = []any{}\n' + read ('0', 'pair', 'DerefScalar(')).indexOf ('func() any {') >= 0, 'an empty slice literal proves nothing');
        // hx11 w7: two sibling guard closures in one expression under a `len(row) > 1` statement bound
        const arm = (idx: string, tail: string) => '\t\t\t\tif ' + idx + ' >= 0 && ' + idx + ' < len(row) {\n\t\t\t\t\treturn row[' + idx + ']\n\t\t\t\t}\n\t\t\t\treturn nil\n\t\t\t}()' + tail + '\n';
        const sibling = g ('\tvar row []any = SafeListTyped(a, 0)\n\tvar n int = len(row)\n\tvar s string = ""\n\tif n > 1 {\n\t\ts = this.F(func() any {\n' + arm ('0', ') + this.F(func() any {') + arm ('1', ')') + '\t}\n');
        ok (sibling.indexOf ('func() any {') < 0 && sibling.indexOf ('s = this.F(row[0]) + this.F(row[1])') >= 0, 'sibling guard closures under a len() bound both go native: ' + sibling);
        ok (g ('\tvar row []any = SafeListTyped(a, 0)\n\tvar s string = ""\n\ts = this.F(func() any {\n' + arm ('0', ') + this.F(func() any {') + arm ('1', ')')).indexOf ('func() any {') >= 0, 'sibling guard closures without a bound keep the literals');
        const once = g (lists + '\tif len(markets) > 0 {\n' + read ('0', 'markets', 'DerefScalar(') + '\t}\n');
        ok (nativeGuardedListElementReads (once) === once, 'idempotent');
        const wired = formatGoSource ('selftest.go', 'package ccxt\n\nfunc (this *X) f() any {\n' + lists + '\tif len(markets) > 0 {\n' + read ('0', 'markets', 'DerefScalar(') + '\t}\n\treturn nil\n}\n');
        ok (wired.indexOf ('var m any = markets[0]') >= 0, 'wired into formatGoSource: ' + wired);
    } catch (e) {
        problems.push ('hx11 w4 P2 threw: ' + e.message);
    }
    return problems;
}

// Semantic post-passes over the printer text: a leaked body goroutine, a missing type
// assertion and an unbounded element read are fixed here; layout is the printer's job and
// is gofmt-clean except where an emitter splices operand text into a call it prints.
export function formatGoSource (filePath: string, content: string): string {
    if (!filePath.endsWith ('.go')) {
        return content;
    }
    // first, so goChanCarrierPass and the local classifiers see the typed parser signatures
    content = retypeGoProvenParseMethods (content);
    content = hx11w8NonceInt64 (content);  // hx11 w8 m172: every Nonce() override is int64
    content = hx11w8NonceLocals (content);  // hx11 w8 M260: locals fed by Nonce()/IncrementingNonce() are int64
    content = g21Pass (content, filePath);  // hx10 w5 G21, first: the prediction tier's boxed locals
    content = g05Locals (content);  // hx10w3 G05: typed locals from generated return types
    content = g02pass (content);  // hx10 G02
    content = guardMultiSendCores (content);
    content = h2kG11NativeBoxAbsentSends (content);
    content = assertTypedElementAccess (content);
    content = nativeAppendWriteBack (content);
    content = retagLoopBoundedElementReads (content);
    content = nativeLoopBoundedSliceReads (content);
    content = hx4X01TupleProducerReads (content);
    content = nativeTupleHolderReads (content);
    content = b02TupleSliceSlotReads (content);  // hx10 w7 B02: the params slot of a tuple holder
    content = hx10w8Gp08TuplePairBinds (content);  // hx10 w8 GP08: typed slot-0 local, native pair bind
    content = nativeAsyncTupleHolderReads (content);
    content = hx4G12TupleSlotReads (content, filePath);
    hx4G34TupleSlotNeverNil.file = goTextMaskLiteralsAndComments (content).split ('\n');  // hx4 G34
    content = g06MapReads (content);  // hx10w2 G06
    content = hx11M43SafeDictLocals (content, filePath);  // hx11 w8 M43
    content = hx11w8BaseMapLocals (content, filePath);
    content = nativeTypedContainerAccess (g10kAddElemRetypeMapLocals (content));
    content = gp28Stores (content);  // hx10 w10 GP28: trades/orderbooks cache stores on the map field
    content = hx4G25Pass (content);  // hx4 G25
    content = hx4G29Pass (content);  // hx4 G29
    hx4G34TupleSlotNeverNil.file = undefined;  // hx4 G34
    content = g01SubsHandOff (content);  // hx10w3 G01
    content = w8ClientTableCalls (w8ClientFuturesReads (w8FuturesPairInOp (g10kInopClientMaps (content))));
    content = hx4G07FieldInOp (content);
    content = g09w3Pass (content);  // hx10w3 G09: prediction caches are typed maps
    content = hx5P28BaseFieldReads (content);  // hx5 P28
    content = h2kG13NativeKeysAndRemove (content);
    content = g10kTypepredIsArray (content);
    content = g10kArrNativeRemove (content);
    content = nativeDerefArgMapReads (content);
    content = nativeDerefOnlyListReads (content);
    content = g04BookSides (content);  // hx10w6 G04: the book reads that pass left on a proven receiver
    content = nativeOrderBookSideReads (content);
    content = nativeEndpointListReceives (content);
    content = nativeAsyncListReceives (content);
    content = hx11TernaryInt64Closure (content);  // hx11 printer-go-ternary-closure-int64
    content = hx4G18NativeCompare (hx4G30Arith (hx4G21UnboxDefaultedSafeInteger (content)));  // hx4 G18, G30
    content = hx4G23Comparisons (content);  // hx4 G23
    content = hx4G27Comparisons (content);  // hx4 G27
    content = hx4G31Divide (content);  // hx4 G31
    content = hx4G32Comparisons (content);  // hx4 G32
    content = hx4G38Pass (content);  // hx4 G38
    content = goNativeStringAdds (content);
    content = goChanCarrierPass (content);
    content = g10kLenNative (content);
    content = goErrValuePass (goEndpointCheckedReceives (content));  // G10K-err-a
    content = goChan3Pass (content);  // GO-CHAN3: AsyncResult[any] -> AsyncResult[T], after go-err
    content = gp18Pass (content);  // hx10 w9 GP18: EndpointResult[T] receive reads .Value, MapTyped(Raw) drops
    content = hx4G12TupleSlotReads (content, filePath);  // hx4 G12, again: async []any producers are received as rN.Value only after GOCHAN3
    content = hx11w8PromiseAllSlotReads (content);  // hx11 w8 M40: promiseAll destructure slots, once the receive prints ListTyped(r.Value)
    content = hx11w8PromiseAllLoopReads (content);  // hx11 w8 r16: loop-built task lists read back under the same len() bound
    content = hx11w8PromiseAllSelfBoundReads (content);  // hx11 w8: GetValue(h, i) inside `for i < len(h)`
    content = goTickerCachePass (content);  // typed ws ticker caches, after goChan3's resolved switches
    content = g09Pass (content);  // hx10w2 G09: Options is a plain map
    content = hx10G10Pass (content);  // hx10 G10: plain ws cache maps on BaseExchange
    content = hx10G02Pass (content);  // hx10 W3 G02: ws caches owned by the exchange dispatch loop
    content = hx10w4OG01Pass (content);  // hx10 W4 OG01: balance cache owned by the same loop
    content = hx10w6G01BalanceOwner (content);  // hx10 wave6 G01: typed balance field and account views
    content = hx10w9GB10BalanceWrites (content);  // hx10 wave9 GB10: native Balance stores after the owner passes
    content = hx10OG02Pass (content);  // hx10 wave-4 OG02: markets book owned by the load path
    content = hx10OG05Pass (content);  // hx10 w7 OG05: base/quote currencies + transactions published
    content = hx10w4OG03Pass (content);  // hx10w4 OG03: ticker caches + positions owned by the dispatch loop
    content = og03w6pass (content);  // hx10w6 OG03: ws client registry reads ask the owner
    content = hx4G39TupleSlotDerefs (content);  // hx4 G39
    content = hx10w3G07Pass (content);  // hx10 w3 G07
    content = hx10G03Pass (content);  // hx10 G03, last: the passes above are what type these receivers
    content = hx10G08TupleReads (content);  // hx10 G08
    content = g01UrlsViews (content);  // hx10w5 G01: typed urls views
    content = hx10w5G05Pass (content);  // hx10w5 G05: one ohlcv book per symbol, typed per timeframe
    content = hx10G15Pass (content);  // hx10 wave5 G15: option-dict field receivers
    content = og02IdBookPass (content);  // hx10w6 OG02: the id/nonce counter and last-response reads hand off to the request book owner
    content = hx11m36MarketsByIdInOp (content);  // hx11 m36: after OG02 prints the Markets_by_id() accessor
    content = og06SyncMapArmsPass (content);  // hx10 w7 OG06: the resolved map coercion drops its *sync.Map arm where the producer cannot yield one
    content = gb08Pass (content, filePath);  // hx10 w8 GB08: prediction-tier element reads inside a len(list) loop
    content = gp19Pass (content, filePath);  // hx10 w9 GP19: venue + pro element reads inside a len(list) loop
    content = hx11w8TM01Pass (content);  // hx11 w8 TM01: the typed forward hands r.Value over, no map round trip
    content = hx10w8GO04Pass (content);  // hx10 w8 GO04: a coercion feeding one typed FromMap builder goes, the builder takes the box
    content = gb09CredentialStrings (content);  // hx10 w9 GB09: the credential fields are plain strings
    content = hx10w9GO05Pass (content);  // hx10 w9 GO05: no *sync.Map producer is left, so the coercion's last arm goes
    content = hx10w10GP27Pass (content);  // hx10 w10 GP27: the resolved map/list coercion becomes a typed watch receive
    content = hx10w9Gp17ParamsSlotBinds (hx10w9Gp17TupleTwins (content));  // hx10 w9 GP17: last, on the settled call sites
    content = g04NativeBookReads (content);  // hx11 w8: the guarded cache read unboxes with a native assertion
    content = goOrderBookSetterPass (content);  // last: the book local is typed, and a GetAsks call or the assertion proves it non-nil
    content = hx11w8TickerReadPass (content);  // hx11 w8: TickerMapFromMap(snapshot) sends read the typed cache
    content = nativeGuardedListElementReads (content);  // hx11 w4 P2: last, on the settled guard literals
    return goGofmtSplicedText (content);
}

// ------------------------------------------------------------------------------------
// gofmt spacing of the arithmetic an emitter splices into a call or an index
// ------------------------------------------------------------------------------------
// go/printer (src/go/printer/nodes.go) prints a level-4/5 operator (`+ - * / % << >>
// & &^ | ^`) with a blank on each side only when cutoff() asks for it: 6 for the
// operator tree on top of a statement, 5 when that tree mixes level 4 and level 5, and
// 4 - both blanks dropped - one level down. The level is 1 at the start of every
// statement, one deeper for the argument list of a call with more than one argument and
// for an index or slice expression, one shallower inside parentheses (never below 1),
// and 1 again inside a composite literal.
//
// The printer prints the operand text of the helper call it emits - the key of
// `AddElementToObject(container, key, value)`, the index of `GetValue(list, index)`, a
// string slice's bounds, the terms of `Add`/`Subtract` - at the level of the TS
// expression it was read from, not at the level of the Go text it lands in: the TS
// `trades[length - 1] = lastTrade` comes out as `AddElementToObject(trades, length - 1,
// lastTrade)`, while gofmt prints that call as `AddElementToObject(trades, length-1,
// lastTrade)`, because the argument list of a three-argument call is level 2. Text the
// printer has already produced cannot be re-printed, so normalise it once, here:
//   * every level-4/5 operator at level >= 2 loses both blanks, except where dropping
//     them would glue two tokens into a different one (`/*`, `//`, `++`, `--`, `&&`,
//     `&^`): walkBinary() raises the cutoff for exactly those pairs, so their blanks stay;
//   * a string slice's `:` takes the blanks go/printer's SliceExpr block gives it;
//   * `if (cond) {` / `for (cond) {` / `switch (cond) {` lose the redundant parens
//     controlClause() strips off a control expression.
function goGofmtSplicedText (content: string): string {
    if (content.indexOf ('(') < 0) {
        return content;
    }
    return goGofmtLevelOneSums (goGofmtTightenSplicedArithmetic (goGofmtLevelOneChains (goGofmtSliceColons (content))));
}

// the RHS of a one-to-one assignment is level 1, and so is the sole argument of a one-argument
// call there: a chain of level-4 operators only (cutoff 6) keeps both blanks, e.g. gofmt's
// `x += "::" + Join(s, ",")` and `x = SafeStringPtr(*a + "-" + b)`
function goGofmtLevelOneSums (content: string): string {
    const lines = content.split ('\n');
    for (let l = 0; l < lines.length; l++) {
        const statement = /^(\t*[A-Za-z_][A-Za-z0-9_.]* (?:[-+|^]?=|:=) )(.+)$/.exec (lines[l]);
        if (statement === null) {
            continue;
        }
        let rhs = statement[2];
        let head = statement[1];
        let tail = '';
        for (let call = /^[A-Za-z_][A-Za-z0-9_.]*\(/.exec (rhs); call !== null; call = /^[A-Za-z_][A-Za-z0-9_.]*\(/.exec (rhs)) {
            const open = call[0].length - 1;
            if ((goMatchingCloseText (rhs, open) !== rhs.length - 1) || (goCountFrameArgsText (rhs, open) !== 1)) {
                break;
            }
            head += rhs.slice (0, open + 1);
            tail = ')' + tail;
            rhs = rhs.slice (open + 1, rhs.length - 1);
        }
        const widened = goWidenLevelFourChainText (rhs);
        if (widened !== null) {
            lines[l] = head + widened + tail;
        }
    }
    return lines.join ('\n');
}

// index of the bracket closing the one at `open` (strings skipped), -1 when unbalanced
function goMatchingCloseText (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (text, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

// `text` with a blank on each side of every top-level binary operator, when all of them are
// level 4 (`+ - | ^`); null when there is none, another operator, or nothing to change
function goWidenLevelFourChainText (text: string): string | null {
    const operators: number[] = [];
    let depth = 0;
    let operand = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (text, i);
            operand = true;
        } else if (/[0-9.]/.test (char) && !operand) {
            i += /^[0-9.]*(?:[eEpP][-+]?)?[0-9A-Za-z_.]*/.exec (text.slice (i))[0].length - 1;   // `1e-9` is one literal
            operand = true;
        } else if (char === '/' && (text[i + 1] === '/' || text[i + 1] === '*')) {
            return null;
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
            operand = true;
        } else if ((depth === 0) && (char !== ' ') && (char !== '\t')) {
            const value = goGoOperatorText (text, i);
            if ((value !== null) || (char === '=') || (char === '!') || (char === ':') || (char === ',')) {
                if (operand) {
                    if ((value === null) || (value.precedence !== 4)) {
                        return null;
                    }
                    operators.push (i);
                }
                operand = false;
                i += (value === null) ? 0 : value.token.length - 1;
            } else {
                operand = true;
            }
        }
    }
    if (operators.length === 0) {
        return null;
    }
    let out = text;
    for (let o = operators.length - 1; o >= 0; o--) {
        const at = operators[o];
        const right = (out[at + 1] === ' ') ? '' : ' ';
        const left = (out[at - 1] === ' ') ? '' : ' ';
        out = out.slice (0, at) + left + out[at] + right + out.slice (at + 1);
    }
    return (out === text) ? null : out;
}

// the characters a Go operand can end with, i.e. the left neighbour of a binary operator
const GO_OPERAND_ENDER = /[A-Za-z0-9_)\]}"'`]/;

// go/printer's walkBinary() raises the cutoff - and so keeps both blanks - for exactly the
// operand pairs that would otherwise glue into another token: `/*`, `//`, `&&`, `&^`,
// `++`, `--`. Every other pair (`+ *p`, `x & y`, ...) is compacted normally.
function goOperatorGluesTokens (operator: string, right: string): boolean {
    const pair = operator + right;
    return (pair === '/*') || (pair === '//') || (pair === '&&') || (pair === '&^') ||
        (pair === '++') || (pair === '--');
}

// go/printer never doubles grouping parens: a ParenExpr whose operand is itself a ParenExpr
// prints its operand only, so `((a == b))` comes out `(a == b)`; call/conversion parens are kept
const GO_PAREN_KEYWORDS = new Set ([ 'if', 'for', 'switch', 'return', 'case', 'go', 'defer', 'range' ]);
function goGofmtNestedParens (content: string): string {
    if (content.indexOf ('((') < 0) {
        return content;
    }
    const match = new Map<number, number> ();
    const stack: number[] = [];
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i);
        } else if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i);
        } else if (char === '(') {
            stack.push (i);
        } else if (char === ')' && stack.length > 0) {
            match.set (stack.pop (), i);
        }
    }
    const drop = new Set<number> ();
    for (const [ open, close ] of match) {
        if ((content[open + 1] !== '(') || (match.get (open + 1) !== close - 1)) {
            continue;
        }
        let k = open - 1;
        while ((k >= 0) && (content[k] === ' ' || content[k] === '\t')) {
            k -= 1;
        }
        const word = /(\w+)$/.exec (content.slice (Math.max (0, k - 15), k + 1));
        if ((k >= 0) && GO_OPERAND_ENDER.test (content[k]) && !((word !== null) && GO_PAREN_KEYWORDS.has (word[1]))) {
            continue;                     // outer is a call/conversion paren: keep it
        }
        drop.add (open + 1);
        drop.add (close - 1);
    }
    if (drop.size === 0) {
        return content;
    }
    let out = '';
    for (let i = 0; i < content.length; i++) {
        if (!drop.has (i)) {
            out += content[i];
        }
    }
    return out;
}

// index of the last byte of the Go literal that starts at `index`
function goSkipLiteralText (content: string, index: number): number {
    const quote = content[index];
    for (let i = index + 1; i < content.length; i++) {
        const char = content[i];
        if (char === '\\' && quote !== '`') {
            i += 1;
        } else if (char === quote) {
            return i;
        } else if (char === '\n' && quote !== '`') {
            return i - 1;                 // unterminated: stop at the line end
        }
    }
    return content.length - 1;
}

// index of the last byte of the comment that starts at `index`
function goSkipCommentText (content: string, index: number): number {
    if (content[index + 1] === '/') {
        const end = content.indexOf ('\n', index);
        return end < 0 ? content.length - 1 : end;
    }
    const end = content.indexOf ('*/', index + 2);
    return end < 0 ? content.length - 1 : end + 1;
}

// number of comma separated entries between the bracket at `opener` and its matching
// closer (strings and comments ignored); 0 when unbalanced
function goCountFrameArgsText (content: string, opener: number): number {
    let depth = 0;
    let entries = 0;
    let seen = false;
    for (let i = opener + 1; i < content.length; i++) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i);
            seen = true;
        } else if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            if (depth === 0) {
                return seen || entries > 0 ? entries + 1 : 0;
            }
            depth -= 1;
            seen = true;
        } else if (char === ',' && depth === 0) {
            entries += 1;
        } else if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
            seen = true;
        }
    }
    return 0;
}

// a `(` opens a call's (or a conversion's, or a func literal's) argument list when an
// operand or a selector ends right in front of it; every other `(` only groups, and
// go/printer prints a grouped expression one level shallower
function goIsCallParenText (content: string, open: number): boolean {
    let i = open - 1;
    while ((i >= 0) && ((content[i] === ' ') || (content[i] === '\t'))) {
        i -= 1;
    }
    return (i >= 0) && GO_OPERAND_ENDER.test (content[i]);
}

// a `(` that opens the parameter list of a function declaration, a method or a func type
// rather than a call: the names and types in there are declarations, so a `*` in there is a
// pointer, never a multiplication - nothing inside a signature is a level-4/5 expression
function goIsSignatureParenText (content: string, open: number): boolean {
    const head = content.slice (content.lastIndexOf ('\n', open - 1) + 1, open);
    const keyword = head.lastIndexOf ('func');
    return (keyword >= 0) && (head.indexOf ('{', keyword) < 0);
}

// the level-4/5 operator token at `index`, or null when the text there is none: level 6
// is unary, `++`/`--` and the `//`/`/*` openers are not operators, `*=` & co assign, and
// level 3 and below (`<`, `<-`, comparisons) always keep their blanks
function goLevel45OperatorText (content: string, index: number): string | null {
    const char = content[index];
    const next = content[index + 1];
    if ((char === '+') || (char === '-') || (char === '*') || (char === '/') ||
            (char === '%') || (char === '|') || (char === '^')) {
        return ((next === '=') || (next === '>') || (next === char) || (next === '-')) ? null : char;
    }
    if (char === '&') {
        if ((next === '&') || (next === '=')) {
            return null;
        }
        return (next === '^') ? '&^' : '&';
    }
    if ((char === '<') || (char === '>')) {
        if (next !== char) {
            return null;                  // a comparison, or the `<-` receive operator
        }
        return (content[index + 2] === '=') ? null : char + char;
    }
    return null;
}

// the `)` of a `if (cond) {` style control clause, i.e. of exactly the parens that wrap a
// whole control expression on one line: -1 when this `(` is anything else (a composite
// literal in the condition, a condition spanning lines, or no control keyword in front)
function goControlClauseClose (content: string, open: number): number {
    const head = content.slice (content.lastIndexOf ('\n', open - 1) + 1, open);
    // the parens may wrap the whole clause (`if (c) {`) or, in a three-clause `for`, just the
    // condition between the two semicolons (`for i := 0; (c); i++ {`); gofmt strips both
    const whole = /^[ \t]*(?:\} else )?(?:if|for|switch)[ \t]+$/.test (head);
    const middle = /^[ \t]*for[ \t]+[^;{]*;[ \t]*$/.test (head);
    if (!whole && !middle) {
        return -1;
    }
    let depth = 0;
    for (let i = open; i < content.length; i++) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i);
        } else if (char === '(') {
            depth += 1;
        } else if (char === ')') {
            depth -= 1;
            if (depth === 0) {
                const lineEnd = content.indexOf ('\n', i);
                const tail = content.slice (i + 1, lineEnd < 0 ? content.length : lineEnd);
                // `if (c) {` ends the line at the brace; a `for`'s middle clause is followed
                // by `; post {`, and gofmt strips the parens in both shapes
                const ok = /^[ \t]*\{[ \t]*$/.test (tail) || (middle && /^[ \t]*;[^;{]*\{[ \t]*$/.test (tail));
                return ok ? i : -1;
            }
        } else if ((char === '{') || (char === '}') || (char === '\n')) {
            return -1;                    // not the whole condition: gofmt keeps the parens
        }
    }
    return -1;
}

// go/printer's SliceExpr case prints a slice's bounds one level deeper than the slice, so
// their level-4/5 operators lose the blanks, and pads the `:` on both sides when the
// slice itself sits at level <= 1, has both bounds and at least one bound is a binary
// expression: `s[0:len(s) - 3]` is emitted by the printer, gofmt prints `s[0 : len(s)-3]`
function goGofmtSliceColons (content: string): string {
    const fixes: { 'start': number, 'end': number, 'text': string }[] = [];
    const stack: { 'open': number, 'level': number }[] = [];
    let level = 1;
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i) + 1;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i) + 1;
            continue;
        }
        if (char === '(' || char === '[' || char === '{') {
            stack.push ({ 'open': i + 1, 'level': level });
            if (char === '{') {
                level = 1;
            } else if (char === '[') {
                level += 1;
            } else if (goIsCallParenText (content, i)) {
                if (goCountFrameArgsText (content, i) > 1) {
                    level += 1;
                }
            } else if (level > 1) {
                level -= 1;
            }
            i += 1;
            continue;
        }
        if (char === ')' || char === ']' || char === '}') {
            const frame = stack.pop ();
            if (frame !== undefined) {
                if (char === ']') {
                    const fix = goSliceColonFix (content, frame.open, i, frame.level);
                    if (fix !== null) {
                        fixes.push (fix);
                    }
                }
                level = frame.level;
            }
            i += 1;
            continue;
        }
        i += 1;
    }
    fixes.sort ((a, b) => b.start - a.start);     // back to front: every edit keeps its offsets
    for (let f = 0; f < fixes.length; f++) {
        content = content.slice (0, fixes[f].start) + fixes[f].text + content.slice (fixes[f].end);
    }
    return content;
}

// the `colon : high` text of the slice whose bounds are `content[open : close]`, or null
// when the brackets hold anything but one `low:high` pair
function goSliceColonFix (content: string, open: number, close: number, level: number) {
    const bounds = content.slice (open, close);
    let depth = 0;
    let colon = -1;
    for (let i = 0; i < bounds.length; i++) {
        const char = bounds[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (bounds, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
        } else if (char === ':' && depth === 0) {
            if (colon >= 0) {
                return null;              // `low:high:max` and anything else: leave it alone
            }
            colon = i;
        }
    }
    if (colon < 0) {
        return null;
    }
    const low = bounds.slice (0, colon).replace (/[ \t]+$/, '');
    const high = bounds.slice (colon + 1).replace (/^[ \t]+/, '');
    const needsBlanks = (level <= 1) && (low.trim () !== '') && (high.trim () !== '') &&
        (goBoundIsBinary (low) || goBoundIsBinary (high));
    const blank = needsBlanks ? ' ' : '';
    return { 'start': open, 'end': close, 'text': low + blank + ':' + blank + high };
}

// true when the slice bound `text` is a binary expression for go/printer's isBinary(),
// i.e. when it has a binary operator of its own - one nested in a call or a bracket does
// not count, and neither does a unary sign
function goBoundIsBinary (text: string): boolean {
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (text, i);
        } else if (char === '(' || char === '[' || char === '{') {
            depth += 1;
        } else if (char === ')' || char === ']' || char === '}') {
            depth -= 1;
        } else if ((depth === 0) && ('+-*/%&|^<>=!'.indexOf (char) >= 0)) {
            let before = i - 1;
            while ((before >= 0) && ((text[before] === ' ') || (text[before] === '\t'))) {
                before -= 1;
            }
            if ((before >= 0) && GO_OPERAND_ENDER.test (text[before])) {
                return true;
            }
        }
    }
    return false;
}

// the same level rule for the operators the printer printed, with the control-clause
// parens dropped on the way through
function goGofmtTightenSplicedArithmetic (content: string): string {
    const out: string[] = [];
    const stack: { 'kind': string, 'level': number }[] = [];
    const strippedClosers = new Set<number> ();
    let level = 1;
    let lastChar = '';
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            const literal = content.slice (i, goSkipLiteralText (content, i) + 1);
            out.push (literal);
            lastChar = literal[literal.length - 1];
            i += literal.length;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            const comment = content.slice (i, goSkipCommentText (content, i) + 1);
            out.push (comment);                                 // a line comment keeps its newline
            i += comment.length;
            continue;
        }
        if (strippedClosers.has (i)) {
            i += 1;
            continue;
        }
        if ((char === '(') && (level > 0)) {
            const close = goControlClauseClose (content, i);
            if (close > 0) {
                strippedClosers.add (close);                    // stripParens(cond)
                i += 1;
                continue;
            }
        }
        if (char === '(' || char === '[' || char === '{') {
            stack.push ({ 'kind': char, 'level': level });
            if (char === '{') {
                level = 1;
            } else if (char === '[') {
                level += 1;
            } else if (goIsSignatureParenText (content, i)) {
                level = 0;                                      // declarations: no operators in there
            } else if (goIsCallParenText (content, i)) {
                if (goCountFrameArgsText (content, i) > 1) {
                    level += 1;
                }
            } else if (level > 1) {
                level -= 1;
            }
            out.push (char);
            lastChar = char;
            i += 1;
            continue;
        }
        if (char === ')' || char === ']' || char === '}') {
            const frame = stack.pop ();
            if (frame !== undefined) {
                level = frame.level;
            }
            out.push (char);
            lastChar = char;
            i += 1;
            continue;
        }
        const operator = goLevel45OperatorText (content, i);
        if ((operator !== null) && (level > 1) && GO_OPERAND_ENDER.test (lastChar)) {
            const tightened = goTightenedOperatorText (content, i, operator);
            if (tightened !== null) {
                if ((out.length > 0) && ((out[out.length - 1] === ' ') || (out[out.length - 1] === '\t'))) {
                    out.pop ();
                }
                out.push (operator);
                i = tightened.end;
                lastChar = '';
                continue;
            }
        }
        out.push (char);
        if ((char !== ' ') && (char !== '\t')) {
            lastChar = char;
        }
        i += 1;
    }
    return out.join ('');
}

// the blanks an operator printed at level >= 2 may not keep: the span to replace with the
// bare operator, or null when a blank has to stay there (a line break on either side, or a
// right operand that would glue with the operator into another token)
function goTightenedOperatorText (content: string, index: number, operator: string) {
    let start = index;
    while ((start > 0) && ((content[start - 1] === ' ') || (content[start - 1] === '\t'))) {
        start -= 1;
    }
    if ((start === 0) || (content[start - 1] === '\n')) {
        return null;                      // the operator starts a line: go/printer's linebreak
    }
    let end = index + operator.length;
    while ((end < content.length) && ((content[end] === ' ') || (content[end] === '\t'))) {
        end += 1;
    }
    const right = content[end] ?? '';
    if ((right === '') || (right === '\n') || goOperatorGluesTokens (operator, right)) {
        return null;
    }
    return { 'start': start, 'end': end };
}

// drop the blanks around every level-4/5 operator of `text` (level >= 2 throughout: the
// cutoff is 4, so no level-4/5 operator keeps a blank), strings and comments untouched
function goSqueezeLevel45Text (text: string): string {
    const out: string[] = [];
    let lastChar = '';
    let i = 0;
    while (i < text.length) {
        const char = text[i];
        if (char === '"' || char === '\'' || char === '`') {
            const literal = text.slice (i, goSkipLiteralText (text, i) + 1);
            out.push (literal);
            lastChar = literal[literal.length - 1];
            i += literal.length;
            continue;
        }
        if (char === '/' && (text[i + 1] === '/' || text[i + 1] === '*')) {
            const comment = text.slice (i, goSkipCommentText (text, i) + 1);
            out.push (comment);
            i += comment.length;
            continue;
        }
        const operator = goLevel45OperatorText (text, i);
        if ((operator !== null) && GO_OPERAND_ENDER.test (lastChar)) {
            const tightened = goTightenedOperatorText (text, i, operator);
            if (tightened !== null) {
                if ((out.length > 0) && ((out[out.length - 1] === ' ') || (out[out.length - 1] === '\t'))) {
                    out.pop ();
                }
                out.push (operator);
                i = tightened.end;
                lastChar = '';
                continue;
            }
        }
        out.push (char);
        if ((char !== ' ') && (char !== '\t')) {
            lastChar = char;
        }
        i += 1;
    }
    return out.join ('');
}

// go/printer threads the level it prints an expression at through the operator tree: the
// operands of a comparison or a logical operator print (at least) one level deeper, and in a
// chain that mixes level 4 and level 5 every level-5 operator sits one level deeper than the
// level-4 operator it hangs under (diffPrec()) - its grouped operand lands at level 2 with
// it (reduceDepth()). The frame walk above only counts brackets, so the level-1 chains are
// the one place left where the printer's own level bookkeeping shows: the composite literal
// element `(90 * 86400) * 1000 - 1` is gofmt's `(90*86400)*1000 - 1`, while the same chain
// without its level-4 operator keeps every blank (`(90 * 86400) * 1000`).
function goGofmtLevelOneChains (content: string): string {
    const fixes: { 'start': number, 'end': number, 'text': string }[] = [];
    const stack: { 'level': number }[] = [];
    let level = 1;
    let lineStart = 0;
    let i = 0;
    while (i <= content.length) {
        const char = content[i];
        if ((i === content.length) || (char === '\n')) {
            if (level === 1) {
                goCollectLevelOneChainFixes (content, lineStart, i, fixes);
            }
            lineStart = i + 1;
            i += 1;
            continue;
        }
        if (char === '"' || char === '\'' || char === '`') {
            i = goSkipLiteralText (content, i) + 1;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i);              // a line comment stops at its newline
            continue;
        }
        if (char === '(' || char === '[' || char === '{') {
            stack.push ({ 'level': level });
            if (char === '{') {
                level = 1;
            } else if (char === '[') {
                level += 1;
            } else if (goIsSignatureParenText (content, i)) {
                level = 0;
            } else if (goIsCallParenText (content, i)) {
                if (goCountFrameArgsText (content, i) > 1) {
                    level += 1;
                }
            } else if (level > 1) {
                level -= 1;
            }
            i += 1;
            continue;
        }
        if (char === ')' || char === ']' || char === '}') {
            const frame = stack.pop ();
            if (frame !== undefined) {
                level = frame.level;
            }
            i += 1;
            continue;
        }
        i += 1;
    }
    fixes.sort ((a, b) => b.start - a.start);     // back to front: every edit keeps its offsets
    for (let f = 0; f < fixes.length; f++) {
        content = content.slice (0, fixes[f].start) + fixes[f].text + content.slice (fixes[f].end);
    }
    return content;
}

// every Go operator token with go/token's precedence (0 for the ones that only delimit an
// expression: `=` & co assign, `<-` receives), or null when the text is not an operator
function goGoOperatorText (content: string, index: number) {
    const char = content[index];
    const next = content[index + 1];
    if (char === '<') {
        if (next === '<') { return (content[index + 2] === '=') ? null : { 'token': '<<', 'precedence': 5 }; }
        if (next === '-') { return { 'token': '<-', 'precedence': 0 }; }
        if (next === '=') { return { 'token': '<=', 'precedence': 3 }; }
        return { 'token': '<', 'precedence': 3 };
    }
    if (char === '>') {
        if (next === '>') { return (content[index + 2] === '=') ? null : { 'token': '>>', 'precedence': 5 }; }
        if (next === '=') { return { 'token': '>=', 'precedence': 3 }; }
        return { 'token': '>', 'precedence': 3 };
    }
    if (char === '&') {
        if (next === '&') { return { 'token': '&&', 'precedence': 2 }; }
        if (next === '^') { return (content[index + 2] === '=') ? null : { 'token': '&^', 'precedence': 5 }; }
        if (next === '=') { return null; }
        return { 'token': '&', 'precedence': 5 };
    }
    if (char === '|') {
        if (next === '|') { return { 'token': '||', 'precedence': 1 }; }
        if (next === '=') { return null; }
        return { 'token': '|', 'precedence': 4 };
    }
    if ((char === '+') || (char === '-')) {
        if ((next === char) || (next === '=') || (next === '>')) { return null; }   // `++`/`--`, `+=`, `->`
        return { 'token': char, 'precedence': 4 };
    }
    if ((char === '*') || (char === '/') || (char === '%') || (char === '^')) {
        if (next === '=') { return null; }
        return { 'token': char, 'precedence': (char === '^') ? 4 : 5 };
    }
    if (char === '=') {
        if (next === '=') { return { 'token': '==', 'precedence': 3 }; }
        return null;                      // a plain assignment is a separator
    }
    if (char === '!') {
        if (next === '=') { return { 'token': '!=', 'precedence': 3 }; }
        return null;                      // unary not
    }
    return null;
}

// the keywords that can stand in front of an expression: an operator right after one of
// them is unary, not binary
const GO_EXPRESSION_KEYWORDS = new Set ([ 'break', 'case', 'chan', 'const', 'continue', 'default',
    'defer', 'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface',
    'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var' ]);

// the level-1 chain of the line [start, end): a mix of level 4 and level 5 makes the level-5
// operators print at level 2 - and with them the grouped operand they own
function goCollectLevelOneChainFixes (content: string, start: number, end: number, fixes: { 'start': number, 'end': number, 'text': string }[]) {
    const tokens: { 'operator': string | null, 'start': number, 'end': number, 'keyword': boolean }[] = [];
    let has4 = false;
    let has5 = false;
    let i = start;
    while (i < end) {
        const char = content[i];
        if (char === '"' || char === '\'' || char === '`') {
            const literalEnd = goSkipLiteralText (content, i);
            tokens.push ({ 'operator': null, 'start': i, 'end': literalEnd + 1, 'keyword': false });
            i = literalEnd + 1;
            continue;
        }
        if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
            i = goSkipCommentText (content, i) + 1;
            continue;
        }
        const value = goGoOperatorText (content, i);
        if (value !== null) {
            const previous = tokens[tokens.length - 1];
            const binary = (previous !== undefined) && (previous.operator === null) && !previous.keyword;
            const precedence = (binary ? value.precedence : 0);
            if (precedence === 4) {
                has4 = true;
            } else if (precedence === 5) {
                has5 = true;
            }
            tokens.push ({ 'operator': (value.precedence >= 4) ? value.token : null, 'start': i, 'end': i + value.token.length, 'keyword': binary && (value.precedence < 4) });
            i += value.token.length;
            continue;
        }
        // an operand: everything up to the next operator, blank or separator of this level
        const operandStart = i;
        let depth = 0;
        while (i < end) {
            const operandChar = content[i];
            if (operandChar === '"' || operandChar === '\'' || operandChar === '`') {
                i = goSkipLiteralText (content, i) + 1;
                continue;
            }
            if (operandChar === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
                i = goSkipCommentText (content, i) + 1;
                continue;
            }
            if (operandChar === '(' || operandChar === '[' || operandChar === '{') {
                depth += 1;
            } else if (operandChar === ')' || operandChar === ']' || operandChar === '}') {
                if (depth === 0) {
                    break;
                }
                depth -= 1;
            } else if (depth === 0) {
                if (' \t:,='.indexOf (operandChar) >= 0) {
                    break;
                }
                if (goGoOperatorText (content, i) !== null) {
                    break;
                }
            }
            i += 1;
        }
        if (i > operandStart) {
            const operand = content.slice (operandStart, i);
            tokens.push ({ 'operator': null, 'start': operandStart, 'end': i, 'keyword': GO_EXPRESSION_KEYWORDS.has (operand) });
        } else {
            if (':,;='.indexOf (content[i]) >= 0) {
                // a separator ends the operand before it: what follows starts a new expression
                tokens.push ({ 'operator': null, 'start': i, 'end': i + 1, 'keyword': true });
            }
            i += 1;                       // a blank or a bracket: nothing to tokenize here
        }
    }
    if (!(has4 && has5)) {
        return;
    }
    for (let t = 0; t < tokens.length; t++) {
        const token = tokens[t];
        if (goOperatorPrecedenceText (token.operator as string) !== 5) {
            continue;
        }
        const previous = tokens[t - 1];
        if ((previous === undefined) || (previous.operator !== null) || previous.keyword) {
            continue;                     // a unary `*` owns no blanks and never mixes a chain
        }
        const tightened = goTightenedOperatorText (content, token.start, token.operator as string);
        if (tightened !== null) {
            fixes.push ({ 'start': tightened.start, 'end': tightened.end, 'text': token.operator as string });
        }
        // the operand of this level-5 operator prints one level deeper too: a grouped one
        // lands at level 2 with it, so every operator inside it loses its blanks
        const neighbours = [ t - 1, t + 1 ];
        for (let n = 0; n < neighbours.length; n++) {
            const neighbour = tokens[neighbours[n]];
            if ((neighbour !== undefined) && (neighbour.operator === null)) {
                const text = content.slice (neighbour.start, neighbour.end);
                if ((text[0] === '(') && (text[text.length - 1] === ')')) {
                    const squeezed = goSqueezeLevel45Text (text.slice (1, text.length - 1));
                    if (squeezed !== text.slice (1, text.length - 1)) {
                        fixes.push ({ 'start': neighbour.start + 1, 'end': neighbour.end - 1, 'text': squeezed });
                    }
                }
            }
        }
    }
}

// go/token precedence of the operators the Go printer can print
function goOperatorPrecedenceText (operator: string): number {
    switch (operator) {
    case '*': case '/': case '%': case '<<': case '>>': case '&': case '&^':
        return 5;
    case '+': case '-': case '|': case '^':
        return 4;
    }
    return 0;
}

// gofmt's printer starts the file at the package clause, writes exactly one blank line
// between it (and every import declaration) and what follows, never keeps more than one
// blank line anywhere (maxNewlines = 2), trims whitespace-only lines and ends the file with a
// single newline. Every emitter below assembles its own text — some leave two blank lines
// after the package clause, some none, one leaves three after the generated-header comment —
// so normalise those file-level properties once, here. Non-blank lines are left byte-for-byte
// alone. Pure text normalisation: no gofmt spawn.
function normalizeGoFileHeader (content: string): string {
    const lines = content.split ('\n');
    const packageLine = lines.findIndex ((line: string) => /^package \S/.test (line));
    if (packageLine < 0) {
        return content;         // hand-written file (or a fragment): leave it alone
    }
    const out = [ lines[packageLine] ];
    let i = packageLine + 1;
    while ((i < lines.length) && (lines[i].trim () === '')) {
        i++;
    }
    out.push ('');              // exactly one blank line after the package clause
    // every import declaration of the header (a file can carry more than one) keeps exactly
    // one blank line behind it
    while (/^import\b/.test (lines[i] ?? '')) {
        out.push (lines[i]);
        if (lines[i].indexOf ('(') >= 0) {
            i++;
            while ((i < lines.length) && (lines[i].trim () !== ')')) {
                out.push (lines[i]);
                i++;
            }
            out.push (lines[i]);            // the closing paren of the block
        }
        i++;
        while ((i < lines.length) && (lines[i].trim () === '')) {
            i++;
        }
        out.push ('');
    }
    // the rest of the file: every blank run collapses to a single blank line
    while (i < lines.length) {
        if (lines[i].trim () === '') {
            while ((i < lines.length) && (lines[i].trim () === '')) {
                i++;
            }
            if (i < lines.length) {
                out.push ('');
            }
            continue;
        }
        out.push (lines[i]);
        i++;
    }
    return out.join ('\n') + '\n';
}

// `gofmt -l` prints one path per line for every file it would reformat, and exits non-zero
// when a file does not even parse as go. Both are failures for the gate.
function gofmtListFiles (binary: string, targets: string[]) {
    const res = spawnSync (binary, [ '-l', ...targets ], { 'encoding': 'utf8', 'maxBuffer': 256 * 1024 * 1024, 'windowsHide': true });
    return {
        'files': (res.stdout ?? '').split ('\n').map ((line) => line.trim ()).filter ((line) => line.length > 0),
        'status': res.status,
        'error': res.error,
        'stderr': (res.stderr ?? '').trim (),
    };
}

function runGofmtGate () {
    if (process.argv.includes ('--self-test')) {
        const problems = gofmtSelfTest ();
        if (problems.length) {
            console.error ('SELF-TEST FAILED:\n  - ' + problems.join ('\n  - '));
            process.exit (3);
        }
        console.log ('SELF-TEST PASSED');
        return;
    }
    const explicit = process.argv.slice (2).filter ((x) => !x.startsWith ('--'));
    const targets = explicit.length ? explicit : GOFMT_GATE_TREE.filter ((target) => fs.existsSync (target));
    if (!targets.length) {
        console.error ('--check-gofmt: nothing to check, no emitted go tree here (' + GOFMT_GATE_TREE.join (', ') + ')');
        process.exit (2);
    }
    const gofmt = resolveGofmt ();
    if (gofmt === null) {
        console.error ('--check-gofmt: gofmt not found (looked at $' + GOFMT_BINARY_ENV + ', PATH, $GOROOT/bin, /usr/local/go/bin)');
        process.exit (2);
    }
    const listed = gofmtListFiles (gofmt, targets);
    if (listed.error) {
        console.error ('--check-gofmt: could not run ' + gofmt + ': ' + listed.error.message);
        process.exit (2);
    }
    if (listed.files.length || listed.status !== 0) {
        const headline = listed.files.length
            ? listed.files.length + ' file(s) are not gofmt-clean:'
            : 'gofmt exited ' + listed.status + ' without listing a file (parse error or bad path):';
        console.error ('--check-gofmt: ' + headline);
        for (const file of listed.files) {
            console.error ('  ' + file);
        }
        if (listed.stderr.length) {
            console.error (listed.stderr);
        }
        process.exit (1);
    }
    console.log ('--check-gofmt: clean (' + gofmt + ' -l ' + targets.join (' ') + ')');
}

// The fixtures are flush-left on purpose: the strings are raw printer output, and any
// indentation of the template literals would end up inside them.
const GOFMT_SELFTEST_MULTISEND = `func (this *Exchange) fetch2Async(symbol any, params ...any) <-chan any {
	ch := make(chan any, 1)
	go this.fetch2Body(ch, symbol, params...)
	return ch
}
func (this *Exchange) fetch2Body(ch chan any, symbol any, params ...any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	var errors any = 0
	for IsLessThanOrEqual(errors, 3) {

		{
			func(this *Exchange) (ret_ any) {
				// try block:
				response := (<-this.FetchAsync(symbol, nil, nil, params))
				retRes := (<-this.ParseTicker(response, nil))
				ch <- retRes
				return nil
			}(this)
		}

	}
	return nil
}
`;

// the same text with the guard applied: the flag declaration after the two defers, the
// sent flag after the send, and the early exit right after the closure that produced it
const GOFMT_SELFTEST_MULTISEND_GUARDED = `func (this *Exchange) fetch2Async(symbol any, params ...any) <-chan any {
	ch := make(chan any, 1)
	go this.fetch2Body(ch, symbol, params...)
	return ch
}
func (this *Exchange) fetch2Body(ch chan any, symbol any, params ...any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	chSent := false
	_ = chSent
	var errors any = 0
	for IsLessThanOrEqual(errors, 3) {

		{
			func(this *Exchange) (ret_ any) {
				// try block:
				response := (<-this.FetchAsync(symbol, nil, nil, params))
				retRes := (<-this.ParseTicker(response, nil))
				ch <- retRes
				chSent = true
				return nil
			}(this)
			if chSent {
				return nil
			}
		}

	}
	return nil
}
`;

// a core that only ever sends at its own level: the guard must not touch a byte of it
const GOFMT_SELFTEST_SINGLE_SEND = `func (this *Exchange) fetchBalanceBody(ch chan any, params any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	response := (<-this.FetchAsync("balance", nil, nil, params))
	ch <- response
	return nil
}
`;

// the element-access assertion is semantics, not formatting: kept by formatGoSource
const GOFMT_SELFTEST_ELEMENT_ACCESS = `func (this *Exchange) parseKeysBody(ch chan any, keys any) any {
	defer close(ch)
	defer ReturnPanicError(ch)
	var key string = GetValue(keys, 0)
	ch <- key
	return nil
}
`;

function gofmtSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const passedThrough = formatGoSource ('selftest.go', GOFMT_SELFTEST_MULTISEND);
    ok (passedThrough === GOFMT_SELFTEST_MULTISEND_GUARDED,
        'formatGoSource must preserve the multi-send guard byte-for-byte\n--- actual ---\n' + passedThrough + '--- expected ---\n' + GOFMT_SELFTEST_MULTISEND_GUARDED);
    ok (passedThrough.indexOf ('chSent := false') !== -1 && passedThrough.indexOf ('if chSent {') !== -1,
        'the guarded core must carry the flag declaration and the early exit');
    const untouched = formatGoSource ('selftest.go', GOFMT_SELFTEST_SINGLE_SEND);
    ok (untouched === GOFMT_SELFTEST_SINGLE_SEND, 'a core that never multi-sends must pass through byte-identical');
    const asserted = formatGoSource ('selftest.go', GOFMT_SELFTEST_ELEMENT_ACCESS);
    ok (asserted.indexOf ('GetValue(keys, 0).(string)') !== -1, 'formatGoSource must keep the element-access assertion');
    const sums: [ string, string ][] = [
        [ '\tstreamHash += "::"+ccxt.Join(symbols, ",")', '\tstreamHash += "::" + ccxt.Join(symbols, ",")' ],
        [ '\tname = ccxt.SafeStringPtr("D"+*depth+"/"+*speed)', '\tname = ccxt.SafeStringPtr("D" + *depth + "/" + *speed)' ],
        [ '\tx = F(a+b, c)', '\tx = F(a+b, c)' ],
        [ '\tx = a*b + c', '\tx = a*b + c' ],
        [ '\tOrderRouterTolerance = 1e-9', '\tOrderRouterTolerance = 1e-9' ],
    ];
    for (const [ input, expected ] of sums) {
        const got = goGofmtSplicedText ('func f() {\n' + input + '\n}\n');
        ok (got === 'func f() {\n' + expected + '\n}\n', 'level-1 sum: ' + JSON.stringify (input) + ' -> ' + JSON.stringify (got));
    }
    // the gate's listing parser, against a real gofmt and a throwaway tree
    const gofmt = resolveGofmt ();
    if (gofmt === null) {
        console.log ('  note: gofmt not found — the gate listing check is skipped');
    } else {
        const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-check-gofmt-'));
        try {
            fs.writeFileSync (path.join (dir, 'clean.go'), 'package x\n\nfunc F() int {\n\treturn 1\n}\n');
            fs.writeFileSync (path.join (dir, 'dirty.go'), 'package x\n\nfunc F()  int {\n        return 1\n}\n');
            const listed = gofmtListFiles (gofmt, [ dir ]);
            ok (listed.status === 0 && listed.files.map ((file) => basename (file)).join (',') === 'dirty.go',
                'gofmt -l must list exactly the unformatted file, got [' + listed.files.join (',') + '] status=' + listed.status);
            const clean = gofmtListFiles (gofmt, [ path.join (dir, 'clean.go') ]);
            ok (clean.files.length === 0, 'a formatted file must not be listed');
        } finally {
            fs.rmSync (dir, { 'recursive': true, 'force': true });
        }
    }
    return problems;
}

// Typed pointer locals print both `x !== undefined` and `x !== null` as `x != nil`, and the printer
// also adds its own nil-guard before dereferencing (`x != nil && *x == ""`). Next to an explicit
// TS undefined-check that yields `(x != nil) && (x != nil ...`, which is harmless but rejected by
// `go vet` ("redundant and/or"), failing `go test`. Collapse the duplicated operand.
export function collapseRedundantNilChecks (content: string): string {
    const id = '([A-Za-z_][A-Za-z0-9_]*)';
    return content
        // (x != nil) && (x != nil && rest   ->  (x != nil) && (rest
        .replace (new RegExp ('\\(' + id + ' != nil\\) && \\(\\1 != nil && ', 'g'), '($1 != nil) && (')
        .replace (new RegExp ('\\(' + id + ' == nil\\) \\|\\| \\(\\1 == nil \\|\\| ', 'g'), '($1 == nil) || (')
        // (x != nil) && (x != nil)          ->  (x != nil)
        .replace (new RegExp ('\\(' + id + ' != nil\\) && \\(\\1 != nil\\)', 'g'), '($1 != nil)')
        .replace (new RegExp ('\\(' + id + ' == nil\\) \\|\\| \\(\\1 == nil\\)', 'g'), '($1 == nil)');
}

// Methods whose generated Go signature already returns map[string]any: MapTyped around their call is
// the identity and a `.(map[string]any)` assertion on it does not compile, so both are dropped.
const GO_MARKET_ROW_METHODS = [ 'Market', 'SafeMarket' ];
const GO_MAP_RETURNING_METHODS = [ 'Market', 'Currency', 'SafeCurrency', 'SafeMarket', 'Account', 'ParseOrderBook',
    'SafeOrder', 'SafeTicker', 'SafeLedgerEntry', 'ParseOrder', 'ParseTicker', 'ParseTransaction', 'ParseTransfer', 'ParseLedgerEntry',
    'SafeMarketStructure', 'SafeCurrencyStructure', 'SafeOpenInterest', 'ParseCurrency', 'ParseOpenInterest',
    'CreateOrderRequest', // only the 8 callers wrapping it: every one sits on a venue whose builder is a map
    // the ws parsers are `any` on the printer and retyped to map[string]any by the family below
    'ParseWsTrade', 'ParseWsTicker', 'ParseWsOrder' ];

// `go/v4/exchange_struct_returns.go` converters: every one returns the map it builds from a
// parsed struct, so a `MapTyped(<converter>(..))` around one is the identity.
const GO_PROVEN_STRUCT_TO_MAP_CALLS = [ 'TradeToMap', 'TickerToMap', 'OrderToMap', 'PositionToMap', 'FundingRateToMap' ];

// Structure parsers retyped to `map[string]any` on the base, every override and IDerivedExchange; the
// venue-only sub-parsers are the ones a retyped parser returns (kucoin/phemex dispatch).
function goProvenParseMapMethods (): string[] {
    return [ 'SafeOrder', 'SafeTicker', 'SafeLedgerEntry', 'ParseOrder', 'ParseTicker', 'ParseTransaction', 'ParseTransfer', 'ParseLedgerEntry',
        'ParseContractTicker', 'ParseUtaOrder', 'ParseContractOrder', 'ParseSpotOrder', 'ParseSwapOrder',
        // ws parsers: every override returns Safe{Order,Ticker,Trade}(..) wrapped by the
        // struct->map converter, i.e. a dictionary on every path
        'ParseWsTrade', 'ParseWsTicker', 'ParseWsOrder',
        'SafeMarketStructure', 'SafeCurrencyStructure', 'SafeOpenInterest', 'ParseCurrency', 'ParseOpenInterest',
        'SafePredictionOrder', 'SafePredictionTicker', 'SafePredictionOrderBook', 'ParsePredictionOrder', 'ParsePredictionTicker', 'ParsePredictionOpenInterest',
        'ParseSpotOrUtaTicker', 'ParseContractOrderBook', 'ParseFundingRate', 'ParseLeverage', 'ParseTradingFee', 'ParseDepositAddress', 'ParseMarginMode', 'ParseGreeks', 'ParseOption', 'ParseBorrowRate', 'ParseIsolatedBorrowRate', 'ParseConversion', 'ParseMarginModification', 'ParseTradeTx', 'ParseLeverageFromMarket', 'ParseLeverageFromSetting', 'ParseMarginModeFromSetting',
        'ParseMarginLoan', // U15
        'ParseADLRank', // U16
        'ParseEvent', 'ParseMarketToEvent', // W18
        'SafePosition', 'ParsePosition', 'ParseOptionPosition', // gochan32-U10
        'Sign' ]; // hx11 w8 r18: base + every override return a request map literal
}

// function-level `return` expressions of a Go body (func literal bodies skipped); undefined when unscannable
function goFunctionLevelReturnExprs (body: string): string[] | undefined {
    const inLiteral: boolean[] = [];
    const stack: boolean[] = [];
    let literalOpen = 0;
    for (let i = 0; i < body.length; i++) {
        inLiteral[i] = literalOpen > 0;
        const c = body[i];
        // block comments too: a doc URL (`https://`) would otherwise open a line comment mid-docblock
        if ((c === '"') || (c === '`') || (c === "'") || ((c === '/') && ((body[i + 1] === '/') || (body[i + 1] === '*')))) {
            const end = ((c === '/') && (body[i + 1] === '/')) ? goSkipCommentText (body, i) - 1 : (c === '/') ? goSkipCommentText (body, i) : goSkipLiteralText (body, i);
            for (let k = i + 1; k <= end; k++) {
                inLiteral[k] = literalOpen > 0;
            }
            i = end;
        } else if (c === '{') {
            const lineStart = body.lastIndexOf ('\n', i - 1) + 1;
            const isLiteral = /(^|[^\w.])func\s*\([^)]*\)/.test (body.substring (lineStart, i));
            stack.push (isLiteral);
            literalOpen += isLiteral ? 1 : 0;
        } else if (c === '}') {
            if (!stack.length) {
                return undefined;
            }
            literalOpen -= stack.pop () ? 1 : 0;
        }
    }
    if (stack.length) {
        return undefined;
    }
    const exprs: string[] = [];
    let offset = 0;
    for (const line of body.split ('\n')) {
        const trimmed = line.trim ();
        if (!inLiteral[offset] && /^return([ \t]|$)/.test (trimmed)) {
            exprs.push (trimmed.substring ('return'.length).trim ());
        }
        offset += line.length + 1;
    }
    return exprs;
}

/**
 * Retypes every declaration of goProvenParseMapMethods() from `any` to `map[string]any`. A def is
 * proven when each function-level return is a map literal, `this.Extend(..)` or a call of a method of
 * the same family (itself retyped), or a local declared once from such an expression and never
 * reassigned (that local is typed too); a def with no return must end in panic (base stubs). None of
 * these can return nil. Go interfaces pin one signature, so an unproven def throws instead of staying `any`.
 */
// describe() is a dictionary on every tier (TS `describe (): Dict`): base, every venue and the ws/prediction
// tiers return a map literal or `this.DeepExtend(..)`, never nil. The base files bypass formatGoSource, so the
// two base writes call this directly.
export function retypeGoDescribe (content: string): string {
    return retypeGoProvenFamily (content, [ 'Describe' ], 'map[string]any', 'MapTyped', [ 'Extend', 'DeepExtend' ]);
}

export function retypeGoProvenParseMethods (content: string): string {
    content = retypeGoDescribe (content);
    const lists = goProvenListMethods ().concat (G05_PROVEN_LIST_METHODS);
    content = retypeGoProvenFamily (content, lists, '[]any', 'this.ToArray', lists.concat ([ 'ArraySlice', 'ToArray', 'SortBy', 'SortBy2', 'ArrayConcat' ]));
    const maps = goProvenParseMapMethods ().concat (goProvenMapCollectionMethods ());
    // proven dict producers the struct-returns pass retypes itself: a family def may return one,
    // but they are not members of this family (their `any` stub is the struct pass's to retype)
    const calleeOnly = [ 'SafeTrade', 'ParseTrade' ];
    content = retypeGoProvenFamily (content, maps, 'map[string]any', 'MapTyped', maps.concat (calleeOnly, [ 'Extend', 'DeepExtend', 'IndexBy' ]));
    // dydx/hitbtc/lighter/pacifica/toobit build a pair list, so only these two dispatchers retype
    const builders = [ 'CreateRegularOrderRequest', 'CreateTriggerOrderRequest', 'CreateSpotOrderRequest', 'CreateSwapOrderRequest' ];
    return retypeGoProvenFamily (content, [ 'CreateOrderRequest' ], 'map[string]any', 'MapTyped', builders, 'Deepcoin|Hashkey');
}

// list producers (base + every override): TS `X[]`; a returned `array` parameter is coerced with ToArray (caches too)
function goProvenListMethods (): string[] {
    return [ 'ParseOrders', 'ParseTrades', 'ParseTradesHelper', 'ParseTransactions', 'ParseOHLCVs', 'ParseLedger', 'ParsePositions', 'ParseMarkets',
        'ParseTransfers', 'FilterBySinceLimit', 'FilterBySymbolSinceLimit', 'FilterBySymbolsSinceLimit', 'FilterByArrayPositions',
        'FilterByValueSinceLimit', 'FilterByCurrencySinceLimit', 'FilterByLimit', 'ParseCancelOrders',
        'ParseBorrowRateHistory', // U15
        'InsertMissingCandles', 'ParseTradingViewOHLCV', // gochan32-U05
 'ArraysConcat',
        'ParseTransactionsByType', // U09: kraken, FilterByCurrencySinceLimit on its only path
        'ParseMarketLeverageTiers', 'ParseEmulatedLeverageTiers', // U14
        'ParseOpenInterestsHistory', 'ParseLiquidations', 'ParseADLRanks', 'FilterByArrayADLRanks', 'FilterByArrayPositions', // U16
        'ParseConversions', 'ParseLongShortRatioHistory', 'ParseAccounts', // U17
        'ParsePredictionOrders', 'FilterByOutcomeSinceLimit', // U03
        'ParseFundingRateHistories', 'ParseIncomes', 'ParseFundingHistories', // U13
        'ParsePredictionTrades', // U04
        'ParsePredictionPositions', // U10
        'ParseDepositAddresses', // W15
        'ParseDepositMethodIds', 'ParsePortfolioDetails' ]; // W23
}

// dict producers beyond the single-structure parsers (Balances/Tickers/FundingRates/Dictionary<..>). SafeBalance stays
// `any` (ws venues hand it this.Balance, a *sync.Map); it returns its argument, so `SafeBalance(<map literal local>)` is proven
function goProvenMapCollectionMethods (): string[] {
    return [ 'ParseBalance', 'ParseTickers', 'ParseCurrencies', 'FilterByArrayTickers', 'ParseFundingRate', 'ParseFundingRates',
        'ParseDepositAddress', 'ParseLeverage', 'ParseTradingFee', 'ParseDepositWithdrawFees',
        'ParseIsolatedBorrowRates', // U15
        'ParseLastPrices', 'RemoveKeysFromDict', 'ParseTickersForRolling', 'ParseBidsAsksCustom', 'ParseSxbetTickersByHash', // U06
        // venue balance parsers (every override ends in SafeBalance(<balance local>) or returns another of these)
        'ParseBalanceCustom', 'ParseUtaBalance', 'ParseBalanceByType', 'ParseBalanceForSingleCurrency', 'ParseCustomBalance',
        'ParseSwapBalance', 'ParseSpotBalance', 'CustomParseBalance', 'ParseFundingBalance', 'ParseTradingBalance', 'ParseBalanceList', // U07
        'ParseCurrenciesCustom', // U08
        'ParseLeverageTiers', 'ParseLeverages', 'ParseMarginModes', // U14
        'ParseOpenInterests', // U16
        'ParseAllGreeks', 'ParseOptionChain', 'ParseAccount', // U17
        'ParseDepositAddressSpecial', // U11
        'ParseTradingFees', 'AssignDefaultDepositWithdrawFees', 'ParseDepositWithdrawFee', 'ParseTradingLimits', 'DepositWithdrawFee',
        'ParsePublicDepositWithdrawFees', // U12
        'SetApiCredentials' ]; // W20: opinion/polymarket return their creds map literal
}

// `X` is a balance local: declared once as a map literal, and every later write keeps the same map
// (`X = this.MergeBalanceAccount(X, ..)` / `X = this.SafeBalance(X)` both return their first
// argument, bare or inside the printer's `MapTyped(..)` box cast)
export function goBalanceLocalIsMap (body: string, name: string): boolean {
    if ((body.match (new RegExp ('\\bvar ' + name + '\\b', 'g')) || []).length !== 1) {
        return false;
    }
    if (!new RegExp ('\\n\\t+var ' + name + ' (?:any|map\\[string\\]any) = map\\[string\\]any\\{').test (body)) {
        return false;
    }
    if (new RegExp ('(?<![\\w.])' + name + '\\s*(?:,[^\\n=]*)?:=|\\bfunc\\s*\\([^)]*\\b' + name + ' ').test (body)) {
        return false;
    }
    const writes = body.match (new RegExp ('(^|[^\\w.])' + name + '\\s*[-+*/:]?=[^=][^\\n]*', 'gm')) || [];
    const keeps = new RegExp ('^[^\\w.]?' + name + ' = (?:MapTyped\\()?this\\.(?:MergeBalanceAccount\\(' + name + ', |SafeBalance\\(' + name + '\\)\\)?$)');
    return writes.every ((w) => keeps.test (w));
}

// one family: `names` retype to `type`; returns proven by a `type` literal, a call of `calls`, a typed/proven local,
// or (paramWrap) a parameter of the def wrapped in the coercion
function retypeGoProvenFamily (content: string, names: string[], type: string, paramWrap: string, calls: string[], receivers = '\\w+'): string {
    const literal = type + '{';
    const provenCall = new RegExp ('^(?:ccxt\\.)?this\\.(?:DerivedExchange\\.|base\\.)?(?:' + calls.join ('|') + ')\\(');
    // the struct->map converters are package-level functions (no `this.` receiver)
    const provenConverter = new RegExp ('^(?:ccxt\\.)?(?:' + GO_PROVEN_STRUCT_TO_MAP_CALLS.join ('|') + ')\\(');
    const proven = (e: string) => e.startsWith (literal) || provenCall.test (e) || provenConverter.test (e);
    const typeRe = type.replace (/[[\]]/g, '\\$&');
    const head = new RegExp ('\\nfunc \\(this \\*(' + receivers + ')\\) (' + names.join ('|') + ')\\(([^)\\n]*)\\) any \\{\\n', 'g');
    let out = '';
    let cursor = 0;
    for (let m = head.exec (content); m !== null; m = head.exec (content)) {
        const open = m.index + m[0].length - 1;
        const close = content.indexOf ('\n}\n', open);
        const body = (close < 0) ? '' : content.substring (open, close + 1);
        const exprs = goFunctionLevelReturnExprs (body);
        const where = m[1] + '.' + m[2];
        if ((close < 0) || (exprs === undefined)) {
            throw new Error ('retypeGoProvenParseMethods: cannot scan ' + where);
        }
        if (!exprs.length && !/(^|\n)\tpanic\([^\n]*\)\n$/.test (body)) {
            throw new Error ('retypeGoProvenParseMethods: ' + where + ' has no return and does not end in panic');
        }
        let newBody = body;
        const params = m[3].split (',').map ((p) => p.trim ().split (' ')[0]);
        for (const expr of exprs) {
            if (proven (expr)) {
                continue;
            }
            const balance = /^this\.SafeBalance\((\w+)\)$/.exec (expr);
            if ((type === 'map[string]any') && (balance !== null) && goBalanceLocalIsMap (newBody, balance[1])) {
                newBody = newBody.replace (new RegExp ('\\n(\\t+)return this\\.SafeBalance\\(' + balance[1] + '\\)\\n', 'g'), '\n$1return this.SafeBalance(' + balance[1] + ').(map[string]any)\n');
                continue;
            }
            const local = /^\w+$/.test (expr) ? expr : undefined;
            if ((local !== undefined) && params.includes (local) && !new RegExp ('\\n\\t+(?:var ' + local + '\\b|' + local + ' :?=)').test (newBody)) {
                newBody = newBody.replace (new RegExp ('\\n(\\t+)return ' + local + '\\n', 'g'), '\n$1return ' + paramWrap + '(' + local + ')\n');
                continue;
            }
            const declRe = (local === undefined) ? undefined : new RegExp ('\\n(\\t+)var ' + local + ' (any|' + typeRe + ') = ([^\\n]*)');
            const decl = (declRe === undefined) ? null : declRe.exec (newBody);
            // the multi-assignment alternative stops at the first `=` and never crosses a call's
            // parentheses: `GetValue(x, "k"), nil)) && (y !=` is a comparison, not a write of `x`
            const writes = (local === undefined) ? [] : (newBody.match (new RegExp ('(^|[^\\w.])' + local + '(\\s*[-+*/]?=[^=]|\\s*:=|\\s*,\\s*[A-Za-z_][\\w.[\\]]*\\s*=[^=])', 'gm')) || []);
            const nilWrites = (local === undefined) ? [] : (newBody.match (new RegExp ('(^|[^\\w.])' + local + ' = nil\\b', 'gm')) || []);
            const declCount = (local === undefined) ? 0 : (newBody.match (new RegExp ('\\bvar ' + local + '\\b', 'g')) || []).length;
            // a local the printer already typed `type` compiles whatever its writes; nil writes stay rejected
            const typedOk = (decl !== null) && (decl[2] === type) && (proven (decl[3]) || (nilWrites.length === 0) && (decl[3] !== 'nil'));
            const anyOk = (decl !== null) && proven (decl[3]) && (writes.length === 0);
            if ((decl === null) || (declCount !== 1) || !(typedOk || anyOk)) {
                throw new Error ('retypeGoProvenParseMethods: ' + where + ' returns unproven `' + expr.split ('\n')[0] + '`');
            }
            newBody = newBody.replace (declRe, '\n$1var ' + local + ' ' + type + ' = $3');
        }
        out += content.substring (cursor, m.index) + m[0].replace (/ any \{\n$/, ' ' + type + ' {') + newBody;
        cursor = close + 1;
    }
    return out + content.substring (cursor);
}

function goProvenParseSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('typed-parse: ' + msg); } };
    const fn = (name: string, body: string) => '\nfunc (this *X) ' + name + '(order any, optionalArgs ...any) any {\n' + body + '}\n';
    const throws = (text: string) => { try { retypeGoProvenParseMethods (text); return false; } catch (e) { return true; } };
    ok (retypeGoProvenParseMethods (fn ('ParseOrder', '\treturn this.SafeOrder(map[string]any{\n\t\t"a": 1,\n\t}, market)\n')).includes (') ParseOrder(order any, optionalArgs ...any) map[string]any {'), 'safe call');
    ok (retypeGoProvenParseMethods (fn ('ParseTicker', '\tpanic(NotSupported("x"))\n')).includes (') map[string]any {'), 'panic stub');
    ok (retypeGoProvenParseMethods (fn ('ParseOrder', '\tvar r any = this.SafeOrder(order)\n\treturn r\n')).includes ('\tvar r map[string]any = this.SafeOrder(order)'), 'returned local typed');
    ok (retypeGoProvenParseMethods (fn ('ParseOrder', '\tf := func() any {\n\t\treturn nil\n\t}\n\t_ = f\n\treturn map[string]any{}\n')).includes ('map[string]any {'), 'closure return ignored');
    ok (throws (fn ('ParseOrder', '\tif order == nil {\n\t\treturn nil\n\t}\n\treturn this.SafeOrder(order)\n')), 'nil return rejected');
    ok (throws (fn ('ParseOrder', '\tvar r any = this.SafeOrder(order)\n\tr = nil\n\treturn r\n')), 'reassigned local rejected');
    ok (throws (fn ('ParseOrder', '\treturn this.SafeString(order, "x")\n')), 'other call rejected');
    ok (throws (fn ('ParseTicker', '\t_ = 1\n')), 'no return no panic rejected');
    ok (throws (fn ('ParseOrder', '\tif a {\n\t\tvar r any = this.SafeOrder(order)\n\t\t_ = r\n\t}\n\tvar r any = this.SafeString(order, "x")\n\treturn r\n')), 'shadowed local rejected');
    ok (retypeGoProvenParseMethods (fn ('ParseBalanceCustom', '\tvar result any = map[string]any{}\n\tresult = this.MergeBalanceAccount(result, c, a)\n\treturn this.SafeBalance(result)\n')).includes ('\treturn this.SafeBalance(result).(map[string]any)\n'), 'merged balance local');
    ok (throws (fn ('ParseBalanceCustom', '\tvar result any = map[string]any{}\n\tresult = this.MergeBalanceAccount(other, c, a)\n\treturn this.SafeBalance(result)\n')), 'foreign merge rejected');
    ok (throws (fn ('ParseBalanceCustom', '\tvar result any = map[string]any{}\n\tresult = order\n\treturn this.SafeBalance(result)\n')), 'rewritten balance local rejected');
    ok (retypeGoProvenParseMethods (fn ('ParseWidget', '\treturn nil\n')).includes (') any {'), 'other method untouched');
    // G12: the ws dict parsers return a struct->map converter call, which is a dictionary
    ok (retypeGoProvenParseMethods (fn ('ParseWsOrder', '\treturn ccxt.OrderToMap(this.SafeOrder(map[string]any{\n\t\t\"a\": 1,\n\t}, market))\n')).includes (') ParseWsOrder(order any, optionalArgs ...any) map[string]any {'), 'ws parser converter call');
    // G12: a comparison is not a write of the returned local
    ok (retypeGoProvenParseMethods (fn ('ParseWsTicker', '\tvar r any = ccxt.TickerToMap(this.SafeTicker(map[string]any{}))\n\tif r != nil {\n\t\t_ = r\n\t}\n\tif GetValue(r, \"a\"), 1 != 2 {\n\t\t_ = r\n\t}\n\treturn r\n')).includes ('\tvar r map[string]any = ccxt.TickerToMap('), 'comparison is not a write');
    ok (throws (fn ('ParseWsTrade', '\tif order == nil {\n\t\treturn nil\n\t}\n\treturn ccxt.TradeToMap(this.SafeTrade(order))\n')), 'ws parser nil return rejected');
    // G12: MapTyped around a struct->map converter is the identity
    ok (dropNoOpMapTyped ('\tvar p map[string]any = MapTyped(PositionToMap(this.ParsePosition(p)))\n') === '\tvar p map[string]any = PositionToMap(this.ParsePosition(p))\n', 'converter wrap dropped');
    ok (dropNoOpMapTyped ('\tvar b map[string]any = MapTyped(this.SafeBalance(p))\n') === '\tvar b map[string]any = MapTyped(this.SafeBalance(p))\n', 'a still-untyped callee keeps its wrap');
    // hx10w8 GB07: a second Market/Currency wrap around a base row builder is the identity
    ok (dropNoOpMapTyped ('\treturn MarketTyped(this.Exchange.SafeMarket(id))\n') === '\treturn this.Exchange.SafeMarket(id)\n', 'base row wrap dropped');
    ok (dropNoOpMapTyped ('\treturn MarketTyped(this.SafeMarket(id))\n') === '\treturn MarketTyped(this.SafeMarket(id))\n', 'an override keeps its wrap');
    return problems;
}

// hx10w8 GB07: base methods whose every return path is already a MarketTyped/CurrencyTyped row, so a
// second wrapper around their call is the identity (the helper hands back the same map for a plain row).
const GO_PLAIN_ROW_METHODS = [ 'Market', 'SafeMarket', 'Currency', 'SafeCurrency' ];
const GO_PLAIN_ROW_CALL = new RegExp ('^(?:this\\.(?:DerivedExchange\\.|Exchange\\.)(?:' + GO_PLAIN_ROW_METHODS.join ('|')
    + ')|this\\.(?:SafeCurrencyStructure|SafeMarketStructure))\\(');  // the two structure builders have no venue override

function dropNoOpMapTyped (content: string): string {
    const callee = new RegExp ('^(?:this\\.(?:DerivedExchange\\.|Exchange\\.)?(?:' + GO_MAP_RETURNING_METHODS.join ('|') + ')|(?:ccxt\\.)?(?:' + GO_PROVEN_STRUCT_TO_MAP_CALLS.join ('|') + '))\\(');
    // index of the paren closing the one opened at `open`, -1 when unbalanced
    const close = (text: string, open: number): number => {
        let depth = 0;
        for (let i = open; i < text.length; i++) {
            const c = text[i];
            if (c === '"' || c === '`' || c === "'") {
                i = goSkipLiteralText (text, i);
            } else if (c === '(') {
                depth += 1;
            } else if (c === ')') {
                depth -= 1;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    };
    let out = '';
    let cursor = 0;
    const wrapper = /\b(?:ccxt\.)?(?:MapTyped|MarketTyped|CurrencyTyped)\(|\bthis\.(?:DerivedExchange\.|Exchange\.)?(?:Currency|SafeCurrency|SafeMarket)\(/g;
    for (let m = wrapper.exec (content); m !== null; m = wrapper.exec (content)) {
        if (m.index < cursor) {
            continue;
        }
        const open = m.index + m[0].length - 1;
        const end = close (content, open);
        if (end < 0) {
            continue;
        }
        if (m[0].startsWith ('this.')) {
            if (content.startsWith ('.(map[string]any)', end + 1)) {
                out += content.substring (cursor, end + 1);
                cursor = end + 1 + '.(map[string]any)'.length;
            }
            continue;
        }
        const inner = content.substring (open + 1, end);
        const innerOpen = inner.indexOf ('(');
        // a MarketTyped/CurrencyTyped wrap is the identity only on a base method that already answers a
        // plain row; MapTyped keeps its wider table
        const rowWrap = /^(?:ccxt\.)?(?:MarketTyped|CurrencyTyped)\($/.test (m[0]);
        const innerIsCall = (rowWrap ? GO_PLAIN_ROW_CALL : callee).test (inner);
        if (!innerIsCall || (close (inner, innerOpen) !== inner.length - 1)) {
            continue;
        }
        out += content.substring (cursor, m.index) + dropNoOpMapTyped (inner);
        cursor = end + 1;
        wrapper.lastIndex = cursor;
    }
    return out + content.substring (cursor);
}

// ------------------------------------------------------------------------------------
// gofmt's block, blank-line and table rules
// ------------------------------------------------------------------------------------
// A pass that splices statement text cannot keep gofmt's layout: it puts a body on the
// control line, leaves a second blank line behind, or writes literal entries unaligned.
// These rules run once on the finished file, per file (not per splice).
type GoCompositeEntryAligner = { 'alignGoCompositeEntries': (entries: string[]) => string[] };

// same as goTextMaskLiteralsAndComments but the comments stay readable: the layout rules below
// have to see a trailing `//` (it takes the line out of every rule) while a `//` inside a
// string literal must not count
function goTextMaskLiteralsOnly (content: string): string {
    const out = content.split ('');
    let state = 'code';
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if (c === '"') { state = 'dq'; out[i] = ' '; continue; }
            if (c === '`') { state = 'raw'; out[i] = ' '; continue; }
            if (c === '\'') { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        if (c !== '\n') {
            out[i] = ' ';
        }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

// one flag per line: it starts outside a raw string and a block comment, so the layout rules may
// rewrite it (a quote or a comment keeps its own spacing in the source)
function goTextCodeLineStarts (content: string): boolean[] {
    const starts: boolean[] = [ true ];
    let state = 'code';
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if ((c === '/') && (content[i + 1] === '/')) { state = 'line'; i++; continue; }
            if ((c === '/') && (content[i + 1] === '*')) { state = 'block'; i++; continue; }
            if (c === '"') { state = 'dq'; continue; }
            if (c === '`') { state = 'raw'; continue; }
            if (c === '\'') { state = 'rune'; continue; }
            if (c === '\n') { starts.push (true); }
            continue;
        }
        if (c === '\n') {
            if (state === 'line') { state = 'code'; }
            starts.push (state === 'code');
            continue;
        }
        if (state === 'line') { continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { state = 'code'; i++; } continue; }
        if (state === 'dq') { if (c === '\\') { i++; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (c === '\\') { i++; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return starts;
}

// gofmt always breaks a block: `if x { y }` comes back as three lines. The body is split into
// statements only when it holds one, and a nested block is broken too.
function goGofmtExpandBlockLine (line: string, code: string, commentFree: string): string[] | null {
    if (!/^\t*(?:if|for|switch|select)\b/.test (code) || (commentFree.indexOf ('//') >= 0)) {
        return null;
    }
    const open = code.indexOf ('{');
    const trimmed = code.trimEnd ();
    if ((open < 0) || !trimmed.endsWith ('}')) {
        return null;
    }
    const maskedBody = code.slice (open + 1, trimmed.length - 1);
    let level = 0;
    for (let i = 0; i < maskedBody.length; i++) {
        const c = maskedBody[i];
        if (c === '{') { level += 1; } else if (c === '}') { level -= 1; }
        if ((level < 0) || (maskedBody.indexOf (';') >= 0)) {
            return null;
        }
    }
    if (level !== 0) {
        return null;
    }
    const indent = /^\t*/.exec (line)![0];
    const head = line.slice (indent.length, open).trimEnd ();
    const body = line.slice (open + 1, line.trimEnd ().length - 1).trim ();
    if ((body.length === 0) || (head.length === 0)) {
        return null;
    }
    const inner = goGofmtExpandBlockLine (indent + '\t' + body, '\t' + body, goTextMaskLiteralsOnly (body));
    if (inner !== null) {
        return [ indent + head + ' {', ...inner, indent + '}' ];
    }
    return [ indent + head + ' {', indent + '\t' + body, indent + '}' ];
}

// gofmt puts a keyed literal's entries one tab inside its opening line, their values in one
// column and the closing brace on the opening line's indent; only a literal whose body is all
// single-line keyed entries is rewritten, so anything else keeps the printer's text.
function goGofmtAlignTables (content: string, aligner: GoCompositeEntryAligner): string {
    const lines = content.split ('\n');
    const live = goTextCodeLineStarts (content);
    const depth = (l: string) => /^\t*/.exec (l)![0].length;
    const keyed = /^(\t*)"((?:[^"\\]|\\.)*)": (.*?)(,?)$/;
    for (let i = 0; i < lines.length; i++) {
        if (!live[i] || !lines[i].trimEnd ().endsWith ('{')) {
            continue;
        }
        const ind = depth (lines[i]);
        const entries: string[] = [];
        let j = i + 1;
        let bad = false;
        while ((j < lines.length) && !((depth (lines[j]) <= ind) && /^\t*\}/.test (lines[j]))) {
            if (!live[j] || (lines[j].trim ().length === 0) || !keyed.test (lines[j]) || (depth (lines[j]) > ind + 1)) {
                bad = true;
                break;
            }
            entries.push (lines[j]);
            j += 1;
        }
        if (bad || (j >= lines.length) || (entries.length === 0)) {
            continue;
        }
        const close = lines[j].replace (/^\t*/, '');
        if (!/^\}[)\]\s,]*$/.test (close)) {
            continue;
        }
        const texts: string[] = [];
        let usable = true;
        for (const entry of entries) {
            const m = keyed.exec (entry)!;
            const mask = goTextMaskLiteralsAndComments (m[3]);
            const value = m[3].replace (/^ +/, '');
            // a nested literal, an unbalanced bracket, a second entry on the line or a trailing
            // comment ends gofmt's alignment section: leave that literal to the printer
            if ((value.length === 0) || /[{}]/.test (mask) || (mask.split ('[').length !== mask.split (']').length) || (m[3].indexOf ('": ') >= 0) || (goTextMaskLiteralsOnly (entry).indexOf ('//') >= 0)) {
                usable = false;
                break;
            }
            texts.push ('\t'.repeat (ind + 1) + '"' + m[2] + '": ' + value);
        }
        if (!usable) {
            continue;
        }
        const aligned = aligner.alignGoCompositeEntries (texts);
        if (aligned.length !== entries.length) {
            continue;
        }
        for (let k = 0; k < entries.length; k++) {
            lines[i + 1 + k] = aligned[k];
        }
        lines[j] = '\t'.repeat (ind) + close;
        i = j;
    }
    return lines.join ('\n');
}

export function goGofmtLayout (content: string, aligner: GoCompositeEntryAligner = hx4G36Aligner ()): string {
    const code = goTextMaskLiteralsAndComments (content).split ('\n');
    const commentFree = goTextMaskLiteralsOnly (content).split ('\n');
    const live = goTextCodeLineStarts (content);
    const lines = content.split ('\n');
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!live[i]) {
            out.push (line);
            continue;
        }
        if (line.trim ().length === 0) {
            if ((out.length > 0) && (out[out.length - 1].trim ().length === 0)) {
                continue;                     // gofmt keeps at most one blank line
            }
            out.push ('');
            continue;
        }
        const expanded = goGofmtExpandBlockLine (line, code[i], commentFree[i]);
        if (expanded !== null) {
            out.push (...expanded);
            continue;
        }
        out.push (line);
    }
    return goGofmtAlignTables (out.join ('\n'), aligner);
}

function goGofmtLayoutSelfTest (): string[] {
    let problems: string[] = [];
    const check = (label: string, actual: string, expected: string) => {
        if (actual !== expected) {
            problems.push ('gofmt layout ' + label + ': ' + JSON.stringify (actual));
        }
    };
    const head = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\n';
    const aligner = hx4G36Aligner ();
    const fixed = goGofmtLayout (head + 'func (this *X) f(p any) any {\n\tif p != nil { p = map[string]any{} }\n\treturn p\n}\n', aligner);
    check ('block', fixed, head + 'func (this *X) f(p any) any {\n\tif p != nil {\n\t\tp = map[string]any{}\n\t}\n\treturn p\n}\n');
    check ('blank run', goGofmtLayout ('package ccxt\n\n\nfunc f() {\n}\n', aligner), 'package ccxt\n\nfunc f() {\n}\n');
    check ('table', goGofmtLayout (head + 'func (this *X) f() any {\n\treturn map[string]any{\n\t\t"id": 1,\n\t\t"symbol": "BTC/USDT",\n\t}\n}\n', aligner),
        head + 'func (this *X) f() any {\n\treturn map[string]any{\n\t\t"id":     1,\n\t\t"symbol": "BTC/USDT",\n\t}\n}\n');
    const clean = head + 'func f() int {\n\treturn 1\n}\n';
    check ('idempotent', goGofmtLayout (clean, aligner), clean);
    return problems;
}

function overwriteFileAndFolder (path: string, content: string) {
    if (!(fs.existsSync(path))) {
        checkCreateFolder (path);
    }
    // an import whose printed text a later rewrite deleted is unused; drop it before formatting
    content = path.endsWith ('.go') ? hx10w10GP24PruneImports (content) : content;  // hx10w10 GP24
    // gofmt aligns the trailing `//` comments of adjacent lines through its tabwriter; the
    // printer reproduces that itself (ast-transpiler `alignGoTrailingComments`), and this second
    // pass covers the text assembled here (hand-written emitters and sections concatenated after
    // the transpiled ones). It is a no-op on text that is already aligned. The nil-check collapse
    // runs last so its match sees the canonical spacing.
    content = collapseRedundantNilChecks (formatGoSource (path, normalizeGoFileHeader (alignGoTrailingComments (content))));
    // the collapse rewrites `if (x != nil) && (x != nil) {` into `if (x != nil) {`, and the
    // parens of that form are exactly the ones gofmt's stripParens() takes off a control
    // expression - so the spacing pass runs once more over its output
    // market-row reads run after dropNoOpMapTyped so `MapTyped(this.Market(..))` writes read as rows
    content = goGofmtSplicedText (goGofmtNestedParens (hx4G28IsEqualSafe (g10kIsEqualNative (h2kG16NativeStringHelpers (path, nativeMarketRowReads (dropNoOpMapTyped (goSafeDictMapReads (g10kMaplistOmitOfTupleMaps (goOmitDictOfTypedMaps (goEndpointCheckedReceives (content)))))))))));  // hx4 G28
    content = hx10w2G01MapReads (content);  // hx10 G01
    content = g10kGvMapReads (content);
    content = x02CurrencyRows (content); // hx4 X02
    // overwriteFile() already opens+truncates+writes the file; the extra
    // fs.writeFileSync below wrote every generated file a second time
    content = g10kNativeDerefs (path, content);
    content = g10kStrNativeStringHelpers (path, content);  // G10K-str
    content = emitHx10w2G07Native (content);  // hx10w2 G07
    content = path.endsWith ('.go') ? goNativeStringAdds (content) : content;  // hx4 G24: row reads exist only from here
    content = path.endsWith ('.go') ? hx11w8AnySliceToList (content) : content;  // hx11 w8: ToList-fed []any locals
    content = path.endsWith ('.go') ? hx11w8JsonOrigin (content) : content;  // hx11 w8: JSON-origin list element reads
    content = path.endsWith ('.go') ? hx11w8JsonString (content) : content;  // hx11 w8 m172: string-typed Json() result
    content = path.endsWith ('.go') ? hx11w8EthEncodeBytes (content) : content;  // hx11 w8: []uint8 EthEncodeStructuredData locals
    content = path.endsWith ('.go') ? hx10w2G05 (content) : content;  // hx10w2 G05: arith + deref on block-scoped types
    content = path.endsWith ('.go') ? hx4G33IsEqual (content) : content;  // hx4 G33
    content = path.endsWith ('.go') ? hx4G38Pass (content) : content;  // hx4 G38
    // struct returns after every retype pass (base ParseTicker is `any` until formatGoSource)
    if (path.endsWith ('.go')) {
        content = hx4G05DropRedundantTyped (goStructReturnsPass (content));
        content = hx4G37InlineComparisons (content);  // hx4 G37: last, after every typed comparison pass
    }
    content = path.endsWith ('.go') ? hx4G35InlineMulSub (content) : content;  // hx4 G35
    // layout last: the passes above splice operands (derefs, natives) after spacing and the
    // comment columns were computed; recompute both from the final text
    if (path.endsWith ('.go')) {
        content = hx4G36Inline (content, hx4G36Aligner ());  // hx4 G36
        content = hx5X26CaseAffix (content);  // hx5 X26
        content = hx5X27StringHelpers (hx11w8JoinStringLocals (content));  // hx5 X27, hx11 w8 r18: string-only []any locals are []string first
        content = hx5X29ParseNative (content);  // hx5 X29
        content = hx4G42InlineTypeChecks (content, hx4G36Aligner ());  // hx4 G42
        content = hx4G40InlineIsEqual (content, hx4G36Aligner ());  // hx4 G40: last, after every typed IsEqual pass
        content = hx11IsEqualBoolMethod (content);  // hx11 w8: IsEqual(this.boolMethod(..), true) -> native ==
        content = hx10w2G04 (content);  // hx10 G04
        content = hx10w3G10 (content);  // hx10w3 G10: nil-guarded native compares on pointer boxes
        // hx4 G45 after the spacing pass: its line-local lexer misreads a `}(args) + x` continuation
        content = alignGoTrailingComments (hx4G45InlineStr (goGofmtBinarySpacing (content), hx4G36Aligner ()));
    }
    content = path.endsWith ('.go') ? hx10G03Pass (content) : content;  // hx10 G03: on the text every retype pass above has finished
    content = path.endsWith ('.go') ? hx10w6G11Pass (content) : content;  // hx10w6 G11: the identity MapTyped wrap
    content = path.endsWith ('.go') ? hx10w7G14Pass (content) : content;  // hx10w7 G14: field / multi-value binding operands it could not read
    content = path.endsWith ('.go') ? hx10w10Gp26TypedReads (content) : content;  // hx10w10 GP26: GetValue on a declared map local
    // gofmt's block/blank/table layout, once, on the text every pass above has finished
    if (process.env.CCXT_GOFMT_DEBUG) {
        const before = (content.match (/^\t*(?:if|for|switch)\b.*\{.*\}\s*$/gm) ?? []).length;
        const laid = goGofmtLayout (content, hx4G36Aligner ());
        const after = (laid.match (/^\t*(?:if|for|switch)\b.*\{.*\}\s*$/gm) ?? []).length;
        console.error ('[layout] ' + path + ' oneline-before=' + before + ' after=' + after + ' same=' + (laid === content));
    }
    content = path.endsWith ('.go') ? goGofmtLayout (content, hx4G36Aligner ()) : content;
    overwriteFile (path, content);
}

// The generated methods named in CCXT_GO_BOOL_METHOD_NAMES are annotated `: boolean` in
// ts/src, but the printer maps no TS return annotation to Go `bool` and emits `any`.
// Their bodies already `return` a Go bool on every path (no `return nil`, no
// any-typed expression — the per-method census lives in the campaign unit's REPORT.md),
// so the declared return type is retagged to match the value it returns. This is the
// signature half of the rule in build/go-local-types.js; the local half types
// `var x any = this.M(...)` as `bool` off the same list, so the two cannot drift.
// Same shape as the Promise-returning `<-chan any` coercion in createGoExchange().
function coerceGoBoolMethodReturns (content: string, names: string[]): string {
    for (const name of names) {
        const coerceRegex = new RegExp ('(func\\s+\\(this\\s+\\*\\w+\\)\\s+' + name + '\\([^)]*\\))\\s+any(\\s+\\{)', 'g');
        // F04: the replacement spells the single space before `{` itself, so a padded
        // signature (`) any  {`) can never survive the coercion as `) bool  {`
        content = content.replace (coerceRegex, '$1 bool {');
    }
    return content;
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// The indentation of the line that the match starting at `offset` sits on. Several emitters
// rewrite one source expression into *several* Go statements; gofmt prints one statement per
// line at the enclosing block's indentation, so those rewrites emit the split form themselves
// and need this prefix to keep every emitted line at the same (future) tab depth.
function statementIndent (whole: string, offset: number): string {
    const lineStart = whole.lastIndexOf ('\n', offset - 1) + 1;
    const prefix = whole.substring (lineStart, offset);
    const match = prefix.match (/^[ \t]*/);
    return match ? match[0] : '';
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
// suffix carried by every transpiled channel-returning method (FetchTickerAsync);
// the plain name (FetchTicker) is the typed sync method on the same struct
const GO_ASYNC_SUFFIX = 'Async';
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

// `exchange: any` in ts/src/test hides the callee from the transpiler's checker, so the async
// suffix is not applied to those call sites; every unified method received with `<-` is a
// channel trampoline, so append it here. Sleep is hand-written (exchange.go) and keeps its name.
const GO_TEST_ANY_RECEIVE_REGEX: [RegExp, string] = [
    new RegExp (`<-exchange\\.(\\((?:ccxt\\.)?I\\w+\\)\\.)?((?!Sleep\\b)[A-Z]\\w*?)(?<!${GO_ASYNC_SUFFIX})\\(`, 'g'),
    `<-exchange.$1$2${GO_ASYNC_SUFFIX}(`,
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
    "nonce": false, // venues override nonce() (e.g. hyperliquid); base incrementingNonce() must reach the override, matching Rust
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
    'closePosition',
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
    // set once any stage skipped an up-to-date exchange: the shared
    // exchange_wrapper_structs.go is rebuilt from the module-level `goTypeOptions`
    // accumulator, which only holds the structs of the exchanges transpiled in this
    // process — rewriting it after a partial run would truncate it
    skippedUnchangedExchanges = false;
    // parsed PredictionExchange method signatures; lets a prediction venue that doesn't
    // override a unified method still emit the prediction-typed wrapper (resolving to the
    // inherited base method) instead of the crypto-typed method promoted from BaseExchange
    predictionBaseMethodsTypes: any[] = [];
    // names of the 62 symbol-based trading methods that live in `export default class Exchange
    // extends BaseExchange` in the TS source. They hang off *Exchange (not *BaseExchange), so
    // prediction venues (which embed BaseExchange via PredictionExchange) never inherit them —
    // matching TS/C#/Java. Populated in transpileBaseMethods.
    exchangeTierMethods: Set<string> = new Set();
    private _extendedExchanges: { [key: string]: string } | null = null;
    private _typeAndFuncNamesCache: { [key: string]: Set<string> } = {};
    // transpiled base-class results, keyed by source path. transpileBaseMethods runs three
    // times per --rest-and-ws build (REST, prediction recursion, WS) over the same
    // Exchange.ts; the transpile is pure, so it is paid once per process.
    private _baseMethodsTranspileCache: { [key: string]: any } = {};
    // bytes last written by writeGeneratedOnce(), keyed by output path — lets the repeated
    // base passes skip re-emitting a file whose content they just produced identically
    private _lastWrittenContent: { [key: string]: string } = {};
    // true while createTypedInterfaceFile() is running: requireBaseMethodsMetadata() regenerates
    // the typed interface after a late base re-read, which must not re-enter its own caller
    creatingTypedInterface = false;
    // lazily created in webworkerTranspile and kept alive for the lifetime of the
    // instance, so every transpile stage reuses the same warm worker threads
    piscina: Piscina | undefined;
    futuresExchanges = new Set<string>([  // futures exchanges that extend a spot exchange class
        // 'kucoinfutures'
    ]);

    async destroy () {
        if (this.piscina) {
            await this.piscina.destroy ();
            this.piscina = undefined;
        }
    }

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
            // `const stored = new ArrayCache (limit)` prints as a short declaration; the ws regexes
            // above cannot see the inferred type, so name it. The local only ever holds the
            // constructor result (`this.trades[symbol] = stored`), and naming the type keeps the very
            // same box: every `.append`/`.hashmap`/nil-check in the sources of these 8 sites lives on
            // the *read* local (`this.trades[symbol]`), never on this one.
            [/stored := NewArrayCache\(limit\)/g, 'var stored *ArrayCache = NewArrayCache(limit)'],
            // Futures
            [/future\.(Resolve|Reject)/g, 'future.(*Future).$1'],
            [/\(<\-future\)/g, '<-future.(<-chan any)'],
            [/<-spawaned/g, '<-spawaned.(<-chan any)'],
            [/promise\.Resolve\(([^)]+)\)/g, 'promise.(*Future).Resolve(ToGetsLimit($1))'],
            // GetsLimit
            [/([a-zA-Z]\w*)\.GetLimit/g, 'ToGetsLimit($1).GetLimit'],
            [/order.Limit([^"])/g, 'ToGetsLimit(orderbooks).Limit$1'],
            // OrderBook
            [/\.Cache\s*=(?!=)\s*(.+)/g, '.(OrderBookInterface).SetCache($1)'],
            [/(?:&)?(storedOrderBook|orderbook)\.Cache/g, '$1.(OrderBookInterface).GetCache()'],
            [/orderbook(s)?\.(Reset|Limit)/g, 'orderbook$1.(OrderBookInterface).$2'],
            [/([a-zA-Z0-9]+).StoreArray/g, '$1.(IOrderBookSide).StoreArray'],
            [/(bookside|asks|bids|Side).Store/g, '$1.(IOrderBookSide).Store'],
            [/this.ParseWsBidAsk\(GetValue\(this.Orderbooks, symbol\)/g, 'this.ParseWsBidAsk(UnWrapType(ccxt.GetValue(this.Orderbooks, symbol))'],
            // Clients
            // AsClient instead of a hard .(*Client) assertion: the transport hands
            // generated code either *Client (offline mocks) or *WSClient (live), and
            // asserting the wrong one panics (e.g. handlePositions during ws static tests)
            [/FindMessageHashes\(client/g, 'FindMessageHashes\(ccxt.AsClient(client)'],
            [/CleanUnsubscription\(([a-zA-Z0-9]+),/g, 'CleanUnsubscription(ccxt.AsClient($1),'],
            [/client\.Subscriptions/g, 'client.(ClientInterface).GetSubscriptions()'],
            [/client\.Rejections/g, 'client.(ClientInterface).GetRejections()'],
            [/client\.(Url)/g, 'client.(ClientInterface).Get$1()'],
            [/client\.LastPong\s*=(?!=)\s*(.*)/g, 'client.(ClientInterface).SetLastPong($1)'],
            [/client\.LastPong/g, 'client.(ClientInterface).GetLastPong()'],
            [/client\.KeepAlive\s*=(?!=)\s*(.*)/g, 'client.(ClientInterface).SetKeepAlive($1)'],
            [/client\.KeepAlive/g, 'client.(ClientInterface).GetKeepAlive()'],
            [/client\.ReusableFuture\(([^\)]*)\)/g, 'client.(ClientInterface).ReusableFuture($1)'],
            [/(retRes\d+)\s+:=\s+<-future.\(<-chan any\)/g, '$1 := <-future.(*ccxt.Future).Await()'],
            // a discarded `await future` is received straight inside PanicOnError
            [/PanicOnError\(\(?<-future\.\(<-chan any\)\)?\)/g, 'PanicOnError(<-future.(*ccxt.Future).Await())'],
            [/<-client\.Future\(([^\)]*)\)/g, '<-client.(ClientInterface).Future($1)'],
            [/client\.Futures/g, 'client.(ClientInterface).GetFutures()'],
            [/client\.(Send|Reset|OnPong|Reject|Future|Resolve)/g, 'client.(ClientInterface).$1'],
            // Error constructors
            [/NewInvalidNonce/g, 'InvalidNonce'],
            [/NewOrderBook/g, 'NewWsOrderBook'],
            [/NewNotSupported/g, 'NotSupported'],
            [/NewRequestTimeout/g, 'RequestTimeout'],
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
        return '\t'.repeat(level);
    }
    // ============================================================================

    getTranspilerConfig(isWrapper: boolean = false) {
        const classNameMap = {};
        if (!isWrapper) {
            // the transpiled struct carries the public exchange name (Binance): its channel
            // methods take the Async suffix and the typed sync methods are appended to the same
            // file. Prediction ids are included since most live only in ts/src/prediction/.
            const allIds = exchangeIds.concat (predictionIds).concat (predictionWsIds);
            allIds.forEach((exchangeName: string) => {
                classNameMap[exchangeName] = capitalize(exchangeName);
                classNameMap[`${exchangeName}Rest`] = capitalize(exchangeName);
            });
            predictionIds.forEach((exchangeName: string) => {
                classNameMap[exchangeName] = capitalize(exchangeName);
                classNameMap[`${exchangeName}Rest`] = capitalize(exchangeName);
            });
        }
        return {
            "verbose": false,
            "go": {
                "classNameMap": classNameMap,
                // channel-returning async methods carry the suffix so the plain name is
                // free for the typed sync method emitted into the same core file
                "asyncMethodSuffix": GO_ASYNC_SUFFIX,
                // implicit endpoints are emitted unsuffixed by the Go api generator
                "asyncSuffixExemptPaths": [ "(^|/)ts/src/abstract/" ],
                // required OrderType/OrderSide params of the unified order methods print `string` on the
                // base, every override and go/v4/exchange_interface.go (audit: no override nil-compares them)
                "unifiedStringParams": GO_UNIFIED_STRING_PARAMS,
                "unifiedInt64Params": GO_UNIFIED_INT64_PARAMS,
                "unifiedBoolParams": GO_UNIFIED_BOOL_PARAMS,
                // hx10w9 GP13: the ws watch family's symbols list prints `[]string`/`[][]string`
                "unifiedSliceParams": GO_UNIFIED_SLICE_PARAMS,
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
        // typed locals for the hand-written CCXT Go helpers (see build/go-local-types.js);
        // build/go-worker.ts installs the same hooks for the Piscina path
        installCcxtGoLocalTypes (this.transpiler.goTranspiler, GO_UNIFIED_INT64_PARAMS);
        installCcxtGoIndexableTypes (this.transpiler.goTranspiler);
        installCcxtGoParamTypes (this.transpiler.goTranspiler);
        installCcxtGoDictParams (this.transpiler.goTranspiler);
        installCcxtGoGb05ParamTypes (this.transpiler.goTranspiler);
        installCcxtGoGb11HandleErrorsCode (this.transpiler.goTranspiler);
        installCcxtGoSignTyping (this.transpiler.goTranspiler);
        installHx11w8AsyncBool (this.transpiler.goTranspiler);
        installHx10w10GP24BaseImportSeam (this.transpiler.goTranspiler);
        installHx11w8CorParams (this.transpiler.goTranspiler);
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
            // gofmt keeps exactly one blank line between the package clause and the import clause,
            // and exactly one between the import clause and the generated-header comment — the
            // call site's trailing newlines cover the second one, so no trailing '' here
            return [
                namespace,
                '',
                'import ccxt "github.com/ccxt/ccxt/go/v4"',
                ...(ws ? [ PREDICTION_IMPORT ] : []),
            ];
        }
        const namespace = ws ? 'package ccxtpro' : 'package ccxt';
        const hasImport = (ws || this.isPrediction);
        const values = [
            // "using ccxt;",
            namespace,
            // the ws/prediction packages carry their ccxt import right after the package clause
            // and gofmt keeps exactly one blank line between the two; the base ccxt package has
            // no import here and keeps the single '' the call site's trailing newlines rely on
            ...(hasImport ? [ '', 'import ccxt "github.com/ccxt/ccxt/go/v4"' ] : [ '' ]),
            // 'import "helpers"'
        ]
        return values;
    }

    isObject(type: string) {
        return (type === 'any') || (type === 'unknown');
    }

    isDictionary(type: string): boolean {
        return (type === 'Object') || (type === 'Dictionary<any>') || (type === 'unknown') || (type === 'Dict') || (type === 'ExchangeOptions') || ((type.startsWith('{')) && (type.endsWith('}')));
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
            return `<-chan int64`; // custom handling for now
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
                return isPromise ? `<-chan` : '<-chan';
            } else if (isList) {
                return isPromise ? `<-chan []${type}` : `[]${type}`;
            }
            return isPromise ? `<-chan ${type}` : type;
        }

        const goReplacements: dict = {
            'OrderType': 'string',
            'OrderSide': 'string', // tmp
            'fetchEventsParams': 'map[string]interface{}', // params bag; surface as a map
            // TS >= 5/6 (ast-transpiler 0.0.91) prints this alias by name instead of
            // expanding it to `Dict | undefined` like TS 4.9 did
            'NullableDict': 'map[string]any',
            'Market': 'MarketInterface',
            'DefaultType': 'string',
            'DefaultSubType': 'string',
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
        // hx10 GP14: a positional slot of the async wrapper pair prints the core's parameter type
        const gp14Type = gp14ParamGoType (param);
        if (gp14Type !== undefined) {
            return `${safeName} ${gp14Type}`;
        }
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
            'closePosition',
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
            'createOrderRequest',
            'editOrderRequest',
            'cancelOrdersRequest',
            'cancelAllOrdersRequest',
            'createContractOrder',
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
            'watchStockMarketStream',
            'watchSwapPrivate',
            'watchSpotPublic',
            'watchSwapPublic',
            'watchTopics',
            'unWatchChannels',
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
        // the printer emits `<-chan X` (F04: no space after `<-`); the legacy `<- chan X`
        // spelling stays matched so a stale type string cannot leak a channel into the
        // unwrapped type, and the optional leading space is dropped so the emitted wrapper
        // never carries `( int64, error)` (gofmt rewrites that to `(int64, error)`).
        return type.replace(/^[ \t]*<-\s*chan[ \t]*/, '');
    }

    unwrapListIfNeeded(type: string): string {
        return type.replace('[]', '');
    }

    unwrapDictionaryIfNeeded(type: string): string {
        return type.startsWith('Dictionary<string,') && type.endsWith('>') ? type.substring(19, type.length - 1) : type;
    }

    // createReturnStatement's conversion of `res` as a func(any) T value for AwaitResult
    createReturnConverter (methodName: string, unwrappedType: string) {
        const stmt = this.createReturnStatement (methodName, unwrappedType);
        if (stmt === 'res') {
            return 'Untyped';
        }
        const call = stmt.match (/^(\w+)\(res\)$/);
        if (call) {
            return call[1];
        }
        const assertion = stmt.match (/^\(?res\)?\.\((.+)\)$/);
        if (assertion) {
            return `AssertAs[${assertion[1]}]`;
        }
        throw new Error (`[go] no AwaitResult converter for ${methodName}: ${stmt}`);
    }

    createReturnStatement(methodName: string,  unwrappedType:string ) {

        // custom handling for now
        if (methodName === 'fetchTime'){
            // fetchTime cores carry *int64 (AsyncResult[*int64]); ParseInt derefs it
            return `ParseInt(res)`;
        }
        if (methodName === 'fetchOrderStatus') {
            // fetchOrderStatus cores carry *string (AsyncResult[*string]); ToString derefs it
            return `ToString(res)`;
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

        if (methodName.startsWith('unWatch')) {
            // type not unified yet
            return 'res'
        }

        // handle the typescript type Dict
        if (unwrappedType === 'Dict' || unwrappedType === 'ExchangeOptions' || unwrappedType === 'map[string]any') {
            return `res.(map[string]any)`;
        }

        if (unwrappedType === '[]map[string]any') {
            return `NewMapArray(res)`; // safe conversion, the runtime value is usually a []any
        }

        if (unwrappedType === 'map[string]map[string][]OHLCV') {
            // watchOHLCVForSymbols cores send nested map[string]any (createOHLCVObject), never the struct shape
            return `NewOHLCVForSymbolsMap(res)`;
        }

        if (unwrappedType.startsWith('map[string]')) {
            const mapValueType = unwrappedType.substring('map[string]'.length);
            // struct-valued dictionaries (e.g. Dictionary<DepositWithdrawFee>) hold
            // map[string]any values at runtime, so convert them via the generated
            // NewXMap constructor. scalar/any values keep the plain type assertion,
            // and MarketInterface keeps the existing emission (LoadMarkets uses the
            // hand-written NewMarketsMap template instead).
            if (/^[A-Z]\w*$/.test(mapValueType) && mapValueType !== 'MarketInterface') {
                return `New${capitalize(mapValueType)}Map(res)`;
            }
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

    /**
     * @description Single source of truth for the Go type of an option-struct field.
     * The struct declares it as `*<type>` and the wrapper declares its optional local as
     * `*<type>` too, so both must be computed here and nowhere else.
     */
    optionStructFieldGoType(param: any, qualify: (type: string | undefined) => string | undefined): string | undefined {
        return qualify(this.jsTypeToGo(param.name, param.type));
    }

    getDefaultParamsWrappers(name: string, rawParameters: any[]) {
        let res: string[] = [];

        const hasOptionalParams = rawParameters.some(param => param.optional || param.initializer !== undefined || param.initializer === 'undefined');
        const isOnlyParams = rawParameters.length === 1 && rawParameters[0].name === 'params';
        const i1 = '\t';
        const structName = capitalize(name) + 'Options';
        if (hasOptionalParams && !isOnlyParams) {
            const initOptions = [
                '',
                'opts := ' + structName + 'Struct{}',
                '',
                'for _, opt := range options {',
                '\topt(&opts)',
                '}'
            ].map(e => e!='' ? i1 + e : e);
            res = res.concat(initOptions);
        }
        return res.join("\n");
    }

    // True when the wrapper reads this parameter off the options struct, so the
    // call site can hand `opts.<Field>` over directly instead of via a local.
    isOptionStructParam(rawParameters: any[], param: any) {
        const hasOptionalParams = rawParameters.some(p => p.optional || p.initializer !== undefined || p.initializer === 'undefined');
        const isOnlyParams = rawParameters.length === 1 && rawParameters[0].name === 'params';
        if (!hasOptionalParams || isOnlyParams) {
            return false;
        }
        return !!(param.optional || param.initializer === 'undefined' || param.initializer !== undefined || param.initializer === '{}');
    }

    inden(level: number) {
        return '\t'.repeat(level);
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
                // `\s+` between name and `*` — the emitted field line is space-aligned
                // (`Since  *int64`), so a single-space pattern would miss every field
                const existingFields = (goTypeOptions[capName].match (/^\s+(\w+)\s+\*/gm) || []).map (s => s.trim ().split (/\s+/)[0]);
                const predFields = optionalParams.map (param => capitalize (param.name));
                predictionLocalOverride = predFields.some (f => existingFields.indexOf (f) === -1);
            }
            if (!predictionLocalOverride) {
                return;
            }
        }
        // gofmt indents one tab per level and aligns the `Name Type` columns of a struct's
        // fields (tabwriter, padchar ' ', padding 1): every field name is padded with spaces
        // to the longest name in the struct plus one. Emitting both here keeps the option
        // structs byte-identical to gofmt's output.
        const one = '';
        const two = '\t';
        const three = '\t\t';

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
            // gofmt separates a run of `type` decls from the following `var` decls with one
            // blank line (go/printer declList: a decl-token change forces a blank line)
            goTypeOptions[capName] = [
                `type ${optionsStruct} = ccxt.${optionsStruct}`,
                `type ${options} = ccxt.${options}`,
                '',
                ...optionalParams.map(param => {
                    const methodName = `With${capName}${capitalize(param.name)}`;
                    return`var ${methodName} = ccxt.${methodName}`
                }),
            ].join('\n');
        } else {
            const fieldNames = optionalParams.map((param) => capitalize(param.name));
            const fieldIndent = '\t';
            // gofmt aligns the field types in one space-padded column (longest name + 1)
            const fieldWidth = Math.max(...fieldNames.map((name) => name.length)) + 1;
            goTypeOptions[capName] = [
                `type ${optionsStruct} struct {`,
                ...optionalParams.map((param, index) => {
                    const fieldType = this.optionStructFieldGoType(param, qualify) as string;
                    return `${fieldIndent}${fieldNames[index].padEnd(fieldWidth)}*${fieldType}`;
                }),
                '}',
                '',
                `type ${options} func(opts *${optionsStruct})`,
                ...optionalParams
                    .filter((param) => param.optional || param.initializer !== undefined)
                    .map((param) => {
                        const name = capitalize(param.name);
                        const type = this.optionStructFieldGoType(param, qualify);
                        return [
                            '',
                            `${one}func With${capName}${name}(${this.safeGoName(param.name)} ${type}) ${options} {`,
                            `${two}return func(opts *${optionsStruct}) {`,
                            `${three}opts.${name} = &${this.safeGoName(param.name)}`,
                            `${two}}`,
                            `${one}}`,
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

    // gofmt keeps a body on the function's header line only while the printed header (up to
    // and including the space before `{`) plus the printed body stays within 100 characters
    // (go/printer funcBody → bodySize, maxSize = 100); longer bodies move to their own
    // tab-indented line. `header` must end with the space that precedes `{`.
    goSingleStatementFunc (header: string, statement: string): string {
        if (header.length + statement.length <= 100) {
            return `${header}{ ${statement} }`;
        }
        return `${header}{\n\t${statement}\n}`;
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
                return this.isPrediction ? 'ConvertPredictionOrderRequestListToArray(orders)' : 'ConvertOrderRequestListToArray(orders)'; // quick fix, check this later
            }

            // optional params live on the options struct: hand the field straight to the
            // core call instead of hopping through an identically-typed local
            if (this.isOptionStructParam(methodWrapper.parameters, param)) {
                return `opts.${capitalize(param.name)}`;
            }

            return parsedParam;
        }).join(', ');

        const one = '';
        const two = '\t';
        const three = '\t\t';
        const methodDoc = [] as any[];
        if (goComments[exchangeName] && goComments[exchangeName][methodName]) {
            // the wrapper is a top-level declaration: its doc comment sits at column 0 even
            // when the source comment was written inside the method body
            methodDoc.push (goComments[exchangeName][methodName].replace (/^[ \t]+(?=\/\/|\/\*)/gm, '').replace (/^[ \t]+(?=\*)/gm, ' '));
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

        const accessor = 'this.';
        const body = [
            // `${two}ch:= make(chan ${unwrappedType})`,
            // `${two}go func() {`,
            // `${three}defer close(ch)`,
            // `${three}defer ReturnPanicError(ch)`,
           `${defaultParams}`,
            ...goNativeAwaitBody (two, unwrappedType, this.createReturnConverter (methodName, unwrappedType), `${accessor}${methodNameCapitalized}${GO_ASYNC_SUFFIX}(${params})`, emptyObject),
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
        // base typed methods sit on the base structs and reach every venue through embedding:
        // the 62 symbol-based ones on Exchange, the rest on BaseExchange (prediction venues too)
        const funcContext = isExchange ? (this.exchangeTierMethods.has (methodName) ? 'Exchange' : 'BaseExchange') : capitalize(exchangeName);
        const method = [
            `${one}func (this *${funcContext}) ${methodNameCapitalized}(${stringArgs}) (${unwrappedType}, error) {`,
            ...body,
            // this.getDefaultParamsWrappers(methodNameCapitalized, methodWrapper.parameters),
            // `${two}res := ${isAsync ? '<-' : ''}this.${exchangeName}.${methodNameCapitalized}(${params});`,
            // `${two}${this.createReturnStatement(methodName, unwrappedType)}`,
            `${one}}`
        ];
        // return methodDoc.concat(method).concat(withMethod).filter(e => !!e).join('\n')
        const docLines = methodDoc.filter (e => !!e);
        // gofmt separates a documented declaration from the previous one with a blank line
        // (go/printer declList: min = 2 when the decl carries a doc comment), so a wrapper
        // with a comment block starts with a newline; the join sites strip it in first
        // position, where the section header already provides the separation.
        const text = docLines.concat(method).filter(e => !!e).join('\n');
        return docLines.length ? '\n' + text : text;
    }

    // Ensures WRAPPER_METHODS['Exchange'] is populated. The base-methods stage registers it as
    // a side effect, but that stage can be skipped by the mtime gate — in which case any
    // consumer (derived wrappers, typed interface) must transpile the base file on demand.
    // Re-runs at most once per process, and that re-run REWRITES exchange_wrappers.go from the
    // current Exchange.ts. The typed interface is regenerated with it: its own gate may already
    // have skipped it earlier in this process, which would leave IExchange declaring the previous
    // base typed signatures and every exchange failing to implement it (#29588).
    requireBaseMethodsMetadata () {
        if (WRAPPER_METHODS['Exchange']) {
            return;
        }
        log.bright.cyan ('[go] base methods were up to date but their wrapper metadata is needed, re-reading', TS_BASE_FILE.yellow);
        this.transpileBaseMethods (TS_BASE_FILE, false, true);
        if (!this.creatingTypedInterface) {
            // WRAPPER_METHODS is populated now, so the nested call back into this method is a no-op
            this.createTypedInterfaceFile (true);
        }
    }

    createGoWrappers(exchange: string, path: string, wrappers: any[], ws: boolean | 'prediction' = false): string {
        // ast-transpiler drops the `= {}` default of a type-annotated params bag, which would
        // emit it as a required positional arg ahead of the variadic options
        restoreParamsBagInitializers(wrappers);
        const isPrediction = (ws === 'prediction');
        const isWs = (ws === true);
        const methodsList = new Set(wrappers.map(wrapper => wrapper.name));
        const missingMethods = INTERFACE_METHODS.filter(method => !methodsList.has(method));
        const isAlias = this.isAlias(exchange);
        let wrappersIndented = joinGoDeclarations (wrappers.map(wrapper => this.createWrapper(exchange, wrapper, ws)));
        if (isWs && path === GLOBAL_WRAPPER_FILE) {
            return '';
        }
        let missingMethodsWrappers = '';
        if (exchange !== 'Exchange' && this.isPrediction) {
            this.requireBaseMethodsMetadata ();
            // a unified method PredictionExchange retypes must be emitted on the venue, so it
            // shadows the crypto-typed one promoted from BaseExchange
            missingMethodsWrappers = joinGoDeclarations (missingMethods.map (m => {
                const predMethod = this.predictionBaseMethodsTypes.find ((w: any) => w.name === m);
                return predMethod ? this.createWrapper (exchange, predMethod, ws) : '';
            }));
        }

        if (exchange !== 'Exchange') {
            // the typed methods are appended to the exchange's own file by createGoExchange; only
            // the method bodies are produced here. Aliases and ws exchanges embed a struct that
            // already carries the full typed surface, so they get just their own overrides.
            const needsTypedBase = this.needsTypedBase (exchange, ws);
            let section = [
                '',
                '// typed methods',
                wrappersIndented,
                // gofmt puts one blank line between the last wrapper and the doc comment group of
                // the base-fallback wrappers (`min = 2` in go/printer declList)
                '',
                needsTypedBase && missingMethodsWrappers ? '// prediction-typed methods from base' : '',
                needsTypedBase ? missingMethodsWrappers : '',
            ].join('\n');
            if (ws || this.isPrediction) {
                section = this.qualifyTypedSection (section, wrappers, missingMethods);
            }
            return section;
        }

        const newMethod = [
            'func (this *BaseExchange) LoadMarkets(params ...any) (map[string]MarketInterface, error) {',
            ...goNativeAwaitBody ('\t', 'map[string]MarketInterface', 'NewMarketsMap', `this.LoadMarkets${GO_ASYNC_SUFFIX}(params...)`, 'nil'),
            '}',
        ].join('\n');

        const file = [
            'package ccxt',
            '',
            newMethod,
            '',
            ...this.createGeneratedHeader().filter (line => line !== ''),
            '',
            wrappersIndented,
            // blank line before the doc comment group of the base-fallback wrappers, as gofmt
            // spaces every doc-commented top-level declaration (go/printer declList min = 2)
        ].join('\n') + '\n';
        log.magenta ('→', (path as any).yellow);

        this.writeGeneratedOnce (path, file);
        return '';
    }

    // Aliases embed their parent and ws exchanges embed their REST twin, so only a non-alias REST
    // exchange may need venue-level re-typings of base methods (prediction venues).
    needsTypedBase (exchange: string, ws: boolean | 'prediction' = false): boolean {
        return (ws !== true) && !this.isAlias (exchange);
    }

    // ccxt.-qualify the base package names inside a typed section emitted into package ccxtpro /
    // ccxtprediction, keeping the prediction-local option structs unqualified.
    qualifyTypedSection (section: string, wrappers: any[], missingMethods: string[]): string {
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
        return this.addPackagePrefix(section, baseNames, 'ccxt');
    }

    transpileErrorHierarchy (force = true) {

        const errorHierarchyFilename = './js/src/base/errorHierarchy.js';
        const errorHierarchyPath = `${__dirname}/.${errorHierarchyFilename}`;

        if (skipUpToDateStage ('go', 'error hierarchy', force, [ errorHierarchyFilename ], [ ERRORS_FILE ])) {
            return;
        }

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
\treturn NewError("${name}", v...)
}`;
            return exception;
        }

        const goErrors = intellisense (root as any, 'BaseError', GoMakeErrorFile, undefined);


        // createError function
        const caseStatements = errorNames.map(error => {
            return`\tcase "${error}":
\t\treturn ${error}(v...)`;
        });

        const functionDecl = `func CreateError(err string, v ...any) error {
\tswitch err {
${caseStatements.join('\n')}
\tdefault:
\t\treturn NewError(err, v...)
\t}
}`;

    // gofmt aligns the type column of a const block to the widest name + 1 (tabwriter)
    const constNameColumn = Math.max (...errorNames.map ((error) => (error + 'ErrType').length)) + 1;
    const constStatements = errorNames.map(error => {
        return`\t${(error + 'ErrType').padEnd (constNameColumn)}ErrorType = "${error}"`;
    });

    const constDecl =`const (
${constStatements.join('\n')}
)`;

        const goBodyIntellisense = 'package ccxt\n' + this.createGeneratedHeader().join('\n') + '\n' + goErrors.join ('\n') + '\n' + functionDecl + '\n\n' + constDecl + '\n'
            + g10kErrARtErrorParentsDecl (root);
        if (fs.existsSync (ERRORS_FILE)) {
            log.bright.cyan (message, (ERRORS_FILE as any).yellow);
            overwriteFileAndFolder (ERRORS_FILE, goBodyIntellisense);
        }

        log.bright.cyan (message, (ERRORS_FILE as any).yellow);

    }

    // The base-methods pass does double duty: it writes exchange_generated.go /
    // exchange_wrappers.go AND it registers the module-level WRAPPER_METHODS metadata that
    // createGoWrappers() and createTypedInterfaceFile() need (both throw without it). So the
    // mtime gate can only skip it when nothing else in this process needs that metadata —
    // any stage that does calls requireBaseMethodsMetadata() below, which transpiles it on
    // demand, ignoring the gate.
    transpileBaseMethods(baseExchangeFile: string, isWs = false, force = true) {
        // `exchanges.json` is a real input for the typed interface / dynamic instance stages
        // that reuse this stage's metadata, so adding/removing an exchange must invalidate it
        // even when ts/src/base/Exchange.ts did not change
        if (skipUpToDateStage ('go', 'base methods', force, [
            baseExchangeFile,
            './ts/src/base/types.ts',
            './exchanges.json',
        ], isWs ? [ BASE_METHODS_FILE ] : [ BASE_METHODS_FILE, GLOBAL_WRAPPER_FILE ])) {
            // safeOptionsStructFile() dumps goTypeOptions wholesale, and the base pass is what
            // fills it with the base-Exchange option structs. Skipping it here would rewrite
            // exchange_wrapper_structs.go without them, so reuse the same "keep the previous
            // full run" guard the per-exchange gate uses.
            this.skippedUnchangedExchanges = true;
            return;
        }
        log.bright.cyan ('Transpiling base methods →', baseExchangeFile.yellow, BASE_METHODS_FILE.yellow);
        const goExchangeBase = BASE_METHODS_FILE;
        const delimiter = 'METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT'

        // to go
        // const tsContent = fs.readFileSync (baseExchangeFile, 'utf8');
        // const delimited = tsContent.split (delimiter)
        const baseMethods = VIRTUAL_BASE_METHODS;
        const allVirtual = Object.keys(baseMethods);
        // A full --rest-and-ws run reaches this method three times with the same source file
        // (REST, the recursive prediction pass, and WS), and each one used to pay a fresh
        // transpile of the 9.7k-line Exchange.ts plus the overload-strip temp file. The
        // result is a pure function of `baseExchangeFile` (`wrapCallMethods` is the same
        // constant list every time and the source cannot change mid-process), so transpile
        // it once and replay the emit + wrapper side effects from the cached result.
        let baseFile = this._baseMethodsTranspileCache[baseExchangeFile];
        if (!baseFile) {
            this.transpiler.goTranspiler.wrapCallMethods = allVirtual;
            const strippedBaseFile = writeOverloadStrippedFile (baseExchangeFile);
            baseFile = this.transpiler.transpileGoByPath(strippedBaseFile);
            removeOverloadStrippedFile (strippedBaseFile, baseExchangeFile);
            this.transpiler.goTranspiler.wrapCallMethods = [];
            this._baseMethodsTranspileCache[baseExchangeFile] = baseFile;
        }
        let baseClass = baseFile.content as any; // remove this later

        // capture the 62 symbol-based method names from the TS `Exchange extends BaseExchange` tier,
        // so the wrappers keep them on Exchange (regular venues) and off prediction venues.
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

        const syncRegex = new RegExp(`<-this\\.callInternal\\("(${syncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        // console.log(syncRegex)
        // baseClass = baseClass.replace(syncRegex, 'this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(syncRegex, (_match: any, p1: string, p2: string) => {
            const capitalizedMethod = capitalize(p1);
            return `this.DerivedExchange.${capitalizedMethod}(${p2 ?? ''})`;
        });

        const asyncRegex = new RegExp(`<-this\\.callInternal\\("(${asyncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        // console.log(asyncRegex)
        // baseClass = baseClass.replace(asyncRegex, '<-this.DerivedExchange.$1($2)');
        baseClass = baseClass.replace(asyncRegex, (_match: any, p1: string, p2: string) => {
            const capitalizedMethod = capitalize(p1);
            return `<-this.DerivedExchange.${capitalizedMethod}${GO_ASYNC_SUFFIX}(${p2 ?? ''})`;
        });
        // create wrappers with specific types
        this.createGoWrappers('Exchange', GLOBAL_WRAPPER_FILE, baseFile.methodsTypes || [], isWs);

        // const exchangeMethods = wrapperMethods['Exchange'];
        // const sortedList = exchangeMethods.sort((a, b) => a.localeCompare(b));
        // sortedList.forEach( i => {
        //     console.log(i)
        // });


        // the `[ value, params ]` tuple helpers return a concrete `[]any` (see
        // coerceTupleHelperSignatures) so the destructuring holders can carry the real slice type
        baseClass = this.coerceTupleHelperSignatures (baseClass);

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
            //    The replacement is a complete Go statement: gofmt never emits a `;`
            //    terminator, so none is written here either.
            ["throw NewGetValue(broad, broadKey)(((string)message));", "ThrowDynamicException(getValue(broad, broadKey), message)"],
            ["throw NewGetValue(exact, str)(((string)message));", "ThrowDynamicException(getValue(exact, str), message)"],
            ["throw NewGetValue(exact, str)(message);", "ThrowDynamicException(getValue(exact, str), message)"],
            // 5) Fix error constructors - remove "New" prefix
            [/NewNotSupported/g, 'NotSupported'],
            [/NewInvalidNonce/g, 'InvalidNonce'],
            // WS fixes
            [/\(object client,/gm, '(WebSocketClient client,'],
            [/Dictionary<string,object>\)client\.futures/gm, 'Dictionary<string, ccxt.Exchange.Future>)client.futures'],
            [/(\b\w*)RestInstance.describe/g, "(\(Exchange\)$1RestInstance).describe"],
            [/GetDescribeForExtendedWsExchange\(currentRestInstance \*Exchange, parentRestInstance \*Exchange/g, 'GetDescribeForExtendedWsExchange(currentRestInstance Describer, parentRestInstance Describer'],
            [/(var \w+ any) = client.Futures/g, '$1 = (client.(Client)).Futures'], // tmp fix for go not needed after ws-merge
            // Symbols is a typed []string field on BaseExchange; TS `this.symbols = []` transpiles
            // to an untyped []any{} literal which cannot be assigned to the typed field.
            [/this\.Symbols = \[\]any\{\}/g, 'this.Symbols = []string{}'],
            // setMarkets indexes each parsed row pointer-free (markets_by_id keeps the row itself)
            [/(\breturn )DerefScalar\(marketValues\[i\]\)/g, '$1MarketTyped(marketValues[i])'],
            [/\bvalues = append\(values, market\)/g, 'values = append(values, MarketTyped(market))'],
            // ParseToInt's TS body is `parseInt(parseFloat(numberToString(number)))` and the
            // hand-written ParseInt always returns int64 (math.MinInt64 when the conversion
            // fails), so the method never hands back nil. Name the concrete type here (the
            // only place this signature is emitted) so generated locals can be declared
            // `int64` instead of `any` — see the ParseToInt entry in build/go-local-types.js.
            [/func\s+\(this \*BaseExchange\)\s+ParseToInt\(number any\)\s+any\s*\{/g, 'func (this *BaseExchange) ParseToInt(number any) int64 {'],
            // Fix setMarketsFromExchange parameter type (base methods now hang off *BaseExchange)
            [/func\s+\(this \*BaseExchange\)\s+SetMarketsFromExchange\(sourceExchange any\)/g, 'func (this *BaseExchange) SetMarketsFromExchange(sourceExchange *BaseExchange)'],
            // The `[value, params]` tuple helpers of ts/src/base/Exchange.ts (handleOptionAndParams/2,
            // handleParamString/2, handleMarketTypeAndParams) return a TS tuple, which the printer can
            // only express as `any`. Coerce those declarations to `[]any` so the destructuring holder
            // (see CCXT_GO_ARRAY_BINDING_HOLDERS in build/go-local-types.js) is a real slice instead of
            // an `any` box — the same shape #30356's C# retypeDestructuringTemp gave the same holder.
            // The proof (every return path of every declaration, the two Okx/Deepcoin overrides
            // included, delegates to a `[]any{...}` literal) and the census checker live in
            // coerceTupleHelperSignatures above.
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
            // Async cores are emitted as a trampoline + unexported body PAIR
            // (`LoadOrderBook` then `loadOrderBookBody`), so the cut has to run to the next
            // EXPORTED method — stopping at the lowercase body would leave that body behind,
            // orphaned and still untranspilable.
            [new RegExp(`func\\s+\\(this \\*Exchange\\)\\s+LoadOrderBook${GO_ASYNC_SUFFIX}\\([\\s\\S]*?(?=\\nfunc\\s+\\(this \\*Exchange\\)\\s+[A-Z])`, 'g'), ''],
            // The rest of the Safe* family enters Go as imported free functions (class
            // properties above the marker) and gets hand-written pointer-returning wrappers in
            // exchange_safe.go. safeBool/safeBool2/safeBoolN are the exception: real TS methods
            // below the marker, so the printer emits `any` copies here. Drop them so the
            // hand-written *bool twins (same pointer/`derefScalar` layer) take over — otherwise
            // Go reports a duplicate method. A rename in Exchange.ts makes this regex miss; the
            // copy then comes back as `any` and the declarations the classifier types `*bool`
            // fail the build loudly instead of drifting silently.
            [new RegExp ('func\\s+\\(this \\*BaseExchange\\)\\s+SafeBool(?:N|2)?\\([^)]*\\)\\s+any\\s*\\{[\\s\\S]*?(?=\\nfunc )', 'g'), ''],
            // `any` locals that capture a SafeBool* pointer must carry the plain value: this
            // file does not go through createGoExchange's unwrap pass, and its `any` locals are
            // still compared raw (`postOnly != true` in IsPostOnly), which an interface holding
            // a *bool always satisfies. Bool family only -- the other Safe* families' locals in
            // this file are consumed through IsEqual/EvalTruthy and need no unwrap.
            [/(var \w+ any = )(this\.SafeBool(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1DerefScalar($2)'],
            // the 62 dispatch a few other 62-methods through this.DerivedExchange for virtual override
            // (e.g. editLimitOrder→editOrder, fetchTicker→fetchTickers, fetchOrderStatus→fetchOrder).
            // Those callees are NOT on PredictionExchange, so they are trimmed from IDerivedExchange
            // (see go/v4/exchange_interface.go) to let prediction cores satisfy it. These dispatch
            // sites live only inside the 62 (regular-only code that prediction never compiles), so we
            // type-assert to the per-method interface (I<Method>), which the regular venue satisfies.
            [new RegExp(`this\\.DerivedExchange\\.(CreateOrder|CancelOrder|EditOrder|FetchOrder|FetchTickers|CancelOrderWs|CreateOrderWs|FetchOrdersWs|FetchTickersWs|FetchPositionsHistory)${GO_ASYNC_SUFFIX}\\(`, 'g'), `this.DerivedExchange.(I$1).$1${GO_ASYNC_SUFFIX}(`],
            [new RegExp(`this\\.DerivedExchange\\.(FetchTrades|FetchOrders|FetchClosedOrders|FetchOHLCV)${GO_ASYNC_SUFFIX}\\(`, 'g'), `this.DerivedExchange.(I$1).$1${GO_ASYNC_SUFFIX}(`], // W28
            [new RegExp(`this\\.DerivedExchange\\.(FetchTradingFee|FetchMyTrades|CreateOrders|CancelOrders|WatchMyTrades|WatchOHLCV|WatchOrders|WatchPositions|WatchTrades|FetchOrderBook|FetchStatus)${GO_ASYNC_SUFFIX}\\(`, 'g'), `this.DerivedExchange.(I$1).$1${GO_ASYNC_SUFFIX}(`], // W3+W4
            // SafeNumber / SafeNumber2 / SafeNumberN / SafeNumberOmitZero are hand-written in
            // go/v4/exchange_safe.go with the honest *float64 return the printer cannot emit (the
            // TS `Num` annotation prints as `any`), so drop the transpiled copies to avoid a
            // redeclaration — same shape as the loadOrderBook drop above. The classifier in
            // build/go-local-types.js types locals from the hand-written signature.
            [new RegExp(`func\\s+\\(this \\*BaseExchange\\)\\s+SafeNumber(?:2|N|OmitZero)?\\([^{]*\\{[\\s\\S]*?\\n\\}\\n`, 'g'), ''],
            // handleMarketType/SubType/OptionString(2)/MarginMode/OptionBool(2)/OptionInteger(2)AndParams are hand-written in
            // exchange_market_type.go with a (*string, map[string]any) result pair
            [new RegExp(`func\\s+\\(this \\*BaseExchange\\)\\s+(?:Handle(?:MarketType|SubType|OptionString|MarginMode)AndParams|HandleOption(?:Bool|Integer)AndParams2?|HandleOptionStringAndParams2|HandleUntilOption)\\([^{]*\\{[\\s\\S]*?\\n\\}\\n`, 'g'), ''],
            // marketSymbols is hand-written in exchange_market_type.go with its []string result
            [new RegExp('func\\s+\\(this \\*BaseExchange\\)\\s+MarketSymbols\\([^{]*\\{[\\s\\S]*?\\n\\}\\n', 'g'), ''],
            // implodeHostname is hand-written in go/v4/exchange_misc.go with its `string` return
            [new RegExp('func\\s+\\(this \\*BaseExchange\\)\\s+ImplodeHostname\\([^{]*\\{[\\s\\S]*?\\n\\}\\n', 'g'), ''],
        ]);

        // SafeCurrencyCode / SafeSymbol carry the `*string` shape the hand-written Safe*
        // accessors already use (see coerceTypedStringAccessors), so the locals initialised
        // from them can be typed and the printer's pointer-aware comparisons apply.
        baseClass = this.coerceTypedStringAccessors (baseClass);
        baseClass = this.coerceStringPtrMethods (baseClass, CCXT_GO_STRING_PTR_METHOD_NAMES, true);
    baseClass = this.coerceTypedMapAccessors (baseClass);

        const jsDelimiter = '// ' + delimiter;
        const parts = baseClass.split (jsDelimiter);
        if (parts.length > 1) {
            const baseMethods = parts[1];
            const fileHeader = this.getGoImports(undefined).concat([
                this.createGeneratedHeader().join('\n'),
            ]).join("\n");

            const file = goAnyLocalNativeNilCompares (goPointerLocalNativeNilCompares (goBoxedPointerNilCompares (goParamNativeNilCompares (coerceGoBoolMethodReturns (fileHeader + baseMethods + "\n", CCXT_GO_BOOL_METHOD_NAMES), 'IsEqual('), 'IsEqual('), 'IsEqual('), 'IsEqual(');
            // repeated base passes (REST / prediction recursion / WS) emit identical bytes —
            // skip the rewrite of this ~390 KB file after the first
            this.writeGeneratedOnce (goExchangeBase, hx10w10GP24BaseImports (hx4G20BaseNativePasses (hx11w8BaseMapLocals (retypeGoDescribe (file), 'go/v4/exchange_generated.go'))));
        }
    }

    transpilePredictionBaseMethods (predictionBaseFile = './ts/src/base/PredictionExchange.ts', registerOnly = false, force = true) {
        // PredictionExchange is the base for prediction-market exchanges; it lives in
        // package ccxt and embeds Exchange. Its methods are transpiled the same way as
        // the base methods (with virtual dispatch through DerivedExchange).
        // named exchange_prediction.go so extractTypeAndFuncNames() (which scans go/v4/exchange*.go)
        // picks up PredictionExchange and the prediction package qualifies it as ccxt.PredictionExchange
        const goPredictionBase = './go/v4/exchange_prediction.go';
        // `registerOnly` writes nothing — it only captures predictionBaseMethodsTypes for this
        // process — so it can never be satisfied by an up-to-date file on disk. It can however
        // be satisfied by an earlier full call in the same process: the recursive prediction
        // pass reaches it right after the main pass already transpiled the same file.
        if (registerOnly && this.predictionBaseMethodsTypes.length) {
            return;
        }
        if (!registerOnly && skipUpToDateStage ('go', 'prediction base methods', force, [
            predictionBaseFile,
            './ts/src/base/Exchange.ts',
            './ts/src/base/types.ts',
        ], [ goPredictionBase ])) {
            return;
        }
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
        const syncRegex = new RegExp(`<-this\\.callInternal\\("(${syncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        baseClass = baseClass.replace(syncRegex, (_match: any, p1: string, p2: string) => `this.DerivedExchange.${capitalize(p1)}(${p2 ?? ''})`);
        const asyncRegex = new RegExp(`<-this\\.callInternal\\("(${asyncMethods.join('|')})"(?:, (.+))?\\)`, 'gm');
        baseClass = baseClass.replace(asyncRegex, (_match: any, p1: string, p2: string) => `<-this.DerivedExchange.${capitalize(p1)}${GO_ASYNC_SUFFIX}(${p2 ?? ''})`);
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
            // createOrder/cancelOrder are trimmed from IDerivedExchange (regular venues carry them as
            // AsyncResult[Order], prediction venues as the map of a prediction order): the prediction
            // base reaches the venue through the prediction-shaped per-method interface
            [/this\.DerivedExchange\.(CreateOrder|CancelOrder)Async\(/g, 'this.DerivedExchange.(IPrediction$1).$1Async('],
            // `any` locals that capture a SafeBool* pointer must carry the plain value: this
            // file does not go through createGoExchange's unwrap pass, and its `any` locals are
            // still compared raw (`postOnly != true` in IsPostOnly), which an interface holding
            // a *bool always satisfies. Bool family only -- the other Safe* families' locals in
            // this file are consumed through IsEqual/EvalTruthy and need no unwrap.
            [/(var \w+ any = )(this\.SafeBool(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1DerefScalar($2)'],
        ]);
        // outcome/safeOutcome (: PredictionOutcomeMarket) and parseSearchQueries (: string[]) have no venue override
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'Outcome', undefined, true);
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'SafeOutcome', undefined, true);
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'ParseSearchQueries', undefined, true, '[]any');
        // applyEventFetchParams (: any[]) has no venue override: every return is the events list (ListTyped), so fetchEvents cores send []any
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'ApplyEventFetchParams', undefined, true, '[]any');
        // setEvents (: Dictionary<any>) has no venue override: its only return is this.events (MapTyped), so loadEvents cores send map[string]any // W19
        baseClass = this.retypeGoMapMethod (baseClass, 'PredictionExchange', 'SetEvents', undefined, true); // W19
        const jsDelimiter = '// ' + delimiter;
        const parts = baseClass.split (jsDelimiter);
        if (parts.length > 1) {
            const methods = parts[1];
            // gofmt indents a struct block with tabs and aligns the type column of every *typed*
            // field at (longest field name + 1); the embedded (typeless) field prints alone and
            // stays out of that alignment. This write never goes through formatGoSource(), so the
            // literal below is emitted pre-aligned.
            // prediction caches carry their map type here (hx10w3 G09): hx10w3-G09 reads it per site
            const structFields: [string, string][] = [
                [ 'BaseExchange', '' ],
                [ 'Outcomes', 'map[string]any' ],
                [ 'Outcomes_by_id', 'map[string]any' ],
                [ 'Events', 'map[string]any' ],
                [ 'Events_by_slug', 'map[string]any' ],
                [ 'ReloadingEvents', 'bool' ],
                [ 'EventsLoading', 'any' ],
            ];
            const fieldTypeColumn = Math.max (...structFields.filter ((f) => f[1]).map ((f) => f[0].length)) + 1;
            const structDef = [
                'type PredictionExchange struct {',
                ...structFields.map ((f) => f[1] ? '\t' + f[0].padEnd (fieldTypeColumn) + f[1] : '\t' + f[0]),
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
                '\treturn this.callEndpointAsync(endpointName, args...)',
                '}',
                '',
            ].join('\n');
            // `shims` ends with the single trailing newline gofmt wants at EOF
            // (the caller-fed `any` parameters keep the helper here too — see goParamNativeNilCompares)
            const file = goAnyLocalNativeNilCompares (goPointerLocalNativeNilCompares (goBoxedPointerNilCompares (goParamNativeNilCompares (coerceGoBoolMethodReturns (fileHeader + '\n' + structDef + methods + shims, CCXT_GO_BOOL_METHOD_NAMES), 'IsEqual('), 'IsEqual('), 'IsEqual('), 'IsEqual(');
            // this is the one generated .go write that does not go through
            // overwriteFileAndFolder()/formatGoSource(), so guard its async cores here
            // (and add the element-access assertions formatGoSource would have added)
            fs.writeFileSync (goPredictionBase, goGofmtLayout (hx10w10GP24BaseImports (gp19Pass (hx10w7G14Pass ((hx4G37InlineComparisons (alignGoTrailingComments (hx4G40InlineIsEqual (hx4G42InlineTypeChecks (hx5X29ParseNative (hx4G45InlineStr (hx5X27StringHelpers (hx5X26CaseAffix (hx4G36Inline (hx4G35InlineMulSub (goGofmtSplicedText (goGofmtNestedParens (hx4G20BaseNativePasses (hx10w9GO05Pass (hx10w8GO04Pass (og06SyncMapArmsPass (hx4G07FieldInOp (goChan3Pass (goErrValuePass (goChanCarrierPass (assertTypedElementAccess (guardMultiSendCores (retypeGoProvenParseMethods (normalizeGoFileHeader (file)))))))))))))), hx4G36Aligner ()))), hx4G36Aligner ())), hx4G36Aligner ()), hx4G36Aligner ()))))), goPredictionBase)))));  // hx10 w9 GP19: this base file bypasses formatGoSource
            log.green ('Transpiled prediction base methods to', (goPredictionBase as any).yellow)
        }
    }


    createDynamicInstanceFile(ws = false, prediction = false, force = true){
        const subFolder = ws ? '/pro' : (prediction ? '/prediction' : '');
        const dynamicInstanceFile = `./go/v4${subFolder}/exchange_dynamic.go`;
        // this file is a pure function of the exchange id lists in exchanges.json
        if (skipUpToDateStage ('go', `dynamic instance file (${subFolder || '/v4'})`, force, [ './exchanges.json' ], [ dynamicInstanceFile ])) {
            return;
        }
        const exchanges = ws ? exchangeIdsWs : (prediction ? predictionIds : ['Exchange'].concat(exchangeIds));
        const externalPackage = ws || prediction; // packages outside go/v4 import the base ccxt package
        const caseStatements = exchanges.map(exchange => {
            if (exchange === 'Exchange') {
                return`\tcase "Exchange":
\t\tExchangeItf := NewExchange()
\t\tExchangeItf.Init(exchangeArgs)
\t\treturn ExchangeItf, true`;
            }
            return`\tcase "${exchange}":
\t\t${exchange}Itf := New${capitalize(exchange)}(exchangeArgs)
\t\treturn ${exchange}Itf, true`;
        });

        const functionDecl = `
func DynamicallyCreateInstance(exchangeId string, exchangeArgs map[string]any) (${externalPackage ? 'ccxt.' : ''}ICoreExchange, bool) {
\tswitch exchangeId {
${caseStatements.join('\n')}
\tdefault:
\t\treturn nil, false
\t}
}
`;
        const file = [
            `package ccxt${ws ? 'pro' : (prediction ? 'prediction' : '')}`,
            '',
            ...(externalPackage ? [ 'import ccxt "github.com/ccxt/ccxt/go/v4"', '' ] : []),
            ...this.createGeneratedHeader().filter (line => line !== ''),
            '',
            functionDecl,
        ].join('\n') + '\n';

        fs.writeFileSync (dynamicInstanceFile, formatGoSource (dynamicInstanceFile, normalizeGoFileHeader (alignGoTrailingComments (file))));
    }


    createTypedInterfaceFile(force = true){
        if (skipUpToDateStage ('go', 'typed interface file', force, [
            './exchanges.json',
            './ts/src/base/Exchange.ts',
            './ts/src/base/types.ts',
        ], [ TYPED_INTERFACE_FILE ])) {
            return;
        }
        this.creatingTypedInterface = true;
        try {
            this.requireBaseMethodsMetadata ();
        } finally {
            this.creatingTypedInterface = false;
        }
        if (!WRAPPER_METHODS['Exchange']) {
            throw new Error('Exchange wrapper methods are not defined, please transpile base methods first');
        }
        const exchanges = ['exchange'].concat(exchangeIds);

        const caseStatements = exchanges.map(exchange => {
            const ctor = exchange === 'exchange' ? '&Exchange{}' : `New${capitalize(exchange)}(options)`;
            return`\tcase "${exchange}":
\t\titf := ${ctor}
\t\treturn itf`;
        });

        const functionDecl = `
func CreateExchange(exchangeId string, options map[string]any) IExchange {
\texchangeId = strings.ToLower(exchangeId)
\tswitch exchangeId {
${caseStatements.join('\n')}
\tdefault:
\t\treturn nil
\t}
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
\tIBaseExchange
\t${interfaceMethods.join('\n\t')}
}`;

        const file = [
            'package ccxt',
            '',
            'import "strings"',
            '',
            ...this.createGeneratedHeader().filter (line => line !== ''),
            '',
            interfaceDecl,
            '',
            functionDecl,
        ].join('\n') + '\n';

        fs.writeFileSync (TYPED_INTERFACE_FILE, formatGoSource (TYPED_INTERFACE_FILE, normalizeGoFileHeader (alignGoTrailingComments (file))));
    }

    // ----- WS specific ----- //
    createWsTypedInterfaceFile(force = true){
        // a pure function of the ws exchange id list in exchanges.json
        if (skipUpToDateStage ('go', 'ws typed interface file', force, [ './exchanges.json' ], [ TYPED_WS_INTERFACE_FILE ])) {
            return;
        }

        const interfaceWs = [
            'type IExchange interface {',
            '\tccxt.IExchange',
            '}'
        ].join('\n');

        const caseStatements = exchangeIdsWs.map(exchange => {
            const struct = capitalize(exchange);
            const args = 'options';
            return`\tcase "${exchange}":
\t\titf := New${struct}(${args})
\t\treturn itf`;
        });

        const functionDecl = `
func CreateExchange(exchangeId string, options map[string]any) ccxt.IExchange {
\texchangeId = strings.ToLower(exchangeId)
\tswitch exchangeId {
${caseStatements.join('\n')}
\tdefault:
\t\treturn nil
\t}
}
`;

        const file = [
            'package ccxtpro',
            '',
            'import (',
            // gofmt sorts the specs of an import block by import path (and indents with a tab)
            '\tccxt "github.com/ccxt/ccxt/go/v4"',
            '\t"strings"',
            ')',
            '',
            this.createGeneratedHeader().join('\n'),
            // no extra blank line: the generated header already ends with one
            interfaceWs,
            '',
            functionDecl,
        ].join('\n') + '\n';

        fs.writeFileSync (TYPED_WS_INTERFACE_FILE, formatGoSource (TYPED_WS_INTERFACE_FILE, normalizeGoFileHeader (alignGoTrailingComments (file))));
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
        const scopedRun = inputExchanges.length > 0;
        if (inputExchanges === undefined) {
            inputExchanges = exchanges.ws;
        }
        if (prediction && (!inputExchanges || !inputExchanges.length)) {
            inputExchanges = predictionWsIds;
        }
        const wsFolder = prediction ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_WS_FOLDER;
        const options = { goFolder: wsFolder, exchanges:inputExchanges };
        // const options = { goFolder: EXCHANGES_WS_FOLDER, exchanges:['bitget'] }
        if (scopedRun) {
            force = true; // a scoped run (CI `goTranspiler.ts <exchange> --ws`) always writes, same as the REST path
        }
        // base methods are always needed to populate the wrapper metadata (WRAPPER_METHODS)
        // (when the gate skips it, requireBaseMethodsMetadata() re-reads it on demand)
        this.transpileBaseMethods(TS_BASE_FILE, true, force);
        this.isPrediction = prediction;
        await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(inputExchanges), true );
        this.isPrediction = false;
        if (prediction) {
            // the prediction ws package only emits the derived exchange classes,
            // it reuses the dynamic-instance / typed-interface plumbing of package ccxtpro
            log.bright.green ('Transpiled prediction ws exchanges successfully.');
            return;
        }
        this.createDynamicInstanceFile(true, false, force);
        this.transpileProTypes(force);
        this.createWsTypedInterfaceFile(force);

    }

    async transpileEverything (force = false, baseOnly = false, examplesOnly = false, prediction = false) {

        let exchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
        const goFolder = prediction ? EXCHANGES_PREDICTION_FOLDER : EXCHANGES_FOLDER
            , tsFolder = prediction ? './ts/src/prediction' : './ts/src';

        createFolderRecursively (goFolder);
        const transpilingSingleExchange = (exchanges.length === 1); // when transpiling single exchange, we can skip some steps because this is only used for testing/debugging
        if (transpilingSingleExchange) {
            force = true; // when transpiling single exchange, we always force
        }
        if (prediction) {
            if (exchanges.length) {
                const predictionOnly = exchanges.filter ((x: string) => predictionIds.includes (x));
                if (!predictionOnly.length) {
                    // a scoped regular-exchange run has no prediction work —
                    // ts/src/prediction/ has no files for those ids
                    return;
                }
            }
            // a single-exchange prediction transpile would truncate the shared
            // exchange_wrapper_structs.go to that one exchange — the namespace is
            // small, so always emit the full set
            exchanges = predictionIds;
        }
        const options = { goFolder, exchanges };

        this.transpileBaseMethods (TS_BASE_FILE, false, force); // now we always need the baseMethods info
        // the dynamic-instance / typed-interface files belong to package ccxt; the
        // prediction package reuses them and must not regenerate them
        if (!transpilingSingleExchange && !prediction) {
            this.transpilePredictionBaseMethods (undefined, false, force);
            this.createDynamicInstanceFile(false, false, force);
            this.createTypedInterfaceFile(force);
        } else if (prediction) {
            // capture-only: populate predictionBaseMethodsTypes (no ccxt-package file write)
            // so inherited unified methods emit prediction-typed wrappers in this process
            this.transpilePredictionBaseMethods (undefined, true);
        }

        if (!baseOnly && !examplesOnly) {
            this.isPrediction = prediction;
            await this.transpileDerivedExchangeFiles (tsFolder, options, '.ts', force, !!(exchanges.length));
            this.isPrediction = false;
        }

        if (prediction) {
            // the prediction package needs its OWN DynamicallyCreateInstance (over
            // prediction ids); the base one in package ccxt only knows regular ids
            this.createDynamicInstanceFile (false, true, force);
            log.bright.green ('Transpiled prediction exchanges successfully.');
            return;
        }

        if (baseOnly) {
            return;
        }

        if (transpilingSingleExchange) {
            return;
        }

        // full builds also transpile the prediction-market exchanges (ts/src/prediction/)
        await this.transpileEverything (force, false, false, true);

        await this.transpileTests(force);

        this.transpileErrorHierarchy (force);

        log.bright.green ('Transpiled successfully.');
    }

    // default min(2, AP): 2w + shared-Program chunks is within ~10% of 4w (Go often prefers 2).
    // Override with CCXT_TRANSPILE_PROCESSES.
    goWorkerThreads () {
        const n = Number (process.env.CCXT_TRANSPILE_PROCESSES)
        if (n > 0) {
            return Math.floor (n)
        }
        return Math.max (1, Math.min (2, os.availableParallelism ()))
    }

    async webworkerTranspile (allFiles: any[], parserConfig: any) {

        // create worker
        const maxThreads = this.goWorkerThreads ()
        if (!this.piscina) {
            this.piscina = new Piscina({
                filename: resolve(__dirname, 'go-worker.ts'),
                maxThreads,
            });
        }
        const piscina = this.piscina;

        const configKey = JSON.stringify(parserConfig);
        const promises: any = [];
        const now = Date.now();
        // One file per task. `roots` is the FULL stage list on every task so each worker
        // builds ONE sticky ts.Program (build/worker-program-batch.ts) and prints off it.
        for (const file of allFiles) {
            promises.push(piscina.run({transpilerConfig:parserConfig, configKey, roots: allFiles, files: [file]}));
        }
        const workerResult = await Promise.all(promises);
        const elapsed = Date.now() - now;
        log.green ('[ast-transpiler] Transpiled', allFiles.length, 'files in', elapsed, 'ms');
        // Order-preserving flatten: Promise.all is in input order; each task returns one file.
        const flatResult = [];
        for (const res of workerResult) {
            for (const f of (res.files ?? [res.file])) {
                flatResult.push(f);
            }
            this.mergeWorkerGoComments(res.goComments);
        }
        return flatResult;
    }

    mergeWorkerGoComments (workerComments: any) {
        if (!workerComments) {
            return;
        }
        for (const exchangeName in workerComments) {
            const exchangeData = goComments[exchangeName] || (goComments[exchangeName] = {});
            const workerMethods = workerComments[exchangeName];
            for (const methodName in workerMethods) {
                exchangeData[methodName] = workerMethods[methodName];
            }
        }
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
                // gofmt wants exactly one blank line between the package (or import) clause and
                // the generated-header comment; the header string already ends with a newline
                '',
                this.createGeneratedHeader().join('\n'),
            ];
            for (const key in goTypeOptions) {
                // emit param-renamed prediction overrides locally even though a same-named
                // struct exists in base (e.g. FetchTickersOptionsStruct with Outcomes)
                const isLocalOverride = predictionLocalOptionStructs.has(key);
                if (!isLocalOverride && (ccxtNames.has(key + 'Options') || ccxtNames.has(key + 'OptionsStruct'))) {
                    continue;
                }
                // the option-struct strings end with a blank line of their own; drop it before
                // pushing the single separating '' so consecutive decls keep one blank line
                // (gofmt collapses runs of blank lines between top-level decls)
                file.push(goTypeOptions[key].replace (/\n+$/, ''));
                file.push('');
            }
            const folder = ws ? EXCHANGES_PREDICTION_WS_FOLDER : EXCHANGES_PREDICTION_FOLDER;
            fs.writeFileSync (`${folder}/exchange_wrapper_structs.go`, normalizeGoFileHeader (file.join('\n')));
            return;
        }
        const EXCHANGE_OPTIONS_FILE = ws
            ? './go/v4/pro/exchange_wrapper_structs.go'
            : './go/v4/exchange_wrapper_structs.go';

        // gofmt puts one blank line after the package clause, after the import decl and
        // between the generated header comment and the first declaration
        const file = [
            ws ? 'package ccxtpro' : 'package ccxt',
            '',
            ...(ws ? [ 'import ccxt "github.com/ccxt/ccxt/go/v4"', '' ] : []),
            ...this.createGeneratedHeader().filter (line => line !== ''),
            ''
        ];
        // add simple Options
        if (!ws) {
            file.push('type Options struct {');
            file.push('\tParams *map[string]any');
            file.push('}');
            file.push('');
        }

        for (const key in goTypeOptions) {
            const struct = goTypeOptions[key];
            file.push(struct);
            file.push('');
        }

        fs.writeFileSync (EXCHANGE_OPTIONS_FILE, formatGoSource (EXCHANGE_OPTIONS_FILE, normalizeGoFileHeader (alignGoTrailingComments (file.join('\n')))));
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

        // local file list — must NOT clobber the module-level `exchanges` (the parsed
        // exchanges.json), which this function reads `.ids` off of on the next call.
        // Assigning to it worked only because each stage ran in its own process;
        // --rest-and-ws reuses one.
        let exchangeFiles: string[];
        if (options.exchanges && options.exchanges.length) {
            exchangeFiles = options.exchanges.map ((x:string) => x + pattern);
        } else {
            exchangeFiles = fs.readdirSync (jsFolder).filter (file => file.match (regex) && (!ids || ids.includes (basename (file, '.ts'))));
        }

        // Only process exchanges that are in transpiledExchanges
        // (the prediction exchanges have their own id list and skip this gate)
        if (!this.isPrediction) {
            exchangeFiles = exchangeFiles.filter (file => {
                const exchangeName = basename (file, pattern);
                return transpiledExchanges.includes (exchangeName);
            });
        }

        // incremental gate (same rule as the Python/PHP pass in build/transpile.ts):
        // drop the exchanges whose generated .go is newer than its ts source.
        // This has to happen BEFORE the pool is fed, because `allFilesPath`
        // doubles as the sticky ts.Program root list — leaving a clean exchange in it
        // would transpile and rewrite it anyway. `--force` (and any single-exchange run)
        // keeps everything.
        const totalExchangeFiles = exchangeFiles.length;
        exchangeFiles = filterDirtyExchangeFiles ('go', exchangeFiles, force, (file: string) => {
            const extensionlessName = basename (file, pattern);
            return {
                'tsPath': `${jsFolder}/${file}`,
                'outputs': [
                    `${options.goFolder}/${extensionlessName}.go`,
                ],
            };
        });
        if (exchangeFiles.length < totalExchangeFiles) {
            this.skippedUnchangedExchanges = true;
        }

        if (!exchangeFiles.length) {
            return {};
        }

        // transpile using webworker
        const allFilesPath = exchangeFiles.map ((file: string) => `${jsFolder}/${file}` );
        log.blue('[go] Transpiling [', exchangeFiles.join(', '), ']');
        const transpiledFiles = allFilesPath.length > 1 ? await this.webworkerTranspile(allFilesPath, this.getTranspilerConfig()) : allFilesPath.map((file: string) => this.transpiler.transpileGoByPath(file));

        const typedSections: string[] = [];
        for (let i = 0; i < transpiledFiles.length; i++) {
            const transpiled = transpiledFiles[i];
            const exchangeName = exchangeFiles[i].replace('.ts','');
            typedSections.push (this.createGoWrappers(exchangeName, '', transpiled.methodsTypes, ws));
        }
        exchangeFiles.map ((file: string, idx: number) => this.transpileDerivedExchangeFile (jsFolder, file, options, transpiledFiles[idx], force, ws, typedSections[idx]));
        // prediction packages always need their own option-structs file even with a single exchange.
        // `goTypeOptions` only holds the structs of the exchanges transpiled in THIS run, and
        // safeOptionsStructFile() dumps it wholesale — so after an incremental run that skipped
        // exchanges, rewriting the shared file would truncate it to the dirty subset. The existing
        // file already covers the full set (it was written by the last full/--force run), so leave
        // it alone; `--force` regenerates it from scratch.
        if (this.skippedUnchangedExchanges) {
            log.bright.cyan ('[go] Keeping exchange_wrapper_structs.go from the previous full run (incremental run, pass --force to regenerate)');
        } else if (exchangeFiles.length > 1 || this.isPrediction) {
            this.safeOptionsStructFile(ws);
        }
        const classes = {};

        return classes;
    }

    // Write a generated file, skipping the write when this process already wrote
    // byte-identical content to the
    // same path. transpileBaseMethods re-emits exchange_generated.go / exchange_wrappers.go
    // on every one of its three passes and the later passes produce the same bytes; only
    // those two paths are remembered, so the cache never grows with the ~200 per-exchange files.
    writeGeneratedOnce (path: string, content: string) {
        const repeated = (path === BASE_METHODS_FILE) || (path === GLOBAL_WRAPPER_FILE);
        if (repeated && this._lastWrittenContent[path] === content) {
            log.green ('[go] already emitted identical', (path as any).yellow, '- skipping rewrite');
            return false;
        }
        if (repeated) {
            this._lastWrittenContent[path] = content;
        }
        overwriteFileAndFolder (path, content);
        return true;
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
            // _test.go files are not part of the ccxt package a sibling package imports
            if (file.startsWith('exchange') && !file.endsWith('_test.go')) {
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
                        /^\s*type\s+\w+(?:\[[^\]]*\])?\s+(?:struct\s*\{|interface\s*\{|func\s*\()/.test(line)
                    )) continue;

                    const trimmed = line.trim();

                    // Exclude lines that are just "type" or "func"
                    if (/^(type|func)$/.test(trimmed)) continue;

                    const parts = trimmed.split(/\s+/);
                    if (parts.length < 2) continue;

                    // keep only the identifier: `Name(` and generic `Name[T any](` both end at the bracket
                    let name = parts[1].split(/[(\[]/)[0];
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

    /**
     * SafeCurrencyCode / SafeSymbol are string-ish on every TS return path: the `code` /
     * `symbol` field of the dict their callee (safeCurrency / safeMarket) always hands back,
     * or `undefined` when that dict carries none. Their Go body is transpiled into `any`, so
     * a local initialised from them can only be typed once the emitted signature carries the
     * same `*string` shape the hand-written Safe* accessors use (build/go-local-types.js
     * lists these two callees): an absent value then stays a nil pointer instead of an
     * untyped nil, which is the shape the printer's pointer-aware comparisons expect.
     * Wrap the single transpiled return in SafeStringPtr (go/v4/exchange_safe.go) and rename
     * the result type. Fail closed: a body that no longer matches this shape keeps the
     * transpiled `any` signature, so a printer change degrades instead of emitting an
     * uncompilable `*string` with an `any` return.
     *
     * @param content The generated exchange_generated.go content (raw, pre-gofmt)
     * @returns The content with the two coerced signatures
     */
    coerceTypedStringAccessors (content: string): string {
        // method name → the expressions its transpiled body may return (pre/post TS-P1 local)
        const stringish: [string, string[]][] = [
            [ 'SafeCurrencyCode', [ 'GetValue(currency, "code")', 'currencyResolved["code"]' ] ],
            [ 'SafeSymbol', [ 'GetValue(market, "symbol")', 'marketResolved["symbol"]' ] ],
        ];
        for (let i = 0; i < stringish.length; i++) {
            const method = stringish[i][0];
            const returnExprs = stringish[i][1];
            // the printer emits single spaces around the signature now (F04); the regex stays
            // whitespace-loose so it also matches pre-existing padding (`any  {`)
            const fnRegex = new RegExp ('func\\s+\\(this \\*BaseExchange\\)\\s+' + method + '\\(([^)]*)\\)\\s+any\\s*\\{([\\s\\S]*?)\\n\\}', 'g');
            content = content.replace (fnRegex, ((match: string, params: string, body: string) => {
                const returns = body.match (/^[ \t]*return .*$/gm) || [];
                const returnExpr = returnExprs.find ((e) => returns.length === 1 && returns[0].trim ().replace (/\s+/g, ' ') === ('return ' + e));
                if (returnExpr === undefined) {
                    return match; // unexpected body shape: keep the transpiled `any` signature
                }
                const returnIndent = (returns[0].match (/^[ \t]*/) as RegExpMatchArray)[0];
                const wrapped = body.replace (returns[0], returnIndent + 'return SafeStringPtr(' + returnExpr + ')');
                return 'func (this *BaseExchange) ' + method + '(' + params + ') *string {' + wrapped + '\n}';
            }) as any);
        }
        return content;
    }

    /**
     * An exchange may override one of the two coerced string-ish accessors — kraken's
     * safeCurrencyCode handles the X/Z prefixes. Its transpiled copy shadows the base method for
     * `this.SafeCurrencyCode(...)` calls on that exchange, so it has to carry the same `*string`
     * shape or the locals the classifier types against the call would not compile (the compiler
     * resolves the receiver, the classifier cannot). Every return goes through SafeStringPtr,
     * which is the identity on the string-ish value these methods return and maps anything else
     * (including nil) to the nil pointer = TS `undefined`. Fail closed: an override whose return
     * statements are not the emitted one-line `return <expr>` form is left `any` — the classifier
     * entries then fail the build loudly instead of drifting silently.
     *
     * @param content One generated exchange file (go/v4/<id>.go or a pro/prediction twin)
     * @returns The content with any override of the two accessors coerced
     */
    coerceTypedStringAccessorOverrides (content: string): string {
        const names = [ 'SafeCurrencyCode', 'SafeSymbol' ];
        for (let i = 0; i < names.length; i++) {
            const fnRegex = new RegExp ('func\\s+\\(this \\*(?!BaseExchange)(\\w+)\\)\\s+' + names[i] + '\\(([^)]*)\\)\\s+any\\s*\\{([\\s\\S]*?)\\n\\}', 'g');
            content = content.replace (fnRegex, ((match: string, receiver: string, params: string, body: string) => {
                const returns = body.match (/^[ \t]*return .*$/gm) || [];
                if (!returns.length || (body.indexOf ('SafeStringPtr(') >= 0)) {
                    return match;
                }
                let wrapped = body;
                for (let r = 0; r < returns.length; r++) {
                    const expr = returns[r].replace (/^[ \t]*return[ \t]+/, '');
                    const indent = returns[r].substring (0, returns[r].length - returns[r].trimStart ().length);
                    wrapped = wrapped.replace (returns[r], indent + 'return SafeStringPtr(' + expr + ')');
                }
                // keep the printer's own signature spacing and swap only the result type
                const head = match.substring (0, match.indexOf ('{'));
                return head.replace (/\s+any\s*$/, ' *string ') + '{' + wrapped + '\n}';
            }) as any);
        }
        return content;
    }

    /**
     * Retypes each named method (base copy when `base`, else every venue override) to `*string`,
     * routing every function-level return through SafeStringPtr (identity on a string, nil
     * otherwise). Fail closed: a body the return scanner cannot read keeps its `any` signature.
     */
    coerceStringPtrMethods (content: string, names: string[], base: boolean): string {
        for (const name of names) {
            const receiver = base ? 'BaseExchange' : '(?!BaseExchange\\b)\\w+';
            const fnRegex = new RegExp ('func\\s+\\(this \\*' + receiver + '\\)\\s+' + name + '\\([^)]*\\)\\s+any\\s*\\{[\\s\\S]*?\\n\\}', 'g');
            content = content.replace (fnRegex, ((match: string) => {
                const open = match.indexOf ('{');
                const scanned = this.wrapGoFunctionLevelReturns (match.substring (open + 1, match.length - 1), (expr: string) => 'SafeStringPtr(' + expr + ')');
                if ((scanned === undefined) || (scanned.total === 0)) {
                    return match;
                }
                return match.substring (0, open).replace (/\s+any\s*$/, ' *string ') + '{' + scanned.text + '}';
            }) as any);
        }
        return content;
    }

    // ---------------------------------------------------------------------------------------------
    /**
     * Index of the `}` that closes the brace-matched block opened at `open`, or -1 when the
     * text is unbalanced. Used by the map-accessor coercion to cut a method body out of the
     * printed file without a parser.
     */
    goBraceClose (content: string, open: number): number {
        let depth = 0;
        for (let i = open; i < content.length; i++) {
            const c = content[i];
            if (c === '{') {
                depth += 1;
            } else if (c === '}') {
                depth -= 1;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * Wraps every function-level `return <expr>` of a generated Go body with `wrapper`.
     * The returns of nested function literals are deliberately left alone: the closure's
     * expression has the closure's own type (Ndax's ParseOrderBook closure returns the two
     * key names, so `MapTyped(asksKey)` would not compile) and the printer always writes the
     * literal's `{` on the `func(` line (verified: 0 `= func(...) <type>` openings in go/v4
     * @0b32e4ad). Returns undefined - the caller keeps the transpiled `any` - when the body
     * cannot be scanned confidently (unbalanced braces, a `func(` head whose brace is on
     * another line, a bare `return`).
     */
    wrapGoFunctionLevelReturns (body: string, wrapper: (expr: string) => string): { text: string, total: number, exprs: string[] } | undefined {
        const inLiteral: boolean[] = [];
        const stack: boolean[] = [];
        let literalOpen = 0;
        for (let i = 0; i < body.length; i++) {
            inLiteral[i] = literalOpen > 0;
            const c = body[i];
            if (c === '{') {
                const lineStart = body.lastIndexOf ('\n', i - 1) + 1;
                const head = body.substring (lineStart, i);
                const isLiteral = /(^|[^\w.])func\s*\([^)]*\)/.test (head);
                stack.push (isLiteral);
                if (isLiteral) {
                    literalOpen += 1;
                }
            } else if (c === '}') {
                if (!stack.length) {
                    return undefined;
                }
                if (stack.pop ()) {
                    literalOpen -= 1;
                }
            }
        }
        if (stack.length) {
            return undefined;
        }
        const lines = body.split ('\n');
        const out: string[] = [];
        const exprs: string[] = [];
        let offset = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim ();
            if (!inLiteral[offset] && /^return([ \t]|$)/.test (trimmed)) {
                let expr = trimmed.substring ('return'.length).trim ();
                if (expr.length === 0) {
                    return undefined;
                }
                // a multi-line expression (e.g. a map literal argument) ends where its delimiters balance;
                // an expression that never balances leaves the whole method untyped
                const depthOf = (text: string): number => {
                    let depth = 0;
                    for (let k = 0; k < text.length; k++) {
                        const c = text[k];
                        if (c === '"' || c === '`' || c === "'") {
                            k = goSkipLiteralText (text, k);
                        } else if (c === '(' || c === '[' || c === '{') {
                            depth += 1;
                        } else if (c === ')' || c === ']' || c === '}') {
                            depth -= 1;
                        }
                    }
                    return depth;
                };
                while ((depthOf (expr) > 0) && (i + 1 < lines.length)) {
                    if (/func\s*\(/.test (lines[i]) && (lines[i].indexOf ('{', lines[i].search (/func\s*\(/)) < 0)) {
                        return undefined;
                    }
                    offset += lines[i].length + 1;
                    i += 1;
                    expr += '\n' + lines[i];
                }
                if (depthOf (expr) !== 0) {
                    return undefined;
                }
                const indent = line.substring (0, line.length - line.trimStart ().length);
                out.push (indent + 'return ' + wrapper (expr));
                exprs.push (expr);
            } else {
                out.push (line);
            }
            offset += lines[i].length + 1;
            if (!inLiteral[offset - 1] && /func\s*\(/.test (lines[i]) && (lines[i].indexOf ('{', lines[i].search (/func\s*\(/)) < 0)) {
                return undefined; // a func literal that opens its brace on a later line
            }
        }
        return { text: out.join ('\n'), total: exprs.length, exprs: exprs };
    }

    /**
     * Retypes one generated method to `map[string]any` and - when `wrap` - rewrites every
     * function-level return through MapTyped, which is the identity on a map value, converts a
     * *sync.Map and maps anything else (including nil) to a map. Without `wrap` the body must
     * consist of exactly one `return <expr>` line whose expression satisfies `accept` (the
     * fail-closed shape check of coerceTypedStringAccessors). `accept`, when given with
     * `wrap`, must hold for every function-level return expression.
     */
    retypeGoMapMethod (content: string, receiver: string, method: string, accept: (expr: string) => boolean | undefined, wrap: boolean, goType = 'map[string]any'): string {
        // market/currency rows leave Market/SafeMarket/Currency/SafeCurrency pointer-free, so their fields read natively
        const typed = (goType === '[]any') ? 'ListTyped(' : ((GO_MARKET_ROW_METHODS.indexOf (method) >= 0) ? 'MarketTyped('
            : ([ 'Currency', 'SafeCurrency' ].indexOf (method) >= 0 ? 'CurrencyTyped(' : 'MapTyped('));
        const headRegex = new RegExp ('func\\s+\\(this \\*' + receiver + '\\)\\s+' + method + '\\(([^)]*)\\)\\s+any\\s*\\{', 'g');
        let out = '';
        let cursor = 0;
        let match = headRegex.exec (content);
        if (match === null) {
            return content;
        }
        while (match !== null) {
            const headStart = match.index;
            const open = content.indexOf ('{', headStart + match[0].length - 1);
            const close = (open < 0) ? -1 : this.goBraceClose (content, open);
            if ((open < 0) || (close < 0)) {
                return content; // unbalanced: keep the transpiled signature
            }
            const body = content.substring (open + 1, close);
            let newBody = body;
            if (wrap) {
                const scanned = this.wrapGoFunctionLevelReturns (body, (expr: string) => typed + expr + ')');
                if ((scanned === undefined) || (scanned.total === 0)) {
                    return content;
                }
                if ((accept !== undefined) && (!scanned.exprs.every (accept))) {
                    return content;
                }
                newBody = scanned.text;
            } else {
                const returns = body.match (/^[ \t]*return .*$/gm) || [];
                if ((returns.length !== 1) || (!accept (returns[0].trim ().replace (/\s+/g, ' ').replace (/^return /, '')))) {
                    return content;
                }
            }
            const head = content.substring (headStart, open);
            out += content.substring (cursor, headStart) + head.replace (/\s+any\s*$/, ' ' + goType + ' ') + '{' + newBody;
            cursor = close;
            match = headRegex.exec (content);
        }
        out += content.substring (cursor);
        return out;
    }

    /**
     * Map-returning accessors whose transpiled `any` signature hides a proven
     * `map[string]any` body (see the C3 SPECs). One row per method; a sibling unit that
     * lands the same change appends its own row to this table instead of adding a second
     * table. Fail closed: an unexpected body shape leaves the transpiled `any` signature.
     */
    coerceTypedMapAccessors (content: string): string {
        // receiver, method, accepted single-return shape, wrap-every-function-level-return
        const rows: [string, string, (expr: string) => boolean, boolean][] = [
            [ 'BaseExchange', 'Account', (expr: string) => expr.indexOf ('map[string]any{') === 0, false ],
            [ 'BaseExchange', 'ParseOrderBook', (expr: string) => expr.indexOf ('map[string]any{') === 0, false ],
            [ 'BaseExchange', 'ParseOrderBookL3', (expr: string) => expr.indexOf ('map[string]any{') === 0, false ],
            // every return path is a map: the argument is defaulted and the option-market producer is wrapped
            [ 'BaseExchange', 'Market',
              (expr: string) => (expr.indexOf ('GetValue(') === 0) || (expr === 'market') || (expr.indexOf ('this.DerivedExchange.CreateExpiredOptionMarket(') === 0),
              true ],
            // TS returns a dictionary on every path (currency panics, the safe forms build a structure)
            [ 'BaseExchange', 'Currency', (expr: string) => expr.length > 0, true ],
            [ 'BaseExchange', 'SafeCurrency', (expr: string) => expr.length > 0, true ],
            [ 'BaseExchange', 'SafeMarket', (expr: string) => expr.length > 0, true ],
        ];
        for (let i = 0; i < rows.length; i++) {
            content = this.retypeGoMapMethod (content, rows[i][0], rows[i][1], rows[i][2], rows[i][3]);
        }
        return content;
    }

    /**
     * An exchange may override one of the coerced map accessors; its transpiled copy shadows
     * the embedded base method, so it has to carry the same `map[string]any` shape or the
     * locals the classifier types against the call would not compile (the compiler resolves
     * the receiver, the classifier cannot). Every function-level return is wrapped in
     * MapTyped; the returns of nested function literals are untouched. Fail closed: an
     * unscannable body leaves the transpiled `any` signature, and a receiver that does not
     * declare the method is a no-op (the unit must then not add its classifier row).
     */
    coerceTypedMapAccessorOverrides (content: string): string {
        const rows: [string, string][] = [
            [ 'Ndax', 'ParseOrderBook' ],
            [ 'Binance', 'Market' ],
            [ 'Hyperliquid', 'Market' ],
        ];
        for (let i = 0; i < rows.length; i++) {
            content = this.retypeGoMapMethod (content, rows[i][0], rows[i][1], undefined, true);
        }
        // every exchange override of a base map accessor carries the base's map signature
        const overrides = content.match (/func\s+\(this \*\w+\)\s+(?:Currency|SafeCurrency|SafeMarket)\(/g) || [];
        for (let i = 0; i < overrides.length; i++) {
            const parts = /\*(\w+)\)\s+(\w+)\(/.exec (overrides[i]);
            content = this.retypeGoMapMethod (content, parts[1], parts[2], undefined, true);
        }
        return content;
    }

    // Tuple-helper return signatures (U28 family)
    //
    // ts/src/base/Exchange.ts declares the `[ value, params ]` helpers with a TS tuple return
    // (handleOptionAndParams/2, handleParamString/2, handleMarketTypeAndParams), which the printer
    // can only express as `any`. Every return statement of every declaration of those names —
    // BaseExchange's own bodies (HandleOptionAndParams 1, HandleOptionAndParams2 2,
    // HandleParamString 1, HandleParamString2 1, HandleMarketTypeAndParams 6) plus the two
    // exchange overrides (Okx, Deepcoin — each a single `return super.handleMarketTypeAndParams
    // (...)` delegating to the base) — already produces a Go `[]any` value, so the declared return
    // type can carry it. That is what lets the destructuring holder be a real `[]any` instead of an
    // `any` box (see CCXT_GO_ARRAY_BINDING_HOLDERS in build/go-local-types.js), the same shape
    // #30356's C# retypeDestructuringTemp gave the same holder.
    // The receiver is deliberately not restricted to *BaseExchange: Go has no virtual dispatch, so
    // an exchange that overrides one of these methods (Okx/Deepcoin do) shadows the embedded base
    // method for its own call sites — coercing the base declaration alone would leave those call
    // sites holding a `[]any` variable initialised from an `any` value (the first farm build of this
    // unit failed exactly there). The census checker for every declaration of the five names is
    // go-locals/u28-holder-gate.py (section "declarations of the five helpers"): it fails unless
    // each declaration returns []any on every path. Run it after adding a new override.
    // Nothing else moves: a `[]any` value still boxes into every `any` sink (parameter, map value,
    // AppendToArray, SafeValue/GetValue receiver), and no call site compares the result to a literal.
    coerceTupleHelperSignatures (content: string): string {
        // F04: the `[]any` retag spells the single space before `{` too
        return content.replace (/func\s+\(this \*(\w+)\)\s+(HandleOptionAndParams|HandleOptionAndParams2|HandleParamString|HandleParamString2|HandleNetworkCodeAndParams|HandleWithdrawTagAndParams|HandlePostOnly|HandleParamBool|HandleParamBool2|HandleParamInteger|HandleParamInteger2|HandleTriggerPricesAndParams|HandleTriggerDirectionAndParams)\(([^)]*)\)\s+any(\s+\{)/g, 'func (this *$1) $2($3) []any {')
            // hand-written base (exchange_market_type.go) returns the pair as two results; the
            // Okx/Deepcoin overrides only `return super...` so they carry the same results
            .replace (/func\s+\(this \*(\w+)\)\s+(HandleMarketTypeAndParams|HandleSubTypeAndParams|HandleOptionStringAndParams|HandleMarginModeAndParams)\(([^)]*)\)\s+(?:any|\[\]any)(\s+\{)/g, 'func (this *$1) $2($3) (*string, map[string]any) {')
            .replace (/func\s+\(this \*(\w+)\)\s+(HandleUntilOption)\(([^)]*)\)\s+(?:any|\[\]any)(\s+\{)/g, 'func (this *$1) $2($3) (map[string]any, map[string]any) {');
    }

    // ------------------------------------------------------------------
    // gofmt-compatible spacing of the arithmetic spliced into emitted Go
    // ------------------------------------------------------------------
    // go/printer prints a level-4/5 operator (`+ - * / % & | ^ << >>`) with a
    // blank around it only at the top level of a statement: nodes.go picks a
    // cutoff from the operator tree (walkBinary/cutoff) and drops both blanks
    // when the operator precedence is below it. The same `"a" + "b"` is therefore
    // spaced in `x := "a" + "b"` and compact in `Add(x, "a"+"b")` or `a[i+1]`.
    // gofmt tracks the level over the Go AST it prints: 1 at the start of every
    // statement, +1 for an argument list with more than one argument, +1 for an
    // index expression, -1 inside parentheses (never below 1), and back to 1 for
    // composite literal elements.
    //
    // `"\0"` is the one literal the printer cannot emit (a raw NUL byte is not
    // valid Go source), so its replacement text is spliced into Go the printer has
    // already produced and the level has to be read back from that text.
    goGofmtArithmeticDepth (content: string, index: number): number {
        // every statement is printed indented, so the enclosing top-level
        // declaration is the last line that starts in column 0
        let start = content.lastIndexOf ('\n', index - 1) + 1;
        while (start > 0) {
            const previousLineStart = content.lastIndexOf ('\n', start - 2) + 1;
            const previousLine = content.slice (previousLineStart, start - 1);
            if (previousLine.length > 0 && previousLine[0] !== ' ' && previousLine[0] !== '\t') {
                break;
            }
            start = previousLineStart;
        }
        const frames = [];
        for (let i = start; i < index; i++) {
            const char = content[i];
            if (char === '"' || char === '\'' || char === '`') {
                i = this.goSkipGoLiteral (content, i);
            } else if (char === '/' && (content[i + 1] === '/' || content[i + 1] === '*')) {
                i = this.goSkipGoComment (content, i);
            } else if (char === '(' || char === '[' || char === '{') {
                frames.push ({ kind: char, args: this.goCountFrameArgs (content, i) });
            } else if (char === ')' || char === ']' || char === '}') {
                frames.pop ();
            }
        }
        let depth = 1;
        for (let fi = 0; fi < frames.length; fi++) {
            const frame = frames[fi];
            if (frame.kind === '(') {
                // a call prints its argument list one level deeper, but only when
                // there is more than one argument
                if (frame.args > 1) {
                    depth += 1;
                }
            } else if (frame.kind === '[') {
                depth += 1;
            } else if (frame.kind === '{') {
                depth = 1;
            }
        }
        return depth;
    }

    // index of the last byte of the Go literal that starts at `index`
    goSkipGoLiteral (content: string, index: number): number {
        return goSkipLiteralText (content, index);
    }

    // index of the last byte of the comment that starts at `index`
    goSkipGoComment (content: string, index: number): number {
        return goSkipCommentText (content, index);
    }

    // number of comma separated entries between the bracket at `opener` and its
    // matching closer (strings and comments ignored); 0 when unbalanced
    goCountFrameArgs (content: string, opener: number): number {
        return goCountFrameArgsText (content, opener);
    }

    // the two-literal concatenation a `"\0"` string literal is rewritten into,
    // laid out the way gofmt would print it at the level it is spliced in
    goNulSeparatorText (content: string, index: number): string {
        const depth = this.goGofmtArithmeticDepth (content, index);
        // `"//" + "0"` is a level-4 chain over two primaries: gofmt keeps the
        // blanks at depth 1 and drops them below (cutoff() with has4 only)
        return depth > 1 ? '"//"+"0"' : '"//" + "0"';
    }

    createGoExchange(className: string, goVersion: any, ws: boolean | 'prediction' = false, typedSection = '') {
        const isPrediction = (ws === 'prediction');
        const isWs = (ws === true);
        const goImports = this.getGoImports(goVersion, isWs, isPrediction).join("\n") + "\n";
        let content = goVersion.content;
        const exchangeName = className;

        className = capitalize(className);

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
            // F04: spell the single space before `{` (see coerceGoBoolMethodReturns)
            content = content.replace (coerceRegex, '$1 <-chan any {');
        }

        content = this.coerceTypedStringAccessorOverrides (content);
        content = this.coerceStringPtrMethods (content, CCXT_GO_STRING_PTR_METHOD_NAMES, false);
        content = this.coerceTypedMapAccessorOverrides (content);
        content = coerceGoBoolMethodReturns (content, CCXT_GO_BOOL_METHOD_NAMES);
        // The destructured `[ value, params ]` helpers carry a concrete `[]any` return (see
        // coerceTupleHelperSignatures); an exchange that overrides one of them (Okx, Deepcoin)
        // shadows the embedded base method, so its own declaration has to be coerced here too.
        content = this.coerceTupleHelperSignatures (content);

        // The Safe* accessors return a typed pointer. When the printer stores that result in an
        // `any` local, later inline `local == "literal"` comparisons compare an interface holding
        // a *string against an untyped constant and are always false. Unwrap at the assignment so
        // the `any` local carries the plain value, matching every other language port.
        const derefFn = isWs ? 'ccxt.DerefScalar(' : 'DerefScalar(';
        const safeCall = 'this\\.(?:DerivedExchange\\.)?(?:Safe(?:(?:String|Integer|Number|Float|Bool)[N2-9]*|CurrencyCode|Symbol)|NumberToString|Parse8601|Iso8601|' + CCXT_GO_STRING_PTR_METHOD_NAMES.join ('|') + ')\\((?:[^()]|\\([^()]*\\))*\\)';
        content = content.replace (new RegExp ('(var \\w+ any = )(' + safeCall + ')', 'g'), ((_m: string, decl: string, call: string) => decl + derefFn + call + ')') as any);
        // A SafeBool* call compared directly to a bool literal has no local for the unwrap
        // above, and the printer emits the comparison raw -- `this.SafeBool(..) == true`.
        // That compiled while the accessor returned `any`; now it is a type error (*bool vs
        // untyped bool), so route it through IsEqual, which derefs. Same rewrite the test
        // passes apply to their call comparisons; bool family only.
        const isEqualWrap = isWs ? 'ccxt.IsEqual(' : 'IsEqual(';
        content = content.replace (new RegExp ('(this\\.SafeBool(?:2|N)?\\((?:[^()]|\\([^()]*\\))*\\)) (==|!=) (true|false)\\b', 'g'), ((_m: string, call: string, op: string, literal: string) => (op === '==') ? isEqualWrap + call + ', ' + literal + ')' : '!' + isEqualWrap + call + ', ' + literal + ')') as any);
        // ... and the same for reassignments of a local already declared `any`. A typed
        // `var x *string` local must keep its pointer, and the same name can be `any` in one
        // function and typed in another, so resolve the declaration per function body.
        content = content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => {
            const signature = fn.slice (0, fn.indexOf ('{'));
            const anyLocals = new Set ((fn.match (/var (\w+) any\b/g) || []).map ((d: string) => d.split (' ')[1]));
            // `any` parameters (and the `x := GetArg(...)` optionals) are untyped sinks too
            const paramMatches = signature.match (/(\w+) any\b/g) || [];
            for (let pi = 0; pi < paramMatches.length; pi++) {
                anyLocals.add (paramMatches[pi].split (' ')[0]);
            }
            const argMatches = fn.match (/(\w+) := GetArg\(/g) || [];
            for (let ai = 0; ai < argMatches.length; ai++) {
                anyLocals.add (argMatches[ai].split (' ')[0]);
            }
            const typedLocals = new Set ((fn.match (/var (\w+) \*\w+\b/g) || []).map ((d: string) => d.split (' ')[1]));
            if (!anyLocals.size) {
                return fn;
            }
            // DerefScalar() is only load-bearing for the reads that can see the pointer (raw
            // comparisons, stores, non-shim calls). Where every read of the local is a call to
            // a shim that derefs its own arguments, drop the wrapper the pass above added and
            // keep the pointer in the box — the shim reads the same value either way.
            const wrapLines = new Set<number> ();
            fn.split ('\n').forEach ((line, index) => {
                if (line.indexOf ('DerefScalar(') >= 0) {
                    wrapLines.add (index);
                }
            });
            const redundantWraps = goDerefWrapRedundantLocals (fn, wrapLines, anyLocals);
            fn = goUnwrapDerefWraps (fn, redundantWraps, safeCall);
            fn = fn.replace (new RegExp ('(\\n\\s*)(\\w+) = (' + safeCall + ')', 'g'), ((m: string, pre: string, name: string, call: string) => (anyLocals.has (name) && !typedLocals.has (name) && !redundantWraps.has (name)) ? pre + name + ' = ' + derefFn + call + ')' : m) as any);
            // An `any` name can still receive a typed pointer from its caller (an `any` parameter
            // fed a *string by another exchange method), so `name == "literal"` compares an
            // interface against an untyped constant and is always false. Route those via IsEqual.
            const isEqualFn = isWs ? 'ccxt.IsEqual(' : 'IsEqual(';
            fn = fn.replace (/(?<![.\w*"])(\w+) (==|!=) (("(?:[^"\\]|\\.)*")|-?\d+(?:\.\d+)?)/g, ((m: string, name: string, op: string, literal: string) => {
                if (!anyLocals.has (name) || typedLocals.has (name)) {
                    return m;
                }
                const call = isEqualFn + name + ', ' + literal + ')';
                return (op === '==') ? call : '!' + call;
            }) as any);
            // Same hazard when the right side is a helper call returning `any` (Subtract,
            // GetArrayLength, OpNeg, ...): `i == Subtract(n, 1)` compares an int against an
            // interface holding int64 and is always false.
            fn = fn.replace (/(?<![.\w*"])(\w+) (==|!=) ((?:Subtract|Add|Multiply|Divide|OpNeg|GetArrayLength|ParseInt)\((?:[^()]|\([^()]*\))*\))/g, ((m: string, name: string, op: string, call: string) => {
                if (name === 'nil' || typedLocals.has (name)) {
                    return m;
                }
                const wrapped = isEqualFn + name + ', ' + call + ')';
                return (op === '==') ? wrapped : '!' + wrapped;
            }) as any);
            // ... and when both sides are `any` names: two interfaces holding different numeric
            // kinds (int vs int64) compare unequal even when the numbers match.
            fn = fn.replace (/(?<![.\w*"])(\w+) (==|!=) (\w+)(?![\w(])/g, ((m: string, left: string, op: string, right: string) => {
                if (right === 'nil' || left === 'nil' || right === 'true' || right === 'false') {
                    return m;
                }
                if (!anyLocals.has (left) || !anyLocals.has (right) || typedLocals.has (left) || typedLocals.has (right)) {
                    return m;
                }
                const wrapped = isEqualFn + left + ', ' + right + ')';
                return (op === '==') ? wrapped : '!' + wrapped;
            }) as any);
            return fn;
        }) as any);

        // A bare `any` parameter keeps whatever the CALLER boxed: the printer's `x == nil` proof
        // is local to the function, so a typed `*T` local handed over by another method needs the
        // deref-aware helper (goParamNativeNilCompares). GetArg-bound optionals and the proven
        // locals keep the native comparison.
        content = goParamNativeNilCompares (content, isWs ? 'ccxt.IsEqual(' : 'IsEqual(');
        // ... and the same for the `any` LOCALS a pointer reaches: the printer's local proof
        // only knows a `*T`-returning helper call, not a typed local or a native `*T` parameter.
        // A prediction exchange lives in package ccxtprediction, which reaches the helper as
        // `ccxt.IsEqual` too (its generated file uses no bare form).
        content = goBoxedPointerNilCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        // ... and the same for a local boxed from a method this file types with a pointer result
        // (`var timeInForce any = this.ParseOrderTimeInForce(…)`): the printer cannot see that
        // signature, so its native `timeInForce == nil` never fires on the boxed (*string)(nil).
        content = goPointerLocalNativeNilCompares (content, isWs ? 'ccxt.IsEqual(' : 'IsEqual(');
        // typed locals compare natively (goTypedNativeNilCompares)
        content = goTypedNativeNilCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        content = goProvenParamNativeNilCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        content = goAnyLocalNativeNilCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        content = goStringLiteralNativeCompares (content, (isWs || isPrediction) ? 'ccxt.IsEqual(' : 'IsEqual(');
        content = h2kG08NativeEquality (content);
        content = goSafeBoolLiteralDefaultDeref (content);
        content = goG14TypedShapeHelpers (content, (isWs || isPrediction) ? 'ccxt.' : '');

        if (!isWs) {
            content = this.regexAll(content, [
                [/base\.(\w+)\(/gm, "this.Exchange.$1("],
                [/base\.Describe/gm, "this.Exchange.Describe"],
                [/var (precise|preciseAmount) any = /gm, "$1 := "],
                [/binaryMessage.ByteLength/gm, 'GetValue(binaryMessage, "byteLength")'], // idex tmp fix
                [/ToString\((precise\w*)\)/gm, "$1.ToString()"],
                [/<\-callDynamically/gm, '<-this.CallDynamically'],
                // bare dynamic calls (e.g. an implicit-api call pushed into a promises array)
                // are emitted without the receiver - route them through the exported helper too
                [/callDynamically\(/gm, 'this.CallDynamically('],
                [/toFixed/gm, 'ToFixed'],
                [/throwDynamicException/gm, 'ThrowDynamicException'],
                // for-loops initialized from a transpiled (any-typed) variable need a
                // numeric loop counter, e.g. `for i := startIndex;` -> `for i := int(ParseInt(startIndex));`
                [/for (\w+) := ([a-zA-Z_]\w*); /g, 'for $1 := int(ParseInt($2)); '],
            ]);
            // `"\0"` is emitted as a raw NUL byte, which is not valid Go source: splice in
            // the two-literal form instead. It lands in text the printer already produced,
            // so its blanks follow gofmt's depth rule (goGofmtArithmeticDepth). Nothing
            // below this point changes the level of the splice site, and running last means
            // the level is read off the final text.
            content = content.replace (/"\0"/gm, ((_match: string, offset: number) => this.goNulSeparatorText (content, offset)) as any); // check this later in bl3p
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
            const inheritedInstatiation = isAlias ? `new${baseClass}()` : `&${inheritedClass}{}`;
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
\tthis.${baseField} = ${exchangeStructName}{}
\tthis.${baseField}.DerivedExchange = this
\tthis.${baseField}.InitParent(userConfig, this.Describe(), this)
}\n`;
        } else {
            initMethod = `
func (this *${className}) Init(userConfig map[string]any) {
\tthis.${isWs ? 'base' : `${capitalize(baseClass)}`}.Init(this.DeepExtend(this.Describe(), userConfig))
\tthis.Itf = this
\tthis.Exchange.DerivedExchange = this
}\n`;
        }

        // the transpiled zero-arg constructor is the raw allocator (aliases/ws twins reuse it
        // before running their own Init); the public New<X>(userConfig) allocates and inits
        content = content.replace (
            new RegExp (`func New${className}\\(\\) \\*${className} \\{`),
            `func new${className}() *${className} {`
        );
        const publicCtor = [
            '',
            `func New${className}(userConfig map[string]any) *${className} {`,
            `\tp := new${className}()`,
            '\tp.Init(userConfig)',
            '\treturn p',
            '}',
            '',
        ].join('\n');

        // `content` already ends with a newline and publicCtor opens with an empty line, so the
        // plain join produced TWO blank lines before the constructor; gofmt keeps at most one
        // between declarations (go/printer linebreak nlimit).
        content = this.createGeneratedHeader().join('\n') + '\n' + content + (content.endsWith('\n') ? '' : '\n') + publicCtor + initMethod + typedSection;
        if (isPrediction) {
            // qualify everything that lives in the base ccxt package (types, helpers,
            // error constructors, the embedded Exchange struct itself, ...)
            content = this.addPackagePrefix(content, this.extractTypeAndFuncNames(EXCHANGES_FOLDER), 'ccxt');
        }
        content = g10kMiscNative (content);
        return goImports + content;
    }

    transpileDerivedExchangeFile (tsFolder: string, filename: string, options: any, goResult: any, force = false, ws: boolean | 'prediction' = false, typedSection = '') {

        const tsPath = `${tsFolder}/${filename}`;

        let { goFolder } = options;

        const extensionlessName = filename.replace ('.ts', '');
        const goFilename = filename.replace ('.ts', '.go');

        const tsMtime = fs.statSync (tsPath).mtime.getTime ();

        const go  = this.createGoExchange (extensionlessName, goResult, ws, typedSection);

        if (goFolder) {
            overwriteFileAndFolder (`${goFolder}/${goFilename}`, go);
            // fs.utimesSync (`${goFolder}/${goFilename}`, new Date (), new Date (tsMtime))
        }
    }

    // The two ws test files (go/tests/base/cache/*.go) are assembled by splitting the transpiled
    // source on its section-separator comments and re-joining the parts. Splitting on the comment
    // *text* leaves the comment's own indentation behind as a whitespace-only line, and the
    // re-join puts the comment back at column 0 — both are things gofmt undoes (it trims blank
    // lines and indents a comment to the block it introduces), so normalize them at assembly time.
    // No content change: only the indentation of the separator and the blank lines move.
    normalizeSectionSeparators (content: string, separator: string): string {
        const lines = content.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim () === separator) {
                let j = i + 1;
                while ((j < lines.length) && (lines[j].trim () === '')) {
                    j++;
                }
                const next = (j < lines.length) ? lines[j] : '';
                const indent = next.match (/^[ \t]*/);
                lines[i] = (indent ? indent[0] : '') + separator;
            } else if (lines[i].trim () === '') {
                lines[i] = '';
            }
        }
        return lines.join ('\n');
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsOrderbookTestsToGo (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.orderBook.ts';
        const goFile = `${outDir}/cache/orderbook.go`;

        if (skipUpToDateStage ('go', 'ws orderbook test', force, testStageInputs (), [ goFile ])) {
            return;
        }

        log.magenta ('Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        const separator = '// --------------------------------------------------------------------------------------------------------------------';
        const splitParts = content.split(separator);
        splitParts.shift();
        content = splitParts.join('\n' + separator + '\n');
        content = this.normalizeSectionSeparators (content, separator);
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
        ].join('\n') + '\n';

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    // ---------------------------------------------------------------------------------------------
    transpileWsCacheTestsToGo (outDir: string, force = true) {

        const jsFile = './ts/src/pro/test/base/test.cache.ts';
        const goFile = `${outDir}/cache/cache.go`;

        if (skipUpToDateStage ('go', 'ws cache test', force, testStageInputs (), [ goFile ])) {
            return;
        }

        log.magenta ('Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        const separator = '// ----------------------------------------------------------------------------';
        const splitParts = content.split(separator);
        splitParts.shift();
        content = splitParts.join('\n' + separator + '\n');
        content = this.normalizeSectionSeparators (content, separator);
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
        ].join('\n') + '\n';

        log.magenta ('→', (goFile as any).yellow);

        overwriteFileAndFolder (goFile, file);
    }

    // ---------------------------------------------------------------------------------------------

    transpileCryptoTestsToGo (outDir: string, force = true) {

        const jsFile = './ts/src/test/base/test.cryptography.ts';
        const goFile = `${outDir}/test.cryptography.go`;

        if (skipUpToDateStage ('go', 'crypto test', force, testStageInputs (), [ goFile ])) {
            return;
        }

        log.magenta ('[go] Transpiling from', (jsFile as any).yellow);

        const go = this.transpiler.transpileGoByPath(jsFile);
        let content = go.content;
        content = this.regexAll (content, [
            [ /Newccxt.Exchange.+\n.+\n.+/gm, 'ccxt.Exchange{}' ],
            [ /func Equals\(.+\n.*\n.*\n.*}/gm, '' ], // remove equals
        ]).trim ();

        const file = [
            'package base',
            '',
            this.createGeneratedHeader().join('\n'),
            content,
        ].join('\n') + '\n';

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

    async transpileBaseTestsToGo (force = true) {
        const outDir = BASE_TESTS_FOLDER;
        await this.transpileBaseTests(outDir, force);
        this.transpileCryptoTestsToGo(outDir, force);
        this.transpileWsOrderbookTestsToGo(outDir, force);
        this.transpileWsCacheTestsToGo(outDir, force);
    }

    async transpileBaseTests (outDir: string, force = true) {

        const baseFolders = {
            ts: './ts/src/test/base',
        };

        const baseFunctionTests = fs.readdirSync (baseFolders.ts).filter(filename => filename.endsWith('.ts')).map(filename => filename.replace('.ts', ''));
        // `// NO_AUTO_TRANSPILE` sources are emitted by their own stage (test.cryptography)
        const eligible = baseFunctionTests.filter ((testName: string) => !fs.readFileSync (`${baseFolders.ts}/${testName}.ts`).toString ().includes ('// NO_AUTO_TRANSPILE'));
        // the accumulator feeds createFunctionsMapFile(), which rewrites the whole FunctionsMap —
        // it must see every test name even when the transpile below is skipped, otherwise the map
        // silently loses entries and the Go harness stops running those tests
        eligible.forEach ((testName: string) => goTests.push (capitalize (testName)));

        if (skipUpToDateStage ('go', 'base tests', force, testStageInputs (), eligible.map ((testName: string) => `${outDir}/${testName}.go`))) {
            return;
        }

        // route the ~61 sources through the worker pool instead of transpiling them one by
        // one on the main thread: `paths` doubles as the sticky ts.Program root list, so the
        // whole stage shares one program (same shape as the C# driver's base-test stage)
        const paths = eligible.map ((testName: string) => `${baseFolders.ts}/${testName}.ts`);
        const transpiled = await this.webworkerTranspile (paths, this.getTranspilerConfig ());

        for (let i = 0; i < eligible.length; i++) {
            const testName = eligible[i];
            const tsFile = paths[i];

            // const goFileName = capitalize(testName.replace ('test.', ''));
            const goFile = `${outDir}/${testName}.go`;

            log.magenta ('Transpiling from', (tsFile as any).yellow);

            const go = transpiled[i];
            let content = go.content;
            content = this.regexAll (content, [
                // the three statements this rewrite packs onto one line are exactly what gofmt
                // splits back out (one statement per line), so emit the split form at the
                // statement's own indentation — same tokens, gofmt-identical layout
                [/(\w+) := NewCcxt\.Exchange\(([\S\s]+?)\)/gm, (match: string, varName: string, args: string, offset: number, whole: string) => {
                    const indent = statementIndent (whole, offset);
                    return `${varName} := ccxt.NewExchange().(*ccxt.Exchange)\n${indent}${varName}.DerivedExchange = ${varName}\n${indent}${varName}.InitParent(${args}, map[string]any{}, ${varName})`;
                }],
                // instantiate the core type (channel-based methods, implements ICoreExchange) and let
                // Init wire up DerivedExchange/InitParent (Exchange above is the only special case)
                [/(\w+) := NewCcxt\.(\w+)\(([\S\s]+?)\)/gm, (match: string, varName: string, className: string, args: string, offset: number, whole: string) => {
                    const indent = statementIndent (whole, offset);
                    return `${varName} := ccxt.New${className}Core()\n${indent}${varName}.Init(${args})`;
                }],
                [/exchange any, /g,'exchange *ccxt.Exchange, '], // in arguments
                [/ any(?= \= map\[string\]any )/g, ' map[string]any'], // fix incorrect variable type
                [ /any\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
                [/Precise\.String/gm, 'ccxt.Precise.String'],
                // Base-test helpers and the Safe* accessors return `any`/typed pointers, so the
                // printer's inlined `call == literal` is either a compile error or an
                // interface-vs-untyped-constant mismatch that is always false. Route the whole
                // family (Safe*, PrecisionFromString, Crc32, Rsa, Jwt, ...) back through IsEqual.
                [/(?<![.\w])((?:exchange\.)?[A-Z]\w*\((?:[^()]|\([^()]*\))*\)) == (("(?:[^"\\]|\\.)*")|(?:ccxt\.)?OpNeg\([^()]*\)|-?\d+(?:\.\d+)?)/g, 'IsEqual($1, $2)'],
                // SafeBool* now return `*bool` (the pointer layer): an `any` local that
                // captures the call must keep holding the plain value, exactly as it did before
                // that change, because test code compares such locals against untyped bool
                // constants (`local != true`) -- always true for an interface holding a *bool.
                // Mirrors the DerefScalar() wrap the exchange-body pass applies to this.SafeBool*.
                [/(var \w+ any = )(exchange\.Safe(?:Bool|String(?:Lower|Upper)?|Integer(?:Product)?|Timestamp|Float|Number)(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1ccxt.DerefScalar($2)'],
                [ /testSharedMethods\./gm, '' ], // no need of class reference
                [ /func Equals\(.+\n.*\n.*\n.*\}/gm, '' ], // remove equals
                // the markers sit inside `// ` comments: drop the marker text and the space
                // the comment left in front of it, so no `// ` trailing-space line survives
                [ /[ \t]*\@SKIP_START_GO[\s\S]*?\@SKIP_END_GO/gm, '' ],
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
                // gofmt always separates the package clause from the next declaration by one blank
                // line (also when that declaration is the import clause); the import clause itself
                // is only present for the auto-transpiled tests (tests.init has none, and then the
                // single '' above is already the blank line before the generated-header comment)
                '',
                ...(testName.indexOf ('tests.init') === -1 ? [ 'import ccxt "github.com/ccxt/ccxt/go/v4"', '' ] : []),
                this.createGeneratedHeader().join('\n'),
                content,
            ].join('\n') + '\n';

            log.magenta ('→', (goFile as any).yellow);

            overwriteFileAndFolder (goFile, file);
        }
    }

    transpileMainTest(files: any) {
        log.magenta ('[go] Transpiling from', files.tsFile.yellow);
        let ts = fs.readFileSync (files.tsFile).toString ();

        ts = this.regexAll (ts, [
            [ /\'use strict\';?\s+/g, '' ],
            // the Go harness stores this field as an untyped `any` (it also appends to it), so
            // rewrite the annotation in the SOURCE: rewriting the printed `[]any` instead would
            // land after the printer has already aligned the struct fields (go/printer pads the
            // type column of the tag-carrying fields) and leave the padding stale.
            [ /onlySpecificTests: string\[\]/g, 'onlySpecificTests: any' ],
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
            [/exchange\.(CreateOrder|CancelOrder|FetchL2OrderBook|FetchPositions|FetchTicker|FetchTickers|WatchTicker|WatchTickers|FetchOpenOrders|EditOrder|FetchOrder|CancelOrderWithClientOrderId|CancelOrdersWithClientOrderIds|EditOrderWithClientOrderId|FetchOrderWithClientOrderId|FetchBidsAsks|WatchBidsAsks|WatchOrderBookForSymbols|WatchPosition|WatchTradesForSymbols)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('],
            [/exchange\.(FetchTrades|FetchOrders|FetchClosedOrders|FetchOHLCV)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('], // W28
            [/exchange\.(FetchTradingFee|FetchMyTrades|CreateOrders|CancelOrders|WatchMyTrades|WatchOHLCV|WatchOrders|WatchPositions|WatchTrades|FetchOrderBook|FetchStatus)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('], // W3+W4
            GO_TEST_ANY_RECEIVE_REGEX,
            // SafeBool* now return `*bool` (the pointer layer): an `any` local that captures
            // the call must keep holding the plain value, exactly as it did before that change,
            // because test code compares such locals against untyped bool constants
            // (`local != true`) -- always true for an interface holding a *bool. Mirrors the
            // DerefScalar() wrap the exchange-body pass applies to this.SafeBool*.
            [/(var \w+ any = )(exchange\.Safe(?:Bool|String(?:Lower|Upper)?|Integer(?:Product)?|Timestamp|Float|Number)(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1ccxt.DerefScalar($2)'],
            // the (?!=) guard keeps the assignment rewrite off == comparisons
            [/exchange\.(\w+)\s*=(?!=)\s*(.+)/g, 'exchange.Set$1($2)'],
            [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
            [/InitOfflineExchange\(exchangeName any, optionalArgs \.\.\.any\) any\s+{/g, 'InitOfflineExchange(exchangeName any, optionalArgs ...any) ccxt.ICoreExchange {'],
            [/assert\(/g, 'Assert('],
            [ /any\sfunc\sEquals.+\n.*\n.+\n.+/gm, '' ], // remove equals
        ]);

        const file = [
            'package base',
            // gofmt always separates the package clause from the import clause by one blank line
            '',
            'import ccxt "github.com/ccxt/ccxt/go/v4"',
            '',
            this.createGeneratedHeader().join('\n'),
            contentIndentend,
        ].join('\n');

        overwriteFileAndFolder (files.goFile, file);
    }

    async transpileExchangeTests(force = true){
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
        // push before the gate: createFunctionsMapFile() rewrites the whole map from this
        // accumulator, so a skipped stage must still contribute its names
        testNames.forEach (test => goTests.push(test));

        if (skipUpToDateStage ('go', 'exchange tests', force, testStageInputs (), [ BASE_TESTS_FILE ].concat (tests.map ((t: any) => t.goFile)))) {
            return;
        }

        const baseTestsOnly = process.argv.includes ('--baseTests');
        if (baseTestsOnly) return;

        // remove above later debug only
        this.transpileMainTest({
            'tsFile': './ts/src/test/tests.ts',
            'goFile': BASE_TESTS_FILE,
        });
        await this.transpileAndSaveGoExchangeTests (tests);
    }

    async transpileWsExchangeTests(force = true){

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

        if (skipUpToDateStage ('go', 'ws exchange tests', force, testStageInputs (), tests.map ((t: any) => t.goFile))) {
            return;
        }

        const baseTestsOnly = process.argv.includes ('--baseTests');
        if (baseTestsOnly) return;
        await this.transpileAndSaveGoExchangeTests (tests, true);
    }

    async transpileAndSaveGoExchangeTests(tests: any[], isWs = false) {
        let paths = tests.map(test => test.tsFile);
        // paths = [paths[30]];
        const flatResult = await this.webworkerTranspile (paths,  this.getTranspilerConfig());
        flatResult.forEach((file, idx) => {
            // the transpiled base tests are top-level funcs: gofmt puts them in column 0, so no
            // indentation prefix is applied here (the old 4-space one was stripped by gofmt)
            let contentIndentend = file.content;

            let regexes = [
                [/exchange := (?:&)?ccxt\.Exchange\{\}/g, 'exchange := ccxt.NewExchange()'],
                [/exchange := (?:&)?ccxt\.Coinbase\{\}/g, 'exchange := ccxt.NewCoinbase()'],
                [/exchange any([,)])/g, 'exchange ccxt.ICoreExchange$1'],
                // 62 symbol-based methods trimmed from ICoreExchange → assert to the per-method interface
                // (ccxt.I<Method>) for exactly the method called, so a prediction venue that overrides
                // only some of them satisfies each has-gated per-method assertion it actually runs.
                [/exchange\.(CreateOrder|CancelOrder|FetchL2OrderBook|FetchPositions|FetchTicker|FetchTickers|WatchTicker|WatchTickers|FetchOpenOrders|EditOrder|FetchOrder|CancelOrderWithClientOrderId|CancelOrdersWithClientOrderIds|EditOrderWithClientOrderId|FetchOrderWithClientOrderId|FetchBidsAsks|WatchBidsAsks|WatchOrderBookForSymbols|WatchPosition|WatchTradesForSymbols)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('],
                [/exchange\.(FetchTrades|FetchOrders|FetchClosedOrders|FetchOHLCV)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('], // W28
                [/exchange\.(FetchTradingFee|FetchMyTrades|CreateOrders|CancelOrders|WatchMyTrades|WatchOHLCV|WatchOrders|WatchPositions|WatchTrades|FetchOrderBook|FetchStatus)(Async)?\(/g, 'exchange.(ccxt.I$1).$1$2('], // W3+W4
                GO_TEST_ANY_RECEIVE_REGEX,
                // SafeBool* now return `*bool` (the pointer layer): an `any` local that
                // captures the call must keep holding the plain value, exactly as it did before
                // that change, because these tests compare such locals against untyped bool
                // constants (`local != true`) -- always true for an interface holding a *bool.
                // Mirrors the DerefScalar() wrap the exchange-body pass applies to this.SafeBool*.
                [/(var \w+ any = )(exchange\.Safe(?:Bool|String(?:Lower|Upper)?|Integer(?:Product)?|Timestamp|Float|Number)(?:2|N)?\((?:[^()]|\([^()]*\))*\))/g, '$1ccxt.DerefScalar($2)'],
                [/testSharedMethods\./g, ''], // no need of class reference
                [/assert/gm, 'Assert'],
                [/exchange\.(\w+)\s*=(?!=)\s*(.+)/g, 'exchange.Set$1($2)'],
                [/exchange\.(\w+)(,|;|\)|\s)/g, 'exchange.Get$1()$2'],
                [/Precise\./gm, 'ccxt.Precise.'],
                // the spawned helper is an async test function, i.e. a suffixed channel trampoline
                [/Spawn\(createOrderAfterDelay/g, `Spawn(CreateOrderAfterDelay${GO_ASYNC_SUFFIX}`],
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

            if (isWs) {
                // add ws-tests specific regeces
                regexes = regexes.concat([
                    [/await exchange.watchOrderBook\(symbol\)/g, '((IOrderBook)(await exchange.watchOrderBook(symbol))).Copy()'],
                    [/await exchange.watchOrderBookForSymbols\((.*?)\)/g, '((IOrderBook)(await exchange.watchOrderBookForSymbols($1))).Copy()'],
                ]);
            }

            contentIndentend = this.regexAll (contentIndentend, regexes);
            const namespace = 'package base';
            let imports = 'import "github.com/ccxt/ccxt/go/v4"';
            const fmtImport = contentIndentend.indexOf('fmt.Println') > -1 ? 'import "fmt"' : '';
            imports = [imports, fmtImport].filter(x => x).join('\n');
            const fileHeaders = [
                namespace,
                // gofmt always separates the package clause from the import clause by one blank line
                '',
                imports,
                '',
                this.createGeneratedHeader().join('\n'),
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

    async transpileTests(force = true){
        if (!shouldTranspileTests) {
            log.bright.yellow ('Skipping tests transpilation');
            return;
        }
        // every stage is awaited: the test writers are async (they go through the pool),
        // and letting them float meant `transpileEverything` returned — and the WS stage
        // started — while ~80 test files were still being printed, so three root sets
        // alternated against the worker sticky-Program LRU
        await this.transpileBaseTestsToGo(force);
        await this.transpileExchangeTests(force);
        await this.transpileWsExchangeTests(force);
        this.createFunctionsMapFile(force);
    }

    createFunctionsMapFile(force = true) {
        // derived purely from the test source listings collected above
        if (skipUpToDateStage ('go', 'functions map file', force, testStageInputs (), [ `${BASE_TESTS_FOLDER}/test.functions.go` ])) {
            return;
        }
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

        // an async test transpiles to `Test<Name>Async` (channel-returning); the map keeps the
        // unified method name as key and points at whichever symbol the test file declares
        const goTestSymbol = (test: string, methodName: string): string => {
            const goFile = `${BASE_TESTS_FOLDER}/test.${methodName}.go`;
            if (fs.existsSync (goFile) && fs.readFileSync (goFile, 'utf8').includes (`func ${test}${GO_ASYNC_SUFFIX}(`)) {
                return test + GO_ASYNC_SUFFIX;
            }
            return test;
        };
        const file = [
            'package base',
            '',
            this.createGeneratedHeader().join('\n'),
            'var FunctionsMap = map[string]any{',
            // F09 — gofmt aligns the value of every consecutive single-line entry of a
            // composite literal to the widest key of the run (go/printer exprList +
            // text/tabwriter); route these hand-written entries through the same rule the
            // ast printer uses, so the column comes out where gofmt would put it. The
            // entries carry no comma: alignGoCompositeEntries renders it.
            ...this.transpiler.goTranspiler.alignGoCompositeEntries (normalizedTestNames.map((test,i) => `\t"${normalizedFunctionNames[i]}": ${goTestSymbol (test, normalizedFunctionNames[i])}`)),
            '}',
            '',
            'var WsFunctionsMap = map[string]any{',
            ...this.transpiler.goTranspiler.alignGoCompositeEntries (normalizedWsTestNames.map((test,i) => `\t"${normalizedWsFunctionNames[i]}": ${goTestSymbol (test, normalizedWsFunctionNames[i])}`)),
            '}',
        ].join('\n') + '\n';
        overwriteFileAndFolder (`${BASE_TESTS_FOLDER}/test.functions.go`, file);
    }

    transpileProTypes(force = true) {
        const GO_TYPES_FILE = "./go/v4/exchange_types.go";
        const GO_TYPES_FILE_PRO = "./go/v4/pro/exchange_types.go";

        // mirrors the hand-written go/v4/exchange_types.go into the pro package
        if (skipUpToDateStage ('go', 'pro types', force, [ GO_TYPES_FILE ], [ GO_TYPES_FILE_PRO ])) {
            return;
        }

        const output: string[] = [
            'package ccxtpro',
            '',
            'import ccxt "github.com/ccxt/ccxt/go/v4"',
            '',
            ...this.createGeneratedHeader().filter (line => line !== ''),
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

        fs.writeFileSync(GO_TYPES_FILE_PRO, formatGoSource(GO_TYPES_FILE_PRO, normalizeGoFileHeader (alignGoTrailingComments(output.join("\n")) + "\n")), "utf8");
    }
    
}

// Module-level accumulators that a fresh process used to zero for us. --rest-and-ws runs
// both stages in ONE process, so the ws stage must start from the same blank slate the
// second `goTranspiler.ts --ws` process had — otherwise safeOptionsStructFile() dumps the
// REST structs into go/v4/pro/exchange_wrapper_structs.go as well.
function resetPerStageAccumulators () {
    for (const k of Object.keys (goTypeOptions)) {
        delete goTypeOptions[k];
    }
    baseGoTypeOptionNames.clear ();
    predictionLocalOptionStructs.clear ();
}

// ===== Local-typing audit (`--audit-local-types`) =====
//
// The go-locals campaign's shippable gate; mirrors build/javaTranspiler.ts `--audit-string-types`.
//
//   1. census: declarations / any / typed over go/v4 — the numbers census.sh prints — plus the
//      typed breakdown by declared type and the remaining `any` declarations grouped by the
//      callee of their initializer, so the untouched clusters stay visible;
//   2. declaration-diff gate: every line that changed in a GENERATED go/v4 file, with gofmt
//      normalization applied to BOTH sides first, must pair with a removed line as a declaration
//      retype (same var name, same initializer modulo `derefScalar(...)` wrappers — the
//      pointer-transparency wrapper the Safe*/arith shims take). Anything else is `other` and
//      fails the run. Normalizing with gofmt is what makes the gate usable on this tree: the
//      base commit regenerated its go files without gofmt, so a correct reindent of a whole file
//      is invisible here — and unlike a whitespace-insensitive text diff it cannot hide a
//      semantic edit inside a string literal;
//   3. `--parity [id...]`: proves build/go-worker.ts (Piscina) and the main-thread path emit
//      byte-identical Go for typed locals. Per file, the main-thread `transpileGoByPath` output
//      is compared against the worker's `createProgramBatch` output across two pool shapes
//      (1 and 2 threads), and a negative control — the same printer with the ccxt hook NOT
//      installed — must emit untyped declarations for the same file, or the comparison would
//      prove nothing about the hook being live on both sides.
//
//   npx tsx build/goTranspiler.ts --audit-local-types [--base <ref>] [--target <ref>] [--json]
//   npx tsx build/goTranspiler.ts --audit-local-types --parity [id...] [--roots-all]
//   npx tsx build/goTranspiler.ts --audit-local-types --self-test

const LOCAL_AUDIT_SCOPE = 'go/v4';
const LOCAL_AUDIT_GEN_MARKER = 'PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED';
// census shapes, byte-for-byte the ones census.sh greps for
const LOCAL_AUDIT_CENSUS_DECL_RX = /^\s+var [A-Za-z0-9_]+ [^=]+= /;
const LOCAL_AUDIT_CENSUS_ANY_RX = /^\s+var [A-Za-z0-9_]+ any = /;
const LOCAL_AUDIT_CENSUS_TYPE_RX = /^\s+var [A-Za-z0-9_]+ ([^=]+) = /;
// one declaration, parsed: `var <name> <type> = <init>` (no Go type contains '=')
const LOCAL_AUDIT_DECL_RX = /^(\s*)var\s+([A-Za-z_][A-Za-z0-9_]*)\s+([^=]+?)\s*=\s*(.*)$/;

function localAuditRun (cmd: string, args: string[], input?: string) {
    const res = spawnSync (cmd, args, { 'input': input, 'encoding': 'utf8', 'maxBuffer': 256 * 1024 * 1024, 'windowsHide': true });
    return { 'status': res.status, 'error': res.error, 'stdout': res.stdout ?? '', 'stderr': res.stderr ?? '' };
}

const localAuditGit = (repo: string, args: string[]) => localAuditRun ('git', [ '-C', repo, ...args ]);

// null when gofmt is missing or the text does not parse as Go
function localAuditGofmt (text: string) {
    const res = localAuditRun ('gofmt', [], text);
    if (res.error || res.status !== 0) {
        return null;
    }
    return res.stdout;
}

// whitespace outside string literals is the only thing gofmt moves: dropping it compares two
// lines for semantic identity without caring about indentation or gofmt's key alignment
function localAuditStripWs (s: string) {
    let out = '';
    let quote = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (quote) {
            out += c;
            if (c === '\\' && quote !== '`') { out += s[++i] ?? ''; continue; }
            if (c === quote) { quote = ''; }
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { quote = c; out += c; continue; }
        if (c === ' ' || c === '\t' || c === '\r') { continue; }
        out += c;
    }
    return out;
}

// `derefScalar(<balanced>)` / `DerefScalar(<balanced>)` -> `<balanced>`, repeatedly: the no-op
// unwrap a typed local forces on its initializer (or that a retyped local no longer needs, when
// the family removes the wrapper the `any` form carried). Leaves anything not balanced alone.
const LOCAL_AUDIT_DEREF_NAMES = [ 'derefScalar(', 'DerefScalar(' ];
function localAuditStripDeref (s: string) {
    for (;;) {
        let at = -1, open = '';
        for (const name of LOCAL_AUDIT_DEREF_NAMES) {
            const idx = s.indexOf (name);
            if (idx !== -1 && (at === -1 || idx < at)) { at = idx; open = name; }
        }
        if (at === -1) { return s; }
        let depth = 1, i = at + open.length, closed = -1;
        for (; i < s.length; i++) {
            const c = s[i];
            if (c === '"' || c === "'" || c === '`') {
                const q = c; i++;
                while (i < s.length && s[i] !== q) { if (s[i] === '\\') { i++; } i++; }
                continue;
            }
            if (c === '(') { depth++; }
            else if (c === ')') { depth--; if (depth === 0) { closed = i; break; } }
        }
        if (closed === -1) { return s; }
        s = s.slice (0, at) + s.slice (at + open.length, closed) + s.slice (closed + 1);
    }
}

const localAuditInitNorm = (s: string) => localAuditStripWs (localAuditStripDeref (s));

// 'format'  — same line up to whitespace/gofmt alignment
// 'declaration' — same var name, same initializer, declared type token changed
// 'coercion' — differs only by derefScalar(...) wrappers somewhere on the line
// 'other' — anything else: fails the gate
function localAuditPairKind (removed: string, added: string) {
    if (localAuditStripWs (removed) === localAuditStripWs (added)) { return 'format'; }
    const r = removed.match (LOCAL_AUDIT_DECL_RX);
    const a = added.match (LOCAL_AUDIT_DECL_RX);
    if (r && a && r[2] === a[2] && localAuditInitNorm (r[4]) === localAuditInitNorm (a[4])) {
        return (r[3].trim () === a[3].trim ()) ? 'format' : 'declaration';
    }
    if (localAuditInitNorm (removed) === localAuditInitNorm (added)) { return 'coercion'; }
    return 'other';
}

function localAuditInitKey (init: string) {
    const v = init.trim ();
    let m = v.match (/^\(<-(this\.[A-Za-z0-9_]+)\(/);
    if (m) { return `await ${m[1]}`; }
    m = v.match (/^([A-Za-z_][A-Za-z0-9_.]*)\(/);
    if (m) { return `${m[1]}(`; }
    if (/^"[^"]*"$/.test (v)) { return '"strlit"'; }
    if (/^[0-9]+$/.test (v)) { return 'intlit'; }
    if (/^(true|false)$/.test (v)) { return 'boollit'; }
    if (/^nil$/.test (v)) { return 'nil'; }
    return v.length > 40 ? v.slice (0, 40) + '...' : v;
}

function localAuditCensus (dir: string, recursive = false) {
    const out: any = { 'dir': dir, 'files': 0, 'declarations': 0, 'any': 0, 'typed': 0, 'byType': {} as Record<string, number>, 'anyByInit': {} as Record<string, number>, 'derefScalar': 0, 'derefScalarExported': 0 };
    if (!fs.existsSync (dir)) { return out; }
    const bump = (map: Record<string, number>, key: string) => { map[key] = (map[key] ?? 0) + 1; };
    const visit = (d: string) => {
        for (const e of fs.readdirSync (d, { 'withFileTypes': true })) {
            const p = path.join (d, e.name);
            if (e.isDirectory ()) { if (recursive) { visit (p); } continue; }
            if (!e.isFile () || !e.name.endsWith ('.go')) { continue; }
            out.files++;
            const text = fs.readFileSync (p, 'utf8');
            out.derefScalar += text.split ('derefScalar(').length - 1;
            out.derefScalarExported += text.split ('DerefScalar(').length - 1;
            for (const line of text.split ('\n')) {
                if (!LOCAL_AUDIT_CENSUS_DECL_RX.test (line)) { continue; }
                out.declarations++;
                const decl = line.match (LOCAL_AUDIT_DECL_RX);
                if (LOCAL_AUDIT_CENSUS_ANY_RX.test (line)) {
                    out.any++;
                    bump (out.anyByInit, decl ? localAuditInitKey (decl[4]) : line.trim ());
                    continue;
                }
                out.typed++;
                const tm = line.match (LOCAL_AUDIT_CENSUS_TYPE_RX);
                bump (out.byType, tm ? tm[1].trim () : '?');
            }
        }
    };
    visit (dir);
    return out;
}

function localAuditParseHunks (diffText: string) {
    const hunks: any[] = [];
    let hunk: any = null, newLine = 0;
    for (const raw of diffText.split ('\n')) {
        if (raw.startsWith ('@@')) {
            const m = raw.match (/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            newLine = m ? parseInt (m[1], 10) : 0;
            hunk = { 'removed': [], 'added': [] };
            hunks.push (hunk);
            continue;
        }
        if (!hunk) { continue; }
        if (raw.startsWith ('+')) { hunk.added.push ({ 'text': raw.slice (1), 'line': newLine }); newLine++; }
        else if (raw.startsWith ('-')) { hunk.removed.push ({ 'text': raw.slice (1) }); }
        else if (raw.startsWith (' ')) { newLine++; }
    }
    return hunks;
}

function localAuditDiffAudit (repo: string, base: string, target: string | null, scope: string) {
    const report: any = { 'scope': scope, 'base': base, 'target': target, 'files': [], 'skippedHandwritten': [], 'gofmtMissing': false, 'totals': { 'declaration': 0, 'coercion': 0, 'format': 0, 'other': 0 } };
    const nameArgs = [ 'diff', '--name-only', '--diff-filter=AM', base ];
    if (target) { nameArgs.push (target); }
    nameArgs.push ('--', scope);
    const names = localAuditGit (repo, nameArgs).stdout.split ('\n').map ((x) => x.trim ()).filter ((x) => x.length);
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'go-local-audit-'));
    try {
        for (const file of names) {
            const readSide = (ref: string | null) => {
                if (ref) {
                    const res = localAuditGit (repo, [ 'show', `${ref}:${file}` ]);
                    return res.status === 0 ? res.stdout : null;
                }
                try { return fs.readFileSync (path.join (repo, file), 'utf8'); } catch (e) { return null; }
            };
            const before = readSide (base), after = readSide (target);
            if (!(after ?? before ?? '').includes (LOCAL_AUDIT_GEN_MARKER)) { report.skippedHandwritten.push (file); continue; }
            const fmtBefore = before === null ? '' : localAuditGofmt (before);
            const fmtAfter = after === null ? '' : localAuditGofmt (after);
            const rec: any = { 'path': file, 'declaration': 0, 'coercion': 0, 'format': 0, 'other': 0, 'otherLines': [] };
            if ((before !== null && fmtBefore === null) || (after !== null && fmtAfter === null)) {
                // a generated go file must parse; gofmt missing would silently weaken the gate
                if (localAuditRun ('gofmt', [], 'package x\n').error) { report.gofmtMissing = true; }
                rec.other++;
                report.totals.other++;
                rec.otherLines.push ('gofmt could not normalize ' + ((before !== null && fmtBefore === null) ? 'the base' : 'the target') + ' revision (missing gofmt or invalid go)');
                report.files.push (rec);
                continue;
            }
            const beforePath = path.join (tmp, 'before.go'), afterPath = path.join (tmp, 'after.go');
            fs.writeFileSync (beforePath, fmtBefore ?? '');
            fs.writeFileSync (afterPath, fmtAfter ?? '');
            const diff = localAuditRun ('git', [ 'diff', '--no-index', '--no-color', '-U0', '--', beforePath, afterPath ]);
            for (const h of localAuditParseHunks (diff.stdout)) {
                const unusedR: number[] = h.removed.map ((_: any, i: number) => i);
                for (const a of h.added) {
                    let ri = unusedR.find ((r) => localAuditPairKind (h.removed[r].text, a.text) === 'format');
                    if (ri === undefined) { ri = unusedR.find ((r) => localAuditPairKind (h.removed[r].text, a.text) === 'declaration'); }
                    if (ri === undefined) { ri = unusedR.find ((r) => localAuditPairKind (h.removed[r].text, a.text) === 'coercion'); }
                    if (ri === undefined) {
                        rec.other++;
                        report.totals.other++;
                        rec.otherLines.push ('+ ' + a.text);
                        continue;
                    }
                    const kind = localAuditPairKind (h.removed[ri].text, a.text);
                    unusedR.splice (unusedR.indexOf (ri), 1);
                    rec[kind]++;
                    report.totals[kind]++;
                    if (kind === 'other') { rec.otherLines.push ('- ' + h.removed[ri].text + '\n    + ' + a.text); }
                }
                for (const ri of unusedR) {
                    rec.other++;
                    report.totals.other++;
                    rec.otherLines.push ('- ' + h.removed[ri].text);
                }
            }
            report.files.push (rec);
        }
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return report;
}

// every declaration in `content` whose initializer callee is a ccxt hook callee AND whose
// declared type matches what the hook table promises — 0 with the hook uninstalled
function localAuditHookTypedCount (content: string) {
    let n = 0;
    for (const line of content.split ('\n')) {
        const m = line.match (LOCAL_AUDIT_DECL_RX);
        if (!m) { continue; }
        const type = m[3].trim (), init = m[4].trim ();
        const open = init.indexOf ('(');
        if (open <= 0) { continue; }
        const callee = init.substring (0, open);
        if ((CCXT_GO_HELPER_RETURN_TYPES as any)[callee] === type) { n++; }
    }
    return n;
}

function localAuditEmitStats (content: string) {
    let anyCount = 0, total = 0;
    for (const line of content.split ('\n')) {
        if (!LOCAL_AUDIT_CENSUS_DECL_RX.test (line)) { continue; }
        total++;
        if (LOCAL_AUDIT_CENSUS_ANY_RX.test (line)) { anyCount++; }
    }
    return { 'declarations': total, 'any': anyCount, 'typed': total - anyCount, 'hookTyped': localAuditHookTypedCount (content) };
}

const LOCAL_AUDIT_PARITY_DEFAULT_IDS = [ 'cryptomus', 'bitflyer', 'gemini', 'alpaca' ];

// first differing line between two emits, for the failure diagnostics
function localAuditFirstDiff (x: string, y: string) {
    const xs = x.split ('\n'), ys = y.split ('\n');
    for (let i = 0; i < Math.max (xs.length, ys.length); i++) {
        if (xs[i] !== ys[i]) {
            return `L${i + 1}: ${JSON.stringify ((xs[i] ?? '<eof>').slice (0, 120))} vs ${JSON.stringify ((ys[i] ?? '<eof>').slice (0, 120))}`;
        }
    }
    return '';
}

async function runLocalTypeParity (ids: string[], rootsAll: boolean) {
    const files = ids.map ((id) => `ts/src/${id}.ts`);
    const missing = files.filter ((f) => !fs.existsSync (f));
    if (missing.length) {
        console.error ('local-type parity: no such ts source(s): ' + missing.join (', '));
        process.exit (1);
    }
    const config = new NewTranspiler ().getTranspilerConfig ();
    const configKey = JSON.stringify (config);
    // the stage list the worker's sticky ts.Program is built over: a scoped CLI run passes the
    // exchange files it is transpiling, a full build passes the whole stage
    const roots = rootsAll ? exchangeIds.map ((id: string) => `ts/src/${id}.ts`) : files;

    // main-thread path: exactly what transpileDerivedExchangeFiles does for one file
    const driver = new NewTranspiler ();
    const main = files.map ((f) => driver.transpiler.transpileGoByPath (f));

    // piscina path: build/go-worker.ts, one task per file, the same payload webworkerTranspile sends
    const runPool = async (maxThreads: number) => {
        const pool = new Piscina ({ 'filename': resolve (__dirname, 'go-worker.ts'), maxThreads });
        try {
            const tasks = files.map ((f) => pool.run ({ 'transpilerConfig': config, 'configKey': configKey, 'roots': roots, 'files': [ f ] }));
            const results = await Promise.all (tasks);
            return results.map ((r: any) => (r.files ?? [ r.file ])[0]);
        } finally {
            await pool.destroy ();
        }
    };
    const poolA = await runPool (1);
    const poolB = await runPool (2);

    // negative control: the printer WITHOUT the ccxt hook must not produce the typed declarations
    const bare = new Transpiler (config);
    bare.setVerboseMode (false);
    const unhooked = files.map ((f) => bare.transpileGoByPath (f));

    let failures = 0, hookTotal = 0;
    const rows: any[] = [];
    for (let i = 0; i < files.length; i++) {
        const same = (x: any, y: any) => x.content === y.content && JSON.stringify (x.methodsTypes) === JSON.stringify (y.methodsTypes);
        const mainVsA = same (main[i], poolA[i]);
        const aVsB = same (poolA[i], poolB[i]);
        const stats = localAuditEmitStats (main[i].content);
        const bareStats = localAuditEmitStats (unhooked[i].content);
        const control = bareStats.hookTyped === 0 && (stats.hookTyped === 0 || unhooked[i].content !== main[i].content);
        hookTotal += stats.hookTyped;
        const ok = mainVsA && aVsB && control;
        if (!ok) { failures++; }
        const diffs: string[] = [];
        if (!mainVsA) { diffs.push (`main!=pool1 ${localAuditFirstDiff (main[i].content, poolA[i].content)}`); }
        if (!aVsB) { diffs.push (`pool1!=pool2 ${localAuditFirstDiff (poolA[i].content, poolB[i].content)}`); }
        if (!control) { diffs.push ('negative control: the unhooked printer emitted the same hook-typed declarations'); }
        rows.push ({ 'file': files[i], 'bytes': main[i].content.length, 'methodsTypes': (main[i].methodsTypes ?? []).length, 'hookTyped': stats.hookTyped, 'unhookedHookTyped': bareStats.hookTyped, 'mainVsPool1': mainVsA, 'pool1VsPool2': aVsB, 'negativeControl': control, 'ok': ok, 'diffs': diffs });
    }
    const rootsNote = rootsAll ? `roots=${roots.length} (stage-wide)` : `roots=${roots.length}`;
    console.log (`local-type parity | ${rootsNote} files=${files.length}`);
    for (const r of rows) {
        console.log (`  ${r.ok ? 'OK  ' : 'FAIL'} ${r.file} main==pool(1)==pool(2)=${r.mainVsPool1 && r.pool1VsPool2} hook-typed-locals=${r.hookTyped} unhooked-copies=${r.unhookedHookTyped} bytes=${r.bytes} methodsTypes=${r.methodsTypes}`);
        for (const d of r.diffs) { console.log (`       ${d}`); }
    }
    const hookLive = hookTotal > 0;
    const pass = failures === 0 && hookLive;
    console.log (`  hook-typed locals across files: ${hookTotal}${hookLive ? '' : ' — WARNING: the negative control is vacuous (no hook-typed declarations in this sample)'}`);
    console.log (`  ${pass ? 'PASS' : 'FAIL'}${failures ? ` (${failures} file(s) diverged)` : ''}`);
    if (process.argv.includes ('--json')) {
        console.log (JSON.stringify ({ 'mode': 'parity', 'roots': roots.length, 'rows': rows, 'pass': pass }, null, 2));
    }
    process.exit (pass ? 0 : 1);
}

// synthetic repo: a clean retype (plus the reindent this tree's mixed base produces) and a
// derefScalar-wrapped consumer line must pass; a semantic edit and a changed initializer must fail
function localAuditSelfTest () {
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'go-local-audit-self-'));
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push (msg); } };
    const gc = (args: string[]) => localAuditRun ('git', [ '-C', tmp, '-c', 'user.email=audit@test', '-c', 'user.name=audit', ...args ]);
    try {
        fs.mkdirSync (path.join (tmp, LOCAL_AUDIT_SCOPE), { 'recursive': true });
        const f = path.join (tmp, LOCAL_AUDIT_SCOPE, 'Gen.go');
        const handPath = path.join (tmp, LOCAL_AUDIT_SCOPE, 'Hand.go');
        const header = '// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\npackage ccxt\n\n';
        const genBase = 'func f() any {\n    var rows any = this.ToArray(response)\n    var s any = this.Capitalize(key)\n    var m any = this.Market(symbol)\n    var b any = DerefScalar(this.SafeBool(response, "success", false))\n    x := 1\n    if rows == nil {\n        return nil\n    }\n    _ = m\n    return rows\n}\n';
        const genTyped = 'func f() any {\n\tvar rows []any = this.ToArray(response)\n\tvar s string = this.Capitalize(key)\n\tvar m MarketInterface = derefScalar(this.Market(symbol))\n\tvar b *bool = this.SafeBool(response, "success", false)\n\tx := 1\n\tif derefScalar(rows) == nil {\n\t\treturn nil\n\t}\n\t_ = m\n\treturn rows\n}\n';
        const handBase = 'package ccxt\n\nfunc g() any { return nil }\n';
        fs.writeFileSync (f, header + genBase);
        fs.writeFileSync (handPath, handBase);
        gc ([ 'init', '-q' ]); gc ([ 'add', '-A' ]); gc ([ 'commit', '-q', '-m', 'base' ]);
        const base = gc ([ 'rev-parse', 'HEAD' ]).stdout.trim ();
        // census of the base revision
        const census = localAuditCensus (path.join (tmp, LOCAL_AUDIT_SCOPE));
        ok (census.declarations === 4 && census.any === 4 && census.typed === 0, `census expected 4/4/0, got ${census.declarations}/${census.any}/${census.typed}`);
        // clean retype + full reindent (spaces -> tabs) + DerefScalar wrapper removal + one
        // derefScalar-wrapped consumer line
        fs.writeFileSync (f, header + genTyped);
        let audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.totals.other === 0, `clean retype+reindent must pass, got other=${audit.totals.other}: ${JSON.stringify (audit.files.map ((x: any) => x.otherLines[0]).filter ((x: any) => x))}`);
        ok (audit.totals.declaration === 4, `expected 4 declaration retypes, got ${audit.totals.declaration}`);
        ok (audit.totals.coercion === 1, `expected 1 coercion line, got ${audit.totals.coercion}`);
        ok (audit.files.length === 1 && audit.skippedHandwritten.length === 0, 'expected one generated file audited');
        // a hand-written file is skipped, never classified
        fs.writeFileSync (handPath, handBase.replace ('return nil', 'return 1'));
        audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.skippedHandwritten.length === 1, `hand-written file must be skipped, got ${JSON.stringify (audit.skippedHandwritten)}`);
        ok (audit.totals.other === 0, `hand-written edit must not fail the gate, got other=${audit.totals.other}`);
        fs.writeFileSync (handPath, handBase);
        // semantic edit on a non-declaration line -> fails as 'other'
        fs.writeFileSync (f, header + genTyped.replace ('x := 1', 'x := 2'));
        audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.totals.other >= 1, 'a semantic edit must be flagged');
        // retyped declaration whose INITIALIZER changed -> still 'other'
        fs.writeFileSync (f, header + genTyped.replace ('var rows []any = this.ToArray(response)', 'var rows []any = this.ToArray(response2)'));
        audit = localAuditDiffAudit (tmp, base, null, LOCAL_AUDIT_SCOPE);
        ok (audit.totals.other >= 1, 'a changed initializer must be flagged');
        ok (audit.totals.declaration === 3, `changed initializer must not count as a declaration, got ${audit.totals.declaration}`);
        // the hook-typed counter sees the hook's callees only
        ok (localAuditHookTypedCount ('\tvar rows []any = this.ToArray(response)\n\tvar x any = this.ToArray(response)\n') === 1, 'hook-typed counter mis-counts');
    } catch (e: any) {
        problems.push (`self-test threw: ${e.message}`);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}

async function runLocalTypeAudit () {
    const argv = process.argv.slice (2);
    const flag = (name: string) => { const i = argv.indexOf (name); return i === -1 ? undefined : argv[i + 1]; };
    if (argv.includes ('--self-test')) {
        const problems = localAuditSelfTest ();
        if (problems.length) { console.error ('SELF-TEST FAILED:\n  - ' + problems.join ('\n  - ')); process.exit (3); }
        console.log ('SELF-TEST PASSED');
        return;
    }
    if (argv.includes ('--parity')) {
        const consumed = new Set ([ flag ('--base'), flag ('--target') ].filter ((x) => x !== undefined));
        const ids = argv.filter ((x) => !x.startsWith ('--') && !consumed.has (x));
        await runLocalTypeParity (ids.length ? ids : LOCAL_AUDIT_PARITY_DEFAULT_IDS, argv.includes ('--roots-all'));
        return;
    }
    const repo = process.cwd ();
    const base = localAuditGit (repo, [ 'rev-parse', `${flag ('--base') ?? 'origin/master'}^{commit}` ]).stdout.trim ();
    const target = flag ('--target') ?? null;
    const census = localAuditCensus (LOCAL_AUDIT_SCOPE);
    const packages: any[] = [];
    for (const e of fs.readdirSync (LOCAL_AUDIT_SCOPE, { 'withFileTypes': true })) {
        if (e.isDirectory ()) { packages.push (localAuditCensus (path.join (LOCAL_AUDIT_SCOPE, e.name), true)); }
    }
    const audit = localAuditDiffAudit (repo, base, target, LOCAL_AUDIT_SCOPE);
    const pass = audit.totals.other === 0;
    const topAnyByInit = Object.entries (census.anyByInit).sort ((a: any, b: any) => b[1] - a[1]).slice (0, 30);
    const topByType = Object.entries (census.byType).sort ((a: any, b: any) => b[1] - a[1]).slice (0, 20);
    if (argv.includes ('--json')) {
        console.log (JSON.stringify ({ 'base': base, 'target': target, 'census': { 'declarations': census.declarations, 'any': census.any, 'typed': census.typed, 'byType': census.byType, 'anyByInit': census.anyByInit, 'derefScalar': census.derefScalar, 'derefScalarExported': census.derefScalarExported }, 'packages': packages, 'audit': { 'totals': audit.totals, 'files': audit.files, 'skippedHandwritten': audit.skippedHandwritten, 'gofmtMissing': audit.gofmtMissing }, 'pass': pass }, null, 2));
    } else {
        console.log (`local-type audit | base=${base.slice (0, 11)} target=${target ?? '<worktree>'}`);
        console.log (`  census ${census.dir}: files=${census.files} declarations=${census.declarations} any=${census.any} typed=${census.typed} (${census.declarations ? Math.round (100 * census.typed / census.declarations) : 0}%) derefScalar-calls=${census.derefScalar} DerefScalar-calls=${census.derefScalarExported}`);
        for (const p of packages) {
            if (p.declarations) { console.log (`  census ${p.dir}: files=${p.files} declarations=${p.declarations} any=${p.any} typed=${p.typed}`); }
        }
        console.log (`  typed by type: ${topByType.map ((x: any) => `${x[0]}=${x[1]}`).join (' ')}`);
        console.log (`  remaining any by initializer: ${topAnyByInit.map ((x: any) => `${x[0]}=${x[1]}`).join (' ')}`);
        console.log (`  diff audit (generated files): declaration=${audit.totals.declaration} coercion=${audit.totals.coercion} format=${audit.totals.format} other=${audit.totals.other} (hand-written skipped: ${audit.skippedHandwritten.length})`);
        for (const f of audit.files.filter ((x: any) => x.other > 0).slice (0, 30)) {
            console.log (`    OTHER ${f.path}: ${String (f.otherLines[0]).split ('\n')[0].trim ().slice (0, 140)}`);
        }
        console.log (`  ${pass ? 'PASS' : 'FAIL'}`);
    }
    process.exit (pass ? 0 : 1);
}

// hx10w6 G04: the book-side pass has to run inside formatGoSource, not only in its own self-test
function g04BookSidesWired (): string[] {
    const src = 'package ccxtpro\n\nfunc (this *X) HandleOrderBookMessage(client any) any {\n\tvar orderbook any = this.OrderBook()\n\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), nil)\n\treturn nil\n}\n';
    const out = formatGoSource ('selftest.go', src);
    return out.includes ('orderbook.GetAsks()') ? [] : [ 'hx10w6 G04: not wired into formatGoSource: ' + out ];
}

async function runMain () {
    if (process.argv.includes ('--audit-local-types')) {
        await runLocalTypeAudit ();
        return;
    }
    if (process.argv.includes ('--check-gofmt')) {
        runGofmtGate ();
        return;
    }
    if (process.argv.includes ('--self-test')) {
        const problems = g10kArithSelfTest ().concat (hx4G17SelfTest ()).concat (goDerefWrapSelfTest ()).concat (goParamNilSelfTest ()).concat (goBoxedPointerSelfTest ()).concat (goPointerLocalNilSelfTest ()).concat (goTypedNilSelfTest ()).concat (goProvenParamNilSelfTest ()).concat (goAnyLocalNilSelfTest ()).concat (goStringLiteralSelfTest ()).concat (goSafeBoolLiteralSelfTest ()).concat (goSliceIndexSelfTest ()).concat (goTupleIndexSelfTest ()).concat (b02TupleSliceSlotSelfTest ()).concat (goAsyncTupleIndexSelfTest ()).concat (h2kG08SelfTest ()).concat (h2kG11SelfTest ()).concat (goEndpointListSelfTest ()).concat (goAsyncListSelfTest ()).concat (goG14SelfTest ()).concat (goDerefArgMapReadSelfTest ()).concat (goNativeStringAddSelfTest ()).concat (goChanSelfTest ()).concat (g10kDerefSelfTest ()).concat (g10kMaplistSelfTest ()).concat (g10kIsEqualSelfTest ()).concat (g10kGvMapSelfTest ()).concat (g10kStrSelfTest ()).concat (g10kLenSelfTest ()).concat (g10kTypepredSelfTest ()).concat (g10kInopSelfTest ()).concat (w8FuturesPairSelfTest ()).concat (g10kArrSelfTest ()).concat (gvListSelfTest ()).concat (g10kMiscSelfTest ()).concat (goProvenParseSelfTest ()).concat (hx11w8NonceInt64Check ()).concat (hx11w8NonceLocalsCheck ()).concat (goErrSelfTest ()).concat (goStructReturnsSelfTest ()).concat (goChan3SelfTest ()).concat (goTickerCacheSelfTest ()).concat (hx4G05SelfTest ()).concat (hx4G07SelfTest ()).concat (hx4X01SelfTest ()).concat (hx4G10SelfTest ()).concat (g13AnnotatedSelfTest ()).concat (b02SafeBalanceSelfTest ()).concat (hx4G14MapWriteSelfTest ()).concat (g12SlotChecks ()).concat (g15StrReturnSelfTest ()).concat (hx4G16SelfTest ()).concat (hx4G18SelfTest ()).concat (hx4G19SelfTest ()).concat (hx4G20SelfTest ()).concat (hx4G21SelfTest ()).concat (hx4G22SelfTest ()).concat (hx4G23SelfTest ()).concat (hx4G24SelfTest ()).concat (hx4G25Check ()).concat (hx4G26SelfTest ()).concat (hx4G27SelfTest ()).concat (hx4G27Check ()).concat (hx4G28SelfTest ()).concat (hx4G29Check ()).concat (hx4G30SelfTest ()).concat (hx4G31Check ()).concat (hx4G32SelfTest ()).concat (hx4G33Check ()).concat (hx4G34Check ()).concat (hx4G35Check ()).concat (hx4G36Wired ()).concat (hx4G37Check ()).concat (hx4G38Check ()).concat (hx4G39Check ()).concat (hx4G40Check (hx4G36Aligner ())).concat (hx4G40Wired ()).concat (hx4G41Check ()).concat (hx4G42Check (hx4G36Aligner ())).concat (hx5X26Check ()).concat (hx4G43Wired ()).concat (hx5X27Check ()).concat (hx4G45Check (hx4G36Aligner ())).concat (hx4G45Wired ()).concat (hx5X29Check ()).concat (hx5X29Wired ()).concat (hx5X32StrParamSelfTest ()).concat (hx5P28Check ()).concat (hx10w2G01Check ()).concat (g02check ()).concat (hx10G03Check ()).concat (g04Check ()).concat (g04Wired ()).concat (hx10w2G05Check ()).concat (g06MapReadsSelfTest ()).concat (hx10w2G07SelfCheck ()).concat (hx10G08Check ()).concat (g09Check ()).concat (hx10G10SelfTest ()).concat (g01SubsCheck ()).concat (hx10w3G02SelfCheck ()).concat (g05Check (retypeGoProvenParseMethods)).concat (hx10G06Check ()).concat (hx10w3G07Check ()).concat (g08w3Check ()).concat (g09w3Check (formatGoSource)).concat (g10SelfCheck ()).concat (hx10w4OG01Check ()).concat (hx10OG02Check ()).concat (g10SelfCheck ()).concat (og03selfcheck ()).concat (g01Check ()).concat (g05check ()).concat (hx10G15Check ()).concat (og02IdBookCheck ()).concat (g21Check (formatGoSource)).concat (og03w6SelfCheck ()).concat (og05Check ()).concat (og03w6Wired (formatGoSource)).concat (hx10w6G01BalanceCheck ()).concat (g01BalanceWired (formatGoSource)).concat (hx10w9GB10Check ()).concat (hx10w9GB10Wired (formatGoSource)).concat (g04BookSidesCheck ()).concat (g04BookSidesWired ()).concat (hx10w6G11Check ()).concat (og06SelfCheck ()).concat (hx10w7G14SelfTest ()).concat (hx10w8GB01Check ()).concat (hx10w8GB05Check ()).concat (hx10w9GB11Check ()).concat (gb08Check ()).concat (gp19Check ()).concat (hx10w8Gp08SelfTest ()).concat (hx10w9Gp18SelfTest ()).concat (hx10w9Gp18Wired ()).concat (hx10w8GO04Check ()).concat (gp14SelfTest ()).concat (gb09Check ()).concat (hx10w9GO05Check ()).concat (hx11M43Check ()).concat (hx10w10GP27Check ()).concat (hx10w10Gp26Check ()).concat (hx10w10Gp28Check ()).concat (hx10w10Gp28Wired (formatGoSource)).concat (hx10w9Gp17SelfTest ()).concat (hx10w10GP24Check ()).concat (hx10w10GP24Wired ()).concat (nativeGuardedListElementReadsSelfTest ()).concat (goAnyObjectKeysLengthSelfTest ()).concat (goGofmtLayoutSelfTest ()).concat (w8ClientFuturesSelfTest ()).concat (g04NativeBookReadsCheck ()).concat (hx11IsEqualBoolMethodCheck ()).concat (hx11w8PromiseAllSlotSelfTest ()).concat (hx11w8PromiseAllLoopSelfTest ()).concat (hx11m36SelfTest ()).concat (hx11w8TM01Check ()).concat (hx11w8TickerReadCheck ()).concat (goOrderBookSetterCheck ()).concat (hx11w8JsonOriginCheck ()).concat (hx11w8EthEncodeBytesCheck ()).concat (hx11w8BaseMapLocalsCheck ()).concat (hx11w8JsonStringCheck ()).concat (hx11w8JoinStringLocalsCheck ()).concat (hx11w8M308JoinNativeCheck ()).concat (hx11w8AnySliceToListCheck ());
        if (problems.length) {
            console.error ('SELF-TEST FAILED:\n  - ' + problems.join ('\n  - '));
            process.exit (3);
        }
        console.log ('SELF-TEST PASSED');
        return;
    }
    const ws = process.argv.includes ('--ws');
    // bare prediction-only ids (e.g. `goTranspiler.ts kalshi`) auto-route to the
    // prediction namespace so scoped CI steps don't need to know it
    const cliExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
    const allArePredictionOnly = cliExchanges.length > 0 && cliExchanges.every (x => predictionIds.includes (x) && !exchangeIds.includes (x));
    const prediction = process.argv.includes ('--prediction') || allArePredictionOnly;
    const test = process.argv.includes ('--test') || process.argv.includes ('--tests');
    const baseTestsOnly = process.argv.includes ('--baseTests');
    const examples = process.argv.includes ('--examples');
    const force = process.argv.includes ('--force');
    const baseClassOnly = process.argv.includes ('--baseClass')
    const exchange = process.argv.includes ('--exchange');
    if (exchange) {
        transpiledExchanges = [ exchange ];
    }
    if (prediction) {
        transpiledExchanges = predictionIds;
    }
    shouldTranspileTests = process.argv.includes ('--noTests') ? false : true;
    log.bright.green ({ force });
    const inputExchanges = process.argv.slice (2).filter (x => !x.startsWith ('--'));
    // single-process REST+WS (default via npm run transpileGO / CI): keeps the one
    // piscina pool (and its warm per-thread Transpilers) alive across both stages
    // instead of paying a second process boot + cold pool. Omit the flag for REST-only.
    const restAndWs = process.argv.includes ('--rest-and-ws');
    const transpiler = new NewTranspiler (ws);
    try {
        if (baseClassOnly) {
            transpiler.transpileBaseMethods (TS_BASE_FILE)
            transpiler.transpilePredictionBaseMethods ()
        } else if (restAndWs) {
            // reproduces, in order, exactly what the two CI commands do:
            //   goTranspiler.ts --force            -> transpileEverything (...)
            //   goTranspiler.ts --ws --force       -> transpileWS (force) [+ prediction ws]
            await transpiler.transpileEverything (force, false, examples, prediction);
            // goTypeOptions is a MODULE-LEVEL accumulator that safeOptionsStructFile() dumps
            // wholesale into exchange_wrapper_structs.go. The ws stage must only emit the ws
            // structs, which held automatically while each stage was its own process. Reusing
            // the process would otherwise append every REST struct to go/v4/pro/ (measured:
            // 1460 -> 7135 lines). Same class of latent bug as the `exchanges` clobber above.
            resetPerStageAccumulators ();
            await transpiler.transpileWS (force);
            if (!inputExchanges.length) {
                // full ws builds also transpile the prediction ws exchanges
                await transpiler.transpileWS (force, true);
            }
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
        } else if (test || baseTestsOnly) {
            await transpiler.transpileTests ();
        } else {
            await transpiler.transpileEverything (force, false, examples, prediction);
        }
    } finally {
        await transpiler.destroy ();
    }
}

// (method, parameter) pairs whose every caller passes untyped nil or a value that is never a typed
// nil (decoded JSON, literals, non-nil maps), so IsEqual(p, nil) is `p == nil`; proof in the campaign notes.
const GO_UNTYPED_NIL_PARAMS: { [method: string]: string[] } = {
    'HandleErrors': [ 'response' ],
};

// Producers whose every Go return path is a two-element []any literal (or a call to another entry).
const GO_TUPLE_PAIR_PRODUCERS: string[] = [
    'HandleNetworkCodeAndParams', 'HandleWithdrawTagAndParams', 'HandlePostOnly',
    'HandleParamString', 'HandleParamString2', 'HandleParamInteger', 'HandleParamInteger2', 'HandleParamBool', 'HandleParamBool2',
    'HandleOptionAndParams', 'HandleOptionAndParams2',
    'HandleOptionBoolAndParamsNullable', 'HandleOptionBoolAndParams2Nullable',
    'HandleOptionIntegerAndParamsNullable', 'HandleOptionIntegerAndParams2Nullable',
];
// elements every return path stores already derefScalar-invariant (a GetValue/Omit result, a bool
// literal, a non-nil map), so a bare `x := GetValue(h, k)` reads the same as `x := h[k]`
const GO_TUPLE_PLAIN_ELEMENTS: { [producer: string]: string[] } = {
    'HandleOptionAndParams': [ '1' ], 'HandleOptionAndParams2': [ '1' ], 'HandlePostOnly': [ '0', '1' ],
    'HandleOptionBoolAndParamsNullable': [ '1' ], 'HandleOptionBoolAndParams2Nullable': [ '1' ],
    'HandleOptionIntegerAndParamsNullable': [ '1' ], 'HandleOptionIntegerAndParams2Nullable': [ '1' ],
};
// consumers that apply derefScalar to their argument first, so GetValue's own deref is redundant
const GO_TUPLE_DEREF_CONSUMERS: string[] = [ 'MapTyped', 'ListTyped', 'SafeStringPtr', 'SafeBoolPtr', 'Float64PtrTyped' ];

// `C(GetValue(h, 0|1))` -> `C(h[0|1])` for `var h []any = this.<pair producer>(...)`, declared once, never written.
function nativeTupleHolderReads (content: string): string {
    if (content.indexOf ('GetValue(') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const masked = maskedLines.join ('\n');
    const overridden = GO_TUPLE_PAIR_PRODUCERS.filter ((m: string) => new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + m + '\\(').test (masked));
    const { 'blocks': blocks } = goTextBlocks (maskedLines);
    const consumers = GO_TUPLE_DEREF_CONSUMERS.join ('|');
    const readRx = new RegExp ('\\b((?:ccxt\\.)?(?:' + consumers + '))\\((?:ccxt\\.)?GetValue\\(([A-Za-z_]\\w*), ([01])\\)\\)', 'g');
    const bareRx = /^(\s*[A-Za-z_]\w* :?= )(?:ccxt\.)?GetValue\(([A-Za-z_]\w*), ([01])\)(\s*)$/;
    // the table producer of an unwritten `var holder []any = this.P(...)` declared in a block enclosing line `index`
    const holderProducer = (holder: string, index: number): string => {
        const fn = blocks.find ((b: any) => (b.depth === 1) && (b.open < index) && (index <= b.close));
        if ((fn === undefined) || (maskedLines[fn.open].indexOf ('func ') !== 0)) {
            return undefined;
        }
        const maskedFunc = maskedLines.slice (fn.open + 1, fn.close + 1).join ('\n');
        const decl = goAccessSingleDeclaration (maskedFunc, maskedLines[fn.open], holder);
        if ((decl === undefined) || (decl.type !== '[]any') || (decl.line === undefined)) {
            return undefined;
        }
        const init = new RegExp ('^\\s*var ' + holder + ' \\[\\]any = this\\.(\\w+)\\(').exec (decl.line);
        if ((init === null) || !GO_TUPLE_PAIR_PRODUCERS.includes (init[1]) || overridden.includes (init[1])) {
            return undefined;
        }
        let declLine = -1;
        for (let k = fn.open + 1; k < fn.close; k++) {
            if (new RegExp ('^\\s*var ' + holder + ' \\[\\]any = ').test (maskedLines[k])) {
                declLine = k;
                continue;
            }
            if (goTextWritesName (maskedLines[k], holder) || new RegExp ('\\b' + holder + '\\s*=\\s*append\\(').test (maskedLines[k])) {
                return undefined;
            }
        }
        if ((declLine < 0) || (declLine >= index)) {
            return undefined;
        }
        // the declaration's block must enclose the read
        const declBlock = goTextEnclosingBlock (blocks, declLine);
        if ((declBlock === undefined) || !((declBlock.open < index) && (index <= declBlock.close))) {
            return undefined;
        }
        return init[1];
    };
    let changed = false;
    for (let index = 0; index < lines.length; index++) {
        if (maskedLines[index].indexOf ('GetValue(') < 0) {
            continue;
        }
        const bare = bareRx.exec (maskedLines[index]);
        if ((bare !== null) && (lines[index] === maskedLines[index])) {
            const producer = holderProducer (bare[2], index);
            if ((producer !== undefined) && (GO_TUPLE_PLAIN_ELEMENTS[producer] || []).includes (bare[3])) {
                lines[index] = bare[1] + bare[2] + '[' + bare[3] + ']' + bare[4];
                changed = true;
            }
            continue;
        }
        lines[index] = lines[index].replace (readRx, (match: string, consumer: string, holder: string, slot: string, offset: number) => {
            if ((maskedLines[index].substr (offset, match.length) !== match) || (offset > 0 && /[\w.]$/.test (maskedLines[index].substring (0, offset)) && !/ccxt\.$/.test (maskedLines[index].substring (0, offset)))) {
                return match;
            }
            if (holderProducer (holder, index) === undefined) {
                return match;
            }
            changed = true;
            return consumer + '(' + holder + '[' + slot + '])';
        });
    }
    return changed ? lines.join ('\n') : content;
}

function goTupleIndexSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (body: string): string => nativeTupleHolderReads ('func (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
    const d = '\tvar h []any = this.HandleWithdrawTagAndParams(t, p)\n';
    const pos = f (d + '\tvar a *string = SafeStringPtr(GetValue(h, 0))\n\tvar b map[string]any = MapTyped(GetValue(h, 1))\n');
    ok (pos.indexOf ('SafeStringPtr(h[0])') >= 0 && pos.indexOf ('MapTyped(h[1])') >= 0, 'pair producer reads go native');
    ok (f ('\tvar h []any = ccxt.ListTyped(x)\n\tvar b map[string]any = ccxt.MapTyped(ccxt.GetValue(h, 1))\n').indexOf ('GetValue(h, 1)') >= 0, 'producer not in table keeps GetValue');
    ok (f ('\tvar h []any = this.HandleParamString(p, \"k\")\n\tvar b map[string]any = ccxt.MapTyped(ccxt.GetValue(h, 1))\n').indexOf ('ccxt.MapTyped(h[1])') >= 0, 'ccxt-qualified reads go native');
    const keep: string[] = [
        d + '\th = this.Other(p)\n\tvar b map[string]any = MapTyped(GetValue(h, 1))\n',
        d + '\th[1] = p\n\tvar b map[string]any = MapTyped(GetValue(h, 1))\n',
        d + '\th = append(h, p)\n\tvar b map[string]any = MapTyped(GetValue(h, 1))\n',
        d + '\tvar c any = MapTyped(GetValue(h, 2))\n',
        d + '\tx := GetValue(h, 0)\n',
        d + '\tx := GetValue(h, 1)\n',
        '\tvar h []any = this.HandleOptionAndParams(p, \"m\", \"k\")\n\tx := GetValue(h, 0)\n',
        '\tvar h []any = this.HandleOptionBoolAndParamsNullable(p, \"m\", \"k\")\n\tx := GetValue(h, 0)\n',
        '\tvar h []any = this.HandleParamString(p, \"k\")\n\tx := GetValue(h, 1)\n',
        '\tvar h []any = this.HandleOptionAndParams(p, \"m\", \"k\")\n\th = nil\n\tx := GetValue(h, 1)\n',
        '\tvar h []any = this.HandleOptionAndParams(p, \"m\", \"k\")\n\tx := GetValue(h, 1) + 1\n',
        d + '\tvar c any = IsEqual(GetValue(h, 0), nil)\n',
        '\tvar h []any = this.HandleProductTypeAndParams(p)\n\tvar b map[string]any = MapTyped(GetValue(h, 1))\n',
        '\tif p != nil {\n\t\tvar h []any = this.HandleParamString(p, \"k\")\n\t}\n\tvar b map[string]any = MapTyped(GetValue(h, 1))\n',
    ];
    keep.forEach ((body: string, i: number) => ok (f (body).indexOf ('GetValue(h,') >= 0, 'negative ' + i + ' keeps GetValue'));
    const overridden = 'func (this *X) HandleWithdrawTagAndParams(t any, p any) []any {\n\treturn nil\n}\n' + 'func (this *X) f(p any) any {\n' + d + '\tvar b map[string]any = MapTyped(GetValue(h, 1))\n\treturn nil\n}\n';
    ok (nativeTupleHolderReads (overridden).indexOf ('GetValue(h, 1)') >= 0, 'producer overridden in the file keeps GetValue');
    ok (nativeTupleHolderReads (pos) === pos, 'second application is a no-op');
    const bare = f ('\tvar h []any = this.HandleOptionAndParams2(p, \"m\", \"a\", \"b\")\n\tx := GetValue(h, 1)\n\tvar q []any = this.HandlePostOnly(false, false, p)\n\tpo := ccxt.GetValue(q, 0)\n\tx = GetValue(q, 1)\n');
    ok (bare.indexOf ('x := h[1]') >= 0 && bare.indexOf ('po := q[0]') >= 0 && bare.indexOf ('x = q[1]') >= 0, 'plain tuple elements read natively: ' + bare);
    ok (nativeTupleHolderReads (bare) === bare, 'bare rewrite is idempotent');
    return problems;
}

if (isMainEntry (import.meta.url)) {
    await runMain ();
}

function goProvenParamNilCompareText (fn: string, isEqualFn: string): string {
    const sig = fn.match (/^\nfunc \(this \*[\w.]+\) (\w+)\(([^)\n]*)\)/);
    const params = sig ? (GO_UNTYPED_NIL_PARAMS[sig[1]] || []) : [];
    const helper = isEqualFn.replace (/[.(]/g, '\\$&');
    for (const name of params) {
        const body = fn.slice (sig[0].length);
        const declared = new RegExp ('(?:^|,\\s*)' + name + ' any(?:,|$)').test (sig[2]);
        // any write, address-take, redeclaration or closure parameter of the name keeps the helper
        const rebound = new RegExp ('(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*(?::=|=[^=])|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|&' + name + '\\b|\\bvar ' + name + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ').test (body);
        if (!declared || rebound) {
            continue;
        }
        fn = fn.replace (new RegExp ('(!?)(?<![.\\w])' + helper + name + ', nil\\)', 'g'), ((_m: string, not: string) => '(' + name + ((not === '!') ? ' != ' : ' == ') + 'nil)') as any);
    }
    return fn;
}

export function goProvenParamNativeNilCompares (content: string, isEqualFn: string): string {
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goProvenParamNilCompareText (fn, isEqualFn)) as any);
}

function goProvenParamNilSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const sig = '\nfunc (this *X) HandleErrors(code any, reason any, url any, method any, headers any, body any, response any, requestHeaders any, requestBody any) any {\n';
    const pos = goProvenParamNativeNilCompares (sig + '\tif IsEqual(response, nil) {\n\t\treturn nil\n\t}\n\tif !IsEqual(response, nil) && IsEqual(body, nil) {\n\t\treturn nil\n\t}\n\treturn nil\n}\n', 'IsEqual(');
    ok ((pos.indexOf ('if (response == nil) {') >= 0) && (pos.indexOf ('(response != nil) && IsEqual(body, nil)') >= 0), 'tabled param compares natively: ' + pos);
    const ws = goProvenParamNativeNilCompares (sig + '\tif ccxt.IsEqual(response, nil) {\n\t\treturn nil\n\t}\n\treturn nil\n}\n', 'ccxt.IsEqual(');
    ok (ws.indexOf ('if (response == nil) {') >= 0, 'package-qualified helper rewritten');
    const other = '\nfunc (this *X) HandleOther(response any) any {\n\tif IsEqual(response, nil) {\n\t\treturn nil\n\t}\n\treturn nil\n}\n';
    ok (goProvenParamNativeNilCompares (other, 'IsEqual(') === other, 'untabled method keeps the helper');
    for (const write of [ '\tresponse = this.SafeDict(body, "a")\n', '\tresponse, ok := body.(map[string]any)\n\t_ = ok\n', '\tvar response any = body\n', '\tp := &response\n\t_ = p\n', '\tf := func(response any) {}\n\t_ = f\n' ]) {
        const src = sig + write + '\tif IsEqual(response, nil) {\n\t\treturn nil\n\t}\n\treturn nil\n}\n';
        ok (goProvenParamNativeNilCompares (src, 'IsEqual(') === src, 'rebound param keeps the helper: ' + write);
    }
    const typed = '\nfunc (this *X) HandleErrors(code any, reason any, url any, method any, headers any, body any, response map[string]any, requestHeaders any, requestBody any) any {\n\tif IsEqual(response, nil) {\n\t\treturn nil\n\t}\n\treturn nil\n}\n';
    ok (goProvenParamNativeNilCompares (typed, 'IsEqual(') === typed, 'non-any param keeps the helper');
    ok (goProvenParamNativeNilCompares (pos, 'IsEqual(') === pos, 'second application is a no-op');
    return problems;
}

// `func (this *R) <m>Async` whose goroutine body (same file, same receiver) sends only two-element []any literals:
// every body-level return follows such a send, the body ends in a return or panic, and panics reach
// the receiver as a "panic:" string that PanicOnError re-raises (a bare panic("break") sends nothing: rejected).
function goAsyncPairProducerInFile (content: string, masked: string, receiver: string, method: string): boolean {
    const body = method.charAt (0).toLowerCase () + method.slice (1) + 'Body';
    const wrapper = new RegExp ('\\nfunc \\(this \\*' + receiver + '\\) ' + method + 'Async\\([^\\n]*\\) <-chan any \\{\\n\\s*ch := make\\(chan any, 1\\)\\n\\s*go this\\.' + body + '\\(ch(?:, [^\\n]*)?\\)\\n\\s*return ch\\n\\}\\n');
    if (!wrapper.test (masked) || (masked.split ('func (this *' + receiver + ') ' + method + 'Async(').length !== 2)) {
        return false;
    }
    const start = masked.indexOf ('\nfunc (this *' + receiver + ') ' + body + '(ch chan any');
    if ((start < 0) || (masked.split (') ' + body + '(').length !== 2)) {
        return false;
    }
    const end = masked.indexOf ('\n}\n', start);
    const lines = masked.substring (start + 1, end + 2).split ('\n');
    if (content.substring (start + 1, end + 2).indexOf ('panic("break")') >= 0) {
        return false;
    }
    if ((lines[1].trim () !== 'defer close(ch)') || (lines[2].trim () !== 'defer ReturnPanicError(ch)')) {
        return false;
    }
    const { 'blocks': blocks } = goTextBlocks (lines);
    const inLiteral = (k: number) => blocks.some ((b: any) => (b.depth > 1) && (b.open < k) && (k <= b.close) && /\bfunc\s*\(/.test (lines[b.open]));
    const pairSend = /^\s*ch <- \[\]any\{[^{}(),]+(?:\([^(){}]*\))?, [^{}(),]+\}$/;
    let last = '';
    for (let k = 3; k < lines.length - 1; k++) {
        const line = lines[k];
        if (/\bgo\b|\bch\b(?!\s*<-\s*\[\]any\{)/.test (line) && !pairSend.test (line)) {
            return false;
        }
        if (/\bch\s*<-/.test (line) && (!pairSend.test (line) || inLiteral (k))) {
            return false;
        }
        if (/\breturn\b/.test (line) && !inLiteral (k) && ((line.trim () !== 'return nil') || !pairSend.test (last))) {
            return false;
        }
        if (line.trim () !== '') {
            last = line;
        }
    }
    return (last.trim () === 'return nil') || /^\s*panic\(/.test (last);
}

// `C(GetValue(h, 0|1))` -> `C(h[0|1])` for `var h []any = ListTyped(PanicOnError((<-this.<m>Async(...))))`, <m> proven above.
function nativeAsyncTupleHolderReads (content: string): string {
    if (content.indexOf ('Async(') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const masked = maskedLines.join ('\n');
    const { 'blocks': blocks } = goTextBlocks (maskedLines);
    const readRx = new RegExp ('\\b((?:ccxt\\.)?(?:' + GO_TUPLE_DEREF_CONSUMERS.join ('|') + '))\\((?:ccxt\\.)?GetValue\\(([A-Za-z_]\\w*), ([01])\\)\\)', 'g');
    const proven = new Map<string, boolean> ();
    let changed = false;
    for (let index = 0; index < lines.length; index++) {
        if (maskedLines[index].indexOf ('GetValue(') < 0) {
            continue;
        }
        lines[index] = lines[index].replace (readRx, (match: string, consumer: string, holder: string, slot: string, offset: number) => {
            if ((maskedLines[index].substr (offset, match.length) !== match) || (offset > 0 && /[\w.]$/.test (maskedLines[index].substring (0, offset)) && !/ccxt\.$/.test (maskedLines[index].substring (0, offset)))) {
                return match;
            }
            const fn = blocks.find ((b: any) => (b.depth === 1) && (b.open < index) && (index <= b.close));
            const recv = (fn === undefined) ? null : /^func \(this \*(\w+)\) /.exec (maskedLines[fn.open]);
            if (recv === null) {
                return match;
            }
            const maskedFunc = maskedLines.slice (fn.open + 1, fn.close + 1).join ('\n');
            const decl = goAccessSingleDeclaration (maskedFunc, maskedLines[fn.open], holder);
            if ((decl === undefined) || (decl.type !== '[]any') || (decl.line === undefined)) {
                return match;
            }
            const init = new RegExp ('^\\s*var ' + holder + ' \\[\\]any = (?:ccxt\\.)?ListTyped\\((?:ccxt\\.)?PanicOnError\\(\\(<-this\\.(\\w+)Async\\([^\\n]*\\)\\)\\)\\)$').exec (decl.line);
            if (init === null) {
                return match;
            }
            const key = recv[1] + '.' + init[1];
            if (!proven.has (key)) {
                proven.set (key, goAsyncPairProducerInFile (content, masked, recv[1], init[1]));
            }
            if (!proven.get (key)) {
                return match;
            }
            let declLine = -1;
            for (let k = fn.open + 1; k < fn.close; k++) {
                if (new RegExp ('^\\s*var ' + holder + ' \\[\\]any = ').test (maskedLines[k])) {
                    declLine = k;
                    continue;
                }
                if (goTextWritesName (maskedLines[k], holder) || new RegExp ('\\b' + holder + '\\s*=\\s*append\\(').test (maskedLines[k])) {
                    return match;
                }
            }
            const declBlock = (declLine < 0) ? undefined : goTextEnclosingBlock (blocks, declLine);
            if ((declLine < 0) || (declLine >= index) || (declBlock === undefined) || !((declBlock.open < index) && (index <= declBlock.close))) {
                return match;
            }
            changed = true;
            return consumer + '(' + holder + '[' + slot + '])';
        });
    }
    return changed ? lines.join ('\n') : content;
}

// w8 M40: `var h []any = ListTyped(r.Value)` after `r := <-promiseAll(P)` where P is a `[]any{a, b}` literal (inline or a
// single unwritten `var P []any = []any{..}`) holds exactly len(P) results (promiseAll returns `results` or panics on error),
// so a bare `x := GetValue(h, N)` slot read with N < len(P) is `x := h[N]`. Any rewritten holder/task list keeps GetValue.
function hx11w8PromiseAllSlotReads (content: string): string {
    if (!/<-(?:ccxt\.)?[pP]romiseAll\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const { 'blocks': blocks } = goTextBlocks (masked);
    const literalArity = (text: string): number => {
        const lit = /^(?:ccxt\.)?\[\]any\{([\s\S]*)\}$/.exec (text.trim ());
        if (lit === null) {
            return -1;
        }
        let depth = 0;
        let count = (lit[1].trim () === '') ? 0 : 1;
        for (let i = 0; i < lit[1].length; i++) {
            const c = lit[1][i];
            if ((c === '(') || (c === '[') || (c === '{')) {
                depth++;
            } else if ((c === ')') || (c === ']') || (c === '}')) {
                depth--;
            } else if ((c === ',') && (depth === 0)) {
                count++;
            }
        }
        return ((depth === 0) && (lit[1].trim ().slice (-1) !== ',')) ? count : -1;
    };
    // the declaration's initialiser, joined over the lines of a multi-line literal
    const initText = (first: string, j: number, limit: number): string => {
        let text = first;
        let depth = 0;
        for (let q = j; q < limit; q++) {
            const part = (q === j) ? first : masked[q];
            if (q > j) {
                text += '\n' + part;
            }
            for (const c of part) {
                depth += ('([{'.indexOf (c) >= 0 ? 1 : 0) - (')]}'.indexOf (c) >= 0 ? 1 : 0);
            }
            if (depth <= 0) {
                break;
            }
        }
        return text;
    };
    let changed = false;
    for (let d = 0; d < lines.length; d++) {
        const decl = /^\s*var (\w+) \[\]any = (?:ccxt\.)?ListTyped\((\w+)\.Value\)$/.exec (masked[d]);
        if (decl === null) {
            continue;
        }
        const holder = decl[1];
        const res = decl[2];
        const fn = blocks.find ((b: any) => (b.depth === 1) && (b.open < d) && (d <= b.close));
        const declBlock = goTextEnclosingBlock (blocks, d);
        if ((fn === undefined) || (declBlock === undefined)) {
            continue;
        }
        let resLine = -1;
        let arity = -1;
        let ok = true;
        for (let k = fn.open + 1; k < fn.close; k++) {
            if (k === d) {
                continue;
            }
            const take = new RegExp ('^\\s*' + res + ' := <-(?:ccxt\\.)?[pP]romiseAll\\((.+)\\)$').exec (masked[k]);
            if (take !== null) {
                if ((resLine >= 0) || (k > d)) {
                    ok = false;
                    break;
                }
                resLine = k;
                const arg = take[1].trim ();
                if (/^\w+$/.test (arg)) {
                    // len(P) >= its literal size + the appends made in the declaring block before the receive
                    let found = -1;
                    let extra = 0;
                    let jumps = false;
                    for (let j = fn.open + 1; j < fn.close; j++) {
                        const pd = new RegExp ('^\\s*var ' + arg + ' \\[\\]any = (.+)$').exec (masked[j]);
                        if (/\bgoto\b/.test (masked[j])) {
                            jumps = true;
                        }
                        if (pd !== null) {
                            if ((found >= 0) || (j > k)) {
                                found = -2;
                                break;
                            }
                            found = j;
                            arity = literalArity (initText (pd[1], j, fn.close));
                        } else if (new RegExp ('^\\s*' + arg + ' = append\\(' + arg + ', ').test (masked[j])) {
                            if ((found >= 0) && (j < k) && (goTextEnclosingBlock (blocks, j) === goTextEnclosingBlock (blocks, found))) {
                                extra++;
                            }
                        } else if (goTextWritesName (masked[j], arg)) {
                            found = -2;
                            break;
                        }
                    }
                    if ((found < 0) || (arity < 0) || (jumps && (extra > 0))) {
                        arity = -1;
                    } else {
                        arity += extra;
                    }
                } else {
                    arity = literalArity (arg);
                }
            } else if (goTextWritesName (masked[k], res) || goTextWritesName (masked[k], holder)) {
                ok = false;
                break;
            }
        }
        if (!ok || (resLine < 0) || (arity < 0)) {
            continue;
        }
        const readRx = new RegExp ('(?<![\\w.])(?:ccxt\\.)?GetValue\\(' + holder + ', (\\d+)\\)', 'g');
        for (let k = d + 1; k < fn.close; k++) {
            if (!((declBlock.open < k) && (k <= declBlock.close)) || (masked[k].indexOf ('GetValue(') < 0)) {
                continue;
            }
            lines[k] = lines[k].replace (readRx, (match: string, slot: string, offset: number) => {
                if ((masked[k].substr (offset, match.length) !== match) || (Number (slot) >= arity)) {
                    return match;
                }
                changed = true;
                return holder + '[' + slot + ']';
            });
        }
    }
    return changed ? lines.join ('\n') : content;
}

// w8: inside `for i := 0; i < len(h); i++` (i, h unwritten in the body) `GetValue(h, i)` of a promiseAll holder is `h[i]`.
function hx11w8PromiseAllSelfBoundReads (content: string): string {
    if (!/<-(?:ccxt\.)?[pP]romiseAll\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const { 'blocks': blocks } = goTextBlocks (masked);
    const forRx = /^\s*for (\w+) := 0; \1 < len\((\w+)\); \1\+\+ \{$/;
    let changed = false;
    for (let d = 0; d < lines.length; d++) {
        const decl = /^\s*var (\w+) \[\]any = (?:ccxt\.)?ListTyped\((\w+)\.Value\)$/.exec (masked[d]);
        const fn = (decl === null) ? undefined : blocks.find ((b: any) => (b.depth === 1) && (b.open < d) && (d <= b.close));
        const declBlock = (decl === null) ? undefined : goTextEnclosingBlock (blocks, d);
        if ((decl === null) || (fn === undefined) || (declBlock === undefined)) {
            continue;
        }
        const holder = decl[1];
        let ok = true;
        let takes = 0;
        for (let k = fn.open + 1; k < fn.close; k++) {
            if (new RegExp ('^\\s*' + decl[2] + ' := <-(?:ccxt\\.)?[pP]romiseAll\\(').test (masked[k])) {
                takes++;
            } else if ((k !== d) && (goTextWritesName (masked[k], holder) || goTextWritesName (masked[k], decl[2]))) {
                ok = false;
            }
        }
        if (!ok || (takes !== 1)) {
            continue;
        }
        for (const b of blocks) {
            const h = forRx.exec (masked[b.open]);
            if ((h === null) || (h[2] !== holder) || !((declBlock.open < b.open) && (b.open > d) && (b.close <= declBlock.close))) {
                continue;
            }
            const body = masked.slice (b.open + 1, b.close + 1).join ('\n');
            if (goTextWritesName (body, h[1]) || goTextWritesName (body, holder)) {
                continue;
            }
            const readRx = new RegExp ('(?<![\\w.])(?:ccxt\\.)?GetValue\\(' + holder + ', ' + h[1] + '\\)', 'g');
            for (let k = b.open + 1; k < b.close; k++) {
                lines[k] = lines[k].replace (readRx, (match: string, offset: number) => {
                    if (masked[k].substr (offset, match.length) !== match) {
                        return match;
                    }
                    changed = true;
                    return holder + '[' + h[1] + ']';
                });
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}

// w8 r16: `P = append(P, ..)` is the only write of `var P []any = []any{}`, runs once per pass of a top-level
// `for i := 0; i < len(K); i++` (no continue/break/return/goto, i and K unwritten after it opens), so promiseAll(P) holds
// len(K) results. A later `GetValue(h, j)` inside a `for j := 0; j < len(K); j++` that leaves j and K alone is `h[j]`.
function hx11w8PromiseAllLoopReads (content: string): string {
    if (!/<-(?:ccxt\.)?[pP]romiseAll\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const { 'blocks': blocks } = goTextBlocks (masked);
    const forRx = /^\s*for (\w+) := 0; \1 < len\((\w+)\); \1\+\+ \{$/;
    let changed = false;
    for (let d = 0; d < lines.length; d++) {
        const decl = /^\s*var (\w+) \[\]any = (?:ccxt\.)?ListTyped\((\w+)\.Value\)$/.exec (masked[d]);
        const fn = (decl === null) ? undefined : blocks.find ((b: any) => (b.depth === 1) && (b.open < d) && (d <= b.close));
        const declBlock = (decl === null) ? undefined : goTextEnclosingBlock (blocks, d);
        if ((decl === null) || (fn === undefined) || (declBlock === undefined)) {
            continue;
        }
        const holder = decl[1];
        const res = decl[2];
        let takeLine = -1;
        let list = '';
        let ok = true;
        for (let k = fn.open + 1; k < d; k++) {
            const take = new RegExp ('^\\s*' + res + ' := <-(?:ccxt\\.)?[pP]romiseAll\\((\\w+)\\)$').exec (masked[k]);
            if (take !== null) {
                ok = ok && (takeLine < 0);
                takeLine = k;
                list = take[1];
            } else if (goTextWritesName (masked[k], res) || goTextWritesName (masked[k], holder)) {
                ok = false;
            }
        }
        if (!ok || (takeLine < 0)) {
            continue;
        }
        let declared = false;
        let appendLine = -1;
        for (let k = fn.open + 1; k < fn.close; k++) {
            if (new RegExp ('^\\s*var ' + list + ' \\[\\]any = (?:ccxt\\.)?\\[\\]any\\{\\}$').test (masked[k]) && !declared && (k < takeLine)) {
                declared = true;
            } else if (new RegExp ('^\\s*' + list + ' = append\\(' + list + ', ').test (masked[k]) && (appendLine < 0) && (k < takeLine)) {
                appendLine = k;
            } else if (goTextWritesName (masked[k], list) || (new RegExp ('\\b' + list + '\\b').test (masked[k]) && (k !== takeLine) && (k > takeLine))) {
                ok = false;
            }
        }
        const loop = (appendLine < 0) ? undefined : goTextEnclosingBlock (blocks, appendLine);
        const head = (loop === undefined) ? null : forRx.exec (masked[loop.open]);
        const outer = (loop === undefined) ? undefined : goTextEnclosingBlock (blocks, loop.open);
        if (!ok || !declared || (head === null) || (outer === undefined) || (outer.open !== fn.open) || (loop.close >= takeLine)) {
            continue;
        }
        const bound = head[2];
        const counter = head[1];
        const known = new RegExp ('\\bvar ' + bound + '\\b|\\b' + bound + ' :=').test (masked.slice (fn.open, loop.open).join ('\n')) || new RegExp ('[(,] ?' + bound + ' ').test (masked[fn.open]);
        for (let k = loop.open + 1; k <= loop.close; k++) {
            if (/\b(?:continue|break|return|goto)\b/.test (masked[k]) || goTextWritesName (masked[k], counter) || goTextWritesName (masked[k], bound)) {
                ok = false;
            }
        }
        for (let k = loop.close + 1; k < fn.close; k++) {
            if (goTextWritesName (masked[k], bound) && !forRx.test (masked[k])) {
                ok = false;
            }
        }
        if (!ok || !known) {
            continue;
        }
        for (let k = d + 1; k < fn.close; k++) {
            const read = new RegExp ('^(\\s*(?:var \\w+ [\\w.*\\[\\]]+ = |\\w+ := ))(?:ccxt\\.)?GetValue\\(' + holder + ', (\\w+)\\)$').exec (lines[k]);
            if ((read === null) || (masked[k] !== lines[k]) || !((declBlock.open < k) && (k <= declBlock.close))) {
                continue;
            }
            let inside = false;
            for (const b of blocks) {
                const h = forRx.exec (masked[b.open]);
                if ((b.open < k) && (k <= b.close) && (b.open > takeLine) && (h !== null) && (h[1] === read[2]) && (h[2] === bound)) {
                    const body = masked.slice (b.open + 1, b.close + 1).join ('\n');
                    inside = !goTextWritesName (body, read[2]) && !goTextWritesName (body, holder);
                }
            }
            if (inside) {
                lines[k] = read[1] + holder + '[' + read[2] + ']';
                changed = true;
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}

function hx11w8PromiseAllLoopSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx11 r16 promiseAll loop slots: ' + msg); } };
    const fn = (b: string) => 'func (this *X) f(keys []string) any {\n' + b + '\treturn nil\n}\n';
    const build = '\tvar promises []any = []any{}\n\tfor i := 0; i < len(keys); i++ {\n\t\tpromises = append(promises, this.G(keys[i]))\n\t}\n';
    const take = '\tr := <-ccxt.PromiseAll(promises)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar responses []any = ccxt.ListTyped(r.Value)\n';
    const read = '\tfor i := 0; i < len(keys); i++ {\n\t\tvar response any = ccxt.GetValue(responses, i)\n\t\tthis.H(response)\n\t}\n';
    ok (hx11w8PromiseAllLoopReads (fn (build + take + read)).includes ('var response any = responses[i]'), 'same-bound loops read natively');
    const pos = hx11w8PromiseAllLoopReads (fn (build + take + read));
    ok (hx11w8PromiseAllLoopReads (pos) === pos, 'idempotent');
    ok (hx11w8PromiseAllLoopReads (fn (build.replace ('this.G', 'if i > 0 {\n\t\tcontinue\n\t}\n\t\tthis.G') + take + read)).includes ('GetValue(responses, i)'), 'continue before the append keeps GetValue');
    ok (hx11w8PromiseAllLoopReads (fn (build.replace ('\t\tpromises', '\t\tif i > 0 {\n\t\t\tpromises').replace ('))\n', '))\n\t\t}\n') + take + read)).includes ('GetValue(responses, i)'), 'conditional append keeps GetValue');
    ok (hx11w8PromiseAllLoopReads (fn (build + '\tkeys = append(keys, "x")\n' + take + read)).includes ('GetValue(responses, i)'), 'bound grown between loops keeps GetValue');
    ok (hx11w8PromiseAllLoopReads (fn (build + take + read.replace ('len(keys)', 'len(other)'))).includes ('GetValue(responses, i)'), 'different read bound keeps GetValue');
    ok (hx11w8PromiseAllLoopReads (fn (build + take + read.replace ('\t\tthis.H', '\t\ti++\n\t\tthis.H'))).includes ('GetValue(responses, i)'), 'counter written keeps GetValue');
    ok (hx11w8PromiseAllLoopReads (fn (build + '\tpromises = append(promises, this.G(nil))\n' + take + read)).includes ('GetValue(responses, i)'), 'second append keeps GetValue');
    ok (hx11w8PromiseAllLoopReads (fn (build.replace ('for i := 0; i < len(keys); i++ {', 'for i := 1; i < len(keys); i++ {') + take + read)).includes ('GetValue(responses, i)'), 'offset append loop keeps GetValue');
    ok (formatGoSource ('selftest.go', 'package ccxt\n\n' + fn (build + take + read)).includes ('responses[i]'), 'wired into formatGoSource');
    return problems;
}

function hx11w8PromiseAllSlotSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx11 w8 promiseAll slots: ' + msg); } };
    const fn = (b: string) => 'func (this *X) f(p any) any {\n' + b + '\treturn nil\n}\n';
    const take = '\tr := <-promiseAll([]any{a, this.G(p)})\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar hVariable []any = ListTyped(r.Value)\n';
    const reads = '\tx := GetValue(hVariable, 0)\n\ty := GetValue(hVariable, 1)\n';
    const pos = hx11w8PromiseAllSlotReads (fn (take + reads));
    ok (pos.includes ('x := hVariable[0]') && pos.includes ('y := hVariable[1]'), 'inline literal slots read natively');
    ok (hx11w8PromiseAllSlotReads (pos) === pos, 'idempotent');
    ok (hx11w8PromiseAllSlotReads (fn (take + '\tz := GetValue(hVariable, 2)\n')).includes ('GetValue(hVariable, 2)'), 'slot past the arity keeps GetValue');
    const named = '\tvar promises []any = []any{a, b}\n' + take.replace ('[]any{a, this.G(p)}', 'promises');
    ok (hx11w8PromiseAllSlotReads (fn (named + reads)).includes ('y := hVariable[1]'), 'named literal list reads natively');
    ok (hx11w8PromiseAllSlotReads (fn (named + '\tpromises = append(promises, c)\n' + reads + '\tw := GetValue(hVariable, 2)\n')).includes ('GetValue(hVariable, 2)'), 'append after the receive does not grow the results');
    ok (hx11w8PromiseAllSlotReads (fn ('\tvar promises []any = []any{}\n\tif p != nil {\n\t\tpromises = append(promises, a)\n\t}\n' + take.replace ('[]any{a, this.G(p)}', 'promises') + reads)).includes ('GetValue(hVariable, 0)'), 'conditionally built list keeps GetValue');
    ok (hx11w8PromiseAllSlotReads (fn (take + '\thVariable = nil\n' + reads)).includes ('GetValue(hVariable, 0)'), 'rewritten holder keeps GetValue');
    ok (formatGoSource ('selftest.go', 'package ccxt\n\n' + fn (take + reads)).includes ('y := hVariable[1]'), 'wired into formatGoSource');
    const built = '\tvar promises []any = []any{}\n\tpromises = append(promises, a)\n\tif p != nil {\n\t\tpromises = append(promises, b)\n\t}\n' + take.replace ('[]any{a, this.G(p)}', 'promises');
    const mixed = hx11w8PromiseAllSlotReads (fn (built + '\tx := GetValue(hVariable, 0)\n\ty := GetValue(hVariable, 1)\n\tz := f(GetValue(hVariable, 0), 3)\n'));
    ok (mixed.includes ('x := hVariable[0]') && mixed.includes ('y := GetValue(hVariable, 1)') && mixed.includes ('f(hVariable[0], 3)'), 'unconditional appends bound the slot, conditional ones do not; nested reads');
    const loopHeld = hx11w8PromiseAllSelfBoundReads (fn (take + '\tfor i := 0; i < len(hVariable); i++ {\n\t\tv := f(GetValue(hVariable, i))\n\t}\n'));
    ok (loopHeld.includes ('f(hVariable[i])'), 'read under len(holder) loop is native');
    ok (hx11w8PromiseAllSelfBoundReads (fn (take + '\tfor i := 0; i < len(hVariable); i++ {\n\t\ti++\n\t\tv := f(GetValue(hVariable, i))\n\t}\n')).includes ('GetValue(hVariable, i)'), 'counter written keeps GetValue');
    return problems;
}

function goAsyncTupleIndexSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const wrap = 'func (this *X) PairAsync(p any) <-chan any {\n\tch := make(chan any, 1)\n\tgo this.pairBody(ch, p)\n\treturn ch\n}\n';
    const body = (b: string) => 'func (this *X) pairBody(ch chan any, p any) any {\n\tdefer close(ch)\n\tdefer ReturnPanicError(ch)\n' + b + '}\n';
    const good = '\tif p != nil {\n\n\t\tch <- []any{p, p}\n\t\treturn nil\n\t}\n\tvar r any = func(this *X) any {\n\t\treturn nil\n\t}(this)\n\n\tch <- []any{r, p}\n\treturn nil\n';
    const reader = 'func (this *X) f(p any) any {\n\tvar h []any = ListTyped(PanicOnError((<-this.PairAsync(p))))\n\tvar a *string = SafeStringPtr(GetValue(h, 0))\n\tvar b map[string]any = MapTyped(GetValue(h, 1))\n\treturn nil\n}\n';
    const run = (b: string, r: string = reader) => nativeAsyncTupleHolderReads ('package ccxt\n' + wrap + body (b) + r);
    const pos = run (good);
    ok (pos.indexOf ('SafeStringPtr(h[0])') >= 0 && pos.indexOf ('MapTyped(h[1])') >= 0, 'async pair producer reads go native');
    ok (nativeAsyncTupleHolderReads (pos) === pos, 'second application is a no-op');
    ok (run ('\tif p != nil {\n\t\tpanic(\"x\")\n\t}\n\tch <- []any{p, p}\n\treturn nil\n').indexOf ('h[1]') >= 0, 'panic exits are fine');
    const keepBodies: string[] = [
        '\tif p != nil {\n\t\treturn nil\n\t}\n\tch <- []any{p, p}\n\treturn nil\n',
        '\tch <- []any{p, p, p}\n\treturn nil\n',
        '\tch <- p\n\treturn nil\n',
        '\tch <- []any{p, p}\n',
        '\tfor {\n\t\tpanic(\"break\")\n\t}\n\tch <- []any{p, p}\n\treturn nil\n',
        '\tgo func() {\n\t\tch <- []any{p, p}\n\t}()\n\treturn nil\n',
        '\tif p != nil {\n\t\tch <- []any{p}\n\t\treturn nil\n\t}\n\tch <- []any{p, p}\n\treturn nil\n',
    ];
    keepBodies.forEach ((b: string, i: number) => ok (run (b).indexOf ('GetValue(h, 1)') >= 0, 'async negative body ' + i + ' keeps GetValue'));
    const keepReaders: string[] = [
        reader.replace ('\treturn nil\n}', '\th = nil\n\treturn nil\n}'),
        reader.replace ('this.PairAsync', 'this.OtherAsync'),
        reader.replace ('func (this *X) f', 'func (this *Y) f'),
        reader.replace ('MapTyped(GetValue(h, 1))', 'MapTyped(GetValue(h, 2))').replace ('SafeStringPtr(GetValue(h, 0))', 'IsEqual(GetValue(h, 1), nil)'),
    ];
    keepReaders.forEach ((r: string, i: number) => ok (run (good, r).indexOf ('GetValue(h, ') >= 0, 'async negative reader ' + i + ' keeps GetValue'));
    return problems;
}

// ===== H2K-g06: typed endpoint receives read their checked Value =====
// `MapTyped(PanicOnError((<-stub(..)).Raw))` on an EndpointResult[map[string]any] stub is
// `(<-stub(..)).Checked()`: same failure check on Raw, and Value is endpointValue(Raw) = MapTyped(Raw).
function goEndpointCheckedReceives (content: string): string {
    const close = (text: string, open: number): number => {
        let depth = 0;
        for (let i = open; i < text.length; i++) {
            const c = text[i];
            if (c === '"' || c === '`' || c === "'") {
                i = goSkipLiteralText (text, i);
            } else if (c === '(') {
                depth += 1;
            } else if (c === ')') {
                depth -= 1;
                if (depth === 0) {
                    return i;
                }
            } else if (c === '\n') {
                return -1;
            }
        }
        return -1;
    };
    const mapStubs = goEndpointMapStubNames ();
    const wrapper = /\b(?:ccxt\.)?MapTyped\((?:ccxt\.)?PanicOnError\(\(<-this\.(\w+)\(/g;
    let out = '';
    let cursor = 0;
    for (let m = wrapper.exec (content); m !== null; m = wrapper.exec (content)) {
        const recvOpen = content.indexOf ('(<-', m.index);
        const recvEnd = close (content, recvOpen);
        if (!mapStubs.has (m[1]) || (recvEnd < 0) || !content.startsWith ('.Raw))', recvEnd + 1)) {
            continue;
        }
        out += content.substring (cursor, m.index) + content.substring (recvOpen, recvEnd + 1) + '.Checked()';
        cursor = recvEnd + 1 + '.Raw))'.length;
        wrapper.lastIndex = cursor;
    }
    return out + content.substring (cursor);
}

// stub names every generated `<id>_api.go` declares only as EndpointResult[map[string]any]
// (a name some exchange types as a list or string is left alone)
// `var`: overwriteFileAndFolder runs from main before this module tail is evaluated
var GO_ENDPOINT_MAP_STUBS: Set<string> | undefined;
function goEndpointMapStubNames (): Set<string> {
    if (GO_ENDPOINT_MAP_STUBS === undefined) {
        const sig = /^func \(this \*\w+\) (\w+)\(args \.\.\.any\) <-chan (?:ccxt\.)?EndpointResult\[(.+)\] \{$/gm;
        const map = new Set<string> ();
        const other = new Set<string> ();
        for (const dir of [ EXCHANGES_FOLDER + '/', EXCHANGES_FOLDER + '/prediction/' ]) {
            const files = fs.existsSync (dir) ? fs.readdirSync (dir).filter ((f) => f.endsWith ('_api.go')) : [];
            for (const f of files) {
                const text = fs.readFileSync (dir + f, 'utf8');
                for (let m = sig.exec (text); m !== null; m = sig.exec (text)) {
                    ((m[2] === 'map[string]any') ? map : other).add (m[1]);
                }
            }
        }
        GO_ENDPOINT_MAP_STUBS = new Set ([ ...map ].filter ((n) => !other.has (n)));
    }
    return GO_ENDPOINT_MAP_STUBS;
}

// `MapTyped(this.Omit(x, ..))` with x declared map[string]any in scope is `this.OmitDict(x, ..)`:
// Omit of a map always returns a fresh map[string]any.
function goOmitDictOfTypedMaps (content: string): string {
    const lines = content.split ('\n');
    let funcStart = 0;
    const call = /\b(?:ccxt\.)?MapTyped\(this\.Omit\((\w+),/g;
    for (let i = 0; i < lines.length; i++) {
        if (/^func /.test (lines[i])) {
            funcStart = i;
        }
        let line = lines[i];
        call.lastIndex = 0;
        for (let m = call.exec (line); m !== null; m = call.exec (line)) {
            const end = goCloseParen (line, m.index + m[0].indexOf ('('));
            if ((end < 0) || (line[end - 1] !== ')') || (goNearestLocalType (lines, funcStart, i, m[1]) !== 'map[string]any')) {
                continue;
            }
            const inner = line.substring (m.index + m[0].length, end - 1);
            const replacement = 'this.OmitDict(' + m[1] + ',' + inner + ')';
            line = line.substring (0, m.index) + replacement + line.substring (end + 1);
            call.lastIndex = m.index + replacement.length;
        }
        lines[i] = line;
    }
    return lines.join ('\n');
}

function goCloseParen (text: string, open: number): number {
    let depth = 0;
    for (let k = open; k < text.length; k++) {
        const c = text[k];
        if (c === '"' || c === '`' || c === "'") {
            k = goSkipLiteralText (text, k);
        } else if (c === '(') {
            depth += 1;
        } else if (c === ')') {
            depth -= 1;
            if (depth === 0) {
                return k;
            }
        }
    }
    return -1;
}

// the Go type of `name` at line `at`: its nearest enclosing `var name T =`, else a `name map[string]any`
// parameter of the func; undefined when a closure or a `:=` could rebind it in between
function goNearestLocalType (lines: string[], funcStart: number, at: number, name: string): string | undefined {
    const decl = new RegExp ('^(\\s*)var ' + name + ' (map\\[string\\]any|\\S+) = ');
    const rebind = new RegExp ('\\b' + name + '(?:, \\w+)* :=|, ' + name + ' :=|func\\([^)]*\\b' + name + ' ');
    const indent = (l: string) => /^\s*/.exec (l)[0].length;
    let floor = indent (lines[at]);
    for (let k = at; k > funcStart; k--) {
        if ((k < at) && (lines[k].trim () !== '')) {
            floor = Math.min (floor, indent (lines[k]));
        }
        const m = decl.exec (lines[k]);
        if ((m !== null) && (k < at)) {
            return (m[1].length <= floor) ? m[2] : undefined;
        }
        if (rebind.test (lines[k])) {
            return undefined;
        }
    }
    const param = new RegExp ('[(,] ?' + name + ' (map\\[string\\]any)[,)]').exec (lines[funcStart]);
    return (param === null) ? undefined : param[1];
}

// `MapTyped(this.SafeDict{,2,N}(..))` is the typed sibling `this.SafeDict{,2,N}Map(..)` (exchange_safe.go)
function goSafeDictMapReads (content: string): string {
    const call = /\b(?:ccxt\.)?MapTyped\(this\.(SafeDict(?:2|N)?)\(/g;
    let out = '';
    let cursor = 0;
    for (let m = call.exec (content); m !== null; m = call.exec (content)) {
        const open = m.index + m[0].indexOf ('(');
        const end = goCloseParen (content, open);
        if ((end < 0) || (content[end - 1] !== ')') || (goCloseParen (content, m.index + m[0].length - 1) !== end - 1)) {
            continue;
        }
        out += content.substring (cursor, m.index) + 'this.' + m[1] + 'Map(' + content.substring (m.index + m[0].length, end);
        cursor = end + 1;
        call.lastIndex = cursor;
    }
    return out + content.substring (cursor);
}

// ===== H2K-g07: AwaitResult -> native channel receive in typed wrappers =====
// Same steps as AwaitResult: one receive, "panic:" string -> error, else convert to the wrapper type.
function goNativeAwaitConversion (converter: string): string {
    if (converter === 'Untyped') {
        return 'raw';
    }
    const assertion = /^AssertAs\[(.+)\]$/.exec (converter);
    return assertion ? `raw.(${assertion[1]})` : `${converter}(raw)`;
}

function goNativeAwaitBody (indent: string, valueType: string, converter: string, call: string, emptyValue: string): string[] {
    // an `any` result needs no conversion local: return the received value itself
    const tail = (converter === 'Untyped') ? [ `${indent}return raw, nil` ] : [
        `${indent}var res ${valueType} = ${goNativeAwaitConversion (converter)}`,
        `${indent}return res, nil`,
    ];
    return [
        `${indent}raw := <-${call}`,
        `${indent}if IsError(raw) {`,
        `${indent}\treturn ${emptyValue}, CreateReturnError(raw)`,
        `${indent}}`,
        ...tail,
    ];
}

// ===== H2K-g08: native IsEqual on proven operands =====
// ws/prediction text is still unqualified when the typed/param/string-literal IsEqual passes run
// with 'ccxt.IsEqual(', so they are re-run here with the bare spelling (idempotent on REST text).
// IsEqual(x, true|false) on an `any` box: reuses the string-literal box proof (no pointer can
// reach the box), where the helper is exactly `==`; pointer-kind locals keep the helper.
function h2kG08BoolLiteralCompares (content: string): string {
    const masked = content.replace (/(?<![.\w])IsEqual\((\w+), (true|false)\)/g, 'IsEqual($1, "__h2k_g08_bool_$2__")');
    if (masked === content) {
        return content;
    }
    return goStringLiteralNativeCompares (masked, 'IsEqual(')
        .replace (/\((\w+) != nil && \*\1 == "__h2k_g08_bool_(true|false)__"\)/g, 'IsEqual($1, $2)')
        .replace (/\((\w+) == nil \|\| \*\1 != "__h2k_g08_bool_(true|false)__"\)/g, '!IsEqual($1, $2)')
        .replace (/"__h2k_g08_bool_(true|false)__"/g, '$1');
}

// IsEqual(x, true|false) on a name declared once in the block as `var x bool = ...`
function h2kG08TypedBoolCompareText (fn: string): string {
    const signature = fn.slice (0, fn.indexOf ('{'));
    return fn.replace (/(!?)(?<![.\w])IsEqual\((\w+), (true|false)\)/g, ((m: string, not: string, name: string, lit: string) => {
        const decls = fn.match (new RegExp ('\\bvar ' + name + '\\b[^\\n]*', 'g')) || [];
        const rebinds = new RegExp ('(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ').test (fn);
        if ((decls.length !== 1) || !new RegExp ('^var ' + name + ' bool = ').test (decls[0]) || rebinds || new RegExp ('[(,]\\s*' + name + ' ').test (signature)) {
            return m;
        }
        return '(' + name + ((not === '!') ? ' != ' : ' == ') + lit + ')';
    }) as any);
}

// base struct fields whose every write (hand-written + generated) is a non-nil *ArrayCache*,
// &sync.Map, map literal or untyped nil, or whose Go type is a map/slice: `== nil` is exact.
// Credential fields stay: prediction writes a *string into ApiKey.
function h2kG08FieldNilCompares (content: string): string {
    return content.replace (/(!?)(?<![.\w])IsEqual\(this\.(Orders|MyTrades|Positions|Liquidations|Ids|Clients), nil\)/g, ((_m: string, not: string, field: string) => '(this.' + field + ((not === '!') ? ' != ' : ' == ') + 'nil)') as any);
}

export function h2kG08NativeEquality (content: string): string {
    content = h2kG08FieldNilCompares (content);
    content = goTypedNativeNilCompares (content, 'IsEqual(');
    content = goProvenParamNativeNilCompares (content, 'IsEqual(');
    content = goStringLiteralNativeCompares (content, 'IsEqual(');
    content = h2kG08BoolLiteralCompares (content);
    const ranges = goFuncBlockRanges (content);
    for (let i = ranges.length - 1; i >= 0; i--) {
        const block = content.slice (ranges[i].start, ranges[i].end);
        const rewritten = goCollapseDuplicateNilCompares (h2kG08TypedBoolCompareText (block), 'IsEqual(');
        if (rewritten !== block) {
            content = content.slice (0, ranges[i].start) + rewritten + content.slice (ranges[i].end);
        }
    }
    return content;
}

function h2kG08SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (body: string): string => h2kG08NativeEquality ('\nfunc (this *X) f(p any, optionalArgs ...any) any {\n' + body + '\treturn nil\n}\n');
    const typed = f ('\tvar s []string = this.MarketSymbols(p)\n\tvar m map[string]any = nil\n\tif IsEqual(s, nil) && !IsEqual(m, nil) {\n\t}\n');
    ok (typed.indexOf ('if (s == nil) && (m != nil) {') >= 0, 'typed locals compare natively: ' + typed);
    const box = f ('\tu := GetValue(p, 0)\n\tvar v any = GetValue(p, \"k\")\n\tif IsEqual(u, true) || !IsEqual(v, false) || IsEqual(v, \"x\") {\n\t}\n');
    ok (box.indexOf ('if (u == true) || (v != false) || (v == \"x\") {') >= 0, 'bool/string literals on proven boxes: ' + box);
    const keep = f ('\tvar a any = this.SafeBool(p, \"k\")\n\tvar q *string = this.SafeString(p, \"k\")\n\tif IsEqual(a, true) || IsEqual(q, true) || IsEqual(p, true) || IsEqual(a, 1) {\n\t}\n');
    ok (keep.indexOf ('if IsEqual(a, true) || IsEqual(q, true) || IsEqual(p, true) || IsEqual(a, 1) {') >= 0, 'pointer/param/numeric keep the helper: ' + keep);
    const b = f ('\tvar t bool = this.InArray(p, p)\n\tvar w bool = true\n\tw = false\n\tif IsEqual(t, true) && !IsEqual(w, false) {\n\t}\n');
    ok (b.indexOf ('if (t == true) && (w != false) {') >= 0, 'typed bool locals compare natively: ' + b);
    const rb = f ('\tvar t bool = true\n\tt, ok := p.(bool)\n\tif IsEqual(t, true) && ok {\n\t}\n');
    ok (rb.indexOf ('IsEqual(t, true)') >= 0, 'a rebound bool keeps the helper: ' + rb);
    const fields = f ('\tif IsEqual(this.Orders, nil) || !IsEqual(this.Positions, nil) || IsEqual(this.ApiKey, nil) || IsEqual(this.Balance, nil) {\n\t}\n');
    ok (fields.indexOf ('if (this.Orders == nil) || (this.Positions != nil) || IsEqual(this.ApiKey, nil) || IsEqual(this.Balance, nil) {') >= 0, 'cache fields only: ' + fields);
    ok (h2kG08NativeEquality (typed) === typed, 'second application is a no-op');
    ok (box.indexOf ('__h2k_g08') < 0 && keep.indexOf ('__h2k_g08') < 0, 'no sentinel survives');
    return problems;
}

// ===== H2K-g10: AddElementToObject receivers from the base handleUntilOption =====
// HandleUntilOption(key, R, p) returns MapTyped(R): R itself, never nil when R is a never-nil map local.
function h2kG10UntilRx (target: string, op: string, source: string): RegExp {
    return new RegExp ('^\\s*' + target + ', \\w+ ' + op + ' this\\.HandleUntilOption\\([^,()\\n]*, ' + source + ', ');
}

// the never-nil map local `name` with its `name, p = this.HandleUntilOption(_, name, _)` writes blanked out
function h2kG10SelfUntilNeverNil (funcLines: string[], name: string, declOf: (name: string) => any): boolean {
    const selfRx = h2kG10UntilRx (name, '=', name);
    let selfWrites = 0;
    const rest = funcLines.map ((line) => (selfRx.test (line) ? (selfWrites++, ' '.repeat (line.length)) : line)).join ('\n');
    return (selfWrites > 0) && goMapWriteLocalNeverNil (rest, declOf (name), name, declOf);
}

// `name` is either such a self-rebound local, or bound once by `name, p := this.HandleUntilOption(_, R, _)`
// before line k from a never-nil map local R (then name is R's map) and never written again
function h2kG10UntilReceiverNeverNil (masked: string[], start: number, k: number, maskedFunc: string, signature: string, name: string,
    declOf: (name: string) => any, typeAt: (name: string, k: number) => string | undefined): boolean {
    const n = goAccessEscape (name);
    const funcLines = maskedFunc.split ('\n');
    if ((n !== name) || new RegExp ('[(,]\\s*' + n + '\\b').test (signature.substring (signature.indexOf (')') + 1))) {
        return false;
    }
    if (typeAt (name, k) === 'map[string]any') {
        return h2kG10SelfUntilNeverNil (funcLines, name, declOf);
    }
    const writeRx = new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|&\\s*' + n + '\\b|\\bvar\\s+' + n + '\\b|\\b' + n + '\\s*(?:\\+\\+|--)|\\bfunc\\s*\\([^()]*\\b' + n + '\\b|\\bfor\\b[^\\n{]*\\b' + n + '\\b');
    const writes = funcLines.map ((line, i) => (writeRx.test (line) ? i : -1)).filter ((i) => i >= 0);
    if ((writes.length !== 1) || (start + writes[0] >= k)) {
        return false;
    }
    const bind = h2kG10UntilRx (n, ':=', '(\\w+)').exec (funcLines[writes[0]]);
    if ((bind === null) || (bind[1] === name) || (typeAt (bind[1], start + writes[0]) !== 'map[string]any')) {
        return false;
    }
    return goMapWriteLocalNeverNil (maskedFunc, declOf (bind[1]), bind[1], declOf) || h2kG10SelfUntilNeverNil (funcLines, bind[1], declOf);
}

// ===== H2K-g11: native BoxAbsent forwards =====
// `ch <- BoxAbsent(retResN)` for a `var retResN map[string]any|[]any` declared once in the same
// func: a nil container is sent as untyped nil, anything else as itself (BoxAbsent's two arms).
function h2kG11NativeBoxAbsentSends (content: string): string {
    if (content.indexOf ('BoxAbsent(retRes') < 0) {
        return content;
    }
    return content.replace (/\nfunc [\s\S]*?\n\}/g, (fn: string) => fn.replace (
        /^([ \t]*)ch <- (?:ccxt\.)?BoxAbsent\((retRes\d+)\)[ \t]*$/gm,
        (m: string, indent: string, name: string) => {
            const decls = fn.match (new RegExp ('(?<![\\w.])(?:var )?' + name + '\\b[^\\n=]*?(?::=|=)(?!=)', 'g')) || [];
            if ((decls.length !== 1) || !new RegExp ('var ' + name + ' (?:map\\[string\\]any|\\[\\]any) = ').test (fn)) {
                return m;
            }
            return indent + 'if ' + name + ' == nil {\n' + indent + '\tch <- nil\n' + indent + '} else {\n'
                + indent + '\tch <- ' + name + '\n' + indent + '}';
        }));
}

export function h2kG11SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push (msg); } };
    const fn = '\nfunc (this *X) f() {\n\tif p {\n\t\tvar retRes12 []any = ListTyped(PanicOnError(x))\n\t\tch <- BoxAbsent(retRes12)\n\t\treturn nil\n\t}\n}';
    const out = h2kG11NativeBoxAbsentSends (fn);
    ok (out.indexOf ('BoxAbsent') < 0 && out.indexOf ('\t\tif retRes12 == nil {\n\t\t\tch <- nil\n\t\t} else {\n\t\t\tch <- retRes12\n\t\t}\n\t\treturn nil') >= 0, 'typed forward goes native: ' + out);
    const ws = h2kG11NativeBoxAbsentSends ('\nfunc (this *X) f() {\n\tvar retRes1 map[string]any = MapTyped(v)\n\tch <- ccxt.BoxAbsent(retRes1)\n}');
    ok (ws.indexOf ('BoxAbsent') < 0, 'ccxt.-qualified form goes native');
    const keep = [
        '\nfunc (this *X) f() {\n\tvar retRes1 any = v\n\tch <- BoxAbsent(retRes1)\n}',
        '\nfunc (this *X) f() {\n\tvar retRes1 []any = ListTyped(v)\n\tretRes1 = w\n\tch <- BoxAbsent(retRes1)\n}',
        '\nfunc (this *X) f() {\n\tch <- BoxAbsent(retRes1)\n}',
    ];
    keep.forEach ((t, i) => ok (h2kG11NativeBoxAbsentSends (t) === t, 'unproven forward keeps BoxAbsent #' + i));
    return problems;
}

// ===== H2K-g12: ListTyped over a typed []any endpoint receive =====
// `ListTyped(PanicOnError((<-this.E(..)).Raw))` where E yields EndpointResult[[]any]: its Value is
// already endpointValue = ListTyped(Raw) (zero only on a panic string, which PanicOnError raises first).
function go_g12_endpoint_list (): RegExp {
    return /^(\t*)(var (\w+) \[\]any|(\w+)) = (ccxt\.)?ListTyped\(\5?PanicOnError\((\(<-this\.\w+\(.*\)\))\.Raw\)\)((?: \/\/.*)?)$/;
}

function nativeEndpointListReceives (content: string): string {
    if ((content.indexOf ('ListTyped(') < 0) || (content.indexOf ('.Raw))') < 0)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const out: string[] = [];
    for (let k = 0; k < lines.length; k++) {
        const m = go_g12_endpoint_list ().exec (lines[k]);
        const recvAt = (m === null) ? -1 : lines[k].indexOf (m[6], m[1].length);
        // the receive must be one balanced expression in the unmasked-literal view
        if ((m === null) || (recvAt < 0) || (goMatchingCloseText (masked[k], recvAt) !== recvAt + m[6].length - 1)) {
            out.push (lines[k]);
            continue;
        }
        let tmp = 'listEp' + k;
        while (new RegExp ('\\b' + tmp + '\\b').test (content)) {
            tmp += '_';
        }
        const pkg = (m[5] === undefined) ? '' : 'ccxt.';
        out.push (m[1] + tmp + ' := ' + m[6]);
        out.push (m[1] + pkg + 'PanicOnError(' + tmp + '.Raw)');
        out.push (m[1] + m[2] + ' = ' + tmp + '.Value' + m[7]);
    }
    return out.join ('\n');
}

function goEndpointListSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const decl = '\tvar r []any = ListTyped(PanicOnError((<-this.PublicGetX(this.Extend(req, params))).Raw))\n';
    const got = nativeEndpointListReceives ('func f() {\n' + decl + '}\n');
    ok (got === 'func f() {\n\tlistEp1 := (<-this.PublicGetX(this.Extend(req, params)))\n\tPanicOnError(listEp1.Raw)\n\tvar r []any = listEp1.Value\n}\n', 'decl form: ' + got);
    const asg = nativeEndpointListReceives ('\t\tr = ccxt.ListTyped(ccxt.PanicOnError((<-this.PublicGetX(p)).Raw)) // c\n');
    ok (asg === '\t\tlistEp0 := (<-this.PublicGetX(p))\n\t\tccxt.PanicOnError(listEp0.Raw)\n\t\tr = listEp0.Value // c\n', 'assign form: ' + asg);
    ok (nativeEndpointListReceives ('\tvar r []any = ListTyped(PanicOnError((<-this.A(")")).Raw))\n').indexOf ('.Value') > 0, 'string-literal paren');
    for (const keep of [
        '\tvar r []any = ListTyped(PanicOnError((<-this.FetchXAsync(p))))\n',
        '\tvar r []any = ListTyped(PanicOnError((<-this.A(p)).Raw)[0])\n',
        '\tvar r []any = ListTyped(PanicOnError((<-this.A(p)).Raw)) + ListTyped(PanicOnError((<-this.B(p)).Raw))\n',
        '\tvar r map[string]any = MapTyped(PanicOnError((<-this.A(p)).Raw))\n',
        '\tf(ListTyped(PanicOnError((<-this.A(p)).Raw)))\n',
    ]) {
        ok (nativeEndpointListReceives (keep) === keep, 'kept: ' + keep.trim ());
    }
    return problems;
}

// `var h []any = ListTyped(PanicOnError((<-this.<m>Async(..))))`: when the same-file body of <m> (same
// receiver) only sends nil, a []any literal, a once-declared []any local or a same-file []any call,
// the comma-ok assertion answers exactly what ListTyped did (nil -> nil slice, []any -> itself).
function go_g12_async_list (): RegExp {
    return /^(\t*)var (\w+) \[\]any = (ccxt\.)?ListTyped\(\3?PanicOnError\((\(<-this\.(\w+)Async\(.*\)\))\)\)((?: \/\/.*)?)$/;
}

function goG12ListSendIsProven (expr: string, body: string, returnsList: Set<string>): boolean {
    let e = expr.trim ();
    const box = /^(?:ccxt\.)?BoxAbsent\((.*)\)$/.exec (e);
    if ((box !== null) && (goMatchingCloseText (e, e.indexOf ('(')) === e.length - 1)) {
        e = box[1].trim ();
    }
    if ((e === 'nil') || (e.startsWith ('[]any{') && (goMatchingCloseText (e, 5) === e.length - 1))) {
        return true;
    }
    if (/^\w+$/.test (e)) {
        const decls = body.match (new RegExp ('\\bvar ' + e + '\\b[^\\n]*', 'g')) || [];
        const rebinds = new RegExp ('\\b' + e + '\\s*(?:,[\\w\\s,]*)?:=|[,(]\\s*' + e + '\\s+[\\w\\[*]|&' + e + '\\b').test (body);
        return (decls.length === 1) && /^var \w+ \[\]any(?: =|$)/.test (decls[0]) && !rebinds;
    }
    const call = /^this\.(\w+)\(/.exec (e);
    return (call !== null) && returnsList.has (call[1]) && (goMatchingCloseText (e, call[0].length - 1) === e.length - 1);
}

function goG12AsyncListProducer (masked: string, receiver: string, method: string, returnsList: Set<string>): boolean {
    const bodyName = method.charAt (0).toLowerCase () + method.slice (1) + 'Body';
    const wrapper = new RegExp ('\\nfunc \\(this \\*' + receiver + '\\) ' + method + 'Async\\([^\\n]*\\) <-chan any \\{\\n\\s*ch := make\\(chan any, 1\\)\\n\\s*go this\\.' + bodyName + '\\(ch(?:, [^\\n]*)?\\)\\n\\s*return ch\\n\\}\\n');
    if (!wrapper.test (masked) || (masked.split (') ' + method + 'Async(').length !== 2) || (masked.split (') ' + bodyName + '(').length !== 2)) {
        return false;
    }
    const start = masked.indexOf ('\nfunc (this *' + receiver + ') ' + bodyName + '(ch chan any');
    if (start < 0) {
        return false;
    }
    const end = masked.indexOf ('\n}\n', start);
    const lines = masked.substring (start + 1, end + 2).split ('\n');
    if ((lines[1].trim () !== 'defer close(ch)') || (lines[2].trim () !== 'defer ReturnPanicError(ch)')) {
        return false;
    }
    const body = lines.slice (3).join ('\n');
    for (const line of lines.slice (3)) {
        if (/\bgo\b/.test (line)) {
            return false;
        }
        const send = /^\s*ch <- (.*)$/.exec (line);
        if (send !== null) {
            if (!goG12ListSendIsProven (send[1], body, returnsList)) {
                return false;
            }
        } else if (/\bch\b/.test (line)) {
            return false;
        }
    }
    return true;
}

function nativeAsyncListReceives (content: string): string {
    if (content.indexOf ('ListTyped(') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const masked = maskedLines.join ('\n');
    const returnsList = new Set<string> ();
    const counts = new Map<string, number> ();
    for (const m of masked.matchAll (/^func (?:\(this \*\w+\) )?(\w+)\([^\n]*\) (\S[^\n{]*?) \{$/gm)) {
        counts.set (m[1], (counts.get (m[1]) || 0) + 1);
        if (m[2] === '[]any') {
            returnsList.add (m[1]);
        }
    }
    for (const [ name, n ] of counts) {
        if (n !== 1) {
            returnsList.delete (name);
        }
    }
    const proven = new Map<string, boolean> ();
    let receiver: string | undefined = undefined;
    const out: string[] = [];
    for (let k = 0; k < lines.length; k++) {
        const fn = /^func (?:\(this \*(\w+)\) )?/.exec (maskedLines[k]);
        if (fn !== null) {
            receiver = fn[1];
        }
        const m = go_g12_async_list ().exec (lines[k]);
        const recvAt = (m === null) ? -1 : lines[k].indexOf (m[4]);
        if ((m === null) || (receiver === undefined) || (recvAt < 0) || (goMatchingCloseText (maskedLines[k], recvAt) !== recvAt + m[4].length - 1)) {
            out.push (lines[k]);
            continue;
        }
        const key = receiver + '.' + m[5];
        if (!proven.has (key)) {
            proven.set (key, goG12AsyncListProducer (masked, receiver, m[5], returnsList));
        }
        if (!proven.get (key)) {
            out.push (lines[k]);
            continue;
        }
        let tmp = 'listRecv' + k;
        while (new RegExp ('\\b' + tmp + '\\b').test (content)) {
            tmp += '_';
        }
        out.push (m[1] + tmp + ', _ := ' + ((m[3] === undefined) ? '' : 'ccxt.') + 'PanicOnError(' + m[4] + ').([]any)');
        out.push (m[1] + 'var ' + m[2] + ' []any = ' + tmp + m[6]);
    }
    return out.join ('\n');
}

function goAsyncListSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const wrap = 'func (this *X) PairAsync(p any) <-chan any {\n\tch := make(chan any, 1)\n\tgo this.pairBody(ch, p)\n\treturn ch\n}\n';
    const body = (b: string) => 'func (this *X) pairBody(ch chan any, p any) any {\n\tdefer close(ch)\n\tdefer ReturnPanicError(ch)\n' + b + '}\n';
    const reader = 'func (this *X) f(p any) any {\n\tvar h []any = ListTyped(PanicOnError((<-this.PairAsync(p))))\n\treturn h\n}\n';
    const helper = 'func (this *X) Rows(p any) []any {\n\treturn nil\n}\n';
    const run = (b: string, r: string = reader) => nativeAsyncListReceives ('package ccxt\n' + wrap + body (b) + helper + r);
    for (const good of [ '\tch <- nil\n\treturn nil\n', '\tch <- []any{p}\n\treturn nil\n', '\tvar r []any = []any{}\n\tch <- r\n\treturn nil\n',
        '\tvar r []any = nil\n\tch <- BoxAbsent(r)\n\treturn nil\n', '\tch <- this.Rows(p)\n\treturn nil\n' ]) {
        const got = run (good);
        ok (got.indexOf ('\tlistRecv') >= 0 && got.indexOf (', _ := PanicOnError((<-this.PairAsync(p))).([]any)\n\tvar h []any = listRecv') >= 0 && got.indexOf ('ListTyped') < 0, 'converted: ' + good);
    }
    for (const bad of [ '\tch <- p\n\treturn nil\n', '\tvar r any = nil\n\tch <- r\n\treturn nil\n', '\tvar r []any = nil\n\tr := p\n\tch <- r\n\treturn nil\n',
        '\tch <- this.Other(p)\n\treturn nil\n', '\tgo func() {\n\t\tch <- nil\n\t}()\n\treturn nil\n', '\tf(ch)\n\treturn nil\n', '\tch <- []any{p}[0]\n\treturn nil\n' ]) {
        ok (run (bad).indexOf ('ListTyped(') >= 0, 'kept body: ' + bad.trim ());
    }
    ok (run ('\tch <- nil\n\treturn nil\n', reader.replace ('func (this *X) f', 'func (this *Y) f')).indexOf ('ListTyped(') >= 0, 'other receiver kept');
    ok (run ('\tch <- nil\n\treturn nil\n', reader.replace ('var h []any = ', 'h = ')).indexOf ('ListTyped(') >= 0, 'assignment form kept');
    return problems;
}

// ===== H2K-g13: native ObjectKeys / Remove on proven map[string]any locals =====
// `var ks []string = ObjectKeys(m)` -> range collection: the helper does not sort, answers nil
// for a nil map and a non-nil slice for an empty one; `Remove(m, k)` -> delete (helper: plain delete).
function h2kG13NativeKeysAndRemove (content: string): string {
    if (!/\b(?:ObjectKeys|Remove)\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const out: string[] = [];
    let start = -1;
    let offsets: number[] = [];
    let maskedFunc = '';
    const typeAt = (name: string, k: number): string | undefined => {
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl === undefined) || ((decl.index !== undefined) && (decl.index >= offsets[k - start]))) {
            return undefined;
        }
        return decl.type;
    };
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; j <= end && j < lines.length; j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
        } else if (lines[k] === '}') {
            start = -1;
        }
        out.push (...((start >= 0) && (k > start) ? h2kG13RewriteLine (lines[k], masked[k], k, maskedFunc, typeAt) : [ lines[k] ]));
    }
    return out.join ('\n');
}

function h2kG13RewriteLine (line: string, m: string, k: number, maskedFunc: string, typeAt: (name: string, k: number) => string | undefined): string[] {
    const keys = /^(\s*)var (\w+) \[\]string = (?:ccxt\.)?ObjectKeys\((\w+)\)$/.exec (m.replace (/\s+$/, ''));
    if (keys && (line.replace (/\s+$/, '') === m.replace (/\s+$/, '')) && (typeAt (keys[3], k) === 'map[string]any') && !/\bobjectKey\b/.test (maskedFunc)) {
        const [ , ind, ks, recv ] = keys;
        return [
            ind + 'var ' + ks + ' []string = nil',
            ind + 'if ' + recv + ' != nil {',
            ind + '\t' + ks + ' = make([]string, 0, len(' + recv + '))',
            ind + '\tfor objectKey := range ' + recv + ' {',
            ind + '\t\t' + ks + ' = append(' + ks + ', objectKey)',
            ind + '\t}',
            ind + '}',
        ];
    }
    const rm = /^(\s*)(?:ccxt\.)?Remove\((\w+), (\w+|"[^"\\\n]*")\)(\s*(?:\/\/.*)?)$/.exec (line);
    if (rm && /^\s*(?:ccxt\.)?Remove\(/.test (m) && (typeAt (rm[2], k) === 'map[string]any')
        && (rm[3].startsWith ('"') || (typeAt (rm[3], k) === 'string'))) {
        return [ rm[1] + 'delete(' + rm[2] + ', ' + rm[3] + ')' + rm[4] ];
    }
    return [ line ];
}

// ===== H2K-g14: native length / type-test on declared Go types =====
// A name declared exactly once in the func (param or `var x T`), never re-bound, address-taken or
// shadowed, reads as its declared type everywhere, so the helper's type switch folds statically.
function goG14DeclaredType (fn: string, name: string): string | undefined {
    const header = fn.split ('\n')[1] || '';
    const body = fn.slice (header.length + 1);
    const decls = body.match (new RegExp ('\\bvar ' + name + ' ([\\w*.\\[\\]]+)(?= =|\\n)', 'g')) || [];
    const param = header.match (new RegExp ('[(,]\\s*' + name + ' ([\\w*.\\[\\]]+)\\s*[,)]'));
    // a `:=`, closure parameter, range variable or `&x` could rebind or alias the name
    const shadow = new RegExp ('(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|&' + name + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ').test (body);
    if (shadow || (decls.length + (param ? 1 : 0)) !== 1) {
        return undefined;
    }
    return param ? param[1] : decls[0].replace (/^var \w+ /, '');
}

// every write of a `*string` local is a SafeString* call with a literal default in the default slot: never nil
function goG14NonNilStringCall (rhs: string, nonNilDefault?: (arg: string) => boolean): boolean {
    const m = rhs.match (/^this\.SafeString(?:Lower|Upper)?(2|N)?\(/);
    if (!m || !rhs.endsWith (')')) {
        return false;
    }
    const args: string[] = [];
    let depth = 0, cur = '', inStr = false;
    for (let i = m[0].length; i < rhs.length - 1; i++) {
        const c = rhs[i];
        if (inStr) { cur += c; if (c === '\\') { cur += rhs[++i]; } else if (c === '"') { inStr = false; } continue; }
        if (c === '"') { inStr = true; } else if (c === '(' || c === '[' || c === '{') { depth++; } else if (c === ')' || c === ']' || c === '}') { if (--depth < 0) { return false; } }
        if (c === ',' && depth === 0) { args.push (cur.trim ()); cur = ''; } else { cur += c; }
    }
    args.push (cur.trim ());
    const slot = (m[1] === '2') ? 3 : 2;
    return depth === 0 && !inStr && args.length === slot + 1 && (/^(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?)$/.test (args[slot]) || (nonNilDefault !== undefined && nonNilDefault (args[slot])));
}
// the default slot keeps SafeString non-nil when it is a Go string field (this.Version/Id/Name/Hostname),
// a string local, or a `*string` local that is itself never nil (SafeString derefs it into a string default)
function goG14NonNilStringPtr (fn: string, name: string, seen: string[] = []): boolean {
    const writes = fn.match (new RegExp ('(?<![.\\w])(?:var ' + name + ' \\*string|' + name + ') = ([^\\n]*)', 'g')) || [];
    const nonNilDefault = (arg: string): boolean => {
        if (/^this\.(?:Id|Name|Version|Hostname)$/.test (arg)) { return true; }
        if (!/^\w+$/.test (arg) || seen.includes (arg) || arg === name) { return false; }
        const type = goG14DeclaredType (fn, arg);
        return (type === 'string') || ((type === '*string') && goG14NonNilStringPtr (fn, arg, seen.concat ([ name ])));
    };
    return writes.length > 0 && writes.every ((w) => goG14NonNilStringCall (w.replace (/^.*? = /, '').replace (/\s*\/\/.*$/, '').trim (), nonNilDefault));
}

function goG14Text (fn: string, qual: string): string {
    const cache = new Map<string, string | undefined> ();
    const typeOf = (n: string) => { if (!cache.has (n)) { cache.set (n, goG14DeclaredType (fn, n)); } return cache.get (n); };
    const q = qual.replace (/\./g, '\\.');
    const call = (h: string) => new RegExp ('(?<![.\\w])' + q + h + '\\((?:\\((\\w+)\\)|(\\w+))\\)', 'g');
    // nil-guarded pointer length: the guard sits in the same expression, before the read
    fn = fn.replace (new RegExp ('\\((\\w+) (!=|==) nil\\) (&&|\\|\\|) \\(' + q + 'GetLength\\((\\w+)\\)', 'g'), ((m: string, a: string, op: string, conj: string, b: string) => {
        const guards = (op === '!=' && conj === '&&') || (op === '==' && conj === '||');
        return (guards && a === b && typeOf (a) === '*string') ? '(' + a + ' ' + op + ' nil) ' + conj + ' (len(*' + a + ')' : m;
    }) as any);
    fn = fn.replace (call ('GetLength'), ((m: string, xp: string, xb: string) => {
        const x = xp || xb;
        const t = typeOf (x);
        if (t === 'string') { return 'len(' + x + ')'; }
        return (t === '*string' && goG14NonNilStringPtr (fn, x)) ? 'len(*' + x + ')' : m;
    }) as any);
    fn = fn.replace (call ('GetArrayLength'), ((m: string, xp: string, xb: string) => ([ '[]any', '[]string', 'string' ].includes (typeOf (xp || xb)) ? 'len(' + (xp || xb) + ')' : m)) as any);
    // derefScalar folds a nil []any/[]string to nil (false); a map is never an array
    fn = fn.replace (new RegExp ('(!?)' + call ('IsArray').source, 'g'), ((m: string, not: string, xp: string, xb: string) => {
        const x = xp || xb;
        if (not && [ '[]any', '[]string' ].includes (typeOf (x))) {
            return '(' + x + ' == nil)';
        }
        if (not) {
            return (typeOf (x) === 'map[string]any') ? 'true' : m;
        }
        const t = typeOf (x);
        return ([ '[]any', '[]string' ].includes (t)) ? '(' + x + ' != nil)' : (t === 'map[string]any' ? 'false' : m);
    }) as any);
    fn = fn.replace (call ('IsString'), ((m: string, xp: string, xb: string) => ((typeOf (xp || xb) === 'string') ? 'true' : m)) as any);
    fn = fn.replace (call ('EvalTruthy'), ((m: string, xp: string, xb: string) => {
        const x = xp || xb;
        const t = typeOf (x);
        return (t === 'bool') ? x : ((t === '*bool') ? '(' + x + ' != nil && *' + x + ')' : m);
    }) as any);
    return fn;
}

export function goG14TypedShapeHelpers (content: string, qual: string): string {
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => goG14Text (fn, qual)) as any);
}

function goG14SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push (m); } };
    const f = (sig: string, body: string, qual = '') => goG14TypedShapeHelpers ('\nfunc (this *X) M(' + sig + ') any {\n' + body + '\treturn nil\n}\n', qual);
    ok (f ('body string', '\tif IsString(body) {\n\t}\n').includes ('if true {'), 'string param IsString');
    ok (f ('', '\tvar s []string = GetArgStringSlice(o, 0, nil)\n\tif !IsArray(s) {\n\t}\n').includes ('if (s == nil) {'), 'IsArray []string');
    ok (f ('', '\tvar r map[string]any = MapTyped(x)\n\tif IsArray(r) {\n\t}\n').includes ('if false {'), 'IsArray map');
    ok (f ('', '\tvar t *string = this.SafeString(o, "k", "")\n\tif GetLength(t) == 0 {\n\t}\n').includes ('len(*t) == 0'), 'defaulted SafeString');
    ok (f ('', '\tvar t *string = this.SafeString(o, "k")\n\tif GetLength(t) == 0 {\n\t}\n').includes ('GetLength(t)'), 'nullable SafeString keeps helper');
    ok (f ('', '\tvar t *string = this.SafeString(o, "k", "")\n\tt = this.SafeString(o, "j")\n\tif GetLength(t) == 0 {\n\t}\n').includes ('GetLength(t)'), 'nullable rewrite keeps helper');
    ok (f ('', '\tvar c *string = this.SafeString(o, "k")\n\tif (c != nil) && (ccxt.GetLength(c) < 1) {\n\t}\n', 'ccxt.').includes ('(c != nil) && (len(*c) < 1)'), 'guarded pointer');
    ok (f ('', '\tvar c *string = this.SafeString(o, "k")\n\tif (c == nil) && (GetLength(c) < 1) {\n\t}\n').includes ('GetLength(c)'), 'wrong guard keeps helper');
    ok (f ('', '\tvar b bool = true\n\tif EvalTruthy(b) {\n\t}\n').includes ('if b {'), 'bool EvalTruthy');
    ok (f ('', '\tvar t *string = this.SafeString(o, "k", "")\n\tx := mathMax(5, GetLength(t)))\n').includes ('mathMax(5, len(*t)))'), 'outer paren kept');
    ok (f ('b any', '\tif EvalTruthy(b) {\n\t}\n').includes ('EvalTruthy(b)'), 'any keeps EvalTruthy');
    ok (f ('', '\tvar b []any = nil\n\tb2 := &b\n\t_ = b2\n\tif IsArray(b) {\n\t}\n').includes ('IsArray(b)'), 'address-taken keeps helper');
    ok (f ('', '\tvar q string\n\tq = F()\n\tif GetLength(q) != 0 {\n\t}\n').includes ('len(q) != 0'), 'uninitialised string decl');
    ok (f ('', '\tvar b []any = nil\n\tfn := func(b any) { _ = IsArray(b) }\n\t_ = fn\n').includes ('IsArray(b)'), 'shadowing closure keeps helper');
    return problems;
}

// ===== H2K-g05: GetValue(m, k) -> m[k] as a deref-at-entry argument =====
// Helpers that derefScalar their first argument before any use: GetValue's own deref is redundant,
// and a Go map read answers nil for a missing key / nil map exactly like getValue.
function goG05DerefFuncs (): string[] {
    return [
        'Add', 'Subtract', 'Multiply', 'Divide', 'Mod', 'IsEqual', 'IsGreaterThan', 'IsLessThan', 'IsGreaterThanOrEqual', 'IsLessThanOrEqual',
        'EvalTruthy', 'IsString', 'IsArray', 'IsBool', 'IsNumber', 'IsInteger', 'IsDictionary', 'IsNil', 'InOp', 'GetIndexOf',
        'StartsWith', 'EndsWith', 'Contains', 'IndexOf', 'Split', 'Join', 'Replace', 'Slice', 'Trim', 'ToString', 'ToLower', 'ToUpper',
        'ParseInt', 'ParseFloat', 'ToFloat64', 'MathFloor', 'MathCeil', 'MathRound', 'MathAbs', 'GetArrayLength', 'GetLength',
        'ObjectKeys', 'ObjectValues', 'JsonStringify', 'ListTyped', 'MapTyped', 'SafeStringPtr', 'SafeBoolPtr', 'GetValue',
    ];
}
// hand-written exchange_safe.go methods: the object argument reaches SafeValueN, which derefs it first
function goG05DerefMethods (): string[] {
    return [
        'SafeString', 'SafeString2', 'SafeStringLower', 'SafeStringLower2', 'SafeStringUpper', 'SafeStringUpper2',
        'SafeInteger', 'SafeInteger2', 'SafeFloat', 'SafeFloat2', 'SafeNumber', 'SafeNumber2', 'SafeBool', 'SafeBool2',
        'SafeTimestamp', 'SafeTimestamp2', 'SafeValue', 'SafeValue2', 'SafeIntegerProduct', 'SafeIntegerProduct2',
    ];
}

function nativeDerefArgMapReads (content: string): string {
    if (!/GetValue\(\w+, /.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    // a method redeclared in this file (an exchange override) may not deref its argument
    const methods = goG05DerefMethods ().filter ((m: string) => !new RegExp ('\\nfunc \\(this \\*\\w+\\) ' + m + '\\(').test ('\n' + content));
    const head = '(?:(?<![\\w.])(?:ccxt\\.)?(?:' + goG05DerefFuncs ().join ('|') + ')|\\bthis\\.(?:' + methods.join ('|') + '))\\(';
    const rx = new RegExp ('(' + head + ')(?:ccxt\\.)?GetValue\\((\\w+), (\"[^\"\\\\\\n]*\"|\\w+)\\)', 'g');
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            g05RewriteFunc (lines, masked, start, k, rx, head);
            start = -1;
        }
    }
    return lines.join ('\n');
}

function g05RewriteFunc (lines: string[], masked: string[], start: number, end: number, rx: RegExp, head: string) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const offsets: number[] = [];
    let offset = 0;
    for (let k = start; k <= end; k++) {
        offsets.push (offset);
        offset += masked[k].length + 1;
    }
    const cache = new Map<string, any> ();
    const declOf = (name: string) => {
        if (!cache.has (name)) {
            cache.set (name, goAccessSingleDeclaration (maskedFunc, lines[start], name));
        }
        return cache.get (name);
    };
    const typeAt = (name: string, k: number): string | undefined => {
        const decl = declOf (name);
        if ((decl === undefined) || ((decl.index !== undefined) && (decl.index >= offsets[k - start]))) {
            return undefined;
        }
        return decl.type;
    };
    const receiverOk = new Map<string, boolean> ();
    for (let k = start + 1; k < end; k++) {
        if (masked[k].indexOf ('GetValue(') < 0) {
            continue;
        }
        const m = masked[k];
        lines[k] = lines[k].replace (rx, (all: string, callHead: string, name: string, key: string, at: number) => {
            if (m.substr (at, callHead.length) !== callHead) {
                return all;
            }
            if (!key.startsWith ('"') && (typeAt (key, k) !== 'string')) {
                return all;
            }
            if (typeAt (name, k) !== 'map[string]any') {
                return all;
            }
            if (!receiverOk.has (name)) {
                receiverOk.set (name, goInOpReadReceiver (maskedFunc, declOf (name), name, declOf));
            }
            return receiverOk.get (name) ? callHead + name + '[' + key + ']' : all;
        });
        g05GuardedListReads (lines, masked, start, k, typeAt, maskedFunc, head);
    }
}

// an int key: a numeric literal, a `var k int` local, or the only declaration is `for k := N;`
function g05IntKey (key: string, k: number, maskedFunc: string, typeAt: (name: string, k: number) => string | undefined): boolean {
    if (/^\d+$/.test (key)) {
        return true;
    }
    if (typeAt (key, k) === 'int') {
        return true;
    }
    const n = goAccessEscape (key);
    return (maskedFunc.match (new RegExp ('(?:^|[^\\w.])' + n + '\\s*(?:,[^=\\n]*)?:=|\\bvar\\s+' + n + '\\b|[(,]\\s*' + n + '\\s+\\w', 'gm')) ?? []).length === 1
        && new RegExp ('\\bfor ' + n + ' := \\d+; ').test (maskedFunc);
}

// `GetValue(s, i)` -> the printer's guarded element read on a `[]string` local (its elements are
// plain strings) anywhere, or on a `[]any` local as the argument of a deref-at-entry helper
function g05GuardedListReads (lines: string[], masked: string[], start: number, k: number,
    typeAt: (name: string, k: number) => string | undefined, maskedFunc: string, head: string) {
    const m = masked[k];
    if (m.indexOf ('GetValue(') < 0) {
        return;
    }
    const indent = lines[k].substring (0, lines[k].length - lines[k].trimStart ().length);
    const consumerTail = new RegExp ('(?:' + head + ')$');
    const rx = /(?<![\w.])(?:ccxt\.)?GetValue\((\w+), (\w+)\)/g;
    let out = '';
    let cursor = 0;
    let match: RegExpExecArray | null;
    while ((match = rx.exec (m)) !== null) {
        const [ all, name, key ] = match;
        const at = match.index;
        if (lines[k].substr (at, all.length) !== all) {
            continue;
        }
        const t = typeAt (name, k);
        const ok = ((t === '[]string') || ((t === '[]any') && consumerTail.test (m.substring (0, at)))) && g05IntKey (key, k, maskedFunc, typeAt);
        if (!ok) {
            continue;
        }
        const read = 'func() any {\n' + indent + '\tif ' + key + ' >= 0 && ' + key + ' < len(' + name + ') {\n'
            + indent + '\t\treturn ' + name + '[' + key + ']\n' + indent + '\t}\n' + indent + '\treturn nil\n' + indent + '}()';
        out += lines[k].substring (cursor, at) + read;
        cursor = at + all.length;
    }
    if (cursor > 0) {
        lines[k] = out + lines[k].substring (cursor);
    }
}

function goDerefArgMapReadSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('g05: ' + msg); } };
    const f = (body: string) => nativeDerefArgMapReads ('func (this *X) f(optionalArgs ...any) any {\n' + body + '\treturn nil\n}\n');
    const d = '\tvar p map[string]any = GetArgMap(optionalArgs, 0, map[string]any{})\n';
    ok (f (d + '\tvar a *string = this.SafeString(GetValue(p, "k"), "x")\n').indexOf ('this.SafeString(p["k"], "x")') >= 0, 'safe method arg');
    ok (f (d + '\tif IsEqual(GetValue(p, "k"), 1) {\n\t}\n').indexOf ('IsEqual(p["k"], 1)') >= 0, 'func arg');
    ok (f (d + '\tvar s string = "k"\n\tvar a any = ToString(GetValue(p, s))\n').indexOf ('ToString(p[s])') >= 0, 'string key');
    const keep = [
        d + '\tx := GetValue(p, "k")\n',
        d + '\tvar a any = Foo(GetValue(p, "k"))\n',
        d + '\tvar s any = "k"\n\tvar a any = ToString(GetValue(p, s))\n',
        '\tvar p any = nil\n\tvar a any = ToString(GetValue(p, "k"))\n',
        '\tvar p map[string]any = SafeMapTyped(this.Options, "o")\n\tvar a any = ToString(GetValue(p, "k"))\n',
        d + '\tgo this.G()\n\tvar a any = ToString(GetValue(p, "k"))\n',
        d + '\tvar a any = ToString(GetValue(p, 0))\n',
        d + '\tvar a any = IsEqual(1, GetValue(p, "k"))\n',
    ];
    keep.forEach ((b: string, i: number) => ok (f (b).indexOf ('GetValue(p,') >= 0, 'negative ' + i));
    const over = 'func (this *X) SafeString(a any, b any) *string {\n\treturn nil\n}\n';
    ok (nativeDerefArgMapReads (over + 'func (this *X) f(optionalArgs ...any) any {\n' + d + '\tvar a *string = this.SafeString(GetValue(p, "k"), "x")\n\treturn nil\n}\n').indexOf ('GetValue(p,') >= 0, 'overridden method keeps helper');
    const l = f ('\tvar s []string = Split(x, "/")\n\tvar a any = this.Market(GetValue(s, 0))\n');
    ok (l.indexOf ('if 0 >= 0 && 0 < len(s) {\n\t\t\treturn s[0]') >= 0, '[]string literal index: ' + l);
    ok (f ('\tvar s []string = Split(x, "/")\n\tfor i := 0; i < len(s); i++ {\n\t\tx := GetValue(s, i)\n\t}\n').indexOf ('return s[i]') >= 0, '[]string loop counter');
    ok (f ('\tvar s []any = ListTyped(x)\n\tvar a any = ToString(GetValue(s, 1))\n').indexOf ('return s[1]') >= 0, '[]any in deref consumer');
    const keepList = [
        '\tvar s []any = ListTyped(x)\n\tx := GetValue(s, 1)\n',
        '\tvar s []string = Split(x, "/")\n\tvar i any = 1\n\tx := GetValue(s, i)\n',
        '\tx := GetValue(s, 1)\n\tvar s []string = Split(x, "/")\n',
        '\tvar s []string = Split(x, "/")\n\ts := Split(y, "/")\n\tx := GetValue(s, 1)\n',
        '\tvar s []any = ListTyped(x)\n\tvar a any = Foo(GetValue(s, 1))\n',
    ];
    keepList.forEach ((b: string, i: number) => ok (f (b).indexOf ('GetValue(s,') >= 0, 'list negative ' + i));
    return problems;
}

// ===== H2K-g09: native `+` for Add chains over proven Go strings =====
// Add(a, b) -> a + b only when every leaf is a non-nil Go string: a literal, a function-local
// `var x string` / `x string` param never redeclared, ToString(..), this.Id/Name/Version/Hostname,
// or a base method returning `string`. Any other leaf (any, *string, numbers) keeps Add.
// functions, not consts: the transpile runs at module load before this block is evaluated
function goAddStringMethods (): Set<string> { return new Set ([ 'ImplodeParams', 'ImplodeHostname', 'Json', 'Hmac', 'Urlencode', 'Rawencode', 'UrlencodeWithArrayRepeat', 'UrlencodeNested', 'Yymmdd', 'Ymd', 'Ymdhms', 'Yyyymmdd', 'Uuid', 'Uuid16', 'Uuid22', 'Uuid2' ]); }
// GB09: the credential fields are declared `string` in go/v4/exchange.go, so they are non-nil leaves too
function goAddStringFields (): Set<string> { return new Set ([ 'Id', 'Name', 'Version', 'Hostname', 'ApiKey', 'Secret', 'Uid', 'Password', 'AccountId', 'WalletAddress', 'PrivateKey' ]); }

function goAddCloseParen (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') { depth++; } else if (c === ')' || c === ']' || c === '}') { depth--; if (depth === 0) { return i; } }
    }
    return -1;
}

// split `text` (masked twin `masked`) at top-level occurrences of `sep`
function goAddSplitTop (text: string, masked: string, sep: string): string[] | null {
    const parts: string[] = [];
    let depth = 0;
    let last = 0;
    for (let i = 0; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') { depth++; } else if (c === ')' || c === ']' || c === '}') { depth--; if (depth < 0) { return null; } } else if (c === sep && depth === 0) { parts.push (text.slice (last, i)); last = i + 1; }
    }
    if (depth !== 0) { return null; }
    parts.push (text.slice (last));
    return parts;
}

function goAddStringLocals (fn: string, masked: string, fileMasked: string): Set<string> {
    const out = new Set<string> ();
    const braceAt = masked.indexOf ('{');
    const signature = masked.slice (0, braceAt < 0 ? masked.length : braceAt);
    const candidates = new Set<string> ();
    let m: RegExpExecArray | null;
    const varRe = /\bvar (\w+) string\b/g;
    while ((m = varRe.exec (masked)) !== null) { candidates.add (m[1]); }
    const paramRe = /[(,]\s*(\w+) string(?=[,)])/g;
    while ((m = paramRe.exec (signature)) !== null) { candidates.add (m[1]); }
    for (const name of candidates) {
        const decls = masked.match (new RegExp ('\\bvar ' + name + '\\b(?! string\\b)', 'g'));
        const shorts = new RegExp ('\\b' + name + '\\s*(,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(,\\s*\\w+\\s*)*:=').test (masked);
        const lits = new RegExp ('\\bfunc\\s*\\([^)]*\\b' + name + '\\b').test (masked.slice (braceAt < 0 ? 0 : braceAt));
        const global = new RegExp ('^(var|const|func) ' + name + '\\b', 'm').test (fileMasked);
        const otherParam = new RegExp ('[(,]\\s*' + name + ' (?!string[,)])').test (signature);
        if (!decls && !shorts && !lits && !global && !otherParam) { out.add (name); }
    }
    hx4G19PointerLocals (masked, fileMasked).forEach ((n: string) => { out.add ('*' + n); if (goG14NonNilStringPtr (fn, n)) { out.add ('!' + n); } });
    hx4G24RowLocals (fn, masked, fileMasked).forEach ((n: string) => { out.add (n); });
    return out;
}

// the leaf is a non-nil Go string
function goAddStringLeaf (text: string, masked: string, locals: Set<string>, overridden: Set<string>): boolean {
    const t = text.trim ();
    const mt = masked.slice (text.length - text.trimStart ().length).trim ();
    if (/^"([^"\\\n]|\\.)*"$/.test (t) || /^`[^`]*`$/.test (t)) { return true; }
    if (/^\w+$/.test (t)) { return locals.has (t); }
    if (hx4G19StringLeaf (t, mt, locals, overridden)) { return true; }
    const field = t.match (/^this\.(\w+)$/);
    if (field) { return goAddStringFields ().has (field[1]); }
    const call = t.match (/^(this\.(\w+)|(ccxt\.)?ToString)\(/);
    if (call && goAddCloseParen (mt, mt.indexOf ('(')) === mt.length - 1) {
        return (call[2] === undefined) || (goAddStringMethods ().has (call[2]) && !overridden.has (call[2]));
    }
    if (t.startsWith ('(') && goAddCloseParen (mt, 0) === mt.length - 1) {
        return goAddStringSum (t.slice (1, -1), mt.slice (1, -1), locals, overridden) !== null;
    }
    return false;
}

// a native `a+b+...` sum whose every term is a proven string, else null
function goAddStringSum (text: string, masked: string, locals: Set<string>, overridden: Set<string>): string | null {
    const terms = goAddSplitTop (text, masked, '+');
    if (terms === null) { return null; }
    let at = 0;
    const out: string[] = [];
    for (const term of terms) {
        const mterm = masked.slice (at, at + term.length);
        at += term.length + 1;
        const native = goAddNative (term.trim (), mterm.trim (), locals, overridden);
        if (native !== null) { out.push (native); continue; }
        if (locals.has ('!' + term.trim ())) { out.push ('*' + term.trim ()); continue; }
        if (hx4G24RowLeaf (term.trim (), locals)) { out.push (term.trim () + '.(string)'); continue; }
        if (!goAddStringLeaf (term, mterm, locals, overridden)) { return null; }
        out.push (term.trim ());
    }
    return out.join (' + ');
}

// `Add(a, b)` -> `a + b` when both sides are proven strings, else null
function goAddNative (text: string, masked: string, locals: Set<string>, overridden: Set<string>): string | null {
    const head = masked.match (/^(ccxt\.)?Add\(/);
    if (!head || goAddCloseParen (masked, head[0].length - 1) !== masked.length - 1) { return null; }
    const inner = text.slice (head[0].length, -1);
    const minner = masked.slice (head[0].length, -1);
    const args = goAddSplitTop (inner, minner, ',');
    if (args === null || args.length !== 2) { return null; }
    const left = goAddStringSum (args[0], minner.slice (0, args[0].length), locals, overridden);
    const right = goAddStringSum (args[1], minner.slice (args[0].length + 1), locals, overridden);
    return (left === null || right === null) ? null : left + ' + ' + right;
}

function goNativeStringAdds (content: string): string {
    if (content.indexOf ('Add(') < 0) { return content; }
    const fileMasked = goTextMaskLiteralsAndComments (content);
    const overridden = new Set<string> ();
    const defRe = /^func \(\w+ \*\w+\) (\w+)\(.*\) (\S+) \{$/gm;
    let d: RegExpExecArray | null;
    while ((d = defRe.exec (fileMasked)) !== null) { if (d[2] !== 'string') { overridden.add (d[1]); } hx4G19RecordMethod (overridden, d[1], d[2]); }
    let out = '';
    let cursor = 0;
    for (const range of goFuncBlockRanges (content)) {
        const fn = content.slice (range.start, range.end);
        const masked = fileMasked.slice (range.start, range.end);
        const locals = goAddStringLocals (fn, masked, fileMasked);
        let body = '';
        let at = 0;
        const addRe = /(?<![\w.])(ccxt\.)?Add\(/g;
        let m: RegExpExecArray | null;
        while ((m = addRe.exec (masked)) !== null) {
            const close = goAddCloseParen (masked, m.index + m[0].length - 1);
            if (close < 0) { break; }
            const before = masked.slice (0, m.index).trimEnd ();
            const after = masked.slice (close + 1).replace (/^[ \t]+/, '');
            // the result changes from `any` to `string`: only where both types are accepted
            const safeContext = !/(==|!=|:=|\bvar \w+ =)$/.test (before) && /^([,)\]}\n]|$)/.test (after) && !/^\.\(/.test (masked.slice (close + 1));
            const native = safeContext ? goAddNative (fn.slice (m.index, close + 1), masked.slice (m.index, close + 1), hx4G19GuardedLocals (masked, m.index, locals), overridden) : null;
            if (native !== null) {
                body += fn.slice (at, m.index) + native;
                at = close + 1;
                addRe.lastIndex = close + 1;
            }
        }
        out += content.slice (cursor, range.start) + body + fn.slice (at);
        cursor = range.end;
    }
    return out + content.slice (cursor);
}

function goNativeStringAddSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('H2K-g09: ' + msg); } };
    const f = (body: string, sig = '') => goNativeStringAdds ('package ccxt\n\nfunc (this *X) f(' + sig + ') any {\n' + body + '}\n');
    ok (f ('\tvar s string = this.Json(p)\n\tvar u any = Add(Add(s, ":"), this.Id)\n\treturn u\n').indexOf ('var u any = s + ":" + this.Id') >= 0, 'string chain goes native');
    ok (f ('\treturn Add("?", q)\n', 'q string').indexOf ('return "?" + q') >= 0, 'string param goes native');
    ok (f ('\treturn Add(Add(this.Id+" x ", this.Urlencode(p)), "y")\n').indexOf ('this.Id + " x " + this.Urlencode(p) + "y"') >= 0, 'native sub-sum and string method');
    ok (f ('\tvar s any = "a"\n\treturn Add(s, ":")\n').indexOf ('Add(s, ":")') >= 0, 'any local keeps Add');
    ok (f ('\tvar s *string = this.SafeString(p, "k")\n\treturn Add(s, ":")\n').indexOf ('Add(s, ":")') >= 0, '*string keeps Add');
    ok (f ('\tvar s string = "a"\n\tif true {\n\t\ts := 1\n\t\t_ = s\n\t}\n\treturn Add(s, ":")\n').indexOf ('Add(s, ":")') >= 0, 'shadowed local keeps Add');
    ok (f ('\tvar s string = "a"\n\treturn Add(s, 1)\n').indexOf ('Add(s, 1)') >= 0, 'number leaf keeps Add');
    ok (f ('\tvar s string = "a"\n\treturn Add(s, "b").(string)\n').indexOf ('Add(s, "b").(string)') >= 0, 'type assertion keeps Add');
    ok (f ('\tvar s string = "a"\n\treturn Add(s, "b") == nil\n').indexOf ('Add(s, "b") == nil') >= 0, 'nil compare keeps Add');
    ok (f ('\treturn Add(Add(market["id"], ":"), "b")\n').indexOf ('Add(Add(market["id"], ":"), "b")') >= 0, 'map read keeps Add');
    ok (f ('\treturn Add(x, Add(":", "b"))\n').indexOf ('Add(x, ":" + "b")') >= 0, 'inner proven chain converts alone');
    ok (goNativeStringAdds ('package ccxt\n\nfunc (this *X) Json(o any) any {\n\treturn nil\n}\n\nfunc (this *X) f() any {\n\treturn Add("a", this.Json(1))\n}\n').indexOf ('Add("a", this.Json(1))') >= 0, 'overridden method keeps Add');
    return problems;
}

// ===== H2K-g16: native strings.* for string helpers on proven operands; EndpointRaw into promiseAll =====
// A helper call whose operands are all proven (string/int literal, or an identifier whose only
// declaration in the function is `var x string|int|int64|[]string`) prints as the stdlib call
// the helper itself makes. Anything else keeps the helper. Base files without imports are skipped.
function H2K_G16_HEADER () { return '// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code'; }  // functions, not consts: runMain runs before EOF consts init
function H2K_G16_STR_LIT () { return /^(?:"(?:[^"\\\n]|\\.)*"|`[^`]*`)$/; }
function H2K_G16_INT_LIT () { return /^(?:0|[1-9]\d{0,8})$/; }

function h2kG16Args (content: string, masked: string, open: number): { args: string[], end: number } | undefined {
    let depth = 0;
    let start = open + 1;
    const args: string[] = [];
    for (let i = open + 1; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) {
            depth++;
        } else if ((c === ')') || (c === ']') || (c === '}')) {
            if (depth === 0) {
                args.push (content.substring (start, i).trim ());
                return { args, end: i };
            }
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            args.push (content.substring (start, i).trim ());
            start = i + 1;
        }
    }
    return undefined;
}

// the Go type of `name` when the function declares it exactly once as `var name T` (no param,
// no `:=`, no closure param, no range/tuple binding); undefined otherwise
function h2kG16DeclaredType (maskedFunc: string, name: string): string | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name) || (name === 'nil') || (name === 'true') || (name === 'false')) {
        return undefined;
    }
    const n = name.replace (/\$/g, '\\$');
    const decls = [ ...maskedFunc.matchAll (new RegExp ('\\bvar ' + n + ' ([\\w\\[\\]]+)(?: =|\\n)', 'g')) ];
    if (decls.length !== 1) {
        return undefined;
    }
    const other = new RegExp ('\\b' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|\\w+\\s*,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|func\\s*(?:\\([^)]*\\)\\s*\\w*\\s*)?\\([^)]*\\b' + n + '\\b[^)]*\\)|\\bvar ' + n + '\\s*,|,\\s*' + n + '\\s+[\\w.*\\[\\]]+\\s*[,)]');
    if (other.test (maskedFunc)) {
        return undefined;
    }
    return decls[0][1];
}

function h2kG16Kind (arg: string, maskedFunc: string): string | undefined {
    if (H2K_G16_STR_LIT ().test (arg)) {
        return 'string';
    }
    if (H2K_G16_INT_LIT ().test (arg)) {
        return 'const-int';
    }
    const m = /^OpNeg\((\d{1,9})\)$/.exec (arg.replace (/^ccxt\./, '').replace (/\(ccxt\./, '('));
    if (m !== null) {
        return 'const-neg';
    }
    return h2kG16DeclaredType (maskedFunc, arg);
}

// JS slice bounds on a string exactly as the helper computes them (literal bounds only)
function h2kG16SliceText (s: string, a: string, b: string): string | undefined {
    const bound = (t: string) => {
        const neg = /^(?:ccxt\.)?OpNeg\((\d{1,9})\)$/.exec (t);
        return (neg !== null) ? -Number (neg[1]) : (H2K_G16_INT_LIT ().test (t) ? Number (t) : undefined);
    };
    const start = bound (a);
    if (start === undefined) {
        return undefined;
    }
    const len = 'len(' + s + ')';
    if (b === 'nil') {
        return s + '[' + ((start >= 0) ? String (start) : 'max(' + len + '-' + (-start) + ', 0)') + ':]';
    }
    const end = bound (b);
    if (end === undefined) {
        return undefined;
    }
    const startText = (start >= 0) ? String (start) : len + '-' + (-start);
    const endText = (end >= 0) ? 'min(' + end + ', ' + len + ')' : len + '-' + (-end);
    return s + '[' + startText + ':' + endText + ']';
}

// the native text for one helper call, plus the stdlib package it needs; undefined keeps it
function h2kG16Native (helper: string, args: string[], maskedFunc: string): { text: string, pkg: string } | undefined {
    const k = args.map ((a) => h2kG16Kind (a, maskedFunc));
    const str = (i: number) => (k[i] === 'string');
    switch (helper) {
    case 'ToString':
        if (args.length !== 1) { return undefined; }
        if (k[0] === 'string') { return { text: args[0], pkg: '' }; }
        if (k[0] === 'int') { return { text: 'strconv.Itoa(' + args[0] + ')', pkg: 'strconv' }; }
        if (k[0] === 'int64') { return { text: 'strconv.FormatInt(' + args[0] + ', 10)', pkg: 'strconv' }; }
        return undefined;
    case 'ToUpper':
    case 'ToLower':
        return ((args.length === 1) && str (0)) ? { text: 'strings.' + helper + '(' + args[0] + ')', pkg: 'strings' } : undefined;
    case 'Trim':
        return ((args.length === 1) && str (0)) ? { text: 'strings.TrimSpace(' + args[0] + ')', pkg: 'strings' } : undefined;
    case 'Split':
        // an empty separator splits by UTF-8 sequence in Go, by UTF-16 unit in JS: keep the helper
        return ((args.length === 2) && str (0) && str (1) && (args[1] !== '""')) ? { text: 'strings.Split(' + args[0] + ', ' + args[1] + ')', pkg: 'strings' } : undefined;
    case 'StartsWith':
    case 'EndsWith':
        return ((args.length === 2) && str (0) && str (1)) ? { text: 'strings.' + ((helper === 'StartsWith') ? 'HasPrefix' : 'HasSuffix') + '(' + args[0] + ', ' + args[1] + ')', pkg: 'strings' } : undefined;
    case 'Replace':
        // the helper replaces every occurrence
        return ((args.length === 3) && str (0) && str (1) && str (2)) ? { text: 'strings.ReplaceAll(' + args[0] + ', ' + args[1] + ', ' + args[2] + ')', pkg: 'strings' } : undefined;
    case 'Join':
        return ((args.length === 2) && (k[0] === '[]string') && str (1)) ? { text: 'strings.Join(' + args[0] + ', ' + args[1] + ')', pkg: 'strings' } : undefined;
    case 'GetIndexOf':
        if ((args.length !== 2) || !str (1)) { return undefined; }
        if (str (0)) { return { text: 'strings.Index(' + args[0] + ', ' + args[1] + ')', pkg: 'strings' }; }
        if (k[0] === '[]string') { return { text: 'slices.Index(' + args[0] + ', ' + args[1] + ')', pkg: 'slices' }; }
        return undefined;
    case 'Slice':
        if ((args.length !== 3) || !str (0) || H2K_G16_STR_LIT ().test (args[0])) { return undefined; }
        { const text = h2kG16SliceText (args[0], args[1], args[2]); return (text === undefined) ? undefined : { text, pkg: '' }; }
    case 'PadStart':
        // pad with one byte to `n`, then keep the last n bytes, as the helper's loop does
        if ((args.length !== 3) || !str (0) || H2K_G16_STR_LIT ().test (args[0]) || !H2K_G16_INT_LIT ().test (args[1]) || !/^"[ !#-[\]-~]"$/.test (args[2])) { return undefined; }
        { const s = args[0]; const n = args[1];
            return { text: '(strings.Repeat(' + args[2] + ', max(' + n + '-len(' + s + '), 0)) + ' + s + ')[max(len(' + s + ')-' + n + ', 0):]', pkg: 'strings' }; }
    }
    return undefined;
}

function H2K_G16_CALL () { return /(?<![\w.])(ccxt\.)?(ToString|ToUpper|ToLower|Trim|Split|StartsWith|EndsWith|Replace|Join|GetIndexOf|Slice|PadStart)\(/g; }

function h2kG16RewriteFunc (func: string, pkgs: Set<string>): string {
    let out = func;
    // right to left so earlier offsets stay valid
    for (let pass = 0; pass < 8; pass++) {
        const masked = goTextMaskLiteralsAndComments (out);
        if (/\b(?:strings|strconv|slices|min|max|len)\b\s*(?::=|,|\s+[\w\[\]*])/.test (masked.replace (/\b(?:strings|strconv|slices)\.\w|\b(?:min|max|len)\(/g, ''))) {
            return out;     // a local shadows the package name
        }
        const hits = [ ...masked.matchAll (H2K_G16_CALL ()) ];
        let changed = false;
        let firstEdit = out.length;
        for (let h = hits.length - 1; h >= 0; h--) {
            const m = hits[h];
            const open = m.index + m[0].length - 1;
            const parsed = h2kG16Args (out, masked, open);
            // a call enclosing an edit of this pass is re-read on the next pass
            if ((parsed === undefined) || (parsed.end >= firstEdit)) {
                continue;
            }
            const native = h2kG16Native (m[2], parsed.args, masked);
            if (native === undefined) {
                continue;
            }
            if (native.pkg !== '') {
                pkgs.add (native.pkg);
            }
            out = out.substring (0, m.index) + native.text + out.substring (parsed.end + 1);
            firstEdit = m.index;
            changed = true;
        }
        if (!changed) {
            break;
        }
    }
    return out;
}

// EndpointRaw only adapts a typed endpoint channel for promiseAll, which receives such a channel
// itself (exchange_helpers.go): dropped where the call is an element handed only to promiseAll
function h2kG16OnlyPromiseAll (masked: string, name: string): boolean {
    for (const u of masked.matchAll (new RegExp ('(?<![\\w.])' + name + '\\b', 'g'))) {
        const lineStart = masked.lastIndexOf ('\n', u.index) + 1;
        const before = masked.substring (lineStart, u.index);
        const after = masked.substring (u.index + name.length, masked.indexOf ('\n', u.index));
        if (/^\s*(?:var )?$/.test (before) && /^(?: \[\]any| any)? = /.test (after)) {
            continue;       // declaration or plain write
        }
        if (/^\s*_ = $/.test (before) || new RegExp ('^\\s*' + name + ' = append\\($').test (before)) {
            continue;
        }
        if (/(?:ccxt\.)?[pP]romiseAll\($/.test (before) && after.startsWith (')')) {
            continue;
        }
        if (/(?:ccxt\.)?[pP]romiseAll\(\[\]any\{[\w, ]*$/.test (before)) {
            continue;
        }
        return false;
    }
    return true;
}

// the innermost unclosed `[]any{` / `append(` / call paren before `at`, with the text preceding it
function h2kG16Opener (masked: string, at: number): { index: number, prefix: string } | undefined {
    let depth = 0;
    for (let i = at - 1; i >= 0; i--) {
        const c = masked[i];
        if ((c === ')') || (c === '}') || (c === ']')) {
            depth++;
        } else if ((c === '(') || (c === '{') || (c === '[')) {
            if (depth === 0) {
                const lineStart = masked.lastIndexOf ('\n', i) + 1;
                return { index: i, prefix: masked.substring (lineStart, i + 1) };
            }
            depth--;
        }
    }
    return undefined;
}

function h2kG16DropEndpointRaw (func: string): string {
    if (func.indexOf ('EndpointRaw(') < 0) {
        return func;
    }
    const masked = goTextMaskLiteralsAndComments (func);
    const hits = [ ...masked.matchAll (/(?<![\w.])(ccxt\.)?EndpointRaw\(/g) ];
    let out = func;
    for (let h = hits.length - 1; h >= 0; h--) {
        const m = hits[h];
        const parsed = h2kG16Args (func, masked, m.index + m[0].length - 1);
        if ((parsed === undefined) || (parsed.args.length !== 1)) {
            continue;
        }
        let ok = false;
        const opener = h2kG16Opener (masked, m.index);
        const lineStart = masked.lastIndexOf ('\n', m.index) + 1;
        const own = masked.substring (lineStart, m.index);
        let holder;
        if ((holder = /^\s*var (\w+) any = $/.exec (own)) !== null) {
            ok = h2kG16OnlyPromiseAll (masked, holder[1]);
        } else if (opener === undefined) {
            ok = false;
        } else if (/(?:ccxt\.)?[pP]romiseAll\(\[\]any\{$/.test (opener.prefix)) {
            ok = true;
        } else if (((holder = /^\s*(?:var )?(\w+)(?: \[\]any)? = \[\]any\{$/.exec (opener.prefix)) !== null)
            || (((holder = /^\s*(\w+) = append\((\w+), $/.exec (own)) !== null) && (holder[1] === holder[2]) && /append\($/.test (opener.prefix))) {
            ok = h2kG16OnlyPromiseAll (masked, holder[1]);
        }
        if (ok) {
            out = out.substring (0, m.index) + parsed.args[0] + out.substring (parsed.end + 1);
        }
    }
    return out;
}

function h2kG16NativeStringHelpers (filePath: string, content: string): string {
    if (!filePath.endsWith ('.go') || filePath.endsWith ('_api.go') || (content.indexOf (H2K_G16_HEADER ()) < 0)) {
        return content;
    }
    const base = /(?:^|[\\/])exchange_[\w]*\.go$/.test (filePath);
    const has = (pkg: string) => new RegExp ('^import "' + pkg + '"$|^\\s+"' + pkg + '"$', 'm').test (content);
    const pkgs = new Set<string> ();
    const parts = content.split (/(?=^func )/m);
    const rewritten = parts.map ((part, i) => {
        if (i === 0 && !part.startsWith ('func ')) {
            return part;
        }
        let next = h2kG16DropEndpointRaw (part);
        const local = new Set<string> ();
        const trial = h2kG16RewriteFunc (next, local);
        // a base file has no import clause to extend: only package-free rewrites land there
        if (base && [ ...local ].some ((p) => !has (p))) {
            return next;
        }
        local.forEach ((p) => pkgs.add (p));
        next = trial;
        return next;
    });
    let out = rewritten.join ('');
    const missing = [ ...pkgs ].filter ((p) => !has (p)).sort ();
    if (missing.length > 0) {
        const at = out.indexOf (H2K_G16_HEADER ()) + H2K_G16_HEADER ().length;
        out = out.substring (0, at) + '\n\n' + missing.map ((p) => 'import "' + p + '"').join ('\n') + out.substring (at);
    }
    return out;
}

// ===== G10K-deref: native pointer derefs for DerefScalar / Float64PtrTyped statements =====
// DerefScalar(p) of a statically typed scalar pointer is `nil` for a nil p and `*p` otherwise;
// ParseNumber(x) (one argument) answers untyped nil or a float64, which Float64PtrTyped boxes.
function g10kDerefAccessor (): RegExp {
    return /^this\.(?:Safe(?:String|Integer|Number|Float|Bool|Timestamp)\w*|SafeCurrencyCode|SafeSymbol|NumberToString|PriceToPrecision|AmountToPrecision|NetworkIdToCode|Iso8601|Parse8601)\(/;
}

// the call text of `name(<arg>)` spanning exactly `text`, or undefined
function g10kSoleArg (text: string, name: RegExp): string | undefined {
    const m = name.exec (text);
    if (!m) {
        return undefined;
    }
    const args = goCallArgsSpanningText (text, m[0].length - 1);
    return ((args !== undefined) && (args.length === 1)) ? args[0] : undefined;
}

function g10kRewriteLine (line: string): string | undefined {
    const m = /^(\t*)(?:(var (\w+) (any) = )|((\w+) = )|(return ))((?:ccxt\.)?DerefScalar\(.*\))$/.exec (line);
    if (!m || (m[1] === '') || (m[6] === '_')) {
        return undefined;
    }
    const [ , ind, decl, declName, declType, , assignName, ret, call ] = m;
    const name = declName ?? assignName;
    const inner = g10kSoleArg (call, /^(?:ccxt\.)?DerefScalar\(/);
    if (inner === undefined) {
        return undefined;
    }
    const accessor = /^(this\.\w+)\(/.exec (inner);
    // every declaration of these names returns *string/*int64/*float64/*bool except SafeIntegerOmitZero (any)
    if (!accessor || !g10kDerefAccessor ().test (inner) || /OmitZero\(/.test (accessor[0]) || (goCallArgsSpanningText (inner, accessor[0].length - 1) === undefined)) {
        return undefined;
    }
    const head = 'if derefPtr := ' + inner + '; derefPtr != nil {';
    const value = '*derefPtr';
    // the operand must not read the name it writes (a `var` would shadow it) nor the temporary
    if (((name !== undefined) && new RegExp ('\\b' + name + '\\b').test (inner)) || /\bderefPtr\b/.test (inner)) {
        return undefined;
    }
    if (ret !== undefined) {
        return [ ind + head, ind + '\treturn ' + value, ind + '}', ind + 'return nil' ].join ('\n');
    }
    if (decl !== undefined) {
        return [ ind + 'var ' + name + ' ' + declType, ind + head, ind + '\t' + name + ' = ' + value, ind + '}' ].join ('\n');
    }
    return [ ind + head, ind + '\t' + name + ' = ' + value, ind + '} else {', ind + '\t' + name + ' = nil', ind + '}' ].join ('\n');
}

export function g10kNativeDerefs (filePath: string, content: string): string {
    if (!filePath.endsWith ('.go') || ((content.indexOf ('DerefScalar(') < 0) && (content.indexOf ('Float64PtrTyped(') < 0))) {
        return content;
    }
    return content.split ('\n').map ((line) => g10kRewriteLine (line) ?? line).join ('\n');
}

export function g10kDerefSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('G10K-deref: ' + msg); } };
    const f = (text: string) => g10kNativeDerefs ('x.go', text);
    ok (f ('\tvar s any = DerefScalar(this.SafeString(m, "k"))') === '\tvar s any\n\tif derefPtr := this.SafeString(m, "k"); derefPtr != nil {\n\t\ts = *derefPtr\n\t}', 'var form');
    ok (f ('\t\ts = ccxt.DerefScalar(this.SafeInteger(m, "k", 2))') === '\t\tif derefPtr := this.SafeInteger(m, "k", 2); derefPtr != nil {\n\t\t\ts = *derefPtr\n\t\t} else {\n\t\t\ts = nil\n\t\t}', 'assign form');
    ok (f ('\treturn DerefScalar(this.SafeBool(m, "k"))') === '\tif derefPtr := this.SafeBool(m, "k"); derefPtr != nil {\n\t\treturn *derefPtr\n\t}\n\treturn nil', 'return form');
    const kept = [
        '\tvar s any = DerefScalar(data[i])',
        '\tvar s any = DerefScalar(this.SafeIntegerOmitZero(m, "k"))',
        'var s any = DerefScalar(this.SafeString(m, "k"))',
        '\tvar s any = DerefScalar(this.SafeValue(m, "k"))',
        '\ts = DerefScalar(this.SafeString(m, "k", s))',
        '\tvar s any = DerefScalar(this.SafeString(m, "k")) // note',
        '\ts = DerefScalar(this.SafeString(func() any {',
        '\tvar p *float64 = this.ParseNumber(s)',
        '\tvar p *float64 = Float64PtrTyped(GetValue(t, 0))',
        '\t_ = DerefScalar(this.SafeString(m, "k"))',
        '\tx := DerefScalar(this.SafeString(m, "k"))',
        '\tvar s string = DerefScalar(this.SafeString(m, "k"))',
        '\tvar s any = DerefScalar(this.SafeString(m, "k")) + 1',
    ];
    kept.forEach ((line) => ok (f (line) === line, 'must keep: ' + line));
    return problems;
}

// ===== G10K-maplist: Omit of a tuple-helper params map is OmitDict =====
// `a, x := this.HandleXAndParams(..)` declares x as map[string]any (hand-written pair results); when that
// is x's only declaration in the function, Omit(x, ..) always yields a map, so MapTyped(Omit) == OmitDict.
function g10kMaplistTupleMethods (): string {
    return 'HandleMarketTypeAndParams|HandleSubTypeAndParams|HandleOptionStringAndParams2?|HandleParamString2?|HandleUntilOption|HandleMarginModeAndParams|HandleOptionBoolAndParams2?|HandleOptionIntegerAndParams2?';
}

function g10kMaplistTupleMap (func: string, name: string): boolean {
    const binds = new RegExp ('\\bvar ' + name + '\\b|(?<![\\w.])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|[(,]\\s*' + name + ' [\\w\\[*.]|&' + name + '\\b');
    const decls = func.split ('\n').filter ((l) => binds.test (l));
    const tuple = new RegExp ('^\\s*\\w+, ' + name + ' := this\\.(?:Exchange\\.)?(?:' + g10kMaplistTupleMethods () + ')\\(');
    return (decls.length === 1) && tuple.test (decls[0]);
}

function g10kMaplistOmitOfTupleMaps (content: string): string {
    if (content.indexOf ('MapTyped(this.Omit(') < 0) {
        return content;
    }
    const masked = goTextMaskLiteralsAndComments (content);
    if (masked.length !== content.length) {
        return content;
    }
    const call = /(?<![\w.])(?:ccxt\.)?MapTyped\(this\.Omit\((\w+),/g;
    let out = '';
    let cursor = 0;
    for (let m = call.exec (masked); m !== null; m = call.exec (masked)) {
        const open = m.index + m[0].indexOf ('(');
        const end = goMatchingCloseText (masked, open);
        const fs = masked.lastIndexOf ('\nfunc ', m.index);
        const fe = masked.indexOf ('\n}\n', m.index);
        if ((end < 0) || (masked[end - 1] !== ')') || (fs < 0) || (fe < 0) || !g10kMaplistTupleMap (masked.substring (fs, fe), m[1])) {
            continue;
        }
        const inner = content.substring (m.index + m[0].length, end - 1);
        out += content.substring (cursor, m.index) + 'this.OmitDict(' + m[1] + ',' + inner + ')';
        cursor = end + 1;
        call.lastIndex = end + 1;
    }
    return out + content.substring (cursor);
}

function g10kMaplistSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('g10k-maplist: ' + m); } };
    const fn = (decl: string, use: string) => 'package x\nfunc (this *X) f(params any) any {\n' + decl + '\tvar q map[string]any = MapTyped(this.Omit(p, \")\"))\n' + use + '\treturn q\n}\n';
    const good = fn ('\tt, p := this.HandleMarketTypeAndParams("f", nil, params)\n\t_ = t\n', '');
    ok (g10kMaplistOmitOfTupleMaps (good).indexOf ('var q map[string]any = this.OmitDict(p, ")")') > 0, 'tuple map converted');
    ok (g10kMaplistOmitOfTupleMaps (fn ('\tt, p := this.HandleParamString(params, "k")\n', '')).indexOf ('this.OmitDict(p, ")")') > 0, 'param string tuple');
    for (const bad of [ fn ('\tvar p any = nil\n\tt, p := this.HandleMarketTypeAndParams("f", nil, params)\n', ''),
        fn ('\tp, t := this.HandleUntilOption("k", params, params)\n', ''), fn ('\tt, p := this.HandleOther("f")\n', ''),
        fn ('\tt, p := this.HandleMarketTypeAndParams("f", nil, params)\n', '\tfunc(p any) {}(nil)\n') ]) {
        ok (g10kMaplistOmitOfTupleMaps (bad) === bad, 'kept: ' + bad.split ('\n')[1].trim ());
    }
    return problems;
}

// ===== G10K-isequal: native ==/!= for IsEqual on provably comparable concrete operands =====
// IsEqual derefs pointers and compares same-kind scalars (int/int64/float64 cross-kind by value);
// with a scalar-typed side, a nil-guarded pointer, or a MarketTyped row value it is exactly Go ==.
function g10kIsEqualLiteral (text: string): string | undefined {
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (text)) {
        return 'string';
    }
    if ((text === 'true') || (text === 'false')) {
        return 'bool';
    }
    return /^-?\d{1,9}$/.test (text) ? 'int' : undefined;
}

// the Go expression `a == b` for a scalar of type `goType` against a literal, or undefined
function g10kIsEqualScalarVsLiteral (goType: string, lit: string): boolean {
    const kind = g10kIsEqualLiteral (lit);
    const ok: any = { 'string': [ 'string' ], 'bool': [ 'bool' ], 'int64': [ 'int' ], 'int': [ 'int' ], 'float64': [ 'int' ] };
    return (kind !== undefined) && (ok[goType] !== undefined) && (ok[goType].indexOf (kind) >= 0);
}

function g10kIsEqualStripParens (text: string): string {
    let t = text.trim ();
    while (t.startsWith ('(') && (goMatchingCloseText (t, 0) === t.length - 1)) {
        t = t.slice (1, -1).trim ();
    }
    return t;
}

// split `a, b` at the single top-level comma; undefined for any other arity
function g10kIsEqualArgs (inner: string): string[] | undefined {
    let depth = 0;
    const cuts: number[] = [];
    for (let i = 0; i < inner.length; i++) {
        const c = inner[i];
        if ((c === '"') || (c === '`') || (c === '\'')) {
            i = goSkipLiteralText (inner, i);
        } else if ('([{'.indexOf (c) >= 0) {
            depth++;
        } else if (')]}'.indexOf (c) >= 0) {
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            cuts.push (i);
        }
    }
    return (cuts.length === 1) ? [ inner.slice (0, cuts[0]).trim (), inner.slice (cuts[0] + 1).trim () ] : undefined;
}

// native `==` form (without the outer parens) of IsEqual(a, b) inside one func, or undefined
function g10kIsEqualNativeForm (a: string, b: string, maskedFunc: string, signature: string, methods: Map<string, string>, negate: boolean): string | undefined {
    const eq = negate ? ' != ' : ' == ';
    const declType = (x: string): string | undefined => {
        if (!/^[A-Za-z_]\w*$/.test (x) || (x === 'nil') || (x === 'true') || (x === 'false') || new RegExp ('&\\s*' + x + '\\b').test (maskedFunc)) {
            return undefined;
        }
        const decl = goAccessSingleDeclaration (maskedFunc, signature, x);
        return (decl === undefined) ? undefined : decl.type;
    };
    const scalar = [ 'string', 'bool', 'int64', 'int', 'float64' ];
    const rowLocal = (x: string): boolean => {
        const m = /^([A-Za-z_]\w*)\["[^"\\\n]*"\]$/.exec (x);
        if ((m === null) || (declType (m[1]) !== 'map[string]any')) {
            return false;
        }
        const writes = [ ...maskedFunc.matchAll (new RegExp ('(?:^|\\n)\\s*(?:var ' + m[1] + ' map\\[string\\]any|' + m[1] + ') = ([^\\n]*)', 'g')) ];
        const all = maskedFunc.match (new RegExp ('(?<![\\w.])' + m[1] + '\\b[^\\n=(]*(?<![=!<>:])=(?!=)', 'g')) ?? [];
        return (writes.length > 0) && (writes.length === all.length) && writes.every ((w) => /^(?:(?:ccxt\.)?this\.(?:DerivedExchange\.|Exchange\.)?(?:Market|SafeMarket)\(.*\)|nil)$/.test (w[1].trim ()));
    };
    for (const [ x, y ] of [ [ a, b ], [ b, a ] ]) {
        const lit = g10kIsEqualLiteral (y);
        const t = declType (x);
        // scalar local/param against a literal of its kind
        if ((lit !== undefined) && (t !== undefined) && g10kIsEqualScalarVsLiteral (t, y)) {
            return x + eq + y;
        }
        // pointer local/param: nil never equals a literal
        if ((lit !== undefined) && (t !== undefined) && t.startsWith ('*') && g10kIsEqualScalarVsLiteral (t.slice (1), y)) {
            return negate ? ('(' + x + ' == nil || *' + x + ' != ' + y + ')') : ('(' + x + ' != nil && *' + x + ' == ' + y + ')');
        }
        // a MarketTyped row value is plain (no pointer, no typed-nil container)
        if (((lit === 'string') || (lit === 'bool')) && rowLocal (x)) {
            return x + eq + y;
        }
        // same-file method on this receiver with a scalar Go result
        const call = /^this\.(\w+)\(/.exec (x);
        if ((lit !== undefined) && (call !== null) && (goMatchingCloseText (x, call[0].length - 1) === x.length - 1) && methods.has (call[1]) && g10kIsEqualScalarVsLiteral (methods.get (call[1]), y)) {
            return x + eq + y;
        }
        // base Safe{Integer,String}(o, k, <literal default>) returns &value or &default: never nil
        const safe = /^this\.Safe(Integer|String)\(/.exec (x);
        const safeArgs = ((safe !== null) && (goMatchingCloseText (x, safe[0].length - 1) === x.length - 1)) ? goMapWriteTopLevelParts (x.slice (safe[0].length, -1), ', ') : [];
        const safeType = (safe === null) ? '' : ((safe[1] === 'Integer') ? 'int64' : 'string');
        const u = declType (y);
        if ((safeArgs.length === 3) && (g10kIsEqualLiteral (safeArgs[2].trim ()) === ((safeType === 'int64') ? 'int' : 'string')) && ((lit !== undefined) ? g10kIsEqualScalarVsLiteral (safeType, y) : (u === safeType))) {
            return '*' + x + eq + y;
        }
        // two scalar idents (int widened to int64), or a pointer against a scalar ident
        if ((t !== undefined) && (u !== undefined) && (scalar.indexOf (u) >= 0)) {
            const base = t.startsWith ('*') ? t.slice (1) : t;
            if ((scalar.indexOf (base) < 0) || ((base !== u) && !((base === 'int64') && (u === 'int')))) {
                continue;
            }
            const rhs = (base === u) ? y : ('int64(' + y + ')');
            if (!t.startsWith ('*')) {
                return x + eq + rhs;
            }
            return negate ? ('(' + x + ' == nil || *' + x + ' != ' + rhs + ')') : ('(' + x + ' != nil && *' + x + ' == ' + rhs + ')');
        }
    }
    return undefined;
}

export function g10kIsEqualNative (content: string): string {
    if (!/(?<![\w.])(?:ccxt\.)?IsEqual\(/.test (content)) {
        return content;
    }
    const ranges = goFuncBlockRanges (content);
    for (let r = ranges.length - 1; r >= 0; r--) {
        const fn = content.slice (ranges[r].start, ranges[r].end);
        const rewritten = g10kIsEqualFuncText (fn, content);
        if (rewritten !== fn) {
            content = content.slice (0, ranges[r].start) + rewritten + content.slice (ranges[r].end);
        }
    }
    return collapseRedundantNilChecks (content);
}

function g10kIsEqualFuncText (fn: string, file: string): string {
    const masked = goTextMaskLiteralsAndComments (fn);
    const signature = fn.replace (/^\n/, '').split ('\n')[0];
    const recv = /^func \(this \*(\w+)\)/.exec (signature);
    const methods = new Map<string, string> ();
    if (recv !== null) {
        for (const m of file.matchAll (new RegExp ('\\nfunc \\(this \\*' + recv[1] + '\\) (\\w+)\\([^\\n]*\\) (string|bool|int64|int|float64) \\{\\n', 'g'))) {
            methods.set (m[1], m[2]);
        }
    }
    const re = /(!?)(?<![\w.])(?:ccxt\.)?IsEqual\(/g;
    let out = '';
    let cursor = 0;
    for (let m = re.exec (fn); m !== null; m = re.exec (fn)) {
        const head = m.index + m[1].length;
        const open = m.index + m[0].length - 1;
        const close = goMatchingCloseText (fn, open);
        if ((m.index < cursor) || (close < 0) || (masked.slice (head, open + 1) !== fn.slice (head, open + 1)) || (fn.slice (open, close).indexOf ('\n') >= 0)) {
            continue;
        }
        const args = g10kIsEqualArgs (fn.slice (open + 1, close));
        const form = (args === undefined) ? undefined : g10kIsEqualNativeForm (g10kIsEqualStripParens (args[0]), g10kIsEqualStripParens (args[1]), masked, signature, methods, m[1] === '!');
        if (form === undefined) {
            continue;
        }
        const before = fn.slice (0, m.index);
        const after = fn.slice (close + 1);
        // gofmt drops parens around a whole control condition; an already-parenthesised call keeps one pair
        const wrapped = /(?:^|\n)\t*(?:\} else )?if $/.test (before) && /^ \{\n/.test (after);
        const inParens = before.endsWith ('(') && after.startsWith (')');
        const bare = form.startsWith ('(') && (goMatchingCloseText (form, 0) === form.length - 1) ? form.slice (1, -1) : form;
        out += fn.slice (cursor, m.index) + ((wrapped || inParens) ? bare : ('(' + bare + ')'));
        cursor = close + 1;
        re.lastIndex = cursor;
    }
    return out + fn.slice (cursor);
}

function g10kIsEqualSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (body: string): string => g10kIsEqualNative ('\nfunc (this *X) f(p any, n int) any {\n' + body + '\treturn nil\n}\n\nfunc (this *X) HandleErrorMessage(c any, m any) bool {\n\treturn true\n}\n\nfunc (this *X) Other(c any) any {\n\treturn nil\n}\n');
    const pos = f ('\tvar s string = ToString(p)\n\tvar l *int64 = this.SafeInteger(p, "k")\n\tvar market map[string]any = this.Market(p)\n\tif IsEqual(s, "a") {\n\t}\n\tif !IsEqual(l, 1) && IsEqual(l, n) {\n\t}\n\tvar b bool = (IsEqual(market["settle"], "USDT")) || ccxt.IsEqual(this.HandleErrorMessage(p, p), true)\n');
    ok (pos.indexOf ('\tif s == "a" {\n') >= 0, 'scalar vs literal: ' + pos);
    ok (pos.indexOf ('if (l == nil || *l != 1) && (l != nil && *l == int64(n)) {') >= 0, 'pointer vs literal/int ident: ' + pos);
    ok (pos.indexOf ('var b bool = (market["settle"] == "USDT") || (this.HandleErrorMessage(p, p) == true)') >= 0, 'market row + bool method: ' + pos);
    const keep = f ('\tvar q any = p\n\tvar market map[string]any = this.Market(p)\n\tmarket = map[string]any{}\n\tvar i int64 = 1\n\tif IsEqual(q, "a") || IsEqual(p, 1) || IsEqual(market["k"], "x") || IsEqual(this.Other(p), true) || IsEqual(i, 1.5) || IsEqual(i, nil) || IsEqual(this.SafeInteger(p, "k"), 1) {\n\t}\n');
    ok (keep.indexOf ('if IsEqual(q, "a") || IsEqual(p, 1) || IsEqual(market["k"], "x") || IsEqual(this.Other(p), true) || IsEqual(i, 1.5) || IsEqual(i, nil) || IsEqual(this.SafeInteger(p, "k"), 1) {') >= 0, 'unproven operands keep the helper: ' + keep);
    const rowNil = f ('\tvar market map[string]any = this.Market(p)\n\tif IsEqual(market["k"], nil) || IsEqual(market["k"], 1) {\n\t}\n');
    ok (rowNil.indexOf ('IsEqual(market["k"], nil) || IsEqual(market["k"], 1)') >= 0, 'row values vs nil/number keep the helper: ' + rowNil);
    const sd = f ('\tif !IsEqual(this.SafeInteger(p, "k", 0), 0) || IsEqual(this.SafeString(p, "k", ""), "x") || IsEqual(this.SafeInteger(p, "k"), 0) {\n\t}\n');
    ok (sd.indexOf ('if (*this.SafeInteger(p, "k", 0) != 0) || (*this.SafeString(p, "k", "") == "x") || IsEqual(this.SafeInteger(p, "k"), 0) {') >= 0, 'defaulted Safe* deref: ' + sd);
    ok (g10kIsEqualNative (pos) === pos, 'second application is a no-op');
    return problems;
}

// ===== G10K-addelem: `var x any` map locals retyped to map[string]any =====
// Every write is a fresh non-nil map (literal, Extend/DeepExtend, OmitDict of x, HandleUntilOption(_, x, _)[0])
// and no read observes the box, so the typed-container pass can print plain `x[k] = v` for its writes.
function g10kAddElemMapWrite (rhs: string, n: string): string | undefined {
    const r = rhs.trim ();
    if (/^(?:map\[string\]any\{|this\.(?:Extend|DeepExtend)\()/.test (r)) {
        return r;
    }
    const omit = new RegExp ('^this\\.Omit\\(' + n + ', ').exec (r);
    return ((omit !== null) && (goMapWriteGroupEnd (r, r.indexOf ('(')) === r.length)) ? 'this.OmitDict(' + r.substring (omit[0].length - n.length - 2) : undefined;
}

function g10kAddElemRetypeFunc (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const names = new Set ([ ...maskedFunc.matchAll (/(?<![\w.])(?:ccxt\.)?AddElementToObject\((\w+), /g) ].map ((m) => m[1]));
    for (const name of names) {
        const n = goAccessEscape (name);
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((n !== name) || (decl === undefined) || (decl.type !== 'any') || (decl.index === undefined)
            || new RegExp ('\\b' + n + '\\s*\\.\\s*\\(|&\\s*' + n + '\\b|\\b' + n + '\\s*[!=]=|[!=]=\\s*' + n + '\\b|IsEqual\\(' + n + ', nil\\)|\\b' + n + '\\s*(?:\\+\\+|--|[-+*/%]=)').test (maskedFunc)) {
            continue;
        }
        const declRx = new RegExp ('^(\\s*var ' + n + ' )any( = )(.*)$');
        const untilRx = new RegExp ('^\\s*' + n + ', \\w+ = this\\.HandleUntilOption\\([^,()\\n]*, ' + n + ', ');
        const writeRx = new RegExp ('^(\\s*' + n + ' = )(.*)$');
        const edits: [number, string][] = [];
        let safe = true;
        for (let k = start + 1; (k < end) && safe; k++) {
            const d = declRx.exec (masked[k]);
            const w = writeRx.exec (masked[k]);
            if (d) {
                const rhs = lines[k].substring (d[1].length + 3 + d[2].length);
                safe = /^map\[string\]any\{/.test (rhs.trim ()) || /^this\.(?:Extend|DeepExtend)\(/.test (rhs.trim ());
                edits.push ([ k, lines[k].replace (declRx, '$1map[string]any$2$3') ]);
            } else if (w) {
                const rhs = lines[k].substring (w[1].length);
                const out = (goMapWriteGroupEnd (masked[k].substring (w[1].length), w[2].indexOf ('(') < 0 ? 0 : w[2].indexOf ('(')) >= 0) ? g10kAddElemMapWrite (rhs, n) : undefined;
                safe = (out !== undefined) && (lines[k].indexOf ('//') < 0);
                if (safe) {
                    edits.push ([ k, w[1] + out ]);
                }
            } else if (untilRx.test (masked[k])) {
                continue; // returns MapTyped(x): x itself
            } else if (new RegExp ('(?:^|[^\\w.])' + n + '\\s*,[^=\\n]*=(?!=)|,\\s*' + n + '\\s*(?:,[^=\\n]*)?:?=(?!=)').test (masked[k])) {
                safe = false;
            } else if (goTextWritesName (masked[k], n) && !new RegExp ('\\b' + n + '\\s*\\[').test (masked[k])) {
                safe = false;
            }
        }
        if (safe && (edits.length > 0) && declRx.test (masked[edits[0][0]])) {
            for (const [ k, text ] of edits) {
                lines[k] = text;
                masked[k] = goTextMaskLiteralsAndComments (text);
            }
        }
    }
}

function g10kAddElemRetypeMapLocals (content: string): string {
    if (!/\bAddElementToObject\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            g10kAddElemRetypeFunc (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

// ===== G10K-gv-map: GetValue(m, "lit") -> m["lit"] on multi-line market-row locals =====
// Extends nativeMarketRowReads to `var m map[string]any = this.Market(<multi-line arg>)` and to
// writes from another market-row local: every value of a MarketTyped row reads as GetValue does.
function g10kGvMapReads (content: string): string {
    if (!/\bGetValue\(\w+, "/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            g10kGvMapFunc (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

// end line of a market call opened at (k, col), when the call closes its statement; else -1
function g10kGvMapCallEnd (masked: string[], k: number, col: number, end: number): number {
    let depth = 0;
    for (let j = k; j < end; j++) {
        for (let c = (j === k) ? col : 0; c < masked[j].length; c++) {
            const ch = masked[j][c];
            depth += '([{'.includes (ch) ? 1 : (')]}'.includes (ch) ? -1 : 0);
            if (depth === 0 && ')]}'.includes (ch)) {
                return (masked[j].substring (c + 1).trim () === '') ? j : -1;
            }
        }
    }
    return -1;
}

function g10kGvMapFunc (lines: string[], masked: string[], start: number, end: number) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const call = '(?:ccxt\\.)?this\\.(?:DerivedExchange\\.|Exchange\\.)?(?:Market|SafeMarket|Currency|SafeCurrency)\\(';
    const verdicts = new Map<string, number | undefined> ();
    const rowLocal = (name: string, seen: string[]): number | undefined => {
        if (verdicts.has (name)) {
            return verdicts.get (name);
        }
        verdicts.set (name, undefined); // cycles fail closed
        const n = goAccessEscape (name);
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
        if ((decl === undefined) || (decl.type !== 'map[string]any') || (decl.index === undefined) || (seen.length > 4)
            || new RegExp ('&\\s*' + n + '\\b|AddElementToObject\\(' + n + '\\b|(?<![\\w.])' + n + '\\s*\\[[^\\n]*\\]\\s*=(?!=)').test (maskedFunc)) {
            return undefined;
        }
        const write = new RegExp ('(?<![\\w.])' + n + '\\b[^\\n=(]*(?<![=!<>:])=(?!=)');
        const form = new RegExp ('^(\\s*)(var ' + n + ' map\\[string\\]any|' + n + ') = (.*)$');
        let declLine = -1;
        for (let k = start + 1; k < end; k++) {
            if (!write.test (masked[k])) {
                continue;
            }
            const m = form.exec (masked[k]);
            if (m === null) {
                return undefined;
            }
            const rhs = m[3].trim ();
            const rhsAt = masked[k].length - masked[k].trimStart ().length + m[2].length + 3;
            let ok = (rhs === 'nil');
            if (!ok && new RegExp ('^' + call).test (rhs)) {
                const close = g10kGvMapCallEnd (masked, k, masked[k].indexOf ('(', rhsAt), end);
                ok = close >= k;
                if (ok) {
                    k = close;
                }
            } else if (!ok && /^\w+$/.test (rhs) && (seen.indexOf (rhs) < 0)) {
                const other = rowLocal (rhs, seen.concat ([ name ]));
                ok = (other !== undefined) && (other < k);
            }
            if (!ok) {
                return undefined;
            }
            if (m[2].startsWith ('var ')) {
                declLine = k;
            }
        }
        const verdict = (declLine >= 0) ? declLine : undefined;
        verdicts.set (name, verdict);
        return verdict;
    };
    for (let k = start + 1; k < end; k++) {
        if (masked[k].indexOf ('GetValue(') < 0) {
            continue;
        }
        const m = masked[k];
        lines[k] = lines[k].replace (/(?<![\w.])(?:ccxt\.)?GetValue\((\w+), ("[^"\\\n]*")\)/g, (all: string, name: string, key: string, at: number) => {
            const head = all.substring (0, all.indexOf ('(') + 1 + name.length);
            const declLine = (m.substr (at, head.length) === head) ? rowLocal (name, []) : undefined;
            return ((declLine !== undefined) && (declLine < k)) ? name + '[' + key + ']' : all;
        });
    }
}

function g10kGvMapSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('g10k-gv-map: ' + msg); } };
    const f = (body: string) => g10kGvMapReads ('func (this *X) f(s []string) any {\n' + body + '\treturn nil\n}\n');
    const ml = '\tvar market map[string]any = this.Market(func() any {\n\t\treturn s[0]\n\t}())\n';
    ok (f (ml + '\tif GetValue(market, "spot") == true {\n\t}\n').indexOf ('market["spot"] == true') >= 0, 'multi-line Market init');
    ok (f ('\tvar market map[string]any = nil\n\tif x {\n\t\tvar mr map[string]any = this.Market(s)\n\t\tmarket = mr\n\t}\n\tvar a any = GetValue(market, "id")\n').indexOf ('market["id"]') >= 0, 'row-local write');
    // hx4 X02: currency rows (CurrencyTyped)
    ok (f ('\tvar currency map[string]any = nil\n\tif x {\n\t\tcurrency = this.Currency(s)\n\t}\n\tvar a any = GetValue(currency, "id")\n').indexOf ('currency["id"]') >= 0, 'currency row');
    ok (nativeMarketRowReads ('func (this *X) f(s any) any {\n\tvar currency map[string]any = nil\n\tcurrency = this.SafeCurrency(s)\n\treturn GetValue(currency, "code")\n}\n').indexOf ('return currency["code"]') >= 0, 'safeCurrency row');
    const scs = 'func (this *BaseExchange) SafeCurrencyStructure(currency any) map[string]any {\n\tAddElementToObject(currency, "a", 1)\n\treturn this.Extend(map[string]any{\n\t\t"id": nil,\n\t}, currency)\n}\n';
    ok (x02CurrencyRows (scs).indexOf ('\treturn CurrencyTyped(this.Extend(map[string]any{') >= 0 && x02CurrencyRows (scs).indexOf ('}, currency))\n}') >= 0, 'structure row normalised');
    const early = scs.replace ('\tAddElementToObject', '\tif x {\n\treturn nil\n\t}\n\tAddElementToObject');
    ok (x02CurrencyRows (early) === early, 'second function-level return keeps the body');
    ok (nativeMarketRowReads ('func (this *X) f(s any) any {\n\tvar currency map[string]any = nil\n\tcurrency = this.SafeCurrencyStructure(s)\n\treturn GetValue(currency, "code")\n}\n').indexOf ('GetValue(currency,') >= 0, 'structure call keeps GetValue');
    const keep = [
        ml + '\tmarket["spot"] = this.SafeBool(x, "s")\n\tvar a any = GetValue(market, "spot")\n',
        ml + '\tAddElementToObject(market, "spot", p)\n\tvar a any = GetValue(market, "spot")\n',
        ml + '\tmarket = this.SafeDict(c)\n\tvar a any = GetValue(market, "spot")\n',
        '\tvar a any = GetValue(market, "spot")\n' + ml,
        '\tvar market map[string]any = this.Market(func() any {\n\t\treturn s[0]\n\t}())[\"x\"]\n\tvar a any = GetValue(market, "spot")\n',
        '\tvar market map[string]any = nil\n\tvar mr map[string]any = GetArgMap(o, 0, nil)\n\tmarket = mr\n\tvar a any = GetValue(market, "id")\n',
        ml + '\tvar k any = "spot"\n\tvar a any = GetValue(market, k)\n',
    ];
    keep.forEach ((b: string, i: number) => ok (f (b).indexOf ('GetValue(market,') >= 0, 'negative ' + i));
    return problems;
}

// ===== G10K-str: native strings.* for string helpers on operands H2K-g16 could not prove =====
// Adds: *string locals from a defaulted this.SafeString* (never nil), *int64 from a defaulted
// SafeInteger, this.Id, base int64 clocks, ClientInterface.GetUrl(), []string element reads, string sums.
function g10kStrSafeStringArity (): Record<string, number> {  // function, not const: runMain runs before EOF consts init
    return { SafeString: 3, SafeStringLower: 3, SafeStringUpper: 3, SafeString2: 4, SafeStringLower2: 4, SafeStringUpper2: 4 };
}

// the only write of `name` in the function is its declaration (no assignment, no address taken)
// the Go kind of a local bound exactly once by `:=` from a typed producer and never written again:
// slot 0 of the base HandleOptionInteger(AndParams|AndParams2) tuple is int64, NewPrecise returns *PreciseStruct
function g10kBoundOnceKind (masked: string, name: string, file: string): string | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name) || (name === 'nil')) {
        return undefined;
    }
    const bind = [ ...masked.matchAll (new RegExp ('^[ \\t]*' + name + '(?:, *[A-Za-z_]\\w*)* := ([^\\n]*)$', 'gm')) ];
    const any = [ ...masked.matchAll (new RegExp ('(?<![\\w.])' + name + '\\b[^\\n=]*:=', 'g')) ];
    if ((bind.length !== 1) || (any.length !== 1)) {
        return undefined;
    }
    const rest = masked.replace (bind[0][0], '');
    const n = name;
    if (new RegExp ('(?<![\\w.])' + n + '\\s*(?:,\\s*[\\w.]+\\s*)*(?:[-+*/%|&^]?=(?!=)|\\+\\+|--)|,\\s*' + n + '\\s*(?:,\\s*[\\w.]+\\s*)*=(?!=)|&' + n + '\\b|\\bfunc\\b[^\\n]*\\b' + n + '\\b|\\bvar ' + n + '\\b|\\brange\\b[^\\n]*\\b' + n + '\\b').test (rest)) {
        return undefined;
    }
    const first = new RegExp ('^' + n + '(?:,|\\s)').test (bind[0][0].trim ());
    const call = bind[0][1];
    const tuple = /^this\.(HandleOptionInteger(?:AndParams|AndParams2))\(/.exec (call);
    if (first && (tuple !== null) && !g10kStrOverrides (file, tuple[1])) {
        return 'int64';
    }
    if ((new RegExp ('^' + n + ' := ').test (bind[0][0].trim ())) && /^(?:ccxt\.)?NewPrecise\(/.test (call)) {
        return 'precise';
    }
    return undefined;
}

function g10kStrWrittenOnce (maskedFunc: string, name: string): boolean {
    const writes = [ ...maskedFunc.matchAll (new RegExp ('(?<![\\w.*])' + name + '\\s*(?:[-+*/%|&^]?=(?!=)|\\+\\+|--)', 'g')) ];
    return (writes.length === 0) && !new RegExp ('&' + name + '\\b').test (maskedFunc);
}

// the initializer text of the single `var name T = ...` line
function g10kStrInit (func: string, masked: string, name: string, type: string): string | undefined {
    const m = new RegExp ('\\bvar ' + name + ' ' + type.replace (/[*\[\]]/g, '\\$&') + ' = ').exec (masked);
    if (m === null) {
        return undefined;
    }
    const start = m.index + m[0].length;
    const end = masked.indexOf ('\n', start);
    return func.substring (start, end).replace (/\s*\/\/.*$/, '').trim ();
}

function g10kStrOverrides (file: string, method: string): boolean {
    return new RegExp ('^func \\(this \\*\\w+\\) ' + method + '\\(', 'm').test (file);
}

// { kind, text }: the operand's Go type and the expression that yields it natively
function hx11w8M308AllScopesString (masked: string, name: string): boolean {
    if (!/^[A-Za-z_]\w*$/.test (name) || (name === 'nil')) {
        return false;
    }
    const decls = [ ...masked.matchAll (new RegExp ('\\bvar ' + name + ' ([\\w\\[\\]*]+)(?: =|\\n)', 'g')) ];
    if ((decls.length < 2) || !decls.every ((d) => d[1] === 'string')) {
        return false;
    }
    const other = new RegExp ('\\b' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\w+\\s*,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|func\\s*(?:\\([^)]*\\)\\s*\\w*\\s*)?\\([^)]*\\b' + name + '\\b[^)]*\\)|\\bvar ' + name + '\\s*,|,\\s*' + name + '\\s+[\\w.*\\[\\]]+\\s*[,)]|\\brange\\b[^\\n]*\\b' + name + '\\b');
    return !other.test (masked);
}

function g10kStrOperand (arg: string, func: string, masked: string, file: string): { kind: string, text: string } | undefined {
    let g16 = h2kG16Kind (arg, masked);
    if ((g16 === undefined) && /^[A-Za-z_]\w*$/.test (arg)) {
        // h2kG16DeclaredType's type pattern has no `*`: rename the pointer type, keep its other checks
        const ptr = h2kG16DeclaredType (masked.replace (new RegExp ('\\bvar ' + arg + ' \\*(string|int64) ', 'g'), 'var ' + arg + ' PTR$1 '), arg);
        g16 = (ptr === 'PTRstring') ? '*string' : ((ptr === 'PTRint64') ? '*int64' : undefined);
    }
    if ((g16 === 'string') || (g16 === 'int') || (g16 === 'int64') || (g16 === '[]string') || (g16 === 'const-int')) {
        return { kind: g16, text: arg };
    }
    if ((g16 === '*string') || (g16 === '*int64')) {
        const init = g10kStrInit (func, masked, arg, g16);
        if ((init === undefined) || !g10kStrWrittenOnce (masked.replace (new RegExp ('\\bvar ' + arg + ' '), 'var _ '), arg)) {
            return undefined;
        }
        const call = /^this\.(\w+)\(/.exec (init);
        if ((call === null) || g10kStrOverrides (file, call[1])) {
            return undefined;
        }
        const initMasked = goTextMaskLiteralsAndComments (init);
        const parsed = h2kG16Args (init, initMasked, call[0].length - 1);
        if ((parsed === undefined) || (parsed.end !== init.length - 1)) {
            return undefined;
        }
        const last = parsed.args[parsed.args.length - 1];
        // the method returns the default when the key is absent, so a literal default is never nil
        if ((g16 === '*string') && (g10kStrSafeStringArity ()[call[1]] === parsed.args.length) && H2K_G16_STR_LIT ().test (last)) {
            return { kind: 'string', text: '*' + arg };
        }
        if ((g16 === '*int64') && (call[1] === 'SafeInteger') && (parsed.args.length === 3) && H2K_G16_INT_LIT ().test (last)) {
            return { kind: 'int64', text: '*' + arg };
        }
        return undefined;
    }
    if (/^[A-Za-z_]\w*$/.test (arg) && (g16 === undefined)) {
        const bound = g10kBoundOnceKind (masked, arg, file);
        if (bound !== undefined) {
            return { kind: bound, text: arg };
        }
    }
    if (arg === 'this.Id') {
        return { kind: 'string', text: arg };
    }
    // an already-dereferenced pointer ident is the string its proven-non-nil operand prints as `*x`
    const deref = /^\*([A-Za-z_]\w*)$/.exec (arg);
    if (deref !== null) {
        const inner = g10kStrOperand (deref[1], func, masked, file);
        return ((inner !== undefined) && (inner.kind === 'string') && (inner.text === arg)) ? inner : undefined;
    }
    // hx11 w8 M308: a name that every `var` in the func declares `string` (sibling scopes), never bound another way
    if (hx11w8M308AllScopesString (masked, arg)) {
        return { kind: 'string', text: arg };
    }
    // strconv.FormatInt/Itoa of a plain identifier or field is a string
    if (/^strconv\.(?:FormatInt\([\w.]+, 10|Itoa\([\w.]+)\)$/.test (arg)) {
        return { kind: 'string', text: arg };
    }
    // hx11 w8 M308: plain-string base fields (exchange.go declares them `string`, not a box)
    if (/^this\.(?:ApiKey|Secret|Password|Uid|AccountId|PrivateKey|WalletAddress|Hostname)$/.test (arg)) {
        return { kind: 'string', text: arg };
    }
    const clock = /^this\.(Milliseconds|Seconds|Microseconds)\(\)$/.exec (arg);
    if ((clock !== null) && !g10kStrOverrides (file, clock[1])) {
        return { kind: 'int64', text: arg };
    }
    // Nonce () and IncrementingNonce () are int64 in the interface, the base and every override (hx11w8NonceInt64)
    if (/^this\.(?:Incrementing)?Nonce\(\)$/.test (arg)) {
        return { kind: 'int64', text: arg };
    }
    if (/^client\.\((?:ccxt\.)?ClientInterface\)\.GetUrl\(\)$/.test (arg)) {
        return { kind: 'string', text: arg };
    }
    const elem = /^([A-Za-z_]\w*)\[([A-Za-z_]\w*|\d{1,9})\]$/.exec (arg);
    if ((elem !== null) && (h2kG16DeclaredType (masked, elem[1]) === '[]string')) {
        return { kind: 'string', text: arg };
    }
    // a `+` sum whose every leaf is a string that needs no rewrite
    const argMasked = goTextMaskLiteralsAndComments (arg);
    const parts: string[] = [];
    let depth = 0;
    let from = 0;
    for (let i = 0; i < argMasked.length; i++) {
        const c = argMasked[i];
        if ('([{'.includes (c)) { depth++; } else if (')]}'.includes (c)) { depth--; } else if ((c === '+') && (depth === 0)) { parts.push (arg.substring (from, i).trim ()); from = i + 1; }
    }
    parts.push (arg.substring (from).trim ());
    if ((parts.length > 1) && parts.every ((p) => { const o = (p !== '') && g10kStrOperand (p, func, masked, file); return o && (o.kind === 'string') && (o.text === p); })) {
        return { kind: 'string', text: arg };
    }
    return undefined;
}

function g10kStrNative (helper: string, ops: ({ kind: string, text: string } | undefined)[], rawArgs: string[]): { text: string, pkg: string } | undefined {
    if (ops.some ((o) => o === undefined)) {
        return undefined;
    }
    const o = ops as { kind: string, text: string }[];
    const str = (i: number) => (o[i].kind === 'string');
    const t = o.map ((x) => x.text);
    switch (helper) {
    case 'ToString':
        if (o.length !== 1) { return undefined; }
        if (str (0)) { return { text: t[0], pkg: '' }; }
        if (o[0].kind === 'int') { return { text: 'strconv.Itoa(' + t[0] + ')', pkg: 'strconv' }; }
        if (o[0].kind === 'int64') { return { text: 'strconv.FormatInt(' + t[0] + ', 10)', pkg: 'strconv' }; }
        // fmt's %v of a *PreciseStruct is its String(), which is what the helper's default arm prints
        if (o[0].kind === 'precise') { return { text: t[0] + '.String()', pkg: '' }; }
        return undefined;
    case 'ToUpper':
    case 'ToLower':
        return ((o.length === 1) && str (0)) ? { text: 'strings.' + helper + '(' + t[0] + ')', pkg: 'strings' } : undefined;
    case 'Trim':
        return ((o.length === 1) && str (0)) ? { text: 'strings.TrimSpace(' + t[0] + ')', pkg: 'strings' } : undefined;
    case 'Split':
        // an empty separator splits by UTF-8 sequence in Go, by UTF-16 unit in JS: keep the helper
        return ((o.length === 2) && str (0) && str (1) && (rawArgs[1] !== '""')) ? { text: 'strings.Split(' + t[0] + ', ' + t[1] + ')', pkg: 'strings' } : undefined;
    case 'StartsWith':
    case 'EndsWith':
        return ((o.length === 2) && str (0) && str (1)) ? { text: 'strings.' + ((helper === 'StartsWith') ? 'HasPrefix' : 'HasSuffix') + '(' + t[0] + ', ' + t[1] + ')', pkg: 'strings' } : undefined;
    case 'Replace':
        return ((o.length === 3) && str (0) && str (1) && str (2)) ? { text: 'strings.ReplaceAll(' + t[0] + ', ' + t[1] + ', ' + t[2] + ')', pkg: 'strings' } : undefined;
    case 'Join':
        return ((o.length === 2) && (o[0].kind === '[]string') && str (1)) ? { text: 'strings.Join(' + t[0] + ', ' + t[1] + ')', pkg: 'strings' } : undefined;
    case 'GetIndexOf':
        if ((o.length !== 2) || !str (1)) { return undefined; }
        if (str (0)) { return { text: 'strings.Index(' + t[0] + ', ' + t[1] + ')', pkg: 'strings' }; }
        if (o[0].kind === '[]string') { return { text: 'slices.Index(' + t[0] + ', ' + t[1] + ')', pkg: 'slices' }; }
        return undefined;
    case 'PadStart':
    case 'PadEnd': {
        // one printable pad byte and a literal width on a deref'd identifier (read twice, no side effect)
        if ((o.length !== 3) || !str (0) || !/^\*?[A-Za-z_]\w*$/.test (t[0]) || !H2K_G16_INT_LIT ().test (rawArgs[1]) || !/^"[ !#-[\]-~]"$/.test (rawArgs[2])) { return undefined; }
        const s = t[0];
        const n = rawArgs[1];
        const pad = 'strings.Repeat(' + rawArgs[2] + ', max(' + n + '-len(' + s + '), 0))';
        return (helper === 'PadStart')
            ? { text: '(' + pad + ' + ' + s + ')[max(len(' + s + ')-' + n + ', 0):]', pkg: 'strings' }
            : { text: '(' + s + ' + ' + pad + ')[:' + n + ']', pkg: 'strings' };
    }
    }
    return undefined;
}

function g10kStrRewriteFunc (func: string, file: string, pkgs: Set<string>): string {
    let out = func;
    for (let pass = 0; pass < 8; pass++) {
        const masked = goTextMaskLiteralsAndComments (out);
        if (/\b(?:strings|strconv|slices|min|max|len)\b\s*(?::=|,|\s+[\w\[\]*])/.test (masked.replace (/\b(?:strings|strconv|slices)\.\w|\b(?:min|max|len)\(/g, ''))) {
            return out;     // a local shadows the package name
        }
        const hits = [ ...masked.matchAll (/(?<![\w.])(ccxt\.)?(ToString|ToUpper|ToLower|Trim|Split|StartsWith|EndsWith|Replace|Join|GetIndexOf|PadStart|PadEnd)\(/g) ];
        let changed = false;
        let firstEdit = out.length;
        for (let h = hits.length - 1; h >= 0; h--) {
            const m = hits[h];
            const parsed = h2kG16Args (out, masked, m.index + m[0].length - 1);
            if ((parsed === undefined) || (parsed.end >= firstEdit)) {
                continue;
            }
            const ops = parsed.args.map ((a) => g10kStrOperand (a, out, masked, file));
            const native = g10kStrNative (m[2], ops, parsed.args);
            if (native === undefined) {
                continue;
            }
            if (native.pkg !== '') {
                pkgs.add (native.pkg);
            }
            out = out.substring (0, m.index) + native.text + out.substring (parsed.end + 1);
            firstEdit = m.index;
            changed = true;
        }
        if (!changed) {
            break;
        }
    }
    return out;
}

// hx11 w8 r18: a func-local `var X []any = []any{<strings>}` that the func only appends proven strings to, measures
// with len(), and joins with Join(X, sep) holds plain strings, so it is a `[]string`: Join then prints strings.Join.
// Every use of the name must be one of those four forms; Join/len on a []string answer the same as on the []any of
// the same strings (ToString of a string is the string), so nothing else changes.
function hx11w8JoinStringLocals (content: string): string {
    if (!/(?<![\w.])(?:ccxt\.)?Join\(/.test (content) || (content.indexOf ('var ') < 0)) {
        return content;
    }
    const parts = content.split (/(?=^func )/m);
    for (let p = 0; p < parts.length; p++) {
        if (!parts[p].startsWith ('func ') || !/(?<![\w.])(?:ccxt\.)?Join\(/.test (parts[p])) {
            continue;
        }
        let func = parts[p];
        const masked0 = goTextMaskLiteralsAndComments (func);
        const names = [ ...masked0.matchAll (/^[ \t]*var (\w+) \[\]any = \[\]any\{/gm) ].map ((m) => m[1]);
        for (const name of new Set (names)) {
            const masked = goTextMaskLiteralsAndComments (func);
            if (h2kG16DeclaredType (masked, name) !== '[]any') {
                continue;
            }
            const n = name.replace (/\$/g, '\\$');
            const total = (masked.match (new RegExp ('(?<![\\w.])' + n + '(?![\\w])', 'g')) ?? []).length;
            const decl = new RegExp ('^([ \\t]*var ' + n + ' )\\[\\]any( = )\\[\\]any\\{(.*)\\}$', 'm').exec (func);
            if ((decl === null) || (new RegExp ('^[ \\t]*var ' + n + ' \\[\\]any = \\[\\]any\\{.*\\}$', 'm').exec (masked) === null)) {
                continue;
            }
            const elems = (decl[3].trim () === '') ? [] : goGuardedReadSplitArgs (decl[3]);
            const isString = (e: string) => { const o = g10kStrOperand (e, func, masked, content); return (o !== undefined) && (o.kind === 'string') && (o.text === e); };
            if (!elems.every (isString)) {
                continue;
            }
            let accounted = 1 + elems.reduce ((a, e) => a + (e.match (new RegExp ('(?<![\\w.])' + n + '(?![\\w])', 'g')) ?? []).length, 0);
            let ok = true;
            for (const m of func.matchAll (new RegExp ('^[ \\t]*' + n + ' = append\\(' + n + ', (.+)\\)$', 'gm'))) {
                if (!isString (m[1].trim ()) || (new RegExp ('(?<![\\w.])' + n + '(?![\\w])').test (m[1]))) {
                    ok = false;
                }
                accounted += 2;
            }
            const lens = (masked.match (new RegExp ('(?<![\\w.])len\\(' + n + '\\)', 'g')) ?? []).length;
            const joins = (masked.match (new RegExp ('(?<![\\w.])(?:ccxt\\.)?Join\\(' + n + ', ', 'g')) ?? []).length;
            accounted += lens + joins;
            if (!ok || (joins < 1) || (accounted !== total)) {
                continue;
            }
            func = func.replace (decl[0], decl[1] + '[]string' + decl[2] + '[]string{' + decl[3] + '}');
        }
        parts[p] = func;
    }
    return parts.join ('');
}

function hx11w8JoinStringLocalsCheck (): string[] {
    const problems: string[] = [];
    const hdr = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n' + H2K_G16_HEADER () + '\n\n';
    const f = (body: string) => hx5X27StringHelpers (hx11w8JoinStringLocals (hdr + 'func (this *X) F(n any) any {\n\tvar s string = "v"\n' + body + '}\n'));
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx11 w8 r18 join locals: ' + msg); } };
    const base = '\tvar parts []any = []any{}\n\tfor i := 0; i < 3; i++ {\n\t\tparts = append(parts, s)\n\t}\n';
    const pos = f (base + '\tvar j string = Join(parts, \"_\")\n\treturn j\n');
    ok (pos.includes ('var parts []string = []string{}') && pos.includes ('strings.Join(parts, \"_\")'), 'string-only local joins natively');
    ok (f (base + '\tvar j string = Join(parts, \"_\")\n\treturn len(parts) + len(j)\n').includes ('strings.Join(parts, '), 'len() is allowed');
    ok (f (base + '\tvar j string = Join(parts, \"_\")\n\treturn parts\n').includes ('[]any = []any{}'), 'returned local stays []any');
    ok (f (base + '\tparts = append(parts, n)\n\tvar j string = Join(parts, \"_\")\n\treturn j\n').includes ('[]any = []any{}'), 'any element stays []any');
    ok (f (base + '\tvar j string = Join(parts, \"_\")\n\treturn GetValue(parts, 0)\n').includes ('[]any = []any{}'), 'GetValue read stays []any');
    ok (f (base + '\tvar j string = Join(parts, \"_\")\n\treturn j\n') === hx5X27StringHelpers (hx11w8JoinStringLocals (f (base + '\tvar j string = Join(parts, \"_\")\n\treturn j\n'))), 'idempotent');
    ok (f ('\tvar parts []any = []any{\"a\", s}\n\tvar j string = Join(parts, \",\")\n\treturn j\n').includes ('[]string{\"a\", s}'), 'literal string elements');
    ok (f ('\tvar parts []any = []any{\"a\", n}\n\tvar j string = Join(parts, \",\")\n\treturn j\n').includes ('[]any{\"a\", n}'), 'any literal element stays');
    return problems;
}

function hx11w8M308JoinNativeCheck (): string[] {
    const problems: string[] = [];
    const hdr = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n' + H2K_G16_HEADER () + '\n\n';
    const f = (body: string) => hx5X27StringHelpers (hx11w8JoinStringLocals (hdr + 'func (this *X) F(n any) any {\n\tvar s string = "v"\n' + body + '}\n'));
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx11 w8 M308 join native: ' + msg); } };
    const join = '\tvar j string = Join(p, ",")\n\treturn j\n';
    ok (f ('\tvar p []any = []any{this.Hostname, s}\n' + join).includes ('[]string{this.Hostname, s}'), 'plain string field is a string element');
    ok (f ('\tvar p []any = []any{this.Token, s}\n' + join).includes ('[]any{this.Token, s}'), 'boxed field stays any');
    ok (f ('\tif n == nil {\n\t\tvar u string = "a"\n\t\t_ = u\n\t} else {\n\t\tvar u string = "b"\n\t\t_ = u\n\t}\n\tvar p []any = []any{u, s}\n' + join).includes ('[]string{u, s}'), 'string declared in sibling scopes');
    ok (f ('\tvar u string = "a"\n\tvar u any = 1\n\tvar p []any = []any{u, s}\n' + join).includes ('[]any{u, s}'), 'mixed declarations stay any');
    ok (f ('\tvar p []any = []any{strconv.FormatInt(n, 10), s}\n' + join).includes ('[]string{strconv.FormatInt(n, 10), s}'), 'FormatInt is a string');
    return problems;
}

function g10kStrNativeStringHelpers (filePath: string, content: string): string {
    // base exchange_*.go files carry no import clause to extend
    if (!filePath.endsWith ('.go') || filePath.endsWith ('_api.go') || /(?:^|[\\/])exchange_[\w]*\.go$/.test (filePath) || (content.indexOf (H2K_G16_HEADER ()) < 0)) {
        return content;
    }
    const has = (pkg: string) => new RegExp ('^import "' + pkg + '"$|^\\s+"' + pkg + '"$', 'm').test (content);
    const pkgs = new Set<string> ();
    const parts = content.split (/(?=^func )/m);
    let out = parts.map ((part, i) => ((i === 0) && !part.startsWith ('func ')) ? part : g10kStrRewriteFunc (part, content, pkgs)).join ('');
    const missing = [ ...pkgs ].filter ((p) => !has (p)).sort ();
    if (missing.length > 0) {
        const at = out.indexOf (H2K_G16_HEADER ()) + H2K_G16_HEADER ().length;
        out = out.substring (0, at) + '\n\n' + missing.map ((p) => 'import "' + p + '"').join ('\n') + out.substring (at);
    }
    return out;
}

function g10kStrSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('G10K-str: ' + msg); } };
    const hdr = 'package ccxt\n\n' + H2K_G16_HEADER () + '\n\n';
    const f = (body: string) => g10kStrNativeStringHelpers ('x/foo.go', hdr + 'func (this *X) f() any {\n' + body + '}\n');
    ok (f ('\tvar t *string = this.SafeString(m, "k", "")\n\treturn Split(t, ".")\n').indexOf ('strings.Split(*t, ".")') >= 0, 'defaulted SafeString goes native');
    ok (f ('\tvar t *string = this.SafeString(m, "k")\n\treturn Split(t, ".")\n').indexOf ('Split(t, ".")') >= 0, 'nullable SafeString keeps the helper');
    ok (f ('\tvar t *string = this.SafeString(m, "k", "")\n\tt = this.SafeString(m, "j")\n\treturn Split(t, ".")\n').indexOf ('strings.Split') < 0, 'rewritten local keeps the helper');
    ok (f ('\tvar n *int64 = this.SafeInteger(m, "k", 100)\n\treturn ToString(n)\n').indexOf ('strconv.FormatInt(*n, 10)') >= 0, 'defaulted SafeInteger goes native');
    ok (f ('\tvar n *int64 = this.SafeInteger(m, 0)\n\treturn ToString(n)\n').indexOf ('ToString(n)') >= 0, 'nullable SafeInteger keeps the helper');
    ok (f ('\treturn GetIndexOf(client.(ccxt.ClientInterface).GetUrl(), "spot")\n').indexOf ('strings.Index(client') >= 0, 'GetUrl goes native');
    ok (f ('\tvar ks []string = nil\n\treturn Trim(ks[0])\n').indexOf ('strings.TrimSpace(ks[0])') >= 0, '[]string element goes native');
    ok (f ('\treturn GetIndexOf(this.Secret, "K")\n').indexOf ('GetIndexOf(this.Secret') >= 0, 'any field keeps the helper');
    ok (f ('\tvar t *string = this.SafeString(m, "k", "")\n\treturn PadEnd(t, 6, "0")\n').indexOf ('(*t + strings.Repeat("0", max(6-len(*t), 0)))[:6]') >= 0, 'PadEnd goes native');
    ok (f ('\tvar t *string = this.SafeString(m, "k", "")\n\treturn Split(t, ".")\n').indexOf ('import "strings"') >= 0, 'import added');
    ok (g10kStrNativeStringHelpers ('x/exchange_foo.go', hdr + 'func f() any {\n\treturn Trim(ks[0])\n}\n').indexOf ('Trim(ks[0])') >= 0, 'base file untouched');
    return problems;
}

// ===== G10K-len: native len() on block-scoped typed operands =====
// A GetArrayLength/GetLength operand whose nearest in-scope declaration is a slice/string (or a
// never-nil *string) reads natively; any rebinding form (:=, range, closure param, &x) keeps the helper.
function g10kLenDeclType (lines: string[], at: number, name: string): string | undefined {
    const indent = (l: string) => (/^\t*/.exec (l) as RegExpExecArray)[0].length;
    let min = indent (lines[at]);
    const decl = new RegExp ('^\\t*var ' + name + ' ([\\w*.\\[\\]]+)(?: =|$)');
    for (let k = at - 1; k >= 0; k--) {
        const l = lines[k];
        if (l.trim () === '') {
            continue;
        }
        if (/^func /.test (l)) {
            const p = l.match (new RegExp ('[(,]\\s*' + name + ' ([\\w*.\\[\\]]+)\\s*[,)]'));
            return p ? p[1] : undefined;
        }
        const i = indent (l);
        if (i < min) {
            min = i;
        }
        const d = (i <= min) ? decl.exec (l) : null;
        if (d) {
            return d[1];
        }
    }
    return undefined;
}

function g10kLenFunc (fn: string): string {
    const nameRe = '(\\w+)';
    const call = new RegExp ('(?<![\\w.])(?:ccxt\\.)?(GetArrayLength|GetLength)\\((?:\\(' + nameRe + '\\)|' + nameRe + ')\\)', 'g');
    if (!/(?:GetArrayLength|GetLength)\(/.test (fn)) {
        return fn;
    }
    const lines = fn.split ('\n');
    const rebinds = (n: string) => new RegExp ('(?<![.\\w])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|&' + n + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + n + ' ').test (fn.substring (fn.indexOf ('\n', 1) + 1));
    const slices = [ '[]any', '[]string', '[]int64', '[]float64', '[]bool', '[]int', '[][]any', '[]map[string]any', 'string' ];
    for (let k = 0; k < lines.length; k++) {
        lines[k] = lines[k].replace (call, ((m: string, h: string, xp: string, xb: string, at: number, line: string) => {
            const x = xp || xb;
            if (((line.substring (0, at).match (/(?<!\\)"/g) || []).length % 2) === 1 || /^\s*\/\//.test (line) || rebinds (x)) {
                return m;
            }
            const t = g10kLenDeclType (lines, k, x);
            if (t === undefined) {
                return m;
            }
            if (h === 'GetArrayLength' && slices.includes (t)) {
                return 'len(' + x + ')';
            }
            if (h === 'GetLength' && t !== 'string' && t !== '*string' && !t.startsWith ('[]')) {
                return m;
            }
            if (h === 'GetLength' && (slices.includes (t))) {
                return 'len(' + x + ')';
            }
            if (t !== '*string') {
                return m;
            }
            const guard = new RegExp ('\\(' + x + ' != nil\\) && \\($|\\(' + x + ' == nil\\) \\|\\| \\($').test (line.substring (0, at));
            return (guard || goG14NonNilStringPtr (fn, x)) ? 'len(*' + x + ')' : m;
        }) as any);
    }
    // ClientInterface.GetUrl() is declared `string`; the assertion panics the same either way
    return lines.join ('\n').replace (/(?<![\w.])(?:ccxt\.)?GetLength\((\w+\.\(ccxt\.ClientInterface\)\.GetUrl\(\))\)/g, 'len($1)');
}

function g10kLenNative (content: string): string {
    if (!/(?:GetArrayLength|GetLength)\(/.test (content)) {
        return content;
    }
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => g10kLenFunc (fn)) as any);
}

function g10kLenSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('G10K-len: ' + m); } };
    const f = (sig: string, body: string) => g10kLenNative ('\nfunc (this *X) M(' + sig + ') any {\n' + body + '\treturn nil\n}\n');
    ok (f ('', '\tvar c *string = this.SafeString(o, "k")\n\tif (c == nil) || (ccxt.GetLength(c) == 0) {\n\t}\n').includes ('(c == nil) || (len(*c) == 0)'), 'nil-or guard');
    ok (f ('', '\tvar c *string = this.SafeString(o, "k")\n\tif (c != nil) || (GetLength(c) == 0) {\n\t}\n').includes ('GetLength(c)'), 'wrong guard keeps helper');
    ok (f ('', '\tvar e *string = this.SafeString(o, "m", "")\n\tif GetLength(e) > 0 {\n\t}\n').includes ('len(*e) > 0'), 'defaulted SafeString');
    ok (f ('', '\tvar e *string = this.SafeString(o, "m")\n\tif GetLength(e) > 0 {\n\t}\n').includes ('GetLength(e)'), 'nullable keeps helper');
    ok (f ('', '\tif a {\n\t\tvar d []any = SafeListTyped(m, "d")\n\t\t_ = d\n\t} else {\n\t\tvar d any = this.SafeValue(m, "d")\n\t\tn := GetArrayLength(d)\n\t}\n').includes ('GetArrayLength(d)'), 'sibling block any keeps helper');
    ok (f ('', '\tif a {\n\t\tvar d []any = SafeListTyped(m, "d")\n\t\tn := GetArrayLength(d)\n\t}\n').includes ('n := len(d)'), 'block []any');
    ok (f ('s []string', '\tfor _, s := range t {\n\t\tn := GetArrayLength(s)\n\t}\n').includes ('GetArrayLength(s)'), 'range rebind keeps helper');
    ok (f ('', '\tvar u int = ccxt.GetLength(client.(ccxt.ClientInterface).GetUrl())\n').includes ('len(client.(ccxt.ClientInterface).GetUrl())'), 'GetUrl string');
    ok (f ('', '\tvar s string = "GetLength(x)"\n').includes ('"GetLength(x)"'), 'string literal untouched');
    return problems;
}

// ===== G10K-typepred: IsArray folds on single-write Safe{List,Dict} locals =====
// SafeList/SafeListN (nil default) hold an array box or nil -> IsArray is `x != nil`;
// SafeDict (nil or `map[string]any{}` default) never holds an array -> IsArray is false.
function g10kTypepredWriteCount (fn: string, x: string): number {
    const w = new RegExp ('(?<![.\\w])' + x + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|,\\s*' + x + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|&' + x + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + x + ' |\\bfor\\b[^{\\n]*\\b' + x + '\\b[^{\\n]*range', 'g');
    return (fn.match (w) || []).length;
}
function g10kTypepredKind (fn: string, x: string): string | undefined {
    // the var declaration is not matched by the write scan: any match is a second write
    if (g10kTypepredWriteCount (fn, x) !== 0 || (fn.match (new RegExp ('\\bvar ' + x + '\\b', 'g')) || []).length !== 1) {
        return undefined;
    }
    const m = new RegExp ('\\n\\t*var ' + x + ' any = this\\.(SafeList|SafeListN|SafeDict)\\(([^\\n]*)\\)\\n').exec (fn);
    if (!m || (m[2].split ('(').length !== m[2].split (')').length)) {
        return undefined;
    }
    const args = goG14Args (m[2]);
    if (args === undefined) {
        return undefined;
    }
    if (m[1] === 'SafeDict') {
        return ((args.length === 2) || ((args.length === 3) && (args[2] === 'nil' || args[2] === 'map[string]any{}'))) ? 'dict' : undefined;
    }
    return ((args.length === 2) || ((args.length === 3) && (args[2] === 'nil'))) ? 'list' : undefined;
}
function goG14Args (s: string): string[] | undefined {
    const out: string[] = [];
    let depth = 0, cur = '', inStr = false;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inStr) { cur += c; if (c === '\\') { cur += s[++i]; } else if (c === '"') { inStr = false; } continue; }
        if (c === '"') { inStr = true; } else if ('([{'.includes (c)) { depth++; } else if (')]}'.includes (c)) { if (--depth < 0) { return undefined; } }
        if (c === ',' && depth === 0) { out.push (cur.trim ()); cur = ''; } else { cur += c; }
    }
    out.push (cur.trim ());
    return (depth === 0 && !inStr) ? out : undefined;
}
function g10kTypepredFunc (fn: string): string {
    const lines = fn.split ('\n');
    return lines.map ((line) => line.replace (/(!?)(?<![.\w])((?:ccxt\.)?IsArray)\((\w+)\)/g, ((m: string, not: string, _h: string, x: string) => {
        const kind = g10kTypepredKind (fn, x);
        if (kind === 'dict') {
            return not ? 'true' : 'false';
        }
        // a nil test of x already on the line would make the fold a redundant compare
        if ((kind === 'list') && !new RegExp ('\\b' + x + ' [!=]= nil\\b').test (line)) {
            return '(' + x + (not ? ' == nil)' : ' != nil)');
        }
        return m;
    }) as any)).join ('\n');
}
export function g10kTypepredIsArray (content: string): string {
    if (!/\bIsArray\(/.test (content)) {
        return content;
    }
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => g10kTypepredFunc (fn)) as any);
}
function g10kTypepredSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('typepred: ' + m); } };
    const f = (body: string) => g10kTypepredIsArray ('\nfunc (this *X) M(r any) any {\n' + body + '\treturn nil\n}\n');
    ok (f ('\tvar a any = this.SafeList(r, "x")\n\tif IsArray(a) {\n\t}\n').includes ('if (a != nil) {'), 'SafeList');
    ok (f ('\tvar a any = this.SafeList(r, "x")\n\tif !IsArray(a) {\n\t}\n').includes ('if (a == nil) {'), '!SafeList');
    ok (f ('\tvar a any = this.SafeList(r, "x", []any{})\n\tif IsArray(a) {\n\t}\n').includes ('IsArray(a)'), 'defaulted SafeList keeps');
    ok (f ('\tvar a any = this.SafeList(r, "x")\n\ta = r\n\tif IsArray(a) {\n\t}\n').includes ('IsArray(a)'), 'rewritten keeps');
    ok (f ('\tvar a any = this.SafeList(r, "x")\n\tif (a != nil) && IsArray(a) {\n\t}\n').includes ('IsArray(a)'), 'guarded keeps');
    ok (f ('\tvar d any = this.SafeDict(r, "x", map[string]any{})\n\tif ccxt.IsArray(d) {\n\t}\n').includes ('if false {'), 'SafeDict');
    ok (f ('\tvar d any = this.SafeDict(r, "x", r)\n\tif IsArray(d) {\n\t}\n').includes ('IsArray(d)'), 'SafeDict any default keeps');
    return problems;
}

// ===== w8 futures reads: GetValue/SafeValue on a client's futures map -> `futures[key]` =====
// GetValue/SafeValue on a client's futures read the typed client method FutureGet: it answers the *Future
// or an untyped nil (never a typed-nil box), exactly what the helper answered, for any key kind.
function w8ClientFuturesReads (content: string): string {
    if (!/(?:GetValue|SafeValue)\(client\.\((?:ccxt\.)?ClientInterface\)\.GetFutures\(\), /.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    let maskedFunc = '';
    let offsets: number[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; (j <= end) && (j < lines.length); j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
            continue;
        }
        if (lines[k] === '}') {
            start = -1;
            continue;
        }
        if (start < 0) {
            continue;
        }
        const re = /(?<![\w.])((?:ccxt\.GetValue)|(?:this\.SafeValue))\((client\.\((?:ccxt\.)?ClientInterface\)\.GetFutures\(\)), (\w+|"[^"\\\n]*")\)/g;
        let out = '';
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec (lines[k])) !== null) {
            const key = m[3];
            if (masked[k].substring (m.index, m.index + 4) !== lines[k].substring (m.index, m.index + 4)) {
                continue;
            }
            out += lines[k].substring (last, m.index) + m[2].replace ('GetFutures()', 'FutureGet(' + key + ')');
            last = m.index + m[0].length;
        }
        if (last > 0) {
            lines[k] = out + lines[k].substring (last);
            masked[k] = lines[k];
        }
    }
    return lines.join ('\n');
}

// InOp / ObjectKeys on the client's futures and SafeValue on its subscriptions become typed client methods.
function w8ClientTableCalls (content: string): string {
    if (!/(?:(?:InOp|ObjectKeys|SafeValue)\(|= )client\.\((?:ccxt\.)?ClientInterface\)\.(?:GetFutures|SubscriptionsSnapshot)\(\)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const recv = 'client\\.\\((?:ccxt\\.)?ClientInterface\\)\\.';
    const rules: [ RegExp, string ][] = [
        [ new RegExp ('(?<![\\w.])(?:ccxt\\.)?InOp\\((' + recv + ')GetFutures\\(\\), (\\w+)\\)', 'g'), '$1FutureHas($2)' ],
        [ new RegExp ('(var \\w+ any = )(' + recv + ')GetFutures\\(\\)\\[(\\w+|"[^"\\\\\\n]*")\\]$', 'g'), '$1$2FutureGet($3)' ],
        [ new RegExp ('(?<![\\w.])(?:ccxt\\.)?ObjectKeys\\((' + recv + ')GetFutures\\(\\)\\)', 'g'), '$1FutureKeys()' ],
        [ new RegExp ('(?<![\\w.])this\\.SafeValue\\((' + recv + ')SubscriptionsSnapshot\\(\\), (\\w+)\\)', 'g'), '$1SubscriptionSafe($2)' ],
    ];
    for (let k = 0; k < lines.length; k++) {
        for (const [ re, to ] of rules) {
            const line = lines[k];
            lines[k] = line.replace (re, (all: string, ...g: string[]) => {
                const at = g[g.length - 2] as unknown as number;
                return (masked[k].substring (at, at + 4) !== line.substring (at, at + 4)) ? all : all.replace (new RegExp (re.source), to);
            });
        }
        masked[k] = lines[k];
    }
    return lines.join ('\n');
}

function w8ClientFuturesSelfTest (): string[] {
    const problems: string[] = [];
    const f = (body: string) => w8ClientFuturesReads ('func (this *X) H(client any, p any) {\n' + body + '}\n');
    const c = 'client.(ccxt.ClientInterface).GetFutures()';
    if (!f ('\tvar future any = this.SafeValue(' + c + ', "authenticated")\n').includes ('var future any = client.(ccxt.ClientInterface).FutureGet("authenticated")')) {
        problems.push ('w8-futures: literal SafeValue not converted');
    }
    if (!f ('\tvar h string = "a"\n\tvar future any = ccxt.GetValue(' + c + ', h)\n').includes ('= client.(ccxt.ClientInterface).FutureGet(h)')) {
        problems.push ('w8-futures: string local GetValue not converted');
    }
    if (f ('\tvar future any = ccxt.GetValue(' + c + ', p)\n').includes ('GetValue(')) {
        problems.push ('w8-futures: any key reads FutureGet');
    }
    const t = w8ClientTableCalls ('func (this *X) H(client any, p any) {\n\tif ccxt.InOp(' + c + ', p) {\n\t}\n\tvar k []string = ccxt.ObjectKeys(' + c + ')\n\tvar a any = this.SafeValue(client.(ccxt.ClientInterface).SubscriptionsSnapshot(), p)\n}\n');
    if (!t.includes ('if client.(ccxt.ClientInterface).FutureHas(p) {') || !t.includes ('= client.(ccxt.ClientInterface).FutureKeys()') || !t.includes ('= client.(ccxt.ClientInterface).SubscriptionSafe(p)')) {
        problems.push ('w8-tables: InOp/ObjectKeys/SafeValue not converted: ' + t);
    }
    if (!w8ClientTableCalls ('\tvar a any = this.SafeValue(client.(ccxt.ClientInterface).SubscriptionsSnapshot(), p, 1)\n').includes ('SafeValue(')) {
        problems.push ('w8-tables: SafeValue with a default keeps the helper');
    }
    return problems;
}

// ===== W8-futures-pair: `if InOp(F, a) || InOp(F, b) {` on string keys -> two comma-ok reads =====
// GetFutures() is a map[string]any (nil reads ok=false like the helper); both keys must be string locals
// declared once before the line. Reads go ahead of the if, they have no side effects.
function w8FuturesPairInOp (content: string): string {
    const recvRe = 'client\\.\\((?:ccxt\\.)?ClientInterface\\)\\.GetFutures\\(\\)';
    const pairRe = new RegExp ('^(\\s*)if \\(?(?:ccxt\\.)?InOp\\((' + recvRe + '), (\\w+)\\)\\)? \\|\\| \\(?(?:ccxt\\.)?InOp\\(\\2, (\\w+)\\)\\)? \\{$');
    if (!/\bInOp\(client\.\((?:ccxt\.)?ClientInterface\)\.GetFutures\(\), \w+\)\)? \|\| /.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const out: string[] = [];
    let start = -1;
    let maskedFunc = '';
    let offsets: number[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; (j <= end) && (j < lines.length); j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
        } else if (lines[k] === '}') {
            start = -1;
        }
        const m = ((start >= 0) && (k > start) && (lines[k] === masked[k])) ? pairRe.exec (lines[k]) : null;
        const stringKey = (name: string): boolean => {
            const decl = goAccessSingleDeclaration (maskedFunc, lines[start], name);
            return (decl !== undefined) && (decl.type === 'string') && ((decl.index === undefined) || (decl.index < offsets[k - start]));
        };
        if ((m === null) || /\b(?:hasFuture|hasSymbolFuture)\b/.test (maskedFunc) || !stringKey (m[3]) || !stringKey (m[4])) {
            out.push (lines[k]);
            continue;
        }
        out.push (m[1] + '_, hasFuture := ' + m[2] + '[' + m[3] + ']');
        out.push (m[1] + '_, hasSymbolFuture := ' + m[2] + '[' + m[4] + ']');
        out.push (m[1] + 'if hasFuture || hasSymbolFuture {');
    }
    return out.join ('\n');
}

function w8FuturesPairSelfTest (): string[] {
    const problems: string[] = [];
    const c = 'client.(ccxt.ClientInterface).GetFutures()';
    const f = (body: string) => w8FuturesPairInOp ('func (this *X) H(client any, p any) {\n' + body + '}\n');
    const head = '\tvar a string = \"x\"\n\tvar b string = \"y\"\n';
    const hit = f (head + '\tif (ccxt.InOp(' + c + ', a)) || (ccxt.InOp(' + c + ', b)) {\n\t}\n');
    if (!hit.includes ('\t_, hasFuture := ' + c + '[a]\n\t_, hasSymbolFuture := ' + c + '[b]\n\tif hasFuture || hasSymbolFuture {')) {
        problems.push ('w8-futures-pair: string keys not converted: ' + hit);
    }
    if (!f ('\tvar a string = \"x\"\n\tif (ccxt.InOp(' + c + ', a)) || (ccxt.InOp(' + c + ', p)) {\n\t}\n').includes ('InOp(')) {
        problems.push ('w8-futures-pair: any key must keep InOp');
    }
    if (!f (head + '\tif (ccxt.InOp(' + c + ', a)) || (ccxt.InOp(' + c + ', \"z\")) {\n\t}\n').includes ('InOp(')) {
        problems.push ('w8-futures-pair: literal key keeps InOp');
    }
    return problems;
}

// ===== G10K-inop: InOp on a client's map[string]any accessor -> `if _, ok := m[k]; ok {` =====
// GetFutures()/GetRejections() are statically map[string]any: a nil map reads ok=false like the helper.
// Only a lone InOp in an if condition with a string key; any other shape keeps the helper.
function g10kInopClientMaps (content: string): string {
    if (!/InOp\(client\.\((?:ccxt\.)?ClientInterface\)\.Get(?:Futures|Rejections)\(\)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    let maskedFunc = '';
    let offsets: number[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; (j <= end) && (j < lines.length); j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
            continue;
        }
        if (lines[k] === '}') {
            start = -1;
            continue;
        }
        if ((start < 0) || /\bok\b/.test (maskedFunc)) {
            continue;
        }
        const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (masked[k]);
        const calls = [ ...masked[k].matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
        if ((cond === null) || (calls.length !== 1)) {
            continue;
        }
        const at = calls[0].index;
        const call = /^(?:ccxt\.)?InOp\((client\.\((?:ccxt\.)?ClientInterface\)\.Get(?:Futures|Rejections)\(\)), (\w+|"[^"\\\n]*")\)/.exec (lines[k].substring (at));
        if ((call === null) || (goMapWriteGroupEnd (masked[k], at + call[0].indexOf ('(')) !== at + call[0].length)) {
            continue;
        }
        const [ all, recv, key ] = call;
        if (!key.startsWith ('"')) {
            const decl = goAccessSingleDeclaration (maskedFunc, lines[start], key);
            if ((decl === undefined) || (decl.type !== 'string') || ((decl.index !== undefined) && (decl.index >= offsets[k - start]))) {
                continue;
            }
        }
        let rest = lines[k].substring (cond[1].length, at) + 'ok' + lines[k].substring (at + all.length);
        rest = rest.replace (/(^|[^\w)\]])\(ok\)/g, '$1ok');
        lines[k] = cond[1] + '_, ok := ' + recv + '[' + key + ']; ' + rest;
        masked[k] = lines[k];
    }
    return lines.join ('\n');
}

function g10kInopSelfTest (): string[] {
    const problems: string[] = [];
    const f = (body: string) => g10kInopClientMaps ('func (this *X) H(client any, p any) {\n' + body + '}\n');
    const hit = f ('\tvar h string = \"a\"\n\tif !(ccxt.InOp(client.(ccxt.ClientInterface).GetFutures(), h)) {\n\t}\n');
    if (!hit.includes ('\tif _, ok := client.(ccxt.ClientInterface).GetFutures()[h]; !ok {')) {
        problems.push ('g10k-inop: string key not converted: ' + hit);
    }
    if (!f ('\tif ccxt.InOp(client.(ccxt.ClientInterface).GetFutures(), p) {\n\t}\n').includes ('InOp(')) {
        problems.push ('g10k-inop: any key must keep InOp');
    }    if (!f ('\tvar h string = \"a\"\n\tif ccxt.InOp(client.(ccxt.ClientInterface).GetFutures(), h) || ccxt.InOp(client.(ccxt.ClientInterface).GetFutures(), \"b\") {\n\t}\n').includes ('InOp(')) {
        problems.push ('g10k-inop: two calls must keep InOp');
    }
    return problems;
}

// ===== G10K-arr: native delete for Remove on typed receivers =====
// Remove(R, k) where R is a *sync.Map base field -> R.Delete(k), or a
// map[string]any (this.Clients, GetRejections()) -> delete(R, k); k must be a proven non-nil string.
function g10kArrReceiverKind (recv: string): string | undefined {
    if (/^this\.(?:Orderbooks|Tickers|Bidsasks|FundingRates|Ohlcvs)$/.test (recv)) {
        return 'sync';
    }
    if ((recv === 'this.Clients') || (recv === 'this.Options') || /^\w+\.\((?:ccxt\.)?ClientInterface\)\.GetRejections\(\)$/.test (recv)) {
        return 'map';
    }
    return undefined;
}

// the Go text of a non-nil string key, or undefined (the helper panics on a nil/non-string key)
function g10kArrKeyText (key: string, lines: string[], start: number, maskedFunc: string, offset: number): string | undefined {
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (key)) {
        return key;
    }
    const decl = goAccessSingleDeclaration (maskedFunc, lines[start], key);
    if ((decl === undefined) || ((decl.index !== undefined) && (decl.index >= offset))) {
        return undefined;
    }
    if (decl.type === 'string') {
        return key;
    }
    if ((decl.type !== '*string') || (decl.index === undefined)) {
        return undefined;
    }
    // SafeString* with a literal default returns &v or &default: never nil, if never re-written
    const n = goAccessEscape (key);
    if (new RegExp ('(?:^|[^\\w.])' + n + '\\s*=[^=]|&' + n + '\\b', 'm').test (maskedFunc.replace (new RegExp ('\\bvar ' + n + ' \\*string ='), ''))) {
        return undefined;
    }
    const declLine = lines[start + maskedFunc.substring (0, decl.index).split ('\n').length - 1];
    return /\bvar \w+ \*string = this\.SafeString(?:Lower|Upper)?\((?:[^(),]|\([^()]*\))+, (?:[^(),]|\([^()]*\))+, "(?:[^"\\\n]|\\.)*"\)\s*$/.test (declLine) ? '*' + key : undefined;
}

function g10kArrNativeRemove (content: string): string {
    if (!/\bRemove\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    let maskedFunc = '';
    let offsets: number[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; (j <= end) && (j < lines.length); j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
            continue;
        }
        if (lines[k] === '}') {
            start = -1;
            continue;
        }
        if (start < 0) {
            continue;
        }
        const rm = /^(\s*)(?:ccxt\.)?Remove\((\w+\.\((?:ccxt\.)?ClientInterface\)\.Get\w+\(\)|this\.\w+), (\w+|"(?:[^"\\\n]|\\.)*")\)(\s*)$/.exec (lines[k]);
        if ((rm === null) || !/^\s*(?:ccxt\.)?Remove\(/.test (masked[k])) {
            continue;
        }
        const kind = g10kArrReceiverKind (rm[2]);
        const key = (kind === undefined) ? undefined : g10kArrKeyText (rm[3], lines, start, maskedFunc, offsets[k - start]);
        if (key === undefined) {
            continue;
        }
        lines[k] = rm[1] + ((kind === 'sync') ? rm[2] + '.Delete(' + key + ')' : 'delete(' + rm[2] + ', ' + key + ')') + rm[4];
    }
    return lines.join ('\n');
}

function g10kArrSelfTest (): string[] {
    const problems: string[] = [];
    const src = [
        'func (this *X) A(client any, symbol string, p any) {',
        '\tvar h *string = this.SafeString(p, "k", "")',
        '\tvar n *string = this.SafeString(p, "k")',
        '\tvar g *string = this.SafeString(p, "k", "")',
        '\tg = this.SafeString(p, "j")',
        '\tccxt.Remove(client.(ccxt.ClientInterface).GetSubscriptions(), symbol)',
        '\tccxt.Remove(this.Tickers, h)',
        '\tccxt.Remove(this.Tickers, n)',
        '\tccxt.Remove(this.Tickers, g)',
        '\tccxt.Remove(this.Clients, "u")',
        '\tccxt.Remove(this.Trades, symbol)',
        '\tccxt.Remove(this.Tickers, p)',
        '}',
    ].join ('\n');
    const out = g10kArrNativeRemove (src);
    const want = [ 'ccxt.Remove(client.(ccxt.ClientInterface).GetSubscriptions(), symbol)', 'this.Tickers.Delete(*h)', 'delete(this.Clients, "u")',
        'ccxt.Remove(this.Tickers, n)', 'ccxt.Remove(this.Tickers, g)', 'ccxt.Remove(this.Trades, symbol)', 'ccxt.Remove(this.Tickers, p)' ];
    for (const w of want) {
        if (out.indexOf (w) < 0) {
            problems.push ('g10k-arr: missing ' + w);
        }
    }
    return problems;
}

// ===== G10K-gv-list: bare `x := GetValue(s, N)` on a `[]any` local -> native element read =====
// Every read of x is a whole argument a helper derefScalars at entry, so GetValue's own deref is
// redundant; only a two-slot pair producer with N 0/1 is rewritten, anything else keeps GetValue.
function gvListDerefSlots (): Map<string, number[]> {
    const m = new Map<string, number[]> ();
    for (const f of [ 'Add', 'Subtract', 'Multiply', 'Divide', 'Mod', 'IsEqual', 'IsGreaterThan', 'IsLessThan', 'IsGreaterThanOrEqual', 'IsLessThanOrEqual', 'InOp', 'GetIndexOf', 'StartsWith', 'EndsWith', 'Split', 'Join', 'GetValue' ]) {
        m.set (f, [ 0, 1 ]);
    }
    for (const f of [ 'EvalTruthy', 'IsString', 'IsArray', 'IsBool', 'IsNumber', 'IsInteger', 'IsDictionary', 'Replace', 'Slice', 'Trim', 'ToString', 'ToLower', 'ToUpper', 'ParseInt', 'ParseFloat', 'ToFloat64', 'MathFloor', 'MathCeil', 'MathRound', 'MathAbs', 'GetArrayLength', 'GetLength', 'ObjectKeys', 'ObjectValues', 'JsonStringify', 'ListTyped', 'MapTyped', 'SafeStringPtr', 'SafeBoolPtr' ]) {
        m.set (f, [ 0 ]);
    }
    m.set ('AddElementToObject', [ 1, 2 ]);
    return m;
}

// the occurrence of a name at `at` is the whole argument of a deref-at-entry slot on its line
function gvListInDerefSlot (line: string, at: number, len: number, methods: string[]): boolean {
    const after = line.substring (at + len).trimStart ();
    if (!after.startsWith (',') && !after.startsWith (')')) {
        return false;
    }
    let depth = 0;
    let idx = 0;
    for (let i = at - 1; i >= 0; i--) {
        const c = line[i];
        if (c === ')' || c === ']' || c === '}') {
            depth++;
        } else if (c === '(' || c === '[' || c === '{') {
            if (depth > 0) {
                depth--;
                continue;
            }
            if (c !== '(') {
                return false;
            }
            const head = /(?:(?<![\w.])(?:ccxt\.)?(\w+)|\bthis\.(\w+))$/.exec (line.substring (0, i));
            if (head === null) {
                return false;
            }
            if (head[2] !== undefined) {
                return (idx === 0) && methods.includes (head[2]);
            }
            return (gvListDerefSlots ().get (head[1]) ?? []).includes (idx);
        } else if ((c === ',') && (depth === 0)) {
            idx++;
        }
    }
    return false;
}

// every occurrence of x in the function is a write target (`x :=`/`x =` statement, `var x any`, `_ = x`) or a deref-slot argument
function gvListDerefOnlyLocal (masked: string[], start: number, end: number, name: string, methods: string[]): boolean {
    const n = goAccessEscape (name);
    const occ = new RegExp ('(?<![\\w.])' + n + '(?!\\w)', 'g');
    for (let k = start + 1; k < end; k++) {
        const line = masked[k];
        if (line.indexOf (name) < 0) {
            continue;
        }
        if (new RegExp ('&\\s*' + n + '\\b|\\bfunc\\b[^{]*[(,]\\s*' + n + '\\b').test (line)) {
            return false;
        }
        if (new RegExp ('^\\s*var ' + n + ' any(?: = |$)').test (line) || new RegExp ('^\\s*_ = ' + n + '\\s*$').test (line)) {
            if (line.indexOf (name) !== line.lastIndexOf (name)) {
                return false;
            }
            continue;
        }
        const target = new RegExp ('^(\\s*)' + n + ' :?= ').exec (line);
        let m: RegExpExecArray | null;
        occ.lastIndex = 0;
        while ((m = occ.exec (line)) !== null) {
            if ((target !== null) && (m.index === target[1].length)) {
                continue;
            }
            if (!gvListInDerefSlot (line, m.index, name.length, methods)) {
                return false;
            }
        }
    }
    return true;
}

function nativeDerefOnlyListReads (content: string): string {
    if (!/GetValue\(\w+, \d+\)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const joined = masked.join ('\n');
    const methods = goG05DerefMethods ().filter ((m: string) => !new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + m + '\\(').test (joined));
    const overridden = GO_TUPLE_PAIR_PRODUCERS.filter ((m: string) => new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + m + '\\(').test (joined));
    const { 'blocks': blocks } = goTextBlocks (masked);
    const bare = /^(\s*)(\w+) (:?=) (?:ccxt\.)?GetValue\((\w+), (\d+)\)\s*$/;
    for (const fn of blocks.filter ((b: any) => (b.depth === 1) && masked[b.open].startsWith ('func '))) {
        const maskedFunc = masked.slice (fn.open + 1, fn.close + 1).join ('\n');
        for (let k = fn.open + 1; k < fn.close; k++) {
            const m = bare.exec (masked[k]);
            if ((m === null) || (lines[k] !== masked[k])) {
                continue;
            }
            const [ , indent, name, , holder, slot ] = m;
            const decl = goAccessSingleDeclaration (maskedFunc, masked[fn.open], holder);
            if ((decl === undefined) || (decl.type !== '[]any') || (decl.line === undefined)) {
                continue;
            }
            let declLine = -1;
            let written = false;
            for (let j = fn.open + 1; j < fn.close; j++) {
                if (new RegExp ('^\\s*var ' + holder + ' \\[\\]any = ').test (masked[j])) {
                    declLine = j;
                } else if (goTextWritesName (masked[j], holder) || new RegExp ('\\b' + holder + '\\s*=\\s*append\\(').test (masked[j])) {
                    written = true;
                }
            }
            const declBlock = (declLine < 0) ? undefined : goTextEnclosingBlock (blocks, declLine);
            if (written || (declLine < 0) || (declLine >= k) || (declBlock === undefined) || !((declBlock.open < k) && (k <= declBlock.close))) {
                continue;
            }
            if (!gvListDerefOnlyLocal (masked, fn.open, fn.close, name, methods)) {
                continue;
            }
            const producer = /^\s*var \w+ \[\]any = this\.(\w+)\(/.exec (decl.line);
            const pair = (producer !== null) && GO_TUPLE_PAIR_PRODUCERS.includes (producer[1]) && !overridden.includes (producer[1]) && (slot === '0' || slot === '1');
            if (pair) {
                lines[k] = indent + name + ' ' + m[3] + ' ' + holder + '[' + slot + ']';
            }
        }
    }
    return lines.join ('\n');
}

function gvListSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('gv-list: ' + msg); } };
    const f = (body: string) => nativeDerefOnlyListReads ('func (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
    const pairDecl = '\tvar h []any = this.HandleOptionBoolAndParamsNullable(p, "m", "k")\n';
    const r1 = f (pairDecl + '\tx := GetValue(h, 0)\n\tif IsEqual(x, true) {\n\t}\n\tvar s *string = this.SafeString(x, "k")\n\t_ = s\n');
    ok (r1.indexOf ('\tx := h[0]\n') >= 0, 'pair slot read native: ' + r1);
    const r2 = f ('\tvar h []any = ListTyped(p)\n\tvar x any = nil\n\tx = GetValue(h, 2)\n\tif EvalTruthy(x) && IsLessThan(1, x) {\n\t}\n');
    ok (r2.indexOf ('x = GetValue(h, 2)') >= 0, 'unknown length keeps GetValue: ' + r2);
    const keep = [
        pairDecl + '\tx := GetValue(h, 0)\n\tif x == true {\n\t}\n',
        pairDecl + '\tx := GetValue(h, 0)\n\tvar m any = map[string]any{"k": x}\n',
        pairDecl + '\tx := GetValue(h, 0)\n\tthis.Foo(x)\n',
        pairDecl + '\tx := GetValue(h, 0)\n\tvar y any = Foo(IsEqual(x, 1), x)\n',
        pairDecl + '\th = nil\n\tx := GetValue(h, 0)\n\t_ = IsEqual(x, 1)\n',
        pairDecl + '\th[0] = p\n\tx := GetValue(h, 0)\n\t_ = IsEqual(x, 1)\n',
        pairDecl + '\tx := GetValue(h, 0)\n\tq := &x\n\t_ = IsEqual(q, 1)\n',
        pairDecl + '\tx := GetValue(h, 0)\n\treturn x\n',
        '\tx := GetValue(h, 0)\n\tvar h []any = ListTyped(p)\n\t_ = IsEqual(x, 1)\n',
        '\tvar h any = p\n\tx := GetValue(h, 0)\n\t_ = IsEqual(x, 1)\n',
        pairDecl + '\tx := GetValue(h, 0)\n\tfn := func(x any) any { return x }\n\t_ = IsEqual(x, fn)\n',
        pairDecl + '\tx := GetValue(h, 0)\n\t_ = this.SafeString(p, x)\n',
    ];
    keep.forEach ((b: string, i: number) => ok (f (b).indexOf ('GetValue(h, 0)') >= 0, 'negative ' + i));
    const over = 'func (this *X) SafeString(a any, b any) *string {\n\treturn nil\n}\n';
    ok (nativeDerefOnlyListReads (over + 'func (this *X) f(p any) any {\n' + pairDecl + '\tx := GetValue(h, 0)\n\t_ = this.SafeString(x, "k")\n\treturn nil\n}\n').indexOf ('GetValue(h, 0)') >= 0, 'overridden method keeps helper');
    ok (nativeDerefOnlyListReads (r2) === r2, 'idempotent');
    return problems;
}

// ===== G10K-misc: drop no-op SetDefaults, fold literal ParseInt/StringArg/EvalTruthy =====
// setDefaults only writes fields carrying a `default:"…"` tag, so a struct without tags makes it a no-op.
function g10kMiscSetDefaults (content: string): string {
    const struct = /\ntype \w+ struct \{([^}]*)\n\}/.exec (content);
    if ((struct === null) || struct[1].includes ('`') || ((content.match (/^type \w+ struct \{/gm) || []).length !== 1)) {
        return content;
    }
    const out = content.replace (/(\n\tp := &\w+\{\}\n(?:\t[^\n]*\n)*?)\t(?:ccxt\.)?SetDefaults\(p\)\n(\treturn p\n\})/g, '$1$2');
    // keep the call when it was the file's only use of the imported ccxt package (unused import)
    return (content.includes ('ccxt.SetDefaults(p)') && !/(?<![\w.])ccxt\./.test (out)) ? content : out;
}

// ParseInt of a decimal literal is that int64; StringArg of a declared `string` is the value itself;
// SafeBool with a bool-literal default never returns nil, so EvalTruthy is its deref.
function g10kMiscFunc (fn: string): string {
    fn = fn.replace (/(?<![\w.])(?:ccxt\.)?ParseInt\("(\d{1,18})"\)/g, (_m: string, d: string) => 'int64(' + BigInt (d).toString () + ')');
    fn = fn.replace (/(?<![\w.])(?:ccxt\.)?StringArg\((\w+)\)/g, (m: string, x: string) => ((goG14DeclaredType (fn, x) === 'string') ? x : m));
    // ClientInterface.GetUrl() is declared `string` (go/v4/exchange_client.go), so StringArg of it is the value itself
    fn = fn.replace (/(?<![\w.])(?:ccxt\.)?StringArg\((client\.\((?:ccxt\.)?ClientInterface\)\.GetUrl\(\))\)/g, '$1');
    fn = fn.replace (/(?<![\w.])(?:ccxt\.)?EvalTruthy\(this\.SafeBool\(((?:[^()"]|"(?:[^"\\]|\\.)*"|\((?:[^()"]|"(?:[^"\\]|\\.)*")*\))*), (true|false)\)\)/g,
        (_m: string, args: string, def: string) => '*this.SafeBool(' + args + ', ' + def + ')');
    return fn;
}

export function g10kMiscNative (content: string): string {
    return g10kMiscSetDefaults (content).replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => g10kMiscFunc (fn)) as any);
}

function g10kMiscSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('g10k-misc: ' + m); } };
    const ctor = (fields: string) => 'package p\n\ntype X struct {\n\t*ccxt.X\n' + fields + '}\n\nfunc newX() *X {\n\tp := &X{}\n\tbase := &ccxt.X{}\n\tp.base = base\n\tccxt.SetDefaults(p)\n\treturn p\n}\n';
    ok (!g10kMiscNative (ctor ('\tbase *ccxt.X\n')).includes ('SetDefaults'), 'untagged struct drops SetDefaults');
    const onlyUse = 'package p\n\nimport (\n\tccxt "github.com/ccxt/ccxt/go/v4"\n)\n\ntype X struct {\n\t*Y\n}\n\nfunc newX() *X {\n\tp := &X{}\n\tccxt.SetDefaults(p)\n\treturn p\n}\n';
    ok (g10kMiscNative (onlyUse).includes ('ccxt.SetDefaults(p)'), 'sole ccxt use keeps SetDefaults');
    ok (g10kMiscNative (ctor ('\tA bool `default:"true"`\n')).includes ('ccxt.SetDefaults(p)'), 'tagged struct keeps SetDefaults');
    const f = (sig: string, body: string) => g10kMiscNative ('\nfunc (this *X) M(' + sig + ') any {\n' + body + '\treturn nil\n}\n');
    ok (f ('', '\tm := map[string]any{\"a\": ParseInt(\"08\")}\n').includes ('"a": int64(8)}'), 'literal ParseInt');
    ok (f ('', '\t_ = ParseInt(\"1.5\")\n\t_ = ParseInt(\"-1\")\n').includes ('ParseInt("1.5")'), 'non-integer literal keeps ParseInt');
    ok (f ('', '\t_ = ParseInt(\"-1\")\n').includes ('ParseInt("-1")'), 'signed literal keeps ParseInt');
    ok (f ('side string', '\tthis.F(ccxt.StringArg(side))\n').includes ('this.F(side)'), 'string StringArg');
    ok (f ('side any', '\tthis.F(ccxt.StringArg(side))\n').includes ('StringArg(side)'), 'any StringArg kept');
    ok (f ('client any', '\tthis.F(ccxt.StringArg(client.(ccxt.ClientInterface).GetUrl()))\n').includes ('this.F(client.(ccxt.ClientInterface).GetUrl())'), 'GetUrl StringArg');
    ok (f ('client any', '\tthis.F(ccxt.StringArg(client.(ccxt.ClientInterface).GetName()))\n').includes ('StringArg(client.'), 'other client call kept');
    ok (f ('side string', '\tside := 1\n\tthis.F(StringArg(side))\n').includes ('StringArg(side)'), 'shadowed StringArg kept');
    ok (f ('', '\tif EvalTruthy(this.SafeBool(this.SafeDict(m, \"info\"), \"hip3\", false)) {\n\t}\n').includes ('if *this.SafeBool(this.SafeDict(m, "info"), "hip3", false) {'), 'defaulted SafeBool');
    ok (f ('', '\tif EvalTruthy(this.SafeBool(m, \"k\")) {\n\t}\n').includes ('EvalTruthy(this.SafeBool(m, "k"))'), 'nullable SafeBool kept');
    ok (f ('', '\tif EvalTruthy(this.SafeBool(m, \"k\", d)) {\n\t}\n').includes ('EvalTruthy('), 'non-literal default kept');
    return problems;
}

// ===== G10K-err-a-rt: ErrorParents map for hierarchy-aware IsInstance =====
// Emits `var ErrorParents = map[ErrorType]ErrorType{...}` (gofmt-aligned); top-level classes map to "BaseError".
function g10kErrARtErrorParentsDecl (root: any): string {
    const pairs: [string, string][] = [];
    const walk = (map: any, parent: string) => {
        for (const key in map) {
            pairs.push ([ key, parent ]);
            walk (map[key], key);
        }
    };
    walk (root, 'BaseError');
    const keyColumn = Math.max (...pairs.map (([ name ]) => name.length + 3)) + 1;
    const lines = pairs.map (([ name, parent ]) => `\t${(JSON.stringify (name) + ':').padEnd (keyColumn)}${JSON.stringify (parent)},`);
    return '\nvar ErrorParents = map[ErrorType]ErrorType{\n' + lines.join ('\n') + '\n}\n';
}

// hx4 G05
// ===== hx4 G05: drop MapTyped/ListTyped around callees already printed with the target type, DerefScalar on `string` locals =====
// MapTyped(m) on a map[string]any (ListTyped(l) on a []any) returns m itself, nil map included; derefScalar
// of a `string` hands back the same string. Proof is the file's final text: the callee's signature on the
// enclosing receiver (Go methods dispatch statically) or a hand-written struct boundary; the local's sole declaration.
function hx4G05CloseParen (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '`' || c === "'") {
            i = goSkipLiteralText (text, i);
        } else if (c === '(') {
            depth += 1;
        } else if (c === ')') {
            depth -= 1;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

// return type text of `func (this *<recv>) <name>(...) <T> {` in this file, undefined when absent or ambiguous
function hx4G05MethodReturnType (content: string, recv: string, name: string): string | undefined {
    const re = new RegExp ('^func \\(this \\*' + recv + '\\) ' + name + '\\(', 'gm');
    const found: string[] = [];
    for (let m = re.exec (content); m !== null; m = re.exec (content)) {
        const close = hx4G05CloseParen (content, m.index + m[0].length - 1);
        const eol = content.indexOf ('\n', close);
        const tail = content.substring (close + 1, eol).trim ();
        found.push (tail.endsWith ('{') ? tail.slice (0, -1).trim () : '');
    }
    return (found.length === 1) ? found[0] : undefined;
}

// the printed type the callee text of a whole wrapped call returns, undefined when unproven
function hx4G05CalleeType (content: string, recv: string | undefined, inner: string): string | undefined {
    const free = /^(?:ccxt\.)?(TradeToMap|TickerToMap|OrderToMap)\($/.exec (inner);
    if (free !== null) {
        return 'map[string]any'; // hand-written go/v4/exchange_struct_returns.go boundaries
    }
    const method = /^this\.([A-Z]\w*)\($/.exec (inner);
    if ((method === null) || (recv === undefined)) {
        return undefined;
    }
    return hx4G05MethodReturnType (content, recv, method[1]);
}

// one enclosing-function scan: `name` has exactly one binding there, `var name string = ...` or a `name string` parameter
function hx4G05IsStringLocal (body: string, signature: string, name: string): boolean {
    const n = name.replace (/[^\w]/g, '');
    if (n !== name) {
        return false;
    }
    const decls = body.match (new RegExp ('\\bvar ' + n + '\\b[^\\n=]*', 'g')) || [];
    const params = signature.match (new RegExp ('[(,] *' + n + ' ([^,)]+)', 'g')) || [];
    const rebinds = body.match (new RegExp ('(\\b' + n + '\\s*(,[^\\n=]*)?:=|,\\s*' + n + '\\s*:=|func\\([^)]*\\b' + n + ' )', 'g')) || [];
    if (rebinds.length > 0) {
        return false;
    }
    if ((decls.length === 1) && (params.length === 0)) {
        return /^var \w+ string$/.test (decls[0].trim ());
    }
    if ((decls.length === 0) && (params.length === 1)) {
        return /^[(,] *\w+ string$/.test (params[0].trim ());
    }
    return false;
}

export function hx4G05DropRedundantTyped (content: string): string {
    const funcs: { start: number, recv: string | undefined, signature: string }[] = [];
    const fre = /^func (?:\(this \*(\w+)\) )?[^\n]*$/gm;
    for (let m = fre.exec (content); m !== null; m = fre.exec (content)) {
        funcs.push ({ start: m.index, recv: m[1], signature: m[0] });
    }
    const enclosing = (at: number) => {
        let found: any = undefined;
        for (const f of funcs) {
            if (f.start > at) {
                break;
            }
            found = f;
        }
        return found;
    };
    const bodyOf = (f: any) => {
        const next = funcs.find ((g) => g.start > f.start);
        return content.substring (f.start, (next === undefined) ? content.length : next.start);
    };
    let out = '';
    let cursor = 0;
    const wrapper = /(?<![\w.])(?:ccxt\.)?(MapTyped|ListTyped|DerefScalar)\(/g;
    for (let m = wrapper.exec (content); m !== null; m = wrapper.exec (content)) {
        if (m.index < cursor) {
            continue;
        }
        const lineStart = content.lastIndexOf ('\n', m.index) + 1;
        if (content.substring (lineStart, m.index).includes ('//')) {
            continue;
        }
        const open = m.index + m[0].length - 1;
        const end = hx4G05CloseParen (content, open);
        if (end < 0) {
            continue;
        }
        const inner = content.substring (open + 1, end);
        const f = enclosing (m.index);
        if (f === undefined) {
            continue;
        }
        let native = false;
        if (m[1] === 'DerefScalar') {
            native = /^[a-z_]\w*$/.test (inner) && hx4G05IsStringLocal (bodyOf (f), f.signature, inner);
        } else {
            const innerOpen = inner.indexOf ('(');
            if ((innerOpen > 0) && (hx4G05CloseParen (inner, innerOpen) === inner.length - 1)) {
                const want = (m[1] === 'MapTyped') ? 'map[string]any' : '[]any';
                native = hx4G05CalleeType (content, f.recv, inner.substring (0, innerOpen + 1)) === want;
            }
        }
        if (!native) {
            continue;
        }
        out += content.substring (cursor, m.index) + inner;
        cursor = end + 1;
    }
    return out + content.substring (cursor);
}

function hx4G05SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx4-G05: ' + msg); } };
    const file = (body: string, extra = '') => 'package ccxt\n\nfunc (this *X) M(a any) map[string]any {\n\treturn nil\n}\n\nfunc (this *X) L(a any) []any {\n\treturn nil\n}\n\nfunc (this *X) A(a any) any {\n\treturn nil\n}\n' + extra + '\nfunc (this *X) F(p any, s string) any {\n' + body + '\treturn nil\n}\n';
    const run = (body: string, extra = '') => hx4G05DropRedundantTyped (file (body, extra));
    ok (run ('\tvar r map[string]any = MapTyped(this.M(GetValue(p, "a")))\n').includes ('\tvar r map[string]any = this.M(GetValue(p, "a"))\n'), 'map method unwrapped');
    ok (run ('\tvar r []any = ccxt.ListTyped(this.L(p))\n').includes ('\tvar r []any = this.L(p)\n'), 'list method unwrapped');
    ok (run ('\tvar r map[string]any = MapTyped(TradeToMap(this.ParseTrade(p)))\n').includes ('= TradeToMap(this.ParseTrade(p))\n'), 'struct boundary unwrapped');
    ok (run ('\tvar r map[string]any = MapTyped(this.A(p))\n').includes ('MapTyped(this.A(p))'), 'any-returning method kept');
    ok (run ('\tvar r []any = ListTyped(this.M(p))\n').includes ('ListTyped(this.M(p))'), 'family mismatch kept');
    ok (run ('\tvar r map[string]any = MapTyped(this.Q(p))\n').includes ('MapTyped(this.Q(p))'), 'method of another file kept');
    ok (run ('\tvar r map[string]any = MapTyped(this.M(p)[0])\n').includes ('MapTyped(this.M(p)[0])'), 'partial call kept');
    ok (run ('\tvar r map[string]any = MapTyped(this.M(p))\n', '\nfunc (this *Y) G() any {\n\treturn MapTyped(this.M(nil))\n}\n').includes ('return MapTyped(this.M(nil))'), 'other receiver kept');
    ok (run ('\tvar r map[string]any = MapTyped(this.Exchange.M(p))\n').includes ('MapTyped(this.Exchange.M(p))'), 'embedded receiver kept');
    ok (run ('\tvar v string = "a"\n\tp = DerefScalar(v)\n').includes ('\tp = v\n'), 'string local unwrapped');
    ok (run ('\tp = DerefScalar(s)\n').includes ('\tp = s\n'), 'string param unwrapped');
    ok (run ('\tvar v *string = nil\n\tp = DerefScalar(v)\n').includes ('DerefScalar(v)'), 'pointer local kept');
    ok (run ('\tvar v string = "a"\n\tif true {\n\t\tvar v any = p\n\t\t_ = v\n\t}\n\tp = DerefScalar(v)\n').includes ('DerefScalar(v)'), 'shadowed local kept');
    ok (run ('\tvar v string = "a"\n\tfor _, v := range []any{} {\n\t\tp = DerefScalar(v)\n\t}\n').includes ('DerefScalar(v)'), 'range rebind kept');
    ok (run ('\tp = DerefScalar(p)\n').includes ('DerefScalar(p)'), 'any param kept');
    ok (run ('\tp = DerefScalar(this.SafeString(p, "a"))\n').includes ('DerefScalar(this.SafeString'), 'pointer accessor kept');
    ok (run ('\t// MapTyped(this.M(p))\n').includes ('// MapTyped(this.M(p))'), 'comment untouched');
    return problems;
}

// hx4 G07
// InOp(this.<F>, k) on a hand-written map[string]any BaseExchange field (go/v4/exchange.go) ->
// `if _, ok := this.<F>[k]; ...`: a nil map reads ok=false like the helper; lone call in an if header,
// literal or declared-string key, `ok` unused in the func. Any other shape keeps the helper.
function hx4G07FieldInOp (content: string): string {
    const fieldRx = /(?<![\w.])(?:ccxt\.)?InOp\(this\.(?:Urls|HttpExceptions|Timeframes|Has|Features|Clients), /;
    if (!fieldRx.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    let maskedFunc = '';
    let offsets: number[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = lines[k].startsWith ('func (this *') ? k : -1;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; (j <= end) && (j < lines.length); j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
            continue;
        }
        if (lines[k] === '}') {
            start = -1;
            continue;
        }
        if ((start < 0) || /\bok\b/.test (maskedFunc)) {
            continue;
        }
        const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (masked[k]);
        const calls = [ ...masked[k].matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
        if ((cond === null) || (calls.length !== 1)) {
            continue;
        }
        const at = calls[0].index;
        const call = /^(?:ccxt\.)?InOp\((this\.(?:Urls|HttpExceptions|Timeframes|Has|Features|Clients)), (\w+|"[^"\\\n]*")\)/.exec (lines[k].substring (at));
        if ((call === null) || (goMapWriteGroupEnd (masked[k], at + call[0].indexOf ('(')) !== at + call[0].length)) {
            continue;
        }
        const [ all, recv, key ] = call;
        if (!key.startsWith ('"')) {
            const decl = goAccessSingleDeclaration (maskedFunc, lines[start], key);
            if ((decl === undefined) || (decl.type !== 'string') || ((decl.index !== undefined) && (decl.index >= offsets[k - start]))) {
                continue;
            }
        }
        let rest = lines[k].substring (cond[1].length, at) + 'ok' + lines[k].substring (at + all.length);
        rest = rest.replace (/(^|[^\w)\]])\(ok\)/g, '$1ok');
        lines[k] = cond[1] + '_, ok := ' + recv + '[' + key + ']; ' + rest;
        masked[k] = lines[k];
    }
    return lines.join ('\n');
}

// ===== hx11 M36: InOp(this.Markets_by_id(), k) -> `if _, ok := this.Markets_by_id()[k]; ...` =====
// Markets_by_id() is statically map[string]any (nil before load: a nil map reads ok=false like the helper).
// The lookup moves into the if-init, so the key must already be a non-nil string at the `if`: a `string`
// declaration, or a `*string` (dereferenced) that is never nil there: every write is a SafeString* call
// with a literal default, or an earlier `if <k> == nil ... {` block of the func ends in return/continue.
// Lone call in an if header, `ok` unused in the func. Any other shape keeps the helper.
function hx11m36MarketsByIdInOp (content: string): string {
    if (!/InOp\(this\.Markets_by_id\(\), /.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    let maskedFunc = '';
    let offsets: number[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = lines[k].startsWith ('func (this *') ? k : -1;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; (j <= end) && (j < lines.length); j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
            continue;
        }
        if (lines[k] === '}') {
            start = -1;
            continue;
        }
        if ((start < 0) || /\bok\b/.test (maskedFunc)) {
            continue;
        }
        const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (masked[k]);
        const calls = [ ...masked[k].matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
        if ((cond === null) || (calls.length !== 1)) {
            continue;
        }
        const at = calls[0].index;
        const call = /^(?:ccxt\.)?InOp\((this\.Markets_by_id\(\)), (\w+)\)/.exec (lines[k].substring (at));
        if ((call === null) || (goMapWriteGroupEnd (masked[k], at + call[0].indexOf ('(')) !== at + call[0].length)) {
            continue;
        }
        const [ all, recv, key ] = call;
        const decl = goAccessSingleDeclaration (maskedFunc, lines[start], key);
        if ((decl === undefined) || ((decl.index !== undefined) && (decl.index >= offsets[k - start]))) {
            continue;
        }
        let text = key;
        if (decl.type === '*string') {
            let nonNil = (decl.index !== undefined) && goG14NonNilStringPtr (lines.slice (start, k + 1).join ('\n'), key);
            // an earlier `if <k> == nil {` block (alone or as an `||` operand) whose body is a lone return/continue
            for (let j = k - 3; !nonNil && (j > start) && (j > k - 12); j--) {
                const head = /^\s*if (.*) \{$/.exec (masked[j]);
                nonNil = (head !== null) && /^\s*(?:return\b.*|continue)$/.test (masked[j + 1]) && /^\s*\}$/.test (masked[j + 2])
                    && goMapWriteTopLevelParts (head[1], '||').some ((c) => new RegExp ('^\\(?\\s*' + key + ' == nil\\s*\\)?$').test (c.trim ()))
                    && !masked.slice (j + 3, k).some ((l) => goTextWritesName (l, key));
            }
            if (!nonNil) {
                continue;
            }
            text = '*' + key;
        } else if (decl.type !== 'string') {
            continue;
        }
        let rest = lines[k].substring (cond[1].length, at) + 'ok' + lines[k].substring (at + all.length);
        rest = rest.replace (/(^|[^\w)\]])\(ok\)/g, '$1ok');
        lines[k] = cond[1] + '_, ok := ' + recv + '[' + text + ']; ' + rest;
        masked[k] = lines[k];
    }
    return lines.join ('\n');
}

function hx11m36SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11-m36: ' + message); } };
    const f = (sig: string, body: string) => hx11m36MarketsByIdInOp ('func (this *X) H(' + sig + ') {\n' + body + '}\n');
    const nativeStr = f ('', '\tvar s string = "a"\n\tif (this.Markets_by_id() == nil) || !(InOp(this.Markets_by_id(), s)) {\n\t}\n');
    ok (nativeStr.includes ('if _, ok := this.Markets_by_id()[s]; (this.Markets_by_id() == nil) || !ok {'), 'string key');
    ok (f ('', '\tvar s *string = this.SafeString(r, "a", "")\n\tif InOp(this.Markets_by_id(), s) {\n\t}\n').includes ('this.Markets_by_id()[*s]; ok {'), 'default-literal SafeString key');
    ok (f ('', '\tvar s *string = this.SafeString(r, "a")\n\tif InOp(this.Markets_by_id(), s) {\n\t}\n').includes ('InOp('), 'nilable *string keeps the helper');
    ok (f ('', '\tvar s *string = this.SafeString(r, "a")\n\tif s == nil {\n\t\tcontinue\n\t}\n\tif (this.Markets_by_id() == nil) || !(InOp(this.Markets_by_id(), s)) {\n\t}\n').includes ('[*s]; (this.Markets_by_id() == nil) || !ok {'), 'nil-exit above');
    ok (f ('', '\tvar s *string = this.SafeString(r, "a")\n\tif (s != nil) && (InOp(this.Markets_by_id(), s)) {\n\t}\n').includes ('InOp('), 'guard inside the condition keeps the helper');
    ok (f ('s any', '\tif InOp(this.Markets_by_id(), s) {\n\t}\n').includes ('InOp('), 'any key keeps the helper');
    ok (f ('', '\tvar s string = "a"\n\tif InOp(this.Markets(), s) {\n\t}\n').includes ('InOp('), 'other receivers untouched');
    return problems;
}

function hx4G07SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx4-G07: ' + message); } };
    const f = (sig: string, body: string) => hx4G07FieldInOp ('func (this *X) H(' + sig + ') {\n' + body + '}\n');
    ok (f ('', '\tif InOp(this.Urls, "test") {\n\t}\n').includes ('\tif _, ok := this.Urls["test"]; ok {'), 'literal key');
    ok (f ('', '\t} else if InOp(this.Urls, "apiBackup") {\n').includes ('\t} else if _, ok := this.Urls["apiBackup"]; ok {'), 'else-if');
    ok (f ('code any', '\tvar s string = ToString(code)\n\tif (IsLessThan(code, 400)) || !(InOp(this.HttpExceptions, s)) {\n\t}\n').includes ('\tif _, ok := this.HttpExceptions[s]; (IsLessThan(code, 400)) || !ok {'), 'string local key');
    ok (f ('url string', '\tif (this.Clients != nil) && (ccxt.InOp(this.Clients, url)) {\n\t}\n').includes ('\tif _, ok := this.Clients[url]; (this.Clients != nil) && ok {'), 'string param key, ccxt prefix');
    ok (f ('t any', '\tif InOp(this.Features, t) {\n\t}\n').includes ('InOp('), 'any key keeps InOp');
    ok (f ('t *string', '\tif InOp(this.Timeframes, t) {\n\t}\n').includes ('InOp('), '*string key keeps InOp');
    ok (f ('', '\tif InOp(this.Markets, "a") {\n\t}\n').includes ('InOp('), 'sync.Map field keeps InOp');
    ok (f ('', '\tvar b bool = InOp(this.Has, "a")\n').includes ('InOp('), 'bool init keeps InOp');
    ok (f ('', '\tif InOp(this.Has, "a") || InOp(this.Urls, "b") {\n\t}\n').includes ('InOp('), 'two calls keep InOp');
    ok (f ('', '\t_, ok := m["x"]\n\tif InOp(this.Urls, "a") && ok {\n\t}\n').includes ('InOp('), 'ok in func keeps InOp');
    ok (f ('', '\tif InOp(this.Has, s) {\n\t}\n\tvar s string = "a"\n').includes ('InOp('), 'key declared after keeps InOp');
    ok (hx4G07FieldInOp ('func H(this any) {\n\tif InOp(this.Urls, "a") {\n\t}\n}\n').includes ('InOp('), 'non-method keeps InOp');
    return problems;
}

// hx4 X01
// ===== hx4 X01: exchange tuple producers return []any; their holders read slots natively =====
// `func (this *R) M(..) any {` whose every own return (func literals aside) is a one-line
// `[]any{...}` literal prints `[]any`; the same runtime box reaches every caller.
function hx4X01TupleProducers (lines: string[], masked: string[], blocks: any[], baseNames: Set<string>): Map<string, number> {
    const out = new Map<string, number> ();
    for (const fn of blocks.filter ((b: any) => b.depth === 1)) {
        const sig = /^func \(this \*(\w+)\) (\w+)\(.*\) any \{$/.exec (masked[fn.open]);
        if ((sig === null) || (sig[1] === 'BaseExchange') || (sig[1] === 'PredictionExchange') || baseNames.has (sig[2])) {
            continue;
        }
        const literals = blocks.filter ((b: any) => (b.depth > 1) && (b.open > fn.open) && (b.close <= fn.close) && /\bfunc\s*\(/.test (masked[b.open]));
        let arity = -1;
        let ok = true;
        for (let k = fn.open + 1; ok && (k < fn.close); k++) {
            if (!/\breturn\b/.test (masked[k]) || literals.some ((b: any) => (b.open <= k) && (k <= b.close))) {
                continue;
            }
            const r = /^\s*return \[\]any\{(.*)\}\s*$/.exec (masked[k]);
            let depth = 0;
            let n = 1;
            for (const c of (r === null) ? '' : r[1]) {
                depth += ('({['.includes (c) ? 1 : (')}]'.includes (c) ? -1 : 0));
                n += ((c === ',') && (depth === 0)) ? 1 : 0;
                ok = ok && (depth >= 0);
            }
            ok = ok && (r !== null) && (depth === 0) && (r[1].trim () !== '');
            arity = (arity < 0) ? n : Math.min (arity, n);
        }
        if (ok && (arity > 0) && (lines[fn.open] === masked[fn.open])) {
            out.set (sig[2], arity);
        }
    }
    return out;
}

// every method the Go base (BaseExchange / PredictionExchange) declares: an override keeps the base signature (D8)
function x01BaseMethodNames (): Set<string> {
    const cache: any = x01BaseMethodNames as any;
    if (cache.names === undefined) {
        const dir = './go/v4/';
        const files = fs.existsSync (dir) ? fs.readdirSync (dir).filter ((f: string) => /^exchange.*\.go$/.test (f)) : [];
        const text = files.map ((f: string) => fs.readFileSync (dir + f, 'utf8')).join ('\n');
        cache.names = new Set ([ ...text.matchAll (/^func \(this \*(?:BaseExchange|PredictionExchange|Exchange)\) (\w+)\(/gm) ].map ((m: any) => m[1]));
    }
    return cache.names;
}

function hx4X01TupleProducerReads (content: string, baseNames: Set<string> = undefined): string {
    if (content.indexOf (') any {') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const { 'blocks': blocks } = goTextBlocks (masked);
    const producers = hx4X01TupleProducers (lines, masked, blocks, baseNames ?? x01BaseMethodNames ());
    if ((producers.size === 0) || (baseNames === undefined && x01BaseMethodNames ().size === 0)) {
        return content;
    }
    for (let k = 0; k < lines.length; k++) {
        const sig = /^(func \(this \*\w+\) (\w+)\(.*\)) any \{$/.exec (lines[k]);
        if ((sig !== null) && producers.has (sig[2])) {
            lines[k] = sig[1] + ' []any {';
        }
    }
    const consumers = 'MapTyped|ListTyped|SafeStringPtr|SafeBoolPtr|Float64PtrTyped';
    const readRx = new RegExp ('((?:ccxt\\.)?(?:' + consumers + '))\\((?:ccxt\\.)?GetValue\\(([A-Za-z_]\\w*Variable), (\\d+)\\)\\)', 'g');
    // the producer arity of the nearest `h := this.M(..)` above line k when its block encloses k and nothing rewrites h in between
    const holderArity = (holder: string, k: number): number => {
        const fn = blocks.find ((b: any) => (b.depth === 1) && (b.open < k) && (k <= b.close));
        if (fn === undefined) {
            return -1;
        }
        for (let j = k - 1; j > fn.open; j--) {
            const decl = new RegExp ('^\\s*' + holder + ' := this\\.(\\w+)\\(').exec (masked[j]);
            if (decl !== null) {
                const block = goTextEnclosingBlock (blocks, j);
                const enclosing = (block !== undefined) && (block.open < k) && (k <= block.close);
                return (enclosing && producers.has (decl[1])) ? producers.get (decl[1]) : -1;
            }
            if (goTextWritesName (masked[j], holder)) {
                return -1;
            }
        }
        return -1;
    };
    for (let k = 0; k < lines.length; k++) {
        if ((masked[k].indexOf ('GetValue(') < 0) || (lines[k] !== masked[k])) {
            continue;
        }
        lines[k] = lines[k].replace (readRx, (match: string, consumer: string, holder: string, slot: string, offset: number) => {
            if ((offset > 0) && /[\w.]$/.test (lines[k].substring (0, offset)) && !/ccxt\.$/.test (lines[k].substring (0, offset))) {
                return match;
            }
            return (Number (slot) < holderArity (holder, k)) ? consumer + '(' + holder + '[' + slot + '])' : match;
        });
    }
    return lines.join ('\n');
}

function hx4X01SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx4 X01: ' + msg); } };
    const producer = 'func (this *X) P(m any, p any) any {\n\tvar d any = func() string {\n\t\treturn "a"\n\t}()\n\tif m != nil {\n\t\treturn []any{d, p}\n\t}\n\treturn []any{SafeStringPtr("x"), Omit(p, "k")}\n}\n';
    const base = new Set<string> ([ 'ParseWsOHLCV' ]);
    const user = (body: string) => 'func (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n';
    const read = '\thVariable := this.P(nil, p)\n\tvar a *string = SafeStringPtr(GetValue(hVariable, 0))\n\tvar b map[string]any = MapTyped(GetValue(hVariable, 1))\n';
    const r = hx4X01TupleProducerReads (producer + user (read), base);
    ok (r.indexOf ('func (this *X) P(m any, p any) []any {') >= 0, 'producer retyped: ' + r);
    ok ((r.indexOf ('SafeStringPtr(hVariable[0])') >= 0) && (r.indexOf ('MapTyped(hVariable[1])') >= 0), 'slot reads native: ' + r);
    ok (hx4X01TupleProducerReads (r, base) === r, 'idempotent');
    const keepSig = [
        'func (this *X) P(p any) any {\n\tif p != nil {\n\t\treturn p\n\t}\n\treturn []any{1, p}\n}\n',
        'func (this *X) P(p any) any {\n\treturn []any{\n\t\t1, p,\n\t}\n}\n',
        'func (this *BaseExchange) P(p any) any {\n\treturn []any{1, p}\n}\n',
        'func (this *X) P(p any) any {\n\treturn []any{}\n}\n',
        'func (this *X) ParseWsOHLCV(p any) any {\n\treturn []any{1, p}\n}\n',
    ];
    keepSig.forEach ((s: string, i: number) => ok (hx4X01TupleProducerReads (s, base).indexOf (') any {') >= 0, 'signature negative ' + i));
    const keepRead = [
        '\thVariable := this.P(nil, p)\n\tvar c any = MapTyped(GetValue(hVariable, 2))\n',
        '\thVariable := this.P(nil, p)\n\tx := GetValue(hVariable, 0)\n',
        '\thVariable := this.P(nil, p)\n\thVariable = this.Q(p)\n\tvar b map[string]any = MapTyped(GetValue(hVariable, 1))\n',
        '\thVariable := this.Q(p)\n\tvar b map[string]any = MapTyped(GetValue(hVariable, 1))\n',
        '\tif p != nil {\n\t\thVariable := this.P(nil, p)\n\t\t_ = hVariable\n\t}\n\tvar b map[string]any = MapTyped(GetValue(hVariable, 1))\n',
        '\thVariable := this.P(nil, p)\n\tvar b any = IsEqual(GetValue(hVariable, 0), nil)\n',
    ];
    keepRead.forEach ((b: string, i: number) => ok (hx4X01TupleProducerReads (producer + user (b), base).indexOf ('GetValue(hVariable,') >= 0, 'read negative ' + i));
    const pro = 'func (this *X) P(p any) any {\n\treturn []any{nil, p}\n}\n' + user ('\thVariable := this.P(p)\n\tvar b map[string]any = ccxt.MapTyped(ccxt.GetValue(hVariable, 1))\n');
    ok (hx4X01TupleProducerReads (pro, base).indexOf ('ccxt.MapTyped(hVariable[1])') >= 0, 'ccxt-qualified read');
    return problems;
}

// hx4 X02
// SafeCurrencyStructure builds every unified currency row: its return goes through CurrencyTyped so the
// row is pointer-free at build (fresh map, no copy shared), and Currency()/SafeCurrency() rows read natively
function x02CurrencyRows (content: string): string {
    const head = 'func (this *BaseExchange) SafeCurrencyStructure(currency any) map[string]any {\n';
    const at = content.indexOf (head);
    const end = (at < 0) ? -1 : content.indexOf ('\n}\n', at);
    if (end < 0) {
        return content;
    }
    const body = content.substring (at, end);
    // the one function-level return (gofmt tab or 4-space body indent); a nested return is deeper
    const returns = [ ...body.matchAll (/\n([\t ]+)return /g) ];
    const last = returns[returns.length - 1];
    if ((last === undefined) || ![ '\t', '    ' ].includes (last[1]) || (returns.filter ((r) => r[1] === last[1]).length !== 1)
        || !body.startsWith ('return this.Extend(', last.index + last[0].length - 'return '.length) || !body.endsWith ('}, currency)')) {
        return content;
    }
    const open = last.index + last[0].length;
    const fixed = body.substring (0, open) + 'CurrencyTyped(' + body.substring (open) + ')';
    return content.substring (0, at) + fixed + content.substring (end);
}

// hx4 G10
// `MapTyped(this.Omit(x, ..))` / `MapTyped(this.MergeBalanceAccount(x, ..))` of a never-nil map x is
// never nil: Omit of a map builds a fresh map, MergeBalanceAccount hands its first argument back
function hx4G10SelfMapRebind (write: string, name: string): boolean {
    return write.startsWith ('MapTyped(this.Omit(' + name + ', ') || write.startsWith ('MapTyped(this.MergeBalanceAccount(' + name + ', ')
        || (write === 'MapTyped(this.SafeBalance(' + name + '))'); // hx4 B02: SafeBalance returns its argument
}

// a map-literal local rebound by base omit/mergeBalanceAccount of itself stays map[string]any and
// its writes go native; the same shape on a non-base callee keeps the box
function hx4G10SelfTest (): string[] {
    const problems: string[] = [];
    const src = 'type Dict = { [key: string]: any };\ntype Str = string | undefined;\nclass Test {\n'
        + '    omit (x: Dict, ...args: any[]): any { return x; }\n'
        + '    mergeBalanceAccount (result: Dict, code: string, account: Dict): Dict { return result; }\n'
        + '    f1 (side: string) { let request = { \'a\': 1 }; if (side === \'sell\') { request = this.omit (request, \'b\'); } request[\'c\'] = 3; return request; }\n'
        + '    f2 (codes: string[]) { let result = {}; for (let i = 0; i < codes.length; i++) { result = this.mergeBalanceAccount (result, codes[i], {}); } result[\'info\'] = 1; return result; }\n'
        + '    f4 (side: string, p: Str) { let request = { \'a\': 1 }; if (p !== undefined) { request[\'p\'] = p; } request = this.omit (request, \'a\'); return request; }\n'
        + '    f3 (other: Dict) { let request = { \'a\': 1 }; request = this.omit (other, \'b\'); request[\'c\'] = 3; return request; }\n'
        + '}\n';
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G10-'));
    try {
        const print = (dir: string) => {
            fs.mkdirSync (path.join (tmp, dir), { 'recursive': true });
            const file = path.join (tmp, dir, 'Exchange.ts');
            fs.writeFileSync (file, src);
            const t = new Transpiler ({ 'verbose': false, 'go': {} });
            installCcxtGoLocalTypes (t.goTranspiler);
            installCcxtGoIndexableTypes (t.goTranspiler);
            return t.transpileGoByPath (file).content;
        };
        const base = print ('base');
        const body = (go: string, name: string) => (go.split (/\nfunc /).find ((f) => f.startsWith ('(this *Test) ' + name + '(')) ?? '');
        const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G10: ' + msg); } };
        ok (/var request map\[string\]any = /.test (body (base, 'F1')) && /request\["c"\] = 3/.test (body (base, 'F1'))
            && /request = MapTyped\(this\.Omit\(request, "b"\)\)/.test (body (base, 'F1')), 'self-omit local typed + native write');
        ok (/var result map\[string\]any = /.test (body (base, 'F2')) && /result = MapTyped\(this\.MergeBalanceAccount\(result, /.test (body (base, 'F2'))
            && /result\["info"\] = 1/.test (body (base, 'F2')), 'mergeBalanceAccount local typed + native write');
        ok (/var request any = /.test (body (base, 'F3')), 'omit of another map keeps the box');
        const post = nativeTypedContainerAccess ('func (this *X) f(codes []any) any {\n\tvar result map[string]any = map[string]any{}\n'
            + '\tresult = MapTyped(this.MergeBalanceAccount(result, "BTC", map[string]any{}))\n\tAddElementToObject(result, "info", 1)\n\treturn result\n}');
        ok (post.indexOf ('result["info"] = 1') > 0, 'map write after a self-merge goes native in the post pass');
        ok (!/request\["p"\] = p\b/.test (body (base, 'F4')), 'a pointer value is never stored un-deref\'d');
        const other = print ('other');
        ok (/var request any = /.test (body (other, 'F1')) && /var result any = /.test (body (other, 'F2')), 'non-base callee keeps the box');
    } catch (e: any) {
        problems.push ('hx4 G10 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}

// hx4 B02
// a map-literal local rebound by base safeBalance of itself (or a const declared from it) is map[string]any
function b02SafeBalanceSelfTest (): string[] {
    const problems: string[] = [];
    const src = 'type Dict = { [key: string]: any };\nclass Test {\n'
        + '    safeBalance (balance: Dict): any { return balance; }\n'
        + '    mergeBalanceAccount (result: Dict, code: string, account: Dict): Dict { return result; }\n'
        + '    deepExtend (...args: any[]): any { return args[0]; }\n'
        + '    f1 (codes: string[], spot: boolean) { let result: Dict = { \'info\': 1 }; if (spot) { for (let i = 0; i < codes.length; i++) { result = this.mergeBalanceAccount (result, codes[i], {}); } result = this.safeBalance (result); } else { result[\'x\'] = 2; result = this.safeBalance (result); } return result; }\n'
        + '    f2 () { const result: Dict = { \'info\': 1 }; result[\'a\'] = {}; const balance = this.safeBalance (result); return this.deepExtend ({}, balance); }\n'
        + '    f3 (other: Dict) { let result: Dict = { \'info\': 1 }; result = this.safeBalance (other); result[\'x\'] = 2; return result; }\n'
        + '    f4 (other: Dict) { const balance = this.safeBalance (other); return balance; }\n'
        + '}\n';
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-B02-'));
    try {
        const print = (dir: string) => {
            fs.mkdirSync (path.join (tmp, dir), { 'recursive': true });
            const file = path.join (tmp, dir, 'Exchange.ts');
            fs.writeFileSync (file, src);
            const t = new Transpiler ({ 'verbose': false, 'go': {} });
            installCcxtGoLocalTypes (t.goTranspiler);
            installCcxtGoIndexableTypes (t.goTranspiler);
            return t.transpileGoByPath (file).content;
        };
        const base = print ('base');
        const body = (go: string, name: string) => (go.split (/\nfunc /).find ((f) => f.startsWith ('(this *Test) ' + name + '(')) ?? '');
        const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 B02: ' + msg); } };
        ok (/var result map\[string\]any = /.test (body (base, 'F1')) && /result = MapTyped\(this\.SafeBalance\(result\)\)/.test (body (base, 'F1'))
            && /result\["x"\] = 2/.test (body (base, 'F1')), 'self-safeBalance local typed + native write');
        ok (/var balance map\[string\]any = MapTyped\(this\.SafeBalance\(result\)\)/.test (body (base, 'F2')), 'const from safeBalance of a map local typed');
        ok (/var result any = /.test (body (base, 'F3')), 'safeBalance of another value keeps the box');
        ok (/var balance any = this\.SafeBalance\(other\)/.test (body (base, 'F4')), 'const from safeBalance of a param keeps the box');
        const post = nativeTypedContainerAccess ('func (this *X) f() any {\n\tvar result map[string]any = map[string]any{}\n'
            + '\tresult = MapTyped(this.SafeBalance(result))\n\tAddElementToObject(result, "info", 1)\n\treturn result\n}');
        ok (post.indexOf ('result["info"] = 1') > 0, 'map write after a self-safeBalance goes native in the post pass');
        const other = print ('other');
        ok (/var result any = /.test (body (other, 'F1')) && /var balance any = /.test (body (other, 'F2')), 'non-base callee keeps the box');
    } catch (e: any) {
        problems.push ('hx4 B02 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}

// hx4 G13
// Dict[] / never-nil Dict-local returns print their native type; Str locals written only as *string are *string
function g13AnnotatedSelfTest (): string[] {
    const problems: string[] = [];
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G13-'));
    try {
        const src = path.join (tmp, 'ts', 'src');
        fs.mkdirSync (path.join (src, 'base'), { 'recursive': true });
        fs.writeFileSync (path.join (src, 'base', 'Exchange.ts'), 'export type Dict = { [key: string]: any };\nexport type Str = string | undefined;\n'
            + 'export class Exchange {\n    safeString (a, b, c?): Str { return undefined; }\n    safeValue (a, b, c?): any { return undefined; }\n}\n');
        fs.writeFileSync (path.join (src, 'ex.ts'), 'import { Exchange, Dict, Str } from \'./base/Exchange\';\nexport class ex extends Exchange {\n'
            + '    rows (xs: any[]): Dict[] { const result: Dict[] = []; for (let i = 0; i < xs.length; i++) { result.push ({ \'a\': xs[i] }); } return result; }\n'
            + '    request (p: Str): Dict { const request: Dict = { \'a\': 1 }; if (p !== undefined) { request[\'p\'] = p; } return request; }\n'
            + '    rebound (o): Dict { let r: Dict = { \'a\': 1 }; r = this.safeValue (o, \'x\'); return r; }\n'
            + '    pick (o, side: string) { const a = this.safeString (o, \'a\'); let id: Str = undefined; if (side === \'buy\') { id = a; } return { \'id\': id }; }\n'
            + '    pick2 (o) { let id: Str = undefined; id = this.safeValue (o, \'a\'); return { \'id\': id }; }\n'
            + '    use (o) { return [ this.rows ([ 1 ]), this.request (\'x\'), this.rebound (o), this.pick (o, \'buy\'), this.pick2 (o) ]; }\n}\n');
        const t = new Transpiler ({ 'verbose': false, 'go': {} });
        installCcxtGoLocalTypes (t.goTranspiler);
        installCcxtGoIndexableTypes (t.goTranspiler);
        const go = t.transpileGoByPath (path.join (src, 'ex.ts')).content;
        const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G13: ' + msg); } };
        ok (go.includes ('func (this *ex) Rows(xs []any) []any {'), 'Dict[] return of a slice local prints []any');
        ok (go.includes ('func (this *ex) Request(p *string) map[string]any {'), 'Dict return of a map-literal local prints map[string]any');
        ok (go.includes ('func (this *ex) Rebound(o any) any {'), 'a local rebound to an any value keeps the any return');
        ok (/\tvar id \*string = nil\n\tif side == "buy"/.test (go), 'Str local written only as *string is *string');
        ok (/func \(this \*ex\) Pick2\(o any\) any \{\n\tvar id any = nil/.test (go), 'Str local written from any keeps the box');
    } catch (e: any) {
        problems.push ('hx4 G13 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}

// hx4 G14
// address taken or multi-value rebinding of a map local; a comparison (`f(m, k) != nil`) is not a write
function goG14MapLocalRebound (maskedFunc: string, n: string): boolean {
    return new RegExp ('&\\s*' + n + '\\b|(?:^|[^\\w.])' + n + '\\s*(?:,[^=\\n]*)?:=|,\\s*' + n + '\\s*(?:,[^=\\n]*)?(?<![!<>])=(?!=)|(?:^|[^\\w.])' + n + '\\s*,[^=\\n]*(?<![!<>])=(?!=)', 'm').test (maskedFunc);
}

// some enclosing then-block of line k (not only the innermost) is opened by `if ... {` with a
// top-level `name != nil` conjunct; a func literal block stops the walk (the closure may run later)
function goG14EnclosingNilGuard (masked: string[], start: number, k: number, name: string): boolean {
    const test = new RegExp ('^(?:\\(\\s*)?' + goAccessEscape (name) + ' != nil(?:\\s*\\))?$');
    let depth = 0;
    for (let j = k - 1; j > start; j--) {
        const line = masked[j];
        for (let c = line.length - 1; c >= 0; c--) {
            depth += (line[c] === '}') ? 1 : ((line[c] === '{') ? -1 : 0);
            if (depth >= 0) {
                continue;
            }
            depth = 0;
            if (/\bfunc\s*\([^{]*\{\s*$/.test (line.substring (0, c + 1))) {
                return false;
            }
            const head = /^\s*(?:\}\s*else\s+)?if (.*) \{\s*$/.exec (goMapWriteIfHeader (masked, j));
            if ((head !== null) && (c === line.trimEnd ().length - 1) && goMapWriteTopLevelParts (head[1], '&&').some ((p) => test.test (p.trim ()))) {
                return true;
            }
        }
    }
    return false;
}

function hx4G14MapWriteSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G14: ' + msg); } };
    const run = (body: string) => nativeTypedContainerAccess ('func (this *X) f(p any) any {\n\tvar request map[string]any = map[string]any{}\n'
        + '\tvar since *int64 = this.SafeInteger(p, "s")\n' + body + '\treturn request\n}');
    ok (run ('\tif since != nil {\n\t\tif this.SafeString(request, "a") != nil {\n\t\t\tAddElementToObject(request, "s", since)\n\t\t} else {\n'
        + '\t\t\tAddElementToObject(request, "t", since)\n\t\t}\n\t}\n').match (/request\["[st]"\] = \*since/g)?.length === 2, 'outer nil guard + nil comparison on the map');
    ok (run ('\tif since == nil {\n\t\tAddElementToObject(request, "s", since)\n\t}\n').includes ('request["s"] = *since') === false, '== nil guard prints no bare deref');
    ok (run ('\tif since != nil {\n\t\tf := func() {\n\t\t\tAddElementToObject(request, "s", since)\n\t\t}\n\t\tf()\n\t}\n').includes ('request["s"] = *since') === false, 'a func literal stops the guard walk');
    ok (run ('\tif since != nil {\n\t}\n\tAddElementToObject(request, "s", since)\n').includes ('request["s"] = *since') === false, 'a closed guard block does not dominate');
    ok (run ('\tif (since != nil) || true {\n\t\tAddElementToObject(request, "s", since)\n\t}\n').includes ('request["s"] = *since') === false, 'a || guard prints no bare deref');
    // any-typed value locals fed only by deref'd producers (printer-go-addelem-map-local-any-key-value)
    const anyRun = (body: string) => nativeTypedContainerAccess ('func (this *X) f(p any) any {\n\tvar result map[string]any = map[string]any{}\n' + body + '\treturn result\n}');
    ok (anyRun ('\tvar item any = this.SafeDict(p, "k", map[string]any{})\n\tvar id *string = this.SafeString(item, "id")\n\tAddElementToObject(result, id, item)\n').includes ('if id != nil {\n\t\tresult[*id] = item\n\t}'), 'SafeDict any local under a *string key');
    ok (anyRun ('\tvar item any = GetValue(p, "k")\n\tAddElementToObject(result, "a", item)\n').includes ('result["a"] = item'), 'GetValue any local under a literal key');
    ok (anyRun ('\tvar item any = this.SafeDict(p, "k")\n\titem = this.Foo(p)\n\tAddElementToObject(result, "a", item)\n').includes ('result["a"] = item') === false, 'a non-deref\'d rewrite keeps the helper');
    ok (anyRun ('\tvar item any = this.SafeList(p, "k", []any{})\n\tAppendToArray(&item, 1)\n\tAddElementToObject(result, "a", item)\n').includes ('result["a"] = item') === false, 'an address-taken local keeps the helper');
    ok (anyRun ('\tvar item any = this.Foo(p)\n\tAddElementToObject(result, "a", item)\n').includes ('result["a"] = item') === false, 'an unknown producer keeps the helper');
    const src = 'type List = any[];\nclass Test {\n'
        + '    safeList (d: any, k: any, v: any = undefined): any { return v; }\n'
        + '    f (r: any) { const data = this.safeList (r, \'data\', []); const n = (data as List).length; for (let i = 0; i < n; i++) { const e = data[i]; } return n; }\n'
        + '    g (r: any) { const data = this.safeList (r, \'data\', []); return (data as List); }\n'
        + '}\n';
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G14-'));
    try {
        const file = path.join (tmp, 'test.ts');
        fs.writeFileSync (file, src);
        const t = new Transpiler ({ 'verbose': false, 'go': {} });
        installCcxtGoLocalTypes (t.goTranspiler);
        installCcxtGoIndexableTypes (t.goTranspiler);
        const go = t.transpileGoByPath (file).content;
        const body = (name: string) => (go.split (/\nfunc /).find ((f) => f.startsWith ('(this *Test) ' + name + '(')) ?? '');
        ok (/var data \[\]any = SafeListTyped\(r, "data"\)/.test (body ('F')), 'safeList [] default read through `as List` unboxes');
        ok (/var data \[\]any = SafeListTypedDefault\(r, "data", \[\]any\{\}\)/.test (body ('G')), 'an `as` wrapper that hands the list out keeps its default');
    } catch (e: any) {
        problems.push ('hx4 G14 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}


// hx4 G12
// ===== hx4 G12: plain tuple slots of exchange producers; pro files see their REST producers =====
// Slot i of a `[]any`-returning exchange producer is plain when every own return's element i is
// derefScalar-invariant (literal, fresh map, Omit/Extend/GetValue result, non-pointer scalar local);
// then `x := GetValue(h, i)` reads `x := h[i]`. pro/<id>.go resolves producers through its REST chain.
function g12Ctx (content: string, path: string = ''): any {
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return undefined;
    }
    return { 'path': path, 'lines': lines, 'masked': masked, 'blocks': goTextBlocks (masked).blocks, 'producers': undefined, 'busy': new Set<string> () };
}

function g12FuncAt (ctx: any, k: number): any {
    const fn = ctx.blocks.find ((b: any) => (b.depth === 1) && (b.open < k) && (k <= b.close));
    return ((fn !== undefined) && ctx.masked[fn.open].startsWith ('func ')) ? fn : undefined;
}

function g12Encloses (ctx: any, j: number, k: number): boolean {
    const block = goTextEnclosingBlock (ctx.blocks, j);
    return (block !== undefined) && (block.open < k) && (k <= block.close);
}

// top-level comma split of a masked list body; raw pieces share the masked offsets
function g12SplitTop (masked: string, raw: string): string[][] {
    const out: string[][] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i <= masked.length; i++) {
        const c = masked[i];
        if ((i === masked.length) || ((c === ',') && (depth === 0))) {
            out.push ([ masked.substring (start, i).trim (), raw.substring (start, i).trim () ]);
            start = i + 1;
            continue;
        }
        depth += '({['.includes (c) ? 1 : (')}]'.includes (c) ? -1 : 0);
        if (depth < 0) {
            return undefined;
        }
    }
    return (depth === 0) ? out : undefined;
}

// `head(...)` / `head{...}` where the bracket opened right after head closes at the very end
function g12WholeCall (masked: string, head: number): boolean {
    let depth = 0;
    for (let i = head; i < masked.length; i++) {
        depth += '({['.includes (masked[i]) ? 1 : (')}]'.includes (masked[i]) ? -1 : 0);
        if ((depth === 0) && (i !== masked.length - 1)) {
            return false;
        }
    }
    return depth === 0;
}

// the producer M of `h := this.M(..)` / `var h []any = this.M(..)`, nearest above k in an enclosing block, h unwritten in between
function g12HolderProducer (ctx: any, fn: any, holder: string, k: number): string {
    for (let j = k - 1; j > fn.open; j--) {
        const decl = new RegExp ('^\\s*(?:' + holder + ' :=|var ' + holder + ' \\[\\]any =) this\\.(\\w+)\\(').exec (ctx.masked[j]);
        if (decl !== null) {
            return g12Encloses (ctx, j, k) ? decl[1] : undefined;
        }
        const recv = new RegExp ('^\\s*(?:' + holder + ' :=|var ' + holder + ' \\[\\]any =) (?:(\\w+)\\.Value|(listRecv\\d+))\\s*$').exec (ctx.masked[j]);
        if (recv !== null) {
            return g12Encloses (ctx, j, k) ? g12AsyncReceiveProducer (ctx, fn, j, recv[1] ?? recv[2]) : undefined;
        }
        if (goTextWritesName (ctx.masked[j], holder)) {
            return undefined;
        }
    }
    return undefined;
}

// the body of the `[]any` async producer behind `rN := <-this.MAsync(..)` read as `rN.Value` or via `listRecvN, _ := rN.Value, ..`
function g12AsyncReceiveProducer (ctx: any, fn: any, k: number, source: string): string {
    let result = source;
    if (source.startsWith ('listRecv')) {
        result = undefined;
        for (let j = k - 1; j > fn.open; j--) {
            const list = new RegExp ('^\\s*' + source + ', _ := (\\w+)\\.Value, \\1\\.Value != nil\\s*$').exec (ctx.masked[j]);
            if (list !== null) {
                result = g12Encloses (ctx, j, k) ? list[1] : undefined;
                k = j;
                break;
            }
        }
    }
    if (result === undefined) {
        return undefined;
    }
    for (let j = k - 1; j > fn.open; j--) {
        const recv = new RegExp ('^\\s*' + result + ' := <-this\\.(\\w+)Async\\(').exec (ctx.masked[j]);
        if (recv !== null) {
            return g12Encloses (ctx, j, k) ? recv[1].charAt (0).toLowerCase () + recv[1].substring (1) + 'Body' : undefined;
        }
        if (goTextWritesName (ctx.masked[j], result)) {
            return undefined;
        }
    }
    return undefined;
}

function g12SlotPlain (ctx: any, method: string, slot: number, depth: number): boolean {
    const info = g12Producer (ctx, method, depth);
    if (info !== undefined) {
        return (slot < info.arity) && info.plain[slot];
    }
    return (GO_TUPLE_PLAIN_ELEMENTS[method] || []).includes (String (slot)) && !new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + method + '\\(').test (ctx.masked.join ('\n'));
}

function g12IdentPlain (ctx: any, fn: any, name: string, k: number, depth: number): boolean {
    const decl = goAccessSingleDeclaration (ctx.masked.slice (fn.open + 1, fn.close + 1).join ('\n'), ctx.masked[fn.open], name);
    if ((decl !== undefined) && [ 'bool', 'string', 'int64', 'float64', 'int' ].includes (decl.type)) {
        return true;
    }
    const multi = new RegExp ('(?:^|[^\\w.])' + name + '\\s*,[^=\\n]*?(?<![!<>=:])=(?!=)|,\\s*' + name + '\\s*(?:,[^=\\n]*)?:?=(?!=)');
    const writes = (j: number) => (goTextWritesName (ctx.masked[j], name) || multi.test (ctx.masked[j])) && !new RegExp ('^\\s*' + name + '\\s*\\[[^\\]]*\\]\\s*=(?!=)').test (ctx.masked[j]);
    // a func literal writing the local may run anywhere after its definition
    const closures = ctx.blocks.filter ((b: any) => (b.open > fn.open) && (b.close <= fn.close) && /\bfunc\s*\(/.test (ctx.masked[b.open]));
    for (const b of closures) {
        for (let j = b.open + 1; j < b.close; j++) {
            if (writes (j)) {
                return false;
            }
        }
    }
    // a write later in an enclosing loop can reach the return on the next iteration
    for (const b of ctx.blocks.filter ((b: any) => (b.open > fn.open) && (b.open < k) && (k <= b.close) && /^\s*for\b/.test (ctx.masked[b.open]))) {
        for (let j = k + 1; j < b.close; j++) {
            if (writes (j)) {
                return false;
            }
        }
    }
    for (let j = k - 1; j > fn.open; j--) {
        if (/^\s*(?:case\b|default:)/.test (ctx.masked[j])) {
            return false;
        }
        if (!writes (j)) {
            continue;
        }
        if (!g12Encloses (ctx, j, k)) {
            return false;
        }
        const m = ctx.masked[j];
        if (new RegExp ('^\\s*var ' + name + ' any\\s*$').test (m)) {
            return true;
        }
        // hx11 w8: a fresh multi-line `map[string]any{` literal is a non-nil map, like the one-line literal below
        if (new RegExp ('^\\s*(?:var ' + name + ' map\\[string\\]any|' + name + ') :?= map\\[string\\]any\\{\\s*$').test (m)) {
            return true;
        }
        const w = new RegExp ('^(\\s*(?:var ' + name + '(?: [^=,]+?)?|' + name + ') :?= )(.+?)\\s*$').exec (m);
        if (w === null) {
            return false;
        }
        const start = w[1].length;
        const rhs = m.substring (start).trim ();
        // a nil stored into a typed container/pointer local is a typed nil, not untyped nil
        const typed = new RegExp ('\\bvar ' + name + ' ([^=\\s]+)').exec (ctx.masked.slice (fn.open, k).join ('\n'));
        if ((rhs === 'nil') && ((typed === null) || (typed[1] !== 'any'))) {
            return false;
        }
        return g12ExprPlain (ctx, fn, j, rhs, ctx.lines[j].substring (start).trim (), depth + 1);
    }
    return false;
}

function g12ExprPlain (ctx: any, fn: any, k: number, masked: string, raw: string, depth: number): boolean {
    if (depth > 5) {
        return false;
    }
    if (/^(?:nil|true|false|-?\d+(?:\.\d+)?)$/.test (masked)) {
        return true;
    }
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (raw) && (masked.trim () === '')) {
        return true;
    }
    if (/^[A-Za-z_]\w*$/.test (masked) && (masked !== 'this')) {
        return g12IdentPlain (ctx, fn, masked, k, depth);
    }
    const call = /^(?:this\.|ccxt\.)?(?:Omit|OmitDict|Extend|DeepExtend|ParseToInt|GetValue)\(/.exec (masked);
    if ((call !== null) && g12WholeCall (masked, call[0].length - 1)) {
        return true;
    }
    const lit = /^(?:map\[string\]any|\[\]any)\{/.exec (masked);
    if ((lit !== null) && g12WholeCall (masked, lit[0].length - 1)) {
        return true;
    }
    if (/^GetArgMap\(optionalArgs, \d+, map\[string\]any\{\}\)$/.test (masked)) {
        return true;
    }
    // hx11 w8: `MapTyped(h[i])` / `h[i].(map[string]any)` of a plain slot is that same map
    const slot = /^(?:MapTyped\(([A-Za-z_]\w*)\[(\d+)\]\)|([A-Za-z_]\w*)\[(\d+)\](?:\.\(map\[string\]any\))?)$/.exec (masked);
    if (slot !== null) {
        const holder = slot[1] ?? slot[3];
        const method = g12HolderProducer (ctx, fn, holder, k);
        return (method !== undefined) && g12SlotPlain (ctx, method, Number (slot[2] ?? slot[4]), depth + 1);
    }
    return false;
}

// { arity, plain[] } of a `[]any` producer defined in this file whose every own return is a one-line literal
function g12LocalProducer (ctx: any, method: string, depth: number): any {
    ctx.producers = ctx.producers ?? new Map<string, any> ();
    if (ctx.producers.has (method)) {
        return ctx.producers.get (method);
    }
    if (ctx.busy.has (method) || (depth > 5)) {
        return undefined;
    }
    const asyncBody = method.endsWith ('Body');
    const fn = ctx.blocks.find ((b: any) => (b.depth === 1) && new RegExp ('^func \\(this \\*(\\w+)\\) ' + method + '\\(' + (asyncBody ? 'ch chan AsyncResult\\[\\[\\]any\\], .*\\) any' : '.*\\) \\[\\]any') + ' \\{$').test (ctx.masked[b.open]));
    const owner = (fn === undefined) ? undefined : /^func \(this \*(\w+)\)/.exec (ctx.masked[fn.open])[1];
    if ((fn === undefined) || (owner === 'BaseExchange') || (owner === 'PredictionExchange')) {
        return undefined;
    }
    ctx.busy.add (method);
    const literals = ctx.blocks.filter ((b: any) => (b.depth > 1) && (b.open > fn.open) && (b.close <= fn.close) && /\bfunc\s*\(/.test (ctx.masked[b.open]));
    const rows: string[][][] = [];
    let ok = true;
    for (let k = fn.open + 1; ok && (k < fn.close); k++) {
        if (asyncBody && /^\s*return nil\s*$/.test (ctx.masked[k])) {
            continue;
        }
        if (!(asyncBody ? /\bch <- / : /\breturn\b/).test (ctx.masked[k]) || literals.some ((b: any) => (b.open <= k) && (k <= b.close))) {
            continue;
        }
        const r = (asyncBody ? /^(\s*ch <- AsyncResult\[\[\]any\]\{Value: \[\]any\{)(.*)\}\}\s*$/ : /^(\s*return \[\]any\{)(.*)\}\s*$/).exec (ctx.masked[k]);
        const parts = ((r === null) || (r[2].trim () === '')) ? undefined : g12SplitTop (r[2], ctx.lines[k].substring (r[1].length, r[1].length + r[2].length));
        ok = (parts !== undefined);
        if (ok) {
            rows.push (parts.map ((p: string[]) => [ p[0], p[1], String (k) ]));
        }
    }
    let info: any = undefined;
    if (ok && (rows.length > 0)) {
        const arity = Math.min (...rows.map ((r) => r.length));
        const plain: boolean[] = [];
        for (let i = 0; i < arity; i++) {
            plain.push (rows.every ((r) => g12ExprPlain (ctx, fn, Number (r[i][2]), r[i][0], r[i][1], depth + 1)));
        }
        info = { 'arity': arity, 'plain': plain };
    }
    ctx.busy.delete (method);
    ctx.producers.set (method, info);
    return info;
}

// the REST chain of a pro file (`*ccxt.X` -> go/v4/x.go -> its embedded REST parents); a pro parent is unresolvable
function g12RestChain (ctx: any): any[] {
    if (ctx.restChain !== undefined) {
        return ctx.restChain;
    }
    ctx.restChain = [];
    const at = /^(.*go\/v4\/)pro\/\w+\.go$/.exec (ctx.path.replace (/\\/g, '/'));
    if ((at !== null) && (at[1].indexOf ('/prediction/') >= 0)) {
        return [];
    }
    const reader = ctx.reader ?? ((p: string) => (fs.existsSync (p) ? fs.readFileSync (p, 'utf8') : undefined));
    let embedded = /\ntype \w+ struct \{\n\s*(\*?)(ccxt\.)?(\w+)\n/.exec ('\n' + ctx.lines.join ('\n'));
    if ((at === null) || (embedded === null) || (embedded[2] === undefined)) {
        ctx.restChain = (embedded !== null) && (embedded[2] === undefined) ? undefined : [];
        return ctx.restChain;
    }
    for (let hops = 0; (embedded !== null) && (hops < 4); hops++) {
        if ([ 'Exchange', 'BaseExchange', 'PredictionExchange' ].includes (embedded[3])) {
            break;
        }
        const text = reader (at[1] + embedded[3].toLowerCase () + '.go');
        const next = (text === undefined) ? undefined : g12Ctx (text, at[1] + embedded[3].toLowerCase () + '.go');
        if (next === undefined) {
            ctx.restChain = undefined;
            return undefined;
        }
        ctx.restChain.push (next);
        embedded = /\ntype \w+ struct \{\n\s*(\*?)(ccxt\.)?(\w+)\n/.exec ('\n' + text);
    }
    return ctx.restChain;
}

// the producer `this.M` resolves to from this file: own definition first, then the REST chain of a pro file
function g12Producer (ctx: any, method: string, depth: number = 0): any {
    const defines = (c: any) => new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + method + '\\(').test (c.masked.join ('\n'));
    if (defines (ctx)) {
        return g12LocalProducer (ctx, method, depth);
    }
    if (!/\/pro\/\w+\.go$/.test (ctx.path.replace (/\\/g, '/'))) {
        return undefined;
    }
    const chain = g12RestChain (ctx);
    for (const c of (chain ?? [])) {
        if (defines (c)) {
            return g12LocalProducer (c, method, depth);
        }
    }
    return undefined;
}

function hx4G12TupleSlotReads (content: string, path: string = '', reader: any = undefined): string {
    if (content.indexOf ('GetValue(') < 0) {
        return content;
    }
    const ctx = g12Ctx (content, path);
    if (ctx === undefined) {
        return content;
    }
    ctx.reader = reader;
    const lines = ctx.lines.slice ();
    const consumers = 'MapTyped|ListTyped|SafeStringPtr|SafeBoolPtr|SafeIntegerPtr';
    const readRx = new RegExp ('((?:ccxt\\.)?(?:' + consumers + '))\\((?:ccxt\\.)?GetValue\\(([A-Za-z_]\\w*Variable), (\\d+)\\)\\)', 'g');
    let changed = false;
    for (let k = 0; k < lines.length; k++) {
        if ((ctx.masked[k].indexOf ('GetValue(') < 0) || (ctx.lines[k] !== ctx.masked[k])) {
            continue;
        }
        const fn = g12FuncAt (ctx, k);
        if (fn === undefined) {
            continue;
        }
        const bare = /^(\s*(?:var \w+ any =|\w+ :?=) )(?:ccxt\.)?GetValue\(([A-Za-z_]\w*Variable), (\d+)\)(\s*)$/.exec (lines[k]);
        if (bare !== null) {
            const method = g12HolderProducer (ctx, fn, bare[2], k);
            const info = (method === undefined) ? undefined : g12Producer (ctx, method);
            if ((info !== undefined) && (Number (bare[3]) < info.arity) && info.plain[Number (bare[3])]) {
                lines[k] = bare[1] + bare[2] + '[' + bare[3] + ']' + bare[4];
                changed = true;
            }
            continue;
        }
        lines[k] = lines[k].replace (readRx, (match: string, consumer: string, holder: string, slot: string, offset: number) => {
            if ((offset > 0) && /[\w.]$/.test (lines[k].substring (0, offset)) && !/ccxt\.$/.test (lines[k].substring (0, offset))) {
                return match;
            }
            const method = g12HolderProducer (ctx, fn, holder, k);
            const info = (method === undefined) ? undefined : g12Producer (ctx, method);
            if ((info === undefined) || (Number (slot) >= info.arity)) {
                return match;
            }
            changed = true;
            return consumer + '(' + holder + '[' + slot + '])';
        });
    }
    return changed ? lines.join ('\n') : content;
}

function g12SlotChecks (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx4 G12: ' + msg); } };
    const producer = 'func (this *X) P(m any, optionalArgs ...any) []any {\n\tvar params map[string]any = GetArgMap(optionalArgs, 0, map[string]any{})\n\tvar s *string = this.SafeString(params, "k")\n'
        + '\tvar flag any = nil\n\tif m != nil {\n\t\tflag = true\n\t\treturn []any{s, this.Omit(params, "k"), flag}\n\t}\n\treturn []any{s, params, false}\n}\n';
    const user = (body: string) => 'func (this *X) F(p any) any {\n' + body + '\treturn nil\n}\n';
    const run = (body: string, text: string = producer, path: string = '', reader: any = undefined) => hx4G12TupleSlotReads (text + user (body), path, reader);
    const pos = run ('\thVariable := this.P(nil, p)\n\ta := GetValue(hVariable, 0)\n\tb := GetValue(hVariable, 1)\n\tc := GetValue(hVariable, 2)\n');
    ok (pos.includes ('b := hVariable[1]') && pos.includes ('c := hVariable[2]'), 'map and bool slots read natively: ' + pos);
    ok (pos.includes ('a := GetValue(hVariable, 0)'), 'a *string slot keeps GetValue');
    ok (run ('\thVariable := this.P(nil, p)\n\tx := GetValue(hVariable, 3)\n').includes ('GetValue(hVariable, 3)'), 'slot past the arity keeps GetValue');
    ok (run ('\thVariable := this.P(nil, p)\n\thVariable = this.Q(p)\n\tb := GetValue(hVariable, 1)\n').includes ('GetValue(hVariable, 1)'), 'a rewritten holder keeps GetValue');
    const typedNil = 'func (this *X) P(p any) []any {\n\tvar m map[string]any = nil\n\treturn []any{m, p}\n}\n';
    ok (run ('\thVariable := this.P(p)\n\tc := GetValue(hVariable, 0)\n', typedNil.replace ('map[string]any = nil', 'any = nil')).includes ('c := hVariable[0]'), 'an untyped nil slot reads natively');
    ok (run ('\thVariable := this.P(p)\n\tc := GetValue(hVariable, 0)\n', typedNil).includes ('GetValue(hVariable, 0)'), 'a typed nil map slot keeps GetValue');
    const loop = 'func (this *X) P(p any) []any {\n\tvar v any = nil\n\tfor i := 0; i < 2; i++ {\n\t\tif i > 0 {\n\t\t\treturn []any{v, p}\n\t\t}\n\t\tv = this.SafeString(p, "k")\n\t}\n\treturn []any{nil, p}\n}\n';
    ok (run ('\thVariable := this.P(p)\n\tv := GetValue(hVariable, 0)\n', loop).includes ('GetValue(hVariable, 0)'), 'a later loop write reaching the return keeps GetValue');
    const multiW = 'func (this *X) P(p any) []any {\n\tvar v any = nil\n\tv, p = this.Q(p)\n\treturn []any{v, p}\n}\n';
    ok (run ('\thVariable := this.P(p)\n\tv := GetValue(hVariable, 0)\n', multiW).includes ('GetValue(hVariable, 0)'), 'a multi-assignment write keeps GetValue');
    const closureW = 'func (this *X) P(p any) []any {\n\tvar v any = nil\n\tf := func() {\n\t\tv = this.SafeString(p, "k")\n\t}\n\tf()\n\treturn []any{v, p}\n}\n';
    ok (run ('\thVariable := this.P(p)\n\tv := GetValue(hVariable, 0)\n', closureW).includes ('GetValue(hVariable, 0)'), 'a closure write keeps GetValue');
    const rest = 'package ccxt\n\ntype Y struct {\n\tExchange\n}\n\n' + producer.replace ('(this *X)', '(this *Y)');
    const pro = 'package ccxtpro\n\ntype Y struct {\n\t*ccxt.Y\n\tbase *ccxt.Y\n}\n\n';
    const reader = (p: string) => (p === '/r/go/v4/y.go') ? rest : undefined;
    const cross = run ('\thVariable := this.P(nil, p)\n\tb := ccxt.GetValue(hVariable, 1)\n\tvar s *string = ccxt.SafeStringPtr(ccxt.GetValue(hVariable, 0))\n', pro, '/r/go/v4/pro/y.go', reader);
    ok (cross.includes ('b := hVariable[1]') && cross.includes ('ccxt.SafeStringPtr(hVariable[0])'), 'pro file resolves its REST producer: ' + cross);
    ok (run ('\thVariable := this.P(nil, p)\n\tb := ccxt.GetValue(hVariable, 1)\n', pro, '/r/go/v4/x.go', reader).includes ('ccxt.GetValue(hVariable, 1)'), 'a REST file never reads other files');
    const proParent = 'package ccxtpro\n\ntype Y struct {\n\t*Z\n\tbase *Z\n}\n\n';
    ok (run ('\thVariable := this.P(nil, p)\n\tb := ccxt.GetValue(hVariable, 1)\n', proParent, '/r/go/v4/pro/y.go', reader).includes ('ccxt.GetValue(hVariable, 1)'), 'a pro parent chain is not resolved');
    ok (run ('\thVariable := this.P(nil, p)\n\tb := GetValue(hVariable, 1)\n', producer.replace ('(this *X)', '(this *BaseExchange)')).includes ('GetValue(hVariable, 1)'), 'base producers stay with the static table');
    const asyncProducer = 'func (this *X) PAsync(m any) <-chan AsyncResult[[]any] {\n\tch := make(chan AsyncResult[[]any], 1)\n\tgo this.pBody(ch, m)\n\treturn ch\n}\n'
        + 'func (this *X) pBody(ch chan AsyncResult[[]any], m any, optionalArgs ...any) any {\n\tdefer close(ch)\n\tvar a any = nil\n\tif m != nil {\n\t\ta = this.ParseToInt(m)\n\t}\n\n\tch <- AsyncResult[[]any]{Value: []any{this.ParseToInt(a), map[string]any{}}}\n\treturn nil\n}\n';
    const recvBody = '\tr := <-this.PAsync(p)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tlistRecv1, _ := r.Value, r.Value != nil\n\tvar hVariable []any = listRecv1\n\ta := GetValue(hVariable, 0)\n\tb := GetValue(hVariable, 1)\n';
    const asyncOut = run (recvBody, asyncProducer);
    ok (asyncOut.includes ('a := hVariable[0]') && asyncOut.includes ('b := hVariable[1]'), 'async producer received through listRecv reads natively: ' + asyncOut);
    ok (run (recvBody, asyncProducer.replace ('Value: []any{this.ParseToInt(a), ', 'Value: []any{this.SafeString(m, \"k\"), ')).includes ('a := GetValue(hVariable, 0)'), 'an async slot with a pointer value keeps GetValue');
    ok (hx4G12TupleSlotReads (pos) === pos, 'idempotent');
    ok (formatGoSource ('selftest.go', producer + user ('\thVariable := this.P(nil, p)\n\tb := GetValue(hVariable, 1)\n')).includes ('b := hVariable[1]'), 'wired into formatGoSource');
    const wiredAsync = formatGoSource ('selftest.go', 'package ccxt\n\n' + asyncProducer + 'func (this *X) F(p any) any {\n' + recvBody + '\treturn b\n}\n');
    ok (wiredAsync.includes ('b := hVariable[1]'), 'async producer slot wired into formatGoSource: ' + wiredAsync);
    return problems;
}

// hx4 G15
// closed non-parse `: Str` methods returning a *string on every path print *string (caller locals follow);
// an `undefined` path keeps `any`; `: string[]` never-nil returns print []any
function g15StrReturnSelfTest (): string[] {
    const problems: string[] = [];
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G15-'));
    try {
        const src = path.join (tmp, 'ts', 'src');
        fs.mkdirSync (path.join (src, 'base'), { 'recursive': true });
        fs.writeFileSync (path.join (src, 'base', 'Exchange.ts'), 'export type Dict = { [key: string]: any };\nexport type Str = string | undefined;\n'
            + 'export class Exchange {\n    safeString (a, b, c?): Str { return undefined; }\n}\n');
        fs.writeFileSync (path.join (src, 'ex.ts'), 'import { Exchange, Dict, Str } from \'./base/Exchange\';\nexport class ex extends Exchange {\n'
            + '    encodeSide (side): Str { const sides: Dict = { \'buy\': \'BID\' }; return this.safeString (sides, side, side); }\n'
            + '    maybeSide (side): Str { if (side === undefined) { return undefined; } return this.safeString ({}, side, side); }\n'
            + '    names (): string[] { const out = []; out.push (\'a\'); return out; }\n'
            + '    use (o) { const s = this.encodeSide (o); const m = this.maybeSide (o); const n = this.names (); return [ s, m, n.length ]; }\n}\n');
        const t = new Transpiler ({ 'verbose': false, 'go': {} });
        installCcxtGoLocalTypes (t.goTranspiler);
        installCcxtGoIndexableTypes (t.goTranspiler);
        const go = t.transpileGoByPath (path.join (src, 'ex.ts')).content;
        const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G15: ' + msg); } };
        ok (go.includes ('func (this *ex) EncodeSide(side any) *string {'), 'Str method returning safeString on every path prints *string');
        ok (go.includes ('var s *string = this.EncodeSide(o)'), 'caller local of a *string method is *string');
        ok (go.includes ('func (this *ex) MaybeSide(side any) any {'), 'Str method with an undefined path keeps any');
        ok (go.includes ('func (this *ex) Names() []any {') && go.includes ('var n []any = this.Names()'), 'never-nil string[] return prints []any');
    } catch (e: any) {
        problems.push ('hx4 G15 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}
// hx4 G16
// More `any`-local writes whose box never holds a nil scalar pointer or a typed-nil map/[]any/[]string:
// SortBy2 with a literal key (never its trailing typed-nil return), Safe{Dict,List}* whose default is
// itself such a write.
function hx4G16AnyNilSafeCall (callee: string, args: string[], safeArg: (arg: string) => boolean): boolean {
    if (callee === 'this.SortBy2') {
        return (args.length >= 3) && /^"(?:[^"\\]|\\.)*"$/.test (args[1]);
    }
    if (/^this\.Safe(?:Dict|List)(?:2|N)?$/.test (callee)) {
        const keys = callee.endsWith ('2') ? 3 : 2;
        return (args.length === keys + 1) && safeArg (args[keys]);
    }
    return false;
}

// Omit/OmitDict of a single-declared map[string]any local/param: derefScalar folds a typed-nil map to
// untyped nil, which Omit hands back as is; any other map yields a fresh map
function hx4G16OmitOfTypedMap (rhs: string, fn: string): boolean {
    const m = /^(?:ccxt\.)?this\.Omit(?:Dict)?\((\w+), [^\n]*\)$/.exec (rhs.replace (/\s+\/\/[^"]*$/, '').trim ());
    if ((m === null) || (m[1] === 'this')) {
        return false;
    }
    const n = m[1];
    const sigEnd = fn.indexOf ('{');
    const sigParam = new RegExp ('[(,]\\s*' + n + ' map\\[string\\]any[,)]').test (fn.slice (0, sigEnd));
    const body = fn.slice (sigEnd);
    const vars = body.match (new RegExp ('\\bvar ' + n + ' (\\S+)', 'g')) ?? [];
    const short = body.match (new RegExp ('(?<![.\\w])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfunc\\b[^{\\n]*[(,]\\s*' + n + ' |\\bfor\\b[^\\n{]*\\b' + n + '\\b[^\\n{]*:=\\s*range', 'g')) ?? [];
    const pair = new RegExp ('^\\s*\\w+, ' + n + ' := this\\.HandleOption(?:Bool)?AndParams2?\\(', 'm');
    if (sigParam) {
        return (vars.length === 0) && (short.length === 0);
    }
    if ((vars.length === 1) && (short.length === 0)) {
        return vars[0] === 'var ' + n + ' map[string]any';
    }
    return (vars.length === 0) && (short.length === 1) && pair.test (body) && /HandleOptionBoolAndParams2?\(/.test (body.match (pair)[0]);
}

// OmitDict always returns a fresh map owned by the caller (never a this.* map)
function hx4G16InOpOwnedMapWrite (init: string): boolean {
    return /^this\.OmitDict\(\w+, /.test (init);
}

// exchange_prediction.go bypasses formatGoSource: run the block-scoped len() pass on it too
function hx4G16PredictionBaseLen (content: string): string {
    return g10kLenNative (content);
}

function hx4G16SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G16: ' + msg); } };
    try {
        const nil = (body: string) => goAnyLocalNativeNilCompares ('\nfunc (this *X) f(p any) any {\n' + body + '\tif IsEqual(v, nil) {\n\t}\n\treturn nil\n}\n', 'IsEqual(');
        ok (nil ('\tvar v any = nil\n\tb, q := this.HandleOptionBoolAndParams(p, "m", "o", true)\n\tv = this.Omit(q, "cost")\n\t_ = b\n').includes ('if (v == nil) {'), 'Omit of a HandleOptionBoolAndParams map compares natively');
        ok (nil ('\tvar q map[string]any = MapTyped(p)\n\tvar v any = this.Omit(q, []any{"a"})\n').includes ('if (v == nil) {'), 'Omit of a map local compares natively');
        ok (nil ('\tvar v any = this.Omit(p, "a")\n').includes ('IsEqual(v, nil)'), 'Omit of an any param keeps the helper');
        ok (nil ('\tvar v any = this.Omit(this.Markets, "a")\n').includes ('IsEqual(v, nil)'), 'Omit of a field keeps the helper');
        ok (nil ('\tvar q map[string]any = MapTyped(p)\n\tif true {\n\t\tvar q any = p\n\t\t_ = q\n\t}\n\tvar v any = this.Omit(q, "a")\n').includes ('IsEqual(v, nil)'), 'Omit of a shadowed name keeps the helper');
        ok (nil ('\tvar v any = this.SortBy2(p, "a", "b")\n').includes ('if (v == nil) {'), 'SortBy2 literal key');
        ok (nil ('\tvar v any = this.SafeList(p, "a", this.SafeList(p, "b"))\n').includes ('if (v == nil) {'), 'SafeList with a safe default');
        ok (nil ('\tvar v any = this.SafeDict(p, "a", map[string]any{})\n').includes ('if (v == nil) {'), 'SafeDict literal default still native');
        for (const keep of [
            '\tvar v any = this.SortBy2(p, k, "b")\n',
            '\tvar v any = this.SafeList(p, "a", p)\n',
            '\tvar r []any = ArrayTyped(p)\n\tvar v any = this.SafeList(p, "a", r)\n',
            '\tvar v any = this.SafeDict(p, "a", this.SafeValue(p, "b"))\n',
            '\tvar v any = this.ToArray(p)\n',
            '\tvar v any = this.FilterBy(p, "a", "b")\n',
            '\tvar v any = ObjectKeys(p)\n',
            '\tvar v any = ObjectValues(p)\n',
            '\tvar v any = this.FilterBySinceLimit(p, nil, nil)\n',
        ]) {
            ok (nil (keep).includes ('IsEqual(v, nil)'), 'unproven write keeps the helper: ' + keep.trim ());
        }
        const inop = (body: string) => nativeTypedContainerAccess ('func (this *X) f(p map[string]any) any {\n' + body + '\treturn nil\n}\n');
        ok (inop ('\tvar q map[string]any = this.Extend(map[string]any{}, p)\n\tq = this.OmitDict(q, []any{"a"})\n\tif InOp(q, "symbol") {\n\t}\n').includes ('if _, ok := q["symbol"]; ok {'), 'OmitDict-written map reads natively');
        ok (inop ('\tvar q map[string]any = this.Extend(map[string]any{}, p)\n\tq = this.OmitDict(this.Options, []any{"a"})\n\tif InOp(q, "symbol") {\n\t}\n').includes ('InOp(q, "symbol")'), 'OmitDict of a field keeps the helper');
        ok (inop ('\tvar q map[string]any = this.Extend(map[string]any{}, p)\n\tq = this.Market("a")\n\tif InOp(q, "symbol") {\n\t}\n').includes ('InOp(q, "symbol")'), 'a shared market row keeps the helper');
        ok (inop ('\tif InOp(p, "symbol") {\n\t}\n').includes ('InOp(p, "symbol")'), 'a parameter keeps the helper');
        const len = hx4G16PredictionBaseLen ('\nfunc (this *X) f(optionalArgs ...any) any {\n\tvar outcomes []string = GetArgStringSlice(optionalArgs, 0, nil)\n\tfor i := 0; i < GetArrayLength(outcomes); i++ {\n\t}\n\tvar w any = nil\n\treturn GetArrayLength(w)\n}\n');
        ok (len.includes ('i < len(outcomes)') && len.includes ('GetArrayLength(w)'), 'prediction base len: ' + len);
    } catch (e) {
        problems.push ('hx4 G16 threw: ' + e.message);
    }
    return problems;
}

// hx4 G19
// Add leaves proven non-nil Go strings: `*x` on a once-declared `*string` local/param, `*this.Safe<String>(..)`,
// strings.*/strconv.* string returns, NumberToString, base/same-file methods printed `string`.
function hx4G19PointerLocals (masked: string, fileMasked: string): Set<string> {
    const out = new Set<string> ();
    const braceAt = masked.indexOf ('{');
    const signature = masked.slice (0, braceAt < 0 ? masked.length : braceAt);
    const body = masked.slice (braceAt < 0 ? 0 : braceAt);
    const candidates = new Set<string> ();
    let m: RegExpExecArray | null;
    const varRe = /\bvar (\w+) \*string\b/g;
    while ((m = varRe.exec (masked)) !== null) { candidates.add (m[1]); }
    const paramRe = /[(,]\s*(\w+) \*string(?=[,)])/g;
    while ((m = paramRe.exec (signature)) !== null) { candidates.add (m[1]); }
    for (const name of candidates) {
        const decls = (masked.match (new RegExp ('\\bvar ' + name + '\\b', 'g')) || []).length;
        const inSig = new RegExp ('[(,]\\s*' + name + ' \\*string(?=[,)])').test (signature) ? 1 : 0;
        const otherParam = new RegExp ('[(,]\\s*' + name + ' (?!\\*string[,)])').test (signature);
        const shorts = new RegExp ('\\b' + name + '\\s*(,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(,\\s*\\w+\\s*)*:=').test (masked);
        const lits = new RegExp ('\\bfunc\\s*\\([^)]*\\b' + name + '\\b').test (body);
        const global = new RegExp ('^(var|const|func) ' + name + '\\b', 'm').test (fileMasked);
        if (decls + inSig === 1 && !otherParam && !shorts && !lits && !global) { out.add (name); }
    }
    return out;
}

// `*string` locals nil-tested before the read at `at`: an enclosing `if x != nil {` (&& conjunct) or a
// dominating `if x == nil {...return|panic|continue|break}` (|| part); no write of x after the test.
function hx4G19GuardedLocals (masked: string, at: number, locals: Set<string>): Set<string> {
    const names = [ ...locals ].filter ((n) => n.startsWith ('*')).map ((n) => n.slice (1)).filter ((n) => !locals.has ('!' + n));
    if (names.length === 0) { return locals; }
    const lines = masked.slice (0, at).split ('\n');
    const all = masked.split ('\n');
    const k = lines.length - 1;
    const out = new Set (locals);
    for (const name of names) {
        if (new RegExp ('&' + name + '\\b').test (masked)) { continue; }
        const write = new RegExp ('(?<![\\w.*])' + name + '\\s*=(?!=)');
        const nilTest = (cond: string, op: string, conj: string) => goMapWriteTopLevelParts (cond, conj).some ((p) => new RegExp ('^\\(?\\s*' + name + ' ' + op + ' nil\\s*\\)?$').test (p.trim ()));
        let depth = 0;
        let found = -1;
        for (let j = k; j > 0 && found < 0; j--) {
            const line = lines[j];
            let opens = 0;
            for (let c = line.length - 1; c >= 0; c--) {
                if (line[c] === '}') { depth++; } else if (line[c] === '{') { depth--; if (depth < 0) { opens++; depth = 0; if (/\bfunc\s*\(/.test (line)) { j = 0; break; } } }
            }
            if (j === 0) { break; }
            const head = /^\s*if (.*) \{\s*$/.exec (line);
            if (opens > 0 && head !== null && nilTest (head[1], '!=', '&&')) { found = j; break; }
            // a closed sibling `if x == nil { ...exit }` at this block level
            if (depth === 1 && /^\s*\}\s*$/.test (line) && opens === 0) {
                let d = 0;
                let i = j;
                for (; i > 0; i--) { d += (lines[i].split ('}').length - 1) - (lines[i].split ('{').length - 1); if (d === 0) { break; } }
                const h = /^\s*if (.*) \{\s*$/.exec (lines[i]);
                const last = (lines[j - 1] || '').trim ();
                if (h !== null && nilTest (h[1], '==', '||') && /^(return\b|panic\(|continue$|break$)/.test (last)) { found = i; break; }
            }
        }
        if (found < 0) { continue; }
        // any write after the test, up to the end of the function (a loop can carry it back to the read)
        if (all.slice (found + 1).some ((l) => write.test (l)) || write.test (all[found].replace (/==|!=/g, '  '))) { continue; }
        out.add ('!' + name);
    }
    return out;
}

function hx4G19RecordMethod (overridden: Set<string>, name: string, ret: string): void {
    if (ret === 'string') { overridden.add ('+' + name); } else if (ret === '*string') { overridden.add ('*' + name); }
}

function hx4G19StringLeaf (t: string, mt: string, locals: Set<string>, overridden: Set<string>): boolean {
    if (/^\*\w+$/.test (t)) { return locals.has (t); }
    const call = t.match (/^(\*?)(this\.(\w+)|(?:ccxt\.)?(NumberToString)|(strings)\.(\w+)|(strconv)\.(\w+))\(/);
    if (!call || goAddCloseParen (mt, mt.indexOf ('(')) !== mt.length - 1) { return false; }
    const deref = call[1] === '*';
    if (call[4] !== undefined) { return !deref; }
    if (call[5] !== undefined) { return !deref && [ 'ToUpper', 'ToLower', 'Join', 'ReplaceAll', 'Replace', 'TrimSpace', 'Trim', 'TrimPrefix', 'TrimSuffix', 'TrimLeft', 'TrimRight', 'Repeat' ].indexOf (call[6]) >= 0; }
    if (call[7] !== undefined) { return !deref && [ 'FormatInt', 'FormatFloat', 'Itoa', 'Quote' ].indexOf (call[8]) >= 0; }
    const name = call[3];
    const own = overridden.has ('+' + name) || overridden.has ('*' + name);
    const sameFile = deref ? overridden.has ('*' + name) : overridden.has ('+' + name);
    if (overridden.has (name)) { return deref && sameFile && !overridden.has ('+' + name); }
    if (sameFile) { return true; }
    if (own) { return false; }
    const baseString = [ 'Ymdhms', 'Uuid5', 'Encode', 'Decode', 'StringToBase64', 'BinaryToBase64', 'ImplodeHostname', 'Json', 'Hmac', 'Urlencode', 'Rawencode', 'Yymmdd', 'Ymd', 'Yyyymmdd', 'Uuid', 'Uuid16', 'Uuid22', 'Uuid2', 'ImplodeParams' ];
    const basePointer = [ 'SafeString', 'SafeString2', 'SafeStringN', 'SafeStringLower', 'SafeStringLower2', 'SafeStringLowerN', 'SafeStringUpper', 'SafeStringUpper2', 'SafeStringUpperN', 'NumberToString', 'Iso8601' ];
    return deref ? basePointer.indexOf (name) >= 0 : baseString.indexOf (name) >= 0;
}

function hx4G19SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G19: ' + msg); } };
    const f = (body: string, sig = '', extra = '') => goNativeStringAdds ('package ccxt\n\n' + extra + 'func (this *X) f(' + sig + ') any {\n' + body + '}\n');
    ok (f ('\tvar s *string = this.SafeString(p, "k")\n\treturn Add(Add("a.", *s), ".b")\n').indexOf ('return "a." + *s + ".b"') >= 0, '*string local deref goes native');
    ok (f ('\treturn ccxt.Add("a", *s)\n', 's *string').indexOf ('return "a" + *s') >= 0, '*string param deref (ccxt.Add)');
    ok (f ('\treturn Add(*base+"/"+*quote+":", settle)\n', 'base *string, quote *string, settle string').indexOf ('return *base + "/" + *quote + ":" + settle') >= 0, 'inner deref sum');
    ok (f ('\treturn Add(strings.ToUpper(x), strconv.FormatInt(1, 10))\n').indexOf ('return strings.ToUpper(x) + strconv.FormatInt(1, 10)') >= 0, 'strings/strconv calls');
    ok (f ('\treturn Add(*this.SafeString(p, "k", ""), this.Uuid())\n').indexOf ('return *this.SafeString(p, "k", "") + this.Uuid()') >= 0, 'deref SafeString and Uuid');
    ok (f ('\treturn Add("a", this.G())\n', '', 'func (this *X) G() string {\n\treturn ""\n}\n\n').indexOf ('return "a" + this.G()') >= 0, 'same-file string method');
    ok (f ('\treturn Add("a", this.G())\n', '', 'func (this *X) G() any {\n\treturn ""\n}\n\n').indexOf ('Add("a", this.G())') >= 0, 'same-file any method keeps Add');
    ok (f ('\treturn Add("a", *this.Json(1))\n', '', 'func (this *X) Json(o any) *int64 {\n\treturn nil\n}\n\n').indexOf ('Add("a", *this.Json(1))') >= 0, 'deref of non-string method keeps Add');
    ok (f ('\tvar s *int64 = nil\n\treturn Add("a", *s)\n').indexOf ('Add("a", *s)') >= 0, '*int64 deref keeps Add');
    ok (f ('\tvar s *string = nil\n\tif true {\n\t\tvar s *int64 = nil\n\t\t_ = s\n\t}\n\treturn Add("a", *s)\n').indexOf ('Add("a", *s)') >= 0, 'shadowed pointer keeps Add');
    ok (f ('\treturn Add("a", this.SafeString(p, "k"))\n').indexOf ('Add("a", this.SafeString(p, "k"))') >= 0, 'non-deref *string keeps Add');
    ok (f ('\treturn Add("a", strings.Split(x, ","))\n').indexOf ('Add("a", strings.Split(') >= 0, 'strings.Split keeps Add');
    ok (f ('\tvar s *string = this.SafeString(p, "k", "")\n\ts = this.SafeString2(p, "a", "b", "x")\n\treturn Add("a", s)\n').indexOf ('return "a" + *s') >= 0, 'literal-default *string derefs');
    ok (f ('\tvar s *string = this.SafeString(p, "k", "")\n\ts = this.SafeString(p, "a")\n\treturn Add("a", s)\n').indexOf ('Add("a", s)') >= 0, 'nil-able write keeps Add');
    ok (f ('\treturn Add("a", s)\n', 's *string').indexOf ('Add("a", s)') >= 0, '*string param without deref keeps Add');
    const g = (body: string) => f ('\tvar s *string = this.SafeString(p, "k")\n' + body);
    ok (g ('\tif s != nil {\n\t\treturn Add("a", s)\n\t}\n\treturn nil\n').indexOf ('return "a" + *s') >= 0, 'enclosing != nil guard');
    ok (g ('\tif (s == nil) || (p == nil) {\n\t\treturn nil\n\t}\n\treturn Add("a", s)\n').indexOf ('return "a" + *s') >= 0, 'dominating early exit');
    ok (g ('\tfor {\n\t\tif s == nil {\n\t\t\tcontinue\n\t\t}\n\t\tx = Add("a", s)\n\t}\n').indexOf ('x = "a" + *s') >= 0, 'continue exit in loop');
    ok (g ('\tif s == nil {\n\t\tx = 1\n\t}\n\treturn Add("a", s)\n').indexOf ('Add("a", s)') >= 0, 'non-exiting nil branch keeps Add');
    ok (g ('\tif s != nil {\n\t\ts = this.SafeString(p, "j")\n\t\treturn Add("a", s)\n\t}\n\treturn nil\n').indexOf ('Add("a", s)') >= 0, 'write after guard keeps Add');
    ok (g ('\tif s != nil {\n\t\tx = 1\n\t}\n\treturn Add("a", s)\n').indexOf ('Add("a", s)') >= 0, 'read after closed guard keeps Add');
    ok (g ('\tif s != nil {\n\t\tf := func() any {\n\t\t\treturn Add("a", s)\n\t\t}\n\t}\n').indexOf ('Add("a", s)') >= 0, 'closure under guard keeps Add');
    ok (g ('\tif s != nil || p != nil {\n\t\treturn Add("a", s)\n\t}\n\treturn nil\n').indexOf ('Add("a", s)') >= 0, '|| guard keeps Add');
    ok (g ('\tif s == nil {\n\t\treturn nil\n\t}\n\tfor {\n\t\tx = Add("a", s)\n\t\ts = this.SafeString(p, "j")\n\t}\n').indexOf ('Add("a", s)') >= 0, 'loop write after the read keeps Add');
    ok (g ('\tif s == nil {\n\t\treturn nil\n\t}\n\tvar q any = &s\n\treturn Add("a", s)\n').indexOf ('Add("a", s)') >= 0, 'address taken keeps Add');
    ok (formatGoSource ('selftest.go', 'package ccxt\n\nfunc (this *X) f(s *string) any {\n\treturn Add("a", *s)\n}\n').indexOf ('"a" + *s') >= 0, 'wired through formatGoSource');
    return problems;
}

// hx4 G20
// exchange_generated.go / exchange_prediction.go bypass formatGoSource: run its typed-receiver native passes on them
function hx4G20BaseNativePasses (content: string): string {
    content = hx11w8NonceInt64 (content);  // hx11 w8 m172
    content = nativeLoopBoundedSliceReads (retagLoopBoundedElementReads (content));
    content = hx10w10Gp26TypedReads (content);  // hx10w10 GP26: GetValue on a declared map local (base files bypass formatGoSource)
    hx4G34TupleSlotNeverNil.file = goTextMaskLiteralsAndComments (content).split ('\n');  // hx4 G34
    content = g06MapReads (content);  // hx10w2 G06
    content = nativeTypedContainerAccess (g10kAddElemRetypeMapLocals (content));
    content = hx4G25Pass (content);  // hx4 G25
    content = hx4G29Pass (content);  // hx4 G29
    hx4G34TupleSlotNeverNil.file = undefined;  // hx4 G34
    content = h2kG13NativeKeysAndRemove (hx4G07FieldInOp (w8ClientTableCalls (w8ClientFuturesReads (w8FuturesPairInOp (g10kInopClientMaps (content))))));
    content = g09w3Pass (content);  // hx10w3 G09: prediction caches are typed maps
    content = hx5P28BaseFieldReads (content);  // hx5 P28
    content = hx4G38Pass (hx4G33IsEqual (hx4G28IsEqualSafe (content)));  // hx4 G28, G33, G38
    content = g10kLenNative (goNativeStringAdds (hx4G32Comparisons (hx4G31Divide (hx4G27Comparisons (hx4G23Comparisons (hx4G18NativeCompare (hx4G30Arith (content))))))));  // hx4 G27..G32
    content = hx10G03Pass (content);  // hx10 G03
    content = hx10w2G04 (content);  // hx10 G04
    content = hx10w3G10 (content);  // hx10w3 G10
    content = hx10OG02Pass (content);  // hx10 wave-4 OG02: these two base files bypass formatGoSource
    content = hx10OG05Pass (content);  // hx10 w7 OG05: base/quote currencies + transactions published
    content = g01UrlsViews (content);  // hx10w5 G01: typed urls views + the refreshes after each urls write
    content = og02IdBookPass (content);  // hx10w6 OG02: base cleanRestData + incrementingNonce hand off to the request book owner
    content = hx11m36MarketsByIdInOp (content);  // hx11 m36
    content = g09Pass (content);  // hx10w2 G09
    content = nativeGuardedListElementReads (content);  // hx11 w4 P2: the guard literals in the base files too
    return gb09CredentialStrings (content);  // hx10 w9 GB09: the credential fields are plain strings
    return g10kLenNative (goNativeStringAdds (goNativeArithmetic (content)));
}

function hx4G20SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G20: ' + msg); } };
    try {
        const head = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\n';
        const run = (body: string) => hx4G20BaseNativePasses (head + 'func (this *PredictionExchange) F(m map[string]any, p any) any {\n' + body + '\treturn nil\n}\n');
        const loop = run ('\tvar keys []string = ObjectKeys(m)\n\tfor i := 0; i < len(keys); i++ {\n\t\tvar k string = GetValue(keys, i).(string)\n\t\t_ = k\n\t}\n');
        ok (loop.includes ('var k string = keys[i]'), 'loop-bounded []string read goes native: ' + loop);
        ok (!loop.includes ('ObjectKeys(m)'), 'ObjectKeys on a typed map param goes native: ' + loop);
        const keep = run ('\tfor i := 0; i < GetArrayLength(p); i++ {\n\t\t_ = GetValue(p, i)\n\t}\n');
        ok (keep.includes ('GetArrayLength(p)') && keep.includes ('GetValue(p, i)'), 'any receiver keeps the helpers: ' + keep);
    } catch (e) {
        problems.push ('hx4 G20 threw: ' + e.message);
    }
    return problems;
}

// hx4 G21: `var x *int64 = this.SafeInteger(o, k, 5)` -> `var x int64 = *this.SafeInteger(o, k, 5)` when the
// literal default makes the pointer never nil and every read is `*x`, a leading `x != nil &&` / `x == nil ||`
// guard (dropped), or a direct operand of a numeric helper that derefScalars it (same value either way)
function hx4G21Helpers (): string { return 'Add|Subtract|Multiply|Divide|Mod|IsEqual|IsGreaterThan|IsLessThan|IsGreaterThanOrEqual|IsLessThanOrEqual|MathMin|MathMax'; }

function hx4G21UnboxFunc (lines: string[], masked: string[], start: number, end: number) {
    const decl = /^(\t+var )(\w+) \*int64 = (this\.(SafeInteger2?)\()/;
    for (let d = start + 1; d < end; d++) {
        const m = decl.exec (masked[d]);
        if (m === null) {
            continue;
        }
        const open = m[0].length - 1;
        const parsed = h2kG16Args (lines[d], masked[d], open);
        if ((parsed === undefined) || (parsed.end !== masked[d].length - 1) || (parsed.args.length !== ((m[4] === 'SafeInteger') ? 3 : 4))
            || !/^-?(?:0|[1-9]\d{0,8})$/.test (parsed.args[parsed.args.length - 1])) {
            continue;
        }
        const n = m[2];
        const body = masked.slice (start, end + 1).join ('\n');
        const binds = body.match (new RegExp ('\\bvar ' + n + '\\b|(?<![\\w.])' + n + '\\s*(?:,[^=\\n]*)?:=|[(,]\\s*' + n + ' [\\w*\\[\\].]+\\s*[,)]|&' + n + '\\b', 'g')) || [];
        if ((binds.length !== 1) || new RegExp ('(?<![\\w.*])' + n + '\\s*(?:[-+*/%|&^]?=(?!=)|\\+\\+|--)').test (body.replace (/^\t*var \w+ [^=\n]*= /gm, ''))) {
            continue;   // a parameter, a shadow, an address, or a later write
        }
        // proven-true guards: `x != nil &&` anywhere (&& binds tighter), `x == nil ||` only at an expression start
        const guards = [
            new RegExp ('(?<![\\w.])\\(' + n + ' != nil\\) && ', 'g'),
            new RegExp ('(?<![\\w.(*])' + n + ' != nil && ', 'g'),
            new RegExp ('(?<=(?:^\\s*|\\(|\\bif |; |= |return ))\\(' + n + ' == nil\\) \\|\\| ', 'g'),
            new RegExp ('(?<=(?:^\\s*|\\(|\\bif |; |= |return ))' + n + ' == nil \\|\\| ', 'g'),
        ];
        const helperArg = new RegExp ('(?<![\\w.])(?:ccxt\\.)?(?:' + hx4G21Helpers () + ')\\($');
        const out: string[] = [];
        let ok = true;
        for (let k = d + 1; (k < end) && ok; k++) {
            let text = lines[k];
            let mk = masked[k];
            for (const g of guards) {
                for (const h of [ ...mk.matchAll (g) ].reverse ()) {
                    text = text.substring (0, h.index) + text.substring (h.index + h[0].length);
                    mk = mk.substring (0, h.index) + mk.substring (h.index + h[0].length);
                }
            }
            for (const u of [ ...mk.matchAll (new RegExp ('(?<![\\w.])' + n + '\\b', 'g')) ].reverse ()) {
                const at = u.index;
                if ((at > 0) && (mk[at - 1] === '*') && !/(?:[)\]]|(?<![\w.])(?!(?:if|for|return|case|switch|go|defer)\b)\w+)\s*$/.test (mk.substring (0, at - 1))) {
                    text = text.substring (0, at - 1) + text.substring (at);
                    mk = mk.substring (0, at - 1) + mk.substring (at);
                    continue;
                }
                const opener = h2kG16Opener (mk, at);
                const direct = (opener !== undefined) && helperArg.test (opener.prefix) && /^\s*[,)]/.test (mk.substring (at + n.length))
                    && /(?:\(|, )$/.test (mk.substring (0, at)) && !/,/.test (mk.substring (opener.index + 1, at).replace (/\([^()]*\)/g, '').replace (/, $/, ''));
                if (!direct) {
                    ok = false;
                    break;
                }
            }
            out.push (text);
        }
        if (!ok) {
            continue;
        }
        for (let k = d + 1; k < end; k++) {
            lines[k] = out[k - d - 1];
            masked[k] = goTextMaskLiteralsAndComments (lines[k]);
        }
        lines[d] = m[1] + n + ' int64 = *' + lines[d].substring (m[1].length + n.length + ' *int64 = '.length);
        masked[d] = goTextMaskLiteralsAndComments (lines[d]);
    }
}

function hx4G21UnboxDefaultedSafeInteger (content: string): string {
    if (content.indexOf ('*int64 = this.SafeInteger') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            hx4G21UnboxFunc (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

// hx11 printer-go-ternary-closure-int64: `m[k] = cond ? p : a + b` over a `*int64` local `p` and int64 locals
// printed `m[k] = func() any { if p != nil { return p }; return this.Sum(a, b) }()`. Prints the native
// if/else instead: the nil guard proves `*p`, and Sum of two declared int64 locals is `a + b`.
function hx11TernaryInt64Closure (content: string): string {
    if (!/= func\(\) any \{\n\s+if \w+ != nil \{\n\s+return \w+\n/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const out: string[] = [];
    let fnStart = 0;
    for (let i = 0; i < lines.length; i++) {
        if (/^func /.test (lines[i])) { fnStart = i; }
        const head = /^(\t+)(\w+\[\"[^\"\\\n]*\"\]) = func\(\) any \{$/.exec (lines[i]);
        if ((head !== null) && (i + 6 < lines.length)) {
            const ind = head[1];
            const guard = new RegExp ('^' + ind + '\\tif (\\w+) != nil \\{$').exec (masked[i + 1]);
            const ret = guard === null ? null : new RegExp ('^' + ind + '\\t\\treturn ' + guard[1] + '$').exec (masked[i + 2]);
            const sum = /^\t+return this\.Sum\((\w+), (\w+)\)$/.exec (masked[i + 4]);
            if ((guard !== null) && (ret !== null) && (sum !== null) && (masked[i + 3] === ind + '\t}') && (masked[i + 5] === ind + '}()')) {
                let fnEnd = i;
                while ((fnEnd < lines.length) && (lines[fnEnd] !== '}')) { fnEnd++; }
                const body = masked.slice (fnStart, fnEnd).join ('\n');
                const declared = (n: string, t: string) => new RegExp ('\\bvar ' + n + ' ' + t.replace ('*', '\\*') + ' (?:=|\\n)').test (body);
                if (declared (guard[1], '*int64') && declared (sum[1], 'int64') && declared (sum[2], 'int64')) {
                    out.push (ind + 'if ' + guard[1] + ' != nil {');
                    out.push (ind + '\t' + head[2] + ' = *' + guard[1]);
                    out.push (ind + '} else {');
                    out.push (ind + '\t' + head[2] + ' = ' + sum[1] + ' + ' + sum[2]);
                    out.push (ind + '}');
                    i += 5;
                    continue;
                }
            }
        }
        out.push (lines[i]);
    }
    return out.join ('\n');
}

function hx4G21SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, label: string) => { if (!c) { problems.push ('hx4 G21: ' + label); } };
    const f = (body: string, sig = '') => hx4G21UnboxDefaultedSafeInteger ('func (this *X) f(' + sig + ') any {\n' + body + '}\n');
    try {
        let r = f ('\tvar m *int64 = this.SafeInteger(t, "E", 0)\n\tvar ts int64 = this.ParseToInt(float64(*m) / 1000)\n');
        ok (r.includes ('var m int64 = *this.SafeInteger(t, "E", 0)') && r.includes ('float64(m) / 1000'), 'deref read: ' + r);
        r = f ('\tvar u *int64 = this.SafeInteger(this.Options, "u", 6)\n\tif u == nil || *u < 5 {\n\t}\n\tif (c != nil && *c == "i") && (u == nil || *u < 5) {\n\t}\n');
        ok (r.includes ('\tif u < 5 {') && r.includes ('&& (u < 5) {'), 'leading nil guard dropped: ' + r);
        r = f ('\tvar e *int64 = this.SafeInteger(this.Options, "s", 0)\n\tif (e != nil) && IsGreaterThan(e, now+10000) {\n\t}\n\tvar s any = ccxt.Add(e, 1)\n');
        ok (r.includes ('var e int64') && r.includes ('if IsGreaterThan(e, now+10000) {') && r.includes ('ccxt.Add(e, 1)'), 'helper operands: ' + r);
        r = f ('\tvar r *int64 = this.SafeInteger2(o, "a", "b", 0)\n\tfor i := 0; r != nil && int64(i) < *r; i++ {\n\t}\n');
        ok (r.includes ('var r int64 = *this.SafeInteger2') && r.includes ('for i := 0; int64(i) < r; i++ {'), 'SafeInteger2 for guard: ' + r);
        for (const keep of [
            '\tvar x *int64 = this.SafeInteger(o, "a")\n\t_ = *x\n',                        // no default: may be nil
            '\tvar x *int64 = this.SafeInteger(o, "a", d)\n\t_ = *x\n',                      // non-literal default
            '\tvar x *int64 = this.SafeInteger(o, "a", 1.5)\n\t_ = *x\n',                    // float default
            '\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\tc := ccxt.NewArrayCache(x)\n',  // pointer handed on
            '\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\tif x == nil {\n\t}\n',           // bare nil test
            '\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\tif a && x == nil || *x > 1 {\n\t}\n', // guard not leading
            '\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\tx = this.SafeInteger(o, "b")\n',   // rewritten
            '\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\tp := &x\n',
            '\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\tvar s any = Add(x, this.F(x))\n',  // nested non-helper arg
            '\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\treturn x\n',
        ]) {
            ok (f (keep).includes ('var x *int64'), 'keeps pointer: ' + JSON.stringify (keep));
        }
        ok (f ('\tvar x *int64 = this.SafeInteger(o, "a", 0)\n\t_ = *x\n', 'x any').includes ('var x *int64'), 'parameter name keeps pointer');
        ok (formatGoSource ('selftest.go', 'func (this *X) f() any {\n\tvar m *int64 = this.SafeInteger(t, "E", 0)\n\treturn float64(*m)\n}\n').includes ('var m int64 = *this.SafeInteger'), 'wired into formatGoSource');
    } catch (e) {
        problems.push ('hx4 G21 threw: ' + e.message);
    }
    return problems;
}
// hx4 G22: `limit === undefined ? D : limit` over a `*int64` param types as `int64` when every read is a helper argument
function hx4G22SelfTest (): string[] {
    const problems: string[] = [];
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G22-'));
    try {
        const src = path.join (tmp, 'ts', 'src');
        fs.mkdirSync (path.join (src, 'base'), { 'recursive': true });
        fs.writeFileSync (path.join (src, 'base', 'Exchange.ts'), 'export type Int = number | undefined;\nexport class Exchange {\n    sum (a, b) { return a; }\n    parseTimeframe (t): number { return 60; }\n}\n');
        fs.writeFileSync (path.join (src, 'ex.ts'), 'import { Exchange, Int } from \'./base/Exchange\';\nexport class ex extends Exchange {\n'
            + '    a (since: Int = undefined, limit: Int = undefined) { const duration = this.parseTimeframe (\'1m\'); const lr = (limit === undefined) ? 200 : limit; return this.sum (since, lr * duration * 1000); }\n'
            + '    b (since: Int = undefined, limit: Int = undefined) { const lr = (limit === undefined) ? 200 : limit; lr.toString (); return lr; }\n'
            + '    c (since: Int = undefined, limit: Int = undefined) { const d = (since === undefined) ? limit : 5; return d; }\n}\n');
        const t = new Transpiler ({ 'verbose': false, 'go': {} });
        installCcxtGoLocalTypes (t.goTranspiler);
        installCcxtGoIndexableTypes (t.goTranspiler);
        const go = t.transpileGoByPath (path.join (src, 'ex.ts')).content;
        const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G22: ' + msg); } };
        ok (/var lr int64 = func\(\) int64 \{[\s\S]*?return \*limit/.test (go), 'defaulted *int64 read only as a helper argument types int64: ' + go);
        ok (!/var d int64/.test (go), 'a non-defaulting shape keeps its type');
    } catch (e: any) {
        problems.push ('hx4 G22 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}

// hx4 G24
// Row-string Add leaves `m["symbol"].(string)` / `c["id"|"code"].(string)`: TS types them non-optional `string`, rows are
// plain (MarketTyped/CurrencyTyped). Every write of the local must be this.Market (resp.
// this.Currency), which panic instead of answering a missing row; `id`/`baseId`/`quoteId` are `Str` and keep Add.
function hx4G24RowLocals (fn: string, masked: string, fileMasked: string): Set<string> {
    const out = new Set<string> ();
    const braceAt = masked.indexOf ('{');
    const signature = masked.slice (0, braceAt < 0 ? masked.length : braceAt);
    const body = masked.slice (braceAt < 0 ? 0 : braceAt);
    const kinds: [string, string[], string][] = [ [ 'Market', [ 'symbol' ], 'm' ], [ 'Currency', [ 'id', 'code' ], 'c' ] ];
    const declRe = /\bvar (\w+) map\[string\]any = /g;
    let m: RegExpExecArray | null;
    while ((m = declRe.exec (body)) !== null) {
        const name = m[1];
        if ((body.match (new RegExp ('\\bvar ' + name + '\\b', 'g')) || []).length !== 1) { continue; }
        if (new RegExp ('[(,]\\s*' + name + '\\b').test (signature) || new RegExp ('^(var|const|func) ' + name + '\\b', 'm').test (fileMasked)) { continue; }
        if (new RegExp ('&' + name + '\\b|\\b' + name + '\\s*(,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(,\\s*\\w+\\s*)*:=|\\bfunc\\s*\\([^)]*\\b' + name + '\\b|AddElementToObject\\(' + name + '\\b').test (body)) { continue; }
        // every write: `[var name map[string]any ]name = <rhs>` as a whole statement
        const writes = [ ...body.matchAll (new RegExp ('(?<![\\w.\\]])' + name + '\\s*(?:map\\[string\\]any)?(\\[[^\\n]*?\\])?\\s*=(?!=)([^\\n]*)', 'g')) ];
        for (const [ fns, keys, tag ] of kinds) {
            const okRhs = (w: RegExpMatchArray): boolean => {
                if (w[1] !== undefined) { return true; }
                const rhs = w[2].trim ();
                const call = new RegExp ('^(ccxt\\.)?this\\.(' + fns + ')\\(').exec (rhs);
                return (call !== null) && (goAddCloseParen (rhs, call[0].length - 1) === rhs.length - 1);
            };
            if ((writes.length === 0) || !writes.every (okRhs)) { continue; }
            for (const key of keys) {
                // an index write of this key (text, not masked: the key is a literal) may store a non-string
                if (new RegExp ('(?<![\\w.])' + name + '\\["' + key + '"\\]\\s*=(?!=)').test (fn)) { continue; }
                out.add ('#' + tag + ':' + name + ':' + key);
            }
        }
    }
    return out;
}

function hx4G24RowLeaf (t: string, locals: Set<string>): boolean {
    const r = /^(\w+)\["(\w+)"\]$/.exec (t);
    return (r !== null) && (locals.has ('#m:' + r[1] + ':' + r[2]) || locals.has ('#c:' + r[1] + ':' + r[2]));
}

function hx4G24SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G24: ' + msg); } };
    const f = (body: string, sig = '') => goNativeStringAdds ('package ccxt\n\nfunc (this *X) f(' + sig + ') any {\n' + body + '}\n');
    try {
        let r = f ('\tvar market map[string]any = this.Market(symbol)\n\tvar h any = Add("ticker:", market["symbol"])\n\treturn h\n');
        ok (r.includes ('var h any = "ticker:" + market["symbol"].(string)'), 'Market symbol native: ' + r);
        r = f ('\tvar market map[string]any = nil\n\tmarket = this.Market(symbol)\n\treturn Add("a", market["symbol"])\n');
        ok (r.includes ('Add("a", market["symbol"])'), 'nil write keeps Add');
        r = f ('\tvar market map[string]any = this.Market(id)\n\tif x {\n\t\tmarket = this.Market(s)\n\t}\n\tpanic(Add(this.Id+" ", market["symbol"]))\n');
        ok (r.includes ('panic(this.Id + " " + market["symbol"].(string))'), 'Market rewrites native: ' + r);
        ok (f ('\tvar market map[string]any = this.SafeMarket(id)\n\treturn Add("a", market["symbol"])\n').includes ('Add("a", market'), 'SafeMarket keeps Add');
        r = f ('\tvar currency map[string]any = this.Currency(code)\n\treturn Add(Add(currency["id"], "-"), currency["code"])\n');
        ok (r.includes ('return currency["id"].(string) + "-" + currency["code"].(string)'), 'Currency id/code native: ' + r);
        for (const keep of [
            '\tvar market map[string]any = this.Market(s)\n\treturn Add("a", market["id"])\n',                  // id is Str
            '\tvar market map[string]any = this.Market(s)\n\treturn Add("a", market["baseId"])\n',
            '\tvar market map[string]any = GetArgMap(optionalArgs, 0, nil)\n\treturn Add("a", market["symbol"])\n',
            '\tvar market map[string]any = this.Market(s)\n\tmarket = this.Extend(market, p)\n\treturn Add("a", market["symbol"])\n',
            '\tvar market map[string]any = this.Market(s)\n\tmarket["symbol"] = x\n\treturn Add("a", market["symbol"])\n',
            '\tvar market map[string]any = this.Market(s)\n\tAddElementToObject(market, "symbol", x)\n\treturn Add("a", market["symbol"])\n',
            '\tvar market map[string]any = this.Market(s)\n\tif t {\n\t\tmarket := p\n\t\t_ = market\n\t}\n\treturn Add("a", market["symbol"])\n',
            '\tvar market map[string]any = this.Market(s)["info"]\n\treturn Add("a", market["symbol"])\n',
            '\tvar currency map[string]any = this.Market(s)\n\treturn Add("a", currency["code"])\n',            // market row has no code
            '\tvar market map[string]any = this.Currency(s)\n\treturn Add("a", market["symbol"])\n',
            '\tvar market map[string]any = this.Market(s)\n\treturn Add("a", market["symbol"]) == nil\n',
        ]) {
            ok (f (keep).includes ('Add("a", '), 'keeps Add: ' + JSON.stringify (keep));
        }
        ok (f ('\treturn Add("a", market["symbol"])\n', 'market map[string]any').includes ('Add("a", market["symbol"])'), 'param keeps Add');
    } catch (e) {
        problems.push ('hx4 G24 threw: ' + e.message);
    }
    return problems;
}

// hx4 G25
// Block-scoped declarations: a name declared in several sibling blocks resolves at line k when exactly
// one of its declarations has a scope reaching k; the typed-container rewriters and typed-nil
// IsEqual then run with that declaration (the function-wide resolver gives up on any shadowed name).
function hx4G25Paths (masked: string[], start: number, end: number): number[][] {
    const paths: number[][] = [];
    const stack: number[] = [];
    let id = 0;
    for (let k = start; k <= end; k++) {
        paths[k] = stack.slice ();
        for (const c of masked[k]) {
            if (c === '{') {
                stack.push (++id);
            } else if ((c === '}') && (stack.length > 0)) {
                stack.pop ();
            }
        }
    }
    return paths;
}

function hx4G25Scope (masked: string[], start: number, end: number) {
    const paths = hx4G25Paths (masked, start, end);
    const fnPath = paths[start + 1] ?? [];
    const lineOffsets: number[] = [];
    let offset = 0;
    for (let k = start; k <= end; k++) {
        lineOffsets.push (offset);
        offset += masked[k].length + 1;
    }
    const inScope = (j: number, k: number) => {
        if ((j >= k) || (paths[j].length > paths[k].length) || !paths[j].every ((b, i) => paths[k][i] === b)) {
            return false;
        }
        // brace-less case clauses: a later clause of the same switch is a new scope
        for (let c = j + 1; c < k; c++) {
            if ((paths[c].length === paths[j].length) && /^\s*(?:case\b|default:)/.test (masked[c])) {
                return false;
            }
        }
        return true;
    };
    const cache = new Map<string, any> ();
    return (name: string, k: number): any => {
        const key = name + '@' + k;
        if (cache.has (key)) {
            return cache.get (key);
        }
        const n = goAccessEscape (name);
        const varRx = new RegExp ('^\\s*var\\s+' + n + '\\s+([^=]+?)\\s*(?:=|$)');
        const otherRx = new RegExp ('(?:^|[^\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfunc\\s*\\([^)]*\\b' + n + '\\b');
        const sig = masked[start];
        const sigParams = sig.substring (sig.indexOf ('(', sig.startsWith ('func (') ? sig.indexOf (')') + 1 : 0));
        let found: any = undefined;
        const sigParam = new RegExp ('[(,]\\s*' + n + '\\s+([^,()]+?)\\s*[,)]').exec (sigParams);
        let reaching = (sigParam !== null) ? 1 : 0;
        if (sigParam !== null) {
            found = { 'type': sigParam[1].trim (), 'init': undefined };
        }
        for (let j = start + 1; (j < end) && (reaching < 2); j++) {
            const v = varRx.exec (masked[j]);
            if ((v === null) && !otherRx.test (masked[j])) {
                continue;
            }
            // a func-literal parameter or a `:=` (incl. if/for headers) is never a resolved declaration
            if ((v === null) || otherRx.test (masked[j]) || (paths[j].length < fnPath.length)) {
                reaching += 2;
                break;
            }
            if (inScope (j, k)) {
                reaching++;
                found = { 'type': v[1].trim (), 'index': lineOffsets[j - start] + masked[j].indexOf ('var'), 'line': masked[j], 'at': j };
            }
        }
        const out = (reaching === 1) ? found : undefined;
        cache.set (key, out);
        return out;
    };
}

function hx4G25Func (lines: string[], masked: string[], start: number, end: number) {
    const resolve = hx4G25Scope (masked, start, end);
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const notRebound = (name: string): boolean => !new RegExp ('(?:^|[^\\w.&*])' + goAccessEscape (name) + '\\s*=(?!=)|&\\s*' + goAccessEscape (name) + '\\b', 'm').test (maskedFunc);
    const consumers = GO_ACCESS_DEREF_CONSUMERS.join ('|');
    for (let k = start + 1; k < end; k++) {
        const m = masked[k];
        if (!/\b(?:GetArrayLength|GetValue|AddElementToObject|InOp|IsEqual)\(/.test (m)) {
            continue;
        }
        const declOf = (name: string) => resolve (name, k);
        const typeAt = (name: string, at: number) => { const d = resolve (name, at); return (d === undefined) ? undefined : d.type; };
        if (goNativeInOp (lines, masked, k, maskedFunc, declOf, typeAt)) {
            continue;
        }
        if (goTextMaskLiteralsAndComments (lines[k]) !== m) {
            continue; // the line opens inside a multi-line literal or comment
        }
        let cur = m;
        const isCode = (text: string, at: number) => cur.substr (at, text.length) === text;
        // same exactness table as goTypedNilCompareText: nil on a nilable typed local, a literal on a string
        let line = lines[k].replace (/(!?)(?<![\w.])((?:ccxt\.)?IsEqual\()(\w+), (nil|"[^"\\\n]*")\)/g, (all: string, not: string, head: string, name: string, rhs: string, at: number) => {
            const t = typeAt (name, k);
            const exact = (rhs === 'nil') ? GO_NIL_COMPARABLE_TYPES.has (t) : (t === 'string');
            return (isCode (head, at + not.length) && exact) ? '(' + name + ((not === '!') ? ' != ' : ' == ') + rhs + ')' : all;
        });
        cur = goTextMaskLiteralsAndComments (line);
        line = line.replace (/(?<![\w.])(?:ccxt\.)?GetArrayLength\((\w+)\)/g, (all: string, name: string, at: number) => {
            const t = typeAt (name, k);
            return (isCode (all, at) && (t !== undefined) && GO_ARRLEN_NATIVE_TYPES.test (t)) ? 'len(' + name + ')' : all;
        });
        cur = goTextMaskLiteralsAndComments (line);
        line = line.replace (new RegExp ('((?<![\\w.])(?:ccxt\\.)?(?:' + consumers + ')\\()(?:ccxt\\.)?GetValue\\((\\w+), (\"[^\"\\\\\\\\\\n]*\")\\)', 'g'), (all: string, head: string, name: string, key: string, at: number) =>
            ((isCode (head, at) && (typeAt (name, k) === 'map[string]any')) ? head + name + '[' + key + ']' : all));
        if (line !== lines[k]) {
            lines[k] = line;
            continue;
        }
        const before = lines[k];
        const beforeMasked = masked[k];
        goNativeMapWrite (lines, masked, start, end, k, maskedFunc, declOf, typeAt, notRebound);
        // hx11 M320: the nil-key guard `if k != nil { m[*k] = v }` is born gofmt-expanded and is one entry here, so it may stay
        if ((lines[k].indexOf ('\n') >= 0) && !/^\s*if \w+ != nil \{\n\s*\w+\[\*\w+\] = [^\n]+\n\s*\}$/.test (lines[k])) {
            lines[k] = before; // D3: no multi-line nil-key guard block
            masked[k] = beforeMasked;
        }
    }
}

function hx4G25Pass (content: string): string {
    if (!/\b(?:GetArrayLength|GetValue|AddElementToObject|InOp|IsEqual)\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
            continue;
        }
        if ((start >= 0) && (lines[k] === '}')) {
            hx4G25Func (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

function hx4G25Check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, label: string) => { if (!c) { problems.push ('hx4 G25: ' + label); } };
    const f = (body: string, sig = 'p any') => hx4G25Pass ('func (this *X) f(' + sig + ') any {\n' + body + '\treturn nil\n}\n');
    try {
        const twoBlocks = '\tif a {\n\t\tvar m map[string]any = SafeMapTyped(p, "a")\n\t\t_ = m\n\t} else {\n\t\tvar m map[string]any = SafeMapTyped(p, "b")\n\t\tif IsEqual(m, nil) {\n\t\t}\n\t\tif !IsEqual(m, nil) && GetArrayLength(l) > 0 {\n\t\t}\n\t}\n';
        let r = f (twoBlocks, 'p any, l []any');
        ok (r.includes ('if (m == nil) {') && r.includes ('if (m != nil) && len(l) > 0 {'), 'shadowed map local compares natively: ' + r);
        r = f ('\tvar result map[string]any = map[string]any{}\n\tfor i := 0; i < 2; i++ {\n\t\tvar account map[string]any = this.Account()\n\t\t_ = account\n\t}\n\tfor i := 0; i < 2; i++ {\n\t\tvar account map[string]any = this.Account()\n\t\tvar code *string = this.SafeString(p, "c")\n\t\tif code == nil {\n\t\t\tcontinue\n\t\t}\n\t\tAddElementToObject(result, code, account)\n\t}\n');
        ok (r.includes ('result[*code] = account'), 'shadowed never-nil value under a nil-exit key guard: ' + r);
        r = f ('\tif a {\n\t\tvar s string = "x"\n\t\t_ = s\n\t} else {\n\t\tvar s string = "y"\n\t\tif IsEqual(s, "spot") {\n\t\t}\n\t}\n');
        ok (r.includes ('if (s == "spot") {'), 'shadowed string literal compare: ' + r);
        for (const keep of [
            '\tvar m map[string]any = SafeMapTyped(p, "a")\n\tif a {\n\t\tvar m any = p\n\t\tif IsEqual(m, nil) {\n\t\t}\n\t}\n',            // inner any shadow
            '\tif a {\n\t\tvar m map[string]any = SafeMapTyped(p, "a")\n\t\t_ = m\n\t}\n\tif IsEqual(m, nil) {\n\t}\n',                         // out of scope
            '\tvar m map[string]any = nil\n\tm, q := this.G(p)\n\tif IsEqual(m, nil) {\n\t}\n\t_ = q\n',                                       // := rebinding
            '\tfunc(m any) {\n\t\tif IsEqual(m, nil) {\n\t\t}\n\t}(p)\n\tvar m map[string]any = nil\n\t_ = m\n',                                     // closure param
            '\tswitch a {\n\tcase 1:\n\t\tvar s string = "x"\n\t\t_ = s\n\tcase 2:\n\t\tif IsEqual(s, "x") {\n\t\t}\n\t}\n',                         // other case clause
            '\tvar v any = p\n\tif IsEqual(v, nil) {\n\t}\n',
            '\tvar m map[string]any = map[string]any{}\n\tvar k *string = this.SafeString(p, "a")\n\tif a {\n\t\tvar m any = p\n\t\t_ = m\n\t}\n\tAddElementToObject(m, k, true)\n\tif IsEqual(v, nil) {\n\t}\n',
        ]) {
            r = f (keep);
            ok (/IsEqual\((?:m|s|v), /.test (r), 'keeps helper: ' + JSON.stringify (keep) + ' -> ' + r);
        }
        r = f ('\tvar m map[string]any = map[string]any{}\n\tif a {\n\t\tvar k *string = this.SafeString(p, "a")\n\t\t_ = k\n\t} else {\n\t\tvar k *string = this.SafeString(p, "b")\n\t\tAddElementToObject(m, k, true)\n\t}\n');
        ok (r.includes ('AddElementToObject(m, k, true)'), 'unguarded *string key keeps the helper (no guard block): ' + r);
        { const w = formatGoSource ('selftest.go', 'func (this *X) f(p any) any {\n' + twoBlocks + '\treturn nil\n}\n'); ok (/if \(?m == nil\)? \{/.test (w), 'wired into formatGoSource: ' + w); }
    } catch (e) {
        problems.push ('hx4 G25 threw: ' + e.message);
    }
    return problems;
}

// hx4 G27: comparisons reach both the per-exchange (formatGoSource) and base-file pass chains
function hx4G27Check (): string[] {
    const problems: string[] = [];
    try {
        const head = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\n';
        const body = 'func (this *Exchange) F(o any) any {\n\tvar d *float64 = this.SafeNumber(o, \"d\")\n\tif (d != nil) && IsLessThan(d, 0) {\n\t}\n\tvar start int64 = this.Milliseconds()\n\tfor IsLessThan((this.Milliseconds() - start), 5) {\n\t}\n\treturn nil\n}\n';
        const ex = formatGoSource ('selftest.go', head + body);
        if (!ex.includes ('(d != nil) && (!(*d >= 0))')) { problems.push ('hx4 G27: formatGoSource float < : ' + ex); }
        const base = hx4G20BaseNativePasses (head + body);
        if (!base.includes ('!(*d >= 0)') || base.includes ('IsLessThan((this.Milliseconds()')) { problems.push ('hx4 G27: base passes: ' + base); }
    } catch (e) {
        problems.push ('hx4 G27 threw: ' + e.message);
    }
    return problems;
}

// hx4 G28
// IsEqual(this.Safe{String,StringLower,StringUpper,Integer,Bool}(args), <literal of that kind>) -> nil-checked `*call == lit`:
// the base getters return a fresh pointer (nil only when absent), so nil never equals a literal, like the helper.
function hx4G28IsEqualSafe (content: string): string {
    if (!/IsEqual\(this\.Safe/.test (content)) { return content; }
    const kinds: any = { 'String': 'string', 'StringLower': 'string', 'StringUpper': 'string', 'Integer': 'int', 'Bool': 'bool' };
    const own = new Set ([ ...content.matchAll (/^func \(\w+ \*\w+\) (Safe\w+)\(/gm) ].map ((m) => m[1]));
    const re = /(!?)(?<![\w.])(?:ccxt\.)?IsEqual\(this\.Safe(String|StringLower|StringUpper|Integer|Bool)\(/g;
    let out = '';
    let cursor = 0;
    for (let m = re.exec (content); m !== null; m = re.exec (content)) {
        const open = m.index + m[0].length - ('this.Safe'.length + m[2].length + 2);
        const close = goMatchingCloseText (content, open);
        if ((close < 0) || (m.index < cursor) || own.has ('Safe' + m[2])) { continue; }
        const args = g10kIsEqualArgs (content.slice (open + 1, close));
        if ((args === undefined) || (args[0].indexOf ('\n') >= 0)) { continue; }
        const call = args[0];
        const lit = args[1];
        const callOpen = call.indexOf ('(');
        // the call is printed twice: only side-effect-free arguments
        if ((goMatchingCloseText (call, callOpen) !== call.length - 1) || /\bfunc\b|<-|Async\(|\bthis\.(?!Safe|Options\b|Urls\b)\w+\(/.test (call.slice (callOpen))) { continue; }
        if (g10kIsEqualLiteral (lit) !== kinds[m[2]]) { continue; }
        const form = (m[1] === '!') ? (call + ' == nil || *' + call + ' != ' + lit) : (call + ' != nil && *' + call + ' == ' + lit);
        // an `if` condition or an already-parenthesised call needs no extra pair (gofmt)
        const before = content.slice (0, m.index);
        const after = content.slice (close + 1);
        const bare = (/(?:^|\n)\t*(?:\} else )?if $/.test (before) && /^ \{\n/.test (after)) || (before.endsWith ('(') && after.startsWith (')'));
        out += content.slice (cursor, m.index) + (bare ? form : ('(' + form + ')'));
        cursor = close + 1;
        re.lastIndex = cursor;
    }
    return out + content.slice (cursor);
}

function hx4G28SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G28: ' + msg); } };
    try {
        const f = (body: string) => hx4G28IsEqualSafe ('package ccxt\n\nfunc (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
        let r = f ('\tif IsEqual(this.SafeString(GetValue(p, "info"), "t"), "RFQ") {\n\t}\n');
        ok (r.includes ('if this.SafeString(GetValue(p, "info"), "t") != nil && *this.SafeString(GetValue(p, "info"), "t") == "RFQ" {'), 'SafeString literal: ' + r);
        r = f ('\tvar a bool = (q != nil) && (IsEqual(this.SafeString(p, "t"), "R"))\n');
        ok (r.includes ('var a bool = (q != nil) && (this.SafeString(p, "t") != nil && *this.SafeString(p, "t") == "R")'), 'parenthesised: ' + r);
        r = f ('\tvar a bool = !ccxt.IsEqual(this.SafeInteger(p, 1), 1)\n');
        ok (r.includes ('var a bool = (this.SafeInteger(p, 1) == nil || *this.SafeInteger(p, 1) != 1)'), 'negated SafeInteger: ' + r);
        r = f ('\tvar a bool = IsEqual(this.SafeBool(p, "c"), true)\n');
        ok (r.includes ('(this.SafeBool(p, "c") != nil && *this.SafeBool(p, "c") == true)'), 'SafeBool: ' + r);
        r = f ('\tvar a any = map[string]any{"d": IsEqual(this.SafeStringLower(p, "c"), "x"),}\n');
        ok (r.includes ('"d": (this.SafeStringLower(p, "c") != nil && *this.SafeStringLower(p, "c") == "x")'), 'SafeStringLower: ' + r);
        for (const keep of [
            '\tvar a bool = IsEqual(this.SafeString(p, "c"), 1)\n',
            '\tvar a bool = IsEqual(this.SafeInteger(p, "c"), "1")\n',
            '\tvar a bool = IsEqual(this.SafeInteger(p, "c"), 1.5)\n',
            '\tvar a bool = IsEqual(this.SafeString(p, "c"), q)\n',
            '\tvar a bool = IsEqual(this.SafeValue(p, "c"), "x")\n',
            '\tvar a bool = IsEqual(this.SafeString(this.Next(p), "c"), "x")\n',
            '\tvar a bool = IsEqual(this.SafeString(func() any { return p }(), "c"), "x")\n',
            '\tvar a bool = IsEqual(this.SafeString(<-ch, "c"), "x")\n',
        ]) {
            ok (f (keep).includes ('IsEqual(this.Safe'), 'keeps IsEqual: ' + JSON.stringify (keep));
        }
        const own = 'package ccxt\n\nfunc (this *X) SafeString(a any, b any) *string {\n\treturn nil\n}\n\nfunc (this *X) f(p any) any {\n\treturn IsEqual(this.SafeString(p, "k"), "x")\n}\n';
        ok (hx4G28IsEqualSafe (own) === own, 'same-file SafeString override keeps IsEqual');
    } catch (e) {
        problems.push ('hx4 G28 threw: ' + e.message);
    }
    return problems;
}

// hx4 G29
// `AddElementToObject(m, k, v)` -> `m[k] = v` when v is a single-assignment map local whose initializer never
// answers nil (struct-to-map conversion or a map-producer call): the helper's derefScalar leaves such a value unchanged.
function hx4G29NeverNilMapValue (lines: string[], maskedFunc: string, decl: any, name: string): boolean {
    if ((decl === undefined) || (decl.index === undefined) || (decl.type !== 'map[string]any')) {
        return false;
    }
    const n = goAccessEscape (name);
    if (goG14MapLocalRebound (maskedFunc, n) || new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*=(?!=)', 'm').test (maskedFunc)) {
        return false;
    }
    const init = decl.line.replace (/^\s*var\s+\w+\s+\S+\s*=\s*/, '').trim ();
    if (/^(?:ccxt\.)?(?:TickerToMap|TradeToMap|OrderToMap)\(/.test (init)) {
        return true; // StructToMap of a struct value always builds a fresh map
    }
    return /\)$/.test (init) && (goMapWriteGroupEnd (init, init.indexOf ('(')) === init.length) && goMapWriteMapResultCall (lines, init);
}

function hx4G29Func (lines: string[], masked: string[], start: number, end: number) {
    const resolve = hx4G25Scope (masked, start, end);
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const notRebound = (name: string): boolean => !new RegExp ('(?:^|[^\\w.&*])' + goAccessEscape (name) + '\\s*=(?!=)|&\\s*' + goAccessEscape (name) + '\\b', 'm').test (maskedFunc);
    for (let k = start + 1; k < end; k++) {
        const m = /^(\s*)((?:ccxt\.)?AddElementToObject)\((\w+), (\w+|"[^"\\\n]*"), (\w+)\)$/.exec (masked[k]);
        if ((m === null) || (lines[k] !== masked[k])) {
            continue;
        }
        const [ , indent, , recv, key, value ] = m;
        const declOf = (name: string) => resolve (name, k);
        const typeOf = (name: string) => { const d = resolve (name, k); return (d === undefined) ? undefined : d.type; };
        if ((typeOf (recv) !== 'map[string]any') || !goMapWriteLocalNeverNil (maskedFunc, declOf (recv), recv, declOf)) {
            continue;
        }
        if (!hx4G29NeverNilMapValue (lines, maskedFunc, declOf (value), value)) {
            continue;
        }
        let keyOut: string | undefined = undefined;
        if (key.startsWith ('"') || (typeOf (key) === 'string')) {
            keyOut = key;
        } else if ((typeOf (key) === '*string') && notRebound (key)
            && (goAccessInsideNilGuard (masked, k, key) || goG14EnclosingNilGuard (masked, start, k, key) || goMapWriteDominatingNilGuard (masked, start, k, key, maskedFunc, declOf)
                || goG14NonNilStringPtr (lines.slice (start, end + 1).join ('\n'), key))) {
            keyOut = '*' + key; // nil-guarded, or every write is a SafeString* call with a literal default
        }
        if (keyOut !== undefined) {
            lines[k] = indent + recv + '[' + keyOut + '] = ' + value;
            masked[k] = lines[k];
        }
    }
}

function hx4G29Pass (content: string): string {
    if (!/\bAddElementToObject\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            hx4G29Func (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

function hx4G29Check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, label: string) => { if (!c) { problems.push ('hx4 G29: ' + label); } };
    const f = (body: string) => hx4G29Pass ('func (this *X) f(p any) any {\n\tvar result map[string]any = map[string]any{}\n' + body + '\treturn result\n}\n');
    try {
        const head = '\tvar code *string = this.SafeString(p, "c")\n\tif code == nil {\n\t\treturn nil\n\t}\n';
        ok (f (head + '\tvar t map[string]any = TickerToMap(this.ParseTicker(p))\n\tAddElementToObject(result, code, t)\n').includes ('result[*code] = t'), 'struct-map value under a nil-exit key guard');
        ok (f ('\tvar code *string = this.SafeString(p, "c", "")\n\tvar t map[string]any = this.Account()\n\tAddElementToObject(result, code, t)\n').includes ('result[*code] = t'), 'producer value, literal-default key');
        for (const keep of [
            '\tvar code *string = this.SafeString(p, "c")\n\tvar t map[string]any = TickerToMap(this.ParseTicker(p))\n\tAddElementToObject(result, code, t)\n',   // nilable key
            head + '\tvar t map[string]any = SafeMapTyped(p, "t")\n\tAddElementToObject(result, code, t)\n',                                            // nilable map value
            head + '\tvar t map[string]any = TickerToMap(this.ParseTicker(p))\n\tt = SafeMapTyped(p, "t")\n\tAddElementToObject(result, code, t)\n', // rebound value
            head + '\tvar r map[string]any = SafeMapTyped(p, "r")\n\tvar t map[string]any = this.Account()\n\tAddElementToObject(r, code, t)\n',    // nilable receiver
        ]) {
            const r = f (keep);
            ok (r.includes ('AddElementToObject('), 'keeps helper: ' + JSON.stringify (keep) + ' -> ' + r);
        }
        const w = formatGoSource ('selftest.go', 'func (this *X) f(p any) any {\n\tvar result map[string]any = map[string]any{}\n' + head + '\tvar t map[string]any = TickerToMap(this.ParseTicker(p))\n\tAddElementToObject(result, code, t)\n\treturn result\n}\n');
        ok (w.includes ('result[*code] = t'), 'wired into formatGoSource: ' + w);
    } catch (e) {
        problems.push ('hx4 G29 threw: ' + e.message);
    }
    return problems;
}

// hx4 G34
// `var r map[string]any = MapTyped(h[i])` where `h := this.M(..)` is the only write of h and M is the single
// same-receiver method of this file whose every return is `[]any{..}` with a never-nil map in slot i
// (a never-nil local of M, or a map parameter of M that the caller hands a never-nil local).
function hx4G34TupleSlotNeverNil (maskedFunc: string, init: string, declOf: (name: string) => any, depth: number): boolean {
    const file: string[] | undefined = (hx4G34TupleSlotNeverNil as any).file;
    const slot = /^(?:ccxt\.)?MapTyped\((\w+)\[([01])\]\)$/.exec (init);
    const callerLines = maskedFunc.split ('\n');
    const recv = /^func \(this \*(\w+)\) /.exec (callerLines[0]);
    if ((file === undefined) || (slot === null) || (recv === null) || (file.indexOf (callerLines[0]) < 0)) {
        return false;
    }
    const h = slot[1];
    if (goG14MapLocalRebound (maskedFunc, h) && !new RegExp ('^\\s*' + h + ' := ', 'm').test (maskedFunc)) {
        return false;
    }
    const writes = callerLines.filter ((l) => goTextWritesName (l, h));
    const holder = (writes.length === 1) ? /^\s*\w+ := this\.(\w+)\((.*)\)\s*$/.exec (writes[0]) : null;
    if ((holder === null) || !writes[0].trim ().startsWith (h + ' := ') || new RegExp ('&\\s*' + h + '\\b|\\b' + h + '\\s*\\[[^\\]]*\\]\\s*=(?!=)').test (maskedFunc)) {
        return false;
    }
    const defs = file.map ((l, i) => (l.startsWith ('func (this *' + recv[1] + ') ' + holder[1] + '(') ? i : -1)).filter ((i) => i >= 0);
    if ((defs.length !== 1) || (file.filter ((l) => new RegExp ('^func \\(this \\*\\w+\\) ' + holder[1] + '\\(').test (l)).length !== 1)) {
        return false;
    }
    let close = defs[0] + 1;
    while ((close < file.length) && (file[close] !== '}')) {
        close++;
    }
    const callee = file.slice (defs[0], close + 1);
    const calleeFunc = callee.join ('\n');
    const calleeDeclOf = (name: string) => goAccessSingleDeclaration (calleeFunc, callee[0], name);
    const sigParams = hx4G34TopLevel (callee[0].substring (callee[0].indexOf (holder[1] + '(') + holder[1].length + 1, callee[0].lastIndexOf (') ')));
    const callArgs = hx4G34TopLevel (holder[2]);
    let returns = 0;
    let lit = 0;
    for (const line of callee.slice (1, -1)) {
        if ((lit > 0) || /\bfunc\s*\(/.test (line)) {
            for (const c of line) {
                lit += (c === '{') ? 1 : ((c === '}') ? -1 : 0);
            }
            continue;
        }
        const ret = /^\s*return\b\s*(.*)$/.exec (line);
        if (ret === null) {
            continue;
        }
        returns++;
        const tuple = /^\[\]any\{(.*)\}$/.exec (ret[1].trim ());
        const parts = (tuple === null) ? [] : hx4G34TopLevel (tuple[1]);
        const value = (parts.length === 2) ? parts[Number (slot[2])].trim () : '';
        if (/^map\[string\]any\{\}$/.test (value)) {
            continue;
        }
        if (!/^\w+$/.test (value)) {
            return false;
        }
        const param = sigParams.findIndex ((p) => p.trim () === value + ' map[string]any');
        if (param >= 0) {
            const arg = (param < callArgs.length) ? callArgs[param].trim () : '';
            if (!/^\w+$/.test (arg) || goG14MapLocalRebound (calleeFunc, value) || new RegExp ('(?:^|[^\\w.&*])' + value + '\\s*=(?!=)', 'm').test (calleeFunc)
                || !goMapWriteLocalNeverNil (maskedFunc, declOf (arg), arg, declOf, depth + 1)) {
                return false;
            }
        } else if (!goMapWriteLocalNeverNil (calleeFunc, calleeDeclOf (value), value, calleeDeclOf, depth + 1)) {
            return false;
        }
    }
    return returns > 0;
}
hx4G34TupleSlotNeverNil.file = undefined as string[] | undefined;

function hx4G34TopLevel (text: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let from = 0;
    for (let i = 0; i < text.length; i++) {
        depth += ('([{'.indexOf (text[i]) >= 0) ? 1 : ((')]}'.indexOf (text[i]) >= 0) ? -1 : 0);
        if ((depth === 0) && (text[i] === ',')) {
            parts.push (text.substring (from, i));
            from = i + 1;
        }
    }
    parts.push (text.substring (from));
    return parts;
}

function hx4G34Check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, label: string) => { if (!c) { problems.push ('hx4 G34: ' + label); } };
    const prep = (ret: string) => 'func (this *X) Prep(optionalArgs ...any) []any {\n\tvar params map[string]any = GetArgMap(optionalArgs, 0, map[string]any{})\n'
        + '\tvar request map[string]any = map[string]any{}\n\tif params != nil {\n\t\treturn []any{request, this.Omit(params, "a")}\n\t}\n\treturn ' + ret + '\n}\n';
    const until = 'func (this *X) Until(key string, request map[string]any, optionalArgs ...any) []any {\n\treturn []any{request, nil}\n}\n';
    const caller = (body: string) => 'func (this *X) f(p any) any {\n' + body + '\tAddElementToObject(request, "k", "v")\n\treturn request\n}\n';
    const viaPrep = '\th := this.Prep(p)\n\tvar request map[string]any = MapTyped(h[0])\n';
    try {
        ok (formatGoSource ('selftest.go', prep ('[]any{request, params}') + caller (viaPrep)).includes ('request["k"] = "v"'), 'same-file tuple slot 0 local');
        ok (formatGoSource ('selftest.go', until + caller ('\tvar r0 map[string]any = map[string]any{}\n\th := this.Until("t", r0, p)\n\tvar request map[string]any = MapTyped(h[0])\n')).includes ('request["k"] = "v"'), 'map param fed a never-nil local');
        for (const keep of [
            prep ('[]any{nil, params}') + caller (viaPrep),                                              // a nil slot
            prep ('[]any{request, params}') + caller (viaPrep.replace ('h[0]', 'h[1]')),                 // Omit slot can be nil
            until + caller ('\tvar r0 map[string]any = SafeMapTyped(p, "r")\n\th := this.Until("t", r0, p)\n\tvar request map[string]any = MapTyped(h[0])\n'),  // nilable arg
            prep ('[]any{request, params}') + caller (viaPrep + '\th = this.Prep(p)\n'),                  // rebound holder
            caller (viaPrep),                                                                             // callee not in this file
        ]) {
            const r = formatGoSource ('selftest.go', keep);
            // G34's own claim is the UNGUARDED write; a nil-guarded write needs no slot proof (hx10 G03)
            ok (!/\n\trequest\["k"\] = "v"\n/.test (r), 'no unguarded write without the slot proof: ' + JSON.stringify (keep) + ' -> ' + r);
        }
    } catch (e) {
        problems.push ('hx4 G34 threw: ' + e.message);
    }
    return problems;
}

// hx4 G33
// IsEqual on proven locals: `x, p := this.Handle*AndParams(..)` slot 0 (*string / int64 by the base
// signature) and `x := GetArg(optionalArgs, N, nil)` (GetArg already folds typed nils to nil).
function hx4G33IsEqual (content: string): string {
    if (!/IsEqual\(\w+, /.test (content)) { return content; }
    const ptrHandlers = 'HandleOptionStringAndParams2?|HandleMarginModeAndParams|HandleMarketTypeAndParams|HandleSubTypeAndParams';
    const intHandlers = 'HandleOptionIntegerAndParams2?';
    // a same-file override with another slot-0 type keeps the helper
    const sigs = [ ...content.matchAll (/^func \(\w+ \*\w+\) (Handle\w+)\(.*?\) \((\S+), map\[string\]any\) \{$/gm) ];
    const odd = new Set (sigs.filter ((s) => s[2] !== (new RegExp ('^(' + intHandlers + ')$').test (s[1]) ? 'int64' : '*string')).map ((s) => s[1]));
    if ([ ...content.matchAll (/^func \(\w+ \*\w+\) (Handle(?:Option\w+|MarginMode\w+|MarketType\w+|SubType\w+))\(/gm) ].some ((s) => !sigs.some ((g) => g[1] === s[1]))) { return content; }
    return content.replace (/\nfunc [\s\S]*?\n\}/g, ((fn: string) => {
        const masked = goTextMaskLiteralsAndComments (fn);
        const kinds = new Map<string, string> ();
        for (const d of masked.matchAll (new RegExp ('^\\t+(\\w+), \\w+ := this\\.(?:Exchange\\.)?(' + ptrHandlers + '|' + intHandlers + ')\\(', 'gm'))) {
            if (!odd.has (d[2])) { kinds.set (d[1], new RegExp ('^(' + intHandlers + ')$').test (d[2]) ? 'int64' : '*string'); }
        }
        for (const d of fn.matchAll (/^\t+(\w+) := (?:ccxt\.)?GetArg\(optionalArgs, \d+, nil\)$/gm)) { kinds.set (d[1], 'getarg'); }
        for (const [ name, kind ] of [ ...kinds ]) {
            const n = '(?<![\\w.])' + name;
            const decls = (masked.match (new RegExp (n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bvar ' + name + '\\b|&' + name + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' |\\brange\\b[^\\n]*\\b' + name + '\\b', 'g')) || []).length;
            const header = masked.split ('\n')[1] || '';
            const param = new RegExp ('[(,]\\s*' + name + ' ').test (header);
            // a GetArg any local may be reassigned a pointer box later
            const written = (kind === 'getarg') && new RegExp (n + '\\s*=(?!=)').test (masked);
            if (decls !== 1 || param || written) { kinds.delete (name); }
        }
        if (kinds.size === 0) { return fn; }
        return fn.replace (/(!?)(?<![\w.])(?:ccxt\.)?IsEqual\((\w+), (nil|"(?:[^"\\\n]|\\.)*"|-?\d{1,9})\)/g, ((m: string, not: string, x: string, lit: string, off: number) => {
            const kind = kinds.get (x);
            if (kind === undefined) { return m; }
            let form: string | undefined;
            // an int64 slot is never nil: the helper's answer stays
            if (lit === 'nil' && kind !== 'int64') {
                form = x + (not ? ' != ' : ' == ') + 'nil';
            } else if (kind === '*string' && lit.startsWith ('"')) {
                form = not ? (x + ' == nil || *' + x + ' != ' + lit) : (x + ' != nil && *' + x + ' == ' + lit);
            } else if (kind === 'int64' && /^-?\d/.test (lit)) {
                form = x + (not ? ' != ' : ' == ') + lit;
            }
            if (form === undefined) { return m; }
            const before = fn.slice (0, off);
            const after = fn.slice (off + m.length);
            const bare = (/\n\t*(?:\} else )?if $/.test (before) && /^ \{\n/.test (after)) || (before.endsWith ('(') && after.startsWith (')'));
            return bare ? form : ('(' + form + ')');
        }) as any);
    }) as any);
}

function hx4G33Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G33: ' + msg); } };
    try {
        const f = (body: string, sig = 'p any', extra = '') => hx4G33IsEqual ('package ccxt\n' + extra + '\nfunc (this *X) f(' + sig + ') any {\n' + body + '\treturn nil\n}\n');
        let r = f ('\tmarginMode, q := this.HandleMarginModeAndParams("x", p)\n\tif !IsEqual(marginMode, nil) {\n\t}\n\t_ = q\n');
        ok (r.includes ("if marginMode != nil {"), "margin mode nil: " + r);
        r = f ('\tt, q := this.HandleOptionStringAndParams(p, "m", "t")\n\tvar a bool = IsEqual(t, "gtc") || ccxt.IsEqual(t, nil)\n\t_ = q\n');
        ok (r.includes ('var a bool = (t != nil && *t == "gtc") || (t == nil)'), 'string tuple: ' + r);
        r = f ('\tg, q := this.HandleOptionIntegerAndParams(p, "m", "g", 2)\n\tif IsEqual(g, 2) {\n\t}\n\tif !IsEqual(g, 1) {\n\t}\n\t_ = q\n');
        ok (r.includes ('if g == 2 {') && r.includes ('if g != 1 {'), 'int tuple: ' + r);
        r = f ('\tlimit := GetArg(optionalArgs, 0, nil)\n\tif IsEqual(limit, nil) {\n\t}\n\tif IsEqual(limit, 5) {\n\t}\n', 'optionalArgs ...any');
        ok (r.includes ('if limit == nil {') && r.includes ('IsEqual(limit, 5)'), 'GetArg nil only: ' + r);
        const keep = [
            f ('\tlimit := GetArg(optionalArgs, 0, nil)\n\tlimit = this.SafeInteger(p, "l")\n\tif IsEqual(limit, nil) {\n\t}\n', 'optionalArgs ...any'),
            f ('\tlimit := GetArg(optionalArgs, 0, 10)\n\tif IsEqual(limit, nil) {\n\t}\n', 'optionalArgs ...any'),
            f ('\tt, q := this.HandleOptionStringAndParams(p, "m", "t")\n\tif true {\n\t\tt := p\n\t\t_ = t\n\t}\n\tif IsEqual(t, nil) {\n\t}\n\t_ = q\n'),
            f ('\tt, q := this.HandleOptionStringAndParams(p, "m", "t")\n\tif IsEqual(t, 1) {\n\t}\n\t_ = q\n'),
            f ('\tg, q := this.HandleOptionIntegerAndParams(p, "m", "g", 2)\n\tif !IsEqual(g, nil) {\n\t}\n\t_ = q\n'),
            f ('\tg, q := this.HandleOptionIntegerAndParams(p, "m", "g", 2)\n\tif IsEqual(g, "2") {\n\t}\n\t_ = q\n'),
            f ('\tt, q := this.HandleMarginModeAndParams("x", p)\n\tif IsEqual(t, nil) {\n\t}\n\t_ = q\n', 'p any', '\nfunc (this *X) HandleMarginModeAndParams(m any, o ...any) (any, map[string]any) {\n\treturn nil, nil\n}\n'),
        ];
        keep.forEach ((k: string, i: number) => ok (k.includes ('IsEqual('), 'negative ' + i + ': ' + k));
        r = f ('\tt, q := this.HandleMarginModeAndParams("x", p)\n\tif IsEqual(t, nil) {\n\t}\n\t_ = q\n', 'p any', '\nfunc (this *X) HandleMarginModeAndParams(m any, o ...any) (*string, map[string]any) {\n\treturn nil, nil\n}\n');
        ok (r.includes ('if t == nil {'), 'same-type override: ' + r);
    } catch (e) {
        problems.push ('hx4 G33 threw: ' + e.message);
    }
    return problems;
}

// hx4 G36
function hx4G36Aligner (): any {
    const self = hx4G36Aligner as any;
    self.cache = self.cache ?? new Transpiler ({ 'verbose': false, 'go': {} }).goTranspiler;
    return self.cache;
}

function hx4G36Wired (): string[] {
    // hx5 X30: proven operands go native, unproven ones keep the helper call, never an inline closure
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G36-'));
    const file = path.join (dir, 'x.go');
    try {
        overwriteFileAndFolder (file, 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\nfunc (this *X) F(a any, b any) any {\n\tvar n int64 = 5\n\tif IsLessThan(n, 10) {\n\t\treturn Multiply(a, 2)\n\t}\n\tif IsGreaterThan(a, b) {\n\t\treturn Subtract(a, b)\n\t}\n\treturn OpNeg(Divide(a, 3))\n}\n');
        const out = fs.readFileSync (file, 'utf8');
        const problems: string[] = [];
        if (/func\((?:a, b|v) any\) (?:any|bool|float64) \{/.test (out) || out.includes ('import "reflect"')) {
            problems.push ('hx4 G36: inline closure emitted: ' + out);
        }
        for (const want of [ 'Multiply(a, 2)', 'IsGreaterThan(a, b)', 'Subtract(a, b)', 'OpNeg(Divide(a, 3))' ]) {
            if (!out.includes (want)) {
                problems.push ('hx4 G36: unproven call lost its helper (' + want + '): ' + out);
            }
        }
        if (out.includes ('IsLessThan(n, 10)')) {
            problems.push ('hx4 G36: proven int64 comparison not native: ' + out);
        }
        return problems;
    } finally {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
}

// hx4 G38
// IsEqual -> native ==/!= where the operand box is provably plain (no scalar pointer, no nil *sync.Map):
// credential fields (hand-written `interface{}`, written only by Set*/initializeProperties as string or nil),
// `this.Has["k"]` (literal bool/'emulated'/dict rows), and single-binding `x := GetValue(..)` locals (GetValue derefs).
function hx4G38Pass (content: string): string {
    if (!/IsEqual\(/.test (content)) { return content; }
    const fileMasked = goTextMaskLiteralsAndComments (content);
    const creds = [ 'ApiKey', 'Secret', 'Uid', 'Password', 'Login', 'Twofa', 'PrivateKey', 'WalletAddress', 'AccountId' ]
        .filter ((f) => !new RegExp ('\\bthis\\.' + f + '\\s*=(?!=)').test (fileMasked));
    const lit = '(nil|true|false|\"(?:[^\"\\\\\\n]|\\\\.)*\")';
    const ranges = goFuncBlockRanges (content);
    for (let r = ranges.length - 1; r >= 0; r--) {
        const fn = content.slice (ranges[r].start, ranges[r].end);
        const masked = fileMasked.slice (ranges[r].start, ranges[r].end);
        const header = masked.replace (/^\n/, '').split ('\n')[0];
        const plainLocal = new Map<string, boolean> ();
        const isPlainLocal = (x: string): boolean => {
            if (plainLocal.has (x)) { return plainLocal.get (x); }
            const n = '(?<![\\w.])' + x;
            const binds = masked.match (new RegExp (n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + x + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bvar ' + x + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + x + ' |\\brange\\b[^\\n]*\\b' + x + '\\b', 'g')) || [];
            const decl = new RegExp ('^\\t+(?:' + x + ' :=|var ' + x + ' any =) (?:ccxt\\.)?GetValue\\((?!this,)[^\\n]*\\)$', 'm').test (fn);
            const ok = decl && (binds.length === 1) && !new RegExp ('[(,]\\s*' + x + ' ').test (header) && !new RegExp ('&' + x + '\\b|' + n + '\\s*(?:=(?!=)|[-+*/%|&^]=|\\+\\+|--)').test (masked);
            plainLocal.set (x, ok);
            return ok;
        };
        const re = new RegExp ('(!?)(?<![\\w.])(?:ccxt\\.)?IsEqual\\((this\\.\\w+|this\\.Has\\[\"\\w+\"\\]|\\w+), ' + lit + '\\)', 'g');
        const rewritten = fn.replace (re, ((m: string, not: string, x: string, y: string, off: number) => {
            if (masked.slice (off, off + m.length).indexOf ('IsEqual(') < 0) { return m; }
            let ok = false;
            if (x.startsWith ('this.Has[')) {
                ok = (y === 'nil') || (y === 'true') || (y === 'false');
            } else if (x.startsWith ('this.')) {
                ok = (y === 'nil') && (creds.indexOf (x.slice (5)) >= 0);
            } else {
                ok = isPlainLocal (x);
            }
            if (!ok) { return m; }
            const form = x + (not ? ' != ' : ' == ') + y;
            const before = fn.slice (0, off);
            const after = fn.slice (off + m.length);
            const bare = (/\n\t*(?:\} else )?if $/.test (before) && /^ \{\n/.test (after)) || (before.endsWith ('(') && after.startsWith (')'));
            return bare ? form : ('(' + form + ')');
        }) as any);
        if (rewritten !== fn) {
            content = content.slice (0, ranges[r].start) + rewritten + content.slice (ranges[r].end);
        }
    }
    return content;
}

function hx4G38Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx4 G38: ' + msg); } };
    try {
        const f = (body: string, extra = '') => hx4G38Pass ('package ccxt\n' + extra + '\nfunc (this *X) f(p any, q any) any {\n' + body + '\treturn nil\n}\n');
        let r = f ('\tif IsEqual(this.ApiKey, nil) || !ccxt.IsEqual(this.PrivateKey, nil) {\n\t}\n');
        ok (r.includes ('if (this.ApiKey == nil) || (this.PrivateKey != nil) {'), 'credential fields: ' + r);
        r = f ('\tif !IsEqual(this.Has["fetchTrades"], false) && IsEqual(this.Has["x"], nil) {\n\t}\n');
        ok (r.includes ('if (this.Has["fetchTrades"] != false) && (this.Has["x"] == nil) {'), 'has rows: ' + r);
        r = f ('\tv := GetValue(p, 0)\n\tif IsEqual(v, nil) {\n\t}\n\tvar a bool = !IsEqual(v, \"x\") || IsEqual(v, true)\n');
        ok (r.includes ('if v == nil {') && r.includes ('var a bool = (v != \"x\") || (v == true)'), 'GetValue local: ' + r);
        ok (formatGoSource ('selftest.go', 'package ccxt\n\nfunc (this *X) f() any {\n\tif IsEqual(this.Secret, nil) {\n\t}\n\treturn nil\n}\n').includes ('if this.Secret == nil {'), 'wired into formatGoSource');
        for (const keep of [
            f ('\tif IsEqual(this.Token, nil) {\n\t}\n'),
            f ('\tif IsEqual(this.ApiKey, \"\") {\n\t}\n'),
            f ('\tif IsEqual(this.ApiKey, nil) {\n\t}\n\tthis.ApiKey = this.SafeString(p, \"k\")\n'),
            f ('\tif IsEqual(this.Has[\"x\"], \"emulated\") {\n\t}\n'),
            f ('\tv := GetValue(p, 0)\n\tif IsEqual(v, 1) {\n\t}\n'),
            f ('\tv := GetValue(p, 0)\n\tv = this.SafeString(q, \"k\")\n\tif IsEqual(v, nil) {\n\t}\n'),
            f ('\tv := GetValue(p, 0)\n\tif true {\n\t\tv := q\n\t\t_ = v\n\t}\n\tif IsEqual(v, nil) {\n\t}\n'),
            f ('\tv := GetValue(this, \"options\")\n\tif IsEqual(v, nil) {\n\t}\n'),
            f ('\tvar v any = this.SafeValue(p, \"k\")\n\tif IsEqual(v, nil) {\n\t}\n'),
            f ('\tif IsEqual(q, nil) {\n\t}\n'),
        ]) {
            ok (keep.includes ('IsEqual('), 'keeps IsEqual: ' + keep);
        }
    } catch (e) {
        problems.push ('hx4 G38 threw: ' + e.message);
    }
    return problems;
}

// hx4 G39
// `x := GetValue(h, 0)` / `x = GetValue(h, 0)` (x an `any` local) where `var h []any = this.P(..)` is unwritten and P is a
// base tuple producer whose slot 0 is always a typed pointer: GetValue(h, 0) is derefScalar(h[0]), printed inline.

function hx4G39TupleSlotDerefs (content: string): string {
    const slot0: { [producer: string]: string } = {
        'HandleParamString': '*string', 'HandleParamString2': '*string', 'HandleNetworkCodeAndParams': '*string',
        'HandleParamInteger': '*int64', 'HandleParamInteger2': '*int64',
        'HandleOptionIntegerAndParamsNullable': '*int64', 'HandleOptionIntegerAndParams2Nullable': '*int64',
        'HandleParamBool': '*bool', 'HandleParamBool2': '*bool',
        'HandleOptionBoolAndParamsNullable': '*bool', 'HandleOptionBoolAndParams2Nullable': '*bool',
    };
    if (!/GetValue\(\w+, 0\)/.test (content)) { return content; }
    const lines = content.split ('\n');
    const maskedLines = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== maskedLines.length) { return content; }
    const masked = maskedLines.join ('\n');
    const producers = Object.keys (slot0).filter ((p) => !new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + p + '\\(').test (masked));
    const { 'blocks': blocks } = goTextBlocks (maskedLines);
    const rx = /^(\s*)([A-Za-z_]\w*) (:?=) ((?:ccxt\.)?)GetValue\(([A-Za-z_]\w*), 0\)\s*$/;
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const m = rx.exec (maskedLines[i]);
        const fn = (m === null) ? undefined : blocks.find ((b: any) => (b.depth === 1) && (b.open < i) && (i <= b.close));
        let ptr: string | undefined = undefined;
        if ((m !== null) && (lines[i] === maskedLines[i]) && (fn !== undefined) && maskedLines[fn.open].startsWith ('func ')) {
            const [ , , target, op, , holder ] = m;
            const maskedFunc = maskedLines.slice (fn.open + 1, fn.close + 1).join ('\n');
            const decl = goAccessSingleDeclaration (maskedFunc, maskedLines[fn.open], holder);
            const init = (decl?.line === undefined) ? null : new RegExp ('^\\s*var ' + holder + ' \\[\\]any = this\\.(\\w+)\\(').exec (decl.line);
            let declLine = -1;
            let written = false;
            for (let k = fn.open + 1; k < fn.close; k++) {
                if (new RegExp ('^\\s*var ' + holder + ' \\[\\]any = ').test (maskedLines[k])) { declLine = k; continue; }
                written = written || goTextWritesName (maskedLines[k], holder);
            }
            const declBlock = (declLine < 0) ? undefined : goTextEnclosingBlock (blocks, declLine);
            const targetDecl = (op === '=') ? goAccessSingleDeclaration (maskedFunc, maskedLines[fn.open], target) : undefined;
            if ((init !== null) && producers.includes (init[1]) && !written && (declLine >= 0) && (declLine < i)
                && (declBlock !== undefined) && (declBlock.open < i) && (i <= declBlock.close)
                && ((op === ':=') || (targetDecl?.type === 'any'))) {
                ptr = slot0[init[1]];
            }
        }
        if (ptr === undefined) { out.push (lines[i]); continue; }
        const [ , ind, target, op, , holder ] = m;
        out.push (ind + target + ' ' + op + ' func() any {', ind + '\tif p, _ := ' + holder + '[0].(' + ptr + '); p != nil {',
            ind + '\t\treturn *p', ind + '\t}', ind + '\treturn nil', ind + '}()');
    }
    return out.join ('\n');
}

function hx4G39Check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, label: string) => { if (!c) { problems.push ('hx4 G39: ' + label); } };
    const f = (body: string, pre: string = '') => formatGoSource ('selftest.go', pre + 'func (this *X) f(p any) any {\n\tvar t any = nil\n' + body + '\treturn t\n}\n');
    const d = '\tvar h []any = this.HandleParamString(p, "tag")\n';
    try {
        const pos = f (d + '\ttag := GetValue(h, 0)\n\tt = tag\n');
        ok (pos.includes ('tag := func() any {\n\t\tif p, _ := h[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()'), 'HandleParamString slot 0 inline deref: ' + pos);
        ok (f ('\tvar h []any = this.HandleOptionBoolAndParamsNullable(p, "m", "k")\n\tt = ccxt.GetValue(h, 0)\n').includes ('t = func() any {\n\t\tif p, _ := h[0].(*bool); p != nil {'), 'assignment to an any local, ccxt-qualified');
        for (const keep of [
            '\tvar h []any = this.HandleOptionAndParams(p, "m", "k")\n\tx := GetValue(h, 0)\n\tt = x\n',  // slot 0 is any
            d + '\th = this.HandleParamString(p, "x")\n\tx := GetValue(h, 0)\n\tt = x\n',                // rebound holder
            d + '\tvar s string = ""\n\ts = GetValue(h, 0)\n',                                          // typed target
            '\tif p != nil {\n' + d + '\t}\n\tx := GetValue(h, 0)\n\tt = x\n',                          // declaration block closed
        ]) {
            ok (f (keep).includes ('GetValue(h,'), 'keeps helper: ' + JSON.stringify (keep) + ' -> ' + f (keep));
        }
        ok (!f (d + '\ttag := GetValue(h, 1)\n').includes ('func() any'), 'slot 1 is not a pointer slot');
        const w = (body: string) => formatGoSource ('selftest.go', 'func (this *X) f(p any, price any) any {\n\tvar request map[string]any = map[string]any{}\n' + body + '\treturn request\n}\n');
        ok (w ('\tif price != nil {\n\t\tAddElementToObject(request, "p", this.PriceToPrecision("s", price))\n\t}\n').includes ('\t\trequest["p"] = func() any {\n\t\t\tif v := this.PriceToPrecision("s", price); v != nil {\n\t\t\t\treturn *v\n\t\t\t}\n\t\t\treturn nil\n\t\t}()'), 'base *string call value: ' + w ('\tAddElementToObject(request, "p", this.PriceToPrecision("s", price))\n'));
        ok (w ('\tvar c *string = this.SafeString(p, "c")\n\tAddElementToObject(request, "c", c)\n').includes ('if v := c; v != nil {'), 'pointer local value');
        ok (w ('\tAddElementToObject(request, "c", this.CostToPrecision("s", p))\n').includes ('AddElementToObject('), 'any-returning call keeps helper');
        ok (formatGoSource ('selftest.go', 'func (this *X) PriceToPrecision(a any, b any) any {\n\treturn nil\n}\n' + 'func (this *X) f(p any) any {\n\tvar request map[string]any = map[string]any{}\n\tAddElementToObject(request, "p", this.PriceToPrecision("s", p))\n\treturn request\n}\n').includes ('AddElementToObject('), 'same-file any override keeps helper');
        ok (f (d + '\tx := GetValue(h, 0)\n\tt = x\n', 'func (this *X) HandleParamString(a any, b any) []any {\n\treturn nil\n}\n').includes ('GetValue(h, 0)'), 'producer overridden in the file keeps helper');
    } catch (e) {
        problems.push ('hx4 G39 threw: ' + e.message);
    }
    return problems;
}

// hx4 G39: the helper stores derefScalar(v); for a typed pointer v (a pointer local, or one call of a method whose
// Go signature in this file or the base returns *T) that is `*v` or nil, printed as an inline closure.
function hx4G39PointerValue (lines: string[], value: string, valueMasked: string, valueType: string | undefined): string | undefined {
    const basePtrCalls = [ 'NumberToString', 'PriceToPrecision', 'AmountToPrecision', 'SafeString', 'SafeString2', 'SafeStringN',
        'SafeStringLower', 'SafeStringUpper', 'SafeCurrencyCode', 'SafeSymbol', 'SafeInteger', 'SafeInteger2', 'SafeNumber', 'SafeBool' ];
    const wrap = (x: string) => 'func() any {\n\tif v := ' + x + '; v != nil {\n\t\treturn *v\n\t}\n\treturn nil\n}()';
    if (/^\w+$/.test (value)) {
        return (GO_ACCESS_DEREF_POINTER_TYPES.indexOf (valueType ?? '') >= 0) ? wrap (value) : undefined;
    }
    const call = /^this\.(\w+)\(/.exec (valueMasked);
    if ((call === null) || (value.indexOf ('\n') >= 0) || (goMapWriteGroupEnd (valueMasked, call[0].length - 1) !== valueMasked.length)) {
        return undefined;
    }
    const sigs = lines.filter ((l) => l.startsWith ('func (this *') && l.includes (') ' + call[1] + '('));
    const declared = sigs.map ((l) => / (\*(?:string|int64|float64|bool)) \{$/.exec (l)?.[1] ?? '');
    if (declared.some ((t) => t === '') || ((sigs.length === 0) && (basePtrCalls.indexOf (call[1]) < 0))) {
        return undefined;
    }
    return wrap (value);
}

// hx4 G40 (hx5 X23: an unproven IsEqual stays the helper call; a typed map against nil becomes `m == nil`)
// hx10 G04: the typed operand comparison pass must run in both write paths
function g04Wired (): string[] {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'hx10-G04-'));
    const file = path.join (dir, 'x.go');
    const body = 'func (this *X) F(p any) any {\n\tvar a *string = this.SafeString(p, "a")\n\tvar b *string = this.SafeString(p, "b")\n\tif IsEqual(a, b) {\n\t\treturn nil\n\t}\n\treturn a\n}\n';
    try {
        overwriteFileAndFolder (file, 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\n' + body);
        const out = fs.readFileSync (file, 'utf8');
        if (!out.includes ('if a == b || (a != nil && b != nil && *a == *b) {')) {
            return [ 'hx10 G04: not wired into overwriteFileAndFolder: ' + out ];
        }
        const base = hx4G20BaseNativePasses ('package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\n' + body);
        if (!base.includes ('if a == b ||')) {
            return [ 'hx10 G04: not wired into the base-methods chain: ' + base ];
        }
        return [];
    } finally {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
}

function hx4G40Wired (): string[] {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G40-'));
    const file = path.join (dir, 'x.go');
    try {
        overwriteFileAndFolder (file, 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\nfunc (this *X) F(a any, m map[string]any) any {\n\tif IsEqual(m, nil) {\n\t\treturn nil\n\t}\n\treturn IsEqual(a, "x")\n}\n');
        const out = fs.readFileSync (file, 'utf8');
        return (!out.includes ('return IsEqual(a, "x")') || !out.includes ('\tif m == nil {\n') || out.includes ('reflect') || out.includes ('func(a')) ? [ 'hx4 G40: not wired into overwriteFileAndFolder: ' + out ] : [];
    } finally {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
}

// hx4 G43
function hx4G43Wired (): string[] {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G43-'));
    const file = path.join (dir, 'x.go');
    try {
        overwriteFileAndFolder (file, 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\nfunc (this *X) F(a any, s string) any {\n\treturn ToUpper(a) + ToUpper(s)\n}\n');
        const out = fs.readFileSync (file, 'utf8');
        // hx5 X26: proven `string` goes native in plain spelling, the `any` operand keeps the helper, no closure
        return (!out.includes ('return ToUpper(a) + strings.ToUpper(s)') || !out.includes ('import "strings"') || out.includes ('func(v any)')) ? [ 'hx5 X26: not wired into overwriteFileAndFolder: ' + out ] : [];
    } finally {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
}

// hx4 G45
function hx4G45Wired (): string[] {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'hx4-G45-'));
    const file = path.join (dir, 'x.go');
    try {
        // hx5 X28: proven string operands go native, the any operand keeps the helper call
        overwriteFileAndFolder (file, 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\nfunc (this *X) F(a any, s string) any {\n\treturn GetIndexOf(s, "/") + GetLength(s) + GetLength(a)\n}\n');
        const out = fs.readFileSync (file, 'utf8');
        return (!out.includes ('strings.Index(s, "/") + len(s) + GetLength(a)') || !out.includes ('import "strings"') || /func\(/.test (out)) ? [ 'hx5 X28: G45 not wired into overwriteFileAndFolder: ' + out ] : [];
    } finally {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
}

// hx5 X29
function hx5X29Wired (): string[] {
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'hx5-X29-'));
    const file = path.join (dir, 'x.go');
    try {
        overwriteFileAndFolder (file, 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\nfunc (this *X) F(a any, s string) any {\n\treturn this.G(ToString(a), ToString(s))\n}\n');
        const out = fs.readFileSync (file, 'utf8');
        return (!out.includes ('this.G(ToString(a), s)') || out.includes ('func(v any)')) ? [ 'hx5 X29: not wired into overwriteFileAndFolder: ' + out ] : [];
    } finally {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
}

// hx5 X24
// InOp has exactly two outcomes: goNativeInOp / g10kInopClientMaps / hx4G07FieldInOp emit `_, ok := m[k]`
// on a proven map[string]any read receiver with a proven string key; every other site keeps the
// InOp(dict, key) helper call (nil/numeric keys, *sync.Map, order books, cache maps, addElementMu lock).
// The hx4 G41 inline `func(a, b any) bool {..}(X, Y)` closure is gone: no pass may paste the helper body.
function hx4G41Check (): string[] {
    const problems: string[] = [];
    const head = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\n';
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'hx5-X24-'));
    try {
        const cases = [
            head + 'func (this *X) F(a any) any {\n\treturn InOp(a, "k")\n}\n',
            'package ccxtpro\n\nimport ccxt "github.com/ccxt/ccxt/go/v4"\n\n' + head.slice (14) + 'func (this *K) F(c any, h any) bool {\n\treturn ccxt.InOp(this.Orderbooks, h)\n}\n',
            head + 'func (this *K) F(o any, n any) any {\n\tif InOp(o, "a, b") && !InOp(GetValue(o, n), n) {\n\t}\n\treturn nil\n}\n',
        ];
        for (const [ i, src ] of cases.entries ()) {
            const file = path.join (dir, 'x' + i + '.go');
            overwriteFileAndFolder (file, src);
            const out = fs.readFileSync (file, 'utf8');
            if (/func\(a, b any\) bool|AddElementMu|import "reflect"/.test (out) || !/InOp\(/.test (out)) {
                problems.push ('hx5 X24: unproven InOp must stay a helper call: ' + out);
            }
        }
    } finally {
        fs.rmSync (dir, { 'recursive': true, 'force': true });
    }
    return problems;
}

// hx5 X32
// a nullable `Str` parameter whose callers pass `*string` or a proven Go `string` prints `*string`;
// the string callers are boxed with SafeStringPtr (never nil); any other caller keeps the `any` box
function hx5X32StrParamSelfTest (): string[] {
    const problems: string[] = [];
    const tmp = fs.mkdtempSync (path.join (os.tmpdir (), 'hx5-X32-'));
    try {
        const src = path.join (tmp, 'ts', 'src');
        fs.mkdirSync (path.join (src, 'base'), { 'recursive': true });
        fs.writeFileSync (path.join (src, 'base', 'Exchange.ts'), 'export type Dict = { [key: string]: any };\nexport type Str = string | undefined;\n'
            + 'export class Exchange {\n    safeString (a, b, c?): Str { return undefined; }\n}\n');
        fs.writeFileSync (path.join (src, 'ex.ts'), 'import { Exchange, Dict, Str } from \'./base/Exchange\';\nexport class ex extends Exchange {\n'
            + '    req (symbol: Str, side: Str): Dict { const r: Dict = {}; if (side === \'buy\') { r[\'s\'] = 1; } if (symbol !== undefined) { r[\'y\'] = 2; } return r; }\n'
            + '    boxed (side: Str): Dict { const r: Dict = {}; if (side === \'buy\') { r[\'s\'] = 1; } return r; }\n'
            + '    use (o: Dict, raw) { const s: string = \'BTC\'; const p = this.safeString (o, \'p\'); this.boxed (raw); return [ this.req (s, p), this.req (p, \'sell\') ]; }\n}\n');
        const t = new Transpiler ({ 'verbose': false, 'go': {} });
        installCcxtGoLocalTypes (t.goTranspiler);
        installCcxtGoIndexableTypes (t.goTranspiler);
        const go = t.transpileGoByPath (path.join (src, 'ex.ts')).content;
        const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx5 X32: ' + msg + '\n' + go); } };
        ok (go.includes ('func (this *ex) Req(symbol *string, side *string) map[string]any {'), 'string/*string callers type the Str params');
        ok (go.includes ('this.Req(SafeStringPtr(s), p)') && go.includes ('this.Req(p, SafeStringPtr("sell"))'), 'string arguments are boxed with SafeStringPtr');
        ok (go.includes ('func (this *ex) Boxed(side any) map[string]any {') && go.includes ('this.Boxed(raw)'), 'an any caller keeps the box');
        ok (!/IsEqual\(side, "buy"\)/.test (go.split ('func (this *ex) Boxed')[0]), 'typed param compares natively');
    } catch (e: any) {
        problems.push ('hx5 X32 threw: ' + e.message);
    } finally {
        fs.rmSync (tmp, { 'recursive': true, 'force': true });
    }
    return problems;
}

// hx5 X27
// Split/Join/Replace: a proven non-pointer `string` (Split/Replace subject) or `[]string` (Join subject) whose other
// operands are string literals or proven `string`s takes the plain stdlib call; every other site keeps the helper
// call exactly as emitted. Operands are moved verbatim, so each is still evaluated once.
function hx5X27Close (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; } else if ((c === ')') || (c === ']') || (c === '}')) { depth--; if (depth === 0) { return i; } }
    }
    return -1;
}

function hx5X27Args (masked: string, open: number, close: number): number[][] {
    const spans: number[][] = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open + 1; i < close; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; } else if ((c === ')') || (c === ']') || (c === '}')) { depth--; } else if ((c === ',') && (depth === 0)) { spans.push ([ start, i ]); start = i + 1; }
    }
    spans.push ([ start, close ]);
    return spans;
}

// the single static Go type of `name` in this func chunk (masked): its parameter type or every `var name T`
// declaration agreeing; undefined when any `:=`, range, or func-literal binding could rebind it to another type
function hx5X27DeclType (chunk: string, name: string): string | undefined {
    const brace = chunk.indexOf ('{');
    const sig = chunk.slice (0, brace + 1);
    const body = chunk.slice (brace + 1);
    if (new RegExp ('(?<![\\w.])' + name + '\\s*(?:,[\\w\\s,]*)?:=|,\\s*' + name + '\\s*(?:,[\\w\\s,]*)?:=|\\bfunc\\s*\\([^)]*\\b' + name + '\\b|\\brange\\b[^\\n]*\\b' + name + '\\b').test (body)) {
        return undefined;
    }
    const types = [ ...body.matchAll (new RegExp ('\\bvar ' + name + ' ([^=\\n]+?)\\s*(?:=|\\n)', 'g')) ].map ((m) => m[1].trim ());
    if (new RegExp ('\\b' + name + '\\b').test (sig)) {
        const param = new RegExp ('[(,]\\s*' + name + '((?:\\s*,\\s*\\w+)*)\\s+([^,()]+?)\\s*[,)]').exec (sig);
        if (!param) {
            return undefined;
        }
        types.push (param[2].trim ());
    }
    return ((types.length > 0) && types.every ((t) => t === types[0])) ? types[0] : undefined;
}

export function hx5X27StringHelpers (content: string): string {
    if ((content.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') < 0) || (content.indexOf ('// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md') < 0)) {
        return content;
    }
    const rx = /(?<![\w.])(?:ccxt\.)?(Split|Join|Replace)\(/g;
    let masked = goTextMaskLiteralsAndComments (content);
    const calls = [ ...masked.matchAll (rx) ].map ((m) => ({ 'start': m.index as number, 'helper': m[1], 'open': (m.index as number) + m[0].length - 1 }))
        .filter ((c) => !/\bfunc\s*(?:\([^)]*\)\s*)?$/.test (masked.slice (Math.max (0, c.start - 80), c.start)));
    calls.sort ((x, y) => y.start - x.start);
    const shadow = /(?<![\w.])strings\s*(?::=|,\s*\w+\s*:?=)|\bvar strings\b|[(,]\s*strings\s+[\w*[]/;
    let text = content;
    let used = false;
    for (const call of calls) {
        const close = hx5X27Close (masked, call.open);
        if (close < 0) { continue; }
        const spans = hx5X27Args (masked, call.open, close);
        if ((spans.length !== ((call.helper === 'Replace') ? 3 : 2)) || spans.some (([ s, e ]) => text.slice (s, e).trim () === '')) { continue; }
        const fnStart = masked.lastIndexOf ('\nfunc ', call.start) + 1;
        const fnEnd = masked.indexOf ('\n}\n', call.start);
        const chunk = masked.slice (fnStart, (fnEnd < 0) ? masked.length : fnEnd + 2);
        if (shadow.test (chunk)) { continue; }
        const args = spans.map (([ s, e ]) => text.slice (s, e).trim ());
        const typeOf = (a: string) => (/^"(?:[^"\\\n]|\\.)*"$|^`[^`]*`$/.test (a) ? 'string' : (/^\w+$/.test (a) ? hx5X27DeclType (chunk, a) : undefined));
        const subject = (call.helper === 'Join') ? '[]string' : 'string';
        if ((typeOf (args[0]) !== subject) || args.slice (1).some ((a) => typeOf (a) !== 'string')) { continue; }
        const native = 'strings.' + ((call.helper === 'Replace') ? 'ReplaceAll' : call.helper) + '(' + args.join (', ') + ')';
        text = text.slice (0, call.start) + native + text.slice (close + 1);
        masked = masked.slice (0, call.start) + goTextMaskLiteralsAndComments (native) + masked.slice (close + 1);
        used = true;
    }
    return used ? hx4G36AddImport (text, 'strings') : text;
}

function hx5X27Check (): string[] {
    const problems: string[] = [];
    const head = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\n';
    const run = (body: string, sig = 'a any, b any') => hx5X27StringHelpers (head + 'func (this *K) F(' + sig + ') any {\n' + body + '\n}\n');
    // proven local subject + literal operands: plain stdlib call, no parens, import added
    const out = run ('\tvar ids []string = ObjectKeys(a)\n\tvar x string = Join(ids, ",")\n\tvar y []string = ccxt.Split(x, "-")\n\treturn Replace(Join(a, b), "x", "")');
    if (!out.includes ('var x string = strings.Join(ids, ",")') || !out.includes ('var y []string = strings.Split(x, "-")') || !out.includes ('return Replace(Join(a, b), "x", "")') || !out.includes ('import "strings"\n') || out.includes ('func(') || out.includes ('(strings.')) {
        problems.push ('hx5 X27: shape: ' + out);
    }
    // widened proof: `string` / grouped parameters and proven-string separators
    const par = run ('\treturn Replace(s, sep, "")', 'a any, s, sep string');
    if (!par.includes ('return strings.ReplaceAll(s, sep, "")')) {
        problems.push ('hx5 X27: string parameter not proven: ' + par);
    }
    // unproven: *string, any, := rebinding, call-expression subject, unproven separator -> helper call left alone
    const keep = [
        run ('\tvar m *string = this.SafeString(a, "m")\n\treturn Split(m, "_")'),
        run ('\treturn Split(a, "_")'),
        run ('\tvar s string = "x"\n\tif true {\n\t\ts := a\n\t\t_ = s\n\t}\n\treturn Split(s, "_")'),
        run ('\treturn Split(ToString(a), "_")'),
        run ('\tvar s string = "x"\n\treturn Split(s, b)'),
        run ('\tstrings := a\n\tvar s string = "x"\n\treturn Split(s, "_")'),
    ];
    for (const k of keep) {
        if (!k.includes ('return Split(') || k.includes ('func(') || k.includes ('import "strings"')) {
            problems.push ('hx5 X27: unproven site not left as the helper call: ' + k);
        }
    }
    if (run ('\tvar ids []string = nil\n\treturn Join(ids, ",")') !== hx5X27StringHelpers (run ('\tvar ids []string = nil\n\treturn Join(ids, ",")'))) {
        problems.push ('hx5 X27: not idempotent');
    }
    const hand = 'package ccxt\n\nfunc Join(slice any, sep any) string {\n\treturn Join(slice, sep)\n}\n';
    if (hx5X27StringHelpers (hand) !== hand) {
        problems.push ('hx5 X27: hand-written file rewritten');
    }
    return problems;
}

// hx5 P28
// GetValue(this.<F>, k) -> this.<F>[k] for the base fields Go declares `map[string]any` and every writer keeps a
// plain map of plain values (Has, Features, Timeframes, Urls; go/v4/exchange.go + exchange_options.go). Options and
// MarketsById are *sync.Map and never match. A nil map indexes to nil like the helper; k must be a literal or a
// single-declared `string` (GetValue answers nil for a nil key, which `m[k]` cannot express). A file that assigns the
// whole field from anything but a map literal keeps the helper for that field.
function hx5P28BaseFieldReads (content: string): string {
    const fieldRx = /(?<![\w.])(?:ccxt\.)?GetValue\(this\.(?:Has|Features|Timeframes|Urls), /;
    if (!fieldRx.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goTextMaskLiteralsAndComments (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const maskedAll = masked.join ('\n');
    const fields = [ 'Has', 'Features', 'Timeframes', 'Urls' ].filter ((f) => {
        const writes = [ ...maskedAll.matchAll (new RegExp ('(?<![\\w.])this\\.' + f + '\\s*=(?!=)\\s*([^\\n]*)', 'g')) ];
        return writes.every ((w) => /^map\[string\]any\{/.test (w[1]));
    });
    if (fields.length === 0) {
        return content;
    }
    const callRx = new RegExp ('(?<![\\w.])(?:ccxt\\.)?GetValue\\(this\\.(' + fields.join ('|') + '), (\\w+|"[^"\\\\\\n]*")\\)', 'g');
    let start = -1;
    let maskedFunc = '';
    let offsets: number[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = lines[k].startsWith ('func (this *') ? k : -1;
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            maskedFunc = masked.slice (k, end + 1).join ('\n');
            offsets = [];
            let o = 0;
            for (let j = k; (j <= end) && (j < lines.length); j++) {
                offsets.push (o);
                o += masked[j].length + 1;
            }
            continue;
        }
        if (lines[k] === '}') {
            start = -1;
            continue;
        }
        if ((start < 0) || !masked[k].includes ('GetValue(this.')) {
            continue;
        }
        const line = lines[k];
        const mk = masked[k];
        lines[k] = line.replace (callRx, ((m: string, field: string, key: string, off: number) => {
            if (mk.slice (off, off + m.length).indexOf ('GetValue(this.') < 0) {
                return m; // inside a string literal or comment
            }
            if (!key.startsWith ('"')) {
                const decl = goAccessSingleDeclaration (maskedFunc, lines[start], key);
                if ((decl === undefined) || (decl.type !== 'string') || ((decl.index !== undefined) && (decl.index >= offsets[k - start]))) {
                    return m;
                }
            }
            return 'this.' + field + '[' + key + ']';
        }) as any);
        masked[k] = goTextMaskLiteralsAndComments (lines[k]);
    }
    return lines.join ('\n');
}

function hx5P28Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx5 P28: ' + message); } };
    try {
        const f = (sig: string, body: string, extra = '') => hx5P28BaseFieldReads ('package ccxt\n' + extra + 'func (this *X) H(' + sig + ') any {\n' + body + '\treturn nil\n}\n');
        ok (f ('timeframe string', '\tvar r any = GetValue(this.Timeframes, timeframe)\n').includes ('\tvar r any = this.Timeframes[timeframe]\n'), 'string param key');
        ok (f ('', '\turl := this.ImplodeHostname(GetValue(GetValue(this.Urls, "api"), "public"))\n').includes ('GetValue(this.Urls["api"], "public")'), 'literal key, outer GetValue kept');
        ok (f ('', '\tvar m string = "spot"\n\tif IsEqual(ccxt.GetValue(this.Features, m), nil) {\n\t}\n').includes ('IsEqual(this.Features[m], nil)'), 'string local key, ccxt prefix');
        ok (f ('', '\tvar a any = GetValue(this.Has, "x")\n', 'func (this *X) G() {\n\tthis.Features = map[string]any{}\n}\n').includes ('this.Has["x"]'), 'map-literal field write keeps proof');
        for (const keep of [
            f ('source any', '\tvar r any = GetValue(this.Has, source)\n'),
            f ('m *string', '\tvar r any = GetValue(this.Features, m)\n'),
            f ('', '\tvar r any = GetValue(this.Options, "x")\n'),
            f ('', '\tvar r any = GetValue(this.MarketsById, "x")\n'),
            f ('', '\tvar r any = GetValue(this.Balance, "x")\n'),
            f ('', '\tvar r any = GetValue(this.Orderbooks, "x")\n'),
            f ('', '\tvar r any = GetValue(this.Urls, s)\n\tvar s string = "a"\n'),
            f ('', '\tvar r any = GetValue(this.Urls, "api")\n', 'func (this *X) G(u any) {\n\tthis.Urls = u.(map[string]any)\n}\n'),
            f ('', '\tvar r string = "GetValue(this.Has, \\"x\\")"\n'),
            hx5P28BaseFieldReads ('func H(this any) any {\n\treturn GetValue(this.Urls, "a")\n}\n'),
        ]) {
            ok (keep.includes ('GetValue('), 'keeps GetValue: ' + keep);
        }
        const once = f ('t string', '\tvar r any = GetValue(this.Timeframes, t)\n');
        ok (hx5P28BaseFieldReads (once) === once, 'idempotent');
    } catch (e) {
        problems.push ('hx5 P28 threw: ' + e.message);
    }
    return problems;
}

// ===== hx10 w9 GB09: credential fields are plain Go strings =====
// go/v4/exchange.go declares ApiKey/Secret/Uid/Password/AccountId/WalletAddress/PrivateKey `string`,
// so an absent key is "" and never a nil box: their nil tests print as empty-string tests, a
// nil/empty pair collapses to its empty half, and a defaulted SafeString write into one derefs.
function gb09CredentialFields (): string[] {
    return [ 'ApiKey', 'Secret', 'Uid', 'Password', 'AccountId', 'WalletAddress', 'PrivateKey' ];
}

// `this.<Field> = this.SafeString(..., "<literal>")`: the literal default makes the call non-nil
function gb09CredentialWrite (line: string): string | undefined {
    const m = /^(\t*this\.(\w+) = )(this\.[\w]+\(.*\))$/.exec (line);
    if ((m === null) || (gb09CredentialFields ().indexOf (m[2]) < 0)) {
        return undefined;
    }
    const call = m[3];
    const inner = call.slice (call.indexOf ('(') + 1, -1);
    const args = goAddSplitTop (inner, inner, ',');
    if ((args === null) || (args.length < 3)) {
        return undefined; // no default: the call can be nil, keep it (a compile error, not a panic)
    }
    if (!/^"(?:[^"\\$\n]|\\.)*"$/.test (args[args.length - 1].trim ())) {
        return undefined;
    }
    return m[1] + '*' + call;
}

export function gb09CredentialStrings (content: string): string {
    if (content.indexOf ('this.') < 0) {
        return content;
    }
    const alt = gb09CredentialFields ().join ('|');
    const nilOrEmpty = new RegExp ('\\(this\\.(' + alt + ') == nil\\) \\|\\| \\(this\\.\\1 == ""\\)', 'g');
    const setOrEmpty = new RegExp ('\\(this\\.(' + alt + ') != nil\\) && \\(this\\.\\1 != ""\\)', 'g');
    const bareNilOrEmpty = new RegExp ('(?<![\\w.])this\\.(' + alt + ') == nil \\|\\| this\\.\\1 == ""', 'g');
    const bareSetOrEmpty = new RegExp ('(?<![\\w.])this\\.(' + alt + ') != nil && this\\.\\1 != ""', 'g');
    const equalNil = new RegExp ('(!?)(?<![\\w.])(?:ccxt\\.)?IsEqual\\(this\\.(' + alt + '), nil\\)', 'g');
    const isNil = new RegExp ('(?<![\\w.])this\\.(' + alt + ') == nil', 'g');
    const isNotNil = new RegExp ('(?<![\\w.])this\\.(' + alt + ') != nil', 'g');
    const lines = content.split ('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if ((line.indexOf ('this.') < 0) || ((line.indexOf ('nil') < 0) && (line.indexOf ('SafeString') < 0))) {
            continue;
        }
        let out = line;
        if (out.indexOf ('nil') >= 0) {
            out = out.replace (nilOrEmpty, '(this.$1 == "")');
            out = out.replace (setOrEmpty, '(this.$1 != "")');
            out = out.replace (bareNilOrEmpty, 'this.$1 == ""');
            out = out.replace (bareSetOrEmpty, 'this.$1 != ""');
            out = out.replace (equalNil, ((_m: string, not: string, field: string) => 'this.' + field + ((not === '!') ? ' != ""' : ' == ""')) as any);
            out = out.replace (isNil, 'this.$1 == ""');
            out = out.replace (isNotNil, 'this.$1 != ""');
        }
        if (out.indexOf ('SafeString') >= 0) {
            const written = gb09CredentialWrite (out);
            if (written !== undefined) {
                out = written;
            }
        }
        if (out !== line) {
            lines[i] = out;
        }
    }
    return lines.join ('\n');
}

function gb09Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 w9 GB09: ' + message); } };
    try {
        const f = (text: string) => gb09CredentialStrings (text);
        const nilTest = '\tif this.ApiKey == nil {';
        ok (f (nilTest).indexOf ('if this.ApiKey == "" {') >= 0, 'nil test prints as the empty-string test: ' + f (nilTest));
        const pair = '\tvar s bool = (this.PrivateKey != nil) && (this.PrivateKey != "")';
        ok (f (pair).indexOf ('var s bool = (this.PrivateKey != "")') >= 0, 'nil/empty pair collapses: ' + f (pair));
        const boxed = '\tif this.Token == nil || this.Login == nil {';
        ok (f (boxed) === boxed, 'Token/Login stay boxed: ' + f (boxed));
        const write = '\tthis.ApiKey = this.SafeString(creds, "apiKey", "")';
        ok (f (write).indexOf ('this.ApiKey = *this.SafeString(creds, "apiKey", "")') >= 0, 'defaulted write derefs: ' + f (write));
        const nilable = '\tthis.ApiKey = this.SafeString(creds, "apiKey")';
        ok (f (nilable) === nilable, 'nil-able write keeps the call: ' + f (nilable));
        const once = f (pair + '\n' + write + '\n' + nilTest);
        ok (f (once) === once, 'idempotent');
    } catch (e) {
        problems.push ('hx10 w9 GB09 threw: ' + e.message);
    }
    return problems;
}
