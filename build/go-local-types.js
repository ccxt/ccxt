import ts from 'typescript6';

// CCXT-side extension of the Go printer's local-variable typing.
//
// Two families live here:
//   1. helper-return types (CCXT_GO_HELPER_RETURN_TYPES) — a local initialised by a
//      hand-written base helper whose Go signature is concrete already.
//   2. the nil-declared later-write join (see the U03 section near the bottom) — a
//      local declared `let x = undefined` whose every later write is a provable
//      map[string]any / []any and whose every read is dominated by one of them.
//
// ast-transpiler prints `var x any = <init>` unless its allow-list
// (GO_HELPER_RETURN_TYPES in src/goTranspiler.ts) knows the concrete Go type the
// initializer already produces. That list only covers the printer's own runtime
// helpers. The hand-written CCXT base (go/v4/exchange*.go, NOT exchange_generated.go)
// exposes many more helpers with a concrete, never-nil Go return type — string /
// []any / []string / []byte / int / int64 / map[string]any — and every one of them
// is boxed into `any` today. This module teaches the printer those signatures.
//
// It plugs into the printer's existing classification hook, `goTypeOfInitializer`,
// so the upstream reject filters (getGoLocalType → goTypeNameIsShadowed /
// goLocalIsSafeToType: `x.push()`, a later `x = <other type>`, `x++`, spread,
// destructuring, a local shadowing a Go type name) keep applying unchanged.
//
// Two rules decide membership:
//   1. the Go method is HAND-WRITTEN with a concrete return type. Anything living
//      in exchange_generated.go / exchange_prediction.go returns `any` (it is
//      transpiled) and must stay out — `cannot use ... (value of interface type
//      any) as []any value in variable declaration` otherwise.
//   2. the value can never be a typed nil that used to read as `undefined`.
//      `this.Market`, `GetValue`, `Ternary`, `Add`, `this.SafeValue`, `this.Hash`,
//      `this.ParseNumber` ... all return `any` and are deliberately absent.
//      The numeric/time helpers that DO carry a pointer shape (`this.NumberToString`,
//      `this.Parse8601`, `this.Iso8601`) were retyped to `*string` / `*int64` in the
//      hand-written base first — a local typed from them holds the same pointer the
//      caller would have boxed, and every consumer is pointer-aware (derefScalar at the
//      shim entry, `*x` / `x != nil` from the printer, IsEqual for the `any` boxes).
//      The `this.SafeDict`/`SafeDict2`/`SafeDictN` family
//      (like `this.SafeList*`) is absent for a stronger reason: its TS type is
//      `T | undefined` and the value comes out of a transpiled `any`-returning base
//      method, so a concrete Go type would have to carry the absent case as a typed
//      nil — and `IsEqual(nil map, nil)` is false where `IsEqual(nil, nil)` is true,
//      which inverts every `=== undefined` presence check.
// The `this.Safe*` accessors and `Precise.String*` belong to the upstream printer
// (ast-transpiler#70/#75, ccxt#30054) and are intentionally not listed here — with two
// exceptions whose Go signatures this campaign coerces to the same `*string` shape:
// `SafeCurrencyCode` and `SafeSymbol` (see coerceTypedStringAccessors in
// build/goTranspiler.ts, which rewrites the transpiled signature + its single return).
// Both are string-ish on every TS path: the code/symbol field of the currency/market dict
// their callee always returns, or `undefined` when that dict carries none. `SafeMarket`
// and `SafeCurrency` return those dicts themselves and stay `any`.
//
// A third rule (below) covers copy propagation: `var y any = x` where `x` is a local
// whose Go type the printer already knows — the copy carries the same concrete type,
// resolved scope-aware through the printer's goDeclaredTypeOfIdentifier.
//
// The third family here — see `ccxtGoFamilyMethodReturnType` — is the generated
// string-returning mapper helpers (`parseOrderStatus`, `parseOrderType`,
// `parseTimeInForce`, ...). Those are transpiled from the exchange's own TS class,
// so their Go signature is `any` and gets no entry in the table below; instead the
// printer's `printMethodDefinition` is wrapped to emit `*string` for the subset
// whose every TS return path is a `this.safeString*` result or an absent value
// (undefined/null → a nil pointer in Go). The very same predicate then types the
// caller's local, so the signature and the declaration can never disagree.
//
// Both the main-thread transpiler (build/goTranspiler.ts setupTranspiler) and the
// Piscina worker (build/go-worker.js) must install this, or the two code paths
// emit different Go for the same source.
//
// U01 — nil-declared later-write join (string): `let x: Str = undefined` (or a bare
// `let x;`) prints `var x any = nil`. That nil branch of the printer bypasses
// getGoLocalType entirely, so the classification hook above cannot reach it; the
// declaration is retyped by wrapping printVariableDeclarationList instead (the same
// shape build/csharp-local-types.js uses on the C# printer). The nil in the box is a
// value TS reads as `undefined`, so the declaration may only name a concrete type
// when that nil can never be observed (BRIEF rule 1):
//
//   * every later plain assignment to x classifies to exactly `string` — the same
//     goTypeOfInitializer chain the printer's own later-writes scan runs, so a
//     `this.Safe*` / Precise result (a *string pointer) or any `any`-valued write
//     keeps the local `any`, and
//   * x is definitely assigned before every read (goNilDeclaredDefiniteAssignment
//     below). Only then does `var x string` hold the identical value on every path:
//     the nil initial state is dead, so dropping `= nil` (zero value "") moves no box.
//
// Everything else stays `any`: writes of another or unprovable type (including
// `x = undefined`), a read that can still see the nil, `x.push(...)`, `x++`,
// compound assignments, destructuring writes, spreads, a shadowing declaration, a
// read inside a nested function, and nil comparisons (`x !== undefined` prints
// `x != nil`, which does not compile against a string local).


// Generated methods whose TypeScript body returns a boolean on every path, but whose
// emitted Go signature still says `any` — the pinned printer maps no TS return
// annotation to Go `bool`. This is ONE rule with two halves, so the list lives here
// and both halves read it:
//   1. ccxtGoTypeOfPrintedCall() below types `var x any = this.M(...)` as `bool`
//   2. build/goTranspiler.ts#coerceGoBoolMethodReturns() retags the emitted
//      `func (this *T) M(...) any {` to `bool`, which is what the `: boolean`
//      annotation already promises (every `return` in those bodies produces a Go
//      bool — the per-method census is in this unit's REPORT.md).
// Deliberately absent: safeBool/safeBool2 (`boolean | undefined`; a Go bool cannot
// carry the undefined case — those belong to the campaign's Safe* pointer family) and
// every `: boolean` helper that no local reads (a signature change with no typed
// declaration buys risk and nothing else).
export const CCXT_GO_BOOL_METHOD_NAMES = [
    'IsPostOnly',
    'IsRoundNumber',
    'CheckRequiredCredentials',
    'IsLinear',
    'IsInverse',
    'UsesPrivateKey',
    'IsHfOrMining',
];





export const CCXT_GO_HELPER_RETURN_TYPES = {
    // generated boolean-returning methods (see CCXT_GO_BOOL_METHOD_NAMES above)
    ...Object.fromEntries (CCXT_GO_BOOL_METHOD_NAMES.map ((name) => [ 'this.' + name, 'bool' ])),
    // exchange_functions.go / exchange_generic.go
    'this.ToArray': '[]any',
    'this.SortBy': '[]any',
    'this.SortBy2': '[]any',
    'this.FilterBy': '[]any',
    'this.Sort': '[]any',
    'this.ExtractParams': '[]any',
    // arrayConcat is `(a: any[], b: any[]) => a.concat (b)` upstream: an array on every path,
    // never a typed nil — the Go twin returns a nil `[]any` (not an untyped nil) when an
    // operand is not a slice, which reads exactly like the old boxed `nil`.
    'this.ArrayConcat': '[]any',
    // deepExtend2 is Go-only: every return path hands back the `outDict` accumulator (a
    // non-map operand panics on the assertion instead of escaping), so `map[string]any` is exact.
    'this.DeepExtend2': 'map[string]any',
    // exchange.go / exchange_string.go
    'this.StringToCharsArray': '[]string',
    'this.Capitalize': 'string',
    'this.Uuid16': 'string',
    'this.Uuid22': 'string',
    'this.Uuid5': 'string',
    'this.RandomBytes': 'string',
    'this.FixStringifiedJsonMembers': 'string',
    'this.Yymmdd': 'string',
    'this.PrecisionFromString': 'int',
    'this.BinaryLength': 'int',
    'this.Crc32': 'int64',
    'this.RandNumber': 'int64',
    // exchange_helpers.go — the hand-written method delegates to the package-level
    // IsDictionary predicate, so it is a real Go bool
    'this.IsDictionary': 'bool',
    // exchange_encode.go
    'this.Urlencode': 'string',
    // the array-repeat encoder is hand-written next to Urlencode with the same concrete
    // `string` return; naming it also lets a literal-initialised `any` local whose only
    // later write is this call (phemex Sign queryString) carry the type its literal implies
    'this.UrlencodeWithArrayRepeat': 'string',
    'this.Rawencode': 'string',
    'this.Encode': 'string',
    'this.Decode': 'string',
    'this.EncodeURIComponent': 'string',
    'this.IntToBase16': 'string',
    'this.Remove0xPrefix': 'string',
    'this.StringToBase64': 'string',
    'this.BinaryToBase16': 'string',
    'this.BinaryToBase64': 'string',
    'this.BinaryToBase58': 'string',
    'this.BinaryToString': 'string',
    'this.Base16ToBinary': '[]byte',
    'this.Base64ToBinary': '[]byte',
    'this.Base58ToBinary': '[]byte',
    'this.BinaryConcat': '[]byte',
    // exchange_eth.go
    'this.EthGetAddressFromPrivateKey': 'string',
    // exchange_number.go / exchange.go / exchange_string.go — hand-written helpers whose every
    // return path is a Go `string` (audited by the go-locals U24 unit; REPORT.md lists the
    // look-alikes that must stay `any`: implodeParams/implodeHostname return the raw path or nil,
    // json/iso8601/parse8601/parseDate/numberToString/parseJson/convertToBigInt have a nil path,
    // hash returns []byte for digest "binary")
    'this.DecimalToPrecision': 'string',
    'this.ExceptionMessage': 'string',
    'this.Strip': 'string',
    'this.ExtendedStarknetGetSelectorFromName': 'string',
    'this.ExtendedStarknetComputePoseidonHashOnElements': 'string',
    // The SafeBool accessors are the one member of the Safe* pointer layer whose TS bodies are
    // real methods (safeBool/safeBool2/safeBoolN live below the "METHODS BELOW THIS LINE"
    // marker), so the printer emits them as methods and returns `any`. build/goTranspiler.ts
    // drops that generated copy and go/v4/exchange_safe.go hand-writes the pointer-returning
    // twins, mirroring this.SafeString / this.SafeFloat.
    'this.SafeBool': '*bool',
    'this.SafeBool2': '*bool',
    'this.SafeBoolN': '*bool',
    // exchange_safe.go / exchange_generated.go. The Safe*Number accessors are TS methods whose
    // `Num` return annotation prints as `any`; their Go signature is coerced to the honest
    // *float64 pointer in exchange_safe.go (the transpiled copies are dropped in
    // build/goTranspiler.ts), mirroring the hand-written SafeFloat layer. Same rule as the
    // upstream table's SafeFloat/SafeInteger entries: a nil pointer is the absent value, a
    // non-nil pointer a present number (so a present zero stays distinct).
    'this.SafeNumber': '*float64',
    'this.SafeNumber2': '*float64',
    'this.SafeNumberN': '*float64',
    'this.SafeNumberOmitZero': '*float64',
    // the transpiled test tree calls the base methods on a `*ccxt.Exchange`-typed local
    // literally named `exchange`, so the same signatures apply there
    'exchange.SafeNumber': '*float64',
    'exchange.SafeNumber2': '*float64',
    'exchange.SafeNumberN': '*float64',
    'exchange.SafeNumberOmitZero': '*float64',
    // --- numeric / time helpers (the U17 family) ------------------------------------
    // Each entry names the Go type every return path of the (hand-written or coerced)
    // method already produces, so a local that receives the call keeps the very same
    // value and only refines what the Go compiler knows.
    //   NumberToString: string, or nil once the input stringifies to "" (undefined in TS)
    //   Parse8601:      int64 milliseconds, or nil when every layout fails (undefined in TS)
    //   Iso8601:        the formatted string, or nil for an absent/unparsable timestamp
    // The two pointer shapes follow the #30054 Safe*/Precise.String* convention: a nil
    // pointer is what TS reads as undefined, the printer emits *x / `x != nil` at every
    // consumer of a typed local, and derefScalar() unwraps the ones that stay `any`.
    //   ParseToInt:     ParseInt(ParseFloat(NumberToString(x))) — the hand-written ParseInt
    //                   always returns int64 (math.MinInt64 on failure), so this one can
    //                   never be nil and is named as a plain int64.
    // ParseNumber is deliberately absent: its Go body hands `a[0]` — the caller's own
    // default, of arbitrary type — straight back, so no single Go type names its box.
    'this.NumberToString': '*string',
    'this.Parse8601': '*int64',
    'this.Iso8601': '*string',
    'this.ParseToInt': 'int64',
    // package-level string helpers (exchange_helpers.go); the printer emits these
    // for the matching String.prototype call, e.g. `s.replace (a, b)` → `Replace(s, a, b)`
    'Replace': 'string',
    'Join': 'string',
    'Slice': 'string',
    'Trim': 'string',
    'PadStart': 'string',
    'PadEnd': 'string',
    'GetLength': 'int',
    'ObjectValues': '[]any',
    // exchange_crypto.go (imported free functions in TypeScript: `eddsa (...)`)
    'Eddsa': 'string',
    'Jwt': 'string',
    'Rsa': 'string',
    'Totp': 'string',
    'Ecdsa': 'map[string]any',
    // exchange_generated.go: SafeCurrencyCode / SafeSymbol return the code/symbol field of
    // the dict safeCurrency/safeMarket always hands back, so their signature is coerced to
    // the same `*string` shape as the hand-written accessors above (coerceTypedStringAccessors
    // in build/goTranspiler.ts) and an absent value stays a nil pointer.
    'this.SafeCurrencyCode': '*string',
    'this.SafeSymbol': '*string',
    'this.DerivedExchange.SafeCurrencyCode': '*string',
    // base tuple helpers (exchange_generated.go). These are transpiled, but their emitted
    // signature is coerced to `[]any` — every return path in the TS body prints a Go
    // `[]any{...}` literal, see the coerceRegex in build/goTranspiler.ts#transpileBaseMethods.
    // Listed so the ordinary (non-destructuring) call sites get a typed local too:
    // `var values any = this.HandleOptionAndParams (...)` in HandleSubTypeAndParams.
    'this.HandleOptionAndParams': '[]any',
    'this.HandleOptionAndParams2': '[]any',
    'this.HandleParamString': '[]any',
    'this.HandleParamString2': '[]any',
    'this.HandleMarketTypeAndParams': '[]any',
};

