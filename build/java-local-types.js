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
    patchJavaDataflowTypes (transpiler);
}

// ===== 4. dataflow engine: accumulators, local propagation, ternary arms, scope safety =====
//
// (a) accumulator locals: the initializer's proven type is joined with EVERY later plain
//     `x = ...` write in the enclosing function, widening only along box-identical edges
//     (JAVA_WIDENING_EDGES — empty today: String and java.util.List<Object> have no
//     narrower/wider twin that is not `Object` itself). A null write (or a null
//     initializer) is neutral: Java has no nullable spelling, every type this engine
//     emits is a REFERENCE type, and `String x = null;` holds the same null as
//     `Object x = null;`. An unprovable or non-joinable write keeps the printer's Object.
// (b) local-to-local propagation: a read of another local resolves to that local's type
//     ONLY when the referenced declaration's full decision is recomputed here (a local
//     the output keeps `Object` proves nothing), under a cycle stack and a depth cap.
//     Java has no implicit Object -> T downcast, so `String b = a;` compiles only when
//     `a` is itself emitted with the same concrete type.
// (c) ternary arms: `cond ? a : b` takes the arm type when both arms are proven and equal,
//     or one is null (javac types `cond ? stringLocal : null` as String, and the boxed
//     runtime value is the same String or null either way). An arm that is a read of a
//     proven local resolves through (b). Two distinct proven types never unify — javac
//     would need a common supertype and the declaration would silently widen to Object.
// (d) scope safety: the name must have exactly ONE binding in the enclosing function, no
//     parameter/catch/destructuring binding of the same name, a unique printed name, and
//     no read before the declaration. Names are canonicalised through
//     printer.finalVarMutations because the printer renames identifiers inside object
//     literals in place (`x` -> `finalX`) while a body is printed.
//
// Java rules the engine encodes (each one is a real javac failure otherwise):
//   - NO implicit Object -> T downcast, and this engine injects NO casts: every accepted
//     value must already carry the declared static type in the printed Java.
//   - Integer / Long / int / Double are never joined or emitted (the numeric families
//     need their own audited slice; the printer prints bare literals as int boxes).
//   - a String local as the LEFT operand of `+` / `+=` moves the call from
//     Helpers.add(Object, Object) to add(String, ...), and those disagree whenever the
//     left is null and the right is null or a non-String: rejected unless the right
//     operand is provably a NON-NULL String (a string literal, or a nested provable `+`).
//   - receivers: `x.push(...)` / `x.join(...)` / `x.shift()` print hard
//     `((java.util.List<...>)x)` casts, the String methods print `((String)x)`; the
//     per-type whitelist of the surviving scan (receiverCallIsSafe) is reused.
//   - `typeof x === '...'` prints `x instanceof <box>` (inconvertible for the wrong
//     family) and `delete x[k]` prints a Map receiver cast: both rejected.
//   - WS/prediction files run build/javaTranspiler.ts#postProcessWsJava, whose
//     "String type fixes" pass rewrites `String x = this.<m>(...)` / `Helpers.<...>(...)`
//     back to `Object`: such a declaration — and every read resolving through it — is
//     declined.
//   - pro files: a local that feeds an inherited async call stays Object (the typed REST
//     wrapper overloads would win Java overload resolution once an argument is a String).
//
// What stays Object on purpose: every numeric family, every parameter copy (`const x =
// symbol;` resolves to a parameter, never to a local), element-access reads, awaits,
// object/array literals as values, and every self-referential accumulator write
// (`x = x + r` — the read of x inside the value has no type until this declaration
// decides one, and the read would be circular here).

const JAVA_DATAFLOW_STRING = 'String';
const MAX_DATAFLOW_DEPTH = 8;
const DATAFLOW_DEBUG = process.env['CCXT_JAVA_DATAFLOW_DEBUG'] === '1';

function dataflowDebug (message) {
    if (DATAFLOW_DEBUG) {
        console.error ('[java-dataflow] ' + message);
    }
}

// box-identical widening edges a join may take. EMPTY on purpose (see the header).
const JAVA_WIDENING_EDGES = [];

