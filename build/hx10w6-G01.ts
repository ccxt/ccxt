// HX10 wave6 G01: BaseExchange.Balance is a plain map[string]any owned by the exchange's ws dispatch
// loop, and an account entry is read through the loop's typed views, so the helper calls the printer
// emits on either level become a native map operation. Handler code runs on that loop; a user-path
// body hands its work to the loop and keeps the helper call.
import { goChanMask, goChanClose } from './go-chan.js';

const FIELD = 'this.Balance';
// the owner's typed views: one answers the entry a read lands in, the other the entry a write lands in
// (a write needs a map that exists, like the handler's own ensure step creates)
const ENTRY_READ = 'this.WsBalanceEntry';
const ENTRY_WRITE = 'this.WsBalanceEntryForWrite';
const ANY_FIELD = /this\.Balance\b/;
const USER_PATH = /^(?:(?:watch|fetch|seed)\w*Body|loadBalanceSnapshotBody|SetBalanceCache|CleanWsData)$/;
const FUNC_HEAD = /^func \((?:[^)]*)\) (\w+)\s*\(/;
// top-level balance keys that can hold a boxed scalar: the helper unboxes them with derefScalar, so a
// plain index read would hand back the pointer
const BOXED_KEYS = [ '"info"', '"timestamp"', '"datetime"', '"free"', '"used"', '"total"' ];
// a store value the helper's derefScalar leaves untouched: a dictionary or a list
const PLAIN_VALUE_TYPES = /^(?:map\[|\[\])/;
const PLAIN_VALUE_CALLS = /^this\.(?:Iso\w+|SafeBalance|SafeDict|ParseBalance|ParseWsBalance|PruneStaleBalanceKeys|Extend|DeepExtend)\(/;
// an account entry holds a dictionary, so its stores take the dictionary producers only: an Iso* value
// is a pointer the helper would unbox, and a native store would keep it boxed in the entry
const ENTRY_PLAIN_CALLS = /^this\.(?:SafeBalance|SafeDict|ParseBalance|ParseWsBalance|PruneStaleBalanceKeys|Extend|DeepExtend)\(/;

type Decl = { 'type': string, 'line': number };

type Span = { s: number, e: number, text: string };

type Call = { at: number, name: string, open: number, close: number, args: Span[] };

// `func (this *X) Name(a *string, b any)` -> [['a','*string'], ...] for the parameters only
function g03Params (signature: string): Array<[ string, string ]> {
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
    for (const span of g03Split (signature, open, close)) {
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
function g03Split (masked: string, open: number, close: number): Span[] {
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

// every name the function declares with the line it is declared on; a name declared twice never
// carries a proven type
function g03Decls (body: string[], signature: string): Map<string, Decl> {
    const decls = new Map<string, Decl> ();
    const add = (name: string, type: string, line: number) => {
        const seen = decls.get (name);
        if (seen === undefined) {
            decls.set (name, { 'type': type, 'line': line });
        } else {
            seen.type = '?';
        }
    };
    for (const [ name, type ] of g03Params (signature)) {
        add (name, type, 0);
    }
    body.forEach ((line, index) => {
        const declaration = /^\s*var (\w+) ([^=\n]+?) = /.exec (line);
        if (declaration !== null) {
            add (declaration[1], declaration[2].trim (), index);
        }
        for (const short of line.matchAll (/(?<![\w.])(\w+)(?:, \w+)* := /g)) {
            add (short[1], '?', index);
        }
    });
    return decls;
}

function g03DepthBefore (maskedBody: string[], line: number): number {
    let depth = 0;
    for (let k = 0; k < line; k++) {
        depth += (maskedBody[k].split ('{').length - maskedBody[k].split ('}').length);
    }
    return depth;
}

// the block at `depth` holding line `from` is still open at `to` (no line between closes it)
function g03BlockStillOpen (maskedBody: string[], from: number, to: number, depth: number): boolean {
    for (let j = from + 1; j < to; j++) {
        if (maskedBody[j].trimStart ().startsWith ('}') && (g03DepthBefore (maskedBody, j) === depth + 1)) {
            return false;
        }
    }
    return true;
}

// an `if k != nil {` block enclosing the site proves the pointer key non-nil
function g03NilGuarded (key: string, maskedBody: string[], siteLine: number): boolean {
    const guard = new RegExp ('^\\s*if \\(?' + key + ' != nil\\)?(?: && [^|]*)? \\{$');
    const siteDepth = g03DepthBefore (maskedBody, siteLine);
    for (let k = siteLine - 1; k >= 0; k--) {
        const depth = g03DepthBefore (maskedBody, k);
        if ((depth >= siteDepth) || !guard.test (maskedBody[k])) {
            continue;
        }
        if (g03BlockStillOpen (maskedBody, k, siteLine, depth)) {
            return true;
        }
    }
    return false;
}

// the key as Go prints it: a string literal, a `string` local, or a `*string` local an enclosing nil
// guard or an earlier deref in the same block proves non-nil
function g03Key (maskedBody: string[], decls: Map<string, Decl>, key: string, siteLine: number): string | undefined {
    if (key.startsWith ('"')) {
        return (BOXED_KEYS.indexOf (key) < 0) ? key : undefined;
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
    if (g03NilGuarded (key, maskedBody, siteLine)) {
        return '*' + key;
    }
    const deref = new RegExp ('(?<![\\w*.])[*]' + key + '\\b');
    const siteDepth = g03DepthBefore (maskedBody, siteLine);
    for (let k = 0; k < siteLine; k++) {
        if (!deref.test (maskedBody[k])) {
            continue;
        }
        const depth = g03DepthBefore (maskedBody, k);
        if ((depth > siteDepth) || g03BlockStillOpen (maskedBody, k, siteLine, depth)) {
            continue; // a deeper block, or one the site has already left
        }
        return '*' + key;
    }
    return undefined;
}

function g03PlainValue (value: string, decls: Map<string, Decl>): boolean {
    const text = value.trim ();
    if (PLAIN_VALUE_TYPES.test (text) || PLAIN_VALUE_CALLS.test (text)) {
        return true;
    }
    const decl = decls.get (text);
    return (decl !== undefined) && (decl.type !== '?') && PLAIN_VALUE_TYPES.test (decl.type);
}

function g03CallAt (maskedLine: string, at: number, name: string): Call | undefined {
    const open = at + maskedLine.substring (at).indexOf ('(');
    if (open < at) {
        return undefined;
    }
    const close = goChanClose (maskedLine, open);
    if (close < 0) {
        return undefined;
    }
    return { 'at': at, name, open, close, 'args': g03Split (maskedLine, open, close) };
}

function g03StatementEnd (maskedLine: string, close: number): boolean {
    return /^\s*$/.test (maskedLine.substring (close));
}

// `this.Balance = value` is a whole-map replacement on the owner: the entries move into the same map
function g03Assign (line: string, maskedLine: string): string | undefined {
    const m = /^(\s*)this\.Balance = (\S.*)$/.exec (maskedLine);
    if (m === null) {
        return undefined;
    }
    const value = line.trim ().substring ('this.Balance = '.length).trim ();
    if (/^map\[string\]any\{/.test (value)) {
        return undefined; // already a plain map literal
    }
    return m[1] + 'this.WsBalanceReplace(' + value + ')';
}

// `AddElementToObject(this.Balance, k, v)` / `Remove(this.Balance, k)` as a whole statement
function g03Statement (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    const head = /^\s*(?:ccxt\.)?(?:AddElementToObject|Remove)\(this\.Balance, /.exec (maskedLine);
    if (head === null) {
        return undefined;
    }
    const name = /AddElementToObject|Remove/.exec (head[0])?.[0] as string;
    const call = g03CallAt (maskedLine, head[0].indexOf (name), name);
    if ((call === undefined) || !g03StatementEnd (maskedLine, call.close)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const key = g03Key (maskedBody, decls, args[1] ?? '', index);
    if ((key === undefined) || (args[0] ?? '') !== FIELD) {
        return undefined;
    }
    const indent = /^(\s*)/.exec (line)?.[1] ?? '';
    if (name === 'Remove') {
        return (call.args.length === 2) ? indent + 'delete(' + FIELD + ', ' + key + ')' : undefined;
    }
    if ((call.args.length !== 3) || !g03PlainValue (args[2] ?? '', decls)) {
        return undefined;
    }
    return indent + FIELD + '[' + key + '] = ' + args[2];
}

// `if InOp(this.Balance, k) {` -> `if _, ok := this.Balance[k]; ok {`, the helper's map branch
function g03InOp (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (maskedLine);
    if (cond === null) {
        return undefined;
    }
    const calls = [ ...maskedLine.matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
    if (calls.length !== 1) {
        return undefined;
    }
    const call = g03CallAt (maskedLine, calls[0].index, 'InOp');
    if ((call === undefined) || (call.args.length !== 2)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const key = g03Key (maskedBody, decls, args[1] ?? '', index);
    if ((key === undefined) || ((args[0] ?? '') !== FIELD)) {
        return undefined;
    }
    const before = line.substring (cond[1].length, call.at);
    const after = line.substring (call.close);
    if (/\bok\b/.test (before + after) || /\bok\b/.test (maskedBody.join ('\n'))) {
        return undefined;
    }
    const rest = (before + 'ok' + after).replace (/(^|[^\w)\]])(\(ok\))/g, '$1ok');
    return cond[1] + '_, ok := ' + FIELD + '[' + key + ']; ' + rest;
}

// `GetValue(this.Balance, k)` anywhere on the line -> `this.Balance[k]`
function g03GetValue (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    void maskedLine;
    const re = /(?<![\w.])(?:ccxt\.)?GetValue\(/g;
    const masked = goChanMask (line);
    let hit = re.exec (masked);
    while (hit !== null) {
        const call = g03CallAt (masked, hit.index, 'GetValue');
        if (call === undefined) {
            return undefined;
        }
        const args = call.args.map (a => line.substring (a.s, a.e).trim ());
        if ((call.args.length === 2) && ((args[0] ?? '') === FIELD)) {
            const key = g03Key (maskedBody, decls, args[1], index);
            if (key !== undefined) {
                return line.substring (0, call.at) + FIELD + '[' + key + ']' + line.substring (call.close);
            }
        }
        hit = re.exec (masked);
    }
    return undefined;
}

function g03EntryValue (value: string, decls: Map<string, Decl>): boolean {
    const text = value.trim ();
    if (PLAIN_VALUE_TYPES.test (text) || ENTRY_PLAIN_CALLS.test (text)) {
        return true;
    }
    const decl = decls.get (text);
    return (decl !== undefined) && (decl.type !== '?') && PLAIN_VALUE_TYPES.test (decl.type);
}

// the key of a store: the helper dereferences the key itself and the value it stores, so a literal
// naming a bookkeeping slot is a plain index here even though a read of it would hand back the pointer
function g03WriteKey (maskedBody: string[], decls: Map<string, Decl>, key: string, siteLine: number): string | undefined {
    if (key.startsWith ('"')) {
        return key;
    }
    return g03Key (maskedBody, decls, key, siteLine);
}

// top-level comma split of one argument text
function g03SplitText (text: string): string[] {
    const masked = goChanMask (text);
    const spans: Span[] = [];
    let depth = 0;
    let s = 0;
    for (let i = 0; i < text.length; i++) {
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
    spans.push ({ 's': s, 'e': text.length, 'text': '' });
    return spans.map (span => text.substring (span.s, span.e).trim ());
}

const ENTRY_CALL = /^(?:ccxt\.)?GetValue\(\s*(?:ccxt\.)?this\.Balance\s*,\s*([\s\S]+)\)$/;

// `GetValue(this.Balance, k)`: the account entry key the call reads
function g03EntryKey (args: Span[], line: string): string | undefined {
    const head = line.substring (args[0].s, args[0].e).trim ();
    const inner = ENTRY_CALL.exec (head);
    if (inner === null) {
        return undefined;
    }
    const parts = g03SplitText (inner[1]);
    return (parts.length === 1) ? parts[0] : undefined;
}

// `AddElementToObject(GetValue(this.Balance, k1), k2, v)` as a whole statement: the entry is a map the
// owner view answers, so the store is a native index write on it
function g03EntryStatement (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    const head = /^\s*(?:ccxt\.)?(?:AddElementToObject|Remove)\(/.exec (maskedLine);
    if (head === null) {
        return undefined;
    }
    const name = /AddElementToObject|Remove/.exec (head[0])?.[0] as string;
    const call = g03CallAt (maskedLine, head[0].indexOf (name), name);
    if ((call === undefined) || !g03StatementEnd (maskedLine, call.close) || (call.args.length < 2)) {
        return undefined;
    }
    const entry = g03EntryKey (call.args, line);
    if (entry === undefined) {
        return undefined;
    }
    const key1 = g03Key (maskedBody, decls, entry, index);
    const key2 = g03WriteKey (maskedBody, decls, line.substring (call.args[1].s, call.args[1].e).trim (), index);
    if ((key1 === undefined) || (key2 === undefined)) {
        return undefined;
    }
    const indent = /^(\s*)/.exec (line)?.[1] ?? '';
    if (name === 'Remove') {
        return (call.args.length === 2) ? indent + 'delete(' + ENTRY_READ + '(' + key1 + '), ' + key2 + ')' : undefined;
    }
    if (call.args.length !== 3) {
        return undefined;
    }
    const value = line.substring (call.args[2].s, call.args[2].e).trim ();
    if (!g03EntryValue (value, decls)) {
        return undefined;
    }
    return indent + ENTRY_WRITE + '(' + key1 + ')[' + key2 + '] = ' + value;
}

// `GetValue(GetValue(this.Balance, k1), k2)` anywhere on the line -> the entry's own index read
function g03EntryChain (line: string, maskedLine: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string | undefined {
    void maskedLine;
    const re = /(?<![\w.])(?:ccxt\.)?GetValue\(/g;
    const masked = goChanMask (line);
    let hit = re.exec (masked);
    while (hit !== null) {
        const call = g03CallAt (masked, hit.index, 'GetValue');
        if (call === undefined) {
            return undefined;
        }
        if (call.args.length === 2) {
            const entry = g03EntryKey (call.args, line);
            if (entry !== undefined) {
                const key1 = g03Key (maskedBody, decls, entry, index);
                const key2 = g03Key (maskedBody, decls, line.substring (call.args[1].s, call.args[1].e).trim (), index);
                if ((key1 !== undefined) && (key2 !== undefined)) {
                    return line.substring (0, call.at) + ENTRY_READ + '(' + key1 + ')[' + key2 + ']' + line.substring (call.close);
                }
            }
        }
        re.lastIndex = hit.index + 1; // the outer call consumed the inner ones: scan inside it
        hit = re.exec (masked);
    }
    return undefined;
}

const G03_RULES = [ g03Assign, g03EntryStatement, g03Statement, g03InOp, g03EntryChain, g03GetValue ];

function g03Line (line: string, decls: Map<string, Decl>, maskedBody: string[], index: number): string {
    for (let guard = 0; guard < 8; guard++) {
        const maskedLine = maskedBody[index];
        let next: string | undefined;
        for (const rule of G03_RULES) {
            next = rule (line, maskedLine, decls, maskedBody, index);
            if (next !== undefined) {
                break;
            }
        }
        if ((next === undefined) || (next === line)) {
            return line;
        }
        line = next;
        maskedBody[index] = goChanMask (line);
    }
    return line;
}

export function hx10w6G01BalanceOwner (content: string): string {
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
        const head = FUNC_HEAD.exec (lines[k]);
        if (head === null || USER_PATH.test (head[1])) {
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
        const decls = g03Decls (body, body[0]);
        out.push (body[0]);
        for (let i = 1; i < body.length; i++) {
            out.push (g03Line (body[i], decls, maskedBody, i));
        }
        k = end + 1;
    }
    return out.join ('\n');
}

export function hx10w6G01BalanceCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10w6-G01: ' + message); } };
    const handler = (text: string) => hx10w6G01BalanceOwner ('func (this *X) HandleBalance(message any, code *string) {\n' + text + '}\n');
    const userPath = (text: string) => hx10w6G01BalanceOwner ('func (this *X) watchBalanceBody(ch chan any, params any) {\n' + text + '}\n');
    ok (handler ('\tccxt.AddElementToObject(this.Balance, "margin", map[string]any{})\n').indexOf ('\tthis.Balance["margin"] = map[string]any{}') >= 0,
        'a literal-key write becomes a map write');
    ok (handler ('\tvar accountType string = "spot"\n\tccxt.AddElementToObject(this.Balance, accountType, map[string]any{})\n').indexOf ('\tthis.Balance[accountType] = map[string]any{}') >= 0,
        'a string-keyed write becomes a map write');
    ok (handler ('\tccxt.AddElementToObject(this.Balance, code, map[string]any{})\n').indexOf ('AddElementToObject') >= 0,
        'an unguarded *string key keeps the helper');
    ok (handler ('\tif code != nil {\n\t\tccxt.AddElementToObject(this.Balance, code, map[string]any{})\n\t}\n').indexOf ('this.Balance[*code] = map[string]any{}') >= 0,
        'a nil-guarded *string key reads natively');
    ok (handler ('\tccxt.AddElementToObject(this.Balance, "info", data)\n').indexOf ('AddElementToObject') >= 0,
        'an any value keeps the helper (derefScalar may unbox it)');
    ok (handler ('\tvar updatedBalance any = ccxt.GetValue(this.Balance, "cash")\n').indexOf ('this.Balance["cash"]') >= 0,
        'a literal-key read becomes a map read');
    ok (handler ('\tvar stamp any = ccxt.GetValue(this.Balance, "timestamp")\n').indexOf ('GetValue') >= 0,
        'a boxed-scalar key keeps the helper');
    ok (handler ('\tvar account any = ccxt.GetValue(this.Balance, message)\n').indexOf ('GetValue') >= 0,
        'an any key keeps the helper');
    ok (handler ('\tif !(ccxt.InOp(this.Balance, "spot")) {\n\t}\n').indexOf ('\tif _, ok := this.Balance["spot"]; !ok {') >= 0,
        'a membership test becomes comma-ok');
    ok (handler ('\tthis.Balance = this.SafeBalance(this.Balance)\n').indexOf ('\tthis.WsBalanceReplace(this.SafeBalance(this.Balance))') >= 0,
        'a whole-map assignment moves entries in place');
    ok (handler ('\tthis.Balance = map[string]any{}\n').indexOf ('\tthis.Balance = map[string]any{}\n') >= 0,
        'an empty-map reset stays native');
    ok (handler ('\tif ccxt.InOp(this.Balance, "swap") {\n\t\tccxt.Remove(this.Balance, "swap")\n\t}\n').indexOf ('\t\tdelete(this.Balance, "swap")') >= 0,
        'a remove becomes the native delete');
    ok (userPath ('\tccxt.AddElementToObject(this.Balance, typeVar, map[string]any{})\n').indexOf ('AddElementToObject') >= 0,
        'a user-path body keeps the owner operation');
    ok (handler ('\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, "cash"), "free", map[string]any{})\n').indexOf ('\tthis.WsBalanceEntryForWrite("cash")["free"] = map[string]any{}') >= 0,
        'a nested write is an index store on the entry the owner view answers');
    ok (handler ('\tvar accountType string = "spot"\n\tvar stats map[string]any = ccxt.SafeDict(this.Balance, accountType, map[string]any{})\n\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, accountType), "info", stats)\n').indexOf ('\tthis.WsBalanceEntryForWrite(accountType)["info"] = stats') >= 0,
        'a boxed-bookkeeping key is a store when its value is a dictionary');
    ok (handler ('\tvar accountType string = "spot"\n\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, accountType), "timestamp", this.Milliseconds())\n').indexOf ('AddElementToObject') >= 0,
        'a scalar into a bookkeeping slot keeps the helper');
    ok (handler ('\tvar accountType string = "spot"\n\tvar account map[string]any = map[string]any{}\n\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, accountType), code, account)\n').indexOf ('AddElementToObject') >= 0,
        'an unguarded *string store key keeps the helper');
    ok (handler ('\tvar accountType string = "spot"\n\tvar account map[string]any = map[string]any{}\n\tif code != nil {\n\t\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, accountType), code, account)\n\t}\n').indexOf ('\t\tthis.WsBalanceEntryForWrite(accountType)[*code] = account') >= 0,
        'a nil-guarded *string store key writes the entry natively');
    ok (handler ('\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, message), "info", data)\n').indexOf ('AddElementToObject') >= 0,
        'an any entry key keeps the helper');
    ok (handler ('\tvar symbol string = "BTC"\n\tvar free any = ccxt.GetValue(ccxt.GetValue(this.Balance, "cash"), symbol)\n').indexOf ('this.WsBalanceEntry("cash")[symbol]') >= 0,
        'an entry read is the entry map\'s own index');
    ok (handler ('\tvar free any = ccxt.GetValue(ccxt.GetValue(this.Balance, "cash"), "free")\n').indexOf ('GetValue') >= 0,
        'a boxed entry value keeps the helper');
    ok (handler ('\tvar symbol string = "BTC"\n\tccxt.Remove(ccxt.GetValue(this.Balance, "cash"), symbol)\n').indexOf ('\tdelete(this.WsBalanceEntry("cash"), symbol)') >= 0,
        'an entry removal becomes the native delete');
    ok (userPath ('\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, typeVar), "info", data)\n').indexOf ('AddElementToObject') >= 0,
        'a user-path body keeps the entry operation');
    return problems;
}

// the pass has to run inside formatGoSource, not only in its own self-test
export function g01BalanceWired (format: (filePath: string, content: string) => string): string[] {
    const out = format ('x.go', 'func (this *X) HandleBalance(message map[string]any) {\n\tccxt.AddElementToObject(this.Balance, "margin", map[string]any{})\n\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, "margin"), "info", message)\n}\n');
    const wired = out.includes ('\tthis.Balance["margin"] = map[string]any{}') && out.includes ('\tthis.WsBalanceEntryForWrite("margin")["info"] = message');
    return wired ? [] : [ 'hx10w6-G01: not wired into formatGoSource: ' + out ];
}