// ---------------------------------------------------------------------------
// U26 — ws/pro tree (build/goTranspiler.ts --ws; sources under ts/src/pro/**, emitted
// as package ccxtpro). These callees exist only in the pro tree, and two Go-specific
// facts decide the type:
//
//   1. goTranspiler.ts#getWsRegexes rewrites member accesses on these locals into Go
//      type assertions before the file is written:
//          orderbook.reset (snapshot) -> orderbook.(ccxt.OrderBookInterface).Reset(snapshot)
//          client.futures             -> client.(ccxt.ClientInterface).GetFutures()
//      A type assertion whose operand is not an interface value does not compile
//      (`invalid operation: x.(T) (variable of type *T) is not an interface`), so a
//      concrete pointer here would break every one of those sites, and rewriting them
//      is out of scope (the generated diff must stay declaration-type only). The
//      interface type keeps every one of them legal and upgrades them to a compile-time
//      check instead of a runtime panic.
//   2. the declared type must be implemented by what the hand-written helper returns,
//      which the Go compiler verifies at the assignment:
//          this.OrderBook ()         *WsOrderBook      has the full OrderBookInterface set
//          this.IndexedOrderBook ()  *IndexedOrderBook embeds *WsOrderBook (promoted methods)
//          this.CountedOrderBook ()  *CountedOrderBook embeds *WsOrderBook (promoted methods)
//          this.Client (url)         *WSClient         embeds *Client (promoted methods)
//      Neither type is ever a typed nil: both are constructors/registrars.
// `this.orderbooks[symbol]` reads (`ccxt.GetValue(this.Orderbooks, symbol)` /
// `this.SafeValue(this.Orderbooks, symbol)`) are deliberately absent: the map is a
// *sync.Map read through an `any`-returning helper, so naming a type would require a
// type assertion on a value that is nil for an absent key — a runtime panic and a
// behaviour line, not a declaration.
export const CCXT_GO_WS_HELPER_RETURN_TYPES = {
    'this.OrderBook': 'OrderBookInterface',
    'this.IndexedOrderBook': 'OrderBookInterface',
    'this.CountedOrderBook': 'OrderBookInterface',
    'this.Client': 'ClientInterface',
};

// true when the transpiled source file is one of the pro-tree sources. The --ws run
// prints ts/src/pro/*.ts (build/goTranspiler.ts#transpileWS); the REST tree, the shared
// base-methods file (ts/src/base/Exchange.ts) and the prediction tree must keep these
// locals `any` — they are generated by the same transpiler instance without the ws
// regex passes, so a concrete interface type there would be an unrequested diff.
function goSourceIsWsTree (node) {
    try {
        let current = node;
        while (current !== undefined && current.parent !== undefined) {
            current = current.parent;
        }
        const fileName = (current !== undefined && current.fileName !== undefined) ? String (current.fileName) : '';
        // the main-thread transpile registers the file relative to the repo root
        // (ts/src/pro/<x>.ts) while the Piscina batch registers it absolute, so accept both
        return /(^|[\\/])ts[\\/]src[\\/]pro[\\/]/.test (fileName);
    } catch (e) {
        return false; // cannot prove the tree → stay `any`
    }
}

// Go type names that appear in the tables above but that the printer's own
// goTypeNameIsShadowed does not know about (it checks string/int/int64/float64/
// bool/any). A transpiled local or parameter literally named `byte` (or one of the
// ws interfaces) would turn `var x []byte = ...` into a reference to that value.
const EXTRA_GO_TYPE_NAMES = [ 'byte', 'ClientInterface', 'OrderBookInterface' ];

function typeNameIsUsable (goTranspiler, initializer, goType) {
    for (const typeName of EXTRA_GO_TYPE_NAMES) {
        if (goType.indexOf (typeName) >= 0) {
            const scope = (typeof goTranspiler.goEnclosingFunction === 'function') ? goTranspiler.goEnclosingFunction (initializer) : undefined;
            if (scopeMentionsIdentifier (scope, typeName)) {
                return false;
            }
        }
    }
    return true;
}

// ---- element access on a provably-string slice -----------------------------
//
// `keys[i]` prints `GetValue(keys, i)`. GetValue returns `any`, and for an
// out-of-range index it returns untyped nil — which a *typed* Go local cannot
// absorb: `var key string = nil` panics on the interface conversion, while the
// TS source read `undefined` and every consumer accepts it. The element local is
// therefore only named `string` when the read is provably in range:
//
//   - the receiver is a local whose EMITTED Go type is []string (Object.keys /
//     .split / this.stringToCharsArray / another []string local), so every
//     in-range element is the string GetValue's []string branch returns, and
//   - the index is the counter of an enclosing loop whose condition is exactly
//     `i < recv.length`, and
//   - neither the counter nor the receiver is written anywhere in that loop's
//     body: the condition is re-checked at the top of every iteration, but a
//     write to the counter inside the body would escape it, and a rebuild of the
//     receiver could shrink it below the bound. `for (let i = 0; i < keys.length;
//     i++)` keeps its increment in the for-clause, which runs after the body, so
//     the bound holds at every statement of the body (any nesting depth).
//   - a shadowing declaration of either name inside the body disqualifies the
//     site (name-based scan only stays sound while every mention is that binding).
//
// Everything else stays `any`: `keys[keys.length - 1]` and any other computed
// index (the slice may be empty), a map receiver (GetValue's map branch returns
// the boxed value — only the typed slice branches prove a string), a loop that
// does not bound the index, a counter written in the body, a nested function
// (the read may run after the loop), a receiver declared in another scope, and a
// local that the printer's own reject filters (`.push`, a later write of another
// type, `++`, spread, destructuring) demote back to `any`.

const FUNCTION_LIKE_KINDS = [
    ts.SyntaxKind.MethodDeclaration,
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.FunctionExpression,
    ts.SyntaxKind.ArrowFunction,
    ts.SyntaxKind.Constructor,
    ts.SyntaxKind.SourceFile,
];

// the loop statements enclosing this node, nearest first, stopping at the
// function boundary (a loop in another function bounds nothing here)
function enclosingLoops (node) {
    const loops = [];
    let current = node?.parent;
    while (current !== undefined) {
        if (FUNCTION_LIKE_KINDS.indexOf (current.kind) >= 0) {
            break;
        }
        if ((current.kind === ts.SyntaxKind.ForStatement) || (current.kind === ts.SyntaxKind.WhileStatement)) {
            loops.push (current);
        }
        current = current.parent;
    }
    return loops;
}

function isIdentifierNamed (node, name) {
    return (node?.kind === ts.SyntaxKind.Identifier) && (node.escapedText === name);
}

// `recv.length`
function isLengthOf (node, name) {
    return (node?.kind === ts.SyntaxKind.PropertyAccessExpression)
        && (node.name?.escapedText === 'length')
        && isIdentifierNamed (node.expression, name);
}

// `index < recv.length` / `recv.length > index`
function loopBoundsIndex (loop, indexName, receiverName) {
    const condition = loop?.condition;
    if (condition?.kind !== ts.SyntaxKind.BinaryExpression) {
        return false;
    }
    const op = condition.operatorToken?.kind;
    if (op === ts.SyntaxKind.LessThanToken) {
        return isIdentifierNamed (condition.left, indexName) && isLengthOf (condition.right, receiverName);
    }
    if (op === ts.SyntaxKind.GreaterThanToken) {
        return isLengthOf (condition.left, receiverName) && isIdentifierNamed (condition.right, indexName);
    }
    return false;
}

function isAssignmentOperator (kind) {
    return (kind >= ts.SyntaxKind.FirstAssignment) && (kind <= ts.SyntaxKind.LastAssignment);
}

