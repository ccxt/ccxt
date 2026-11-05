// ===== GO-CHAN3: typed AsyncResult channels (`<-chan AsyncResult[any]` -> `<-chan AsyncResult[T]`) =====
// API
//   tables  build/go-chan-tables.json async: { "<Core>": "<Go T>" } keyed by the printed core name without
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
// Runtime: ReturnPanicError[T] is generic; reflective readers read a typed AsyncResult[T] through the runtime's untyped accessor.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GO_STRUCT_RETURN_TYPES } from './go-struct-returns.js';
import { goChanMask, goChanClose, goChanExprEnd, goChanQual, goChanSendType, goChanMethodReturn, goChanTable, goChanSetBaseReturnsForTest } from './go-chan.js';

const GO_CHAN3_FILE = path.join (path.dirname (fileURLToPath (import.meta.url)), 'go-chan-tables.json');
const goChan3File = (): { 'async': Record<string, string>, 'resolved': string[] } => JSON.parse (fs.readFileSync (GO_CHAN3_FILE, 'utf8'));
let GO_CHAN3_TABLE: Map<string, string> | undefined = undefined;

export function goChan3Nilable (type: string): boolean {
    return /^(?:map\[|\[\]|\*)/.test (type) || goChan3WsInterface (type);
}

export function goChan3BaseType (type: string): string {
    return type.replace (/\?$/, '');
}

export function goChan3AllowsNil (rawType: string): boolean {
    return rawType.endsWith ('?') || goChan3Nilable (goChan3BaseType (rawType));
}

export function goChan3LookupRaw (table: Map<string, string>, receiver: string | undefined, method: string): string | undefined {
    return ((receiver !== undefined) && (receiver !== '') && table.has (receiver + '.' + method))
        ? table.get (receiver + '.' + method)
        : table.get (method);
}

export function goChan3Lookup (table: Map<string, string>, receiver: string | undefined, method: string): string | undefined {
    const raw = goChan3LookupRaw (table, receiver, method);
    return (raw === undefined) ? undefined : goChan3BaseType (raw);
}

function goChan3EnclosingReceiver (masked: string, at: number): string | undefined {
    const [ fs0 ] = goChan3Func (masked, at);
    const m = /^func \(this \*(\w+)\) /.exec (masked.substring (fs0, fs0 + 80));
    return (m === null) ? undefined : m[1];
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
        const recv = goChan3EnclosingReceiver (masked, at);
        return binds.length ? goChan3Lookup (table, recv, binds[binds.length - 1][1]) : undefined;
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
    return /^(?:ccxt\.)?(?:OrderBookInterface|ArrayCacheInterface|ClientInterface)$/.test (type);
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
    // untyped nil stays nil, a book / cache / client keeps its pointer
    const unbox = /ArrayCacheInterface$/.test (t) ? 'AsArrayCache' : (/ClientInterface$/.test (t) ? 'AsClient' : 'OrderBookTyped');
    return q + unbox + '(' + expr + ')';
}

// a balance local: one `var X any|map[string]any = map[string]any{` declaration, every later write keeps that map
// (`X = this.MergeBalanceAccount(X, ..)` / `X = this.SafeBalance(X)` return their first argument, bare or
// inside the printer's `MapTyped(..)` box cast)
export function goChan3BalanceLocal (fnMasked: string, name: string): boolean {
    if ((fnMasked.match (new RegExp ('(?<![\\w.])var ' + name + '\\b', 'g')) || []).length !== 1) {
        return false;
    }
    if (!new RegExp ('\\n\\t+var ' + name + ' (?:any|map\\[string\\]any) = map\\[string\\]any\\{').test (fnMasked)) {
        return false;
    }
    if (new RegExp ('(?<![\\w.])' + name + '\\s*(?:,[^\\n=]*)?:=|\\bfunc\\s*\\([^)]*\\b' + name + ' ').test (fnMasked)) {
        return false;
    }
    const writes = fnMasked.match (new RegExp ('(?<![\\w.])' + name + '\\s*[-+*/:]?=(?!=)[^\\n]*', 'g')) || [];
    const keeps = new RegExp ('^' + name + ' = (?:MapTyped\\()?this\\.(?:MergeBalanceAccount\\(' + name + ', |SafeBalance\\(' + name + '\\)\\)?$)');
    return writes.every ((w) => keeps.test (w));
}

// a map[string]any send of a balance: `this.SafeBalance(X)` / `X` of a balance local (SafeBalance returns its
// argument, so the value is that map; SafeBalance stays `any` for the ws callers' *sync.Map), or `X` declared once
// `var X any = <map-returning call>` and never rewritten (the declaration is retyped)
function goChan3BalanceSend (expr: string, fnMasked: string, ownCall: (name: string) => string | undefined): { value: string, decl?: { start: number, end: number } } | undefined {
    const safe = /^this\.SafeBalance\((\w+)\)$/.exec (expr);
    const name = (safe !== null) ? safe[1] : (/^[a-z]\w*$/.test (expr) ? expr : undefined);
    if (name === undefined) {
        return undefined;
    }
    if (goChan3BalanceLocal (fnMasked, name)) {
        const typed = new RegExp ('\\n\\t+var ' + name + ' map\\[string\\]any = ').test (fnMasked);
        // the SafeBalance call stays (it normalises the map in place); only its `any` result is narrowed
        return { 'value': ((safe !== null) || !typed) ? expr + '.(map[string]any)' : expr };
    }
    if (safe !== null) {
        return undefined;
    }
    const decl = new RegExp ('\\n\\t+var ' + name + ' (any) = this\\.(\\w+)\\(').exec (fnMasked);
    if ((decl === null) || ((fnMasked.match (new RegExp ('(?<![\\w.])var ' + name + '\\b', 'g')) || []).length !== 1)) {
        return undefined;
    }
    const callStart = decl.index + decl[0].length - decl[2].length - 6;
    const callEnd = goChanExprEnd (fnMasked, callStart);
    if ((goChanClose (fnMasked, decl.index + decl[0].length - 1) !== callEnd) || (ownCall (decl[2]) !== 'map[string]any')) {
        return undefined;
    }
    const writes = fnMasked.match (new RegExp ('(?<![\\w.])' + name + '\\s*(?:,[^\\n=]*)?[-+*/:]?=(?!=)', 'g')) || [];
    if ((writes.length !== 0) || new RegExp ('\\bfunc\\s*\\([^)]*\\b' + name + ' ').test (fnMasked)) {
        return undefined;
    }
    const at = decl.index + decl[0].indexOf (' any = ') + 1;
    return { 'value': name, 'decl': { 'start': at, 'end': at + 3 } };
}

// method -> T from go-chan-tables.json async; a method also in a gochan table throws
export function goChan3Table (): Map<string, string> {
    if (GO_CHAN3_TABLE === undefined) {
        const table = new Map<string, string> ();
        const f = 'go-chan-tables.json';
        const entries = goChan3File ().async;
        const carriers = goChanTable ();
        for (const method of Object.keys (entries)) {
            const type = entries[method];
            if ((typeof type !== 'string') || /\bany\b(?!\])|^interface/.test (type.replace (/^(?:\[\])?map\[string\]any$|^\[\]any$/, ''))) {
                throw new Error ('GOCHAN3: ' + method + ': element type must be concrete (' + f + ')');
            }
            if (carriers.has (method)) {
                throw new Error ('GOCHAN3: ' + method + ' is already an EndpointResult carrier (gochan table), ' + f);
            }
            table.set (method, type);
        }
        GO_CHAN3_TABLE = table;
    }
    return GO_CHAN3_TABLE;
}

export function goChan3SetTableForTest (table: Map<string, string> | undefined, resolved?: Set<string>) {
    GO_CHAN3_TABLE = table;
    GO_CHAN3_RESOLVED = resolved;
}

// ===== GO-CHAN3 WS2: the Future resolution boundary =====
// Methods in go-chan-tables.json resolved (watch*/ *Ws) may send what a ws handler resolved (Client.Resolve takes any): such a
// send becomes an inline type switch (T, *sync.Map snapshot / ArrayCache ToArray, nil) that panics on any other type.
let GO_CHAN3_RESOLVED: Set<string> | undefined = undefined;

export function goChan3Resolved (): Set<string> {
    if (GO_CHAN3_RESOLVED === undefined) {
        GO_CHAN3_RESOLVED = new Set (goChan3File ().resolved);
    }
    return GO_CHAN3_RESOLVED;
}

function goChan3ResolvedOk (want: string | undefined, method: string, receiver?: string): boolean {
    const resolved = goChan3Resolved ();
    return (want !== undefined) && (resolved.has (method) || ((receiver !== undefined) && resolved.has (receiver + '.' + method)))
        && /^(?:map\[string\]any|\[\]any|bool|\*string|int|int64|OrderBookInterface|ArrayCacheInterface|ClientInterface)$/.test (want);
}

// `var <v> T` + a type switch over `expr` + the typed send, as statements at indent `ind` (first line unindented)
function goChan3ResolvedStmts (ind: string, expr: string, want: string, q: string, v: string): string {
    if (want === 'OrderBookInterface') {
        return 'var ' + v + ' ' + q + 'OrderBookInterface = ' + q + 'OrderBookTyped(' + expr + ')\n' + ind + 'ch <- ' + q + 'AsyncResult[' + q + 'OrderBookInterface]{Value: ' + v + '}';
    }
    if (want === 'ArrayCacheInterface') {
        return 'var ' + v + ' ' + q + 'ArrayCacheInterface = ' + q + 'AsArrayCache(' + expr + ')\n' + ind + 'ch <- ' + q + 'AsyncResult[' + q + 'ArrayCacheInterface]{Value: ' + v + '}';
    }
    if (want === 'ClientInterface') {
        return 'var ' + v + ' ' + q + 'ClientInterface = ' + q + 'AsClient(' + expr + ')\n' + ind + 'ch <- ' + q + 'AsyncResult[' + q + 'ClientInterface]{Value: ' + v + '}';
    }
    const box = v + 'Box';
    const swExpr = (/^this\.[A-Z]\w*$/.test (expr) ? ('any(' + expr + ')') : expr);
    if (want === 'bool') {
        const lines = [
            'var ' + v + ' bool',
            'switch ' + box + ' := ' + swExpr + '.(type) {',
            'case bool:', '\t' + v + ' = ' + box,
            'case []any:', '\t' + v + ' = len(' + box + ') > 0',
            'case map[string]any:', '\t' + v + ' = true',
            'case nil:',
            'default:', '\tpanic(' + q + 'ExchangeError("resolved value is not bool"))',
            '}',
            'ch <- ' + q + 'AsyncResult[bool]{Value: ' + v + '}',
        ];
        return lines.map ((l, i) => ((i === 0) ? '' : ind) + l).join ('\n');
    }
    if (want === '*string') {
        const lines = [
            'var ' + v + ' *string',
            'switch ' + box + ' := ' + swExpr + '.(type) {',
            'case *string:', '\t' + v + ' = ' + box,
            'case string:', '\t' + v + ' = &' + box,
            'default:', '\t_ = ' + box,
            '}',
            'ch <- ' + q + 'AsyncResult[*string]{Value: ' + v + '}',
        ];
        return lines.map ((l, i) => ((i === 0) ? '' : ind) + l).join ('\n');
    }
    if ((want === 'int') || (want === 'int64')) {
        const lines = [
            'var ' + v + ' ' + want,
            'switch ' + box + ' := ' + swExpr + '.(type) {',
            'case ' + want + ':', '\t' + v + ' = ' + box,
            'default:', '\t_ = ' + box,
            '}',
            'ch <- ' + q + 'AsyncResult[' + want + ']{Value: ' + v + '}',
        ];
        return lines.map ((l, i) => ((i === 0) ? '' : ind) + l).join ('\n');
    }
    const conv = (want === '[]any')
        ? [ 'case ' + q + 'IArrayCache:', '\t' + v + ' = ' + box + '.ToArray()' ]
        : [ 'case *sync.Map:', '\t' + v + ' = ' + q + 'SafeMapToMap(' + box + ')' ];
    const lines = [
        'var ' + v + ' ' + want,
        'switch ' + box + ' := ' + swExpr + '.(type) {',  // struct fields are concrete
        'case ' + want + ':', '\t' + v + ' = ' + box,
        ...conv,
        'case nil:',
        'default:', '\tpanic(' + q + 'ExchangeError("resolved value is not ' + want + '"))',
        '}',
        'ch <- ' + q + 'AsyncResult[' + want + ']{Value: ' + v + '}',
    ];
    return lines.map ((l, i) => ((i === 0) ? '' : ind) + l).join ('\n');
}

function goChan3ResolvedName (fn: string, taken: Set<string>): string {
    for (let k = 0; ; k++) {
        const name = 'resolved' + ((k === 0) ? '' : k);
        if (!taken.has (name) && !new RegExp ('\\b' + name + '(?:Box)?\\b').test (fn)) {
            taken.add (name);
            return name;
        }
    }
}