// identifiers that would break the emitted `<type> <name> = ` prefix if another binding
// in the same method carried them (a bind of `String` / `List` / `java` shadows the very
// tokens the declaration prints)
const JAVA_TYPE_TOKENS = [
    'String', 'Object', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Number',
    'Map', 'List', 'Character', 'Byte', 'Short', 'Void', 'java', 'util',
];

// Precise.string* statics are declared `public static String` in base/Precise.java and
// cannot be overridden (static, different class)
const PRECISE_STRING_STATICS = new Set ([
    'stringAdd', 'stringSub', 'stringMul', 'stringDiv', 'stringMod', 'stringAbs',
    'stringNeg', 'stringMax', 'stringMin', 'stringOr',
]);

// hand-written BaseExchange.java methods declared with a String return (`public String
// numberToString (Object)`, `public String iso8601 (Object)`) — no generated venue
// declares an override (census)
const DATAFLOW_STRING_BASE_METHODS = new Set ([ 'iso8601', 'numberToString' ]);

// the files build/javaTranspiler.ts#createJavaClass runs postProcessWsJava over
const DATAFLOW_WS_SOURCE_FILE = /[\\/](pro|prediction)[\\/]/;

// declarations whose full decision is being computed right now (`let a = a;`)
const dataflowClassifyInProgress = new Set ();

// the pre-mutation name of an identifier. finalVarMutations records (node, previous
// escapedText) for every in-place rewrite made while a body prints, so the FIRST record
// for a node is its original source name. Falls back to the live escapedText.
function dataflowCanonicalName (printer, node) {
    const mutations = printer?.finalVarMutations;
    if (Array.isArray (mutations)) {
        for (const mutation of mutations) {
            if (mutation.node === node) {
                return mutation.escapedText;
            }
        }
    }
    return node.escapedText;
}

// one walk per query: every Identifier grouped by its CANONICAL name, plus the binding
// tables the dataflow resolution reads. Deliberately NOT cached — the printer mutates
// identifier names in place while a body prints, so a cached index goes stale between
// two declarations of the same method.
function dataflowIndex (printer, scope) {
    const identifiers = new Map ();
    const declarations = new Map ();
    const parameterNames = new Set ();
    const blockedNames = new Set ();
    const bindingNames = new Set ();
    const bindingCounts = new Map ();
    const markBound = (name) => {
        const walk = (n) => {
            if (n?.kind === ts.SyntaxKind.Identifier) {
                blockedNames.add (dataflowCanonicalName (printer, n));
            }
            ts.forEachChild (n, walk);
        };
        walk (name);
    };
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.Identifier) {
            const name = dataflowCanonicalName (printer, n);
            let list = identifiers.get (name);
            if (list === undefined) {
                list = [];
                identifiers.set (name, list);
            }
            list.push (n);
        }
        if ((n.kind === ts.SyntaxKind.Parameter || n.kind === ts.SyntaxKind.VariableDeclaration)
            && n.name?.kind === ts.SyntaxKind.Identifier) {
            const printed = String (n.name.escapedText);
            bindingNames.add (printed);
            bindingCounts.set (printed, (bindingCounts.get (printed) ?? 0) + 1);
        }
        if (n.kind === ts.SyntaxKind.Parameter) {
            if (n.name?.kind === ts.SyntaxKind.Identifier) {
                parameterNames.add (dataflowCanonicalName (printer, n.name));
            }
            markBound (n.name);
        } else if (n.kind === ts.SyntaxKind.VariableDeclaration) {
            if (n.name?.kind === ts.SyntaxKind.Identifier) {
                const key = dataflowCanonicalName (printer, n.name);
                let list = declarations.get (key);
                if (list === undefined) {
                    list = [];
                    declarations.set (key, list);
                }
                list.push (n);
            } else {
                markBound (n.name); // a destructured binding never gets a concrete type
            }
        } else if (n.kind === ts.SyntaxKind.CatchClause && n.variableDeclaration !== undefined) {
            if (n.variableDeclaration.name?.kind === ts.SyntaxKind.Identifier) {
                parameterNames.add (dataflowCanonicalName (printer, n.variableDeclaration.name));
            }
            markBound (n.variableDeclaration.name);
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    return { identifiers, declarations, parameterNames, blockedNames, bindingNames, bindingCounts };
}

