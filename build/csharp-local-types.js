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
//     -> Dictionary<string, object> behind an exact `(Dictionary<string, object>)` cast: every
//     return of every definition boxes a dictionary — a dict literal, an audited row helper
//     (safeTicker/safeOrder), a helper that hard-casts its own argument before handing it back
//     (safeTrade/safeLiquidation/safeBalance; safePosition's call sites all pass a dict literal),
//     parseTrade/parseOrder/parseTicker/parsePosition, or null (see CSHARP_LOCAL_CAST_CALL_TYPES).
//     The generated declaration stays `object`, so only the call sites move. Deliberately out:
//     parseWsOHLCV / parseWsTrades (List boxes — parseOHLCV hands a non-list argument back
//     unchanged), parseWsTimestamp (Int64), parseWsMarginMode (string), the parse* REST row
//     builders, and calls whose printed argument list spans lines (the cast's closing paren would
//     land on a second line, so the declaration keeps `object` and stays a one-line retype).
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
//     `this.getMessageHash (...)` results -> string? behind an exact `(string)` cast
//     (each of the five generated definitions boxes a string or null — see
//     CSHARP_LOCAL_CAST_CALL_TYPES)
//   - `this.<member>` reads of the hand-written BaseExchange ws fields
//     (cs/ccxt/base/Exchange.Options.cs): `this.symbols` -> List<object>,
//     `this.isSandboxModeEnabled` -> bool (see CSHARP_LOCAL_WS_MEMBER_TYPES)
//   - the per-callee boxes (see the per-definition cast section below): `this.requestId (...)`
//     -> Int64 or string, proven from every return path of the SAME-FILE definition (the
//     sum-of-safeInteger counters box an Int64, the toString/uuid ones a string);
//     `this.parseOrderBook (...)` -> Dictionary<string, object> (its only definition returns
//     an object literal); a bare `await promiseAll (...)` -> List<object> (the hand-written
//     helper's own Task<List<object>>, no cast needed)
//   - Precise.string* statics (string? / bool)
//   - `this.sum (a, b)` with both arguments provably an integer box (or a nullable integer
//     box) and `a % b` with both operands provably non-null numeric: the hand-written
//     (object, object) helpers box an Int64 for every such input, so the declaration is
//     `Int64` with the exact `((Int64))` cast the object-returning print cannot express
//     (see integerBoxCastType)
//   - the crypto/encode helpers retyped object -> the concrete box in this PR, together with
//     the table entries that name it: this.ecdsa / this.Ecdsa -> Dictionary<string, object>
//     (the fresh { r, s, v } signature row, Exchange.Crypto.cs) and this.base16ToBinary /
//     this.ethEncodeStructuredData -> byte[] (ConvertHexStringToByteArray and Nethereum's
//     EncodeTypedDataRaw, Exchange.Encode.cs / Exchange.ETH.cs). `hash` stays `object`
//     (digest "binary" returns Byte[], so its box is not always a string).
//   - this.omitZero (<string box>) -> string? — the hand-written helper returns a numeric zero
//     for a zero input but hands any string box back unchanged, cast with `(string)` like the
//     element-access family (see omitZeroStringProducer)
//   - a MARKET ROW read by a literal string key: `market['symbol']` prints
//     `getValue(market, "symbol")` and is declared `string?` behind the `(string)` cast when the
//     receiver is a proven market row (this.market / this.safeMarket / this.safeMarketStructure)
//     and the key is in MARKET_ROW_STRING_KEYS. Value census (ts/src, checker-typed): the
//     safeMarketStructure skeleton (undefined) plus 150 market-row literals — parseMarket /
//     fetchMarkets builders / safeMarketStructure arguments — with 1,276 fields at these keys,
//     every value a string literal / `string` / `Str` / `undefined`, plus six element writes on
//     MarketInterface-typed receivers (string/Str). The five `any`-typed sites (gate settleId,
//     gemini id, independentreserve baseId/quoteId, mercado baseId) hold strings at runtime
//     (safeString* results, `Object.keys` elements, `.slice`/`.replace` receivers); no boolean,
//     numeric, list or dictionary value exists at these keys anywhere in the corpus, so the cast
//     can never throw where the untyped `object` box did not. The other row keys (booleans:
//     spot/swap/future/option/margin/contract/linear/inverse/active/index; numerics:
//     contractSize/strike/expiry/numericId; dicts: precision/limits/info/fees) stay `object`.
//   - this.omit (<Dictionary<string, object> box>, keys) -> Dictionary<string, object> — the
//     dict-receiver overloads in Exchange.Functions.cs can never take the IList<object>
//     pass-through branch (a Dictionary is not a list), so the call's own C# type is the fresh
//     outDict; object / IDictionary receivers keep the printer's `object` (see
//     omitDictionaryProducer and the selfOmitWriteType accumulator)
//   - this.currencyToPrecision (...) -> string? and this.parsePrecision (...) -> string? —
//     generated signatures retyped by installCsharpMethodReturnTypes (every return path
//     hands back a string or null; the returns unbox through `object` like safeSymbol's)
//   - `this.safeString (obj, key, <default>)` with a PROVEN non-null string default, and the
//     same for safeString2/N and the Lower/Upper variants: the hand-written C# helper returns
//     the found non-empty string, a numeric's invariant string, or `defaultValue as string`,
//     so every return path is a non-null string and the local is `string` behind the
//     `(string)` identity cast (see nonNullStringDefaultCall). Without a default the call
//     keeps its `string?` table entry.
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
//     b?.ToString() — so a `string?` local (which can hold null) and any right operand
//     that is not a proven non-null string stay `object`. A non-nullable `string` local
//     is accepted on the left when the right operand is a proven non-null string: it
//     can never be null (its initializer and every write are proven non-null strings)
//     and add(string,string) is identical to add(object,object) for every input.
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
//       subtract: (int, int) -> int; any int/uint/long/Int64 pair -> Int64; an operand
//         that lands on the (object, object) overload (a double, or anything unproven)
//         keeps the local `object`
//       multiply: any int/uint/long/Int64 pair -> Int64; a double operand stays `object`
//         (the object overload re-boxes an integer-valued product as Int64, which a
//         double-returning twin could not reproduce)
//       divide:   int/uint/long/Int64 pairs -> Int64 — the object overload's TRUNCATING
//         Int64 branch, not JS division semantics (pre-existing divergence, unchanged
//         here); any pair with a double -> double
//     `a % b` prints mod(a, b), whose only overload returns `object`. Its box is
//     `Convert.ToInt64 ((double) a % (double) b)` — an Int64 for every numeric operand pair
//     and null only when an operand box is null — so a `%` residue is declared `Int64`
//     behind an exact cast whenever BOTH operands' C# static types are proven non-null
//     numeric (integerBoxCastType), and stays `object` otherwise. sum is the same shape:
//     `this.sum (a, b)` maps a null argument to 0 and boxes its integer-valued double sum as
//     Int64, and two arguments that are each an integer box (int / uint / long / Int64) or
//     null (Int64?) always sum to an integer, so the box is always Int64 there too.
//     The typed overloads the non-object cases resolve to live in
//     Exchange.TranspileHelpers.cs: multiply(Int64,Int64) / divide(Int64,Int64) /
//     divide(double,double) exist for this family next to subtract's int / Int64 twins,
//     and are proven identical to the (object, object) overloads for every operand pair
//     the classifier can emit (value, box type, null, overflow, division by zero —
//     differential harness)
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
// The destructured ELEMENTS are cast back for element 0 of the helpers below: each of them
// holds a CONCRETELY-TYPED local in that slot on EVERY return path (read off the generated
// C# body, not the TS tuple annotation), so `x = (T)((IList<object>)tmp)[0]` names exactly
// the box the helper produced — see DESTRUCTURED_ELEMENT0_TYPES. Every other helper keeps
// the printer's untyped read: handleOptionAndParams/2 element 0 is the user's params value
// or `defaultValue` (any), handleMarketTypeAndParams returns `getValue (market, 'type')` /
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
    'toSandboxMarketId': 'string?'
};
Object.assign (CSHARP_STRING_RETURN_METHODS, CSHARP_STRING_RETURN_METHODS_U27);

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
        // only the U27 names carry the boundary cast — the original names' bodies are
        // byte-identical (their census proved every return already prints a string)
        if (stringType === undefined || !Object.prototype.hasOwnProperty.call (CSHARP_STRING_RETURN_METHODS_U27, scopeFunction?.name?.escapedText)
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
    'opinionOrderRawAmounts': 'Dictionary<string, object>', 'parseAccountPosition': 'Dictionary<string, object>', 'parseAccountSettings': 'Dictionary<string, object>', 'parseBidAskCustom': 'Dictionary<string, object>',
    'parseBorrowRateHistories': 'Dictionary<string, object>', 'parseBorrowRates': 'Dictionary<string, object>', 'parseContractMarket': 'Dictionary<string, object>', 'parseCurrenciesCustom': 'Dictionary<string, object>',
    'parseCurrencyCustom': 'Dictionary<string, object>', 'parseDepositMethodId': 'Dictionary<string, object>', 'parseDepositWithdrawFees': 'Dictionary<string, object>', 'parseDustTrade': 'Dictionary<string, object>',
    'parseFeeTiers': 'Dictionary<string, object>', 'parseLedgerComment': 'Dictionary<string, object>', 'parseLeverages': 'Dictionary<string, object>', 'parseMarginLoan': 'Dictionary<string, object>',
    'parseMarginModes': 'Dictionary<string, object>', 'parseMarketToEvent': 'Dictionary<string, object>', 'parseNetworks': 'Dictionary<string, object>', 'parseOptionChain': 'Dictionary<string, object>',
    // the parse* row builders: a census of all 333 declarations found every return path
    // ending in safeTicker / safeOrder / safeTrade / safePosition (a row the producer returns
    // unchanged), a peer builder with the same single return, a literal, or a typed local
    'parseOrder': 'Dictionary<string, object>', 'parsePosition': 'Dictionary<string, object>',
    'parseTicker': 'Dictionary<string, object>', 'parseTrade': 'Dictionary<string, object>',
    'parseOutcomeDescription': 'Dictionary<string, object>', 'parsePublicDepositWithdrawFees': 'Dictionary<string, object>', 'parseSettlement': 'Dictionary<string, object>', 'parseSpotMarket': 'Dictionary<string, object>',
    'parseSwapMarket': 'Dictionary<string, object>', 'parseTradeQuote': 'Dictionary<string, object>', 'parseTradingFees': 'Dictionary<string, object>', 'parseTradingLimits': 'Dictionary<string, object>',
    'parseTransactionFee': 'Dictionary<string, object>', 'parseTransactionFees': 'Dictionary<string, object>', 'parseWsAllBidsAsks': 'Dictionary<string, object>', 'polymarketOrderRawAmounts': 'Dictionary<string, object>',
    'postActionRequest': 'Dictionary<string, object>', 'prepareAccountRequest': 'Dictionary<string, object>', 'removeKeysFromDict': 'Dictionary<string, object>', 'safeLedgerEntry': 'Dictionary<string, object>',
    'safeNetwork': 'Dictionary<string, object>', 'safeOpenInterest': 'Dictionary<string, object>', 'safeOrder': 'Dictionary<string, object>', 'safePosition': 'Dictionary<string, object>', 'safeTicker': 'Dictionary<string, object>',
    // the trade/position row producers the four parsers below hand back unchanged: each has
    // a single return, the input row itself, after the body wrote fee/fees/amount/price/cost
    // (safeTrade) or percentage/contractSize (safePosition) through an IDictionary hard cast
    'safeTrade': 'Dictionary<string, object>',
    'setApiCredentials': 'Dictionary<string, object>', 'signParams': 'Dictionary<string, object>', 'withdrawRequest': 'Dictionary<string, object>', 'wrapAsPostAction': 'Dictionary<string, object>',
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
    'parseWsOHLCVs': 'List<object>', 'parsedFeeAndFees': 'List<object>', 'prepareOrdersByStatusRequest': 'List<object>', 'prepareRequest': 'List<object>',
    'prepareRequestForDepositAddress': 'List<object>', 'reduceFeesByCurrency': 'List<object>', 'resolveAuthType': 'List<object>', 'resolvePath': 'List<object>',
    'separateBidsOrAsks': 'List<object>', 'spotOrderPrepareRequest': 'List<object>',
};

