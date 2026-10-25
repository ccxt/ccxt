// hx10 W3 R07 — string helpers on an operand the emitted text proves a string.
//
//   to_string_val(&X)                  X scalar-or-str      -> Value::str(X.to_string())
//   replace_str / replace_all_str      X str                -> Value::str(X.as_str()... .replace(a, b))
//   split(&X, &Value::Str("d"))        X str                -> Value::Array(X...split("d").map(Value::str).collect())
//   starts_with / ends_with(&X, &Str)  X str                -> X.as_str()... .ends_with("s")
//   to_fixed(&X, &Value::Int(d))       X int/float/null     -> Value::str(format!("{:.*}", d, X.as_f64()...))
//   join(&X, &Value::Str("s"))         X Vec<String>        -> Value::str(X.join("s"))
//
// The proof is the local's declared type or, for a `Value` local, the variant set its every write pins
// (`Value::Str(..)`, `safe_string(.., &[Value::Str("")])`, `decimal_to_precision(..)`, `sum(..)`). Display
// equals `stringify_simple` on every scalar variant, and `str::replace`/`split` are the helper's Str arm, so a
// proven site matches the helper on every value its type allows. An unproven site keeps the helper call.

import { isMainEntry } from './transpile.js';

type VSet = Set<string>;
type Local = { set?: VSet, ty: string, elems?: string };

const SCALAR: VSet = new Set([ 'str', 'int', 'float', 'bool', 'null' ]);
const NATIVE_TY = new Set([ 'String', 'Vec<String>', 'i64', 'f64', 'bool', 'usize', 'u32', 'isize' ]);

/** Blank string literals and comments, same length as the input. */
function maskText(src: string): string {
    const out = src.split('');
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') out[i++] = ' ';
            continue;
        }
        if (c === '/' && src[i + 1] === '*') {
            while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
                if (src[i] !== '\n') out[i] = ' ';
                i++;
            }
            if (i < src.length) { out[i] = ' '; out[i + 1] = ' '; i += 2; }
            continue;
        }
        if (c === '"') {
            out[i++] = ' ';
            while (i < src.length && src[i] !== '"') {
                if (src[i] === '\\') out[i++] = ' ';
                if (i < src.length) { if (src[i] !== '\n') out[i] = ' '; i++; }
            }
            if (i < src.length) out[i++] = ' ';
            continue;
        }
        i++;
    }
    return out.join('');
}

/** Index just past the delimiter matching the one at `open`, or -1. */
function closeParen(masked: string, open: number): number {
    const openCh = masked[open];
    const closeCh = openCh === '(' ? ')' : openCh === '[' ? ']' : '}';
    let depth = 0;
    for (let k = open; k < masked.length; k++) {
        const c = masked[k];
        if (c === openCh) depth++;
        else if (c === closeCh) { depth--; if (depth === 0) return k + 1; }
    }
    return -1;
}

/** Split top-level commas in `[from, to)`; undefined when the text is unbalanced. */
function splitArgs(masked: string, from: number, to: number): string[] | undefined {
    const args: string[] = [];
    let depth = 0;
    let start = from;
    for (let k = from; k < to; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { args.push(masked.slice(start, k)); start = k + 1; }
    }
    args.push(masked.slice(start, to));
    return args;
}

/** Index of the `;` closing the statement at `from`, or -1. */
function stmtEnd(masked: string, from: number): number {
    let depth = 0;
    for (let k = from; k < masked.length; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') { depth--; if (depth < 0) return -1; }
        else if (c === ';' && depth === 0) return k;
    }
    return -1;
}

const FN_HEAD = /(?:^|\n)[ \t]*(?:pub(?:\([a-z]+\))? )?(?:async )?fn /g;

/** `[start, end)` of the fn body holding `pos`. */
function fnBounds(masked: string, pos: number): [number, number] {
    let start = 0;
    for (const m of masked.matchAll(FN_HEAD)) {
        const at = m.index as number;
        if (at <= pos) start = at + 1; else return [start, at + 1];
    }
    return [ start, masked.length ];
}

/** `&Value::Str("lit".into())` -> `"lit"`, else undefined. */
function strBox(arg: string): string | undefined {
    const m = /^&\s*Value::Str\(\s*("(?:[^"\\]|\\.)*")\s*(?:\.into\(\)|\.to_string\(\))?\s*\)$/.exec(arg.trim());
    return m === null ? undefined : m[1];
}