// does this subtree write to `name`, or bind it again (shadow it)? Either one
// invalidates the loop-bounds proof for a read inside the subtree.
function writesOrShadowsName (node, name) {
    let found = false;
    const visit = (n) => {
        if (found) {
            return;
        }
        if (isIdentifierNamed (n, name)) {
            const parent = n.parent;
            if (parent !== undefined) {
                if ((parent.kind === ts.SyntaxKind.BinaryExpression) && (parent.left === n) && isAssignmentOperator (parent.operatorToken?.kind)) {
                    found = true;
                    return;
                }
                if (((parent.kind === ts.SyntaxKind.PrefixUnaryExpression) || (parent.kind === ts.SyntaxKind.PostfixUnaryExpression))
                    && (parent.operand === n)
                    && ((parent.operator === ts.SyntaxKind.PlusPlusToken) || (parent.operator === ts.SyntaxKind.MinusMinusToken))) {
                    found = true;
                    return;
                }
                if (((parent.kind === ts.SyntaxKind.ForInStatement) || (parent.kind === ts.SyntaxKind.ForOfStatement)) && (parent.initializer === n)) {
                    found = true;
                    return;
                }
                if (((parent.kind === ts.SyntaxKind.VariableDeclaration) || (parent.kind === ts.SyntaxKind.Parameter)
                        || (parent.kind === ts.SyntaxKind.BindingElement))
                    && (parent.name === n)) {
                    found = true; // a second binding of the name: the scan can no longer tell them apart
                    return;
                }
                if (parent.kind === ts.SyntaxKind.DeleteExpression) {
                    found = true;
                    return;
                }
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (node, visit);
    return found;
}

// the Go type of `recv[key]` when that element is provably a string, else undefined
export function ccxtGoElementAccessType (goTranspiler, initializer, printedValue) {
    if (initializer?.kind !== ts.SyntaxKind.ElementAccessExpression) {
        return undefined;
    }
    const receiver = initializer.expression;
    const index = initializer.argumentExpression;
    if ((receiver?.kind !== ts.SyntaxKind.Identifier) || (index?.kind !== ts.SyntaxKind.Identifier)) {
        return undefined; // a computed index (`keys[keys.length - 1]`) is not bounded by any loop condition
    }
    if (typeof goTranspiler.goDeclaredTypeOfIdentifier !== 'function') {
        return undefined; // printer without the declared-type lookup: nothing to prove with
    }
    if (goTranspiler.goDeclaredTypeOfIdentifier (receiver) !== '[]string') {
        return undefined; // `any` box (map/[]any receiver, or a local the printer rejected): element type unknown
    }
    // the read has to be the plain GetValue(<recv>, <index>) the printer emits for it
    const receiverText = goTranspiler.printNode (receiver, 0);
    const indexText = goTranspiler.printNode (index, 0);
    if ((printedValue ?? '').trim () !== `GetValue(${receiverText}, ${indexText})`) {
        return undefined;
    }
    const receiverName = receiver.escapedText;
    const indexName = index.escapedText;
    if (receiverName === indexName) {
        return undefined;
    }
    // the receiver has to be a local of THIS function (a module-level/foreign
    // declaration is printed on another code path)
    if (typeof goTranspiler.goEnclosingFunction === 'function') {
        const symbol = goTranspiler.getChecker ().getSymbolAtLocation (receiver);
        const declaration = symbol?.valueDeclaration;
        if (declaration === undefined || (goTranspiler.goEnclosingFunction (declaration) !== goTranspiler.goEnclosingFunction (initializer))) {
            return undefined;
        }
    }
    for (const loop of enclosingLoops (initializer)) {
        if (!loopBoundsIndex (loop, indexName, receiverName)) {
            continue;
        }
        if (writesOrShadowsName (loop.statement, indexName) || writesOrShadowsName (loop.statement, receiverName)) {
            continue;
        }
        return 'string';
    }
    return undefined;
}

// the generated mapper helpers: an exchange class method whose name matches this
// pattern is a candidate for the `*string` signature coercion below
const CCXT_GO_FAMILY_METHOD = /^parse[A-Za-z0-9]*(Status|Type|TimeInForce|Side|Action)$/;
// the hand-written accessors that print as `*string` (go/v4/exchange_safe.go)
const CCXT_GO_SAFE_STRING_METHOD = /^safeString(2|N|Lower|Lower2|LowerN|Upper|Upper2|UpperN)?$/;
// the Go type every return path of an accepted family method produces. `*string`
// keeps the TS `undefined` path distinguishable (the printer's own Safe* pointer
// layer); a method that only ever returns a string literal is a plain `string`.
export const CCXT_GO_FAMILY_RETURN_TYPE = '*string';
export const CCXT_GO_FAMILY_LITERAL_RETURN_TYPE = 'string';

// ---------------------------------------------------------------------------
// Ternary(cond, a, b) with both branches of one provable Go type
//
// The printer prints `cond ? a : b` as the helper call `Ternary(cond, a, b)`. Its
// hand-written Go body (go/v4/exchange_helpers.go) forwards the selected branch
// through `derefScalar`, and a non-pointer value passes through `derefScalar`
// unchanged. So when BOTH branches are already printed as Go literals of one and
// the same type, every path through the helper yields that concrete type — never a
// typed nil, because a literal is not a pointer — and the declaration can name it.
//
// The branch type is read off the *printed* text, never off the TypeScript type: a
// `string`-typed branch is frequently a `*string` (or an `any`) inside the box, and
// the helper would deref a nil pointer there to an untyped nil. Only a branch the
// printer has already written as a Go literal of that type qualifies — `"..."` /
// `...` for string, true/false for bool, and for numbers the literal's Go default
// type, which is exactly the type the helper's `any` parameter boxes it as: `int`
// for an integer literal, `float64` once it has a fraction or an exponent.
//
// Naming the type turns `var x any = Ternary(...)` into `var x string = Ternary(...)`,
// which does not compile by itself — an `any` is not assignable to `string`. The type
// assertion that carries the value out of the helper's `any` return is therefore
// emitted together with the type, and only at the declarations the classifier typed
// (installCcxtGoTernaryCast). On the proof above it cannot fail.
const TERNARY_HELPER_NAME = 'Ternary';

// the printed text of `inner` with every pair of wrapping parentheses removed
function ccxtStripPrintedParens (goTranspiler, text) {
    let value = (text ?? '').trim ();
    while (value.startsWith ('(') && goTranspiler.isWholePrintedCall (value, 0)) {
        value = value.substring (1, value.length - 1).trim ();
    }
    return value;
}

// split a printed argument list on its top-level commas (nested (), [] and {} and
// string literals stay together)
function ccxtSplitPrintedArguments (inner) {
    const args = [];
    let depth = 0, current = '', inString = false, quote = '', escaped = false;
    for (let i = 0; i < inner.length; i++) {
        const c = inner[i];
        if (inString) {
            current += c;
            if (escaped) { escaped = false; }
            else if (c === '\\') { escaped = true; }
            else if (c === quote) { inString = false; }
            continue;
        }
        if ((c === '"') || (c === '`')) { inString = true; quote = c; current += c; continue; }
        if ((c === '(') || (c === '[') || (c === '{')) { depth += 1; current += c; continue; }
        if ((c === ')') || (c === ']') || (c === '}')) { depth -= 1; current += c; continue; }
        if ((c === ',') && (depth === 0)) { args.push (current.trim ()); current = ''; continue; }
        current += c;
    }
    if (current.trim ().length > 0) {
        args.push (current.trim ());
    }
    return args;
}

// the concrete Go type one printed Ternary branch already is, or undefined
function ccxtGoTernaryBranchType (goTranspiler, branchText) {
    const text = ccxtStripPrintedParens (goTranspiler, branchText);
    if (/^"(?:[^"\\]|\\.)*"$/.test (text) || /^`[^`]*`$/.test (text)) {
        return 'string';
    }
    if ((text === 'true') || (text === 'false')) {
        return 'bool';
    }
    if (/^[0-9]+$/.test (text)) {
        return 'int';
    }
    if (/^[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?$/.test (text) || /^[0-9]+[eE][+-]?[0-9]+$/.test (text)) {
        return 'float64';
    }
    return undefined;
}

// the Go type a whole printed `Ternary(cond, a, b)` call yields, or undefined when it
// is not such a call or the two branches are not both literals of one type
export function ccxtGoTernaryType (goTranspiler, printedValue) {
    const value = ccxtStripPrintedParens (goTranspiler, printedValue);
    const open = value.indexOf ('(');
    if (open <= 0 || !goTranspiler.isWholePrintedCall (value, open)) {
        return undefined;
    }
    if (value.substring (0, open) !== TERNARY_HELPER_NAME) {
        return undefined;
    }
    const branches = ccxtSplitPrintedArguments (value.substring (open + 1, value.length - 1));
    if (branches.length !== 3) {
        return undefined;
    }
    const whenTrue = ccxtGoTernaryBranchType (goTranspiler, branches[1]);
    if (whenTrue === undefined) {
        return undefined;
    }
    return (ccxtGoTernaryBranchType (goTranspiler, branches[2]) === whenTrue) ? whenTrue : undefined;
}

// the declaration a node initialises, or undefined. Only a declaration may be given
// the concrete type: that is the statement the printer prints as `var x <T> = <value>`.
// A reassignment keeps printing `x = <value>`, and a local typed above by an earlier
// `<T>` declaration would then take an `any` — so reassignments must never report the
// type. (goLocalIsSafeToType re-states that same rule when it checks a later write.)
export function ccxtGoTernaryDeclaration (node) {
    const declaration = node?.parent;
    if (declaration === undefined || declaration.initializer !== node) {
        return undefined;
    }
    if (declaration.name === undefined || !Array.isArray (declaration.parent?.declarations)) {
        return undefined;
    }
    return declaration;
}

// ---------------------------------------------------------------------------
// U09 — arithmetic locals: Multiply / Subtract / Divide / Mod
//
// `a * b`, `a - b`, `a / b` and `a % b` print as `Multiply(a, b)`,
// `Subtract(a, b)`, `Divide(a, b)`, `Mod(a, b)`. The four Go helpers return `any`
// because the box type follows the RUNTIME operand kinds and values: nil (an
// absent operand / a zero divisor), int64, uint64 (the unsigned multiply/divide
// path) or float64 (a non-integral result). Declaring the local `int64` is only
// honest when every return path of the helper yields an int64 box, which holds for
// one operand shape only: both operands of Go int KIND — an integer literal (an
// untyped constant boxed as `int`) or a value that provably has Go type `int` /
// `int64` and can never be a nil pointer:
//
//   Multiply(int|int64, int|int64)
//       reflect bVal.Kind() is Int/Int64 -> `aValConverted.Int() * bVal.Int()` -> int64
//   Subtract(int|int64, int|int64)
//       the float path, but the difference of two integral finite float64s is
//       integral -> IsInteger -> ParseInt(res) -> int64 (no nil path: ToFloat64 of
//       an int-kind value is always a number)
//   Divide(int|int64, NONZERO INTEGER LITERAL)
//       bVal is `int`, `bVal.Int() == 0` is decidable on the literal, so the int
//       path runs: `aValConverted.Int() / bVal.Int()` -> int64
//   Mod(int|int64, NONZERO INTEGER LITERAL)
//       math.Mod of two integral finite float64s is integral -> IsInteger ->
//       ParseInt(res) -> int64 (a zero divisor would give NaN, a float64 box)
//
// Everything else stays `any`: a float64/uint/string operand, a `*int64` (nil
// derefs to nil -> the helper returns nil), a call whose Go signature is `any`
// (`this.ParseTimeframe`, `this.ParseToInt`, `this.Sum`, `GetValue`, `MathFloor`,
// ...), or an arithmetic call this rule does not itself prove int64.
//
// The value inside the box is never re-computed: the emitted declaration calls the
// very same helper and only adds the unbox the new declared type forces, e.g.
//   var duration any = Multiply(this.Milliseconds(), 1000)
//   var duration int64 = Multiply(this.Milliseconds(), 1000).(int64)
// so overflow/rounding semantics are the helper's, unchanged by construction.
const CCXT_GO_ARITHMETIC_CALLEES = [ 'Multiply', 'Subtract', 'Divide', 'Mod' ];
const CCXT_GO_ARITHMETIC_LOCAL_TYPE = 'int64';

// Go helpers usable as an arithmetic operand: their Go signature returns a
// concrete, never-nil, non-pointer `int` or `int64`. Verified against the base:
//   func GetLength(v any) int                       go/v4/exchange_helpers.go:1713
//   func GetArrayLength(value any) int              go/v4/exchange_helpers.go:468
//   func GetIndexOf(str any, target any) int        go/v4/exchange_helpers.go:1167
//   func ParseInt(number any) int64                 go/v4/exchange_helpers.go:2008
//   func (this *BaseExchange) Milliseconds() int64  go/v4/exchange_time.go:11
//   func (this *BaseExchange) Seconds() int64       go/v4/exchange_time.go:15
//   func (this *BaseExchange) Microseconds() int64  go/v4/exchange_time.go:42
//   func (this *BaseExchange) Crc32(str any, ...) int64   go/v4/exchange.go:2240
//   func (this *BaseExchange) RandNumber(size any) int64  go/v4/exchange.go:1538
//   func (this *BaseExchange) PrecisionFromString(str2 any) int  go/v4/exchange_number.go:251
//   func (this *BaseExchange) BinaryLength(binary any) int       go/v4/exchange.go:1116
// `this.ParseTimeframe` (any, and nil for a malformed timeframe), `this.ParseToInt`
// (any), `this.Sum` (any) and every `*int64` accessor are deliberately absent.
const CCXT_GO_INT_OPERAND_CALLEES = {
    'GetLength': 'int',
    'GetArrayLength': 'int',
    'GetIndexOf': 'int',
    'ParseInt': 'int64',
    'this.Milliseconds': 'int64',
    'this.Seconds': 'int64',
    'this.Microseconds': 'int64',
    'this.Crc32': 'int64',
    'this.RandNumber': 'int64',
    'this.PrecisionFromString': 'int',
    'this.BinaryLength': 'int',
};

// `ccxt.Multiply(...)`: the pro / prediction packages print the package-level
// helpers with the ccxt qualifier
function ccxtGoUnqualifiedCallee (callee) {
    return callee.startsWith ('ccxt.') ? callee.substring ('ccxt.'.length) : callee;
}

// true when the AST node is the binary expression that prints as `callee(...)`.
// The printed text alone would already be evidence enough (the wrapper table maps
// `*`->Multiply, `-`->Subtract, `/`->Divide, `%`->Mod and always prints both
// operands in source order), but checking the node keeps the two in lockstep.
function ccxtGoArithmeticNodeMatches (node, callee) {
    node = ccxtGoUnwrapPrintedParens (node);
    // only a BinaryExpression carries operatorToken together with left and right
    if ((node?.operatorToken === undefined) || (node.left === undefined) || (node.right === undefined)) {
        return false;
    }
    const op = ccxtGoNodeText (node.operatorToken);
    return ((callee === 'Multiply') && (op === '*'))
        || ((callee === 'Subtract') && (op === '-'))
        || ((callee === 'Divide') && (op === '/'))
        || ((callee === 'Mod') && (op === '%'));
}

// the source text of a node, or undefined when the node cannot provide one
function ccxtGoNodeText (node) {
    if (typeof node?.getText !== 'function') {
        return undefined;
    }
    try {
        return node.getText ().trim ();
    } catch (e) {
        return undefined;
    }
}

// strip the source parentheses of a `(a * b)` operand. The printer prints the
// operand's own parens, so a parenthesised operand arrives as a wrapper node. Only
// unwrap nodes that carry nothing but an inner expression: every other kind that
// exposes `expression` (call, property/element access, unary, await, tagged
// template, ...) has a second child field and is left to the kind check downstream
// (`goDeclaredTypeOfIdentifier` only answers for real identifiers).
function ccxtGoUnwrapPrintedParens (node) {
    for (let i = 0; (i < 8) && (node?.expression !== undefined); i++) {
        if ((node.operatorToken !== undefined) || (node.left !== undefined) || (node.right !== undefined)
            || (node.arguments !== undefined) || (node.name !== undefined) || (node.argumentExpression !== undefined)
            || (node.operand !== undefined) || (node.condition !== undefined) || (node.type !== undefined)
            || (node.tag !== undefined) || (node.template !== undefined) || (node.operands !== undefined)) {
            return node;
        }
        if ((ccxtGoNodeText (node) ?? '').startsWith ('(') === false) {
            return node;
        }
        node = node.expression;
    }
    return node;
}

// `Callee(args)` split into `{ callee, argsText }` when the printed value is one
// whole call, otherwise undefined
function ccxtGoPrintedCallParts (goTranspiler, printedValue) {
    let value = (printedValue ?? '').trim ();
    while (value.startsWith ('(') && goTranspiler.isWholePrintedCall (value, 0)) {
        value = value.substring (1, value.length - 1).trim ();
    }
    const open = value.indexOf ('(');
    if (open <= 0 || !goTranspiler.isWholePrintedCall (value, open)) {
        return undefined;
    }
    const callee = value.substring (0, open);
    if (!/^[A-Za-z_][\w.]*$/.test (callee)) {
        return undefined;
    }
    return { callee: callee, argsText: value.substring (open + 1, value.length - 1) };
}

// the top-level arguments of a printed argument list, respecting nested parens,
// brackets and string literals
function ccxtGoSplitPrintedArgs (argsText) {
    const text = (argsText ?? '').trim ();
    if (text === '') {
        return [];
    }
    const args = [];
    let depth = 0;
    let stringDelimiter = undefined;
    let escaped = false;
    let start = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (stringDelimiter !== undefined) {
            if ((stringDelimiter === '"') && escaped) {
                escaped = false;
            } else if ((stringDelimiter === '"') && (c === '\\')) {
                escaped = true;
            } else if (c === stringDelimiter) {
                stringDelimiter = undefined;
            }
            continue;
        }
        if ((c === '"') || (c === '`')) {
            stringDelimiter = c;
            continue;
        }
        if ((c === '(') || (c === '[') || (c === '{')) {
            depth++;
            continue;
        }
        if ((c === ')') || (c === ']') || (c === '}')) {
            depth--;
            continue;
        }
        if ((c === ',') && (depth === 0)) {
            args.push (text.substring (start, i).trim ());
            start = i + 1;
        }
    }
    args.push (text.substring (start).trim ());
    return args;
}

// 'intlit' when the printed operand is a decimal integer literal (an untyped Go
// constant, boxed as `int` inside the helper's `any` parameter), 'int' when it is
// provably a Go `int`/`int64` value, undefined otherwise
function ccxtGoIntOperandKind (goTranspiler, node, printedValue, depth) {
    const value = (printedValue ?? '').trim ();
    if (value === '') {
        return undefined;
    }
    if (/^\d+$/.test (value)) {
        return 'intlit';
    }
    const parts = ccxtGoPrintedCallParts (goTranspiler, value);
    if (parts !== undefined) {
        const callee = ccxtGoUnqualifiedCallee (parts.callee);
        const operandType = CCXT_GO_INT_OPERAND_CALLEES[parts.callee] ?? CCXT_GO_INT_OPERAND_CALLEES[callee];
        if ((operandType === 'int') || (operandType === 'int64')) {
            // a concrete int/int64 return: always an int-kind box, never nil
            return 'int';
        }
        if ((depth < 12) && ccxtGoArithmeticCallIsInt64 (goTranspiler, node, parts.callee, parts.argsText, depth + 1)) {
            return 'int';
        }
        return undefined;
    }
    if (!/^[A-Za-z_]\w*$/.test (value)) {
        return undefined;
    }
    // an identifier: the printer's own identifier typing (checker-resolved
    // declaration, memoized, cycle-safe; `any` answers, parameters, pointer kinds
    // and declarations the reject filters demoted all come back as something else)
    // is only trusted when the declaration is printed with that explicit type — a
    // `for (const i = ...)` loop counter is emitted `i := ...` and carries the
    // initializer's Go type instead of the classifier's answer.
    const declared = (typeof goTranspiler.goDeclaredTypeOfIdentifier === 'function')
        ? goTranspiler.goDeclaredTypeOfIdentifier (node)
        : undefined;
    if ((declared !== 'int') && (declared !== 'int64')) {
        return undefined;
    }
    if (!ccxtGoDeclarationIsTypedPrint (goTranspiler, node)) {
        return undefined;
    }
    return 'int';
}

// mirrors the guard of printVariableDeclarationList: a declaration is printed
// `var x <T> = ...` when its list is the declarationList of a statement (the
// printer's FirstStatement kind *is* VariableStatement, whatever block the
// statement sits in), and `x := ...` when it is a `for` initializer — where the
// local's Go type is the initializer's own type instead of the classifier's answer.
// Module-level declarations never reach the generated Go (the printer drops them),
// so a statement-level list is the only shape that can carry the named type.
function ccxtGoDeclarationIsTypedPrint (goTranspiler, node) {
    if (typeof goTranspiler.getChecker !== 'function') {
        return false;
    }
    let list;
    try {
        list = goTranspiler.getChecker ().getSymbolAtLocation (node)?.valueDeclaration?.parent;
    } catch (e) {
        return false;
    }
    const statement = list?.parent;
    return (statement !== undefined) && (statement.declarationList === list);
}

// true when the whole printed call `Callee(argsText)` provably boxes an int64
function ccxtGoArithmeticCallIsInt64 (goTranspiler, node, callee, argsText, depth) {
    const name = ccxtGoUnqualifiedCallee (callee);
    if (CCXT_GO_ARITHMETIC_CALLEES.indexOf (name) < 0) {
        return false;
    }
    if (!ccxtGoArithmeticNodeMatches (node, name)) {
        return false;
    }
    const args = ccxtGoSplitPrintedArgs (argsText);
    if (args.length !== 2) {
        return false;
    }
    const leftKind = ccxtGoIntOperandKind (goTranspiler, node.left, args[0], depth);
    const rightKind = ccxtGoIntOperandKind (goTranspiler, node.right, args[1], depth);
    if ((leftKind === undefined) || (rightKind === undefined)) {
        return false;
    }
    if ((name === 'Divide') || (name === 'Mod')) {
        // a zero divisor is the only nil (Divide) / NaN-float64 (Mod) path, and a
        // literal divisor is the one divisor whose zero-ness is decidable here
        if ((rightKind !== 'intlit') || /^0+$/.test (args[1])) {
            return false;
        }
    }
    return true;
}

// the Go type of a local initialised by an arithmetic helper call, or undefined
export function ccxtGoTypeOfArithmeticInitializer (goTranspiler, initializer, printedValue) {
    const parts = ccxtGoPrintedCallParts (goTranspiler, printedValue);
    if (parts === undefined) {
        return undefined;
    }
    const name = ccxtGoUnqualifiedCallee (parts.callee);
    if (CCXT_GO_ARITHMETIC_CALLEES.indexOf (name) < 0) {
        return undefined;
    }
    if (!ccxtGoArithmeticCallIsInt64 (goTranspiler, initializer, parts.callee, parts.argsText, 0)) {
        return undefined;
    }
    return CCXT_GO_ARITHMETIC_LOCAL_TYPE;
}

// The declared type alone cannot be passed to a Go `any`-returning call: the
// printer would emit `var x int64 = Multiply(a, b)` and the compiler would reject
// it. Add the unbox the type forces — the same helper call, so the value (and with
// it every overflow/rounding decision) is the helper's. A `var x int64 = `
// declaration over one of these four calls can only come from the rule above: the
// printer's own table has no entry for them and no other rule names a concrete
// type for an arithmetic initializer, so this pass cannot fire on anything the
// proof did not cover.
export function ccxtGoUnboxArithmeticDeclaration (goTranspiler, printed) {
    if (typeof printed !== 'string') {
        return printed;
    }
    const match = /^([\s\S]*?\bvar [A-Za-z0-9_]+ int64 = )((?:ccxt\.)?(?:Multiply|Subtract|Divide|Mod)\([^\n]*)$/.exec (printed);
    if (match === null) {
        return printed;
    }
    const tail = match[2];
    const open = tail.indexOf ('(');
    const close = ccxtGoPrintedCallEnd (tail, open);
    if (close < 0) {
        return printed;
    }
    const rest = tail.substring (close);
    if (!/^\s*(;?\s*(\/\/[^\n]*)?)$/.test (rest)) {
        return printed;
    }
    return match[1] + tail.substring (0, close) + '.(' + CCXT_GO_ARITHMETIC_LOCAL_TYPE + ')' + rest;
}

// the index just past the closing paren of the call opening at `open`, or -1.
// String literals are skipped like isWholePrintedCall does; unlike it the call may
// be followed by a `//` comment (which can contain parens of its own).
function ccxtGoPrintedCallEnd (value, open) {
    let depth = 0;
    let stringDelimiter = undefined;
    let escaped = false;
    for (let i = open; i < value.length; i++) {
        const c = value[i];
        if (stringDelimiter !== undefined) {
            if ((stringDelimiter === '"') && escaped) {
                escaped = false;
            } else if ((stringDelimiter === '"') && (c === '\\')) {
                escaped = true;
            } else if (c === stringDelimiter) {
                stringDelimiter = undefined;
            }
            continue;
        }
        if ((c === '"') || (c === '`')) {
            stringDelimiter = c;
            continue;
        }
        if (c === '(') {
            depth++;
            continue;
        }
        if (c === ')') {
            depth--;
            if (depth === 0) {
                return i + 1;
            }
            if (depth < 0) {
                return -1;
            }
        }
    }
    return -1;
}

function installCcxtGoArithmeticUnbox (goTranspiler) {
    if (typeof goTranspiler.printVariableDeclarationList !== 'function' || goTranspiler.__ccxtGoArithmeticUnboxInstalled) {
        return;
    }
    const upstream = goTranspiler.printVariableDeclarationList;
    goTranspiler.printVariableDeclarationList = function (node, identation) {
        const printed = upstream.call (this, node, identation);
        return ccxtGoUnboxArithmeticDeclaration (this, printed);
    };
    goTranspiler.__ccxtGoArithmeticUnboxInstalled = true;
}


function scopeMentionsIdentifier (scope, name) {
    if (scope === undefined || typeof scope.forEachChild !== 'function') {
        return true; // cannot prove it is safe → treat as shadowed
    }
    let found = false;
    const visit = (n) => {
        if (found) {
            return;
        }
        if (n.escapedText === name) {
            found = true;
            return;
        }
        n.forEachChild (visit);
    };
    scope.forEachChild (visit);
    return found;
}

// The generated TEST tree (go/tests/base/*.go, printed from ts/src/test/** and
// ts/src/pro/test/**) never prints a `this.` receiver: the exchange lives in a
// local called `exchange` (`exchange := ccxt.NewExchange().(*ccxt.Exchange)`), so
// every entry keyed on `this.<Method>` — here and in the printer's own
// GO_HELPER_RETURN_TYPES — never matches there and the helper result keeps its
// `any` declaration. The receiver is the only difference: `exchange.<Method>` is
// the same Go method on the same exchange type, so it carries the same Go type.
// The alias stays off pointer-returning helpers (`this.SafeString*` → *string):
// the `DerefScalar(` unwrap that makes a pointer local safe at its consumer sites
// is a pass over the EXCHANGE files only (goTranspiler.ts), so a `*T` local in a
// test file would reach its uses un-unwrapped.
const EXCHANGE_RECEIVER = 'exchange';

// The methods the alias may resolve. Every entry is a `this.`-keyed table entry
// (printer or CCXT) whose Go signature is hand-written with a concrete,
// never-pointer return type, AND that the generated test tree actually calls as
// `exchange.<Method>(...)`. Everything else stays `any` there: a bigger alias list
// would only reprint `EvalTruthy(exchange.InArray(...))` as a bare call without
// typing a single declaration (InArray/ValueIsDefined never initialise a local in
// the test tree), and pointer-returning helpers must keep their `any` box because
// the DerefScalar unwrap does not run on test files.
const EXCHANGE_RECEIVER_ALIASES = [
    // printer's GO_HELPER_RETURN_TYPES (`this.` keys)
    'Extend', 'DeepExtend', 'Keysort', 'IndexBy', 'GroupBy',
    'Milliseconds', 'Seconds', 'Microseconds',
    'Uuid', 'Ymdhms', 'Yyyymmdd', 'Ymd',
    // CCXT_GO_HELPER_RETURN_TYPES above
    'ToArray', 'SortBy', 'SortBy2', 'FilterBy', 'ExtractParams',
    'Capitalize', 'Uuid16', 'Uuid22', 'Yymmdd', 'PrecisionFromString',
    'Urlencode', 'Rawencode', 'Encode', 'Decode',
    'Base16ToBinary', 'BinaryConcat', 'EthGetAddressFromPrivateKey',
];

function aliasExchangeReceiver (goTranspiler, printedValue) {
    let value = (printedValue ?? '').trim ();
    while (value.startsWith ('(') && goTranspiler.isWholePrintedCall (value, 0)) {
        value = value.substring (1, value.length - 1).trim ();
    }
    const open = value.indexOf ('(');
    if (open <= 0 || !goTranspiler.isWholePrintedCall (value, open)) {
        return undefined;
    }
    const callee = value.substring (0, open);
    const match = /^([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)$/.exec (callee);
    if (!match || match[1] !== EXCHANGE_RECEIVER || EXCHANGE_RECEIVER_ALIASES.indexOf (match[2]) < 0) {
        return undefined;
    }
    // `this.` is how the same method prints inside the exchange files
    return 'this.' + match[2] + value.substring (open);
}

// ---------------------------------------------------------------------------------------------
// `a + b` with a provably-string LEFT operand -> `string`
//
// TypeScript `a + b` prints `Add(<a>, <b>)` and the hand-written Go runtime helper
// (go/v4/exchange_helpers.go) is
//
//     func Add (a any, b any) any {
//         a = derefScalar (a); b = derefScalar (b)
//         if a == nil || b == nil { return nil }
//         switch aType := a.(type) {
//         case int / int64 / float64: ...      // numeric
//         case string: if bType, ok := b.(string); ok { return aType + bType }
//         }
//         return nil
//     }
//
// so the box holds a non-nil string only when BOTH operands are strings at runtime.
// C#'s add-left rule can name the local `string` from a string LEFT operand alone
// because the C# compiler then binds add(string, object) / add(string, string) —
// Go has no overloads, so a local can only be declared
//
//     var x string = <value>
//
// when the value is provably a Go string, which for `Add` means: both operands are
// provably non-nil Go strings. In that exact case `Add(a, b)` and Go's own `a + b`
// are the same value on every input (derefScalar is the identity on a string, the
// nil check is vacuous and only the string arm can match), so the declaration is
// emitted as the concatenation itself — the typed-emit path this family needs,
// because the `Add` call can never resolve to a `string` return in Go:
//
//     var x any = Add("?", this.Urlencode(query))     ->  var x string = "?" + this.Urlencode(query)
//
// Nothing else moves. A `+` in any other position (argument, condition, later
// assignment) keeps printing `Add(...)`, whose Go type stays `any` and whose
// consumers are untyped; and the printer's own scan (getGoLocalType ->
// goLocalIsSafeToType) still decides: the type hook below answers `string` only
// while the declaration that owns the node is being printed, so a later
// `x = <a + b>` write is not accepted as a same-type reassignment.
//
// Rejected on doubt (the local stays `any`):
//   * numeric operands (`Add(x, 5)`) — the string arm cannot match;
//   * a `*string` / `any` operand (GetValue, ImplodeParams, SafeString, another
//     `Add(...)` chain element, a parameter): the value could be nil or non-string
//     and `Add` would then return nil, which a Go `string` cannot hold;
//   * a parenthesised / otherwise re-printed initializer: the rewrite below only
//     fires when the printer prints exactly `Add(<left>, <right>)`.
const GO_STRING_EXCHANGE_FIELDS = [ 'this.Id', 'this.Version', 'this.Name', 'this.Url', 'this.Hostname', 'this.UserAgent' ];

// the `+` nodes whose declaration print is in flight. The hook answers `string`
// only for one of these, so the same expression shape in any other position
// (a later write, an argument) is still classified `any`.
const TYPED_CONCAT_IN_FLIGHT = new WeakSet ();

// census hook for this family: `CCXT_GO_TYPED_CONCAT_DEBUG=1` logs every candidate
// declaration (typed / rejected, with the printed operands) to stderr, from both the
// main-thread and the Piscina worker path. Never fires in a normal transpile.
function concatDebugLog (status, node, nameText, leftText, rightText) {
    if (!process.env.CCXT_GO_TYPED_CONCAT_DEBUG) {
        return;
    }
    try {
        process.stderr.write ('[typed-concat] ' + [ status, nameText, leftText, rightText ].join (' | ') + '\n');
    } catch (e) {
        // never let the census hook break a transpile
    }
}

// true when this operand is provably a non-nil Go string in the emitted code
function goStringOperand (goTranspiler, node) {
    switch (node?.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        return true;
    case ts.SyntaxKind.ParenthesizedExpression:
        return goStringOperand (goTranspiler, node.expression);
    case ts.SyntaxKind.PropertyAccessExpression: {
        // `this.id` / `this.version` / ... print as `this.Id` / `this.Version`: the
        // BaseExchange fields declared `string` in go/v4/exchange.go. Every other
        // config field (ApiKey, Secret, Uid, Password, ...) is `interface{}`.
        const printed = goTranspiler.printNode (node, 0);
        return GO_STRING_EXCHANGE_FIELDS.indexOf (printed) >= 0;
    }
    case ts.SyntaxKind.Identifier:
        // a local the printer itself declares `string` (a string literal initializer,
        // a string-returning helper, ...). Parameters are `any` in Go and locals the
        // printer left `any` answer `undefined` here.
        return (typeof goTranspiler.goDeclaredTypeOfIdentifier === 'function')
            && (goTranspiler.goDeclaredTypeOfIdentifier (node) === 'string');
    case ts.SyntaxKind.CallExpression:
        // a call whose Go signature returns a plain string: exactly the callees the
        // printer's own tables (GO_HELPER_RETURN_TYPES + CCXT_GO_HELPER_RETURN_TYPES)
        // already name as `string` — ToLower/ToUpper/ToString, this.Urlencode,
        // this.Capitalize, this.Uuid16, ... Anything else (GetValue, Ternary, this.Json,
        // this.ImplodeParams, this.SafeString, this.Hash) is `any` / `*string` -> reject.
        return goTranspiler.goTypeOfInitializer (node, goTranspiler.printNode (node, 0)) === 'string';
    }
    return false;
}

// the `a + b` initializer this family types, or undefined
function goTypedConcatInitializer (goTranspiler, node, declaration) {
    const initializer = declaration?.initializer;
    if (initializer?.kind !== ts.SyntaxKind.BinaryExpression
        || initializer.operatorToken?.kind !== ts.SyntaxKind.PlusToken) {
        return undefined;
    }
    if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    // a `for (const x = a + b; ...)` list is printed as `x := ...`, there is nothing
    // to declare — FirstStatement is VariableStatement's own kind, so this rejects
    // the for-initializer call site
    if (node?.parent?.kind !== ts.SyntaxKind.FirstStatement) {
        return undefined;
    }
    if (!goStringOperand (goTranspiler, initializer.left) || !goStringOperand (goTranspiler, initializer.right)) {
        concatDebugLog ('reject', node, goTranspiler.printNode (declaration.name, 0),
            ts.SyntaxKind[initializer.left?.kind] ?? '?', ts.SyntaxKind[initializer.right?.kind] ?? '?');
        return undefined;
    }
    return initializer;
}

// wrap printVariableDeclarationList: the declaration whose initializer is a typed
// concatenation is emitted as `var x string = <left> + <right>`. Idempotent.
function installCcxtGoTypedConcat (goTranspiler) {
    if (goTranspiler.__ccxtGoTypedConcatInstalled || (typeof goTranspiler.printVariableDeclarationList !== 'function')) {
        return;
    }
    const upstream = goTranspiler.printVariableDeclarationList.bind (goTranspiler);
    goTranspiler.printVariableDeclarationList = (node, identation) => {
        const declaration = (node?.declarations?.length === 1) ? node.declarations[0] : undefined;
        const concatenation = goTypedConcatInitializer (goTranspiler, node, declaration);
        if (concatenation === undefined) {
            return upstream (node, identation);
        }
        const leftText = goTranspiler.printNode (concatenation.left, 0);
        const rightText = goTranspiler.printNode (concatenation.right, 0);
        const callText = 'Add(' + leftText + ', ' + rightText + ')';
        if (goTranspiler.printNode (declaration.initializer, identation) !== callText) {
            // printed in another shape (parenthesised, custom print) - leave it `any`
            concatDebugLog ('shape-reject', node, goTranspiler.printNode (declaration.name, 0), leftText, rightText);
            return upstream (node, identation);
        }
        const iden = goTranspiler.getIden (identation);
        const nameText = goTranspiler.printNode (declaration.name, 0);
        const typedPrefix = iden + 'var ' + nameText + ' string = ';
        TYPED_CONCAT_IN_FLIGHT.add (concatenation);
        let printed;
        try {
            printed = upstream (node, identation);
        } finally {
            TYPED_CONCAT_IN_FLIGHT.delete (concatenation);
        }
        if (printed === typedPrefix + callText) {
            concatDebugLog ('typed', node, nameText, leftText, rightText);
            return typedPrefix + leftText + ' + ' + rightText;
        }
        // the printer's own reject scan kept the declaration `any` (a later write of a
        // value it cannot prove `string`, a shadowed `string` name, ...), or it printed
        // an unexpected value: keep the `any` declaration, which always compiles
        concatDebugLog (printed.startsWith (typedPrefix) ? 'scan-reject-after-type' : 'scan-reject', node, nameText, leftText, rightText);
        if (printed.startsWith (typedPrefix)) {
            return iden + 'var ' + nameText + ' any = ' + callText;
        }
        return printed;
    };
    goTranspiler.__ccxtGoTypedConcatInstalled = true;
}

// the CCXT helper's Go return type when `printedValue` is one whole call
export function ccxtGoTypeOfPrintedCall (goTranspiler, printedValue, wsTree = false, initializer = undefined) {
    let value = (printedValue ?? '').trim ();
    while (value.startsWith ('(') && goTranspiler.isWholePrintedCall (value, 0)) {
        value = value.substring (1, value.length - 1).trim ();
    }
    // a numeric literal boxes into `any` with Go's default constant type: an
    // integer literal as `int`, anything with a fraction or exponent as `float64`.
    // Declaring that type explicitly holds the identical runtime value.
    if (/^\d+$/.test (value)) {
        return 'int';
    }
    if (/^\d+(\.\d+)?([eE][+-]?\d+)?$/.test (value)) {
        return 'float64';
    }
    const open = value.indexOf ('(');
    if (open <= 0 || !goTranspiler.isWholePrintedCall (value, open)) {
        return undefined;
    }
    const callee = value.substring (0, open);
    if (!/^[A-Za-z_][\w.]*$/.test (callee)) {
        return undefined;
    }
    const known = CCXT_GO_HELPER_RETURN_TYPES[callee];
    if (known !== undefined) {
        return known;
    }
    if (wsTree) {
        const wsType = CCXT_GO_WS_HELPER_RETURN_TYPES[callee];
        if (wsType !== undefined) {
            return wsType;
        }
    }
    return ccxtGoElementAccessType (goTranspiler, initializer, printedValue);
}

// `const y = x` where `x` is a local the printer already types: the copy holds
// exactly the same Go value as `x` (a *string copy is the same pointer, a string
// copy the same string), so naming that type at the copy changes nothing at run
// time. The type is read back from the printer's own goDeclaredTypeOfIdentifier,
// which resolves the identifier through the TYPE CHECKER — scope-aware by
// construction: a same-named local in another function, a parameter, a field or a
// destructuring target all answer `undefined` and stay `any`. It also answers
// `undefined` for anything the reject filters demoted back to `any`, so this rule
// can never assert a type the printer does not already assert about the source.
export function ccxtGoTypeOfCopiedLocal (goTranspiler, initializer, printedValue) {
    if (typeof goTranspiler.goDeclaredTypeOfIdentifier !== 'function') {
        return undefined; // older printer without the identifier oracle
    }
    const value = (printedValue ?? '').trim ();
    // the new declaration is `var y <T> = <value>`, so <value> must be the bare
    // identifier itself and nothing else
    if (!/^[A-Za-z_]\w*$/.test (value)) {
        return undefined;
    }
    const goType = goTranspiler.goDeclaredTypeOfIdentifier (initializer);
    if ((typeof goType !== 'string') || (goType.length === 0)) {
        return undefined;
    }
    return goType;
}

// ---------------------------------------------------------------------------------------------
// Array-binding (destructuring) holders
// ---------------------------------------------------------------------------------------------
//
// `const [ a, b ] = this.handleOptionAndParams (params, method, option)` and its assignment
// twin `[ a, b ] = this.handleOptionAndParams (...)` both print through the Go printer as a
// synthetic holder plus one `GetValue` read per element:
//
//     abVariable := this.HandleOptionAndParams (params, method, option)
//     a := GetValue (abVariable, 0)
//     b := GetValue (abVariable, 1)
//
// The holder carries the tuple the callee returned. The printer declares it `any` because the
// callee's own emitted signature is `any` (a TS tuple return has no Go spelling), so this
// module declares the holder `[]any` for the callees whose generated signature
// build/goTranspiler.ts coerces to `[]any` — the same `[ value, params ]` family, every return
// path of which already prints a Go `[]any{...}` literal. Only the holder's declaration form
// changes: every read stays `GetValue (holder, i)` (an `any`-typed helper), the element types
// stay `any`, and no value and no failure mode moves.
//
// This mirrors ccxt#30356's C# `retypeDestructuringTemp ()` — the same holder declared
// `IList<object>` for both the declaration and the assignment shape. Go needs no cast only
// because the callee signature itself is honest (see the coerce regex in transpileBaseMethods).
//
// Elements are deliberately NOT typed, the same conclusion #30356 reached for this family: the
// printer reads them through `GetValue` (which returns `any`), so a typed element would need a
// type assertion, i.e. a new runtime panic; and the values are genuinely mixed — element 0 of
// HandleParamString/2 and HandleMarketTypeAndParams is a nil-able `*string` boxed into `[]any`,
// element 0 of HandleOptionAndParams is the caller's own option/default value.
export const CCXT_GO_ARRAY_BINDING_HOLDERS = [
    'HandleOptionAndParams',
    'HandleOptionAndParams2',
    'HandleParamString',
    'HandleParamString2',
    'HandleMarketTypeAndParams',
];

// `<indent><a><b>Variable := <callee> (` — the shape of the printer's synthetic holder
const ARRAY_BINDING_HOLDER_RE = /^([ \t]*)([A-Za-z_]\w*Variable) := ([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\(/;

// the printed holder block with its declaration retyped, or `printed` untouched
function retypeArrayBindingHolder (goTranspiler, node, printed) {
    if (typeof printed !== 'string') {
        return printed;
    }
    const match = ARRAY_BINDING_HOLDER_RE.exec (printed); // `^`-anchored: no scan of the block
    if (match === null) {
        return printed;
    }
    const indent = match[1];
    const name = match[2];
    const callee = match[3];
    const method = callee.substring (callee.lastIndexOf ('.') + 1);
    if (CCXT_GO_ARRAY_BINDING_HOLDERS.indexOf (method) < 0) {
        return printed;
    }
    // the printer emits one `GetValue (<holder>, i)` read per element; only a destructuring
    // holder is followed by one, and that read is what makes this rewrite a holder rewrite
    if (printed.indexOf ('GetValue(' + name + ',') < 0) {
        return printed;
    }
    // `var x []any = ...` spells the type by name; a local or parameter literally named `any`
    // in the same function would make that token a reference to the value
    const scope = (typeof goTranspiler.goEnclosingFunction === 'function') ? goTranspiler.goEnclosingFunction (node) : undefined;
    if ((typeof goTranspiler.goTypeNameIsShadowed === 'function') && goTranspiler.goTypeNameIsShadowed (scope, '[]any')) {
        return printed;
    }
    const prefix = indent + name + ' := ';
    if (!printed.startsWith (prefix)) {
        return printed;
    }
    return indent + 'var ' + name + ' []any = ' + printed.slice (prefix.length);
}

// wrap both destructuring paths on a Transpiler's Go printer. Idempotent; everything the
// upstream printer printed in another shape is returned untouched.
export function installCcxtGoArrayBindingHolders (goTranspiler) {
    if (goTranspiler === undefined || goTranspiler.__ccxtGoArrayBindingHoldersInstalled) {
        return;
    }
    // declaration shape: `const [ a, b ] = this.handleM (...)`
    if (typeof goTranspiler.printVariableDeclarationList === 'function') {
        const upstreamDeclaration = goTranspiler.printVariableDeclarationList;
        goTranspiler.printVariableDeclarationList = function (node, identation) {
            return retypeArrayBindingHolder (this, node, upstreamDeclaration.call (this, node, identation));
        };
    }
    // assignment shape: `[ a, b ] = this.handleM (...)`. printBinaryExpression delegates to this
    // hook first and returns its result verbatim; the ArrayLiteralExpression branch further down
    // printBinaryExpression is unreachable for the same condition, so this hook alone covers the
    // shape.
    if (typeof goTranspiler.printCustomBinaryExpressionIfAny === 'function') {
        const upstreamBinary = goTranspiler.printCustomBinaryExpressionIfAny;
        goTranspiler.printCustomBinaryExpressionIfAny = function (node, identation) {
            return retypeArrayBindingHolder (this, node, upstreamBinary.call (this, node, identation));
        };
    }
    goTranspiler.__ccxtGoArrayBindingHoldersInstalled = true;
}

// --- generated string-returning helpers (parse*Status / parseOrderType / ...) ---

function isSafeStringCall (node) {
    if (node?.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = node.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return false;
    }
    if (callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return false;
    }
    const name = callee.name?.escapedText;
    return (typeof name === 'string') && CCXT_GO_SAFE_STRING_METHOD.test (name);
}

// the TS spelling of an absent value: `undefined` / `null` / `void 0`. In an
// expression position `undefined` parses as an *Identifier*, not the
// UndefinedKeyword token, and the printer emits `nil` for all three.
function isAbsentExpression (expression) {
    if ((expression.kind === ts.SyntaxKind.UndefinedKeyword) || (expression.kind === ts.SyntaxKind.NullKeyword)
        || (expression.kind === ts.SyntaxKind.VoidExpression)) {
        return true;
    }
    return (expression.kind === ts.SyntaxKind.Identifier) && (expression.escapedText === 'undefined');
}

// every `return` of this block, without descending into a nested function whose
// returns belong to another Go function
function collectReturnStatements (block) {
    const returns = [];
    const visit = (node) => {
        switch (node.kind) {
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.FunctionExpression:
        case ts.SyntaxKind.ArrowFunction:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.ClassExpression:
            return; // a nested function returns for itself
        case ts.SyntaxKind.ReturnStatement:
            returns.push (node);
            return;
        }
        ts.forEachChild (node, visit);
    };
    block.statements.forEach (visit);
    return returns;
}

// '*string' when EVERY return path of this generated helper hands back a
// `this.safeString*` result (a *string in Go) or an absent value — `undefined` /
// `null`, the TS spelling of the nil pointer — and nothing else; 'string' when
// every path is a string literal (never undefined → no pointer needed). Any other
// return (a Ternary, another helper, a local, a bare `return;`) or a mix of the two
// shapes leaves the emitted signature at `any`. An annotated TS return type is
// deliberately NOT consulted: the emitted Go body is what has to compile.
export function ccxtGoFamilyMethodReturnType (goTranspiler, node) {
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration) {
        return undefined;
    }
    const name = node.name?.escapedText;
    if ((typeof name !== 'string') || !CCXT_GO_FAMILY_METHOD.test (name)) {
        return undefined;
    }
    if ((typeof goTranspiler?.isAsyncFunction === 'function') && goTranspiler.isAsyncFunction (node)) {
        return undefined; // channel-returning: the printer owns that signature
    }
    const body = node.body;
    if (body?.kind !== ts.SyntaxKind.Block) {
        return undefined;
    }
    const returns = collectReturnStatements (body);
    if (returns.length === 0) {
        return undefined; // no return path to prove → leave the signature alone
    }
    let valuePaths = 0;
    let literalPaths = 0;
    let absentPaths = 0;
    for (const statement of returns) {
        const expression = statement.expression;
        if (expression === undefined) {
            return undefined; // bare `return;` prints a bare `return`, not a *string
        }
        if (isAbsentExpression (expression)) {
            absentPaths += 1;
            continue; // absent → nil pointer
        }
        if (isSafeStringCall (expression)) {
            valuePaths += 1;
            continue;
        }
        if (ts.isStringLiteral (expression) || ts.isNoSubstitutionTemplateLiteral (expression)) {
            literalPaths += 1;
            continue;
        }
        return undefined; // Ternary / another helper / a local → stays `any`
    }
    if ((valuePaths > 0 && literalPaths > 0) || (absentPaths > 0 && literalPaths > 0)) {
        return undefined; // a literal cannot share a body with `nil` or a *string
    }
    if (literalPaths > 0) {
        return CCXT_GO_FAMILY_LITERAL_RETURN_TYPE;
    }
    return (valuePaths > 0) ? CCXT_GO_FAMILY_RETURN_TYPE : undefined;
}

function enclosingClassDeclaration (node) {
    let current = node?.parent;
    while (current !== undefined) {
        if ((current.kind === ts.SyntaxKind.ClassDeclaration) || (current.kind === ts.SyntaxKind.ClassExpression)) {
            return current;
        }
        current = current.parent;
    }
    return undefined;
}

function findClassMethod (classNode, name) {
    const members = classNode?.members;
    if (members === undefined) {
        return undefined;
    }
    for (const member of members) {
        if ((member.kind === ts.SyntaxKind.MethodDeclaration) && (member.name?.escapedText === name)) {
            return member;
        }
    }
    return undefined;
}

// the Go type of a `var x any = this.parseOrderStatus (…)` initializer. The callee
// has to be the receiver's OWN method (the Go method of the class the call sits in)
// and that method has to pass ccxtGoFamilyMethodReturnType, so the local's type is
// always the type the emitted signature hands back. An inherited or otherwise
// unresolved callee stays `any`.
export function ccxtGoFamilyCallType (goTranspiler, initializer, printedValue) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return undefined;
    }
    if (callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;
    }
    const name = callee.name?.escapedText;
    if ((typeof name !== 'string') || !CCXT_GO_FAMILY_METHOD.test (name)) {
        return undefined;
    }
    let value = (printedValue ?? '').trim ();
    while (value.startsWith ('(') && goTranspiler.isWholePrintedCall (value, 0)) {
        value = value.substring (1, value.length - 1).trim ();
    }
    const open = value.indexOf ('(');
    if (open <= 0 || !goTranspiler.isWholePrintedCall (value, open)) {
        return undefined;
    }
    const expectedCallee = 'this.' + name.charAt (0).toUpperCase () + name.slice (1);
    if (value.substring (0, open) !== expectedCallee) {
        return undefined; // renamed / delegated call: not this class's own method
    }
    const methodNode = findClassMethod (enclosingClassDeclaration (initializer), name);
    return ccxtGoFamilyMethodReturnType (goTranspiler, methodNode);
}

// ---------------------------------------------------------------------------
// U02 — nil-declared later-write join for scalar pointers.
//
// `let x: Int = undefined` (or a bare `let x`) prints `var x any = nil`: the
// printer's nil branch names `any` unconditionally, so a later
// `x = this.safeInteger (...)` stores the *int64 the Safe* accessor returns
// (upstream #30054) inside an interface, or a nil pointer where the other ports
// carry `undefined`. When *every* later write of the name is a callee whose Go
// return type is a proven scalar pointer — the upstream Safe* layer, *int64 /
// *float64 / *bool — and every other use of the name is pointer-safe, the
// declaration can name that pointer type: the initialiser stays a nil pointer
// (TS `undefined` ⇔ nil pointer, so nil comparisons keep their meaning) and each
// write stores exactly the pointer the callee already returns.
//
// Only the *reads* need a per-shape proof, because naming the type changes what a
// read hands to the surrounding code. Accepted shapes:
//   - nil comparison: `x === undefined` / `x !== undefined` / `!= null` print
//     `x == nil` / `x != nil` (a nil-pointer test) or `IsEqual(x, nil)` /
//     `!IsEqual(x, nil)`; IsEqual normalises both operands with derefScalar
//   - value position inside an `any` container: object-literal value,
//     `AddElementToObject(container, key, x)`, `[]any{x, ...}` — the identical box
//     a declaration-initialised `var x *int64 = this.SafeInteger(...)` already
//     produces (900+ such sites in go/v4 today)
//   - argument to a callee whose body normalises a scalar pointer before reading
//     it (derefScalar), proved per callee:
//       this.Iso8601          exchange_time.go   `ts2 = derefScalar (ts2)` first
//       this.NumberToString   exchange_number.go `switch v := derefScalar (x)`
//       this.ParseOrderBook   generated; timestamp only lands in the returned map
//                             and in iso8601 (verified in the body)
//       this.CreateCcxtTradeId generated; timestamp is only tested with IsEqual and
//                             rendered with NumberToString (verified in the body)
// Everything else keeps the declaration `any`: `this.Yymmdd (x)` (its body tests
// `ts == nil` before ParseInt, so a nil pointer would be coerced to 0 instead of
// reading as absent), a key position, arithmetic, a property/string context, copy
// propagation into another local, a return value, and any write that is not a
// proven scalar-pointer call (literals, GetValue, Parse8601, Ternary, ...).
const NIL_DECLARED_SCALAR_POINTER_TYPES = [ '*int64', '*float64', '*bool' ];

const NIL_DECLARED_SAFE_ARG_CALLEES = [ 'this.Iso8601', 'this.NumberToString', 'this.ParseOrderBook', 'this.CreateCcxtTradeId' ];

const ASSIGNMENT_KIND_MIN = ts.SyntaxKind.FirstAssignment;
const ASSIGNMENT_KIND_MAX = ts.SyntaxKind.LastAssignment;
const COMPOUND_KIND_MIN = ts.SyntaxKind.FirstCompoundAssignment;
const COMPOUND_KIND_MAX = ts.SyntaxKind.LastCompoundAssignment;
const COMPARISON_TOKENS = [
    ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken,
];

// `x === undefined` / `x !== undefined` / `x == null` / `x != null`; the printer
// emits a nil comparison for all of them
function isUndefinedLiteral (node) {
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    if (node.kind === ts.SyntaxKind.Identifier) {
        return (node.escapedText === 'undefined') || (node.escapedText === 'null');
    }
    return false;
}

// the printed callee of a whole call, e.g. `this.Iso8601(...)` → 'this.Iso8601'
function printedCalleeOfCall (goTranspiler, node) {
    const printed = (goTranspiler.printNode (node, 0) ?? '').trim ();
    const open = printed.indexOf ('(');
    if (open <= 0 || !goTranspiler.isWholePrintedCall (printed, open)) {
        return undefined;
    }
    return printed.substring (0, open);
}

// is reading `name` through `node` provably transparent for a pointer-typed local?
function nilDeclaredReadIsSafe (goTranspiler, node) {
    const parent = node.parent;
    if (parent === undefined) {
        return false;
    }
    const kind = parent.kind;
    // a property name (`obj.x`) or an object-literal key is not a use of the local
    if ((parent.name === node) && (parent.expression !== node) && (parent.initializer !== node)) {
        return true;
    }
    if (kind === ts.SyntaxKind.BinaryExpression) {
        if (parent.left === node) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                return true; // a write; the write set is checked separately
            }
            if ((op >= COMPOUND_KIND_MIN) && (op <= COMPOUND_KIND_MAX)) {
                return false; // `x += 1` needs the value, not the pointer
            }
            if (COMPARISON_TOKENS.indexOf (op) >= 0) {
                return isUndefinedLiteral (parent.right);
            }
            return false; // arithmetic / string concatenation
        }
        if (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            // `container[key] = x` / `container.prop = x`: the printer turns the element
            // write into AddElementToObject(container, key, x), which boxes the pointer
            // exactly the way a declaration-initialised `var x *int64 = ...` is boxed
            // today. A plain `y = x` (copy propagation into a local another rule owns,
            // or into a struct field) stays rejected.
            const target = parent.left;
            if ((target?.kind !== ts.SyntaxKind.ElementAccessExpression) && (target?.kind !== ts.SyntaxKind.PropertyAccessExpression)) {
                return false;
            }
            const printed = (goTranspiler.printNode (parent, 0) ?? '').trim ();
            return printed.startsWith ('AddElementToObject(');
        }
        if (COMPARISON_TOKENS.indexOf (parent.operatorToken.kind) >= 0) {
            return isUndefinedLiteral (parent.left); // `undefined === x`
        }
        return false; // a read of the value in an expression
    }
    if ((kind === ts.SyntaxKind.PrefixUnaryExpression) || (kind === ts.SyntaxKind.PostfixUnaryExpression)
        || (kind === ts.SyntaxKind.DeleteExpression) || (kind === ts.SyntaxKind.SpreadElement)) {
        return false; // `++x`, `!x`, `-x`, `...x`
    }
    if (kind === ts.SyntaxKind.CallExpression) {
        if (parent.expression === node) {
            return false; // calling the local
        }
        const callee = printedCalleeOfCall (goTranspiler, parent);
        return (callee !== undefined) && (NIL_DECLARED_SAFE_ARG_CALLEES.indexOf (callee) >= 0);
    }
    if (kind === ts.SyntaxKind.PropertyAccessExpression || kind === ts.SyntaxKind.ElementAccessExpression) {
        return false; // reading a member/element needs a value, not a pointer
    }
    if (kind === ts.SyntaxKind.ArrayLiteralExpression) {
        // `[]any{x, params}` boxes the pointer; a destructuring target `[x, y] = f ()`
        // is caught by the upstream reject in goLocalIsSafeToType
        return true;
    }
    if ((kind === ts.SyntaxKind.PropertyAssignment && parent.initializer === node)
        || (kind === ts.SyntaxKind.ShorthandPropertyAssignment)) {
        return true; // object-literal value
    }
    return false; // rejection by default: anything unproven stays `any`
}

// the scalar-pointer type to name on a nil-declared declaration, or undefined when
// the family's proof does not hold for this declaration
export function ccxtGoNilDeclaredJoinType (goTranspiler, declaration) {
    if (declaration === undefined) {
        return undefined;
    }
    const name = declaration.name;
    if (name === undefined || name.kind !== ts.SyntaxKind.Identifier || name.elements !== undefined) {
        return undefined;
    }
    // only the shapes the printer would print as `var x any = nil`
    if (declaration.initializer !== undefined) {
        const printedInit = (goTranspiler.printNode (declaration.initializer, 0) ?? '').trim ();
        if (printedInit !== goTranspiler.UNDEFINED_TOKEN) {
            return undefined;
        }
    }
    const varName = name.escapedText;
    const scope = goTranspiler.goEnclosingFunction (declaration);
    if (scope === undefined) {
        return undefined;
    }
    // the join over every later write: all of them must be whole calls whose proven
    // Go return type is the same scalar pointer
    let joinType;
    let writeCount = 0;
    let readUnproven = false;
    const visit = (n) => {
        if (readUnproven) {
            return;
        }
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.escapedText === varName) && (n !== name)) {
            const parent = n.parent;
            const isWrite = (parent !== undefined) && (parent.kind === ts.SyntaxKind.BinaryExpression)
                && (parent.left === n) && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken);
            if (isWrite) {
                writeCount += 1;
                const written = goTranspiler.goTypeOfInitializer (parent.right, goTranspiler.printNode (parent.right, 0));
                if ((written === undefined) || ((joinType !== undefined) && (written !== joinType))) {
                    readUnproven = true; // divergent or unprovable write
                    return;
                }
                joinType = written;
            } else if (!nilDeclaredReadIsSafe (goTranspiler, n)) {
                readUnproven = true;
                return;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    if (readUnproven || (writeCount === 0) || (joinType === undefined)) {
        return undefined;
    }
    if (NIL_DECLARED_SCALAR_POINTER_TYPES.indexOf (joinType) < 0) {
        return undefined;
    }
    // the upstream rejects (shadowed type name, `x.push`, `++`, spread, destructuring,
    // a write of another type) must all pass for the same type
    if (goTranspiler.goTypeNameIsShadowed (scope, joinType)
        || !goTranspiler.goLocalIsSafeToType (scope, declaration, varName, joinType)) {
        return undefined;
    }
    return joinType;
}

function installNilDeclaredJoin (goTranspiler) {
    const upstream = goTranspiler.printVariableDeclarationList;
    goTranspiler.printVariableDeclarationList = function (node, identation) {
        const declaration = node?.declarations?.[0];
        const joinType = ccxtGoNilDeclaredJoinType (this, declaration);
        if (joinType !== undefined) {
            // the printer's own nil branch, with the proven pointer type named
            return this.getIden (identation) + 'var ' + this.printNode (declaration.name) + ' ' + joinType + ' = ' + this.NULL_TOKEN;
        }
        return upstream.call (this, node, identation);
    };
}

// ---------------------------------------------------------------------------
// U03 — the nil-declared later-write join.
//
// `let x = undefined` (and `let x;` / `let x = null`) prints `var x any = nil`:
// printVariableDeclarationList returns before it ever consults getGoLocalType, so
// the initializer classifier above cannot see those declarations at all. Their type
// has to come from the later WRITES — the join of every assignment in the scope.
//
// Naming that type is only value-preserving when x can never be read while still
// nil. In Go a nil map/slice boxed into `any` is a non-nil interface: `IsEqual(x,
// nil)` is false, `SafeValue`-style presence checks flip, `EvalTruthy`'s and
// GetArrayLength's nil arm behave the same as before but `AddElementToObject`
// panics on a nil map where an untyped nil is a silent no-op, and derefScalar
// (go/v4/exchange_helpers.go) unwraps only typed POINTERS, so nothing downstream
// repairs a nil map or slice. `var x map[string]any = nil` compiles, so the
// compiler cannot catch this either.
//
// The scan below therefore accepts a declaration only when EVERY read of x is
// preceded, on every control-flow path, by one of those writes. Then the runtime
// box already holds a map/slice of the join type at every observable point, and
// the typed declaration and the `any` box are the very same value. The 128
// `let fee = undefined; ... 'fee': fee` locals in the exchange files fail that
// test — the read sits on the branch where the write did not run — so they stay
// `any`, and so does every local whose value can reach a reader while nil.

const NIL_JOIN_TYPES = [ 'map[string]any', '[]any' ];

// every assignment operator: ts.SyntaxKind has no First/LastAssignmentOperator in v6
const NIL_JOIN_ASSIGNMENT_TOKENS = [
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

// how an occurrence of the local's name behaves in the generated Go
function nilJoinOccurrenceKind (node) {
    const parent = node.parent;
    if (parent === undefined) {
        return 'reject';
    }
    switch (parent.kind) {
    case ts.SyntaxKind.PropertyAccessExpression:
    case ts.SyntaxKind.QualifiedName:
        return (parent.name === node) ? 'skip' : 'read';  // the property name is not a use of the local
    case ts.SyntaxKind.PropertyAssignment:
    case ts.SyntaxKind.BindingElement:
        return (parent.name === node) ? 'skip' : 'read';
    case ts.SyntaxKind.ShorthandPropertyAssignment:       // `{ x }` prints `"x": x`
        return 'read';
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.Parameter:
        return (parent.name === node) ? 'skip' : 'read';  // a binding, not a use
    case ts.SyntaxKind.VariableDeclaration:
        return (parent.name === node) ? 'declaration' : 'read';
    case ts.SyntaxKind.BinaryExpression: {
        if (parent.left !== node) {
            return 'read';
        }
        const op = parent.operatorToken.kind;
        if (op === ts.SyntaxKind.EqualsToken) {
            return 'write';
        }
        return (NIL_JOIN_ASSIGNMENT_TOKENS.indexOf (op) >= 0) ? 'reject' : 'read';
    }
    case ts.SyntaxKind.PostfixUnaryExpression:
    case ts.SyntaxKind.PrefixUnaryExpression: {
        const op = parent.operator;
        if ((node === parent.operand) && ((op === ts.SyntaxKind.PlusPlusToken) || (op === ts.SyntaxKind.MinusMinusToken))) {
            return 'reject';                              // `x++` prints `x = Add(x, 1)`
        }
        return 'read';
    }
    case ts.SyntaxKind.SpreadElement:
    case ts.SyntaxKind.SpreadAssignment:
        return 'reject';                                  // `...x` forwards the boxed slice
    case ts.SyntaxKind.ArrayLiteralExpression:
        // `[x, y] = f()` destructures into `x = GetValue(...)`
        if ((parent.parent?.kind === ts.SyntaxKind.BinaryExpression) && (parent.parent.left === parent)) {
            return 'reject';
        }
        return 'read';
    }
    return 'read';
}

function nilJoinMentionsName (node, name) {
    let found = false;
    const visit = (n) => {
        if (found) {
            return;
        }
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.escapedText === name)) {
            found = true;
            return;
        }
        ts.forEachChild (n, visit);
    };
    visit (node);
    return found;
}

