// hx10 wave 4 OJ01: `exchange.options` is one owner store (BaseExchange.SynchronizedOptions):
// a writer publishes immutable snapshots and `put(key, null)` removes the key, which is exactly the
// element-write contract the printer's helper had on the previous ConcurrentHashMap. A literal-key
// two-arg write on `this.options` therefore prints as the native `put`; every other site keeps the
// helper. The loadMarkets currency hand-off reads the owner field instead of a shared options entry.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OJ01_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
const OJ01_HEADERS = [ 'BaseExchange.java', 'Exchange.java', 'PredictionExchange.java' ].map ((f) => path.join (OJ01_ROOT, f));
const OJ01_DELIM = '// METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT';
const OWNER_FIELD = /^ {4}public\s+Map<\s*String\s*,\s*Object\s*>\s+options\s*=\s*new\s+(?:[A-Za-z_][\w.]*\.)?SynchronizedOptions\s*\(/m;
const HANDOFF_NULL = /this\.safeDict\s*\(\s*this\.options\s*,\s*"cachedCurrencies"\s*,\s*\(Object\)\s*null\s*\)/g;
const HANDOFF_EMPTY = /this\.safeDict\s*\(\s*this\.options\s*,\s*"cachedCurrencies"\s*,\s*new\s+(?:java\.util\.)?HashMap<String, Object>\s*\(\s*\)\s*\{\{\}\}\s*\)/g;

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

const strLit = (e: string) => /^"(?:[^"\\]|\\.)*"$/.test (e.trim ());

let ownerProven: boolean | undefined;

// `options` reads exactly `Map<String, Object>` over the owner store, so the field's contract is
// what the emitted put relies on; a header that declares anything else disables the whole pass
function optionsIsOwnerStore (): boolean {
    if (ownerProven !== undefined) return ownerProven;
    ownerProven = false;
    for (const file of OJ01_HEADERS) {
        let header = '';
        try { header = fs.readFileSync (file, 'utf8').split (OJ01_DELIM)[0]; } catch (e) { continue; }
        if (OWNER_FIELD.test (header)) { ownerProven = true; break; }
    }
    return ownerProven;
}

// Helpers.addElementToObject(this.options, "key", value) -> this.options.put ("key", value)
// Only a literal String key: the store is typed Map<String, Object>, and every other key shape
// (Object parameter, computed key) keeps the helper exactly as printed.
export function oj01NativeOptionsWrites (content: string): string {
    if (!optionsIsOwnerStore ()) return content;
    const H = 'Helpers.addElementToObject(';
    let out = '';
    let at = 0;
    for (;;) {
        const i = content.indexOf (H, at);
        if (i < 0) { out += content.slice (at); break; }
        const open = i + H.length - 1;
        const close = closeOf (content, open);
        if (close < 0) { out += content.slice (at); break; }
        const args = splitArgs (content.slice (open + 1, close));
        out += content.slice (at, i);
        if (args === undefined || args.length !== 3 || args[0] !== 'this.options' || !strLit (args[1])) {
            out += content.slice (i, close + 1);
        } else {
            out += 'this.options.put(' + args[1] + ', ' + args[2] + ')';
        }
        at = close + 1;
    }
    return out;
}

// the loadMarkets currency hand-off is an owner field now, not an entry in the shared options map
export function oj01CachedCurrenciesHandoff (content: string): string {
    if (!optionsIsOwnerStore ()) return content;
    return content
        .replace (HANDOFF_EMPTY, 'this.cachedCurrenciesForLoadOrEmpty()')
        .replace (HANDOFF_NULL, 'this.cachedCurrenciesForLoad()');
}

export function hx10w4OJ01OptionsOwner (content: string): string {
    if (!optionsIsOwnerStore ()) return content;
    return oj01CachedCurrenciesHandoff (oj01NativeOptionsWrites (content));
}

export function oj01OptionsSelfTest (): string[] {
    const problems: string[] = [];
    if (!optionsIsOwnerStore ()) {
        problems.push ('hx10w4 OJ01: BaseExchange.java must declare `options = new SynchronizedOptions ()`');
        return problems;
    }
    const cls = (body: string) => `public class Gemini extends GeminiRest\n{\n${body}\n}\n`;
    const run = (body: string) => hx10w4OJ01OptionsOwner (cls (body));
    const unchanged = (t: string) => hx10w4OJ01OptionsOwner (t) === t;
    const pos: [string, string, string][] = [
        [ 'nullable boxed value puts',
          '    public void setSandboxMode(Object enable)\n    {\n        Helpers.addElementToObject(this.options, "sandboxMode", enable);\n    }',
          'this.options.put("sandboxMode", enable);' ],
        [ 'nullable call value puts',
          '    public void setAccount(Object data)\n    {\n        Helpers.addElementToObject(this.options, "accountId", this.safeString(data, "id", "0"));\n    }',
          'this.options.put("accountId", this.safeString(data, "id", "0"));' ],
        [ 'multi-line nested value puts',
          '    public void setConfig(Object response)\n    {\n        Helpers.addElementToObject(this.options, "systemConfig", new java.util.HashMap<String, Object>() {{\n            put("a", response);\n        }});\n    }',
          'this.options.put("systemConfig", new java.util.HashMap<String, Object>() {{' ],
        [ 'cachedCurrencies null default',
          '    public void read()\n    {\n        Map<String, Object> currencies = (Map<String, Object>) this.safeDict(this.options, "cachedCurrencies", (Object) null);\n    }',
          'this.cachedCurrenciesForLoad()' ],
        [ 'cachedCurrencies empty default',
          '    public void read()\n    {\n        Map<String, Object> currencies = (Map<String, Object>) this.safeDict(this.options, "cachedCurrencies", new HashMap<String, Object>() {{}});\n    }',
          'this.cachedCurrenciesForLoadOrEmpty()' ],
    ];
    for (const [ name, body, expect ] of pos) {
        const out = run (body);
        if (!out.includes (expect)) problems.push (`hx10w4 OJ01: ${name} expected ${expect} in\n${out}`);
        if (!unchanged (out)) problems.push (`hx10w4 OJ01: ${name} not idempotent`);
    }
    const neg: [string, string][] = [
        [ 'Object key', '    public void put(Object helper, Object value)\n    {\n        Helpers.addElementToObject(this.options, helper, value);\n    }' ],
        [ 'other receiver', '    public void put(Object value)\n    {\n        Helpers.addElementToObject(this.markets, "id", value);\n    }' ],
        [ 'one arg', '    public void put(Object value)\n    {\n        Helpers.addElementToObject(this.options, value);\n    }' ],
        [ 'read keeps helper', '    public void read()\n    {\n        Object value = Helpers.GetValue(this.options, "ws");\n    }' ],
        [ 'other cached key', '    public void read()\n    {\n        Object value = this.safeDict(this.options, "cachedCurrenciesById", new HashMap<String, Object>() {{}});\n    }' ],
    ];
    for (const [ name, body ] of neg) {
        const input = cls (body);
        if (!unchanged (input)) problems.push (`hx10w4 OJ01: ${name} must keep the helper\n${input}`);
    }
    return problems;
}
