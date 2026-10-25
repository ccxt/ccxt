/**
 * hx10 wave-2 R02 — native `insert` for `add_element_to_object` /
 * `get_value_mut` write chains on a receiver whose static shape is proven
 * tag-free in the emitted Rust text.
 *
 * `add_element_to_object` and `get_value_mut` only do extra work on a dict
 * carrying one of the runtime's `__` tags (`__book_id`, `__ws_subs_url`,
 * `__sub_ref`, `__cache_backref`); on any other receiver they are exactly
 * `Arc::make_mut(m).insert(key, val)` and `entry(key).or_insert(Value::Null)`.
 * So a receiver that provably never carries a tag (a hand-written base field
 * the runtime never tags, or a local whose every binding is a fresh literal
 * and whose function contains no `"__` literal) prints natively.
 */

const CALL = 'add_element_to_object(';

// Hand-written `Exchange` fields the runtime never tags.
const TAGFREE_FIELDS = new Set([
    'balance', 'orderbooks', 'trades', 'tickers', 'bidsasks', 'ohlcvs', 'clients', 'transactions',
    'headers', 'currencies', 'has', 'tokenBucket', 'options', 'markets', 'urls', 'positions',
    'fees', 'exceptions', 'markets_by_id', 'currencies_by_id',
]);

// Fields whose *entries* may themselves be books / caches / subscriptions, so a
// nested write into an entry has to keep the helper's tag hooks.
const NEST_FIELDS = new Set([
    'options', 'urls', 'fees', 'exceptions', 'markets', 'currencies', 'headers', 'has',
    'tokenBucket', 'markets_by_id', 'currencies_by_id',
]);

// A function that reads any of these can hold a tagged value in a local.
const TAG_ACCESS = [
    'self.orderbooks', 'self.balance', 'self.ohlcvs', 'self.tickers', 'self.trades',
    'self.bidsasks', 'self.positions', 'self.clients', 'self.transactions',
    '"subscriptions"', '"futures"', '"cache"', '.hashmap',
    'self.order_book(', 'self.order_book_side(',
];

// Base builders that return a freshly built plain dict.
const BUILDERS = new Set(['account', 'safe_ledger_entry', 'deposit_withdraw_fee']);

// Copy-on-write of a proven tag-free source keeps the result tag-free.
const EXTENDERS = new Set(['extend', 'omit', 'keysort']);

// Parser methods whose return value is a fresh plain dict; the trait shims for
// these forward to a per-exchange `*Core` impl, so the body is not always in the
// calling file.
const PARSERS = new Set([
    'parse_order', 'parse_ws_order', 'parse_trade', 'parse_ws_trade', 'parse_ticker',
    'parse_ws_ticker', 'parse_position', 'parse_ws_position', 'parse_balance', 'parse_market',
    'parse_currency', 'parse_transaction', 'parse_ledger_entry', 'parse_deposit_withdraw_fee',
    'parse_account', 'parse_funding_rate', 'parse_open_interest', 'parse_liquidation',
    'parse_borrow_rate', 'parse_income',
]);

const LITERAL_KEY = /^&Value::Str\(("(?:[^"\\]|\\.)*")\.(?:into|to_string)\(\)\)$/;
const PLACE_KEY = /^&([A-Za-z_][A-Za-z0-9_]*)$/;
const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

interface Region { start: number, end: number }

function isWordChar (c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_';
}

/** Split on top-level commas, honouring strings and bracket nesting. */
function splitArgs (text: string): string[] | undefined {
    const out: string[] = [];
    let depth = 0, inStr = false, esc = false, cur = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inStr) {
            if (esc) esc = false;
            else if (c === '\\') esc = true;
            else if (c === '"') inStr = false;
            continue;
        }
        if (c === '"') { inStr = true; continue; }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { out.push(text.slice(cur, i)); cur = i + 1; }
    }
    out.push(text.slice(cur));
    return out.length > 0 ? out : undefined;
}

