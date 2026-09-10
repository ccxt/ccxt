// Concrete C# types for generated local variables.
//
// ast-transpiler's C# printer declares every initialised local as `object` unless its own
// getCSharpLocalType() can prove a type (string/bool literals, comparisons, this.extend,
// Object.keys, ...). This module wraps printVariableDeclarationList on the C# printer
// instance and adds the families whose C# value is ALREADY the named type at runtime:
//
//   - hand-written base helpers with a concrete C# signature (cs/ccxt/base/Exchange.*.cs):
//     this.safeString* -> string?, this.safeInteger -> Int64?, this.parse8601 -> Int64?,
//     this.safeFloat* -> double?, this.sortBy/filterBy -> List<object>,
//     this.arrayConcat/aggregate -> List<object>, this.indexBy/groupBy -> Dictionary<string, object>, ...
//   - the collection helpers retyped from `object` to IList<object> in every generated file by
//     build/csharpTranspiler.ts#typeCollectionReturns (the filterBy*SinceLimit family, parseTrades /
//     parseOrders / parseOHLCVs / parseTransactions family, marketIds / marketSymbols /
//     currencyIds / marketCodes / marketsForSymbols, parseMarkets / parseCurrencies)
//   - the sync cores retyped upstream in build/csharpTranspiler.ts (SYNC_TYPED_CORES):
//     market/currency/safeMarket/safeCurrency/safeMarketStructure/safeCurrencyStructure ->
//     Dictionary<string, object>. The runtime box is the market/currency row itself (the
//     plain dictionaries setMarkets builds), so naming the type moves no box.
//   - the ws families (cs/ccxt/ws/Exchange.WsBridge.cs): this.orderBook() / indexedOrderBook()
//     / countedOrderBook() -> ccxt.pro.OrderBook / IndexedOrderBook / CountedOrderBook;
//     `let x: ArrayCache = undefined; ... x = new ArrayCache (limit)` -> ccxt.pro.ArrayCache?;
//     the cached-orderbook reads this.safeValue(this.orderbooks, ...) and this.orderbooks[...]
//     -> ccxt.pro.IOrderBook (the whole map only ever holds orderbook constructors)
//   - Precise.string* statics (string? / bool)
//   - method calls the printer rewrites by method name alone: x.slice(...) prints
//     `slice(x, ...)` (string? — the helper returns null for a null receiver) and
//     x.includes(...) prints `x.Contains(...)` (bool). The other string/array method
//     families the printer already names itself (split, join, toUpperCase/toLowerCase,
//     trim, replace/replaceAll, indexOf, startsWith/endsWith, ...) are typed upstream
//     and never reach this module.
//   - object / array / numeric literals -> Dictionary<string, object> / List<object> / int
//   - `let x: Str = undefined` -> string? (and Int/Num/Dict/List/boolean aliases)
//   - accumulator locals: the join of the initializer's proven type and every later
//     plain `x = ...` write, widened only along box-identical edges — T/T? for string /
//     bool / double / int / Int64 (a reference `?` is erased; a Nullable<T> boxes as T)
//     and List<object> -> IList<object>. A null write widens to the nullable spelling:
//     `let x = '0'; x = this.safeString (...)` declares `string? x`, not `object x`.
//     An unprovable or non-joinable write (Int64? + int, Dictionary + List<object>,
//     add (...), ...) keeps the local `object` exactly as before.
//   - `c ? a : b` arms: identical proven types, T + null -> T? (unifyArms), and a READ of
//     a local whose own declaration this module proves (localIdentifierType) — the C#
//     static type at the read is the declared type, so `cond ? typedLocal : 'literal'`
//     can be declared `string?` instead of object. The arm is the only place a local read
//     is resolved: a bare `x = typedLocal`, an argument, and a later-writes scan of a
//     non-ternary value all still see `object`.
//
// Two initialiser families are deliberately left alone:
//   - `a || b` already prints `isTrue(a) || isTrue(b)`, and the printer's own classifier
//     already declares those locals `bool` — nothing to add here.
//   - `a ?? b`: the base printer has no C# rule for it (it emits `a undefined b`); no `??`
//     site is printed to C# today (the two live ts/src sites are in a method the C# base
//     stubs out and in a helper with no C# counterpart), and typing would need an upstream
//     printer change, not a local-type refinement.
//
// What this module deliberately does NOT type, with the census that proved it:
//   - locals initialised from a PARAMETER (`const x = symbol;`): every generated
//     parameter is printed `object name = null`; the typed-core narrowing to string /
//     Int64? happens in build/csharpTranspiler.ts#typeCoreArgs AFTER printing, and that
//     pass also inserts an `object nameVar = name;` shadow (renaming every body use) for
//     any parameter the body assigns — including the `??=` this printer emits for a
//     literal default. Neither the narrowed type nor the shadow is knowable at print
//     time, so a local copying a parameter keeps `object`. Tree-wide census: 98 copies,
//     14 in narrowable positions, every one unprovable from the AST alone.
//   - `const x: Dict = <expr>` (the 4.4k Dict/List annotations all have an initialiser):
//     the annotation cannot replace an initialiser the printer can only box as `object`
//     (CS0266, no implicit object -> Dictionary conversion) and is redundant when the
//     initialiser is already provable — census: 0 additional locals.
//
//   - `+` chains whose LEFT operand is provably a string (`this.id` — a `string` property
//     on the hand-written base — a string literal, a nested `+` of the same, or an
//     `as string` cast): those print `add(<string>, ...)`, which resolves to
//     add(string, string) / add(string, object), both declared `string` and never null,
//     so the error-message builds (`feedback = this.id + ' ' + body`) can be `string`
//   - `x as string` / `<string>x` -> string (`((string)x)` is the printed cast)
//   - `string x = <non-null>; ... x = <nullable string>;` widens to string? (the box is a
//     string on both paths; getExtendedStarkAmount / createOrderAppendix / hexToDecimalString
//     are the motivating cases — build/csharp-string-returns.js needs the returned local
//     declared, and a nullable write used to keep the whole local `object`)
//
// Naming the type never changes the runtime value inside the box, so behaviour is identical
// EXCEPT where C# resolves something at compile time against the declared type. Those cases
// are rejected by csharpLocalIsSafeToRetype():
//   - a later assignment whose value has another (or an unprovable) type
//   - `ref` sinks: -x / +x print prefixUnaryNeg(ref x) / prefixUnaryPlus(ref x); x++ / x--
//     print postFixIncrement(ref x) / postFixDecrement(ref x). All four helpers in
//     Exchange.TranspileHelpers.cs carry exact (ref int) / (ref Int64) / (ref double)
//     twins beside the (ref object) version, with the same unchecked arithmetic and the
//     same return value, so an int / Int64 / double local binds by ref identity and is
//     accepted. Nullable (Int64?) and string locals have no twin and stay `object` (the
//     object overload throws on null and returns null for a string, which a lifted twin
//     could not reproduce); an int / Int64 prefix result that is itself an operand of
//     `-` also stays `object`, because its numeric static type would move the call from
//     subtract(object, object) to subtract(int, int) (Int32 box, not Int64)
//   - compound assignment and spread. `[ x, params ] = this.helper (...)` is accepted for
//     the audited request builders (DESTRUCTURED_DICT_HELPERS) because the printer wrapper
//     rewrites the emitted element load with a cast back to the proven type
//   - LEFT operands of `+` / `+=` when the type is `string?`, or any string type with a
//     non-provably-string right operand: the left operand's static type picks the add
//     overload. add(object,object) returns null for a null left where add(string,*)
//     returns the right operand, and add(object,object)'s `(string)b` cast on a
//     non-string right throws InvalidCastException where add(string,object) calls
//     b?.ToString() — so a `string?` local (which can hold null) and any right operand
//     that is not a proven non-null string stay `object`. A non-nullable `string` local
//     is accepted on the left when the right operand is a proven non-null string: it
//     can never be null (its initializer and every write are proven non-null strings)
//     and add(string,string) is identical to add(object,object) for every input.
//     RIGHT operands are always fine: no add(object,string) overload exists, and
//     add(string,string) / add(string,object) are identical for every input
//     (Exchange.TranspileHelpers.cs). Operands of `-` when the
//     type is int/Int64 (subtract(int,int) returns an Int32 box, not Int64)
//   - typeof on a non-nullable value type (`x is int` is CS0183, an error under
//     TreatWarningsAsErrors)
//   - a local/parameter in the same method literally named like a C# type token
//   - on a non-list local, the methods whose print hard-casts the receiver to IList<object>
//     (x.push / x.reverse / x.join / x.shift / x.pop — `((IList<object>)x)...`), and
//     `const [a, b] = x` destructuring (prints `var abVariable = x;` then casts the
//     synthetic var back to IList<object>)
//
// Reassignment dataflow (csharpTypeOfValue takes a resolution context): a later `x = <value>`
// is accepted when <value> is
//   - a read of another local in the same method that is ITSELF emitted with a concrete type —
//     the full csharpLocalType decision for that declaration is recomputed (a local that stays
//     `object` proves nothing), with a cycle stack (`let a = b; let b = a;` resolves to
//     undefined -> both stay `object`) and a depth cap
//   - a ternary whose arms unify to one type (the same rule as for a ternary initializer),
//     including arms that are such locals or known helper calls
//   - a call of a known helper as before
// `const b = a;` propagates the same way (a is provably a concrete-type local -> b takes its
// type). Any doubt (shadowing binding, parameter, read before the declaration, multi-declarator
// list, non-emitted `object` declaration) rejects.
//
// Helpers whose C# signature is `object` (safeValue apart from the
// this.orderbooks read below, safeNumber,
// market, currency, getValue apart from this.orderbooks, add, every parse*, anything
// awaited, ...) stay `object`
// on purpose: their box holds a value this module cannot name without retyping the base.
// The safeDict/safeList family used to be listed here too — their generated C# returns are
// now Dictionary<string, object> / List<object> (retyped by
// csharpTranspiler.ts#retypeSafeCollectionHelpers, because the TS annotations cannot reach
// the printer), so they classify like the hand-written helpers.
//
// safeSymbol / safeCurrencyCode / safeMarket are retyped by installCsharpMethodReturnTypes
// below instead: the pinned ast-transpiler prints `object` for every non-void/non-Promise
// return annotation except `: boolean` (ccxt/ast-transpiler#77), so their generated
// signatures erased a type the value already has:
//   - safeSymbol / safeCurrencyCode -> `string?`   (TS: `string` / `Str = string|undefined`)
//   - safeMarket                    -> `Dictionary<string, object>`
//     (TS: `MarketInterface`; both the markets_by_id element and safeMarketStructure's
//      result are Dictionary<string, object> boxes at runtime, and a MarketInterface
//      struct would change the box, so the dictionary is the only lossless spelling)
// The retype wraps printFunctionType() — declaration, including every exchange override —
// and printReturnStatement() (unboxes through `object`, same shape as the boolean rule).
// When the pin moves to a fork commit that honours these annotations, the shim and the
// fork's boolean rule can be dropped together.
//
// Element-access initialisers (`const x = recv[key]`) print `getValue(recv, key)` and stay
// `object` unless the receiver's runtime ELEMENTS are provably strings: a local whose only
// write is `Object.keys (...)`, a `.split (...)` call or an array literal of string
// literals — the C# those print (`new List<object>(((IDictionary<string,object>)x).Keys)`,
// `((string)x).Split (...).ToList<object>()`, `new List<object> { "a" }`) holds nothing but
// string boxes — with no other write, mutating use, alias or escaping call anywhere in the
// method. There the declaration becomes `string?` and the value gets the `(string)` cast
// the compiler needs, `((string)getValue (recv, key))`, which unboxes exactly the string
// the call already returned (or null off the end of the list / for a null receiver).
//
// `await this.<m>(...)` locals are typed from the callee's C# `Task<T>` signature:
//   - CSHARP_LOCAL_AWAIT_RETURN_TYPES below (hand-written base methods)
//   - the generated implicit-api wrappers cs/ccxt/api/<id>.cs, read lazily (see
//     awaitedApiReturnTypes) — their `Task<T>` is the exact static type of the awaited
//     call, so a local declared T can never disagree with its callee
// Anything else an await can return (a typed core, which the transpiler funnels through
// its From* helper, or a method whose C# return is still `object`) stays `object`.
//
// `[a, b] = this.handleM (...)` and `const [a, b] = this.handleM (...)` print through the
// printer's destructuring paths as a `var abVariable = <call>;` holder plus one casted read
// per element, `a = ((IList<object>)abVariable)[0];`. The holder is the tuple the call
// returned and the very next line reads it through that `((IList<object>)abVariable)` cast,
// so the holder can be declared `IList<object>` with the same cast, hoisted one line up: the
// value stored, every failure (a null / non-list box throws at the hoisted cast, exactly
// where the first read would have thrown it) and every later read are identical — the reads
// stay printed as they were. See retypeDestructuringTemp(); 1,900+ handle* call sites (both
// shapes) move from `var` (an object box) to a real `IList<object>` declaration.
//
// The destructured ELEMENTS keep the printer's shape: the `((IList<object>)X)[i]` read is
// untyped, and typing an element would need a cast on the read whose spelling agrees with
// the target's declaration. The TS checker does type the elements from the call's tuple
// return type (`[Str, Dict]` -> Str, `[string, Dict]` -> string, the `[T, Dict]` overload ->
// T), but a cast is only provable when the method's own C# body guarantees that runtime box
// on EVERY return path, and the busy methods do not: handleOptionAndParams/2 element 0 is
// the user's params value or `defaultValue` (any), handleMarketTypeAndParams reads
// `getValue (market, 'type')` / `defaultValue` on two of six paths, handleMarginModeAndParams
// / handleSubTypeAndParams / handleUntilOption thread caller values through. Only element 0
// of handleParamString* / handleParamInteger* / handleParamBool* / handleNetworkCodeAndParams
// / handlePostOnly / handleHfAndParams / handleTriggerDirectionAndParams is a concrete-typed
// local on every path (~161 call sites) — a candidate for a follow-up, kept out of this
// change.
// The generated non-async string-returning methods (parse*Status and
// friends) no longer belong to that list: build/csharp-string-returns.js retypes their
// signatures, and the same table is merged into CSHARP_LOCAL_THIS_RETURN_TYPES below.
//
// Why not flip the printer's INFER_VAR_TYPE: it only fires on the `= undefined` path and
// takes the TypeScript declared type at face value, so `let x: Dict = undefined; x =
// this.safeDict (...)` would become `Dictionary<string, object> x` in front of an `object`
// assignment. Everything here is proven from the C# side (the helper's C# signature) plus
// a scan of every later write, never from the TypeScript annotation alone.
//
// IMPORTANT: scan the AST with `declaration.name.escapedText`, print with
// `printNode(declaration.name)` — ReservedKeywordsReplacements renames `type` -> `typeVar`,
// `params` -> `parameters`, so a printed-name scan silently matches nothing.

