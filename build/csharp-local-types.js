// Concrete C# types for generated local variables.
//
// ast-transpiler's C# printer declares every initialised local as `object` unless its own
// getCSharpLocalType() can prove a type (string/bool literals, comparisons, this.extend,
// Object.keys, ...). This module wraps printVariableDeclarationList on the C# printer
// instance and adds the families whose C# value is ALREADY the named type at runtime:
//
//   - hand-written base helpers with a concrete C# signature (cs/ccxt/base/Exchange.*.cs):
//     this.safeString* -> string?, this.safeInteger -> Int64?, this.safeTimestamp* -> Int64?,
//     this.parse8601 -> Int64?, this.safeFloat* -> double?, this.sortBy/filterBy -> List<object>,
//     this.arrayConcat/aggregate -> List<object>, this.indexBy/groupBy -> Dictionary<string, object>, ...
//   - the collection helpers retyped from `object` to IList<object> in every generated file by
//     build/csharpTranspiler.ts#typeCollectionReturns (the filterBy*SinceLimit family, parseTrades /
//     parseOrders / parseOHLCVs / parseTransactions family, marketIds / marketSymbols /
//     currencyIds / marketCodes / marketsForSymbols, parseMarkets / parseCurrencies)
//   - the sync cores retyped upstream in build/csharpTranspiler.ts (SYNC_TYPED_CORES):
//     market/currency/safeMarket/safeCurrency/safeMarketStructure/safeCurrencyStructure and
//     the row builders parseMarket/parseCurrency/createExpiredOptionMarket ->
//     Dictionary<string, object>. The runtime box is the market/currency row itself (the
//     plain dictionaries setMarkets builds), so naming the type moves no box.
//   - the pro-tree ws row builders (parseWsTrade / parseWsOrder / parseWsTicker / parseWsPosition
//     / parseWsBidAsk / parseWsLiquidation / parseWsMyTrade / parseWsBalance / parseWsUta* ...)
//     -> Dictionary<string, object>: the DECLARATION is retyped (CSHARP_WS_ROW_BUILDER_RETURNS,
//     same mechanism as CSHARP_COLLECTION_RETURN_METHODS), so a local fed by one of them needs
//     no cast. Every return of every definition boxes a dictionary — a dict literal, an
//     audited row helper (safeTicker/safeOrder/safeTrade/safePosition), a helper that returns
//     its own dict-literal argument (safeLiquidation/safeBalance), parseTrade/parseOrder/
//     parseTicker/parsePosition, this.account (), or null. Only the call site inherited the
//     #30502 cast-back until now. S50 added the names the table still left out, each on its own
//     return-path proof: parseWsOHLCV -> List<object>, parseWsTrades -> IList<object>,
//     parseWsMarginMode -> string?, plus the venue-local ws builders (parseWSTicker /
//     parseWSSwapOrder / parseTradingOrder / parseFundingRateWs / parsePerpetualTicker /
//     parseSwapTicker / parseOrderTrade) -> Dictionary<string, object>. The parse* REST row
//     builders stay with CSHARP_COLLECTION_RETURN_METHODS.
//   - the ws families (cs/ccxt/ws/Exchange.WsBridge.cs): this.orderBook() / indexedOrderBook()
//     / countedOrderBook() -> ccxt.pro.OrderBook / IndexedOrderBook / CountedOrderBook;
//     `let x: ArrayCache = undefined; ... x = new ArrayCache (limit)` -> ccxt.pro.ArrayCache?;
//     the cached-orderbook reads this.safeValue(this.orderbooks, ...) and this.orderbooks[...]
//     -> ccxt.pro.IOrderBook (the whole map only ever holds orderbook constructors)
//   - the ws client families (cs/ccxt/ws/Client.cs + the getWsRegexes() text pass):
//     `client.subscriptions` / `.rejections` -> IDictionary<string, object> and
//     `client.url` -> string (the hand-written WebSocketClient field types); the
//     `client.futures[key]` reads (printed getValue(...) / this.safeValue(...)) -> Future,
//     behind an exact `(Future)` cast (the only writers store new Future()); the
//     `this.getMessageHash (...)` results -> string? (the generated signature names the
//     type itself — see CSHARP_STRING_RETURN_METHODS; each of the five definitions boxes a
//     string or null)
//   - `this.<member>` reads of the hand-written BaseExchange ws fields
//     (cs/ccxt/base/Exchange.Options.cs): `this.symbols` -> List<object>,
//     `this.isSandboxModeEnabled` -> bool, `this.orders` / `this.myTrades` ->
//     ccxt.pro.ArrayCache (see CSHARP_LOCAL_WS_MEMBER_TYPES)
//   - the per-callee boxes (see the per-definition cast section below): `this.requestId (...)`
//     -> Int64 or string, proven from every return path of the SAME-FILE definition (the
//     sum-of-safeInteger counters box an Int64, the toString/uuid ones a string); the Int64
//     counters also get the typed `Int64 requestId (...)` signature, so their call sites
//     carry no cast (typedRequestIdCall / csharpMethodReturnType);
//     `this.parseOrderBook (...)` -> Dictionary<string, object> moved to the genuine
//     declaration retype (CSHARP_COLLECTION_RETURN_METHODS, S19) — its only definition returns
//     an object literal, so no call site carries a cast any more; a bare `await promiseAll (...)`
//     -> List<object> (the hand-written helper's own Task<List<object>>, no cast needed)
//   - Precise.string* statics (string? / bool)
//   - `this.sum (a, b)` with both arguments provably an integer box (or a nullable integer
//     box): the hand-written (object, object) helper boxes an Int64 for every such input, so the
//     declaration is `Int64`; `this.sum` binds the typed Int64 twins Exchange.Generic.cs carries
//     (integerOverloadCallType) and needs no cast
//   - `a % b` over two provably numeric operands (int / uint / long / Int64 / double, or an
//     Int64? mixed with those): mod's typed twins return the object overload's own Int64 /
//     Int64? box, so the declaration is `Int64` / `Int64?` with NO cast (modTwinCallType)
//   - the crypto/encode helpers retyped object -> the concrete box in this PR, together with
//     the table entries that name it: this.ecdsa / this.Ecdsa -> Dictionary<string, object>
//     (the fresh { r, s, v } signature row, Exchange.Crypto.cs) and this.base16ToBinary /
//     this.ethEncodeStructuredData -> byte[] (ConvertHexStringToByteArray and Nethereum's
//     EncodeTypedDataRaw, Exchange.Encode.cs / Exchange.ETH.cs). `hash` stays `object`
//     (digest "binary" returns Byte[], so its box is not always a string).
//   - this.omitZero (<string box>) -> string? — the hand-written helper's string? overload
//     (cs/ccxt/base/Exchange.Generic.cs) returns that box itself, so the declaration needs
//     no `(string)` cast (see omitZeroStringProducer)
//   - a MARKET ROW read by a literal string key: `market['symbol']` prints
//     `getValue(market, "symbol")` and is declared `string?` behind the `(string)` cast when the
//     receiver is a proven market row and the key is in MARKET_ROW_STRING_KEYS. Receiver shapes:
//     this.market / this.safeMarket / this.safeMarketStructure (and the MARKET_ROW_HELPER_PRODUCERS
//     ws resolvers), a `market: Market` parameter, or a local bound to one of those. Value census
//     (ts/src, checker-typed): the
//     safeMarketStructure skeleton (undefined) plus 150 market-row literals — parseMarket /
//     fetchMarkets builders / safeMarketStructure arguments — with 1,276 fields at these keys,
//     every value a string literal / `string` / `Str` / `undefined`, plus six element writes on
//     MarketInterface-typed receivers (string/Str). The five `any`-typed sites (gate settleId,
//     gemini id, independentreserve baseId/quoteId, mercado baseId) hold strings at runtime
//     (safeString* results, `Object.keys` elements, `.slice`/`.replace` receivers); no boolean,
//     numeric, list or dictionary value exists at these keys anywhere in the corpus, so the cast
//     can never throw where the untyped `object` box did not. The added keys (uppercaseId, subType,
//     optionType, expiryDatetime, feeSide) carry the same census: campaigns/cs90/tools/U01/
//     key-value-census.mjs. The other row keys (bool keys outside MARKET_ROW_BOOL_KEYS: margin /
//     active / quanto / prediction; numerics: contractSize/strike/expiry/numericId; dicts: info /
//     fees / marginModes) stay `object` — same census file, per-key reject reasons in REPORT.md.
//   - a MARKET ROW read by a literal BOOL key: `market['swap']` prints `getValue(market, "swap")`
//     and is declared `bool?` behind the `(bool?)` cast when the key is in MARKET_ROW_BOOL_KEYS
//     (spot/swap/contract/future/option/linear/inverse/index/stock; writer census and fence: the
//     key table below, re-run for the added keys with tools/U01/key-value-census.mjs)
//   - a MARKET ROW read by a literal DICT key (precision/limits): declared
//     `IDictionary<string, object>` behind the `(IDictionary<string, object>)` cast; every writer
//     is an object literal, which the printer boxes as `new Dictionary<string, object>()`
//     (census: tools/U01/key-value-census.mjs — the key table below names the reject reasons for
//     info / fees / marginModes)
//   - a ROW-LIST element read by one of the 12 element-read local names (balance/order/rawOrder/
//     position/rawPosition/trade/rawTrade/ticker/account/tier/chain/networkEntry): the TS checker
//     proves the receiver's element type is a ccxt row shape (`orders: OrderRequest[]`, `trades =
//     this.parseTrades (...)`, `positions = await this.fetchPositions ()`, `networkEntries =
//     rawCurrency as Dict[]`, `accounts = await this.loadAccounts ()`, the tests' `Object.values
//     (response)`), so the box is a decoded row dictionary — declared `IDictionary<string, object>`
//     behind the same interface cast the safeValue-twin family emits (see the U06 section below)
//   - `a + b` (printed `add(a, b)`) whose every operand is provably int / uint / long / Int64,
//     or a double left with a provably numeric right: the typed add overloads of the hand-written
//     base return the same unchecked sum the (object, object) overload's Int64 / double branch
//     computes for those boxes, so the local is `Int64` / `double` with the initializer unchanged
//     (see csharpAddExpressionKind). An int / Int64 left with a double right stays `object` there:
//     the object path's `(Int64)b` unboxing throws where the twin would compute a sum.
//   - this.omit (<Dictionary<string, object> | IDictionary<string, object> box>, keys) ->
//     Dictionary<string, object> — the dict-receiver overloads in Exchange.Functions.cs can
//     never take the IList<object> pass-through branch (neither a Dictionary nor an
//     IDictionary<string, object> box is a list: no type in the tree implements both
//     interfaces), so the call's own C# type is the fresh outDict; object receivers keep the
//     printer's `object` (see omitDictionaryProducer and the selfOmitWriteType accumulator)
//   - this.currencyToPrecision (...) -> string? and this.parsePrecision (...) -> string? —
//     generated signatures retyped by installCsharpMethodReturnTypes (every return path
//     hands back a string or null; the returns unbox through `object` like safeSymbol's)
//   - `this.safeString (obj, key, <default>)` with a PROVEN non-null string default, and the
//     same for safeString2/N and the Lower/Upper variants: the hand-written C# helper returns
//     the found non-empty string, a numeric's invariant string, or `defaultValue as string`,
//     so every return path is a non-null string and the local is `string` behind the
//     `(string)` identity cast (see nonNullStringDefaultCall). Without a default the call
//     keeps its `string?` table entry.
//   - `object x = ccxt.BaseExchange.From<Family>(await this.<core>(...))`: the typed-core funnel
//     (build/csharpTranspiler.ts#wrapTypedCoreConsumers). Every family carries a typed overload
//     `From<Family>(<Family> value)` / `From<Family>List(List<Family> values)` whose result IS the
//     box the object overload's matching arm builds, and the funnel's argument IS the struct, so
//     the call's static type is that box — read from the generated base (typedCoreFunnelType), the
//     same on-disk source the C# compiler compiles.
//   - method calls the printer rewrites by method name alone: x.slice(...) prints
//     `slice(x, ...)` (string? — the helper returns null for a null receiver) and
//     x.includes(...) prints `x.Contains(...)` (bool). The other string/array method
//     families the printer already names itself (split, join, toUpperCase/toLowerCase,
//     trim, replace/replaceAll, indexOf, startsWith/endsWith, ...) are typed upstream
//     and never reach this module.
//   - `<exchangeVar>.<name>(...)`: the generated TESTS hold the exchange in a local or
//     parameter instead of `this` (`exchange.safeString (...)`, `exchange.milliseconds ()`,
//     ...) and call the same base helpers on it. The receiver's C# static type IS an
//     exchange (a `const exchange = new ccxt.Exchange (...)` local prints `var exchange =
//     new ccxt.Exchange (...)`; the test driver's post-print regexes name the `exchange`
//     parameters `Exchange exchange` / `BaseExchange exchange`), so the same
//     CSHARP_LOCAL_THIS_RETURN_TYPES table applies. Only a receiver the TS checker
//     resolves to the ccxt Exchange class — or a subclass (venue) of it — qualifies;
//     an `any`/unresolvable receiver keeps the local `object`.
//   - object / array / numeric literals -> Dictionary<string, object> / List<object> / int;
//     a `{}`-initialised local whose only later writes are this.safeDict / this.omit results
//     takes IDictionary<string, object> (the dictionary twin of the List/IList edge below)
//   - `let x: Str = undefined` -> string? (and Int/Num/Dict/List/boolean aliases)
//   - accumulator locals: the join of the initializer's proven type and every later
//     plain `x = ...` write, widened only along box-identical edges — T/T? for string /
//     bool / double / int / Int64 (a reference `?` is erased; a Nullable<T> boxes as T),
//     List<object> -> IList<object>, and Dictionary<string, object> ->
//     IDictionary<string, object> in the interface-first order only and only when the
//     declaration's own initializer is the interface (a safeDict* result followed by a
//     `{}` / this.extend write; a null-declared local keeps the null-init join's rule).
//     A null write widens to the nullable spelling:
//     `let x = '0'; x = this.safeString (...)` declares `string? x`, not `object x`.
//     An unprovable or non-joinable write (Int64? + int, Dictionary + List<object>,
//     add (...), ...) keeps the local `object` exactly as before.
//   - null-declared collections: a null/undefined initialiser (with or without a Dict /
//     NullableDict / List / NullableList / Strings / Market / Currency annotation) whose
//     every later write is a collection spelling declares the box-identical join —
//     Dictionary + IDictionary -> IDictionary, List + IList -> IList (see
//     NULL_DECLARED_WIDENING_EDGES; the scan still rejects `.push` on a non-list and
//     destructured writes).
//   - copy of a typed local: a local initialised
//     from a READ of a typed local widens a Dictionary initialiser to
//     `IDictionary<string, object>` when a later write stores that interface (the
//     safeDict*/safeList* family's returns): the same dictionary object, the implicit
//     reference conversion assignable() already relies on. That edge travels with the
//     copy's own join only — the other accumulator rules have no such proof.
//   - self-concat accumulator writes: `let x = ''; ... x = x + r;` (and its
//     `r + x` / nested-chain forms) — the value reads the local whose declaration is
//     being decided, so the plain later-writes scan cannot type it. When every
//     contribution so far is a proven non-null string and every operand of the `+`
//     tree is either that same read or a proven non-null string, the write is a
//     proven non-null string too: the call resolves to add(string, string), which
//     returns the concatenation, never null, and agrees with the add(object, object)
//     the untyped local selected for every input reaching it. Any later null write
//     widens the declaration to `string?`, which the left-operand rule of the scan
//     then rejects exactly as today; `x += r` already classifies through the
//     compound-assignment path.
//   - `c ? a : b` arms: identical proven types, T + null -> T? (unifyArms), a
//     Dictionary<string, object> arm beside an IDictionary<string, object> arm (the C#
//     conditional's natural type is the interface — see collectionArmWidening), an `int` arm
//     beside a nullable wide-numeric arm (`cond ? 0 : this.safeInteger (...)`, the C#
//     conditional's own natural type already boxes Int64?/double? — see numericArmWidening),
//     and a READ of
//     a local whose own declaration this module proves (localIdentifierType), or of a
//     `this.<member>` base property with a concrete C# declared type
//     (CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES) — the C# static type at the read is the declared
//     type, so `cond ? typedLocal : 'literal'` can be declared `string?` instead of object.
//     The arm is the only place such a read is resolved: a bare `x = typedLocal`, an
//     argument, a `this.<member>` read outside an arm, and a later-writes scan of a
//     non-ternary value all still see `object`.
//   - `x = c ? D : x` / `x = c ? x : D` write joins (the "default when unset" idiom): exactly
//     one arm reads the very local the accumulator is deciding, so that read has no C# type
//     until the declaration is fixed — the write's contribution is the OTHER arm's proven type
//     (selfTernaryWriteType), and the running type is joined with it like any other write
//     (a box the declaration cannot hold keeps it `object`; a box that already fits by an
//     implicit conversion — Dictionary into its IDictionary declaration — cannot move it at all).
//     ARMS+WRITE ONLY: the value must be the right side of a plain assignment to that local.
//   - `this.omitZero (<string box>)` in an ARM: the hand-written `string? omitZero (string?)`
//     overload binds, so the call's own C# type IS `string?` — the same proof the whole-
//     initialiser path already applies (omitZeroStringProducer), extended to the arm position
//   - `c ? parseInt (v) : null` (parseIntTernaryCastType): the hand-written `object parseInt
//     (object)` boxes an Int64 or null on every path, so the declaration names `Int64?` behind
//     a boundary cast on the whole conditional (`((Int64?)(c ? parseInt (v) : null))`) — the one
//     cast-carrying producer whose printed value is a conditional, hence the extra paren pair
//     the install hook emits when info.castWhole is set
//   - the printer's `((string)add (a, b))` wrap (S07): a throw argument / a startsWith /
//     endsWith / replace argument / a `delete` key whose expression is a `+` chain with a
//     provably string LEFT operand. add(string, *) binds and returns `string`
//     (Exchange.TranspileHelpers.cs), so the cast's target IS the static type — an identity
//     conversion. See installRedundantAddCasts.
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
//   - element reads whose receiver the C# side cannot name (`getValue (recv, key)`):
//     receivers that are parameters (219 census sites), a this.safeList / this.call
//     result (172 + 269 — the element is the caller's data), a dictionary (its values
//     are unknown) and a Promise.all list whose promises are mixed or unproven types.
//     Only a list whose elements a producer above proves takes a named declaration.
//   - `const x: Dict = <expr>` (the 4.4k Dict/List annotations all have an initialiser):
//     the annotation cannot replace an initialiser the printer can only box as `object`
//     (CS0266, no implicit object -> Dictionary conversion) and is redundant when the
//     initialiser is already provable — census: 0 additional locals.
//   - `this.sum (a, b)` / `a % b` sites whose operand is not provable: a parameter (its box
//     is whatever the caller passed), an unproven local, a `double` argument of sum (the
//     object overload hands that double straight back) and the `sum (params object[])`
//     arities. Census on base (131 arithmetic + sum declarations across the three generated
//     trees): 105 are blocked by such an operand — parameters and untyped loop locals
//     dominate — so they keep `object`.
//
//   - `+` chains whose LEFT operand is provably a string (`this.id` — a `string` property
//     on the hand-written base — a string literal, a nested `+` of the same, an
//     `as string` cast, a call the module's own return tables prove `string` / `string?`,
//     or a read of a local this module itself declares `string` / `string?`): those print
//     `add(<string>, ...)`, which resolves to add(string, string) / add(string, object),
//     both declared `string` and never null, so the error-message builds
//     (`feedback = this.id + ' ' + body`) and the chains over an already-typed local
//     (`messageHash = add(add(name, ':'), marketId)`) can be `string`
//
//   - `add(getValue(this.urls, ...), ...)` stays `object`: the printed getValue call is
//     `object`, so the chain's own static type is object and only a cast could name it —
//     and `((string)...)` would throw where the box is null (a missing urls key) or an
//     Int64 (add(object, object) returns a numeric left unchanged, and no call site can
//     prove no url is ever numeric). Census: 107 such chains, all rejected; the same holds
//     for every `getValue(...)` left leaf (149 on base) and for member reads the base does
//     not declare `string` (`this.apiKey`, `this.login`)
//   - `x as string` / `<string>x` -> string (`((string)x)` is the printed cast)
//   - `x as T` for every T the C# printer does NOT cast (`as List` / `as Dict` /
//     `as Strings` / `as string[]` / interfaces / classes / `as unknown`):
//     printAsExpression emits the BARE operand for those, so the local's C# value is
//     exactly the printed operand and its static type is the operand's proven type.
//     `as any` prints `((object)x)` (still an object box, nothing proven) and `as any[]`
//     prints `(IList<object>)(x)` (that cast's own static type)
//   - `string x = <non-null>; ... x = <nullable string>;` widens to string? (the box is a
//     string on both paths; getExtendedStarkAmount / createOrderAppendix / hexToDecimalString
//     are the motivating cases — the string-returns section below needs the returned local
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
//     subtract(object, object) to subtract(int, int) (Int32 box, not Int64); an Int64
//     operand of a plain `-` is accepted — subtract(Int64, Int64) is the same unchecked
//     subtraction of the same boxes the object overload's Int64 branch computes for every
//     sibling operand type (differential harness). `-=` stays rejected for int and Int64:
//     it prints `x = subtract(x, y)`, which only compiles when the resolved overload
//     returns exactly Int64
//   - compound assignment and spread. `[ x, params ] = this.helper (...)` is accepted for
//     the audited request builders (DESTRUCTURED_DICT_HELPERS) because the printer wrapper
//     rewrites the emitted element load with a cast back to the proven type
//   - LEFT operands of `+` / `+=` when the type is `string?`, or any string type with a
//     non-provably-string right operand: the left operand's static type picks the add
//     overload. add(object,object) returns null for a null left where add(string,*)
//     returns the right operand, and add(object,object)'s `(string)b` cast on a
//     non-string right throws InvalidCastException where add(string,object) calls
//     b?.ToString() — so a `string?` local (which can hold null) stays `object`, and a
//     right operand that is not a proven string (an unproven box, a numeric) does too. A
//     non-nullable `string` local is accepted on the left when the right operand is a
//     proven `string` or `string?`: it can never be null (its initializer and every write
//     are proven non-null strings) and add(string,*) is then identical to
//     add(object,object) for every input (a string box, null included).
//     RIGHT operands are always fine: no add(object,string) overload exists, and
//     add(string,string) / add(string,object) are identical for every input
//     (Exchange.TranspileHelpers.cs). Operands of `-`: an int local stays `object` unless
//     the sibling operand is provably not `int` — subtract(int, int) returns an Int32 box
//     where the object path's Int64 branch returns Int64, and wraps at Int32 (differential
//     harness), while an Int64 / uint / long sibling binds subtract(Int64, Int64) and any
//     other proven sibling leaves the (object, object) call; an int / Int64 local
//     on either side of `-=` stays `object` (C# could not assign the result back); an
//     Int64 local of a plain `-` is accepted (see above)
//   - arithmetic residues: `const x = a - b` / `a * b` / `a / b` (prints subtract /
//     multiply / divide(a, b)) get the C# static type of the helper call the operand
//     types resolve to (csharpArithmeticExpressionKind):
//       subtract: (int, int) -> int; any int/uint/long/Int64 pair -> Int64; a
//         (double, int-like / double) pair -> double (subtract(double, double) is the
//         object overload's own double branch); an (int-like, double) pair stays `object`
//         (the object path's Int64 branch unboxes the right operand: a throw the twin
//         would replace with a value — the bind audit pins that class at 0 sites)
//       multiply: any int/uint/long/Int64 pair -> Int64; an int-like / Int64? pair with at
//         least one Int64? -> Int64? (multiply(Int64?, Int64?) is the object overload's
//         null -> null / Int64 branch); a double operand stays `object` (the object
//         overload re-boxes an integer-valued product as Int64, which a double-returning
//         twin could not reproduce)
//       divide:   int/uint/long/Int64 pairs -> Int64 — the object overload's TRUNCATING
//         Int64 branch, not JS division semantics (pre-existing divergence, unchanged
//         here); any pair with a double -> double; an int-like / Int64? pair with at least
//         one Int64? -> Int64? (divide(Int64?, Int64?): null -> null, else the same
//         truncating division)
//     `a % b` prints mod(a, b) and takes modTwinCallType: `Int64` (mod(Int64, Int64) /
//     mod(double, double)) or `Int64?` (mod(Int64?, Int64?)), never a cast.
//     sum is the same shape:
//     `this.sum (a, b)` maps a null argument to 0 and boxes its integer-valued double sum as
//     Int64, and two arguments that are each an integer box (int / uint / long / Int64) or
//     null (Int64?) always sum to an integer, so the box is always Int64 there too.
//     The typed overloads those cases resolve to live in Exchange.TranspileHelpers.cs:
//     subtract's int / Int64 / double twins, multiply(Int64,Int64) / divide(Int64,Int64) /
//     divide(double,double) and the (Int64?, Int64?) twins of multiply / divide / mod plus
//     mod's (Int64,Int64) / (double,double). Each mirrors the (object, object) overload for
//     every operand pair that binds it (value, box type, null, overflow, division by zero),
//     proven by the tree-wide bind audit in campaigns/cs-strict/tools/S57/ (0 DIVERGENT).
//   - typeof on a non-nullable value type (`x is int` is CS0183, an error under
//     TreatWarningsAsErrors)
//   - a local/parameter in scope at the declaration literally named like a C# type token
//     (a same-name binding in a sibling block, or one in a nested block or lambda that
//     does not contain the declaration, does not shadow the token; the check runs in the
//     printed-name domain — ReservedKeywordsReplacements renames — and a binding without
//     a confident scope, i.e. `var`, keeps the conservative reject)
//   - on a non-list local, the methods whose print hard-casts the receiver to IList<object>
//     (x.push / x.reverse / x.join / x.shift / x.pop — `((IList<object>)x)...`), and
//     `const [a, b] = x` destructuring (prints `var abVariable = x;` then casts the
//     synthetic var back to IList<object>)
//
// Scope attribution: both scans above (and the type-token rule) are otherwise per-method —
// ONE same-name binding anywhere in the function used to veto every read/write check of
// this declaration. A use now participates only when it provably refers to this declaration:
// the TypeScript checker decides whenever the transpilation context exposes one (every real
// transpile; measured: 10,169/10,169 corpus skips decided by the checker), a structural walk
// of the TypeScript binding scopes (blocks, case blocks, for headers, catch clauses,
// parameters) is the fallback, and anything ambiguous — a `var` binding, an unresolved use,
// a tie — keeps participating (the conservative direction). This is what lets the two
// `const ts` of sibling if/else blocks type independently: same-name let/const pairs with
// disjoint scopes are common in ts/src (1,492 measured), while NESTED shadowing cannot reach
// the generated tree at all (C# CS0136, regardless of use; the only two nested pairs ts/src
// contains are in the hand-written base — ts/src/base/functions/number.ts and
// ts/src/base/ws/OrderBookSide.ts — which is not part of C# generation).
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
// type). The read must provably refer to a plain local declaration of the SAME function: a
// name bound more than once there (two sibling-block locals, a local shadowing a parameter
// or a destructured binding) is resolved with the scope-aware verdict the read/write scan
// uses — the single binding the use provably refers to decides, anything ambiguous rejects.
// A parameter, a destructured or catch binding, a read before the declaration, a
// multi-declarator list and a source without an initialiser (nothing the printer could have
// typed) reject.
//
// Helpers whose C# signature is `object` (safeValue apart from the
// this.orderbooks read below, safeNumber,
// market, currency, getValue apart from this.orderbooks and the market-row string keys
// above, add, the parse* names outside the per-callee section below, an awaited call whose
// Task<T> this module cannot prove, ...) stay `object`
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
// write is `Object.keys (...)`, a `.split (...)` call, a `this.stringToCharsArray (...)`
// call or an array literal of string literals — the C# those print
// (`new List<object>(((IDictionary<string,object>)x).Keys)`,
// `((string)x).Split (...).ToList<object>()`, the hand-written List<string> of chars,
// `new List<object> { "a" }`) holds nothing but string boxes — with no other write,
// mutating use, alias or escaping call anywhere in the method. There the declaration
// becomes `string?` and the value gets the `(string)` cast
// the compiler needs, `((string)getValue (recv, key))`, which unboxes exactly the string
// the call already returned (or null off the end of the list / for a null receiver).
// The same rule types an array literal the method only ever pushes proven string boxes into
// (`const keys = []; keys.push (this.safeString (...))`) and the list an `await Promise.all`
// built from promises of one proven Task<T> (Dictionary<string, object> / List<object> /
// string, re-boxed by the hand-written PromiseAll through FromTyped).
//
// `await this.<m>(...)` locals are typed from the callee's C# `Task<T>` signature:
//   - CSHARP_LOCAL_AWAIT_RETURN_TYPES below (hand-written base methods, plus the async
//     cores retyped by installCsharpAsyncCoreReturns)
//   - the generated implicit-api wrappers cs/ccxt/api/<id>.cs, read lazily (see
//     awaitedApiReturnTypes) — their `Task<T>` is the exact static type of the awaited
//     call, so a local declared T can never disagree with its callee; the lookup is
//     tier-aware (a ts/src/prediction source reads cs/ccxt/api/prediction/<id>.cs first,
//     because the prediction classes are a separate hierarchy that does not inherit the
//     REST wrappers)
//   - a method declared in the CURRENT source file whose printed C# return the printer
//     already types concretely (see sameFileAwaitedReturnType): `await this.fetchSomething()`
//     where that declaration prints `Task<bool>` / `Task<IDictionary<string, object>>`
//     returns that T. A typed core prints `Task<object>` at print time (its retype is a
//     text pass), so its call sites stay object here.
// Anything else an await can return (a typed core, which the transpiler funnels through
// its From* helper, or a method whose C# return is still `object`) stays `object` —
// `await this.<watch*|subscribe*>(...)` included (census: 418 `object` declarations in the
// pro tree, 12 in the prediction tree, 13 `var` destructuring holders): every one of the 27
// callees is declared `Task<object>` (base watch/watchMultiple in cs/ccxt/ws/Exchange.WsBridge.cs
// plus the venue plumbing helpers) and the box is written by the venue's resolve() at runtime.
// S52 typed the DECLARATION side instead: of the 388 `Task<object>` ws declarations (pro tree
// + both generated base halves) 11 prove a box on every path (CSHARP_AWAITED_CORE_RETURNS
// below). `watch`/`watchMultiple` stay Task<object> — their future's box is the payload the
// venue resolves (dict/list/bool/string per channel), so no single type is honest.
//
// `[a, b] = this.handleM (...)` and `const [a, b] = this.handleM (...)` print through the
// printer's destructuring paths. For this tuple family the printer declares the holder
// `IList<object> tmp = (IList<object>)<call>;` (csharpDestructuringTempType, installed by
// installCsharpLocalTypes below) and indexes it directly in the element reads, `a = tmp[0];`
// — the holder IS the list the call returned, so the hoisted cast is an identity and the
// read needs no re-cast. A holder whose callee this module cannot prove keeps the printer's
// untyped emission: `var tmp = <call>;` plus the `a = ((IList<object>)tmp)[0];` read, which
// retypeDestructuringTemp() below still hoists when the hook is absent. 1,900+ handle* call
// sites (both shapes) carry a real `IList<object>` holder.
//
// The destructured ELEMENTS keep the printer's shape: the holder read is untyped (`X[i]`, or
// `((IList<object>)X)[i]` for an untyped holder), and typing an element needs a cast on the
// read whose spelling agrees with the target's declaration — installDestructuredCasts below
// injects it for the audited targets. The TS checker does type the elements from the call's tuple
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
//
// The STRING half of that candidate list is now implemented, for the null-initialised shard
// (`object x = null;` — the same scan retypes `let x: Str = undefined` locals): element 0 of
// handleParamString / handleParamString2 / handleNetworkCodeAndParams, plus the venue helpers
// handleProductTypeAndParams (bitget) and getMarginMode (gate) whose bodies are safeString2 /
// safeStringLower2 plus string literals only, plus handleMarketTypeAndParams once its two
// unproven paths were closed (the `defaultValue: any` argument is gated per call site and the
// `getValue (market, 'type')` path is backed by a full census of market-row 'type' writers —
// see DESTRUCTURED_STRING_HELPERS). 373 declarations tree-wide become `string? x = null;`
// with the forced `(string)` element cast; the non-string halves (handleParamInteger* /
// handleParamBool* / handlePostOnly / handleHfAndParams / handleOptionAndParams*) stay
// `object`.
//
// cs90 U13 extends that same proof three ways (no new kind of evidence): the LITERAL-initialised
// shard joins it (a `let type = 'spot'` target with the same destructuring write becomes
// `string?`, its own box is the string the helper may hand back — see literalInitElement0Type);
// the defaultValue gate also accepts an argument whose own proven C# type is string / string?
// (`defaultMarket = isMarkPrice ? 'swap' : undefined`, so the helper still hands back a string
// or null); and two venue helpers whose slot IS one of the audited boxes join the table —
// getBybitType (element 0 is its `type`/`subType` from the two handle*AndParams above) and
// resolveAuthType (element 0 its `type`, element 1 its `subType` — the slot table below).
// handleOptionAndParams / handleOptionAndParams2 / handleMarginModeAndParams /
// customHandleMarginModeAndParams / getInstType stay out for the same reason as before: their
// slot holds the CALLER's params value on the `value != null` path, so no cast can be exact.
//
// The destructured ELEMENTS are cast back for element 0 of the helpers below: each of them
// holds a CONCRETELY-TYPED local in that slot on EVERY return path (read off the generated
// C# body, not the TS tuple annotation), so `x = (T)((IList<object>)tmp)[0]` names exactly
// the box the helper produced — see DESTRUCTURED_ELEMENT0_TYPES. Every other helper keeps
// the printer's untyped read: handleOptionAndParams/2 element 0 is the user's params value
// or `defaultValue` (any) — the bool-option shard (U14, BOOL_OPTION_HELPERS) is the audited
// exception, its keys being documented booleans with a bool default argument per call site,
// so the slot holds a boxed bool or null there; handleMarketTypeAndParams returns
// `getValue (market, 'type')` /
// `defaultValue` on two of six paths, handleMarginModeAndParams / handleSubTypeAndParams /
// handleUntilOption thread caller values through. The TS checker does type the elements from
// the call's tuple return type (`[Str, Dict]` -> Str, the `[T, Dict]` overload -> T), but a
// cast is only provable from the method's own C# body.
// The generated non-async string-returning methods (parse*Status and
// friends) no longer belong to that list: the string-returns section above retypes their
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
// ===== string-returning method signatures =====
//
// Concrete C# return types for generated non-async string-returning methods.
//
// The C# printer emits `object` for every non-async method whose TS return type is not
// `void`/`Task` (BaseTranspiler.printFunctionType falls back to DEFAULT_RETURN_TYPE for
// anything else; the bool/bool? family is the only one the printer special-cases). So the
// generated helpers that already end in a string — the priceToPrecision family, the
// parse*Status / parse*Type / parse*mode string mappers built on safeString, the
// encode* / from* / *Precision helpers, ... — were declared `public virtual object`, and
// every local that received their result had to stay `object` on the call site
// (the local-typing tables in this file).
//
// This module retypes the signature — `string` / `string?` — for a CLOSED, per-name table
// (110 names, 400 declarations). A name is listed only when a census of the whole tree
// proved, for EVERY declaration of the name (base Exchange.ts below its delimiter, the
// prediction base, every exchange, the pro tree, the prediction tree):
//
//   * it is a non-async class method (statics and async methods are out of scope),
//   * the resolved TS return type is string-ish: `string`, a union of string literals, or
//     either plus `undefined`/`null` — no other union member,
//   * every `return` expression has a C# form that is ALREADY string-typed: a string
//     literal, `undefined`/`return;`, this.safeString*/safeStringLower*/safeStringUpper*/
//     decimalToPrecision/numberToString (the classifier's own table), `x as string`, a
//     ternary whose arms are one of those, a call to another listed name (fixpoint), or a
//     local whose initializer and every later write are one of those.
//
// A return expression that already prints as a string needs no unboxing; one that does not
// is wrapped in the boundary cast `((string)((object)(x)))` (see stringReturnIsTyped /
// installCsharpStringReturns), which only names the box the value already has. Names with
// any other return shape — calls to helpers whose C# return is `object`
// (safeValue/safeDict/market/forceString/...), object-typed parameters returned directly,
// fetched members — stay `object`; the census for those is in the PR body.
//
// The decision is per NAME, so a base virtual and each of its overrides always print the
// same return type: the override path in printMethodDefinition substitutes the parent's
// printed type only when the override's own print produced `object`, and both prints go
// through the same table lookup.
//
// Deliberately absent although their census is clean:
//   * intToBase16 / binaryToString / uuid5 / exceptionMessage / reduceDigits — declared
//     above the Exchange.ts delimiter or in base/Precise.ts, i.e. already hand-written in
//     C# with a concrete string return; there is no generated signature to retype.
//   * encodeDydxTxForSimulation — hand-written `object` in cs/ccxt/base/Exchange.cs would
//     contradict the generated signature.
//   * getMarketType (ts/src/pro/binance.ts) — its `let type: Str = undefined` receives a
//     destructured `[ type, params ] = handleMarketTypeAndParams (...)`, which the C#
//     printer lowers to untyped list-element reads, so the local can never be typed.
//     (Reported in the PR census; needs a source rewrite, not a signature change.)
//   * marketId / networkCodeToId / networkIdToCode / getMarketType — one return path each
//     hands back a box the callee does not own (the caller's parameter: `return symbol` /
//     `return networkCode`; or an options-derived value: networkIdToCode's `preferredChain`
//     from prioritizedNetworkAliases, getMarketType's handleMarketTypeAndParams (...)[0]),
//     so the unboxing cast could throw where the object return passed the box through.
//
// Call-site proof (whole ts/src tree, admitted names): the only shape whose C# overload
// resolution changes is a listed call as the LEFT operand of `+` — the left operand's
// static type picks the add() family, and a null LEFT differs between add(object, object)
// (null) and add(string, *) (the right operand). The census found 5 such sites, all inert:
// four `this.intToBase16 (...)` chains (that method is hand-written `string` already, so
// the operand was string-typed before and after) and one `this.shortenSlug (name) + '_'`
// whose body is `((string)joined).ToUpper()` — never null. Everywhere else a `string?`
// call converts to `object` implicitly: assignments, arguments, returns, dictionary
// values, `isEqual`/`isTrue` wrappers, `((string)x).ToUpper()` receivers, and RIGHT
// operands of `+` (add(string, object) and add(string, string) are identical for every
// input — Exchange.TranspileHelpers.cs).
//
// IMPORTANT: scan the AST with `node.name.escapedText`, never by printed text — the
// reserved-keyword pass renames some identifiers before printing.
//
// Two local-typing clauses in this file were added for the returns above
// to type through: `x as string` / `<string>x` casts (`((string)x)`, needed by
// getExtendedStarkAmount's write) and the `string` -> `string?` widening of a local whose
// later write is a nullable string (needed by createOrderAppendix / hexToDecimalString).

export const CSHARP_STRING_RETURN_METHODS = {
    'amountToPrecision': 'string?', 'amountToPredictionPrecision': 'string?', 'applyScale': 'string?',
    'calcOrderPrice': 'string?', 'cleanPath': 'string', 'convertToInstrumentType': 'string?', 'convertToX18': 'string?',
    'costToPrecision': 'string?', 'costToPredictionPrecision': 'string?', 'createOrderAppendix': 'string?',
    'createOrderNonce': 'string?', 'currencyFromPrecision': 'string?', 'customUrlencode': 'string?',
    'encodeMarginMode': 'string?', 'encodeOrderSide': 'string?', 'encodeOrderType': 'string?',
    'encodeTriggerPriceType': 'string?', 'encodeValuesWithJson': 'string', 'encodeWorkingType': 'string?',
    'feeToPrecision': 'string?', 'findTimeframe': 'string?', 'fromEn': 'string?', 'fromPrecision': 'string?', 'fromWeiWithDecimals': 'string?',
    'futuresRequestId': 'string?', 'generateClientOrderId': 'string?', 'getAccountTypeFromUrl': 'string', 'getAmount': 'string?',
    'getDexFromHip3Symbol': 'string?', 'getDexFromSymbols': 'string?', 'getExtendedStarkAmount': 'string',
    'getFutureWsCategory': 'string', 'getMyTradesMessageHashSuffix': 'string',
    'getNetworkCodeForCurrency': 'string?', 'getPrivateType': 'string', 'getProductGroupFromMarket': 'string',
    'getSeeds': 'string?', 'getStockTickerFromSymbol': 'string?', 'getSubAccountId': 'string',
    'getTifFromRawOrderType': 'string?', 'getTypeByMarket': 'string?', 'handleTakerOrMaker': 'string?',
    'handleTimeInForce': 'string?', 'handleTradeType': 'string?', 'hexToDecimalString': 'string?', 'mapSide': 'string?',
    'mapTimeInForce': 'string?', 'marketOrderAmountToPrecision': 'string', 'marketOutcomeToSymbol': 'string?',
    'outcomeSearchQuery': 'string?', 'padHex': 'string', 'paraseTransferStatus': 'string?', 'parseAccountId': 'string?',
    'parseAccountType': 'string?', 'parseDepositStatus': 'string?', 'parseFundingInterval': 'string?',
    'parseLedgerDirection': 'string?', 'parseLedgerEntryDirection': 'string?', 'parseLedgerEntryStatus': 'string?',
    'parseLedgerStatus': 'string?', 'parseLedgerType': 'string?', 'parseMarginModeType': 'string?',
    'parseMarginStatus': 'string?', 'parseMarginType': 'string?', 'parseMarketType': 'string?', 'parseOrderSide': 'string?',
    'parseOrderState': 'string?', 'parseOrderStatus': 'string?', 'parseOrderTimeInForce': 'string?',
    'parseOrderTimeInForceInteger': 'string?', 'parseOrderType': 'string?', 'parseOrderTypeByMarket': 'string?',
    'parseOrderTypeInteger': 'string?', 'parseOutcomeInputSideHint': 'string?', 'parseStatus': 'string?',
    'parseTakerOrMaker': 'string?', 'parseTimeInForce': 'string?', 'parseTradeSide': 'string?', 'parseTradeType': 'string?',
    'parseTradingOrderStatus': 'string?', 'parseTransactionDepositStatus': 'string?', 'parseTransactionState': 'string?',
    'parseTransactionStatus': 'string?', 'parseTransactionType': 'string?', 'parseTransactionWithdrawalStatus': 'string?',
    'parseTransferStatus': 'string?', 'parseTransferType': 'string?', 'parseType': 'string?', 'parseUnits': 'string?',
    'parseValueToPricision': 'string?', 'parseWithdrawalStatus': 'string?', 'parseWsOrderSide': 'string?',
    'parseWsOrderStatus': 'string?', 'parseWsOrderType': 'string?', 'parseWsPositionSide': 'string?',
    'parseWsTimeInForce': 'string?', 'pow': 'string?', 'priceToPrecision': 'string?', 'priceToPredictionPrecision': 'string?',
    'scaleNumber': 'string?', 'shortenSlug': 'string', 'signCancelAll': 'string', 'signClobOrder': 'string',
    'signOrderbookTypedData': 'string', 'stream': 'string?', 'symbol': 'string?', 'toOrderbookWei': 'string?',
    'tokenIdToSymbol': 'string?', 'typeToTradeType': 'string?', 'walletAddressFromKeys': 'string',
    'walletAddressOrUndefined': 'string?'
};

// U27 census: the generated non-async helpers whose EVERY return, in EVERY declaration of
// the name (base, exchanges, pro, prediction), is provably a C# `string`-or-null box:
// string literals, this.safeString*/decimalToPrecision/numberToString, `x as string`,
// ternaries or `+` chains of those, calls to a name listed here (fixpoint), and locals
// whose initializer and every later plain write are one of those (including the
// self-concatenating accumulator `s = s + x`). A return that does not already print as a
// string is emitted with the boundary cast `((string?)((object)(x)))`, which only names
// the box the value already has (null in, null out) — see installCsharpStringReturns.
// Names whose declaration C# types disagree with the hand-written base, that a sibling
// table already retypes, or whose returns include a bare parameter/deep read stay `object`.
const CSHARP_STRING_RETURN_METHODS_U27 = {
    'convertDerivativesId': 'string?', 'convertExpireDate': 'string?', 'convertExpireDateToMarketIdDate': 'string?',
    'convertMarketIdExpireDate': 'string?', 'convertSecretToPem': 'string?', 'createAuthToken': 'string',
    'createCcxtTradeId': 'string?', 'createSubaccount': 'string', 'findBroadlyMatchedKey': 'string?',
    'generateBatchPayload': 'string', 'getBaseDomainFromUrl': 'string?',
    'getCurrencyIdFromTransaction': 'string?', 'getExtendedDecimalToBase16': 'string?', 'getGen2MarketId': 'string?',
    'getMarketIdByType': 'string?', 'getNetworkCodeByNetworkUrl': 'string?', 'getOrdersMessageHashSuffix': 'string',
    'integerPrecisionToAmount': 'string?', 'normalizeTagKey': 'string?', 'oath': 'string',
    'orderVerifyingContract': 'string', 'pairToSymbol': 'string?', 'prepareMessage': 'string?',
    'removeCommaFromValue': 'string?', 'signL1AndPrepareTxInfo': 'string?',
    'toSandboxMarketId': 'string?',
    // S10: this.getMessageHash was the string member of CSHARP_LOCAL_CAST_CALL_TYPES (the
    // call site carried `((string)…)` back). Its five generated definitions (ts/src/pro/
    // {kraken,krakenfutures,kucoin,bingx,lighter}.ts) all build the hash from their `string`
    // first parameter plus string literals / `this.symbol (...)` through the add() chain, so
    // every return boxes a string or null; the signature now names `string?` itself and the
    // 37 call-site casts are gone.
    'getMessageHash': 'string?'
};
Object.assign (CSHARP_STRING_RETURN_METHODS, CSHARP_STRING_RETURN_METHODS_U27);

// S35 census: the roster's string-boxed venue helpers, proven per declaration. networkIdToCode
// (2 declarations): base returns undefined | the safeString(...) local | chainPair[0] of
// prioritizedNetworkAliases, whose every writer (the base default options table) fills string
// pairs; htx hands back a super call. marketId (1): market['id'] is the MARKET_ROW_STRING_KEYS
// proof and `return symbol` is dead — all three market() declarations throw before returning null.
const CSHARP_STRING_RETURN_METHODS_S35 = {
    'marketId': 'string?',
    'networkIdToCode': 'string?',
};
Object.assign (CSHARP_STRING_RETURN_METHODS, CSHARP_STRING_RETURN_METHODS_S35);


// S51 census: 72 further generated non-async names whose EVERY declaration's every return path
// boxes a string or null (per-site evidence in the S51 report). Bodies are byte-identical for
// the 25 names below; the 47 in the boundary table have one remaining return whose object box
// the census proved string-or-null and take the U27 boundary cast.
const CSHARP_STRING_RETURN_METHODS_S51 = {
    'ethChecksumAddress': 'string?', 'generateRandomClientIdOmni': 'string?',
    'getMarketType': 'string?', 'intToRlpHex': 'string?', 'keccakMessage': 'string?', 'outcomeCoin': 'string?',
    'outcomeToken': 'string?', 'padHexAddress': 'string?', 'rlpEncodeList': 'string?',
    'signApiKeyAuth': 'string?',
    'signClobAuth': 'string?', 'signEvmTransaction': 'string?',
    'signOpinionOrder': 'string?',
    'slugToMarketSymbol': 'string?', 'slugToOutcomeSymbol': 'string?',
    'stringToBase16': 'string?'
};
const CSHARP_STRING_RETURN_METHODS_S51_BOUNDARY = {
    'actionAndMarketMessageHash': 'string?', 'actionAndOrderIdMessageHash': 'string?', 'addHyphenBeforeUsdt': 'string?',
    'buildOutcomeParentSymbol': 'string?', 'buildOutcomeSymbol': 'string?', 'checkAddress': 'string?',
    'coinToMarketId': 'string?', 'commonCurrencyCode': 'string?', 'createAuth': 'string?',
    'createOrderIdFromParts': 'string?', 'customEncode': 'string?', 'formatNumber': 'string?',
    'formatSignatureRS': 'string?', 'formatVaultAddress': 'string?', 'forceString': 'string?',
    'fromSandboxMarketId': 'string?', 'getAccountTypeFromSubscriptions': 'string?', 'getCost': 'string?',
    'getExtendedOrderMsgHash': 'string?', 'getExtendedSignatureHex': 'string?', 'getExtendedTransferMsgHash': 'string?',
    'getExtendedWithdrawalMsgHash': 'string?', 'getPrivateUrl': 'string?', 'getPrivateWsUrl': 'string?',
    'getStockUnifiedSymbol': 'string?', 'getUrl': 'string?', 'getUserStreamUrl': 'string?', 'getWalletAddress': 'string?',
    'getWsPrivateUrl': 'string?', 'getWsPublicUrl': 'string?', 'hexToRlpBytes': 'string?', 'networkCodeToChainId': 'string?',
    'opinionWsUrl': 'string?', 'orderbookChecksumMessage': 'string?', 'padHexToEven': 'string?',
    'parseArrayParam': 'string?', 'parseLedgerEntryType': 'string?', 'parsePositionSide': 'string?',
    'parseWsMarginMode': 'string?', 'removeMarketSuffix': 'string?', 'rlpEncodeBytes': 'string?', 'signDydxTx': 'string?',
    'tagToSlug': 'string?', 'timeframeFromMilliseconds': 'string?', 'updateSpotCurrencyCode': 'string?',
    'urlEncodeQuery': 'string?', 'urlencodeWithArrayBrackets': 'string?'
};
Object.assign (CSHARP_STRING_RETURN_METHODS_U27, CSHARP_STRING_RETURN_METHODS_S51_BOUNDARY);
Object.assign (CSHARP_STRING_RETURN_METHODS, CSHARP_STRING_RETURN_METHODS_S51, CSHARP_STRING_RETURN_METHODS_S51_BOUNDARY);

// the names whose return statements may carry the boundary cast: the U27 census table
// (S51's boundary entries included above) plus the S35 entries (same per-declaration
// proof, so the same wrap is permitted)
const CSHARP_STRING_BOUNDARY_CAST_NAMES = Object.assign ({}, CSHARP_STRING_RETURN_METHODS_U27, CSHARP_STRING_RETURN_METHODS_S35);

// S54 census: the remaining sync `object` venue helpers whose EVERY declaration (all tiers)
// is non-async, prints `object`, passes the stringishReturn checker gate and returns on
// every path a literal / `+` chain with a proven string left operand / a call the tables
// above already name / a proven local (campaigns/cs-strict/tools/S54, REPORT.md).
// formatNumber / opinionWsUrl / urlEncodeQuery / urlencodeWithArrayBrackets return a PROVEN
// string value the C# declares `object` (a local / an add chain over one): stringReturnIsTyped
// cannot see it, so their returns would reach a `string` signature without the boundary cast
// (CS0266) — they live in CSHARP_METHOD_RETURN_TYPES instead, which always casts.
// Rejected with the same census: ping (dict literals beside strings), handlePong and the
// other ws handlers (`return message` — the caller's box), signHash (dict builds in
// dydx/hyperliquid), hashMessage (dydx returns the `object` `this.hash (...)` box).
const CSHARP_STRING_RETURN_METHODS_S54 = {
    'ethChecksumAddress': 'string', 'keccakMessage': 'string',
    'outcomeCoin': 'string', 'outcomeToken': 'string',
    'signApiKeyAuth': 'string', 'signClobAuth': 'string', 'signOpinionOrder': 'string'
};
Object.assign (CSHARP_STRING_RETURN_METHODS, CSHARP_STRING_RETURN_METHODS_S54);

// the printer's declared return type must still be `object` (bool/Task/anything the printer
// already proved is left alone), and the node must be an emitted, non-async method
function stringReturnType (csharp, node, own) {
    if (own !== 'object') {
        return undefined;
    }
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration || node.name === undefined) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (node)) {
        return undefined;
    }
    const name = node.name.escapedText;
    const stringType = CSHARP_STRING_RETURN_METHODS[name];
    if (stringType === undefined) {
        return undefined;
    }
    // defense in depth: only retype while the checker still resolves a string-ish return
    // (a future TS change that makes one declaration non-string would otherwise silently
    // emit `string?` for a body that returns something else)
    if (!stringishReturn (csharp, node)) {
        return undefined;
    }
    return stringType;
}

function stringishReturn (csharp, node) {
    if (typeof csharp.getChecker !== 'function') {
        return true;
    }
    try {
        const checker = csharp.getChecker ();
        const signature = checker.getSignatureFromDeclaration (node);
        if (signature === undefined) {
            return true;
        }
        const type = checker.getReturnTypeOfSignature (signature);
        const members = (type.flags & ts.TypeFlags.Union) ? type.types : [ type ];
        let sawString = false;
        for (const member of members) {
            const flags = member.flags;
            if (flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) {
                continue;
            }
            if (flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral)) {
                sawString = true;
                continue;
            }
            return false;
        }
        return sawString;
    } catch (e) {
        return true;
    }
}

// true when a `return <expr>;` of a listed method already prints a string: a literal, a
// bare `null`/`undefined`, or an expression this module proves has a string static type
// (this.safeString*, a call to another listed name, a `((string)x)` cast, a ternary or
// `+` chain whose operands qualify, a string local, `x.slice(...)`, ...). Only the
// remaining returns — object-typed boxes the census proved hold a string or null — carry
// the boundary cast, so every other return line stays byte-identical.
function stringReturnIsTyped (csharp, expression) {
    if (expression === undefined) {
        return true;
    }
    switch (expression.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
    case ts.SyntaxKind.NullKeyword:
        return true;
    }
    if (expression.kind === ts.SyntaxKind.Identifier && expression.escapedText === 'undefined') {
        return true;
    }
    if (typeof csharp.csharpTypeOfInitializer === 'function') {
        const own = csharp.csharpTypeOfInitializer (expression);
        if (own === 'string' || own === 'string?') {
            return true;
        }
    }
    try {
        const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (expression) : enclosingFunction (expression);
        const type = csharpTypeOfValue (csharp, expression, { scope, stack: new Set (), depth: 0 });
        return type === 'string' || type === 'string?';
    } catch (e) {
        return false; // on any doubt the cast is the safe direction (the box is proven)
    }
}

// wrap printFunctionType on a Transpiler's C# printer. Idempotent. Every method the
// printer already typed (bool/bool?, void, Task<...>) and every method outside the table
// is returned untouched; only an `object` print of a listed name is replaced, and only
// the return statements that do not already print a string take the boundary cast.
export function installCsharpStringReturns (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printFunctionType !== 'function' || csharp._stringReturnsPatched) {
        return;
    }
    const upstream = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node) => {
        const own = upstream (node);
        const stringType = stringReturnType (csharp, node, own);
        return (stringType === undefined) ? own : stringType;
    };
    const upstreamReturnStatement = csharp.printReturnStatement.bind (csharp);
    csharp.printReturnStatement = (node, identation) => {
        // nearest function-like: a `return` inside an arrow/function expression belongs to
        // that callback, never to the enclosing listed method
        const scopeFunction = ts.findAncestor (node.parent, ts.isFunctionLike);
        const stringType = stringReturnType (csharp, scopeFunction, 'object');
        // only the U27/S35 names carry the boundary cast — the original names' bodies are
        // byte-identical (their census proved every return already prints a string)
        if (stringType === undefined || !Object.prototype.hasOwnProperty.call (CSHARP_STRING_BOUNDARY_CAST_NAMES, scopeFunction?.name?.escapedText)
            || !node.expression || stringReturnIsTyped (csharp, node.expression)) {
            return upstreamReturnStatement (node, identation);
        }
        // the printed expression keeps its upstream shape; the cast only names the box
        const leadingComment = csharp.printLeadingComments (node, identation);
        let trailingComment = csharp.printTraillingComment (node, identation);
        trailingComment = trailingComment ? ' ' + trailingComment : trailingComment;
        const value = csharp.printNode (node.expression, identation).trim ();
        return leadingComment + csharp.getIden (identation) + csharp.RETURN_TOKEN + ` ((${stringType})((object)(${value})))` + csharp.LINE_TERMINATOR + trailingComment;
    };
    csharp._stringReturnsPatched = true;
}

// ===== dict/list-returning method signatures =====
//
// Concrete C# return types for generated non-async methods whose every return path already
// produces a Dictionary<string, object> / List<object> box: the request/argument builders
// (`...Request`), the handle*/parse*/describe helpers and the symbol/index utilities whose
// returns are object/array literals, calls to the hand-written `extend`/`deepExtend` (their
// C# signatures in cs/ccxt/base/Exchange.Generic.cs already name the type), calls to another
// listed name (fixpoint), or locals the local-typing pass proves for the same reason.
//
// Closed per-NAME table, audited like the string-returns section above: a name is listed
// only when a census of the whole tree (base Exchange.ts below its delimiter, the prediction
// base, every exchange, the pro tree, the prediction tree) proved that EVERY declaration
// returns only boxes of the mapped type. The decision is per name, so a base virtual and
// each of its overrides always print the same return type (CS0508 holds), and no listed
// method has a hand-written `object` declaration to contradict.
//
// A return expression that does NOT already print as the mapped type is wrapped in the same
// boundary cast CSHARP_METHOD_RETURN_TYPES emits: `((T)((object)(x)))`. The cast only names
// the box the value already has (null in, null out), so runtime semantics do not move;
// object/array literals and the extend/deepExtend calls the printer already types are
// emitted untouched.
export const CSHARP_COLLECTION_RETURN_METHODS = {
    // Dictionary<string, object> — the request builders, the describe/parse helpers and
    // the index/invert/dict utilities
    'account': 'Dictionary<string, object>', 'batchOrdersRequest': 'Dictionary<string, object>', 'buildClobOrderBody': 'Dictionary<string, object>', 'buildOrderbookOrder': 'Dictionary<string, object>',
    'calculateFeeWithRate': 'Dictionary<string, object>', 'capitalizeKeys': 'Dictionary<string, object>', 'clobOrderMessage': 'Dictionary<string, object>', 'constructCurrencyObject': 'Dictionary<string, object>',
    'constructPhantomAgent': 'Dictionary<string, object>', 'convertOHLCVToTradingView': 'Dictionary<string, object>', 'createAdvancedOrderRequest': 'Dictionary<string, object>', 'createEditOrderRequest': 'Dictionary<string, object>',
    'createOHLCVObject': 'Dictionary<string, object>', 'createOrderSettlementData': 'Dictionary<string, object>', 'createPublicRequest': 'Dictionary<string, object>', 'createPublicSubscriptionRequest': 'Dictionary<string, object>',
    'createRegularOrderRequest': 'Dictionary<string, object>', 'createSwapOrderRequest': 'Dictionary<string, object>', 'createTpslOrderRequest': 'Dictionary<string, object>', 'createTransferSettlementData': 'Dictionary<string, object>',
    'createTriggerOrderRequest': 'Dictionary<string, object>', 'createUtaOrderRequest': 'Dictionary<string, object>', 'createWSAuth': 'Dictionary<string, object>', 'createWithdrawalSettlementData': 'Dictionary<string, object>',
    'customParseOrderBook': 'Dictionary<string, object>', 'defaultSignature': 'Dictionary<string, object>', 'depositWithdrawFee': 'Dictionary<string, object>', 'describe': 'Dictionary<string, object>',
    'describeData': 'Dictionary<string, object>', 'editContractOrderRequest': 'Dictionary<string, object>', 'editOrdersRequest': 'Dictionary<string, object>', 'editSpotOrderRequest': 'Dictionary<string, object>',
    'eipDefinitions': 'Dictionary<string, object>', 'eipDomainData': 'Dictionary<string, object>', 'eipMessageForOrder': 'Dictionary<string, object>', 'fetchDepositsRequest': 'Dictionary<string, object>',
    'fetchMyTradesRequest': 'Dictionary<string, object>', 'fetchOHLCVRequest': 'Dictionary<string, object>', 'fetchOrdersRequest': 'Dictionary<string, object>', 'fetchWithdrawalsRequest': 'Dictionary<string, object>',
    'getDefaultOptions': 'Dictionary<string, object>', 'getDescribeForExtendedWsExchange': 'Dictionary<string, object>', 'getMarketFromClientAndMessage': 'Dictionary<string, object>', 'getMarketFromOrder': 'Dictionary<string, object>',
    'getSubscriptionRequest': 'Dictionary<string, object>', 'hardcodedCurrencies': 'Dictionary<string, object>', 'indexPositionBreakList': 'Dictionary<string, object>', 'invertFlatStringDictionary': 'Dictionary<string, object>',
    // base-only (1 declaration, no venue override): two `return undefined` paths (printed
    // `return null`) and `return market`, the local `this.market(...)` fills (the same
    // Dictionary row) — every path boxes that row or null.
    'getMarketFromSymbols': 'Dictionary<string, object>',
    'opinionOrderRawAmounts': 'Dictionary<string, object>', 'parseAccountPosition': 'Dictionary<string, object>', 'parseAccountSettings': 'Dictionary<string, object>', 'parseBidAskCustom': 'Dictionary<string, object>',
    // U49: ts/src/base/Exchange.ts#safeBalance — ONE declaration in the whole tree, one return
    // path, `return balance as any` where `balance` is the `Dict` parameter, i.e. the box is the
    // caller's own balance row. The body already unboxes the parameter on its first write
    // (`((IDictionary<string,object>)balance)["free"] = …`), so naming the type moves the 84
    // call sites' unbox into the body on the SAME value: no runtime change, and the boundary
    // cast the callers carried becomes an identity box.
    'safeBalance': 'Dictionary<string, object>',
    // U49: ts/src/base/Exchange.ts#safeLiquidation — same proof as safeBalance: ONE
    // declaration, one return path `return liquidation as Liquidation` where `liquidation` is
    // the `Dict` parameter, and the body ALREADY unboxes it five lines earlier
    // (`((IDictionary<string,object>)liquidation)["contracts"] = …`), so a non-dict caller
    // throws today. The unbox the retype adds sits at the `return`, i.e. strictly after the
    // body's own unbox: no call site can fail that does not already fail. All in-tree callers
    // pass a fresh `new Dictionary<string, object>() {...}` literal.
    'safeLiquidation': 'Dictionary<string, object>',
    'parseBorrowRateHistories': 'Dictionary<string, object>', 'parseBorrowRates': 'Dictionary<string, object>', 'parseContractMarket': 'Dictionary<string, object>', 'parseCurrenciesCustom': 'Dictionary<string, object>',
    // parseBorrowRate: the BaseExchange `throw` stub plus 7 venue overrides whose only return is
    // an object literal, so base virtual and every override print one type (the stub has no
    // return path at all); every caller reads one borrow-rate row.
    'parseBorrowRate': 'Dictionary<string, object>',
    'parseCurrencyCustom': 'Dictionary<string, object>', 'parseDepositMethodId': 'Dictionary<string, object>', 'parseDepositWithdrawFees': 'Dictionary<string, object>', 'parseDustTrade': 'Dictionary<string, object>',
    'parseFeeTiers': 'Dictionary<string, object>', 'parseLedgerComment': 'Dictionary<string, object>', 'parseLeverages': 'Dictionary<string, object>', 'parseMarginLoan': 'Dictionary<string, object>',
    'parseMarginModes': 'Dictionary<string, object>', 'parseMarketToEvent': 'Dictionary<string, object>', 'parseNetworks': 'Dictionary<string, object>', 'parseOptionChain': 'Dictionary<string, object>',
    // ts/src/base/Exchange.ts#parseOrderBook is the only declaration in the tree and its
    // single return is an object literal — moved off the #30502 cast-back
    // (CSHARP_LOCAL_EXACT_CAST_CALL_TYPES) to the declaration retype, so its 72 call sites
    // lose the `((Dictionary<string, object>)this.parseOrderBook (...))` cast (S19)
    'parseOrderBook': 'Dictionary<string, object>',
    // the parse* row builders: a census of all 333 declarations found every return path
    // ending in safeTicker / safeOrder / safeTrade / safePosition (a row the producer returns
    // unchanged), a peer builder with the same single return, a literal, or a typed local
    'parseOrder': 'Dictionary<string, object>', 'parsePosition': 'Dictionary<string, object>',
    'parseTicker': 'Dictionary<string, object>', 'parseTrade': 'Dictionary<string, object>',
    // parseTickers: the BaseExchange declaration and hollaex's override, whose only returns are
    // `this.filterByArray (results, 'symbol', symbols)` (3-argument default) and the same box
    // through filterByArrayTickers — indexBy's Dictionary, so the override pair moves together.
    'parseTickers': 'Dictionary<string, object>',
    // parseBalance (the BaseExchange declaration + 79 venue overrides): every override hands its
    // own argument back (this.safeBalance(<local>)), the local is initialised by an object
    // literal and never reassigned (79/79 censused), so the boundary cast names the existing box.
    'parseBalance': 'Dictionary<string, object>',
    // safeBalance itself stays `object`: its value IS its own `object` argument, and 22 ws call
    // sites pass `this.balance` (a ccxt.pro.CustomConcurrentDictionary, NOT a Dictionary), so a
    // Dictionary spelling would throw/null those boxes.
    'parseOutcomeDescription': 'Dictionary<string, object>', 'parsePublicDepositWithdrawFees': 'Dictionary<string, object>', 'parseSettlement': 'Dictionary<string, object>', 'parseSpotMarket': 'Dictionary<string, object>',
    // the prediction sweep's own helper names (cs/ccxt/base/PredictionExchange.cs and the seven
    // venue files — no other tree declares any of them; census: 0 hits in cs/ccxt/exchanges/*.cs
    // and cs/ccxt/exchanges/pro/*.cs). Return-path proofs, read from those declarations:
    //   parsePredictionPositions  one return, the `List<object> results` local it fills
    //   safePredictionPosition    one return, the fresh `Dictionary` result literal it builds
    //   parsePredictionPosition   base throws NotSupported; all 7 overrides return
    //                             this.safePredictionPosition ({...}) or a dict literal (limitless)
    //   parseMyriadMarket / parseTopicMarket  single return of a dict literal
    //   parseOutcomeMarket        single return, this.omit (<Dictionary local>, "symbol")
    //   getOutcomeBySlugAndLabel  the `IDictionary<string, object> outcome` local (this.safeDict
    //                             result) or null
    //   opinionOutcomeByMarketIdSide  this.safeDict (outcomes, index) or null
    //   getPositionFromClobEntry  null or this.safePredictionPosition (parsed)
    'parsePredictionPositions': 'List<object>', 'parsePredictionPosition': 'Dictionary<string, object>', 'safePredictionPosition': 'Dictionary<string, object>',
    'parseMyriadMarket': 'Dictionary<string, object>', 'parseTopicMarket': 'Dictionary<string, object>', 'parseOutcomeMarket': 'Dictionary<string, object>',
    'getOutcomeBySlugAndLabel': 'IDictionary<string, object>', 'opinionOutcomeByMarketIdSide': 'IDictionary<string, object>', 'getPositionFromClobEntry': 'Dictionary<string, object>',
    // prediction tier only (no other tree declares the name): every one of the 7
    // declarations (binance, hyperliquid, kalshi, limitless, myriad, opinion, polymarket)
    // has a single return path — a fresh `{...}` object literal in binance, `this.extend
    // ({...} | raw, {...})` in the other six — so the printed box is a Dictionary on every
    // path and the 16 `object x = this.parseEvent (...)` locals take that type.
    'parseEvent': 'Dictionary<string, object>',
    'parseSwapMarket': 'Dictionary<string, object>', 'parseTradeQuote': 'Dictionary<string, object>', 'parseTradingFees': 'Dictionary<string, object>', 'parseTradingLimits': 'Dictionary<string, object>',
    'parseTransactionFee': 'Dictionary<string, object>', 'parseTransactionFees': 'Dictionary<string, object>', 'parseWsAllBidsAsks': 'Dictionary<string, object>', 'polymarketOrderRawAmounts': 'Dictionary<string, object>',
    'postActionRequest': 'Dictionary<string, object>', 'prepareAccountRequest': 'Dictionary<string, object>', 'removeKeysFromDict': 'Dictionary<string, object>', 'safeLedgerEntry': 'Dictionary<string, object>',
    'safeNetwork': 'Dictionary<string, object>', 'safeOpenInterest': 'Dictionary<string, object>', 'safeOrder': 'Dictionary<string, object>', 'safePosition': 'Dictionary<string, object>', 'safeTicker': 'Dictionary<string, object>',
    // the trade/position row producers the four parsers below hand back unchanged: each has
    // a single return, the input row itself, after the body wrote fee/fees/amount/price/cost
    // (safeTrade) or percentage/contractSize (safePosition) through an IDictionary hard cast
    'safeTrade': 'Dictionary<string, object>',
    // prediction tier only (cs/ccxt/base/PredictionExchange.cs, the whole cs/ccxt/exchanges
    // tree declares none of these names): safeOutcome / loadOutcome hand back a row of
    // this.outcomes / this.outcomes_by_id — every writer records an IDictionary<string, object>
    // (indexMarketOutcomes hard-casts each row before the write, hyperliquid stores a
    // safeDict result) — or the fresh Dictionary literal. The 2-arg passthrough returns the
    // caller's outcomeObj behind the boundary cast; every in-tree 2-arg caller passes a
    // market row (safeMarket/parseMarket result / `market as any`), and the 1-arg call sites
    // (the 48 cast-backs this unit removed) are map reads.
    'safeOutcome': 'IDictionary<string, object>',
    'setApiCredentials': 'Dictionary<string, object>', 'signParams': 'Dictionary<string, object>', 'withdrawRequest': 'Dictionary<string, object>', 'wrapAsPostAction': 'Dictionary<string, object>',
    // sign (every tier): the request-description dict. Every return path of all 101 venue
    // overrides and of the generated base stub is an object literal (mudrex 3, the rest 1
    // each), so base virtual and overrides print one type; the hand-written twin already says dict.
    'sign': 'Dictionary<string, object>',
    // hyperliquid only (ts/src/hyperliquid.ts + ts/src/prediction/hyperliquid.ts): each of the
    // two declarations has exactly one return path, and both hand back that venue's own
    // signMessage -> signHash result, which is the { r, s, v } row dictionary it builds
    'signL1Action': 'Dictionary<string, object>',
    // List<object> — the [value, params] handlers, the object->list helpers and the
    // parse*/load* list producers
    'addKeyInArrayItems': 'List<object>', 'arraysConcat': 'List<object>', 'buildGen2SubscriptionRequest': 'List<object>', 'buildOHLCVC': 'List<object>',
    'checkProxySettings': 'List<object>', 'checkWsProxySettings': 'List<object>', 'convertTradingViewToOHLCV': 'List<object>', 'customHandleMarginModeAndParams': 'List<object>',
    'customParseBidAsk': 'List<object>', 'eventsList': 'List<object>', 'expandGroupRows': 'List<object>', 'extractTypeFromDelta': 'List<object>',
    'fetchOrderRequest': 'List<object>', 'filterTransfersByType': 'List<object>', 'findMessageHashes': 'List<object>', 'getActiveSymbols': 'List<object>',
    'getBybitType': 'List<object>', 'getDedicatedNetworkId': 'List<object>', 'getInstType': 'List<object>', 'getListFromObjectValues': 'List<object>',
    'getMarginMode': 'List<object>', 'getMessageHashesForTickersUnsubscription': 'List<object>', 'getOrderChannelAndMessageHash': 'List<object>', 'getV5LinearChannelAndMessageHash': 'List<object>',
    // the generated-BaseMethods tuple handlers: every return path is an array literal
    // (handleMarginModeAndParams's single return is the now-list-typed handleOptionAndParams),
    // so naming the list moves no box and the destructuring holder drops its call cast
    'handleMarginModeAndParams': 'List<object>', 'handleMarketTypeAndParams': 'List<object>', 'handleOptionAndParams': 'List<object>',
    'handleOptionAndParams2': 'List<object>', 'handleParamString': 'List<object>', 'handleParamString2': 'List<object>',
    'handleApiKeyIndex': 'List<object>', 'handleDeriveSubaccountId': 'List<object>', 'handleDeriveWalletAddress': 'List<object>', 'handleHfAndParams': 'List<object>',
    'handleMaxEntriesPerRequestAndParams': 'List<object>', 'handleNetworkCodeAndParams': 'List<object>', 'handleOriginAndSingleAddress': 'List<object>', 'handleParamBool': 'List<object>',
    'handleParamBool2': 'List<object>', 'handleParamInteger': 'List<object>', 'handleParamInteger2': 'List<object>', 'handlePostOnly': 'List<object>',
    'handleProductTypeAndParams': 'List<object>', 'handlePublicAddress': 'List<object>', 'handleRequestNetwork': 'List<object>', 'handleSubTypeAndParams': 'List<object>',
    'handleTriggerAndParams': 'List<object>', 'handleTriggerDirectionAndParams': 'List<object>', 'handleTriggerOptionAndParams': 'List<object>', 'handleTriggerPrices': 'List<object>',
    'handleTriggerPricesAndParams': 'List<object>', 'handleTypePostOnlyAndTimeInForce': 'List<object>', 'handleUntilOption': 'List<object>', 'handleUntilOptionString': 'List<object>',
    'handleWithdrawTagAndParams': 'List<object>', 'idsQueryStrings': 'List<object>', 'multiOrderSpotPrepareRequest': 'List<object>', 'orderRequest': 'List<object>',
    'orderRequestWs': 'List<object>', 'ordersToTrades': 'List<object>', 'parseAccountPositions': 'List<object>', 'parseAccounts': 'List<object>',
    'parseAddress': 'List<object>', 'parseBinaryMarketToOutcomes': 'List<object>', 'parseCancelOrders': 'List<object>', 'parseContractBidsAsks': 'List<object>',
    'parseCreateEditOrderArgs': 'List<object>', 'parseDepositMethodIds': 'List<object>', 'parseEventToMarkets': 'List<object>', 'parseEvents': 'List<object>',
    'parseMarginModifications': 'List<object>', 'parseOrderBookBidAsk': 'List<object>', 'parseOrderBookBidsAsks': 'List<object>', 'parseOrderSideAndReduceOnly': 'List<object>',
    'parseOrderTypeTimeInForceAndPostOnly': 'List<object>', 'parsePortfolioDetails': 'List<object>', 'parseSearchQueries': 'List<object>', 'parseVolatilityHistory': 'List<object>',
    // parsePositions: the BaseExchange declaration (single return `filterByArrayPositions
    // (result, 'symbol', symbols, false)` — the `false` literal proves IList<object>) and
    // krakenfutures' override returning its own `List<object> result`.
    'parsePositions': 'IList<object>',
    'parseWsOHLCVs': 'List<object>', 'parsedFeeAndFees': 'List<object>', 'prepareOrdersByStatusRequest': 'List<object>', 'prepareRequest': 'List<object>',
    'prepareRequestForDepositAddress': 'List<object>', 'reduceFeesByCurrency': 'List<object>', 'resolveAuthType': 'List<object>', 'resolvePath': 'List<object>',
    'separateBidsOrAsks': 'List<object>', 'spotOrderPrepareRequest': 'List<object>',
};

// ===== the pro-tree ws row builders (CSHARP_WS_ROW_BUILDER_RETURNS) =====
//
// Same mechanism as CSHARP_COLLECTION_RETURN_METHODS above, kept as its own table so the
// family stays separately auditable. #30502 typed these names' CALL SITES with a cast-back
// table (CSHARP_LOCAL_CAST_CALL_TYPES: `Dictionary<string, object> x = ((Dictionary<string, object>)this.parseWsX (...))`)
// while the generated declaration stayed `object`. This table retypes the DECLARATION
// instead, so the call site needs no cast at all.
//
// Census (campaigns/cs-strict/tools/S19/ws-row-returns.ts on b01e9230fea; 176 definitions /
// 186 return paths across ts/src/pro/**, the base stubs in ts/src/base/Exchange.ts included):
// every path is a dict literal, a call to this.safeTicker / safeOrder / safeTrade /
// safePosition / safeLiquidation with a dict-literal argument (the first four already print
// Dictionary<string, object> through the table above; safeLiquidation returns its argument),
// a call to the already-retyped this.parseTrade / parseOrder / parseTicker / parsePosition,
// this.parseBalance (...) (blofin; hands back this.safeBalance (a fresh dict literal)),
// this.safeBalance (result) / this.account () (a dict-literal local, a fresh-dict helper),
// super.parseTrade (trade) (the retyped base method), `undefined`, or a throw-only body.
// Deliberately out, as in #30502: parseWsOHLCV / parseWsTrades (List boxes — parseOHLCV
// hands a non-list argument back unchanged), parseWsTimestamp (Int64), parseWsMarginMode
// (string).
//
// Ownership: S19 owns this table and the call-site cast removal; S50 extends it to the
// remaining ws row-builder names (the declaration retype is the same mechanism for both).
//
// S50 extension (census campaigns/cs-strict/tools/S50/ws-returns-census.ts + cs-census.py;
// every other parseWs* name is already typed — parseWsOHLCVs -> List<object> and
// parseWsAllBidsAsks -> Dictionary through CSHARP_COLLECTION_RETURN_METHODS, parseWsTimestamp
// -> Int64? through CSHARP_NUMERIC_RETURN_TYPES,
// parseWs{OrderSide,OrderStatus,OrderType,PositionSide,TimeInForce} + parseTradeSide ->
// string? through CSHARP_STRING_RETURN_METHODS, parseWSBalances has no return path):
//   parseWsOHLCV   17 definitions: 14 array literals, plus `this.parseOHLCV (...)` in grvt,
//                  toobit and the base stub. The only reachable parseOHLCV declarations
//                  (grvt / toobit / bydfi, the one venue calling the base stub) all return an
//                  array literal, so the boundary cast never unboxes a non-list.
//   parseWsTrades  2 definitions (base + hitbtc): both returns already print IList<object>
//                  (this.parseTradesHelper / this.filterBySymbolSinceLimit), so this entry
//                  emits no boundary cast at all.
//   parseWsMarginMode  1 definition (deepcoin): every path is the parameter (its only caller
//                  passes this.safeString (position, 'i')) or
//                  this.safeString (modes, marginMode, marginMode) — a string or null.
//   the venue-local ws row builders, each a single declaration whose only return is
//   this.safeTicker / safeOrder / safeTrade (<literal>) — already Dictionary<string, object>
//   through the table above, so no cast: parseWSTicker (coinex, onetrading), parseWSSwapOrder
//   (phemex), parseTradingOrder (onetrading), parseFundingRateWs (paradex, object literal),
//   parsePerpetualTicker / parseSwapTicker (phemex), parseOrderTrade (htx).
export const CSHARP_WS_ROW_BUILDER_RETURNS = {
    'parseWsBalance': 'Dictionary<string, object>', 'parseWsBidAsk': 'Dictionary<string, object>',
    'parseWsFundingRate': 'Dictionary<string, object>', 'parseWsInstrument': 'Dictionary<string, object>',
    'parseWsLiquidation': 'Dictionary<string, object>', 'parseWsMyLiquidation': 'Dictionary<string, object>',
    'parseWsMyTrade': 'Dictionary<string, object>', 'parseWsOldTrade': 'Dictionary<string, object>',
    'parseWsOptionsPosition': 'Dictionary<string, object>', 'parseWsOrder': 'Dictionary<string, object>',
    'parseWsOrderTrade': 'Dictionary<string, object>', 'parseWsOrderUpdate': 'Dictionary<string, object>',
    'parseWsPosition': 'Dictionary<string, object>', 'parseWsTicker': 'Dictionary<string, object>',
    'parseWsTrade': 'Dictionary<string, object>', 'parseWsUtaOrder': 'Dictionary<string, object>',
    'parseWsUtaPosition': 'Dictionary<string, object>', 'parseWsUtaTicker': 'Dictionary<string, object>',
    'parseWsUtaTrade': 'Dictionary<string, object>', 'parseWsUpdatedTicker': 'Dictionary<string, object>',
    // ---- S50: the remaining ws row-builder names (see the census above) ----
    'parseWsOHLCV': 'List<object>',
    'parseWsTrades': 'IList<object>',
    'parseWsMarginMode': 'string?',
    'parseWSTicker': 'Dictionary<string, object>',
    'parseWSSwapOrder': 'Dictionary<string, object>',
    'parseTradingOrder': 'Dictionary<string, object>',
    'parseFundingRateWs': 'Dictionary<string, object>',
    'parsePerpetualTicker': 'Dictionary<string, object>',
    'parseSwapTicker': 'Dictionary<string, object>',
    'parseOrderTrade': 'Dictionary<string, object>',
};

// the mapped return type a generated method name carries: the shared closed table, the
// ws row-builder table, or undefined to leave the printer's own decision
function collectionReturnMethodType (name) {
    const mapped = CSHARP_COLLECTION_RETURN_METHODS[name];
    return (mapped !== undefined) ? mapped : CSHARP_WS_ROW_BUILDER_RETURNS[name];
}

// Request builders whose declarations do NOT all return the same box: 24 venues' helper builds
// a request Dictionary while dydx / hitbtc / pacifica / toobit return the [request, params]
// pair (a List). Each declaration is proven on its own return paths instead, and a
// `object x = this.<name>(...)` local is typed only when the declaration the call BINDS proves
// — the single same-file method, or the base-class method the checker resolves for a pro class.
export const CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION = {
    // the venue-local pagination helpers (bybit / pacifica return the safeList / safeListN
    // `data` local on every path; kraken hands back its `this.safeValue (result, 'withdrawals')`
    // object and deribit's is unproven, so those two declarations keep `object` and their
    // call sites stay `object` — the by-declaration prover decides per declaration).
    'addPaginationCursorToResult': 'List<object>',
    'cancelAllOrdersRequest': 'Dictionary<string, object>',
    'cancelOrderRequest': 'Dictionary<string, object>',
    'cancelOrdersRequest': 'Dictionary<string, object>',
    'createContractOrderRequest': 'Dictionary<string, object>',
    // U37: a name may box more than one collection when its venues disagree — dydx / pacifica /
    // lighter's createOrderRequest returns the `new List<object>() {...}` pair, okx / paradex
    // the request Dictionary. Each declaration proves whichever of the admissible boxes its own
    // return paths print (the call site is typed only when the BOUND declaration proves it).
    'createOrderRequest': [ 'Dictionary<string, object>', 'List<object>' ],
    'createOrdersRequest': 'Dictionary<string, object>',
    'createSpotOrderRequest': 'Dictionary<string, object>',
    'editOrderRequest': 'Dictionary<string, object>',
    // the single-row parse* builders (~400 declarations): every real return path of every
    // declaration is a dict literal, `this.safeLedgerEntry` / `this.safeOpenInterest` (both
    // above) or a `Dict`-annotated local, so each declaration proves on its own.
    // parseDepositWithdrawFee deliberately out: htx/mexc return
    // `this.assignDefaultDepositWithdrawFees(...)`, the base helper that hands its
    // caller-provided `object fee` back — naming that box needs the helper's own caller census.
    'parseTransaction': 'Dictionary<string, object>',
    'parseTransfer': 'Dictionary<string, object>',
    'parseFundingRate': 'Dictionary<string, object>',
    'parseLedgerEntry': 'Dictionary<string, object>',
    'parseDepositAddress': 'Dictionary<string, object>',
    'parseTradingFee': 'Dictionary<string, object>',
    'parseOpenInterest': 'Dictionary<string, object>',
    'parseLeverage': 'Dictionary<string, object>',
    'parseMarginModification': 'Dictionary<string, object>',
    'parseIncome': 'Dictionary<string, object>',
};

// S54 census: sync `object` venue helpers whose every return path is an object/array literal
// or a call the collection tables already name (safeTrade / safePredictionTrade). Same census
// as CSHARP_STRING_RETURN_METHODS_S54.
// Rejected with the same census: getCurrencyFromChaincode (woo returns its `currency`
// PARAMETER on the first path — the caller's box).
const CSHARP_COLLECTION_RETURN_METHODS_S54 = {
    'orderBookSuffix': 'List<object>',
};
Object.assign (CSHARP_COLLECTION_RETURN_METHODS, CSHARP_COLLECTION_RETURN_METHODS_S54);

// orderToTrade builds its row through safeTrade / safePredictionTrade; both are listed above,
// so each declaration's own return paths prove the box at print time (the boundary cast is
// skipped, the return line stays byte-identical) — the by-declaration route.
Object.assign (CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION, {
    'orderToTrade': 'Dictionary<string, object>',
    // parseBorrowInterests (single BaseExchange declaration): the only return is its own
    // `interests` local, declared List<object> by the same local pass.
    'parseBorrowInterests': 'List<object>',
    // parsePredictionPositions (single PredictionExchange declaration, prediction tier): the
    // only return is its own `results` local, declared List<object>.
    'parsePredictionPositions': 'List<object>',
    // parseSettlements (9 venue declarations, no base): 8 return their own `List<object> result`
    // local; bitmex delegates to filterBySymbolSinceLimit (IList<object>) and keeps `object`.
    // Venue-local name: no declaration overrides another, so the two spellings never meet.
    'parseSettlements': 'List<object>',
});

// Sync generated per-venue helpers whose declarations do NOT all box the same type: the
// `signHash` of aster / derive / limitless / modetrade / paradex / woofipro builds the
// `0x` + r + s + v hex string, while dydx / hyperliquid / polymarket / opinion build the
// { r, s, v } row; their `signMessage` hands the signHash result straight back. A name-keyed
// table cannot express that (one venue's `string` would break the other's Dictionary return),
// so each declaration is proven on its own return paths exactly like the collection
// by-declaration table, and a declaration whose every return already prints a statically
// `string` expression is retyped `string`: the call site's local then takes the type from the
// signature, no cast. The proof is the strict one in stringReturnExpressionProves — every
// other declaration (the { r, s, v } venues, and the base-class stub that owns the virtual
// slot) keeps the printer's `object` and every call site stays object.
export const CSHARP_STRING_RETURN_METHODS_BY_DECLARATION = {
    'signMessage': 'string',
    'signHash': 'string',
};

// U37 census: venue-local dict builders whose every declaration returns a local the local pass
// already declares `Dictionary<string, object>` (a null-init `FeeString` written with the
// object literal), so each declaration proves on its own.
//   parseTokenAndFeeTemp — woo / woofipro / modetrade, 3 declarations, `return fee;` only.
Object.assign (CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION, {
    'parseTokenAndFeeTemp': 'Dictionary<string, object>',
});

// U37 census: the dydx credential helpers. retrieveDydxCredentials is the hand-written
// Exchange.cs stub (body is a single throw, so it has no return path to carry a cast) and
// retrieveCredentials (dydx, one declaration, 5 call sites) returns only the `credentials`
// local: safeDict result (IDictionary) joined with that stub (Dictionary) -> IDictionary.
Object.assign (CSHARP_COLLECTION_RETURN_METHODS, {
    'retrieveDydxCredentials': 'Dictionary<string, object>',
    'retrieveCredentials': 'IDictionary<string, object>',
});

// the mapped collection type for a method declaration, or undefined to leave the printer's
// own decision (async methods and every other name)
function collectionReturnType (csharp, node, own) {
    if (own !== 'object') {
        return undefined;
    }
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration || node.name === undefined) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (node)) {
        return undefined;
    }
    const name = node.name.escapedText;
    const mapped = collectionReturnMethodType (name);
    if (mapped !== undefined) {
        return mapped;
    }
    // a per-declaration name: only the declarations whose every return path already prints the
    // mapped box are retyped, so a venue whose helper returns the pair keeps `object` (its
    // callers' locals stay `object` too — both sides read the same proof, see callReturnType)
    const perDeclaration = CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION[name];
    if (perDeclaration !== undefined) {
        return declarationCollectionReturnType (csharp, node, perDeclaration);
    }
    // the scalar twin (CSHARP_STRING_RETURN_METHODS_BY_DECLARATION): the same per-declaration
    // return-path proof, mapped to `string` — only the declarations whose every return already
    // prints a statically-`string` expression are retyped (stringReturnExpressionProves)
    const perDeclarationString = CSHARP_STRING_RETURN_METHODS_BY_DECLARATION[name];
    return (perDeclarationString === undefined) ? undefined : declarationCollectionReturnType (csharp, node, perDeclarationString);
}

// true when the return expression already prints as the mapped type, so the boundary cast
// would be an identity and is skipped: object/array literals print
// `new Dictionary<string, object>() { ... }` / `new List<object>() { ... }`, and
// `this.extend(...)` / `this.deepExtend(...)` resolve to the hand-written base signatures.
function collectionReturnIsTyped (csharp, expression, mapped) {
    // the literal shortcut names the box the literal prints as: an object literal is a
    // Dictionary<string, object> and an array literal a List<object>/IList<object>, whatever
    // the printer's initializer hook answers — and nothing else (a `string?` mapping must not
    // take a literal return as already typed).
    if (expression?.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        return mapped === 'Dictionary<string, object>';
    }
    if (expression?.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        return mapped === 'List<object>' || mapped === 'IList<object>';
    }
    return typeof csharp.csharpTypeOfInitializer === 'function' && csharp.csharpTypeOfInitializer (expression) === mapped;
}

// The row builders the table above retypes hand their value to each other and to their own
// locals, so a return that this module's classifiers can already name needs no boundary
// cast: a call to a name the same table retypes (fixpoint), or a local the local pass
// declares with the mapped type (backpack's parseTicker -> `Dictionary parsedTicker`).
const ROW_BUILDER_RETURN_METHODS = new Set ([
    'parseTicker', 'parseOrder', 'parseTrade', 'parsePosition', 'safeTrade', 'safePosition',
]);

// the pro-tree ws row builders (CSHARP_WS_ROW_BUILDER_RETURNS) hand their value to the same
// helpers and locals, so a return this module's classifiers can already name needs no
// redundant boundary cast there either (S19)
for (const name of Object.keys (CSHARP_WS_ROW_BUILDER_RETURNS)) {
    ROW_BUILDER_RETURN_METHODS.add (name);
}

function rowBuilderReturnIsTyped (csharp, enclosing, expression, mapped) {
    const owner = enclosing?.name?.escapedText;
    if (!ROW_BUILDER_RETURN_METHODS.has (owner)) {
        return false;
    }
    if (callReturnType (csharp, expression) === mapped) {
        return true;
    }
    return ts.isIdentifier (expression) && localIdentifierType (csharp, expression) === mapped;
}

// ===== per-declaration return-path proof (CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION) =====

// `x as T` / `x!` are TS-only wrappers the printer drops (printAsExpression prints the
// expression unchanged for every target that is not `any` / `string` / an array type), so the
// proof unwraps them to see the value the C# actually holds; the special-cased targets keep
// their printed cast and stay opaque.
// `x as T[]` over a named element type prints the bare expression too (only `as any[]` prints a
// cast), so it unwraps as well; `as any[]` / `as string[]` stay opaque — the first prints a cast,
// the second asserts a box an IList<object> claim must not accept.
function printsBareArrayAssertion (type) {
    return type.kind === ts.SyntaxKind.ArrayType && type.elementType !== undefined
        && type.elementType.kind !== ts.SyntaxKind.AnyKeyword
        && type.elementType.kind !== ts.SyntaxKind.StringKeyword;
}

function unwrapPassthroughExpression (node) {
    while (node !== undefined) {
        if (node.kind === ts.SyntaxKind.ParenthesizedExpression || node.kind === ts.SyntaxKind.NonNullExpression) {
            node = node.expression;
            continue;
        }
        if (node.kind === ts.SyntaxKind.AsExpression && node.type !== undefined
                && (ts.isTypeReferenceNode (node.type) || printsBareArrayAssertion (node.type))) {
            node = node.expression;
            continue;
        }
        break;
    }
    return node;
}

// true only when the printed value of a return expression ALREADY has the mapped static type:
// an object/array literal, a call whose own type is the mapped one (extend/deepExtend, a
// table-listed name, a proven peer), or a local this module declares the mapped type for.
// The `string` mapping (CSHARP_STRING_RETURN_METHODS_BY_DECLARATION) has its own predicate: a
// scalar spelling must not consume the collection arms below (a string literal is NOT a
// Dictionary, an array literal is not a string).
function collectionReturnExpressionProves (csharp, expression, mapped) {
    let node = unwrapPassthroughExpression (expression);
    if (mapped === 'string') {
        return stringReturnExpressionProves (csharp, node);
    }
    switch (node?.kind) {
    case ts.SyntaxKind.ObjectLiteralExpression:
        return mapped === 'Dictionary<string, object>';
    case ts.SyntaxKind.ArrayLiteralExpression:
        return mapped === 'List<object>' || mapped === 'IList<object>';
    case ts.SyntaxKind.ConditionalExpression:
        return collectionReturnExpressionProves (csharp, node.whenTrue, mapped) && collectionReturnExpressionProves (csharp, node.whenFalse, mapped);
    case ts.SyntaxKind.Identifier:
        return identifierType (csharp, node) === mapped;
    case ts.SyntaxKind.CallExpression:
        return callCollectionReturnType (csharp, node) === mapped;
    }
    return false;
}

// true only when the PRINTED C# of a return expression is already statically a non-null
// `string` — the declaration can then be retyped to `string` with no boundary cast (and every
// call site's local takes the type straight from the retyped signature):
//   - a string literal / template literal;
//   - `.padStart` / `.padEnd` — ast-transpiler prints them as `(x as String).PadLeft /
//     PadRight (…)`, and `string.PadLeft` returns a non-null string (a null receiver throws
//     inside the call, exactly as the untyped expression does today);
//   - a read of a local this module declares `string` (pacifica's `signatureBase58` — see
//     localIdentifierType, the same resolution the conditional arms use);
//   - anything this module's own value classifier proves statically `string`: an `add (...)`
//     chain whose LEFT operand is provably a string (both string add overloads return a
//     non-null string), the hand-written `string hmac (...)`, `this.intToBase16 (...)`, a
//     `this.<name> (...)` call whose own declaration proves through the same table
//     (callReturnType -> boundCollectionReturnType, the signHash recursion), and the
//     printer's own table through the csharpTypeOfInitializer fallback.
// A `string?` proof is deliberately NOT accepted: a nullable read could hand back null, which
// a `string` return type may not (CS8603 under the csproj's TreatWarningsAsErrors).
function stringReturnExpressionProves (csharp, node) {
    if (node?.kind === ts.SyntaxKind.StringLiteral || node?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        return true;
    }
    if (node?.kind === ts.SyntaxKind.CallExpression) {
        const callee = node.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression
                && (callee.name?.escapedText === 'padStart' || callee.name?.escapedText === 'padEnd')) {
            return true;
        }
    }
    if (node?.kind === ts.SyntaxKind.BinaryExpression && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        // `a + b` prints `add (a, b)`: with a provably-string LEFT operand the call binds one of
        // the two `string` add overloads (both a non-null concatenation), so the whole chain is
        // a string — the same left-recursive shape isProvablyStringOperand uses, extended with
        // the padStart/PadEnd arm above (hibachi's signMessage returns such a chain)
        return stringReturnExpressionProves (csharp, node.left);
    }
    if (node?.kind === ts.SyntaxKind.Identifier) {
        return localIdentifierType (csharp, node) === 'string';
    }
    return csharpTypeOfValue (csharp, node) === 'string';
}

// the C# type of a whole call expression as the generated signature names it: the two
// collection tables (a per-declaration peer through the declaration it binds), else the
// printer's own answer for the hand-written base signatures (`this.extend`, ...)
function callCollectionReturnType (csharp, call) {
    const callee = call.expression;
    if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
        const name = callee.name?.escapedText;
        if (CSHARP_COLLECTION_RETURN_METHODS[name] !== undefined) {
            return CSHARP_COLLECTION_RETURN_METHODS[name];
        }
        const perDeclaration = CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION[name];
        if (perDeclaration !== undefined) {
            return boundCollectionReturnType (csharp, call, name, perDeclaration);
        }
        const perDeclarationString = CSHARP_STRING_RETURN_METHODS_BY_DECLARATION[name];
        if (perDeclarationString !== undefined) {
            return boundCollectionReturnType (csharp, call, name, perDeclarationString);
        }
    }
    return (typeof csharp.csharpTypeOfInitializer === 'function') ? csharp.csharpTypeOfInitializer (call) : undefined;
}

// the boundary-cast targets this unit (U49) owns; a wrap mapped to anything else belongs to the
// sibling cast units (U47 string, U48 IList<object>). `IDictionary<string, object>` is listed
// because the boundary wrap's own value can be EXACTLY that box (a local the local pass declares
// `IDictionary<string, object>`) — a `Dictionary<string, object>` producer feeding an
// `IDictionary<string, object>` mapped method is NOT listed: the concrete box is not the cast
// target, so rule 1 keeps that cast.
const U49_OWNED_CAST_TYPES = new Set ([ 'object', 'Int64', 'Int64?', 'Dictionary<string, object>', 'List<object>', 'IDictionary<string, object>' ]);

// U49: the called method's own generated C# signature already names `mapped`, so the call
// expression's static type IS `mapped` and the boundary cast `((mapped)((object)(call)))` is an
// identity box (a box + an unbox of the same value). The proof reads the same tables that decide
// the emitted signature: CSHARP_COLLECTION_RETURN_METHODS / _BY_DECLARATION (their entries print
// the mapped type by construction), the hand-written base signatures mirrored by
// CSHARP_LOCAL_THIS_RETURN_TYPES (callReturnType), and — for an awaited call — the async-core
// table whose entries print `Task<mapped>`. Exact string equality only: an interface spelling
// (IDictionary/IList) never crosses to the concrete box, and a nullable spelling never crosses
// to the non-nullable one.
function callReturnIsMapped (csharp, expression, mapped) {
    // U49's cast family only: the boundary wraps whose mapped type is one of the four this unit
    // owns — (object) / (Int64[?]) / (Dictionary<string, object>) / (List<object>). A wrap whose
    // mapped type is `string?` / `IList<object>` is another unit's family (U47 / U48) and keeps
    // its cast here.
    if (expression === undefined || !U49_OWNED_CAST_TYPES.has (mapped)) {
        return false;
    }
    let node = expression;
    let awaited = false;
    for (;;) {
        if (node?.kind === ts.SyntaxKind.ParenthesizedExpression || node?.kind === ts.SyntaxKind.NonNullExpression) {
            node = node.expression;
            continue;
        }
        if (node?.kind === ts.SyntaxKind.AwaitExpression) {
            awaited = true;
            node = node.expression;
            continue;
        }
        break;
    }
    // a bare local read the local pass declares with exactly `mapped`: the printed declaration
    // is `mapped x = …`, so `return x;` in a method declared `mapped` compiles
    if (node?.kind === ts.SyntaxKind.Identifier) {
        return identifierType (csharp, node) === mapped;
    }
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return false;
    }
    const receiver = callee.expression;
    // `base.<name>(...)` binds the BASE declaration, whose hand-written signature is what
    // CSHARP_LOCAL_THIS_RETURN_TYPES mirrors — the same authority as the `this.` form below,
    // minus the venue overrides (which print the same type: CS0508 keeps them compatible)
    if (receiver?.kind === ts.SyntaxKind.SuperKeyword) {
        return CSHARP_LOCAL_THIS_RETURN_TYPES[callee.name?.escapedText] === mapped;
    }
    if (receiver?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    if (awaited) {
        const declared = CSHARP_ASYNC_CORE_RETURNS[callee.name?.escapedText];
        return declared === mapped || (Array.isArray (declared) && declared.includes (mapped));
    }
    return callReturnType (csharp, node) === mapped || callCollectionReturnType (csharp, node) === mapped;
}

// true only when EVERY return path of the declaration already prints the mapped box. A
// declaration with no return statement at all (the base-class `throw new NotSupported` stub
// that owns the virtual slot of its venue overrides) has no path to carry a cast, and naming
// the box there is what keeps the pair signature-compatible (C# CS0508), so it proves.
function methodReturnsProveCollection (csharp, declaration, mapped) {
    let proved = true;
    const visit = (node) => {
        if (!proved || (node !== declaration && ts.isFunctionLike (node))) {
            return; // a return inside a callback belongs to that callback
        }
        if (node.kind === ts.SyntaxKind.ReturnStatement) {
            if (node.expression === undefined || !collectionReturnExpressionProves (csharp, node.expression, mapped)) {
                proved = false;
            }
            return;
        }
        ts.forEachChild (node, visit);
    };
    ts.forEachChild (declaration, visit);
    return proved;
}

// the admissible boxes of a per-declaration entry: one mapped type, or the set of boxes the
// same name's venues disagree on (createOrderRequest: a Dictionary or the pair List)
function declarationMappedTypes (mapped) {
    return Array.isArray (mapped) ? mapped : [ mapped ];
}

// the by-declaration mapped type of one declaration, cached; undefined when the method is async
// (its signature is a Task named by csharpTranspiler#VENUE_TYPED_CORES) or a return path is not
// provably the mapped box
const collectionDeclarationTypes = new WeakMap ();
const collectionDeclarationProofsInProgress = new Set ();

function declarationCollectionReturnType (csharp, declaration, mapped) {
    if (declaration?.kind !== ts.SyntaxKind.MethodDeclaration || declaration.name === undefined) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (declaration)) {
        return undefined;
    }
    const cached = collectionDeclarationTypes.get (declaration);
    if (cached !== undefined) {
        return (cached === false) ? undefined : cached;
    }
    if (collectionDeclarationProofsInProgress.has (declaration)) {
        return undefined; // a proof chain that reaches its own declaration
    }
    collectionDeclarationProofsInProgress.add (declaration);
    try {
        const proof = declarationMappedTypes (mapped).find ((type) => methodReturnsProveCollection (csharp, declaration, type));
        collectionDeclarationTypes.set (declaration, (proof === undefined) ? false : proof);
        return proof;
    } finally {
        collectionDeclarationProofsInProgress.delete (declaration);
    }
}

// the same-name MethodDeclarations of a source file, cached per file
const sourceFileMethodDeclarations = new WeakMap ();

function sourceFileMethods (sourceFile, name) {
    let byName = sourceFileMethodDeclarations.get (sourceFile);
    if (byName === undefined) {
        byName = new Map ();
        sourceFileMethodDeclarations.set (sourceFile, byName);
    }
    let declarations = byName.get (name);
    if (declarations === undefined) {
        declarations = [];
        const visit = (node) => {
            if (ts.isMethodDeclaration (node) && node.name?.escapedText === name) {
                declarations.push (node);
            }
            ts.forEachChild (node, visit);
        };
        ts.forEachChild (sourceFile, visit);
        byName.set (name, declarations);
    }
    return declarations;
}

// the declaration a `this.<name>(...)` call binds: the single same-file declaration, else the
// base-class method the checker resolves (a ts/src/pro class extends its rest counterpart)
function boundCollectionDeclaration (csharp, call, name) {
    const declarations = sourceFileMethods (call.getSourceFile (), name);
    if (declarations.length === 1) {
        return declarations[0];
    }
    if (declarations.length > 1) {
        return undefined; // two same-name methods in one file: no single binding to prove
    }
    try {
        const checker = csharp.getChecker ();
        const resolved = checker.getSymbolAtLocation (call.expression.name)?.declarations ?? [];
        if (resolved.length === 1 && resolved[0]?.kind === ts.SyntaxKind.MethodDeclaration) {
            return resolved[0];
        }
    } catch (e) {
        // no transpilation context (in-memory transpiles) — keep the printer's object
    }
    return undefined;
}

function boundCollectionReturnType (csharp, call, name, mapped) {
    const declaration = boundCollectionDeclaration (csharp, call, name);
    return (declaration?.name?.escapedText === name) ? declarationCollectionReturnType (csharp, declaration, mapped) : undefined;
}

// the per-declaration table names this declaration AND proves — the return-statements wrapper
// skips the boundary cast on exactly these, because the proof already covers every return path
// (and every proven path prints a statically-mapped expression, so the retyped signature needs
// no cast either)
function byDeclarationCollectionReturnIsProven (csharp, declaration) {
    const name = declaration?.name?.escapedText;
    const mapped = CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION[name];
    if (mapped !== undefined) {
        // U37: the mapped value may list several acceptable types (declarationMappedTypes)
        const proven = declarationCollectionReturnType (csharp, declaration, mapped);
        return proven !== undefined && declarationMappedTypes (mapped).includes (proven);
    }
    // U34: the string table's own fallback (scalar mapped values, `===` is the same proof)
    const mappedString = CSHARP_STRING_RETURN_METHODS_BY_DECLARATION[name];
    return mappedString !== undefined && declarationCollectionReturnType (csharp, declaration, mappedString) === mappedString;
}

// wrap printFunctionType / printReturnStatement on a Transpiler's C# printer. Idempotent.
// Every method outside the table is returned untouched; a listed name always prints the
// mapped type (so overrides stay signature-compatible) and its returns carry the box cast
// unless they already print as the type.
export function installCsharpCollectionReturns (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printFunctionType !== 'function' || csharp._collectionReturnsPatched) {
        return;
    }
    const upstreamFunctionType = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node, ...rest) => {
        const own = upstreamFunctionType (node, ...rest);
        const mapped = collectionReturnType (csharp, node, own);
        return (mapped === undefined) ? own : mapped;
    };
    const upstreamReturnStatement = csharp.printReturnStatement.bind (csharp);
    csharp.printReturnStatement = (node, identation) => {
        // nearest function-like: a `return` inside an arrow/function expression belongs to
        // that callback, never to the enclosing mapped method
        const enclosing = ts.findAncestor (node.parent, ts.isFunctionLike);
        const mapped = collectionReturnType (csharp, enclosing, 'object');
        // a proven per-declaration method already hands the mapped box back on EVERY path, so
        // the boundary cast would be a redundant `(T)((object)v)` on each of them (U49 adds the
        // called method's own signature: a callee that already returns `mapped` makes the cast
        // an identity box too)
        if (mapped === undefined || !node.expression || collectionReturnIsTyped (csharp, node.expression, mapped) || callReturnIsMapped (csharp, node.expression, mapped) || rowBuilderReturnIsTyped (csharp, enclosing, node.expression, mapped) || byDeclarationCollectionReturnIsProven (csharp, enclosing)) {
            return upstreamReturnStatement (node, identation);
        }
        // the printed expression keeps its upstream shape; the cast only names the box
        const leadingComment = csharp.printLeadingComments (node, identation);
        let trailingComment = csharp.printTraillingComment (node, identation);
        trailingComment = trailingComment ? ' ' + trailingComment : trailingComment;
        const value = csharp.printNode (node.expression, identation).trim ();
        return leadingComment + csharp.getIden (identation) + csharp.RETURN_TOKEN + ` ((${mapped})((object)(${value})))` + csharp.LINE_TERMINATOR + trailingComment;
    };
    csharp._collectionReturnsPatched = true;
}

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
    // Exchange.SafeMethods.cs — retyped object -> Int64? in the same file: every value
    // path computes Convert.ToInt64 (...) * 1000 (an Int64 box) and the fallback returns
    // the caller's default, which is an Int64? box at its only non-null site (woo's
    // `this.safeInteger (...)`) — naming the type moves no box.
    'safeTimestamp': 'Int64?',
    'safeTimestamp2': 'Int64?',
    'safeTimestampN': 'Int64?',
    // Exchange.BaseMethods.cs — the market/currency builders, retyped to the concrete
    // dictionary type upstream (SYNC_TYPED_CORES in build/csharpTranspiler.ts rewrites the
    // base declaration and every venue override). The box holds the market/currency row
    // itself, so naming the type moves no value.
    'safeMarketStructure': 'Dictionary<string, object>',
    'safeCurrencyStructure': 'Dictionary<string, object>',
    // U49: Exchange.BaseMethods.cs#safeBalance — retyped by CSHARP_COLLECTION_RETURN_METHODS on
    // the same proof (single `return balance as any` of the Dict parameter); the call sites'
    // locals take the same box.
    'safeBalance': 'Dictionary<string, object>',
    // U49: same proof as safeBalance (Exchange.BaseMethods.cs#safeLiquidation is retyped by
    // CSHARP_COLLECTION_RETURN_METHODS on its own single `return liquidation as Liquidation`).
    'safeLiquidation': 'Dictionary<string, object>',
    'safeMarket': 'Dictionary<string, object>',
    'safeCurrency': 'Dictionary<string, object>',
    'market': 'Dictionary<string, object>',
    'currency': 'Dictionary<string, object>',
    // The row builders the six above compose: every return path of every declaration ends
    // in one of the six, a literal Dictionary, or a peer builder that resolves to one of
    // those (the SYNC_TYPED_CORES census in build/csharpTranspiler.ts), so their box is
    // the same row dictionary.
    'parseMarket': 'Dictionary<string, object>',
    'parseCurrency': 'Dictionary<string, object>',
    'createExpiredOptionMarket': 'Dictionary<string, object>',
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
    // Exchange.BaseMethods.cs — generated, retyped by installCsharpMethodReturnTypes() below.
    // Both return paths hand back a string or null: `this.forceString (fee)` forwards the fee
    // string (or null, for a null fee — NumberToString(null) returns null), and
    // `this.decimalToPrecision (...)` is the hand-written `string` method. The return
    // statements therefore unbox through `object` exactly like safeSymbol's, and every local
    // that receives the call is typed `string?` (scanned like any other string local).
    'currencyToPrecision': 'string?',
    // Exchange.BaseMethods.cs — same wrap: null / string literal / add(<string>, <literal>)
    'parsePrecision': 'string?',
    // retyped by installCsharpMethodReturnTypes() below; see CSHARP_METHOD_RETURN_TYPES for the
    // return-path proof (mergeBalanceAccount: both paths return the caller's dict; createSignedRequest
    // — grvt's only declaration — its single return is the caller's dict literal).
    'mergeBalanceAccount': 'Dictionary<string, object>',
    // U37: the venue-local helpers whose definitions installCsharpMethodReturnTypes retypes
    // (CSHARP_METHOD_RETURN_TYPES) — the local is exactly the printed signature, no cast.
    'fromEp': 'string?',
    'fromEv': 'string?',
    'fromEr': 'string?',
    'convertToRealAmount': 'string?',
    'signOrder': 'string?',
    'createSignedRequest': 'Dictionary<string, object>',
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
    // parseDate (Exchange.Time.cs): a non-string / unparseable input returns null, every other
    // path returns the parsed `Int64 timestamp` local — the same nullable spelling as parse8601
    'parseDate': 'Int64?',
    'iso8601': 'string?',
    'ymdhms': 'string?',
    'yyyymmdd': 'string?',
    'yymmdd': 'string?',
    'microseconds': 'Int64',
    // Exchange.cs / Exchange.BaseMethods.cs — numeric helpers whose return type was
    // `object` while every path already produced the named box (the numeric-returns section at the end of this file
    // declares the same signatures; nonce/milliseconds are non-nullable Int64)
    'milliseconds': 'Int64',
    'nonce': 'Int64',
    'parseToInt': 'Int64?',
    // grvt#convertToBigIntCustom (generated): its single definition's single return path is
    // `return parseInt (x);` — an Int64 or null box once parseInt is retyped (see
    // CSHARP_NUMERIC_RETURN_TYPES below, which emits the same signature). cs90 U35.
    'convertToBigIntCustom': 'Int64?',
    'parseNumber': 'double?',
    'safeNumber': 'double?',
    'safeNumber2': 'double?',
    'safeNumberN': 'double?',
    'safeNumberOmitZero': 'double?',
    // Exchange.BaseMethods.cs — generated, retyped from `object` by the numeric-returns
    // section at the end of this file (transpiled from ts/src/base/Exchange.ts#safeIntegerOmitZero).
    // The single definition (no venue override, census over cs/ccxt/**) returns `null` or
    // `this.safeInteger (obj, key, defaultValue)` — hand-written `Int64?`,
    // Exchange.SafeMethods.cs — on every path, so a local fed by this call holds a null or an
    // Int64 box. The named type moves no box; the nullable spelling is what the null path
    // needs.
    'safeIntegerOmitZero': 'Int64?',
    // Generated venue helpers retyped by the numeric-returns section at the end of this
    // file (keep the two in sync — the census and the rejected names live there): each C#
    // signature becomes the mapped nullable type, so a local fed by one of them is exactly
    // that type. The scan rejects the local wherever the declared type would re-bind an
    // overload or a ref sink, exactly like every other entry.
    'convertFromRealAmount': 'double?',
    'encodeAccountType': 'Int64?',
    'encodeFlowType': 'Int64?',
    'fromWei': 'double?',
    'parseExpiryDate': 'Int64?',
    'parseWsTimestamp': 'Int64?',
    'parseX18': 'double?',
    'timeInForceToInt': 'Int64?',
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
    // `(string)str2` then a StringBuilder append loop: a null argument throws inside the cast,
    // so every RETURN path is a non-null string (Exchange.Encode.cs#encodeURIComponent)
    'encodeURIComponent': 'string',
    'urlencodeBase64': 'string', // Base64urlEncode: throws on null, non-null string otherwise
    // Exchange.Encode.cs / Exchange.ETH.cs — retyped object -> byte[] in this PR, together
    // with the table entries below: every return path of base16ToBinary is
    // ConvertHexStringToByteArray's byte[], and ethEncodeStructuredData's single return is
    // Nethereum's Eip712TypedDataSigner.EncodeTypedDataRaw (vendored, `public byte[]`)
    'base16ToBinary': 'byte[]',
    'ethEncodeStructuredData': 'byte[]',
    // Exchange.Encode.cs — the hand-written signatures are already concrete, so the printed
    // call's own C# type IS the declaration (no cast): base64ToBinary / binaryConcat /
    // base58ToBinary are declared `byte[]` (`Base64ToBinary` returns Convert.FromBase64String,
    // binaryConcat the List<byte> builder's ToArray — an empty array for zero parts, never
    // null — and Base58.Decode), binaryToBase58 the `string` Base58.Encode result.
    'base64ToBinary': 'byte[]',
    'binaryConcat': 'byte[]',
    'base58ToBinary': 'byte[]',
    'binaryToBase58': 'string',
    // Exchange.ETH.cs — `public string ethGetAddressFromPrivateKey (object privateKey)`
    'ethGetAddressFromPrivateKey': 'string',
    // Exchange.cs — `public int randNumber (int size)` (an int.Parse of the digit string)
    'randNumber': 'int',
    // Exchange.cs — retyped object -> List<object> in this PR: the body builds one
    // `List<object>` of one-char strings on its only path (the List<string> box was never
    // load-bearing: every consumer reads elements through getValue / getArrayLength /
    // `(string)` element casts, all of which take the IList<object> shape)
    'stringToCharsArray': 'List<object>',
    // Exchange.Crypto.cs (hmac mirrors the printer's own CSHARP_THIS_RETURN_TYPES entry;
    // jwt builds `header.payload.signature` and returns non-null)
    'hmac': 'string',
    'jwt': 'string',
    // Exchange.Crypto.cs — `ecdsa` / the static `Ecdsa` it forwards to were retyped
    // object -> Dictionary<string, object> in this PR: every return path is the fresh
    // { r, s, v } row the helper builds (or a throw)
    'ecdsa': 'Dictionary<string, object>',
    // Exchange.String.cs
    'uuid': 'string',
    'uuid16': 'string',
    'uuid22': 'string',
    'capitalize': 'string',
    // strip (Exchange.String.cs): `((string)str).Trim()` — a string on every path (a
    // non-string box throws inside the cast, where the object signature threw it too)
    'strip': 'string',
    // Exchange.Functions.cs / Exchange.Generic.cs
    // omit is NOT in this table (its result depends on the receiver): the object-receiver
    // overloads pass IList inputs through — see the omit family below (omitDictionaryProducer)
    'keysort': 'Dictionary<string, object>',
    'sortBy': 'List<object>',
    'sortBy2': 'List<object>',
    // Exchange.Functions.cs — `public List<string> sort (object inputListObj)`: every path
    // hands back the fresh List<string> the helper builds (the string/boxed-string elements
    // of the copy), so a local fed by the call is exactly that box. The TS free function's
    // own annotation (`string[] | any`) cannot reach the C# printer, hence the table entry.
    'sort': 'List<string>',
    'filterBy': 'List<object>',
    'extractParams': 'List<object>',
    'toArray': 'IList<object>',
    // Exchange.Generic.cs — `public Dictionary<string, object> extend (object, object)` /
    // `deepExtend (params object[])` are hand-written with the concrete return type, so a
    // local fed by one (or a later write of one into an IDictionary/Dictionary local) is
    // exactly that box.
    'extend': 'Dictionary<string, object>',
    'deepExtend': 'Dictionary<string, object>',
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
    'parseOHLCV': 'IList<object>',
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
    // Exchange.Functions.cs (JSON.stringify; returns null for a null input — the local
    // must stay nullable: a `string` spelling would let it sit on the LEFT of `+`)
    'json': 'string?',
    // Exchange.Misc.cs — retyped object -> string in this PR, but the value is NOT always
    // a string: a null path returns the null path itself on the empty/all-null dictionary
    // branch and on the list branch (the dictionary branch throws for a null path only
    // when a non-null value hits path.Replace), so the local spelling must be nullable
    'implodeParams': 'string?',
    // Exchange.Misc.cs — roundTimeframe's two return paths are ToUnixTimeMilliseconds() and
    // the Int64 `(Int64)timestamp - offset + …` arithmetic; getCcxtVersion's only path is the
    // static `string ccxtVersion` field (Exchange.MetaData.cs)
    'roundTimeframe': 'Int64',
    'getCcxtVersion': 'string',
    // generated Exchange.BaseMethods.cs — the signature is rewritten object -> string in
    // build/csharpTranspiler.ts (next to the setMarketsFromExchange replace); it forwards
    // implodeParams, so it inherits the same null path
    'implodeHostname': 'string?',
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
    // cs/ccxt/base/PredictionExchange.cs (prediction tier; generated then retyped by
    // CSHARP_METHOD_RETURN_TYPES above — the same names, see the proof there)
    'safePredictionOrder': 'Dictionary<string, object>',
    'safePredictionTicker': 'Dictionary<string, object>',
    'safePredictionTrade': 'Dictionary<string, object>',
    'parsePredictionOrder': 'Dictionary<string, object>',
    'parsePredictionTicker': 'Dictionary<string, object>',
    'parsePredictionTrade': 'Dictionary<string, object>',
    'parsePredictionOrders': 'IList<object>',
    'parsePredictionTrades': 'IList<object>',
    // outcome() reads the outcome row (IDictionary box, see CSHARP_METHOD_RETURN_TYPES);
    // safeOutcomeSymbol hands back the handle string. safeOutcome reads the same row and is
    // retyped by the same proof (CSHARP_COLLECTION_RETURN_METHODS) this table mirrors.
    'outcome': 'IDictionary<string, object>',
    'safeOutcomeSymbol': 'string?',
    // U33: the helpers retyped in CSHARP_METHOD_RETURN_TYPES below (their TS return type is
    // `any`, so the string-returns table's stringishReturn gate cannot carry them; networkCodeToId's
    // `Str` passes that gate but its htx override does not, see the entry below) plus the
    // hand-written remove0xPrefix (cs/ccxt/base/Exchange.Encode.cs, `var str = (string)str2`
    // unboxes the argument before either return, so both paths hand back that string).
    // getSupportedMapping / getUrlByMarket / convertTypeToAccount / codeFromOptions each
    // carry a per-declaration return-path census in the METHOD_RETURN_TYPES comment below.
    'getSupportedMapping': 'string',
    'getUrlByMarket': 'string?',
    'convertTypeToAccount': 'string?',
    'codeFromOptions': 'string?',
    'remove0xPrefix': 'string',
    'networkCodeToId': 'string?',
    // Exchange.ETH.cs — `public string ethGetAddressFromPrivateKey(object privateKey)`
    // (hand-written base; the ts/src declaration is annotated `: string`). Listed because it
    // is the write producer that blocks the walletAddress family: lighter/myriad assign
    // `walletAddress = this.ethGetAddressFromPrivateKey (this.privateKey)` into the local.
    'ethGetAddressFromPrivateKey': 'string',
};

// Families whose declarations in the PREDICTION tree belong to another unit of the same
// campaign: that shard owns ts/src/prediction sources (and the prediction C# tree), so the
// entries above must not fire there — the crypto + ws sources keep them (63 root + 12 pro
// safeTimestamp* declarations on this base; the 10 prediction ones stay object here).
const CSHARP_PREDICTION_OWNED_RETURNS = new Set ([ 'safeTimestamp', 'safeTimestamp2', 'safeTimestampN' ]);

// bare `name(...)` calls (a plain Identifier callee, no `this.`): C# resolves them to the
// same BaseExchange instance method, so the return types above apply unchanged. Only
// helpers imported as free functions in ts/src and called bare in generated bodies are
// listed — a name that any class could declare itself must NOT be added blindly.
export const CSHARP_LOCAL_BARE_RETURN_TYPES = {
    'jwt': 'string',
    'totp': 'string',
    'eddsa': 'string',
    'rsa': 'string',
    // `ecdsa (...)` is called bare in every generated signHash (ts/src imports it as a free
    // function and the C# call binds the inherited BaseExchange instance method); the name
    // resolves to the retyped `ecdsa` above in every declaration the corpus contains
    'ecdsa': 'Dictionary<string, object>',
    // `parseInt (x)` is the TS global; the C# call binds Exchange.TranspileHelpers.cs#parseInt,
    // whose every return path is the Convert.ToInt64 box or null (the catch) — cs90 U35
    // retyped that signature from `object` to `Int64?`, so the call's own C# type IS Int64?
    // and the ~10 generated declarations it feeds (`object leverage = parseInt (s)`) need no
    // cast. The other ~40 call sites keep the value in an object context (a dict slot, a
    // request value, an object local/param, `parseToNumeric`'s `return parseInt (...)`),
    // where the box is unchanged. `parseFloat` is deliberately NOT listed: it is not on this
    // unit's roster line, its 2 `object x = parseFloat (...)` declarations (htx, zaif) are an
    // adjacent family with the same single-box shape (the Convert.ToDouble box or null), and
    // REPORT.md records them as a residual for whoever owns that name.
    'parseInt': 'Int64?',
};

// The generated non-async string-returning methods: installCsharpStringReturns (above) emits
// `string` / `string?` on their C# signatures (they were `object`), so a local fed by one
// of them is exactly that type. Hand-curated entries above win on a collision.
for (const [ name, type ] of Object.entries (CSHARP_STRING_RETURN_METHODS)) {
    if (CSHARP_LOCAL_THIS_RETURN_TYPES[name] === undefined) {
        CSHARP_LOCAL_THIS_RETURN_TYPES[name] = type;
    }
}

// The generated dict/list-returning methods: installCsharpCollectionReturns (above) emits
// the mapped type on their C# signatures, so a local fed by one of them is exactly that
// type. Hand-curated entries above win on a collision.
for (const [ name, type ] of Object.entries (CSHARP_COLLECTION_RETURN_METHODS)) {
    if (CSHARP_LOCAL_THIS_RETURN_TYPES[name] === undefined) {
        CSHARP_LOCAL_THIS_RETURN_TYPES[name] = type;
    }
}

// the pro-tree ws row builders: same declaration retype, so a local fed by one of them is
// the mapped type with no cast at the call site (see CSHARP_WS_ROW_BUILDER_RETURNS)
for (const [ name, type ] of Object.entries (CSHARP_WS_ROW_BUILDER_RETURNS)) {
    if (CSHARP_LOCAL_THIS_RETURN_TYPES[name] === undefined) {
        CSHARP_LOCAL_THIS_RETURN_TYPES[name] = type;
    }
}

// The generated methods whose upstream ts/src `: boolean` / `: Bool` annotation now makes the
// C# printer emit `bool` / `bool?` (csharpBooleanReturnType in the pinned ast-transpiler).
// A local fed by `this.<name>(...)` is exactly that type. Only the names whose every
// declaration prints the same type are listed — handleBalance / handleError /
// handleErrorMessage / handleMyTrades / handleOrders / handleUnsubscriptionStatus mix
// bool with void / object / bool? and stay out.
for (const [ name, type ] of Object.entries ({
    'checkRequiredCredentials': 'bool',
    'checkRequiredUid': 'bool',
    'handleActiveAssetCtx': 'bool',
    'handleProtobufMessage': 'bool',
    'handleWsTickers': 'bool',
    'isDecimalPrecision': 'bool',
    'isEmptyString': 'bool',
    'isFiat': 'bool',
    'isFuturesMethod': 'bool',
    'isPostOnly': 'bool',
    'isRoundNumber': 'bool',
    'isSignificantPrecision': 'bool',
    'isSpotUrl': 'bool',
    'isTickPrecision': 'bool',
    'subscriptionExistsForHash': 'bool',
    'usesPrivateKey': 'bool',
    'parseMarketActive': 'bool?',
    // U37: the market-type predicates. Both names are declared exactly twice tree-wide
    // (binance.ts + aster.ts, each `: boolean` -> printed `bool`, every return a comparison)
    // and every `this.isLinear/isInverse (...)` call site lives in those two files, so the
    // call's own C# type is bool.
    'isLinear': 'bool',
    'isInverse': 'bool',
})) {
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
    // Date.now() prints (ast-transpiler printDateNowCall)
    // `(new DateTimeOffset(DateTime.UtcNow)).ToUnixTimeMilliseconds()` — the BCL call's
    // static type is exactly `long` (System.Int64), never null, so an Int64 local can hold
    // the same box. Call sites today: ts/src/pro/test/Exchange/test.watchLiquidations*.ts
    // (`let now = Date.now (); ... now = Date.now ();`), where the two declarations stayed
    // `object` while every sibling local in the same method was already typed. printFloor/
    // Round/Ceil and `new Date()` have no generated-tree sites of their own (the printer
    // already names Math.floor/ceil/round; `new Date(...)` prints a bare `new Date(...)`
    // with no C# counterpart, and every ts/src site of it lives in a hand-written file).
    'Date.now': 'Int64',
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
    // cs/ccxt/base/Exchange.cs, retyped from Task<object> by installCsharpAsyncCoreReturns()
    // (see the async-core-returns section below): every declaration of these names —
    // base, venue override, ws override — now prints `Task<IDictionary<string, object>>` in
    // the generated files, so the awaited value is the interface the market/currency maps
    // are stored under (Dictionary and ConcurrentDictionary both implement it).
    'loadMarkets': 'IDictionary<string, object>',
    'loadMarketsHelper': 'IDictionary<string, object>',
    'fetchCurrencies': 'IDictionary<string, object>',
    'fetchCurrenciesWs': 'IDictionary<string, object>',
    // the awaited same-file cores (CSHARP_AWAITED_CORE_RETURNS): their generated signature
    // prints Task<T> wherever the name is declared (the census behind that table), so a ws
    // subclass calling an inherited one types its local identically
    'isUnifiedEnabled': 'List<object>',
    'getAssetHistoryRows': 'List<object>',
    'estimateTxFee': 'Dictionary<string, object>',
    'getSystemConfig': 'IDictionary<string, object>',
    'getWithdrawNonce': 'double?',
    'authenticateUta': 'string?',
    // U29: paradex's authenticateRest — retyped to Task<string?> by
    // installCsharpAsyncCoreReturns (CSHARP_AWAITED_CORE_RETURNS: both return paths hand back a
    // `string?` local), so the pro tree's `object token = await this.authenticateRest ()` takes
    // the string? box; the name is declared in the REST file only, hence this table
    'authenticateRest': 'string?',
    // cs/ccxt/base/PredictionExchange.cs, retyped from Task<object> by
    // installCsharpAsyncCoreReturns() (CSHARP_ASYNC_CORE_RETURNS above); the awaited value is
    // the outcome row the accessor returned — the same IDictionary box the call site used to
    // cast back to, so the local keeps that spelling without the cast.
    'loadOutcome': 'IDictionary<string, object>',
    // the async REST cores retyped by installCsharpAsyncCoreReturns() below
    // (CSHARP_ASYNC_CORE_RETURNS): every declaration of these names now prints a concrete
    // Task<T> in the generated tree, so the awaited value is the dictionary the return path
    // already boxes — `await this.closePosition (...)` is the IDictionary the two safeDict
    // paths hand back, every other name an exact Dictionary<string, object>.
    'reduceMargin': 'Dictionary<string, object>',
    'addMargin': 'Dictionary<string, object>',
    'modifyMarginHelper': 'Dictionary<string, object>',
    'closePosition': 'IDictionary<string, object>',
    'borrowCrossMargin': 'Dictionary<string, object>',
    'repayCrossMargin': 'Dictionary<string, object>',
    'borrowIsolatedMargin': 'Dictionary<string, object>',
    'repayIsolatedMargin': 'Dictionary<string, object>',
    'borrowMargin': 'Dictionary<string, object>',
    'repayMargin': 'Dictionary<string, object>',
    'modifyLeverageAndMarginMode': 'Dictionary<string, object>',
    'setContractLeverage': 'Dictionary<string, object>',
    'approveBuilderFee': 'Dictionary<string, object>',
    'approveBuilderCode': 'Dictionary<string, object>',
    'revokeBuilderCode': 'Dictionary<string, object>',
    'revokeApiKey': 'Dictionary<string, object>',
    'bindAgentWallet': 'Dictionary<string, object>',
    'setAgentAbstraction': 'Dictionary<string, object>',
    'setUserAbstraction': 'Dictionary<string, object>',
    'enableUserDexAbstraction': 'Dictionary<string, object>',
    'upgradeUnifiedTradeAccount': 'Dictionary<string, object>',
    'signInWithApiKey': 'Dictionary<string, object>',
    'signInWithPrivateKey': 'Dictionary<string, object>',
    'deriveApiKey': 'Dictionary<string, object>',
    'redeemGiftCode': 'Dictionary<string, object>',
    'redeem': 'Dictionary<string, object>',
    'verifyGiftCode': 'Dictionary<string, object>',
    'deposit': 'Dictionary<string, object>',
    'futuresTransfer': 'Dictionary<string, object>',
    'convertCurrencyNetwork': 'Dictionary<string, object>',
    'reserveRequestWeight': 'Dictionary<string, object>',
    'onboarding': 'Dictionary<string, object>',
    'prepareParadexDomain': 'Dictionary<string, object>',
    'ensureErc20Allowance': 'Dictionary<string, object>',
    // the async venue url/auth helpers above (CSHARP_ASYNC_CORE_RETURNS): the generated
    // signature prints Task<string?> at the declaration, so the awaited value is the string
    // (or null) every return path of the declaration already boxes (U28 census)
    'getUrlByMarketType': 'string?',
    'getUtaUrl': 'string?',
    'getListenKey': 'string?',
    'handleToken': 'string?',
    'authenticateRest': 'string?',
    'loadMultiSignAddress': 'string?',
};

// `await promiseAll (...)` — the printer's rewrite of `await Promise.all (<one arg>)`
// (baseTranspiler printPromiseAllCall) calls the hand-written helper
// cs/ccxt/base/Exchange.TranspileHelpers.cs `public async Task<List<object>> promiseAll
// (object promisesObj)`, declared on BaseExchange so every generated venue class binds it.
// The awaited value is the task's T: the same List<object> the helper's own
// `object results = await promiseAll (tasks)` local holds in the generated base.
const CSHARP_LOCAL_AWAIT_BARE_CALL_TYPES = { 'promiseAll': 'List<object>' };

// the printed callee name of a call the printer keys on source text, or undefined: only
// `Promise.all (<exactly one argument>)` is rewritten (to `promiseAll(...)`), every other
// shape prints something else and must keep the local `object`
function printedBareCalleeName (call) {
    const callee = call.expression;
    if (callee?.kind === ts.SyntaxKind.Identifier) {
        return callee.escapedText;
    }
    if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression
        && typeof callee.getText === 'function'
        && callee.getText ().trim () === 'Promise.all'
        && (call.arguments?.length ?? 0) === 1) {
        return 'promiseAll';
    }
    return undefined;
}

function bareAwaitedCallType (node) {
    const call = node.expression;
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const name = printedBareCalleeName (call);
    return Object.prototype.hasOwnProperty.call (CSHARP_LOCAL_AWAIT_BARE_CALL_TYPES, name) ? CSHARP_LOCAL_AWAIT_BARE_CALL_TYPES[name] : undefined;
}

// `const orderbook = await this.watch (url, messageHash, …); return orderbook.limit ();`
// (the ws order book subscribers). `watch` awaits client.future (messageHash) and hands back
// whatever the handler resolved for that hash; for these cores the resolved value IS the
// ccxt.pro.IOrderBook cache, and `.limit ()` is an IOrderBook-only member. That immediate
// deref is the only site the rule fires on — every other resolve family (caches, lists,
// dicts, tickers) keeps `object`, see campaigns/cs90 U27 REPORT.md.
// Venue helpers that reach the same bridge (gemini's helperForWatchMultipleConstruct) and
// hashkey's misspelled `wathPublic` are listed by their literal name: the proof is the
// caller's `.limit ()` deref, the name only keeps the family scoped.
const CSHARP_WS_WATCH_METHOD_NAMES = ['watch', 'watchMultiple', 'watchPublic', 'watchPublicMultiple', 'watchPrivate', 'watchPrivateMultiple', 'watchTopics', 'watchMany', 'watchMultiHelper', 'watchMultipleWrapper', 'watchMultipleSubscription', 'watchMultiTickerHelper', 'watchRequest', 'watchPrivateSubscribe', 'watchExecuteRequest', 'watchStockMarketStream', 'helperForWatchMultipleConstruct', 'wathPublic', 'subscribe', 'subscribeMultiple', 'subscribePublic', 'subscribePrivate', 'subscribePublicMultiple', 'subscribeUserChannel', 'subscribeMyriadChannel', 'subscribeOpinionChannel', 'subscribePublicUta', 'subscribePublicMultipleUta', 'subscribePrivateUta', 'negotiate'];

// the awaited method name of `await this.<name> (...)`, or undefined
function wsWatchAwaitMethodName (declaration) {
    const initializer = declaration?.initializer;
    if (initializer?.kind !== ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    const call = initializer.expression;
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = call.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const name = callee.name?.escapedText;
    return (typeof name === 'string' && CSHARP_WS_WATCH_METHOD_NAMES.includes (name)) ? name : undefined;
}

// `<name>.limit ()` (also `(<name> as OrderBook).limit ()`) anywhere in the statement
function statementCallsLimitOn (statement, name) {
    let found = false;
    const visit = (n) => {
        if (found) {
            return;
        }
        if (n?.kind === ts.SyntaxKind.CallExpression) {
            let receiver = n.expression?.kind === ts.SyntaxKind.PropertyAccessExpression ? n.expression.expression : undefined;
            while (receiver?.kind === ts.SyntaxKind.ParenthesizedExpression || receiver?.kind === ts.SyntaxKind.AsExpression) {
                receiver = receiver.expression;
            }
            if (n.expression?.name?.escapedText === 'limit' && receiver?.kind === ts.SyntaxKind.Identifier && receiver.escapedText === name) {
                found = true;
                return;
            }
        }
        ts.forEachChild (n, visit);
    };
    visit (statement);
    return found;
}

// the statement that immediately follows the declaration in its own block, or undefined
function statementAfter (declaration) {
    const statement = declaration?.parent?.parent;
    if (statement?.kind !== ts.SyntaxKind.VariableStatement) {
        return undefined;
    }
    const statements = statement.parent?.statements;
    if (statements === undefined) {
        return undefined;
    }
    const index = statements.indexOf (statement);
    return (index >= 0 && index + 1 < statements.length) ? statements[index + 1] : undefined;
}

// the C# type of the ws order book subscriber local, or undefined when the immediate next
// statement does not dereference it through `limit ()`
function wsOrderBookWatchType (declaration) {
    if (wsWatchAwaitMethodName (declaration) === undefined) {
        return undefined;
    }
    const name = declaration.name?.escapedText;
    const next = statementAfter (declaration);
    if (next?.kind !== ts.SyntaxKind.ReturnStatement || typeof name !== 'string' || !statementCallsLimitOn (next.expression, name)) {
        return undefined;
    }
    return 'ccxt.pro.IOrderBook';
}

// the printed initializer still IS the awaited call the type was proven from: an
// implicit-`this` call prints `await this.<name>(`, a table call prints `await <name>(`.
// Anything else (a typed core's `ccxt.BaseExchange.FromX(...)` funnel) is a different
// static type and keeps the local `object`.
function awaitedCallIsPrintedAsProven (value, initializer) {
    if (value.startsWith ('await this.')) {
        return true;
    }
    const call = initializer.expression;
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    // `await client.future (hash)` prints as that very call (the resolve-box family, U45)
    if (clientFutureHashArgument (call) !== undefined && value.startsWith ('await client.future(')) {
        return true;
    }
    const name = printedBareCalleeName (call);
    return name !== undefined && value.startsWith ('await ' + name + '(');
}

// The typed-core funnel: build/csharpTranspiler.ts#wrapTypedCoreConsumers rewrites every
// consuming `await this.<typed core>(...)` into `ccxt.BaseExchange.From<Family>(await this.<core>
// (...))` so the struct never lands in an `object` local. That pass runs on the PRINTED text, so
// the classification below cannot see the funnel; it confirms it on the venue's own generated file
// instead (the previous run's output — the same on-disk source awaitedApiReturnTypes reads).
// The From* helper used to return `object`: it hands a non-matching value back unchanged and
// builds a fresh dict/list on the matching path, so the funnel's static type was unnameable.
// Each family now also carries a typed overload whose parameter IS the core's own C# type (the
// printer wraps exactly the calls whose wrapper prints that type) and whose result IS the box the
// matching arm builds: `From<Family>(<Family> value)` -> Dictionary<string, object>,
// `From<Family>List(List<Family> values)` -> List<object> (the generated families are structs, so
// the matching arm is the only reachable one; a null List passes through as null), plus the
// hand-written identities FromDict / FromDictList / FromOHLCVDict / FromOHLCVList / FromInt64 /
// FromStringValue / FromStringList in Exchange.TranspileHelpers.cs. The box is read from those
// base files — the files the C# compiler compiles — so the declaration below can only name a type
// the emitted call really carries, and a site the funnel pass never visits (a non-`public async`
// method, a file without typed cores) has no on-disk funnel line and keeps its local `object`.
const CSHARP_TYPED_CORE_FOLDER = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt', 'base');
const CSHARP_TYPED_CORE_FILES = ['Exchange.TypedCores.cs', 'Exchange.TranspileHelpers.cs'];
const CSHARP_TYPED_CORE_BOXES = ['Dictionary<string, object>', 'List<object>', 'List<string>', 'Int64', 'string'];
const CSHARP_TYPED_CORE_OVERLOAD = /^\s*public static ([A-Za-z0-9_<>,. ]+?) (From[A-Za-z0-9]+)\(([A-Za-z0-9_<>,. ]+?) [A-Za-z_]\w*\)/;
const CSHARP_EXCHANGE_FOLDER = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt', 'exchanges');
let csharpTypedCoreFunnels;
function csharpTypedCoreFunnelTypes () {
    if (csharpTypedCoreFunnels !== undefined) {
        return csharpTypedCoreFunnels;
    }
    const table = new Map ();
    for (const name of CSHARP_TYPED_CORE_FILES) {
        let content;
        try {
            content = fs.readFileSync (path.join (CSHARP_TYPED_CORE_FOLDER, name), 'utf8');
        } catch (e) {
            continue; // a checkout without the generated base is never fatal
        }
        for (const line of content.split ('\n')) {
            const match = CSHARP_TYPED_CORE_OVERLOAD.exec (line);
            if (match === null || !CSHARP_TYPED_CORE_BOXES.includes (match[1]) || match[3] === 'object') {
                continue; // `public static object FromX(object value)` names no box
            }
            table.set (match[2], match[1]);
        }
    }
    csharpTypedCoreFunnels = table;
    return table;
}

// the generated files that can hold this source's funnel lines: the tier's own file first, then
// the sibling tiers (a pro file inherits its REST wrapper, so its funnel line sits in the REST
// file whenever the pro tier has none)
function csharpFunnelFiles (node) {
    const fileName = node.getSourceFile?.()?.fileName ?? '';
    // the base classes are printed from a per-process overload-stripped copy
    // (ts/src/base/Exchange.nooverloads.<pid>.ts), so strip that suffix before the lookup
    const id = sourceExchangeId (node).replace (/\.nooverloads\.\d+$/, '');
    if (id === 'Exchange') {
        return [ path.join (CSHARP_TYPED_CORE_FOLDER, 'Exchange.TradingMethods.cs'),
                 path.join (CSHARP_TYPED_CORE_FOLDER, 'Exchange.BaseMethods.cs') ];
    }
    if (id === 'PredictionExchange') {
        return [ path.join (CSHARP_TYPED_CORE_FOLDER, 'PredictionExchange.cs') ];
    }
    const pro = /[\\/]pro[\\/]/.test (fileName);
    const prediction = sourceTier (node) === 'prediction';
    const files = [];
    if (pro) files.push (path.join (CSHARP_EXCHANGE_FOLDER, 'pro', id + '.cs'));
    if (prediction) files.push (path.join (CSHARP_EXCHANGE_FOLDER, 'prediction', id + '.cs'));
    files.push (path.join (CSHARP_EXCHANGE_FOLDER, id + '.cs'));
    if (!pro) files.push (path.join (CSHARP_EXCHANGE_FOLDER, 'pro', id + '.cs'));
    if (!prediction) files.push (path.join (CSHARP_EXCHANGE_FOLDER, 'prediction', id + '.cs'));
    return files;
}

const csharpFunnelFileCache = new Map ();
function csharpFunnelFileContent (file) {
    if (!csharpFunnelFileCache.has (file)) {
        let content;
        try {
            content = fs.readFileSync (file, 'utf8');
        } catch (e) {
            content = undefined; // not a generated venue (tests, a brand new id) — never fatal
        }
        csharpFunnelFileCache.set (file, content);
    }
    return csharpFunnelFileCache.get (file);
}

// the funnel declaration this local had in the last generated output — `<type> <name> =
// ccxt.BaseExchange.From<Helper>(await this.<core>(` — so the helper (and with it the box) is the
// funnel pass's own verdict for this exact site: a site the pass did not wrap matches nothing
function csharpFunnelHelper (content, name, core) {
    // the emitted call site is pascalized (pascalizeTypedCores), the AST holds the TS name, so the
    // core matches case-insensitively; the helper and the local name must match exactly
    const line = new RegExp ('^[ \\t]*[A-Za-z][\\w<>,. ]* ' + name + ' = ccxt\\.BaseExchange\\.(From\\w+)\\(await this\\.' + core + '\\(', 'i');
    for (const text of content.split ('\n')) {
        const match = line.exec (text);
        if (match !== null) {
            return match[1];
        }
    }
    return undefined;
}

// the box the funnel's bound overload returns, or undefined when this declaration is not a funneled
// typed core of its venue. The awaited call has to be THIS declaration's own callee.
function typedCoreFunnelType (csharp, declaration) {
    if (declaration?.name?.kind !== ts.SyntaxKind.Identifier || declaration.initializer?.kind !== ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    const call = declaration.initializer.expression;
    const callee = (call?.kind === ts.SyntaxKind.CallExpression) ? call.expression : undefined;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const core = callee.name?.escapedText;
    if (core === undefined) {
        return undefined;
    }
    const table = csharpTypedCoreFunnelTypes ();
    for (const file of csharpFunnelFiles (declaration)) {
        const content = csharpFunnelFileContent (file);
        if (content === undefined) {
            continue;
        }
        const helper = csharpFunnelHelper (content, declaration.name.escapedText, core);
        if (helper !== undefined) {
            return table.get (helper);
        }
    }
    return undefined;
}

// The generated implicit-api wrappers (cs/ccxt/api/<id>.cs + cs/ccxt/api/prediction/<id>.cs)
// declare one `public async Task<T> <name> (object parameters = null)` per endpoint. Those
// signatures are read from disk — the same files the C# compiler reads — so typing an
// awaited local with the T found here is consistent with the callee BY CONSTRUCTION.
// Multi-shape endpoints (Task<object>) are skipped, and a missing file (tests, ws tier,
// a hand-written venue) simply leaves the local `object`.
//
// A venue id can exist in BOTH tiers (binance, hyperliquid): the crypto class and the
// prediction class are different C# classes with different endpoint sets, so the table
// MUST come from the folder matching the SOURCE tree — a prediction venue reads
// api/prediction/<id>.cs first, a crypto/ws source reads api/<id>.cs first. Taking the
// other tier's table either misses the endpoint (prediction/binance.ts endpoints are
// absent from the crypto table) or, worse, names a type the callee does not declare.
const CSHARP_API_METHOD = /^\s*public async Task<(.+)> (\w+) \(object parameters = null\)/;
const CSHARP_API_FOLDER = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt', 'api');
const awaitedApiTables = new Map ();

// ===== U44: prediction-tier shard =====
// (1) the typed-core funnel in the prediction tree: build/csharpTranspiler.ts#wrapTypedCoreConsumers
// rewrites every `await this.<core>(...)` whose core declares a struct return into
// `ccxt.BaseExchange.From<Family>(await this.<Core>(...))`. The helper's object overload
// (Exchange.TypedCores.cs / Exchange.TranspileHelpers.cs) hands the argument back unchanged on a
// non-matching arm and builds the box below on the matching one — and the funnel wraps only the
// cores whose C# return type IS that argument type, so the box is what the call returns at runtime:
//   FromDict                  -> the typed `Dictionary<string, object> FromDict(Dictionary<string, object>)`
//                                overload in Exchange.TranspileHelpers.cs (no cast: the call's own
//                                C# type already is the box)
//   FromDictList              -> List<object> (arm `values is List<Dictionary<string, object>>` ->
//                                `new List<object>(typed)`)
//   FromTradeList / FromPredictionTradeList / FromPredictionOrderList / FromPredictionEventList /
//   FromPredictionPositionList -> List<object> (arm `values is List<T>` -> a fresh List<object>)
//   FromPredictionOrder / FromPredictionEvent / FromPredictionOrderBook / FromPredictionPosition
//                             -> Dictionary<string, object> (arm `value is T` -> a fresh dict)
// A null argument matches no arm and comes back null, which every one of these boxes holds.
// The funnel line itself is read from the generated prediction file on disk — the same file the
// C# compiler compiles — exactly as awaitedApiReturnTypes reads the implicit-api wrappers, so the
// declaration can only name a helper the pass really emitted for this site.
const CSHARP_PREDICTION_FUNNEL_BOXES = {
    'FromDict': { type: 'Dictionary<string, object>', cast: undefined },
    'FromDictList': { type: 'List<object>', cast: 'List<object>' },
    'FromTradeList': { type: 'List<object>', cast: 'List<object>' },
    'FromPredictionTradeList': { type: 'List<object>', cast: 'List<object>' },
    'FromPredictionOrderList': { type: 'List<object>', cast: 'List<object>' },
    'FromPredictionEventList': { type: 'List<object>', cast: 'List<object>' },
    'FromPredictionPositionList': { type: 'List<object>', cast: 'List<object>' },
    'FromPredictionOrder': { type: 'Dictionary<string, object>', cast: 'Dictionary<string, object>' },
    'FromPredictionEvent': { type: 'Dictionary<string, object>', cast: 'Dictionary<string, object>' },
    'FromPredictionOrderBook': { type: 'Dictionary<string, object>', cast: 'Dictionary<string, object>' },
    'FromPredictionPosition': { type: 'Dictionary<string, object>', cast: 'Dictionary<string, object>' },
};
const CSHARP_PREDICTION_EXCHANGE_FOLDER = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt', 'exchanges', 'prediction');
const predictionFunnelFileCache = new Map ();
function predictionFunnelFileContent (node) {
    const match = /[\\/]prediction[\\/]([A-Za-z0-9_]+)\.ts$/.exec (node.getSourceFile?.()?.fileName ?? '');
    if (match === null) {
        return undefined;
    }
    if (!predictionFunnelFileCache.has (match[1])) {
        let content;
        try {
            content = fs.readFileSync (path.join (CSHARP_PREDICTION_EXCHANGE_FOLDER, match[1] + '.cs'), 'utf8');
        } catch (e) {
            content = undefined; // a checkout without the generated tree is never fatal
        }
        predictionFunnelFileCache.set (match[1], content);
    }
    return predictionFunnelFileCache.get (match[1]);
}

function predictionFunnelCallType (csharp, declaration) {
    if (!isPredictionSource (declaration) || declaration?.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const initializer = declaration.initializer;
    if (initializer?.kind !== ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    const call = initializer.expression;
    const callee = (call?.kind === ts.SyntaxKind.CallExpression) ? call.expression : undefined;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const core = callee.name?.escapedText;
    if (core === undefined) {
        return undefined;
    }
    const content = predictionFunnelFileContent (declaration);
    if (content === undefined) {
        return undefined;
    }
    // the emitted call site is pascalized, the AST holds the TS name: match the core
    // case-insensitively, the helper and the local name exactly
    // the declaration may already carry the cast this rule emits (a second run reads its own
    // output), so the cast is optional: the helper and the core decide, not the prefix
    const line = new RegExp ('^[ \\t]*[A-Za-z][\\w<>,. ]* ' + declaration.name.escapedText + ' = (?:\\(\\([A-Za-z][\\w<>,.? ]*\\))?ccxt\\.BaseExchange\\.(From\\w+)\\(await this\\.' + core + '\\(', 'i');
    for (const text of content.split ('\n')) {
        const match = line.exec (text);
        if (match !== null) {
            return CSHARP_PREDICTION_FUNNEL_BOXES[match[1]];
        }
    }
    return undefined;
}

// (2) base-property string reads: Exchange.Options.cs declares apiKey / secret / password /
// walletAddress / privateKey as `public string <name> { get; set; }`, so a read of one of them has
// the C# static type `string` (null while unset) — a declaration initialised from that read, or
// from an arm of a conditional that reads it, holds that string or null. Prediction tier only:
// the same names are read in the crypto tree, where the local families belong to the REST units.
const CSHARP_PREDICTION_STRING_MEMBERS = new Set ([ 'apiKey', 'secret', 'password', 'walletAddress', 'privateKey' ]);

function predictionMemberStringRead (declaration) {
    if (!isPredictionSource (declaration)) {
        return undefined;
    }
    const read = declaration.initializer;
    if (read?.kind !== ts.SyntaxKind.PropertyAccessExpression || read.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    return CSHARP_PREDICTION_STRING_MEMBERS.has (read.name?.escapedText) ? 'string?' : undefined;
}

// (3) a prediction-tier local fed by a venue helper whose DECLARATION this module already
// retypes: CSHARP_STRING_RETURN_METHODS / CSHARP_COLLECTION_RETURN_METHODS /
// CSHARP_WS_ROW_BUILDER_RETURNS / CSHARP_NUMERIC_RETURN_TYPES / CSHARP_METHOD_RETURN_TYPES all
// drive installCsharp*Returns, which rewrites the printed signature to the table's box — so the
// call's own C# static type is that box and the declaration names it without a cast. Only the
// string-valued rows are consulted (the per-declaration maps hold objects). Scoped to the
// prediction tier: the REST and pro trees' local families belong to the units that landed those
// tables, and an ungated fallback would retype their locals too.
// the tables are declared further down the module, so the list is built on first use
function predictionRetypedCallTables () {
    return [ CSHARP_STRING_RETURN_METHODS, CSHARP_COLLECTION_RETURN_METHODS, CSHARP_WS_ROW_BUILDER_RETURNS, CSHARP_NUMERIC_RETURN_TYPES, CSHARP_METHOD_RETURN_TYPES ];
}

function predictionRetypedCallType (initializer) {
    if (!isPredictionSource (initializer) || initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const methodName = callee.name?.escapedText;
    for (const table of predictionRetypedCallTables ()) {
        if (Object.prototype.hasOwnProperty.call (table, methodName) && typeof table[methodName] === 'string') {
            return table[methodName];
        }
    }
    return undefined;
}

function isPredictionSource (node) {
    const fileName = node.getSourceFile?.()?.fileName ?? '';
    return fileName.includes ('/prediction/') || fileName.includes ('\\prediction\\');
}

// the prediction shard (U32): every ts/src/prediction source plus the prediction base
function predictionTreeSource (node) {
    return isPredictionSource (node) || /PredictionExchange\.ts$/.test (node.getSourceFile?.()?.fileName ?? '');
}

function awaitedApiReturnTypes (exchange, predictionSource = false) {
    const cacheKey = (predictionSource ? 'prediction:' : 'root:') + exchange;
    if (awaitedApiTables.has (cacheKey)) {
        return awaitedApiTables.get (cacheKey);
    }
    let table;
    const predictionFile = path.join (CSHARP_API_FOLDER, 'prediction', exchange + '.cs');
    const rootFile = path.join (CSHARP_API_FOLDER, exchange + '.cs');
    const candidates = predictionSource ? [ predictionFile, rootFile ] : [ rootFile, predictionFile ];
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
    awaitedApiTables.set (cacheKey, table);
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

// the tier the source file is emitted into (the id alone cannot tell: binance exists as
// both ts/src/binance.ts and ts/src/prediction/binance.ts)
function sourceTier (node) {
    const fileName = node.getSourceFile?.()?.fileName ?? '';
    if (/[\\/]prediction[\\/]/.test (fileName)) {
        return 'prediction';
    }
    return 'rest';
}

// A method DECLARED in the current source file: the printer already knows the generated
// C# return type of every declaration it prints, so `await this.<name>(...)` whose
// same-file declaration prints a concrete `Task<T>` (the async boolean rule, the async
// cores retyped above) resolves to that T. Declarations that still print `Task<object>`
// (typed cores — their retype is a text pass that runs AFTER printing and funnels the
// call site through a From* helper — and every other untyped method) resolve to undefined,
// so their locals stay `object` exactly as before. One table per source file, cached.
const sameFileAwaitedTables = new WeakMap ();

function printedAwaitedReturnType (csharp, declaration) {
    if (typeof csharp.isAsyncFunction === 'function' && !csharp.isAsyncFunction (declaration)) {
        return undefined;
    }
    if (typeof csharp.printFunctionType !== 'function') {
        return undefined;
    }
    try {
        const printed = csharp.printFunctionType (declaration);
        const match = /^Task<(.+)>$/.exec (printed ?? '');
        if (match === null || match[1] === 'object') {
            return undefined;
        }
        return match[1];
    } catch (e) {
        return undefined; // never fatal: the local simply stays `object`
    }
}

function sameFileAwaitedReturnType (csharp, call, methodName) {
    const sourceFile = call.getSourceFile?.();
    if (sourceFile === undefined) {
        return undefined;
    }
    let table = sameFileAwaitedTables.get (sourceFile);
    if (table === undefined) {
        table = new Map ();
        const visit = (node) => {
            if (node.kind === ts.SyntaxKind.MethodDeclaration && node.name?.kind === ts.SyntaxKind.Identifier) {
                const name = node.name.escapedText;
                if (!table.has (name)) {
                    // first declaration wins: C# has no return-type overloads, so the name
                    // is unique per class and every call binds to this very declaration
                    table.set (name, printedAwaitedReturnType (csharp, node));
                }
            }
            ts.forEachChild (node, visit);
        };
        visit (sourceFile);
        sameFileAwaitedTables.set (sourceFile, table);
    }
    return table.get (methodName);
}

// the C# type `this.<name>(...)` resolves to (the awaited result type of its Task<T>), or
// undefined when the callee's signature cannot be proven from a C# side source
function thisCallResultType (csharp, call) {
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
    const sameFile = sameFileAwaitedReturnType (csharp, call, methodName);
    if (sameFile !== undefined) {
        return sameFile;
    }
    const table = awaitedApiReturnTypes (sourceExchangeId (call), isPredictionSource (call));
    return table?.get (methodName);
}

// the C# type of `await this.<name>(...)`, or undefined when the callee's Task<T> cannot
// be proven from a C# signature (typed cores are funneled through From* helpers by
// build/csharpTranspiler.ts, so their locals must stay `object`)
export function csharpAwaitedThisCallType (csharp, node) {
    return thisCallResultType (csharp, node?.expression);
}

// this.<member> -> C# type. Only members whose hand-written base declaration already IS
// that type are listed; checked against cs/ccxt/**/*.cs — no generated class redeclares
// these members (search `id { get; set; }` / `string id`).
export const CSHARP_LOCAL_THIS_MEMBER_TYPES = {
    // Exchange.Options.cs: `public string id { get; set; } = "Exchange";`
    'id': 'string',
};

// `client.<member>` reads of the hand-written WebSocketClient (cs/ccxt/ws/Client.cs).
// build/csharpTranspiler.ts#getWsRegexes rewrites the TEXT of the ws tree afterwards:
// every `client.subscriptions` (and `.rejections`) occurrence becomes
// `((WebSocketClient)client).<member>`, and `(object client` parameter declarations become
// `(WebSocketClient client`. The member read's C# static type is therefore the field's
// declared type on the printed receiver:
//   subscriptions / rejections -> IDictionary<string, object> (ConcurrentDictionary box)
//   url                        -> string
// A read on any other receiver keeps the printer's `object` (and a receiver that is not a
// ws client would have failed the emitted cast/field lookup on master already, so the
// build gate re-checks every retyped site).
const CSHARP_CLIENT_MEMBER_TYPES = {
    'subscriptions': 'IDictionary<string, object>',
    'rejections': 'IDictionary<string, object>',
    'url': 'string',
};

function clientMemberReadType (node) {
    const member = node.name?.escapedText;
    const memberType = CSHARP_CLIENT_MEMBER_TYPES[member];
    if (memberType === undefined) {
        return undefined;
    }
    const receiver = node.expression;
    if (receiver?.kind !== ts.SyntaxKind.Identifier || receiver.escapedText !== 'client') {
        return undefined;
    }
    return memberType;
}

// `this.<member>` reads of the hand-written BaseExchange fields/properties
// (cs/ccxt/base/Exchange.Options.cs). Only members whose declared C# type already IS the
// value's box are listed; verified tree-wide: no other class declares or hides these
// members (census over cs/ccxt/**/*.cs).
//   symbols              `public List<object> symbols { get; set; } = null;`
//   isSandboxModeEnabled `public bool isSandboxModeEnabled { get; set; } = false;`
//   orders / myTrades    `public ccxt.pro.ArrayCache ...;` — retyped from `object` in this
//     unit. Every writer of the two fields across cs/** (census: 88 ArrayCache-family
//     constructors, 6 null, 21 write-backs of the `object x = this.orders/myTrades` copy
//     locals below — the `if (x == null) { x = new ArrayCacheBy(…); this.orders = x; }`
//     cache-setup pattern, plus bitstamp's two pruneCachedBySymbols writes) stores an
//     ArrayCache subclass or null; that one non-constructor producer is retyped in
//     CSHARP_METHOD_RETURN_TYPES and returns the caller's own fresh ArrayCacheBySymbolById.
//     ArrayCacheBySymbolById / BySymbolBySide / ByOutcomeById / ByTimestamp derive from
//     ArrayCache (cs/ccxt/ws/ArrayCache.cs), so naming the base moves no box and needs no cast.
// positions stays `object`: binance / gate / htx / bitget / toobit write a
//     `new Dictionary<string, object>()` (the account-type-keyed map of caches) into it.
const CSHARP_LOCAL_WS_MEMBER_TYPES = {
    'symbols': 'List<object>',
    'isSandboxModeEnabled': 'bool',
    'orders': 'ccxt.pro.ArrayCache',
    'myTrades': 'ccxt.pro.ArrayCache',
    // Exchange.Options.cs: `public string walletAddress { get; set; }` (U33). The read's C#
    // static type IS the property's declared type, so the local names the box it already has;
    // no other class in cs/ccxt/** declares or hides the member (census over cs/ccxt/**/*.cs).
    'walletAddress': 'string',
    // not a ws field, same proof shape: Exchange.Options.cs declares `public string secret
    // { get; set; }`, so the read's C# static type is the property's own type — a settable
    // property that can hold null at runtime, hence the nullable spelling (the same one
    // CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES carries for the ternary arms)
    'secret': 'string?',
    // U37: every writer in cs/** stores `new ArrayCache (limit)` or null (Exchange.Options.cs
    // declaration retyped with it); the reads feed filterBySymbolsSinceLimit / callDynamically.
    'liquidations': 'ccxt.pro.ArrayCache',
    // `public IDictionary<string, object> markets_by_id { get; set; } = null;` — the read's
    // static type is the interface every writer stores (createSafeDictionary / a sibling
    // exchange's map / null), so the declaration needs no cast. Tree-wide census: no generated
    // class declares or hides the property.
    'markets_by_id': 'IDictionary<string, object>',
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
// the spellings a null-declared / null-annotated local can be declared with (see the
// collection annotation join in csharpLocalTypeOf)
const COLLECTION_LOCAL_TYPES = [ 'Dictionary<string, object>', 'IDictionary<string, object>', 'List<object>', 'IList<object>' ];
// the concrete ws orderbooks; all implement ccxt.pro.IOrderBook (cs/ccxt/ws/OrderBook.cs)
const ORDERBOOK_IMPL_TYPES = [ 'ccxt.pro.OrderBook', 'ccxt.pro.IndexedOrderBook', 'ccxt.pro.CountedOrderBook' ];
// a later `orderbook = this.orderBook (...)` write joins the map-read initializer along this
// edge: the same object under the interface spelling (the same widening `assignable` uses)
const ORDERBOOK_WIDENING_EDGES = ORDERBOOK_IMPL_TYPES.map ((impl) => [ impl, 'ccxt.pro.IOrderBook' ]);

// the ArrayCache constructors (cs/ccxt/ws/ArrayCache.cs) a write to this.orders / this.myTrades
// can store; naming the base class moves no box (implicit reference conversion). Both
// spellings: the pro/prediction trees are `namespace ccxt.pro`, so a `new ArrayCacheBy…(…)`
// local carries the bare class name (the classifier names the printed constructor) while the
// member read of the hand-written base (namespace ccxt) spells it `ccxt.pro.…`.
// NB: ArrayCacheByTimestamp derives from BaseCache, not from ArrayCache — the split is
// authoritative in ARRAY_CACHE_ARRAY_FAMILY_CTORS / ARRAY_CACHE_ALL_CTORS below.
const ARRAY_CACHE_SUBTYPES = [
    'ccxt.pro.ArrayCacheByTimestamp', 'ArrayCacheByTimestamp',
    'ccxt.pro.ArrayCacheBySymbolById', 'ArrayCacheBySymbolById',
    'ccxt.pro.ArrayCacheByOutcomeById', 'ArrayCacheByOutcomeById',
    'ccxt.pro.ArrayCacheBySymbolBySide', 'ArrayCacheBySymbolBySide',
];
const ARRAY_CACHE_BASE_TYPES = [ 'ccxt.pro.ArrayCache', 'ArrayCache' ];
// the join edge for a local declared from a read of the retyped ws cache members: the later
// cache-setup writes (`x = new ArrayCacheBySymbolById (limit)`) are subclass -> base
const CACHE_MEMBER_WIDENING_EDGES = ARRAY_CACHE_SUBTYPES.flatMap ((subtype) => ARRAY_CACHE_BASE_TYPES.map ((base) => [ subtype, base ]));
// (U45: the same declaration as above -- the edge also covers the this.orderBook (...)
// / indexedOrderBook / countedOrderBook writes; identical value, one declaration.)
// the same base classes under the nullable spelling a null write produces
function isArrayCacheBaseType (type) {
    const bare = type.endsWith ('?') ? type.slice (0, -1) : type;
    return ARRAY_CACHE_BASE_TYPES.includes (bare);
}

// `this.orders` / `this.myTrades` / `this.liquidations` — the retyped ws cache member reads
// (CSHARP_LOCAL_WS_MEMBER_TYPES); their declaration path joins the later writes along
// CACHE_MEMBER_WIDENING_EDGES, so the join must know it is looking at one of them
function wsCacheMemberRead (initializer) {
    return initializer?.kind === ts.SyntaxKind.PropertyAccessExpression
        && initializer.expression?.kind === ts.SyntaxKind.ThisKeyword
        && (initializer.name?.escapedText === 'orders' || initializer.name?.escapedText === 'myTrades' || initializer.name?.escapedText === 'liquidations');
}

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
    // an ArrayCache subclass IS the ArrayCache the retyped this.orders / this.myTrades fields
    // (and the locals declared from their reads) hold — the same reference, no box moves.
    // The bare spelling is the same class in a `namespace ccxt.pro` / prediction file, and
    // ArrayCacheByTimestamp is deliberately NOT here: it derives from BaseCache, not from
    // ArrayCache (cs/ccxt/ws/ArrayCache.cs), so only a BaseCache target may hold it.
    if (isArrayCacheBaseType (target) && ARRAY_CACHE_ARRAY_FAMILY_CTORS.includes (bareCsharpType (source))) {
        return true;
    }
    if (bareCsharpType (target) === 'BaseCache') {
        return ARRAY_CACHE_ALL_CTORS.includes (bareCsharpType (source));
    }
    if (bareCsharpType (target) === 'ArrayCacheByTimestamp') {
        return bareCsharpType (source) === 'ArrayCacheByTimestamp';
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

// the extra edge the NULL-DECLARED join applies (see csharpLocalTypeOf): Dictionary
// implements IDictionary, so both spellings leave the same reference box; an annotation
// (`NullableDict`/`Dict`/`Market`) is narrower than a later safeDict / typed-helper write.
// Kept out of WIDENING_EDGES so a declaration WITH an initializer keeps its own spelling.
const NULL_DECLARED_WIDENING_EDGES = [
    [ 'Dictionary<string, object>', 'IDictionary<string, object>' ],
];

// The copy rule's own extra widening (see copyReadLocalType): a local initialised from a
// READ of a typed local holds exactly that local's box, so when a later write stores the
// INTERFACE spelling of a Dictionary — the safeDict*/safeList* family's returns — the copy
// may declare `IDictionary<string, object>`: the same dictionary object through the
// implicit reference conversion assignable() already relies on (a Dictionary box in an
// IDictionary declaration). One-way: an IDictionary box may be a ConcurrentDictionary, so
// a Dictionary-typed declaration can never receive one. Passed per declaration instead of
// joining WIDENING_EDGES, because the accumulator rules that share joinTypes (null-init
// and literal-init locals) do not have this proof.
const COPY_WIDENING_EDGES = [
    [ 'Dictionary<string, object>', 'IDictionary<string, object>' ],
];

// Interface-first widening (see typeFromValueOrWrites): a safeDict* result is the INTERFACE
// (the family's own declaration) and a later write of the concrete Dictionary — a `{}`
// literal, this.extend (...), this.account () — is an implicit reference conversion into it
// (same box). Keyed to declarations whose own initializer is the interface; a null-declared
// local belongs to NULL_DECLARED_WIDENING_EDGES, not to this family.
const INTERFACE_FIRST_WIDENING_EDGES = [
    [ 'Dictionary<string, object>', 'IDictionary<string, object>' ],
];

// the dictionary twin of the List/IList edge, for the `let x = {}` family alone (prints
// `new Dictionary<string, object> ()`): its later writes only ever store IDictionary<string, object>
// (this.safeDict / this.omit return the interface) and Dictionary implements IDictionary by
// an implicit reference conversion, so declaring the interface moves no box.
const DICTIONARY_LITERAL_WIDENING_EDGES = [
    [ 'Dictionary<string, object>', 'IDictionary<string, object>' ],
];

// the join of two proven types along WIDENING_EDGES (plus the caller's extra edges), or
// undefined when they cannot both live in one declaration without changing a box (`Int64?`
// + `int`, `Dictionary` + `List`, two different base types, ...). 'null' is neutral here;
// nullability is applied by typeFromValueOrWrites once every contribution has been joined.
function joinTypes (a, b, extraEdges) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return a;
    }
    const edges = (extraEdges === undefined) ? WIDENING_EDGES : WIDENING_EDGES.concat (extraEdges);
    for (const [ from, to ] of edges) {
        if ((a === from && b === to) || (a === to && b === from)) {
            return to;
        }
    }
    return undefined;
}

// the type of `c ? a : b` from its two arms: identical types, T + null -> T? for a
// reference/nullable T, or an integer arm beside a nullable wide-numeric arm (see
// numericArmWidening). Anything else (including two distinct provable types) is not
// provable — the C# ternary needs both arms convertible to one type. `armWidening` enables
// the collection pair (collectionArmWidening); it is false for a prediction-tier source.
function unifyArms (a, b, armWidening = false) {
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
    // `cond ? <Dictionary<string, object>> : <IDictionary<string, object>>` — see
    // collectionArmWidening
    const widenedCollection = armWidening ? collectionArmWidening (a, b) : undefined;
    if (widenedCollection !== undefined) {
        return widenedCollection;
    }
    const widened = numericArmWidening (a, b);
    if (widened !== undefined) {
        return widened;
    }
    return undefined;
}

// an arm typed `Dictionary<string, object>` beside an arm typed `IDictionary<string, object>`:
// the C# conditional operator's natural type is the interface — Dictionary converts to
// IDictionary by an implicit reference conversion and nothing converts back — and both arms
// are the same reference either way, so naming the interface moves no box. A later write is
// unaffected too: assignable() already accepts a Dictionary value into an IDictionary local.
// ARMS ONLY: unifyArms() is reached from the conditional-expression branch alone, while the
// later-write join (joinTypes) keeps its own, narrower edge list.
// The list pair is the same rule one collection over (`marketIds = (ids === undefined) ? [] : ids`
// with `IList<object> ids`): List<object> converts to IList<object> and nothing converts back,
// so the conditional's natural type is the interface and both arms are the same List box.
const ARM_COLLECTION_WIDENING_PAIRS = [
    [ 'Dictionary<string, object>', 'IDictionary<string, object>' ],
    [ 'List<object>', 'IList<object>' ],
];
function collectionArmWidening (a, b) {
    for (const [ narrow, wide ] of ARM_COLLECTION_WIDENING_PAIRS) {
        if ((a === narrow && b === wide) || (a === wide && b === narrow)) {
            return wide;
        }
    }
    return undefined;
}

// the prediction tier (cs/ccxt/exchanges/prediction/**, PredictionExchange.cs) is a sibling
// shard's scope: both arm rules below are keyed off this so a prediction declaration is never
// claimed twice
function isPredictionTierSource (node) {
    if (isPredictionSource (node)) {
        return true;
    }
    const fileName = node?.getSourceFile?. ()?.fileName ?? '';
    return /[\\/]base[\\/]PredictionExchange\.ts$/.test (fileName);
}

// `cond ? 0 : this.safeInteger (...)` / `cond ? 0 : this.safeFloat (...)` — an `int` arm
// beside a nullable wide-numeric arm. The C# conditional operator is NOT target-typed here:
// it computes its own natural type from the two arm types (the int arm converts implicitly
// to Int64? / double?), so the box an `object` declaration already stores is the WIDE box —
// probed with the real compiler: `object x = t ? 0 : (Int64?)l;` boxes System.Int64 and
// `object x = t ? 0 : (double?)d;` boxes System.Double, both with the null arm null. Naming
// `Int64?` / `double?` on the declaration therefore moves no value. ARMS ONLY: for a later
// `x = 0` write the declaration DOES select the conversion (`Int64? x; x = 0` boxes an Int64
// where `object x; x = 0` boxes an Int32), so joinTypes() deliberately keeps rejecting it.
// Only the nullable spellings are widened: the non-nullable Int64 / double arm types have no
// site in the tree, and their read surface (typed helpers whose overloads a non-nullable
// arg would re-bind) would need its own audit.
const NUMERIC_ARM_WIDENING_TYPES = [ 'Int64?', 'double?' ];
function numericArmWidening (a, b) {
    if (a === 'int' && NUMERIC_ARM_WIDENING_TYPES.includes (b)) {
        return b;
    }
    if (b === 'int' && NUMERIC_ARM_WIDENING_TYPES.includes (a)) {
        return a;
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
// A LITERAL-INIT declaration is only box-identical as `int` (the object spelling boxes an Int32):
// naming Int64/Int64?/double CONVERTS the literal (U23/U32 rule), and every later write of a typed
// numeric expression adds an Int64 box — U38 census of the 71 `object x = <int literal>` sites:
// 0 provable (write join 47, destructured object element 14, int `-` operand 5, uint literal 3, += 2).

// C# static type of a decimal integer literal when it stands as an OPERAND of a printed
// arithmetic call: the compiler types it int, uint (2^31..2^32-1) or long
// (2^32..Int64.MaxValue) in that order; anything larger cannot bind the Int64 overloads
// (hex / bigint literals are left unproven). A negative literal is `-` applied to one of
// these: above Int32.MinValue the negated constant is `int`, below it `long`.
function integerOperandKind (text, negative) {
    if (!/^\d+$/.test (text)) {
        return undefined;
    }
    const value = BigInt (text);
    if (negative) {
        // `-2147483648` is the one negative literal whose constant type is int
        if (value <= 2147483648n) {
            return 'int';
        }
        if (value <= 9223372036854775808n) {
            return 'long';
        }
        return undefined;
    }
    if (value <= 2147483647n) {
        return 'int';
    }
    if (value <= 4294967295n) {
        return 'uint';
    }
    if (value <= 9223372036854775807n) {
        return 'long';
    }
    return undefined;
}

// the numeric kinds an arithmetic operand can carry. `int` / `uint` / `long` are the
// literal types; `Int64` / `double` come from declared locals and typed helper calls. All
// of them convert implicitly to the (Int64, Int64) overloads' parameters (int also to
// `int`), and everything except the Int64 family converts to `double`.
const ARITHMETIC_SMALL_INT = [ 'int', 'uint', 'long', 'Int64' ];
// every kind whose boxes the object arithmetic overloads' branch lists accept
// (subtract / mod list Int64 / int / double after normalizeIntIfNeeded widened int+uint);
// a `double` operand can still land on the (object, object) overload of multiply / subtract
const ARITHMETIC_NUMERIC = ARITHMETIC_SMALL_INT.concat ([ 'double' ]);

function arithmeticKindOfType (type) {
    return (type === 'int' || type === 'Int64' || type === 'double') ? type : undefined;
}

// the nullable integer operand kind (`Int64?` — safeInteger / parseToInt results and the
// locals this module declares Int64?), undefined for every other static type. Only the
// families whose hand-written twin has an (Int64?, Int64?) overload may consult it.
function csharpArithmeticNullableOperandKind (csharp, node, context) {
    if (!node) {
        return undefined;
    }
    if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
        return csharpArithmeticNullableOperandKind (csharp, node.expression, context);
    }
    if (node.kind === ts.SyntaxKind.AsExpression) {
        // `x as number` prints the BARE operand (ast-transpiler printAsExpression casts only
        // any / string / any[]), so the static type is the inner expression's
        if (node.type?.kind === ts.SyntaxKind.AnyKeyword || node.type?.kind === ts.SyntaxKind.StringKeyword
            || node.type?.kind === ts.SyntaxKind.ArrayType) {
            return undefined;
        }
        return csharpArithmeticNullableOperandKind (csharp, node.expression, context);
    }
    if (node.kind !== ts.SyntaxKind.Identifier && node.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    return (csharpTypeOfValue (csharp, node, context) === 'Int64?') ? 'Int64?' : undefined;
}

// { kind, nullable } for an operand that can bind the (Int64?, Int64?) twins: an int-like
// kind (int / uint / long / Int64) or a proven Int64?. undefined for a double, a string,
// an unproven operand — anything the nullable twins do not accept.
function nullableIntegerOperand (csharp, node, context) {
    const kind = csharpArithmeticOperandKind (csharp, node, context);
    if (ARITHMETIC_SMALL_INT.includes (kind)) {
        return { kind, nullable: false };
    }
    if (kind !== undefined) {
        return undefined;
    }
    return (csharpArithmeticNullableOperandKind (csharp, node, context) === 'Int64?')
        ? { kind: 'Int64?', nullable: true }
        : undefined;
}

// `a * b` / `a / b` / `a % b` over an int-like operand pair with at least one Int64?:
// multiply / divide / mod each declare an (Int64?, Int64?) twin (Exchange.TranspileHelpers.cs)
// that the compiler picks for exactly this pair set, and it returns the (object, object)
// overload's own box — the Int64 branch for a non-null pair, null when one operand is null —
// so the residue is nameable as `Int64?`.
function nullableIntegerArithmeticKind (csharp, node, context) {
    const left = nullableIntegerOperand (csharp, node.left, context);
    const right = nullableIntegerOperand (csharp, node.right, context);
    if (left === undefined || right === undefined || (!left.nullable && !right.nullable)) {
        return undefined;
    }
    return 'Int64?';
}

// the C# static type of an emitted `a - b` / `a * b` / `a / b`, or undefined when it lands
// on the (object, object) overload and nothing can be named. The typed overload sets
// (Exchange.TranspileHelpers.cs) are
//   subtract: (int, int) -> int, (Int64, Int64) -> Int64, (double, double) -> double
//   multiply: (Int64, Int64) -> Int64, (Int64?, Int64?) -> Int64?
//   divide:   (Int64, Int64) -> Int64, (double, double) -> double, (Int64?, Int64?) -> Int64?
// plus the (object, object) fallback. C#'s implicit numeric conversions take the Int64
// overloads for int / uint / long operands (uint and long never fit the int overload),
// (int, int) wins for two int operands, and (Int64, Int64) beats (double, double)
// whenever both are applicable.
function csharpArithmeticExpressionKind (csharp, node, context) {
    const op = node.operatorToken?.kind;
    if (op !== ts.SyntaxKind.MinusToken && op !== ts.SyntaxKind.AsteriskToken && op !== ts.SyntaxKind.SlashToken) {
        return undefined;
    }
    const left = csharpArithmeticOperandKind (csharp, node.left, context);
    const right = csharpArithmeticOperandKind (csharp, node.right, context);
    const bothSmallInt = ARITHMETIC_SMALL_INT.includes (left) && ARITHMETIC_SMALL_INT.includes (right);
    const hasDouble = (left === 'double') || (right === 'double');
    if (op === ts.SyntaxKind.SlashToken) {
        // any double operand widens to (double, double); Int64 pairs divide truncated
        if (bothSmallInt) {
            return 'Int64';
        }
        if ((left === 'double' && (right === 'double' || ARITHMETIC_SMALL_INT.includes (right))) ||
            (right === 'double' && ARITHMETIC_SMALL_INT.includes (left))) {
            return 'double';
        }
        return nullableIntegerArithmeticKind (csharp, node, context);
    }
    if (op === ts.SyntaxKind.MinusToken) {
        if (bothSmallInt) {
            return (left === 'int' && right === 'int') ? 'int' : 'Int64';
        }
        // subtract(double, double) is the object overload's own double branch for a
        // (double, int-like / double) pair; an (int-like, double) pair lands on the same
        // twin but the (object, object) call it replaces throws — that class stays unproven
        return (left === 'double' && (right === 'double' || ARITHMETIC_SMALL_INT.includes (right)))
            ? 'double'
            : undefined;
    }
    // `*`: multiply(Int64, Int64) for two int-like operands, multiply(Int64?, Int64?) for a
    // null-holding pair; a double operand stays unproven (no multiply(double, double) twin —
    // an integer-valued double product re-boxes as Int64)
    if (bothSmallInt) {
        return 'Int64';
    }
    return hasDouble ? undefined : nullableIntegerArithmeticKind (csharp, node, context);
}

// the arithmetic kind of one operand of a printed `-` / `*` / `/`, or undefined when the
// C# static type cannot be proven. Mirrors what the C# compiler sees: literals by their
// literal type, `.length` as int (getArrayLength / string Length), calls and locals
// through csharpTypeOfValue (this.milliseconds -> Int64, this.parseTimeframe -> int,
// declared locals through the type they are emitted with), nested arithmetic recursively.
function csharpArithmeticOperandKind (csharp, node, context) {
    if (!node) {
        return undefined;
    }
    switch (node.kind) {
    case ts.SyntaxKind.NumericLiteral:
        return integerOperandKind (node.text, false);
    case ts.SyntaxKind.PrefixUnaryExpression:
        // `-N` prints as a negative literal; any other prefix stays unproven
        return (node.operator === ts.SyntaxKind.MinusToken && node.operand?.kind === ts.SyntaxKind.NumericLiteral)
            ? integerOperandKind (node.operand.text, true)
            : undefined;
    case ts.SyntaxKind.ParenthesizedExpression:
        return csharpArithmeticOperandKind (csharp, node.expression, context);
    case ts.SyntaxKind.PropertyAccessExpression:
        // `x.length` prints getArrayLength(x) / ((string)x).Length — int on every shape
        return (node.name?.escapedText === 'length') ? 'int' : undefined;
    case ts.SyntaxKind.Identifier:
    case ts.SyntaxKind.CallExpression:
        return arithmeticKindOfType (csharpTypeOfValue (csharp, node, context));
    case ts.SyntaxKind.BinaryExpression:
        // a nested `+` is an add(...) call too: its own typed result is what the enclosing
        // arithmetic operator sees as an operand
        return (node.operatorToken?.kind === ts.SyntaxKind.PlusToken)
            ? csharpAddExpressionKind (csharp, node, context)
            : csharpArithmeticExpressionKind (csharp, node, context);
    }
    return undefined;
}

// the C# static type of an emitted `a + b` (printed `add(a, b)`) when the operand kinds select
// one of the two typed add overloads this unit adds to Exchange.TranspileHelpers.cs (the
// overload names S57 owns):
//   add(Int64, Int64)   -> Int64   for int / uint / long / Int64 on both sides
//   add(double, double) -> double  for a double left with any proven numeric right
// Both return the same unchecked sum the (object, object) overload's Int64 / double branches
// compute for those operand boxes — an int / uint operand is normalized to Int64 there, and
// `Convert.ToDouble(b)` is the implicit widening — so naming the result moves no value, and a
// non-nullable operand can never take that overload's null-left path. An Int64 / int / uint
// left with a double right is deliberately rejected: there the object path runs the Int64
// branch's `(Int64)b` unboxing, which throws on a double box, where the new add(double, double)
// would return a sum (the same reason the base has no subtract(double, double) twin).
function csharpAddExpressionKind (csharp, node, context) {
    const left = csharpArithmeticOperandKind (csharp, node.left, context);
    const right = csharpArithmeticOperandKind (csharp, node.right, context);
    if (left === undefined || right === undefined) {
        return undefined;
    }
    if (ARITHMETIC_SMALL_INT.includes (left) && ARITHMETIC_SMALL_INT.includes (right)) {
        return 'Int64';
    }
    if (left === 'double' && (right === 'double' || ARITHMETIC_SMALL_INT.includes (right))) {
        return 'double';
    }
    return undefined;
}

// ===== integer-box helper call results =====
//
// `this.sum (a, b)` is the hand-written helper whose (object, object) overload returns
// `object` while the box it hands back is provably an Int64 for a whole operand family —
// so the declaration can name it, with the exact cast the object-returning call cannot
// express (the same shape as the element-access string cast).
//
//   sum (Exchange.Generic.cs): `if (a == null) a = 0;` for both arguments, then
//     `Convert.ToInt64 (Convert.ToDouble (a) + Convert.ToDouble (b))` whenever the double sum
//     is integer-valued. Convert.ToDouble of an integer box is integral (the nearest double to
//     an integer value is an integer), so an argument that is an integer box (int / uint /
//     long / Int64) or null (an Int64? — the nullable spelling this module declares for
//     safeInteger / parseToInt) makes the sum integer-valued by construction: the box is
//     ALWAYS Int64, never the double the last return hands back for a non-integer input.
//
// `a % b` (printed `mod(a, b)`) needs no cast: its typed twins make the call's own C# type
// the declaration (see modTwinCallType).
function integerOrNullArgumentKind (csharp, node, context) {
    const kind = csharpArithmeticOperandKind (csharp, node, context);
    if (kind !== undefined) {
        // int / uint / long literals and int / Int64 proven expressions; a double operand can
        // make the object sum hand back the double itself, so it proves nothing. `Int64?` is
        // the nullable spelling of the same integer box and is the static C# type of a nested
        // `a * b` / `a / b` / `a % b` over an Int64? operand (it binds the (Int64?, Int64?)
        // twin) and of a `parseInt (...)` call (retyped Int64?, Exchange.TranspileHelpers.cs);
        // sum's object overload maps a null operand to 0 exactly like its Int64? twin, so the
        // emitted call's own type is Int64 on every path — the declaration needs no cast (cs90
        // U35; the family's own int/Int64 spelling is unchanged).
        return (ARITHMETIC_SMALL_INT.includes (kind) || kind === 'Int64?') ? kind : undefined;
    }
    return (csharpTypeOfValue (csharp, node, context) === 'Int64?') ? 'Int64?' : undefined;
}

// `a % b` prints `mod(a, b)`. Exchange.TranspileHelpers.cs declares mod(Int64, Int64) /
// mod(double, double) / mod(Int64?, Int64?), each mirroring the (object, object) overload's
// numeric branch (`Convert.ToInt64((double) a % (double) b)`, a null operand -> null), so
// for every operand pair the classifier can name, the printed call's OWN C# type is the
// declaration — no cast: `Int64 x = mod(a, b)` / `Int64? x = mod(a, b)`.
function modTwinCallType (csharp, initializer, context) {
    if (initializer?.kind !== ts.SyntaxKind.BinaryExpression || initializer.operatorToken?.kind !== ts.SyntaxKind.PercentToken) {
        return undefined;
    }
    const left = csharpArithmeticOperandKind (csharp, initializer.left, context);
    const right = csharpArithmeticOperandKind (csharp, initializer.right, context);
    if (ARITHMETIC_NUMERIC.includes (left) && ARITHMETIC_NUMERIC.includes (right)) {
        // both operands are in the object overload's branch list (int / uint widen to Int64
        // through normalizeIntIfNeeded), so mod(Int64, Int64) or mod(double, double) binds
        // and returns exactly the box the object path computes
        return 'Int64';
    }
    return nullableIntegerArithmeticKind (csharp, initializer, context);
}

// `Math.min (a, b)` / `Math.max (a, b)` print `mathMin (a, b)` / `mathMax (a, b)`. Unlike the
// arithmetic twins above, the hand-written (object, object) helper returns ONE OF ITS
// OPERANDS unchanged (`a == null || b == null -> null`, Exchange.TranspileHelpers.cs), so the
// result's box is an operand box and only a pair whose every returnable box IS the named box
// may be declared:
//   int + int                    -> int      (both operands box Int32; the unbox never throws)
//   Int64 + Int64                -> Int64    (a `long` literal boxes Int64 as well)
//   double + double              -> double
//   Int64 beside Int64 / Int64?  -> Int64?   (the Int64 box, or null when the nullable
//                                             operand is null — the (Int64?) unbox is exact
//                                             for both)
// Every mixed pair is rejected: an int literal beside an Int64 / Int64? operand hands back
// the Int32 box (the unbox would throw), and a double beside an integer hands back whichever
// operand won. The typed twins S57 modelled are rejected by its own binding audit — adding
// mathMin (Int64, Int64) / (int, int) / (double, double) / (Int64?, Int64?) re-binds 101
// mixed-kind call sites to a DIFFERENT result box (campaigns/cs-strict/tools/S57/
// audit-numeric-overload-bind.txt: mathMin 101 DIVERGENT, mathMax 1), so this unit adds no
// overload and every declaration carries its own box-exact cast instead.
function mathMinMaxBoxType (csharp, initializer, context) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression || initializer.arguments?.length !== 2) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.Identifier
            || callee.expression.escapedText !== 'Math'
            || (callee.name?.escapedText !== 'min' && callee.name?.escapedText !== 'max')) {
        return undefined;
    }
    const left = mathMinMaxOperandBox (csharp, initializer.arguments[0], context);
    const right = mathMinMaxOperandBox (csharp, initializer.arguments[1], context);
    if (left === undefined || right === undefined) {
        return undefined;
    }
    if (left === 'int' && right === 'int') {
        return { type: 'int', cast: 'int' };
    }
    if (left === 'Int64' && right === 'Int64') {
        return { type: 'Int64', cast: 'Int64' };
    }
    const int64Family = (box) => (box === 'Int64' || box === 'Int64?');
    if (int64Family (left) && int64Family (right) && (left === 'Int64?' || right === 'Int64?')) {
        return { type: 'Int64?', cast: 'Int64?' };
    }
    // the double family is the same shape: a `double` operand boxes as Double and a `double?`
    // operand boxes as Double or null (Nullable<T> boxes as T), so the pair is exact either
    // way — the nullable spelling only when one operand can hand back the null branch
    const doubleFamily = (box) => (box === 'double' || box === 'double?');
    if (doubleFamily (left) && doubleFamily (right)) {
        return (left === 'double?' || right === 'double?')
            ? { type: 'double?', cast: 'double?' }
            : { type: 'double', cast: 'double' };
    }
    return undefined;
}

// the BOX one operand of mathMin / mathMax contributes (see mathMinMaxBoxType): the operand
// kinds csharpArithmeticOperandKind proves, with a `long` literal named by its box (Int64)
// and the nullable spellings (`Int64?` / `double?` — a nullable value boxes as its
// underlying type or null) from csharpTypeOfValue. A `uint` operand (a literal above
// int.MaxValue) is deliberately NOT accepted — the helper would hand back a UInt32 box that
// the (int) / (Int64) unbox rejects.
function mathMinMaxOperandBox (csharp, node, context) {
    const kind = csharpArithmeticOperandKind (csharp, node, context);
    if (kind === 'int' || kind === 'Int64' || kind === 'double') {
        return kind;
    }
    if (kind === 'long') {
        return 'Int64';
    }
    if (kind === undefined) {
        const type = csharpTypeOfValue (csharp, node, context);
        if (type === 'Int64?' || type === 'double?') {
            return type;
        }
    }
    return undefined;
}

function integerBoxCastType (csharp, initializer, context) {
    if (initializer?.kind === ts.SyntaxKind.CallExpression) {
        const callee = initializer.expression;
        if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return undefined;
        }
        if (callee.name?.escapedText !== 'sum') {
            return undefined;
        }
        // the two-argument form only: `sum (params object[])` (one or three+ arguments) adds
        // its own int 0 accumulator first and stays object
        if (initializer.arguments?.length !== 2) {
            return undefined;
        }
        for (const argument of initializer.arguments) {
            if (integerOrNullArgumentKind (csharp, argument, context) === undefined) {
                return undefined;
            }
        }
        return 'Int64';
    }
    return undefined;
}

// `this.sum (a, b)` (the only initializer integerBoxCastType accepts as a CallExpression) now
// binds the typed twins Exchange.Generic.cs carries beside the hand-written helpers — Int64
// sum (Int64, Int64) / Int64 sum (Int64?, Int64?) — because every operand kind
// integerOrNullArgumentKind proves (int / uint / long / Int64 / Int64?) converts implicitly to
// their parameters, and the twins hand back the (object, object) box's Int64 result unchanged.
// So the printed call's own C# type IS the box and the declaration needs no cast. Only `sum`
// is claimed here (the other arithmetic twins and their call sites belong to their own units);
// `a % b` has no typed twin and keeps its cast.
function integerOverloadCallType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression || initializer.arguments?.length !== 2) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    return (callee.name?.escapedText === 'sum') ? 'Int64' : undefined;
}

// `this.clients[url]` (printed `getValue(this.clients, url)`) and
// `this.safeValue (this.clients, url)` — the hand-written
// `ConcurrentDictionary<string, WebSocketClient> clients` (cs/ccxt/ws/Exchange.WsBridge.cs).
// Every value the map holds is a WebSocketClient or null (client() GetOrAdd / TryRemove), so
// the `(WebSocketClient)` cast back is exact. Declaration family only: the ternary-arm table
// leaves `clients` out on purpose (CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES).
function clientsMapReadCastType (initializer) {
    const clientsProperty = (n) => n?.kind === ts.SyntaxKind.PropertyAccessExpression
        && n.expression?.kind === ts.SyntaxKind.ThisKeyword
        && n.name?.escapedText === 'clients';
    if (initializer?.kind === ts.SyntaxKind.ElementAccessExpression && clientsProperty (initializer.expression)) {
        return 'WebSocketClient';
    }
    if (initializer?.kind === ts.SyntaxKind.CallExpression) {
        const callee = initializer.expression;
        if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return undefined;
        }
        if (callee.name?.escapedText !== 'safeValue' || initializer.arguments?.length !== 2) {
            return undefined;
        }
        if (clientsProperty (initializer.arguments[0])) {
            return 'WebSocketClient';
        }
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

// The SAME element rule for the other ws member caches whose element box a tree-wide writer
// census proves (campaigns/cs90/tools/U04/check_writers.py, base d847892a6):
//   this.trades[key]       -> ccxt.pro.ArrayCache. 84 element writes across cs/**: ArrayCache /
//     ArrayCacheBy* constructor, null, or a local whose only writes are those two shapes (the
//     `stored` / `tradesArray` / `tradesCache` null-init idiom); the map itself is only ever
//     replaced by an empty createSafeDictionary (4 whole-field writes).
//   this.ohlcvs[sym][tf]   -> ccxt.pro.ArrayCache. The symbol's bucket dict is a
//     Dictionary<string, object> (53 writers: dict literals and safeValue/safeDict with a dict
//     default) and all 49 of its element writes store an ArrayCacheByTimestamp or the same
//     null-init idiom.
// this.positions[key] is NOT listed: ArrayCacheBySymbolBySide writers sit beside the
// account-type-keyed `new Dictionary<string, object>()` ones (binance/gate/htx/bitget/toobit).
// This rule names the box behind the exact cast back (csharpLocalTypeOf), like the string
// element family; the read itself is unchanged.
const CSHARP_LOCAL_WS_CACHE_ELEMENT_TYPES = {
    'trades': 'ccxt.pro.ArrayCache',
};

// the same source gate the typed-dict read applies: only generated exchange trees (the
// bridge-hosted test/example tiers have no Exchange.GetValue member to cast through)
function wsCacheElementSourceOk (node) {
    const fileName = (node.getSourceFile?.()?.fileName ?? '').replace (/\\/g, '/');
    return fileName.includes ('ts/src/') && !fileName.includes ('ts/src/test/') && !fileName.includes ('examples/');
}

// `this.trades[key]` — the ws trade cache's element read
function wsCacheElementReadType (node) {
    if (node?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    const receiver = node.expression;
    if (receiver?.kind !== ts.SyntaxKind.PropertyAccessExpression || receiver.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const type = CSHARP_LOCAL_WS_CACHE_ELEMENT_TYPES[receiver.name?.escapedText];
    if (type === undefined) {
        return undefined;
    }
    return wsCacheElementSourceOk (node) ? type : undefined;
}

// `this.ohlcvs[symbol][timeframe]` — printed `getValue(getValue(this.ohlcvs, symbol), timeframe)`
function wsOhlcvsBucketReadType (node) {
    if (node?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    const bucket = node.expression;
    if (bucket?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    const receiver = bucket.expression;
    if (receiver?.kind !== ts.SyntaxKind.PropertyAccessExpression || receiver.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    if (receiver.name?.escapedText !== 'ohlcvs') {
        return undefined;
    }
    return wsCacheElementSourceOk (node) ? 'ccxt.pro.ArrayCache' : undefined;
}

// ===== U45: pro-tree residuals — ws cache FIELD reads and awaited ws flights =====
//
// `object cache = this.positions;` — the whole-field read of a hand-written ws cache member.
// The field is declared `object` (Exchange.Options.cs), so the local can only name its box
// behind an exact cast, and the box is what EVERY write of that field in the SAME file stores:
// the venue's own cache-setup methods are the whole writer set for its class, the hand-written
// base writes only null, and the five dict-writing venues (binance / gate / htx / bitget /
// toobit for positions) have no whole-field read. A write accepts an ArrayCache-family
// constructor, undefined / null and a read-back of the same field; an element write (the field
// is then a map) or any other value rejects the member. Census: tools/U45/member-writer-census.py
// + the tree-wide `this.<member> =` writer grep in REPORT.md.
const WS_CACHE_FIELD_READ_TYPES = [ 'positions', 'liquidations', 'myLiquidations' ];
const WS_CACHE_FIELD_CAST = 'ccxt.pro.ArrayCache';

function thisMemberPropertyAccess (node, member) {
    return node?.kind === ts.SyntaxKind.PropertyAccessExpression
        && node.expression?.kind === ts.SyntaxKind.ThisKeyword
        && node.name?.escapedText === member;
}

// an ArrayCache-family constructor: the hand-written cache classes (cs/ccxt/ws/ArrayCache.cs)
function arrayCacheConstructorName (node) {
    if (node?.kind !== ts.SyntaxKind.NewExpression || node.expression?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const name = node.expression.escapedText;
    return /^ArrayCache(By[A-Za-z]+)?$/.test (name) ? name : undefined;
}

// `this.<member> = cache` where `const cache = this.<member>` in the same function — the same box
function wsCacheFieldReadBackWrite (identifier, member) {
    const scope = enclosingFunction (identifier);
    if (scope === undefined) {
        return false;
    }
    let readBack = false;
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.VariableDeclaration && n.name?.kind === ts.SyntaxKind.Identifier
                && n.name.escapedText === identifier.escapedText && thisMemberPropertyAccess (n.initializer, member)) {
            readBack = true;
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return readBack;
}

// a write to the ws cache field that stores a cache box (or null): the only producers the census
// admits beside a constructor are `undefined` / `null` and a read-back of the same field
function wsCacheFieldWriteIsCacheBox (right, member) {
    if (right === undefined) {
        return false;
    }
    if (right.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    if (right.kind === ts.SyntaxKind.Identifier && right.escapedText === 'undefined') {
        return true;
    }
    if (arrayCacheConstructorName (right) !== undefined) {
        return true;
    }
    if (thisMemberPropertyAccess (right, member)) {
        return true;
    }
    return right.kind === ts.SyntaxKind.Identifier && wsCacheFieldReadBackWrite (right, member);
}

// the census over one source file: does every write of the field store a cache box, and is
// there at least one ArrayCache constructor (the field's own producer in this file)?
function wsCacheFieldFileCensus (source, member) {
    let constructors = 0;
    let ok = true;
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.BinaryExpression && ASSIGNMENT_OPERATORS.includes (n.operatorToken?.kind)) {
            const left = n.left;
            if (thisMemberPropertyAccess (left, member)) {
                if (arrayCacheConstructorName (n.right) !== undefined) {
                    constructors++;
                } else if (!wsCacheFieldWriteIsCacheBox (n.right, member)) {
                    ok = false;
                }
            } else if (left?.kind === ts.SyntaxKind.ElementAccessExpression && thisMemberPropertyAccess (left.expression, member)) {
                ok = false; // an element write means the field is a map, not a cache
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (source, visit);
    return ok && constructors > 0;
}

// `this.positions` -> the cache box the file's own writes prove, or undefined. The prediction
// tier is U44's sweep (its roster owns every prediction-tree local), so this family stays out.
function wsCacheFieldReadType (node) {
    if (node?.kind !== ts.SyntaxKind.PropertyAccessExpression || node.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const member = node.name?.escapedText;
    if (!WS_CACHE_FIELD_READ_TYPES.includes (member) || isPredictionSource (node)) {
        return undefined;
    }
    const source = node.getSourceFile?.();
    if (source === undefined || !wsCacheFieldFileCensus (source, member)) {
        return undefined;
    }
    return WS_CACHE_FIELD_CAST;
}

// `this.positions[type]` — the per-key read of the same map. The field may hold a dictionary
// (the account-type-keyed venues), so only the ELEMENT writers decide the box: every
// `this.<member>[k] = rhs` in the file must store an ArrayCache-family constructor.
function wsCacheFieldElementReadType (node) {
    if (node?.kind !== ts.SyntaxKind.ElementAccessExpression || !thisMemberPropertyAccess (node.expression, node.expression?.name?.escapedText)) {
        return undefined;
    }
    const member = node.expression.name.escapedText;
    if (!WS_CACHE_FIELD_READ_TYPES.includes (member)) {
        return undefined;
    }
    const source = node.getSourceFile?.();
    if (source === undefined) {
        return undefined;
    }
    let writes = 0;
    let ok = true;
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.BinaryExpression && ASSIGNMENT_OPERATORS.includes (n.operatorToken?.kind)
                && n.left?.kind === ts.SyntaxKind.ElementAccessExpression && thisMemberPropertyAccess (n.left.expression, member)) {
            if (arrayCacheConstructorName (n.right) !== undefined) {
                writes++;
            } else {
                ok = false;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (source, visit);
    return (ok && writes > 0) ? WS_CACHE_FIELD_CAST : undefined;
}

// the box of an expression a `future.resolve (VALUE)` / `client.resolve (VALUE, hash)` hands back
function resolveValueBox (csharp, value) {
    if (value === undefined) {
        return undefined;
    }
    const cacheBox = wsCacheFieldReadType (value) ?? wsCacheFieldElementReadType (value);
    if (cacheBox !== undefined) {
        return cacheBox;
    }
    if (value.kind === ts.SyntaxKind.Identifier) {
        const declaration = resolveLocalDeclaration (value);
        if (declaration !== undefined) {
            const declarationBox = wsCacheFieldReadType (declaration.initializer) ?? wsCacheFieldElementReadType (declaration.initializer);
            if (declarationBox !== undefined) {
                return declarationBox;
            }
        }
        return localIdentifierType (csharp, value);
    }
    const constructor = arrayCacheConstructorName (value);
    return (constructor === undefined) ? undefined : WS_CACHE_FIELD_CAST;
}

// the sole `const <name> = <init>` / parameter binding of an identifier inside its function
function resolveLocalDeclaration (identifier) {
    const scope = enclosingFunction (identifier);
    if (scope === undefined) {
        return undefined;
    }
    let binding;
    let bindings = 0;
    const visit = (n) => {
        if (n !== scope && isFunctionScope (n)) {
            return;
        }
        if (n.kind === ts.SyntaxKind.VariableDeclaration || n.kind === ts.SyntaxKind.Parameter) {
            if (bindingNamesOf (n.name).includes (identifier.escapedText)) {
                bindings++;
                binding = n;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return (bindings === 1 && binding?.kind === ts.SyntaxKind.VariableDeclaration) ? binding : undefined;
}

// `client.future (HASH)` -> the hash argument, or undefined for any other callee
function clientFutureHashArgument (call) {
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = call.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.name?.escapedText !== 'future') {
        return undefined;
    }
    const receiver = callee.expression;
    if (receiver?.kind !== ts.SyntaxKind.Identifier || receiver.escapedText !== 'client') {
        return undefined;
    }
    return call.arguments?.[0];
}

// the hash expression an identifier argument stands for: its `const <name> = <expr>` initialiser
// in the enclosing function, text-compared with the awaited hash
function boundHashText (argument, scope) {
    if (argument?.kind !== ts.SyntaxKind.Identifier || scope === undefined) {
        return undefined;
    }
    let text;
    let bindings = 0;
    const visit = (n) => {
        if (n !== scope && isFunctionScope (n)) {
            return;
        }
        if (n.kind === ts.SyntaxKind.VariableDeclaration && n.name?.kind === ts.SyntaxKind.Identifier
                && n.name.escapedText === argument.escapedText && n.initializer !== undefined) {
            bindings++;
            text = n.initializer.getText ();
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return bindings === 1 ? text : undefined;
}

// `const future = client.futures[hash]; future.resolve (VALUE)` — the explicit settle of a flight
function receiverReadsClientFutures (identifier, scope) {
    if (identifier?.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    let reads = 0;
    const visit = (n) => {
        if (n !== scope && isFunctionScope (n)) {
            return;
        }
        if (n.kind === ts.SyntaxKind.VariableDeclaration && n.name?.kind === ts.SyntaxKind.Identifier
                && n.name.escapedText === identifier.escapedText && n.initializer?.kind === ts.SyntaxKind.ElementAccessExpression) {
            const target = n.initializer.expression;
            if (target?.kind === ts.SyntaxKind.PropertyAccessExpression && target.name?.escapedText === 'futures'
                    && target.expression?.kind === ts.SyntaxKind.Identifier && target.expression.escapedText === 'client') {
                reads++;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return reads === 1;
}

// `const snapshot = await client.future (HASH)` — the awaited value of a ws flight. The awaiter
// (cs/ccxt/ws/Future.cs) hands back `object`, so the declaration can only name the RESOLVE value
// behind an exact cast. The resolve value is what settles that message-hash family in the SAME
// file: a direct `client.resolve (VALUE, HASH)` whose hash text is the awaited hash, plus the
// explicit `future.resolve (VALUE)` inside a method the file spawns with that hash. Every settle
// must be boxed and all boxes must agree; anything else keeps `object`.
function awaitedClientFutureBox (csharp, initializer) {
    if (initializer?.kind !== ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    const hash = clientFutureHashArgument (initializer.expression);
    if (hash === undefined) {
        return undefined;
    }
    const source = hash.getSourceFile?.();
    if (source === undefined) {
        return undefined;
    }
    const hashText = hash.getText ();
    const spawned = new Set ();
    const boxes = [];
    let settles = 0;
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.CallExpression) {
            const callee = n.expression;
            if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
                const args = n.arguments ?? [];
                if (callee.name?.escapedText === 'spawn') {
                    const target = args[0];
                    if (target?.kind === ts.SyntaxKind.PropertyAccessExpression && target.expression?.kind === ts.SyntaxKind.ThisKeyword) {
                        for (let i = 1; i < args.length; i++) {
                            if (boundHashText (args[i], enclosingFunction (n)) === hashText) {
                                spawned.add (target.name?.escapedText);
                            }
                        }
                    }
                }
            }
            if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.name?.escapedText === 'resolve'
                    && callee.expression?.kind === ts.SyntaxKind.Identifier && callee.expression.escapedText === 'client'
                    && (n.arguments?.[1]?.getText () === hashText)) {
                settles++;
                const box = resolveValueBox (csharp, n.arguments?.[0]);
                if (box !== undefined) {
                    boxes.push (box);
                }
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (source, visit);
    for (const methodName of spawned) {
        const method = spawnedMethod (source, methodName);
        if (method === undefined) {
            continue;
        }
        const visitMethod = (n) => {
            if (n.kind === ts.SyntaxKind.CallExpression) {
                const callee = n.expression;
                if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.name?.escapedText === 'resolve'
                        && receiverReadsClientFutures (callee.expression, method)) {
                    settles++;
                    const box = resolveValueBox (csharp, n.arguments?.[0]);
                    if (box !== undefined) {
                        boxes.push (box);
                    }
                }
            }
            ts.forEachChild (n, visitMethod);
        };
        ts.forEachChild (method, visitMethod);
    }
    if (settles === 0 || boxes.length !== settles) {
        return undefined; // an unproven settle keeps the local `object`
    }
    const unique = new Set (boxes);
    return unique.size === 1 ? boxes[0] : undefined;
}

// the same-file method declaration a spawn names
function spawnedMethod (source, name) {
    if (name === undefined) {
        return undefined;
    }
    let found;
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.MethodDeclaration && n.name?.kind === ts.SyntaxKind.Identifier && n.name.escapedText === name) {
            found = n;
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (source, visit);
    return found;
}

// is the checker's type of this expression the ccxt Exchange class (or a subclass /
// union of those)? Used for `<exchangeVar>.<helper>(...)`: the generated TESTS hold the
// exchange in a local or parameter instead of `this` (`exchange.safeString (...)`,
// `exchange.milliseconds ()`, ...), and the C# for that receiver IS an exchange object:
// a `const exchange = new ccxt.Exchange (...)` local prints `var exchange = new
// ccxt.Exchange (...)` (static type ccxt.Exchange), and the test driver's post-print
// regexes name the `exchange` parameters `Exchange exchange` / `BaseExchange exchange`.
// A receiver that only the TS checker can prove (an `any` receiver, a non-exchange
// class, an unresolved import) keeps the local `object`.
function receiverIsExchange (csharp, node) {
    if (typeof csharp.getChecker !== 'function') {
        return false;
    }
    let type;
    try {
        type = csharp.getChecker ().getTypeAtLocation (node);
    } catch (e) {
        return false;
    }
    return typeIsExchange (type, []);
}

function typeIsExchange (type, seen) {
    if (type === undefined || seen.includes (type)) {
        return false;
    }
    seen = seen.concat ([ type ]);
    const flags = type.flags;
    if (flags & ts.TypeFlags.Any) {
        return false;
    }
    if ((flags & ts.TypeFlags.Union) !== 0 && Array.isArray (type.types)) {
        const members = type.types.filter ((member) => !(member.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
        return members.length > 0 && members.every ((member) => typeIsExchange (member, seen));
    }
    const symbol = type.symbol ?? type.aliasSymbol;
    if (symbol === undefined) {
        return false;
    }
    if (classDeclarationIsExchange (symbol)) {
        return true;
    }
    // a venue class: walk to its base
    const bases = (typeof type.getBaseTypes === 'function') ? (type.getBaseTypes () ?? []) : [];
    return bases.some ((base) => typeIsExchange (base, seen));
}

// the class declaration behind a type symbol is the ccxt Exchange class: declared as
// `class Exchange` in ts/src/base/Exchange.ts. The exported symbol name is not usable
// (`ccxt.js` re-exports the class as `default`, so the instance type's symbol is named
// `default`), the declaration name is.
function classDeclarationIsExchange (symbol) {
    for (const declaration of (symbol?.declarations ?? [])) {
        const name = declaration?.name?.escapedText;
        if (name !== 'Exchange') {
            continue;
        }
        const fileName = declaration?.getSourceFile?.()?.fileName ?? '';
        if (fileName === '' || /[\\/]Exchange\.ts$/.test (fileName)) {
            return true;
        }
    }
    return false;
}

// `client.futures[key]` (printed `getValue(client.futures, key)`) and
// `this.safeValue (client.futures, key)` (printed with the ws regex's
// `(client as WebSocketClient)` receiver cast). The hand-written WebSocketClient declares
// `IDictionary<string, Future> futures` and the only writers store `new Future()` values
// (Client.future / reusableFuture GetOrAdd, rejectFutures clears), so the read boxes a
// Future or null — the `(Future)` cast back is exact. No site passes a safeValue default.
function futuresReadCastType (initializer) {
    const futuresProperty = (n) => n?.kind === ts.SyntaxKind.PropertyAccessExpression
        && n.name?.escapedText === 'futures'
        && n.expression?.kind === ts.SyntaxKind.Identifier
        && n.expression.escapedText === 'client';
    if (initializer?.kind === ts.SyntaxKind.ElementAccessExpression && futuresProperty (initializer.expression)) {
        return 'Future';
    }
    if (initializer?.kind === ts.SyntaxKind.CallExpression) {
        const callee = initializer.expression;
        if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return undefined;
        }
        if (callee.name?.escapedText !== 'safeValue' || initializer.arguments?.length !== 2) {
            return undefined;
        }
        if (futuresProperty (initializer.arguments[0])) {
            return 'Future';
        }
    }
    return undefined;
}

// `this.safeValue (cache.hashmap, key[, {}])` — the `\w+\.hashmap` text rewrite prints
// `(cache as ArrayCache).hashmap`. That map holds only `new Dictionary<string, object>()`
// buckets (cs/ccxt/ws/ArrayCache.cs writers) or nothing, so the cast back is exact.
function arrayCacheHashmapReadType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression
        || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword
        || callee.name?.escapedText !== 'safeValue'
        || (initializer.arguments?.length ?? 0) < 2) {
        return undefined;
    }
    const map = initializer.arguments[0];
    if (map?.kind !== ts.SyntaxKind.PropertyAccessExpression
        || map.name?.escapedText !== 'hashmap'
        || map.expression?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const defaultValue = initializer.arguments[2];
    if (defaultValue !== undefined && defaultValue.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
        return undefined; // any other default could box a non-dictionary
    }
    return 'Dictionary<string, object>';
}

// ===== ws member-cache element reads + the `methods` handler tables =====
//
// `object stored = this.safeValue (this.trades, symbol)` — the per-key READ of a ws cache
// member. The hand-written safeValue hands back the map's `object` box, so the declaration
// can only name the box behind a cast, and the box is whatever EVERY writer of that member
// in the SAME FILE stores: each exchange class owns its own cache field, so the file is the
// whole writer set. The census walks the TS file once per member:
//   - every `this.<member>[k] = rhs` must store an ArrayCache-family constructor, a dict
//     literal / dict helper, a read-back of the same map (no new box), or a local whose
//     every assignment proves one of those; a nested `this.<member>[k][k2] = …` proves the
//     value at k is a dictionary (that is how the printer spells the write);
//   - every `this.<member> = rhs` (the map itself) must stay dictionary-shaped: a member
//     that is the cache itself (lighter's `this.liquidations = new ArrayCache (…)`) or that
//     is replaced by one disqualifies the member.
// A file whose element writers agree boxes ArrayCaches / dictionaries, and the read names
// that box behind an exact cast: `ccxt.pro.ArrayCache` (the declared spelling of the
// hand-written cache fields, so `ArrayCache` / `ArrayCacheBy*` constructors and read-backs
// assign into it unchanged) or `IDictionary<string, object>`. Disagreement inside the file
// leaves the member unproven — the read keeps `object`. Defaulted reads
// (`this.safeValue (this.trades, sym, {})`) are the dict/list-default families' sites and
// are left alone here (2 arguments only).
const CSHARP_LOCAL_WS_CACHE_MEMBERS = [
    'trades', 'ohlcvs', 'positions', 'liquidations', 'myLiquidations',
    'orders', 'myTrades', 'triggerOrders',
];

function thisMemberAccess (node, member) {
    return node?.kind === ts.SyntaxKind.PropertyAccessExpression
        && node.expression?.kind === ts.SyntaxKind.ThisKeyword
        && node.name?.escapedText === member;
}

function thisMemberElementAccess (node, member) {
    return node?.kind === ts.SyntaxKind.ElementAccessExpression && thisMemberAccess (node.expression, member);
}

// a read of the SAME map (`this.<member>[k]`, `this.safeValue (this.<member>, k)`,
// `getValue (this.<member>, k)`) stores a value whose box is whatever the map holds — it
// adds no information about the element box either way
function wsCacheMapRead (node, member) {
    if (thisMemberElementAccess (node, member)) {
        return true;
    }
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return false;
    }
    const name = callee.name?.escapedText;
    if (name !== 'safeValue' && name !== 'getValue' && name !== 'safeDict') {
        return false;
    }
    return thisMemberAccess (node.arguments?.[0], member);
}

const WS_CACHE_DICT_BOX = 'IDictionary<string, object>';

// the ArrayCache constructors a ws cache map can hold, split by the class they derive from
// (cs/ccxt/ws/ArrayCache.cs): ArrayCacheBySymbolById / BySymbolBySide / ByOutcomeById are
// ArrayCache subclasses, ArrayCacheByTimestamp is a SIBLING (BaseCache) — a member whose
// values mix the two can therefore only be named BaseCache, the family's common base.
const ARRAY_CACHE_ARRAY_FAMILY_CTORS = [ 'ArrayCache', 'ArrayCacheBySymbolById', 'ArrayCacheBySymbolBySide', 'ArrayCacheByOutcomeById' ];
const ARRAY_CACHE_ALL_CTORS = ARRAY_CACHE_ARRAY_FAMILY_CTORS.concat ([ 'ArrayCacheByTimestamp' ]);

function bareCsharpType (type) {
    return type.startsWith ('ccxt.pro.') ? type.slice ('ccxt.pro.'.length) : type;
}

// the declared type for a set of constructor names the census proved, or undefined when the
// set mixes a dictionary with an ArrayCache
function wsCacheCtorSetType (ctors) {
    const names = [ ...ctors ];
    if (names.every ((name) => ARRAY_CACHE_ARRAY_FAMILY_CTORS.includes (name))) {
        return 'ccxt.pro.ArrayCache';
    }
    if (names.length === 1 && ARRAY_CACHE_ALL_CTORS.includes (names[0])) {
        return 'ccxt.pro.' + names[0];
    }
    if (names.every ((name) => ARRAY_CACHE_ALL_CTORS.includes (name))) {
        return 'ccxt.pro.BaseCache';
    }
    return undefined;
}

// the join edges for a cache-element read: every constructor the census can see writes the
// same cache, so a later cache-setup write (`x = new ArrayCache (limit)`) joins the
// declaration's own type (equal names join without an edge; the bare spelling is the same
// class in a `namespace ccxt.pro` / prediction file)
function cacheElementWideningEdges (target) {
    return ARRAY_CACHE_ALL_CTORS.flatMap ((ctor) => [ [ ctor, target ], [ 'ccxt.pro.' + ctor, target ] ]);
}

// the boxes a value written into the cache map proves: a set of constructor names / 'dict'
// (empty = no information, e.g. a null write or a read-back of the same map), or undefined
// when the value proves nothing. A same-named local is resolved inside its OWN enclosing
// function, so a `stored` in the trades handler and a `stored` in the ohlcv handler of the
// same file do not pollute each other.
function wsCacheWriteBoxTypes (csharp, node, member, depth) {
    if (node === undefined || depth > 4) {
        return undefined;
    }
    if (node.kind === ts.SyntaxKind.NewExpression) {
        const name = (node.expression?.kind === ts.SyntaxKind.Identifier) ? node.expression.escapedText : undefined;
        if (name === undefined) {
            return undefined;
        }
        if (ARRAY_CACHE_ALL_CTORS.includes (name)) {
            return new Set ([ name ]); // the constructor names its own box (the census joins the set)
        }
        return undefined; // any other constructor boxes something this family cannot name
    }
    if (node.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        return new Set ([ 'dict' ]);
    }
    if (node.kind === ts.SyntaxKind.NullKeyword || (node.kind === ts.SyntaxKind.Identifier && node.escapedText === 'undefined')) {
        return new Set (); // a null write fits every box
    }
    if (wsCacheMapRead (node, member)) {
        return new Set (); // a read-back of the same map adds no information
    }
    if (node.kind === ts.SyntaxKind.CallExpression) {
        const callee = node.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
            const name = callee.name?.escapedText;
            if (name === 'createSafeDictionary' || name === 'safeDict') {
                return new Set ([ 'dict' ]);
            }
        }
        return undefined;
    }
    if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
        return wsCacheWriteBoxTypes (csharp, node.expression, member, depth);
    }
    if (node.kind === ts.SyntaxKind.AsExpression || node.kind === ts.SyntaxKind.TypeAssertionExpression || node.kind === ts.SyntaxKind.NonNullExpression) {
        return wsCacheWriteBoxTypes (csharp, node.expression, member, depth);
    }
    if (node.kind === ts.SyntaxKind.ConditionalExpression) {
        // `(c) ? undefined : this.safeValue (this.<member>, k)` — both arms must fit the box
        const whenTrue = wsCacheWriteBoxTypes (csharp, node.whenTrue, member, depth + 1);
        const whenFalse = wsCacheWriteBoxTypes (csharp, node.whenFalse, member, depth + 1);
        if (whenTrue === undefined || whenFalse === undefined) {
            return undefined;
        }
        whenFalse.forEach ((box) => whenTrue.add (box));
        return whenTrue;
    }
    if (node.kind === ts.SyntaxKind.Identifier) {
        // `const x = <box>; … this.<member>[k] = x` — every value assigned to THAT binding in
        // its own function must prove the same shape; a producer this family cannot name
        // (a parameter, a destructured binding, an unclassifiable call) leaves it unproven
        const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (node) : enclosingFunction (node);
        if (scope === undefined) {
            return undefined;
        }
        const index = indexScope (csharp, scope);
        const declarations = index.declarations.get (node.escapedText) ?? [];
        let declaration;
        if (declarations.length === 1 && !index.parameterNames.has (node.escapedText) && !index.blockedNames.has (node.escapedText)) {
            declaration = declarations[0];
        } else {
            const referred = declarations.filter ((candidate) => useRefersToDeclaration (csharp, scope, candidate, node) === true);
            if (referred.length !== 1) {
                return undefined;
            }
            declaration = referred[0];
        }
        const boxes = new Set ();
        let assigned = 0;
        let unproven = false;
        const own = (n) => {
            assigned++;
            const done = wsCacheWriteBoxTypes (csharp, n, member, depth + 1);
            if (done === undefined) {
                unproven = true;
            } else {
                done.forEach ((box) => boxes.add (box));
            }
        };
        const visit = (n) => {
            if (n.kind === ts.SyntaxKind.BinaryExpression && n.operatorToken?.kind === ts.SyntaxKind.EqualsToken
                    && n.left?.kind === ts.SyntaxKind.Identifier && n.left.escapedText === declaration.name.escapedText
                    && useRefersToDeclaration (csharp, scope, declaration, n.left) !== false) {
                own (n.right); // a write to this very binding (an ambiguous use counts: conservative)
            } else if (n === declaration) {
                if (n.initializer === undefined) {
                    assigned++;
                } else {
                    own (n.initializer);
                }
            }
            ts.forEachChild (n, visit);
        };
        ts.forEachChild (scope, visit);
        if (unproven || assigned === 0) {
            return (unproven) ? undefined : new Set ();
        }
        return boxes;
    }
    return undefined;
}

const wsCacheMemberElementBoxes = new WeakMap ();

// the proven box of `this.<member>[k]` in this file, cached per (printer instance, file, member)
function wsCacheMemberElementBox (csharp, sourceFile, member) {
    if (sourceFile === undefined) {
        return undefined;
    }
    let byFile = wsCacheMemberElementBoxes.get (csharp);
    if (byFile === undefined) {
        byFile = new WeakMap ();
        wsCacheMemberElementBoxes.set (csharp, byFile);
    }
    let table = byFile.get (sourceFile);
    if (table === undefined) {
        table = new Map ();
        byFile.set (sourceFile, table);
    }
    if (table.has (member)) {
        return table.get (member);
    }
    const box = wsCacheMemberElementBoxUncached (csharp, sourceFile, member);
    table.set (member, box);
    return box;
}

function wsCacheMemberElementBoxUncached (csharp, sourceFile, member) {
    const elementWrites = [];
    const fieldWrites = [];
    let nestedWrite = false;
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.BinaryExpression && n.operatorToken?.kind === ts.SyntaxKind.EqualsToken) {
            const left = n.left;
            if (thisMemberElementAccess (left, member)) {
                elementWrites.push (n.right);
            } else if (left?.kind === ts.SyntaxKind.ElementAccessExpression && thisMemberElementAccess (left.expression, member)) {
                nestedWrite = true; // `this.<member>[k][k2] = …` — the value at k is indexable
            } else if (thisMemberAccess (left, member)) {
                fieldWrites.push (n.right);
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (sourceFile, visit);
    if (elementWrites.length === 0) {
        return undefined; // nothing in the file proves the element box
    }
    const boxes = new Set ();
    for (const rhs of elementWrites) {
        const own = wsCacheWriteBoxTypes (csharp, rhs, member, 0);
        if (own === undefined) {
            return undefined; // an unprovable writer: the whole member stays object
        }
        own.forEach ((box) => boxes.add (box));
    }
    if (nestedWrite) {
        boxes.add ('dict');
    }
    // the map itself is only ever replaced by another dictionary (the cache-setup resets)
    for (const rhs of fieldWrites) {
        const own = wsCacheWriteBoxTypes (csharp, rhs, member, 0);
        if (own === undefined || (own.size > 0 && (own.size !== 1 || !own.has ('dict')))) {
            return undefined;
        }
    }
    if (boxes.size === 0) {
        return undefined;
    }
    if (boxes.has ('dict')) {
        return (boxes.size === 1) ? WS_CACHE_DICT_BOX : undefined;
    }
    return wsCacheCtorSetType (boxes);
}

// `object <name> = this.safeValue (this.<member>, <key>)` (no default) -> the file's box
function wsCacheMemberReadType (csharp, initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    if (callee.name?.escapedText !== 'safeValue' || initializer.arguments?.length !== 2) {
        return undefined;
    }
    const receiver = initializer.arguments[0];
    if (receiver?.kind !== ts.SyntaxKind.PropertyAccessExpression || receiver.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const member = receiver.name?.escapedText;
    if (!CSHARP_LOCAL_WS_CACHE_MEMBERS.includes (member)) {
        return undefined;
    }
    return wsCacheMemberElementBox (csharp, initializer.getSourceFile?.(), member);
}

// `object method = this.safeValue (methods, key)` — the handler TABLE of a ws `handleMessage`
// (`const methods = { 'channel': this.handleChannel, … }`). Every entry value is a
// same-file method reference, and C# 10 gives each method group its natural delegate type,
// so the box the dictionary holds is a Delegate (or null for a key the table has no entry
// for); the read names it behind the exact `(Delegate)` cast and the printed
// `DynamicInvoker.InvokeMethod (method, …)` (the `.call` rewrite) keeps taking `object`.
const CSHARP_LOCAL_HANDLER_TABLE_NAMES = [ 'methods', 'handlers' ];

function handlerTableReadType (csharp, initializer, context) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    if (callee.name?.escapedText !== 'safeValue' || initializer.arguments?.length !== 2) {
        return undefined;
    }
    const table = initializer.arguments[0];
    if (table?.kind !== ts.SyntaxKind.Identifier || !CSHARP_LOCAL_HANDLER_TABLE_NAMES.includes (table.escapedText)) {
        return undefined;
    }
    if (context?.scope === undefined) {
        return undefined;
    }
    const tableName = table.escapedText;
    const index = indexScope (csharp, context.scope);
    const declarations = index.declarations.get (tableName);
    if (!declarations || declarations.length === 0 || index.parameterNames.has (tableName) || index.blockedNames.has (tableName)) {
        return undefined;
    }
    // the read must provably bind to one of them (a file with several handler tables — one
    // per `handleMessage` shape — resolves through the same scope-aware verdict the scan uses)
    let declaration;
    if (declarations.length === 1) {
        declaration = declarations[0];
    } else {
        const referred = declarations.filter ((candidate) => useRefersToDeclaration (csharp, context.scope, candidate, table) === true);
        if (referred.length !== 1) {
            return undefined;
        }
        declaration = referred[0];
    }
    const literal = declaration.initializer;
    if (literal?.kind !== ts.SyntaxKind.ObjectLiteralExpression || declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    // every table entry must be a `this.<name>` reference to a method declared in this file:
    // the method group's natural delegate type is the box, any other value would not be one
    const sourceFile = initializer.getSourceFile?.();
    for (const property of literal.properties) {
        const value = property.initializer;
        if (value?.kind !== ts.SyntaxKind.PropertyAccessExpression || value.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return undefined;
        }
        const name = value.name?.escapedText;
        if (name === undefined || sourceFileMethods (sourceFile, name).length === 0) {
            return undefined;
        }
    }
    return 'Delegate';
}


// Call results whose runtime box is provably the named type on EVERY return path of every
// generated definition, so the printed `object` call can carry an exact cast back (the
// same shape as the element-access string cast below). Keyed on `this.<name>` calls.
// The value is the DECLARATION spelling: `T?` where a return path can hand back null
// (the printer cannot prove non-null, so the nullable spelling keeps every use warning-free
// under the csproj's <Nullable>enable</Nullable>), non-null for the collection boxes.
// The parseWs* family that used to live here moved to the genuine declaration retype
// CSHARP_WS_ROW_BUILDER_RETURNS (S19) — a listed name there no longer needs a cast.
export const CSHARP_LOCAL_CAST_CALL_TYPES = {
    // (this.getMessageHash was the only string entry; S10 retyped its signature to `string?`
    // via CSHARP_STRING_RETURN_METHODS instead, so the call site no longer carries a cast)
};

function callResultCastType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const methodName = callee.name?.escapedText;
    // own-key lookup only: `map['toString']` would hand back Object.prototype.toString
    if (Object.prototype.hasOwnProperty.call (CSHARP_LOCAL_CAST_CALL_TYPES, methodName)) {
        return CSHARP_LOCAL_CAST_CALL_TYPES[methodName];
    }
    return sameFileCallCastType (initializer, methodName);
}

// Box of the hand-written filterByArray family, keyed on the `indexed` argument literal: false
// -> IList<object> (`this.toArray (objects)` / the `results` list), the 3-argument default and
// `true` -> indexBy's Dictionary. Never List<object>: toArray can hand back a non-List IList.
const FILTER_BY_ARRAY_BOX_METHODS = new Set ([
    'filterByArray', 'filterByArrayPositions', 'filterByArrayTickers', 'filterByArrayADLRanks',
]);

function filterByArrayBoxType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    if (!FILTER_BY_ARRAY_BOX_METHODS.has (callee.name?.escapedText)) {
        return undefined;
    }
    const args = initializer.arguments ?? [];
    if (args.length === 3) {
        return 'Dictionary<string, object>'; // `indexed` defaulted to true
    }
    if (args.length !== 4) {
        return undefined;
    }
    if (args[3].kind === ts.SyntaxKind.FalseKeyword) {
        return 'IList<object>';
    }
    if (args[3].kind === ts.SyntaxKind.TrueKeyword) {
        return 'Dictionary<string, object>';
    }
    return undefined;
}

// `this.requestId (...)` in a file whose own definition boxes an Int64: installCsharpNumericReturns
// retypes that definition's C# signature to Int64 (sameFileCallBoxType is the proof), so the
// call's own C# type IS the box and the call-site cast goes. The string-box definitions are
// untouched (their `((string)…)` sites belong to the string-cast family).
function typedRequestIdCall (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword || callee.name?.escapedText !== 'requestId') {
        return false;
    }
    return sameFileCallBoxType (initializer.getSourceFile?.()) === 'Int64';
}

// ===== per-definition callee boxes (requestId) =====
//
// Callees whose generated C# signature is still `object` while every return path of every
// definition in the tree boxes a concrete type. The proof is per DEFINITION, so the
// receiving local carries the exact cast back, the same shape as the getMessageHash family
// above. this.parseOrderBook left this section for the genuine declaration retype
// (CSHARP_COLLECTION_RETURN_METHODS, S19).

// this.requestId (...) -> Int64 or string, proven from the SAME-FILE definition.
// requestId has one definition per venue file (32 in ts/src) and the box differs between
// venues, so a name-keyed table cannot express it. Every `return` of the file's own
// definition must prove the same box under the shapes in requestIdExpressionBoxType; a
// call in a file that does not declare the method (an inherited one) keeps `object`.
export const CSHARP_LOCAL_SAME_FILE_CAST_CALLS = [ 'requestId' ];

const requestIdBoxTables = new WeakMap ();

function sameFileCallCastType (initializer, methodName) {
    if (!CSHARP_LOCAL_SAME_FILE_CAST_CALLS.includes (methodName)) {
        return undefined;
    }
    return sameFileCallBoxType (initializer.getSourceFile?.());
}

// The box type the same-file definition always boxes, or undefined when the file does not
// declare it exactly once (two declarations — two classes in one file — would make the call's
// binding ambiguous, and C# has no return-type overloads) or any return path is unprovable.
// Cached per source file; the same proof retypes the definition's C# signature (below).
function sameFileCallBoxType (sourceFile) {
    if (sourceFile === undefined) {
        return undefined;
    }
    if (requestIdBoxTables.has (sourceFile)) {
        return requestIdBoxTables.get (sourceFile);
    }
    // the file must declare the method exactly once
    let declaration;
    let declarations = 0;
    const visit = (node) => {
        if (node.kind === ts.SyntaxKind.MethodDeclaration && node.name?.escapedText === 'requestId') {
            declarations++;
            declaration = node;
        }
        ts.forEachChild (node, visit);
    };
    visit (sourceFile);
    const box = (declarations === 1) ? requestIdDefinitionBoxType (declaration) : undefined;
    requestIdBoxTables.set (sourceFile, box);
    return box;
}

// the box type every return path of a requestId definition yields, or undefined when any
// path is unprovable or the paths disagree
function requestIdDefinitionBoxType (declaration) {
    if (declaration?.kind !== ts.SyntaxKind.MethodDeclaration || declaration.name?.escapedText !== 'requestId') {
        return undefined;
    }
    const returns = [];
    const collect = (node) => {
        if (node !== declaration && typeof ts.isFunctionLike === 'function' && ts.isFunctionLike (node)) {
            return; // a return inside a nested callback belongs to that callback
        }
        if (node.kind === ts.SyntaxKind.ReturnStatement) {
            returns.push (node);
            return;
        }
        ts.forEachChild (node, collect);
    };
    collect (declaration);
    if (returns.length === 0) {
        return undefined;
    }
    let box;
    for (const statement of returns) {
        const own = requestIdExpressionBoxType (declaration, statement.expression, 0);
        if (own === undefined) {
            return undefined; // an unprovable path: the whole definition stays unproven
        }
        if (box === undefined) {
            box = own;
        } else if (box !== own) {
            return undefined; // two boxes on different paths: names nothing
        }
    }
    return box;
}

// The C# box of one return expression of a requestId definition. Audited over every one of
// the 32 definitions in the tree; every accepted shape is a value the printer boxes on the
// spot, so the call-site cast can only ever see a box of the named type (a null box is
// unboxed to null by a reference cast, and never produced by the 'Int64' shape).
function requestIdExpressionBoxType (method, expression, depth) {
    if (expression === undefined || depth > 4) {
        return undefined;
    }
    switch (expression.kind) {
    case ts.SyntaxKind.ParenthesizedExpression:
        return requestIdExpressionBoxType (method, expression.expression, depth);
    case ts.SyntaxKind.AsExpression:
    case ts.SyntaxKind.TypeAssertionExpression:
        // `<x> as string` prints `((string)x)`: a string box, or null in, null out
        return (expression.type?.kind === ts.SyntaxKind.StringKeyword) ? 'string' : undefined;
    case ts.SyntaxKind.BinaryExpression: {
        // `a + b` prints add(a, b); two proven string boxes concatenate to a string (a null
        // box cannot occur: both operands are proven strings before the add runs)
        if (expression.operatorToken?.kind !== ts.SyntaxKind.PlusToken) {
            return undefined;
        }
        const left = requestIdExpressionBoxType (method, expression.left, depth + 1);
        const right = requestIdExpressionBoxType (method, expression.right, depth + 1);
        return (left === 'string' && right === 'string') ? 'string' : undefined;
    }
    case ts.SyntaxKind.CallExpression: {
        const callee = expression.expression;
        if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
            return undefined;
        }
        const name = callee.name?.escapedText;
        if (callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
            // hand-written helpers with a proven non-null string box: uuid/uuid16/uuid22
            // (Exchange.String.cs) and numberToString (`string`, Exchange.Number.cs)
            if (name === 'uuid' || name === 'uuid16' || name === 'uuid22' || name === 'numberToString') {
                return 'string';
            }
            return (name === 'sum' && requestIdSumBoxesInt64 (method, expression, depth)) ? 'Int64' : undefined;
        }
        // `<x>.toString ()` prints `((object)x).ToString()`: a non-null string (a null box
        // throws there exactly as it does today)
        return (name === 'toString' && (expression.arguments?.length ?? 0) === 0) ? 'string' : undefined;
    }
    case ts.SyntaxKind.Identifier: {
        const initializer = requestIdLocalInitializer (method, expression.escapedText);
        return (initializer === undefined) ? undefined : requestIdExpressionBoxType (method, initializer, depth + 1);
    }
    }
    return undefined;
}

// `this.sum (<intBox>, <integer literal>)`: Exchange.Generic.cs#sum converts each operand
// with Convert.ToDouble and returns Convert.ToInt64 when IsInteger (Convert.ToDecimal ==
// Floor) — always true for an Int64-or-null and an integer literal — so the box is an
// Int64 on every path and never null.
function requestIdSumBoxesInt64 (method, expression, depth) {
    const args = expression.arguments ?? [];
    return args.length === 2 && requestIdIntBoxOperand (method, args[0], depth + 1) && requestIdIntegerLiteral (args[1]);
}

function requestIdIntBoxOperand (method, expression, depth) {
    if (expression === undefined || depth > 4) {
        return false;
    }
    if (expression.kind === ts.SyntaxKind.ParenthesizedExpression) {
        return requestIdIntBoxOperand (method, expression.expression, depth);
    }
    if (expression.kind === ts.SyntaxKind.CallExpression) {
        const callee = expression.expression;
        // `this.safeInteger (...)` is declared `Int64?` (Exchange.SafeMethods.cs): an Int64
        // box or null, and null enters sum as 0 — integer-valued either way
        return callee?.kind === ts.SyntaxKind.PropertyAccessExpression
            && callee.expression?.kind === ts.SyntaxKind.ThisKeyword
            && callee.name?.escapedText === 'safeInteger';
    }
    if (expression.kind === ts.SyntaxKind.Identifier) {
        const initializer = requestIdLocalInitializer (method, expression.escapedText);
        return initializer !== undefined && requestIdIntBoxOperand (method, initializer, depth + 1);
    }
    return false;
}

function requestIdIntegerLiteral (expression) {
    return expression?.kind === ts.SyntaxKind.NumericLiteral && /^\d+$/.test (expression.text);
}

// the initializer of the ONE declaration of <name> in the method body, or undefined when
// the name is declared twice or carries any other write (a plain `x = ...` makes the
// provenance unprovable here)
function requestIdLocalInitializer (method, name) {
    let initializer;
    let conflict = false;
    const visit = (node) => {
        if (node !== method && typeof ts.isFunctionLike === 'function' && ts.isFunctionLike (node)) {
            return;
        }
        if (node.kind === ts.SyntaxKind.VariableDeclaration && node.name?.kind === ts.SyntaxKind.Identifier && node.name.escapedText === name) {
            if (initializer !== undefined) {
                conflict = true;
            } else {
                initializer = node.initializer;
            }
        }
        if (node.kind === ts.SyntaxKind.BinaryExpression
            && node.operatorToken?.kind === ts.SyntaxKind.EqualsToken
            && node.left?.kind === ts.SyntaxKind.Identifier
            && node.left.escapedText === name) {
            conflict = true;
        }
        ts.forEachChild (node, visit);
    };
    visit (method);
    return (conflict || initializer === undefined) ? undefined : initializer;
}

// ===== per-definition numeric boxes (U37) =====
//
// Venue-local numeric helpers whose same-file definition proves one box while a sibling
// venue's declaration of the same name boxes something else, so a name-keyed table cannot
// express them. The same proof retypes the definition's signature (csharpMethodReturnType)
// and answers the call sites in the declaring file (callReturnType) — no cast on either side.
//   convertFromRawQuantity — bitmex's 4 return paths are all this.parseNumber (...)
//     (Exchange.cs `double?`); pro/bitrue's own declaration returns its rawQuantity param and
//     `rawQuantity * contractSize` and stays `object`.
export const CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS = {
    'convertFromRawQuantity': 'double?',
};

// every `return` of the declaration (nested callbacks excluded) must prove, and at least one
// must exist: the box has to be produced by a value the printer hands back
function sameFileMethodReturnsProve (csharp, declaration, proves) {
    let proved = true;
    let returns = 0;
    const visit = (node) => {
        if (!proved || (node !== declaration && ts.isFunctionLike (node))) {
            return;
        }
        if (node.kind === ts.SyntaxKind.ReturnStatement) {
            returns++;
            if (node.expression === undefined || !proves (node.expression)) {
                proved = false;
            }
            return;
        }
        ts.forEachChild (node, visit);
    };
    ts.forEachChild (declaration, visit);
    return proved && returns > 0;
}

// the C# box of one return expression of a numeric definition: null / undefined / a numeric
// literal (an implicit numeric conversion, never a hard unbox), a call to a hand-written
// helper whose own C# signature is `double?`, or an expression the classifier already names
function numericReturnExpressionProves (csharp, expression, mapped) {
    const node = unwrapPassthroughExpression (expression);
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
        return true; // the nullable spelling keeps a null path nameable
    }
    if (node.kind === ts.SyntaxKind.Identifier && node.escapedText === 'undefined') {
        return true;
    }
    if (node.kind === ts.SyntaxKind.NumericLiteral) {
        return true;
    }
    if (node.kind === ts.SyntaxKind.CallExpression) {
        const callee = node.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
            const name = callee.name?.escapedText;
            if (name === 'parseNumber' || name === 'safeNumber' || name === 'safeFloat') {
                return true;
            }
        }
    }
    return typeof csharp.csharpTypeOfInitializer === 'function' && csharp.csharpTypeOfInitializer (node) === mapped;
}

const sameFileNumericTypes = new WeakMap ();
const sameFileNumericProofsInProgress = new Set ();

function sameFileNumericDeclarationType (csharp, declaration, mapped) {
    if (declaration?.kind !== ts.SyntaxKind.MethodDeclaration || declaration.name === undefined) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (declaration)) {
        return undefined;
    }
    const cached = sameFileNumericTypes.get (declaration);
    if (cached !== undefined) {
        return (cached === false) ? undefined : cached;
    }
    if (sameFileNumericProofsInProgress.has (declaration)) {
        return undefined; // a proof chain that reaches its own declaration
    }
    sameFileNumericProofsInProgress.add (declaration);
    try {
        const proof = sameFileMethodReturnsProve (csharp, declaration, (expression) => numericReturnExpressionProves (csharp, expression, mapped)) ? mapped : false;
        sameFileNumericTypes.set (declaration, proof);
        return (proof === false) ? undefined : proof;
    } finally {
        sameFileNumericProofsInProgress.delete (declaration);
    }
}

// the mapped type of a `this.<name>(...)` call whose same-file declaration proves it, or
// undefined (an inherited call in a file that does not declare the method keeps `object`)
function sameFileNumericReturnType (csharp, call, name) {
    const mapped = CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS[name];
    if (mapped === undefined) {
        return undefined;
    }
    const declaration = boundCollectionDeclaration (csharp, call, name);
    return (declaration?.name?.escapedText === name) ? sameFileNumericDeclarationType (csharp, declaration, mapped) : undefined;
}

// ===== this.safeValue (recv, 'key') with a same-file dict / list twin =====
//
// `const x = this.safeValue (response, 'data')` boxes whatever the wire sent: the call is
// `object` by contract (Exchange.SafeMethods.cs), so the printer can name nothing by itself.
// The declaration can name the box when the SAME FILE proves the key's shape:
//
//   - another mention of the same (receiver identifier, literal key) pair is extracted with
//     this.safeDict* / this.safeList* — the exchange's own claim that this key holds a dict
//     (a list) — and
//   - the pair carries NO mention of the other shape anywhere in the same file: no twin of
//     the other kind and no `{}` / `[]` literal default of the other kind. A pair with both
//     (bitget's response['data'] is a dict on the ticker endpoints and a list on the
//     candlestick ones) names nothing and every one of its sites keeps `object`; a site whose
//     own default literal is the other shape is the same reject, so no site can disagree with
//     the pair verdict, and
//   - no use of the local treats it as the other shape: a dict candidate iterated (for-of /
//     for-in), read with `.length` / a list-only member or a numeric element read; a list
//     candidate read with a string key or handed to a keyed safe* helper. The compile-level
//     half of this is already csharpLocalIsSafeToRetype's job; this is the runtime half the
//     compiler cannot see (`foreach (var v in dict)` over an IDictionary compiles and walks
//     KeyValuePairs).
//
// The box is the value the JSON decoder produced: Dictionary<string, object> for a JSON
// object and List<object> for a JSON array (Exchange.cs#callAsync -> NarrowResponse; the
// implicit-API wrappers hand that same box out as Task<Dictionary<string, object>>), and a
// null value stays null through the reference cast — exactly the boxes the safeDict* /
// safeList* declarations already name (retypeSafeCollectionHelpers). The declaration takes
// the exact cast back, the spelling the printer cannot print by itself:
// `IDictionary<string, object> data = ((IDictionary<string, object>)this.safeValue (response, "data"));`
//
// Only an IDENTIFIER receiver qualifies: a `this.<member>` receiver is module state whose
// shape a caller's option override can change, so its pair is never evidence (census: 12
// sites, all this.options reads, left `object`).
//
// Census (ts/src, 1084 safeValue declaration sites): 973 pairs carry no twin or both shapes,
// 18 sites are dropped by the use-shape veto — 93 sites name their box.
const SAFE_VALUE_TWIN_PAIR_CACHE = new WeakMap ();

const SAFE_VALUE_TWIN_DICT_CALLS = [ 'safeDict', 'safeDict2', 'safeDictN' ];
const SAFE_VALUE_TWIN_LIST_CALLS = [ 'safeList', 'safeList2', 'safeListN' ];

// the member names only a list has (x.push / x.length / x.map print list operations)
const SAFE_VALUE_TWIN_LIST_MEMBERS = [ 'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice',
    'concat', 'slice', 'join', 'indexOf', 'lastIndexOf', 'includes', 'forEach', 'map', 'filter', 'every',
    'some', 'reduce', 'find', 'findIndex', 'fill', 'length' ];
// keyed reads that only make sense on a dict (this.safeString (x, 'k') / this.safeDict (x, 'k'))
const SAFE_VALUE_TWIN_KEYED_HELPERS = [ 'safeString', 'safeString2', 'safeStringN', 'safeStringLower',
    'safeStringLower2', 'safeStringLowerN', 'safeStringUpper', 'safeStringUpper2', 'safeStringUpperN',
    'safeInteger', 'safeInteger2', 'safeIntegerN', 'safeNumber', 'safeNumber2', 'safeNumberN', 'safeBool',
    'safeBool2', 'safeBoolN', 'safeDict', 'safeDict2', 'safeDictN', 'safeList', 'safeList2', 'safeListN',
    'safeTimestamp', 'safeTimestamp2', 'safeTimestampN', 'safeMarket', 'safeCurrency', 'safeSymbol',
    'safeCurrencyCode', 'safeValue', 'safeValue2', 'safeValueN' ];

// `this.<safe*> (<identifier>, '<key>' [, default])` — the only call shape a pair is proven
// from, and the only shape the declaration family fires on
function safeValueTwinCallParts (node) {
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const args = node.arguments;
    if (args.length < 2 || args.length > 3) {
        return undefined;
    }
    const receiver = args[0];
    const key = args[1];
    if (receiver?.kind !== ts.SyntaxKind.Identifier || key?.kind !== ts.SyntaxKind.StringLiteral) {
        return undefined;
    }
    return { method: callee.name?.escapedText, receiver: receiver.escapedText, key: key.text, default: args[2] };
}

// the shape a safeValue default argument declares: `{}` a dict, `[]` a list, anything else
// (including none) carries no shape evidence
function safeValueTwinDefaultShape (node) {
    if (node === undefined) {
        return 'none';
    }
    if (node.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        return 'dict';
    }
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        return 'list';
    }
    return 'other';
}

// every (receiver identifier, literal key) pair of one source file, with the shape evidence
// that file carries for it
function safeValueTwinPairs (sourceFile) {
    if (SAFE_VALUE_TWIN_PAIR_CACHE.has (sourceFile)) {
        return SAFE_VALUE_TWIN_PAIR_CACHE.get (sourceFile);
    }
    const pairs = new Map ();
    const bump = (parts, field) => {
        const key = parts.receiver + ' :: ' + parts.key;
        let evidence = pairs.get (key);
        if (evidence === undefined) {
            evidence = { dictTwin: 0, listTwin: 0, dictDefault: 0, listDefault: 0 };
            pairs.set (key, evidence);
        }
        evidence[field] += 1;
    };
    const visit = (node) => {
        const parts = safeValueTwinCallParts (node);
        if (parts !== undefined) {
            if (SAFE_VALUE_TWIN_DICT_CALLS.includes (parts.method)) {
                bump (parts, 'dictTwin');
            } else if (SAFE_VALUE_TWIN_LIST_CALLS.includes (parts.method)) {
                bump (parts, 'listTwin');
            } else if (parts.method === 'safeValue') {
                const shape = safeValueTwinDefaultShape (parts.default);
                if (shape === 'dict') {
                    bump (parts, 'dictDefault');
                } else if (shape === 'list') {
                    bump (parts, 'listDefault');
                }
            }
        }
        ts.forEachChild (node, visit);
    };
    visit (sourceFile);
    SAFE_VALUE_TWIN_PAIR_CACHE.set (sourceFile, pairs);
    return pairs;
}

// the proven box of a `this.safeValue (recv, 'key')` initializer, or undefined. Every site of
// a pair shares this verdict, and the `listDefault` / `dictDefault` counts make a site's own
// contradictory default literal reject every site of that pair.
function safeValueTwinCastType (initializer) {
    const parts = safeValueTwinCallParts (initializer);
    if (parts === undefined || parts.method !== 'safeValue') {
        return undefined;
    }
    const sourceFile = initializer.getSourceFile?.();
    if (sourceFile === undefined) {
        return undefined;
    }
    const evidence = safeValueTwinPairs (sourceFile).get (parts.receiver + ' :: ' + parts.key);
    if (evidence === undefined) {
        return undefined;
    }
    if (evidence.dictTwin > 0 && evidence.listTwin === 0 && evidence.listDefault === 0) {
        return { type: 'IDictionary<string, object>', cast: 'IDictionary<string, object>', shape: 'dict' };
    }
    if (evidence.listTwin > 0 && evidence.dictTwin === 0 && evidence.dictDefault === 0) {
        return { type: 'List<object>', cast: 'List<object>', shape: 'list' };
    }
    return undefined;
}

// `this.<m> (x, ...)` where the first argument is a LIST of rows: a dict candidate handed
// to one of these contradicts the proof. (parseWsTrade / parseBalance / parseOHLCV / parseOrder
// are deliberately absent: their first argument is a row — a dict on most venues.)
const SAFE_VALUE_TWIN_LIST_CONSUMERS = [ 'parseWsTrades', 'parseTrades', 'parseOrders', 'parseMarkets',
    'parseOHLCVs', 'parseTransactions', 'parseLedgerEntries', 'parsePositions', 'parseTickers',
    'parseFundingRates', 'parseOpenInterests', 'parseIncomes', 'parseTransfers', 'parseDepositsWithdrawals',
    'parseBidsAsks', 'filterBy', 'filterBySymbol', 'filterBySinceLimit', 'filterBySymbolSinceLimit',
    'sortBy', 'sortBy2', 'indexBy', 'groupBy', 'arrayConcat', 'aggregate' ];

// does `use` treat the value as a list? (a dict candidate may not have one of these)
function safeValueTwinListUse (use) {
    const parent = use.parent;
    if (parent === undefined) {
        return false;
    }
    if ((parent.kind === ts.SyntaxKind.ForOfStatement || parent.kind === ts.SyntaxKind.ForInStatement) && parent.expression === use) {
        return true;
    }
    if (parent.kind === ts.SyntaxKind.SpreadElement || parent.kind === ts.SyntaxKind.SpreadAssignment) {
        return true;
    }
    if (parent.kind === ts.SyntaxKind.PropertyAccessExpression && parent.expression === use
        && SAFE_VALUE_TWIN_LIST_MEMBERS.includes (parent.name?.escapedText)) {
        return true;
    }
    if (parent.kind === ts.SyntaxKind.ElementAccessExpression && parent.expression === use
        && parent.argumentExpression?.kind !== ts.SyntaxKind.StringLiteral) {
        return true;
    }
    if (parent.kind === ts.SyntaxKind.CallExpression && parent.arguments.includes (use)) {
        const callee = parent.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.ThisKeyword
            && SAFE_VALUE_TWIN_LIST_CONSUMERS.includes (callee.name?.escapedText)) {
            return true;
        }
    }
    return false;
}

// the local a `const y = x;` copy binds, so y's uses can be read as x's (a copy does not
// hide a list-shaped read: apex pro iterates `message['data']` only through `trades`)
function safeValueTwinCopyName (use) {
    const parent = use.parent;
    if (parent?.kind !== ts.SyntaxKind.VariableDeclaration || parent.initializer !== use) {
        return undefined;
    }
    return (parent.name?.kind === ts.SyntaxKind.Identifier) ? parent.name.escapedText : undefined;
}

// does `use` treat the value as a dict? (a list candidate may not have one of these)
function safeValueTwinDictUse (use) {
    const parent = use.parent;
    if (parent === undefined) {
        return false;
    }
    if (parent.kind === ts.SyntaxKind.ElementAccessExpression && parent.expression === use
        && parent.argumentExpression?.kind === ts.SyntaxKind.StringLiteral) {
        return true;
    }
    if (parent.kind !== ts.SyntaxKind.CallExpression || parent.arguments[0] !== use) {
        return false;
    }
    const callee = parent.expression;
    const name = callee?.name?.escapedText;
    // this.safeString (x, 'k') / this.safeValue (x, 'k') / this.safeDict (x, 'k') — a keyed read
    if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.ThisKeyword
        && parent.arguments[1]?.kind === ts.SyntaxKind.StringLiteral
        && SAFE_VALUE_TWIN_KEYED_HELPERS.includes (name)) {
        return true;
    }
    // Object.keys (x) / Object.values (x) / Object.entries (x)
    if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.Identifier
        && callee.expression.escapedText === 'Object' && [ 'keys', 'values', 'entries' ].includes (name)) {
        return true;
    }
    // bare getValue (x, k) / isDictionary (x)
    return callee?.kind === ts.SyntaxKind.Identifier && [ 'getValue', 'isDictionary' ].includes (callee.escapedText);
}

// every use of the local must be consistent with the proven shape — the runtime half of the
// proof, scope-resolved exactly like the retype scan's. A `const y = x;` copy is followed:
// y holds the same box, so a list-shaped read of y contradicts a proven dict too.
function safeValueTwinUsesAreConsistent (csharp, scope, declaration, shape) {
    const index = indexScope (csharp, scope);
    const seen = new Set ([ declaration.name.escapedText ]);
    const scanName = (name) => {
        for (const use of (index.identifiers.get (name) ?? [])) {
            if (isNotAUse (use)) {
                continue;
            }
            if (name === declaration.name.escapedText && useRefersToDeclaration (csharp, scope, declaration, use) === false) {
                continue;
            }
            if (shape === 'dict' ? safeValueTwinListUse (use) : safeValueTwinDictUse (use)) {
                return false;
            }
            const copy = safeValueTwinCopyName (use);
            if (copy !== undefined && !seen.has (copy)) {
                seen.add (copy);
                if (!scanName (copy)) {
                    return false;
                }
            }
        }
        return true;
    };
    return scanName (declaration.name.escapedText);
}

function callReturnType (csharp, initializer) {
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
    if (target?.kind === ts.SyntaxKind.SuperKeyword) {
        // `super.describe ()` / `super.describeData ()` print `base.describe ()`: the parent
        // class's declaration is generated by the same NAME-keyed collection table (every
        // declaration of the name prints the mapped type), so the C# call's own type is that
        // box and the local needs no cast. Only the collection table is consulted — a super
        // call to any other helper keeps the printer's `object`.
        return Object.prototype.hasOwnProperty.call (CSHARP_COLLECTION_RETURN_METHODS, methodName) ? CSHARP_COLLECTION_RETURN_METHODS[methodName] : undefined;
    }
    if (target?.kind === ts.SyntaxKind.ThisKeyword) {
        if (methodName === 'safeValue') {
            // `this.safeValue (this.orderbooks, symbol[, default])` — same map read, with default
            const read = orderbookMapReadType (initializer);
            if (read !== undefined) {
                return read;
            }
        }
        // a per-declaration request builder: the local's type must equal the return type the
        // declaration being called prints, so both sides read the same return-path proof
        const perDeclaration = CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION[methodName];
        if (perDeclaration !== undefined) {
            return boundCollectionReturnType (csharp, initializer, methodName, perDeclaration);
        }
        // the scalar twin: `this.signMessage (...)` / `this.signHash (...)` in a file whose
        // bound declaration proves `string` — the retyped signature makes the call statically
        // a string, so the local is declared `string` with no cast
        const perDeclarationString = CSHARP_STRING_RETURN_METHODS_BY_DECLARATION[methodName];
        if (perDeclarationString !== undefined) {
            return boundCollectionReturnType (csharp, initializer, methodName, perDeclarationString);
        }
        // a per-definition numeric helper (U37): same-file proof, no cast (the definition's
        // own signature carries the type — see CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS)
        const sameFileNumeric = sameFileNumericReturnType (csharp, initializer, methodName);
        if (sameFileNumeric !== undefined) {
            return sameFileNumeric;
        }
        // `this.safeIntegerProduct2 (obj, k1, k2, mult)` / `safeIntegerProductN (obj, keys, mult)`:
        // the hand-written ARITY overloads (Exchange.SafeMethods.cs) are exactly Int64? — they
        // forward to the object overload with a null `defaultValue`, its only non-Int64 box. A
        // call that DOES pass a default (5 / 4 arguments) binds the object overload and keeps
        // the caller's box, so only the defaultless arity is named here.
        if (methodName === 'safeIntegerProduct2') {
            return (initializer.arguments?.length === 4) ? 'Int64?' : undefined;
        }
        if (methodName === 'safeIntegerProductN') {
            return (initializer.arguments?.length === 3) ? 'Int64?' : undefined;
        }
        const localType = CSHARP_LOCAL_THIS_RETURN_TYPES[methodName];
        if (localType !== undefined) {
            return localType;
        }
        // a prediction-tier local fed by a venue helper whose DECLARATION this module already
        // retypes (installCsharp*Returns): the call's own C# static type IS the table's box, so
        // the declaration names it with no cast (see predictionRetypedCallType)
        return predictionRetypedCallType (initializer);
    }
    if (target?.kind === ts.SyntaxKind.Identifier) {
        const staticType = CSHARP_LOCAL_STATIC_RETURN_TYPES[target.escapedText + '.' + methodName];
        if (staticType !== undefined) {
            return staticType;
        }
        // `<exchangeVar>.<name>(...)`: the generated TESTS call the base helpers on an
        // exchange held in a local/parameter (see receiverIsExchange). The C# call binds
        // the same BaseExchange method `this.<name>(...)` binds, so the return table
        // applies unchanged. Own-key lookup only (`map['toString']` would hand back
        // Object.prototype.toString).
        // only a helper name chases the checker (one receiver proof per call site)
        if (Object.prototype.hasOwnProperty.call (CSHARP_LOCAL_THIS_RETURN_TYPES, methodName) && receiverIsExchange (csharp, target)) {
            return CSHARP_LOCAL_THIS_RETURN_TYPES[methodName];
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
// provable, an `as string` cast (`((string)x)`), parentheses around any of those, members
// the hand-written base declares with a string type (`this.id`), a plain
// `<receiver>.toString ()` call, a call whose printed C# signature returns `string` /
// `string?` (the module's own return tables), and a read of a local whose own declaration
// this module types `string` / `string?`. Anything whose C# static type may be `object` —
// parameters, `getValue(...)` calls, untyped locals, member reads not listed in
// CSHARP_LOCAL_THIS_MEMBER_TYPES — is NOT provable: add(object, ...) resolves to
// add(object, object), which returns `object` (and null for a null left).
function isProvablyStringOperand (csharp, node) {
    switch (node.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return true;
    case ts.SyntaxKind.ParenthesizedExpression:
        return isProvablyStringOperand (csharp, node.expression);
    case ts.SyntaxKind.AsExpression:
        return node.type?.kind === ts.SyntaxKind.StringKeyword;
    case ts.SyntaxKind.BinaryExpression:
        return node.operatorToken.kind === ts.SyntaxKind.PlusToken && isProvablyStringOperand (csharp, node.left);
    case ts.SyntaxKind.PropertyAccessExpression: {
        if (node.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return false;
        }
        const memberType = CSHARP_LOCAL_THIS_MEMBER_TYPES[node.name?.escapedText];
        return memberType === 'string' || memberType === 'string?';
    }
    case ts.SyntaxKind.Identifier:
        // `add(<local>, ...)`: the read's C# static type IS the declared type of the single
        // binding localIdentifierType() proves, so the enclosing add() resolves to
        // add(string, *) exactly as it does for the arm of a `c ? local : ...`
        return isStringLocalRead (csharp, node);
    case ts.SyntaxKind.CallExpression: {
        // `<receiver>.toString ()` prints `((object)<receiver>).ToString ()` whatever the
        // receiver is (ast-transpiler printToStringCall keys on the method name alone), and
        // the printer's own map declares 'toString' -> string. The call is statically a
        // NON-NULL string: a null receiver throws instead of returning null, exactly as it
        // does as an evaluated add(..) argument today, so the printed expression is a valid
        // left operand of the add(string, *) family. Only .toString() qualifies — the other
        // printer-mapped names (toUpperCase/toLowerCase/trim/replace/slice/...) would need
        // their own proof shape and are intentionally left out here.
        const callee = node.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.name?.escapedText === 'toString') {
            return true;
        }
        // a call the module's own return tables prove is statically `string` / `string?`
        // (`this.<helper>(...)`, `slice(...)`, the bare helpers): that static type is what
        // selects add(string, *) — the local's own declaration cannot move it — and both
        // string overloads are C# concatenations returning a non-null string, so the
        // enclosing chain is a `string` whatever the sibling operands are
        return isStringReturningCall (csharp, node);
    }
    }
    return false;
}

// a read of a local whose own declaration this module emits as `string` / `string?`
// (parameters, destructured names, multi-declarator lists and unproven locals reject)
function isStringLocalRead (csharp, node) {
    const type = localIdentifierType (csharp, node);
    return type === 'string' || type === 'string?';
}

// a call whose printed C# signature is statically `string` / `string?` — the type is read
// from the same tables that declare locals initialised by the call
function isStringReturningCall (csharp, node) {
    const own = callReturnType (csharp, node);
    return own === 'string' || own === 'string?';
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
        // The C# printer casts only `as any` / `as string` / `as any[]`
        // (ast-transpiler csharpTranspiler.printAsExpression): every other assertion
        // (`as List` / `as Dict` / `as Strings` / `as string[]`, interfaces, classes,
        // `as unknown`) prints the BARE operand expression, and a TS assertion has no
        // runtime counterpart. The local's C# value is therefore exactly the printed
        // operand, whose static type this module already proves — naming it moves no
        // box, and csharpLocalIsSafeToRetype re-validates every later read and write.
        if (node.type?.kind === ts.SyntaxKind.AnyKeyword) {
            return undefined; // `((object)x)` — an object box, nothing proven
        }
        if (node.type?.kind === ts.SyntaxKind.ArrayType && node.type.elementType?.kind === ts.SyntaxKind.AnyKeyword) {
            return 'IList<object>'; // `(IList<object>)(x)` — the cast's own static type
        }
        return csharpTypeOfValue (csharp, node.expression, context);
    case ts.SyntaxKind.BinaryExpression: {
        // `a + b` prints `add(a, b)`. With a provably string LEFT operand the compiler
        // picks add(string, string) or add(string, object) — both declared `string`,
        // never null — so the result can be named `string` without changing the call;
        // only the local that receives it is affected (and every later use is re-checked
        // by csharpLocalIsSafeToRetype, which keeps a string local `object` when it lands
        // on the left of a later `+` where the overload would re-resolve)
        if (node.operatorToken.kind === ts.SyntaxKind.PlusToken && isProvablyStringOperand (csharp, node.left)) {
            return 'string';
        }
        // `a + b` with every operand provably numeric selects one of the typed add overloads of
        // the hand-written base (see csharpAddExpressionKind): the declaration names the very
        // box the (object, object) overload's Int64 / double branch hands back, no cast needed
        if (node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            const addKind = csharpAddExpressionKind (csharp, node, context);
            if (addKind !== undefined) {
                return addKind;
            }
        }
        // `a - b` / `a * b` / `a / b` print subtract / multiply / divide(a, b); the result
        // is nameable when both operands' C# static types select a typed overload
        const arithmetic = csharpArithmeticExpressionKind (csharp, node, context);
        if (arithmetic !== undefined) {
            return arithmetic;
        }
        break;
    }
    case ts.SyntaxKind.ConditionalExpression: {
        // `c ? a : b` prints `((bool) isTrue(c)) ? A : B`; typeable when both arms agree
        const whenTrue = conditionalArmType (csharp, node.whenTrue, context);
        const whenFalse = conditionalArmType (csharp, node.whenFalse, context);
        // the Dictionary/IDictionary arm pair has the interface as its natural C# type in every
        // tier: the conditional's own type is the interface, so the declaration names it
        return unifyArms (whenTrue, whenFalse, true);
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
        const own = callReturnType (csharp, node);
        if (own !== undefined) {
            return own;
        }
        break;
    }
    case ts.SyntaxKind.PropertyAccessExpression: {
        // `client.subscriptions` / `.rejections` / `.url` reads of the hand-written
        // WebSocketClient (see CSHARP_CLIENT_MEMBER_TYPES). Every other property access
        // breaks to the printer's own classifier below.
        const memberType = clientMemberReadType (node);
        if (memberType !== undefined) {
            return memberType;
        }
        // `this.symbols` / `this.isSandboxModeEnabled`: the hand-written BaseExchange
        // declaration's own C# type (CSHARP_LOCAL_WS_MEMBER_TYPES)
        if (node.expression?.kind === ts.SyntaxKind.ThisKeyword) {
            const wsMemberType = CSHARP_LOCAL_WS_MEMBER_TYPES[node.name?.escapedText];
            if (wsMemberType !== undefined) {
                return wsMemberType;
            }
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
        // `await this.<name> (...)` resolves through the callee's own Task<T>; a bare
        // `await promiseAll (...)` through the hand-written helper's signature
        return csharpAwaitedThisCallType (csharp, node) ?? bareAwaitedCallType (node);
    }
    if (typeof csharp.csharpTypeOfInitializer === 'function') {
        return csharp.csharpTypeOfInitializer (node);
    }
    return undefined;
}

// `this.<member>` reads usable as a ternary arm. Each entry is the C# declared type of the
// property in the hand-written base (cs/ccxt/base/Exchange.Options.cs), which IS the read's
// static type:
//   hostname / userAgent / privateKey / secret -> `public string ... { get; set; }`, a
//     settable property that can hold null at runtime, so the nullable spelling is the
//     honest one (and keeps the left-operand-of-`+` rule in its conservative regime)
//   ids -> `public List<object> ids { get; set; } = null;`
//   tokenBucket -> `public Dictionary<string, object> tokenBucket { get; set; }` (the hand-written
//     base spells every declared type out; the file-local `dict` alias is expression-position only)
// ARMS ONLY (conditionalArmType): a `this.<member>` read anywhere else — an argument, a copy,
// a later write — keeps `object`, so this table cannot move a declaration outside a ternary.
// Deliberately absent: symbols / orders / myTrades / positions / isSandboxModeEnabled (the ws
// field family), outcomes (declared `object`), clients
// (ConcurrentDictionary<string, WebSocketClient>, no spelling in this module's type set),
// user_agent / userAgents / id (no new site or another unit's table).
const CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES = {
    'hostname': 'string?',
    'userAgent': 'string?',
    'privateKey': 'string?',
    'secret': 'string?',
    'ids': 'List<object>',
    'tokenBucket': 'Dictionary<string, object>',
};

function thisMemberArmType (node) {
    if (node?.kind !== ts.SyntaxKind.PropertyAccessExpression || node.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const name = node.name?.escapedText;
    const known = CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES[name];
    if (known !== undefined) {
        return known;
    }
    // the prediction tier's `string` credential properties (see CSHARP_PREDICTION_STRING_MEMBERS)
    return (isPredictionSource (node) && CSHARP_PREDICTION_STRING_MEMBERS.has (name)) ? 'string?' : undefined;
}

// an arm of `c ? a : b`: the value's own proven type, a base-property read (thisMemberArmType),
// or — for a parenthesised read of a local this module itself declares with a concrete type —
// that local's declared type
function conditionalArmType (csharp, node, context) {
    const direct = csharpTypeOfValue (csharp, node, context);
    if (direct !== undefined) {
        return direct;
    }
    // `this.omitZero (<string box>)` as an arm: the hand-written `string? omitZero (string?)`
    // overload (Exchange.Generic.cs) binds for an argument whose C# static type is a string box,
    // so the call's own C# type IS `string?` — the same proof the whole-initialiser path applies
    // (omitZeroStringProducer), extended to the arm position. The sibling overloads (object /
    // Int64 / double) mean only a proven string argument qualifies; everything else keeps
    // `object` exactly as before.
    if (omitZeroStringProducer (csharp, node, context)) {
        return 'string?';
    }
    let arm = node;
    while (arm?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        arm = arm.expression;
    }
    // the `this.<member>` rule applies to every tier: a read of a base property with a concrete
    // C# declared type has that static type at the arm, prediction tier included
    const memberType = thisMemberArmType (arm);
    if (memberType !== undefined) {
        return memberType;
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
    // the same isolation as declarationCsharpType: another declaration's answer is what the
    // printer emitted for it, never what the self-read override would make of it
    const savedSelfReads = selfReadStack.splice (0, selfReadStack.length);
    try {
        return csharpLocalType (csharp, binding);
    } finally {
        localReadTypesInFlight.delete (binding);
        selfReadStack.push (...savedSelfReads);
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
    // every binding node per name (parameters, identifier variable declarations, catch
    // variables) — the scope-aware classifier below resolves same-name uses against it.
    // bindingScopes is keyed by the AST name (escapedText — the domain uses are scanned
    // in); bindingScopesPrinted by the printed C# name (the domain a type token would
    // collide with: ReservedKeywordsReplacements renames `string` -> `stringVar`).
    const bindingScopes = new Map ();
    const bindingScopesPrinted = new Map ();
    const addBindingScope = (map, key, binding) => {
        let list = map.get (key);
        if (!list) {
            list = [];
            map.set (key, list);
        }
        list.push (binding);
    };
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
            addBindingScope (bindingScopes, n.name.escapedText, n);
            addBindingScope (bindingScopesPrinted, printed, n);
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
                addBindingScope (bindingScopes, n.variableDeclaration.name.escapedText, n);
                addBindingScope (bindingScopesPrinted, csharp.printNode (n.variableDeclaration.name, 0), n);
            }
            markBoundNames (n.variableDeclaration.name);
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    index = { identifiers, bindingNames, bindingCounts, bindings, declarations, parameterNames, blockedNames, bindingScopes, bindingScopesPrinted };
    scopeIndexCache.set (scope, index);
    return index;
}

// ===== scope-aware binding resolution =====
//
// The scans below are otherwise per-method: a same-name binding in a sibling block, in an
// unrelated nested scope, or in a lambda that shadows the name pollutes every read/write
// check of this declaration (and the other way around). A use of the name takes part in
// THIS declaration's scan only when it provably refers to this binding. The TypeScript
// checker decides whenever the printing context exposes one (every real transpile); a
// structural walk of the binding scopes (TypeScript rules) is the fallback. Anything
// ambiguous keeps the use in the scan — the conservative direction.
//
// `var` declarations are always ambiguous: TypeScript scopes them to the function while
// the printed C# declaration stays in its block, so neither model can classify a use of
// that name safely.

// the binding scope of a declaration node: the nearest block-like ancestor (let/const),
// the nearest function-like ancestor (parameters), the loop for a for-header let/const,
// or undefined when no confident answer exists (a `var` declaration, anything exotic)
function enclosingBindingScope (node) {
    let current = node;
    while (current?.parent) {
        const parent = current.parent;
        if (parent.kind === ts.SyntaxKind.ForStatement || parent.kind === ts.SyntaxKind.ForInStatement || parent.kind === ts.SyntaxKind.ForOfStatement) {
            if (parent.initializer === current) {
                return parent; // `for (let x = ...; ...)` — the per-iteration binding scope
            }
        } else if (isFunctionScope (parent)) {
            return parent;
        } else if (parent.kind === ts.SyntaxKind.Block || parent.kind === ts.SyntaxKind.CaseBlock || parent.kind === ts.SyntaxKind.ModuleBlock || parent.kind === ts.SyntaxKind.SourceFile) {
            return parent;
        }
        current = parent;
    }
    return undefined;
}

function enclosingFunctionScopeOf (csharp, node) {
    return (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (node) : enclosingFunction (node);
}

function isBlockScopedDeclaration (declaration) {
    const list = declaration.parent;
    return list?.kind === ts.SyntaxKind.VariableDeclarationList && (list.flags & (ts.NodeFlags.Let | ts.NodeFlags.Const)) !== 0;
}

// the scope node a binding node is visible from, or undefined when no confident answer
// exists (a `var` declaration, or a shape the index cannot place)
function bindingScopeOf (csharp, binding) {
    if (binding.kind === ts.SyntaxKind.Parameter) {
        return enclosingFunctionScopeOf (csharp, binding);
    }
    if (binding.kind === ts.SyntaxKind.CatchClause) {
        return binding.block; // the catch variable is visible inside its block only
    }
    if (binding.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined;
    }
    if (!isBlockScopedDeclaration (binding)) {
        return undefined; // `var`: TypeScript hoists to the function, the C# print stays in the block
    }
    return enclosingBindingScope (binding);
}

// does `scope` contain `node`? (positional containment; on any failure the answer is
// 'yes' — for every caller that is the conservative direction)
function scopeContainsNode (scope, node) {
    try {
        return scope.getStart () <= node.getStart () && node.getEnd () <= scope.getEnd ();
    } catch (e) {
        return true;
    }
}

// the checker's verdict for `use`, or undefined when it cannot answer (no transpilation
// context — in-memory transpiles — or a symbol the checker cannot resolve)
function checkerRefersToDeclaration (csharp, declaration, use) {
    if (typeof csharp.getChecker !== 'function') {
        return undefined;
    }
    try {
        const checker = csharp.getChecker ();
        if (!checker) {
            return undefined;
        }
        const symbol = checker.getSymbolAtLocation (use);
        const declarations = symbol?.declarations;
        if (!declarations || declarations.length === 0) {
            return undefined;
        }
        return declarations.includes (declaration);
    } catch (e) {
        return undefined;
    }
}

// the structural verdict for `use`: the innermost same-name binding whose scope contains
// the use. Exactly one such innermost binding decides — this declaration (true) or
// another one (false). A tie, an empty candidate set, or a binding without a confident
// scope (var) is undefined, i.e. the use stays in the scan.
function structuralRefersToDeclaration (csharp, scope, declaration, use) {
    const bindings = indexScope (csharp, scope).bindingScopes.get (use.escapedText);
    if (!bindings || bindings.length === 0) {
        return undefined;
    }
    const candidates = [];
    for (const binding of bindings) {
        const bindingScope = bindingScopeOf (csharp, binding);
        if (bindingScope === undefined) {
            return undefined;
        }
        if (scopeContainsNode (bindingScope, use)) {
            candidates.push ({ binding, scope: bindingScope });
        }
    }
    if (candidates.length === 0) {
        return undefined;
    }
    // the candidate scopes are nested ranges; the innermost is the one contained in every other
    const innermost = candidates.filter ((candidate) => candidates.every ((other) => other === candidate || scopeContainsNode (other.scope, candidate.scope)));
    if (innermost.length !== 1) {
        return undefined;
    }
    return innermost[0].binding === declaration;
}

// does `use` refer to `declaration`? true / false / undefined (no proof — participate)
function useRefersToDeclaration (csharp, scope, declaration, use) {
    const viaChecker = checkerRefersToDeclaration (csharp, declaration, use);
    if (viaChecker !== undefined) {
        return viaChecker;
    }
    return structuralRefersToDeclaration (csharp, scope, declaration, use);
}

// a local/parameter named like a C# type token stops the printed type from resolving
// when its binding is in scope at the declaration (an enclosing scope chain, or the same
// block). A same-name binding in a SIBLING block, or one declared in a nested block that
// has already ended, is not in scope at the declaration site — the C# compiler resolves
// the token to the type regardless (probe: ScopeCheck*.cs, every shape compiles). The
// conservative same-scope and enclosing-scope rejects are kept.
function typeNameIsShadowed (csharp, scope, declaration, csharpType) {
    const index = indexScope (csharp, scope);
    const names = csharpType.match (/[A-Za-z_]\w*/g) ?? [];
    for (const name of names) {
        if (!CSHARP_TYPE_TOKENS.includes (name)) {
            continue;
        }
        // printed-name domain: only a binding whose C# print is literally the token
        // shadows it (a TS parameter named `string` prints as a renamed identifier)
        for (const binding of (index.bindingScopesPrinted.get (name) ?? [])) {
            const bindingScope = bindingScopeOf (csharp, binding);
            if (bindingScope === undefined) {
                return true; // no confident scope (var) — keep the conservative reject
            }
            if (scopeContainsNode (bindingScope, declaration)) {
                return true;
            }
        }
    }
    return false;
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
    const savedSelfReads = selfReadStack.splice (0, selfReadStack.length);
    try {
        return csharpLocalType (csharp, declaration, nested);
    } finally {
        context.stack.delete (declaration);
        selfReadStack.push (...savedSelfReads);
    }
}

function resolveLocalReadType (csharp, context, identifier) {
    if (!context || !context.scope) {
        return undefined;
    }
    const index = indexScope (csharp, context.scope);
    const name = identifier.escapedText;
    const declarations = index.declarations.get (name);
    if (!declarations || declarations.length === 0) {
        return undefined; // not a local
    }
    // The read must provably refer to a plain local declaration of this function. The
    // common case is a name bound exactly once; a name with several local bindings (two
    // sibling-block locals, a local shadowing a parameter or a destructured binding) is
    // resolved with the same scope-aware verdict the read/write scan uses — the single
    // binding the use provably refers to decides, anything ambiguous keeps `object`.
    let declaration;
    if (declarations.length === 1 && !index.parameterNames.has (name) && !index.blockedNames.has (name)) {
        declaration = declarations[0];
    } else {
        const referred = declarations.filter ((candidate) => useRefersToDeclaration (csharp, context.scope, candidate, identifier) === true);
        if (referred.length !== 1) {
            return undefined;
        }
        declaration = referred[0];
    }
    if (!declaration.initializer || declaration.parent?.declarations?.length !== 1) {
        return undefined; // uninitialised, or a list the printer never rewrites as one declaration
    }
    const selfRead = selfReadStack[selfReadStack.length - 1];
    if (selfRead !== undefined && selfRead.declaration === declaration) {
        // a later write of the declaration being classified reads the local itself: its C#
        // static type is the type that classification is computing (see selfReadWriteType)
        return selfRead.type;
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

// the declared type of a bare READ of a local: the copy rule's entry point for the
// initialiser of a declaration (`const y = x`). Undefined for every other initialiser and
// for `undefined`, which is a null literal rather than a read — the same split the
// Identifier case of csharpTypeOfValue makes.
function copyReadLocalType (csharp, declaration, context) {
    let node = declaration.initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.Identifier || node.escapedText === 'undefined') {
        return undefined;
    }
    return resolveLocalReadType (csharp, context, node);
}

export function csharpLocalIsSafeToRetype (csharp, scope, declaration, varName, csharpType, context) {
    if (scope === undefined) {
        return false;
    }
    const index = indexScope (csharp, scope);
    if (typeNameIsShadowed (csharp, scope, declaration, csharpType)) {
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
        // a use that provably refers to another same-name binding (a sibling block, a
        // lambda, an unrelated outer scope) is neither a read nor a write of this local
        if (useRefersToDeclaration (csharp, scope, declaration, n) === false) {
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
            // Int64 local of a `-` operand `object` below. A double prefix result binds
            // subtract(double, double), the object overload's own double branch.
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
                if (!destructuredWriteIsCastable (csharp, index, declaration, n, parent.parent, csharpType, context)
                        && !destructuredIsUTAEnabledBoolProof (csharp, scope, declaration, n, parent.parent, csharpType)) {
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
                    const written = csharpTypeOfValue (csharp, parent.right, context) ?? u17WriteValueType (csharp, declaration, parent.right);
                    if (!assignable (csharpType, written)) {
                        // `x = x + r` / `x = this.omit (x, keys)`: the value reads this very
                        // local, so its type can only be proven against the declaration being
                        // checked (see the self-concat / self-omit sections).
                        const selfConcat = (csharpType === 'string') && (selfConcatWriteType (csharp, context, declaration, parent.right) === 'string');
                        // U21: the same self-read shape where a sibling leaf is unnameable
                        // but the left spine still selects add(string, …) (see
                        // stringAccumulatorWriteType)
                        const selfStringWrite = (csharpType === 'string') && isStringLiteralInit (declaration) && (stringAccumulatorWriteType (csharp, context, declaration, parent.right) === 'string');
                        const selfOmit = (csharpType === 'Dictionary<string, object>') && (selfOmitWriteType (csharp, context, declaration, parent.right) === 'Dictionary<string, object>');
// the same arm as the join's: a write that reads this very declaration
                        // resolves the read to the candidate type it is being checked against
                        const selfRead = (!selfConcat && !selfOmit && safeHelperLocalInitializer (declaration.initializer))
                            ? selfReadWriteType (csharp, context, declaration, csharpType, parent.right)
                            : undefined;
                        // `x = c ? D : x`: the self arm's type IS this declaration, so only the
                        // other arm has to be storable in it (selfTernaryWriteType)
                        const selfTernaryType = selfTernaryWriteType (csharp, context, declaration, parent.right);
                        const selfTernary = (selfTernaryType !== undefined) && assignable (csharpType, selfTernaryType);
                        if (!selfConcat && !selfStringWrite && !selfOmit && !selfTernary && !assignable (csharpType, selfRead)) {
                            return false;
                        }
                    }
                } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                    // `x += r` prints `x = add(x, r)`; only the string `+` case is named
                    // here — it is accepted under the same proof as a plain `x + r`
                    // (stringPlusOperandIsProvablyString), and the selected add(string, *)
                    // overload is declared `string`, so the write is assignable by
                    // construction. Every other compound operator stays `object`.
                    if (!(op === ts.SyntaxKind.PlusEqualsToken && (stringPlusOperandIsProvablyString (csharp, n, csharpType, context) || stringPlusOperandIsNonNullAtUse (csharp, scope, declaration, varName, n, csharpType, context)))) {
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
            // add(string, string) == add(object, object) for every input. A `string?`
            // local is accepted on the same proof when the value THIS read receives is
            // proven non-null by a dominating null test / non-null write
            // (stringPlusOperandIsNonNullAtUse) — the null case the divergence needs
            // cannot arise there.
            if (isString && isLeftPlusOperand (n)) {
                if (!stringPlusOperandIsProvablyString (csharp, n, csharpType, context)
                        && !stringPlusOperandIsNonNullAtUse (csharp, scope, declaration, varName, n, csharpType, context)) {
                    return false;
                }
            }
            // `-`: an Int64 local binds subtract(Int64, Int64) — the same unchecked
            // subtraction of the same boxes the object overload's Int64 branch computes
            // for every sibling operand type (differential harness) — so it is accepted.
            // An int local picks subtract(int, int) (an Int32 box, wrapping at
            // Int32, where the object path returns Int64) whenever the sibling operand is
            // provably int too, so it stays rejected; any other sibling (Int64 / uint /
            // long -> subtract(Int64, Int64), double / string / list / dict -> the
            // (object, object) overload) resolves the same call an object local would.
            // An int / Int64 on either side of `-=` stays rejected: it prints
            // `x = subtract(x, y)`, which only compiles when the resolved overload
            // returns exactly Int64.
            const minus = minusOperatorOf (n);
            if (minus === 'minusEquals' ? isInt : (minus === 'minus' && csharpType === 'int' && !intMinusOperandIsIdentical (csharp, n, context))) {
                return false;
            }
            break;
        }
        case ts.SyntaxKind.ParenthesizedExpression: {
            // `(x) + y` prints `add((x), y)`: the parentheses keep x's static type
            const value = unwrapParens (n);
            if (isString && isLeftPlusOperand (value)) {
                if (!stringPlusOperandIsProvablyString (csharp, value, csharpType, context)
                        && !stringPlusOperandIsNonNullAtUse (csharp, scope, declaration, varName, value, csharpType, context)) {
                    return false;
                }
            }
            // `(x) - y` prints `subtract((x), y)`: the parentheses keep x's static type,
            // under the same `-` / `-=` rule as the bare operand
            const minus = minusOperatorOf (value);
            if (minus === 'minusEquals' ? isInt : (minus === 'minus' && csharpType === 'int' && !intMinusOperandIsIdentical (csharp, n, context))) {
                return false;
            }
            break;
        }
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

// how the emitted code consumes `value` under `-` / `-=`: 'minus' for either operand of
// `-`, 'minusEquals' for either operand of `-=` (both print helper calls, so the operand's
// static type participates in overload resolution)
function minusOperatorOf (value) {
    const parent = value.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression) {
        return undefined;
    }
    const op = parent.operatorToken.kind;
    if (op === ts.SyntaxKind.MinusToken) {
        return 'minus';
    }
    if (op === ts.SyntaxKind.MinusEqualsToken) {
        return 'minusEquals';
    }
    return undefined;
}

// `int` as a `-` operand only diverges when the sibling is provably `int` too (subtract(int,
// int)'s Int32 box). An Int64 / uint / long sibling binds subtract(Int64, Int64) — the same
// boxes (differential harness) — and any other proven sibling keeps the (object, object) call.
function intMinusOperandIsIdentical (csharp, identifier, context) {
    let current = identifier;
    while (current.parent && current.parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.parent;
    }
    const parent = current.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression || parent.operatorToken?.kind !== ts.SyntaxKind.MinusToken) {
        return false;
    }
    const sibling = (parent.left === current) ? parent.right : parent.left;
    const kind = csharpArithmeticOperandKind (csharp, sibling, context);
    return kind !== undefined && kind !== 'int';
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

// ---- self-concat accumulator writes ---------------------------------------------------
// `let x = ''; ... x = x + r;` (the loop accumulator; `x += r` already classifies
// through the compound-assignment path) is the write the later-writes scan cannot see
// through: the value is `add(x, r)` and the read of x inside it has no C# type until
// THIS declaration decides one. It is provable when the local can never hold null at
// that point: the initializer and every earlier write are proven non-null strings (the
// running joined type is still a non-nullable `string`), every operand of the `+` tree
// is either a read of the same declaration or a proven non-null string, and every `+`
// node therefore resolves to add(string, string) — which returns the concatenation,
// never null, and is identical to the add(object, object) the untyped local selected
// for every input that reaches it. A later `x = null` write widens the final
// declaration to `string?` and the left-operand rule of the scan then rejects it, as
// today; a nullable initializer (safeString) never starts the chain; every other
// operand shape (a nullable string, a number, an unprovable call) keeps the local
// `object` exactly as before.
function isSelfRead (csharp, operand, declaration) {
    return (operand?.kind === ts.SyntaxKind.Identifier) && (resolveReference (csharp, operand) === declaration);
}

// one operand of the accumulator's `+` tree: 'string' for a read of the local being
// classified (the caller proved the running type is a non-nullable `string`, so the
// read can never be null) or for a nested `+` tree of the same shape; the operand's own
// proven type otherwise
function selfConcatNodeType (csharp, context, declaration, node, state) {
    let current = node;
    while (current?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    if (isSelfRead (csharp, current, declaration)) {
        state.selfRead = true;
        return 'string';
    }
    if (current?.kind === ts.SyntaxKind.BinaryExpression && current.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        const left = selfConcatNodeType (csharp, context, declaration, current.left, state);
        const right = selfConcatNodeType (csharp, context, declaration, current.right, state);
        return (left === 'string' && right === 'string') ? 'string' : undefined;
    }
    return csharpTypeOfValue (csharp, current, context);
}

// the proven type of the write value when it is a `+` tree reading the local being
// classified at least once and every operand is a proven non-null string, or undefined
function selfConcatWriteType (csharp, context, declaration, value) {
    let node = value;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.BinaryExpression || node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        return undefined;
    }
    const state = { selfRead: false };
    const type = selfConcatNodeType (csharp, context, declaration, node, state);
    return (type === 'string' && state.selfRead) ? 'string' : undefined;
}

// ==== U21: the string accumulator WRITE proof for a string-literal initialiser ====
//
// `let x = 'lit'; … x = <write>` — the declaration's own box is the literal's non-null
// `string`, so the join's running type is a non-null string; a later write that keeps the
// box must hand back a string too. This family proves the write shapes the declaration
// position already accepts (add with a string LEFT operand, a conditional over such values)
// where the value reads the local being classified — the one read the initialiser-position
// proof cannot resolve (classifyInProgress). The value's C# static type is decided by the
// overload its own LEFT operand selects, so the emitted add(...) tree must be walked down
// its left spine: a non-null string leaf there makes every enclosing add(string, …) return
// a `string` (never null), which is exactly the type the declaration names.
//
//   x = x + ':' + symbol        add(add(x, ":"), symbol): the inner add's left is x
//   x = cond ? 'a' + x : x      both arms are strings, so the conditional's natural type is
//                               `string` (the same rule csharpTypeOfValue applies to a
//                               declaration initialised with such a conditional)
//
// Only a NON-NULL string leaf qualifies: a null left operand is the one input where
// add(string, …) hands back the RIGHT operand where add(object, object) returns null (see
// the helper comment in Exchange.TranspileHelpers.cs), so a `string?` local / a
// safeString* read / an `as string` cast must keep the local `object` — the same fence
// stringPlusOperandIsProvablyString applies to a left-operand read of the local.
function nonNullStringWriteLeaf (csharp, node) {
    let current = node;
    while (current?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    if (current === undefined) {
        return false;
    }
    if (isStringLiteral (current)) {
        return true;
    }
    switch (current.kind) {
    case ts.SyntaxKind.Identifier: {
        // only the non-nullable spelling: a `string?` local can hold null
        return localIdentifierType (csharp, current) === 'string';
    }
    case ts.SyntaxKind.PropertyAccessExpression: {
        if (current.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return false;
        }
        return CSHARP_LOCAL_THIS_MEMBER_TYPES[current.name?.escapedText] === 'string';
    }
    case ts.SyntaxKind.CallExpression: {
        // `<recv>.toString ()`: a null receiver throws inside the call instead of handing
        // back null (the printer maps the name to a non-null string)
        const callee = current.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.name?.escapedText === 'toString') {
            return true;
        }
        // a call the module's own return tables prove is statically a NON-NULL `string`
        return callReturnType (csharp, current) === 'string';
    }
    }
    return false;
}

// one node of the write value: a read of the local being classified (a non-null string per
// the running type), or a `+` tree whose left spine ends in such a leaf (the tree's own
// static type then is the leftmost add's `string`), or a conditional whose every arm is
// provable the same way. `state.selfRead` records the read that makes this family
// applicable at all — without one the initialiser-position rules already answer.
function stringWriteNodeIsProvable (csharp, context, declaration, node, state) {
    let current = node;
    while (current?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    if (current === undefined) {
        return false;
    }
    if (isSelfRead (csharp, current, declaration)) {
        state.selfRead = true;
        return true;
    }
    if (current.kind === ts.SyntaxKind.BinaryExpression) {
        if (current.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
            return false;
        }
        return stringWriteNodeIsProvable (csharp, context, declaration, current.left, state);
    }
    if (current.kind === ts.SyntaxKind.ConditionalExpression) {
        return stringWriteNodeIsProvable (csharp, context, declaration, current.whenTrue, state)
            && stringWriteNodeIsProvable (csharp, context, declaration, current.whenFalse, state);
    }
    return nonNullStringWriteLeaf (csharp, current);
}

// the proven type of a later write of a string-literal-initialised declaration when the
// value is a `+` tree / conditional over such a tree that reads the local: `string`
// (non-null), or undefined (the declaration keeps `object`).
function stringAccumulatorWriteType (csharp, context, declaration, value) {
    if (!isStringLiteralInit (declaration)) {
        return undefined;
    }
    const state = { selfRead: false };
    if (!stringWriteNodeIsProvable (csharp, context, declaration, value, state) || !state.selfRead) {
        return undefined;
    }
    return 'string';
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
// The right operand is proven the same way as everywhere else in this module — with the
// resolution context, so a read of another emitted-with-a-concrete-type local counts
// exactly like a literal or a string-typed member.
// Everything else stays `object` — see the header comment for the divergences.
// The right operand may also be a `this.<member>` read whose hand-written base declaration IS a
// string box (cs/ccxt/base/Exchange.Options.cs: `public string <member> { get; set; }` — apiKey,
// secret, password, privateKey, hostname, userAgent, ...): the read's C# static type is that box,
// so add(string, string) / add(string, object) bind and concat a string-or-null right operand
// exactly like add(object, object)'s `(string)b` branch (both hand back the left for null). A
// member the base declares `object` (name, token, urls, markets, timeout) can hold a non-string
// and stays unprovable, as does every other right-operand shape.
const CSHARP_THIS_STRING_MEMBER_TYPES = [
    'apiKey', 'secret', 'password', 'uid', 'accountId', 'login', 'privateKey', 'walletAddress',
    'twofa', 'proxy', 'hostname', 'userAgent', 'id',
];

function thisStringMemberRead (node) {
    let current = node;
    while (current?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    if (current?.kind !== ts.SyntaxKind.PropertyAccessExpression || current.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    return CSHARP_THIS_STRING_MEMBER_TYPES.includes (current.name?.escapedText);
}

function stringPlusOperandIsProvablyString (csharp, value, csharpType, context) {
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
    // the right operand may be a proven `string` OR a string-or-null box (`string?`: a
    // safeString* read, a `string?` local, `numberToString`). Nullability is not part of the
    // C# signature, so a string box picks add(string, string) either way, and for a non-null
    // left both overloads return the concatenation — a null right operand the left unchanged,
    // where the object overload's `(string)b` cast is exact on a string box (null included).
    const right = csharpTypeOfValue (csharp, parent.right, context);
    if (right === 'string' || right === 'string?') {
        return true;
    }
    // U19: an operand the printer types statically `object` whose BOX is provably a string or
    // null (the `+`-chain leaf proofs) is exactly as safe as the `string?` spelling above:
    // add(string, object) calls b?.ToString() and add(object, object)'s string branch casts
    // (string)b — identical for a string box, and a null box concatenates as the empty string
    // on both paths.
    // U43: a `this.<member>` read the module types as a string (`thisStringMemberRead`) is
    // the same string box the leaf proofs above name
    return stringBoxLeafProof (csharp, parent.right) !== undefined || thisStringMemberRead (parent.right);
}

// The same LEFT-operand rule for a `string?` local: the only divergence from the untyped
// `object` declaration is the null box (add(object, object) returns null, add(string, *)
// returns the right operand). When the value THIS read receives is proven non-null, both
// spellings compute the same concatenation, so the declaration may still name the string
// box. The proof is syntactic and local to the read:
//   - the read sits in the then-branch of an `if` whose condition is a conjunction of
//     `x !== undefined` / `x != null` tests and one of them is this binding, or
//   - a preceding statement of one of the read's own statement lists is an unconditional
//     exit guarded by a disjunction of `x === undefined` / `x == null` tests (the
//     early-`continue` market-row guards), or a plain `x = <value>` write whose value the
//     module proves a NON-null string,
// and no other write to the binding happens between that proof and the read. Anything else
// (a conditional write, a compound assignment, an unknown value, an ambiguous binding) keeps
// the local `object`, exactly as before.
function stringPlusOperandIsNonNullAtUse (csharp, scope, declaration, name, value, csharpType, context) {
    if (csharpType === 'string') {
        // the non-null spelling has its own rule (stringPlusOperandIsProvablyString); this
        // proof exists for the nullable spelling only — and keeping it out of the `string`
        // scan also keeps the retry below from recursing back into here
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
    // the right operand must still be a string box: a non-string right would bind
    // add(string, object), whose ToString() diverges from the object overload's (string) cast
    const right = csharpTypeOfValue (csharp, parent.right, context);
    if (right !== 'string' && right !== 'string?') {
        return false;
    }
    // a local whose own initializer is a safeString* with a proven non-null default keeps the
    // STRONGER non-null `string` spelling the retry in csharpLocalTypeOf produces (the same
    // box, with its identity cast): accepting the nullable candidate here would trade a
    // `string` declaration for a `string?` one
    if (nonNullStringDefaultCall (csharp, declaration.initializer, context)
            && csharpLocalIsSafeToRetype (csharp, scope, declaration, name, 'string', context)) {
        return false;
    }
    return stringValueIsNonNullAtUse (csharp, scope, declaration, name, value, context);
}

// every write (plain or compound assignment) to the binding inside its scope, as AST nodes
function stringLocalWriteNodes (csharp, scope, declaration, name) {
    const index = indexScope (csharp, scope);
    const out = [];
    for (const n of (index.identifiers.get (name) ?? [])) {
        if (n === declaration.name || isNotAUse (n)) {
            continue;
        }
        if (useRefersToDeclaration (csharp, scope, declaration, n) === false) {
            continue;
        }
        const parent = n.parent;
        if (parent?.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== n) {
            continue;
        }
        const op = parent.operatorToken.kind;
        if (op === ts.SyntaxKind.EqualsToken || (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment)) {
            out.push (n);
        }
    }
    return out;
}

// `x !== undefined` / `x != null` (nonNull) or `x === undefined` / `x == null` (isNull): the
// tested identifier, whatever its name — the callers decide which binding the test proves.
// The condition leaves are printed from the TS source, which parenthesizes each comparison —
// unwrap before classifying.
function stripParens (node) {
    let current = node;
    while (current?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    return current;
}

function nullTestOf (node) {
    const expression = stripParens (node);
    if (expression?.kind !== ts.SyntaxKind.BinaryExpression) {
        return undefined;
    }
    const op = expression.operatorToken.kind;
    const positive = (op === ts.SyntaxKind.ExclamationEqualsToken || op === ts.SyntaxKind.ExclamationEqualsEqualsToken);
    const negative = (op === ts.SyntaxKind.EqualsEqualsToken || op === ts.SyntaxKind.EqualsEqualsEqualsToken);
    if (!positive && !negative) {
        return undefined;
    }
    const sides = [ expression.left, expression.right ];
    for (let i = 0; i < 2; i++) {
        const operand = stripParens (sides[i]);
        const other = stripParens (sides[1 - i]);
        if (operand?.kind !== ts.SyntaxKind.Identifier) {
            continue;
        }
        const nullish = other?.kind === ts.SyntaxKind.NullKeyword || (other?.kind === ts.SyntaxKind.Identifier && other.escapedText === 'undefined');
        if (!nullish) {
            continue;
        }
        return { kind: positive ? 'nonNull' : 'isNull', identifier: operand };
    }
    return undefined;
}

// does this left-hand identifier of a null test resolve to the local being retyped?
function nullTestIsThisBinding (test, csharp, scope, declaration) {
    if (test.identifier.escapedText !== declaration.name.escapedText) {
        return false;
    }
    return useRefersToDeclaration (csharp, scope, declaration, test.identifier) !== false;
}

// flatten `a && b && c` / `a || b || c` into leaves (the printer emits `&&` / `||`, never a
// mixed chain without parentheses in the generated guards this rule targets)
function flattenLogicalChain (node, kind) {
    const out = [];
    const walk = (current) => {
        const expression = stripParens (current);
        if (expression?.kind === ts.SyntaxKind.BinaryExpression && expression.operatorToken.kind === kind) {
            walk (expression.left);
            walk (expression.right);
            return;
        }
        out.push (expression);
    };
    walk (node);
    return out;
}

// the then-branch of this `if` executes only when every conjunct holds: a conjunction whose
// every leaf is a positive null test proves each tested binding non-null inside the branch
function conditionProvesNonNull (condition, csharp, scope, declaration) {
    const leaves = flattenLogicalChain (condition, ts.SyntaxKind.AmpersandAmpersandToken);
    let testsThisBinding = false;
    for (const leaf of leaves) {
        const test = nullTestOf (leaf);
        if (test?.kind !== 'nonNull') {
            return false;
        }
        if (nullTestIsThisBinding (test, csharp, scope, declaration)) {
            testsThisBinding = true;
        }
    }
    return testsThisBinding;
}

// does this statement leave the enclosing block on every path? (`continue` / `return` /
// `throw`, directly or as the single statement of a block)
function statementAlwaysExits (statement) {
    if (statement === undefined) {
        return false;
    }
    if (statement.kind === ts.SyntaxKind.Block) {
        const statements = statement.statements ?? [];
        return statements.length === 1 && statementAlwaysExits (statements[0]);
    }
    return statement.kind === ts.SyntaxKind.ContinueStatement
        || statement.kind === ts.SyntaxKind.ReturnStatement
        || statement.kind === ts.SyntaxKind.ThrowStatement;
}

// `if (a === undefined || b === undefined) <exit>;` — reaching past this statement means none
// of the tested bindings is null/undefined, so it proves THIS binding non-null when it tests it
function exitGuardProvesNonNull (statement, csharp, scope, declaration) {
    if (statement?.kind !== ts.SyntaxKind.IfStatement || !statementAlwaysExits (statement.thenStatement)) {
        return false;
    }
    const leaves = flattenLogicalChain (statement.expression, ts.SyntaxKind.BarBarToken);
    let testsThisBinding = false;
    for (const leaf of leaves) {
        const test = nullTestOf (leaf);
        if (test?.kind !== 'isNull') {
            return false;
        }
        if (nullTestIsThisBinding (test, csharp, scope, declaration)) {
            testsThisBinding = true;
        }
    }
    return testsThisBinding;
}

// the value a `string?` local holds at this read, proven a non-null string by the guards and
// writes above the read (see stringPlusOperandIsNonNullAtUse)
function stringValueIsNonNullAtUse (csharp, scope, declaration, name, read, context) {
    if (scope === undefined) {
        return false;
    }
    const writes = stringLocalWriteNodes (csharp, scope, declaration, name);
    const blocked = (from, to) => writes.some ((w) => w.getStart () > from && w.getEnd () <= to);
    // 1. an enclosing positive guard: walk the ancestors and look for the read (or the block
    // holding it) as the then-branch of an `if` whose condition proves this binding non-null
    let child = read;
    let parent = read.parent;
    while (parent !== undefined) {
        if (parent.kind === ts.SyntaxKind.IfStatement && parent.thenStatement === child && conditionProvesNonNull (parent.expression, csharp, scope, declaration)) {
            if (!blocked (parent.expression.getEnd (), read.getStart ())) {
                return true;
            }
        }
        child = parent;
        parent = parent.parent;
    }
    // 2. a preceding statement of one of the read's statement lists: the LAST write-or-guard
    // before the read is what the value at the read depends on
    let block = read.parent;
    while (block !== undefined) {
        if (block.kind === ts.SyntaxKind.Block || block.kind === ts.SyntaxKind.SourceFile || block.kind === ts.SyntaxKind.CaseClause || block.kind === ts.SyntaxKind.ModuleBlock) {
            const statements = block.statements ?? [];
            let current = undefined;
            let proof = undefined;
            for (const candidate of statements) {
                if (candidate.getStart () <= read.getStart () && read.getEnd () <= candidate.getEnd ()) {
                    current = candidate;
                    break;
                }
                const write = plainStringWriteQualifies (candidate, csharp, scope, declaration, context);
                if (write) {
                    proof = candidate;
                    continue;
                }
                if (exitGuardProvesNonNull (candidate, csharp, scope, declaration)) {
                    proof = candidate;
                    continue;
                }
                const nested = writes.some ((w) => w.getStart () >= candidate.getStart () && w.getEnd () <= candidate.getEnd ());
                if (nested) {
                    proof = undefined; // a conditional/unknown write voids every earlier proof
                }
            }
            if (proof !== undefined && !blocked (proof.getEnd (), read.getStart ())) {
                return true;
            }
            if (current === undefined) {
                return false; // the read is not in this list (malformed span): do not guess
            }
        }
        block = block.parent;
    }
    return false;
}

// is this statement a direct `x = <non-null string>` write of the binding?
function plainStringWriteQualifies (statement, csharp, scope, declaration, context) {
    if (statement?.kind !== ts.SyntaxKind.ExpressionStatement) {
        return false;
    }
    const expression = statement.expression;
    if (expression?.kind !== ts.SyntaxKind.BinaryExpression || expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
        return false;
    }
    const target = expression.left;
    if (target?.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    if (useRefersToDeclaration (csharp, scope, declaration, target) === false) {
        return false;
    }
    if (target.escapedText !== declaration.name.escapedText) {
        return false;
    }
    return csharpTypeOfValue (csharp, expression.right, context) === 'string';
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
//   - `this.stringToCharsArray (x)` -> the hand-written List<string> of one-char strings
//     (GetValue's List<string> branch returns the boxed element or null)
//   - `['a', 'b', ...]` of string literals -> `new List<object> { "a", "b" }`
//   - `this.symbols` -> the Exchange.symbols field (Exchange.Options.cs, `List<object>`); its
//     elements are strings because every writer of the field writes a string list (census A)
//   - `this.findMessageHashes (client, element)` -> the generated BaseMethods body adds one
//     `string?` to its only result list, so every element is a string (census B)
// The local may only be declared `string?` when nothing else can rewrite, mutate or leak
// the list, so every other use of the receiver must be a plain read.
//
// Census A (2026-09-18, `grep -rEn '(this|exchange)\.symbols = |\.symbols\.(Add|AddRange|
// Insert|Remove)'` over ts/src and cs/):
//   this.symbols = []                     ts/src/base/Exchange.ts:3122  Exchange.BaseMethods.cs:373
//   this.symbols = Object.keys (x)        ts/src/base/Exchange.ts:4588  Exchange.BaseMethods.cs:2177
//   this.symbols = sourceExchange.symbols ts/src/base/Exchange.ts:4670  Exchange.BaseMethods.cs:2273
// `[]` is empty, `Object.keys` yields the dict's string keys, and the third writer copies a
// symbols list, i.e. re-asserts the same invariant. No venue writes or overrides the field and
// nothing mutates the list in place, so every box it holds is a string (or null off the end —
// GetValue's IList<object> branch hands that box back, the same box the `(string)` cast names).
//
// Census B (`grep -rn findMessageHashes` over ts/src and cs/): one definition,
// ts/src/base/Exchange.ts:3524 / Exchange.BaseMethods.cs:828, no override. The body builds
// exactly one `List<object> result` from `Object.keys (client.futures)` and adds exactly one
// value to it — the `string? messageHash` element read of that Object.keys list — then returns
// it, so every element of the returned list is a string.

function stringElementsProducer (initializer) {
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (!node) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
        // `this.symbols` — string-list field, every writer string (census A in the section header)
        return node.expression?.kind === ts.SyntaxKind.ThisKeyword && node.name?.escapedText === 'symbols';
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
        // this.stringToCharsArray (x) — the hand-written helper (Exchange.cs) builds its
        // List<string> from `x.ToString().ToCharArray()` one string per char, so every
        // element is a string on every path; GetValue has an exact List<string> branch
        // that returns the boxed element or null, the same box the declaration cast names
        if (method === 'stringToCharsArray' && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
            return true;
        }
        // this.findMessageHashes (client, element) — every element of the returned list is the
        // one `string?` its body adds (census B in the section header)
        if (method === 'findMessageHashes' && callee.expression?.kind === ts.SyntaxKind.ThisKeyword && node.arguments?.length === 2) {
            return true;
        }
        // this.marketIds (symbols) — the generated body (Exchange.BaseMethods.cs#MarketIds) adds
        // exactly one `string? id = this.marketId (getValue (symbols, i))` per element and only
        // when it is non-null, so every element of the result is a string
        if (method === 'marketIds' && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
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

// `this.safeList (subscription, 'subMessageHashes', [])` — the subscription record's own string
// list, which the venue builds from `'ticker:' + symbol`-style keys. Every writer of that key in
// the SAME file stores a string array — a `string[]` / `Strings` local or parameter, or an array
// literal of string expressions (the checker's element type decides) — so every element the read
// hands back is a string (or null off the end, the box the `(string)` cast names).
const SUB_MESSAGE_HASH_KEYS = [ 'subMessageHashes', 'unsubMessageHashes' ];

function checkerElementIsString (checker, type) {
    if (type === undefined) {
        return false;
    }
    if (typeof type.isUnion === 'function' && type.isUnion ()) {
        return type.types.some ((member) => checkerElementIsString (checker, member));
    }
    const args = (typeof checker.getTypeArguments === 'function') ? checker.getTypeArguments (type) : [];
    return args.length === 1 && (args[0].flags & ts.TypeFlags.StringLike) !== 0;
}

function subMessageHashesWriteValueIsStringList (csharp, value) {
    const checker = (typeof csharp.getChecker === 'function') ? csharp.getChecker () : undefined;
    if (checker === undefined || value === undefined) {
        return false;
    }
    let type;
    try {
        type = checker.getTypeAtLocation (value);
    } catch (e) {
        return false;
    }
    return checkerElementIsString (checker, type);
}

function subMessageHashesProducer (csharp, initializer) {
    // `... as List` is a compile-time-only assertion with no runtime effect (the printer's
    // own note on printAsExpression), so it unwraps like parentheses
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression || node?.kind === ts.SyntaxKind.AsExpression
            || node?.kind === ts.SyntaxKind.SatisfiesExpression || node?.kind === ts.SyntaxKind.TypeAssertionExpression) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword
            || callee.name?.escapedText !== 'safeList') {
        return false;
    }
    const keyName = elementAccessLiteralKey (node.arguments?.[1]);
    if (!SUB_MESSAGE_HASH_KEYS.includes (keyName)) {
        return false;
    }
    const source = node.getSourceFile?.();
    if (source === undefined) {
        return false;
    }
    let writes = 0;
    let ok = true;
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.PropertyAssignment && elementAccessLiteralKey (n.name) === keyName) {
            writes++;
            if (!subMessageHashesWriteValueIsStringList (csharp, n.initializer)) {
                ok = false;
            }
        }
        if (n.kind === ts.SyntaxKind.BinaryExpression && ASSIGNMENT_OPERATORS.includes (n.operatorToken?.kind)
                && n.left?.kind === ts.SyntaxKind.ElementAccessExpression && elementAccessLiteralKey (n.left.argumentExpression) === keyName) {
            writes++;
            if (!subMessageHashesWriteValueIsStringList (csharp, n.right)) {
                ok = false;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (source, visit);
    return ok && writes > 0;
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

// the element types a proven list can hand back — FromTyped and the hand-written helpers never
// build a narrower box; a mixed list has no single element type and stays unproven
const ELEMENT_VALUE_TYPES = [ 'string', 'Dictionary<string, object>', 'List<object>' ];

// the C# type of one value handed to a list (a push argument / array literal element): this
// module's own resolution, a read of a single-binding local, or the awaited result type of a
// bare `this.<m> (...)` call, so `promises.push (this.publicGetX (params))` proves a dictionary
function elementValueType (csharp, node, context) {
    const direct = csharpTypeOfValue (csharp, node, context);
    if (direct !== undefined) {
        return direct;
    }
    let value = node;
    while (value?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        value = value.expression;
    }
    if (value?.kind === ts.SyntaxKind.Identifier) {
        return localIdentifierType (csharp, value);
    }
    if (value?.kind === ts.SyntaxKind.CallExpression) {
        return thisCallResultType (csharp, value);
    }
    return undefined;
}

// the join of the element value types: every string box joins to string, every other proven
// type must be identical on every path, anything else (numeric, object, a typed core) rejects
function joinElementValueTypes (types) {
    let joined;
    for (const type of types) {
        const normalized = (type === 'string?') ? 'string' : type;
        if (!ELEMENT_VALUE_TYPES.includes (normalized)) {
            return undefined;
        }
        if (joined === undefined) {
            joined = normalized;
        } else if (joined !== normalized) {
            return undefined;
        }
    }
    return joined;
}

// `const list = []; ... list.push (v); ... const x = list[i]` — the elements are exactly the
// boxes the pushes added: the element type is their join, and only the push sites this proved
// may be skipped by the read scan; an unproven push (or any other write) rejects the list
function pushBuiltListElementType (csharp, scope, declaration, context) {
    let initializer = declaration.initializer;
    while (initializer?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        initializer = initializer.expression;
    }
    if (initializer?.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return undefined;
    }
    const types = [];
    const pushes = new Set ();
    for (const element of initializer.elements) {
        const type = elementValueType (csharp, element, context);
        if (type === undefined) {
            return undefined;
        }
        types.push (type);
    }
    for (const use of indexScope (csharp, scope).identifiers.get (declaration.name.escapedText) ?? []) {
        if (use === declaration.name) {
            continue;
        }
        const parent = use.parent;
        if (parent?.kind === ts.SyntaxKind.PropertyAccessExpression && parent.expression === use && parent.name?.escapedText === 'push') {
            const call = parent.parent;
            if (call?.kind !== ts.SyntaxKind.CallExpression || call.expression !== parent || call.arguments?.length !== 1) {
                return undefined; // the printer keeps only the first argument of a multi-value push
            }
            const type = elementValueType (csharp, call.arguments[0], context);
            if (type === undefined) {
                return undefined;
            }
            types.push (type);
            pushes.add (use);
            continue;
        }
        if (receiverUseIsWrite (use)) {
            return undefined;
        }
    }
    const elementType = (types.length === 0) ? undefined : joinElementValueTypes (types);
    if (elementType === undefined) {
        return undefined; // a list nothing was ever added to proves no element box
    }
    return { elementType, pushes };
}

// `await Promise.all (list)`: PromiseAll (cs/ccxt/base/Exchange.TranspileHelpers.cs) awaits
// every task and re-boxes each Result through FromTyped, which returns a plain Dictionary /
// List / string unchanged — so the element box is the promises' common proven Task<T> result
function promiseAllElementType (csharp, initializer, context, scope) {
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    const call = node.expression;
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = call.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression
        || callee.expression?.kind !== ts.SyntaxKind.Identifier || callee.expression.escapedText !== 'Promise'
        || callee.name?.escapedText !== 'all') {
        return undefined;
    }
    const argument = call.arguments?.[0];
    if (argument === undefined) {
        return undefined;
    }
    let built;
    if (argument.kind === ts.SyntaxKind.Identifier) {
        const uses = indexScope (csharp, scope).identifiers.get (argument.escapedText);
        if (!uses) {
            return undefined;
        }
        let list;
        let bindings = 0;
        for (const n of uses) {
            if (n.parent?.kind === ts.SyntaxKind.VariableDeclaration && n.parent.name === n) {
                bindings++;
                list = n.parent;
            }
        }
        if (bindings !== 1 || list === undefined || list.getStart () > argument.getStart ()) {
            return undefined;
        }
        built = pushBuiltListElementType (csharp, scope, list, context);
    } else if (argument.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        const types = [];
        for (const element of argument.elements) {
            const type = elementValueType (csharp, element, context);
            if (type === undefined) {
                return undefined;
            }
            types.push (type);
        }
        const elementType = joinElementValueTypes (types);
        built = (elementType === undefined) ? undefined : { elementType, pushes: new Set () };
    }
    if (built === undefined) {
        return undefined;
    }
    return built;
}

// ---- U02: element reads of a narrowed string-list PARAMETER -----------------------------
//
// `const symbol = symbols[i]` where `symbols` is a method PARAMETER prints `getValue(symbols, i)`
// and the receiver IS that parameter -- a list in the emitted C#, but only where the `typeCoreArgs`
// pass narrowed it (CORE_LIST_ARGS, exported by build/csharpTranspiler.ts): a `Strings` parameter
// the pass left `object` keeps the untyped local, which is the family's reject rule (an `object`
// receiver proves nothing about its elements).
//
// Every element of a narrowed parameter is a string:
//   * the TS annotation is a string list -- `Strings` (`type Strings = string[] | undefined`,
//     ts/src/base/types.ts:4, 49 sites) or `string[]` (39 sites), the only two shapes the family
//     admits (census: campaigns/cs90/tools/U02/param_census.py);
//   * every write `name = RHS` in the body produces a string list. Census over the emitted tree
//     (`grep -E '^\s+symbols = ' cs/ccxt` -> 390 writes): 369 `this.marketSymbols (...)` -- its
//     generated body adds exactly one `string?` per element (`safeString (market, "symbol",
//     getValue (symbols, i))`, Exchange.BaseMethods.cs:3579) -- 8 `this.symbols` (census A above)
//     and one `this.getActiveSymbols (...)`; the remaining 12 write an EMPTY `new List<object> ()`,
//     whose every read is bounded by its own Count (nothing to name). `marketIds`/`messageHashes`/
//     `topics` are never assigned at all (they are built in the body).
//   * no in-place mutation: the `(push|unshift|splice|sort|reverse|fill|pop|shift)` census over
//     ts/src matches only lists BUILT in the method, never a parameter, and the C# twin census
//     (`((IList<object>)<name>).Add (`) finds nothing either. A parameter is only read, indexed or
//     handed to a callee that reads it (marketSymbols / marketIds / getMarketFromSymbols /
//     safeString / isEmpty / watchPublic / ...), so unlike the local-receiver scan above an
//     argument position stays allowed here -- the callee gets the caller's own array.
//
// The declaration keeps the existing spelling (`string?` + the `(string)` cast the local-receiver
// family emits): the call's C# type is `object` either way, and the cast names exactly the box
// the element read hands back. `csharpLocalIsSafeToRetype` still vets every use of the local.

// the string-list RHS shapes the census allows for a write to a narrowed list parameter
function stringListParameterWriteProducer (right) {
    let node = right;
    // `symbols = this.marketSymbols (symbols, undefined, false) as string[]` is the same list —
    // `as` is a compile-time-only assertion with no runtime effect (see the printer's own note
    // in src/csharpTranspiler.ts#printAsExpression)
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression
        || node?.kind === ts.SyntaxKind.AsExpression
        || node?.kind === ts.SyntaxKind.SatisfiesExpression
        || node?.kind === ts.SyntaxKind.TypeAssertionExpression) {
        node = node.expression;
    }
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        return node.elements.length === 0; // an empty list holds no element a read could name
    }
    if (node.kind === ts.SyntaxKind.PropertyAccessExpression) {
        return node.expression?.kind === ts.SyntaxKind.ThisKeyword && node.name?.escapedText === 'symbols';
    }
    if (node.kind === ts.SyntaxKind.CallExpression) {
        const callee = node.expression;
        if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return false;
        }
        return callee.name?.escapedText === 'marketSymbols' || callee.name?.escapedText === 'getActiveSymbols';
    }
    return false;
}

// the parameter's TS annotation names a string list
function stringListParameterAnnotation (parameter) {
    const type = parameter.type;
    if (type === undefined) {
        return false;
    }
    if (type.kind === ts.SyntaxKind.ArrayType) {
        return type.elementType?.kind === ts.SyntaxKind.StringKeyword;
    }
    return type.kind === ts.SyntaxKind.TypeReference
        && type.typeName?.kind === ts.SyntaxKind.Identifier
        && type.typeName.escapedText === 'Strings';
}

// a use that can change what the list holds in place: an element write, a delete, an in-place
// list method. The alias / argument / return shapes receiverUseIsWrite also rejects are allowed
// here (see the family comment).
function parameterListUseIsMutation (identifier) {
    const parent = identifier.parent;
    if (!parent) {
        return true;
    }
    switch (parent.kind) {
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
    case ts.SyntaxKind.DeleteExpression:
        return true;
    }
    return false;
}

// is every element of this narrowed parameter a string? (see the family comment above)
function stringListParameterElementType (csharp, scope, parameter) {
    if (typeof csharp.csharpListTypedCoreArg !== 'function' || !stringListParameterAnnotation (parameter)) {
        return false;
    }
    const name = parameter.name?.escapedText;
    const methodName = (scope.kind === ts.SyntaxKind.MethodDeclaration && scope.name?.kind === ts.SyntaxKind.Identifier) ? scope.name.escapedText : undefined;
    if (name === undefined || methodName === undefined) {
        return false;
    }
    const position = (scope.parameters ?? []).indexOf (parameter);
    if (position < 0 || csharp.csharpListTypedCoreArg (methodName, position) === undefined) {
        return false;
    }
    for (const use of indexScope (csharp, scope).identifiers.get (name) ?? []) {
        if (use === parameter.name || isNotAUse (use)) {
            continue;
        }
        if (useRefersToDeclaration (csharp, scope, parameter, use) === false) {
            continue; // a same-name binding in a nested scope: not this parameter's value
        }
        const parent = use.parent;
        if (parent?.kind === ts.SyntaxKind.BinaryExpression && parent.left === use && ASSIGNMENT_OPERATORS.includes (parent.operatorToken.kind)) {
            if (!stringListParameterWriteProducer (parent.right)) {
                return false;
            }
            continue;
        }
        if (parameterListUseIsMutation (use)) {
            return false;
        }
    }
    return true;
}

// the element type of `recv[key]`, or undefined. `getValue (recv, key)` is an object box, so a
// named declaration needs the cast csharpLocalTypeOf adds; the receiver must have exactly one
// binding, declared before the read, and every other use of it must be a read the producer proved
function elementAccessElementType (csharp, initializer, context) {
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
    if (bindings !== 1) {
        return undefined;
    }
    if (declaration.kind === ts.SyntaxKind.Parameter) {
        // U02: a parameter receiver -- the receiver IS a narrowed list parameter (see above)
        return stringListParameterElementType (csharp, scope, declaration) ? 'string' : undefined;
    }
    if (declaration.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined;
    }
    if (declaration.getStart () > initializer.getStart ()) {
        return undefined; // the list is not provably built before the read
    }
    const built = stringElementsProducer (declaration.initializer)
        ? { elementType: 'string', pushes: new Set () }
        : (subMessageHashesProducer (csharp, declaration.initializer)
            ? { elementType: 'string', pushes: new Set () }
            : pushBuiltListElementType (csharp, scope, declaration, context));
    const producer = (built !== undefined) ? built : promiseAllElementType (csharp, declaration.initializer, context, scope);
    if (producer === undefined) {
        return undefined;
    }
    for (const n of uses) {
        if (n === receiver || n === declaration.name || producer.pushes.has (n)) {
            continue;
        }
        if (receiverUseIsWrite (n)) {
            return undefined;
        }
    }
    return producer.elementType;
}

// `market['symbol']` — a MARKET ROW read by a literal key. The C# printer prints element
// access as `getValue(market, "symbol")`, which hands back the raw box; naming the value
// `string?` therefore needs the `(string)` cast back, exactly like elementAccessElementType.
// The key set, the receiver proof and the value census are in the header (MARKET_ROW_*
// section). Keys outside the set (booleans / numerics / dicts) keep the local `object`.
export const MARKET_ROW_STRING_KEYS = [ 'symbol', 'id', 'base', 'quote', 'baseId', 'quoteId', 'settle', 'settleId', 'lowercaseId', 'type',
    'uppercaseId', 'subType', 'optionType', 'expiryDatetime', 'feeSide' ];

// `market['swap']` — the BOOL keys of a market row: every market-row writer in ts/src (the 157
// 'symbol'+'base'+'quote' literals plus the skeleton) stores a boolean or nothing at these keys,
// nothing else (census: tools/S23/market-row-types.mjs, re-run for the added keys with
// campaigns/cs90/tools/U01/key-value-census.mjs); `(bool?)` is BaseMethods#safeBool*'s shape.
const MARKET_ROW_BOOL_KEYS = [ 'spot', 'swap', 'contract', 'future', 'option', 'linear',
    'inverse', 'index', 'stock' ];

// `market['precision']` — the DICT keys: every writer of both keys in a market-row literal is an
// object literal (census: campaigns/cs90/tools/U01/key-value-census.mjs — 122/122 for precision,
// 119/120 for limits; the one non-literal is a dict-typed identifier), which the printer boxes as
// `new Dictionary<string, object>()`, so the `(IDictionary<string, object>)` cast names it
// exactly. `info` stays object (a string writer on a market row plus 58 any-typed ones), `fees`
// is not a market-row key at all (0 writers), marginModes is left out (its identifier writers'
// C# box is not proven).
const MARKET_ROW_DICT_KEYS = [ 'precision', 'limits' ];

// `parseTrade (trade, market: Market = undefined)` — a MARKET-ROW PARAMETER. The annotation is
// the market-row type itself (ts/src/base/types.ts: `Market = MarketInterface | undefined`), so
// every ts/src caller passes a market row or nothing; the same use scan as the local receiver
// still requires every write inside the method to be a row producer or a nullish reset, and the
// value box at the read is then the key table's (header, MARKET_ROW_* section). Market rows that
// arrive as a plain `any` parameter (mexc createSpotOrderRequest, pro/bitrue parseWsTicker, …)
// are NOT covered — no annotation, no proof.
const MARKET_ROW_PARAM_TYPES = [ 'Market', 'MarketInterface' ];

// `const market = this.getMarketFromSymbols (symbols)`: a venue-local helper whose EVERY return
// path is a market row, so the local that holds the call IS a row. The three names below are the
// ws handlers' market resolvers; their return paths are the ones CSHARP_COLLECTION_RETURN_METHODS
// already records for their C# declaration (base `getMarketFromSymbols`: `this.market
// (firstMarket)` or undefined; weex `getMarketFromClientAndMessage` / aster `getMarketFromOrder`:
// `this.safeMarket (...)`). A same-name helper elsewhere may be added only with its own census.
const MARKET_ROW_HELPER_PRODUCERS = [ 'getMarketFromSymbols', 'getMarketFromClientAndMessage', 'getMarketFromOrder' ];

// the parameter's declared market-row type, or undefined
function marketRowParamAnnotation (declaration) {
    const annotation = declaration?.type;
    if (annotation === undefined) {
        return undefined;
    }
    return annotation.getText ().trim ();
}

// the literal key of `recv['key']`, or undefined
function elementAccessLiteralKey (node) {
    if (node?.kind === ts.SyntaxKind.StringLiteral || node?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        return node.text;
    }
    return undefined;
}

// ==== U06: dictionary ROW element reads (`const rawOrder = orders[i]`) ====
//
// `const rawOrder = orders[i]` prints `object rawOrder = getValue(orders, i);`. The receiver is
// almost always an untyped box or a `List<object>` (the local-types header's element-read
// section), so the element carries no nameable type — EXCEPT when the TS checker types the
// receiver as a list of a ccxt ROW shape: `orders: OrderRequest[]` (the createOrders parameter),
// `trades = this.parseTrades (...)` (`Trade[]`), `positions = await this.fetchPositions ()`
// (`Position[]`), `accounts = await this.loadAccounts ()` (`Account[]`), `networkEntries =
// rawCurrency as Dict[]` (`Dict[]`), ... Every one of those element types is an interface (or an
// object literal / the `Dict` index-signature shape) declared in ts/src, i.e. a JSON row: the
// generated C# tree has no class for any of them (census: no `new OrderRequest (` / `new
// Position (` / `new Trade (` anywhere under cs/), so the box a row can hold is the decoded
// dictionary JsonHelper.ToObject builds (or the caller's own Dictionary<string, object> — the
// generated createOrders id-test passes exactly that) or null; naming it `IDictionary<string,
// object>` is therefore the box the value already is, behind the same `((IDictionary<string,
// object>)…)` cast the safeValue-twin family emits. `GetValue`'s dict branch and this cast accept
// every IDictionary implementation, so a caller-supplied ConcurrentDictionary row is named
// correctly too (Dictionary<string, object> would throw on it), and a null element stays null.
//
// The read is keyed on the LOCAL NAME (this unit's family): the receiver-keyed families
// (U01/U02/U03/U04) own `getValue (recv, key)` sites, so a receiver the checker proves is a
// string-keyed dictionary (`Tickers`, `Balances`, ...) is left to U04, and only list-shaped
// receivers reach here.
//
// Everything else keeps `object`: `any` / `unknown` elements (234 of the 315 corpus sites — the
// vast majority), scalar elements (`order = success[i]` on a Strings list is a string, the string
// family's business), array/tuple elements, union elements and class instances.

const DICT_ROW_LOCAL_NAMES = new Set ([ 'balance', 'order', 'rawOrder', 'position', 'rawPosition', 'trade', 'rawTrade', 'ticker', 'account', 'tier', 'chain', 'networkEntry' ]);

// a use the C# printer casts to a string (`.ToUpper ()` prints `((string)x).ToUpper ()`) or hands
// to an arithmetic helper — both throw on a dictionary box, so they veto the declaration
const DICT_ROW_STRING_METHODS = new Set ([ 'split', 'join', 'toUpperCase', 'toLowerCase', 'replace', 'replaceAll', 'trim', 'trimStart', 'trimEnd', 'startsWith', 'endsWith', 'indexOf', 'lastIndexOf', 'search', 'charAt', 'charCodeAt', 'codePointAt', 'repeat', 'padStart', 'padEnd', 'substring', 'substr', 'slice', 'includes', 'concat', 'match', 'matchAll', 'normalize', 'localeCompare', 'toString' ]);

// every use of the local outside the one its own declaration is: a row is read through the safe*
// helpers, an element read/write, a list push or a call argument; it is never a string receiver
// and never an arithmetic operand
function dictRowUsesAreConsistent (csharp, scope, declaration) {
    const uses = indexScope (csharp, scope).identifiers.get (declaration.name.escapedText) ?? [];
    for (const use of uses) {
        if (use === declaration.name || isNotAUse (use)) {
            continue;
        }
        if (useRefersToDeclaration (csharp, scope, declaration, use) === false) {
            continue;
        }
        const parent = use.parent;
        if (parent?.kind === ts.SyntaxKind.PropertyAccessExpression && parent.expression === use && DICT_ROW_STRING_METHODS.has (parent.name?.escapedText)) {
            return false;
        }
        let current = use;
        while (current.parent && (current.parent.kind === ts.SyntaxKind.ParenthesizedExpression || current.parent.kind === ts.SyntaxKind.AsExpression)) {
            current = current.parent;
        }
        const owner = current.parent;
        if (owner?.kind === ts.SyntaxKind.BinaryExpression) {
            const operator = owner.operatorToken.kind;
            const arithmetic = operator === ts.SyntaxKind.PlusToken
                || operator === ts.SyntaxKind.MinusToken
                || operator === ts.SyntaxKind.AsteriskToken
                || operator === ts.SyntaxKind.SlashToken
                || operator === ts.SyntaxKind.PercentToken
                || operator === ts.SyntaxKind.AsteriskAsteriskToken
                || (operator >= ts.SyntaxKind.FirstCompoundAssignment && operator <= ts.SyntaxKind.LastCompoundAssignment);
            if (arithmetic) {
                return false;
            }
        }
    }
    return true;
}

// `IDictionary<string, object>` when the checker proves the element of `recv[key]` is a ccxt row
// shape, or undefined (the read keeps the printer's `object`)
function dictRowElementReadType (csharp, declaration) {
    if (!DICT_ROW_LOCAL_NAMES.has (declaration?.name?.escapedText)) {
        return undefined;
    }
    // the generated TESTS are not exchange classes: they hold the exchange in a parameter and
    // call the BaseTest `getValue` bridge shim (cs/tests/BaseTest.Bridge.cs), so the S63 typed
    // twin this declaration enables (`x["k"]` -> `GetValue (x, "k")`) does not resolve there —
    // the farm build reports CS0103 "The name 'GetValue' does not exist in the current context"
    // for cs/tests/Generated/**. The test tree is outside this unit's family, so it stays `object`.
    const sourceFile = (typeof declaration.getSourceFile === 'function') ? declaration.getSourceFile ().fileName : '';
    if (/(^|[\\/])test[\\/]/.test (sourceFile)) {
        return undefined;
    }
    const initializer = declaration.initializer;
    if (initializer?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    if (typeof csharp.getChecker !== 'function') {
        return undefined;
    }
    let checker;
    try {
        checker = csharp.getChecker ();
    } catch (error) {
        return undefined; // in-memory program: no checker to ask
    }
    if (!checker) {
        return undefined;
    }
    const element = checker.getTypeAtLocation (initializer);
    if (!element || !(element.flags & ts.TypeFlags.Object)) {
        return undefined; // any / unknown / a scalar / a union: no row proof
    }
    if (element.flags & (ts.TypeFlags.Union | ts.TypeFlags.Intersection | ts.TypeFlags.TypeParameter)) {
        return undefined;
    }
    if (checker.isArrayType (element) || checker.isTupleType (element)) {
        return undefined; // a nested list is not a row
    }
    const objectFlags = element.objectFlags ?? 0;
    if (objectFlags & ts.ObjectFlags.Class) {
        return undefined; // a class instance is not a decoded row
    }
    if (!(objectFlags & (ts.ObjectFlags.Interface | ts.ObjectFlags.ObjectLiteral | ts.ObjectFlags.Anonymous | ts.ObjectFlags.Reference | ts.ObjectFlags.Mapped))) {
        return undefined;
    }
    const symbol = element.getSymbol () ?? element.aliasSymbol;
    const declarations = symbol?.declarations ?? [];
    if (declarations.length === 0 || !declarations.every ((each) => ts.isInterfaceDeclaration (each) || ts.isTypeLiteralNode (each))) {
        return undefined; // only a ts/src interface or a type literal proves the row shape
    }
    const receiverType = checker.getTypeAtLocation (initializer.expression);
    if (checker.getIndexTypeOfType (receiverType, ts.IndexKind.String) !== undefined) {
        return undefined; // a string-keyed receiver belongs to the receiver-keyed families (U04)
    }
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (declaration) : enclosingFunction (declaration);
    if (scope === undefined || !dictRowUsesAreConsistent (csharp, scope, declaration)) {
        return undefined;
    }
    return 'IDictionary<string, object>';
}

// ==== S63: typed dict element reads -> the static GetValue twin ====
//
// A `recv["k"]` read whose receiver's declaration this module typed as a string-keyed dictionary
// prints `GetValue(recv, "k")` (the static twin in cs/ccxt/base/Exchange.TranspileHelpers.cs)
// instead of the object wrapper `getValue(recv, "k")`. The twin takes the object overload's dict
// branch and nothing else: the receiver's static type makes GetValue's string branch (a string
// receiver) and its IsArray branch unreachable, and both paths run the same null check and the
// same ContainsKey-then-indexer read on the same object.
//
// Safety needs no extra guard: the twin's receiver parameter is only *reachable* through C#'s
// static typing, so a receiver that is not a dictionary keeps binding GetValue(object, object).
// The value of the family is that the proven receivers bind the twin; a receiver this module
// cannot type answers undefined and the read keeps the wrapper byte for byte.
const TYPED_DICT_RECEIVER_TYPES = [ 'Dictionary<string, object>', 'IDictionary<string, object>' ];

// the declared C# type of an element read's receiver when it is a proven dictionary local, or
// undefined. Same proof as elementAccessElementType minus the element type: exactly one binding in
// the enclosing function, a local declared before the read, and this module's own classification
// (localIdentifierType) naming the dictionary it prints.
function typedDictElementAccessReceiver (csharp, node) {
    if (node?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    // the generated test/example tiers print element reads against the bridge helpers
    // (cs/tests/BaseTest.Bridge.cs / examples/cs/examples/Examples.Bridge.cs): GetValue is a
    // member of BaseExchange only, so those tiers keep the wrapper. Paths arrive relative or
    // absolute, so match the segment without anchoring a leading separator.
    const fileName = (node.getSourceFile?.()?.fileName ?? '').replace (/\\/g, '/');
    if (!fileName.includes ('ts/src/') || fileName.includes ('ts/src/test/') || fileName.includes ('examples/')) {
        return undefined;
    }
    if (node.expression?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const type = localIdentifierType (csharp, node.expression);
    return TYPED_DICT_RECEIVER_TYPES.indexOf (type) >= 0 ? type : undefined;
}

// install the receiver-type hook on a printer (idempotent). Without the printer method (an older
// ast-transpiler pin) nothing is wired and every read keeps the object wrapper.
function installTypedDictElementAccess (csharp) {
    if (typeof csharp.printTypedDictElementAccessIfAny !== 'function' || csharp._typedDictElementAccessPatched) {
        return;
    }
    csharp.csharpElementAccessTypedReceiver = (node) => typedDictElementAccessReceiver (csharp, node);
    csharp._typedDictElementAccessPatched = true;
}

// an initializer that hands back a market row (or null): the this.market / this.safeMarket /
// this.safeMarketStructure sync cores (SYNC_TYPED_CORES declares all three
// Dictionary<string, object>, so the local that holds the result is a typed Dictionary row),
// or the same through `cond ? producer : null` / `null : producer`. Nothing else: an
// `object`-declared receiver, a parameter, an alias, a `this.markets[...]` read or a
// destructured name has no proven box here and keeps the local `object`.
function marketRowProducer (initializer) {
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.CallExpression) {
        const callee = node.expression;
        if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return false;
        }
        const name = callee.name?.escapedText;
        return name === 'market' || name === 'safeMarket' || name === 'safeMarketStructure' || MARKET_ROW_HELPER_PRODUCERS.includes (name);
    }
    if (node.kind === ts.SyntaxKind.ConditionalExpression) {
        const nullish = (n) => (n?.kind === ts.SyntaxKind.NullKeyword || (n?.kind === ts.SyntaxKind.Identifier && n.escapedText === 'undefined'));
        return (nullish (node.whenTrue) || marketRowProducer (node.whenTrue))
            && (nullish (node.whenFalse) || marketRowProducer (node.whenFalse));
    }
    return false;
}

// a value the receiver may be (re)bound to: a market row, or nothing (the `let market =
// undefined` / `market = null` spellings). Any other value breaks the "the box is a row or
// null" chain and disqualifies the receiver.
function marketRowValueOrNullish (node) {
    let value = node;
    while (value?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        value = value.expression;
    }
    if (value === undefined) {
        return false;
    }
    if (value.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    return (value.kind === ts.SyntaxKind.Identifier && value.escapedText === 'undefined') || marketRowProducer (value);
}

// can this use of the receiver change what the local holds, hand the row out, or write INTO
// the row? Call arguments and returns are allowed: they cannot rebind the local, and the
// rows live in this.markets, so a corpus write to a row's keys is the census' business (see
// MARKET_ROW_STRING_KEYS), not this scan's. What is rejected: a rebind to a non-row value,
// `y = market` / `y += market` aliasing, `market['key'] = ...` / `delete market[...]` index
// writes, `const alias = market` copies (the alias could be index-written under a name this
// scan cannot follow), list-mutating method reads, and destructuring / spread / ref sinks.
function marketRowUseDisqualifies (n) {
    const parent = n.parent;
    if (parent === undefined) {
        return true;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.BinaryExpression:
        if (parent.left === n) {
            if (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                return !marketRowValueOrNullish (parent.right);
            }
            return ASSIGNMENT_OPERATORS.includes (parent.operatorToken.kind);
        }
        // `y = market` / `y += market` aliases the row into a name this scan cannot follow
        return ASSIGNMENT_OPERATORS.includes (parent.operatorToken.kind);
    case ts.SyntaxKind.ElementAccessExpression: {
        if (parent.expression !== n) {
            return false;
        }
        const grand = parent.parent;
        if (grand?.kind === ts.SyntaxKind.DeleteExpression) {
            return true;
        }
        return grand?.kind === ts.SyntaxKind.BinaryExpression && grand.left === parent && ASSIGNMENT_OPERATORS.includes (grand.operatorToken.kind);
    }
    case ts.SyntaxKind.PropertyAccessExpression:
        return parent.expression === n && LIST_MUTATING_METHODS.includes (parent.name?.escapedText);
    case ts.SyntaxKind.VariableDeclaration:
        return parent.initializer === n;
    case ts.SyntaxKind.PostfixUnaryExpression:
    case ts.SyntaxKind.PrefixUnaryExpression:
    case ts.SyntaxKind.BindingElement:
    case ts.SyntaxKind.ShorthandPropertyAssignment:
    case ts.SyntaxKind.SpreadElement:
        return true;
    }
    return false;
}

// `market['swap']` on a PROVEN row receiver: the literal key, else undefined. Two receiver
// shapes: a LOCAL whose single binding is a market-row producer (or a nullish reset), and a
// MARKET-ROW PARAMETER (the TS annotation, see MARKET_ROW_PARAM_TYPES). Every other use of the
// receiver must pass the writer scan below. The corpus fence for the value boxes: the key tables.
function marketRowReadKey (csharp, initializer) {
    if (initializer?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    const key = elementAccessLiteralKey (initializer.argumentExpression);
    if (key === undefined) {
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
    const index = indexScope (csharp, scope);
    const uses = index.identifiers.get (receiver.escapedText);
    if (!uses) {
        return undefined;
    }
    const candidates = (index.declarations.get (receiver.escapedText) ?? [])
        .filter ((candidate) => useRefersToDeclaration (csharp, scope, candidate, receiver) === true);
    let declaration;
    if (candidates.length === 1) {
        declaration = candidates[0];
        if (declaration.initializer === undefined || !marketRowValueOrNullish (declaration.initializer)) {
            return undefined;
        }
        if (declaration.getStart () > initializer.getStart ()) {
            return undefined; // the row is not provably bound before the read
        }
    } else if (candidates.length === 0) {
        // the receiver resolves to no local declaration: the MARKET-ROW PARAMETER shape
        // (parseTrade (trade, market: Market = undefined)). The annotation is the proof that
        // every caller hands a market row or nothing; the use scan below is the writer join.
        const params = (index.bindings.get (receiver.escapedText) ?? [])
            .filter ((candidate) => candidate.kind === ts.SyntaxKind.Parameter)
            .filter ((candidate) => useRefersToDeclaration (csharp, scope, candidate, receiver) === true);
        if (params.length !== 1 || !MARKET_ROW_PARAM_TYPES.includes (marketRowParamAnnotation (params[0]))) {
            return undefined;
        }
        declaration = params[0];
    } else {
        return undefined; // the read refers to no local, or to an ambiguous one
    }
    for (const n of uses) {
        if (n === receiver || n === declaration.name) {
            continue;
        }
        if (useRefersToDeclaration (csharp, scope, declaration, n) === false) {
            continue; // a foreign same-name binding's use is not a use of this local
        }
        if (marketRowUseDisqualifies (n)) {
            return undefined;
        }
    }
    return key;
}

// the key tables: a market-row read whose value box is the named type on EVERY writer
// (header, MARKET_ROW_* section). The two sets are disjoint, so a site can only fire once.
function marketRowStringReadType (csharp, initializer) {
    const key = marketRowReadKey (csharp, initializer);
    return (key !== undefined && MARKET_ROW_STRING_KEYS.includes (key)) ? 'string' : undefined;
}

function marketRowBoolReadType (csharp, initializer) {
    const key = marketRowReadKey (csharp, initializer);
    return (key !== undefined && MARKET_ROW_BOOL_KEYS.includes (key)) ? 'bool' : undefined;
}

// `this.hash (request, algorithm, "hex" | "base64" | "binary")` — Exchange.Crypto.cs#Hash
// (digest2 ??= "hex") hands back `binaryToHex (signature)` / Exchange.BinaryToBase64 (signature),
// a string, for every digest but "binary", which returns the signature byte[] itself. The
// hand-written C# signature stays `object` — a digest VARIABLE could be either box (and the
// base file's own comment forbids narrowing it) — so the declaration names the box its own
// digest literal proves, behind the exact cast back:
//   `object x = this.hash (…)`              -> the parameter default null resolves to "hex"
//   `object x = this.hash (…, sha256)`      -> "hex"
//   `object x = this.hash (…, sha256, "hex" | "base64")` -> string
//   `object x = this.hash (…, sha256, "binary")`         -> byte[]
// A non-literal digest argument (or any other argument count) proves nothing and keeps `object`.
// Census (2026-09-18, every `this.hash (` call in cs/ccxt/**): 41 digest-carrying calls, all
// literal "hex" (29) / "binary" (12), plus 20 two-argument calls — no variable digest anywhere.
function hashDigestLiteralType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword || callee.name?.escapedText !== 'hash') {
        return undefined;
    }
    const args = initializer.arguments ?? [];
    if (args.length < 2 || args.length > 3) {
        return undefined;
    }
    if (args.length === 2) {
        return 'string'; // the C# parameter default (null) resolves to "hex"
    }
    const digest = args[2];
    if (digest.kind !== ts.SyntaxKind.StringLiteral) {
        return undefined;
    }
    if (digest.text === 'hex' || digest.text === 'base64') {
        return 'string';
    }
    return (digest.text === 'binary') ? 'byte[]' : undefined;
}

// ---- U20: `add` chains over market-row / symbol leaves --------------------------------
//
// `const symbol = base + '/' + quote` prints `object symbol = add(add(bs, "/"), quote)`.
// The leaves are `object` locals whose VALUE is a string or null (`bs` =
// safeCurrencyCode's string? box; `market['base']` = a market-row string read), so the
// chain's own printed type is `object` and naming the box needs the `(string)` cast the
// printer does not emit — the identity cast the market-row family already uses (null ->
// null, a string -> itself). `add(object, object)` hands back null exactly when its LEFT
// operand is not a string box, and a left-nested `+` chain propagates that through every
// level, so the declaration is `string?` when the LEFTMOST leaf can be null and `string`
// when it cannot (a null RIGHT operand concatenates as "" on both overloads).
//
// Leaf boxes: a string literal, a read of a local whose own value box is a string box (the
// emitted declaration when this module names it, else the join of its initializer and every
// later write), a call whose printed C# signature returns string / string?, a market-row
// read at a MARKET_ROW_STRING_KEYS key, an element read of a proven string list
// (elementAccessElementType) and a `this.<member>` read the base types string / string?.
// Anything else — a parameter, a numeric, an object leaf — keeps the chain `object`.

// the C# box of one `+` operand: 'string' (never null), 'string?' (string or null), else
// undefined. Mirrors the proof shapes isProvablyStringOperand carries, plus the leaf
// families of this rule.
function addChainLeafBoxType (csharp, node, context) {
    switch (node?.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return 'string';
    case ts.SyntaxKind.ParenthesizedExpression:
        return addChainLeafBoxType (csharp, node.expression, context);
    case ts.SyntaxKind.AsExpression:
    case ts.SyntaxKind.TypeAssertionExpression:
        // `x as string` prints `((string)x)`, a string box whatever x was
        return (node.type?.kind === ts.SyntaxKind.StringKeyword) ? 'string' : undefined;
    case ts.SyntaxKind.Identifier: {
        // a local this module declares string / string? (the emitted type IS the box)
        const declared = localIdentifierType (csharp, node);
        if (declared === 'string' || declared === 'string?') {
            return declared;
        }
        // else the value box its own initializer + later writes prove (an `object` local)
        return localValueBoxType (csharp, node, context);
    }
    case ts.SyntaxKind.CallExpression: {
        const own = callReturnType (csharp, node);
        return (own === 'string' || own === 'string?') ? own : undefined;
    }
    case ts.SyntaxKind.PropertyAccessExpression: {
        if (node.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return undefined;
        }
        const memberType = CSHARP_LOCAL_THIS_MEMBER_TYPES[node.name?.escapedText];
        return (memberType === 'string' || memberType === 'string?') ? memberType : undefined;
    }
    case ts.SyntaxKind.ElementAccessExpression: {
        // a market-row read at a string key is a string or null (MARKET_ROW_STRING_KEYS,
        // value census in the header); an element of a proven string list is a string or
        // null off the end of the list (elementAccessElementType's own cast proof)
        if (marketRowStringReadType (csharp, node) === 'string') {
            return 'string?';
        }
        return (elementAccessElementType (csharp, node, context) === 'string') ? 'string?' : undefined;
    }
    }
    return undefined;
}

// declarations whose value box is being joined right now (a cycle must not recurse)
const valueBoxInFlight = new Set ();

// the parent shapes that make the occurrence of a name a WRITE the box scan below cannot
// model: `x++` / `x--` and `-x` / `+x` (the printer's ref sinks), `[x, y] = tuple` (the
// element read the destructuring print assigns back), `...x` and a for-of / for-in target.
// A name under any of them disqualifies the leaf; everything else is a read.
const WRITE_TARGET_SHAPES = [
    ts.SyntaxKind.PostfixUnaryExpression,
    ts.SyntaxKind.PrefixUnaryExpression,
    ts.SyntaxKind.ArrayLiteralExpression,
    ts.SyntaxKind.SpreadElement,
    ts.SyntaxKind.ForOfStatement,
    ts.SyntaxKind.ForInStatement,
];

// the value box of a local read this module leaves `object` (bs = this.safeCurrencyCode
// (...)): the join of the initializer's proven box and every later plain write's, with the
// SAME resolution strictness the read/write scan uses (exactly one binding referring to
// this read, a local, declared before it, a single declarator). A parameter, an ambiguous
// binding, an unprovable or non-string write and a cycle all reject.
function localValueBoxType (csharp, identifier, context) {
    const scope = context?.scope ?? ((typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (identifier) : enclosingFunction (identifier));
    if (scope === undefined) {
        return undefined;
    }
    const index = indexScope (csharp, scope);
    const name = identifier.escapedText;
    if (index.parameterNames.has (name) || index.blockedNames.has (name)) {
        return undefined;
    }
    const declarations = (index.declarations.get (name) ?? []).filter ((candidate) => useRefersToDeclaration (csharp, scope, candidate, identifier) === true);
    if (declarations.length !== 1) {
        return undefined;
    }
    const declaration = declarations[0];
    if (declaration.kind !== ts.SyntaxKind.VariableDeclaration || declaration.name?.kind !== ts.SyntaxKind.Identifier
            || declaration.initializer === undefined || declaration.parent?.declarations?.length !== 1) {
        return undefined;
    }
    try {
        if (declaration.getStart () >= identifier.getStart ()) {
            return undefined; // the local is not provably bound before the read
        }
    } catch (e) {
        return undefined;
    }
    if (valueBoxInFlight.has (declaration)) {
        return undefined;
    }
    valueBoxInFlight.add (declaration);
    try {
        const nested = { scope, stack: new Set (context?.stack ?? []), depth: (context?.depth ?? 0) + 1 };
        if (nested.depth > MAX_RESOLVE_DEPTH) {
            return undefined;
        }
        let box = csharpTypeOfValue (csharp, declaration.initializer, nested);
        if (box !== 'string' && box !== 'string?') {
            return undefined;
        }
        for (const n of (index.identifiers.get (name) ?? [])) {
            if (n === declaration.name || isNotAUse (n)) {
                continue;
            }
            if (useRefersToDeclaration (csharp, scope, declaration, n) === false) {
                continue;
            }
            const parent = n.parent;
            if (!(parent?.kind === ts.SyntaxKind.BinaryExpression && parent.left === n && ASSIGNMENT_OPERATORS.includes (parent.operatorToken.kind))) {
                // an unmodelled write shape (`x++`, `-x` / `+x` as ref sinks, `[x, y] = tuple`,
                // a for-of / for-in target, a spread) could hand the local an arbitrary box: a
                // read cannot change the box, but none of these is a read of the name
                if (WRITE_TARGET_SHAPES.includes (parent?.kind)) {
                    return undefined;
                }
                continue;
            }
            if (parent.operatorToken.kind !== ts.SyntaxKind.EqualsToken && parent.operatorToken.kind !== ts.SyntaxKind.PlusEqualsToken) {
                return undefined; // `x -= v` / `x *= v` / ... prints a numeric helper result back
            }
            const written = csharpTypeOfValue (csharp, parent.right, nested);
            if (written === 'null') {
                box = 'string?'; // a null write keeps the box a string-or-null
            } else if (written !== 'string' && written !== 'string?') {
                return undefined;
            }
        }
        return box;
    } finally {
        valueBoxInFlight.delete (declaration);
    }
}

// the declaration this rule rewrites: `object <name> = <+ chain>` whose every leaf is a
// string box, behind the `(string)` cast. Fence (roster U20): the local is named `symbol`,
// or one leaf is a market-row read — the family the unit owns; the other `+` chains belong
// to the string-left rule of csharpTypeOfValue / the sibling units.
function addChainStringBoxType (csharp, declaration, context) {
    const initializer = declaration.initializer;
    if (initializer?.kind !== ts.SyntaxKind.BinaryExpression || initializer.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        return undefined;
    }
    const leaves = [];
    const collect = (n) => {
        if (n?.kind === ts.SyntaxKind.BinaryExpression && n.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            collect (n.left);
            collect (n.right);
        } else {
            leaves.push (n);
        }
    };
    collect (initializer);
    if (leaves.length < 2) {
        return undefined;
    }
    let hasMarketRowLeaf = false;
    let leftmost;
    for (let i = 0; i < leaves.length; i++) {
        const box = addChainLeafBoxType (csharp, leaves[i], context);
        if (box === undefined) {
            return undefined;
        }
        if (i === 0) {
            leftmost = box;
        }
        if (leaves[i]?.kind === ts.SyntaxKind.ElementAccessExpression && marketRowStringReadType (csharp, leaves[i]) === 'string') {
            hasMarketRowLeaf = true;
        }
    }
    if (declaration.name?.escapedText !== 'symbol' && !hasMarketRowLeaf) {
        return undefined;
    }
    return { type: (leftmost === 'string?') ? 'string?' : 'string', cast: 'string' };
}

// ---- U19: `+` chains over a proven-string BOX leaf --------------------------------------
//
// `object url = add(add(<leaf>, "/"), path)` — the printer takes the leaf's own static type
// to build the chain, so an `object` leaf binds add(object, object) and the chain's C# type
// is object: only a cast can name the value the box already holds. When the leaf's box is
// provably a string or null, both add paths agree: a string leaf concatenates, a null leaf
// takes the object overload's `a is (string)` miss and returns null, any other box throws
// inside the same add call the untyped tree already makes (the sibling string literal forces
// the string branch's `(string)b` cast). So `string? x = ((string)add(...))` — the same
// decl-type + cast pair the market-row declarations carry — names exactly that value, and
// csharpLocalIsSafeToRetype still re-checks every later read and write (a later self-concat
// write of a `string?` is rejected there: its add would return the right operand for a null
// left where the object overload returned null).
//
// Leaf proofs (each one the landed declaration-form proof, reused on the chain operand):
//   market['id']       -> MARKET_ROW_STRING_KEYS          (marketRowStringReadType)
//   this.urls['api']['rest'] -> the describe() literal spells that leaf as a string
//                        (urlsDescribeStringProducer); a DYNAMIC final key stays out —
//                        deepExtend(super.describe (), …) can merge a parent key under the
//                        same section, which the venue's own literal cannot bound
//   this.getWsUrl (…)  -> the one definition (ts/src/pro/binance.ts, pro/binance.cs:259)
//                        returns only urls reads and add chains over them, i.e. a string or
//                        null on every path (census 2026-09-18, 5 return statements)
const STRING_BOX_OBJECT_CALLS = [ 'getWsUrl' ];

// is this leaf — printed statically `object` — provably a string-or-null box? Returns the
// declaration the chain can take plus the cast that names the box (`undefined` when the
// printed chain is already statically `string`: a `this.<string member>` leaf).
const STRING_MEMBER_OBJECT_LEAVES = [ 'apiKey', 'secret', 'password', 'login', 'uid', 'accountId', 'privateKey' ];

function stringBoxLeafProof (csharp, node) {
    let leaf = node;
    while (leaf?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        leaf = leaf.expression;
    }
    if (leaf === undefined || csharpTypeOfValue (csharp, leaf) !== undefined || isProvablyStringOperand (csharp, leaf)) {
        return undefined; // a proven static type (string included) is no longer this rule's business
    }
    if (marketRowStringReadType (csharp, leaf) === 'string' || urlsDescribeStringProducer (leaf)) {
        return { type: 'string?', cast: 'string' };
    }
    // the hand-written base declares these properties `public string <name> { get; set; }`
    // (Exchange.Options.cs, one declaration each, no shadowing anywhere in cs/**): the read's
    // C# static type IS string, so the printed chain already binds the string overloads and
    // takes no cast — and every writer (the base's SafeString, string literals / `(string)`
    // casts in the generated tree, a user assignment the same property type checks) leaves a
    // string or null in the box, which the nullable spelling names.
    if (leaf.kind === ts.SyntaxKind.PropertyAccessExpression && leaf.expression?.kind === ts.SyntaxKind.ThisKeyword
            && STRING_MEMBER_OBJECT_LEAVES.includes (leaf.name?.escapedText)) {
        return { type: 'string?', cast: undefined };
    }
    if (leaf.kind === ts.SyntaxKind.CallExpression) {
        const callee = leaf.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression
            && callee.expression?.kind === ts.SyntaxKind.ThisKeyword
            && STRING_BOX_OBJECT_CALLS.includes (callee.name?.escapedText)) {
            return { type: 'string?', cast: 'string' };
        }
    }
    return undefined;
}

// the LEFTMOST operand of a `+` chain: `a + b + c` parses as `(a + b) + c` and prints
// add(add(a, b), c), so this is the operand whose static type picks the bindable overload
function plusChainLeftmostOperand (initializer) {
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.BinaryExpression || node.operatorToken?.kind !== ts.SyntaxKind.PlusToken) {
        return undefined;
    }
    while (node.left?.kind === ts.SyntaxKind.BinaryExpression && node.left.operatorToken?.kind === ts.SyntaxKind.PlusToken) {
        node = node.left;
    }
    let leaf = node.left;
    while (leaf?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        leaf = leaf.expression;
    }
    return leaf;
}

function plusChainStringBoxLeaf (csharp, initializer) {
    const leaf = plusChainLeftmostOperand (initializer);
    return stringBoxLeafProof (csharp, leaf);
}

function marketRowDictReadType (csharp, initializer) {
    const key = marketRowReadKey (csharp, initializer);
    return (key !== undefined && MARKET_ROW_DICT_KEYS.includes (key)) ? 'dict' : undefined;
}

// The NUMERIC keys (contractSize / strike / expiry / numericId) have NO table: the TS `Num` /
// `Int` spellings cover both boxes and the generated C# stores what each writer prints — a
// `parseNumber`/`safeNumber` double, an int literal, a `safeInteger`/`parse8601` Int64 — so a
// `(double?)` or `(Int64?)` cast would throw on the writers of the other box (census:
// campaigns/cs90/tools/U01/key-value-census.mjs, per-key kind table + REPORT.md). They also have
// zero declaration sites in the generated tree today.

// The DICT keys that stay `object`: `info` has a STRING writer on a market row (independentreserve)
// plus 58 any-typed ones, so no dict cast can name its box; `fees` is not a market-row key at all
// (0 writers); marginModes' identifier writers have no proven C# box — census, proof and reject
// reasons: REPORT.md + campaigns/cs90/tools/U01/key-value-census.mjs.
//
// ---- U07: a checker-proven string value read off a proven dictionary receiver --------------
// `const r = signature['r']`, `const symbol = ticker['symbol']` — the receiver's own declaration
// is a string-keyed dictionary this module typed (S63 above), so the printer binds the static
// twin `GetValue(recv, "r")`, which hands back the raw box at that key. Where the TS checker
// resolves the read through the receiver's declared type to a string — `string`, a
// string-literal union, `Str = string | undefined` — every writer the type system admits at
// that key hands back a string or nothing, exactly the box the market-row string keys name
// (MARKET_ROW_STRING_KEYS). The local is then `string?` behind the `(string)` cast: the cast
// names the box (null off a missing key / a null receiver, `(string)null` -> null, exactly the
// read GetValue does today), and csharpLocalIsSafeToRetype still vetoes every use shape that
// would move an overload (a `string?` left `+` operand, a ref sink, a delete key).
//
// Census (base d847892a6; tools/U07/u07-sites.py + u07-ts-census.mjs): the exchange tree carries
// 186 `object X = GetValue(recv, "lit")` sites; 167 of them read a literal key the checker types
// as string/Str (the other 19: 12 `any`, 6 `Bool` — weex firstMarket['contract'] — and 1
// `Dictionary<any>`, all of which keep `object`). u07-producers.py + u07-producercensus.mjs: the
// 22 producer methods the accepted receivers come from (parseTicker / parseWsTicker /
// parseWsBidAsk / parseTrade / parseWsTrade / parseWsMyTrade / parseOrder / parseWsOrder /
// parseTradingFee / parseFundingRate[Ws] / parseWsPosition / parseCurrency / safeMarket /
// market / currency / getMarketFromClientAndMessage / parseLedgerComment / orderToTrade /
// ecdsa) hold 1,278 writes at those keys, 1,268 of them checker-typed string / Str /
// string-literal / undefined. The 10 non-string-typed values (pro/hitbtc parseWsOrderTrade
// boxes a market ROW at 'symbol', pro/bitrue `any` symbols, four currency-id / networks `any`s)
// all sit in (venue, producer, key) groups that NO accepted site reads — 0 of the 137 accepted
// groups overlap (u07-audit). `signature`'s producer is the hand-written Ecdsa
// (Exchange.Crypto.cs), whose "r"/"s" are ToHex strings and "v" a recovery int: the read of "v"
// is a number and stays `object`.
function typedDictStringReadType (csharp, initializer) {
    // the same receiver proof the printer's S63 twin uses, so this only names reads the emitted
    // call already binds to GetValue(IDictionary<string, object>, string)
    if (typedDictElementAccessReceiver (csharp, initializer) === undefined) {
        return undefined;
    }
    if (elementAccessLiteralKey (initializer.argumentExpression) === undefined) {
        return undefined;
    }
    if (typeof csharp.getChecker !== 'function') {
        return undefined;
    }
    let elementType;
    try {
        elementType = csharp.getChecker ().getTypeAtLocation (initializer);
    } catch (e) {
        return undefined;
    }
    return typeIsStringOrNullish (elementType) ? 'string' : undefined;
}

// is the checker's type a string, or a union whose every member is a string / a string literal
// / undefined / null? (`Str = string | undefined`, a literal union like MarketType). `any`,
// `unknown`, `number`, `bool`, a dictionary and a mixed union all answer false.
function typeIsStringOrNullish (type) {
    if (type === undefined) {
        return false;
    }
    const STRINGISH = ts.TypeFlags.String | ts.TypeFlags.StringLiteral;
    const NULLISH = ts.TypeFlags.Undefined | ts.TypeFlags.Null;
    if ((type.flags & STRINGISH) !== 0) {
        return true;
    }
    if ((type.flags & ts.TypeFlags.Union) !== 0 && Array.isArray (type.types)) {
        return type.types.length > 0
            && type.types.every ((member) => ((member.flags & (STRINGISH | NULLISH)) !== 0))
            && type.types.some ((member) => (member.flags & STRINGISH) !== 0);
    }
    return false;
}
// ---- describe()-literal url reads ------------------------------------------------------
// `const x = this.urls['api']['ws']` prints `object x = getValue(getValue(this.urls, "api"),
// "ws")`. `this.urls` is filled by Exchange.Options.cs#initializeProperties from
// `deepExtend (describe (), userConfig)["urls"]`, and the file's describe() merges its own
// literal over base.describe()'s all-null urls: deepExtend keeps the literal's box for every
// key the literal spells (a plain Dictionary value beside a null base value is assigned
// through, and two Dictionary values are merged into a fresh Dictionary), so every leaf the
// file's literal writes as a string IS the string box the getValue chain hands back. The
// local can be declared `string?` with the `(string)` cast the printer does not emit — the
// cast names that box (and null off a missing key / null receiver, exactly as today).
//
// Whole-section swaps are the only runtime rewrites of this map: the hand-written base
// setSandboxMode assigns `urls['api'] = this.clone (urls['test'])`, binance/bybit swap
// `urls['api'] = urls['demo' | 'demotrading']` in their own describe file — tree-wide census:
// every write is of that shape (10 sites, no per-key write anywhere in ts/src). Each other
// root property of the literal is therefore checked at the same suffix key path, and the
// local stays `object` unless it is
//   - an object literal whose suffix resolves to a string, null, or a key the literal does
//     not spell (GetValue returns null -> `(string)null`), or
//   - a scalar/string/null literal (a `logo` / `www` / `doc`-style section, a string 'test'):
//     a key read off it throws `Convert.ToInt32` inside GetValue, hands back a one-char
//     string or falls through to null — never a non-string box, and the throw happens inside
//     the same call as today, before the added cast can run.
// A sibling object section resolving to a dictionary / list / number / bool, a non-literal
// section, and any chain key that is all digits (a numeric index into a list-shaped section
// would hand back an arbitrary element) keep the local `object`.
//
// Deliberately left `object` (census in the campaign report):
//   - a dynamic key (`this.urls['api'][api]`): every sibling section's every value would have
//     to agree, and the literal's keys are not the map's keys at runtime (setSandboxMode /
//     binance write whole sections back)
//   - a chain of length 1 (`this.urls['api']`, the section dictionary itself): every file that
//     has one also has a list-valued section ('doc'), so a whole-section swap could put a
//     List<object> box where the literal spells a dictionary
//   - `this.options['key']` for every key EXCEPT the ones in OPTIONS_LITERAL_STRING_KEYS
//     below: `options` is a ConcurrentDictionary the whole codebase assigns into
//     (`this.options['chainId'] = 11155111` in ts/src/dydx.ts, `['requestId']` = Int64
//     in the ws clients, `['tickerSubs']` = a safe dictionary, user config at construction),
//     so a describe()-literal type says nothing about the box at the read
//
// ---- this.options reads with a per-key writer census (U05) -----------------------------
// `const chainName = this.options['chainName']` prints `getValue(this.options, "chainName")`.
// The key is the ONE options key whose whole-corpus writer census is a string on every path:
//   - ts/src/dydx.ts describe(): options.chainName = 'dydx-mainnet-1' (a string literal);
//   - ts/src/dydx.ts setSandboxMode(): this.options['chainName'] = 'dydx-testnet-4' (a string).
// No other `options['chainName']` / `options[<literal>]` writer exists in ts/src (all
// `this.options['<name>'] = ` sites censused), and the three DYNAMIC write shapes cannot
// produce that key: `this.options[cacheKey] = cached` with cacheKey = 'tradeMarketsById'
// (ts/src/prediction/opinion.ts), `this.options[marketType|type] = ...` with a market type
// (ts/src/pro/binance.ts), and `this.options[helper] = sourceExchange.options[helper]` with
// helper from a `marketHelperProps` list — the corpus defines exactly three such lists
// (hyperliquid ['hip3TokensByName','cachedCurrenciesById'], kraken ['marketsByAltname',
// 'delistedMarketsById'], pacifica []). The base C# has no other options write
// (Exchange.Options.cs#initializeProperties: describe() + user config). Every value the key
// can hold is therefore a string, so the read is `string?` behind the `(string)` cast —
// null only when a file's literal does not spell the key, which the rule requires it to.
const OPTIONS_LITERAL_STRING_KEYS = [ 'chainName' ];

// `this.options['<census key>']` in a file whose own describe() literal spells that key as a
// string. The receiver is the literal `this.options` property (never a copy).
function optionsLiteralStringProducer (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return false;
    }
    const key = elementAccessLiteralKey (initializer.argumentExpression);
    if (key === undefined || !OPTIONS_LITERAL_STRING_KEYS.includes (key)) {
        return false;
    }
    const receiver = initializer.expression;
    if (receiver?.kind !== ts.SyntaxKind.PropertyAccessExpression
        || receiver.name?.escapedText !== 'options'
        || receiver.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    const options = describeLiteralProperty (ownDescribeLiteral (initializer.getSourceFile ()), 'options');
    const spelled = describeLiteralProperty (options, key);
    return spelled !== undefined && describeLiteralKind (spelled) === 'string';
}

// the file's own describe() literal — the object the generated describe() merges into
// base.describe(). Cached per source file: one entry per file the classifier asks about.
const describeOwnLiterals = new WeakMap ();

// `return this.deepExtend (super.describe (), this.describeData ())`: the urls literal then lives
// in a SIBLING method of the same file. Resolve it through a zero-argument `this.<name>()` call
// when the file defines that method exactly once and its body returns an object literal — the
// merge target is the same object the literal would have been, so the value census is unchanged.
// A method defined more than once (or not returning a literal) keeps the local `object`.
function describeOwnLiteralMethodCall (sourceFile, expression) {
    if (expression?.kind !== ts.SyntaxKind.CallExpression
        || expression.expression?.kind !== ts.SyntaxKind.PropertyAccessExpression
        || expression.expression.expression?.kind !== ts.SyntaxKind.ThisKeyword
        || (expression.arguments?.length ?? 0) !== 0) {
        return undefined;
    }
    const name = expression.expression.name?.escapedText;
    if (name === undefined) {
        return undefined;
    }
    const definitions = [];
    const collect = (node) => {
        if (node.kind === ts.SyntaxKind.MethodDeclaration && node.name?.escapedText === name) {
            definitions.push (node);
        }
        ts.forEachChild (node, collect);
    };
    collect (sourceFile);
    if (definitions.length !== 1) {
        return undefined;
    }
    // the body must be exactly `return <object literal>;` — an early/conditional return or a
    // body that also mutates would make "the literal" ambiguous
    const statements = definitions[0].body?.statements ?? [];
    if (statements.length !== 1 || statements[0].kind !== ts.SyntaxKind.ReturnStatement) {
        return undefined;
    }
    let node = statements[0].expression;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    return (node?.kind === ts.SyntaxKind.ObjectLiteralExpression) ? node : undefined;
}

function ownDescribeLiteral (sourceFile) {
    if (describeOwnLiterals.has (sourceFile)) {
        return describeOwnLiterals.get (sourceFile);
    }
    let literal;
    const visit = (node) => {
        if (node.kind === ts.SyntaxKind.MethodDeclaration && node.name?.escapedText === 'describe') {
            const returned = node.body?.statements?.find ((statement) => statement.kind === ts.SyntaxKind.ReturnStatement);
            let expression = returned?.expression;
            while (expression?.kind === ts.SyntaxKind.ParenthesizedExpression) {
                expression = expression.expression;
            }
            // `return this.deepExtend (super.describe (), {...})` — the literal is the last argument
            if (expression?.kind === ts.SyntaxKind.CallExpression
                && expression.expression?.kind === ts.SyntaxKind.PropertyAccessExpression
                && expression.expression.name?.escapedText === 'deepExtend' && expression.arguments?.length >= 2) {
                expression = expression.arguments[expression.arguments.length - 1];
                while (expression?.kind === ts.SyntaxKind.ParenthesizedExpression) {
                    expression = expression.expression;
                }
            }
            if (expression?.kind === ts.SyntaxKind.ObjectLiteralExpression) {
                literal = expression;
            } else {
                // `this.deepExtend (super.describe (), this.describeData ())` — the literal is
                // the sibling method's returned object literal (see describeOwnLiteralMethodCall)
                literal = describeOwnLiteralMethodCall (sourceFile, expression);
            }
        }
        ts.forEachChild (node, visit);
    };
    visit (sourceFile);
    describeOwnLiterals.set (sourceFile, literal);
    return literal;
}

function describeLiteralKey (property) {
    const name = property.name;
    if (name?.kind === ts.SyntaxKind.StringLiteral || name?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        return name.text;
    }
    return name?.kind === ts.SyntaxKind.Identifier ? name.escapedText : undefined;
}

function describeLiteralProperty (literal, key) {
    if (literal?.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
        return undefined;
    }
    for (const property of literal.properties) {
        if (property.kind === ts.SyntaxKind.PropertyAssignment && describeLiteralKey (property) === key) {
            return property.initializer;
        }
    }
    return undefined;
}

// the box a describe() literal value prints as, or undefined when the printer does not print
// it as one of these (a call, an identifier, a spread, ...)
function describeLiteralKind (value) {
    let node = value;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    switch (node?.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return 'string';
    case ts.SyntaxKind.ObjectLiteralExpression:
        return 'dictionary';
    case ts.SyntaxKind.ArrayLiteralExpression:
        return 'list';
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
        return 'bool';
    case ts.SyntaxKind.NumericLiteral:
        return 'number';
    case ts.SyntaxKind.PrefixUnaryExpression:
        return node.operand?.kind === ts.SyntaxKind.NumericLiteral ? 'number' : undefined;
    case ts.SyntaxKind.NullKeyword:
        return 'null';
    case ts.SyntaxKind.Identifier:
        return node.escapedText === 'undefined' ? 'null' : undefined;
    }
    return undefined;
}

// the kind at an all-literal path inside a describe() literal: 'absent' when the path is not
// spelled (GetValue returns null there), undefined when the path runs into a value with no
// literal kind
function describeLiteralPathKind (literal, keys) {
    let node = literal;
    for (const key of keys) {
        node = describeLiteralProperty (node, key);
        if (node === undefined) {
            return 'absent';
        }
    }
    return describeLiteralKind (node);
}

// `x as Dict` / `x as List` / `x as unknown` / an interface or class assertion print the BARE
// operand (ast-transpiler printAsExpression falls through for every type it does not cast), so
// `(this.urls['api'] as Dict)['ws']` emits exactly the `getValue(getValue(this.urls, "api"), "ws")`
// chain — the read's value box is untouched by the assertion. Only the three spellings that DO
// print a cast (`as any` -> ((object)x), `as string` -> ((string)x), `as any[]` -> (IList<object>)(x))
// keep the chain unreachable here.
function asExpressionPrintsBare (node) {
    const type = node.type;
    if (type === undefined) {
        return false;
    }
    if (type.kind === ts.SyntaxKind.AnyKeyword || type.kind === ts.SyntaxKind.StringKeyword) {
        return false;
    }
    if (type.kind === ts.SyntaxKind.ArrayType && type.elementType?.kind === ts.SyntaxKind.AnyKeyword) {
        return false;
    }
    return true;
}

// the chain of string-literal keys of `this.urls[k1][k2]...`, or undefined. A dynamic key is
// rejected outright, as is an all-digit key (a numeric index into a list-shaped section would
// hand back an arbitrary element box) and a chain shorter than 2 keys.
function urlsLiteralChain (initializer) {
    let node = initializer;
    const keys = [];
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression || node?.kind === ts.SyntaxKind.ElementAccessExpression
            || node?.kind === ts.SyntaxKind.AsExpression) {
        if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
            node = node.expression;
            continue;
        }
        if (node.kind === ts.SyntaxKind.AsExpression) {
            if (!asExpressionPrintsBare (node)) {
                return undefined;
            }
            node = node.expression;
            continue;
        }
        const key = node.argumentExpression;
        if (key?.kind !== ts.SyntaxKind.StringLiteral && key?.kind !== ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
            return undefined;
        }
        if (/^[0-9]+$/.test (key.text)) {
            return undefined;
        }
        keys.unshift (key.text);
        node = node.expression;
    }
    if (keys.length < 2 || node?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return undefined;
    }
    if (node.expression?.kind !== ts.SyntaxKind.ThisKeyword || node.name?.escapedText !== 'urls') {
        return undefined;
    }
    return keys;
}

// does this initialiser's runtime box provably hold a string or null? (see the family comment)
function urlsDescribeStringProducer (initializer) {
    const keys = urlsLiteralChain (initializer);
    if (keys === undefined) {
        return false;
    }
    const urls = describeLiteralProperty (ownDescribeLiteral (initializer.getSourceFile ()), 'urls');
    if (urls?.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
        return false;
    }
    if (describeLiteralPathKind (urls, keys) !== 'string') {
        return false;
    }
    const suffix = keys.slice (1);
    for (const property of urls.properties) {
        if (property.kind !== ts.SyntaxKind.PropertyAssignment || describeLiteralKey (property) === keys[0]) {
            continue;
        }
        const value = property.initializer;
        if (value?.kind === ts.SyntaxKind.ObjectLiteralExpression) {
            const kind = describeLiteralPathKind (value, suffix);
            if (kind !== 'string' && kind !== 'null' && kind !== 'absent') {
                return false;
            }
        } else {
            const kind = describeLiteralKind (value);
            if (kind !== 'string' && kind !== 'null' && kind !== 'number' && kind !== 'bool') {
                return false;
            }
        }
    }
    return true;
}

// `const markets = this.markets;` / `const fees = this.fees;` — the two BaseExchange members
// are hand-declared `object` (cs/ccxt/base/Exchange.Options.cs), but every writer of each
// member boxes an IDictionary<string, object> and nothing else: markets = null /
// this.createSafeDictionary () (a ConcurrentDictionary / CustomConcurrentDictionary, declared
// IDictionary) / this.mapToSafeMap (...) (an explicit IDictionary cast) /
// `SafeValue (extendedProperties, "markets") as dict` (a Dictionary<string, object> or null) /
// the sibling `sourceExchange.markets` (this same member) plus the generated prediction-tier
// writes (this.createSafeDictionary ()); fees = `new dict ()` / the same `as dict` read. The
// read's box therefore can never be anything else, so the declaration names it behind the
// exact interface cast (a null flows through the cast unchanged). Only the DECLARATION is
// named: a later write of the same member keeps the printer's `object` — there is no
// write-cast machinery — so the join stays conservative and such a site keeps `object`.
const MEMBER_DICT_READ_TYPES = { 'markets': 'IDictionary<string, object>', 'fees': 'IDictionary<string, object>' };

function memberDictReadCastType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.PropertyAccessExpression || initializer.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const name = initializer.name?.escapedText;
    return Object.prototype.hasOwnProperty.call (MEMBER_DICT_READ_TYPES, name) ? MEMBER_DICT_READ_TYPES[name] : undefined;
}

// `const parts = this.arraySlice (idParts, 1)` — the hand-written Exchange.cs helper is
// declared `object`. Its non-byte[] paths all hand back the fresh List<object> they re-box
// (`parsedArray.ToArray ()[..].ToList ()`, the ArrayCache ToArray path included), and a
// byte[] receiver WITHOUT a `second` argument also returns that List<object>; only a byte[]
// receiver WITH a `second` returns the byte[] slice itself. byte[] arrives in TS as
// Uint8Array (an object type, never an ArrayType), so the checker's array verdict on the
// receiver is exactly the "this call cannot return a byte[] slice" proof: a TS array of any
// element type re-boxes to List<object> on every path. The declaration-only spelling keeps
// later writes of the same call `object` (no write-cast machinery).
function arraySliceCallIsProvenList (csharp, initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword
            || callee.name?.escapedText !== 'arraySlice') {
        return false;
    }
    const receiver = initializer.arguments?.[0];
    if (receiver === undefined || typeof csharp.getChecker !== 'function') {
        return false;
    }
    let type;
    try {
        type = csharp.getChecker ().getTypeAtLocation (receiver);
    } catch (e) {
        return false;
    }
    return type !== undefined && (type.flags & ts.TypeFlags.Object) !== 0
        && (type.objectFlags & ts.ObjectFlags.Reference) !== 0
        && type.target?.symbol?.name === 'Array';
}
// ---- `this.handleOption (method, key, <literal>)` / `this.safeValue (this.options, key,
//      <literal>)` with a per-key writer census (U41) ---------------------------------------
// `handleOption` (Exchange.BaseMethods.cs) resolves through handleOptionAndParams with an EMPTY
// params dict, so no caller input can reach the value: it is `options[method][key]`, else
// `options[method]['default'+Key]`, else `options[key]`, else `options['default'+Key]`, else the
// call's own defaultValue — and `safeValue (this.options, key, default)` is that read at the
// top-level path. The box is therefore the value some writer stored at one of those paths, or the
// default literal, which is a type token the site already spells.
//
// Census (whole ts/src corpus, writers of the four lookup paths of every path in the table):
//   bool   watchOrderBook/checksum (7 describe literals), watchPositions/fetchPositionsSnapshot
//          (12), watchPositions/awaitPositionsSnapshot (12), watchPosition/fetchPositionSnapshot,
//          watchPosition/awaitPositionSnapshot, watchBalance/fetchBalanceSnapshot (7),
//          createOrder/quoteOrderQty (5), fetchMarkets/loadAllOptions (2),
//          fetchMarkets/loadExpiredOptions, fetchMarkets/usePrivateInstrumentsInfo,
//          createOrder/warnOnSTPForInverse, setMarginMode/throwMarginModeAlreadySet,
//          transfer/fillResponseFromRequest (6), postActionRequest/builderFee (15 incl. the
//          `this.options['builderFee'] = false` writes of aster/grvt/hyperliquid/lighter)
//   string fetchMarkets|fetchBalance|fetchOrdersByStates|createOrder|cancelOrders/method (44
//          describe literals), fetchOrderBook/precision, code (5), fetchMarketsMethod,
//          fetchTickerMethod
// Every writer is a literal of ONE kind (no `null`/`undefined`/expression writer), no writer
// takes the value from user params (`params` / `parameters` / `omit` / `setOptions`), and the only
// DYNAMIC `this.options[<expr>] =` shapes in ts/src cannot produce these keys: `options[cacheKey]
// = cached` with cacheKey = 'tradeMarketsById' (ts/src/prediction/opinion.ts), `options[helper] =
// sourceExchange.options[helper]` with helper from a `marketHelperProps` list (the corpus defines
// exactly three such lists: hyperliquid / kraken / pacifica), `options[marketType|type] = this.extend
// (options, {...})` in ts/src/pro/binance.ts (market-type names only). The hand-written C# base
// writes options only from describe() and the user config (Exchange.Options.cs#initializeProperties
// / extendExchangeOptions), and the only test-tree write of one of these keys is
// `exchange.options['checksum'] = false` (ts/src/test/tests.ts#testMethod, the branch the C# driver
// takes; cs/tests/Generated/TestMethods.cs carries the same bool write).
//
// Rejected with that census: an `int` default (the C# literal boxes as Int32, so an Int64 cast
// throws — 10 sites, mostly watchOrderBook/snapshotDelay), a default whose key has no writer or
// disagreeing writers (pacifica defaultSlippage: hyperliquid writes a double at the same key), a
// collection default (another family's box), and every no-default call (the absent value is a
// null the site never spells).
const OPTIONS_LITERAL_DEFAULT_CAST_KINDS = {
    // this.handleOption (method, key, <literal>)
    'cancelOrders/method': 'string',
    'createOrder/method': 'string',
    'createOrder/quoteOrderQty': 'bool',
    'createOrder/warnOnSTPForInverse': 'bool',
    'fetchBalance/method': 'string',
    'fetchMarkets/loadAllOptions': 'bool',
    'fetchMarkets/loadExpiredOptions': 'bool',
    'fetchMarkets/method': 'string',
    'fetchMarkets/usePrivateInstrumentsInfo': 'bool',
    'fetchOrderBook/precision': 'string',
    'fetchOrdersByStates/method': 'string',
    'postActionRequest/builderFee': 'bool',
    'setMarginMode/throwMarginModeAlreadySet': 'bool',
    'transfer/fillResponseFromRequest': 'bool',
    'watchBalance/fetchBalanceSnapshot': 'bool',
    'watchOrderBook/checksum': 'bool',
    'watchPosition/awaitPositionSnapshot': 'bool',
    'watchPosition/fetchPositionSnapshot': 'bool',
    'watchPositions/awaitPositionsSnapshot': 'bool',
    'watchPositions/fetchPositionsSnapshot': 'bool',
    // this.safeValue (this.options, key, <literal>)
    'code': 'string',
    'fetchMarketsMethod': 'string',
    'fetchTickerMethod': 'string',
};

// ast-transpiler's printAsExpression casts only `as any` -> `((object)x)`, `as string` ->
// `((string)x)` and `as any[]` -> `(IList<object>)(x)`; every other asserted type prints the
// bare operand (ts/src/binance.ts#createOrder's `… as Bool` emits the plain call)
function optionsLiteralAsPrintsBare (node) {
    const type = node.type;
    if (type === undefined) {
        return false;
    }
    if (type.kind === ts.SyntaxKind.AnyKeyword || type.kind === ts.SyntaxKind.StringKeyword) {
        return false;
    }
    if (type.kind === ts.SyntaxKind.ArrayType && type.elementType?.kind === ts.SyntaxKind.AnyKeyword) {
        return false;
    }
    return true;
}

// the option key path a `this.handleOption (method, key, default)` /
// `this.safeValue (this.options, key, default)` call reads, or undefined for every other shape
// (a non-literal method / key, a copied receiver, a different arity, an assertion that prints a cast)
function optionsLiteralDefaultParts (initializer) {
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression
            || (node?.kind === ts.SyntaxKind.AsExpression && optionsLiteralAsPrintsBare (node))) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const args = node.arguments ?? [];
    if (args.length !== 3) {
        return undefined;
    }
    const key = args[1]?.kind === ts.SyntaxKind.StringLiteral ? args[1].text : undefined;
    if (key === undefined) {
        return undefined;
    }
    if (callee.name?.escapedText === 'handleOption') {
        const method = args[0]?.kind === ts.SyntaxKind.StringLiteral ? args[0].text : undefined;
        return (method === undefined) ? undefined : { path: method + '/' + key, defaultValue: args[2] };
    }
    if (callee.name?.escapedText === 'safeValue') {
        const receiver = args[0];
        if (receiver?.kind !== ts.SyntaxKind.PropertyAccessExpression
            || receiver.expression?.kind !== ts.SyntaxKind.ThisKeyword
            || receiver.name?.escapedText !== 'options') {
            return undefined;
        }
        return { path: key, defaultValue: args[2] };
    }
    return undefined;
}

// the default literal's kind as the census table spells it: `true`/`false` -> bool, a NON-EMPTY
// string literal -> string (the empty string is the "absent" value safeValueN skips)
function optionsLiteralDefaultKind (node) {
    if (node?.kind === ts.SyntaxKind.TrueKeyword || node?.kind === ts.SyntaxKind.FalseKeyword) {
        return 'bool';
    }
    if (node?.kind === ts.SyntaxKind.StringLiteral && node.text.length > 0) {
        return 'string';
    }
    return undefined;
}

// the C# box of a call whose option key's whole-corpus writer census equals the site's own
// default literal kind — named behind the exact cast back (the call's C# type is `object`)
function optionsLiteralDefaultCastType (initializer) {
    const parts = optionsLiteralDefaultParts (initializer);
    if (parts === undefined) {
        return undefined;
    }
    const expected = OPTIONS_LITERAL_DEFAULT_CAST_KINDS[parts.path];
    if (expected === undefined || optionsLiteralDefaultKind (parts.defaultValue) !== expected) {
        return undefined;
    }
    return expected;
}

// `this.omit (recv, keys)` with exactly two arguments — the only shape that binds one of the
// dict-receiver overloads of cs/ccxt/base/Exchange.Functions.cs. The `params object[]` overload
// owns the 1-argument and 3+-argument calls and still boxes `object`.
function omitCallReceiver (node) {
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    if (callee.name?.escapedText !== 'omit') {
        return undefined;
    }
    const args = node.arguments;
    if (args === undefined || args.length !== 2) {
        return undefined;
    }
    return args[0];
}

// does the receiver bind one of the dict-receiver overloads of Exchange.Functions.cs?
// A local this module (or the printer) declares `Dictionary<string, object>` or
// `IDictionary<string, object>` — both overload families hand back the fresh outDict — an
// object literal, or a hand-written base call whose signature already returns one of the two
// (extend/deepExtend, plus the Dictionary / IDictionary entries of the return tables). An
// `object` receiver stays out: the IList<object> pass-through is reachable for it (table note).
function omitReceiverIsDictionary (csharp, receiver) {
    let node = receiver;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.Identifier) {
        const type = identifierType (csharp, node);
        return (type === 'Dictionary<string, object>') || (type === 'IDictionary<string, object>');
    }
    if (node.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        return true;
    }
    if (node.kind === ts.SyntaxKind.CallExpression) {
        const callee = node.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
            const name = callee.name?.escapedText;
            if (name === 'extend' || name === 'deepExtend') {
                return true; // Exchange.Generic.cs: `public Dictionary<string, object> extend/deepExtend`
            }
        }
        const type = callReturnType (csharp, node);
        return (type === 'Dictionary<string, object>') || (type === 'IDictionary<string, object>');
    }
    return false;
}

// `const x = this.omit (<Dictionary / IDictionary box>, keys)`: the call binds a dict-receiver
// overload, whose every path hands back the fresh outDict (neither a Dictionary nor an
// IDictionary<string, object> receiver is ever the pass-through branch). The call's own C#
// type is therefore the declaration — no cast.
function omitDictionaryProducer (csharp, node, context) {
    let initializer = node;
    while (initializer?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        initializer = initializer.expression;
    }
    const receiver = omitCallReceiver (initializer);
    return (receiver !== undefined) && omitReceiverIsDictionary (csharp, receiver);
}

// `x = this.omit (x, keys)` — a Dictionary accumulator writing through omit. The value reads the
// local whose declaration is being decided, so its C# type cannot be read off the declaration:
// the join has already proven every earlier contribution is a Dictionary box, and omit hands the
// fresh outDict back for a Dictionary receiver (same proof as omitDictionaryProducer), so this
// write contributes that same type.
function selfOmitWriteType (csharp, context, declaration, value) {
    let node = value;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    const receiver = omitCallReceiver (node);
    if (receiver === undefined) {
        return undefined;
    }
    let read = receiver;
    while (read?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        read = read.expression;
    }
    return isSelfRead (csharp, read, declaration) ? 'Dictionary<string, object>' : undefined;
}

// `x = c ? D : x` / `x = c ? x : D` — the "default when unset" idiom. Exactly one arm reads
// the very local the accumulator is deciding (isSelfRead), so that read has no C# type until
// the declaration is fixed: the write's contribution is the OTHER arm's proven type
// (conditionalArmType — literals, typed locals, `this.<base member>` reads, calls the return
// tables name). The self arm's own type IS the declaration being decided, so the caller's
// join fixes the spelling exactly like any other write — a box the running type cannot hold
// keeps the local `object` (joinTypes / assignable). ARMS ONLY and this RHS shape only:
// nothing else in the module consults this, so a `c ? D : x` outside an assignment's right
// side, and every non-conditional value, are untouched.
function selfTernaryWriteType (csharp, context, declaration, value) {
    if (declaration?.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined; // a parameter's C# signature is retyped after printing (typeCoreArgs)
    }
    let node = value;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.ConditionalExpression) {
        return undefined;
    }
    const selfTrue = isSelfRead (csharp, node.whenTrue, declaration);
    const selfFalse = isSelfRead (csharp, node.whenFalse, declaration);
    if (selfTrue === selfFalse) {
        return undefined; // both arms read this local, or neither does
    }
    return conditionalArmType (csharp, selfTrue ? node.whenFalse : node.whenTrue, context);
}

// `c ? parseInt (v) : null` / `null : parseInt (v)`: the arms' own C# types are `object` (the
// hand-written `public static object parseInt (object a)` in Exchange.TranspileHelpers.cs) and
// null, so the conditional has no nameable C# type — but its BOX is exact on every path, so the
// declaration names `Int64?` behind one boundary cast on the whole expression
// (`((Int64?)(...))`), the same shape the other cast-carrying producers emit. Exact because
// parseInt has a single value path: `parsedValue = (Convert.ToInt64 (Math.Floor
// (Convert.ToDouble (a))))` — an Int64 box — inside a try, and null when the conversion throws;
// no Int32 / double / string return path exists (read off the hand-written body, not the TS
// annotation). EVERY arm must be null-ish or a parseInt call: any other arm can hold an
// arbitrary box, and naming it would make the cast the deliverable's own risk.
function parseIntTernaryCastType (initializer) {
    let node = initializer;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node?.kind !== ts.SyntaxKind.ConditionalExpression) {
        return undefined;
    }
    let sawParseInt = false;
    for (const raw of [ node.whenTrue, node.whenFalse ]) {
        let arm = raw;
        while (arm?.kind === ts.SyntaxKind.ParenthesizedExpression) {
            arm = arm.expression;
        }
        if (arm?.kind === ts.SyntaxKind.NullKeyword || (arm?.kind === ts.SyntaxKind.Identifier && arm.escapedText === 'undefined')) {
            continue;
        }
        if (arm?.kind === ts.SyntaxKind.CallExpression && arm.expression?.kind === ts.SyntaxKind.Identifier && arm.expression.escapedText === 'parseInt') {
            sawParseInt = true;
            continue;
        }
        return undefined;
    }
    return sawParseInt ? 'Int64?' : undefined;
}

// `const x = this.omitZero (v)` — printed `this.omitZero (v)`. The hand-written C# helper
// (cs/ccxt/base/Exchange.Generic.cs) returns null for a double / Int64 / numeric-string ZERO
// and hands every other box straight back, so for an argument whose C# static type is string
// (the safeString family, a string-typed local) the call's box is always a string or null,
// which the base's `string? omitZero (string?)` overload returns as that exact type — so the
// declaration carries the nullable spelling with no cast. Any other proven argument type is
// NOT provable — omitZero would hand a non-string box (a double-typed parseNumber result, ...)
// straight through — and a nested
// producer with no proven C# type (fromEp / fromEv / safeValue2 / ...) keeps the call
// unprovable exactly as before.
function omitZeroStringProducer (csharp, node, context) {
    let initializer = node;
    while (initializer?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        initializer = initializer.expression;
    }
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    if (callee.name?.escapedText !== 'omitZero') {
        return false;
    }
    const argument = initializer.arguments?.[0];
    if (argument === undefined) {
        return false;
    }
    const argumentType = csharpTypeOfValue (csharp, argument, context);
    return argumentType === 'string' || argumentType === 'string?';
}

// `this.safeIntegerProduct2 (obj, key1, key2, multiplier)` — hand-written in
// cs/ccxt/base/Exchange.SafeMethods.cs and declared `object`:
//     var result = safeValueN (obj, new List<object> { key1, key2 }, defaultValue);
//     object parsedValue = null;
//     try { parsedValue = Convert.ToInt64 ((Convert.ToDouble (result) * Convert.ToDouble (multiplier))); } catch { }
//     return parsedValue == null ? defaultValue : parsedValue;
// With no default passed, `defaultValue` stays null, so every return path is the caller's
// null or the Convert.ToInt64 box — an Int64 or null, never anything else. Only the
// 4-argument form (the default left out) is provable: a 5-argument call can hand an
// arbitrary object back and keeps `object`.
const SAFE_INTEGER_PRODUCT2_TYPE = 'Int64?';

function safeIntegerProduct2CallCastType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    if (callee.name?.escapedText !== 'safeIntegerProduct2') {
        return undefined;
    }
    return (initializer.arguments?.length === 4) ? SAFE_INTEGER_PRODUCT2_TYPE : undefined;
}

// `this.safeString (obj, key, <default>)` and its family (safeString2/N, safeStringLower*,
// safeStringUpper*): the hand-written C# helper returns the found non-empty string, a numeric's
// invariant string, or `defaultValue as string`, so a PROVEN non-null string default makes
// every return path a non-null string — the last argument is the default only at exact arity.
const NON_NULL_DEFAULT_SAFE_STRING_ARITY = {
    'safeString': 3, 'safeString2': 4, 'safeStringN': 3,
    'safeStringLower': 3, 'safeStringLower2': 4, 'safeStringLowerN': 3,
    'safeStringUpper': 3, 'safeStringUpper2': 4, 'safeStringUpperN': 3,
};

function nonNullStringDefaultCall (csharp, node, context) {
    let initializer = node;
    while (initializer?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        initializer = initializer.expression;
    }
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    const arity = NON_NULL_DEFAULT_SAFE_STRING_ARITY[callee.name?.escapedText];
    if (arity === undefined || initializer.arguments?.length !== arity) {
        return false;
    }
    return csharpTypeOfValue (csharp, initializer.arguments[arity - 1], context) === 'string';
}

// the C# declaration for `declaration`: the type plus the value rewrite it needs, or
// undefined to keep the printer's output. `context` is only set while resolving another
// declaration's write/initializer through resolveLocalReadType; a top-level call (the
// printer) starts a fresh resolution.
export function csharpLocalDeclaration (csharp, declaration, context) {
    if (declaration?.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    // an uninitialised declaration prints `object x = null;` — the initialiser the null-declared
    // family joins; consulted for a collection annotation or a union the table cannot name
    // (the writes then decide the box); a scalar annotation keeps the printer's `object`
    const noInitAnnotation = annotationType (declaration);
    // a PREDICTION-tier `let x: Num;` / `: Str;` / `: Int;` / `: Bool;` (no initialiser) prints
    // `object x = null;`: the annotation names the box the later writes all store, and the retype
    // scan below still rejects a write that box cannot hold (see the scalar-annotation arm in
    // csharpLocalTypeOf). The crypto/pro trees keep the printer's `object` — their null-declared
    // families belong to the units that own those tiers.
    const noInitScalar = noInitAnnotation !== undefined && !COLLECTION_LOCAL_TYPES.includes (noInitAnnotation) && isPredictionSource (declaration);
    if (declaration.initializer === undefined && !noInitScalar && !(declaration.type !== undefined
            && (noInitAnnotation === undefined || COLLECTION_LOCAL_TYPES.includes (noInitAnnotation) || u17FamilyName (declaration) !== undefined))) {
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

// ===== the `as any` receiver copies of the safeList* producers =====
//
// `const rows = this.safeList (response, 'data') as any` is the only TS shape whose C#
// declaration names no type: the assertion is compile-time-only, the printer wraps the
// operand in its `((object)…)` box (printAsExpression) and dropRedundantObjectBoxCasts
// strips that identity box back for an `object n = …` target, so the local's runtime box is
// exactly safeList*'s own return — List<object>, or the caller's default (null for the
// two-argument form). Naming the box moves no value, and the identity box goes with the
// retype (stripObjectBox below).
//
// Census (ts/src): 2 sites (btse fetchTrades / fetchPositions). fetchTrades is rejected —
// a later `rows = response` writes the local the method declares `object` (`let response:
// NullableDict = undefined`), which can box a Dictionary — and fetchPositions is accepted
// (its response IS the implicit API's List<object>). Every other `as any` in the tree
// (pro-luno's safeString read, the prediction market/orderbook template values) is not a
// safeList* call and keeps its `object`.
const SAFE_LIST_PRODUCER_CALLS = [ 'safeList', 'safeList2', 'safeListN' ];

function asAnySafeListReceiverCopy (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.AsExpression || initializer.type?.kind !== ts.SyntaxKind.AnyKeyword) {
        return undefined;
    }
    const inner = initializer.expression;
    if (inner?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = inner.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const name = callee.name?.escapedText;
    if ((typeof name !== 'string') || !SAFE_LIST_PRODUCER_CALLS.includes (name)) {
        return undefined;
    }
    // own-key lookup only: `map['toString']` would hand back Object.prototype.toString
    return Object.prototype.hasOwnProperty.call (CSHARP_LOCAL_THIS_RETURN_TYPES, name) ? CSHARP_LOCAL_THIS_RETURN_TYPES[name] : undefined;
}

function csharpLocalTypeOf (csharp, declaration, context) {
    const sourceName = declaration.name.escapedText;
    const scope = context?.scope ?? ((typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (declaration) : enclosingFunction (declaration));
    const ctx = context ?? { scope, stack: new Set (), depth: 0 };
    let csharpType = csharpTypeOfValue (csharp, declaration.initializer, ctx);
    let cast;
    let castWhole;
    let joinedFallback;
    // `object rows = this.safeList (response, 'data') as any;` — the receiver copy of a proven
    // list producer (U03): see asAnySafeListReceiverCopy. The named type replaces the
    // printer's own `((object)…)` box, so the wrapper drops that identity wrapper
    // (stripObjectBox). Every later write is still checked by csharpLocalIsSafeToRetype.
    const asAnyReceiverCopy = asAnySafeListReceiverCopy (declaration.initializer);
    let stripObjectBox;
    if (csharpType === undefined && asAnyReceiverCopy !== undefined) {
        csharpType = asAnyReceiverCopy;
        stripObjectBox = true;
    }
    // `this.safeValue (recv, 'key')` with a same-file dict / list twin: the box the file
    // itself proves (see the family comment); the use-shape veto runs after the retype scan
    let safeValueTwin = (csharpType === undefined) ? safeValueTwinCastType (declaration.initializer) : undefined;
    // the prediction-tier funnel call (predictionFunnelCallType): the box its bound overload
    // returns; the later-write join and the retype scan below then apply as for any candidate
    const predictionFunnel = (csharpType === undefined) ? predictionFunnelCallType (csharp, declaration) : undefined;
    // `const snapshot = await client.future (hash)` — the resolve-box census over the same file
    // (one walk per site, shared by the arm below)
    const awaitedFutureBox = (csharpType === undefined) ? awaitedClientFutureBox (csharp, declaration.initializer) : undefined;
    let safeValueTwinShape;
    // the two ws read families (see the family comment above)
    const wsCacheElementBox = (csharpType === undefined) ? wsCacheMemberReadType (csharp, declaration.initializer) : undefined;
    const handlerTableBox = (csharpType === undefined) ? handlerTableReadType (csharp, declaration.initializer, ctx) : undefined;
    // the typed-core funnel: the funnel call the pass will build around this awaited core carries
    // the box its typed overload returns (typedCoreFunnelType), so the declaration names it with no
    // cast; the later-write join and the retype scan below then apply as for any other candidate
    const funnelType = (csharpType === undefined) ? typedCoreFunnelType (csharp, declaration) : undefined;
    // `this.filterByArray (…, indexed)` keyed on the indexed literal (see filterByArrayBoxType):
    // the box the call site carries behind an exact cast
    const filterByArrayBox = (csharpType === undefined) ? filterByArrayBoxType (declaration.initializer) : undefined;
    if (csharpType === undefined) {
        // `this.sum (a, b)` over the operand family its hand-written helper boxes as Int64:
        // the declaration names that box behind an exact `((Int64))` cast. `a % b` is the
        // cast-free mod twin (modTwinCallType, whose typed overload returns Int64 itself).
        const modTwin = modTwinCallType (csharp, declaration.initializer, ctx);
        const integerBox = integerBoxCastType (csharp, declaration.initializer, ctx);
        // `this.sum (a, b)`: the typed twins Exchange.Generic.cs carries beside the
        // hand-written helpers bind for the operand family integerBoxCastType proved (see
        // integerOverloadCallType), so the call's own C# type IS the box and the cast goes
        const integerOverload = (integerBox === undefined) ? undefined : integerOverloadCallType (declaration.initializer);
        // `const x = recv[key]`: the runtime element is a proven box, but the call's C# type
        // is `object`, so the declaration needs the cast the printer does not emit by itself.
        // Nullable when the box is a string (it is null off the end of the list).
        const elementType = (integerBox === undefined) ? elementAccessElementType (csharp, declaration.initializer, ctx) : undefined;
        // `this.handleOption (method, key, <literal>)` / `this.safeValue (this.options, key,
        // <literal>)` whose option key's writer census is the default literal's own kind
        const optionsDefaultType = optionsLiteralDefaultCastType (declaration.initializer);
        // `const x = Math.min (a, b)` / `Math.max (a, b)`: the helper hands back one of its
        // operands unchanged, so only a box-exact operand pair is nameable (mathMinMaxBoxType)
        const mathBox = (integerBox === undefined && elementType === undefined) ? mathMinMaxBoxType (csharp, declaration.initializer, ctx) : undefined;
        // `this.trades[key]` / `this.ohlcvs[symmetric-read]` — the ws member cache element reads
        // (see CSHARP_LOCAL_WS_CACHE_ELEMENT_TYPES): getValue's own C# type is `object`, so the
        // proven element box is named behind the exact cast back
        const wsCacheElement = (elementType === undefined) ? (wsCacheElementReadType (declaration.initializer) ?? wsOhlcvsBucketReadType (declaration.initializer)) : undefined;
        // the ws order book subscriber core (`const orderbook = await this.watch (...)` +
        // `return orderbook.limit ()`): the resolve proof is wsOrderBookWatchType above
        const wsOrderBookType = wsOrderBookWatchType (declaration);
        if (wsOrderBookType !== undefined) {
            csharpType = wsOrderBookType;
            cast = wsOrderBookType;
        } else if (funnelType !== undefined) {
            csharpType = funnelType;
        } else if (predictionFunnel !== undefined) {
            csharpType = predictionFunnel.type;
            cast = predictionFunnel.cast;
        } else if (modTwin !== undefined) {
            csharpType = modTwin;
        } else if (integerBox !== undefined) {
            csharpType = integerBox;
            cast = (integerOverload === undefined) ? integerBox : undefined;
        } else if (elementType !== undefined) {
            csharpType = (elementType === 'string') ? 'string?' : elementType;
            cast = elementType;
        } else if (wsCacheElement !== undefined) {
            csharpType = wsCacheElement;
            cast = wsCacheElement;
        } else if (mathBox !== undefined) {
            csharpType = mathBox.type;
            cast = mathBox.cast;
        } else if (marketRowStringReadType (csharp, declaration.initializer) === 'string') {
            // `const symbol = market['symbol']`: the market row's value at the string keys is
            // a string or null (census above), so the `(string)` cast names the box
            csharpType = 'string?';
            cast = 'string';
        } else if (marketRowBoolReadType (csharp, declaration.initializer) === 'bool') {
            // `const isSwap = market['swap']`: the row's value at the boolean keys is a bool or
            // null (census: the key table), so the `(bool?)` cast names the box — the same
            // null-exact unboxing Exchange.BaseMethods.cs#safeBool* prints
            csharpType = 'bool?';
            cast = 'bool?';
        } else if (marketRowDictReadType (csharp, declaration.initializer) === 'dict') {
            // `const precision = market['precision']`: the row's value at the dict keys is the
            // `new Dictionary<string, object>()` its only writers print (census: the key table),
            // so the interface cast names that box
            csharpType = 'IDictionary<string, object>';
            cast = 'IDictionary<string, object>';
        } else if (typedDictStringReadType (csharp, declaration.initializer) === 'string') {
            // `const r = signature['r']`: a proven dictionary receiver (the printer binds the
            // static twin GetValue) whose key the TS checker resolves to a string — the value is
            // a string or null, the box the `(string)` cast names (see the family comment above)
            csharpType = 'string?';
            cast = 'string';
        } else if (plusChainStringBoxLeaf (csharp, declaration.initializer) !== undefined) {
            // U19: `object url = add(add(<string box leaf>, "/"), path)` — the leaf's C# static
            // type is object, so the printed chain is add(object, object) and only the cast can
            // name the value the box already holds (family comment above). Nullable: a null leaf
            // is the null the object overload returns; the scan below still re-checks every use.
            const boxProof = plusChainStringBoxLeaf (csharp, declaration.initializer);
            csharpType = boxProof.type;
            cast = boxProof.cast;
        } else if (addChainStringBoxType (csharp, declaration, ctx) !== undefined) {
            // `const symbol = base + '/' + quote` prints `add(add(bs, "/"), quote)` over
            // string-box leaves (bs = safeCurrencyCode's string? box, a market-row read), so
            // the chain's box is a string or null and the `(string)` cast names exactly that —
            // U20's family, see addChainStringBoxType
            const chain = addChainStringBoxType (csharp, declaration, ctx);
            csharpType = chain.type;
            cast = chain.cast;
        } else if (hashDigestLiteralType (declaration.initializer) !== undefined) {
            // `const x = this.hash (…, sha256, "hex" | "binary")`: the DIGEST LITERAL names the
            // box Exchange.Crypto.cs#Hash hands back (see hashDigestLiteralType), so the
            // declaration carries the exact cast back the `object` signature does not emit
            csharpType = hashDigestLiteralType (declaration.initializer);
            cast = csharpType;
        } else if (predictionMemberStringRead (declaration) !== undefined) {
            // `const apiKey = this.apiKey`: the hand-written property is a `string`, so the box
            // is that string or null (no cast: the property's own C# type IS `string`)
            csharpType = 'string?';
        } else if (urlsDescribeStringProducer (declaration.initializer)) {
            // `const x = this.urls['api']['ws']`: the describe() literal spells that leaf as a
            // string, so the getValue chain's box is a string or null — same cast as above
            csharpType = 'string?';
            cast = 'string';
        } else if (optionsLiteralStringProducer (declaration.initializer)) {
            // `const x = this.options['chainName']`: the per-key writer census
            // (OPTIONS_LITERAL_STRING_KEYS above) proves a string box on every path
            csharpType = 'string?';
            cast = 'string';
        } else if (dictRowElementReadType (csharp, declaration) !== undefined) {
            // `const rawOrder = orders[i]`: the checker proves the receiver's element type is a
            // ccxt row shape, so the box is the decoded row dictionary and the declaration names
            // it behind the same interface cast the safeValue-twin family emits (see the U06
            // section of this file)
            csharpType = 'IDictionary<string, object>';
            cast = 'IDictionary<string, object>';
        } else if (memberDictReadCastType (declaration.initializer) !== undefined) {
            // `const markets = this.markets;` / `const fees = this.fees;`: the hand-written
            // members are declared `object` while every writer boxes an
            // IDictionary<string, object> (see the family comment) — named behind the exact
            // interface cast
            csharpType = memberDictReadCastType (declaration.initializer);
            cast = csharpType;
        } else if (arraySliceCallIsProvenList (csharp, declaration.initializer)) {
            // `const parts = this.arraySlice (idParts, 1)`: the hand-written Exchange.cs helper
            // is declared `object` and its every non-byte[] path re-boxes into the fresh
            // List<object> it returns (see the family comment) — named behind the cast
            csharpType = 'List<object>';
            cast = 'List<object>';
        } else if (optionsDefaultType !== undefined) {
            // `const method = this.handleOption ('fetchMarkets', 'method', 'publicGetCommonSymbols')`:
            // the option key's whole-corpus writer census equals the site's own default literal kind
            // (see the family comment above), so the value the call hands back already is that box
            csharpType = optionsDefaultType;
            cast = optionsDefaultType;
        } else if (clientsMapReadCastType (declaration.initializer) !== undefined) {
            // `const client = this.safeValue (this.clients, url)`: the ws client map read
            csharpType = 'WebSocketClient';
            cast = 'WebSocketClient';
        } else if (futuresReadCastType (declaration.initializer) !== undefined) {
            // `const promise = client.futures['auth']`: the hand-written
            // IDictionary<string, Future> map read — the cast names the Future box
            csharpType = 'Future';
            cast = 'Future';
        } else if (wsCacheFieldReadType (declaration.initializer) !== undefined) {
            // `const cache = this.positions`: the ws cache field read — the same file's own
            // writers prove the ArrayCache box, so the cast names it (see the U45 section)
            csharpType = WS_CACHE_FIELD_CAST;
            cast = WS_CACHE_FIELD_CAST;
        } else if (awaitedFutureBox !== undefined) {
            // `const snapshot = await client.future (hash)`: the awaited value is the box the
            // same file resolves that message hash with (see awaitedClientFutureBox)
            csharpType = awaitedFutureBox;
            cast = awaitedFutureBox;
        } else if (omitDictionaryProducer (csharp, declaration.initializer, ctx)) {
            // `const x = this.omit (<Dictionary box>, keys)`: the call binds a dict-receiver
            // overload (see the family comment above), so the call's own C# type IS the
            // declaration — no cast needed
            csharpType = 'Dictionary<string, object>';
        } else if (omitZeroStringProducer (csharp, declaration.initializer, ctx)) {
            // `const x = this.omitZero (<string box>)`: the base's string? overload returns the
            // box itself (a string or null — see omitZeroStringProducer), so no cast is needed
            csharpType = 'string?';
        } else if (safeValueTwin !== undefined) {
            // `const x = this.safeValue (response, 'data')`: the same file extracts that
            // (receiver, key) pair as a dict / a list somewhere else, so the box is the
            // decoded JSON object / array — named behind the exact cast back (see the
            // family comment above). The use-shape veto is applied after the retype scan.
            csharpType = safeValueTwin.type;
            cast = safeValueTwin.cast;
            safeValueTwinShape = safeValueTwin.shape;
        } else if (wsCacheElementBox !== undefined) {
            // `const stored = this.safeValue (this.trades, symbol)`: the file's every writer
            // of that cache member stores this box (see the family comment above), so the
            // declaration names it behind the exact cast back
            csharpType = wsCacheElementBox;
            cast = wsCacheElementBox;
        } else if (handlerTableBox !== undefined) {
            // `const method = this.safeValue (methods, channel)`: the handler table's every
            // entry is a same-file method reference, so the box is a Delegate or null
            csharpType = handlerTableBox;
            cast = handlerTableBox;
        } else if (filterByArrayBox !== undefined) {
            // `const x = this.filterByArray (…, indexed)`: the hand-written helper's per-literal
            // box (see filterByArrayBoxType). The call's own C# type is `object`, so the
            // declaration names the box behind the exact cast.
            csharpType = filterByArrayBox;
            cast = filterByArrayBox;
        } else if (safeIntegerProduct2CallCastType (declaration.initializer) !== undefined) {
            // `const x = this.safeIntegerProduct2 (obj, k1, k2, multiplier)`: the hand-written
            // helper (Exchange.SafeMethods.cs) hands back the caller's `defaultValue` — an
            // arbitrary object — only when a default is passed; a 4-argument call leaves it at
            // its null default, so every path is null or the Convert.ToInt64 (...) box and the
            // `(Int64?)` cast names exactly that box (see safeIntegerProduct2CallCastType)
            csharpType = 'Int64?';
            cast = 'Int64?';
        } else if (parseIntTernaryCastType (declaration.initializer) !== undefined) {
            // `const x = c ? parseInt (v) : undefined`: the conditional's box is the parseInt box
            // (Int64 or null, see parseIntTernaryCastType), so the declaration names it behind the
            // boundary cast on the whole expression — a cast binds its own operand first, so the
            // printed `((cond)) ? A : B` needs the extra paren pair (castWhole)
            csharpType = 'Int64?';
            cast = 'Int64?';
            castWhole = true;
        } else {
            // `const x = this.safeValue (cache.hashmap, key[, {}])`: the read of an
            // ArrayCache bucket map, exact per arrayCacheHashmapReadType
            const hashmapType = arrayCacheHashmapReadType (declaration.initializer);
            if (hashmapType !== undefined) {
                csharpType = hashmapType;
                cast = hashmapType;
            } else {
                // `const x = this.getMessageHash (...)` / `const x = this.parseWsTrade (...)`: the
                // generated definition's every return path boxes the named type, so the
                // `(string)` / `(Dictionary<string, object>)` cast back is exact; the declared
                // spelling is the table's (nullable for the scalars whose box can be null, the
                // non-null collection names for the ws row builders — the same spelling the
                // CSHARP_COLLECTION_RETURN_METHODS declarations carry).
                // Every later write is still checked by csharpLocalIsSafeToRetype.
                const callCastType = callResultCastType (declaration.initializer);
                if (callCastType !== undefined) {
                    csharpType = callCastType;
                    cast = callCastType.endsWith ('?') ? callCastType.slice (0, -1) : callCastType;
                    // U49: the Int64 counter definitions (requestId) get the typed signature from
                    // the same per-definition proof (csharpMethodReturnType / sameFileCallBoxType),
                    // so the call's own C# type IS the box and the cast back is an identity
                    // conversion. The check must sit in THIS arm: callResultCastType answers
                    // 'Int64' for exactly these sites, so a check in the else-branch below never
                    // runs (it was dead code before U49).
                    if (typedRequestIdCall (declaration.initializer)) {
                        cast = undefined;
                    }
                } else {
                    // `const x = this.getMessageHash (...)` / `const x = this.parseWsTrade (...)`: the
                    // generated definition's every return path boxes the named type, so the
                    // `(string)` / `(Dictionary<string, object>)` cast back is exact; the declared
                    // spelling is the table's (nullable for the scalars whose box can be null, the
                    // non-null collection names for the ws row builders — the same spelling the
                    // CSHARP_COLLECTION_RETURN_METHODS declarations carry).
                    // Every later write is still checked by csharpLocalIsSafeToRetype.
                    const perDeclarationCastType = callResultCastType (declaration.initializer);
                    if (perDeclarationCastType !== undefined) {
                        csharpType = perDeclarationCastType;
                        cast = perDeclarationCastType.endsWith ('?') ? perDeclarationCastType.slice (0, -1) : perDeclarationCastType;
                    }
                }
            }
        }
    }
    // `let x: Dict;` has no initialiser in TS but prints `object x = null;` (the printer's own
    // null); the declaration's collection annotation (or its unnameable union, which cannot be
    // the join's starting type) is then resolved by the null-declared join below
    const noInitGateAnnotation = annotationType (declaration);
    if (csharpType === undefined && declaration.initializer === undefined && declaration.type !== undefined
            && (noInitGateAnnotation === undefined || COLLECTION_LOCAL_TYPES.includes (noInitGateAnnotation)
                || u17FamilyName (declaration) !== undefined
                || (isPredictionSource (declaration) && noInitGateAnnotation !== undefined))) {
        // the prediction tier's scalar annotations reach the same join (see the guard above)
        csharpType = 'null';
    }
    // a safeString* call with a proven non-null string default is a proven non-null string
    // (nonNullStringDefaultCall), but it is NOT promoted to `string` here: the nullable
    // spelling stays, and the non-null one is only retried when the scan rejects it (below)
    if (csharpType === 'null') {
        const annotated = annotationType (declaration);
        const collectionAnnotation = (annotated !== undefined && COLLECTION_LOCAL_TYPES.includes (annotated));
        csharpType = collectionAnnotation
            // a collection annotation is narrower than its later writes: an IDictionary box
            // (safeDict, a concurrent map) is not assignable to Dictionary. Join the
            // annotation with every write along the box-identical edges before the scan.
            ? typeFromValueOrWrites (csharp, scope, declaration, sourceName, annotated, ctx, NULL_DECLARED_WIDENING_EDGES)
            : (annotated ?? typeFromValueOrWrites (csharp, scope, declaration, sourceName, 'null', ctx, NULL_DECLARED_WIDENING_EDGES));
        if (collectionAnnotation && csharpType === undefined) {
            // the annotation disagrees with EVERY later write (a stale `let response: Dict`
            // whose endpoints are all Endpoint<List>, gate#fetchFundingHistory): the writes are
            // the box (the wrapper's Task<T>, enforced by callAsync<T>/NarrowResponse), so the
            // annotation is dropped and the join is retried from 'null' — the write-join's own
            // spelling then faces the same scan as any other candidate type.
            csharpType = typeFromValueOrWrites (csharp, scope, declaration, sourceName, 'null', ctx, NULL_DECLARED_WIDENING_EDGES);
        }
        if (annotated !== undefined && !COLLECTION_LOCAL_TYPES.includes (annotated)) {
            // `let x: Int = undefined; ... x = 0`: the annotation's Int64? would CONVERT the int
            // literal, i.e. name a box the object declaration never holds. When the writes join to
            // a numeric/bool type of their own that narrower spelling IS the box, so retry with it.
            const joined = typeFromValueOrWrites (csharp, scope, declaration, sourceName, 'null', ctx);
            if (joined !== undefined && joined !== annotated && NUMERIC_BOOL_LOCAL_TYPES.includes (joined)) {
                joinedFallback = joined;
            }
        }
    } else if (csharpType !== undefined && csharpType !== csharp.VAR_TOKEN) {
        // a local initialised from a READ of a typed local holds that local's box, so the
        // copy may widen a Dictionary to the interface a later write stores (see
        // COPY_WIDENING_EDGES). The accumulator rules that share joinTypes have no such
        // proof for this declaration, so the edge travels with this call only.
        const copyType = copyReadLocalType (csharp, declaration, ctx);
        const copyEdges = (copyType !== undefined && copyType === csharpType && (copyType === 'Dictionary<string, object>' || copyType === 'IDictionary<string, object>')) ? COPY_WIDENING_EDGES : undefined;
        // a read of a retyped ws cache member: the later cache-setup writes store an
        // ArrayCache constructor, which needs an edge to the declaration's own type to join
        const cacheElementType = wsCacheMemberReadType (csharp, declaration.initializer);
        const cacheMemberEdges = (csharpType === 'ccxt.pro.ArrayCache' && wsCacheMemberRead (declaration.initializer)) ? CACHE_MEMBER_WIDENING_EDGES
            : (cacheElementType !== undefined && cacheElementType !== 'IDictionary<string, object>') ? cacheElementWideningEdges (cacheElementType) : undefined;
        // a read of the ws orderbook map (this.safeOrderBook -> ccxt.pro.IOrderBook): the
        // later writes store the concrete orderbook constructor, which needs the
        // implementation -> interface edge to join (see ORDERBOOK_WIDENING_EDGES)
        // (U45, same declaration: this.orderBook() / indexedOrderBook() / countedOrderBook() writes)
        const orderbookEdges = (csharpType === 'ccxt.pro.IOrderBook') ? ORDERBOOK_WIDENING_EDGES : undefined;
        // join the initializer with every later write, widening only along box-identical edges
        const dictionaryLiteral = declaration.initializer?.kind === ts.SyntaxKind.ObjectLiteralExpression;
        csharpType = typeFromValueOrWrites (csharp, scope, declaration, sourceName, csharpType, ctx, copyEdges ?? cacheMemberEdges ?? orderbookEdges ?? (dictionaryLiteral ? DICTIONARY_LITERAL_WIDENING_EDGES : undefined));
    }
    if (csharpType === undefined || csharpType === csharp.VAR_TOKEN) {
        return undefined;
    }
    let safe = csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, csharpType, ctx);
    // the annotation's type is unreachable for the actual writes, but the write-join's own
    // numeric/bool spelling is: every read and write is re-scanned against it exactly like
    // any other candidate type (the box is the one the object declaration already holds).
    if (!safe && joinedFallback !== undefined && csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, joinedFallback, ctx)) {
        csharpType = joinedFallback;
        safe = true;
    }
    // an array literal is `new List<object>()`, but a later `x = this.toArray (...)` writes an
    // IList<object>. Retry as the interface: every list rule the scan applies treats the two
    // alike (LIST_TYPES), and both `new List<object>()` and `this.toArray (...)` assign into an
    // IList<object> local unchanged. Only a List<object> reject is retried, so locals that pass
    // (or fail for any other reason) keep the exact List<object> spelling.
    if (!safe && csharpType === 'List<object>' && csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, 'IList<object>', ctx)) {
        csharpType = 'IList<object>';
        safe = true;
    }
    // `object x = this.safeString (obj, key, <default>)`: the proven non-null string default
    // (nonNullStringDefaultCall) lets the scan accept the non-null spelling with its identity
    // `(string)` cast — retried only after `string?` was rejected, never in the prediction tree
    if (!safe && csharpType === 'string?' && nonNullStringDefaultCall (csharp, declaration.initializer, ctx) && csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, 'string', ctx)) {
        csharpType = 'string';
        cast = 'string';
        safe = true;
    }
    // the safeValue-twin box is only named when no use of the local treats it as the other
    // shape either — the runtime half of the proof (see safeValueTwinUsesAreConsistent),
    // applied after every retry so no fallback spelling can re-accept a contradictory site
    if (safe && safeValueTwinShape !== undefined && !safeValueTwinUsesAreConsistent (csharp, scope, declaration, safeValueTwinShape)) {
        return undefined;
    }
    if (!safe) {
        return undefined;
    }
    return { type: csharpType, cast, castWhole, safeValueTwinShape, stripObjectBox };
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
//   orderRequestWs               ts/src/pro/kraken.ts        same shape, single `return [ request, params ]`
//   createOrderRequest           ts/src/toobit.ts             fresh request returned
//   createContractOrderRequest   ts/src/toobit.ts             fresh request returned
export const DESTRUCTURED_DICT_HELPERS = [
    'handleUntilOption',
    'handleUntilOptionString',
    'prepareRequest',
    'multiOrderSpotPrepareRequest',
    'orderRequest',
    'orderRequestWs',
    'createOrderRequest',
    'createContractOrderRequest',
];

// Tuple-returning helpers whose element 0 is provably a string (or null) on EVERY return
// path — the string twin of DESTRUCTURED_DICT_HELPERS above, and the same mechanism: the
// printer emits the element load (`<target> = <tmp>[0]` on a typed holder, `((IList<object>)<tmp>)[0]`
// on an untyped one), installDestructuredCasts rewrites that element load with the `(string)` cast back to the proven type, and only then can a
// null-initialised declaration (`let marketType: Str = undefined`) be `string?`.
//   handleMarketTypeAndParams   [string, Dict]: the two paths the file header calls out are
//     both closed — the `defaultValue: any` argument is gated per call site (a present one
//     must be a string literal or `undefined`), and `getValue (market, 'type')` is backed by
//     a census of every market-row 'type' writer in the generated tree (118 entries: 68
//     string literals, 5 string-literal ternaries, 45 locals whose every write in the method
//     is a string literal / safeString* / string-literal ternary — no non-string writer).
//     The remaining five paths are safeString2 / the `typeof … === 'string'` branch / a
//     string literal default, i.e. strings.
//   handleNetworkCodeAndParams  [safeString2 (params, 'networkCode', 'network'), params]
//   handleProductTypeAndParams  bitget — safeString2 + string literals only (throws before
//     the return when every branch left it undefined)
//   handleParamString / handleParamString2  [safeString|safeString2 (params, ..., defaultValue), ...]
//   getMarginMode               gate — safeStringLower2 + string literals only
//   handleOriginAndSingleAddress  pacifica — [safeString2 (params, 'account', 'address'), params]
//     or [this.walletAddress, params] (a `string` property on the hand-written base); dydx's
//     same-named helper is NOT listed: its element 0 comes from handleOptionAndParams
// `defaultValueArg` is the 1-based position of an argument the helper can hand back as
// element 0 whose TS type is not a string (handleMarketTypeAndParams's `any`) — a present
// argument there must be a string literal, `undefined`, the target itself, or an expression
// whose own proven C# type is string / string? (see destructuredStringElementProof), or the
// call keeps `object`. 0 = no such argument.
export const DESTRUCTURED_STRING_HELPERS = {
    'handleMarketTypeAndParams': 4,
    'handleSubTypeAndParams': 4,
    'handleNetworkCodeAndParams': 0,
    'handleProductTypeAndParams': 0,
    'handleParamString': 3,
    'handleParamString2': 4,
    'getMarginMode': 0,
    'handleOriginAndSingleAddress': 0,
    // cs90 U13 — venue helpers whose element 0 is one of the audited boxes above:
    //   getBybitType (bybit)    [type, params] from handleMarketTypeAndParams, or
    //     [subType, params] from handleSubTypeAndParams — the slot holds that local on
    //     every return path (the 'option'/'spot' guard only picks which of the two)
    //   resolveAuthType (pro/binance)  element 0 is `type` from handleMarketTypeAndParams,
    //     kept for option/stock or rewritten to the 'future' / 'delivery' literals; its
    //     element 1 is the same `subType` handleSubTypeAndParams boxed (see the slot table)
    'getBybitType': 0,
    'resolveAuthType': 0,
};

// The slot indexes of an audited helper whose value is that proven string-or-null box. Slot 0 is
// the default (the whole table above); resolveAuthType carries TWO of them — its
// `[ type, subType, params ]` puts the handleSubTypeAndParams box in slot 1 (the bybit/pro-binance
// entry above), so a `[ type, subType, params ] = this.resolveAuthType (…)` target at index 1 is
// the same proof as index 0 and its element load takes the same `(string)` cast.
const DESTRUCTURED_STRING_ELEMENT_INDEXES = { 'resolveAuthType': [ 0, 1 ] };
function stringElementIndexes (name) {
    return DESTRUCTURED_STRING_ELEMENT_INDEXES[name] ?? [ 0 ];
}

// `let x: Str = undefined` / `let x = null` — the null-initialised declarations this family
// owns, joined with the destructured write's nullable contribution. A literal-initialised
// local joins the same element-0 proof with the literal's own box (literalInitElement0Type,
// so a `let type = 'spot'` target becomes `string?` exactly like the null-initialised shard).
function isNullInit (declaration) {
    const init = declaration?.initializer;
    if (init === undefined) {
        return false;
    }
    return init.kind === ts.SyntaxKind.NullKeyword
        || (init.kind === ts.SyntaxKind.Identifier && init.escapedText === 'undefined');
}

// `let x = 'spot'; [ x, params ] = this.handleMarketTypeAndParams (…, x)`: the local starts as
// a string literal, so its box is a string (or null when the helper returns null) exactly like
// the null-initialised shard — the same element-0 proof applies, only the declaration's own
// type comes from the literal. Kept separate from isNullInit so the nullable spelling stays
// honest: the joined type keeps the init's non-null string and the destructured write adds the
// nullable contribution (see typeFromValueOrWrites).
function isStringLiteralInit (declaration) {
    return declaration?.initializer?.kind === ts.SyntaxKind.StringLiteral;
}

function isStringLiteral (node) {
    return node?.kind === ts.SyntaxKind.StringLiteral || node?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
}

// an explicit `undefined` argument leaves the helper's `defaultValue !== undefined` guard
// false on every path, so that branch cannot contribute element 0 at all
function isUndefinedLiteral (node) {
    return node?.kind === ts.SyntaxKind.Identifier && node.escapedText === 'undefined';
}

// `let x = false` / `= 0` / `= ''` (also a negated numeric literal): a declaration whose own
// C# box is the literal's (bool / int / Int64 / double / string). This is the literal-init
// shard of the destructuring family — the null-init declarations above are another unit's.
function isLiteralInit (declaration) {
    const init = declaration?.initializer;
    if (init === undefined) {
        return false;
    }
    switch (init.kind) {
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return true;
    case ts.SyntaxKind.PrefixUnaryExpression:
        return init.operator === ts.SyntaxKind.MinusToken && init.operand?.kind === ts.SyntaxKind.NumericLiteral;
    }
    return false;
}

// helpers whose element 0 IS the SafeString / SafeString2 result on every path
// (Exchange.BaseMethods.cs: handleParamString / handleParamString2 both declare a `string?`
// local in slot 0 and return it): the defaultValue argument's own box can never reach the
// slot as a non-string, so the literal-init shard needs no defaultValue gate for them.
const SAFE_STRING_ELEMENT0_HELPERS = [ 'handleParamString', 'handleParamString2' ];

// element 0 of an audited string helper proves the target a string (or null). The
// null-initialised shard is the audited list above, gated per call site on the defaultValue
// argument (handleMarketTypeAndParams can hand that argument back UNCHANGED, so its box must
// be provable); the literal-initialised shard is limited to the SafeString-bodied helpers.
function destructuredStringElementProof (csharp, declaration, idNode, assignment, name, context) {
    if (assignment.right?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call (DESTRUCTURED_STRING_HELPERS, name)
            || !(isNullInit (declaration) || isLiteralInit (declaration))) {
        return false;
    }
    if (!stringElementIndexes (name).includes (idNode.parent?.elements?.indexOf (idNode))) {
        return false;
    }
    const defaultValueArg = DESTRUCTURED_STRING_HELPERS[name];
    if (defaultValueArg > 0) {
        const argument = assignment.right.arguments[defaultValueArg - 1];
        // the helper hands `defaultValue` back verbatim on its default path, so a present
        // argument must be a proven string box: a string literal, an explicit `undefined`,
        // the TARGET LOCAL ITSELF (`[ x, params ] = this.handleMarketTypeAndParams (…, x)` —
        // the box such a local holds before this write is its initialiser's, a string or
        // null), or any expression this module's own tables already prove string / string?
        // (a typed local, a ternary over string literals): each hands back a string or null.
        // Every other write of the name is re-scanned against the joined type by
        // csharpLocalIsSafeToRetype before anything is emitted.
        const selfArgument = argument?.kind === ts.SyntaxKind.Identifier
            && argument.escapedText === declaration.name?.escapedText;
        if (argument !== undefined && !isStringLiteral (argument) && !isUndefinedLiteral (argument) && !selfArgument
                && !STRING_TYPES.includes (csharpTypeOfValue (csharp, argument, context))) {
            return false;
        }
    }
    return true;
}

// element 0 of `[ value, params ] = this.helper (...)` for the helpers whose generated C#
// body boxes a CONCRETELY-TYPED local in that slot on EVERY return path (read off
// Exchange.BaseMethods.cs and kucoin#handleHfAndParams, never off the TS annotation):
// handleParamString/2 + handleNetworkCodeAndParams + handleTriggerDirectionAndParams box a
// `string?` local, handleParamBool/2 + handleHfAndParams a `bool?` local, handleParamInteger/2
// an `Int64?` local, handlePostOnly a bool LITERAL. The value is the helper's own local (or
// literal), so the cast names the box that already exists; nothing else can reach the slot.
// Slot 1 is NOT provable for the same helpers: on every path it holds the CALLER's own
// `parameters` argument, and omit(object,object) / SafeValueN hand an `IList<object>` back
// unchanged, so an `object query = null` target keeps `object` (cs90/U15 census).
// U16 (lighter only, the two names below): slot 0 is `this.parseToInt (x)` on the single
// return path of each definition (`return new List<object> {this.parseToInt (x), parameters}`),
// and Exchange.BaseMethods.cs#parseToInt is declared `Int64?` — the slot holds a boxed Int64
// or null, nothing else. The `(Int64?)` read cast names that box; `let x: Int = undefined`
// targets keep the null-init join's rule (the write join is not consulted for a scalar
// annotation), so an extra unprovable write of the name still rejects the declaration.
export const DESTRUCTURED_ELEMENT0_TYPES = {
    'handleParamString': 'string?',
    'handleParamString2': 'string?',
    'handleNetworkCodeAndParams': 'string?',
    'handleTriggerDirectionAndParams': 'string?',
    'handleParamBool': 'bool?',
    'handleParamBool2': 'bool?',
    'handleHfAndParams': 'bool?',
    'handleParamInteger': 'Int64?',
    'handleParamInteger2': 'Int64?',
    'handlePostOnly': 'bool',
    // base Exchange.BaseMethods.cs `bool? isTrigger = this.safeBool2 (parameters, "trigger",
    // "stop");` is the ONLY slot-0 writer (no default argument, so the fall-through hands back
    // null) and isTriggerOrder returns that list through an `object` signature — both box a
    // bool? local / that same list, so `(bool?)` names the box on every path.
    'handleTriggerAndParams': 'bool?',
    'isTriggerOrder': 'bool?',
    'handleAccountIndex': 'Int64?',
    'handleApiKeyIndex': 'Int64?',
};

// ===== U14: bool option locals (`object paginate = false`, `object uta = null`, ...) =====
//
// The locals this shard owns (name fence: sibling units never fire on the same declaration).
export const BOOL_OPTION_LOCALS = [
    'isPortfolioMargin', 'uta', 'paginate', 'returnRateLimits', 'usePrivate',
    'isUnifiedAccount', 'isTrigger', 'createMarketBuyOrderRequiresPrice',
];

// The [value, params] helpers whose element 0 is a BOOLEAN OPTION value resolved from params /
// this.options / the default argument, and the 1-based position of that default argument. The
// option keys they read (paginate, uta, unifiedAccount, portfolioMargin/papi, returnRateLimits,
// usePrivate) are documented booleans and every in-corpus writer of them is a bool literal /
// safeBool result (REPORT.md census), so the slot holds a boxed bool or null — the same box the
// hand-written safeBool* family names. The default argument is the per-call-site gate.
export const BOOL_OPTION_HELPERS = {
    'handleOptionAndParams': 4,
    'handleOptionAndParams2': 5,
    'handleUTAAndParams': 3,
    'handleTriggerOptionAndParams': 3,
};

function boolOptionLocalName (declaration) {
    const raw = declaration?.name?.escapedText;
    return (typeof raw === 'string' && BOOL_OPTION_LOCALS.includes (raw)) ? raw : undefined;
}

function isBoolLiteralArgument (node) {
    return node?.kind === ts.SyntaxKind.TrueKeyword || node?.kind === ts.SyntaxKind.FalseKeyword;
}

// the RHS of a destructuring assignment behind its parentheses / `await`
// (`[ uta, params ] = await this.handleUTAAndParams (...)`)
function unwrapOptionCall (node) {
    let current = node;
    while (current?.kind === ts.SyntaxKind.ParenthesizedExpression || current?.kind === ts.SyntaxKind.AwaitExpression) {
        current = current.expression;
    }
    return current;
}

// `this.<helper>` of a destructuring RHS, await/parens unwrapped, or undefined
function destructuredHelperName (node) {
    const call = unwrapOptionCall (node);
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = call.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    return callee.name?.escapedText;
}

// `[ x, params ] = this.<helper> (...)` element 0 of a bool-option helper. Per call site the
// default argument must be absent / explicit `undefined` / a bool literal / the target local
// itself (whose own box is the same bool-or-null family: its initialiser is a bool literal or
// null and every other write is re-scanned by csharpLocalIsSafeToRetype). Anything else — a
// non-bool default, a second target — keeps the printer's untyped read.
function boolOptionElementProof (declaration, idNode, assignment, name) {
    const call = unwrapOptionCall (assignment?.right);
    if (boolOptionLocalName (declaration) === undefined
            || !Object.prototype.hasOwnProperty.call (BOOL_OPTION_HELPERS, name)
            || idNode.parent?.elements?.[0] !== idNode
            || call?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const argument = call.arguments[BOOL_OPTION_HELPERS[name] - 1];
    if (argument === undefined || isUndefinedLiteral (argument) || isBoolLiteralArgument (argument)) {
        return true;
    }
    return argument.kind === ts.SyntaxKind.Identifier && argument.escapedText === declaration.name?.escapedText;
}

// element 0 of a bool helper: the per-call-site option proof above, or the flat
// DESTRUCTURED_ELEMENT0_TYPES entry (a helper whose own body boxes a bool? local on every path)
function destructuredBoolElementProof (declaration, idNode, assignment, name) {
    const elementType = DESTRUCTURED_ELEMENT0_TYPES[name];
    if (elementType === 'bool?' && boolOptionLocalName (declaration) !== undefined
            && idNode.parent?.elements?.[0] === idNode) {
        return true;
    }
    return boolOptionElementProof (declaration, idNode, assignment, name);
}
// S28 (+ cs90 U13): element 0 of `[ value, params ] = this.helper (...)` for a LITERAL-initialised
// target. The helper's own generated C# body boxes a concretely-typed local in slot 0 on every path
// (DESTRUCTURED_ELEMENT0_TYPES), or the audited string box (DESTRUCTURED_STRING_HELPERS, whose
// SafeString subset is SAFE_STRING_ELEMENT0_HELPERS), so the injected `(T)` unboxing cast names
// exactly that box: a literal `false` / `'x'` initialiser keeps its box through the box-identical
// T -> T? edge (a Nullable<bool> holding a value boxes as the bool), and the join below still
// rejects every non-box-identical element type.
function literalInitElement0Type (csharp, declaration, idNode, assignment, name, context) {
    if (!isLiteralInit (declaration) || idNode.parent?.elements?.[0] !== idNode) {
        return undefined;
    }
    // a bool-option helper called with a bool default / no default: element 0 is the option's
    // box (a bool or null), so the literal `false` / `true` initialiser joins it as `bool?`.
    // Checked before the call guard: the venue helper is awaited (`await this.handleUTAAndParams`)
    if (boolOptionElementProof (declaration, idNode, assignment, name)) {
        return 'bool';
    }
    if (assignment?.right?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const elementType = DESTRUCTURED_ELEMENT0_TYPES[name];
    if (elementType !== undefined) {
        return elementType;
    }
    if (SAFE_STRING_ELEMENT0_HELPERS.includes (name)) {
        return 'string?';
    }
    // the rest of the audited string helpers prove element 0 the same way on a literal-init
    // target (its initialiser is the string box the helper would hand back); the join keeps
    // the initialiser's box and the element's nullable contribution
    return destructuredStringElementProof (csharp, declaration, idNode, assignment, name, context) ? 'string?' : undefined;
}

// scope (enclosing function node) -> Map<printed local name, proven C# type>, filled while the
// declaration is printed and read while a destructuring assignment in the same scope is printed
const destructuredWriteTypes = new WeakMap ();
// scope -> Set<printed local name>: the targets whose element-0 read is named with the isTrue ()
// coercion instead of a cast (see destructuredIsUTAEnabledBoolProof)
const destructuredBoolCoercions = new WeakMap ();

export function recordDestructuredWriteType (scope, printedName, csharpType, isUTAEnabledBool = false) {
    if (scope === undefined) {
        return;
    }
    let types = destructuredWriteTypes.get (scope);
    if (types === undefined) {
        types = new Map ();
        destructuredWriteTypes.set (scope, types);
    }
    types.set (printedName, csharpType);
    if (isUTAEnabledBool && csharpType === 'bool') {
        let coercions = destructuredBoolCoercions.get (scope);
        if (coercions === undefined) {
            coercions = new Set ();
            destructuredBoolCoercions.set (scope, coercions);
        }
        coercions.add (printedName);
    }
}

// is `[ ..., x, ... ] = this.helper (...)` a write the cast makes type-correct?
function destructuredWriteIsCastable (csharp, index, declaration, idNode, assignment, csharpType, context) {
    // U16: `[ x, params ] = await this.helper (...)` prints the same element reads (`var tmp =
    // await ...; x = tmp[0];`), so the awaited pair is the same tuple the proof below names.
    // Every audited helper but handleAccountIndex / handleApiKeyIndex is sync, so no
    // sync-helper site can newly fire through this unwrap.
    // U14 bool shard: the awaited venue helper (`[ uta, params ] = await this.handleUTAAndParams
    // (...)`) is the same destructuring write — every other family keeps the printer's shape.
    // (0 parenthesized awaited destructuring helpers in the corpus: the two unwraps coincide.)
    let right = unwrapOptionCall (assignment.right);
    // `[ request, params ] = spot ? this.multiOrderSpotPrepareRequest (...) : this.prepareRequest (...)`
    // prints the same holder and the same element read as a single call, and element 0 of BOTH
    // arms is the fresh request Dict the table below proves, so the element-0 box is proven for
    // the conditional too. Only the dict family reads the arms: the string / element-0 families
    // keep the single-call shape they were audited on.
    const arms = (right?.kind === ts.SyntaxKind.ConditionalExpression && csharpType === 'Dictionary<string, object>')
        ? [ right.whenTrue, right.whenFalse ]
        : [ right ];
    const helpers = [];
    for (const arm of arms) {
        if (arm?.kind !== ts.SyntaxKind.CallExpression) {
            return false;
        }
        const armCallee = arm.expression;
        if (armCallee?.kind !== ts.SyntaxKind.PropertyAccessExpression || armCallee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return false;
        }
        helpers.push (armCallee.name?.escapedText);
    }
    const helper = helpers[0];
    if (csharpType === 'Dictionary<string, object>') {
        // only the audited request builders, and only for a target proven to be a Dictionary
        if (!helpers.every ((name) => DESTRUCTURED_DICT_HELPERS.includes (name))) {
            return false;
        }
    } else if ((csharpType === 'string' || csharpType === 'string?') && destructuredStringElementProof (csharp, declaration, idNode, assignment, helper, context)) {
        // the null-initialised string family: element 0 of an audited helper (see
        // DESTRUCTURED_STRING_HELPERS) is a string or null, and the `(string)` cast names that box
    } else if (csharpType === 'bool?' && destructuredBoolElementProof (declaration, idNode, assignment, helper)) {
        // the bool shard: element 0 of an audited bool helper is a boxed bool or null on every
        // path, and the `(bool?)` unbox accepts both (null in, null out) — never a cross-widening.
        // A non-nullable `bool` target never reaches this shard: the element write always widens
        // the join's spelling to `bool?` (see typeFromValueOrWrites).
    } else {
        // element 0 of an audited [value, params] helper: the helper's own C# local boxes the
        // target's declared type on every path, so the injected cast is an identity. The
        // element position is what carries the proof, so only slot 0 qualifies.
        const elementType = DESTRUCTURED_ELEMENT0_TYPES[helper];
        if (elementType === undefined || idNode.parent?.elements?.indexOf (idNode) !== 0) {
            return false;
        }
        // the cast is spelled with the TARGET's type: the helper's box or its box-identical
        // nullable widening (a Nullable<T> boxes as T), never a cross-widening
        if (csharpType !== elementType && !(elementType === 'bool' && csharpType === 'bool?')) {
            return false;
        }
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

// `object uta = await this.isUTAEnabled ()`: the local's box is the awaited bool
// (CSHARP_LOCAL_AWAIT_RETURN_TYPES), and its single later write is element 0 of
// `this.handleOptionAndParams (params, method, 'uta', uta)` — the USER's params value, i.e. the
// header's deliberately-untyped path, whose box only the truthiness coercion can name: isTrue
// is idempotent (isTrue (isTrue (v)) === isTrue (v)) and every other read is a truthiness test.
function isUTAEnabledAwaitedInit (declaration) {
    const init = declaration?.initializer;
    const callee = (init?.kind === ts.SyntaxKind.AwaitExpression && init.expression?.kind === ts.SyntaxKind.CallExpression) ? init.expression.expression : undefined;
    return callee?.kind === ts.SyntaxKind.PropertyAccessExpression
        && callee.expression?.kind === ts.SyntaxKind.ThisKeyword
        && callee.name?.escapedText === 'isUTAEnabled';
}

// `if (x)` / `x ? :` / `!x` — the printer wraps each condition in isTrue (x), the read shape the
// coercion keeps exact; any other read (an argument, `x === true`) fails the proof
function isTruthinessRead (node) {
    const parent = node?.parent;
    if (parent === undefined) {
        return false;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.IfStatement:
    case ts.SyntaxKind.WhileStatement:
    case ts.SyntaxKind.DoStatement:
        return parent.expression === node;
    case ts.SyntaxKind.ConditionalExpression:
        return parent.condition === node;
    case ts.SyntaxKind.PrefixUnaryExpression:
        return parent.operator === ts.SyntaxKind.ExclamationToken && parent.operand === node && isTruthinessRead (parent);
    case ts.SyntaxKind.ParenthesizedExpression:
        return parent.expression === node && isTruthinessRead (parent);
    case ts.SyntaxKind.BinaryExpression:
        // `x || y` / `x && y` inside a condition: the printer wraps the operand in isTrue (x)
        // too, so the coercion's bool reads the same; every other operator (`x === true`,
        // `x + 'a'`, a compound write) fails the proof
        return (parent.operatorToken?.kind === ts.SyntaxKind.BarBarToken || parent.operatorToken?.kind === ts.SyntaxKind.AmpersandAmpersandToken)
            && isTruthinessRead (parent);
    }
    return false;
}

// the destructured write is element 0 of the local's own isUTAEnabled options tuple and every
// other use is a truthiness test or that tuple call's defaultValue argument: `bool x` plus
// `x = isTrue (tmp[0])` reads exactly what the object local read, for every box
function destructuredIsUTAEnabledBoolProof (csharp, scope, declaration, idNode, assignment, csharpType) {
    if (csharpType !== 'bool' || !isUTAEnabledAwaitedInit (declaration) || idNode.parent?.elements?.[0] !== idNode) {
        return false;
    }
    const right = assignment?.right;
    const callee = right?.expression;
    if (right?.kind !== ts.SyntaxKind.CallExpression
            || callee?.kind !== ts.SyntaxKind.PropertyAccessExpression
            || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword
            || callee.name?.escapedText !== 'handleOptionAndParams') {
        return false;
    }
    const name = declaration.name?.escapedText;
    const selfArgument = right.arguments?.[3];
    if (selfArgument?.kind !== ts.SyntaxKind.Identifier || selfArgument.escapedText !== name) {
        return false; // the tuple's defaultValue is the local itself at every accepted site
    }
    const identifiers = indexScope (csharp, scope)?.identifiers?.get (name) ?? [];
    for (const n of identifiers) {
        if (n === declaration.name || isNotAUse (n) || useRefersToDeclaration (csharp, scope, declaration, n) === false) {
            continue;
        }
        const arrayParent = n.parent;
        const isDestructuringWrite = (arrayParent?.kind === ts.SyntaxKind.ArrayLiteralExpression)
            && ((arrayParent.parent?.kind === ts.SyntaxKind.BinaryExpression && arrayParent.parent.left === arrayParent && arrayParent.parent.operatorToken?.kind === ts.SyntaxKind.EqualsToken)
                || arrayParent.parent?.kind === ts.SyntaxKind.VariableDeclaration);
        if (isDestructuringWrite) {
            continue; // the audited write; the element-0 position is checked by the caller
        }
        const isWrite = n.parent?.kind === ts.SyntaxKind.BinaryExpression && n.parent.left === n && n.parent.operatorToken?.kind === ts.SyntaxKind.EqualsToken;
        if (isWrite) {
            continue; // a plain write's own value is type-checked by the caller's scan
        }
        if (n === selfArgument || isTruthinessRead (n)) {
            continue;
        }
        return false;
    }
    return true;
}

// one element read of a destructuring block: `<target> = <tmp>[<i>]` where <tmp> is the
// block's holder — indexed directly when the holder is declared `IList<object>`, through the
// `((IList<object>)<tmp>)` cast when it stayed a `var` box
const DESTRUCTURED_READ_RE = /^(\s*)([A-Za-z_][A-Za-z0-9_]*) = ((?:\(\(IList<object>\)[ \t]*([A-Za-z_][A-Za-z0-9_]*)\)|([A-Za-z_][A-Za-z0-9_]*))\[(\d+)\])(;?)$/;

// the audited helper a destructuring statement calls, read off its own holder line
// (`var <tmp> = this.<helper> (…)` / `IList<object> <tmp> = (IList<object>)this.<helper> (…)`):
// which element slots carry the proven string-or-null box is keyed on it
const DESTRUCTURING_HELPER_RE = /^[ \t]*(?:var|IList<object>) [A-Za-z_]\w* = (?:\(IList<object>\)[ \t]*)?this\.([A-Za-z_]\w*)[ \t]*\(/m;
function holderHelper (printed) {
    const match = DESTRUCTURING_HELPER_RE.exec (printed);
    return match === null ? undefined : match[1];
}

// wrap printCustomBinaryExpressionIfAny: the destructuring assignment print emits one
// `<target> = <tmp>[<i>]` line per element — `<tmp>` the holder the statement's own first
// line declares (`IList<object> <tmp> = ...` when the printer typed it, `var <tmp> = ...`
// otherwise, the read then keeping the `((IList<object>)<tmp>)` cast); give every line whose
// target this module retyped the matching cast. Idempotent.
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
        const coercions = destructuredBoolCoercions.get (enclosingFunction (node));
        // the holder name scopes the rewrite to this statement's own reads, in both shapes:
        // `IList<object> tmp = ...; x = tmp[0];` (typed holder, direct index) and
        // `var tmp = ...; x = ((IList<object>)tmp)[0];` (untyped holder, casted read).
        // groups: 1 indent, 2 target, 3 whole read, 4 casted temp, 5 bare temp, 6 index, 7 `;`
        const holder = /^[ \t]*(?:var|IList<object>) ([A-Za-z_]\w*) = /.exec (printed);
        if (holder === null) {
            return printed;
        }
        const temp = holder[1];
        return printed.split ('\n').map ((line) => {
            const match = DESTRUCTURED_READ_RE.exec (line);
            const targetType = ((match === null) || ((match[4] ?? match[5]) !== temp)) ? undefined : types.get (match[2]);
            if (targetType === undefined) {
                return line;
            }
            // the isUTAEnabled shard: the target's only later write is the tuple's element 0,
            // whose runtime box is the user's params value — the bool is named by the isTrue ()
            // coercion every read of the local already applies, never by a cast
            if (coercions !== undefined && coercions.has (match[2])) {
                return match[1] + match[2] + ' = isTrue(' + match[3] + ')' + match[7];
            }
            // the string family proves element 0 of the audited helpers (and every slot
            // DESTRUCTURED_STRING_ELEMENT_INDEXES lists) and casts with the non-nullable
            // spelling this module uses everywhere (the box is a string or null; a reference
            // cast accepts null unchanged)
            if (targetType === 'string' || targetType === 'string?') {
                if (match[6] !== '0' && !stringElementIndexes (holderHelper (printed)).includes (Number (match[6]))) {
                    return line;
                }
                return match[1] + match[2] + ' = (string)' + match[3] + match[7];
            }
            return match[1] + match[2] + ' = (' + targetType + ')' + match[3] + match[7];
        }).join ('\n');
    };
    csharp._destructuredCastsPatched = true;
}

// ---------------------------------------------------------------------------------------------
// cs90 U17 — the null-init string/numeric locals of the roster's name lists plus the two write
// shapes the join cannot name (`symbol = market['symbol']`, `typeof x === 'string'` copies) and
// the no-initialiser scalar-annotation shard. Keyed on the declaration's own NAME throughout.
const U17_STRING_NAMES = new Set ([ 'symbol', 'url', 'channel', 'channelName', 'id', 'tag', 'settle', 'settleId', 'timeInForce' ]);
const U17_NUMERIC_NAMES = new Set ([ 'until', 'timestamp', 'since', 'limit' ]);

// the U17 family name of a declaration, or undefined (`marketType` is U13's, `currency`/`base`/
// `quote`/`bs` are U18's: the roster's name split is what keeps the units apart)
function u17FamilyName (declaration) {
    const name = declaration?.name?.escapedText;
    if (typeof name !== 'string') {
        return undefined;
    }
    return (U17_STRING_NAMES.has (name) || U17_NUMERIC_NAMES.has (name)) ? name : undefined;
}

function isU17NullInitString (declaration) {
    return u17FamilyName (declaration) !== undefined && U17_STRING_NAMES.has (declaration.name.escapedText) && isNullInit (declaration);
}

// `x = market['symbol']` as a write: the audited key table (MARKET_ROW_STRING_KEYS) plus the
// same proven-row receiver scan the declaration shard uses — the box is that string or nothing.
function u17RowReadWriteType (csharp, declaration, node) {
    if (!isU17NullInitString (declaration)) {
        return undefined;
    }
    return (marketRowStringReadType (csharp, node) === 'string') ? 'string' : undefined;
}

// `typeof x === 'string'` prints `(x is string)`, so a copy inside that branch assigns that very
// string box; C# does not narrow the CONVERSION (CS0266), so the write takes the identity
// `(string)` cast — the guard on the same identifier is what makes it safe.
function u17TypeofStringGuardName (condition) {
    if (condition?.kind !== ts.SyntaxKind.BinaryExpression) {
        return undefined;
    }
    const op = condition.operatorToken?.kind;
    if (op !== ts.SyntaxKind.EqualsEqualsEqualsToken && op !== ts.SyntaxKind.EqualsEqualsToken) {
        return undefined;
    }
    const typeofOf = (n) => ((n?.kind === ts.SyntaxKind.TypeOfExpression) ? n.expression?.escapedText : undefined);
    const literalOf = (n) => ((n?.kind === ts.SyntaxKind.StringLiteral) ? n.text : undefined);
    const subject = typeofOf (condition.left) ?? typeofOf (condition.right);
    const literal = literalOf (condition.left) ?? literalOf (condition.right);
    return (literal === 'string') ? subject : undefined;
}

// the identifier a `typeof <id> === 'string'` then-branch narrows, or undefined
function u17NarrowedCopyNodeName (node) {
    let current = node?.parent;
    while (current !== undefined && current.kind !== ts.SyntaxKind.FunctionLikeDeclaration) {
        if (current.kind === ts.SyntaxKind.IfStatement && current.thenStatement !== undefined
                && current.thenStatement.getStart () <= node.getStart () && node.getEnd () <= current.thenStatement.getEnd ()) {
            const name = u17TypeofStringGuardName (current.expression);
            if (name !== undefined) {
                return name;
            }
        }
        current = current.parent;
    }
    return undefined;
}

function u17NarrowedCopyWriteType (declaration, node) {
    if (!isU17NullInitString (declaration) || node?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    return (u17NarrowedCopyNodeName (node) === node.escapedText) ? 'string' : undefined;
}

// the two write shapes this family proves on top of csharpTypeOfValue (see the two comments)
function u17WriteValueType (csharp, declaration, node) {
    return u17RowReadWriteType (csharp, declaration, node) ?? u17NarrowedCopyWriteType (declaration, node);
}

// the write-time record of a retyped U17 local (`scope -> Map<printed name, declaration>`), read
// by the cast below; the declaration NODE keeps a shadowed same-name binding from taking the cast.
const u17RowReadWriteTargets = new WeakMap ();

function recordU17RowReadWriteTarget (scope, printedName, csharpType, declaration) {
    if (scope === undefined || csharpType !== 'string?' || !isU17NullInitString (declaration)) {
        return;
    }
    let targets = u17RowReadWriteTargets.get (scope);
    if (targets === undefined) {
        targets = new Map ();
        u17RowReadWriteTargets.set (scope, targets);
    }
    targets.set (printedName, declaration);
}

// the RHS of a write into a U17 local this module already declared `string?` whose printed value
// is object: the proven market-row read or the `(x is string)`-guarded copy — the cast names the
// box the guard / key census proves, so it cannot throw where the untyped line did not.
function u17WriteNeedsCast (csharp, node) {
    if (node?.kind !== ts.SyntaxKind.ElementAccessExpression && node?.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const parent = node.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression || parent.operatorToken.kind !== ts.SyntaxKind.EqualsToken || parent.right !== node) {
        return false;
    }
    const target = parent.left;
    if (target?.kind !== ts.SyntaxKind.Identifier) {
        return false;
    }
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (node) : enclosingFunction (node);
    const targets = u17RowReadWriteTargets.get (scope);
    const declaration = (targets === undefined) ? undefined : targets.get (target.escapedText);
    if (declaration === undefined || resolveReference (csharp, target) !== declaration) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.ElementAccessExpression) {
        return marketRowStringReadType (csharp, node) === 'string';
    }
    return u17NarrowedCopyNodeName (node) === node.escapedText;
}

// cast-back for the two shapes above, chained on top of every other printElementAccessExpression /
// printIdentifier override (nothing else is touched). Idempotent.
function installU17RowReadWriteCasts (csharp) {
    if (typeof csharp.printElementAccessExpression !== 'function' || csharp._u17RowReadCastsPatched) {
        return;
    }
    const upstreamElement = csharp.printElementAccessExpression.bind (csharp);
    csharp.printElementAccessExpression = (node, identation) => {
        const printed = upstreamElement (node, identation);
        if (typeof printed !== 'string' || !u17WriteNeedsCast (csharp, node)) {
            return printed;
        }
        return '((string)' + printed + ')';
    };
    if (typeof csharp.printIdentifier === 'function') {
        const upstreamIdentifier = csharp.printIdentifier.bind (csharp);
        csharp.printIdentifier = (node) => {
            const printed = upstreamIdentifier (node);
            if (typeof printed !== 'string' || !u17WriteNeedsCast (csharp, node)) {
                return printed;
            }
            return '((string)' + printed + ')';
        };
    }
    csharp._u17RowReadCastsPatched = true;
}

// ---------------------------------------------------------------------------------------------
// A `(string)IDENT` cast the printer wraps around a BARE IDENTIFIER in one of the three
// positions below is an identity cast once the emitted declaration of that identifier already
// is `string`: referenceDeclaredType() names the declaration's final C# type (this module's
// own decision first, the printer's for the shapes it types itself), so the cast's target
// equals the static type it is applied to. The three positions are the only ones where the
// printer wraps the operand unconditionally:
//   `throw new E ((string)x)`      — ast-transpiler printThrowStatement (message argument)
//   `...Remove((string)k)`         — ast-transpiler printDeleteExpression (a `delete x[k]` key)
//   `((IDictionary<string,object>)x)[(string)k] = v` — the dictionary indexer write key
// The indexer rule keeps the key cast whenever the receiver is itself a typed dict local: that
// receiver cast is S21/S22's family and comes off the SAME line, so the key cast stays with it
// and one line is only ever rewritten by one unit.
// Every other spelling keeps its cast: `string?` / `object` locals (the cast is then the only
// thing naming a non-nullable string, or the only thing that compiles), a parameter, an
// element read, `x as string` and a non-identifier operand (those are S09/S10's families, or
// the value itself is not proven). Census on the base tree (campaigns/cs-strict/tools/S05/):
// 139 throw arguments, 127 `.Remove` keys, 1082 indexer-write keys.
function referenceDeclaredCSharpType (csharp, node) {
    if (node?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    let declaration;
    try {
        declaration = resolveReference (csharp, node);
    } catch (e) {
        return undefined;
    }
    if (declaration?.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined; // a parameter is printed `object name = null`, whatever the callers pass
    }
    try {
        return referenceDeclaredType (csharp, declaration);
    } catch (e) {
        return undefined;
    }
}

function provenStringReference (csharp, node) {
    return referenceDeclaredCSharpType (csharp, node) === 'string';
}

function installProvenStringCastDrops (csharp) {
    if (csharp._provenStringCastDropsPatched) {
        return;
    }
    csharp._provenStringCastDropsPatched = true;

    const referenceText = (node) => {
        if (!provenStringReference (csharp, node)) {
            return undefined;
        }
        try {
            const text = csharp.printNode (node, 0);
            return (typeof text === 'string' && text.length > 0) ? text : undefined;
        } catch (e) {
            return undefined; // an in-memory program must not abort the transpile
        }
    };
    // the cast wrapper the printer puts around the operand — `((string)x)` in the throw, where
    // the outer paren is the call's own, and `(string)x` in the delete key / indexer write —
    // or undefined when that exact wrapper is not there exactly once
    const dropCast = (printed, operand, throwWrapper) => {
        const target = throwWrapper ? '((string)' + operand + ')' : '(string)' + operand;
        const at = printed.indexOf (target);
        if (at < 0 || printed.indexOf (target, at + target.length) >= 0) {
            return undefined;
        }
        const replacement = throwWrapper ? '(' + operand + ')' : operand;
        return printed.slice (0, at) + replacement + printed.slice (at + target.length);
    };

    if (typeof csharp.printThrowStatement === 'function') {
        const upstream = csharp.printThrowStatement.bind (csharp);
        csharp.printThrowStatement = (node, identation) => {
            const printed = upstream (node, identation);
            const expression = node?.expression;
            // the wrapper spans the whole argument list, so only a single-argument class throw
            // is rewritten; throwDynamicException and every other shape is left alone
            if (typeof printed !== 'string' || expression?.kind !== ts.SyntaxKind.NewExpression) {
                return printed;
            }
            const args = expression.arguments ?? [];
            if (args.length !== 1) {
                return printed;
            }
            const operand = referenceText (args[0]);
            if (operand === undefined) {
                return printed;
            }
            return dropCast (printed, operand, true) ?? printed;
        };
    }
    if (typeof csharp.printDeleteExpression === 'function') {
        const upstream = csharp.printDeleteExpression.bind (csharp);
        csharp.printDeleteExpression = (node, identation) => {
            const printed = upstream (node, identation);
            if (typeof printed !== 'string') {
                return printed;
            }
            const operand = referenceText (node?.expression?.argumentExpression);
            if (operand === undefined) {
                return printed;
            }
            return dropCast (printed, operand, false) ?? printed;
        };
    }
    if (typeof csharp.printElementAccessExpression === 'function') {
        const upstream = csharp.printElementAccessExpression.bind (csharp);
        csharp.printElementAccessExpression = (node, identation) => {
            const printed = upstream (node, identation);
            // only the write path prints the key with a cast at all: a read is `getValue(x, k)`
            if (typeof printed !== 'string' || !printed.includes ('[(string)')) {
                return printed;
            }
            // the receiver's own cast on this line is S21/S22's family — a typed dict receiver
            // keeps both casts so the line stays theirs alone
            const receiver = referenceDeclaredCSharpType (csharp, node?.expression);
            if (receiver === 'Dictionary<string, object>' || receiver === 'IDictionary<string, object>') {
                return printed;
            }
            const operand = referenceText (node?.argumentExpression);
            if (operand === undefined) {
                return printed;
            }
            return dropCast (printed, operand, false) ?? printed;
        };
    }
}

// the numeric/bool spellings a null-initialised declaration can fall back to when its
// annotation's own type is unreachable for the actual writes (see csharpLocalTypeOf)
const NUMERIC_BOOL_LOCAL_TYPES = [ 'int?', 'Int64?', 'double?', 'bool?' ];

// ---------------------------------------------------------------------------
// The safeString*/safeInteger*/safeTimestamp*/safeNumber* declarations (the helper call IS the
// initialiser) join every later write through typeFromValueOrWrites. A write that reads the
// local itself cannot be resolved by the plain scan: the read's C# static type is the type
// this very call is deciding, so csharpTypeOfValue() sees a classification in progress and
// answers undefined (`let timestamp = this.safeInteger (...); timestamp = timestamp * 1000`).
// The arm below answers exactly those reads with the RUNNING type and re-resolves the write;
// the value keeps the printed expression, and the result is joined box-identically like any
// other write, so a write whose box or value would move still keeps the declaration `object`.
const SAFE_HELPER_LOCAL_METHODS = new Set ([ 'safeString', 'safeString2', 'safeStringLower',
    'safeStringUpper', 'safeInteger', 'safeInteger2', 'safeTimestamp', 'safeNumber' ]);

// `this.<safeString*|safeInteger*|safeTimestamp|safeNumber> (...)` as the whole initialiser
function safeHelperLocalInitializer (node) {
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    return SAFE_HELPER_LOCAL_METHODS.has (callee.name?.escapedText);
}

// the declaration whose later write is being resolved right now, with the type a read of it
// will have once the declaration is retyped (see selfReadWriteType)
const selfReadStack = [];

// The C# static type of a write that reads the declaration being classified, with every such
// read answered by the running type. Only that one declaration is overridden: every OTHER
// declaration's read resolves through the normal path — and that path is isolated from this
// stack (declarationCsharpType / localIdentifierType), because another declaration's answer
// has to be the type the printer emits for it, which was computed without this override.
// The caller rejects the write unless joinTypes() accepts it (the box identity rule); the
// retype scan re-checks every read and write against the final type.
function selfReadWriteType (csharp, context, declaration, runningType, node) {
    if (runningType === undefined || runningType === 'null') {
        return undefined;
    }
    selfReadStack.push ({ declaration, type: runningType });
    try {
        return csharpTypeOfValue (csharp, node, context);
    } finally {
        selfReadStack.pop ();
    }
}

// the declared type from the initializer (`initial` — a proven type, or 'null' for a
// literal null/undefined) joined with every later plain `x = ...` write in the method:
// joinTypes() widens T/T? and List<object>/IList<object> along box-identical edges, and
// a null write (or the null initializer itself) makes the final spelling nullable. An
// unprovable or non-joinable write returns undefined — the printer's `object`
// declaration is kept. csharpLocalIsSafeToRetype() then re-checks every write and every
// read against the final type exactly as for a single-expression local.
function typeFromValueOrWrites (csharp, scope, declaration, varName, initial, context, extraEdges) {
    if (scope === undefined) {
        return undefined;
    }
    const index = indexScope (csharp, scope);
    let type = (initial === 'null') ? undefined : initial;
    let sawNull = (initial === 'null');
    // the interface-first Dictionary widening only applies when THIS declaration's own
    // initializer is the interface (the safeDict* family); null-declared locals keep the
    // null-init join's behaviour
    const interfaceInitial = (initial === 'IDictionary<string, object>');
    for (const n of (index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || isNotAUse (n)) {
            continue;
        }
        // a provably foreign same-name binding's `x = ...` is not a write of this local
        if (useRefersToDeclaration (csharp, scope, declaration, n) === false) {
            continue;
        }
        const parent = n.parent;
        if (parent.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== n || parent.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
            // `[ x, params ] = this.handleM (...)`: not a plain write, but element 0 of an
            // audited string helper (DESTRUCTURED_STRING_HELPERS) is a string or null, so
            // an unannotated `let x = undefined` joins it like a plain write; a
            // LITERAL-initialised local joins the element-0 box the helper's own C# body
            // proves (literalInitElement0Type), which joinTypes keeps box-identical by
            // rejecting any element type its initialiser's box cannot hold (int vs Int64?).
            if (parent.kind === ts.SyntaxKind.ArrayLiteralExpression
                    && parent.parent?.kind === ts.SyntaxKind.BinaryExpression && parent.parent.left === parent
                    && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                const destructuredCallee = parent.parent.right?.expression;
                const destructuredName = (destructuredCallee?.kind === ts.SyntaxKind.PropertyAccessExpression && destructuredCallee.expression?.kind === ts.SyntaxKind.ThisKeyword)
                    ? destructuredCallee.name?.escapedText : undefined;
                let elementType;
                if (initial === 'null') {
                    elementType = (destructuredName !== undefined && destructuredStringElementProof (csharp, declaration, n, parent.parent, destructuredName, context)) ? 'string' : undefined;
                } else if (destructuredName !== undefined) {
                    elementType = literalInitElement0Type (csharp, declaration, n, parent.parent, destructuredName, context);
                }
                if (elementType === undefined) {
                    // U14 bool shard: element 0 of a bool helper is a boxed bool or null on every
                    // path (per-call-site option proof, or the helper's own bool? local), and
                    // sawNull below spells the declaration `bool?`. The helper name comes off the
                    // RHS, so the awaited venue helper and every initialiser shape are covered.
                    const optionHelper = (destructuredName !== undefined) ? destructuredName : destructuredHelperName (parent.parent.right);
                    if (destructuredBoolElementProof (declaration, n, parent.parent, optionHelper)) {
                        elementType = 'bool';
                    }
                }
                if (elementType !== undefined) {
                    // the element can be null (the helper's default paths hand back null), so the
                    // write contributes the nullable spelling of the string box, exactly like a
                    // null write does for the null-initialised shard
                    sawNull = true;
                    type = (type === undefined) ? elementType : joinTypes (type, elementType);
                    if (type === undefined) {
                        return undefined;
                    }
                }
            }
            continue;
        }
        let written = csharpTypeOfValue (csharp, parent.right, context);
        if (written === undefined) {
            // U17: a MARKET ROW read by an audited string key, or a `typeof x === 'string'`
            // narrowed copy (see u17RowReadWriteType / u17NarrowedCopyWriteType)
            written = u17WriteValueType (csharp, declaration, parent.right);
        }
        if (written === undefined && type === 'string' && !sawNull) {
            // `x = x + r` accumulator write (see the self-concat section above): the
            // read of x inside the value has no C# type until this declaration decides
            // one, so the value is proven from the operands plus the running type.
            written = selfConcatWriteType (csharp, context, declaration, parent.right);
        }
        if (written === undefined && type === 'string' && !sawNull && isStringLiteralInit (declaration)) {
            // U21: the same self-read shape with a sibling leaf the module cannot name
            // (`x = x + ':' + symbol`), and the conditional over such values
            // (`x = cond ? 'a' + x : x`) — the left spine's own static type decides the
            // emitted add(...) chain, so the write keeps the literal's non-null string
            written = stringAccumulatorWriteType (csharp, context, declaration, parent.right);
        }
        if (written === undefined && type === 'Dictionary<string, object>' && !sawNull) {
            // `x = this.omit (x, keys)` accumulator write: same self-read shape, proven
            // against the running Dictionary type (see selfOmitWriteType).
            written = selfOmitWriteType (csharp, context, declaration, parent.right);
        }
        if (written === undefined && safeHelperLocalInitializer (declaration.initializer)) {
            // `let x = this.safeString (…); … x = <expression reading x>`: the read of x inside
            // the write is statically the declaration's own type, so the expression can only be
            // resolved against the running type (see selfReadWriteType). A write whose box or
            // value would move is still rejected by joinTypes below.
            written = selfReadWriteType (csharp, context, declaration, type, parent.right);
        }
        if (written === undefined) {
            // `x = c ? D : x` — the default-if-unset ternary write: the value reads this very
            // local, so the write's contribution is the OTHER arm's type (selfTernaryWriteType);
            // the running type is joined with it exactly like any other write. When that arm's box
            // ALREADY fits the running declaration by an implicit, box-identical conversion
            // (assignable — Dictionary into its IDictionary declaration, a List into its IList
            // one), the write cannot move the declaration at all: the ternary is target-typed to
            // the local's own type, exactly like the `object` declaration it replaces.
            const selfTernaryArm = selfTernaryWriteType (csharp, context, declaration, parent.right);
            if (selfTernaryArm !== undefined) {
                if (type !== undefined && assignable (type, selfTernaryArm)) {
                    continue;
                }
                written = selfTernaryArm;
            }
        }
        if (written === undefined) {
            return undefined;
        }
        if (written === 'null') {
            sawNull = true;
            continue;
        }
        type = (type === undefined) ? written : joinTypes (type, written, (interfaceInitial && extraEdges === undefined) ? INTERFACE_FIRST_WIDENING_EDGES : extraEdges);
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
//   - currencyToPrecision: both return paths hand back a string or null; its `return
//     this.forceString (fee)` / `return this.decimalToPrecision (...)` statements are the
//     only ones that need the unboxing wrap (the value keeps its box).
//   - parsePrecision: every path returns null / a string literal / add(<string>, <literal>)
//     whose box is a non-null string (the loop accumulator starts at a string literal and
//     only ever accumulates more literals), so the wrapped returns never see a non-string
//     box. No venue overrides it; every call site passes the result to parseNumber /
//     Precise.string* (object parameters) or stores it in a local.
export const CSHARP_METHOD_RETURN_TYPES = {
    'safeSymbol': 'string?',
    'safeCurrencyCode': 'string?',
    'safeMarket': 'Dictionary<string, object>',
    'currencyToPrecision': 'string?',
    'parsePrecision': 'string?',
    // cs/ccxt/base/PredictionExchange.cs — the prediction row builders and their parse*
    // wrappers. Both families are declared ONLY in the prediction tier (the whole
    // cs/ccxt/exchanges tree declares none of these names), so the per-NAME table cannot
    // leak into the crypto/ws trees. Return-path census over every declaration:
    //   safePredictionOrder / safePredictionTicker / safePredictionTrade — single
    //     `return result;`, result declared `Dictionary<string, object>` (fresh literal);
    //     the return cast is an identity on every path.
    //   parsePredictionOrder / parsePredictionTicker / parsePredictionTrade — base stub
    //     (throw) plus one venue override each; every real return is
    //     `this.safePredictionX(new Dictionary<string, object>() {...})`, so once the safe
    //     builder carries the type the returned box already IS a Dictionary.
    //   parsePredictionOrders / parsePredictionTrades — `return this.filterByOutcomeSinceLimit (...)`,
    //     generated `IList<object>` in the same file (the collection-return pass).
    // The outcome cache accessors: `outcome()` returns ONLY map reads — every value in
    // this.outcomes / this.outcomes_by_id was recorded as an IDictionary<string, object>
    // (the base indexMarketOutcomes casts each row to IDictionary before writing it; the
    // hyperliquid writer stores a safeDict result), so the box is an IDictionary on every
    // path. `safeOutcome` / `loadOutcome` are retyped by the same proof in
    // CSHARP_COLLECTION_RETURN_METHODS / CSHARP_ASYNC_CORE_RETURNS: their map reads are the
    // same rows, their last path is the fresh Dictionary literal, and the 2-arg passthrough
    // returns the caller's outcomeObj behind the boundary cast — every in-tree 2-arg caller
    // passes a market row (safeMarket/parseMarket result / `market as any`).
    // `safeOutcomeSymbol` returns the row's `outcome` handle (string) or null — the
    // caller-facing TS return type is Str (string|undefined).
    'safePredictionOrder': 'Dictionary<string, object>',
    'safePredictionTicker': 'Dictionary<string, object>',
    'safePredictionTrade': 'Dictionary<string, object>',
    'parsePredictionOrder': 'Dictionary<string, object>',
    'parsePredictionTicker': 'Dictionary<string, object>',
    'parsePredictionTrade': 'Dictionary<string, object>',
    'parsePredictionOrders': 'IList<object>',
    'parsePredictionTrades': 'IList<object>',
    'outcome': 'IDictionary<string, object>',
    'safeOutcomeSymbol': 'string?',
    // base + venue helper returning the caller's dictionary (this unit's local family: a
    // dict-literal declaration whose last write is this call). mergeBalanceAccount: both
    // return paths are `return result;` and all 10 in-tree callers pass a fresh dict literal
    // (binance/gate/htx/kucoin/mexc + cs/tests/Generated/Base/test.mergeBalanceAccount.cs).
    // createSignedRequest: grvt's single declaration, one `return request;` — every caller
    // passes a dict literal and the body indexes request['signature'] on every path.
    'mergeBalanceAccount': 'Dictionary<string, object>',
    'createSignedRequest': 'Dictionary<string, object>',
    // bitstamp pro (the only declaration tree-wide): `return newCache;` — the caller's own
    // fresh ArrayCacheBySymbolById (both call sites pass `new ArrayCacheBySymbolById (limit)`)
    // after appending the entries of the symbols that stay subscribed. The boundary cast the
    // installer emits names that box; the retype is what lets the two call sites — the writes
    // into the retyped this.orders / this.myTrades fields — keep compiling.
    'pruneCachedBySymbols': 'ccxt.pro.ArrayCache',
    // S54 census: prediction helpers whose every return path is `this.safeDict (...)` or a
    // local proven the same IDictionary box (findOutcomeInMarket's `oc`, resolveOutcomeInput's
    // `found`) — the box is the found row itself, so the boundary cast only names it.
    'findOutcomeInMarket': 'IDictionary<string, object>',
    'resolveOutcomeInput': 'IDictionary<string, object>',
    // S54 census: string-valued venue helpers whose printed return expression is `object`
    // (a local the local pass keeps object, or an add chain over one) — the wrapper below
    // casts every return, null in / null out; the nullable spelling keeps CS8603 out.
    'formatNumber': 'string?',
    'opinionWsUrl': 'string?',
    'urlEncodeQuery': 'string?',
    'urlencodeWithArrayBrackets': 'string?',
    // U33 census: four sync helpers whose TS return type is `any` (a Dict index / a
    // safeValue chain / an untyped urls-map read), so the CSHARP_STRING_RETURN_METHODS
    // stringishReturn gate cannot name them — the wrapper below casts every return (null in,
    // null out) and the nullable spelling keeps CS8603 out.
    //   getSupportedMapping (base, 1 declaration): `if (key in mapping) return mapping[key];
    //     else throw NotSupported` — never returns null, and all 9 in-tree call sites pass an
    //     inline dict literal whose every value is a string (pro/hitbtc 2, pro/gate 6,
    //     pro/bitget 1), so the `string` spelling is exact at every caller.
    //   getUrlByMarket (pro/gate, 1 declaration): the three paths are
    //     `urls['api'][market['type']]['usdt'|'btc']` for a contract market and
    //     `urls['api'][market['type']]` otherwise; gate's urls['api'] holds 2 string leaves
    //     ('ws', 'spot') and 3 dict-of-2-string leaves (swap/future/option), and a market
    //     row's 'type' is one of spot/swap/future/option, so every reachable box is a string.
    //   convertTypeToAccount (base, 1 declaration): 3 paths — options['accountsByType']
    //     values (string-valued in every in-tree writer: okx/bigone/poloniex/bydfi/bitget
    //     option tables), market['id'] (the MARKET_ROW_STRING_KEYS proof), and `account`,
    //     whose own `((string)account).ToLower()` unbox at the top of the body throws before
    //     any return for a non-string argument.
    //   codeFromOptions (deribit, 1 declaration): the value is deribit's
    //     options['code']/options[methodName]['code'] (string literals in describe()) or the
    //     caller's params['code']; all 4 call sites immediately unbox the result with
    //     `this.currency (((string)code))`, so the funnel adds no new failure mode there.
    'getSupportedMapping': 'string',
    'getUrlByMarket': 'string?',
    'convertTypeToAccount': 'string?',
    'codeFromOptions': 'string?',
    // U33 census, 2 declarations (base Exchange.ts + htx's override): every return path of
    // both boxes a string or null. Base: `undefined`, the `string? networkId` local, the
    // safeString(networks[networkCode], 'id') read, the recursive call (fixpoint), and the
    // `return networkCode` fallback — the caller's own argument, and the TS signature is
    // `(networkCode: Str, …): Str`, with all 56 in-tree call sites passing a string-typed
    // expression (47 × a handleNetworkCodeAndParams element-0 `string?` local, 6 × `network`,
    // 1 × the recursion's `oldCodes[networkCode]` from the base default options table's 3
    // string entries, 1 × defaultNetworkCode, 1 × hashkey's `string? networkId`). htx:
    // `null`, `base.networkCodeToId (…)` (fixpoint), and the
    // `options['networkChainIdsByNames'][currencyCode][networkCode]` / safeValue read of the
    // map whose only writer is `[code][title] = safeString (chainEntry, 'chain')` (string?).
    // The string-returns table cannot carry it: htx's override has no TS return annotation
    // and its inferred type is not string-ish, so stringishReturn would keep the override's
    // signature `object` while printMethodDefinition substitutes the base's `string?` — the
    // override's four untyped returns would then be CS0266. This wrapper casts every return
    // of every declaration, so the base + the override stay consistent (CS0508).
    'networkCodeToId': 'string?',
    // U37 census: venue-local string helpers whose returns need the boundary cast.
    //   fromEp / fromEv / fromEr — phemex + its pro override (49 call sites, all in those two
    //     files; every argument is a safeString* result or a string-only local). Return paths:
    //     the `ep` param (string-or-null at every call site), or this.fromEn (string?).
    //   convertToRealAmount — bitmex, 11 call sites, every `amount` argument is a safeString
    //     result / Precise.string* result / string-only local. Paths: `amount` param, null,
    //     Precise.stringMul (string?).
    //   signOrder — nado + derive only; both return their own signHash, whose add chain over
    //     padHex/intToBase16/string literals boxes a string on every path.
    'fromEp': 'string?',
    'fromEv': 'string?',
    'fromEr': 'string?',
    'convertToRealAmount': 'string?',
    'signOrder': 'string?',
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
        // U49: a return path whose expression already carries the retyped box (a call to a
        // method whose generated signature names it, or a local the local pass declares with it)
        // needs no boundary cast — `((T)((object)(x)))` is then a box + unbox of the same value
        if (callReturnIsMapped (csharp, node.expression, retype)) {
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

// a holder whose printed initializer is a `this.<name>(...)` call the collection table proves
// returns a List<object> (the table is per-NAME: every declaration of a listed name returns
// that box), so the hoisted cast is an identity and only the declaration's list type is left
function listReturningHandleCall (expr) {
    const match = /^this\.([A-Za-z_]\w*)\s*\(/.exec (expr);
    if (match === null) {
        return false;
    }
    const name = match[1];
    if (!Object.prototype.hasOwnProperty.call (CSHARP_COLLECTION_RETURN_METHODS, name)) {
        return false;
    }
    const mapped = CSHARP_COLLECTION_RETURN_METHODS[name];
    return mapped === 'List<object>' || mapped === 'IList<object>';
}

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
    const cast = listReturningHandleCall (expr) ? '' : '(IList<object>)';
    return indent + 'IList<object> ' + name + ' = ' + cast + expr + ';\n' + rest;
}

// ===== redundant `((string)add (a, b))` casts =====
// ast-transpiler wraps a throw argument, a startsWith / endsWith / replace argument and a
// `delete obj[key]` key in `((string)...)` unconditionally. `add (a, b)` returns `string` when
// its LEFT operand's C# static type already is `string` (add(string, *)), so the cast's target
// IS the static type — an identity conversion. Proof: isProvablyStringOperand (the module's
// operand prover) + exchangeIdRead for the generated tests' `<exchangeVar>.id`; a nested `+` is
// decided by its leftmost operand, so the spine is walked.
function concatLeftOperandIsString (csharp, node) {
    let current = node;
    while (current?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.expression;
    }
    if (current === undefined) {
        return false;
    }
    if (exchangeIdRead (csharp, current) || isProvablyStringOperand (csharp, current)) {
        return true;
    }
    if (current?.kind === ts.SyntaxKind.BinaryExpression && current.operatorToken?.kind === ts.SyntaxKind.PlusToken) {
        return concatLeftOperandIsString (csharp, current.left);
    }
    return false;
}

// `<exchangeVar>.id` in the generated tests: the exchange is held in a parameter the test
// driver's post-print regex declares `Exchange exchange` / `BaseExchange exchange`, whose `id`
// is the hand-written `public string id { get; set; }` — the same member isProvablyStringOperand
// accepts on `this`. receiverIsExchange proves the receiver is that class and not an `any`.
function exchangeIdRead (csharp, node) {
    return node?.kind === ts.SyntaxKind.PropertyAccessExpression
        && node.name?.escapedText === 'id'
        && node.expression?.kind === ts.SyntaxKind.Identifier
        && receiverIsExchange (csharp, node.expression);
}

// strip the printer's cast around a concat argument: `<pattern>` (with $ARG = the printed
// concat) is replaced by `<replacement>`. Any mismatch — a multi-argument throw, a different
// print, a concatenation the printer did not wrap — leaves the text untouched.
function dropRedundantAddCast (csharp, printed, node, argText, pattern, replacement) {
    if (typeof printed !== 'string' || !concatLeftOperandIsString (csharp, node)) {
        return printed;
    }
    const text = concatArgumentText (csharp, node, argText ?? csharp.printNode (node, 0));
    if (typeof text !== 'string' || text === '' || text.includes ('\n')) {
        return printed;
    }
    const needle = pattern.replace ('$ARG', text);
    if (!printed.includes (needle)) {
        return printed;
    }
    // a function replacement: `$` in the message literals must never be read as a backreference
    const fixed = replacement.replace ('$ARG', text);
    return printed.replace (needle, () => fixed);
}

// the printed argument this pass wraps in `(string)`: the `add (a, b)` helper call, or the
// native `(a + b)` the U57 hook prints for the same node. Every other text is rejected.
function concatArgumentText (csharp, node, text) {
    if (typeof text !== 'string' || text.startsWith ('add(')) {
        return text;
    }
    if (typeof csharp.csharpNativeStringConcat !== 'function' || node?.kind !== ts.SyntaxKind.BinaryExpression || node.operatorToken?.kind !== ts.SyntaxKind.PlusToken) {
        return undefined;
    }
    const native = csharp.csharpNativeStringConcat (node.left, node.right, csharp.printNode (node.left, 0), csharp.printNode (node.right, 0));
    return (native === text) ? text : undefined;
}

// install the wrappers. Idempotent; every printer method is optional (a pin without it is a no-op).
function installRedundantAddCasts (csharp) {
    if (csharp._redundantAddCastsPatched) {
        return;
    }
    // `throw new X ((string)add(a, b)) ;` — the outer parens are the constructor's
    if (typeof csharp.printThrowStatement === 'function') {
        const upstream = csharp.printThrowStatement.bind (csharp);
        csharp.printThrowStatement = (node, identation) => {
            const printed = upstream (node, identation);
            const expression = node?.expression;
            const arg = (expression?.kind === ts.SyntaxKind.NewExpression && expression.arguments?.length === 1)
                ? expression.arguments[0]
                : undefined;
            return dropRedundantAddCast (csharp, printed, arg, undefined, '((string)$ARG)', '($ARG)');
        };
    }
    // `delete x["k" + v]` -> `...Remove((string)add("k", v))`
    if (typeof csharp.printDeleteExpression === 'function') {
        const upstream = csharp.printDeleteExpression.bind (csharp);
        csharp.printDeleteExpression = (node, identation) =>
            dropRedundantAddCast (csharp, upstream (node, identation), node?.expression?.argumentExpression, undefined, 'Remove((string)$ARG)', 'Remove($ARG)');
    }
    // `x.startsWith("a" + b)` -> `.StartsWith(((string)add("a", b)))`
    if (typeof csharp.printStartsWithCall === 'function') {
        const upstream = csharp.printStartsWithCall.bind (csharp);
        csharp.printStartsWithCall = (node, identation, name, parsedArg) =>
            dropRedundantAddCast (csharp, upstream (node, identation, name, parsedArg), node?.arguments?.[0], parsedArg, 'StartsWith(((string)$ARG))', 'StartsWith($ARG)');
    }
    if (typeof csharp.printEndsWithCall === 'function') {
        const upstream = csharp.printEndsWithCall.bind (csharp);
        csharp.printEndsWithCall = (node, identation, name, parsedArg) =>
            dropRedundantAddCast (csharp, upstream (node, identation, name, parsedArg), node?.arguments?.[0], parsedArg, 'EndsWith(((string)$ARG))', 'EndsWith($ARG)');
    }
    // `x.replace("a" + b, c)` -> `.Replace((string)add("a", b), c)`
    if (typeof csharp.printReplaceCall === 'function') {
        const upstream = csharp.printReplaceCall.bind (csharp);
        csharp.printReplaceCall = (node, identation, name, parsedArg, parsedArg2) =>
            dropRedundantAddCast (csharp, upstream (node, identation, name, parsedArg, parsedArg2), node?.arguments?.[0], parsedArg, 'Replace((string)$ARG, ', 'Replace($ARG, ');
    }
    if (typeof csharp.printReplaceAllCall === 'function') {
        const upstream = csharp.printReplaceAllCall.bind (csharp);
        csharp.printReplaceAllCall = (node, identation, name, parsedArg, parsedArg2) =>
            dropRedundantAddCast (csharp, upstream (node, identation, name, parsedArg, parsedArg2), node?.arguments?.[0], parsedArg, 'Replace((string)$ARG, ', 'Replace($ARG, ');
    }
    csharp._redundantAddCastsPatched = true;
}

// ===== the printer's list-cast skip (`x.push (v)`) =====
//
// `x.push (v)` prints `((IList<object>)x).Add(v)`: the cast is how the printer reaches
// ICollection<object>.Add on a receiver it printed as `object`. When this module retypes
// that declaration to List<object> / IList<object> (installCsharpLocalTypes), the cast is
// an identity conversion on the receiver and the printer must print `x.Add(v)`. The
// printer cannot see the post-print retype, so it asks this hook for the type the PRINTED
// declaration of a local read carries (csharpTranspiler.csharpLocalTypeOf, consumed by
// csharpReceiverIsDeclaredList). An `object` receiver — a parameter, a member read, a
// composite expression, or a local this module leaves `object` — answers nothing and keeps
// the cast exactly as before.
//
// Only the shape the retype really rewrites answers, or the printer would drop a cast the
// declaration still needs:
//   - localIdentifierType's proof: exactly one binding of the name in the enclosing
//     function, a plain variable declaration, one declarator, read after it;
//   - the printer's own print of that declaration must be the `<VAR_TOKEN> x = ` head — a
//     `var x = ` (`new` initializer) or a type the printer named itself is printed as-is
//     and never rewritten;
//   - an awaited initializer is skipped by the retype (awaitedCallIsPrintedAsProven needs
//     the printed value), so it keeps the cast.
function listLocalReadType (csharp, node) {
    const type = localIdentifierType (csharp, node);
    if ((type !== 'List<object>') && (type !== 'IList<object>')) {
        return undefined;
    }
    const reference = resolveReference (csharp, node);
    if (reference?.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined;
    }
    if (typeof csharp.getCSharpLocalType !== 'function' || csharp.getCSharpLocalType (reference) !== csharp.VAR_TOKEN) {
        return undefined;
    }
    if (reference.initializer?.kind === ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    return type;
}

function installCsharpListCastSkips (csharp) {
    csharp.csharpLocalTypeOf = (node) => ((node?.kind === ts.SyntaxKind.Identifier) ? listLocalReadType (csharp, node) : undefined);
}

// ===== the printer's element-access cast skip (`((List<object>)x)[i] = v`) =====
//
// `x[i] = v` on a list prints `((List<object>)x)[Convert.ToInt32(i)] = v`: the cast is how
// the printer reaches the indexer of a receiver it printed as `object`. When this module
// retypes that declaration to List<object> (installCsharpLocalTypes), the cast is an
// identity conversion on the receiver, and the ast printer prints `x[Convert.ToInt32(i)] = v`
// instead. The printer cannot see the post-print retype, so it asks this hook what the
// PRINTED declaration of a local read carries (ast src/csharpTranspiler.ts
// #csharpElementAccessReceiverIsList). An `object` receiver — a parameter, a member read, a
// call result, or a local this module leaves `object` — answers nothing and keeps the cast
// exactly as before.
//
// Only the shapes the retype really rewrites answer, or the printer would drop a cast the
// declaration still needs:
//   - localIdentifierType's proof: exactly one binding of the name in the enclosing
//     function, a plain variable declaration, one declarator, read after it;
//   - the printer's own print of that declaration must be the `<VAR_TOKEN> x = ` head — a
//     `var x = ` (`new` initializer) or a type the printer named itself is printed as-is
//     and never rewritten;
//   - an awaited initializer is skipped by the retype (awaitedCallIsPrintedAsProven needs
//     the printed value), so it keeps the cast.
// The answer is the PRINTED type: List<object> or IList<object>. The element-access rule
// consumes only the concrete List<object> — the cast it removes is `(List<object>)`, an
// identity on that spelling and a runtime-checked downcast on an IList<object> receiver.
function elementAccessListReceiverType (csharp, node) {
    const type = localIdentifierType (csharp, node);
    if ((type !== 'List<object>') && (type !== 'IList<object>')) {
        return undefined;
    }
    const reference = resolveReference (csharp, node);
    if (reference?.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined;
    }
    if (typeof csharp.getCSharpLocalType !== 'function' || csharp.getCSharpLocalType (reference) !== csharp.VAR_TOKEN) {
        return undefined;
    }
    if (reference.initializer?.kind === ts.SyntaxKind.AwaitExpression) {
        return undefined;
    }
    return type;
}

// install before the printer prints a body (idempotent); every consumer asks the same
// question so one installer can serve them all
function installCsharpElementAccessCastSkips (csharp) {
    if (csharp._elementAccessCastSkipsPatched) {
        return;
    }
    csharp.csharpLocalTypeOf = (node) => ((node?.kind === ts.SyntaxKind.Identifier) ? elementAccessListReceiverType (csharp, node) : undefined);
    csharp._elementAccessCastSkipsPatched = true;
}

// ===== S22: dictionary index-write cast elision =====
//
// `((IDictionary<string,object>)x)["k"] = v` — the interface cast the printer wraps around every
// dictionary-key write exists only because the TS type of the receiver says nothing about the C#
// declaration the printer emits for it. The cast is redundant exactly when that declaration
// already names a concrete dictionary, and the declaration line is produced HERE (this module's
// rewrite) or by the printer's own tables — never by the TS annotation. So the declared type is
// recorded while the line is printed and queried by the printer hook
// `csharpDictionaryIndexWriteNeedsNoCast` (ast-transpiler src/csharpTranspiler.ts, called from
// baseTranspiler's C# element-access branch). A receiver that is not a recorded local — a
// parameter, a field, `this.x`, a call result, or a local this module left `object` — keeps the
// cast. `request` is unit S21's receiver family and is excluded by name.
const DECLARED_LOCAL_LINE_RE = /^[ \t]*([A-Za-z_][A-Za-z0-9_<>,?.\[\] ]*?) ([A-Za-z_]\w*) = (.*)$/;
const declaredLocalLines = new WeakMap (); // enclosing function -> Map (name -> { type, value })

// the declared type of the local on the line this module emits for `node`, recorded under the
// enclosing function (the declaration is always printed before any use of it)
function recordDeclaredLocalLine (csharp, node, printed) {
    const declarations = node?.declarations;
    if (!declarations || declarations.length !== 1) {
        return;
    }
    const declaration = declarations[0];
    const name = declaration.name?.escapedText;
    if (declaration.name?.kind !== ts.SyntaxKind.Identifier || name === undefined) {
        return;
    }
    // the printer renames reserved words on the way out (`params` -> `parameters`), so the
    // emitted line has to be matched under the printed name while the record stays keyed by
    // the source name the use site reports
    const printedName = (typeof csharp.printNode === 'function') ? csharp.printNode (declaration.name, 0) : name;
    let parts;
    for (const line of printed.split ('\n')) {
        const match = DECLARED_LOCAL_LINE_RE.exec (line);
        if (match !== null && (match[2] === printedName || match[2] === name)) {
            parts = { type: match[1], value: match[3] };
            break;
        }
    }
    if (parts === undefined) {
        return;
    }
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (declaration) : enclosingFunction (declaration);
    if (scope === undefined) {
        return;
    }
    let map = declaredLocalLines.get (scope);
    if (map === undefined) {
        map = new Map ();
        declaredLocalLines.set (scope, map);
    }
    map.set (name, parts);
}

// the recorded declaration of `name` as seen from `node`: the nearest enclosing function that
// declares it (a use inside a nested arrow reads an outer scope)
function declaredLocalOfUse (csharp, node, name) {
    const enclosing = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction.bind (csharp) : enclosingFunction;
    let scope = enclosing (node);
    while (scope !== undefined) {
        const map = declaredLocalLines.get (scope);
        if (map !== undefined && map.has (name)) {
            return map.get (name);
        }
        scope = enclosing (scope);
    }
    return undefined;
}

// the local a dictionary-write receiver names: the identifier itself, or the identifier under
// a TS assertion whose C# print is that very identifier (`(x as Dict)['k'] = v` — the C#
// printAsExpression falls through to the bare expression for every type that is not `any`,
// `string` or `T[]`, and those three are the only shapes that print a cast of their own).
// The TS source may parenthesize the assertion (`(x as Dict)['k'] = v` is one node deeper:
// ParenthesizedExpression(AsExpression)), and the C# printer prints that paren away — unwrap it
// so the same proof applies to both spellings.
function dictionaryWriteReceiverIdentifier (expression) {
    while (expression?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        expression = expression.expression;
    }
    if (expression?.kind === ts.SyntaxKind.Identifier) {
        return expression;
    }
    if (expression?.kind !== ts.SyntaxKind.AsExpression || expression.expression?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const type = expression.type;
    if (type === undefined
        || type.kind === ts.SyntaxKind.AnyKeyword
        || type.kind === ts.SyntaxKind.StringKeyword
        || type.kind === ts.SyntaxKind.ArrayType) {
        return undefined;
    }
    return expression.expression;
}

// true when the receiver of this index WRITE is a local whose printed declaration already is a
// concrete dictionary (the `var x = new Dictionary<string, object>()` shape included: the
// printer spells a NewExpression initializer `var`, and that value names the type)
function csharpDictionaryIndexWriteNeedsNoCast (csharp, node) {
    const receiver = dictionaryWriteReceiverIdentifier (node?.expression);
    if (receiver === undefined) {
        return false; // `x["a"]["b"]`, a call result, `this.x`: not a named local
    }
    if (receiver.escapedText === 'request') {
        return false; // S21 owns the `request` receiver family
    }
    const recorded = declaredLocalOfUse (csharp, node, receiver.escapedText);
    if (recorded === undefined) {
        return false;
    }
    if (recorded.type === 'Dictionary<string, object>' || recorded.type === 'IDictionary<string, object>') {
        return true;
    }
    return recorded.type === 'var' && /^new (I?Dictionary)<string, object>/.test (recorded.value.trim ());
}

// the key shapes the dictionary index write accepts: a string, a union holding one, or an
// unknown key (the same set the base C# branch and ccxt's own union override print)
function csharpDictionaryIndexWriteUsesStringKey (csharp, node) {
    const keyType = csharp.getChecker ().getTypeAtLocation (node.argumentExpression);
    if (keyType.flags === ts.TypeFlags.Any || csharp.isStringType (keyType.flags)) {
        return true;
    }
    const members = (keyType.flags === ts.TypeFlags.Union) ? (keyType.types ?? []) : [];
    return members.some ((t) => csharp.isStringType (t.flags));
}

// the same gate, applied where ccxt's own printer setup answers first: its
// printElementAccessExpressionExceptionIfAny (build/csharp-worker.ts) returns the cast for
// every union-typed key before the base C# branch — and therefore before the hook above — can
// run, so a typed-dict receiver with a `(string)`-cast key would otherwise keep it. Wrapping
// the override with the identical target shape keeps the emission of both paths the same.
function installCsharpDictionaryIndexWriteException (csharp) {
    if (typeof csharp.printElementAccessExpressionExceptionIfAny !== 'function') {
        return;
    }
    const upstream = csharp.printElementAccessExpressionExceptionIfAny.bind (csharp);
    csharp.printElementAccessExpressionExceptionIfAny = (node) => {
        const parent = node?.parent;
        const isWrite = parent?.kind === ts.SyntaxKind.BinaryExpression
            && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken || parent.operatorToken.kind === ts.SyntaxKind.PlusEqualsToken)
            && parent.left === node;
        if (isWrite
            && csharpDictionaryIndexWriteUsesStringKey (csharp, node)
            && csharpDictionaryIndexWriteNeedsNoCast (csharp, node)) {
            const cast = ts.isStringLiteralLike (node.argumentExpression) ? '' : '(string)';
            return csharp.printNode (node.expression, 0) + '[' + cast + csharp.printNode (node.argumentExpression, 0) + ']';
        }
        return upstream (node);
    };
}

function installCsharpDictionaryIndexWriteCastElision (csharp) {
    if (csharp._dictionaryIndexWriteCastPatched) {
        return;
    }
    csharp._dictionaryIndexWriteCastPatched = true;
    if (typeof csharp.printVariableDeclarationList === 'function') {
        const upstream = csharp.printVariableDeclarationList.bind (csharp);
        csharp.printVariableDeclarationList = (node, identation) => {
            const printed = upstream (node, identation);
            recordDeclaredLocalLine (csharp, node, printed);
            return printed;
        };
    }
    installCsharpDictionaryIndexWriteException (csharp);
    csharp.csharpDictionaryIndexWriteNeedsNoCast = (node) => csharpDictionaryIndexWriteNeedsNoCast (csharp, node);
}

// wrap printVariableDeclarationList on a Transpiler's C# printer. Idempotent. Everything
// the upstream printer already typed (or printed in another shape) is returned untouched;
// only an exact `<iden>object <name> = ` prefix is rewritten.
export function installCsharpLocalTypes (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printVariableDeclarationList !== 'function') {
        return;
    }
    installRedundantAddCasts (csharp);
    installCsharpListCastSkips (csharp);
    installCsharpElementAccessCastSkips (csharp);
    installDestructuredCasts (csharp);
    installProvenStringCastDrops (csharp);
    // the printer's destructuring holder (csharpDestructuringTempType): the ccxt proof for the
    // `handle*AndParams` tuple family — the holder IS the list the call returned, so the printer
    // declares it `IList<object>` and reads it without the `((IList<object>)holder)[i]` re-cast.
    // Every other callee returns undefined and keeps the untyped `var` holder + casted read.
    csharp.csharpDestructuringTempType = (initializer) => {
        if (destructuredHandleCallName (initializer) === undefined) {
            return undefined;
        }
        const hookScope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (initializer) : enclosingFunction (initializer);
        if (hookScope !== undefined && indexScope (csharp, hookScope).bindingNames.has ('IList')) {
            return undefined; // a local/parameter named IList would stop the type token meaning a type
        }
        return 'IList<object>';
    };
    installTypedDictElementAccess (csharp);
    // U02: the C# type `typeCoreArgs` narrows the parameter at (method, position) to, or
    // undefined; stringListParameterElementType reads it to prove a list receiver's elements.
    // hasOwnProperty because the table is an object literal (`CORE_LIST_ARGS['toString']` would
    // answer Object.prototype's). The table is read here, inside the installer -- importing the
    // module is not enough, the transpiler's own module may still be initialising.
    csharp.csharpListTypedCoreArg = (methodName, position) => {
        if (!Object.prototype.hasOwnProperty.call (CORE_LIST_ARGS, methodName)) {
            return undefined;
        }
        const type = CORE_LIST_ARGS[methodName][position];
        return (type !== undefined && CORE_LIST_TARGET_TYPES.indexOf (type) !== -1) ? type : undefined;
    };
    if (csharp._localTypesPatched) {
        // record every emitted local declaration line (S22 dictionary index-write cast elision)
        installCsharpDictionaryIndexWriteCastElision (csharp);
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
        // (a different static type) even though the AST still reads `await this.X(...)`,
        // while a bare `await promiseAll (...)` prints as that very call
        if (declaration.initializer?.kind === ts.SyntaxKind.AwaitExpression && !awaitedCallIsPrintedAsProven (printed.slice (prefix.length), declaration.initializer)) {
            return printed;
        }
        let value = printed.slice (prefix.length);
        // the printer's own `((object)…)` box around an `as any` operand is an identity upcast
        // (printAsExpression); the named type IS that operand's box, so the box goes with the
        // retype (the `as any` safeList* receiver copies — see asAnySafeListReceiverCopy)
        if (info.stripObjectBox === true) {
            const boxed = /^\(\(object\)(.*)\)$/s.exec (value.trimEnd ());
            if (boxed !== null) {
                value = boxed[1];
            }
        }
        if (info.cast !== undefined) {
            // a call whose printed argument list spans lines (a dict-literal argument) would put
            // the cast's closing paren on a second line; that family keeps `object` there, so
            // every retyped declaration stays a single declaration-type-only line
            // (the safeValue-twin family needs the same one-line shape for its cast)
            if (value.includes ('\n') && (info.cast === 'Dictionary<string, object>' || info.safeValueTwinShape !== undefined)) {
                return printed;
            }
            // the printer prints a bare `getValue (recv, key)`; the named element type only
            // compiles once the box is cast back
            value = (info.castWhole === true)
                // a conditional / binary value: a cast binds its own operand first, so the whole
                // expression needs its own paren pair (`((T)(cond ? A : B))`)
                ? '((' + info.cast + ')(' + value + '))'
                : '((' + info.cast + ')' + value + ')';
        }
        // the destructuring print (a later statement in the same function) casts back to this
        recordDestructuredWriteType (enclosingFunction (declaration), printedName, info.type, isUTAEnabledAwaitedInit (declaration));
        // U17: a later `x = market['symbol']` write of this local needs the same cast back
        recordU17RowReadWriteTarget (enclosingFunction (declaration), printedName, info.type, declaration);
        // the emitted line carries info.type from here on: the condition-operand hook answers
        // reads of this declaration from it (an awaited initializer has no printer-side name)
        retypedDeclarationTypes.set (declaration, info.type);
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
    installCsharpStringEquality (csharp);
    // `add (x, y)` -> native `(x + y)` for the operands the prover above names (U57); the
    // hook is consulted by the ast printer's `+` branch, so the helper emission is unchanged
    // wherever this rule cannot prove the left operand's printed type
    installCsharpNativeStringConcat (csharp);
    csharp._localTypesPatched = true;
    // S22: the declared-type record has to wrap the rewrite above — it reads the line this
    // module actually emits, not the printer's `object ... = ` it replaced
    installCsharpDictionaryIndexWriteCastElision (csharp);
    installU17RowReadWriteCasts (csharp);
}

// `((string)x).Split/.ToUpper/.ToLower/.Replace/.Trim/.Length` — ast-transpiler's printer
// wraps the receiver unconditionally and asks csharpStringReceiverType for its static C#
// type; only the locals the PRINTER types itself are provable there. This override adds the
// declarations THESE tables retype: the wrapper above rewrites an exact `object <name> = `
// prefix to info.type, so every accepted declaration prints `string`/`string?` and the cast
// around such a receiver names the box the value already is (null included) — dropping it
// moves no value. Everything else keeps the printer's cast. Idempotent.
export function installCsharpStringReceivers (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.csharpStringReceiverType !== 'function' || csharp._stringReceiversPatched) {
        return;
    }
    const upstream = csharp.csharpStringReceiverType.bind (csharp);
    csharp.csharpStringReceiverType = (receiver) => {
        const printerType = upstream (receiver);
        if (printerType !== undefined && printerType !== 'object') {
            return printerType; // the printer already names the declaration's type
        }
        const declaration = (typeof csharp.csharpReceiverBinding === 'function') ? csharp.csharpReceiverBinding (receiver) : undefined;
        if (declaration?.kind !== ts.SyntaxKind.VariableDeclaration || declaration.parent?.declarations?.length !== 1) {
            return printerType;
        }
        // printVariableDeclarationList only prints the `object <name> = ` prefix this module
        // rewrites when the initializer is a plain one: a `new` expression prints `var `
        // (its own inferred type) and an await has its own guard below
        const initializer = declaration.initializer;
        if (initializer === undefined || initializer.kind === ts.SyntaxKind.NewExpression || initializer.kind === ts.SyntaxKind.AwaitExpression) {
            return printerType;
        }
        const info = csharpLocalDeclaration (csharp, declaration);
        if (info === undefined) {
            return printerType; // not proven (or being classified) -> printer's answer
        }
        return info.type;
    };
    csharp._stringReceiversPatched = true;
}

// ===== receiver declared types (the printer's csharpDeclaredReceiverType hook) =====
//
// The C# element-access printer emits `((IDictionary<string,object>)request)["k"] = v` for a
// write into a dictionary because it cannot name the receiver's C# type on its own: the
// declaration `Dictionary<string, object> request = ...` is this classifier's rewrite. Answer
// the printer hook with the type that declaration carries — the same answer installCsharpLocalTypes
// rewrites the line with (csharpLocalType), falling back to the printer's own getCSharpLocalType
// for a declaration this classifier does not type. `request` is S21's family and answers with
// whatever the declaration carries. Every OTHER receiver shape the printer cannot see is
// answered here too, and only when the cast is an identity conversion:
//   - `this.<member>` whose hand-written base declaration already IS a dictionary
//     (cs/ccxt/base/Exchange.Options.cs): the cast is an implicit upcast to the interface the
//     member's type implements, both indexers are the same setter;
//   - a local declared with a ws orderbook type — ccxt.pro.IOrderBook / OrderBook /
//     IndexedOrderBook / CountedOrderBook all implement IDictionary<string, object>
//     (cs/ccxt/ws/OrderBook.cs), so the same holds.
// An `object` receiver (an object local, an `object` parameter, a this.<member> the base
// declares `object`) keeps the cast: dropping it would not compile, i.e. it is no identity.
//
// localIdentifierType resolves a bare read only while the enclosing function holds exactly one
// binding of the name; two `request`s in sibling blocks (gate/bigone/aster build one per branch)
// fall through to resolveReference, which asks the checker for the declaration the read really
// binds. From there the same conditions the declaration rewrite itself requires apply: a single
// declarator whose printed shape is the rewritten one, which an awaited initializer is not
// (installCsharpLocalTypes refuses those) — the cast stays wherever any of them fails.
const CSHARP_DICT_WRITE_MEMBER_TYPES = {
    'options': 'ConcurrentDictionary<string, object>',   // cs/ccxt/base/Exchange.Options.cs
    'timeframes': 'Dictionary<string, object>',          // cs/ccxt/base/Exchange.Options.cs
    'markets_by_id': 'IDictionary<string, object>',      // cs/ccxt/base/Exchange.Options.cs
    'commonCurrencies': 'Dictionary<string, object>',    // cs/ccxt/base/Exchange.Options.cs
    'api': 'Dictionary<string, object>',                 // cs/ccxt/base/Exchange.Options.cs
    'has': 'Dictionary<string, object>',                 // cs/ccxt/base/Exchange.Options.cs
    'features': 'Dictionary<string, object>',            // cs/ccxt/base/Exchange.Options.cs
};
const CSHARP_DICT_WRITE_LOCAL_TYPES = [
    'ccxt.pro.IOrderBook', 'ccxt.pro.OrderBook', 'ccxt.pro.IndexedOrderBook', 'ccxt.pro.CountedOrderBook',
];

// `this.<dict member>` as an element-write receiver: the member's hand-written base declaration
// is a concrete dictionary, so `((IDictionary<string,object>)this.options)["k"] = v` is the same
// write as `this.options["k"] = v`
function dictWriteMemberReceiverType (node) {
    if ((node?.kind !== ts.SyntaxKind.PropertyAccessExpression) || (node.expression?.kind !== ts.SyntaxKind.ThisKeyword)) {
        return undefined;
    }
    const name = node.name?.escapedText;
    if ((name === undefined) || !Object.prototype.hasOwnProperty.call (CSHARP_DICT_WRITE_MEMBER_TYPES, name)) {
        return undefined;
    }
    return 'IDictionary<string, object>';
}

function receiverDeclaredType (csharp, node) {
    const member = dictWriteMemberReceiverType (node);
    if (member !== undefined) {
        return member;
    }
    if (node?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const declared = identifierDeclaredType (csharp, node);
    if (declared === undefined) {
        return undefined;
    }
    if (node.escapedText === 'request') {
        return declared; // S21's family: the printer's gate keeps the cast on every non-dictionary answer
    }
    return CSHARP_DICT_WRITE_LOCAL_TYPES.includes (declared) ? 'IDictionary<string, object>' : undefined;
}

// the type the emitted declaration of this identifier carries (see the block comment above)
function identifierDeclaredType (csharp, node) {
    const own = localIdentifierType (csharp, node);
    if (own !== undefined) {
        return own;
    }
    const binding = resolveReference (csharp, node);
    if ((binding === undefined) || (binding.kind !== ts.SyntaxKind.VariableDeclaration) || (binding.name?.kind !== ts.SyntaxKind.Identifier)) {
        return undefined;
    }
    if (binding.parent?.declarations?.length !== 1) {
        return undefined; // the declaration rewrite only touches single-declarator lists
    }
    if (binding.getStart () >= node.getStart ()) {
        return undefined; // the read precedes the declaration
    }
    if (binding.initializer?.kind === ts.SyntaxKind.AwaitExpression) {
        return undefined; // an awaited local the declaration rewrite may refuse to retype
    }
    const declared = csharpLocalType (csharp, binding);
    if (declared !== undefined) {
        return declared;
    }
    if (typeof csharp.getCSharpLocalType !== 'function') {
        return undefined;
    }
    const printed = csharp.getCSharpLocalType (binding);
    return ((printed === undefined) || (printed === csharp.VAR_TOKEN)) ? undefined : printed;
}

export function installCsharpReceiverTypes (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || csharp._receiverTypesPatched) {
        return;
    }
    csharp._receiverTypesPatched = true;
    csharp.csharpDeclaredReceiverType = (node) => receiverDeclaredType (csharp, node);
}

// ===== string-literal equality (S60) + null-literal equality (U55) =====
//
// The printer emits `isEqual (x, "lit")` / `!isEqual (x, "lit")` for `x === 'lit'` / `x !== 'lit'`.
// When the operand's emitted declaration is `string`/`string?` the helper is redundant: a string
// literal is never null and isEqual's string branch is `((string)a) == ((string)b)`, so the native
// operator is the same ordinal comparison and a null operand is false in both spellings.
//
// The same printer also emits `isEqual (x, null)` / `!isEqual (x, null)` for `x === undefined` /
// `x !== undefined` (U55). The helper's first two guards are `a == null && b == null` /
// `a == null || b == null`, so with the null literal on one side it returns exactly the C# null
// test: reference equality for a reference type and `!x.HasValue` for `T?`. When the operand's
// emitted declaration is a typed reference (`string`/`IDictionary`/`IList`/`List`/`Dictionary`/
// `ccxt.pro.*`) or a nullable type, `x == null` is that very test — and it does NOT compile for a
// non-nullable value scalar (`Int64`/`bool`/`double`/`int`), which is why those stay on the helper.
//
// The printer asks `csharpLocalTypeOf (operand)` / `csharpNullComparisonTypeOf (operand)`; this
// installer answers them from the PRINTED declaration text recorded below — the type the emitted
// line really carries, whether the printer or an earlier table typed it — plus an exactly-one-
// binding proof (a parameter, a multi-binding name, a read before the declaration and every
// unrecorded local stay `object`, i.e. keep isEqual).
export function installCsharpStringEquality (csharp) {
    if (!csharp || csharp._stringEqualityPatched || typeof csharp.printVariableDeclarationList !== 'function') {
        return;
    }
    // enclosing function -> Map (source name -> Set (printed declaration types))
    const declaredTypes = new WeakMap ();
    const declaredType = /^\s*([A-Za-z_][A-Za-z0-9_.]*(?:<[^;=]*?>)?\??) ([A-Za-z_][A-Za-z0-9_]*) = /;
    const upstreamDeclaration = csharp.printVariableDeclarationList.bind (csharp);
    csharp.printVariableDeclarationList = (node, identation) => {
        const printed = upstreamDeclaration (node, identation);
        const declaration = node?.declarations?.[0];
        if (typeof printed === 'string' && declaration?.name?.kind === ts.SyntaxKind.Identifier) {
            const match = declaredType.exec (printed);
            if (match !== null) {
                const scope = enclosingFunctionScopeOf (csharp, declaration);
                if (scope !== undefined) {
                    let names = declaredTypes.get (scope);
                    if (names === undefined) {
                        names = new Map ();
                        declaredTypes.set (scope, names);
                    }
                    let types = names.get (declaration.name.escapedText);
                    if (types === undefined) {
                        types = new Set ();
                        names.set (declaration.name.escapedText, types);
                    }
                    types.add (match[1]);
                }
            }
        }
        return printed;
    };
    csharp.csharpLocalTypeOf = (node) => {
        if (node?.kind !== ts.SyntaxKind.Identifier) {
            return undefined;
        }
        const scope = enclosingFunctionScopeOf (csharp, node);
        if (scope === undefined) {
            return undefined;
        }
        const types = declaredTypes.get (scope)?.get (node.escapedText);
        if (types === undefined || types.size !== 1) {
            return undefined;
        }
        const type = types.values ().next ().value;
        if ((type !== 'string') && (type !== 'string?')) {
            return undefined;
        }
        return stringEqualityBindingIsProvable (scope, node) ? type : undefined;
    };
    // U55: the null-comparison hook. A no-op on a printer that has no such method (the base
    // pin), so the same classifier reproduces the pre-change emission.
    if (typeof csharp.csharpNullComparisonTypeOf === 'function') {
        csharp.csharpNullComparisonTypeOf = (node) => {
            if (node?.kind !== ts.SyntaxKind.Identifier) {
                return undefined;
            }
            const scope = enclosingFunctionScopeOf (csharp, node);
            if (scope === undefined) {
                return undefined;
            }
            const types = declaredTypes.get (scope)?.get (node.escapedText);
            if (types === undefined || types.size !== 1) {
                return undefined;
            }
            const type = types.values ().next ().value;
            if (!nullComparisonTypeIsProvable (type)) {
                return undefined;
            }
            return stringEqualityBindingIsProvable (scope, node) ? type : undefined;
        };
    }
    csharp._stringEqualityPatched = true;
}

// the emitted declaration types `isEqual (x, null)` -> `x == null` is exactly the same test for:
// a `?`-suffixed type (a nullable value scalar — `== null` is `!x.HasValue` — or a nullable
// reference), and a named reference type (`object`/`var` excluded: those are the boxes the
// classifier did not name, and the printer's own csharpOperandIsValueTyped veto keeps a TS
// number/boolean operand on the helper for exactly that reason)
function nullComparisonTypeIsProvable (type) {
    if (typeof type !== 'string' || type === '') {
        return false;
    }
    if (type.endsWith ('?')) {
        return true;
    }
    return NULL_COMPARISON_REFERENCE_HEADS.some ((head) => type.startsWith (head));
}

const NULL_COMPARISON_REFERENCE_HEADS = [ 'string', 'IDictionary<', 'Dictionary<', 'IList<', 'List<', 'ConcurrentDictionary<', 'ccxt.pro.', 'ArrayCache', 'IOrderBook', 'Future', 'WebSocketClient', 'Delegates' ];

// the name is bound exactly ONCE in the enclosing function, as a single-declarator variable
// declaration read after it (the shape whose printed line the record above tracks)
function stringEqualityBindingIsProvable (scope, node) {
    const name = node.escapedText;
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
            if (bindingNamesOf (n.name).includes (name)) {
                bindings++;
                binding = n;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return bindings === 1
        && binding?.kind === ts.SyntaxKind.VariableDeclaration
        && binding.parent?.declarations?.length === 1
        && binding.getStart () < node.getStart ();
}

// declarations the local-types wrapper above retyped: declaration node -> the type its emitted
// line carries. The wrapper is the only place that knows it (an awaited initializer prints as the
// awaited call, which no printer-side table names), so the condition-operand hook answers reads of
// these declarations from this record first -- the recorded type IS the emitted declaration.
const retypedDeclarationTypes = new WeakMap ();

// ===== `add (x, y)` -> native `(x + y)` (U57) =====
//
// The printer emits `add (x, y)` for `x + y`. When the LEFT operand's printed C# static type
// is a string, the call binds add(string, string) (`a + b`) or add(string, object)
// (`a + b?.ToString()`) (cs/ccxt/base/Exchange.TranspileHelpers.cs), and C#'s string
// concatenation computes exactly those values for every input, null operands included: a null
// operand becomes "" (null + "y" == "y", "x" + null == "x", null + null == ""). The overload
// an `object` left binds — add(object, object), whose null LEFT comes back as null — is the
// divergence this rule must never reach, so it is gated on a PROVEN string operand.
//
// Locals are proven from the PRINTED declaration line recorded below (the type the emitted
// file really carries, whether the printer or these tables typed it) with the same
// exactly-one-binding proof the isEqual twin uses; the other arms are the operand prover the
// redundant-cast family already uses (isProvablyStringOperand). A `string?` left is accepted
// only when the right operand is a proven string too — the call then binds add(string, string),
// whose body IS `a + b`, i.e. literally the expression emitted here.
function installCsharpNativeStringConcat (csharp) {
    if (!csharp || csharp._nativeStringConcatPatched || typeof csharp.printVariableDeclarationList !== 'function') {
        return;
    }
    // enclosing function -> Map (source name -> Set (printed declaration types))
    const declaredTypes = new WeakMap ();
    const stringDeclaration = /^\s*(string\??) ([A-Za-z_][A-Za-z0-9_]*) = /;
    const upstreamDeclaration = csharp.printVariableDeclarationList.bind (csharp);
    csharp.printVariableDeclarationList = (node, identation) => {
        const printed = upstreamDeclaration (node, identation);
        const declaration = node?.declarations?.[0];
        if (typeof printed === 'string' && declaration?.name?.kind === ts.SyntaxKind.Identifier) {
            const match = stringDeclaration.exec (printed);
            if (match !== null) {
                const scope = enclosingFunctionScopeOf (csharp, declaration);
                if (scope !== undefined) {
                    let names = declaredTypes.get (scope);
                    if (names === undefined) {
                        names = new Map ();
                        declaredTypes.set (scope, names);
                    }
                    let types = names.get (declaration.name.escapedText);
                    if (types === undefined) {
                        types = new Set ();
                        names.set (declaration.name.escapedText, types);
                    }
                    types.add (match[1]);
                }
            }
        }
        return printed;
    };
    csharp.csharpNativeStringConcat = (left, right, leftText, rightText) => nativeStringConcat (csharp, declaredTypes, left, right, leftText, rightText);
    csharp._nativeStringConcatPatched = true;
}

function nativeStringConcat (csharp, declaredTypes, left, right, leftText, rightText) {
    if (typeof leftText !== 'string' || typeof rightText !== 'string' || leftText === '' || rightText === '') {
        return undefined;
    }
    const leftType = concatOperandType (csharp, declaredTypes, left, 0);
    if (leftType === undefined) {
        return undefined;
    }
    // `string?`: only the add(string, string) binding is provably the same expression
    if ((leftType === 'string?') && (concatOperandType (csharp, declaredTypes, right, 0) === undefined)) {
        return undefined;
    }
    return '(' + leftText + ' + ' + rightText + ')';
}

// the printed C# static type of a `+` operand this rule can prove, or undefined. The arms are
// the module's operand prover (see isProvablyStringOperand), kept type-precise so a `string?`
// left can demand a string right; a `+` chain that converts prints a native concat (a string).
function concatOperandType (csharp, declaredTypes, node, depth) {
    if (depth > 4) {
        return undefined;
    }
    const value = concatInner (node);
    switch (value?.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return 'string';
    case ts.SyntaxKind.AsExpression:
        return (value.type?.kind === ts.SyntaxKind.StringKeyword) ? 'string' : undefined;
    case ts.SyntaxKind.Identifier:
        return concatDeclaredReadType (csharp, declaredTypes, value);
    case ts.SyntaxKind.PropertyAccessExpression: {
        if (value.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
            return undefined;
        }
        const memberType = CSHARP_LOCAL_THIS_MEMBER_TYPES[value.name?.escapedText];
        return (memberType === 'string' || memberType === 'string?') ? memberType : undefined;
    }
    case ts.SyntaxKind.CallExpression: {
        const callee = value.expression;
        if (callee?.kind === ts.SyntaxKind.PropertyAccessExpression && callee.name?.escapedText === 'toString') {
            return 'string';
        }
        const own = callReturnType (csharp, value);
        return (own === 'string' || own === 'string?') ? own : undefined;
    }
    case ts.SyntaxKind.BinaryExpression: {
        if (value.operatorToken?.kind !== ts.SyntaxKind.PlusToken) {
            return undefined;
        }
        const innerType = concatOperandType (csharp, declaredTypes, value.left, depth + 1);
        if ((innerType === 'string?') && (concatOperandType (csharp, declaredTypes, value.right, depth + 1) === undefined)) {
            return undefined;
        }
        return (innerType === undefined) ? undefined : 'string';
    }
    }
    return undefined;
}

// the printed declaration type of a single-binding local read, or undefined
function concatDeclaredReadType (csharp, declaredTypes, node) {
    const scope = enclosingFunctionScopeOf (csharp, node);
    if (scope === undefined) {
        return undefined;
    }
    const types = declaredTypes.get (scope)?.get (node.escapedText);
    if (types === undefined || types.size !== 1) {
        return undefined;
    }
    const type = types.values ().next ().value;
    if ((type !== 'string') && (type !== 'string?')) {
        return undefined;
    }
    return stringEqualityBindingIsProvable (scope, node) ? type : undefined;
}

// `(x)` keeps the operand's static type; every other node is returned as it is
function concatInner (node) {
    let value = node;
    while (value?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        value = value.expression;
    }
    return value;
}

// `isTrue (x)` in an if / while / && / || / ! condition: the ast printer's
// csharpConditionOperandType hook prints a C# `bool` operand bare and a `bool?` one as
// `x == true` (null -> false, exactly what isTrue computes). The printer only names the
// locals IT types (getCSharpLocalType); this override adds the declarations THESE tables
// retype — the wrapper above rewrites an exact `object <name> = ` prefix to info.type, so
// a `bool?`/`bool` declaration is what the emitted line carries and the native spelling
// names that box. Everything else (parameters, call results, `object` locals) keeps the
// printer's isTrue. Idempotent.
export function installCsharpConditionOperands (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.csharpConditionOperandType !== 'function' || csharp._conditionOperandsPatched) {
        return;
    }
    const upstream = csharp.csharpConditionOperandType.bind (csharp);
    csharp.csharpConditionOperandType = (node) => {
        const printerType = upstream (node);
        if (printerType !== undefined) {
            return printerType; // the printer already names the declaration's type
        }
        if (node?.kind !== ts.SyntaxKind.Identifier) {
            return printerType;
        }
        const symbol = (typeof csharp.getChecker === 'function') ? csharp.getChecker ().getSymbolAtLocation (node) : undefined;
        const declaration = symbol?.valueDeclaration;
        if (declaration?.kind !== ts.SyntaxKind.VariableDeclaration || declaration.parent?.declarations?.length !== 1) {
            return printerType;
        }
        // a declaration the wrapper retyped: the record is the emitted line's own type, so a read
        // of it prints natively whatever the initializer shape (`bool? uta = await this.isUTAEnabled ()`)
        const recorded = retypedDeclarationTypes.get (declaration);
        if (recorded !== undefined) {
            return ((recorded === 'bool') || (recorded === 'bool?')) ? recorded : printerType;
        }
        // the declaration has to print as the exact `object <name> = ` prefix this module
        // rewrites: a `new` expression prints `var ` and an await has its own guard
        const initializer = declaration.initializer;
        if (initializer === undefined || initializer.kind === ts.SyntaxKind.NewExpression || initializer.kind === ts.SyntaxKind.AwaitExpression) {
            return printerType;
        }
        const info = csharpLocalDeclaration (csharp, declaration);
        if (info === undefined) {
            return printerType;
        }
        return ((info.type === 'bool') || (info.type === 'bool?')) ? info.type : printerType;
    };
    csharp._conditionOperandsPatched = true;
}

// ===== async core return signatures =====
//
// Concrete C# return types for the async base cores the printer declared `Task<object>`
// while every declaration's runtime value already is a dictionary:
//
//   loadMarkets        -> IDictionary<string, object>   the markets map (this.markets)
//   loadMarketsHelper  -> IDictionary<string, object>   (same map, shared/reload path)
//   fetchCurrencies    -> IDictionary<string, object>   the currencies map (this.currencies)
//   fetchCurrenciesWs  -> IDictionary<string, object>
//
// IDictionary and not Dictionary: both fields are declared `object` and hold either a real
// Dictionary<string, object> (setMarkets builds the maps with deepExtend/indexBy) or a
// ConcurrentDictionary built by createSafeDictionary() (initializeProperties,
// PredictionExchange#indexEventOutcomes, the ws caches). Both implement the interface, so
// naming the interface is the exact static type of every box; a concrete Dictionary would
// be a lie for the concurrent boxes (an `as` funnel would hand back null) — the same
// spelling mapToSafeMap / safeDict / the ws orderbook map already use.
//
// The patch is name-keyed on printFunctionType, and the printer prints every async
// MethodDeclaration — the hand-written base declaration is the only one it does NOT print
// (cs/ccxt/base/Exchange.cs is edited by hand in the same change, as is the marketsLoading
// field in Exchange.Options.cs) — so every venue / ws / prediction override is retyped too
// and C# override invariance (CS0508) holds. Each `return` inside a retyped method is
// funnelled through `((IDictionary<string, object>)((object)(<expr>)))`, the same
// unboxing shape installCsharpMethodReturnTypes uses; returns whose printed form already
// carries a dictionary (a fresh Dictionary literal, this.parseCurrencies(...)) stay bare.
// Only the static type of the value moves — the box is the same dictionary object on every
// path (census: 53 x this.parseCurrencies / 21 x a dictionary literal / 9 x a
// Dictionary-typed `result` local / 1 x ccxt.BaseExchange.FromCurrencies(...) / 1 x
// this.currencies / 4 x `markets` from base.loadMarkets, plus the hand-written base).
//
// The awaited-locals map below registers the SAME names with the same C# type; keep the
// two in sync (its scan rejects a typed local wherever the declared type would re-bind an
// overload or a ref sink).
export const CSHARP_ASYNC_CORE_RETURNS = {
    'loadMarkets': 'IDictionary<string, object>',
    'loadMarketsHelper': 'IDictionary<string, object>',
    'fetchCurrencies': 'IDictionary<string, object>',
    'fetchCurrenciesWs': 'IDictionary<string, object>',
    // cs/ccxt/base/PredictionExchange.cs — prediction-tier name (no other tree declares it).
    // Every return path hands back an outcome row: this.safeOutcome(...) (now itself retyped,
    // see CSHARP_COLLECTION_RETURN_METHODS) on 4 paths and `await this.fetchOutcome (...)` on
    // the last — fetchOutcome's own paths (base search fallback -> safeOutcome; kalshi
    // this.outcome/this.safeOutcome/super; opinion this.safeOutcome/super; polymarket the
    // this.outcomes_by_id read/super) all preserve that same row, so the funnel cast is an
    // identity on every path.
    'loadOutcome': 'IDictionary<string, object>',
    // the async REST cores (reduceMargin / addMargin / modifyMarginHelper / closePosition /
    // the borrow-repay margin family / the account-onboarding & agent-wallet cores) whose
    // every declaration in the generated tree has every return path proven to box a
    // dictionary: a fresh `new Dictionary<string, object>` literal, `this.extend(...)`
    // (declared Dictionary), a dict-returning row builder (parseOrder / parseMarginModification
    // / parseTransaction / parseTransfer), an api wrapper declared Task<Dictionary<string,
    // object>>, a Dictionary-typed local, `From*` of a typed-core struct, another listed name
    // (fixpoint) or null. Census + proof: campaigns/cs-strict/tools/S53/census_returns.py
    // (34 names, 143 declarations, 0 unproven paths). `closePosition` keeps the IDictionary
    // spelling: two of its paths return `this.safeDict (...)` — a ConcurrentDictionary is
    // possible, an exact Dictionary is not provable. The awaited-locals map above registers
    // the same names with the same spelling; keep the two in sync.
    'reduceMargin': 'Dictionary<string, object>',
    'addMargin': 'Dictionary<string, object>',
    'modifyMarginHelper': 'Dictionary<string, object>',
    'closePosition': 'IDictionary<string, object>',
    'borrowCrossMargin': 'Dictionary<string, object>',
    'repayCrossMargin': 'Dictionary<string, object>',
    'borrowIsolatedMargin': 'Dictionary<string, object>',
    'repayIsolatedMargin': 'Dictionary<string, object>',
    'borrowMargin': 'Dictionary<string, object>',
    'repayMargin': 'Dictionary<string, object>',
    'modifyLeverageAndMarginMode': 'Dictionary<string, object>',
    'setContractLeverage': 'Dictionary<string, object>',
    'approveBuilderFee': 'Dictionary<string, object>',
    'approveBuilderCode': 'Dictionary<string, object>',
    'revokeBuilderCode': 'Dictionary<string, object>',
    'revokeApiKey': 'Dictionary<string, object>',
    'bindAgentWallet': 'Dictionary<string, object>',
    'setAgentAbstraction': 'Dictionary<string, object>',
    'setUserAbstraction': 'Dictionary<string, object>',
    'enableUserDexAbstraction': 'Dictionary<string, object>',
    'upgradeUnifiedTradeAccount': 'Dictionary<string, object>',
    'signInWithApiKey': 'Dictionary<string, object>',
    'signInWithPrivateKey': 'Dictionary<string, object>',
    'deriveApiKey': 'Dictionary<string, object>',
    'redeemGiftCode': 'Dictionary<string, object>',
    'redeem': 'Dictionary<string, object>',
    'verifyGiftCode': 'Dictionary<string, object>',
    'deposit': 'Dictionary<string, object>',
    'futuresTransfer': 'Dictionary<string, object>',
    'convertCurrencyNetwork': 'Dictionary<string, object>',
    'reserveRequestWeight': 'Dictionary<string, object>',
    'onboarding': 'Dictionary<string, object>',
    'prepareParadexDomain': 'Dictionary<string, object>',
    'ensureErc20Allowance': 'Dictionary<string, object>',
    // The async venue url/auth helpers whose every return path boxes a string or null
    // (pro: bybit/kucoin/xt, rest: bullish/paradex, prediction: opinion). Census per name and
    // per site: campaigns/cs90/tools/U28/string_returns_census.py + sites.py, proof in REPORT.md.
    'getUrlByMarketType': 'string?',
    'getUtaUrl': 'string?',
    'getListenKey': 'string?',
    'handleToken': 'string?',
    'authenticateRest': 'string?',
    'loadMultiSignAddress': 'string?',
};

// the mapped C# return type for an async core declaration, or undefined to leave the
// printer's own decision (every other name, non-async methods)
function asyncCoreReturnType (csharp, node) {
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration || node.name === undefined) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && !csharp.isAsyncFunction (node)) {
        return undefined;
    }
    const name = node.name.escapedText;
    if (Object.prototype.hasOwnProperty.call (CSHARP_ASYNC_CORE_RETURNS, name)) {
        return { type: CSHARP_ASYNC_CORE_RETURNS[name], awaited: false };
    }
    const awaited = awaitedCoreReturnType (csharp, node);
    return (awaited === undefined) ? undefined : { type: awaited, awaited: true };
}

// the returns that already hand the dictionary back, so the funnel would only add noise
function asyncCoreReturnIsAlreadyTyped (value) {
    return value.startsWith ('new Dictionary<string, object>')
        || value.startsWith ('this.parseCurrencies (') || value.startsWith ('this.parseCurrencies(')
        // loadOutcome () hands the mapped row to itself: safeOutcome is now itself retyped to
        // IDictionary<string, object> (CSHARP_COLLECTION_RETURN_METHODS), so the two spellings
        // of that call need no boundary cast — only the still-`Task<object>` fetchOutcome does
        || /^this\.safeOutcome\s*\(/.test (value);
}

// ===== awaited same-file cores =====
//
// Async methods declared in a venue file whose EVERY return path already hands back one
// concrete box (the census is the proof itself: awaitedCoreBoxType re-runs per declaration
// at print time, so a path that stops proving leaves the method `Task<object>` untouched).
// The generated signature prints `Task<T>` and every `await this.<name>(...)` local takes T.
// A name may map to a LIST of accepted boxes: the proof still has to produce that exact
// box for the declaration to move (S52 `authenticate`, see there).
export const CSHARP_AWAITED_CORE_RETURNS = {
    // bybit / hyperliquid: `return [ unified, params ]` — one List<object> box
    'isUnifiedEnabled': 'List<object>',
    // modetrade / woo / woofipro: `return [ currency, rows ]`
    'getAssetHistoryRows': 'List<object>',
    // dydx: `return { tp, gasLimit, ... }` — one Dictionary<string, object> box
    'estimateTxFee': 'Dictionary<string, object>',
    // paradex: both paths hand back a safeDict() result (the cached config or a fresh {})
    'getSystemConfig': 'IDictionary<string, object>',
    // modetrade / woofipro: safeNumber() on the only path (double or null)
    'getWithdrawNonce': 'double?',
    // kucoin (pro): the token string getUtaUrl() concatenates, null while unauthenticated
    'authenticateUta': 'string?',
    // S52 (ws cores). `authenticate` is declared by 35 ws classes and every declaration is
    // `virtual` (a fresh slot, never an override), so the per-declaration proof decides each
    // class on its own. Four hand the token / listen key back on every path — deepcoin,
    // hashkey, mexc (`return listenKey` on a `string? listenKey` + `this.safeString (this.options,
    // 'listenKey')`) and kraken (`this.safeString (subscription, 'token')` twice) — and
    // whitebit hands its `authorized` sentinel back (`int authorized = 1;`, three paths), the
    // value its own handleAuthenticate () resolves the handshake future with. The other 30
    // stay Task<object>: 24 have a single path the classifier cannot name (22 `await (future as
    // Future)`, `await this.watch (...)`, a subscriptions read), the rest mix such a path with
    // a token read.
    'authenticate': [ 'string?', 'int' ],
    // kraken: every path of the private-stream core is
    // `this.filterBySymbolSinceLimit (...)` -> IList<object> (the other 15 ws `watchPrivate`
    // declarations are unprovable: `await this.watch (...)`)
    'watchPrivate': 'IList<object>',
    // nado: the loop fills `List<object> results`, the single path returns it (cryptocom's
    // same-named 7-parameter overload is a different declaration and keeps Task<object>)
    'unWatchPublicMultiple': 'List<object>',
    // U29: paradex's REST authenticateRest has two paths and both hand back a `string?` local
    // (`cachedToken` = safeString(this.options, 'authToken'), `token` = safeString(response,
    // 'jwt_token')), so the one `object token = await this.authenticateRest ()` local (pro tree)
    // takes the string? box; the six other call sites ignore the result
    'authenticateRest': 'string?',
};

const awaitedCoreProofs = new WeakMap ();
const awaitedCoreInProgress = new WeakSet ();

// the printed expression's own static type already IS `mapped`, so the funnel adds nothing
function awaitedCoreReturnIsAlreadyTyped (value, mapped) {
    if (/^[A-Za-z_]\w*$/.test (value)) {
        return true; // a bare local read: the proof resolved it to `mapped` (a param would not prove)
    }
    if (mapped === 'List<object>' || mapped === 'IList<object>') {
        return value.startsWith ('new List<object>');
    }
    if (mapped === 'Dictionary<string, object>' || mapped === 'IDictionary<string, object>') {
        return value.startsWith ('new Dictionary<string, object>') || /^this\.safeDict2?N?\s*\(/.test (value);
    }
    if (mapped === 'double?') {
        return /^this\.safeNumber(N|2)?\s*\(/.test (value);
    }
    if (mapped === 'string?' || mapped === 'string') {
        return /^this\.safeString/.test (value) || value.startsWith ('"');
    }
    return false;
}

// every `return` of the method proves one type: a return with no expression boxes null,
// an unprovable or conflicting path fails the whole proof (the conservative direction)
function awaitedCoreBoxType (csharp, declaration) {
    if (!declaration.body) {
        return undefined;
    }
    const context = { scope: declaration, stack: new Set (), depth: 0 };
    let proven;
    let failed = false;
    let found = false;
    const visit = (node) => {
        if (failed || (node !== declaration && ts.isFunctionLike (node))) {
            return; // a callback's `return` is not this method's
        }
        if (node.kind === ts.SyntaxKind.ReturnStatement) {
            found = true;
            const value = (node.expression === undefined) ? 'null' : csharpTypeOfValue (csharp, node.expression, context);
            const joined = (proven === undefined) ? value : unifyArms (proven, value);
            if (joined === undefined) {
                failed = true;
            } else {
                proven = joined;
            }
            return;
        }
        ts.forEachChild (node, visit);
    };
    visit (declaration.body);
    return (found && !failed) ? proven : undefined;
}

// the table lookup plus the per-declaration proof, cached; undefined for every other name
function awaitedCoreReturnType (csharp, node) {
    const name = node.name?.escapedText;
    if (name === undefined || !Object.prototype.hasOwnProperty.call (CSHARP_AWAITED_CORE_RETURNS, name)) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && !csharp.isAsyncFunction (node)) {
        return undefined;
    }
    if (awaitedCoreProofs.has (node)) {
        return awaitedCoreProofs.get (node);
    }
    if (awaitedCoreInProgress.has (node)) {
        return undefined; // a proof that re-enters itself proves nothing
    }
    awaitedCoreInProgress.add (node);
    let mapped;
    try {
        const table = CSHARP_AWAITED_CORE_RETURNS[name];
        const proven = awaitedCoreBoxType (csharp, node);
        // a listed box (the string form) or one of the listed boxes (the array form, S52
        // `authenticate`): either way the declaration has to prove the box it prints
        const matches = Array.isArray (table) ? table.includes (proven) : (proven === table);
        mapped = matches ? proven : undefined;
    } finally {
        awaitedCoreInProgress.delete (node);
    }
    awaitedCoreProofs.set (node, mapped);
    return mapped;
}

// wrap printFunctionType() / printReturnStatement() so the async cores above keep their
// real return type instead of `Task<object>`. Only an async MethodDeclaration with a
// listed name is touched, and only while the printer's own print is still `Task<object>`
// (a bool-annotated method the csharp-worker rule already typed is left alone). Idempotent.
// Must be installed before the printer emits anything (setupCsharpPrinter installs it).
export function installCsharpAsyncCoreReturns (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printFunctionType !== 'function' || typeof csharp.printReturnStatement !== 'function' || csharp._asyncCoreReturnsPatched) {
        return;
    }
    const upstreamFunctionType = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node) => {
        const own = upstreamFunctionType (node);
        if (own !== 'Task<object>') {
            return own;
        }
        const retype = asyncCoreReturnType (csharp, node);
        return (retype === undefined) ? own : 'Task<' + retype.type + '>';
    };
    const upstreamReturnStatement = csharp.printReturnStatement.bind (csharp);
    csharp.printReturnStatement = (node, identation) => {
        // nearest function-like: a `return` inside an arrow/function expression belongs
        // to that callback, never to the enclosing async core
        const retype = asyncCoreReturnType (csharp, ts.findAncestor (node.parent, ts.isFunctionLike));
        if (retype === undefined || !node.expression) {
            return upstreamReturnStatement (node, identation);
        }
        const leadingComment = csharp.printLeadingComments (node, identation);
        let trailingComment = csharp.printTraillingComment (node, identation);
        trailingComment = trailingComment ? ' ' + trailingComment : trailingComment;
        const value = csharp.printNode (node.expression, identation).trim ();
        const already = (retype.awaited ? awaitedCoreReturnIsAlreadyTyped (value, retype.type) : asyncCoreReturnIsAlreadyTyped (value)) || callReturnIsMapped (csharp, node.expression, retype.type);
        if (already) {
            return upstreamReturnStatement (node, identation);
        }
        return leadingComment + csharp.getIden (identation) + csharp.RETURN_TOKEN + ` ((${retype.type})((object)(${value})))` + csharp.LINE_TERMINATOR + trailingComment;
    };
    csharp._asyncCoreReturnsPatched = true;
}

// ===== numeric base-method return signatures =====
//
// Concrete C# return types for base methods whose C# signature was `object` while the
// value every return path already produces is a concrete type (the transpiler has no
// way to name it: `number` maps to `object` for return types, and these methods carry
// no usable annotation — `nonce ()` has none at all).
//
//   nonce()               -> Int64    returns this.seconds() / this.milliseconds(),
//                                     or subtract(...) whose Int64 left operand keeps
//                                     the Int64 box (49 definitions: base + overrides)
//   parseToInt()          -> Int64?   parseInt() box: Int64 or null
//   safeNumber()          -> double?  parseNumber() box: double or null
//   safeNumber2()         -> double?
//   safeNumberN()         -> double?
//   safeNumberOmitZero()  -> double?  defaultValue only ever flows out as null here
//   safeIntegerOmitZero() -> Int64?   the generated body returns `null` or
//                                     `this.safeInteger (obj, key, defaultValue)` — a
//                                     hand-written `Int64?` — on every path of its only
//                                     declaration (no venue override; the ts/src annotation
//                                     is `Int`, which the printer maps to `object`).
//                                     The default flows through safeInteger, so no path
//                                     hands the raw object default back.
//
// Every other return path that is not already the declared type is unboxed through
// `object` exactly like the `: boolean` handling in the pinned ast-transpiler: the
// printed expression keeps its upstream shape and the cast happens at the boundary.
// The nullable spellings are the point: a missing value stays null, never 0.
//
// Deliberately NOT here (proved mixed-box in the runtime, see the PR notes):
//   parseToNumeric()  -> parseInt path boxes Int64, parseFloat path boxes double
//   sum()             -> Convert.ToInt64 box for integer-valued sums, double otherwise
//
// The local-typing map above registers the SAME names with
// the same C# types; keep the two in sync (its scan rejects a typed local wherever
// the declared type would re-bind an overload or a ref sink).
//
// IMPORTANT: like installCsharpLocalTypes, this must be installed before the printer
// emits anything (setupCsharpPrinter installs both, pooled worker and main thread).

export const CSHARP_NUMERIC_RETURN_TYPES = {
    // Exchange.BaseMethods.cs (transpiled from ts/src/base/Exchange.ts)
    'nonce': 'Int64',
    'parseToInt': 'Int64?',
    'safeNumber': 'double?',
    'safeNumber2': 'double?',
    'safeNumberN': 'double?',
    'safeNumberOmitZero': 'double?',
    // Exchange.BaseMethods.cs — see the safeIntegerOmitZero proof in the name list above
    'safeIntegerOmitZero': 'Int64?',
    // Generated venue helpers (non-async) whose every return path of every declaration
    // already boxes the named type. The proof is a per-name census of the generated tree
    // (cs/ccxt/exchanges/**, the pro and prediction trees, + the generated base): a name is
    // listed only when EVERY declaration's every return is a call to a helper whose C#
    // signature is the same box, a null path (only with the nullable spelling — a
    // non-nullable Int64/double must not unbox a null), or a same-kind expression:
    //   convertFromRealAmount  bitmex             double?  parseNumber (finalAmount)
    //   fromWei                prediction/myriad  double?  null | parseNumber (Precise.stringDiv …)
    //   parseX18               nado               double?  null | parseNumber (Precise.stringDiv …)
    //   parseWsTimestamp       pro/nado           Int64?   null | parseToInt (slice …) | safeInteger
    //   encodeAccountType      hashkey            Int64?   safeInteger (types, (type as string), type)
    //   encodeFlowType         hashkey            Int64?   safeInteger (types, (type as string), type)
    //   parseExpiryDate        bitflyer           Int64?   parse8601 (a date string)
    //   timeInForceToInt       grvt               Int64?   safeInteger (timeInForces, timeInForce, 0)
    // Rejected with the same census (each keeps `object`): getCacheIndex (the base `-1` /
    // getArrayLength(int) paths box Int32, bitstamp's `add (i, 1)` path boxes Int64 —
    // add(int, int) does not exist, so one declaration has no nameable box), parseSafeNumber
    // (`return value` returns the object parameter — its null-ness depends on isEqual, not
    // on the value's box), calculatePricePrecision (parseToNumeric is a mixed Int64/double
    // box), convertFromRawQuantity (pro/bitrue returns multiply (rawQuantity, contractSize)),
    // toEn (parseToNumeric), outcomeEncoding / outcomeAssetId (sum), getTimestamp
    //   (subtract with an object operand), feeAmountMultiplier (its single return path is
    //   this.convertToBigIntCustom, so it is provable — but no declaration in the corpus is
    //   fed by it, so naming it would move the signature for 0 sites), getClosestLimit /
    //   getAccountId / getOrderBookLimitByMarketType / parsePolyTimestamp
    //   (identifier/parameter passthrough).
    // convertToBigIntCustom (grvt, 1 definition) was in that rejected list while `parseInt`
    // was declared `object`; cs90 U35 retyped parseInt to Int64? (Exchange.TranspileHelpers.cs),
    // so the definition's only return path — `return parseInt (x);` — is now the same
    // Int64-or-null box the signature names, and its 4 `object x = this.convertToBigIntCustom (…)`
    // declarations become Int64? with no cast.
    'convertFromRealAmount': 'double?',
    'convertToBigIntCustom': 'Int64?',
    'encodeAccountType': 'Int64?',
    'encodeFlowType': 'Int64?',
    'fromWei': 'double?',
    'parseExpiryDate': 'Int64?',
    'parseWsTimestamp': 'Int64?',
    'parseX18': 'double?',
    'timeInForceToInt': 'Int64?',
};

// the mapped C# return type for a method declaration, or undefined to leave the
// printer's own decision (annotated methods, async methods, every other name)
function csharpMethodReturnType (csharp, node, own) {
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration) {
        return undefined;
    }
    const name = node.name?.escapedText;
    // `requestId`: one definition per venue file and the box differs between venues, so a
    // name-keyed table cannot express it — the same per-definition proof the call sites use
    // (sameFileCallBoxType) retypes the Int64 counter definitions, which is what lets their
    // call-site casts go; the string-box definitions keep the printer's `object`
    // U37: the same per-definition route for a numeric helper whose sibling venue's
    // declaration does not prove (CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS).
    const sameFileMapped = (CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS[name] !== undefined)
        ? sameFileNumericDeclarationType (csharp, node, CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS[name])
        : undefined;
    const mapped = (name === 'requestId')
        ? ((sameFileCallBoxType (node.getSourceFile?.()) === 'Int64') ? 'Int64' : undefined)
        : ((sameFileMapped !== undefined) ? sameFileMapped : CSHARP_NUMERIC_RETURN_TYPES[node.name?.escapedText]);
    if (mapped === undefined) {
        return undefined;
    }
    // a declaration the printer already typed something else (bool / Task<...> / void)
    // must not be overridden: the mapped type names the box the value already has, and
    // every listed declaration prints `object` today
    if (own !== undefined && own !== 'object') {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (node)) {
        return undefined;
    }
    return mapped;
}

// `return <expr>;` inside a mapped method — wrap unless the expression already carries
// the declared type (this.seconds() IS Int64) or converts to it without a box change
// (an integer literal reaches Int64?/Int64 through the implicit numeric conversion; a
// hard unbox would throw on its Int32 box, so those must NOT be wrapped)
function needsUnboxingWrap (csharp, expression, mapped) {
    if (expression === undefined) {
        return false;
    }
    if (expression.kind === ts.SyntaxKind.NullKeyword) {
        return false;
    }
    let expression2 = expression;
    if (expression2.kind === ts.SyntaxKind.PrefixUnaryExpression && expression2.operator === ts.SyntaxKind.MinusToken) {
        expression2 = expression2.operand;
    }
    if (expression2?.kind === ts.SyntaxKind.NumericLiteral && /^\d+$/.test (expression2.text)) {
        return false;
    }
    if (typeof csharp.csharpTypeOfInitializer === 'function' && csharp.csharpTypeOfInitializer (expression) === mapped) {
        return false;
    }
    // U49: the expression is a bare local read (or a call whose generated signature already
    // names the box) that the local pass declares with exactly `mapped` — `return x;` in a
    // method declared `mapped` is the same conversion the box + unbox performs, so the
    // boundary cast names a type the value already has
    if (expression.kind === ts.SyntaxKind.Identifier && identifierType (csharp, expression) === mapped) {
        return false;
    }
    if (callReturnIsMapped (csharp, expression, mapped)) {
        return false;
    }
    return true;
}

export function installCsharpNumericReturns (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printFunctionType !== 'function' || csharp._methodReturnTypesPatched) {
        return;
    }
    const upstreamFunctionType = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node, ...rest) => {
        const own = upstreamFunctionType (node, ...rest);
        const mapped = csharpMethodReturnType (csharp, node, own);
        return (mapped === undefined) ? own : mapped;
    };
    const upstreamReturnStatement = csharp.printReturnStatement.bind (csharp);
    csharp.printReturnStatement = (node, identation) => {
        // nearest function-like: a `return` inside an arrow/function expression belongs
        // to that callback, never to the enclosing mapped method
        const mapped = csharpMethodReturnType (csharp, ts.findAncestor (node.parent, ts.isFunctionLike));
        if (mapped === undefined || !needsUnboxingWrap (csharp, node.expression, mapped)) {
            return upstreamReturnStatement (node, identation);
        }
        const leadingComment = csharp.printLeadingComments (node, identation);
        let trailingComment = csharp.printTraillingComment (node, identation);
        trailingComment = trailingComment ? ' ' + trailingComment : trailingComment;
        const value = csharp.printNode (node.expression, identation).trim ();
        const forgiving = mapped.endsWith ('?') ? '' : '!';
        return leadingComment + csharp.getIden (identation) + csharp.RETURN_TOKEN + ` ((${mapped})((object)(${value}))${forgiving})` + csharp.LINE_TERMINATOR + trailingComment;
    };
    csharp._methodReturnTypesPatched = true;
}

export default installCsharpLocalTypes;

// ===== U02: list-typed core arguments (moved here from build/csharpTranspiler.ts) =====
//
// The narrowing table `typeCoreArgs` reads. Kept in this module so BOTH the narrowing pass
// and this file's element-read proof read ONE copy: a parameter that pass narrowed to a list
// is a list receiver in the emitted C#, which is exactly what stringListParameterElementType
// has to know (and the reason a position added there can never be typed here by accident).
// Generated C# core parameters that can be narrowed from `object` to a list type: the C#
// spelling of the TS `Strings` parameter (every array the printer builds is a `List<object>`,
// the bodies only read it as a list, and the dominant writer `symbols = this.marketSymbols
// (symbols)` returns IList<object>). Same positional keying and all-declarations-must-agree
// gate as CORE_STRING_ARGS, but NO call-site wrap is emitted for a list target -- unlike a
// `((string)x)` wrap, `((IList<object>)x)` on an `object` argument is a new runtime type
// check, so a position is admitted only when every caller already passes a list / `null` /
// nothing (census + per-site proof: campaigns/cs-strict/tools/S39/admission3.py).
// Read in this file by stringListParameterElementType (a narrowed list parameter's element
// reads) and by build/csharpTranspiler.ts#typeCoreArgs (the narrowing itself) -- one table.
export const CORE_LIST_ARGS = {
    'checkNoStockSymbols': { 0: 'IList<object>' },
    'fetchAllGreeks': { 0: 'IList<object>' },  // FetchAllGreeks
    'fetchBidsAsks': { 0: 'IList<object>' },  // FetchBidsAsks
    'fetchContractTickers': { 0: 'IList<object>' },  // FetchContractTickers
    'fetchFundingIntervals': { 0: 'IList<object>' },  // FetchFundingIntervals
    'fetchFundingRates': { 0: 'IList<object>' },  // FetchFundingRates
    'fetchLastPrices': { 0: 'IList<object>' },  // FetchLastPrices
    'fetchLeverageTiers': { 0: 'IList<object>' },  // FetchLeverageTiers
    'fetchLeverages': { 0: 'IList<object>' },  // FetchLeverages
    'fetchMarginModes': { 0: 'IList<object>' },  // FetchMarginModes
    'fetchMarkPrices': { 0: 'IList<object>' },  // FetchMarkPrices
    'fetchOpenInterests': { 0: 'IList<object>' },  // FetchOpenInterests
    'fetchOrderBooks': { 0: 'IList<object>' },  // FetchOrderBooks
    'fetchPositionsADLRank': { 0: 'IList<object>' },  // FetchPositionsADLRank
    'fetchPositionsHistory': { 0: 'IList<object>' },  // FetchPositionsHistory
    'fetchPositionsWs': { 0: 'IList<object>' },  // FetchPositionsWs
    'fetchSpotTickers': { 0: 'IList<object>' },  // FetchSpotTickers
    'fetchTickers': { 0: 'IList<object>' },  // FetchTickers
    'fetchTickersV2': { 0: 'IList<object>' },  // FetchTickersV2
    'fetchTickersV3': { 0: 'IList<object>' },  // FetchTickersV3
    'fetchTickersWs': { 0: 'IList<object>' },  // FetchTickersWs
    'fetchTradingLimits': { 0: 'IList<object>' },  // FetchTradingLimits
    'loadTradingLimits': { 0: 'IList<object>' },
    'parseADLRanks': { 1: 'IList<object>' },
    'parseAllGreeks': { 1: 'IList<object>' },
    'parseBidsAsksCustom': { 1: 'IList<object>' },
    'parseFundingRates': { 1: 'IList<object>' },
    'parseLastPrices': { 1: 'IList<object>' },
    'parseLeverageTiers': { 1: 'IList<object>' },
    'parseLeverages': { 1: 'IList<object>' },
    'parseMarginModes': { 1: 'IList<object>' },
    'parseMarginModifications': { 1: 'IList<object>' },
    'parseOpenInterests': { 1: 'IList<object>' },
    'parseTickers': { 1: 'IList<object>' },
    'parseTickersForRolling': { 1: 'IList<object>' },
    'pruneCachedBySymbols': { 2: 'IList<object>' },
    'subscribePublicMultipleUta': { 2: 'IList<object>' },
    'unSubscribe': { 6: 'IList<object>' },
    'unSubscribePublicMultiple': { 2: 'IList<object>' },
    'unWatchBidsAsks': { 0: 'IList<object>' },
    'unWatchFundingRates': { 0: 'IList<object>' },
    'unWatchMarkPrices': { 0: 'IList<object>' },
    'unWatchOrderBookForSymbols': { 0: 'IList<object>' },
    'unWatchPositions': { 0: 'IList<object>' },
    'unWatchTickers': { 0: 'IList<object>' },
    'unWatchTopics': { 2: 'IList<object>' },
    'unWatchTradesForSymbols': { 0: 'IList<object>' },
    'watchFundingRates': { 0: 'IList<object>' },  // WatchFundingRates
    'watchFundingRatesForSymbols': { 0: 'IList<object>' },  // WatchFundingRatesForSymbols
    'watchLiquidationsForSymbols': { 0: 'IList<object>' },  // WatchLiquidationsForSymbols
    'watchMarkPrices': { 0: 'IList<object>' },  // WatchMarkPrices
    'watchMyLiquidationsForSymbols': { 0: 'IList<object>' },  // WatchMyLiquidationsForSymbols
    'watchMyTradesForSymbols': { 0: 'IList<object>' },  // WatchMyTradesForSymbols
    'watchOrdersForSymbols': { 0: 'IList<object>' },  // WatchOrdersForSymbols
    'watchPositionForSymbols': { 0: 'IList<object>' },  // WatchPositionForSymbols
    'watchUtaTickers': { 0: 'IList<object>' },  // WatchUtaTickers
};

// The list targets of CORE_LIST_ARGS; a list parameter keeps the `object` shadow only where a
// body write cannot be attributed to a list producer (see bodyWritesAreListTyped there).
export const CORE_LIST_TARGET_TYPES = [ 'IList<object>' ];
