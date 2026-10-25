// hx10 wave-2 R08 -- native ops on the Rust exchange's own runtime state.
//
// The base `Exchange` fields that hold plain, tag-free state (`options`,
// `urls`, `markets`, `balance`, the cache *containers* `ohlcvs`/`tickers`/…)
// are `Value::Map`s owned by the exchange instance: the runtime never writes a
// `__cacheKind` / `__book_id` / `__ws_subs_url` / `__live_id` marker into them,
// so each helper reduces to the stdlib op on the proven variant:
//
//   get_value(&self.F, &Value::Str("k"..)) -> F.as_map().and_then(|__m| __m.get("k")).cloned().unwrap_or(Value::Null)
//   get_value(&self.F, &KEY)               -> F.as_map().and_then(|__m| KEY.as_str().and_then(|__k| __m.get(__k))).cloned().unwrap_or(Value::Null)
//   in_op(&self.F, &Value::Str("k"..))     -> F.as_map().is_some_and(|__m| __m.contains_key("k"))
//   in_op(&self.F, &KEY)                   -> F.as_map().is_some_and(|__m| KEY.as_str().is_some_and(|__k| __m.contains_key(__k)))
//   add_element_to_object(&mut self.F, &Value::Str("k"..), V)
//                                          -> if let Value::Dict(__d) = &mut self.F { Arc::make_mut(__d).insert(..) }
//   add_element_to_object(get_value_mut(&mut self.F, &Str("k1")), &Str("k2"), V)
//                                          -> entry(k1).or_insert(Null) then insert(k2, V)
//
// The same reads on a value already fetched from one of those fields go native
// too, but only for a literal key the runtime does not route to a marker store.
//
// Everything else keeps the helper call exactly as printed: ws
// `client.subscriptions`/`futures` (live overlay), cache *markers* and order
// books (side stores), `remove` (write-through), computed keys
// (`stringify_simple`), and `&mut get_value(..)` write-throughs.

const FIELDS_ARR = ['options', 'urls', 'markets', 'markets_by_id', 'currencies', 'currencies_by_id',
    'commonCurrencies', 'baseCurrencies', 'quoteCurrencies', 'timeframes', 'precision',
    'limits', 'fees', 'has', 'exceptions', 'features', 'api', 'accounts', 'accountsById',
    'tokenBucket', 'headers', 'requiredCredentials', 'networkAliases', 'balance', 'positions',
    'ohlcvs', 'tickers', 'bidsasks', 'orderbooks', 'trades', 'orders', 'myTrades',
    'liquidations', 'myLiquidations', 'fundingRates', 'triggerOrders', 'transactions',
    'clients'];

// Fields whose values are always plain dicts (never a cache marker or a client
// handle), so a read chained through them may take any key.
const PLAIN_VALUES = /^(?:options|urls|markets|markets_by_id|currencies|currencies_by_id|commonCurrencies|baseCurrencies|quoteCurrencies|timeframes|precision|limits|fees|has|exceptions|features|api|accounts|accountsById|tokenBucket|headers|requiredCredentials|networkAliases|balance|transactions)$/;

// Keys the runtime routes to a marker's side store (mirrors the printer's set).
// Fields whose values are cache markers / client handles — Dicts by construction.
const DICT_VALUES = /^(?:ohlcvs|tickers|bidsasks|orderbooks|trades|orders|myTrades|liquidations|myLiquidations|fundingRates|triggerOrders|positions|clients)$/;

const MARKER_KEYS = /^(?:timestamp|datetime|nonce|symbol|checksum|cache|hashmap|subscriptions|futures)$/;