import ts from 'typescript6';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSHARP_STRING_RETURN_METHODS } from './csharp-string-returns.js';

// this.<name>(...) -> C# type. Source of truth: the hand-written cs/ccxt/base/*.cs
// signatures (the generated Exchange.BaseMethods.cs must NOT redeclare any of these as
// `object`; build/csharp-local-types is checked against that in the PR).
export const CSHARP_LOCAL_THIS_RETURN_TYPES = {
    // Exchange.SafeMethods.cs
    'safeString': 'string?',
    'safeString2': 'string?',
    'safeStringN': 'string?',
    'safeStringLower': 'string?',
    'safeStringLower2': 'string?',
    'safeStringLowerN': 'string?',
    'safeStringUpper': 'string?',
    'safeStringUpper2': 'string?',
    'safeStringUpperN': 'string?',
    'safeInteger': 'Int64?',
    'safeInteger2': 'Int64?',
    'safeIntegerN': 'Int64?',
    'safeIntegerProduct': 'Int64?',
    'safeFloat': 'double?',
    'safeFloat2': 'double?',
    'safeFloatN': 'double?',
    // Exchange.BaseMethods.cs — the market/currency builders, retyped to the concrete
    // dictionary type upstream (SYNC_TYPED_CORES in build/csharpTranspiler.ts rewrites the
    // base declaration and every venue override). The box holds the market/currency row
    // itself, so naming the type moves no value.
    'safeMarketStructure': 'Dictionary<string, object>',
    'safeCurrencyStructure': 'Dictionary<string, object>',
    'safeMarket': 'Dictionary<string, object>',
    'safeCurrency': 'Dictionary<string, object>',
    'market': 'Dictionary<string, object>',
    'currency': 'Dictionary<string, object>',
    // Exchange.BaseMethods.cs — generated `bool?` (the printer honours a `: boolean | undefined`
    // return annotation; the nullable spelling is what keeps a missing key null, not false)
    'safeBool': 'bool?',
    'safeBool2': 'bool?',
    'safeBoolN': 'bool?',
    // Exchange.BaseMethods.cs, retyped by installCsharpMethodReturnTypes() below — the
    // printer erased every non-boolean annotation to `object`
    'safeSymbol': 'string?',
    'safeCurrencyCode': 'string?',
    'safeMarket': 'Dictionary<string, object>',
    // Exchange.BaseMethods.cs — generated, retyped from `object` by
    // csharpTranspiler.ts#retypeSafeCollectionHelpers (the TS return annotations cannot
    // reach the C# printer). safeDict* hands out the INTERFACE: the found value only
    // passed the method's own isDictionary guard, which accepts any IDictionary<string,
    // object> (this port stores ConcurrentDictionary<string, object> values in options
    // and caches for real, and the concrete-class cast throws on those). safeList* keeps
    // List<object>: any value its List<> guard passes that is not a List<object> already
    // failed the consumer-side IList<object> casts the port emits. The fallback hands the
    // caller's default back with `as` (typed Dictionary<any> / any[] upstream), so a
    // non-matching default drops to null — the SafeString convention.
    'safeDict': 'IDictionary<string, object>',
    'safeDict2': 'IDictionary<string, object>',
    'safeDictN': 'IDictionary<string, object>',
    'safeList': 'List<object>',
    'safeList2': 'List<object>',
    'safeListN': 'List<object>',
    // Exchange.Time.cs (iso8601/ymd* are declared `string` but return null for a null input)
    'parse8601': 'Int64?',
    'iso8601': 'string?',
    'ymdhms': 'string?',
    'yyyymmdd': 'string?',
    'yymmdd': 'string?',
    'microseconds': 'Int64',
    // Exchange.cs / Exchange.BaseMethods.cs — numeric helpers whose return type was
    // `object` while every path already produced the named box (build/csharp-method-returns.js
    // declares the same signatures; nonce/milliseconds are non-nullable Int64)
    'milliseconds': 'Int64',
    'nonce': 'Int64',
    'parseToInt': 'Int64?',
    'parseNumber': 'double?',
    'safeNumber': 'double?',
    'safeNumber2': 'double?',
    'safeNumberN': 'double?',
    'safeNumberOmitZero': 'double?',
    // Exchange.cs
    'seconds': 'Int64',
    'parseTimeframe': 'int',
    'isEmpty': 'bool',
    // Exchange.Number.cs (numberToString is declared `string` but returns null for null)
    'numberToString': 'string?',
    'decimalToPrecision': 'string',
    'precisionFromString': 'int',
    // Exchange.Encode.cs
    'urlencode': 'string',
    'urlencodeWithArrayRepeat': 'string',
    'urlencodeNested': 'string',
    'rawencode': 'string',
    'intToBase16': 'string',
    'stringToBase64': 'string',
    'binaryToBase64': 'string',
    'binaryToString': 'string',
    'encode': 'string?', // `(string)data` pass-through: null in, null out
    'decode': 'string?',
    'urlencodeBase64': 'string', // Base64urlEncode: throws on null, non-null string otherwise
    // Exchange.Crypto.cs (hmac mirrors the printer's own CSHARP_THIS_RETURN_TYPES entry;
    // jwt builds `header.payload.signature` and returns non-null)
    'hmac': 'string',
    'jwt': 'string',
    // Exchange.String.cs
    'uuid': 'string',
    'uuid16': 'string',
    'uuid22': 'string',
    'capitalize': 'string',
    // Exchange.Functions.cs / Exchange.Generic.cs
    // every omit overload returns a copied dictionary (a non-dictionary input throws on
    // its cast, exactly like the scalar cases already did)
    'omit': 'Dictionary<string, object>',
    'keysort': 'Dictionary<string, object>',
    'sortBy': 'List<object>',
    'sortBy2': 'List<object>',
    'filterBy': 'List<object>',
    'extractParams': 'List<object>',
    'toArray': 'IList<object>',
    // Exchange.Generic.cs collection helpers — indexBy/groupBy are already named by the
    // printer's own this.<name>() table; listing them here extends the same proof to
    // conditional initialisers and `let x = undefined` later-write shapes, gated by the
    // csharpLocalIsSafeToRetype() scan exactly like every other entry
    'indexBy': 'Dictionary<string, object>',
    'indexBySafe': 'Dictionary<string, object>',
    'groupBy': 'Dictionary<string, object>',
    // Exchange.Functions.cs — every path hands back the fresh List<object> or null
    'arrayConcat': 'List<object>',
    'aggregate': 'List<object>',
    // Collection helpers retyped by build/csharpTranspiler.ts#typeCollectionReturns — every
    // return site yields the list/null box (see the return-site census in that table), and
    // every generated declaration now carries the real type (parseCurrencies is the
    // code-keyed dictionary)
    'filterByKey': 'IList<object>',
    'filterBySymbol': 'IList<object>',
    'filterByLimit': 'IList<object>',
    'filterBySinceLimit': 'IList<object>',
    'filterByValueSinceLimit': 'IList<object>',
    'filterBySymbolSinceLimit': 'IList<object>',
    'filterByCurrencySinceLimit': 'IList<object>',
    'filterBySymbolsSinceLimit': 'IList<object>',
    'filterByOutcomeSinceLimit': 'IList<object>',
    'parseTrades': 'IList<object>',
    'parseTradesHelper': 'IList<object>',
    'parseOrders': 'IList<object>',
    'parseOHLCVs': 'IList<object>',
    'parseTransactions': 'IList<object>',
    'parseLedger': 'IList<object>',
    'parseLiquidations': 'IList<object>',
    'marketIds': 'IList<object>',
    'currencyIds': 'IList<object>',
    'marketCodes': 'IList<object>',
    'marketSymbols': 'IList<object>',
    'marketsForSymbols': 'IList<object>',
    'parseMarkets': 'IList<object>',
    // parseCurrencies accumulates a code-keyed Dictionary and returns it (base + bitstamp
    // override), so it is retyped to the dict, not the list
    'parseCurrencies': 'Dictionary<string, object>',
    'isArray': 'bool',
    'inArray': 'bool',
    'isJsonEncodedObject': 'bool',
    // Exchange.Functions.cs (JSON.stringify; returns null for a null input)
    'json': 'string',
    // Exchange.Misc.cs — retyped object -> string in this PR: every return path yields the
    // path string (a null path throws on the dictionary branch, never returns null)
    'implodeParams': 'string',
    // generated Exchange.BaseMethods.cs — the signature is rewritten object -> string in
    // build/csharpTranspiler.ts (next to the setMarketsFromExchange replace); it forwards
    // implodeParams, so it returns the same string
    'implodeHostname': 'string',
    // Exchange.Crypto.cs — hmac/jwt/rsa/eddsa return string unconditionally. `hash` is
    // deliberately ABSENT: digest "binary" returns Byte[] (hyperliquid/kraken/polymarket
    // sign() call it), so its box is not always a string.
    'hmac': 'string',
    'jwt': 'string',
    'rsa': 'string',
    'eddsa': 'string',
    'crc32': 'Int64',
    // Exchange.cs
    'totp': 'string',
    // cs/ccxt/ws/Exchange.WsBridge.cs — the ws constructors; their body is
    // `return new ccxt.pro.X(...)`, so the returned box always holds the named type
    'orderBook': 'ccxt.pro.OrderBook',
    'indexedOrderBook': 'ccxt.pro.IndexedOrderBook',
    'countedOrderBook': 'ccxt.pro.CountedOrderBook',
};