// is `identifier` a declaration/member name rather than a read or write of the local?
function dataflowNotAUse (identifier) {
    const parent = identifier.parent;
    if (parent === undefined) {
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
        case ts.SyntaxKind.ImportSpecifier:
            return parent.name === identifier;
    }
    return false;
}

// would a binding named after one of the type's tokens break the emitted declaration?
function dataflowTypeTokenCollides (index, javaType) {
    const tokens = javaType.match (/[A-Za-z_]\w*/g) ?? [];
    return tokens.some ((token) => JAVA_TYPE_TOKENS.includes (token) && index.bindingNames.has (token));
}

// is the printed Java of this `+` LEFT operand provably a NON-NULL String without any
// declaration change? Only proof-carrying shapes qualify: a string literal, or a nested
// `+` whose own left is provable (prints Helpers.add("lit", ...), declared String by
// add(String, String) / add(String, Object), which never returns null). An identifier is
// NOT provable here even when the local is typed: a null left plus a null/non-String
// right makes add(String, ...) and add(Object, Object) disagree (see the header).
function isProvablyStringOperand (node) {
    switch (node?.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return true;
        case ts.SyntaxKind.ParenthesizedExpression:
            return isProvablyStringOperand (node.expression);
        case ts.SyntaxKind.BinaryExpression:
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken && isProvablyStringOperand (node.left);
    }
    return false;
}

// a `this.<name>(...)` call whose Java return type is already the named type on every
// path, so a local fed by it needs NO cast: the retyped signature families of section 1
// (proved by resolvesToMethodNamed, i.e. a real method declaration of that name) and the
// hand-written String-returning base methods.
function dataflowThisCallType (printer, node) {
    const name = node.expression.name.escapedText;
    if (JAVA_STRING_RETURN_METHODS.has (name) || JAVA_STRING_RETURN_METHODS_CASE_CAST.has (name)) {
        return resolvesToMethodNamed (printer, node, name) ? JAVA_DATAFLOW_STRING : undefined;
    }
    if (JAVA_LIST_RETURN_METHODS.has (name)) {
        return resolvesToMethodNamed (printer, node, name) ? JAVA_ARRAY_TYPE : undefined;
    }
    if (DATAFLOW_STRING_BASE_METHODS.has (name)) {
        return resolvesToBaseAccessor (printer, node, name) ? JAVA_DATAFLOW_STRING : undefined;
    }
    return undefined;
}

// the Java type of a value expression, or undefined when it cannot be proven. 'null' is
// returned for a literal null/undefined (neutral: every emitted type is a reference
// type). `context` carries { scope, index, stack, depth } and enables the recursive
// resolution of reads of other proven locals.
function dataflowValueType (printer, node, context) {
    if (node === undefined) {
        return undefined;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return JAVA_DATAFLOW_STRING;
        case ts.SyntaxKind.NullKeyword:
            return 'null';
        case ts.SyntaxKind.Identifier:
            if (node.escapedText === 'undefined') {
                return 'null';
            }
            return dataflowResolveRead (printer, context, node);
        case ts.SyntaxKind.ParenthesizedExpression:
            return dataflowValueType (printer, node.expression, context);
        case ts.SyntaxKind.ConditionalExpression:
            return dataflowUnifyArms (
                dataflowValueType (printer, node.whenTrue, context),
                dataflowValueType (printer, node.whenFalse, context));
        case ts.SyntaxKind.BinaryExpression:
            // `a + b` prints `Helpers.add(a, b)`; a provably-String LEFT resolves the call
            // to add(String, ...), declared String and never null
            if (node.operatorToken.kind === ts.SyntaxKind.PlusToken && isProvablyStringOperand (unwrapParens (node.left))) {
                return JAVA_DATAFLOW_STRING;
            }
            return undefined;
        case ts.SyntaxKind.ArrayLiteralExpression:
            // prints `new java.util.ArrayList<Object>(java.util.Arrays.asList(...))`
            return JAVA_ARRAY_TYPE;
        case ts.SyntaxKind.CallExpression: {
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee)) {
                return undefined;
            }
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return dataflowThisCallType (printer, node);
            }
            if (ts.isIdentifier (callee.expression) && callee.expression.escapedText === 'Precise') {
                return PRECISE_STRING_STATICS.has (callee.name.escapedText) ? JAVA_DATAFLOW_STRING : undefined;
            }
            return undefined;
        }
    }
    return undefined;
}

