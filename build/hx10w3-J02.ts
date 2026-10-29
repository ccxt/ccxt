// hx10w3 J02 — native `put` on this.balance.
//
// BaseExchange's hand-written header declares `balance` a plain Map<String, Object> backed by a
// HashMap and every write of the field in the tree is a fresh map, so the helper's Map branch and
// `this.balance.put(k, v)` agree on every value except `null` on a ConcurrentHashMap (the helper
// removes the key there). A put is therefore emitted only where the value can never be null; a
// nullable value keeps the helper call verbatim.
//
// Non-null proofs are read from the port's own sources: a literal, `new ...`, or a call to a method
// whose every `return` in the tree is one of those (fixpoint, so safeBalance's `new Balances(...)`
// counts), or a local whose every write in the member is one of those.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const J02_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
const J02_BASE = path.join (J02_ROOT, 'BaseExchange.java');
const J02_DELIM = '// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT';
const J02_BALANCE_DECL = /^\s+public Map<String, Object> balance = new HashMap<>\(\);\s*$/m;
const J02_CALL = 'Helpers.addElementToObject(this.balance,';
const J02_STRING_LITERAL = /^"(?:[^"\\]|\\.)*"$/;
const J02_STOP = [ 'return', 'new', 'else', 'case', 'throw', 'instanceof', 'yield', 'assert' ];

// same-length copy with string / char / comment bodies blanked, so structure scans never read them
function j02Mask (text: string): string {
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

function j02Close (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') { if (--depth === 0) return i; }
    }
    return -1;
}

// top-level comma split; string literals and generic argument lists stay whole
function j02Split (text: string): string[] | undefined {
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

// one member: from its `    public/...` line to the next one
function j02Member (lines: string[], index: number): { text: string, start: number } {
    let start = index;
    while (start > 0 && !/^ {4}(?:public|private|protected)\b/.test (lines[start])) start--;
    let end = start + 1;
    while (end < lines.length && !/^ {4}(?:public|private|protected)\b/.test (lines[end])) end++;
    return { text: lines.slice (start, end).join ('\n'), start };
}

function j02Types (member: string, name: string): string[] {
    const types = new Set<string> ();
    const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'gm');
    for (const m of member.matchAll (re)) {
        const t = m[1].replace (/^final /, '');
        if (J02_STOP.includes (t)) continue;
        types.add (t);
    }
    return [ ...types ];
}

function j02IsParam (member: string, name: string): boolean {
    const newline = member.indexOf ('\n');
    const signature = (newline === -1 ? member : member.slice (0, newline)).replace (/\{.*$/, '');
    return new RegExp (`[(,]\\s*(?:final\\s+)?[\\w.<>, ?\\[\\]]+ ${name}\\s*[,)]`).test (signature);
}

// every value assigned to `name` in the member (initializer included); undefined when one is multi-line
function j02Writes (member: string, name: string): string[] | undefined {
    const masked = j02Mask (member);
    const writes: string[] = [];
    const re = new RegExp (`(?<![\\w.])${name}\\s*=(?![=>])(?<![+\\-*/%&|^]=)`, 'g');
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
            else if (c === '\n' && depth === 0) return undefined;
        }
        if (end === -1) return undefined;
        writes.push (member.slice (at, end).trim ());
    }
    return writes;
}

function j02Unparen (text: string): string {
    let t = text.trim ();
    for (;;) {
        if (!t.startsWith ('(')) return t;
        const close = j02Close (t, 0);
        if (close !== t.length - 1) return t;
        t = t.slice (1, -1).trim ();
    }
}

let producersCache: Set<string> | undefined;
let fieldIsMapCache: boolean | undefined;