// bare `name(...)` calls (a plain Identifier callee, no `this.`): C# resolves them to the
// same BaseExchange instance method, so the return types above apply unchanged. Only
// helpers imported as free functions in ts/src and called bare in generated bodies are
// listed — a name that any class could declare itself must NOT be added blindly.
export const CSHARP_LOCAL_BARE_RETURN_TYPES = {
    'jwt': 'string',
    'totp': 'string',
    'eddsa': 'string',
    'rsa': 'string',
};

// The generated non-async string-returning methods: build/csharp-string-returns.js emits
// `string` / `string?` on their C# signatures (they were `object`), so a local fed by one
// of them is exactly that type. Hand-curated entries above win on a collision.
for (const [ name, type ] of Object.entries (CSHARP_STRING_RETURN_METHODS)) {
    if (CSHARP_LOCAL_THIS_RETURN_TYPES[name] === undefined) {
        CSHARP_LOCAL_THIS_RETURN_TYPES[name] = type;
    }
}

// <Identifier>.<name>(...) -> C# type, keyed on the full callee text
export const CSHARP_LOCAL_STATIC_RETURN_TYPES = {
    // Exchange.Precise.cs — every string* arithmetic helper returns null for a null input
    'Precise.stringMul': 'string?',
    'Precise.stringDiv': 'string?',
    'Precise.stringSub': 'string?',
    'Precise.stringAdd': 'string?',
    'Precise.stringOr': 'string?',
    'Precise.stringMax': 'string?',
    'Precise.stringMin': 'string?',
    'Precise.stringAbs': 'string?',
    'Precise.stringNeg': 'string?',
    'Precise.stringMod': 'string?',
    'Precise.stringGt': 'bool',
    'Precise.stringGe': 'bool',
    'Precise.stringLt': 'bool',
    'Precise.stringLe': 'bool',
    'Precise.stringEq': 'bool',
    'Precise.stringEquals': 'bool',
    // Math builtins whose printed C# is provably `double` (ast-transpiler
    // printOutOfOrderCallExpressionIfAny): Math.pow(a, b) -> Math.Pow(Convert.ToDouble(a),
    // Convert.ToDouble(b)), Math.abs(x) -> Math.Abs(Convert.ToDouble(x)). Call sites today:
    // Math.pow — apex.ts / grvt.ts; Math.abs — ts/src/test/Exchange/base/test.sharedMethods.ts.
    // There is deliberately NO entry for Math.min / Math.max: they print as the mathMin /
    // mathMax helpers, whose hand-written signature returns the ORIGINAL operand as `object`
    // (and null when either argument is null), so no single C# type can name the box — the
    // value would not "already have the named type at runtime" (see the header).
    'Math.pow': 'double',
    'Math.abs': 'double',
};

// <receiver>.<name>(...) -> C# type, keyed on the method name alone: the printer rewrites
// these calls by name whatever the receiver is (csharpTranspiler.ts printXCall) and the
// printed expression's C# value is already the named type. Only the families the printer's
// own CSHARP_METHOD_RETURN_TYPES does NOT name are listed here — the rest (split, join,
// toUpperCase, toLowerCase, trim, replace, replaceAll, indexOf, startsWith, endsWith, ...)
// are typed upstream before this table is ever consulted.
export const CSHARP_LOCAL_METHOD_RETURN_TYPES = {
    // printSliceCall -> `slice(name, idx1, idx2)`: the hand-written helper casts the
    // receiver to string and returns null for a null receiver (string? box)
    'slice': 'string?',
    // printIncludesCall -> `name.Contains(arg)`: string.Contains / IList.Contains -> bool
    'includes': 'bool',
};

// hand-written C# classes whose `new X(...)` box is exactly ccxt.pro.X. A direct `new`
// initialiser is already declared `var` by the C# printer; this family matters when the
// constructor is a LATER write (`let x = undefined; ... x = new ArrayCache (limit)`) or a
// ternary arm, which csharpTypeOfValue() must prove like any other write.
const CSHARP_LOCAL_NEW_TYPES = {
    'BaseCache': 'ccxt.pro.BaseCache',
    'ArrayCache': 'ccxt.pro.ArrayCache',
    'ArrayCacheByTimestamp': 'ccxt.pro.ArrayCacheByTimestamp',
    'ArrayCacheBySymbolById': 'ccxt.pro.ArrayCacheBySymbolById',
    'ArrayCacheBySymbolBySide': 'ccxt.pro.ArrayCacheBySymbolBySide',
    'ArrayCacheByOutcomeById': 'ccxt.pro.ArrayCacheByOutcomeById',
    'OrderBook': 'ccxt.pro.OrderBook',
    'IndexedOrderBook': 'ccxt.pro.IndexedOrderBook',
    'CountedOrderBook': 'ccxt.pro.CountedOrderBook',
};

// this.<name>(...) awaited -> the T of the callee's C# `Task<T>`, i.e. the type of the
// value `await` unwraps. Only methods whose C# signature this module can vouch for are
// listed; a name that is not here and is not a generated api wrapper stays `object`.
export const CSHARP_LOCAL_AWAIT_RETURN_TYPES = {
    // ts/src/base/Exchange.ts `async isUTAEnabled (params = {}): Promise<boolean>` and the
    // kucoin override; build/csharp-worker.ts prints `Task<bool>` for the annotation
    // (the stub returns a literal false), so the awaited value is a plain C# bool.
    'isUTAEnabled': 'bool',
};

// The generated implicit-api wrappers (cs/ccxt/api/<id>.cs + cs/ccxt/api/prediction/<id>.cs)
// declare one `public async Task<T> <name> (object parameters = null)` per endpoint. Those
// signatures are read from disk — the same files the C# compiler reads — so typing an
// awaited local with the T found here is consistent with the callee BY CONSTRUCTION.
// Multi-shape endpoints (Task<object>) are skipped, and a missing file (tests, ws tier,
// a hand-written venue) simply leaves the local `object`.
const CSHARP_API_METHOD = /^\s*public async Task<(.+)> (\w+) \(object parameters = null\)/;
const CSHARP_API_FOLDER = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt', 'api');
const awaitedApiTables = new Map ();

function awaitedApiReturnTypes (exchange) {
    if (awaitedApiTables.has (exchange)) {
        return awaitedApiTables.get (exchange);
    }
    let table;
    const candidates = [ path.join (CSHARP_API_FOLDER, exchange + '.cs'), path.join (CSHARP_API_FOLDER, 'prediction', exchange + '.cs') ];
    for (const file of candidates) {
        let content;
        try {
            content = fs.readFileSync (file, 'utf8');
        } catch (e) {
            continue; // not a generated venue — never fatal
        }
        table = new Map ();
        for (const line of content.split ('\n')) {
            const match = CSHARP_API_METHOD.exec (line);
            if (match && match[1] !== 'object') {
                table.set (match[2], match[1]);
            }
        }
        break;
    }
    awaitedApiTables.set (exchange, table);
    return table;
}

// the source file's basename is the exchange id: ts/src/kucoin.ts -> kucoin,
// ts/src/prediction/polymarket.ts -> polymarket. The ws tier reuses the REST id because
// its C# class derives from the REST venue and inherits the wrapper signatures.
function sourceExchangeId (node) {
    const fileName = node.getSourceFile?.()?.fileName ?? '';
    const base = fileName.split (/[\\/]/).pop () ?? '';
    return base.replace (/\.(ts|js)$/, '');
}

// the C# type of `await this.<name>(...)`, or undefined when the callee's Task<T> cannot
// be proven from a C# signature (typed cores are funneled through From* helpers by
// build/csharpTranspiler.ts, so their locals must stay `object`)
export function csharpAwaitedThisCallType (csharp, node) {
    const call = node.expression;
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = call.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const methodName = callee.name?.escapedText;
    if (methodName === undefined) {
        return undefined;
    }
    const registered = CSHARP_LOCAL_AWAIT_RETURN_TYPES[methodName];
    if (registered !== undefined) {
        return registered;
    }
    const table = awaitedApiReturnTypes (sourceExchangeId (node));
    return table?.get (methodName);
}

// this.<member> -> C# type. Only members whose hand-written base declaration already IS
// that type are listed; checked against cs/ccxt/**/*.cs — no generated class redeclares
// these members (search `id { get; set; }` / `string id`).
export const CSHARP_LOCAL_THIS_MEMBER_TYPES = {
    // Exchange.Options.cs: `public string id { get; set; } = "Exchange";`
    'id': 'string',
};

// `let x: <alias> = undefined` -> nullable C# type (the null initialiser forces `?`)
// Values are ts/src/base/types.ts aliases; each mapping names the type the C# box ALREADY
// holds at runtime, and the write scan below still has to accept every later assignment
// before the annotation is applied (a `let market: Market` still assigned this.market(...),
// which returns `object`, stays object). Census on master: these added entries on their own
// move no output line — the locals they cover either take the same type from the
// later-writes path or keep writes (object returns) the scan rejects; they are the correct
// spelling to have in place for when a producer's C# signature carries the type.
const CSHARP_LOCAL_ANNOTATION_TYPES = {
    'Str': 'string?',
    'string': 'string?',
    'Int': 'Int64?',
    'Num': 'double?',
    'number': 'double?',
    'Bool': 'bool?',
    'boolean': 'bool?',
    'Dict': 'Dictionary<string, object>',
    'List': 'List<object>',
    // NullableDict / NullableList are Dict / List | undefined
    'NullableDict': 'Dictionary<string, object>',
    'NullableList': 'List<object>',
    // Strings is string[] | undefined: every array this printer builds is a List<object>
    // (`new List<object> { ... }`, `split(...).ToList<object>()`), never List<string>,
    // so the invariant List<string> spelling would reject every write
    'Strings': 'List<object>',
    // string-literal unions (OrderSide includes `| string`, SubType/MarketType are closed)
    'MarketType': 'string?',
    'SubType': 'string?',
    'OrderSide': 'string?',
    'OrderType': 'string?',
    // Market / Currency are dictionary shapes. IDictionary<string, object> (not the
    // Dictionary instantiation) so a write of either spelling is accepted; on master
    // every write is this.market(...) / this.currency(...), which still return object,
    // so the annotation stays inert until those helpers carry a dictionary signature
    'Market': 'IDictionary<string, object>',
    'Currency': 'IDictionary<string, object>',
};

