// hx10 wave-3 R08 -- dict reads on a local whose declaration pins a Dict.
//
// Two proofs, both about the RECEIVER (a bare local, never a `self.` field or
// a chained read -- those are wave-2 R08's):
//
//   plain  every declaration is a fresh map literal (`Value::Map(`) and every
//          rebind is another map literal or `Value::Null`. A fresh literal is
//          never tagged by the runtime (book/cache/client markers are only
//          written onto dicts the runtime itself created), so the reads below
//          reduce to the stdlib op for every key.
//   dicty  every declaration is a callee that only ever returns a Dict
//          (`safe_dict*`, `extend`, `omit`, `group_by`, ...). The variant is
//          pinned but the content is unproven, so a book/cache/client marker
//          may have flowed in: only literal keys the runtime does not route to
//          a marker store are taken.
//
//   get_value(&X, &Value::Str("k".into()))  -> X.as_map().and_then(|__m| __m.get("k")).cloned().unwrap_or(Value::Null)
//   get_value(&X, &KEY)                     -> X.as_map().and_then(|__m| KEY.as_str().and_then(|__k| __m.get(__k))).cloned().unwrap_or(Value::Null)
//   in_op(&X, &Value::Str("k".into()))      -> X.as_map().is_some_and(|__m| __m.contains_key("k"))
//   in_op(&X, &KEY)                         -> X.as_map().is_some_and(|__m| KEY.as_str().is_some_and(|__k| __m.contains_key(__k)))
//
// `in_op` on a proven Dict never consults a marker (its arms are Dict+Str and
// Arr), so it matches the helper on any key; the routed-key rule above is the
// common, weaker one. Unproven receivers keep the helper call.
//
// Nothing in generated Rust writes `__live_id` (the only remaining arm of the
// helper's Dict+Str path), so it is unreachable here.

