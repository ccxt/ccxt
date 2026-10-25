// hx10w2-G06: native InOp / ObjectKeys reads from the map type the Go declaration proves.
//
// Two outcomes per site, no inlining: a receiver whose declared Go type is map[string]any reads
// natively (`_, ok := m[k]`, `len(m)`, `for k := range m`); anything else keeps the helper call.
// A `var x any = <map producer>` local is retyped to map[string]any first (identity on a map,
// MapTyped's nil for a non-map reads as absent in every ObjectKeys/len consumer).

const G06_MAP_PRODUCERS = [
    // [whole-initializer regexp, wrap in MapTyped]
    [ /^(?:ccxt\.)?map\[string\]any\{.*\}$/, false ],
    [ /^(?:ccxt\.)?this\.(?:Extend|DeepExtend|DeepExtend2|Account)\(.*\)$/, false ],
    [ /^(?:ccxt\.)?this\.(?:Omit|OmitN|OmitMap)\(.*\)$/, true ],
];

// spaces out string/rune/comment text, newlines kept, offsets preserved
export function g06Mask (source) {
    const out = [];
    let mode = null;
    for (let i = 0; i < source.length; i++) {
        const c = source[i];
        const next = source[i + 1];
        if (mode === null) {
            if ((c === '/') && (next === '/')) { mode = 'line'; out.push ('  '); i++; continue; }
            if ((c === '/') && (next === '*')) { mode = 'block'; out.push ('  '); i++; continue; }
            if (c === '"') { mode = 'str'; out.push ('"'); continue; }
            if (c === '`') { mode = 'raw'; out.push ('`'); continue; }
            out.push (c);
            continue;
        }
        if (mode === 'line') {
            mode = (c === '\n') ? null : mode;
            out.push ((c === '\n') ? '\n' : ' ');
            continue;
        }
        if (mode === 'block') {
            if ((c === '*') && (next === '/')) { mode = null; out.push ('  '); i++; continue; }
            out.push ((c === '\n') ? '\n' : ' ');
            continue;
        }
        if (mode === 'str') {
            if (c === '\\') { out.push ('  '); i++; continue; }
            if (c === '"') { mode = null; out.push ('"'); continue; }
            out.push (' ');
            continue;
        }
        if (c === '`') { mode = null; out.push ('`'); continue; }
        out.push ((c === '\n') ? '\n' : ' ');
    }
    return out.join ('');
}

// end index (exclusive) of the balanced group opening at text[open], or -1
function g06GroupEnd (text, open) {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if (depth === 0) {
            return i + 1;
        }
    }
    return -1;
}

const g06Escape = (name) => name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');

// every declaration of `name` in this function: [ { kind, type, rhs, index } ]
function g06Declarations (lines, start, end, name) {
    const n = g06Escape (name);
    const found = [];
    const param = new RegExp ('[(,]\\s*' + n + ' (\\[\\]?[\\w.\\[\\]]+|\\*[\\w.]+)').exec (lines[start]);
    if (param !== null) {
        found.push ({ 'kind': 'param', 'type': param[1], 'rhs': undefined, 'index': start });
    }
    for (let k = start + 1; k < end; k++) {
        const decl = new RegExp ('^\\s*var ' + n + ' ([^\\s=]+) = (.*)$').exec (lines[k]);
        if (decl !== null) {
            found.push ({ 'kind': 'var', 'type': decl[1], 'rhs': decl[2].trim (), 'index': k });
        }
    }
    return found;
}

// any later write, rebinding, address-take or closure parameter of `name`
function g06NameIsRebound (maskedFunc, name) {
    const n = g06Escape (name);
    return new RegExp ('(?:^|[^\\w.&*])' + n + '\\s*=(?!=)|&\\s*' + n + '\\b|(?:^|[^\\w.])' + n + '\\s*(?:,[^=\\n]*)?:=|,\\s*' + n + '\\s*(?:,[^=\\n]*)?=(?!=)|(?:^|[^\\w.])' + n + '\\s*,[^=\\n]*=(?!=)|\\bfunc\\b[^{\\n]*[(,]\\s*' + n + ' ', 'm').test (maskedFunc);
}

