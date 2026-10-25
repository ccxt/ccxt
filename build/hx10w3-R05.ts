// hx10 wave-3 R05 -- nested `balance` / `ohlcvs` / `options` element writes go native.
//
// `this.balance[account]['info'] = v`, `this.ohlcvs[symbol][tf] = cache` and
// `this.options['k1'][k2]... = v` print as
//   add_element_to_object(get_value_mut(<chain>), KEY, VAL)
// and stay helper calls two levels in: the wave-2 pass resolves one level only
// with a literal inner key. The intermediate hops are created by `get_value_mut`
// (`entry(k).or_insert(Null)`), so they stay verbatim; only the outer
// `add_element_to_object` becomes the native map insert.
//
// The helper's dict arm is `insert(k.to_string(), val)` for a Str key and
// `insert(stringify_simple(k), val)` otherwise, and `runtime::stringify_param`
// is a direct delegate of `stringify_simple`, so one `insert(stringify_param(..))`
// covers both without assuming anything about the key type. The tag hooks
// (`try_book_meta_write` / `try_ws_subs_write` / `try_ws_sub_field_write` /
// `try_cache_hashmap_write`) only fire on dicts the runtime tagged, and
// `balance` / `ohlcvs` / `options` are plain exchange-owned buckets -- the same
// whitelist the wave-2 pass and the printer's `printNativeDictInsert` use.
//
// A `&ident` key is only taken when the enclosing fn declares it `: Value`
// (-> `stringify_param`) or `: String` (-> `clone()`); anything else keeps the
// helper, since the printed form carries no type.

const FIELDS_ARR = ['balance', 'ohlcvs', 'options'];
const RECV = 'self\\.(?:(?:core|parent)\\.)*(' + FIELDS_ARR.join('|') + ')';
const STR_KEY = '&Value::Str\\("((?:[^"\\\\]|\\\\.)*)"\\.(?:into|to_string)\\(\\)\\)';
const MAX_LINE = 400;

/** Hide comments and string bodies so paren/key scans cannot be fooled. */
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

/** Offset just past the `)` closing the `(` at `open`, or -1. */
function callEnd(masked: string, open: number): number {
    let depth = 0;
    for (let j = open; j < masked.length; j++) {
        const c = masked[j];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return j + 1;
        }
    }
    return -1;
}

/** True when the call is a statement (only whitespace between it and a `;`). */
function isStatement(masked: string, from: number, to: number): boolean {
    let k = to;
    while (k < masked.length && (masked[k] === ' ' || masked[k] === '\t')) k++;
    if (masked[k] !== ';') return false;
    let s = from - 1;
    while (s >= 0 && (masked[s] === ' ' || masked[s] === '\t' || masked[s] === '\n')) s--;
    return s < 0 || '{};'.indexOf(masked[s]) >= 0;
}

/** First top-level argument of the call text starting at `expr`'s `(`. */
function firstArg(expr: string): string {
    const open = expr.indexOf('(');
    if (open < 0) return '';
    let depth = 0;
    for (let j = open; j < expr.length; j++) {
        const c = expr[j];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return expr.slice(open + 1, j).trim();
        } else if (c === ',' && depth === 1) {
            return expr.slice(open + 1, j).trim();
        }
    }
    return '';
}

/** The whitelisted field a receiver chain is rooted at, or '' when unproven. */
function chainField(recv: string): string {
    const direct = new RegExp('^&mut\\s+' + RECV + '$').exec(recv);
    if (direct !== null) return direct[1];
    let expr = recv;
    for (let hop = 0; hop < 8; hop++) {
        if (!expr.startsWith('get_value_mut(')) return '';
        const a = firstArg(expr);
        const mutRoot = new RegExp('^&mut\\s+' + RECV + '$').exec(a);
        if (mutRoot !== null) return mutRoot[1];
        const coerced = new RegExp('^unsafe\\s*\\{\\s*crate::runtime::coerce_value_to_mut\\(&' + RECV + '\\)\\s*\\}$').exec(a);
        if (coerced !== null) return coerced[1];
        if (!a.startsWith('get_value_mut(')) return '';
        expr = a;
    }
    return '';
}

