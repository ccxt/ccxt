// hx10 wave 3 J05 — nested Dict element reads on the describe()-typed base maps.
//
// `Helpers.GetValue (this.urls['api']['ws'], k)` keeps the helper because the TS type of a `Dict`
// value is `any`, so the printer cannot prove the intermediate value is a map. The generated class
// carries its own type table: the `put ("urls", new HashMap<String, Object> () {{ … }})` entry of
// describe (). At a key path whose every level is an object literal there, the runtime value is the
// plain HashMap the constructor built, so the read is the native `.get` (the helper's Map branch).
// Exactly two outcomes per site:
//   * the receiver chain is rooted at `this.urls` / `this.fees` / `this.limits`, every step is a
//     String-literal key the describe literal holds as an OBJECT -> `((Map<String, Object>) R).get (k)`;
//   * anything else (a dynamic key, a scalar or list leaf, a path the literal omits, a receiver
//     rooted elsewhere, an impure key expression) -> the helper call, untouched.
// No null guard is added on a proven step: the literal holds the entry, the same reading the printer
// already emits for the level-2 read (`((Map) this.urls.get ("api")).get ("ws")`) and for
// `market(...)['precision']['cost']`. A dynamic key keeps the helper's null answer for a null key.

const J05_ROOTS = new Set ([ 'urls', 'fees', 'limits' ]);
const J05_STRING = /^"(?:[^"\\]|\\.)*"$/;
const J05_IDENT = /^[A-Za-z_]\w*$/;
const J05_MARKER = 'new HashMap<String, Object>() {{';

// string / char / comment bodies blanked to spaces (newlines kept) so structure scans never read them
function j05Mask (text) {
    const out = text.split ('');
    const blank = (from, to) => {
        for (let k = from; k < to; k++) {
            if (out[k] !== '\n') { out[k] = ' '; }
        }
    };
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '\'') {
            let j = i + 1;
            while (j < text.length) {
                if (text[j] === '\\') { j += 2; continue; }
                if (text[j] === c) { break; }
                j++;
            }
            blank (i + 1, Math.min (j, text.length));
            i = j;
        } else if (c === '/' && text[i + 1] === '/') {
            const j = text.indexOf ('\n', i);
            const end = j === -1 ? text.length : j;
            blank (i, end);
            i = end;
        } else if (c === '/' && text[i + 1] === '*') {
            const j = text.indexOf ('*/', i + 2);
            const end = j === -1 ? text.length : j + 2;
            blank (i, end);
            i = end;
        }
    }
    return out.join ('');
}

// index of the closer that matches the opener at `open`
function j05Close (masked, open) {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') { depth++; }
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) { return i; }
        }
    }
    return -1;
}

// index of the opener that matches the closer at `close`
function j05Open (masked, close) {
    let depth = 0;
    for (let i = close; i >= 0; i--) {
        const c = masked[i];
        if (c === ')' || c === ']' || c === '}') { depth++; }
        else if (c === '(' || c === '[' || c === '{') {
            depth--;
            if (depth === 0) { return i; }
        }
    }
    return -1;
}

// the `{{` of the map body that holds the `put (` call starting at `at`
function j05EnclosingBody (masked, at) {
    let depth = 0;
    for (let i = at; i >= 0; i--) {
        const c = masked[i];
        if (c === ')' || c === ']' || c === '}') { depth++; }
        else if (c === '(' || c === '[' || c === '{') {
            depth--;
            if (depth < 0) {
                return (masked[i - 1] === '{') ? i - 1 : i;
            }
        }
    }
    return -1;
}

function j05Unwrap (text) {
    let t = text.trim ();
    for (;;) {
        if (t.startsWith ('(') && j05Close (t, 0) === t.length - 1) {
            t = t.slice (1, -1).trim ();
            continue;
        }
        return t;
    }
}

function j05SplitArgs (masked, open, close) {
    const out = [];
    let depth = 0;
    let at = open + 1;
    for (let i = open + 1; i < close; i++) {
        const c = masked[i];
        if (c === '<' && /[\w]/.test (masked[i - 1] ?? '')) {
            // a generic argument list is one token: `HashMap<String, Object>`
            const generic = /^<[\w.?,\s<>]*>/.exec (masked.slice (i, close));
            if (generic !== null) { i += generic[0].length - 1; continue; }
        }
        if (c === '(' || c === '[' || c === '{') { depth++; }
        else if (c === ')' || c === ']' || c === '}') { depth--; }
        else if (c === ',' && depth === 0) { out.push ([ at, i ]); at = i + 1; }
    }
    out.push ([ at, close ]);
    return out;
}