// definite-assignment scan: walks the enclosing function in source order, carries an
// `assigned` flag through every branch and rejects the declaration as soon as a read
// can run while x is still nil. Every construct whose execution order it cannot
// model (loops, try/catch, switch, anything unrecognised) keeps the flag it had on
// entry, which can only make the scan stricter.
function ccxtGoNilDeclaredContainerJoinType (goTranspiler, declaration) {
    const name = declaration.name?.escapedText;
    if (name === undefined) {
        return undefined;
    }
    const scope = (typeof goTranspiler.goEnclosingFunction === 'function') ? goTranspiler.goEnclosingFunction (declaration) : undefined;
    if (scope === undefined) {
        return undefined;
    }
    const state = { ok: true, goType: undefined, writes: 0 };
    const fail = () => { state.ok = false; };
    const isName = (node) => (node?.kind === ts.SyntaxKind.Identifier) && (node.escapedText === name);
    const readExpression = (node, assigned) => {
        if (!state.ok || (node === undefined) || (node === null)) {
            return;
        }
        if (node.kind === ts.SyntaxKind.Identifier) {
            if (isName (node) && (node !== declaration.name)) {
                const kind = nilJoinOccurrenceKind (node);
                if (kind === 'read') {
                    if (!assigned) {
                        fail ();
                    }
                } else if (kind !== 'skip') {
                    fail ();                              // write/reject in expression position
                }
            }
            return;
        }
        if ((node !== scope) && ts.isFunctionLike (node)) {
            fail ();                                      // a closure over x: its call order is unknowable
            return;
        }
        ts.forEachChild (node, (child) => readExpression (child, assigned));
    };
    const writeExpression = (right, assigned) => {
        readExpression (right, assigned);                 // the RHS is evaluated before the store
        const goType = goTranspiler.goTypeOfInitializer (right, goTranspiler.printNode (right, 0));
        if (NIL_JOIN_TYPES.indexOf (goType) < 0) {
            fail ();
            return;
        }
        if (state.goType === undefined) {
            state.goType = goType;
        } else if (state.goType !== goType) {
            fail ();                                      // map and slice writes cannot join
            return;
        }
        state.writes += 1;
    };
    const visitStatement = (node, assigned) => {
        if (!state.ok || (node === undefined) || (node === null)) {
            return assigned;
        }
        switch (node.kind) {
        case ts.SyntaxKind.Block: {
            let current = assigned;
            for (const statement of node.statements) {
                current = visitStatement (statement, current);
            }
            return current;
        }
        case ts.SyntaxKind.ExpressionStatement: {
            const expression = node.expression;
            if ((expression?.kind === ts.SyntaxKind.BinaryExpression)
                && (expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) && isName (expression.left)) {
                writeExpression (expression.right, assigned);
                return true;
            }
            readExpression (expression, assigned);
            return assigned;
        }
        case ts.SyntaxKind.VariableStatement: {
            let current = assigned;
            for (const child of node.declarationList.declarations) {
                if (isName (child.name)) {
                    if (child === declaration) {
                        current = false;                  // x is nil again from here
                    } else {
                        fail ();                          // a sibling binding of the same name
                    }
                }
                readExpression (child.initializer, current);
            }
            return current;
        }
        case ts.SyntaxKind.IfStatement: {
            readExpression (node.expression, assigned);
            const thenAssigned = visitStatement (node.thenStatement, assigned);
            const elseAssigned = (node.elseStatement === undefined) ? assigned : visitStatement (node.elseStatement, assigned);
            return thenAssigned && elseAssigned;
        }
        case ts.SyntaxKind.ForStatement: {
            visitStatement (node.initializer, assigned);
            readExpression (node.condition, assigned);
            readExpression (node.incrementor, assigned);
            visitStatement (node.statement, assigned);
            return assigned;                              // the body may not run
        }
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement: {
            readExpression (node.expression, assigned);
            visitStatement (node.statement, assigned);
            return assigned;
        }
        case ts.SyntaxKind.SwitchStatement: {
            readExpression (node.expression, assigned);
            for (const clause of node.caseBlock.clauses) {
                for (const statement of clause.statements) {
                    visitStatement (statement, assigned);
                }
            }
            return assigned;
        }
        case ts.SyntaxKind.TryStatement: {
            visitStatement (node.tryBlock, assigned);
            if (node.catchClause !== undefined) {
                visitStatement (node.catchClause.block, assigned);
            }
            visitStatement (node.finallyBlock, assigned);
            return assigned;                              // an exception may skip the try block
        }
        case ts.SyntaxKind.ReturnStatement:
        case ts.SyntaxKind.ThrowStatement: {
            readExpression (node.expression, assigned);
            return assigned;
        }
        case ts.SyntaxKind.EmptyStatement:
        case ts.SyntaxKind.BreakStatement:
        case ts.SyntaxKind.ContinueStatement:
            return assigned;
        default: {
            if (nilJoinMentionsName (node, name)) {
                fail ();                                  // an unmodelled statement shape
            }
            return assigned;
        }
        }
    };
    visitStatement (scope.body, false);
    if (!state.ok || (state.writes === 0) || (state.goType === undefined)) {
        return undefined;
    }
    if (goTranspiler.goTypeNameIsShadowed (scope, state.goType)) {
        return undefined;
    }
    if (!goTranspiler.goLocalIsSafeToType (scope, declaration, name, state.goType)) {
        return undefined;
    }
    return state.goType;
}

