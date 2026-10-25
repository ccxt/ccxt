// hx10 C05 wave 3: destructured tuple slot 0 typed from the producer's return type, so the final
// passes emit the native op (`add(x, ...)` -> `x + ...`, `isTrue(x)` -> `x`) instead of a helper.
//
// The printer emits `IList<object> tmp = (IList<object>)this.<producer>(...);` and then reads the
// slots as `var x = tmp[0];`, which leaves x `object` for every consumer. This pass names the box
// the producer's own EMITTED body proves on every return path and rewrites only the declaration
// (the slot read already holds that box, so the cast is an identity):
//
//   handleMarketTypeAndParams, `market` argument a `null` literal and `defaultValue` absent/null:
//     the dead market-row path is the only one that can answer null, and the rest are safeString2
//     (string or undefined), the `typeof === 'string'` methodOptions branch and the final
//     safeString2(this.options, ..., "spot") -- slot 0 is a NON-NULL string on every path.
//   handleOptionAndParams/2 with a bool literal `defaultValue` (or the target's own bool
//     initialiser) on an audited boolean option key: the helper returns the params value only when
//     it is non-null and the default otherwise, so slot 0 is a non-null bool.
//
// Everything else keeps the printer's `var` (the two-outcome rule): handleOptionAndParams slot 0 is
// the caller's raw params value (any JSON box) and element 1 belongs to the params machinery.

// audited boolean option keys: one documented writer each (the venue's own `.options` entry or the
// parameter default), always a bool -- the same evidence BOOL_OPTION_LOCALS rests on in
// build/csharp-local-types.js.
const BOOL_OPTION_KEYS = [ 'useDepthEndpoint', 'warnOnCancelAllOrdersWithOutcome', 'paginate', 'removeRepeated' ];

const HOLDER_RE = /^(\s*)IList<object> ([A-Za-z_]\w*) = \(IList<object>\)this\.([A-Za-z_]\w*)\((.*)\);\s*$/;
const DECL_SLOT_RE = /^(\s*)var ([A-Za-z_]\w*) = ([A-Za-z_]\w*)\[(\d+)\];\s*$/;
const WRITE_SLOT_RE = /^(\s*)([A-Za-z_]\w*) = ([A-Za-z_]\w*)\[(\d+)\];\s*$/;
const OBJECT_DECL_RE = /^(\s*)object ([A-Za-z_]\w*) = (.*);\s*$/;
const METHOD_END_RE = /^    \}/;
const METHOD_SIG_RE = /^    [A-Za-z]/;

function c05MaskLine (line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if ((ch === '/') && (line[i + 1] === '/')) {
            break;
        }
        if ((ch === '"') || (ch === "'")) {
            const quote = ch;
            out += ch;
            i++;
            while (i < line.length) {
                if (line[i] === '\\') {
                    out += line[i] + (line[i + 1] ?? '');
                    i += 2;
                    continue;
                }
                if (line[i] === quote) {
                    out += quote;
                    i++;
                    break;
                }
                out += line[i];
                i++;
            }
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}

function c05SplitArgs (text) {
    const out = [];
    let depth = 0;
    let current = '';
    let quote = null;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote !== null) {
            current += ch;
            if (ch === '\\') {
                current += text[i + 1] ?? '';
                i++;
                continue;
            }
            if (ch === quote) {
                quote = null;
            }
            continue;
        }
        if ((ch === '"') || (ch === "'")) {
            quote = ch;
            current += ch;
            continue;
        }
        if ((ch === '(') || (ch === '[') || (ch === '{')) {
            depth++;
        }
        if ((ch === ')') || (ch === ']') || (ch === '}')) {
            depth--;
        }
        if ((ch === ',') && (depth === 0)) {
            out.push(current.trim());
            current = '';
            continue;
        }
        current += ch;
    }
    out.push(current.trim());
    return out;
}

function c05Unquote (text) {
    return text.replace(/^"(.*)"$/, '$1');
}

// the same line with quoted text blanked, so an option name inside a string literal is no read
function c05MaskStrings (line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
        if ((line[i] === '"') || (line[i] === "'")) {
            const quote = line[i];
            out += quote;
            i++;
            while (i < line.length) {
                if (line[i] === '\\') {
                    i += 2;
                    continue;
                }
                if (line[i] === quote) {
                    break;
                }
                i++;
            }
            out += quote;
            i++;
            continue;
        }
        out += line[i];
        i++;
    }
    return out;
}