// Request builders whose declarations do NOT all return the same box: 24 venues' helper builds
// a request Dictionary while dydx / hitbtc / pacifica / toobit return the [request, params]
// pair (a List). Each declaration is proven on its own return paths instead, and a
// `object x = this.<name>(...)` local is typed only when the declaration the call BINDS proves
// — the single same-file method, or the base-class method the checker resolves for a pro class.
export const CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION = {
    'cancelAllOrdersRequest': 'Dictionary<string, object>',
    'cancelOrderRequest': 'Dictionary<string, object>',
    'cancelOrdersRequest': 'Dictionary<string, object>',
    'createContractOrderRequest': 'Dictionary<string, object>',
    'createOrderRequest': 'Dictionary<string, object>',
    'createOrdersRequest': 'Dictionary<string, object>',
    'createSpotOrderRequest': 'Dictionary<string, object>',
    'editOrderRequest': 'Dictionary<string, object>',
};

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
    const mapped = CSHARP_COLLECTION_RETURN_METHODS[name];
    if (mapped !== undefined) {
        return mapped;
    }
    // a per-declaration name: only the declarations whose every return path already prints the
    // mapped box are retyped, so a venue whose helper returns the pair keeps `object` (its
    // callers' locals stay `object` too — both sides read the same proof, see callReturnType)
    const perDeclaration = CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION[name];
    return (perDeclaration === undefined) ? undefined : declarationCollectionReturnType (csharp, node, perDeclaration);
}

