// hx10w3-R03 (rust) — a local bound to a generated method's return carries the
// callee's proven container shape, so the helper calls that read or write that
// local print the native op. A callee whose every return path builds one fresh
// container (literal keys only, no marker key) proves the shape: `dict` or
// `arr`. The signature stays `-> Value`, so every sink keeps the box untouched
// and no re-box is needed; an unproven callee leaves each site as printed.

import fs from 'fs';

type R03Shape = 'dict' | 'arr';

// Keys `get_value` routes through a book/cache store, and the keys that tag a
// container as a live book/cache handle. A proven-fresh container holds none.
const R03_ROUTED = new Set(['cache', 'hashmap', 'subscriptions', 'futures', 'timestamp', 'datetime', 'nonce', 'symbol', 'checksum']);
const R03_MARKER = ['__book_id', '__cache_id', '__cacheKind', '__sideKind', '__live_id'];

const R03_BASE_FILE = 'rust/ccxt-common/src/exchange_generated.rs';
let r03BaseShapes: Map<string, R03Shape> | undefined = undefined;

/** Blank string literals and line comments, same length as the input. */
function r03Mask(src: string): string {
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
                if (src[i] === '\n') { out += '\n'; i++; continue; }
                if (src[i] === '\\') { out += '  '; i += 2; continue; }
                out += ' ';
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

/** Index of the delimiter closing the one at `open`, or -1. */
function r03Close(src: string, open: number): number {
    const openCh = src[open];
    const closeCh = openCh === '(' ? ')' : openCh === '[' ? ']' : openCh === '{' ? '}' : '';
    if (closeCh === '') return -1;
    let depth = 0;
    for (let k = open; k < src.length; k++) {
        const c = src[k];
        if (c === openCh) depth++;
        else if (c === closeCh) {
            depth--;
            if (depth === 0) return k;
        }
    }
    return -1;
}

/** Top-level argument spans of the call whose `(` is at `open`. */
function r03Args(masked: string, open: number, close: number): [number, number][] | undefined {
    const spans: [number, number][] = [];
    let depth = 0;
    let start = open + 1;
    for (let k = open + 1; k < close; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) {
            spans.push([start, k]);
            start = k + 1;
        }
    }
    if (masked.slice(start, close).trim() !== '') spans.push([start, close]);
    return spans;
}

/** End index (the `;`) of the statement starting at `from`, or -1. */
function r03StmtEnd(masked: string, from: number): number {
    let depth = 0;
    for (let k = from; k < masked.length; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth < 0) return -1;
        } else if (c === ';' && depth === 0) return k;
    }
    return -1;
}

/** Depth-0 `return` expressions of a body. */
function r03Returns(masked: string): string[] {
    const out: string[] = [];
    const rx = /(?<![A-Za-z0-9_])return\b/g;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(masked)) !== null) {
        const end = r03StmtEnd(masked, m.index + 6);
        if (end < 0) continue;
        out.push(masked.slice(m.index + 6, end).trim());
    }
    return out;
}

