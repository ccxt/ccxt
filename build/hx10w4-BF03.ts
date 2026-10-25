// hx10 wave-4 BF03 -- the Rust base's plain-dict state containers.
//
// `options`, `markets` and `balance` are typed containers in the sense the
// other ports get from `Map<String, Object>` / `Dictionary<string, object>`:
// they hold a dict or Null, are single-owner, and the runtime never tags them
// (`__cacheKind` / `__book_id` / `__ws_subs_url` / `__live_id`), so the only
// thing between them and the stdlib map op is the helper's dict probe.
// `PLAIN_DICT_FIELDS` in `rust/ccxt-common/src/exchange.rs` declares the
// container proof and pins it with a unit test.
//
// Run-time Rust has no `Value` subtyping, so the fields stay `Value`: a retype
// would force a re-box at ~5.5k call sites. What the container proof buys is
// the write-through op:
//
//   if let Value::Dict(__r05d) = get_value_mut(&mut self.balance, &Value::Str("info".into())) { B }
//     ->
//   if let Value::Dict(__bf03d0) = &mut self.balance {
//       let __bf03e1 = std::sync::Arc::make_mut(__bf03d0).entry("info".to_string()).or_insert(Value::Null);
//       if let Value::Dict(__r05d) = __bf03e1 { B }
//   }
//
// Exact for a literal string key: `get_value_mut`'s dict arm IS
// `entry(k.to_string()).or_insert(Null)`, and its `(other, _)` arm (a Null
// field, or a non-dict hop) leaves the `if let Value::Dict` test false.
// Every other key shape keeps the helper call: a `: Value` key may be a
// non-Str (the helper's wildcard arm then writes to the receiver itself) and
// stringifying it would only move the call to `stringify_param`.

const FIELDS = ['options', 'markets', 'balance'];
const RECV = 'self\\.(?:(?:core|parent)\\.)*(' + FIELDS.join('|') + ')';
const STR_KEY = /^&Value::Str\("((?:[^"\\]|\\.)*)"\.(?:into|to_string)\(\)\)$/;
const ROOT = new RegExp('^&mut\\s+' + RECV + '$');
const COERCED = new RegExp('^unsafe\\s*\\{\\s*crate::runtime::coerce_value_to_mut\\(&' + RECV + '\\)\\s*\\}$');
const MAX_LINE = 400;

/** Hide comments and string bodies so brace/paren scans cannot be fooled. */
function maskSrc(src: string): string {
    const out = src.split('');
    const blank = (from: number, to: number) => {
        for (let i = from; i < to && i < out.length; i++) if (out[i] !== '\n') out[i] = ' ';
    };
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') {
            const end = src.indexOf('\n', i);
            const stop = end < 0 ? src.length : end;
            blank(i, stop);
            i = stop;
            continue;
        }
        if (c === '/' && src[i + 1] === '*') {
            const end = src.indexOf('*/', i + 2);
            const stop = end < 0 ? src.length : end + 2;
            blank(i, stop);
            i = stop;
            continue;
        }
        if (c === "'") {
            const m = /^'(?:\\.|[^\\'])'/.exec(src.slice(i, i + 4));
            if (m !== null) { i += m[0].length; continue; }
        }
        if (c === '"') {
            let j = i + 1;
            while (j < src.length) {
                if (src[j] === '\\') { j += 2; continue; }
                if (src[j] === '"') break;
                j++;
            }
            blank(i, Math.min(j + 1, src.length));
            i = j + 1;
            continue;
        }
        i++;
    }
    return out.join('');
}

/** Top-level argument spans of the call whose `(` is at `open`. */
function argSpans(masked: string, open: number): Array<[number, number]> | undefined {
    let depth = 0;
    const spans: Array<[number, number]> = [];
    let start = open + 1;
    for (let j = open; j < masked.length; j++) {
        const c = masked[j];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) { spans.push([start, j]); return spans; }
        } else if (c === ',' && depth === 1) {
            spans.push([start, j]);
            start = j + 1;
        }
    }
    return undefined;
}

/** Offset of the `)` closing the `(` at `open`, or -1. */
function closeOf(masked: string, open: number): number {
    let depth = 0;
    for (let j = open; j < masked.length; j++) {
        const c = masked[j];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return j;
        }
    }
    return -1;
}

interface Hop { recv: string, key: string, literal: string | undefined, close: number }
interface Chain { hops: Hop[], root: string }

