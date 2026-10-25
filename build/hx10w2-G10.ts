// HX10 G10: the ws caches on BaseExchange (Orderbooks / Ohlcvs / Trades / FundingRates) are plain
// map[string]any fields owned by the exchange, so the helper calls the printer emits on them become
// the native map operation. A receiver or key whose Go type is not proven keeps the helper call.
import { goChanMask, goChanClose } from './go-chan.js';

const WS_FIELDS = [ 'Orderbooks', 'Ohlcvs', 'Trades', 'FundingRates' ];
const FIELD = WS_FIELDS.join ('|');
const RECEIVER = new RegExp ('^this\\.(?:' + FIELD + ')$');
const ANY_FIELD = new RegExp ('this\\.(?:' + FIELD + ')\\b');
const STATEMENT_CALL = new RegExp ('^\\s*(?:ccxt\\.)?(?:AddElementToObject|Remove)\\(this\\.(?:' + FIELD + '), ');
const RECEIVER_CALL = /(?<![\w.])(?:ccxt\.)?(?:AddElementToObject|GetValue|InOp|Remove)\(/g;

// Go types of a store value the helper's derefScalar leaves untouched: cache objects, dictionaries,
// slices. `any` locals are absent on purpose — they may hold a *int64 / *string box.
const PLAIN_VALUE_TYPES = /^(?:map\[|\[\]|(?:\*)?ccxt\.[A-Z]|(?:\*)?(?:ArrayCache|OrderBook))/;

type Decl = { 'type': string, 'line': number };

type Span = { s: number, e: number, text: string };

// `func (this *X) Name(a *string, b any)` -> [['a','*string'], ...] for the parameters only
function hx10G10Params (signature: string): Array<[ string, string ]> {
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
    for (const span of hx10G10Split (signature, open, close)) {
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

// top-level comma split of masked [open+1, close-1)
function hx10G10Split (masked: string, open: number, close: number): Span[] {
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
            spans.push ({ 's': s, 'e': i, 'text': '' });
            s = i + 1;
        }
    }
    spans.push ({ 's': s, 'e': close - 1, 'text': '' });
    return spans;
}

// every name the function declares, with the line it is declared on; a name declared twice never
// carries a proven type
function hx10G10Decls (body: string[], signature: string): Map<string, Decl> {
    const decls = new Map<string, Decl> ();
    const add = (name: string, type: string, line: number) => {
        const seen = decls.get (name);
        if (seen === undefined) {
            decls.set (name, { 'type': type, 'line': line });
        } else {
            seen.type = '?';
        }
    };
    for (const [ name, type ] of hx10G10Params (signature)) {
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

// the Go type of a local at the site, or undefined when the printer would count it unknown
function hx10G10DepthBefore (maskedBody: string[], line: number): number {
    let depth = 0;
    for (let k = 0; k < line; k++) {
        depth += (maskedBody[k].split ('{').length - maskedBody[k].split ('}').length);
    }
    return depth;
}

// the block at `depth` holding line `from` is still open at `to` (no line between closes it)
function hx10G10BlockStillOpen(maskedBody: string[], from: number, to: number, depth: number): boolean {
    for (let j = from + 1; j < to; j++) {
        if (maskedBody[j].trimStart ().startsWith ('}') && (hx10G10DepthBefore (maskedBody, j) === depth + 1)) {
            return false;
        }
    }
    return true;
}

// an `if k != nil {` block (or `if (k != nil) && x {`) enclosing the site proves the pointer non-nil
function hx10G10NilGuarded (key: string, maskedBody: string[], siteLine: number): boolean {
    const guard = new RegExp ('^\\s*if \\(?' + key + ' != nil\\)?(?: && [^|]*)? \\{$');
    const siteDepth = hx10G10DepthBefore (maskedBody, siteLine);
    for (let k = siteLine - 1; k >= 0; k--) {
        const depth = hx10G10DepthBefore (maskedBody, k);
        if ((depth >= siteDepth) || !guard.test (maskedBody[k])) {
            continue;
        }
        if (hx10G10BlockStillOpen (maskedBody, k, siteLine, depth)) {
            return true;
        }
    }
    return false;
}

// the key as Go prints it: a string literal, a `string` local, or a `*string` local some earlier
// deref or enclosing nil guard proves non-nil (a nil key would have panicked or been skipped there)
function hx10G10Key (maskedBody: string[], decls: Map<string, Decl>, key: string, siteLine: number): string | undefined {
    if (key.startsWith ('"')) {
        return key;
    }
    const decl = decls.get (key);
    if (decl === undefined) {
        return undefined;
    }
    if (decl.type === 'string') {
        return key;
    }
    if (decl.type !== '*string') {
        return undefined;
    }
    if (hx10G10NilGuarded (key, maskedBody, siteLine)) {
        return '*' + key;
    }
    const deref = new RegExp ('(?<![\\w*.])[*]' + key + '\\b');
    const siteDepth = hx10G10DepthBefore (maskedBody, siteLine);
    for (let k = 0; k < siteLine; k++) {
        if (!deref.test (maskedBody[k])) {
            continue;
        }
        const depth = hx10G10DepthBefore (maskedBody, k);
        if ((depth > siteDepth) || !hx10G10BlockStillOpen (maskedBody, k, siteLine, depth)) {
            continue; // a deeper block, or one the site has already left
        }
        return '*' + key;
    }
    return undefined;
}

function hx10G10PlainValue (value: string, decls: Map<string, Decl>): boolean {
    const text = value.trim ();
    if (/^(?:map\[|\[\])/.test (text) || /^(?:ccxt\.)?New[A-Z]\w*\(/.test (text)
        || /^this\.(?:OrderBook|IndexedOrderBook|CountedOrderBook|SafeDict|Extend|DeepExtend)\(/.test (text)) {
        return true;
    }
    const decl = decls.get (text);
    return (decl !== undefined) && PLAIN_VALUE_TYPES.test (decl.type);
}

type Call = { at: number, name: string, open: number, close: number, args: Span[] };

function hx10G10CallAt (maskedLine: string, at: number, name: string): Call | undefined {
    const open = at + maskedLine.substring (at).indexOf ('(');
    const close = goChanClose (maskedLine, open);
    if ((open < 0) || (close < 0)) {
        return undefined;
    }
    return { at, name, open, close, 'args': hx10G10Split (maskedLine, open, close) };
}

function hx10G10StatementEnd (maskedLine: string, close: number): boolean {
    return /^\s*$/.test (maskedLine.substring (close));
}

// `this.F[k] = v` / `delete(this.F, k)` for a statement helper call, or undefined to keep the helper
function hx10G10Statement (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    const head = STATEMENT_CALL.exec (maskedLine);
    if (head === null) {
        return undefined;
    }
    const name = /AddElementToObject|Remove/.exec (head[0])?.[0] as string;
    const call = hx10G10CallAt (maskedLine, head[0].indexOf (name), name);
    if ((call === undefined) || !hx10G10StatementEnd (maskedLine, call.close)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const key = hx10G10Key (maskedBody, decls, args[1] ?? '', index);
    if ((key === undefined) || !RECEIVER.test (args[0] ?? '')) {
        return undefined;
    }
    const indent = /^(\s*)/.exec (line)?.[1] ?? '';
    if (name === 'Remove') {
        return (call.args.length === 2) ? indent + 'delete(' + args[0] + ', ' + key + ')' : undefined;
    }
    if ((call.args.length !== 3) || !hx10G10PlainValue (args[2] ?? '', decls)) {
        return undefined;
    }
    return indent + args[0] + '[' + key + '] = ' + args[2];
}

// `this.F.Store(k, v)` / `this.F.Delete(k)` / `.Load(k)` left over from the printer's *sync.Map arms
function hx10G10Method (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    const method = new RegExp ('^\\s*this\\.(' + FIELD + ')\\.(Store|Delete|Load)\\(').exec (maskedLine);
    if (method === null) {
        return undefined;
    }
    const call = hx10G10CallAt (maskedLine, method[0].indexOf ('.' + method[2]), method[2]);
    if (call === undefined) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const key = hx10G10Key (maskedBody, decls, args[0] ?? '', index);
    if (key === undefined) {
        return undefined;
    }
    const receiver = 'this.' + method[1];
    const indent = /^(\s*)/.exec (line)?.[1] ?? '';
    if (method[2] === 'Delete') {
        return hx10G10StatementEnd (maskedLine, call.close) && (args.length === 1) ? indent + 'delete(' + receiver + ', ' + key + ')' : undefined;
    }
    if (method[2] === 'Store') {
        return (hx10G10StatementEnd (maskedLine, call.close) && (args.length === 2)) ? indent + receiver + '[' + key + '] = ' + args[1] : undefined;
    }
    const init = /^\s*(\w+), (\w+) := this\.\w+\.Load\(/.exec (maskedLine);
    return (init !== null) ? indent + init[1] + ', ' + init[2] + ' := ' + receiver + '[' + key + ']' : undefined;
}

// `if InOp(this.F, k) {` -> `if _, ok := this.F[k]; ok {`, the comma-ok the helper's map branch is
function hx10G10InOp (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (maskedLine);
    if (cond === null) {
        return undefined;
    }
    const calls = [ ...maskedLine.matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
    if (calls.length !== 1) {
        return undefined;
    }
    const call = hx10G10CallAt (maskedLine, calls[0].index, 'InOp');
    if ((call === undefined) || (call.args.length !== 2)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const key = hx10G10Key (maskedBody, decls, args[1] ?? '', index);
    if ((key === undefined) || !RECEIVER.test (args[0] ?? '')) {
        return undefined;
    }
    const before = line.substring (cond[1].length, call.at);
    const after = line.substring (call.close);
    if (/\bok\b/.test (before + after) || /\bok\b/.test (maskedBody.join ('\n'))) {
        return undefined;
    }
    const rest = (before + 'ok' + after).replace (/(^|[^\w)\]])(\(ok\))/g, '$1ok');
    return cond[1] + '_, ok := ' + args[0] + '[' + key + ']; ' + rest;
}

export function hx10G10Pass (content: string): string {
    if (!ANY_FIELD.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let k = 0;
    const out: string[] = [];
    while (k < lines.length) {
        if (!lines[k].startsWith ('func (this *')) {
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
        const decls = hx10G10Decls (body, body[0]);
        out.push (body[0]);
        for (let i = 1; i < body.length; i++) {
            const rewritten = hx10G10Line (body, maskedBody, decls, i);
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

// `var x T = <expr holding GetValue(this.F, k)>` with a nilable `*string` key: the helper answers nil
// for a nil key, so the read moves behind an explicit nil check instead of a closure
function hx10G10GuardedRead (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string[] | undefined {
    const declaration = /^(\s*)var (\w+) (\S+) = /.exec (maskedLine);
    if (declaration === null) {
        return undefined;
    }
    const calls = [ ...maskedLine.matchAll (/(?<![\w.])(?:ccxt\.)?GetValue\(/g) ];
    if (calls.length !== 1) {
        return undefined;
    }
    const call = hx10G10CallAt (maskedLine, calls[0].index, 'GetValue');
    if ((call === undefined) || (call.args.length !== 2)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const key = args[1] ?? '';
    if (!RECEIVER.test (args[0] ?? '') || !/^\w+$/.test (key)) {
        return undefined;
    }
    const decl = decls.get (key);
    // a `*string` key the site does not prove non-nil: hx10G10Key would have answered for it
    if ((decl === undefined) || (decl.type !== '*string') || (hx10G10Key (maskedBody, decls, key, index) !== undefined)) {
        return undefined;
    }
    const field = new RegExp ('this\\.(' + FIELD + ')').exec (maskedLine.substring (call.open, call.close))?.[1];
    if (field === undefined) {
        return undefined;
    }
    const indent = declaration[1];
    const equal = maskedLine.indexOf (' = ') + 3;
    const value = line.substring (equal, call.at) + 'this.' + field + '[*' + key + ']' + line.substring (call.close);
    return [
        indent + 'var ' + declaration[2] + ' ' + declaration[3],
        indent + 'if ' + key + ' != nil {',
        indent + '\t' + declaration[2] + ' = ' + value,
        indent + '}',
    ];
}

// `AddElementToObject(this.F, k, v)` / `Remove(this.F, k)` with a nilable `*string` key: the helper
// is a no-op for a nil key, so the write moves behind the same explicit nil check
function hx10G10GuardedWrite (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string[] | undefined {
    const head = new RegExp ('^(\\s*)(?:ccxt\\.)?(AddElementToObject|Remove)\\(this\\.(' + FIELD + '), ').exec (maskedLine);
    if (head === null) {
        return undefined;
    }
    const call = hx10G10CallAt (maskedLine, head[0].indexOf (head[2]), head[2]);
    if ((call === undefined) || !hx10G10StatementEnd (maskedLine, call.close)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const key = args[1] ?? '';
    const decl = decls.get (key);
    if (!/^\w+$/.test (key) || (decl === undefined) || (decl.type !== '*string') || (hx10G10Key (maskedBody, decls, key, index) !== undefined)) {
        return undefined;
    }
    const indent = head[1];
    const receiver = 'this.' + head[3];
    if (head[2] === 'Remove') {
        return (call.args.length === 2) ? [ indent + 'if ' + key + ' != nil {', indent + '\tdelete(' + receiver + ', *' + key + ')', indent + '}' ] : undefined;
    }
    if ((call.args.length !== 3) || !hx10G10PlainValue (args[2] ?? '', decls)) {
        return undefined;
    }
    return [ indent + 'if ' + key + ' != nil {', indent + '\t' + receiver + '[*' + key + '] = ' + args[2], indent + '}' ];
}

function hx10G10Line (body: string[], maskedBody: string[], decls: Map<string, Decl>, index: number): string[] {
    let line = body[index];
    // `this.F = this.createSafeDictionary(true)`: a plain map field needs a map literal
    const init = new RegExp ('^(\\s*)this\\.(' + FIELD + ') = this\\.CreateSafeDictionary\\((?:true)?\\)\\s*$').exec (goChanMask (line));
    if (init !== null) {
        return [ init[1] + 'this.' + init[2] + ' = map[string]any{}' ];
    }
    let maskedLine = goChanMask (line);
    const guarded = hx10G10GuardedRead (line, maskedLine, decls, maskedBody, index) ?? hx10G10GuardedWrite (line, maskedLine, decls, maskedBody, index);
    if (guarded !== undefined) {
        return guarded;
    }
    for (const rewrite of [ hx10G10Method, hx10G10Statement, hx10G10InOp ]) {
        const text = rewrite (line, maskedLine, decls, maskedBody, index);
        if (text !== undefined) {
            line = text;
            maskedLine = goChanMask (line);
        }
    }
    // nested helper calls, innermost first: `InOp(GetValue(this.F, k), x)` rewrites its read only
    let cursor = 0;
    for (let guard = 0; (guard < 6) && (cursor < maskedLine.length); guard++) {
        RECEIVER_CALL.lastIndex = cursor;
        const m = RECEIVER_CALL.exec (maskedLine);
        if (m === null) {
            break;
        }
        const at = m.index;
        const name = /AddElementToObject|GetValue|InOp|Remove/.exec (m[0])?.[0] as string;
        const call = hx10G10CallAt (maskedLine, at, name);
        if (call === undefined) {
            cursor = at + 1;
            continue;
        }
        const receiver = 'this.' + (new RegExp ('this\\.(' + FIELD + ')').exec (maskedLine.substring (call.open, call.close))?.[1] ?? '');
        const args = call.args.map (a => line.substring (a.s, a.e).trim ());
        const isReceiver = (args.length > 0) && RECEIVER.test (args[0] ?? '');
        const key = isReceiver ? hx10G10Key (maskedBody, decls, args[1] ?? '', index) : undefined;
        if ((name === 'GetValue') && isReceiver && (call.args.length === 2) && (key !== undefined)) {
            line = line.substring (0, at) + receiver + '[' + key + ']' + line.substring (call.close);
            maskedLine = goChanMask (line);
            continue;
        }
        cursor = at + 1;
    }
    return [ line ];
}

export function hx10G10SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10-G10: ' + message); } };
    const f = (sig: string, body: string) => hx10G10Pass ('func (this *X) H(' + sig + ') {\n' + body + '}\n');
    // a *string key an earlier deref proves non-nil reads the map directly
    ok (f ('symbol *string', '\tvar h string = "book::" + *symbol\n\tvar book any = ccxt.GetValue(this.Orderbooks, symbol)\n').indexOf ('var book any = this.Orderbooks[*symbol]') >= 0,
        '*string key with a proving deref goes native');
    // without that deref the read moves behind an explicit nil check, never a closure
    ok (f ('symbol *string', '\tvar book any = ccxt.GetValue(this.Orderbooks, symbol)\n').indexOf ('\tif symbol != nil {\n\t\tbook = this.Orderbooks[*symbol]\n\t}') >= 0,
        'unproven *string key reads behind a nil check');
    ok (f ('symbol *string', '\tif ccxt.InOp(ccxt.GetValue(this.Ohlcvs, symbol), timeframe) {\n\t}\n').indexOf ('GetValue(this.Ohlcvs, symbol)') >= 0,
        'a read nested in another helper keeps GetValue');
    ok (f ('symbol any', '\tvar book any = ccxt.GetValue(this.Trades, symbol)\n').indexOf ('GetValue(this.Trades, symbol)') >= 0,
        'any key keeps GetValue');
    // an enclosing `if k != nil {` block proves the pointer non-nil for every read and write in it
    ok (f ('symbol *string', '\tif symbol != nil {\n\t\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t\t\tccxt.AddElementToObject(this.Orderbooks, symbol, this.OrderBook())\n\t\t}\n\t}\n').indexOf ('\t\tthis.Orderbooks[*symbol] = this.OrderBook()') >= 0,
        'a nil-guarded block reads and writes natively');
    // statements: literal key delete, map-literal write, and the `any` value that stays boxed
    ok (f ('', '\tRemove(this.Orderbooks, "bids")\n').indexOf ('\tdelete(this.Orderbooks, "bids")') >= 0, 'Remove goes native');
    ok (f ('symbol string', '\tccxt.AddElementToObject(this.Ohlcvs, symbol, map[string]any{})\n').indexOf ('\tthis.Ohlcvs[symbol] = map[string]any{}') >= 0,
        'map-literal write goes native');
    ok (f ('symbol string', '\tvar orderbook any = this.OrderBook()\n\tccxt.AddElementToObject(this.Orderbooks, symbol, orderbook)\n').indexOf ('AddElementToObject(this.Orderbooks') >= 0,
        'boxed write value keeps AddElementToObject');
    // membership: the comma-ok of the helper's map branch, negated and compound
    ok (f ('sym string', '\tif ccxt.InOp(this.Orderbooks, sym) {\n\t}\n').indexOf ('\tif _, ok := this.Orderbooks[sym]; ok {') >= 0, 'InOp goes native');
    ok (f ('sym string', '\tif !(ccxt.InOp(this.Orderbooks, sym)) {\n\t}\n').indexOf ('\tif _, ok := this.Orderbooks[sym]; !ok {') >= 0, 'negated InOp goes native');
    // the printer's *sync.Map arms
    ok (f ('sym string', '\tthis.Orderbooks.Store(sym, this.OrderBook())\n').indexOf ('\tthis.Orderbooks[sym] = this.OrderBook()') >= 0, 'Store goes native');
    ok (f ('sym string', '\tthis.Orderbooks.Delete(sym)\n').indexOf ('\tdelete(this.Orderbooks, sym)') >= 0, 'Delete goes native');
    ok (f ('', '\tthis.Trades = this.CreateSafeDictionary(true)\n').indexOf ('\tthis.Trades = map[string]any{}') >= 0, 'cache init prints a map literal');
    // a field outside the family is untouched
    ok (f ('', '\tthis.Balance = this.CreateSafeDictionary(true)\n').indexOf ('this.CreateSafeDictionary(true)') >= 0, 'Balance keeps the sync.Map init');
    return problems;
}
