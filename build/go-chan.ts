// ===== GOCHAN-1: typed async carriers (`<-chan EndpointResult[T]`) and their consumers =====
// A tabled method's cores send EndpointResult[T]{Value: v, Raw: v}; Raw is the value sent today, so
// IsError / PanicOnError / ReturnPanicErrorT see the same payload. Tables: build/go-chan-tables/*.json.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const GO_CHAN_TABLE_DIR = path.join (path.dirname (fileURLToPath (import.meta.url)), 'go-chan-tables');
// calls whose hand-written Go signature returns this type (go/v4/exchange_*.go)
export const GO_CHAN_CALL_TYPES: { [callee: string]: string } = {
    'this.Extend': 'map[string]any', 'this.DeepExtend': 'map[string]any', 'this.ParseToInt': 'int64', 'this.Json': 'string',
    'this.IndexBy': 'map[string]any',
};
// the Go element type of a table value (`T?` marks cores that may also send a bare nil)
export function goChanType (value: string | undefined): string | undefined {
    return (value === undefined) ? undefined : value.replace (/\?$/, '');
}

// this.DerivedExchange is IDerivedExchange, whose tabled lines --apply-hand retypes with the cores
const GO_CHAN_RECEIVERS = /^(?:this|this\.base|this\.Exchange|this\.BaseExchange|this\.DerivedExchange|exchange)$/;

let GO_CHAN_TABLE: Map<string, string> | undefined = undefined;

// method (printed core name without the Async suffix) -> Go element type, merged from every lead's table
export function goChanTable (): Map<string, string> {
    if (GO_CHAN_TABLE === undefined) {
        const table = new Map<string, string> ();
        const files = fs.existsSync (GO_CHAN_TABLE_DIR) ? fs.readdirSync (GO_CHAN_TABLE_DIR).filter ((f) => f.endsWith ('.json')).sort () : [];
        for (const f of files) {
            const entries = JSON.parse (fs.readFileSync (path.join (GO_CHAN_TABLE_DIR, f), 'utf8'));
            for (const method of Object.keys (entries)) {
                if (table.has (method) && (table.get (method) !== entries[method])) {
                    throw new Error ('GOCHAN: ' + method + ' tabled twice with different types (' + f + ')');
                }
                if (/\?$/.test (entries[method]) && !/^(?:map\[|\[\]|\*)/.test (entries[method])) {
                    throw new Error ('GOCHAN: ' + method + ': nil sends need a nilable type (' + f + ')');
                }
                table.set (method, entries[method]);
            }
        }
        GO_CHAN_TABLE = table;
    }
    return GO_CHAN_TABLE;
}

export function goChanSetTableForTest (table: Map<string, string> | undefined) {
    GO_CHAN_TABLE = table;
}

// comments and string/rune/raw literals blanked to spaces, newlines kept (offsets match the input)
export function goChanMask (content: string): string {
    const out = content.split ('');
    let state = 'code';
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if ((c === '/') && (content[i + 1] === '/')) { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if ((c === '/') && (content[i + 1] === '*')) { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if (c === '"') { state = 'dq'; out[i] = ' '; continue; }
            if (c === '`') { state = 'raw'; out[i] = ' '; continue; }
            if (c === '\'') { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        out[i] = (c === '\n') ? '\n' : ' ';
        if (state === 'line') { if (c === '\n') { state = 'code'; } continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { out[i + 1] = ' '; i++; state = 'code'; } continue; }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

// index just past the bracket matching masked[open]
function goChanClose (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '{') || (c === '[')) {
            depth++;
        } else if ((c === ')') || (c === '}') || (c === ']')) {
            depth--;
            if (depth === 0) {
                return i + 1;
            }
        }
    }
    return -1;
}

// end (exclusive, trailing blanks trimmed) of the expression starting at `start`: the first newline at depth 0
function goChanExprEnd (masked: string, start: number): number {
    let depth = 0;
    let i = start;
    for (; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '{') || (c === '[')) {
            depth++;
        } else if ((c === ')') || (c === '}') || (c === ']')) {
            depth--;
        } else if ((c === '\n') && (depth === 0)) {
            break;
        }
    }
    while ((i > start) && /\s/.test (masked[i - 1])) {
        i--;
    }
    return i;
}

function goChanQual (content: string): string {
    return /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
}