const FN_HEAD = /(?:^|\n)[ \t]*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+[A-Za-z_][A-Za-z0-9_]*/g;

/** The `fn` body span holding offset `at`. */
function fnSpan(src: string, at: number): [number, number] {
    FN_HEAD.lastIndex = 0;
    let start = 0;
    let m: RegExpExecArray | null;
    while ((m = FN_HEAD.exec(src)) !== null) {
        if (m.index > at) return [start, m.index];
        start = m.index;
    }
    return [start, src.length];
}

/** How a `&ident` key may be lowered, or '' when the local's type is unproven. */
function identKeyArg(body: string, ident: string, header: string): string {
    const asStr = new RegExp('\\blet\\s+(?:mut\\s+)?' + ident + '\\s*:\\s*String\\s*=');
    const asVal = new RegExp('\\blet\\s+(?:mut\\s+)?' + ident + '\\s*:\\s*Value\\s*=');
    if (asStr.test(body)) return ident + '.clone()';
    if (asVal.test(body)) return 'crate::runtime::stringify_param(&' + ident + ')';
    const paramVal = new RegExp('(?:^|[(,]\\s*)(?:mut\\s+)?' + ident + '\\s*:\\s*Value\\b');
    const paramStr = new RegExp('(?:^|[(,]\\s*)(?:mut\\s+)?' + ident + '\\s*:\\s*String\\b');
    if (paramStr.test(header)) return ident + '.clone()';
    if (paramVal.test(header)) return 'crate::runtime::stringify_param(&' + ident + ')';
    return '';
}

interface Rw { start: number, end: number, text: string }

function runPass(content: string): string {
    if (!content.includes('add_element_to_object(')) return content;
    const masked = maskSrc(content);
    const callRe = /(?<![A-Za-z0-9_:.])(add_element_to_object)\(/g;
    const rws: Rw[] = [];
    let m: RegExpExecArray | null;
    while ((m = callRe.exec(masked)) !== null) {
        const open = m.index + m[1].length;
        const spans = argSpans(masked, open);
        if (spans === undefined || spans.length !== 3) continue;
        const end = callEnd(masked, open);
        if (end < 0) continue;
        if (!isStatement(masked, m.index, end)) continue;
        const raw = spans.map(sp => content.slice(sp[0], sp[1]).trim());
        if (chainField(raw[0]) === '') continue;
        const value = raw[2];
        if (/\bself\b/.test(value)) continue;
        let keyArg = '';
        const lit = new RegExp('^' + STR_KEY + '$').exec(raw[1]);
        if (lit !== null) {
            keyArg = '"' + lit[1] + '".to_string()';
        } else {
            const ident = /^&([A-Za-z_][A-Za-z0-9_]*)$/.exec(raw[1]);
            if (ident === null) continue;
            const [fnStart, fnEnd] = fnSpan(masked, m.index);
            const headerEnd = masked.indexOf('\n', fnStart + 1);
            const header = masked.slice(fnStart, headerEnd < 0 ? fnEnd : headerEnd);
            keyArg = identKeyArg(masked.slice(fnStart, m.index), ident[1], header);
            if (keyArg === '') continue;
        }
        const text = 'if let Value::Dict(__r05d) = ' + raw[0]
            + ' { std::sync::Arc::make_mut(__r05d).insert(' + keyArg + ', ' + value + '); }';
        const lineStart = content.lastIndexOf('\n', m.index) + 1;
        const lineEndIdx = content.indexOf('\n', end);
        const lineLen = (lineEndIdx < 0 ? content.length : lineEndIdx) - lineStart;
        if (lineLen > MAX_LINE || lineLen - (end - m.index) + text.length > MAX_LINE) continue;
        let stop = end;
        while (stop < content.length && (content[stop] === ' ' || content[stop] === '\t')) stop++;
        if (content[stop] !== ';') continue;
        rws.push({ start: m.index, end: stop + 1, text });
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

export function r05FieldChainInserts(content: string): string {
    // Deeper chains (`a[k1][k2][k3]`) resolve one hop per round.
    let out = content;
    for (let i = 0; i < 4; i++) {
        const next = runPass(out);
        if (next === out) break;
        out = next;
    }
    return out;
}

export default r05FieldChainInserts;
