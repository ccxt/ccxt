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
    printer._javaLocalTypesPatched = true;
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
    const initializer = declaration.initializer;
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
