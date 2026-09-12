// Concrete Java types for generated return signatures and locals — the parse*
// family: parse*Status / parse*Type / parse*Side string mappers, the list-returning
// parse helpers, and the timestamp/symbol/currency locals inside parse* bodies.
//
// The Java printer (ast-transpiler/src/javaTranspiler.ts) emits `Object` for every
// non-void/non-Promise return annotation (BaseTranspiler.printFunctionType falls back
// to DEFAULT_RETURN_TYPE unless the type is void/Promise) and `Object` for every
// initialised body local (VAR_TOKEN). This module narrows a CLOSED set of names whose
// value is ALREADY the named type at runtime, and the locals whose initializer is a
// whole call to one of them:
//
//     public Object parseOrderStatus(Object status)   ->   public String parseOrderStatus(Object status)
//     Object status = this.parseOrderStatus(x);       ->   String status = this.parseOrderStatus(x);
//     public Object parseOrders(Object orders, ...)   ->   public java.util.List<Object> parseOrders(...)
//     Object trades = this.parseTrades(x);            ->   java.util.List<Object> trades = this.parseTrades(x);
//     Object timestamp = this.safeInteger2(o, k1, k2);->   Long timestamp = (Long) this.safeInteger2(o, k1, k2);
//     Object symbol = this.safeSymbol(marketId);      ->   String symbol = (String) this.safeSymbol(marketId);
//
// Wired from build/javaTranspiler.ts (setupTranspiler) AND build/java-worker.ts
// (direct import) — both patch the same printer via installJavaLocalTypes, exactly
// like patchJavaLocalTypes / csharp-local-types.js. The ast-transpiler pin is untouched.
//
// ===== 1. string-returning method signatures =====
//
// JAVA_STRING_RETURN_METHODS is a CLOSED, per-name table (84 names, ~250 generated
// declarations). A name is listed only when a census of every generated declaration of
// the name (BaseExchange.java suffix, exchanges/*, exchanges/pro/*,
// exchanges/prediction/*) proved that EVERY return expression is already string-typed
// in Java:
//
//   * `this.safeString / safeString2 / safeStringN (...)` — hand-written, declared String;
//   * string literals and `null` (TS `undefined` prints as null for these sync methods);
//   * `this.decimalToPrecision / numberToString (...)` — hand-written, declared String;
//   * `Precise.stringMul/Div/Sub/Add/...` — declared `public static String` in Precise.java;
//   * `Helpers.slice (...)` — declared `public static String` in Helpers.java;
//   * `String.valueOf(...)`, `String.join(...)`, `((String)x).toLowerCase()/.toUpperCase()`
//     (the printer's own cast emits);
//   * a ternary whose arms are all of the above (null + String unifies to String);
//   * a `this.<listed name>(...)` or `super.<listed name>(...)` call (fixpoint), which
//     after this retype returns the same type.
//
// Four names (JAVA_STRING_RETURN_METHODS_CASE_CAST) additionally carry a small number of
// `this.safeStringUpper/Lower (...)` return sites. The C# campaign's equivalent retype
// (`csharp-local-types.js` CSHARP_STRING_RETURN_METHODS) was cast-free because the C#
// base declares the case family `string?`; the Java base declares it `Object`
// (BaseExchange.safeStringUpper/Lower*), so those ~5 sites get the same `(String)`
// checkcast the local-typing side already uses for this family — a checkcast on a
// String/null is free. The value on the default-taken path is the caller's raw argument
// (same corner the C# `string?` retype accepts); every generated caller passes a
// string-ish value.
//
// The decision is per NAME, so a base virtual and every override always print the same
// return type (Java requires invariant/covariant compatible returns). Names whose census
// found any other return shape — a local identifier, `Helpers.add(...)`, a `this.<name>`
// that is not in the table, a `super.<name>` that is not in the table, a `Precise.string*`
// outside the String set — stay Object; the census is in the JAVA-15 report.
//
// ===== 2. list-returning parse families -> java.util.List<Object> =====
//
// JAVA_LIST_RETURN_METHODS (11 names) retypes the parse/filter collection helpers whose
// every return site yields a list (or null) at runtime:
//
//   * parseTrades / parseTradesHelper / parseOrders / parseOHLCVs / parseTransactions /
//     parseLedger — the parse* bodies return `new java.util.ArrayList<Object>(...)` or
//     another listed name (fixpoint);
//   * filterByLimit / filterBySinceLimit / filterByValueSinceLimit /
//     filterBySymbolSinceLimit / filterByCurrencySinceLimit — the base filter chain.
//     Two of their return shapes need the same `(java.util.List<Object>)` checkcast the
//     signature now grants: `return this.arraySlice(...)` (the hand-written arraySlice
//     returns an ArrayList on every path — byte[] inputs included — and throws on
//     anything else, never null) and filterByLimit's `return <own array parameter>`
//     (the parameter is reassigned from arraySlice results inside the body; a non-list
//     input threw on the arraySlice path before, and a checkcast only moves that throw
//     to the return site).
//
// Deliberately absent: parseTickers / parsePositions / parseFundingRates /
// parseOpenInterests (they funnel through filterByArray, which hands back a keyed
// dictionary when `indexed` is true — argument-dependent, so not a list type; the C#
// census reached the same conclusion), parseWsTrade / parseWsTrades (their ws overrides
// are a regeneration of their own), filterByArray / filterByArrayTickers /
// filterBySymbol / filterByKey (dictionary on the indexed path), arraySlice / toArray
// (byte[] callers receive byte[] / List<Byte> back).
//
// ===== 3. locals fed by the retyped methods and the parse* accessors =====
//
// A local whose initializer is a whole call to
//   * a listed string name                        -> String            (no cast: declared String)
//   * a listed list name                          -> java.util.List<Object> (no cast)
//   * this.parse8601(...)                         -> Long              (no cast: hand-written `public Long parse8601`)
//   * this.iso8601(...)                           -> String            (no cast: hand-written `public String iso8601`)
//   * this.safeInteger2(...)                      -> Long + (Long)     cast family
//   * this.safeSymbol(...) / safeCurrencyCode(...)-> String + (String) cast family
//
// A later plain `x = this.<accessor>(...)` write on an already-narrowed local keeps the
// declaration only while the value is a same-family box, and gets the same checkcast:
// safeInteger / safeInteger2 / safeIntegerN -> (Long), safeSymbol / safeCurrencyCode and
// the safeStringUpper/Lower family -> (String). safeTimestamp / safeTimestamp2 are
// deliberately NOT admitted anywhere: SafeMethods.safeTimestampN hands the caller's
// default back untouched (`if (result == null) return defaultValue;`), so its box is not
// always a Long and a `(Long)` cast could throw where the old Object write could not.
//
// CAST FAMILIES — declared `Object` in the hand-written/generated base but the runtime
// box is the named type or null on every path:
//   * safeInteger2 (ts/src/base/functions/type.ts -> SafeMethods.SafeInteger2 ->
//     SafeIntegerN returns `Long` or null on every path);
//   * safeSymbol (generated BaseExchange: `Helpers.GetValue(market, "symbol")` — the
//     symbol field of a market row, a String on every shipment path, null when the key
//     is absent) / safeCurrencyCode (same for "code"; the only venue override is
//     ts/src/kraken.ts, which returns the caller's currencyId only on the
//     `Helpers.isEqual(currencyId, null)` path — null — and a String otherwise).
//
// The call is admitted only when its resolved signature still lives in the hand-written
// base (the same guard the safeString machinery uses): a venue override is transpiled
// with its own Object signature and must never classify. parse8601/iso8601 are instance
// fields assigned from ts/src/base/functions/time.ts functions, so the checker exposes
// no declaration for the call; they are accepted by name — they are hand-written Java
// methods (`BaseExchange.parse8601` declared Long, `iso8601` declared String) and no
// generated file declares an override (census).
//
// SAFETY SCAN (isSafeToNarrow, per local, scanning every use of the declared name in the
// enclosing function): a later write must be a same-family call / null / undefined; ++,
// --, compound assignment, spread, array-destructuring and `typeof` reject the local;
// method calls ON the local are accepted only for the receiver whitelist of the type —
// the printer casts receivers explicitly (`((String)x).toUpperCase()`,
// `((java.util.List<Object>)x).add(...)`), so an incompatible receiver method is a
// guaranteed javac error (inconvertible types) and stays Object; and in pro files a
// local that feeds an inherited async call keeps Object (the typed-rest-wrapper overload
// resolution trap, see patchJavaLocalTypes).
//
// ===== 4. locals fed by string/array method calls and Math builtins =====
//
// A second, independent table family narrows a local whose initializer is a WHOLE
// non-`this` call the printer rewrites to a known Java shape (the full list, with the
// printed form and the preconditions, sits above RECEIVER_METHOD_LOCAL_ENTRIES):
// `x.split(sep)` -> java.util.List<Object> (Helpers.split is declared Object -> the
// declaration carries the checkcast), `x.join(sep)`/`x.toUpperCase()`/`toLowerCase()`/
// `trim()`/`replace`/`replaceAll`/`slice`/`padStart`/`padEnd`/`x.toString()` -> String,
// `x.indexOf(y)`/`x.search(y)`/`x.length` -> Integer, `x.includes/startsWith/endsWith` ->
// Boolean, `Math.abs/pow/floor/ceil` -> Double, `Math.round` -> Long.
//
// The printed value must start with the prefix (or match the regex) the entry records —
// defense in depth against a printer that lowered the call differently — and the TS
// argument count must be one the printer's dispatch accepts. Math.min/Math.max (the
// helper hands the original operand back), x.concat (mixed box), String(x)/Number(x)
// (no printer rule, no call site) and x.substring (never rewritten) are deliberately
// absent; the reasons are in the block comment above the table.
//
// Two extra guards exist for the shapes a narrowed box changes at COMPILE time beyond
// the receiver whitelists (probe-verified with javac 21):
//   * argument positions the printer hard-casts — `(String)` for startsWith/endsWith
//     arg 0, replace/replaceAll args 1+2, join arg 0, padEnd/padStart arg 1; `(Number)`
//     for the pad length: `(String) integerBox` and `(Number) stringBox` are
//     inconvertible, so a local in one of those slots is rejected unless it is castable
//     to the cast type;
//   * `join` was removed from LIST_RECEIVER_METHODS: `String.join(sep, x)` casts the
//     receiver to `java.util.List<String>`, and `(java.util.List<String>) listOfObject`
//     is inconvertible (javac).
//   * a nullable String family (slice/replace/replaceAll) on the LEFT of `+` is left
//     Object: the print `Helpers.add(x, y)` would switch to the add(String, Object)
//     overload, which returns "nullnull" where add(Object, Object) returned null when
//     both operands are null. The non-null families (toUpperCase/toLowerCase/trim/
//     join/padEnd/padStart/toString: every returning path yields a String or throws)
//     keep their type — for every input the String overloads agree with the Object one.
//
// The declaration keep the printer's shape: only the type token is replaced; the value
// expression is untouched except for the explicit checkcasts above, which move no box.

import ts from 'typescript6';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ===== tables =====

// every name proved string-returning by the tree census (see the header)
export const JAVA_STRING_RETURN_METHODS = new Set ([
    'applyScale', 'convertToInstrumentType', 'convertToX18', 'costToPrecision',
    'costToPredictionPrecision', 'createOrderNonce', 'currencyFromPrecision',
    'encodeOrderSide', 'encodeOrderType', 'encodeTriggerPriceType', 'encodeValuesWithJson',
    'encodeWorkingType', 'feeToPrecision', 'fromEn', 'fromPrecision', 'fromWeiWithDecimals',
    'futuresRequestId', 'getAccountTypeFromUrl', 'getDexFromHip3Symbol', 'getFutureWsCategory',
    'getPrivateType', 'getSubAccountId', 'getTifFromRawOrderType', 'getTypeByMarket',
    'handleTakerOrMaker', 'mapSide', 'mapTimeInForce', 'marketOutcomeToSymbol',
    'outcomeSearchQuery', 'padHex', 'paraseTransferStatus', 'parseAccountId', 'parseAccountType',
    'parseDepositStatus', 'parseFundingInterval', 'parseLedgerDirection',
    'parseLedgerEntryDirection', 'parseLedgerEntryStatus', 'parseLedgerStatus', 'parseLedgerType',
    'parseMarginModeType', 'parseMarginStatus', 'parseMarginType', 'parseMarketType',
    'parseOrderSide', 'parseOrderState', 'parseOrderTimeInForce', 'parseOrderTimeInForceInteger',
    'parseOrderTypeByMarket', 'parseOrderTypeInteger', 'parseStatus', 'parseTakerOrMaker',
    'parseTradeSide', 'parseTradeType', 'parseTradingOrderStatus', 'parseTransactionDepositStatus',
    'parseTransactionState', 'parseTransactionStatus', 'parseTransactionType',
    'parseTransactionWithdrawalStatus', 'parseTransferStatus', 'parseType', 'parseUnits',
    'parseValueToPricision', 'parseWithdrawalStatus', 'parseWsOrderSide', 'parseWsOrderStatus',
    'parseWsOrderType', 'parseWsPositionSide', 'parseWsTimeInForce', 'scaleNumber', 'shortenSlug',
    'signCancelAll', 'signClobOrder', 'signOrderbookTypedData', 'symbol', 'tokenIdToSymbol',
    'typeToTradeType', 'walletAddressFromKeys', 'walletAddressOrUndefined',
]);

// listed names that additionally carry `this.safeStringUpper/Lower (...)` return sites
export const JAVA_STRING_RETURN_METHODS_CASE_CAST = new Set ([
    'parseOrderStatus', 'parseOrderType', 'parseTimeInForce', 'parseTransferType',
]);

// every name proved list-returning by the tree census (see the header)
export const JAVA_LIST_RETURN_METHODS = new Set ([
    'filterByLimit', 'filterBySinceLimit', 'filterByValueSinceLimit',
    'filterBySymbolSinceLimit', 'filterByCurrencySinceLimit',
    'parseTrades', 'parseTradesHelper', 'parseOrders', 'parseOHLCVs',
    'parseTransactions', 'parseLedger',
]);

// one name in both tables is a hard bug: the fixed per-name return type would differ
for (const name of JAVA_LIST_RETURN_METHODS) {
    if (JAVA_STRING_RETURN_METHODS.has (name) || JAVA_STRING_RETURN_METHODS_CASE_CAST.has (name)) {
        throw new Error ('java-local-types: ' + name + ' listed as both string and list returning');
    }
}

// ===== 4. string/crypto/url helper locals (JAVA-RE-6) =====
//
// `Object <name> = this.<helper>(...)` for the base string/crypto/url helpers the
// generated sign()/url-building bodies lean on. Every entry was audited return-path by
// return-path against the hand-written Java implementation (BaseExchange.java,
// base/{Encode,Crypto,Misc,NumberHelpers,String,Time}.java):
//
//   plain  — the Java method is declared `String`, so the retyped declaration needs no
//            cast (a String/null box on every path):
//              json / urlencode / urlencodeNested / urlencodeWithArrayRepeat /
//              urlencodeBase64 / rawencode / stringToBase64 / binaryToBase64 /
//              binaryToBase16 / intToBase16 / jwt / rsa / totp / decode / uuid /
//              uuidv1 / uuid16 / uuid22 / uuid5 (every overload throws — a throw path is
//              fine) / capitalize / numberToString / decimalToPrecision;
//   cast   — declared `Object` while every return path yields a String or null (or
//            throws), so the declaration and every same-family reassignment carry a
//            `(String)` checkcast (free on String/null):
//              implodeParams / implodeHostname (Misc.implodeParams hands back the
//                  `(String) path2` — a non-String path throws ClassCastException and a
//                  null path returns null),
//              hmac (Crypto.Hmac boxes binaryToHex or BinaryToBase64; an unsupported
//                  algo throws),
//              eddsa (Crypto.Eddsa base64-encodes its single return; failures throw).
//
// EXCLUDED on purpose (the C# port's rationale, re-verified against the Java bodies):
//   * hash   — Crypto.Hash returns the raw byte[] for digest "binary" (hyperliquid /
//              kraken / polymarket sign() call it), so its box is not always a String;
//   * encode — BaseExchange.encode returns the UTF-8 byte[] on every path;
//   * binaryToString — no Java implementation exists in the base (0 call sites).
//
// Bare `name(...)` calls (a plain Identifier callee, no `this.`): the generated bodies
// call four of these helpers WITHOUT a receiver and Java binds them to the inherited
// BaseExchange method, exactly like `this.<name>(...)` — Java's implicit this. The set is
// limited to the names a tree census actually found in that shape (all four resolve to
// their ts/src/base/functions/* declarations; a venue-local shadow would resolve to the
// venue file and never classify — no ts/src file outside base/ declares any of them).
export const JAVA_STRING_HELPER_PLAIN = new Set ([
    'json', 'urlencode', 'urlencodeNested', 'urlencodeWithArrayRepeat', 'urlencodeBase64',
    'rawencode', 'stringToBase64', 'binaryToBase64', 'binaryToBase16', 'intToBase16',
    'jwt', 'rsa', 'totp', 'decode', 'uuid', 'uuidv1', 'uuid16', 'uuid22', 'uuid5',
    'capitalize', 'numberToString', 'decimalToPrecision',
]);

// declared `Object` in Java, String-or-null on every audited path — (String) checkcast
export const JAVA_STRING_HELPER_CAST = new Set ([
    'implodeParams', 'implodeHostname', 'hmac', 'eddsa',
]);

// bare-callable names (see the paragraph above): the generated tree calls exactly these
// four without a receiver, and each resolves to a base helper
export const JAVA_STRING_HELPER_BARE = new Set ([ 'jwt', 'rsa', 'eddsa', 'totp' ]);

for (const name of JAVA_STRING_HELPER_CAST) {
    if (JAVA_STRING_HELPER_PLAIN.has (name)) {
        throw new Error ('java-local-types: ' + name + ' listed as both plain and cast helper');
    }
}
if (JAVA_STRING_HELPER_PLAIN.has ('hash') || JAVA_STRING_HELPER_CAST.has ('hash')
    || JAVA_STRING_HELPER_PLAIN.has ('encode') || JAVA_STRING_HELPER_PLAIN.has ('binaryToString')) {
    throw new Error ('java-local-types: hash/encode/binaryToString must never be retyped');
}

// helpers whose locals additionally run the guarded-string scan (the add-left rule and
// the += rule below); the safeString family and the parse*/accessor families keep the
// original scan untouched
export function isGuardedStringHelper (name) {
    return JAVA_STRING_HELPER_PLAIN.has (name) || JAVA_STRING_HELPER_CAST.has (name);
}

// this.<name>(...) -> Java type the call sites print for the LOCALS. Declared return
// types of the hand-written Java base (`cast` entries are declared Object but hand back
// the named box on every path).
const LOCAL_THIS_RETURN_TYPES = {
    'parse8601': { type: 'Long' },
    'iso8601': { type: 'String' },
    'safeInteger2': { type: 'Long', cast: '(Long)' },
    'safeSymbol': { type: 'String', cast: '(String)' },
    'safeCurrencyCode': { type: 'String', cast: '(String)' },
    // JAVA-RE-6 string/crypto/url helpers — see the section-4 header. `plain` entries are
    // declared String in Java; `cast` entries are declared Object but String-or-null on
    // every audited path. The classifier (classifyStringHelperCall) applies the
    // ts/src/base file gate on top of this table.
    'json': { type: 'String' },
    'urlencode': { type: 'String' },
    'urlencodeNested': { type: 'String' },
    'urlencodeWithArrayRepeat': { type: 'String' },
    'urlencodeBase64': { type: 'String' },
    'rawencode': { type: 'String' },
    'stringToBase64': { type: 'String' },
    'binaryToBase64': { type: 'String' },
    'binaryToBase16': { type: 'String' },
    'intToBase16': { type: 'String' },
    'jwt': { type: 'String' },
    'rsa': { type: 'String' },
    'totp': { type: 'String' },
    'decode': { type: 'String' },
    'uuid': { type: 'String' },
    'uuidv1': { type: 'String' },
    'uuid16': { type: 'String' },
    'uuid22': { type: 'String' },
    'uuid5': { type: 'String' },
    'capitalize': { type: 'String' },
    'numberToString': { type: 'String' },
    'decimalToPrecision': { type: 'String' },
    'implodeParams': { type: 'String', cast: '(String)' },
    'implodeHostname': { type: 'String', cast: '(String)' },
    'hmac': { type: 'String', cast: '(String)' },
    'eddsa': { type: 'String', cast: '(String)' },
};

// ===== market/currency structure locals =====
//
// A market/currency row in generated Java is a plain `java.util.HashMap<String, Object>`
// (or LinkedHashMap), never a nominal wrapper: fetchMarkets bodies build rows with the
// printer's object-literal emit, setMarkets merges them through deepExtend/indexBy, and
// markets_by_id / currencies_by_id hold those same boxes. `io.github.ccxt.types.
// MarketInterface` is a generated wrapper class used only by a handful of hand-written
// facade files; naming it in generated code would change the box. `java.util.Map<String,
// Object>` is the lossless spelling — the same conclusion the C# port reached with
// `Dictionary<string, object>`.
//
// The accessors are declared `Object` in the generated BaseExchange (the printer erases
// every non-boolean return annotation), so the narrowed declaration carries an explicit
// checkcast on the box these methods already return — it moves no runtime value:
//
//   * BaseExchange: safeMarketStructure / safeCurrencyStructure build the row with an
//     object-literal emit or deepExtend(...); safeMarket returns a markets_by_id element,
//     a safeMarketStructure result, the caller-passed row, or createExpiredOptionMarket
//     (an object-literal row in every venue override); safeCurrency likewise reads
//     currencies_by_id or safeCurrencyStructure; market()/currency() read this.markets /
//     this.markets_by_id / this.currencies / this.currencies_by_id (rows by construction).
//   * Venue overrides (hyperliquid/binance market; okx/binance/bitflyer/gate/deribit/
//     apex/delta/bybit/bithumb safeMarket): every one delegates to super.<name>(...) or
//     returns a row built by createExpiredOptionMarket / Helpers.add, same contract. The
//     gate is therefore `resolvesToMethodNamed` (any declaration of that name), not the
//     base-file gate the parse* accessors use.
//
// CONSUMERS. Generated code reads these locals through Helpers.GetValue(x, k) /
// this.safeString(x, k) / Helpers.addElementToObject(x, ...) / this.deepExtend(x, ...) —
// every one of those takes Object, and a Map<String, Object> argument binds them exactly
// as before. Java has no implicit downcast, which is why the declaration carries the cast.
const JAVA_STRUCTURE_TYPE = 'java.util.Map<String, Object>';

const STRUCTURE_THIS_RETURN_TYPES = {
    'safeMarket': JAVA_STRUCTURE_TYPE,
    'safeCurrency': JAVA_STRUCTURE_TYPE,
    'safeMarketStructure': JAVA_STRUCTURE_TYPE,
    'safeCurrencyStructure': JAVA_STRUCTURE_TYPE,
    'market': JAVA_STRUCTURE_TYPE,
    'currency': JAVA_STRUCTURE_TYPE,
};

// ts sources that may hold the resolved declaration of an admitted accessor call —
// anything else (a venue override) never classifies
const ACCESSOR_SOURCE_FILES = [
    /[\\/]base[\\/]functions[\\/]type\.ts$/,
    /[\\/]base[\\/]functions[\\/]time\.ts$/,
    /[\\/]base[\\/]Exchange\.ts$/,
];

// time functions are assigned as instance fields (`iso8601 = iso8601;`), so the checker
// resolves no declaration for the call; they are hand-written Java methods with no
// generated override (census), accepted by name
const FIELD_FUNCTION_NAMES = new Set ([ 'parse8601', 'iso8601' ]);

// ===== string-element access locals =====
//
// The printer declares every initialised body local as `Object` and prints element
// reads through the generic helper:
//
//     Object transactionDate = Helpers.GetValue(parts, 0);
//
// This family narrows the locals whose initializer is a whole element read
// `recv[key]` / `recv[index]` when the receiver's runtime elements are provably
// strings — because of how the PRINTED Java builds them:
//
//     String transactionDate = (String) Helpers.GetValue(parts, 0);
//
// `Helpers.GetValue(Object, Object)` returns the boxed element of a List (or null
// off-range / for a null receiver or key). `(String)` is a checkcast on that box: it
// can only ever fire on a box the old `Object` path would have failed on later anyway —
// for the receivers below it CANNOT fire at all, because every element they can hold is
// a java.lang.String instance by construction of the printed producer:
//
//   * `x.split (sep)` prints `Helpers.split(x, sep)`, whose every path is
//     `Arrays.asList(<String[]> ...)` or `Collections.emptyList()` — a String[] carries
//     String instances only (Java's real String.split).
//   * `['a', 'b', ...]` of string literals prints
//     `new java.util.ArrayList<Object>(java.util.Arrays.asList("a", "b"))` —
//     ArrayList of String instances.
//
// WHAT IS DELIBERATELY NOT CLASSIFIED: `Object.keys (x)`. It prints
// `Helpers.objectKeys(x)`, which copies `Map<?,?>.keySet()` (erased — the cast is
// unchecked, so a map with non-String keys passes it). A `(String)` on the element
// would then throw where the `Object` path returned the key — a moved failure.
//
// RECEIVER GUARD (mirror of build/csharp-local-types.js receiverUseIsWrite): the
// receiver must be an identifier with exactly ONE binding in the enclosing function
// (name-based, so shadowing rejects conservatively), declared before the site, with a
// producer initializer, and every other use of the name must be a plain read — any
// write, element write / delete, mutating list method
// (push/pop/shift/unshift/splice/sort/reverse/fill/copyWithin), alias
// (`const o = recv`), escape (call/new argument, return) or ++/-- keeps the receiver's
// elements unprovable and the site stays Object.
//
// THE `+` TRAP (strictPlus): before narrowing `Helpers.add(site, y)` binds
// add(Object, Object); after, add(String, *) — the two agree for a provably-string
// right operand (including null on either side) but diverge when y can be a Double
// (add(Object,Object) goes numeric) or on a bare null-left. So a site local used as the
// LEFT of `+` is only accepted when every right operand of its chain is a string
// literal, which is why this family marks its entries `strictPlus` (the parse* family
// predates the guard and is left alone).

// TS method names that rebuild / mutate a list in place — any use of the receiver
// through one disqualifies it (the same set the C# port uses).
const LIST_MUTATING_METHODS = new Set ([
    'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin',
]);

// every assignment operator kind (ts.SyntaxKind.FirstAssignment .. LastAssignment)
const ASSIGNMENT_OPERATORS = (() => {
    const operators = [];
    for (let kind = ts.SyntaxKind.FirstAssignment; kind <= ts.SyntaxKind.LastAssignment; kind++) {
        operators.push (kind);
    }
    return operators;
}) ();