// the whole right-hand side is one balanced call/literal and nothing follows it
function g06InitializerIsWhole (maskedLine, rhs) {
    const at = maskedLine.indexOf (rhs);
    if (at < 0) {
        return false;
    }
    const open = rhs.search (/[({\[]/);
    if (open < 0) {
        return false;
    }
    return g06GroupEnd (maskedLine, at + open) === at + rhs.length;
}

// `this.Omit(<local>, ...)` hands the map back unchanged when the operand is a proven map[string]any
// (OmitN/OmitMap answer `aa` only for a non-map or an array operand), so the result is a map on every path
function g06OmitOperandIsMap (lines, start, end, rhs, k, maskedFunc) {
    const operand = /^(?:ccxt\.)?this\.Omit\((\w+), /.exec (rhs);
    if (operand === null) {
        return false;
    }
    return g06MapReceiver (lines, start, end, operand[1], k, maskedFunc);
}

function g06ProducerOf (rhs) {
    const literal = G06_MAP_PRODUCERS[0];
    if (literal[0].test (rhs)) {
        return { 'wrap': literal[1], 'exact': true };
    }
    const concrete = G06_MAP_PRODUCERS[1];
    if (concrete[0].test (rhs)) {
        // Extend/DeepExtend/Account return map[string]any, so the declaration needs no conversion
        return { 'wrap': concrete[1], 'exact': true };
    }
    const boxed = G06_MAP_PRODUCERS[2];
    if (boxed[0].test (rhs)) {
        // the Omit family answers `any`: MapTyped is the map view, and an array operand would be lost
        return { 'wrap': boxed[1], 'exact': false };
    }
    return undefined;
}


// every read of the local must be one this pass converts: `omit` hands back an array unchanged, and a
// MapTyped retype would drop it, so a local any other read observes keeps its box (and the helper call).
function g06NameAt (line, name) {
    const word = (c) => ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || (c === '_'));
    let count = 0;
    let at = line.indexOf (name);
    while (at >= 0) {
        const before = (at > 0) ? line[at - 1] : ' ';
        const after = (at + name.length < line.length) ? line[at + name.length] : ' ';
        if (!word (before) && !word (after) && (before !== '.')) {
            count++;
        }
        at = line.indexOf (name, at + name.length);
    }
    return count;
}

export function g06ReadSetIsNative (maskedFunc, name) {
    const call = name + ', ';
    const lone = [ 'if InOp(', 'if !(InOp(', 'if !InOp(' ].map ((p) => p + call)
        .concat ([ '} else if InOp(', '} else if !(InOp(' ].map ((p) => p + call));
    const keysRead = [ 'len(ObjectKeys(' + name + '))', 'len(ccxt.ObjectKeys(' + name + '))' ];
    const rangeRead = [ '[]string = ObjectKeys(' + name + ')', '[]string = ccxt.ObjectKeys(' + name + ')',
        '[]any = ObjectValues(' + name + ')', '[]any = ccxt.ObjectValues(' + name + ')' ];
    let reads = 0;
    let converted = 0;
    for (const line of maskedFunc.split ('\n')) {
        if (line.trim ().startsWith ('var ' + name + ' any = ')) {
            continue;
        }
        const all = g06NameAt (line, name);
        if (all === 0) {
            continue;
        }
        reads += all;
        const trimmed = line.trim ();
        const closes = trimmed.endsWith (' {') || trimmed.endsWith (')) {');
        if ((closes && lone.some ((p) => trimmed.startsWith (p)))
            || keysRead.some ((r) => trimmed.includes (r))
            || (trimmed.startsWith ('var ') && rangeRead.some ((r) => trimmed.includes (r) && trimmed.endsWith (r)))) {
            converted += 1;
        }
    }
    return (reads > 0) && (reads === converted);
}

// the receiver of a native read: one declaration as map[string]any, before the read, never rebound
function g06MapReceiver (lines, start, end, name, k, maskedFunc) {
    const declarations = g06Declarations (lines, start, end, name);
    if ((declarations.length !== 1) || (declarations[0].type !== 'map[string]any')) {
        return false;
    }
    const declaration = declarations[0];
    if ((declaration.kind === 'var') && (declaration.index >= k)) {
        return false;
    }
    return !g06NameIsRebound (maskedFunc, name);
}

function g06KeyIsString (lines, start, end, key) {
    if (key.startsWith ('"')) {
        return true;
    }
    const declarations = g06Declarations (lines, start, end, key);
    return (declarations.length === 1) && (declarations[0].type === 'string');
}

// `InOp(m, k)` alone in an if condition -> `if _, ok := m[k]; ok {` (a fresh name when `ok` is taken)
function g06InOpCall (text) {
    return /^(!?)\(?(?:ccxt\.)?InOp\((\w+), (\w+|"[^"\\\n]*")\)\)?$/.exec (text);
}

function g06NativeInOpLine (lines, masked, k, maskedFunc, start, end) {
    const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (masked[k]);
    if (cond === null) {
        return false;
    }
    const call = g06InOpCall (cond[2].trim ());
    const literal = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (lines[k]);
    const real = (literal === null) ? null : g06InOpCall (literal[2].trim ());
    if ((call === null) || (real === null) || (call[2] !== real[2])) {
        return false;
    }
    const [ , negation, name, key ] = real;
    if (!g06MapReceiver (lines, start, end, name, k, maskedFunc) || !g06KeyIsString (lines, start, end, key)) {
        return false;
    }
    let local = 'ok';
    while (new RegExp ('\\b' + local + '\\b').test (maskedFunc)) {
        local = (local === 'ok') ? 'ok2' : ('ok' + (parseInt (local.slice (2), 10) + 1));
    }
    lines[k] = literal[1] + '_, ' + local + ' := ' + name + '[' + key + ']; ' + (negation ? '!' : '') + local + ' {';
    masked[k] = g06Mask (lines[k]);
    return true;
}

// `len(ObjectKeys(m))` -> `len(m)`: nil map reads 0 either way, every key of a map is a string key
function g06ObjectKeysLength (line, maskedLine, mapProof) {
    return line.replace (/(?<![\w.])len\((?:ccxt\.)?ObjectKeys\((\w+)\)\)/g, (all, name, at) =>
        ((maskedLine.substr (at, all.length) === all) && mapProof (name)) ? 'len(' + name + ')' : all);
}

// `var ks []string = ObjectKeys(m)` -> the nil/empty-preserving range the typed-local family emits
function g06ObjectKeysRange (masked, k, maskedFunc, mapProof) {
    const keys = /^(\s*)var (\w+) \[\]string = (?:ccxt\.)?ObjectKeys\((\w+)\)$/.exec (masked[k].replace (/\s+$/, ''));
    if (keys === null) {
        return undefined;
    }
    const [ , indentation, keysName, receiver ] = keys;
    if (!mapProof (receiver) || /\bobjectKey\b/.test (maskedFunc) || (keysName === receiver)) {
        return undefined;
    }
    return [
        indentation + 'var ' + keysName + ' []string = nil',
        indentation + 'if ' + receiver + ' != nil {',
        indentation + '\t' + keysName + ' = make([]string, 0, len(' + receiver + '))',
        indentation + '\tfor objectKey := range ' + receiver + ' {',
        indentation + '\t\t' + keysName + ' = append(' + keysName + ', objectKey)',
        indentation + '\t}',
        indentation + '}',
    ];
}

// `var xs []any = ObjectValues(m)`: the helper answers nil for a nil map and an empty slice for an empty one
function g06ObjectValuesRange (masked, k, maskedFunc, mapProof) {
    const values = /^(\s*)var (\w+) \[\]any = (?:ccxt\.)?ObjectValues\((\w+)\)$/.exec (masked[k].replace (/\s+$/, ''));
    if (values === null) {
        return undefined;
    }
    const [ , indentation, valuesName, receiver ] = values;
    if (!mapProof (receiver) || /\bobjectValue\b/.test (maskedFunc) || (valuesName === receiver)) {
        return undefined;
    }
    return [
        indentation + 'var ' + valuesName + ' []any = nil',
        indentation + 'if ' + receiver + ' != nil {',
        indentation + '\t' + valuesName + ' = make([]any, 0, len(' + receiver + '))',
        indentation + '\tfor _, objectValue := range ' + receiver + ' {',
        indentation + '\t\t' + valuesName + ' = append(' + valuesName + ', objectValue)',
        indentation + '\t}',
        indentation + '}',
    ];
}

export function g06MapReads (content) {
    if ((content.indexOf ('InOp(') < 0) && (content.indexOf ('ObjectKeys(') < 0) && (content.indexOf ('ObjectValues(') < 0) && !/var \w+ any = (?:ccxt\.)?this\.(?:Omit|OmitN|OmitMap|Extend|DeepExtend)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = g06Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    // the pro/prediction packages reach the runtime helpers through the ccxt import
    const qualifier = /^package (?:ccxtpro|ccxtprediction)\b/m.test (content) ? 'ccxt.' : '';
    const functions = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            functions.push ([ start, k ]);
            start = -1;
        }
    }
    for (let f = functions.length - 1; f >= 0; f--) {
        g06RewriteFunction (lines, masked, functions[f][0], functions[f][1], qualifier);
    }
    return lines.join ('\n');
}

function g06RewriteFunction (lines, masked, start, end, qualifier) {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    const retyped = [];
    for (let k = start + 1; k < end; k++) {
        const declaration = /^(\s*)var (\w+) any = (.*)$/.exec (masked[k]);
        if (declaration === null) {
            continue;
        }
        const production = g06ProducerOf (declaration[3]);
        if ((production === undefined) || !g06InitializerIsWhole (masked[k], declaration[3])) {
            continue;
        }
        const name = declaration[2];
        if ((g06Declarations (lines, start, end, name).length !== 1) || g06NameIsRebound (maskedFunc, name)) {
            continue;
        }
        const churn = [ 'InOp(' + name + ', ', 'ObjectKeys(' + name + ')', 'ObjectValues(' + name + ')' ].some ((r) => maskedFunc.includes (r));
        const boxedIsSafe = g06OmitOperandIsMap (lines, start, end, declaration[3], k, maskedFunc);
        if (!churn || (!production.exact && !boxedIsSafe && !g06ReadSetIsNative (maskedFunc, name))) {
            continue;
        }
        retyped.push ({ 'index': k, 'name': name, 'rhs': lines[k].substring (lines[k].length - declaration[3].length), 'wrap': production.wrap });
    }
    for (const { index, name, rhs, wrap } of retyped) {
        lines[index] = lines[index].replace ('var ' + name + ' any = ' + rhs, 'var ' + name + ' map[string]any = ' + (wrap ? (qualifier + 'MapTyped(' + rhs + ')') : rhs));
        masked[index] = g06Mask (lines[index]);
    }
    const splices = [];
    for (let k = start + 1; k < end; k++) {
        if (masked[k].indexOf ('ObjectKeys(') >= 0) {
            const range = g06ObjectKeysRange (masked, k, maskedFunc, (name) => g06MapReceiver (lines, start, end, name, k, maskedFunc));
            if (range !== undefined) {
                splices.push([ k, range ]);
                continue;
            }
            const line = g06ObjectKeysLength (lines[k], masked[k], (name) => g06MapReceiver (lines, start, end, name, k, maskedFunc));
            if (line !== lines[k]) {
                lines[k] = line;
                masked[k] = g06Mask (line);
            }
        }
        if (masked[k].indexOf ('ObjectValues(') >= 0) {
            const range = g06ObjectValuesRange (masked, k, maskedFunc, (name) => g06MapReceiver (lines, start, end, name, k, maskedFunc));
            if (range !== undefined) {
                splices.push([ k, range ]);
                continue;
            }
        }
        if (masked[k].indexOf ('InOp(') >= 0) {
            g06NativeInOpLine (lines, masked, k, maskedFunc, start, end);
        }
    }
    for (let s = splices.length - 1; s >= 0; s--) {
        lines.splice (splices[s][0], 1, ...splices[s][1]);
    }
}

// self-test: every positive goes native on a proven map, every unproven shape keeps the helper
export function g06MapReadsSelfTest () {
    const problems = [];
    const test = (body) => g06MapReads ('func (this *X) F(optionalArgs ...any) {\n' + body + '}\n');
    const expect = (name, text, needle, wanted) => {
        if ((text.indexOf (needle) >= 0) !== wanted) {
            problems.push ('hx10w2-G06 ' + name + ': ' + text);
        }
    };
    const omit = '\tvar query any = this.Omit(params, this.ExtractParams(path))\n';
    expect ('retype', test (omit + '\tif InOp(query, "margin") {\n\t}\n'), 'var query map[string]any = MapTyped(this.Omit(params, this.ExtractParams(path)))', true);
    expect ('keys length', test (omit + '\tif len(ObjectKeys(query)) > 0 {\n\t}\n'), 'if len(query) > 0 {', true);
    expect ('keys length keeps helper', test ('\tvar query any = SafeDict(p, "q")\n\tif len(ObjectKeys(query)) > 0 {\n\t}\n'), 'ObjectKeys(query)', true);
    expect ('inop', test (omit + '\tif InOp(query, "margin") {\n\t}\n'), 'if _, ok := query["margin"]; ok {', true);
    expect ('inop negated', test (omit + '\tif !(InOp(query, "margin")) {\n\t}\n'), 'if _, ok := query["margin"]; !ok {', true);
    expect ('inop else-if', test (omit + '\t} else if InOp(query, "margin") {\n\t}\n'), '} else if _, ok := query["margin"]; ok {', true);
    expect ('inop fresh ok', test (omit + '\t_, ok := this.SafeValue (p, 0)\n\t_ = ok\n\tif InOp(query, "margin") {\n\t}\n'), 'if _, ok2 := query["margin"]; ok2 {', true);
    expect ('inop unproven receiver', test ('\tvar query any = SafeDict(p, "q")\n\tif InOp(query, "margin") {\n\t}\n'), 'InOp(query, "margin")', true);
    expect ('inop rewritten local', test (omit + '\tquery = this.SafeDict(p, "q")\n\tif InOp(query, "margin") {\n\t}\n'), 'InOp(query, "margin")', true);
    expect ('inop unknown key', test (omit + '\tvar k *string = this.SafeString(p, "k")\n\tif InOp(query, k) {\n\t}\n'), 'InOp(query, k)', true);
    expect ('inop field receiver', test ('\tif InOp(this.Markets, "margin") {\n\t}\n'), 'InOp(this.Markets, "margin")', true);
    expect ('churn guard', test ('\tvar query any = this.Omit(params, path)\n\treturn query\n'), 'var query any =', true);
    const prediction = g06MapReads ('package ccxtprediction\n\nfunc (this *X) F(optionalArgs ...any) {\n' + omit + '\tif InOp(query, "margin") {\n\t}\n}\n');
    if (prediction.indexOf ('var query map[string]any = ccxt.MapTyped(this.Omit(params, this.ExtractParams(path)))') < 0) {
        problems.push ('hx10w2-G06 qualifier: ' + prediction);
    }
    expect ('keys range', test ('\tvar m map[string]any = GetArgMap(optionalArgs, 0, nil)\n\tvar keys []string = ObjectKeys(m)\n\t_ = keys\n'), 'var keys []string = nil\n\tif m != nil {\n\t\tkeys = make([]string, 0, len(m))\n\t\tfor objectKey := range m {\n\t\t\tkeys = append(keys, objectKey)\n\t\t}\n\t}', true);
    expect ('keys range keeps helper', test ('\tvar m any = SafeDict(p, "q")\n\tvar keys []string = ObjectKeys(m)\n\t_ = keys\n'), 'ObjectKeys(m)', true);
    expect ('values range', test ('\tvar m map[string]any = GetArgMap(optionalArgs, 0, nil)\n\tvar values []any = ObjectValues(m)\n\t_ = values\n'), 'for _, objectValue := range m {', true);
    expect ('values range keeps helper', test ('\tvar m any = SafeDict(p, "q")\n\tvar values []any = ObjectValues(m)\n\t_ = values\n'), 'ObjectValues(m)', true);
    return problems;
}
