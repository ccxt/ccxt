// hx10 wave 6 J09: the hx4 J39/J40 passes stand in for a helper with an inline
// `switch ((Object) x)` blob. This pass collapses a blob to the plain native op when the
// operand's own declaration proves a concrete Map/List/String/Long type, and leaves every
// unproven blob exactly as it is - it never introduces a helper call.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const J09_RT_DIR = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
const J09_RT_FILES = [ 'BaseExchange.java', 'PredictionExchange.java', 'Exchange.java' ];

// `final` / package qualifier / layout never change the type
function j09Type (t: string): string {
    return t.replace (/\bfinal\b/g, '').replace (/java\.util\./g, '').replace (/(?:java\.lang\.)?Boolean\b/g, 'Boolean').replace (/\s+/g, '').trim ();
}

const J09_TYPE = '(?:final\\s+)?(?:java\\.util\\.)?[A-Za-z][\\w.]*(?:\\s*<[^;=(){}]*?>)?(?:\\[\\])?';

function j09IsMap (t: string): boolean {
    return /^(?:Map|HashMap|LinkedHashMap|TreeMap|ConcurrentHashMap|SortedMap|NavigableMap|AbstractMap|Hashtable)(?:<String,Object>)?$/.test (t);
}

function j09IsList (t: string): boolean {
    return /^(?:List|ArrayList|LinkedList|AbstractList|CopyOnWriteArrayList)<[^<>]*>$/.test (t) || /^(?:List|ArrayList|LinkedList)$/.test (t);
}

// blank out string and char literals so brace/paren scanning and declaration scanning see code only
function j09Mask (s: string): string {
    const out = s.split ('');
    for (let i = 0; i < s.length; i++) {
        if (s[i] === '"') {
            let j = i + 1;
            while (j < s.length && s[j] !== '"') {
                if (s[j] === '\\') { j++; }
                j++;
            }
            const end = Math.min (j, s.length - 1);
            for (let k = i; k <= end; k++) { out[k] = ' '; }
            i = end;
        } else if (s[i] === '\'') {
            const m = /^'(?:\\.|[^'\\])'/.exec (s.slice (i, i + 4));
            if (m !== null) {
                for (let k = i; k < i + m[0].length; k++) { out[k] = ' '; }
                i += m[0].length - 1;
            }
        }
    }
    return out.join ('');
}

function j09Paren (m: string, open: number): number {
    let d = 0;
    for (let k = open; k < m.length; k++) {
        if (m[k] === '(') { d++; } else if (m[k] === ')') { d--; if (d === 0) { return k; } }
    }
    return -1;
}

function j09Brace (m: string, open: number): number {
    let d = 0;
    for (let k = open; k < m.length; k++) {
        if (m[k] === '{') { d++; } else if (m[k] === '}') { d--; if (d === 0) { return k; } }
    }
    return -1;
}

// every declaration of `name` in the enclosing member, before `pos`; [] when they disagree
function j09DeclTypes (masked: string, name: string, pos: number): string[] | undefined {
    const before = masked.slice (0, pos);
    const starts = [ ...before.matchAll (/^[ \t]*(?:public|private|protected)[ \t]/gm) ];
    if (starts.length === 0) { return undefined; }
    const win = before.slice (starts[starts.length - 1].index);
    const rx = new RegExp ('(?:^|[\\s(,;{])(' + J09_TYPE + ')\\s+' + name + '\\s*(?=[=;,)])', 'g');
    const out = new Set<string> ();
    let m;
    while ((m = rx.exec (win)) !== null) {
        const t = j09Type (m[1]);
        if (/,$/.test (t) || /^(?:return|new|else|case|throw|instanceof)$/.test (t)) { continue; }
        out.add (t);
    }
    if (out.size === 0) { return undefined; }
    // an untyped lambda parameter of the same name is a different binding
    if (new RegExp ('(?:\\(|, )' + name + '\\) ->|(?<![\\w.])' + name + ' ->').test (win)) { return undefined; }
    return [ ...out ];
}

