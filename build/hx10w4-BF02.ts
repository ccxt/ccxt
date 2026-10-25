// hx10 wave 4 BF02: base map fields (markets / positions / fees / limits) print native map ops.
// A read is the helper's Map branch (containsKey ? get : null is a plain get; null receiver or key
// answers null, so both stay guarded); a write is put only on a field the FILE only ever builds as
// a plain HashMap, because the helper removes on a null value for a ConcurrentHashMap.
// markets is null-reset by reset()/unsubscribe from another thread, so every read keeps the guard;
// positions stays declared Object (venues store an ArrayCache in it), so its kind is proven here.

const BF02_HEADER_MAP = new Set ([ 'markets', 'fees', 'limits' ]);
const BF02_PLAIN_NEW = /^new (?:java\.util\.)?(?:Linked)?HashMap\b/;
const BF02_PLAIN_CALL = /^this\.createSafeDictionary\(/;
const BF02_CONCURRENT = /^new (?:java\.util\.)?(?:concurrent\.)?ConcurrentHashMap\b/;
const BF02_MAP_CAST = /^\(\s*(?:java\.util\.)?Map<String, Object>\s*\)/;
const BF02_DECL = /(?:java\.util\.)?(?:HashMap<String, Object>|Map<String, Object>)\s+([A-Za-z_]\w*)\s*=\s*([^;]*)/g;

// end index (inclusive) of the bracket that opens at `open`, literals skipped; -1 when unbalanced
function bf02Close (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === "'") {
            let closed = false;
            for (let j = i + 1; j < text.length; j++) {
                if (text[j] === '\\') { j++; continue; }
                if (text[j] === c) { i = j; closed = true; break; }
            }
            if (!closed) return -1;
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') { if (--depth === 0) return i; }
    }
    return -1;
}

function bf02SplitArgs (text: string): string[] | undefined {
    const out: string[] = [];
    let depth = 0, at = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === "'") {
            let closed = false;
            for (let j = i + 1; j < text.length; j++) {
                if (text[j] === '\\') { j++; continue; }
                if (text[j] === c) { i = j; closed = true; break; }
            }
            if (!closed) return undefined;
            continue;
        }
        if (c === '<' && /[\w]/.test (text[i - 1] ?? '')) {
            const g = /^<[\w.?,\s<>]*>/.exec (text.slice (i));
            if (g !== null) { i += g[0].length - 1; continue; }
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { out.push (text.slice (at, i).trim ()); at = i + 1; }
    }
    if (depth !== 0) return undefined;
    out.push (text.slice (at).trim ());
    return out;
}

// what every `this.<field> =` in this file builds: plain / map / concurrent / null / other
function bf02RhsKind (rhs: string, content: string, depth: number): string {
    const t = rhs.trim ();
    if (/^null$/.test (t)) return 'null';
    if (BF02_CONCURRENT.test (t)) return 'concurrent';
    if (BF02_PLAIN_NEW.test (t) || BF02_PLAIN_CALL.test (t)) return 'plain';
    if (BF02_MAP_CAST.test (t)) return 'map';
    if (depth < 2 && /^[A-Za-z_]\w*$/.test (t)) {
        const re = new RegExp (BF02_DECL.source, 'g');
        for (const m of content.matchAll (re)) {
            if (m[1] === t) return bf02RhsKind (m[2], content, depth + 1);
        }
    }
    return 'other';
}

function bf02FieldKinds (content: string, field: string): string[] {
    const out: string[] = [];
    const rx = new RegExp ('this\\.' + field + '\\s*=(?!=)\\s*([^;]*)', 'g');
    for (const m of content.matchAll (rx)) out.push (bf02RhsKind (m[1], content, 0));
    return out;
}

// a read is the helper's own Map branch, so any Map-like box is enough; a field with no write in
// this file is only proven by its header declaration
function bf02ReadsAreNative (kinds: string[], field: string): boolean {
    if (kinds.some ((k) => k === 'other')) return false;
    if (kinds.length === 0) return BF02_HEADER_MAP.has (field);
    return true;
}