// printVariableDeclarationList prints `var x any = nil` for a nil declaration before it
// ever asks for a type, so the family is installed as a wrapper on that one line: every
// other shape the printer produces is returned untouched.
function installCcxtGoNilDeclaredJoin (goTranspiler) {
    if (typeof goTranspiler.printVariableDeclarationList !== 'function') {
        return; // older printer: nothing to extend
    }
    const upstream = goTranspiler.printVariableDeclarationList.bind (goTranspiler);
    goTranspiler.printVariableDeclarationList = function (node, identation) {
        const printed = upstream (node, identation);
        const declarations = node?.declarations;
        if (!declarations || (declarations.length !== 1)) {
            return printed;
        }
        const declaration = declarations[0];
        if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
            return printed;
        }
        const match = new RegExp ('^(\\s*)var (\\w+) any = ' + goTranspiler.UNDEFINED_TOKEN + '$').exec (printed);
        if ((match === null) || (match[2] !== goTranspiler.printNode (declaration.name))) {
            return printed;
        }
        const goType = ccxtGoNilDeclaredContainerJoinType (goTranspiler, declaration);
        if (goType === undefined) {
            return printed;
        }
        return match[1] + 'var ' + match[2] + ' ' + goType + ' = ' + goTranspiler.UNDEFINED_TOKEN;
    };
}

