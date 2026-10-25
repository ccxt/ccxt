// hx10 wave 2 J02: `Helpers.GetValue(x, k)` on a receiver whose printed type is a Map/List prints the
// native accessor; the helper's own null / out-of-range answers stay explicit and every unproven
// receiver keeps the call. Receiver proofs: the printed declaration of a local/param, an explicit
// Map/List checkcast, or a field the runtime class's own source declares a map.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const J02_SRC = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');

const J02_MAP_DECL = /^(?:java\.util\.)?(?:Map|AbstractMap|HashMap|ConcurrentHashMap|LinkedHashMap|TreeMap|SortedMap|NavigableMap|Hashtable)\s*<[^<>]*>$/;
const J02_LIST_DECL = /^(?:java\.util\.)?(?:List|ArrayList|LinkedList|AbstractList|CopyOnWriteArrayList)\s*<[^<>]*>$/;
const J02_FRESH_MAP = /^new\s+(?:java\.util\.)?(?:HashMap|ConcurrentHashMap|LinkedHashMap)\s*[<(]/;
const J02_MAP_CAST = /^\(\s*(?:java\.util\.)?Map\s*</;
const J02_STRING_LITERAL = /^"(?:[^"\\]|\\.)*"$/;
const J02_IDENT = /^[A-Za-z_]\w*$/;
const J02_STRING_CAST = /^\(+\s*\(?\s*String\s*\)\s*([A-Za-z_]\w*)\s*\)+$/;
const J02_NONNULL_STRING = /^java\.util\.Objects\.requireNonNullElse\s*\(\s*([A-Za-z_]\w*)\s*,\s*"(?:[^"\\]|\\.)*"\s*\)$/;
const J02_NONNULL_KEY = J02_NONNULL_STRING;
const J02_MEMBER_START = /^ {0,4}(?:public|private|protected|static|final|abstract|synchronized|@)/;

function j02IsMapDecl (text: string): boolean {
    return J02_MAP_DECL.exec (text) !== null;
}

function j02IsListDecl (text: string): boolean {
    return J02_LIST_DECL.exec (text) !== null;
}

function j02IsFreshMap (text: string): boolean {
    return J02_FRESH_MAP.exec (text) !== null;
}

function j02IsMapCast (text: string): boolean {
    return J02_MAP_CAST.exec (text) !== null;
}

function j02IsIdent (text: string): boolean {
    return J02_IDENT.exec (text) !== null;
}

function j02IsStringLiteral (text: string): boolean {
    return J02_STRING_LITERAL.exec (text) !== null;
}