/** The bare tail expression of a body (no trailing `;`), or undefined. */
function r03Tail(body: string): string | undefined {
    const t = body.replace(/\s+$/, '');
    if (t === '' || t.endsWith(';')) return undefined;
    const cut = t.lastIndexOf(';');
    const tail = (cut < 0 ? t : t.slice(cut + 1)).trim();
    if (tail === '' || /^(?:if|match|while|for|loop|\{)/.test(tail)) return undefined;
    return tail;
}

/** True when the bare tail is unreachable: the statement before it returns. */
function r03TailIsDead(body: string): boolean {
    const cut = body.replace(/\s+$/, '').lastIndexOf(';');
    if (cut < 0) return false;
    let depth = 0;
    let k = cut - 1;
    for (; k >= 0; k--) {
        const c = body[k];
        if (c === ')' || c === ']' || c === '}') depth++;
        else if (c === '(' || c === '[' || c === '{') { depth--; if (depth < 0) break; }
        else if (c === ';' && depth === 0) break;
    }
    return /^\s*return\b/.test(body.slice(k + 1, cut));
}

/** Shape of the container a return expression builds from scratch, if it does. */
function r03FreshShape(t: string): R03Shape | undefined {
    const s = t.replace(/^\(+/, '').trim();
    if (/^Value::(?:Map|Dict)\(/.test(s)) {
        const open = s.indexOf('(');
        // A literal payload: `Value::Map({ .. })` / `Value::Map(indexmap::IndexMap::new())`.
        if (/^Value::(?:Map|Dict)\(\s*(?:\{|indexmap::IndexMap::new\(\)|HashMap::new\(\))/.test(s)) return 'dict';
        void open;
        return undefined;
    }
    if (/^Value::(?:Array|List)\(\s*(?:vec!\[|std::sync::Arc::new\(\s*vec!\[)/.test(s)) return 'arr';
    if (/^Value::from\(\s*(?:std::sync::Arc::new\(\s*)?vec!\[/.test(s)) return 'arr';
    return undefined;
}

/** The single declaration of a local in a region, with its initializer text. */
function r03Decl(region: string, name: string): { init: string } | undefined {
    const rx = new RegExp('\\blet (?:mut )?' + name + '\\s*(?::\\s*[^=;]+)?=\\s*', 'g');
    let hit: RegExpExecArray | null = null;
    let count = 0;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(region)) !== null) { hit = m; count++; }
    if (count !== 1 || hit === null) return undefined;
    return { init: region.slice(hit.index + hit[0].length, hit.index + hit[0].length + 400) };
}

/** Arity-independent shape table for `pub fn NAME(...) -> Value` methods. */
function r03MethodShapes(content: string, masked: string, loose: boolean = false): Map<string, R03Shape> {
    const shapes = new Map<string, R03Shape>();
    const hdr = loose ? /\n    (?:pub )?fn (\w+)\s*\(/g : /\n    pub fn (\w+)\s*\(/g;
    let hm: RegExpExecArray | null;
    while ((hm = hdr.exec(masked)) !== null) {
        const lineEnd = masked.indexOf('\n', hm.index + 1);
        const line = masked.slice(hm.index, lineEnd < 0 ? masked.length : lineEnd);
        if (!/->\s*(?:crate::)?Value\b/.test(line)) continue;
        const open = masked.indexOf('(', hm.index);
        const close = r03Close(masked, open);
        if (close < 0) continue;
        const braceOpen = masked.indexOf('{', close);
        if (braceOpen < 0) continue;
        if (!/^(?:->\s*(?:crate::)?Value)?$/.test(masked.slice(close + 1, braceOpen).trim())) continue;
        const braceClose = r03Close(masked, braceOpen);
        if (braceClose < 0) continue;
        const body = masked.slice(braceOpen + 1, braceClose);
        const exprs = r03Returns(body);
        if (exprs.length === 0) continue;
        // A body that ends in a bare tail expression can also fall through to it.
        const tail = r03Tail(body);
        if (tail !== undefined && !r03TailIsDead(body)) {
            exprs.push(tail);
        }
        const kinds = new Set<R03Shape | 'other'>();
        for (const e of exprs) {
            // A base default starts with a virtual-dispatch arm that returns the
            // override's own value; no override in this file means it never fires.
            if (loose && /^__\w+$/.test(e)) continue;
            kinds.add(r03FreshShape(e) ?? 'other');
        }
        if (kinds.size !== 1) continue;
        const only = [...kinds][0];
        if (only === 'other') continue;
        shapes.set(hm[1], only);
    }
    return shapes;
}

/** Base-tier shape table, read from the generated base (cached). */
function r03BaseShapeTable(): Map<string, R03Shape> {
    if (r03BaseShapes !== undefined) return r03BaseShapes;
    r03BaseShapes = new Map<string, R03Shape>();
    try {
        const src = fs.readFileSync(R03_BASE_FILE, 'utf8');
        r03BaseShapes = r03MethodShapes(src, r03Mask(src), true);
    } catch (e: any) {
        if (e === undefined || e.code !== 'ENOENT') throw e;
    }
    return r03BaseShapes;
}

const R03_PASSTHROUGH = new Set(['extend', 'omit', 'keysort', 'clone_value']);

class R03Prover {
    private region: string;
    private masked: string;
    private own: Map<string, R03Shape>;
    private base: Map<string, R03Shape>;
    private visiting = new Set<string>();

    constructor(region: string, maskedRegion: string, own: Map<string, R03Shape>, base: Map<string, R03Shape>) {
        this.region = region;
        this.masked = maskedRegion;
        this.own = own;
        this.base = base;
    }

    /** Shape of the local `name` in this region, or undefined when unproven. */
    shape(name: string): R03Shape | undefined {
        if (this.visiting.has(name)) return undefined;
        this.visiting.add(name);
        const out = this.prove(name);
        this.visiting.delete(name);
        return out;
    }

    private prove(name: string): R03Shape | undefined {
        const decl = r03Decl(this.masked, name);
        if (decl === undefined) return undefined;
        return this.shapeOfInit(decl.init);
    }

    private shapeOfInit(init: string): R03Shape | undefined {
        const fresh = r03FreshShape(init);
        if (fresh !== undefined) return fresh;
        const call = /^self\.(\w+)\s*\(/.exec(init);
        if (call === null) return undefined;
        const callee = call[1];
        const own = this.own.get(callee);
        if (own !== undefined) return own;
        const base = this.base.get(callee);
        if (base !== undefined) return base;
        if (R03_PASSTHROUGH.has(callee)) {
            // A copy of its first argument keeps that argument's container shape.
            const open = init.indexOf('(');
            const close = r03Close(init, open);
            if (close < 0) return undefined;
            const args = r03Args(init, open, close);
            if (args === undefined || args.length === 0) return undefined;
            const first = init.slice(args[0][0], args[0][1]).trim();
            if (!/^[a-z_][A-Za-z0-9_]*$/.test(first)) return undefined;
            return this.shape(first);
        }
        return undefined;
    }
}

/** Literal string key of an argument (`&Value::Str("k".into())`), else undefined. */
function r03LiteralKey(arg: string | undefined): string | undefined {
    if (arg === undefined) return undefined;
    const m = /^&\s*Value::Str\(\s*("(?:[^"\\]|\\.)*")\s*(?:\.into\(\)|\.to_string\(\))?\s*\)$/.exec(arg.trim());
    return m === null ? undefined : m[1].slice(1, -1);
}

/** True when a `&mut name` receiver is only used by the writes this pass keeps. */
function r03PlainReceiver(region: string, name: string): boolean {
    const rx = new RegExp('&mut ' + name + '(?![A-Za-z0-9_])', 'g');
    let m: RegExpExecArray | null;
    while ((m = rx.exec(region)) !== null) {
        const before = region.slice(Math.max(0, m.index - 40), m.index);
        if (/(?:add_element_to_object|get_value_mut|set_value)\($/.test(before)) continue;
        if (/if let Value::(?:Dict|Arr|Map)\(\s*__\w+\s*\)\s*=\s*$/.test(before)) continue;
        return false;
    }
    return true;
}

/** True when the local is never reassigned to another expression. */
function r03SingleWrite(region: string, name: string): boolean {
    const rx = new RegExp('(?<![A-Za-z0-9_.])' + name + '\\s*=\\s*(?!=)', 'g');
    let m: RegExpExecArray | null;
    while ((m = rx.exec(region)) !== null) {
        const before = region.slice(Math.max(0, m.index - 5), m.index);
        if (/\blet $/.test(before) || /\blet mut $/.test(region.slice(Math.max(0, m.index - 8), m.index))) continue;
        return false;
    }
    return true;
}

export interface Hx10R03Stats { sites: number }

/** Rewrite helper calls on a proven callee-shaped local to the native op. */
export function hx10w3R03(content: string, stats?: Hx10R03Stats): string {
    if (content.indexOf('add_element_to_object(') < 0 && content.indexOf('get_value(&') < 0
        && content.indexOf('in_op(') < 0 && content.indexOf('object_keys(') < 0
        && content.indexOf('object_values(') < 0 && content.indexOf('get_array_length(') < 0) return content;
    const masked = r03Mask(content);
    const own = r03MethodShapes(content, masked);
    const base = r03BaseShapeTable();
    const heads: number[] = [];
    const hdr = /^[ \t]*(?:pub(?:\([a-z]+\))? )?(?:async )?fn /gm;
    let hm: RegExpExecArray | null;
    while ((hm = hdr.exec(masked)) !== null) heads.push(hm.index);
    heads.push(content.length);

    type Edit = { start: number, end: number, text: string };
    const edits: Edit[] = [];
    const FAM = /(?<![A-Za-z0-9_:.])(add_element_to_object|get_value|in_op|object_keys|object_values|get_array_length)\(/g;

    for (let h = 0; h + 1 < heads.length; h++) {
        const from = heads[h];
        const to = heads[h + 1];
        const maskedRegion = masked.slice(from, to);
        const prover = new R03Prover(content.slice(from, to), maskedRegion, own, base);
        FAM.lastIndex = 0;
        let fm: RegExpExecArray | null;
        while ((fm = FAM.exec(maskedRegion)) !== null) {
            const name = fm[1];
            const open = fm.index + fm[0].length - 1;
            const close = r03Close(maskedRegion, open);
            if (close < 0) continue;
            const spans = r03Args(maskedRegion, open, close);
            if (spans === undefined) continue;
            let recv: string | undefined;
            let keyArg: string | undefined;
            let valueStart = -1;
            if (name === 'add_element_to_object') {
                if (spans.length !== 3) continue;
                const first = maskedRegion.slice(spans[0][0], spans[0][1]).trim();
                const head = /^&mut\s+([a-z_][A-Za-z0-9_]*)$/.exec(first);
                if (head === null) continue;
                recv = head[1];
                keyArg = content.slice(from + spans[1][0], from + spans[1][1]);
                valueStart = spans[2][0];
            } else if (name === 'get_array_length' || name === 'object_keys' || name === 'object_values') {
                if (spans.length !== 1) continue;
                const head = /^&\s*([a-z_][A-Za-z0-9_]*)$/.exec(maskedRegion.slice(spans[0][0], spans[0][1]).trim());
                if (head === null) continue;
                recv = head[1];
            } else {
                if (spans.length !== 2) continue;
                const head = /^&\s*([a-z_][A-Za-z0-9_]*)$/.exec(maskedRegion.slice(spans[0][0], spans[0][1]).trim());
                if (head === null) continue;
                recv = head[1];
                keyArg = content.slice(from + spans[1][0], from + spans[1][1]);
            }
            const shape = prover.shape(recv);
            if (shape === undefined) continue;
            if (name === 'get_array_length') {
                if (shape !== 'arr') continue;
                if (!r03SingleWrite(maskedRegion, recv)) continue;
                edits.push({ start: from + fm.index, end: from + close + 1, text: `Value::Int(${recv}.len() as i64)` });
                continue;
            }
            if (shape !== 'dict') continue;
            if (!r03PlainReceiver(maskedRegion, recv) || !r03SingleWrite(maskedRegion, recv)) continue;
            if (name === 'add_element_to_object') {
                const key = r03LiteralKey(keyArg);
                if (key === undefined || R03_MARKER.indexOf(key) >= 0) continue;
                const valueEnd = spans[2][1];
                const value = content.slice(from + valueStart, from + valueEnd).trim();
                // Absorb the statement's `;` so the block never trails it.
                const stmtEnd = maskedRegion[close + 1] === ';' ? close + 2 : close + 1;
                edits.push({
                    start: from + fm.index,
                    end: from + stmtEnd,
                    text: `if let Value::Dict(__r03d) = &mut ${recv} { std::sync::Arc::make_mut(__r03d).insert("${key}".into(), ${value}); }`,
                });
                continue;
            }
            const key = r03LiteralKey(keyArg);
            if (key === undefined || R03_ROUTED.has(key) || R03_MARKER.indexOf(key) >= 0) continue;
            if (name === 'get_value') {
                edits.push({
                    start: from + fm.index,
                    end: from + close + 1,
                    text: `${recv}.as_map().unwrap().get("${key}").cloned().unwrap_or(Value::Null)`,
                });
            } else if (name === 'in_op') {
                if (!r03BoolPosition(maskedRegion, fm.index)) continue;
                edits.push({
                    start: from + fm.index,
                    end: from + close + 1,
                    text: `matches!(&${recv}, Value::Dict(__r03k) if __r03k.contains_key("${key}"))`,
                });
            } else {
                const body = name === 'object_keys'
                    ? '__m.keys().map(|__k| Value::Str(__k.clone().into())).collect()'
                    : '__m.values().cloned().collect()';
                edits.push({
                    start: from + fm.index,
                    end: from + close + 1,
                    text: `Value::Array(${recv}.as_map().map(|__m| ${body}).unwrap_or_default())`,
                });
            }
        }
    }
    if (edits.length === 0) return content;
    // Outermost first, so a nested rewrite never shifts an outer span.
    edits.sort((a, b) => a.start - b.start || b.end - a.end);
    let out = '';
    let at = 0;
    let count = 0;
    for (const e of edits) {
        if (e.start < at) continue;
        out += content.slice(at, e.start) + e.text;
        at = e.end;
        count++;
    }
    out += content.slice(at);
    if (stats !== undefined) stats.sites += count;
    return out;
}

/** True when the call at `pos` sits in a Rust bool position (if/while head). */
function r03BoolPosition(masked: string, pos: number): boolean {
    const lineStart = masked.lastIndexOf('\n', pos) + 1;
    const pre = masked.slice(lineStart, pos).trim();
    const headed = /^(?:\}\s*else\s+)?(?:if|while)$/.test(pre);
    const wrapped = /is_true\(&$/.test(pre);
    return headed || wrapped;
}

/** Self-test: the rule fires on a proven callee and leaves an unproven one alone. */
export function hx10R03SelfTest(): string[] {
    const problems: string[] = [];
    const dictFn = (body: string) => "\n    pub fn parse_thing(&self, mut x: Value) -> Value {\n" + body + "\n    Value::Null\n}\n";
    const wrapper = (call: string) => "\n    pub fn use_it(&self, mut data: Value) -> Value {\n        let mut parsed: Value = " + call + ";\n        add_element_to_object(&mut parsed, &Value::Str(\"nonce\".into()), self.safe_integer_k(data, \"u\", &[]));\n        let mut n: Value = get_value(&parsed, &Value::Str(\"bids\"));\n        return parsed;\n    }\n";
    const src = dictFn('        return Value::Map({\n    let mut m = indexmap::IndexMap::new();\n        m.insert("symbol".to_string(), x);\n    m\n});') + wrapper('self.parse_thing(data.clone())');
    const out = hx10w3R03(src);
    if (out.indexOf('add_element_to_object(') >= 0) problems.push('hx10w3 R03: proven dict insert not native\n' + out);
    if (out.indexOf('get_value(&') >= 0) problems.push('hx10w3 R03: proven dict read not native\n' + out);
    if (out.indexOf('std::sync::Arc::make_mut(__r03d).insert("nonce".into()') < 0) problems.push('hx10w3 R03: insert text differs\n' + out);
    if (out.indexOf('parsed.as_map().unwrap().get("bids")') < 0) problems.push('hx10w3 R03: read text differs\n' + out);
    // Re-boxed return: the local keeps the `Value` slot, so `return parsed;` stays.
    if (out.indexOf('return parsed;') < 0) problems.push('hx10w3 R03: return slot must stay boxed\n' + out);
    // Idempotent: nothing left to rewrite on a second run.
    if (hx10w3R03(out) !== out) problems.push('hx10w3 R03: not idempotent\n' + out);
    // A callee that can return Null keeps every site as printed.
    const loose = dictFn('        if (x.as_bool() == Some(true)) {\n            return Value::Map({\n    let mut m = indexmap::IndexMap::new();\n    m\n});\n        }\n        return Value::Null;') + wrapper('self.parse_thing(data.clone())');
    const kept = hx10w3R03(loose);
    if (kept.indexOf('add_element_to_object(&mut parsed') < 0) problems.push('hx10w3 R03: unproven callee was rewritten\n' + kept);
    // A routed key keeps the helper (the runtime store lookup is not `.get`).
    const routed = dictFn('        return Value::Map({\n    let mut m = indexmap::IndexMap::new();\n        m.insert("symbol".to_string(), x);\n    m\n});')
        + `    pub fn use_it(&self, mut data: Value) -> Value {\n        let mut parsed: Value = self.parse_thing(data.clone());\n        let mut n: Value = get_value(&parsed, &Value::Str("timestamp"));\n        return parsed;\n    }\n`;
    const keptRead = hx10w3R03(routed);
    if (keptRead.indexOf('get_value(&parsed, &Value::Str("timestamp"))') < 0) problems.push('hx10w3 R03: routed key rewritten\n' + keptRead);
    return problems;
}

if (typeof process !== 'undefined' && process.argv[1] !== undefined && process.argv[1].endsWith('hx10w3-R03.ts') && process.argv.indexOf('--self-test') >= 0) {
    const problems = hx10R03SelfTest();
    if (problems.length > 0) {
        for (const p of problems) console.log(p);
        process.exit(1);
    }
    console.log('hx10w3 R03 self-test: PASSED');
}