// does the PRINTED Java for this initializer hand a list whose every runtime element is
// a String instance? `Object.keys` is excluded on purpose — see above.
function stringElementsProducer (initializer) {
    const node = unwrapParens (initializer);
    if (node === undefined) {
        return false;
    }
    if (ts.isCallExpression (node)) {
        const callee = node.expression;
        if (!ts.isPropertyAccessExpression (callee)) {
            return false;
        }
        return callee.name?.escapedText === 'split';
    }
    if (ts.isArrayLiteralExpression (node)) {
        return node.elements.length > 0 && node.elements.every ((element) =>
            element.kind === ts.SyntaxKind.StringLiteral
            || element.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
    }
    return false;
}

// is this occurrence of the receiver able to change what the list holds, hand it to
// another scope, or rebuild it? Any such use disqualifies the receiver.
function receiverUseIsWrite (identifier) {
    const parent = identifier.parent;
    if (!parent) {
        return true;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.BinaryExpression:
        return (parent.left === identifier || parent.right === identifier)
            && ASSIGNMENT_OPERATORS.includes (parent.operatorToken.kind);
    case ts.SyntaxKind.ElementAccessExpression: {
        if (parent.expression !== identifier) {
            return false;
        }
        const grand = parent.parent;
        if (grand?.kind === ts.SyntaxKind.DeleteExpression) {
            return true;
        }
        return grand?.kind === ts.SyntaxKind.BinaryExpression && grand.left === parent
            && ASSIGNMENT_OPERATORS.includes (grand.operatorToken.kind);
    }
    case ts.SyntaxKind.PropertyAccessExpression:
        return parent.expression === identifier && LIST_MUTATING_METHODS.has (parent.name?.escapedText);
    case ts.SyntaxKind.VariableDeclaration:
        return parent.initializer === identifier; // `const other = recv` aliases the list
    case ts.SyntaxKind.CallExpression:
    case ts.SyntaxKind.NewExpression:
        return (parent.arguments ?? []).some ((argument) => argument === identifier);
    case ts.SyntaxKind.ReturnStatement:
        return true; // the caller can mutate what it gets back
    case ts.SyntaxKind.DeleteExpression:
    case ts.SyntaxKind.BindingElement:
    case ts.SyntaxKind.PostfixUnaryExpression:
    case ts.SyntaxKind.PrefixUnaryExpression:
        return true;
    }
    return false;
}

// the element type of `recv[key]` when recv is a local whose elements are provably
// strings. The receiver must have exactly one binding in the enclosing function (no
// shadowing), that binding must be a declaration BEFORE the site with a string-elements
// producer, and every other use of the name must be a read.
function elementAccessHasStringElements (initializer) {
    const site = unwrapParens (initializer);
    if (site?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return false;
    }
    const receiver = site.expression;
    if (receiver?.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const scope = enclosingFunction (site);
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (receiver.escapedText);
    if (!uses) {
        return false;
    }
    let declaration;
    let bindings = 0;
    for (const n of uses) {
        const parent = n.parent;
        if ((parent?.kind === ts.SyntaxKind.VariableDeclaration || parent?.kind === ts.SyntaxKind.Parameter) && parent.name === n) {
            bindings++;
            declaration = parent;
        }
    }
    if (bindings !== 1
        || declaration?.kind !== ts.SyntaxKind.VariableDeclaration
        || declaration.initializer === undefined
        || !stringElementsProducer (declaration.initializer)) {
        return false;
    }
    if (declaration.getStart () > site.getStart ()) {
        return false; // the list is not provably built before the read
    }
    for (const n of uses) {
        if (n === receiver || n === declaration.name) {
            continue;
        }
        if (receiverUseIsWrite (n)) {
            return false;
        }
    }
    return true;
}

// a string literal `x + 'lit'` binds add(String, String) AFTER narrowing where it bound
// add(Object, Object) before; the two only agree when the right operand is provably a
// string (see the `+` trap comment above).
function isProvablyStringOperand (node) {
    const value = unwrapParens (node);
    return value !== undefined
        && (value.kind === ts.SyntaxKind.StringLiteral
            || value.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
}

// walk up through `+` parents: at every level where our chain is the LEFT operand the
// printed add switches overload family after narrowing, so its right operand must be a
// provably-string literal. Uses in the RIGHT operand keep add(Object, Object).
function plusUsesAreSafe (identifier) {
    let child = identifier;
    let current = identifier.parent;
    while (current !== undefined && ts.isBinaryExpression (current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        if (current.left === child && !isProvablyStringOperand (current.right)) {
            return false;
        }
        child = current;
        current = current.parent;
    }
    return true;
}

// ===== WS / pro locals =====
//
// The --ws transpile path runs through the same printer patch (setupTranspiler installs
// this module for every tier; java-worker.ts imports it directly), so the families below
// classify pro bodies too. They are restricted to ts/src/pro files: that is the only
// place their shapes occur (REST code reads the same fields with different value types).
//
//   * this.orderBook() / indexedOrderBook() / countedOrderBook() — hand-written
//     BaseExchange methods DECLARED `public io.github.ccxt.ws.WsOrderBook[.IndexedOrderBook|
//     .CountedOrderBook]`, so the declaration is retyped cast-free.
//   * this.trades[key] / this.safeValue(this.trades, key[, default]) and the same for
//     this.orderbooks — every generated ws class stores only ArrayCache-family
//     constructors in this.trades and only orderBook() results in this.orderbooks
//     (census: 81 + 111 addElementToObject sites, 0 other values), so the local can be
//     declared ArrayCache / WsOrderBook with a checkcast (the printed read is
//     Helpers.GetValue / this.safeValue, both declared Object).
//   * locals NAMED messageHash<digits> whose initializer prints statically String —
//     'lit' + x chains print Helpers.add(String, *), this.safeString(...) is declared
//     String, a copy of another String-typed messageHash, etc. The Java name is not
//     reserved, so the print is plain `<name>` and the declared type is invisible to
//     the ws Object-taking methods these locals feed.
const ARRAYCACHE_TYPE = 'io.github.ccxt.ws.ArrayCache';
const ORDERBOOK_TYPE = 'io.github.ccxt.ws.WsOrderBook';

const WS_THIS_CALL_TYPES = {
    'orderBook': ORDERBOOK_TYPE,
    'indexedOrderBook': ORDERBOOK_TYPE + '.IndexedOrderBook',
    'countedOrderBook': ORDERBOOK_TYPE + '.CountedOrderBook',
};

const WS_MAP_READ_TYPES = {
    'trades': ARRAYCACHE_TYPE,
    'orderbooks': ORDERBOOK_TYPE,
};

// the resolved TS declaration must live in ts/src/base/** so an exchange-local override
// (printed with its own signature) never classifies
const BASE_SOURCE_FILE = /[\\/]ts[\\/]src[\\/]base[\\/]/;

function thisPropName (node) {
    if (node !== undefined && ts.isPropertyAccessExpression (node)
        && node.expression.kind === ts.SyntaxKind.ThisKeyword) {
        return node.name.escapedText;
    }
    return undefined;
}

// Java type of a ws map read: `this.<map>[key]` (prints Helpers.GetValue) or
// `this.safeValue(this.<map>, key)` (prints itself), or undefined
function wsMapReadType (node) {
    node = unwrapParens (node);
    if (node !== undefined && ts.isElementAccessExpression (node)) {
        return WS_MAP_READ_TYPES[thisPropName (node.expression)];
    }
    if (isThisCall (node)) {
        const name = node.expression.name.escapedText;
        if (name === 'safeValue' || name === 'safeValue2' || name === 'safeValueN') {
            return WS_MAP_READ_TYPES[thisPropName (node.arguments[0])];
        }
    }
    return undefined;
}

const WS_TYPES = new Set ([
    ARRAYCACHE_TYPE, ORDERBOOK_TYPE,
    ORDERBOOK_TYPE + '.IndexedOrderBook', ORDERBOOK_TYPE + '.CountedOrderBook',
]);

function isWsType (javaType) {
    return WS_TYPES.has (javaType);
}

// `this.<name>(...)` whose resolved declaration lives in ts/src/base/**
function isBaseDeclaration (printer, callNode) {
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (callNode)?.declaration;
    } catch (e) {
        return false;
    }
    return declaration !== undefined && BASE_SOURCE_FILE.test (declaration.getSourceFile ().fileName);
}

const SAFE_STRING_ACCESSORS = new Set ([ 'safeString', 'safeString2', 'safeStringN' ]);

// does the PRINTED Java for this expression have the static type String ALREADY (no
// cast needed)? Covers the shapes the ws cores build message hashes with.
function isProvablyStringExpression (printer, node, selfName, narrowed) {
    node = unwrapParens (node);
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            if (node.escapedText === 'undefined' || node.escapedText === selfName) {
                return true;
            }
            if (narrowed !== undefined) {
                let declaration;
                try {
                    declaration = printer.getChecker ().getSymbolAtLocation (node)?.valueDeclaration;
                } catch (e) {
                    declaration = undefined;
                }
                if (declaration !== undefined && narrowed.get (declaration) === 'String') {
                    return true;
                }
            }
            return false;
        case ts.SyntaxKind.ConditionalExpression:
            return isProvablyStringExpression (printer, node.whenTrue, selfName, narrowed)
                && isProvablyStringExpression (printer, node.whenFalse, selfName, narrowed);
        case ts.SyntaxKind.BinaryExpression:
            // `a + b` prints Helpers.add(a, b); add(String, *) is declared String
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && isProvablyStringExpression (printer, node.left, selfName, narrowed);
        case ts.SyntaxKind.AsExpression:
        case ts.SyntaxKind.TypeAssertionExpression:
            return node.type?.kind === ts.SyntaxKind.StringKeyword; // prints ((String)x)
        case ts.SyntaxKind.PropertyAccessExpression:
            return ts.isIdentifier (node.name) && thisPropName (node) !== undefined
                && THIS_MEMBER_TYPES[String (node.name.escapedText)] === 'String';
        case ts.SyntaxKind.CallExpression: {
            if (!isThisCall (node)) {
                return false;
            }
            const name = node.expression.name.escapedText;
            if (SAFE_STRING_ACCESSORS.has (name) || name === 'iso8601') {
                return true; // hand-written BaseExchange declarations, `public String`
            }
            if (JAVA_STRING_RETURN_METHODS.has (name) || JAVA_STRING_RETURN_METHODS_CASE_CAST.has (name)) {
                return resolvesToMethodNamed (printer, node, name);
            }
            return isBaseDeclaration (printer, node) && baseMethodReturnsString (printer, node, name);
        }
        default:
            return false;
    }
}

// this.<member> — hand-written BaseExchange fields whose Java declaration is concrete
// (used by the ws String prover and the error-path member family; the fields are audited
// tree-wide: no generated exchange class redeclares any of them)
const THIS_MEMBER_TYPES = {
    'id': 'String', 'version': 'String', 'name': 'String', 'secret': 'String',
    'apiKey': 'String', 'password': 'String', 'uid': 'String', 'login': 'String',
    'url': 'String', 'hostname': 'String',
    'symbols': 'java.util.List<Object>',
    'markets_by_id': 'java.util.Map<String, Object>',
};

// the Java declaration of this base method returns String (checked on the printer's own
// resolved declaration through the checker's declared return type)
function baseMethodReturnsString (printer, node, name) {
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
    } catch (e) {
        return false;
    }
    const type = declaration?.type;
    if (type === undefined) {
        return false;
    }
    if (type.kind === ts.SyntaxKind.StringKeyword) {
        return true;
    }
    if (ts.isTypeReferenceNode (type) && ts.isIdentifier (type.typeName)) {
        const name2 = String (type.typeName.escapedText);
        return name2 === 'Str';
    }
    return false;
}

// ===== awaited generated-api locals =====
//
// `await this.<endpoint>(...)` prints `(this.<endpoint>(...)).join()`. The generated
// implicit-api wrappers declare one
// `public java.util.concurrent.CompletableFuture<T> <name> (Object... optionalArgs)`
// per endpoint, so `.join()` has the static type T exactly and the declaration needs no
// cast. T is read from the ON-DISK Java file the compiler reads — a local declared T can
// never disagree with its callee. Only concrete T is accepted (Map / List / String);
// `CompletableFuture<Object>` endpoints stay Object.
const JAVA_API_METHOD = /^\s*public java\.util\.concurrent\.CompletableFuture<(.+?)>\s+(\w+) \(Object\.\.\. optionalArgs\)/;
const JAVA_API_FOLDER = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt', 'api');
const awaitedApiTables = new Map ();

function awaitedApiReturnTypes (exchange) {
    if (awaitedApiTables.has (exchange)) {
        return awaitedApiTables.get (exchange);
    }
    let table;
    const capital = exchange.charAt (0).toUpperCase () + exchange.slice (1);
    const candidates = [
        path.join (JAVA_API_FOLDER, capital + 'Api.java'),
        path.join (JAVA_API_FOLDER, 'prediction', capital + 'Api.java'),
    ];
    for (const file of candidates) {
        let content;
        try {
            content = fs.readFileSync (file, 'utf8');
        } catch (e) {
            continue; // not a generated venue — never fatal
        }
        table = new Map ();
        for (const line of content.split ('\n')) {
            const match = JAVA_API_METHOD.exec (line);
            if (match && match[1] !== 'Object') {
                table.set (match[2], match[1]);
            }
        }
        break;
    }
    awaitedApiTables.set (exchange, table);
    return table;
}

// the source file's basename is the exchange id: ts/src/kucoin.ts -> kucoin,
// ts/src/pro/kucoin.ts -> kucoin, ts/src/prediction/kalshi.ts -> kalshi. The ws and
// prediction tiers reuse the REST api wrappers through their generated class chain.
function sourceExchangeId (node) {
    const fileName = node.getSourceFile?.()?.fileName ?? '';
    const base = fileName.split (/[\\/]/).pop () ?? '';
    return base.replace (/\.(ts|js)$/, '');
}

// the Java type of `await this.<name>(...)`, or undefined when the callee's
// CompletableFuture<T> cannot be proven from an on-disk Java signature
function awaitedThisCallType (node) {
    if (node?.kind !== ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    const call = node.expression;
    if (call?.kind !== ts.SyntaxKind.CallExpression || !isThisCall (call)) {
        return undefined;
    }
    const methodName = call.expression.name?.escapedText;
    if (methodName === undefined) {
        return undefined;
    }
    const table = awaitedApiReturnTypes (sourceExchangeId (node));
    return table?.get (methodName);
}

// ===== helpers =====

const JAVA_ARRAY_TYPE = 'java.util.List<Object>';
const JAVA_ARRAY_CAST = '(java.util.List<Object>)';

// ===== 4. locals fed by string/array METHOD calls and Math builtins =====
//
// The base printCallExpression rewrites (the Java overrides are printSplitCall /
// printJoinCall / printIncludesCall / ...) lower `x.<method>(...)` to a Java expression
// whose printed value is ALREADY one concrete box at runtime:
//
//   x.toUpperCase/toLowerCase/trim () -> ((String)x).<method>()                  String
//   x.startsWith / endsWith (y)       -> ((String)x).startsWith(((String)y))     Boolean
//   x.search (y)                      -> ((String)x).indexOf(y)                  Integer
//   x.split (sep)                     -> Helpers.split(x, sep)                   List (declared Object -> cast)
//   x.join (sep)                      -> String.join((String)sep, (List<String>)x)  String
//   x.replace / replaceAll (a, b)     -> Helpers.replace/replaceAll((String)x, ...) String (null in -> null out)
//   x.slice (a, b)                    -> Helpers.slice(x, a, b)                 String (declared String; null receiver -> null)
//   x.padEnd / padStart (n, s)        -> Helpers.padEnd/padStart(...)            String (throws on a null receiver)
//   x.indexOf (y)                     -> Helpers.getIndexOf(x, y)               int
//   x.includes (y)                    -> x.contains(y)                          boolean
//   x.toString ()                     -> String.valueOf(x)                      String
//   x.length                          -> Helpers.getArrayLength(x) / ((String)x).length()  int
//   Math.abs (a)                      -> Helpers.mathAbs(Double.parseDouble(Helpers.toString(a)))  Double (declared Object -> cast)
//   Math.pow (a, b)                   -> Helpers.mathPow(...)                   double
//   Math.floor / ceil (a)             -> (Math.floor(...)) / Math.ceil(...)     double
//   Math.round (a)                    -> Math.round(...)                        long
//
// Every entry lists the prefix (or a regex) the printed value must start with — defense
// in depth, it proves the printer lowered THIS call the way the table assumes — plus the
// accepted TS argument counts (the dispatch switches on the count).
//
// Deliberately absent (audited against the printer and the tree census):
//   * Math.min / Math.max -> Helpers.mathMin/mathMax hand the ORIGINAL operand object
//     back (any box) and null when either argument is null; no single type names that
//     box (same exclusion as build/csharp-local-types.js);
//   * x.concat(y) -> Helpers.concat returns a, b or a fresh list depending on the input
//     shapes (and throws for two non-lists) — mixed box;
//   * String(x) / Number(x) — the printer has no rule for a bare String()/Number() call
//     (CallExpressionReplacements maps only parseInt/parseFloat) and no call site in
//     ts/src reaches generated Java;
//   * x.substring(...) is not rewritten by the printer (it prints as a receiver-method
//     call whose receiver must already be String-typed) and no generated local is
//     initialised from one (census: 0 `Object x = ....substring(` in the java tree).

const RECEIVER_METHOD_LOCAL_ENTRIES = {
    'toUpperCase': { type: 'String', prefixes: [ '((String)' ], args: [ 0 ], nonNull: true },
    'toLowerCase': { type: 'String', prefixes: [ '((String)' ], args: [ 0 ], nonNull: true },
    'trim':        { type: 'String', prefixes: [ '((String)' ], args: [ 0 ], nonNull: true },
    'search':      { type: 'Integer', prefixes: [ '((String)' ], args: [ 1 ] },
    'startsWith':  { type: 'Boolean', prefixes: [ '((String)' ], args: [ 1 ] },
    'endsWith':    { type: 'Boolean', prefixes: [ '((String)' ], args: [ 1 ] },
    'split':       { type: JAVA_ARRAY_TYPE, cast: JAVA_ARRAY_CAST, prefixes: [ 'Helpers.split(' ], args: [ 1, 2 ] },
    'join':        { type: 'String', prefixes: [ 'String.join(' ], args: [ 1 ], nonNull: true },
    'replace':     { type: 'String', prefixes: [ 'Helpers.replace(' ], args: [ 1, 2 ], nonNull: false },
    'replaceAll':  { type: 'String', prefixes: [ 'Helpers.replaceAll(' ], args: [ 1, 2 ], nonNull: false },
    'slice':       { type: 'String', prefixes: [ 'Helpers.slice(' ], args: [ 1, 2 ], nonNull: false },
    'padEnd':      { type: 'String', prefixes: [ 'Helpers.padEnd(' ], args: [ 2 ], nonNull: true },
    'padStart':    { type: 'String', prefixes: [ 'Helpers.padStart(' ], args: [ 2 ], nonNull: true },
    'indexOf':     { type: 'Integer', prefixes: [ 'Helpers.getIndexOf(' ], args: [ 1, 2 ] },
    'includes':    { type: 'Boolean', match: /\.contains\(/, args: [ 1, 2 ] },
    'toString':    { type: 'String', prefixes: [ 'String.valueOf(' ], args: [ 0 ], nonNull: true },
};

// Math.<name>(...) -> the printer's Java rewrite (see the block comment above)
const MATH_LOCAL_ENTRIES = {
    // Helpers.mathAbs(Double.parseDouble(Helpers.toString(a))) — the argument is always a
    // primitive double, so the helper's Double branch runs and Math.abs returns a double
    // box. The helper is declared Object -> the declaration carries the checkcast.
    'abs':   { type: 'Double', cast: '(Double)', prefixes: [ 'Helpers.mathAbs(' ], args: [ 1 ] },
    'pow':   { type: 'Double', prefixes: [ 'Helpers.mathPow(' ], args: [ 2 ] },
    'floor': { type: 'Double', prefixes: [ '(Math.floor(' ], args: [ 1 ] },
    'ceil':  { type: 'Double', prefixes: [ 'Math.ceil(' ], args: [ 1 ] },
    'round': { type: 'Long', prefixes: [ 'Math.round(' ], args: [ 1 ] },
};

// `x.length` (PropertyAccess, no call): ((String)x).length() when the checker types the
// receiver as a string, else Helpers.getArrayLength(x) — an int on both paths
const LENGTH_LOCAL_ENTRY = { type: 'Integer', prefixes: [ 'Helpers.getArrayLength(', '((String)' ] };

// the printed initializer must be the shape the entry's type was derived from: a fixed
// prefix list (`Helpers.split(`, `((String)`, ...) or a regex for the rewrites whose
// print starts with the receiver's own text (`x.includes(y)` -> `<receiver>.contains(y)`)
function printedValueMatches (info, printedValue) {
    if (info.prefixes !== undefined) {
        return info.prefixes.some ((prefix) => printedValue.startsWith (prefix));
    }
    if (info.match !== undefined) {
        return info.match.test (printedValue);
    }
    return printedValue.startsWith ('this.');
}

function isThisCall (node) {
    return node !== undefined && ts.isCallExpression (node)
        && ts.isPropertyAccessExpression (node.expression)
        && node.expression.expression.kind === ts.SyntaxKind.ThisKeyword;
}

function isThisOrSuperCall (node) {
    return node !== undefined && ts.isCallExpression (node)
        && ts.isPropertyAccessExpression (node.expression)
        && (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword
            || node.expression.expression.kind === ts.SyntaxKind.SuperKeyword);
}

function unwrapParens (node) {
    while (node !== undefined && ts.isParenthesizedExpression (node)) {
        node = node.expression;
    }
    return node;
}

function enclosingFunction (node) {
    let current = node?.parent;
    while (current) {
        switch (current.kind) {
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.Constructor:
            case ts.SyntaxKind.SourceFile:
                return current;
        }
        current = current.parent;
    }
    return undefined;
}

function enclosingMethod (node) {
    let current = node?.parent;
    while (current) {
        if (ts.isMethodDeclaration (current)) {
            return current;
        }
        current = current.parent;
    }
    return undefined;
}

// resolves an accessor call to the hand-written base; a venue override (its own file)
// or anything unresolvable-but-not-a-known-field-function never classifies
function resolvesToBaseAccessor (printer, node, name) {
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
    } catch (e) {
        declaration = undefined;
    }
    if (declaration === undefined) {
        return FIELD_FUNCTION_NAMES.has (name);
    }
    const file = declaration.getSourceFile?.().fileName;
    if (file === undefined) {
        return false;
    }
    return ACCESSOR_SOURCE_FILES.some ((re) => re.test (file));
}

// ===== string/crypto/url helper classification (JAVA-RE-6) =====
//
// the resolved TS declaration of an admitted helper call must live under ts/src/base/ —
// a venue override (its own file) transpiles with its own `Object` signature and must
// never classify. `hash` / `encode` / `binaryToString` are absent by construction (the
// table check at the top of the module throws for them). The BASE stage resolves calls
// inside ts/src/base/Exchange.ts to the stripped `Exchange.nooverloads.<pid>.ts` variant
// (build/stripOverloads.ts), whose recorded fileName is RELATIVE (`ts/src/base/...`) —
// accept a leading `ts/src/base/` as well or every base-stage candidate dies there.
const HELPER_SOURCE_FILE = /(^|[\\/])ts[\\/]src[\\/]base[\\/]/;

// env-gated calibration trace: JAVA_STRING_HELPERS_DEBUG=1 prints the resolved
// declaration file of every candidate helper call, accepted or not
const HELPER_DEBUG = !!process.env.JAVA_STRING_HELPERS_DEBUG;

function resolvedSignatureFile (printer, node) {
    try {
        const declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
        return declaration === undefined ? undefined : declaration.getSourceFile ()?.fileName;
    } catch (e) {
        return undefined;
    }
}

function helperDebug (message, node) {
    if (!HELPER_DEBUG) {
        return;
    }
    let text = '';
    try {
        text = (node === undefined) ? '' : String (node.getText ()).slice (0, 110);
    } catch (e) {
        text = '<no text>';
    }
    console.error ('[java-string-helpers] ' + message + ' | ' + text);
}

// `this.<name>(...)` / bare `name(...)` -> { type, cast, kind } for the helper families.
// Bare calls only for the four names the generated tree actually calls that way; Java
// binds them to the inherited BaseExchange method (implicit this).
function classifyStringHelperCall (printer, node) {
    if (node === undefined || !ts.isCallExpression (node)) {
        return undefined;
    }
    const callee = node.expression;
    let name;
    if (isThisCall (node)) {
        name = String (callee.name.escapedText);
    } else if (ts.isIdentifier (callee) && JAVA_STRING_HELPER_BARE.has (callee.escapedText)) {
        name = String (callee.escapedText);
    } else {
        return undefined;
    }
    const accessor = LOCAL_THIS_RETURN_TYPES[name];
    if (accessor === undefined || !isGuardedStringHelper (name)) {
        return undefined;
    }
    const bare = !isThisCall (node);
    const file = resolvedSignatureFile (printer, node);
    if (file === undefined) {
        helperDebug ('no resolved declaration for ' + name, node);
        return undefined;
    }
    if (!HELPER_SOURCE_FILE.test (file)) {
        helperDebug ('non-base declaration ' + file + ' for ' + name, node);
        return undefined;
    }
    helperDebug ((accessor.cast === undefined ? 'plain ' : 'cast ') + name + ' <- ' + file, node);
    return { type: accessor.type, cast: accessor.cast, kind: 'guarded-string', bare: bare ? name : undefined };
}

// a `this.<name>(...)` call that resolves to a real method declaration of that name
// (the signature hook retypes those); fields holding functions do not
function resolvesToMethodNamed (printer, node, name) {
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
    } catch (e) {
        declaration = undefined;
    }
    return declaration !== undefined && ts.isMethodDeclaration (declaration)
        && declaration.name !== undefined && declaration.name.escapedText === name;
}

function isAsyncMethodCall (printer, callNode) {
    const declaration = printer.getChecker ().getResolvedSignature (callNode)?.declaration;
    if (declaration === undefined) {
        return false;
    }
    if (ts.canHaveModifiers (declaration) && (ts.getModifiers (declaration) ?? []).some ((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        return true;
    }
    const returnType = declaration.type;
    return returnType !== undefined && ts.isTypeReferenceNode (returnType)
        && ts.isIdentifier (returnType.typeName) && returnType.typeName.escapedText === 'Promise';
}

// ===== method signature retype =====

function javaMethodReturnType (printer, node, own) {
    if (own !== 'Object') {
        return undefined;
    }
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration || node.name === undefined) {
        return undefined;
    }
    if (typeof printer.isAsyncFunction === 'function' && printer.isAsyncFunction (node)) {
        return undefined;
    }
    const name = node.name.escapedText;
    if (JAVA_STRING_RETURN_METHODS.has (name) || JAVA_STRING_RETURN_METHODS_CASE_CAST.has (name)) {
        return 'String';
    }
    if (JAVA_LIST_RETURN_METHODS.has (name)) {
        return JAVA_ARRAY_TYPE;
    }
    return undefined;
}

// ===== return-statement casts =====

// the printed return payload this module knows how to cast, or undefined
function returnCastFor (printer, node, methodName) {
    const expression = unwrapParens (node.expression);
    if (expression === undefined) {
        return undefined;
    }
    if (JAVA_STRING_RETURN_METHODS_CASE_CAST.has (methodName)) {
        if (isThisCall (expression)) {
            const call = expression.expression.name.escapedText;
            if (call === 'safeStringUpper' || call === 'safeStringLower'
                || call === 'safeStringUpper2' || call === 'safeStringLower2'
                || call === 'safeStringUpperN' || call === 'safeStringLowerN') {
                return '(String)';
            }
        }
        return undefined;
    }
    if (JAVA_LIST_RETURN_METHODS.has (methodName)) {
        if (isThisCall (expression) && expression.expression.name.escapedText === 'arraySlice') {
            return '(' + JAVA_ARRAY_TYPE + ')';
        }
        if (ts.isIdentifier (expression)) {
            // `return array;` where array is one of the method's own parameters
            const method = enclosingMethod (node);
            if (method === undefined) {
                return undefined;
            }
            const symbol = printer.getChecker ().getSymbolAtLocation (expression);
            const declaration = symbol?.valueDeclaration;
            if (declaration !== undefined && method.parameters.some ((p) => p === declaration || p.name === declaration
                || (p.name?.escapedText !== undefined && p.name.escapedText === expression.escapedText))) {
                return '(' + JAVA_ARRAY_TYPE + ')';
            }
        }
        return undefined;
    }
    return undefined;
}

// ===== local narrowing (initializer -> Java type) =====

// a local initialised from a non-`this` call the printer rewrites to a known Java shape
// (string/array method calls, Math builtins) or from a `x.length` read
function receiverMethodLocalType (initializer) {
    if (ts.isPropertyAccessExpression (initializer)) {
        return initializer.name.escapedText === 'length'
            && initializer.expression.kind !== ts.SyntaxKind.ThisKeyword
            ? LENGTH_LOCAL_ENTRY
            : undefined;
    }
    if (!ts.isCallExpression (initializer)) {
        return undefined;
    }
    const callee = initializer.expression;
    if (!ts.isPropertyAccessExpression (callee)
        || callee.expression.kind === ts.SyntaxKind.ThisKeyword
        || callee.expression.kind === ts.SyntaxKind.SuperKeyword) {
        return undefined;
    }
    const name = callee.name.escapedText;
    const argCount = initializer.arguments?.length ?? 0;
    if (ts.isIdentifier (callee.expression) && callee.expression.escapedText === 'Math') {
        const math = MATH_LOCAL_ENTRIES[name];
        return math !== undefined && math.args.includes (argCount) ? math : undefined;
    }
    const entry = RECEIVER_METHOD_LOCAL_ENTRIES[name];
    return entry !== undefined && entry.args.includes (argCount) ? entry : undefined;
}

function localInitializerType (printer, declaration, isProFile, narrowed) {
    const initializer = unwrapParens (declaration.initializer);
    if (initializer === undefined) {
        return undefined;
    }
    // string-element access: `const x = parts[0]` where `parts` is provably a list of
    // String instances — printed `Helpers.GetValue(parts, 0)`, the cast is exact
    if (elementAccessHasStringElements (initializer)) {
        return { type: 'String', cast: '(String)', valuePrefix: 'Helpers.GetValue(', strictPlus: true };
    }
    // awaited generated api calls: `(this.<endpoint>(...)).join()` has the T of the
    // endpoint's on-disk `CompletableFuture<T>` — cast-free
    if (initializer.kind === ts.SyntaxKind.AwaitExpression) {
        const awaited = awaitedThisCallType (initializer);
        if (awaited !== undefined) {
            return { type: awaited, valuePrefix: '(this.', strictPlus: awaited === 'String' };
        }
        return undefined;
    }
    // WS/pro families (see the section above)
    if (isProFile === true) {
        if (isThisCall (initializer)) {
            const wsCall = WS_THIS_CALL_TYPES[initializer.expression.name.escapedText];
            if (wsCall !== undefined && isBaseDeclaration (printer, initializer)) {
                return { type: wsCall };
            }
        }
        const readType = wsMapReadType (initializer);
        if (readType !== undefined) {
            // `this.<map>[key]` prints Helpers.GetValue(this.<map>, key);
            // `this.safeValue*(this.<map>, key)` prints itself
            const prefixes = ts.isElementAccessExpression (initializer)
                ? [ 'Helpers.' ] : [ 'this.' ];
            return { type: readType, cast: '(' + readType + ')', valuePrefixes: prefixes, skipInheritedAsyncGuard: true };
        }
        if (/^messageHash\d*$/.test (declaration.name.escapedText)
            && isProvablyStringExpression (printer, initializer, declaration.name.escapedText, narrowed)) {
            // the (String) prefix also defeats postProcessWsJava's "String type fixes"
            // revert regex (`String x = this.<m>(` / `String x = Helpers.` -> Object),
            // which runs on every pro file after printing; a checkcast on a String box
            // is free
            return { type: 'String', cast: '(String)', strictPlus: true, skipInheritedAsyncGuard: true, anyValueShape: true };
        }
    }
    // ===== error paths: request/params object literals and typed base members =====
    //
    // `const request = {}` prints `new java.util.HashMap<String, Object>() {{}}` —
    // assignable to java.util.Map<String, Object> with no cast (the box already is one).
    // `Object x = this.<member>` reads a hand-written BaseExchange field whose Java
    // declaration is concrete (`public String id`, `public volatile List<Object> symbols`,
    // `public volatile Map<String, Object> markets_by_id`); no generated exchange class
    // redeclares these (tree census: 0), so the local can carry the declared type.
    // handleErrors has no Java return value (it throws) and the catch variable already
    // prints `Exception` — both are no-ops today (see the header notes).
    if (ts.isObjectLiteralExpression (initializer)) {
        return { type: JAVA_STRUCTURE_TYPE, anyValueShape: true };
    }
    if (ts.isPropertyAccessExpression (initializer) && thisPropName (initializer) !== undefined) {
        const memberType = THIS_MEMBER_TYPES[String (initializer.name.escapedText)];
        if (memberType !== undefined) {
            return { type: memberType };
        }
    }
    if (!isThisCall (initializer)) {
        return undefined;
    }
    if (!isThisCall (initializer)) {
        return receiverMethodLocalType (initializer);
    }
    const name = initializer.expression.name.escapedText;
    if (JAVA_STRING_RETURN_METHODS.has (name) || JAVA_STRING_RETURN_METHODS_CASE_CAST.has (name)) {
        // the signature hook retypes real method declarations by name; a field of the
        // same name would print an untyped call and could not hold a String result
        return resolvesToMethodNamed (printer, initializer, name) ? { type: 'String' } : undefined;
    }
    if (JAVA_LIST_RETURN_METHODS.has (name)) {
        return resolvesToMethodNamed (printer, initializer, name) ? { type: JAVA_ARRAY_TYPE } : undefined;
    }
    const accessor = LOCAL_THIS_RETURN_TYPES[name];
    if (accessor !== undefined && resolvesToBaseAccessor (printer, initializer, name)) {
        return { type: accessor.type, cast: accessor.cast };
    }
    const structure = STRUCTURE_THIS_RETURN_TYPES[name];
    if (structure !== undefined && resolvesToMethodNamed (printer, initializer, name)) {
        return { type: structure, cast: '(' + structure + ')' };
    }
    return undefined;
}

// admissible later write of the same Java type (reassignment context)
function isProvablyOfType (printer, node, javaType, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return isProvablyOfType (printer, node.expression, javaType, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return isProvablyOfType (printer, node.whenTrue, javaType, selfName)
                && isProvablyOfType (printer, node.whenFalse, javaType, selfName);
        case ts.SyntaxKind.AsExpression:
            return false;
        case ts.SyntaxKind.BinaryExpression:
            // `x = 'a' + b` prints Helpers.add(String, *) -> String; accepted for a
            // String-typed local (the write needs no cast — the call already returns
            // String in Java)
            return javaType === 'String' && node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && isProvablyStringExpression (printer, node.left, selfName, undefined);
        case ts.SyntaxKind.AwaitExpression:
            // `x = await this.<endpoint>(...)` — same T as the declaration's callee
            return awaitedThisCallType (node) === javaType;
        case ts.SyntaxKind.ElementAccessExpression:
            // `x = this.trades[key]` / `this.orderbooks[key]` — a ws map read
            return isWsType (javaType) && wsMapReadType (node) === javaType;
        case ts.SyntaxKind.CallExpression: {
            const callee = node.expression;
            if (ts.isIdentifier (callee)) {
                // bare helper call (`jwt(...)` / `eddsa(...)` / `rsa(...)` / `totp(...)`):
                // Java binds it to the inherited BaseExchange method; its box is the same
                // the `this.<name>(...)` form hands back
                if (!JAVA_STRING_HELPER_BARE.has (callee.escapedText) || javaType !== 'String') {
                    return false;
                }
                const helper = classifyStringHelperCall (printer, node);
                if (helper === undefined) {
                    return false;
                }
                // a cast-family bare write (`x = eddsa(...)`) is admitted — the
                // reassignment hook injects the same (String) checkcast the declaration got
                return true;
            }
            if (!ts.isPropertyAccessExpression (callee) || callee.expression.kind !== ts.SyntaxKind.ThisKeyword) {
                return false;
            }
            const name = callee.name.escapedText;
            if (isWsType (javaType)) {
                // `x = this.safeValue(this.trades, key)` — a ws map read
                return wsMapReadType (node) === javaType;
            }
            if (javaType === JAVA_STRUCTURE_TYPE) {
                return STRUCTURE_THIS_RETURN_TYPES[name] !== undefined && resolvesToMethodNamed (printer, node, name);
            }
            if (javaType === 'String') {
                if (name === 'parse8601') {
                    return false;
                }
                if (JAVA_STRING_RETURN_METHODS.has (name) || JAVA_STRING_RETURN_METHODS_CASE_CAST.has (name)) {
                    return true;
                }
                if (name === 'iso8601') {
                    return resolvesToBaseAccessor (printer, node, name);
                }
                if (isGuardedStringHelper (name)) {
                    // plain families hand back a String (no cast needed); the cast family
                    // needs the (String) checkcast the reassignment hook injects
                    const helper = classifyStringHelperCall (printer, node);
                    return helper !== undefined;
                }
                if (name === 'safeSymbol' || name === 'safeCurrencyCode') {
                    return resolvesToBaseAccessor (printer, node, name);
                }
                return false;
            }
            if (javaType === 'Long') {
                if (name === 'parse8601') {
                    return resolvesToBaseAccessor (printer, node, name);
                }
                // safeTimestamp* are deliberately absent: SafeMethods.safeTimestampN hands
                // the caller's default back untouched (`if (result == null) return
                // defaultValue;`), so its box is not always a Long and a `(Long)` cast on
                // a write could throw where the old Object write could not
                if (name === 'safeInteger2' || name === 'safeInteger' || name === 'safeIntegerN') {
                    return resolvesToBaseAccessor (printer, node, name);
                }
                return false;
            }
            if (javaType === JAVA_ARRAY_TYPE) {
                if (JAVA_LIST_RETURN_METHODS.has (name)) {
                    return true;
                }
                if (name === 'toArray') {
                    return true;
                }
                return false;
            }
            return false;
        }
        case ts.SyntaxKind.ArrayLiteralExpression:
            return javaType === JAVA_ARRAY_TYPE;
        case ts.SyntaxKind.ObjectLiteralExpression:
            return javaType === JAVA_STRUCTURE_TYPE;
        case ts.SyntaxKind.PropertyAccessExpression:
            return thisPropName (node) !== undefined
                && THIS_MEMBER_TYPES[String (node.name.escapedText)] === javaType;
        default:
            return false;
    }
}

// ===== guarded-string provability (JAVA-RE-6) =====
//
// The `+` rule: `x + y` prints `Helpers.add (x, y)` and the LEFT operand's static type
// selects the overload family (add(Object,Object) vs add(String,String) / add(String,Object)).
// `add(Object,Object)` returns the SAME String value only when the right operand is a
// non-null String (a Long/Double/null right side moves it to the numeric/null branches),
// and `add(String,*)` always concatenates. So a guarded local used as the LEFT operand of
// `+` is accepted only when the direct right operand is a provably non-null String and no
// deeper add of the same left spine has a possibly-numeric right operand.

// true when the printed Java for `node` is statically a String (or null): literals, the
// `undefined`/self identifiers, parenthesized/conditional combos, a `+` chain with a
// statically-String left operand (add(String, ..) -> String), a plain helper call and the
// base-declared safeString accessors. Cast-family helpers are NOT statically String (they
// print an Object-typed call; only the reassignment hook's explicit cast names the box).
function isStaticallyStringExpression (printer, node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return isStaticallyStringExpression (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return isStaticallyStringExpression (printer, node.whenTrue, selfName)
                && isStaticallyStringExpression (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression:
            // `'lit' + r` prints Helpers.add(String, ..) -> String on every path
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && isStaticallyStringExpression (printer, node.left, selfName);
        case ts.SyntaxKind.CallExpression: {
            if (isThisCall (node)
                && (node.expression.name.escapedText === 'safeString'
                    || node.expression.name.escapedText === 'safeString2'
                    || node.expression.name.escapedText === 'safeStringN')
                && isPlainSafeStringBaseCall (printer, node)) {
                return true; // declared String in BaseExchange
            }
            const helper = classifyStringHelperCall (printer, node);
            return helper !== undefined && helper.cast === undefined;
        }
        default:
            return false;
    }
}

// `this.safeString*` resolving to the base accessor in ts/src/base/functions/type.ts
function isPlainSafeStringBaseCall (printer, node) {
    if (!isThisCall (node)) {
        return false;
    }
    const name = node.expression.name.escapedText;
    if (name !== 'safeString' && name !== 'safeString2' && name !== 'safeStringN') {
        return false;
    }
    const file = resolvedSignatureFile (printer, node);
    return file !== undefined && /(^|[\\/])base[\\/]functions[\\/]type\.ts$/.test (file);
}

// true when the TYPE the checker gives `node` could hold a Java-`Double` box at runtime
// (number / bigint members, or an `any`/`unknown`/error type we cannot rule out).
// Helpers.add's branch order tests `a instanceof Double || b instanceof Double` BEFORE
// its String branches; a number-typed operand can be such a Double, which would turn a
// string-literal-led `+` chain into a numeric box.
function isPossiblyNumericExpression (printer, node) {
    try {
        const type = printer.getChecker ().getTypeAtLocation (node);
        return typeIsPossiblyNumeric (type);
    } catch (e) {
        return true; // unprovable — treat as possibly numeric
    }
}

function typeIsPossiblyNumeric (type) {
    if (type === undefined) {
        return true;
    }
    const flags = type.flags;
    if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        return true;
    }
    if (flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike)) {
        return true;
    }
    if (flags & ts.TypeFlags.Union) {
        return type.types.some ((member) => typeIsPossiblyNumeric (member));
    }
    if (flags & ts.TypeFlags.Intersection) {
        return type.types.some ((member) => typeIsPossiblyNumeric (member));
    }
    return false;
}

// true when any operand of the `+` chain (through parentheses) could be a Java Double
// box: Helpers.add tests `a instanceof Double || b instanceof Double` BEFORE its String
// branches and toDouble never throws (it returns 0.0), so a single Double operand
// silently turns the whole call numeric — even when the composite is typed `string` in
// TypeScript. The walk must reach every leaf.
function isPossiblyNumericDeep (printer, node) {
    if (node === undefined) {
        return true;
    }
    let current = node;
    while (ts.isParenthesizedExpression (current)) {
        current = current.expression;
    }
    if (ts.isBinaryExpression (current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return isPossiblyNumericDeep (printer, current.left) || isPossiblyNumericDeep (printer, current.right);
    }
    return isPossiblyNumericExpression (printer, current);
}

// true when the printed Java for `node` is a String GUARANTEED non-null at runtime
// (given the named local holds String-or-null). Used only by the add-left rule: with the
// local declared String, `Helpers.add (local, r)` resolves to add(String, ..) while the
// Object-typed call resolved to add(Object, Object) — which returns the same non-null
// String only when `r` is a non-null String and returns null for Long / Double / null /
// other boxes. Accepted forms:
//   1. `l + r` with a statically-String LEFT operand: the call resolves to add(String, *)
//      — `l + String.valueOf (r)` — a non-null String for every possible r;
//   2. `l + r` where one side is itself provably a non-null String and the other side is
//      not possibly numeric anywhere (isPossiblyNumericDeep): the String branches pick
//      `valueOf (l) + valueOf (r)` with a provably non-null String on one side.
// Plain literals/templates and ternaries of these qualify; calls do NOT (even an audited
// non-null call is only proven for the narrowed local, not for arbitrary call sites).
function isProvablyNonNullStringExpression (printer, node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return true;
        case ts.SyntaxKind.ParenthesizedExpression:
            return isProvablyNonNullStringExpression (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return isProvablyNonNullStringExpression (printer, node.whenTrue, selfName)
                && isProvablyNonNullStringExpression (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression: {
            if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
                return false;
            }
            return isStaticallyStringExpression (printer, node.left, selfName)
                || (isProvablyNonNullStringExpression (printer, node.left, selfName) && !isPossiblyNumericDeep (printer, node.right))
                || (isProvablyNonNullStringExpression (printer, node.right, selfName) && !isPossiblyNumericDeep (printer, node.left));
        }
        default:
            return false;
    }
}

// every right operand of the `+` chain whose left spine contains the read `n` (through
// parentheses). `Helpers.add (n, r1)` is the first entry; each later entry belongs to an
// enclosing add whose left operand is the previous (already retyped) chain — the local's
// static type change reaches those too, but there only a possibly-numeric right operand
// can move the result (see the guard in isSafeToNarrow).
function addChainRights (n) {
    const rights = [];
    let node = n;
    let parent = n.parent;
    while (parent !== undefined && ts.isParenthesizedExpression (parent)) {
        node = parent;
        parent = parent.parent;
    }
    while (parent !== undefined && ts.isBinaryExpression (parent)
        && parent.operatorToken.kind === ts.SyntaxKind.PlusToken && parent.left === node) {
        rights.push (parent.right);
        node = parent;
        parent = parent.parent;
        while (parent !== undefined && ts.isParenthesizedExpression (parent)) {
            node = parent;
            parent = parent.parent;
        }
    }
    return rights;
}

// method calls on the local whose printed receiver cast is the SAME type (or Object):
// the printer casts receivers explicitly, so an unknown method could print an
// inconvertible `((String)x)` / `((java.util.List<Object>)x)` cast — reject by default.
// Property reads (`x.length`, `x[k]`) and equality/falsy wrappers take Object.
const STRING_RECEIVER_METHODS = new Set ([
    'toUpperCase', 'toLowerCase', 'trim', 'trimStart', 'trimEnd', 'startsWith', 'endsWith',
    'includes', 'indexOf', 'lastIndexOf', 'split', 'replace', 'replaceAll', 'slice',
    'substring', 'substr', 'padStart', 'padEnd', 'repeat', 'concat', 'charAt', 'charCodeAt',
    'codePointAt', 'search', 'toString', 'valueOf', 'localeCompare', 'match', 'normalize',
]);
const LIST_RECEIVER_METHODS = new Set ([
    'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'sort', 'reverse', 'concat',
    'indexOf', 'lastIndexOf', 'includes', 'fill', 'copyWithin', 'map', 'filter', 'reduce',
    'reduceRight', 'forEach', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex',
    'flat', 'flatMap', 'keys', 'values', 'entries', 'toString', 'at', 'remove', 'clear',
    'add', 'size', 'isEmpty', 'get', 'set', 'insert', 'append',
]);
// `x.join(sep)` prints `String.join((String)sep, (java.util.List<String>)x)` — the
// checkcast to List<String> is inconvertible from a List<Object>-typed local
// (probe-verified), so a join receiver must never carry the list family.
const LONG_RECEIVER_METHODS = new Set ([ 'toString', 'valueOf', 'intValue', 'longValue', 'doubleValue' ]);
// java.util.Map<String, Object>-safe receiver methods: only the prints that route
// through an Object-taking helper (Helpers.getIndexOf / Helpers.slice / Helpers.split /
// Helpers.concat / String.valueOf / Helpers.getArrayLength). Map has no `contains`,
// no list casts and no String members.
const MAP_RECEIVER_METHODS = new Set ([ 'toString', 'indexOf', 'split', 'concat', 'toFixed', 'slice' ]);
// WS cache/orderbook receivers: every method the printer knows prints through an
// Object-taking helper — postProcessWsJava's text pass rewrites the dynamic-dispatch
// names to `Helpers.callDynamically(x, "name", ...)`, which takes Object, and the
// ArrayCache/WsOrderBook members below are plain Java calls that exist on the box.
const WS_RECEIVER_METHODS = new Set ([
    'append', 'reset', 'store', 'storeArray', 'getLimit', 'limit',
    'clear', 'snapshot', 'get', 'put', 'containsKey', 'entrySet', 'toMap', 'copy',
]);

// argument positions the printer hard-casts: `(String)` — startsWith/endsWith arg 0,
// replace/replaceAll args 1+2, join arg 0, padEnd/padStart arg 1; `(Number)` — the
// padEnd/padStart length. A narrowed local in one of those positions must be castable
// to the cast type (`(String) integer` / `(Number) str` are inconvertible in javac).
const STRING_CAST_ARGUMENT_POSITIONS = {
    'startsWith': [ 0 ], 'endsWith': [ 0 ], 'replace': [ 1, 2 ], 'replaceAll': [ 1, 2 ],
    'join': [ 0 ], 'padEnd': [ 1 ], 'padStart': [ 1 ],
};
const NUMBER_CAST_ARGUMENT_POSITIONS = { 'padEnd': [ 0 ], 'padStart': [ 0 ] };

function argumentCastIsSafe (method, index, javaType) {
    const stringPositions = STRING_CAST_ARGUMENT_POSITIONS[method];
    if (stringPositions !== undefined && stringPositions.includes (index)) {
        return javaType === 'String';
    }
    const numberPositions = NUMBER_CAST_ARGUMENT_POSITIONS[method];
    if (numberPositions !== undefined && numberPositions.includes (index)) {
        return javaType === 'Integer' || javaType === 'Long' || javaType === 'Double';
    }
    return true;
}

const INTEGER_RECEIVER_METHODS = new Set ([ 'toString', 'intValue', 'longValue', 'doubleValue' ]);
const DOUBLE_RECEIVER_METHODS = new Set ([ 'toString', 'doubleValue', 'intValue', 'longValue' ]);
const BOOLEAN_RECEIVER_METHODS = new Set ([ 'toString', 'booleanValue' ]);


function receiverCallIsSafe (method, javaType) {
    if (javaType === 'String') {
        // `x.join(sep)` prints `(java.util.List<String>)x`: a String receiver is
        // inconvertible there, so it is deliberately NOT in STRING_RECEIVER_METHODS
        return STRING_RECEIVER_METHODS.has (method);
    }
    if (javaType === 'Long') {
        return LONG_RECEIVER_METHODS.has (method);
    }
    if (javaType === 'Integer') {
        return INTEGER_RECEIVER_METHODS.has (method);
    }
    if (javaType === 'Double') {
        return DOUBLE_RECEIVER_METHODS.has (method);
    }
    if (javaType === 'Boolean') {
        return BOOLEAN_RECEIVER_METHODS.has (method);
    }
    if (javaType === JAVA_ARRAY_TYPE) {
        return LIST_RECEIVER_METHODS.has (method);
    }
    if (javaType === JAVA_STRUCTURE_TYPE) {
        return MAP_RECEIVER_METHODS.has (method);
    }
    if (WS_TYPES.has (javaType) || javaType === 'Client') {
        return WS_RECEIVER_METHODS.has (method);
    }
    return false;
}

// every Identifier node in `scope`, by source name. Not cached: the Java printer
// renames identifiers inside object literals in place (`x` -> `finalX`) while a body
// is being printed, so the walk must read the live AST each time.
function identifierIndex (scope) {
    const index = new Map ();
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.Identifier) {
            const name = n.escapedText;
            let list = index.get (name);
            if (list === undefined) {
                list = [];
                index.set (name, list);
            }
            list.push (n);
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return index;
}

// is `n` an argument of a `this.<async>()` call, either directly or through the
// expression forms whose printed Java type is my narrowed type whenever an operand is
// (`(x)`, `x + y`, `c ? x : y`). Anything else in between breaks the chain.
function feedsInheritedAsyncCall (printer, n, scope) {
    let child = n;
    let current = n.parent;
    while (current !== undefined && current !== scope) {
        if (ts.isCallExpression (current)) {
            return current.arguments.indexOf (child) !== -1 && isThisOrSuperCall (current) && isAsyncMethodCall (printer, current);
        }
        const propagates = ts.isParenthesizedExpression (current)
            || (ts.isBinaryExpression (current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken)
            || (ts.isConditionalExpression (current) && current.condition !== child);
        if (!propagates) {
            return false;
        }
        child = current;
        current = current.parent;
    }
    return false;
}

// reject the refinement when a later use needs the local to stay `Object`
function isSafeToNarrow (printer, declaration, sourceName, javaType, isProFile, info) {
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const n of uses) {
        if (n === declaration.name) {
            continue;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isVariableDeclaration (parent) && parent.name === n) {
            continue; // a sibling block-scoped declaration gets its own type
        }
        if (ts.isPropertyAccessExpression (parent) && parent.name === n) {
            // `obj.<name>` is a member read, but `x.<method>(...)` is a receiver call
            // the printer may cast to a fixed type
            continue;
        }
        if (ts.isElementAccessExpression (parent) && parent.expression === n) {
            // `x[k]` reads print Helpers.GetValue(x, k) and stay valid for every
            // family; a write / delete through a STRING local prints a receiver cast
            // the String cannot satisfy ("...".remove((String)k) / List cast), so it
            // rejects. Map/List/ws locals take the Object-parameter helper unchanged.
            const grand = parent.parent;
            if (grand?.kind === ts.SyntaxKind.DeleteExpression) {
                return false;
            }
            if (javaType === 'String' && grand?.kind === ts.SyntaxKind.BinaryExpression && grand.left === parent
                && ASSIGNMENT_OPERATORS.includes (grand.operatorToken.kind)) {
                return false;
            }
        }
        if (ts.isPropertyAccessExpression (parent) && parent.expression === n && parent.parent !== undefined
            && ts.isCallExpression (parent.parent) && parent.parent.expression === parent) {
            const method = String (parent.name.escapedText);
            if (!receiverCallIsSafe (method, javaType)) {
                return false;
            }
        }
        if (ts.isCallExpression (parent)) {
            // the identifier is a plain argument of a call: the printer hard-casts some
            // argument positions (`(String)` in startsWith/endsWith/replace/replaceAll/
            // join/padEnd/padStart, `(Number)` in the pad length) and an unrelated
            // narrowed box is an inconvertible cast (verified against javac)
            const at = parent.arguments.indexOf (n);
            if (at !== -1 && ts.isPropertyAccessExpression (parent.expression)) {
                const method = String (parent.expression.name.escapedText);
                if (!argumentCastIsSafe (method, at, javaType)) {
                    return false;
                }
            }
        }
        if (ts.isBinaryExpression (parent) && parent.left === n
            && parent.operatorToken.kind === ts.SyntaxKind.PlusToken
            && info?.nonNull === false) {
            // `x + y` prints `Helpers.add(x, y)`: a narrowed String operand switches the
            // overload to add(String, Object), which returns "nullnull" where the Object
            // overload returned null when BOTH operands are null (Helpers.add). Only a
            // provably non-null String family may sit on the left; a nullable one is left
            // as Object, exactly like every other shape the narrowed type cannot satisfy.
            return false;
        }
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            const op = parent.operator;
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                return false;
            }
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // prints `x instanceof <primitive box>`: inconvertible for the wrong type
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            return false; // `[x, y] = f()` prints `x = ((List) tmp).get(i)`
        }
        if (ts.isAsExpression (parent) || ts.isTypeAssertionExpression (parent)) {
            // a TS cast on the local prints a Java cast of the asserted type; for the
            // narrowed type the spelled cast can be inconvertible (String -> Double is a
            // compile error) — keep Object (the C# campaign's reject family, reused here)
            return false;
        }
        if (ts.isBinaryExpression (parent) && parent.left === n) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                let ok;
                if (javaType === 'String') {
                    // the narrowed declaration can only take writes whose printed Java is
                    // statically String (isStaticallyStringExpression) or a same-family
                    // helper call the reassignment hook casts
                    ok = isStaticallyStringExpression (printer, unwrapParens (parent.right), sourceName)
                        || isProvablyOfType (printer, unwrapParens (parent.right), javaType, sourceName);
                } else {
                    ok = isProvablyOfType (printer, unwrapParens (parent.right), javaType, sourceName);
                }
                if (!ok) {
                    return false;
                }
            } else if (op === ts.SyntaxKind.PlusEqualsToken && javaType === 'String') {
                // `x += r` lowers to `x = Helpers.add (x, r)` (generated Java never keeps
                // a raw `+=` on these locals): the same non-null String right operand the
                // direct-add rule needs; the read of x in this statement is this very node,
                // so addChainRights has no first entry for it
                if (!isProvablyNonNullStringExpression (printer, parent.right, sourceName)) {
                    return false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return false;
            }
        }
        // strictPlus families (string-element access): the printed Helpers.add moves
        // from add(Object, Object) to add(String, *) when the local is the LEFT of a
        // `+` chain, and the two diverge for a null left / non-string right
        if (info?.strictPlus === true && ts.isBinaryExpression (parent)
            && parent.operatorToken.kind === ts.SyntaxKind.PlusToken && !plusUsesAreSafe (n)) {
            return false;
        }
        if (isProFile && info?.skipInheritedAsyncGuard !== true && feedsInheritedAsyncCall (printer, n, scope)) {
            return false;
        }
    }
    return true;
}

