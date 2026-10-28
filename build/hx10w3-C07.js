// hx10 wave3 C07 (C#): the `object` method parameters whose ts/src signature proves a scalar --
// handleErrors()' code / statusCode and the boolean flags of the ws subscribe/watch helpers --
// are narrowed, so the printer emits `==` and the post-print isTrue pass emits the bool read
// where the runtime isEqual / isTrue call stands today. Name + position keyed like the tables it
// extends: every declaration of a name moves together (C# overrides are invariant), and each gate
// below re-checks the proof that makes the narrowed type the declaration's own type.
import { CSHARP_BOOLEAN_PARAMS, CSHARP_LOCAL_THIS_RETURN_TYPES, SIGNATURE_ARG_TYPES } from './csharp-local-types.js'

// position 0 of handleErrors() is `int` on all 102 generated declarations (code / httpCode /
// statusCode), never written by a body and never read as a string: a nullable integer is that
// parameter's own type, and `code == N` is isEqual's integer branch for every value it can hold.
// retypeSignatureArgs rewrites the declarations and castCoreArgCallSites the call sites; the only
// call site (cs/ccxt/base/Exchange.cs) passes an `int`, which converts implicitly.
const HX10W3C07_SIGNATURE_ARGS = {
    'handleErrors': { 0: 'Int64?' },
}

// boolean flags: csharpBooleanParamType re-checks the checker per declaration (boolean, and
// optional only for `bool?`), and every C# call site of these positions passes a bool literal, a
// narrowed param or nothing (backpack subscribeWsTickers/watchPublic/watchPrivate; htx
// getUrlByMarketType, whose `isLinear` position stays object: its callers pass a market-row read).
const HX10W3C07_BOOLEAN_ARGS = {
    'getUrlByMarketType': { 2: 'bool?', 3: 'bool?', 4: 'bool?' },
    'subscribeWsTickers': { 3: 'bool?', 4: 'bool?' },
    'watchPublic': { 3: 'bool?' },
    'watchPrivate': { 3: 'bool?' },
    // hx11 w8: the flags whose bodies read `isTrue(flag)`; every C# call site passes bool, bool?,
    // a bool literal or nothing (the checker still declines same-named non-boolean declarations)
    'loadBalanceSnapshot': { 3: 'bool?' },
    'loadPositionsSnapshot': { 3: 'bool?' },
    'negotiate': { 1: 'bool?' },
    'parseBalanceCustom': { 3: 'bool?' },
    'requestWs': { 2: 'bool?' },
    'subscribeMultiple': { 3: 'bool?' },
    'subscribePublic': { 2: 'bool?' },
    'unsubscribeAllWs': { 0: 'bool?' },
    'watchMultiHelper': { 2: 'bool?' },
}

// hx11 w8: boolean-returning methods declared once (`: boolean` -> printed `bool`), so a local
// fed by one is a bool and `isTrue(local)` reads it bare
for (const name of [ 'isConditionalOrder', 'isEddsaApiKey' ]) {
    if (CSHARP_LOCAL_THIS_RETURN_TYPES[name] === undefined) {
        CSHARP_LOCAL_THIS_RETURN_TYPES[name] = 'bool'
    }
}

for (const [ name, positions ] of Object.entries (HX10W3C07_SIGNATURE_ARGS)) {
    SIGNATURE_ARG_TYPES[name] = Object.assign ({}, SIGNATURE_ARG_TYPES[name] ?? {}, positions)
}
for (const [ name, positions ] of Object.entries (HX10W3C07_BOOLEAN_ARGS)) {
    CSHARP_BOOLEAN_PARAMS[name] = Object.assign ({}, CSHARP_BOOLEAN_PARAMS[name] ?? {}, positions)
}

// snippet checks for `csharpTranspiler.ts --self-test`: a narrowed handleErrors code prints the
// integer operator, a listed boolean flag prints bool?. Both keep the helper / `object` on the
// generator without this module's tables.
export function hx10W3C07SnippetChecks (transpile) {
    const problems = []
    const printed = (body) => transpile ('class Test {\n' + body + '\n}')
    const code = printed ('    handleErrors (code, reason) { if (code === 418) { return 1; } return 0; }')
    if (!code.includes ('(code == 418)') || code.includes ('isEqual(code, 418)')) {
        problems.push ('hx10 wave3 C07: handleErrors code isEqual stayed a helper:\n' + code)
    }
    const flag = printed ('    subscribeWsTickers (methodName: string, symbols: any, params: any, bidAsk: boolean = false) { return 1; }')
    if (!/bool\? bidAsk\b/.test (flag)) {
        problems.push ('hx10 wave3 C07: boolean flag did not print bool?:\n' + flag)
    }
    return problems
}