// identifiers that would stop being a type name if a local/parameter in the same method
// carried them (`string`/`object` are already renamed by ReservedKeywordsReplacements)
const CSHARP_TYPE_TOKENS = [ 'string', 'bool', 'int', 'long', 'Int64', 'double', 'object', 'List', 'IList', 'Dictionary', 'var' ];

const STRING_TYPES = [ 'string', 'string?' ];
const NON_NULLABLE_VALUE_TYPES = [ 'int', 'bool', 'Int64', 'double' ];
const INT_TYPES = [ 'int', 'Int64' ];
const DOUBLE_TYPES = [ 'double' ];
const LIST_TYPES = [ 'List<object>', 'IList<object>' ];
// the concrete ws orderbooks; all implement ccxt.pro.IOrderBook (cs/ccxt/ws/OrderBook.cs)
const ORDERBOOK_IMPL_TYPES = [ 'ccxt.pro.OrderBook', 'ccxt.pro.IndexedOrderBook', 'ccxt.pro.CountedOrderBook' ];

// every JS assignment operator (ts.SyntaxKind has no First/LastAssignmentOperator in v6)
const ASSIGNMENT_OPERATORS = [
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskAsteriskEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
    ts.SyntaxKind.LessThanLessThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
    ts.SyntaxKind.AmpersandEqualsToken,
    ts.SyntaxKind.BarEqualsToken,
    ts.SyntaxKind.CaretEqualsToken,
    ts.SyntaxKind.AmpersandAmpersandEqualsToken,
    ts.SyntaxKind.BarBarEqualsToken,
    ts.SyntaxKind.QuestionQuestionEqualsToken,
];

// list methods that rewrite the receiver in place — `x.concat (...)` / `.slice (...)` return
// a new list and stay allowed
const LIST_MUTATING_METHODS = [ 'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin' ];

function isNullable (type) {
    return type.endsWith ('?') || type.startsWith ('Dictionary<') || type.startsWith ('IDictionary<') || type.startsWith ('List<') || type.startsWith ('IList<');
}

// the nullable spelling of a C# type (a `= null` / `= undefined` declaration needs one)
function nullableOf (type) {
    return isNullable (type) ? type : type + '?';
}

// can a value of `source` be stored in a local declared `target` WITHOUT changing the
// runtime box? Exact match, null into a nullable/reference type, T into T?, List into IList.
function assignable (target, source) {
    if (source === undefined) {
        return false;
    }
    if (source === target) {
        return true;
    }
    if (source === 'null') {
        return isNullable (target);
    }
    if (target.endsWith ('?') && source === target.slice (0, -1)) {
        return true;
    }
    if (target === 'IList<object>' && source === 'List<object>') {
        return true;
    }
    // a concrete ws orderbook IS an IOrderBook (the classes implement the interface; the
    // box holds the same object), so a constructor write into an IOrderBook local is safe
    if (target === 'ccxt.pro.IOrderBook' && ORDERBOOK_IMPL_TYPES.includes (source)) {
        return true;
    }
    // Dictionary implements IDictionary — an implicit reference conversion, so the box
    // (and therefore the runtime value) is unchanged
    if (target === 'IDictionary<string, object>' && source === 'Dictionary<string, object>') {
        return true;
    }
    return false;
}

// box-identical widening edges for joinTypes: declaring `to` instead of `from` leaves
// every runtime value in the same box (nullability of a reference type is erased; a
// Nullable<T> holding a value boxes as T; IList<object> only widens the static view of
// the same List box). The left side of each pair is the narrower spelling.
const WIDENING_EDGES = [
    [ 'string', 'string?' ],
    [ 'bool', 'bool?' ],
    [ 'double', 'double?' ],
    [ 'int', 'int?' ],
    [ 'Int64', 'Int64?' ],
    [ 'List<object>', 'IList<object>' ],
];

// the join of two proven types along WIDENING_EDGES, or undefined when they cannot both
// live in one declaration without changing a box (`Int64?` + `int`, `Dictionary` + `List`,
// two different base types, ...). 'null' is neutral here; nullability is applied by
// typeFromValueOrWrites once every contribution has been joined.
function joinTypes (a, b) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return a;
    }
    for (const [ from, to ] of WIDENING_EDGES) {
        if ((a === from && b === to) || (a === to && b === from)) {
            return to;
        }
    }
    return undefined;
}

// the type of `c ? a : b` from its two arms: identical types, or T + null -> T? for a
// reference/nullable T. Anything else (including two distinct provable types) is not
// provable — the C# ternary needs both arms convertible to one type.
function unifyArms (a, b) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return (a === 'null') ? undefined : a;
    }
    if (a === 'null' || b === 'null') {
        const other = (a === 'null') ? b : a;
        if (isNullable (other)) {
            return other;
        }
        // `cond ? 5 : null` has no natural C# type; the nullable declaration provides one
        // (the boxed runtime value is the same Int64/bool/... or null either way)
        return other + '?';
    }
    if (a.endsWith ('?') && b === a.slice (0, -1)) {
        return a;
    }
    if (b.endsWith ('?') && a === b.slice (0, -1)) {
        return b;
    }
    return undefined;
}

// integer literal that the C# compiler also types `int` (fits Int32); decimals/exponents
// are `double`; anything else (uint/long range, hex, bigint) is left alone
function numericLiteralType (text) {
    if (/^\d+$/.test (text)) {
        return (Number (text) <= 2147483647) ? 'int' : undefined;
    }
    if (/^\d+\.\d+$/.test (text) || /^\d+(\.\d+)?e[+-]?\d+$/i.test (text)) {
        return 'double';
    }
    return undefined;
}

// `this.safeValue(this.orderbooks, symbol)` and `this.orderbooks[symbol]` (printed
// `getValue(this.orderbooks, symbol)`) are the ws reads of the cached orderbook for a
// symbol. The ws transpile rewrites both calls to getOrderBook / safeOrderBook in
// cs/ccxt/ws/Exchange.WsBridge.cs, which return ccxt.pro.IOrderBook. Every value stored
// into this.orderbooks is a ccxt.pro orderbook (this.orderBook() / indexedOrderBook() /
// countedOrderBook(), or a value read back from the same map), so the box always holds one.
function orderbookMapReadType (initializer) {
    const key = initializer.arguments?.[0];
    if (key?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return undefined;
    }
    if (key.expression?.kind !== ts.SyntaxKind.ThisKeyword || key.name?.escapedText !== 'orderbooks') {
        return undefined;
    }
    return 'ccxt.pro.IOrderBook';
}

function callReturnType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    // bare `jwt(...)` / `eddsa(...)`: a plain Identifier callee still binds the BaseExchange
    // instance helper in C# (implicit `this.`), so its return type applies. Names that are
    // not proven instance helpers stay out of the table.
    if (callee?.kind === ts.SyntaxKind.Identifier) {
        // bare `getValue (this.orderbooks, symbol)` — element access on the orderbook map
        if (callee.escapedText === 'getValue') {
            const read = orderbookMapReadType (initializer);
            if (read !== undefined) {
                return read;
            }
        }
        return CSHARP_LOCAL_BARE_RETURN_TYPES[callee.escapedText];
    }
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return undefined;
    }
    const methodName = callee.name?.escapedText;
    const target = callee.expression;
    if (target?.kind === ts.SyntaxKind.ThisKeyword) {
        if (methodName === 'safeValue') {
            // `this.safeValue (this.orderbooks, symbol[, default])` — same map read, with default
            const read = orderbookMapReadType (initializer);
            if (read !== undefined) {
                return read;
            }
        }
        return CSHARP_LOCAL_THIS_RETURN_TYPES[methodName];
    }
    if (target?.kind === ts.SyntaxKind.Identifier) {
        const staticType = CSHARP_LOCAL_STATIC_RETURN_TYPES[target.escapedText + '.' + methodName];
        if (staticType !== undefined) {
            return staticType;
        }
    }
    // method-call rewrites the printer keys on the method name alone (`x.slice(...)` prints
    // `slice(x, ...)` whatever x is; `x.includes(...)` prints `x.Contains(...)`). Own-key
    // lookup only: `map['toString']` would hand back Object.prototype.toString.
    return Object.prototype.hasOwnProperty.call (CSHARP_LOCAL_METHOD_RETURN_TYPES, methodName) ? CSHARP_LOCAL_METHOD_RETURN_TYPES[methodName] : undefined;
}

// declarations whose type this classifier is already deriving further up the stack —
// a self-referential `let x = x;` (or a cycle through two copies) must not loop
const classifyInProgress = new Set ();

// `const y = x;` — the C# type the printed `x = ...` declaration carries: this module's
// own answer for x first (that is the rewrite the patch would apply), else the printer's
// getCSharpLocalType() decision, which is exactly the `<type> x = ` prefix it prints.
// `var` (a NewExpression initialiser) and `object` mean the printer named no type.
function referenceDeclaredType (csharp, declaration) {
    const list = declaration.parent;
    if (list?.kind !== ts.SyntaxKind.VariableDeclarationList || list.declarations.length !== 1) {
        return undefined; // the patch itself only rewrites single-declaration lists
    }
    const own = csharpLocalType (csharp, declaration);
    if (own !== undefined) {
        return own;
    }
    if (declaration.initializer?.kind === ts.SyntaxKind.NewExpression) {
        return undefined;
    }
    if (typeof csharp.getCSharpLocalType !== 'function') {
        return undefined;
    }
    const printer = csharp.getCSharpLocalType (declaration);
    return (printer === undefined || printer === csharp.VAR_TOKEN) ? undefined : printer;
}

// the declaration a bare identifier reads: the single same-name binding of its enclosing
// function, or the checker's answer when sibling blocks shadow the name (or when the use
// sits in a lambda that captured an outer local)
function resolveReference (csharp, node) {
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (node) : enclosingFunction (node);
    if (scope !== undefined) {
        const index = indexScope (csharp, scope);
        const candidates = (index.bindings.get (node.escapedText) ?? []).filter ((b) => b !== node.parent);
        if (candidates.length === 1) {
            return candidates[0];
        }
    }
    try {
        const checker = csharp.getChecker ();
        const declarations = checker.getSymbolAtLocation (node)?.declarations ?? [];
        if (declarations.length === 1) {
            return declarations[0];
        }
    } catch (e) {
        // no transpilation context (in-memory transpiles) — keep the printer's object
    }
    return undefined;
}

// the C# type of `x` in `const y = x;`, or undefined. Only a variable declaration has a
// printed `x = ...` whose type can be named: parameters print `object` (the typed-core
// narrowing to string / Int64? happens after printing — see the header) and a field read
// prints `this.x`, a different expression.
function identifierType (csharp, node) {
    const reference = resolveReference (csharp, node);
    if (reference?.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined;
    }
    return referenceDeclaredType (csharp, reference);
}

// is the printed C# of this `+` LEFT operand provably a `string` at compile time?
// Only proof-carrying shapes qualify: a string literal, a nested `+` whose own left is
// provable, an `as string` cast (`((string)x)`), parentheses around any of those, and
// members the hand-written base declares with a string type (`this.id`). Anything whose
// C# static type may be `object` — identifiers, getValue(...) calls, member reads not
// listed in CSHARP_LOCAL_THIS_MEMBER_TYPES — is NOT provable: add(object, ...) resolves
// to add(object, object), which returns `object` (and null for a null left).
function isProvablyStringOperand (node) {
    switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return true;
    case ts.SyntaxKind.ParenthesizedExpression:
        return isProvablyStringOperand (node.expression);
    case ts.SyntaxKind.AsExpression:
        return node.type?.kind === ts.SyntaxKind.StringKeyword;
    case ts.SyntaxKind.BinaryExpression:
        return node.operatorToken.kind === ts.SyntaxKind.PlusToken && isProvablyStringOperand (node.left);
    case ts.SyntaxKind.PropertyAccessExpression: {
        if (node.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return false;
        }
        const memberType = CSHARP_LOCAL_THIS_MEMBER_TYPES[node.name?.escapedText];
        return memberType === 'string' || memberType === 'string?';
    }
    }
    return false;
}