// the join of two proven types along the box-identical edges, or undefined when they
// cannot live in one declaration without changing a box. 'null' is neutral at this layer.
function joinDataflowTypes (a, b) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return a;
    }
    for (const [ from, to ] of JAVA_WIDENING_EDGES) {
        if ((a === from && b === to) || (a === to && b === from)) {
            return to;
        }
    }
    return undefined;
}

// the type of `c ? a : b` from its arms: identical proven types, or T + null for a
// reference T. Two distinct proven types never unify (see the header).
function dataflowUnifyArms (a, b) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return (a === 'null') ? undefined : a;
    }
    if (a === 'null') {
        return b;
    }
    if (b === 'null') {
        return a;
    }
    return undefined;
}

// ---- the decision for one declaration -------------------------------------

// the surviving tables' decision (a whole call to a retyped signature / an accessor
// family), re-derived exactly as their wrapper rewrites the printed text: it only rewrites
// when the printed value starts with `this.`, so a parenthesised initializer (which prints
// `(this.x(...))`) is left Object and proves nothing to a read.
function dataflowSurvivingType (printer, declaration) {
    const info = javaLocalTypeOf (printer, declaration);
    if (info === undefined) {
        return undefined;
    }
    // the surviving wrapper rewrites only when the printed value starts with `this.`;
    // a parenthesised initializer prints `(this.x(...))` and stays Object
    if (declaration.initializer.kind === ts.SyntaxKind.ParenthesizedExpression) {
        return undefined;
    }
    return info.type;
}

// the Java type the FINAL output declares for this local, or undefined when it stays
// Object. Used both for the declaration itself and for reads resolving through it.
function dataflowEmittedType (printer, declaration, context) {
    if (declaration === undefined || declaration.initializer === undefined) {
        return undefined;
    }
    if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    if (declaration.parent?.declarations?.length !== 1) {
        return undefined; // a multi-declarator list the printer never rewrites
    }
    if (declaration.initializer.kind === ts.SyntaxKind.NewExpression) {
        return undefined; // the printer emits `var x = ...` for a NewExpression initializer
    }
    const type = dataflowEmittedTypeUnchecked (printer, declaration, context);
    return dataflowWsReverts (printer, declaration, type) ? undefined : type;
}

// the surviving tables' decision when it exists, else the dataflow engine's
function dataflowEmittedTypeUnchecked (printer, declaration, context) {
    const surviving = dataflowSurvivingType (printer, declaration);
    if (surviving !== undefined) {
        return surviving;
    }
    if (dataflowClassifyInProgress.has (declaration)) {
        return undefined; // a read chain that comes back to the declaration being classified
    }
    dataflowClassifyInProgress.add (declaration);
    try {
        const info = dataflowLocalTypeOf (printer, declaration, context);
        return info === undefined ? undefined : info.type;
    } finally {
        dataflowClassifyInProgress.delete (declaration);
    }
}

// would postProcessWsJava's "String type fixes" pass rewrite this declaration back to
// `Object`? It matches `String <name> = (this.<m>(|Helpers.)...;` — only a String family
// value is at risk, and only when its printed form starts with this./Helpers. (a
// parenthesised initializer prints `(` first and never matches). The exact same test is
// applied to the printed value by the declaration wrapper.
function dataflowWsReverts (printer, declaration, javaType) {
    if (javaType !== JAVA_DATAFLOW_STRING) {
        return false;
    }
    if (!DATAFLOW_WS_SOURCE_FILE.test (declaration.getSourceFile ().fileName)) {
        return false;
    }
    const initializer = declaration.initializer;
    if (initializer === undefined || initializer.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }
    const callee = initializer.expression;
    if (ts.isPropertyAccessExpression (callee)) {
        // hmm: `Helpers.foo(...)` has an Identifier callee; `this.<m>(...)` a property one
        return callee.expression.kind === ts.SyntaxKind.ThisKeyword;
    }
    return ts.isIdentifier (callee) && callee.escapedText === 'Helpers';
}

