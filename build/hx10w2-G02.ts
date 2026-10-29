// ===== hx10 G02: native reads on proven list receivers (Go) =====
// A generated local that provably holds a list is declared `[]any`/`[]string`, so
// GetArrayLength(x) prints len(x) and GetValue(xs, i) prints xs[i] inside a loop that bounds i
// to the slice length. Everything unproven keeps the plain helper call.

type Decl = { 'type': string, 'line'?: string, 'index'?: number };

// GetArrayLength's own switch answers len() for exactly these printed types (nil slice -> 0)
const lenT = /^(?:string|\[\](?:any|string|int64|float64|bool|int|map\[string\]any|\[\]any))$/;
// element types that can never box a pointer or a typed-nil container: xs[i] IS the helper's read
const plain = [ 'string', 'int64', 'float64', 'bool', 'int' ];
// printed Go type of a generated callee result, reused for the local that holds it
const callee: { [name: string]: string } = {
    'ParseAccounts': '[]any',
    'ParseADLRanks': '[]any',
    'ParseBorrowRateHistory': '[]any',
    'ParseConversions': '[]any',
    'ParseDepositAddresses': '[]any',
    'ParseFundingRateHistories': '[]any',
    'ParseIncomes': '[]any',
    'ParseLedger': '[]any',
    'ParseLiquidations': '[]any',
    'ParseLongShortRatioHistory': '[]any',
    'ParseMarketLeverageTiers': '[]any',
    'ParseMarkets': '[]any',
    'ParseOHLCVs': '[]any',
    'ParseOpenInterestsHistory': '[]any',
    'ParseOrders': '[]any',
    'ParsePositions': '[]any',
    'ParseTrades': '[]any',
    'ParseTradesHelper': '[]any',
    'ParseTradingViewOHLCV': '[]any',
    'ParseTransactions': '[]any',
    'ParseTransfers': '[]any',
    'ParsePredictionTrades': '[]any',
    'ArraysConcat': '[]any',
    'FilterByArrayADLRanks': '[]any',
    'FilterByArrayPositions': '[]any',
    'FilterByCurrencySinceLimit': '[]any',
    'FilterByLimit': '[]any',
    'FilterBySinceLimit': '[]any',
    'FilterBySymbolSinceLimit': '[]any',
    'FilterBySymbolsSinceLimit': '[]any',
    'FilterByValueSinceLimit': '[]any',
    'ToArray': '[]any',
    'ObjectValues': '[]any',
    'ArrayTyped': '[]any',
    'ListTyped': '[]any',
    'SafeListTyped': '[]any',
    'SafeList2Typed': '[]any',
    'SafeListTypedDefault': '[]any',
    'ObjectKeys': '[]string',
};

