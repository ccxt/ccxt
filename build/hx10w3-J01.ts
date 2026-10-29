// hx10w3 J01 — the ws client's futures/subscriptions maps print native ops.
//
// WsClient declares `Map<String, Future> futures` and `Map<String, Object> subscriptions` / `rejections`
// (one message thread owns the write path; the maps stay ConcurrentHashMap, so per-op access is safe).
// Once the receiver type is known the helper and the plain op agree on every value the type allows:
//   * objectKeys / objectValues -> new ArrayList<Object>(m.keySet()) / (m.values()); the helper's only
//     other branch is a null receiver, which these fields never are (initialised, never reassigned).
//   * a J39 keySet replay on one of these fields is the same statement, without the body blob.
//   * addElementToObject -> m.put(k, v) only for a String key and a provably non-null value: a
//     ConcurrentHashMap turns a null value into remove, so a nullable value keeps the helper.
//   * `((Map) client.f)` and a `(io.github.ccxt.ws.Future)` cast on an already-typed value are dropped,
//     and a local that only ever holds one of these maps takes the map's type.
// Everything else keeps the helper / cast exactly as the base emitted it.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const JAVA_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt');
const WS_FIELDS = [ 'futures', 'subscriptions', 'rejections' ];
const MAP_OPS = [ 'get', 'put', 'putIfAbsent', 'remove', 'containsKey', 'keySet', 'values', 'size', 'isEmpty', 'clear', 'entrySet', 'computeIfAbsent' ];
const STRING_KEY_OPS = [ 'put', 'putIfAbsent' ];
const FUTURE = 'io.github.ccxt.ws.Future';
const STRING_LITERAL = /^"(?:[^"\\]|\\.)*"$/;