export function installCcxtGoLocalTypes (goTranspiler) {
    if (goTranspiler === undefined || goTranspiler.__ccxtGoLocalTypesInstalled) {
        return;
    }
    installCcxtGoArrayBindingHolders (goTranspiler);
    if (typeof goTranspiler.goTypeOfInitializer !== 'function' || typeof goTranspiler.isWholePrintedCall !== 'function') {
        return; // older printer without local typing: nothing to extend
    }
    installCcxtGoTypedConcat (goTranspiler);
    const upstream = goTranspiler.goTypeOfInitializer;
    goTranspiler.goTypeOfInitializer = function (initializer, printedValue) {
        const known = upstream.call (this, initializer, printedValue);
        if (known !== undefined) {
            return known;
        }
        const alias = aliasExchangeReceiver (this, printedValue);
        if (alias !== undefined) {
            // the printer's own table decides first (Milliseconds, Extend, IndexBy,
            // Keysort, Ymdhms, ...), then the CCXT one (ToArray, Base16ToBinary, ...).
            // A pointer result is never aliased: see aliasExchangeReceiver.
            const candidates = [
                upstream.call (this, initializer, alias),
                CCXT_GO_HELPER_RETURN_TYPES[alias.substring (0, alias.indexOf ('('))],
            ];
            for (const candidate of candidates) {
                if ((candidate !== undefined) && !candidate.startsWith ('*') && typeNameIsUsable (this, initializer, candidate)) {
                    return candidate;
                }
            }
            return undefined;
        }
        // the pro-tree-only callees are gated on the source file, so the same
        // transpiler instance can serve the REST, ws and prediction runs unchanged
        const familyType = ccxtGoFamilyCallType (this, initializer, printedValue);
        if (familyType !== undefined) {
            return familyType;
        }
        if (ccxtGoTernaryDeclaration (initializer) !== undefined) {
            const ternaryType = ccxtGoTernaryType (this, printedValue);
            if (ternaryType !== undefined) {
                return ternaryType;
            }
        }
        // Multiply/Subtract/Divide/Mod with provably int-kind operands box an int64
        // on every return path (see ccxtGoTypeOfArithmeticInitializer above)
        const arithmeticType = ccxtGoTypeOfArithmeticInitializer (this, initializer, printedValue);
        if (arithmeticType !== undefined) {
            return arithmeticType;
        }
        // a `a + b` initializer whose declaration print is in flight: both operands
        // provably Go strings, so the emitted value is a plain concatenation
        if (TYPED_CONCAT_IN_FLIGHT.has (initializer)) {
            return 'string';
        }
        const wsTree = goSourceIsWsTree (initializer);
        const goType = ccxtGoTypeOfPrintedCall (this, printedValue, wsTree, initializer);
        if (goType === undefined) {
            return ccxtGoTypeOfCopiedLocal (this, initializer, printedValue);
        }
        if (!typeNameIsUsable (this, initializer, goType)) {
            return undefined;
        }
        return goType;
    };
    installCcxtGoNilDeclaredStringJoins (goTranspiler);
    installCcxtGoTernaryCast (goTranspiler);
    installCcxtGoNilDeclaredJoin (goTranspiler);
    if (typeof goTranspiler.printVariableDeclarationList === 'function'
        && typeof goTranspiler.goEnclosingFunction === 'function'
        && typeof goTranspiler.goTypeNameIsShadowed === 'function'
        && typeof goTranspiler.goLocalIsSafeToType === 'function') {
        installNilDeclaredJoin (goTranspiler);
    }
    // the emitted signature of the same helpers: `any` → `*string` for the methods
    // the predicate above accepts, so the coercion and the local typing can never
    // disagree. Wrapping printMethodDefinition (not the file text) keeps it off
    // every other method and matches what the classifier sees.
    if (typeof goTranspiler.printMethodDefinition === 'function') {
        const upstreamMethodDefinition = goTranspiler.printMethodDefinition;
        goTranspiler.printMethodDefinition = function (node, identation) {
            const methodDef = upstreamMethodDefinition.call (this, node, identation);
            const goType = ccxtGoFamilyMethodReturnType (this, node);
            if (goType === undefined) {
                return methodDef;
            }
            return methodDef.replace (/(\)\s+)any(\s*)$/, '$1' + goType + '$2');
        };
    }
    goTranspiler.__ccxtGoLocalTypesInstalled = true;
    // the arithmetic type names a type Go will not unbox implicitly: the emitted
    // declaration needs the `.(int64)` the new declared type forces
    installCcxtGoArithmeticUnbox (goTranspiler);
}