// `import "sync"` for a file whose ws2 switches read *sync.Map
function goChan3ResolvedImports (content: string): string {
    if (((content.indexOf ('case *sync.Map:') < 0) && (content.indexOf ('AsyncResult[*sync.Map]') < 0)) || /^import "sync"$|^\s+"sync"$/m.test (content)) {
        return content;
    }
    // ws files import ccxt; REST files in package ccxt (W17/W20/W26) import it after the package line
    const m = /^import ccxt "[^"]+"\n/m.exec (content) || /^package \w+\n/m.exec (content);
    if (m === null) {
        throw new Error ('GOCHAN3: ws2 switch needs import "sync" but the file has no ccxt import line');
    }
    // gofmt separates the package clause from the first import with a blank line
    const sep = m[0].startsWith ('package ') ? '\n' : '';
    return content.substring (0, m.index + m[0].length) + sep + 'import "sync"\n' + content.substring (m.index + m[0].length);
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
function goChan3ReceiveMethod (masked: string, recvAt: number, table: Map<string, string>, receiver?: string): string | undefined {
    const m = /^<-\s*([\w.]+(?:\.\((?:ccxt\.)?I\w+\))?)\.(\w+)Async\(/.exec (masked.substring (recvAt, recvAt + 300));
    const r = receiver ?? goChan3EnclosingReceiver (masked, recvAt);
    if ((m === null) || (goChan3Lookup (table, r, m[2]) === undefined) || !GO_CHAN3_RECEIVERS.test (m[1].replace (/\.\((?:ccxt\.)?I\w+\)$/, ''))) {
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

// T of a sent `rN.Raw` bound once by `rN := <-this.Stub(..)` (typed implicit-API stub) or `<-this.MAsync(..)` (gochan
// EndpointResult carrier); its Value is the same response's typed view
function goChan3EndpointRawType (expr: string, fnMasked: string): string | undefined {
    const m = /^(r\d*)\.Raw$/.exec (expr);
    if (m === null) {
        return undefined;
    }
    const binds = [ ...fnMasked.matchAll (new RegExp ('\\n\\t+' + m[1] + ' :?= <-this\\.(\\w+)\\(', 'g')) ];
    if ((binds.length !== 1) || ((fnMasked.match (new RegExp ('(?<![\\w.])' + m[1] + '\\s*:?=(?!=)', 'g')) || []).length !== 1)) {
        return undefined;
    }
    const callee = binds[0][1];
    const stub = goChan3EndpointStubs ().get (callee);
    if (stub !== undefined) {
        return stub;
    }
    const carrier = /^(\w+)Async$/.exec (callee);
    return (carrier === null) ? undefined : goChanTable ().get (carrier[1]);
}

// a sent local whose every write is an awaited typed endpoint (`x := rN.Raw`, `var x any = nil` + `x = rN.Raw`)
// and whose other uses are nil tests only: typed T, writes read Value (endpointValue[T] of Raw) instead of Raw
function goChan3LocalJoin (name: string, fnMasked: string, bodyStart: number, table?: Map<string, string>, receiver?: string): { type?: string, reason?: string, edits: Edit[] } {
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
            const fwds = fnMasked.match (new RegExp ('\\n\\t+' + w[2] + ' := <-(?:this|this\\.Exchange|this\\.DerivedExchange|this\\.base)(?:\\.\\((?:ccxt\\.)?I\\w+\\))?\\.(\\w+)Async\\(', 'g')) || [];
            const fwd = (fwds.length === 1) ? /\.(\w+)Async\($/.exec (fwds[0]) : null;
            // a forward of a tabled AsyncResult[T] core (Value) or of an EndpointResult[T] carrier (Raw is the same value)
            const fwdLookup = ((fwd !== null) && (table !== undefined) && (w[3] === 'Value')) ? goChan3Lookup (table, receiver, fwd[1]) : undefined;
            const fwdType = (fwd === null) ? undefined : (fwdLookup ?? goChanTable ().get (fwd[1]));
            const t = ((stub === null) ? undefined : stubs.get (stub[1])) ?? fwdType;
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
        // `var x any = <one-line call of a GO_CHAN_CALL_TYPES producer>`: the declaration carries the producer's type
        const callInit = /^ any = ((?:ccxt\.)?this\.\w+\(.*\))\s*$/.exec (after);
        const callProof = ((callInit === null) || (goChanClose (callInit[1], callInit[1].indexOf ('(')) !== callInit[1].length)) ? undefined : goChanSendType (callInit[1].replace (/^ccxt\./, ''), '', '');
        if (/^\t+var $/.test (lead) && (callProof !== undefined) && (callProof.type !== undefined) && (callProof.bind === true)) {
            decls++;
            types.add (callProof.type);
            declAt = o.index + name.length + 1;
            continue;
        }
        const safeDictInit = /^ any = (this\.SafeDict(2|N)?\(.*\))\s*$/.exec (after);
        if (/^\t+var $/.test (lead) && (safeDictInit !== null) && (goChanClose (safeDictInit[1], safeDictInit[1].indexOf ('(')) === safeDictInit[1].length)) {
            decls++;
            types.add ('map[string]any');
            declAt = o.index + name.length + 1;
            const sdAt = o.index + name.length + ' any = this.'.length;
            const sdLen = 'SafeDict'.length + (safeDictInit[2] || '').length;
            edits.push ({ 'start': bodyStart + sdAt, 'end': bodyStart + sdAt + sdLen, 'text': 'SafeDict' + (safeDictInit[2] || '') + 'Map' });
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

// ===== GO-CHAN3 ENDPOINT SENDS: a core's send of its own receiver's implicit-endpoint receive =====
// `ch <- {Value: rN.Raw|rN.Value}`, or a sent local whose every write is such a read (or a T literal) and whose
// other uses are nil tests. The stub is resolved per receiver (`*_api.go` of that struct), so a name another
// exchange types differently does not veto it. EndpointResult[T] stubs read Value (= endpointValue[T](Raw));
// an untyped stub documented as "a JSON object." / "a JSON array." reads MapTyped/ListTyped(rN.Value), the
// very conversion endpointValue[T] applies. `IsEqual(x, nil)` becomes `x == nil` (typed-nil trap).
let GO_CHAN3_RECV_STUBS: Map<string, string> | undefined = undefined;

// `Receiver.Stub` -> 'E:T' (EndpointResult[T]) | 'A:T' (AsyncResult[any] documented as JSON object/array)
export function goChan3ReceiverStubs (): Map<string, string> {
    if (GO_CHAN3_RECV_STUBS === undefined) {
        const dir = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'go', 'v4');
        const out = new Map<string, string> ();
        const sig = /^(?:\/\/ \w+ returns a channel that yields ([^\n]*)\n)?func \(this \*(\w+)\) (\w+)\(args \.\.\.any\) <-chan (?:ccxt\.)?(?:EndpointResult\[(.+)\]|AsyncResult\[any\]) \{$/gm;
        const doc: { [k: string]: string } = { 'a JSON object.': 'map[string]any', 'a JSON array.': '[]any' };
        for (const d of [ dir, path.join (dir, 'prediction') ]) {
            for (const f of fs.existsSync (d) ? fs.readdirSync (d).filter ((x) => x.endsWith ('_api.go')) : []) {
                const text = fs.readFileSync (path.join (d, f), 'utf8');
                for (let m = sig.exec (text); m !== null; m = sig.exec (text)) {
                    const t = (m[4] !== undefined) ? ('E:' + m[4]) : ((doc[m[1] || ''] !== undefined) ? ('A:' + doc[m[1] as string]) : '');
                    const k = m[2] + '.' + m[3];
                    out.set (k, (out.has (k) && (out.get (k) !== t)) ? '' : t);
                }
            }
        }
        GO_CHAN3_RECV_STUBS = new Map ([ ...out ].filter (([ , t ]) => t !== ''));
    }
    return GO_CHAN3_RECV_STUBS;
}

export function goChan3SetReceiverStubsForTest (map: Map<string, string> | undefined) {
    GO_CHAN3_RECV_STUBS = map;
}

// typed text of `r.field` when r is bound exactly once from `<-this.Stub(` of this receiver
function goChan3EndpointRead (r: string, field: string, receiver: string, fnMasked: string, q: string): { type: string, text: string } | undefined {
    const binds = fnMasked.match (new RegExp ('\\n\\t+' + r + ' := <-this\\.(\\w+)\\(', 'g')) || [];
    const writes = fnMasked.match (new RegExp ('(?<![\\w.])' + r + '(?:\\s*,\\s*\\w+)*\\s*:?=(?!=)', 'g')) || [];
    const stub = (binds.length === 1) ? /<-this\.(\w+)\($/.exec (binds[0]) : null;
    const s = ((stub === null) || (writes.length !== 1)) ? undefined : goChan3ReceiverStubs ().get (receiver + '.' + stub[1]);
    if (s === undefined) {
        return undefined;
    }
    const type = s.substring (2);
    if (s[0] === 'E') {
        return { type, 'text': r + '.Value' };
    }
    return (field === 'Value') ? { type, 'text': q + ((type === '[]any') ? 'ListTyped(' : 'MapTyped(') + r + '.Value)' } : undefined;
}

// the proof of a send `{Value: expr}` (fnMasked offsets open/close of its braces) through endpoint reads, with edits
function goChan3EndpointSend (expr: string, receiver: string, fnMasked: string, bodyStart: number, open: number, close: number, q: string, memo: Map<string, { type?: string, reason?: string, edits: Edit[] }>): { type: string, edits: Edit[] } | undefined {
    const direct = /^(r\d*)\.(Raw|Value)$/.exec (expr);
    if (direct !== null) {
        const read = goChan3EndpointRead (direct[1], direct[2], receiver, fnMasked, q);
        const at = open + 1 + 'Value: '.length;
        return ((read === undefined) || (fnMasked.substring (at, close - 1) !== expr)) ? undefined : { 'type': read.type, 'edits': (read.text === expr) ? [] : [ { 'start': bodyStart + at, 'end': bodyStart + close - 1, 'text': read.text } ] };
    }
    if (!/^[a-z]\w*$/.test (expr)) {
        return undefined;
    }
    const seen = memo.get ('#endpoint:' + expr);
    if (seen !== undefined) {
        return (seen.type === undefined) ? undefined : { 'type': seen.type, 'edits': [] };
    }
    const edits: Edit[] = [];
    const types = new Set<string> ();
    const occ = new RegExp ('(?<![\\w.])' + expr + '(?!\\w)', 'g');
    let decls = 0;
    let declAt = -1;
    let ok = true;
    for (let o = occ.exec (fnMasked); (o !== null) && ok; o = occ.exec (fnMasked)) {
        const ls = fnMasked.lastIndexOf ('\n', o.index) + 1;
        const lead = fnMasked.substring (ls, o.index);
        const after = fnMasked.substring (o.index + expr.length, fnMasked.indexOf ('\n', o.index));
        const w = /^ (:?=) (r\d*)\.(Raw|Value)\s*$/.exec (after);
        const lit = /^ = (map\[string\]any|\[\]any)\{\s*$/.exec (after);
        const eq = /(?:ccxt\.)?IsEqual\($/.exec (lead);
        const done = /^ :?= (?:ccxt\.)?(MapTyped|ListTyped)\((r\d*)\.Value\)\s*$/.exec (after);
        const doneRead = (done === null) ? undefined : goChan3EndpointRead (done[2], 'Value', receiver, fnMasked, q);
        if (/^\t+$/.test (lead) && (doneRead !== undefined) && (doneRead.type === (((done as RegExpExecArray)[1] === 'MapTyped') ? 'map[string]any' : '[]any'))) {
            decls += /^ :=/.test (after) ? 1 : 0;
            types.add (doneRead.type);   // already rewritten (idempotency)
        } else if (/^\t+$/.test (lead) && (w !== null)) {
            const read = goChan3EndpointRead (w[2], w[3], receiver, fnMasked, q);
            ok = read !== undefined;
            if (read !== undefined) {
                decls += (w[1] === ':=') ? 1 : 0;
                types.add (read.type);
                const at = o.index + expr.length + w[1].length + 2;
                edits.push ({ 'start': bodyStart + at, 'end': bodyStart + at + w[2].length + 1 + w[3].length, 'text': read.text });
            }
        } else if (/^\t+var $/.test (lead) && /^ any = nil\s*$/.test (after)) {
            decls++;
            declAt = o.index + expr.length + 1;
        } else if (/^\t+$/.test (lead) && (lit !== null)) {
            types.add (lit[1]);
        } else if ((/^\t+$/.test (lead) && /^ = nil\s*$/.test (after)) || /^ [!=]= nil\b/.test (after)) {
            continue;
        } else if ((eq !== null) && after.startsWith (', nil)')) {
            edits.push ({ 'start': bodyStart + o.index - eq[0].length, 'end': bodyStart + o.index + expr.length + ', nil)'.length, 'text': expr + ' == nil' });
        } else {
            ok = /^\t+ch <- (?:ccxt\.)?AsyncResult\[any\]\{Value: $/.test (lead) && /^\}\s*$/.test (after);
        }
    }
    const list = [ ...types ];
    if (!ok || (decls !== 1) || (list.length !== 1) || !goChan3Nilable (list[0])) {
        memo.set ('#endpoint:' + expr, { 'reason': 'local-untyped', 'edits': [] });
        return undefined;
    }
    if (declAt >= 0) {
        edits.push ({ 'start': bodyStart + declAt, 'end': bodyStart + declAt + 3, 'text': list[0] });
    }
    memo.set ('#endpoint:' + expr, { 'type': list[0], edits });
    return { 'type': list[0], edits };
}

function goChan3EndpointSendSelfTest (ok: (c: boolean, m: string) => void, run: (src: string) => string, throws: (src: string) => boolean, core: (recv: string, body: string) => string) {
    goChan3SetReceiverStubsForTest (new Map ([ [ 'X.PostE', 'E:map[string]any' ], [ 'X.PostA', 'A:map[string]any' ], [ 'X.PostL', 'E:[]any' ] ]));
    const recv = (r: string, s: string) => '\tr' + r + ' := <-this.' + s + '(a)\n\tif r' + r + '.Err != nil {\n\t\tpanic(r' + r + '.Err)\n\t}\n';
    const d = run ('package ccxt\n' + core ('X', recv ('1', 'PostE') + '\tch <- AsyncResult[any]{Value: r1.Raw}\n\treturn nil\n'));
    ok (d.includes ('ch <- AsyncResult[map[string]any]{Value: r1.Value}'), 'endpoint direct Raw send: ' + d);
    ok (run (d) === d, 'endpoint direct idempotent');
    const a = run ('package ccxt\n' + core ('X', recv ('1', 'PostA') + '\tch <- AsyncResult[any]{Value: r1.Value}\n\treturn nil\n'));
    ok (a.includes ('ch <- AsyncResult[map[string]any]{Value: MapTyped(r1.Value)}'), 'documented object stub: ' + a);
    ok (run (a) === a, 'documented object idempotent');
    const sd = run ('package ccxt\n' + core ('X', recv ('1', 'PostE') + '\tresponse := r1.Raw\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n'));
    ok (sd.includes ('\tresponse := r1.Value\n') && sd.includes ('ch <- AsyncResult[map[string]any]{Value: response}'), 'short-declared endpoint local: ' + sd);
    ok (run (sd) === sd, 'short-declared idempotent');
    const mix = run ('package ccxt\n' + core ('X', '\tvar response any = nil\n\tif a == nil {\n' + recv ('1', 'PostA').replace (/\n\t/g, '\n\t\t').replace (/^\t/, '\t\t') + '\t\tresponse = r1.Value\n\t} else {\n' + recv ('2', 'PostE').replace (/\n\t/g, '\n\t\t').replace (/^\t/, '\t\t') + '\t\tresponse = r2.Raw\n\t}\n\tif IsEqual(response, nil) {\n\t\tpanic(\"x\")\n\t}\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n'));
    ok (mix.includes ('\tvar response map[string]any = nil\n') && mix.includes ('response = MapTyped(r1.Value)\n') && mix.includes ('response = r2.Value\n') && mix.includes ('if response == nil {') && mix.includes ('ch <- AsyncResult[map[string]any]{Value: response}'), 'mixed-stub endpoint join: ' + mix);
    ok (run (mix) === mix, 'mixed-stub idempotent');
    ok (throws ('package ccxt\n' + core ('X', recv ('1', 'PostL') + '\tch <- AsyncResult[any]{Value: r1.Raw}\n\treturn nil\n')), 'list stub into map core throws');
    ok (throws ('package ccxt\n' + core ('X', recv ('1', 'PostA') + '\tch <- AsyncResult[any]{Value: r1.Raw}\n\treturn nil\n')), 'Raw of untyped stub throws');
    ok (throws ('package ccxt\n' + core ('X', recv ('1', 'PostUnknown') + '\tch <- AsyncResult[any]{Value: r1.Raw}\n\treturn nil\n')), 'unknown stub throws');
    ok (throws ('package ccxt\n' + core ('Y', recv ('1', 'PostE') + '\tch <- AsyncResult[any]{Value: r1.Raw}\n\treturn nil\n')), 'other receiver stub throws');
    ok (throws ('package ccxt\n' + core ('X', recv ('1', 'PostE') + '\tresponse := r1.Raw\n\tthis.Use(response)\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n')), 'endpoint local other use throws');
    goChan3SetReceiverStubsForTest (undefined);
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
        } else if (goChan3Lookup (table, m[1], m[2]) !== undefined) {
            throw new Error ('GOCHAN3: ' + m[1] + '.' + m[2] + 'Async is not a generated trampoline');
        }
    }
    const tramp = new RegExp ('^func \\(this \\*(\\w+)\\) (\\w+)Async\\(([^\\n]*)\\) <-chan ' + any + ' \\{\\n\\tch := make\\(chan ' + any + ', 1\\)\\n\\tgo this\\.(\\w+)\\(ch(?:, [^\\n]*)?\\)\\n\\treturn ch\\n\\}\\n', 'gm');
    for (let m = tramp.exec (masked); m !== null; m = tramp.exec (masked)) {
        const [ whole, receiver, method, , bodyName ] = m;
        const rawWant = goChan3LookupRaw (table, receiver, method);
        const want = (rawWant === undefined) ? undefined : goChan3BaseType (rawWant);
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
        const freshTaken = new Set<string> ();
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
                    const fwd = goChan3ReceiveMethod (fnMasked, at, table, receiver);
                    const ft = (fwd === undefined) ? undefined : goChan3Lookup (table, receiver, fwd);
                    const lineEnd = goChanExprEnd (fnMasked, at);
                    if ((ft === undefined) && goChan3ResolvedOk (want, method, receiver)) {
                        const rn = goChan3FreshName (fnText, freshTaken);
                        const ind = fnMasked.substring (fnMasked.lastIndexOf ('\n', u.index) + 1, u.index);
                        const stmts = goChan3ResolvedStmts (ind, rn + '.Value', want as string, q, goChan3ResolvedName (fnText, freshTaken));
                        edits.push ({ 'start': bodyStart + u.index, 'end': bodyStart + lineEnd, 'text': rn + ' := ' + fnText.substring (at, lineEnd) + '\n' + ind + 'if ' + rn + '.Err != nil {\n' + ind + '\tpanic(' + rn + '.Err)\n' + ind + '}\n' + ind + stmts });
                        types.add (want as string);
                        continue;
                    }
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
                const ep = goChan3EndpointSend (expr, receiver, fnMasked, bodyStart, open, close, q, joins);
                if (ep !== undefined) {
                    edits.push (...ep.edits);
                    type = ep.type;
                } else if (fwdVal !== null) {
                    const bind = new RegExp ('\\n\\t*' + fwdVal[1] + ' := (<-)').exec (fnMasked);
                    const fm = (bind === null) ? undefined : goChan3ReceiveMethod (fnMasked, bind.index + bind[0].length - 2, table, receiver);
                    type = (fm === undefined) ? undefined : goChan3Lookup (table, receiver, fm);
                    const ws = (type === undefined) ? goChan3WsSend (expr, fnMasked, want, q) : undefined;
                    if (ws !== undefined) {
                        edits.push ({ 'start': bodyStart + open + 1, 'end': bodyStart + close - 1, 'text': 'Value: ' + ws });
                        type = want as string;
                    }
                    if ((type === undefined) && (fm === undefined) && (bind !== null) && goChan3ResolvedOk (want, method, receiver) && /^\s*$/.test (fnMasked.substring (close, fnMasked.indexOf ('\n', close)))) {
                        const ind = fnMasked.substring (fnMasked.lastIndexOf ('\n', u.index) + 1, u.index);
                        edits.push ({ 'start': bodyStart + u.index, 'end': bodyStart + close, 'text': goChan3ResolvedStmts (ind, expr, want as string, q, goChan3ResolvedName (fnText, freshTaken)) });
                        types.add (want as string);
                        continue;
                    }
                    if (type === undefined) {
                        const name = (bind === null) ? '?' : ((/^<-\s*[\w.()]*?\.?(\w+)\(/.exec (fnMasked.substring (bind.index + bind[0].length - 2, bind.index + bind[0].length + 200)) || [ '', '?' ])[1]);
                        fail ('forward-untabled:' + name);
                        continue;
                    }
                } else if (expr.startsWith ('<-') && goChan3ResolvedOk (want, method, receiver) && /^\s*$/.test (fnMasked.substring (close, fnMasked.indexOf ('\n', close)))) {
                    const rn = goChan3FreshName (fnText, freshTaken);
                    const ind = fnMasked.substring (fnMasked.lastIndexOf ('\n', u.index) + 1, u.index);
                    const stmts = goChan3ResolvedStmts (ind, rn + '.Value', want as string, q, goChan3ResolvedName (fnText, freshTaken));
                    edits.push ({ 'start': bodyStart + u.index, 'end': bodyStart + close, 'text': rn + ' := ' + expr + '\n' + ind + 'if ' + rn + '.Err != nil {\n' + ind + '\tpanic(' + rn + '.Err)\n' + ind + '}\n' + ind + stmts });
                    types.add (want as string);
                    continue;
                } else if (goChan3EndpointRawType (expr, fnMasked) !== undefined) {
                    // `rN.Raw` of a single typed endpoint / carrier receive: send its typed view (same as the local join)
                    type = goChan3EndpointRawType (expr, fnMasked) as string;
                    edits.push ({ 'start': bodyStart + open + 1 + 7 + expr.length - 3, 'end': bodyStart + open + 1 + 7 + expr.length, 'text': 'Value' });
                } else {
                    let proof: { type?: string, nil?: boolean, reason?: string } = goChanSendType (expr.replace (/^ccxt\./, ''), fnMasked, signature, (name) => goChanMethodReturn (masked, receiver, name));
                    // `this.SafeDict(..)` under a map carrier: its typed twin SafeDictMap (exchange_safe.go) is the same read as a map (absent -> nil map)
                    const safeDict = /^this\.SafeDict(2|N)?\(/.exec (expr);
                    if ((proof.reason !== undefined) && (want === 'map[string]any') && (safeDict !== null) && (goChanClose (expr, safeDict[0].length - 1) === expr.length)) {
                        const nameAt = open + 1 + 'Value: this.'.length;
                        edits.push ({ 'start': bodyStart + nameAt, 'end': bodyStart + nameAt + safeDict[0].length - 'this.('.length, 'text': 'SafeDict' + (safeDict[1] || '') + 'Map' });
                        proof = { 'type': want };
                    }
                    // `this.Events` / `this.Outcomes` (prediction cache fields, declared any; every write is a map literal, a typed map local or nil)
                    // under a map carrier: MapTyped is the identity on a map and maps nil to a nil map
                    if ((proof.reason !== undefined) && (want === 'map[string]any') && /^this\.(?:Events|Outcomes)$/.test (expr)) { // W19
                        edits.push ({ 'start': bodyStart + open + 1, 'end': bodyStart + close - 1, 'text': 'Value: ' + q + 'MapTyped(' + expr + ')' }); // W19
                        proof = { 'type': want }; // W19
                    } // W19
                    if ((proof.reason !== undefined) && /^local-/.test (proof.reason)) {
                        let join = joins.get (expr);
                        if (join === undefined) {
                            join = goChan3LocalJoin (expr, fnMasked, bodyStart, table, receiver);
                            joins.set (expr, join);
                            edits.push (...join.edits);
                        }
                        proof = (join.type !== undefined) ? { 'type': join.type } : { 'reason': join.reason || proof.reason };
                    }
                    const bal = ((proof.reason !== undefined) && (want === 'map[string]any')) ? goChan3BalanceSend (expr, fnMasked, (name) => goChanMethodReturn (masked, receiver, name)) : undefined;
                    if (bal !== undefined) {
                        if (bal.decl !== undefined) {
                            const d = bal.decl;
                            if (!edits.some ((e) => (e.start === bodyStart + d.start))) {
                                edits.push ({ 'start': bodyStart + d.start, 'end': bodyStart + d.end, 'text': 'map[string]any' });
                            }
                        }
                        if (bal.value !== expr) {
                            edits.push ({ 'start': bodyStart + open + 1, 'end': bodyStart + close - 1, 'text': 'Value: ' + bal.value });
                        }
                        proof = { 'type': 'map[string]any' };
                    }
                    const ws = (proof.reason !== undefined) ? goChan3WsSend (expr, fnMasked, want, q) : undefined;
                    if (ws !== undefined) {
                        if (ws !== expr) {
                            edits.push ({ 'start': bodyStart + open + 1, 'end': bodyStart + close - 1, 'text': 'Value: ' + ws });
                        }
                        type = want as string;
                    } else if (proof.nil) {
                        type = 'nil';
                        if ((want !== undefined) && !goChan3Nilable (want)) {
                            edits.push ({ 'start': bodyStart + open + 1, 'end': bodyStart + close - 1, 'text': '' });
                        }
                    } else if ((proof.reason !== undefined) && goChan3ResolvedOk (want, method, receiver) && /^\s*$/.test (fnMasked.substring (close, fnMasked.indexOf ('\n', close)))) {
                        const ind = fnMasked.substring (fnMasked.lastIndexOf ('\n', u.index) + 1, u.index);
                        edits.push ({ 'start': bodyStart + u.index, 'end': bodyStart + close, 'text': goChan3ResolvedStmts (ind, fnText.substring (open + 1 + 7, close - 1), want as string, q, goChan3ResolvedName (fnText, freshTaken)) });
                        types.add (want as string);
                        continue;
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
                if ((t === 'nil') ? !goChan3AllowsNil (rawWant as string) : (t !== want)) {
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
    const names = [ ...new Set ([ ...table.keys () ].map ((k) => k.replace (/^\w+\./, ''))) ];
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
        const encRecv = goChan3EnclosingReceiver (masked, m.index);
        const looked = goChan3Lookup (table, encRecv, m[1]);
        if (looked === undefined) {
            continue;
        }
        const type = looked;
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
            // PanicOnError((<-X)) / promiseAll element / handed-on channel: left typed for the runtime's untyped accessor
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
            // a struct channel read already boxed or converted by goChan3StructPass (replay): idempotent
            if (/(?:^|[^\w.])(?:ccxt\.)?(?:Struct(?:Box|ResultMap|Absent)|\w+From(?:Map|List)|ToString|ToFloat64|ParseInt)\($/.test (before)) {
                continue;
            }
            // W28: a list-of-struct read already boxed / a same-T []T send, emitted by goChan3StructListPass (replay)
            if (goChan3ListBoxed (before) || goChan3ListSendBefore (before)) {
                continue;
            }
            // W29: a typed map-of-struct wrapper read (`Tickers{Tickers: r.Value}`) emitted by goChan3StructPass (replay)
            const typedDict = /(?:^|[^\w.])(?:ccxt\.)?(\w+)\{(\w+): $/.exec (before);
            if ((typedDict !== null) && (after[0] === '}') && Object.values (GO_CHAN3_STRUCT_MAPS).includes (typedDict[1]) && ((GO_CHAN3_STRUCT_MAP_FIELDS[typedDict[1]] ?? typedDict[1]) === typedDict[2])) {
                continue;
            }
            // native absent fold or comma-ok nil check already emitted: idempotent
            if ((nilable && /^\s*(?:,\s*\w+\.Value\s*)?[!=]= nil\b/.test (after)) || goChan3AbsentGuarded (masked, ls, name + '.Value')) {
                continue;
            }
            const assert = /^\.\(([^()]+)\)/.exec (after);
            // ws2 type switch over an already boxed typed value (replay): idempotent
            if (/\bswitch \w+ := any\($/.test (before) && /^\)\.\(type\)/.test (after)) {
                continue;
            }
            if (assert !== null) {
                // ws2 type switch already emitted over an untyped forward (`switch xBox := r.Value.(type)`): box the now-typed value
                if ((assert[1] === 'type') && /\bswitch \w+ := $/.test (before)) {
                    edits.push ({ 'start': at, 'end': end, 'text': 'any(' + name + '.Value)' });
                    continue;
                }
                if ((type === '*string') && (assert[1] === 'string')) {
                    edits.push ({ 'start': at, 'end': end + assert[0].length, 'text': q + 'ToString(' + name + '.Value)' });
                    continue;
                }
                if (((type === '*int64') || (type === '*float64')) && (assert[1] === 'float64')) {
                    edits.push ({ 'start': at, 'end': end + assert[0].length, 'text': q + 'ToFloat64(' + name + '.Value)' });
                    continue;
                }
                if ((type === '*int64') && (assert[1] === 'int64')) {
                    edits.push ({ 'start': at, 'end': end + assert[0].length, 'text': q + 'ParseInt(' + name + '.Value)' });
                    continue;
                }
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
                // x only forwarded by a same-T core send (`ch <- AsyncResult[T]{Value: x}`): keep it typed
                const uses = rest.match (new RegExp ('(?<![\\w.])' + x + '(?![\\w.])', 'g')) || [];
                const sends = rest.match (new RegExp ('\\n\\t+ch <- (?:ccxt\\.)?AsyncResult\\[[^\\n]*\\]\\{Value: (?:[\\w.]+From(?:Map|List)\\()?' + x + '\\)?\\}', 'g')) || [];
                if (!rebound && !closure && !nilCmp && uses.length && (uses.length === sends.length) && (coreSendAt (at) === type)) {
                    continue;
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
            const send = /^\t+(\w+) <- (?:ccxt\.)?AsyncResult\[(.+)\]\{Value: $/.exec (before);
            if ((send !== null) && goChan3IsStructType (send[2])) {
                continue;   // a struct core's same-T send (replay)
            }
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

// ===== GO-CHAN3 STRUCT: unified-struct channels (`AsyncResult[map[string]any]` -> `AsyncResult[T]`) =====
// A table value naming a map-backed unified struct of build/go-struct-returns.ts (Order, Ticker, Trade) is
// proven by the passes above on its map shadow (`map[string]any`: at this point Parse*/Safe* still read as
// the boxed map), then goChan3StructPass moves the shadow to T:
//   cores      trampoline/body head/sends retyped; a sent map E becomes `TFromMap(E)` (go-struct-returns
//              drops `TFromMap(this.ParseT(..))` to the struct call), nil becomes the zero T, a same-T
//              receive is sent as is, a map forward is received and converted
//   consumers  `NewT(r.Value)` / `r.Value.(T)` read the struct; every other read (MapTyped, map assertion,
//              any handoff, forward into a map/any core, native nil folds) boxes with `TToMap(r.Value)`
//   interfaces `\tMAsync(..) <-chan AsyncResult[map[string]any]` -> T, except IPrediction* blocks
// Prediction venues (package ccxtprediction, PredictionExchange) keep the map shadow: their orders/tickers
// are Prediction* shapes, not T. Same table-driven shape for every struct family (one block, merge point).
export const GO_CHAN3_EXTRA_STRUCTS: string[] = [
    'ADL', 'CrossBorrowRate', 'IsolatedBorrowRate', 'LastPrice', 'LongShortRatio',
    'MarginModification', 'Liquidation', 'BorrowInterest', 'FundingHistory',
    'FundingRateHistory', 'LeverageTier', 'Status', 'PositionModeInfo',
    'DepositWithdrawFee', 'Account', 'OrderBook', 'OrderBookL3',
    'MarginLoan', 'Balance', 'Balances', 'LeverageTiers',
    'MarketInterface', 'Currency', 'Currencies',
    'PredictionTicker', 'PredictionOrder', 'PredictionTrade', 'PredictionPosition',
    'PredictionOrderBook', 'PredictionTradingFee', 'PredictionOpenInterest',
    'PredictionEvent', 'PredictionSettlement', 'PredictionOutcome',
];

export const GO_CHAN3_SHARED_PRED_STRUCTS = new Set<string> ([
    'Account', 'Balance', 'Balances', 'LeverageTiers', 'LeverageTier', 'MarginLoan',
    'MarketInterface', 'Currency', 'Currencies', 'PredictionEvent', 'PredictionOutcome',
]);

function goChan3IsPredOnlyStruct (t: string): boolean {
    return /^(?:map\[string\]|\[\])?Prediction/.test (t);
}

export function goChan3StructTypes (): Set<string> {
    const base = [ ...new Set ([ ...Object.keys (GO_STRUCT_RETURN_TYPES).filter ((t) => GO_STRUCT_RETURN_TYPES[t].to === undefined), ...GO_CHAN3_EXTRA_STRUCTS ]) ];
    // W29 map-of-struct channels: `map[string]T` (a string-keyed dict of T, e.g. fetchTickers) rides the same pass
    return new Set ([ ...base, ...base.filter ((t) => GO_CHAN3_STRUCT_MAPS[t] !== undefined).map ((t) => 'map[string]' + t), 'map[string]map[string][]OHLCV' ]);
}

// W29: struct element -> the typed wrapper container of its string-keyed dict (`Tickers{Tickers: map[string]Ticker}`)
export const GO_CHAN3_STRUCT_MAPS: Record<string, string> = {
    'Ticker': 'Tickers', 'FundingRate': 'FundingRates', 'OpenInterest': 'OpenInterests',
    'TradingFeeInterface': 'TradingFees', 'Leverage': 'Leverages', 'MarginMode': 'MarginModes',
    'IsolatedBorrowRate': 'IsolatedBorrowRates', 'LastPrice': 'LastPrices',
    'DepositWithdrawFee': 'DepositWithdrawFees', 'DepositAddress': 'DepositAddresses',
    'CrossBorrowRate': 'CrossBorrowRates', 'OrderBook': 'OrderBooks',
    'Greeks': 'AllGreeks', 'Option': 'OptionChain',
    'PredictionTicker': 'PredictionTickers',
    'PredictionOutcome': 'PredictionOutcomes', 'PredictionEvent': 'PredictionEvents',
};

export const GO_CHAN3_STRUCT_MAP_FIELDS: Record<string, string> = {
    'AllGreeks': 'Greeks', 'OptionChain': 'Chains', 'PredictionTickers': 'Tickers',
};

// W29: `map[string]T` -> T (undefined for a single struct)
function goChan3StructMapElem (t: string): string | undefined {
    const m = /^map\[string\](?:ccxt\.)?(\w+)$/.exec (t);
    return (m === null) ? undefined : m[1];
}

// W29: a struct channel type as written in a file with qualifier q (`map[string]ccxt.Ticker`, `ccxt.Order`)
function goChan3StructQual (t: string, q: string): string {
    if (t === 'map[string]map[string][]OHLCV') {
        return 'map[string]map[string][]' + q + 'OHLCV';
    }
    const e = goChan3StructMapElem (t);
    return (e === undefined) ? (q + t) : ('map[string]' + q + e);
}

// W29: the from/to helper base name of a struct channel type (`TickerMap` for map[string]Ticker)
function goChan3StructHelper (t: string): string {
    if (t === 'map[string]map[string][]OHLCV') {
        return 'OHLCVForSymbolsMap';
    }
    const e = goChan3StructMapElem (t);
    return (e === undefined) ? t : (e + 'Map');
}

// W29: is t (optionally ccxt.-qualified) a struct channel type
function goChan3IsStructType (t: string): boolean {
    return goChan3StructTypes ().has (t.replace (/^ccxt\./, '').replace (/^map\[string\]ccxt\./, 'map[string]').replace (/^map\[string\]map\[string\]\[\]ccxt\./, 'map[string]map[string][]'));
}

function goChan3Escape (s: string): string {
    return s.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// method -> struct T of the tabled struct channels
export function goChan3StructEntries (table: Map<string, string>, predScope = false): Map<string, string> {
    const structs = goChan3StructTypes ();
    if (!predScope) {
        return new Map ([ ...table ].filter (([ m, t ]) => !m.startsWith ('Prediction.') && structs.has (t) && (!goChan3IsPredOnlyStruct (t) || GO_CHAN3_SHARED_PRED_STRUCTS.has (goChan3StructMapElem (t) ?? t))));
    }
    const out = new Map<string, string> ();
    for (const [ m, t ] of table) {
        if (!structs.has (t)) {
            continue;
        }
        if (!m.startsWith ('Prediction.') && (goChan3IsPredOnlyStruct (t) || GO_CHAN3_SHARED_PRED_STRUCTS.has (goChan3StructMapElem (t) ?? t))) {
            out.set (m, t);
        }
    }
    for (const [ m, t ] of table) {
        if (m.startsWith ('Prediction.') && structs.has (t)) {
            out.set (m.slice (11), t);
        }
    }
    return out;
}

// the table the proofs run on: struct channels as their map shadow (list-of-struct channels as []any, W28)
export function goChan3Shadow (table: Map<string, string>): Map<string, string> {
    const structs = goChan3StructTypes ();
    return new Map ([ ...table ].map (([ m, t ]) => [ m, structs.has (t) ? 'map[string]any' : ((goChan3ListElem (t) !== undefined) ? '[]any' : t) ]));
}

// `at` sits in prediction code: a ccxtprediction file or a PredictionExchange method
function goChan3PredictionScope (masked: string, at: number): boolean {
    if (/^package ccxtprediction\s*$/m.test (masked.substring (0, 200))) {
        return true;
    }
    const [ fs0 ] = goChan3Func (masked, at);
    return /^func \(this \*PredictionExchange\)/.test (masked.substring (fs0, fs0 + 40));
}

// element type of the core body enclosing `at` (undefined outside a core body)
function goChan3CoreTypeAt (masked: string, at: number): string | undefined {
    const [ fs0 ] = goChan3Func (masked, at);
    const head = masked.substring (fs0, masked.indexOf ('\n', fs0));
    const m = /^func \(this \*\w+\) \w+\(ch chan (?:ccxt\.)?AsyncResult\[(.+?)\](?:,|\))/.exec (head);
    return (m === null) ? undefined : m[1];
}

// the struct method a `rN` read in the function holding `at` was received from (last bind before `at`)
function goChan3StructBind (masked: string, at: number, name: string, structs: Map<string, string>): string | undefined {
    const [ fs0 ] = goChan3Func (masked, at);
    const binds = [ ...masked.substring (fs0, at).matchAll (new RegExp ('\\n\\t+' + name + ' := <-[\\w.]+(?:\\.\\((?:ccxt\\.)?I\\w+\\))?\\.(\\w+)Async\\(', 'g')) ];
    if (!binds.length) {
        return undefined;
    }
    const bm = binds[binds.length - 1][1];
    const enc = goChan3EnclosingReceiver (masked, at);
    return ((enc !== undefined) ? structs.get (enc + '.' + bm) : undefined) ?? structs.get (bm);
}

export function goChan3StructPass (content: string, table: Map<string, string>): string {
    const predictionFile = /^package ccxtprediction\s*$/m.test (content);
    const regStructs = goChan3StructEntries (table, false);
    const predStructs = goChan3StructEntries (table, true);
    const names = [ ...new Set ((predictionFile ? [ ...predStructs.keys () ] : [ ...regStructs.keys (), ...predStructs.keys () ]).map ((k) => k.replace (/^\w+\./, ''))) ];
    if (!names.length || !names.some ((n) => content.includes (n + 'Async('))) {
        return content;
    }
    const q = goChanQual (content);
    const alt = names.join ('|');
    const masked = goChanMask (content);
    const edits: Edit[] = [];
    const taken = new Map<number, Set<string>> ();
    const fresh = (at: number) => {
        const [ fs0, fe0 ] = goChan3Func (masked, at);
        const t = taken.get (fs0) || new Set<string> ();
        taken.set (fs0, t);
        return goChan3FreshName (content.substring (fs0, fe0), t);
    };
    // interface lines
    const iface = new RegExp ('^(\\t(' + alt + ')Async\\([^\\n]*\\)) <-chan ((?:ccxt\\.)?)AsyncResult\\[map\\[string\\]any\\]$', 'gm');
    for (let m = iface.exec (masked); m !== null; m = iface.exec (masked)) {
        const owner = /\ntype (\w+) interface \{\n[^}]*$/.exec (masked.substring (0, m.index));
        const isPredIface = (owner !== null) && /^IPrediction/.test (owner[1]);
        const st = (isPredIface ? predStructs : regStructs).get (m[2]);
        if (st === undefined) {
            continue;
        }
        edits.push ({ 'start': m.index, 'end': m.index + m[0].length, 'text': m[1] + ' <-chan ' + m[3] + 'AsyncResult[' + goChan3StructQual (st, m[3]) + ']' });
    }
    // cores
    const coreBodies: [ number, number, string ][] = [];
    const tramp = new RegExp ('^func \\(this \\*(\\w+)\\) (' + alt + ')Async\\([^\\n]*\\) <-chan (?:ccxt\\.)?AsyncResult\\[map\\[string\\]any\\] \\{\\n\\tch := make\\(chan (?:ccxt\\.)?AsyncResult\\[map\\[string\\]any\\], 1\\)\\n\\tgo this\\.(\\w+)\\(ch(?:, [^\\n]*)?\\)\\n\\treturn ch\\n\\}\\n', 'gm');
    for (let m = tramp.exec (masked); m !== null; m = tramp.exec (masked)) {
        const [ whole, receiver, method, bodyName ] = m;
        const coreStructs = (predictionFile || (receiver === 'PredictionExchange')) ? predStructs : regStructs;
        const st = coreStructs.get (receiver + '.' + method) ?? coreStructs.get (method);
        if (st === undefined) {
            continue;
        }
        const T = goChan3StructQual (st, q);
        const H = q + goChan3StructHelper (st);
        const carrier = q + 'AsyncResult[' + T + ']';
        const mapCarrier = /(?:ccxt\.)?AsyncResult\[map\[string\]any\]/g;
        edits.push ({ 'start': m.index, 'end': m.index + whole.length, 'text': content.substring (m.index, m.index + whole.length).replace (mapCarrier, carrier) });
        const head = '\nfunc (this *' + receiver + ') ' + bodyName + '(ch chan ' + q + 'AsyncResult[map[string]any]';
        const headAt = masked.indexOf (head);
        if ((headAt < 0) || (masked.indexOf (head, headAt + 1) >= 0)) {
            throw new Error ('GOCHAN3: struct core ' + receiver + '.' + method + 'Async has no single body');
        }
        const bodyStart = headAt + 1;
        const bodyEnd = masked.indexOf ('\n}\n', bodyStart) + 3;
        coreBodies.push ([ bodyStart, bodyEnd, st ]);
        const headEnd = masked.indexOf ('\n', bodyStart);
        edits.push ({ 'start': bodyStart, 'end': headEnd, 'text': content.substring (bodyStart, headEnd).replace (q + 'AsyncResult[map[string]any]', carrier) });
        const fn = masked.substring (bodyStart, bodyEnd);
        const send = /\n(\t+)ch <- /g;
        for (let s = send.exec (fn); s !== null; s = send.exec (fn)) {
            const at = bodyStart + s.index + s[0].length;
            const ind = s[1];
            if (masked.startsWith ('<-', at)) {
                const fm = goChan3ReceiveMethod (masked, at, table);
                const ft = (fm === undefined) ? undefined : (coreStructs.get (receiver + '.' + fm) ?? coreStructs.get (fm) ?? goChan3Lookup (table, receiver, fm));
                if (ft === st) {
                    continue;
                }
                if (ft !== 'map[string]any') {
                    throw new Error ('GOCHAN3: ' + receiver + '.' + method + 'Async forwards ' + (fm || '?') + ' (' + (ft || 'untabled') + ') into AsyncResult[' + T + ']');
                }
                const end = goChanExprEnd (masked, at);
                const rn = fresh (at);
                edits.push ({ 'start': bodyStart + s.index + 1 + ind.length, 'end': end, 'text': rn + ' := ' + content.substring (at, end) + '\n' + ind + 'ch <- ' + carrier + '{Value: ' + H + 'FromMap(' + rn + '.Value), Err: ' + rn + '.Err}' });
                continue;
            }
            const lit = /^(?:ccxt\.)?AsyncResult\[map\[string\]any\]\{/.exec (masked.substring (at, at + 40));
            if (lit === null) {
                throw new Error ('GOCHAN3: struct core ' + receiver + '.' + method + 'Async has an unshaped send');
            }
            const open = at + lit[0].length - 1;
            const close = goChanClose (masked, open);
            const inner = content.substring (open + 1, close - 1);
            let text = inner;
            const v = /^Value: ([\s\S]*?)((?:, Err: [\w.]+)?)$/.exec (inner);
            if (v !== null) {
                const e = v[1];
                const recv = /^(\w+)\.Value$/.exec (e);
                const boxed = new RegExp ('^(?:ccxt\\.)?' + goChan3StructHelper (st) + 'ToMap\\(([\\s\\S]*)\\)$').exec (e);
                if (e === 'nil') {
                    text = v[2].replace (/^, /, '');
                } else if ((recv !== null) && (goChan3StructBind (masked, at, recv[1], coreStructs) === st)) {
                    text = inner;
                } else if ((boxed !== null) && (goChanClose (e, e.indexOf ('(')) === e.length)) {
                    text = 'Value: ' + boxed[1] + v[2];
                } else {
                    text = 'Value: ' + H + 'FromMap(' + e + ')' + v[2];
                }
            }
            edits.push ({ 'start': at, 'end': close, 'text': carrier + '{' + text + '}' });
        }
    }
    const inStructCore = (at: number) => coreBodies.find (([ s, e ]) => (at >= s) && (at < e));
    // PromiseAllTyped of same-T struct channels (shadow `PromiseAllTyped[map[string]any, AsyncResult[map[string]any]](..)`)
    const promiseArgs: [ number, number ][] = [];
    const pall = /(?<![\w.])((?:ccxt\.)?PromiseAllTyped)\[map\[string\]any, ((?:ccxt\.)?)AsyncResult\[map\[string\]any\]\]\(/g;
    for (let m = pall.exec (masked); m !== null; m = pall.exec (masked)) {
        const open = m.index + m[0].length - 1;
        const close = goChanClose (masked, open);
        const args = masked.substring (open + 1, close - 1);
        const [ fs0 ] = goChan3Func (masked, m.index);
        const fnPre = masked.substring (fs0, m.index);
        const pallStructs = (predictionFile || goChan3PredictionScope (masked, m.index)) ? predStructs : regStructs;
        const encRecv = goChan3EnclosingReceiver (masked, m.index);
        const callRe = new RegExp ('(?<![\\w.])(?:this|this\\.DerivedExchange|this\\.Exchange|this\\.BaseExchange)(?:\\.\\((?:ccxt\\.)?I\\w+\\))?\\.(\\w+)Async\\(', 'g');
        const mnames = [ ...args.matchAll (callRe) ].map ((c) => c[1]);
        for (const id of args.split (',').map ((s) => s.trim ()).filter ((s) => /^\w+$/.test (s))) {
            const dm = new RegExp ('\\n\\t+' + id + ' := (?:this|this\\.DerivedExchange|this\\.Exchange|this\\.BaseExchange)(?:\\.\\((?:ccxt\\.)?I\\w+\\))?\\.(\\w+)Async\\(').exec (fnPre);
            if (dm !== null) {
                mnames.push (dm[1]);
            }
        }
        const lookupPall = (mname: string) => ((encRecv !== undefined) ? pallStructs.get (encRecv + '.' + mname) : undefined) ?? pallStructs.get (mname);
        const ts = new Set (mnames.map ((mname) => lookupPall (mname)));
        if (!mnames.some ((mname) => lookupPall (mname) !== undefined)) {
            continue;
        }
        if ((ts.size !== 1) || ts.has (undefined)) {
            throw new Error ('GOCHAN3: PromiseAllTyped mixes struct channels: ' + args.substring (0, 120));
        }
        const st = [ ...ts ][0] as string;
        const QT = goChan3StructQual (st, q);
        const QH = q + goChan3StructHelper (st);
        promiseArgs.push ([ open, close ]);
        edits.push ({ 'start': m.index, 'end': open, 'text': m[1] + '[' + QT + ', ' + m[2] + 'AsyncResult[' + QT + ']]' });
        const tail = /^\n(\t+)if (r\d*)\.Err != nil \{\n\t+panic\(\2\.Err\)\n\t+\}\n\t+var \w+ \[\]map\[string\]any = (\2\.Value)\n/.exec (masked.substring (close, close + 400));
        const lineStart = masked.lastIndexOf ('\n', m.index) + 1;
        const bind = /^\t+(r\d*) := <-$/.exec (masked.substring (lineStart, m.index));
        if ((tail === null) || (bind === null) || (bind[1] !== tail[2])) {
            throw new Error ('GOCHAN3: unshaped PromiseAllTyped read of struct channels');
        }
        const valueAt = close + tail[0].length - 1 - tail[3].length;
        edits.push ({ 'start': valueAt, 'end': valueAt + tail[3].length, 'text': q + 'StructSliceToMaps(' + tail[3] + ', ' + QH + 'ToMap)' });
    }
    // consumers
    const call = new RegExp ('\\.(' + alt + ')Async\\(', 'g');
    for (let m = call.exec (masked); m !== null; m = call.exec (masked)) {
        const ls = masked.lastIndexOf ('\n', m.index) + 1;
        const line = masked.substring (ls, masked.indexOf ('\n', m.index));
        if (/^func /.test (line) || /^\t\w+Async\(/.test (line) || promiseArgs.some (([ s, e ]) => (m.index > s) && (m.index < e))) {
            continue;
        }
        const r = goChan3Receiver (masked, m.index) as { recv: string, start: number };
        if (!GO_CHAN3_RECEIVERS.test (r.recv)) {
            throw new Error ('GOCHAN3: unknown receiver ' + r.recv + ' for ' + m[1] + 'Async');
        }
        const isPredCall = ((predictionFile || goChan3PredictionScope (masked, m.index)) && (r.recv !== 'this.BaseExchange')) || /IPrediction/.test (masked.substring (r.start, m.index));
        const encRecv = goChan3EnclosingReceiver (masked, m.index);
        const structMap = isPredCall ? predStructs : regStructs;
        const T = ((encRecv !== undefined) ? structMap.get (encRecv + '.' + m[1]) : undefined) ?? structMap.get (m[1]);
        if (T === undefined) {
            continue;
        }
        const QT = goChan3StructQual (T, q);
        const QH = q + goChan3StructHelper (T);
        const elem = goChan3StructMapElem (T);
        const newName = (T === 'map[string]map[string][]OHLCV') ? 'NewOHLCVForSymbolsMap' : ((elem === undefined) ? ('New' + T) : ('New' + GO_CHAN3_STRUCT_MAPS[elem]));
        const pre = masked.substring (ls, r.start);
        const callEnd = goChanClose (masked, m.index + m[0].length - 1);
        const [ , fe0 ] = goChan3Func (masked, m.index);
        const fwd = /^(\t+)ch <- <-$/.exec (pre);
        if (fwd !== null) {
            const core = inStructCore (m.index);
            if (core !== undefined) {
                continue;   // the core section above owns forwards inside struct cores
            }
            const outer = goChan3CoreTypeAt (masked, m.index);
            if ((outer === QT) || (outer === T)) {
                continue;   // same-T struct forward (replay)
            }
            if ((outer !== 'any') && (outer !== 'map[string]any')) {
                throw new Error ('GOCHAN3: forward of ' + m[1] + ' (' + T + ') into an AsyncResult[' + outer + '] core');
            }
            const rn = fresh (m.index);
            const carrier = q + 'AsyncResult[' + outer + ']';
            const val = q + ((outer === 'any') ? 'StructBox(' : 'StructResultMap(') + rn + '.Value, ' + QH + 'ToMap)';
            edits.push ({ 'start': ls, 'end': callEnd, 'text': fwd[1] + rn + ' := <-' + content.substring (r.start, callEnd) + '\n' + fwd[1] + 'ch <- ' + carrier + '{Value: ' + val + ', Err: ' + rn + '.Err}' });
            continue;
        }
        const bind = /^\t+(\w+) := <-$/.exec (pre);
        if (bind === null) {
            if (/^\t+\w+ := $/.test (pre)) {
                continue;   // local promise variable passed to PromiseAllTyped
            }
            throw new Error ('GOCHAN3: unbound receive of struct channel ' + m[1] + 'Async: ' + line.trim ());
        }
        const name = bind[1];
        const scope = masked.substring (callEnd, fe0);
        const rebind = new RegExp ('\\n\\t+' + name + ' := ').exec (scope);
        const limit = callEnd + ((rebind === null) ? scope.length : rebind.index);
        const use = new RegExp ('(?<![\\w.])' + name + '\\.Value\\b', 'g');
        use.lastIndex = callEnd;
        for (let u = use.exec (masked); (u !== null) && (u.index < limit); u = use.exec (masked)) {
            const at = u.index;
            const end = at + u[0].length;
            const uls = masked.lastIndexOf ('\n', at) + 1;
            const before = masked.substring (uls, at);
            const after = masked.substring (end, masked.indexOf ('\n', end));
            const box = q + 'StructBox(' + u[0] + ', ' + QH + 'ToMap)';
            const asMap = q + 'StructResultMap(' + u[0] + ', ' + QH + 'ToMap)';
            if (/(?:^|[^\w.])(?:ccxt\.)?Struct(?:Box|ResultMap|Absent)\($/.test (before)) {
                continue;   // already boxed (replay)
            }
            const containerName = newName.substring (3);
            const containerField = GO_CHAN3_STRUCT_MAP_FIELDS[containerName] ?? containerName;
            if ((elem !== undefined) && before.endsWith (containerName + '{' + containerField + ': ') && (after[0] === '}')) {
                continue;   // W29 typed wrapper container (replay)
            }
            const assert = /^\.\(([^()]+)\)/.exec (after);
            if (assert !== null) {
                if ((assert[1] !== QT) && (assert[1] !== 'map[string]any')) {
                    throw new Error ('GOCHAN3: ' + name + '.Value of ' + m[1] + ' asserted to ' + assert[1] + ', table says ' + T);
                }
                edits.push ({ 'start': at, 'end': end + assert[0].length, 'text': (assert[1] === QT) ? u[0] : asMap });
                continue;
            }
            const wrap = new RegExp ('(?:^|[^\\w.])((?:ccxt\\.)?(MapTyped|BoxAbsent|' + newName + ')\\()$').exec (before);
            if ((wrap !== null) && (after[0] === ')')) {
                let text = (wrap[2] === 'MapTyped') ? asMap : box;
                if (wrap[2] === newName) {
                    // a typed wrapper: the struct itself, or (W29) the container of the typed dict
                    text = (elem === undefined) ? u[0] : (wrap[1].substring (0, wrap[1].length - wrap[2].length - 1) + containerName + '{' + containerField + ': ' + u[0] + '}');
                }
                edits.push ({ 'start': at - wrap[1].length, 'end': end + 1, 'text': text });
                continue;
            }
            if (new RegExp ('^\\t+var \\w+ ' + goChan3Escape (QT) + ' = $').test (before) && /^\s*$/.test (after)) {
                continue;
            }
            const nilCmp = /^(\s*)([!=])= nil\b/.exec (after);
            if (nilCmp !== null) {
                edits.push ({ 'start': at, 'end': end + nilCmp[0].length, 'text': ((nilCmp[2] === '!') ? '!' : '') + q + 'StructAbsent(' + u[0] + ')' });
                continue;
            }
            if (/\bnil\s*[!=]=\s*$/.test (before)) {
                throw new Error ('GOCHAN3: ' + name + '.Value of ' + m[1] + ' (' + T + ') compared with nil');
            }
            const sendIn = /^\t+ch <- (?:ccxt\.)?AsyncResult\[([^\n]*)\]\{Value: $/.exec (before);
            if (sendIn !== null) {
                const core = inStructCore (at);
                if (((core !== undefined) && (core[2] === T)) || (sendIn[1] === QT)) {
                    continue;
                }
                edits.push ({ 'start': at, 'end': end, 'text': (sendIn[1] === 'map[string]any') ? asMap : box });
                continue;
            }
            const shortMap = /^\t+(\w+) :?= $/.exec (before);
            const [ fs0 ] = goChan3Func (masked, at);
            const isMapLocal = (shortMap !== null) && (
                new RegExp ('\\n\\t+ch <- (?:ccxt\\.)?AsyncResult\\[map\\[string\\]any\\]\\{Value: ' + shortMap[1] + '\\b').test (masked.substring (end, fe0)) ||
                new RegExp ('\\n\\t+var ' + shortMap[1] + ' map\\[string\\]any\\b').test (masked.substring (fs0, at))
            );
            if (/^\t+var \w+ map\[string\]any = $/.test (before) || /(?:^|[^\w.])(?:ccxt\.)?(?:MapTyped|MapOrEmpty)\($/.test (before) || isMapLocal) {
                edits.push ({ 'start': at, 'end': end, 'text': asMap });
                continue;
            }
            edits.push ({ 'start': at, 'end': end, 'text': box });
        }
    }
    return edits.length ? goChan3Splice (content, edits) : content;
}

function goChan3Unendpoint (content: string, table: Map<string, string>): string {
    const globalKeys = [ ...table.keys () ].filter ((k) => !k.includes ('.'));
    if (globalKeys.length === 0) {
        return content;
    }
    const alt = globalKeys.join ('|');
    if (content.indexOf ('EndpointResult[') >= 0) {
        const tramp = new RegExp ('^(func \\(this \\*\\w+\\) (' + alt + ')Async\\([^\\n]*\\) <-chan ((?:ccxt\\.)?))EndpointResult\\[[^\\n]+\\] \\{\\n\\tch := make\\(chan (?:ccxt\\.)?EndpointResult\\[[^\\n]+\\], 1\\)\\n\\tgo this\\.(\\w+)\\(ch(?:, [^\\n]*)?\\)\\n\\treturn ch\\n\\}\\nfunc \\(this \\*\\w+\\) \\4\\(ch chan (?:ccxt\\.)?EndpointResult\\[[^\\n]+\\]([^\\n]*\\{\\n\\tdefer close\\(ch\\)\\n\\tdefer (?:ccxt\\.)?)ReturnPanicErrorT\\(ch\\)', 'gm');
        content = content.replace (tramp, (whole, sigPrefix, _m, q, bodyName, mid) => {
            return sigPrefix + 'AsyncResult[any] {\n\tch := make(chan ' + q + 'AsyncResult[any], 1)\n\tgo this.' + bodyName + whole.substring (whole.indexOf ('(ch'), whole.indexOf ('\n\treturn ch\n}\nfunc ')) + '\n\treturn ch\n}\nfunc ' + whole.substring (whole.indexOf ('\nfunc ') + 6, whole.indexOf ('(ch chan ')) + '(ch chan ' + q + 'AsyncResult[any]' + mid + 'ReturnPanicError(ch)';
        });
        const headRe = new RegExp ('\\nfunc \\(this \\*\\w+\\) \\w+\\(ch chan ((?:ccxt\\.)?)AsyncResult\\[any\\]', 'g');
        for (let m = headRe.exec (content); m !== null; m = headRe.exec (content)) {
            const q = m[1];
            const bs = m.index + 1;
            const be = content.indexOf ('\n}\n', bs) + 3;
            if (be < 3) continue;
            const body = content.substring (bs, be);
            if (body.indexOf ('EndpointResult[') < 0) continue;
            const next = body
                .replace (/(\t+)chValue := ([\s\S]*?)\n\1ch <- (?:ccxt\.)?EndpointResult\[[^\n]+\]\{Value: chValue, Raw: chValue\}/g, '$1ch <- ' + q + 'AsyncResult[any]{Value: $2}')
                .replace (/ch <- (?:ccxt\.)?EndpointResult\[[^\n]+\]\{Value: ([^\n]+), Raw: \1\}/g, 'ch <- ' + q + 'AsyncResult[any]{Value: $1}')
                .replace (/ch <- (?:ccxt\.)?EndpointResult\[[^\n]+\]\{\}/g, 'ch <- ' + q + 'AsyncResult[any]{Value: nil}');
            if (next !== body) {
                content = content.substring (0, bs) + next + content.substring (be);
                headRe.lastIndex = bs + next.length;
            }
        }
        const iface = new RegExp ('^(\\t(?:' + alt + ')Async\\([^\\n]*\\) <-chan ((?:ccxt\\.)?))EndpointResult\\[[^\\n]+\\]$', 'gm');
        content = content.replace (iface, '$1AsyncResult[any]');
    }
    if (content.indexOf ('EndpointRaw(') >= 0) {
        const epRaw = new RegExp ('(?<![\\w.])(?:ccxt\\.)?EndpointRaw\\(((?:this|this\\.DerivedExchange|this\\.Exchange|this\\.base)\\.(?:' + alt + ')Async\\([^()\\n]*\\))\\)', 'g');
        content = content.replace (epRaw, '$1');
    }
    const recvRe = new RegExp ('^(\\t+)(r\\d*) := <-(?:this|this\\.Exchange|this\\.DerivedExchange|this\\.base|exchange)(?:\\.\\([^()\\n]+\\))?\\.(?:' + alt + ')Async\\(', 'gm');
    for (let m = recvRe.exec (content); m !== null; m = recvRe.exec (content)) {
        const rvar = m[2];
        const fe = content.indexOf ('\n}\n', m.index);
        if (fe < 0) continue;
        const scope = content.substring (m.index + m[0].length, fe);
        const rebind = new RegExp ('\\n\\t+' + rvar + ' := ').exec (scope);
        const limit = (rebind === null) ? scope.length : rebind.index;
        const sub = scope.substring (0, limit);
        const rawRe = new RegExp ('(?<![\\w.])' + rvar + '\\.Raw\\b', 'g');
        if (rawRe.test (sub)) {
            const fixed = sub.replace (rawRe, rvar + '.Value');
            content = content.substring (0, m.index + m[0].length) + fixed + scope.substring (limit) + content.substring (fe);
        }
    }
    const listPromoteKeys = [ ...table.entries () ].filter (([ k, v ]) => !k.includes ('.') && (goChan3ListElem (v) !== undefined) && (v !== '[]map[string]any') && (v !== '[]string')).map (([ k ]) => k);
    if (listPromoteKeys.length && (content.indexOf ('AsyncResult[[]map[string]any]') >= 0 || content.indexOf ('MapSliceToList(') >= 0)) {
        const pAlt = listPromoteKeys.join ('|');
        if (new RegExp ('(?:' + pAlt + ')Async\\(').test (content)) {
            const pTramp = new RegExp ('^(func \\(this \\*\\w+\\) (?:' + pAlt + ')Async\\([^\\n]*\\) <-chan ((?:ccxt\\.)?))AsyncResult\\[\\[\\]map\\[string\\]any\\] \\{\\n\\tch := make\\(chan (?:ccxt\\.)?AsyncResult\\[\\[\\]map\\[string\\]any\\], 1\\)\\n(\\tgo this\\.(\\w+)\\(ch(?:, [^\\n]*)?\\)\\n\\treturn ch\\n\\}\\nfunc \\(this \\*\\w+\\) \\4\\(ch chan (?:ccxt\\.)?)AsyncResult\\[\\[\\]map\\[string\\]any\\]', 'gm');
            content = content.replace (pTramp, '$1AsyncResult[[]any] {\n\tch := make(chan $2AsyncResult[[]any], 1)\n$3AsyncResult[[]any]');
            const pHead = new RegExp ('\\nfunc \\(this \\*\\w+\\) \\w+\\(ch chan ((?:ccxt\\.)?)AsyncResult\\[\\[\\]any\\]', 'g');
            for (let m = pHead.exec (content); m !== null; m = pHead.exec (content)) {
                const q = m[1];
                const bs = m.index + 1;
                const be = content.indexOf ('\n}\n', bs) + 3;
                if (be < 3) continue;
                const body = content.substring (bs, be);
                if (body.indexOf ('AsyncResult[[]map[string]any]') < 0) continue;
                let next = body.replace (/AsyncResult\[\[\]map\[string\]any\]/g, 'AsyncResult[[]any]');
                const msl = /(?<![\w.])(?:ccxt\.)?MapSliceFromList\(/g;
                for (let sm = msl.exec (next); sm !== null; sm = msl.exec (next)) {
                    const open = sm.index + sm[0].length - 1;
                    const close = goChanClose (next, open);
                    next = next.substring (0, sm.index) + next.substring (open + 1, close - 1) + next.substring (close);
                    msl.lastIndex = sm.index;
                }
                if (next !== body) {
                    content = content.substring (0, bs) + next + content.substring (be);
                    pHead.lastIndex = bs + next.length;
                }
            }
            const pIface = new RegExp ('^(\\t(?:' + pAlt + ')Async\\([^\\n]*\\) <-chan (?:ccxt\\.)?)AsyncResult\\[\\[\\]map\\[string\\]any\\]$', 'gm');
            content = content.replace (pIface, '$1AsyncResult[[]any]');
            const pRecv = new RegExp ('^(\\t+)(r\\d*) := <-(?:this|this\\.Exchange|this\\.DerivedExchange|this\\.BaseExchange|this\\.base|exchange)(?:\\.\\([^()\\n]+\\))?\\.(?:' + pAlt + ')Async\\(', 'gm');
            for (let m = pRecv.exec (content); m !== null; m = pRecv.exec (content)) {
                const rvar = m[2];
                content = content
                    .replace (new RegExp ('(?<![\\w.])(?:ccxt\\.)?MapSliceToList\\(' + rvar + '\\.Value\\)', 'g'), rvar + '.Value')
                    .replace (new RegExp ('(?<![\\w.])(?:ccxt\\.)?StructListBox\\(' + rvar + '\\.Value, (?:ccxt\\.)?MapElementToMap\\)', 'g'), rvar + '.Value');
            }
            content = content
                .replace (/PromiseAllTyped\[\[\]map\[string\]any, ((?:ccxt\.)?)AsyncResult\[\[\]map\[string\]any\]\]\(/g, 'PromiseAllTyped[[]any, $1AsyncResult[[]any]](')
                .replace (/(?:ccxt\.)?StructListsToLists\((r\d*\.Value), (?:ccxt\.)?MapElementToMap\)/g, '$1');
        }
    }
    return content;
}

// the shared pass: retypes tabled cores, their consumers and interface lines (idempotent)
export function goChan3Pass (content: string, table: Map<string, string> = goChan3Table ()): string {
    content = goChan3Unendpoint (content, table);
    const shadow = goChan3Shadow (table);
    return goChan3StructListPass (goChan3StructPass (goChan3ResolvedImports (goChan3LowerAbsent (goChan3PassMarked (content, shadow), shadow)), table), table);
}

// ===== GO-CHAN3 STRUCT LISTS (W28, D4): list-of-struct channels (`AsyncResult[[]any]` -> `AsyncResult[[]T]`) =====
// A table value `[]T` with T a map-backed (or row-backed, OHLCV) unified struct is proven by the passes above on
// its `[]any` shadow, then goChan3StructListPass moves the shadow to []T:
//   cores      trampoline/body head/sends retyped; a sent list E becomes `TsFromList(E)`, nil stays nil (a nil
//              slice), a same-T receive is sent as is, a tabled []any forward is received and converted
//   consumers  `NewTArray(r.Value)` (typed wrappers) and `var x []T = r.Value` read the slice; nil tests stay;
//              every other read boxes back with `TsToList(r.Value)` -- the exact []any (nil for nil) the
//              AsyncResult[[]any] core sent; PromiseAllTyped of same-T list channels converts with
//              StructListsToLists; reflective readers (PromiseAll, CallInternalMethod) read the typed []T
//              through the runtime's untyped accessor
//   interfaces `\tMAsync(..) <-chan AsyncResult[[]any]` -> []T, except IPrediction* blocks
// Prediction venues (package ccxtprediction, PredictionExchange) keep the []any shape (Prediction* rows); a
// PredictionExchange body reading the regular base (`this.BaseExchange.MAsync`) boxes like any other reader.
export const GO_CHAN3_STRUCT_LISTS: Record<string, { from: string, to: string, row: string, newArray: string }> = {
    'Trade': { 'from': 'TradesFromList', 'to': 'TradesToList', 'row': 'TradeToMap', 'newArray': 'NewTradeArray' },
    'Order': { 'from': 'OrdersFromList', 'to': 'OrdersToList', 'row': 'OrderToMap', 'newArray': 'NewOrderArray' },
    'OHLCV': { 'from': 'OHLCVsFromList', 'to': 'OHLCVsToList', 'row': 'OHLCVToList', 'newArray': 'NewOHLCVArray' },
    'Position': { 'from': 'PositionsFromList', 'to': 'PositionsToList', 'row': 'PositionToMap', 'newArray': 'NewPositionArray' },
    'Transaction': { 'from': 'TransactionsFromList', 'to': 'TransactionsToList', 'row': 'TransactionToMap', 'newArray': 'NewTransactionArray' },
    'LedgerEntry': { 'from': 'LedgerEntriesFromList', 'to': 'LedgerEntriesToList', 'row': 'LedgerEntryToMap', 'newArray': 'NewLedgerEntryArray' },
    'DepositAddress': { 'from': 'DepositAddressesFromList', 'to': 'DepositAddressesToList', 'row': 'DepositAddressToMap', 'newArray': 'NewDepositAddressArray' },
    'TransferEntry': { 'from': 'TransferEntriesFromList', 'to': 'TransferEntriesToList', 'row': 'TransferEntryToMap', 'newArray': 'NewTransferEntryArray' },
    'OpenInterest': { 'from': 'OpenInterestsFromList', 'to': 'OpenInterestsToList', 'row': 'OpenInterestToMap', 'newArray': 'NewOpenInterestArray' },
    'Conversion': { 'from': 'ConversionsFromList', 'to': 'ConversionsToList', 'row': 'ConversionToMap', 'newArray': 'NewConversionArray' },
    'Liquidation': { 'from': 'LiquidationsFromList', 'to': 'LiquidationsToList', 'row': 'LiquidationToMap', 'newArray': 'NewLiquidationArray' },
    'BorrowInterest': { 'from': 'BorrowInterestsFromList', 'to': 'BorrowInterestsToList', 'row': 'BorrowInterestToMap', 'newArray': 'NewBorrowInterestArray' },
    'FundingHistory': { 'from': 'FundingHistoriesFromList', 'to': 'FundingHistoriesToList', 'row': 'FundingHistoryToMap', 'newArray': 'NewFundingHistoryArray' },
    'FundingRateHistory': { 'from': 'FundingRateHistoriesFromList', 'to': 'FundingRateHistoriesToList', 'row': 'FundingRateHistoryToMap', 'newArray': 'NewFundingRateHistoryArray' },
    'LeverageTier': { 'from': 'LeverageTiersFromList', 'to': 'LeverageTiersToList', 'row': 'LeverageTierToMap', 'newArray': 'NewLeverageTierArray' },
    'MarginModification': { 'from': 'MarginModificationsFromList', 'to': 'MarginModificationsToList', 'row': 'MarginModificationToMap', 'newArray': 'NewMarginModificationArray' },
    'LongShortRatio': { 'from': 'LongShortRatiosFromList', 'to': 'LongShortRatiosToList', 'row': 'LongShortRatioToMap', 'newArray': 'NewLongShortRatioArray' },
    'ADL': { 'from': 'ADLsFromList', 'to': 'ADLsToList', 'row': 'ADLToMap', 'newArray': 'NewADLArray' },
    'Account': { 'from': 'AccountsFromList', 'to': 'AccountsToList', 'row': 'AccountToMap', 'newArray': 'NewAccountArray' },
    'PredictionOrder': { 'from': 'PredictionOrdersFromList', 'to': 'PredictionOrdersToList', 'row': 'PredictionOrderToMap', 'newArray': 'NewPredictionOrderArray' },
    'PredictionTrade': { 'from': 'PredictionTradesFromList', 'to': 'PredictionTradesToList', 'row': 'PredictionTradeToMap', 'newArray': 'NewPredictionTradeArray' },
    'PredictionPosition': { 'from': 'PredictionPositionsFromList', 'to': 'PredictionPositionsToList', 'row': 'PredictionPositionToMap', 'newArray': 'NewPredictionPositionArray' },
    'PredictionEvent': { 'from': 'PredictionEventsFromList', 'to': 'PredictionEventsToList', 'row': 'PredictionEventToMap', 'newArray': 'NewPredictionEventArray' },
    'PredictionSettlement': { 'from': 'PredictionSettlementsFromList', 'to': 'PredictionSettlementsToList', 'row': 'PredictionSettlementToMap', 'newArray': 'NewPredictionSettlementArray' },
    'MarketInterface': { 'from': 'MarketInterfacesFromList', 'to': 'MarketInterfacesToList', 'row': 'MarketInterfaceToMap', 'newArray': 'NewMarketInterfaceArray' },
    'map[string]any': { 'from': 'MapSliceFromList', 'to': 'MapSliceToList', 'row': 'MapElementToMap', 'newArray': 'NewMapArray' },
    'string': { 'from': 'StringSliceFromList', 'to': 'StringSliceToList', 'row': 'StringElementToAny', 'newArray': 'NewStringArray' },
};

// `[]T` (optionally `[]ccxt.T`) of a list-of-struct channel -> T (undefined otherwise)
export function goChan3ListElem (t: string): string | undefined {
    if (t === '[]map[string]any') {
        return 'map[string]any';
    }
    if (t === '[]string') {
        return 'string';
    }
    const m = /^\[\](?:ccxt\.)?(\w+)$/.exec (t);
    return ((m !== null) && (GO_CHAN3_STRUCT_LISTS[m[1]] !== undefined)) ? m[1] : undefined;
}

// a read already boxed by goChan3StructListPass (replay): `TsToList(` / `TsFromList(` / `StructListsToLists(` right before it
function goChan3ListBoxed (before: string): boolean {
    const names = Object.values (GO_CHAN3_STRUCT_LISTS).flatMap ((h) => [ h.to, h.from ]);
    return new RegExp ('(?:^|[^\\w.])(?:ccxt\\.)?(?:' + names.join ('|') + '|StructListsToLists|StructListBox)\\($').test (before);
}

// `ch <- AsyncResult[[]T]{Value: ` of a list-of-struct T right before a read (replay)
function goChan3ListSendBefore (before: string): boolean {
    const m = /^\t+\w+ <- (?:ccxt\.)?AsyncResult\[(\[\](?:map\[string\]any|[\w.]+))\]\{Value: $/.exec (before);
    return (m !== null) && (goChan3ListElem (m[1]) !== undefined);
}

// method -> T of the tabled list-of-struct channels
export function goChan3StructListEntries (table: Map<string, string>, predScope = false): Map<string, string> {
    const out = new Map<string, string> ();
    if (!predScope) {
        for (const [ m, t ] of table) {
            const e = goChan3ListElem (t);
            if ((e !== undefined) && !m.startsWith ('Prediction.') && (!goChan3IsPredOnlyStruct (t) || GO_CHAN3_SHARED_PRED_STRUCTS.has (e))) {
                out.set (m, e);
            }
        }
        return out;
    }
    for (const [ m, t ] of table) {
        const e = goChan3ListElem (t);
        if ((e !== undefined) && !m.startsWith ('Prediction.') && (goChan3IsPredOnlyStruct (t) || GO_CHAN3_SHARED_PRED_STRUCTS.has (e) || (e === 'map[string]any') || (e === 'string'))) {
            out.set (m, e);
        }
    }
    for (const [ m, t ] of table) {
        const e = goChan3ListElem (t);
        if ((e !== undefined) && m.startsWith ('Prediction.')) {
            out.set (m.slice (11), e);
        }
    }
    return out;
}

export function goChan3StructListPass (content: string, table: Map<string, string>): string {
    const predictionFile = /^package ccxtprediction\s*$/m.test (content);
    const regLists = goChan3StructListEntries (table, false);
    const predLists = goChan3StructListEntries (table, true);
    const names = [ ...new Set ((predictionFile ? [ ...predLists.keys () ] : [ ...regLists.keys (), ...predLists.keys () ]).map ((k) => k.replace (/^\w+\./, ''))) ];
    if (!names.length || !names.some ((n) => content.includes (n + 'Async'))) {
        return content;
    }
    const q = goChanQual (content);
    const alt = names.join ('|');
    const masked = goChanMask (content);
    const edits: Edit[] = [];
    const taken = new Map<number, Set<string>> ();
    const fresh = (at: number) => {
        const [ fs0, fe0 ] = goChan3Func (masked, at);
        const t = taken.get (fs0) || new Set<string> ();
        taken.set (fs0, t);
        return goChan3FreshName (content.substring (fs0, fe0), t);
    };
    const qt = (T: string) => ((T === 'map[string]any') || (T === 'string')) ? ('[]' + T) : ('[]' + q + T);
    const helper = (T: string) => GO_CHAN3_STRUCT_LISTS[T];
    // the list method a `rN` read in the function holding `at` was received from (last bind before `at`)
    const bindOf = (at: number, name: string): string | undefined => {
        const [ fs0 ] = goChan3Func (masked, at);
        const binds = [ ...masked.substring (fs0, at).matchAll (new RegExp ('\\n\\t+' + name + ' := <-[\\w.]+(?:\\.\\((?:ccxt\\.)?I\\w+\\))?\\.(\\w+)Async\\(', 'g')) ];
        return binds.length ? binds[binds.length - 1][1] : undefined;
    };
    // interface lines
    const iface = new RegExp ('^(\\t(' + alt + ')Async\\([^\\n]*\\)) <-chan ((?:ccxt\\.)?)AsyncResult\\[\\[\\]any\\]$', 'gm');
    for (let m = iface.exec (masked); m !== null; m = iface.exec (masked)) {
        const owner = /\ntype (\w+) interface \{\n[^}]*$/.exec (masked.substring (0, m.index));
        const isPredIface = (owner !== null) && /^IPrediction/.test (owner[1]);
        const lt = (isPredIface ? predLists : regLists).get (m[2]);
        if (lt === undefined) {
            continue;
        }
        const elemQual = ((lt === 'map[string]any') || (lt === 'string')) ? lt : (m[3] + lt);
        edits.push ({ 'start': m.index, 'end': m.index + m[0].length, 'text': m[1] + ' <-chan ' + m[3] + 'AsyncResult[[]' + elemQual + ']' });
    }
    // cores
    const coreBodies: [ number, number, string ][] = [];
    const tramp = new RegExp ('^func \\(this \\*(\\w+)\\) (' + alt + ')Async\\([^\\n]*\\) <-chan (?:ccxt\\.)?AsyncResult\\[\\[\\]any\\] \\{\\n\\tch := make\\(chan (?:ccxt\\.)?AsyncResult\\[\\[\\]any\\], 1\\)\\n\\tgo this\\.(\\w+)\\(ch(?:, [^\\n]*)?\\)\\n\\treturn ch\\n\\}\\n', 'gm');
    for (let m = tramp.exec (masked); m !== null; m = tramp.exec (masked)) {
        const [ whole, receiver, method, bodyName ] = m;
        const coreLists = (predictionFile || (receiver === 'PredictionExchange')) ? predLists : regLists;
        const T = coreLists.get (receiver + '.' + method) ?? coreLists.get (method);
        if (T === undefined) {
            continue;
        }
        const carrier = q + 'AsyncResult[' + qt (T) + ']';
        const listCarrier = /(?:ccxt\.)?AsyncResult\[\[\]any\]/g;
        edits.push ({ 'start': m.index, 'end': m.index + whole.length, 'text': content.substring (m.index, m.index + whole.length).replace (listCarrier, carrier) });
        const head = '\nfunc (this *' + receiver + ') ' + bodyName + '(ch chan ' + q + 'AsyncResult[[]any]';
        const headAt = masked.indexOf (head);
        if ((headAt < 0) || (masked.indexOf (head, headAt + 1) >= 0)) {
            throw new Error ('GOCHAN3: list-of-struct core ' + receiver + '.' + method + 'Async has no single body');
        }
        const bodyStart = headAt + 1;
        const bodyEnd = masked.indexOf ('\n}\n', bodyStart) + 3;
        coreBodies.push ([ bodyStart, bodyEnd, T ]);
        const headEnd = masked.indexOf ('\n', bodyStart);
        edits.push ({ 'start': bodyStart, 'end': headEnd, 'text': content.substring (bodyStart, headEnd).replace (q + 'AsyncResult[[]any]', carrier) });
        const fn = masked.substring (bodyStart, bodyEnd);
        const send = /\n(\t+)ch <- /g;
        for (let s = send.exec (fn); s !== null; s = send.exec (fn)) {
            const at = bodyStart + s.index + s[0].length;
            const ind = s[1];
            if (masked.startsWith ('<-', at)) {
                const fm = goChan3ReceiveMethod (masked, at, table, receiver);
                const ft = (fm === undefined) ? undefined : ((coreLists.has (receiver + '.' + fm) || coreLists.has (fm)) ? ('[]' + (coreLists.get (receiver + '.' + fm) ?? coreLists.get (fm))) : goChan3Lookup (table, receiver, fm));
                if (ft === '[]' + T) {
                    continue;   // same-T forward
                }
                if (ft !== '[]any') {
                    throw new Error ('GOCHAN3: ' + receiver + '.' + method + 'Async forwards ' + (fm || '?') + ' (' + (ft || 'untabled') + ') into AsyncResult[' + qt (T) + ']');
                }
                const end = goChanExprEnd (masked, at);
                const rn = fresh (at);
                edits.push ({ 'start': bodyStart + s.index + 1 + ind.length, 'end': end, 'text': rn + ' := ' + content.substring (at, end) + '\n' + ind + 'ch <- ' + carrier + '{Value: ' + q + helper (T).from + '(' + rn + '.Value), Err: ' + rn + '.Err}' });
                continue;
            }
            const lit = /^(?:ccxt\.)?AsyncResult\[\[\]any\]\{/.exec (masked.substring (at, at + 40));
            if (lit === null) {
                throw new Error ('GOCHAN3: list-of-struct core ' + receiver + '.' + method + 'Async has an unshaped send');
            }
            const open = at + lit[0].length - 1;
            const close = goChanClose (masked, open);
            edits.push ({ 'start': at, 'end': open, 'text': carrier });
            const inner = masked.substring (open + 1, close - 1);
            const v = /^Value: ([\s\S]*?)((?:, Err: [\w.]+)?)$/.exec (inner);
            if ((v === null) || (v[1] === 'nil')) {
                continue;   // `{}` / `{Err: e}` / `{Value: nil}`: a nil slice
            }
            const e = v[1];
            const recv = /^(r\d*)\.Value$/.exec (e);
            if (recv !== null) {
                const bm = bindOf (at, recv[1]);
                const bt = (bm === undefined) ? undefined : ((coreLists.has (receiver + '.' + bm) || coreLists.has (bm)) ? ('[]' + (coreLists.get (receiver + '.' + bm) ?? coreLists.get (bm))) : goChan3Lookup (table, receiver, bm));
                if (bt === '[]' + T) {
                    continue;   // same-T receive: the slice itself
                }
                if ((bt !== undefined) && (goChan3ListElem (bt) !== undefined)) {
                    throw new Error ('GOCHAN3: ' + receiver + '.' + method + 'Async sends ' + bm + ' (' + bt + ') as AsyncResult[' + qt (T) + ']');
                }
            } else if (/^(?:ccxt\.)?\w+\.Value\b/.test (e) && (bindOf (at, e.split ('.')[0]) !== undefined) && ((coreLists.get (receiver + '.' + (bindOf (at, e.split ('.')[0]) as string)) ?? coreLists.get (bindOf (at, e.split ('.')[0]) as string)) !== undefined)) {
                throw new Error ('GOCHAN3: ' + receiver + '.' + method + 'Async sends an unshaped list-of-struct read: ' + e);
            }
            const valStart = open + 1 + 'Value: '.length;
            edits.push ({ 'start': valStart, 'end': valStart, 'text': q + helper (T).from + '(' });
            edits.push ({ 'start': valStart + e.length, 'end': valStart + e.length, 'text': ')' });
        }
    }
    const inListCore = (at: number) => coreBodies.find (([ s, e ]) => (at >= s) && (at < e));
    // PromiseAllTyped of same-T list channels (shadow `PromiseAllTyped[[]any, AsyncResult[[]any]](..)`)
    const promiseArgs: [ number, number ][] = [];
    const pall = /(?<![\w.])((?:ccxt\.)?PromiseAllTyped)\[\[\]any, ((?:ccxt\.)?)AsyncResult\[\[\]any\]\]\(/g;
    for (let m = pall.exec (masked); m !== null; m = pall.exec (masked)) {
        const open = m.index + m[0].length - 1;
        const close = goChanClose (masked, open);
        const args = masked.substring (open + 1, close - 1);
        const [ fs0 ] = goChan3Func (masked, m.index);
        const fnPre = masked.substring (fs0, m.index);
        const pallLists = (predictionFile || goChan3PredictionScope (masked, m.index)) ? predLists : regLists;
        const encRecv = goChan3EnclosingReceiver (masked, m.index);
        const callRe = new RegExp ('(?<![\\w.])(?:this|this\\.DerivedExchange|this\\.Exchange|this\\.BaseExchange)(?:\\.\\((?:ccxt\\.)?I\\w+\\))?\\.(\\w+)Async\\(', 'g');
        const mnames = [ ...args.matchAll (callRe) ].map ((c) => c[1]);
        for (const id of args.split (',').map ((s) => s.trim ()).filter ((s) => /^\w+$/.test (s))) {
            const dm = new RegExp ('\\n\\t+' + id + ' := (?:this|this\\.DerivedExchange|this\\.Exchange|this\\.BaseExchange)(?:\\.\\((?:ccxt\\.)?I\\w+\\))?\\.(\\w+)Async\\(').exec (fnPre);
            if (dm !== null) {
                mnames.push (dm[1]);
            }
        }
        const lookupPall = (mname: string) => ((encRecv !== undefined) ? pallLists.get (encRecv + '.' + mname) : undefined) ?? pallLists.get (mname);
        const ts = new Set (mnames.map ((mname) => lookupPall (mname)));
        if (!mnames.some ((mname) => lookupPall (mname) !== undefined)) {
            continue;
        }
        if ((ts.size !== 1) || ts.has (undefined)) {
            throw new Error ('GOCHAN3: PromiseAllTyped mixes list-of-struct channels: ' + args.substring (0, 120));
        }
        const T = [ ...ts ][0] as string;
        promiseArgs.push ([ open, close ]);
        edits.push ({ 'start': m.index, 'end': open, 'text': m[1] + '[' + qt (T) + ', ' + m[2] + 'AsyncResult[' + qt (T) + ']]' });
        const tail = /^\n(\t+)if (r\d*)\.Err != nil \{\n\t+panic\(\2\.Err\)\n\t+\}\n\t+var \w+ \[\]\[\]any = (\2\.Value)\n/.exec (masked.substring (close, close + 400));
        const lineStart = masked.lastIndexOf ('\n', m.index) + 1;
        const bind = /^\t+(r\d*) := <-$/.exec (masked.substring (lineStart, m.index));
        if ((tail === null) || (bind === null) || (bind[1] !== tail[2])) {
            throw new Error ('GOCHAN3: unshaped PromiseAllTyped read of list-of-struct channels');
        }
        const valueAt = close + tail[0].length - 1 - tail[3].length;
        edits.push ({ 'start': valueAt, 'end': valueAt + tail[3].length, 'text': q + 'StructListsToLists(' + tail[3] + ', ' + q + helper (T).row + ')' });
    }
    // consumers
    const call = new RegExp ('\\.(' + alt + ')Async\\(', 'g');
    for (let m = call.exec (masked); m !== null; m = call.exec (masked)) {
        const ls = masked.lastIndexOf ('\n', m.index) + 1;
        const line = masked.substring (ls, masked.indexOf ('\n', m.index));
        if (/^func /.test (line) || /^\t\w+Async\(/.test (line) || promiseArgs.some (([ s, e ]) => (m.index > s) && (m.index < e))) {
            continue;
        }
        const r = goChan3Receiver (masked, m.index) as { recv: string, start: number };
        if (!GO_CHAN3_RECEIVERS.test (r.recv)) {
            throw new Error ('GOCHAN3: unknown receiver ' + r.recv + ' for ' + m[1] + 'Async');
        }
        const isPredCall = ((predictionFile || goChan3PredictionScope (masked, m.index)) && (r.recv !== 'this.BaseExchange')) || /IPrediction/.test (masked.substring (r.start, m.index));
        const encRecv = goChan3EnclosingReceiver (masked, m.index);
        const listMap = isPredCall ? predLists : regLists;
        const T = ((encRecv !== undefined) ? listMap.get (encRecv + '.' + m[1]) : undefined) ?? listMap.get (m[1]);
        if (T === undefined) {
            continue;
        }
        const QT = qt (T);
        const H = helper (T);
        const pre = masked.substring (ls, r.start);
        const callEnd = goChanClose (masked, m.index + m[0].length - 1);
        const [ , fe0 ] = goChan3Func (masked, m.index);
        const fwd = /^(\t+)ch <- <-$/.exec (pre);
        if (fwd !== null) {
            if (inListCore (m.index) !== undefined) {
                continue;   // the core section above owns forwards inside list-of-struct cores
            }
            const outer = goChan3CoreTypeAt (masked, m.index);
            if ((outer === QT) || (outer === '[]' + T)) {
                continue;   // same-T forward (replay)
            }
            if ((outer !== '[]any') && (outer !== 'any')) {
                throw new Error ('GOCHAN3: forward of ' + m[1] + ' (' + QT + ') into an AsyncResult[' + outer + '] core');
            }
            const rn = fresh (m.index);
            const carrier = q + 'AsyncResult[' + outer + ']';
            const val = q + ((outer === 'any') ? 'StructListBox(' : (H.to + '(')) + rn + '.Value' + ((outer === 'any') ? (', ' + q + H.row + ')') : ')');
            edits.push ({ 'start': ls, 'end': callEnd, 'text': fwd[1] + rn + ' := <-' + content.substring (r.start, callEnd) + '\n' + fwd[1] + 'ch <- ' + carrier + '{Value: ' + val + ', Err: ' + rn + '.Err}' });
            continue;
        }
        const bind = /^\t+(r\d*) := <-$/.exec (pre);
        if (bind === null) {
            continue;   // promiseAll element / handed-on channel / PanicOnError: left typed for the runtime's untyped accessor
        }
        const name = bind[1];
        const scope = masked.substring (callEnd, fe0);
        const rebind = new RegExp ('\\n\\t+' + name + ' := ').exec (scope);
        const limit = callEnd + ((rebind === null) ? scope.length : rebind.index);
        const use = new RegExp ('(?<![\\w.])' + name + '\\.Value\\b', 'g');
        use.lastIndex = callEnd;
        for (let u = use.exec (masked); (u !== null) && (u.index < limit); u = use.exec (masked)) {
            const at = u.index;
            const end = at + u[0].length;
            const uls = masked.lastIndexOf ('\n', at) + 1;
            const before = masked.substring (uls, at);
            const after = masked.substring (end, masked.indexOf ('\n', end));
            if (goChan3ListBoxed (before) || goChan3ListSendBefore (before)) {
                continue;   // already boxed / a same-T list send (replay)
            }
            const core = inListCore (at);
            if ((core !== undefined) && /^\t+ch <- (?:ccxt\.)?AsyncResult\[[^\n]*\]\{Value: $/.test (before)) {
                continue;   // the core section above owns sends inside list-of-struct cores
            }
            const wrap = new RegExp ('(?:^|[^\\w.])((?:ccxt\\.)?' + H.newArray + '\\()$').exec (before);
            if ((wrap !== null) && (after[0] === ')')) {
                edits.push ({ 'start': at - wrap[1].length, 'end': end + 1, 'text': u[0] });
                continue;   // typed wrapper: the slice itself
            }
            if (new RegExp ('^\\t+var \\w+ ' + QT.replace (/[.[\]]/g, '\\$&') + ' = $').test (before) && /^\s*$/.test (after)) {
                continue;
            }
            if (/^\s*[!=]= nil\b/.test (after) || /\bnil\s*[!=]=\s*$/.test (before)) {
                continue;   // a nil slice is the absent result
            }
            if (/^\.\(/.test (after)) {
                throw new Error ('GOCHAN3: ' + name + '.Value of ' + m[1] + ' (' + QT + ') asserted: ' + line.trim ());
            }
            edits.push ({ 'start': at, 'end': end, 'text': q + H.to + '(' + u[0] + ')' });
        }
    }
    return edits.length ? goChan3Splice (content, edits) : content;
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
        if (c !== undefined) {
            return goChan3Lookup (table, c.receiver, c.method);
        }
        // a core already typed on disk (replay): its body head carries T (a struct T reads as its map shadow)
        const t = goChan3CoreTypeAt (masked, at);
        if ((t === undefined) || (t === 'any')) {
            return undefined;
        }
        if (goChan3ListElem (t) !== undefined) {
            return '[]any';   // W28: a list-of-struct core reads as its []any shadow
        }
        return goChan3IsStructType (t) ? 'map[string]any' : t.replace (/^ccxt\./, '');
    };
    const globalKeys = [ ...table.keys () ].filter ((k) => !k.includes ('.'));
    if (globalKeys.length) {
        const iface = new RegExp ('^(\\t(' + globalKeys.join ('|') + ')Async\\([^\\n]*\\)) <-chan ((?:ccxt\\.)?)AsyncResult\\[any\\]$', 'gm');
        for (let m = iface.exec (masked); m !== null; m = iface.exec (masked)) {
            edits.push ({ 'start': m.index, 'end': m.index + m[0].length, 'text': m[1] + ' <-chan ' + m[3] + 'AsyncResult[' + goChan3QualType (goChan3BaseType (table.get (m[2]) as string), m[3]) + ']' });
        }
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
    // balance sends: SafeBalance of a merged map-literal local narrows; a rewritten local stays unproven
    const balTable = new Map ([ [ 'SetX', 'map[string]any' ] ]);
    const bal = run ('package ccxt\n\n' + core ('X', '\tvar result any = map[string]any{\n\t\t"info": a,\n\t}\n\tresult = this.MergeBalanceAccount(result, a, a)\n\tch <- AsyncResult[any]{Value: this.SafeBalance(result)}\n\treturn nil\n'), balTable);
    ok (bal.includes ('ch <- AsyncResult[map[string]any]{Value: this.SafeBalance(result).(map[string]any)}'), 'balance send: ' + bal);
    ok (throws ('package ccxt\n\n' + core ('X', '\tvar result any = map[string]any{}\n\tresult = a\n\tch <- AsyncResult[any]{Value: this.SafeBalance(result)}\n\treturn nil\n')), 'rewritten balance local rejected');
    // scalar core, pro qualification, typed call
    const pro = run ('package ccxtpro\n\n' + core ('X', '\tch <- ccxt.AsyncResult[any]{Value: this.ParseToInt(a)}\n\treturn nil\n', 'GetN', 'ccxt.'));
    ok (pro.includes ('<-chan ccxt.AsyncResult[int64] {') && pro.includes ('make(chan ccxt.AsyncResult[int64], 1)') && pro.includes ('ch <- ccxt.AsyncResult[int64]{Value: this.ParseToInt(a)}') && pro.includes ('(ch chan ccxt.AsyncResult[int64]'), 'pro qualification: ' + pro);
    // unprovable sends throw
    ok (throws ('package ccxt\n' + core ('X', '\tvar r any = nil\n\tch <- AsyncResult[any]{Value: r}\n\treturn nil\n')), 'any local throws');
    ok (throws ('package ccxt\n' + core ('X', '\tch <- AsyncResult[any]{Value: this.ParseThing(a)}\n\treturn nil\n')), 'any call throws');
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
    goChan3Cores ('package ccxt\n' + core ('X', '\tch <- AsyncResult[any]{Value: this.ParseThing(a)}\n\treturn nil\n'), goChanMask ('package ccxt\n' + core ('X', '\tch <- AsyncResult[any]{Value: this.ParseThing(a)}\n\treturn nil\n')), new Map (), (mm, rr, reason) => seen.push (mm + ':' + reason));
    ok (seen.length === 1 && seen[0] === 'SetX:call-send:ParseThing', 'audit reason: ' + seen.join (';'));
    // endpoint-joined locals
    goChan3SetStubsForTest (new Map ([ [ 'PubGetA', 'map[string]any' ], [ 'PubGetL', '[]any' ] ]));
    const joined = run ('package ccxt\n' + core ('X', '\tvar response any = nil\n\tif a == nil {\n\n\t\tr := <-this.PubGetA(a)\n\t\tif r.Err != nil {\n\t\t\tpanic(r.Err)\n\t\t}\n\t\tresponse = r.Raw\n\t} else {\n\n\t\tr1 := <-this.PubGetA(a)\n\t\tif r1.Err != nil {\n\t\t\tpanic(r1.Err)\n\t\t}\n\t\tresponse = r1.Raw\n\t}\n\tif response == nil {\n\t\tpanic(\"x\")\n\t}\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n'));
    ok (joined.includes ('\tvar response map[string]any = nil\n') && joined.includes ('response = r.Value\n') && joined.includes ('response = r1.Value\n') && joined.includes ('ch <- AsyncResult[map[string]any]{Value: response}'), 'endpoint join: ' + joined);
    ok (throws ('package ccxt\n' + core ('X', '\tvar response any = nil\n\tr := <-this.PubGetL(a)\n\tresponse = r.Raw\n\tr1 := <-this.PubGetA(a)\n\tresponse = r1.Raw\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n')), 'mixed endpoint join throws');
    ok (throws ('package ccxt\n' + core ('X', '\tr := <-this.PubGetA(a)\n\tresponse := r.Raw\n\tthis.Use(response)\n\tch <- AsyncResult[any]{Value: response}\n\treturn nil\n')), 'other use throws');
    const rawSend = run ('package ccxt\n' + core ('X', '\tr := <-this.PubGetA(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tch <- AsyncResult[any]{Value: r.Raw}\n\treturn nil\n'));
    ok (rawSend.includes ('\tch <- AsyncResult[map[string]any]{Value: r.Value}\n'), 'endpoint Raw send: ' + rawSend);
    ok (throws ('package ccxt\n' + core ('X', '\tr := <-this.PubGetL(a)\n\tch <- AsyncResult[any]{Value: r.Raw}\n\treturn nil\n')), 'endpoint Raw send of another T throws');
    // typed promiseAll
    const pall = 'package ccxt\n\nfunc (this *Y) f(p any) any {\n\tvar a any = EndpointRaw(this.PubGetA(p))\n\tr := <-promiseAll([]any{a, this.PubGetA(p)})\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar v []any = ListTyped(r.Value)\n\tx := GetValue(v, 0)\n\treturn []any{x, GetValue(v, 1)}\n}\n';
    const pt = run (pall);
    ok (pt.includes ('\ta := this.PubGetA(p)\n\tr := <-PromiseAllTyped[map[string]any, EndpointResult[map[string]any]](a, this.PubGetA(p))\n') && pt.includes ('\tvar v []map[string]any = r.Value\n\tvar x any = nil\n\tif v[0] != nil {\n\t\tx = v[0]\n\t}\n\tvar v1Box any = nil\n\tif v[1] != nil {\n\t\tv1Box = v[1]\n\t}\n\treturn []any{x, v1Box}'), 'typed promiseAll: ' + pt);
    ok (run (pt) === pt, 'typed promiseAll idempotent');
    ok (run (pall.replace ('this.PubGetA(p)})', 'this.PubGetL(p)})')) === pall.replace ('this.PubGetA(p)})', 'this.PubGetL(p)})'), 'mixed promiseAll untouched');
    ok (run (pall.replace ('x := GetValue(v, 0)', 'x := v')) === pall.replace ('x := GetValue(v, 0)', 'x := v'), 'whole-list read untouched');
    goChan3EndpointSendSelfTest (ok, run, throws, core);
    // WS2 Future boundary: untabled Watch forwards convert through an inline type switch
    goChan3SetTableForTest (new Map ([ [ 'WatchX', 'map[string]any' ] ]), new Set ([ 'WatchX' ]));
    const w = run ('package ccxtpro\n\nimport ccxt "github.com/ccxt/ccxt/go/v4"\n' + core ('X', '\tr := <-this.Watch(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tif a == nil {\n\t\tch <- <-this.WatchMultiple(a)\n\t\treturn nil\n\t}\n\tch <- ccxt.AsyncResult[any]{Value: r.Value}\n\treturn nil\n', 'WatchX', 'ccxt.'), goChan3Table ());
    ok (w.includes ('\tvar resolved1 map[string]any\n\tswitch resolved1Box := r.Value.(type) {\n\tcase map[string]any:\n\t\tresolved1 = resolved1Box\n\tcase *sync.Map:\n\t\tresolved1 = ccxt.SafeMapToMap(resolved1Box)\n\tcase nil:\n\tdefault:\n\t\tpanic(ccxt.ExchangeError("resolved value is not map[string]any"))\n\t}\n\tch <- ccxt.AsyncResult[map[string]any]{Value: resolved1}\n')
        && w.includes ('\t\tr1 := <-this.WatchMultiple(a)\n\t\tif r1.Err != nil {\n\t\t\tpanic(r1.Err)\n\t\t}\n\t\tvar resolved map[string]any\n') && w.includes ('import "sync"\n') && (w.indexOf ('ResolvedAs') < 0), 'ws2 boundary: ' + w);
    ok (run (w, goChan3Table ()) === w, 'ws2 idempotent');
    // WS2 bool + per-receiver table + nullable value type bool?
    goChan3SetTableForTest (new Map ([ [ 'UnWatchX', 'bool' ], [ 'InitX', 'bool?' ], [ 'A.HelperX', 'map[string]any' ], [ 'B.HelperX', '[]any' ] ]), new Set ([ 'UnWatchX' ]));
    const wb = run ('package ccxtpro\n\nimport ccxt "github.com/ccxt/ccxt/go/v4"\n' + core ('X', '\tch <- <-this.Watch(a)\n\treturn nil\n', 'UnWatchX', 'ccxt.'), goChan3Table ());
    ok (wb.includes ('var resolved bool\n') && wb.includes ('ch <- ccxt.AsyncResult[bool]{Value: resolved}'), 'ws2 bool boundary: ' + wb);
    const nb = run ('package ccxt\n' + core ('X', '\tif a == nil {\n\t\tch <- AsyncResult[any]{Value: nil}\n\t\treturn nil\n\t}\n\tch <- AsyncResult[any]{Value: true}\n\treturn nil\n', 'InitX'), goChan3Table ());
    ok (nb.includes ('ch <- AsyncResult[bool]{}\n') && nb.includes ('ch <- AsyncResult[bool]{Value: true}\n'), 'nullable bool?: ' + nb);
    const pr = run ('package ccxt\n' + core ('A', '\tch <- AsyncResult[any]{Value: map[string]any{}}\n\treturn nil\n', 'HelperX') + core ('B', '\tch <- AsyncResult[any]{Value: []any{}}\n\treturn nil\n', 'HelperX'), goChan3Table ());
    ok (pr.includes ('func (this *A) HelperXAsync(a any, optionalArgs ...any) <-chan AsyncResult[map[string]any]') && pr.includes ('func (this *B) HelperXAsync(a any, optionalArgs ...any) <-chan AsyncResult[[]any]'), 'per-receiver table: ' + pr);
    // W09: an ArrayCacheInterface forward unboxes with AsArrayCache, never OrderBookTyped
    goChan3SetTableForTest (new Map ([ [ 'C.SubX', 'ArrayCacheInterface' ] ]), new Set ([ 'C.SubX' ]));
    const ac = run ('package ccxtpro\n\nimport ccxt "github.com/ccxt/ccxt/go/v4"\n' + core ('C', '\tr1 := <-this.Watch(a)\n\tif r1.Err != nil {\n\t\tpanic(r1.Err)\n\t}\n\tch <- ccxt.AsyncResult[any]{Value: r1.Value}\n\treturn nil\n', 'SubX', 'ccxt.'), goChan3Table ());
    ok (ac.includes ('ch <- ccxt.AsyncResult[ccxt.ArrayCacheInterface]{Value: ccxt.AsArrayCache(r1.Value)}') && (ac.indexOf ('OrderBookTyped') < 0), 'W09 ArrayCacheInterface forward: ' + ac);
    // struct channels: AsyncResult[map[string]any] shadow -> AsyncResult[Order]
    goChan3SetTableForTest (new Map ([ [ 'CreateOrder', 'Order' ], [ 'FetchX', 'map[string]any' ] ]), new Set ());
    const sc = (body: string, name = 'CreateOrder') => core ('X', body, name);
    const sv = run ('package ccxt\n' + sc ('\tif a == nil {\n\t\tch <- AsyncResult[any]{Value: nil}\n\t\treturn nil\n\t}\n\tch <- AsyncResult[any]{Value: this.ParseOrder(a)}\n\treturn nil\n')
        + 'func (this *Y) f(a any) any {\n\tr := <-this.DerivedExchange.(ICreateOrder).CreateOrderAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar o Order = NewOrder(r.Value)\n\tvar m map[string]any = MapTyped(r.Value)\n\tif r.Value == nil {\n\t\treturn o\n\t}\n\treturn []any{m, r.Value}\n}\n'
        + sc ('\tr := <-this.CreateOrderAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tch <- AsyncResult[any]{Value: r.Value}\n\treturn nil\n', 'FetchX')
        + 'type I interface {\n\tCreateOrderAsync(a any, optionalArgs ...any) <-chan AsyncResult[any]\n}\n', goChan3Table ());
    ok (sv.includes ('CreateOrderAsync(a any, optionalArgs ...any) <-chan AsyncResult[Order] {\n\tch := make(chan AsyncResult[Order], 1)') && sv.includes ('createOrderBody(ch chan AsyncResult[Order], a any'), 'struct core head: ' + sv);
    ok (sv.includes ('\t\tch <- AsyncResult[Order]{}\n') && sv.includes ('\tch <- AsyncResult[Order]{Value: OrderFromMap(this.ParseOrder(a))}\n'), 'struct core sends: ' + sv);
    ok (sv.includes ('\tvar o Order = r.Value\n') && sv.includes ('\tvar m map[string]any = StructResultMap(r.Value, OrderToMap)\n') && sv.includes ('\tif StructAbsent(r.Value) {\n') && sv.includes ('\t\trValueBox = StructBox(r.Value, OrderToMap)\n'), 'struct consumers: ' + sv);
    ok (sv.includes ('ch <- AsyncResult[map[string]any]{Value: StructResultMap(r.Value, OrderToMap)}'), 'struct into map core: ' + sv);
    ok (sv.includes ('\tCreateOrderAsync(a any, optionalArgs ...any) <-chan AsyncResult[Order]\n'), 'struct interface line');
    ok (run (sv, goChan3Table ()) === sv, 'struct channel idempotent');
    const pv = 'package ccxtprediction\n\nimport ccxt "github.com/ccxt/ccxt/go/v4"\n' + core ('X', '\tch <- ccxt.AsyncResult[any]{Value: map[string]any{}}\n\treturn nil\n', 'CreateOrder', 'ccxt.');
    let pvOut = '';
    try { pvOut = run (pv, goChan3Table ()); } catch (e) { pvOut = 'THROW ' + e; }
    ok (pvOut.includes ('ccxt.AsyncResult[map[string]any]{Value: map[string]any{}}') && !pvOut.includes ('ccxt.Order'), 'prediction venue keeps the map shadow: ' + pvOut);
    // W28 list-of-struct channels: AsyncResult[[]any] shadow -> AsyncResult[[]Trade]
    goChan3SetTableForTest (new Map ([ [ 'FetchTrades', '[]Trade' ], [ 'FetchOrders', '[]Order' ], [ 'FetchOpenOrders', '[]Order' ], [ 'FetchY', '[]any' ] ]), new Set ());
    const lc3 = (body: string, name = 'FetchTrades') => core ('X', body, name);
    const lv = run ('package ccxt\n' + lc3 ('\tif a == nil {\n\t\tch <- AsyncResult[any]{Value: nil}\n\t\treturn nil\n\t}\n\tch <- AsyncResult[any]{Value: this.ArraysConcat(a)}\n\treturn nil\n')
        + 'func (this *Y) FetchTrades(a any) ([]Trade, error) {\n\tr := <-this.FetchTradesAsync(a)\n\tif r.Err != nil {\n\t\treturn nil, r.Err\n\t}\n\tvar res []Trade = NewTradeArray(r.Value)\n\treturn res, nil\n}\n'
        + 'func (this *Y) f(a any) any {\n\tr := <-this.DerivedExchange.(IFetchTrades).FetchTradesAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar t any = nil\n\tif r.Value != nil {\n\t\tt = r.Value\n\t}\n\treturn t\n}\n'
        + lc3 ('\tr := <-this.FetchTradesAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tch <- AsyncResult[any]{Value: r.Value}\n\treturn nil\n', 'FetchY')
        + lc3 ('\tr := <-PromiseAllTyped[[]any, AsyncResult[[]any]](this.FetchOpenOrdersAsync(a), this.FetchOpenOrdersAsync(a))\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar both [][]any = r.Value\n\tch <- AsyncResult[any]{Value: this.ArraysConcat(both)}\n\treturn nil\n', 'FetchOrders')
        + lc3 ('\tch <- AsyncResult[any]{Value: this.ArraysConcat(a)}\n\treturn nil\n', 'FetchOpenOrders')
        + 'type I interface {\n\tFetchTradesAsync(a any, optionalArgs ...any) <-chan AsyncResult[any]\n}\n', goChan3Table ());
    ok (lv.includes ('FetchTradesAsync(a any, optionalArgs ...any) <-chan AsyncResult[[]Trade] {\n\tch := make(chan AsyncResult[[]Trade], 1)') && lv.includes ('fetchTradesBody(ch chan AsyncResult[[]Trade], a any'), 'list-of-struct core head: ' + lv);
    ok (lv.includes ('\t\tch <- AsyncResult[[]Trade]{Value: nil}\n') && lv.includes ('\tch <- AsyncResult[[]Trade]{Value: TradesFromList(this.ArraysConcat(a))}\n'), 'list-of-struct core sends: ' + lv);
    ok (lv.includes ('\tvar res []Trade = r.Value\n'), 'list-of-struct typed wrapper returns the slice: ' + lv);
    ok (lv.includes ('\tif r.Value != nil {\n\t\tt = TradesToList(r.Value)\n'), 'list-of-struct untyped read boxes to the []any: ' + lv);
    ok (lv.includes ('ch <- AsyncResult[[]any]{Value: TradesToList(r.Value)}'), 'list-of-struct into []any core: ' + lv);
    ok (lv.includes ('PromiseAllTyped[[]Order, AsyncResult[[]Order]](') && lv.includes ('var both [][]any = StructListsToLists(r.Value, OrderToMap)\n'), 'list-of-struct promiseAll: ' + lv);
    ok (lv.includes ('\tFetchTradesAsync(a any, optionalArgs ...any) <-chan AsyncResult[[]Trade]\n'), 'list-of-struct interface line');
    ok (run (lv, goChan3Table ()) === lv, 'list-of-struct channel idempotent');
    const lp = 'package ccxtprediction\n\nimport ccxt "github.com/ccxt/ccxt/go/v4"\n' + core ('X', '\tch <- ccxt.AsyncResult[any]{Value: []any{}}\n\treturn nil\n', 'FetchTrades', 'ccxt.');
    let lpOut = '';
    try { lpOut = run (lp, goChan3Table ()); } catch (e) { lpOut = 'THROW ' + e; }
    ok (lpOut.includes ('ccxt.AsyncResult[[]any]{Value: []any{}}') && !lpOut.includes ('ccxt.Trade'), 'prediction venue keeps the trades list shape: ' + lpOut);
    // W29 map-of-struct channels: AsyncResult[map[string]any] shadow -> AsyncResult[map[string]Ticker]
    goChan3SetTableForTest (new Map ([ [ 'FetchTickers', 'map[string]Ticker' ], [ 'FetchX', 'map[string]any' ] ]), new Set ());
    const mc = (body: string, name = 'FetchTickers') => core ('X', body, name);
    const mv = run ('package ccxt\n' + mc ('\tif a == nil {\n\t\tch <- AsyncResult[any]{Value: nil}\n\t\treturn nil\n\t}\n\tch <- AsyncResult[any]{Value: this.Extend(a)}\n\treturn nil\n')
        + 'func (this *Y) FetchTickers(a any) (Tickers, error) {\n\tr := <-this.FetchTickersAsync(a)\n\tif r.Err != nil {\n\t\treturn Tickers{}, r.Err\n\t}\n\tvar res Tickers = NewTickers(r.Value)\n\treturn res, nil\n}\n'
        + 'func (this *Y) f(a any) any {\n\tr := <-this.DerivedExchange.(IFetchTickers).FetchTickersAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tvar m map[string]any = r.Value\n\treturn []any{m, r.Value}\n}\n'
        + mc ('\tr := <-this.FetchTickersAsync(a)\n\tif r.Err != nil {\n\t\tpanic(r.Err)\n\t}\n\tch <- AsyncResult[any]{Value: r.Value}\n\treturn nil\n', 'FetchX')
        + 'type I interface {\n\tFetchTickersAsync(a any, optionalArgs ...any) <-chan AsyncResult[any]\n}\n', goChan3Table ());
    ok (mv.includes ('FetchTickersAsync(a any, optionalArgs ...any) <-chan AsyncResult[map[string]Ticker] {\n\tch := make(chan AsyncResult[map[string]Ticker], 1)'), 'map-of-struct core head: ' + mv);
    ok (mv.includes ('\t\tch <- AsyncResult[map[string]Ticker]{}\n') && mv.includes ('\tch <- AsyncResult[map[string]Ticker]{Value: TickerMapFromMap(this.Extend(a))}\n'), 'map-of-struct core sends: ' + mv);
    ok (mv.includes ('\tvar res Tickers = Tickers{Tickers: r.Value}\n'), 'map-of-struct typed wrapper returns the typed dict: ' + mv);
    ok (mv.includes ('\tvar m map[string]any = StructResultMap(r.Value, TickerMapToMap)\n') && mv.includes ('StructBox(r.Value, TickerMapToMap)'), 'map-of-struct consumers: ' + mv);
    ok (mv.includes ('ch <- AsyncResult[map[string]any]{Value: StructResultMap(r.Value, TickerMapToMap)}'), 'map-of-struct into map core: ' + mv);
    ok (mv.includes ('\tFetchTickersAsync(a any, optionalArgs ...any) <-chan AsyncResult[map[string]Ticker]\n'), 'map-of-struct interface line');
    ok (run (mv, goChan3Table ()) === mv, 'map-of-struct channel idempotent');
    const pm = 'package ccxtprediction\n\nimport ccxt "github.com/ccxt/ccxt/go/v4"\n' + core ('X', '\tch <- ccxt.AsyncResult[any]{Value: map[string]any{}}\n\treturn nil\n', 'FetchTickers', 'ccxt.');
    let pmOut = '';
    try { pmOut = run (pm, goChan3Table ()); } catch (e) { pmOut = 'THROW ' + e; }
    ok (pmOut.includes ('ccxt.AsyncResult[map[string]any]{Value: map[string]any{}}') && !pmOut.includes ('ccxt.Ticker'), 'prediction venue keeps the tickers map shadow: ' + pmOut);
    goChan3SetTableForTest (undefined, undefined);
    ok ([ 'WatchTicker', 'WatchMarkPrice' ].every ((m) => goChan3Resolved ().has (m)), 'ws2 resolved set loads');
    goChan3SetTableForTest (undefined, undefined);
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
    const globalKeys = [ ...table.keys () ].filter ((k) => !k.includes ('.'));
    if (!globalKeys.length) {
        return;
    }
    const ref = new RegExp ('\\b(' + globalKeys.join ('|') + ')Async\\b');
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