/** `&Value::Int(-?n)` -> the digits, else undefined. */
function intBox(arg: string): string | undefined {
    const m = /^&\s*Value::Int\(\s*(-?\d+)\s*\)$/.exec(arg.trim());
    return m === null ? undefined : m[1];
}

/** `'str'` when every element the expression can hold is a `Value::Str`, else undefined. */
function elemKind(expr: string, locals: Map<string, Local>, depth = 0): string | undefined {
    const e = expr.trim().replace(/;$/, '').trim();
    const vec = /^(?:Value::(?:Array|List|from)|vec!)\(?(vec!)?\[/.exec(e) ?? /^vec!\[/.exec(e);
    if (vec !== null) {
        const open = e.indexOf('[');
        const close = closeParen(e, open);
        if (close < 0 || !/^\)*$/.test(e.slice(close))) return undefined;
        const items = splitArgs(e, open + 1, close - 1);
        if (items === undefined) return undefined;
        for (const it of items) {
            if (it.trim() === '') continue;
            if (!/^\s*Value::Str\(/.test(it)) return undefined;
        }
        return 'str';
    }
    const arr = /^Value::(?:Array|List)\(/.exec(e);
    if (arr !== null) {
        const open = arr[0].length - 1;
        const close = closeParen(e, open);
        if (close !== e.length) return undefined;
        const inner = e.slice(open + 1, close - 1);
        // The printer's `split` idiom maps every part through `Value::Str` — as a `|__p|` closure or,
        // since the ast closure pass, as the `From` fn item on the split parts.
        if (/\.map\(\|__p\| Value::Str\(|\.split\([^()]*\)\.map\(Value::from\)/.test(inner)) return 'str';
        return undefined;
    }
    if (/^(?:crate::runtime::)?split\(/.test(e)) return 'str';
    const slice = /^(?:self\.)?array_slice\(\s*&?([A-Za-z_]\w*)/.exec(e);
    if (slice !== null && depth === 0) {
        const src = locals.get(slice[1]);
        return src === undefined ? undefined : src.elems;
    }
    return undefined;
}

/** Variant set a single write expression can leave in a `Value`, or undefined. */
function inferSet(expr: string, locals: Map<string, Local>): VSet | undefined {
    const e = expr.trim().replace(/;$/, '').trim();
    for (const [ head, variant ] of [ [ 'Value::Str(', 'str' ], [ 'Value::Int(', 'int' ], [ 'Value::Float(', 'float' ], [ 'Value::Bool(', 'bool' ] ]) {
        if (e.startsWith(head)) return new Set([ variant ]);
    }
    if (e === 'Value::Null') return new Set([ 'null' ]);
    const copy = /^([A-Za-z_]\w*)(?:\.clone\(\))?$/.exec(e);
    if (copy !== null) {
        const src = locals.get(copy[1]);
        if (src === undefined) return undefined;
        if (src.ty === 'Value') return src.set === undefined ? undefined : new Set(src.set);
        if (src.ty === 'String') return new Set([ 'str' ]);
    }
    // The family helpers return a `Value::Str` / `Value::Array` of Str on every path.
    const own = /^(?:crate::runtime::)?(to_string_val|replace_str|replace_all_str|join|pad_end|to_fixed)\(/.exec(e);
    if (own !== null) return own[1] === 'pad_end' ? new Set([ 'str', 'null' ]) : new Set([ 'str' ]);
    if (/^(?:crate::runtime::)?split\(/.test(e)) return new Set([ 'arr' ]);
    const call = /^(?:crate::value::)?(?:self\.)?(safe_string(?:_k|_2|_lower|_upper|_lower_k|_upper_k)?|safe_bool(?:_k|_2)?|safe_integer(?:_k|_2)?|safe_int|safe_timestamp|safe_float(?:_k)?|safe_number(?:_k|_2)?|parse_int|parse_float|parse_to_int|number_to_string|decimal_to_precision|sum)\(/.exec(e);
    if (call !== null) {
        const name = call[1];
        const open = call[0].length - 1;
        if (closeParen(e, open) !== e.length) return undefined;
        if (name === 'decimal_to_precision') return new Set([ 'str' ]);
        if (name === 'number_to_string') return new Set([ 'str', 'null' ]);
        if (name === 'sum') return new Set([ 'int', 'float', 'str', 'null' ]);
        let own = 'str';
        if (name.startsWith('safe_bool')) own = 'bool';
        else if (name.startsWith('safe_float') || name.startsWith('safe_number') || name === 'parse_float') own = 'float';
        else if (!name.startsWith('safe_string') && name !== 'parse_to_int') own = 'int';
        const out: VSet = new Set([ own ]);
        // `safe_*` fall back to their default: a literal box pins it, `&[]` leaves Null.
        if (name.startsWith('safe')) {
            const args = splitArgs(e, open + 1, e.length - 1);
            if (args === undefined) return undefined;
            const last = args[args.length - 1].trim();
            if (last === '&[]') out.add('null');
            else {
                const inner = /^&\[(.*)\]$/.exec(last);
                if (inner === null) return undefined;
                const lit = strBox(`&${inner[1]}`);
                const num = intBox(`&${inner[1]}`);
                if (lit !== undefined) out.add('str');
                else if (num !== undefined) out.add('int');
                else return undefined;
            }
        } else {
            out.add('null');
        }
        return out;
    }
    if (/^(?:Value::(?:Array|List)\(|Value::from\(vec!\[|vec!\[)/.test(e)) return new Set([ 'arr' ]);
    const slice = /^(?:crate::value::)?(?:self\.)?(?:array_slice|array_concat)\(\s*&?([A-Za-z_]\w*)/.exec(e);
    if (slice !== null) {
        const src = locals.get(slice[1]);
        return src === undefined || src.set === undefined ? undefined : new Set(src.set);
    }
    // The printer's inline `parse_float` / `parse_int`: every arm yields a number or Null.
    if (/^\(match &\w+ \{ Value::Str\(__parse_s\) => __parse_s\.trim\(\)\.parse::<f64>\(\)\.map\(Value::Float\)/.test(e)) return new Set([ 'float', 'null' ]);
    if (/^\(match &\w+ \{ Value::Str\(__parse_s\) => __parse_s\.trim\(\)\.parse::<i64>\(\)\.map\(Value::Int\)/.test(e)) return new Set([ 'int', 'null' ]);
    // The printer's inline arithmetic: every arm is an Int/Float/Null.
    if (/^\(match \(&\(/.test(e)) return new Set([ 'int', 'float', 'null' ]);
    return undefined;
}

/** Locals of one fn: declared native type, or the variant set every write of a `Value` local pins. */
function valueSets(region: string, maskedRegion: string, sig: string): Map<string, Local> {
    const locals = new Map<string, Local>();
    const declRe = /let\s+(?:mut\s+)?([A-Za-z_]\w*)\s*:\s*([^=;]+?)\s*=/g;
    const decls: Array<{ name: string, ty: string, at: number, init: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = declRe.exec(maskedRegion)) !== null) {
        const rel = new RegExp(`\\b${m[1]}\\b`).exec(m[0]);
        decls.push({ name: m[1], ty: m[2].replace(/\s+/g, ''), at: m.index + (rel === null ? 0 : rel.index), init: m.index + m[0].length });
    }
    const multi = new Map<string, number>();
    for (const d of decls) multi.set(d.name, (multi.get(d.name) ?? 0) + 1);
    // Typed parameters declare their own type; only those need a set.
    for (const p of sig.matchAll(/\(\s*(?:&?\s*(?:mut\s+)?([A-Za-z_]\w*)\s*:\s*([^,)]+)|&[A-Za-z_]\w*)|,\s*(?:mut\s+)?([A-Za-z_]\w*)\s*:\s*([^,)]+)/g)) {
        const name = p[1] ?? p[3];
        const ty = (p[2] ?? p[4] ?? '').replace(/\s+/g, '');
        if (name !== undefined && NATIVE_TY.has(ty)) locals.set(name, { ty });
    }
    for (const d of decls) {
        if (multi.get(d.name) !== 1) continue;
        locals.set(d.name, { ty: d.ty });
        if (d.ty !== 'Value') continue;
        // A parameter, loop binding or closure arg of the same name could shadow the local.
        const bind = new RegExp(`(?:[(,|]\\s*(?:mut\\s+)?${d.name}\\s*:|\\bfor\\s+(?:mut\\s+)?${d.name}\\b)`);
        if (bind.test(sig)) continue;
        const set: VSet = new Set();
        let ok = true;
        let elems: string | undefined = 'str';
        const word = new RegExp(`(?<![A-Za-z0-9_.])${d.name}(?![A-Za-z0-9_])`, 'g');
        for (let k = 0; k < maskedRegion.length; k++) {
            word.lastIndex = k;
            const hit = word.exec(maskedRegion);
            if (hit === null) break;
            const s = hit.index;
            k = s;
            if (/&\s*mut\s*$/.test(maskedRegion.slice(Math.max(0, s - 12), s))) { ok = false; break; }
            const tail = maskedRegion.slice(s + d.name.length);
            const rhs = /^\s*=(?!=)/.exec(tail);
            if (s === d.at) {
                const end = stmtEnd(maskedRegion, d.init);
                const ex = end < 0 ? '' : region.slice(d.init, end);
                const got = end < 0 ? undefined : inferSet(ex, locals);
                if (got === undefined) { ok = false; break; }
                got.forEach(v => set.add(v));
                if (elemKind(ex, locals) !== 'str') elems = undefined;
                k = end < 0 ? s + d.name.length : end;
                continue;
            }
            if (rhs !== null) {
                const from = s + d.name.length + rhs[0].length;
                const end = stmtEnd(maskedRegion, from);
                const ex = end < 0 ? '' : region.slice(from, end);
                const got = end < 0 ? undefined : inferSet(ex, locals);
                if (got === undefined) { ok = false; break; }
                got.forEach(v => set.add(v));
                if (elemKind(ex, locals) !== 'str') elems = undefined;
                k = end < 0 ? from : end;
                continue;
            }
        }
        if (ok && set.size > 0) locals.set(d.name, { ty: d.ty, set, elems });
    }
    return locals;
}

/** Native replacement for one helper call, or undefined when the operand is unproven. */
function rewrite(name: string, args: string[], locals: Map<string, Local>): string | undefined {
    const arg0 = (args[0] ?? '').trim();
    const recv = /^&\s*([A-Za-z_]\w*)$/.exec(arg0);
    const x = recv === null ? undefined : recv[1];
    const local = x === undefined ? undefined : locals.get(x);
    const set = local?.set;
    const ty = local?.ty;
    const provenScalar = set !== undefined && set.size > 0 && [ ...set ].every(v => SCALAR.has(v));
    const strTyped = ty === 'String';
    const strProven = strTyped || (set !== undefined && set.size === 1 && set.has('str'));
    const scalarProven = strTyped || provenScalar;
    const numProven = ty === 'i64' || ty === 'f64' || (set !== undefined && set.size > 0 && [ ...set ].every(v => v === 'int' || v === 'float' || v === 'null'));
    if (x === undefined) {
        // An inline scalar expression (`self.sum(..)`, the arithmetic match) needs no local.
        if (name !== 'to_string_val') return undefined;
        const held = arg0.replace(/^&/, '').replace(/;$/, '').trim();
        const got = inferSet(held, locals);
        if (got === undefined || [ ...got ].some(v => !SCALAR.has(v))) return undefined;
        return `Value::str(${held}.to_string())`;
    }
    switch (name) {
        case 'to_string_val': {
            if (args.length !== 1) return undefined;
            if (strProven) return `Value::str(${x}.clone())`;
            if (scalarProven) return `Value::str(${x}.to_string())`;
            return undefined;
        }
        case 'replace_str':
        case 'replace_all_str': {
            if (!strProven || args.length !== 3) return undefined;
            const a = strBox(args[1]);
            const b = strBox(args[2]);
            if (a === undefined || b === undefined) return undefined;
            const holder = strTyped ? x : `${x}.as_str().unwrap_or_default()`;
            return `Value::str(${holder}.replace(${a}, ${b}))`;
        }
        case 'split': {
            if (!strProven || args.length !== 2) return undefined;
            const d = strBox(args[1]);
            if (d === undefined) return undefined;
            const holder = strTyped ? x : `${x}.as_str().unwrap_or_default()`;
            return `Value::Array(${holder}.split(${d}).map(Value::str).collect())`;
        }
        case 'starts_with':
        case 'ends_with': {
            if (!strProven || args.length !== 2) return undefined;
            const s = strBox(args[1]);
            if (s === undefined) return undefined;
            const holder = strTyped ? x : `${x}.as_str().unwrap_or_default()`;
            return `${holder}.${name}(${s})`;
        }
        case 'to_fixed': {
            if (!numProven || args.length !== 2) return undefined;
            const d = intBox(args[1]);
            if (d === undefined) return undefined;
            const n = ty === 'f64' ? x : ty === 'i64' ? `(${x} as f64)` : `${x}.as_f64().unwrap_or(0.0)`;
            return `Value::str(format!("{:.*}", ${d}, ${n}))`;
        }
        case 'join': {
            if (args.length !== 2) return undefined;
            const s = strBox(args[1]);
            if (s === undefined) return undefined;
            if (ty === 'Vec<String>') return `Value::str(${x}.join(${s}))`;
            // Every element is a `Value::Str`, so the helper's stringify_simple is the identity.
            if (local?.elems === 'str' && set !== undefined && set.size === 1 && set.has('arr')) {
                return `Value::str(${x}.as_array().cloned().unwrap_or_default().iter().filter_map(Value::as_str).collect::<Vec<_>>().join(${s}))`;
            }
            return undefined;
        }
        default: return undefined;
    }
}

/** Rewrite the family where the operand type is proven; leave every other site as printed. */
export function r07StringNatives(content: string): string {
    if (!/to_string_val\(|replace_str\(|replace_all_str\(|split\(|join\(|starts_with\(|ends_with\(|to_fixed\(/.test(content)) return content;
    const masked = maskText(content);
    const rx = /(?<![A-Za-z0-9_:.])(to_string_val|replace_str|replace_all_str|split|join|starts_with|ends_with|to_fixed)\(/g;
    const hits: Array<{ start: number, end: number, name: string }> = [];
    for (const m of masked.matchAll(rx)) {
        const start = m.index as number;
        if (/\bfn\s+$/.test(masked.slice(Math.max(0, start - 8), start))) continue;
        const open = start + m[1].length;
        const close = closeParen(masked, open);
        if (close < 0) continue;
        hits.push({ start, end: close, name: m[1] });
    }
    if (hits.length === 0) return content;
    const rewrites: Array<{ start: number, end: number, text: string }> = [];
    const cache = new Map<number, Map<string, Local>>();
    for (const h of hits) {
        const [ lo, hi ] = fnBounds(masked, h.start);
        let locals = cache.get(lo);
        if (locals === undefined) {
            const region = content.slice(lo, hi);
            const head = content.slice(lo, hi).indexOf('{');
            const sig = head < 0 ? '' : region.slice(0, head);
            locals = valueSets(region, masked.slice(lo, hi), sig);
            cache.set(lo, locals);
        }
        const args = splitArgs(content, h.start + h.name.length + 1, h.end - 1);
        if (args === undefined) continue;
        const text = rewrite(h.name, args, locals);
        if (text === undefined) continue;
        // Never push a line that was under the 400-char report threshold over it.
        const lineStart = content.lastIndexOf('\n', h.start) + 1;
        const lineEnd = content.indexOf('\n', h.end);
        const len = (lineEnd < 0 ? content.length : lineEnd) - lineStart;
        if (len <= 400 && len - (h.end - h.start) + text.length > 400) continue;
        rewrites.push({ start: h.start, end: h.end, text });
    }
    if (rewrites.length === 0) return content;
    rewrites.sort((a, b) => a.start - b.start);
    let out = '';
    let at = 0;
    for (const r of rewrites) {
        if (r.start < at) continue;
        out += content.slice(at, r.start) + r.text;
        at = r.end;
    }
    return out + content.slice(at);
}

/** One case per rule; each fails on the base generator (no such pass). */
export function r07StringSelfTest(): string[] {
    const cases: Array<[string, string, string]> = [
        [
            'to-string-scalar-local',
            'fn f(&self) -> Value {\n    let mut e: Value = self.sum(&[a, b]);\n    let mut s: Value = to_string_val(&e);\n    s\n}\n',
            'fn f(&self) -> Value {\n    let mut e: Value = self.sum(&[a, b]);\n    let mut s: Value = Value::str(e.to_string());\n    s\n}\n',
        ],
        [
            'to-string-inline-sum',
            'fn f(&self) -> Value {\n    self.log(to_string_val(&self.sum(&[a, b])));\n}\n',
            'fn f(&self) -> Value {\n    self.log(Value::str(self.sum(&[a, b]).to_string()));\n}\n',
        ],
        [
            'replace-on-str-local',
            'fn f(&self) -> Value {\n    let mut s: Value = self.decimal_to_precision(n, r, p, &[]);\n    s = replace_str(&s, &Value::Str(".".into()), &Value::Str("".into()));\n    s\n}\n',
            'fn f(&self) -> Value {\n    let mut s: Value = self.decimal_to_precision(n, r, p, &[]);\n    s = Value::str(s.as_str().unwrap_or_default().replace(".", ""));\n    s\n}\n',
        ],
        [
            'split-on-str-param',
            'fn f(&self, mut s: String) -> Value {\n    let mut parts: Value = split(&s, &Value::Str("_".into()));\n    parts\n}\n',
            'fn f(&self, mut s: String) -> Value {\n    let mut parts: Value = Value::Array(s.split("_").map(Value::str).collect());\n    parts\n}\n',
        ],
        [
            'join-on-string-vec',
            'fn f(&self, mut xs: Vec<String>) -> Value {\n    join(&xs, &Value::Str(",".into()))\n}\n',
            'fn f(&self, mut xs: Vec<String>) -> Value {\n    Value::str(xs.join(","))\n}\n',
        ],
        [
            'affix-on-str-local',
            'fn f(&self) -> Value {\n    let mut s: Value = self.safe_string_k(raw, "k", &[Value::Str("".into())]);\n    ends_with(&s, &Value::Str("USDT".into()))\n}\n',
            'fn f(&self) -> Value {\n    let mut s: Value = self.safe_string_k(raw, "k", &[Value::Str("".into())]);\n    s.as_str().unwrap_or_default().ends_with("USDT")\n}\n',
        ],
        [
            'to-fixed-on-float-local',
            'fn f(&self, mut d: f64) -> Value {\n    to_fixed(&d, &Value::Int(8))\n}\n',
            'fn f(&self, mut d: f64) -> Value {\n    Value::str(format!("{:.*}", 8, d))\n}\n',
        ],
        [
            'join-on-str-array-local',
            'fn f(&self) -> Value {\n    let mut parts: Value = Value::from(vec![]);\n    parts = Value::Array(s.as_str().map(|__s| __s.split("-").map(|__p| Value::Str(__p.to_string().into())).collect()).unwrap_or_default());\n    join(&parts, &Value::Str("-".into()))\n}\n',
            'fn f(&self) -> Value {\n    let mut parts: Value = Value::from(vec![]);\n    parts = Value::Array(s.as_str().map(|__s| __s.split("-").map(|__p| Value::Str(__p.to_string().into())).collect()).unwrap_or_default());\n    Value::str(parts.as_array().cloned().unwrap_or_default().iter().filter_map(Value::as_str).collect::<Vec<_>>().join("-"))\n}\n',
        ],
        [
            'join-on-str-array-local-from-split',
            'fn f(&self) -> Value {\n    let mut parts: Value = Value::from(vec![]);\n    parts = Value::Array(s.as_str().map(|__s| __s.split("-").map(Value::from).collect()).unwrap_or_default());\n    join(&parts, &Value::Str("-".into()))\n}\n',
            'fn f(&self) -> Value {\n    let mut parts: Value = Value::from(vec![]);\n    parts = Value::Array(s.as_str().map(|__s| __s.split("-").map(Value::from).collect()).unwrap_or_default());\n    Value::str(parts.as_array().cloned().unwrap_or_default().iter().filter_map(Value::as_str).collect::<Vec<_>>().join("-"))\n}\n',
        ],
        [
            'unproven-join-keeps-helper',
            'fn f(&self, mut xs: Value) -> Value {\n    join(&xs, &Value::Str(",".into()))\n}\n',
            'fn f(&self, mut xs: Value) -> Value {\n    join(&xs, &Value::Str(",".into()))\n}\n',
        ],
        [
            'unproven-keeps-helper',
            'fn f(&self, mut x: Value) -> Value {\n    to_string_val(&x)\n}\n',
            'fn f(&self, mut x: Value) -> Value {\n    to_string_val(&x)\n}\n',
        ],
        [
            'mutated-local-keeps-helper',
            'fn f(&self) -> Value {\n    let mut s: Value = self.safe_string_k(raw, "k", &[Value::Str("".into())]);\n    s = get_value(&raw, &Value::Str("x".into()));\n    to_string_val(&s)\n}\n',
            'fn f(&self) -> Value {\n    let mut s: Value = self.safe_string_k(raw, "k", &[Value::Str("".into())]);\n    s = get_value(&raw, &Value::Str("x".into()));\n    to_string_val(&s)\n}\n',
        ],
    ];
    const fails: string[] = [];
    for (const [ label, src, want ] of cases) {
        const got = r07StringNatives(src);
        if (got !== want) fails.push(`${label}: got\n${got}\nwant\n${want}`);
    }
    return fails;
}

if (isMainEntry(import.meta.url) && process.argv.includes('--self-test')) {
    const fails = r07StringSelfTest();
    if (fails.length > 0) {
        console.error(fails.join('\n\n'));
        process.exit(1);
    }
    console.log('hx10w3-R07 self-test ok');
}
