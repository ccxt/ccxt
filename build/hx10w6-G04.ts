// hx10 wave-6 G04 (Go): an order-book side read, `GetValue(<book>, "asks"|"bids")`, prints as the
// port's own accessor (`<book>.GetAsks()`) when the receiver is statically an `OrderBookInterface`.
// The receiver is typed at its DECLARATION - a local is retyped and its cache writes unboxed with the
// port's own `OrderBookTyped`, a handler parameter is retyped - and nothing is asserted at the read.
// A read is only rewritten when a write of the receiver reaches it and that write cannot be nil: a
// constructor, or a cache read whose key is proven present by a guard that encloses the read.
// Everything else keeps the helper call exactly as the printer emitted it.

const G04_SIDE: { [key: string]: string } = { 'asks': 'GetAsks', 'bids': 'GetBids' };

// an expression that can only be an order book: the port's constructors, its typed unboxer and a read
// of the exchange's own order-book cache
const G04_BOOK = /^(?:ccxt\.)?OrderBookTyped\(|^(?:this\.|ccxt\.)(?:Indexed|Counted)?OrderBook\(|^this\.Orderbooks\[|^(?:(?:this|ccxt)\.)?(?:GetValue|SafeValue)\(this\.Orderbooks, /;
// an expression that already carries the book type: no unbox needed at the declaration
const G04_ALREADY = /^(?:ccxt\.)?OrderBookTyped\(|^(?:this\.|ccxt\.)(?:Indexed|Counted)?OrderBook\(/;
// a value that is non-nil by construction: a constructor, or the typed unbox of one
const G04_CTOR = /^(?:this\.|ccxt\.)(?:Indexed|Counted)?OrderBook\(|^(?:ccxt\.)?OrderBookTyped\((?:this\.|ccxt\.)(?:Indexed|Counted)?OrderBook\(/;
const G04_TYPED = /^(?:ccxt\.)?OrderBookInterface$/;
const G04_READ = /(?<![\w.])(?:ccxt\.)?GetValue\((\w+), "(asks|bids)"\)/g;
// the cache key of an order-book cache read, or undefined for a constructor
const G04_CACHE_KEY = /^(?:(?:this|ccxt)\.)?(?:GetValue|SafeValue)\(this\.Orderbooks, (\w+)\)$|^this\.Orderbooks\[\*?(\w+)\]$/;

type G04Block = { 'open': number, 'close': number };
type G04Write = { 'line': number, 'expr': string };

// a trailing // comment is blanked so a read quoted in prose is never rewritten
function g04Mask (line: string): string {
    let quote: string | null = null;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (quote !== null) {
            if (c === '\\') {
                i++;
            } else if (c === quote) {
                quote = null;
            }
        } else if ((c === '"') || (c === '`')) {
            quote = c;
        } else if ((c === '/') && (line[i + 1] === '/')) {
            return line.substring (0, i);
        }
    }
    return line;
}

function g04Indent (line: string): string {
    return /^\s*/.exec (line)![0];
}

// the block a line opens: the first following line that is exactly `indent + }`
function g04Close (lines: string[], open: number, indent: string): number {
    const width = indent.length;
    for (let k = open + 1; k < lines.length; k++) {
        if (!lines[k].trim ().startsWith ('}')) {
            continue;
        }
        if (g04Indent (lines[k]).length === width) {
            return k;
        }
    }
    return -1;
}

function g04Blocks (lines: string[], start: number, end: number): G04Block[] {
    const blocks: G04Block[] = [];
    for (let k = start; k < end; k++) {
        if (!lines[k].trimEnd ().endsWith ('{')) {
            continue;
        }
        const close = g04Close (lines, k, g04Indent (lines[k]));
        if (close > k) {
            blocks.push ({ 'open': k, 'close': close });
        }
    }
    return blocks;
}

// the blocks that enclose a line, outermost first
function g04Chain (blocks: G04Block[], at: number): number[] {
    return blocks.filter (b => (b.open < at) && (at < b.close)).map (b => b.open);
}

function g04Prefix (short: number[], long: number[]): boolean {
    if (short.length > long.length) {
        return false;
    }
    for (let i = 0; i < short.length; i++) {
        if (short[i] !== long[i]) {
            return false;
        }
    }
    return true;
}

// the block stores a book in the cache: a direct index assignment or an AddElementToObject of a
// constructor / typed unbox, which is what makes the entry non-nil from then on
function g04StoresBook (lines: string[], k: number, close: number): boolean {
    for (let i = k; i < close; i++) {
        const stored = /this\.Orderbooks\[[^\]]+\] = (.+)$/.exec (lines[i].trim ());
        if ((stored !== null) && G04_BOOK.test (stored[1].trim ())) {
            return true;
        }
        const added = /(?:ccxt\.)?AddElementToObject\(this\.Orderbooks, \w+, (.+)\)$/.exec (lines[i].trim ());
        if ((added !== null) && G04_BOOK.test (added[1].trim ())) {
            return true;
        }
        // a book held in a typed local of the same block: `var ob OrderBookInterface = this.OrderBook()`
        const held = /(?:ccxt\.)?AddElementToObject\(this\.Orderbooks, \w+, (\w+)\)$/.exec (lines[i].trim ());
        const direct = /^this\.Orderbooks\[[^\]]+\] = (\w+)$/.exec (lines[i].trim ());
        const name = ((held !== null) ? held[1] : ((direct !== null) ? direct[1] : ''));
        if (name !== '') {
            const decl = new RegExp ('^\\s*var ' + name + ' (?:ccxt\\.)?OrderBookInterface = (.+)$');
            for (let j = k; j < i; j++) {
                const found = decl.exec (lines[j].trim ());
                if ((found !== null) && G04_CTOR.test (found[1].trim ())) {
                    return true;
                }
            }
        }
        // a constructor spliced in by an immediately invoked func literal: the store is still a book
        if (/(?:ccxt\.)?AddElementToObject\(this\.Orderbooks, \w+,/.test (lines[i].trim ())
            && /(?:this\.|ccxt\.)(?:Indexed|Counted)?OrderBook\(/.test (lines.slice (i + 1, close).join ('\n'))) {
            return true;
        }
    }
    return false;
}

// the guard line that proves `this.Orderbooks[<key>]` holds a book for `at`, or -1. The guard has to
// dominate the read: it encloses it, or it bailed out above it on the same path.
function g04Present (lines: string[], blocks: G04Block[], start: number, at: number, key: string): number {
    const chainAt = g04Chain (blocks, at);
    for (let k = start; k < at; k++) {
        const indent = g04Indent (lines[k]);
        const body = lines[k].trim ();
        const chain = g04Chain (blocks, k);
        const memo = new RegExp ('^if !\\((?:ccxt\\.)?InOp\\(this\\.Orderbooks, ' + key + '\\)\\) \\{$').exec (body);
        if (memo !== null) {
            const close = g04Close (lines, k, indent);
            if ((close > k) && (close < at) && g04Prefix (chain, chainAt) && (g04StoresBook (lines, k, close) || /^\s*(?:return|continue|panic\()/.test (lines[close - 1]))) {
                return k;
            }
            continue;
        }
        const positive = new RegExp ('^if (?:ccxt\\.)?InOp\\(this\\.Orderbooks, ' + key + '\\) \\{$').exec (body);
        if ((positive !== null) && (k < at) && g04Prefix ([...chain, k], chainAt)) {
            return k;
        }
        const safe = new RegExp ('^if (?:(?:ccxt\\.)?IsEqual\\(this\\.SafeValue\\(this\\.Orderbooks, ' + key + '\\), nil\\)|(?:ccxt\\.)?SafeValue\\(this\\.Orderbooks, ' + key + '\\) == nil) \\{$').exec (body);
        if (safe !== null) {
            const close = g04Close (lines, k, indent);
            if ((close > k) && (close < at) && g04Prefix (chain, chainAt) && (g04StoresBook (lines, k, close) || /^\s*(?:return|continue|panic\()/.test (lines[close - 1]))) {
                return k;
            }
            continue;
        }
        const lookup = new RegExp ('^if _, ok := this\\.Orderbooks\\[\\*?' + key + '\\]; !ok \\{$').exec (body);
        if (lookup !== null) {
            const close = g04Close (lines, k, indent);
            if ((close > k) && (close < at) && g04Prefix (chain, chainAt) && (g04StoresBook (lines, k, close) || /^\s*(?:return|continue|panic\()/.test (lines[close - 1]))) {
                return k;
            }
        }
    }
    return -1;
}

// every write of the receiver is a book producer (or nil), and the cache keys are one key
function g04BookWrites (writes: G04Write[]): string | null {
    let key: string | null = null;
    let proved = false;
    for (const w of writes) {
        const write = w.expr.trim ();
        if (write === 'nil') {
            continue;
        }
        if (!G04_BOOK.test (write)) {
            return null;
        }
        const cache = G04_CACHE_KEY.exec (write);
        if (cache !== null) {
            const name = (cache[1] !== undefined) ? cache[1] : cache[2];
            if ((key !== null) && (key !== name)) {
                return null;
            }
            key = name;
        }
        proved = true;
    }
    if (!proved) {
        return null;
    }
    return (key === null) ? '' : key;
}

function g04Wrap (expr: string, pkg: string): string {
    const write = expr.trim ();
    if ((write === 'nil') || G04_ALREADY.test (write)) {
        return write;
    }
    return pkg + 'OrderBookTyped(' + write + ')';
}

// the writes that reach a read: same block chain, or one `if <key> != nil {` deeper when the key is
// proven present at the read
function g04Reaches (lines: string[], blocks: G04Block[], write: G04Write, at: number, key: string): boolean {
    if (write.line > at) {
        return false;
    }
    const chainAt = g04Chain (blocks, at);
    const chainWrite = g04Chain (blocks, write.line);
    let common = 0;
    while ((common < chainWrite.length) && (common < chainAt.length) && (chainWrite[common] === chainAt[common])) {
        common++;
    }
    if (common === chainWrite.length) {
        return true; // the write sits at the read's level, or shallower
    }
    if ((chainWrite.length - common) !== 1) {
        return false;
    }
    const guard = blocks.find (b => b.open === chainWrite[common]);
    if ((guard === undefined) || (guard.close > at)) {
        return false;
    }
    // a write under a guard that always runs once the cache entry is there: `if <key> != nil {`, a
    // negated memo guard, a missing-entry guard or a nil-entry repair
    const opener = lines[guard.open];
    if (new RegExp ('^\\s*if ' + key + ' != nil \\{$').test (opener)) {
        return true;
    }
    return (new RegExp ('^\\s*if !\\((?:ccxt\\.)?InOp\\(this\\.Orderbooks, ' + key + '\\)\\) \\{$').test (opener)
        || new RegExp ('^\\s*if _, ok := this\\.Orderbooks\\[\\*?' + key + '\\]; !ok \\{$').test (opener)
        || new RegExp ('^\\s*if (?:(?:ccxt\\.)?IsEqual\\(this\\.SafeValue\\(this\\.Orderbooks, ' + key + '\\), nil\\)|(?:ccxt\\.)?SafeValue\\(this\\.Orderbooks, ' + key + '\\) == nil) \\{$').test (opener));
}

// a later write replaces an earlier one on the same path
function g04Overrides (blocks: G04Block[], later: G04Write, earlier: G04Write): boolean {
    const chainLater = g04Chain (blocks, later.line);
    const chainEarlier = g04Chain (blocks, earlier.line);
    return g04Prefix (chainEarlier, chainLater) || (chainLater.length <= chainEarlier.length);
}

// the receiver is a local of this function: retype its declaration, unbox its cache writes and let the
// reads print the accessor
function g04LocalReads (lines: string[], masked: string[], start: number, end: number, name: string, reads: number[], pkg: string): boolean {
    const decls: { 'type': string, 'init': string, 'line': number }[] = [];
    const writes: G04Write[] = [];
    const repairs: number[] = [];
    for (let k = start + 1; k < end; k++) {
        const line = masked[k];
        const decl = /^(\s*)var (\w+) ([^=\s]+)(?:\s*=\s*(.*))?$/.exec (line);
        if ((decl !== null) && (decl[2] === name)) {
            const init = (decl[4] === undefined) ? '' : decl[4].trim ();
            decls.push ({ 'type': decl[3], 'init': init, 'line': k });
            if (init !== '') {
                writes.push ({ 'line': k, 'expr': init });
            }
            continue;
        }
        const short = /^(\s*)(\w+) := (.*)$/.exec (line);
        if ((short !== null) && (short[2] === name)) {
            decls.push ({ 'type': '', 'init': short[3].trim (), 'line': k });
            writes.push ({ 'line': k, 'expr': short[3] });
            continue;
        }
        const assign = new RegExp ('^(\\s*)' + name + ' = (.*)$').exec (line);
        if (assign !== null) {
            writes.push ({ 'line': k, 'expr': assign[2] });
        }
        if (new RegExp ('(?:^|[^\\w.])' + name + '\\s*(?:\\+\\+|--)|&\\s*' + name + '\\b').test (line)) {
            return false; // addressed or stepped: not a plain book handle any more
        }
        // `if IsEqual(<name>, nil) { <name> = <book> }` or a bail-out: on either branch the receiver
        // holds a book from the end of that block on
        const repair = new RegExp ('^(\\s*)if (?:(?:ccxt\\.)?IsEqual\\(' + name + ', nil\\)|' + name + ' == nil) \\{$').exec (line);
        if (repair !== null) {
            const close = g04Close (masked, k, repair[1]);
            const body = (close > k) ? masked.slice (k, close).join ('\n') : '';
            const assigned = new RegExp ('\\b' + name + ' = (.+)$', 'm').exec (body);
            if ((close > k) && (((assigned !== null) && G04_CTOR.test (assigned[1].trim ()))
                || /(?:^|\n)\s*(?:return|continue|panic\()/.test (body))) {
                repairs.push (close);
            }
        }
    }
    if (decls.length === 0) {
        return false;
    }
    for (const decl of decls) {
        if ((decl.type === '') || !(G04_TYPED.test (decl.type) || (decl.type === 'any'))) {
            return false; // a declaration of another type: the name means two variables
        }
    }
    const key = g04BookWrites (writes);
    if (key === null) {
        return false;
    }
    const blocks = g04Blocks (masked, start, end);
    for (const at of reads) {
        if (repairs.some (close => close < at)) {
            continue; // a nil-repair or a bail-out above the read proves the receiver is a book
        }
        const reaching = writes.filter (w => g04Reaches (lines, blocks, w, at, key)).sort ((a, b) => a.line - b.line);
        let proven = false;
        for (let i = 0; i < reaching.length; i++) {
            const write = reaching[i];
            // a later write on the same path overwrites this one, so only the live writes are checked
            const overridden = reaching.some ((later, j) => (j > i) && g04Overrides (blocks, later, write));
            if (overridden) {
                continue;
            }
            const expr = write.expr.trim ();
            if (expr === 'nil') {
                return false; // a nil book can reach this read
            }
            if (G04_CACHE_KEY.exec (expr) === null) {
                proven = true; // a constructor or an already unboxed book
            } else if (g04Present (lines, blocks, start, at, key) >= 0) {
                proven = true;
            }
        }
        if (!proven) {
            return false;
        }
    }
    for (const decl of decls) {
        const indent = g04Indent (lines[decl.line]);
        const init = ((decl.init === '') || (decl.init === 'nil')) ? '' : g04Wrap (decl.init, pkg);
        lines[decl.line] = indent + 'var ' + name + ' ' + pkg + 'OrderBookInterface' + ((init === '') ? '' : ' = ' + init);
    }
    for (let k = start + 1; k < end; k++) {
        const assign = new RegExp ('^(\\s*)' + name + ' = (.*)$').exec (masked[k]);
        if (assign !== null) {
            lines[k] = assign[1] + name + ' = ' + g04Wrap (assign[2], pkg);
        }
    }
    for (const at of reads) {
        lines[at] = lines[at].replace (G04_READ, (all: string, recv: string, side: string) => ((recv === name) ? recv + '.' + G04_SIDE[side] + '()' : all));
    }
    return true;
}

function g04CloseCall (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if ('([{'.indexOf (c) >= 0) {
            depth++;
        } else if (')]}'.indexOf (c) >= 0) {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

function g04Split (text: string, open: number): string[] {
    const out: string[] = [];
    let depth = 0;
    let from = open + 1;
    for (let i = open + 1; i < text.length; i++) {
        const c = text[i];
        if ('([{'.indexOf (c) >= 0) {
            depth++;
        } else if (')]}'.indexOf (c) >= 0) {
            if (depth === 0) {
                out.push (text.substring (from, i));
                return out;
            }
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            out.push (text.substring (from, i));
            from = i + 1;
        }
    }
    return out;
}

// the parameter list of `fn` starts after the receiver group
function g04ParamsOpen (sig: string, fn: string): number {
    const at = new RegExp ('\\) ' + fn + '\\(').exec (sig);
    if (at === null) {
        return -1;
    }
    return at.index + 2 + fn.length;
}

function g04ParamPos (sig: string, fn: string, name: string): number {
    const open = g04ParamsOpen (sig, fn);
    const close = (open < 0) ? -1 : g04CloseCall (sig, open);
    const parts = (close > open) ? g04Split (sig, open) : [];
    for (let i = 0; i < parts.length; i++) {
        if (new RegExp ('^\\s*' + name + '\\s').test (parts[i])) {
            return i;
        }
    }
    return -1;
}

// the argument handed to a retyped parameter is a book: a producer expression, or a name declared
// `OrderBookInterface` in the function that makes the call
function g04ArgIsBook (masked: string[], joined: string, at: number, arg: string): boolean {
    if ((arg === '') || /[\s,;]/.test (arg)) {
        return false;
    }
    if (G04_BOOK.test (arg)) {
        return true;
    }
    const name = /^(\w+)$/.exec (arg);
    if (name === null) {
        return false;
    }
    const line = joined.substring (0, at).split ('\n').length - 1;
    let start = line;
    while ((start > 0) && !/^func /.test (masked[start])) {
        start--;
    }
    // the declaration in scope at the call site: the nearest one whose block still encloses the call
    const blocks = g04Blocks (masked, start, line + 1);
    const chainArg = g04Chain (blocks, line);
    const decl = new RegExp ('^(\\s*)var ' + name[1] + ' ([^=\\s]+)');
    let best = -1;
    let bestType = '';
    for (let k = start; k < line; k++) {
        const found = decl.exec (masked[k]);
        if ((found === null) || (k <= best) || !g04Prefix (g04Chain (blocks, k), chainArg)) {
            continue;
        }
        best = k;
        bestType = found[2];
    }
    if (best >= 0) {
        return G04_TYPED.test (bestType);
    }
    // no local: the enclosing function's own parameter type
    const head = /^func \([^)]*\) \w+\(([^)]*)\)/.exec (masked[start]);
    return (head !== null) && new RegExp ('(?:^|, )' + name[1] + ' (?:ccxt\\.)?OrderBookInterface(?:,|$)').test (head[1]);
}

// the receiver is a parameter of this function: retype it when every call site in this file already
// hands it a statically typed book
function g04ParamReads (lines: string[], masked: string[], joined: string, start: number, end: number, fn: string, name: string, sig: string, reads: number[], pkg: string): boolean {
    const own = new RegExp ('\\b' + name + ' any\\b');
    if (!own.test (sig)) {
        return false;
    }
    for (let k = start + 1; k < end; k++) {
        if (new RegExp ('^\\s*' + name + ' = ').test (masked[k])) {
            return false; // a written parameter is not a handle
        }
    }
    const call = new RegExp ('\\.' + fn + '\\(', 'g');
    let hit = call.exec (joined);
    if (hit === null) {
        return false; // no caller in this file: a cross-file caller could pass anything
    }
    const pos = g04ParamPos (sig, fn, name);
    if (pos < 0) {
        return false;
    }
    while (hit !== null) {
        const open = hit.index + hit[0].length - 1;
        const close = g04CloseCall (joined, open);
        const args = (close > open) ? g04Split (joined, open) : [];
        const arg = (pos < args.length) ? args[pos].trim () : '';
        if (!g04ArgIsBook (masked, joined, hit.index, arg)) {
            return false;
        }
        hit = call.exec (joined);
    }
    lines[start] = lines[start].replace (own, name + ' ' + pkg + 'OrderBookInterface');
    for (const at of reads) {
        lines[at] = lines[at].replace (G04_READ, (all: string, recv: string, side: string) => ((recv === name) ? recv + '.' + G04_SIDE[side] + '()' : all));
    }
    return true;
}

export function g04BookSides (content: string): string {
    if (!/GetValue\(\w+, "(?:asks|bids)"\)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (g04Mask);
    const joined = masked.join ('\n');
    const pkg = /^package ccxt$/m.test (content) ? '' : 'ccxt.';
    const starts: number[] = [];
    for (let k = 0; k < masked.length; k++) {
        if (/^func /.test (masked[k])) {
            starts.push (k);
        }
    }
    for (let n = 0; n < starts.length; n++) {
        const start = starts[n];
        const end = (n + 1 < starts.length) ? starts[n + 1] : masked.length;
        const head = /^func (?:\([^)]*\) )?(\w+)\(/.exec (masked[start]);
        if (head === null) {
            continue;
        }
        let sig = '';
        for (let k = start; (k < end) && !sig.trimEnd ().endsWith ('{'); k++) {
            sig += masked[k] + ' ';
        }
        const recvs: { [name: string]: number[] } = {};
        for (let k = start + 1; k < end; k++) {
            if (masked[k].indexOf ('GetValue(') < 0) {
                continue;
            }
            G04_READ.lastIndex = 0;
            let read = G04_READ.exec (masked[k]);
            while (read !== null) {
                (recvs[read[1]] = recvs[read[1]] || []).push (k);
                read = G04_READ.exec (masked[k]);
            }
        }
        for (const name of Object.keys (recvs)) {
            const reads = recvs[name];
            if (new RegExp ('\\b' + name + ' any\\b').test (sig)) {
                g04ParamReads (lines, masked, joined, start, end, head[1], name, sig, reads, pkg);
            } else {
                g04LocalReads (lines, masked, start, end, name, reads, pkg);
            }
        }
    }
    return lines.join ('\n');
}

// hx11 w8: once the ws-cache pass has printed the cache read as a plain map index, the unbox of a
// guarded book is Go's own type assertion on that index; `OrderBookTyped(this.Orderbooks[k])` was a
// wrapper call around the same read. g04BookSides only unboxes where a guard proves the entry is a book.
export function g04NativeBookReads (content: string): string {
    if (content.indexOf ('OrderBookTyped(this.Orderbooks[') < 0) {
        return content;
    }
    return content.replace (/^(\s*(?:var \w+ (?:ccxt\.)?OrderBookInterface = |\w+ = ))((?:ccxt\.)?)OrderBookTyped\((this\.Orderbooks\[\*?\w+\])\)$/gm,
        (all: string, head: string, pkg: string, read: string) => head + read + '.(' + pkg + 'OrderBookInterface)');
}

export function g04NativeBookReadsCheck (): string[] {
    const problems: string[] = [];
    const src = 'package ccxtpro\n\nfunc (this *X) F() {\n\tvar orderbook ccxt.OrderBookInterface\n\tif symbol != nil {\n\t\torderbook = ccxt.OrderBookTyped(this.Orderbooks[*symbol])\n\t}\n\tvar b ccxt.OrderBookInterface = ccxt.OrderBookTyped(this.Orderbooks[symbol])\n\tvar c ccxt.OrderBookInterface = ccxt.OrderBookTyped(r1.Value)\n}\n';
    const out = g04NativeBookReads (src);
    if (!out.includes ('\t\torderbook = this.Orderbooks[*symbol].(ccxt.OrderBookInterface)\n') || !out.includes ('= this.Orderbooks[symbol].(ccxt.OrderBookInterface)\n')) {
        problems.push ('hx11 w8: cache read not typed natively: ' + out);
    }
    if (!out.includes ('ccxt.OrderBookTyped(r1.Value)')) {
        problems.push ('hx11 w8: a non-cache unbox must keep OrderBookTyped: ' + out);
    }
    return problems;
}

export function g04BookSidesCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10w6-G04: ' + message); } };
    const pro = (body: string) => 'package ccxtpro\n\nimport "ccxt/go/v4"\n\n' + body;
    // memo guard + conditional cache write: the local is typed at its declaration, no assertion anywhere
    const memo = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tvar symbol *string = this.SafeSymbol(this.SafeString(message, "s"))\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t\tif symbol != nil {\n\t\t\tthis.Orderbooks[*symbol] = this.OrderBook()\n\t\t}\n\t}\n\tvar orderbook any\n\tif symbol != nil {\n\t\torderbook = this.Orderbooks[*symbol]\n\t}\n\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), asks)\n\tthis.HandleDeltas(ccxt.GetValue(orderbook, "bids"), bids)\n}\n'));
    ok (memo.includes ('\tvar orderbook ccxt.OrderBookInterface\n'), 'a memo-guarded local is typed at its declaration: ' + memo);
    ok (memo.includes ('orderbook = ccxt.OrderBookTyped(this.Orderbooks[*symbol])'), 'a cache write is unboxed at the declaration site: ' + memo);
    ok (memo.includes ('this.HandleDeltas(orderbook.GetAsks(), asks)') && memo.includes ('this.HandleDeltas(orderbook.GetBids(), bids)'), 'the reads print the accessor: ' + memo);
    ok (memo.indexOf ('orderbook.(ccxt.OrderBookInterface)') < 0, 'no assertion at the read: ' + memo);
    // an enclosing positive guard proves the same thing
    const positive = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tif ccxt.InOp(this.Orderbooks, symbol) {\n\t\tvar orderbook any = this.SafeValue(this.Orderbooks, symbol)\n\t\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), asks)\n\t}\n}\n'));
    ok (positive.includes ('var orderbook ccxt.OrderBookInterface = ccxt.OrderBookTyped(this.SafeValue(this.Orderbooks, symbol))'), 'a guarded cache read is unboxed: ' + positive);
    ok (positive.includes ('orderbook.GetAsks()'), 'a guarded read prints the accessor: ' + positive);
    // a bail-out when the entry is missing proves it too
    const bail = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tif ccxt.IsEqual(this.SafeValue(this.Orderbooks, sym), nil) {\n\t\treturn\n\t}\n\tvar orderbook any = ccxt.GetValue(this.Orderbooks, sym)\n\tvar side any = ccxt.GetValue(orderbook, "bids")\n}\n'));
    ok (bail.includes ('orderbook.GetBids()'), 'a bail-out guard proves the entry: ' + bail);
    // a nil initializer is dropped, never printed as `= nil` on an interface
    const nulled = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t\tthis.Orderbooks[*symbol] = this.OrderBook()\n\t}\n\tvar orderbook any = nil\n\torderbook = ccxt.GetValue(this.Orderbooks, symbol)\n\tvar side any = ccxt.GetValue(orderbook, "asks")\n}\n'));
    ok (nulled.includes ('\tvar orderbook ccxt.OrderBookInterface\n') && (nulled.indexOf ('ccxt.OrderBookInterface = nil') < 0), 'a nil initializer is dropped: ' + nulled);
    // negatives: no presence proof, a write that can stay nil, a dict producer, a shadowed name
    const unguarded = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tvar orderbook any = this.SafeValue(this.Orderbooks, symbol)\n\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), asks)\n}\n'));
    ok (unguarded.includes ('ccxt.GetValue(orderbook, "asks")'), 'an unproven cache read keeps the helper: ' + unguarded);
    const canBeNil = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t\tthis.Orderbooks[*symbol] = this.OrderBook()\n\t}\n\tvar orderbook any\n\tif message != nil {\n\t\torderbook = this.Orderbooks[*symbol]\n\t}\n\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), asks)\n}\n'));
    ok (canBeNil.includes ('ccxt.GetValue(orderbook, "asks")'), 'a write guarded by another condition keeps the helper: ' + canBeNil);
    const dict = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t\tthis.Orderbooks[*symbol] = this.OrderBook()\n\t}\n\tvar book any = this.SafeDict(this.Orderbooks, symbol)\n\tthis.HandleDeltas(ccxt.GetValue(book, "asks"), asks)\n}\n'));
    ok (dict.includes ('ccxt.GetValue(book, "asks")'), 'a dict producer keeps the helper: ' + dict);
    const shadow = g04BookSides (pro ('func (this *X) HandleOrderBook(client any, message map[string]any) {\n\tif ccxt.InOp(this.Orderbooks, symbol) {\n\t\tvar orderbook ccxt.OrderBookInterface = this.OrderBook()\n\t\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), asks)\n\t} else {\n\t\tvar orderbook map[string]any = this.SafeDict(message, "book")\n\t\tthis.HandleDeltas(ccxt.GetValue(orderbook, "bids"), bids)\n\t}\n}\n'));
    ok (shadow.includes ('ccxt.GetValue(orderbook, "asks")') && shadow.includes ('ccxt.GetValue(orderbook, "bids")'), 'a name declared twice keeps the helper: ' + shadow);
    const param = g04BookSides (pro ('func (this *X) HandleBookDelta(orderbook any, delta any) {\n\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), delta)\n}\nfunc (this *X) Handle(client any) {\n\tthis.HandleBookDelta(ccxt.GetValue(this.Orderbooks, symbol), delta)\n}\n'));
    ok (param.includes ('ccxt.GetValue(orderbook, "asks")'), 'a parameter whose caller passes an untyped value keeps the helper: ' + param);
    // a parameter every caller fills with a typed book is retyped
    const typed = g04BookSides (pro ('func (this *X) HandleOrderBookMessage(client any, message any, orderbook any) any {\n\tthis.HandleDeltas(ccxt.GetValue(orderbook, "asks"), this.SafeList(message, "a", []any{}))\n\treturn orderbook\n}\nfunc (this *X) Handle(client any, message any) {\n\tvar orderbook ccxt.OrderBookInterface = this.OrderBook()\n\tthis.HandleOrderBookMessage(client, message, orderbook)\n}\n'));
    ok (typed.includes ('orderbook ccxt.OrderBookInterface) any') && typed.includes ('this.HandleDeltas(orderbook.GetAsks()'), 'a parameter every caller fills with a book is retyped: ' + typed);
    // a comment is never rewritten
    const commented = g04BookSides (pro ('func (this *X) f() {\n\t// GetValue(orderbook, "asks") stays a helper in prose\n}\n'));
    ok (commented.includes ('// GetValue(orderbook, "asks")'), 'a read inside a comment is untouched: ' + commented);
    return problems;
}
