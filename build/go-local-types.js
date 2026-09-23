import fs from 'fs';
import path from 'path';
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
    // Typed twins of GetArg (go/v4/exchange_helpers.go) -- the `var x <T> = GetArg<T>(...)`
    // locals the printer declares for a provable optional argument
    'GetArgMap': 'map[string]any',
    'GetArgMapSlice': '[]map[string]any',
    'GetArgAnySlice': '[]any',
    'GetArgStringSlice': '[]string',
    'GetArgString': 'string',
    'GetArgBool': 'bool',
    'GetArgInt64': 'int64',
    'GetArgFloat64': 'float64',
    'GetArgStringPtr': '*string',
    'GetArgInt64Ptr': '*int64',
    'GetArgFloat64Ptr': '*float64',
    'GetArgBoolPtr': '*bool',
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
    'this.Account': 'map[string]any',
    'this.ParseOrderBook': 'map[string]any',
    'this.Market': 'map[string]any',
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


// ---------------------------------------------------------------------------------------------
// `var currency map[string]any = this.Currency (code)` / `this.SafeCurrency (id)`
//
// The two currency accessors of exchange_generated.go hand back the currency dict a
// fetchCurrencies / safeCurrencyStructure builds, so their box holds a Go map[string]any on
// EVERY path: currency() panics when the code is unknown, safeCurrency() falls back to the
// structure dict, and both dict sources (Currencies / Currencies_by_id) are only ever written
// through mapToSafeMap(deepExtend(..)), indexBy(.., 'code') and indexBySafe(.., 'id') — the
// indexer stores an element only when it IS a map, so a currency entry is never a *sync.Map, a
// slice or a scalar. Unlike SafeDict*/SafeList* there is no absent value to carry (neither
// accessor returns undefined), so the declaration can name the map — and the emitted call,
// whose Go signature is still `any`, is unboxed at the declaration (see
// ccxtGoUnboxCurrencyDeclaration) exactly like the arithmetic family.
const CCXT_GO_CURRENCY_LOCAL_TYPE = 'map[string]any';

const CCXT_GO_CURRENCY_CALLEES = [ 'this.Currency', 'this.SafeCurrency' ];

// the callee of one whole printed call, or undefined
function ccxtGoWholePrintedCallee (goTranspiler, printedValue) {
    let value = (printedValue ?? '').trim ();
    while (value.startsWith ('(') && goTranspiler.isWholePrintedCall (value, 0)) {
        value = value.substring (1, value.length - 1).trim ();
    }
    const open = value.indexOf ('(');
    if (open <= 0 || !goTranspiler.isWholePrintedCall (value, open)) {
        return undefined;
    }
    const callee = value.substring (0, open);
    return /^[A-Za-z_][\w.]*$/.test (callee) ? callee : undefined;
}

// the map type of a DECLARATION initialised by one of the currency accessors. Declarations
// only: a later `currency = this.Currency (..)` write reaches this hook as a BinaryExpression
// operand, and typing THAT would need the unbox at every write. The printer's own later-writes
// scan runs this hook too, so a declaration whose local is re-assigned stays `any` — fail
// closed, because that write would then have to carry the unbox as well.
function ccxtGoTypeOfCurrencyInitializer (goTranspiler, initializer, printedValue) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    if (initializer.parent?.kind !== ts.SyntaxKind.VariableDeclaration) {
        return undefined;
    }
    const callee = ccxtGoWholePrintedCallee (goTranspiler, printedValue);
    if ((callee === undefined) || (CCXT_GO_CURRENCY_CALLEES.indexOf (callee) < 0)) {
        return undefined;
    }
    if (!typeNameIsUsable (goTranspiler, initializer, CCXT_GO_CURRENCY_LOCAL_TYPE)) {
        return undefined;
    }
    return CCXT_GO_CURRENCY_LOCAL_TYPE;
}

