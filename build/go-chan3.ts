// ===== GO-CHAN3: typed AsyncResult channels (`<-chan AsyncResult[any]` -> `<-chan AsyncResult[T]`) =====
// API
//   tables  build/go-chan-tables/chan3-*.json: { "<Core>": "<Go T>" } keyed by the printed core name without
//           `Async` (e.g. "CancelOrder": "map[string]any"). T in map[string]any, []any, string, float64, bool,
//           int64, *int64, ... A method may not also sit in an EndpointResult (gochan) table: goChan3Table throws.
//   pass    goChan3Pass(content): runs AFTER goErrValuePass (it retypes the AsyncResult[any] go-err printed).
//           Cores: trampoline + body + every `ch <- AsyncResult[any]{Value: e}` send; e must be statically T
//           (literal, typed local/param, typed own/base return, nil for nilable T, a forward of a same-T
//           tabled receive), else it THROWS (fail closed). Consumers of tabled receives read r.Value as T:
//           `r.Value.(T)` / MapTyped / ListTyped drop, `x := r.Value` stays typed unless rebound or nil-compared,
//           any other boxing of a nilable T goes through BoxAbsent (typed-nil trap), forwards retype.
//           Interface lines `\tMAsync(..) <-chan AsyncResult[any]` retype (hand exchange_interface.go: --apply-hand).
//   audit   `npx tsx build/go-chan3.ts --audit [dir=go/v4] [--json]`: per method per core the unprovable sends
//           over committed generated Go (reads files, no transpile). `--self-test` runs the self-test.
// Runtime: ReturnPanicError[T] is generic; AsyncResult[T].Boxed() un-types a nil container for reflective users.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { goChanMask, goChanClose, goChanExprEnd, goChanQual, goChanSendType, goChanMethodReturn, goChanTable, goChanSetBaseReturnsForTest } from './go-chan.js';

const GO_CHAN3_DIR = path.join (path.dirname (fileURLToPath (import.meta.url)), 'go-chan-tables');
let GO_CHAN3_TABLE: Map<string, string> | undefined = undefined;