function javaLocalTypeOf (printer, declaration, narrowed) {
    if (!ts.isIdentifier (declaration.name)) {
        return undefined;
    }
    // scan by the SOURCE name: ReservedKeywordsReplacements renames the printed one
    const sourceName = declaration.name.escapedText;
    const fileName = declaration.getSourceFile ().fileName;
    const isProFile = /[\\/]pro[\\/]/.test (fileName);
    const info = localInitializerType (printer, declaration, isProFile, narrowed);
    if (info === undefined) {
        return undefined;
    }
    if (!isSafeToNarrow (printer, declaration, sourceName, info.type, isProFile, info)) {
        return undefined;
    }
    return info;
}

// ===== 4. tuple-returning handle* destructuring: holder + audited elements =====
//
// JAVA-RE-3 (the JAVA-10 slice re-implemented as an additive section of this module):
// `const [a, b] = this.handleX (...)` and `[a, b] = this.handleX (...)` print through two
// printer paths that emit the SAME destructuring block (ast-transpiler javaTranspiler.ts,
// pin 6c27cfb7):
//
//   printVariableDeclarationList, ArrayBindingPattern branch
//       <iden>var <holder> = <call>;
//       <iden>var <a> = ((java.util.List<Object>) <holder>).get(0);
//       <iden>var <b> = ((java.util.List<Object>) <holder>).get(1)
//
//   printCustomBinaryExpressionIfAny, `[a, b] = <call>` branch
//       <iden>var <holder> = <call>;
//       <iden><a> = ((java.util.List<Object>) <holder>).get(0);
//       <iden><b> = ((java.util.List<Object>) <holder>).get(1)
//
// (<holder> = the printed element names concatenated + "Variable".) Census of the generated
// tree on this branch: 2,176 holder blocks in 124 files — 1,995 assignment-shaped, 181
// declaration-shaped; 1,972 of them are the handle* family this section covers.
//
// HOLDER — retyped for the whole destructuring family whose callee name contains "andle"
// (the csharp-local-types.js#destructuredHandleCallName predicate; do NOT touch
// prepareRequest / orderRequest / parseCreateEditOrderArgs / promiseAll / getBybitType
// holders). The holder prints `var` and every tuple-returning helper is declared
// `public Object`, so `var` infers Object and every element read pays a checked cast; the
// holder is declared `java.util.List<Object>` with the FIRST read's cast hoisted onto the
// initialiser and every element read left EXACTLY as printed:
//
//     var <holder> = <call>;   ->   java.util.List<Object> <holder> = (java.util.List<Object>) <call>;
//
// That is value- and failure-identical: the `.get (` reads prove the holder holds a List at
// that point, a null holder still only fails at the first `.get (...)` (a checkcast of null
// succeeds), and a non-list box throws the same ClassCastException one line earlier with no
// intervening statement. An `await this.handleX (...)` initialiser (printed
// `(this.handleX (...)).join()`) and a `super.handleX (...)` receiver take the same rewrite.
//
// ELEMENTS — element 0 is typed only for the handlers whose Java body provably boxes that
// type (or null) on EVERY return path (audit of io/github/ccxt/BaseExchange.java +
// base/SafeMethods.java in this worktree; zero exchange overrides of the accessors):
//
//   handleParamString / handleParamString2   -> String   (`String value = this.safeString(2) (...)`;
//                                              BaseExchange.safeString is declared String, and a Java
//                                              override can only return String)
//   handleNetworkCodeAndParams               -> String   (`String networkCodeInParams = this.safeString2 (...)`)
//   handleParamInteger / handleParamInteger2 -> Long     (SafeMethods.SafeInteger(N) is declared Long and
//                                              returns Long|null on every path — the caller default goes
//                                              through toLongQuiet, never handed back raw; the 2 variant
//                                              already prints `Long value = (Long) this.safeInteger2 (...)`)
//   handlePostOnly                           -> Boolean  (both returns are asList (true|false, parameters))
//   handleTriggerAndParams                   -> Boolean  (`Object isTrigger = this.safeBool2 (parameters,
//                                              "trigger", "stop")` — no default argument, so safeBool2
//                                              hands back null on its fall-through path)
//   handleParamBool / handleParamBool2       -> Boolean, ONLY when the call's own default argument is
//                                              absent or a boolean literal (index 2 / 3): BaseExchange.safeBool
//                                              hands the caller's `defaultValue` back UNTOUCHED whenever the
//                                              found value is not a Boolean, so only a provable default
//                                              keeps the box Boolean|null.
//
// NOT typed — element 0 is the caller's arbitrary box on at least one return path:
//   handleOptionAndParams / handleOptionAndParams2  (`value = safeValue2 (...) : defaultValue`)
//   handleMarketTypeAndParams                       (`Helpers.GetValue (market, "type")` / defaultValue)
//   handleSubTypeAndParams                          (`subType = GetValue (handleOptionAndParams (...), 0)`)
//   handleMarginModeAndParams                       (returns handleOptionAndParams directly)
//   handleUntilOption                               (element 0 is the caller's own `request` argument)
// Element 1 is always the caller's params box — Java has no dictionary type to name it with.
//
// THE SCAN (why a retyped element is behaviour-preserving): naming a type changes nothing at
// runtime EXCEPT where javac resolves something statically against it, so every use of the
// target local in its enclosing function is inspected (handleTupleIsSafeToNarrow). Rejects:
//   - any write other than the destructuring element write or a value provably of the type
//     (compound assignment prints `x = Helpers.add (x, r)` — an Object result);
//   - `typeof x` (prints instanceof tests), x++/x--, spread, prefix ops other than `!`;
//   - x as the LEFT operand of `+` for a String local unless the right operand is provably a
//     String (Helpers.add(String, *) re-binds and diverges from add(Object, Object) when the
//     left is null and the right is not a string);
//   - list method receivers (.push/.pop/.shift/.reverse/.join/... print
//     `((java.util.List<Object>) x)` casts) — never valid on String/Long/Boolean — and the
//     printer's String-cast receivers for a non-String local;
//   - locals feeding a `this.<async>()` call in a pro file (typed wrapper overloads would win
//     Java overload resolution), same as the safestring family.
// Both mechanisms only run when the whole-function scan passes: the declaration shape
// rewrites the element line in place; the assignment shape retypes the target's earlier
// `Object x = ...` declaration (WeakMap declaration -> type, matched by
// checker.getSymbolAtLocation) and injects the same checkcast on the element write.

