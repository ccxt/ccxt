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

// ===== 4. string/crypto/url helper locals (JAVA-RE-6) =====
//
// `Object <name> = this.<helper>(...)` for the base string/crypto/url helpers the
// generated sign()/url-building bodies lean on. Every entry was audited return-path by
// return-path against the hand-written Java implementation (BaseExchange.java,
// base/{Encode,Crypto,Misc,NumberHelpers,String,Time}.java):
//
//   plain  — the Java method is declared `String`, so the retyped declaration needs no
//            cast (a String/null box on every path):
//              json / urlencode / urlencodeNested / urlencodeWithArrayRepeat /
//              urlencodeBase64 / rawencode / stringToBase64 / binaryToBase64 /
//              binaryToBase16 / intToBase16 / jwt / rsa / totp / decode / uuid /
//              uuidv1 / uuid16 / uuid22 / uuid5 (every overload throws — a throw path is
//              fine) / capitalize / numberToString / decimalToPrecision;
//   cast   — declared `Object` while every return path yields a String or null (or
//            throws), so the declaration and every same-family reassignment carry a
//            `(String)` checkcast (free on String/null):
//              implodeParams / implodeHostname (Misc.implodeParams hands back the
//                  `(String) path2` — a non-String path throws ClassCastException and a
//                  null path returns null),
//              hmac (Crypto.Hmac boxes binaryToHex or BinaryToBase64; an unsupported
//                  algo throws),
//              eddsa (Crypto.Eddsa base64-encodes its single return; failures throw).
//
// EXCLUDED on purpose (the C# port's rationale, re-verified against the Java bodies):
//   * hash   — Crypto.Hash returns the raw byte[] for digest "binary" (hyperliquid /
//              kraken / polymarket sign() call it), so its box is not always a String;
//   * encode — BaseExchange.encode returns the UTF-8 byte[] on every path;
//   * binaryToString — no Java implementation exists in the base (0 call sites).
//
// Bare `name(...)` calls (a plain Identifier callee, no `this.`): the generated bodies
// call four of these helpers WITHOUT a receiver and Java binds them to the inherited
// BaseExchange method, exactly like `this.<name>(...)` — Java's implicit this. The set is
// limited to the names a tree census actually found in that shape (all four resolve to
// their ts/src/base/functions/* declarations; a venue-local shadow would resolve to the
// venue file and never classify — no ts/src file outside base/ declares any of them).
export const JAVA_STRING_HELPER_PLAIN = new Set ([
    'json', 'urlencode', 'urlencodeNested', 'urlencodeWithArrayRepeat', 'urlencodeBase64',
    'rawencode', 'stringToBase64', 'binaryToBase64', 'binaryToBase16', 'intToBase16',
    'jwt', 'rsa', 'totp', 'decode', 'uuid', 'uuidv1', 'uuid16', 'uuid22', 'uuid5',
    'capitalize', 'numberToString', 'decimalToPrecision',
]);

// declared `Object` in Java, String-or-null on every audited path — (String) checkcast
export const JAVA_STRING_HELPER_CAST = new Set ([
    'implodeParams', 'implodeHostname', 'hmac', 'eddsa',
]);

// bare-callable names (see the paragraph above): the generated tree calls exactly these
// four without a receiver, and each resolves to a base helper
export const JAVA_STRING_HELPER_BARE = new Set ([ 'jwt', 'rsa', 'eddsa', 'totp' ]);

for (const name of JAVA_STRING_HELPER_CAST) {
    if (JAVA_STRING_HELPER_PLAIN.has (name)) {
        throw new Error ('java-local-types: ' + name + ' listed as both plain and cast helper');
    }
}
if (JAVA_STRING_HELPER_PLAIN.has ('hash') || JAVA_STRING_HELPER_CAST.has ('hash')
    || JAVA_STRING_HELPER_PLAIN.has ('encode') || JAVA_STRING_HELPER_PLAIN.has ('binaryToString')) {
    throw new Error ('java-local-types: hash/encode/binaryToString must never be retyped');
}

