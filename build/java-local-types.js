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

// ===== 4. tuple-returning handle* destructuring: holder + audited elements =====
//
// JAVA-RE-3 (the JAVA-10 slice re-implemented as an additive section of this module):
// `const [a, b] = this.handleX (...)` and `[a, b] = this.handleX (...)` print through two
// printer paths that emit the SAME destructuring block (ast-transpiler javaTranspiler.ts,
// pin 6c27cfb7):
//
//   printVariableDeclarationList, ArrayBindingPattern branch
//       <iden>var <holder> = <call>;
//       <iden>var <a> = ((java.util.List<Object>) <holder>).get(0);
//       <iden>var <b> = ((java.util.List<Object>) <holder>).get(1)
//
//   printCustomBinaryExpressionIfAny, `[a, b] = <call>` branch
//       <iden>var <holder> = <call>;
//       <iden><a> = ((java.util.List<Object>) <holder>).get(0);
//       <iden><b> = ((java.util.List<Object>) <holder>).get(1)
//
// (<holder> = the printed element names concatenated + "Variable".) Census of the generated
// tree on this branch: 2,176 holder blocks in 124 files — 1,995 assignment-shaped, 181
// declaration-shaped; 1,972 of them are the handle* family this section covers.
//
// HOLDER — retyped for the whole destructuring family whose callee name contains "andle"
// (the csharp-local-types.js#destructuredHandleCallName predicate; do NOT touch
// prepareRequest / orderRequest / parseCreateEditOrderArgs / promiseAll / getBybitType
// holders). The holder prints `var` and every tuple-returning helper is declared
// `public Object`, so `var` infers Object and every element read pays a checked cast; the
// holder is declared `java.util.List<Object>` with the FIRST read's cast hoisted onto the
// initialiser and every element read left EXACTLY as printed:
//
//     var <holder> = <call>;   ->   java.util.List<Object> <holder> = (java.util.List<Object>) <call>;
//
// That is value- and failure-identical: the `.get (` reads prove the holder holds a List at
// that point, a null holder still only fails at the first `.get (...)` (a checkcast of null
// succeeds), and a non-list box throws the same ClassCastException one line earlier with no
// intervening statement. An `await this.handleX (...)` initialiser (printed
// `(this.handleX (...)).join()`) and a `super.handleX (...)` receiver take the same rewrite.
//
// ELEMENTS — element 0 is typed only for the handlers whose Java body provably boxes that
// type (or null) on EVERY return path (audit of io/github/ccxt/BaseExchange.java +
// base/SafeMethods.java in this worktree; zero exchange overrides of the accessors):
//
//   handleParamString / handleParamString2   -> String   (`String value = this.safeString(2) (...)`;
//                                              BaseExchange.safeString is declared String, and a Java
//                                              override can only return String)
//   handleNetworkCodeAndParams               -> String   (`String networkCodeInParams = this.safeString2 (...)`)
//   handleParamInteger / handleParamInteger2 -> Long     (SafeMethods.SafeInteger(N) is declared Long and
//                                              returns Long|null on every path — the caller default goes
//                                              through toLongQuiet, never handed back raw; the 2 variant
//                                              already prints `Long value = (Long) this.safeInteger2 (...)`)
//   handlePostOnly                           -> Boolean  (both returns are asList (true|false, parameters))
//   handleTriggerAndParams                   -> Boolean  (`Object isTrigger = this.safeBool2 (parameters,
//                                              "trigger", "stop")` — no default argument, so safeBool2
//                                              hands back null on its fall-through path)
//   handleParamBool / handleParamBool2       -> Boolean, ONLY when the call's own default argument is
//                                              absent or a boolean literal (index 2 / 3): BaseExchange.safeBool
//                                              hands the caller's `defaultValue` back UNTOUCHED whenever the
//                                              found value is not a Boolean, so only a provable default
//                                              keeps the box Boolean|null.
//
// NOT typed — element 0 is the caller's arbitrary box on at least one return path:
//   handleOptionAndParams / handleOptionAndParams2  (`value = safeValue2 (...) : defaultValue`)
//   handleMarketTypeAndParams                       (`Helpers.GetValue (market, "type")` / defaultValue)
//   handleSubTypeAndParams                          (`subType = GetValue (handleOptionAndParams (...), 0)`)
//   handleMarginModeAndParams                       (returns handleOptionAndParams directly)
//   handleUntilOption                               (element 0 is the caller's own `request` argument)
// Element 1 is always the caller's params box — Java has no dictionary type to name it with.
//
// THE SCAN (why a retyped element is behaviour-preserving): naming a type changes nothing at
// runtime EXCEPT where javac resolves something statically against it, so every use of the
// target local in its enclosing function is inspected (handleTupleIsSafeToNarrow). Rejects:
//   - any write other than the destructuring element write or a value provably of the type
//     (compound assignment prints `x = Helpers.add (x, r)` — an Object result);
//   - `typeof x` (prints instanceof tests), x++/x--, spread, prefix ops other than `!`;
//   - x as the LEFT operand of `+` for a String local unless the right operand is provably a
//     String (Helpers.add(String, *) re-binds and diverges from add(Object, Object) when the
//     left is null and the right is not a string);
//   - list method receivers (.push/.pop/.shift/.reverse/.join/... print
//     `((java.util.List<Object>) x)` casts) — never valid on String/Long/Boolean — and the
//     printer's String-cast receivers for a non-String local;
//   - locals feeding a `this.<async>()` call in a pro file (typed wrapper overloads would win
//     Java overload resolution), same as the safestring family.
// Both mechanisms only run when the whole-function scan passes: the declaration shape
// rewrites the element line in place; the assignment shape retypes the target's earlier
// `Object x = ...` declaration (WeakMap declaration -> type, matched by
// checker.getSymbolAtLocation) and injects the same checkcast on the element write.