export function goChan3Nilable (type: string): boolean {
    return /^(?:map\[|\[\]|\*)/.test (type) || goChan3WsInterface (type);
}

// a nil T boxed into `any` must read as untyped nil (typed-nil trap): only map[string]any / []any fold
export function goChan3FoldsAbsent (type: string): boolean {
    return (type === 'map[string]any') || (type === '[]any');
}

// `<ind>x := v` / `x = v` / `ch <- C{Value: v<tail>}` of a T value as native statements: a folding T
// gets `if v == nil` arms (absent stays untyped nil), any other T is its own box
function goChan3AbsentStmt (ind: string, kind: 'decl' | 'set' | 'send', lhs: string, v: string, type: string, tail = ''): string {
    const fold = goChan3FoldsAbsent (type);
    if (kind === 'decl') {
        return fold ? (ind + 'var ' + lhs + ' any = nil\n' + ind + 'if ' + v + ' != nil {\n' + ind + '\t' + lhs + ' = ' + v + '\n' + ind + '}') : (ind + 'var ' + lhs + ' any = ' + v);
    }
    const put = (e: string) => (kind === 'set') ? (lhs + ' = ' + e) : (lhs + 'Value: ' + e + tail);
    return fold ? (ind + 'if ' + v + ' == nil {\n' + ind + '\t' + put ('nil') + '\n' + ind + '} else {\n' + ind + '\t' + put (v) + '\n' + ind + '}') : (ind + put (v));
}

// `v` read inside the arm of an emitted `if v == nil {..} else {` / `if v != nil {` guard (idempotency)
function goChan3AbsentGuarded (masked: string, ls: number, v: string): boolean {
    const head = masked.substring (Math.max (0, ls - 400), ls);
    const e = v.replace (/[.[\]]/g, '\\$&');
    return new RegExp ('if ' + e + ' != nil \\{\\n$').test (head) || new RegExp ('if ' + e + ' == nil \\{\\n[^\\n]*\\n\\t*\\} else \\{\\n$').test (head)
        || new RegExp ('if ' + e + ' == nil \\{\\n$').test (head);
}

// the `any` box of T value `v` spanning [start, end) (the bare read, or a legacy BoxAbsent(v) call) as native
// statements: `x := V` / `x = V` / a channel send split into nil arms; elsewhere a guarded temp is hoisted
// before a self-contained statement line. Anything else throws (fail closed).
function goChan3AbsentEdits (content: string, masked: string, start: number, end: number, v: string, type: string, taken: Set<string>): Edit[] {
    if (!goChan3FoldsAbsent (type)) {
        return [ { start, end, 'text': v } ];   // pointer / interface T: its box is already the nil verdict
    }
    const ls = masked.lastIndexOf ('\n', start) + 1;
    let le = masked.indexOf ('\n', end);
    le = (le < 0) ? masked.length : le;
    const before = masked.substring (ls, start);
    const after = masked.substring (end, le);
    const tail = content.substring (end, le);
    let m = /^(\t+)(\w+) := $/.exec (before) || /^(\t+)var (\w+) any = $/.exec (before);
    if ((m !== null) && /^\s*$/.test (after)) {
        return [ { 'start': ls, 'end': le, 'text': goChan3AbsentStmt (m[1], 'decl', m[2], v, type) } ];
    }
    m = /^(\t+)(\w+) = $/.exec (before);
    if ((m !== null) && /^\s*$/.test (after)) {
        return [ { 'start': ls, 'end': le, 'text': goChan3AbsentStmt (m[1], 'set', m[2], v, type) } ];
    }
    m = /^(\t+)(\w+ <- (?:ccxt\.)?AsyncResult\[any\]\{)Value: $/.exec (before);
    const close = /^((?:, Err: \w+\.Err)?\})\s*$/.exec (after);
    if ((m !== null) && (close !== null)) {
        return [ { 'start': ls, 'end': le, 'text': goChan3AbsentStmt (m[1], 'send', m[2], v, type, tail.replace (/\s+$/, '')) } ];
    }
    // hoist: the line must be one whole statement at block level (not a case/else/continuation line)
    const [ fs0 ] = goChan3Func (masked, start);
    let depth = 0;
    for (let i = fs0; i < ls; i++) {
        const c = masked[i];
        depth += ((c === '(') || (c === '[')) ? 1 : (((c === ')') || (c === ']')) ? -1 : 0);
    }
    const line = masked.substring (ls, le);
    const stmt = line.replace (/\{\s*$/, '');
    const balanced = (goChanClose ('(' + stmt + ')', 0) === stmt.length + 2) && (stmt.split ('{').length === stmt.split ('}').length);
    const ind = /^\t+/.exec (line);
    const prev = masked.substring (masked.lastIndexOf ('\n', ls - 2) + 1, Math.max (ls - 1, 0)).trimEnd ();
    if ((depth !== 0) || !balanced || (ind === null) || /^\s*(?:\}|case\b|default\b|for\b|switch\b|select\b|go\b|defer\b)/.test (line) || /[,(\[]\s*$/.test (line)
        || /(?:&&|\|\||[+\-*/%,(\[=:.])$/.test (prev)) {
        throw new Error ('GOCHAN3: absent-folding read of ' + v + ' in an unsupported position: ' + line.trim ());
    }
    const base = v.replace (/\W+/g, '') + 'Box';
    let name = base;
    for (let k = 1; taken.has (name) || new RegExp ('\\b' + name + '\\b').test (masked.substring (fs0, goChan3Func (masked, start)[1])); k++) {
        name = base + k;
    }
    taken.add (name);
    return [
        { 'start': ls, 'end': ls, 'text': goChan3AbsentStmt (ind[0], 'decl', name, v, type) + '\n' },
        { start, end, 'text': name },
    ];
}

// T of the value `v` read in the function holding `at`: `rN.Value` of a tabled receive, `V[k]` of a
// `var V []T`, or a `var retResN T` forward; undefined when unproven
function goChan3AbsentType (masked: string, at: number, v: string, table: Map<string, string>): string | undefined {
    const [ fs0, fe0 ] = goChan3Func (masked, at);
    const fn = masked.substring (fs0, at);
    let m = /^(\w+)\.Value$/.exec (v);
    if (m !== null) {
        const binds = [ ...fn.matchAll (new RegExp ('\\n\\t+' + m[1] + ' := <-[^\\n]*?\\.(\\w+)Async\\(', 'g')) ];
        return binds.length ? table.get (binds[binds.length - 1][1]) : undefined;
    }
    m = /^(\w+)\[\d+\]$/.exec (v) || /^(retRes\d+)$/.exec (v);
    if (m !== null) {
        const whole = masked.substring (fs0, fe0);
        const decls = [ ...whole.matchAll (new RegExp ('\\n\\t+var ' + m[1] + ' ([^=\\n]+?) = ', 'g')) ];
        if (decls.length !== 1) {
            return undefined;
        }
        const t = decls[0][1];
        return v.endsWith (']') ? (t.startsWith ('[]') ? t.slice (2) : undefined) : t;
    }
    return undefined;
}

// final lowering: every intermediate `BoxAbsent(v)` marker the passes above left becomes native Go
export function goChan3LowerAbsent (content: string, table: Map<string, string>): string {
    for (let round = 0; (round < 64) && /(?<![\w.])(?:ccxt\.)?BoxAbsent\(/.test (content); round++) {
        const masked = goChanMask (content);
        const re = /(?<![\w.])(?:ccxt\.)?BoxAbsent\(/g;
        const edits: Edit[] = [];
        const taken = new Set<string> ();
        let lastLine = -1;
        for (let m = re.exec (masked); m !== null; m = re.exec (masked)) {
            const ls = masked.lastIndexOf ('\n', m.index) + 1;
            if (ls === lastLine) {
                continue;   // one marker per line per round: hoists on the same line would overlap
            }
            if (/^func /.test (masked.substring (ls, m.index))) {
                continue;
            }
            const close = goChanClose (masked, m.index + m[0].length - 1);
            const v = content.substring (m.index + m[0].length, close - 1).trim ();
            if (!/^(?:\w+\.Value|\w+\[\d+\]|retRes\d+)$/.test (v)) {
                throw new Error ('GOCHAN3: unlowerable absent box of ' + v);
            }
            const type = goChan3AbsentType (masked, m.index, v, table);
            if (type === undefined) {
                throw new Error ('GOCHAN3: absent box of ' + v + ' without a proven element type');
            }
            edits.push (...goChan3AbsentEdits (content, masked, m.index, close, v, type, taken));
            lastLine = ls;
        }
        if (!edits.length) {
            break;
        }
        content = goChan3Splice (content, edits);
    }
    return content;
}

// ===== GO-CHAN3 WS: ws cache objects travel as a Go interface element (never MapTyped: that nils them) =====
// OrderBookInterface: every watchOrderBook* core sends the live book (`ob.(OrderBookInterface).Limit()`, now typed)
// or forwards an untabled Watch/WatchMultiple receive, unboxed at the send with OrderBookTyped.
export function goChan3WsInterface (type: string): boolean {
    return /^(?:ccxt\.)?OrderBookInterface$/.test (type);
}

// T as spelled in a file of package ccxt (q === '') or an importer (q === 'ccxt.')
export function goChan3QualType (type: string, q: string): string {
    return goChan3WsInterface (type) ? (q + type.replace (/^ccxt\./, '')) : type;
}

// the WS send proof: `ob.(OrderBookInterface).Limit()`, or an untabled receive `rN.Value` / its `x := rN.Value`
// local asserted to the interface element. Returns the Value text to emit, or undefined.
function goChan3WsSend (expr: string, fnMasked: string, want: string | undefined, q: string): string | undefined {
    if ((want === undefined) || !goChan3WsInterface (want)) {
        return undefined;
    }
    const t = goChan3QualType (want, q);
    if (new RegExp ('^\\w+\\.\\(' + t.replace ('.', '\\.') + '\\)\\.Limit\\(\\)$').test (expr)) {
        return expr; // Limit() returns OrderBookInterface
    }
    let name = expr;
    const local = /^[a-z]\w*$/.exec (expr);
    if ((local !== null) && !/^r\d*$/.test (expr)) {
        const binds = fnMasked.match (new RegExp ('(?<![\\w.])' + expr + '(?:\\s*,\\s*\\w+)*\\s*(?::?=(?!=)|\\+=)|var ' + expr + ' ', 'g')) || [];
        const bind = new RegExp ('\\n\\t*' + expr + ' := (r\\d*)\\.Value\\n').exec (fnMasked);
        if ((bind === null) || (binds.length !== 1)) {
            return undefined;
        }
        name = bind[1] + '.Value';
    }
    const recv = /^(r\d*)\.Value$/.exec (name);
    if ((recv === null) || (new RegExp ('\\n\\t*' + recv[1] + ' := <-this\\.\\w+\\(').exec (fnMasked) === null)) {
        return undefined;
    }
    return q + 'OrderBookTyped(' + expr + ')'; // untyped nil stays nil, a book keeps its pointer
}

// method -> T merged from chan3-*.json; a method tabled twice differently or also in a gochan table throws
export function goChan3Table (): Map<string, string> {
    if (GO_CHAN3_TABLE === undefined) {
        const table = new Map<string, string> ();
        const files = fs.existsSync (GO_CHAN3_DIR) ? fs.readdirSync (GO_CHAN3_DIR).filter ((f) => /^chan3-.*\.json$/.test (f)).sort () : [];
        const carriers = goChanTable ();
        for (const f of files) {
            const entries = JSON.parse (fs.readFileSync (path.join (GO_CHAN3_DIR, f), 'utf8'));
            for (const method of Object.keys (entries)) {
                const type = entries[method];
                if ((typeof type !== 'string') || /\bany\b(?!\])|^interface/.test (type.replace (/^map\[string\]any$|^\[\]any$/, ''))) {
                    throw new Error ('GOCHAN3: ' + method + ': element type must be concrete (' + f + ')');
                }
                if (table.has (method) && (table.get (method) !== type)) {
                    throw new Error ('GOCHAN3: ' + method + ' tabled twice with different types (' + f + ')');
                }
                if (carriers.has (method)) {
                    throw new Error ('GOCHAN3: ' + method + ' is already an EndpointResult carrier (gochan table), ' + f);
                }
                table.set (method, type);
            }
        }
        GO_CHAN3_TABLE = table;
    }
    return GO_CHAN3_TABLE;
}

export function goChan3SetTableForTest (table: Map<string, string> | undefined) {
    GO_CHAN3_TABLE = table;
}

type Edit = { start: number, end: number, text: string };
type Report = (method: string, receiver: string, reason: string, types: string[]) => void;

function goChan3Splice (content: string, edits: Edit[]): string {
    edits.sort ((a, b) => b.start - a.start);
    let out = content;
    let floor = Infinity;
    for (const e of edits) {
        if (e.end > floor) {
            throw new Error ('GOCHAN3: overlapping edits at ' + e.start);
        }
        out = out.substring (0, e.start) + e.text + out.substring (e.end);
        floor = e.start;
    }
    return out;
}

function goChan3FreshName (fn: string, taken: Set<string>): string {
    for (let k = 0; ; k++) {
        const name = (k === 0) ? 'r' : ('r' + k);
        if (!taken.has (name) && !new RegExp ('\\b' + name + '\\b').test (fn)) {
            taken.add (name);
            return name;
        }
    }
}

// receiver text of a `.MAsync` call at `at` (the dot), or undefined when it is not a call we know
function goChan3Receiver (masked: string, at: number): { recv: string, start: number } | undefined {
    const asserted = /(?<![\w.])(this\.DerivedExchange|exchange)\.\((?:ccxt\.)?I\w+\)$/.exec (masked.substring (Math.max (0, at - 120), at));
    if (asserted !== null) {
        return { 'recv': asserted[1], 'start': at - asserted[0].length };
    }
    let s = at;
    while ((s > 0) && /[\w.]/.test (masked[s - 1])) {
        s--;
    }
    return { 'recv': masked.substring (s, at), 'start': s };
}

const GO_CHAN3_RECEIVERS = /^(?:this|this\.base|this\.Exchange|this\.BaseExchange|this\.DerivedExchange|exchange)$/;

// the tabled method a `<-RECV.MAsync(..)` receive at `recvAt` (index of `<-`) reads, when it is one
function goChan3ReceiveMethod (masked: string, recvAt: number, table: Map<string, string>): string | undefined {
    const m = /^<-\s*([\w.]+(?:\.\((?:ccxt\.)?I\w+\))?)\.(\w+)Async\(/.exec (masked.substring (recvAt, recvAt + 300));
    if ((m === null) || !table.has (m[2]) || !GO_CHAN3_RECEIVERS.test (m[1].replace (/\.\((?:ccxt\.)?I\w+\)$/, ''))) {
        return undefined;
    }
    return m[2];
}

interface GoChan3Core { receiver: string, method: string, asyncStart: number, asyncEnd: number, bodyStart: number, bodyEnd: number, edits: Edit[] }

let GO_CHAN3_STUBS: Map<string, string> | undefined = undefined;

// implicit-API stub name -> T of its `EndpointResult[T]` when every `*_api.go` declaring it agrees
export function goChan3EndpointStubs (): Map<string, string> {
    if (GO_CHAN3_STUBS === undefined) {
        const dir = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'go', 'v4');
        const seen = new Map<string, string> ();
        const sig = /^func \(this \*\w+\) (\w+)\(args \.\.\.any\) <-chan (?:ccxt\.)?(?:EndpointResult\[(.+)\]|AsyncResult\[any\]) \{$/gm;
        for (const d of [ dir, path.join (dir, 'prediction') ]) {
            for (const f of fs.existsSync (d) ? fs.readdirSync (d).filter ((x) => x.endsWith ('_api.go')) : []) {
                const text = fs.readFileSync (path.join (d, f), 'utf8');
                for (let m = sig.exec (text); m !== null; m = sig.exec (text)) {
                    const t = m[2] || '';
                    seen.set (m[1], (seen.has (m[1]) && (seen.get (m[1]) !== t)) ? '' : t);
                }
            }
        }
        GO_CHAN3_STUBS = new Map ([ ...seen ].filter (([ , t ]) => t !== ''));
    }
    return GO_CHAN3_STUBS;
}

export function goChan3SetStubsForTest (map: Map<string, string> | undefined) {
    GO_CHAN3_STUBS = map;
}

// a sent local whose every write is an awaited typed endpoint (`x := rN.Raw`, `var x any = nil` + `x = rN.Raw`)
// and whose other uses are nil tests only: typed T, writes read Value (endpointValue[T] of Raw) instead of Raw
function goChan3LocalJoin (name: string, fnMasked: string, bodyStart: number): { type?: string, reason?: string, edits: Edit[] } {
    const edits: Edit[] = [];
    const types = new Set<string> ();
    const stubs = goChan3EndpointStubs ();
    const signatureEnd = fnMasked.indexOf ('{');
    const occ = new RegExp ('(?<![\\w.])' + name + '(?!\\w)', 'g');
    let decls = 0;
    let nilable = false;
    let declAt = -1;
    const bad = (reason: string) => ({ reason, 'edits': [] as Edit[] });
    for (let o = occ.exec (fnMasked); o !== null; o = occ.exec (fnMasked)) {
        if (o.index < signatureEnd) {
            return bad ('local-param');
        }
        const ls = fnMasked.lastIndexOf ('\n', o.index) + 1;
        const le = fnMasked.indexOf ('\n', o.index);
        const lead = fnMasked.substring (ls, o.index);
        const after = fnMasked.substring (o.index + name.length, le);
        const w = /^ (:?=) (r\d*)\.(Raw|Value)\s*$/.exec (after);
        if (/^\t+$/.test (lead) && (w !== null)) {
            decls += (w[1] === ':=') ? 1 : 0;
            const binds = fnMasked.match (new RegExp ('\\n\\t+' + w[2] + ' := <-this\\.(\\w+)\\(', 'g')) || [];
            const stub = (binds.length === 1) ? /<-this\.(\w+)\($/.exec (binds[0]) : null;
            const t = (stub === null) ? undefined : stubs.get (stub[1]);
            if (t === undefined) {
                return bad ('local-untyped');
            }
            types.add (t);
            if (w[3] === 'Raw') {
                const at = o.index + name.length + w[1].length + 2 + w[2].length + 1;
                edits.push ({ 'start': bodyStart + at, 'end': bodyStart + at + 3, 'text': 'Value' });
            }
            continue;
        }
        const init = /^ any = (nil|map\[string\]any\{\})\s*$/.exec (after);
        if (/^\t+var $/.test (lead) && (init !== null)) {
            decls++;
            nilable = nilable || (init[1] === 'nil');
            if (init[1] !== 'nil') {
                types.add ('map[string]any');
            }
            declAt = o.index + name.length + 1;
            continue;
        }
        if ((/^\t+$/.test (lead) && /^ = nil\s*$/.test (after)) || /^ [!=]= nil\b/.test (after)) {
            nilable = true;
            continue;
        }
        if (/^\t+ch <- (?:ccxt\.)?AsyncResult\[any\]\{Value: $/.test (lead) && /^\}\s*$/.test (after)) {
            continue;
        }
        return bad ('local-any');
    }
    const list = [ ...types ];
    if ((decls !== 1) || (list.length !== 1) || (nilable && !goChan3Nilable (list[0]))) {
        return bad ((list.length > 1) ? 'local-mixed' : 'local-any');
    }
    if (declAt >= 0) {
        edits.push ({ 'start': bodyStart + declAt, 'end': bodyStart + declAt + 3, 'text': list[0] });
    }
    return { 'type': list[0], edits };
}

// cores of tabled methods (or every core in audit mode) with their send edits; throws on an unprovable tabled core
function goChan3Cores (content: string, masked: string, table: Map<string, string>, audit?: Report): GoChan3Core[] {
    const cores: GoChan3Core[] = [];
    const q = goChanQual (content);
    const any = '(?:ccxt\\.)?AsyncResult\\[any\\]';
    const handDef = new RegExp ('^func \\(this \\*(\\w+)\\) (\\w+)Async\\([^\\n]*\\) <-chan ' + any + ' \\{\\n(?!\\tch := make\\(chan ' + any + ', 1\\)\\n\\tgo this\\.\\w+Body\\(ch)', 'gm');
    for (let m = handDef.exec (masked); m !== null; m = handDef.exec (masked)) {
        if (audit !== undefined) {
            audit (m[2], m[1], 'hand-shape', []);
        } else if (table.has (m[2])) {
            throw new Error ('GOCHAN3: ' + m[1] + '.' + m[2] + 'Async is not a generated trampoline');
        }
    }
    const tramp = new RegExp ('^func \\(this \\*(\\w+)\\) (\\w+)Async\\(([^\\n]*)\\) <-chan ' + any + ' \\{\\n\\tch := make\\(chan ' + any + ', 1\\)\\n\\tgo this\\.(\\w+)\\(ch(?:, [^\\n]*)?\\)\\n\\treturn ch\\n\\}\\n', 'gm');
    for (let m = tramp.exec (masked); m !== null; m = tramp.exec (masked)) {
        const [ whole, receiver, method, , bodyName ] = m;
        const want = table.get (method);
        if ((want === undefined) && (audit === undefined)) {
            continue;
        }
        const types = new Set<string> ();
        const reasons: string[] = [];
        const fail = (reason: string) => { reasons.push (reason); };
        const head = '\nfunc (this *' + receiver + ') ' + bodyName + '(ch chan ' + q + 'AsyncResult[any]';
        const headAt = masked.indexOf (head);
        if ((headAt < 0) || (masked.indexOf (head, headAt + 1) >= 0)) {
            fail ('body-missing');
        }
        const bodyStart = headAt + 1;
        const bodyEnd = (headAt < 0) ? -1 : masked.indexOf ('\n}\n', bodyStart) + 3;
        const edits: Edit[] = [];
        const joins = new Map<string, { type?: string, reason?: string, edits: Edit[] }> ();
        if (headAt >= 0) {
            const fnMasked = masked.substring (bodyStart, bodyEnd);
            const fnText = content.substring (bodyStart, bodyEnd);
            const signature = fnMasked.substring (0, fnMasked.indexOf ('{'));
            const lines = fnMasked.split ('\n');
            if (!/^\tdefer close\(ch\)$/.test (lines[1]) || !/^\tdefer (?:ccxt\.)?ReturnPanicError\(ch\)$/.test (lines[2])) {
                fail ('prologue');
            }
            const use = /(?<![.\w])ch(?!\w)/g;
            for (let u = use.exec (fnMasked); u !== null; u = use.exec (fnMasked)) {
                const before = fnMasked.substring (fnMasked.lastIndexOf ('\n', u.index) + 1, u.index);
                if ((u.index < signature.length) || /defer (?:ccxt\.)?(?:close|ReturnPanicError)\($/.test (before)) {
                    continue;
                }
                if (!/^\t*$/.test (before) || !fnMasked.startsWith ('ch <- ', u.index)) {
                    fail ('channel-escapes');
                    continue;
                }
                const at = u.index + 6;
                // `ch <- <-X`: a forward keeps the element type only from a same-T tabled core
                if (fnMasked.startsWith ('<-', at)) {
                    const fwd = goChan3ReceiveMethod (fnMasked, at, table);
                    const ft = (fwd === undefined) ? undefined : table.get (fwd);
                    if ((ft === undefined) || ((want !== undefined) && (ft !== want))) {
                        fail ('forward-untabled:' + (/^<-\s*[\w.()]*?\.?(\w+)\(/.exec (fnMasked.substring (at, at + 200)) || [ '', '?' ])[1]);
                    } else {
                        types.add (ft);
                    }
                    continue;
                }
                const lit = new RegExp ('^' + any + '\\{').exec (fnMasked.substring (at, at + 40));
                if (lit === null) {
                    fail ('send-shape');
                    continue;
                }
                const open = at + lit[0].length - 1;
                const close = goChanClose (fnMasked, open);
                const inner = fnText.substring (open + 1, close - 1);
                const v = /^Value: ([\s\S]*)$/.exec (inner);
                if (v === null) {
                    // `{}` (nil) or `{Err: ..}`
                    if (/^\s*$/.test (inner) || /^Err: /.test (inner)) {
                        if (/^\s*$/.test (inner)) {
                            types.add ('nil');
                        }
                        edits.push ({ 'start': bodyStart + at, 'end': bodyStart + open, 'text': q + 'AsyncResult[' + goChan3QualType (want || 'any', q) + ']' });
                        continue;
                    }
                    fail ('send-shape');
                    continue;
                }
                const expr = v[1];
                let type: string | undefined = undefined;
                const fwdVal = /^(r\d*)\.Value$/.exec (expr);
                if (fwdVal !== null) {
                    const bind = new RegExp ('\\n\\t*' + fwdVal[1] + ' := (<-)').exec (fnMasked);
                    const fm = (bind === null) ? undefined : goChan3ReceiveMethod (fnMasked, bind.index + bind[0].length - 2, table);
                    type = (fm === undefined) ? undefined : table.get (fm);
                    const ws = (type === undefined) ? goChan3WsSend (expr, fnMasked, want, q) : undefined;
                    if (ws !== undefined) {
                        edits.push ({ 'start': bodyStart + open + 1, 'end': bodyStart + close - 1, 'text': 'Value: ' + ws });
                        type = want as string;
                    }
                    if (type === undefined) {
                        const name = (bind === null) ? '?' : ((/^<-\s*[\w.()]*?\.?(\w+)\(/.exec (fnMasked.substring (bind.index + bind[0].length - 2, bind.index + bind[0].length + 200)) || [ '', '?' ])[1]);
                        fail ('forward-untabled:' + name);
                        continue;
                    }
                } else {
                    let proof: { type?: string, nil?: boolean, reason?: string } = goChanSendType (expr.replace (/^ccxt\./, ''), fnMasked, signature, (name) => goChanMethodReturn (masked, receiver, name));
                    if ((proof.reason !== undefined) && /^local-/.test (proof.reason)) {
                        let join = joins.get (expr);
                        if (join === undefined) {
                            join = goChan3LocalJoin (expr, fnMasked, bodyStart);
                            joins.set (expr, join);
                            edits.push (...join.edits);
                        }
                        proof = (join.type !== undefined) ? { 'type': join.type } : { 'reason': join.reason || proof.reason };
                    }
                    const ws = (proof.reason !== undefined) ? goChan3WsSend (expr, fnMasked, want, q) : undefined;
                    if (ws !== undefined) {
                        if (ws !== expr) {
                            edits.push ({ 'start': bodyStart + open + 1, 'end': bodyStart + close - 1, 'text': 'Value: ' + ws });
                        }
                        type = want as string;
                    } else if (proof.nil) {
                        type = 'nil';
                    } else if (proof.reason !== undefined) {
                        const callee = /^(?:ccxt\.)?(?:this\.)?(\w+)\(/.exec (expr);
                        fail (proof.reason + ((callee !== null) ? (':' + callee[1]) : ((proof.reason.startsWith ('local')) ? (':' + expr) : '')));
                        continue;
                    } else {
                        type = (proof.type as string).replace (/^ccxt\./, '');
                    }
                }
                types.add (type);
                edits.push ({ 'start': bodyStart + at, 'end': bodyStart + open, 'text': q + 'AsyncResult[' + goChan3QualType (want || 'any', q) + ']' });
            }
        }
        const list = [ ...types ];
        if (want !== undefined) {
            for (const t of list) {
                if ((t === 'nil') ? !goChan3Nilable (want) : (t !== want)) {
                    fail ('type-' + t);
                }
            }
        } else if (list.filter ((t) => t !== 'nil').length > 1) {
            fail ('mixed-types');
        }
        if (audit !== undefined) {
            audit (method, receiver, [ ...new Set (reasons) ].join (','), list);
        }
        if ((want === undefined) || (audit !== undefined && reasons.length)) {
            continue;
        }
        if (reasons.length) {
            throw new Error ('GOCHAN3: ' + receiver + '.' + method + 'Async cannot carry AsyncResult[' + want + ']: ' + [ ...new Set (reasons) ].join (', '));
        }
        const carrier = q + 'AsyncResult[' + goChan3QualType (want, q) + ']';
        const asyncText = content.substring (m.index, m.index + whole.length).replace (/\) <-chan (?:ccxt\.)?AsyncResult\[any\] \{/, ') <-chan ' + carrier + ' {').replace (/make\(chan (?:ccxt\.)?AsyncResult\[any\], 1\)/, 'make(chan ' + carrier + ', 1)');
        edits.push ({ 'start': m.index, 'end': m.index + whole.length, 'text': asyncText });
        const headEnd = content.indexOf ('\n', bodyStart);
        edits.push ({ 'start': bodyStart, 'end': headEnd, 'text': content.substring (bodyStart, headEnd).replace ('(ch chan ' + q + 'AsyncResult[any]', '(ch chan ' + carrier) });
        cores.push ({ receiver, method, 'asyncStart': m.index, 'asyncEnd': m.index + whole.length, bodyStart, bodyEnd, edits });
    }
    return cores;
}

// the enclosing top-level func [start, end) of `at`
function goChan3Func (masked: string, at: number): [ number, number ] {
    const s = masked.lastIndexOf ('\nfunc ', at) + 1;
    const e = masked.indexOf ('\n}\n', at);
    return [ s, (e < 0) ? masked.length : e + 2 ];
}

// consumers: every `rN := <-RECV.MAsync(..)` of a tabled method, `ch <- <-RECV.MAsync(..)` forwards into an
// untabled channel, and the interface lines
function goChan3ConsumerEdits (content: string, masked: string, table: Map<string, string>, cores: GoChan3Core[], coreSendAt: (at: number) => string | undefined): Edit[] {
    const edits: Edit[] = [];
    const q = goChanQual (content);
    const names = [ ...table.keys () ];
    if (!names.length) {
        return edits;
    }
    const inHead = (at: number) => cores.some ((c) => (at >= c.asyncStart) && (at < c.asyncEnd));
    const call = new RegExp ('\\.(' + names.join ('|') + ')Async\\b', 'g');
    const fresh = new Map<number, Set<string>> ();
    for (let m = call.exec (masked); m !== null; m = call.exec (masked)) {
        const lineStart = masked.lastIndexOf ('\n', m.index) + 1;
        const lineEnd = masked.indexOf ('\n', m.index);
        const line = masked.substring (lineStart, lineEnd);
        if (inHead (m.index) || /^func /.test (line) || /^\t\w+Async\(/.test (line)) {
            continue;
        }
        if (masked[m.index + m[0].length] !== '(') {
            continue; // method value: Spawn / CallDynamically receive it reflectively
        }
        const r = goChan3Receiver (masked, m.index) as { recv: string, start: number };
        if (!GO_CHAN3_RECEIVERS.test (r.recv)) {
            throw new Error ('GOCHAN3: unknown receiver ' + r.recv + ' for ' + m[1] + 'Async');
        }
        const type = table.get (m[1]) as string;
        const nilable = goChan3Nilable (type);
        const pre = masked.substring (lineStart, r.start);
        const callEnd = goChanClose (masked, m.index + m[0].length);
        const [ fs0, fe0 ] = goChan3Func (masked, m.index);
        // forward `ch <- <-X`
        const fwd = /^(\t+)(\w+) <- <-$/.exec (pre);
        if (fwd !== null) {
            const outer = coreSendAt (m.index);
            if (outer === type) {
                continue;
            }
            if (outer !== undefined) {
                throw new Error ('GOCHAN3: forward of ' + m[1] + ' into an AsyncResult[' + outer + '] core');
            }
            const taken = fresh.get (fs0) || new Set<string> ();
            fresh.set (fs0, taken);
            const n = goChan3FreshName (content.substring (fs0, fe0), taken);
            const value = nilable ? (q + 'BoxAbsent(' + n + '.Value)') : (n + '.Value');
            const text = fwd[1] + n + ' := <-' + content.substring (r.start, callEnd) + '\n' + fwd[1] + fwd[2] + ' <- ' + q + 'AsyncResult[any]{Value: ' + value + ', Err: ' + n + '.Err}';
            edits.push ({ 'start': lineStart, 'end': callEnd, text });
            continue;
        }
        const bind = /^\t+(r\d*) := <-$/.exec (pre);
        if (bind === null) {
            // PanicOnError((<-X)) / promiseAll element / handed-on channel: reflective Boxed() / AsyncOutcome
            continue;
        }
        const name = bind[1];
        const scope = masked.substring (callEnd, fe0);
        const use = new RegExp ('(?<![\\w.])' + name + '\\.Value\\b', 'g');
        for (let u = use.exec (scope); u !== null; u = use.exec (scope)) {
            const at = callEnd + u.index;
            const end = at + u[0].length;
            const ls = masked.lastIndexOf ('\n', at) + 1;
            const le = masked.indexOf ('\n', at);
            const before = masked.substring (ls, at);
            const after = masked.substring (end, le);
            // native absent fold already emitted (`if r.Value == nil {` and its arms): idempotent
            if ((nilable && /^\s*[!=]= nil\b/.test (after)) || goChan3AbsentGuarded (masked, ls, name + '.Value')) {
                continue;
            }
            const assert = /^\.\(([^()]+)\)/.exec (after);
            if (assert !== null) {
                if (assert[1] !== goChan3QualType (type, q)) {
                    throw new Error ('GOCHAN3: ' + name + '.Value of ' + m[1] + ' asserted to ' + assert[1] + ', table says ' + type);
                }
                // comma-ok `x, ok := r.Value.(T)`: ok was false only for an absent (nil) value
                const commaOk = /^\t+\w+, \w+ :?= $/.test (before) && /^\s*$/.test (after.substring (assert[0].length));
                const nilable = /^(?:\[\]|map\[|\*)/.test (type);
                if (commaOk && !nilable) {
                    throw new Error ('GOCHAN3: comma-ok assertion of ' + m[1] + ' on a value type ' + type);
                }
                edits.push ({ 'start': end, 'end': end + assert[0].length, 'text': commaOk ? (', ' + name + '.Value != nil') : '' });
                continue;
            }
            const typed = /((?:ccxt\.)?)(MapTyped|ListTyped)\($/.exec (before);
            if ((typed !== null) && (after[0] === ')') && (type === ((typed[2] === 'MapTyped') ? 'map[string]any' : '[]any'))) {
                edits.push ({ 'start': at - typed[0].length, 'end': end + 1, 'text': name + '.Value' });
                continue;
            }
            if (/^\t+var \w+ [^=]+ = $/.test (before) && /^\s*$/.test (after)) {
                const declared = (/^\t+var \w+ ([^=]+) = $/.exec (before) as RegExpExecArray)[1].trim ();
                if ((declared === goChan3QualType (type, q)) || !/^(?:any|interface\{\})$/.test (declared)) {
                    continue; // `var x T = r.Value` (or a mismatched declaration the compiler reports)
                }
            }
            if (/(?:^|[^\w.])(?:ccxt\.)?New\w+\($/.test (before) && (after[0] === ')')) {
                continue; // typed wrapper conversions take any
            }
            if (/BoxAbsent\($/.test (before)) {
                continue;
            }
            // `x := r.Value`: typed local unless rebound or nil-compared
            const short = /^(\t+)(\w+) := $/.exec (before);
            if ((short !== null) && /^\s*$/.test (after)) {
                const x = short[2];
                const [ , fe ] = goChan3Func (masked, at);
                const rest = masked.substring (le, fe);
                const rebound = new RegExp ('(?<![\\w.])' + x + '(?:\\s*,\\s*\\w+)*\\s*(?::?=(?!=)|\\+=|-=|\\+\\+|--)|&' + x + '\\b|,\\s*' + x + '\\s*:?=(?!=)').test (rest);
                const nilCmp = new RegExp ('(?<![\\w.])' + x + '\\s*[!=]=\\s*nil|nil\\s*[!=]=\\s*' + x + '(?![\\w.])').test (rest);
                const closure = new RegExp ('func\\s*\\([^)]*\\b' + x + ' ').test (rest);
                if (!rebound && !closure && !nilCmp && !nilable) {
                    continue; // scalar T: x is a native typed local
                }
                if (!rebound && !closure && nilable) {
                    // nilable T handed on through any: BoxAbsent keeps absent == nil (typed-nil trap)
                    edits.push ({ 'start': ls, 'end': end, 'text': short[1] + x + ' := ' + q + 'BoxAbsent(' + name + '.Value)' });
                    continue;
                }
                edits.push ({ 'start': ls, 'end': end, 'text': short[1] + 'var ' + x + ' any = ' + (nilable ? (q + 'BoxAbsent(' + name + '.Value)') : (name + '.Value')) });
                continue;
            }
            // `ch <- AsyncResult[any]{Value: r.Value}`: a same-T core send is retyped by the core pass
            const send = /^\t+(\w+) <- (?:ccxt\.)?AsyncResult\[(\w[^\]]*|any)\]\{Value: $/.exec (before);
            if ((send !== null) && (after[0] === '}')) {
                const outer = coreSendAt (at);
                if (outer === type) {
                    continue;
                }
                if (outer !== undefined) {
                    throw new Error ('GOCHAN3: ' + m[1] + ' forwarded into an AsyncResult[' + outer + '] core');
                }
            }
            if (/(?:[!=]=\s*nil)/.test (after.substring (0, 8)) && !nilable) {
                throw new Error ('GOCHAN3: ' + name + '.Value of ' + m[1] + ' (' + type + ') compared with nil');
            }
            if (nilable) {
                edits.push ({ 'start': at, 'end': end, 'text': q + 'BoxAbsent(' + name + '.Value)' });
            }
        }
    }
    return edits;
}

// ===== GO-CHAN3 promiseAll: a literal list of same-T typed channels awaits through PromiseAllTyped[T] =====
// `rN := <-promiseAll([]any{A, B})` + `var V []any = ListTyped(rN.Value)`, V read only as `GetValue(V, k)`, every
// element an endpoint stub / tabled core of one T (direct call or a `var p any = call` local used only in the list):
// -> `PromiseAllTyped[T, C](A, B)` (C = AsyncResult[T] | EndpointResult[T]), `var V []T = rN.Value`, `BoxAbsent(V[k])` (absent element stays untyped nil).
function goChan3PromiseAllPass (content: string, table: Map<string, string>): string {
    if (content.search (/[pP]romiseAll\(\[\]any\{/) < 0) {
        return content;
    }
    const masked = goChanMask (content);
    const q = goChanQual (content);
    const stubs = goChan3EndpointStubs ();
    const edits: Edit[] = [];
    const site = /^(\t+)(r\d*) := <-(?:ccxt\.)?[pP]romiseAll\(\[\]any\{/gm;
    for (let m = site.exec (masked); m !== null; m = site.exec (masked)) {
        const open = m.index + m[0].length - 1;
        const close = goChanClose (masked, open);
        if (masked.substring (close, close + 2) !== ')\n') {
            continue;
        }
        const [ fs0, fe0 ] = goChan3Func (masked, m.index);
        const fn = masked.substring (fs0, fe0);
        const r = m[2];
        const tail = masked.substring (close + 2);
        const ind = m[1];
        const head = new RegExp ('^' + ind + 'if ' + r + '\\.Err != nil \\{\\n' + ind + '\\tpanic\\(' + r + '\\.Err\\)\\n' + ind + '\\}\\n' + ind + 'var (\\w+) \\[\\]any = (?:ccxt\\.)?ListTyped\\(' + r + '\\.Value\\)\\n').exec (tail);
        if (head === null) {
            continue;
        }
        const v = head[1];
        // elements split at depth 0
        const elems: { start: number, end: number }[] = [];
        let depth = 0;
        let s = open + 1;
        for (let i = open + 1; i < close - 1; i++) {
            const c = masked[i];
            depth += ((c === '(') || (c === '{') || (c === '[')) ? 1 : (((c === ')') || (c === '}') || (c === ']')) ? -1 : 0);
            if ((c === ',') && (depth === 0)) {
                elems.push ({ 'start': s, 'end': i });
                s = i + 1;
            }
        }
        elems.push ({ 'start': s, 'end': close - 1 });
        const types = new Set<string> ();
        const local: Edit[] = [];
        const args: string[] = [];
        // `EndpointRaw(this.E(..))` re-boxes a typed stub for PromiseAll: the typed variant takes the channel itself
        const unwrap = (t: string) => { const w = /^(?:ccxt\.)?EndpointRaw\(([\s\S]*)\)$/.exec (t); return ((w !== null) && (goChanClose (t, t.indexOf ('(')) === t.length)) ? w[1] : t; };
        let ok = elems.length > 0;
        for (const e of elems) {
            const text = masked.substring (e.start, e.end).trim ();
            let call = unwrap (text);
            const id = /^\w+$/.exec (text);
            if (id !== null) {
                const decl = new RegExp ('\\n(\\t+)var ' + text + ' any = ([^\\n]*)\\n', 'g');
                const d = [ ...fn.matchAll (decl) ];
                const uses = fn.match (new RegExp ('(?<![\\w.])' + text + '(?!\\w)', 'g')) || [];
                if ((d.length !== 1) || (uses.length !== 2)) {
                    ok = false;
                    break;
                }
                call = unwrap (d[0][2]);
                const at = fs0 + (d[0].index as number) + 1;
                local.push ({ 'start': at, 'end': at + d[0][0].length - 2, 'text': d[0][1] + text + ' := ' + content.substring (at + d[0][0].length - 2 - d[0][2].length, at + d[0][0].length - 2).replace (/^(?:ccxt\.)?EndpointRaw\(([\s\S]*)\)$/, '$1') });
                args.push (text);
            } else {
                args.push (content.substring (e.start, e.end).trim ().replace (/^(?:ccxt\.)?EndpointRaw\(([\s\S]*)\)$/, '$1'));
            }
            const c = /^this\.(\w+)\(/.exec (call);
            if ((c === null) || (goChanClose (call, call.indexOf ('(')) !== call.length)) {
                ok = false;
                break;
            }
            const core = /^(\w+)Async$/.exec (c[1]);
            const t = (core !== null) ? table.get (core[1]) : stubs.get (c[1]);
            types.add (((core !== null) ? 'A:' : 'E:') + (t || '?'));
            ok = ok && (t !== undefined);
        }
        if (!ok || (types.size !== 1)) {
            continue;
        }
        const kind = [ ...types ][0];
        const type = kind.substring (2);
        const carrier = q + ((kind[0] === 'A') ? 'AsyncResult[' : 'EndpointResult[') + type + ']';
        const declEnd = close + 2 + head[0].length;
        const rest = masked.substring (declEnd, fe0);
        const read = new RegExp ('(?<![\\w.])((?:ccxt\\.)?GetValue\\()?' + v + '(?!\\w)(, (\\d+)\\))?', 'g');
        const reads: Edit[] = [];
        for (let u = read.exec (rest); u !== null; u = read.exec (rest)) {
            if ((u[1] === undefined) || (u[3] === undefined) || (Number (u[3]) >= elems.length)) {
                ok = false;
                break;
            }
            reads.push ({ 'start': declEnd + u.index, 'end': declEnd + u.index + u[0].length, 'text': q + 'BoxAbsent(' + v + '[' + u[3] + '])' });
        }
        if (!ok || new RegExp ('(?<![\\w.])' + r + '(?!\\w)').test (rest)) {
            continue;
        }
        edits.push (...local, ...reads);
        edits.push ({ 'start': m.index + m[1].length + r.length + 6, 'end': close + 1, 'text': q + 'PromiseAllTyped[' + type + ', ' + carrier + '](' + args.join (', ') + ')' });
        const varLine = head[0].split ('\n')[3];
        edits.push ({ 'start': declEnd - 1 - varLine.length, 'end': declEnd - 1, 'text': ind + 'var ' + v + ' []' + type + ' = ' + r + '.Value' });
    }
    return edits.length ? goChan3Splice (content, edits) : content;
}

// the shared pass: retypes tabled cores, their consumers and interface lines (idempotent)
export function goChan3Pass (content: string, table: Map<string, string> = goChan3Table ()): string {
    return goChan3LowerAbsent (goChan3PassMarked (content, table), table);
}

function goChan3PassMarked (content: string, table: Map<string, string>): string {
    content = goChan3PromiseAllPass (content, table);
    if ((table.size === 0) || (content.indexOf ('Async') < 0)) {
        return content;
    }
    const masked = goChanMask (content);
    const q = goChanQual (content);
    const cores = goChan3Cores (content, masked, table);
    const edits: Edit[] = [];
    for (const c of cores) {
        edits.push (...c.edits);
    }
    // element type of the core whose body holds `at` (undefined: an untabled AsyncResult[any] core / no core)
    const coreSendAt = (at: number) => {
        const c = cores.find ((k) => (at >= k.bodyStart) && (at < k.bodyEnd));
        return (c === undefined) ? undefined : table.get (c.method);
    };
    const iface = new RegExp ('^(\\t(' + [ ...table.keys () ].join ('|') + ')Async\\([^\\n]*\\)) <-chan ((?:ccxt\\.)?)AsyncResult\\[any\\]$', 'gm');
    for (let m = iface.exec (masked); m !== null; m = iface.exec (masked)) {
        edits.push ({ 'start': m.index, 'end': m.index + m[0].length, 'text': m[1] + ' <-chan ' + m[3] + 'AsyncResult[' + goChan3QualType (table.get (m[2]) as string, m[3]) + ']' });
    }
    edits.push (...goChan3ConsumerEdits (content, masked, table, cores, coreSendAt));
    return edits.length ? goChan3Splice (content, edits) : content;
}

// audit over generated Go text: per core the verdict ('' = provable) and send types
export function goChan3Audit (content: string, report: Report) {
    goChan3Cores (content, goChanMask (content), goChan3Table (), report);
}

function goChan3AuditDir (dir: string, json: boolean) {
    const files: string[] = [];
    for (const sub of [ '', 'pro', 'prediction' ]) {
        const d = path.join (dir, sub);
        if (fs.existsSync (d)) {
            files.push (...fs.readdirSync (d).filter ((f) => f.endsWith ('.go') && !f.endsWith ('_test.go')).map ((f) => path.join (d, f)));
        }
    }
    const per = new Map<string, { cores: number, bad: string[], types: Set<string> }> ();
    for (const f of files.sort ()) {
        goChan3Audit (fs.readFileSync (f, 'utf8'), (method, receiver, reason, types) => {
            const e = per.get (method) || { 'cores': 0, 'bad': [], 'types': new Set<string> () };
            e.cores++;
            types.forEach ((t) => e.types.add (t));
            if (reason !== '') {
                e.bad.push (path.relative (dir, f) + ':' + receiver + ':' + reason);
            }
            per.set (method, e);
        });
    }
    const rows = [ ...per.entries () ].map (([ method, e ]) => ({ method, 'cores': e.cores, 'unprovable': e.bad.length, 'types': [ ...e.types ].sort (), 'bad': e.bad }));
    rows.sort ((a, b) => (a.unprovable - b.unprovable) || (b.cores - a.cores));
    if (json) {
        console.log (JSON.stringify (rows, null, 1));
        return;
    }
    for (const r of rows) {
        const ok = (r.unprovable === 0) && (r.types.filter ((t) => t !== 'nil').length <= 1);
        console.log ((ok ? 'OK   ' : 'NO   ') + r.method + ' cores=' + r.cores + ' unprovable=' + r.unprovable + ' types=' + r.types.join ('|'));
        for (const b of r.bad) {
            console.log ('       ' + b);
        }
    }
}

export function goChan3SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('gochan3: ' + m); } };
    const table = new Map ([ [ 'SetX', 'map[string]any' ], [ 'GetN', 'int64' ], [ 'GetS', 'string' ] ]);
    goChanSetBaseReturnsForTest (new Map ([ [ 'BaseExchange.Extend', 'map[string]any' ] ]));
    const lc = (n: string) => n.charAt (0).toLowerCase () + n.slice (1);
    const core = (recv: string, body: string, name = 'SetX', Q = '') => 'func (this *' + recv + ') ' + name + 'Async(a any, optionalArgs ...any) <-chan ' + Q + 'AsyncResult[any] {\n\tch := make(chan ' + Q + 'AsyncResult[any], 1)\n\tgo this.' + lc (name) + 'Body(ch, a, optionalArgs...)\n\treturn ch\n}\nfunc (this *' + recv + ') ' + lc (name) + 'Body(ch chan ' + Q + 'AsyncResult[any], a any, optionalArgs ...any) any {\n\tdefer close(ch)\n\tdefer ' + Q + 'ReturnPanicError(ch)\n' + body + '}\n';
    const run = (src: string, t = table) => goChan3Pass (src, t);
    const throws = (src: string) => { try { run (src); return false; } catch (e) { return true; } };
    // retype + sends + nil
    const good = '\tvar response map[string]any = nil\n\tif a == nil {\n\t\tch <- AsyncResult[any]{Value: nil}\n\t\treturn nil\n\t}\n\tch <- AsyncResult[any]{Value: map[string]any{\n\t\t"k": 1,\n\t}}\n\tch <- AsyncResult[any]{Value: response} // c\n\treturn nil\n';
    const out = run ('package ccxt\n\n' + core ('X', good));
    ok (out.includes ('SetXAsync(a any, optionalArgs ...any) <-chan AsyncResult[map[string]any] {\n\tch := make(chan AsyncResult[map[string]any], 1)'), 'trampoline: ' + out);
    ok (out.includes ('setXBody(ch chan AsyncResult[map[string]any], a any'), 'body param');
    ok (out.includes ('\tdefer ReturnPanicError(ch)\n'), 'generic ReturnPanicError call unchanged');
    ok (out.includes ('ch <- AsyncResult[map[string]any]{Value: nil}'), 'nil send');
    ok (out.includes ('ch <- AsyncResult[map[string]any]{Value: map[string]any{\n\t\t"k": 1,\n\t}}'), 'multi-line literal send');
    ok (out.includes ('ch <- AsyncResult[map[string]any]{Value: response} // c'), 'local send');
    ok (run (out) === out, 'idempotent');
    // scalar core, pro qualification, typed call
    const pro = run ('package ccxtpro\n\n' + core ('X', '\tch <- ccxt.AsyncResult[any]{Value: this.ParseToInt(a)}\n\treturn nil\n', 'GetN', 'ccxt.'));
    ok (pro.includes ('<-chan ccxt.AsyncResult[int64] {') && pro.includes ('make(chan ccxt.AsyncResult[int64], 1)') && pro.includes ('ch <- ccxt.AsyncResult[int64]{Value: this.ParseToInt(a)}') && pro.includes ('(ch chan ccxt.AsyncResult[int64]'), 'pro qualification: ' + pro);
    // unprovable sends throw
    ok (throws ('package ccxt\n' + core ('X', '\tvar r any = nil\n\tch <- AsyncResult[any]{Value: r}\n\treturn nil\n')), 'any local throws');
    ok (throws ('package ccxt\n' + core ('X', '\tch <- AsyncResult[any]{Value: this.ParseOrder(a)}\n\treturn nil\n')), 'any call throws');
    ok (throws ('package ccxt\n' + core ('X', '\tch <- AsyncResult[any]{Value: nil}\n\treturn nil\n', 'GetN')), 'nil into scalar throws');
    ok (throws ('package ccxt\n' + core ('X', '\tvar b bool = true\n\tch <- AsyncResult[any]{Value: b}\n\treturn nil\n')), 'wrong type throws');
    ok (throws ('package ccxt\n' + core ('X', '\tgo func() { ch <- AsyncResult[any]{} }()\n\treturn nil\n')), 'escaping channel throws');
    ok (throws ('package ccxt\n' + core ('X', '\tch <- <-this.OtherAsync(a)\n\treturn nil\n')), 'untabled forward throws');
    ok (throws ('package ccxt\n' + core ('X', '\tr := <-this.OtherAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tch <- AsyncResult[any]{Value: r.Value}\n\treturn nil\n')), 'untabled value forward throws');
    ok (!throws ('package ccxt\n' + core ('X', '\tpanic(NotSupported("x"))\n')), 'send-free base core');
    ok (throws ('package ccxt\n\nfunc (this *X) SetXAsync(a any) <-chan AsyncResult[any] {\n\tout := make(chan AsyncResult[any])\n\treturn out\n}\n'), 'hand shape throws');
    // same-T forwards stay
    const fw = run ('package ccxt\n' + core ('X', '\tif a == nil {\n\t\tch <- <-this.DerivedExchange.SetXAsync(a)\n\t\treturn nil\n\t}\n\tr := <-this.SetXAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tch <- AsyncResult[any]{Value: r.Value}\n\treturn nil\n'));
    ok (fw.includes ('\t\tch <- <-this.DerivedExchange.SetXAsync(a)\n') && fw.includes ('\tch <- AsyncResult[map[string]any]{Value: r.Value}\n'), 'same-T forwards: ' + fw);
    // inherited base return
    const embed = 'package ccxt\ntype X struct {\n\tExchange\n}\n';
    ok (run (embed + core ('X', '\tch <- AsyncResult[any]{Value: this.Extend(a)}\n\treturn nil\n')).includes ('ch <- AsyncResult[map[string]any]{Value: this.Extend(a)}'), 'base typed return');
    // consumers
    const consumer = 'package ccxt\n\nfunc (this *Y) f() any {\n' +
        '\tr := <-this.SetXAsync(1)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar m map[string]any = MapTyped(r.Value)\n' +
        '\tr1 := <-this.GetNAsync(1)\n\tif r1.Err != nil {\n\t\tpanic(r1.Err)\n\t}\n\tvar n int64 = r1.Value.(int64)\n' +
        '\tr2 := <-this.SetXAsync(2)\n\tif r2.Err != nil {\n\t\tpanic(r2.Err)\n\t}\n\tresponse := r2.Value\n\tif IsEqual(response, nil) {\n\t\treturn nil\n\t}\n' +
        '\tr3 := <-this.GetNAsync(3)\n\tif r3.Err != nil {\n\t\tpanic(r3.Err)\n\t}\n\tt := r3.Value\n' +
        '\tr4 := <-this.GetSAsync(3)\n\tif r4.Err != nil {\n\t\tpanic(r4.Err)\n\t}\n\ts := r4.Value\n\ts = nil\n' +
        '\tr5 := <-this.base.SetXAsync(5)\n\tif r5.Err != nil {\n\t\tpanic(r5.Err)\n\t}\n\tvar o Order = NewOrder(r5.Value)\n\tAppendToArray(&list, r5.Value)\n' +
        '\tp := promiseAll([]any{this.SetXAsync(5), this.OtherAsync()})\n\tthis.Spawn(this.SetXAsync, 6)\n\tPanicOnError((<-this.SetXAsync(7)))\n' +
        '\treturn []any{m, n, response, t, s, o, p}\n}\n';
    const c = run (consumer);
    ok (c.includes ('\tvar m map[string]any = r.Value\n'), 'MapTyped dropped');
    ok (c.includes ('\tvar n int64 = r1.Value\n'), 'assertion dropped');
    ok (c.includes ('\tvar response any = nil\n\tif r2.Value != nil {\n\t\tresponse = r2.Value\n\t}\n') && !c.includes ('BoxAbsent'), 'nilable any-handoff native fold: ' + c);
    ok (c.includes ('\tt := r3.Value\n'), 'scalar typed local kept');
    ok (c.includes ('\tvar s any = r4.Value\n\ts = nil\n'), 'rebound local stays any');
    ok (c.includes ('NewOrder(r5.Value)') && c.includes ('\tvar r5ValueBox any = nil\n\tif r5.Value != nil {\n\t\tr5ValueBox = r5.Value\n\t}\n\tAppendToArray(&list, r5ValueBox)'), 'wrapper conv kept, handoff hoisted native');
    ok (c.includes ('[]any{this.SetXAsync(5), this.OtherAsync()}') && c.includes ('this.Spawn(this.SetXAsync, 6)') && c.includes ('PanicOnError((<-this.SetXAsync(7)))'), 'reflective consumers untouched');
    ok (run (c) === c, 'consumer idempotent');
    ok ((() => { try { run ('package ccxt\n\nfunc (this *Y) f() {\n\tr := <-this.SetXAsync(1)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\t_ = r.Value.([]any)\n}\n'); return false; } catch (e) { return true; } }) (), 'mismatched assertion throws');
    const okForm = run ('package ccxt\n\nfunc (this *Y) f() {\n\tr := <-this.SetXAsync(1)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tv, ok := r.Value.(map[string]any)\n\t_, _ = v, ok\n}\n');
    ok (okForm.includes ('\tv, ok := r.Value, r.Value != nil\n'), 'comma-ok assertion keeps its nil verdict');
    // forward of a tabled receive into an untabled core
    const into = run ('package ccxt\n' + core ('X', '\tch <- <-this.DerivedExchange.SetXAsync(a)\n\treturn nil\n', 'Other'));
    ok (into.includes ('\tr := <-this.DerivedExchange.SetXAsync(a)\n\tif r.Value == nil {\n\t\tch <- AsyncResult[any]{Value: nil, Err: r.Err}\n\t} else {\n\t\tch <- AsyncResult[any]{Value: r.Value, Err: r.Err}\n\t}\n'), 'forward into any core: ' + into);
    ok (run (into) === into, 'forward idempotent');
    const into2 = run ('package ccxt\n' + core ('X', '\tr := <-this.SetXAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tch <- AsyncResult[any]{Value: r.Value}\n\treturn nil\n', 'Other'));
    ok (into2.includes ('\tif r.Value == nil {\n\t\tch <- AsyncResult[any]{Value: nil}\n\t} else {\n\t\tch <- AsyncResult[any]{Value: r.Value}\n\t}\n'), 'value forward into any core: ' + into2);
    ok (run (into2) === into2, 'value forward idempotent');
    // interface lines
    const itf = run ('package ccxt\n\ntype I interface {\n\tSetXAsync(a any, optionalArgs ...any) <-chan AsyncResult[any]\n\tOtherAsync() <-chan AsyncResult[any]\n}\n');
    ok (itf.includes ('\tSetXAsync(a any, optionalArgs ...any) <-chan AsyncResult[map[string]any]\n\tOtherAsync() <-chan AsyncResult[any]\n'), 'interface line');
    ok (run (consumer, new Map ()) === consumer, 'empty table no-op');
    // audit
    const seen: string[] = [];
    goChan3Cores ('package ccxt\n' + core ('X', '\tch <- AsyncResult[any]{Value: this.ParseOrder(a)}\n\treturn nil\n'), goChanMask ('package ccxt\n' + core ('X', '\tch <- AsyncResult[any]{Value: this.ParseOrder(a)}\n\treturn nil\n')), new Map (), (mm, rr, reason) => seen.push (mm + ':' + reason));
    ok (seen.length === 1 && seen[0] === 'SetX:call-send:ParseOrder', 'audit reason: ' + seen.join (';'));
    // endpoint-joined locals
    goChan3SetStubsForTest (new Map ([ [ 'PubGetA', 'map[string]any' ], [ 'PubGetL', '[]any' ] ]));
    const joined = run ('package ccxt\n' + core ('X', '\tvar response any = nil\n\tif a == nil {\n\n\t\tr := <-this.PubGetA(a)\n\t\tif r.Err != nil {\n\t\t\tpanic(r.Err)\n\t\t}\n\t\tresponse = r.Raw\n\t} else {\n\n\t\tr1 := <-this.PubGetA(a)\n\t\tif r1.Err != nil {\n\t\t\tpanic(r1.Err)\n\t\t}\n\t\tresponse = r1.Raw\n\t}\n\tif response == nil {\n\t\tpanic(\"x\")\n\t}\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n'));
    ok (joined.includes ('\tvar response map[string]any = nil\n') && joined.includes ('response = r.Value\n') && joined.includes ('response = r1.Value\n') && joined.includes ('ch <- AsyncResult[map[string]any]{Value: response}'), 'endpoint join: ' + joined);
    ok (throws ('package ccxt\n' + core ('X', '\tvar response any = nil\n\tr := <-this.PubGetL(a)\n\tresponse = r.Raw\n\tr1 := <-this.PubGetA(a)\n\tresponse = r1.Raw\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n')), 'mixed endpoint join throws');
    ok (throws ('package ccxt\n' + core ('X', '\tr := <-this.PubGetA(a)\n\tresponse := r.Raw\n\tthis.Use(response)\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n')), 'other use throws');
    // typed promiseAll
    const pall = 'package ccxt\n\nfunc (this *Y) f(p any) any {\n\tvar a any = EndpointRaw(this.PubGetA(p))\n\tr := <-promiseAll([]any{a, this.PubGetA(p)})\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar v []any = ListTyped(r.Value)\n\tx := GetValue(v, 0)\n\treturn []any{x, GetValue(v, 1)}\n}\n';
    const pt = run (pall);
    ok (pt.includes ('\ta := this.PubGetA(p)\n\tr := <-PromiseAllTyped[map[string]any, EndpointResult[map[string]any]](a, this.PubGetA(p))\n') && pt.includes ('\tvar v []map[string]any = r.Value\n\tvar x any = nil\n\tif v[0] != nil {\n\t\tx = v[0]\n\t}\n\tvar v1Box any = nil\n\tif v[1] != nil {\n\t\tv1Box = v[1]\n\t}\n\treturn []any{x, v1Box}'), 'typed promiseAll: ' + pt);
    ok (run (pt) === pt, 'typed promiseAll idempotent');
    ok (run (pall.replace ('this.PubGetA(p)})', 'this.PubGetL(p)})')) === pall.replace ('this.PubGetA(p)})', 'this.PubGetL(p)})'), 'mixed promiseAll untouched');
    ok (run (pall.replace ('x := GetValue(v, 0)', 'x := v')) === pall.replace ('x := GetValue(v, 0)', 'x := v'), 'whole-list read untouched');
    goChan3SetStubsForTest (undefined);
    goChanSetBaseReturnsForTest (undefined);
    return problems;
}

// hand-written go/v4/exchange_interface.go is not regenerated: retype its tabled lines, list other hand refs
function goChan3ApplyHand () {
    const dir = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'go', 'v4');
    const table = goChan3Table ();
    const iface = path.join (dir, 'exchange_interface.go');
    fs.writeFileSync (iface, goChan3Pass (fs.readFileSync (iface, 'utf8'), table));
    if (!table.size) {
        return;
    }
    const ref = new RegExp ('\\b(' + [ ...table.keys () ].join ('|') + ')Async\\b');
    const roots = [ dir, path.join (dir, '..', 'tests', 'base') ];
    for (const d of roots) {
        for (const f of fs.readdirSync (d).filter ((x) => x.endsWith ('.go') && x !== 'exchange_interface.go')) {
            const body = fs.readFileSync (path.join (d, f), 'utf8');
            if ((body.indexOf ('PLEASE DO NOT EDIT THIS FILE') >= 0) || /^\/\/ Code generated/m.test (body) || !/^exchange|^test\.(helpers|structs)/.test (f)) {
                continue;
            }
            body.split ('\n').forEach ((l, i) => { if (ref.test (l)) { console.log ('HAND-REF ' + path.relative (process.cwd (), path.join (d, f)) + ':' + (i + 1) + ': ' + l.trim ()); } });
        }
    }
}

// replay over committed generated Go (preview only; never commit the output)
function goChan3Replay (dir: string, write: boolean) {
    let files = 0;
    let changed = 0;
    for (const sub of [ '', 'pro', 'prediction', '../tests/base' ]) {
        const d = path.join (dir, sub);
        if (!fs.existsSync (d)) {
            continue;
        }
        for (const f of fs.readdirSync (d).filter ((x) => x.endsWith ('.go'))) {
            const p = path.join (d, f);
            const text = fs.readFileSync (p, 'utf8');
            const out = goChan3Pass (text);
            files++;
            if (out !== text) {
                changed++;
                if (write) {
                    fs.writeFileSync (p, out);
                }
            }
        }
    }
    console.log ('GOCHAN3 replay: ' + changed + '/' + files + ' files changed' + (write ? ' (written)' : ''));
}

if (process.argv[1] && fileURLToPath (import.meta.url) === path.resolve (process.argv[1])) {
    const argv = process.argv.slice (2);
    const dirArg = argv.find ((a) => !a.startsWith ('--')) || path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'go', 'v4');
    if (argv.includes ('--self-test')) {
        const problems = goChan3SelfTest ();
        console.log (problems.length ? problems.join ('\n') : 'GOCHAN3 SELF-TEST PASSED');
        process.exit (problems.length ? 3 : 0);
    } else if (argv.includes ('--audit')) {
        goChan3AuditDir (dirArg, argv.includes ('--json'));
    } else if (argv.includes ('--apply-hand')) {
        goChan3ApplyHand ();
    } else if (argv.includes ('--replay')) {
        goChan3Replay (dirArg, argv.includes ('--write'));
    }
}
