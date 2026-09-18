// CCXT-side extension of the Go printer's local-variable typing.
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
//      `this.ParseNumber`, `this.NumberToString`, `this.Iso8601` ... all return `any`
//      and are deliberately absent.
// The `this.Safe*` accessors and `Precise.String*` belong to the upstream printer
// (ast-transpiler#70/#75, ccxt#30054) and are intentionally not listed here.
//
// Both the main-thread transpiler (build/goTranspiler.ts setupTranspiler) and the
// Piscina worker (build/go-worker.js) must install this, or the two code paths
// emit different Go for the same source.

export const CCXT_GO_HELPER_RETURN_TYPES = {
    // exchange_functions.go / exchange_generic.go
    'this.ToArray': '[]any',
    'this.SortBy': '[]any',
    'this.SortBy2': '[]any',
    'this.FilterBy': '[]any',
    'this.Sort': '[]any',
    'this.ExtractParams': '[]any',
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
    // exchange_encode.go
    'this.Urlencode': 'string',
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
};

// Go type names that appear in the table above but that the printer's own
// goTypeNameIsShadowed does not know about (it checks string/int/int64/float64/
// bool/any). A transpiled local or parameter literally named `byte` would turn
// `var x []byte = ...` into a reference to that value.
const EXTRA_GO_TYPE_NAMES = [ 'byte' ];

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

// the CCXT helper's Go return type when `printedValue` is one whole call
// `Callee(args)` of a helper listed above, otherwise undefined
export function ccxtGoTypeOfPrintedCall (goTranspiler, printedValue) {
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
    return CCXT_GO_HELPER_RETURN_TYPES[callee];
}

export function installCcxtGoLocalTypes (goTranspiler) {
    if (goTranspiler === undefined || goTranspiler.__ccxtGoLocalTypesInstalled) {
        return;
    }
    if (typeof goTranspiler.goTypeOfInitializer !== 'function' || typeof goTranspiler.isWholePrintedCall !== 'function') {
        return; // older printer without local typing: nothing to extend
    }
    const upstream = goTranspiler.goTypeOfInitializer;
    goTranspiler.goTypeOfInitializer = function (initializer, printedValue) {
        const known = upstream.call (this, initializer, printedValue);
        if (known !== undefined) {
            return known;
        }
        const goType = ccxtGoTypeOfPrintedCall (this, printedValue);
        if (goType === undefined) {
            return undefined;
        }
        for (const typeName of EXTRA_GO_TYPE_NAMES) {
            if (goType.indexOf (typeName) >= 0) {
                const scope = (typeof this.goEnclosingFunction === 'function') ? this.goEnclosingFunction (initializer) : undefined;
                if (scopeMentionsIdentifier (scope, typeName)) {
                    return undefined;
                }
            }
        }
        return goType;
    };
    goTranspiler.__ccxtGoLocalTypesInstalled = true;
}

export default installCcxtGoLocalTypes;