/** Index just past the closing `)` of the call whose `(` is at `open`. */
function closeParenAt (content: string, open: number): number {
    let depth = 0, inStr = false, esc = false;
    for (let i = open; i < content.length; i++) {
        const c = content[i];
        if (inStr) {
            if (esc) esc = false;
            else if (c === '\\') esc = true;
            else if (c === '"') inStr = false;
            continue;
        }
        if (c === '"') { inStr = true; continue; }
        if (c === '(') depth++;
        else if (c === ')') {
            depth--;
            if (depth === 0) return i + 1;
        }
    }
    return -1;
}

/** Function bodies, sliced from one `fn` header line to the next. */
function fnRegions (content: string): Region[] {
    const headers: number[] = [];
    const rx = /^[ \t]*(?:pub )?(?:async )?fn [A-Za-z0-9_]+/gm;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(content)) !== null) headers.push(m.index);
    const out: Region[] = [];
    for (let i = 0; i < headers.length; i++) {
        out.push({ start: headers[i], end: i + 1 < headers.length ? headers[i + 1] : content.length });
    }
    return out;
}

function regionAt (regions: Region[], pos: number): Region | undefined {
    let lo = 0, hi = regions.length - 1, hit: Region | undefined;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (regions[mid].start <= pos) { hit = regions[mid]; lo = mid + 1; } else hi = mid - 1;
    }
    return hit && pos < hit.end ? hit : undefined;
}

/** First argument of the call spelled at `text`, or undefined when truncated. */
function firstArg (text: string): string | undefined {
    const open = text.indexOf('(');
    if (open < 0) return undefined;
    let depth = 0, inStr = false, esc = false;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (inStr) {
            if (esc) esc = false;
            else if (c === '\\') esc = true;
            else if (c === '"') inStr = false;
            continue;
        }
        if (c === '"') { inStr = true; continue; }
        if (c === '(') depth++;
        else if (c === ')') { depth--; if (depth === 0) return text.slice(open + 1, i); }
        else if (c === ',' && depth === 1) return text.slice(open + 1, i);
    }
    return undefined;
}

class Proof {
    content: string;
    regions: Region[];
    calls = new Map<number, boolean>();
    locals = new Map<string, boolean>();

    constructor (content: string, regions: Region[]) {
        this.content = content;
        this.regions = regions;
    }

    /** A local whose every binding is a fresh tag-free literal. */
    localTagFree (name: string, body: string, region: Region, depth = 0): boolean {
        if (depth > 2) return false;
        const key = region.start + ':' + name;
        if (depth === 0) {
            const cached = this.locals.get(key);
            if (cached !== undefined) return cached;
        }
        const verdict = this.localTagFreeUncached(name, body, region, depth);
        if (depth === 0) this.locals.set(key, verdict);
        return verdict;
    }

    private localTagFreeUncached (name: string, body: string, region: Region, depth: number): boolean {
        if (body.includes('"__')) return false;
        const decl = new RegExp('^[ \\t]*let mut ' + name + '[ \\t]*:[ \\t]*Value\\b(.*)$', 'gm');
        const bare = new RegExp('^[ \\t]*let mut ' + name + '[ \\t]*=(.*)$', 'gm');
        const bound = new RegExp('(^|[^.\\w])' + name + '[ \\t]*=(?!=)(.*)$', 'gm');
        const sources: string[] = [];
        let sawBind = false;
        let m: RegExpExecArray | null;
        while ((m = bare.exec(body)) !== null) {
            sawBind = true;
            sources.push(m[1]);
        }
        while ((m = decl.exec(body)) !== null) {
            sawBind = true;
            const rest = m[1].trim();
            if (rest.length > 0) {
                if (rest[0] !== '=') return false;
                sources.push(rest.slice(1));
            }
        }
        if (!sawBind) return false;
        while ((m = bound.exec(body)) !== null) sources.push(m[2]);
        for (const src of sources) {
            if (!this.srcTagFree(src, body, region, depth)) return false;
        }
        return true;
    }