// a read of `identifier` resolves only when it provably refers to a single local
// declared EARLIER in the same function whose own decision this engine proves.
function dataflowResolveRead (printer, context, identifier) {
    if (context === undefined || context.scope === undefined || context.index === undefined) {
        return undefined;
    }
    const name = dataflowCanonicalName (printer, identifier);
    const declarations = context.index.declarations.get (name);
    if (declarations === undefined || declarations.length !== 1) {
        return undefined; // not a local, or a second binding of the same name shadows it
    }
    if (context.index.parameterNames.has (name) || context.index.blockedNames.has (name)) {
        return undefined; // a parameter / destructured / catch binding could be the read
    }
    const declaration = declarations[0];
    if (context.stack.has (declaration) || context.depth >= MAX_DATAFLOW_DEPTH) {
        return undefined; // a cycle (`let a = b; let b = a;`) or a pathological chain
    }
    try {
        if (declaration.getStart () >= identifier.getStart ()) {
            return undefined; // the read is at or before the declaration (TDZ / hoisted closure)
        }
    } catch (e) {
        return undefined;
    }
    const scope = enclosingFunction (declaration);
    const nested = { scope, index: dataflowIndex (printer, scope), stack: context.stack, depth: context.depth + 1 };
    context.stack.add (declaration);
    try {
        return dataflowEmittedType (printer, declaration, nested);
    } finally {
        context.stack.delete (declaration);
    }
}

