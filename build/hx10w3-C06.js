// hx10 wave 3 unit C06 (cs): generated method RETURN types. A method whose declaration prints
// `object` but whose every return path already boxes one concrete type keeps that type: the
// signature prints it, each return gets the identity boundary cast, and the callers' locals
// (`object x = this.<name>(...)`) are declared with the same type, so the wave-2 passes see a
// proven receiver/operand. Names whose returns are not proven stay exactly as the base emitted.

export const HX10W3_C06_RETURN_TYPES = {
    // backpack: one `return market;`, market declared IDictionary<string, object> from safeDict,
    // and the null case throws BadSymbol above it -> the cast is an identity.
    'rfqConversionMarket': 'IDictionary<string, object>',
    // backpack: one `return new List<object>() { stock, query };` -> List<object> box.
    'handleStockParams': 'List<object>',
};

// register into the printer's own tables (name-keyed, so every declaration and every caller agrees)
export function w3c06Types (returnTypes, localReturnTypes, types = HX10W3_C06_RETURN_TYPES) {
    for (const [ name, type ] of Object.entries (types)) {
        if (!Object.prototype.hasOwnProperty.call (returnTypes, name)) {
            returnTypes[name] = type;
        }
        if (!Object.prototype.hasOwnProperty.call (localReturnTypes, name)) {
            localReturnTypes[name] = type;
        }
    }
    return types;
}

// callees whose EMITTED signature already returns a string: same-file declarations are read from
// the content, and these base helpers live in another file (cs/ccxt/base/Exchange*.cs).
const C06_STRING_CALLEES = new Set ([ 'extendedStarknetSign', 'safeString', 'safeStringLower', 'safeStringUpper',
    'safeString2', 'safeStringN', 'numberToString', 'decimalToPrecision' ]);

function c06w3StringCallees (content) {
    const names = new Set (C06_STRING_CALLEES);
    const pattern = /^[ \t]*(?:public|internal)[ \t]+(?:static[ \t]+)?(?:virtual[ \t]+|override[ \t]+|sealed[ \t]+)*string\??[ \t]+([A-Za-z_]\w*)[ \t]*\(/gm;
    let match;
    while ((match = pattern.exec (content)) !== null) {
        names.add (match[1]);
    }
    return names;
}

function c06w3Mask (line) {
    const out = line.split ('');
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if ((ch === '/') && (line[i + 1] === '/')) {
            for (let j = i; j < line.length; j++) out[j] = ' ';
            break;
        }
        if (ch === '"') {
            out[i] = ' ';
            i += 1;
            while (i < line.length) {
                if ((line[i] === '\\') && (i + 1 < line.length)) {
                    out[i] = ' ';
                    out[i + 1] = ' ';
                    i += 2;
                    continue;
                }
                if (line[i] === '"') {
                    out[i] = ' ';
                    i += 1;
                    break;
                }
                out[i] = ' ';
                i += 1;
            }
            continue;
        }
        i += 1;
    }
    return out.join ('');
}

function c06w3Close (masked, open) {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        if (masked[i] === '(') {
            depth += 1;
        } else if (masked[i] === ')') {
            depth -= 1;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// parseJson(<call whose signature returns a string>) -> JsonHelper.Deserialize((string)<call>),
// exactly the argument parseJson's own body hands to the deserializer
export function c06w3ParseJson (content) {
    if (!content.includes ('parseJson(')) {
        return content;
    }
    if (/^\s*namespace Tests\b/m.test (content)) {
        return content;
    }
    const callees = c06w3StringCallees (content);
    const lines = content.split ('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes ('parseJson(')) {
            continue;
        }
        let masked = c06w3Mask (lines[i]);
        let at = masked.search (/(?<![\w.])(?:this\.)?parseJson\s*\(/);
        while (at !== -1) {
            const open = masked.indexOf ('(', at + 8);
            const close = c06w3Close (masked, open);
            if (close === -1) {
                break;
            }
            const inner = masked.substring (open + 1, close).trim ();
            const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (inner);
            const only = (call !== null) && (c06w3Close (masked, open + 1 + inner.indexOf ('(')) === close - 1);
            if (!only || !callees.has (call[1])) {
                break;
            }
            const text = lines[i].substring (open + 1, close).trim ();
            const native = 'JsonHelper.Deserialize((string)' + text + ')';
            lines[i] = lines[i].substring (0, at) + native + lines[i].substring (close + 1);
            masked = c06w3Mask (lines[i]);
            changed = true;
            at = masked.search (/(?<![\w.])(?:this\.)?parseJson\s*\(/);
        }
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function c06w3Checks (returnTypes, localReturnTypes) {
    const problems = [];
    const probeReturn = {};
    const probeLocal = { 'c06ProbeKept': 'Int64?' };
    w3c06Types (probeReturn, probeLocal, { 'c06ProbeString': 'string?' });
    if (probeReturn['c06ProbeString'] !== 'string?' || probeLocal['c06ProbeString'] !== 'string?') {
        problems.push ('hx10w3 C06 table registration: return/local tables not filled');
    }
    if (probeLocal['c06ProbeKept'] !== 'Int64?') {
        problems.push ('hx10w3 C06 table registration: an existing entry was overwritten');
    }
    for (const name of Object.keys (HX10W3_C06_RETURN_TYPES)) {
        if (returnTypes[name] !== HX10W3_C06_RETURN_TYPES[name] || localReturnTypes[name] !== HX10W3_C06_RETURN_TYPES[name]) {
            problems.push ('hx10w3 C06 table registration: ' + name);
        }
    }
    const wrap = (body, ns) => 'namespace ' + (ns || 'ccxt') + ';\npublic partial class t : Exchange\n{\n    public string sig(object a)\n    {\n        return "x";\n    }\n\n    public object f(object o)\n    {\n' + body + '\n    }\n}\n';
    const positive = [
        [ 'parseJson on a string-returning call', '        object parsed = parseJson(this.sig(o));',
            '        object parsed = JsonHelper.Deserialize((string)this.sig(o));' ],
    ];
    for (const [ label, body, expected ] of positive) {
        const out = c06w3ParseJson (wrap (body));
        if (!out.includes (expected)) {
            problems.push ('hx10w3 C06 ' + label + ': ' + out.slice (-260));
        }
        if (c06w3ParseJson (out) !== out) {
            problems.push ('hx10w3 C06 ' + label + ': not idempotent');
        }
    }
    const keeps = [
        // an object-returning callee keeps the helper
        '        object parsed = parseJson(this.sigObject(o));',
        // an untyped receiver keeps the helper
        '        object value = this.safeValue(o, "k");\n        object parsed = parseJson(value);',
        // a non-call argument keeps the helper
        '        object parsed = parseJson(o);',
        // a call nested in a larger argument keeps the helper
        '        object parsed = parseJson(add(this.sig(o), "x"));',
    ];
    for (const body of keeps) {
        const out = c06w3ParseJson (wrap (body));
        if (out !== wrap (body)) {
            problems.push ('hx10w3 C06 keeps ' + body);
        }
    }
    const tests = wrap ('        object parsed = parseJson(this.sig(o));', 'Tests');
    if (c06w3ParseJson (tests) !== tests) {
        problems.push ('hx10w3 C06 tests namespace changed');
    }
    return problems;
}