// The declaration names a map while the accessor's emitted Go signature is `any`, so the call
// has to be unboxed for the declaration to compile. Fires only on the exact shape the
// classifier above typed (a whole `this.Currency (..)` / `this.SafeCurrency (..)` call), and
// never twice: an already-unboxed tail fails the trailing-text check.
export function ccxtGoUnboxCurrencyDeclaration (goTranspiler, printed) {
    if (typeof printed !== 'string') {
        return printed;
    }
    const match = /^([\s\S]*?\bvar [A-Za-z0-9_]+ map\[string\]any = )((?:ccxt\.)?(?:this\.)?(?:Currency|SafeCurrency)\([^\n]*)$/.exec (printed);
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
    return match[1] + tail.substring (0, close) + '.(' + CCXT_GO_CURRENCY_LOCAL_TYPE + ')' + rest;
}

function installCcxtGoCurrencyUnbox (goTranspiler) {
    if (typeof goTranspiler.printVariableDeclarationList !== 'function' || goTranspiler.__ccxtGoCurrencyUnboxInstalled) {
        return;
    }
    const upstream = goTranspiler.printVariableDeclarationList;
    goTranspiler.printVariableDeclarationList = function (node, identation) {
        const printed = upstream.call (this, node, identation);
        return ccxtGoUnboxCurrencyDeclaration (this, printed);
    };
    goTranspiler.__ccxtGoCurrencyUnboxInstalled = true;
}

// Types `this.safeDict` / `this.safeList` / `this.safeDict2` / `this.safeList2` locals the printer's
// own predicate leaves boxed: cast-wrapped initializers, kept defaults, the two-key accessors and
// the list family's `this.Safe*` reads; nothing that writes or hands out the local is typed.
const CCXT_GO_SAFE_DICT_LOCAL_TYPE = 'map[string]any';

const CCXT_GO_SAFE_LIST_LOCAL_TYPE = '[]any';

const CCXT_GO_SAFE_COLLECTION_FAMILIES = {
    'safeDict': 'dict',
    'safeList': 'list',
    'safeDict2': 'dict2',
    'safeList2': 'list2',
};

// the deref-aware readers the printer admits, plus Object.values
const CCXT_GO_SAFE_DICT_READ_CALLEES = [ 'GetValue', 'InOp', 'ObjectKeys', 'ObjectValues', 'IsDictionary', 'this.IsDictionary', 'ccxt.GetValue', 'ccxt.InOp', 'ccxt.ObjectKeys', 'ccxt.ObjectValues', 'ccxt.IsDictionary' ];
// the subset that answers the same for a nil map and for the untyped nil a 2-arg accessor boxes
const CCXT_GO_SAFE_DICT_STRICT_CALLEES = [ 'GetValue', 'InOp', 'ccxt.GetValue', 'ccxt.InOp' ];
const CCXT_GO_SAFE_LIST_READ_CALLEES = [ 'GetValue', 'GetArrayLength', 'ccxt.GetValue', 'ccxt.GetArrayLength' ];
const CCXT_GO_SAFE_ACCESSOR_CALLEE = /^(?:ccxt\.)?(?:this\.)?Safe[A-Z]/;

// the member names the reachable raw kinds answer directly (the ArrayCache arms of SafeValueN and
// the IOrderBookSide.GetValue switches) and the int-like texts that index a slice: a key like that
// reads a member the typed slice does not hold, so it cannot be typed
const CCXT_GO_SAFE_ACCESSOR_MEMBER_KEYS = [ 'Data', 'Index', 'Depth', 'Length', 'Side', 'Hashmap', 'data', 'hashmap' ];

// the accessor call's key when it can only name a member, or undefined when it could index
function ccxtGoSafeAccessorMemberKey (call) {
    const key = call.arguments[1];
    if ((key === undefined) || (key.kind !== ts.SyntaxKind.StringLiteral)) {
        return undefined;
    }
    if ((CCXT_GO_SAFE_ACCESSOR_MEMBER_KEYS.indexOf (key.text) >= 0) || ((/^[+-]?[0-9]+$/).test (key.text))) {
        return undefined;
    }
    return key.text;
}

// the accessor call of a container local's initializer, or undefined for every other shape. The TS
// cast and the non-null assertion around the call only drive the checker: the declaration print
// drops them, so the local can be typed like the bare call.
function ccxtGoSafeCollectionCall (initializer) {
    let node = initializer;
    while ((node !== undefined) && ((node.kind === ts.SyntaxKind.ParenthesizedExpression)
        || (node.kind === ts.SyntaxKind.AsExpression)
        || (node.kind === ts.SyntaxKind.NonNullExpression))) {
        node = node.expression;
    }
    if ((node === undefined) || (node.kind !== ts.SyntaxKind.CallExpression)) {
        return undefined;
    }
    const callee = node.expression;
    if ((callee === undefined) || (callee.kind !== ts.SyntaxKind.PropertyAccessExpression)) {
        return undefined;
    }
    if ((callee.expression === undefined) || (callee.expression.kind !== ts.SyntaxKind.ThisKeyword)) {
        return undefined;
    }
    const method = callee.name === undefined ? '' : callee.name.text;
    const family = CCXT_GO_SAFE_COLLECTION_FAMILIES[method];
    return family === undefined ? undefined : { 'family': family, 'call': node };
}

// the arguments of a whole `this.safeDict(container, key[, default])` /
// `this.safeDict2(container, key1, key2[, default])` call, or undefined for every other shape: the
// default must print as a Go literal of the container type, a computed default keeps the box.
function ccxtGoSafeCollectionArgs (initializer) {
    const found = ccxtGoSafeCollectionCall (initializer);
    if (found === undefined) {
        return undefined;
    }
    const args = found.call.arguments;
    const twoKeys = (found.family === 'dict2') || (found.family === 'list2');
    const wanted = twoKeys ? 3 : 2;
    if ((args.length !== wanted) && (args.length !== (wanted + 1))) {
        return undefined;
    }
    const dictLike = (found.family === 'dict') || (found.family === 'dict2');
    let fallback;
    if (args.length === (wanted + 1)) {
        fallback = args[wanted];
        if (dictLike && (fallback.kind !== ts.SyntaxKind.ObjectLiteralExpression)) {
            return undefined;
        }
        if (!dictLike && (fallback.kind !== ts.SyntaxKind.ArrayLiteralExpression)) {
            return undefined;
        }
    }
    return { 'family': found.family, 'call': found.call, 'args': args, 'fallback': fallback };
}

// one later use of the local: a read that answers for the typed container what it answered for the
// box, never a use that hands the box out or writes it. `defaulted` is false for a 2-arg site,
// whose absent case swaps an untyped nil for a nil container.
function ccxtGoSafeCollectionUseReads (goTranspiler, node, family, defaulted) {
    const parent = node.parent;
    if (parent === undefined) {
        return false;
    }
    const dictLike = (family === 'dict') || (family === 'dict2');
    if (parent.kind === ts.SyntaxKind.ElementAccessExpression) {
        if (parent.expression !== node) {
            return false; // the local is the key, not the container
        }
        const above = parent.parent;
        if (above === undefined) {
            return true;
        }
        if ((above.kind === ts.SyntaxKind.BinaryExpression) && (above.left === parent)) {
            return false; // element write, the compound forms included
        }
        if ((above.kind === ts.SyntaxKind.PostfixUnaryExpression) || (above.kind === ts.SyntaxKind.PrefixUnaryExpression)) {
            return false;
        }
        if (above.kind === ts.SyntaxKind.DeleteExpression) {
            return false;
        }
        return true;
    }
    if (parent.kind === ts.SyntaxKind.BinaryExpression) {
        return dictLike && (parent.operatorToken !== undefined) && (parent.operatorToken.kind === ts.SyntaxKind.InKeyword) && (parent.right === node);
    }
    if (parent.kind === ts.SyntaxKind.PropertyAccessExpression) {
        return !dictLike && (parent.expression === node) && (parent.name !== undefined) && (parent.name.text === 'length');
    }
    if (parent.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    if ((parent.expression === node) || (parent.arguments.indexOf (node) !== 0)) {
        return false;
    }
    const callee = typeof goTranspiler.goPrintedCallee === 'function' ? goTranspiler.goPrintedCallee (goTranspiler.printNode (parent, 0)) : undefined;
    if (callee === undefined) {
        return false;
    }
    if (!dictLike) {
        if (CCXT_GO_SAFE_LIST_READ_CALLEES.indexOf (callee) >= 0) {
            return true;
        }
        return (ccxtGoSafeAccessorMemberKey (parent) !== undefined);
    }
    if (!defaulted) {
        return (CCXT_GO_SAFE_DICT_STRICT_CALLEES.indexOf (callee) >= 0) || CCXT_GO_SAFE_ACCESSOR_CALLEE.test (callee);
    }
    return (CCXT_GO_SAFE_DICT_READ_CALLEES.indexOf (callee) >= 0) || CCXT_GO_SAFE_ACCESSOR_CALLEE.test (callee);
}

// the Go type of an extended container local, or undefined when the site keeps its box. The
// printer's declaration print calls this only for a statement-level declaration.
function ccxtGoSafeCollectionLocalType (goTranspiler, declaration, families, restUses = true) {
    if ((declaration === undefined) || (declaration.kind !== ts.SyntaxKind.VariableDeclaration)) {
        return undefined;
    }
    if ((declaration.name === undefined) || (declaration.name.kind !== ts.SyntaxKind.Identifier)) {
        return undefined;
    }
    if ((declaration.parent === undefined) || (declaration.parent.parent === undefined) || (declaration.parent.parent.kind !== ts.SyntaxKind.VariableStatement)) {
        return undefined;
    }
    const found = ccxtGoSafeCollectionArgs (declaration.initializer);
    if ((found === undefined) || (families.indexOf (found.family) < 0)) {
        return undefined;
    }
    if ((typeof goTranspiler.goEnclosingFunction !== 'function') || (typeof goTranspiler.goTypeNameIsShadowed !== 'function')
        || (typeof goTranspiler.hasNodeWhere !== 'function') || (typeof goTranspiler.printNode !== 'function')) {
        return undefined; // older printer without local typing: nothing to extend
    }
    const dictLike = (found.family === 'dict') || (found.family === 'dict2');
    const goType = dictLike ? CCXT_GO_SAFE_DICT_LOCAL_TYPE : CCXT_GO_SAFE_LIST_LOCAL_TYPE;
    const scope = goTranspiler.goEnclosingFunction (declaration);
    if ((scope === undefined) || goTranspiler.goTypeNameIsShadowed (scope, goType)) {
        return undefined;
    }
    const sourceName = declaration.name.text;
    const defaulted = found.fallback !== undefined;
    const restTree = restUses && ccxtGoSafeCollectionIsRestSource (declaration) && !ccxtGoSafeCollectionReadsThisField (found.args[0]);
    // a property name is never a reference, and the checker resolves every other binding of the
    // same name: only the identifiers that really read this local have to be container reads
    const refersToDeclaration = typeof goTranspiler.goIdentifierRefersToDeclaration === 'function' ? goTranspiler.goIdentifierRefersToDeclaration : undefined;
    const unsafe = goTranspiler.hasNodeWhere (scope, (n) => {
        if ((n.kind !== ts.SyntaxKind.Identifier) || (n.text !== sourceName) || (n === declaration.name)) {
            return false;
        }
        if ((n.parent !== undefined) && (n.parent.kind === ts.SyntaxKind.PropertyAccessExpression) && (n.parent.name === n)) {
            return false; // `other.fees`
        }
        if ((refersToDeclaration !== undefined) && !refersToDeclaration.call (goTranspiler, n, declaration)) {
            return false; // another declaration of the same name in a nested scope
        }
        if (ccxtGoSafeCollectionUseReads (goTranspiler, n, found.family, defaulted)) {
            return false;
        }
        return !(restTree && ccxtGoSafeCollectionRestUse (goTranspiler, n, found.family, defaulted));
    });
    return unsafe ? undefined : goType;
}

// the ws caches and order-book sides live only under ts/src/pro and ts/src/prediction: a REST
// source file is one directly under ts/src, whose containers are decoded JSON or literals
function ccxtGoSafeCollectionIsRestSource (node) {
    const fileName = node?.getSourceFile?. ()?.fileName;
    return (typeof fileName === 'string') && (/(^|[\\/])ts[\\/]src[\\/][^\\/]+\.ts$/).test (fileName);
}

// `this.options[...]` and friends may hold a *sync.Map, which the typed readers copy
function ccxtGoSafeCollectionReadsThisField (node) {
    let current = node;
    while ((current !== undefined) && ((current.kind === ts.SyntaxKind.CallExpression) || (current.kind === ts.SyntaxKind.ElementAccessExpression)
        || (current.kind === ts.SyntaxKind.PropertyAccessExpression) || (current.kind === ts.SyntaxKind.ParenthesizedExpression))) {
        if ((current.kind === ts.SyntaxKind.PropertyAccessExpression) && (current.expression?.kind === ts.SyntaxKind.ThisKeyword)) {
            return true;
        }
        current = (current.kind === ts.SyntaxKind.CallExpression) ? current.arguments[0] : current.expression;
    }
    return false;
}

// the read-half calls that observe or mutate the container itself keep the box
const CCXT_GO_SAFE_COLLECTION_VETO_CALLEES = [ 'DeepExtend', 'this.DeepExtend', 'ObjectKeys', 'ccxt.ObjectKeys', 'AddElementToObject', 'ccxt.AddElementToObject' ];

// a use of a REST container local beyond the shared read shapes: any Safe* accessor receiver (a
// []any answers an int key like the decoded slice), and, when a literal default makes the box
// never nil, the positions that re-box the same map/slice (argument, object/array value, return, nil test)
function ccxtGoSafeCollectionRestUse (goTranspiler, node, family, defaulted) {
    const parent = node.parent;
    if (parent === undefined) {
        return false;
    }
    if (parent.kind === ts.SyntaxKind.CallExpression) {
        if ((parent.expression === node) || (parent.arguments.indexOf (node) < 0)) {
            return false;
        }
        const callee = typeof goTranspiler.goPrintedCallee === 'function' ? goTranspiler.goPrintedCallee (goTranspiler.printNode (parent, 0)) : undefined;
        if ((callee === undefined) || (CCXT_GO_SAFE_COLLECTION_VETO_CALLEES.indexOf (callee) >= 0)) {
            return false;
        }
        if ((parent.arguments.indexOf (node) === 0) && CCXT_GO_SAFE_ACCESSOR_CALLEE.test (callee)) {
            return true;
        }
        return defaulted;
    }
    if (!defaulted) {
        return false;
    }
    // a literal on the left of `=` is a destructuring write, not a value
    let literal = (parent.kind === ts.SyntaxKind.ArrayLiteralExpression) ? parent : parent.parent;
    while ((literal?.parent !== undefined) && ((literal.parent.kind === ts.SyntaxKind.ArrayLiteralExpression)
        || (literal.parent.kind === ts.SyntaxKind.ObjectLiteralExpression) || (literal.parent.kind === ts.SyntaxKind.PropertyAssignment))) {
        literal = literal.parent;
    }
    if ((literal?.parent?.kind === ts.SyntaxKind.BinaryExpression) && (literal.parent.left === literal)) {
        return false;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.PropertyAssignment:
        return parent.initializer === node;
    case ts.SyntaxKind.ShorthandPropertyAssignment:
    case ts.SyntaxKind.ArrayLiteralExpression:
    case ts.SyntaxKind.ReturnStatement:
        return true;
    case ts.SyntaxKind.BinaryExpression: {
        const op = parent.operatorToken?.kind;
        const other = (parent.left === node) ? parent.right : parent.left;
        return (COMPARISON_TOKENS.indexOf (op) >= 0) && (isUndefinedLiteral (other) || (other?.kind === ts.SyntaxKind.NullKeyword));
    }
    }
    return false;
}

// the initializer a typed container local is declared with. An empty-literal default is dropped
// exactly like the printer's own emission does (no admitted read observes it); a non-empty default
// is passed to a default-aware reader so the local holds the value the box held.
function ccxtGoSafeCollectionUnboxValue (goTranspiler, declaration, identation, families) {
    const found = ccxtGoSafeCollectionArgs (declaration.initializer);
    if ((found === undefined) || (families.indexOf (found.family) < 0)) {
        return undefined;
    }
    const printed = found.args.map ((arg, index) => goTranspiler.printNode (arg, index === 0 ? identation : 0));
    // a local typed only through the REST value uses hands its map/slice out, so the default stays
    const handedOut = ccxtGoSafeCollectionLocalType (goTranspiler, declaration, families, false) === undefined;
    const empty = (found.fallback === undefined) || (!handedOut
        && (((found.family === 'dict') || (found.family === 'dict2')) ? (found.fallback.properties.length === 0) : (found.fallback.elements.length === 0)));
    if (found.family === 'dict') {
        return empty ? 'SafeMapTyped(' + printed[0] + ', ' + printed[1] + ')' : 'MapTyped(' + goTranspiler.printNode (found.call, identation) + ')';
    }
    if (found.family === 'list') {
        return empty ? 'SafeListTyped(' + printed[0] + ', ' + printed[1] + ')' : 'SafeListTypedDefault(' + printed[0] + ', ' + printed[1] + ', ' + printed[2] + ')';
    }
    const reader = found.family === 'dict2' ? 'SafeDict2Typed' : 'SafeList2Typed';
    return reader + '(' + (empty ? printed.slice (0, 3) : printed.slice (0, 4)).join (', ') + ')';
}

// teach the printer's container-local typing the shapes its own predicate leaves out. Every hook
// checks the shipped predicate first, so a site the printer already types is emitted byte for byte
// as before.
function installCcxtGoSafeCollectionUnbox (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoSafeCollectionUnboxInstalled) {
        return;
    }
    if ((typeof goTranspiler.goSafeDictLocalUnbox !== 'function') || (typeof goTranspiler.goSafeListLocalUnbox !== 'function')
        || (typeof goTranspiler.goSafeDictUnboxValue !== 'function') || (typeof goTranspiler.goSafeListUnboxValue !== 'function')) {
        return; // older printer without the container unbox: nothing to extend
    }
    const shippedDictType = goTranspiler.goSafeDictLocalUnbox;
    const shippedListType = goTranspiler.goSafeListLocalUnbox;
    const shippedDictValue = goTranspiler.goSafeDictUnboxValue;
    const shippedListValue = goTranspiler.goSafeListUnboxValue;
    const dictFamilies = [ 'dict', 'dict2' ];
    const listFamilies = [ 'list', 'list2' ];
    goTranspiler.goSafeDictLocalUnbox = function (declaration) {
        const known = shippedDictType.call (this, declaration);
        if (known !== undefined) {
            return known;
        }
        return ccxtGoSafeCollectionLocalType (this, declaration, dictFamilies);
    };
    goTranspiler.goSafeListLocalUnbox = function (declaration) {
        const known = shippedListType.call (this, declaration);
        if (known !== undefined) {
            return known;
        }
        return ccxtGoSafeCollectionLocalType (this, declaration, listFamilies);
    };
    goTranspiler.goSafeDictUnboxValue = function (declaration, identation) {
        if (ccxtGoSafeCollectionLocalType (this, declaration, dictFamilies) !== undefined) {
            return ccxtGoSafeCollectionUnboxValue (this, declaration, identation, dictFamilies);
        }
        return shippedDictValue.call (this, declaration, identation);
    };
    goTranspiler.goSafeListUnboxValue = function (declaration, identation) {
        if (ccxtGoSafeCollectionLocalType (this, declaration, listFamilies) !== undefined) {
            return ccxtGoSafeCollectionUnboxValue (this, declaration, identation, listFamilies);
        }
        return shippedListValue.call (this, declaration, identation);
    };
    goTranspiler.__ccxtGoSafeCollectionUnboxInstalled = true;
}


// Fields of the hand-written `BaseExchange` (go/v4/exchange.go) whose Go type is a
// native string-keyed map of `any`. `this.<field>["k"]` is then the same read as
// `GetValue(this.<field>, "k")`: a missing key gives the `any` nil in both cases,
// and a nil map reads as nil rather than panicking. Fields typed `*sync.Map`
// (Options, Markets, Currencies, MarketsById, ...), `any` (Urls) or a slice
// (Symbols, Codes, Ids) are deliberately absent — they are not indexable in Go.
export const CCXT_GO_EXCHANGE_MAP_FIELDS = {
    'Has': 'map[string]any',
    'Api': 'map[string]any',
    'TransformedApi': 'map[string]any',
    'RequiredCredentials': 'map[string]any',
    'HttpExceptions': 'map[string]any',
    'Timeframes': 'map[string]any',
    'Features': 'map[string]any',
    'Exceptions': 'map[string]any',
    'Precision': 'map[string]any',
    'UserAgents': 'map[string]any',
    'TokenBucket': 'map[string]any',
    'CommonCurrencies': 'map[string]any',
    'Limits': 'map[string]any',
    'Fees': 'map[string]any',
    'Status': 'map[string]any',
};

// the Go map type of `this.<field>`, or undefined for every other expression shape
export function ccxtGoIndexableThisField (goTranspiler, node) {
    if (typeof goTranspiler.isGoThisPropertyAccessExpression !== 'function') {
        return undefined;
    }
    if (!goTranspiler.isGoThisPropertyAccessExpression (node)) {
        return undefined;
    }
    const field = goTranspiler.transformPropertyAccessExpressionName (node.name.text, node.name);
    return CCXT_GO_EXCHANGE_MAP_FIELDS[field];
}

// teach the Go printer's `goIndexableTypeOf` the exchange fields above, so an
// element access on one of them prints as a native map index instead of GetValue
export function installCcxtGoIndexableTypes (goTranspiler) {
    if (goTranspiler === undefined || goTranspiler.__ccxtGoIndexableTypesInstalled) {
        return;
    }
    if (typeof goTranspiler.goIndexableTypeOf !== 'function') {
        return; // older printer without the element-access typing: nothing to extend
    }
    const upstream = goTranspiler.goIndexableTypeOf;
    goTranspiler.goIndexableTypeOf = function (node, printed) {
        const known = upstream.call (this, node, printed);
        if (known !== undefined) {
            return known;
        }
        return ccxtGoIndexableThisField (this, node);
    };
    goTranspiler.__ccxtGoIndexableTypesInstalled = true;
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
        // a local the printer declares `string`, a defaulted parameter bound by
        // GetArgString, or a local this family itself declares `string`
        if ((typeof goTranspiler.goDeclaredTypeOfIdentifier === 'function')
            && (goTranspiler.goDeclaredTypeOfIdentifier (node) === 'string')) {
            return true;
        }
        return (ccxtGoWriteSiteLocalGoType (goTranspiler, node) === 'string')
            || goConcatDeclaredStringLocal (goTranspiler, node);
    case ts.SyntaxKind.BinaryExpression:
        // a nested `+` whose operands are all Go strings (flattened when printed)
        return (node.operatorToken?.kind === ts.SyntaxKind.PlusToken)
            && goStringOperand (goTranspiler, node.left) && goStringOperand (goTranspiler, node.right);
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

// true when `node` names a `const x = a + b` local this family declares `string`:
// every leaf a Go string, no veto, and the printer's own scan accepts `string`
const CONCAT_LOCAL_IN_PROGRESS = new Set ();
function goConcatDeclaredStringLocal (goTranspiler, node) {
    let declaration;
    try {
        declaration = goTranspiler.getChecker ().getSymbolAtLocation (node)?.valueDeclaration;
    } catch (e) {
        return false;
    }
    const initializer = declaration?.initializer;
    if ((declaration?.kind !== ts.SyntaxKind.VariableDeclaration) || (declaration.name?.kind !== ts.SyntaxKind.Identifier)
        || (initializer?.kind !== ts.SyntaxKind.BinaryExpression) || (initializer.operatorToken?.kind !== ts.SyntaxKind.PlusToken)
        || (declaration.parent?.parent?.kind !== ts.SyntaxKind.FirstStatement) || CONCAT_LOCAL_IN_PROGRESS.has (declaration)
        || (typeof goTranspiler.goLocalIsSafeToType !== 'function') || (typeof goTranspiler.goTypeNameIsShadowed !== 'function')) {
        return false;
    }
    CONCAT_LOCAL_IN_PROGRESS.add (declaration);
    try {
        const leaves = goNativeConcatLeaves (initializer);
        const hasProof = leaves.some ((leaf) => goStringOperand (goTranspiler, leaf));
        if (leaves.some ((leaf) => (leaf.kind === ts.SyntaxKind.ParenthesizedExpression)
            || !(goStringOperand (goTranspiler, leaf) || goPrinterDerefStringOperand (goTranspiler, leaf, hasProof)))) {
            return false;
        }
        const printed = goTranspiler.printNode (initializer, 0);
        const addShape = printed === ('Add(' + goTranspiler.printNode (initializer.left, 0) + ', ' + goTranspiler.printNode (initializer.right, 0) + ')');
        if (!addShape && goPrintedTextHasBareAddCall (printed)) {
            return false;
        }
        const scope = goTranspiler.goEnclosingFunction (declaration);
        return (scope !== undefined) && !goNativeConcatVetoed (goTranspiler, declaration, declaration.name.escapedText)
            && !goTranspiler.goTypeNameIsShadowed (scope, 'string')
            && goTranspiler.goLocalIsSafeToType (scope, declaration, declaration.name.escapedText, 'string');
    } finally {
        CONCAT_LOCAL_IN_PROGRESS.delete (declaration);
    }
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

// true when the printer printed `Add(` / `ccxt.Add(` at the TOP LEVEL of `text`, i.e.
// it did not concatenate this `+` expression natively. An `Add(` inside parentheses
// (an argument of a string-returning call) or inside a string literal does not count.
function goPrintedTextHasBareAddCall (text) {
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        const character = text[i];
        if (character === '"') {
            i += 1;
            while ((i < text.length) && (text[i] !== '"')) {
                i += (text[i] === '\\') ? 2 : 1;
            }
            continue;
        }
        if ((character === '(') || (character === '[') || (character === '{')) {
            depth += 1;
        } else if ((character === ')') || (character === ']') || (character === '}')) {
            depth -= 1;
        } else if ((depth === 0) && text.startsWith ('Add(', i)) {
            return true;
        }
    }
    return false;
}

// the leaves of a `+` tree, left to right (a nested `+` is flattened: the printer
// prints `this.Id + " " + *errorText` as one native chain)
function goNativeConcatLeaves (node) {
    if ((node?.kind === ts.SyntaxKind.BinaryExpression) && (node.operatorToken?.kind === ts.SyntaxKind.PlusToken)) {
        return goNativeConcatLeaves (node.left).concat (goNativeConcatLeaves (node.right));
    }
    return [ node ];
}

// a leaf whose printed text is a deref the printer emitted itself (`*baseCurr`,
// `*this.SafeString(market, "baseId", "")`): the deref is a Go string when the pointer is
// a `*string` or when the chain carries another positively proven Go string leaf.
function goPrinterDerefStringOperand (goTranspiler, node, chainHasStringProof) {
    if ((node?.kind !== ts.SyntaxKind.Identifier) && (node?.kind !== ts.SyntaxKind.CallExpression)) {
        return false;
    }
    const printed = (goTranspiler.printNode (node, 0) ?? '').trim ();
    if (!printed.startsWith ('*') || printed.startsWith ('**')) {
        return false;
    }
    const target = printed.substring (1).trim ();
    const isWholeTarget = /^[A-Za-z_]\w*$/.test (target)
        || ((typeof goTranspiler.isWholePrintedCall === 'function') && goTranspiler.isWholePrintedCall (target, 0));
    if (!isWholeTarget) {
        return false;
    }
    let targetType;
    try {
        targetType = (node.kind === ts.SyntaxKind.Identifier)
            ? ((typeof goTranspiler.goDeclaredTypeOfIdentifier === 'function')
                ? goTranspiler.goDeclaredTypeOfIdentifier (node)
                : undefined)
            : goTranspiler.goTypeOfInitializer (node, target);
    } catch (e) {
        targetType = undefined;
    }
    return (targetType === '*string') || chainHasStringProof;
}

// the `+` chain the printer already concatenated natively, or undefined: a natively
// printed chain is a Go expression whose `+` binds, so the declaration may only say
// `string` when every leaf is provably a non-nil Go string.
function goNativeConcatInitializer (goTranspiler, node, declaration) {
    const initializer = declaration?.initializer;
    if (initializer?.kind !== ts.SyntaxKind.BinaryExpression
        || initializer.operatorToken?.kind !== ts.SyntaxKind.PlusToken) {
        return undefined;
    }
    if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    // the same statement-level guard goTypedConcatInitializer applies: a `for`
    // initializer prints as `x := ...`, there is nothing to declare
    if (node?.parent?.kind !== ts.SyntaxKind.FirstStatement) {
        return undefined;
    }
    const nameText = goTranspiler.printNode (declaration.name, 0);
    if (goPrintedTextHasBareAddCall (goTranspiler.printNode (initializer, 0))) {
        return undefined; // the `Add(...)` shape: `goTypedConcatInitializer` below owns it
    }
    const leaves = goNativeConcatLeaves (initializer);
    if (leaves.length < 2) {
        return undefined;
    }
    const chainHasStringProof = leaves.some ((leaf) => goStringOperand (goTranspiler, leaf));
    const allLeavesProvenString = leaves.every ((leaf) => goStringOperand (goTranspiler, leaf)
        || goPrinterDerefStringOperand (goTranspiler, leaf, chainHasStringProof));
    if (!allLeavesProvenString) {
        concatDebugLog ('native-leaf-reject', node, nameText,
            leaves.map ((leaf) => (ts.SyntaxKind[leaf.kind] ?? '?')).join (','), '');
        return undefined;
    }
    if (goNativeConcatVetoed (goTranspiler, declaration, declaration.name.escapedText)) {
        concatDebugLog ('native-veto', node, nameText, 'read-or-write', '');
        return undefined;
    }
    return initializer;
}

// a local this shape would declare `string` may not be compared to nil (`x == nil`
// not compile against a Go string) and may not be rewritten later, so any later write,
// nil comparison, `++` or member/element read keeps the declaration `any`.
function goNativeConcatVetoed (goTranspiler, declaration, varName) {
    if (typeof goTranspiler.goEnclosingFunction !== 'function') {
        return true; // no scope to scan: never answer a type
    }
    const scope = goTranspiler.goEnclosingFunction (declaration);
    if (scope === undefined) {
        return true;
    }
    let vetoed = false;
    const visit = (n) => {
        if (vetoed) {
            return;
        }
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.escapedText === varName) && (n !== declaration.name)) {
            const parent = n.parent;
            if (parent !== undefined) {
                if ((parent.kind === ts.SyntaxKind.BinaryExpression) && (parent.left === n)
                    && (parent.operatorToken.kind >= ASSIGNMENT_KIND_MIN)
                    && (parent.operatorToken.kind <= ASSIGNMENT_KIND_MAX)) {
                    vetoed = true; // a later write: `x = ...` / `x += ...`
                    return;
                }
                if ((parent.kind === ts.SyntaxKind.BinaryExpression)
                    && ((parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken)
                        || (parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken)
                        || (parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken)
                        || (parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken))
                    && (isNilLiteralExpression (parent.left) || isNilLiteralExpression (parent.right))) {
                    vetoed = true; // `x == nil` / `x != nil` (TS `x === undefined`)
                    return;
                }
                if (((parent.kind === ts.SyntaxKind.PrefixUnaryExpression) || (parent.kind === ts.SyntaxKind.PostfixUnaryExpression))
                    && ((parent.operator === ts.SyntaxKind.PlusPlusToken) || (parent.operator === ts.SyntaxKind.MinusMinusToken))) {
                    vetoed = true; // `x++`
                    return;
                }
                if (((parent.kind === ts.SyntaxKind.PropertyAccessExpression) || (parent.kind === ts.SyntaxKind.ElementAccessExpression))
                    && (parent.expression === n)) {
                    vetoed = true; // `x.key` / `x[i]`: a non-value read the printer may rewrite into a type assertion
                    return;
                }
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return vetoed;
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
        // shape 2: the printer already printed this chain as a native `a + b + c`, so
        // there is nothing to re-print — only the declared type is answered, and the
        // printer's own reject filters still decide whether to use it.
        const nativeConcatenation = goNativeConcatInitializer (goTranspiler, node, declaration);
        if (nativeConcatenation !== undefined) {
            const nativeName = goTranspiler.printNode (declaration.name, 0);
            TYPED_CONCAT_IN_FLIGHT.add (nativeConcatenation);
            let nativePrinted;
            try {
                nativePrinted = upstream (node, identation);
            } finally {
                TYPED_CONCAT_IN_FLIGHT.delete (nativeConcatenation);
            }
            concatDebugLog (nativePrinted.indexOf ('var ' + nativeName + ' string = ') >= 0 ? 'typed-native' : 'native-any',
                node, nativeName, '', '');
            return nativePrinted;
        }
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
            // a nested `+` operand printed as `Add(...)`: emit the flat Go chain
            const leafTexts = goNativeConcatLeaves (concatenation).map ((leaf) => goTranspiler.printNode (leaf, 0));
            if (!leafTexts.some (goPrintedTextHasBareAddCall)) {
                return typedPrefix + leafTexts.join (' + ');
            }
            return iden + 'var ' + nameText + ' any = ' + callText;
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
    'HandleUntilOption',
    'HandleMarginModeAndParams',
    'HandleSubTypeAndParams',
    'HandleNetworkCodeAndParams',
    'HandleWithdrawTagAndParams',
    'HandlePostOnly',
    'HandleParamBool',
    'HandleParamBool2',
    'HandleParamInteger',
    'HandleParamInteger2',
    'HandleTriggerPricesAndParams',
    'HandleTriggerDirectionAndParams',
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
        return retypeAsyncArrayBindingHolder (goTranspiler, node, printed);
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

// `<indent><a><b>Variable := (<-this.XAsync(..))`: a tuple core whose channel carries a []any
const ASYNC_ARRAY_BINDING_HOLDER_RE = /^([ \t]*)([A-Za-z_]\w*Variable) := (\(<-(?:this\.)?([A-Za-z_]\w*)\([^\n]*\)\))\n/;

// the async holder declared []any and received through PanicOnError, like every typed receive
function retypeAsyncArrayBindingHolder (goTranspiler, node, printed) {
    const match = ASYNC_ARRAY_BINDING_HOLDER_RE.exec (printed);
    if ((match === null) || (CCXT_GO_ASYNC_ELEM_TYPES[match[4]] !== '[]any')
        || (CCXT_GO_ASYNC_ELEM_EXCLUDED.indexOf (match[4]) >= 0)) {
        return printed;
    }
    const recv = match[3];
    const bare = recv.replace (/"(?:[^"\\]|\\.)*"/g, '""');
    let depth = 0;
    for (let i = 0; i < bare.length; i++) {
        depth += (bare[i] === '(') ? 1 : ((bare[i] === ')') ? -1 : 0);
        if ((depth === 0) && (i < bare.length - 1)) {
            return printed;                     // the outer parens do not span the receive
        }
    }
    if ((depth !== 0) || (printed.indexOf ('GetValue(' + match[2] + ',') < 0)) {
        return printed;
    }
    const scope = (typeof goTranspiler.goEnclosingFunction === 'function') ? goTranspiler.goEnclosingFunction (node) : undefined;
    if ((typeof goTranspiler.goTypeNameIsShadowed === 'function') && goTranspiler.goTypeNameIsShadowed (scope, '[]any')) {
        return printed;
    }
    return match[1] + 'var ' + match[2] + ' []any = ListTyped(PanicOnError(' + recv + '))\n' + printed.slice (match[0].length);
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
    const annotated = ccxtGoAnnotatedMethodReturnType (goTranspiler, node);
    if (annotated !== undefined) {
        return annotated;
    }
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
    if ((typeof name !== 'string') || !CCXT_GO_PARSE_METHOD.test (name)) {
        return undefined; // D-02: the internal parse* family is the one with native returns
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
// D-02 — native return types for internal parse* methods (annotation-driven)
//
// Batch C annotated the internal `parseX (..): Str/Dict/List/Bool/number`
// methods in ts/src. Their emitted Go body already builds one concrete value on
// every return path — a *string from the Safe* layer, a map[string]any literal,
// another generated parse* method's result — but the signature stays `any`, so
// every caller's `var x any = this.ParseX (..)` keeps its box and none of the
// printer's typed-local readers can fire. This rule reads the DECLARED
// annotation off the checker and prints the native Go signature (and, through
// the same predicate, the callers' locals) only when every return statement of
// the emitted body provably produces that same type.
//
// Fail-closed conditions, each keeping the emitted `any` signature:
//   * not a non-async method with a block body, or not named parse*;
//   * an override / abstract-base member (goMethodKeepsBaseSignature): the
//     generated base classes and derived exchanges compile against it (D8);
//   * the name is listed on one of the go/v4 interface files: every generated
//     constructor assigns `this.Exchange.DerivedExchange = this`, so the
//     IDerivedExchange / IBaseExchange member signatures must match exactly;
//   * a bare `return;`, a return path whose printed value the printer cannot
//     name (Ternary / GetValue / SafeDict / an `any` local / ...), or a mix of
//     a literal path and a pointer path — one signature cannot hold both.
const CCXT_GO_ANNOTATED_RETURN_NATIVE = {
    'Str': [ '*string', 'string' ],
    'Dict': [ 'map[string]any' ],
    'List': [ '[]any' ],
    'Bool': [ 'bool' ],
    'number': [ 'float64' ],
};
const CCXT_GO_PARSE_METHOD = /^parse[A-Za-z0-9]*$/;
const CCXT_GO_RESERVED_METHOD_CACHE = new Map ();
const CCXT_GO_RETURN_TYPE_IN_PROGRESS = new Set ();
const CCXT_GO_RETURN_TYPE_CACHE = new Map ();

// every method name declared on the interface files of this repo root. A
// `*BaseExchange`-receiver method is not enough: the generated constructor's
// `this.Exchange.DerivedExchange = this` assertion compares the whole method
// set, so ANY listed name has to keep the emitted signature byte-identical.
// In-memory sources (unit tests) have no tree: the set is empty there.
function ccxtGoReservedMethodNames (node) {
    const fileName = node?.getSourceFile?. ()?.fileName;
    if (typeof fileName !== 'string') {
        return undefined;
    }
    const marker = '/ts/src/';
    const at = fileName.lastIndexOf (marker);
    if (at < 0) {
        return undefined;
    }
    const root = fileName.substring (0, at);
    if (CCXT_GO_RESERVED_METHOD_CACHE.has (root)) {
        return CCXT_GO_RESERVED_METHOD_CACHE.get (root);
    }
    const names = new Set ();
    const files = [
        'go/v4/exchange_interface.go',
        'go/v4/exchange_typed_interface.go',
        'go/v4/pro/exchange_interface.go',
        'go/v4/pro/exchange_typed_interface.go',
    ];
    for (const relative of files) {
        let text;
        try {
            text = fs.readFileSync (path.join (root, relative), 'utf8');
        } catch (e) {
            continue;
        }
        for (const line of text.split ('\n')) {
            const match = /^\t([A-Za-z_]\w*)\s*\(/.exec (line);
            if (match !== null) {
                names.add (match[1]);
            }
        }
    }
    CCXT_GO_RESERVED_METHOD_CACHE.set (root, names);
    return names;
}

// the native Go type(s) a declared return annotation may print, or undefined.
// The alias is read off the checker — never from the method name — so `Str`
// (string | undefined) and `Bool` (boolean | undefined) are told apart from a
// same-shaped local union, and `Dict`/`List` keep their container mapping.
function ccxtGoAnnotatedReturnTypes (goTranspiler, node) {
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration) {
        return undefined;
    }
    let type;
    try {
        const checker = goTranspiler.getChecker ();
        type = checker.getReturnTypeOfSignature (checker.getSignatureFromDeclaration (node));
    } catch (e) {
        return undefined;
    }
    const alias = type?.aliasSymbol?.escapedName;
    const annotation = (node.type !== undefined) ? node.type.getText () : undefined;
    const key = (typeof alias === 'string') ? alias : annotation;
    if ((key === 'Str') || (key === 'Dict') || (key === 'List') || (key === 'Bool')) {
        return CCXT_GO_ANNOTATED_RETURN_NATIVE[key];
    }
    // `number` is a builtin: no alias to read, so the annotation text and the
    // checker's own Number flag have to agree
    if ((key === 'number') && (type !== undefined) && ((type.flags & ts.TypeFlags.Number) !== 0)) {
        return CCXT_GO_ANNOTATED_RETURN_NATIVE['number'];
    }
    return undefined;
}

// the concrete Go type one printed return expression produces, or undefined
// when the printer cannot name it (Ternary / GetValue / SafeDict / Add / ...)
function ccxtGoReturnExpressionType (goTranspiler, expression) {
    if (expression.kind === ts.SyntaxKind.Identifier) {
        // a local the printer typed itself, or a parameter B-02 proved
        return goTranspiler.goDeclaredTypeOfIdentifier (expression);
    }
    if (ts.isNumericLiteral (expression)) {
        return 'float64'; // an untyped Go constant, assignable to float64
    }
    if (isSafeStringCall (expression)) {
        return CCXT_GO_FAMILY_RETURN_TYPE;
    }
    let printed;
    try {
        printed = goTranspiler.printNode (expression, 0);
    } catch (e) {
        return undefined;
    }
    return goTranspiler.goTypeOfInitializer (expression, printed);
}

function ccxtGoProveReturnPaths (goTranspiler, node, allowed) {
    const goTypeIsNilable = (goType) => (goType.charAt (0) === '*') || (goType === 'map[string]any') || (goType === '[]any');
    const returns = collectReturnStatements (node.body);
    if (returns.length === 0) {
        return undefined; // no return path to prove → leave the signature alone
    }
    let valueType;
    let sawAbsent = false;
    for (const statement of returns) {
        const expression = statement.expression;
        if (expression === undefined) {
            return undefined; // bare `return;` prints a bare `return`, not a typed value
        }
        if (isAbsentExpression (expression)) {
            if (!allowed.some (goTypeIsNilable)) {
                return undefined; // TS `undefined` → Go nil, only a nilable type holds it
            }
            sawAbsent = true;
            continue;
        }
        const goType = ccxtGoReturnExpressionType (goTranspiler, expression);
        if ((typeof goType !== 'string') || (allowed.indexOf (goType) < 0)) {
            return undefined;
        }
        if (valueType === undefined) {
            valueType = goType;
        } else if (valueType !== goType) {
            return undefined; // one signature cannot hold two printed types
        }
    }
    if (valueType === undefined) {
        return allowed.find (goTypeIsNilable); // every path absent → the nil value type
    }
    if (sawAbsent && !goTypeIsNilable (valueType)) {
        return undefined; // a nil path and a literal path cannot share a plain value type
    }
    return valueType;
}

function ccxtGoAnnotatedMethodReturnType (goTranspiler, node) {
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration) {
        return undefined;
    }
    const name = node.name?.escapedText;
    if ((typeof name !== 'string') || !CCXT_GO_PARSE_METHOD.test (name)) {
        return undefined;
    }
    if (node.body?.kind !== ts.SyntaxKind.Block) {
        return undefined;
    }
    if ((typeof goTranspiler.isAsyncFunction === 'function') && goTranspiler.isAsyncFunction (node)) {
        return undefined; // channel-returning: the printer owns that signature
    }
    if ((typeof goTranspiler.goMethodKeepsBaseSignature === 'function') && goTranspiler.goMethodKeepsBaseSignature (node)) {
        return undefined;
    }
    if (CCXT_GO_RETURN_TYPE_IN_PROGRESS.has (node)) {
        return undefined; // a recursive parse* chain: fail closed, never cache
    }
    const reserved = ccxtGoReservedMethodNames (node);
    if ((reserved !== undefined) && (reserved.has (name) || reserved.has (name.charAt (0).toUpperCase () + name.slice (1)))) {
        return undefined; // the interface files list the emitted (capitalised) Go name
    }
    const allowed = ccxtGoAnnotatedReturnTypes (goTranspiler, node);
    if (allowed === undefined) {
        return undefined;
    }
    if (CCXT_GO_RETURN_TYPE_CACHE.has (node)) {
        return CCXT_GO_RETURN_TYPE_CACHE.get (node);
    }
    CCXT_GO_RETURN_TYPE_IN_PROGRESS.add (node);
    let result;
    try {
        result = ccxtGoProveReturnPaths (goTranspiler, node, allowed);
    } finally {
        CCXT_GO_RETURN_TYPE_IN_PROGRESS.delete (node);
    }
    CCXT_GO_RETURN_TYPE_CACHE.set (node, result);
    return result;
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
const NIL_DECLARED_SCALAR_POINTER_TYPES = [ '*int64', '*float64', '*bool', '*string' ];

const NIL_DECLARED_SAFE_ARG_CALLEES = [ 'this.Iso8601', 'this.NumberToString', 'this.ParseOrderBook', 'this.CreateCcxtTradeId' ];

// callee -> argument slots that derefScalar at entry and never hand the argument back
// (ParseNumber returns its second argument bare; StringDiv forwards its precision)
const NIL_DECLARED_SAFE_ARG_SLOTS = {
    'this.ParseNumber': 1, 'this.Parse8601': 1,
    ...Object.fromEntries ([ 'Mul', 'Div', 'Sub', 'Add', 'Or', 'Max', 'Min', 'Abs', 'Neg', 'Mod', 'Gt', 'Ge', 'Lt', 'Le', 'Eq', 'Equals' ]
        .map ((op) => [ 'Precise.String' + op, 2 ])),
};

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
        if ((callee !== undefined) && (parent.arguments.indexOf (node) < (NIL_DECLARED_SAFE_ARG_SLOTS[callee] ?? 0))) {
            return true;
        }
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

// --------------------- write-site typing: `x = <dictionary producer>(…)` -------------------------
// A dictionary-annotated local can be declared typed while every later self-assignment carries that
// Go type; the producers below return a dictionary through an `any` signature.
export const CCXT_GO_WRITESITE_CONVERSIONS = {
    'this.SafeMarket': { 'map[string]any': 'MapTyped' },
    'this.SafeCurrency': { 'map[string]any': 'MapTyped' },
    'this.Omit': { 'map[string]any': 'MapTyped' },
    'this.OmitN': { 'map[string]any': 'MapTyped' },
    'this.OmitMap': { 'map[string]any': 'MapTyped' },
};

// the printed callee of a whole call node (`this.Omit`), undefined for every other shape; the
// `exchange.<name>` spelling is the same method on the same receiver
function ccxtGoWriteSiteCallee (goTranspiler, node) {
    if ((node?.kind !== ts.SyntaxKind.CallExpression) || (typeof goTranspiler.printNode !== 'function')) {
        return undefined;
    }
    const printed = (goTranspiler.printNode (node.expression, 0) ?? '').trim ();
    if (!/^[A-Za-z_][\w.]*$/.test (printed)) {
        return undefined;
    }
    return printed.startsWith ('exchange.') ? ('this.' + printed.substring (9)) : printed;
}

// an integer literal, or Math.min/Math.max over integer literals and plain identifiers whose
// value is already an integer box or *int64 (both deref'd by mathMin/mathMax); Int64PtrTyped
// then stores the same integer behind a pointer
function ccxtGoWriteSiteIsIntegerProducer (right) {
    const isIntLiteral = (n) => (n?.kind === ts.SyntaxKind.NumericLiteral) && /^[0-9]+$/.test (n.text);
    if (isIntLiteral (right)) {
        return true;
    }
    const callee = right?.expression;
    if ((right?.kind !== ts.SyntaxKind.CallExpression) || (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression)
        || (callee.expression?.escapedText !== 'Math') || !['min', 'max'].includes (callee.name?.escapedText)) {
        return false;
    }
    const left = right.parent?.left;
    return (right.arguments.length === 2) && right.arguments.every ((a) => isIntLiteral (a)
        || ((a.kind === ts.SyntaxKind.Identifier) && (left?.kind === ts.SyntaxKind.Identifier) && (a.escapedText === left.escapedText)));
}

// the write-site conversion admitted for a declared Go type, or undefined when the right-hand
// side is not a whole admitted producer call
function ccxtGoWriteSiteConversion (goTranspiler, goType, right) {
    if ((goType === '*int64') && ccxtGoWriteSiteIsIntegerProducer (right)) {
        return 'Int64PtrTyped';
    }
    const callee = ccxtGoWriteSiteCallee (goTranspiler, right);
    if (callee === undefined) {
        return undefined;
    }
    const admitted = CCXT_GO_WRITESITE_CONVERSIONS[callee];
    return (admitted === undefined) ? undefined : admitted[goType];
}

// the declaration a name resolves to (checker symbol), or undefined
function ccxtGoParamDeclarationOf (goTranspiler, n) {
    try {
        return goTranspiler.getChecker ().getSymbolAtLocation (n)?.valueDeclaration;
    } catch (e) {
        return undefined;
    }
}

// the veto cases of the shipped goLocalIsSafeToType, re-stated for the re-check below
function ccxtGoWriteSiteShippedVeto (goTranspiler, n, parent, goType) {
    if ((parent?.kind === ts.SyntaxKind.PropertyAccessExpression) && (parent.expression === n)
    && (parent.name?.escapedText === 'push')) {
        return (goType !== '[]any') || !goTranspiler.goIsNativeAppendShape (n, parent.parent);
    }
    if ((parent?.kind === ts.SyntaxKind.VariableDeclaration) && (parent.name === n)) {
        return false; // a sibling block-scoped declaration; it gets its own type
    }
    if ((parent?.kind === ts.SyntaxKind.PostfixUnaryExpression) || (parent?.kind === ts.SyntaxKind.PrefixUnaryExpression)) {
        const op = parent.operator;
        if ((op === ts.SyntaxKind.PlusPlusToken) || (op === ts.SyntaxKind.MinusMinusToken)) {
            return true;
        }
    }
    if (parent?.kind === ts.SyntaxKind.SpreadElement) {
        return true;
    }
    if ((parent?.kind === ts.SyntaxKind.ArrayLiteralExpression)
    && (parent.parent?.kind === ts.SyntaxKind.BinaryExpression)
    && (parent.parent.left === parent)
    && (parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
        // `[x, params] = f()` prints a MapTyped element read only for a GetArg-bound Dict parameter
        const index = parent.elements.indexOf (n);
        if ((goType === 'map[string]any') && (typeof goTranspiler.goGetArgTupleWriteIsDict === 'function')) {
            const decl = ccxtGoParamDeclarationOf (goTranspiler, n);
            return !goTranspiler.goGetArgTupleWriteIsDict (decl, parent.parent.right, index);
        }
        return !((goType === 'map[string]any') && (typeof goTranspiler.goGetArgBindsDictElement === 'function')
            && goTranspiler.goGetArgBindsDictElement (n, parent.parent.right, index));
    }
    if ((parent?.kind === ts.SyntaxKind.BinaryExpression) && (parent.left === n)) {
        const op = parent.operatorToken.kind;
        if ((op >= ts.SyntaxKind.FirstCompoundAssignment) && (op <= ts.SyntaxKind.LastCompoundAssignment)) {
            return true;
        }
    }
    return false;
}

// reads that tell an absent box from an empty map (AddElementToObject panics on a nil map)
const CCXT_GO_WRITESITE_NIL_OBSERVING_READS = { 'deepExtend': 1, 'keys': 0, 'addElementToObject': 0 };

function ccxtGoWriteSiteReadObservesNil (call, n) {
    const callee = call.expression;
    const name = callee?.name?.escapedText ?? callee?.escapedText;
    const index = CCXT_GO_WRITESITE_NIL_OBSERVING_READS[name];
    return (index !== undefined) && (call.arguments?.[index] === n);
}

// the shipped veto refuses a local because a later assignment does not name the same Go type; the
// write-site family carries that type instead, so a vetoing use is admitted only when it is a
// convertible `x = <producer>(…)`. Any other vetoing use keeps the local's box.
function ccxtGoWriteSiteVetoesAreConvertible (goTranspiler, scope, declaration, varName, goType) {
    if ((scope === undefined) || (declaration?.kind !== ts.SyntaxKind.Parameter)) {
        return false; // the optional-argument locals only
    }
    if ((typeof goTranspiler.hasNodeWhere !== 'function') || (typeof goTranspiler.goTypeOfInitializer !== 'function')
        || (typeof goTranspiler.printNode !== 'function')) {
        return false;
    }
    let convertible = 0;
    const unsafe = goTranspiler.hasNodeWhere (scope, (n) => {
        if ((n.kind !== ts.SyntaxKind.Identifier) || (n.escapedText !== varName) || (n === declaration.name)) {
            return false;
        }
        const parent = n.parent;
        if ((parent?.kind === ts.SyntaxKind.BinaryExpression) && (parent.left === n)
        && (parent.operatorToken?.kind === ts.SyntaxKind.EqualsToken)) {
            if (goTranspiler.goTypeOfInitializer (parent.right, goTranspiler.printNode (parent.right, 0)) === goType) {
                return false; // the printer's own proof already accepts this write
            }
            if (ccxtGoWriteSiteConversion (goTranspiler, goType, parent.right) !== undefined) {
                convertible += 1;
                return false;
            }
            return true;
        }
        if ((parent?.kind === ts.SyntaxKind.CallExpression) && ccxtGoWriteSiteReadObservesNil (parent, n)) {
            return true;
        }
        return ccxtGoWriteSiteShippedVeto (goTranspiler, n, parent, goType);
    });
    return (!unsafe) && (convertible > 0);
}

// the Go type the value half reads back for an assignment target: a local the printer already
// typed, or an optional parameter whose own binding is declared with that type
function ccxtGoWriteSiteLocalGoType (goTranspiler, node) {
    if (typeof goTranspiler.goDeclaredTypeOfIdentifier === 'function') {
        const declared = goTranspiler.goDeclaredTypeOfIdentifier (node);
        if (declared !== undefined) {
            return declared;
        }
    }
    if ((typeof goTranspiler.goGetArgLocalType !== 'function') || (typeof goTranspiler.goEnclosingFunction !== 'function')
        || (typeof goTranspiler.printNode !== 'function') || (typeof goTranspiler.getChecker !== 'function')) {
        return undefined;
    }
    let param;
    try {
        param = goTranspiler.getChecker ().getSymbolAtLocation (node)?.valueDeclaration;
    } catch (e) {
        param = undefined;
    }
    if ((param?.kind !== ts.SyntaxKind.Parameter) || (param.initializer === undefined)) {
        return undefined;
    }
    const body = goTranspiler.goEnclosingFunction (param);
    if (body === undefined) {
        return undefined;
    }
    return goTranspiler.goGetArgLocalType (body, param, goTranspiler.printNode (param.initializer, 0));
}

// the printed statement of a `x = <producer>(…)` the write-site family converts, or undefined.
// Fail closed on an assignment another custom-operator rule owns.
function ccxtGoWriteSiteAssignment (goTranspiler, node, identation) {
    if ((node?.operatorToken?.kind !== ts.SyntaxKind.EqualsToken) || (node.left?.kind !== ts.SyntaxKind.Identifier)) {
        return undefined;
    }
    const goType = ccxtGoWriteSiteLocalGoType (goTranspiler, node.left);
    if (goType === undefined) {
        return undefined;
    }
    const conversion = ccxtGoWriteSiteConversion (goTranspiler, goType, node.right);
    if (conversion === undefined) {
        return undefined;
    }
    if ((typeof goTranspiler.getCustomOperatorIfAny === 'function')
        && (goTranspiler.getCustomOperatorIfAny (node.left, node.right, node.operatorToken) !== undefined)) {
        return undefined;
    }
    const leftVar = goTranspiler.printNode (node.left, 0);
    const rightVar = goTranspiler.printNode (node.right, identation);
    const separator = (typeof goTranspiler.goBinarySeparator === 'function')
        ? goTranspiler.goBinarySeparator ('=', rightVar.trim (), node.left, node.right)
        : ' ';
    return leftVar + separator + '=' + separator + conversion + '(' + rightVar.trim () + ')';
}

// the type half (a later convertible assignment does not veto the local) and the value half (the
// assignment text) are installed together, so the two can never disagree
function installCcxtGoWriteSiteConversions (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoWriteSiteConversionsInstalled) {
        return;
    }
    if ((typeof goTranspiler.goLocalIsSafeToType !== 'function') || (typeof goTranspiler.printBinaryExpression !== 'function')
        || (typeof goTranspiler.goTypeOfInitializer !== 'function')) {
        return; // older printer without the local typing: nothing to extend
    }
    const shippedIsSafe = goTranspiler.goLocalIsSafeToType;
    goTranspiler.goLocalIsSafeToType = function (scope, declaration, varName, goType) {
        if (shippedIsSafe.call (this, scope, declaration, varName, goType)) {
            return true;
        }
        return ccxtGoWriteSiteVetoesAreConvertible (this, scope, declaration, varName, goType);
    };
    const shippedBinary = goTranspiler.printBinaryExpression;
    goTranspiler.printBinaryExpression = function (node, identation) {
        const assignment = ccxtGoWriteSiteAssignment (this, node, identation);
        if (assignment !== undefined) {
            return assignment;
        }
        return shippedBinary.call (this, node, identation);
    };
    goTranspiler.__ccxtGoWriteSiteConversionsInstalled = true;
}

// --------------------- printer ternary-IIFE locals: name the scalar join type ---------------------
// `var x any = func() any { … }()` keeps its body, its call position and its boxed value; only the
// declaration head learns the type every arm already produces. Anything unproven keeps `any`.
const CCXT_GO_CLOSURE_POINTER_JOIN_TYPES = [ '*string', '*int64', '*float64', '*bool' ];

// Scalar joins admitted for the pointer case: the types `derefScalar` and `IsEqual` treat as
// transparent, so a typed nil pointer reads exactly like the untyped nil it replaces. A
// container join is rejected — `derefScalar` cannot unwrap a nil map or slice.
const CCXT_GO_CLOSURE_VALUE_JOIN_TYPES = [ 'string', 'int64' ];

const CCXT_GO_CLOSURE_HEAD = /^([ \t]*)var ([A-Za-z_]\w*) any = func\(\) any \{$/;

// the two arm texts and the untouched tail of a printed ternary literal, or undefined when the
// text is not that template (a multi-line arm, a nested literal or a condition carrying a
// newline all fail here — the printer lays them out differently)
function ccxtGoClosureLiteralLines (printed) {
    const lines = printed.split ('\n');
    if (lines.length !== 6) {
        return undefined;
    }
    const match = CCXT_GO_CLOSURE_HEAD.exec (lines[0]);
    if (match === null) {
        return undefined;
    }
    const indent = match[1];
    const body = indent + '\t';
    if ((lines[5] !== indent + '}()')
        || !lines[1].startsWith (body + 'if ') || !lines[1].endsWith (' {')
        || !lines[2].startsWith (body + '\treturn ')
        || (lines[3] !== body + '}')
        || !lines[4].startsWith (body + 'return ')) {
        return undefined;
    }
    return {
        indent: indent,
        name: match[2],
        whenTrue: lines[2].substring (body.length + 8),
        whenFalse: lines[4].substring (body.length + 7),
        body: printed.substring (lines[0].length),
    };
}

// `var x any = func() any {` -> `var x *float64 = func() *float64 {`: the two `any` tokens of the
// head line only, the whole printed body is appended unchanged
function ccxtGoClosureRewrite (literal, joinType) {
    return literal.indent + 'var ' + literal.name + ' ' + joinType + ' = func() ' + joinType + ' {' + literal.body;
}

// Value joins need both arms to print the same scalar with no `nil` path: `string` is the
// Urlencode pair and `int64` the ParseToInt/Seconds pair. Dropping `int64` narrows the rule by
// exactly that one site.
function ccxtGoClosureArmType (goTranspiler, armNode, armText) {
    const text = (armText ?? '').trim ();
    if (text === 'nil') {
        return 'nil';
    }
    const open = text.indexOf ('(');
    if ((open > 0) && (typeof goTranspiler.isWholePrintedCall === 'function') && goTranspiler.isWholePrintedCall (text, open)) {
        const callee = text.substring (0, open);
        const known = CCXT_GO_HELPER_RETURN_TYPES[callee];
        if (known !== undefined) {
            return known;
        }
        if (typeof goTranspiler.goTypeOfInitializer === 'function') {
            return goTranspiler.goTypeOfInitializer (armNode, text);
        }
        return undefined;
    }
    if ((armNode?.kind === ts.SyntaxKind.Identifier) && (typeof goTranspiler.goDeclaredTypeOfIdentifier === 'function')) {
        const declared = goTranspiler.goDeclaredTypeOfIdentifier (armNode);
        return (declared === 'any') ? undefined : declared;
    }
    return undefined;
}

// a nil comparison of the local: only the deref-aware IsEqual form is transparent, the printer's
// inlined Go comparison is not (`x == nil` flips for a typed nil pointer, `x == "lit"` would not
// even compile against `*T`) — so the printed text of the comparison decides, not the TS operator
function ccxtGoClosureCompareIsHelper (goTranspiler, parent, name) {
    const printed = (goTranspiler.printNode (parent, 0) ?? '').trim ();
    const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp ('(?<![.\\w*"])' + escaped + '\\s*(?:==|!=)').test (printed)) {
        return false; // the printer inlined a Go comparison of the local
    }
    return new RegExp ('!?(?:ccxt\\.|this\\.)?IsEqual\\([^\\n]*\\b' + escaped + '\\b[^\\n]*\\)').test (printed);
}

// is reading the local through `node` provably transparent for a pointer-typed local? Same shape
// table as nilDeclaredReadIsSafe above, plus the native-comparison rejection this family needs;
// everything the scan cannot classify rejects.
function ccxtGoClosureReadIsSafe (goTranspiler, node, name) {
    let current = node;
    let parent = current.parent;
    while (parent?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = parent;
        parent = current.parent;
    }
    if (parent === undefined) {
        return false;
    }
    // a property name (`obj.x`) or an object-literal key is not a use of the local
    if ((parent.name === node) && (parent.expression !== node) && (parent.initializer !== node)) {
        return true;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.PropertyAccessExpression:
    case ts.SyntaxKind.QualifiedName:
        return parent.name !== node;                 // `x.f` needs a value, not a pointer
    case ts.SyntaxKind.PropertyAssignment:
    case ts.SyntaxKind.BindingElement:
        return parent.name !== node;
    case ts.SyntaxKind.ShorthandPropertyAssignment:
        return true;                                 // `{ x }` prints `"x": x`
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.Parameter:
        return parent.name !== node;                 // a binding, not a use
    case ts.SyntaxKind.VariableDeclaration:
        return false;                                // a re-declaration of the name
    case ts.SyntaxKind.BinaryExpression: {
        const op = parent.operatorToken?.kind;
        if (op === ts.SyntaxKind.EqualsToken) {
            if (parent.left === node) {
                return false;                        // a later write of the local
            }
            // `container[key] = x` / `container.prop = x`: the printer turns the element write
            // into AddElementToObject(container, key, x), which boxes the pointer exactly the way
            // a declaration-initialised `var x *int64 = …` is boxed today
            const target = parent.left;
            if ((target?.kind !== ts.SyntaxKind.ElementAccessExpression) && (target?.kind !== ts.SyntaxKind.PropertyAccessExpression)) {
                return false;
            }
            return (goTranspiler.printNode (parent, 0) ?? '').trim ().startsWith ('AddElementToObject(');
        }
        if (COMPARISON_TOKENS.indexOf (op) >= 0) {
            return ccxtGoClosureCompareIsHelper (goTranspiler, parent, name);
        }
        return false;                                // arithmetic, concatenation, `in`, `&&`, …
    }
    case ts.SyntaxKind.PrefixUnaryExpression:
    case ts.SyntaxKind.PostfixUnaryExpression:
    case ts.SyntaxKind.DeleteExpression:
    case ts.SyntaxKind.SpreadElement:
        return false;                                // `++x`, `!x`, `-x`, `...x`
    case ts.SyntaxKind.CallExpression:
        return parent.expression !== node;           // an argument, not a call of the local
    case ts.SyntaxKind.ReturnStatement:
        return true;                                 // the caller receives the same box
    case ts.SyntaxKind.ArrayLiteralExpression:
        // `[]any{x}` boxes the pointer; `[x, y] = f()` destructures into a write
        return !((parent.parent?.kind === ts.SyntaxKind.BinaryExpression) && (parent.parent.left === parent));
    }
    return false;                                    // rejection by default
}

// the join type to name on this declaration, or undefined when the family's proof does not hold
export function ccxtGoClosureJoinType (goTranspiler, declaration) {
    if (declaration === undefined) {
        return undefined;
    }
    const name = declaration.name;
    if (name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    // only the shape the printer renders as the ternary literal
    const initializer = declaration.initializer;
    if (initializer?.kind !== ts.SyntaxKind.ConditionalExpression) {
        return undefined;
    }
    const varName = name.escapedText;
    const scope = (typeof goTranspiler.goEnclosingFunction === 'function') ? goTranspiler.goEnclosingFunction (declaration) : undefined;
    if (scope === undefined) {
        return undefined;
    }
    const whenTrue = (goTranspiler.printNode (initializer.whenTrue, 0) ?? '').trim ();
    const whenFalse = (goTranspiler.printNode (initializer.whenFalse, 0) ?? '').trim ();
    const whenTrueType = ccxtGoClosureArmType (goTranspiler, initializer.whenTrue, whenTrue);
    const whenFalseType = ccxtGoClosureArmType (goTranspiler, initializer.whenFalse, whenFalse);
    if ((whenTrueType === undefined) || (whenFalseType === undefined)) {
        return undefined;
    }
    const absent = (whenTrueType === 'nil') || (whenFalseType === 'nil');
    const values = (absent ? ((whenTrueType === 'nil') ? [ whenFalseType ] : [ whenTrueType ]) : [ whenTrueType, whenFalseType ]);
    if ((values.length === 0) || (values[0] !== values[values.length - 1])) {
        return undefined;                            // both arms absent, or two different types
    }
    const joinType = values[0];
    if (CCXT_GO_CLOSURE_POINTER_JOIN_TYPES.indexOf (joinType) < 0) {
        // a value type cannot carry the TypeScript `undefined` the literal returns as `nil`
        if (absent || (CCXT_GO_CLOSURE_VALUE_JOIN_TYPES.indexOf (joinType) < 0)) {
            return undefined;
        }
    }
    let unproven = false;
    const visit = (n) => {
        if (unproven) {
            return;
        }
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.escapedText === varName) && (n !== name)) {
            if (!ccxtGoClosureReadIsSafe (goTranspiler, n, varName)) {
                unproven = true;
            }
            return;
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    if (unproven) {
        return undefined;
    }
    if (goTranspiler.goTypeNameIsShadowed (scope, joinType)) {
        return undefined;
    }
    if (!goTranspiler.goLocalIsSafeToType (scope, declaration, varName, joinType)) {
        return undefined;
    }
    return joinType;
}

// printVariableDeclarationList prints the literal before it ever asks for a local type (the
// signature `func() any` is what it renders), so the family is installed as a wrapper on that one
// statement: every other shape the printer produces is returned untouched.
function installCcxtGoClosurePointerJoin (goTranspiler) {
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
        const literal = ccxtGoClosureLiteralLines (printed);
        if ((literal === undefined) || (literal.name !== (goTranspiler.printNode (declaration.name) ?? '').trim ())) {
            return printed;
        }
        const joinType = ccxtGoClosureJoinType (goTranspiler, declaration);
        if (joinType === undefined) {
            return printed;
        }
        const whenTrue = (declaration.initializer.whenTrue === undefined) ? undefined
            : (goTranspiler.printNode (declaration.initializer.whenTrue, 0) ?? '').trim ();
        const whenFalse = (goTranspiler.printNode (declaration.initializer.whenFalse, 0) ?? '').trim ();
        // the emitted arms are the ones the proof typed: never rewrite a statement whose body
        // came from another node
        if ((whenTrue !== literal.whenTrue) || (whenFalse !== literal.whenFalse)) {
            return printed;
        }
        return ccxtGoClosureRewrite (literal, joinType);
    };
}

// `p === undefined ? <lit> : p` over a declared scalar pointer never yields nil, so the literal
// returns the value: `var x int64 = func() int64 { if p == nil { return 0 }; return *p }()`.
const CCXT_GO_CLOSURE_DEFAULT_VALUE_TYPES = { '*string': 'string', '*int64': 'int64', '*float64': 'float64' };

function ccxtGoClosureDefaultLiteralFits (pointerType, node) {
    if (pointerType === '*string') {
        return (node?.kind === ts.SyntaxKind.StringLiteral) || (node?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
    }
    if (node?.kind !== ts.SyntaxKind.NumericLiteral) {
        return false;
    }
    return (pointerType === '*float64') ? /^[0-9]+(\.[0-9]+)?$/.test (node.text) : /^[0-9]+$/.test (node.text);
}

function ccxtGoUnwrapParens (node) {
    while (node?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        node = node.expression;
    }
    return node;
}

// { pointerName, pointerIsTrueArm, valueType } for the defaulted-pointer ternary, else undefined
export function ccxtGoClosureDefaultShape (goTranspiler, declaration) {
    const initializer = declaration?.initializer;
    if ((declaration?.name?.kind !== ts.SyntaxKind.Identifier) || (initializer?.kind !== ts.SyntaxKind.ConditionalExpression)) {
        return undefined;
    }
    const condition = ccxtGoUnwrapParens (initializer.condition);
    if ((condition?.kind !== ts.SyntaxKind.BinaryExpression) || (COMPARISON_TOKENS.indexOf (condition.operatorToken?.kind) < 0)
            || !isUndefinedLiteral (condition.right) || (condition.left?.kind !== ts.SyntaxKind.Identifier)) {
        return undefined;
    }
    const negated = (condition.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken)
        || (condition.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken);
    const pointerArm = ccxtGoUnwrapParens (negated ? initializer.whenTrue : initializer.whenFalse);
    const defaultArm = ccxtGoUnwrapParens (negated ? initializer.whenFalse : initializer.whenTrue);
    const pointer = condition.left;
    if ((pointerArm?.kind !== ts.SyntaxKind.Identifier) || (pointerArm.escapedText !== pointer.escapedText)
            || (pointer.escapedText === declaration.name.escapedText)) {
        return undefined;
    }
    const checker = goTranspiler.getChecker ();
    if (checker.getSymbolAtLocation (pointerArm) !== checker.getSymbolAtLocation (pointer)) {
        return undefined;
    }
    const pointerType = goTranspiler.goDeclaredTypeOfIdentifier (pointer);
    const valueType = CCXT_GO_CLOSURE_DEFAULT_VALUE_TYPES[pointerType];
    if ((valueType === undefined) || !ccxtGoClosureDefaultLiteralFits (pointerType, defaultArm)) {
        return undefined;
    }
    return { pointerName: (goTranspiler.printNode (pointer, 0) ?? '').trim (), pointerIsTrueArm: negated, valueType: valueType };
}

// every later read of the local must be a position the pointer box was already transparent in
// (the Closure pointer-join read table); writes, native comparisons and anything unknown reject
function ccxtGoClosureDefaultReadsAreSafe (goTranspiler, declaration, valueType) {
    const scope = goTranspiler.goEnclosingFunction (declaration);
    if (scope === undefined) {
        return false;
    }
    const name = declaration.name;
    const varName = name.escapedText;
    let unproven = false;
    const visit = (n) => {
        if (unproven) {
            return;
        }
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.escapedText === varName) && (n !== name)) {
            unproven = !ccxtGoClosureReadIsSafe (goTranspiler, n, varName);
            return;
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return !unproven && !goTranspiler.goTypeNameIsShadowed (scope, valueType)
        && goTranspiler.goLocalIsSafeToType (scope, declaration, varName, valueType);
}

function installCcxtGoClosureDefaultValue (goTranspiler) {
    if ((typeof goTranspiler.printVariableDeclarationList !== 'function') || (typeof goTranspiler.goDeclaredTypeOfIdentifier !== 'function')
            || goTranspiler.__ccxtGoClosureDefaultValueInstalled) {
        return;
    }
    const upstream = goTranspiler.printVariableDeclarationList.bind (goTranspiler);
    goTranspiler.printVariableDeclarationList = function (node, identation) {
        const printed = upstream (node, identation);
        if ((typeof printed !== 'string') || (node?.declarations?.length !== 1)) {
            return printed;
        }
        const declaration = node.declarations[0];
        const literal = ccxtGoClosureLiteralLines (printed);
        if ((literal === undefined) || (literal.name !== (goTranspiler.printNode (declaration.name) ?? '').trim ())) {
            return printed;
        }
        const shape = ccxtGoClosureDefaultShape (goTranspiler, declaration);
        if (shape === undefined) {
            return printed;
        }
        const lines = printed.split ('\n');
        const body = literal.indent + '\t';
        const pointerLine = shape.pointerIsTrueArm ? 2 : 4;
        const expectedCondition = body + 'if ' + shape.pointerName + (shape.pointerIsTrueArm ? ' != nil {' : ' == nil {');
        const expectedReturn = (shape.pointerIsTrueArm ? body + '\t' : body) + 'return ' + shape.pointerName;
        if ((lines[1] !== expectedCondition) || (lines[pointerLine] !== expectedReturn)
                || !ccxtGoClosureDefaultReadsAreSafe (goTranspiler, declaration, shape.valueType)) {
            return printed;
        }
        lines[0] = literal.indent + 'var ' + literal.name + ' ' + shape.valueType + ' = func() ' + shape.valueType + ' {';
        lines[pointerLine] = expectedReturn.replace (/return (\w+)$/, 'return *$1');
        return lines.join ('\n');
    };
    goTranspiler.__ccxtGoClosureDefaultValueInstalled = true;
}

// declared TypeScript type of a nil-defaulted parameter -> the Go type of its typed GetArg twin
export const CCXT_GO_GETARG_DECLARED_TYPES = {
    'Str': '*string',
    'String': '*string',
    'Int': '*int64',
    'Num': '*float64',
    'number': '*float64',
    'Bool': '*bool',
    'boolean': '*bool',
    'Dict': 'map[string]any',
    'NullableDict': 'map[string]any',
    'Market': 'map[string]any',
    'Currency': 'map[string]any',
    'Order': 'map[string]any',
    'Ticker': 'map[string]any',
    'Trade': 'map[string]any',
    'OHLCV': 'map[string]any',
    'Strings': '[]string',
    'Dict[]': '[]map[string]any',
    'List': '[]any',
};

// Positions a typed GetArg local may be handed to: `deref` consumers unwrap a pointer twin,
// `container` ones decide on nil-ness (container locals only), `*` accepts any typed local.
export const CCXT_GO_GETARG_SAFE_CONSUMERS = {
    // deref-aware helpers (value and key/dict arguments)
    'GetValue': '*', 'InOp': '*', 'IsEqual': '*', 'IsDictionary': '*', 'EvalTruthy': '*',
    'GetArrayLength': '*', 'Add': '*', 'Multiply': '*', 'Divide': '*', 'Subtract': '*',
    'PlusEqual': '*', 'MathMin': '*', 'MathMax': '*', 'MathFloor': '*', 'MathCeil': '*',
    'MathRound': '*', 'MathAbs': '*', 'Ternary': '*', 'IsString': '*', 'IsNumber': '*',
    'IsInteger': '*', 'IsFloat': '*', 'IsBool': '*', 'IsArray': '*', 'IsObject': '*',
    'ToUpper': '*', 'ToLower': '*', 'ToString': '*', 'ToFloat64': '*', 'ParseInt': '*',
    'NumberToString': '*', 'Iso8601': '*', 'Sum': '*', 'ToArray': '*',
    'SafeString': '*', 'SafeString2': '*', 'SafeStringN': '*', 'SafeInteger': '*',
    'SafeNumber': '*', 'SafeBool': '*', 'SafeSymbol': '*', 'SafeMarket': '*',
    'SafeCurrency': '*', 'SafeCurrencyCode': '*', 'SafeDict': '*', 'SafeList': '*',
    'SafeValue2': '*', 'SafeMapTyped': '*', 'MapTyped': '*', 'DerefScalar': '*',
    // the AddElementToObject value/key arguments (its container argument is separate)
    'AddElementToObject': {'0': 'container', '1': 'deref', '2': 'deref'},
    // typed/typed-by-ABI methods of the port: GetArg derefs, so a pointer or a container reads
    // exactly like the raw value (measured consumers)
    'Market': '*', 'MarketId': '*', 'Currency': '*', 'MarketSymbols': '*',
    'PriceToPrecision': '*', 'AmountToPrecision': '*', 'DecimalToPrecision': '*',
    'ImplodeParams': '*', 'ParseTimeframe': {'0': 'unsafe'},
    'HandleOptionAndParams': '*', 'HandleMarketTypeAndParams': '*', 'HandleSubTypeAndParams': '*',
    // the TypeScript-side spellings the printer's AST sees (mathMin/MathMin), the cache limit
    // accessor (derefs both arguments, exchange_cache.go:322-330) and the request builder
    // (symbol/type/side/amount are `any` in the generated Go: the tail is a GetArg ABI)
    'mathMin': '*', 'mathMax': '*', 'GetLimit': '*', 'CreateOrderRequest': '*',
    'HandleMarginModeAndParams': '*', 'HandleUntilOption': '*', 'HandleProductTypeAndParams': '*',
    'HandleParamString': '*', 'HandleParamBool': '*', 'HandleParamInt': '*',
    'FilterBySinceLimit': '*', 'FilterBySymbolSinceLimit': '*', 'FilterBySymbolsSinceLimit': '*',
    'FilterByValueSinceLimit': '*', 'FilterByCurrencySinceLimit': '*',
    'ParseTrades': '*', 'ParseOrders': '*', 'ParseOHLCVs': '*', 'ParseTransactions': '*',
    'ParseLedger': '*', 'ParseTransfers': '*', 'ParseIncomes': '*', 'ParseConversions': '*',
    'ParseLiquidations': '*', 'ParseFundingRateHistories': '*', 'ParsePredictionTrades': '*',
    'ParsePredictionOrders': '*', 'Outcome': '*',
    // every `XxxAsync`/`XxxBody` pair forwards the optionalArgs tail into a GetArg binding
    'LoadMarketsAsync': '*', 'LoadOutcomeAsync': '*', 'FetchOrdersAsync': '*',
    'FetchOrdersByStatusAsync': '*', 'FetchOrdersByStateAsync': '*',
    'FetchCanceledAndClosedOrdersAsync': '*', 'FetchOpenOrdersAsync': '*',
    'FetchMyTradesAsync': '*', 'FetchPaginatedCallDynamicAsync': '*',
    'FetchPaginatedCallCursorAsync': '*', 'FetchPaginatedCallDeterministicAsync': '*',
    'FetchPaginatedCallIncrementalAsync': '*', 'FetchTransactionsHelperAsync': '*',
    'FetchTransactionsWithMethodAsync': '*', 'FetchDepositsWithdrawalsAsync': '*',
    'WatchTradesForSymbolsAsync': '*', 'WatchOrderBookForSymbolsAsync': '*',
    'WatchOHLCVForSymbolsAsync': '*',
    // consumers that decide on the nil-ness of the box (container argument only)
    'DeepExtend': {'*': 'container'},
    'SubstituteString': '*',
};

// Typed async receive: `x := <-this.FooAsync(..)` + PanicOnError(x) becomes
// `var x T = MapTyped(PanicOnError(<-this.FooAsync(..)))`; the channel stays `chan any` and
// PanicOnError runs first. Element types are per method (R1 body sends, R2 Promise<T>), fail closed.
export const CCXT_GO_ASYNC_ELEM_TYPES = {
    // R1 concrete container send in the body
    'AddMarginAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'ApproveBuilderCodeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CancelAllContractOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'CancelAllOrdersAfterAsync': 'map[string]any',
    // concrete []any
    'CancelAllOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'CancelAllOrdersRequestAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CancelAllOrdersWsAsync': '[]any',
    // R1 concrete container send in the body
    'CancelAllSpotOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CancelAllUtaOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CancelContractOrderAsync': 'map[string]any',
    // concrete map[string]any; TS Promise<Order>
    'CancelOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CancelOrderWsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CancelOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'CancelOrdersForSymbolsAsync': '[]any',
    // R1 concrete container send in the body
    'CancelOrdersRequestAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CancelOrdersWsAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CancelSpotOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CancelTwapOrderAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CancelUnifiedOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CancelUtaOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CancelUtaOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'ClosePositionAsync': 'map[string]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'CompleteRawTopicsAsync': '[]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'CreateApiKeyAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateContractOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CreateContractOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Conversion>'] -> map[string]any
    'CreateConvertTradeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateDepositAddressAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateExtendedOrderRequestAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateGiftCodeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateMarketBuyOrderWithCostAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateMarketOrderWithCostAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateMarketSellOrderWithCostAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'CreateOrDeriveApiKeyAsync': 'map[string]any',
    // bodies send map[string]any (concrete) e.g. ParseOrder(map[string]any); TS Promise<Order>
    'CreateOrderAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateOrderRequestAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateOrderWsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CreateOrdersWsAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateSpotOrderAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateSpotOrderRequestAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CreateSpotOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateSwapOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateTrailingAmountOrderAsync': 'map[string]any',
    // R1 concrete container send in the body
    'CreateTrailingPercentOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateTwapOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'CreateUtaOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'CreateUtaOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'EditContractOrderAsync': 'map[string]any',
    // R1 concrete container send in the body
    'EditOrderRequestAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'EditOrderWsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'EditOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'EditSpotOrderAsync': 'map[string]any',
    // R1 concrete container send in the body
    'EstimateTxFeeAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Account>'] -> map[string]any
    'FetchAccountAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchAccountHelperAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchAccountPositionsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchAccountSettingsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchAccountsAsync': '[]any',
    // R2 TS annotations ['Promise<Account[]>'] -> []any
    'FetchAccountsV2Async': '[]any',
    // R2 TS annotations ['Promise<Account[]>'] -> []any
    'FetchAccountsV3Async': '[]any',
    // R2 TS annotations ['Promise<PredictionOrder[]>'] -> []any
    'FetchAmmOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'FetchApiKeyAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'FetchApiKeysAsync': 'map[string]any',
    // TS Promise<Balances> (Dict-shaped); NewBalances(res) asserts map[string]any
    'FetchBalanceAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'FetchBalanceWsAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Tickers>'] -> map[string]any
    'FetchBidsAsksAsync': 'map[string]any',
    // R2 TS annotations ['Promise<BorrowInterest[]>'] -> []any
    'FetchBorrowInterestAsync': '[]any',
    // R1 concrete container send in the body
    'FetchBorrowRateHistoriesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict[]>'] -> []any
    'FetchBorrowRateHistoryAsync': '[]any',
    // R1 concrete container send in the body
    'FetchCanceledAndClosedOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'FetchCanceledOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchClosedContractOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchClosedOrderAsync': 'map[string]any',
    // concrete []any; TS Promise<Order[]>
    'FetchClosedOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'FetchClosedOrdersWsAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchClosedSpotOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'FetchContractBalanceAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchContractDepositAddressAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchContractDepositsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchContractMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<OHLCV[]>'] -> []any
    'FetchContractOHLCVAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchContractOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchContractOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchContractOrdersByStatusAsync': '[]any',
    // R2 TS annotations ['Promise<Tickers>'] -> map[string]any
    'FetchContractTickersAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchContractWithdrawalsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchConvertCurrenciesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Conversion>'] -> map[string]any
    'FetchConvertQuoteAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Conversion>'] -> map[string]any
    'FetchConvertTradeAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Conversion[]>'] -> []any
    'FetchConvertTradeHistoryAsync': '[]any',
    // R1 concrete container send in the body
    'FetchCrossBorrowRatesAsync': 'map[string]any',
    // concrete map[string]any; TS Promise<Currencies>
    'FetchCurrenciesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'FetchCurrenciesFromCacheAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchCurrenciesFromWebAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchCurrencyAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchCurrencyByIdAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchDefaultMarketsAsync': '[]any',
    // TS Promise<DepositAddress>
    'FetchDepositAddressAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchDepositAddressDefaultAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchDepositAddressSupplementAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchDepositAddressesByNetworkAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Transaction>'] -> map[string]any
    'FetchDepositAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchDepositMethodIdAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict[]>'] -> []any
    'FetchDepositMethodIdsAsync': '[]any',
    // R2 TS annotations ['Promise<Dict[]>'] -> []any
    'FetchDepositMethodsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchDepositWithdrawFeesAsync': 'map[string]any',
    // concrete []any; TS Promise<Transaction[]>
    'FetchDepositsAsync': '[]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchDepositsOrWithdrawalsHelperAsync': '[]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchDepositsWithdrawalsAsync': '[]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchDepositsWsAsync': '[]any',
    // R2 TS annotations ['Promise<LeverageTier[]>'] -> []any
    'FetchDerivativesMarketLeverageTiersAsync': '[]any',
    // R2 TS annotations ['Promise<OpenInterest[]>'] -> []any
    'FetchDerivativesOpenInterestHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchEventsByQueryAsync': '[]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'FetchFinancialBalanceAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchFundingHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<FundingRate>'] -> map[string]any
    'FetchFundingIntervalAsync': 'map[string]any',
    // R2 TS annotations ['Promise<FundingRates>'] -> map[string]any
    'FetchFundingIntervalsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchFundingLimitsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchFundingRateAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchFundingRateHistoryAsync': '[]any',
    // R1 concrete container send in the body
    'FetchFundingRatesAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchFutureMarketsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchGreeksAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchHip3MarketsAsync': '[]any',
    // R2 TS annotations ['Promise<Market[]>'] -> []any
    'FetchInverseSwapMarketsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchL2OrderBookAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchL3OrderBookAsync': 'map[string]any',
    // R2 TS annotations ['Promise<LedgerEntry[]>'] -> []any
    'FetchLedgerAsync': '[]any',
    // R2 TS annotations ['Promise<LedgerEntry[]>'] -> []any
    'FetchLedgerByEntriesAsync': '[]any',
    // R2 TS annotations ['Promise<LedgerEntry[]>'] -> []any
    'FetchLedgerEntriesByIdsAsync': '[]any',
    // R2 TS annotations ['Promise<LedgerEntry>'] -> map[string]any
    'FetchLedgerEntryAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchLeverageAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchLeverageTiersAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Liquidation[]>'] -> []any
    'FetchLiquidationsAsync': '[]any',
    // R2 TS annotations ['Promise<LongShortRatio[]>'] -> []any
    'FetchLongShortRatioHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<MarginModification[]>'] -> []any
    'FetchMarginAdjustmentHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'FetchMarginBalanceAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchMarginModeAsync': 'map[string]any',
    // R2 TS annotations ['Promise<OHLCV[]>'] -> []any
    'FetchMarkOHLCVAsync': '[]any',
    // R2 TS annotations ['Promise<Ticker>'] -> map[string]any
    'FetchMarkPriceAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Tickers>'] -> map[string]any
    'FetchMarkPricesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Market>'] -> map[string]any
    'FetchMarketAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Market>'] -> map[string]any
    'FetchMarketByIdAsync': 'map[string]any',
    // R2 TS annotations ['Promise<LeverageTier[]>'] -> []any
    'FetchMarketLeverageTiersAsync': '[]any',
    // concrete []any (ParseMarkets); TS Promise<Market[]>
    'FetchMarketsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchMarketsByTypeAndSubTypeAsync': '[]any',
    // R2 TS annotations ['Promise<Market[]>'] -> []any
    'FetchMarketsByTypeAsync': '[]any',
    // R1 concrete container send in the body
    'FetchMarketsFromAPIAsync': '[]any',
    // R2 TS annotations ['Promise<Dict[]>'] -> []any
    'FetchMarketsFromCacheAsync': '[]any',
    // R1 concrete container send in the body
    'FetchMarketsFromWebAsync': '[]any',
    // R1 concrete container send in the body
    'FetchMarketsV1Async': '[]any',
    // R1 concrete container send in the body
    'FetchMarketsV2Async': '[]any',
    // R1 concrete container send in the body
    'FetchMarketsV3Async': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchMyBuysAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchMyContractTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchMyDustTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Liquidation[]>'] -> []any
    'FetchMyLiquidationsAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchMySellsAsync': '[]any',
    // R2 TS annotations ['Promise<Dict[]>'] -> []any
    'FetchMySettlementHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchMySpotTradesAsync': '[]any',
    // concrete []any; TS Promise<Trade[]>
    'FetchMyTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchMyTradesWsAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchMyUtaTradesAsync': '[]any',
    // R1 concrete container send in the body
    'FetchNetworkDepositAddressAsync': 'map[string]any',
    // concrete []any; TS Promise<OHLCV[]>
    'FetchOHLCVAsync': '[]any',
    // R2 TS annotations ['Promise<OHLCV[]>'] -> []any
    'FetchOHLCVWsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchOpenInterestAsync': 'map[string]any',
    // R2 TS annotations ['Promise<OpenInterest[]>'] -> []any
    'FetchOpenInterestHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchOpenOrderAsync': 'map[string]any',
    // concrete []any; TS Promise<Order[]>
    'FetchOpenOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOpenOrdersV1Async': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOpenOrdersV2Async': '[]any',
    // R1 concrete container send in the body
    'FetchOpenOrdersWsAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOpenSpotOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOpenSwapOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Option>'] -> map[string]any
    'FetchOptionAsync': 'map[string]any',
    // R2 TS annotations ['Promise<OptionChain>'] -> map[string]any
    'FetchOptionChainAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchOptionMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<OHLCV[]>'] -> []any
    'FetchOptionOHLCVAsync': '[]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchOptionPositionsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchOptionUnderlyingsAsync': '[]any',
    // TS Promise<Order>
    'FetchOrderAsync': 'map[string]any',
    // binance.go:fetchOrderBookBody `var orderbook map[string]any = this.ParseOrderBook(...)` then `ch <- 
    'FetchOrderBookAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchOrderBooksAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchOrderClassicAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchOrderDefaultAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchOrderSupplementAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchOrderTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchOrderWsAsync': 'map[string]any',
    // concrete []any sends; TS Promise<Order[]>
    'FetchOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'FetchOrdersByIdsAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersByStateAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersByStatesAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersByStatusAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersByStatusWsAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersByTypeAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersClassicAsync': '[]any',
    // R2 TS annotations ['Promise<PredictionOrder[]>'] -> []any
    'FetchOrdersHelperAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersWithMethodAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchOrdersWsAsync': '[]any',
    // same FilterBy* tail
    'FetchPaginatedCallCursorAsync': '[]any',
    // every send is `this.FilterBySinceLimit(..)`, which answers a []any or nil
    'FetchPaginatedCallDeterministicAsync': '[]any',
    'FetchPaginatedCallIncrementalAsync': '[]any',
    // loadOutcome sends a cached/fetched outcome dict (SafeOutcome / fetchOutcome)
    'LoadOutcomeAsync': 'map[string]any',
    // exchange_generated.go fetchPaginatedCallDynamicBody `ch <- this.FilterBySinceLimit(sortedRes, since,
    'FetchPaginatedCallDynamicAsync': '[]any',
    // R1 concrete container send in the body
    'FetchPortfoliosAsync': '[]any',
    // R2 TS annotations ['Promise<Position>'] -> map[string]any
    'FetchPositionAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchPositionHistoryAsync': '[]any',
    // R1 concrete container send in the body
    'FetchPositionModeAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchPositionWsAsync': '[]any',
    // R2 TS annotations ['Promise<ADL[]>'] -> []any
    'FetchPositionsADLRankAsync': '[]any',
    // concrete []any; TS Promise<Position[]>
    'FetchPositionsAsync': '[]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchPositionsForSymbolAsync': '[]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchPositionsHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchPositionsRiskAsync': '[]any',
    // R2 TS annotations ['Promise<Position[]>'] -> []any
    'FetchPositionsWsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchPrivateTradingFeeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchPrivateTradingFeesAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchPrivateTransactionFeesAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchPublicTradingFeeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchPublicTradingFeesAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchPublicTransactionFeesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawActiveMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawEventsBySearchAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawEventsListAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawMarketsBySearchAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawMarketsByTagsAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawMarketsListAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawQuestionsBySearchAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawQuestionsListAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawTopicsAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchRawTopicsByQueriesAsync': '[]any',
    // R2 TS annotations ['Promise<any[]>'] -> []any
    'FetchSeriesEventsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchSettlementHistoryAsync': '[]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'FetchSpotBalanceAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchSpotMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<OHLCV[]>'] -> []any
    'FetchSpotOHLCVAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchSpotOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchSpotOrderTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchSpotOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchSpotOrdersByStatesAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchSpotOrdersByStatusAsync': '[]any',
    // R1 concrete container send in the body
    'FetchStatusAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Market[]>'] -> []any
    'FetchSwapAndFutureMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'FetchSwapBalanceAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchSwapMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<Ticker>'] -> map[string]any
    'FetchTicker2Async': 'map[string]any',
    // concrete map[string]any; TS Promise<Ticker>
    'FetchTickerAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTickerV1AndV2Async': 'map[string]any',
    // R2 TS annotations ['Promise<Ticker>'] -> map[string]any
    'FetchTickerV1Async': 'map[string]any',
    // R2 TS annotations ['Promise<Ticker>'] -> map[string]any
    'FetchTickerV2Async': 'map[string]any',
    // R2 TS annotations ['Promise<Ticker>'] -> map[string]any
    'FetchTickerV3Async': 'map[string]any',
    // R2 TS annotations ['Promise<Ticker>'] -> map[string]any
    'FetchTickerWsAsync': 'map[string]any',
    // concrete map[string]any sends; TS Promise<Tickers> (Dict) is contradicted by some []any impls -> map
    'FetchTickersAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Tickers>'] -> map[string]any
    'FetchTickersV2Async': 'map[string]any',
    // R2 TS annotations ['Promise<Tickers>'] -> map[string]any
    'FetchTickersV3Async': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'FetchTradeQuoteAsync': 'map[string]any',
    // concrete []any; TS Promise<Trade[]>
    'FetchTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'FetchTradesWsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchTradingFeeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTradingFeesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<TradingFees>'] -> map[string]any
    'FetchTradingFeesWsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTradingLimitsAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTradingLimitsByIdAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTransactionFeeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTransactionFeesAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTransactionsAsync': '[]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchTransactionsByTypeAsync': '[]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchTransactionsWithMethodAsync': '[]any',
    // R2 TS annotations ['Promise<TransferEntry>'] -> map[string]any
    'FetchTransferAsync': 'map[string]any',
    // R1 concrete container send in the body
    'FetchTransfersAsync': '[]any',
    // R1 concrete container send in the body
    'FetchUSDTMarketsAsync': '[]any',
    // R1 concrete container send in the body
    'FetchUTAMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<OHLCV[]>'] -> []any
    'FetchUTAOHLCVAsync': '[]any',
    // R1 concrete container send in the body
    'FetchUnderlyingAssetsAsync': '[]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'FetchUtaBalanceAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchUtaCanceledAndClosedOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'FetchUtaMarketsAsync': '[]any',
    // R2 TS annotations ['Promise<Order>'] -> map[string]any
    'FetchUtaOrderAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'FetchUtaOrdersByStatusAsync': '[]any',
    // R1 concrete container send in the body
    'FetchVolatilityHistoryAsync': '[]any',
    // R1 concrete container send in the body
    'FetchWithdrawAddressesAsync': '[]any',
    // R2 TS annotations ['Promise<Transaction>'] -> map[string]any
    'FetchWithdrawalAsync': 'map[string]any',
    // concrete []any; TS Promise<Transaction[]>
    'FetchWithdrawalsAsync': '[]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'FetchWithdrawalsWsAsync': '[]any',
    // R1 concrete container send in the body
    'GetAssetHistoryRowsAsync': '[]any',
    // R1 concrete container send in the body
    'HandleAccountIndexAsync': '[]any',
    // R1 concrete container send in the body
    'HandleNetworkIdAndParamsAsync': '[]any',
    // R1 concrete container send in the body
    'HandlePortfolioAndParamsAsync': '[]any',
    // R1 concrete container send in the body
    'HandleUTAAndParamsAsync': '[]any',
    // R2 TS annotations ['Promise<TransferEntry[]>'] -> []any
    'InternalFetchTransfersAsync': '[]any',
    // R1 concrete container send in the body
    'IsUnifiedEnabledAsync': '[]any',
    // R2 TS annotations ['Promise<Account[]>'] -> []any
    'LoadAccountsAsync': '[]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'LoadLeverageBracketsAsync': 'map[string]any',
    // exchange.go:414-443 sends `this.Markets` (*sync.Map) and `result := this.SetMarkets(...)` (any); Map
    'LoadMarketsAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'LoadQuoteTokenAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Market>'] -> map[string]any
    'LoadTradeMarketAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'ModifyLeverageAndMarginModeAsync': 'map[string]any',
    // R1 concrete container send in the body
    'ModifyMarginHelperAsync': 'map[string]any',
    // R1 concrete container send in the body
    'PrepareAccountRequestWithCurrencyCodeAsync': '[]any',
    // R1 concrete container send in the body
    'PrepareParadexDomainAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Dict>'] -> map[string]any
    'QueryContractsAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Transaction[]>'] -> []any
    'QueryTransactionsByEventTypeAsync': '[]any',
    // R1 concrete container send in the body
    'RequestWalletHistoryRowsAsync': '[]any',
    // R2 TS annotations ['Promise<string[]>'] -> []any
    'ResolveEventSeriesTickersAsync': '[]any',
    // R1 concrete container send in the body
    'SetContractLeverageAsync': 'map[string]any',
    // R1 concrete container send in the body
    'SetLeverageAsync': 'map[string]any',
    // R1 concrete container send in the body
    'SetMarginAsync': 'map[string]any',
    // R1 concrete container send in the body
    'SignAndCancelAllOrdersAsync': '[]any',
    // R1 concrete container send in the body
    'SignAndCancelOrderAsync': '[]any',
    // R1 concrete container send in the body
    'SignAndCreateOrderAsync': '[]any',
    // R1 concrete container send in the body
    'SignInWithPrivateKeyAsync': 'map[string]any',
    // R1 concrete container send in the body
    'TransferAsync': 'map[string]any',
    // R2 TS annotations ['Promise<TransferEntry>'] -> map[string]any
    'TransferBetweenMainAndSubAccountAsync': 'map[string]any',
    // R2 TS annotations ['Promise<TransferEntry>'] -> map[string]any
    'TransferBetweenSubAccountsAsync': 'map[string]any',
    // R2 TS annotations ['Promise<TransferEntry>'] -> map[string]any
    'TransferClassicAsync': 'map[string]any',
    // R2 TS annotations ['Promise<TransferEntry>'] -> map[string]any
    'TransferInAsync': 'map[string]any',
    // R1 concrete container send in the body
    'TransferOutAsync': 'map[string]any',
    // R2 TS annotations ['Promise<TransferEntry>'] -> map[string]any
    'TransferUtaAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Balances>'] -> map[string]any
    'WatchBalanceAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Tickers>'] -> map[string]any
    'WatchBidsAsksAsync': 'map[string]any',
    // R2 TS annotations ['Promise<FundingRate>'] -> map[string]any
    'WatchFundingRateAsync': 'map[string]any',
    // R2 TS annotations ['Promise<FundingRates>'] -> map[string]any
    'WatchFundingRatesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Liquidation[]>'] -> []any
    'WatchLiquidationsAsync': '[]any',
    // R2 TS annotations ['Promise<Liquidation[]>'] -> []any
    'WatchLiquidationsForSymbolsAsync': '[]any',
    // R2 TS annotations ['Promise<Ticker>'] -> map[string]any
    'WatchMarkPriceAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Tickers>'] -> map[string]any
    'WatchMarkPricesAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Liquidation[]>'] -> []any
    'WatchMyLiquidationsAsync': '[]any',
    // R2 TS annotations ['Promise<Liquidation[]>'] -> []any
    'WatchMyLiquidationsForSymbolsAsync': '[]any',
    // TS watchMyTrades -> Promise<Trade[]>
    'WatchMyTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'WatchMyTradesForSymbolsAsync': '[]any',
    // TS watchOHLCV -> Promise<OHLCV[]>
    'WatchOHLCVAsync': '[]any',
    // R2 TS annotations ['Promise<Dictionary<Dictionary<OHLCV[]>>>'] -> map[string]any
    'WatchOHLCVForSymbolsAsync': 'map[string]any',
    // TS watchOrders -> Promise<Order[]>
    'WatchOrdersAsync': '[]any',
    // R2 TS annotations ['Promise<Order[]>'] -> []any
    'WatchOrdersForSymbolsAsync': '[]any',
    // R2 TS annotations ['Promise<Position>'] -> map[string]any
    'WatchPositionAsync': 'map[string]any',
    // TS watchPositions -> Promise<Position[]>
    'WatchPositionsAsync': '[]any',
    // pro/binance.go watchTickerBody `ch <- ccxt.GetValue(tickers, symbol)`
    'WatchTickerAsync': 'map[string]any',
    // `ch <- this.FilterByArray(this.Tickers, "symbol", symbols)`
    'WatchTickersAsync': 'map[string]any',
    // TS watchTrades -> Promise<Trade[]>
    'WatchTradesAsync': '[]any',
    // R2 TS annotations ['Promise<Trade[]>'] -> []any
    'WatchTradesForSymbolsAsync': '[]any',
    // concrete map[string]any; TS Promise<Transaction>
    'WithdrawAsync': 'map[string]any',
    // R2 TS annotations ['Promise<Transaction>'] -> map[string]any
    'WithdrawWsAsync': 'map[string]any',
    // exchange_helpers.go:1946 `results := make([]any, len(tasks))` ... `ch <- results`; also a `ch <- nil
    'promiseAll': '[]any',
};