let j09RtFields: Map<string, Set<string>> | undefined;

function j09RuntimeFields (): Map<string, Set<string>> {
    if (j09RtFields !== undefined) { return j09RtFields; }
    const table = new Map<string, Set<string>> ();
    for (const f of J09_RT_FILES) {
        let src = '';
        try { src = fs.readFileSync (path.join (J09_RT_DIR, f), 'utf8'); } catch { continue; }
        const rx = new RegExp ('^[ \\t]+(?:public|private|protected)\\s+(?:static\\s+)?(?:final\\s+)?(?:volatile\\s+)?(?:transient\\s+)?(' + J09_TYPE + ')\\s+(\\w+)\\s*(?:=|;)', 'gm');
        let m;
        while ((m = rx.exec (src)) !== null) {
            const t = j09Type (m[1]);
            if (!table.has (m[2])) { table.set (m[2], new Set<string> ()); }
            table.get (m[2])!.add (t);
        }
    }
    j09RtFields = table;
    return table;
}

function j09FieldType (content: string, name: string): string | undefined {
    const out = new Set<string> ();
    const rx = new RegExp ('^[ \\t]+(?:public|private|protected)\\s+(?:static\\s+)?(?:final\\s+)?(?:volatile\\s+)?(?:transient\\s+)?(' + J09_TYPE + ')\\s+' + name + '\\s*(?:=|;)', 'gm');
    let m;
    while ((m = rx.exec (content)) !== null) { out.add (j09Type (m[1])); }
    for (const t of j09RuntimeFields ().get (name) ?? []) { out.add (t); }
    if (out.size !== 1) { return undefined; }
    for (const t of out) { return t; }
    return undefined;
}

// top-level `?` count: a `?:` chain has more than one only when nested
function j09Ternary (X: string): [string, string] | undefined {
    let depth = 0, q = -1, colons = 0;
    for (let k = 0; k < X.length; k++) {
        const c = X[k];
        if (c === '(' || c === '[' || c === '{') { depth++; } else if (c === ')' || c === ']' || c === '}') { depth--; } else if (depth === 0 && c === '?' && X[k + 1] !== '?' && X[k - 1] !== '?') {
            if (q !== -1) { return undefined; }
            q = k;
        } else if (depth === 0 && c === ':' && q !== -1) { colons++; }
    }
    if (q === -1 || colons !== 1) { return undefined; }
    return [ X.slice (0, q).trim (), X.slice (X.indexOf (':', q) + 1).trim () ];
}

let j09RtMethods: Map<string, Set<string>> | undefined;

