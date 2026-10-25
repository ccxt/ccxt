// hx10 J01 — Helpers.addElementToObject -> native Map.put / List.set from a proven receiver type.
// Exactly two outcomes per statement site: the receiver's Java static type is a Map<String, Object>
// (or List<Object> with an in-range literal index) -> the plain put/set; anything else -> the helper call
// as it stands. Field types come from the hand-written headers of BaseExchange / Exchange /
// PredictionExchange (never a table in this file), so a runtime unit that retypes a field is picked up here
// with no further change. A put is only emitted where it replays the helper on every value the type allows:
// a provably non-null value, or a map that is never a ConcurrentHashMap in any write in the tree
// (the helper's single value-dependent branch is `null -> remove` for a ConcurrentHashMap).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const JAVA_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
const HEADER_FILES = [ 'BaseExchange.java', 'Exchange.java', 'PredictionExchange.java' ].map ((f) => path.join (JAVA_ROOT, f));
const HEADER_DELIM = '// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT';

// Map<String, Object>: put(String, Object) is the helper's `((Map<Object, Object>) m).put(k, v)` for a String key
const MAP_TYPE = /^(?:java\.util\.)?(?:Map|HashMap|LinkedHashMap|ConcurrentHashMap|TreeMap|AbstractMap)\s*<\s*String\s*,\s*Object\s*>$/;
const LIST_TYPE = /^(?:java\.util\.)?(?:List|ArrayList|LinkedList)\s*<\s*Object\s*>$/;
const DECL_STOP = [ 'return', 'new', 'else', 'case', 'throw', 'instanceof', 'yield', 'assert' ];

const normType = (t: string) => t.replace (/^java\.util\./, '').replace (/\s+/g, ' ').trim ();

type ValueKind = 'plain' | 'concurrent' | 'map' | 'other';