// the declared type from the initializer (`initial` — a proven type, or 'null' for a
// literal null/undefined) joined with every later plain `x = ...` write in the function.
// An unprovable or non-joinable write returns undefined — the printer's Object is kept.
function dataflowTypeFromWrites (printer, context, declaration, varName, initial) {
    let type = (initial === 'null') ? undefined : initial;
    for (const n of (context.index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || dataflowNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (!(parent !== undefined && ts.isBinaryExpression (parent) && parent.left === n
            && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
            continue; // not a plain write — the safety scan handles the rest
        }
        const written = dataflowValueType (printer, unwrapParens (parent.right), context);
        dataflowDebug (`write ${varName} = ${written}`);
        if (written === undefined) {
            return undefined; // an unprovable write
        }
        if (written === 'null') {
            continue; // a null write is neutral for a reference declaration
        }
        type = (type === undefined) ? written : joinDataflowTypes (type, written);
        if (type === undefined) {
            return undefined; // a non-joinable write
        }
    }
    return type;
}

// is `value` the LEFT operand of a `+` / `+=`? (prints `Helpers.add(value, ...)`)
function isLeftPlusOperand (value) {
    const parent = value.parent;
    if (parent?.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== value) {
        return false;
    }
    const op = parent.operatorToken.kind;
    return op === ts.SyntaxKind.PlusToken || op === ts.SyntaxKind.PlusEqualsToken;
}

// climb through `(x)` wrappers to the expression that consumes the value
function unwrapParensUp (node) {
    let current = node;
    while (current.parent?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        current = current.parent;
    }
    return current;
}

// a String local as the left operand of `+` needs a provably non-null String on the
// right; a List local used with `.join()` needs the List<String> receiver cast of
// printJoinCall, which is inconvertible from List<Object>. Both print the same for an
// Object-declared local (a legal downcast), so they are new hazards of any retype.
function dataflowReceiverCallIsSafe (method, javaType) {
    if (javaType === JAVA_ARRAY_TYPE && method === 'join') {
        return false;
    }
    return receiverCallIsSafe (method, javaType);
}

// the printer's by-name call rewrites cast some ARGUMENTS to a fixed type:
//   `x.startsWith(y)`    -> `((String)x).startsWith(((String)y))`
//   `x.endsWith(y)`      -> `((String)x).endsWith(((String)y))`
//   `x.replace(a, b)` / `x.replaceAll(a, b)` -> `Helpers.replace((String)a, (String)b)`
//   `x.join(sep)`        -> `String.join((String)sep, (java.util.List<String>)x)`
//   `x.padEnd(n, c)`     -> `Helpers.padEnd(..., ((Number)n).intValue(), ((String)c).charAt(0))`
// A `(String)` cast from a List<Object> / Long declaration is `inconvertible types`, and
// `(Number)` from String/List likewise. An Object-typed argument always compiles, so only
// a retype can break these. Per-method, per-argument-index required type:
const DATAFLOW_ARGUMENT_CAST_TYPES = {
    'startsWith': [ 'String' ],
    'endsWith': [ 'String' ],
    'replace': [ 'String', 'String' ],
    'replaceAll': [ 'String', 'String' ],
    'join': [ 'String' ],
    'padEnd': [ 'Number', 'String' ],
    'padStart': [ 'Number', 'String' ],
};

// the type the printer casts this argument to, or undefined when the argument prints as-is
function dataflowArgumentCastType (argument) {
    const call = argument.parent;
    if (call === undefined || !ts.isCallExpression (call)) {
        return undefined;
    }
    const index = call.arguments.indexOf (argument);
    if (index === -1) {
        return undefined;
    }
    const callee = call.expression;
    if (!ts.isPropertyAccessExpression (callee)) {
        return undefined;
    }
    const casts = DATAFLOW_ARGUMENT_CAST_TYPES[callee.name.escapedText];
    return casts === undefined ? undefined : casts[index];
}

// `x as string` prints `((String)x)`, `x as any[]` prints `(java.util.List<Object>)x` and
// `x as string[]` prints `(java.util.List<String>)x` — every one of them is inconvertible
// from the wrong declaration (see printAsExpression). `as any` prints `((Object)x)`.
function dataflowAsExpressionIsSafe (asNode, javaType) {
    const type = asNode.type;
    if (type === undefined) {
        return true;
    }
    if (type.kind === ts.SyntaxKind.AnyKeyword) {
        return true; // `((Object)x)`
    }
    if (type.kind === ts.SyntaxKind.StringKeyword) {
        return javaType === JAVA_DATAFLOW_STRING; // `((String)x)`
    }
    if (type.kind === ts.SyntaxKind.ArrayType) {
        const element = type.elementType;
        if (element?.kind === ts.SyntaxKind.AnyKeyword) {
            return javaType === JAVA_ARRAY_TYPE; // `(java.util.List<Object>)x`
        }
        if (element?.kind === ts.SyntaxKind.StringKeyword) {
            return false; // `(java.util.List<String>)x` — inconvertible from every family
        }
    }
    return true; // any other `as` prints the operand unchanged
}

// is `n` an argument of a `throw new X(<value>)`? that print wraps the argument in
// a hard `(String)` cast, which only compiles from an Object or String receiver
function isClassThrowArgument (n) {
    let current = n;
    while (current.parent !== undefined
        && (ts.isParenthesizedExpression (current.parent) || ts.isSpreadElement (current.parent))) {
        current = current.parent;
    }
    const parent = current.parent;
    if (parent === undefined || !ts.isNewExpression (parent)) {
        return false;
    }
    return parent.arguments !== undefined && parent.arguments.indexOf (current) !== -1
        && parent.parent !== undefined && ts.isThrowStatement (parent.parent);
}

// reject the retype when a use needs the local to stay Object
function dataflowIsSafeToRetype (printer, declaration, varName, javaType, context) {
    const scope = context.scope;
    const index = context.index;
    if (scope === undefined || index === undefined) {
        return false;
    }
    // (d) scope safety: exactly one binding of this name in the method, no
    // parameter/catch/destructuring binding of the same name, a unique printed name
    const declarations = index.declarations.get (varName);
    if (declarations === undefined || declarations.length !== 1 || declarations[0] !== declaration) {
        return false;
    }
    if (index.parameterNames.has (varName) || index.blockedNames.has (varName)) {
        return false;
    }
    if (dataflowTypeTokenCollides (index, javaType)) {
        return false;
    }
    const printedName = String (declaration.name.escapedText);
    if ((index.bindingCounts.get (printedName) ?? 0) !== 1) {
        return false;
    }
    const isString = javaType === JAVA_DATAFLOW_STRING;
    const isList = javaType === JAVA_ARRAY_TYPE;
    const isProFile = /[\\/]pro[\\/]/.test (declaration.getSourceFile ().fileName);
    for (const n of (index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || dataflowNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isPostfixUnaryExpression (parent) || ts.isPrefixUnaryExpression (parent)) {
            const op = parent.operator;
            if (op === ts.SyntaxKind.PlusPlusToken || op === ts.SyntaxKind.MinusMinusToken) {
                return false; // `x++` / `x--` print a ref-style numeric helper
            }
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // `x instanceof <box>`: inconvertible for the wrong family
        }
        if (ts.isArrayLiteralExpression (parent) && ts.isBinaryExpression (parent.parent)
            && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            return false; // `[x, y] = f()` prints element reads into untyped slots
        }
        if (ts.isVariableDeclaration (parent) && parent.name?.kind === ts.SyntaxKind.ArrayBindingPattern
            && javaType !== JAVA_ARRAY_TYPE) {
            return false; // `const [a, b] = x` prints a hard List cast of the synthetic holder
        }
        if (ts.isDeleteExpression (parent)) {
            return false; // `delete x[k]` prints `((java.util.Map<String,Object>)x).remove(...)`
        }
        if (ts.isAsExpression (parent) && parent.expression === n && !dataflowAsExpressionIsSafe (parent, javaType)) {
            return false; // `x as string[]` prints `(java.util.List<String>)x`
        }
        {
            const argumentCast = dataflowArgumentCastType (unwrapParensUp (n));
            if (argumentCast !== undefined && argumentCast !== javaType) {
                return false; // the printer's by-name rewrite casts this argument
            }
        }
        if (ts.isPropertyAccessExpression (parent) && parent.expression === n && parent.parent !== undefined
            && ts.isCallExpression (parent.parent) && parent.parent.expression === parent) {
            // `x.<method>(...)` — the printer casts the receiver explicitly
            const method = String (parent.name.escapedText);
            if (!dataflowReceiverCallIsSafe (method, javaType)) {
                return false;
            }
        }
        if (ts.isElementAccessExpression (parent) && parent.parent !== undefined && ts.isDeleteExpression (parent.parent)) {
            // `delete x[k]` prints `((java.util.Map<String,Object>)x).remove((String)k)`:
            // inconvertible for every type this engine emits, in either operand position
            return false;
        }
        if (ts.isBinaryExpression (parent)) {
            const op = parent.operatorToken.kind;
            if (parent.left === n) {
                if (op === ts.SyntaxKind.EqualsToken) {
                    // the join already proved every plain write; re-check so a write the
                    // join could not see still rejects
                    const written = dataflowValueType (printer, unwrapParens (parent.right), context);
                    if (written === undefined || (written !== 'null' && written !== javaType)) {
                        return false;
                    }
                } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                    return false; // `x += r` re-resolves against the declared type
                }
            }
            if (isString && isLeftPlusOperand (unwrapParensUp (n))) {
                const plus = unwrapParensUp (n).parent;
                if (!isProvablyStringOperand (unwrapParens (plus.right))) {
                    return false; // add(String, ...) diverges from add(Object, Object) on null
                }
            }
        }
        if (!isString && !isList && isClassThrowArgument (n)) {
            return false; // `throw new X((String)x)` casts the argument
        }
        if (isProFile && feedsInheritedAsyncCall (printer, n, scope)) {
            return false; // the typed wrapper overload would win once the box is a String
        }
    }
    return true;
}

// the dataflow decision for one declaration: { type } or undefined
function dataflowLocalTypeOf (printer, declaration, context) {
    const scope = context?.scope ?? enclosingFunction (declaration);
    if (scope === undefined) {
        return undefined;
    }
    const index = context?.index ?? dataflowIndex (printer, scope);
    const sourceName = dataflowCanonicalName (printer, declaration.name);
    // (d) scope safety before any dataflow work
    const declarations = index.declarations.get (sourceName);
    if (declarations === undefined || declarations.length !== 1 || declarations[0] !== declaration) {
        dataflowDebug (`decl ${sourceName}: rejected (${declarations === undefined ? 'no binding' : declarations.length + ' bindings'})`);
        return undefined;
    }
    if (index.parameterNames.has (sourceName) || index.blockedNames.has (sourceName)) {
        dataflowDebug (`decl ${sourceName}: rejected (parameter/catch/destructured binding)`);
        return undefined;
    }
    const ctx = {
        scope,
        index,
        stack: context?.stack ?? new Set (),
        depth: context?.depth ?? 0,
    };
    let javaType = dataflowValueType (printer, unwrapParens (declaration.initializer), ctx);
    if (javaType === undefined) {
        dataflowDebug (`decl ${sourceName}: rejected (unprovable initializer)`);
        return undefined;
    }
    // (a) join the initializer with every later write
    javaType = dataflowTypeFromWrites (printer, ctx, declaration, sourceName, javaType);
    if (javaType === undefined) {
        dataflowDebug (`decl ${sourceName}: rejected (unprovable/non-joinable write)`);
        return undefined;
    }
    ctx.stack.add (declaration);
    try {
        if (!dataflowIsSafeToRetype (printer, declaration, sourceName, javaType, ctx)) {
            dataflowDebug (`decl ${sourceName}: rejected (unsafe use) type=${javaType}`);
            return undefined;
        }
    } finally {
        ctx.stack.delete (declaration);
    }
    dataflowDebug (`decl ${sourceName}: RETYPE ${javaType}`);
    return { type: javaType };
}

// wrap printVariableDeclarationList on a Transpiler's Java printer. Chained on top of
// every other patch (the surviving tables' wrapper runs first and its decisions win: its
// marker is gone by the time this one looks). Idempotent.
export function patchJavaDataflowTypes (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._javaDataflowPatched) {
        return;
    }
    printer._javaDataflowPatched = true;
    if (process.env['CCXT_JAVA_DATAFLOW'] === '0') {
        return; // measurement / A-B switch
    }
    const upstream = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = upstream (node, identation);
        try {
            return dataflowRewriteDeclaration (printer, node, identation, printed);
        } catch (e) {
            return printed; // never break the upstream print on an engine error
        }
    };
}