// callee name -> element-0 type. `defaultArg` marks the handlers whose element 0 is only
// provable when the call's own default argument is absent or a boolean literal.
const HANDLE_ELEMENT_TYPES = {
    'handleParamString': { element0: 'String' },
    'handleParamString2': { element0: 'String' },
    'handleParamInteger': { element0: 'Long' },
    'handleParamInteger2': { element0: 'Long' },
    'handleParamBool': { element0: 'Boolean', defaultArg: 2 },
    'handleParamBool2': { element0: 'Boolean', defaultArg: 3 },
    'handleNetworkCodeAndParams': { element0: 'String' },
    'handlePostOnly': { element0: 'Boolean' },
    'handleTriggerAndParams': { element0: 'Boolean' },
};

// the hand-written base declaration: an exchange override (rare, but possible) prints its own
// shape and must never classify. The base stage transpiles a copy of ts/src/base/Exchange.ts
// with the overload signatures stripped (build/stripOverloads.ts ->
// Exchange.nooverloads.<pid>.ts) and calls inside it resolve to that copy, so both file
// names count as the base declaration.
const HANDLE_DECLARATION_FILE = /[\\/]base[\\/]Exchange(\.nooverloads\.\d+)?\.ts$/;

// base helpers DECLARED `String` in the Java base (BaseExchange.java / SafeMethods.java)
const HANDLE_DECLARED_STRING_ACCESSORS = new Set ([ 'safeString', 'safeString2', 'safeStringN' ]);
// hand-written base methods declared `String` in BaseExchange.java
const HANDLE_DECLARED_STRING_METHODS = new Set ([ 'iso8601', 'numberToString', 'uuid', 'uuid16', 'uuid22', 'uuidv1' ]);
const HANDLE_PRECISE_STRING_STATICS = new Set ([
    'stringAdd', 'stringSub', 'stringMul', 'stringDiv', 'stringMod', 'stringAbs',
    'stringNeg', 'stringMax', 'stringMin', 'stringOr',
]);
const HANDLE_STRING_RETURNING_METHODS = new Set ([
    'toUpperCase', 'toLowerCase', 'trim', 'replace', 'replaceAll', 'padStart', 'padEnd',
    'substring', 'substr', 'charAt', 'toString',
]);
// methods whose Java print hard-casts the receiver to java.util.List<Object> — never valid
// on a String/Long/Boolean local (the first five are the names javaTranspiler.ts rewrites)
const HANDLE_LIST_RECEIVER_METHODS = new Set ([
    'push', 'pop', 'shift', 'reverse', 'join', 'unshift', 'splice', 'sort', 'fill',
    'copyWithin', 'flat', 'find', 'filter', 'map', 'forEach', 'some', 'every', 'reduce',
    'keys', 'values', 'entries',
]);
// methods whose Java print casts the receiver to `(String)` — an inconvertible cast for a
// Long/Boolean local (`split`, `slice`, `concat`, `indexOf` print Object-parameter helpers
// and stay fine for every type)
const HANDLE_STRING_RECEIVER_METHODS = new Set ([
    'includes', 'search', 'startsWith', 'endsWith', 'trim', 'toUpperCase', 'toLowerCase',
    'replace', 'replaceAll', 'padStart', 'padEnd', 'substring', 'substr', 'charAt', 'match',
]);

