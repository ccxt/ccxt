// Concrete C# return types for generated non-async string-returning methods.
//
// The C# printer emits `object` for every non-async method whose TS return type is not
// `void`/`Task` (BaseTranspiler.printFunctionType falls back to DEFAULT_RETURN_TYPE for
// anything else; the bool/bool? family is the only one the printer special-cases). So the
// generated helpers that already end in a string — the priceToPrecision family, the
// parse*Status / parse*Type / parse*mode string mappers built on safeString, the
// encode* / from* / *Precision helpers, ... — were declared `public virtual object`, and
// every local that received their result had to stay `object` on the call site
// (build/csharp-local-types.js).
//
// This module retypes the signature — `string` / `string?` — for a CLOSED, per-name table
// (110 names, 400 declarations). A name is listed only when a census of the whole tree
// proved, for EVERY declaration of the name (base Exchange.ts below its delimiter, the
// prediction base, every exchange, the pro tree, the prediction tree):
//
//   * it is a non-async class method (statics and async methods are out of scope),
//   * the resolved TS return type is string-ish: `string`, a union of string literals, or
//     either plus `undefined`/`null` — no other union member,
//   * every `return` expression has a C# form that is ALREADY string-typed: a string
//     literal, `undefined`/`return;`, this.safeString*/safeStringLower*/safeStringUpper*/
//     decimalToPrecision/numberToString (the classifier's own table), `x as string`, a
//     ternary whose arms are one of those, a call to another listed name (fixpoint), or a
//     local whose initializer and every later write are one of those.
//
// No return expression needs an unboxing cast, so the emitted bodies are byte-identical to
// their `object` versions and runtime semantics do not move. Names with any other return
// shape — string concatenation (add(...) is `object`), calls to helpers whose C# return is
// `object` (safeValue/safeDict/market/forceString/...), object-typed parameters returned
// directly, fetched members — stay `object`; the census for those is in the PR body.
//
// The decision is per NAME, so a base virtual and each of its overrides always print the
// same return type: the override path in printMethodDefinition substitutes the parent's
// printed type only when the override's own print produced `object`, and both prints go
// through the same table lookup.
//
// Deliberately absent although their census is clean:
//   * intToBase16 / binaryToString / uuid5 / exceptionMessage / reduceDigits — declared
//     above the Exchange.ts delimiter or in base/Precise.ts, i.e. already hand-written in
//     C# with a concrete string return; there is no generated signature to retype.
//   * encodeDydxTxForSimulation — hand-written `object` in cs/ccxt/base/Exchange.cs would
//     contradict the generated signature.
//   * getMarketType (ts/src/pro/binance.ts) — its `let type: Str = undefined` receives a
//     destructured `[ type, params ] = handleMarketTypeAndParams (...)`, which the C#
//     printer lowers to untyped list-element reads, so the local can never be typed.
//     (Reported in the PR census; needs a source rewrite, not a signature change.)
//
// Call-site proof (whole ts/src tree, admitted names): the only shape whose C# overload
// resolution changes is a listed call as the LEFT operand of `+` — the left operand's
// static type picks the add() family, and a null LEFT differs between add(object, object)
// (null) and add(string, *) (the right operand). The census found 5 such sites, all inert:
// four `this.intToBase16 (...)` chains (that method is hand-written `string` already, so
// the operand was string-typed before and after) and one `this.shortenSlug (name) + '_'`
// whose body is `((string)joined).ToUpper()` — never null. Everywhere else a `string?`
// call converts to `object` implicitly: assignments, arguments, returns, dictionary
// values, `isEqual`/`isTrue` wrappers, `((string)x).ToUpper()` receivers, and RIGHT
// operands of `+` (add(string, object) and add(string, string) are identical for every
// input — Exchange.TranspileHelpers.cs).
//
// IMPORTANT: scan the AST with `node.name.escapedText`, never by printed text — the
// reserved-keyword pass renames some identifiers before printing.
//
// Two local-typing clauses in build/csharp-local-types.js were added for the returns above
// to type through: `x as string` / `<string>x` casts (`((string)x)`, needed by
// getExtendedStarkAmount's write) and the `string` -> `string?` widening of a local whose
// later write is a nullable string (needed by createOrderAppendix / hexToDecimalString).

import ts from 'typescript6';

