// hx10w10-GP28: AddElementToObject(this.Trades, k, v) -> native map store. `Trades` is a
//    hand-written `map[string]any` field of BaseExchange (go/v4/exchange.go) whose only
//    whole-field writes are fresh `map[string]any{}` literals, so the receiver is never the
//    typed-nil map the helper treats as absent: the helper's map branch is `m[key] =
//    derefScalar(value)` with a nil key skipped. (Orderbooks is the same shape, but G02 owns
//    those stores and turns them into WsCacheSet, so folding them only adds a second guard.) The key is a `*string` local the function never
//    rebinds, so the store goes under `if k != nil {`; the value is an `any` local whose every
//    write is a cache/order-book constructor (or a read back from the same field), and
//    derefScalar leaves those pointer types untouched.

// fields the base exchange struct declares `map[string]any` and never assigns anything but a
// fresh map literal (go/v4/exchange.go: setDefaults only)
const GP28_MAP_FIELDS: string[] = [ 'Trades' ];

// constructors whose Go return is a pointer outside derefScalar's switch (exchange_helpers.go)
const GP28_POINTER_CTOR = /^(?:ccxt\.)?(?:NewArrayCache(?:ByTimestamp|BySymbolById|BySymbolBySide)?|NewOrderBook|IndexedOrderBook|OrderBook)\s*\(/;

// blank the string/rune literals and the comments, keeping offsets and newlines
function gp28Mask (content: string): string {
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

// the locals of one function: exactly one declaration of `name` and its Go type, or undefined
function gp28SingleDecl (funcText: string, name: string): { type: string, init: string, param: boolean } | undefined {
    const n = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    const decls: { type: string, init: string, param: boolean }[] = [];
    let count = 0;
    for (const m of funcText.matchAll (new RegExp ('^[ \\t]*var\\s+' + n + '\\s+([^\\s=]+)\\s*(?:=\\s*(.*))?$', 'gm'))) {
        count += 1;
        decls.push ({ 'type': m[1].trim (), 'init': (m[2] ?? '').trim (), 'param': false });
    }
    for (const m of funcText.matchAll (new RegExp ('\\b' + n + '\\s*:=(?!=)\\s*(.*)$', 'gm'))) {
        count += 1;
        decls.push ({ 'type': ':=', 'init': m[1].trim (), 'param': false });
    }
    if (new RegExp ('\\bfor\\b[^\\n{]*\\b' + n + '\\b[^\\n{]*:=\\s*range\\b').test (funcText)) {
        count += 1;
    }
    const signature = funcText.split ('\n')[0];
    const param = new RegExp ('[(,]\\s*' + n + '\\s+([^,()]+?)\\s*[,)]').exec (signature);
    if (param !== null) {
        count += 1;
        decls.push ({ 'type': param[1].trim (), 'init': '', 'param': true });
    }
    return (count === 1) ? decls[0] : undefined;
}

// the right-hand sides of every plain assignment to `name` inside the function body
function gp28Writes (funcText: string, name: string): string[] {
    const n = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
    const out: string[] = [];
    for (const m of funcText.matchAll (new RegExp ('^[ \\t]*' + n + '\\s*=(?!=)\\s*(.*)$', 'gm'))) {
        out.push (m[1].trim ());
    }
    return out;
}

// `any` local a cache/order-book constructor (or a read back from the same field) fills
function gp28ValueOk (funcText: string, field: string, name: string): boolean {
    const decl = gp28SingleDecl (funcText, name);
    if ((decl === undefined) || decl.param) {
        return false; // a parameter is a box on every path: only a written local proves the value
    }
    if (!((decl.type === 'any') || (decl.type === ':='))) {
        return false;
    }
    const fromField = new RegExp ('^(?:ccxt\\.)?(?:this\\.SafeValue|this\\.SafeMapTyped|GetValue|SafeValue|MapTyped)\\(this\\.' + field + ', \\w+\\)$');
    const init = decl.init;
    if (!((init === '') || (init === 'nil') || GP28_POINTER_CTOR.test (init) || fromField.test (init))) {
        return false;
    }
    const backRef = new RegExp ('^this\\.' + field + '\\[\\*?\\w+\\]$');
    return gp28Writes (funcText, name).every ((rhs) => GP28_POINTER_CTOR.test (rhs) || backRef.test (rhs) || (rhs === 'nil'));
}

// `*string`/`string` key local the function never rebinds
function gp28KeyType (funcText: string, name: string): string | undefined {
    const decl = gp28SingleDecl (funcText, name);
    if ((decl === undefined) || (decl.type === ':=') || (gp28Writes (funcText, name).length > 0)) {
        return undefined;
    }
    return ((decl.type === 'string') || (decl.type === '*string')) ? decl.type : undefined;
}

// index of the paren closing the one opened at `open` in masked text (-1 when unbalanced)
function gp28CloseParen (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(') {
            depth += 1;
        } else if (c === ')') {
            depth -= 1;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

// index of the bracket closing the one that opens first in `text`, -1 when unbalanced
function gp28CloseBrace (text: string): number {
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if ('([{'.indexOf (c) >= 0) {
            depth += 1;
        } else if (')]}'.indexOf (c) >= 0) {
            depth -= 1;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

// the nearest enclosing `if` header dereferences the key: that block only runs on a non-nil
// key, so the store needs no guard (and the pass that owns the InOp block already writes it bare)
function gp28HeaderProvesKey (masked: string[], k: number, key: string): boolean {
    const indent = masked[k].length - masked[k].trimStart ().length;
    for (let j = k - 1; j >= 0; j--) {
        const line = masked[j];
        if (line.trim () === '') {
            continue;
        }
        if ((line.length - line.trimStart ().length) >= indent) {
            continue;
        }
        return /^if\b.*\{$/.test (line.trim ()) && (new RegExp ('\\*' + key + '\\b').test (line));
    }
    return false;
}

function gp28FieldFunc (lines: string[], masked: string[], start: number, end: number) {
    const funcText = masked.slice (start, end + 1).join ('\n');
    for (let k = start + 1; k < end; k++) {
        const head = /^([ \t]*)(?:(ccxt)\.)?AddElementToObject\(this\.(\w+), /.exec (masked[k]);
        if (head === null) {
            continue;
        }
        const field = head[3];
        if (GP28_MAP_FIELDS.indexOf (field) < 0) {
            continue;
        }
        const open = head[0].indexOf ('(');
        const close = gp28CloseParen (masked[k], open);
        if ((close < 0) || (masked[k].substring (close + 1).trim () !== '')) {
            continue; // one-line statement only
        }
        const argsMasked = masked[k].substring (head[0].length, close);
        const argsText = lines[k].substring (head[0].length, close);
        let depth = 0;
        let comma = -1;
        for (let i = 0; i < argsMasked.length; i++) {
            const c = argsMasked[i];
            depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
            if ((depth === 0) && (c === ',')) {
                comma = i;
                break;
            }
        }
        if ((comma < 0) || (argsMasked[comma + 1] !== ' ')) {
            continue;
        }
        const key = argsText.substring (0, comma);
        const value = argsText.substring (comma + 2);
        if (!/^\w+$/.test (key)) {
            continue;
        }
        const keyType = gp28KeyType (funcText, key);
        if (keyType === undefined) {
            continue;
        }
        const valueOk = /^\w+$/.test (value) ? gp28ValueOk (funcText, field, value) : GP28_POINTER_CTOR.test (value);
        if (!valueOk) {
            continue;
        }
        const target = 'this.' + field;
        const index = ((keyType === '*string') ? '*' : '') + key;
        if ((keyType === 'string') || gp28HeaderProvesKey (masked, k, key)) {
            lines[k] = head[1] + target + '[' + index + '] = ' + value;
        } else {
            lines[k] = head[1] + 'if ' + key + ' != nil {\n' + head[1] + '\t' + target + '[' + index + '] = ' + value + '\n' + head[1] + '}';
        }
        masked[k] = gp28Mask (lines[k]);
    }
}

function gp28EachFunc (content: string, visit: (lines: string[], masked: string[], start: number, end: number) => void) {
    const lines = content.split ('\n');
    const masked = gp28Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            visit (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

export function gp28Stores (content: string): string {
    if (!/AddElementToObject\(this\.(?:Trades), /.test (content)) {
        return content;
    }
    return gp28EachFunc (content, gp28FieldFunc) ?? content;
}

// wiring check: the pass must run inside formatGoSource, not only on its own
export function hx10w10Gp28Wired (formatGoSource: (path: string, content: string) => string): string[] {
    const src = 'package ccxt\n\nfunc (this *X) f(symbol *string) {\n' +
        '\tvar stored any = this.SafeValue(this.Trades, symbol)\n' +
        '\tif stored == nil {\n' +
        '\t\tstored = ccxt.NewArrayCache(1)\n' +
        '\t}\n' +
        '\tccxt.AddElementToObject(this.Trades, symbol, stored)\n' +
        '\treturn\n' +
        '}\n';
    const out = formatGoSource ('selftest.go', src);
    const folded = out.indexOf ('if symbol != nil {') >= 0 && out.indexOf ('this.Trades[*symbol] = stored') >= 0;
    return folded ? [] : [ 'hx10w10 GP28: not wired into formatGoSource: ' + out ];
}

// self-test: the field rule has to fire with the gofmt-expanded guard the printer emits elsewhere
export function hx10w10Gp28Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10w10 GP28: ' + message); } };
    const body = 'package ccxt\n\n' +
        'func (this *X) handleTrade(message any) {\n' +
        '\tvar symbol *string = this.SafeString(message, "symbol")\n' +
        '\tvar stored any = this.SafeValue(this.Trades, symbol)\n' +
        '\tif stored == nil {\n' +
        '\t\tstored = ccxt.NewArrayCache(1000)\n' +
        '\t\tccxt.AddElementToObject(this.Trades, symbol, stored)\n' +
        '\t}\n' +
        '\treturn\n' +
        '}\n';
    const out = gp28Stores (body);
    ok (out.indexOf ('if symbol != nil {\n\t\t\tthis.Trades[*symbol] = stored\n\t\t}') >= 0, 'trades store is not guarded-native: ' + out);
    const inBlock = 'package ccxt\n\nfunc (this *X) f(symbol *string) {\n' +
        '\tif _, ok := this.Trades[*symbol]; !ok {\n' +
        '\t\tccxt.AddElementToObject(this.Trades, symbol, ccxt.NewArrayCache(1))\n' +
        '\t}\n' +
        '\treturn\n' +
        '}\n';
    ok (gp28Stores (inBlock).indexOf ('\t\tthis.Trades[*symbol] = ccxt.NewArrayCache(1)\n') >= 0, 'InOp header already derefs the key: ' + gp28Stores (inBlock));
    ok (gp28Stores (out) === out, 'not idempotent');
    return problems;
}