// helpers whose locals additionally run the guarded-string scan (the add-left rule and
// the += rule below); the safeString family and the parse*/accessor families keep the
// original scan untouched
export function isGuardedStringHelper (name) {
    return JAVA_STRING_HELPER_PLAIN.has (name) || JAVA_STRING_HELPER_CAST.has (name);
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
    // JAVA-RE-6 string/crypto/url helpers — see the section-4 header. `plain` entries are
    // declared String in Java; `cast` entries are declared Object but String-or-null on
    // every audited path. The classifier (classifyStringHelperCall) applies the
    // ts/src/base file gate on top of this table.
    'json': { type: 'String' },
    'urlencode': { type: 'String' },
    'urlencodeNested': { type: 'String' },
    'urlencodeWithArrayRepeat': { type: 'String' },
    'urlencodeBase64': { type: 'String' },
    'rawencode': { type: 'String' },
    'stringToBase64': { type: 'String' },
    'binaryToBase64': { type: 'String' },
    'binaryToBase16': { type: 'String' },
    'intToBase16': { type: 'String' },
    'jwt': { type: 'String' },
    'rsa': { type: 'String' },
    'totp': { type: 'String' },
    'decode': { type: 'String' },
    'uuid': { type: 'String' },
    'uuidv1': { type: 'String' },
    'uuid16': { type: 'String' },
    'uuid22': { type: 'String' },
    'uuid5': { type: 'String' },
    'capitalize': { type: 'String' },
    'numberToString': { type: 'String' },
    'decimalToPrecision': { type: 'String' },
    'implodeParams': { type: 'String', cast: '(String)' },
    'implodeHostname': { type: 'String', cast: '(String)' },
    'hmac': { type: 'String', cast: '(String)' },
    'eddsa': { type: 'String', cast: '(String)' },
};

// consistency: every guarded helper name must have a table entry of the same shape the
// classifier reads, and no plain/cast entry may collide with an existing family
for (const name of JAVA_STRING_HELPER_PLAIN) {
    if (LOCAL_THIS_RETURN_TYPES[name] === undefined || LOCAL_THIS_RETURN_TYPES[name].cast !== undefined) {
        throw new Error ('java-local-types: plain helper ' + name + ' missing/incorrect table entry');
    }
}
for (const name of JAVA_STRING_HELPER_CAST) {
    if (LOCAL_THIS_RETURN_TYPES[name] === undefined || LOCAL_THIS_RETURN_TYPES[name].cast === undefined) {
        throw new Error ('java-local-types: cast helper ' + name + ' missing/incorrect table entry');
    }
}

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

// ===== string/crypto/url helper classification (JAVA-RE-6) =====
//
// the resolved TS declaration of an admitted helper call must live under ts/src/base/ —
// a venue override (its own file) transpiles with its own `Object` signature and must
// never classify. `hash` / `encode` / `binaryToString` are absent by construction (the
// table check at the top of the module throws for them). The BASE stage resolves calls
// inside ts/src/base/Exchange.ts to the stripped `Exchange.nooverloads.<pid>.ts` variant
// (build/stripOverloads.ts), whose recorded fileName is RELATIVE (`ts/src/base/...`) —
// accept a leading `ts/src/base/` as well or every base-stage candidate dies there.
const HELPER_SOURCE_FILE = /(^|[\\/])ts[\\/]src[\\/]base[\\/]/;

// env-gated calibration trace: JAVA_STRING_HELPERS_DEBUG=1 prints the resolved
// declaration file of every candidate helper call, accepted or not
const HELPER_DEBUG = !!process.env.JAVA_STRING_HELPERS_DEBUG;

function resolvedSignatureFile (printer, node) {
    try {
        const declaration = printer.getChecker ().getResolvedSignature (node)?.declaration;
        return declaration === undefined ? undefined : declaration.getSourceFile ()?.fileName;
    } catch (e) {
        return undefined;
    }
}

function helperDebug (message, node) {
    if (!HELPER_DEBUG) {
        return;
    }
    let text = '';
    try {
        text = (node === undefined) ? '' : String (node.getText ()).slice (0, 110);
    } catch (e) {
        text = '<no text>';
    }
    console.error ('[java-string-helpers] ' + message + ' | ' + text);
}