    /** A value expression that can only be a fresh plain dict. */
    srcTagFree (src: string, body: string, region: Region, depth = 0): boolean {
        const t = src.trim();
        if (depth > 2) return false;
        if (t.startsWith('Value::Map(')) return true;
        if (t.startsWith('Value::Null')) return true;
        const callee = t.match(/^self\.([A-Za-z_][A-Za-z0-9_]*)[ \t]*\(/);
        if (callee === null) return false;
        const name = callee[1];
        if (BUILDERS.has(name) || PARSERS.has(name)) return true;
        if (EXTENDERS.has(name)) {
            const arg = firstArg(t);
            if (arg === undefined) return false;
            const head = arg.trim();
            if (IDENT.test(head)) return this.localTagFree(head, body, region, depth + 1);
            return this.srcTagFree(head, body, region, depth + 1);
        }
        return this.calleePlain(name, region);
    }

    /** Same-file method whose only `return` is a proven tag-free local. */
    calleePlain (name: string, caller: Region): boolean {
        const key = caller.start;
        const cache = this.calls.get(key * 100000 + (name.charCodeAt(0) || 0));
        if (cache !== undefined) return cache;
        let verdict = false;
        for (const r of this.regions) {
            const body = this.content.slice(r.start, r.end);
            const header = body.slice(0, body.indexOf('\n') < 0 ? body.length : body.indexOf('\n'));
            if (!new RegExp('fn ' + name + '\\s*\\(').test(header)) continue;
            if (body.includes('"__')) continue;
            const ret = body.match(/^[ \t]*return ([A-Za-z_][A-Za-z0-9_]*);/m);
            if (ret !== null) {
                if (this.localTagFree(ret[1], body, r)) { verdict = true; break; }
                continue;
            }
            if (new RegExp('\\b[A-Za-z0-9_]+Core::' + name + '\\(').test(body)) { verdict = true; break; }
        }
        this.calls.set(key * 100000 + (name.charCodeAt(0) || 0), verdict);
        return verdict;
    }
}

/** Arguments of `text` when it is exactly one `<name>(...)` call. */
function callArgs (text: string, name: string): string[] | undefined {
    if (!text.startsWith(name + '(')) return undefined;
    const after = closeParenAt(text, name.length);
    if (after !== text.length) return undefined;
    return splitArgs(text.slice(name.length + 1, after - 1));
}

function keyConv (arg: string, intermediate: boolean): string | undefined {
    const lit = arg.trim().match(LITERAL_KEY);
    if (lit !== null) return lit[1] + '.to_string()';
    if (intermediate) return undefined;
    const place = arg.trim().match(PLACE_KEY);
    if (place !== null) return 'crate::runtime::stringify_param(&' + place[1] + ')';
    return undefined;
}

/**
 * Rewrite `x[k] = v` / nested `x[a][b] = v` writes on a proven tag-free
 * receiver into the native `insert` the helper performs on one.
 */
export function r02NativeInserts (content: string): string {
    if (!content.includes(CALL)) return content;
    const regions = fnRegions(content);
    const proof = new Proof(content, regions);
    const edits: { start: number, end: number, text: string }[] = [];
    let i = 0;
    while (true) {
        const at = content.indexOf(CALL, i);
        if (at < 0) break;
        i = at + 1;
        if (at > 0 && isWordChar(content[at - 1])) continue;
        const open = at + CALL.length - 1;
        const after = closeParenAt(content, open);
        if (after < 0) break;
        const args = splitArgs(content.slice(open + 1, after - 1));
        if (args === undefined || args.length !== 3) continue;
        const region = regionAt(regions, at);
        if (region === undefined) continue;
        const body = content.slice(region.start, region.end);
        // Receiver: `&mut X` possibly wrapped in `get_value_mut` chains.
        const chain: string[] = [];
        let cur = args[0].trim();
        let ok = true;
        while (true) {
            const outer = callArgs(cur, 'get_value_mut');
            if (outer === undefined || outer.length !== 2) break;
            const inner = outer[0].trim();
            if (!inner.startsWith('&mut ')) break;
            chain.push(outer[1].trim());
            cur = inner.slice(5).trim();
        }
        let base: string;
        let place: string;
        if (cur.startsWith('&mut ')) { base = cur.slice(5).trim(); place = '&mut ' + base; }
        else if (cur.startsWith('unsafe {')) {
            const coerce = cur.match(/^unsafe \{ (crate::runtime::coerce_value_to_mut\(&self\.[A-Za-z_][A-Za-z0-9_]*\)) \}$/);
            if (coerce === null) continue;
            place = cur;
            base = coerce[1].replace('coerce_value_to_mut(&self.', 'self.').replace(/\)$/, '');
        }
        else if (/^(?:self\.)?[A-Za-z_][A-Za-z0-9_]*$/.test(cur)) { base = cur; place = '&mut ' + cur; }
        else continue;
        const field = base.match(/^self\.([A-Za-z_][A-Za-z0-9_]*)$/);
        const local = base.match(/^([A-Za-z_][A-Za-z0-9_]*)$/);
        if (field !== null) {
            const name = field[1];
            if (!TAGFREE_FIELDS.has(name)) continue;
            if (chain.length > 0 && !NEST_FIELDS.has(name)) continue;
        }
        else if (local !== null) {
            if (!proof.localTagFree(local[1], body, region)) continue;
            // A nested write reaches a value the function may have taken off a
            // tagged cache / book / subscription snapshot.
            if (chain.length > 0 && TAG_ACCESS.some(t => body.includes(t))) continue;
        }
        else continue;
        const keys: string[] = [];
        for (const k of chain.reverse()) {
            const conv = keyConv(k, true);
            if (conv === undefined) { ok = false; break; }
            keys.push(conv);
        }
        if (!ok) continue;
        const last = keyConv(args[1], false);
        if (last === undefined) continue;
        const value = args[2].trim();
        // A write holds a `&mut`/`&self` borrow of the receiver: evaluate a
        // value that reads it into a temp first, exactly like the printer does.
        const receiverName = field !== null ? field[1] : (local !== null ? local[1] : '');
        const readsReceiver = field !== null
            ? /\bself\b/.test(value)
            : new RegExp('\\b' + receiverName + '\\b').test(value);
        if (keys.length > 9) continue;
        // Letter-only bindings keep the shape the sibling passes recognise as a
        // mutation statement (`if let Value::Dict(__<letters>) = `).
        const tag = (i: number) => '__rd' + 'abcdefghij'[i];
        let insert = 'std::sync::Arc::make_mut(' + tag(keys.length) + ').insert(' + last + ', ' + value + ');';
        for (let d = keys.length - 1; d >= 0; d--) {
            insert = 'if let Value::Dict(' + tag(d + 1) + ') = std::sync::Arc::make_mut(' + tag(d) + ').entry(' + keys[d] + ').or_insert(Value::Null) { ' + insert + ' }';
        }
        let native = 'if let Value::Dict(' + tag(0) + ') = ' + place + ' { ' + insert + ' }';
        if (readsReceiver) native = '{ let __rdt = ' + value + '; ' + native.replace(', ' + value + ');', ', __rdt);') + ' }';
        // Keep the 400-column census flat: skip a site whose native form would
        // introduce a long line that the helper call did not have.
        const lineStart = content.lastIndexOf('\n', at) + 1;
        let lineEnd = content.indexOf('\n', after);
        if (lineEnd < 0) lineEnd = content.length;
        const before = content.slice(lineStart, lineEnd);
        let suffix = content.slice(after, lineEnd);
        if (suffix.startsWith(';')) suffix = suffix.slice(1);
        const merged = content.slice(lineStart, at) + native + suffix;
        if (before.length <= 400 && merged.length > 400) continue;
        edits.push({ start: at, end: after, text: native });
    }
    if (edits.length === 0) return content;
    let out = '';
    let pos = 0;
    for (const e of edits) {
        out += content.slice(pos, e.start) + e.text;
        let p = e.end;
        while (p < content.length && (content[p] === ' ' || content[p] === '\t')) p++;
        if (p < content.length && content[p] === ';') p++;
        pos = p;
    }
    out += content.slice(pos);
    return out;
}
