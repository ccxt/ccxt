// hx10 wave-2 unit R01 (rust): native `get_value` on receivers whose container
// shape is static. A `Value` receiver cannot be read natively — the runtime
// dispatches on the variant AND on the book/cache markers a Dict may carry — so
// a read goes native only when the generated text itself pins the receiver:
//
//   seq:  `let x: Value = <arr-init>` where every later use is an index read or
//         a length sink  ->  retyped `Vec<Value>`, and
//         get_value(&x, &KEY)  ->  x.get(<idx>).cloned().unwrap_or(Value::Null)
//   dict: `let x: Value = Value::Map({..})` over a literal, marker-free key set
//         and never reassigned  ->  get_value(&x, &Value::Str("k"))
//                                   ->  x.as_map().unwrap().get("k").cloned().unwrap_or(Value::Null)
//
// The key may be a literal int (or a numeric-string literal) or a loop counter
// pinned to `Value::Int` by its own declaration. Both spellings match the
// helper exactly: its array branch IS `a.get(idx).cloned()` / `Null` for a
// negative, out-of-range or unparseable key, and a marker-free dict skips every
// routing arm of its Dict branch, leaving the snapshot lookup. Anything
// unproven keeps the plain `get_value(...)` call.

const IDENT = '[A-Za-z_][A-Za-z0-9_]*';

// Keys whose presence in a Dict activates a fetch/store routing arm of
// `get_value` (runtime value.rs): book/cache handle ids and markers.
const MARKER_KEYS = ['__book_id', '__cache_id', '__cacheKind', '__sideKind', '__live_id'];
// Keys the Dict branch special-cases on the way through.
const ROUTED_KEYS = ['cache', 'hashmap', 'subscriptions', 'futures', 'timestamp', 'datetime', 'nonce', 'symbol', 'checksum'];