// callee name -> element-0 type. `defaultArg` marks the handlers whose element 0 is only
// provable when the call's own default argument is absent or a boolean literal.
const HANDLE_ELEMENT_TYPES = {
    'handleParamString': { element0: 'String' },
    'handleParamString2': { element0: 'String' },
    'handleParamInteger': { element0: 'Long' },
    'handleParamInteger2': { element0: 'Long' },
    'handleParamBool': { element0: 'Boolean', defaultArg: 2 },
    'handleParamBool2': { element0: 'Boolean', defaultArg: 3 },
    'handleNetworkCodeAndParams': { element0: 'String' },
    'handlePostOnly': { element0: 'Boolean' },
    'handleTriggerAndParams': { element0: 'Boolean' },
};

// the hand-written base declaration: an exchange override (rare, but possible) prints its own
// shape and must never classify. The base stage transpiles a copy of ts/src/base/Exchange.ts
// with the overload signatures stripped (build/stripOverloads.ts ->
// Exchange.nooverloads.<pid>.ts) and calls inside it resolve to that copy, so both file
// names count as the base declaration.
const HANDLE_DECLARATION_FILE = /[\\/]base[\\/]Exchange(\.nooverloads\.\d+)?\.ts$/;

// base helpers DECLARED `String` in the Java base (BaseExchange.java / SafeMethods.java)
const HANDLE_DECLARED_STRING_ACCESSORS = new Set ([ 'safeString', 'safeString2', 'safeStringN' ]);
// hand-written base methods declared `String` in BaseExchange.java
const HANDLE_DECLARED_STRING_METHODS = new Set ([ 'iso8601', 'numberToString', 'uuid', 'uuid16', 'uuid22', 'uuidv1' ]);
const HANDLE_PRECISE_STRING_STATICS = new Set ([
    'stringAdd', 'stringSub', 'stringMul', 'stringDiv', 'stringMod', 'stringAbs',
    'stringNeg', 'stringMax', 'stringMin', 'stringOr',
]);
const HANDLE_STRING_RETURNING_METHODS = new Set ([
    'toUpperCase', 'toLowerCase', 'trim', 'replace', 'replaceAll', 'padStart', 'padEnd',
    'substring', 'substr', 'charAt', 'toString',
]);
// methods whose Java print hard-casts the receiver to java.util.List<Object> — never valid
// on a String/Long/Boolean local (the first five are the names javaTranspiler.ts rewrites)
const HANDLE_LIST_RECEIVER_METHODS = new Set ([
    'push', 'pop', 'shift', 'reverse', 'join', 'unshift', 'splice', 'sort', 'fill',
    'copyWithin', 'flat', 'find', 'filter', 'map', 'forEach', 'some', 'every', 'reduce',
    'keys', 'values', 'entries',
]);
// methods whose Java print casts the receiver to `(String)` — an inconvertible cast for a
// Long/Boolean local (`split`, `slice`, `concat`, `indexOf` print Object-parameter helpers
// and stay fine for every type)
const HANDLE_STRING_RECEIVER_METHODS = new Set ([
    'includes', 'search', 'startsWith', 'endsWith', 'trim', 'toUpperCase', 'toLowerCase',
    'replace', 'replaceAll', 'padStart', 'padEnd', 'substring', 'substr', 'charAt', 'match',
]);

function handleIsBooleanLiteral (node) {
    return node !== undefined
        && (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword);
}

// the receiver of a String-cast method call: the printer wraps any receiver in
// `((String) recv).method()` and the call only type-checks in TS when recv is string-ish
function handleIsStringishReceiver (printer, node) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.AsExpression:
        case ts.SyntaxKind.TypeAssertionExpression:
            return node.type?.kind === ts.SyntaxKind.StringKeyword;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleIsStringishReceiver (printer, node.expression);
        case ts.SyntaxKind.Identifier:
            return node.escapedText !== 'undefined';
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return true;
        default:
            return handleProvablyStringValue (printer, node, undefined);
    }
}

function handleProvablyStringValue (printer, node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleProvablyStringValue (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            // both arms statically String keep the Java conditional String
            return handleProvablyStringValue (printer, node.whenTrue, selfName)
                && handleProvablyStringValue (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression:
            // `a + b` prints Helpers.add (a, b); add(String, *) is the only String-returning
            // overload, so the LEFT operand must itself be provably String
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && handleProvablyStringValue (printer, node.left, selfName);
        case ts.SyntaxKind.CallExpression: {
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee)) {
                return false;
            }
            const method = String (callee.name.escapedText);
            if (HANDLE_STRING_RETURNING_METHODS.has (method) && handleIsStringishReceiver (printer, callee.expression)) {
                return true;
            }
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return HANDLE_DECLARED_STRING_ACCESSORS.has (method) || HANDLE_DECLARED_STRING_METHODS.has (method);
            }
            return callee.expression.kind === ts.SyntaxKind.Identifier
                && callee.expression.escapedText === 'Precise'
                && HANDLE_PRECISE_STRING_STATICS.has (method);
        }
        default:
            return false;
    }
}

function handleProvablyBooleanValue (printer, node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleProvablyBooleanValue (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return handleProvablyBooleanValue (printer, node.whenTrue, selfName)
                && handleProvablyBooleanValue (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.PrefixUnaryExpression:
            // `!x` prints `!Helpers.isTrue (x)` — a Java boolean, autoboxed into Boolean
            return node.operator === ts.SyntaxKind.ExclamationToken;
        case ts.SyntaxKind.CallExpression: {
            // the Helpers comparisons are DECLARED `public static boolean` and autobox
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee) || callee.expression.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            if (callee.expression.escapedText !== 'Helpers') {
                return false;
            }
            const method = String (callee.name.escapedText);
            return method === 'isEqual' || method === 'isTrue' || method === 'inOp';
        }
        default:
            return false;
    }
}

function handleProvablyLongValue (node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleProvablyLongValue (node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return handleProvablyLongValue (node.whenTrue, selfName) && handleProvablyLongValue (node.whenFalse, selfName);
        default:
            // deliberately NO numeric literal: `Long x = 5;` does not compile in Java
            return false;
    }
}

function handleValueProvablyTyped (printer, node, type, selfName) {
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    if (type === 'String') {
        return handleProvablyStringValue (printer, node, selfName);
    }
    if (type === 'Boolean') {
        return handleProvablyBooleanValue (printer, node, selfName);
    }
    if (type === 'Long') {
        return handleProvablyLongValue (node, selfName);
    }
    return false;
}

// the audited element type of `this.handleX (...)`[index], or undefined
function handleElementType (printer, callNode, index) {
    if (!isThisCall (callNode) || index !== 0) {
        // only element 0 is ever a named type; element 1 is the caller's params box
        return undefined;
    }
    const name = String (callNode.expression.name.escapedText);
    const spec = HANDLE_ELEMENT_TYPES[name];
    if (spec === undefined) {
        return undefined;
    }
    if (spec.defaultArg !== undefined) {
        const defaultArgument = callNode.arguments[spec.defaultArg];
        if (defaultArgument !== undefined && !handleIsBooleanLiteral (defaultArgument)) {
            // the caller's default flows out of safeBool untouched when the found value is
            // not a Boolean — only an absent / boolean-literal default proves the box
            return undefined;
        }
    }
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (callNode)?.declaration;
    } catch (e) {
        return undefined;
    }
    if (declaration === undefined || !HANDLE_DECLARATION_FILE.test (declaration.getSourceFile ().fileName)) {
        return undefined;
    }
    return spec.element0;
}

// `x` used as a member/declaration NAME rather than a read or write of the local
function handleIsNotAUse (identifier) {
    const parent = identifier.parent;
    if (parent === undefined) {
        return true;
    }
    switch (parent.kind) {
        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.Parameter:
        case ts.SyntaxKind.BindingElement:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.PropertyAccessExpression:
            return parent.name === identifier;
        case ts.SyntaxKind.PropertyAssignment:
            // `{ x: y }` — the key is not a use; the shorthand `{ x }` IS a read of x
            return parent.name === identifier && parent.initializer !== identifier;
        default:
            return false;
    }
}

function handleIsListReceiver (method) {
    return HANDLE_LIST_RECEIVER_METHODS.has (method);
}

// every use of the local must survive the narrowing; `skipNode` is the binding name the
// retype creates / the declaration name (its own binding is not a use)
function handleTupleIsSafeToNarrow (printer, scope, skipNode, sourceName, expected, isProFile) {
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const use of uses) {
        if (use === skipNode) {
            continue;
        }
        if (handleIsNotAUse (use)) {
            continue;
        }
        // `(x) + y` prints `Helpers.add ((x), y)` — x's static type still picks the overload
        let n = use;
        while (n.parent !== undefined && ts.isParenthesizedExpression (n.parent)) {
            n = n.parent;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // `typeof x` prints instanceof tests (inconvertible for String/Long/Boolean)
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isPostfixUnaryExpression (parent)) {
            return false; // x++ / x--
        }
        if (ts.isPrefixUnaryExpression (parent)) {
            if (parent.operator !== ts.SyntaxKind.ExclamationToken) {
                return false; // -x / +x / ~x print numeric/bit helpers
            }
            continue; // `!x` is fine at every type
        }
        if (ts.isArrayLiteralExpression (parent)) {
            const grand = parent.parent;
            if (grand !== undefined && ts.isBinaryExpression (grand) && grand.left === parent
                && grand.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                // `[a, b] = this.handleX (...)` — accepted only for the audited handlers,
                // whose element read gets the cast back to this type
                const index = parent.elements.indexOf (use);
                const type = (index === -1) ? undefined : handleElementType (printer, unwrapParens (grand.right), index);
                if (type === undefined || type !== expected) {
                    return false;
                }
                continue;
            }
            continue; // a plain array literal prints a List<Object> construction — an Object slot
        }
        if (ts.isBinaryExpression (parent) && parent.left === n) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                if (!handleValueProvablyTyped (printer, unwrapParens (parent.right), expected, sourceName)) {
                    return false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return false; // `x += r` prints `x = Helpers.add (x, r)` — an Object result
            } else if (op === ts.SyntaxKind.PlusToken && expected === 'String') {
                // LEFT of `+` prints Helpers.add (x, r): add(String, *) re-binds and diverges
                // from add(Object, Object) when x is null and r is not a string
                if (!handleProvablyStringValue (printer, parent.right, sourceName)) {
                    return false;
                }
            }
        }
        if (ts.isPropertyAccessExpression (parent) && parent.expression === n) {
            const method = String (parent.name.escapedText);
            if (handleIsListReceiver (method)) {
                return false;
            }
            if (expected !== 'String' && HANDLE_STRING_RECEIVER_METHODS.has (method)) {
                return false;
            }
        }
        if (isProFile && feedsInheritedAsyncCall (printer, use, scope)) {
            return false;
        }
    }
    return true;
}

// destructuring writes of `sourceName` in `scope`: the audited element type of the target,
// or undefined when any write is not one of them (the local then stays Object)
function handleDestructuredWriteType (printer, scope, skipNode, sourceName) {
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    let type;
    let found = false;
    for (const use of uses) {
        if (use === skipNode) {
            continue;
        }
        const parent = use.parent;
        if (parent === undefined || parent.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            continue;
        }
        const grand = parent.parent;
        if (grand === undefined || !ts.isBinaryExpression (grand) || grand.left !== parent
            || grand.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
            continue;
        }
        const index = parent.elements.indexOf (use);
        const written = (index === -1) ? undefined : handleElementType (printer, unwrapParens (grand.right), index);
        if (written === undefined) {
            return undefined;
        }
        if (type !== undefined && type !== written) {
            return undefined; // mixed boxes — cannot name one type
        }
        type = written;
        found = true;
    }
    return found ? type : undefined;
}

// the Java type for a `let x = ... ` local whose writes are the audited destructuring
// element writes: the element type, when the initialiser and every other use survive the
// proof. undefined keeps the printer's `Object x = ...`.
function handleTupleTargetDeclarationType (printer, declaration) {
    if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const sourceName = declaration.name.escapedText;
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return undefined;
    }
    const type = handleDestructuredWriteType (printer, scope, declaration.name, sourceName);
    if (type === undefined) {
        return undefined;
    }
    const initializer = declaration.initializer;
    if (initializer !== undefined && !handleValueProvablyTyped (printer, unwrapParens (initializer), type, sourceName)) {
        return undefined;
    }
    const isProFile = /[\\/]pro[\\/]/.test (declaration.getSourceFile ().fileName);
    if (!handleTupleIsSafeToNarrow (printer, scope, declaration.name, sourceName, type, isProFile)) {
        return undefined;
    }
    return type;
}

// `const [a, b] = this.handleX (...)` / `[a, b] = this.handleX (...)`: the family predicate
// (the callee contains "andle"), plus two shapes an `await this.handleX (...)` initialiser
// (`var H = (this.handleX (...)).join();`) and a `super.handleX (...)` receiver add. The
// holder rewrite itself is sound for ANY destructuring block (the element reads prove the
// cast), but it is kept to the tuple-returning handle* family this section covers.
function isHandleDestructuringCallee (node) {
    let current = node;
    while (current !== undefined && (ts.isParenthesizedExpression (current) || ts.isAwaitExpression (current))) {
        current = current.expression;
    }
    return isThisOrSuperCall (current) && String (current.expression.name.escapedText).includes ('andle');
}

// `var <holder> = ` -> `java.util.List<Object> <holder> = (java.util.List<Object>) ` on the
// line the reads prove; returns undefined when the line is not the expected holder
function handleRetypeHolderLine (line, holderName) {
    const stripped = line.replace (/^[ \t]*/, '');
    const indent = line.slice (0, line.length - stripped.length);
    const head = `var ${holderName} = `;
    if (!stripped.startsWith (head)) {
        return undefined;
    }
    return `${indent}java.util.List<Object> ${holderName} = (java.util.List<Object>) ` + stripped.slice (head.length);
}

// `const [a, b] = this.handleX (...)`: type the holder and, for the audited handlers, the
// element declarations whose uses survive the scan
function handleRetypeBindingPatternBlock (printer, tupleTypes, declaration, printed) {
    if (!isHandleDestructuringCallee (declaration.initializer)) {
        return printed;
    }
    const elements = declaration.name.elements;
    const printedNames = elements.map ((element) => printer.printNode (element.name, 0));
    const holderName = printedNames.join ('') + 'Variable';
    const readMarker = `((java.util.List<Object>) ${holderName}).get(`;
    if (!printed.includes (readMarker)) {
        return printed; // the element reads must prove the cast this rewrite hoists
    }
    const lines = printed.split ('\n');
    const holder = handleRetypeHolderLine (lines[0], holderName);
    let retyped = holder !== undefined;
    if (holder !== undefined) {
        lines[0] = holder;
    }
    const scope = enclosingFunction (declaration);
    const isProFile = /[\\/]pro[\\/]/.test (declaration.getSourceFile ().fileName);
    const call = declaration.initializer;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const type = handleElementType (printer, call, i);
        if (type === undefined || element.name?.kind !== ts.SyntaxKind.Identifier) {
            continue;
        }
        if (!handleTupleIsSafeToNarrow (printer, scope, element.name, element.name.escapedText, type, isProFile)) {
            continue;
        }
        const line = lines[1 + i];
        if (line === undefined) {
            continue;
        }
        const stripped = line.replace (/^[ \t]*/, '');
        const indent = line.slice (0, line.length - stripped.length);
        const head = `var ${printedNames[i]} = `;
        if (!stripped.startsWith (head) || !stripped.slice (head.length).startsWith (readMarker)) {
            continue;
        }
        lines[1 + i] = `${indent}${type} ${printedNames[i]} = (${type}) ` + stripped.slice (head.length);
        tupleTypes.set (element, type);
        retyped = true;
    }
    return retyped ? lines.join ('\n') : printed;
}

// the type this section already proved for the local an element write targets
function handleTupleTargetType (printer, tupleTypes, element) {
    const key = element.expression ?? element;
    let declaration;
    try {
        const symbol = printer.getChecker ().getSymbolAtLocation (key);
        declaration = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
    } catch (e) {
        return undefined;
    }
    if (declaration === undefined) {
        return undefined;
    }
    if (tupleTypes.has (declaration)) {
        return tupleTypes.get (declaration);
    }
    if (tupleTypes.has (declaration.parent)) {
        return tupleTypes.get (declaration.parent);
    }
    return undefined;
}

// `[a, b] = this.handleX (...)` printed by printCustomBinaryExpressionIfAny: type the
// holder and cast the element writes whose target declaration this section retyped
function handleRetypeDestructuringAssignment (printer, tupleTypes, node, printed) {
    if (!isHandleDestructuringCallee (node.right)) {
        return printed;
    }
    const elements = node.left.elements;
    const printedNames = elements.map ((element) => printer.printNode (element, 0));
    const holderName = printedNames.join ('') + 'Variable';
    const readMarker = `((java.util.List<Object>) ${holderName}).get(`;
    if (!printed.includes (readMarker)) {
        return printed; // the reads must prove the cast this rewrite hoists
    }
    const lines = printed.split ('\n');
    const holder = handleRetypeHolderLine (lines[0], holderName);
    if (holder === undefined) {
        return printed;
    }
    lines[0] = holder;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const declared = handleTupleTargetType (printer, tupleTypes, element);
        if (declared === undefined) {
            continue;
        }
        const line = lines[1 + i];
        if (line === undefined) {
            continue;
        }
        const stripped = line.replace (/^[ \t]*/, '');
        const indent = line.slice (0, line.length - stripped.length);
        const head = `${printedNames[i]} = `;
        if (!stripped.startsWith (head)) {
            continue;
        }
        const body = stripped.slice (head.length);
        if (!body.startsWith (readMarker)) {
            continue;
        }
        const rest = body.slice (readMarker.length);
        if (rest !== `${i})` && rest !== `${i});`) {
            continue;
        }
        const semi = rest.endsWith (';') ? ';' : '';
        lines[1 + i] = `${indent}${printedNames[i]} = (${declared}) ${readMarker}${i})${semi}`;
    }
    return lines.join ('\n');
}