// true when the return expression already prints as the mapped type, so the boundary cast
// would be an identity and is skipped: object/array literals print
// `new Dictionary<string, object>() { ... }` / `new List<object>() { ... }`, and
// `this.extend(...)` / `this.deepExtend(...)` resolve to the hand-written base signatures.
function collectionReturnIsTyped (csharp, expression, mapped) {
    if (expression?.kind === ts.SyntaxKind.ObjectLiteralExpression || expression?.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        return true;
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

// true only when the printed value of a return expression ALREADY has the mapped static type:
// an object/array literal, a call whose own type is the mapped one (extend/deepExtend, a
// table-listed name, a proven peer), or a local this module declares the mapped type for
function collectionReturnExpressionProves (csharp, expression, mapped) {
    let node = expression;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
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
    }
    return (typeof csharp.csharpTypeOfInitializer === 'function') ? csharp.csharpTypeOfInitializer (call) : undefined;
}

// true only when EVERY return path of the declaration already prints the mapped box
function methodReturnsProveCollection (csharp, declaration, mapped) {
    let proved = true;
    let sawReturn = false;
    const visit = (node) => {
        if (!proved || (node !== declaration && ts.isFunctionLike (node))) {
            return; // a return inside a callback belongs to that callback
        }
        if (node.kind === ts.SyntaxKind.ReturnStatement) {
            sawReturn = true;
            if (node.expression === undefined || !collectionReturnExpressionProves (csharp, node.expression, mapped)) {
                proved = false;
            }
            return;
        }
        ts.forEachChild (node, visit);
    };
    ts.forEachChild (declaration, visit);
    return proved && sawReturn;
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
        const proof = methodReturnsProveCollection (csharp, declaration, mapped) ? mapped : false;
        collectionDeclarationTypes.set (declaration, proof);
        return (proof === false) ? undefined : proof;
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
function byDeclarationCollectionReturnIsProven (csharp, declaration) {
    const mapped = CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION[declaration?.name?.escapedText];
    return mapped !== undefined && declarationCollectionReturnType (csharp, declaration, mapped) === mapped;
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
        // the boundary cast would be a redundant `(T)((object)v)` on each of them
        if (mapped === undefined || !node.expression || collectionReturnIsTyped (csharp, node.expression, mapped) || rowBuilderReturnIsTyped (csharp, enclosing, node.expression, mapped) || byDeclarationCollectionReturnIsProven (csharp, enclosing)) {
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
    // `object` while every path already produced the named box (the numeric-returns section at the end of this file
    // declares the same signatures; nonce/milliseconds are non-nullable Int64)
    'milliseconds': 'Int64',
    'nonce': 'Int64',
    'parseToInt': 'Int64?',
    'parseNumber': 'double?',
    'safeNumber': 'double?',
    'safeNumber2': 'double?',
    'safeNumberN': 'double?',
    'safeNumberOmitZero': 'double?',
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
    'urlencodeBase64': 'string', // Base64urlEncode: throws on null, non-null string otherwise
    // Exchange.Encode.cs / Exchange.ETH.cs — retyped object -> byte[] in this PR, together
    // with the table entries below: every return path of base16ToBinary is
    // ConvertHexStringToByteArray's byte[], and ethEncodeStructuredData's single return is
    // Nethereum's Eip712TypedDataSigner.EncodeTypedDataRaw (vendored, `public byte[]`)
    'base16ToBinary': 'byte[]',
    'ethEncodeStructuredData': 'byte[]',
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
    // Exchange.Functions.cs / Exchange.Generic.cs
    // omit is NOT in this table (its result depends on the receiver): the object-receiver
    // overloads pass IList inputs through — see the omit family below (omitDictionaryProducer)
    'keysort': 'Dictionary<string, object>',
    'sortBy': 'List<object>',
    'sortBy2': 'List<object>',
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
    // safeOutcomeSymbol hands back the handle string. safeOutcome stays object (caller
    // passthrough — see the same table).
    'outcome': 'IDictionary<string, object>',
    'safeOutcomeSymbol': 'string?',
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
    const name = printedBareCalleeName (call);
    return name !== undefined && value.startsWith ('await ' + name + '(');
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
// orders / myTrades / positions are declared `public object` and stay out of the table: a
// read of an `object` field is an object box, and the field cannot be retyped either —
// their writers mix `{}` (positions), null, and object-returning helper results
// (`this.pruneCachedBySymbols (...)`, declared `object`) with the ArrayCache constructors.
const CSHARP_LOCAL_WS_MEMBER_TYPES = {
    'symbols': 'List<object>',
    'isSandboxModeEnabled': 'bool',
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
const ARM_COLLECTION_WIDENING_PAIRS = [
    [ 'Dictionary<string, object>', 'IDictionary<string, object>' ],
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

function arithmeticKindOfType (type) {
    return (type === 'int' || type === 'Int64' || type === 'double') ? type : undefined;
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
        return csharpArithmeticExpressionKind (csharp, node, context);
    }
    return undefined;
}

// the C# static type of an emitted `a - b` / `a * b` / `a / b`, or undefined when it lands
// on the (object, object) overload and nothing can be named. The typed overload sets
// (Exchange.TranspileHelpers.cs) are
//   subtract: (int, int) -> int, (Int64, Int64) -> Int64
//   multiply: (Int64, Int64) -> Int64
//   divide:   (Int64, Int64) -> Int64, (double, double) -> double
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
    if (left === undefined || right === undefined) {
        return undefined;
    }
    const bothSmallInt = ARITHMETIC_SMALL_INT.includes (left) && ARITHMETIC_SMALL_INT.includes (right);
    if (op === ts.SyntaxKind.SlashToken) {
        // any double operand widens to (double, double); Int64 pairs divide truncated
        return bothSmallInt ? 'Int64' : 'double';
    }
    if (!bothSmallInt) {
        return undefined;   // a double operand lands on the (object, object) overload
    }
    if (op === ts.SyntaxKind.MinusToken && left === 'int' && right === 'int') {
        return 'int';       // subtract(int, int)
    }
    return 'Int64';
}

// ===== integer-box helper call results =====
//
// `this.sum (a, b)` and `a % b` (printed `mod(a, b)`) are the two hand-written helpers whose
// (object, object) overload returns `object` while the box it hands back is provably an Int64
// for a whole operand family — so the declaration can name it, with the exact cast the
// object-returning call cannot express (the same shape as the element-access string cast).
//
//   sum (Exchange.Generic.cs): `if (a == null) a = 0;` for both arguments, then
//     `Convert.ToInt64 (Convert.ToDouble (a) + Convert.ToDouble (b))` whenever the double sum
//     is integer-valued. Convert.ToDouble of an integer box is integral (the nearest double to
//     an integer value is an integer), so an argument that is an integer box (int / uint /
//     long / Int64) or null (an Int64? — the nullable spelling this module declares for
//     safeInteger / parseToInt) makes the sum integer-valued by construction: the box is
//     ALWAYS Int64, never the double the last return hands back for a non-integer input.
//   mod (Exchange.TranspileHelpers.cs): null for a null operand, otherwise the Int64 box
//     `Convert.ToInt64 ((double) a % (double) b)`. Both operands proven non-null numeric
//     (int / uint / long / Int64 / double) means that box is reached on every path.
//
// The (string) / list families above reject a double operand; here a double is provable for
// mod (the box is Int64 either way) but NOT for sum (a double operand can make the object
// overload return the double itself).
function integerOrNullArgumentKind (csharp, node, context) {
    const kind = csharpArithmeticOperandKind (csharp, node, context);
    if (kind !== undefined) {
        // int / uint / long literals and int / Int64 proven expressions; a double operand can
        // make the object sum hand back the double itself, so it proves nothing
        return ARITHMETIC_SMALL_INT.includes (kind) ? kind : undefined;
    }
    return (csharpTypeOfValue (csharp, node, context) === 'Int64?') ? 'Int64?' : undefined;
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
    if (initializer?.kind === ts.SyntaxKind.BinaryExpression && initializer.operatorToken?.kind === ts.SyntaxKind.PercentToken) {
        // both operands proven: any proven kind here is numeric (literals, .length,
        // milliseconds/parseTimeframe-style calls, typed locals, nested arithmetic)
        if (csharpArithmeticOperandKind (csharp, initializer.left, context) === undefined) {
            return undefined;
        }
        return (csharpArithmeticOperandKind (csharp, initializer.right, context) === undefined) ? undefined : 'Int64';
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

// Call results whose runtime box is provably the named type on EVERY return path of every
// generated definition, so the printed `object` call can carry an exact cast back (the
// same shape as the element-access string cast below). Keyed on `this.<name>` calls.
// The value is the DECLARATION spelling: `T?` where a return path can hand back null
// (the printer cannot prove non-null, so the nullable spelling keeps every use warning-free
// under the csproj's <Nullable>enable</Nullable>), non-null for the collection boxes.
export const CSHARP_LOCAL_CAST_CALL_TYPES = {
    // ts/src/pro/{kraken,krakenfutures,kucoin,bingx,lighter}.ts — the only five definitions:
    // each starts from its `string` first parameter and appends only string literals (and
    // `this.symbol (...)` / Str values) through the add() chain, so the box is a string or
    // null (C# add(object, object) returns null for a null left, never throws).
    'getMessageHash': 'string?',
    // ts/src/pro/**.ts — the ws row builders (the parseWs* family) whose every definition's
    // every return boxes a Dictionary<string, object>: a dict literal, an already-audited row
    // helper (safeTicker/safeOrder), a helper that hard-casts its own argument before handing
    // it back (safeTrade/safeLiquidation/safeBalance; safePosition's call sites all pass a dict
    // literal), parseTrade/parseOrder/parseTicker/parsePosition, or null. The generated
    // declaration stays `object`, so the call site carries the exact cast back.
    'parseWsBalance': 'Dictionary<string, object>',
    'parseWsBidAsk': 'Dictionary<string, object>',
    'parseWsFundingRate': 'Dictionary<string, object>',
    'parseWsInstrument': 'Dictionary<string, object>',
    'parseWsLiquidation': 'Dictionary<string, object>',
    'parseWsMyLiquidation': 'Dictionary<string, object>',
    'parseWsMyTrade': 'Dictionary<string, object>',
    'parseWsOldTrade': 'Dictionary<string, object>',
    'parseWsOptionsPosition': 'Dictionary<string, object>',
    'parseWsOrder': 'Dictionary<string, object>',
    'parseWsOrderTrade': 'Dictionary<string, object>',
    'parseWsOrderUpdate': 'Dictionary<string, object>',
    'parseWsPosition': 'Dictionary<string, object>',
    'parseWsTicker': 'Dictionary<string, object>',
    'parseWsTrade': 'Dictionary<string, object>',
    'parseWsUtaOrder': 'Dictionary<string, object>',
    'parseWsUtaPosition': 'Dictionary<string, object>',
    'parseWsUtaTicker': 'Dictionary<string, object>',
    'parseWsUtaTrade': 'Dictionary<string, object>',
    'parseWsUpdatedTicker': 'Dictionary<string, object>',
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

// `this.safeOutcome (<one key>)` / `await this.loadOutcome (...)`: every path of the two
// accessors boxes a row of this.outcomes / this.outcomes_by_id (IDictionary writers only)
// or a fresh Dictionary literal — the 2-arg safeOutcome passthrough is the caller's box.
const OUTCOME_ROW_TYPE = 'IDictionary<string, object>';

function outcomeCacheCallCastType (initializer) {
    // `await this.loadOutcome (...)` unwraps the same row
    const call = (initializer?.kind === ts.SyntaxKind.AwaitExpression) ? initializer.expression : initializer;
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = call.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const methodName = callee.name?.escapedText;
    if (methodName === 'safeOutcome') {
        return (call.arguments?.length === 1) ? OUTCOME_ROW_TYPE : undefined;
    }
    if (methodName === 'loadOutcome') {
        return OUTCOME_ROW_TYPE;
    }
    return undefined;
}

// ===== per-definition callee boxes (requestId / parseOrderBook) =====
//
// Two callees whose generated C# signature is still `object` while every return path of
// every definition in the tree boxes a concrete type. The proof is per CALLEE — and for
// requestId per DEFINITION — so the receiving local carries the exact cast back, the same
// shape as the getMessageHash family above.

// this.parseOrderBook (...) -> Dictionary<string, object>, never null.
// ts/src/base/Exchange.ts#parseOrderBook is the ONLY declaration in the tree (census:
// `parseOrderBook (` matches one declaration and no override across ts/src/** and
// cs/ccxt/**); its single return is an object literal, printed
// `((object)new Dictionary<string, object>() {...})`, so the box is a fresh dictionary on
// the only path. The nullable spelling is not needed and would only widen the static view.
export const CSHARP_LOCAL_EXACT_CAST_CALL_TYPES = {
    'parseOrderBook': 'Dictionary<string, object>',
};

function exactCallResultCastType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const methodName = callee.name?.escapedText;
    return Object.prototype.hasOwnProperty.call (CSHARP_LOCAL_EXACT_CAST_CALL_TYPES, methodName) ? CSHARP_LOCAL_EXACT_CAST_CALL_TYPES[methodName] : undefined;
}

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
    const sourceFile = initializer.getSourceFile?.();
    if (sourceFile === undefined) {
        return undefined;
    }
    if (requestIdBoxTables.has (sourceFile)) {
        return requestIdBoxTables.get (sourceFile);
    }
    // the file must declare the method exactly once: two declarations (two classes in one
    // file) would make the call's binding ambiguous, and C# has no return-type overloads
    let declaration;
    let declarations = 0;
    const visit = (node) => {
        if (node.kind === ts.SyntaxKind.MethodDeclaration && node.name?.escapedText === methodName) {
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
    if (target?.kind === ts.SyntaxKind.ThisKeyword) {
        if (methodName === 'safeValue') {
            // `this.safeValue (this.orderbooks, symbol[, default])` — same map read, with default
            const read = orderbookMapReadType (initializer);
            if (read !== undefined) {
                return read;
            }
        }
        if (CSHARP_PREDICTION_OWNED_RETURNS.has (methodName) && isPredictionSource (initializer)) {
            return undefined; // the prediction tree owns this family
        }
        // a per-declaration request builder: the local's type must equal the return type the
        // declaration being called prints, so both sides read the same return-path proof
        const perDeclaration = CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION[methodName];
        if (perDeclaration !== undefined) {
            return boundCollectionReturnType (csharp, initializer, methodName, perDeclaration);
        }
        return CSHARP_LOCAL_THIS_RETURN_TYPES[methodName];
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
            if (CSHARP_PREDICTION_OWNED_RETURNS.has (methodName) && isPredictionSource (initializer)) {
                return undefined; // the prediction tree owns this family
            }
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
        return unifyArms (whenTrue, whenFalse, !isPredictionTierSource (node));
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
//   tokenBucket -> `public dict tokenBucket` with `using dict = Dictionary<string, object>`
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
    return CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES[node.name?.escapedText];
}

// an arm of `c ? a : b`: the value's own proven type, a base-property read (thisMemberArmType),
// or — for a parenthesised read of a local this module itself declares with a concrete type —
// that local's declared type
function conditionalArmType (csharp, node, context) {
    const direct = csharpTypeOfValue (csharp, node, context);
    if (direct !== undefined) {
        return direct;
    }
    let arm = node;
    while (arm?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        arm = arm.expression;
    }
    // the `this.<member>` rule is keyed to a non-prediction source (see isPredictionTierSource)
    if (!isPredictionTierSource (node)) {
        const memberType = thisMemberArmType (arm);
        if (memberType !== undefined) {
            return memberType;
        }
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
                    const written = csharpTypeOfValue (csharp, parent.right, context);
                    if (!assignable (csharpType, written)) {
                        // `x = x + r` / `x = this.omit (x, keys)`: the value reads this very
                        // local, so its type can only be proven against the declaration being
                        // checked (see the self-concat / self-omit sections).
                        const selfConcat = (csharpType === 'string') && (selfConcatWriteType (csharp, context, declaration, parent.right) === 'string');
                        const selfOmit = (csharpType === 'Dictionary<string, object>') && (selfOmitWriteType (csharp, context, declaration, parent.right) === 'Dictionary<string, object>');
                        if (!selfConcat && !selfOmit) {
                            return false;
                        }
                    }
                } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                    // `x += r` prints `x = add(x, r)`; only the string `+` case is named
                    // here — it is accepted under the same proof as a plain `x + r`
                    // (stringPlusOperandIsProvablyString), and the selected add(string, *)
                    // overload is declared `string`, so the write is assignable by
                    // construction. Every other compound operator stays `object`.
                    if (!(op === ts.SyntaxKind.PlusEqualsToken && stringPlusOperandIsProvablyString (csharp, n, csharpType, context))) {
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
                if (!stringPlusOperandIsProvablyString (csharp, n, csharpType, context)) {
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
                if (!stringPlusOperandIsProvablyString (csharp, value, csharpType, context)) {
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
    return csharpTypeOfValue (csharp, parent.right, context) === 'string';
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
        // this.stringToCharsArray (x) — the hand-written helper (Exchange.cs) builds its
        // List<string> from `x.ToString().ToCharArray()` one string per char, so every
        // element is a string on every path; GetValue has an exact List<string> branch
        // that returns the boxed element or null, the same box the declaration cast names
        if (method === 'stringToCharsArray' && callee.expression?.kind === ts.SyntaxKind.ThisKeyword) {
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
    if (bindings !== 1 || declaration.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined;
    }
    if (declaration.getStart () > initializer.getStart ()) {
        return undefined; // the list is not provably built before the read
    }
    const built = stringElementsProducer (declaration.initializer)
        ? { elementType: 'string', pushes: new Set () }
        : pushBuiltListElementType (csharp, scope, declaration, context);
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
const MARKET_ROW_STRING_KEYS = [ 'symbol', 'id', 'base', 'quote', 'baseId', 'quoteId', 'settle', 'settleId', 'lowercaseId', 'type' ];

// the literal key of `recv['key']`, or undefined
function elementAccessLiteralKey (node) {
    if (node?.kind === ts.SyntaxKind.StringLiteral || node?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        return node.text;
    }
    return undefined;
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
        return name === 'market' || name === 'safeMarket' || name === 'safeMarketStructure';
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

// `market['symbol']` (printed `getValue(market, "symbol")`) — a MARKET ROW read by a string
// key whose value is provably a string or null, so the declaration can name it `string?`
// behind the `(string)` cast the printer does not emit (same shape as the element-access
// family). Key set, receiver proof and the corpus census: header, MARKET_ROW_* section.
function marketRowStringReadType (csharp, initializer) {
    if (initializer?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    const key = elementAccessLiteralKey (initializer.argumentExpression);
    if (key === undefined || !MARKET_ROW_STRING_KEYS.includes (key)) {
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
    if (candidates.length !== 1) {
        return undefined; // the read refers to no local, or to an ambiguous one
    }
    const declaration = candidates[0];
    if (declaration.initializer === undefined || !marketRowValueOrNullish (declaration.initializer)) {
        return undefined;
    }
    if (declaration.getStart () > initializer.getStart ()) {
        return undefined; // the row is not provably bound before the read
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
    return 'string';
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
//   - `this.options['key']`: `options` is a ConcurrentDictionary the whole codebase assigns
//     into (`this.options['chainId'] = 11155111` in ts/src/dydx.ts, `['requestId']` = Int64
//     in the ws clients, `['tickerSubs']` = a safe dictionary, user config at construction),
//     so a describe()-literal type says nothing about the box at the read

// the file's own describe() literal — the object the generated describe() merges into
// base.describe(). Cached per source file: one entry per file the classifier asks about.
const describeOwnLiterals = new WeakMap ();

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

// the chain of string-literal keys of `this.urls[k1][k2]...`, or undefined. A dynamic key is
// rejected outright, as is an all-digit key (a numeric index into a list-shaped section would
// hand back an arbitrary element box) and a chain shorter than 2 keys.
function urlsLiteralChain (initializer) {
    let node = initializer;
    const keys = [];
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression || node?.kind === ts.SyntaxKind.ElementAccessExpression) {
        if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
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

// is the receiver the concrete `Dictionary<string, object>` the dict-receiver overloads need?
// A local this module (or the printer) declares with that type, an object literal, or a
// hand-written base call whose signature already returns it (extend/deepExtend, plus the
// Dictionary entries of CSHARP_LOCAL_THIS_RETURN_TYPES). An `object` receiver stays out: the
// IList<object> pass-through is reachable for it (see the table note), and so does an
// `IDictionary<string, object>` one — an interface-typed box is not provably this class.
function omitReceiverIsDictionary (csharp, receiver) {
    let node = receiver;
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.Identifier) {
        return identifierType (csharp, node) === 'Dictionary<string, object>';
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
        return callReturnType (csharp, node) === 'Dictionary<string, object>';
    }
    return false;
}

// `const x = this.omit (<Dictionary box>, keys)`: the call binds a dict-receiver overload, whose
// every path hands back the fresh outDict (a Dictionary<string, object> receiver is never the
// pass-through branch). The call's own C# type is therefore the declaration — no cast.
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

// `const x = this.omitZero (v)` — printed `this.omitZero (v)`. The hand-written C# helper
// (cs/ccxt/base/Exchange.Generic.cs) returns null for a double / Int64 / numeric-string ZERO
// and hands every other box straight back, so for an argument whose C# static type is string
// (the safeString family, a string-typed local) the call's box is always a string or null.
// Declaring `string?` with the `(string)` unboxing cast therefore names exactly the value the
// call already returned. Any other proven argument type is NOT provable — omitZero would hand
// a non-string box (a double-typed parseNumber result, ...) straight through — and a nested
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
    let joinedFallback;
    if (csharpType === undefined) {
        // `this.sum (a, b)` / `a % b` over the operand families their hand-written helper
        // boxes as Int64: the declaration names that box behind an exact `((Int64))` cast
        const integerBox = integerBoxCastType (csharp, declaration.initializer, ctx);
        // `const x = recv[key]`: the runtime element is a proven box, but the call's C# type
        // is `object`, so the declaration needs the cast the printer does not emit by itself.
        // Nullable when the box is a string (it is null off the end of the list).
        const elementType = (integerBox === undefined) ? elementAccessElementType (csharp, declaration.initializer, ctx) : undefined;
        if (integerBox !== undefined) {
            csharpType = integerBox;
            cast = integerBox;
        } else if (elementType !== undefined) {
            csharpType = (elementType === 'string') ? 'string?' : elementType;
            cast = elementType;
        } else if (marketRowStringReadType (csharp, declaration.initializer) === 'string') {
            // `const symbol = market['symbol']`: the market row's value at the string keys is
            // a string or null (census above), so the `(string)` cast names the box
            csharpType = 'string?';
            cast = 'string';
        } else if (urlsDescribeStringProducer (declaration.initializer)) {
            // `const x = this.urls['api']['ws']`: the describe() literal spells that leaf as a
            // string, so the getValue chain's box is a string or null — same cast as above
            csharpType = 'string?';
            cast = 'string';
        } else if (omitDictionaryProducer (csharp, declaration.initializer, ctx)) {
            // `const x = this.omit (<Dictionary box>, keys)`: the call binds a dict-receiver
            // overload (see the family comment above), so the call's own C# type IS the
            // declaration — no cast needed
            csharpType = 'Dictionary<string, object>';
        } else if (omitZeroStringProducer (csharp, declaration.initializer, ctx)) {
            // `const x = this.omitZero (<string box>)`: the call's box is a string or null
            // (see omitZeroStringProducer), so the same cast names it
            csharpType = 'string?';
            cast = 'string';
        } else {
            // `const x = this.parseOrderBook (...)`: the method's only definition boxes a
            // fresh dictionary on its only return path, so the local takes the exact
            // non-nullable type behind the same boundary cast (see
            // CSHARP_LOCAL_EXACT_CAST_CALL_TYPES)
            const exactCastType = exactCallResultCastType (declaration.initializer);
            if (exactCastType !== undefined) {
                csharpType = exactCastType;
                cast = exactCastType;
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
                    } else {
                        // `const x = this.safeOutcome (<key>)` / `await this.loadOutcome (...)`: the
                        // box is an IDictionary row or null on every path the tier can produce
                        // (see outcomeCacheCallCastType), so the declaration carries that exact cast.
                        const outcomeType = outcomeCacheCallCastType (declaration.initializer);
                        if (outcomeType !== undefined) {
                            csharpType = outcomeType;
                            cast = outcomeType;
                        }
                    }
                }
            }
        }
    }
    // a safeString* call with a proven non-null string default is a proven non-null string
    // (nonNullStringDefaultCall), but it is NOT promoted to `string` here: the nullable
    // spelling stays, and the non-null one is only retried when the scan rejects it (below)
    if (csharpType === 'null') {
        const annotated = annotationType (declaration);
        csharpType = (annotated !== undefined && COLLECTION_LOCAL_TYPES.includes (annotated))
            // a collection annotation is narrower than its later writes: an IDictionary box
            // (safeDict, a concurrent map) is not assignable to Dictionary. Join the
            // annotation with every write along the box-identical edges before the scan.
            ? typeFromValueOrWrites (csharp, scope, declaration, sourceName, annotated, ctx, NULL_DECLARED_WIDENING_EDGES)
            : (annotated ?? typeFromValueOrWrites (csharp, scope, declaration, sourceName, 'null', ctx, NULL_DECLARED_WIDENING_EDGES));
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
        // join the initializer with every later write, widening only along box-identical edges
        const dictionaryLiteral = declaration.initializer?.kind === ts.SyntaxKind.ObjectLiteralExpression;
        csharpType = typeFromValueOrWrites (csharp, scope, declaration, sourceName, csharpType, ctx, copyEdges ?? (dictionaryLiteral ? DICTIONARY_LITERAL_WIDENING_EDGES : undefined));
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
    if (!safe && csharpType === 'string?' && !predictionTreeSource (declaration.initializer) && nonNullStringDefaultCall (csharp, declaration.initializer, ctx) && csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, 'string', ctx)) {
        csharpType = 'string';
        cast = 'string';
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

// Tuple-returning helpers whose element 0 is provably a string (or null) on EVERY return
// path — the string twin of DESTRUCTURED_DICT_HELPERS above, and the same mechanism: the
// printer emits `<target> = ((IList<object>)<tmp>)[0]`, installDestructuredCasts rewrites
// that element load with the `(string)` cast back to the proven type, and only then can a
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
// argument there must be a string literal or `undefined`, or the call keeps `object`. 0 = no
// such argument. The element-1 target (`params`) is never touched: it is the caller's own dict.
export const DESTRUCTURED_STRING_HELPERS = {
    'handleMarketTypeAndParams': 4,
    'handleNetworkCodeAndParams': 0,
    'handleProductTypeAndParams': 0,
    'handleParamString': 3,
    'handleParamString2': 4,
    'getMarginMode': 0,
    'handleOriginAndSingleAddress': 0,
};

// `let x: Str = undefined` / `let x = null` — the null-initialised declarations this family
// owns. A literal-initialised local with the same destructuring write is another unit's.
function isNullInit (declaration) {
    const init = declaration?.initializer;
    if (init === undefined) {
        return false;
    }
    return init.kind === ts.SyntaxKind.NullKeyword
        || (init.kind === ts.SyntaxKind.Identifier && init.escapedText === 'undefined');
}

function isStringLiteral (node) {
    return node?.kind === ts.SyntaxKind.StringLiteral || node?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral;
}

// an explicit `undefined` argument leaves the helper's `defaultValue !== undefined` guard
// false on every path, so that branch cannot contribute element 0 at all
function isUndefinedLiteral (node) {
    return node?.kind === ts.SyntaxKind.Identifier && node.escapedText === 'undefined';
}

// element 0 of an audited string helper proves the target a string (or null)
function destructuredStringElementProof (declaration, idNode, assignment, name) {
    if (assignment.right?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call (DESTRUCTURED_STRING_HELPERS, name) || !isNullInit (declaration)) {
        return false;
    }
    if (idNode.parent?.elements?.[0] !== idNode) {
        return false;
    }
    const defaultValueArg = DESTRUCTURED_STRING_HELPERS[name];
    if (defaultValueArg > 0) {
        const argument = assignment.right.arguments[defaultValueArg - 1];
        if (argument !== undefined && !isStringLiteral (argument) && !isUndefinedLiteral (argument)) {
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
};

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
    const right = assignment.right;
    if (right?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = right.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    const helper = callee.name?.escapedText;
    if (csharpType === 'Dictionary<string, object>') {
        // only the audited request builders, and only for a target proven to be a Dictionary
        if (!DESTRUCTURED_DICT_HELPERS.includes (helper)) {
            return false;
        }
    } else if ((csharpType === 'string' || csharpType === 'string?') && destructuredStringElementProof (declaration, idNode, assignment, helper)) {
        // the null-initialised string family: element 0 of an audited helper (see
        // DESTRUCTURED_STRING_HELPERS) is a string or null, and the `(string)` cast names that box
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
            // the string family only ever proves element 0 and is cast with the
            // non-nullable spelling this module uses everywhere (the box is a string or
            // null; a reference cast accepts null unchanged)
            if (targetType === 'string' || targetType === 'string?') {
                if (match[4] !== '0') {
                    return line;
                }
                return match[1] + match[2] + ' = (string)((IList<object>)' + match[3] + ')[' + match[4] + ']' + match[5];
            }
            return match[1] + match[2] + ' = (' + targetType + ')((IList<object>)' + match[3] + ')[' + match[4] + ']' + match[5];
        }).join ('\n');
    };
    csharp._destructuredCastsPatched = true;
}

// the numeric/bool spellings a null-initialised declaration can fall back to when its
// annotation's own type is unreachable for the actual writes (see csharpLocalTypeOf)
const NUMERIC_BOOL_LOCAL_TYPES = [ 'int?', 'Int64?', 'double?', 'bool?' ];

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
            // an unannotated `let x = undefined` joins it like a plain write
            if (initial === 'null' && parent.kind === ts.SyntaxKind.ArrayLiteralExpression
                    && parent.parent?.kind === ts.SyntaxKind.BinaryExpression && parent.parent.left === parent
                    && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                const destructuredCallee = parent.parent.right?.expression;
                const destructuredName = (destructuredCallee?.kind === ts.SyntaxKind.PropertyAccessExpression && destructuredCallee.expression?.kind === ts.SyntaxKind.ThisKeyword)
                    ? destructuredCallee.name?.escapedText : undefined;
                if (destructuredName !== undefined && destructuredStringElementProof (declaration, n, parent.parent, destructuredName)) {
                    type = (type === undefined) ? 'string' : joinTypes (type, 'string');
                    if (type === undefined) {
                        return undefined;
                    }
                }
            }
            continue;
        }
        let written = csharpTypeOfValue (csharp, parent.right, context);
        if (written === undefined && type === 'string' && !sawNull) {
            // `x = x + r` accumulator write (see the self-concat section above): the
            // read of x inside the value has no C# type until this declaration decides
            // one, so the value is proven from the operands plus the running type.
            written = selfConcatWriteType (csharp, context, declaration, parent.right);
        }
        if (written === undefined && type === 'Dictionary<string, object>' && !sawNull) {
            // `x = this.omit (x, keys)` accumulator write: same self-read shape, proven
            // against the running Dictionary type (see selfOmitWriteType).
            written = selfOmitWriteType (csharp, context, declaration, parent.right);
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
    // path. `safeOutcome` is NOT retyped: its `return outcomeObj;` passthrough returns a
    // CALLER-provided box, and a caller passing a Prediction* struct would hit the cast.
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
        // (a different static type) even though the AST still reads `await this.X(...)`,
        // while a bare `await promiseAll (...)` prints as that very call
        if (declaration.initializer?.kind === ts.SyntaxKind.AwaitExpression && !awaitedCallIsPrintedAsProven (printed.slice (prefix.length), declaration.initializer)) {
            return printed;
        }
        let value = printed.slice (prefix.length);
        if (info.cast !== undefined) {
            // a call whose printed argument list spans lines (a dict-literal argument) would put
            // the cast's closing paren on a second line; the ws row-builder family keeps `object`
            // there, so every retyped declaration stays a single declaration-type-only line
            if (info.cast === 'Dictionary<string, object>' && value.includes ('\n')) {
                return printed;
            }
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
        || value.startsWith ('this.parseCurrencies (') || value.startsWith ('this.parseCurrencies(');
}

// ===== awaited same-file cores =====
//
// Async methods declared in a venue file whose EVERY return path already hands back one
// concrete box (the census is the proof itself: awaitedCoreBoxType re-runs per declaration
// at print time, so a path that stops proving leaves the method `Task<object>` untouched).
// The generated signature prints `Task<T>` and every `await this.<name>(...)` local takes T.
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
        const proven = awaitedCoreBoxType (csharp, node);
        mapped = (proven === CSHARP_AWAITED_CORE_RETURNS[name]) ? proven : undefined;
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
        const already = retype.awaited ? awaitedCoreReturnIsAlreadyTyped (value, retype.type) : asyncCoreReturnIsAlreadyTyped (value);
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
    // (subtract with an object operand), convertToBigIntCustom / feeAmountMultiplier
    // (parseInt is declared `object`), getClosestLimit / getAccountId /
    // getOrderBookLimitByMarketType / parsePolyTimestamp (identifier/parameter passthrough).
    'convertFromRealAmount': 'double?',
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
    const mapped = CSHARP_NUMERIC_RETURN_TYPES[node.name?.escapedText];
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