// `this.<name>(...)` / bare `name(...)` -> { type, cast, kind } for the helper families.
// Bare calls only for the four names the generated tree actually calls that way; Java
// binds them to the inherited BaseExchange method (implicit this).
function classifyStringHelperCall (printer, node) {
    if (node === undefined || !ts.isCallExpression (node)) {
        return undefined;
    }
    const callee = node.expression;
    let name;
    if (isThisCall (node)) {
        name = String (callee.name.escapedText);
    } else if (ts.isIdentifier (callee) && JAVA_STRING_HELPER_BARE.has (callee.escapedText)) {
        name = String (callee.escapedText);
    } else {
        return undefined;
    }
    const accessor = LOCAL_THIS_RETURN_TYPES[name];
    if (accessor === undefined || !isGuardedStringHelper (name)) {
        return undefined;
    }
    const bare = !isThisCall (node);
    const file = resolvedSignatureFile (printer, node);
    if (file === undefined) {
        helperDebug ('no resolved declaration for ' + name, node);
        return undefined;
    }
    if (!HELPER_SOURCE_FILE.test (file)) {
        helperDebug ('non-base declaration ' + file + ' for ' + name, node);
        return undefined;
    }
    helperDebug ((accessor.cast === undefined ? 'plain ' : 'cast ') + name + ' <- ' + file, node);
    return { type: accessor.type, cast: accessor.cast, kind: 'guarded-string', bare: bare ? name : undefined };
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
    if (initializer === undefined) {
        return undefined;
    }
    // JAVA-RE-6: this.<helper>(...) / bare <helper>(...) for the string/crypto/url family
    const helper = classifyStringHelperCall (printer, initializer);
    if (helper !== undefined) {
        return helper;
    }
    if (!isThisCall (initializer)) {
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
            if (ts.isIdentifier (callee)) {
                // bare helper call (`jwt(...)` / `eddsa(...)` / `rsa(...)` / `totp(...)`):
                // Java binds it to the inherited BaseExchange method; its box is the same
                // the `this.<name>(...)` form hands back
                if (!JAVA_STRING_HELPER_BARE.has (callee.escapedText) || javaType !== 'String') {
                    return false;
                }
                const helper = classifyStringHelperCall (printer, node);
                if (helper === undefined) {
                    return false;
                }
                // a cast-family bare write (`x = eddsa(...)`) is admitted — the
                // reassignment hook injects the same (String) checkcast the declaration got
                return true;
            }
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
                if (isGuardedStringHelper (name)) {
                    // plain families hand back a String (no cast needed); the cast family
                    // needs the (String) checkcast the reassignment hook injects
                    const helper = classifyStringHelperCall (printer, node);
                    return helper !== undefined;
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

// ===== guarded-string provability (JAVA-RE-6) =====
//
// The `+` rule: `x + y` prints `Helpers.add (x, y)` and the LEFT operand's static type
// selects the overload family (add(Object,Object) vs add(String,String) / add(String,Object)).
// `add(Object,Object)` returns the SAME String value only when the right operand is a
// non-null String (a Long/Double/null right side moves it to the numeric/null branches),
// and `add(String,*)` always concatenates. So a guarded local used as the LEFT operand of
// `+` is accepted only when the direct right operand is a provably non-null String and no
// deeper add of the same left spine has a possibly-numeric right operand.

// true when the printed Java for `node` is statically a String (or null): literals, the
// `undefined`/self identifiers, parenthesized/conditional combos, a `+` chain with a
// statically-String left operand (add(String, ..) -> String), a plain helper call and the
// base-declared safeString accessors. Cast-family helpers are NOT statically String (they
// print an Object-typed call; only the reassignment hook's explicit cast names the box).
function isStaticallyStringExpression (printer, node, selfName) {
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
            return isStaticallyStringExpression (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return isStaticallyStringExpression (printer, node.whenTrue, selfName)
                && isStaticallyStringExpression (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression:
            // `'lit' + r` prints Helpers.add(String, ..) -> String on every path
            return node.operatorToken.kind === ts.SyntaxKind.PlusToken
                && isStaticallyStringExpression (printer, node.left, selfName);
        case ts.SyntaxKind.CallExpression: {
            if (isThisCall (node)
                && (node.expression.name.escapedText === 'safeString'
                    || node.expression.name.escapedText === 'safeString2'
                    || node.expression.name.escapedText === 'safeStringN')
                && isPlainSafeStringBaseCall (printer, node)) {
                return true; // declared String in BaseExchange
            }
            const helper = classifyStringHelperCall (printer, node);
            return helper !== undefined && helper.cast === undefined;
        }
        default:
            return false;
    }
}

// `this.safeString*` resolving to the base accessor in ts/src/base/functions/type.ts
function isPlainSafeStringBaseCall (printer, node) {
    if (!isThisCall (node)) {
        return false;
    }
    const name = node.expression.name.escapedText;
    if (name !== 'safeString' && name !== 'safeString2' && name !== 'safeStringN') {
        return false;
    }
    const file = resolvedSignatureFile (printer, node);
    return file !== undefined && /(^|[\\/])base[\\/]functions[\\/]type\.ts$/.test (file);
}

// true when the TYPE the checker gives `node` could hold a Java-`Double` box at runtime
// (number / bigint members, or an `any`/`unknown`/error type we cannot rule out).
// Helpers.add's branch order tests `a instanceof Double || b instanceof Double` BEFORE
// its String branches; a number-typed operand can be such a Double, which would turn a
// string-literal-led `+` chain into a numeric box.
function isPossiblyNumericExpression (printer, node) {
    try {
        const type = printer.getChecker ().getTypeAtLocation (node);
        return typeIsPossiblyNumeric (type);
    } catch (e) {
        return true; // unprovable — treat as possibly numeric
    }
}

function typeIsPossiblyNumeric (type) {
    if (type === undefined) {
        return true;
    }
    const flags = type.flags;
    if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
        return true;
    }
    if (flags & (ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike)) {
        return true;
    }
    if (flags & ts.TypeFlags.Union) {
        return type.types.some ((member) => typeIsPossiblyNumeric (member));
    }
    if (flags & ts.TypeFlags.Intersection) {
        return type.types.some ((member) => typeIsPossiblyNumeric (member));
    }
    return false;
}

// true when any operand of the `+` chain (through parentheses) could be a Java Double
// box: Helpers.add tests `a instanceof Double || b instanceof Double` BEFORE its String
// branches and toDouble never throws (it returns 0.0), so a single Double operand
// silently turns the whole call numeric — even when the composite is typed `string` in
// TypeScript. The walk must reach every leaf.
function isPossiblyNumericDeep (printer, node) {
    if (node === undefined) {
        return true;
    }
    let current = node;
    while (ts.isParenthesizedExpression (current)) {
        current = current.expression;
    }
    if (ts.isBinaryExpression (current) && current.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return isPossiblyNumericDeep (printer, current.left) || isPossiblyNumericDeep (printer, current.right);
    }
    return isPossiblyNumericExpression (printer, current);
}

// true when the printed Java for `node` is a String GUARANTEED non-null at runtime
// (given the named local holds String-or-null). Used only by the add-left rule: with the
// local declared String, `Helpers.add (local, r)` resolves to add(String, ..) while the
// Object-typed call resolved to add(Object, Object) — which returns the same non-null
// String only when `r` is a non-null String and returns null for Long / Double / null /
// other boxes. Accepted forms:
//   1. `l + r` with a statically-String LEFT operand: the call resolves to add(String, *)
//      — `l + String.valueOf (r)` — a non-null String for every possible r;
//   2. `l + r` where one side is itself provably a non-null String and the other side is
//      not possibly numeric anywhere (isPossiblyNumericDeep): the String branches pick
//      `valueOf (l) + valueOf (r)` with a provably non-null String on one side.
// Plain literals/templates and ternaries of these qualify; calls do NOT (even an audited
// non-null call is only proven for the narrowed local, not for arbitrary call sites).
function isProvablyNonNullStringExpression (printer, node, selfName) {
    if (node === undefined) {
        return false;
    }
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return true;
        case ts.SyntaxKind.ParenthesizedExpression:
            return isProvablyNonNullStringExpression (printer, node.expression, selfName);
        case ts.SyntaxKind.ConditionalExpression:
            return isProvablyNonNullStringExpression (printer, node.whenTrue, selfName)
                && isProvablyNonNullStringExpression (printer, node.whenFalse, selfName);
        case ts.SyntaxKind.BinaryExpression: {
            if (node.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
                return false;
            }
            return isStaticallyStringExpression (printer, node.left, selfName)
                || (isProvablyNonNullStringExpression (printer, node.left, selfName) && !isPossiblyNumericDeep (printer, node.right))
                || (isProvablyNonNullStringExpression (printer, node.right, selfName) && !isPossiblyNumericDeep (printer, node.left));
        }
        default:
            return false;
    }
}

// every right operand of the `+` chain whose left spine contains the read `n` (through
// parentheses). `Helpers.add (n, r1)` is the first entry; each later entry belongs to an
// enclosing add whose left operand is the previous (already retyped) chain — the local's
// static type change reaches those too, but there only a possibly-numeric right operand
// can move the result (see the guard in isSafeToNarrow).
function addChainRights (n) {
    const rights = [];
    let node = n;
    let parent = n.parent;
    while (parent !== undefined && ts.isParenthesizedExpression (parent)) {
        node = parent;
        parent = parent.parent;
    }
    while (parent !== undefined && ts.isBinaryExpression (parent)
        && parent.operatorToken.kind === ts.SyntaxKind.PlusToken && parent.left === node) {
        rights.push (parent.right);
        node = parent;
        parent = parent.parent;
        while (parent !== undefined && ts.isParenthesizedExpression (parent)) {
            node = parent;
            parent = parent.parent;
        }
    }
    return rights;
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

// reject the refinement when a later use needs the local to stay `Object`.
// `kind` is the family being classified: undefined for the parse*/accessor families
// (behaviour unchanged), 'guarded-string' for the JAVA-RE-6 string/crypto/url helpers
// (their locals additionally obey the `+`-left / `+=` rules above).
function isSafeToNarrow (printer, declaration, sourceName, javaType, isProFile, kind) {
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
                let ok;
                if (kind === 'guarded-string') {
                    // the narrowed declaration can only take writes whose printed Java is
                    // statically String (isStaticallyStringExpression) or a same-family
                    // helper call the reassignment hook casts
                    ok = isStaticallyStringExpression (printer, unwrapParens (parent.right), sourceName)
                        || isProvablyOfType (printer, unwrapParens (parent.right), javaType, sourceName);
                } else {
                    ok = isProvablyOfType (printer, unwrapParens (parent.right), javaType, sourceName);
                }
                if (!ok) {
                    return false;
                }
            } else if (op === ts.SyntaxKind.PlusEqualsToken && kind === 'guarded-string') {
                // `x += r` lowers to `x = Helpers.add (x, r)` (generated Java never keeps
                // a raw `+=` on these locals): the same non-null String right operand the
                // direct-add rule needs; the read of x in this statement is this very node,
                // so addChainRights has no first entry for it
                if (!isProvablyNonNullStringExpression (printer, parent.right, sourceName)) {
                    return false;
                }
            } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                return false;
            }
        }
        if (kind === 'guarded-string') {
            // `n + r` prints `Helpers.add (n, r)`: with `n` a String local the call moves
            // from add(Object, Object) to add(String, *) — equivalent for a null `n` only
            // when the direct right operand is a provably non-null String; at every
            // enclosing add of the same left spine (whose static type also changed) only a
            // possibly-numeric right operand can still move the result
            const rights = addChainRights (n);
            for (let i = 0; i < rights.length; i++) {
                if (i === 0) {
                    if (!isProvablyNonNullStringExpression (printer, rights[i], sourceName)) {
                        return false;
                    }
                } else if (isPossiblyNumericDeep (printer, rights[i])) {
                    return false;
                }
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
    if (!isSafeToNarrow (printer, declaration, sourceName, info.type, isProFile, info.kind)) {
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
        const isThisValue = value.startsWith ('this.');
        const isBareValue = info.bare !== undefined && value.startsWith (info.bare + '(');
        if (!isThisValue && !isBareValue) {
            return printed; // unexpected shape — leave it as the printer emitted it
        }
        narrowed.set (declaration, info.type);
        const cast = info.cast === undefined ? '' : info.cast + ' ';
        return printed.slice (0, at) + `${iden}${info.type} ${printer.printNode (declaration.name)} = ${cast}${value}`;
    };
    // `x = this.safeSymbol(...)` etc. on a narrowed local: an Object-declared accessor
    // needs the same cast the declaration got; a call to a retyped signature needs none.
    // JAVA-RE-6: the same for the cast-family helpers, whose bare form (`x = eddsa(...)`)
    // prints without a `this.` prefix.
    const originalBinary = printer.printBinaryExpression.bind (printer);
    printer.printBinaryExpression = function (node, identation) {
        const printed = originalBinary (node, identation);
        if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier (node.left)) {
            return printed;
        }
        const right = unwrapParens (node.right);
        if (right === undefined) {
            return printed;
        }
        const helper = classifyStringHelperCall (printer, right);
        const caseAccessor = helper === undefined && isThisCall (right);
        if (helper === undefined && !caseAccessor) {
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
        let cast = '';
        if (helper !== undefined) {
            // a String-declared helper (jwt / urlencode / ...) needs no cast; the
            // Object-declared family (hmac / implodeParams / implodeHostname / eddsa)
            // needs the same (String) checkcast the declaration got
            cast = helper.cast === undefined ? '' : helper.cast;
        } else {
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
            cast = needsCast ? (javaType === 'String' ? '(String)' : '(Long)') : '';
        }
        if (cast === '') {
            return printed;
        }
        const leftText = printer.printNode (node.left, 0);
        const callee = right.expression;
        const bare = ts.isIdentifier (callee);
        const callName = String (bare ? callee.escapedText : callee.name.escapedText);
        const marker = `${leftText} = ${bare ? '' : 'this.'}${callName}(`;
        const at = printed.indexOf (marker);
        if (at === -1) {
            return printed;
        }
        const head = at + leftText.length + ' = '.length;
        return printed.slice (0, head) + cast + ' ' + printed.slice (head);
    };
    printer._javaLocalTypesPatched = true;
}