// install the handle* destructuring rewrites on a printer. Idempotent: additive wrapper on
// printVariableDeclarationList (the declaration shape + the target declarations) and on
// printCustomBinaryExpressionIfAny (the assignment shape). Chained from
// installJavaLocalTypes below; every other section's output is returned untouched.
export function patchJavaHandlerLocalTypes (printer) {
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._javaHandlerLocalTypesPatched) {
        return;
    }
    // declaration node -> proven Java type, filled as declarations / binding elements are
    // printed and read back while a destructuring write in the same block is printed
    const tupleTypes = new WeakMap ();
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = original (node, identation);
        const declarations = node?.declarations;
        if (!declarations || declarations.length !== 1) {
            return printed;
        }
        const declaration = declarations[0];
        if (declaration.name?.kind === ts.SyntaxKind.ArrayBindingPattern) {
            return handleRetypeBindingPatternBlock (printer, tupleTypes, declaration, printed);
        }
        if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
            return printed;
        }
        const type = handleTupleTargetDeclarationType (printer, declaration);
        if (type === undefined) {
            return printed;
        }
        const iden = printer.getIden (identation);
        const printedName = printer.printNode (declaration.name, 0);
        const marker = `${iden}${printer.VAR_TOKEN} ${printedName} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed; // unexpected shape (or a section that runs before this one) — keep it
        }
        tupleTypes.set (declaration, type);
        return printed.slice (0, at) + `${iden}${type} ${printedName} = ` + printed.slice (at + marker.length);
    };
    if (typeof printer.printCustomBinaryExpressionIfAny === 'function') {
        const originalCustom = printer.printCustomBinaryExpressionIfAny.bind (printer);
        printer.printCustomBinaryExpressionIfAny = function (node, identation) {
            const printed = originalCustom (node, identation);
            if (typeof printed !== 'string'
                || node?.kind !== ts.SyntaxKind.BinaryExpression
                || node.operatorToken?.kind !== ts.SyntaxKind.EqualsToken
                || node.left?.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
                return printed;
            }
            return handleRetypeDestructuringAssignment (printer, tupleTypes, node, printed);
        };
    }
    printer._javaHandlerLocalTypesPatched = true;
}

// ===== install =====

// ===== collection/dict helpers -> java.util.Map<String, Object> / java.util.List<Object> =====
//
// (JAVA-RE-5 — additive slice; its patcher is installed from the bottom of
// installJavaLocalTypes below.) The Java printer declares every initialised body local
// `Object`; this section names the locals whose initializer is a WHOLE call to one of the
// hand-written collection helpers, whose Java box provably IS the named collection on
// every path that can return.
//
// Java base audit (java/lib/src/main/java/io/github/ccxt/BaseExchange.java +
// base/Generic.java + base/Functions.java):
//
//   Map<String, Object> — a fresh LinkedHashMap on every returning path; a list / foreign
//   input throws INSIDE the helper before it can return (never a passthrough):
//     * this.extend (aa, bb)         -> Generic.Extend: casts both inputs to Map (null
//                                       tolerated), builds a fresh LinkedHashMap;
//     * this.deepExtend (objs...)    -> Generic.deepExtend: builds a fresh LinkedHashMap;
//                                       the final `(Map) outObj` cast throws for a
//                                       non-mapable input, so it never hands a list back;
//                                       empty/all-null input -> null (a checkcast passes);
//     * this.keysort (x)             -> Functions.keysort: casts its input to Map (a list
//                                       input throws there), builds a fresh LinkedHashMap;
//     * this.indexBy / indexBySafe / groupBy (x, key) -> fresh LinkedHashMap; a non-list /
//                                       non-map input throws at the internal cast.
//
//   List<Object> — a fresh ArrayList on every returning path:
//     * this.sortBy / sortBy2 (arr, key[, desc]) -> Generic.sortBy/2: `(List) array`
//                                       throws for a non-list input, otherwise a fresh
//                                       sorted ArrayList (an unmatched-key run may hand
//                                       back null — a checkcast passes null);
//     * this.filterBy (x, key, val)  -> Generic.filterBy: fresh ArrayList;
//     * this.toArray (x)             -> Functions.toArray: fresh ArrayList on EVERY path
//                                       (null -> empty list, non-collection scalar ->
//                                       empty list, list -> copy, map -> values);
//     * this.aggregate (bidasks)     -> Functions.aggregate: fresh ArrayList, every path;
//     * this.arrayConcat (a, b)      -> Functions.arrayConcat: fresh ArrayList when both
//                                       inputs are lists, `return null` otherwise — never
//                                       a foreign box.
//
// DECLARED-Object helpers get an explicit checkcast at the call site (a no-op on the box
// the helper already returns):
//     * this.extend (a, b, c...) — the VARARGS overload `Object extend(Object...)`; the
//       fixed-arity `extend(Object, Object)` is declared Map and needs none. The cast
//       predicate fires when the TS call carries != 2 arguments (or a spread); a
//       redundant checkcast on the 2-arg overload's Map would be harmless anyway.
//     * this.arrayConcat (a, b) — declared `Object` in BaseExchange.
//
// ===== THE omit TRAP (do not "fix" this) =====
// omit / omitN / clone / deepExtend2 / omitZero / sort stay Object-typed LOCALS:
//     * Functions.omit(Object, Object) hands a LIST input back AS-IS
//       (`if (aa instanceof List<?>) return aa;`). Batch-order endpoints (okx sign() for
//       privatePostTradeBatchOrders, binance/mexc batch orders) hand a list of orders
//       down fetch2 -> handleOptionAndParams -> omit; a Map-typed local (or a `(Map)`
//       checkcast at the declaration) throws ClassCastException on a LIVE path. Same
//       conclusion as the C# campaign (PR #30356) and the java-loc-collections slice.
//       The `Object x = this.omit(...)` locals stay exactly as the printer emitted them;
//       the enclosing `keysort(this.omit(...))` / `extend(request, query)` call shapes
//       are fine to narrow and are covered by the tables above.
//     * clone — BaseExchange.clone is `return s;` (identity) and ts/src/base/functions/
//       generic.ts returns an ARRAY for array inputs: the box is not always a Map.
//     * deepExtend2 — has `out = obj;` return paths handing back a non-Map.
//     * omitN — same helper family as omit; kept Object deliberately (0 call sites today).
//     * omitZero — returns its non-collection input untouched.
//     * sort — BaseExchange.sort is declared `java.util.List<String>`; a List<Object>
//       local cannot take that value (java generics are invariant).
//
// CONSUMER policy (mirrors the java-loc-collections slice, re-checked against the pinned
// ast-transpiler printer): only the receiver calls the printer emits in a shape the
// narrowed type satisfies are accepted — the Object-taking helpers (indexOf/slice/split/
// concat/toString/toFixed) for both types, and `((java.util.List<Object>) x)` receivers
// (push/pop/shift/reverse) plus `x.contains` (includes) for the list family. `join` prints
// `String.join(..., (java.util.List<String>) x)` — a javac inconvertible-types ERROR on a
// List<Object> receiver — and the String-cast receivers (trim/toUpperCase/replace/padEnd/
// ...) are inconvertible on both; all of those reject. `delete x[k]`, `as` casts, typeof,
// spread, ++/--, for..of, await (prints `(x).join()`) and compound assignments reject.
// Writes to an already-narrowed local are accepted only for the nullish literal, a
// same-kind literal, or a same-family call; the reassignment hook below supplies the
// checkcast when the callee is declared Object.

const JAVA_MAP_TYPE = 'java.util.Map<String, Object>';

// this.<name>(...) -> proven box. `cast` is a per-call predicate: true when the resolved
// Java declaration is still `Object`, so the narrowed declaration / reassignment needs the
// checkcast.
const JAVA_COLLECTION_CALL_TYPES = {
    'extend': { type: JAVA_MAP_TYPE, cast: (call) => call.arguments.length !== 2 || call.arguments.some ((a) => ts.isSpreadElement (a)) },
    'deepExtend': { type: JAVA_MAP_TYPE, cast: () => false },
    'keysort': { type: JAVA_MAP_TYPE, cast: () => false },
    'indexBy': { type: JAVA_MAP_TYPE, cast: () => false },
    'indexBySafe': { type: JAVA_MAP_TYPE, cast: () => false },
    'groupBy': { type: JAVA_MAP_TYPE, cast: () => false },
    'sortBy': { type: JAVA_ARRAY_TYPE, cast: () => false },
    'sortBy2': { type: JAVA_ARRAY_TYPE, cast: () => false },
    'filterBy': { type: JAVA_ARRAY_TYPE, cast: () => false },
    'toArray': { type: JAVA_ARRAY_TYPE, cast: () => false },
    'aggregate': { type: JAVA_ARRAY_TYPE, cast: () => false },
    'arrayConcat': { type: JAVA_ARRAY_TYPE, cast: () => true },
};

// the helper DEFINITIONS the resolved signature must live in, so a same-named method
// defined by a venue (its own file) or an alias binding never classifies
const COLLECTION_SOURCE_FILE = /[\\/]base[\\/]functions[\\/](generic|misc)\.ts$/;

const COLLECTION_DEBUG = process.env.CCXT_JAVA_COLLECTION_LOCAL_DEBUG === '1';

// receiver methods whose printed Java takes Object and is valid on either narrowed type:
//   indexOf -> Helpers.getIndexOf(x, arg)   slice -> Helpers.slice(...)
//   split   -> Helpers.split(x, arg)        concat -> Helpers.concat(...)
//   toString-> String.valueOf(x)            toFixed -> toFixed(x, arg)
const COLLECTION_SAFE_ANY_RECEIVER = new Set ([
    'indexOf', 'slice', 'split', 'concat', 'toString', 'toFixed',
]);

// receiver methods printed as `((java.util.List<Object>) x).…` / `x.contains(…)` /
// `Collections.reverse((java.util.List<Object>) x)` — valid on a List<Object> receiver,
// broken on a Map. `.join` is NOT here (prints a List<String> cast — a javac ERROR on
// List<Object>).
const COLLECTION_SAFE_LIST_RECEIVER = new Set ([
    'push', 'pop', 'shift', 'reverse', 'includes',
]);

function collectionReceiverIsSafe (method, javaType) {
    if (COLLECTION_SAFE_ANY_RECEIVER.has (method)) {
        return true;
    }
    return javaType === JAVA_ARRAY_TYPE && COLLECTION_SAFE_LIST_RECEIVER.has (method);
}

// the proven Java type of a whole family call, or undefined. The resolved signature must
// be a declaration that LIVES IN the audited helper file and carries the same name (a
// venue override, an alias like `indexBySafe = indexBy`, or an unrelated same-named
// helper never classifies).
function collectionCallInfo (printer, node) {
    const call = unwrapParens (node);
    if (call === undefined || !ts.isCallExpression (call) || !isThisOrSuperCall (call)) {
        return undefined;
    }
    const method = String (call.expression.name.escapedText);
    const entry = JAVA_COLLECTION_CALL_TYPES[method];
    if (entry === undefined) {
        return undefined;
    }
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (call)?.declaration;
    } catch (e) {
        return undefined; // no transpilation context (in-memory transpiles)
    }
    if (declaration === undefined) {
        if (COLLECTION_DEBUG) {
            console.error (`[collection] ${method}: no resolved declaration`);
        }
        return undefined;
    }
    const file = declaration.getSourceFile ().fileName;
    if (!COLLECTION_SOURCE_FILE.test (file)) {
        if (COLLECTION_DEBUG) {
            console.error (`[collection] ${method}: resolves outside generic/misc.ts (${file})`);
        }
        return undefined;
    }
    // the resolved declaration is the generic.ts/misc.ts function (`const extend = (...) =>`,
    // a FunctionExpression on its binding, ...) — its name sits on itself or its parent
    const name = declaration.name?.escapedText ?? declaration.parent?.name?.escapedText;
    if (name === undefined || String (name) !== method) {
        if (COLLECTION_DEBUG) {
            console.error (`[collection] ${method}: resolved name mismatch (${String (name)})`);
        }
        return undefined;
    }
    return { type: entry.type, cast: entry.cast (call) };
}

// literal writes to an already-narrowed local: the printer emits
// `new java.util.HashMap<String, Object>() {{ ... }}` / `new java.util.ArrayList<Object>(...)`,
// both assignable to the narrowed interface with no cast
function collectionLiteralInfo (node) {
    switch (node?.kind) {
        case ts.SyntaxKind.ObjectLiteralExpression:
            return { type: JAVA_MAP_TYPE };
        case ts.SyntaxKind.ArrayLiteralExpression:
            return { type: JAVA_ARRAY_TYPE };
        default:
            return undefined;
    }
}

// does the printed Java of a `= ` assignment right-hand side hand back the same box?
function collectionWriteIsSameBox (printer, node, javaType) {
    const written = unwrapParens (node);
    if (written === undefined) {
        return false;
    }
    if (written.kind === ts.SyntaxKind.NullKeyword
        || (ts.isIdentifier (written) && written.escapedText === 'undefined')) {
        return true; // prints null — assignable to either type
    }
    const info = collectionCallInfo (printer, written) ?? collectionLiteralInfo (written);
    return info !== undefined && info.type === javaType;
}

// reject the narrowing when any use needs the local to stay `Object` (or a receiver cast
// the narrowed type cannot satisfy).
function collectionIsSafeToNarrow (printer, declaration, sourceName, javaType, isProFile) {
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const n of uses) {
        if (n === declaration.name) {
            continue;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isVariableDeclaration (parent) && parent.name === n) {
            continue; // a sibling block-scoped declaration gets its own type
        }
        if (ts.isPropertyAccessExpression (parent)) {
            if (parent.name === n) {
                continue; // `obj.<name>` is a member read of another object
            }
            if (parent.expression === n && parent.parent !== undefined
                && ts.isCallExpression (parent.parent) && parent.parent.expression === parent) {
                const method = String (parent.name.escapedText);
                if (!collectionReceiverIsSafe (method, javaType)) {
                    return false;
                }
            }
            // other reads (`x.foo`, `x[k]`) print Object-taking helpers, `.length`
            // prints Helpers.getArrayLength(x)
            continue;
        }
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            const op = parent.operator;
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                return false;
            }
            continue; // `!x` prints a Helpers.isTrue test — Object-taking
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // `typeof x === '...'` prints `x instanceof ...` — inconvertible
        }
        if (ts.isAsExpression (parent) || parent.kind === ts.SyntaxKind.TypeAssertionExpression) {
            return false; // `as any` -> ((Object)x); `as T[]` -> a List<String> cast
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            return false; // `[x, y] = f()` prints `x = ((List) tmp).get(i)`
        }
        if (ts.isDeleteExpression (parent)) {
            return false; // `delete x` / `delete x[k]` (see the receiver cast below)
        }
        if (ts.isElementAccessExpression (parent)) {
            if (parent.expression === n) {
                const grand = parent.parent;
                if (grand?.kind === ts.SyntaxKind.DeleteExpression) {
                    return false; // prints `((java.util.Map<...>) x).remove(...)` (interface cast)
                }
                if (ts.isBinaryExpression (grand) && grand.left === parent
                    && grand.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
                    return false; // compound element write
                }
                continue; // read, or `x[k] = v` -> Helpers.addElementToObject(x, k, v)
            }
            continue; // the key of `x[k]` — Object-taking
        }
        if (ts.isBinaryExpression (parent)) {
            const op = parent.operatorToken.kind;
            if (parent.left === n) {
                if (op === ts.SyntaxKind.EqualsToken) {
                    if (!collectionWriteIsSameBox (printer, parent.right, javaType)) {
                        return false;
                    }
                } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                    return false; // `x += y` prints `x = Helpers.add(x, y)` — an Object write
                }
                // `in` / comparisons / `+` operands: Helpers.{inOp,isEqual,add}(...) take
                // Object and there is no Map/List overload to re-bind
                continue;
            }
            continue; // right operand (`y = x`, `a + x`, `x in y`, `x != null`, ...)
        }
        if (ts.isForOfStatement (parent)) {
            return false;
        }
        if (ts.isAwaitExpression (parent)) {
            return false; // prints `(x).join()` — no join() on either type
        }
        // explicitly fine parents: call/new arguments, returns, property assignments
        // (object literal values), template spans, ternary arms, wrapped reads
        continue;
    }
    // in pro files a local feeding an inherited `this.<async>()` call as an argument can
    // re-bind to the typed wrapper overload — keep Object (same guard as the families above)
    if (isProFile) {
        for (const n of uses) {
            if (n === declaration.name) {
                continue;
            }
            const parent = n.parent;
            if (parent !== undefined && ts.isVariableDeclaration (parent) && parent.name === n) {
                continue;
            }
            if (feedsInheritedAsyncCall (printer, n, scope)) {
                return false;
            }
        }
    }
    return true;
}

function collectionLocalDeclaration (printer, declaration) {
    if (!ts.isIdentifier (declaration.name)) {
        return undefined;
    }
    const info = collectionCallInfo (printer, declaration.initializer);
    if (info === undefined) {
        return undefined;
    }
    // scan by the SOURCE name: ReservedKeywordsReplacements renames the printed one
    const sourceName = declaration.name.escapedText;
    const fileName = declaration.getSourceFile ().fileName;
    const isProFile = /[\\/]pro[\\/]/.test (fileName);
    if (!collectionIsSafeToNarrow (printer, declaration, sourceName, info.type, isProFile)) {
        if (COLLECTION_DEBUG) {
            console.error (`[collection] declined ${fileName}:${declaration.name.escapedText}`);
        }
        return undefined;
    }
    if (COLLECTION_DEBUG) {
        console.error (`[collection] ${fileName}: ${declaration.name.escapedText} -> ${info.type}${info.cast ? ' (cast)' : ''}`);
    }
    return info;
}

// the collection slice's own printVariableDeclarationList / printBinaryExpression
// wrappers. Chained after the ones above; its marker lookup no-ops on a line one of the
// earlier patches already retyped (the Object token is gone by then).
export function patchJavaCollectionLocalTypes (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._javaCollectionLocalTypesPatched) {
        return;
    }
    // declaration node -> narrowed Java type, filled as declarations are printed. Java
    // statements print in source order, so by the time a reassignment is printed its
    // declaration has already been classified.
    const narrowed = new WeakMap ();
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = original (node, identation);
        if (node.declarations?.length !== 1) {
            return printed; // multi-declarator lists are left as the printer emitted them
        }
        const declaration = node.declarations[0];
        if (declaration.initializer === undefined) {
            return printed;
        }
        const info = collectionLocalDeclaration (printer, declaration);
        if (info === undefined) {
            return printed;
        }
        const iden = printer.getIden (identation);
        const printedName = printer.printNode (declaration.name, 0);
        const marker = `${iden}${printer.VAR_TOKEN} ${printedName} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed;
        }
        // the printed initializer must still be the shape this module proved: a whole
        // `this./super.` family call (a surprising shape is declined)
        const head = printed.slice (at + marker.length);
        if (!head.startsWith ('this.') && !head.startsWith ('super.')) {
            return printed;
        }
        // a call family casts only where its Java declaration is still `Object`
        // (arrayConcat, the varargs extend overload)
        const castPrefix = info.cast ? `(${info.type}) ` : '';
        narrowed.set (declaration, info.type);
        return printed.slice (0, at) + `${iden}${info.type} ${printedName} = ${castPrefix}` + head;
    };
    // `x = this.arrayConcat(...)` / `x = this.extend(a, b, c)` on an already-narrowed
    // local: the Java declaration is still `Object`, so the reassignment needs the same
    // checkcast the declaration got. Writes whose value already carries the type
    // (`this.extend(a, b)` -> Map, `this.sortBy(...)` -> List) print untouched.
    const originalBinary = printer.printBinaryExpression.bind (printer);
    printer.printBinaryExpression = function (node, identation) {
        const printed = originalBinary (node, identation);
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier (node.left)) {
            return printed;
        }
        const info = collectionCallInfo (printer, node.right);
        if (info === undefined || !info.cast) {
            return printed;
        }
        const symbol = printer.getChecker ().getSymbolAtLocation (node.left);
        const declaration = symbol?.valueDeclaration;
        const javaType = (declaration !== undefined) ? narrowed.get (declaration) : undefined;
        if (javaType === undefined || javaType !== info.type) {
            return printed;
        }
        const marker = `${printer.printNode (node.left, 0)} = `;
        const at = printed.indexOf (marker);
        if (at === -1) {
            return printed;
        }
        return printed.slice (0, at + marker.length) + `(${javaType}) ` + printed.slice (at + marker.length);
    };
    printer._javaCollectionLocalTypesPatched = true;
}

// ===== install =====

export function installJavaLocalTypes (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printFunctionType !== 'function' || printer._javaLocalTypesPatched) {
        return;
    }
    // (1) string/list method signatures. Wrapped on the printer instance so every
    // declaration — base tier and every venue override — goes through the same table.
    const upstreamFunctionType = printer.printFunctionType.bind (printer);
    printer.printFunctionType = function (node) {
        const own = upstreamFunctionType (node);
        const mapped = javaMethodReturnType (printer, node, own);
        return mapped === undefined ? own : mapped;
    };
    // (2) the return sites the signature retype cannot type on its own (see the header)
    const upstreamReturn = printer.printReturnStatement.bind (printer);
    printer.printReturnStatement = function (node, identation) {
        const printed = upstreamReturn (node, identation);
        const method = enclosingMethod (node);
        if (method?.name === undefined) {
            return printed;
        }
        const methodName = method.name.escapedText;
        if (!JAVA_STRING_RETURN_METHODS_CASE_CAST.has (methodName) && !JAVA_LIST_RETURN_METHODS.has (methodName)) {
            return printed;
        }
        const cast = returnCastFor (printer, node, methodName);
        if (cast === undefined) {
            return printed;
        }
        const at = printed.lastIndexOf ('return ');
        if (at === -1) {
            return printed;
        }
        return printed.slice (0, at + 'return '.length) + cast + ' ' + printed.slice (at + 'return '.length);
    };
    // declaration node -> narrowed Java type, filled as declarations are printed.
    // Java statements print in source order, so by the time a reassignment is printed
    // its declaration has already been classified.
    const narrowed = new WeakMap ();
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = original (node, identation);
        if (node.declarations?.length !== 1) {
            return printed; // multi-declarator lists are left as the printer emitted them
        }
        const declaration = node.declarations[0];
        if (declaration.initializer === undefined) {
            return printed;
        }
        const info = javaLocalTypeOf (printer, declaration, narrowed);
        if (info === undefined) {
            return printed;
        }
        const iden = printer.getIden (identation);
        const marker = `${iden}${printer.VAR_TOKEN} ${printer.printNode (declaration.name)} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed;
        }
        const value = printed.slice (at + marker.length);
        if (info.anyValueShape !== true) {
            const prefixes = info.valuePrefixes !== undefined ? info.valuePrefixes
                : [ info.valuePrefix === undefined ? 'this.' : info.valuePrefix ];
            if (!prefixes.some ((prefix) => value.startsWith (prefix))) {
                return printed; // unexpected shape — leave it as the printer emitted it
            }
        }
        narrowed.set (declaration, info.type);
        // a ternary value must be wrapped before the cast: `(String) c ? a : b` binds the
        // cast to the condition, not to the conditional expression (javac then rejects it)
        const needsParens = info.cast !== undefined && /^\(.*\)\s*\?/.test (value);
        const castValue = needsParens ? '(' + value + ')' : value;
        const cast = info.cast === undefined ? '' : info.cast + ' ';
        return printed.slice (0, at) + `${iden}${info.type} ${printer.printNode (declaration.name)} = ${cast}${castValue}`;
    };
    // `x = this.safeSymbol(...)` etc. on a narrowed local: an Object-declared accessor
    // needs the same cast the declaration got; a call to a retyped signature needs none.
    // JAVA-RE-6: the same for the cast-family helpers, whose bare form (`x = eddsa(...)`)
    // prints without a `this.` prefix.
    const originalBinary = printer.printBinaryExpression.bind (printer);
    printer.printBinaryExpression = function (node, identation) {
        const printed = originalBinary (node, identation);
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier (node.left)) {
            return printed;
        }
        const right = unwrapParens (node.right);
        if (right === undefined) {
            return printed;
        }
        const symbol = printer.getChecker ().getSymbolAtLocation (node.left);
        const declaration = symbol?.valueDeclaration;
        const javaType = (declaration !== undefined) ? narrowed.get (declaration) : undefined;
        if (javaType === undefined) {
            return printed;
        }
        // ws map reads (`x = this.trades[k]` / `x = this.safeValue(this.trades, k)`)
        // take the same checkcast the declaration got
        if (isWsType (javaType)) {
            if (wsMapReadType (right) !== javaType) {
                return printed;
            }
            const marker = `${printer.printNode (node.left, 0)} = `;
            const at = printed.indexOf (marker);
            if (at === -1) {
                return printed;
            }
            const head = at + marker.length;
            const rest = printed.slice (head);
            if (rest.startsWith ('(')) {
                return printed; // already cast (never expected for a ws read)
            }
            return printed.slice (0, head) + '(' + javaType + ') ' + printed.slice (head);
        }
        if (!isThisCall (right)) {
            return printed;
        }
        if (!isProvablyOfType (printer, right, javaType, undefined)) {
            return printed;
        }
        const call = right.expression.name.escapedText;
        // calls whose Java DECLARED return is Object need the same checkcast the
        // declaration got; calls to retyped signatures (and the hand-written
        // parse8601/iso8601) need none
        const accessor = LOCAL_THIS_RETURN_TYPES[call];
        const needsCast = (accessor !== undefined && accessor.cast !== undefined && accessor.type === javaType)
            || (javaType === JAVA_STRUCTURE_TYPE && STRUCTURE_THIS_RETURN_TYPES[call] !== undefined)
            || (javaType === 'Long' && (call === 'safeInteger' || call === 'safeInteger2' || call === 'safeIntegerN'))
            || (javaType === 'String' && (JAVA_STRING_RETURN_METHODS_CASE_CAST.has (call)
                || call === 'safeStringUpper' || call === 'safeStringLower'
                || call === 'safeStringUpper2' || call === 'safeStringLower2'
                || call === 'safeStringUpperN' || call === 'safeStringLowerN'));
        const cast = !needsCast ? ''
            : (javaType === 'String' ? '(String)'
                : javaType === JAVA_STRUCTURE_TYPE ? '(' + JAVA_STRUCTURE_TYPE + ')' : '(Long)');
        if (cast === '') {
            return printed;
        }
        const leftText = printer.printNode (node.left, 0);
        const callee = right.expression;
        const bare = ts.isIdentifier (callee);
        const callName = String (bare ? callee.escapedText : callee.name.escapedText);
        const marker = `${leftText} = ${bare ? '' : 'this.'}${callName}(`;
        const at = printed.indexOf (marker);
        if (at === -1) {
            return printed;
        }
        const head = at + leftText.length + ' = '.length;
        return printed.slice (0, head) + cast + ' ' + printed.slice (head);
    };
    // (3) the tuple-returning handle* destructuring family (section 4): additive wrappers
    // on printVariableDeclarationList + printCustomBinaryExpressionIfAny
    patchJavaHandlerLocalTypes (printer);

    // (5) collection/dict helper locals (JAVA-RE-5, additive slice): a second,
    // independent patch of the same printer hooks — it keeps its own candidate table
    // and its own WeakMap of narrowed declarations, and declines every declaration the
    // hooks above already retyped (their marker lookup no-ops once the Object token is
    // gone). Installed here so both the main-thread Transpiler and the piscina worker
    // (which both call installJavaLocalTypes) get it.
    patchJavaCollectionLocalTypes (transpiler);
    printer._javaLocalTypesPatched = true;
    patchJavaDataflowTypes (transpiler);
}

// ===== 4. dataflow engine: accumulators, local propagation, ternary arms, scope safety =====
//
// (a) accumulator locals: the initializer's proven type is joined with EVERY later plain
//     `x = ...` write in the enclosing function, widening only along box-identical edges
//     (JAVA_WIDENING_EDGES — empty today: String and java.util.List<Object> have no
//     narrower/wider twin that is not `Object` itself). A null write (or a null
//     initializer) is neutral: Java has no nullable spelling, every type this engine
//     emits is a REFERENCE type, and `String x = null;` holds the same null as
//     `Object x = null;`. An unprovable or non-joinable write keeps the printer's Object.
// (b) local-to-local propagation: a read of another local resolves to that local's type
//     ONLY when the referenced declaration's full decision is recomputed here (a local
//     the output keeps `Object` proves nothing), under a cycle stack and a depth cap.
//     Java has no implicit Object -> T downcast, so `String b = a;` compiles only when
//     `a` is itself emitted with the same concrete type.
// (c) ternary arms: `cond ? a : b` takes the arm type when both arms are proven and equal,
//     or one is null (javac types `cond ? stringLocal : null` as String, and the boxed
//     runtime value is the same String or null either way). An arm that is a read of a
//     proven local resolves through (b). Two distinct proven types never unify — javac
//     would need a common supertype and the declaration would silently widen to Object.
// (d) scope safety: the name must have exactly ONE binding in the enclosing function, no
//     parameter/catch/destructuring binding of the same name, a unique printed name, and
//     no read before the declaration. Names are canonicalised through
//     printer.finalVarMutations because the printer renames identifiers inside object
//     literals in place (`x` -> `finalX`) while a body is printed.
//
// Java rules the engine encodes (each one is a real javac failure otherwise):
//   - NO implicit Object -> T downcast, and this engine injects NO casts: every accepted
//     value must already carry the declared static type in the printed Java.
//   - Integer / Long / int / Double are never joined or emitted (the numeric families
//     need their own audited slice; the printer prints bare literals as int boxes).
//   - a String local as the LEFT operand of `+` / `+=` moves the call from
//     Helpers.add(Object, Object) to add(String, ...), and those disagree whenever the
//     left is null and the right is null or a non-String: rejected unless the right
//     operand is provably a NON-NULL String (a string literal, or a nested provable `+`).
//   - receivers: `x.push(...)` / `x.join(...)` / `x.shift()` print hard
//     `((java.util.List<...>)x)` casts, the String methods print `((String)x)`; the
//     per-type whitelist of the surviving scan (receiverCallIsSafe) is reused.
//   - `typeof x === '...'` prints `x instanceof <box>` (inconvertible for the wrong
//     family) and `delete x[k]` prints a Map receiver cast: both rejected.
//   - WS (pro) files run build/javaTranspiler.ts#postProcessWsJava, whose "String type
//     fixes" pass rewrites `String x = this.<m>(...)` / `Helpers.<...>(...)` back to
//     `Object`: such a declaration — and every read resolving through it — is declined.
//     The prediction branch passes prediction=true and skips that revert (SS-08), so
//     prediction files are NOT declined here.
//   - pro files: a local that feeds an inherited async call stays Object (the typed REST
//     wrapper overloads would win Java overload resolution once an argument is a String).
//
// What stays Object on purpose: every numeric family, every parameter copy (`const x =
// symbol;` resolves to a parameter, never to a local), element-access reads, awaits,
// object/array literals as values, and every self-referential accumulator write
// (`x = x + r` — the read of x inside the value has no type until this declaration
// decides one, and the read would be circular here).

const JAVA_DATAFLOW_STRING = 'String';
const MAX_DATAFLOW_DEPTH = 8;
const DATAFLOW_DEBUG = process.env['CCXT_JAVA_DATAFLOW_DEBUG'] === '1';

function dataflowDebug (message) {
    if (DATAFLOW_DEBUG) {
        console.error ('[java-dataflow] ' + message);
    }
}

// box-identical widening edges a join may take. EMPTY on purpose (see the header).
const JAVA_WIDENING_EDGES = [];

// identifiers that would break the emitted `<type> <name> = ` prefix if another binding
// in the same method carried them (a bind of `String` / `List` / `java` shadows the very
// tokens the declaration prints)
const JAVA_TYPE_TOKENS = [
    'String', 'Object', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Number',
    'Map', 'List', 'Character', 'Byte', 'Short', 'Void', 'java', 'util',
];

// Precise.string* statics are declared `public static String` in base/Precise.java and
// cannot be overridden (static, different class)
const PRECISE_STRING_STATICS = new Set ([
    'stringAdd', 'stringSub', 'stringMul', 'stringDiv', 'stringMod', 'stringAbs',
    'stringNeg', 'stringMax', 'stringMin', 'stringOr',
]);

// hand-written BaseExchange.java methods declared with a String return (`public String
// numberToString (Object)`, `public String iso8601 (Object)`) — no generated venue
// declares an override (census)
const DATAFLOW_STRING_BASE_METHODS = new Set ([ 'iso8601', 'numberToString' ]);

// the source files build/javaTranspiler.ts#createJavaClass still runs postProcessWsJava's
// "String type fixes" revert over — the ws (pro) branch only. The prediction branch skips
// the revert (SS-08: postProcessWsJava(…, prediction=true)), so a prediction declaration
// the engine proves String is the FINAL spelling and must never be declined.
const DATAFLOW_WS_SOURCE_FILE = /[\\/]pro[\\/]/;

// declarations whose full decision is being computed right now (`let a = a;`)
const dataflowClassifyInProgress = new Set ();

// the pre-mutation name of an identifier. finalVarMutations records (node, previous
// escapedText) for every in-place rewrite made while a body prints, so the FIRST record
// for a node is its original source name. Falls back to the live escapedText.
function dataflowCanonicalName (printer, node) {
    const mutations = printer?.finalVarMutations;
    if (Array.isArray (mutations)) {
        for (const mutation of mutations) {
            if (mutation.node === node) {
                return mutation.escapedText;
            }
        }
    }
    return node.escapedText;
}

// one walk per query: every Identifier grouped by its CANONICAL name, plus the binding
// tables the dataflow resolution reads. Deliberately NOT cached — the printer mutates
// identifier names in place while a body prints, so a cached index goes stale between
// two declarations of the same method.
function dataflowIndex (printer, scope) {
    const identifiers = new Map ();
    const declarations = new Map ();
    const parameterNames = new Set ();
    const blockedNames = new Set ();
    const bindingNames = new Set ();
    const bindingCounts = new Map ();
    const markBound = (name) => {
        const walk = (n) => {
            if (n?.kind === ts.SyntaxKind.Identifier) {
                blockedNames.add (dataflowCanonicalName (printer, n));
            }
            ts.forEachChild (n, walk);
        };
        walk (name);
    };
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.Identifier) {
            const name = dataflowCanonicalName (printer, n);
            let list = identifiers.get (name);
            if (list === undefined) {
                list = [];
                identifiers.set (name, list);
            }
            list.push (n);
        }
        if ((n.kind === ts.SyntaxKind.Parameter || n.kind === ts.SyntaxKind.VariableDeclaration)
            && n.name?.kind === ts.SyntaxKind.Identifier) {
            const printed = String (n.name.escapedText);
            bindingNames.add (printed);
            bindingCounts.set (printed, (bindingCounts.get (printed) ?? 0) + 1);
        }
        if (n.kind === ts.SyntaxKind.Parameter) {
            if (n.name?.kind === ts.SyntaxKind.Identifier) {
                parameterNames.add (dataflowCanonicalName (printer, n.name));
            }
            markBound (n.name);
        } else if (n.kind === ts.SyntaxKind.VariableDeclaration) {
            if (n.name?.kind === ts.SyntaxKind.Identifier) {
                const key = dataflowCanonicalName (printer, n.name);
                let list = declarations.get (key);
                if (list === undefined) {
                    list = [];
                    declarations.set (key, list);
                }
                list.push (n);
            } else {
                markBound (n.name); // a destructured binding never gets a concrete type
            }
        } else if (n.kind === ts.SyntaxKind.CatchClause && n.variableDeclaration !== undefined) {
            if (n.variableDeclaration.name?.kind === ts.SyntaxKind.Identifier) {
                parameterNames.add (dataflowCanonicalName (printer, n.variableDeclaration.name));
            }
            markBound (n.variableDeclaration.name);
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return { identifiers, declarations, parameterNames, blockedNames, bindingNames, bindingCounts };
}

// is `identifier` a declaration/member name rather than a read or write of the local?
function dataflowNotAUse (identifier) {
    const parent = identifier.parent;
    if (parent === undefined) {
        return true;
    }
    switch (parent.kind) {
        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.Parameter:
        case ts.SyntaxKind.BindingElement:
        case ts.SyntaxKind.PropertyAssignment:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.PropertyAccessExpression:
        case ts.SyntaxKind.ImportSpecifier:
            return parent.name === identifier;
    }
    return false;
}

// would a binding named after one of the type's tokens break the emitted declaration?
function dataflowTypeTokenCollides (index, javaType) {
    const tokens = javaType.match (/[A-Za-z_]\w*/g) ?? [];
    return tokens.some ((token) => JAVA_TYPE_TOKENS.includes (token) && index.bindingNames.has (token));
}

// a `this.<name>(...)` call whose Java return type is already the named type on every
// path, so a local fed by it needs NO cast: the retyped signature families of section 1
// (proved by resolvesToMethodNamed, i.e. a real method declaration of that name) and the
// hand-written String-returning base methods.
function dataflowThisCallType (printer, node) {
    const name = node.expression.name.escapedText;
    if (JAVA_STRING_RETURN_METHODS.has (name) || JAVA_STRING_RETURN_METHODS_CASE_CAST.has (name)) {
        return resolvesToMethodNamed (printer, node, name) ? JAVA_DATAFLOW_STRING : undefined;
    }
    if (JAVA_LIST_RETURN_METHODS.has (name)) {
        return resolvesToMethodNamed (printer, node, name) ? JAVA_ARRAY_TYPE : undefined;
    }
    if (DATAFLOW_STRING_BASE_METHODS.has (name)) {
        return resolvesToBaseAccessor (printer, node, name) ? JAVA_DATAFLOW_STRING : undefined;
    }
    return undefined;
}

// the Java type of a value expression, or undefined when it cannot be proven. 'null' is
// returned for a literal null/undefined (neutral: every emitted type is a reference
// type). `context` carries { scope, index, stack, depth } and enables the recursive
// resolution of reads of other proven locals.
function dataflowValueType (printer, node, context) {
    if (node === undefined) {
        return undefined;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return JAVA_DATAFLOW_STRING;
        case ts.SyntaxKind.NullKeyword:
            return 'null';
        case ts.SyntaxKind.Identifier:
            if (node.escapedText === 'undefined') {
                return 'null';
            }
            return dataflowResolveRead (printer, context, node);
        case ts.SyntaxKind.ParenthesizedExpression:
            return dataflowValueType (printer, node.expression, context);
        case ts.SyntaxKind.ConditionalExpression:
            return dataflowUnifyArms (
                dataflowValueType (printer, node.whenTrue, context),
                dataflowValueType (printer, node.whenFalse, context));
        case ts.SyntaxKind.BinaryExpression:
            // `a + b` prints `Helpers.add(a, b)`; a provably-String LEFT resolves the call
            // to add(String, ...), declared String and never null
            if (node.operatorToken.kind === ts.SyntaxKind.PlusToken && isProvablyStringOperand (unwrapParens (node.left))) {
                return JAVA_DATAFLOW_STRING;
            }
            return undefined;
        case ts.SyntaxKind.ArrayLiteralExpression:
            // prints `new java.util.ArrayList<Object>(java.util.Arrays.asList(...))`
            return JAVA_ARRAY_TYPE;
        case ts.SyntaxKind.CallExpression: {
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee)) {
                return undefined;
            }
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return dataflowThisCallType (printer, node);
            }
            if (ts.isIdentifier (callee.expression) && callee.expression.escapedText === 'Precise') {
                return PRECISE_STRING_STATICS.has (callee.name.escapedText) ? JAVA_DATAFLOW_STRING : undefined;
            }
            return undefined;
        }
    }
    return undefined;
}