function maskText(src: string): string {
    let out = '';
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') { out += ' '; i++; }
            continue;
        }
        if (c === '"') {
            out += ' ';
            i++;
            while (i < src.length && src[i] !== '"') {
                if (src[i] === '\\') { out += '  '; i += 2; continue; }
                out += src[i] === '\n' ? '\n' : ' ';
                i++;
            }
            if (i < src.length) { out += ' '; i++; }
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

function closeBracket(src: string, open: number): number {
    let depth = 0;
    for (let k = open; k < src.length; k++) {
        const c = src[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return k + 1;
        }
    }
    return -1;
}

function statementEnd(src: string, from: number): number {
    let depth = 0;
    for (let k = from; k < src.length; k++) {
        const c = src[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            if (depth === 0) return -1;
            depth--;
        } else if (c === ';' && depth === 0) return k + 1;
        else if (c === '\n' && depth === 0) return -1;
    }
    return -1;
}

// Initializers the runtime only ever answers with a fresh `Value::Array`.
// `promise_all` is NOT one (it is `v.clone()`), nor `index_by` (a map for a
// non-array arg), nor any `safe_value*`.
const ARRAY_INIT = /^(?:Value::Array\(|Value::from\(\s*vec!\[|Value::from\(\s*std::sync::Arc::new\(\s*vec!\[|split\(|object_keys\(|object_values\(|self\.array_concat\(|self\.safe_list(?:_k|_n)?\()/;
// A fresh dict literal: `Value::Map({.. let mut m = indexmap::IndexMap::new(); ..})`.
const DICT_INIT = /^(?:Value::Map\(|Value::Dict\()/;
const SEQ_TYPE = /^(?:&)?(?:mut )?(?:Vec<(?:crate::)?Value>|\[(?:crate::)?Value\])$/;
const INDEXED = '.cloned().unwrap_or(Value::Null)';

type Edit = { start: number, end: number, text: string };

function literalIndex(keyText: string): number {
    const key = keyText.trim().replace(/^&/, '').trim();
    const int = /^Value::Int\(\s*(\d+)\s*\)$/.exec(key);
    if (int !== null) return Number(int[1]);
    const str = /^Value::Str\(\s*"(\d+)"\s*(?:\.into\(\)|\.to_string\(\))?\s*\)$/.exec(key);
    if (str !== null) return Number(str[1]);
    return -1;
}

function literalStrKey(keyText: string): string | undefined {
    const key = keyText.trim().replace(/^&/, '').trim();
    const m = /^Value::Str\(\s*"([^"\\]*)"\s*(?:\.into\(\)|\.to_string\(\))?\s*\)$/.exec(key);
    return m === null ? undefined : m[1];
}

/** Bare identifier used as a key, or undefined. */
function identKey(keyText: string): string | undefined {
    const m = /^&?([A-Za-z_][A-Za-z0-9_]*)$/.exec(keyText.trim());
    return m === null ? undefined : m[1];
}

/** Split `get_value(&RECV, &KEY)` at `callStart`; returns [recvEnd, close]. */
function callArgs(masked: string, callStart: number, recv: string): [number, number] | undefined {
    const head = 'get_value(&' + recv;
    if (masked.slice(callStart, callStart + head.length) !== head) return undefined;
    const afterRecv = callStart + head.length;
    if (masked[afterRecv] !== ',') return undefined;
    const close = closeBracket(masked, masked.indexOf('(', callStart));
    if (close < 0) return undefined;
    return [afterRecv, close];
}

/**
 * True when `name` in this region can only ever hold `Value::Int`: one
 * declaration initialised with an int literal, mutated only by the printer's
 * `if let Value::Int(n) = &mut name { *n += 1; }` counter step.
 */
function intPinned(region: string, name: string): boolean {
    const declRe = new RegExp('^[ \\t]*let (?:mut )?' + name + ':\\s*(?:crate::)?Value\\s*=\\s*Value::Int\\(\\s*\\d+\\s*\\);', 'm');
    const decl = declRe.exec(region);
    if (decl === null) return false;
    const declEnd = decl.index + decl[0].length;
    const useRe = new RegExp('(?<![A-Za-z0-9_.])' + name + '(?![A-Za-z0-9_])', 'g');
    let um: RegExpExecArray | null;
    while ((um = useRe.exec(region)) !== null) {
        const at = um.index;
        if (at >= decl.index && at < declEnd) continue;
        const before = region.slice(Math.max(0, at - 5), at);
        const after = region.slice(at + name.length);
        if (before === '&mut ' && /^\s*\{\s*\*n \+= 1;\s*\}/.test(after)) continue;
        if (before.endsWith('&')) continue;
        if (/^\.(?:as_(?:i64|f64)|clone)\(\)/.test(after)) continue;
        return false;
    }
    return true;
}

export type Hx10R01Stats = { seqLocals: number, seqReads: number, dictLocals: number, dictReads: number };

/**
 * Native `get_value` on statically pinned receivers. `stats` is filled in for
 * the campaign census.
 */
export function nativeGetValue(content: string, stats?: Hx10R01Stats): string {
    const masked = maskText(content);
    const edits: Edit[] = [];

    // Fn regions: a local of one fn is never in scope in another.
    const headers: number[] = [];
    const headerRe = /^[ \t]*(?:pub )?(?:async )?fn /gm;
    let hm: RegExpExecArray | null;
    while ((hm = headerRe.exec(masked)) !== null) headers.push(hm.index);
    headers.push(content.length);

    for (let h = 0; h + 1 < headers.length; h++) {
        const from = headers[h];
        const to = h + 2 < headers.length ? headers[h + 1] : content.length;
        const region = masked.slice(from, to);

        // A read's replacement text, or undefined when the receiver/key pair is
        // not one this rule can prove.
        const readText = (recv: string, seq: boolean, keyText: string): string | undefined => {
            if (seq) {
                const idx = literalIndex(keyText);
                if (idx >= 0) return recv + '.get(' + idx + ')' + INDEXED;
                const key = identKey(keyText);
                if (key !== undefined && intPinned(region, key)) {
                    return recv + '.get(' + key + '.as_i64().unwrap() as usize)' + INDEXED;
                }
                return undefined;
            }
            const str = literalStrKey(keyText);
            if (str === undefined || ROUTED_KEYS.indexOf(str) >= 0) return undefined;
            return recv + '.as_map().unwrap().get("' + str + '").cloned().unwrap_or(Value::Null)';
        };
        const rewriteRead = (recv: string, seq: boolean, callStart: number): Edit | undefined => {
            const args = callArgs(masked, callStart, recv);
            if (args === undefined) return undefined;
            const text = readText(recv, seq, content.slice(args[0] + 1, args[1] - 1));
            return text === undefined ? undefined : { start: callStart, end: args[1], text };
        };

        // Receivers already declared as a sequence of `Value`.
        const declared = new Map<string, string>();
        const declType = new RegExp('\\blet (?:mut )?(' + IDENT + ')\\s*:\\s*([^=;]+?)\\s*=', 'g');
        let dm: RegExpExecArray | null;
        while ((dm = declType.exec(region)) !== null) declared.set(dm[1], dm[2].trim());
        const headerEnd = region.indexOf('{');
        const headerText = headerEnd < 0 ? region : region.slice(0, headerEnd);
        const paramRe = new RegExp('\\b(?:mut )?(' + IDENT + ')\\s*:\\s*([&\\[A-Za-z_][A-Za-z0-9_:<>,\\s&\\[\\]]*)', 'g');
        while ((dm = paramRe.exec(headerText)) !== null) {
            if (!declared.has(dm[1])) declared.set(dm[1], dm[2].trim());
        }
        for (const [name, type] of declared) {
            if (!SEQ_TYPE.test(type)) continue;
            const useRe = new RegExp('get_value\\(&' + name + '(?![A-Za-z0-9_])', 'g');
            let um: RegExpExecArray | null;
            while ((um = useRe.exec(region)) !== null) {
                const read = rewriteRead(name, true, from + um.index);
                if (read === undefined) continue;
                edits.push(read);
                if (stats) stats.seqReads++;
            }
        }

        // Locals whose initializer pins the container shape.
        const declRe = new RegExp('^([ \\t]*)let (mut )?(' + IDENT + '):\\s*(?:crate::)?Value\\s*=\\s*', 'gm');
        while ((dm = declRe.exec(region)) !== null) {
            const name = dm[3];
            const declAt = from + dm.index;
            const initStart = declAt + dm[0].length;
            const stmtEnd = statementEnd(masked, initStart);
            if (stmtEnd < 0) continue;
            const initText = content.slice(initStart, stmtEnd).trim();
            const isSeq = ARRAY_INIT.test(initText);
            const isDict = DICT_INIT.test(initText);
            if (!isSeq && !isDict) continue;
            const declCount = (region.match(new RegExp('\\blet (?:mut )?' + name + '\\b', 'g')) ?? []).length;
            if (declCount !== 1) continue;
            // A reassignment could hand the local another shape.
            if (new RegExp('(?<![A-Za-z0-9_.])' + name + '\\s*=[^=]').test(region)) continue;
            // A dict's key set must be literal and marker-free for the native
            // read to skip the same routing the helper does.
            const dictKeys: string[] = [];
            if (isDict) {
                const keys = insertedKeys(initText);
                if (keys === undefined) continue;
                for (const k of keys) dictKeys.push(k);
            }

            // Every later use must be one this rule keeps exact.
            const useRe = new RegExp('(?<![A-Za-z0-9_.])' + name + '(?![A-Za-z0-9_])', 'g');
            const reads: Edit[] = [];
            let ok = true;
            let um: RegExpExecArray | null;
            while ((um = useRe.exec(region)) !== null) {
                const at = um.index;
                if (at >= dm.index && at < dm.index + dm[0].length) continue;
                const gv = region.lastIndexOf('get_value(', at);
                if (gv >= 0 && region.slice(gv, at) === 'get_value(&') {
                    const read = rewriteRead(name, isSeq, from + gv);
                    if (read === undefined) { ok = false; break; }
                    reads.push(read);
                    continue;
                }
                // A length sink reads the same on a Vec and on a `Value` array.
                if (isSeq && /^\.\s*(?:len|is_empty)\s*\(\s*\)/.test(region.slice(at + name.length))) continue;
                if (isSeq) { ok = false; break; }
                // A dict keeps its `Value` type, so only writes can change what
                // the read would have to route: they must land on literal,
                // non-marker keys. Reads by other means and Value sinks are fine.
                const before = region.slice(Math.max(0, at - 24), at);
                const writeHead = /(?:add_element_to_object|set_value)\(\s*&mut\s+$/.exec(before);
                if (writeHead !== null) {
                    const keyStart = at + name.length;
                    const key = /^\s*,\s*&?\s*Value::Str\(\s*"([^"\\]*)"\s*(?:\.into\(\)|\.to_string\(\))?\s*\)\s*,/.exec(region.slice(keyStart));
                    if (key === null) { ok = false; break; }
                    if (ROUTED_KEYS.indexOf(key[1]) >= 0 || MARKER_KEYS.indexOf(key[1]) >= 0) { ok = false; break; }
                    dictKeys.push(key[1]);
                    continue;
                }
                if (/&mut\s+$/.test(before)) { ok = false; break; }
            }
            if (!ok || reads.length === 0) continue;
            if (dictKeys.some((k) => MARKER_KEYS.indexOf(k) >= 0)) continue;

            if (isSeq) {
                const typeAt = declAt + dm[0].length - 'Value = '.length;
                edits.push({ start: typeAt, end: typeAt + 'Value'.length, text: 'Vec<Value>' });
                // The initializer still yields a `Value`; unwrap the array this
                // rule just proved it holds (same value, no copy for a literal).
                const initExpr = content.slice(initStart, stmtEnd - 1).replace(/\s+$/, '');
                const inner = arrayPayload(initExpr);
                edits.push({
                    start: initStart,
                    end: initStart + initExpr.length,
                    text: inner !== undefined ? inner : initExpr + '.as_array().unwrap().clone()',
                });
                if (stats) {
                    stats.seqLocals++;
                    stats.seqReads += reads.length;
                }
            } else if (stats) {
                stats.dictLocals++;
                stats.dictReads += reads.length;
            }
            for (const r of reads) edits.push(r);
        }
    }

    if (edits.length === 0) return content;
    edits.sort((a, b) => a.start - b.start);
    let out = '';
    let at = 0;
    for (const e of edits) {
        if (e.start < at) continue;
        out += content.slice(at, e.start) + e.text;
        at = e.end;
    }
    return out + content.slice(at);
}

/**
 * The literal key set of a fresh dict literal, or undefined when any insert key
 * is computed (then neither the set nor marker-freeness is static).
 */
/**
 * The `Vec<Value>` expression inside an array-valued `Value` constructor, or
 * undefined when the initializer is a call whose result must be unwrapped.
 */
function arrayPayload(initExpr: string): string | undefined {
    const strip = (text: string, prefix: string): string | undefined => {
        if (!text.startsWith(prefix) || !text.endsWith(')')) return undefined;
        return text.slice(prefix.length, -1).trim();
    };
    // `Value::Array(x)` takes the Vec, so the payload is exactly `x`.
    const direct = strip(initExpr, 'Value::Array(');
    if (direct !== undefined && direct.length > 0) return direct;
    let inner = strip(initExpr, 'Value::from(');
    if (inner !== undefined) inner = strip(inner, 'std::sync::Arc::new(') ?? inner;
    if (inner === undefined || !inner.startsWith('vec![')) return undefined;
    return inner;
}

function insertedKeys(initText: string): string[] | undefined {
    const keys: string[] = [];
    const insertRe = /\.insert\(\s*(?:"([^"\\]*)"\s*(?:\.to_string\(\)|\.into\(\))|([^,]+?))\s*,/g;
    let im: RegExpExecArray | null;
    while ((im = insertRe.exec(initText)) !== null) {
        if (im[1] === undefined) return undefined;
        keys.push(im[1]);
    }
    return keys;
}

// ── self-test ────────────────────────────────────────────────────────────────
// Each case is a shape the rule must transform (or must leave alone). Run with
// `npx tsx build/hx10w2-R01.ts --self-test`.

type Case = { name: string, src: string, want: string[], gone: string[] };

const CASES: Case[] = [
    {
        name: 'seq: Value::from(vec![..]) local retyped, literal int key',
        src: [
            'pub fn demo(&mut self) -> Value {',
            '    let mut rows: Value = Value::from(vec![Value::Int(1), Value::Int(2)]);',
            '    let mut first: Value = get_value(&rows, &Value::Int(1));',
            '    return first;',
            '}',
        ].join('\n'),
        want: ['let mut rows: Vec<Value> =', 'rows.get(1).cloned().unwrap_or(Value::Null)'],
        gone: ['get_value('],
    },
    {
        name: 'seq: safe_list_k local, numeric-string key',
        src: [
            'pub fn demo(&mut self) -> Value {',
            '    let mut data: Value = self.safe_list_k(response.clone(), "data", &[Value::from(vec![])]);',
            '    let mut head: Value = get_value(&data, &Value::Str("0".into()));',
            '    return head;',
            '}',
        ].join('\n'),
        want: ['let mut data: Vec<Value> =', 'data.get(0).cloned().unwrap_or(Value::Null)'],
        gone: ['get_value('],
    },
    {
        name: 'seq: split local read by a Value::Int-pinned counter',
        src: [
            'pub fn demo(&mut self) -> Value {',
            '    let mut parts: Value = split(&raw, &Value::Str("_".into()));',
            '    let mut i: Value = Value::Int(0);',
            '    while i.as_f64().unwrap_or(f64::NAN) < 2.0 {',
            '        let mut part: Value = get_value(&parts, &i);',
            '        if let Value::Int(n) = &mut i { *n += 1; }',
            '    }',
            '    return Value::Null;',
            '}',
        ].join('\n'),
        want: ['let mut parts: Vec<Value> =', 'parts.get(i.as_i64().unwrap() as usize).cloned().unwrap_or(Value::Null)'],
        gone: ['get_value('],
    },
    {
        name: 'seq: unpinned dynamic key stays a helper call',
        src: [
            'pub fn demo(&mut self, mut key: Value) -> Value {',
            '    let mut parts: Value = split(&raw, &Value::Str("_".into()));',
            '    return get_value(&parts, &key);',
            '}',
        ].join('\n'),
        want: ['let mut parts: Value =', 'get_value(&parts, &key)'],
        gone: ['Vec<Value>'],
    },
    {
        name: 'seq: a Value sink keeps the box',
        src: [
            'pub fn demo(&mut self) -> Value {',
            '    let mut data: Value = self.safe_list_k(response.clone(), "data", &[Value::from(vec![])]);',
            '    let mut first: Value = get_value(&data, &Value::Int(0));',
            '    return self.parse_trades(data, &[]);',
            '}',
        ].join('\n'),
        want: ['let mut data: Value =', 'get_value(&data, &Value::Int(0))'],
        gone: [],
    },
    {
        name: 'dict: fresh literal with a literal key',
        src: [
            'pub fn demo(&mut self) -> Value {',
            '    let mut request: Value = Value::Map({',
            '        let mut m = indexmap::IndexMap::new();',
            '        m.insert("amount".to_string(), amount);',
            '        m',
            '    });',
            '    let mut amount2: Value = get_value(&request, &Value::Str("amount".into()));',
            '    return amount2;',
            '}',
        ].join('\n'),
        want: ['let mut request: Value =', 'request.as_map().unwrap().get("amount").cloned().unwrap_or(Value::Null)'],
        gone: ['get_value('],
    },
    {
        name: 'dict: a routed key stays a helper call',
        src: [
            'pub fn demo(&mut self) -> Value {',
            '    let mut book: Value = Value::Map({',
            '        let mut m = indexmap::IndexMap::new();',
            '        m.insert("bids".to_string(), bids);',
            '        m',
            '    });',
            '    return get_value(&book, &Value::Str("cache".into()));',
            '}',
        ].join('\n'),
        want: ['get_value(&book, &Value::Str("cache".into()))'],
        gone: [],
    },
    {
        name: 'dict: a computed insert key makes the key set dynamic',
        src: [
            'pub fn demo(&mut self, mut key: Value) -> Value {',
            '    let mut request: Value = Value::Map({',
            '        let mut m = indexmap::IndexMap::new();',
            '        m.insert(crate::runtime::stringify_param(&key), amount);',
            '        m',
            '    });',
            '    return get_value(&request, &Value::Str("amount".into()));',
            '}',
        ].join('\n'),
        want: ['get_value(&request, &Value::Str("amount".into()))'],
        gone: [],
    },
    {
        name: 'seq: a reassigned local keeps the box',
        src: [
            'pub fn demo(&mut self) -> Value {',
            '    let mut rows: Value = Value::from(vec![Value::Int(1)]);',
            '    rows = self.parse_rows();',
            '    return get_value(&rows, &Value::Int(0));',
            '}',
        ].join('\n'),
        want: ['let mut rows: Value =', 'get_value(&rows, &Value::Int(0))'],
        gone: [],
    },
    {
        name: 'seq: an already typed receiver goes native as is',
        src: [
            'pub fn demo(&mut self, mut rows: &[Value]) -> Value {',
            '    return get_value(&rows, &Value::Int(2));',
            '}',
        ].join('\n'),
        want: ['rows.get(2).cloned().unwrap_or(Value::Null)'],
        gone: ['get_value('],
    },
];

function selfTest(): number {
    let failures = 0;
    for (const c of CASES) {
        const out = nativeGetValue(c.src);
        const misses: string[] = [];
        for (const w of c.want) if (!out.includes(w)) misses.push('missing: ' + w);
        for (const g of c.gone) if (out.includes(g)) misses.push('not replaced: ' + g);
        if (misses.length === 0) {
            console.log('ok   ' + c.name);
        } else {
            failures++;
            console.log('FAIL ' + c.name);
            for (const m of misses) console.log('       ' + m);
            console.log('       ---- output ----\n' + out.split('\n').map((l) => '       ' + l).join('\n'));
        }
    }
    console.log(failures === 0 ? 'self-test: all cases pass' : 'self-test: ' + failures + ' failing');
    return failures;
}

if (process.argv.indexOf('--self-test') >= 0) {
    process.exit(selfTest() === 0 ? 0 : 1);
}