function handleIsBooleanLiteral (node) {
    return node !== undefined
        && (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword);
}

// the receiver of a String-cast method call: the printer wraps any receiver in
// `((String) recv).method()` and the call only type-checks in TS when recv is string-ish
function handleIsStringishReceiver (printer, node) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.AsExpression:
        case ts.SyntaxKind.TypeAssertionExpression:
            return node.type?.kind === ts.SyntaxKind.StringKeyword;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleIsStringishReceiver (printer, node.expression);
        case ts.SyntaxKind.Identifier:
            return node.escapedText !== 'undefined';
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return true;
        default:
            return handleProvablyStringValue (printer, node, undefined);
    }
}

function handleProvablyStringValue (printer, node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleProvablyStringValue (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            // both arms statically String keep the Java conditional String
            return handleProvablyStringValue (printer, node.whenTrue, selfName)
                && handleProvablyStringValue (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression:
            // `a + b` prints Helpers.add (a, b); add(String, *) is the only String-returning
            // overload, so the LEFT operand must itself be provably String
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && handleProvablyStringValue (printer, node.left, selfName);
        case ts.SyntaxKind.CallExpression: {
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee)) {
                return false;
            }
            const method = String (callee.name.escapedText);
            if (HANDLE_STRING_RETURNING_METHODS.has (method) && handleIsStringishReceiver (printer, callee.expression)) {
                return true;
            }
            if (callee.expression.kind === ts.SyntaxKind.ThisKeyword) {
                return HANDLE_DECLARED_STRING_ACCESSORS.has (method) || HANDLE_DECLARED_STRING_METHODS.has (method);
            }
            return callee.expression.kind === ts.SyntaxKind.Identifier
                && callee.expression.escapedText === 'Precise'
                && HANDLE_PRECISE_STRING_STATICS.has (method);
        }
        default:
            return false;
    }
}

