// hx10w7 J01 - native `put` for Helpers.addElementToObject on a proven base map field.
// The field must be declared as a plain Map<String, Object> over a fresh (Linked)HashMap, no write to
// it in the tree may hold null, and the key must be a proven String at its declaration; every other
// shape keeps the unchanged helper call, so no map box is ever cast at the site. Writes to these
// caches now run on the exchange's single ws owner executor (OJ04), so a plain HashMap is safe.
// The nested `this.F.get(k1).put(k2, v)` form needs a map-valued field generic; the producers
// (safeBalance -> Balances, safeDict/GetValue -> Object) do not agree yet, so it stays a helper.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const J01W7_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
const J01W7_HEADERS = [ 'BaseExchange.java', 'PredictionExchange.java' ].map ((n) => path.join (J01W7_ROOT, n));
const J01W7_DELIM = '// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT';
const J01W7_CALL = 'Helpers.addElementToObject(';
const J01W7_DECL = /^[ \t]*public\s+Map<\s*String\s*,\s*Object\s*>\s+(\w+)\s*=\s*new\s+(?:java\.util\.)?(?:Linked)?HashMap\s*(?:<[^<>]*>)?\s*\(\s*\)\s*\{?\s*;?[ \t]*$/gm;
const J01W7_WRITE = /(?<![\w.$])this\.(\w+)\s*=(?![=>])/g;
// a write that builds a fresh plain map, or extends/copies the plain map the field already holds
const J01W7_PLAIN = /^(?:new\s+(?:java\.util\.)?(?:Linked)?HashMap\b|this\.createSafeDictionary\s*\(|this\.omit(?:Map)?\s*\(|this\.(?:safeBalance|parseBalance|parseWsBalance)\s*\(|this\.(?:extend|Extend|deepExtend)\s*\()/;
const J01W7_LOCAL_PLAIN = (name: string) => new RegExp (`(?<![\\w.$])${name}\\s*=\\s*(?:new\\s+(?:java\\.util\\.)?(?:Linked)?HashMap\\b|this\\.createSafeDictionary\\s*\\(|this\\.omit(?:Map)?\\s*\\(|this\\.(?:safeBalance|parseBalance|parseWsBalance)\\s*\\()`);
// calls whose every return in the port is a fresh map / a view over one, so the value is non-null
const J01W7_NONNULL_CALL = /^this\.(?:extend|Extend|deepExtend|omit|omitMap|safeBalance|parseBalance|parseWsBalance|createSafeDictionary|orderBook|indexedOrderBook)\s*\(/;

interface FieldSets { tier1: Set<string>; tier2: Set<string> }
let provenFields: FieldSets | undefined;

// same-length copy with string / char / comment bodies blanked, so structure scans never read them
function j01w7Mask (text: string): string {
    const out = text.split ('');
    const blank = (from: number, to: number) => {
        for (let k = from; k < to; k++) if (out[k] !== '\n') out[k] = ' ';
    };
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === "'") {
            let j = i + 1;
            while (j < text.length) {
                if (text[j] === '\\') { j += 2; continue; }
                if (text[j] === c) break;
                j++;
            }
            blank (i + 1, Math.min (j, text.length));
            i = j;
        } else if (c === '/' && text[i + 1] === '/') {
            let j = text.indexOf ('\n', i);
            if (j === -1) j = text.length;
            blank (i, j);
            i = j - 1;
        } else if (c === '/' && text[i + 1] === '*') {
            let j = text.indexOf ('*/', i + 2);
            j = j === -1 ? text.length : j + 2;
            blank (i, j);
            i = j - 1;
        }
    }
    return out.join ('');
}

// end index (inclusive) of the bracket that opens at `open`, literals skipped; -1 when unbalanced
function j01w7Close (text: string, open: number): number {
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

// top-level comma split; string literals and generic argument lists stay whole
function j01w7Split (text: string): string[] | undefined {
    const out: string[] = [];
    let depth = 0;
    let at = 0;
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
            const generic = /^<[\w.?,\s<>]*>/.exec (text.slice (i));
            if (generic !== null) { i += generic[0].length - 1; continue; }
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { out.push (text.slice (at, i).trim ()); at = i + 1; }
    }
    if (depth !== 0) return undefined;
    out.push (text.slice (at).trim ());
    return out;
}

function j01w7Files (dir: string, out: string[] = []): string[] {
    let names: string[] = [];
    try { names = fs.readdirSync (dir); } catch (e) { return out; }
    for (const name of names) {
        const full = path.join (dir, name);
        let stat;
        try { stat = fs.statSync (full); } catch (e) { continue; }
        if (stat.isDirectory ()) j01w7Files (full, out);
        else if (name.endsWith ('.java')) out.push (full);
    }
    return out;
}

// how a write to a field classifies: a fresh plain map, a value proven non-null but of an unproven
// map kind (tier 2 only), or something that may hold null (the field is dropped, helper only)
// every value assigned to `name`, terminated at the `;` that closes the statement at bracket depth 0
function j01w7WritesOf (masked: string, name: string): string[] {
    const out: string[] = [];
    const re = new RegExp (`(?<![\\w.$])${name}\\s*=(?![=>])`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec (masked)) !== null) {
        const at = m.index + m[0].length;
        let depth = 0;
        let end = -1;
        for (let i = at; i < masked.length; i++) {
            const c = masked[i];
            if (c === '(' || c === '[' || c === '{') depth++;
            else if (c === ')' || c === ']' || c === '}') depth--;
            else if (c === ';' && depth === 0) { end = i; break; }
        }
        if (end === -1) return out;
        out.push (masked.slice (at, end).trim ());
    }
    return out;
}

function j01w7StripCast (text: string): string {
    let v = text.trim ();
    for (;;) {
        const cast = /^\([\w.<>, ?\[\]]+\)\s*(.+)$/s.exec (v);
        if (cast === null) return v;
        v = cast[1]!.trim ();
    }
}

function j01w7WriteKind (rhs: string, masked: string, depth: number): 'plain' | 'nonnull' | 'null' {
    const v = j01w7StripCast (rhs);
    if (v === 'null' || v === 'undefined') return 'null';
    if (J01W7_PLAIN.test (v)) return 'plain';
    if (J01W7_NONNULL_CALL.test (v)) return 'nonnull';
    if (/^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v)) return 'nonnull';
    const safe = /^this\.(?:safeDict|safeMap|safeValue|safeList)\s*\(/.exec (v);
    if (safe !== null) {
        const close = j01w7Close (v, safe[0].length - 1);
        const call = close < 0 ? undefined : j01w7Split (v.slice (safe[0].length, close));
        const last = call === undefined ? undefined : call[call.length - 1];
        // the default must be a value the call itself builds; a field default proves nothing
        const builtDefault = last !== undefined && (/^new\s/.test (last) || J01W7_STR_LIT.test (last) || /^-?\d/.test (last));
        return call !== undefined && call.length >= 3 && builtDefault ? 'nonnull' : 'null';
    }
    if (depth < 2 && /^[A-Za-z_]\w*$/.test (v)) {
        const writes = j01w7WritesOf (masked, v);
        if (writes.length === 0) return 'null';
        const kinds = writes.map ((w) => j01w7WriteKind (w, masked, depth + 1));
        if (kinds.every ((k) => k === 'plain')) return 'plain';
        return kinds.every ((k) => k !== 'null') ? 'nonnull' : 'null';
    }
    return 'null';
}

// the helper's Map branch only differs from put for a null value on a ConcurrentHashMap, so the port
// must build none outside the fixed ws/owner caches before a plain field may take a null value
const J01W7_CHM = /new\s+(?:java\.util\.concurrent\.)?ConcurrentHashMap\b/;
const J01W7_CHM_OWNED = /(?:liquidations|myLiquidations|clients)\s*=\s*new\s+(?:java\.util\.concurrent\.)?ConcurrentHashMap/;
const J01W7_CHM_FILES = new Set ([ 'WsClient.java', 'ArrayCache.java' ]);
let concurrencyFree: boolean | undefined;

function j01w7NoConcurrent (): boolean {
    if (concurrencyFree !== undefined) return concurrencyFree;
    concurrencyFree = true;
    for (const file of j01w7Files (J01W7_ROOT)) {
        let raw = '';
        try { raw = fs.readFileSync (file, 'utf8'); } catch (e) { continue; }
        if (!J01W7_CHM.test (raw)) continue;
        if (J01W7_CHM_FILES.has (path.basename (file))) continue;
        for (const line of raw.split ('\n')) {
            if (J01W7_CHM.test (line) && !J01W7_CHM_OWNED.test (line)) { concurrencyFree = false; break; }
        }
        if (!concurrencyFree) break;
    }
    return concurrencyFree;
}

// Tier 1 comes from the header decl plus the tree's own writes; a write of an unknown map drops the
// field to tier 2, and a null write drops it outright (only the helper is safe on a null receiver).
function j01w7Fields (): FieldSets {
    if (provenFields !== undefined) return provenFields;
    const declared = new Set<string> ();
    for (const file of J01W7_HEADERS) {
        let header = '';
        try { header = fs.readFileSync (file, 'utf8').split (J01W7_DELIM)[0]; } catch (e) { continue; }
        for (const m of header.matchAll (J01W7_DECL)) declared.add (m[1]!);
    }
    const unknown = new Set<string> ();
    const nullable = new Set<string> ();
    const roots = fs.readdirSync (J01W7_ROOT).filter ((n) => n.endsWith ('.java')).map ((n) => path.join (J01W7_ROOT, n));
    for (const file of roots.concat (j01w7Files (path.join (J01W7_ROOT, 'exchanges')))) {
        let raw = '';
        try { raw = fs.readFileSync (file, 'utf8'); } catch (e) { continue; }
        if (!raw.includes ('this.')) continue;
        const masked = j01w7Mask (raw);
        for (const m of masked.matchAll (J01W7_WRITE)) {
            const field = m[1]!;
            if (!declared.has (field)) continue;
            const at = m.index + m[0].length;
            const end = masked.indexOf (';', at);
            const rhs = masked.slice (at, end === -1 ? Math.min (at + 200, masked.length) : end).trim ().split ('\n')[0]!.trim ();
            const kind = j01w7WriteKind (rhs, j01w7Member (masked, m.index), 0);
            if (kind === 'plain') continue;
            if (kind === 'nonnull') { unknown.add (field); continue; }
            nullable.add (field);
        }
    }
    const tier1 = new Set<string> ();
    const tier2 = new Set<string> ();
    const noConcurrent = j01w7NoConcurrent ();
    for (const field of declared) {
        if (nullable.has (field)) continue;
        if (noConcurrent) tier1.add (field);
        else if (unknown.has (field)) tier2.add (field);
        else tier1.add (field);
    }
    provenFields = { tier1, tier2 };
    return provenFields;
}

// the member (or constructor) a site sits in, so a field write or a local shadow can veto this site
function j01w7Member (content: string, at: number): string {
    const head = /^ {4}(?:public|private|protected)\b/gm;
    let start = 0;
    let end = content.length;
    let m: RegExpExecArray | null;
    while ((m = head.exec (content)) !== null) {
        if (m.index <= at) start = m.index;
        else { end = m.index; break; }
    }
    return content.slice (start, end);
}

const J01W7_STR_LIT = /^"(?:[^"\\]|\\.)*"$/;

function j01w7Unparen (text: string): string {
    let t = text.trim ();
    for (;;) {
        if (!t.startsWith ('(')) return t;
        const close = j01w7Close (t, 0);
        if (close !== t.length - 1) return t;
        t = t.slice (1, -1).trim ();
    }
}

function j01w7KeyIsString (member: string, key: string): boolean {
    if (J01W7_STR_LIT.test (key)) return true;
    // a cast key is a box cast at the site: only literals and String-typed locals qualify
    if (!/^[A-Za-z_]\w*$/.test (key)) return false;
    const escaped = key.replace (/[$]/g, '\\$&');
    const declared = [ ...member.matchAll (new RegExp (`(?<![\\w.$])(?:final\\s+)?((?:[a-z]+\\.)*[A-Z]\\w*(?:<[^<>]*>)?)\\s+${escaped}\\s*(?=[=;,):])`, 'g')) ].map ((d) => d[1]!);
    return declared.length > 0 && declared.every ((d) => d === 'String');
}

// a value the helper's Map branch stores exactly as put stores it; null is only safe on a tier-1 field
function j01w7NonNull (member: string, value: string, depth: number): boolean {
    const v = j01w7Unparen (value);
    if (J01W7_STR_LIT.test (v) || /^-?\d+(?:\.\d+)?[LD]?$/.test (v) || v === 'true' || v === 'false') return true;
    if (v === 'null' || v === 'undefined') return false;
    if (/^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v)) return true;
    if (J01W7_NONNULL_CALL.test (v)) return true;
    const cast = /^\([\w.<>, ?\[\]]+\)\s*(.+)$/s.exec (v);
    if (cast !== null && depth < 3) return j01w7NonNull (member, cast[1]!, depth + 1);
    if (depth < 2 && /^[A-Za-z_]\w*$/.test (v)) {
        const writes = j01w7WritesOf (j01w7Mask (member), v);
        return writes.length > 0 && writes.every ((w) => j01w7NonNull (member, w, depth + 1));
    }
    return false;
}









