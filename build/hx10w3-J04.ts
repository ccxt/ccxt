// hx10 wave 3 J04: `this.options` prints native map ops. The runtime header types the field
// Map<String, Object> over a ConcurrentHashMap (SharedStateRaceTest pins that class), so a write
// replays Helpers.addElementToObject exactly when the value can never be null (put) or is the null
// literal (the helper's own `null -> remove` branch for a ConcurrentHashMap), and a read is a plain
// get on a proven String key. Anything unproven keeps the helper call as it stands. Field facts are
// read from the hand-written headers, so a runtime unit that retypes `options` is picked up here.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const J04_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
const J04_HEADERS = [ 'BaseExchange.java', 'Exchange.java', 'PredictionExchange.java' ].map ((f) => path.join (J04_ROOT, f));
const J04_DELIM = '// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT';
const OPTIONS_FIELD = /^ {4}public\s+Map<\s*String\s*,\s*Object\s*>\s+options\s*=\s*new\s+(?:java\.util\.concurrent\.)?(?:ConcurrentHashMap|SynchronizedOptions)/m;
const DECL_STOP = [ 'return', 'new', 'else', 'case', 'throw', 'instanceof', 'yield', 'assert' ];

const norm = (t: string) => t.replace (/^java\.util\.concurrent\./, '').replace (/^java\.util\./, '').replace (/\s+/g, ' ').trim ();
const NUMBER_TYPES = new Set ([ 'long', 'int', 'short', 'byte', 'double', 'float', 'Long', 'Integer', 'Double', 'Float', 'Short', 'Byte' ]);
const PRIMITIVE_TYPES = new Set ([ 'long', 'int', 'short', 'byte', 'char', 'double', 'float', 'boolean' ]);
// Helpers statics that answer a primitive boolean (Helpers.java signatures), so never null
const boolHelpers = /^Helpers\.(?:isEqual|isGreaterThan|isGreaterThanOrEqual|isLessThan|isLessThanOrEqual|inOp|isTrue|startsWith|endsWith|isArray|isString|isInteger|isFloat|isObject)\(/;
// base methods whose printed return is boxed but whose body never answers null:
// milliseconds / seconds -> long (Time.java), sum -> Generic.sum (nulls cost 0, never null)
const boxedMethods = new Set ([ 'milliseconds', 'seconds', 'sum' ]);

function closeOf (text: string, open: number): number {
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

function splitArgs (text: string): string[] | undefined {
    const out: string[] = [];
    let depth = 0, at = 0;
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

const ident = (e: string) => /^[A-Za-z_]\w*$/.test (e) && !/^(?:this|null|true|false|new|undefined)$/.test (e);
const strLit = (e: string) => /^"(?:[^"\\]|\\.)*"$/.test (e);
const numLit = (e: string) => /^-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?[LD]?$/.test (e);
const nullLit = (e: string) => /^(?:null|undefined)$/.test (e.trim ());
const requireNonNull = /^java\.util\.Objects\.requireNonNullElse\s*\(/;
const equalsCall = /^(?:(?:java\.util\.)?Objects\.(?:equals|deepEquals)|[A-Za-z_][\w.]*\.equals)\s*\(/;

function castParts (e: string): [string, string] | undefined {
    const m = /^\(([\w.<>, ?\[\]]+)\)\s*(\S.*)$/s.exec (e);
    if (m === null) return undefined;
    const type = m[1].trim ();
    // `(a - b)` is a parenthesised expression, not a cast
    if (!/^[\w.<>\[\]?]+$/.test (type)) return undefined;
    return [ type, m[2] ];
}

let optionsProven: boolean | undefined;

// the runtime header declares `options` a ConcurrentHashMap-backed Map<String, Object> and no other
// class in the tree declares the name, so a `this.options` site reads exactly that static type
function optionsIsMap (): boolean {
    if (optionsProven !== undefined) return optionsProven;
    optionsProven = false;
    for (const file of J04_HEADERS) {
        let header = '';
        try { header = fs.readFileSync (file, 'utf8').split (J04_DELIM)[0]; } catch (e) { continue; }
        if (OPTIONS_FIELD.test (header)) { optionsProven = true; break; }
    }
    return optionsProven;
}

let overrideNames: Set<string> | undefined;

function overrides (): Set<string> {
    if (overrideNames !== undefined) return overrideNames;
    const names = new Set<string> ();
    const walk = (dir: string) => {
        let entries: string[] = [];
        try { entries = fs.readdirSync (dir); } catch (e) { return; }
        for (const name of entries) {
            const full = path.join (dir, name);
            let stat;
            try { stat = fs.statSync (full); } catch (e) { continue; }
            if (stat.isDirectory ()) { walk (full); continue; }
            if (!name.endsWith ('.java') || (J04_HEADERS as string[]).includes (full)) continue;
            let text = '';
            try { text = fs.readFileSync (full, 'utf8'); } catch (e) { continue; }
            for (const m of text.matchAll (/^ {4}(?:public|protected|private)[\w<>\[\], .]*\s(\w+)\s*\(/gm)) names.add (m[1]);
        }
    };
    walk (path.join (J04_ROOT, 'exchanges'));
    overrideNames = names;
    return names;
}

const returnTypes = new Map<string, string | undefined> ();
let returnScan = false;

// the printed return type of `this.name(...)`: undefined when overloads disagree or a venue overrides it
function baseReturnType (name: string): string | undefined {
    if (!returnScan) {
        returnScan = true;
        for (const file of J04_HEADERS) {
            let header = '';
            try { header = fs.readFileSync (file, 'utf8').split (J04_DELIM)[0]; } catch (e) { continue; }
            for (const m of header.matchAll (/^ {4}(?:public|protected|private)\s+([\w<>\[\], .]+?)\s+(\w+)\s*\(/gm)) {
                const type = norm (m[1]);
                const seen = returnTypes.get (m[2]);
                returnTypes.set (m[2], seen === undefined || seen === type ? type : undefined);
            }
        }
    }
    if (overrides ().has (name)) return undefined;
    return returnTypes.get (name);
}

// the single declared type of `name` in `member` (parameters included); undefined when shadowed or mixed
function declaredType (member: string, name: string): string | undefined {
    const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?]+(?:<[\\w.?, ]*>)?(?:, [\\w.?]+(?:<[\\w.?, ]*>)?)*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'gm');
    const types = new Set<string> ();
    for (const m of member.matchAll (re)) {
        const t = m[1].replace (/^final /, '');
        if (DECL_STOP.includes (t)) continue;
        types.add (t);
    }
    const shadowed = new RegExp (`(?<![\\w.])${name}\\s*->`).test (member);
    return !shadowed && types.size === 1 ? [ ...types ][0] : undefined;
}

function isParam (member: string, name: string): boolean {
    const nl = member.indexOf ('\n');
    const sig = (nl === -1 ? member : member.slice (0, nl)).replace (/\{.*$/, '');
    return new RegExp (`[(,]\\s*(?:final\\s+)?[\\w.<>, ?\\[\\]]+ ${name}\\s*[,)]`).test (sig);
}

// the top-level binary +-*/% of `e` (outside brackets and literals, with a left operand), or undefined
function topLevelOp (e: string): { op: string, at: number } | undefined {
    let depth = 0;
    for (let i = 0; i < e.length; i++) {
        const c = e[i];
        if (c === '"' || c === "'") {
            for (let j = i + 1; j < e.length; j++) {
                if (e[j] === '\\') { j++; continue; }
                if (e[j] === c) { i = j; break; }
            }
            continue;
        }
        if (c === '(' || c === '[' || c === '{') { depth++; continue; }
        if (c === ')' || c === ']' || c === '}') { depth--; continue; }
        if (depth !== 0 || !'+-*/%'.includes (c)) continue;
        const prev = e.slice (0, i).trimEnd ().slice (-1);
        const next = e[i + 1];
        if (!/[\w)\]"']/.test (prev)) continue; // unary
        if (next === '=' || (c === '+' && next === '+') || (c === '-' && (next === '-' || next === '>'))) continue;
        return { op: c, at: i };
    }
    return undefined;
}

function isNumeric (member: string, e: string, depth: number): boolean {
    if (depth > 3) return false;
    const v = unparen (e);
    if (numLit (v)) return true;
    if (ident (v)) {
        const t = declaredType (member, v);
        return t !== undefined && NUMBER_TYPES.has (norm (t));
    }
    const cast = castParts (v);
    if (cast !== undefined) {
        const t = norm (cast[0]);
        return (NUMBER_TYPES.has (t) || PRIMITIVE_TYPES.has (t)) && isNumeric (member, cast[1], depth + 1);
    }
    const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (v);
    if (call !== null) {
        const t = baseReturnType (call[1]);
        return t !== undefined && NUMBER_TYPES.has (t);
    }
    const op = topLevelOp (v);
    if (op !== undefined) return isNumeric (member, v.slice (0, op.at), depth + 1) && isNumeric (member, v.slice (op.at + 1), depth + 1);
    return false;
}

// `cond ? a : b` -> [a, b]; undefined when there is no top-level `?:`
function ternaryArms (e: string): [string, string] | undefined {
    let depth = 0, q = -1;
    for (let i = 0; i < e.length; i++) {
        const c = e[i];
        if (c === '"' || c === "'") {
            for (let j = i + 1; j < e.length; j++) {
                if (e[j] === '\\') { j++; continue; }
                if (e[j] === c) { i = j; break; }
            }
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (depth === 0 && c === '?') q = i;
        else if (depth === 0 && c === ':' && q !== -1) return [ e.slice (q + 1, i).trim (), e.slice (i + 1).trim () ];
    }
    return undefined;
}

const joinVisiting = new Set<string> ();

// the right-hand sides of every write of `name` in the member, or undefined when a write is not a
// plain `=` statement (compound assignment, increment, or an assignment split over lines)
function writesOf (member: string, name: string): string[] | undefined {
    if (new RegExp (`(?<![\\w.])${name}\\s*(?:\\+=|-=|\\*=|/=|%=|\\+\\+|--)`).test (member)) return undefined;
    const out: string[] = [];
    for (const m of member.matchAll (new RegExp (`(?<![\\w.])${name}\\s*=\\s*(?!=)`, 'g'))) {
        const at = m.index! + m[0].length;
        const semi = member.indexOf (';', at);
        const nl = member.indexOf ('\n', at);
        if (semi === -1 || (nl !== -1 && nl < semi)) return undefined;
        out.push (member.slice (at, semi).trim ());
    }
    return out;
}

// a local whose every write is a non-null expression is non-null at the read site
function writesNonNull (member: string, name: string, depth: number): boolean {
    if (depth > 3) return false;
    const decl = declaredType (member, name);
    if (decl === undefined || isParam (member, name)) return false;
    const key = `${name}\u0000${member}`;
    if (joinVisiting.has (key)) return false;
    const rhs = writesOf (member, name);
    if (rhs === undefined || rhs.length === 0) return false;
    joinVisiting.add (key);
    const ok = rhs.every ((r) => nonNullValue (member, r, depth + 1));
    joinVisiting.delete (key);
    return ok;
}

// the printed value can never be null: a put of it stores what the helper would have stored
function nonNullValue (member: string, value: string, depth: number): boolean {
    if (depth > 4) return false;
    const v = unparen (value);
    if (strLit (v) || numLit (v) || v === 'true' || v === 'false') return true;
    if (/^new [\w.]+(?:<[\w.<>, ?]*>)?\(/.test (v)) return true;
    if (/^[A-Za-z_][\w.]*\.class$/.test (v)) return true;
    if (nullLit (v)) return false;
    if (requireNonNull.test (v)) {
        const open = v.indexOf ('(');
        const close = closeOf (v, open);
        if (close !== v.length - 1) return false;
        const args = splitArgs (v.slice (open + 1, close));
        // answers its first non-null argument
        return args !== undefined && args.some ((a) => nonNullValue (member, a, depth + 1));
    }
    if (equalsCall.test (v)) return true;
    if (boolHelpers.test (v)) return true;
    const cast = castParts (v);
    if (cast !== undefined) return nonNullValue (member, cast[1], depth + 1);
    const arms = ternaryArms (v);
    if (arms !== undefined) return nonNullValue (member, arms[0], depth + 1) && nonNullValue (member, arms[1], depth + 1);
    const op = topLevelOp (v);
    if (op !== undefined) {
        // unboxing arithmetic: a null operand throws instead of storing, so the value is never null
        return isNumeric (member, v.slice (0, op.at), depth + 1) && isNumeric (member, v.slice (op.at + 1), depth + 1);
    }
    const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (v);
    if (call !== null) {
        const type = baseReturnType (call[1]);
        if (type !== undefined && PRIMITIVE_TYPES.has (type)) return true;
        return boxedMethods.has (call[1]);
    }
    if (ident (v)) {
        const type = declaredType (member, v);
        if (type !== undefined && PRIMITIVE_TYPES.has (norm (type))) return true;
        return writesNonNull (member, v, depth + 1);
    }
    return false;
}

// a key that is never null: a string literal, a String-typed name, or a name whose only write is a literal
function nonNullKey (member: string, key: string): boolean {
    const k = unparen (key);
    if (strLit (k)) return true;
    if (requireNonNull.test (k)) return nonNullValue (member, k, 0);
    if (!ident (k)) return false;
    const type = declaredType (member, k);
    if (type !== undefined && norm (type) === 'String') return true;
    const rhs = writesOf (member, k);
    return rhs !== undefined && rhs.length === 1 && strLit (unparen (rhs[0]));
}

// `Helpers.GetValue(this.options, <proven key>)` -> `this.options.get(key)` anywhere in the line
function nativeReads (member: string, line: string): string {
    let out = line;
    for (let guard = 0; guard < 8; guard++) {
        const at = out.indexOf ('Helpers.GetValue(this.options, ');
        if (at === -1) return out;
        const open = at + 'Helpers.GetValue'.length;
        const close = closeOf (out, open);
        if (close === -1) return out;
        const args = splitArgs (out.slice (open + 1, close));
        if (args === undefined || args.length !== 2 || !nonNullKey (member, args[1])) return out;
        out = out.slice (0, at) + `this.options.get(${args[1]})` + out.slice (close + 1);
    }
    return out;
}

function j04Member (member: string): string {
    if (!member.includes ('Helpers.addElementToObject(this.options, ') && !member.includes ('Helpers.GetValue(this.options, ')) return member;
    if (!optionsIsMap ()) return member;
    const lines = member.split ('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes ('Helpers.')) continue;
        let line = nativeReads (member, lines[i]);
        const indent = /^\s*/.exec (line)![0];
        const body = line.slice (indent.length);
        if (body.startsWith ('Helpers.addElementToObject(this.options, ')) {
            const open = body.indexOf ('(');
            const close = closeOf (body, open);
            if (close !== -1) {
                const tail = body.slice (close + 1);
                const args = splitArgs (body.slice (open + 1, close));
                if (/^;\s*(?:\/\/.*)?$/.test (tail) && args !== undefined && args.length === 3 && nonNullKey (member, args[1])) {
                    const key = args[1], value = args[2];
                    let native: string | undefined;
                    if (nullLit (value)) native = `this.options.remove(${key});`;
                    else if (nonNullValue (member, value, 0)) native = `this.options.put(${key}, ${value});`;
                    if (native !== undefined) line = indent + native + tail.slice (1);
                }
            }
        }
        if (line !== lines[i]) { lines[i] = line; changed = true; }
    }
    return changed ? lines.join ('\n') : member;
}

export function nativeJavaJ04OptionsOps (content: string): string {
    if (!content.includes ('Helpers.addElementToObject(this.options, ') && !content.includes ('Helpers.GetValue(this.options, ')) return content;
    const lines = content.split ('\n');
    const starts: number[] = [ 0 ];
    for (let i = 1; i < lines.length; i++) if (/^    (?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    starts.push (lines.length);
    const parts: string[] = [];
    let changed = false;
    for (let s = 0; s + 1 < starts.length; s++) {
        const before = lines.slice (starts[s], starts[s + 1]).join ('\n');
        const after = j04Member (before);
        if (after !== before) changed = true;
        parts.push (after);
    }
    return changed ? parts.join ('\n') : content;
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function j04OptionsSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Gemini extends GeminiRest\n{\n${body}\n}\n`;
    const run = (body: string) => nativeJavaJ04OptionsOps (cls (body));
    const unchanged = (t: string) => nativeJavaJ04OptionsOps (t) === t;
    const pos: [string, string, string][] = [
        [ 'null value removes',
          '    public void setKey()\n    {\n        Helpers.addElementToObject(this.options, "listenKey", null);\n    }',
          '        this.options.remove("listenKey");' ],
        [ 'non-null literal puts',
          '    public void setKey()\n    {\n        Helpers.addElementToObject(this.options, "chainId", 97);\n    }',
          '        this.options.put("chainId", 97);' ],
        [ 'primitive local arithmetic puts',
          '    public void setExpiry()\n    {\n        long now = this.milliseconds();\n        Helpers.addElementToObject(this.options, "signInExpiration", (now + 86400000L));\n    }',
          '        this.options.put("signInExpiration", (now + 86400000L));' ],
        [ 'boolean-equality value puts',
          '    public void setMode(Object result)\n    {\n        Helpers.addElementToObject(this.options, "enableUnifiedMargin", java.util.Objects.equals(this.safeInteger(result, "unified"), 1L));\n    }',
          'this.options.put("enableUnifiedMargin", java.util.Objects.equals(this.safeInteger(result, "unified"), 1L));' ],
        [ 'primitive-return call puts',
          '    public void stamp()\n    {\n        Helpers.addElementToObject(this.options, "limitsLoaded", this.microseconds());\n    }',
          '        this.options.put("limitsLoaded", this.microseconds());' ],
        [ 'boxed runtime call puts',
          '    public void stamp()\n    {\n        Helpers.addElementToObject(this.options, "limitsLoaded", this.milliseconds());\n    }',
          '        this.options.put("limitsLoaded", this.milliseconds());' ],
        [ 'single non-null write joins',
          '    public Long requestId()\n    {\n        Long next = (Long) this.sum(this.safeInteger(this.options, "requestId", 0), 1);\n        Helpers.addElementToObject(this.options, "requestId", next);\n        return next;\n    }',
          '        this.options.put("requestId", next);' ],
        [ 'numeric ternary puts',
          '    public void setChain(long expiry)\n    {\n        long chainId = (expiry > 0L) ? 300 : 304;\n        Helpers.addElementToObject(this.options, "chainId", chainId);\n    }',
          '        this.options.put("chainId", chainId);' ],
        [ 'requireNonNullElse key puts',
          '    public void setType(Boolean t)\n    {\n        Helpers.addElementToObject(this.options, java.util.Objects.requireNonNullElse(t, "margin"), new java.util.HashMap<String, Object>());\n    }',
          'this.options.put(java.util.Objects.requireNonNullElse(t, "margin"), new java.util.HashMap<String, Object>());' ],
        [ 'String local key reads and writes',
          '    public void put(Object v)\n    {\n        String k = "listenKey";\n        Helpers.addElementToObject(this.options, k, "v");\n        Object current = Helpers.GetValue(this.options, k);\n    }',
          '        this.options.put(k, "v");\n        Object current = this.options.get(k);' ],
    ];
    for (const [ name, body, expect ] of pos) {
        const out = run (body);
        if (!out.includes (expect)) problems.push (`hx10 J04: ${name} expected ${expect} in\n${out}`);
        if (!unchanged (out)) problems.push (`hx10 J04: ${name} not idempotent`);
    }
    const neg: [string, string][] = [
        [ 'boxed parameter value', '    public void setSandboxMode(Boolean enable)\n    {\n        Helpers.addElementToObject(this.options, "sandboxMode", enable);\n    }' ],
        [ 'nullable safeString value', '    public void setAccount(Object data)\n    {\n        Helpers.addElementToObject(this.options, "accountId", this.safeString(data, "id", "0"));\n    }' ],
        [ 'nullable parseToInt value', '    public void setIndex(Object n)\n    {\n        Helpers.addElementToObject(this.options, "apiKeyIndex", this.parseToInt(n));\n    }' ],
        [ 'Object key', '    public void put(Object helper, Object v)\n    {\n        Helpers.addElementToObject(this.options, helper, v);\n    }' ],
        [ 'boxed local written twice', '    public void put(Object v)\n    {\n        Long id = this.safeInteger(v, "id");\n        id = this.safeInteger(v, "other");\n        Helpers.addElementToObject(this.options, "id", id);\n    }' ],
        [ 'other receiver', '    public void put(Object v)\n    {\n        Helpers.addElementToObject(this.markets, "id", v);\n    }' ],
    ];
    for (const [ name, body ] of neg) {
        const input = cls (body);
        if (!unchanged (input)) problems.push (`hx10 J04: ${name} must keep the helper\n${input}`);
    }
    return problems;
}