function j09MethodTable (src: string, table: Map<string, Set<string>>): void {
    const rx = /^[ \t]+(?:public|private|protected)\s+(?:static\s+)?(?:(?:final|synchronized)\s+)*([\w.<>?,\[\] ]+?)\s+(\w+)\s*\(/gm;
    let m;
    while ((m = rx.exec (src)) !== null) {
        const t = j09Type (m[1].replace (/\s+/g, ''));
        if (/^(?:return|new|else|if)$/.test (t)) { continue; }
        if (!table.has (m[2])) { table.set (m[2], new Set<string> ()); }
        table.get (m[2])!.add (t);
    }
}

function j09RuntimeMethods (): Map<string, Set<string>> {
    if (j09RtMethods !== undefined) { return j09RtMethods; }
    const table = new Map<string, Set<string>> ();
    for (const f of J09_RT_FILES) {
        let src = '';
        try { src = fs.readFileSync (path.join (J09_RT_DIR, f), 'utf8'); } catch { continue; }
        j09MethodTable (src, table);
    }
    j09RtMethods = table;
    return table;
}

function j09CallType (content: string, x: string): string | undefined {
    const call = /^(?:this\.)?([A-Za-z_]\w*)\s*\(/.exec (x);
    if (call === null) { return undefined; }
    const open = x.indexOf ('(');
    if (j09Paren (x, open) !== x.length - 1) { return undefined; }
    const table = new Map<string, Set<string>> ();
    j09MethodTable (content, table);
    const ts = new Set<string> ([ ...(table.get (call[1]) ?? []), ...(j09RuntimeMethods ().get (call[1]) ?? []) ]);
    if (ts.size !== 1) { return undefined; }
    for (const t of ts) { return t; }
    return undefined;
}

interface J09Proof { t: string, nonNull: boolean }

function j09Prove (content: string, masked: string, X: string, pos: number): J09Proof | undefined {
    const x = X.trim ();
    if (/^new\s+([A-Za-z][\w.]*)\s*(?:<[^<>]*>)?\s*\(/.test (x)) {
        const m = /^new\s+([A-Za-z][\w.]*)\s*(<[^<>]*>)?\s*\(/.exec (x)!;
        return { t: j09Type (m[1] + (m[2] ?? '')), nonNull: true };
    }
    // Objects.requireNonNullElse(x, "lit") is a non-null String when x is one
    const nn = /^(?:java\.util\.)?Objects\.requireNonNullElse\(\s*([A-Za-z_]\w*)\s*,\s*"(?:[^"\\]|\\.)*"\s*\)$/.exec (x);
    if (nn !== null) {
        const inner = j09Prove (content, masked, nn[1], pos);
        if (inner !== undefined && inner.t === 'String') { return { t: 'String', nonNull: true }; }
        return undefined;
    }
    if (/^[A-Za-z_]/.test (x) && /\)$/.test (x)) {
        const t = j09CallType (content, x);
        if (t !== undefined) { return { t, nonNull: false }; }
    }
    if (/^[A-Za-z_]\w*$/.test (x)) {
        const t = j09DeclTypes (masked, x, pos);
        if (t !== undefined && t.length === 1) { return { t: t[0], nonNull: false }; }
        const f = j09FieldType (content, x);
        return f === undefined ? undefined : { t: f, nonNull: false };
    }
    const tf = /^this\.([A-Za-z_]\w*)$/.exec (x);
    if (tf !== null) {
        const f = j09FieldType (content, tf[1]);
        return f === undefined ? undefined : { t: f, nonNull: false };
    }
    const tern = j09Ternary (x);
    if (tern !== undefined && /^null$/.test (tern[0])) {
        const inner = j09Prove (content, masked, tern[1], pos);
        return inner === undefined ? undefined : { t: inner.t, nonNull: false };
    }
    if (tern !== undefined && /^null$/.test (tern[1])) {
        const inner = j09Prove (content, masked, tern[0], pos);
        return inner === undefined ? undefined : { t: inner.t, nonNull: false };
    }
    return undefined;
}

type J09Family = 'toMapArg' | 'toStringListArg' | 'toLongOrNull' | 'toInt64' | 'add' | 'objectKeys' | 'getArrayLength' | 'inOp' | 'other';

function j09Family (body: string): J09Family {
    if (/containsKey\s*\(/.test (body)) { return 'inOp'; }
    if (/keySet\s*\(\s*\)/.test (body) && /ArrayList/.test (body)) { return 'objectKeys'; }
    if (/Array\.getLength/.test (body)) { return 'getArrayLength'; }
    if (/expected a dictionary/.test (body)) { return 'toMapArg'; }
    if (/expected a list of strings/.test (body)) { return 'toStringListArg'; }
    if (/expected a number/.test (body)) { return 'toLongOrNull'; }
    if (/Long\.parseLong\("null"\)/.test (body)) { return 'toInt64'; }
    if (/case (?:Long|Integer|Double|String) /.test (body)) { return 'add'; }
    return 'other';
}

// the plain native op for `family` on a proven operand, or undefined to keep the blob
function j09Native (family: J09Family, p: J09Proof, X: string, body: string): string | undefined {
    const x = X.trim ();
    // a null guard has to repeat the operand, so only a plain name (no call, no side effect) may be guarded
    const rep = /^(?:this\.)?[A-Za-z_]\w*$/.test (x);
    const guarded = (nullArm: string, op: string) => p.nonNull ? op : (rep ? `(${x} == null ? ${nullArm} : ${op})` : undefined);
    switch (family) {
        case 'toMapArg':
            // Helpers.toMapArg is null-or-same-map for a declared Map: the helper's CCE arm is unreachable
            return j09IsMap (p.t) ? x : undefined;
        case 'toStringListArg':
            return /^(?:List|ArrayList|LinkedList)<String>$/.test (p.t) ? x : undefined;
        case 'toLongOrNull':
            return p.t === 'Long' ? x : undefined;
        case 'toInt64':
            return p.t === 'long' || p.t === 'int' ? x : undefined;
        case 'add': {
            // `x + "lit"` replay: String.valueOf(null) is "null", so the null arm is plain Java concat
            const poison = /String\.valueOf\(\w+\) \+ \(([\s\S]*)\); \}/.exec (body);
            if (poison !== null) {
                return p.t === 'String' ? `(${x} + ${poison[1]})` : undefined;
            }
            const lit = /case Long \w+ -> \(Object\) \(\w+ \+ ([^)]+)\)/.exec (body);
            if (lit === null) { return undefined; }
            if (p.t === 'Long') { return guarded ('null', `(Object) (${x} + ${lit[1]})`); }
            if (p.t === 'long') { return `(${x} + ${lit[1]})`; }
            return undefined;
        }
        case 'objectKeys': {
            if (!j09IsMap (p.t)) { return undefined; }
            return guarded ('new java.util.ArrayList<Object>()', `new java.util.ArrayList<Object>(${x}.keySet())`);
        }
        case 'getArrayLength': {
            if (/\[\]$/.test (p.t)) { return guarded ('0', `${x}.length`); }
            if (j09IsList (p.t)) { return guarded ('0', `${x}.size()`); }
            if (p.t === 'String') { return guarded ('0', `${x}.length()`); }
            return undefined;
        }
        case 'inOp': {
            const key = /containsKey\(((?:"(?:[^"\\]|\\.)*"|[A-Za-z_]\w*))\)/.exec (body);
            if (key !== null && j09IsMap (p.t)) { return guarded ('false', `${x}.containsKey(${key[1]})`); }
            const lkey = /\.contains\(((?:"(?:[^"\\]|\\.)*"|[A-Za-z_]\w*))\)/.exec (body);
            if (lkey !== null && j09IsList (p.t)) { return guarded ('false', `${x}.contains(${lkey[1]})`); }
            return undefined;
        }
        default:
            return undefined;
    }
}

interface J09Site { start: number, end: number, text: string }

// one blob site: the switch expr plus the redundant parens / same-type cast wrapped around it
function j09Site (content: string, masked: string, at: number): J09Site | undefined {
    const brace = masked.indexOf ('{', at);
    if (brace === -1) { return undefined; }
    const selOpen = masked.indexOf ('(', at + 'switch '.length);
    if (selOpen === -1 || selOpen > brace) { return undefined; }
    const selClose = j09Paren (masked, selOpen);
    if (selClose === -1 || selClose > brace) { return undefined; }
    // the selector is `(Object) (operand)`: take the paren group after the cast
    const castEnd = selOpen + 1 + '(Object)'.length;
    const operandOpen = masked.indexOf ('(', castEnd);
    if (operandOpen === -1 || operandOpen >= selClose) { return undefined; }
    const operandClose = j09Paren (masked, operandOpen);
    if (operandClose === -1 || operandClose !== selClose - 1) { return undefined; }
    const bodyEnd = j09Brace (masked, brace);
    if (bodyEnd === -1) { return undefined; }
    const X = content.slice (operandOpen + 1, operandClose);
    const body = content.slice (brace, bodyEnd + 1);
    const family = j09Family (body);
    if (family === 'other') { return undefined; }
    const p = j09Prove (content, masked, X, at);
    if (p === undefined) { return undefined; }
    const nat = j09Native (family, p, X, body);
    if (nat === undefined) { return undefined; }
    // consume the paren groups and the same-type cast that only re-state the native op's type
    let s = at, e = bodyEnd;
    for (;;) {
        // never swallow a call's argument list or an index: a grouping paren follows no name
        if (s > 0 && e + 1 < masked.length && masked[s - 1] === '(' && masked[e + 1] === ')' && (s < 2 || !/[A-Za-z0-9_$)\]]/.test (masked[s - 2]))) { s--; e++; continue; }
        const cast = /\(\s*((?:java\.util\.)?[A-Za-z][\w.]*(?:\s*<[^<>]*>)?)\s*\)\s+$/.exec (masked.slice (Math.max (0, s - 120), s));
        if (cast !== null && e + 1 < masked.length && masked[e + 1] === ')' && masked[s - 1] === ' ') {
            const open = s - cast[0].length - 1;
            if (open >= 0 && masked[open] === '(') {
                const target = j09Type (cast[1]);
                const ok = (family === 'toMapArg' && j09IsMap (target)) || (family === 'toStringListArg' && /^(?:List|ArrayList|LinkedList)<String>$/.test (target))
                    || (family === 'toLongOrNull' && target === 'Long') || (family === 'toInt64' && (target === 'long' || target === 'int'))
                    || (family === 'objectKeys' && /^(?:List|ArrayList|LinkedList)<Object>$/.test (target)) || (family === 'add' && target === 'Object');
                if (ok) { s = open; e++; continue; }
            }
        }
        break;
    }
    return { start: s, end: e, text: nat };
}

export function nativeJavaJ09SwitchBlobs (content: string): string {
    if (!content.includes ('switch ((Object)')) { return content; }
    const masked = j09Mask (content);
    const sites: J09Site[] = [];
    let from = 0;
    for (;;) {
        const at = masked.indexOf ('switch ((Object)', from);
        if (at === -1) { break; }
        from = at + 1;
        const site = j09Site (content, masked, at);
        if (site !== undefined) { sites.push (site); }
    }
    if (sites.length === 0) { return content; }
    let out = content;
    let floor = out.length;
    for (let i = sites.length - 1; i >= 0; i--) {
        const site = sites[i];
        if (site.end >= floor) { continue; } // nested inside a site already rewritten
        out = out.slice (0, site.start) + site.text + out.slice (site.end + 1);
        floor = site.start;
    }
    return out;
}

export function j09SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (sig: string, strings: string, body: string) => `public class Woo extends WooApi\n{\n    public Object m(${sig})\n    {\n${body}\n    }\n}`;
    const MAP = 'Map<String, Object> parameters';
    const OBJ = 'Object parameters';
    const toMapArg = '((Map<String, Object>) (switch ((Object) (parameters)) { case null -> (Map<String, Object>) null; case Map<?, ?> hx4J40v1 -> (Map<String, Object>) hx4J40v1; case Object hx4J40v1 -> throw new ClassCastException("ccxt: expected a dictionary, got " + hx4J40v1.getClass().getName()); }))';
    const toListArg = '((List<String>) (switch ((Object) (s)) { case null -> (List<String>) null; case List<?> hx4J40v2 -> (List<String>) hx4J40v2; case Object hx4J40v2 -> throw new ClassCastException("ccxt: expected a list of strings, got " + hx4J40v2.getClass().getName()); }))';
    const toLong = '((Long) (switch ((Object) (q)) { case null -> (Long) null; case Long hx4J40v3 -> hx4J40v3; case Number hx4J40v3 -> Long.valueOf(hx4J40v3.longValue()); case Object hx4J40v3 -> throw new ClassCastException("ccxt: expected a number, got " + hx4J40v3.getClass().getName()); }))';
    const objKeys = '((List<Object>) switch ((Object)(featuresObj)) { case Map<?, ?> j39v1 -> { synchronized (j39v1) { yield new ArrayList<Object>(j39v1.keySet()); } } case null, default -> new ArrayList<Object>(); })';
    const arrLen = '(switch ((Object)(chains)) { case null -> 0; case List<?> j39v2 -> j39v2.size(); case String j39v3 -> j39v3.length(); case Object j39v4 -> j39v4.getClass().isArray() ? java.lang.reflect.Array.getLength(j39v4) : 0; })';
    const inOp = '((switch ((Object)(parameters)) { case List<?> j39v5 -> j39v5.contains("coin"); case Map<?, ?> j39v6 -> j39v6.containsKey("coin"); case null, default -> false; }))';
    const addLit = '((Object) (switch ((Object) (pricePrecision)) { case null -> (Object) null; case Long hx4J40v7 -> (Object) (hx4J40v7 + 1L); case Integer hx4J40v7 -> (Object) (hx4J40v7.longValue() + 1L); case String hx4J40v7 -> (Object) (hx4J40v7 + "1"); default -> (Object) null; }))';
    const cases: [string, string, string, string | undefined][] = [
        // signature, body, expected substring (undefined keeps the site)
        [ 'toMapArg Map param', MAP, '        return this.f(' + toMapArg + ');', 'this.f(parameters)' ],
        [ 'toMapArg Object param', OBJ, '        return this.f(' + toMapArg + ');', undefined ],
        [ 'toStringListArg List<String> local', MAP, '        List<String> s = new ArrayList<String>();\n        return this.f(' + toListArg + ');', 'this.f(s)' ],
        [ 'toStringListArg List<Object> local', MAP, '        List<Object> s = new ArrayList<Object>();\n        return this.f(' + toListArg + ');', undefined ],
        [ 'toLongOrNull Long local', MAP, '        Long q = n;\n        return this.f(' + toLong + ');', 'this.f(q)' ],
        [ 'toLongOrNull Integer local', MAP, '        Integer q = 1;\n        return this.f(' + toLong + ');', undefined ],
        [ 'objectKeys Map local', MAP, '        Map<String, Object> featuresObj = new HashMap<String, Object>();\n        List<Object> keys = ' + objKeys + ';', 'featuresObj.keySet()' ],
        [ 'objectKeys Object local', MAP, '        Object featuresObj = p;\n        List<Object> keys = ' + objKeys + ';', undefined ],
        [ 'getArrayLength List local', MAP, '        List<Object> chains = new ArrayList<Object>();\n        for (var j = 0; j < ' + arrLen + ') {}', 'chains.size()' ],
        [ 'getArrayLength Object local', MAP, '        Object chains = p;\n        for (var j = 0; j < ' + arrLen + ') {}', undefined ],
        [ 'inOp Map param', MAP, '        if (' + inOp + ') {}', 'parameters.containsKey("coin")' ],
        [ 'inOp Object param', OBJ, '        if (' + inOp + ') {}', undefined ],
        [ 'add Long local', MAP, '        Long pricePrecision = n;\n        return ' + addLit + ';', 'pricePrecision + 1L' ],
        [ 'add Object local', MAP, '        Object pricePrecision = p;\n        return ' + addLit + ';', undefined ],
    ];
    for (const [ name, sig, body, expect ] of cases) {
        const src = cls (sig, '', body);
        const out = nativeJavaJ09SwitchBlobs (src);
        const ok = expect === undefined ? out === src : out.includes (expect) && !out.includes ('switch ((Object)') && nativeJavaJ09SwitchBlobs (out) === out;
        if (!ok) { problems.push (`hx10w6 J09: ${name}\n${out}`); }
    }
    return problems;
}
