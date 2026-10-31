// HX10 G10: the ws caches on BaseExchange (Orderbooks / Ohlcvs / Trades / FundingRates) are plain
// map[string]any fields owned by the exchange, so the helper calls the printer emits on them become
// the native map operation. A receiver or key whose Go type is not proven keeps the helper call.
import { goChanMask, goChanClose } from './go-chan.js';

const WS_FIELDS = [ 'Orderbooks', 'Ohlcvs', 'Trades', 'FundingRates' ];
const FIELD = WS_FIELDS.join ('|');
const RECEIVER = new RegExp ('^this\\.(?:' + FIELD + ')$');
// the second level of the ohlcv book: a plain map[string]any (a missing symbol reads as a nil map)
const OHLCV_BOOK = /^this\.Ohlcvs\[(?:\*?\w+|"[^"\\\n]*")\]$/;
const isCacheReceiver = (text: string): boolean => RECEIVER.test (text) || OHLCV_BOOK.test (text);
const ANY_FIELD = new RegExp ('this\\.(?:' + FIELD + ')\\b');
const STATEMENT_CALL = new RegExp ('^\\s*(?:ccxt\\.)?(?:AddElementToObject|Remove)\\(this\\.(?:' + FIELD + ')(?:\\[[^\\]]*\\])?, ');
const RECEIVER_CALL = /(?<![\w.])(?:ccxt\.)?(?:AddElementToObject|GetValue|InOp|Remove)\(/g;

// Go types of a store value the helper's derefScalar leaves untouched: cache objects, dictionaries,
// slices. `any` locals are absent on purpose — they may hold a *int64 / *string box.
const PLAIN_VALUE_TYPES = /^(?:map\[|\[\]|(?:\*)?ccxt\.[A-Z]|(?:\*)?(?:ArrayCache|OrderBook))/;

type Decl = { 'type': string, 'line': number, 'init'?: string };

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
export function hx10G10Decls (body: string[], signature: string): Map<string, Decl> {
    const decls = new Map<string, Decl> ();
    const add = (name: string, type: string, line: number, init?: string) => {
        const seen = decls.get (name);
        if (seen === undefined) {
            decls.set (name, { 'type': type, 'line': line, 'init': init });
        } else {
            seen.type = '?';
        }
    };
    for (const [ name, type ] of hx10G10Params (signature)) {
        add (name, type, 0);
    }
    body.forEach ((line, index) => {
        const declaration = /^\s*var (\w+) ([^=\n]+?) = (.*)$/.exec (line);
        if (declaration !== null) {
            add (declaration[1], declaration[2].trim (), index, declaration[3]);
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

// an earlier `if k == nil {` (or `|| ...`) whose block ends in return/panic/continue and has closed before
// the site proves k non-nil there, provided nothing in the func ever rebinds or address-takes k
function hx10G10ExitGuarded (key: string, maskedBody: string[], siteLine: number, declLine: number): boolean {
    const guard = new RegExp ('^\\s*if \\(?' + key + ' == nil\\)?(?: \\|\\| [^{]*)? \\{$');
    const write = [ new RegExp ('(?<![\\w.*&])' + key + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)'), new RegExp (',\\s*' + key + '\\s*:?=(?!=)'), new RegExp ('&' + key + '\\b'), new RegExp ('func\\([^)]*\\b' + key + '\\b') ];
    if (maskedBody.some ((line, i) => (i !== declLine) && write.some (w => w.test (line)))) {
        return false;
    }
    const siteDepth = hx10G10DepthBefore (maskedBody, siteLine);
    for (let k = 1; k < siteLine; k++) {
        const depth = hx10G10DepthBefore (maskedBody, k);
        if ((depth > siteDepth) || !guard.test (maskedBody[k])) {
            continue;
        }
        let close = k + 1;
        while ((close < siteLine) && !(maskedBody[close].trimStart ().startsWith ('}') && (hx10G10DepthBefore (maskedBody, close) === depth + 1))) {
            close++;
        }
        if ((close >= siteLine) || (maskedBody[close].trim () !== '}') || !hx10G10BlockStillOpen (maskedBody, close, siteLine, depth - 1)) {
            continue; // the site sits inside the guard block, an else arm follows, or the enclosing block closed
        }
        let last = close - 1;
        while ((last > k) && (maskedBody[last].trim () === '')) {
            last--;
        }
        if ((hx10G10DepthBefore (maskedBody, last) === depth + 1) && /^\s*(?:return\b.*|panic\(.*\)|continue)$/.test (maskedBody[last])) {
            return true;
        }
    }
    return false;
}

// `var k *string = this.SafeString(obj, key, "lit")` never holds nil (the default slot is a string literal,
// and the base getter returns a pointer to it), so an unwritten, un-aliased local of that shape is a plain key
function hx10G10LiteralDefaultPtr (maskedBody: string[], name: string, decl: Decl): boolean {
    const m = /^this\.SafeString(2)?\(/.exec (decl.init ?? '');
    if ((m === null) || (decl.init === undefined) || !decl.init.endsWith (')')) {
        return false;
    }
    const masked = goChanMask (decl.init);
    const call = hx10G10CallAt (masked, 0, 'SafeString');
    if ((call === undefined) || (call.close !== masked.length)) {
        return false;
    }
    const slot = (m[1] === '2') ? 3 : 2;
    const args = call.args.map (a => decl.init?.substring (a.s, a.e).trim () ?? '');
    if ((args.length !== slot + 1) || !/^"(?:[^"\\\n]|\\.)*"$/.test (args[slot])) {
        return false;
    }
    const rebound = new RegExp ('(?<![\\w.*])' + name + '\\s*(?:,\\s*\\w+\\s*)*(?::=|=(?!=))|&' + name + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' ');
    return maskedBody.every ((line, index) => (index === decl.line) || !rebound.test (line));
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
    if (hx10G10NilGuarded (key, maskedBody, siteLine) || hx10G10ExitGuarded (key, maskedBody, siteLine, decl.line) || hx10G10LiteralDefaultPtr (maskedBody, key, decl)) {
        return '*' + key;
    }
    const deref = new RegExp ('(?<![\\w*.])[*]' + key + '\\b');
    const siteDepth = hx10G10DepthBefore (maskedBody, siteLine);
    for (let k = 0; k < siteLine; k++) {
        if (!deref.test (maskedBody[k])) {
            continue;
        }
        const depth = hx10G10DepthBefore (maskedBody, k);
        // the deref sits INSIDE its block, whose closing brace is read at that same depth
        if ((depth > siteDepth) || (depth < 1) || !hx10G10BlockStillOpen (maskedBody, k, siteLine, depth - 1)) {
            continue; // a deeper block, or one the site has already left
        }
        return '*' + key;
    }
    return undefined;
}

// an `any` local whose declaration and every rebinding is a cache-object producer (never a boxed
// scalar pointer) and whose address is never taken: derefScalar leaves it alone, so the store is native
const CACHE_OBJECT_PRODUCER = /^(?:nil|(?:ccxt\.)?New[A-Z]\w*\(.*\)|this\.(?:OrderBook|IndexedOrderBook|CountedOrderBook)\(.*\)|(?:ccxt\.)?(?:this\.SafeValue\(this\.(?:Orderbooks|Trades|FundingRates), \*?\w+\)|GetValue\(this\.(?:Orderbooks|Trades|FundingRates), \*?\w+\))|this\.(?:Orderbooks|Trades|FundingRates)\[\*?\w+\])$/;

function hx10G10CacheObjectLocal (name: string, decl: Decl, maskedBody: string[]): boolean {
    if ((decl.type !== 'any') || !/^\w+$/.test (name) || (decl.init === undefined) || !CACHE_OBJECT_PRODUCER.test (decl.init.trim ())) {
        return false;
    }
    const rebound = new RegExp ('(?:^|[^\\w.&*])' + name + '\\s*(=(?!=)|:=)\\s*(.*)$');
    const taken = new RegExp ('&\\s*' + name + '\\b');
    return maskedBody.every ((line, index) => {
        if ((index === decl.line) || (line.indexOf (name) < 0)) {
            return true;
        }
        const m = rebound.exec (line);
        if (taken.test (line) || (m !== null && (m[1] === ':=' || !CACHE_OBJECT_PRODUCER.test (m[2].trim ())))) {
            return false;
        }
        return !new RegExp ('\\b' + name + '\\s*,[^=:]*:?=').test (line);
    });
}

function hx10G10PlainValue (value: string, decls: Map<string, Decl>, maskedBody: string[] = []): boolean {
    const text = value.trim ();
    if (/^(?:map\[|\[\])/.test (text) || /^(?:ccxt\.)?New[A-Z]\w*\(/.test (text)
        || /^this\.(?:OrderBook|IndexedOrderBook|CountedOrderBook|SafeDict|Extend|DeepExtend)\(/.test (text)) {
        return true;
    }
    const decl = decls.get (text);
    if (decl === undefined) {
        return false;
    }
    return PLAIN_VALUE_TYPES.test (decl.type) || hx10G10CacheObjectLocal (text, decl, maskedBody);
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
    if ((key === undefined) || !(RECEIVER.test (args[0] ?? '') || ((name === 'Remove') && OHLCV_BOOK.test (args[0] ?? '')))) {
        return undefined;
    }
    const indent = /^(\s*)/.exec (line)?.[1] ?? '';
    if (name === 'Remove') {
        return (call.args.length === 2) ? indent + 'delete(' + args[0] + ', ' + key + ')' : undefined;
    }
    if ((call.args.length !== 3) || !hx10G10PlainValue (args[2] ?? '', decls, maskedBody)) {
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
    if ((key === undefined) || !isCacheReceiver (args[0] ?? '')) {
        return undefined;
    }
    const before = line.substring (cond[1].length, call.at);
    const after = line.substring (call.close);
    // the lookup moves into the if-init, ahead of a `key != nil &&` term of the same condition
    if (/\bok\b/.test (before + after) || !hx10G10OkIsIfLocal (maskedBody) || (key.startsWith ('*') && new RegExp ('\\b' + key.substring (1) + '\\b').test (before + after))) {
        return undefined;
    }
    const rest = (before + 'ok' + after).replace (/(^|[^\w)\]])(\(ok\))/g, '$1ok');
    return cond[1] + '_, ok := ' + args[0] + '[' + key + ']; ' + rest;
}

// a name declared more than once in the func (one `var symbol string` per branch) is typed by the
// nearest declaration whose block is still open at the site
export function hx10G10DeclsAt (body: string[], maskedBody: string[], decls: Map<string, Decl>, site: number): Map<string, Decl> {
    let view = decls;
    const siteDepth = hx10G10DepthBefore (maskedBody, site);
    for (const [ name, decl ] of decls) {
        if (decl.type !== '?') {
            continue;
        }
        for (let k = site - 1; k >= 1; k--) {
            const declaration = /^\s*var (\w+) ([^=\n]+?) = /.exec (maskedBody[k]);
            if ((declaration === null) || (declaration[1] !== name)) {
                continue;
            }
            const init = /^\s*var \w+ [^=\n]+? = (.*)$/.exec (body[k])?.[1];
            const depth = hx10G10DepthBefore (maskedBody, k);
            if ((depth <= siteDepth) && hx10G10BlockStillOpen (maskedBody, k, site, depth)) {
                view = (view === decls) ? new Map (decls) : view;
                view.set (name, { 'type': declaration[2].trim (), 'line': k, 'init': init });
                break;
            }
        }
    }
    return view;
}

// every `ok` of the func is the local of an `if x, ok := ...; ...` header, so a new header `ok` shadows nothing
export function hx10G10OkIsIfLocal (maskedBody: string[]): boolean {
    return maskedBody.every (line => !/\bok\b/.test (line) || /^\s*(?:\} else )?if (?:\w+|_), ok := [^;]+; .*\{$/.test (line));
}

// `if !(InOp(this.F, k)) {` whose whole block is pure `var x = this.Safe*(..)` reads and one `if k != nil {` (a nil
// key skips the lot) swaps the two headers: the nil guard goes outside and the lookup inside it is the
// native comma-ok. Returns the line of the printed lookup (0 when the block does not qualify).
const HX10_G10_PURE_DECL = /^var \w+ [^=]+ = (?:this\.(?:Safe\w+|OrderBook|IndexedOrderBook|CountedOrderBook)\(|ccxt\.Safe\w+\()[^\n]*$/;

function hx10G10SwapNilGuard (body: string[], maskedBody: string[], decls: Map<string, Decl>, index: number): number {
    const head = new RegExp ('^(\\t*)if !\\((?:ccxt\\.)?InOp\\((this\\.(?:' + FIELD + ')), (\\w+)\\)\\) \\{$').exec (maskedBody[index]);
    if ((head === null) || (index + 1 >= body.length)) {
        return 0;
    }
    const [ , indent, receiver, key ] = head;
    if (hx10G10DeclsAt (body, maskedBody, decls, index).get (key)?.type !== '*string') {
        return 0;
    }
    let guard = index + 1;
    while ((guard < body.length) && maskedBody[guard].startsWith (indent + '\t') && HX10_G10_PURE_DECL.test (maskedBody[guard].substring (indent.length + 1)) && !body[guard].endsWith ('{')) {
        guard++;
    }
    if ((guard + 1 >= body.length) || (maskedBody[guard] !== indent + '\tif ' + key + ' != nil {')) {
        return 0;
    }
    let close = guard + 1;
    while ((close < body.length) && (maskedBody[close] !== indent + '\t}') && (maskedBody[close] !== indent + '}')) {
        close++;
    }
    if ((close + 1 >= body.length) || (maskedBody[close] !== indent + '\t}') || (maskedBody[close + 1] !== indent + '}') || !hx10G10OkIsIfLocal (maskedBody)) {
        return 0;
    }
    body[index] = indent + 'if ' + key + ' != nil {';
    body[guard] = indent + '\tif _, ok := ' + receiver + '[*' + key + ']; !ok {';
    maskedBody[index] = body[index];
    maskedBody[guard] = body[guard];
    return guard;
}

function hx10G10Rewrite (content: string): string {
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
            if (ANY_FIELD.test (maskedBody[i])) {
                hx10G10SwapNilGuard (body, maskedBody, decls, i);
            }
            const rewritten = hx10G10Line (body, maskedBody, ANY_FIELD.test (maskedBody[i]) ? hx10G10DeclsAt (body, maskedBody, decls, i) : decls, i);
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
    if ((call.args.length !== 3) || !hx10G10PlainValue (args[2] ?? '', decls, maskedBody)) {
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
    ok (f ('symbol string', '\tvar orderbook any = this.ParseThing()\n\tccxt.AddElementToObject(this.Orderbooks, symbol, orderbook)\n').indexOf ('AddElementToObject(this.Orderbooks') >= 0,
        'boxed write value keeps AddElementToObject');
    // an `any` local bound only to cache-object producers (never rebound, address never taken) stores natively
    const cacheLocal = (tail: string) => f ('symbol string', '\tvar orderbook any = this.SafeValue(this.Orderbooks, symbol)\n' + tail + '\tccxt.AddElementToObject(this.Orderbooks, symbol, orderbook)\n');
    ok (cacheLocal ('\tif ccxt.IsEqual(orderbook, nil) {\n\t\torderbook = this.OrderBook(map[string]any{})\n\t}\n').indexOf ('\tthis.Orderbooks[symbol] = orderbook') >= 0, 'a cache-object any local stores natively');
    ok (cacheLocal ('\torderbook = this.ParseThing()\n').indexOf ('AddElementToObject(this.Orderbooks') >= 0, 'a rebind to an unproven producer keeps the helper');
    ok (cacheLocal ('\tfoo(&orderbook)\n').indexOf ('AddElementToObject(this.Orderbooks') >= 0, 'an address-taken any local keeps the helper');
    // membership: the comma-ok of the helper's map branch, negated and compound
    ok (f ('sym string', '\tif ccxt.InOp(this.Orderbooks, sym) {\n\t}\n').indexOf ('\tif _, ok := this.Orderbooks[sym]; ok {') >= 0, 'InOp goes native');
    ok (f ('sym string', '\tif !(ccxt.InOp(this.Orderbooks, sym)) {\n\t}\n').indexOf ('\tif _, ok := this.Orderbooks[sym]; !ok {') >= 0, 'negated InOp goes native');
    // a deref inside a sibling block that has already closed proves nothing: the read stays behind its own nil guard
    const sibling = f ('symbol *string', '\tif x {\n\t\tvar h string = *symbol\n\t}\n\tif y {\n\t\tvar book any = ccxt.GetValue(this.Orderbooks, symbol)\n\t}\n');
    ok (sibling.indexOf ('GetValue(this.Orderbooks, symbol)') < 0 && sibling.indexOf ('if symbol != nil {\n\t\t\tbook = this.Orderbooks[*symbol]') >= 0 && sibling.indexOf ('book any = this.Orderbooks[*symbol]') < 0,
        'a deref in a closed sibling block does not prove the key');
    // a `*string` local whose only write is a SafeString with a literal default is never nil
    ok (f ('', '\tvar symbol *string = this.SafeString(market, "symbol", "")\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t}\n').indexOf ('if _, ok := this.Orderbooks[*symbol]; !ok {') >= 0, 'a literal-default SafeString key goes native');
    ok (f ('', '\tvar symbol *string = this.SafeString(market, "symbol")\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t}\n').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a no-default SafeString key keeps InOp');
    ok (f ('', '\tvar symbol *string = this.SafeString(market, "symbol", "")\n\tsymbol = this.SafeString(x, "s")\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t}\n').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a rebound key keeps InOp');
    // second level of the ohlcv book: delete on a proven key, one declaration per branch typed by scope
    ok (f ('symbol *string, timeframe string', '\tvar u string = *symbol\n\tccxt.Remove(this.Ohlcvs[*symbol], timeframe)\n').indexOf ('\tdelete(this.Ohlcvs[*symbol], timeframe)') >= 0, 'Remove on the ohlcv book goes native');
    ok (f ('symbol *string, timeframe any', '\tccxt.Remove(this.Ohlcvs[*symbol], timeframe)\n').indexOf ('ccxt.Remove(this.Ohlcvs[*symbol]') >= 0, 'unproven timeframe keeps Remove');
    ok (f ('', '\tif x {\n\t\tvar s string = \"a\"\n\t\tif ccxt.InOp(this.Orderbooks, s) {\n\t\t\tccxt.Remove(this.Orderbooks, s)\n\t\t}\n\t} else {\n\t\tvar s *string = nil\n\t\t_ = s\n\t}\n').indexOf ('if _, ok := this.Orderbooks[s]; ok {\n\t\t\tdelete(this.Orderbooks, s)') >= 0, 'a branch-scoped string declaration types its site');
    ok (f ('s string', '\tif _, ok := this.Trades[s]; ok {\n\t}\n\tif ccxt.InOp(this.Orderbooks, s) {\n\t}\n').indexOf ('if _, ok := this.Orderbooks[s]; ok {') >= 0, 'an if-local ok does not block the rewrite');
    ok (f ('s string', '\tvar ok bool = true\n\tif ccxt.InOp(this.Orderbooks, s) {\n\t}\n').indexOf ('InOp(this.Orderbooks, s)') >= 0, 'a func-level ok keeps the helper');
    ok (f ('symbol string, timeframe *string', '\tif (timeframe != nil) && (ccxt.InOp(this.Ohlcvs[symbol], timeframe)) {\n\t}\n').indexOf ('InOp(this.Ohlcvs[symbol], timeframe)') >= 0, 'a lookup ahead of its own nil guard keeps InOp');
    // an earlier `if k == nil { return }` proves the key for later lookups; a rebind, a guard that falls
    // through, or a site inside the guard block keeps the helper
    const exitGuard = (guard: string, tail: string) => f ('', '\tvar symbol *string = this.SafeString(m, \"s\")\n' + guard + tail + '\tif ccxt.InOp(this.Orderbooks, symbol) {\n\t}\n');
    ok (exitGuard ('\tif symbol == nil {\n\t\treturn\n\t}\n', '').indexOf ('if _, ok := this.Orderbooks[*symbol]; ok {') >= 0, 'an exiting nil guard proves the key');
    ok (exitGuard ('\tif symbol == nil {\n\t\tcontinue\n\t}\n', '').indexOf ('if _, ok := this.Orderbooks[*symbol]; ok {') >= 0, 'a continue guard proves the key');
    ok (exitGuard ('\tif symbol == nil {\n\t\tx()\n\t}\n', '').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a guard that falls through keeps InOp');
    ok (exitGuard ('\tif symbol == nil {\n\t\treturn\n\t}\n', '\tsymbol = this.SafeString(m, \"t\")\n').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a rebound key keeps InOp');
    ok (exitGuard ('\tif symbol == nil {\n\t\treturn\n\t} else {\n\t\tx()\n\t}\n', '').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a guard with an else arm keeps InOp');
    ok (f ('symbol *string', '\tif symbol == nil {\n\t\tif ccxt.InOp(this.Orderbooks, symbol) {\n\t\t}\n\t\treturn\n\t}\n').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a site inside the guard block keeps InOp');
    // a lookup whose whole block is one nil guard on the key swaps headers; anything else keeps InOp
    const swap = (inner: string) => f ('', '\tvar symbol *string = ccxt.SafeStringPtr(m[\"symbol\"])\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n' + inner + '\t}\n');
    ok (swap ('\t\tif symbol != nil {\n\t\t\tthis.Orderbooks[*symbol] = this.OrderBook()\n\t\t}\n').indexOf ('\tif symbol != nil {\n\t\tif _, ok := this.Orderbooks[*symbol]; !ok {\n\t\t\tthis.Orderbooks[*symbol] = this.OrderBook()\n\t\t}\n\t}') >= 0, 'a nil-guard-only lookup block swaps headers');
    ok (swap ('\t\tccxt.AddElementToObject(this.Orderbooks, symbol, this.OrderBook())\n').indexOf ('\tif symbol != nil {\n\t\tif _, ok := this.Orderbooks[*symbol]; !ok {\n\t\t\tthis.Orderbooks[*symbol] = this.OrderBook()\n\t\t}\n\t}') >= 0, 'the guard the write rewrite prints swaps too');
    ok (swap ('\t\tvar limit *int64 = this.SafeInteger(m, \"depth\")\n\t\tif symbol != nil {\n\t\t\tthis.Orderbooks[*symbol] = this.CountedOrderBook(map[string]any{}, limit)\n\t\t}\n').indexOf ('\tif symbol != nil {\n\t\tvar limit *int64 = this.SafeInteger(m, \"depth\")\n\t\tif _, ok := this.Orderbooks[*symbol]; !ok {') >= 0, 'pure Safe* reads ahead of the guard swap too');
    ok (swap ('\t\tvar limit *int64 = this.Next(m)\n\t\tif symbol != nil {\n\t\t\tx()\n\t\t}\n').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a non-pure declaration keeps InOp');
    ok (swap ('\t\tif symbol != nil {\n\t\t\tx()\n\t\t}\n\t\ty()\n').indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'a block with a sibling statement keeps InOp');
    // the printer's *sync.Map arms
    ok (f ('sym string', '\tthis.Orderbooks.Store(sym, this.OrderBook())\n').indexOf ('\tthis.Orderbooks[sym] = this.OrderBook()') >= 0, 'Store goes native');
    ok (f ('sym string', '\tthis.Orderbooks.Delete(sym)\n').indexOf ('\tdelete(this.Orderbooks, sym)') >= 0, 'Delete goes native');
    ok (f ('', '\tthis.Trades = this.CreateSafeDictionary(true)\n').indexOf ('\tthis.Trades = map[string]any{}') >= 0, 'cache init prints a map literal');
    // a nil-guarded *string key into a base map: one nil check, then the native comma-ok
    const g = (sig: string, body: string) => hx11w9NilGuardInOpPass ('func (this *X) H(' + sig + ') {\n' + body + '}\n');
    const nilGuard = (sig: string, guard: string, tail = '') => g (sig, '\tif ' + guard + ' {\n\t\tx = GetValue(this.Markets(), symbol)\n\t}' + tail + '\n');
    ok (nilGuard ('symbol *string', '(symbol != nil) && (this.Markets() != nil) && (ccxt.InOp(this.Markets(), symbol))').indexOf ('\tif symbol != nil {\n\t\tif _, ok := this.Markets()[*symbol]; ok {\n\t\t\tx = this.Markets()[*symbol]') >= 0, 'guard present goes native');
    ok (nilGuard ('symbol *string', '(!ccxt.IsEqual(symbol, nil)) && (ccxt.InOp(this.Markets_by_id(), symbol))').indexOf ('this.Markets_by_id()[*symbol]; ok') >= 0, 'IsEqual guard goes native');
    ok (nilGuard ('symbol *string', '(this.Markets() != nil) && (ccxt.InOp(this.Markets(), symbol))').indexOf ('InOp(this.Markets(), symbol)') >= 0, 'guard absent keeps InOp');
    ok (nilGuard ('symbol any', '(symbol != nil) && (ccxt.InOp(this.Markets(), symbol))').indexOf ('InOp(this.Markets(), symbol)') >= 0, 'an any key keeps InOp');
    ok (nilGuard ('symbol *string', '(symbol != nil) && (ccxt.InOp(this.Markets(), symbol))', '').indexOf ('x = this.Markets()[*symbol]') >= 0, 'plain tail');
    ok (g ('symbol *string', '\tif (symbol != nil) && (ccxt.InOp(this.Markets(), symbol)) {\n\t\tsymbol = this.SafeString(m, \"s\")\n\t}\n').indexOf ('InOp(this.Markets(), symbol)') >= 0, 'a key rebound inside the block keeps InOp');
    ok (nilGuard ('symbol *string', '(symbol != nil) && (ccxt.InOp(this.Markets(), symbol))', '\n\tif y {\n\t}').indexOf ('InOp(') < 0, 'a sibling block is left alone');
    ok (g ('symbol *string', '\tif (symbol != nil) && (ccxt.InOp(this.Markets(), symbol)) {\n\t\ta()\n\t} else {\n\t\tb()\n\t}\n').indexOf ('InOp(this.Markets(), symbol)') >= 0, 'an else arm keeps InOp');
    ok (g ('symbol *string', '\tvar known bool = (symbol != nil) && (this.Markets() != nil) && (ccxt.InOp(this.Markets(), symbol))\n').indexOf ('\tvar known bool\n\tif symbol != nil {\n\t\t_, known = this.Markets()[*symbol]\n\t}') >= 0, 'a bool initialiser goes native');
    // a field outside the family is untouched
    ok (f ('', '\tthis.Balance = this.CreateSafeDictionary(true)\n').indexOf ('this.CreateSafeDictionary(true)') >= 0, 'Balance keeps the sync.Map init');
    return problems;
}

// `if (k != nil) && (m != nil) && (InOp(m, k)) {` with k a `*string` and m a plain map[string]any: the same
// `&&` guard proves k non-nil, so the lookup is a native comma-ok behind one `k != nil` check
export const NIL_SAFE_MAP = /^this\.(?:Markets|Markets_by_id|Currencies|Currencies_by_id)\(\)$/;

export function hx11w9Terms (line: string, masked: string): string[] | undefined {
    const terms: string[] = [];
    let depth = 0;
    let from = 0;
    for (let i = 0; i <= masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) {
            depth++;
        } else if ((c === ')') || (c === ']') || (c === '}')) {
            depth--;
        }
        if ((i === masked.length) || ((depth === 0) && masked.startsWith (' && ', i))) {
            let term = line.substring (from, i).trim ();
            let m = masked.substring (from, i).trim ();
            while (m.startsWith ('(') && (goChanClose (m, 0) === m.length)) {
                term = term.substring (1, term.length - 1).trim ();
                m = m.substring (1, m.length - 1).trim ();
            }
            terms.push (term);
            from = i + 4;
        }
    }
    return (depth === 0) ? terms : undefined;
}

// the lookup shape of a condition: the key, the receiver, or undefined when anything else is in it
function hx11w9Lookup (cond: string, maskedCond: string, decls: Map<string, Decl>): { key: string, receiver: string } | undefined {
    const terms = hx11w9Terms (cond, maskedCond);
    const inops = (terms ?? []).map (t => /^(?:ccxt\.)?InOp\((.+), (\w+)\)$/.exec (t)).filter (m => m !== null);
    if ((terms === undefined) || (inops.length !== 1) || (inops[0] === null)) {
        return undefined;
    }
    const [ , receiver, key ] = inops[0];
    const decl = decls.get (receiver);
    if (!NIL_SAFE_MAP.test (receiver) && (decl?.type !== 'map[string]any')) {
        return undefined;
    }
    const isGuard = (t: string) => (t === key + ' != nil') || new RegExp ('^!(?:ccxt\\.)?IsEqual\\(' + key + ', nil\\)$').test (t);
    const guardAt = terms.findIndex (isGuard);
    const inopAt = terms.findIndex (t => /^(?:ccxt\.)?InOp\(/.test (t));
    const rest = terms.filter ((t, i) => (i !== guardAt) && (i !== inopAt) && (t !== receiver + ' != nil'));
    return ((guardAt >= 0) && (guardAt < inopAt) && (terms.filter (isGuard).length === 1) && (rest.length === 0)) ? { key, receiver } : undefined;
}

export function hx11w9NilGuardInOpPass (content: string): string {
    if (!/\bInOp\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const out: string[] = [];
    let k = 0;
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
        const plain = hx10G10OkIsIfLocal (maskedBody);
        for (let i = 1; i < body.length; i++) {
            const head = /^(\t*)if (.+) \{$/.exec (maskedBody[i]);
            const flag = /^(\t*)var (\w+) bool = (.+)$/.exec (maskedBody[i]);
            const m = head ?? flag;
            if ((m === null) || !plain || /;/.test (maskedBody[i]) || !/\bInOp\(/.test (maskedBody[i])) {
                continue;
            }
            const maskedCond = m[m.length - 1];
            const at = body[i].length - maskedCond.length - ((head !== null) ? 2 : 0);
            const view = hx10G10DeclsAt (body, maskedBody, decls, i);
            const look = hx11w9Lookup (body[i].substring (at, at + maskedCond.length), maskedCond, view);
            if ((look === undefined) || (view.get (look.key)?.type !== '*string')) {
                continue;
            }
            const indent = m[1];
            const read = look.receiver + '[*' + look.key + ']';
            if (flag !== null) {
                body.splice (i, 1, indent + 'var ' + m[2] + ' bool', indent + 'if ' + look.key + ' != nil {', indent + '\t_, ' + m[2] + ' = ' + read, indent + '}');
                maskedBody.splice (i, 1, ...body.slice (i, i + 4).map (l => goChanMask (l)));
                i += 3;
                continue;
            }
            // only a then-block with no else arm: the nil case then falls straight past it
            let close = i + 1;
            while ((close < body.length) && !maskedBody[close].startsWith (indent + '}')) {
                close++;
            }
            if ((close >= body.length) || (maskedBody[close] !== indent + '}')) {
                continue;
            }
            const writes = new RegExp ('(?<![\\w.*&])' + look.key + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|&' + look.key + '\\b');
            if (maskedBody.slice (i + 1, close).some (l => writes.test (l))) {
                continue; // the block rebinds the key: the lookup would read a different one
            }
            const reads = [ 'GetValue(' + look.receiver + ', ' + look.key + ')', 'ccxt.GetValue(' + look.receiver + ', ' + look.key + ')' ];
            const inner = body.slice (i + 1, close).map (l => reads.reduce ((acc, r) => acc.split (r).join (read), (l === '' ? l : '\t' + l)));
            const opened = [ indent + 'if ' + look.key + ' != nil {', indent + '\tif _, ok := ' + read + '; ok {' ];
            const closed = [ indent + '\t}', indent + '}' ];
            const replacement = opened.concat (inner, closed);
            body.splice (i, close - i + 1, ...replacement);
            maskedBody.splice (i, close - i + 1, ...goChanMask (replacement.join ('\n')).split ('\n'));
            i += 1;
        }
        out.push (...body);
        k = end + 1;
    }
    return out.join ('\n');
}

// the swap runs on the settled output: the inner `if k != nil {` is what the guarded write above printed
export function hx10G10Pass (content: string): string {
    const rewritten = hx10G10Rewrite (content);
    if (!ANY_FIELD.test (rewritten)) {
        return rewritten;
    }
    const lines = rewritten.split ('\n');
    const masked = goChanMask (rewritten).split ('\n');
    if (lines.length !== masked.length) {
        return rewritten;
    }
    let k = 0;
    while (k < lines.length) {
        if (!lines[k].startsWith ('func (this *')) {
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
        for (let i = 1; i < body.length; i++) {
            const guard = hx10G10SwapNilGuard (body, maskedBody, decls, i);
            if (guard > 0) {
                lines[k + i] = body[i];
                lines[k + guard] = body[guard];
            }
        }
        k = end + 1;
    }
    return lines.join ('\n');
}