// addElementToObject puts a null value into a HashMap but REMOVES it from a ConcurrentHashMap
function bf02WritesAreNative (kinds: string[]): boolean {
    return kinds.some ((k) => k === 'plain') && kinds.every ((k) => k === 'plain' || k === 'null');
}

// Helpers.GetValue(this.<field>, k) -> guarded native get (receiver and key are side-effect free)
function bf02Reads (content: string, field: string): string {
    const open = `Helpers.GetValue(this.${field},`;
    let out = '', i = 0, changed = false;
    for (;;) {
        const at = content.indexOf (open, i);
        if (at === -1) { out += content.slice (i); break; }
        const p = at + 'Helpers.GetValue'.length;
        const cl = bf02Close (content, p);
        if (cl === -1) { out += content.slice (i); break; }
        const args = bf02SplitArgs (content.slice (p + 1, cl));
        const key = (args !== undefined && args.length === 2) ? args[1].trim () : '';
        const recv = `this.${field}`;
        let native: string | undefined;
        if (/^"(?:[^"\\]|\\.)*"$/.test (key)) {
            native = `(${recv} == null ? null : ((java.util.Map<?, ?>)${recv}).get(${key}))`;
        } else if (/^[A-Za-z_]\w*$/.test (key)) {
            native = `(${key} == null || ${recv} == null ? null : ((java.util.Map<?, ?>)${recv}).get(${key}))`;
        }
        if (native === undefined) { out += content.slice (i, p + 1); i = p + 1; continue; }
        out += content.slice (i, at) + native;
        i = cl + 1;
        changed = true;
    }
    return changed ? out : content;
}

// Helpers.addElementToObject(this.<field>, k, v); (statement) -> this.<field>.put(k, v);
function bf02Writes (content: string, field: string): string {
    const open = `Helpers.addElementToObject(this.${field},`;
    let out = '', i = 0, changed = false;
    for (;;) {
        const at = content.indexOf (open, i);
        if (at === -1) { out += content.slice (i); break; }
        const lineStart = content.lastIndexOf ('\n', at) + 1;
        const indent = content.slice (lineStart, at);
        const p = at + 'Helpers.addElementToObject'.length;
        const cl = bf02Close (content, p);
        if (cl === -1 || !/^[ \t]*$/.test (indent)) { out += content.slice (i, p + 1); i = p + 1; continue; }
        const args = bf02SplitArgs (content.slice (p + 1, cl));
        if (args === undefined || args.length !== 3) { out += content.slice (i, p + 1); i = p + 1; continue; }
        let end = cl + 1;
        while (content[end] === ' ' || content[end] === '\t') end++;
        if (content[end] !== ';') { out += content.slice (i, p + 1); i = p + 1; continue; }
        const [ keyRaw, value ] = [ args[1].trim (), args[2] ];
        const recv = `this.${field}`;
        // the receiver may be declared Map<String, Object> or bare Object (a ws client's own cache
        // field), so the put goes through the same wildcard the port already emits for Object keys
        const call = `((java.util.Map<Object, Object>) (java.util.Map<?, ?>) ${recv}).put(${keyRaw}, ${value});`;
        out += content.slice (i, at) + call;
        i = end + 1;
        changed = true;
    }
    return changed ? out : content;
}

