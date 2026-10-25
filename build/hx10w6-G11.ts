// hx10w6-G11: MapTyped(v any) map[string]any only narrows the `any` box to the dictionary it
// already holds. When the operand is a map[string]any BY DECLARATION the call is the identity and
// is removed; a boxed operand (a []any element, an `any` field or param, an `any` returning callee)
// keeps its wrap, since dropping it there would need a `.(map[string]any)` on a box.
//
// Two operand shapes prove the declaration:
//   1. a whole call whose emitted Go signature returns map[string]any — the struct->map converters
//      of go/v4/exchange_struct_returns.go, this.Market / this.Currency (map[string]any on the base
//      and on every venue override), or a method the same file declares with that return type;
//   2. a local the same function declares exactly once as `var x map[string]any = …`.

// go/v4/exchange_struct_returns.go: each builds the map from a parsed struct, never a box.
const HX10W6G11_MAP_CONVERTERS = new Set ([
    'TickerToMap', 'TradeToMap', 'OrderToMap', 'PositionToMap', 'LedgerEntryToMap', 'FundingRateToMap', 'AccountToMap',
]);

// `this.Market` / `this.Currency`: exchange_generated.go declares `map[string]any`, and the venue
// overrides (binance, hyperliquid) keep the same return type.
const HX10W6G11_MAP_METHODS = new Set ([ 'Market', 'Currency' ]);