// ------------------------- U01: nil-declared later-write join (string) -------------------------

// `let x = undefined` / `let x;` / `let x = null` print `var x any = nil`; a local
// literally named like a Go type would break the emitted `var x string`.
const NIL_DECLARED_GUARD_NAMES = [ 'string', 'int', 'int64', 'float64', 'bool', 'any', 'byte' ];

function isNilDeclaredInitializer (initializer) {
    if (initializer === undefined) {
        return true;
    }
    if (initializer.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    return ts.isIdentifier (initializer) && (initializer.escapedText === 'undefined');
}

function isNilLiteralExpression (node) {
    return node !== undefined && (node.kind === ts.SyntaxKind.NullKeyword
        || (ts.isIdentifier (node) && (node.escapedText === 'undefined')));
}

// a comparison operand a typed `string` local cannot be compared against: the post-print
// pass only rewrites nil and literal operands for `any` locals, so `x == 0` would be left
// as a raw (non-compiling) string/number comparison
function isNonStringLiteralOperand (node) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.BigIntLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.RegularExpressionLiteral:
    case ts.SyntaxKind.TemplateExpression:
        return true;
    case ts.SyntaxKind.PrefixUnaryExpression:
        return (node.operand !== undefined) && (node.operand.kind === ts.SyntaxKind.NumericLiteral);
    case ts.SyntaxKind.ParenthesizedExpression:
        return isNonStringLiteralOperand (node.expression);
    }
    return false;
}

