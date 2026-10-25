// HX10 W5 G05: `this.Ohlcvs` holds one book per symbol and a book is the plain map of its
// timeframes, so the helper calls the printer emits around a book become the native map
// operation: an index read, an index assignment, `delete`, the comma-ok of InOp. A key or a book
// whose Go type is not proven keeps the helper call (a guard is emitted where the helper's own
// nil tolerance needs one). Nothing here pastes a helper body.
import { goChanMask, goChanClose } from './go-chan.js';

// a cache stored per symbol with no timeframe level (alpaca streams 1m bars) lives under the
// timeframe its stream carries, so the book keeps one shape for every venue
const FLAT_KEY = '1m';
const READ_CALLS = /(?<!\w)(?:ccxt\.|this\.)?(?:GetValue|SafeValue|SafeDict|SafeList)\(/g;
const OUTER_READS = /(?<!\w)(?:ccxt\.|this\.)?(?:GetValue|SafeValue|SafeDict)\(this\.Ohlcvs, /g;
const WRITE_LINE = /^(\s*)(?:ccxt\.)?AddElementToObject\(/;
const REMOVE_LINE = /^(\s*)(?:ccxt\.)?Remove\(/;

type Decl = { 'type': string, 'line': number };

// every declaration of a name in the function, in line order: a name may be declared again in a
// later block, so a site resolves the one in its own block
type Decls = Map<string, Decl[]>;

type Span = { s: number, e: number };

// `func (this *X) Name(a *string, b any)` -> [['a','*string'], ...] for the parameters only
function g05Params (signature: string): Array<[ string, string ]> {
    const out: Array<[ string, string ]> = [];
    const open = signature.indexOf ('(', signature.indexOf (')') + 1);
    if (open < 0) {
        return out;
    }
    const close = goChanClose (signature, open);
    if (close < 0) {
        return out;
    }
    let lastType: string | undefined;
    for (const span of g05Split (signature, open, close)) {
        const part = signature.substring (span.s, span.e).trim ();
        if (part === '') {
            continue;
        }
        const tokens = part.split (/\s+/);
        if (tokens.length >= 2) {
            lastType = tokens.slice (1).join (' ').replace (/^\.\.\./, '');
            out.push ([ tokens[0], lastType ]);
        } else if (lastType !== undefined) {
            out.push ([ part, lastType ]); // grouped names: `a, b string`
        }
    }
    return out;
}

// top-level comma split of [open+1, close-1)
function g05Split (masked: string, open: number, close: number): Span[] {
    const spans: Span[] = [];
    let depth = 0;
    let s = open + 1;
    for (let i = open + 1; i < close - 1; i++) {
        const c = masked[i];
        if ('({['.indexOf (c) >= 0) {
            depth++;
        } else if (')}]'.indexOf (c) >= 0) {
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            spans.push ({ 's': s, 'e': i });
            s = i + 1;
        }
    }
    spans.push ({ 's': s, 'e': close - 1 });
    return spans;
}

// every declaration of a name in the function, with the line it is declared on
function g05Decls (body: string[], signature: string): Decls {
    const decls: Decls = new Map ();
    const add = (name: string, type: string, line: number) => {
        const list = decls.get (name) ?? [];
        list.push ({ 'type': type, 'line': line });
        decls.set (name, list);
    };
    for (const [ name, type ] of g05Params (signature)) {
        add (name, type, 0);
    }
    body.forEach ((line, index) => {
        const declaration = /^\s*var (\w+) ([^=\n]+?) = /.exec (line);
        if (declaration !== null) {
            add (declaration[1], declaration[2].trim (), index);
        }
    });
    return decls;
}

// the type a name carries at `siteLine`: the declaration in the innermost block still open there,
// so a name redeclared in a later block does not hide the one the site reads
function g05TypeAt (maskedBody: string[], decls: Decls, name: string, siteLine: number): string | undefined {
    const list = decls.get (name);
    if (list === undefined) {
        return undefined;
    }
    const siteDepth = g05DepthBefore (maskedBody, siteLine);
    let best: Decl | undefined;
    let bestDepth = -1;
    let tied = false;
    for (const decl of list) {
        if (decl.line > siteLine) {
            continue;
        }
        const depth = (decl.line === 0) ? 0 : g05DepthBefore (maskedBody, decl.line);
        if ((depth > siteDepth) || !g05StillOpen (maskedBody, decl.line, siteLine, depth)) {
            continue;
        }
        if (depth > bestDepth) {
            best = decl;
            bestDepth = depth;
            tied = false;
        } else if (depth === bestDepth) {
            tied = true;
        }
    }
    return ((best === undefined) || tied) ? undefined : best.type;
}

function g05DepthBefore (maskedBody: string[], line: number): number {
    let depth = 0;
    for (let k = 0; k < line; k++) {
        depth += (maskedBody[k].split ('{').length - maskedBody[k].split ('}').length);
    }
    return depth;
}

// the block at `depth` holding line `from` is still open at `to` (no line between closes it)
function g05BlockOpen (maskedBody: string[], from: number, to: number, depth: number): boolean {
    for (let j = from + 1; j < to; j++) {
        if (maskedBody[j].trimStart ().startsWith ('}') && (g05DepthBefore (maskedBody, j) === depth + 1)) {
            return false;
        }
    }
    return true;
}

// the block a STATEMENT at `depth` sits in is still open at `to`: its closing brace would be the
// first one at that same depth (a guard line's body is one level deeper, so g05BlockOpen serves it)
function g05StillOpen (maskedBody: string[], from: number, to: number, depth: number): boolean {
    for (let j = from + 1; j < to; j++) {
        if (maskedBody[j].trimStart ().startsWith ('}') && (g05DepthBefore (maskedBody, j) === depth)) {
            return false;
        }
    }
    return true;
}

// an `if k != nil {` block (or `if (k != nil) && x {`) enclosing the site proves the pointer non-nil
function g05NilGuarded (key: string, maskedBody: string[], siteLine: number): boolean {
    const guard = new RegExp ('^\\s*if .*(?<![\\w.])' + key + ' != nil\\b');
    const siteDepth = g05DepthBefore (maskedBody, siteLine);
    for (let k = siteLine - 1; k >= 0; k--) {
        const depth = g05DepthBefore (maskedBody, k);
        if ((depth >= siteDepth) || !guard.test (maskedBody[k]) || /\|\|/.test (maskedBody[k])) {
            continue;
        }
        if (g05BlockOpen (maskedBody, k, siteLine, depth)) {
            return true;
        }
    }
    return false;
}

// the Go key a site can dereference: a literal, a `string`, or a `*string` some earlier deref or
// enclosing nil guard proves non-nil. `guard` names the pointer an emitted guard must test.
type Key = { text: string, guard?: string };

function g05Key (maskedBody: string[], decls: Decls, key: string, siteLine: number): Key | undefined {
    if (key.startsWith ('"')) {
        return { 'text': key };
    }
    const type = g05TypeAt (maskedBody, decls, key, siteLine);
    if (type === undefined) {
        return undefined;
    }
    if (type === 'string') {
        return { 'text': key };
    }
    if (type !== '*string') {
        return undefined;
    }
    if (g05NilGuarded (key, maskedBody, siteLine)) {
        return { 'text': '*' + key };
    }
    const deref = new RegExp ('(?<![\\w*.])[*]' + key + '\\b');
    const siteDepth = g05DepthBefore (maskedBody, siteLine);
    for (let k = 0; k < siteLine; k++) {
        if (!deref.test (maskedBody[k])) {
            continue;
        }
        const depth = g05DepthBefore (maskedBody, k);
        if ((depth > siteDepth) || !g05StillOpen (maskedBody, k, siteLine, depth)) {
            continue; // a deeper block, or one the site has already left
        }
        return { 'text': '*' + key };
    }
    return { 'text': '*' + key, 'guard': key };
}

type Call = { at: number, name: string, open: number, close: number, args: Span[] };

function g05CallAt (maskedLine: string, at: number, name: string): Call | undefined {
    const open = at + maskedLine.substring (at).indexOf ('(');
    if (open < at) {
        return undefined;
    }
    const close = goChanClose (maskedLine, open);
    if (close < 0) {
        return undefined;
    }
    return { at, name, open, close, 'args': g05Split (maskedLine, open, close) };
}

function g05End (maskedLine: string, close: number): boolean {
    return /^\s*$/.test (maskedLine.substring (close));
}

// A book: the field entry `this.Ohlcvs[k]`, or a local retyped to the book map. `done` marks the
// book a site can write into without a nil test (created by the emitted ensure).
type Book = { native: string, end: number, guard: boolean, keyGuard?: string };

function g05Book (line: string, maskedLine: string, at: number, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>, flat: Set<string>): Book | undefined {
    // `this.Ohlcvs[k]` already carries the deref the printer proved
    if (maskedLine.startsWith ('this.Ohlcvs[', at)) {
        const open = at + 'this.Ohlcvs'.length;
        const close = goChanClose (maskedLine, open);
        if (close < 0) {
            return undefined;
        }
        return { 'native': line.substring (at, close), 'end': close, 'guard': true };
    }
    const head = /^(?:ccxt\.|this\.)?(GetValue|SafeValue|SafeDict)\(/.exec (maskedLine.substring (at));
    if (head === null) {
        // a retyped book local used as the receiver
        const name = /^(\w+)(?=[,)\]])/.exec (maskedLine.substring (at))?.[1];
        if ((name === undefined) || !books.has (name)) {
            return undefined;
        }
        return { 'native': name, 'end': at + name.length, 'guard': !books.get (name) };
    }
    const call = g05CallAt (maskedLine, at, head[1]);
    if ((call === undefined) || (call.args.length < 2) || (call.args.length > 3)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    if ((args[0] !== 'this.Ohlcvs') || (call.args.length === 3 && args[2] !== 'map[string]any{}')) {
        return undefined;
    }
    const key = g05Key (maskedBody, decls, args[1] ?? '', index);
    if (key === undefined) {
        return undefined;
    }
    return { 'native': 'this.Ohlcvs[' + key.text + ']', 'end': call.close, 'guard': true, 'keyGuard': key.guard };
}

// the book a site writes into exists: an ensure or a store of this key is still in scope, or the
// enclosing condition proved the key present
function g05BookExists (book: string, maskedBody: string[], index: number): boolean {
    const key = book.substring (book.indexOf ('[') + 1, book.length - 1);
    const escaped = key.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    const target = 'this\\.Ohlcvs\\[' + escaped + '\\]';
    // a store of this book: the native assignment, and the two helper idioms the printer emits for it
    const ensure = new RegExp ('^\\s*(?:' + target + ' = |(?:ccxt\\.)?AddElementToObject\\(this\\.Ohlcvs, ' + escaped + ', )');
    const has = new RegExp ('(?<![\\w.])(?:[\\w.]*\\.)?InOp\\(' + target + ', ');
    const siteDepth = g05DepthBefore (maskedBody, index);
    for (let k = index - 1; k >= 0; k--) {
        const depth = g05DepthBefore (maskedBody, k);
        if (!g05StillOpen (maskedBody, k, index, depth)) {
            continue;
        }
        const line = maskedBody[k];
        if (ensure.test (line) && (depth <= siteDepth)) {
            return true;
        }
        if ((depth < siteDepth) && (/^\s*if /.test (line)) && has.test (line)) {
            return true;
        }
    }
    return false;
}

// the key was created by a closed `if <test of the key> { <store> }` block above the site: the
// comma-ok idiom `if _, ok := m[k]; !ok { m[k] = ... }` and the emitted `if m[k] == nil { ... }`
function g05BookPresent (book: string, maskedBody: string[], index: number): boolean {
    if (g05BookExists (book, maskedBody, index)) {
        return true;
    }
    const key = book.substring (book.indexOf ('[') + 1, book.length - 1);
    const escaped = key.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    const target = 'this\\.Ohlcvs\\[' + escaped + '\\]';
    const store = new RegExp ('^\\s*' + target + ' = (?:map\\[string\\]any\\{\\}|\\w+)\\s*$');
    const test = new RegExp ('^\\s*if .*?' + target);
    for (let k = index - 1; k >= 0; k--) {
        if (!test.test (maskedBody[k])) {
            continue;
        }
        const depth = g05DepthBefore (maskedBody, k);
        // the block closed before the site, and it stored a book for the key
        let closed = -1;
        for (let m = k + 1; m < index; m++) {
            if ((g05DepthBefore (maskedBody, m) === depth) && maskedBody[m].trimStart ().startsWith ('}')) {
                closed = m;
                break;
            }
        }
        if (closed < 0) {
            continue;
        }
        for (let m = k + 1; m < closed; m++) {
            if (store.test (maskedBody[m])) {
                return true;
            }
        }
    }
    return false;
}

// the statement behind one `if` holding every guard: a nil test short-circuits the ones after it
function g05Wrap (indent: string, guards: string[], statement: string[]): string[] {
    if (guards.length === 0) {
        return statement.map (text => indent + text);
    }
    const out: string[] = [ indent + 'if ' + guards.join (' && ') + ' {' ];
    for (const text of statement) {
        out.push (indent + '\t' + text);
    }
    out.push (indent + '}');
    return out;
}

// guards the site needs, outermost first: the book's own nil test, then its inner key
function g05Guards (book: Book, inner: Key): string[] {
    const guards: string[] = [];
    if (book.keyGuard !== undefined) {
        guards.push (book.keyGuard + ' != nil');
    }
    if (inner.guard !== undefined) {
        guards.push (inner.guard + ' != nil');
    }
    return guards;
}

// `<book>[k]` written as a single statement, guarded when the book may be absent (the helper is a
// no-op then) and the key may be nil
function g05Write (indent: string, book: Book, inner: Key, value: string, maskedBody: string[], index: number, books: Map<string, boolean>): string[] {
    const target = book.native + '[' + inner.text + ']';
    const guards = g05Guards (book, inner);
    const open = books.has (book.native) ? (books.get (book.native) === true) : (book.keyGuard === undefined && g05BookPresent (book.native, maskedBody, index));
    if (book.guard && !open) {
        guards.push (book.native + ' != nil');
    }
    if (guards.length > 0) {
        return g05Wrap (indent, guards, [ target + ' = ' + value ]);
    }
    return [ indent + target + ' = ' + value ];
}

// locals the function stores into the book as a whole book: the read retypes them to the book map
function g05StoredLocals (body: string[], maskedBody: string[]): Set<string> {
    const out = new Set<string> ();
    for (const line of maskedBody) {
        const store = /^\s*(?:ccxt\.)?AddElementToObject\(this\.Ohlcvs, \w+, (\w+)\)\s*$/.exec (line);
        if (store !== null) {
            out.add (store[1]);
        }
    }
    return out;
}

// a local read out of the book as the stored value itself (no timeframe level) and written back:
// the value is not a book, so the book keeps it under the flat key
function g05FlatLocals (body: string[], maskedBody: string[], decls: Decls): Set<string> {
    const stored = g05StoredLocals (body, maskedBody);
    const flat = new Set<string> ();
    maskedBody.forEach ((line, index) => {
        const read = /^\s*var (\w+) any = (?:ccxt\.|this\.)?(?:SafeValue|GetValue)\(this\.Ohlcvs, \w+\)\s*$/.exec (line);
        if ((read !== null) && stored.has (read[1]) && (g05TypeAt (maskedBody, decls, read[1], index) !== undefined)) {
            flat.add (read[1]);
        }
    });
    return flat;
}

// the store line of a whole book: `AddElementToObject(this.Ohlcvs, k, local)` -> `this.Ohlcvs[k] = local`
function g05BookStore (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, bookLocals: Set<string>): string[] | undefined {
    const store = /^(\s*)(?:ccxt\.)?AddElementToObject\(this\.Ohlcvs, (\w+), (\w+)\)\s*$/.exec (maskedLine);
    if (store === null) {
        return undefined;
    }
    const local = store[3];
    if (!bookLocals.has (local)) {
        return undefined; // not a book the read above retyped
    }
    const key = g05Key (maskedBody, decls, store[2], index);
    if (key === undefined) {
        return undefined;
    }
    const target = 'this.Ohlcvs[' + key.text + '] = ' + local;
    return (key.guard === undefined) ? [ store[1] + target ] : g05Wrap (store[1], [ key.guard + ' != nil' ], [ target ]);
}

// the helper's ensure idiom: `AddElementToObject(this.Ohlcvs, k, SafeDict/SafeValue(this.Ohlcvs, k[, {}]))`
function g05Ensure (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number): string[] | undefined {
    const ensure = /^(\s*)(?:ccxt\.)?AddElementToObject\(this\.Ohlcvs, (\w+), (?:ccxt\.|this\.)?(?:SafeValue|SafeDict|GetValue)\(this\.Ohlcvs, \w+(?:, map\[string\]any\{\})?\)\)\s*$/.exec (maskedLine);
    if (ensure === null) {
        return undefined;
    }
    const key = g05Key (maskedBody, decls, ensure[2], index);
    if (key === undefined) {
        return undefined;
    }
    const target = 'this.Ohlcvs[' + key.text + ']';
    const cond = ((key.guard === undefined) ? '' : key.guard + ' != nil && ') + target + ' == nil';
    return [ ensure[1] + 'if ' + cond + ' {', ensure[1] + '\t' + target + ' = map[string]any{}', ensure[1] + '}' ];
}

// `this.Ohlcvs[k] = SafeDict(this.Ohlcvs, k, {})`: the helper re-stores the book it found and
// creates an empty one, so the native form is the ensure
function g05EnsureAssign (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number): string[] | undefined {
    const assign = /^(\s*)this\.Ohlcvs\[([^\]]+)\] = (?:ccxt\.|this\.)?SafeDict\(this\.Ohlcvs, \w+, map\[string\]any\{\}\)\s*$/.exec (maskedLine);
    if (assign === null) {
        return undefined;
    }
    const target = 'this.Ohlcvs[' + assign[2] + ']';
    return [ assign[1] + 'if ' + target + ' == nil {', assign[1] + '\t' + target + ' = map[string]any{}', assign[1] + '}' ];
}

// `var x any = <book>` / `var x any = SafeDict(<book>, k, {})`: the book has a static type now
function g05BookRead (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>): string[] | undefined {
    const declaration = /^(\s*)var (\w+) any = /.exec (maskedLine);
    const read = declaration;
    if (read === null) {
        return undefined;
    }
    const book = g05Book (line, maskedLine, read[0].length, decls, maskedBody, index, books, new Set<string> ());
    if ((book === undefined) || !/^\s*$/.test (maskedLine.substring (book.end))) {
        return undefined;
    }
    const target = book.native;
    const typed = read[1] + 'var ' + read[2] + ' map[string]any';
    const guarded = (book.keyGuard === undefined) ? [ typed + ' = ' + target ] : [ typed, read[1] + 'if ' + book.keyGuard + ' != nil {', read[1] + '\t' + read[2] + ' = ' + target, read[1] + '}' ];
    const tail = /^(\s*)var (\w+) any = (?:ccxt\.|this\.)?SafeDict\(this\.Ohlcvs, \w+, map\[string\]any\{\}\)\s*$/.test (maskedLine);
    if (tail) {
        // SafeDict created an empty book for the caller; the read keeps that default
        return [ ...guarded, read[1] + 'if ' + read[2] + ' == nil {', read[1] + '\t' + read[2] + ' = map[string]any{}', read[1] + '}' ];
    }
    return guarded;
}

// the flat read: `var x any = GetValue/SafeValue(this.Ohlcvs, k)` -> `<book>[FLAT_KEY]`
function g05FlatRead (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, flat: Set<string>): string[] | undefined {
    const read = /^(\s*)var (\w+) any = (?:ccxt\.|this\.)?(?:SafeValue|GetValue)\(this\.Ohlcvs, (\w+)\)\s*$/.exec (maskedLine);
    if ((read === null) || !flat.has (read[2]) || !/^this\.Ohlcvs\[(\*)?(\w+)\]$/.test ('this.Ohlcvs[*' + read[3] + ']')) {
        return undefined;
    }
    const key = g05Key (maskedBody, decls, read[3], index);
    if ((key === undefined) || (key.guard === undefined)) {
        return undefined;
    }
    const target = 'this.Ohlcvs[' + key.text + ']["' + FLAT_KEY + '"]';
    return [ read[1] + 'var ' + read[2] + ' any', read[1] + 'if ' + key.guard + ' != nil {', read[1] + '\t' + read[2] + ' = ' + target, read[1] + '}' ];
}

function g05FlatWrite (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, flat: Set<string>): string[] | undefined {
    const write = /^(\s*)(?:ccxt\.)?AddElementToObject\(this\.Ohlcvs, (\w+), (\w+)\)\s*$/.exec (maskedLine);
    if ((write === null) || !flat.has (write[3])) {
        return undefined;
    }
    const key = g05Key (maskedBody, decls, write[2], index);
    if ((key === undefined) || (key.guard === undefined)) {
        return undefined;
    }
    const book = 'this.Ohlcvs[' + key.text + ']';
    return g05Wrap (write[1], [ key.guard + ' != nil' ], [
        'if ' + book + ' == nil {',
        '\t' + book + ' = map[string]any{}',
        '}',
        book + '["' + FLAT_KEY + '"] = ' + write[3],
    ]);
}

// `var x T = <read of a book entry>` (and its assignment form): the entry read is an index
function g05EntryRead (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>): string[] | undefined {
    const declaration = /^(\s*)var (\w+) (\S+) = /.exec (maskedLine);
    const assignment = /^(\s*)(\w+) = /.exec (maskedLine);
    const head = declaration ?? assignment;
    if (head === null) {
        return undefined;
    }
    const from = head[0].length;
    const read = g05EntryCall (line, maskedLine, from, decls, maskedBody, index, books);
    if ((read === undefined) || !/^\s*$/.test (maskedLine.substring (read.end))) {
        return undefined;
    }
    if (read.guardsReviewed === false) {
        return undefined;
    }
    const guards = read.guards;
    if (guards.length === 0) {
        return [ line.substring (0, from) + read.text ];
    }
    const name = head[2];
    if (declaration !== null) {
        const out = [ declaration[1] + 'var ' + name + ' ' + declaration[3] ];
        out.push (...g05Wrap (declaration[1], guards, [ name + ' = ' + read.text ]));
        return out;
    }
    return g05Wrap (assignment[1], guards, [ name + ' = ' + read.text ]);
}

type Entry = { text: string, end: number, guards: string[], guardsReviewed: boolean };

// `<read>(<book>, key)` for any of the read helpers, with the guards the emission needs
function g05EntryCall (line: string, maskedLine: string, at: number, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>): Entry | undefined {
    const head = /^(?:ccxt\.|this\.)?(GetValue|SafeValue|SafeDict|SafeList)\(/.exec (maskedLine.substring (at));
    if (head === null) {
        return undefined;
    }
    const call = g05CallAt (maskedLine, at, head[1]);
    if ((call === undefined) || (call.args.length !== 2)) {
        return undefined;
    }
    const book = g05Book (line, maskedLine, call.args[0].s, decls, maskedBody, index, books, new Set<string> ());
    if ((book === undefined) || !/^\s*$/.test (maskedLine.substring (book.end, call.args[0].e))) {
        return undefined;
    }
    const innerText = line.substring (call.args[1].s, call.args[1].e).trim ();
    const inner = g05Key (maskedBody, decls, innerText, index);
    if (inner === undefined) {
        return undefined;
    }
    const guards: string[] = [];
    if (book.keyGuard !== undefined) {
        guards.push (book.keyGuard + ' != nil');
    }
    if (inner.guard !== undefined) {
        guards.push (inner.guard + ' != nil');
    }
    return { 'text': book.native + '[' + inner.text + ']', 'end': call.close, 'guards': guards, 'guardsReviewed': true };
}

// a statement write of one book entry
function g05EntryWrite (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>): string[] | undefined {
    const head = WRITE_LINE.exec (maskedLine);
    if (head === null) {
        return undefined;
    }
    const call = g05CallAt (maskedLine, head[0].indexOf ('AddElementToObject'), 'AddElementToObject');
    if ((call === undefined) || (call.args.length !== 3) || !g05End (maskedLine, call.close)) {
        return undefined;
    }
    const book = g05Book (line, maskedLine, call.args[0].s, decls, maskedBody, index, books, new Set<string> ());
    if ((book === undefined) || !/^\s*$/.test (maskedLine.substring (book.end, call.args[0].e))) {
        return undefined;
    }
    const innerText = line.substring (call.args[1].s, call.args[1].e).trim ();
    const inner = g05Key (maskedBody, decls, innerText, index);
    if (inner === undefined) {
        return undefined;
    }
    const value = line.substring (call.args[2].s, call.args[2].e).trim ();
    return g05Write (head[1], book, inner, value, maskedBody, index, books);
}

// a statement delete of one book entry: Remove panics on a nil key and on a nil book
function g05EntryDelete (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>): string[] | undefined {
    const head = REMOVE_LINE.exec (maskedLine);
    if (head === null) {
        return undefined;
    }
    const call = g05CallAt (maskedLine, head[0].indexOf ('Remove'), 'Remove');
    if ((call === undefined) || (call.args.length !== 2) || !g05End (maskedLine, call.close)) {
        return undefined;
    }
    const book = g05Book (line, maskedLine, call.args[0].s, decls, maskedBody, index, books, new Set<string> ());
    if ((book === undefined) || !/^\s*$/.test (maskedLine.substring (book.end, call.args[0].e))) {
        return undefined;
    }
    const innerText = line.substring (call.args[1].s, call.args[1].e).trim ();
    const inner = g05Key (maskedBody, decls, innerText, index);
    if ((inner === undefined) || (inner.guard !== undefined) || (book.keyGuard !== undefined)) {
        return undefined;
    }
    const open = books.has (book.native) ? (books.get (book.native) === true) : (!book.guard || g05BookPresent (book.native, maskedBody, index));
    if (!open) {
        return undefined;
    }
    return [ head[1] + 'delete(' + book.native + ', ' + inner.text + ')' ];
}

// `if InOp(<book>, k) {` -> `if _, ok := <book>[k]; ok {`
function g05EntryInOp (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>): string[] | undefined {
    const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (maskedLine);
    if (cond === null) {
        return undefined;
    }
    const calls = [ ...maskedLine.matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
    if (calls.length !== 1) {
        return undefined;
    }
    const call = g05CallAt (maskedLine, calls[0].index, 'InOp');
    if ((call === undefined) || (call.args.length !== 2)) {
        return undefined;
    }
    const book = g05Book (line, maskedLine, call.args[0].s, decls, maskedBody, index, books, new Set<string> ());
    if ((book === undefined) || !/^\s*$/.test (maskedLine.substring (book.end, call.args[0].e))) {
        return undefined;
    }
    const innerText = line.substring (call.args[1].s, call.args[1].e).trim ();
    const inner = g05Key (maskedBody, decls, innerText, index);
    if ((inner === undefined) || (inner.guard !== undefined) || (book.keyGuard !== undefined)) {
        return undefined;
    }
    const prefixed = line.substring (cond[1].length, call.at);
    const before = prefixed.endsWith ('ccxt.') ? prefixed.substring (0, prefixed.length - 5) : prefixed;
    const after = line.substring (call.close, cond[1].length + cond[2].length);
    // only the bare call (or its `!(...)` form): a compound condition may guard the deref of a
    // pointer key with a short circuit the comma-ok would evaluate anyway
    if (!((before === '' && after === '') || (before === '!(' && after === ')'))) {
        return undefined;
    }
    if (/\bok\b/.test (before + after)) {
        return undefined;
    }
    const rest = (before + 'ok' + after).replace (/(^|[^\w)\]])(\(ok\))/g, '$1ok');
    return [ cond[1] + '_, ok := ' + book.native + '[' + inner.text + ']; ' + rest + line.substring (cond[1].length + cond[2].length) ];
}

// every `<read>(<book>, k)` left in an expression: the entry read is an index
function g05NestedReads (line: string, maskedLine: string, decls: Decls, maskedBody: string[], index: number, books: Map<string, boolean>): string {
    let text = line;
    let masked = maskedLine;
    for (let guard = 0; guard < 8; guard++) {
        let changed = false;
        READ_CALLS.lastIndex = 0;
        let m = READ_CALLS.exec (masked);
        while (m !== null) {
            const entry = g05EntryCall (text, masked, m.index, decls, maskedBody, index, books);
            if ((entry !== undefined) && (entry.guards.length === 0)) {
                text = text.substring (0, m.index) + entry.text + text.substring (entry.end);
                masked = goChanMask (text);
                changed = true;
                break;
            }
            m = READ_CALLS.exec (masked);
        }
        if (!changed) {
            break;
        }
    }
    // an outer read of the book itself: GetValue/SafeValue/SafeDict(this.Ohlcvs, k) -> this.Ohlcvs[k]
    for (let guard = 0; guard < 8; guard++) {
        OUTER_READS.lastIndex = 0;
        const m = OUTER_READS.exec (masked);
        if (m === null) {
            break;
        }
        const call = g05CallAt (masked, m.index, 'GetValue');
        if ((call === undefined) || (call.args.length < 2)) {
            break;
        }
        const keyText = text.substring (call.args[1].s, call.args[1].e).trim ();
        const key = g05Key (maskedBody, decls, keyText, index);
        if ((key === undefined) || (key.guard !== undefined)) {
            break;
        }
        text = text.substring (0, m.index) + 'this.Ohlcvs[' + key.text + ']' + text.substring (call.close);
        masked = goChanMask (text);
    }
    return text;
}

function g05Line (body: string[], maskedBody: string[], decls: Decls, books: Map<string, boolean>, flat: Set<string>, index: number): string[] {
    const line = body[index];
    let maskedLine = goChanMask (line);
    if (!/Ohlcvs/.test (maskedLine)) {
        return [ line ];
    }
    const flatRead = g05FlatRead (line, maskedLine, decls, maskedBody, index, flat);
    if (flatRead !== undefined) {
        return flatRead;
    }
    const flatWrite = g05FlatWrite (line, maskedLine, decls, maskedBody, index, flat);
    if (flatWrite !== undefined) {
        return flatWrite;
    }
    const ensureAssign = g05EnsureAssign (line, maskedLine, decls, maskedBody, index);
    if (ensureAssign !== undefined) {
        return ensureAssign;
    }
    const ensure = g05Ensure (line, maskedLine, decls, maskedBody, index);
    if (ensure !== undefined) {
        return ensure;
    }
    const bookStore = g05BookStore (line, maskedLine, decls, maskedBody, index, new Set (books.keys ()));
    if (bookStore !== undefined) {
        return bookStore;
    }
    const bookRead = g05BookRead (line, maskedLine, decls, maskedBody, index, books);
    if (bookRead !== undefined) {
        const name = /^\s*var (\w+) /.exec (maskedLine)?.[1];
        if (name !== undefined) {
            books.set (name, bookRead.length > 1);
        }
        return bookRead;
    }
    const write = g05EntryWrite (line, maskedLine, decls, maskedBody, index, books);
    if (write !== undefined) {
        return write;
    }
    const remove = g05EntryDelete (line, maskedLine, decls, maskedBody, index, books);
    if (remove !== undefined) {
        return remove;
    }
    const inop = g05EntryInOp (line, maskedLine, decls, maskedBody, index, books);
    if (inop !== undefined) {
        return inop;
    }
    const entryRead = g05EntryRead (line, maskedLine, decls, maskedBody, index, books);
    if (entryRead !== undefined) {
        return entryRead;
    }
    return [ g05NestedReads (line, maskedLine, decls, maskedBody, index, books) ];
}

// one sweep; a second one reads the ensures the first emitted
function g05once (content: string): string {
    if (content.indexOf ('this.Ohlcvs') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let k = 0;
    const out: string[] = [];
    // two rounds: the ensure a site emits in round one proves its book in round two
    while (k < lines.length) {
        if (!lines[k].startsWith ('func ')) {
            out.push (lines[k]);
            k++;
            continue;
        }
        let end = k;
        while ((end < lines.length) && (lines[end] !== '}')) {
            end++;
        }
        const body = lines.slice (k, end + 1);
        const maskedBody = masked.slice (k, end + 1);
        const decls = g05Decls (body, body[0]);
        const books = new Map<string, boolean> ();
        const flat = g05FlatLocals (body, maskedBody, decls);
        out.push (body[0]);
        for (let i = 1; i < body.length; i++) {
            const rewritten = g05Line (body, maskedBody, decls, books, flat, i);
            out.push (...rewritten);
            if (rewritten.length === 1) {
                body[i] = rewritten[0];
                maskedBody[i] = goChanMask (rewritten[0]);
            }
        }
        k = end + 1;
    }
    return out.join ('\n');
}

export function hx10w5G05Pass (content: string): string {
    return g05once (g05once (content));
}

// self-check: the two outcomes per site -- proven type -> the native op, else the helper call
export function g05check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10w5-G05: ' + message); } };
    const f = (sig: string, body: string) => hx10w5G05Pass ('func (this *X) H(' + sig + ') {\n' + body + '}\n');
    const both = 'symbol *string, timeframe *string';
    const hash = '\tvar messageHash *string = ccxt.SafeStringPtr(ccxt.Add("candles:"+*symbol+":", timeframe))\n';
    const proven = '\tvar messageHash string = "ohlcv:" + *symbol + ":" + *timeframe\n';
    // a book entry read is an index; an unproven timeframe keeps the helper's nil test around it
    ok (f (both, hash + '\tvar stored any = this.SafeValue(this.Ohlcvs[*symbol], timeframe)\n').indexOf ('\tvar stored any\n\tif timeframe != nil {\n\t\tstored = this.Ohlcvs[*symbol][*timeframe]\n\t}') >= 0,
        'a book entry read goes native behind the key nil test');
    ok (f (both, hash + '\tstored = this.SafeValue(this.Ohlcvs[*symbol], timeframe)\n').indexOf ('\t\tstored = this.Ohlcvs[*symbol][*timeframe]') >= 0,
        'an assignment form goes native');
    ok (f (both, hash + '\tvar stored any = ccxt.GetValue(ccxt.GetValue(this.Ohlcvs, symbol), timeframe)\n').indexOf ('stored = this.Ohlcvs[*symbol][*timeframe]') >= 0,
        'a nested GetValue read goes native');
    // writes: into an ensured book, and into a book that may be absent (the helper was a no-op there)
    ok (f (both, '\tif _, ok := this.Ohlcvs[*symbol]; !ok {\n\t\tthis.Ohlcvs[*symbol] = map[string]any{}\n\t}\n\tif timeframe != nil {\n\t\tccxt.AddElementToObject(this.Ohlcvs[*symbol], timeframe, stored)\n\t}\n').indexOf ('\t\tthis.Ohlcvs[*symbol][*timeframe] = stored') >= 0,
        'an entry write goes native');
    ok (f (both, '\tccxt.AddElementToObject(this.Ohlcvs[*symbol], timeframe, stored)\n').indexOf ('\tif timeframe != nil && this.Ohlcvs[*symbol] != nil {\n\t\tthis.Ohlcvs[*symbol][*timeframe] = stored') >= 0,
        'an entry write into an unproven book keeps the helper no-op as a nil test');
    // delete: the helper panics on an absent book and on a nil key, so both need a proof
    ok (f (both, '\tthis.Ohlcvs[*symbol] = map[string]any{}\n' + proven + '\tccxt.Remove(this.Ohlcvs[*symbol], timeframe)\n').indexOf ('\tdelete(this.Ohlcvs[*symbol], *timeframe)') >= 0,
        'an entry delete goes native once the book exists');
    ok (f (both, hash + '\tccxt.Remove(this.Ohlcvs[*symbol], timeframe)\n').indexOf ('ccxt.Remove(this.Ohlcvs[*symbol], timeframe)') >= 0,
        'Remove on a book that may be absent keeps the helper');
    // InOp is the comma-ok of the entry
    ok (f (both, proven + '\tif !(ccxt.InOp(ccxt.GetValue(this.Ohlcvs, symbol), timeframe)) {\n\t}\n').indexOf ('\tif _, ok := this.Ohlcvs[*symbol][*timeframe]; !ok {') >= 0,
        'InOp on a book entry is the comma-ok');
    // the whole-book idioms: the helper re-stored the book it found, so native is the nil test
    ok (f ('symbol *string', '\tthis.Ohlcvs[*symbol] = this.SafeDict(this.Ohlcvs, symbol, map[string]any{})\n').indexOf ('\tif this.Ohlcvs[*symbol] == nil {\n\t\tthis.Ohlcvs[*symbol] = map[string]any{}\n\t}') >= 0,
        'the whole-book store is an ensure');
    ok (f ('symbol *string', '\tccxt.AddElementToObject(this.Ohlcvs, symbol, this.SafeValue(this.Ohlcvs, symbol, map[string]any{}))\n').indexOf ('\tif symbol != nil && this.Ohlcvs[*symbol] == nil {') >= 0,
        'the inline ensure keeps the helper nil-key no-op');
    // a book local: the read types it, its entry reads and writes are native
    const local = f (both, '\tvar symbolOhlcvs any = this.SafeDict(this.Ohlcvs, symbol, map[string]any{})\n\tccxt.AddElementToObject(this.Ohlcvs, symbol, symbolOhlcvs)\n\tccxt.AddElementToObject(symbolOhlcvs, timeframe, stored)\n');
    ok (local.indexOf ('\tvar symbolOhlcvs map[string]any\n') >= 0, 'a book local is typed by the read');
    ok (local.indexOf ('\t\tsymbolOhlcvs[*timeframe] = stored') >= 0, 'a write into a book local goes native');
    ok (f ('symbol *string', '\tvar ohlcvsByTimeframe any = this.SafeDict(this.Ohlcvs, symbol)\n').indexOf ('\tvar ohlcvsByTimeframe map[string]any\n') >= 0,
        'a book read without a default keeps its nilness');
    // negatives: a boxed key and an unproven entry key keep the helper call
    ok (f ('symbol any, timeframe *string', '\tvar stored any = this.SafeValue(this.Ohlcvs, symbol)\n').indexOf ('this.SafeValue(this.Ohlcvs, symbol)') >= 0,
        'an any key keeps the read');
    ok (f ('symbol *string, stored any', '\tif !(ccxt.InOp(ccxt.GetValue(this.Ohlcvs, symbol), timeframe)) {\n\t}\n').indexOf ('ccxt.GetValue(this.Ohlcvs, symbol)') >= 0,
        'an unproven entry key keeps the helper');
    ok (f (both, '\tif (timeframe != nil) && (ccxt.InOp(this.Ohlcvs[*symbol], timeframe)) {\n\t}\n').indexOf ('InOp(this.Ohlcvs[*symbol], timeframe)') >= 0,
        'a compound condition keeps InOp');
    // a cache kept per symbol, without a timeframe level, lives under the timeframe it streams
    ok (f ('symbol *string', '\tvar stored any = this.SafeValue(this.Ohlcvs, symbol)\n\tif stored == nil {\n\t\tvar limit *int64 = this.SafeInteger(this.Options, "OHLCVLimit", 1000)\n\t\tstored = ccxt.NewArrayCacheByTimestamp(limit)\n\t\tccxt.AddElementToObject(this.Ohlcvs, symbol, stored)\n\t}\n').indexOf ('this.Ohlcvs[*symbol]["' + FLAT_KEY + '"] = stored') >= 0,
        'a flat cache store goes native under its timeframe');
    // a name declared again in a later block keeps the type of the declaration the site sees
    ok (f ('symbol *string', '\tfor i := 0; i < 1; i++ {\n\t\tvar symbol *string = this.SafeSymbol("x", nil)\n\t\tccxt.AddElementToObject(this.Ohlcvs, symbol, this.SafeValue(this.Ohlcvs, symbol, map[string]any{}))\n\t}\n\tvar symbol string = "a"\n\tthis.Ohlcvs[symbol] = map[string]any{}\n').indexOf ('\t\tif symbol != nil && this.Ohlcvs[*symbol] == nil {') >= 0,
        'a redeclaration in a later block does not unprove the sites before it');
    ok (f ('symbol *string', '\tif symbol == nil {\n\t\tvar marketId *string = symbol\n\t}\n\tccxt.AddElementToObject(this.Ohlcvs, marketId, this.SafeValue(this.Ohlcvs, marketId, map[string]any{}))\n').indexOf ('ccxt.AddElementToObject(this.Ohlcvs, marketId,') >= 0,
        'a declaration in a closed block does not type a later site');
    // the flat read is proven by the declaration on its own line
    ok (f ('symbol *string', '\tvar stored any = this.SafeValue(this.Ohlcvs, symbol)\n\tif stored == nil {\n\t\tstored = ccxt.NewArrayCacheByTimestamp(limit)\n\t\tccxt.AddElementToObject(this.Ohlcvs, symbol, stored)\n\t}\n').indexOf ('stored = this.Ohlcvs[*symbol]["' + FLAT_KEY + '"]') >= 0,
        'a flat cache read at its own declaration is still typed');
    return problems;
}