// the emitted method body around `at`: the previous and next top-level `    }` lines
function c05Region (lines, at) {
    let start = 0;
    for (let i = at - 1; i >= 0; i--) {
        if (METHOD_END_RE.test(lines[i])) {
            start = i + 1;
            break;
        }
    }
    let end = lines.length;
    for (let i = at + 1; i < lines.length; i++) {
        if (METHOD_END_RE.test(lines[i])) {
            end = i;
            break;
        }
    }
    return { start, end };
}

// slot 0 of `handleMarketTypeAndParams(method, null, params)` / `(..., null)` is a non-null string
function c05StringSlotProof (producer, args) {
    if (producer !== 'handleMarketTypeAndParams' || args.length < 3) {
        return undefined;
    }
    const market = args[1];
    if ((market !== 'null') && (market !== 'undefined')) {
        return undefined;
    }
    const rest = args.slice(3);
    if (!rest.every((a) => (a === 'null') || (a === 'undefined'))) {
        return undefined;
    }
    return 'string';
}

// slot 0 of a bool option read on an audited boolean key is a non-null bool
function c05BoolSlotProof (producer, args, target, declaredInit) {
    if ((producer !== 'handleOptionAndParams') && (producer !== 'handleOptionAndParams2')) {
        return undefined;
    }
    if (args.length < 3 || !BOOL_OPTION_KEYS.includes(c05Unquote(args[2]))) {
        return undefined;
    }
    const last = args[args.length - 1];
    if ((last === 'true') || (last === 'false')) {
        return 'bool';
    }
    if (target !== undefined && (last === target) && ((declaredInit === 'true') || (declaredInit === 'false'))) {
        return 'bool';
    }
    return undefined;
}

// slot 0 of `handleOptionAndParams(..., <bool parameter>)` on an audited key: the parameter is the
// default the helper falls back to (its `??= true` in the body makes it non-null) on every path
function c05BoolParameterSlotProof (lines, start, at, producer, args) {
    if ((producer !== 'handleOptionAndParams') && (producer !== 'handleOptionAndParams2')) {
        return undefined;
    }
    if (args.length < 3 || !BOOL_OPTION_KEYS.includes(c05Unquote(args[2]))) {
        return undefined;
    }
    const last = args[args.length - 1];
    if (!/^[A-Za-z_]\w*$/.test(last)) {
        return undefined;
    }
    let signature = -1;
    for (let k = at - 1; k >= start; k--) {
        if (/^\s*(?:public|private|protected|internal)\b/.test(lines[k]) && lines[k].includes('(')) {
            signature = k;
            break;
        }
    }
    if (signature < 0) {
        return undefined;
    }
    const paramRe = new RegExp('\\bbool\\?? ' + last + '\\b');
    if (!paramRe.test(lines[signature]) && !paramRe.test(lines[signature + 1] ?? '')) {
        return undefined;
    }
    const guardRe = new RegExp('^\\s*' + last + ' \\?\\?= (?:true|false);\\s*$');
    for (let k = signature + 1; k < at; k++) {
        if (guardRe.test(lines[k])) {
            return 'bool';
        }
    }
    return undefined;
}

// every other read of a bool-option target is a truthiness position (isTrue keeps its meaning on a
// bool/bool? box, and the final pass turns it into the plain test)
function c05BoolTargetUsesAreTruthy (lines, start, end, name, skip) {
    const nameRe = new RegExp('(?<![A-Za-z0-9_.])' + name + '(?![A-Za-z0-9_])');
    const truthRe = new RegExp('(?<![A-Za-z0-9_.])isTrue\\(' + name + '\\)', 'g');
    for (let i = start; i < end; i++) {
        if (skip.includes(i)) {
            continue;
        }
        const code = c05MaskStrings(c05MaskLine(lines[i]));
        if (!nameRe.test(code)) {
            continue;
        }
        const outside = code.split(truthRe).join('');
        if (nameRe.test(outside)) {
            return false;
        }
    }
    return true;
}