// rewrite the printed `Object <name> = <value>` prefix of one declaration when the engine
// proves the value's type. Anything unexpected (a marker the upstream wrapper already
// replaced, a multi-declarator list, a shape the printer emitted differently) is returned
// untouched.
function dataflowRewriteDeclaration (printer, node, identation, printed) {
    const declarations = node?.declarations;
    if (declarations === undefined || declarations.length !== 1) {
        return printed;
    }
    const declaration = declarations[0];
    if (declaration.initializer === undefined || declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return printed;
    }
    const info = dataflowLocalTypeOf (printer, declaration, undefined);
    if (info === undefined) {
        return printed;
    }
    const iden = printer.getIden (identation);
    const printedName = printer.printNode (declaration.name, 0);
    const marker = `${iden}${printer.VAR_TOKEN} ${printedName} = `;
    const at = printed.lastIndexOf (marker);
    if (at === -1) {
        return printed; // already retyped upstream / unexpected shape — leave it alone
    }
    const value = printed.slice (at + marker.length);
    if (info.type === JAVA_DATAFLOW_STRING
        && (value.startsWith ('this.') || value.startsWith ('Helpers.'))
        && DATAFLOW_WS_SOURCE_FILE.test (declaration.getSourceFile ().fileName)) {
        return printed; // postProcessWsJava's String pass would revert the spelling
    }
    return printed.slice (0, at) + `${iden}${info.type} ${printedName} = ${value}`;
}