const ROUTED = /^(?:timestamp|datetime|nonce|symbol|checksum|cache|hashmap|subscriptions|futures)$/;
const PLAIN_INIT = /^Value::Map\(/;
const DICT_INIT = /^(?:Value::Map\(|self\.safe_dict|self\.safe_dictionary|self\.create_safe_dictionary|self\.extend\(|self\.deep_extend\(|self\.omit\(|self\.group_by\(|self\.index_by\(|self\.filter_by_array\()/;
const WRITE_HELPER = /(?:add_element_to_object|get_value_mut|set_value|remove)\(\s*$/;
const CALL = /(?<![A-Za-z0-9_:.])(get_value|in_op)\(/g;
const STR_LIT = /^&Value::Str\("((?:[^"\\]|\\.)*)"\.(?:into|to_string)\(\)\)$/;

/** Blank string/char bodies and comments, keeping every index in place. */
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
            const m = /^'(?:\\.|[^\\'])'/.exec(src.slice(i, i + 5));
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

/** Top-level argument spans of the call whose `(` is at `open`. */
function argSpans(masked: string, open: number): Array<[number, number]> {
    const spans: Array<[number, number]> = [];
    let depth = 0;
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
    return spans;
}

/** Initializer text of the `let` binding whose `=` ends at `from`. */
function initOf(masked: string, from: number): [number, number] {
    let depth = 0;
    let j = from;
    while (j < masked.length) {
        const c = masked[j];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ';' && depth === 0) break;
        j++;
    }
    return [from, j];
}

type Proof = 'plain' | 'dicty';

/** Which proof the local's own declarations + writes support, if any. */
function proofOf(masked: string, raw: string, name: string, header: string): Proof | undefined {
    if (new RegExp('(?:^|[\\s,(])' + name + '\\s*:').test(header)) return undefined;
    if (new RegExp('(?:^|[^|A-Za-z0-9_])\\|\\s*(?:mut\\s+)?(?:[A-Za-z_][A-Za-z0-9_]*\\s*(?::[^|]*?)?,?\\s*)+\\|').test(masked)) {
        // a closure's parameter list: only reject when it binds this name
        const lists = masked.match(/\|\s*(?:mut\s+)?[A-Za-z_][A-Za-z0-9_]*\s*(?:,[^|]*)?\|/g) ?? [];
        for (const l of lists) {
            if (new RegExp('\\b' + name + '\\b').test(l.replace(/::[A-Za-z0-9_:]*/g, ''))) return undefined;
        }
    }
    if (new RegExp('\\bfor\\s+' + name + '\\s+in\\b').test(masked)) return undefined;
    if (new RegExp('\\b(?:Some|Ok|Err|Value::(?:Dict|Arr|Str|Int|Float|Bool))\\(\\s*(?:mut\\s+)?' + name + '\\s*[),]').test(masked)) return undefined;
    const declRe = new RegExp('let (?:mut )?' + name + '(?:: Value)? = ', 'g');
    let cls: Proof | undefined;
    let decls = 0;
    let dm: RegExpExecArray | null;
    while ((dm = declRe.exec(masked)) !== null) {
        decls++;
        const span = initOf(masked, dm.index + dm[0].length);
        const init = raw.slice(span[0], span[1]).trim();
        const this_cls: Proof | undefined = PLAIN_INIT.test(init) ? 'plain' : (DICT_INIT.test(init) ? 'dicty' : undefined);
        if (this_cls === undefined) return undefined;
        if (cls === undefined) cls = this_cls;
        else if (this_cls === 'dicty') cls = 'dicty';
    }
    if (decls === 0 || cls === undefined) return undefined;
    // Rebinds keep it a Dict; a `&mut` may only reach a keyed write helper,
    // none of which changes the variant.
    const assignRe = new RegExp('(?<![&A-Za-z0-9_.])' + name + '\\s*=(?!=)', 'g');
    let am: RegExpExecArray | null;
    while ((am = assignRe.exec(masked)) !== null) {
        const span = initOf(masked, am.index + am[0].length);
        const rhs = raw.slice(span[0], span[1]).trim();
        if (/^Value::Map\(/.test(rhs) || /^Value::Null\b/.test(rhs)) continue;
        // Another Dict-guaranteed source keeps the variant but loses the
        // marker-free proof.
        if (DICT_INIT.test(rhs)) { cls = 'dicty'; continue; }
        return undefined;
    }
    const mutRe = new RegExp('&mut\\s+' + name + '\\b', 'g');
    let mm: RegExpExecArray | null;
    while ((mm = mutRe.exec(masked)) !== null) {
        const pre = masked.slice(Math.max(0, mm.index - 60), mm.index);
        // A keyed write helper, or the native insert a sibling pass already emitted.
        if (WRITE_HELPER.test(pre) || /(?:crate::)?Value::Dict\(\w+\)\s*=\s*$/.test(pre)) continue;
        return undefined;
    }
    return cls;
}

function runPass(content: string): string {
    if (!content.includes('get_value(') && !content.includes('in_op(')) return content;
    const masked = maskSrc(content);
    // Fn regions: a header starts a scope that ends where the next one starts.
    const starts: number[] = [];
    const headerRe = /(?:^|\n)[ \t]*(?:pub )?(?:async )?fn /g;
    let hm: RegExpExecArray | null;
    while ((hm = headerRe.exec(masked)) !== null) starts.push(hm.index + (hm[0][0] === '\n' ? 1 : 0));
    starts.push(content.length);
    const rewrites: Array<{ start: number, end: number, text: string }> = [];
    for (let h = 0; h + 1 < starts.length; h++) {
        const from = starts[h];
        const to = starts[h + 1];
        const region = masked.slice(from, to);
        const hit = region.indexOf('get_value(') >= 0 || region.indexOf('in_op(') >= 0;
        if (!hit) continue;
        const raw = content.slice(from, to);
        const header = region.slice(0, region.indexOf('{') < 0 ? 200 : region.indexOf('{'));
        const proofs = new Map<string, Proof | undefined>();
        let cm: RegExpExecArray | null;
        CALL.lastIndex = 0;
        while ((cm = CALL.exec(region)) !== null) {
            const name = cm[1];
            const open = cm.index + name.length;
            const end = callEnd(region, open);
            if (end < 0) continue;
            const spans = argSpans(region, open);
            if (spans.length !== 2) continue;
            const recvRaw = raw.slice(spans[0][0], spans[0][1]).trim();
            const recvMasked = region.slice(spans[0][0], spans[0][1]).trim();
            const ident = /^&\s*([A-Za-z_][A-Za-z0-9_]*)$/.exec(recvMasked);
            if (ident === null) continue;
            const local = ident[1];
            if (recvRaw !== '&' + local) continue;
            if (!proofs.has(local)) proofs.set(local, proofOf(region, raw, local, header));
            const proof = proofs.get(local);
            if (proof === undefined) continue;
            const keyRaw = raw.slice(spans[1][0], spans[1][1]).trim();
            const lit = STR_LIT.exec(keyRaw);
            let key: string | undefined;
            if (lit !== null) {
                const k = lit[1];
                if (ROUTED.test(k) || /^[0-9]+$/.test(k)) continue;
                key = '"' + k + '"';
            } else {
                if (proof !== 'plain') continue;
                const dyn = /^&\s*(.+)$/s.exec(keyRaw);
                if (dyn === null) continue;
                if (/^(?:crate::)?Value::(?:Str|Int|Float|Bool|Null)\b/.test(dyn[1].trim())) continue;
                key = dyn[1].trim();
            }
            const dynKey = key.startsWith('"') ? undefined : key;
            const text = cm[1] === 'get_value'
                ? `${local}.as_map().and_then(|__m| ${dynKey === undefined ? `__m.get(${key})` : `${dynKey}.as_str().and_then(|__k| __m.get(__k))`}).cloned().unwrap_or(Value::Null)`
                : `${local}.as_map().is_some_and(|__m| ${dynKey === undefined ? `__m.contains_key(${key})` : `${dynKey}.as_str().is_some_and(|__k| __m.contains_key(__k))`})`;
            const start = from + cm.index;
            const stop = from + end;
            // Keep >400-char line count from rising.
            const lineStart = content.lastIndexOf('\n', start) + 1;
            const lineStop = content.indexOf('\n', stop);
            const lineLen = (lineStop < 0 ? content.length : lineStop) - lineStart;
            if (lineLen <= 400 && lineLen - (stop - start) + text.length > 400) continue;
            rewrites.push({ start, end: stop, text });
        }
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

export function r08DictReads(content: string): string {
    // A rewritten read can become the receiver of a later one; one extra round
    // per nesting level is enough (deeper chains stay helper calls).
    let out = content;
    for (let i = 0; i < 2; i++) {
        const next = runPass(out);
        if (next === out) break;
        out = next;
    }
    return out;
}

export default r08DictReads;