// blank string/rune literals and comments, keeping offsets and newlines
function hx10w6G11Mask (content: string): string {
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

// index of the paren closing the one opened at `open` in masked text (-1 when unbalanced)
function hx10w6G11Close (masked: string, open: number): number {
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

// methods this file declares itself with a map[string]any return: `func (this *X) Name(..) map[string]any {`
function hx10w6G11FileMapMethods (masked: string): Set<string> {
    const names = new Set<string> ();
    const head = /^func \(this \*[A-Za-z_]\w*\) ([A-Za-z_]\w*)\(/gm;
    for (let m = head.exec (masked); m !== null; m = head.exec (masked)) {
        const open = m.index + m[0].length - 1;
        const close = hx10w6G11Close (masked, open);
        if (close < 0) {
            continue;
        }
        if (/^ map\[string\]any \{/.test (masked.slice (close + 1))) {
            names.add (m[1]);
        }
    }
    return names;
}

function hx10w6G11CalleeIsMap (callee: string, fileMapMethods: Set<string>): boolean {
    const name = callee.replace (/^ccxt\./, '');
    if (name.startsWith ('this.')) {
        const method = name.slice ('this.'.length);
        return HX10W6G11_MAP_METHODS.has (method) || fileMapMethods.has (method);
    }
    if (name.indexOf ('.') >= 0) {
        return false; // a method on another receiver: that signature is not in this text
    }
    return HX10W6G11_MAP_CONVERTERS.has (name);
}

// the identifiers a function block declares exactly once, as `var x map[string]any =`
function hx10w6G11BlockMapLocals (block: string): Set<string> {
    const types = new Map<string, string[]> ();
    const note = (name: string, goType: string | undefined) => {
        const seen = types.get (name) ?? [];
        seen.push (goType ?? '?');
        types.set (name, seen);
    };
    const typed = /^[ \t]*var ([A-Za-z_]\w*) map\[string\]any\b/gm;
    for (let m = typed.exec (block); m !== null; m = typed.exec (block)) {
        note (m[1], 'map[string]any');
    }
    const other = /^[ \t]*var ([A-Za-z_]\w*) (?!map\[string\]any\b)[^\n=]*=/gm;
    for (let m = other.exec (block); m !== null; m = other.exec (block)) {
        note (m[1], 'other');
    }
    const short = /^[ \t]*([A-Za-z_]\w*(?:, [A-Za-z_]\w*)*) := /gm;
    for (let m = short.exec (block); m !== null; m = short.exec (block)) {
        for (const name of m[1].split (', ')) {
            note (name, 'short');
        }
    }
    const single = new Set<string> ();
    for (const [ name, list ] of types) {
        if ((list.length === 1) && (list[0] === 'map[string]any')) {
            single.add (name);
        }
    }
    return single;
}

// replace every `MapTyped(<operand>)` whose operand is already a map[string]any
function hx10w6G11DropWraps (content: string, mapLocals: Set<string>, fileMapMethods: Set<string>): string {
    const masked = hx10w6G11Mask (content);
    const wrapper = /(?<![\w.])(?:ccxt\.)?MapTyped\(/g;
    let out = '';
    let cursor = 0;
    for (let m = wrapper.exec (masked); m !== null; m = wrapper.exec (masked)) {
        if (m.index < cursor) {
            continue;
        }
        const open = m.index + m[0].length - 1;
        const end = hx10w6G11Close (masked, open);
        if (end < 0) {
            continue;
        }
        let first = open + 1;
        while ((first < end) && /\s/.test (masked[first])) {
            first += 1;
        }
        let last = end - 1;
        while ((last >= first) && /\s/.test (masked[last])) {
            last -= 1;
        }
        if (first > last) {
            continue;
        }
        const operand = masked.slice (first, last + 1);
        const call = /^([A-Za-z_][\w.]*)\(/.exec (operand);
        const ident = /^([A-Za-z_]\w*)$/.exec (operand);
        let proven = false;
        if ((call !== null) && (hx10w6G11Close (masked, first + operand.indexOf ('(')) === last)) {
            proven = hx10w6G11CalleeIsMap (call[1], fileMapMethods);
        } else if (ident !== null) {
            proven = mapLocals.has (ident[1]);
        }
        if (!proven) {
            continue;
        }
        out += content.slice (cursor, m.index) + content.slice (first, last + 1);
        cursor = end + 1;
        wrapper.lastIndex = cursor;
    }
    return out + content.slice (cursor);
}

export function hx10w6G11Pass (content: string): string {
    if ((typeof content !== 'string') || (content.indexOf ('MapTyped(') < 0)) {
        return content;
    }
    // every function block sees only its own declarations: a name is a map here and a box there
    let result = content;
    for (let round = 0; (round < 4) && (result.indexOf ('MapTyped(') >= 0); round++) {
        const masked = hx10w6G11Mask (result);
        const fileMapMethods = hx10w6G11FileMapMethods (masked);
        const starts = [ 0 ];
        const head = /^func /gm;
        for (let m = head.exec (masked); m !== null; m = head.exec (masked)) {
            if (m.index > 0) {
                starts.push (m.index);
            }
        }
        let next = '';
        for (let index = 0; index < starts.length; index++) {
            const from = starts[index];
            const to = (index + 1 < starts.length) ? starts[index + 1] : result.length;
            const block = result.slice (from, to);
            if (block.indexOf ('MapTyped(') < 0) {
                next += block;
                continue;
            }
            const mapLocals = hx10w6G11BlockMapLocals (hx10w6G11Mask (block));
            next += hx10w6G11DropWraps (block, mapLocals, fileMapMethods);
        }
        if (next === result) {
            break;
        }
        result = next;
    }
    return result;
}

export function hx10w6G11Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('w6-G11: ' + message); } };
    const run = (text: string) => hx10w6G11Pass (text);
    const fn = (body: string, ret = 'any') => '\nfunc (this *X) f(p any) ' + ret + ' {\n' + body + '}\n';
    // a struct->map converter already returns the map, and the wrap's own paren goes with it
    ok (run (fn ('\tvar p map[string]any = MapTyped(PositionToMap(this.ParsePosition(p)))\n')) === fn ('\tvar p map[string]any = PositionToMap(this.ParsePosition(p))\n'), 'converter wrap dropped');
    ok (run (fn ('\tvar f map[string]any = ccxt.MapTyped(ccxt.FundingRateToMap(this.ParseFundingRate(p)))\n')).includes ('= ccxt.FundingRateToMap('), 'ccxt-qualified converter dropped');
    ok (run (fn ('\tvar m map[string]any = MapTyped(this.Market(p))\n')).includes ('var m map[string]any = this.Market(p)'), 'market row dropped');
    ok (run (fn ('\tvar c map[string]any = MapTyped(this.Currency(p))\n')).includes ('var c map[string]any = this.Currency(p)'), 'currency row dropped');
    // an `any` returning callee keeps its wrap: the box needs the conversion
    ok (run (fn ('\tvar b map[string]any = MapTyped(this.SafeBalance(p))\n')).includes ('MapTyped(this.SafeBalance(p))'), 'any callee keeps wrap');
    ok (run (fn ('\tvar s map[string]any = MapTyped(this.SafeDict(p, "k"))\n')).includes ('MapTyped(this.SafeDict(p, "k"))'), 'SafeDict keeps wrap');
    // a boxed operand keeps its wrap
    ok (run (fn ('\tvar q map[string]any = MapTyped(h[1])\n')).includes ('MapTyped(h[1])'), '[]any element keeps wrap');
    ok (run (fn ('\tvar r map[string]any = MapTyped(r1.Raw)\n')).includes ('MapTyped(r1.Raw)'), 'any field keeps wrap');
    // a local declared map[string]any in the same function
    ok (run (fn ('\tvar bag map[string]any = nil\n\tvar b map[string]any = MapTyped(bag)\n')).includes ('var b map[string]any = bag'), 'declared map local dropped');
    ok (run (fn ('\tvar bag any = nil\n\tvar b map[string]any = MapTyped(bag)\n')).includes ('MapTyped(bag)'), 'any local keeps wrap');
    // the same name is a map in one function and a box in another
    ok (run (fn ('\tvar bag map[string]any = nil\n\tvar b map[string]any = MapTyped(bag)\n') + fn ('\tvar bag any = nil\n\tvar b map[string]any = MapTyped(bag)\n')).includes ('var b map[string]any = bag'), 'first block still typed');
    // a method the file declares itself
    const own = '\nfunc (this *X) FetchRows(p any) map[string]any {\n\treturn nil\n}\n' + fn ('\tvar r map[string]any = MapTyped(this.FetchRows(p))\n');
    ok (run (own).includes ('var r map[string]any = this.FetchRows(p)'), 'file-declared map method dropped');
    const ownAny = '\nfunc (this *X) FetchRows(p any) any {\n\treturn nil\n}\n' + fn ('\tvar r map[string]any = MapTyped(this.FetchRows(p))\n');
    ok (run (ownAny).includes ('MapTyped(this.FetchRows(p))'), 'file-declared any method keeps wrap');
    // a call plus more text is not a whole call
    ok (run (fn ('\tvar v map[string]any = MapTyped(this.Market(p)["info"])\n')).includes ('MapTyped(this.Market(p)["info"])'), 'member read of a row keeps wrap');
    // comments and string literals are never rewritten
    ok (run (fn ('\t// MapTyped(PositionToMap(x)) is the identity\n\t_ = p\n')).indexOf ('// MapTyped(PositionToMap(x)) is the identity') >= 0, 'comment untouched');
    ok (run (fn ('\t_ = "MapTyped(PositionToMap(y))"\n')).indexOf ('"MapTyped(PositionToMap(y))"') >= 0, 'literal untouched');
    // an already-clean text is returned unchanged
    const clean = fn ('\tvar p map[string]any = PositionToMap(this.ParsePosition(p))\n');
    ok (run (clean) === clean, 'no wrap means no change');
    return problems;
}