// a cast anywhere in an operand is a box cast at the site, so such a site keeps the helper call
function j01w7CastFree (text: string): boolean {
    return !/\((?:final\s+)?(?:[A-Z][\w.]*|(?:java|io|com)\.[\w.]+)(?:<[^()]*>)?\)/.test (text);
}

// Only a ws handler member runs on the exchange's single owner executor (OJ04). Any other member
// (watch*, load*Snapshot on spawn's virtual executor, setSandboxMode) can write the same map from
// another thread, so there the helper keeps the map's monitor and the site stays unchanged.
const J01W7_OWNER_MEMBER = /^(?:handle[A-Z]\w*|parseWSBalances)$/;

function j01w7OwnerMember (member: string): boolean {
    const head = /^ {4}(?:public|private|protected)[^\n]*$/m.exec (member);
    if (head === null) return false;
    const name = /\b(\w+)\s*\(/.exec (head[0])?.[1];
    return name !== undefined && J01W7_OWNER_MEMBER.test (name);
}

interface FieldOptions { sets?: FieldSets }


export function j01w7FieldPuts (content: string, options: FieldOptions = {}): string {
    if (typeof content !== 'string' || !content.includes (J01W7_CALL)) return content;
    const sets = options.sets ?? j01w7Fields ();
    if (sets.tier1.size === 0 && sets.tier2.size === 0) return content;
    const callHead = J01W7_CALL.length;
    let out = '';
    let at = 0;
    for (;;) {
        const i = content.indexOf (J01W7_CALL, at);
        if (i < 0) { out += content.slice (at); break; }
        const lineStart = content.lastIndexOf ('\n', i) + 1;
        const indent = content.slice (lineStart, i);
        const open = i + callHead - 1;
        const close = j01w7Close (content, open);
        if (close < 0) { out += content.slice (at); break; }
        out += content.slice (at, i);
        const lineEnd = content.indexOf ('\n', close + 1);
        const rest = content.slice (close + 1, lineEnd === -1 ? content.length : lineEnd);
        const args = j01w7Split (content.slice (open + 1, close));
        const receiver = args !== undefined && args.length === 3 ? /^this\.(\w+)$/.exec (args[0]!) : null;
        const standalone = /^[ \t]*$/.test (indent) && /^;\s*$/.test (rest);
        let text: string | undefined;
        if (receiver !== null && standalone && args !== undefined) {
            const name = receiver[1]!;
            const tier1 = sets.tier1.has (name);
            const tier2 = sets.tier2.has (name);
            if (tier1 || tier2) {
                const member = j01w7Member (content, i);
                // a tier-1 field is plain and non-null at every line of the member, so a write of the
                // field elsewhere in it changes nothing here; only a tier-2 field needs the veto
                const selfWrite = !tier1 && new RegExp (`(?<![\\w.$])this\\.${name}\\s*=(?![=>])`).test (member);
                const stringKey = j01w7KeyIsString (member, args[1]!);
                if (!selfWrite && stringKey && j01w7OwnerMember (member) && j01w7CastFree (args[1]!) && j01w7CastFree (args[2]!) && (tier1 || j01w7NonNull (member, args[2]!, 0))) {
                    // proven String key on a proven plain map field: the helper's Map branch is exactly put
                    text = `this.${name}.put(${args[1]}, ${args[2]})`;
                }
            }
        }
        out += text ?? content.slice (i, close + 1);
        at = close + 1;
    }
    return out;
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function j01w7FieldPutsSelfTest (): string[] {
    const problems: string[] = [];
    const sets: FieldSets = { tier1: new Set ([ 'balance', 'tickers', 'orderbooks' ]), tier2: new Set ([ 'trades' ]) };
    const run = (body: string, signature = 'Object v', member = 'handleZz') => j01w7FieldPuts (
        `public class ZzJ01 extends BaseExchange\n{\n    public Object ${member}(${signature})\n    {\n${body}\n    }\n}`,
        { sets });
    const cases: [string, string, string | undefined, string | undefined, string | undefined][] = [
        [ 'literal key nullable value on tier 1', '        Helpers.addElementToObject(this.tickers, "BTC/USDT", ticker);', 'this.tickers.put("BTC/USDT", ticker);', 'Object ticker' ],
        [ 'String key from a String local', '        String type = this.safeString(v, "t");\n        Helpers.addElementToObject(this.balance, type, this.iso8601(v));', 'this.balance.put(type, this.iso8601(v));' ],
        [ 'String cast key', '        Helpers.addElementToObject(this.orderbooks, (String) v, this.orderBook(new HashMap<String, Object>() {{}}, v));', undefined ],
        [ 'null value is the helper put on tier 1', '        Helpers.addElementToObject(this.balance, "timestamp", null);', 'this.balance.put("timestamp", null);' ],
        [ 'non-null value on tier 2', '        Helpers.addElementToObject(this.trades, "BTC/USDT", this.extend(v, new HashMap<String, Object>() {{}}));', 'this.trades.put("BTC/USDT", this.extend(v, new HashMap<String, Object>() {{}}));' ],
        // the helper stays: null value on tier 2, an Object/map-element key, an unproven field, a local demotion
        [ 'null-ish value on tier 2', '        Helpers.addElementToObject(this.trades, "BTC/USDT", v);', undefined ],
        [ 'Object key on tier 1', '        Object symbol = v;\n        Helpers.addElementToObject(this.tickers, symbol, ticker);', undefined ],
        [ 'cast in the value', '        Helpers.addElementToObject(this.balance, "info", ((Map<String, Object>) response).get("info"));', undefined ],
        [ 'cast key', '        Helpers.addElementToObject(this.orderbooks, (String) v, this.orderBook());', undefined ],
        [ 'map-element key on tier 1', '        Helpers.addElementToObject(this.orderbooks, market.get("symbol"), this.orderBook(new HashMap<String, Object>() {{}}, v));', undefined ],
        [ 'Object key on tier 2', '        Object code = v;\n        Helpers.addElementToObject(this.trades, code, "x");', undefined ],
        [ 'unproven field', '        Helpers.addElementToObject(this.has, "fetchOrder", true);', undefined ],
        [ 'field written in the member on tier 2', '        this.trades = this.createSafeDictionary();\n        Helpers.addElementToObject(this.trades, "a", this.extend(v, new HashMap<String, Object>() {{}}));', undefined ],
        [ 'value position', '        return Helpers.addElementToObject(this.tickers, "a", v);', undefined ],
        [ 'two args', '        Helpers.addElementToObject(this.tickers, "a");', undefined ],
        [ 'guarded receiver', '        Helpers.addElementToObject((this.tickers == null ? null : this.tickers.get("a")), "b", v);', undefined ],
        // off-owner members keep the helper: there the map's monitor is the only serialisation with
        // a writer on the watch path, on spawn's virtual executor, or on a user-thread API
        [ 'watch member keeps the helper', '        Helpers.addElementToObject(this.balance, "info", info);', undefined, 'Object info', 'watchBalance' ],
        [ 'spawned snapshot loader keeps the helper', '        Helpers.addElementToObject(this.balance, "info", info);', undefined, 'Object info', 'loadBalanceSnapshot' ],
        [ 'sandbox setter keeps the helper', '        Helpers.addElementToObject(this.balance, "info", info);', undefined, 'Object info', 'setSandboxMode' ],
    ];
    for (const [ name, body, expect, signature, member ] of cases) {
        const input = run (body, signature, member);
        const out = j01w7FieldPuts (input, { sets });
        const ok = expect === undefined ? out === input : out.includes (expect);
        if (!ok) problems.push (`hx10w7 J01: ${name}\n${out}`);
        if (j01w7FieldPuts (out, { sets }) !== out) problems.push (`hx10w7 J01: ${name} not idempotent`);
    }
    const empty = j01w7FieldPuts (run (cases[0][1]!), { sets: { tier1: new Set (), tier2: new Set () } });
    if (empty !== run (cases[0][1]!)) problems.push ('hx10w7 J01: no proven field must leave every site alone');
    const proven = j01w7Fields ();
    for (const needed of [ 'balance', 'tickers', 'orderbooks', 'trades', 'ohlcvs', 'headers' ]) {
        if (!proven.tier1.has (needed) && !proven.tier2.has (needed)) problems.push (`hx10w7 J01: ${needed} must be a proven field`);
    }
    for (const unsafe of [ 'has', 'urls', 'features', 'commonCurrencies', 'markets_by_id', 'options', 'markets', 'requiredCredentials' ]) {
        if (proven.tier1.has (unsafe) || proven.tier2.has (unsafe)) problems.push (`hx10w7 J01: ${unsafe} must not be a proven field`);
    }
    return problems;
}