// methods whose `return await this.X(..)` forward preserves the value, so X's element type carries over
export const CCXT_GO_ASYNC_FORWARD_SAFE = [
];

// receivers whose element type is not nameable (the Watch family and interface results): never typed
export const CCXT_GO_ASYNC_ELEM_EXCLUDED = [
    'ApproveBuilderFeeAsync',
    'AuthenticateAsync',
    'AuthenticateRestAsync',
    'AuthenticateUtaAsync',
    'CallDynamically',
    'ChangeApiKeyAsync',
    'ConnectCentrifugoAsync',
    'CreateAmmOrderAsync',
    'CreateOrderbookOrderAsync',
    'CreateSubAccountAsync',
    'EditOrderAsync',
    'EnsureErc20AllowanceAsync',
    'EnsureUserDataStreamWsSubscribeListenTokenAsync',
    'EnsureUserDataStreamWsSubscribeSignatureAsync',
    'EthRpcAsync',
    'Fetch2Async',
    'FetchADLRankAsync',
    'FetchAccountIdByTypeAsync',
    'FetchAllGreeksAsync',
    'FetchAsync',
    'FetchBuilderApprovalsAsync',
    'FetchCrossBorrowRateAsync',
    'FetchDepositWithdrawFeeAsync',
    'FetchDydxAccountAsync',
    'FetchEventAsync',
    'FetchEventsAsync',
    'FetchExtendedAccountAsync',
    'FetchIsolatedBorrowRateAsync',
    'FetchIsolatedBorrowRatesAsync',
    'FetchLastPricesAsync',
    'FetchLatestBlockHeightAsync',
    'FetchLeveragesAsync',
    'FetchMarginModesAsync',
    'FetchNonceAsync',
    'FetchOpenInterestsAsync',
    'FetchOrderBookWsAsync',
    'FetchOrderStatusAsync',
    'FetchOutcomeAsync',
    'FetchOutcomesAsync',
    'FetchPaymentMethodsAsync',
    'FetchPrivateDepositWithdrawFeesAsync',
    'FetchPublicDepositWithdrawFeesAsync',
    'FetchQuoteAsync',
    'FetchRawEventByTickerAsync',
    'FetchRawMarketByIdAsync',
    'FetchRawQuestionByIdAsync',
    'FetchRawTopicDetailAsync',
    'FetchRestOrderBookSafeAsync',
    'FetchSettlementsAsync',
    'FetchTimeAsync',
    'FetchWalletAsync',
    'FetchWebEndpointAsync',
    'FetchWithdrawalWhitelistAsync',
    'GetAccountIdAsync',
    'GetListenKeyAsync',
    'GetSystemConfigAsync',
    'GetUrlByMarketTypeAsync',
    'GetUtaUrlAsync',
    'GetWithdrawNonceAsync',
    'GetZKContractSignatureObjAsync',
    'GetZKTransferSignatureObjAsync',
    'HandleBuilderFeeApprovalAsync',
    'HelperForWatchMultipleConstructAsync',
    'InitializeClientAsync',
    'IsUTAEnabledAsync',
    'LoadAccountAsync',
    'LoadAccountInfosAsync',
    'LoadAccountSettingsAsync',
    'LoadApiCredentialsAsync',
    'LoadApiKeyAsync',
    'LoadCurrencyNetworksAsync',
    'LoadDydxProtosAsync',
    'LoadMarketsAndSignInAsync',
    'LoadMultiSignAddressAsync',
    'LoadOutcomesAsync',
    'LoadTimeDifferenceAsync',
    'LoadUnifiedStatusAsync',
    'NegotiateAsync',
    'PreLoadLighterLibraryAsync',
    'PromiseAll',
    'RequestAsync',
    'RequestPrivateAsync',
    'RetrieveAccountAsync',
    'SeedOrderBookAsync',
    'SeedPositionBalancesAsync',
    'SendEvmTransactionAsync',
    'SetMarginModeAsync',
    'SetPositionModeAsync',
    'SignInAsync',
    'SubscribeAsync',
    'SubscribeMultipleAsync',
    'SubscribeMyriadChannelAsync',
    'SubscribeOpinionChannelAsync',
    'SubscribePrivateAsync',
    'SubscribePrivateUtaAsync',
    'SubscribePublicAsync',
    'SubscribePublicMultipleAsync',
    'SubscribePublicMultipleUtaAsync',
    'SubscribePublicUtaAsync',
    'SubscribeUserChannelAsync',
    'TradeRequestAsync',
    'UnSubscribeAsync',
    'UnSubscribeMultipleAsync',
    'UnSubscribePublicMultipleAsync',
    'UnWatchAsync',
    'UnWatchBalanceAsync',
    'UnWatchBidsAsksAsync',
    'UnWatchChannelAsync',
    'UnWatchChannelsAsync',
    'UnWatchFundingRateAsync',
    'UnWatchMarkPriceAsync',
    'UnWatchMarkPricesAsync',
    'UnWatchMyTradesAsync',
    'UnWatchOHLCVAsync',
    'UnWatchOHLCVForSymbolsAsync',
    'UnWatchOrderBookAsync',
    'UnWatchOrderBookForSymbolsAsync',
    'UnWatchOrdersAsync',
    'UnWatchPositionsAsync',
    'UnWatchPrivateAsync',
    'UnWatchPublicAsync',
    'UnWatchPublicMultipleAsync',
    'UnWatchTickerAsync',
    'UnWatchTickersAsync',
    'UnWatchTopicsAsync',
    'UnWatchTradesAsync',
    'UnWatchTradesForSymbolsAsync',
    'UnWatchWalletEventsAsync',
    'UnsubscribeAsync',
    'UnsubscribePublicAsync',
    'UnwatchPublicAsync',
    'WaitForTransactionReceiptAsync',
    'WalletEventsTopicAsync',
    'Watch',
    'WatchExecuteRequestAsync',
    'WatchHeartbeatAsync',
    'WatchManyAsync',
    'WatchMultiHelperAsync',
    'WatchMultiTickerHelperAsync',
    'WatchMultiple',
    'WatchMultipleSubscriptionAsync',
    'WatchMultipleWrapperAsync',
    'WatchOrderBookAsync',
    'WatchOrderBookForSymbolsAsync',
    'WatchPrivateAsync',
    'WatchPrivateMultipleAsync',
    'WatchPrivateRequestAsync',
    'WatchPrivateSubscribeAsync',
    'WatchPublicAsync',
    'WatchPublicMultipleAsync',
    'WatchRequestAsync',
    'WatchSpotPrivateAsync',
    'WatchSpotPublicAsync',
    'WatchStockMarketStreamAsync',
    'WatchSwapPrivateAsync',
    'WatchSwapPublicAsync',
    'WatchTopicsAsync',
    'WatchWalletEventsAsync',
    'WathPublicAsync',
];

