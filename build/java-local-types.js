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

function localInitializerType (printer, declaration) {
    const initializer = unwrapParens (declaration.initializer);
    if (initializer === undefined || !isThisCall (initializer)) {
        return undefined;
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
    'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'sort', 'reverse', 'join', 'concat',
    'indexOf', 'lastIndexOf', 'includes', 'fill', 'copyWithin', 'map', 'filter', 'reduce',
    'reduceRight', 'forEach', 'some', 'every', 'find', 'findIndex', 'findLast', 'findLastIndex',
    'flat', 'flatMap', 'keys', 'values', 'entries', 'toString', 'at', 'remove', 'clear',
    'add', 'size', 'isEmpty', 'get', 'set', 'insert', 'append',
]);
const LONG_RECEIVER_METHODS = new Set ([ 'toString', 'valueOf', 'intValue', 'longValue', 'doubleValue' ]);

function receiverCallIsSafe (method, javaType) {
    if (javaType === 'String') {
        return STRING_RECEIVER_METHODS.has (method);
    }
    if (javaType === 'Long') {
        return LONG_RECEIVER_METHODS.has (method);
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
function isSafeToNarrow (printer, declaration, sourceName, javaType, isProFile) {
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
    if (!isSafeToNarrow (printer, declaration, sourceName, info.type, isProFile)) {
        return undefined;
    }
    return info;
}

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
        if (!value.startsWith ('this.')) {
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
    // (5) collection/dict helper locals (JAVA-RE-5, additive slice): a second,
    // independent patch of the same printer hooks — it keeps its own candidate table
    // and its own WeakMap of narrowed declarations, and declines every declaration the
    // hooks above already retyped (their marker lookup no-ops once the Object token is
    // gone). Installed here so both the main-thread Transpiler and the piscina worker
    // (which both call installJavaLocalTypes) get it.
    patchJavaCollectionLocalTypes (transpiler);
    printer._javaLocalTypesPatched = true;
}