/** One `get_value_mut(<recv>, <key>)` call starting at `at`. */
function hopAt(content: string, masked: string, at: number): Hop | undefined {
    if (!/^get_value_mut\(/.test(masked.slice(at, at + 14))) return undefined;
    const open = at + 'get_value_mut'.length;
    const spans = argSpans(masked, open);
    if (spans === undefined || spans.length !== 2) return undefined;
    const close = closeOf(masked, open);
    if (close < 0) return undefined;
    const key = content.slice(spans[1][0], spans[1][1]).trim();
    const lit = STR_KEY.exec(key);
    return {
        recv: content.slice(spans[0][0], spans[0][1]).trim(),
        key,
        literal: lit === null ? undefined : lit[1],
        close,
    };
}

/** The chain at `at`: hops outermost first, plus the innermost receiver. */
function chainAt(content: string, masked: string, at: number): Chain | undefined {
    const hops: Hop[] = [];
    let cur = at;
    for (let n = 0; n < 8; n++) {
        const h = hopAt(content, masked, cur);
        if (h === undefined) return undefined;
        hops.push(h);
        const lead = h.recv.length - h.recv.replace(/^\s+/, '').length;
        if (!/^get_value_mut\(/.test(h.recv)) return { hops, root: h.recv };
        cur = content.indexOf(h.recv, cur) + lead;
    }
    return undefined;
}

interface Rw { start: number, end: number, text: string }

function runPass(content: string): string {
    if (!content.includes('get_value_mut(')) return content;
    const masked = maskSrc(content);
    const headRe = /if let Value::Dict\(\s*(\w+)\s*\)\s*=\s*get_value_mut\(/g;
    const rws: Rw[] = [];
    let m: RegExpExecArray | null;
    while ((m = headRe.exec(masked)) !== null) {
        const bind = m[1];
        const at = m.index + m[0].length - 'get_value_mut('.length;
        const chain = chainAt(content, masked, at);
        if (chain === undefined) continue;
        if (!ROOT.test(chain.root) && !COERCED.test(chain.root)) continue;
        const outer = chain.hops[0];
        const allLiteral = chain.hops.every(h => h.literal !== undefined);
        if (!allLiteral && outer.literal === undefined) continue;

        const end = chain.hops[0].close + 1;
        const braceOpen = masked.indexOf('{', end);
        if (braceOpen < 0) continue;
        if (masked.slice(end, braceOpen).trim() !== '') continue;
        let depth = 0;
        let braceClose = -1;
        for (let j = braceOpen; j < masked.length; j++) {
            const c = masked[j];
            if (c === '{') depth++;
            else if (c === '}') {
                depth--;
                if (depth === 0) { braceClose = j; break; }
            }
        }
        if (braceClose < 0) continue;

        const body = content.slice(braceOpen + 1, braceClose);
        if (body.includes('__bf03')) continue;

        const lineStart = content.lastIndexOf('\n', m.index) + 1;
        const pad = /^[ \t]*/.exec(content.slice(lineStart, m.index)) as RegExpExecArray;
        const level = (n: number) => pad[0] + '    '.repeat(n + 1);
        // Innermost key first: `keys[i]` is hop i counted from the container.
        const keys = allLiteral
            ? chain.hops.map(h => h.literal as string).reverse()
            : [outer.literal as string];
        const head = allLiteral ? chain.root : outer.recv;
        const lines: string[] = ['if let Value::Dict(__bf03d0) = ' + head + ' {'];
        const parts: string[] = ['if let Value::Dict(__bf03d0) = ' + head + ' {'];
        const bodyText = body.replace(/\s+$/, '');
        let tooLong = false;
        for (let i = 0; i < keys.length; i++) {
            const last = i === keys.length - 1;
            const entry = 'let __bf03e' + (i + 1)
                + ' = std::sync::Arc::make_mut(__bf03d' + i + ').entry("' + keys[i] + '".to_string())'
                + '.or_insert(Value::Null);';
            const test = last
                ? 'if let Value::Dict(' + bind + ') = __bf03e' + (i + 1) + ' {'
                : 'if let Value::Dict(__bf03d' + (i + 1) + ') = __bf03e' + (i + 1) + ' {';
            if (level(i).length + entry.length > MAX_LINE) { tooLong = true; break; }
            lines.push(level(i) + entry);
            lines.push(level(i) + test);
            parts.push(entry + ' ' + test);
        }
        if (tooLong) continue;
        const closers: string[] = [];
        for (let k = keys.length; k >= 0; k--) closers.push(pad[0] + '    '.repeat(k) + '}');
        const inline = new Array(keys.length + 1).fill('}').join(' ');
        // Keep the whole statement on one line when it fits, like the passes it
        // replaces: this is generated code and it is diffed, not read.
        const compact = parts.join(' ') + ' ' + bodyText.trim() + ' ' + inline;
        const multi = lines.join('\n') + bodyText + '\n' + closers.join('\n');
        const text = (bodyText.indexOf('\n') < 0 && pad[0].length + compact.length <= MAX_LINE) ? compact : multi;
        rws.push({ start: m.index, end: braceClose + 1, text });
        headRe.lastIndex = braceClose + 1;
    }
    if (rws.length === 0) return content;
    rws.sort((a, b) => a.start - b.start);
    let out = '';
    let at = 0;
    for (const r of rws) {
        if (r.start < at) continue;
        out += content.slice(at, r.start) + r.text;
        at = r.end;
    }
    return out + content.slice(at);
}

export function bf03PlainDictChains(content: string): string {
    return runPass(content);
}

export default bf03PlainDictChains;