export function hx10C05TupleSlotTypes (content) {
    if (typeof content !== 'string') {
        return content;
    }
    if (!/IList<object> [A-Za-z_]\w* = \(IList<object>\)this\.handle(MarketType|Option)AndParams2?\(/.test(content)) {
        return content;
    }
    if (/^namespace Tests\b/m.test(content)) {
        return content;
    }
    const lines = content.split('\n');
    const edits = new Map();
    for (let i = 0; i < lines.length; i++) {
        const holder = HOLDER_RE.exec(lines[i]);
        if (holder === null) {
            continue;
        }
        const [ , , holderName, producer, argText ] = holder;
        const args = c05SplitArgs(argText);
        const { start, end } = c05Region(lines, i);
        for (let j = i + 1; j < Math.min(i + 10, end); j++) {
            const decl = DECL_SLOT_RE.exec(lines[j]);
            if ((decl !== null) && (decl[3] === holderName) && (decl[4] === '0')) {
                const name = decl[2];
                let type = c05StringSlotProof(producer, args);
                if (type === undefined) {
                    type = c05BoolSlotProof(producer, args, name, undefined);
                }
                if (type === undefined) {
                    type = c05BoolParameterSlotProof(lines, start, i, producer, args);
                }
                if (type === undefined) {
                    continue;
                }
                if (type === 'string') {
                    // a later write of the target would have to be a string as well
                    const writeRe = new RegExp('(?<![A-Za-z0-9_.])' + name + ' =');
                    const other = [];
                    for (let k = start; k < end; k++) {
                        if ((k !== j) && writeRe.test(c05MaskStrings(c05MaskLine(lines[k])))) {
                            other.push(k);
                        }
                    }
                    if (other.length > 0) {
                        continue;
                    }
                }
                edits.set(j, decl[1] + type + ' ' + name + ' = (' + type + ')' + holderName + '[0];');
                continue;
            }
            const write = WRITE_SLOT_RE.exec(lines[j]);
            if ((write === null) || (write[3] !== holderName) || (write[4] !== '0')) {
                continue;
            }
            const name = write[2];
            if (edits.has(j)) {
                continue;
            }
            let declaredInit;
            let declIndent = '    ';
            let declLine = -1;
            for (let k = j - 1; k >= start; k--) {
                const objectDecl = OBJECT_DECL_RE.exec(lines[k]);
                if ((objectDecl !== null) && (objectDecl[2] === name)) {
                    declaredInit = objectDecl[3].trim();
                    declIndent = objectDecl[1];
                    declLine = k;
                    break;
                }
            }
            let type = c05BoolSlotProof(producer, args, name, declaredInit);
            if (type === undefined) {
                continue;
            }
            if (!c05BoolTargetUsesAreTruthy(lines, start, end, name, [ declLine, i, j ])) {
                continue;
            }
            edits.set(declLine, declIndent + type + ' ' + name + ' = ' + declaredInit + ';');
            edits.set(j, write[1] + name + ' = (' + type + ')' + holderName + '[0];');
        }
    }
    if (edits.size === 0) {
        return content;
    }
    for (const [ at, text ] of edits) {
        lines[at] = text;
    }
    return lines.join('\n');
}

// ===== self-test (`csharpTranspiler.ts --self-test`) =====
function c05Wrap (body, signature = '    public virtual object f(object parameters)') {
    return [ 'namespace ccxt;', 'public partial class test : Exchange', '{',
        signature, '    {',
        ...body.split('\n').map((l) => '        ' + l), '    }', '}' ].join('\n');
}

export function hx10C05SnippetChecks () {
    const problems = [];
    const check = (name, body, expected, signature) => {
        const out = hx10C05TupleSlotTypes(c05Wrap(body, signature));
        if (!out.includes(expected)) {
            problems.push('hx10 C05 ' + name + ': ' + out.slice(-400));
        }
    };
    check('market-type slot is a string',
        'IList<object> typeparamsMarketTypeVariable = (IList<object>)this.handleMarketTypeAndParams("watchBalance", null, parameters);\nvar type = typeparamsMarketTypeVariable[0];',
        'string type = (string)typeparamsMarketTypeVariable[0];');
    check('market argument present keeps object',
        'IList<object> typeparamsMarketTypeVariable = (IList<object>)this.handleMarketTypeAndParams("watchPositions", market, parameters);\nvar type = typeparamsMarketTypeVariable[0];',
        'var type = typeparamsMarketTypeVariable[0];');
    check('defaultValue argument keeps object',
        'IList<object> typeparamsMarketTypeVariable = (IList<object>)this.handleMarketTypeAndParams("watchBalance", null, parameters, type);\nvar type = typeparamsMarketTypeVariable[0];',
        'var type = typeparamsMarketTypeVariable[0];');
    check('bool option slot is a bool',
        'IList<object> useDepthEndpointparamsDepthEndpointVariable = (IList<object>)this.handleOptionAndParams(paramsInterval, "watchOrderBookForSymbols", "useDepthEndpoint", false);\nvar useDepthEndpoint = useDepthEndpointparamsDepthEndpointVariable[0];',
        'bool useDepthEndpoint = (bool)useDepthEndpointparamsDepthEndpointVariable[0];');
    check('non-bool option keeps object',
        'IList<object> intervalparamsIntervalVariable = (IList<object>)this.handleOptionAndParams(paramsResolved, "watchOrderBookForSymbols", "interval", "100ms");\nvar interval = intervalparamsIntervalVariable[0];',
        'var interval = intervalparamsIntervalVariable[0];');
    check('bool option write types the declaration',
        'object warn = true;\nIList<object> warnparamsValueVariable = (IList<object>)this.handleOptionAndParams(paramsValue, "cancelAllOrders", "warnOnCancelAllOrdersWithOutcome", warn);\nwarn = warnparamsValueVariable[0];',
        '        bool warn = true;');
    check('bool option write casts the slot',
        'object warn = true;\nIList<object> warnparamsValueVariable = (IList<object>)this.handleOptionAndParams(paramsValue, "cancelAllOrders", "warnOnCancelAllOrdersWithOutcome", warn);\nwarn = warnparamsValueVariable[0];',
        '        warn = (bool)warnparamsValueVariable[0];');
    check('unaudited count option keeps object',
        'IList<object> callsValueVariable = (IList<object>)this.handleOptionAndParams(paramsValue, "fetchX", "maxCalls", 10);\nvar maxCalls = callsValueVariable[0];',
        'var maxCalls = callsValueVariable[0];');
    check('bool option parameter default types the slot',
        'removeRepeated ??= true;\nIList<object> removeRepeatedOptionparamsRemoveRepeatedVariable = (IList<object>)this.handleOptionAndParams(paramsPaginationDirection, method, "removeRepeated", removeRepeated);\nvar removeRepeatedOption = removeRepeatedOptionparamsRemoveRepeatedVariable[0];\nif (isTrue(removeRepeatedOption)) { }',
        'bool removeRepeatedOption = (bool)removeRepeatedOptionparamsRemoveRepeatedVariable[0];', '    public async virtual Task<object> f(object method, object parameters, bool? removeRepeated = null)');
    check('bool write ignores the option name in a string literal',
        'object paginate = false;\nIList<object> paginateparamsValueVariable = (IList<object>)this.handleOptionAndParams(paramsValue, "fetchMyTrades", "paginate", paginate);\npaginate = paginateparamsValueVariable[0];\nparamsValue = this.omit(paramsValue, "paginate");\nif (isTrue(paginate)) { }',
        '        bool paginate = false;');
    const once = hx10C05TupleSlotTypes(c05Wrap('IList<object> typeparamsMarketTypeVariable = (IList<object>)this.handleMarketTypeAndParams("watchBalance", null, parameters);\nvar type = typeparamsMarketTypeVariable[0];'));
    if (hx10C05TupleSlotTypes(once) !== once) {
        problems.push('hx10 C05 not idempotent');
    }
    const tests = c05Wrap('IList<object> typeparamsMarketTypeVariable = (IList<object>)this.handleMarketTypeAndParams("watchBalance", null, parameters);\nvar type = typeparamsMarketTypeVariable[0];').replace('namespace ccxt;', 'namespace Tests');
    if (hx10C05TupleSlotTypes(tests) !== tests) {
        problems.push('hx10 C05 tests namespace changed');
    }
    return problems;
}