// `new LinkedHashMap` and a 2-arg `this.extend` (Generic.Extend -> new LinkedHashMap) are the only
// non-concurrent constructors the generated code writes into these fields
function mapValueKind (rhs: string): ValueKind {
    const e = rhs.trim ();
    if (/^new\s+(?:java\.util\.concurrent\.)?Concurrent(?:HashMap|SkipListMap)\b/.test (e)) return 'concurrent';
    if (/^new\s+(?:java\.util\.)?(?:Linked)?HashMap\b/.test (e)) return 'plain';
    if (/^Helpers\.newMap\s*\(/.test (e)) return 'plain';
    if (/^this\.createSafeDictionary\s*\(\s*true\s*\)/.test (e)) return 'concurrent';
    if (/^this\.createSafeDictionary\s*\(\s*\)/.test (e)) return 'plain';
    if (/^this\.extend\s*\(/.test (e)) return 'plain';
    if (/^this\.mapToSafeMap\s*\(/.test (e)) return 'map';
    if (/^this\.convertToSafeDictionary\s*\(/.test (e)) return 'map';
    return 'other';
}

// index of the bracket closing the one at `open`, or -1
function closeOf (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '\'') {
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

// the statement end of the value starting at `at` (same line only), or -1
function lineEnd (text: string, at: number): number {
    let depth = 0;
    for (let i = at; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '\'') {
            let closed = false;
            for (let j = i + 1; j < text.length; j++) {
                if (text[j] === '\\') { j++; continue; }
                if (text[j] === c) { i = j; closed = true; break; }
            }
            if (!closed) return -1;
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ';' && depth === 0) return i;
        else if (c === '\n') return -1;
    }
    return -1;
}

// top-level comma split; string literals and generic argument lists stay whole
function splitArgs (text: string): string[] | undefined {
    const out: string[] = [];
    let depth = 0, at = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '\'') {
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

function unparen (e: string): string {
    let t = e.trim ();
    for (;;) {
        if (!t.startsWith ('(')) return t;
        const close = closeOf (t, 0);
        if (close !== t.length - 1) return t;
        t = t.slice (1, -1).trim ();
    }
}

const ident = (e: string) => /^[A-Za-z_]\w*$/.test (e) && !/^(?:this|null|true|false|new)$/.test (e);
const strLit = (e: string) => /^"(?:[^"\\]|\\.)*"$/.test (e);
const stringCast = (e: string) => /^\(\(String\)\s*[A-Za-z_]\w*\s*\)$/.test (e);
const intLit = (e: string) => /^\d+$/.test (e);
const fieldRef = (e: string) => /^this\.([A-Za-z_]\w*)$/.exec (e);

// the single declared type of `name` in `member` (parameters included); undefined when shadowed or mixed
function declaredType (member: string, name: string): string | undefined {
    const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'gm');
    const types = new Set<string> ();
    for (const m of member.matchAll (re)) {
        const t = m[1].replace (/^final /, '');
        if (DECL_STOP.includes (t)) continue;
        types.add (t);
    }
    const shadowed = new RegExp (`(?:\\(|, )${name}\\) ->|(?<![\\w.])${name} ->`).test (member);
    return !shadowed && types.size === 1 ? [ ...types ][0] : undefined;
}

function isParam (member: string, name: string): boolean {
    const nl = member.indexOf ('\n');
    const sig = (nl === -1 ? member : member.slice (0, nl)).replace (/\{.*$/, '');
    return new RegExp (`[(,]\\s*(?:final\\s+)?[\\w.<>, ?\\[\\]]+ ${name}\\s*[,)]`).test (sig);
}

// the element count of a `new ArrayList<Object>(Arrays.asList(..))` / `Arrays.asList(..)` value, or -1
function listLiteralLength (rhs: string): number {
    const head = /^(?:new (?:java\.util\.)?ArrayList<Object>\s*\(\s*)?(?:java\.util\.)?Arrays\.asList\s*\(/.exec (rhs);
    if (head === null) return -1;
    const close = closeOf (rhs, head[0].length - 1);
    if (close === -1) return -1;
    const inner = rhs.slice (head[0].length, close).trim ();
    const args = inner === '' ? [] : splitArgs (inner);
    return args === undefined ? -1 : args.length;
}

type FieldFacts = { declaredMap: boolean, declaredList: boolean, plain: boolean, allMapNonNull: boolean, nullable: boolean };
let fieldFactsCache: Map<string, FieldFacts> | undefined;
let overrideNames: Set<string> | undefined;

function headerOf (file: string): string {
    try { return fs.readFileSync (file, 'utf8').split (HEADER_DELIM)[0]; } catch (e) { return ''; }
}

function j01FieldFacts (): Map<string, FieldFacts> {
    if (fieldFactsCache !== undefined) return fieldFactsCache;
    const declared = new Map<string, string | undefined> ();
    const init = new Map<string, string> ();
    for (const file of HEADER_FILES) {
        const header = headerOf (file);
        if (header === '') continue;
        const field = /^ {4}(?:public |protected |private )?(?:volatile |static |final |transient )*([\w.<>, ?]+?) (\w+)\s*(?:=\s*([^;\n]*))?;/gm;
        for (const m of header.matchAll (field)) {
            const type = normType (m[1]);
            if (DECL_STOP.includes (type)) continue;
            declared.set (m[2], declared.has (m[2]) && declared.get (m[2]) !== type ? undefined : type);
            if (m[3] !== undefined) init.set (m[2], m[3]);
        }
    }
    // every `this.<f> = ..` in the tree decides whether the field can hold a ConcurrentHashMap or a non-map
    const kinds = new Map<string, ValueKind[]> ();
    const nulls = new Set<string> ();
    const overrides = new Set<string> ();
    overrideNames = overrides;
    const walk = (dir: string) => {
        let names: string[] = [];
        try { names = fs.readdirSync (dir); } catch (e) { return; }
        for (const name of names) {
            const full = path.join (dir, name);
            let stat;
            try { stat = fs.statSync (full); } catch (e) { continue; }
            if (stat.isDirectory ()) { if (full !== path.join (JAVA_ROOT, 'types')) walk (full); continue; }
            if (!name.endsWith ('.java')) continue;
            let text = '';
            try { text = fs.readFileSync (full, 'utf8'); } catch (e) { continue; }
            if (!(HEADER_FILES as string[]).includes (full)) {
                for (const m of text.matchAll (/^ {4}(?:public|protected|private)[\w<>\[\], .]*\s(\w+)\s*\(/gm)) overrides.add (m[1]);
            }
            for (const m of text.matchAll (/(?<![\w.])this\.(\w+)\s*=\s*(?!=)/g)) {
                if (!declared.has (m[1])) continue;
                const at = m.index! + m[0].length;
                const end = lineEnd (text, at);
                const rhs = end === -1 ? '' : text.slice (at, end).trim ();
                if (rhs === 'null') nulls.add (m[1]);
                const list = kinds.get (m[1]) ?? [];
                list.push (end === -1 ? 'other' : mapValueKind (rhs));
                kinds.set (m[1], list);
            }
        }
    };
    walk (JAVA_ROOT);
    fieldFactsCache = new Map ();
    for (const [ name, type ] of declared) {
        if (type === undefined) continue;
        const writes = kinds.get (name) ?? [];
        const initKind = init.has (name) ? mapValueKind (init.get (name)!) : undefined;
        const all = initKind === undefined ? writes : [ initKind, ...writes ];
        if (init.has (name) && init.get (name)!.trim () === 'null') nulls.add (name);
        fieldFactsCache.set (name, {
            declaredMap: MAP_TYPE.test (type),
            declaredList: LIST_TYPE.test (type),
            plain: all.length > 0 && all.every ((k) => k === 'plain'),
            allMapNonNull: all.length > 0 && all.every ((k) => k === 'plain' || k === 'concurrent' || k === 'map'),
            nullable: nulls.has (name),
        });
    }
    return fieldFactsCache;
}

let baseMethodCache: Map<string, boolean> | undefined;

// `this.<m>(..)` whose every `return` in the hand-written base headers is a constructor / literal
function baseMethodNonNull (name: string): boolean {
    if (baseMethodCache === undefined) baseMethodCache = new Map ();
    const cached = baseMethodCache.get (name);
    if (cached !== undefined) return cached;
    baseMethodCache.set (name, false);
    j01FieldFacts (); // fills overrideNames
    if (overrideNames !== undefined && overrideNames.has (name)) return false;
    let result = false;
    for (const file of HEADER_FILES) {
        const header = headerOf (file);
        if (header === '') continue;
        for (const m of header.matchAll (new RegExp (`(?:public|protected|private)[\\w<>\\[\\], .]*\\s${name}\\s*\\(`, 'g'))) {
            const sigClose = closeOf (header, header.indexOf ('(', m.index! + m[0].length - 1));
            if (sigClose === -1) continue;
            const bodyOpen = header.indexOf ('{', sigClose);
            if (bodyOpen === -1) continue;
            const bodyClose = closeOf (header, bodyOpen);
            if (bodyClose === -1) continue;
            const body = header.slice (bodyOpen, bodyClose);
            const returns = [ ...body.matchAll (/(?<![\w.])return\s+([^;]+);/g) ].map ((r) => r[1].trim ());
            result = returns.length > 0 && returns.every ((r) => nonNullValue (undefined, r, 0));
            if (result) break;
        }
        if (result) break;
    }
    baseMethodCache.set (name, result);
    return result;
}

// every write of a name in one member: map provenance, and for a list a provable literal length
type LocalFacts = { plain: boolean, allMapNonNull: boolean, listLen: number | undefined };
const localFactsCache = new Map<string, LocalFacts | undefined> ();

function localFacts (member: string, name: string): LocalFacts | undefined {
    const key = `${name}\u0000${member}`;
    if (localFactsCache.has (key)) return localFactsCache.get (key);
    localFactsCache.set (key, undefined);
    let facts: LocalFacts | undefined;
    const decl = declaredType (member, name);
    if (decl !== undefined && !isParam (member, name)) {
        const kinds: ValueKind[] = [];
        const lists: number[] = [];
        let ok = true;
        for (const m of member.matchAll (new RegExp (`(?<![\\w.])${name}\\s*(=(?!=)|[+\\-*/]?=|\\+\\+|--)`, 'g'))) {
            if (m[1] !== '=') { ok = false; break; }
            const at = m.index! + m[0].length;
            const end = lineEnd (member, at);
            if (end === -1) { ok = false; break; }
            const rhs = member.slice (at, end).trim ();
            kinds.push (mapValueKind (rhs));
            lists.push (listLiteralLength (rhs));
        }
        if (ok && kinds.length > 0 && !new RegExp (`(?<![\\w.])${name}\\s*(?:\\+\\+|--)`).test (member)) {
            const type = normType (decl);
            const len = lists.every ((n) => n === lists[0]) ? lists[0] : -1;
            if (LIST_TYPE.test (type)) {
                facts = { plain: false, allMapNonNull: false, listLen: len > 0 ? len : undefined };
            } else {
                facts = {
                    plain: kinds.every ((k) => k === 'plain'),
                    allMapNonNull: kinds.every ((k) => k === 'plain' || k === 'concurrent' || k === 'map'),
                    listLen: undefined,
                };
            }
        }
    }
    localFactsCache.set (key, facts);
    return facts;
}

// the printed value can never be null (a put of it matches the helper on any Map implementation)
function nonNullValue (member: string | undefined, value: string, depth: number): boolean {
    const v = unparen (value);
    if (/^(?:"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?[LD]?|true|false)$/.test (v)) return true;
    if (/^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v)) return true;
    if (v === 'null' || v === 'undefined') return false;
    const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (v);
    if (call !== null && depth < 3) return baseMethodNonNull (call[1]);
    if (member !== undefined && ident (v) && depth < 2) {
        const facts = localFacts (member, v);
        return facts !== undefined && facts.allMapNonNull;
    }
    const cast = /^\([\w.<>, ?]+\)\s*(.+)$/s.exec (v);
    if (cast !== null && depth < 3) return nonNullValue (member, cast[1], depth + 1);
    return false;
}

// one statement-position call: its arguments, or undefined when the call is nested / multi-line
function statementCall (line: string): { indent: string, args: string[], tail: string } | undefined {
    const m = /^(\s*)Helpers\.addElementToObject\(/.exec (line);
    if (m === null) return undefined;
    const open = m[0].length - 1;
    const close = closeOf (line, open);
    if (close === -1 || line[close + 1] !== ';') return undefined;
    const args = splitArgs (line.slice (open + 1, close));
    if (args === undefined || args.length !== 3) return undefined;
    return { indent: m[1], args, tail: line.slice (close + 2) };
}

function j01Member (member: string): string {
    if (!member.includes ('Helpers.addElementToObject(')) return member;
    const fields = j01FieldFacts ();
    const lines = member.split ('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s*(?:\/\/|\*)/.test (line)) continue;
        const call = statementCall (line);
        if (call === undefined) continue;
        const [ recv, key, value ] = call.args;
        const stringKey = strLit (key) || stringCast (key) || (ident (key) && declaredType (member, key) === 'String');
        const field = fieldRef (recv);
        if (field !== null) {
            if (!stringKey) continue;
            const facts = fields.get (field[1]);
            if (facts === undefined || facts.nullable) continue;
            const fresh = nonNullValue (member, value, 0);
            if (facts.declaredMap && (fresh || facts.plain)) {
                lines[i] = `${call.indent}this.${field[1]}.put(${key}, ${value});${call.tail}`;
                changed = true;
            } else if (!facts.declaredMap && facts.allMapNonNull && (fresh || facts.plain)) {
                // the header types the field Object while every write of it is a non-null Map
                lines[i] = `${call.indent}((java.util.Map<String, Object>) this.${field[1]}).put(${key}, ${value});${call.tail}`;
                changed = true;
            }
            continue;
        }
        if (!ident (recv)) continue;
        const decl = declaredType (member, recv);
        if (decl === undefined) continue;
        const type = normType (decl);
        const facts = localFacts (member, recv);
        const fresh = nonNullValue (member, value, 0);
        if (type === 'Object' || type === 'var') {
            if (!stringKey) continue;
            if (facts !== undefined && facts.allMapNonNull && (fresh || facts.plain)) {
                lines[i] = `${call.indent}((java.util.Map<String, Object>) ${recv}).put(${key}, ${value});${call.tail}`;
                changed = true;
            }
        } else if (MAP_TYPE.test (type)) {
            if (stringKey && (fresh || (facts !== undefined && facts.plain))) {
                lines[i] = `${call.indent}${recv}.put(${key}, ${value});${call.tail}`;
                changed = true;
            }
        } else if (LIST_TYPE.test (type) && intLit (key) && facts !== undefined && facts.listLen !== undefined) {
            // a list literal of provable length: index < size is exactly the helper's set branch
            const at = Number (key);
            if (at < facts.listLen) {
                lines[i] = `${call.indent}${recv}.set(${at}, ${value});${call.tail}`;
                changed = true;
            }
        }
    }
    return changed ? lines.join ('\n') : member;
}

export function hx10J01ElementWrites (content: string): string {
    if (!content.includes ('Helpers.addElementToObject(')) return content;
    const lines = content.split ('\n');
    const starts: number[] = [ 0 ];
    for (let i = 1; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    starts.push (lines.length);
    const parts: string[] = [];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (j01Member (lines.slice (starts[s], starts[s + 1]).join ('\n')));
    return parts.join ('\n');
}

// hx10 J01: snippet checks (`--audit-string-types --self-test`)
export function j01ElementWritesSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (sig: string, body: string) => `public class Gemini extends GeminiRest\n{\n    public Object m(${sig})\n    {\n${body}\n    }\n}`;
    const cases: [string, string, string, string | undefined][] = [
        [ 'declared Map param', 'Object p', '        Map<String, Object> m = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(m, "a", "x");', '        m.put("a", "x");' ],
        [ 'declared Map String key', 'Map<String, Object> p, String k', '        Helpers.addElementToObject(p, k, "x");', '        p.put(k, "x");' ],
        [ 'nullable value on a declared Map', 'Map<String, Object> p, Object v', '        Helpers.addElementToObject(p, "a", v);', undefined ],
        [ 'fresh local nullable value', 'Object v', '        Map<String, Object> r = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(r, "a", v);', '        r.put("a", v);' ],
        [ 'Object local holding one map', 'Object v', '        Object r = new LinkedHashMap<String, Object>();\n        Helpers.addElementToObject(r, "a", v);', '        ((java.util.Map<String, Object>) r).put("a", v);' ],
        [ 'non-null value proves the put', 'Map<String, Object> p', '        Object w = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(p, "a", w);', '        p.put("a", w);' ],
        [ 'base map field', 'Object v', '        Helpers.addElementToObject(this.options, "a", "x");', '        this.options.put("a", "x");' ],
        [ 'list literal index', 'Object a, Object b, Object x', '        List<Object> l = new ArrayList<Object>(Arrays.asList(a, b));\n        Helpers.addElementToObject(l, 1, x);', '        l.set(1, x);' ],
        // helper kept: unproven receiver, nullable value on a declared Map, a field with a non-map write,
        // an index past the end, a reassigned Object local, an Object key, a value-position call
        [ 'Object receiver', 'Object p', '        Helpers.addElementToObject(p, "a", "x");', undefined ],
        [ 'nullable value on a declared Map', 'Map<String, Object> p, Object v', '        Helpers.addElementToObject(p, "a", v);', undefined ],
        [ 'field with a non-map write', 'Object v', '        Helpers.addElementToObject(this.markets, "a", new HashMap<String, Object>() {{}});', undefined ],
        [ 'index past the end', 'Object a, Object x', '        List<Object> l = new ArrayList<Object>(Arrays.asList(a));\n        Helpers.addElementToObject(l, 1, x);', undefined ],
        [ 'reassigned Object local', 'Object v', '        Object r = new HashMap<String, Object>() {{}};\n        r = this.safeValue(v, "x");\n        Helpers.addElementToObject(r, "a", v);', undefined ],
        [ 'Object key', 'Map<String, Object> p, Object k, Object v', '        Helpers.addElementToObject(p, k, v);', undefined ],
        [ 'value position', 'Map<String, Object> p, Object v', '        return Helpers.addElementToObject(p, "a", v);', undefined ],
    ];
    for (const [ name, sig, body, expect ] of cases) {
        const input = cls (sig, body);
        const out = hx10J01ElementWrites (input);
        const ok = expect === undefined ? out === input : out.includes (expect);
        if (!ok) problems.push (`hx10 J01: ${name}\n${out}`);
        if (hx10J01ElementWrites (out) !== out) problems.push (`hx10 J01: ${name} not idempotent`);
    }
    return problems;
}