function handleProvablyBooleanValue (printer, node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.TrueKeyword:
        case ts.SyntaxKind.FalseKeyword:
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleProvablyBooleanValue (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return handleProvablyBooleanValue (printer, node.whenTrue, selfName)
                && handleProvablyBooleanValue (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.PrefixUnaryExpression:
            // `!x` prints `!Helpers.isTrue (x)` — a Java boolean, autoboxed into Boolean
            return node.operator === ts.SyntaxKind.ExclamationToken;
        case ts.SyntaxKind.CallExpression: {
            // the Helpers comparisons are DECLARED `public static boolean` and autobox
            const callee = node.expression;
            if (!ts.isPropertyAccessExpression (callee) || callee.expression.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            if (callee.expression.escapedText !== 'Helpers') {
                return false;
            }
            const method = String (callee.name.escapedText);
            return method === 'isEqual' || method === 'isTrue' || method === 'inOp';
        }
        default:
            return false;
    }
}

function handleProvablyLongValue (node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.NullKeyword:
            return true;
        case ts.SyntaxKind.Identifier:
            return node.escapedText === 'undefined' || node.escapedText === selfName;
        case ts.SyntaxKind.ParenthesizedExpression:
            return handleProvablyLongValue (node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return handleProvablyLongValue (node.whenTrue, selfName) && handleProvablyLongValue (node.whenFalse, selfName);
        default:
            // deliberately NO numeric literal: `Long x = 5;` does not compile in Java
            return false;
    }
}

function handleValueProvablyTyped (printer, node, type, selfName) {
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    if (type === 'String') {
        return handleProvablyStringValue (printer, node, selfName);
    }
    if (type === 'Boolean') {
        return handleProvablyBooleanValue (printer, node, selfName);
    }
    if (type === 'Long') {
        return handleProvablyLongValue (node, selfName);
    }
    return false;
}

// the audited element type of `this.handleX (...)`[index], or undefined
function handleElementType (printer, callNode, index) {
    if (!isThisCall (callNode) || index !== 0) {
        // only element 0 is ever a named type; element 1 is the caller's params box
        return undefined;
    }
    const name = String (callNode.expression.name.escapedText);
    const spec = HANDLE_ELEMENT_TYPES[name];
    if (spec === undefined) {
        return undefined;
    }
    if (spec.defaultArg !== undefined) {
        const defaultArgument = callNode.arguments[spec.defaultArg];
        if (defaultArgument !== undefined && !handleIsBooleanLiteral (defaultArgument)) {
            // the caller's default flows out of safeBool untouched when the found value is
            // not a Boolean — only an absent / boolean-literal default proves the box
            return undefined;
        }
    }
    let declaration;
    try {
        declaration = printer.getChecker ().getResolvedSignature (callNode)?.declaration;
    } catch (e) {
        return undefined;
    }
    if (declaration === undefined || !HANDLE_DECLARATION_FILE.test (declaration.getSourceFile ().fileName)) {
        return undefined;
    }
    return spec.element0;
}

// `x` used as a member/declaration NAME rather than a read or write of the local
function handleIsNotAUse (identifier) {
    const parent = identifier.parent;
    if (parent === undefined) {
        return true;
    }
    switch (parent.kind) {
        case ts.SyntaxKind.VariableDeclaration:
        case ts.SyntaxKind.Parameter:
        case ts.SyntaxKind.BindingElement:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.PropertyAccessExpression:
            return parent.name === identifier;
        case ts.SyntaxKind.PropertyAssignment:
            // `{ x: y }` — the key is not a use; the shorthand `{ x }` IS a read of x
            return parent.name === identifier && parent.initializer !== identifier;
        default:
            return false;
    }
}

function handleIsListReceiver (method) {
    return HANDLE_LIST_RECEIVER_METHODS.has (method);
}

// every use of the local must survive the narrowing; `skipNode` is the binding name the
// retype creates / the declaration name (its own binding is not a use)
function handleTupleIsSafeToNarrow (printer, scope, skipNode, sourceName, expected, isProFile) {
    if (scope === undefined) {
        return false;
    }
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    for (const use of uses) {
        if (use === skipNode) {
            continue;
        }
        if (handleIsNotAUse (use)) {
            continue;
        }
        // `(x) + y` prints `Helpers.add ((x), y)` — x's static type still picks the overload
        let n = use;
        while (n.parent !== undefined && ts.isParenthesizedExpression (n.parent)) {
            n = n.parent;
        }
        const parent = n.parent;
        if (parent === undefined) {
            continue;
        }
        if (ts.isTypeOfExpression (parent)) {
            return false; // `typeof x` prints instanceof tests (inconvertible for String/Long/Boolean)
        }
        if (ts.isSpreadElement (parent)) {
            return false;
        }
        if (ts.isPostfixUnaryExpression (parent)) {
            return false; // x++ / x--
        }
        if (ts.isPrefixUnaryExpression (parent)) {
            if (parent.operator !== ts.SyntaxKind.ExclamationToken) {
                return false; // -x / +x / ~x print numeric/bit helpers
            }
            continue; // `!x` is fine at every type
        }
        if (ts.isArrayLiteralExpression (parent)) {
            const grand = parent.parent;
            if (grand !== undefined && ts.isBinaryExpression (grand) && grand.left === parent
                && grand.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                // `[a, b] = this.handleX (...)` — accepted only for the audited handlers,
                // whose element read gets the cast back to this type
                const index = parent.elements.indexOf (use);
                const type = (index === -1) ? undefined : handleElementType (printer, unwrapParens (grand.right), index);
                if (type === undefined || type !== expected) {
                    return false;
                }
                continue;
            }
            continue; // a plain array literal prints a List<Object> construction — an Object slot
        }
        if (ts.isBinaryExpression (parent) && parent.left === n) {
            const op = parent.operatorToken.kind;
            if (op === ts.SyntaxKind.EqualsToken) {
                if (!handleValueProvablyTyped (printer, unwrapParens (parent.right), expected, sourceName)) {
                    return false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return false; // `x += r` prints `x = Helpers.add (x, r)` — an Object result
            } else if (op === ts.SyntaxKind.PlusToken && expected === 'String') {
                // LEFT of `+` prints Helpers.add (x, r): add(String, *) re-binds and diverges
                // from add(Object, Object) when x is null and r is not a string
                if (!handleProvablyStringValue (printer, parent.right, sourceName)) {
                    return false;
                }
            }
        }
        if (ts.isPropertyAccessExpression (parent) && parent.expression === n) {
            const method = String (parent.name.escapedText);
            if (handleIsListReceiver (method)) {
                return false;
            }
            if (expected !== 'String' && HANDLE_STRING_RECEIVER_METHODS.has (method)) {
                return false;
            }
        }
        if (isProFile && feedsInheritedAsyncCall (printer, use, scope)) {
            return false;
        }
    }
    return true;
}

// destructuring writes of `sourceName` in `scope`: the audited element type of the target,
// or undefined when any write is not one of them (the local then stays Object)
function handleDestructuredWriteType (printer, scope, skipNode, sourceName) {
    const uses = identifierIndex (scope).get (sourceName) ?? [];
    let type;
    let found = false;
    for (const use of uses) {
        if (use === skipNode) {
            continue;
        }
        const parent = use.parent;
        if (parent === undefined || parent.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            continue;
        }
        const grand = parent.parent;
        if (grand === undefined || !ts.isBinaryExpression (grand) || grand.left !== parent
            || grand.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
            continue;
        }
        const index = parent.elements.indexOf (use);
        const written = (index === -1) ? undefined : handleElementType (printer, unwrapParens (grand.right), index);
        if (written === undefined) {
            return undefined;
        }
        if (type !== undefined && type !== written) {
            return undefined; // mixed boxes — cannot name one type
        }
        type = written;
        found = true;
    }
    return found ? type : undefined;
}

// the Java type for a `let x = ... ` local whose writes are the audited destructuring
// element writes: the element type, when the initialiser and every other use survive the
// proof. undefined keeps the printer's `Object x = ...`.
function handleTupleTargetDeclarationType (printer, declaration) {
    if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const sourceName = declaration.name.escapedText;
    const scope = enclosingFunction (declaration);
    if (scope === undefined) {
        return undefined;
    }
    const type = handleDestructuredWriteType (printer, scope, declaration.name, sourceName);
    if (type === undefined) {
        return undefined;
    }
    const initializer = declaration.initializer;
    if (initializer !== undefined && !handleValueProvablyTyped (printer, unwrapParens (initializer), type, sourceName)) {
        return undefined;
    }
    const isProFile = /[\\/]pro[\\/]/.test (declaration.getSourceFile ().fileName);
    if (!handleTupleIsSafeToNarrow (printer, scope, declaration.name, sourceName, type, isProFile)) {
        return undefined;
    }
    return type;
}

// `const [a, b] = this.handleX (...)` / `[a, b] = this.handleX (...)`: the family predicate
// (the callee contains "andle"), plus two shapes an `await this.handleX (...)` initialiser
// (`var H = (this.handleX (...)).join();`) and a `super.handleX (...)` receiver add. The
// holder rewrite itself is sound for ANY destructuring block (the element reads prove the
// cast), but it is kept to the tuple-returning handle* family this section covers.
function isHandleDestructuringCallee (node) {
    let current = node;
    while (current !== undefined && (ts.isParenthesizedExpression (current) || ts.isAwaitExpression (current))) {
        current = current.expression;
    }
    return isThisOrSuperCall (current) && String (current.expression.name.escapedText).includes ('andle');
}

// `var <holder> = ` -> `java.util.List<Object> <holder> = (java.util.List<Object>) ` on the
// line the reads prove; returns undefined when the line is not the expected holder
function handleRetypeHolderLine (line, holderName) {
    const stripped = line.replace (/^[ \t]*/, '');
    const indent = line.slice (0, line.length - stripped.length);
    const head = `var ${holderName} = `;
    if (!stripped.startsWith (head)) {
        return undefined;
    }
    return `${indent}java.util.List<Object> ${holderName} = (java.util.List<Object>) ` + stripped.slice (head.length);
}

// `const [a, b] = this.handleX (...)`: type the holder and, for the audited handlers, the
// element declarations whose uses survive the scan
function handleRetypeBindingPatternBlock (printer, tupleTypes, declaration, printed) {
    if (!isHandleDestructuringCallee (declaration.initializer)) {
        return printed;
    }
    const elements = declaration.name.elements;
    const printedNames = elements.map ((element) => printer.printNode (element.name, 0));
    const holderName = printedNames.join ('') + 'Variable';
    const readMarker = `((java.util.List<Object>) ${holderName}).get(`;
    if (!printed.includes (readMarker)) {
        return printed; // the element reads must prove the cast this rewrite hoists
    }
    const lines = printed.split ('\n');
    const holder = handleRetypeHolderLine (lines[0], holderName);
    let retyped = holder !== undefined;
    if (holder !== undefined) {
        lines[0] = holder;
    }
    const scope = enclosingFunction (declaration);
    const isProFile = /[\\/]pro[\\/]/.test (declaration.getSourceFile ().fileName);
    const call = declaration.initializer;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const type = handleElementType (printer, call, i);
        if (type === undefined || element.name?.kind !== ts.SyntaxKind.Identifier) {
            continue;
        }
        if (!handleTupleIsSafeToNarrow (printer, scope, element.name, element.name.escapedText, type, isProFile)) {
            continue;
        }
        const line = lines[1 + i];
        if (line === undefined) {
            continue;
        }
        const stripped = line.replace (/^[ \t]*/, '');
        const indent = line.slice (0, line.length - stripped.length);
        const head = `var ${printedNames[i]} = `;
        if (!stripped.startsWith (head) || !stripped.slice (head.length).startsWith (readMarker)) {
            continue;
        }
        lines[1 + i] = `${indent}${type} ${printedNames[i]} = (${type}) ` + stripped.slice (head.length);
        tupleTypes.set (element, type);
        retyped = true;
    }
    return retyped ? lines.join ('\n') : printed;
}

// the type this section already proved for the local an element write targets
function handleTupleTargetType (printer, tupleTypes, element) {
    const key = element.expression ?? element;
    let declaration;
    try {
        const symbol = printer.getChecker ().getSymbolAtLocation (key);
        declaration = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
    } catch (e) {
        return undefined;
    }
    if (declaration === undefined) {
        return undefined;
    }
    if (tupleTypes.has (declaration)) {
        return tupleTypes.get (declaration);
    }
    if (tupleTypes.has (declaration.parent)) {
        return tupleTypes.get (declaration.parent);
    }
    return undefined;
}

// `[a, b] = this.handleX (...)` printed by printCustomBinaryExpressionIfAny: type the
// holder and cast the element writes whose target declaration this section retyped
function handleRetypeDestructuringAssignment (printer, tupleTypes, node, printed) {
    if (!isHandleDestructuringCallee (node.right)) {
        return printed;
    }
    const elements = node.left.elements;
    const printedNames = elements.map ((element) => printer.printNode (element, 0));
    const holderName = printedNames.join ('') + 'Variable';
    const readMarker = `((java.util.List<Object>) ${holderName}).get(`;
    if (!printed.includes (readMarker)) {
        return printed; // the reads must prove the cast this rewrite hoists
    }
    const lines = printed.split ('\n');
    const holder = handleRetypeHolderLine (lines[0], holderName);
    if (holder === undefined) {
        return printed;
    }
    lines[0] = holder;
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const declared = handleTupleTargetType (printer, tupleTypes, element);
        if (declared === undefined) {
            continue;
        }
        const line = lines[1 + i];
        if (line === undefined) {
            continue;
        }
        const stripped = line.replace (/^[ \t]*/, '');
        const indent = line.slice (0, line.length - stripped.length);
        const head = `${printedNames[i]} = `;
        if (!stripped.startsWith (head)) {
            continue;
        }
        const body = stripped.slice (head.length);
        if (!body.startsWith (readMarker)) {
            continue;
        }
        const rest = body.slice (readMarker.length);
        if (rest !== `${i})` && rest !== `${i});`) {
            continue;
        }
        const semi = rest.endsWith (';') ? ';' : '';
        lines[1 + i] = `${indent}${printedNames[i]} = (${declared}) ${readMarker}${i})${semi}`;
    }
    return lines.join ('\n');
}

// install the handle* destructuring rewrites on a printer. Idempotent: additive wrapper on
// printVariableDeclarationList (the declaration shape + the target declarations) and on
// printCustomBinaryExpressionIfAny (the assignment shape). Chained from
// installJavaLocalTypes below; every other section's output is returned untouched.
export function patchJavaHandlerLocalTypes (printer) {
    if (!printer || typeof printer.printVariableDeclarationList !== 'function' || printer._javaHandlerLocalTypesPatched) {
        return;
    }
    // declaration node -> proven Java type, filled as declarations / binding elements are
    // printed and read back while a destructuring write in the same block is printed
    const tupleTypes = new WeakMap ();
    const original = printer.printVariableDeclarationList.bind (printer);
    printer.printVariableDeclarationList = function (node, identation) {
        const printed = original (node, identation);
        const declarations = node?.declarations;
        if (!declarations || declarations.length !== 1) {
            return printed;
        }
        const declaration = declarations[0];
        if (declaration.name?.kind === ts.SyntaxKind.ArrayBindingPattern) {
            return handleRetypeBindingPatternBlock (printer, tupleTypes, declaration, printed);
        }
        if (declaration.name?.kind !== ts.SyntaxKind.Identifier) {
            return printed;
        }
        const type = handleTupleTargetDeclarationType (printer, declaration);
        if (type === undefined) {
            return printed;
        }
        const iden = printer.getIden (identation);
        const printedName = printer.printNode (declaration.name, 0);
        const marker = `${iden}${printer.VAR_TOKEN} ${printedName} = `;
        const at = printed.lastIndexOf (marker);
        if (at === -1) {
            return printed; // unexpected shape (or a section that runs before this one) — keep it
        }
        tupleTypes.set (declaration, type);
        return printed.slice (0, at) + `${iden}${type} ${printedName} = ` + printed.slice (at + marker.length);
    };
    if (typeof printer.printCustomBinaryExpressionIfAny === 'function') {
        const originalCustom = printer.printCustomBinaryExpressionIfAny.bind (printer);
        printer.printCustomBinaryExpressionIfAny = function (node, identation) {
            const printed = originalCustom (node, identation);
            if (typeof printed !== 'string'
                || node?.kind !== ts.SyntaxKind.BinaryExpression
                || node.operatorToken?.kind !== ts.SyntaxKind.EqualsToken
                || node.left?.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
                return printed;
            }
            return handleRetypeDestructuringAssignment (printer, tupleTypes, node, printed);
        };
    }
    printer._javaHandlerLocalTypesPatched = true;
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
    // (3) the tuple-returning handle* destructuring family (section 4): additive wrappers
    // on printVariableDeclarationList + printCustomBinaryExpressionIfAny
    patchJavaHandlerLocalTypes (printer);
    printer._javaLocalTypesPatched = true;
}