// the Go type of a sent expression, or a reason it is unproven. Only duplicable forms are admitted,
// because the send spells the value twice (Value and Raw).
function goChanSendType (expr: string, fnMasked: string, signature: string, ownCall: (name: string) => string | undefined = () => undefined): { type?: string, bind?: boolean, nil?: boolean, reason?: string } {
    if (expr === 'nil') {
        return { 'nil': true };
    }
    if (/^(?:true|false)$/.test (expr)) {
        return { 'type': 'bool' };
    }
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (expr)) {
        return { 'type': 'string' };
    }
    const literal = /^(map\[string\]any|\[\]any|\[\]string)\{/.exec (expr);
    if (literal !== null) {
        return { 'type': literal[1], 'bind': true };
    }
    const call = /^((?:ccxt\.)?[\w.]+)\(/.exec (expr);
    if ((call !== null) && GO_CHAN_CALL_TYPES[call[1].replace (/^ccxt\./, '')] !== undefined) {
        return { 'type': GO_CHAN_CALL_TYPES[call[1].replace (/^ccxt\./, '')], 'bind': true };
    }
    // `this.M(..)` with M declared once on the same receiver in this file with a concrete return type
    const own = /^this\.(\w+)\(/.exec (expr);
    const ownType = (own !== null) ? ownCall (own[1]) : undefined;
    if ((ownType !== undefined) && (goChanClose (expr, expr.indexOf ('(')) === expr.length)) {
        return { 'type': ownType, 'bind': true };
    }
    if (!/^[A-Za-z_]\w*$/.test (expr)) {
        return { 'reason': (call !== null) ? 'call-send' : 'expr-send' };
    }
    const name = expr;
    const param = new RegExp ('[(,]\\s*' + name + ' ([^,)]+)').exec (signature);
    const decls = fnMasked.match (new RegExp ('(?<![.\\w])var ' + name + ' [^\\n=]+(?= =|\\n)', 'g')) || [];
    const shortDecl = new RegExp ('(?<![.\\w])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=').test (fnMasked);
    const closureParam = new RegExp ('\\bfunc\\s*\\([^)]*\\b' + name + ' ').test (fnMasked);
    if (shortDecl || closureParam || (decls.length + (param ? 1 : 0) !== 1)) {
        return { 'reason': 'local-untyped' };
    }
    const type = (param ? param[1] : decls[0].replace (new RegExp ('^var ' + name + ' '), '')).trim ();
    if ((type === 'any') || (type === 'interface{}') || /^\.\.\./.test (type)) {
        return { 'reason': 'local-any' };
    }
    return { 'type': type };
}

// every path out of the body sends exactly as today's receiver expects one value: body-level `return nil`
// follows a send, the body ends in such a return or a panic, and no `panic("break")` (it sends nothing)
function goChanEveryExitSends (lines: string[]): boolean {
    let depth = 0;
    let literal = 0;
    let last = '';
    let sendDepth = -1;
    const literalAt: number[] = [];
    for (let k = 3; k < lines.length; k++) {
        const line = lines[k];
        const t = line.trim ();
        if (/\bfunc\s*\(/.test (line) && /\{\s*$/.test (line)) {
            literalAt.push (depth);
            literal++;
        }
        if ((literal === 0) && /^return\b/.test (t) && ((t !== 'return nil') || !/^ch <- /.test (last))) {
            return false;
        }
        const before = depth;
        depth += (line.split ('{').length - 1) - (line.split ('}').length - 1);
        while (literalAt.length && (depth <= literalAt[literalAt.length - 1])) {
            literalAt.pop ();
            literal--;
        }
        if (sendDepth >= 0) {
            // continuation lines of a multi-line send
            if (depth <= sendDepth) {
                sendDepth = -1;
            }
            continue;
        }
        if (t !== '' && t !== '}') {
            last = t;
        }
        if (/^ch <- /.test (t) && (depth > before)) {
            sendDepth = before;
        }
    }
    return (last === 'return nil') || /^panic\(/.test (last);
}

// the concrete return type of the single `func (this *R) name(..) T {` in the file (not any, not a tuple)
function goChanOwnReturn (masked: string, receiver: string, name: string): string | undefined {
    const decls = masked.match (new RegExp ('^func \\(this \\*' + receiver + '\\) ' + name + '\\([^\\n]*\\{$', 'gm')) || [];
    if (decls.length !== 1) {
        return undefined;
    }
    const t = /\) ([^\s(){},]+) \{$/.exec (decls[0]);
    return ((t === null) || (t[1] === 'any') || (t[1] === 'interface{}')) ? undefined : t[1];
}

interface GoChanCore { receiver: string, method: string, asyncStart: number, asyncEnd: number, bodyStart: number, bodyEnd: number, sends: { start: number, end: number, expr: string, bind: boolean }[] }

// every `XAsync` trampoline + body pair of a tabled method in the file; throws on a tabled core it cannot prove
function goChanCores (content: string, masked: string, table: Map<string, string>, audit?: (method: string, receiver: string, reason: string, types: string[]) => void): GoChanCore[] {
    const cores: GoChanCore[] = [];
    // a tabled method defined in any other shape (hand-written, unbuffered) cannot be proven here
    const anyDef = /^func \(this \*(\w+)\) (\w+)Async\([^\n]*\) <-chan any \{\n(?!\tch := make\(chan any, 1\)\n\tgo this\.\w+Body\(ch)/gm;
    for (let m = anyDef.exec (masked); m !== null; m = anyDef.exec (masked)) {
        if (audit !== undefined) {
            audit (m[2], m[1], 'hand-shape', []);
        } else if (table.has (m[2])) {
            throw new Error ('GOCHAN: ' + m[1] + '.' + m[2] + 'Async is not a generated trampoline');
        }
    }
    const wrapper = /^func \(this \*(\w+)\) (\w+)Async\(([^\n]*)\) <-chan any \{\n\tch := make\(chan any, 1\)\n\tgo this\.(\w+)\(ch(?:, [^\n]*)?\)\n\treturn ch\n\}\n/gm;
    for (let m = wrapper.exec (masked); m !== null; m = wrapper.exec (masked)) {
        const [ whole, receiver, method, , bodyName ] = m;
        if (!table.has (method) && (audit === undefined)) {
            continue;
        }
        const fail = (reason: string, types: string[] = []) => {
            if (audit !== undefined) {
                audit (method, receiver, reason, types);
                return;
            }
            throw new Error ('GOCHAN: ' + receiver + '.' + method + 'Async cannot carry ' + table.get (method) + ': ' + reason);
        };
        if (bodyName !== method.charAt (0).toLowerCase () + method.slice (1) + 'Body') {
            fail ('body-name');
            continue;
        }
        const head = '\nfunc (this *' + receiver + ') ' + bodyName + '(ch chan any';
        const headAt = masked.indexOf (head);
        const bodyStart = headAt + 1;
        if ((headAt < 0) || (masked.indexOf (head, headAt + 1) >= 0)) {
            fail ('body-missing');
            continue;
        }
        const bodyEnd = masked.indexOf ('\n}\n', bodyStart) + 3;
        const fnMasked = masked.substring (bodyStart, bodyEnd);
        const signature = fnMasked.substring (0, fnMasked.indexOf ('{'));
        const lines = fnMasked.split ('\n');
        if (!/^\tdefer close\(ch\)$/.test (lines[1]) || !/^\tdefer (?:ccxt\.)?ReturnPanicError\(ch\)$/.test (lines[2])) {
            fail ('prologue');
            continue;
        }
        const sends: { start: number, end: number, expr: string, bind: boolean }[] = [];
        let nilSends = false;
        const types = new Set<string> ();
        let reason = '';
        const use = /(?<![.\w])ch(?!\w)/g;
        for (let u = use.exec (fnMasked); u !== null; u = use.exec (fnMasked)) {
            const before = fnMasked.substring (fnMasked.lastIndexOf ('\n', u.index) + 1, u.index);
            const after = fnMasked.substring (u.index, u.index + 6);
            if ((u.index < signature.length) || /defer (?:ccxt\.)?(?:close|ReturnPanicError)\($/.test (before)) {
                continue;
            }
            if (!/^\s*$/.test (before) || !after.startsWith ('ch <- ')) {
                reason = 'channel-escapes';
                break;
            }
            const start = u.index + 6;
            const end = goChanExprEnd (fnMasked, start);
            const expr = content.substring (bodyStart + start, bodyStart + end);
            const proof = goChanSendType (expr, fnMasked, signature, (name) => goChanOwnReturn (masked, receiver, name));
            if (proof.reason !== undefined) {
                reason = proof.reason;
                break;
            }
            if (proof.nil) {
                nilSends = true;
            } else {
                types.add (proof.type as string);
            }
            if (proof.bind) {
                // bound once so Value and Raw hold the same value; the next statement must leave the block
                const next = fnMasked.substring (end).split ('\n').slice (1).find ((l) => l.trim () !== '');
                if ((next === undefined) || (next.trim () !== 'return nil') || /(?<![.\w])chValue(?!\w)/.test (fnMasked)) {
                    reason = 'bind-scope';
                    break;
                }
            }
            sends.push ({ 'start': bodyStart + start, 'end': bodyStart + end, expr, 'bind': !!proof.bind });
        }
        if ((reason === '') && (content.substring (bodyStart, bodyEnd).indexOf ('panic("break")') >= 0)) {
            reason = 'break-panic';
        }
        if ((reason === '') && !goChanEveryExitSends (lines)) {
            reason = 'exit-without-send';
        }
        const list = [ ...types ];
        if ((reason === '') && (list.length > 1)) {
            reason = 'mixed-types';
        }
        const want = goChanType (table.get (method));
        if ((reason === '') && nilSends && ((audit !== undefined) ? false : !/\?$/.test (table.get (method) as string))) {
            reason = 'nil-send';
        }
        if (audit !== undefined && nilSends && reason === '') {
            list.push ('nil');
        }
        if ((reason === '') && (want !== undefined) && (types.size === 1) && (list[0] !== want)) {
            reason = 'type-' + list[0];
        }
        if (audit !== undefined) {
            audit (method, receiver, reason, list);
            if ((reason !== '') || !table.has (method)) {
                continue;
            }
        } else if (reason !== '') {
            fail (reason, list);
        }
        cores.push ({ receiver, method, 'asyncStart': m.index, 'asyncEnd': m.index + whole.length, bodyStart, bodyEnd, sends });
    }
    return cores;
}

function goChanSplice (content: string, edits: { start: number, end: number, text: string }[]): string {
    edits.sort ((a, b) => b.start - a.start);
    let out = content;
    let floor = Infinity;
    for (const e of edits) {
        if (e.end > floor) {
            throw new Error ('GOCHAN: overlapping edits at ' + e.start);
        }
        out = out.substring (0, e.start) + e.text + out.substring (e.end);
        floor = e.start;
    }
    return out;
}

function goChanCoreEdits (content: string, core: GoChanCore, type: string, q: string): { start: number, end: number, text: string }[] {
    const carrier = q + 'EndpointResult[' + type + ']';
    const edits: { start: number, end: number, text: string }[] = [];
    const asyncText = content.substring (core.asyncStart, core.asyncEnd).replace (') <-chan any {', ') <-chan ' + carrier + ' {').replace ('make(chan any, 1)', 'make(chan ' + carrier + ', 1)');
    edits.push ({ 'start': core.asyncStart, 'end': core.asyncEnd, 'text': asyncText });
    const head = content.substring (core.bodyStart, content.indexOf ('\n', core.bodyStart));
    edits.push ({ 'start': core.bodyStart, 'end': core.bodyStart + head.length, 'text': head.replace ('(ch chan any', '(ch chan ' + carrier) });
    const panicAt = content.indexOf ('ReturnPanicError(ch)', core.bodyStart);
    edits.push ({ 'start': panicAt, 'end': panicAt + 'ReturnPanicError(ch)'.length, 'text': 'ReturnPanicErrorT(ch)' });
    for (const s of core.sends) {
        if (s.expr === 'nil') {
            edits.push ({ 'start': s.start, 'end': s.end, 'text': carrier + '{}' });
            continue;
        }
        if (!s.bind) {
            edits.push ({ 'start': s.start, 'end': s.end, 'text': carrier + '{Value: ' + s.expr + ', Raw: ' + s.expr + '}' });
            continue;
        }
        const lineStart = content.lastIndexOf ('\n', s.start) + 1;
        const indent = content.substring (lineStart, content.indexOf ('ch <- ', lineStart));
        const text = 'chValue := ' + s.expr + '\n' + indent + 'ch <- ' + carrier + '{Value: chValue, Raw: chValue}';
        edits.push ({ 'start': lineStart + indent.length, 'end': s.end, text });
    }
    return edits;
}

// consumer rewrites for every `<recv>.<M>Async(..)` call of a tabled method
function goChanConsumerEdits (content: string, masked: string, table: Map<string, string>, skip: (at: number) => boolean): { start: number, end: number, text: string }[] {
    const names = [ ...table.keys () ];
    if (names.length === 0) {
        return [];
    }
    const edits: { start: number, end: number, text: string }[] = [];
    const call = new RegExp ('\\.(' + names.join ('|') + ')Async\\b', 'g');
    for (let m = call.exec (masked); m !== null; m = call.exec (masked)) {
        if (skip (m.index)) {
            continue;
        }
        const nilable = /\?$/.test (table.get (m[1]) as string);
        const type = goChanType (table.get (m[1])) as string;
        let recvStart = m.index;
        while ((recvStart > 0) && /[\w.]/.test (masked[recvStart - 1])) {
            recvStart--;
        }
        const recv = masked.substring (recvStart, m.index);
        const lineStart = masked.lastIndexOf ('\n', recvStart) + 1;
        if (/^func \(/.test (masked.substring (lineStart, recvStart))) {
            continue;
        }
        const nameEnd = m.index + m[0].length;
        if (masked[nameEnd] !== '(') {
            // a method value: Spawn / CallDynamically receive the channel reflectively
            continue;
        }
        if (!GO_CHAN_RECEIVERS.test (recv)) {
            throw new Error ('GOCHAN: unknown receiver ' + recv + ' for ' + m[1] + 'Async');
        }
        const callEnd = goChanClose (masked, nameEnd);
        const callText = content.substring (recvStart, callEnd);
        const lineEnd = masked.indexOf ('\n', callEnd);
        const pre = masked.substring (lineStart, recvStart);
        const post = masked.substring (callEnd, lineEnd);
        const q = /(?:^|[^\w.])ccxt\.\w+\($/.test (pre.replace (/\($/, '')) ? 'ccxt.' : '';
        let r: RegExpExecArray | null;
        // typed wrapper: raw := <-call / if IsError(raw) / return e, CreateReturnError(raw) / var res T = conv
        if ((r = /^(\t+)raw := <-$/.exec (pre)) !== null && (post === '')) {
            const blockEnd = content.indexOf ('\n', content.indexOf ('\n', content.indexOf ('\n', content.indexOf ('\n', lineEnd + 1) + 1) + 1) + 1);
            const block = content.substring (lineEnd, blockEnd);
            const w = /^\n(\t+)if ((?:ccxt\.)?)IsError\(raw\) \{\n(\t+)return (.+), ((?:ccxt\.)?)CreateReturnError\(raw\)\n\t+\}\n\t+var res (.+) = (.+)$/.exec (block);
            if (w === null) {
                throw new Error ('GOCHAN: unrecognised wrapper around ' + callText);
            }
            const fnEnd = masked.indexOf ('\n}\n', lineEnd);
            const rest = masked.substring (blockEnd, fnEnd);
            if (/\braw\b/.test (rest) || /(?<![.\w])r(?!\w)/.test (masked.substring (masked.lastIndexOf ('\nfunc ', lineStart), fnEnd))) {
                throw new Error ('GOCHAN: wrapper local clash around ' + callText);
            }
            const conv = w[7];
            let value: string;
            if ((conv === 'raw.(' + w[6] + ')') && (w[6] === type) && !nilable) {
                value = 'r.Value';
            } else if (conv === 'raw') {
                value = 'r.Raw';
            } else {
                value = conv.replace (/\braw\b/g, 'r.Raw');
            }
            const text = r[1] + 'r := <-' + callText + '\n' + w[1] + 'if ' + w[2] + 'IsError(r.Raw) {\n' + w[3] + 'return ' + w[4] + ', ' + w[5] + 'CreateReturnError(r.Raw)\n' + w[1] + '}\n' + w[1] + 'var res ' + w[6] + ' = ' + value;
            edits.push ({ 'start': lineStart, 'end': blockEnd, text });
            continue;
        }
        if (/^\t+r := <-$/.test (pre)) {
            continue;
        }
        const recvOpen = recvStart - 3;
        const isReceive = (masked.substring (recvOpen, recvStart) === '(<-') && (masked[callEnd] === ')');
        if (isReceive && /^\.(?:Raw|Value|Checked\(\))/.test (masked.substring (callEnd + 1, callEnd + 11))) {
            continue;
        }
        if (!isReceive && /(?:^|[^\w.])(?:ccxt\.)?EndpointRaw\($/.test (masked.substring (lineStart, recvStart))) {
            continue;
        }
        if (!isReceive) {
            if ((masked.substring (recvStart - 2, recvStart) === '<-') && /^\t+\w+ :?= <-$/.test (pre) && (post === '')) {
                // `x := <-call` statement: x keeps the boxed payload it had
                edits.push ({ 'start': recvStart - 2, 'end': callEnd, 'text': '(<-' + callText + ').Raw' });
                continue;
            }
            if (masked.substring (recvStart - 2, recvStart) === '<-') {
                throw new Error ('GOCHAN: unparenthesised receive of ' + callText);
            }
            // handed on as a value (PromiseAll list, append): the boxed channel today's holders expect
            const qual = goChanQual (content);
            edits.push ({ 'start': recvStart, 'end': callEnd, 'text': qual + 'EndpointRaw(' + callText + ')' });
            continue;
        }
        const recvText = '(<-' + callText + ')';
        const outerEnd = callEnd + 1;
        const panicOpen = /((?:ccxt\.)?)PanicOnError\($/.exec (masked.substring (lineStart, recvOpen));
        const checkedEnd = outerEnd + 1;
        if ((panicOpen !== null) && (masked[outerEnd] === ')')) {
            const panicStart = recvOpen - panicOpen[0].length;
            const typedOpen = /((?:ccxt\.)?)(MapTyped|ListTyped)\($/.exec (masked.substring (lineStart, panicStart));
            const typedMatches = typedOpen !== null && (masked[checkedEnd] === ')') && ((typedOpen[2] === 'MapTyped') ? (type === 'map[string]any') : (type === '[]any'));
            if (typedMatches) {
                const start = panicStart - (typedOpen as RegExpExecArray)[0].length;
                edits.push ({ start, 'end': checkedEnd + 1, 'text': recvText + '.Checked()' });
                continue;
            }
            // `x, _ := PanicOnError((<-call)).(T)` with T the carried type: the assertion always holds on Value
            const assertion = /^(\t+)(\w+), _ := $/.exec (masked.substring (lineStart, panicStart));
            if ((assertion !== null) && (masked.substring (checkedEnd, lineEnd) === '.(' + type + ')')) {
                edits.push ({ 'start': lineStart, 'end': lineEnd, 'text': assertion[1] + assertion[2] + ' := ' + recvText + '.Checked()' });
                continue;
            }
            const statement = /^\s*$/.test (masked.substring (lineStart, panicStart)) && /^\s*$/.test (masked.substring (checkedEnd, lineEnd));
            if (statement) {
                edits.push ({ 'start': panicStart, 'end': checkedEnd, 'text': recvText + '.Checked()' });
                continue;
            }
            edits.push ({ 'start': recvOpen, 'end': outerEnd, 'text': recvText + '.Raw' });
            continue;
        }
        // any other receive keeps the untyped payload it had
        edits.push ({ 'start': recvOpen, 'end': outerEnd, 'text': recvText + '.Raw' });
    }
    return edits;
}

// the shared pass: retypes every tabled core in the file and rewrites every consumer of a tabled method
export function goChanCarrierPass (content: string, table: Map<string, string> = goChanTable ()): string {
    if ((table.size === 0) || (content.indexOf ('Async') < 0)) {
        return content;
    }
    const masked = goChanMask (content);
    const q = goChanQual (content);
    const cores = goChanCores (content, masked, table);
    const edits: { start: number, end: number, text: string }[] = [];
    for (const core of cores) {
        edits.push (...goChanCoreEdits (content, core, goChanType (table.get (core.method)) as string, q));
    }
    const iface = new RegExp ('^(\\t(' + [ ...table.keys () ].join ('|') + ')Async\\([^\\n]*\\)) <-chan any$', 'gm');
    for (let m = iface.exec (masked); m !== null; m = iface.exec (masked)) {
        edits.push ({ 'start': m.index, 'end': m.index + m[0].length, 'text': m[1] + ' <-chan ' + q + 'EndpointResult[' + goChanType (table.get (m[2])) + ']' });
    }
    const ifaceAt = (at: number) => { const ls = masked.lastIndexOf ('\n', at) + 1; return /^\t\w+Async\([^\n]*\) <-chan any$/.test (masked.substring (ls, masked.indexOf ('\n', at))); };
    const inCoreHead = (at: number) => ifaceAt (at) || cores.some ((c) => (at >= c.asyncStart) && (at < c.asyncEnd));
    edits.push (...goChanConsumerEdits (content, masked, table, inCoreHead));
    return edits.length ? goChanSplice (content, edits) : content;
}

// audit over generated Go text: per method, each core's verdict (reason '' = provable) and send types
export function goChanAudit (content: string, report: (method: string, receiver: string, reason: string, types: string[]) => void) {
    goChanCores (content, goChanMask (content), new Map (), report);
}

export function goChanSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('gochan: ' + m); } };
    const table = new Map ([ [ 'SetX', 'map[string]any' ], [ 'SetFlag', 'bool' ] ]);
    const core = (recv: string, body: string, name = 'SetX') => 'func (this *' + recv + ') ' + name + 'Async(a any, optionalArgs ...any) <-chan any {\n\tch := make(chan any, 1)\n\tgo this.' + name.charAt (0).toLowerCase () + name.slice (1) + 'Body(ch, a, optionalArgs...)\n\treturn ch\n}\nfunc (this *' + recv + ') ' + name.charAt (0).toLowerCase () + name.slice (1) + 'Body(ch chan any, a any, optionalArgs ...any) any {\n\tdefer close(ch)\n\tdefer ReturnPanicError(ch)\n' + body + '}\n';
    const good = '\tvar response map[string]any = nil\n\tif a == nil {\n\t\tch <- response\n\t\treturn nil\n\t}\n\tch <- response // unify\n\treturn nil\n';
    const out = goChanCarrierPass ('package ccxt\n\n' + core ('X', good), table);
    ok (out.includes ('SetXAsync(a any, optionalArgs ...any) <-chan EndpointResult[map[string]any] {'), 'signature');
    ok (out.includes ('ch := make(chan EndpointResult[map[string]any], 1)'), 'make');
    ok (out.includes ('setXBody(ch chan EndpointResult[map[string]any], a any'), 'body param');
    ok (out.includes ('defer ReturnPanicErrorT(ch)'), 'panic carrier');
    ok (out.split ('ch <- EndpointResult[map[string]any]{Value: response, Raw: response}').length === 3, 'every send');
    ok (out.includes ('ch <- EndpointResult[map[string]any]{Value: response, Raw: response} // unify'), 'value send');
    ok (goChanCarrierPass (out, table) === out, 'idempotent');
    const flag = goChanCarrierPass ('package ccxtpro\n\n' + core ('X', '\tch <- true\n\treturn nil\n', 'SetFlag').replace ('ReturnPanicError', 'ccxt.ReturnPanicError'), table);
    ok (flag.includes ('<-chan ccxt.EndpointResult[bool]') && flag.includes ('ccxt.ReturnPanicErrorT(ch)') && flag.includes ('ch <- ccxt.EndpointResult[bool]{Value: true, Raw: true}'), 'qualified bool core');
    const throws = (body: string, name = 'SetX') => { try { goChanCarrierPass ('package ccxt\n' + core ('X', body, name), table); return false; } catch (e) { return true; } };
    ok (throws ('\tvar r any = nil\n\tch <- r\n\treturn nil\n'), 'any local rejected');
    ok (throws ('\tgo func() { ch <- nil }()\n\treturn nil\n'), 'escaping channel rejected');
    ok (throws ('\tvar b bool = true\n\tch <- b\n\treturn nil\n'), 'wrong type rejected');
    ok (throws ('\tch <- nil\n\treturn nil\n'), 'untyped nil send rejected');
    const nt = new Map ([ [ 'SetX', 'map[string]any?' ] ]);
    const nilCore = goChanCarrierPass ('package ccxt\n' + core ('X', '\tvar r map[string]any = nil\n\tif r == nil {\n\t\tch <- nil\n\t} else {\n\t\tch <- r\n\t}\n\treturn nil\n'), nt);
    ok (nilCore.includes ('\t\tch <- EndpointResult[map[string]any]{}\n') && nilCore.includes ('<-chan EndpointResult[map[string]any] {'), 'nilable table admits nil sends');
    ok (throws ('\tr := F()\n\tch <- r\n\treturn nil\n'), 'short decl rejected');
    ok (!throws ('\tpanic(NotSupported(\"x\"))\n'), 'send-free base core');
    ok (throws ('\tvar r map[string]any = nil\n\tif a == nil {\n\t\treturn nil\n\t}\n\tch <- r\n\treturn nil\n'), 'bare return rejected');
    ok (throws ('\tvar r map[string]any = nil\n\tfor {\n\t\tpanic(\"break\")\n\t}\n\tch <- r\n\treturn nil\n'), 'break panic rejected');
    ok (throws ('\tvar r map[string]any = nil\n\tch <- r\n'), 'fall-off end rejected');
    const consumer = 'package ccxt\n\nfunc (this *Y) f() any {\n\tPanicOnError((<-this.SetXAsync(1)))\n\tvar m map[string]any = MapTyped(PanicOnError((<-this.SetXAsync(2, map[string]any{}))))\n\tx := PanicOnError((<-this.base.SetXAsync(3)))\n\ty := (<-this.SetXAsync(4))\n\tp := promiseAll([]any{this.SetXAsync(5), this.OtherAsync()})\n\tthis.Spawn(this.SetXAsync, 6)\n\tv := ListTyped(PanicOnError((<-this.SetXAsync(7))))\n\treturn []any{m, x, y, p, v}\n}\n';
    const c = goChanCarrierPass (consumer, table);
    ok (c.includes ('\t(<-this.SetXAsync(1)).Checked()\n'), 'statement Checked');
    ok (c.includes ('var m map[string]any = (<-this.SetXAsync(2, map[string]any{})).Checked()\n'), 'MapTyped Checked');
    ok (c.includes ('x := PanicOnError((<-this.base.SetXAsync(3)).Raw)'), 'boxed PanicOnError');
    ok (c.includes ('y := (<-this.SetXAsync(4)).Raw'), 'bare receive');
    ok (goChanCarrierPass ('package ccxt\n\nfunc (this *Y) f() {\n\tv := <-this.DerivedExchange.SetXAsync(1)\n\tPanicOnError(v)\n}\n', table).includes ('\tv := (<-this.DerivedExchange.SetXAsync(1)).Raw\n\tPanicOnError(v)'), 'unparenthesised receive statement');
    ok (goChanCarrierPass ('package ccxt\n\nfunc (this *Y) f() {\n\ta := (<-this.DerivedExchange.SetXAsync(1))\n\tPanicOnError(a)\n}\n', table).includes ('a := (<-this.DerivedExchange.SetXAsync(1)).Raw'), 'derived receiver');
    ok (c.includes ('[]any{EndpointRaw(this.SetXAsync(5)), this.OtherAsync()}'), 'promise list');
    ok (c.includes ('this.Spawn(this.SetXAsync, 6)'), 'method value untouched');
    const pair = goChanCarrierPass ('package ccxt\n\nfunc (this *Y) f() any {\n\th, _ := PanicOnError((<-this.PairAsync(1))).([]any)\n\tg, _ := PanicOnError((<-this.PairAsync(2))).(map[string]any)\n\treturn []any{h, g}\n}\n', new Map ([ [ 'Pair', '[]any' ] ]));
    ok (pair.includes ('\th := (<-this.PairAsync(1)).Checked()\n') && pair.includes ('g, _ := PanicOnError((<-this.PairAsync(2)).Raw).(map[string]any)'), 'asserted pair receive');
    ok (c.includes ('v := ListTyped(PanicOnError((<-this.SetXAsync(7)).Raw))'), 'mismatched ListTyped stays boxed');
    ok (goChanCarrierPass (c, table) === c, 'consumer idempotent');
    const wrapper = 'package ccxtpro\n\nfunc (this *Z) SetX(a int64, options ...SetXOptions) (map[string]any, error) {\n\topts := SetXOptionsStruct{}\n\traw := <-this.Exchange.SetXAsync(a, opts.Params)\n\tif ccxt.IsError(raw) {\n\t\treturn map[string]any{}, ccxt.CreateReturnError(raw)\n\t}\n\tvar res map[string]any = raw.(map[string]any)\n\treturn res, nil\n}\n';
    const w = goChanCarrierPass (wrapper, table);
    ok (w.includes ('\tr := <-this.Exchange.SetXAsync(a, opts.Params)\n\tif ccxt.IsError(r.Raw) {\n\t\treturn map[string]any{}, ccxt.CreateReturnError(r.Raw)\n\t}\n\tvar res map[string]any = r.Value\n'), 'typed wrapper');
    const conv = goChanCarrierPass (wrapper.replace ('var res map[string]any = raw.(map[string]any)', 'var res Order = NewOrder(raw)').replace (/\(map\[string\]any, error\)/, '(Order, error)'), table);
    ok (goChanCarrierPass (w, table) === w, 'wrapper idempotent');
    ok (goChanCarrierPass (wrapper, new Map ([ [ 'SetX', 'map[string]any?' ] ])).includes ('var res map[string]any = r.Raw.(map[string]any)'), 'nilable wrapper keeps the assertion on Raw');
    ok (conv.includes ('var res Order = NewOrder(r.Raw)'), 'converted wrapper keeps the payload');
    ok (goChanCarrierPass (consumer, new Map ()) === consumer, 'empty table no-op');
    ok ((() => { try { goChanCarrierPass ('package ccxt\n\nfunc (this *X) SetXAsync(a any) <-chan any {\n\tout := make(chan any)\n\treturn out\n}\n', table); return false; } catch (e) { return true; } }) (), 'hand shape rejected');
    const bound = goChanCarrierPass ('package ccxt\n' + core ('X', '\tif a != nil {\n\t\tch <- this.Extend(a, map[string]any{\n\t\t\t"k": 1,\n\t\t})\n\t\treturn nil\n\t}\n\tch <- map[string]any{}\n\treturn nil\n'), table);
    ok (bound.includes ('\t\tchValue := this.Extend(a, map[string]any{\n\t\t\t"k": 1,\n\t\t})\n\t\tch <- EndpointResult[map[string]any]{Value: chValue, Raw: chValue}\n\t\treturn nil'), 'bound call send');
    ok (bound.includes ('\tchValue := map[string]any{}\n\tch <- EndpointResult[map[string]any]{Value: chValue, Raw: chValue}\n'), 'bound literal send');
    ok (throws ('\tif a != nil {\n\t\tch <- this.Extend(a)\n\t}\n\tpanic(\"x\")\n'), 'bound send without return rejected');
    ok (throws ('\tch <- this.ParseOrder(a)\n\treturn nil\n'), 'any-typed call rejected');
    const ownOk = goChanCarrierPass ('package ccxt\n' + core ('X', '\tch <- this.ParseRows(a)\n\treturn nil\n') + 'func (this *X) ParseRows(a any) map[string]any {\n\treturn nil\n}\n', table);
    ok (ownOk.includes ('\tchValue := this.ParseRows(a)\n\tch <- EndpointResult[map[string]any]{Value: chValue, Raw: chValue}\n'), 'own typed call send');
    ok (throws ('\tch <- this.ParseRows(a)\n\treturn nil\n' + '}\nfunc (this *X) ParseRows(a any) any {\n\treturn nil\n'), 'own any-typed call rejected');
    ok (throws ('\tch <- this.ParseRows(a)\n\treturn nil\n' + '}\nfunc (this *Y) ParseRows(a any) map[string]any {\n\treturn nil\n'), 'other receiver call rejected');
    ok (goChanCarrierPass ('package ccxt\n' + core ('X', '\tch <- this.IndexBy(a, "network")\n\treturn nil\n'), table).includes ('chValue := this.IndexBy(a, "network")'), 'IndexBy send');
    const itf = goChanCarrierPass ('package ccxt\n\ntype I interface {\n\tSetXAsync(a any, optionalArgs ...any) <-chan any\n\tSetYAsync() <-chan any\n}\n', table);
    ok (itf.includes ('\tSetXAsync(a any, optionalArgs ...any) <-chan EndpointResult[map[string]any]\n\tSetYAsync() <-chan any\n'), 'interface line');
    return problems;
}

// hand-written files are not regenerated: `npx tsx build/go-chan.ts --apply-hand` retypes the tabled
// interface lines in go/v4/exchange_interface.go and lists every other hand-written reference
function goChanApplyHand () {
    const dir = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'go', 'v4');
    const table = goChanTable ();
    const names = [ ...table.keys () ];
    const iface = path.join (dir, 'exchange_interface.go');
    const text = fs.readFileSync (iface, 'utf8');
    fs.writeFileSync (iface, goChanCarrierPass (text, table));
    const ref = new RegExp ('\\b(' + names.join ('|') + ')Async\\b');
    for (const f of fs.readdirSync (dir).filter ((x) => /^exchange.*\.go$/.test (x) && x !== 'exchange_interface.go')) {
        const body = fs.readFileSync (path.join (dir, f), 'utf8');
        if (body.indexOf ('PLEASE DO NOT EDIT THIS FILE') >= 0 || /^\/\/ Code generated/m.test (body)) {
            continue;
        }
        body.split ('\n').forEach ((l, i) => { if (names.length && ref.test (l)) { console.log ('HAND-REF ' + f + ':' + (i + 1) + ': ' + l.trim ()); } });
    }
}

if (process.argv[1] && fileURLToPath (import.meta.url) === path.resolve (process.argv[1])) {
    if (process.argv.includes ('--self-test')) {
        const problems = goChanSelfTest ();
        console.log (problems.length ? problems.join ('\n') : 'GOCHAN SELF-TEST PASSED');
        process.exit (problems.length ? 3 : 0);
    }
    if (process.argv.includes ('--apply-hand')) {
        goChanApplyHand ();
    }
}