// the join of two proven types along the box-identical edges, or undefined when they
// cannot live in one declaration without changing a box. 'null' is neutral at this layer.
function joinDataflowTypes (a, b) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return a;
    }
    for (const [ from, to ] of JAVA_WIDENING_EDGES) {
        if ((a === from && b === to) || (a === to && b === from)) {
            return to;
        }
    }
    return undefined;
}

// the type of `c ? a : b` from its arms: identical proven types, or T + null for a
// reference T. Two distinct proven types never unify (see the header).
function dataflowUnifyArms (a, b) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return (a === 'null') ? undefined : a;
    }
    if (a === 'null') {
        return b;
    }
    if (b === 'null') {
        return a;
    }
    return undefined;
}

// ---- the decision for one declaration -------------------------------------

// the surviving tables' decision (a whole call to a retyped signature / an accessor
// family), re-derived exactly as their wrapper rewrites the printed text: it only rewrites
// when the printed value starts with `this.`, so a parenthesised initializer (which prints
// `(this.x(...))`) is left Object and proves nothing to a read.
function dataflowSurvivingType (printer, declaration) {
    const info = javaLocalTypeOf (printer, declaration);
    if (info === undefined) {
        return undefined;
    }
    // the surviving wrapper rewrites only when the printed value starts with `this.`;
    // a parenthesised initializer prints `(this.x(...))` and stays Object
    if (declaration.initializer.kind === ts.SyntaxKind.ParenthesizedExpression) {
        return undefined;
    }
    return info.type;
}

// the Java type the FINAL output declares for this local, or undefined when it stays
// Object. Used both for the declaration itself and for reads resolving through it.
function dataflowEmittedType (printer, declaration, context) {
    if (declaration === undefined || declaration.initializer === undefined) {
        return undefined;
    }
    if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    if (declaration.parent?.declarations?.length !== 1) {
        return undefined; // a multi-declarator list the printer never rewrites
    }
    if (declaration.initializer.kind === ts.SyntaxKind.NewExpression) {
        return undefined; // the printer emits `var x = ...` for a NewExpression initializer
    }
    const type = dataflowEmittedTypeUnchecked (printer, declaration, context);
    return dataflowWsReverts (printer, declaration, type) ? undefined : type;
}

// the surviving tables' decision when it exists, else the dataflow engine's
function dataflowEmittedTypeUnchecked (printer, declaration, context) {
    const surviving = dataflowSurvivingType (printer, declaration);
    if (surviving !== undefined) {
        return surviving;
    }
    if (dataflowClassifyInProgress.has (declaration)) {
        return undefined; // a read chain that comes back to the declaration being classified
    }
    dataflowClassifyInProgress.add (declaration);
    try {
        const info = dataflowLocalTypeOf (printer, declaration, context);
        return info === undefined ? undefined : info.type;
    } finally {
        dataflowClassifyInProgress.delete (declaration);
    }
}

// would postProcessWsJava's "String type fixes" pass rewrite this declaration back to
// `Object`? The pass runs for WS (pro) files only (the prediction branch skips it, SS-08).
// It matches `String <name> = (this.<m>(|Helpers.)...;` — only a String family
// value is at risk, and only when its printed form starts with this./Helpers. (a
// parenthesised initializer prints `(` first and never matches). The exact same test is
// applied to the printed value by the declaration wrapper.
function dataflowWsReverts (printer, declaration, javaType) {
    if (javaType !== JAVA_DATAFLOW_STRING) {
        return false;
    }
    if (!DATAFLOW_WS_SOURCE_FILE.test (declaration.getSourceFile ().fileName)) {
        return false;
    }
    const initializer = declaration.initializer;
    if (initializer === undefined || initializer.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = initializer.expression;
    if (ts.isPropertyAccessExpression (callee)) {
        // hmm: `Helpers.foo(...)` has an Identifier callee; `this.<m>(...)` a property one
        return callee.expression.kind === ts.SyntaxKind.ThisKeyword;
    }
    return ts.isIdentifier (callee) && callee.escapedText === 'Helpers';
}

// a read of `identifier` resolves only when it provably refers to a single local
// declared EARLIER in the same function whose own decision this engine proves.
function dataflowResolveRead (printer, context, identifier) {
    if (context === undefined || context.scope === undefined || context.index === undefined) {
        return undefined;
    }
    const name = dataflowCanonicalName (printer, identifier);
    const declarations = context.index.declarations.get (name);
    if (declarations === undefined || declarations.length !== 1) {
        return undefined; // not a local, or a second binding of the same name shadows it
    }
    if (context.index.parameterNames.has (name) || context.index.blockedNames.has (name)) {
        return undefined; // a parameter / destructured / catch binding could be the read
    }
    const declaration = declarations[0];
    if (context.stack.has (declaration) || context.depth >= MAX_DATAFLOW_DEPTH) {
        return undefined; // a cycle (`let a = b; let b = a;`) or a pathological chain
    }
    try {
        if (declaration.getStart () >= identifier.getStart ()) {
            return undefined; // the read is at or before the declaration (TDZ / hoisted closure)
        }
    } catch (e) {
        return undefined;
    }
    const scope = enclosingFunction (declaration);
    const nested = { scope, index: dataflowIndex (printer, scope), stack: context.stack, depth: context.depth + 1 };
    context.stack.add (declaration);
    try {
        return dataflowEmittedType (printer, declaration, nested);
    } finally {
        context.stack.delete (declaration);
    }
}

// the declared type from the initializer (`initial` — a proven type, or 'null' for a
// literal null/undefined) joined with every later plain `x = ...` write in the function.
// An unprovable or non-joinable write returns undefined — the printer's Object is kept.
function dataflowTypeFromWrites (printer, context, declaration, varName, initial) {
    let type = (initial === 'null') ? undefined : initial;
    for (const n of (context.index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || dataflowNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (!(parent !== undefined && ts.isBinaryExpression (parent) && parent.left === n
            && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
            continue; // not a plain write — the safety scan handles the rest
        }
        const written = dataflowValueType (printer, unwrapParens (parent.right), context);
        dataflowDebug (`write ${varName} = ${written}`);
        if (written === undefined) {
            return undefined; // an unprovable write
        }
        if (written === 'null') {
            continue; // a null write is neutral for a reference declaration
        }
        type = (type === undefined) ? written : joinDataflowTypes (type, written);
        if (type === undefined) {
            return undefined; // a non-joinable write
        }
    }
    return type;
}

// is `value` the LEFT operand of a `+` / `+=`? (prints `Helpers.add(value, ...)`)
function isLeftPlusOperand (value) {
    const parent = value.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== value) {
        return false;
    }
    const op = parent.operatorToken.kind;
    return op === ts.SyntaxKind.PlusToken || op === ts.SyntaxKind.PlusEqualsToken;
}

// climb through `(x)` wrappers to the expression that consumes the value
function unwrapParensUp (node) {
    let current = node;
    while (current.parent?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.parent;
    }
    return current;
}

// a String local as the left operand of `+` needs a provably non-null String on the
// right; a List local used with `.join()` needs the List<String> receiver cast of
// printJoinCall, which is inconvertible from List<Object>. Both print the same for an
// Object-declared local (a legal downcast), so they are new hazards of any retype.
function dataflowReceiverCallIsSafe (method, javaType) {
    if (javaType === JAVA_ARRAY_TYPE && method === 'join') {
        return false;
    }
    return receiverCallIsSafe (method, javaType);
}

// the printer's by-name call rewrites cast some ARGUMENTS to a fixed type:
//   `x.startsWith(y)`    -> `((String)x).startsWith(((String)y))`
//   `x.endsWith(y)`      -> `((String)x).endsWith(((String)y))`
//   `x.replace(a, b)` / `x.replaceAll(a, b)` -> `Helpers.replace((String)a, (String)b)`
//   `x.join(sep)`        -> `String.join((String)sep, (java.util.List<String>)x)`
//   `x.padEnd(n, c)`     -> `Helpers.padEnd(..., ((Number)n).intValue(), ((String)c).charAt(0))`
// A `(String)` cast from a List<Object> / Long declaration is `inconvertible types`, and
// `(Number)` from String/List likewise. An Object-typed argument always compiles, so only
// a retype can break these. Per-method, per-argument-index required type:
const DATAFLOW_ARGUMENT_CAST_TYPES = {
    'startsWith': [ 'String' ],
    'endsWith': [ 'String' ],
    'replace': [ 'String', 'String' ],
    'replaceAll': [ 'String', 'String' ],
    'join': [ 'String' ],
    'padEnd': [ 'Number', 'String' ],
    'padStart': [ 'Number', 'String' ],
};

// the type the printer casts this argument to, or undefined when the argument prints as-is
function dataflowArgumentCastType (argument) {
    const call = argument.parent;
    if (call === undefined || !ts.isCallExpression (call)) {
        return undefined;
    }
    const index = call.arguments.indexOf (argument);
    if (index === -1) {
        return undefined;
    }
    const callee = call.expression;
    if (!ts.isPropertyAccessExpression (callee)) {
        return undefined;
    }
    const casts = DATAFLOW_ARGUMENT_CAST_TYPES[callee.name.escapedText];
    return casts === undefined ? undefined : casts[index];
}

// `x as string` prints `((String)x)`, `x as any[]` prints `(java.util.List<Object>)x` and
// `x as string[]` prints `(java.util.List<String>)x` — every one of them is inconvertible
// from the wrong declaration (see printAsExpression). `as any` prints `((Object)x)`.
function dataflowAsExpressionIsSafe (asNode, javaType) {
    const type = asNode.type;
    if (type === undefined) {
        return true;
    }
    if (type.kind === ts.SyntaxKind.AnyKeyword) {
        return true; // `((Object)x)`
    }
    if (type.kind === ts.SyntaxKind.StringKeyword) {
        return javaType === JAVA_DATAFLOW_STRING; // `((String)x)`
    }
    if (type.kind === ts.SyntaxKind.ArrayType) {
        const element = type.elementType;
        if (element?.kind === ts.SyntaxKind.AnyKeyword) {
            return javaType === JAVA_ARRAY_TYPE; // `(java.util.List<Object>)x`
        }
        if (element?.kind === ts.SyntaxKind.StringKeyword) {
            return false; // `(java.util.List<String>)x` — inconvertible from every family
        }
    }
    return true; // any other `as` prints the operand unchanged
}

// is `n` an argument of a `throw new X(<value>)`? that print wraps the argument in
// a hard `(String)` cast, which only compiles from an Object or String receiver
function isClassThrowArgument (n) {
    let current = n;
    while (current.parent !== undefined
        && (ts.isParenthesizedExpression (current.parent) || ts.isSpreadElement (current.parent))) {
        current = current.parent;
    }
    const parent = current.parent;
    if (parent === undefined || !ts.isNewExpression (parent)) {
        return false;
    }
    return parent.arguments !== undefined && parent.arguments.indexOf (current) !== -1
        && parent.parent !== undefined && ts.isThrowStatement (parent.parent);
}

// reject the retype when a use needs the local to stay Object
function dataflowIsSafeToRetype (printer, declaration, varName, javaType, context) {
    const scope = context.scope;
    const index = context.index;
    if (scope === undefined || index === undefined) {
        return false;
    }
    // (d) scope safety: exactly one binding of this name in the method, no
    // parameter/catch/destructuring binding of the same name, a unique printed name
    const declarations = index.declarations.get (varName);
    if (declarations === undefined || declarations.length !== 1 || declarations[0] !== declaration) {
        return false;
    }
    if (index.parameterNames.has (varName) || index.blockedNames.has (varName)) {
        return false;
    }
    if (dataflowTypeTokenCollides (index, javaType)) {
        return false;
    }
    const printedName = String (declaration.name.escapedText);
    if ((index.bindingCounts.get (printedName) ?? 0) !== 1) {
        return false;
    }
    const isString = javaType === JAVA_DATAFLOW_STRING;
    const isList = javaType === JAVA_ARRAY_TYPE;
    const isProFile = /[\\/]pro[\\/]/.test (declaration.getSourceFile ().fileName);
    for (const n of (index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || dataflowNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            const op = parent.operator;
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                return false; // `x++` / `x--` print a ref-style numeric helper
            }
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // `x instanceof <box>`: inconvertible for the wrong family
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            return false; // `[x, y] = f()` prints element reads into untyped slots
        }
        if (ts.isVariableDeclaration (parent) && parent.name?.kind === ts.SyntaxKind.ArrayBindingPattern
            && javaType !== JAVA_ARRAY_TYPE) {
            return false; // `const [a, b] = x` prints a hard List cast of the synthetic holder
        }
        if (ts.isDeleteExpression (parent)) {
            return false; // `delete x[k]` prints `((java.util.Map<String,Object>)x).remove(...)`
        }
        if (ts.isAsExpression (parent) && parent.expression === n && !dataflowAsExpressionIsSafe (parent, javaType)) {
            return false; // `x as string[]` prints `(java.util.List<String>)x`
        }
        {
            const argumentCast = dataflowArgumentCastType (unwrapParensUp (n));
            if (argumentCast !== undefined && argumentCast !== javaType) {
                return false; // the printer's by-name rewrite casts this argument
            }
        }
        if (ts.isPropertyAccessExpression (parent) && parent.expression === n && parent.parent !== undefined
            && ts.isCallExpression (parent.parent) && parent.parent.expression === parent) {
            // `x.<method>(...)` — the printer casts the receiver explicitly
            const method = String (parent.name.escapedText);
            if (!dataflowReceiverCallIsSafe (method, javaType)) {
                return false;
            }
        }
        if (ts.isElementAccessExpression (parent) && parent.parent !== undefined && ts.isDeleteExpression (parent.parent)) {
            // `delete x[k]` prints `((java.util.Map<String,Object>)x).remove((String)k)`:
            // inconvertible for every type this engine emits, in either operand position
            return false;
        }
        if (ts.isBinaryExpression (parent)) {
            const op = parent.operatorToken.kind;
            if (parent.left === n) {
                if (op === ts.SyntaxKind.EqualsToken) {
                    // the join already proved every plain write; re-check so a write the
                    // join could not see still rejects
                    const written = dataflowValueType (printer, unwrapParens (parent.right), context);
                    if (written === undefined || (written !== 'null' && written !== javaType)) {
                        return false;
                    }
                } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                    return false; // `x += r` re-resolves against the declared type
                }
            }
            if (isString && isLeftPlusOperand (unwrapParensUp (n))) {
                const plus = unwrapParensUp (n).parent;
                if (!isProvablyStringOperand (unwrapParens (plus.right))) {
                    return false; // add(String, ...) diverges from add(Object, Object) on null
                }
            }
        }
        if (!isString && !isList && isClassThrowArgument (n)) {
            return false; // `throw new X((String)x)` casts the argument
        }
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            return false; // the typed wrapper overload would win once the box is a String
        }
    }
    return true;
}

// the dataflow decision for one declaration: { type } or undefined
function dataflowLocalTypeOf (printer, declaration, context) {
    const scope = context?.scope ?? enclosingFunction (declaration);
    if (scope === undefined) {
        return undefined;
    }
    const index = context?.index ?? dataflowIndex (printer, scope);
    const sourceName = dataflowCanonicalName (printer, declaration.name);
    // (d) scope safety before any dataflow work
    const declarations = index.declarations.get (sourceName);
    if (declarations === undefined || declarations.length !== 1 || declarations[0] !== declaration) {
        dataflowDebug (`decl ${sourceName}: rejected (${declarations === undefined ? 'no binding' : declarations.length + ' bindings'})`);
        return undefined;
    }
    if (index.parameterNames.has (sourceName) || index.blockedNames.has (sourceName)) {
        dataflowDebug (`decl ${sourceName}: rejected (parameter/catch/destructured binding)`);
        return undefined;
    }
    const ctx = {
        scope,
        index,
        stack: context?.stack ?? new Set (),
        depth: context?.depth ?? 0,
    };
    let javaType = dataflowValueType (printer, unwrapParens (declaration.initializer), ctx);
    if (javaType === undefined) {
        dataflowDebug (`decl ${sourceName}: rejected (unprovable initializer)`);
        return undefined;
    }
    // (a) join the initializer with every later write
    javaType = dataflowTypeFromWrites (printer, ctx, declaration, sourceName, javaType);
    if (javaType === undefined) {
        dataflowDebug (`decl ${sourceName}: rejected (unprovable/non-joinable write)`);
        return undefined;
    }
    ctx.stack.add (declaration);
    try {
        if (!dataflowIsSafeToRetype (printer, declaration, sourceName, javaType, ctx)) {
            dataflowDebug (`decl ${sourceName}: rejected (unsafe use) type=${javaType}`);
            return undefined;
        }
    } finally {
        ctx.stack.delete (declaration);
    }
    dataflowDebug (`decl ${sourceName}: RETYPE ${javaType}`);
    return { type: javaType };
}

// wrap printVariableDeclarationList on a Transpiler's Java printer. Chained on top of
// every other patch (the surviving tables' wrapper runs first and its decisions win: its
// marker is gone by the time this one looks). Idempotent.
export function patchJavaDataflowTypes (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._javaDataflowPatched) {
        return;
    }
    printer._javaDataflowPatched = true;
    if (process.env['CCXT_JAVA_DATAFLOW'] === '0') {
        return; // measurement / A-B switch
    }
    const upstream = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = upstream (node, identation);
        try {
            return dataflowRewriteDeclaration (printer, node, identation, printed);
        } catch (e) {
            return printed; // never break the upstream print on an engine error
        }
    };
}

// rewrite the printed `Object <name> = <value>` prefix of one declaration when the engine
// proves the value's type. Anything unexpected (a marker the upstream wrapper already
// replaced, a multi-declarator list, a shape the printer emitted differently) is returned
// untouched.
function dataflowRewriteDeclaration (printer, node, identation, printed) {
    const declarations = node?.declarations;
    if (declarations === undefined || declarations.length !== 1) {
        return printed;
    }
    const declaration = declarations[0];
    if (declaration.initializer === undefined || declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return printed;
    }
    const info = dataflowLocalTypeOf (printer, declaration, undefined);
    if (info === undefined) {
        return printed;
    }
    const iden = printer.getIden (identation);
    const printedName = printer.printNode (declaration.name, 0);
    const marker = `${iden}${printer.VAR_TOKEN} ${printedName} = `;
    const at = printed.lastIndexOf (marker);
    if (at === -1) {
        return printed; // already retyped upstream / unexpected shape — leave it alone
    }
    const value = printed.slice (at + marker.length);
    if (info.type === JAVA_DATAFLOW_STRING
        && (value.startsWith ('this.') || value.startsWith ('Helpers.'))
        && DATAFLOW_WS_SOURCE_FILE.test (declaration.getSourceFile ().fileName)) {
        return printed; // the ws (pro) String pass would revert the spelling
    }
    return printed.slice (0, at) + `${iden}${info.type} ${printedName} = ${value}`;
}