// mask string/char literal contents and comments with spaces (same length, newlines kept)
function j02Mask (text: string): string {
    let out = '';
    let i = 0;
    while (i < text.length) {
        const ch = text[i];
        if (ch === '"' || ch === '\'') {
            let j = i + 1;
            while (j < text.length && text[j] !== ch && text[j] !== '\n') {
                j += text[j] === '\\' ? 2 : 1;
            }
            out += ch + ' '.repeat (Math.max (0, Math.min (j, text.length - 1) - i - 1)) + (j < text.length ? text[j] : '');
            i = j + 1;
            continue;
        }
        if (ch === '/' && text[i + 1] === '/') {
            let j = text.indexOf ('\n', i);
            if (j < 0) j = text.length;
            out += ' '.repeat (j - i);
            i = j;
            continue;
        }
        if (ch === '/' && text[i + 1] === '*') {
            let j = text.indexOf ('*/', i + 2);
            j = j < 0 ? text.length : j + 2;
            out += text.slice (i, j).replace (/[^\n]/g, ' ');
            i = j;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}

function j02Close (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const ch = masked[i];
        if (ch === '(') depth++;
        else if (ch === ')') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

interface J02Site { start: number; end: number; recvStart: number; recvEnd: number; keyStart: number; keyEnd: number }

function j02Sites (masked: string): J02Site[] {
    const sites: J02Site[] = [];
    const needle = 'Helpers.GetValue(';
    let at = masked.indexOf (needle);
    while (at >= 0) {
        const open = at + needle.length - 1;
        const close = j02Close (masked, open);
        if (close < 0) break;
        let depth = 0;
        let comma = -1;
        let args = 1;
        for (let k = open + 1; k < close; k++) {
            const ch = masked[k];
            if (ch === '(' || ch === '[' || ch === '{') depth++;
            else if (ch === ')' || ch === ']' || ch === '}') depth--;
            else if (ch === ',' && depth === 0) {
                if (comma >= 0) args = 3;
                comma = k;
            }
        }
        if (args === 1 && comma > 0) {
            sites.push ({ start: at, end: close + 1, recvStart: open + 1, recvEnd: comma, keyStart: comma + 1, keyEnd: close });
        }
        at = masked.indexOf (needle, close + 1);
    }
    return sites;
}

interface J02Field { type: string; init: string }
interface J02Class { name: string; sup: string | undefined; fields: Map<string, J02Field>; text: string }
interface J02Proof { kind: 'decl' | 'cast'; hashKeyed: boolean }

function j02Simple (name: string): string {
    return name.replace (/^.*\./, '');
}

function j02ParseClass (name: string, text: string): J02Class {
    const head = /(?:^|\n)(?:public\s+)?(?:final\s+|abstract\s+)?class\s+(\w+)(?:\s+extends\s+([\w.]+))?/.exec (text);
    const fields = new Map<string, J02Field> ();
    for (const line of text.split ('\n')) {
        const m = /^ {4}(?:public|private|protected)\s+(?:static\s+|final\s+|volatile\s+|transient\s+)*([A-Za-z_][\w.]*(?:<[^;=]*>)?(?:\[\])?)\s+(\w+)\s*(?:=(.*?))?;\s*$/.exec (line);
        if (m !== null) {
            fields.set (m[2], { type: m[1].trim (), init: (m[3] ?? '').trim () });
        }
    }
    return { name, sup: head?.[2], fields, text };
}

const j02ClassCache = new Map<string, J02Class | undefined> ();

// the port's own sources are the runtime type table: a class's field declarations and writes are here
function j02LoadClass (name: string): J02Class | undefined {
    if (j02ClassCache.has (name)) return j02ClassCache.get (name);
    const dirs = [ 'exchanges/pro', 'exchanges', 'exchanges/prediction', 'ws', '' ];
    let found: J02Class | undefined;
    for (const dir of dirs) {
        const file = path.join (J02_SRC, dir, name + '.java');
        try {
            found = j02ParseClass (name, fs.readFileSync (file, 'utf8'));
            break;
        } catch (e) {
            continue;
        }
    }
    j02ClassCache.set (name, found);
    return found;
}

function j02Owner (content: string, sourcePath: string | undefined): J02Class | undefined {
    const head = /(?:^|\n)public class\s+(\w+)/.exec (content);
    if (head !== null) return j02ParseClass (head[1], content);
    if (sourcePath === undefined) return undefined;
    return j02LoadClass (path.basename (sourcePath, '.java'));
}

// every `this.<field> = rhs;` of a class body (masked: literal contents are blanked)
function j02FieldWrites (text: string, field: string): string[] {
    const masked = j02Mask (text);
    const writes: string[] = [];
    // an assignment, not the `==` of an already-converted read (a bare `=` match would read the
    // guarded get as a non-map write of the field and lose the proof on the next build)
    const rx = new RegExp ('(?<![\\w.])this\\.' + field + '\\s*=(?!=)\\s*([^;]*);', 'g');
    let m: RegExpExecArray | null;
    while ((m = rx.exec (masked)) !== null) {
        writes.push (m[1].trim ());
    }
    return writes;
}

function j02MapValue (text: string): boolean {
    const t = text.trim ();
    if (t === 'null') return true;
    if (j02IsFreshMap (t)) return true;
    if (j02IsMapCast (t)) return true;
    return /^this\.createSafeDictionary\s*\(/.test (t);
}

// a hash-backed Map: `get` answers null for any key the map does not hold and never orders keys, so a
// non-String key keeps GetValue's answer (a TreeMap would throw, a parameterised Map may be one)
function j02HashValue (text: string): boolean {
    const t = text.trim ();
    if (t === 'null') return true;
    if (j02IsFreshMap (t)) return true;
    if (j02IsMapCast (t)) return true;
    return /^this\.createSafeDictionary\s*\(/.test (t);
}

// 'decl': the field already prints a Map; 'cast': it prints Object but every value it can hold is a
// Map (a fresh map initializer, every write a map or null) so the read needs the checkcast
function j02MapFieldProof (field: string, owner: J02Class | undefined): J02Proof | undefined {
    if (owner === undefined) return undefined;
    const chain: J02Class[] = [];
    const seen = new Set<string> ();
    let cur: J02Class | undefined = owner;
    while (cur !== undefined && !seen.has (cur.name)) {
        seen.add (cur.name);
        chain.push (cur);
        cur = cur.sup === undefined ? undefined : j02LoadClass (j02Simple (cur.sup));
    }
    const declaring = chain.find (c => c.fields.has (field));
    if (declaring === undefined) return undefined;
    const decl = declaring.fields.get (field)!;
    const init = decl.init.trim ();
    const writes = chain.flatMap (c => j02FieldWrites (c.text, field));
    const hashKeyed = j02HashValue (init) && writes.every (j02HashValue);
    if (j02IsMapDecl (decl.type)) return { kind: 'decl', hashKeyed };
    if (decl.type !== 'Object') return undefined;
    if (init !== '' && init !== 'null' && !j02IsFreshMap (init) && !j02IsMapCast (init)) return undefined;
    if (!writes.every (j02MapValue)) return undefined;
    return { kind: 'cast', hashKeyed };
}

// nearest preceding declaration of `name` inside the member that holds `lineIndex`
function j02DeclaredType (lines: string[], lineIndex: number, name: string): string | undefined {
    const rx = new RegExp ('(?:^[\\s{]*|[(,{]\\s*)(?:final\\s+)?((?:java\\.util\\.)?[A-Za-z_][\\w.]*(?:<[^;=()]*>)?(?:\\[\\])?)\\s+' + name + '\\s*(?:=|;|:|,|\\))');
    for (let i = lineIndex; i >= 0; i--) {
        const line = lines[i];
        if (!/^\s*(?:\/\/|\*)/.test (line)) {
            const m = rx.exec (line);
            if (m !== null && m[1] !== 'return' && m[1] !== 'new' && m[1] !== 'else' && m[1] !== 'throw' && m[1] !== 'case') {
                return m[1].replace (/\s+/g, ' ');
            }
        }
        if (J02_MEMBER_START.exec (line) !== null) return undefined;
    }
    return undefined;
}

// `for (var i = 0; …)` counter that nothing but ++/-- writes
function j02IntCounter (masked: string, lines: string[], lineIndex: number, name: string): boolean {
    const rx = new RegExp ('\\bfor\\s*\\(\\s*(?:var|int)\\s+' + name + '\\s*=\\s*\\d+');
    let initLine = -1;
    for (let i = lineIndex; i >= 0; i--) {
        if (rx.test (lines[i])) { initLine = i; break; }
        if (J02_MEMBER_START.exec (lines[i]) !== null) return false;
    }
    if (initLine < 0) return false;
    const writes = masked.match (new RegExp ('(?<![\\w.])' + name + '\\s*(?:=(?!=)|\\+=|-=|\\*=|/=)', 'g')) ?? [];
    return writes.length === 1;
}

// an index expression List.get accepts: an int local/param, or a `for` counter
function j02IntIndex (masked: string, lines: string[], lineIndex: number, name: string): boolean {
    if (!j02IsIdent (name)) return false;
    const declared = j02DeclaredType (lines, lineIndex, name);
    if (declared === 'int') return true;
    if (declared !== 'var') return false;
    return j02IntCounter (masked, lines, lineIndex, name);
}

function j02LineOf (lineStarts: number[], offset: number): number {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (lineStarts[mid] <= offset) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}

export function nativeJavaJ02ElementReads (content: string, sourcePath?: string): string {
    if (!content.includes ('Helpers.GetValue(')) return content;
    const masked = j02Mask (content);
    const sites = j02Sites (masked);
    if (sites.length === 0) return content;
    const lines = content.split ('\n');
    const lineStarts: number[] = [ 0 ];
    for (let i = 0; i < content.length; i++) {
        if (content[i] === '\n') lineStarts.push (i + 1);
    }
    const owner = j02Owner (content, sourcePath);
    let result = content;
    for (let s = sites.length - 1; s >= 0; s--) {
        const site = sites[s];
        const recv = content.slice (site.recvStart, site.recvEnd).trim ();
        const key = content.slice (site.keyStart, site.keyEnd).trim ();
        const lineIndex = j02LineOf (lineStarts, site.start);
        // a bare statement read has nothing to guard
        const lineStart = lineStarts[lineIndex];
        const lineEnd = lineIndex + 1 < lineStarts.length ? lineStarts[lineIndex + 1] : content.length;
        if (content.slice (lineStart, site.start).trim () === '' && content.slice (site.end, lineEnd).trim () === ';') continue;
        let base = recv;
        let mapProof: J02Proof | undefined;
        let listProof: 'decl' | 'cast' | undefined;
        const fieldRead = /^(this|[A-Za-z_]\w*)\.([A-Za-z_]\w*)$/.exec (recv);
        if (fieldRead !== null) {
            if (fieldRead[1] === 'this') {
                mapProof = j02MapFieldProof (fieldRead[2], owner);
            } else {
                const qualifierType = j02DeclaredType (lines, lineIndex, fieldRead[1]);
                if (qualifierType !== undefined && !/[<>[\]]/.test (qualifierType)) {
                    mapProof = j02MapFieldProof (fieldRead[2], j02LoadClass (j02Simple (qualifierType)));
                }
            }
        } else if (j02IsIdent (recv)) {
            const declared = j02DeclaredType (lines, lineIndex, recv);
            if (declared !== undefined) {
                if (j02IsMapDecl (declared)) mapProof = { kind: 'decl', hashKeyed: false };
                else if (j02IsListDecl (declared)) listProof = 'decl';
            }
        } else {
            const castList = /^\(\s*(?:java\.util\.)?(?:List|ArrayList)\s*<[^()]*>\s*\)\s*\(?\s*([A-Za-z_]\w*)\s*\)?$/.exec (recv);
            if (castList !== null) {
                listProof = 'cast';
                base = castList[1];
            }
        }
        if (mapProof !== undefined) {
            // GetValue answers null for a null receiver or key and only reads a String key; a
            // hash-backed map answers the same for any key, so those take the plain read too
            const literalKey = j02IsStringLiteral (key);
            const castKey = J02_STRING_CAST.exec (key);
            const nonNullKey = J02_NONNULL_KEY.exec (key);
            const identKey = !literalKey && castKey === null && nonNullKey === null && j02IsIdent (key);
            let keyIdent: string | null | undefined;
            if (literalKey) keyIdent = key;
            else if (castKey !== null) keyIdent = castKey[1];
            else if (identKey && j02DeclaredType (lines, lineIndex, key) === 'String') keyIdent = key;
            else if (identKey && mapProof.hashKeyed) keyIdent = key;
            else if (nonNullKey !== null && mapProof.hashKeyed) keyIdent = null;
            if (keyIdent === undefined) continue;
            // the value itself is never null in the non-null-key form, so only the receiver is tested
            const guard = (keyIdent === null || keyIdent === key && literalKey) ? base + ' == null' : base + ' == null || ' + keyIdent + ' == null';
            const read = mapProof.kind === 'decl' ? base : '((java.util.Map<?, ?>)' + base + ')';
            result = result.slice (0, site.start) + '(' + guard + ' ? null : ' + read + '.get(' + key + '))' + result.slice (site.end);
            continue;
        }
        if (listProof !== undefined) {
            const literalIndex = /^\d+$/.test (key);
            const intIndex = !literalIndex && j02IntIndex (masked, lines, lineIndex, key);
            if (!literalIndex && !intIndex) continue;
            const list = listProof === 'decl' ? base : '((java.util.List<?>)' + base + ')';
            const lower = literalIndex ? '' : key + ' < 0 || ';
            result = result.slice (0, site.start) + '(' + base + ' == null || ' + lower + key + ' >= ' + list + '.size() ? null : ' + list + '.get(' + key + '))' + result.slice (site.end);
        }
    }
    return result;
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function j02SelfTest (): string[] {
    const problems: string[] = [];
    const head = 'public class zzj02native extends BaseExchange {\n';
    const run = (body: string, sourcePath?: string) => nativeJavaJ02ElementReads (head + body + '\n}\n', sourcePath);
    const pos: [string, string][] = [
        // a field declared a Map needs no write audit
        [ '    public Map<String, Object> opts = new HashMap<>();\n    public Object f(Object k) { return Helpers.GetValue(this.opts, "a"); }',
          'return (this.opts == null ? null : this.opts.get("a"))' ],
        // a String-declared key keeps the helper's null-key answer
        [ '    public Map<String, Object> opts = new HashMap<>();\n    public Object f(String k) { return Helpers.GetValue(this.opts, k); }',
          'return (this.opts == null || k == null ? null : this.opts.get(k))' ],
        // Object field whose every write is a fresh map: checkcast read, any non-null key
        [ '    public Object cache = new ConcurrentHashMap<String, Object>();\n    public Object f(Object k) { this.cache = new HashMap<String, Object>(); return Helpers.GetValue(this.cache, "a"); }\n    public Object g(Object k) { return Helpers.GetValue(this.cache, k); }',
          'return (this.cache == null || k == null ? null : ((java.util.Map<?, ?>)this.cache).get(k))' ],
        // explicit List checkcast receiver, int parameter index: bounds-guarded element
        [ '    public Object f(Object xs, int i) { return Helpers.GetValue((List<String>)(xs), i); }',
          'return (xs == null || i < 0 || i >= ((java.util.List<?>)xs).size() ? null : ((java.util.List<?>)xs).get(i))' ],
        // declared List local, literal index
        [ '    public Object f() { List<Object> xs = new ArrayList<Object>(); return Helpers.GetValue(xs, 0); }',
          'return (xs == null || 0 >= xs.size() ? null : xs.get(0))' ],
        // a base-class field resolved through the super chain (the runtime sources are the table)
        [ '    public Object f() { return Helpers.GetValue(this.options, "a"); }',
          'return (this.options == null ? null : this.options.get("a"))' ],
        // the file already holds a converted read of the field: its `== null` is not a write, so the
        // remaining helper call keeps its proof and converts too (idempotent rebuild)
        [ '    public Object cache = new HashMap<String, Object>();\n    public Object g(Object k) { return (this.cache == null || k == null ? null : ((Map<?, ?>)this.cache).get(k)); }\n    public Object f() { return Helpers.GetValue(this.cache, "a"); }',
          'return (this.cache == null ? null : ((java.util.Map<?, ?>)this.cache).get("a"))' ],
    ];
    for (const [ body, expect ] of pos) {
        const out = run (body);
        if (!out.includes (expect)) problems.push (`j02: expected ${expect} in\n${out}`);
    }
    const neg = [
        // unproven Object receiver
        '    public Object f(Object m) { return Helpers.GetValue(m, "a"); }',
        // Object field that can hold a non-map
        '    public Object cache = null;\n    public Object f(Object m) { this.cache = m; return Helpers.GetValue(this.cache, "a"); }',
        // Object key on a declared Map that may be a TreeMap
        '    public Object f(Map<String, Object> m, Object k) { return Helpers.GetValue(m, k); }',
        // index that is not an int
        '    public Object f(Object xs, Object i) { return Helpers.GetValue(xs, i); }',
    ];
    for (const body of neg) {
        if (run (body) !== head + body + '\n}\n') problems.push (`j02: must keep the helper in\n${body}`);
    }
    return problems;
}