// every method whose every `return` in the port's own sources is a literal / `new ...` / a call to
// another such method — a fixpoint, so an unproven shape (a bare local, a nullable producer) keeps
// the name out and its call is never treated as non-null
function j02Producers (): Set<string> {
    if (producersCache !== undefined) return producersCache;
    const returns = new Map<string, string[][]> ();
    const walk = (dir: string) => {
        let names: string[] = [];
        try { names = fs.readdirSync (dir); } catch (e) { return; }
        for (const name of names) {
            const full = path.join (dir, name);
            let stat;
            try { stat = fs.statSync (full); } catch (e) { continue; }
            if (stat.isDirectory ()) { walk (full); continue; }
            if (!name.endsWith ('.java')) continue;
            let text = '';
            try { text = j02Mask (fs.readFileSync (full, 'utf8')); } catch (e) { continue; }
            const signature = /(?:public|protected|private)[\w<>\[\], .]*\s(\w+)\s*\([^;{]*\)\s*(?:throws [\w, .]+)?\s*\{/g;
            let m: RegExpExecArray | null;
            while ((m = signature.exec (text)) !== null) {
                const open = text.indexOf ('{', m.index + m[0].length - 1);
                const close = j02Close (text, open);
                if (open < 0 || close < 0) continue;
                const body = text.slice (open, close);
                const found = [ ...body.matchAll (/(?<![\w.])return\s+([^;]+);/g) ].map ((r) => r[1].trim ());
                const list = returns.get (m[1]) ?? [];
                list.push (found);
                returns.set (m[1], list);
            }
        }
    };
    walk (J02_ROOT);
    const producers = new Set<string> ();
    let grew = true;
    let rounds = 0;
    while (grew && rounds < 8) {
        grew = false;
        rounds++;
        for (const [ name, declarations ] of returns) {
            if (producers.has (name)) continue;
            const ok = declarations.every ((found) => found.length > 0 && found.every ((value) => {
                const v = j02Unparen (value);
                if (J02_STRING_LITERAL.test (v) || /^-?\d+(?:\.\d+)?[LD]?$/.test (v) || v === 'true' || v === 'false') return true;
                if (/^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v)) return true;
                const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (v) ?? /^[A-Z][\w.]*\.([A-Za-z_]\w*)\s*\(/.exec (v);
                return call !== null && producers.has (call[1]);
            }));
            if (ok) { producers.add (name); grew = true; }
        }
    }
    producersCache = producers;
    return producers;
}

// the header must still declare the field the rewrite assumes, or the rewrite is unsound
function j02FieldIsMap (): boolean {
    if (fieldIsMapCache !== undefined) return fieldIsMapCache;
    let header = '';
    try { header = fs.readFileSync (J02_BASE, 'utf8').split (J02_DELIM)[0]; } catch (e) { header = ''; }
    fieldIsMapCache = J02_BALANCE_DECL.test (header);
    return fieldIsMapCache;
}

interface J02Options { producers?: Set<string>; fieldIsMap?: boolean }

function j02NonNull (member: string, value: string, producers: Set<string>, depth: number): boolean {
    const v = j02Unparen (value);
    if (J02_STRING_LITERAL.test (v) || /^-?\d+(?:\.\d+)?[LD]?$/.test (v) || v === 'true' || v === 'false') return true;
    if (v === 'null' || v === 'undefined') return false;
    if (/^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v)) return true;
    const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (v) ?? /^[A-Z][\w.]*\.([A-Za-z_]\w*)\s*\(/.exec (v);
    if (call !== null && !/^Helpers$/.test (v.split ('.')[0]) && producers.has (call[1])) return true;
    const cast = /^\([\w.<>, ?\[\]]+\)\s*(.+)$/s.exec (v);
    if (cast !== null && depth < 3) return j02NonNull (member, cast[1], producers, depth + 1);
    if (depth < 2 && /^[A-Za-z_]\w*$/.test (v)) {
        if (j02IsParam (member, v)) return false;
        if (j02Types (member, v).length !== 1) return false;
        const writes = j02Writes (member, v);
        return writes !== undefined && writes.length > 0 && writes.every ((w) => j02NonNull (member, w, producers, depth + 1));
    }
    return false;
}

function j02KeyIsString (member: string, key: string): boolean {
    if (J02_STRING_LITERAL.test (key)) return true;
    if (/^\(\(String\)\s*[A-Za-z_]\w*\s*\)$/.test (key) || /^\(String\)\s*[A-Za-z_]\w*$/.test (key)) return true;
    if (!/^[A-Za-z_]\w*$/.test (key)) return false;
    const types = j02Types (member, key);
    return types.length === 1 && types[0] === 'String';
}

export function hx10w3J02BalancePuts (content: string, options: J02Options = {}): string {
    if (typeof content !== 'string' || !content.includes (J02_CALL)) return content;
    const fieldIsMap = options.fieldIsMap ?? j02FieldIsMap ();
    if (!fieldIsMap) return content;
    const producers = options.producers ?? j02Producers ();
    const lines = content.split ('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes (J02_CALL)) continue;
        if (/^\s*(?:\/\/|\*)/.test (line)) continue;
        const member = j02Member (lines, i);
        const indent = /^(\s*)/.exec (line)![1];
        if (line.slice (indent.length).indexOf (J02_CALL) !== 0) continue;
        const open = indent.length + 'Helpers.addElementToObject'.length;
        const close = j02Close (line, open);
        if (close === -1 || line[close + 1] !== ';') continue;
        const args = j02Split (line.slice (open + 1, close));
        if (args === undefined || args.length !== 3) continue;
        const [ receiver, key, value ] = args;
        if (receiver !== 'this.balance') continue;
        if (!j02KeyIsString (member.text, key)) continue;
        if (!j02NonNull (member.text, value, producers, 0)) continue;
        lines[i] = `${indent}this.balance.put(${key}, ${value});${line.slice (close + 2)}`;
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function j02BalanceSelfTest (): string[] {
    const problems: string[] = [];
    const producers = new Set ([ 'safeBalance', 'extend' ]);
    const run = (body: string, signature = 'Object v') => hx10w3J02BalancePuts (
        `public class Zz02 extends BaseExchange\n{\n    public Object m(${signature})\n    {\n${body}\n    }\n}`,
        { producers, fieldIsMap: true });
    const cases: [string, string, string | undefined][] = [
        [ 'literal value', '        Helpers.addElementToObject(this.balance, "info", "x");', 'this.balance.put("info", "x");' ],
        [ 'fresh map value', '        Helpers.addElementToObject(this.balance, code, new HashMap<String, Object>() {{}});', 'this.balance.put(code, new HashMap<String, Object>() {{}});', 'String code' ],
        [ 'producer call value', '        Helpers.addElementToObject(this.balance, "cash", this.safeBalance(v));', 'this.balance.put("cash", this.safeBalance(v));' ],
        [ 'local with fresh writes', '        Map<String, Object> account = new HashMap<String, Object>() {{}};\n        Helpers.addElementToObject(this.balance, "x", account);', 'this.balance.put("x", account);' ],
        [ 'String-declared key', '        String type = this.safeString(v, "t");\n        Helpers.addElementToObject(this.balance, type, this.extend(v, this.balance));', 'this.balance.put(type, this.extend(v, this.balance));' ],
        // the helper stays: a nullable value, an unproven producer, an Object key, a non-statement position
        [ 'nullable value', '        Long timestamp = this.safeInteger(v, "t");\n        Helpers.addElementToObject(this.balance, "timestamp", timestamp);', undefined ],
        [ 'unproven producer', '        Helpers.addElementToObject(this.balance, "info", this.safeDict(v, "info", (Object) null));', undefined ],
        [ 'Object key', '        Object code = v;\n        Helpers.addElementToObject(this.balance, code, "x");', undefined ],
        [ 'value position', '        return Helpers.addElementToObject(this.balance, "a", "x");', undefined ],
        [ 'guarded get target', '        Helpers.addElementToObject((this.balance == null ? null : this.balance.get("a")), "b", "x");', undefined ],
    ];
    for (const [ name, body, expect, signature ] of cases) {
        const input = run (body, signature);
        const out = hx10w3J02BalancePuts (input, { producers, fieldIsMap: true });
        const ok = expect === undefined ? out === input : out.includes (expect);
        if (!ok) problems.push (`hx10w3 J02: ${name}\n${out}`);
        if (hx10w3J02BalancePuts (out, { producers, fieldIsMap: true }) !== out) problems.push (`hx10w3 J02: ${name} not idempotent`);
    }
    const objectField = hx10w3J02BalancePuts (run (cases[0][1]), { producers, fieldIsMap: false });
    const objectInput = run (cases[0][1]);
    if (objectField !== objectInput) problems.push ('hx10w3 J02: an Object-typed balance field must keep the helper');
    return problems;
}