// ===== JAVA-RE-4 slice: literal / boolean-expression locals =====
//
// Additive extension of this module (see the header above): a SECOND, independent
// patcher installed next to installJavaLocalTypes. Same monkey-patch shape, same
// per-local use-scan philosophy, its own marker flag (`_localTypesLiteralPatched`).
// The two patchers chain harmlessly: this one only rewrites declarations whose
// initializer is a literal / boolean expression, the structural one only rewrites
// `this.<call>(...)` values, and each no-ops when the other already moved the type
// token (its marker is not found any more).
//
// The Java printer declares every initialised body local as `Object` (VAR_TOKEN), even
// when the printed VALUE is already a concrete Java type:
//
//     Object name = "binance";                       -> String name = "binance";
//     Object fee = 0;                                -> Integer fee = 0;
//     Object futures = 1024L;                        -> Long futures = 1024L;
//     Object rate = 0.5;                             -> Double rate = 0.5;
//     Object paginate = false;                       -> Boolean paginate = false;
//     Object params = new java.util.HashMap<...>(){{ put(...) }}   -> java.util.Map<String, Object>
//     Object parts = new java.util.ArrayList<Object>(...)          -> java.util.List<Object>
//     Object ok = Helpers.isGreaterThan(a, b);       -> Boolean ok = ...;
//
// Every one of those values is ALREADY the named type at runtime (the literal prints
// `0` -> int boxed to Integer, `true` -> boolean boxed to Boolean, the object literal
// prints the anonymous HashMap<String, Object> the printer emits everywhere, the array
// literal an ArrayList<Object>), so naming the type moves no box and changes no value —
// EXCEPT where javac resolves something at COMPILE time against the declared type. Those
// cases are rejected per local by literalIsSafeToRetype() below (receiver hard casts,
// `+` overload families, `instanceof`/`typeof`, `as` casts, array destructuring, spell
// writes, pro-core typed-wrapper calls). Every later write to the local must likewise be
// provable to the same type (literalTypeOfValue), else the local keeps `Object` exactly
// as before.
//
// Sub-families in this slice, with the reason each is already the named type:
//   (a) literals: string literal -> String; numeric literal -> Integer / Long / Double
//       (by the printed literal: `2147483648` prints `2147483648L`, `1.5` prints `1.5`,
//       hex by the same printNumericLiteral rule); true/false -> Boolean; object literal
//       -> java.util.Map<String, Object> (drives OBJECT_OPENING `new java.util.HashMap
//       <String, Object>() {{`); array literal -> java.util.List<Object> (drives
//       ARRAY_OPENING `new java.util.ArrayList<Object>(java.util.Arrays.asList(`).
//   (b) comparison / logical / `!` expressions: `<`,`<=`,`>`,`>=`,`==`,`===`,`!=`,`!==`
//       print Helpers.isEqual / isGreaterThan / ... (declared primitive `boolean`),
//       `&&`/`||` print Helpers.isTrue(a) && Helpers.isTrue(b), `!x` prints
//       `!Helpers.isTrue(x)`, `k in o` -> Helpers.inOp, `x instanceof T` ->
//       Helpers.isInstance(x, T.class) — all primitives, boxed to Boolean by the Object
//       declaration, so the narrowed spelling is Boolean (boxed, never the primitive:
//       boxed survives `x == null` / Object parameters / `((Number)x)` casts).
//   (c) `new X(...)` constructor initialisers: NOT retyped — the printer already emits
//       `var` for a bare NewExpression initializer (isNew ? "var " : VAR_TOKEN), so the
//       local is already concretely typed; census in the generated tree: 0 `Object x =
//       new` sites in exchanges/** while 70 locals carry the printer's `var`.  Nothing
//       to add here. (`let x = new X(...).method()` is a CallExpression initializer and
//       is not provable, same as before.)
//   (d) `for` loop counters: NOT retyped — printForStatement rewrites the emitted
//       `Object i = 0` to `var i = 0` (a primitive int) and printPostfixUnaryExpression
//       emits the plain `i++`, so counters are already typed; census: 0 `for (Object x =`
//       sites in the generated tree (the 47 remaining `for (Object x :` hits are for-of
//       iterations, a different print path).  Retyping here would be a REGRESSION: the
//       declaration would be rewritten before printForStatement's `.replace("Object ",
//       "var ")` runs, pre-empting it and leaving a boxed `Integer i = 0` counter.
//
// WHAT IS DELIBERATELY NOT TYPED (each proven against the printer, not guessed):
//   * `let x = undefined;` / `let x;` — the printer emits `Object x = null`; a null box
//     proves nothing.
//   * locals initialised from a PARAMETER, a method call, a ternary, an `as` cast or
//     another local — see the abandoned java-loc-literals module; those families
//     (dataflow / ternary / as-string / as-any[]) are OUT OF SCOPE for this slice.  With
//     this reduced value typer the accepted set is a strict SUBSET of that module's
//     accepted set (same use-scan rules, fewer provable values), so its full-tree
//     compile proof carries over to this slice.
//   * `let x: Dict = ...` annotations — Java prints no annotations; nothing to read.
//
// THE USE SCAN. Naming the type never changes the runtime box; it only changes what javac
// resolves statically. literalIsSafeToRetype walks EVERY identifier use of the local in
// its enclosing function (by source name and by the printer's `finalX` capture renames,
// which mutate escapedText in place) and rejects the local when a use would compile
// differently or not at all against the narrowed type:
//   * writes: `=` with a value that is not the same type (or nullish); every compound
//     assignment (`x += y` prints `x = Helpers.add(x, y)` — Object result for the numeric
//     families, a different add overload for strings); `++`/`--` outside the numeric
//     families (printPostfixUnaryExpression emits the plain operator);
//   * `+`: the LEFT operand's static type selects the Helpers.add overload. A String
//     local on the left is accepted only when the RIGHT operand is provably a non-null
//     String (add(String,String) == add(Object,Object) for every such input; with any
//     other right operand add(Object,Object) can take its numeric or null branch first
//     and diverge from add(String,Object)). A right operand is always fine, and the
//     non-String families never change the selected overload (only add(Object,Object)
//     applies to them).
//   * hard receiver casts the printer emits: `((String)x)` for search/startsWith/endsWith/
//     trim/toUpperCase/toLowerCase/replace/replaceAll/padEnd/padStart and `((java.util.
//     List<Object>)x)` for push/shift/pop/reverse — accepted only for the matching family
//     (`(String)StringLocal` and `(List<Object>)List<Object>Local` are identity casts);
//     `join` casts the receiver to `(java.util.List<String>)`, inconvertible from every
//     family here, so it is rejected outright; `length` keeps its printer branch
//     (`((String)x).length()` for a String receiver, Helpers.getArrayLength(x) otherwise);
//     `includes` prints the raw `x.contains(y)` and is accepted for lists only.
//   * argument positions the printer hard-casts: startsWith/endsWith/replace/replaceAll
//     cast their haystack arguments to `(String)`, padEnd/padStart cast the pad argument
//     to `((Number)x)` and the pad string to `(String)`.
//   * `typeof x` prints `x instanceof String/Long/...` (invalid when x IS that type),
//     `Number.isInteger(x)` prints `(x instanceof Integer) || (x instanceof Long)`
//     (inconvertible for every family), `delete obj[k]` casts the key to `(String)` and
//     the container to `(java.util.Map<String,Object>)`, `x as string` prints `((String)x)`,
//     `x as any` prints `((Object)x)` (an Object static type — never narrowable),
//     `x as any[]` prints `(java.util.List<Object>)x`.
//   * `[a, b] = x` / `const [a, b] = x` print a `(java.util.List<Object>)` cast of a
//     synthetic `var` holder — lists only; `...x` spread; ternary arm reads (the arm
//     unifies the conditional's static type, which can then flip an enclosing overload);
//     `await x` (prints `(x).join()`); tagged templates; unknown parent shapes are
//     rejected, so the default is Object.
//   * in pro cores (the file path contains /pro/) a local that feeds a `this.<async>()`
//     call as an argument, directly or through `(x)` / `x + y` / `c ? x : y`, keeps
//     Object: the typed REST wrapper the pro core extends declares typed overloads
//     (`fetchTicker(String)`, `watchTrades(String, Map<String, Object>)`) that win Java
//     overload resolution over the `Object...` cores once the argument's static type is
//     concrete — same guard as patchJavaLocalTypes#isSafeToNarrow.
//
// Installed on the printer from BOTH the main-thread Transpiler (setupTranspiler in
// build/javaTranspiler.ts) and the piscina worker (build/java-worker.ts), exactly like
// patchJavaLocalTypes / installJavaLocalTypes. Pure declaration-type diff: the retype
// replaces only the leading type token of the emitted declaration line.

const LITERAL_STRING_TYPE = 'String';
const LITERAL_BOOLEAN_TYPE = 'Boolean';
const LITERAL_INTEGER_TYPE = 'Integer';
const LITERAL_LONG_TYPE = 'Long';
const LITERAL_DOUBLE_TYPE = 'Double';
const LITERAL_NUMERIC_TYPES = new Set ([ LITERAL_INTEGER_TYPE, LITERAL_LONG_TYPE, LITERAL_DOUBLE_TYPE ]);
const LITERAL_MAP_TYPE = 'java.util.Map<String, Object>';
const LITERAL_LIST_TYPE = 'java.util.List<Object>';
const LITERAL_TYPED_TYPES = new Set ([ LITERAL_STRING_TYPE, LITERAL_BOOLEAN_TYPE, ...LITERAL_NUMERIC_TYPES, LITERAL_MAP_TYPE, LITERAL_LIST_TYPE ]);

// printer method name -> the receiver cast the Java print emits. A narrowed local used
// as the receiver is accepted only for an identity-compatible family.
const LITERAL_LIST_CAST_RECEIVERS = new Set ([ 'push', 'reverse', 'pop', 'shift' ]);
const LITERAL_STRING_CAST_RECEIVERS = new Set ([ 'search', 'startsWith', 'endsWith', 'trim', 'toUpperCase', 'toLowerCase', 'replace', 'replaceAll', 'padEnd', 'padStart' ]);
// receiver printed through an Object-taking helper (Helpers.slice/split/concat/
// getIndexOf, String.valueOf) — safe for every family
const LITERAL_OBJECT_RECEIVER_METHODS = new Set ([ 'slice', 'split', 'concat', 'toString', 'indexOf' ]);
const LITERAL_LIST_ONLY_RECEIVERS = new Set ([ 'includes' ]);
const LITERAL_REJECTED_RECEIVERS = new Set ([ 'join', 'sort' ]);
// argument indices the printer hard-casts inside these calls
const LITERAL_STRING_CAST_ARGUMENTS = {
    'startsWith': [ 1 ], 'endsWith': [ 1 ],
    'replace': [ 1, 2 ], 'replaceAll': [ 1, 2 ],
    'join': [ 0 ], 'padEnd': [ 1 ], 'padStart': [ 1 ],
};
const LITERAL_NUMBER_CAST_ARGUMENTS = { 'padEnd': [ 0 ], 'padStart': [ 0 ] };

// printed through Helpers.isEqual / isGreaterThan / isLessThan / isGreaterThanOrEqual /
// isLessThanOrEqual / inOp / isInstance — all declared primitive `boolean` in Helpers.java
const LITERAL_BOOLEAN_BINARY_OPERATORS = new Set ([
    ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken,
    ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.GreaterThanEqualsToken,
    ts.SyntaxKind.LessThanToken, ts.SyntaxKind.LessThanEqualsToken,
    ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken,
    ts.SyntaxKind.InKeyword, ts.SyntaxKind.InstanceOfKeyword,
]);

// an identifier use of the local that is only the DECLARATION name / a member name
function literalIsNotAUse (n) {
    const parent = n.parent;
    if (parent === undefined) {
        return true;
    }
    switch (parent.kind) {
        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.Parameter:
        case ts.SyntaxKind.BindingElement:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.PropertySignature:
        case ts.SyntaxKind.PropertyAssignment:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.MethodSignature:
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.TypeAliasDeclaration:
        case ts.SyntaxKind.EnumDeclaration:
        case ts.SyntaxKind.EnumMember:
        case ts.SyntaxKind.ImportSpecifier:
        case ts.SyntaxKind.NamespaceImport:
        case ts.SyntaxKind.ModuleDeclaration:
        case ts.SyntaxKind.LabeledStatement:
            return parent.name === n;
        case ts.SyntaxKind.PropertyAccessExpression:
        case ts.SyntaxKind.QualifiedName:
            return parent.name === n;
        default:
            return false;
    }
}

// climb `(x)` / `x!` wrappers: their print is the expression itself, so the position that
// consumes the value is the parent of the climbed node (the printer's printCondition /
// Helpers wrappers see through them too)
function literalClimbIdentityWrappers (node) {
    let current = node;
    while (current.parent !== undefined
        && (ts.isParenthesizedExpression (current.parent)
            || current.parent.kind === ts.SyntaxKind.NonNullExpression)) {
        current = current.parent;
    }
    return current;
}

// the printer renames identifiers captured by an object literal in place: `x` -> `finalX`
// (`_2`, `_3` ... per reassignment version). Reads of the local may carry any of those
// names by the time this module scans.
function literalCaptureNames (sourceName, printer) {
    const names = new Set ([ String (sourceName) ]);
    let base = String (sourceName);
    try {
        const final = printer.getFinalVarName (base);
        if (typeof final === 'string' && final.length > 0) {
            names.add (final);
            base = final;
        }
    } catch (e) {
        // getFinalVarName is best-effort; the plain source name is always matched
    }
    return names;
}

function literalMatchesLocalName (escapedText, sourceName, names) {
    if (escapedText === sourceName) {
        return true;
    }
    for (const candidate of names) {
        if (escapedText === candidate) {
            return true;
        }
        if (typeof escapedText === 'string' && escapedText.startsWith (candidate + '_')) {
            return true;
        }
    }
    return false;
}

function literalCollectUses (scope, sourceName, names) {
    const index = identifierIndex (scope);
    const uses = [];
    for (const [ name, nodes ] of index) {
        if (literalMatchesLocalName (name, sourceName, names)) {
            uses.push (...nodes);
        }
    }
    return uses;
}

// a local / parameter in the same function declared under a name that would shadow the
// type token being emitted (`String String = ...` leaves the later `String x = ...`
// unresolvable)
function literalTypeTokenShadowed (scope, javaType) {
    const tokens = new Set ();
    if (javaType === LITERAL_MAP_TYPE || javaType === LITERAL_LIST_TYPE) {
        tokens.add ('java');
    } else {
        tokens.add (javaType);
    }
    const index = identifierIndex (scope);
    for (const token of tokens) {
        const nodes = index.get (token);
        if (nodes === undefined) {
            continue;
        }
        for (const n of nodes) {
            const parent = n.parent;
            if (parent !== undefined && parent.name === n
                && (ts.isVariableDeclaration (parent) || ts.isParameter (parent))) {
                return true;
            }
        }
    }
    return false;
}

// the Java print of the literal decides the type: printNumericLiteral appends `L` when
// the value exceeds Integer.MAX_VALUE (and leaves `1e3`/`1.5` as double literals)
function literalTypeOfNumericLiteral (printer, node) {
    let text = node.text;
    try {
        text = printer.printNumericLiteral (node);
    } catch (e) {
        // fall through to the raw text
    }
    if (typeof text !== 'string') {
        return undefined;
    }
    if (text.endsWith ('L')) {
        return LITERAL_LONG_TYPE;
    }
    // hex / binary literals print as-is and are int literals in Java whatever their
    // digits contain (`0x1e5` is 485) — only the `L` suffix makes them long
    if (text.startsWith ('0x') || text.startsWith ('0X') || text.startsWith ('0b') || text.startsWith ('0B')) {
        return LITERAL_INTEGER_TYPE;
    }
    if (text.indexOf ('.') !== -1 || text.indexOf ('e') !== -1 || text.indexOf ('E') !== -1) {
        return LITERAL_DOUBLE_TYPE;
    }
    return LITERAL_INTEGER_TYPE;
}

function literalObjectLiteralIsPlain (node) {
    return node.properties.every ((p) =>
        p.kind === ts.SyntaxKind.PropertyAssignment
        || p.kind === ts.SyntaxKind.ShorthandPropertyAssignment);
}

function literalArrayLiteralIsPlain (node) {
    return node.elements.every ((e) =>
        e.kind !== ts.SyntaxKind.SpreadElement && e.kind !== ts.SyntaxKind.OmittedExpression);
}

const LITERAL_NULLISH = { nullish: true, type: undefined, nonNull: false };

// the printed Java static type of `node`, when it is one of this slice's families —
// returns { type, nonNull } or undefined (never narrowable / out of slice) or NULLISH.
// Deliberately REDUCED versus the abandoned java-loc-literals module: no ternary unify,
// no `as` casts, no dataflow reads of other locals.
function literalTypeOfValue (printer, node) {
    if (node === undefined) {
        return undefined;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return { type: LITERAL_STRING_TYPE, nonNull: true };
        case ts.SyntaxKind.NumericLiteral: {
            const type = literalTypeOfNumericLiteral (printer, node);
            return (type === undefined) ? undefined : { type, nonNull: true };
        }
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
            return { type: LITERAL_BOOLEAN_TYPE, nonNull: true };
        case ts.SyntaxKind.NullKeyword:
            return LITERAL_NULLISH;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' ? LITERAL_NULLISH : undefined;
        case ts.SyntaxKind.ParenthesizedExpression:
        case ts.SyntaxKind.NonNullExpression:
            return literalTypeOfValue (printer, node.expression);
        case ts.SyntaxKind.BinaryExpression:
            // `a < b`, `a === b`, `a && b`, `k in o`, `a instanceof T` all print boolean
            // helpers — except the assignment/arithmetic operators
            return LITERAL_BOOLEAN_BINARY_OPERATORS.has (node.operatorToken.kind)
                ? { type: LITERAL_BOOLEAN_TYPE, nonNull: true }
                : undefined;
        case ts.SyntaxKind.PrefixUnaryExpression:
            // `!x` prints `!Helpers.isTrue(x)`
            return node.operator === ts.SyntaxKind.ExclamationToken
                ? { type: LITERAL_BOOLEAN_TYPE, nonNull: true }
                : undefined;
        case ts.SyntaxKind.ObjectLiteralExpression:
            return literalObjectLiteralIsPlain (node) ? { type: LITERAL_MAP_TYPE, nonNull: true } : undefined;
        case ts.SyntaxKind.ArrayLiteralExpression:
            return literalArrayLiteralIsPlain (node) ? { type: LITERAL_LIST_TYPE, nonNull: true } : undefined;
        default:
            return undefined;
    }
}

// when CCXT_JAVA_LOCAL_CENSUS is set, record every accepted String left-hand `+` operand
// (the one place a narrowed String can change Helpers.add overload selection). The rule
// only accepts a provably non-null String right operand, where add(String,String) /
// add(String,Object) are identical to add(Object,Object) for every input — the log lets a
// reviewer verify that claim on the real tree.
const literalPlusLeftAccepted = [];
function literalRecordPlusLeftAccepted (declaration, node, right) {
    if (!process.env['CCXT_JAVA_LOCAL_CENSUS']) {
        return;
    }
    try {
        literalPlusLeftAccepted.push ({
            file: declaration.getSourceFile ().fileName.replace (/^.*[\\/]ts[\\/]/, 'ts/'),
            name: String (declaration.name.escapedText),
            right: (right.getText ? right.getText () : '<no text>').slice (0, 80),
        });
    } catch (e) {}
}

function literalDumpPlusLeftAccepted () {
    if (literalPlusLeftAccepted.length === 0) {
        return;
    }
    try {
        process.stderr.write ('[java-literal-types plus-left accepted]\n'
            + literalPlusLeftAccepted.map ((e) => `  ${e.file} ${e.name} + ${e.right}`).join ('\n') + '\n');
    } catch (e) {}
}

function literalIsProvablyStringValue (printer, value) {
    if (value === undefined) {
        return false;
    }
    const resolved = literalTypeOfValue (printer, value);
    return resolved !== undefined && resolved.nullish !== true
        && resolved.type === LITERAL_STRING_TYPE && resolved.nonNull === true;
}

function literalAssignable (targetType, value) {
    if (value === undefined) {
        return false;
    }
    if (value.nullish === true) {
        return true; // null is assignable to every reference type emitted here
    }
    return value.type === targetType;
}

// is `n` the argument of a Number.isInteger(...) call, whose Java print is
// `(x instanceof Integer) || (x instanceof Long)` (inconvertible for every family here)
function literalIsNumberIsIntegerArgument (n) {
    const parent = n.parent;
    if (parent === undefined || !ts.isCallExpression (parent)) {
        return false;
    }
    if (parent.arguments.indexOf (n) === -1) {
        return false;
    }
    const callee = parent.expression;
    return ts.isPropertyAccessExpression (callee)
        && callee.expression.kind === ts.SyntaxKind.Identifier
        && callee.expression.escapedText === 'Number'
        && callee.name.escapedText === 'isInteger';
}

// reject the refinement when a later use needs the local to stay `Object` (see the
// header for the per-parent rule set)
function literalIsSafeToRetype (printer, scope, declaration, sourceName, value, isProFile) {
    const javaType = value.type;
    const isString = javaType === LITERAL_STRING_TYPE;
    const isList = javaType === LITERAL_LIST_TYPE;
    const isMap = javaType === LITERAL_MAP_TYPE;
    const isNumeric = LITERAL_NUMERIC_TYPES.has (javaType);
    if (literalTypeTokenShadowed (scope, javaType)) {
        return false;
    }
    const names = literalCaptureNames (sourceName, printer);
    for (const raw of literalCollectUses (scope, sourceName, names)) {
        if (raw === declaration.name) {
            continue;
        }
        if (literalIsNotAUse (raw)) {
            continue;
        }
        // positional checks run on the node that actually carries the value (parens /
        // `x!` print as the inner expression)
        const n = literalClimbIdentityWrappers (raw);
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        // a use that would move a `this.<async>()` argument onto a typed wrapper overload
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            return false;
        }
        switch (parent.kind) {
            case ts.SyntaxKind.PostfixUnaryExpression:
                // `x++` / `x--` print the plain operator — numeric boxes only
                if (!isNumeric) {
                    return false;
                }
                break;
            case ts.SyntaxKind.PrefixUnaryExpression: {
                const op = parent.operator;
                if (op === ts.SyntaxKind.ExclamationToken) {
                    break; // `!Helpers.isTrue(x)` — valid for every family
                }
                if (op === ts.SyntaxKind.MinusToken) {
                    break; // Helpers.opNeg(x) — Object-taking
                }
                if (op === ts.SyntaxKind.PlusToken) {
                    if (!isNumeric) {
                        return false; // prints +(x)
                    }
                    break;
                }
                return false; // ~x and friends print raw operators
            }
            case ts.SyntaxKind.SpreadElement:
                return false;
            case ts.SyntaxKind.TypeOfExpression:
                return false; // `typeof x` prints `x instanceof String/Long/...`
            case ts.SyntaxKind.TaggedTemplateExpression:
                return false;
            case ts.SyntaxKind.AwaitExpression:
                return false; // prints (x).join()
            case ts.SyntaxKind.ConditionalExpression:
                // `x ? a : b` prints through printCondition (`Helpers.isTrue(x)`) — fine.
                // An ARM read unifies the conditional's static type, which can then flip
                // an enclosing overload, so arm reads keep the local Object.
                if (parent.condition !== n) {
                    return false;
                }
                break;
            case ts.SyntaxKind.AsExpression: {
                const typeNode = parent.type;
                if (typeNode.kind === ts.SyntaxKind.StringKeyword) {
                    if (!isString) {
                        return false; // ((String)x)
                    }
                } else if (typeNode.kind === ts.SyntaxKind.AnyKeyword) {
                    return false; // ((Object)x) — never narrowable
                } else if (typeNode.kind === ts.SyntaxKind.ArrayType) {
                    if (!(isList && typeNode.elementType.kind === ts.SyntaxKind.AnyKeyword)) {
                        return false; // (java.util.List<Object>)x / (java.util.List<String>)x
                    }
                }
                break;
            }
            case ts.SyntaxKind.ArrayLiteralExpression:
                // `[a, b] = f()` prints a (java.util.List<Object>) cast of a synthetic var
                if (parent.parent !== undefined && ts.isBinaryExpression (parent.parent)
                    && parent.parent.left === parent
                    && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
                    && !isList) {
                    return false;
                }
                break;
            case ts.SyntaxKind.VariableDeclaration:
                // `const [a, b] = x` prints a (java.util.List<Object>) cast of a synthetic var
                if (parent.name?.kind === ts.SyntaxKind.ArrayBindingPattern && !isList) {
                    return false;
                }
                break;
            case ts.SyntaxKind.PropertyAccessExpression: {
                const method = String (parent.name?.escapedText);
                if (method === 'length') {
                    break; // String: ((String)x).length(); otherwise Helpers.getArrayLength(x)
                }
                if (LITERAL_OBJECT_RECEIVER_METHODS.has (method)) {
                    break; // printer prints through an Object-taking helper
                }
                if (LITERAL_LIST_CAST_RECEIVERS.has (method)) {
                    if (!isList) {
                        return false; // ((java.util.List<Object>)x).add/get/... / Collections.reverse
                    }
                    break;
                }
                if (LITERAL_STRING_CAST_RECEIVERS.has (method)) {
                    if (!isString) {
                        return false; // ((String)x).trim() etc.
                    }
                    break;
                }
                if (LITERAL_LIST_ONLY_RECEIVERS.has (method)) {
                    if (!isList) {
                        return false; // raw x.contains(y)
                    }
                    break;
                }
                if (LITERAL_REJECTED_RECEIVERS.has (method)) {
                    return false;
                }
                return false; // unknown receiver print — keep Object
            }
            case ts.SyntaxKind.ElementAccessExpression: {
                const grandparent = parent.parent;
                if (grandparent !== undefined && grandparent.kind === ts.SyntaxKind.DeleteExpression) {
                    if (parent.expression === n) {
                        if (!isMap) {
                            return false; // ((java.util.Map<String,Object>)x).remove(...)
                        }
                    } else if (parent.argumentExpression === n) {
                        if (!isString) {
                            return false; // .remove((String)key)
                        }
                    }
                }
                break; // GetValue(x, k) / Helpers.addElementToObject(x, k, v) — Object-taking
            }
            case ts.SyntaxKind.BinaryExpression: {
                const op = parent.operatorToken.kind;
                if (parent.left === n) {
                    if (op === ts.SyntaxKind.EqualsToken) {
                        if (!literalAssignable (javaType, literalTypeOfValue (printer, parent.right))) {
                            return false;
                        }
                    } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                        return false; // x = Helpers.add(x, y) — Object result / different overload
                    } else if (op === ts.SyntaxKind.PlusToken) {
                        if (isString) {
                            if (!literalIsProvablyStringValue (printer, parent.right)) {
                                return false; // add overload family selection
                            }
                            literalRecordPlusLeftAccepted (declaration, n, parent.right);
                        }
                    }
                }
                break;
            }
            case ts.SyntaxKind.CallExpression: {
                if (parent.expression === n) {
                    return false; // dynamic callee
                }
                if (parent.arguments.indexOf (n) === -1) {
                    break;
                }
                if (literalIsNumberIsIntegerArgument (n)) {
                    return false;
                }
                const callee = parent.expression;
                if (callee !== undefined && ts.isPropertyAccessExpression (callee)) {
                    const method = String (callee.name?.escapedText);
                    const index = parent.arguments.indexOf (n);
                    const stringIdx = LITERAL_STRING_CAST_ARGUMENTS[method];
                    if (stringIdx !== undefined && stringIdx.indexOf (index) !== -1 && !isString) {
                        return false; // ((String)x) on the argument
                    }
                    const numberIdx = LITERAL_NUMBER_CAST_ARGUMENTS[method];
                    if (numberIdx !== undefined && numberIdx.indexOf (index) !== -1 && !isNumeric) {
                        return false; // ((Number)x).intValue() on the argument
                    }
                }
                break;
            }
            default:
                break;
        }
    }
    return true;
}