// same-length copy with string / char / comment bodies blanked, so structure scans never read them
function maskOpaque (text: string): string {
    const out = text.split ('');
    const blank = (from: number, to: number) => {
        for (let k = from; k < to; k++) {
            if (out[k] !== '\n') out[k] = ' ';
        }
    };
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '\'') {
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

function closeOf (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// top-level comma ranges of the call whose '(' sits at `open`
function argRanges (text: string, masked: string, open: number, close: number): { start: number, end: number, value: string }[] {
    const out: { start: number, end: number, value: string }[] = [];
    let depth = 0;
    let start = open + 1;
    const push = (from: number, to: number) => {
        let a = from;
        let b = to;
        while (a < b && /\s/.test (text[a])) a++;
        while (b > a && /\s/.test (text[b - 1])) b--;
        out.push ({ start: a, end: b, value: text.slice (a, b) });
    };
    for (let i = open + 1; i < close; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { push (start, i); start = i + 1; }
    }
    push (start, close);
    return out;
}

function applyEdits (text: string, edits: [ number, number, string ][]): string {
    if (edits.length === 0) return text;
    let out = text;
    for (const [ start, end, replacement ] of edits.slice ().sort ((a, b) => b[0] - a[0])) {
        out = out.slice (0, start) + replacement + out.slice (end);
    }
    return out;
}

const normSpace = (t: string) => t.replace (/\s+/g, ' ').trim ();

const wsFieldOf = (e: string): string | undefined => {
    const m = /^client\.([A-Za-z_]\w*)$/.exec (normSpace (e));
    return m === null || !WS_FIELDS.includes (m[1]) ? undefined : m[1];
};

// a key Java proves String: a literal, an existing String cast, or a String-declared name
function printsStringKey (scope: string, key: string): boolean {
    const k = normSpace (key);
    if (STRING_LITERAL.test (k)) return true;
    if (/^\(\(?String\)/.test (k)) return true;
    if (!/^[A-Za-z_]\w*$/.test (k)) return false;
    return new RegExp ('(?:^|[\\s(,])String ' + k + '(?=\\s*(?:=(?!=)|[,);]))').test (scope);
}

interface Spell { map: string, list: string }

function spelling (content: string): Spell {
    return {
        map: /\bjava\.util\.Map\s*</.test (content) ? 'java.util.Map' : 'Map',
        list: /\bjava\.util\.ArrayList\s*</.test (content) ? 'java.util.ArrayList' : 'ArrayList',
    };
}

function fieldType (field: string, sp: Spell): string {
    return field === 'futures' ? sp.map + '<String, ' + FUTURE + '>' : sp.map + '<String, Object>';
}

// ((Map) client.f).op( / ((Map<?, ?>) client.f).op( / ((Map<String, Object>) client.f).op( -> client.f.op(
const RECEIVER_CAST = /\(\((?:(?:java\.util\.)?Map\s*(?:<\s*(?:\?\s*,\s*\?|String\s*,\s*Object|String\s*,\s*io\.github\.ccxt\.ws\.Future)\s*>)?)\)\s*(client\.[A-Za-z_]\w*)\s*\)\.(\w+)\(/g;

function stripReceiverCasts (content: string): string {
    if (!content.includes ('client.')) return content;
    const masked = maskOpaque (content);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (RECEIVER_CAST)) {
        const field = wsFieldOf (m[1]);
        if (field === undefined || !MAP_OPS.includes (m[2])) continue;
        const argOpen = m.index! + m[0].length - 1;
        const argClose = closeOf (masked, argOpen);
        if (argClose === -1) continue;
        if (STRING_KEY_OPS.includes (m[2])) {
            const args = argRanges (content, masked, argOpen, argClose);
            if (args[0] === undefined || !printsStringKey (content, args[0].value)) continue;
        }
        edits.push ([ m.index!, m.index! + m[0].length, m[1] + '.' + m[2] + '(' ]);
    }
    return applyEdits (content, edits);
}

// Helpers.GetValue(client, "futures") reads a public field through reflection: the field access is the
// same read, and it types the result (Map<String, Future> / Map<String, Object>)
const FIELD_READ = /Helpers\.GetValue\(/g;

function nativeFieldReads (content: string): string {
    if (!content.includes ('Helpers.GetValue(client')) return content;
    if (!/(?:^|[(,])\s*(?:final\s+)?(?:io\.github\.ccxt\.)?(?:Ws)?Client client\b/.test (content)) return content;

    const masked = maskOpaque (content);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (FIELD_READ)) {
        if (m.index! > 0 && /[\w.]/.test (masked[m.index! - 1])) continue;
        const open = m.index! + m[0].length - 1;
        const close = closeOf (masked, open);
        if (close === -1) continue;
        const args = argRanges (content, masked, open, close);
        if (args.length !== 2) continue;
        if (!/^client$/.test (normSpace (args[0].value))) continue;
        const key = normSpace (args[1].value);
        const literal = /^"([A-Za-z_]\w*)"$/.exec (key);
        if (literal === null || !WS_FIELDS.includes (literal[1])) continue;
        edits.push ([ m.index!, close + 1, 'client.' + literal[1] ]);
    }
    return applyEdits (content, edits);
}

// Helpers.GetValue(<ws map>, key) -> the null-guarded get (the helper answers null for either null)
function nativeMapReads (content: string): string {
    if (!content.includes ('Helpers.GetValue(')) return content;
    if (!/(?:^|[(,])\s*(?:final\s+)?(?:io\.github\.ccxt\.)?(?:Ws)?Client client\b/.test (content)) return content;

    const masked = maskOpaque (content);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (FIELD_READ)) {
        if (m.index! > 0 && /[\w.]/.test (masked[m.index! - 1])) continue;
        const open = m.index! + m[0].length - 1;
        const close = closeOf (masked, open);
        if (close === -1) continue;
        const args = argRanges (content, masked, open, close);
        if (args.length !== 2) continue;
        const receiver = normSpace (args[0].value);
        if (wsFieldOf (receiver) === undefined) continue;
        const key = normSpace (args[1].value);
        if (STRING_LITERAL.test (key)) {
            edits.push ([ m.index!, close + 1, '(' + receiver + ' == null ? null : ' + receiver + '.get(' + key + '))' ]);
        } else if (/^[A-Za-z_]\w*$/.test (key) && printsStringKey (content, key)) {
            edits.push ([ m.index!, close + 1, '(' + receiver + ' == null || ' + key + ' == null ? null : ' + receiver + '.get(' + key + '))' ]);
        }
    }
    return applyEdits (content, edits);
}

// `Object.keys(client.f)` replayed as a J39 pattern switch is the plain keySet copy
function stripKeySetBlobs (content: string, sp: Spell): string {
    const NEEDLE = 'switch ((Object)(client.';
    if (!content.includes (NEEDLE)) return content;
    const masked = maskOpaque (content);
    const head = '((List<Object>) ';
    const edits: [ number, number, string ][] = [];
    let from = 0;
    for (;;) {
        const at = masked.indexOf (NEEDLE, from);
        if (at === -1) break;
        from = at + NEEDLE.length;
        let start = -1;
        for (const h of [ head, '((java.util.List<Object>) ' ]) {
            const s = at - h.length;
            if (s >= 0 && masked.slice (s, at) === h) { start = s; break; }
        }
        if (start === -1) continue;
        const fieldEnd = masked.indexOf (')', at + NEEDLE.length);
        if (fieldEnd === -1) continue;
        const field = masked.slice (at + NEEDLE.length, fieldEnd).trim ();
        if (!WS_FIELDS.includes (field)) continue;
        const end = closeOf (masked, start);
        if (end === -1) continue;
        const z = masked.slice (start, end + 1).replace (/java\.util\./g, '').replace (/\s+/g, ' ').trim ();
        const sync = '-> { synchronized (';
        const syncAt = z.indexOf (sync);
        if (syncAt === -1) continue;
        const nameEnd = z.indexOf (')', syncAt + sync.length);
        if (nameEnd === -1) continue;
        const v = z.slice (syncAt + sync.length, nameEnd);
        const receiver = 'client.' + field;
        for (const member of [ 'keySet', 'values' ]) {
            const expected = '((List<Object>) switch ((Object)(' + receiver + ')) { case Map<?, ?> ' + v +
                ' -> { synchronized (' + v + ') { yield new ArrayList<Object>(' + v + '.' + member +
                '()); } } case null, default -> new ArrayList<Object>(); })';
            if (z !== expected) continue;
            edits.push ([ start, end + 1, 'new ' + sp.list + '<Object>(' + receiver + '.' + member + '())' ]);
        }
    }
    return applyEdits (content, edits);
}

// Helpers.objectKeys/objectValues on a ws map -> the plain copy
function stripKeyValueHelpers (content: string, sp: Spell, aliases: Map<string, string>): string {
    if (!content.includes ('Helpers.objectKeys(') && !content.includes ('Helpers.objectValues(')) return content;
    const masked = maskOpaque (content);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (/Helpers\.object(Keys|Values)\(/g)) {
        if (m.index! > 0 && /[\w.]/.test (masked[m.index! - 1])) continue;
        const open = m.index! + m[0].length - 1;
        const close = closeOf (masked, open);
        if (close === -1) continue;
        const args = argRanges (content, masked, open, close);
        if (args.length !== 1) continue;
        const target = normSpace (args[0].value);
        const field = wsFieldOf (target) ?? aliases.get (target);
        if (field === undefined) continue;
        const member = m[1] === 'Keys' ? 'keySet' : 'values';
        edits.push ([ m.index!, close + 1, 'new ' + sp.list + '<Object>(' + target + '.' + member + '())' ]);
    }
    return applyEdits (content, edits);
}

// `Object x = client.<ws map>;` -> the map's own type when x is never written again and never read as
// anything but a map (an argument, an Objects.equals operand or one of the Map methods)
const ALIAS_DECL = /(^|\n)([ \t]*)Object ([A-Za-z_]\w*) = (client\.(?:futures|subscriptions|rejections));/g;
const ALIAS_METHODS = new Set ([ ...MAP_OPS, 'toString', 'equals', 'hashCode', 'forEach', 'containsValue', 'getOrDefault', 'replace', 'replaceAll', 'compute', 'merge', 'putAll', 'clone' ]);
const MAP_CAST_PREFIX = /\(\((?:[\w]+\.)*Map\s*(?:<[^()]*>)?\)\s*$/;
const FOREIGN_CAST = /\(\(?(?:String|Long|Double|Integer|Boolean|Number|List|Set|Collection|Map\.Entry|Object\[\])\s*(?:<[^()]*>)?\)\s*$/;

function retypeAliases (member: string, sp: Spell): { member: string, aliases: Map<string, string> } {
    const aliases = new Map<string, string> ();
    if (!member.includes ('= client.')) return { member, aliases };
    const masked = maskOpaque (member);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (ALIAS_DECL)) {
        const name = m[3];
        const field = m[4].replace ('client.', '');
        const declAt = m.index! + m[1].length + m[2].length;
        const declEnd = declAt + 'Object'.length;
        const write = new RegExp ('(?<![\\w.])' + name + '\\s*(?:=(?!=)|[+\\-*/]?=|\\+\\+|--)', 'g');
        const writes = [ ...masked.matchAll (write) ];
        if (writes.length !== 1 || writes[0].index !== declEnd + 1) continue;
        const uses = [ ...masked.matchAll (new RegExp ('(?<![\\w.])' + name + '(?![\\w])', 'g')) ];
        let usable = true;
        for (const use of uses) {
            if (use.index === declAt || use.index === declEnd + 1) continue;
            const before = masked.slice (Math.max (0, use.index! - 60), use.index!);
            const after = masked.slice (use.index! + name.length, use.index! + name.length + 40);
            if (FOREIGN_CAST.test (before) || /^\s*\[/.test (after)) { usable = false; break; }
            const call = /^\.\s*([A-Za-z_]\w*)\s*\(/.exec (after);
            if (call !== null && !ALIAS_METHODS.has (call[1])) { usable = false; break; }
        }
        if (!usable) continue;
        aliases.set (name, field);
        edits.push ([ declAt, declEnd, fieldType (field, sp) ]);
        for (const use of uses) {
            if (use.index === declAt || use.index === declEnd + 1) continue;
            const before = masked.slice (Math.max (0, use.index! - 60), use.index!);
            const cast = MAP_CAST_PREFIX.exec (before);
            if (cast === null) continue;
            const tail = masked[use.index! + name.length] === ')' ? 1 : 0;
            edits.push ([ use.index! - cast[0].length, use.index! + name.length + tail, name ]);
        }
    }
    return { member: applyEdits (member, edits), aliases };
}

function nonNullValue (value: string, depth: number): boolean {
    const v = normSpace (value);
    if (v === '' || v === 'null' || v === 'undefined') return false;
    if (/\bnull\b/.test (v)) return false;
    if (/^-?\d+(?:\.\d+)?[LD]?$/.test (v) || v === 'true' || v === 'false') return true;
    if (STRING_LITERAL.test (v)) return true;
    if (/^new [\w.]+(?:<[\w.<>, ?]*>)?\s*\(/.test (v)) return true;
    if (/^this\.extend\s*\(/.test (v)) return true;
    // WsClient always answers a live future from these two (future() creates on demand)
    if (/^client\.(?:future|reusableFuture)\s*\(/.test (v)) return true;
    if (depth < 2) {
        const cast = /^\([^()]*\)\s*(.+)$/s.exec (v);
        if (cast !== null) return nonNullValue (cast[1], depth + 1);
    }
    return false;
}

// Helpers.addElementToObject(client.<ws map>, k, v); -> client.<ws map>.put(k, v);
function nativeElementWrites (content: string): string {
    if (!content.includes ('Helpers.addElementToObject(client.')) return content;
    const masked = maskOpaque (content);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (/Helpers\.addElementToObject\(/g)) {
        if (m.index! > 0 && /[\w.]/.test (masked[m.index! - 1])) continue;
        const open = m.index! + m[0].length - 1;
        const close = closeOf (masked, open);
        if (close === -1 || masked[close + 1] !== ';') continue;
        const args = argRanges (content, masked, open, close);
        if (args.length !== 3) continue;
        const field = wsFieldOf (args[0].value);
        if (field === undefined || field === 'futures') continue;
        if (!printsStringKey (content, args[1].value)) continue;
        if (!nonNullValue (args[2].value, 0)) continue;
        edits.push ([ m.index!, close + 1, 'client.' + field + '.put(' + args[1].value + ', ' + args[2].value + ')' ]);
    }
    return applyEdits (content, edits);
}

// a local that reads one future out of the futures map prints that type, not Object
const FUTURE_LOCAL = /(^|\n)([ \t]*)Object ([A-Za-z_]\w*) = (client\.futures\.get\()/g;

function retypeFutureLocals (content: string): string {
    if (!content.includes ('client.futures.get(')) return content;
    const masked = maskOpaque (content);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (FUTURE_LOCAL)) {
        const name = m[3];
        const declAt = m.index! + m[1].length + m[2].length;
        if ([ ...masked.matchAll (new RegExp ('(?<![\\w.])' + name + '\\s*=(?!=)', 'g')) ].length !== 1) continue;
        edits.push ([ declAt, declAt + 'Object'.length, FUTURE ]);
        const cast = new RegExp ('\\(\\(io\\.github\\.ccxt\\.ws\\.Future\\)\\s*' + name + '\\s*\\)', 'g');
        for (const c of masked.matchAll (cast)) edits.push ([ c.index!, c.index! + c[0].length, name ]);
    }
    return applyEdits (content, edits);
}

// `((io.github.ccxt.ws.Future) x)` where x already prints that type
function stripFutureCasts (member: string): string {
    if (!member.includes ('((io.github.ccxt.ws.Future)')) return member;
    const masked = maskOpaque (member);
    const edits: [ number, number, string ][] = [];
    const declared = new Set ([ ...masked.matchAll (/(?:^|[\s(,])io\.github\.ccxt\.ws\.Future ([A-Za-z_]\w*)(?=\s*(?:=(?!=)|[,);]))/g) ].map ((m) => m[1]));
    for (const m of masked.matchAll (/\(\(io\.github\.ccxt\.ws\.Future\)\s*([A-Za-z_]\w*)\s*\)/g)) {
        if (declared.has (m[1])) edits.push ([ m.index!, m.index! + m[0].length, m[1] ]);
    }
    return applyEdits (member, edits);
}

// `(io.github.ccxt.ws.Future) (client.futures == null || k == null ? null : client.futures.get(k))`
// already prints a Future once the map carries its value type
function stripFutureTernaryCasts (content: string): string {
    if (!content.includes ('(io.github.ccxt.ws.Future)(client.futures == null')) return content;
    const masked = maskOpaque (content);
    const edits: [ number, number, string ][] = [];
    for (const m of masked.matchAll (/\(io\.github\.ccxt\.ws\.Future\)\(client\.futures == null/g)) {
        const open = m.index! + '(io.github.ccxt.ws.Future)'.length;
        const close = closeOf (masked, open);
        if (close === -1) continue;
        const inner = content.slice (open + 1, close);
        if (!/^client\.futures == null \|\| .+ == null \? null : client\.futures\.get\(.+\)$/s.test (inner)) continue;
        edits.push ([ m.index!, open, '' ]);
    }
    return applyEdits (content, edits);
}

function membersOf (content: string): string[] {
    const lines = content.split ('\n');
    const starts = [ 0 ];
    for (let i = 1; i < lines.length; i++) {
        if (/^ {4}(?:public|private|protected)\b/.test (lines[i])) starts.push (i);
    }
    starts.push (lines.length);
    const parts: string[] = [];
    for (let s = 0; s + 1 < starts.length; s++) parts.push (lines.slice (starts[s], starts[s + 1]).join ('\n'));
    return parts;
}

export function j01wsNativeOps (content: string): string {
    if (typeof content !== 'string') return content;
    if (!WS_FIELDS.some ((f) => content.includes ('client.' + f)) && !content.includes ('Helpers.GetValue(client')) return content;
    const sp = spelling (content);
    let out = content;
    out = nativeFieldReads (out);
    out = nativeMapReads (out);
    out = stripReceiverCasts (out);
    out = stripKeySetBlobs (out, sp);
    out = nativeElementWrites (out);
    out = retypeFutureLocals (out);
    out = stripFutureTernaryCasts (out);
    return membersOf (out).map ((member) => {
        const retyped = retypeAliases (member, sp);
        return stripKeyValueHelpers (stripFutureCasts (retyped.member), sp, retyped.aliases);
    }).join ('\n');
}

export function j01wsSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => 'public class Gemini extends GeminiRest\n{\n    public Object m(Client client, Object o, String s)\n    {\n' + body + '\n    }\n}';
    const cases: [ string, string, string | undefined ][] = [
        [ 'keySet blob', '        List<Object> keys = ((List<Object>) switch ((Object)(client.subscriptions)) { case Map<?, ?> j39v1 -> { synchronized (j39v1) { yield new ArrayList<Object>(j39v1.keySet()); } } case null, default -> new ArrayList<Object>(); });', '        List<Object> keys = new ArrayList<Object>(client.subscriptions.keySet());' ],
        [ 'qualified keySet blob', '        java.util.List<Object> keys = ((java.util.List<Object>) switch ((Object)(client.subscriptions)) { case Map<?, ?> j39v1 -> { synchronized (j39v1) { yield new java.util.ArrayList<Object>(j39v1.keySet()); } } case null, default -> new java.util.ArrayList<Object>(); });', '        java.util.List<Object> keys = new java.util.ArrayList<Object>(client.subscriptions.keySet());' ],
        [ 'objectValues helper', '        Object values = Helpers.objectValues(client.subscriptions);', '        Object values = new ArrayList<Object>(client.subscriptions.values());' ],
        [ 'objectKeys helper', '        Object keys = Helpers.objectKeys(client.futures);', '        Object keys = new ArrayList<Object>(client.futures.keySet());' ],
        [ 'cast receiver op', '        return ((Map<?, ?>)client.futures).containsKey(s);', '        return client.futures.containsKey(s);' ],
        [ 'cast receiver put', '        ((Map)client.subscriptions).put(s, o);', '        client.subscriptions.put(s, o);' ],
        [ 'cast receiver remove', '        ((Map<String,Object>)client.subscriptions).remove(s);', '        client.subscriptions.remove(s);' ],
        [ 'raw cast Future local', '        Object promise = ((Map)client.futures).get("authenticated");\n        ((io.github.ccxt.ws.Future)promise).resolve(o);', '        io.github.ccxt.ws.Future promise = client.futures.get("authenticated");\n        promise.resolve(o);' ],
        [ 'future ternary cast', '        io.github.ccxt.ws.Future f = (io.github.ccxt.ws.Future)(client.futures == null || s == null ? null : client.futures.get(s));', '        io.github.ccxt.ws.Future f = (client.futures == null || s == null ? null : client.futures.get(s));' ],
        [ 'reflected field read', '        Object futs = Helpers.GetValue(client, "futures");', '        Map<String, io.github.ccxt.ws.Future> futs = client.futures;' ],
        [ 'reflected map read', '        Object v = Helpers.GetValue(client.subscriptions, "authenticated");', '        Object v = (client.subscriptions == null ? null : client.subscriptions.get("authenticated"));' ],
        [ 'put helper non-null', '        Helpers.addElementToObject(client.subscriptions, s, this.extend(o, o));', '        client.subscriptions.put(s, this.extend(o, o));' ],
        [ 'put helper live future', '        Helpers.addElementToObject(client.subscriptions, s, client.reusableFuture(s));', '        client.subscriptions.put(s, client.reusableFuture(s));' ],
        [ 'alias local', '        Object subs = client.subscriptions;\n        List<String> keys = new ArrayList<String>(((Map<String, Object>)subs).keySet());', '        Map<String, Object> subs = client.subscriptions;\n        List<String> keys = new ArrayList<String>(subs.keySet());' ],
        [ 'alias future map', '        Object futs = client.futures;\n        boolean has = ((Map<?, ?>)futs).containsKey(s);', '        Map<String, io.github.ccxt.ws.Future> futs = client.futures;\n        boolean has = futs.containsKey(s);' ],
        // helper / cast kept: a null value on a ConcurrentHashMap, an unproven key, a box a use needs, a write
        [ 'null value keeps helper', '        Helpers.addElementToObject(client.subscriptions, s, null);', undefined ],
        [ 'nullable value keeps helper', '        Object v = this.safeValue(o, s);\n        Helpers.addElementToObject(client.subscriptions, s, v);', undefined ],
        [ 'Object key keeps raw cast', '        ((Map)client.subscriptions).put(o, s);', undefined ],
        [ 'reassigned alias keeps Object', '        Object subs = client.subscriptions;\n        subs = this.safeValue(o, s);\n        List<String> keys = new ArrayList<String>(((Map<String, Object>)subs).keySet());', undefined ],
        [ 'Object local Future cast kept', '        Object f = this.safeValue(o, s);\n        ((io.github.ccxt.ws.Future)f).resolve(o);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const input = cls (body);
        const out = j01wsNativeOps (input);
        const ok = expect === undefined ? out === input : out.includes (expect);
        if (!ok) problems.push ('hx10w3 J01: ' + name + '\n' + out);
        if (j01wsNativeOps (out) !== out) problems.push ('hx10w3 J01: ' + name + ' not idempotent');
    }
    problems.push (...hx10w3J01HeaderCheck ());
    const commented = cls ('        // Helpers.objectValues(client.subscriptions);\n        String m = "((Map)client.subscriptions).put(s, o)";');
    if (j01wsNativeOps (commented) !== commented) problems.push ('hx10w3 J01: rewrote inside a comment / literal');
    return problems;
}

// the hand-written runtime must keep declaring what these rules assume
export function hx10w3J01HeaderCheck (): string[] {
    let text = '';
    try { text = fs.readFileSync (path.join (JAVA_ROOT, 'ws', 'WsClient.java'), 'utf8'); } catch (e) { return [ 'hx10w3 J01: cannot read ws/WsClient.java' ]; }
    const problems: string[] = [];
    const shapes: [ string, RegExp ][] = [
        [ 'Map<String, Future> futures', /public (?:final )?Map<String, (?:io\.github\.ccxt\.ws\.)?Future> futures\b/ ],
        [ 'Map<String, Object> subscriptions', /public (?:final )?Map<String, Object> subscriptions\b/ ],
        [ 'Map<String, Object> rejections', /public (?:final )?Map<String, Object> rejections\b/ ],
    ];
    for (const [ name, shape ] of shapes) {
        if (!shape.test (text)) problems.push ('hx10w3 J01: ws/WsClient.java no longer declares ' + name);
    }
    return problems;
}