const RECV = 'self\\.(?:(?:core|parent)\\.)*(' + FIELDS_ARR.join('|') + ')';
const STR_KEY = '&Value::Str\\("((?:[^"\\\\]|\\\\.)*)"\\.(?:into|to_string)\\(\\)\\)';
const NATIVE_TAIL = /\.cloned\(\)\.unwrap_or\(Value::Null\)$/;
const NULL = 'Value::Null';

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
        if (c === "'" ) {
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

type Recv = { text: string, chained: boolean };

/** The receiver as runtime state: a base field, or a value read out of one. */
function receiverOf(arg: string): Recv | undefined {
    const e = arg.trim().replace(/^&\s*/, '').trim();
    const direct = new RegExp('^' + RECV + '$');
    if (direct.test(e)) return { text: e, chained: false };
    const head = new RegExp('^' + RECV + '\\.as_map\\(\\)\\.and_then\\(\\|__m\\|');
    if (head.test(e) && NATIVE_TAIL.test(e)) return { text: e, chained: true };
    return undefined;
}

/** Root field name of a `self[.core|.parent].F…` expression. */
function rootField(text: string): string {
    const m = new RegExp('^' + RECV).exec(text.trim());
    return m === null ? '' : m[1];
}

interface Rw { start: number, end: number, text: string }

function runPass(content: string): string {
    if (!content.includes('self.')) return content;
    const masked = maskSrc(content);
    const callRe = /(?<![A-Za-z0-9_:.])(add_element_to_object|get_value|in_op)\(/g;
    const rws: Rw[] = [];
    let m: RegExpExecArray | null;
    while ((m = callRe.exec(masked)) !== null) {
        const name = m[1];
        const open = m.index + name.length;
        const spans = argSpans(masked, open);
        if (spans === undefined) continue;
        const end = callEnd(masked, open);
        if (end < 0) continue;
        const raw = spans.map(function (sp) { return content.slice(sp[0], sp[1]).trim(); });

        if (name === 'get_value' || name === 'in_op') {
            if (spans.length !== 2) continue;
            const recv = receiverOf(raw[0]);
            if (recv === undefined) continue;
            if (/&mut\s*$/.test(masked.slice(Math.max(0, m.index - 5), m.index))) continue;
            const plainValues = PLAIN_VALUES.test(rootField(recv.text));
            const lit = new RegExp('^' + STR_KEY + '$').exec(raw[1]);
            if (lit !== null) {
                const k = lit[1];
                if (recv.chained && !plainValues && (k === '' || /^[0-9]+$/.test(k) || MARKER_KEYS.test(k))) continue;
                rws.push({
                    start: m.index, end: end,
                    text: name === 'get_value'
                        ? recv.text + '.as_map().and_then(|__m| __m.get("' + k + '")).cloned().unwrap_or(' + NULL + ')'
                        : recv.text + '.as_map().is_some_and(|__m| __m.contains_key("' + k + '"))',
                });
                continue;
            }
            // A variable key: the runtime reads it as a Str and yields Null for
            // anything else, which is `as_str()`. A fetched value may be an
            // array (numeric-string index) so only a field receiver qualifies;
            // `in_op` indexes arrays by value, so a value must be a proven Dict.
            if (recv.chained && (name === 'get_value' || !DICT_VALUES.test(rootField(recv.text)))) continue;
            const dynKey = /^&\s*(.+)$/.exec(raw[1]);
            if (dynKey === null) continue;
            const keyText = dynKey[1].trim();
            if (/^Value::(?:Str|Int|Float|Bool|Null)\(/.test(keyText) || keyText === 'Value::Null') continue;
            rws.push({
                start: m.index, end: end,
                text: name === 'get_value'
                    ? recv.text + '.as_map().and_then(|__m| ' + keyText + '.as_str().and_then(|__k| __m.get(__k))).cloned().unwrap_or(' + NULL + ')'
                    : recv.text + '.as_map().is_some_and(|__m| ' + keyText + '.as_str().is_some_and(|__k| __m.contains_key(__k)))',
            });
            continue;
        }
        // add_element_to_object -- statement form only (it yields no value)
        if (spans.length !== 3) continue;
        if (!isStatement(masked, m.index, end)) continue;
        const lit = new RegExp('^' + STR_KEY + '$').exec(raw[1]);
        if (lit === null) continue;
        const value = raw[2];
        if (/\bself\b/.test(value)) continue;
        const inner = new RegExp('^get_value_mut\\(\\s*&mut\\s+(' + RECV + ')\\s*,\\s*' + STR_KEY + '\\s*\\)$').exec(raw[0]);
        if (inner !== null) {
            rws.push({
                start: m.index, end: end,
                text: 'if let Value::Dict(__r08a) = &mut ' + inner[1]
                    + ' { let __r08e = std::sync::Arc::make_mut(__r08a).entry("' + inner[inner.length - 1] + '".to_string()).or_insert(' + NULL + ');'
                    + ' if let Value::Dict(__r08b) = __r08e { std::sync::Arc::make_mut(__r08b).insert("' + lit[1] + '".to_string(), ' + value + '); } }',
            });
            continue;
        }
        const direct = new RegExp('^&mut\\s+(' + RECV + ')$').exec(raw[0]);
        if (direct === null) continue;
        rws.push({
            start: m.index, end: end,
            text: 'if let Value::Dict(__r08d) = &mut ' + direct[1]
                + ' { std::sync::Arc::make_mut(__r08d).insert("' + lit[1] + '".to_string(), ' + value + '); }',
        });
    }
    if (rws.length === 0) return content;
    rws.sort(function (a, b) { return a.start - b.start; });
    let out = '';
    let at = 0;
    for (const r of rws) {
        if (r.start < at) continue;
        out += content.slice(at, r.start) + r.text;
        at = r.end;
    }
    return out + content.slice(at);
}

export function hx10w2R08(content: string): string {
    // Chains (`self.F[k1][k2]`) resolve one level per pass.
    let out = content;
    for (let i = 0; i < 3; i++) {
        const next = runPass(out);
        if (next === out) break;
        out = next;
    }
    return out;
}

export default hx10w2R08;