function literalLocalTypeCore (printer, declaration) {
    if (!ts.isIdentifier (declaration.name) || declaration.initializer === undefined) {
        return undefined;
    }
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return undefined;
    }
    const value = literalTypeOfValue (printer, declaration.initializer);
    if (value === undefined || value.nullish === true) {
        return undefined;
    }
    const sourceName = declaration.name.escapedText;
    const fileName = declaration.getSourceFile ().fileName;
    const isProFile = /[\\/]pro[\\/]/.test (fileName);
    if (!literalIsSafeToRetype (printer, scope, declaration, sourceName, value, isProFile)) {
        return undefined;
    }
    return value;
}

function literalFamilyOf (declaration) {
    let initializer = declaration.initializer;
    // `('a')` / `x!` classify as their inner value's family
    while (initializer !== undefined
        && (initializer.kind === ts.SyntaxKind.ParenthesizedExpression
            || initializer.kind === ts.SyntaxKind.NonNullExpression)) {
        initializer = initializer.expression;
    }
    switch (initializer.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return 'literal-string';
        case ts.SyntaxKind.NumericLiteral:
            return 'literal-number';
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
            return 'literal-boolean';
        case ts.SyntaxKind.ObjectLiteralExpression:
            return 'literal-object';
        case ts.SyntaxKind.ArrayLiteralExpression:
            return 'literal-array';
        case ts.SyntaxKind.BinaryExpression:
        case ts.SyntaxKind.PrefixUnaryExpression:
            return 'boolean-expression';
        default:
            return 'other:' + initializer.kind;
    }
}

// census of retyped locals per family (exported for the campaign bookkeeping; also
// printed at process exit when CCXT_JAVA_LOCAL_CENSUS is set — note piscina worker
// realms do NOT fire the exit hook, so tree-wide numbers come from the diff census)
export const javaLiteralTypeCensus = {};

function literalBumpCensus (family) {
    javaLiteralTypeCensus[family] = (javaLiteralTypeCensus[family] ?? 0) + 1;
}

let literalCensusHookInstalled = false;
function literalMaybeInstallCensusHook () {
    if (literalCensusHookInstalled || !process.env['CCXT_JAVA_LOCAL_CENSUS']) {
        return;
    }
    literalCensusHookInstalled = true;
    process.on ('exit', () => {
        try {
            process.stderr.write ('[java-literal-types census] ' + JSON.stringify (javaLiteralTypeCensus) + '\n');
        } catch (e) {}
    });
    process.on ('exit', literalDumpPlusLeftAccepted);
}

// this slice's patcher; installed next to installJavaLocalTypes at both call sites
// (build/javaTranspiler.ts#setupTranspiler and build/java-worker.ts)
export function patchJavaLiteralLocalTypes (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._localTypesLiteralPatched) {
        return;
    }
    literalMaybeInstallCensusHook ();
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = original (node, identation);
        const declaration = node?.declarations?.[0];
        if (declaration === undefined || declaration.initializer === undefined
            || node.declarations.length !== 1 || !ts.isIdentifier (declaration.name)) {
            return printed;
        }
        // a `for (let i = 0; ...)` initializer: printForStatement already rewrites the
        // emitted `Object i = 0` to `var i = 0` (a primitive int) and `i++` prints the
        // plain operator, so loop counters are already typed — retyping here would
        // pre-empt the rewrite and leave a boxed Integer counter (census: 0 sites)
        if (declaration.parent?.parent?.kind === ts.SyntaxKind.ForStatement) {
            return printed;
        }
        const value = literalLocalTypeCore (printer, declaration);
        if (value === undefined || !LITERAL_TYPED_TYPES.has (value.type)) {
            return printed;
        }
        const iden = printer.getIden (identation);
        const printedName = printer.printNode (declaration.name);
        const marker = `${iden}${printer.VAR_TOKEN} ${printedName} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed; // already retyped by another slice's patcher or unexpected shape
        }
        literalBumpCensus (literalFamilyOf (declaration));
        return printed.slice (0, at) + `${iden}${value.type} ` + printed.slice (at + marker.length - (printedName.length + 3));
    };
    printer._localTypesLiteralPatched = true;
}

// ===== 4. numeric helpers -> boxed Long/Double/Integer locals (JAVA-RE-7) =====
//
// The numeric half of the local-typing campaign. Every helper below ALREADY hands
// back one concrete box at runtime; this section names it on the generated locals
// (`Object ts = this.safeInteger (...)` -> `Long ts = this.safeInteger (...)`), and
// retypes the few Java declarations that still erase that box to `Object`.
//
// WHAT THE RUNTIME BOX IS (audited tree-wide; all hand-written Java sources):
//   * safeInteger / safeInteger2 / safeIntegerN / safeIntegerProduct -> Long or null.
//     SafeMethods.SafeIntegerN (declared `Long`) returns a parsed long (Long.parseLong /
//     Math.floor / n.longValue()) or toLongQuiet(default) (a Long) or null; the
//     SafeMethods.SafeInteger / SafeInteger2 and the BaseExchange.safeInteger* wrappers
//     say Object but every path already hands a Long box through.
//   * safeFloat / safeFloat2 / safeFloatN -> Double or null; ALREADY declared Double in
//     the hand-written base (SafeMethods + BaseExchange), so only the locals move.
//   * safeNumber / safeNumber2 / safeNumberN -> Double or null. Generated bodies are
//     `return this.parseNumber(value, default)`, and BaseExchange.parseNumber
//     (hand-written) is declared Double on every overload; the erased `Object` return
//     type hid a single box.
//   * parseToInt -> Long or null: generated body returns Helpers.parseInt(...), whose
//     hand-written body returns toLong(a) (a Long) or null.
//   * milliseconds / seconds / parse8601 -> Long; ALREADY declared Long by the
//     hand-written BaseExchange (Time.milliseconds() is a primitive long, boxed at the
//     boundary). parseTimeframe -> primitive int; declared `int` and it THROWS on
//     malformed input instead of returning undefined, so no null can ever flow in.
//   * nonce -> deliberately NOT typed. BaseExchange.nonce() returns this.seconds() (a
//     Long box) but the ~40 venue overrides disagree (ts/src/binance.ts returns
//     `this.milliseconds() - this.options["timeDifference"]` -> Helpers.subtract -> a
//     Double box; the generated BinanceCore/OkxCore keep that Double; prediction/Bitmex
//     return milliseconds() -> Long). One local type cannot cover them without a
//     per-venue closed table; excluded.
//   * safeIntegerProduct2 / safeIntegerProductN (and SafeMethods.SafeNumberN) -> NOT
//     typed: they hand the caller's raw defaultValue back on the failure path, so the
//     box is whatever the call site passed (an Integer for the ubiquitous `0`).
//   * safeTimestamp / safeTimestamp2 are NOT narrowable for the same reason (the Java
//     safeTimestampN returns the caller's default untouched) — already documented in
//     section 3; they are absent here too.
//
// UPSTREAM RETYPES (the other half of the slice — all declaration-only):
//   * java/lib/src/main/java/io/github/ccxt/BaseExchange.java: safeInteger / safeInteger2
//     / safeIntegerN / safeIntegerProduct -> Long (hand-written wrappers; bodies untouched).
//   * java/lib/src/main/java/io/github/ccxt/base/SafeMethods.java: SafeInteger /
//     SafeInteger2 -> Long (bodies untouched; SafeIntegerN already declared Long).
//   * java/lib/src/main/java/io/github/ccxt/Helpers.java: parseInt -> Long, parseFloat ->
//     Double (toLong/toDouble already produced exactly those boxes).
//   * installJavaNumericLocalTypes() (part 1) retypes the GENERATED methods (parseToInt,
//     safeNumber, safeNumber2, safeNumberN) at print time by wrapping printFunctionType
//     — their signatures live below the "METHODS BELOW THIS LINE" delimiter (rewritten
//     from ts/src/base/Exchange.ts by every regen), so a text edit would not survive.
// JAVA TRAPS this section encodes (each differential-tested with a javac harness):
//   * a PRIMITIVE local cannot hold null: `int x; x = null` does not compile, so a
//     nullish write rejects the int family outright (parseTimeframe never returns null,
//     but the guard costs nothing).
//   * ternary ARMS: `cond ? 0 : this.parseToInt (x)` is a REFERENCE conditional while
//     parseToInt prints `Object`, and becomes a NUMERIC conditional the moment the arm
//     is statically Long — javac then applies binary numeric promotion and UNBOXES the
//     arm, so a null return throws NPE where the baseline stored null. The retype is
//     therefore paired with installJavaNumericLocalTypes() (part 2): any conditional arm that is
//     one of the newly retyped calls gets a restoring `((Object) ...)` cast when the
//     other arm is a numeric literal or a different family box (10 sites tree-wide,
//     all `? ... parseToInt(...) : 0` / `? 0.00001 : safeNumber(...)`).
//   * `==` on boxed types compares REFERENCES: harmless here because the Java printer
//     never emits a raw `==`/`!=` — every comparison prints through Helpers.isEqual /
//     isGreaterThan / ... (Object-taking, value semantics; census over every generated
//     Core file found 0 raw comparisons outside comments). The guard is nonetheless the
//     usual one: an arm/use that would print an unboxing operator (++/--/compound
//     assignment/spread/typeof/`x as T`/array destructuring) rejects the local.
//   * INTEGER DIVISION differs from JS number division, and the C#-campaign
//     "subtract-on-int" overload trap was CHECKED for Java: Helpers has two real
//     overload families — `add(Object,Object)` + the String-typed convenience overloads
//     (a numeric-typed operand never binds them; only a String first argument could)
//     and that is it — `subtract(int, int)` sits COMMENTED OUT at Helpers.java:331, so
//     `Helpers.subtract(x, y)` always resolves to the single `subtract(Object, Object)`
//     (which normalizes Integer to Long and returns a Long/Double box). `/` always
//     prints Helpers.divide (one Object signature -> toDouble/toDouble). Differential
//     harness: Helpers.subtract(1000, 1) -> Long 999, Helpers.divide(1, 2) -> 0.5. The
//     scan still rejects `int` locals as direct `-` operands (numericIsMinusOperand),
//     mirroring the C# subtract-on-int guard so a re-enabled (int,int) overload could
//     never silently rebind an int local (census: 0 such sites today).
//   * unary plus prints raw `+(x)` (an unboxing read): sites can only exist where the
//     operand was ALREADY numeric (the baseline `+(Object)` does not compile), and all
//     prefix/postfix unary uses reject the local anyway.
//
// The scan is otherwise the same shape as section 3 (and matches the reference
// java-loc-numeric slice): any use that would print an unboxing operator or a receiver
// cast the type cannot satisfy keeps the local Object.

// helper -> Java type of a LOCAL fed by a whole `this.<helper>(...)` call. Every entry
// names the box the callee already returns (see the audit above); the local declaration
// line is the only thing that moves, no cast is emitted (section 3's safeInteger2
// `(Long)` cast predates the upstream retype and is a harmless no-op checkcast now).
export const JAVA_NUMERIC_LOCAL_TYPES = {
    'safeInteger': 'Long',
    'safeInteger2': 'Long',
    'safeIntegerN': 'Long',
    'safeIntegerProduct': 'Long',
    'safeFloat': 'Double',
    'safeFloat2': 'Double',
    'safeFloatN': 'Double',
    'safeNumber': 'Double',
    'safeNumber2': 'Double',
    'safeNumberN': 'Double',
    'parseToInt': 'Long',
    'milliseconds': 'Long',
    'seconds': 'Long',
    'parse8601': 'Long',
    'parseTimeframe': 'int',
};

// calls whose Java DECLARED return type moves Object -> Long/Double in this slice: a
// conditional ARM carrying one of these changes from a reference conditional to a
// numeric one, and javac then unboxes the arm (NPE on a null return where the baseline
// stored null). Only these arms get the restoring `(Object)` cast — safeFloat* /
// milliseconds / seconds / parse8601 / parseTimeframe were already concrete in the
// hand-written Java, so their arms keep exactly the baseline behaviour.
const JAVA_NUMERIC_RETYPED_CALLS = new Set ([
    'safeInteger', 'safeInteger2', 'safeIntegerN', 'safeIntegerProduct',
    'safeNumber', 'safeNumber2', 'safeNumberN', 'parseToInt',
]);

// GENERATED methods whose erased `Object` return type installJavaNumericLocalTypes
// names at print time. Bodies need no edit — every return expression is already
// statically the named type (parseNumber -> Double, Helpers.parseInt -> Long).
const JAVA_NUMERIC_METHOD_RETURN_TYPES = {
    'parseToInt': 'Long',
    'safeNumber': 'Double',
    'safeNumber2': 'Double',
    'safeNumberN': 'Double',
};

// Source files whose declarations are the base-tier numeric helpers: the functions
// mixed into Exchange as instance fields (ts/src/base/functions/type.ts, time.ts,
// misc.ts) and the methods declared on the base classes. The base class file is
// printed from an overload-stripped temp copy (`Exchange.nooverloads.<pid>.ts`, see
// build/stripOverloads.ts), so both spellings are accepted. A call resolving anywhere
// else (a venue override, a same-named venue helper) is left `Object`.
const NUMERIC_BASE_TIER_DECLARATION_FILE = /(^|[\\/])ts[\\/]src[\\/]base[\\/](Exchange(\.nooverloads\.\d+)?\.ts|PredictionExchange(\.nooverloads\.\d+)?\.ts|functions[\\/](type|time|misc)\.ts)$/;
// `milliseconds = now` where `now = Date.now` (ts/src/base/functions/time.ts), so a
// `this.milliseconds()` call resolves to the Date.now signature in whichever
// typescript package the resolution cache nests it under.
const NUMERIC_LIB_DTS_FILE = /(^|[\\/])node_modules[\\/](?:[^\\/]+[\\/]node_modules[\\/])?typescript6?[\\/]lib[\\/]lib\.[^\\/]*\.d\.ts$/;

// method names whose Java print is safe on a narrowed numeric receiver: toString ->
// String.valueOf(x) and toFixed -> toFixed(x, d) are the only Object-taking prints;
// every other method the printer knows how to special case casts the receiver
// (String) / (List).
const NUMERIC_RECEIVER_METHODS = new Set ([ 'toString', 'toFixed' ]);

const JAVA_NUMERIC_DEBUG = process.env.CCXT_JAVA_NUMERIC_DEBUG === '1';

function numericDebug (message) {
    if (JAVA_NUMERIC_DEBUG) {
        console.error ('[java-numeric] ' + message);
    }
}

// the numeric section reuses section 3's unwrapParens/enclosingFunction/identifierIndex/
// isThisOrSuperCall/isAsyncMethodCall/feedsInheritedAsyncCall; only the non-null
// assertion needs stripping on top of plain parens (Java has no `!`, the printer drops it)
function unwrapNumericExpression (node) {
    while (node !== undefined
        && (ts.isParenthesizedExpression (node) || node.kind === ts.SyntaxKind.NonNullExpression)) {
        node = node.expression;
    }
    return node;
}

// the Java type a call to this accessor is declared to receive here, or undefined when
// the node is not a whole family call. The resolved signature must be the base-tier
// declaration (NUMERIC_BASE_TIER_DECLARATION_FILE) — a venue override of the same name
// is not provable and keeps the local `Object`.
function numericFamilyCallType (printer, node) {
    const call = unwrapNumericExpression (node);
    if (call === undefined || !ts.isCallExpression (call) || !isThisOrSuperCall (call)) {
        return undefined;
    }
    const method = String (call.expression.name.escapedText);
    const javaType = JAVA_NUMERIC_LOCAL_TYPES[method];
    if (javaType === undefined) {
        return undefined;
    }
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (call)?.declaration;
    } catch (e) {
        declaration = undefined;
    }
    if (declaration === undefined) {
        numericDebug (`miss ${method}: unresolved`);
        return undefined;
    }
    const fileName = declaration.getSourceFile?.().fileName;
    if (fileName === undefined) {
        numericDebug (`miss ${method}: no file`);
        return undefined;
    }
    if (!NUMERIC_BASE_TIER_DECLARATION_FILE.test (fileName) && !NUMERIC_LIB_DTS_FILE.test (fileName)) {
        numericDebug (`miss ${method}: ${fileName}`);
        return undefined;
    }
    return javaType;
}

// a whole call to one of the calls whose Java return type this slice retypes
function numericRetypedCallType (printer, node) {
    const call = unwrapNumericExpression (node);
    if (call === undefined || !ts.isCallExpression (call) || !isThisOrSuperCall (call)
        || !JAVA_NUMERIC_RETYPED_CALLS.has (String (call.expression.name.escapedText))) {
        return undefined;
    }
    return numericFamilyCallType (printer, node);
}

// a later write is accepted only when it hands the same box back (the callee is
// already declared with the narrowed type, so no cast is needed) or writes
// null/undefined — never for the primitive `int` family, which cannot hold null
function numericIsSameFamilyWrite (printer, node, javaType) {
    const right = unwrapNumericExpression (node);
    if (right === undefined) {
        return false;
    }
    if (right.kind === ts.SyntaxKind.NullKeyword) {
        return javaType !== 'int';
    }
    if (right.kind === ts.SyntaxKind.Identifier && right.escapedText === 'undefined') {
        return javaType !== 'int';
    }
    return numericFamilyCallType (printer, right) === javaType;
}

function numericReceiverCallIsSafe (method) {
    // an unknown method on the locally-declared number: keep Object
    return NUMERIC_RECEIVER_METHODS.has (method);
}

// is `n` (through parentheses) a direct operand of a `-`? `a - x` prints
// Helpers.subtract(a, x). The (int, int) overload that would return a primitive int is
// commented out at Helpers.java:331 today, but the guard keeps an int-typed operand on
// Object so the overload can never silently rebind it (mirrors the C# subtract-on-int
// rule; census: 0 such call sites in the tree).
function numericIsMinusOperand (n) {
    let node = n;
    let parent = n.parent;
    while (parent !== undefined && ts.isParenthesizedExpression (parent)) {
        node = parent;
        parent = parent.parent;
    }
    return parent !== undefined && ts.isBinaryExpression (parent)
        && parent.operatorToken.kind === ts.SyntaxKind.MinusToken
        && (parent.left === node || parent.right === node);
}

// reject the narrowing when any use needs the local to stay `Object` (or the printer
// would emit a cast / unboxing the narrowed type can't satisfy).
function numericIsSafeToNarrow (printer, declaration, sourceName, javaType, isProFile) {
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const n of uses) {
        if (n === declaration.name) {
            continue;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isVariableDeclaration (parent)) {
            continue; // `const b = x` — b stays Object; a sibling declarator gets its own type
        }
        if (ts.isPropertyAccessExpression (parent)) {
            if (parent.name === n) {
                continue; // `obj.<name>` is a member read, not this local
            }
            if (parent.expression === n
                && ts.isCallExpression (parent.parent) && parent.parent.expression === parent) {
                const method = String (parent.name.escapedText);
                if (!numericReceiverCallIsSafe (method)) {
                    numericDebug (`reject ${sourceName} (receiver .${method})`);
                    return false;
                }
                continue;
            }
            // a plain `x.foo` read on a narrowed number: keep Object
            numericDebug (`reject ${sourceName} (property read .${parent.name.escapedText})`);
            return false;
        }
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            // ++ / -- print natively (an unboxing write), unary +/- likewise
            numericDebug (`reject ${sourceName} (unary operator)`);
            return false;
        }
        if (ts.isSpreadElement (parent)) {
            numericDebug (`reject ${sourceName} (spread)`);
            return false;
        }
        if (ts.isTypeOfExpression (parent)) {
            // `typeof x === 'number'` prints `x instanceof Long` chains
            numericDebug (`reject ${sourceName} (typeof)`);
            return false;
        }
        if (parent.kind === ts.SyntaxKind.AsExpression || parent.kind === ts.SyntaxKind.TypeAssertionExpression) {
            // `x as T` prints a hard cast
            numericDebug (`reject ${sourceName} (as-cast)`);
            return false;
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            // `[x, y] = f()` prints `x = ((List) tmp).get(i)`
            numericDebug (`reject ${sourceName} (array destructuring)`);
            return false;
        }
        if (ts.isConditionalExpression (parent) && parent.condition !== n) {
            // a ternary ARM: javac unboxes when the other arm is primitive
            numericDebug (`reject ${sourceName} (ternary arm)`);
            return false;
        }
        if (ts.isBinaryExpression (parent)) {
            const op = parent.operatorToken.kind;
            if (parent.left === n && op === ts.SyntaxKind.EqualsToken) {
                if (!numericIsSameFamilyWrite (printer, parent.right, javaType)) {
                    numericDebug (`reject ${sourceName} (write of a different value)`);
                    return false;
                }
            } else if (parent.left === n
                && op >= ts.SyntaxKind.FirstCompoundAssignment
                && op <= ts.SyntaxKind.LastCompoundAssignment) {
                // `x += y` prints `x = Helpers.add(x, y)` -> Object into the narrowed local
                numericDebug (`reject ${sourceName} (compound assignment)`);
                return false;
            } else if (javaType === 'int' && parent.operatorToken.kind === ts.SyntaxKind.MinusToken) {
                numericDebug (`reject ${sourceName} (int subtract operand)`);
                return false;
                // (an int operand of `-` prints Helpers.subtract(int, int) the moment the
                // commented-out primitive overload at Helpers.java:331 is re-enabled)
            }
        } else if (javaType === 'int' && numericIsMinusOperand (n)) {
            numericDebug (`reject ${sourceName} (int subtract operand)`);
            return false;
        }
        if (ts.isCallExpression (parent) && parent.arguments.indexOf (n) !== -1) {
            const callee = parent.expression;
            // `Number.isInteger(x)` / `Number.isFinite(x)` print instanceof chains;
            // Number()/String()/Boolean() conversions are unproven
            if (ts.isPropertyAccessExpression (callee)
                && callee.expression.kind === ts.SyntaxKind.Identifier
                && String (callee.expression.escapedText) === 'Number') {
                numericDebug (`reject ${sourceName} (Number.* call)`);
                return false;
            }
            if (ts.isIdentifier (callee)
                && ['Number', 'String', 'Boolean'].includes (String (callee.escapedText))) {
                numericDebug (`reject ${sourceName} (${String (callee.escapedText)} conversion)`);
                return false;
            }
        }
        // a pro core extends the typed WS/REST wrapper class: once an argument
        // expression is Long/Double, the wrapper's typed overload wins Java overload
        // resolution over the `Object...` core and the result shape changes. Keep any
        // local that feeds such a call `Object`.
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            numericDebug (`reject ${sourceName} (feeds inherited async call)`);
            return false;
        }
    }
    return true;
}

function numericLocalTypeForDeclaration (printer, declaration) {
    if (!ts.isIdentifier (declaration.name)) {
        return undefined;
    }
    const javaType = numericFamilyCallType (printer, declaration.initializer);
    if (javaType === undefined) {
        return undefined;
    }
    // scan by the SOURCE name: ReservedKeywordsReplacements renames the printed one
    const sourceName = declaration.name.escapedText;
    const fileName = declaration.getSourceFile ().fileName;
    const isProFile = /[\\/]pro[\\/]/.test (fileName);
    if (!numericIsSafeToNarrow (printer, declaration, sourceName, javaType, isProFile)) {
        return undefined;
    }
    return javaType;
}

// `cond ? <numeric literal> : this.<family>(...)`: the moment the arm's static type is
// Long/Double, javac promotes the conditional to a numeric conditional and UNBOXES the
// arm, so a null return throws where the Object-typed baseline stored null
// (differential-tested: `Long x = null; Object r = cond ? 1 : (Object) x;` yields null,
// `cond ? 1 : x` NPEs).
function numericIsLiteralArm (node) {
    const n = unwrapParens (node);
    if (n === undefined) {
        return false;
    }
    if (n.kind === ts.SyntaxKind.NumericLiteral) {
        return true;
    }
    return ts.isPrefixUnaryExpression (n)
        && (n.operator === ts.SyntaxKind.MinusToken || n.operator === ts.SyntaxKind.PlusToken)
        && n.operand !== undefined && n.operand.kind === ts.SyntaxKind.NumericLiteral;
}

// the printer's printConditionalExpression, rebuilt with the arm casts. Only a
// conditional whose arm is one of the NEWLY retyped calls can change semantics; every
// other conditional rebuilds byte-identically (same three printer calls, same order).
function numericConditionalWithArmCasts (printer, node) {
    const condition = printer.printCondition (node.condition, 0);
    const whenTrue = printer.printNode (node.whenTrue, 0);
    const whenFalse = printer.printNode (node.whenFalse, 0);
    const trueType = numericFamilyCallType (printer, node.whenTrue);
    const falseType = numericFamilyCallType (printer, node.whenFalse);
    const trueRetyped = numericRetypedCallType (printer, node.whenTrue) !== undefined;
    const falseRetyped = numericRetypedCallType (printer, node.whenFalse) !== undefined;
    const wrapTrue = trueRetyped
        && (falseType === undefined ? numericIsLiteralArm (node.whenFalse) : falseType !== trueType);
    const wrapFalse = falseRetyped
        && (trueType === undefined ? numericIsLiteralArm (node.whenTrue) : trueType !== falseType);
    const trueArm = wrapTrue ? `((Object) ${whenTrue})` : whenTrue;
    const falseArm = wrapFalse ? `((Object) ${whenFalse})` : whenFalse;
    if (wrapTrue || wrapFalse) {
        numericDebug (`conditional arm cast (${wrapTrue ? 'true' : ''}${wrapFalse ? ' false' : ''})`);
    }
    return `((${condition})) ? ${trueArm} : ${falseArm}`;
}

// install the numeric slice: (1) the generated method returns, (2) the conditional-arm
// restorations, (3) the locals fed by a whole family call. Chains with section 1-3 on
// the same printer; safe to call more than once.
export function installJavaNumericLocalTypes (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printFunctionType !== 'function' || printer._javaNumericTypesPatched) {
        return;
    }
    // (1) generated return types: parseToInt -> Long, safeNumber/safeNumber2/safeNumberN
    // -> Double. Wrapping printFunctionType() covers the declaration in BaseExchange.java
    // and any other file that declares the same name from ts/src/base/Exchange.ts.
    const upstreamFunctionType = printer.printFunctionType.bind (printer);
    printer.printFunctionType = function (node, ...rest) {
        const own = upstreamFunctionType (node, ...rest);
        if (own === 'Object' && node !== undefined && ts.isMethodDeclaration (node) && node.name !== undefined) {
            const javaType = JAVA_NUMERIC_METHOD_RETURN_TYPES[String (node.name.escapedText)];
            if (javaType !== undefined && NUMERIC_BASE_TIER_DECLARATION_FILE.test (node.getSourceFile ().fileName)) {
                return javaType;
            }
        }
        return own;
    };
    // (2) keep the conditional arms on the baseline's reference-conditional shape
    if (typeof printer.printConditionalExpression === 'function') {
        printer.printConditionalExpression = function (node) {
            return numericConditionalWithArmCasts (printer, node);
        };
    }
    // (3) the declaration line: `<iden>Object <name> = <value>` -> `<iden><type> <name> = <value>`
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = original (node, identation);
        if (node.declarations?.length !== 1) {
            return printed; // multi-declarator lists are left as the printer emitted them
        }
        const declaration = node.declarations[0];
        if (declaration.initializer === undefined) {
            return printed;
        }
        const javaType = numericLocalTypeForDeclaration (printer, declaration);
        if (javaType === undefined) {
            return printed;
        }
        const iden = printer.getIden (identation);
        const marker = `${iden}${printer.VAR_TOKEN} ${printer.printNode (declaration.name)} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed;
        }
        const value = printed.slice (at + marker.length);
        if (!value.startsWith ('this.') && !value.startsWith ('super.')) {
            return printed; // unexpected shape — leave it as the printer emitted it
        }
        numericDebug (`typed ${declaration.name.escapedText} -> ${javaType}`);
        return printed.slice (0, at) + `${iden}${javaType} ${printer.printNode (declaration.name)} = ` + value;
    };
    printer._javaNumericTypesPatched = true;
}