export function nativeJavaBF02FieldOps (content: string): string {
    if (!content.includes ('Helpers.GetValue(this.') && !content.includes ('Helpers.addElementToObject(this.')) return content;
    let out = content;
    for (const field of [ 'markets', 'positions', 'fees', 'limits' ]) {
        const kinds = bf02FieldKinds (out, field);
        if (bf02ReadsAreNative (kinds, field)) out = bf02Reads (out, field);
        if (bf02WritesAreNative (kinds)) out = bf02Writes (out, field);
    }
    return out;
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function bf02SelfTest (): string[] {
    const POS_HASH_MAP = '    public void init()\n    {\n        this.positions = new HashMap<String, Object>() {{}};\n    }\n';
    const MARKETS_HASH_MAP = '    public void init()\n    {\n        this.markets = this.createSafeDictionary();\n    }\n';
    const problems: string[] = [];
    const cls = (body: string, extra = '') => `public class Woo extends WooRest\n{\n${extra}    public void m(Object v, String type, Object key)\n    {\n${body}\n    }\n}\n`;
    const run = (body: string, extra = '') => nativeJavaBF02FieldOps (cls (body, extra));
    const pos: [string, string, string, string][] = [
        [ 'markets read, literal key',
          '        return Helpers.GetValue(this.markets, "BTC/USDT");',
          '        return (this.markets == null ? null : ((java.util.Map<?, ?>)this.markets).get("BTC/USDT"));', '' ],
        [ 'markets read, identifier key',
          '        return Helpers.GetValue(this.markets, type);',
          '        return (type == null || this.markets == null ? null : ((java.util.Map<?, ?>)this.markets).get(type));', '' ],
        [ 'positions read on a HashMap file',
          '        Object cache = Helpers.GetValue(this.positions, type);',
          '        Object cache = (type == null || this.positions == null ? null : ((java.util.Map<?, ?>)this.positions).get(type));',
          POS_HASH_MAP ],
        [ 'markets write, String key',
          '        Helpers.addElementToObject(this.markets, "BTC/USDT", v);',
          '((java.util.Map<Object, Object>) (java.util.Map<?, ?>) this.markets).put("BTC/USDT", v);', MARKETS_HASH_MAP ],
        [ 'markets write, Object key goes through the wildcard',
          '        Helpers.addElementToObject(this.markets, Helpers.GetValue(v, "market"), v);',
          '((java.util.Map<Object, Object>) (java.util.Map<?, ?>) this.markets).put(Helpers.GetValue(v, "market"), v);',
          MARKETS_HASH_MAP ],
        [ 'positions write on a HashMap file',
          '        Helpers.addElementToObject(this.positions, type, v);',
          '((java.util.Map<Object, Object>) (java.util.Map<?, ?>) this.positions).put(type, v);', POS_HASH_MAP ],
        [ 'fees read',
          '        return Helpers.GetValue(this.fees, "trading");',
          '        return (this.fees == null ? null : ((java.util.Map<?, ?>)this.fees).get("trading"));', '' ],
    ];
    for (const [ name, body, expect, extra ] of pos) {
        const out = run (body, extra);
        if (!out.includes (expect)) problems.push (`hx10 BF02: ${name} expected ${expect} in\n${out}`);
        if (nativeJavaBF02FieldOps (out) !== out) problems.push (`hx10 BF02: ${name} not idempotent\n${out}`);
    }
    const neg: [string, string, string][] = [
        [ 'positions holding an ArrayCache', '        Object cache = Helpers.GetValue(this.positions, type);',
          '    public void init()\n    {\n        this.positions = new ArrayCache.ArrayCacheBySymbolBySide();\n    }\n' ],
        [ 'positions write while an ArrayCache is one of its writes', '        Helpers.addElementToObject(this.positions, type, v);',
          '    public void init()\n    {\n        this.positions = new HashMap<String, Object>() {{}};\n    }\n\n    public void other()\n    {\n        this.positions = new ArrayCache.ArrayCacheBySymbolBySide();\n    }\n' ],
        [ 'ConcurrentHashMap field write (null value removes there)', '        Helpers.addElementToObject(this.markets, "a", v);',
          '    public void init()\n    {\n        this.markets = new java.util.concurrent.ConcurrentHashMap<>();\n    }\n' ],
        [ 'positions with no write in the file', '        return Helpers.GetValue(this.positions, type);', '' ],
    ];
    for (const [ name, body, extra2 ] of neg) {
        const input = cls (body, extra2);
        if (nativeJavaBF02FieldOps (input) !== input) problems.push (`hx10 BF02: ${name} must keep the helper\n${nativeJavaBF02FieldOps (input)}`);
    }
    const computed = cls ('        return Helpers.GetValue(this.markets, this.symbol(v));');
    if (nativeJavaBF02FieldOps (computed) !== computed) problems.push ('hx10 BF02: a repeatable-key proof is required');
    return problems;
}