function bindingMentionsName (binding, name) {
    if (binding === undefined) {
        return false;
    }
    if (ts.isIdentifier (binding)) {
        return binding.escapedText === name;
    }
    let found = false;
    const visit = (n) => {
        if (found) { return; }
        if (ts.isIdentifier (n) && (n.escapedText === name)) { found = true; return; }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (binding, visit);
    return found;
}

// `x` is an element of a destructuring pattern being assigned (`[x, y] = f ()`,
// `({ x } = o)`, `for ([x] of l)`): the printed write is `x = GetValue(...)`, which
// cannot assign into a `string` local
function isDestructuringTarget (id) {
    let container = undefined;
    let current = id;
    while (true) {
        const parent = current.parent;
        if (parent === undefined) {
            break;
        }
        const kind = parent.kind;
        if ((kind === ts.SyntaxKind.ArrayLiteralExpression) || (kind === ts.SyntaxKind.ObjectLiteralExpression)
                || (kind === ts.SyntaxKind.SpreadElement) || (kind === ts.SyntaxKind.PropertyAssignment)
                || (kind === ts.SyntaxKind.ShorthandPropertyAssignment)) {
            container = parent;
            current = parent;
            continue;
        }
        break;
    }
    if (container === undefined) {
        return false;
    }
    const parent = container.parent;
    if (parent === undefined) {
        return false;
    }
    if (parent.kind === ts.SyntaxKind.BinaryExpression) {
        return (parent.left === container) && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken);
    }
    return ((parent.kind === ts.SyntaxKind.ForOfStatement) || (parent.kind === ts.SyntaxKind.ForInStatement))
        && (parent.initializer === container);
}

// Definite-assignment over the statement structure of the enclosing function.
// Conservative: anything it cannot prove keeps the local `any`.
class GoNilDeclaredAssignmentScan {

    constructor (goTranspiler, declaration, name) {
        this.goTranspiler = goTranspiler;
        this.declaration = declaration;
        this.name = name;
        this.rejected = false;
        this.sawWrite = false;
        this.unsafeRead = undefined;
    }

    isName (node) {
        return ts.isIdentifier (node) && (node.escapedText === this.name);
    }

    // a later write is only provable when the printed value is a plain Go string
    isStringWrite (rhs) {
        return this.goTranspiler.goTypeOfInitializer (rhs, this.goTranspiler.printNode (rhs, 0)) === 'string';
    }

    // identifiers that are plain `x = rhs` targets; everything else is a read
    // (and takes the definite-assignment check below)
    classifyIdentifier (node, assigned) {
        const parent = node.parent;
        if (parent === undefined) {
            this.rejected = true;
            return assigned;
        }
        if ((parent.kind === ts.SyntaxKind.BinaryExpression) && (parent.left === node)) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                this.sawWrite = true;
                if (!this.isStringWrite (parent.right)) {
                    this.rejected = true; // another / unprovable type: stays any
                    return assigned;
                }
                this.walkExpression (parent.right, assigned); // reads inside the rhs see the pre-write state
                return true; // the write itself happens after its right-hand side
            }
            if ((op >= ts.SyntaxKind.FirstCompoundAssignment) && (op <= ts.SyntaxKind.LastCompoundAssignment)) {
                this.rejected = true; // `x += ...` prints compound arithmetic
                return assigned;
            }
        }
        if ((parent.kind === ts.SyntaxKind.PostfixUnaryExpression) || (parent.kind === ts.SyntaxKind.PrefixUnaryExpression)) {
            this.rejected = true; // x++ / --x
            return assigned;
        }
        if ((parent.kind === ts.SyntaxKind.PropertyAccessExpression) && (parent.expression === node)
                && (parent.name?.escapedText === 'push')) {
            this.rejected = true; // AppendToArray(&x, ...)
            return assigned;
        }
        if (parent.kind === ts.SyntaxKind.SpreadElement) {
            this.rejected = true; // x... only forwards a slice whose element type matches
            return assigned;
        }
        if (isDestructuringTarget (node)) {
            this.rejected = true; // x = GetValue(...)
            return assigned;
        }
        if ((parent.kind === ts.SyntaxKind.BinaryExpression) && ((parent.left === node) || (parent.right === node))) {
            const other = (parent.left === node) ? parent.right : parent.left;
            if (isNilLiteralExpression (other)) {
                this.rejected = true; // `x !== undefined` prints `x != nil` / IsEqual(x, nil)
                return assigned;
            }
            if (isNonStringLiteralOperand (other)) {
                this.rejected = true; // `x == 0` / `x == true` would print a raw non-string comparison
                return assigned;
            }
        }
        if (this.inNestedFunction (node)) {
            this.rejected = true; // a closure read cannot be proven
            return assigned;
        }
        if (!assigned && (this.unsafeRead === undefined)) {
            this.unsafeRead = node;
            this.rejected = true;
        }
        return assigned;
    }

    inNestedFunction (node) {
        let current = node.parent;
        while (current !== undefined && current !== this.scope) {
            switch (current.kind) {
            case ts.SyntaxKind.FunctionDeclaration:
            case ts.SyntaxKind.FunctionExpression:
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.MethodDeclaration:
            case ts.SyntaxKind.Constructor:
                return true;
            }
            current = current.parent;
        }
        return false;
    }

    walkExpression (node, assigned) {
        if (this.rejected || (node === undefined) || (node === this.declaration.name)) {
            return assigned;
        }
        if (this.isName (node)) {
            return this.classifyIdentifier (node, assigned);
        }
        let current = assigned;
        const visit = (child) => {
            if (this.rejected) { return; }
            current = this.walkExpression (child, current);
        };
        ts.forEachChild (node, visit);
        return current;
    }

    walkStatements (statements, assigned) {
        let current = assigned;
        let exit = 'none';
        for (const statement of statements) {
            if (exit !== 'none') {
                break; // unreachable after return / throw / break / continue
            }
            const result = this.walkStatement (statement, current);
            current = result.assigned;
            exit = result.exit;
        }
        return { assigned: current, exit };
    }

    walkStatement (statement, assigned) {
        if (this.rejected) {
            return { assigned, exit: 'none' };
        }
        const kind = statement.kind;
        if (kind === ts.SyntaxKind.Block) {
            return this.walkStatements (statement.statements, assigned);
        }
        if (kind === ts.SyntaxKind.IfStatement) {
            const condition = this.walkExpression (statement.expression, assigned);
            const then = this.walkStatement (statement.thenStatement, condition);
            const otherwise = (statement.elseStatement !== undefined)
                ? this.walkStatement (statement.elseStatement, condition)
                : { assigned: condition, exit: 'none' };
            const terminates = (result) => (result.exit === 'return') || (result.exit === 'throw');
            const thenDone = terminates (then) ? true : then.assigned;
            const elseDone = terminates (otherwise) ? true : otherwise.assigned;
            const exit = (terminates (then) && terminates (otherwise) && (then.exit === otherwise.exit)) ? then.exit : 'none';
            return { assigned: thenDone && elseDone, exit };
        }
        if ((kind === ts.SyntaxKind.WhileStatement) || (kind === ts.SyntaxKind.ForStatement)) {
            let current = this.walkExpression (statement.condition, assigned);
            if (kind === ts.SyntaxKind.ForStatement) {
                current = this.walkExpression (statement.initializer, current);
            }
            this.walkStatement (statement.statement, current);
            // a loop may run zero times: writes inside it do not escape
            return { assigned, exit: 'none' };
        }
        if ((kind === ts.SyntaxKind.ForOfStatement) || (kind === ts.SyntaxKind.ForInStatement)) {
            const current = this.walkExpression (statement.expression, assigned);
            this.walkStatement (statement.statement, current);
            return { assigned, exit: 'none' };
        }
        if (kind === ts.SyntaxKind.DoStatement) {
            const body = this.walkStatement (statement.statement, assigned);
            return { assigned: assigned || body.assigned, exit: 'none' };
        }
        if (kind === ts.SyntaxKind.SwitchStatement) {
            const current = this.walkExpression (statement.expression, assigned);
            let allAssigned = true;
            let hasDefault = false;
            for (const clause of statement.caseBlock.clauses) {
                if (clause.kind === ts.SyntaxKind.DefaultClause) {
                    hasDefault = true;
                }
                const scoped = this.walkExpression (clause.expression, current);
                const result = this.walkStatements (clause.statements, scoped);
                const terminates = (result.exit === 'return') || (result.exit === 'throw');
                // a `break` still falls through to the code after the switch
                if (!terminates && !result.assigned) {
                    allAssigned = false;
                }
            }
            return { assigned: hasDefault ? allAssigned : assigned, exit: 'none' };
        }
        if ((kind === ts.SyntaxKind.ReturnStatement) || (kind === ts.SyntaxKind.ThrowStatement)) {
            const current = this.walkExpression (statement.expression, assigned);
            return { assigned: current, exit: 'return' };
        }
        if ((kind === ts.SyntaxKind.BreakStatement) || (kind === ts.SyntaxKind.ContinueStatement)) {
            return { assigned, exit: 'break' };
        }
        if (kind === ts.SyntaxKind.TryStatement) {
            const body = this.walkStatement (statement.tryBlock, assigned);
            if (statement.catchClause !== undefined) {
                this.walkStatement (statement.catchClause.block, assigned);
            }
            if (statement.finallyBlock !== undefined) {
                this.walkStatement (statement.finallyBlock, (body.exit === 'none') ? assigned : body.assigned);
            }
            return { assigned, exit: 'none' }; // the catch path cannot be proven
        }
        if ((kind === ts.SyntaxKind.VariableStatement) || (kind === ts.SyntaxKind.ExpressionStatement)
                || (kind === ts.SyntaxKind.LabeledStatement) || (kind === ts.SyntaxKind.EmptyStatement)
                || (kind === ts.SyntaxKind.WithStatement) || (kind === ts.SyntaxKind.DebuggerStatement)) {
            const current = this.walkExpression (statement, assigned);
            return { assigned: current, exit: 'none' };
        }
        // anything else (function/class declarations, …) is scanned for shadowing
        // separately; no write of x can hide in it
        return { assigned, exit: 'none' };
    }

    run () {
        this.scope = (typeof this.goTranspiler.goEnclosingFunction === 'function')
            ? this.goTranspiler.goEnclosingFunction (this.declaration)
            : undefined;
        if ((this.scope === undefined) || (this.declaration.name === undefined)) {
            return false;
        }
        // any other binding of the same name in the scope: give up (the reads below
        // would no longer all refer to this declaration)
        const shadowingWalk = (node) => {
            if (this.rejected) {
                return;
            }
            if ((node !== this.declaration)
                    && ((node.kind === ts.SyntaxKind.VariableDeclaration) || (node.kind === ts.SyntaxKind.Parameter))) {
                if (bindingMentionsName (node.name, this.name)) {
                    this.rejected = true;
                    return;
                }
            }
            ts.forEachChild (node, shadowingWalk);
        };
        ts.forEachChild (this.scope, shadowingWalk);
        if (this.rejected) {
            return false;
        }
        const body = (this.scope.kind === ts.SyntaxKind.SourceFile)
            ? this.scope.statements
            : (ts.isBlock (this.scope.body) ? this.scope.body.statements : [ this.scope.body ]);
        this.walkStatements (body, false);
        return !this.rejected && this.sawWrite;
    }
}

// the printer's nil branch hardcodes `var x any = nil`, so this family is installed by
// wrapping printVariableDeclarationList; only an exact print is ever rewritten
export function installCcxtGoNilDeclaredStringJoins (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoNilDeclaredJoinsInstalled
            || (typeof goTranspiler.printVariableDeclarationList !== 'function')) {
        return;
    }
    const upstream = goTranspiler.printVariableDeclarationList.bind (goTranspiler);
    const nilDeclaration = /^([\t ]*)var (\w+) any = nil$/;
    goTranspiler.printVariableDeclarationList = (node, indentation) => {
        const printed = upstream (node, indentation);
        if (typeof printed !== 'string') {
            return printed;
        }
        const parsed = printed.match (nilDeclaration);
        if ((parsed === null) || (node?.parent?.kind !== ts.SyntaxKind.VariableStatement)
                || (node.declarations?.length !== 1)) {
            return printed;
        }
        const declaration = node.declarations[0];
        if (!ts.isIdentifier (declaration?.name) || !isNilDeclaredInitializer (declaration.initializer)
                || (NIL_DECLARED_GUARD_NAMES.indexOf (declaration.name.escapedText) >= 0)) {
            return printed;
        }
        const scan = new GoNilDeclaredAssignmentScan (goTranspiler, declaration, declaration.name.escapedText);
        if (!scan.run ()) {
            return printed;
        }
        return parsed[1] + 'var ' + parsed[2] + ' string';
    };
    goTranspiler.__ccxtGoNilDeclaredJoinsInstalled = true;
}

// The type assertion a typed Ternary declaration needs. `var x string = Ternary(...)`
// does not compile — the helper returns `any` — while
// `var x string = Ternary(...).(string)` does, and on the classification above it
// cannot fail. The assertion is emitted only where the printer itself printed the
// declaration type we proved: a local the reject filters demoted stays `any` and keeps
// its untyped call, and no reassignment or argument site is ever rewritten.
function installCcxtGoTernaryCast (goTranspiler) {
    if ((typeof goTranspiler.printVariableDeclarationList !== 'function') || goTranspiler.__ccxtGoTernaryCastInstalled) {
        return;
    }
    const upstreamPrint = goTranspiler.printVariableDeclarationList;
    goTranspiler.printVariableDeclarationList = function (node, identation) {
        const printed = upstreamPrint.call (this, node, identation);
        if (typeof printed !== 'string') {
            return printed;
        }
        const declaration = node?.declarations?.[0];
        if (ccxtGoTernaryDeclaration (declaration?.initializer) === undefined) {
            return printed;
        }
        // only the statement-level branch prints `var <name> <T> = <value>`; the
        // others (`x := <value>`, the await trampoline) carry no declared type
        const lastLine = printed.substring (printed.lastIndexOf ('\n') + 1);
        const match = /^\s*var\s+[A-Za-z_][A-Za-z0-9_]*\s+(\S+)\s*=\s*([\s\S]*)$/.exec (lastLine);
        if (match === null) {
            return printed;
        }
        const declaredType = match[1];
        if ((declaredType === 'any') || (ccxtGoTernaryType (this, match[2]) !== declaredType)) {
            return printed;
        }
        return printed + '.' + '(' + declaredType + ')';
    };
    goTranspiler.__ccxtGoTernaryCastInstalled = true;
}

export default installCcxtGoLocalTypes;