// the C# type of an initializer / assigned value, or undefined when it cannot be proven.
// 'null' is returned for a literal null/undefined so assignable() can accept it for
// nullable targets. Falls back to the printer's own classifier for its families.
// `context` (optional) enables the dataflow resolution of reads of other typed locals:
// { scope, stack, depth } — without it an identifier (other than undefined) is unprovable.
export function csharpTypeOfValue (csharp, node, context) {
    if (!node) {
        return undefined;
    }
    switch (node.kind) {
    case ts.SyntaxKind.NullKeyword:
        return 'null';
    case ts.SyntaxKind.Identifier:
        return (node.escapedText === 'undefined') ? 'null' : resolveLocalReadType (csharp, context, node);
    case ts.SyntaxKind.ObjectLiteralExpression:
        return 'Dictionary<string, object>';
    case ts.SyntaxKind.ArrayLiteralExpression:
        return 'List<object>';
    case ts.SyntaxKind.NewExpression: {
        // `new Foo(...)` prints `new Foo(...)` — for any simple class constructor the
        // expression's C# static type is Foo, exactly what `var` would infer. The printer
        // already declares a plain NewExpression initialiser `var` (nothing to rewrite
        // there), but naming the type lets the other csharpTypeOfValue consumers see it:
        // the null-initialised write path (`let x = undefined; ... x = new Foo(...)`) and
        // the assignment-compatibility check in csharpLocalIsSafeToRetype. The anchored
        // pattern only matches a bare constructor print; `new Error(...)` prints as
        // `new Exception(...)` and objects/arrays/typed arrays print in other shapes
        // (Dictionary/List literals, `new byte[...]`, `new Map<K,V>`), which do not match
        // and keep the local `object`.
        const printed = csharp.printNode (node, 0).trim ();
        const match = /^new\s+([A-Za-z_][\w]*)\s*\(/.exec (printed);
        return match ? match[1] : undefined;
    }
    case ts.SyntaxKind.NumericLiteral:
        return numericLiteralType (node.text);
    case ts.SyntaxKind.PrefixUnaryExpression:
        if (node.operator === ts.SyntaxKind.MinusToken && node.operand?.kind === ts.SyntaxKind.NumericLiteral) {
            return numericLiteralType (node.operand.text); // prints `-N`, still an int/double literal
        }
        break;
    case ts.SyntaxKind.ParenthesizedExpression:
        return csharpTypeOfValue (csharp, node.expression, context);
    case ts.SyntaxKind.AsExpression:
    case ts.SyntaxKind.TypeAssertionExpression:
        // `x as string` / `<string>x` prints `((string)x)`: the cast's static type is
        // string (a wrong box throws at runtime, exactly like the printed cast does)
        if (node.type?.kind === ts.SyntaxKind.StringKeyword) {
            return 'string';
        }
        break;
    case ts.SyntaxKind.BinaryExpression:
        // `a + b` prints `add(a, b)`. With a provably string LEFT operand the compiler
        // picks add(string, string) or add(string, object) — both declared `string`,
        // never null — so the result can be named `string` without changing the call;
        // only the local that receives it is affected (and every later use is re-checked
        // by csharpLocalIsSafeToRetype, which keeps a string local `object` when it lands
        // on the left of a later `+` where the overload would re-resolve)
        if (node.operatorToken.kind === ts.SyntaxKind.PlusToken && isProvablyStringOperand (node.left)) {
            return 'string';
        }
        break;
    case ts.SyntaxKind.ConditionalExpression: {
        // `c ? a : b` prints `((bool) isTrue(c)) ? A : B`; typeable when both arms agree
        const whenTrue = conditionalArmType (csharp, node.whenTrue, context);
        const whenFalse = conditionalArmType (csharp, node.whenFalse, context);
        return unifyArms (whenTrue, whenFalse);
    }
    case ts.SyntaxKind.BinaryExpression: {
        // `a + b` prints `add(a, b)`; with `a` statically a non-null string the call
        // resolves to add(string, string) / add(string, object), both declared `string`
        if (node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            const left = csharpTypeOfValue (csharp, node.left);
            if (left === 'string') {
                return 'string';
            }
        }
        break;
    }
    case ts.SyntaxKind.CallExpression: {
        const own = callReturnType (node);
        if (own !== undefined) {
            return own;
        }
        break;
    }
    case ts.SyntaxKind.ElementAccessExpression: {
        // `this.orderbooks[symbol]` prints `getValue(this.orderbooks, symbol)`; the ws
        // transpile rewrites that call to getOrderBook(...) — same map as the safeValue case
        const target = node.expression;
        if (target?.kind === ts.SyntaxKind.PropertyAccessExpression && target.expression?.kind === ts.SyntaxKind.ThisKeyword && target.name?.escapedText === 'orderbooks') {
            return 'ccxt.pro.IOrderBook';
        }
        break;
    }
    case ts.SyntaxKind.NewExpression: {
        // `new X (...)`: only the hand-written ws classes whose printed constructor name is
        // the C# type name and whose box is exactly that type (see CSHARP_LOCAL_NEW_TYPES)
        const ctor = node.expression;
        const own = (ctor?.kind === ts.SyntaxKind.Identifier) ? CSHARP_LOCAL_NEW_TYPES[ctor.escapedText] : undefined;
        if (own !== undefined) {
            return own;
        }
        break;
    }
    case ts.SyntaxKind.AwaitExpression:
        return csharpAwaitedThisCallType (csharp, node);
    }
    if (typeof csharp.csharpTypeOfInitializer === 'function') {
        return csharp.csharpTypeOfInitializer (node);
    }
    return undefined;
}

// an arm of `c ? a : b`: the value's own proven type, or — for a parenthesised read of a
// local this module itself declares with a concrete type — that local's declared type
function conditionalArmType (csharp, node, context) {
    const direct = csharpTypeOfValue (csharp, node, context);
    if (direct !== undefined) {
        return direct;
    }
    let arm = node;
    while (arm?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        arm = arm.expression;
    }
    if (arm?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    return localIdentifierType (csharp, arm);
}

// the C# type of reading a local, or undefined unless the name is bound exactly ONCE as a
// plain variable declaration in the enclosing function, before this read, with a type
// csharpLocalType() proves and the printer's declaration list is a single declarator (the
// shape installCsharpLocalTypes() rewrites). A parameter, a destructured or second
// binding, a read before the declaration and any unproven local all reject.
function localIdentifierType (csharp, node) {
    const name = node.escapedText;
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (node) : enclosingFunction (node);
    if (scope === undefined) {
        return undefined;
    }
    let binding;
    let bindings = 0;
    const visit = (n) => {
        if (bindings > 1) {
            return;
        }
        if (n !== scope && isFunctionScope (n)) {
            return; // a nested function binds its own names
        }
        if (n.kind === ts.SyntaxKind.Parameter || n.kind === ts.SyntaxKind.VariableDeclaration) {
            const names = bindingNamesOf (n.name);
            if (names.includes (name)) {
                bindings++;
                binding = n;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    if (bindings !== 1 || binding === undefined) {
        return undefined;
    }
    if (binding.kind !== ts.SyntaxKind.VariableDeclaration || binding.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    if (binding.getStart () >= node.getStart ()) {
        return undefined; // the read precedes the declaration
    }
    if (binding.parent?.declarations?.length !== 1) {
        return undefined; // multi-declarator lists are not rewritten by installCsharpLocalTypes
    }
    if (localReadTypesInFlight.has (binding)) {
        return undefined; // `let a = cond ? a : 'x'` must not recurse
    }
    localReadTypesInFlight.add (binding);
    try {
        return csharpLocalType (csharp, binding);
    } finally {
        localReadTypesInFlight.delete (binding);
    }
}

// declarations whose read-type is being computed right now (guards the recursion above)
const localReadTypesInFlight = new Set ();

// identifier names a binding introduces (`x`, `{ x }`, `[x, y]`, `{ x = 1 }` -> x only)
function bindingNamesOf (name) {
    const names = [];
    const visit = (n) => {
        if (n?.kind === ts.SyntaxKind.Identifier) {
            names.push (n.escapedText);
        } else if (n?.kind === ts.SyntaxKind.ObjectBindingPattern || n?.kind === ts.SyntaxKind.ArrayBindingPattern) {
            for (const element of n.elements) {
                visit (element?.name);
            }
        }
    };
    visit (name);
    return names;
}

function isFunctionScope (node) {
    switch (node?.kind) {
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.ArrowFunction:
    case ts.SyntaxKind.Constructor:
    case ts.SyntaxKind.GetAccessor:
    case ts.SyntaxKind.SetAccessor:
        return true;
    }
    return false;
}

// `let x: Str = undefined` — the annotation names the type, the null initialiser makes it
// nullable; only accepted when every later write is proven compatible (see the scan)
function annotationType (declaration) {
    const type = declaration.type;
    if (!type) {
        return undefined;
    }
    if (type.kind === ts.SyntaxKind.TypeReference && type.typeName?.kind === ts.SyntaxKind.Identifier && !type.typeArguments) {
        return CSHARP_LOCAL_ANNOTATION_TYPES[type.typeName.escapedText];
    }
    if (type.kind === ts.SyntaxKind.StringKeyword) {
        return CSHARP_LOCAL_ANNOTATION_TYPES['string'];
    }
    if (type.kind === ts.SyntaxKind.NumberKeyword) {
        return CSHARP_LOCAL_ANNOTATION_TYPES['number'];
    }
    if (type.kind === ts.SyntaxKind.BooleanKeyword) {
        return CSHARP_LOCAL_ANNOTATION_TYPES['boolean'];
    }
    return undefined;
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

// one walk per method: every Identifier grouped by escapedText, plus the printed names
// of every binding (for the type-token shadow check), plus the declaration table the
// dataflow resolution reads (declarations / parameterNames / blockedNames)
const scopeIndexCache = new WeakMap ();

function indexScope (csharp, scope) {
    let index = scopeIndexCache.get (scope);
    if (index) {
        return index;
    }
    const identifiers = new Map ();
    const bindingNames = new Set ();
    const declarations = new Map ();
    const parameterNames = new Set ();
    // names bound by a pattern (destructuring) / catch clause: the read could be that binding,
    // which this module cannot type -> never resolve through them
    const blockedNames = new Set ();
    const markBoundNames = (name) => {
        if (!name) {
            return;
        }
        const walk = (n) => {
            if (n.kind === ts.SyntaxKind.Identifier) {
                blockedNames.add (n.escapedText);
            }
            ts.forEachChild (n, walk);
        };
        walk (name);
    };
    const bindingCounts = new Map ();
    const bindings = new Map ();
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.Identifier) {
            const name = n.escapedText;
            let list = identifiers.get (name);
            if (!list) {
                list = [];
                identifiers.set (name, list);
            }
            list.push (n);
        }
        if ((n.kind === ts.SyntaxKind.Parameter || n.kind === ts.SyntaxKind.VariableDeclaration) && n.name?.kind === ts.SyntaxKind.Identifier) {
            const printed = csharp.printNode (n.name, 0);
            bindingNames.add (printed);
            bindingCounts.set (printed, (bindingCounts.get (printed) ?? 0) + 1);
            let list = bindings.get (n.name.escapedText);
            if (!list) {
                list = [];
                bindings.set (n.name.escapedText, list);
            }
            list.push (n);
        }
        if (n.kind === ts.SyntaxKind.Parameter) {
            if (n.name?.kind === ts.SyntaxKind.Identifier) {
                parameterNames.add (n.name.escapedText);
            }
            markBoundNames (n.name);
        } else if (n.kind === ts.SyntaxKind.VariableDeclaration) {
            if (n.name?.kind === ts.SyntaxKind.Identifier) {
                let list = declarations.get (n.name.escapedText);
                if (!list) {
                    list = [];
                    declarations.set (n.name.escapedText, list);
                }
                list.push (n);
            } else {
                markBoundNames (n.name); // destructuring assignment never gets a concrete type
            }
        } else if (n.kind === ts.SyntaxKind.CatchClause && n.variableDeclaration) {
            if (n.variableDeclaration.name?.kind === ts.SyntaxKind.Identifier) {
                parameterNames.add (n.variableDeclaration.name.escapedText);
            }
            markBoundNames (n.variableDeclaration.name);
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    index = { identifiers, bindingNames, bindingCounts, bindings, declarations, parameterNames, blockedNames };
    scopeIndexCache.set (scope, index);
    return index;
}

function typeNameIsShadowed (index, csharpType) {
    const names = csharpType.match (/[A-Za-z_]\w*/g) ?? [];
    return names.some ((n) => CSHARP_TYPE_TOKENS.includes (n) && index.bindingNames.has (n));
}

// is `identifier` a declaration/member name rather than a read or write of the local?
function isNotAUse (identifier) {
    const parent = identifier.parent;
    if (!parent) {
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
        return parent.name === identifier;
    }
    return false;
}

// (a)/(b) dataflow: the C# type of a read of `identifier` when the read provably refers to a
// single local declared earlier in the same scope AND that local is itself emitted with a
// concrete type. The FULL csharpLocalType decision for the declaration is recomputed — a local
// that stays `object` in the output proves nothing — under a cycle stack (`let a = b; let
// b = a;` resolves to undefined) and a depth cap. Any doubt resolves to undefined.
const MAX_RESOLVE_DEPTH = 8;

function declarationCsharpType (csharp, declaration, context) {
    // resolve with the declaration's OWN enclosing function: that is the scope the printer
    // uses when it prints this declaration, so the decision is reproduced exactly
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (declaration) : enclosingFunction (declaration);
    const nested = { scope, stack: context.stack, depth: context.depth + 1 };
    context.stack.add (declaration);
    try {
        return csharpLocalType (csharp, declaration, nested);
    } finally {
        context.stack.delete (declaration);
    }
}

function resolveLocalReadType (csharp, context, identifier) {
    if (!context || !context.scope) {
        return undefined;
    }
    const index = indexScope (csharp, context.scope);
    const name = identifier.escapedText;
    const declarations = index.declarations.get (name);
    if (!declarations || declarations.length !== 1) {
        return undefined; // not a local, or shadowed by a second binding of the same name
    }
    // a parameter / destructured / catch binding of the same name could be the actual read
    if (index.parameterNames.has (name) || index.blockedNames.has (name)) {
        return undefined;
    }
    const declaration = declarations[0];
    if (!declaration.initializer || declaration.parent?.declarations?.length !== 1) {
        return undefined; // uninitialised, or a list the printer never rewrites as one declaration
    }
    if (context.stack.has (declaration) || context.depth >= MAX_RESOLVE_DEPTH) {
        return undefined; // cycle (`a = b; b = a;`) or a pathological chain
    }
    try {
        if (declaration.getStart() >= identifier.getStart()) {
            return undefined; // read at or before the declaration (TDZ / hoisted closure)
        }
    } catch (e) {
        return undefined;
    }
    return declarationCsharpType (csharp, declaration, context);
}

export function csharpLocalIsSafeToRetype (csharp, scope, declaration, varName, csharpType, context) {
    if (scope === undefined) {
        return false;
    }
    const index = indexScope (csharp, scope);
    if (typeNameIsShadowed (index, csharpType)) {
        return false;
    }
    const isString = STRING_TYPES.includes (csharpType);
    const isInt = INT_TYPES.includes (csharpType);
    const isDouble = DOUBLE_TYPES.includes (csharpType);
    const isValueType = NON_NULLABLE_VALUE_TYPES.includes (csharpType);
    const isList = LIST_TYPES.includes (csharpType);
    let reads = 0;
    for (const n of (index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || isNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (!(parent.kind === ts.SyntaxKind.BinaryExpression && parent.left === n && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
            reads++;
        }
        // `delete obj[x]` (also `delete obj[(x as number)]`) prints `.Remove((string)x)` —
        // a hard cast that only compiles from `object` when x is not a string
        if (!isString && isDeleteKey (n)) {
            return false;
        }
        // `throw new ExchangeError ((string)response)` — the C# throw printer wraps the
        // whole argument of a class throw in `(string)` (ast-transpiler printThrowStatement),
        // a cast that only compiles from `object` or a string: a reference-typed local
        // (List/Dictionary) or a value type is CS0030 there
        if (!isString && isClassThrowArgument (n)) {
            return false;
        }
        switch (parent.kind) {
        case ts.SyntaxKind.PostfixUnaryExpression:
            // x++ / x-- print postFixIncrement(ref x) / postFixDecrement(ref x). A `ref`
            // argument binds only to its exact type; Exchange.TranspileHelpers.cs has the
            // (ref object) overload plus (ref int) / (ref Int64) / (ref double) twins with
            // the same unchecked +1 / -1, so an exact int / Int64 / double local binds.
            // Nullable (Int64?) and string locals have no twin and must stay `object`.
            if (!isInt && !isDouble) {
                return false;
            }
            break;
        case ts.SyntaxKind.PrefixUnaryExpression:
            // -x / +x print prefixUnaryNeg(ref x) / prefixUnaryPlus(ref x) (`ref object`
            // plus the same (ref int) / (ref Int64) / (ref double) twins: unchecked
            // negation / identity, same return). `!` prints a bool test and stays valid
            // for every type; any other prefix operator prints through prefixUnaryNeg as
            // well, so the numeric families bind there exactly as they do for `object`.
            if (parent.operator !== ts.SyntaxKind.ExclamationToken && !isInt && !isDouble) {
                return false; // prefixUnaryNeg/Plus(ref x) without a twin for this type
            }
            // The twin returns int / Int64, so if that result is an operand of `-` the
            // call can move from subtract(object, object) (normalises the int box and
            // returns Int64) to subtract(int, int) / subtract(Int64, Int64) (an Int32 /
            // Int64 result) — exactly the box-type divergence that keeps a bare int /
            // Int64 local of a `-` operand `object` below. A double result has no
            // subtract(double, double) overload, so only the integer families matter.
            if (isInt && isOperandOfMinus (parent)) {
                return false;
            }
            break;
        case ts.SyntaxKind.SpreadElement:
            return false;
        case ts.SyntaxKind.TypeOfExpression:
            if (isValueType) {
                return false; // `x is int` on an int local is CS0183
            }
            break;
        case ts.SyntaxKind.ArrayLiteralExpression:
            // `[x, y] = f()` prints element reads into untyped slots; accepted when the
            // assignment is an audited request builder whose element is cast back (see below)
            if (parent.parent?.kind === ts.SyntaxKind.BinaryExpression && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                if (!destructuredWriteIsCastable (csharp, index, declaration, n, parent.parent, csharpType)) {
                    return false;
                }
            }
            break;
        case ts.SyntaxKind.PropertyAccessExpression: {
            // x.push(v) prints ((IList<object>)x).Add(v); x.reverse() reassigns x from a
            // List<object>; x.join(...) / x.shift() / x.pop() print ((IList<object>)x)
            // casts as well. All of them only make sense on a list. x.sort() has no typed
            // print at all.
            const method = parent.name?.escapedText;
            if (method === 'sort') {
                return false;
            }
            if (!isList && (method === 'push' || method === 'reverse' || method === 'join' || method === 'shift' || method === 'pop')) {
                return false;
            }
            break;
        }
        case ts.SyntaxKind.VariableDeclaration:
            // `const [a, b] = x` prints `var abVariable = x; var a = ((IList<object>) abVariable)[0]`
            // — the synthetic var takes x's static type, so only a list local is castable back
            if (parent.name?.kind === ts.SyntaxKind.ArrayBindingPattern && !isList) {
                return false;
            }
            break;
        case ts.SyntaxKind.BinaryExpression: {
            const op = parent.operatorToken.kind;
            if (parent.left === n) {
                if (op === ts.SyntaxKind.EqualsToken) {
                    // RHS may be another already-typed local / a ternary over such locals (context)
                    if (!assignable (csharpType, csharpTypeOfValue (csharp, parent.right, context))) {
                        return false;
                    }
                } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                    // `x += r` prints `x = add(x, r)`; only the string `+` case is named
                    // here — it is accepted under the same proof as a plain `x + r`
                    // (stringPlusOperandIsProvablyString), and the selected add(string, *)
                    // overload is declared `string`, so the write is assignable by
                    // construction. Every other compound operator stays `object`.
                    if (!(op === ts.SyntaxKind.PlusEqualsToken && stringPlusOperandIsProvablyString (csharp, n, csharpType))) {
                        return false;
                    }
                }
            }
            // overload resolution against the declared type: add(string, ...) and
            // subtract(int, int) exist next to the (object, object) versions.
            // `+`: the LEFT operand's static type selects the add overload family. A
            // `string?` local can hold null (add(object, object) -> null vs
            // add(string, *) -> the right operand), and a non-string right operand
            // resolves to add(string, object) whose ToString() diverges from the
            // object overload's (string) cast (InvalidCastException) — both stay
            // `object`. A non-nullable `string` local with a provably non-null string
            // right operand is accepted: it can never be null and
            // add(string, string) == add(object, object) for every input.
            if (isString && isLeftPlusOperand (n)) {
                if (!stringPlusOperandIsProvablyString (csharp, n, csharpType)) {
                    return false;
                }
            }
            if (isInt && (op === ts.SyntaxKind.MinusToken || op === ts.SyntaxKind.MinusEqualsToken)) {
                return false;
            }
            break;
        }
        case ts.SyntaxKind.ParenthesizedExpression:
            // `(x) + y` prints `add((x), y)`: the parentheses keep x's static type
            if (isString && isLeftPlusOperand (unwrapParens (n))) {
                if (!stringPlusOperandIsProvablyString (csharp, unwrapParens (n), csharpType)) {
                    return false;
                }
            }
            break;
        }
    }
    // `T x = <literal>;` that is never read is CS0219 (an error under TreatWarningsAsErrors)
    // where `object x = <literal>;` is not — keep the upstream shape for unused locals
    if (reads === 0 && isLiteralLike (declaration.initializer)) {
        return false;
    }
    return true;
}

// climb through `(x)` and `x as T` wrappers to the expression that consumes the value
function unwrapValue (node) {
    let current = node;
    while (current.parent && (current.parent.kind === ts.SyntaxKind.ParenthesizedExpression || current.parent.kind === ts.SyntaxKind.AsExpression)) {
        current = current.parent;
    }
    return current;
}

// climb through `(x)` only — `x as string` prints `((string)x)`, whose static type is
// string whatever x was declared as, so it is not the local's type that matters there
function unwrapParens (node) {
    let current = node;
    while (current.parent && current.parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.parent;
    }
    return current;
}

// is `value` the LEFT operand of a `+` / `+=`? (prints `add(value, ...)`, so value's
// static type picks the overload)
function isLeftPlusOperand (value) {
    const parent = value.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== value) {
        return false;
    }
    const op = parent.operatorToken.kind;
    return op === ts.SyntaxKind.PlusToken || op === ts.SyntaxKind.PlusEqualsToken;
}

// is the prefix expression `expr` an operand of `-` / `-=` after unwrapping parentheses?
// (`prefixUnaryNeg(ref x) - 5` prints `subtract(prefixUnaryNeg(ref x), 5)`; the numeric
// static type of the call then picks a typed subtract overload)
function isOperandOfMinus (expr) {
    let current = expr;
    while (current.parent && current.parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.parent;
    }
    const parent = current.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression) {
        return false;
    }
    const op = parent.operatorToken.kind;
    return op === ts.SyntaxKind.MinusToken || op === ts.SyntaxKind.MinusEqualsToken;
}

// is `identifier` (possibly wrapped in parens / `as`) an argument of the `new X(...)` a
// ThrowStatement throws? Those arguments print inside one `(string)` cast.
function isClassThrowArgument (identifier) {
    let current = identifier;
    while (current.parent) {
        const parent = current.parent;
        if (parent.kind === ts.SyntaxKind.ParenthesizedExpression || parent.kind === ts.SyntaxKind.AsExpression) {
            current = parent;
            continue;
        }
        if (parent.kind === ts.SyntaxKind.NewExpression && parent.arguments?.includes (current)) {
            current = parent;
            continue;
        }
        return parent.kind === ts.SyntaxKind.ThrowStatement;
    }
    return false;
}

// is `value` (already unwrapped of `(x)` parentheses) a non-nullable `string` local used
// as the LEFT operand of `+` / `+=` whose RIGHT operand is itself a provably non-null
// string? Only then does the retype both keep behaviour and compile:
//   - the call resolves to add(string, string), so no CS8604 (the right operand is
//     non-nullable) and the expression stays statically `string`;
//   - add(string, string) agrees with the add(object, object) the untyped local selected
//     for every input, because a `string` local can never hold null: its initializer is
//     a proven non-null string (every `string` entry of CSHARP_LOCAL_THIS_RETURN_TYPES
//     throws on null input instead of returning it) and csharpLocalIsSafeToRetype only
//     accepts later writes assignable to `string` (i.e. proven non-null strings too).
// Everything else stays `object` — see the header comment for the divergences.
function stringPlusOperandIsProvablyString (csharp, value, csharpType) {
    if (csharpType !== 'string') {
        return false;
    }
    const parent = value.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== value) {
        return false;
    }
    const op = parent.operatorToken.kind;
    if (op !== ts.SyntaxKind.PlusToken && op !== ts.SyntaxKind.PlusEqualsToken) {
        return false;
    }
    return csharpTypeOfValue (csharp, parent.right) === 'string';
}

// is `identifier` (possibly wrapped) the key of a `delete obj[key]`?
function isDeleteKey (identifier) {
    const value = unwrapValue (identifier);
    const access = value.parent;
    return access?.kind === ts.SyntaxKind.ElementAccessExpression && access.argumentExpression === value && access.parent?.kind === ts.SyntaxKind.DeleteExpression;
}

function isLiteralLike (node) {
    switch (node?.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NullKeyword:
        return true;
    case ts.SyntaxKind.PrefixUnaryExpression:
        return isLiteralLike (node.operand);
    case ts.SyntaxKind.ParenthesizedExpression:
        return isLiteralLike (node.expression);
    case ts.SyntaxKind.Identifier:
        return node.escapedText === 'undefined';
    }
    return false;
}

// ---- element-access initialisers -------------------------------------------------------
// `const x = recv[key]` prints `object x = getValue(recv, key);`. `recv` itself is almost
// always `object` / `List<object>` / `Dictionary<string, object>`, whose elements carry no
// provable type — but a handful of producers guarantee strings in the generated C#:
//   - `Object.keys (x)` -> `new List<object>(((IDictionary<string,object>)x).Keys)` (keys of
//     a string-keyed dictionary are strings)
//   - `<expr>.split (...)` -> `((string)expr).Split (...).ToList<object>()`
//   - `['a', 'b', ...]` of string literals -> `new List<object> { "a", "b" }`
// The local may only be declared `string?` when nothing else can rewrite, mutate or leak
// the list, so every other use of the receiver must be a plain read.

function stringElementsProducer (initializer) {
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (!node) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.CallExpression) {
        const callee = node.expression;
        if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
            return false;
        }
        const method = callee.name?.escapedText;
        if (method === 'split') {
            return true;
        }
        return method === 'keys'
            && callee.expression?.kind === ts.SyntaxKind.Identifier
            && callee.expression.escapedText === 'Object';
    }
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        return node.elements.length > 0 && node.elements.every ((element) => element.kind === ts.SyntaxKind.StringLiteral || element.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
    }
    return false;
}

// is this occurrence of the receiver able to change what the list holds, hand it to another
// scope, or rebuild it? Any such use disqualifies the receiver.
function receiverUseIsWrite (identifier) {
    const parent = identifier.parent;
    if (!parent) {
        return true;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.BinaryExpression:
        // `recv = ...` rebuilds it; `target = recv` aliases a list another name can mutate
        return (parent.left === identifier || parent.right === identifier) && ASSIGNMENT_OPERATORS.includes (parent.operatorToken.kind);
    case ts.SyntaxKind.ElementAccessExpression: {
        if (parent.expression !== identifier) {
            return false;
        }
        const grand = parent.parent;
        if (grand?.kind === ts.SyntaxKind.DeleteExpression) {
            return true;
        }
        return grand?.kind === ts.SyntaxKind.BinaryExpression && grand.left === parent && ASSIGNMENT_OPERATORS.includes (grand.operatorToken.kind);
    }
    case ts.SyntaxKind.PropertyAccessExpression:
        return parent.expression === identifier && LIST_MUTATING_METHODS.includes (parent.name?.escapedText);
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

// the element type of `recv[key]` when recv is a local whose elements are provably strings,
// or undefined. The receiver must have exactly one binding in the enclosing function (no
// shadowing), that binding must be a declaration before the site with a string-elements
// producer, and every other use of the name must be a read.
function elementAccessElementType (csharp, initializer) {
    if (initializer?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    const receiver = initializer.expression;
    if (receiver?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (initializer) : enclosingFunction (initializer);
    if (scope === undefined) {
        return undefined;
    }
    const uses = indexScope (csharp, scope).identifiers.get (receiver.escapedText);
    if (!uses) {
        return undefined;
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
    if (bindings !== 1 || declaration.kind !== ts.SyntaxKind.VariableDeclaration || !stringElementsProducer (declaration.initializer)) {
        return undefined;
    }
    if (declaration.getStart () > initializer.getStart ()) {
        return undefined; // the list is not provably built before the read
    }
    for (const n of uses) {
        if (n === receiver || n === declaration.name) {
            continue;
        }
        if (receiverUseIsWrite (n)) {
            return undefined;
        }
    }
    return 'string';
}

// the C# declaration for `declaration`: the type plus the value rewrite it needs, or
// undefined to keep the printer's output. `context` is only set while resolving another
// declaration's write/initializer through resolveLocalReadType; a top-level call (the
// printer) starts a fresh resolution.
export function csharpLocalDeclaration (csharp, declaration, context) {
    if (!declaration?.initializer || declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    if (classifyInProgress.has (declaration)) {
        return undefined; // a copy chain that reads the declaration being classified
    }
    classifyInProgress.add (declaration);
    try {
        return csharpLocalTypeOf (csharp, declaration, context);
    } finally {
        classifyInProgress.delete (declaration);
    }
}

function csharpLocalTypeOf (csharp, declaration, context) {
    const sourceName = declaration.name.escapedText;
    const scope = context?.scope ?? ((typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (declaration) : enclosingFunction (declaration));
    const ctx = context ?? { scope, stack: new Set (), depth: 0 };
    let csharpType = csharpTypeOfValue (csharp, declaration.initializer, ctx);
    let cast;
    if (csharpType === undefined) {
        // `const x = recv[key]`: the runtime element is a string, but the value is an
        // `object` box, so the declaration needs the `(string)` cast the printer does not
        // emit by itself. Nullable because the box is null off the end of the list.
        if (elementAccessElementType (csharp, declaration.initializer) === 'string') {
            csharpType = 'string?';
            cast = 'string';
        }
    }
    if (csharpType === 'null') {
        csharpType = annotationType (declaration) ?? typeFromValueOrWrites (csharp, scope, declaration, sourceName, 'null', ctx);
    } else if (csharpType !== undefined && csharpType !== csharp.VAR_TOKEN) {
        // join the initializer with every later write, widening only along box-identical edges
        csharpType = typeFromValueOrWrites (csharp, scope, declaration, sourceName, csharpType, ctx);
    }
    if (csharpType === undefined || csharpType === csharp.VAR_TOKEN) {
        return undefined;
    }
    let safe = csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, csharpType, ctx);
    // an array literal is `new List<object>()`, but a later `x = this.toArray (...)` writes an
    // IList<object>. Retry as the interface: every list rule the scan applies treats the two
    // alike (LIST_TYPES), and both `new List<object>()` and `this.toArray (...)` assign into an
    // IList<object> local unchanged. Only a List<object> reject is retried, so locals that pass
    // (or fail for any other reason) keep the exact List<object> spelling.
    if (!safe && csharpType === 'List<object>' && csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, 'IList<object>', ctx)) {
        csharpType = 'IList<object>';
        safe = true;
    }
    if (!safe) {
        return undefined;
    }
    return { type: csharpType, cast };
}

// the declared type only (kept for callers that do not rewrite the value)
export function csharpLocalType (csharp, declaration, context) {
    return csharpLocalDeclaration (csharp, declaration, context)?.type;
}

// `[ request, params ] = this.helper (...)` prints `request = ((IList<object>)tmp)[0]` — an
// element read whose static type is object. When `request` carries a proven type here, the
// declaration wrapper records it (recordDestructuredWriteType) and the custom-expression
// wrapper (injectDestructuredCasts) reprints that element load with a cast back to it, so the
// assignment stays type-correct. The cast is only behaviour-preserving while element 0 (or 1)
// of the helper's pair really is the Dictionary (or null) it was handed — true for the audited
// request builders below, which all build/mutate a request Dict and `return [ request, params ]`:
//   handleUntilOption            ts/src/base/Exchange.ts      element 0 is the caller's own request
//   handleUntilOptionString      ts/src/grvt.ts               same shape (string-multiplied until)
//   prepareRequest               ts/src/gate.ts               fresh `const request: Dict = {}` returned
//   multiOrderSpotPrepareRequest ts/src/gate.ts               fresh request returned
//   orderRequest                 ts/src/poloniex.ts / zebpay.ts  the request argument, mutated in place
//   createOrderRequest           ts/src/toobit.ts             fresh request returned
//   createContractOrderRequest   ts/src/toobit.ts             fresh request returned
export const DESTRUCTURED_DICT_HELPERS = [
    'handleUntilOption',
    'handleUntilOptionString',
    'prepareRequest',
    'multiOrderSpotPrepareRequest',
    'orderRequest',
    'createOrderRequest',
    'createContractOrderRequest',
];

// scope (enclosing function node) -> Map<printed local name, proven C# type>, filled while the
// declaration is printed and read while a destructuring assignment in the same scope is printed
const destructuredWriteTypes = new WeakMap ();

export function recordDestructuredWriteType (scope, printedName, csharpType) {
    if (scope === undefined) {
        return;
    }
    let types = destructuredWriteTypes.get (scope);
    if (types === undefined) {
        types = new Map ();
        destructuredWriteTypes.set (scope, types);
    }
    types.set (printedName, csharpType);
}

// is `[ ..., x, ... ] = this.helper (...)` a write the cast makes type-correct?
function destructuredWriteIsCastable (csharp, index, declaration, idNode, assignment, csharpType) {
    // only the audited request builders, and only for a target proven to be a Dictionary
    if (csharpType !== 'Dictionary<string, object>') {
        return false;
    }
    const right = assignment.right;
    if (right?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = right.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    if (!DESTRUCTURED_DICT_HELPERS.includes (callee.name?.escapedText)) {
        return false;
    }
    // the cast is injected while printing THIS function keyed on the printed name, so the
    // declaration (which records the type) must sit in the same function and print first...
    if (enclosingFunction (idNode) !== enclosingFunction (declaration)) {
        return false;
    }
    if (assignment.getStart () <= declaration.getStart ()) {
        return false;
    }
    // ...and the printed name must be unambiguous, or a shadowed sibling would take the cast too
    const printedName = csharp.printNode (idNode, 0);
    if ((index.bindingCounts.get (printedName) ?? 0) !== 1) {
        return false;
    }
    return true;
}

// wrap printCustomBinaryExpressionIfAny: the destructuring assignment print emits one
// `<target> = ((IList<object>)<tmp>)[<i>]` line per element; give every line whose target this
// module retyped the matching cast. Idempotent.
function installDestructuredCasts (csharp) {
    if (typeof csharp.printCustomBinaryExpressionIfAny !== 'function' || csharp._destructuredCastsPatched) {
        return;
    }
    const upstream = csharp.printCustomBinaryExpressionIfAny.bind (csharp);
    csharp.printCustomBinaryExpressionIfAny = (node, identation) => {
        const printed = upstream (node, identation);
        if (typeof printed !== 'string') {
            return printed;
        }
        if (node?.operatorToken?.kind !== ts.SyntaxKind.EqualsToken || node.left?.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            return printed;
        }
        const types = destructuredWriteTypes.get (enclosingFunction (node));
        if (types === undefined) {
            return printed;
        }
        return printed.split ('\n').map ((line) => {
            const match = /^(\s*)([A-Za-z_][A-Za-z0-9_]*) = \(\(IList<object>\)([A-Za-z_][A-Za-z0-9_]*)\)\[(\d+)\](;?)$/.exec (line);
            const targetType = (match === null) ? undefined : types.get (match[2]);
            if (targetType === undefined) {
                return line;
            }
            return match[1] + match[2] + ' = (' + targetType + ')((IList<object>)' + match[3] + ')[' + match[4] + ']' + match[5];
        }).join ('\n');
    };
    csharp._destructuredCastsPatched = true;
}

// the declared type from the initializer (`initial` — a proven type, or 'null' for a
// literal null/undefined) joined with every later plain `x = ...` write in the method:
// joinTypes() widens T/T? and List<object>/IList<object> along box-identical edges, and
// a null write (or the null initializer itself) makes the final spelling nullable. An
// unprovable or non-joinable write returns undefined — the printer's `object`
// declaration is kept. csharpLocalIsSafeToRetype() then re-checks every write and every
// read against the final type exactly as for a single-expression local.
function typeFromValueOrWrites (csharp, scope, declaration, varName, initial, context) {
    if (scope === undefined) {
        return undefined;
    }
    const index = indexScope (csharp, scope);
    let type = (initial === 'null') ? undefined : initial;
    let sawNull = (initial === 'null');
    for (const n of (index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || isNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (parent.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== n || parent.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
            continue;
        }
        const written = csharpTypeOfValue (csharp, parent.right, context);
        if (written === undefined) {
            return undefined;
        }
        if (written === 'null') {
            sawNull = true;
            continue;
        }
        type = (type === undefined) ? written : joinTypes (type, written);
        if (type === undefined) {
            return undefined;
        }
    }
    if (type === undefined) {
        return undefined;
    }
    return sawNull ? nullableOf (type) : type;
}

// methods whose generated C# return type the printer erases to `object` even though the
// value has one concrete C# type at runtime. Applied to the declaration (base + every
// exchange override) and to every `return` inside it (see the header).
export const CSHARP_METHOD_RETURN_TYPES = {
    'safeSymbol': 'string?',
    'safeCurrencyCode': 'string?',
    'safeMarket': 'Dictionary<string, object>',
};

// wrap printFunctionType() / printReturnStatement() so the methods above keep their real
// return type instead of `object`. Mirrors the fork's csharpBooleanReturnType rule, which
// already covers `: boolean`; only sync MethodDeclarations with a listed name are touched,
// and every other call falls through to the upstream printer untouched. Idempotent.
export function installCsharpMethodReturnTypes (csharp) {
    if (!csharp || typeof csharp.printFunctionType !== 'function' || typeof csharp.printReturnStatement !== 'function' || csharp._localMethodReturnTypesPatched) {
        return;
    }
    const methodReturnType = (node) => {
        if (node?.kind !== ts.SyntaxKind.MethodDeclaration) {
            return undefined;
        }
        if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (node)) {
            return undefined; // async methods print Task<...>; none of the listed names is async
        }
        return CSHARP_METHOD_RETURN_TYPES[node.name?.escapedText];
    };
    const upstreamFunctionType = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node) => {
        const retype = methodReturnType (node);
        if (retype !== undefined) {
            return retype;
        }
        return upstreamFunctionType (node);
    };
    const upstreamReturnStatement = csharp.printReturnStatement.bind (csharp);
    csharp.printReturnStatement = (node, identation) => {
        const retype = methodReturnType (ts.findAncestor (node.parent, ts.isFunctionLike));
        if (retype === undefined || !node.expression) {
            return upstreamReturnStatement (node, identation);
        }
        // the printed expression is the `object` box the rest of the printer produces;
        // the cast only names the type the box already has (null in, null out)
        const leadingComment = csharp.printLeadingComments (node, identation);
        let trailingComment = csharp.printTraillingComment (node, identation);
        trailingComment = trailingComment ? ' ' + trailingComment : trailingComment;
        const value = csharp.printNode (node.expression, identation).trim ();
        return leadingComment + csharp.getIden (identation) + csharp.RETURN_TOKEN + ` ((${retype})((object)(${value})))` + csharp.LINE_TERMINATOR + trailingComment;
    };
    csharp._localMethodReturnTypesPatched = true;
}

// `this.<name>(...)` where <name> is a member of the tuple-returning handle family
// (`handleOptionAndParams`, `handleMarginModeAndParams`, `customHandleMarginModeAndParams`,
// ...). Destructuring callees outside the family keep the printer's shape.
function destructuredHandleCallName (node) {
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const name = callee.name?.escapedText;
    return (typeof name === 'string' && name.includes ('andle')) ? name : undefined;
}

const DESTRUCTURING_TEMP_RE = /^([ \t]*)var ([A-Za-z_]\w*) = (.*);\n/;

// `var <name> = <expr>;` holder of a destructuring block whose remaining lines read
// <name> through the exact cast this rewrite hoists: `((IList<object>)<name>)[i]`.
// The reads prove the holder holds a List<object> box at that point, so declaring it
// `IList<object>` with the same cast keeps every value and every failure identical.
function retypeDestructuringTemp (csharp, scope, printed) {
    const match = DESTRUCTURING_TEMP_RE.exec (printed);
    if (match === null) {
        return undefined;
    }
    const [ , indent, name, expr ] = match;
    const rest = printed.slice (match[0].length);
    if (!new RegExp ('\\(\\(IList<object>\\)[ \\t]*' + name + '\\)\\[').test (rest)) {
        return undefined;
    }
    if (scope !== undefined && indexScope (csharp, scope).bindingNames.has ('IList')) {
        return undefined; // a local/parameter named IList would stop the type token meaning a type
    }
    return indent + 'IList<object> ' + name + ' = (IList<object>)' + expr + ';\n' + rest;
}

// wrap printVariableDeclarationList on a Transpiler's C# printer. Idempotent. Everything
// the upstream printer already typed (or printed in another shape) is returned untouched;
// only an exact `<iden>object <name> = ` prefix is rewritten.
export function installCsharpLocalTypes (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printVariableDeclarationList !== 'function') {
        return;
    }
    installDestructuredCasts (csharp);
    if (csharp._localTypesPatched) {
        return;
    }
    installCsharpMethodReturnTypes (csharp);
    const upstream = csharp.printVariableDeclarationList.bind (csharp);
    csharp.printVariableDeclarationList = (node, identation) => {
        const printed = upstream (node, identation);
        const declarations = node?.declarations;
        if (!declarations || declarations.length !== 1) {
            return printed;
        }
        const declaration = declarations[0];
        // `const [a, b] = this.handleM (...)` — the printer emits a `var abVariable = <call>;`
        // holder and one casted read per element; type the holder per the proof above
        if (declaration.name?.kind === ts.SyntaxKind.ArrayBindingPattern) {
            if (destructuredHandleCallName (declaration.initializer) === undefined) {
                return printed;
            }
            const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (declaration) : enclosingFunction (declaration);
            return retypeDestructuringTemp (csharp, scope, printed) ?? printed;
        }
        const info = csharpLocalDeclaration (csharp, declaration);
        if (info === undefined) {
            return printed;
        }
        const iden = csharp.getIden (identation);
        const printedName = csharp.printNode (declaration.name, 0);
        const prefix = iden + csharp.VAR_TOKEN + ' ' + printedName + ' = ';
        if (!printed.startsWith (prefix)) {
            return printed;
        }
        // an awaited-call local is only retyped when the printed initializer still IS the
        // awaited call: a typed core prints `ccxt.BaseExchange.FromX(await this.X(...))`
        // (a different static type) even though the AST still reads `await this.X(...)`
        if (declaration.initializer?.kind === ts.SyntaxKind.AwaitExpression && !printed.slice (prefix.length).startsWith ('await this.')) {
            return printed;
        }
        let value = printed.slice (prefix.length);
        if (info.cast !== undefined) {
            // the printer prints a bare `getValue (recv, key)`; the named element type only
            // compiles once the box is cast back
            value = '((' + info.cast + ')' + value + ')';
        }
        // the destructuring print (a later statement in the same function) casts back to this
        recordDestructuredWriteType (enclosingFunction (declaration), printedName, info.type);
        return iden + info.type + ' ' + printedName + ' = ' + value;
    };
    // `[a, b] = this.handleM (...)` — same holder, printed by the binary-expression path
    if (typeof csharp.printCustomBinaryExpressionIfAny === 'function') {
        const upstreamCustom = csharp.printCustomBinaryExpressionIfAny.bind (csharp);
        csharp.printCustomBinaryExpressionIfAny = (node, identation) => {
            const printed = upstreamCustom (node, identation);
            if (typeof printed !== 'string') {
                return printed;
            }
            const isDestructuringAssign = node?.kind === ts.SyntaxKind.BinaryExpression
                && node.operatorToken?.kind === ts.SyntaxKind.EqualsToken
                && node.left?.kind === ts.SyntaxKind.ArrayLiteralExpression;
            if (!isDestructuringAssign || destructuredHandleCallName (node.right) === undefined) {
                return printed;
            }
            const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (node) : enclosingFunction (node);
            return retypeDestructuringTemp (csharp, scope, printed) ?? printed;
        };
    }
    csharp._localTypesPatched = true;
}

export default installCsharpLocalTypes;