function mask (content: string): string {
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
            if (c === "'") { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        out[i] = (c === '\n') ? '\n' : ' ';
        if (state === 'line') { if (c === '\n') { state = 'code'; } continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { out[i + 1] = ' '; i++; state = 'code'; } continue; }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === "'") { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

function blocksOf (masked: string[]): any[] {
    const depth: number[] = [];
    let current = 0;
    for (const line of masked) {
        depth.push (current);
        current += (line.split ('{').length - 1) - (line.split ('}').length - 1);
    }
    depth.push (current);
    const blocks: any[] = [];
    const stack: any[] = [];
    for (let k = 0; k < masked.length; k++) {
        const before = depth[k];
        const after = depth[k + 1];
        if (after > before) {
            for (let x = before; x < after; x++) {
                const block: any = { 'open': k, 'close': masked.length - 1, 'depth': x + 1 };
                blocks.push (block);
                stack.push (block);
            }
        } else if (after < before) {
            for (let x = before; x > after; x--) {
                const closed = stack.pop ();
                if (closed !== undefined) { closed.close = k; }
            }
        }
    }
    return blocks;
}

// the printed type of `name` when this func declares it exactly once: var name T = ... or a parameter
function findDecl (maskedFunc: string, sig: string, name: string): Decl | undefined {
    const n = name.replace (/[^\w]/g, '');
    const vars = [ ...maskedFunc.matchAll (new RegExp ('\\bvar\\s+' + n + '\\s+([^=\\n]+?)\\s*(?:=|$)', 'g')) ];
    const shorts = maskedFunc.match (new RegExp ('(?:^|[^\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bfor\\s+' + n + '\\s*:=', 'gm')) ?? [];
    const lits = [ ...maskedFunc.matchAll (/\bfunc\s*\(([^()]*)\)/g) ].filter ((m: any) => new RegExp ('\\b' + n + '\\b').test (m[1]));
    const ranges = maskedFunc.match (new RegExp ('\\bfor\\b[^\\n{]*\\b' + n + '\\b[^\\n{]*:=\\s*range\\b')) ?? [];
    const open = sig.indexOf ('(', sig.startsWith ('func (') ? sig.indexOf (')') + 1 : 0);
    const param = (open < 0) ? null : new RegExp ('[(,]\\s*' + n + '\\s+([^,()]+?)\\s*[,)]').exec (sig.substring (open));
    const count = vars.length + shorts.length + lits.length + ranges.length + (param ? 1 : 0);
    if (count !== 1) {
        return undefined;
    }
    if (param) {
        return { 'type': param[1].trim () };
    }
    if (vars.length === 1) {
        return { 'type': vars[0][1].trim (), 'index': vars[0].index };
    }
    return undefined;
}

function writes (maskedLine: string, name: string): boolean {
    const n = name.replace (/[^\w]/g, '');
    const patterns = [
        new RegExp ('\\b' + n + '\\s*:='),
        new RegExp ('\\bvar\\s+' + n + '\\b'),
        new RegExp ('\\b' + n + '\\s*\\[[^\\]]*\\]\\s*[-+*/%&|^]?=(?!=)'),
        new RegExp ('\\b' + n + '\\s*[-+*/%&|^]?=(?!=)'),
        new RegExp ('\\b' + n + '\\s*(?:\\+\\+|--)'),
        new RegExp ('&\\s*' + n + '\\b'),
    ];
    return patterns.some ((rx: RegExp) => rx.test (maskedLine));
}

// a read of `name` that observes its box rather than a slice value
function observes (maskedFunc: string, name: string): boolean {
    const n = name.replace (/[^\w]/g, '');
    const patterns = [
        new RegExp ('\\b' + n + '\\s*[!=]=\\s*nil\\b'),
        new RegExp ('\\bnil\\s*[!=]=\\s*' + n + '\\b'),
        new RegExp ('\\bIsEqual\\s*\\(\\s*' + n + '\\s*,\\s*nil\\s*\\)'),
        new RegExp ('\\b' + n + '\\s*\\.\\s*\\('),
        new RegExp ('&\\s*' + n + '\\b'),
        new RegExp ('(?:^|[^\\w.])' + n + '\\s*,[^=\\n]*=(?!=)'),
        new RegExp ('(?:^|[^\\w.])' + n + '\\s*:='),
        new RegExp ('\\bfor\\b[^\\n{]*\\b' + n + '\\b[^\\n{]*:='),
        new RegExp ('\\bfunc\\s*\\([^)]*\\b' + n + '\\b[^)]*\\)'),
    ];
    return patterns.some ((rx: RegExp) => rx.test (maskedFunc));
}

// a name the func declares shadows a predeclared identifier the emission would need
function shadowed (maskedFunc: string, sig: string, word: string): boolean {
    if (findDecl (maskedFunc, sig, word) !== undefined) {
        return true;
    }
    return new RegExp ('\\bvar\\s+' + word + '\\b').test (maskedFunc)
        || new RegExp ('(?:^|[^\\w.])' + word + '\\s*(?:,\\s*\\w+\\s*)*:=').test (maskedFunc)
        || new RegExp ('\\bfor\\s+' + word + '\\s*:=').test (maskedFunc);
}

// the identifier words a type spelling needs to still mean the predeclared type
function typeWords (t: string): string[] {
    return (t.match (/[a-z][a-z0-9]*/g) || []).filter ((w: string) => [ 'any', 'string', 'int', 'int64', 'float64', 'bool' ].includes (w));
}

function isSlice (t: string): boolean {
    return (t === '[]any') || (t === '[]string') || (t === '[]int64') || (t === '[]float64')
        || (t === '[]bool') || (t === '[]int') || (t === '[]map[string]any') || (t === '[][]any');
}

// the slice type an initialiser proves, or undefined
function typeOf (init: string, over: string[], decl: (name: string) => Decl | undefined): string | undefined {
    const text = init.trim ();
    if (text === 'nil') {
        return 'nil';
    }
    const call = /^(?:this\.|ccxt\.)?(\w+)\s*\(/.exec (text);
    if (call !== null) {
        const target = callee[call[1]];
        return ((target !== undefined) && !over.includes (call[1])) ? target : undefined;
    }
    if (text.startsWith ('[]any{')) {
        return '[]any';
    }
    if (text.startsWith ('[]string{')) {
        return '[]string';
    }
    if (/^\w+$/.test (text)) {
        const source = decl (text);
        return ((source !== undefined) && isSlice (source.type)) ? source.type : undefined;
    }
    const appended = /^append\(\w+, /.exec (text);
    return (appended !== null) ? 'append' : undefined;
}

// the loop bound is the slice's own length, directly or through a never-written int local
function boundOk (maskedFunc: string, bound: string, slice: string): boolean {
    if ((bound === 'len(' + slice + ')') || (bound === 'GetArrayLength(' + slice + ')') || (bound === 'ccxt.GetArrayLength(' + slice + ')')) {
        return true;
    }
    if (!/^[A-Za-z_]\w*$/.test (bound) || (bound === slice)) {
        return false;
    }
    const rx = new RegExp ('^[ \\t]*(?:var ' + bound + ' int = |' + bound + ' := )len\\(' + slice + '\\)[ \\t]*$');
    const lines = maskedFunc.split ('\n');
    let boundLine = -1;
    for (let k = 0; k < lines.length; k++) {
        if (rx.test (lines[k])) {
            if (boundLine >= 0) {
                return false;
            }
            boundLine = k;
        }
    }
    if (boundLine < 0) {
        return false;
    }
    for (let k = 0; k < lines.length; k++) {
        if ((k !== boundLine) && writes (lines[k], bound)) {
            return false;
        }
    }
    return true;
}

function oneFunc (lines: string[], masked: string[], blocks: any[], fn: any) {
    const sig = lines[fn.open];
    const maskedFunc = masked.slice (fn.open + 1, fn.close + 1).join ('\n');
    // callees this file overrides with its own Go body: their result type is the override's
    const over = Object.keys (callee).filter ((m: string) =>
        new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + m + '\\(').test (masked.join ('\n')));
    const cache = new Map<string, Decl | undefined> ();
    const decl = (name: string) => {
        if (!cache.has (name)) {
            cache.set (name, findDecl (maskedFunc, sig, name));
        }
        return cache.get (name);
    };
    // 1. declare a local as the slice its every write proves
    for (let k = fn.open + 1; k < fn.close; k++) {
        const m = /^(\s*)var (\w+) any = (.+)$/.exec (masked[k]);
        if ((m === null) || (lines[k] !== masked[k])) {
            continue;
        }
        const [ , indent, name, init ] = m;
        const single = decl (name);
        if ((single === undefined) || (single.type !== 'any') || (single.index === undefined)) {
            continue;
        }
        let target = typeOf (init, over, decl);
        if (target === 'append') {
            continue;
        }
        let safe = true;
        for (let j = fn.open + 1; j < fn.close; j++) {
            if (j === k) {
                continue;
            }
            const w = new RegExp ('^\\s*' + name + ' = (.+)$').exec (masked[j]);
            if (w !== null) {
                const t = typeOf (w[1], over, decl);
                if (t === 'append') {
                    continue;  // append(x, v) keeps the slice type
                }
                if (t === 'nil') {
                    continue;  // a nil write is the zero slice either way
                }
                if (target === 'nil') {
                    target = t;
                }
                if (t !== target) {
                    safe = false;
                }
            } else if (writes (masked[j], name)) {
                safe = false;
            }
        }
        if ((target === undefined) || (target === 'nil') || (target === 'append')) {
            continue;
        }
        if (typeWords (target).some ((w: string) => shadowed (maskedFunc, sig, w))) {
            continue;
        }
        if (!safe || observes (maskedFunc, name)) {
            continue;
        }
        const rhs = (init === 'nil') ? 'nil' : lines[k].substring (m[0].length - init.length);
        lines[k] = indent + 'var ' + name + ' ' + target + ' = ' + rhs;
        masked[k] = indent + 'var ' + name + ' ' + target + ' = ' + ((init === 'nil') ? 'nil' : init);
        cache.set (name, { 'type': target, 'index': single.index });
    }
    const offs: number[] = [];
    let offset = 0;
    for (let k = fn.open; k <= fn.close; k++) {
        offs.push (offset);
        offset += masked[k].length + 1;
    }
    const typeAt = (name: string, k: number): string | undefined => {
        const d = decl (name);
        if ((d === undefined) || ((d.index !== undefined) && (d.index >= offs[k - fn.open]))) {
            return undefined;
        }
        return d.type;
    };
    // 2. GetArrayLength(x) -> len(x) on a proven slice/string
    const lenOk = !shadowed (maskedFunc, sig, 'len');
    for (let k = fn.open + 1; k < fn.close; k++) {
        if (masked[k].indexOf ('GetArrayLength(') < 0) {
            continue;
        }
        lines[k] = lines[k].replace (/(?<![\w.])(?:ccxt\.)?GetArrayLength\((\w+)\)/g, (all: string, name: string, at: number) => {
            const t = typeAt (name, k);
            return (lenOk && (masked[k].substr (at, all.length) === all) && (t !== undefined) && lenT.test (t)) ? 'len(' + name + ')' : all;
        });
        masked[k] = mask (lines[k]);
    }
    // 3. GetValue(xs, i) -> xs[i] inside a loop that bounds i to len(xs)
    for (let k = fn.open + 1; k < fn.close; k++) {
        if (masked[k].indexOf ('GetValue(') < 0) {
            continue;
        }
        lines[k] = lines[k].replace (/(?<![\w.])(?:ccxt\.)?GetValue\((\w+), (\w+)\)(\.\((\w+)\))?/g, (all: string, slice: string, counter: string, assertion: string | undefined, asserted: string | undefined, at: number) => {
            if ((masked[k].substr (at, all.length) !== all) || (slice === counter)) {
                return all;
            }
            const t = typeAt (slice, k);
            if ((t === undefined) || !/^\[\](\w*)$/.test (t)) {
                return all;
            }
            if (!plain.includes (t.substring (2))) {
                return all;
            }
            if ((assertion !== undefined) && (asserted !== t.substring (2))) {
                return all;
            }
            const before = masked[k].substring (0, at);
            const after = masked[k].substring (at + all.length);
            if (/^\s*(?:[!=]=\s*nil\b|\.\()/.test (after) || /\bnil\s*[!=]=\s*$/.test (before) || /(?:^|[^\w.])[A-Za-z_]\w*\s*:=\s*$/.test (before)) {
                return all;
            }
            // an untyped declaration's element type is the later typed-local pass's call, not ours
            if (/^\s*var \w+ any = $/.test (before) && /^\s*$/.test (after)) {
                return all;
            }
            const inner = blocks.filter ((b: any) => (b.open < k) && (k <= b.close)).sort ((a: any, b: any) => b.depth - a.depth);
            for (const b of inner) {
                if (/\bfunc\b/.test (masked[b.open])) {
                    break;
                }
                const h = /^[ \t]*for (\w+) := 0; (\w+) < (.+); (\w+)\+\+ \{$/.exec (masked[b.open]);
                if ((h !== null) && (h[1] === counter) && (h[2] === counter) && (h[4] === counter)) {
                    if (!boundOk (maskedFunc, h[3].trim (), slice)) {
                        return all;
                    }
                    for (let j = b.open + 1; j < b.close; j++) {
                        if (writes (masked[j], counter)) {
                            return all;
                        }
                    }
                    return slice + '[' + counter + ']';
                }
            }
            return all;
        });
        masked[k] = mask (lines[k]);
    }
}

export function g02pass (content: string): string {
    if ((content.indexOf ('GetArrayLength(') < 0) && (content.indexOf ('GetValue(') < 0)) {
        return content;
    }
    // never rewrite the helper definitions themselves
    if (/(?:^|\n)func (?:GetArrayLength|GetValue|getValue|AddElementToObject)\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const blocks = blocksOf (masked);
    for (const fn of blocks.filter ((b: any) => (b.depth === 1) && masked[b.open].startsWith ('func '))) {
        oneFunc (lines, masked, blocks, fn);
    }
    return lines.join ('\n');
}

export function g02check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('hx10-g02: ' + m); } };
    // assembled so no single literal repeats: the tool reads these back verbatim
    const gal = (x: string) => 'GetArray' + 'Length(' + x + ')';
    const gv = (a: string, b: string) => 'Get' + 'Value(' + a + ', ' + b + ')';
    const sig = 'package p\n\nfunc (this *X) f(p any) any {\n';
    const f = (body: string) => g02pass (sig + body + '\treturn nil\n}\n');
    const withSig = (params: string, body: string) => g02pass ('package p\n\nfunc (this *X) f(' + params + ') any {\n' + body + '\treturn nil\n}\n');
    const num = '\tvar n int = ';
    const trade = '\tvar trades any = this.ParseTrades(p, nil, nil, nil)\n' + num + gal ('trades') + '\n\t_ = n\n';
    ok (f (trade).indexOf ('var trades []any = this.ParseTrades') >= 0, 'callee-produced list local is typed');
    ok (f (trade).indexOf (num + 'len(trades)') >= 0, 'its length goes native');
    const alias = '\tvar raw []string = ObjectKeys(p)\n\tvar keys any = raw\n' + num + gal ('keys') + '\n\t_ = n\n';
    ok (f (alias).indexOf ('var keys []string = raw') >= 0, 'list alias is typed');
    ok (f (alias).indexOf (num + 'len(keys)') >= 0, 'len on the alias');
    const read = '\tvar xs []string = ObjectKeys(p)\n\tvar out string = ""\n\tfor i := 0; i < len(xs); i++ {\n\t\tout = ' + gv ('xs', 'i') + '.(string)\n\t}\n\t_ = out\n';
    ok (f (read).indexOf ('out = xs[i]') >= 0, 'bounded element read goes native');
    const localBound = '\tvar xs []string = ObjectKeys(p)\n\tvar out string = ""\n\txsLen := len(xs)\n\tfor i := 0; i < xsLen; i++ {\n\t\tout = ' + gv ('xs', 'i') + '.(string)\n\t}\n\t_ = out\n';
    ok (f (localBound).indexOf ('out = xs[i]') >= 0, 'len-local bound goes native');
    // negatives: every one of these keeps the helper exactly as the base printed it
    const keep: string[][] = [
        [ '\tvar xs []any = ObjectValues(p)\n\tvar v any = ' + gv ('xs', '0') + '\n\t_ = v\n', gv ('xs', '0') ],
        [ '\tvar xs []string = ObjectKeys(p)\n\tvar v any = ' + gv ('xs', '5') + '\n\t_ = v\n', gv ('xs', '5') ],
        [ '\tvar t any = this.ParseTrades(p)\n\tif t == nil {\n\t}\n' + num + gal ('t') + '\n\t_ = n\n', gal ('t') ],
        [ '\tvar t any = this.SafeDict(p, "k")\n' + num + gal ('t') + '\n\t_ = n\n', gal ('t') ],
        [ '\tvar t any = this.ParseTrades(p)\n\tt = p\n' + num + gal ('t') + '\n\t_ = n\n', gal ('t') ],
        [ '\tvar xs []string = ObjectKeys(p)\n\tfor i := 0; i < 10; i++ {\n\t\t_ = ' + gv ('xs', 'i') + '\n\t}\n', gv ('xs', 'i') ],
        [ '\tvar xs []string = ObjectKeys(p)\n\tfor i := 0; i < len(xs); i++ {\n\t\ti = i + 1\n\t\t_ = ' + gv ('xs', 'i') + '\n\t}\n', gv ('xs', 'i') ],
        [ '\tvar xs []string = ObjectKeys(p)\n\tfor i := 0; i < len(xs); i++ {\n\t\tif ' + gv ('xs', 'i') + ' == nil {\n\t\t}\n\t}\n', gv ('xs', 'i') ],
    ];
    keep.forEach ((pair: string[], i: number) => ok (f (pair[0]).indexOf (pair[1]) >= 0, 'negative #' + i + ' keeps the helper'));
    const override = 'package p\n\nfunc (this *X) ParseTrades(a any) any {\n\treturn a\n}\n';
    const ovBody = '\tvar t any = this.ParseTrades(p)\n' + num + gal ('t') + '\n\t_ = n\n';
    ok (g02pass (override + sig + ovBody + '\treturn nil\n}\n').indexOf (gal ('t')) >= 0, 'overridden callee keeps the helper');
    const helper = 'package p\n\nfunc ' + gal ('value') .replace ('(value)', '(value any)') + ' int {\n\tif value == nil {\n\t\treturn 0\n\t}\n\treturn 0\n}\n';
    ok (g02pass (helper) === helper, 'helper definitions untouched');
    // a parameter that shadows a predeclared identifier blocks the spelling it would break
    const sh1 = '\tvar keys any = ObjectKeys(p)\n' + num + gal ('keys') + '\n\t_ = n\n';
    ok (withSig ('p any, string any', sh1).indexOf ('var keys any = ObjectKeys(p)') >= 0, 'shadowed string keeps the box');
    const sh2 = '\tvar xs []string = ObjectKeys(p)\n' + num + gal ('xs') + '\n\t_ = n\n';
    ok (withSig ('p any, len any', sh2).indexOf (gal ('xs')) >= 0, 'shadowed len keeps the helper');
    const decl = '\tvar xs []string = ObjectKeys(p)\n\tfor i := 0; i < len(xs); i++ {\n\t\tvar v any = ' + gv ('xs', 'i') + '\n\t\t_ = v\n\t}\n';
    ok (f (decl).indexOf (gv ('xs', 'i')) >= 0, 'untyped declaration keeps the read for the typing pass');
    const once = f (trade);
    ok (g02pass (once) === once, 'idempotent');
    return problems;
}