// the printed receive, `(<-this.FetchTickerAsync(...))` / `(<-ccxt.Watch(...))`
const CCXT_GO_ASYNC_RECV_CALL = /^\(\s*<-\s*(?:this|ccxt)\.([A-Za-z_]\w*)\s*\(/;
const CCXT_GO_ASYNC_UNBOX = { 'map[string]any': 'MapTyped', '[]any': 'ListTyped' };
const CCXT_GO_ASYNC_READ_HELPERS = /^(?:this\.)?(?:Safe[A-Z]\w*|ToArray|FilterBy\w*|Sort\w*|ExtractParams|ArrayConcat|GetArrayLength|EvalTruthy|InOp)$/;

// one later read of the local: only shapes that read the untyped-nil box and a nil container
// the same qualify, since MapTyped/ListTyped turn absent into a nil map/slice
function ccxtGoAsyncReceiveReadsTheValue (goTranspiler, node, goType) {
    const parent = node.parent;
    if (parent === undefined) {
        return false;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.ElementAccessExpression: {
        if (parent.expression !== node) {
            return false;                       // x used as an index key
        }
        const grandparent = parent.parent;
        if (grandparent !== undefined) {
            if ((grandparent.kind === ts.SyntaxKind.BinaryExpression) && (grandparent.left === parent)) {
                return false;                   // x[k] = v / x[k] += v
            }
            if ((grandparent.kind === ts.SyntaxKind.PostfixUnaryExpression)
                || (grandparent.kind === ts.SyntaxKind.PrefixUnaryExpression)
                || (grandparent.kind === ts.SyntaxKind.DeleteExpression)) {
                return false;                   // x[k]++ / &x[k] / delete x[k]
            }
        }
        return true;                            // printed GetValue(x, k)
    }
    case ts.SyntaxKind.PropertyAccessExpression:
        // `x.length` prints len(x) / GetArrayLength(x): both answer 0 for nil and nil-slice
        return (parent.expression === node) && (parent.name?.escapedText === 'length');
    case ts.SyntaxKind.BinaryExpression:
        // `k in x` prints InOp(x, k): false for a nil map and for a typed nil map
        return (parent.operatorToken?.kind === ts.SyntaxKind.InKeyword) && (parent.right === node);
    case ts.SyntaxKind.CallExpression: {
        if (parent.expression === node) {
            return false;                       // the local called as a function
        }
        if (parent.arguments.indexOf (node) !== 0) {
            return false;                       // value position: the box escapes
        }
        if (typeof goTranspiler.goPrintedCallee !== 'function') {
            return false;
        }
        const callee = goTranspiler.goPrintedCallee (goTranspiler.printNode (parent, 0));
        if (callee === undefined) {
            return false;
        }
        const name = callee.replace (/\s+/g, '');
        return CCXT_GO_ASYNC_READ_HELPERS.test (name.replace (/\(.*$/, ''));
    }
    default:
        return false;
    }
}

// The `const x = await ...` declaration the await belongs to; undefined for the bare
// `await this.x()` statement and for `return await this.x()`.
function ccxtGoAsyncReceiveDeclaration (awaitNode) {
    let node = awaitNode;
    while (node !== undefined) {
        const kind = node.kind;
        if (kind === ts.SyntaxKind.VariableDeclaration) {
            return node;
        }
        if ((kind === ts.SyntaxKind.ExpressionStatement) || (kind === ts.SyntaxKind.ReturnStatement)
            || (kind === ts.SyntaxKind.FunctionDeclaration) || (kind === ts.SyntaxKind.MethodDeclaration)
            || (kind === ts.SyntaxKind.FunctionExpression) || (kind === ts.SyntaxKind.ArrowFunction)) {
            return undefined;
        }
        node = node.parent;
    }
    return undefined;
}

// false when the callee's own declaration (the override the checker resolves) names a Promise<T>
// of the other container shape; unannotated, `any` or union declarations defer to the table
function ccxtGoAsyncDeclaredShapeAgrees (goTranspiler, callee, goType) {
    let declaration = undefined;
    try {
        declaration = goTranspiler.getChecker ().getSymbolAtLocation (callee.name)?.valueDeclaration;
    } catch (e) {
        return true;
    }
    const text = declaration?.type?.getText?. ();
    const m = /^Promise<\s*([\s\S]*)\s*>$/.exec ((text ?? '').trim ());
    if (m === null) {
        return true;
    }
    const inner = m[1].trim ();
    if (inner.includes ('|') || (inner === 'any')) {
        return true;
    }
    const isList = inner.startsWith ('[') || inner.endsWith ('[]') || /^(List|Array<[\s\S]*>)$/.test (inner);
    const isMap = !isList && /^(Dict|Dictionary<[\s\S]*>|[A-Z]\w*)$/.test (inner)
        && !/^(Str|Num|Int|Bool|Strings)$/.test (inner);
    return (goType === '[]any') ? !isMap : !isList;
}

// Go element of each generated implicit-API stub, read off the emitted `<id>_api.go` companion
// of the abstract file that declares the method; a stub still returning `<-chan any` is absent.
const CCXT_GO_ENDPOINT_SIG = /^func \(this \*\w+\) (\w+)\(args \.\.\.any\) <-chan (?:ccxt\.)?EndpointResult\[(.+)\] \{$/;
const CCXT_GO_ENDPOINT_TABLES = new Map ();
const CCXT_GO_ENDPOINT_DECLARED = { 'Dict': 'map[string]any', 'List': '[]any', 'string': 'string' };

function ccxtGoEndpointTable (abstractFile) {
    const m = /^(.*)[\\/]ts[\\/]src[\\/]abstract[\\/]((?:prediction[\\/])?)(\w+)\.ts$/.exec (abstractFile);
    if (m === null) {
        return undefined;
    }
    const goFile = path.join (m[1], 'go', 'v4', m[2], m[3] + '_api.go');
    if (!CCXT_GO_ENDPOINT_TABLES.has (goFile)) {
        const table = new Map ();
        let text = '';
        try {
            text = fs.readFileSync (goFile, 'utf8');
        } catch (e) {
            text = '';
        }
        for (const line of text.split ('\n')) {
            const sig = CCXT_GO_ENDPOINT_SIG.exec (line);
            if (sig !== null) {
                table.set (sig[1], sig[2]);
            }
        }
        CCXT_GO_ENDPOINT_TABLES.set (goFile, table);
    }
    return CCXT_GO_ENDPOINT_TABLES.get (goFile);
}

// the channel element of `this.<endpoint>(...)`, or undefined for anything that is not a typed
// stub. The Go signature decides; the declared Promise<T> of the same abstract method must agree.
export function ccxtGoEndpointElement (goTranspiler, call) {
    if ((call === undefined) || (call.kind !== ts.SyntaxKind.CallExpression)) {
        return undefined;
    }
    const callee = call.expression;
    if ((callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) || (callee.expression?.kind !== ts.SyntaxKind.ThisKeyword)
        || (typeof goTranspiler.getChecker !== 'function')) {
        return undefined;
    }
    let declaration = undefined;
    try {
        declaration = goTranspiler.getChecker ().getSymbolAtLocation (callee.name)?.declarations?.[0];
    } catch (e) {
        return undefined;                       // no program behind the printer: keep the box
    }
    const fileName = declaration?.getSourceFile?. ()?.fileName;
    if ((typeof fileName !== 'string') || !/[\\/]ts[\\/]src[\\/]abstract[\\/]/.test (fileName)) {
        return undefined;
    }
    const name = String (callee.name.escapedText);
    const goName = name.charAt (0).toUpperCase () + name.slice (1);
    // a derived core embeds its parent's, whose companion holds the promoted stubs
    let element = undefined;
    for (let file = fileName, hops = 0; (element === undefined) && (file !== undefined) && (hops < 8); hops++) {
        element = ccxtGoEndpointTable (file)?.get (goName);
        let text = '';
        try {
            text = fs.readFileSync (file, 'utf8');
        } catch (e) {
            text = '';
        }
        const parent = /^import _(\w+) from '\.\.\/(\w+)\.js';$/m.exec (text);
        file = (parent === null) ? undefined : path.join (path.dirname (file), parent[2] + '.ts');
    }
    if (element === undefined) {
        return undefined;
    }
    const declared = /^Promise<\s*(\w+)\s*>$/.exec (declaration.type?.getText?. () ?? '');
    if ((declared === null) || (CCXT_GO_ENDPOINT_DECLARED[declared[1]] !== element)) {
        throw new Error ('go endpoint ' + name + ': stub element ' + element + ' disagrees with ' + fileName);
    }
    return element;
}

function ccxtGoParentPastParens (node) {
    let parent = node.parent;
    while (parent?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        parent = parent.parent;
    }
    return parent;
}

// A typed stub yields EndpointResult[T]: every receive reads `.Raw` (the value the boxed channel
// carried), and an un-received call handed on as a value is re-boxed into `<-chan any`.
function installCcxtGoEndpointConsumers (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoEndpointConsumersInstalled
        || (typeof goTranspiler.printAwaitExpression !== 'function') || (typeof goTranspiler.printCallExpression !== 'function')) {
        return;
    }
    const printAwait = goTranspiler.printAwaitExpression;
    goTranspiler.printAwaitExpression = function (node, identation) {
        const printed = printAwait.call (this, node, identation);
        if (ccxtGoEndpointElement (this, node.expression) === undefined) {
            return printed;
        }
        if (!printed.startsWith ('(<-') || !printed.endsWith (')')) {
            // an unread carrier would reach PanicOnError as a struct and swallow the failure
            throw new Error ('go endpoint receive printed as ' + printed.slice (0, 80));
        }
        return printed + '.Raw';
    };
    const printCall = goTranspiler.printCallExpression;
    goTranspiler.printCallExpression = function (node, identation) {
        const printed = printCall.call (this, node, identation);
        if ((ccxtGoParentPastParens (node)?.kind === ts.SyntaxKind.AwaitExpression) || (ccxtGoEndpointElement (this, node) === undefined)) {
            return printed;
        }
        const lead = /^\s*/.exec (printed)[0];
        return lead + 'EndpointRaw(' + printed.slice (lead.length) + ')';
    };
    goTranspiler.__ccxtGoEndpointConsumersInstalled = true;
}

// `const x = await Promise.all ([...])`: promiseAll sends a fresh non-nil `[]any` or a panic string
function ccxtGoPromiseAllUseIsSafe (n) {
    const parent = n.parent;
    if (parent === undefined) {
        return false;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.ElementAccessExpression:
        return (parent.expression === n) && !((parent.parent?.kind === ts.SyntaxKind.BinaryExpression) && (parent.parent.left === parent));
    case ts.SyntaxKind.PropertyAccessExpression:
        return (parent.expression === n) && (parent.name?.escapedText === 'length');
    case ts.SyntaxKind.CallExpression:
        return (parent.expression !== n);
    default:
        return false;
    }
}

// the receives the per-method table cannot key: Promise.all, and ws order books read only via .limit ()
function ccxtGoAwaitSpecialReceive (goTranspiler, awaitNode, text) {
    const declaration = ccxtGoAsyncReceiveDeclaration (awaitNode);
    if ((declaration === undefined) || (declaration.name?.kind !== ts.SyntaxKind.Identifier)
        || (typeof goTranspiler.goDeclaredLocalTypeIfSafe !== 'function')) {
        return undefined;
    }
    const call = awaitNode.expression;
    const callee = call?.expression;
    if ((call?.kind !== ts.SyntaxKind.CallExpression) || (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression)) {
        return undefined;
    }
    if (/^\(\s*<-\s*(?:ccxt\.)?[pP]romiseAll\s*\(/.test (text) && (callee.expression?.escapedText === 'Promise')
        && (callee.name?.escapedText === 'all') && (call.arguments?.[0]?.kind === ts.SyntaxKind.ArrayLiteralExpression
            || call.arguments?.[0]?.kind === ts.SyntaxKind.Identifier)) {
        if (goTranspiler.goDeclaredLocalTypeIfSafe (declaration, '[]any', ccxtGoPromiseAllUseIsSafe) === undefined) {
            return undefined;
        }
        return { goType: '[]any', wrap: (recv) => 'ListTyped(PanicOnError(' + recv.trim () + '))' };
    }
    if (goSourceIsWsTree (awaitNode) && /^\(\s*<-\s*this\.\w+\s*\(/.test (text) && (callee.expression?.kind === ts.SyntaxKind.ThisKeyword)
        && typeNameIsUsable (goTranspiler, awaitNode, 'OrderBookInterface')) {
        // every read is `x.limit ()`, which the ws pass already prints as x.(OrderBookInterface).Limit ()
        const onlyLimit = (n) => (n.parent?.kind === ts.SyntaxKind.PropertyAccessExpression) && (n.parent.expression === n)
            && (n.parent.name?.escapedText === 'limit') && (n.parent.parent?.kind === ts.SyntaxKind.CallExpression)
            && (n.parent.parent.expression === n.parent) && (n.parent.parent.arguments.length === 0);
        if (!/^orderbooks?$/.test (String (declaration.name.escapedText))) {
            return undefined;
        }
        if (goTranspiler.goDeclaredLocalTypeIfSafe (declaration, 'OrderBookInterface', onlyLimit) === undefined) {
            return undefined;
        }
        return { goType: 'OrderBookInterface', wrap: (recv) => 'PanicOnError(' + recv.trim () + ').(OrderBookInterface)' };
    }
    return undefined;
}

// The hook the printer consults for all three await shapes.  Fail closed: undefined keeps the
// boxed `x := (<-...)` + `PanicOnError(x)` emission byte-for-byte.
export function ccxtGoAwaitReceiveUnbox (goTranspiler, awaitNode, printedInitializer) {
    if ((awaitNode === undefined) || (awaitNode.kind !== ts.SyntaxKind.AwaitExpression)) {
        return undefined;
    }
    const text = (printedInitializer ?? '').replace (/\s+/g, ' ').trim ();
    const special = ccxtGoAwaitSpecialReceive (goTranspiler, awaitNode, text);
    if (special !== undefined) {
        return special;
    }
    const printed = CCXT_GO_ASYNC_RECV_CALL.exec (text);
    if (printed === null) {
        return undefined;                       // not a plain `<-this.<Method>(` receive
    }
    const call = awaitNode.expression;
    if ((call === undefined) || (call.kind !== ts.SyntaxKind.CallExpression)) {
        return undefined;
    }
    const callee = call.expression;
    if ((callee === undefined) || (callee.kind !== ts.SyntaxKind.PropertyAccessExpression)) {
        return undefined;
    }
    if (callee.expression?.kind !== ts.SyntaxKind.ThisKeyword) {
        return undefined;                       // this.DerivedExchange.x() / ccxt.x(): keep the box
    }
    const method = callee.name?.escapedText;
    if (typeof method !== 'string') {
        return undefined;
    }
    // cores print `loadMarkets` as `LoadMarketsAsync`; implicit-API stubs print without the suffix
    const exported = method.charAt (0).toUpperCase () + method.slice (1);
    const endpoint = (printed[1] === exported) ? ccxtGoEndpointElement (goTranspiler, call) : undefined;
    if ((endpoint === undefined) && (printed[1] !== exported + 'Async')) {
        return undefined;                       // the printer's suffix logic disagrees: keep the box
    }
    const goType = (endpoint !== undefined) ? endpoint : CCXT_GO_ASYNC_ELEM_TYPES[printed[1]];
    if (goType === undefined) {
        return undefined;
    }
    if ((endpoint !== undefined) && (ccxtGoAsyncReceiveDeclaration (awaitNode) === undefined)) {
        return undefined;                       // a statement or a forwarded endpoint value stays boxed
    }
    if ((endpoint === undefined) && !ccxtGoAsyncDeclaredShapeAgrees (goTranspiler, callee, goType)) {
        return undefined;                       // a declared Promise<T> of the other shape: keep the box
    }
    const conv = CCXT_GO_ASYNC_UNBOX[goType];
    if (conv === undefined) {
        return undefined;
    }
    const declaration = ccxtGoAsyncReceiveDeclaration (awaitNode);
    if (declaration !== undefined) {
        // `const x = await this.X()`: a later rebinding, a shadowing declaration, a write of
        // another type or any read that would answer differently for a typed nil keeps the
        // box -- the shipped scanner applies exactly those vetoes
        if (typeof goTranspiler.goDeclaredLocalTypeIfSafe !== 'function') {
            return undefined;
        }
        const safe = goTranspiler.goDeclaredLocalTypeIfSafe (declaration, goType,
            (n) => ccxtGoAsyncReceiveReadsTheValue (goTranspiler, n, goType));
        if (safe === undefined) {
            return undefined;
        }
    } else if (awaitNode.parent?.kind === ts.SyntaxKind.ExpressionStatement) {
        return undefined;                       // discarded value: a named typed local is never read
    } else if (awaitNode.parent?.kind === ts.SyntaxKind.ReturnStatement) {
        // `return await this.X()` forwards the value through `ch <- retResNNN`: refused until
        // the inner value is proven never-absent for this method
        // the forward re-boxes through BoxAbsent (installCcxtGoAsyncForwardRebox), so an absent
        // result still reaches the caller as untyped nil
        // watch* results can be cache objects that MapTyped/ListTyped would drop: never forwarded typed
        if ((CCXT_GO_ASYNC_FORWARD_SAFE.indexOf (method) < 0)
            && ((typeof goTranspiler.printReturnStatement !== 'function') || /^(un)?watch/i.test (method))) {
            return undefined;
        }
    }
    return { goType: goType, wrap: (recv) => conv + '(PanicOnError(' + recv.trim () + '))' };
}

// `var retResN T = ..` + `ch <- retResN`: a nil map/slice would reach the caller as a non-nil
// box, so the forwarded send goes through BoxAbsent (typed nil -> untyped nil)
function installCcxtGoAsyncForwardRebox (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoAsyncForwardReboxInstalled
        || (typeof goTranspiler.printReturnStatement !== 'function')) {
        return;
    }
    const printReturn = goTranspiler.printReturnStatement;
    goTranspiler.printReturnStatement = function (node, identation) {
        const printed = printReturn.call (this, node, identation);
        const m = /\n(\s*)var (retRes\d+) (?:map\[string\]any|\[\]any) = [^\n]*\n/.exec (printed);
        if (m === null) {
            return printed;
        }
        const send = new RegExp ('^(\\s*ch <- )' + m[2] + '(\\s*(?://.*)?)$', 'm');
        if (!send.test (printed)) {
            throw new Error ('go typed forward without its send: ' + printed.slice (0, 120));
        }
        return printed.replace (send, '$1BoxAbsent(' + m[2] + ')$2');
    };
    goTranspiler.__ccxtGoAsyncForwardReboxInstalled = true;
}

function installCcxtGoAsyncReceiveUnbox (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoAsyncReceiveUnboxInstalled) {
        return;
    }
    if (typeof goTranspiler.goAwaitReceiveUnbox !== 'function') {
        return;                                 // older printer without the hook: nothing to extend
    }
    goTranspiler.goAwaitReceiveUnbox = function (awaitNode, printedInitializer) {
        return ccxtGoAwaitReceiveUnbox (this, awaitNode, printedInitializer);
    };
    goTranspiler.__ccxtGoAsyncReceiveUnboxInstalled = true;
}

export function installCcxtGoLocalTypes (goTranspiler) {
    if (goTranspiler === undefined || goTranspiler.__ccxtGoLocalTypesInstalled) {
        return;
    }
    installCcxtGoArrayBindingHolders (goTranspiler);
    if (typeof goTranspiler.goTypeOfInitializer !== 'function' || typeof goTranspiler.isWholePrintedCall !== 'function') {
        return; // older printer without local typing: nothing to extend
    }
    // the typed optional-argument locals read both tables
    goTranspiler.CCXT_GO_GETARG_DECLARED_TYPES = CCXT_GO_GETARG_DECLARED_TYPES;
    goTranspiler.CCXT_GO_GETARG_SAFE_CONSUMERS = CCXT_GO_GETARG_SAFE_CONSUMERS;
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
            const currencyType = ccxtGoTypeOfCurrencyInitializer (this, initializer, printedValue);
            if (currencyType !== undefined) {
                return currencyType;
            }
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
        installCcxtGoClosurePointerJoin (goTranspiler);
        installCcxtGoClosureDefaultValue (goTranspiler);
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
    // same for the currency dict the accessors box in `any`
    installCcxtGoCurrencyUnbox (goTranspiler);
    installCcxtGoWriteSiteConversions (goTranspiler);
    // the container locals the printer's own predicate leaves out: cast-wrapped initializers,
    // non-empty (kept) defaults, the two-key accessors and the Safe* read shapes of the list family
    installCcxtGoSafeCollectionUnbox (goTranspiler);
    // B1: name the async-receive locals whose element type the core's channel carries
    installCcxtGoAsyncReceiveUnbox (goTranspiler);
    installCcxtGoAsyncForwardRebox (goTranspiler);
    installCcxtGoEndpointConsumers (goTranspiler);
    installCcxtGoProducerDeclarations (goTranspiler);
    // destructured element read straight into a scalar local
    installCcxtGoElementReadJoins (goTranspiler);
    // the scalar-literal locals of the same shape
    installCcxtGoScalarLiteralLift (goTranspiler);
    installCcxtGoElementReadUnbox (goTranspiler);
}

// ---------------------------------------------------------------------------------------------
// Container element reads: `var x map[string]any = MapTyped(GetValue(c, k))` / `ArrayTyped(...)`.
// Answered through the printer's own container predicates, so admission and emission agree.

function ccxtGoElementReadInitializer (declaration) {
    let node = declaration?.initializer;
    while ((node !== undefined) && ((node.kind === ts.SyntaxKind.ParenthesizedExpression)
        || (node.kind === ts.SyntaxKind.AsExpression) || (node.kind === ts.SyntaxKind.NonNullExpression))) {
        node = node.expression;
    }
    if ((node === undefined) || (node.kind !== ts.SyntaxKind.ElementAccessExpression) || (node.questionDotToken !== undefined)) {
        return undefined;
    }
    return node;
}

const CCXT_GO_ELEMENT_READ_STRUCT_NAMES = /OrderBook|ArrayCache|Client|Future/;

function ccxtGoElementReadIsObject (checker, type) {
    const parts = (type?.isUnion?. ()) ? type.types : [ type ];
    return parts.some ((t) => (t?.symbol !== undefined) && (((t.symbol.flags & ts.SymbolFlags.Class) !== 0)
        || CCXT_GO_ELEMENT_READ_STRUCT_NAMES.test (checker.typeToString (t))));
}

function ccxtGoElementReadLocalType (goTranspiler, declaration, family) {
    if ((declaration?.kind !== ts.SyntaxKind.VariableDeclaration) || (declaration.name?.kind !== ts.SyntaxKind.Identifier)) {
        return undefined;
    }
    if (declaration.parent?.parent?.kind !== ts.SyntaxKind.VariableStatement) {
        return undefined;
    }
    const initializer = ccxtGoElementReadInitializer (declaration);
    if (initializer === undefined) {
        return undefined;
    }
    if ((typeof goTranspiler.goDeclaredLocalTypeIfSafe !== 'function') || (typeof goTranspiler.goSafeDictUseReadsTheMap !== 'function')
        || (typeof goTranspiler.goSafeListUseReadsTheList !== 'function') || (typeof goTranspiler.hasNodeWhere !== 'function')) {
        return undefined;
    }
    const sourceName = declaration.name.escapedText;
    const scope = goTranspiler.goEnclosingFunction (declaration);
    if (scope === undefined) {
        return undefined;
    }
    const refersTo = (typeof goTranspiler.goIdentifierRefersToDeclaration === 'function')
        ? (n) => goTranspiler.goIdentifierRefersToDeclaration (n, declaration) : () => true;
    const skipUse = (n) => ((n.parent?.kind === ts.SyntaxKind.PropertyAccessExpression) && (n.parent.name === n))
        || ((n.parent?.kind === ts.SyntaxKind.PropertyAssignment) && (n.parent.name === n)) || !refersTo (n);
    let uses = 0;
    goTranspiler.hasNodeWhere (scope, (n) => {
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.escapedText === sourceName) && (n !== declaration.name) && !skipUse (n)) {
            uses += 1;
        }
        return false;
    });
    if (uses === 0) {
        return undefined;
    }
    const dictLike = (family === 'map');
    const printer = goTranspiler;
    // a string or a list would read differently through the converted local
    const checker = (typeof printer.checkerOrUndefined === 'function') ? printer.checkerOrUndefined () : undefined;
    if (checker === undefined) {
        return undefined;
    }
    const valueType = checker.getTypeAtLocation (declaration.name);
    const parts = (valueType?.isUnion?. ()) ? valueType.types : [ valueType ];
    const isList = (t) => checker.isArrayType (t) || checker.isTupleType (t);
    const scalarFlags = ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.BigIntLike;
    if (!dictLike && !parts.every ((t) => isList (t) || ((t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) !== 0))) {
        return undefined;
    }
    if (dictLike && parts.some ((t) => isList (t) || ((t.flags & scalarFlags) !== 0))) {
        return undefined;
    }
    // ws caches, order books and clients are Go structs read by reflect: MapTyped would drop them
    for (let node = initializer; node?.kind === ts.SyntaxKind.ElementAccessExpression; node = node.expression) {
        if (ccxtGoElementReadIsObject (checker, checker.getTypeAtLocation (node.expression))) {
            return undefined;
        }
    }
    if (ccxtGoElementReadIsObject (checker, valueType)) {
        return undefined;
    }
    // the key must fit the container family, or the typed conversion would hide the value
    const keyFits = (key) => {
        if (key === undefined) {
            return false;
        }
        if (dictLike) {
            return ((key.kind === ts.SyntaxKind.StringLiteral) || (key.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral))
                && !(/^[+-]?[0-9]+$/).test (key.text);
        }
        return (typeof printer.goIntIndexExpression === 'function') && printer.goIntIndexExpression (key);
    };
    const reads = (n) => {
        const parent = n.parent;
        if (parent?.kind === ts.SyntaxKind.ElementAccessExpression) {
            if (!keyFits (parent.argumentExpression)) {
                return false;
            }
        } else if (parent?.kind === ts.SyntaxKind.CallExpression) {
            const callee = (typeof printer.goPrintedCallee === 'function') ? printer.goPrintedCallee (printer.printNode (parent, 0)) : undefined;
            if ((callee === undefined) || (/IsDictionary$/).test (callee)) {
                return false; // a nil map is still a dictionary
            }
            if (((callee === 'GetValue') || /^(?:this\.)?Safe[A-Z]/.test (callee)) && !keyFits (parent.arguments[1])) {
                return false;
            }
        } else if ((parent?.kind === ts.SyntaxKind.PropertyAccessExpression) && (parent.name?.escapedText === 'push')) {
            return false; // a push appends to the local copy only
        }
        return dictLike ? printer.goSafeDictUseReadsTheMap (n) : printer.goSafeListUseReadsTheList (n);
    };
    return goTranspiler.goDeclaredLocalTypeIfSafe (declaration, dictLike ? CCXT_GO_SAFE_DICT_LOCAL_TYPE : CCXT_GO_SAFE_LIST_LOCAL_TYPE, reads, skipUse);
}

function installCcxtGoElementReadUnbox (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoElementReadUnboxInstalled) {
        return;
    }
    if ((typeof goTranspiler.goSafeDictLocalUnbox !== 'function') || (typeof goTranspiler.goSafeListLocalUnbox !== 'function')
        || (typeof goTranspiler.goSafeDictUnboxValue !== 'function') || (typeof goTranspiler.goSafeListUnboxValue !== 'function')) {
        return;
    }
    const innerDictType = goTranspiler.goSafeDictLocalUnbox;
    const innerListType = goTranspiler.goSafeListLocalUnbox;
    const innerDictValue = goTranspiler.goSafeDictUnboxValue;
    const innerListValue = goTranspiler.goSafeListUnboxValue;
    const cache = new Map ();
    const own = (printer, declaration, family) => {
        const key = declaration;
        if (!cache.has (key)) {
            cache.set (key, {}); // in-progress guard: a recursive query answers untyped
            cache.set (key, { map: ccxtGoElementReadLocalType (printer, declaration, 'map'), list: ccxtGoElementReadLocalType (printer, declaration, 'list') });
        }
        return cache.get (key)[family];
    };
    goTranspiler.goSafeDictLocalUnbox = function (declaration) {
        return innerDictType.call (this, declaration) ?? own (this, declaration, 'map');
    };
    goTranspiler.goSafeListLocalUnbox = function (declaration) {
        return innerListType.call (this, declaration) ?? own (this, declaration, 'list');
    };
    goTranspiler.goSafeDictUnboxValue = function (declaration, identation) {
        if ((innerDictType.call (this, declaration) === undefined) && (own (this, declaration, 'map') !== undefined)) {
            return 'MapTyped(' + this.printNode (declaration.initializer, identation).trimStart () + ')';
        }
        return innerDictValue.call (this, declaration, identation);
    };
    goTranspiler.goSafeListUnboxValue = function (declaration, identation) {
        if ((innerListType.call (this, declaration) === undefined) && (own (this, declaration, 'list') !== undefined)) {
            return 'ArrayTyped(' + this.printNode (declaration.initializer, identation).trimStart () + ')';
        }
        return innerListValue.call (this, declaration, identation);
    };
    goTranspiler.__ccxtGoElementReadUnboxInstalled = true;
}

// ---------------------------------------------------------------------------------------------
// Producer declarations: `var x T = <generated producer>(...)`
//
const CCXT_GO_PRODUCER_DECLARATIONS = {
    'this.FindMessageHashes': 'list',
    'this.MarketIds': 'list',
    'this.MarketSymbols': 'list',
    'this.ParseOrders': 'list',
    'this.OutcomesByMarketId': 'list',
    'this.ParseSearchQueries': 'list',
    'this.CreateOrderSettlementData': 'map',
    'this.ParseEventToMarkets': 'list',
    'this.WrapAsPostAction': 'map',
    'this.BuildClobOrderBody': 'map',
    'this.CreateOrderRequest': 'map',
    'this.ExpandGroupRows': 'list',
    'this.GetOrderChannelAndMessageHash': 'list',
    'this.ParseTradingFee': 'map',
    'this.BuildOHLCVC': 'list',
    'this.BuildOrderbookOrder': 'map',
    'this.HandleTriggerPricesAndParams': 'list',
    'this.OpinionOrderRawAmounts': 'map',
    'this.ParseBinaryMarketToOutcomes': 'list',
    'this.ParseCancelOrders': 'list',
    'this.ParseFundingRate': 'map',
    'this.ParseMarketLeverageTiers': 'list',
    'this.ParseOHLCVs': 'list',
    'this.ParseTrade': 'map',
    'this.ParseTransaction': 'map',
    'this.ParseWsOHLCVs': 'list',
    'this.PolymarketOrderRawAmounts': 'map',
    'this.SignPredictfunOrder': 'map',
    'this.AddKeyInArrayItems': 'list',
    'this.BuildGen2SubscriptionRequest': 'list',
    'this.CancelOrderRequest': 'map',
    'this.CancelOrdersRequest': 'map',
    'this.ClobOrderMessage': 'map',
    'this.ConstructPhantomAgent': 'map',
    'this.ConvertTradingViewToOHLCV': 'list',
    'this.CreateOrdersRequest': 'list',
    'this.CreatePublicSubscriptionRequest': 'map',
    'this.CreateSpotOrderRequest': 'map',
    'this.CreateTransferSettlementData': 'map',
    'this.CreateWithdrawalSettlementData': 'map',
    'this.CurrencyIds': 'list',
    'this.CustomParseBidAsk': 'list',
    'this.CustomParseOrderBook': 'map',
    'this.EditContractOrderRequest': 'map',
    'this.EditOrderRequest': 'map',
    'this.EditOrdersRequest': 'map',
    'this.GetListFromObjectValues': 'list',
    'this.IndexPositionBreakList': 'map',
    'this.OrdersToTrades': 'list',
    'this.ParseAccountPosition': 'map',
    'this.ParseAccountPositions': 'list',
    'this.ParseBorrowInterests': 'list',
    'this.ParseBorrowRate': 'map',
    'this.ParseContractBidsAsks': 'list',
    'this.ParseCurrency': 'map',
    'this.ParseDepositAddress': 'map',
    'this.ParseFundingRateHistory': 'map',
    'this.ParseFundingRateWs': 'map',
    'this.ParseGreeks': 'map',
    'this.ParseLeverage': 'map',
    'this.ParseMarginLoan': 'map',
    'this.ParseMarginModification': 'map',
    'this.ParseMarginModifications': 'list',
    'this.ParseMarket': 'map',
    'this.ParseMarkets': 'list',
    'this.ParseMyTrade': 'map',
    'this.ParseMyriadMarket': 'map',
    'this.ParseOpenInterest': 'map',
    'this.ParseOpinionMarket': 'map',
    'this.ParseOrderBookBidAsk': 'list',
    'this.ParseOrderBookBidsAsks': 'list',
    'this.ParsePosition': 'map',
    'this.ParsePredictionPosition': 'map',
    'this.ParsePredictionPositions': 'list',
    'this.ParseSettlement': 'map',
    'this.ParseSettlements': 'list',
    'this.ParseTopicMarket': 'map',
    'this.ParseTradingFees': 'map',
    'this.ParseTransfer': 'map',
    'this.ParseWsBalance': 'map',
    'this.ParseWsFundingRate': 'map',
    'this.ParseWsTrade': 'map',
    'this.PostActionRequest': 'map',
    'this.PrepareAccountRequest': 'map',
    'this.SafePredictionOrder': 'map',
    'this.SafePredictionPosition': 'map',
    'this.SafePredictionTicker': 'map',
    'this.SafePredictionTrade': 'map',
    'this.SeparateBidsOrAsks': 'list',
};

const CCXT_GO_PRODUCER_DICT_TYPE = 'map[string]any';
const CCXT_GO_PRODUCER_LIST_TYPE = '[]any';

// the container type a producer declaration can carry, or undefined when the site keeps its box
function ccxtGoProducerDeclarationType (goTranspiler, declaration, family) {
    if ((declaration === undefined) || (declaration.kind !== ts.SyntaxKind.VariableDeclaration)
        || (declaration.name === undefined) || (declaration.name.kind !== ts.SyntaxKind.Identifier)) {
        return undefined;
    }
    // only a declaration statement prints `var x T = ...`; a for-init or an assignment keeps the box
    if ((declaration.parent === undefined) || (declaration.parent.parent === undefined)
        || (declaration.parent.parent.kind !== ts.SyntaxKind.VariableStatement)) {
        return undefined;
    }
    const initializer = declaration.initializer;
    if ((initializer === undefined) || (initializer.kind !== ts.SyntaxKind.CallExpression)
        || (initializer.questionDotToken !== undefined)) {
        return undefined;
    }
    const callee = initializer.expression;
    if ((callee === undefined) || (callee.kind !== ts.SyntaxKind.PropertyAccessExpression)
        || (callee.questionDotToken !== undefined) || (callee.expression === undefined)
        || (callee.expression.kind !== ts.SyntaxKind.ThisKeyword) || (callee.name === undefined)) {
        return undefined;
    }
    // the table is keyed by the printed Go name; the ts callee is camelCase
    const goName = callee.name.text.charAt (0).toUpperCase () + callee.name.text.slice (1);
    if (CCXT_GO_PRODUCER_DECLARATIONS['this.' + goName] !== family) {
        return undefined;
    }
    const dictLike = (family === 'map');
    const goType = dictLike ? CCXT_GO_PRODUCER_DICT_TYPE : CCXT_GO_PRODUCER_LIST_TYPE;
    if ((typeof goTranspiler.goDeclaredLocalTypeIfSafe !== 'function')
        || (typeof goTranspiler.goSafeDictUseReadsTheMap !== 'function')
        || (typeof goTranspiler.goSafeListUseReadsTheList !== 'function')) {
        return undefined; // older printer without the container read scans: nothing to extend
    }
    const readsTheValue = dictLike
        ? (n) => goTranspiler.goSafeDictUseReadsTheMap (n)
        : (n) => goTranspiler.goSafeListUseReadsTheList (n);
    return goTranspiler.goDeclaredLocalTypeIfSafe (declaration, goType, readsTheValue);
}

// the initializer a typed producer local is declared with: the same call, its boxed result
// re-boxed into the container the declaration names (nil when the call answered absent)
function ccxtGoProducerUnboxValue (goTranspiler, declaration, identation, family) {
    if (ccxtGoProducerDeclarationType (goTranspiler, declaration, family) === undefined) {
        return undefined;
    }
    const printed = goTranspiler.printNode (declaration.initializer, identation);
    return ((family === 'map') ? 'MapTyped(' : 'ArrayTyped(') + printed.trimStart () + ')';
}

function installCcxtGoProducerDeclarations (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoProducerDeclarationsInstalled) {
        return;
    }
    if ((typeof goTranspiler.goSafeDictLocalUnbox !== 'function') || (typeof goTranspiler.goSafeListLocalUnbox !== 'function')
        || (typeof goTranspiler.goSafeDictUnboxValue !== 'function') || (typeof goTranspiler.goSafeListUnboxValue !== 'function')) {
        return; // older printer without the container unbox: nothing to extend
    }
    const shippedDictType = goTranspiler.goSafeDictLocalUnbox;
    const shippedListType = goTranspiler.goSafeListLocalUnbox;
    const shippedDictValue = goTranspiler.goSafeDictUnboxValue;
    const shippedListValue = goTranspiler.goSafeListUnboxValue;
    // the shipped predicate and the CCXT container families decide first, so a site they
    // already type is emitted byte for byte as before
    goTranspiler.goSafeDictLocalUnbox = function (declaration) {
        const known = shippedDictType.call (this, declaration);
        return (known !== undefined) ? known : ccxtGoProducerDeclarationType (this, declaration, 'map');
    };
    goTranspiler.goSafeListLocalUnbox = function (declaration) {
        const known = shippedListType.call (this, declaration);
        return (known !== undefined) ? known : ccxtGoProducerDeclarationType (this, declaration, 'list');
    };
    // a producer declaration has no shipped unbox record, so it prints its own value first
    goTranspiler.goSafeDictUnboxValue = function (declaration, identation) {
        if (shippedDictType.call (this, declaration) === undefined) {
            const produced = ccxtGoProducerUnboxValue (this, declaration, identation, 'map');
            if (produced !== undefined) {
                return produced;
            }
        }
        return shippedDictValue.call (this, declaration, identation);
    };
    goTranspiler.goSafeListUnboxValue = function (declaration, identation) {
        if (shippedListType.call (this, declaration) === undefined) {
            const produced = ccxtGoProducerUnboxValue (this, declaration, identation, 'list');
            if (produced !== undefined) {
                return produced;
            }
        }
        return shippedListValue.call (this, declaration, identation);
    };
    goTranspiler.__ccxtGoProducerDeclarationsInstalled = true;
}

// --- a destructured element read into a scalar local --------------------------------
// `let x = false; ... [ x, p ] = this.handleOptionAndParams (...)`: the declaration
// already carries the literal's type, so the element read is the only demoting use.

const CCXT_GO_ELEMENT_READ_TYPES = [
    { type: 'bool', reader: 'GetValueBool', fallback: 'false' },
];

const CCXT_GO_ELEMENT_READ_COMPARISONS = [
    ts.SyntaxKind.EqualsEqualsToken,
    ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsToken,
    ts.SyntaxKind.ExclamationEqualsEqualsToken,
];

function ccxtGoElementReadEntry (goType) {
    const found = CCXT_GO_ELEMENT_READ_TYPES.filter ((entry) => entry.type === goType);
    return (found.length === 1) ? found[0] : undefined;
}

// the reads whose answer a folded scalar keeps: a comparison against `true`
// (a box holding anything else answers false, the folded value does too) or a truthiness
// test. `x == false` is not one of them, so it stays vetoed.
function ccxtGoElementReadIsSafe (node) {
    const parent = node.parent;
    if (parent === undefined) {
        return false;
    }
    if (parent.kind === ts.SyntaxKind.ParenthesizedExpression) {
        return ccxtGoElementReadIsSafe (parent);
    }
    if (parent.kind === ts.SyntaxKind.BinaryExpression) {
        const other = (parent.left === node) ? parent.right : parent.left;
        return (CCXT_GO_ELEMENT_READ_COMPARISONS.indexOf (parent.operatorToken.kind) >= 0)
            && (other?.kind === ts.SyntaxKind.TrueKeyword);
    }
    if ((parent.kind === ts.SyntaxKind.IfStatement) || (parent.kind === ts.SyntaxKind.WhileStatement)
            || (parent.kind === ts.SyntaxKind.DoStatement)) {
        return parent.expression === node;
    }
    if (parent.kind === ts.SyntaxKind.ForStatement) {
        return parent.condition === node;
    }
    if (parent.kind === ts.SyntaxKind.ConditionalExpression) {
        return parent.condition === node;
    }
    return false;
}

function ccxtGoElementReadFindDeclaration (scope, name) {
    let found;
    const walk = (node) => {
        if ((found !== undefined) || (typeof node?.kind !== 'number')) {
            return;
        }
        if ((node.kind === ts.SyntaxKind.VariableDeclaration) && isIdentifierNamed (node.name, name)) {
            found = node;
            return;
        }
        ts.forEachChild (node, walk);
    };
    ts.forEachChild (scope, walk);
    return found;
}

// the declared type this family can prove for `declaration`, or undefined
function ccxtGoElementReadDeclarationType (goTranspiler, declaration, varName) {
    const name = (varName !== undefined) ? varName : (ts.isIdentifier (declaration?.name) ? declaration.name.escapedText : undefined);
    if (name === undefined) {
        return undefined;
    }
    if ((declaration?.initializer?.kind !== ts.SyntaxKind.TrueKeyword)
            && (declaration?.initializer?.kind !== ts.SyntaxKind.FalseKeyword)) {
        return undefined;
    }
    const scope = (typeof goTranspiler.goEnclosingFunction === 'function') ? goTranspiler.goEnclosingFunction (declaration) : undefined;
    if (scope === undefined) {
        return undefined;
    }
    let elementReads = 0;
    let rejected = false;
    const walk = (node) => {
        if (rejected) {
            return;
        }
        if ((node !== scope) && (node !== declaration) && (FUNCTION_LIKE_KINDS.indexOf (node.kind) >= 0)) {
            rejected = scopeMentionsIdentifier (node, name); // a closure over the local
            return;
        }
        if ((node !== declaration) && (node.kind === ts.SyntaxKind.VariableDeclaration)
                && isIdentifierNamed (node.name, name)) {
            rejected = true; // another binding of the name: the reads may belong to it
            return;
        }
        if ((node !== declaration.name) && isIdentifierNamed (node, name)) {
            const parent = node.parent;
            const destructuring = parent?.parent;
            if ((parent?.kind === ts.SyntaxKind.ArrayLiteralExpression)
                    && (destructuring?.kind === ts.SyntaxKind.BinaryExpression) && (destructuring.left === parent)
                    && (destructuring.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
                elementReads += 1; // `[ x, p ] = ...`: the write this family rewrites
            } else if ((parent?.kind === ts.SyntaxKind.BinaryExpression)
                    && (parent.left === node) && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
                if ((parent.right?.kind !== ts.SyntaxKind.TrueKeyword)
                        && (parent.right?.kind !== ts.SyntaxKind.FalseKeyword)) {
                    rejected = true; // another write shape: its value would not survive the type
                }
            } else if (!ccxtGoElementReadIsSafe (node)) {
                rejected = true;
            }
            return;
        }
        ts.forEachChild (node, walk);
    };
    ts.forEachChild (scope, walk);
    return (rejected || (elementReads === 0)) ? undefined : 'bool';
}

const CCXT_GO_ARRAY_BINDING_READ = /^([ \t]*)([A-Za-z_]\w*) = GetValue\(([A-Za-z_]\w*), (\d+)\)$/;

// the element read of a proven target, retyped; every other printed line is returned as it is
function retypeElementReadAssignment (goTranspiler, node, printed) {
    if ((typeof printed !== 'string') || (node?.operatorToken?.kind !== ts.SyntaxKind.EqualsToken)
            || (node.left?.kind !== ts.SyntaxKind.ArrayLiteralExpression)) {
        return printed;
    }
    const scope = (typeof goTranspiler.goEnclosingFunction === 'function') ? goTranspiler.goEnclosingFunction (node) : undefined;
    if (scope === undefined) {
        return printed;
    }
    return printed.split ('\n').map ((line) => {
        const match = CCXT_GO_ARRAY_BINDING_READ.exec (line);
        if (match === null) {
            return line;
        }
        const declaration = ccxtGoElementReadFindDeclaration (scope, match[2]);
        const entry = ccxtGoElementReadEntry (ccxtGoElementReadDeclarationType (goTranspiler, declaration, match[2]));
        if (entry === undefined) {
            return line;
        }
        return match[1] + match[2] + ' = ' + entry.reader + '(' + match[3] + ', ' + match[4] + ', ' + entry.fallback + ')';
    }).join ('\n');
}

// wrap the element read and the one veto that demoted these declarations
function installCcxtGoElementReadJoins (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__ccxtGoElementReadJoinsInstalled) {
        return;
    }
    if (typeof goTranspiler.goLocalIsSafeToType === 'function') {
        const upstreamSafe = goTranspiler.goLocalIsSafeToType;
        goTranspiler.goLocalIsSafeToType = function (scope, declaration, varName, goType) {
            if (upstreamSafe.call (this, scope, declaration, varName, goType)) {
                return true;
            }
            return ccxtGoElementReadDeclarationType (this, declaration, varName) === goType;
        };
    }
    if (typeof goTranspiler.printCustomBinaryExpressionIfAny === 'function') {
        const upstreamBinary = goTranspiler.printCustomBinaryExpressionIfAny;
        goTranspiler.printCustomBinaryExpressionIfAny = function (node, identation) {
            return retypeElementReadAssignment (this, node, upstreamBinary.call (this, node, identation));
        };
    }
    goTranspiler.__ccxtGoElementReadJoinsInstalled = true;
}

// ------------------------- L-B: scalar-literal local lift (string) -------------------------

// The string twin of the pinned native-concat family. `var x any = "lit"` and
// `var x any = "a" + b` hold a plain Go string, but the pinned predicate demotes them
// when a leaf proof misses the printed form (`*sym` on a derefable `*string`, a call the

// the string-returning helpers the write rule may name: each entry is a pinned Go
// signature returning a plain `string`, none of them part of the printer tables.
// go/v4/exchange_helpers.go:1685 `func Replace(input any, old any, new any) string`
const CCXT_GO_SCALAR_LIFT_WRITE_CALLEES = {
    'Replace': 'string',
};

// a leaf of the `+` chain that prints as a non-nil Go string: the printer's own operand
// proof, or the deref the chain printer adds for an operand it proved derefable
function ccxtGoScalarLiftLeafIsString (goTranspiler, leaf, chainHasStringProof) {
    if (goStringOperand (goTranspiler, leaf)) {
        return true;
    }
    if (goPrinterDerefStringOperand (goTranspiler, leaf, chainHasStringProof)) {
        return true;
    }
    // `goNativeBinaryText` prefixes `*` when the operand is a derefable `*string`, so the
    // printed chain holds the pointee: the ast's own gate for that deref is the proof
    return (typeof goTranspiler.goDerefableStringOperand === 'function')
        && (goTranspiler.goDerefableStringOperand (leaf) === true);
}

// the initializer a lifted declaration is printed with: a string literal, or a `+` chain
// the printer concatenated natively and whose every leaf is a Go string
function ccxtGoScalarLiftInitializer (goTranspiler, node, declaration) {
    const initializer = declaration?.initializer;
    if (declaration?.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    if ((initializer?.kind === ts.SyntaxKind.StringLiteral)
        || (initializer?.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral)) {
        return initializer;
    }
    if ((initializer?.kind !== ts.SyntaxKind.BinaryExpression)
        || (initializer.operatorToken?.kind !== ts.SyntaxKind.PlusToken)) {
        return undefined;
    }
    if (node?.parent?.kind !== ts.SyntaxKind.FirstStatement) {
        return undefined; // a `for` initializer prints `x := ...`: nothing to declare
    }
    if (goPrintedTextHasBareAddCall (goTranspiler.printNode (initializer, 0))) {
        return undefined; // the `Add(...)` shape belongs to the typed-concat families
    }
    const leaves = goNativeConcatLeaves (initializer);
    if (leaves.length < 2) {
        return undefined;
    }
    const chainHasStringProof = leaves.some ((leaf) => goStringOperand (goTranspiler, leaf));
    for (const leaf of leaves) {
        if (!ccxtGoScalarLiftLeafIsString (goTranspiler, leaf, chainHasStringProof)) {
            return undefined;
        }
    }
    return initializer;
}

// the call a write hands its value to, as the printer spells it, or undefined
function ccxtGoScalarLiftWrittenType (goTranspiler, right) {
    if (right?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = right.expression;
    const name = (callee?.kind === ts.SyntaxKind.PropertyAccessExpression) ? callee.name?.escapedText
        : ((callee?.kind === ts.SyntaxKind.Identifier) ? callee.escapedText : undefined);
    if (typeof name !== 'string') {
        return undefined;
    }
    const printed = goTranspiler.printNode (right, 0);
    const known = goTranspiler.goTypeOfInitializer (right, printed);
    if (known !== undefined) {
        return known;
    }
    return (CCXT_GO_SCALAR_LIFT_WRITE_CALLEES[name] !== undefined)
        ? CCXT_GO_SCALAR_LIFT_WRITE_CALLEES[name]
        : ((CCXT_GO_HELPER_RETURN_TYPES[name] !== undefined) ? CCXT_GO_HELPER_RETURN_TYPES[name] : undefined);
}

// true when a later mention of the local makes the declared type a lie: every write has to
// keep the literal's type and every read has to be a value position
function ccxtGoScalarLiftVetoed (goTranspiler, declaration, varName, goType) {
    if (typeof goTranspiler.goEnclosingFunction !== 'function') {
        return true; // no scope to scan: never answer a type
    }
    const scope = goTranspiler.goEnclosingFunction (declaration);
    if (scope === undefined) {
        return true;
    }
    let vetoed = false;
    const visit = (n) => {
        if (vetoed) {
            return;
        }
        if ((n.kind === ts.SyntaxKind.Identifier) && (n.escapedText === varName) && (n !== declaration.name)) {
            const parent = n.parent;
            if (parent === undefined) {
                vetoed = true; // nothing to prove the position from
                return;
            }
            if ((parent.kind === ts.SyntaxKind.BinaryExpression) && (parent.left === n)) {
                const op = parent.operatorToken.kind;
                if (op === ts.SyntaxKind.EqualsToken) {
                    if (ccxtGoScalarLiftWrittenType (goTranspiler, parent.right) !== goType) {
                        vetoed = true; // `x = <other value>`: the box was widened for it
                        return;
                    }
                } else if ((op >= ts.SyntaxKind.FirstCompoundAssignment) && (op <= ts.SyntaxKind.LastCompoundAssignment)) {
                    vetoed = true; // `x += ...`
                    return;
                }
            }
            if (((parent.kind === ts.SyntaxKind.PrefixUnaryExpression) || (parent.kind === ts.SyntaxKind.PostfixUnaryExpression))
                && ((parent.operator === ts.SyntaxKind.PlusPlusToken) || (parent.operator === ts.SyntaxKind.MinusMinusToken))) {
                vetoed = true; // `x++`
                return;
            }
            if (((parent.kind === ts.SyntaxKind.PropertyAccessExpression) || (parent.kind === ts.SyntaxKind.ElementAccessExpression))
                && (parent.expression === n)) {
                vetoed = true; // `x.key` / `x[i]`: the printer reads those as members
                return;
            }
            if ((parent.kind === ts.SyntaxKind.SpreadElement)
                || ((parent.kind === ts.SyntaxKind.ArrayLiteralExpression) && (parent.parent?.left === parent))
                || ((parent.kind === ts.SyntaxKind.CallExpression) && (parent.expression === n))
                || ((parent.kind === ts.SyntaxKind.PropertyAccessExpression) && (parent.name === n))) {
                vetoed = true; // `...x`, `[x] = ...`, `x(...)`, `o.x`
                return;
            }
            if ((parent.kind === ts.SyntaxKind.BinaryExpression)
                && ((parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken)
                    || (parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsToken)
                    || (parent.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken)
                    || (parent.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken))
                && (isNilLiteralExpression (parent.left) || isNilLiteralExpression (parent.right))) {
                vetoed = true; // `x == nil` does not compile against a Go string
                return;
            }
            let container = n;
            while ((container !== undefined) && ((container.parent?.kind === ts.SyntaxKind.ArrayLiteralExpression)
                || (container.parent?.kind === ts.SyntaxKind.ObjectLiteralExpression)
                || (container.parent?.kind === ts.SyntaxKind.PropertyAssignment)
                || (container.parent?.kind === ts.SyntaxKind.ShorthandPropertyAssignment)
                || (container.parent?.kind === ts.SyntaxKind.SpreadElement))) {
                container = container.parent;
            }
            const top = container?.parent;
            if ((top?.kind === ts.SyntaxKind.BinaryExpression) && (top.left === container)
                && (top.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
                vetoed = true; // `[x, y] = ...` / `({ x } = o)`: the element write is a GetValue
                return;
            }
            if ((top?.kind === ts.SyntaxKind.ForOfStatement) || (top?.kind === ts.SyntaxKind.ForInStatement)) {
                vetoed = true; // iterating the value reads it as a container
                return;
            }
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return vetoed;
}

// wrap printVariableDeclarationList: a declaration the pinned predicate left `any` is
// re-typed when the family's own rule proves the value never leaves the string domain.
function installCcxtGoScalarLiteralLift (goTranspiler) {
    if (goTranspiler.__ccxtGoScalarLiteralLiftInstalled || (typeof goTranspiler.printVariableDeclarationList !== 'function')) {
        return;
    }
    const upstream = goTranspiler.printVariableDeclarationList.bind (goTranspiler);
    goTranspiler.printVariableDeclarationList = (node, identation) => {
        const printed = upstream (node, identation);
        const declaration = (node?.declarations?.length === 1) ? node.declarations[0] : undefined;
        if (declaration === undefined
            || (ccxtGoScalarLiftInitializer (goTranspiler, node, declaration) === undefined)) {
            return printed;
        }
        if ((typeof goTranspiler.goTypeNameIsShadowed === 'function')
            && goTranspiler.goTypeNameIsShadowed (goTranspiler.goEnclosingFunction (declaration), 'string')) {
            return printed; // a binding named `string` would capture the type name
        }
        const nameText = goTranspiler.printNode (declaration.name, 0);
        const marker = 'var ' + nameText + ' any = ';
        const at = printed.indexOf (marker);
        if ((at < 0) || (printed.substring (0, at).trim () !== '')) {
            return printed; // not the simple `var x any = ...` form of this declaration
        }
        if (ccxtGoScalarLiftVetoed (goTranspiler, declaration, declaration.name.escapedText, 'string')) {
            return printed;
        }
        return printed.substring (0, at) + 'var ' + nameText + ' string = ' + printed.substring (at + marker.length);
    };
    goTranspiler.__ccxtGoScalarLiteralLiftInstalled = true;
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
