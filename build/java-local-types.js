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
// The declaration keep the printer's shape: only the type token is replaced; the value
// expression is untouched except for the explicit checkcasts above, which move no box.

import ts from 'typescript6';

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

// this.<name>(...) -> Java type the call sites print for the LOCALS. Declared return
// types of the hand-written Java base (`cast` entries are declared Object but hand back
// the named box on every path).
const LOCAL_THIS_RETURN_TYPES = {
    'parse8601': { type: 'Long' },
    'iso8601': { type: 'String' },
    'safeInteger2': { type: 'Long', cast: '(Long)' },
    'safeSymbol': { type: 'String', cast: '(String)' },
    'safeCurrencyCode': { type: 'String', cast: '(String)' },
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

function localInitializerType (printer, declaration) {
    const initializer = unwrapParens (declaration.initializer);
    if (initializer === undefined) {
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
        case ts.SyntaxKind.CallExpression: {
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee) || callee.expression.kind !== ts.SyntaxKind.ThisKeyword) {
                return false;
            }
            const name = callee.name.escapedText;
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
        default:
            return false;
    }
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
// the boxes the method-table families add: only the Object-level methods are provably
// legal on the box (Integer/Long/Double/Boolean all have the primitive accessor + the
// zero-arg `toString` the printer rewrites to String.valueOf)
const INTEGER_RECEIVER_METHODS = new Set ([ 'toString', 'intValue', 'longValue', 'doubleValue' ]);
const DOUBLE_RECEIVER_METHODS = new Set ([ 'toString', 'doubleValue', 'intValue', 'longValue' ]);
const BOOLEAN_RECEIVER_METHODS = new Set ([ 'toString', 'booleanValue' ]);

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
function isSafeToNarrow (printer, declaration, sourceName, javaType, isProFile, nonNull) {
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
            && nonNull === false) {
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
        if (ts.isBinaryExpression (parent) && parent.left === n) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                if (!isProvablyOfType (printer, unwrapParens (parent.right), javaType, sourceName)) {
                    return false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return false;
            }
        }
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            return false;
        }
    }
    return true;
}

function javaLocalTypeOf (printer, declaration) {
    if (!ts.isIdentifier (declaration.name)) {
        return undefined;
    }
    const info = localInitializerType (printer, declaration);
    if (info === undefined) {
        return undefined;
    }
    // scan by the SOURCE name: ReservedKeywordsReplacements renames the printed one
    const sourceName = declaration.name.escapedText;
    const fileName = declaration.getSourceFile ().fileName;
    const isProFile = /[\\/]pro[\\/]/.test (fileName);
    if (!isSafeToNarrow (printer, declaration, sourceName, info.type, isProFile, info.nonNull)) {
        return undefined;
    }
    return info;
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
        const info = javaLocalTypeOf (printer, declaration);
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
        if (!printedValueMatches (info, value)) {
            return printed; // unexpected shape — leave it as the printer emitted it
        }
        narrowed.set (declaration, info.type);
        const cast = info.cast === undefined ? '' : info.cast + ' ';
        return printed.slice (0, at) + `${iden}${info.type} ${printer.printNode (declaration.name)} = ${cast}${value}`;
    };
    // `x = this.safeSymbol(...)` etc. on a narrowed local: an Object-declared accessor
    // needs the same cast the declaration got; a call to a retyped signature needs none
    const originalBinary = printer.printBinaryExpression.bind (printer);
    printer.printBinaryExpression = function (node, identation) {
        const printed = originalBinary (node, identation);
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier (node.left)) {
            return printed;
        }
        const right = unwrapParens (node.right);
        if (right === undefined || !isThisCall (right)) {
            return printed;
        }
        const symbol = printer.getChecker ().getSymbolAtLocation (node.left);
        const declaration = symbol?.valueDeclaration;
        const javaType = (declaration !== undefined) ? narrowed.get (declaration) : undefined;
        if (javaType === undefined) {
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
            || (javaType === 'Long' && (call === 'safeInteger' || call === 'safeInteger2' || call === 'safeIntegerN'))
            || (javaType === 'String' && (JAVA_STRING_RETURN_METHODS_CASE_CAST.has (call)
                || call === 'safeStringUpper' || call === 'safeStringLower'
                || call === 'safeStringUpper2' || call === 'safeStringLower2'
                || call === 'safeStringUpperN' || call === 'safeStringLowerN'));
        const cast = needsCast ? (javaType === 'String' ? '(String)' : '(Long)') : '';
        if (cast === '') {
            return printed;
        }
        const marker = `${printer.printNode (node.left, 0)} = this.`;
        const at = printed.indexOf (marker);
        if (at === -1) {
            return printed;
        }
        const head = at + marker.length - 'this.'.length;
        return printed.slice (0, head) + cast + ' ' + printed.slice (head);
    };
    printer._javaLocalTypesPatched = true;
}
