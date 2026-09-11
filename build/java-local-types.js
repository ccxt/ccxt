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
//   * patchJavaNumericMethodReturns() below retypes the GENERATED methods (parseToInt,
//     safeNumber, safeNumber2, safeNumberN) at print time by wrapping printFunctionType
//     — their signatures live below the "METHODS BELOW THIS LINE" delimiter (rewritten
//     from ts/src/base/Exchange.ts by every regen), so a text edit would not survive.
//
// JAVA TRAPS this section encodes (each differential-tested with a javac harness):
//   * a PRIMITIVE local cannot hold null: `int x; x = null` does not compile, so a
//     nullish write rejects the int family outright (parseTimeframe never returns null,
//     but the guard costs nothing).
//   * ternary ARMS: `cond ? 0 : this.parseToInt (x)` is a REFERENCE conditional while
//     parseToInt prints `Object`, and becomes a NUMERIC conditional the moment the arm
//     is statically Long — javac then applies binary numeric promotion and UNBOXES the
//     arm, so a null return throws NPE where the baseline stored null. The retype is
//     therefore paired with patchJavaNumericConditionals: any conditional arm that is
//     one of the newly retyped calls gets a restoring `((Object) ...)` cast when the
//     other arm is a numeric literal or a different family box (10 sites tree-wide,
//     all `? ... parseToInt(...) : 0` / `? 0.00001 : safeNumber(...)`).
//   * `==` on boxed types compares REFERENCES: harmless here because the Java printer
//     never emits a raw `==`/`!=` — every comparison prints through Helpers.isEqual /
//     isGreaterThan / ... (Object-taking, value semantics; census over every generated
//     Core file found 0 raw comparisons outside comments). The guard is nonetheless the
//     usual one: an arm/use that would print an unboxing operator (++/--/compound
//     assignment/spread/typeof/`x as T`/array destructuring) rejects the local.
//   * INTEGER DIVISION differs from JS number division: `/` always prints
//     Helpers.divide (single Object,Object signature -> toDouble/toDouble -> JS
//     semantics) so a typed operand changes nothing; but `Helpers.subtract` is
//     OVERLOADED — subtract(int, int) returns a primitive int (Int32 wraparound, no
//     toDouble normalisation) where subtract(Object, Object) returned a Double box.
//     `int`-typed locals are therefore rejected as direct operands of `-` (census: 0
//     sites today; the guard mirrors build/csharp-local-types.js's subtract-on-int rule).
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

// GENERATED methods whose erased `Object` return type patchJavaNumericMethodReturns
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
// `this.milliseconds()` call resolves to the lib signature.
const NUMERIC_LIB_DTS_FILE = /(^|[\\/])node_modules[\\/]typescript6[\\/]lib[\\/]lib\..*\.d\.ts$/;

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
        return undefined;
    }
    const fileName = declaration.getSourceFile?.().fileName;
    if (fileName === undefined
        || (!NUMERIC_BASE_TIER_DECLARATION_FILE.test (fileName) && !NUMERIC_LIB_DTS_FILE.test (fileName))) {
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
// Helpers.subtract(a, x), whose (int, int) overload returns a primitive int where the
// Object overload returned a Double box — an int-typed operand must keep Object.
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