// describe () map bodies: `put ("<key>", new HashMap<String, Object> () {{ … }})` parsed into a tree
// where an object literal is a nested plain object and a list / scalar / unknown step is a marker.
function j05MapBody (text, masked, open) {
    const close = j05Close (masked, open);
    if (close < 0) { return undefined; }
    const from = open + 2;
    const to = Math.max (from, close - 1);
    const tree = {};
    let depth = 0;
    for (let i = from; i < to; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') { depth++; continue; }
        if (c === ')' || c === ']' || c === '}') { depth--; continue; }
        if (depth !== 0 || c !== 'p' || masked.slice (i, i + 4) !== 'put(' || /[\w.]/.test (masked[i - 1] ?? '')) { continue; }
        const putClose = j05Close (masked, i + 3);
        if (putClose < 0 || putClose > to) { continue; }
        const args = j05SplitArgs (masked, i + 3, putClose);
        if (args.length !== 2) { i = putClose; continue; }
        const key = text.slice (args[0][0], args[0][1]).trim ();
        if (J05_STRING.test (key)) {
            tree[JSON.parse (key)] = j05ValueKind (text.slice (args[1][0], args[1][1]));
        }
        i = putClose;
    }
    return tree;
}

function j05ValueKind (raw) {
    const v = raw.trim ();
    if (/^new\s+(?:java\.util\.)?HashMap\s*<\s*String\s*,\s*Object\s*>\s*\(\s*\)\s*\{\{/.test (v)) {
        const local = j05Mask (v);
        return j05MapBody (v, local, local.indexOf ('{{'));
    }
    if (/^new\s+(?:java\.util\.)?(?:HashMap|LinkedHashMap|TreeMap)\b/.test (v)) { return {}; }
    if (/^new\s+(?:java\.util\.)?(?:ArrayList|LinkedList|Vector)\b/.test (v)) { return 'list'; }
    if (/^(?:java\.util\.)?(?:Arrays\.asList|List\.of|Set\.of)\b/.test (v)) { return 'list'; }
    if (J05_STRING.test (v) || /^-?\d/.test (v) || /^(?:true|false|null|undefined)$/.test (v)) { return 'scalar'; }
    return 'other';
}

// the describe () map: the body that directly holds the `urls` entry (`this.describe = new HashMap…
// {{ put ("id", …); put ("urls", …); }}`), or a bare `put ("urls", <map>)` fragment when a caller
// hands the pass a describe body without its wrapper
function j05DescribeTree (text) {
    const masked = j05Mask (text);
    const needle = /put\s*\(\s*"urls"/g;
    let m;
    while ((m = needle.exec (text)) !== null) {
        const at = m.index;
        const open = j05EnclosingBody (masked, at);
        if (open >= 0 && masked.slice (open, open + 2) === '{{') {
            return j05MapBody (text, masked, open);
        }
        // a describe body handed over without its wrapper: `put ("urls", <map>);`
        const putClose = j05Close (masked, at + 3);
        if (putClose > at) {
            const comma = j05SplitArgs (masked, at + 3, putClose);
            const kind = comma.length === 2 ? j05ValueKind (text.slice (comma[1][0], comma[1][1])) : undefined;
            if (kind !== undefined && typeof kind === 'object') {
                return { 'urls': kind };
            }
        }
    }
    return undefined;
}

function j05KeyStep (raw) {
    const t = j05Unwrap (raw);
    if (J05_STRING.test (t)) { return { kind: 'literal', text: t }; }
    if (J05_IDENT.test (t)) { return { kind: 'ident', text: t }; }
    return undefined;
}

const j05IsTypeText = (s) => /^(?:java\.util\.)?[A-Za-z_][\w.]*(?:<[^()]*>)?$/.test (s) && !/^(?:true|false|null|this)$/.test (s);

// `(Type) expr` / `((Type) expr)` / `((Type)(expr))` wrapper -> the inner expression
function j05CastStrip (t) {
    if (!t.startsWith ('(')) { return undefined; }
    const close = j05Close (t, 0);
    if (close < 0) { return undefined; }
    const inner = t.slice (1, close).trim ();
    if (j05IsTypeText (inner)) {
        const rest = t.slice (close + 1).trim ();
        return rest === '' ? undefined : rest;
    }
    if (close === t.length - 1 && inner.startsWith ('(')) {
        const head = j05Close (inner, 0);
        if (head > 0 && head < inner.length - 1 && j05IsTypeText (inner.slice (1, head).trim ())) {
            return inner.slice (head + 1);
        }
    }
    return undefined;
}

// `this.<root>`, or a chain of `.get (k)` reads (transparent Map checkcasts) rooted at it, or one of
// the null guards the printer emits around such a read (`k == null || this.f == null ? null : …`)
function j05Chain (raw) {
    const t = j05Unwrap (raw);
    const direct = /^this\.([A-Za-z_]\w*)$/.exec (t);
    if (direct !== null) {
        return J05_ROOTS.has (direct[1]) ? { field: direct[1], steps: [] } : undefined;
    }
    const cast = j05CastStrip (t);
    if (cast !== undefined) { return j05Chain (cast); }
    // `<k> == null [|| this.<root> == null] ? null : <read>` selects nothing for a null key
    const guard = /^([A-Za-z_]\w*)\s*==\s*null\s*(?:\|\|\s*this\.([A-Za-z_]\w*)\s*==\s*null\s*)?\?\s*null\s*:\s*([\s\S]+)$/.exec (t);
    if (guard !== null) {
        const inner = j05Chain (guard[3]);
        if (inner === undefined) { return undefined; }
        if (guard[2] !== undefined && inner.field !== guard[2]) { return undefined; }
        const last = inner.steps[inner.steps.length - 1];
        if (last === undefined || last.kind !== 'ident' || last.text !== guard[1]) { return undefined; }
        return { field: inner.field, steps: inner.steps, guarded: true };
    }
    // `this.<root> == null ? null : <read>` guards the read of a literal key
    const fieldGuard = /^this\.([A-Za-z_]\w*)\s*==\s*null\s*\?\s*null\s*:\s*([\s\S]+)$/.exec (t);
    if (fieldGuard !== null) {
        const inner = j05Chain (fieldGuard[2]);
        if (inner === undefined || inner.field !== fieldGuard[1]) { return undefined; }
        return { field: inner.field, steps: inner.steps, guarded: true };
    }
    if (t.endsWith (')')) {
        const local = j05Mask (t);
        const open = j05Open (local, t.length - 1);
        if (open > 0) {
            const prefix = t.slice (0, open);
            const get = /\.get\s*$/.exec (prefix);
            if (get !== null) {
                const head = j05Chain (prefix.slice (0, get.index));
                if (head === undefined) { return undefined; }
                const step = j05KeyStep (t.slice (open + 1, t.length - 1));
                if (step === undefined) { return undefined; }
                return { field: head.field, steps: head.steps.concat ([ step ]), guarded: head.guarded === true };
            }
        }
    }
    return undefined;
}

const j05IsObject = (node) => node !== undefined && node !== null && typeof node === 'object' && !Array.isArray (node);

// the receiver's value is a map: every literal step must be an object literal there, and a dynamic
// step (a variable key) is a map only when every sibling it can select is one. A dynamic step can
// also select nothing, so the read it feeds needs a null guard.
function j05ValueIsMap (tree, steps) {
    let current = tree;
    let nullable = false;
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (!j05IsObject (current)) { return { ok: false, nullable }; }
        if (step.kind !== 'literal') {
            const children = Object.keys (current).map ((k) => current[k]);
            if (children.length === 0 || !children.every (j05IsObject)) { return { ok: false, nullable }; }
            current = {};
            nullable = true;
            continue;
        }
        const key = JSON.parse (step.text);
        if (!Object.prototype.hasOwnProperty.call (current, key)) { return { ok: false, nullable }; }
        current = current[key];
    }
    return { ok: j05IsObject (current), nullable };
}

function j05ReadText (step, receiver, nullable) {
    if (step.kind !== 'literal') {
        // a null key answers null in the helper, and `get (null)` throws on a concurrent map
        const guarded = nullable ? ` || ${receiver} == null` : '';
        return `(${step.text} == null${guarded} ? null : ((java.util.Map<String, Object>)${receiver}).get(${step.text}))`;
    }
    const read = `((java.util.Map<String, Object>)${receiver}).get(${step.text})`;
    return nullable ? `(${receiver} == null ? null : ${read})` : read;
}

export function nativeJavaJ05DictChains (content) {
    if (!/Helpers\.GetValue\(/.test (content)) { return content; }
    if (!/this\.urls|this\.fees|this\.limits/.test (content)) { return content; }
    const tree = j05DescribeTree (content);
    if (tree === undefined) { return content; }
    let out = content;
    // innermost first: an outer `GetValue (<inner read>, k)` is provable only after the inner one
    // is native, so repeat until a round rewrites nothing (the depth of a nested read)
    for (let round = 0; round < 6; round++) {
        const masked = j05Mask (out);
        const sites = [];
        let at = masked.indexOf ('Helpers.GetValue(');
        while (at >= 0) {
            const open = at + 'Helpers.GetValue'.length;
            const close = j05Close (masked, open);
            if (close < 0) { break; }
            const args = j05SplitArgs (masked, open, close);
            if (args.length === 2) {
                sites.push ({ start: at, end: close + 1, recvStart: args[0][0], recvEnd: args[0][1], keyStart: args[1][0], keyEnd: args[1][1] });
            }
            at = masked.indexOf ('Helpers.GetValue(', at + 1);
        }
        const shifts = [];
        const adjust = (pos) => {
            let p = pos;
            for (const shift of shifts) { if (shift.at < pos) { p += shift.delta; } }
            return p;
        };
        let changed = false;
        for (let i = sites.length - 1; i >= 0; i--) {
            const site = sites[i];
            const recv = out.slice (adjust (site.recvStart), adjust (site.recvEnd));
            const keyText = out.slice (adjust (site.keyStart), adjust (site.keyEnd));
            const chain = j05Chain (recv);
            if (chain === undefined || chain.steps.length === 0) { continue; }
            // a guard means the receiver can be null: the helper answers null there, the native
            // read would throw, and repeating the guard costs more than the helper call saves
            if (chain.guarded === true) { continue; }
            const proof = j05ValueIsMap (tree[chain.field], chain.steps);
            if (!proof.ok) { continue; }
            const key = j05KeyStep (keyText);
            if (key === undefined) { continue; }
            // a read that feeds an arithmetic helper keeps the helper: the add/compare inliners key
            // on the operand's printed shape, so retyping one moves the site into another family
            const lineStart = out.lastIndexOf ('\n', adjust (site.start)) + 1;
            const lineEnd = out.indexOf ('\n', adjust (site.end));
            const line = out.slice (lineStart, lineEnd === -1 ? out.length : lineEnd);
            if (/hx4J4\d|hx4J38|Helpers\.(?:add|subtract|multiply|divide)\(/.test (line)) { continue; }
            const read = j05ReadText (key, recv.trim (), proof.nullable || chain.guarded === true);
            const start = adjust (site.start);
            const end = adjust (site.end);
            out = out.slice (0, start) + read + out.slice (end);
            shifts.push ({ at: site.start, delta: read.length - (site.end - site.start) });
            changed = true;
        }
        if (!changed) { break; }
    }
    return out;
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function j05DictChainsSelfTest () {
    const problems = [];
    const describe = [
        '            put( "id", "test" );',
        '            put( "name", "Test" );',
        '            put( "urls", new HashMap<String, Object>() {{',
        '                put( "logo", "https://x/logo.png" );',
        '                put( "api", new HashMap<String, Object>() {{',
        '                    put( "public", "https://x/api" );',
        '                    put( "ws", new HashMap<String, Object>() {{',
        '                        put( "public", "wss://x/public" );',
        '                        put( "private", "wss://x/private" );',
        '                        put( "trading", new HashMap<String, Object>() {{',
        '                            put( "x", "y" );',
        '                        }} );',
        '                    }} );',
        '                }} );',
        '                put( "doc", new java.util.ArrayList<Object>(java.util.Arrays.asList( "https://x/doc" )) );',
        '            }} );',
        '            put( "fees", new HashMap<String, Object>() {{',
        '                put( "trading", new HashMap<String, Object>() {{',
        '                    put( "taker", 0.001 );',
        '                }} );',
        '            }} );',
        '            put( "limits", new HashMap<String, Object>() {{',
        '                put( "amount", new HashMap<String, Object>() {{',
        '                    put( "min", 0.001 );',
        '                }} );',
        '            }} );',
    ].join ('\n');
    const cls = (body) => 'public class Woo extends WooRest\n{\n    public Woo()\n    {\n        this.describe = new HashMap<String, Object>() {{\n' + describe + '\n        }};\n    }\n\n    public Object m(Object apiName, Object fees)\n    {\n' + body + '\n    }\n}';
    const cases = [
        // native: a literal path the describe literal holds as an object
        [ 'urls api ws literal key', '        return Helpers.GetValue(((Map<String, Object>)this.urls.get("api")).get("ws"), "private");',
            'return ((java.util.Map<String, Object>)((Map<String, Object>)this.urls.get("api")).get("ws")).get("private");' ],
        [ 'urls api level', '        return Helpers.GetValue(this.urls.get("api"), "public");',
            'return ((java.util.Map<String, Object>)this.urls.get("api")).get("public");' ],
        [ 'fees trading', '        return Helpers.GetValue(((Map<String, Object>)this.fees).get("trading"), "taker");',
            'return ((java.util.Map<String, Object>)((Map<String, Object>)this.fees).get("trading")).get("taker");' ],
        [ 'limits amount', '        return Helpers.GetValue(((Map<String, Object>)this.limits).get("amount"), "min");',
            'return ((java.util.Map<String, Object>)((Map<String, Object>)this.limits).get("amount")).get("min");' ],
        [ 'nested GetValue chain', '        return Helpers.GetValue(Helpers.GetValue(((Map<String, Object>)this.urls.get("api")).get("ws"), "trading"), "x");',
            'return ((java.util.Map<String, Object>)((java.util.Map<String, Object>)((Map<String, Object>)this.urls.get("api")).get("ws")).get("trading")).get("x");' ],
        // helper kept: scalar leaf path, unlisted path, foreign receiver, impure key, guarded receiver
        [ 'urls logo is a string', '        return Helpers.GetValue(this.urls, "logo");', undefined ],
        [ 'scalar receiver', '        return Helpers.GetValue(this.urls.get("logo"), "x");', undefined ],
        [ 'doc is a list', '        return Helpers.GetValue(this.urls.get("doc"), "0");', undefined ],
        [ 'foreign receiver', '        return Helpers.GetValue(market.get("info"), "id");', undefined ],
        [ 'impure key', '        return Helpers.GetValue(this.urls.get("api"), this.safeString(apiName, "k"));', undefined ],
        [ 'guarded receiver', '        return Helpers.GetValue((this.fees == null ? null : ((Map<?, ?>)this.fees).get("trading")), "taker");', undefined ],
        [ 'string content untouched', '        return "Helpers.GetValue(((Map<String, Object>)this.urls.get(\'api\')).get(\'ws\'), \'private\')";', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const input = cls (body);
        let out;
        try {
            out = nativeJavaJ05DictChains (input);
        } catch (e) {
            problems.push (`hx10w3 J05 ${name}: threw ${e.message}`);
            continue;
        }
        const ok = expect === undefined ? out === input : out.includes (expect);
        if (!ok) { problems.push (`hx10w3 J05 ${name}\n${out}`); }
        if (nativeJavaJ05DictChains (out) !== out) { problems.push (`hx10w3 J05 ${name} not idempotent`); }
    }
    // the inner read is native, the outer one keeps the helper (a scalar has no Map branch)
    const scalarLeaf = nativeJavaJ05DictChains (cls ('        return Helpers.GetValue(Helpers.GetValue(((Map<String, Object>)this.urls.get("api")).get("ws"), "public"), "x");'));
    if (!scalarLeaf.includes ('((Map<String, Object>)this.urls.get("api")).get("ws")).get("public")') || !scalarLeaf.includes ('return Helpers.GetValue(')) {
        problems.push (`hx10w3 J05 scalar leaf\n${scalarLeaf}`);
    }
    // a dynamic key keeps the helper's null-key answer
    const dynamic = nativeJavaJ05DictChains (cls ('        return Helpers.GetValue(this.urls.get("api"), apiName);'));
    if (!dynamic.includes ('(apiName == null ? null : ((java.util.Map<String, Object>)this.urls.get("api")).get(apiName))')) {
        problems.push (`hx10w3 J05 dynamic key\n${dynamic}`);
    }
    return problems;
}