export const CSHARP_STRING_RETURN_METHODS = {
    'amountToPrecision': 'string?', 'amountToPredictionPrecision': 'string?', 'applyScale': 'string?',
    'calcOrderPrice': 'string?', 'cleanPath': 'string', 'convertToInstrumentType': 'string?', 'convertToX18': 'string?',
    'costToPrecision': 'string?', 'costToPredictionPrecision': 'string?', 'createOrderAppendix': 'string?',
    'createOrderNonce': 'string?', 'currencyFromPrecision': 'string?', 'customUrlencode': 'string?',
    'encodeMarginMode': 'string?', 'encodeOrderSide': 'string?', 'encodeOrderType': 'string?',
    'encodeTriggerPriceType': 'string?', 'encodeValuesWithJson': 'string', 'encodeWorkingType': 'string?',
    'feeToPrecision': 'string?', 'fromEn': 'string?', 'fromPrecision': 'string?', 'fromWeiWithDecimals': 'string?',
    'futuresRequestId': 'string?', 'generateClientOrderId': 'string?', 'getAccountTypeFromUrl': 'string', 'getAmount': 'string?',
    'getDexFromHip3Symbol': 'string?', 'getDexFromSymbols': 'string?', 'getExtendedStarkAmount': 'string',
    'getFutureWsCategory': 'string', 'getMyTradesMessageHashSuffix': 'string',
    'getNetworkCodeForCurrency': 'string?', 'getPrivateType': 'string', 'getProductGroupFromMarket': 'string',
    'getSeeds': 'string?', 'getStockTickerFromSymbol': 'string?', 'getSubAccountId': 'string',
    'getTifFromRawOrderType': 'string?', 'getTypeByMarket': 'string?', 'handleTakerOrMaker': 'string?',
    'handleTimeInForce': 'string?', 'handleTradeType': 'string?', 'hexToDecimalString': 'string?', 'mapSide': 'string?',
    'mapTimeInForce': 'string?', 'marketOrderAmountToPrecision': 'string', 'marketOutcomeToSymbol': 'string?',
    'outcomeSearchQuery': 'string?', 'padHex': 'string', 'paraseTransferStatus': 'string?', 'parseAccountId': 'string?',
    'parseAccountType': 'string?', 'parseDepositStatus': 'string?', 'parseFundingInterval': 'string?',
    'parseLedgerDirection': 'string?', 'parseLedgerEntryDirection': 'string?', 'parseLedgerEntryStatus': 'string?',
    'parseLedgerStatus': 'string?', 'parseLedgerType': 'string?', 'parseMarginModeType': 'string?',
    'parseMarginStatus': 'string?', 'parseMarginType': 'string?', 'parseMarketType': 'string?', 'parseOrderSide': 'string?',
    'parseOrderState': 'string?', 'parseOrderStatus': 'string?', 'parseOrderTimeInForce': 'string?',
    'parseOrderTimeInForceInteger': 'string?', 'parseOrderType': 'string?', 'parseOrderTypeByMarket': 'string?',
    'parseOrderTypeInteger': 'string?', 'parseOutcomeInputSideHint': 'string?', 'parseStatus': 'string?',
    'parseTakerOrMaker': 'string?', 'parseTimeInForce': 'string?', 'parseTradeSide': 'string?', 'parseTradeType': 'string?',
    'parseTradingOrderStatus': 'string?', 'parseTransactionDepositStatus': 'string?', 'parseTransactionState': 'string?',
    'parseTransactionStatus': 'string?', 'parseTransactionType': 'string?', 'parseTransactionWithdrawalStatus': 'string?',
    'parseTransferStatus': 'string?', 'parseTransferType': 'string?', 'parseType': 'string?', 'parseUnits': 'string?',
    'parseValueToPricision': 'string?', 'parseWithdrawalStatus': 'string?', 'parseWsOrderSide': 'string?',
    'parseWsOrderStatus': 'string?', 'parseWsOrderType': 'string?', 'parseWsPositionSide': 'string?',
    'parseWsTimeInForce': 'string?', 'pow': 'string?', 'priceToPrecision': 'string?', 'priceToPredictionPrecision': 'string?',
    'scaleNumber': 'string?', 'shortenSlug': 'string', 'signCancelAll': 'string', 'signClobOrder': 'string',
    'signOrderbookTypedData': 'string', 'stream': 'string?', 'symbol': 'string?', 'toOrderbookWei': 'string?',
    'tokenIdToSymbol': 'string?', 'typeToTradeType': 'string?', 'walletAddressFromKeys': 'string',
    'walletAddressOrUndefined': 'string?'
};

// the printer's declared return type must still be `object` (bool/Task/anything the printer
// already proved is left alone), and the node must be an emitted, non-async method
function stringReturnType (csharp, node, own) {
    if (own !== 'object') {
        return undefined;
    }
    if (node?.kind !== ts.SyntaxKind.MethodDeclaration || node.name === undefined) {
        return undefined;
    }
    if (typeof csharp.isAsyncFunction === 'function' && csharp.isAsyncFunction (node)) {
        return undefined;
    }
    const name = node.name.escapedText;
    const stringType = CSHARP_STRING_RETURN_METHODS[name];
    if (stringType === undefined) {
        return undefined;
    }
    // defense in depth: only retype while the checker still resolves a string-ish return
    // (a future TS change that makes one declaration non-string would otherwise silently
    // emit `string?` for a body that returns something else)
    if (!stringishReturn (csharp, node)) {
        return undefined;
    }
    return stringType;
}

function stringishReturn (csharp, node) {
    if (typeof csharp.getChecker !== 'function') {
        return true;
    }
    try {
        const checker = csharp.getChecker ();
        const signature = checker.getSignatureFromDeclaration (node);
        if (signature === undefined) {
            return true;
        }
        const type = checker.getReturnTypeOfSignature (signature);
        const members = (type.flags & ts.TypeFlags.Union) ? type.types : [ type ];
        let sawString = false;
        for (const member of members) {
            const flags = member.flags;
            if (flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) {
                continue;
            }
            if (flags & (ts.TypeFlags.String | ts.TypeFlags.StringLiteral)) {
                sawString = true;
                continue;
            }
            return false;
        }
        return sawString;
    } catch (e) {
        return true;
    }
}

// wrap printFunctionType on a Transpiler's C# printer. Idempotent. Every method the
// printer already typed (bool/bool?, void, Task<...>) and every method outside the table
// is returned untouched; only an `object` print of a listed name is replaced.
export function installCsharpStringReturns (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printFunctionType !== 'function' || csharp._stringReturnsPatched) {
        return;
    }
    const upstream = csharp.printFunctionType.bind (csharp);
    csharp.printFunctionType = (node) => {
        const own = upstream (node);
        const stringType = stringReturnType (csharp, node, own);
        return (stringType === undefined) ? own : stringType;
    };
    csharp._stringReturnsPatched = true;
}

export default installCsharpStringReturns;
